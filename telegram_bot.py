#!/usr/bin/env python3
"""Telegram Bot for WebApp launch."""
import os
import sys
import time
import logging
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.error import Conflict
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BASE_URL = os.getenv("BASE_URL", "https://platega.onrender.com")

if not BOT_TOKEN:
    print("❌ Set TELEGRAM_BOT_TOKEN env variable")
    exit(1)

print(f"🤖 Telegram Bot starting...")
print(f"🌐 WebApp URL: {BASE_URL}")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start command - shows WebApp button"""
    web_app_url = f"{BASE_URL}/login"
    
    btn = KeyboardButton(text="🚀 Открыть приложение", web_app=WebAppInfo(url=web_app_url))
    keyboard = ReplyKeyboardMarkup([[btn]], resize_keyboard=True, one_time_keyboard=False)
    
    message = (
        "👋 Добро пожаловать в BrudaPay!\n\n"
        "🔐 Это платформа для обработки платежей.\n"
        "Нажмите кнопку ниже, чтобы открыть приложение:\n\n"
        "💡 Приложение открывается внутри Telegram"
    )
    await update.message.reply_text(message, reply_markup=keyboard)

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Help command"""
    help_text = (
        "📋 Доступные команды:\n\n"
        "/start — открыть приложение\n"
        "/help — справка\n\n"
        "💡 Приложение работает внутри Telegram как Mini App"
    )
    await update.message.reply_text(help_text)

async def open_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Open command - same as start"""
    await start(update, context)

async def on_conflict(updater):
    """Handle conflict by shutting down gracefully."""
    logger.warning("Conflict detected: another bot instance is running. Shutting down...")
    await updater.stop()
    sys.exit(0)


def main():
    """Main bot function"""
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Register handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("open", open_cmd))
    
    # Handle conflict errors (multiple bot instances)
    app.updater.on_conflict = on_conflict
    
    print("✅ Telegram bot started successfully!")
    print(f"🤖 Bot token: {BOT_TOKEN[:10]}...")
    print("📱 Waiting for commands...")
    
    # Start polling
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
