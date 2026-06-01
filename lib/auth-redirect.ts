const DEFAULT_POST_LOGIN_PATH = "/app/dashboard"

/**
 * Allow only same-origin relative paths after OAuth / magic-link callback.
 * Rejects absolute URLs, protocol-relative paths, and strings containing `:`.
 */
export function sanitizeRedirectPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") return DEFAULT_POST_LOGIN_PATH
  const trimmed = next.trim()
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes(":")) {
    return DEFAULT_POST_LOGIN_PATH
  }
  return trimmed
}

/**
 * Pure auth redirect rules used by Supabase session middleware.
 * Kept separate for unit tests without mocking Next/Supabase.
 */
export function getAuthRedirectPath(pathname: string, hasUser: boolean): string | null {
  if (pathname.startsWith("/app") && !hasUser) return "/login"
  if (hasUser && (pathname === "/login" || pathname === "/signup")) return "/app/dashboard"
  return null
}
