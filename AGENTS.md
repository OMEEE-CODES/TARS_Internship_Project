# Tars Chat - Agent Documentation

> This file contains essential information for AI coding agents working on the Tars Chat project.
> Last updated: 2026-02-23

## Project Overview

**Tars Chat** is a real-time messaging web application built for the Tars Full Stack Engineer Internship 2026. It enables users to engage in one-on-one direct messaging with features like typing indicators, online/offline presence, unread message counts, and smart auto-scroll.

### Key Features
- Authentication via Clerk (email & social providers)
- Real-time one-on-one direct messaging
- User list with search functionality
- Online/offline presence indicators
- Typing indicators with animated UI
- Unread message badge counts
- Smart auto-scroll with manual override
- Responsive layout for desktop and mobile
- Smart date formatting (Today, This Year, Previous Years)

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 14.2.0 (App Router) |
| Language | TypeScript | 5.3.0 |
| Backend & Database | Convex | 1.32.0 |
| Authentication | Clerk | 5.0.0 |
| Styling | Tailwind CSS | 3.4.1 |
| UI Components | Radix UI + shadcn/ui patterns | - |
| Icons | Lucide React | 0.344.0 |
| Date Utilities | date-fns | 3.3.0 |

## Project Structure

```
TARS_Internship_Project/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication route group
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── chat/                     # Chat routes
│   │   ├── page.tsx              # Chat home (no conversation selected)
│   │   └── [conversationId]/     # Individual conversation view
│   │       └── page.tsx
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Landing page (redirects to /chat)
│   └── globals.css               # Global styles + Tailwind
├── components/
│   ├── chat/                     # Chat-specific components
│   │   ├── ChatWindow.tsx        # Main chat view with messages
│   │   ├── ConversationList.tsx  # Sidebar conversation list
│   │   ├── MessageBubble.tsx     # Individual message display
│   │   ├── MessageInput.tsx      # Message input with typing indicator
│   │   ├── TypingIndicator.tsx   # Typing animation component
│   │   ├── UserSearch.tsx        # User search for new conversations
│   │   └── EmptyState.tsx        # Empty state illustrations
│   ├── providers/                # Context providers
│   │   ├── AppProviders.tsx      # Main provider composition
│   │   ├── ConvexProvider.tsx    # Convex client provider
│   │   └── UserSyncProvider.tsx  # User sync with Clerk
│   └── ui/                       # shadcn/ui components
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── scroll-area.tsx
│       └── separator.tsx
├── convex/                       # Convex backend
│   ├── _generated/               # Auto-generated Convex types
│   ├── schema.ts                 # Database schema
│   ├── auth.ts                   # Auth configuration
│   ├── users.ts                  # User queries/mutations
│   ├── conversations.ts          # Conversation queries/mutations
│   ├── messages.ts               # Message queries/mutations
│   └── typing.ts                 # Typing indicator functions
├── hooks/                        # Custom React hooks
│   ├── useConversations.ts       # Conversation data hooks
│   ├── useMessages.ts            # Message data hooks
│   ├── useTyping.ts              # Typing indicator hooks
│   ├── usePresence.ts            # Online status hooks
│   ├── useSyncUser.ts            # Clerk-to-Convex user sync
│   └── useConvexAuth.ts          # Convex auth integration
├── lib/                          # Utility functions
│   ├── utils.ts                  # cn() utility for Tailwind
│   └── dateUtils.ts              # Date formatting utilities
├── types/                        # TypeScript types
│   └── index.ts                  # Shared type definitions
├── middleware.ts                 # Clerk auth middleware
├── tailwind.config.ts            # Tailwind configuration
├── next.config.js                # Next.js configuration
└── convex.json                   # Convex project config
```

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development (requires two terminals)
npm run dev              # Start Next.js dev server on http://localhost:3000
npx convex dev           # Start Convex dev server

# Production build
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint

# Convex commands
npx convex deploy        # Deploy Convex to production
npx convex codegen       # Regenerate Convex types
```

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Clerk Authentication (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat

# Convex (required)
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Optional: Convex deployment info
CONVEX_DEPLOYMENT=dev:project-name
NEXT_PUBLIC_CONVEX_SITE_URL=https://project.convex.site
```

## Database Schema (Convex)

The application uses 5 main tables:

### users
- `clerkId`: string (indexed)
- `email`: string (indexed)
- `name`: string
- `imageUrl`: optional string
- `isOnline`: boolean
- `lastSeen`: number (timestamp)

### conversations
- `type`: "direct" | "group"
- `name`: optional string (for groups)
- `participants`: array of user IDs
- `createdBy`: user ID
- `updatedAt`: number (timestamp)

