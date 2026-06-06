import { useState, useEffect, useRef } from 'react'
import { useWaitlist } from './hooks/useWaitlist'
import './App.css'

// ── Logo SVG ──────────────────────────────────────────────
function LogoMark({ size = 36 }) {
  const id = `lg${size}`
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden="true">
      <rect width="52" height="52" rx="13" fill={`url(#${id})`} />
      <circle cx="26" cy="26" r="9" fill="#03040A" />
      <path d="M26 8L26 17M26 35L26 44M8 26L17 26M35 26L44 26" stroke="#03040A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M14.1 14.1L20.4 20.4M31.6 31.6L37.9 37.9M14.1 37.9L20.4 31.6M31.6 20.4L37.9 14.1" stroke="#03040A" strokeWidth="2.5" strokeLinecap="round" />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#00F5A0" />
          <stop offset="1" stopColor="#00C2FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ── Problem data ──────────────────────────────────────────
const PROBLEMS = [
  { id: 'stress',    icon: '⚡', label: 'Estrés & Ansiedad',          short: 'Tensión crónica sin parar' },
  { id: 'balance',   icon: '⚖️', label: 'Work-Life Balance',           short: 'El trabajo invade todo' },
  { id: 'tech',      icon: '📱', label: 'Adicción Tecnológica',        short: 'FOMO y pantalla constante' },
  { id: 'lonely',    icon: '🌐', label: 'Soledad & Aislamiento',       short: 'Conectado pero solo' },
  { id: 'finance',   icon: '💸', label: 'Inestabilidad Financiera',    short: 'Inflación y angustia diaria' },
  { id: 'self',      icon: '🪞', label: 'Autoexigencia',               short: 'Comparación y baja autoestima' },
  { id: 'purpose',   icon: '🧭', label: 'Falta de Propósito',         short: 'Estancamiento y sin dirección' },
  { id: 'health',    icon: '🏃', label: 'Salud Física & Mental',       short: 'Sueño, dieta y ejercicio descuidados' },
  { id: 'relations', icon: '❤️', label: 'Relaciones Sanas',            short: 'Comunicación y vínculos rotos' },
  { id: 'change',    icon: '🌊', label: 'Adaptación al Cambio',        short: 'IA y futuro generan miedo' },
]

// ── Stats ─────────────────────────────────────────────────
const STATS = [
  { value: '77%',   label: 'de adultos experimenta estrés que afecta su salud' },
  { value: '3 de 5', label: 'personas se sienten solas a pesar de estar "conectadas"' },
  { value: '$500B', label: 'pérdidas anuales por burnout laboral en EE.UU.' },
  { value: '2 min', label: 'es todo lo que necesitas con LifeOS cada día' },
]

// ── How it works ──────────────────────────────────────────
const STEPS = [
  {
    num: '01',
    title: 'Check-in de 2 minutos',
    desc: 'Cada mañana respondes 5 preguntas sobre tu estado: ánimo, sueño, estrés, finanzas y energía. Sin largas encuestas.',
    accent: '#00F5A0',
  },
  {
    num: '02',
    title: 'IA detecta tus patrones',
    desc: 'Nuestro motor de inteligencia artificial analiza semanas de datos para identificar qué factores te afectan más y cuándo.',
    accent: '#00D4FF',
  },
  {
    num: '03',
    title: '1 micro-acción personalizada',
    desc: 'Recibes una sola acción concreta para ese día — no 10 consejos genéricos. Una acción que puedes ejecutar en menos de 15 minutos.',
    accent: '#00F5A0',
  },
  {
    num: '04',
    title: 'Tu squad de vida',
    desc: 'Grupos privados de máximo 10 personas con objetivos similares. Accountability real, sin redes sociales tóxicas.',
    accent: '#00D4FF',
  },
]

// ── Waitlist Form Component ───────────────────────────────
function WaitlistForm({ compact = false }) {
  const { status, count, error, submit, reset } = useWaitlist()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [problem, setProblem] = useState('')
  const [step, setStep] = useState(1) // 1=email, 2=details

  const handleStep1 = (e) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return
    setStep(2)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submit({ email, name, problem })
  }

  if (status === 'success') {
    return (
      <div className="form-success">
        <div className="success-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#00F5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="success-title">¡Estás en la lista! 🚀</h3>
        <p className="success-body">
          Revisa tu email — te enviamos una confirmación.<br />
          {count && <span className="success-count">Eres el participante <strong>#{count}</strong> en la lista de espera.</span>}
        </p>
        <p className="success-share">
          Comparte LifeOS con alguien que necesite esto:
        </p>
        <div className="share-buttons">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Acabo de unirme a la lista de espera de LifeOS — el sistema operativo personal que resuelve estrés, burnout y finanzas de una vez. ¿Te unes? 👇')}&url=${encodeURIComponent('https://lifeos.app')}`}
            target="_blank" rel="noopener noreferrer"
            className="share-btn share-x"
          >
            X / Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://lifeos.app')}`}
            target="_blank" rel="noopener noreferrer"
            className="share-btn share-li"
          >
            LinkedIn
          </a>
        </div>
      </div>
    )
  }

  if (status === 'duplicate') {
    return (
      <div className="form-success">
        <div className="success-icon" style={{ background: 'rgba(0,194,255,0.12)', borderColor: 'rgba(0,194,255,0.3)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#00C2FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="success-title" style={{ color: '#00C2FF' }}>¡Ya estás registrado!</h3>
        <p className="success-body">Este email ya está en nuestra lista de espera. Te avisaremos cuando lancemos.</p>
        <button className="btn-ghost-sm" onClick={reset}>Usar otro email</button>
      </div>
    )
  }

  if (status === 'ratelimit') {
    return (
      <div className="form-success">
        <div className="success-icon" style={{ background: 'rgba(245,200,66,0.1)', borderColor: 'rgba(245,200,66,0.3)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F5C842" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="success-title" style={{ color: '#F5C842' }}>Un momento</h3>
        <p className="success-body">Por favor espera un minuto antes de volver a intentarlo.</p>
        <button className="btn-ghost-sm" onClick={reset}>Intentar de nuevo</button>
      </div>
    )
  }

  return (
    <form className={`waitlist-form ${compact ? 'compact' : ''}`} onSubmit={step === 1 ? handleStep1 : handleSubmit}>
      {step === 1 ? (
        <div className="form-step">
          <div className="input-group">
            <input
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={status === 'loading'}
            />
            <button type="submit" className="form-btn" disabled={!email || status === 'loading'}>
              {status === 'loading' ? <span className="btn-spinner" /> : 'Unirme →'}
            </button>
          </div>
          <p className="form-disclaimer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Sin spam. Sin cargo. Solo acceso anticipado.
          </p>
        </div>
      ) : (
        <div className="form-step form-step2">
          <p className="step2-back" onClick={() => setStep(1)}>← Cambiar email</p>
          <p className="step2-email-show">✓ {email}</p>
          <input
            type="text"
            className="form-input"
            placeholder="Tu nombre (opcional)"
            value={name}
            onChange={e => setName(e.target.value)}
            autoComplete="given-name"
            disabled={status === 'loading'}
          />
          <select
            className="form-input form-select"
            value={problem}
            onChange={e => setProblem(e.target.value)}
            disabled={status === 'loading'}
          >
            <option value="">¿Cuál es tu mayor desafío? (opcional)</option>
            {PROBLEMS.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
            ))}
          </select>
          {error && <p className="form-error">⚠️ {error}</p>}
          <button type="submit" className="form-btn form-btn-full" disabled={status === 'loading'}>
            {status === 'loading'
              ? <><span className="btn-spinner" /> Guardando...</>
              : '🚀 Confirmar mi lugar en la lista'}
          </button>
        </div>
      )}
    </form>
  )
}

// ── Counter animation hook ────────────────────────────────
function useCountUp(target, duration = 1500) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const step = target / (duration / 16)
          const timer = setInterval(() => {
            start += step
            if (start >= target) { setValue(target); clearInterval(timer) }
            else setValue(Math.floor(start))
          }, 16)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return [value, ref]
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeProblem, setActiveProblem] = useState(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="app">

      {/* ── NAVBAR ── */}
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <LogoMark size={32} />
            <span className="nav-wordmark">LifeOS</span>
          </a>
          <div className="nav-links">
            <a href="#problems" className="nav-link">Problemas</a>
            <a href="#how" className="nav-link">Cómo funciona</a>
            <a href="#waitlist" className="nav-link">Lista de espera</a>
          </div>
          <a href="#waitlist" className="nav-cta">Acceso anticipado</a>
          <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span /><span /><span />
          </button>
        </div>
        {menuOpen && (
          <div className="nav-mobile">
            <a href="#problems" onClick={() => setMenuOpen(false)}>Problemas</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>Cómo funciona</a>
            <a href="#waitlist" onClick={() => setMenuOpen(false)}>Lista de espera</a>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-grid" />
        </div>

        <div className="hero-inner">
          <div className="hero-badge">
            <span className="badge-dot-anim" />
            Fase 0 — Lista de Espera Abierta
          </div>

          <h1 className="hero-title">
            El sistema operativo<br />
            <span className="hero-title-grad">para tu vida.</span>
          </h1>

          <p className="hero-subtitle">
            Un check-in de 2 minutos. IA que detecta tus patrones.
            Una micro-acción que cambia tu día. Los 10 desafíos
            más comunes del ser humano moderno — resueltos en una sola app.
          </p>

          <WaitlistForm />

          <div className="hero-social-proof">
            <div className="avatars">
              {['D','M','A','R','L'].map((l, i) => (
                <div key={i} className="avatar-sm" style={{ background: `hsl(${160 + i * 20},80%,35%)`, marginLeft: i ? -8 : 0 }}>{l}</div>
              ))}
            </div>
            <p className="social-proof-text">
              Únete a los primeros en transformar su vida
            </p>
          </div>
        </div>

        {/* Mini app preview */}
        <div className="hero-mockup">
          <div className="mockup-phone">
            <div className="phone-notch" />
            <div className="phone-screen">
              <div className="ps-header">
                <LogoMark size={22} />
                <span className="ps-greeting">Buenos días, Darwin</span>
              </div>
              <div className="ps-date">// Lunes · 02 Jun 2026</div>
              <div className="ps-title">Tu semana comienza<br /><em>con claridad.</em></div>
              <div className="ps-stats">
                <div className="ps-stat"><span className="ps-stat-v green">7.5</span><span className="ps-stat-l">Ánimo</span></div>
                <div className="ps-stat"><span className="ps-stat-v blue">6h40</span><span className="ps-stat-l">Sueño</span></div>
                <div className="ps-stat"><span className="ps-stat-v white">Medio</span><span className="ps-stat-l">Estrés</span></div>
              </div>
              <div className="ps-action">
                <div className="ps-action-tag">⚡ Micro-acción de hoy</div>
                <div className="ps-action-title">Bloquea 20min sin pantallas después del almuerzo</div>
                <div className="ps-action-sub">Tu estrés sube 40% entre 1–3pm según tus datos.</div>
              </div>
              <div className="ps-bars">
                <div className="ps-bar-row">
                  <span>Bienestar</span>
                  <div className="ps-bar-track"><div className="ps-bar-fill" style={{ width: '72%' }} /></div>
                  <span className="ps-bar-pct green">72%</span>
                </div>
                <div className="ps-bar-row">
                  <span>Finanzas</span>
                  <div className="ps-bar-track"><div className="ps-bar-fill blue" style={{ width: '61%' }} /></div>
                  <span className="ps-bar-pct blue">61%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="stats-band">
        <div className="stats-inner">
          {STATS.map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMS ── */}
      <section className="problems" id="problems">
        <div className="section-inner">
          <div className="section-eyebrow">// Los 10 Desafíos</div>
          <h2 className="section-title">
            ¿Te identificas con<br />
            <span className="grad-text">alguno de estos?</span>
          </h2>
          <p className="section-sub">
            LifeOS fue construido específicamente para atacar cada uno de estos problemas
            que enfrenta el ser humano en el mundo moderno.
          </p>

          <div className="problems-grid">
            {PROBLEMS.map((p, i) => (
              <div
                key={p.id}
                className={`problem-card ${activeProblem === p.id ? 'active' : ''}`}
                onClick={() => setActiveProblem(activeProblem === p.id ? null : p.id)}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="pc-icon">{p.icon}</div>
                <div className="pc-content">
                  <div className="pc-label">{p.label}</div>
                  <div className="pc-short">{p.short}</div>
                </div>
                <div className="pc-num">0{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <div className="section-inner">
          <div className="section-eyebrow">// Cómo funciona</div>
          <h2 className="section-title">
            Simple por diseño.<br />
            <span className="grad-text">Poderoso por datos.</span>
          </h2>

          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={i} className="step-card" style={{ '--accent': s.accent }}>
                <div className="step-num">{s.num}</div>
                <div className="step-connector" />
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features">
        <div className="section-inner">
          <div className="section-eyebrow">// Qué incluye</div>
          <h2 className="section-title">Todo en un solo lugar.</h2>

          <div className="features-grid">
            {[
              { icon: '🧠', title: 'IA Coach Personal', desc: 'Analiza tus patrones semana a semana y aprende qué funciona específicamente para ti.' },
              { icon: '💰', title: 'Tracker Financiero', desc: 'Vincula estrés emocional con hábitos de gasto. Entiende el por qué de tus decisiones.' },
              { icon: '👥', title: 'Squad Privado', desc: 'Grupos de 10 personas máximo con objetivos similares. Accountability real, sin ruido.' },
              { icon: '🌙', title: 'Monitor de Sueño', desc: 'Correlaciona calidad de sueño con tu rendimiento laboral y estado emocional diario.' },
              { icon: '📊', title: 'Dashboard de Vida', desc: 'Visualiza los 10 pilares de tu bienestar en un solo panel. Datos claros, decisiones mejores.' },
              { icon: '🔕', title: 'Modo Desconexión', desc: 'Bloquea apps en momentos clave. Recupera tu atención. Mide tu tiempo de pantalla real.' },
              { icon: '🎯', title: 'Propósito & Metas', desc: 'Clarifica tu visión de vida con ejercicios guiados. Sin coaches caros, con resultados reales.' },
              { icon: '❤️', title: 'Relaciones Sanas', desc: 'Guías para mejorar comunicación y construir vínculos que te nutran, no te drenen.' },
            ].map((f, i) => (
              <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.06}s` }}>
                <div className="fc-icon">{f.icon}</div>
                <h3 className="fc-title">{f.title}</h3>
                <p className="fc-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA / WAITLIST ── */}
      <section className="waitlist-section" id="waitlist">
        <div className="waitlist-bg">
          <div className="wl-orb wl-orb1" />
          <div className="wl-orb wl-orb2" />
        </div>
        <div className="waitlist-inner">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>// Acceso Anticipado</div>
          <h2 className="wl-title">
            Sé el primero en<br />
            <span className="grad-text">operar tu vida.</span>
          </h2>
          <p className="wl-sub">
            Los primeros 500 en la lista obtienen acceso beta gratuito por 3 meses
            y precio fundador de por vida. Sin tarjeta de crédito.
          </p>

          <div className="wl-perks">
            {[
              '✓ Acceso beta 3 meses gratis',
              '✓ Precio fundador de por vida',
              '✓ Influencia directa en las features',
              '✓ Acceso prioritario al squad premium',
            ].map((p, i) => (
              <div key={i} className="wl-perk">{p}</div>
            ))}
          </div>

          <div className="wl-form-wrap">
            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <LogoMark size={28} />
            <span className="footer-wordmark">LifeOS</span>
          </div>
          <p className="footer-tagline">Your Personal Operating System.</p>
          <div className="footer-links">
            <a href="mailto:hello@lifeos.app">hello@lifeos.app</a>
            <span>·</span>
            <a href="#waitlist">Lista de espera</a>
            <span>·</span>
            <a href="#problems">10 Desafíos</a>
          </div>
          <p className="footer-copy">
            © 2026 LifeOS. Construido con propósito en South Florida.
          </p>
        </div>
      </footer>

    </div>
  )
}
