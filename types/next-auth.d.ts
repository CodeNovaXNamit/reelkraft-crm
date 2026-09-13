import type { DefaultSession } from "next-auth";
import type { Role } from "@/types/domain";

declare module "next-auth" {
  interface Session {
    user: {
      employeeId: string;
      role: Role;
      status: "ACTIVE" | "INACTIVE";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    employeeId?: string;
    role?: Role;
    employeeStatus?: "ACTIVE" | "INACTIVE";
  }
}
