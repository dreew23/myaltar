import { describe, expect, it } from "vitest"
import { getAuthRedirectPath, sanitizeRedirectPath } from "./auth-redirect"

describe("sanitizeRedirectPath", () => {
  it("allows safe relative paths", () => {
    expect(sanitizeRedirectPath("/app/dashboard")).toBe("/app/dashboard")
    expect(sanitizeRedirectPath("/app/settings")).toBe("/app/settings")
  })

  it("rejects open redirects", () => {
    expect(sanitizeRedirectPath("https://evil.com")).toBe("/app/dashboard")
    expect(sanitizeRedirectPath("//evil.com")).toBe("/app/dashboard")
    expect(sanitizeRedirectPath("javascript:alert(1)")).toBe("/app/dashboard")
  })

  it("defaults null/empty to dashboard", () => {
    expect(sanitizeRedirectPath(null)).toBe("/app/dashboard")
    expect(sanitizeRedirectPath("")).toBe("/app/dashboard")
  })
})

describe("getAuthRedirectPath", () => {
  it("sends unauthenticated users to login for /app routes", () => {
    expect(getAuthRedirectPath("/app/dashboard", false)).toBe("/login")
    expect(getAuthRedirectPath("/app/prayer", false)).toBe("/login")
  })

  it("allows unauthenticated users on public routes", () => {
    expect(getAuthRedirectPath("/login", false)).toBeNull()
    expect(getAuthRedirectPath("/", false)).toBeNull()
  })

  it("redirects authenticated users away from login and signup", () => {
    expect(getAuthRedirectPath("/login", true)).toBe("/app/dashboard")
    expect(getAuthRedirectPath("/signup", true)).toBe("/app/dashboard")
  })

  it("does not redirect authenticated users on /app", () => {
    expect(getAuthRedirectPath("/app/dashboard", true)).toBeNull()
  })
})
