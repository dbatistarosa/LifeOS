import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'

// ── Simple client-side rate limit ─────────────────────────────────────────────
// Prevents users from spamming submissions in the same browser session.
// Server-side RLS + Supabase unique constraint are the real guards.
const RATE_LIMIT_MS = 60_000 // 1 submission per minute per session
let lastSubmitTime = 0

// ── Basic email validation ─────────────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,}$/

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false
  const trimmed = email.trim().toLowerCase()
  return EMAIL_REGEX.test(trimmed) && trimmed.length <= 254
}

function sanitizeText(str, maxLen = 100) {
  if (!str || typeof str !== 'string') return null
  return str.trim().slice(0, maxLen) || null
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useWaitlist() {
  const [state, setState] = useState({
    status: 'idle', // idle | loading | success | error | duplicate | ratelimit
    count: null,
    error: null,
  })

  const submit = async ({ email, name, problem }) => {
    // ── Client-side rate limit ──
    const now = Date.now()
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      setState({ status: 'ratelimit', count: null, error: null })
      return
    }

    // ── Client-side validation ──
    if (!validateEmail(email)) {
      setState({ status: 'error', count: null, error: 'Please enter a valid email address.' })
      return
    }

    setState({ status: 'loading', count: null, error: null })
    lastSubmitTime = now

    try {
      const safeEmail   = email.trim().toLowerCase()
      const safeName    = sanitizeText(name, 100)
      const safeProblem = sanitizeText(problem, 50)

      // ── 1. Insert (Supabase unique constraint handles duplicates) ──
      const { error: insertError } = await supabase
        .from('waitlist')
        .insert([{
          email:       safeEmail,
          name:        safeName,
          top_problem: safeProblem,
          source:      (document.referrer || 'direct').slice(0, 500),
          user_agent:  navigator.userAgent.slice(0, 300),
        }])

      if (insertError) {
        // Postgres unique violation code
        if (insertError.code === '23505') {
          setState({ status: 'duplicate', count: null, error: null })
          return
        }
        // Generic DB error — don't expose raw DB message to UI
        import.meta.env.DEV && console.error('Waitlist insert error code:', insertError.code)
        throw new Error('signup_failed')
      }

      // ── 2. Get count via secure RPC function (no raw SELECT on table) ──
      let count = null
      try {
        const { data: countData } = await supabase.rpc('get_waitlist_count')
        count = countData
      } catch (_) {
        // Count is non-critical — fail silently
      }

      // ── 3. Send welcome email (non-blocking) ──
      try {
        await supabase.functions.invoke('send-welcome-email', {
          body: { email: safeEmail, name: safeName },
        })
      } catch (_) {
        // Email is non-critical — don't fail the signup
      }

      setState({ status: 'success', count, error: null })

    } catch (err) {
      // Never expose raw error messages from Supabase/network to the user
      setState({
        status: 'error',
        count: null,
        error: 'Something went wrong. Please try again in a moment.',
      })
    }
  }

  const reset = () => {
    lastSubmitTime = 0
    setState({ status: 'idle', count: null, error: null })
  }

  return { ...state, submit, reset }
}
