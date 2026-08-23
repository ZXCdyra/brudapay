"use client";

import { useEffect, useState } from "react";
import { user, theme, init, ready, launchParams } from "@telegram-apps/sdk";

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
    try {
      // Check if we're in Telegram
      const isInTelegram = window.location.href.includes("t.me/webapp") || 
                           document.referrer.includes("t.me");
      setIsTelegramApp(isInTelegram);

      // Get user data
      if (user) {
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
      const currentTheme = launchParams.theme || "light";
      setAppTheme(currentTheme === "dark" ? "dark" : "light");

      // Initialize if not already
      if (!init) {
        ready();
      }
    } catch (error) {
      console.warn("Error getting Telegram user:", error);
    }
  }, []);

  return { telegramUser, isTelegramApp, theme };
}
