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
    <div className="fixed right-3 top-[15.5rem] z-[900] flex max-w-[calc(100vw-1.5rem)] flex-col items-end gap-2 sm:right-5 sm:top-56">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="pointer-events-none relative h-14 w-14 shrink-0 drop-shadow-2xl sm:h-28 sm:w-28"
      >
        <Image
          src="/leo-avatar-cutout.png"
          alt="Leo"
          fill
          sizes="(min-width: 640px) 112px, 56px"
          className="object-contain"
        />
      </motion.div>

      <div className="pointer-events-none flex flex-col items-end gap-2">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="max-w-[170px] rounded-xl rounded-tr-sm border border-white/15 bg-[var(--up-blue)]/95 px-3 py-2.5 text-xs leading-relaxed text-white shadow-2xl backdrop-blur sm:max-w-[260px] sm:px-4 sm:py-3 sm:text-sm"
        >
          {message}
        </motion.div>

        <div className="pointer-events-auto flex gap-2">
          <button
            type="button"
            onClick={onSpeak}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[var(--up-blue)]/95 text-white shadow-xl backdrop-blur transition hover:bg-[var(--up-blue-dark)]"
            aria-label="Leo habla"
          >
            <Volume2 size={18} />
          </button>
          <button
            type="button"
            onClick={onListen}
            className={`flex h-11 w-11 items-center justify-center rounded-xl border text-white shadow-xl backdrop-blur transition ${
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
    </div>
  );
}
