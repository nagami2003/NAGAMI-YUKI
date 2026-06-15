"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  FileText,
  FolderOpen,
  Bell,
  Settings,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/workers", label: "外国人労働者管理", icon: Users },
  { href: "/interviews", label: "定期面談管理", icon: Calendar },
  { href: "/supports", label: "支援業務状況", icon: CheckSquare },
  { href: "/documents", label: "書類管理", icon: FolderOpen },
  { href: "/reports", label: "報告書管理", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: "#1e3a5f" }}>
      <div className="px-6 py-5 border-b border-blue-800">
        <div className="flex items-center gap-2">
          <Building2 className="h-7 w-7 text-blue-300" />
          <div>
            <div className="text-white font-bold text-sm leading-tight">NAGAMI</div>
            <div className="text-blue-300 text-xs">登録支援機関</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-blue-200 hover:bg-blue-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-blue-800 space-y-1">
        <Link
          href="/notifications"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
        >
          <Bell className="h-5 w-5" />
          通知
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
        >
          <Settings className="h-5 w-5" />
          設定
        </Link>
      </div>

      <div className="px-4 py-3 border-t border-blue-800">
        <div className="text-blue-400 text-xs">
          <div>2026年6月15日 現在</div>
          <div className="mt-0.5">特定技能支援システム v1.0</div>
        </div>
      </div>
    </aside>
  );
}
