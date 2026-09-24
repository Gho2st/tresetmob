export type ProductImage = { url: string; alt: string };

type WithImages = {
  title: string;
  images: string[];
  imageAlts: string[];
};

/**
 * Domyślny tekst alternatywny dla zdjęcia bez własnego opisu. Pusty alt to dla
 * wyszukiwarki zdjęcie bez znaczenia, więc lepszy jest choćby tytuł produktu.
 */
export function fallbackAlt(title: string, index: number) {
  return index === 0 ? title : `${title} — zdjęcie ${index + 1}`;
}

/**
 * W bazie adresy zdjęć i ich opisy to dwie tablice trzymane w tej samej
 * kolejności (Product.images i Product.imageAlts). Tutaj paruje się je po
 * indeksie, żeby reszta aplikacji widziała jeden obiekt na zdjęcie.
 */
export function productImages({
  title,
  images,
  imageAlts,
}: WithImages): ProductImage[] {
  return images.map((url, index) => ({
    url,
    alt: imageAlts[index]?.trim() || fallbackAlt(title, index),
  }));
}
