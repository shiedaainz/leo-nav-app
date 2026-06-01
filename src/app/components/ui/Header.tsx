"use client";

import Link from "next/link";
import { CalendarDays, LogOut, User } from "lucide-react";

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export default function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 px-4 pt-6 sm:px-6 sm:pt-8">
      <div className="min-w-0">
        <p className="text-sm text-[var(--up-gray)]/80">Bienvenido</p>
        <h1 className="truncate text-xl font-bold leading-tight sm:text-2xl">
          {userName}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/schedule"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          aria-label="Horarios"
        >
          <CalendarDays size={20} />
        </Link>
        <Link
          href="/profile"
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          aria-label="Perfil"
        >
          <User size={20} />
        </Link>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
          aria-label="Cerrar sesion"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
