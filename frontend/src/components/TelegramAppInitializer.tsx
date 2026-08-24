"use client";

import { useEffect, useState } from "react";
import type { User } from "@telegram-apps/sdk";

export function TelegramAppInitializer() {
  const [, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function initTelegram() {
      try {
        const sdk = await import("@telegram-apps/sdk");

        if (!sdk.isTMA()) return;

        cleanup = sdk.init();

        const { tgWebAppData } = await sdk.retrieveLaunchParams();
        setUser(tgWebAppData?.user ?? null);

        if (sdk.mountMiniApp.isAvailable()) {
          await sdk.mountMiniApp();
        }
        if (sdk.miniAppReady.isAvailable()) {
          sdk.miniAppReady();
        }

        console.log("Telegram WebApp initialized");
      } catch (err) {
        console.warn("Telegram SDK not available (outside Telegram):", err);
      }
    }

    initTelegram();

    return () => cleanup?.();
  }, []);

  return null;
}
