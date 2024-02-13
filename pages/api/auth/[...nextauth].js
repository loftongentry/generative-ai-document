import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const GOOGLE_OAUTH_ID = process.env.GOOGLE_OAUTH_ID
const GOOGLE_OAUTH_SECRET = process.env.GOOGLE_OAUTH_SECRET

const authOptions = {
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_OAUTH_ID,
      clientSecret: GOOGLE_OAUTH_SECRET,
      checks: 'none',
      authorization: {
        params: {
          access_type: 'offline',
          prompt: 'consent',
          scope: 'openid email profile'
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (Date.now() >= token.google_refresh) {
        console.log('Refreshed Token')
        try {
          const res = await fetch('https://oauth2.googleapis.com/token?', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              client_id: GOOGLE_OAUTH_ID,
              client_secret: GOOGLE_OAUTH_SECRET,
              grant_type: 'refresh_token',
              refresh_token: token.refreshToken
            })
          })

          const refreshedTokens = await res.json()

          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            google_refresh: Date.now() + (refreshedTokens.expires_in - 600) * 1000
          }
        } catch (error) {
          console.log(error)
          return { error: 'RefreshAccessTokenError' }
        }
      } else if (account && user) {
        return {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          google_refresh: Date.now() + (1800 * 1000),
          user
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user = token.user
      session.access_token = token.accessToken
      session.error = token.error

      return session
    },
    async signIn({ account, profile }) {
      if (account.provider === "google") {
        return profile.email_verified
      }
      return false
    },
  },
  theme: {
    colorScheme: 'light',
  }
}

export default NextAuth(authOptions)
