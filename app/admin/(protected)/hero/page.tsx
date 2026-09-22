import { getHeroMedia } from "@/lib/hero";
import HeroForm from "@/components/admin/HeroForm";

export default async function AdminHero() {
  const hero = await getHeroMedia();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-bebas text-3xl tracking-tight uppercase sm:text-4xl">Hero</h1>
      <HeroForm hero={hero} />
    </div>
  );
}
