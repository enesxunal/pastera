import { isAdminCookie } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export default function AdminEntryPage() {
  if (isAdminCookie()) {
    redirect("/admin/dashboard");
  }
  redirect("/admin/login");
}
