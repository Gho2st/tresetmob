import Image from "next/image";
import Link from "next/link";
import { signIn } from "@/auth";

export default function Logowanie() {
  return (
    <section className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col bg-white text-black lg:flex-row">
      {/* ---------- zdjęcie ---------- */}
      <div className="relative hidden h-64 w-full lg:block lg:h-auto lg:w-1/2">
        <Image
          src="/hero.png"
          alt=""
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
      </div>

      {/* ---------- formularz ---------- */}
      <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-16 sm:px-12 lg:w-1/2">
        <div className="flex w-full max-w-xs flex-col gap-10">
          <div className="flex flex-col gap-4">
            <span className="text-xs tracking-[0.3em] text-black/40">
              LOGOWANIE
            </span>
            <h1 className="font-bebas text-5xl uppercase leading-[0.9] tracking-tight">
              Witaj
              <br />z powrotem
            </h1>
            <p className="text-sm leading-relaxed text-black/50">
              Zaloguj się, żeby śledzić zamówienia i wracać do ulubionych
              kolekcji.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/konto" });
            }}
          >
            <button
              type="submit"
              className="group inline-flex w-full items-center justify-center gap-3 border border-black/30 px-6 py-4 text-sm tracking-[0.15em] transition-colors hover:border-black hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
                />
                <path
                  fill="#34A853"
                  d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
                />
                <path
                  fill="#FBBC05"
                  d="M3.95 10.7A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z"
                />
                <path
                  fill="#EA4335"
                  d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
                />
              </svg>
              <span className="transition-colors">Kontynuuj przez Google</span>
            </button>
          </form>

          <p className="text-center text-xs leading-relaxed text-black/40">
            Logując się, akceptujesz{" "}
            <Link href="/regulamin" className="underline hover:text-black">
              regulamin
            </Link>{" "}
            i{" "}
            <Link
              href="/polityka-prywatnosci"
              className="underline hover:text-black"
            >
              politykę prywatności
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
