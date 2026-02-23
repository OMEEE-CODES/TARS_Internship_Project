# Tars Chat - Architecture Diagrams

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER BROWSER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Sign In/Up  │  │  Chat List   │  │ Message View │  │ User Search  │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          └─────────────────┴─────────────────┴─────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │    NEXT.JS 14 APP     │
                    │  ┌─────────────────┐  │
                    │  │  App Router     │  │
                    │  │  Server/Client  │  │
                    │  │  Components     │  │
                    │  └─────────────────┘  │
                    └───────────┬───────────┘
                                │
              ┌─────────────────┼─────────────────┐
              │                 │                 │
              ▼                 ▼                 ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │     CLERK       │ │     CONVEX      │ │    VERCEL       │
    │   Authentication│ │   Backend       │ │   Hosting       │
    │                 │ │                 │ │                 │
    │ • User Sign In  │ │ • Database      │ │ • CDN           │
    │ • Session Mgmt  │ │ • Real-time API │ │ • Edge Network  │
    │ • JWT Tokens    │ │ • Functions     │ │ • Serverless    │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## 2. Data Flow - Sending a Message

```
┌──────────┐                    ┌──────────┐
│  User A  │─── types message ─▶│  Input   │
└──────────┘                    └────┬─────┘
                                     │
                                     │ sendMessage()
                                     ▼
┌──────────────────────────────────────────────────────────┐
│                      CONVEX BACKEND                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │
│  │  Validate   │──▶│  Save to    │──▶│  Push to all     │  │
│  │  Auth/User  │  │  Database   │  │  subscribers     │  │
│  └─────────────┘  └─────────────┘  └──────────────────┘  │
└──────────────────────────────────────────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ┌──────────┐    ┌──────────┐    ┌──────────┐
              │  User A  │    │  User B  │    │  User C  │
              │  (sender)│    │(receiver)│    │(receiver)│
              └──────────┘    └──────────┘    └──────────┘
```

## 3. Authentication Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   Browser  │────▶│  Middleware│────▶│   Clerk    │────▶│   Sign In  │
│ /chat      │     │  Check Auth│     │   Auth     │     │   Page     │
└────────────┘     └─────┬──────┘     └────────────┘     └─────┬──────┘
                         │                                       │
         Not logged in ◀─┘                                       │
                                                                  │
         Logged in ──▶ ┌────────────┐                            │
                       │   /chat    │◀───────────────────────────┘
                       │   Page     │     (After successful auth)
                       └─────┬──────┘
                             │
                             ▼
                       ┌────────────┐
                       │ UserSync   │─── Sync user data to Convex DB
                       │ Provider   │
                       └────────────┘
```

## 4. Component Hierarchy

```
RootLayout
├── ClerkProvider
│   └── ConvexProviderWithClerk
│       └── UserSyncProvider
│           ├── ChatPage (/chat)
│           │   ├── Sidebar
│           │   │   ├── UserHeader (UserButton + Name)
│           │   │   ├── NewMessageButton
│           │   │   └── ConversationList
│           │   │       └── ConversationItem[]
│           │   └── ChatWindow (/chat/[id])
│           │       ├── ChatHeader
│           │       ├── MessageList
│           │       │   └── MessageBubble[]
│           │       └── MessageInput
│           └── UserSearch (Modal)
│
├── SignInPage (/sign-in)
│   └── SignIn (Clerk component)
│
└── SignUpPage (/sign-up)
    └── SignUp (Clerk component)
```

## 5. Real-Time Subscription Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        CONVEX DATABASE                           │
│                                                                  │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│   │  messages   │  │  typing     │  │    users    │             │
│   │  (table)    │  │  (table)    │  │  (table)    │             │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│          │                │                │                    │
│          │  On Change     │  On Change     │  On Change         │
│          ▼                ▼                ▼                    │
│   ┌─────────────────────────────────────────────────┐           │
│   │         REAL-TIME PUSH MECHANISM                │           │
│   └─────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
         │                  │                  │
         ▼                  ▼                  ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │ useQuery │      │ useQuery │      │ useQuery │
   │ (auto    │      │ (auto    │      │ (auto    │
   │ re-fetch)│      │ re-fetch)│      │ re-fetch)│
   └────┬─────┘      └────┬─────┘      └────┬─────┘
        │                 │                 │
        ▼                 ▼                 ▼
   ┌──────────┐      ┌──────────┐      ┌──────────┐
   │ Message  │      │  Typing  │      │ Online   │
   │  List    │      │ Indicator│      │  Status  │
   └──────────┘      └──────────┘      └──────────┘
```

