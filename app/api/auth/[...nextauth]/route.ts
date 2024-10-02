// pages/api/auth/[...nextauth].js

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

import { AuthOptions, Session } from "next-auth";

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

const microsoftClientId = process.env.AZURE_AD_CLIENT_ID || "";
const microsoftClientSecret = process.env.AZURE_AD_CLIENT_SECRET || "";
const microsoftTenantId = process.env.AZURE_AD_TENANT_ID || "";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/calendar",
          ].join(" "),
          response: "code",
        },
      },
    }),
    AzureADProvider({
      clientId: microsoftClientId,
      clientSecret: microsoftClientSecret,
      tenantId: microsoftTenantId,
      authorization: {
        params: { scope: "openid email profile User.Read Calendars.ReadWrite" },
      },
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      console.log("user", user);
      // push the user to the database
      // add a new calendar in the database
      // assign user id to the calendar
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
      }
      return token;
    },
  },
};

export interface EnrichedSession extends Session {
  provider: string;
  accessToken: string;
  refreshToken: string;
}

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
