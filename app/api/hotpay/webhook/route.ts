import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifyHotpayNotification, type HotpayNotification } from "@/lib/hotpay";
import { sendOrderConfirmationEmail } from "@/lib/mail";

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
    // HotPay może wysłać tę samą notyfikację ponownie — nie wysyłaj maila drugi raz.
    if (order.paymentStatus !== "oplacone") {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "oplacone", paymentRef: fields.ID_PLATNOSCI },
        include: { items: true },
      });
      await sendOrderConfirmationEmail(updated);
    }
  } else if (fields.STATUS === "FAILURE") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "nieudane", paymentRef: fields.ID_PLATNOSCI },
    });
  }
  // PENDING — nic nie robimy, czekamy na kolejną notyfikację.

  revalidatePath("/admin/zamowienia");
  revalidatePath("/konto/zamowienia");

  return new NextResponse("OK", { status: 200 });
}
