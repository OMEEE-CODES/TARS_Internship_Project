# Tars Chat

A real-time messaging web application built for the Tars Full Stack Engineer Internship 2026.

## Features

1. **Authentication** - Secure sign-up/sign-in with Clerk (email & social providers)
2. **User List & Search** - Discover and search for other users
3. **One-on-One Direct Messages** - Real-time messaging with other users
4. **Message Timestamps** - Smart date formatting (Today, This Year, Previous Years)
5. **Empty States** - Helpful UI when no conversations or messages exist
6. **Responsive Layout** - Works on desktop and mobile devices
7. **Online/Offline Status** - Real-time presence indicators
8. **Typing Indicator** - See when others are typing
9. **Unread Message Count** - Badge notifications for unread messages
10. **Smart Auto-Scroll** - Auto-scrolls to bottom, with manual override

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Backend & Database**: Convex (real-time)
- **Authentication**: Clerk
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (custom implementation)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Convex account (https://convex.dev)
- Clerk account (https://clerk.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` and add your actual values from Clerk and Convex.

4. **Initialize Convex**
   ```bash
   npx convex dev
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to http://localhost:3000

## Environment Variables

Create a `.env.local` file with:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

## Project Structure

```
Project/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── chat/              # Chat pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # UI components (shadcn)
│   └── chat/              # Chat-specific components
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── users.ts           # User functions
│   ├── conversations.ts   # Conversation functions
│   ├── messages.ts        # Message functions
│   └── typing.ts          # Typing indicator functions
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Deployment

### Deploy Convex

```bash
npx convex deploy
```

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## Development Commands

```bash
# Start Next.js dev server
npm run dev

# Start Convex dev server (in another terminal)
npx convex dev

# Build for production
npm run build

# Run linter
npm run lint
```

## License

This project is built for the Tars Full Stack Engineer Internship 2026.
