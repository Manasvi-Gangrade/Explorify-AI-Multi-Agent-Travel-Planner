// main next auth config

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { getUserByEmail, createUser } from "@/lib/db-helpers";
import { randomUUID } from "crypto";
import { verifyPassword } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // --- DEVELOPMENT PRESENTATION BYPASS ---
        if (
          credentials.email === "test@explorify.com" &&
          credentials.password === "password123"
        ) {
          return {
            id: "dev-user-id",
            email: "test@explorify.com",
            name: "Dev Presenter",
          };
        }

        let existingUser = await getUserByEmail(credentials.email as string).catch(() => null);

        if (!existingUser) {
          // Auto-create account for seamless demo presentation login
          try {
            const newUserId = randomUUID();
            existingUser = {
              userId: newUserId,
              email: credentials.email as string,
              name: (credentials.email as string).split("@")[0],
              role: "user",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          } catch (e) {
            console.error("Auto-user fallback error:", e);
          }
        }

        return {
          id: existingUser?.userId || "demo-user-id",
          email: credentials.email as string,
          name: existingUser?.name || "Explorer",
        };
      },
    }),
  ],
  callbacks: {
    //sign up logic is implemented separately in app/api/auth/signup/route.ts

    async signIn({ user, account }) {
      if (!user?.email) return false;

      // Bypass DB user creation check for test user
      if (user.email === "test@explorify.com") {
        return true;
      }

      // Only create user for OAuth providers (Google)
      if (account?.provider === "google") {
        const existing = await getUserByEmail(user.email);

        if (!existing) {
          console.log("Creating new user:", user.email);

          await createUser({
            userId: randomUUID(),
            name: user.name || "",
            email: user.email,
            image: user.image || undefined,
            role: "user",
            vendorVerified: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token.email) {
        if (token.email === "test@explorify.com") {
          session.user.id = "dev-user-id";
          session.user.role = "user";
        } else {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            session.user.id = dbUser.userId;
            session.user.role = dbUser.role;
          }
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email;
      if (token.email) {
        if (token.email === "test@explorify.com") {
          token.role = "user";
          token.userId = "dev-user-id";
        } else {
          const dbUser = await getUserByEmail(token.email as string);
          if (dbUser) {
            // enrich token for middleware
            token.role = dbUser.role;
            token.userId = dbUser.userId;
          }
        }
      }
      return token;
    },
  },
  pages: { signIn: "/auth/sign-in" },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "lvXM6H6xcfn6wPnF/ChJXfQ3h1Bdckc2pxlWexMxQCA=",
  trustHost: true,
});
