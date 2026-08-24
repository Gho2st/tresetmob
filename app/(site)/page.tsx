import Hero from "@/components/Hero";
import Insta from "@/components/Insta";
import Wanted from "@/components/items/Wanted";

export const revalidate = 3600;

export default function Home() {
  return (
    <div>
      <Hero />
      <Wanted />
      <Insta />
    </div>
  );
}
