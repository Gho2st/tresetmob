import "server-only";
import { prisma } from "@/lib/prisma";

const TOKEN_ID = "singleton";
const GRAPH = "https://graph.instagram.com";

// Zdjęcie z sekcji socialowej odświeża się raz na godzinę — Instagram nie jest
// treścią, dla której warto odpytywać API przy każdym wejściu na stronę.
const REVALIDATE_SECONDS = 3600;

export type InstagramPost = {
  imageUrl: string;
  permalink: string;
  caption: string | null;
  timestamp: string;
  /** szerokość / wysokość kadru — sekcja socialowa układa się pod nią */
  aspectRatio: number;
  isVideo: boolean;
};

export type TokenStatus = {
  source: "baza" | "env" | "brak";
  expiresAt: Date | null;
  updatedAt: Date | null;
};

type MediaItem = {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
};

// Wpis w bazie może nie istnieć, a przed migracją nie istnieje nawet tabela —
// jedno i drugie ma skończyć się spokojnym null, nie wyjątkiem.
async function readStoredToken() {
  try {
    return await prisma.instagramToken.findUnique({ where: { id: TOKEN_ID } });
  } catch {
    return null;
  }
}

function envToken() {
  return process.env.INSTA_TOKEN?.trim() || null;
}

/**
 * Token bierzemy z bazy, a gdy jej wpisu nie ma — ze zmiennej środowiskowej.
 * Baza ma pierwszeństwo, bo to tam odkłada się wynik odświeżania, więc jej
 * token jest nowszy niż ten wklejony ręcznie na start.
 */
async function resolveToken(): Promise<string | null> {
  const row = await readStoredToken();
  if (row && row.expiresAt.getTime() > Date.now()) return row.token;
  return envToken();
}

export async function getTokenStatus(): Promise<TokenStatus> {
  const row = await readStoredToken();
  if (row) {
    return {
      source: "baza",
      expiresAt: row.expiresAt,
      updatedAt: row.updatedAt,
    };
  }
  return {
    source: envToken() ? "env" : "brak",
    expiresAt: null,
    updatedAt: null,
  };
}

/**
 * Przedłuża token o kolejne 60 dni i zapisuje nowy w bazie. Meta przyjmuje
 * wyłącznie token długoterminowy, który sam jeszcze nie wygasł — po wygaśnięciu
 * nie ma czego odświeżać i trzeba wkleić nowy z panelu Meta.
 */
export async function refreshInstagramToken(token: string) {
  const url = new URL(`${GRAPH}/refresh_access_token`);
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", token);

  const response = await fetch(url, { cache: "no-store" });
  const body = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!response.ok || !body.access_token || !body.expires_in) {
    throw new Error(body.error?.message ?? "Instagram odrzucił token.");
  }

  const expiresAt = new Date(Date.now() + body.expires_in * 1000);
  await prisma.instagramToken.upsert({
    where: { id: TOKEN_ID },
    update: { token: body.access_token, expiresAt },
    create: { id: TOKEN_ID, token: body.access_token, expiresAt },
  });

  return { expiresAt };
}

/**
 * To samo, ale na tokenie leżącym w bazie — tak wywołuje to cron i przycisk
 * „Odśwież teraz" w panelu.
 */
export async function refreshStoredInstagramToken() {
  const token = await resolveToken();
  if (!token) {
    throw new Error("Token nie jest ustawiony ani w bazie, ani w INSTA_TOKEN.");
  }
  // Wynik ląduje w bazie, więc pierwsze odświeżenie tokenu z INSTA_TOKEN
  // przenosi go tam na stałe i od tego momentu cron ma co przedłużać.
  return refreshInstagramToken(token);
}

/**
 * API Instagrama nie podaje wymiarów posta, więc czytamy je z nagłówka JPEG.
 * Wystarczy początek pliku — CDN Instagrama honoruje Range, a znacznik SOF
 * leży przed danymi obrazu, za co najwyżej jednym segmentem APP (≤ 64 KB).
 */
async function readAspectRatio(imageUrl: string): Promise<number | null> {
  try {
    const response = await fetch(imageUrl, {
      headers: { Range: "bytes=0-131071" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const buf = new Uint8Array(await response.arrayBuffer());
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;

    let i = 2;
    while (i + 8 < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      // SOF0–SOF15 poza DHT (C4), JPG (C8) i DAC (CC) niosą wymiary obrazu.
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        const height = (buf[i + 5] << 8) | buf[i + 6];
        const width = (buf[i + 7] << 8) | buf[i + 8];
        return width && height ? width / height : null;
      }
      i += 2 + ((buf[i + 2] << 8) | buf[i + 3]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Najnowszy post nadający się na kadr w sekcji socialowej. Zwraca null przy
 * każdym problemie — brak tokenu, wygasły token, awaria API — bo sekcja ma
 * wtedy pokazać zdjęcie z repozytorium, a nie puste miejsce.
 */
export async function getLatestInstagramPost(): Promise<InstagramPost | null> {
  try {
    const token = await resolveToken();
    if (!token) return null;

    const url = new URL(`${GRAPH}/me/media`);
    url.searchParams.set(
      "fields",
      "id,media_type,media_url,thumbnail_url,permalink,caption,timestamp",
    );
    url.searchParams.set("limit", "5");
    url.searchParams.set("access_token", token);

    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;

    const body = (await response.json()) as { data?: MediaItem[] };

    for (const item of body.data ?? []) {
      // Dla filmu media_url to plik wideo, więc jako kadr bierzemy miniaturę.
      const imageUrl =
        item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;
      if (!imageUrl) continue;

      return {
        imageUrl,
        permalink: item.permalink,
        caption: item.caption ?? null,
        timestamp: item.timestamp,
        aspectRatio:
          (await readAspectRatio(imageUrl)) ??
          (item.media_type === "VIDEO" ? 9 / 16 : 1),
        isVideo: item.media_type === "VIDEO",
      };
    }

    return null;
  } catch {
    return null;
  }
}
