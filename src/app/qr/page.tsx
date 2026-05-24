import Image from "next/image";
import Link from "next/link";

const leoUrl = "https://leo-nav-app.vercel.app";

export default function QrPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--up-blue-dark)] px-5 py-8 text-white">
      <section className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="relative h-28 w-24 drop-shadow-2xl">
          <Image src="/leo-logo.png" alt="Leo" fill priority sizes="96px" className="object-contain" />
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

        <div className="rounded-3xl border border-white/10 bg-white p-5 shadow-2xl">
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
          className="break-all rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-[var(--up-gray)] transition hover:bg-white/20 hover:text-white"
        >
          {leoUrl}
        </Link>
      </section>
    </main>
  );
}
