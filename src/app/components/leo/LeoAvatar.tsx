"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface LeoAvatarProps {
  message: string;
}

export default function LeoAvatar({ message }: LeoAvatarProps) {
  return (
    <div className="pointer-events-none fixed right-2 top-32 z-[900] flex max-w-[calc(100vw-1rem)] items-start justify-end gap-2 sm:right-5 sm:top-36">
      <motion.div
        key={message}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="max-w-[220px] rounded-2xl rounded-tr-sm border border-white/15 bg-[var(--up-blue)]/95 px-4 py-3 text-xs leading-relaxed text-white shadow-2xl backdrop-blur sm:max-w-xs sm:text-sm"
      >
        {message}
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative h-16 w-16 shrink-0 drop-shadow-2xl sm:h-32 sm:w-32"
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
