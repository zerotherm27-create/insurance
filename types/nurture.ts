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
  sources: string[] // empty = any source; otherwise only matching leads (quiz/contact_form/business_card) receive it
  event_tags: string[] // empty = no event filter; otherwise only leads tagged with a matching event_tag receive it
  image_url?: string | null
  created_at: string
  updated_at: string
}
