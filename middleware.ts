import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/habits/:path*",
    "/analytics/:path*",
    "/social/:path*",
    "/explore/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
