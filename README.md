# Kosi

A simple, secure, and offline-first journaling application with end-to-end encryption.

## Features

- 📝 Simple journaling/note-taking interface
- 🔒 End-to-end encryption using Web Crypto API
- 📱 Offline-first capability with IndexedDB
- 🔄 Real-time sync when online

## Tech Stack

- **Language**: TypeScript
- **Frontend Framework**: Next.js 15^ + React v19^
- **Styling**: TailwindCSS + DaisyUI
- **Database**: Postgres
- **Storage**: IndexedDB (offline) + Supabase (online)
- **Security**: Web Crypto API for E2EE

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

Update the following values in .env.local

```bash
KOSI_SUPABASE_PASSWORD=your_password
KOSI_SUPABASE_HOST=localhost
KOSI_SUPABASE_PORT=54322
KOSI_SUPABASE_USER=postgres
KOSI_SUPABASE_DATABASE=postgres
```

4. Run Supabase service locally & create tables

```bash
# Ensure Docker/Podman (or other container service) is running
npx supabase start
npx supabase migration up
```

Open [http://127.0.0.1:54323](http://127.0.0.1:54323) with your browser to see Supabase dashboard.

5. Run the Next.js development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

## Development Status

⚠️ **Warning**: This project is currently in active development and is unstable. Features may be incomplete or change without notice.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
