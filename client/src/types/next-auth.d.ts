/// <reference types="next-auth" />


import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      role: string; // 👈 Bổ sung role tại đây
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email: string;
    role: "USER" | "ADMIN"
  }
}
