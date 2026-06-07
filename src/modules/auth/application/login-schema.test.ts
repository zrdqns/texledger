import { describe, it, expect } from "vitest";
import { loginSchema } from "./login-schema";

describe("loginSchema", () => {
  it("acepta email y password válidos", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "secreto123" });
    expect(r.success).toBe(true);
  });
  it("rechaza email inválido", () => {
    const r = loginSchema.safeParse({ email: "no-es-email", password: "secreto123" });
    expect(r.success).toBe(false);
  });
  it("rechaza password vacío", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(r.success).toBe(false);
  });
});
