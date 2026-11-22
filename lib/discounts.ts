import { SHOP_POLICY } from "@/lib/shop-policy";

export type Discount = {
  code: string;
  label: string;
  // "shipping" nie rusza ceny produktów, tylko zeruje koszt dostawy.
  type: "percent" | "amount" | "shipping";
  value: number; // "amount" jest w groszach, tak jak reszta cen w apce
};

const DISCOUNTS: Discount[] = [
  { code: "WITAJ10", label: "-10%", type: "percent", value: 10 },
  { code: "TRESET20", label: "-20 zł", type: "amount", value: 2000 },
  // Tymczasowy kod do testu płatności produktem za 1 zł — usunąć po teście.
  { code: "TESTDOSTAWAEF7352", label: "darmowa dostawa", type: "shipping", value: 0 },
];

export function findDiscount(code: string): Discount | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return DISCOUNTS.find((d) => d.code === normalized) ?? null;
}

export function discountAmount(subtotal: number, discount: Discount): number {
  if (discount.type === "shipping") return 0;
  const raw =
    discount.type === "percent"
      ? (subtotal * discount.value) / 100
      : discount.value;
  return Math.min(raw, subtotal);
}

export function deliveryCost(discount: Discount | null): number {
  return discount?.type === "shipping" ? 0 : SHOP_POLICY.deliveryCostCents;
}
