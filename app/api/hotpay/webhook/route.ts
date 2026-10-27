import { NextResponse, after } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyHotpayNotification, type HotpayNotification } from "@/lib/hotpay";
import { sendOrderConfirmationEmail } from "@/lib/mail";
import { markNewsletterCodeUsed } from "@/lib/newsletter";

export async function POST(request: Request) {
  const formData = await request.formData();
  const fields = Object.fromEntries(formData.entries()) as HotpayNotification;

  if (!verifyHotpayNotification(fields)) {
    return new NextResponse("invalid signature", { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { number: fields.ID_ZAMOWIENIA },
    include: { items: true },
  });
  if (!order) {
    return new NextResponse("order not found", { status: 404 });
  }

  if (fields.STATUS === "SUCCESS") {
    const paid = await prisma.$transaction(async (tx) => {
      // Warunkowy update zamiast sprawdzenia w JS — HotPay potrafi powtórzyć
      // notyfikację, a dwie równoległe nie mogą obie zdjąć stanów i wysłać maila.
      const { count } = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: { not: "oplacone" } },
        data: { paymentStatus: "oplacone", paymentRef: fields.ID_PLATNOSCI },
      });
      if (count === 0) return false;

      for (const item of order.items) {
        await tx.productVariant.updateMany({
          where: { size: item.size, product: { slug: item.productSlug } },
          data: { stock: { decrement: item.quantity } },
        });
      }
      // Dwa opłacone zamówienia na ostatnią sztukę — stan nie schodzi poniżej zera.
      await tx.productVariant.updateMany({
        where: { stock: { lt: 0 } },
        data: { stock: 0 },
      });
      return true;
    });

    if (paid) {
      // Jednorazowy kod z newslettera zużywa dopiero opłacone zamówienie —
      // porzucona płatność nie może go „spalić”.
      await markNewsletterCodeUsed(order.discountCode);
      after(() => sendOrderConfirmationEmail({ ...order, paymentStatus: "oplacone" }));
    }
  } else if (fields.STATUS === "FAILURE") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "nieudane", paymentRef: fields.ID_PLATNOSCI },
    });
  }
  // PENDING — nic nie robimy, czekamy na kolejną notyfikację.

  // Stany magazynowe widać na stronach produktów i w sklepie, nie tylko w panelu.
  revalidatePath("/", "layout");

  return new NextResponse("OK", { status: 200 });
}
