"use client";

import { useEffect } from "react";
import { init, isOpenedMainThread, launchParams, stateInit, user, ready } from "@telegram-apps/sdk";

export function TelegramAppInitializer() {
  useEffect(() => {
    // Initialize Telegram SDK
    if (!init) return;
    
    try {
      // Initialize with launch params
      init({
        startData: launchParams,
        user: user ? { id: user.id, first_name: user.first_name || "", last_name: user.last_name || "", username: user.username || "", language_code: user.language_code || "" } : undefined,
      });

      // Mark as ready
      ready();

      // Expand full width
      try {
        const { expand } = require("@telegram-apps/sdk");
        if (expand) expand();
      } catch (e) {
        // expand might not be available in older versions
      }

      console.log("Telegram WebApp initialized", {
        isOpened: isOpenedMainThread,
        user: user ? { id: user.id, name: user.first_name } : null,
        theme: launchParams.theme,
      });
    } catch (error) {
      console.warn("Failed to initialize Telegram WebApp SDK:", error);
    }
  }, []);

  return null;
}
