"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor personalizado: lágrima ámbar que sigue al puntero con lag suave (lerp)
 * y crece sobre elementos interactivos. Solo en punteros finos; respeta
 * reduce-motion. Oculta el cursor nativo vía la clase `cursor-custom` en <html>.
 */
export function CustomCursor() {
  const puntaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = puntaRef.current;
    if (!el) return;

    document.documentElement.classList.add("cursor-custom");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let visible = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      const interactivo = (e.target as Element | null)?.closest(
        "a, button, [role='button'], input, select, textarea, label",
      );
      el.dataset.activo = interactivo ? "1" : "0";
    };
    const onLeave = (e: MouseEvent) => {
      // mouseout burbujea entre hijos; solo ocultar al salir realmente de la ventana.
      if (e.relatedTarget === null) {
        visible = false;
        el.style.opacity = "0";
      }
    };

    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
      document.documentElement.classList.remove("cursor-custom");
    };
  }, []);

  return (
    <div
      ref={puntaRef}
      aria-hidden
      style={{ opacity: 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[100] -ml-1 -mt-1 transition-opacity duration-300 [transform:translate3d(-100px,-100px,0)]"
    >
      <div className="cursor-punta">
        <svg width="26" height="26" viewBox="0 0 26 26" className="drop-shadow-[0_2px_6px_rgba(245,165,36,0.5)]">
          <path
            d="M4 3 L21 12 L12.5 13.5 L11 21 Z"
            fill="#f5a524"
            stroke="#1a1404"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
