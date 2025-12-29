# Troubleshooting - Fehlerbehebung

## ❌ Fehler: "relation 'profiles' does not exist"

### Problem
Die Tabellen wurden noch nicht erstellt oder die Migration ist fehlgeschlagen.

### Lösung

**Option 1: Komplette Migration ausführen (Empfohlen)**

1. Im Supabase Dashboard → **SQL Editor**
2. Öffne `supabase/migrations/000_complete_setup.sql`
3. Kopiere den **gesamten Inhalt**
4. Füge ihn in den SQL Editor ein
5. Klicke auf **Run** (oder Cmd/Ctrl + Enter)
6. Warte auf Erfolgsmeldung: "Success. No rows returned"

**Option 2: Schritt für Schritt**

1. Führe zuerst `001_initial_schema.sql` aus
2. Prüfe, ob Tabellen erstellt wurden (siehe unten)
3. Dann führe `002_rls_policies.sql` aus

### Prüfen ob Tabellen existieren

Führe diese Query im SQL Editor aus:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles',
    'connected_accounts',
    'pages',
    'ig_accounts',
    'daily_metrics',
    'posts',
    'post_metrics_daily'
  )
ORDER BY table_name;
```

Du solltest **7 Tabellen** sehen:
- connected_accounts
- daily_metrics
- ig_accounts
- pages
- post_metrics_daily
- posts
- profiles

### Wenn Tabellen fehlen

1. Prüfe die Fehlermeldung in der SQL Editor History
2. Häufige Probleme:
   - **"permission denied"** → Prüfe, ob du als Owner eingeloggt bist
   - **"extension uuid-ossp does not exist"** → Führe zuerst `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` aus
   - **"relation auth.users does not exist"** → Supabase Auth ist nicht aktiviert

---

## ❌ Fehler: "permission denied for table"

### Problem
RLS Policies blockieren den Zugriff.

### Lösung

1. Prüfe, ob RLS aktiviert ist:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

2. Prüfe Policies:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

3. Falls Policies fehlen, führe `002_rls_policies.sql` erneut aus

---

## ❌ Fehler: "Failed to fetch" im Dashboard

### Problem
API Routes funktionieren nicht oder Supabase Connection fehlt.

### Lösung

1. **Prüfe Environment Variables:**
   - `.env.local` existiert?
   - `NEXT_PUBLIC_SUPABASE_URL` korrekt?
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` korrekt?

2. **Prüfe Browser Console:**
   - Öffne Developer Tools (F12)
   - Gehe zu Console Tab
   - Suche nach Fehlermeldungen

3. **Prüfe Network Tab:**
   - Gehe zu Network Tab
   - Lade Dashboard neu
   - Prüfe, ob API Calls fehlschlagen

4. **Teste Supabase Connection:**
```sql
-- Im SQL Editor
SELECT * FROM profiles LIMIT 1;
```

---

## ❌ Fehler: "Unauthorized" bei API Calls

### Problem
User ist nicht eingeloggt oder Session ist abgelaufen.

### Lösung

1. Prüfe, ob du eingeloggt bist:
   - Gehe zu `/dashboard`
   - Falls Redirect zu `/login` → nicht eingeloggt

2. Logge dich erneut ein

3. Prüfe Supabase Auth:
   - Im Supabase Dashboard → **Authentication** → **Users**
   - Siehst du deinen User?

---

## ❌ Fehler: Meta OAuth "redirect_uri_mismatch"

### Problem
Redirect URI in Meta App stimmt nicht überein.

### Lösung

1. Prüfe Meta App Settings:
   - developers.facebook.com → Deine App
   - **Settings** → **Basic**
   - **Valid OAuth Redirect URIs**

2. Füge exakt diese URL hinzu:
   - Entwicklung: `http://localhost:3000/api/meta/callback`
   - Produktion: `https://your-domain.vercel.app/api/meta/callback`

3. Prüfe `.env.local`:
   ```
   META_REDIRECT_URI=http://localhost:3000/api/meta/callback
   ```

---

## ❌ Fehler: "No accounts found" im Dashboard

### Problem
Keine Accounts verbunden oder Mock-Daten nicht erstellt.

### Lösung

**Option 1: Mock-Daten erstellen**

1. Setze `MOCK_META=true` in `.env.local`
2. Starte App neu: `npm run dev`
3. Im Dashboard → **Mock Daten** Button klicken
4. Warte ~5 Sekunden
5. Dashboard sollte Daten zeigen

**Option 2: Meta Account verbinden**

1. Klicke auf **Meta verbinden**
2. Folge OAuth Flow
3. Nach Callback → automatische Sync

---

## ❌ Fehler: "relation already exists"

### Problem
Tabellen existieren bereits, aber Migration versucht sie neu zu erstellen.

### Lösung

Die Migration verwendet `CREATE TABLE IF NOT EXISTS`, daher sollte dieser Fehler nicht auftreten.

Falls doch:
1. Prüfe, ob Tabellen existieren (siehe oben)
2. Falls ja, führe nur `002_rls_policies.sql` aus
3. Oder lösche Tabellen manuell (VORSICHT: Löscht Daten!):
```sql
DROP TABLE IF EXISTS post_metrics_daily CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS daily_metrics CASCADE;
DROP TABLE IF EXISTS ig_accounts CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS connected_accounts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
```

---

## ✅ Quick Check - Alles OK?

Führe diese Queries aus, um zu prüfen, ob alles korrekt ist:

```sql
-- 1. Tabellen existieren?
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'connected_accounts', 'pages', 'ig_accounts', 'daily_metrics', 'posts', 'post_metrics_daily');
-- Sollte: 7

-- 2. RLS aktiviert?
SELECT COUNT(*) FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true;
-- Sollte: 7

-- 3. Policies existieren?
SELECT COUNT(*) FROM pg_policies 
WHERE schemaname = 'public';
-- Sollte: 28 (4 policies × 7 tables)

-- 4. Indexes existieren?
SELECT COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%';
-- Sollte: 7
```

---

## 🆘 Noch Probleme?

1. Prüfe Supabase Logs:
   - Dashboard → **Logs** → **Postgres Logs**

2. Prüfe Next.js Logs:
   - Terminal wo `npm run dev` läuft

3. Prüfe Browser Console:
   - F12 → Console Tab

4. Prüfe Network Requests:
   - F12 → Network Tab → Prüfe fehlgeschlagene Requests

