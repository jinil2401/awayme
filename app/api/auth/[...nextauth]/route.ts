import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

import { NextAuthOptions, Session } from "next-auth";
import { cookies } from "next/headers";
import connect from "@/lib/db";
import User from "@/lib/models/user";
import Calendar from "@/lib/models/calendar";
import { Types } from "mongoose";
import { encrypt } from "@/utils/crypto";

const googleClientId = process.env.GOOGLE_CLIENT_ID || "";
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

const microsoftClientId = process.env.AZURE_AD_CLIENT_ID || "";
const microsoftClientSecret = process.env.AZURE_AD_CLIENT_SECRET || "";
const microsoftTenantId = process.env.AZURE_AD_TENANT_ID || "";

const authOptions: NextAuthOptions = {
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
    async signIn({ user, account }) {
      if (account && user) {
        const cookieStore = cookies();
        // fetch the user details from the cookie store
        const userData = JSON.parse(cookieStore.get("userData")?.value || "{}");
        // fetch the calendar name for the cookie store
        const calendarName = cookieStore.get("calendarName")?.value;

        // establish the connection with database
        await connect();

        // check if the store exists in the database
        const selectedUser = await User.findById(userData._id);
        if (!selectedUser) {
          false;
        }

        // check if the calendar exists in the database
        const selectedCalendar = await Calendar.findOne({
          email: user?.email,
          user: new Types.ObjectId(selectedUser._id),
        });

        // if the calendar exists in the database
        if (selectedCalendar) {
          // delete the calendar name from the cookies
          cookieStore.delete("calendarName");
          // throw an error stating that the calendar is already in the database
          throw new Error("user calendar is already imported!");
        }

        // extract the access and the refresh token
        const accessToken = account?.access_token || "";
        const refreshToken = account?.refresh_token || "";

        // excrypt the access token and refresh token
        const access_token = encrypt(accessToken);
        const refresh_token = encrypt(refreshToken);

        // add a new calendar in the database
        // create the new calendar object
        // assign user id to the calendar
        const newCalendar = new Calendar({
          name: calendarName,
          email: user?.email,
          access_token,
          refresh_token,
          provider: account?.provider,
          expires_at: account?.expires_at,
          user: new Types.ObjectId(selectedUser._id),
        });

        // save the info in the dabatabse
        await newCalendar.save();

        // delete the calendar name from the cookies
        cookieStore.delete("calendarName");
      }
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
  pages: {
    error: "/auth/error",
  },
};

export interface EnrichedSession extends Session {
  provider: string;
  accessToken: string;
  refreshToken: string;
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
