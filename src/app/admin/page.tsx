import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function AdminEntryPage() {
  if (cookies().get("pastera_admin")?.value === "1") {
    redirect("/admin/dashboard");
  }
  redirect("/admin/login");
}
