import { describe, it, expect } from "vitest";
import { diasRestantes, esVencido } from "./estado";

describe("diasRestantes", () => {
  it("0 si la fecha objetivo es hoy", () => {
    expect(diasRestantes("2026-06-10", "2026-06-10")).toBe(0);
  });
  it("positivo si falta tiempo", () => {
    expect(diasRestantes("2026-06-15", "2026-06-10")).toBe(5);
  });
  it("negativo si ya pasó", () => {
    expect(diasRestantes("2026-06-08", "2026-06-10")).toBe(-2);
  });
  it("cruza fin de mes", () => {
    expect(diasRestantes("2026-07-01", "2026-06-30")).toBe(1);
  });
  it("cruza fin de año", () => {
    expect(diasRestantes("2027-01-01", "2026-12-31")).toBe(1);
  });
});

describe("esVencido", () => {
  it("false si la fecha objetivo es hoy", () => {
    expect(esVencido("2026-06-10", "2026-06-10")).toBe(false);
  });
  it("false si es futura", () => {
    expect(esVencido("2026-06-11", "2026-06-10")).toBe(false);
  });
  it("true si ya pasó", () => {
    expect(esVencido("2026-06-09", "2026-06-10")).toBe(true);
  });
});
