package telegram

import (
	"fmt"
	"log"
	"os"
	"strings"

	tgbotapi "github.com/go-telegram-bot-api/v5"
)

// Bot handles telegram bot commands and webapp menu.
type Bot struct {
	bot    *tgbotapi.BotAPI
	token  string
	botName string
	baseURL string
	notifier *Notifier
}

// NewBot creates a new telegram bot instance.
func NewBot(token, baseURL string, notifier *Notifier) *Bot {
	if token == "" {
		return nil
	}
	return &Bot{
		token:   token,
		baseURL: baseURL,
		notifier: notifier,
	}
}

// Start initializes and runs the telegram bot polling.
func (b *Bot) Start() error {
	if b == nil {
		log.Println("Telegram bot not configured (no token)")
		return nil
	}

	bot, err := tgbotapi.NewBotAPI(b.token)
	if err != nil {
		log.Fatalf("telegram bot init error: %v", err)
	}
	b.bot = bot

	b.botName, _ = bot.GetBotInfo()

	// Set webapp menu
	err = b.setWebAppMenu()
	if err != nil {
		log.Printf("warning: failed to set webapp menu: %v", err)
	}

	// Poll updates
	u := tgbotapi.NewUpdate(0)
	u.Timeout = 5
	updates := bot.GetUpdatesChan(u)

	for update := range updates {
		go b.handleUpdate(update)
	}

	return nil
}

// setWebAppMenu configures the Telegram WebApp button in the keyboard.
func (b *Bot) setWebAppMenu() error {
	webAppURL := b.baseURL + "/login"
	if !strings.HasPrefix(webAppURL, "http") {
		webAppURL = "https://" + webAppURL
	}

	menuBtn := tgbotapi.WebAppInfo{}
	menuBtn.URL = webAppURL

	keyboard := tgbotapi.NewReplyKeyboard(
		tgbotapi.NewKeyboardButtonWebApp("🚀 Открыть приложение", menuBtn),
	)
	keyboard.ResizeKeyboard = true

	cfg := tgbotapi.NewMessage(0, "Добро пожаловать в BrudaPay!")
	cfg.ReplyMarkup = keyboard
	_, err := b.bot.Send(cfg)
	return err
}

// handleUpdate processes incoming telegram updates.
func (b *Bot) handleUpdate(update tgbotapi.Update) {
	if update.Message == nil {
		return
	}

	msg := update.Message
	if msg.Text == "" {
		return
	}

	text := strings.ToLower(strings.TrimSpace(msg.Text))
	chatID := msg.Chat.ID

	switch text {
	case "/start", "/open":
		b.sendWebAppButton(chatID)
	case "/help":
		b.sendMessage(chatID, "Доступные команды:\n/start — открыть приложение\n/help — справка")
	}
}

// sendWebAppButton sends a message with the webapp keyboard button.
func (b *Bot) sendWebAppButton(chatID int64) {
	webAppURL := b.baseURL + "/login"
	if !strings.HasPrefix(webAppURL, "http") {
		webAppURL = "https://" + webAppURL
	}

	webAppInfo := tgbotapi.WebAppInfo{URL: webAppURL}
	btn := tgbotapi.NewKeyboardButtonWebApp("🚀 Открыть приложение", webAppInfo)
	keyboard := tgbotapi.NewReplyKeyboard(btn)
	keyboard.ResizeKeyboard = true

	msg := tgbotapi.NewMessage(chatID, "Нажмите кнопку чтобы открыть приложение:")
	msg.ReplyMarkup = keyboard
	b.bot.Send(msg)
}

// sendMessage sends a plain text message.
func (b *Bot) sendMessage(chatID int64, text string) {
	msg := tgbotapi.NewMessage(chatID, text)
	b.bot.Send(msg)
}

// GetToken returns the bot token (for testing).
func (b *Bot) GetToken() string {
	return b.token
}

func init() {
	// Log telegram package imports
	_ = os.Getenv
}
