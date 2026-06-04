import type { LeadStatus } from '@/lib/lead-status'

// ── Node data payloads ───────────────────────────────────────────────

export interface TriggerNodeData {
  type: 'trigger'
  label: string
  triggerType: 'new_lead'
  [key: string]: unknown
}

export interface SendEmailNodeData {
  type: 'send_email'
  label: string
  templateId: string
  [key: string]: unknown
}

export interface WaitNodeData {
  type: 'wait'
  label: string
  days: number
  [key: string]: unknown
}

export type ConditionType = 'lead_status' | 'email_engagement'

export interface ConditionNodeData {
  type: 'condition'
  label: string
  conditionType: ConditionType
  statusValues?: LeadStatus[]
  engagementEvent?: 'opened' | 'clicked'
  [key: string]: unknown
}

export type FlowNodeData =
  | TriggerNodeData
  | SendEmailNodeData
  | WaitNodeData
  | ConditionNodeData

// ── React Flow compatible node + edge ────────────────────────────────

export interface FlowNode {
  id: string
  type: 'trigger' | 'send_email' | 'wait' | 'condition'
  position: { x: number; y: number }
  data: FlowNodeData
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: 'yes' | 'no' | null
  label?: string
}

export interface FlowDefinition {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

// ── DB record ────────────────────────────────────────────────────────

export interface AutomationFlow {
  id: string
  name: string
  is_active: boolean
  flow_json: FlowDefinition
  created_at: string
  updated_at: string
}
