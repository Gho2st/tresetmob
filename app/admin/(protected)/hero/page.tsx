import { getHeroMedia } from "@/lib/hero";
import HeroForm from "@/components/admin/HeroForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminHero() {
  const hero = await getHeroMedia();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader title="Hero" description="Zdjęcie albo film na górze strony głównej." />
      <HeroForm hero={hero} />
    </div>
  );
}
