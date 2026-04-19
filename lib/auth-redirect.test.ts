import { describe, expect, it } from "vitest"
import { getAuthRedirectPath } from "./auth-redirect"

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
