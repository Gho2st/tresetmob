import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import PriceTag from "@/components/PriceTag";
import { deleteProduct } from "./actions";

export default async function AdminProdukty() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="font-bebas text-4xl uppercase tracking-tight">
          Produkty
        </h1>
        <Link
          href="/admin/produkty/nowy"
          className="border border-black/30 px-5 py-2.5 text-sm tracking-widest uppercase transition-colors hover:border-black hover:bg-black hover:text-white"
        >
          + Dodaj produkt
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-black/50">
          Brak produktów. Dodaj pierwszy przyciskiem powyżej.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 border-y border-black/10">
          {products.map((product) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            const outOfStock = product.variants.filter((v) => v.stock === 0).length;

            return (
            <li key={product.id} className="flex items-center gap-5 py-4">
              <div className="relative aspect-square w-14 shrink-0 overflow-hidden bg-neutral-100">
                {product.images[0] && (
                  <Image
                    src={product.images[0]}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide">
                  {product.title}
                </p>
                <p className="flex items-center gap-2 text-xs text-black/40">
                  <PriceTag
                    priceCents={product.priceCents}
                    salePriceCents={product.salePriceCents}
                  />
                  <span>
                    · {totalStock} szt. w {product.variants.length} rozmiarach
                    {outOfStock > 0 && (
                      <span className="text-red-700">
                        {" "}
                        ({outOfStock} wyprzedanych)
                      </span>
                    )}
                  </span>
                </p>
              </div>

              <Link
                href={`/admin/produkty/${product.id}`}
                className="text-xs tracking-widest uppercase underline underline-offset-4 hover:text-black/60"
              >
                Edytuj
              </Link>

              <form
                action={async () => {
                  "use server";
                  await deleteProduct(product.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs tracking-widest text-red-700 uppercase underline underline-offset-4 hover:text-red-900"
                >
                  Usuń
                </button>
              </form>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
