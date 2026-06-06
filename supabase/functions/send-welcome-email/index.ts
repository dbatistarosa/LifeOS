// supabase/functions/send-welcome-email/index.ts
// Deployed as a Supabase Edge Function — NOT exposed publicly
// Invoked only by the Supabase client SDK (requires valid anon/service JWT)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// ── Config ──────────────────────────────────────────────────────────────────
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://lifeos.app'
const FROM_EMAIL     = 'LifeOS <hello@lifeos.app>'

// ── Helpers ──────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/

/** Strip any HTML tags and trim to a safe length */
function sanitize(str: string | null | undefined, maxLen = 100): string {
  if (!str) return ''
  return str.replace(/<[^>]*>/g, '').replace(/[<>"'&]/g, '').trim().slice(0, maxLen)
}

/** CORS headers — locked to our domain */
function corsHeaders(origin: string) {
  const allowed = origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

// ── Handler ──────────────────────────────────────────────────────────────────
serve(async (req) => {
  const origin = req.headers.get('origin') || ''

  // Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  }

  // Guard: RESEND_API_KEY must be set
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY secret is not set')
    return new Response(JSON.stringify({ error: 'Email service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  }

  try {
    const body = await req.json()

    // Validate & sanitize inputs — never trust client data
    const rawEmail = typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''
    const rawName  = typeof body?.name  === 'string' ? body.name  : ''

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail) || rawEmail.length > 254) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
      })
    }

    // Safe values — HTML-encoded, length-capped
    const safeEmail     = sanitize(rawEmail, 254)
    const safeFirstName = sanitize(rawName.split(' ')[0], 50) || 'there'

    // Build email HTML (all dynamic values pre-sanitized above)
    const htmlContent = buildEmailHtml(safeFirstName)

    // Send via Resend
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      [safeEmail],
        subject: `${safeFirstName}, you're on the LifeOS waitlist! 🚀`,
        html:    htmlContent,
      }),
    })

    if (!resendRes.ok) {
      // Log full error server-side, return generic message to client
      const errBody = await resendRes.text()
      console.error('Resend error:', resendRes.status, errBody)
      throw new Error('Email delivery failed')
    }

    const resendData = await resendRes.json()

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  } catch (err) {
    // Never expose raw error messages to the client
    console.error('send-welcome-email error:', err)
    return new Response(JSON.stringify({ error: 'An error occurred. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    })
  }
})

// ── Email template ────────────────────────────────────────────────────────────
function buildEmailHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LifeOS</title>
</head>
<body style="margin:0;padding:0;background:#03040A;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#03040A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="display:inline-table;">
                <tr>
                  <td style="background:linear-gradient(135deg,#00F5A0,#00C2FF);border-radius:13px;width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <span style="font-size:24px;line-height:48px;">&#9889;</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-family:Georgia,serif;font-size:24px;font-weight:bold;color:#F0F4FF;letter-spacing:-0.5px;">LifeOS</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#0F1525;border:1px solid rgba(0,245,160,0.15);border-radius:20px;padding:48px 40px;">
              <p style="margin:0 0 20px 0;font-family:monospace;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#00F5A0;opacity:0.7;">// Waitlist Confirmation</p>
              <h1 style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:32px;font-weight:bold;color:#F0F4FF;letter-spacing:-0.5px;line-height:1.15;">
                ${firstName}, you&#39;re in. &#128640;
              </h1>
              <p style="margin:0 0 24px 0;font-size:16px;color:#8A96B0;line-height:1.65;">
                Your spot on the <strong style="color:#F0F4FF;">LifeOS</strong> waitlist is confirmed. You&#39;re among the first people to know about and shape the app that will transform how people manage their daily lives.
              </p>

              <div style="background:#141C30;border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:24px;margin:0 0 28px 0;">
                <p style="margin:0 0 16px 0;font-family:monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#4A5270;">What&#39;s coming for you</p>
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                  <span style="font-size:20px;line-height:1.2;flex-shrink:0;">&#127873;</span>
                  <div><p style="margin:0 0 2px 0;font-size:14px;font-weight:bold;color:#F0F4FF;">3 months free beta access</p><p style="margin:0;font-size:12px;color:#4A5270;">For the first 500 on the list</p></div>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                  <span style="font-size:20px;line-height:1.2;flex-shrink:0;">&#128142;</span>
                  <div><p style="margin:0 0 2px 0;font-size:14px;font-weight:bold;color:#F0F4FF;">Founder price for life</p><p style="margin:0;font-size:12px;color:#4A5270;">You&#39;ll never pay the regular price</p></div>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
                  <span style="font-size:20px;line-height:1.2;flex-shrink:0;">&#127919;</span>
                  <div><p style="margin:0 0 2px 0;font-size:14px;font-weight:bold;color:#F0F4FF;">Direct influence on features</p><p style="margin:0;font-size:12px;color:#4A5270;">Your feedback shapes the product</p></div>
                </div>
                <div style="display:flex;align-items:flex-start;gap:12px;">
                  <span style="font-size:20px;line-height:1.2;flex-shrink:0;">&#128101;</span>
                  <div><p style="margin:0 0 2px 0;font-size:14px;font-weight:bold;color:#F0F4FF;">Priority premium squad access</p><p style="margin:0;font-size:12px;color:#4A5270;">Exclusive early adopter group</p></div>
                </div>
              </div>

              <div style="text-align:center;margin:0 0 24px 0;">
                <a href="https://lifeos.app" style="display:inline-block;background:linear-gradient(135deg,#00F5A0,#00C2FF);color:#03040A;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:12px;text-decoration:none;letter-spacing:0.03em;">
                  Visit lifeos.app &#8594;
                </a>
              </div>

              <div style="background:rgba(0,245,160,0.05);border:1px solid rgba(0,245,160,0.12);border-radius:12px;padding:18px;text-align:center;">
                <p style="margin:0 0 8px 0;font-size:13px;color:#8A96B0;">Know someone who needs this?</p>
                <p style="margin:0;font-size:13px;color:#4A5270;">Share and help them join the list before launch.</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 0 0 0;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#4A5270;">LifeOS &middot; Built with purpose in South Florida</p>
              <p style="margin:0;font-size:11px;color:#2A3250;">
                <a href="https://lifeos.app" style="color:#4A5270;text-decoration:none;">lifeos.app</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:hello@lifeos.app" style="color:#4A5270;text-decoration:none;">hello@lifeos.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
