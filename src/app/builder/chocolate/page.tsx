import { redirect } from "next/navigation";

/** Çikolatalı makarna şimdilik menü dışı — ileride tekrar açılabilir */
export default function ChocolateBuilderPage() {
  redirect("/menu");
}
