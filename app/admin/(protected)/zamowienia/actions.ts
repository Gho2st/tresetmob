"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/order-status";
import { sendOrderStatusEmail } from "@/lib/mail";

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Nieznany status.");
  }

  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  });
  revalidatePath("/admin/zamowienia");
  revalidatePath("/konto/zamowienia");

  await sendOrderStatusEmail(order);
}
