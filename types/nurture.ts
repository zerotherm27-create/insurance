export interface NurtureTemplate {
  id: string
  position: number
  label: string
  subject: string
  heading: string
  paragraphs: string[]
  cta_text: string
  wait_days: number
  segments: string[] // empty = all segments; otherwise only matching leads receive it
  created_at: string
  updated_at: string
}
