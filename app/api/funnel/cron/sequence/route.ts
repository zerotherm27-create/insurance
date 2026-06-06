import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendSequenceEmail, sendFlowEmail } from '@/lib/email'
import { TERMINAL_STATUSES } from '@/lib/lead-status'
import type { FunnelAIReport } from '@/types/funnel'
import type { FlowDefinition, FlowNode, FlowEdge, ConditionNodeData, SendEmailNodeData, WaitNodeData } from '@/types/automation-flow'

// Legacy fallback: hardcoded sequence steps
const SEQUENCE_STEPS: Array<{
  fromStep: number
  toStep: number
  emailStep: 1 | 2 | 3 | 4
  minDays: number
}> = [
  { fromStep: 1, toStep: 2, emailStep: 1, minDays: 1 },
  { fromStep: 2, toStep: 3, emailStep: 2, minDays: 3 },
  { fromStep: 3, toStep: 4, emailStep: 3, minDays: 7 },
  { fromStep: 4, toStep: 5, emailStep: 4, minDays: 14 },
]

function findNextNode(edges: FlowEdge[], nodeId: string, handle?: 'yes' | 'no'): string | null {
  const edge = edges.find(
    (e) => e.source === nodeId && (handle === undefined || e.sourceHandle === handle)
  )
  return edge?.target ?? null
}

async function runLegacySequence(supabase: ReturnType<typeof createServiceClient>, now: Date) {
  const results: Record<string, number> = {}

  for (const { fromStep, toStep, emailStep, minDays } of SEQUENCE_STEPS) {
    const cutoff = new Date(now.getTime() - minDays * 24 * 60 * 60 * 1000)

    const { data: leads, error } = await supabase
      .from('funnel_leads')
      .select('id, first_name, email, ai_report')
      .eq('sequence_step', fromStep)
      .not('email', 'is', null)
      .lte('created_at', cutoff.toISOString())
      .not('status', 'in', `(${TERMINAL_STATUSES.join(',')})`)
      .limit(50)

    if (error) {
      console.error(`Cron step ${emailStep} query error:`, error.message)
      results[`step${emailStep}_error`] = 1
      continue
    }

    let sent = 0
    for (const lead of leads ?? []) {
      try {
        if (!lead.ai_report) continue
        await sendSequenceEmail({
          leadId: lead.id,
          step: emailStep,
          firstName: lead.first_name,
          email: lead.email as string,
          report: lead.ai_report as FunnelAIReport,
        })
        await supabase
          .from('funnel_leads')
          .update({ sequence_step: toStep, last_emailed_at: now.toISOString() })
          .eq('id', lead.id)
        sent++
      } catch (err) {
        console.error(`Failed step ${emailStep} for lead ${lead.id}:`, err)
      }
    }
    results[`step${emailStep}_sent`] = sent
  }

  return results
}

