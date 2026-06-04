'use client'

import { useEffect, useCallback } from 'react'
import { ReactFlowProvider, useNodes, useEdges } from '@xyflow/react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFlowState, makeDefaultFlowDefinition } from './flow/hooks/useFlowState'
import { FlowCanvas } from './flow/FlowCanvas'
import { NodePalette } from './flow/NodePalette'
import { FlowToolbar } from './flow/FlowToolbar'
import { TriggerNodePanel } from './flow/panels/TriggerNodePanel'
import { SendEmailNodePanel } from './flow/panels/SendEmailNodePanel'
import { WaitNodePanel } from './flow/panels/WaitNodePanel'
import { ConditionNodePanel } from './flow/panels/ConditionNodePanel'
import type { EmailTemplate } from '@/types/email-template'
import type { FlowDefinition, FlowNode } from '@/types/automation-flow'
import type { SendEmailNodeData, WaitNodeData, ConditionNodeData } from '@/types/automation-flow'
import { useState } from 'react'

interface Props {
  token: string
  templates: EmailTemplate[]
}

function validateFlow(nodes: FlowNode[], edges: { source: string; target: string; sourceHandle?: string | null }[]) {
  const errors: { message: string }[] = []

  const triggerNodes = nodes.filter((n) => n.type === 'trigger')
  if (triggerNodes.length === 0) errors.push({ message: 'Flow must have a Trigger node.' })
  if (triggerNodes.length > 1) errors.push({ message: 'Flow can only have one Trigger node.' })

  const conditionNodes = nodes.filter((n) => n.type === 'condition')
  for (const cn of conditionNodes) {
    const outEdges = edges.filter((e) => e.source === cn.id)
    const hasYes = outEdges.some((e) => e.sourceHandle === 'yes')
    const hasNo = outEdges.some((e) => e.sourceHandle === 'no')
    if (!hasYes || !hasNo) {
      errors.push({ message: `Condition "${(cn.data as { label: string }).label}" needs both Yes and No connections.` })
    }
  }

  const sendNodes = nodes.filter((n) => n.type === 'send_email')
  for (const sn of sendNodes) {
    if (!(sn.data as SendEmailNodeData).templateId) {
      errors.push({ message: `"${(sn.data as { label: string }).label}" has no email template selected.` })
    }
  }

  const waitNodes = nodes.filter((n) => n.type === 'wait')
  for (const wn of waitNodes) {
    if ((wn.data as WaitNodeData).days < 1) {
      errors.push({ message: `Wait node must be at least 1 day.` })
    }
  }

  return errors
}

