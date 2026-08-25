import "server-only";
import { prisma } from "@/lib/prisma";

export type HeroMedia =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string };

const FALLBACK: HeroMedia = { type: "video", src: "/video.mov" };

export async function getHeroMedia(): Promise<HeroMedia> {
  const hero = await prisma.hero.findUnique({ where: { id: "singleton" } });
  if (!hero) return FALLBACK;

  if (hero.type === "image") {
    return { type: "image", src: hero.src, alt: hero.alt ?? undefined };
  }
  return { type: "video", src: hero.src, poster: hero.poster ?? undefined };
}
