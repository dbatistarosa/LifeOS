# LifeOS — Landing Page

> Your Personal Operating System · Fase 0 — Waitlist

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USER/lifeos-landing)

---

## 🛠️ Stack (todo gratis)

| Capa | Tecnología | Por qué |
|------|-----------|---------|
| Frontend | React 18 + Vite | Rápido, moderno, óptimo para SPA |
| Hosting | Vercel (free) | Deploy automático desde GitHub |
| Base de datos | Supabase (free) | PostgreSQL + RLS + Edge Functions |
| Email | Resend (free) | 3,000 emails/mes gratis, deliverability excelente |

---

## 🚀 Setup Paso a Paso

### 1️⃣ Supabase — Base de Datos

1. Ve a [supabase.com](https://supabase.com) → **New Project**
2. Pon nombre: `lifeos-landing`, elige región más cercana (US East)
3. En el dashboard, ve a **SQL Editor**
4. Copia y ejecuta todo el contenido de `supabase/migrations/001_create_waitlist.sql`
5. Ve a **Settings → API** y copia:
   - `Project URL` → será tu `VITE_SUPABASE_URL`
   - `anon public key` → será tu `VITE_SUPABASE_ANON_KEY`

### 2️⃣ Resend — Emails

1. Ve a [resend.com](https://resend.com) → **Sign Up** (gratis)
2. En **API Keys** → Create API Key → cópiala
3. En **Domains** → Add Domain → agrega tu dominio o usa el de prueba `@resend.dev`
4. Guarda la API key (la usarás en el siguiente paso)

### 3️⃣ Supabase Edge Function — Deploy

1. Instala Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login y linkea tu proyecto:
   ```bash
   supabase login
   supabase link --project-ref TU_PROJECT_ID
   ```

3. Agrega el secret de Resend:
   ```bash
   supabase secrets set RESEND_API_KEY=re_TU_API_KEY
   ```

4. Deploy la función:
   ```bash
   supabase functions deploy send-welcome-email
   ```

### 4️⃣ Variables de Entorno — Local

```bash
# Copia el template
cp .env.example .env.local

# Edita .env.local con tus valores reales:
VITE_SUPABASE_URL=https://XXXXX.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...
```

### 5️⃣ Correr en Local

```bash
npm install
npm run dev
# → http://localhost:5173
```

### 6️⃣ GitHub

```bash
git init
git add .
git commit -m "feat: initial LifeOS landing page"
git branch -M main
git remote add origin https://github.com/TU_USER/lifeos-landing.git
git push -u origin main
```

### 7️⃣ Vercel — Deploy

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Importa tu repo de GitHub `lifeos-landing`
3. Framework Preset: **Vite**
4. En **Environment Variables** agrega:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu anon key
5. Click **Deploy** → ¡listo! 🎉

---

## 📊 Ver tus Signups

En Supabase Dashboard → SQL Editor:

```sql
-- Ver todos los signups
SELECT email, name, top_problem, created_at
FROM waitlist
ORDER BY created_at DESC;

-- Ver estadísticas
SELECT
  COUNT(*) AS total,
  top_problem,
  COUNT(*) AS votes
FROM waitlist
GROUP BY top_problem
ORDER BY votes DESC;
```

---

## 🗂️ Estructura del Proyecto

```
lifeos-landing/
├── src/
│   ├── components/         # (para futuras expansiones)
│   ├── hooks/
│   │   └── useWaitlist.js  # Lógica de signup
│   ├── lib/
│   │   └── supabase.js     # Cliente de Supabase
│   ├── App.jsx             # Landing page completa
│   ├── App.css             # Estilos Aurora Dark
│   └── main.jsx            # Entry point
├── supabase/
│   ├── functions/
│   │   └── send-welcome-email/
│   │       └── index.ts    # Email con Resend
│   └── migrations/
│       └── 001_create_waitlist.sql
├── public/
│   └── favicon.svg
├── .env.example            # Template de variables
├── .gitignore
├── index.html
├── vercel.json
└── vite.config.js
```

---

## ✅ Checklist de Lanzamiento

- [ ] Supabase creado y migración ejecutada
- [ ] Resend configurado con dominio verificado
- [ ] Edge Function deployada con API key
- [ ] Variables de entorno en Vercel
- [ ] Repo en GitHub
- [ ] Deploy en Vercel funcionando
- [ ] Formulario testeado end-to-end
- [ ] Email de confirmación llegando

---

## 🔮 Siguiente Fase

Una vez validada la lista de espera (500+ emails), avanzamos a:
- **Fase 1:** Construcción del MVP con React Native
- **Fase 2:** Beta privada con los primeros 100 usuarios

---

Built with ❤️ in South Florida · LifeOS 2026
