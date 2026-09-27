import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

type Props = { searchParams: Promise<{ blad?: string }> };

async function authenticate(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin/produkty",
    });
  } catch (error) {
    // signIn() na sukces i tak rzuca (przekierowanie) — łapiemy TYLKO błąd logowania,
    // resztę (w tym przekierowanie) trzeba przepuścić dalej, inaczej nigdy nie zadziała.
    if (error instanceof AuthError) {
      redirect("/admin/login?blad=1");
    }
    throw error;
  }
}

export default async function AdminLogin({ searchParams }: Props) {
  const { blad } = await searchParams;

  return (
    <section className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-white px-6 text-center text-black">
      <div className="flex flex-col gap-3">
        <span className="text-xs tracking-[0.3em] text-black/40">ADMIN</span>
        <h1 className="font-bebas text-4xl tracking-tight uppercase sm:text-5xl">
          Panel administracyjny
        </h1>
        <p className="text-sm text-black/50">
          Zaloguj się, żeby zarządzać produktami.
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

      <div className="flex w-full max-w-sm items-center gap-4 text-xs tracking-[0.15em] text-black/30 uppercase">
        <span className="h-px flex-1 bg-black/10" />
        lub
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <form action={authenticate} className="flex w-full max-w-sm flex-col gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="E-mail"
          className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Hasło"
          className="border border-black/20 px-4 py-3 text-sm placeholder:text-black/30 focus:border-black focus:outline-none"
        />
        {blad && (
          <p className="text-xs text-red-700">
            Nieprawidłowy e-mail lub hasło.
          </p>
        )}
        <button
          type="submit"
          className="bg-black py-3.5 text-sm tracking-[0.15em] text-white uppercase transition-colors hover:bg-neutral-800"
        >
          Zaloguj się
        </button>
      </form>
    </section>
  );
}
