import { signIn } from "@/auth";

export default function AdminLogin() {
  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-white px-6 text-center text-black">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">ADMIN</span>
        <h1 className="font-bebas text-4xl tracking-tight uppercase sm:text-5xl">
          Panel administracyjny
        </h1>
        <p className="text-sm text-black/50">
          Zaloguj się kontem Google, żeby zarządzać produktami.
        </p>
      </div>

      <form
        className="w-full max-w-sm"
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/admin/produkty" });
        }}
      >
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-3 border border-black/30 px-7 py-4 sm:w-auto text-sm tracking-[0.15em] uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          Zaloguj się przez Google
        </button>
      </form>
    </section>
  );
}
