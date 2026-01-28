# 🔐 Authentication Setup

This application uses **Better Auth** with **Convex** for authentication and session management.

## Features

✅ Email/Password Authentication  
✅ User Registration  
✅ Protected Routes  
✅ Session Management  
✅ User Profile Menu  
✅ Logout Functionality  

## Configuration

Authentication relies on Convex + Better Auth configuration. Ensure `.env.local` contains:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CONVEX_SITE_URL=http://localhost:3000
SITE_URL=http://localhost:3000
```

`SITE_URL` defaults to `http://localhost:3000` in `convex/auth.ts` if not provided.

## Components

### Auth Client (`lib/auth-client.ts`)
Provides the Better Auth React client:
- `authClient.useSession()`
- `authClient.signIn.email()`
- `authClient.signUp.email()`
- `authClient.signOut()`

### Auth Server (`lib/auth-server.ts`)
Server helpers used by API routes and server actions:
- `handler` (GET/POST for `/api/auth/[...all]`)
- `fetchAuthQuery`, `fetchAuthMutation`

### Auth Pages & Components

1. **Login Form** (`components/auth/login-form.tsx`)
   - Email/password sign-in
   - Toggle to registration

2. **Register Form** (`components/auth/register-form.tsx`)
   - New account creation
   - Password confirmation

3. **Protected Route** (`components/auth/protected-route.tsx`)
   - Wraps pages that require authentication
   - Redirects to `/auth` if not logged in

4. **User Menu** (`components/auth/user-menu.tsx`)
   - Shows user avatar with initials
   - Displays user info
   - Logout button

5. **Auth Page** (`app/auth/page.tsx`)
   - Login/Register toggle
   - Redirects to home if already logged in

## Usage

### Protect a Page

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### Use Auth in Components

```tsx
"use client";

import { authClient } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Please log in</div>;

  return <div>Welcome {session.user?.name ?? session.user?.email}!</div>;
}
```

### Sign In

```ts
await authClient.signIn.email({
  email,
  password,
});
```

### Sign Up

```ts
await authClient.signUp.email({
  email,
  password,
  name,
});
```

### Sign Out

```ts
await authClient.signOut();
```

## Routes

- `/` - Main dashboard (protected)
- `/auth` - Login/Register page (public)
- `/api/auth/[...all]` - Better Auth route handler

## Testing

### Create a Test Account

1. Start the dev server: `npm run dev`
2. Navigate to: http://localhost:3000/auth
3. Click "Sign up"
4. Enter your details and submit

### Login

1. Navigate to: http://localhost:3000/auth
2. Enter credentials
3. Click "Sign In"

You will be redirected to the dashboard after successful authentication.

## Troubleshooting

### Redirecting to /auth constantly
- Clear browser cookies
- Verify `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_CONVEX_SITE_URL`
- Ensure `npx convex dev` is running

### Can't create account
- Verify email format is valid
- Ensure password is at least 8 characters

## Legacy Appwrite Auth

Appwrite auth docs are still present for legacy setup scripts. See `APPWRITE_SETUP.md` for legacy details.