## 6. Database Relationships

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│    users    │         │  conversations  │         │   messages  │
│             │         │                 │         │             │
│  _id (PK)   │◀────────│ participants[]  │         │ _id (PK)    │
│  clerkId    │         │  _id (PK)       │◀────────│conversation │
│  email      │         │  type           │         │  senderId   │──▶ users
│  name       │         │  createdBy      │──▶ users│  content    │
│  isOnline   │         │  updatedAt      │         │  createdAt  │
│  lastSeen   │         └─────────────────┘         └─────────────┘
└─────────────┘                   │
                                  │
                                  ▼
                         ┌─────────────────┐
                         │     typing      │
                         │                 │
                         │  conversationId │──▶ conversations
                         │  userId         │──▶ users
                         │  timestamp      │
                         └─────────────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  readReceipts   │
                         │                 │
                         │  conversationId │──▶ conversations
                         │  userId         │──▶ users
                         │  unreadCount    │
                         │  lastReadMsgId  │──▶ messages
                         └─────────────────┘
```

## 7. File Structure Map

```
Project/
│
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (auth)/              # Route Group - Auth pages
│   │   ├── 📁 sign-in/
│   │   └── 📁 sign-up/
│   ├── 📁 chat/                # Chat routes
│   │   ├── page.tsx            # /chat - Sidebar view
│   │   └── 📁 [conversationId]/# Dynamic route
│   │       └── page.tsx        # /chat/123 - Chat window
│   ├── layout.tsx              # Root layout with providers
│   └── page.tsx                # Home (redirects to /chat)
│
├── 📁 components/              # React components
│   ├── 📁 ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── 📁 chat/                # Chat-specific components
│   │   ├── ChatWindow.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ...
│   └── 📁 providers/           # Context providers
│       ├── AppProviders.tsx
│       └── UserSyncProvider.tsx
│
├── 📁 convex/                  # Backend code
│   ├── schema.ts               # Database schema
│   ├── users.ts                # User queries/mutations
│   ├── conversations.ts        # Conversation logic
│   ├── messages.ts             # Message logic
│   └── typing.ts               # Typing indicator logic
│
├── 📁 hooks/                   # Custom React hooks
│   ├── useConversations.ts
│   ├── useMessages.ts
│   └── useTyping.ts
│
├── 📁 lib/                     # Utility functions
│   └── utils.ts
│
└── middleware.ts               # Route protection
```

## 8. Hook Usage Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                      CUSTOM HOOKS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  useConversations()                                          │
│  ├── useQuery(api.conversations.getMyConversations)         │
│  ├── useMutation(api.conversations.create)                  │
│  └── Returns: { conversations, createConversation }         │
│                                                              │
│  useMessages(conversationId)                                 │
│  ├── useQuery(api.messages.getMessages, { conversationId }) │
│  ├── useMutation(api.messages.sendMessage)                  │
│  └── Returns: { messages, sendMessage }                     │
│                                                              │
│  useTyping(conversationId)                                   │
│  ├── useQuery(api.typing.getTypingUsers, { conversationId })│
│  ├── useMutation(api.typing.setTyping)                      │
│  └── Returns: { typingUsers, setTyping }                    │
│                                                              │
│  usePresence()                                               │
│  ├── useMutation(api.users.setOnlineStatus)                 │
│  └── Returns: { setOnline }                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 9. Real-Time Feature Comparison

| Feature | Traditional App | Tars Chat (Convex) |
|---------|----------------|-------------------|
| **New Message** | Poll every 5s | Instant push |
| **Typing Indicator** | Not possible | Real-time |
| **Online Status** | Heartbeat HTTP | Optimistic + sync |
| **Unread Count** | Manual refresh | Auto-update |
| **Code Complexity** | WebSocket server | Just queries/mutations |

## 10. Security Layers

```
┌─────────────────────────────────────────┐
│           SECURITY LAYERS                │
├─────────────────────────────────────────┤
│                                          │
│  1. MIDDLEWARE                           │
│     └─ Checks auth on every request      │
│     └─ Redirects to /sign-in if needed   │
│                                          │
│  2. CLERK AUTH                           │
│     └─ Validates JWT tokens              │
│     └─ Manages sessions                  │
│     └─ Secure cookie handling            │
│                                          │
│  3. CONVEX FUNCTIONS                     │
│     └─ Validates userId on every call    │
│     └─ Checks conversation membership    │
│     └─ Validates input with schemas      │
│                                          │
│  4. DATABASE                             │
│     └─ Row-level security                │
│     └─ Only query own data               │
│                                          │
└─────────────────────────────────────────┘
```
