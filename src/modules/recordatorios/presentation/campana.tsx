import Link from "next/link";
import { contarNoLeidas } from "../application/notificaciones-actions";

export async function Campana() {
  const noLeidas = await contarNoLeidas();
  return (
    <Link href="/recordatorios" aria-label="Notificaciones" className="relative text-texto-tenue hover:text-texto">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
      {noLeidas > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-acento px-1 text-[10px] font-semibold text-white">
          {noLeidas > 99 ? "99+" : noLeidas}
        </span>
      )}
    </Link>
  );
}
