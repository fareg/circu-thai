"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { appVersion } from "@/lib/version";
import { ReactNode } from "react";

interface AppChromeProps {
  children: ReactNode;
  locale: string;
}

export function AppChrome({ children, locale }: AppChromeProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const homePath = `/${locale}`;
  const isRunRoute = pathname?.startsWith(`/${locale}/run`);

  const navItems = [
    { href: homePath, label: t("home") },
    { href: `/${locale}/programs`, label: t("programs") },
    { href: `/${locale}/builder`, label: t("builder") },
    { href: `/${locale}/run/demo-flow`, label: t("run") },
    { href: `/${locale}/run/sound-test`, label: t("soundTest") },
  ];

  const isActive = (href: string) => {
    if (!pathname) {
      return false;
    }
    if (href === homePath) {
      return pathname === href;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen px-4 pb-16 pt-10 sm:px-8 flex flex-col">
      {!isRunRoute ? (
        <header className="glass-panel flex flex-col gap-6 px-6 py-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-200">CircuThai</p>
            <p className="text-lg font-semibold text-gradient">Flow, breathe, repeat</p>
          </div>
          <nav className="flex flex-1 flex-wrap gap-3 text-sm">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 transition-colors focus-ring",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-slate-200 hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
      ) : null}
      <main className={cn(isRunRoute ? "mt-0" : "mt-10", "space-y-8 flex-1")}>{children}</main>
      <footer className="mt-10 rounded-2xl bg-white/5 px-6 py-4 text-white/70">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">{t("version")}</p>
        <p className="mt-2 text-2xl font-semibold text-white">{appVersion}</p>
      </footer>
    </div>
  );
}
