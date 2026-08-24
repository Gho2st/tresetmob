import Image from "next/image";
import Link from "next/link";
import PriceTag from "@/components/PriceTag";

type ItemProps = {
  images: string[];
  title: string;
  priceCents: number;
  salePriceCents?: number | null;
  href: string;
};

export default function Item({
  images,
  title,
  priceCents,
  salePriceCents,
  href,
}: ItemProps) {
  const [main, hover] = images;

  return (
    <Link href={href} className="group block w-full max-w-60">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
        <Image
          src={main}
          alt={title}
          fill
          sizes="(max-width: 639px) 45vw, (max-width: 1279px) 30vw, 240px"
          className="object-contain transition-opacity duration-500 group-hover:opacity-0"
        />
        {hover && (
          <Image
            src={hover}
            alt=""
            aria-hidden
            fill
            sizes="(max-width: 639px) 45vw, (max-width: 1279px) 30vw, 240px"
            className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-semibold tracking-wide uppercase group-hover:underline">
          {title}
        </h3>
        <PriceTag
          priceCents={priceCents}
          salePriceCents={salePriceCents}
          className="mt-3 block text-sm"
        />
      </div>
    </Link>
  );
}
