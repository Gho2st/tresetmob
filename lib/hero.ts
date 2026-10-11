import "server-only";
import { prisma } from "@/lib/prisma";

export type HeroMedia =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string };

export type LoginImage = { src: string; alt: string | undefined };

// Tabela Hero trzyma pojedyncze grafiki redakcyjne, każdą pod własnym kluczem:
// baner strony głównej i zdjęcie przy formularzu logowania. Nowa grafika tego
// typu to kolejny klucz, bez zmian w schemacie.
export const HERO_KEY = "singleton";
export const LOGIN_IMAGE_KEY = "login";

const FALLBACK: HeroMedia = { type: "video", src: "/video.mov" };

// Zdjęcie leżące w repozytorium — widać je, dopóki admin nie wgra własnego.
const LOGIN_IMAGE_FALLBACK = "/hero.png";

export async function getLoginImage(): Promise<LoginImage> {
  const row = await prisma.hero.findUnique({ where: { id: LOGIN_IMAGE_KEY } });
  return {
    src: row?.src ?? LOGIN_IMAGE_FALLBACK,
    alt: row?.alt ?? undefined,
  };
}

export async function getHeroMedia(): Promise<HeroMedia> {
  const hero = await prisma.hero.findUnique({ where: { id: HERO_KEY } });
  if (!hero) return FALLBACK;

  if (hero.type === "image") {
    return { type: "image", src: hero.src, alt: hero.alt ?? undefined };
  }
  return { type: "video", src: hero.src, poster: hero.poster ?? undefined };
}
