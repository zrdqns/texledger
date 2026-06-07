import { describe, it, expect } from "vitest";
import { hoyBogota, formatFechaBogota } from "./fecha";

describe("fecha America/Bogota", () => {
  it("formatea una fecha ISO (date) a dd/mm/aaaa sin corrimiento de zona", () => {
    expect(formatFechaBogota("2026-01-31")).toBe("31/01/2026");
  });
  it("hoyBogota devuelve un string YYYY-MM-DD", () => {
    expect(hoyBogota()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
