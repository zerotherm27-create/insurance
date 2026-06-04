import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { substituteVars, PREVIEW_VARS } from '@/types/email-template'
import type { EmailTemplate } from '@/types/email-template'

function auth(req: NextRequest) {
  return req.headers.get('authorization') === `Bearer ${process.env.ADMIN_SECRET}`
}

function renderEmailHtml(t: EmailTemplate): string {
  const s = (text: string) => substituteVars(text, PREVIEW_VARS)

  const paragraphsHtml = t.paragraphs
    .map(p => `<p style="color:rgba(255,255,255,0.68);font-size:14px;line-height:1.75;margin:0 0 16px">${s(p).replace(/\n/g, '<br/>')}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    * { box-sizing: border-box; }
    body { margin:0; padding:0; background:#0A1628; font-family:Inter,Arial,sans-serif; }
    .wrap { max-width:560px; margin:0 auto; padding:32px 16px; }
    .label { color:#F6B21A; font-size:11px; letter-spacing:3px; text-transform:uppercase; margin:0 0 24px; }
    .heading { color:#fff; font-size:20px; font-family:Georgia,serif; margin:0 0 20px; line-height:1.4; }
    .pill { display:inline-block; background:#F6B21A22; color:#F6B21A; border:1px solid #F6B21A55; border-radius:999px; padding:4px 18px; font-size:12px; margin:0 0 16px; }
    .cta { display:inline-block; background:#F6B21A; color:#0A1628; border-radius:10px; padding:14px 28px; font-size:15px; font-weight:700; text-decoration:none; margin:8px 0; }
    .footer { color:rgba(255,255,255,0.2); font-size:11px; text-align:center; line-height:1.7; margin:24px 0 0; border-top:1px solid rgba(255,255,255,0.06); padding-top:24px; }
    .preview-badge { background:#1A2F57; border-radius:6px; padding:6px 12px; color:#F6B21A; font-size:10px; letter-spacing:2px; text-transform:uppercase; margin:0 0 20px; display:inline-block; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="preview-badge">Preview — Sample Data</div>

    <p class="label">Safety Margin</p>

    <h1 class="heading">${s(t.heading)}</h1>

    ${t.id === 'report' ? `
    <div style="background:#1A2F57;border-radius:12px;padding:20px;margin:0 0 16px;text-align:center">
      <p style="color:rgba(255,255,255,0.35);font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 8px">PROTECTION SCORE</p>
      <p style="color:#f97316;font-size:56px;font-family:Georgia,serif;margin:0;line-height:1">${PREVIEW_VARS.score}</p>
      <p style="color:rgba(255,255,255,0.35);font-size:13px;margin:4px 0 10px">/ 100</p>
      <span class="pill">${PREVIEW_VARS.scoreLabel}</span>
    </div>` : ''}

    ${paragraphsHtml}

    <div style="text-align:center;margin:24px 0">
      <a class="cta" href="#">${s(t.cta_text)}</a>
    </div>

    <p class="footer">
      Jojo · Safety Margin<br/>
      This is for informational purposes only and does not constitute financial advice.
    </p>
  </div>
</body>
</html>`
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!process.env.ADMIN_SECRET) return NextResponse.json({ error: 'Misconfigured' }, { status: 500 })
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

  const html = renderEmailHtml(data as EmailTemplate)
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}
