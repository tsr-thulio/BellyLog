# Google OAuth Setup Guide

This guide explains how to set up Google OAuth authentication for BellyLog with Supabase, both locally and in production.

## Prerequisites

- Google Cloud Console account
- Supabase project (local or cloud)
- BellyLog application running

## Part 1: Create Google OAuth Credentials

### 1. Go to Google Cloud Console

Visit [Google Cloud Console](https://console.cloud.google.com/)

### 2. Create or Select a Project

- Click the project dropdown at the top
- Click "New Project" or select an existing project
- Name it "BellyLog" (or your preferred name)

### 3. Enable Google+ API

1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### 4. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Click **Create**
4. Fill in the required fields:
   - **App name:** BellyLog
   - **User support email:** Your email
   - **Developer contact email:** Your email
5. Click **Save and Continue**
6. On the Scopes page, click **Save and Continue** (default scopes are fine)
7. On Test users page, click **Save and Continue**
8. Click **Back to Dashboard**

### 5. Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Application type:** Web application
4. **Name:** BellyLog Web Client
5. Add **Authorized JavaScript origins:**
   - For local development: `http://localhost:3000`
   - For production: `https://your-app.vercel.app`
6. Add **Authorized redirect URIs** (see Part 2 and 3 for the specific URIs)
7. Click **Create**
8. **Save your Client ID and Client Secret** (you'll need these for Supabase)

## Part 2: Local Development Setup

### 1. Start Supabase Locally

```bash
npm run supabase:start
```

After starting, note the API URL (usually `http://127.0.0.1:54321`)

### 2. Add Google OAuth Redirect URI

In Google Cloud Console, add this redirect URI to your OAuth credentials:

```
http://127.0.0.1:54321/auth/v1/callback
```

### 3. Configure Supabase Auth Settings Locally

1. Open `supabase/config.toml`
2. Find the `[auth.external.google]` section
3. Update it with your Google OAuth credentials:

```toml
[auth.external.google]
enabled = true
client_id = "your-google-client-id.apps.googleusercontent.com"
secret = "your-google-client-secret"
redirect_uri = "http://127.0.0.1:54321/auth/v1/callback"
```

### 4. Restart Supabase

```bash
npm run supabase:stop
npm run supabase:start
```

### 5. Test Locally

1. Start your Next.js app: `npm run dev`
2. Visit: `http://localhost:3000/login`
3. Click "Continue with Google"
4. Complete the Google OAuth flow

## Part 3: Production Setup (Vercel + Supabase Cloud)

### 1. Create Supabase Cloud Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or use existing one
3. Note your project reference (e.g., `abcdefghijklmnop`)

### 2. Add Google OAuth Redirect URI for Production

In Google Cloud Console, add this redirect URI:

```
https://abcdefghijklmnop.supabase.co/auth/v1/callback
```

Replace `abcdefghijklmnop` with your actual Supabase project reference.

### 3. Configure Google Provider in Supabase Dashboard

1. In your Supabase project, go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Toggle **Enable Sign in with Google**
4. Enter your Google OAuth credentials:
   - **Client ID:** Your Google Client ID
   - **Client Secret:** Your Google Client Secret
5. Click **Save**

### 4. Configure Supabase in Vercel

1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Ensure these are set (from earlier database setup):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Deploy your app

### 5. Update Authorized Origins in Google Console

Add your Vercel deployment URL to **Authorized JavaScript origins**:
```
https://your-app.vercel.app
```

### 6. Test Production

1. Visit your production URL: `https://your-app.vercel.app/login`
2. Click "Continue with Google"
3. Complete the OAuth flow

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Cause:** The redirect URI in your request doesn't match any authorized redirect URIs in Google Console.

**Solution:**
- Double-check your redirect URIs in Google Cloud Console
- For local: `http://127.0.0.1:54321/auth/v1/callback`
- For production: `https://your-project-ref.supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes or typos

### Error: "Access blocked: This app's request is invalid"

**Cause:** OAuth consent screen is not properly configured.

**Solution:**
- Go to OAuth consent screen in Google Console
- Make sure all required fields are filled
- Add your test email to the test users list
- Save changes

### Error: "Google sign in failed"

**Cause:** Invalid client ID or secret in Supabase configuration.

**Solution:**
- Verify client ID and secret in Supabase settings
- Make sure there are no extra spaces or characters
- Regenerate credentials in Google Console if needed

### Login works locally but not in production

**Cause:** Missing or incorrect redirect URI for production.

**Solution:**
- Add production redirect URI to Google Console
- Use format: `https://your-project-ref.supabase.co/auth/v1/callback`
- Wait a few minutes for Google to propagate changes

## Security Best Practices

1. **Never commit credentials** - Keep client secrets in environment variables
2. **Use HTTPS in production** - OAuth requires secure connections
3. **Restrict authorized domains** - Only add domains you control
4. **Rotate secrets regularly** - Update OAuth credentials periodically
5. **Monitor usage** - Check Google Cloud Console for unusual activity

## Testing Authentication Flow

### What happens during login:

1. User clicks "Continue with Google" on `/login`
2. App redirects to Google OAuth page
3. User authorizes the app
4. Google redirects to Supabase callback URL with auth code
5. Supabase exchanges code for user session
6. Supabase redirects to your app's `/auth/callback` route
7. App exchanges code for session and redirects to `/dashboard`

### User session management:

- Sessions are stored in cookies (managed by Supabase)
- Middleware refreshes sessions automatically
- Protected routes check for valid session
- Logout clears the session

## Additional Resources

- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Authentication Patterns](https://nextjs.org/docs/app/building-your-application/authentication)
