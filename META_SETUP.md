# Meta Graph API Setup - Schritt für Schritt

## 1. Meta App erstellen

1. Gehe zu https://developers.facebook.com
2. Klicke auf **My Apps** (oben rechts)
3. Klicke auf **Create App**
4. Wähle **Business** als App-Typ
5. Klicke auf **Next**
6. Gib App-Details ein:
   - **App Name**: z.B. "Insights Dashboard"
   - **App Contact Email**: deine E-Mail
   - **Business Account**: Optional (kannst du später hinzufügen)
7. Klicke auf **Create App**

## 2. Facebook Login hinzufügen

1. Im App Dashboard siehst du "Add Products to Your App"
2. Suche nach **Facebook Login**
3. Klicke auf **Set Up**
4. Wähle **Web** als Plattform
5. Klicke auf **Next**

## 3. OAuth Redirect URIs konfigurieren

1. Im App Dashboard → **Settings** → **Basic**
2. Scrolle zu **Valid OAuth Redirect URIs**
3. Klicke auf **Add URI**
4. Füge hinzu:
   ```
   http://localhost:3000/api/meta/callback
   ```
5. Für später (Vercel Deployment) füge auch hinzu:
   ```
   https://your-domain.vercel.app/api/meta/callback
   ```
6. Klicke auf **Save Changes**

## 4. App Credentials notieren

1. Im App Dashboard → **Settings** → **Basic**
2. Notiere dir:
   - **App ID** (z.B. `1234567890123456`)
   - **App Secret** → Klicke auf **Show** und kopiere den Secret
   - ⚠️ **WICHTIG**: App Secret geheim halten!

## 5. Permissions beantragen

1. Im App Dashboard → **App Review** → **Permissions and Features**
2. Für jede Permission:
   - Klicke auf **Request** oder **Add**
   - Fülle die Details aus (falls erforderlich)

**Benötigte Permissions:**
- ✅ `pages_read_engagement` - Page Engagement lesen
- ✅ `pages_read_user_content` - Page Content lesen
- ✅ `pages_show_list` - Pages auflisten
- ✅ `instagram_basic` - Instagram Basic Info
- ✅ `instagram_manage_insights` - Instagram Insights
- ✅ `business_management` - Business Management

**Wichtig für Entwicklung:**
- Du kannst **Test Users** hinzufügen: **Roles** → **Test Users** → **Add Test Users**
- Mit Test Users kannst du die App testen, ohne App Review zu durchlaufen

## 6. Environment Variables aktualisieren

Füge die Meta Credentials in `.env.local` ein:

```env
META_APP_ID=deine_app_id_hier
META_APP_SECRET=dein_app_secret_hier
META_REDIRECT_URI=http://localhost:3000/api/meta/callback
MOCK_META=false  # Deaktivieren für echte Daten
```

## 7. App testen

1. Starte die App:
   ```bash
   npm run dev
   ```

2. Öffne http://localhost:3000

3. Logge dich ein oder registriere dich

4. Im Dashboard → Klicke auf **Meta verbinden**

5. Du wirst zu Facebook weitergeleitet:
   - Erlaube die Permissions
   - Wähle die Facebook Page aus (falls mehrere vorhanden)
   - Erlaube Instagram Zugriff (falls vorhanden)

6. Nach erfolgreicher Verbindung:
   - Automatische Synchronisierung startet
   - Dashboard zeigt deine Facebook/Instagram Daten

## 8. Instagram Business Account Voraussetzungen

Für Instagram-Daten benötigst du:

1. **Facebook Page** (muss existieren)
2. **Instagram Business Account** (nicht Creator Account!)
3. **Verknüpfung**: Page und Instagram Account müssen verknüpft sein

**So verknüpfst du:**
1. Gehe zu deiner Facebook Page
2. Settings → Instagram
3. Verbinde deinen Instagram Business Account

**Account-Typ prüfen:**
- Instagram App → Settings → Account Type
- Muss "Business" sein (nicht "Creator" oder "Personal")

## 9. Häufige Probleme

### "redirect_uri_mismatch"
- Prüfe, ob Redirect URI exakt übereinstimmt
- Keine trailing slashes: `http://localhost:3000/api/meta/callback` ✅
- Nicht: `http://localhost:3000/api/meta/callback/` ❌

### "Invalid OAuth access token"
- Token könnte abgelaufen sein
- Versuche erneut zu verbinden
- Prüfe, ob App Secret korrekt ist

### "Instagram account not found"
- Prüfe, ob Instagram Account Business Account ist
- Prüfe, ob Page und Instagram verknüpft sind
- Prüfe Permissions: `instagram_basic`, `instagram_manage_insights`

### "Permission denied"
- Prüfe, ob alle Permissions beantragt wurden
- Für Entwicklung: Nutze Test Users
- Für Produktion: App Review durchlaufen

## 10. Vercel Deployment

Wenn du auf Vercel deployst:

1. Füge Environment Variables in Vercel hinzu:
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `META_REDIRECT_URI=https://your-domain.vercel.app/api/meta/callback`

2. Aktualisiere Redirect URI in Meta App:
   - Füge `https://your-domain.vercel.app/api/meta/callback` hinzu

3. Aktualisiere Supabase Auth URLs:
   - Füge `https://your-domain.vercel.app/**` zu Redirect URLs hinzu

## ✅ Checkliste

- [ ] Meta App erstellt
- [ ] Facebook Login Produkt hinzugefügt
- [ ] OAuth Redirect URI konfiguriert
- [ ] App ID notiert
- [ ] App Secret notiert
- [ ] Permissions beantragt
- [ ] Environment Variables in `.env.local` gesetzt
- [ ] App gestartet (`npm run dev`)
- [ ] "Meta verbinden" im Dashboard geklickt
- [ ] OAuth Flow erfolgreich
- [ ] Daten werden synchronisiert

Viel Erfolg! 🚀

