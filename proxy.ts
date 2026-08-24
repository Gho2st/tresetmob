import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Next.js 16: middleware.ts jest deprecated na rzecz proxy.ts (ta sama logika, nowa nazwa).
// Tylko optymistyczny check — czy w ogóle jest sesja. Właściwa autoryzacja (czy to
// dopuszczony e-mail admina) jest w lib/admin.ts, wywoływana w app/admin/layout.tsx
// i w każdej Server Action osobno.
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname.startsWith("/admin/login");

  if (pathname.startsWith("/admin") && !isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
