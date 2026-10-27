import { NextResponse } from "next/server";
import { unsubscribe } from "@/lib/newsletter";

// „Wypisz się” wbudowane w Gmaila / Apple Mail (nagłówek List-Unsubscribe-Post,
// RFC 8058) wysyła tu POST bez udziału klienta — wypisujemy od razu.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  await unsubscribe(token);
  return new NextResponse(null, { status: 200 });
}

// Starsze programy pocztowe po prostu otwierają ten adres — kierujemy na
// stronę z przyciskiem, bo samo wejście nie może nikogo wypisać.
export function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  return NextResponse.redirect(new URL(`/newsletter/wypisz?token=${token}`, url));
}
