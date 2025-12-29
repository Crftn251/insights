# Vercel Deployment Anleitung

## Option 1: Vercel CLI (Schnell)

### 1. Vercel CLI installieren
```bash
npm install -g vercel
```

### 2. Login bei Vercel
```bash
vercel login
```

### 3. Projekt deployen
```bash
vercel
```

Folge den Anweisungen:
- Set up and deploy? **Y**
- Which scope? Wähle deinen Account
- Link to existing project? **N** (für neues Projekt)
- Project name? **insights** (oder wie du willst)
- Directory? **./** (Enter)
- Override settings? **N**

### 4. Environment Variables setzen

Nach dem ersten Deploy musst du die Environment Variables in Vercel setzen:

1. Gehe zu https://vercel.com/dashboard
2. Wähle dein Projekt
3. **Settings** → **Environment Variables**
4. Füge hinzu:

```
NEXT_PUBLIC_SUPABASE_URL=https://kpwiyohezaghpdryaayv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwd2l5b2hlemFnaHBkcnlhYXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDYyMzEsImV4cCI6MjA4MjU4MjIzMX0.O4dARaB7eE8yd6UijBbOmVEEjLc_n_yPZNjiLaliTNA
SUPABASE_SERVICE_ROLE_KEY=DEIN_SERVICE_ROLE_KEY
META_APP_ID=877184334699544
META_APP_SECRET=807fa92af6e744a435bee3ed4ae7ce6c
META_REDIRECT_URI=https://deine-domain.vercel.app/api/meta/callback
MOCK_META=false
CRON_SECRET=dein-zufaelliger-secret-string
```

⚠️ **WICHTIG**: 
- Ersetze `DEIN_SERVICE_ROLE_KEY` mit dem echten Service Role Key
- Ersetze `https://deine-domain.vercel.app` mit deiner tatsächlichen Vercel Domain
- Ersetze `dein-zufaelliger-secret-string` mit einem sicheren Secret

### 5. Production Deploy
```bash
vercel --prod
```

---

## Option 2: GitHub + Vercel Integration (Empfohlen)

### 1. GitHub Repository erstellen

1. Gehe zu https://github.com
2. Klicke auf **New Repository**
3. Name: `insights` (oder wie du willst)
4. **NICHT** "Initialize with README" auswählen
5. Klicke auf **Create repository**

### 2. Code zu GitHub pushen

```bash
# Remote hinzufügen (ersetze USERNAME und REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Branch umbenennen (falls nötig)
git branch -M main

# Code pushen
git push -u origin main
```

### 3. Vercel Projekt erstellen

1. Gehe zu https://vercel.com
2. Klicke auf **Add New** → **Project**
3. **Import Git Repository**
4. Wähle dein GitHub Repository
5. Klicke auf **Import**

### 4. Vercel Konfiguration

- **Framework Preset**: Next.js (sollte automatisch erkannt werden)
- **Root Directory**: `./` (Enter)
- **Build Command**: `npm run build` (automatisch)
- **Output Directory**: `.next` (automatisch)

### 5. Environment Variables setzen

Vor dem ersten Deploy:

1. In Vercel → **Environment Variables**
2. Füge alle Variablen hinzu (siehe oben)
3. ⚠️ **WICHTIG**: Aktualisiere `META_REDIRECT_URI` auf deine Vercel Domain:
   ```
   META_REDIRECT_URI=https://dein-projekt.vercel.app/api/meta/callback
   ```

### 6. Deploy

Klicke auf **Deploy** - Vercel deployt automatisch!

---

## Nach dem Deployment

### 1. Supabase Auth URLs aktualisieren

1. Im Supabase Dashboard → **Authentication** → **URL Configuration**
2. Füge deine Vercel Domain hinzu:
   - **Site URL**: `https://dein-projekt.vercel.app`
   - **Redirect URLs**: `https://dein-projekt.vercel.app/**`

### 2. Meta App Redirect URI aktualisieren

1. Im Meta App Dashboard → **Settings** → **Basic**
2. Füge zu **Valid OAuth Redirect URIs** hinzu:
   ```
   https://dein-projekt.vercel.app/api/meta/callback
   ```

### 3. Testen

1. Öffne deine Vercel URL
2. Registriere dich
3. Klicke auf "Meta verbinden"
4. Teste die Synchronisierung

---

## Vercel Cron (Automatische Synchronisierung)

Die `vercel.json` ist bereits konfiguriert für tägliche Synchronisierung um 06:00 UTC.

**Manuelle Ausführung:**
```bash
curl -X GET "https://dein-projekt.vercel.app/api/cron/sync" \
  -H "Authorization: Bearer dein-cron-secret"
```

---

## Troubleshooting

### Build Fehler
- Prüfe, ob alle Environment Variables gesetzt sind
- Prüfe Vercel Logs: Dashboard → Deployments → Logs

### 404 Fehler
- Prüfe, ob alle Routen korrekt sind
- Prüfe Next.js Build Output

### OAuth Fehler
- Prüfe Redirect URI in Meta App
- Prüfe `META_REDIRECT_URI` in Vercel Environment Variables

---

Viel Erfolg! 🚀