### messages
- `conversationId`: conversation ID (indexed)
- `senderId`: user ID
- `content`: string
- `createdAt`: number (timestamp)
- `updatedAt`: number (timestamp)
- `isDeleted`: boolean

### typing (ephemeral)
- `conversationId`: conversation ID (indexed)
- `userId`: user ID
- `timestamp`: number

### readReceipts
- `conversationId`: conversation ID
- `userId`: user ID
- `lastReadMessageId`: optional message ID
- `unreadCount`: number

## Code Style Guidelines

### File Naming
- Components: PascalCase (e.g., `ChatWindow.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useMessages.ts`)
- Utilities: camelCase (e.g., `dateUtils.ts`)
- Pages: Next.js convention with `page.tsx`

### Component Patterns

**Always use "use client" for client components:**
```typescript
"use client";

import { useState } from "react";
// ...
```

**Use the cn() utility for conditional classes:**
```typescript
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  isActive && "active-class",
  className
)}
```

**Use Convex hooks for data fetching:**
```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const messages = useQuery(api.messages.getMessages, { conversationId });
const sendMessage = useMutation(api.messages.sendMessage);
```

### TypeScript Conventions

- Use explicit types for component props
- Use `Id<"tableName">` from Convex for document IDs
- Use the types in `types/index.ts` for shared interfaces

Example:
```typescript
import { Id } from "@/convex/_generated/dataModel";

interface ChatWindowProps {
  conversationId: Id<"conversations">;
  isMobile?: boolean;
}
```

### Authentication Pattern

The app uses Clerk with Convex integration:

1. **Middleware** (`middleware.ts`): Protects `/chat` routes, redirects to `/sign-in`
2. **AppProviders** (`components/providers/AppProviders.tsx`): Wraps app with Clerk + Convex
3. **UserSyncProvider**: Syncs Clerk user data to Convex on sign-in
4. **Convex functions**: Access userId via `(ctx as any).userId`

## Testing Strategy

Currently, the project does not have automated tests configured. When adding tests:

- Use Jest + React Testing Library for unit tests
- Use Playwright for E2E tests
- Test Convex functions with the Convex test runner

## Security Considerations

1. **Authentication**: All `/chat` routes are protected by Clerk middleware
2. **Authorization**: Convex functions verify user participation in conversations
3. **Environment Variables**: Never commit `.env.local` (it's in `.gitignore`)
4. **CORS**: Convex handles CORS automatically in development
5. **Data Validation**: Convex uses `v.validator()` for type-safe inputs

Example authorization check in Convex:
```typescript
const userId = (ctx as any).userId;
if (!userId) {
  throw new Error("Not authenticated");
}

const conversation = await ctx.db.get(args.conversationId);
if (!conversation || !conversation.participants.includes(userId)) {
  throw new Error("Not authorized");
}
```

## Deployment Process

### 1. Deploy Convex Backend
```bash
npx convex deploy
```
Get the production URL from the Convex dashboard.

### 2. Update Environment Variables
Update Vercel environment variables with production values:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (production key)
- `CLERK_SECRET_KEY` (production secret)
- `NEXT_PUBLIC_CONVEX_URL` (production Convex URL)

### 3. Deploy to Vercel
- Connect GitHub repository to Vercel
- Configure environment variables
- Deploy

## Common Issues and Solutions

### Convex WebSocket Connection Issues
- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Ensure `npx convex dev` is running
- Check network/firewall settings

### Clerk Authentication Issues
- Verify API keys are correct
- Check middleware configuration
- Ensure protected routes match the middleware matcher

### Type Errors
```bash
npx convex codegen    # Regenerate Convex types
```
Restart TypeScript server in your editor.

### Hydration Mismatch
The app uses client-side only rendering for auth providers to prevent hydration issues:
```typescript
const [isClient, setIsClient] = useState(false);
useEffect(() => setIsClient(true), []);
if (!isClient) return <Loading />;
```

## Key Dependencies to Know

| Package | Purpose |
|---------|---------|
| `@clerk/nextjs` | Authentication |
| `convex` | Backend and real-time database |
| `@radix-ui/*` | Headless UI primitives |
| `class-variance-authority` | Component variant management |
| `clsx` + `tailwind-merge` | Conditional class merging |
| `date-fns` | Date formatting |
| `lucide-react` | Icons |

## Contributing Guidelines

1. Follow the existing code style and patterns
2. Use the `cn()` utility for className merging
3. Add proper TypeScript types
4. Use Convex mutations for state changes
5. Ensure responsive design works on mobile
6. Test authentication flows when modifying auth-related code
