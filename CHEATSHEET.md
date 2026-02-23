# 📋 Tars Chat - Presentation Cheatsheet

## 🗣️ Opening Line
> "Tars Chat is a real-time messaging app where users sign up, find people, and chat instantly with typing indicators and online status."

---

## 🎯 3 Key Technologies

| Tech | Purpose | One-Liner |
|------|---------|-----------|
| **Next.js** | Frontend framework | React with file-based routing |
| **Convex** | Backend + Database | Real-time sync, no backend code |
| **Clerk** | Authentication | Handles login/signup for us |

---

## ⚡ Real-Time Explained (The WOW Factor)

```
USER A SENDS MESSAGE
         │
         ▼
    ┌─────────┐
    │ Convex  │◀── Just save to DB
    └────┬────┘
         │
         └──────────────┐
              (PUSH)    │
         ┌──────────────┘
         ▼
    ┌─────────┐
    │ USER B  │◀── Auto appears! No refresh!
    └─────────┘
```

**Code:** `const messages = useQuery(api.messages.getMessages)`

---

## 🔐 Auth Flow (Draw this)

```
/chat ──▶ Middleware ──▶ Has auth? ──YES──▶ Show Chat
              │              │
              │             NO
              │              │
              └──────────────▶ /sign-in
```

---

## 📂 File Structure to Show

```
Project/
├── app/
│   ├── chat/page.tsx          ◀── Show this
│   └── (auth)/sign-in/page.tsx
├── components/chat/
│   ├── ChatWindow.tsx         ◀── Show this
│   └── MessageInput.tsx
├── convex/
│   ├── schema.ts              ◀── Show this
│   ├── messages.ts            ◀── Show this
│   └── users.ts
└── middleware.ts              ◀── Show this
```

---

## 💻 Code to Highlight

### 1. Middleware (Security)
```typescript
// middleware.ts
if (isProtectedRoute(req) && !userId) {
  return redirectToSignIn({ returnBackUrl: req.url });
}
```

### 2. Real-Time Query (The Magic)
```typescript
// Auto-updates when DB changes!
const messages = useQuery(api.messages.getMessages, { conversationId });
```

### 3. Database Function
```typescript
// convex/messages.ts
export const getMessages = query({
  handler: async (ctx, args) => {
    const userId = ctx.userId;
    if (!userId) throw new Error("Not authenticated");
    // ... fetch messages
  },
});
```

---

## 🎥 Demo Flow

1. **Landing page** → redirects to sign-in
2. **Sign up** (or use existing account)
3. **Chat page** → show sidebar + empty state
4. **Click + button** → search users
5. **Start conversation** → open chat
6. **Send message** → show it appears instantly
7. **Open second browser/incognito** → reply from another account
8. **Show typing indicator** → type something
9. **Show responsive** → resize window / toggle mobile view

---

## 🎓 Learning Points (Closing)

- Real-time = Convex queries, not WebSockets
- TypeScript catches errors at compile time
- Serverless = No backend server management
- Clerk = Authentication made easy
- Custom hooks = Reusable, clean code

---

## ⏱️ Timing Checkpoints

| Time | Should Be At |
|------|--------------|
| 0:30 | Finished intro |
| 1:30 | Finished demo |
| 2:30 | Explained tech stack |
| 3:30 | Explained real-time magic |
| 4:30 | Showed key code |
| 5:00 | Closing statement |

---

## 🆘 If You Forget Something

- **Stuck on real-time?** → Say "Convex automatically pushes updates to all connected clients"
- **Stuck on auth?** → Say "Clerk handles authentication, middleware protects routes"
- **Stuck on database?** → Say "Convex is a real-time database with automatic sync"
- **Need a pause?** → Take a breath, sip water, look at the demo screen

---

## ✅ Quick Pre-Check

- [ ] Incognito window ready
- [ ] Two test accounts ready
- [ ] Code editor open to middleware.ts
- [ ] Mobile view tested
- [ ] Water nearby

**You've got this! 💪**
