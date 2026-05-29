# Google OAuth Integration

Locafy supports one-click Google sign-in using **NextAuth.js v5** on the frontend and **google-auth-library-java** on the backend.

---

## Setup on Google Cloud Console

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add Authorized JavaScript origins:
   - `http://localhost:3000` (local dev)
   - `https://locafy.in` (production)
7. Add Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://locafy.in/api/auth/callback/google`
8. Save — copy **Client ID** and **Client Secret**

---

## Frontend — NextAuth.js v5

### Installation

```bash
npm install next-auth@beta
```

### Configuration (`frontend/lib/auth.ts`)

```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ account }) {
      // Forward Google ID token to our Spring Boot backend
      if (account?.provider === 'google' && account.id_token) {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: account.id_token }),
          })
          if (!response.ok) return false
          const data = await response.json()
          account.locafyToken = data.accessToken
          account.locafyUser = data.user
          return true
        } catch {
          return false
        }
      }
      return true
    },

    async jwt({ token, account }) {
      if (account?.locafyToken) {
        token.accessToken = account.locafyToken
        token.user = account.locafyUser
      }
      return token
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken as string
      session.user = token.user as any
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
})
```

### Route Handler (`frontend/app/api/auth/[...nextauth]/route.ts`)

```typescript
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

### Sign-in Button

```tsx
// components/shared/GoogleSignInButton.tsx
import { signIn } from '@/lib/auth'

export function GoogleSignInButton() {
  return (
    <form action={async () => { 'use server'; await signIn('google') }}>
      <button type="submit" className="flex items-center gap-3 border rounded-lg px-4 py-2">
        <GoogleIcon />
        Continue with Google
      </button>
    </form>
  )
}
```

### Middleware Guard (`frontend/middleware.ts`)

```typescript
import { auth } from '@/lib/auth'

export default auth((req) => {
  const { nextUrl, auth } = req
  const isLoggedIn = !!auth

  if (nextUrl.pathname.startsWith('/vendor') && auth?.user?.role !== 'VENDOR') {
    return Response.redirect(new URL('/vendor/auth/login', nextUrl))
  }
  // etc.
})

export const config = {
  matcher: ['/(vendor|delivery|admin|customer)/:path*'],
}
```

---

## Backend — Spring Boot

### Maven Dependency (`pom.xml`)

```xml
<dependency>
  <groupId>com.google.auth</groupId>
  <artifactId>google-auth-library-oauth2-http</artifactId>
  <version>1.23.0</version>
</dependency>
```

### Google Auth Service (`GoogleAuthService.java`)

```java
@Service
public class GoogleAuthService {

    @Value("${google.client-id}")
    private String clientId;

    public GoogleIdToken.Payload verify(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
            new NetHttpTransport(), GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(clientId))
            .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new UnauthorizedException("Invalid Google ID token");
        }
        return idToken.getPayload();
    }
}
```

### User Upsert Logic (`UserService.java`)

```java
public User upsertGoogleUser(GoogleIdToken.Payload payload) {
    String googleId = payload.getSubject();
    String email    = payload.getEmail();
    String name     = (String) payload.get("name");
    String picture  = (String) payload.get("picture");

    // 1. Look up by googleId
    Optional<User> byGoogleId = userRepository.findByGoogleId(googleId);
    if (byGoogleId.isPresent()) {
        User u = byGoogleId.get();
        u.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(u);
    }

    // 2. Look up by email (link existing account)
    Optional<User> byEmail = userRepository.findByEmail(email);
    if (byEmail.isPresent()) {
        User u = byEmail.get();
        u.setGoogleId(googleId);
        u.setAuthProvider(AuthProvider.BOTH);
        if (u.getAvatarUrl() == null) u.setAvatarUrl(picture);
        u.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(u);
    }

    // 3. Create new user
    User newUser = User.builder()
        .googleId(googleId)
        .email(email)
        .name(name)
        .avatarUrl(picture)
        .authProvider(AuthProvider.GOOGLE)
        .isVerified(true) // Google-verified email
        .isActive(true)
        .createdAt(LocalDateTime.now())
        .build();
    // Role will be set in /api/auth/google/complete for new users
    return userRepository.save(newUser);
}
```

### Controller (`AuthController.java`)

```java
@PostMapping("/api/auth/google")
public ResponseEntity<AuthResponse> googleAuth(@RequestBody GoogleAuthRequest req,
                                                HttpServletResponse response) {
    GoogleIdToken.Payload payload = googleAuthService.verify(req.getIdToken());
    User user = userService.upsertGoogleUser(payload);

    if (user.getRole() == null) {
        // New user — needs role selection
        String partialToken = jwtUtil.generatePartialToken(user.getId());
        return ResponseEntity.status(202).body(new AuthResponse(null, null, true, partialToken));
    }

    String accessToken  = jwtUtil.generateAccessToken(user);
    String refreshToken = jwtUtil.generateRefreshToken(user);
    setRefreshTokenCookie(response, refreshToken);

    return ResponseEntity.ok(new AuthResponse(accessToken, UserDto.from(user), false, null));
}
```

---

## Environment Variables

```env
# frontend/.env.local
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=random_32_char_secret
NEXTAUTH_URL=http://localhost:3000

# backend/.env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

---

## Admin Account Restriction

Admin accounts intentionally cannot use Google OAuth. The auth controller rejects Google sign-in for accounts with `role: ADMIN`:

```java
if (user.getRole() == Role.ADMIN && req.isGoogleAuth()) {
    throw new ForbiddenException("Admin accounts must use email + password");
}
```

The admin login page also does not render the "Continue with Google" button.
