import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Required on Vercel — infers NEXTAUTH_URL from the deployment host
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Store the Google ID token so we can forward it to our backend
      if (account?.id_token) {
        token.googleIdToken = account.id_token
      }
      return token
    },
    async session({ session, token }) {
      // Expose the Google ID token on the session for client use
      session.googleIdToken = token.googleIdToken as string | undefined
      return session
    },
  },
  pages: {
    signIn: '/auth/google',
  },
})
