import { describe, it, expect } from "vitest";
import { esBajoStock } from "./stock";

describe("esBajoStock", () => {
  it("true cuando stock < umbral", () => {
    expect(esBajoStock(5, 10)).toBe(true);
  });
  it("false cuando stock == umbral", () => {
    expect(esBajoStock(10, 10)).toBe(false);
  });
  it("false cuando stock > umbral", () => {
    expect(esBajoStock(15, 10)).toBe(false);
  });
});
