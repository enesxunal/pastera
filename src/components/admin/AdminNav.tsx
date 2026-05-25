"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/providers/I18nProvider";

const links = [
  { href: "/admin/dashboard", key: "admin.navDashboard" },
  { href: "/admin/branches", key: "admin.navBranches" },
  { href: "/admin/catalog", key: "admin.navCatalog" },
  { href: "/admin/orders", key: "admin.navOrders" },
  { href: "/admin/members", key: "admin.navMembers" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[#2e402a] pb-4">
      {links.map(({ href, key }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? "bg-[#c49746] text-[#0a0a0a]"
                : "border border-[#2e402a] text-white/70 hover:border-[#c49746]/40 hover:text-white"
            }`}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
