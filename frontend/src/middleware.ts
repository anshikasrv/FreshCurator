import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string;
    const path = req.nextUrl.pathname;

    // ── Auto-redirect based on role on root visit ──────────────────────────
    if (path === '/') {
      if (role === 'Admin')        return NextResponse.redirect(new URL('/admin', req.url));
      if (role === 'Delivery Boy') return NextResponse.redirect(new URL('/delivery/dashboard', req.url));
    }

    // ── Admin-only routes ──────────────────────────────────────────────────
    if (path.startsWith('/admin')) {
      if (role !== 'Admin') return NextResponse.redirect(new URL('/', req.url));
    }

    // ── Delivery Boy-only routes ───────────────────────────────────────────
    if (path.startsWith('/delivery')) {
      if (role !== 'Delivery Boy') return NextResponse.redirect(new URL('/', req.url));
    }

    // ── Block Admin/Delivery from user-only buyer flows ────────────────────
    const userOnlyPaths = ['/cart', '/checkout', '/orders', '/product', '/shop'];
    if (userOnlyPaths.some(p => path.startsWith(p))) {
      if (role === 'Admin')        return NextResponse.redirect(new URL('/admin', req.url));
      if (role === 'Delivery Boy') return NextResponse.redirect(new URL('/delivery/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login'
    }
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - signup (signup page)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|signup|public).*)",
  ],
};
