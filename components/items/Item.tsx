import Image from "next/image";
import Link from "next/link";
import PriceTag from "@/components/PriceTag";
import type { ProductImage } from "@/lib/product-images";

type ItemProps = {
  images: ProductImage[];
  title: string;
  priceCents: number;
  salePriceCents?: number | null;
  lowestPriceCents?: number | null;
  href: string;
  soldOut?: boolean;
};

const SIZES =
  "(max-width: 639px) 45vw, (max-width: 1279px) 30vw, (max-width: 1535px) 22vw, 28vw";

export default function Item({
  images,
  title,
  priceCents,
  salePriceCents,
  lowestPriceCents,
  href,
  soldOut = false,
}: ItemProps) {
  const [main, hover] = images;
  // Wygaszamy zdjęcie i opis, ale nie napis „Wyprzedane” — ten ma być czytelny.
  const dimmed = soldOut ? "opacity-40 transition-opacity group-hover:opacity-60" : "";

  return (
    <Link href={href} className="group block w-full">
      <div className="relative aspect-3/4 w-full overflow-hidden">
        <div className={`absolute inset-0 ${dimmed}`}>
          <Image
            src={main.url}
            alt={main.alt}
            fill
            sizes={SIZES}
            className={`object-contain ${hover ? "transition-opacity duration-500 group-hover:opacity-0" : ""}`}
          />
          {hover && (
            <Image
              src={hover.url}
              alt=""
              aria-hidden
              fill
              sizes={SIZES}
              className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className={dimmed}>
          <h3 className="text-sm font-semibold tracking-wide uppercase group-hover:underline">
            {title}
          </h3>
          <PriceTag
            priceCents={priceCents}
            salePriceCents={salePriceCents}
            lowestPriceCents={lowestPriceCents}
            className="mt-3 block text-sm"
          />
        </div>
        {soldOut && (
          <span className="mt-2 block text-[11px] tracking-[0.3em] text-black/50 uppercase">
            Wyprzedane
          </span>
        )}
      </div>
    </Link>
  );
}
