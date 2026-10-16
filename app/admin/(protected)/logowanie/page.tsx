import { getLoginImage } from "@/lib/hero";
import LoginImageForm from "@/components/admin/LoginImageForm";

export default async function AdminLogowanie() {
  const image = await getLoginImage();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-3xl tracking-tight uppercase sm:text-4xl">
        Strona logowania
      </h1>
      <LoginImageForm image={image} />
    </div>
  );
}