async function runFlowSequence(
  supabase: ReturnType<typeof createServiceClient>,
  flow: { id: string; flow_json: FlowDefinition },
  now: Date
) {
  const { nodes, edges } = flow.flow_json
  const nodeMap = new Map<string, FlowNode>(nodes.map((n) => [n.id, n]))

  const triggerNode = nodes.find((n) => n.type === 'trigger')
  if (!triggerNode) return { error: 'No trigger node in active flow' }

  // Load all eligible leads
  const { data: leads, error: leadsErr } = await supabase
    .from('funnel_leads')
    .select('id, first_name, email, protection_score, ai_report, status, last_emailed_at')
    .not('email', 'is', null)
    .not('status', 'in', `(${TERMINAL_STATUSES.join(',')})`)
    .limit(100)

  if (leadsErr) return { error: leadsErr.message }

  // Load existing flow states for these leads
  const leadIds = (leads ?? []).map((l: { id: string }) => l.id)
  const { data: states } = await supabase
    .from('lead_flow_state')
    .select('lead_id, current_node_id, entered_node_at')
    .in('lead_id', leadIds.length > 0 ? leadIds : ['__none__'])

  const stateMap = new Map<string, { current_node_id: string; entered_node_at: string }>(
    (states ?? []).map((s: { lead_id: string; current_node_id: string; entered_node_at: string }) => [
      s.lead_id,
      { current_node_id: s.current_node_id, entered_node_at: s.entered_node_at },
    ])
  )

  let sent = 0
  let enrolled = 0
  let advanced = 0

  for (const lead of leads ?? []) {
    if (!lead.email) continue

    // Anti-spam: skip leads emailed in the last 20 hours
    if (lead.last_emailed_at) {
      const elapsed = now.getTime() - new Date(lead.last_emailed_at).getTime()
      if (elapsed < 20 * 60 * 60 * 1000) continue
    }

    try {
      let currentNodeId: string
      let enteredAt: Date

      const existingState = stateMap.get(lead.id)
      if (!existingState) {
        // Enroll at trigger node
        currentNodeId = triggerNode.id
        enteredAt = now
        await supabase.from('lead_flow_state').upsert({
          lead_id: lead.id,
          flow_id: flow.id,
          current_node_id: currentNodeId,
          entered_node_at: enteredAt.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: 'lead_id' })
        enrolled++
      } else {
        currentNodeId = existingState.current_node_id
        enteredAt = new Date(existingState.entered_node_at)
      }

      // Walk the graph (max 20 steps to prevent infinite loops)
      let steps = 0
      let newNodeId = currentNodeId
      let newEnteredAt = enteredAt
      let stateChanged = false

      while (steps < 20) {
        steps++
        const node = nodeMap.get(newNodeId)
        if (!node) break

        if (node.type === 'trigger') {
          const next = findNextNode(edges, newNodeId)
          if (!next) break
          newNodeId = next
          newEnteredAt = now
          stateChanged = true
          continue
        }

        if (node.type === 'wait') {
          const data = node.data as WaitNodeData
          const elapsedMs = now.getTime() - newEnteredAt.getTime()
          const requiredMs = data.days * 24 * 60 * 60 * 1000
          if (elapsedMs < requiredMs) break // not ready yet
          const next = findNextNode(edges, newNodeId)
          if (!next) break
          newNodeId = next
          newEnteredAt = now
          stateChanged = true
          continue
        }

        if (node.type === 'send_email') {
          const data = node.data as SendEmailNodeData
          if (data.templateId) {
            await sendFlowEmail({
              leadId: lead.id,
              firstName: lead.first_name,
              email: lead.email as string,
              protectionScore: lead.protection_score ?? 0,
              aiReport: lead.ai_report as FunnelAIReport | null,
              templateId: data.templateId,
            })
            await supabase
              .from('funnel_leads')
              .update({ last_emailed_at: now.toISOString() })
              .eq('id', lead.id)
            sent++
          }
          const next = findNextNode(edges, newNodeId)
          if (!next) break
          newNodeId = next
          newEnteredAt = now
          stateChanged = true
          break // one email per lead per cron run — resume next day
        }

        if (node.type === 'condition') {
          const data = node.data as ConditionNodeData
          let isYes = false
          if (data.conditionType === 'lead_status' && data.statusValues) {
            isYes = data.statusValues.includes(lead.status as never)
          }
          const handle = isYes ? 'yes' as const : 'no' as const
          const next = findNextNode(edges, newNodeId, handle)
          if (!next) break
          newNodeId = next
          newEnteredAt = now
          stateChanged = true
          continue
        }

        break
      }

      // Persist updated state if it changed
      if (stateChanged || newNodeId !== currentNodeId) {
        await supabase.from('lead_flow_state').upsert({
          lead_id: lead.id,
          flow_id: flow.id,
          current_node_id: newNodeId,
          entered_node_at: newEnteredAt.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: 'lead_id' })
        advanced++
      }
    } catch (err) {
      console.error(`Flow cron error for lead ${lead.id}:`, err)
    }
  }

  return { enrolled, advanced, sent }
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const now = new Date()

  // Try to load active flow
  const { data: activeFlow } = await supabase
    .from('automation_flows')
    .select('id, flow_json')
    .eq('is_active', true)
    .single()

  if (!activeFlow) {
    // Fall back to legacy hardcoded sequence
    const results = await runLegacySequence(supabase, now)
    return NextResponse.json({ ok: true, mode: 'legacy', timestamp: now.toISOString(), results })
  }

  const results = await runFlowSequence(supabase, activeFlow as { id: string; flow_json: FlowDefinition }, now)
  return NextResponse.json({ ok: true, mode: 'flow', flowId: activeFlow.id, timestamp: now.toISOString(), results })
}
