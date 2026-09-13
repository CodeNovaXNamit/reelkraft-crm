import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { logger } from "@/lib/logging/logger";
import { isAuthBypassEnabled } from "@/lib/auth/testing-bypass";
import {
  assertWorkspaceEmail,
  findActiveEmployeeByEmail,
  resolveGoogleWorkspaceSignIn,
} from "@/services/auth-service";
import { roles, type Role } from "@/types/domain";

function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/unauthorized",
  },
  providers: [
    Google({
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    authorized({ auth: session, request }) {
      const pathname = request.nextUrl.pathname;
      const isPublic =
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/unauthorized" ||
        pathname === "/api/health" ||
        pathname.startsWith("/api/auth/");

      return isAuthBypassEnabled() || isPublic || session?.user?.status === "ACTIVE";
    },
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return false;
      }

      const email = typeof profile?.email === "string" ? profile.email : "";
      const name = typeof profile?.name === "string" ? profile.name : email;
      const image = typeof profile?.picture === "string" ? profile.picture : undefined;
      const emailVerified = profile?.email_verified === true;

      try {
        await resolveGoogleWorkspaceSignIn({
          email,
          name,
          image,
          emailVerified,
        });
        return true;
      } catch (error) {
        logger.warn("google_sign_in_rejected", {
          email,
          reason: error instanceof Error ? error.message : "unknown",
        });
        return "/unauthorized";
      }
    },
    async jwt({ token }) {
      if (!token.email) {
        return token;
      }

      try {
        const email = assertWorkspaceEmail(token.email, true);
        const employee = await findActiveEmployeeByEmail(email);
        token.employeeId = employee?.id;
        token.role = employee?.role;
        token.employeeStatus = employee?.status;
      } catch {
        token.employeeId = undefined;
        token.role = undefined;
        token.employeeStatus = undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (
        typeof token.employeeId === "string" &&
        isRole(token.role) &&
        (token.employeeStatus === "ACTIVE" || token.employeeStatus === "INACTIVE")
      ) {
        session.user.employeeId = token.employeeId;
        session.user.role = token.role;
        session.user.status = token.employeeStatus;
      }

      return session;
    },
  },
});
