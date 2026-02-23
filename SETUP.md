# Setup Guide for Tars Chat

This guide will walk you through setting up Clerk and Convex for the Tars Chat application.

## 1. Clerk Setup (Authentication)

### Create a Clerk Account

1. Go to [https://clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Select "Next.js" as your framework

### Get Your API Keys

1. In your Clerk Dashboard, go to **API Keys**
2. Copy the **Publishable Key** (starts with `pk_test_` or `pk_live_`)
3. Copy the **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Configure Clerk

1. In Clerk Dashboard, go to **User & Authentication > Social Connections**
2. Enable the providers you want (Google, GitHub, etc.)
3. Go to **Sessions** and configure session duration if needed

### Update Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
```

## 2. Convex Setup (Backend & Database)

### Create a Convex Account

1. Go to [https://convex.dev](https://convex.dev) and sign up
2. Install the Convex CLI:
   ```bash
   npm install convex
   ```

### Initialize Convex

1. Run the Convex development server:
   ```bash
   npx convex dev
   ```
   
2. This will:
   - Create a new Convex project (if first time)
   - Generate the `_generated` folder with API types
   - Deploy your schema and functions
   - Watch for changes

### Get Your Convex URL

After running `npx convex dev`, you'll see a URL like:
```
https://happy-otter-123.convex.cloud
```

### Update Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://your-project-name.convex.cloud
```

## 3. Running the Application

### Terminal 1: Start Convex Dev Server

```bash
cd Project
npx convex dev
```

### Terminal 2: Start Next.js Dev Server

```bash
cd Project
npm run dev
```

### Open the Application

Navigate to http://localhost:3000

## 4. Production Deployment

### Deploy Convex to Production

```bash
npx convex deploy
```

### Get Production Convex URL

After deploying, get your production URL from the Convex dashboard and update your environment variables.

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in the Vercel dashboard:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`
   - `NEXT_PUBLIC_CONVEX_URL`

4. Deploy!

## Troubleshooting

### Convex WebSocket Connection Issues

- Make sure `NEXT_PUBLIC_CONVEX_URL` is correct
- Check that the Convex dev server is running
- Verify your network/firewall settings

### Clerk Authentication Issues

- Verify your Clerk API keys are correct
- Check that the middleware is properly configured
- Ensure routes are correctly protected

### Type Errors

- Run `npx convex codegen` to regenerate types
- Restart TypeScript server in your editor

## Support

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
