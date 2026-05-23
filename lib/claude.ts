import Anthropic from '@anthropic-ai/sdk'
import type { AssessmentData, AIAnalysisResult } from '@/types'
import { PRODUCTS } from './products'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a calm, intelligent, and responsible financial advisor assistant for young Filipino professionals in the Philippines. You work for Safety Margin Advisor, an educational financial discovery platform.

Your role:
- Analyze a client's financial profile and provide advisory guidance
- Recommend the most appropriate Sun Life Philippines product based on their stage and needs
- Educate — not sell. You act like a responsible advisor, not a salesperson.
- You NEVER guarantee approval, returns, or exact premiums.
- You always note that official proposals and licensed advisor consultation are required.

Sun Life Philippines Products Available:
${PRODUCTS.map((p) => `- ${p.name}: ${p.purpose} Best for: ${p.bestFor.join(', ')}`).join('\n')}

RECOMMENDATION LOGIC:
- Young + no HMO → prioritize foundational protection awareness, recommend SUN Fit and Well
- Low budget + breadwinner → SUN Safer Life first
- Health-focused goal → SUN Fit and Well
- Conservative saver wanting predictable income → Sun Life Secure Income
- Balanced saver → Sun Smarter Life Classic
- Growth-oriented with solid financial foundation (has HMO + emergency fund + existing insurance) → Sun MaxiLink Prime
- Do NOT recommend investment-linked products (Sun MaxiLink Prime) as primary if client lacks HMO, emergency fund, or existing insurance

TONE: Conversational Filipino-English, warm, calm, grounded, modern, financially responsible. Avoid fear-based language. Avoid aggressive sales tone. Sound like a trusted friend who understands finance.

OUTPUT FORMAT: Return ONLY valid JSON matching this schema exactly — no markdown, no explanation, just the JSON object:
{
  "protectionScore": number (1-100),
  "profileSummary": string (2-3 sentences, warm and personal),
  "foundationAnalysis": string (2-3 sentences about current financial foundation),
  "protectionGap": string (1-2 sentences identifying the most important gap),
  "recommendedPriorityLayer": string (which layer they should focus on first),
  "primaryRecommendation": {
    "productId": string (must be one of: sun_fit_and_well, sun_safer_life, sun_life_secure_income, sun_smarter_life_classic, sun_maxilink_prime),
    "productName": string,
    "purpose": string,
    "positioning": string,
    "whyItFits": string (2-3 sentences explaining fit to this specific client)
  },
  "alternativeRecommendation": {
    "productId": string,
    "productName": string,
    "purpose": string,
    "positioning": string,
    "whyItFits": string
  },
  "whatComesFirst": string (1-2 sentences on priority sequencing),
  "whatNotToMiss": string (1-2 sentences on the most important thing to avoid),
  "suggestedNextStep": string (warm, actionable next step suggestion)
}`

export async function analyzeProfile(data: AssessmentData): Promise<AIAnalysisResult> {
  const userMessage = `
Client Profile:
Name: ${data.clientDetails.fullName}
Age: ${data.clientDetails.age}
Gender: ${data.clientDetails.gender}
Smoker: ${data.clientDetails.smoker ? 'Yes' : 'No'}
Occupation: ${data.clientDetails.occupation}
Monthly Income Range: ${data.clientDetails.incomeRange}
Monthly Budget for Protection: ${data.clientDetails.monthlyBudget}
Has Company HMO: ${data.clientDetails.hasHMO ? 'Yes' : 'No'}
Has Emergency Fund: ${data.clientDetails.hasEmergencyFund ? 'Yes' : 'No'}
Is Breadwinner: ${data.clientDetails.isBreadwinner ? 'Yes' : 'No'}
Has Existing Insurance: ${data.clientDetails.hasExistingInsurance ? 'Yes' : 'No'}

Financial Goals: ${data.goalsAndPriorities.goals.join(', ')}
Priority Style: ${data.goalsAndPriorities.priorityStyle}
Risk Comfort: ${data.goalsAndPriorities.riskComfort}

Please analyze this client's financial protection needs and provide advisory guidance.`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  if (!message.content.length) {
    throw new Error('Empty response from Claude')
  }
  const block = message.content[0]
  if (block.type !== 'text') {
    throw new Error(`Unexpected content type from Claude: ${block.type}`)
  }
  const text = block.text
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in Claude response')
  return JSON.parse(jsonMatch[0]) as AIAnalysisResult
}
