#!/usr/bin/env python3
"""Telegram Bot for WebApp launch."""
import os
import requests
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
BASE_URL = os.getenv("BASE_URL", "http://localhost:8080")

if not BOT_TOKEN:
    print("❌ Set TELEGRAM_BOT_TOKEN env variable")
    exit(1)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    btn = KeyboardButton(text="🚀 Открыть приложение", web_app=WebAppInfo(url=f"{BASE_URL}/login"))
    keyboard = ReplyKeyboardMarkup([[btn]], resize_keyboard=True)
    await update.message.reply_text("Добро пожаловать в BrudaPay!", reply_markup=keyboard)

async def help_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Доступные команды:\n/start — открыть приложение\n/help — справка")

async def open_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await start(update, context)

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_cmd))
    app.add_handler(CommandHandler("open", open_cmd))
    print("✅ Telegram bot started!")
    app.run_polling()

if __name__ == "__main__":
    main()
