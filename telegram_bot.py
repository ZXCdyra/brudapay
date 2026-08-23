#!/usr/bin/env python3
"""Telegram Bot for WebApp launch."""
import os
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
# По умолчанию используем localhost для разработки, но можно изменить на.production URL
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")

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

def main():
    """Main bot function"""
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    # Register handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("open", open_cmd))
    
    print("✅ Telegram bot started successfully!")
    print(f"🤖 Bot token: {BOT_TOKEN[:10]}...")
    print("📱 Waiting for commands...")
    
    # Start polling
    app.run_polling()

if __name__ == "__main__":
    main()
