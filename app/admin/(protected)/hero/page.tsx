import { getHeroMedia } from "@/lib/hero";
import HeroForm from "@/components/admin/HeroForm";

export default async function AdminHero() {
  const hero = await getHeroMedia();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-4xl uppercase tracking-tight">Hero</h1>
      <HeroForm hero={hero} />
    </div>
  );
}
