export const SOCIAL_HANDLE = "tresetmob";

export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/tresetmob/",
  },
  {
    id: "tiktok",
    label: "TikTok",
    href: "https://www.tiktok.com/@tresetmob/",
  },
] as const;

export type SocialId = (typeof SOCIAL_LINKS)[number]["id"];
