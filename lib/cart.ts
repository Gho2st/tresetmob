export type CartItem = {
  slug: string;
  title: string;
  priceCents: number;
  image: string;
  size: string;
  quantity: number;
};

export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} zł`;
}
