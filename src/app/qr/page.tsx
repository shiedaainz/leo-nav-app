import Image from "next/image";
import Link from "next/link";

const leoUrl = "https://leo-nav-app.vercel.app";

export default function QrPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--up-blue-dark)] px-4 py-6 text-white sm:px-5 sm:py-8">
      <section className="flex w-full max-w-md flex-col items-center gap-6 rounded-2xl border border-white/10 bg-[var(--up-blue)]/80 p-6 text-center shadow-2xl sm:p-8">
        <div className="relative h-24 w-20 drop-shadow-2xl sm:h-28 sm:w-24">
          <Image
            src="/leo-logo.png"
            alt="Leo"
            fill
            priority
            sizes="96px"
            className="object-contain"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--up-gray)]/80">
            Universidad de Pamplona
          </p>
          <h1 className="text-3xl font-bold">Escanea para abrir Leo</h1>
          <p className="text-sm text-[var(--up-gray)]/80">
            Navegacion universitaria, rutas, horarios y camara guiada.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-4 shadow-2xl sm:p-5">
          <Image
            src="/leo-qr.png"
            alt="Codigo QR para abrir Leo"
            width={320}
            height={320}
            priority
            className="h-auto w-full max-w-[320px]"
          />
        </div>

        <Link
          href={leoUrl}
          className="break-all rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          {leoUrl}
        </Link>
      </section>
    </main>
  );
}
