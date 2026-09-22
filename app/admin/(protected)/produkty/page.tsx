import Image from "next/image";
import Link from "next/link";
import { ChevronUp, ChevronDown } from "lucide-react";
import { getProducts } from "@/lib/products";
import PriceTag from "@/components/PriceTag";
import { deleteProduct, moveProduct } from "./actions";

export default async function AdminProdukty() {
  const products = await getProducts();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-bebas text-3xl tracking-tight uppercase sm:text-4xl">
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
          {products.map((product, index) => {
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            const outOfStock = product.variants.filter((v) => v.stock === 0).length;

            return (
            <li key={product.id} className="flex flex-wrap items-center gap-x-4 gap-y-3 py-4 sm:flex-nowrap sm:gap-5">
              <div className="flex shrink-0 flex-col">
                <form
                  action={async () => {
                    "use server";
                    await moveProduct(product.id, "up");
                  }}
                >
                  <button
                    type="submit"
                    disabled={index === 0}
                    aria-label="Przesuń wyżej"
                    className="text-black/50 hover:text-black disabled:cursor-not-allowed disabled:text-black/15"
                  >
                    <ChevronUp size={16} strokeWidth={1.5} />
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await moveProduct(product.id, "down");
                  }}
                >
                  <button
                    type="submit"
                    disabled={index === products.length - 1}
                    aria-label="Przesuń niżej"
                    className="text-black/50 hover:text-black disabled:cursor-not-allowed disabled:text-black/15"
                  >
                    <ChevronDown size={16} strokeWidth={1.5} />
                  </button>
                </form>
              </div>

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

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-wide break-words uppercase">
                  {product.title}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-black/40">
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

              {/* Na wąskim ekranie akcje schodzą do własnego rzędu — obok
                  nazwy produktu nie starcza dla nich miejsca. */}
              <div className="flex w-full items-center justify-end gap-5 sm:w-auto sm:gap-5">
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
              </div>
            </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
