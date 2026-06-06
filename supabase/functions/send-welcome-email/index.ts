// supabase/functions/send-welcome-email/index.ts
// Deploy: supabase functions deploy send-welcome-email
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx ALLOWED_ORIGIN=https://lifeos.app

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY  = Deno.env.get('RESEND_API_KEY')
const ALLOWED_ORIGIN  = Deno.env.get('ALLOWED_ORIGIN') || 'https://lifeos.app'
const FROM_EMAIL      = 'LifeOS <hello@lifeos.app>'
const EMAIL_REGEX     = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/

function corsHeaders(origin: string) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function sanitize(s: unknown, max = 100): string {
  if (typeof s !== 'string') return ''
  return s.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim().slice(0, max)
}

serve(async (req) => {
  const origin = req.headers.get('origin') || ''

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  }
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return new Response(JSON.stringify({ error: 'Service unavailable' }), {
      status: 503, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  }

  try {
    const body = await req.json()
    const rawEmail = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    const safeEmail     = sanitize(rawEmail, 254)
    const safeFirstName = sanitize(body?.name?.split?.(' ')?.[0], 50) || 'there'

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [safeEmail],
        subject: `${safeFirstName}, you&#39;re on the LifeOS waitlist! 🚀`,
        html:    buildEmail(safeFirstName),
      }),
    })

    if (!res.ok) {
      const t = await res.text()
      console.error('Resend error:', res.status, t)
      throw new Error('delivery_failed')
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })

  } catch (err) {
    console.error('send-welcome-email:', err)
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  }
})

function buildEmail(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#03040A;font-family:'Helvetica Neue',Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#03040A;padding:40px 20px">
  <tr><td align="center">
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
    <tr><td style="padding:0 0 32px;text-align:center">
      <span style="background:linear-gradient(135deg,#00F5A0,#00C2FF);border-radius:13px;display:inline-block;width:48px;height:48px;line-height:48px;text-align:center;font-size:24px">&#9889;</span>
      <span style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#F0F4FF;vertical-align:middle;margin-left:12px">LifeOS</span>
    </td></tr>
    <tr><td style="background:#0F1525;border:1px solid rgba(0,245,160,.15);border-radius:20px;padding:48px 40px">
      <p style="margin:0 0 16px;font-family:monospace;font-size:11px;letter-spacing:.25em;text-transform:uppercase;color:#00F5A0;opacity:.7">// Waitlist Confirmation</p>
      <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:30px;color:#F0F4FF;line-height:1.2">${firstName}, you&#39;re in! &#128640;</h1>
      <p style="margin:0 0 24px;font-size:16px;color:#8A96B0;line-height:1.65">Your spot on the <strong style="color:#F0F4FF">LifeOS</strong> waitlist is confirmed. You&#39;re among the first to know and shape the app that will transform how people manage their daily lives.</p>
      <div style="background:#141C30;border-radius:14px;padding:24px;margin:0 0 28px">
        <p style="margin:0 0 14px;font-size:10px;font-family:monospace;letter-spacing:.2em;text-transform:uppercase;color:#4A5270">What&#39;s coming for you</p>
        <p style="margin:0 0 10px;font-size:14px;color:#F0F4FF">&#127873; <strong>3 months free beta access</strong> — for the first 500</p>
        <p style="margin:0 0 10px;font-size:14px;color:#F0F4FF">&#128142; <strong>Founder price for life</strong> — you&#39;ll never pay full price</p>
        <p style="margin:0 0 10px;font-size:14px;color:#F0F4FF">&#127919; <strong>Direct influence on features</strong> — your feedback shapes the product</p>
        <p style="margin:0;font-size:14px;color:#F0F4FF">&#128101; <strong>Priority squad access</strong> — exclusive early adopter group</p>
      </div>
      <div style="text-align:center;margin:0 0 24px">
        <a href="https://lifeos.app" style="display:inline-block;background:linear-gradient(135deg,#00F5A0,#00C2FF);color:#03040A;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none">Visit lifeos.app &#8594;</a>
      </div>
      <div style="background:rgba(0,245,160,.05);border:1px solid rgba(0,245,160,.12);border-radius:12px;padding:16px;text-align:center">
        <p style="margin:0;font-size:13px;color:#8A96B0">Know someone who needs this? Share and help them join before launch.</p>
      </div>
    </td></tr>
    <tr><td style="padding:24px 0 0;text-align:center">
      <p style="font-size:12px;color:#4A5270">LifeOS &middot; Built with purpose in South Florida</p>
      <p style="font-size:11px;color:#2A3250"><a href="https://lifeos.app" style="color:#4A5270;text-decoration:none">lifeos.app</a> &middot; <a href="mailto:hello@lifeos.app" style="color:#4A5270;text-decoration:none">hello@lifeos.app</a></p>
    </td></tr>
  </table>
  </td></tr>
</table>
</body></html>`
}
