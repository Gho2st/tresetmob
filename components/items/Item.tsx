import Image from "next/image";

type ItemProps = {
  image?: string;
  title?: string;
  price?: string;
};

export default function Item({
  image,
  title = "STRAIGHT JEANS - ALL BLACK DENIM",
  price = "359,00 zł",
}: ItemProps) {
  return (
    <div className="w-60">
      <div className="relative aspect-3/4 w-full bg-neutral-100">
        {image && (
          <Image src={image} alt={title} fill className="object-contain" />
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-semibold tracking-wide uppercase">
          {title}
        </h3>
        <span className="mt-3 block text-sm">{price}</span>
      </div>
    </div>
  );
}
