# KOSI

A simple, secure, and offline-first journaling application with end-to-end encryption.

## Features

- 📝 Simple journaling/note-taking interface
- 🔒 End-to-end encryption using Web Crypto API
- 📱 Offline-first capability with IndexedDB
- 🔄 Real-time sync when online

## Tech Stack

- **Language**: TypeScript
- **Framework**: Next.js 15^ + React v19^
- **Styling**: TailwindCSS + DaisyUI
- **Database**: Supabase (online) + IndexedDB (offline)
- **Security**: Web Crypto API for E2EE + JWT for authorization
- **Deployment** Vercel + GitHub Actions

## Prerequisites

- Node.js 18.x or later
- npm
- [Docker](https://docs.docker.com/get-docker/) or other alternatives like [Podman](https://podman.io/getting-started/installation) for running Supabase locally

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/jigarjain/kosi.git
cd kosi
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env` and set the required values:

```bash
cp .env.example .env
```

4. Run Supabase service locally & copy the displayed values into `.env` file

```bash
# Ensure Docker/Podman (or other container service) is running
npx supabase start
npx supabase migration up
```

Open [http://127.0.0.1:54323](http://127.0.0.1:54323) with your browser to see the local Supabase dashboard.

5. Set .env values

Copy the `API URL` & `service_role key` displayed in terminal after running the `npx supabase start` command into `.env` file

```bash
KOSI_SUPABASE_API_URL=
KOSI_SUPABASE_SERVICE_ROLE_KEY=
```

6. Generate types from Supabase database schema for the app

```bash
npm run db:types
```

7. Run the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Development Status

⚠️ **Warning**: This project is currently in active development and is unstable. Features may be incomplete or change without notice.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
