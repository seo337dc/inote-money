"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, TrendingUp, GraduationCap, Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/demo/dashboard", label: "자산 관리", icon: LayoutDashboard },
  { href: "/demo/account-book", label: "가계부", icon: BookOpen },
  { href: "/demo/stocks", label: "주식", icon: TrendingUp },
  { href: "/demo/financial-knowledge", label: "금융 지식", icon: GraduationCap },
  { href: "/demo/mini-game", label: "미니게임", icon: Gamepad2 },
];

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0 z-30">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <span className="text-xl">💰</span>
          <span className="font-bold text-gray-900 text-[15px]">iNote Money</span>
          <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold ml-auto shrink-0">
            데모
          </span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                )}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 min-w-0 pb-16 lg:pb-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex z-40">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                isActive ? "text-green-600" : "text-gray-400"
              )}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