// Inner component that has access to ReactFlow context
function FlowBuilderInner({ token, templates }: Props) {
  const state = useFlowState(token)
  const rfNodes = useNodes()
  const rfEdges = useEdges()

  const validationErrors = validateFlow(
    rfNodes.map((n) => ({ id: n.id, type: n.type as FlowNode['type'], position: n.position, data: n.data as FlowNode['data'] })),
    rfEdges.map((e) => ({ source: e.source, target: e.target, sourceHandle: e.sourceHandle }))
  )

  const selectedNode = rfNodes.find((n) => n.id === state.selectedNodeId) ?? null

  function handleAIGenerate(flow: FlowDefinition) {
    // Load AI-generated flow into canvas
    state.newFlow()
    // Small delay to let state reset
    setTimeout(() => {
      // Use the flow state setters
      import('@xyflow/react').then(({ applyNodeChanges, applyEdgeChanges }) => {
        // We'll use the ref approach - set nodes/edges directly
      })
      // Simplest approach: reload page state
      window.__aiFlow = flow
      window.dispatchEvent(new CustomEvent('aiFlowLoaded'))
    }, 50)
  }

  useEffect(() => {
    function handleAIFlow() {
      const flow = window.__aiFlow as FlowDefinition | undefined
      if (!flow) return
      const toRFNode = (n: FlowNode) => ({ ...n })
      const toRFEdge = (e: { id: string; source: string; target: string; sourceHandle?: string | null }) => ({
        ...e,
        type: 'smoothstep',
        style: { stroke: 'rgba(246,178,26,0.4)', strokeWidth: 2 },
      })
      state.setSelectedNodeId(null)
      // Access internal setters through the hook's returned fns
      // Rebuild by dispatching node reset via onNodesChange
      const addChanges = flow.nodes.map((n) => ({ type: 'add' as const, item: toRFNode(n) }))
      const removeChanges = rfNodes.map((n) => ({ type: 'remove' as const, id: n.id }))
      state.onNodesChange([...removeChanges, ...addChanges])

      const addEdgeChanges = flow.edges.map((e) => ({ type: 'add' as const, item: toRFEdge(e) }))
      const removeEdgeChanges = rfEdges.map((e) => ({ type: 'remove' as const, id: e.id }))
      state.onEdgesChange([...removeEdgeChanges, ...addEdgeChanges])

      delete window.__aiFlow
    }
    window.addEventListener('aiFlowLoaded', handleAIFlow)
    return () => window.removeEventListener('aiFlowLoaded', handleAIFlow)
  }, [rfNodes, rfEdges, state])

  useEffect(() => {
    state.fetchFlows()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <FlowToolbar
        savedFlow={state.savedFlow}
        isDirty={state.isDirty}
        saving={state.saving}
        error={state.error}
        validationErrors={validationErrors}
        token={token}
        flows={state.flows}
        loadingFlows={state.loadingFlows}
        onSave={state.save}
        onActivate={state.activate}
        onNew={state.newFlow}
        onLoadFlow={state.loadFlow}
        onAIGenerate={handleAIGenerate}
      />

      <div className="flex gap-4 items-start">
        <NodePalette />

        <FlowCanvas
          nodes={state.nodes}
          edges={state.edges}
          onNodesChange={state.onNodesChange}
          onEdgesChange={state.onEdgesChange}
          onConnect={state.onConnect}
          onNodeClick={state.setSelectedNodeId}
          onCanvasClick={() => state.setSelectedNodeId(null)}
          onAddNode={state.addNode}
          rfInstanceRef={state.rfInstanceRef}
        />

        {/* Config panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18 }}
              className="w-72 shrink-0 bg-navy-card border border-white/5 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-sans text-sm font-semibold text-white">
                  {selectedNode.type === 'trigger' && 'Trigger'}
                  {selectedNode.type === 'send_email' && 'Send Email'}
                  {selectedNode.type === 'wait' && 'Wait'}
                  {selectedNode.type === 'condition' && 'Condition'}
                </h3>
                <button
                  onClick={() => state.setSelectedNodeId(null)}
                  className="text-white/30 hover:text-white/60 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                {selectedNode.type === 'trigger' && <TriggerNodePanel />}
                {selectedNode.type === 'send_email' && (
                  <SendEmailNodePanel
                    nodeId={selectedNode.id}
                    data={selectedNode.data as SendEmailNodeData}
                    templates={templates}
                    onUpdate={state.updateNodeData}
                    onDelete={state.deleteNode}
                  />
                )}
                {selectedNode.type === 'wait' && (
                  <WaitNodePanel
                    nodeId={selectedNode.id}
                    data={selectedNode.data as WaitNodeData}
                    onUpdate={state.updateNodeData}
                    onDelete={state.deleteNode}
                  />
                )}
                {selectedNode.type === 'condition' && (
                  <ConditionNodePanel
                    nodeId={selectedNode.id}
                    data={selectedNode.data as ConditionNodeData}
                    onUpdate={state.updateNodeData}
                    onDelete={state.deleteNode}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function FlowBuilderTab({ token, templates }: Props) {
  return (
    <ReactFlowProvider>
      <FlowBuilderInner token={token} templates={templates} />
    </ReactFlowProvider>
  )
}

// Extend window for AI flow transfer
declare global {
  interface Window {
    __aiFlow?: FlowDefinition
  }
}
