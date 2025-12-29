# Schnell-Deploy zu Vercel

## Schritt 1: Login bei Vercel

```bash
vercel login
```

Folge den Anweisungen im Browser.

## Schritt 2: Deploy

```bash
vercel
```

Antworte auf die Fragen:
- **Set up and deploy?** → `Y`
- **Which scope?** → Wähle deinen Account
- **Link to existing project?** → `N` (neues Projekt)
- **Project name?** → `insights` (oder wie du willst)
- **Directory?** → `./` (Enter)
- **Override settings?** → `N`

## Schritt 3: Environment Variables setzen

Nach dem ersten Deploy:

1. Gehe zu https://vercel.com/dashboard
2. Wähle dein Projekt
3. **Settings** → **Environment Variables**
4. Füge diese Variablen hinzu:

```
NEXT_PUBLIC_SUPABASE_URL=https://kpwiyohezaghpdryaayv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwd2l5b2hlemFnaHBkcnlhYXl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwMDYyMzEsImV4cCI6MjA4MjU4MjIzMX0.O4dARaB7eE8yd6UijBbOmVEEjLc_n_yPZNjiLaliTNA
SUPABASE_SERVICE_ROLE_KEY=DEIN_SERVICE_ROLE_KEY_HIER
META_APP_ID=877184334699544
META_APP_SECRET=807fa92af6e744a435bee3ed4ae7ce6c
META_REDIRECT_URI=https://deine-domain.vercel.app/api/meta/callback
MOCK_META=false
CRON_SECRET=dein-zufaelliger-secret-string
```

⚠️ **WICHTIG**: 
- Ersetze `DEIN_SERVICE_ROLE_KEY_HIER` mit dem echten Service Role Key aus Supabase
- Ersetze `https://deine-domain.vercel.app` mit deiner tatsächlichen Vercel Domain (wird nach Deploy angezeigt)
- Ersetze `dein-zufaelliger-secret-string` mit einem sicheren Secret

## Schritt 4: Production Deploy

```bash
vercel --prod
```

## Schritt 5: URLs aktualisieren

Nach dem Deploy bekommst du eine URL wie: `https://insights-xxxxx.vercel.app`

### Supabase Auth URLs aktualisieren:
1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Füge hinzu:
   - **Site URL**: `https://deine-domain.vercel.app`
   - **Redirect URLs**: `https://deine-domain.vercel.app/**`

### Meta App Redirect URI aktualisieren:
1. Meta App Dashboard → **Settings** → **Basic**
2. Füge zu **Valid OAuth Redirect URIs** hinzu:
   ```
   https://deine-domain.vercel.app/api/meta/callback
   ```

### Vercel Environment Variable aktualisieren:
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Aktualisiere `META_REDIRECT_URI` auf deine echte Domain
3. **Redeploy** (automatisch oder manuell)

## Fertig! 🎉

Öffne deine Vercel URL und teste die App!

