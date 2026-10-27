import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Eksport aktywnych subskrybentów — np. do przeniesienia listy do zewnętrznego
// serwisu mailingowego.
export async function GET() {
  await requireAdmin();

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: { status: "aktywny" },
    orderBy: { confirmedAt: "asc" },
  });

  const rows = [
    ["email", "zrodlo", "potwierdzono", "kod", "kod_wykorzystany"],
    ...subscribers.map((s) => [
      s.email,
      s.source,
      s.confirmedAt?.toISOString() ?? "",
      s.discountCode ?? "",
      s.discountUsedAt ? "tak" : "nie",
    ]),
  ];
  const csv = rows
    .map((row) => row.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
