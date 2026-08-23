"use client";

import { useEffect, useState } from "react";

export function TelegramAppInitializer() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initTelegram() {
      try {
        const sdk = await import("@telegram-apps/sdk");
        const { init, launchParams, user, ready } = sdk;
        
        if (!init) return;
        
        init({
          startData: launchParams,
          user: user ? { 
            id: user.id, 
            first_name: user.first_name || "", 
            last_name: user.last_name || "", 
            username: user.username || "", 
            language_code: user.language_code || "" 
          } : undefined,
        });

        ready();

        console.log("Telegram WebApp initialized");
      } catch (err) {
        console.warn("Telegram SDK not available (outside Telegram):", err);
        setError("Telegram SDK not available");
      }
    }
    
    initTelegram();
  }, []);

  if (error) {
    return null;
  }

  return null;
}
