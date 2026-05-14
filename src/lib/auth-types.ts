import type { DefaultSession } from "next-auth";
import type { DefaultUser } from "@auth/core/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
      permissions: string;
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    username: string;
    role: string;
    permissions: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    permissions: string;
  }
}
