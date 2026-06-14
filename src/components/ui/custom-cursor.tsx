"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor profesional de dos piezas:
 *  - punto sólido que sigue al puntero con precisión (lag mínimo).
 *  - anillo que persigue con lag suave (lerp) y se expande/rellena sobre
 *    elementos interactivos, encogiendo el punto.
 * Solo en punteros finos; respeta reduce-motion. Oculta el cursor nativo vía
 * la clase `cursor-custom` en <html>.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    document.documentElement.classList.add("cursor-custom");

    // Posición objetivo (puntero real) y posiciones interpoladas.
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let dx = tx;
    let dy = ty;
    let rx = tx;
    let ry = ty;
    let visible = false;
    let presionado = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        ring.style.opacity = "1";
        dot.style.opacity = "1";
      }
      const interactivo = (e.target as Element | null)?.closest(
        "a, button, [role='button'], input, select, textarea, label, summary",
      );
      const estado = interactivo ? "1" : "0";
      ring.dataset.activo = estado;
      dot.dataset.activo = estado;
    };
    const onLeave = (e: MouseEvent) => {
      if (e.relatedTarget === null) {
        visible = false;
        ring.style.opacity = "0";
        dot.style.opacity = "0";
      }
    };
    const onDown = () => {
      presionado = true;
      ring.dataset.press = "1";
    };
    const onUp = () => {
      presionado = false;
      ring.dataset.press = "0";
    };

    const loop = () => {
      // El punto casi pega al puntero; el anillo arrastra con más inercia.
      dx += (tx - dx) * 0.4;
      dy += (ty - dy) * 0.4;
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)${
        presionado ? " scale(0.8)" : ""
      }`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.classList.remove("cursor-custom");
    };
  }, []);

  return (
    <>
      <div ref={ringRef} aria-hidden className="cursor-ring" style={{ opacity: 0 }} />
      <div ref={dotRef} aria-hidden className="cursor-dot" style={{ opacity: 0 }} />
    </>
  );
}
