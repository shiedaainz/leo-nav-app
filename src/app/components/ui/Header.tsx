"use client";

import Link from "next/link";
import { CalendarDays, LogOut, User } from "lucide-react";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export default function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 pt-8">
      <div className="min-w-0">
        <p className="text-sm text-[var(--up-gray)]/80">Bienvenido</p>
        <h1 className="truncate text-2xl font-bold">{userName}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/schedule"
          className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20"
          aria-label="Horarios"
        >
          <CalendarDays size={22} />
        </Link>
        <Link
          href="/profile"
          className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20"
          aria-label="Perfil"
        >
          <User size={22} />
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="rounded-2xl bg-white/10 p-3 transition hover:bg-white/20"
          aria-label="Cerrar sesion"
        >
          <LogOut size={22} />
        </button>
      </div>
    </header>
  );
}
