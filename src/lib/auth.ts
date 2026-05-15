import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "./db";
import "./auth-types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };

        const user = await db.user.findUnique({
          where: { username },
          include: { role: true },
        });

        if (!user) return null;

        const isValid = await compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          role: user.role.name,
          permissions: user.role.permissions,
          scopes: user.role.scopes || "[]",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.username = user.username!;
        token.role = user.role!;
        token.permissions = user.permissions!;
        token.scopes = user.scopes!;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id!;
        session.user.username = token.username!;
        session.user.role = token.role!;
        session.user.permissions = token.permissions!;
        session.user.scopes = token.scopes!;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      try {
        await db.loginLog.create({
          data: { userId: user.id, username: user.username || user.name || "unknown", success: true },
        });
      } catch { /* silent */ }
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
});
