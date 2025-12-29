# Setup Checkliste - Schritt für Schritt

## ✅ Sofort starten (ohne Meta Setup)

### 1. Dependencies installieren
```bash
cd "/Volumes/T7/Arbeit /Projekte Cursor/Insights"
npm install
```

### 2. Supabase Projekt erstellen
1. Gehe zu https://supabase.com
2. Klicke auf "New Project"
3. Wähle Organisation oder erstelle eine neue
4. Gib Projektname ein (z.B. "insights")
5. Wähle Region (z.B. Frankfurt)
6. Wähle Passwort für Datenbank
7. Warte bis Projekt erstellt ist (~2 Minuten)

### 3. Supabase Credentials notieren
1. Im Supabase Dashboard → **Settings** → **API**
2. Kopiere:
   - **Project URL** (z.B. `https://xxxxx.supabase.co`)
   - **anon public key** (beginnt mit `eyJ...`)
   - **service_role key** (beginnt mit `eyJ...`) - ⚠️ Geheim halten!

### 4. SQL Migrations ausführen
1. Im Supabase Dashboard → **SQL Editor**
2. Klicke auf **New Query**
3. Öffne `supabase/migrations/001_initial_schema.sql` in deinem Editor
4. Kopiere den gesamten Inhalt
5. Füge ihn in den SQL Editor ein
6. Klicke auf **Run** (oder Cmd/Ctrl + Enter)
7. Wiederhole für `supabase/migrations/002_rls_policies.sql`

✅ **Prüfen**: Gehe zu **Table Editor** - du solltest 7 Tabellen sehen:
- profiles
- connected_accounts
- pages
- ig_accounts
- daily_metrics
- posts
- post_metrics_daily

### 5. Supabase Auth konfigurieren
1. Im Supabase Dashboard → **Authentication** → **URL Configuration**
2. Setze **Site URL**: `http://localhost:3000`
3. Füge **Redirect URLs** hinzu:
   - `http://localhost:3000/**`
   - `http://localhost:3000/dashboard`

### 6. Environment Variables erstellen
Erstelle `.env.local` im Projekt-Root:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Mock Mode aktivieren (für Test ohne Meta)
MOCK_META=true

# Meta (später ausfüllen)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=http://localhost:3000/api/meta/callback

# Optional
CRON_SECRET=dein-zufaelliger-string-hier
```

### 7. App starten
```bash
npm run dev
```

Öffne http://localhost:3000

### 8. Test mit Mock Mode
1. Klicke auf **Register** und erstelle einen Account
2. Nach Login → Dashboard
3. Klicke auf **Mock Daten** Button
4. Warte ~5 Sekunden
5. Dashboard sollte jetzt mit Daten gefüllt sein! 🎉

---

## 🔗 Meta Graph API Setup (für echte Daten)

### 9. Meta App erstellen
1. Gehe zu https://developers.facebook.com
2. Klicke auf **My Apps** → **Create App**
3. Wähle **Business** als App-Typ
4. Gib App-Namen ein (z.B. "Insights Dashboard")
5. Optional: App Icon hochladen

### 10. Facebook Login hinzufügen
1. Im App Dashboard → **Add Product**
2. Suche nach **Facebook Login**
3. Klicke auf **Set Up**

### 11. OAuth Redirect URIs konfigurieren
1. Im App Dashboard → **Settings** → **Basic**
2. Scrolle zu **Valid OAuth Redirect URIs**
3. Füge hinzu:
   - `http://localhost:3000/api/meta/callback` (Entwicklung)
   - `https://your-domain.vercel.app/api/meta/callback` (später für Produktion)

### 12. App Credentials notieren
1. Im App Dashboard → **Settings** → **Basic**
2. Kopiere:
   - **App ID**
   - **App Secret** (klicke auf "Show")

### 13. Permissions beantragen
1. Im App Dashboard → **App Review** → **Permissions and Features**
2. Beantrage folgende Permissions:
   - ✅ `pages_read_engagement`
   - ✅ `pages_read_user_content`
   - ✅ `pages_show_list`
   - ✅ `instagram_basic`
   - ✅ `instagram_manage_insights`
   - ✅ `business_management`

