import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getAuthRedirectPath } from '@/lib/auth-redirect'

function pathnameNeedsAuthRedirect(pathname: string): boolean {
  if (pathname.startsWith('/app')) return true
  if (pathname === '/login') return true
  if (pathname === '/signup') return true
  return false
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Avoid remote getUser() on marketing and static routes — matches getAuthRedirectPath rules and
  // fixes slow loads when Supabase auth is latent or unreachable (middleware ran on every match).
  if (!pathnameNeedsAuthRedirect(pathname)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const redirectPath = getAuthRedirectPath(request.nextUrl.pathname, !!user)
  if (redirectPath) {
    const url = request.nextUrl.clone()
    url.pathname = redirectPath
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
