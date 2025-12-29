# Projektstruktur

## Wichtige Dateien

### Supabase Migrations
- `supabase/migrations/001_initial_schema.sql` - Tabellen-Schema
- `supabase/migrations/002_rls_policies.sql` - Row Level Security Policies

### Supabase Client Setup
- `lib/supabase/client.ts` - Browser Client
- `lib/supabase/server.ts` - Server Client + Service Role Client
- `middleware.ts` - Auth Middleware für Route Protection

### Meta Graph API
- `lib/meta/client.ts` - MetaGraphClient (server-only)
- `lib/meta/sync.ts` - Synchronisierungs-Logik

### API Routes
- `app/api/meta/start/route.ts` - OAuth Start
- `app/api/meta/callback/route.ts` - OAuth Callback
- `app/api/sync/route.ts` - Manuelle Synchronisierung
- `app/api/cron/sync/route.ts` - Cron Synchronisierung
- `app/api/kpis/route.ts` - KPI Daten
- `app/api/timeseries/route.ts` - Zeitreihen-Daten
- `app/api/posts/route.ts` - Posts Daten
- `app/api/accounts/route.ts` - Accounts Liste
- `app/api/mock/seed/route.ts` - Mock Data Seed

### Dashboard UI
- `app/dashboard/page.tsx` - Haupt-Dashboard
- `components/KPICard.tsx` - KPI Card Komponente
- `components/AccountSwitcher.tsx` - Account Auswahl
- `components/DateRangePicker.tsx` - Datumsbereich Auswahl
- `components/MetricsChart.tsx` - Recharts Chart
- `components/PostsTable.tsx` - Posts Tabelle

### Auth
- `app/login/page.tsx` - Login Seite
- `app/register/page.tsx` - Registrierung Seite

### Config
- `vercel.json` - Vercel Cron Konfiguration
- `next.config.js` - Next.js Konfiguration
- `tailwind.config.ts` - Tailwind CSS Konfiguration

## Datenbank-Schema

### Core Tabellen
- `profiles` - User Profile (1:1 mit auth.users)
- `connected_accounts` - OAuth Tokens (Meta)
- `pages` - Facebook Pages
- `ig_accounts` - Instagram Business Accounts

### Metrics Tabellen
- `daily_metrics` - Tägliche Metriken (Impressions, Reach, etc.)
- `posts` - Posts/Media
- `post_metrics_daily` - Tägliche Post-Metriken

## Sicherheit

- Row Level Security (RLS) auf allen Tabellen aktiviert
- Policies: User kann nur eigene Daten sehen/bearbeiten
- Service Role Key nur serverseitig verwendet
- Tokens werden nie an Client gesendet

## Deployment

1. Supabase Projekt erstellen
2. SQL Migrations ausführen
3. Meta App erstellen und konfigurieren
4. Environment Variables in Vercel setzen
5. Deploy auf Vercel

Siehe `README.md` für detaillierte Anleitung.

