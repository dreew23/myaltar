/**
 * Pure auth redirect rules used by Supabase session middleware.
 * Kept separate for unit tests without mocking Next/Supabase.
 */
export function getAuthRedirectPath(pathname: string, hasUser: boolean): string | null {
  if (pathname.startsWith("/app") && !hasUser) return "/login"
  if (hasUser && (pathname === "/login" || pathname === "/signup")) return "/app/dashboard"
  return null
}
