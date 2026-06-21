import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const publicPaths = ["/login", "/api/auth", "/_next", "/favicon"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (publicPaths.some((p) => pathname.startsWith(p))) return NextResponse.next()

  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
