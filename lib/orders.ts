import "server-only";
import { prisma } from "@/lib/prisma";

export function getOrdersForEmail(email: string) {
  return prisma.order.findMany({
    where: { customerEmail: { equals: email, mode: "insensitive" } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
}
