import { requireUser } from "@/lib/customer";

export default async function KontoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
