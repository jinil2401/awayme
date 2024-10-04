import type { Metadata } from "next";
import "./globals.css";
import { UserContext } from "@/context/userContext";
import { CalendarContext } from "@/context/calendarContext";

export const metadata: Metadata = {
  title: "Away Me",
  description: "Calendar filling app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <UserContext>
          <CalendarContext>{children}</CalendarContext>
        </UserContext>
      </body>
    </html>
  );
}
