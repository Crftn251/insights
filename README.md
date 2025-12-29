# Insights - Social Media Analytics Dashboard

Eine moderne, produktionsnahe Web-App zur Synchronisierung und Visualisierung von Instagram- und Facebook-Daten über die Meta Graph API.

## Tech-Stack

- **Frontend/Backend**: Next.js 15 (App Router) + TypeScript
- **UI**: TailwindCSS + Recharts
- **Data Fetching**: TanStack Query
- **Database**: Supabase Postgres (SQL Migrations + Row Level Security)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Features

- ✅ OAuth-Integration mit Meta Graph API
- ✅ Automatische Synchronisierung von Facebook Pages und Instagram Business Accounts
- ✅ Dashboard mit KPIs, Charts und Post-Analysen
- ✅ Mock Mode für Entwicklung ohne Meta Setup
- ✅ Row Level Security (RLS) für Datenzugriff
- ✅ Automatische Cron-Synchronisierung

## Setup

### 1. Supabase Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Notiere dir die **Project URL** und **anon key** aus den Project Settings → API

### 2. SQL Migrations ausführen

Führe die SQL-Migrationsdateien in der Supabase SQL Editor aus:

1. Öffne dein Supabase Projekt
2. Gehe zu **SQL Editor**
3. Führe `supabase/migrations/001_initial_schema.sql` aus
4. Führe `supabase/migrations/002_rls_policies.sql` aus

Alternativ mit Supabase CLI:

```bash
supabase db push
```

### 3. Supabase Auth URLs konfigurieren

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (für Entwicklung) oder deine Vercel URL
- **Redirect URLs**: 
  - `http://localhost:3000/**`
  - `https://your-domain.vercel.app/**`

### 4. Meta App Setup

1. Gehe zu [developers.facebook.com](https://developers.facebook.com)
2. Erstelle eine neue App (Typ: "Business")
3. Füge das **Facebook Login** Produkt hinzu
4. In **Settings → Basic**:
   - Notiere **App ID** und **App Secret**
   - Füge **Valid OAuth Redirect URIs** hinzu:
     - `http://localhost:3000/api/meta/callback` (Entwicklung)
     - `https://your-domain.vercel.app/api/meta/callback` (Produktion)
5. In **App Review → Permissions and Features** beantrage folgende Permissions:
   - `pages_read_engagement`
   - `pages_read_user_content`
   - `pages_show_list`
   - `instagram_basic`
   - `instagram_manage_insights`
   - `business_management`

**Wichtig**: Für Instagram Business Accounts benötigst du:
- Eine Facebook Page
- Die Page muss mit einem Instagram Business Account verknüpft sein
- Der Instagram Account muss ein Business Account sein (nicht Creator Account)

### 5. Environment Variables

Erstelle eine `.env.local` Datei (für lokale Entwicklung):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=http://localhost:3000/api/meta/callback

# Optional: Mock Mode (generiert Test-Daten ohne Meta Setup)
MOCK_META=false

# Optional: Cron Secret für automatische Synchronisierung
CRON_SECRET=your_random_secret_string
```

### 6. Lokale Entwicklung

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die App läuft auf [http://localhost:3000](http://localhost:3000)

### 7. Mock Mode (optional)

Wenn `MOCK_META=true` gesetzt ist:
1. Registriere dich in der App
2. Klicke auf "Mock Daten" im Dashboard
3. Es werden 90 Tage Metriken und 30 Posts generiert

## Vercel Deployment

### 1. Repository zu Vercel verbinden

1. Push dein Code zu GitHub/GitLab/Bitbucket
2. Gehe zu [vercel.com](https://vercel.com) und verbinde dein Repository
3. Wähle das Projekt aus

### 2. Environment Variables in Vercel setzen

In Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_REDIRECT_URI=https://your-domain.vercel.app/api/meta/callback

MOCK_META=false
CRON_SECRET=your_random_secret_string
```

**Wichtig**: 
- `META_REDIRECT_URI` muss deine Vercel Domain verwenden
- `SUPABASE_SERVICE_ROLE_KEY` nur für Server-seitige Operationen (nie im Client)

### 3. Supabase Auth URLs aktualisieren

Füge deine Vercel Domain zu den Redirect URLs in Supabase hinzu:
- `https://your-domain.vercel.app/**`

### 4. Meta App Redirect URI aktualisieren

Füge deine Vercel Callback URL zu den Valid OAuth Redirect URIs in der Meta App hinzu:
- `https://your-domain.vercel.app/api/meta/callback`

### 5. Deploy

Vercel deployt automatisch bei jedem Push. Oder manuell:

```bash
vercel --prod
```

### 6. Vercel Cron konfigurieren

Die `vercel.json` ist bereits konfiguriert für tägliche Synchronisierung um 06:00 UTC.

**Optional**: Für manuelle Cron-Ausführung:

```bash
curl -X GET "https://your-domain.vercel.app/api/cron/sync" \
  -H "Authorization: Bearer your_cron_secret"
```

## Häufige Stolpersteine

### Long-Lived Tokens

- Meta Short-Lived Tokens (1-2 Stunden) werden automatisch zu Long-Lived Tokens (60 Tage) getauscht
- Tokens müssen regelmäßig erneuert werden (vor Ablauf)
- Implementiere Token-Refresh-Logik für Produktion

### Instagram Business Account Voraussetzungen

- Facebook Page muss existieren
- Instagram Account muss als Business Account konvertiert sein
- Page und Instagram Account müssen verknüpft sein
- In Meta Business Manager verwalten

### Rate Limits

- Meta Graph API hat Rate Limits (je nach App-Typ)
- Implementiere Retry-Logik mit Exponential Backoff
- Nutze Batch-Requests wo möglich

### Permissions

- Einige Permissions benötigen App Review von Meta
- Für Entwicklung: Nutze Test-User und Test-Pages
- Für Produktion: Beantrage alle benötigten Permissions

## Projektstruktur

```
.
├── app/
│   ├── api/
│   │   ├── kpis/          # KPI API Route
│   │   ├── timeseries/    # Timeseries API Route
│   │   ├── posts/         # Posts API Route
│   │   ├── meta/
│   │   │   ├── start/     # OAuth Start
│   │   │   └── callback/  # OAuth Callback
│   │   ├── sync/          # Manual Sync
│   │   ├── cron/
│   │   │   └── sync/      # Cron Sync
│   │   └── mock/
│   │       └── seed/      # Mock Data Seed
│   ├── dashboard/         # Dashboard Page
│   ├── login/             # Login Page
│   ├── register/          # Register Page
│   └── layout.tsx
├── components/            # React Components
├── lib/
│   ├── supabase/         # Supabase Clients
│   ├── meta/             # Meta Graph API Client
│   └── mock/             # Mock Data Generator
├── supabase/
│   └── migrations/       # SQL Migrations
└── vercel.json           # Vercel Config
```

## Meta Graph API Permissions

Benötigte Permissions (alle müssen beantragt werden):

- `pages_read_engagement` - Page Engagement lesen
- `pages_read_user_content` - Page Content lesen
- `pages_show_list` - Pages auflisten
- `instagram_basic` - Instagram Basic Info
- `instagram_manage_insights` - Instagram Insights
- `business_management` - Business Management

## Entwicklung

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint
```

## License

MIT

