import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions, Profile } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";



type GoogleProfile = {
  sub: string;
  name: string;
  email: string;
  picture?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    // ✅ Google OAuth Provider
    {
      id: "google",
      name: "Google",
      type: "oauth",
      wellKnown: "https://accounts.google.com/.well-known/openid-configuration",
      authorization: { params: { scope: "openid email profile" } },
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture ?? null,
        };
      },
    } as any,

    // ✅ Email/Password Provider
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Sai tài khoản hoặc mật khẩu.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Sai tài khoản hoặc mật khẩu.");
        }


        // ✅ Kiểm tra đã xác thực email chưa
        if (!user.emailVerified) {
          throw new Error("Vui lòng xác thực email trước khi đăng nhập.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  pages: {
    signIn: "/signin",
    error: "/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: true,

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google" && user?.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              name: user.name ?? "Google User",
              email: user.email,
              password: "",
              role: "USER",
            },
          });

          token.user = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          };
        } else {
          token.user = {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          };
        }
      }

      if (user && !token.user) {
        token.user = user;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = token.user as any;
      return session;
    },

    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
};
