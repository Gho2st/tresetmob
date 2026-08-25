"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUSES } from "@/lib/order-status";

export async function updateOrderStatus(id: string, status: string) {
  await requireAdmin();
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    throw new Error("Nieznany status.");
  }

  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/zamowienia");
  revalidatePath("/konto/zamowienia");
}
