# BellyLog 🤰

A modern pregnancy tracking application built with Next.js, Material UI, and Supabase.

## Features

- 📅 Track your pregnancy journey and milestones
- 💪 Monitor health symptoms and wellness
- ❤️ Document special moments throughout your pregnancy
- 🔐 Secure authentication with Google OAuth
- 📱 Responsive design with Material UI
- ☁️ Cloud database with Supabase

## Tech Stack

- **Framework:** Next.js 16.0.0 (App Router)
- **UI Library:** Material UI 7.3.4
- **Styling:** Tailwind CSS 4.x + Emotion
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth with Google OAuth
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop (for local Supabase)
- Google OAuth credentials (see `GOOGLE_AUTH_SETUP.md`)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tsr-thulio/BellyLog.git
cd BellyLog
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start Supabase locally:
```bash
npm run supabase:start
```

5. Configure Google OAuth (see `GOOGLE_AUTH_SETUP.md`)

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Documentation

- **Database Setup:** See [DATABASE.md](./DATABASE.md) for Supabase configuration
- **Google OAuth:** See [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md) for authentication setup

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:status` - Check Supabase status
- `npm run supabase:reset` - Reset local database

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

For detailed deployment instructions, see [DATABASE.md](./DATABASE.md) and [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md).

## License

This project is private and proprietary.
