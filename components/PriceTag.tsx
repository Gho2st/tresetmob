import { formatPrice } from "@/lib/cart";

type PriceTagProps = {
  priceCents: number;
  salePriceCents?: number | null;
  className?: string;
};

export default function PriceTag({
  priceCents,
  salePriceCents,
  className = "",
}: PriceTagProps) {
  const onSale = salePriceCents != null && salePriceCents < priceCents;

  if (!onSale) {
    return <span className={className}>{formatPrice(priceCents)}</span>;
  }

  return (
    <span className={className}>
      <span className="inline-flex items-center gap-2">
        <span className="text-black/40 line-through">{formatPrice(priceCents)}</span>
        <span className="text-red-600">{formatPrice(salePriceCents)}</span>
      </span>
    </span>
  );
}
