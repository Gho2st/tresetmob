export type Discount = {
  code: string;
  label: string;
  type: "percent" | "amount";
  value: number; // "amount" jest w groszach, tak jak reszta cen w apce
};

const DISCOUNTS: Discount[] = [
  { code: "WITAJ10", label: "-10%", type: "percent", value: 10 },
  { code: "TRESET20", label: "-20 zł", type: "amount", value: 2000 },
];

export function findDiscount(code: string): Discount | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return DISCOUNTS.find((d) => d.code === normalized) ?? null;
}

export function discountAmount(subtotal: number, discount: Discount): number {
  const raw =
    discount.type === "percent"
      ? (subtotal * discount.value) / 100
      : discount.value;
  return Math.min(raw, subtotal);
}
