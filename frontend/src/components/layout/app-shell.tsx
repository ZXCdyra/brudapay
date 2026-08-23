"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";

// Разделы, доступные мерчанту. Всё остальное — только для персонала площадки.
const MERCHANT_ALLOWED_PREFIXES = ["/merchant", "/disputes"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, fetchUser, user } = useAuthStore();
  const { setTheme, theme } = useThemeStore();


  // Предотвращаем hydration mismatch: React 19 делает его fatal error.
  // Сервер рендерит исходное состояние (нет localStorage), клиент — реальное.
  // Держим spinner пока не выполнен первый useEffect (только на клиенте).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, router]);

  // Мерчанта держим в его кабинете: если он зашёл на страницу персонала,
  // перенаправляем на /merchant.
  useEffect(() => {
    if (!mounted || !isAuthenticated || user?.role !== "MERCHANT") return;
    const allowed = MERCHANT_ALLOWED_PREFIXES.some((p) =>
      pathname === p || pathname.startsWith(p + "/")
    );
    if (!allowed) {
      router.replace("/merchant");
    }
  }, [mounted, isAuthenticated, user?.role, pathname, router]);


  // До mount: одинаковый вывод для сервера и клиента (нет mismatch)
  if (!mounted || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-[260px] transition-all">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
