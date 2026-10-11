import { NextResponse } from "next/server";
import { refreshStoredInstagramToken } from "@/lib/instagram";

// Token Instagrama żyje 60 dni i każde odświeżenie liczy ten okres od nowa,
// więc cron chodzi codziennie — jedno nieudane wywołanie nic nie psuje, a przy
// awarii zostaje prawie dwa miesiące zapasu na reakcję.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET nie jest ustawiony." },
      { status: 500 },
    );
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Brak uprawnień." }, { status: 401 });
  }

  try {
    const { expiresAt } = await refreshStoredInstagramToken();
    return NextResponse.json({ ok: true, expiresAt });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Błąd odświeżania." },
      { status: 500 },
    );
  }
}
