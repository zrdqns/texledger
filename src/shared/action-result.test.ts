import { describe, it, expect } from "vitest";
import { ok, fail, mapRpcError } from "./action-result";

describe("action-result", () => {
  it("ok envuelve data", () => {
    expect(ok(5)).toEqual({ ok: true, data: 5 });
  });
  it("fail arma error", () => {
    expect(fail("BUSINESS", "x")).toEqual({ ok: false, code: "BUSINESS", message: "x" });
  });
  it("mapRpcError mapea P0001 a BUSINESS con su mensaje", () => {
    const r = mapRpcError({ code: "P0001", message: "stock insuficiente" });
    expect(r).toEqual({ ok: false, code: "BUSINESS", message: "stock insuficiente" });
  });
  it("mapRpcError mapea otros códigos a UNEXPECTED", () => {
    const r = mapRpcError({ code: "08006", message: "conn fail" });
    expect(r.ok).toBe(false);
    expect(r).toMatchObject({ code: "UNEXPECTED" });
  });
});
