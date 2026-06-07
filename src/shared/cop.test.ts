import { describe, it, expect } from "vitest";
import { formatCOP } from "./cop";

describe("formatCOP", () => {
  it("formatea pesos sin decimales con separador de miles", () => {
    expect(formatCOP(1750905)).toBe("$ 1.750.905");
  });
  it("formatea cero", () => {
    expect(formatCOP(0)).toBe("$ 0");
  });
  it("redondea al peso (half-up)", () => {
    expect(formatCOP(1234.5)).toBe("$ 1.235");
  });
});
