import { getLoginImage } from "@/lib/hero";
import LoginImageForm from "@/components/admin/LoginImageForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

export default async function AdminLogowanie() {
  const image = await getLoginImage();

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Strona logowania"
        description="Zdjęcie widoczne obok formularza logowania klientów."
      />
      <LoginImageForm image={image} />
    </div>
  );
}
