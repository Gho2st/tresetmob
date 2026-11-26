import { NextResponse } from "next/server";
import { abandonStaleOrders } from "@/lib/orders";

// Co kwadrans porządkuje nieopłacone zamówienia starsze niż godzina (patrz
// lib/orders.ts). Ten sam krok robi też każdy odczyt zamówień — cron dba
// tylko o to, żeby baza była aktualna także wtedy, gdy nikt niczego nie otwiera.
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

  const abandoned = await abandonStaleOrders();
  return NextResponse.json({ ok: true, abandoned });
}
