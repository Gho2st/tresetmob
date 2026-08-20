import Image from "next/image";
import Link from "next/link";

type ItemProps = {
  images: string[];
  title: string;
  price: string;
  href: string;
};

export default function Item({ images, title, price, href }: ItemProps) {
  const [main, hover] = images;

  return (
    <Link href={href} className="group block w-60">
      <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-100">
        <Image
          src={main}
          alt={title}
          fill
          sizes="240px"
          className="object-contain transition-opacity duration-500 group-hover:opacity-0"
        />
        {hover && (
          <Image
            src={hover}
            alt=""
            aria-hidden
            fill
            sizes="240px"
            className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-semibold tracking-wide uppercase group-hover:underline">
          {title}
        </h3>
        <span className="mt-3 block text-sm">{price}</span>
      </div>
    </Link>
  );
}
