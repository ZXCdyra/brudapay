"use client";

import { useEffect, useState } from "react";
import type { User } from "@telegram-apps/sdk";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export function useTelegramUser() {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [isTelegramApp, setIsTelegramApp] = useState(false);
  const [theme, setAppTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    let cancelled = false;

    async function loadTelegramData() {
      try {
        // Check if we're in Telegram
        const isInTelegram =
          window.location.href.includes("t.me/webapp") ||
          document.referrer.includes("t.me");
        setIsTelegramApp(isInTelegram);

        const sdk = await import("@telegram-apps/sdk");

        if (!sdk.isTMA()) return;
        if (!isInTelegram) setIsTelegramApp(true);

        // Get user data
        const { tgWebAppData } = await sdk.retrieveLaunchParams();
        const user: User | undefined = tgWebAppData?.user;
        if (!cancelled && user) {
          const userData: TelegramUser = {
            id: user.id,
            first_name: user.first_name || "",
            last_name: user.last_name,
            username: user.username,
            language_code: user.language_code,
          };
          setTelegramUser(userData);
          console.log("Telegram user:", userData);
        }

        // Get theme
        try {
          if (sdk.mountThemeParams.isAvailable()) {
            await sdk.mountThemeParams();
          }
          if (!cancelled && sdk.isThemeParamsDark()) {
            setAppTheme("dark");
          }
        } catch (error) {
          console.warn("Error getting Telegram theme:", error);
        }
      } catch (error) {
        console.warn("Error getting Telegram user:", error);
      }
    }

    loadTelegramData();

    return () => {
      cancelled = true;
    };
  }, []);

  return { telegramUser, isTelegramApp, theme };
}
