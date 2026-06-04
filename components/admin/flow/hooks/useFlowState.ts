'use client'

import { useState, useCallback, useRef } from 'react'
import {
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'
import type { AutomationFlow, FlowDefinition, FlowNode, FlowEdge } from '@/types/automation-flow'

// Best-practice branching flow for insurance lead nurture.
// Cold leads (new/contacted) get the educational path.
// Warm leads (engaged/decision_pending) skip education and go straight to conversion.
export function makeDefaultFlowDefinition(): FlowDefinition {
  const nodes: FlowNode[] = [
    // ── Trunk ──────────────────────────────────────────────────────────
    { id: 'n-trigger', type: 'trigger',    position: { x: 340, y: 40  }, data: { type: 'trigger',    label: 'New Lead',           triggerType: 'new_lead' } },
    { id: 'n-w1',      type: 'wait',       position: { x: 310, y: 170 }, data: { type: 'wait',       label: 'Wait 1 day',         days: 1 } },
    { id: 'n-s1',      type: 'send_email', position: { x: 290, y: 300 }, data: { type: 'send_email', label: 'Day 1 — Re-engage',   templateId: 'followup_1' } },
    { id: 'n-w2',      type: 'wait',       position: { x: 310, y: 430 }, data: { type: 'wait',       label: 'Wait 2 days',        days: 2 } },
    { id: 'n-cond1',   type: 'condition',  position: { x: 270, y: 560 }, data: { type: 'condition',  label: 'Warm lead?', conditionType: 'lead_status', statusValues: ['engaged', 'decision_pending'] } },

    // ── YES branch — warm leads (engaged / decision_pending) ────────────
    { id: 'n-w3y',     type: 'wait',       position: { x: 60,  y: 710 }, data: { type: 'wait',       label: 'Wait 2 days',        days: 2 } },
    { id: 'n-s3y',     type: 'send_email', position: { x: 40,  y: 840 }, data: { type: 'send_email', label: 'Day 5 — Conversion',  templateId: 'followup_3' } },
    { id: 'n-w4y',     type: 'wait',       position: { x: 60,  y: 970 }, data: { type: 'wait',       label: 'Wait 7 days',        days: 7 } },
    { id: 'n-s4y',     type: 'send_email', position: { x: 40,  y: 1100}, data: { type: 'send_email', label: 'Day 14 — Story',      templateId: 'followup_4' } },

    // ── NO branch — cold leads (new / contacted) ────────────────────────
    { id: 'n-s2n',     type: 'send_email', position: { x: 560, y: 710 }, data: { type: 'send_email', label: 'Day 3 — Educate',     templateId: 'followup_2' } },
    { id: 'n-w3n',     type: 'wait',       position: { x: 580, y: 840 }, data: { type: 'wait',       label: 'Wait 4 days',        days: 4 } },
    { id: 'n-cond2',   type: 'condition',  position: { x: 540, y: 970 }, data: { type: 'condition',  label: 'Warmed up?', conditionType: 'lead_status', statusValues: ['engaged', 'decision_pending'] } },
    { id: 'n-s3ny',    type: 'send_email', position: { x: 400, y: 1120}, data: { type: 'send_email', label: 'Day 7 — Conversion',  templateId: 'followup_3' } },
    { id: 'n-w4nn',    type: 'wait',       position: { x: 700, y: 1120}, data: { type: 'wait',       label: 'Wait 7 days',        days: 7 } },
    { id: 'n-s4nn',    type: 'send_email', position: { x: 680, y: 1260}, data: { type: 'send_email', label: 'Day 14 — Story',      templateId: 'followup_4' } },
  ]

  const edges: FlowEdge[] = [
    // trunk
    { id: 'e-t-w1',      source: 'n-trigger', target: 'n-w1' },
    { id: 'e-w1-s1',     source: 'n-w1',      target: 'n-s1' },
    { id: 'e-s1-w2',     source: 'n-s1',      target: 'n-w2' },
    { id: 'e-w2-c1',     source: 'n-w2',      target: 'n-cond1' },
    // YES (warm)
    { id: 'e-c1-w3y',    source: 'n-cond1',   target: 'n-w3y',  sourceHandle: 'yes' },
    { id: 'e-w3y-s3y',   source: 'n-w3y',     target: 'n-s3y' },
    { id: 'e-s3y-w4y',   source: 'n-s3y',     target: 'n-w4y' },
    { id: 'e-w4y-s4y',   source: 'n-w4y',     target: 'n-s4y' },
    // NO (cold)
    { id: 'e-c1-s2n',    source: 'n-cond1',   target: 'n-s2n',  sourceHandle: 'no' },
    { id: 'e-s2n-w3n',   source: 'n-s2n',     target: 'n-w3n' },
    { id: 'e-w3n-c2',    source: 'n-w3n',     target: 'n-cond2' },
    // cold re-check YES
    { id: 'e-c2-s3ny',   source: 'n-cond2',   target: 'n-s3ny', sourceHandle: 'yes' },
    // cold re-check NO
    { id: 'e-c2-w4nn',   source: 'n-cond2',   target: 'n-w4nn', sourceHandle: 'no' },
    { id: 'e-w4nn-s4nn', source: 'n-w4nn',    target: 'n-s4nn' },
  ]

  return { nodes, edges }
}

function toRFNodes(flowNodes: FlowNode[]): Node[] {
  return flowNodes.map((n) => ({ ...n }))
}

function toRFEdges(flowEdges: FlowEdge[]): Edge[] {
  return flowEdges.map((e) => ({
    ...e,
    type: 'smoothstep',
    animated: false,
    style: { stroke: 'rgba(246,178,26,0.4)', strokeWidth: 2 },
    labelStyle: { fill: 'rgba(255,255,255,0.6)', fontSize: 11 },
    labelBgStyle: { fill: '#0F1F3D', fillOpacity: 0.9 },
  }))
}

export function useFlowState(token: string) {
  const [savedFlow, setSavedFlow] = useState<AutomationFlow | null>(null)
  const [flows, setFlows] = useState<Omit<AutomationFlow, 'flow_json'>[]>([])
  const [loadingFlows, setLoadingFlows] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    toRFNodes(makeDefaultFlowDefinition().nodes)
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    toRFEdges(makeDefaultFlowDefinition().edges)
  )

  const rfInstanceRef = useRef<import('@xyflow/react').ReactFlowInstance | null>(null)

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  const fetchFlows = useCallback(async () => {
    setLoadingFlows(true)
    try {
      const res = await fetch('/api/admin/automation-flows', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setFlows(data.flows ?? [])
    } catch {
      setError('Failed to load flows')
    } finally {
      setLoadingFlows(false)
    }
  }, [token])

  const loadFlow = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/admin/automation-flows/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      const flow: AutomationFlow = data.flow
      setSavedFlow(flow)
      setNodes(toRFNodes(flow.flow_json.nodes))
      setEdges(toRFEdges(flow.flow_json.edges))
      setIsDirty(false)
      setSelectedNodeId(null)
    } catch {
      setError('Failed to load flow')
    }
  }, [token, setNodes, setEdges])

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'smoothstep',
      style: { stroke: 'rgba(246,178,26,0.4)', strokeWidth: 2 },
      labelStyle: { fill: 'rgba(255,255,255,0.6)', fontSize: 11 },
      labelBgStyle: { fill: '#0F1F3D', fillOpacity: 0.9 },
    }, eds))
    setIsDirty(true)
  }, [setEdges])

  const updateNodeData = useCallback((nodeId: string, data: Partial<FlowNode['data']>) => {
    setNodes((nds) =>
      nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
    )
    setIsDirty(true)
  }, [setNodes])

  const addNode = useCallback((type: FlowNode['type'], position: { x: number; y: number }) => {
    const id = `${type}-${Date.now()}`
    const defaultData: Record<string, FlowNode['data']> = {
      trigger: { type: 'trigger', label: 'New Lead', triggerType: 'new_lead' },
      send_email: { type: 'send_email', label: 'Send Email', templateId: '' },
      wait: { type: 'wait', label: 'Wait 1 day', days: 1 },
      condition: { type: 'condition', label: 'Check Status', conditionType: 'lead_status', statusValues: ['new', 'contacted'] },
    }
    const newNode: Node = { id, type, position, data: defaultData[type] }
    setNodes((nds) => [...nds, newNode])
    setSelectedNodeId(id)
    setIsDirty(true)
  }, [setNodes])

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNodeId(null)
    setIsDirty(true)
  }, [setNodes, setEdges])

  const getCurrentFlowJson = useCallback((): FlowDefinition => ({
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.type as FlowNode['type'],
      position: n.position,
      data: n.data as FlowNode['data'],
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: (e.sourceHandle as 'yes' | 'no' | null | undefined) ?? null,
    })),
  }), [nodes, edges])

  const save = useCallback(async (name: string) => {
    setSaving(true)
    setError(null)
    const flow_json = getCurrentFlowJson()
    try {
      let res: Response
      if (savedFlow) {
        res = await fetch(`/api/admin/automation-flows/${savedFlow.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({ name, flow_json }),
        })
      } else {
        res = await fetch('/api/admin/automation-flows', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name, flow_json }),
        })
      }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setSavedFlow(data.flow)
      setIsDirty(false)
      await fetchFlows()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }, [savedFlow, getCurrentFlowJson, fetchFlows, headers])

  const activate = useCallback(async () => {
    if (!savedFlow) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/automation-flows/${savedFlow.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ is_active: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Activation failed')
      setSavedFlow(data.flow)
      await fetchFlows()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Activation failed')
    } finally {
      setSaving(false)
    }
  }, [savedFlow, fetchFlows, headers])

  const newFlow = useCallback(() => {
    const def = makeDefaultFlowDefinition()
    setSavedFlow(null)
    setNodes(toRFNodes(def.nodes))
    setEdges(toRFEdges(def.edges))
    setSelectedNodeId(null)
    setIsDirty(false)
  }, [setNodes, setEdges])

  return {
    // flow list
    flows, loadingFlows, fetchFlows, loadFlow,
    // current flow
    savedFlow, isDirty, saving, error, setError,
    // react flow
    nodes, edges, onNodesChange, onEdgesChange, onConnect,
    rfInstanceRef,
    // selected node
    selectedNodeId, setSelectedNodeId,
    // mutations
    updateNodeData, addNode, deleteNode,
    // save/activate
    save, activate, newFlow,
    getCurrentFlowJson,
  }
}
