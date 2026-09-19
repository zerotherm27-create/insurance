import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { sendSequenceEmail, sendFlowEmail, sendNurtureEmail } from '@/lib/email'
import { TERMINAL_STATUSES } from '@/lib/lead-status'
import type { FunnelAIReport } from '@/types/funnel'
import type { FlowNode, FlowEdge, ConditionNodeData, SendEmailNodeData, WaitNodeData } from '@/types/automation-flow'
import type { NurtureTemplate } from '@/types/nurture'
import { usesQuizVars } from '@/types/email-template'
import { matchFlowForLead, type ActiveFlowRow } from '@/lib/flow-match'

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
  flows: ActiveFlowRow[],
  now: Date
) {
  const flowMap = new Map<string, ActiveFlowRow>(flows.map((f) => [f.id, f]))

  // Load nurture templates once for the whole cron run
  const { data: nurtureTemplates } = await supabase
    .from('nurture_templates')
    .select('*')
    .order('position')

  // Load all eligible leads (include nurture tracking columns)
  const { data: leads, error: leadsErr } = await supabase
    .from('funnel_leads')
    .select('id, first_name, email, segment, source, event_tag, profession, protection_score, ai_report, status, last_emailed_at, nurture_step, last_nurtured_at')
    .not('email', 'is', null)
    .not('status', 'in', `(${TERMINAL_STATUSES.join(',')})`)
    .limit(100)

  if (leadsErr) return { error: leadsErr.message }

  // Load existing flow states for these leads
  const leadIds = (leads ?? []).map((l: { id: string }) => l.id)
  const { data: states, error: statesErr } = await supabase
    .from('lead_flow_state')
    .select('lead_id, flow_id, current_node_id, entered_node_at')
    .in('lead_id', leadIds.length > 0 ? leadIds : ['__none__'])
  if (statesErr) console.error('Failed to load lead_flow_state:', statesErr.message)

  const stateMap = new Map<string, { flow_id: string; current_node_id: string; entered_node_at: string }>(
    (states ?? []).map((s: { lead_id: string; flow_id: string; current_node_id: string; entered_node_at: string }) => [
      s.lead_id,
      { flow_id: s.flow_id, current_node_id: s.current_node_id, entered_node_at: s.entered_node_at },
    ])
  )

  let sent = 0
  let enrolled = 0
  let advanced = 0
  let nurtured = 0

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
      let freshEnroll = false

      const existingState = stateMap.get(lead.id)
      const trackedFlow = existingState ? flowMap.get(existingState.flow_id) : undefined

      let flow: ActiveFlowRow
      if (existingState && trackedFlow) {
        // Still tracked against a flow that's active — keep walking it.
        flow = trackedFlow
        currentNodeId = existingState.current_node_id
        enteredAt = new Date(existingState.entered_node_at)
      } else {
        // No state yet, or the flow it was tracking is no longer active —
        // (re)match by the lead's segment and profession.
        const matched = matchFlowForLead(flows, {
          segment: lead.segment ?? null,
          profession: lead.profession ?? null,
          eventTag: lead.event_tag ?? null,
          source: lead.source ?? null,
        })
        if (!matched) continue // no active flow covers this lead
        flow = matched
        const triggerNode = flow.flow_json.nodes.find((n) => n.type === 'trigger')
        if (!triggerNode) continue
        currentNodeId = triggerNode.id
        enteredAt = now
        freshEnroll = true

        const { error: enrollErr } = await supabase.from('lead_flow_state').upsert({
          lead_id: lead.id,
          flow_id: flow.id,
          current_node_id: currentNodeId,
          entered_node_at: enteredAt.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: 'lead_id' })
        if (enrollErr) console.error(`Failed to enroll lead ${lead.id} in flow:`, enrollErr.message)
        enrolled++
      }

      const { nodes, edges } = flow.flow_json
      const nodeMap = new Map<string, FlowNode>(nodes.map((n) => [n.id, n]))

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
          // A lead only ever rests on a send_email node when it is the last
          // node in the flow (the email fires on arrival, then state moves on).
          // Resuming here means it was already sent, so never send it again.
          if (newNodeId === currentNodeId && !stateChanged) break
          if (data.templateId) {
            await sendFlowEmail({
              leadId: lead.id,
              firstName: lead.first_name,
              email: lead.email as string,
              protectionScore: lead.protection_score ?? 0,
              aiReport: lead.ai_report as FunnelAIReport | null,
              templateId: data.templateId,
              segment: lead.segment,
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
          } else if (data.conditionType === 'segment' && data.segmentValues) {
            isYes = lead.segment ? (data.segmentValues as string[]).includes(lead.segment) : false
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
        const { error: persistErr } = await supabase.from('lead_flow_state').upsert({
          lead_id: lead.id,
          flow_id: flow.id,
          current_node_id: newNodeId,
          entered_node_at: newEnteredAt.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: 'lead_id' })
        if (persistErr) console.error(`Failed to persist flow state for lead ${lead.id}:`, persistErr.message)
        advanced++
      }

      // Nurture phase: runs when the lead is at a terminal flow node (no outgoing edges)
      const isTerminal = !freshEnroll && !edges.some(e => e.source === newNodeId)
      if (isTerminal && nurtureTemplates && nurtureTemplates.length > 0) {
        // Find next template after last sent position that matches the lead's segment
        const nextTemplate = (nurtureTemplates as NurtureTemplate[]).find((t) => {
          if (t.position <= (lead.nurture_step ?? 0)) return false
          // No quiz report means no score/gap to fill in, so skip any template
          // that depends on them and move on to the next quiz-free one.
          if (!lead.ai_report && usesQuizVars(t.subject, t.heading, t.cta_text, ...t.paragraphs)) return false
          const segs = (t as NurtureTemplate & { segments?: string[] }).segments ?? []
          const segMatch = segs.length === 0 || (lead.segment && segs.includes(lead.segment))
          const srcs = (t as NurtureTemplate & { sources?: string[] }).sources ?? []
          const leadSource = lead.source ?? 'quiz'
          const srcMatch = srcs.length === 0 || srcs.includes(leadSource)
          const evts = (t as NurtureTemplate & { event_tags?: string[] }).event_tags ?? []
          const evtMatch = evts.length === 0 || (!!lead.event_tag && evts.includes(lead.event_tag))
          return segMatch && srcMatch && evtMatch
        })
        if (nextTemplate) {
          const waitMs = nextTemplate.wait_days * 24 * 60 * 60 * 1000
          const lastNurtured = lead.last_nurtured_at ? new Date(lead.last_nurtured_at) : null
          const readyToNurture = !lastNurtured || now.getTime() - lastNurtured.getTime() >= waitMs
          if (readyToNurture) {
            try {
              await sendNurtureEmail({
                leadId: lead.id,
                firstName: lead.first_name,
                email: lead.email as string,
                protectionScore: lead.protection_score ?? 0,
                aiReport: lead.ai_report as FunnelAIReport | null,
                template: nextTemplate,
              })
              await supabase
                .from('funnel_leads')
                .update({
                  nurture_step: nextTemplate.position,
                  last_nurtured_at: now.toISOString(),
                  last_emailed_at: now.toISOString(),
                })
                .eq('id', lead.id)
              nurtured++
            } catch (err) {
              console.error(`Nurture send error for lead ${lead.id}:`, err)
            }
          }
        }
      }
    } catch (err) {
      console.error(`Flow cron error for lead ${lead.id}:`, err)
    }
  }

  return { enrolled, advanced, sent, nurtured }
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

  // Load every active flow — each may target its own segment(s) and/or
  // profession(s), and one with both empty can act as the catch-all default.
  const { data: activeFlows } = await supabase
    .from('automation_flows')
    .select('id, segments, professions, event_tags, sources, updated_at, flow_json')
    .eq('is_active', true)

  if (!activeFlows || activeFlows.length === 0) {
    // Fall back to legacy hardcoded sequence
    const results = await runLegacySequence(supabase, now)
    return NextResponse.json({ ok: true, mode: 'legacy', timestamp: now.toISOString(), results })
  }

  const results = await runFlowSequence(supabase, activeFlows as ActiveFlowRow[], now)
  return NextResponse.json({
    ok: true,
    mode: 'flow',
    flowIds: activeFlows.map((f) => f.id),
    timestamp: now.toISOString(),
    results,
  })
}