⚠️ **Wichtig**: Für Entwicklung kannst du Test-User hinzufügen:
- **Roles** → **Test Users** → **Add Test Users**

### 14. Environment Variables aktualisieren
Aktualisiere `.env.local`:

```bash
META_APP_ID=deine_app_id
META_APP_SECRET=dein_app_secret
MOCK_META=false  # Deaktivieren für echte Daten
```

### 15. Meta Account verbinden
1. Im Dashboard → **Meta verbinden**
2. Du wirst zu Facebook weitergeleitet
3. Erlaube die Permissions
4. Wähle die Facebook Page aus
5. Nach Callback → automatische Synchronisierung

---

## 🚀 Vercel Deployment

### 16. Code zu GitHub pushen
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/dein-username/insights.git
git push -u origin main
```

### 17. Vercel Projekt erstellen
1. Gehe zu https://vercel.com
2. Klicke auf **Add New** → **Project**
3. Importiere dein GitHub Repository
4. Framework Preset: **Next.js**
5. Klicke auf **Deploy**

### 18. Environment Variables in Vercel setzen
1. Im Vercel Dashboard → **Settings** → **Environment Variables**
2. Füge alle Variablen aus `.env.local` hinzu
3. ⚠️ **Wichtig**: Aktualisiere `META_REDIRECT_URI` auf deine Vercel URL:
   ```
   META_REDIRECT_URI=https://your-app.vercel.app/api/meta/callback
   ```

### 19. Supabase Auth URLs aktualisieren
1. Im Supabase Dashboard → **Authentication** → **URL Configuration**
2. Füge deine Vercel URL hinzu:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

### 20. Meta App Redirect URI aktualisieren
1. Im Meta App Dashboard → **Settings** → **Basic**
2. Füge hinzu: `https://your-app.vercel.app/api/meta/callback`

### 21. Vercel Cron konfigurieren
Die `vercel.json` ist bereits konfiguriert. Für manuelle Ausführung:

```bash
curl -X GET "https://your-app.vercel.app/api/cron/sync" \
  -H "Authorization: Bearer dein-cron-secret"
```

---

## ✅ Checkliste

- [ ] Dependencies installiert (`npm install`)
- [ ] Supabase Projekt erstellt
- [ ] SQL Migrations ausgeführt
- [ ] Supabase Auth URLs konfiguriert
- [ ] `.env.local` erstellt
- [ ] App läuft lokal (`npm run dev`)
- [ ] Mock Daten getestet
- [ ] Meta App erstellt (optional)
- [ ] Meta Permissions beantragt (optional)
- [ ] Code zu GitHub gepusht
- [ ] Vercel Deployment
- [ ] Environment Variables in Vercel gesetzt
- [ ] URLs aktualisiert (Supabase + Meta)

---

## 🐛 Häufige Probleme

### "Unauthorized" Fehler
- Prüfe, ob Supabase Credentials korrekt sind
- Prüfe, ob RLS Policies korrekt ausgeführt wurden

### "Failed to fetch" im Dashboard
- Prüfe Browser Console für Fehler
- Prüfe, ob API Routes erreichbar sind
- Prüfe Supabase Connection

### Meta OAuth Fehler
- Prüfe Redirect URI in Meta App Settings
- Prüfe, ob App ID und Secret korrekt sind
- Prüfe, ob Permissions beantragt wurden

### Keine Daten nach Sync
- Prüfe, ob Instagram Account Business Account ist
- Prüfe, ob Page mit Instagram verknüpft ist
- Prüfe Meta App Permissions

---

## 📞 Nächste Schritte nach Setup

1. **Teste Mock Mode** - Schnellste Möglichkeit, Dashboard zu sehen
2. **Verbinde Meta Account** - Für echte Daten
3. **Customize Dashboard** - Passe UI nach Bedarf an
4. **Erweitere Features** - Z.B. Export, Alerts, etc.

Viel Erfolg! 🚀

