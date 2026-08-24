export type HeroMedia =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string };

// Admin: przełącz "type" na "image" lub "video" i podmień "src", żeby zmienić Hero.
export const heroMedia: HeroMedia = {
  type: "video",
  src: "/video.mov",
};
