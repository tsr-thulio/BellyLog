# Database Setup - Supabase

BellyLog uses Supabase as its database solution, providing PostgreSQL database, authentication, storage, and real-time features.

## Local Development Setup

### Prerequisites

1. **Docker Desktop** - Required to run Supabase locally
   - Download: https://www.docker.com/products/docker-desktop
   - Make sure Docker is running before starting Supabase

### Getting Started

1. **Start Supabase locally:**
   ```bash
   npm run supabase:start
   ```

   This will:
   - Start a local PostgreSQL database
   - Start local Supabase services (Auth, Storage, etc.)
   - Display your local API credentials

   **Important:** Copy the `API URL` and `anon key` from the output and update your `.env.local` file if they differ from the defaults.

2. **Check Supabase status:**
   ```bash
   npm run supabase:status
   ```

3. **Stop Supabase:**
   ```bash
   npm run supabase:stop
   ```

4. **Reset database (wipes all data):**
   ```bash
   npm run supabase:reset
   ```

### Local Supabase Studio

Once Supabase is running locally, you can access the Supabase Studio dashboard at:
- **URL:** http://localhost:54323
- Here you can:
  - View and edit database tables
  - Run SQL queries
  - Manage authentication users
  - Configure storage buckets
  - View API documentation

## Using Supabase in Your Code

### Client Components (Browser)

```typescript
import { createClient } from '@/lib/supabase/client'

export default function MyClientComponent() {
  const supabase = createClient()

  // Use supabase client for queries
  const fetchData = async () => {
    const { data, error } = await supabase
      .from('your_table')
      .select('*')
  }

  return <div>...</div>
}
```

### Server Components

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function MyServerComponent() {
  const supabase = await createClient()

  // Use supabase client for queries
  const { data, error } = await supabase
    .from('your_table')
    .select('*')

  return <div>...</div>
}
```

## Production Setup (Vercel)

### 1. Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: BellyLog
   - Database Password: (generate a strong password and save it)
   - Region: Choose closest to your users
5. Click "Create new project"

### 2. Get Your Production Credentials

1. In your Supabase project dashboard, go to: **Settings** → **API**
2. Copy:
   - **Project URL** (under "Project API URL")
   - **anon public** key (under "Project API keys")

### 3. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to: **Settings** → **Environment Variables**
3. Add the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_production_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   ```
4. Make sure to select "Production", "Preview", and "Development" environments
5. Click "Save"

### 4. Deploy

Your next deployment will automatically use the production Supabase credentials.

## Database Migrations

Migrations are stored in `supabase/migrations/` directory.

### Create a new migration:
```bash
npx supabase migration new migration_name
```

### Apply migrations locally:
```bash
npm run supabase:reset
```

### Apply migrations to production:
```bash
npx supabase db push
```

## Free Tier Limits

Supabase free tier includes:
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth
- ✅ 50,000 monthly active users
- ✅ 500 MB database backups (no point-in-time recovery)
- ✅ 1-day log retention
- ✅ Social OAuth providers
- ✅ Unlimited API requests
- ✅ No credit card required

Perfect for development and small production apps!

## Useful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
