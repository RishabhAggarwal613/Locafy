# Authentication & Authorization

Locafy supports two login methods — **email + password** and **Google OAuth** — both of which converge at the same JWT issuance step.

---

## Auth Methods

| Method | Supported Roles | Library |
|--------|----------------|---------|
| Email + Password | All 4 roles | Spring Security |
| Google OAuth | Customer, Vendor, Delivery (NOT Admin) | NextAuth.js v5 + Google |
| Phone OTP | All 4 roles (for signup / password reset) | Twilio |

---

## JWT Token Architecture

Locafy uses a **dual-token** stateless JWT strategy:

| Token | Lifespan | Storage | Purpose |
|-------|---------|---------|---------|
| Access Token | 15 minutes | Memory (Zustand) | Sent in `Authorization: Bearer` header |
| Refresh Token | 7 days | HttpOnly cookie | Exchange for new access token |

**Why HttpOnly cookie for refresh token?**
The refresh token is never accessible to JavaScript, eliminating XSS-based token theft. The access token lives only in memory so it is lost on page refresh — a small UX trade-off for security. The NextAuth session bridges this by re-issuing the access token silently on load.

---

## Email + Password Flow

### Signup

```
POST /api/auth/signup
Body: { email, password, role, name, phone }

1. Validate input (Bean Validation)
2. Check email not already registered
3. Hash password with BCrypt (strength 12)
4. Create User document in MongoDB
5. Send OTP to phone number (Twilio)
6. Return 201 with { message: "OTP sent" }

POST /api/auth/otp/verify
Body: { phone, otp }

1. Verify OTP against Redis-stored code (TTL 5 min)
2. Mark user.isVerified = true
3. Issue access token + refresh token
4. Set refresh token in HttpOnly cookie
5. Return { accessToken, user }
```

### Login

```
POST /api/auth/login
Body: { email, password }

1. Find user by email
2. Compare password with BCrypt hash
3. If role mismatch with sub-app origin, reject with 403
4. Issue access token + refresh token
5. Set refresh token in HttpOnly cookie
6. Return { accessToken, user }
```

### Token Refresh

```
POST /api/auth/refresh
(refresh token read from HttpOnly cookie)

1. Read refresh token from cookie
2. Check token not in Redis blocklist
3. Verify JWT signature
4. Issue new access token
5. Rotate refresh token (new value set in cookie)
6. Return { accessToken }
```

---

## Google OAuth Flow

### Step-by-step

```
1. User clicks "Continue with Google" (Next.js)
2. NextAuth.js v5 redirects to Google OAuth URL
3. User consents on Google's screen
4. Google redirects to /api/auth/callback/google with authorization code
5. NextAuth exchanges code for Google ID token
6. NextAuth's signIn callback fires

7. NextAuth calls POST /api/auth/google
   Body: { idToken: "<Google ID token>" }

8. Spring Boot: GoogleAuthService.verify(idToken)
   - Uses google-auth-library-java to verify token
   - Validates aud (client ID) and exp
   - Extracts: email, googleId (sub), name, picture

9. Lookup user in MongoDB by googleId OR email:
   a. Found by googleId → update lastLogin, go to step 11
   b. Found by email (email+pass account) → link accounts:
      - Set user.googleId = googleId
      - Set user.authProvider = BOTH
      - Go to step 11
   c. Not found → create new user:
      - authProvider: GOOGLE
      - avatarUrl: Google profile picture (Cloudinary mirrored)
      - Go to step 10 if new user

10. (New users only) Return { newUser: true, partialToken }
    - Frontend shows role selection page
    - POST /api/auth/google/complete { role, phone } to finish profile
    - Phone OTP required for Vendor / Delivery roles

11. Issue Locafy JWT pair (access + refresh tokens)
    Return { accessToken, user }

12. NextAuth stores accessToken in JWT session
13. Frontend: Zustand hydrated from session
14. Redirect to role-appropriate dashboard
```

### Maven Dependency

```xml
<dependency>
  <groupId>com.google.auth</groupId>
  <artifactId>google-auth-library-oauth2-http</artifactId>
  <version>1.23.0</version>
</dependency>
```

### Spring Boot Controller

```java
@PostMapping("/api/auth/google")
public ResponseEntity<AuthResponse> googleAuth(@RequestBody GoogleAuthRequest request) {
    GoogleIdToken.Payload payload = googleAuthService.verify(request.getIdToken());
    User user = userService.upsertGoogleUser(payload);
    String accessToken = jwtUtil.generateAccessToken(user);
    String refreshToken = jwtUtil.generateRefreshToken(user);
    // set refreshToken in HttpOnly cookie
    return ResponseEntity.ok(new AuthResponse(accessToken, UserDto.from(user)));
}
```

---

## Role-Based Authorization

### Spring Boot

```java
// SecurityConfig.java
http.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .requestMatchers("/api/vendors/**").hasRole("VENDOR")
    .requestMatchers("/api/delivery/**").hasRole("DELIVERY")
    .requestMatchers("/api/customers/**").hasRole("CUSTOMER")
    .anyRequest().authenticated()
);

// Method-level
@PreAuthorize("hasRole('VENDOR') and @shopService.isOwner(#shopId, authentication.name)")
public void updateShop(String shopId, ShopDto dto) { ... }
```

### Next.js Middleware

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (request.nextUrl.pathname.startsWith('/vendor') && token?.role !== 'VENDOR') {
    return NextResponse.redirect(new URL('/vendor/auth/login', request.url))
  }
  // same for /delivery, /admin
}
```

---

## Token Revocation

Redis is used as a blocklist for instant token invalidation:

```
On logout:
  SADD locafy:token:blocklist <refreshToken> EX 604800 (7 days TTL)

On each refresh:
  SISMEMBER locafy:token:blocklist <refreshToken>
  → If member: reject with 401
```

This allows immediate logout, admin-triggered account suspension, and secure multi-device logout.

---

## Account Linking

A user who signed up with email+password can later link their Google account:

```
POST /api/auth/google/link   (requires valid access token)
Body: { idToken: "<Google ID token>" }

1. Verify Google ID token
2. Check no other user owns this googleId
3. Set current user's googleId = googleId
4. Set authProvider = BOTH
5. Mirror Google profile picture to Cloudinary (optional)
```

To unlink:

```
DELETE /api/auth/google/unlink   (requires access token)

1. Verify user has a passwordHash set (can't unlink if no fallback auth method)
2. Clear user.googleId and set authProvider = EMAIL
```

---

## Password Reset

```
POST /api/auth/password/reset
Body: { email }

1. Generate time-limited reset token (JWT, 15 min)
2. Store token hash in Redis (TTL 15 min)
3. Send reset link via JavaMailSender:
   https://locafy.in/reset-password?token=<token>

GET /reset-password?token=...
→ Next.js validates token, shows new password form

PUT /api/auth/password
Body: { resetToken, newPassword }

1. Verify token against Redis hash
2. BCrypt hash new password
3. Update user.passwordHash
4. Invalidate all existing refresh tokens (clear from Redis)
5. Delete reset token from Redis
```
