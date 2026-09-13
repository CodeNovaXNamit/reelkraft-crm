import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { isAuthBypassEnabled } from "@/lib/auth/testing-bypass";
import { createRequestId } from "@/lib/ids";

const publicPaths = ["/", "/login", "/unauthorized", "/api/health"];

export const proxy = auth((request) => {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", createRequestId());

  const pathname = request.nextUrl.pathname;
  const isPublic =
    publicPaths.includes(pathname) || pathname.startsWith("/api/auth/");

  if (isAuthBypassEnabled()) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!isPublic && !request.auth?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isPublic && request.auth?.user?.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
