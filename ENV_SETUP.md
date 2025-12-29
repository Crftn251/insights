# Environment Variables Setup

## ✅ Was du bereits hast

- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_TnlqPWIwKLsnHA0cxUtZFw_FFtcUm2T`

## 🔍 Was du noch brauchst

### 1. Supabase Project URL

1. Gehe zu deinem Supabase Dashboard
2. Klicke auf **Settings** → **API**
3. Kopiere die **Project URL** (z.B. `https://xxxxx.supabase.co`)
4. Füge sie in `.env.local` ein:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   ```

### 2. Supabase Service Role Key

1. Im Supabase Dashboard → **Settings** → **API**
2. Scrolle zu **service_role key**
3. ⚠️ **WICHTIG**: Dieser Key ist geheim! Niemals im Client-Code verwenden!
4. Klicke auf "Reveal" um den Key zu sehen
5. Kopiere den Key
6. Füge ihn in `.env.local` ein:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Optional: Meta Graph API (für echte Daten)

Falls du echte Instagram/Facebook-Daten synchronisieren möchtest:

1. Gehe zu https://developers.facebook.com
2. Erstelle eine neue App (Typ: "Business")
3. Füge "Facebook Login" Produkt hinzu
4. In **Settings → Basic**:
   - Kopiere **App ID**
   - Kopiere **App Secret**
5. Füge in `.env.local` ein:
   ```
   META_APP_ID=deine_app_id
   META_APP_SECRET=dein_app_secret
   MOCK_META=false
   ```

## 📝 Finale .env.local

Deine `.env.local` sollte so aussehen:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_TnlqPWIwKLsnHA0cxUtZFw_FFtcUm2T
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Meta (optional)
META_APP_ID=
META_APP_SECRET=
META_REDIRECT_URI=http://localhost:3000/api/meta/callback

# Mock Mode
MOCK_META=true

# Optional
CRON_SECRET=dein-zufaelliger-secret-string
```

## ✅ Prüfen ob alles korrekt ist

Nachdem du alle Werte eingetragen hast:

1. Starte die App:
   ```bash
   npm run dev
   ```

2. Öffne http://localhost:3000

3. Falls Fehler auftreten:
   - Prüfe Browser Console (F12)
   - Prüfe Terminal Output
   - Stelle sicher, dass alle Keys korrekt kopiert wurden (keine Leerzeichen!)

## 🔒 Sicherheit

- ✅ `.env.local` ist bereits in `.gitignore` (wird nicht zu Git hinzugefügt)
- ⚠️ **NIEMALS** `SUPABASE_SERVICE_ROLE_KEY` im Client-Code verwenden
- ⚠️ **NIEMALS** `.env.local` zu Git committen
- ✅ Für Vercel Deployment: Setze Environment Variables im Vercel Dashboard

