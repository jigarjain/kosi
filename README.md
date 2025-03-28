# Kosi

[![Status](https://img.shields.io/badge/status-in%20development-unstable-orange.svg)](https://github.com/jigarjain/kosi)

A simple, secure, and offline-first journaling application with end-to-end encryption.

## Features

- 📝 Simple and intuitive journaling interface
- 🔒 End-to-end encryption using Web Crypto API
- 📱 Offline-first capability with IndexedDB
- 🔄 Real-time sync when online
- 🎨 Modern UI with TailwindCSS
- 📱 Responsive design for all devices

## Tech Stack

- **Language**: TypeScript
- **Frontend Framework**: Next.js 15 with App Router + React v19
- **Styling**: TailwindCSS
- **Database**: Supabase
- **Storage**: IndexedDB (offline) + Supabase (online)
- **Security**: Web Crypto API for E2EE
- **State Management**: React Hooks

## Prerequisites

- Node.js 18.x or later
- npm or yarn or pnpm or bun

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/jigarjain/kosi.git
cd kosi
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Status

⚠️ **Warning**: This project is currently in active development and is unstable. Features may be incomplete or change without notice.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
