"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";

interface LeoAvatarProps {
  isListening: boolean;
  message: string;
  onListen: () => void;
  onSpeak: () => void;
}

export default function LeoAvatar({
  isListening,
  message,
  onListen,
  onSpeak,
}: LeoAvatarProps) {
  return (
    <div className="fixed right-2 top-32 z-[900] flex max-w-[calc(100vw-1rem)] items-start justify-end gap-2 sm:right-5 sm:top-36">
      <div className="pointer-events-none flex flex-col items-end gap-2">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-[220px] rounded-2xl rounded-tr-sm border border-white/15 bg-[var(--up-blue)]/95 px-4 py-3 text-xs leading-relaxed text-white shadow-2xl backdrop-blur sm:max-w-xs sm:text-sm"
        >
          {message}
        </motion.div>

        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={onSpeak}
            className="rounded-2xl border border-white/15 bg-[var(--up-blue)]/95 p-3 text-white shadow-xl backdrop-blur transition hover:bg-[var(--up-blue-dark)]"
            aria-label="Leo habla"
          >
            <Volume2 size={18} />
          </button>
          <button
            type="button"
            onClick={onListen}
            className={`rounded-2xl border p-3 text-white shadow-xl backdrop-blur transition ${
              isListening
                ? "border-[var(--up-red)] bg-[var(--up-red)]"
                : "border-white/15 bg-[var(--up-blue)]/95 hover:bg-[var(--up-blue-dark)]"
            }`}
            aria-label="Leo escucha"
          >
            <Mic size={18} />
          </button>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="pointer-events-none relative h-16 w-16 shrink-0 drop-shadow-2xl sm:h-32 sm:w-32"
      >
        <Image
          src="/leo-avatar-cutout.png"
          alt="Leo"
          fill
          sizes="(min-width: 640px) 128px, 64px"
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
