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

// Default flow that mirrors the current hardcoded sequence
export function makeDefaultFlowDefinition(): FlowDefinition {
  const nodes: FlowNode[] = [
    { id: 'trigger-1', type: 'trigger', position: { x: 340, y: 40 }, data: { type: 'trigger', label: 'New Lead', triggerType: 'new_lead' } },
    { id: 'wait-1', type: 'wait', position: { x: 300, y: 160 }, data: { type: 'wait', label: 'Wait 1 day', days: 1 } },
    { id: 'send-1', type: 'send_email', position: { x: 280, y: 290 }, data: { type: 'send_email', label: 'Follow-up 1', templateId: 'followup_1' } },
    { id: 'wait-2', type: 'wait', position: { x: 300, y: 420 }, data: { type: 'wait', label: 'Wait 2 days', days: 2 } },
    { id: 'cond-1', type: 'condition', position: { x: 240, y: 550 }, data: { type: 'condition', label: 'Check status', conditionType: 'lead_status', statusValues: ['new', 'contacted'] } },
    { id: 'send-2', type: 'send_email', position: { x: 80, y: 700 }, data: { type: 'send_email', label: 'Follow-up 2 (cold)', templateId: 'followup_2' } },
    { id: 'send-2b', type: 'send_email', position: { x: 420, y: 700 }, data: { type: 'send_email', label: 'Follow-up 2 (engaged)', templateId: 'followup_3' } },
    { id: 'wait-3', type: 'wait', position: { x: 80, y: 840 }, data: { type: 'wait', label: 'Wait 4 days', days: 4 } },
    { id: 'send-3', type: 'send_email', position: { x: 80, y: 970 }, data: { type: 'send_email', label: 'Follow-up 3', templateId: 'followup_3' } },
    { id: 'wait-4', type: 'wait', position: { x: 80, y: 1100 }, data: { type: 'wait', label: 'Wait 7 days', days: 7 } },
    { id: 'send-4', type: 'send_email', position: { x: 80, y: 1230 }, data: { type: 'send_email', label: 'Follow-up 4', templateId: 'followup_4' } },
  ]
  const edges: FlowEdge[] = [
    { id: 'e-t-w1', source: 'trigger-1', target: 'wait-1' },
    { id: 'e-w1-s1', source: 'wait-1', target: 'send-1' },
    { id: 'e-s1-w2', source: 'send-1', target: 'wait-2' },
    { id: 'e-w2-c1', source: 'wait-2', target: 'cond-1' },
    { id: 'e-c1-s2', source: 'cond-1', target: 'send-2', sourceHandle: 'yes' },
    { id: 'e-c1-s2b', source: 'cond-1', target: 'send-2b', sourceHandle: 'no' },
    { id: 'e-s2-w3', source: 'send-2', target: 'wait-3' },
    { id: 'e-w3-s3', source: 'wait-3', target: 'send-3' },
    { id: 'e-s3-w4', source: 'send-3', target: 'wait-4' },
    { id: 'e-w4-s4', source: 'wait-4', target: 'send-4' },
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
