# 🔐 Authentication Setup

This application uses **Appwrite** for authentication and user management.

## Features

✅ Email/Password Authentication  
✅ User Registration  
✅ Protected Routes  
✅ Session Management  
✅ User Profile Menu  
✅ Logout Functionality  

## Configuration

Authentication is configured using environment variables in `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=68dd4ee79b68d5f85be7
```

## Components

### Auth Context (`context/AuthContext.tsx`)
Provides authentication state and methods throughout the app:
- `user` - Current authenticated user
- `loading` - Loading state
- `login(email, password)` - Sign in user
- `register(email, password, name)` - Create new account
- `logout()` - Sign out user

### Auth Pages & Components

1. **Login Form** (`components/auth/login-form.tsx`)
   - Email/password sign-in
   - Toggle to registration

2. **Register Form** (`components/auth/register-form.tsx`)
   - New account creation
   - Password confirmation
   - Automatic login after registration

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

import { useAuth } from "@/context/AuthContext";

export function MyComponent() {
  const { user, logout } = useAuth();

  return (
    <div>
      <p>Welcome, {user?.name}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Check Authentication

```tsx
const { user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) return <div>Please log in</div>;

return <div>Welcome {user.name}!</div>;
```

## Routes

- `/` - Main dashboard (protected)
- `/auth` - Login/Register page (public)

## Appwrite Console

Manage users and auth settings in the Appwrite Console:
https://cloud.appwrite.io/console/project-68dd4ee79b68d5f85be7/auth

## Security Features

- Password minimum length: 8 characters
- Session-based authentication
- Automatic session validation
- Secure logout (deletes session)
- Client-side protection (redirects)
- Server-side validation (API routes use API key)

## Testing

### Create a Test Account

1. Start the dev server: `npm run dev`
2. Navigate to: http://localhost:3000/auth
3. Click "Sign up" 
4. Enter your details:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123
5. Submit the form

### Login

1. Navigate to: http://localhost:3000/auth
2. Enter credentials
3. Click "Sign In"

You'll be automatically redirected to the dashboard after successful authentication.

## Troubleshooting

### "User not found" error
- Make sure you've created an account first
- Check that you're using the correct email/password

### Redirecting to /auth constantly
- Clear browser cookies
- Check Appwrite session in Application tab (DevTools)
- Verify environment variables are set correctly

### Can't create account
- Verify email format is valid
- Ensure password is at least 8 characters
- Check Appwrite Console for any error messages

## Next Steps

Optional enhancements you can add:

- [ ] Email verification
- [ ] Password reset flow
- [ ] OAuth providers (Google, GitHub, etc.)
- [ ] Two-factor authentication
- [ ] User profile editing
- [ ] Role-based access control
