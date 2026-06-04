'use client'

import '@xyflow/react/dist/style.css'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type ReactFlowInstance,
} from '@xyflow/react'
import { useCallback, type RefObject } from 'react'
import { TriggerNode } from './nodes/TriggerNode'
import { SendEmailNode } from './nodes/SendEmailNode'
import { WaitNode } from './nodes/WaitNode'
import { ConditionNode } from './nodes/ConditionNode'
import type { FlowNode } from '@/types/automation-flow'

const nodeTypes = {
  trigger: TriggerNode,
  send_email: SendEmailNode,
  wait: WaitNode,
  condition: ConditionNode,
}

interface Props {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: OnNodesChange
  onEdgesChange: OnEdgesChange
  onConnect: OnConnect
  onNodeClick: (nodeId: string) => void
  onCanvasClick: () => void
  onAddNode: (type: FlowNode['type'], position: { x: number; y: number }) => void
  rfInstanceRef: RefObject<ReactFlowInstance | null>
}

export function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onCanvasClick,
  onAddNode,
  rfInstanceRef,
}: Props) {
  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const type = e.dataTransfer.getData('nodeType') as FlowNode['type']
      if (!type || !rfInstanceRef.current) return
      const position = rfInstanceRef.current.screenToFlowPosition({ x: e.clientX, y: e.clientY })
      onAddNode(type, position)
    },
    [rfInstanceRef, onAddNode]
  )

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  return (
    <div className="flex-1 rounded-xl overflow-hidden border border-white/5" style={{ height: 620 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onNodeClick(node.id)}
        onPaneClick={onCanvasClick}
        onInit={(instance) => { rfInstanceRef.current = instance }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode="Delete"
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0A1628' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.06)"
        />
        <Controls
          style={{ background: '#0F1F3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          showInteractive={false}
        />
        <MiniMap
          style={{ background: '#0F1F3D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
          nodeColor="#1A2F57"
          maskColor="rgba(10,22,40,0.7)"
        />
      </ReactFlow>
    </div>
  )
}
