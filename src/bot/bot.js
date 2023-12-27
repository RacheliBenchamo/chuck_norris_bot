const TelegramBot = require('node-telegram-bot-api');
const getJokes = require('../services/scraper');
const translateText = require('../services/translator');
const ISO6391 = require('iso-639-1');
const { token } = require('../config/config');

// Bot class encapsulating the behavior of the telegram bot.
class Bot {
    constructor() {
        this.bot = new TelegramBot(token, { polling: true });
        this.jokes = [];
        this.userLanguages = {};
        this.defaultLang = 'en'; // Set default language to English
        this.initializeJokes();
        this.handleMessages();
    }

    async initializeJokes() {
        try {
            this.jokes = await getJokes();
        } catch (error) {
            console.error("Failed to load jokes:", error);
        }
    }

    handleMessages() {
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text || '';
            const userLang = this.userLanguages[chatId] || this.defaultLang;

            if (text === '/start') {
                await this.sendWelcomeMessage(chatId); // Send welcome message in English.
            }
            else if (text.toLowerCase().startsWith("set language")) {
                await this.handleLanguageSetting(chatId, text, userLang);
            } else if (!isNaN(text)) {
                await this.handleJokeRequest(chatId, text, userLang);
            } else {
                await this.handleOtherText(chatId, userLang);
            }
        });
    }

    async sendWelcomeMessage(chatId) {
        const welcomeMsg = "Welcome! Use 'set language [language]' to change the language. Send a number (between 1-101) to receive a joke. For example, '5' to get the fifth joke. Send '/start' to reset and switch back to English.";
        await this.bot.sendMessage(chatId, welcomeMsg); // Welcome message is always in English.
    }

    async handleLanguageSetting(chatId, text, userLang) {
        const fullLanguageName = text.split(' ')[2];
        const languageCode = ISO6391.getCode(fullLanguageName);
        if (languageCode) {
            this.userLanguages[chatId] = languageCode;
            const confirmationMsg = await translateText("No Problem!", languageCode);
            await this.bot.sendMessage(chatId, confirmationMsg);
        } else {
            await this.bot.sendMessage(chatId, "Unsupported language. Please choose a valid language.");
        }
    }

    async handleJokeRequest(chatId, text, userLang) {
        const index = parseInt(text, 10) - 1;
        if (index >= 0 && index < this.jokes.length) {
            try {
                const joke = this.jokes[index];
                const translatedJoke = await translateText(joke, userLang);
                await this.bot.sendMessage(chatId, `${index + 1}. ${translatedJoke}`);
            } catch (error) {
                await this.bot.sendMessage(chatId, "Error translating joke. Please try again or choose a different language.");
            }
        } else {
            await this.bot.sendMessage(chatId, `Please send a number between 1 and ${this.jokes.length}.`);
        }
    }

    async handleOtherText(chatId, userLang) {
        await this.bot.sendMessage(chatId, "Please use a valid command or request a joke by number.");
    }
}

module.exports = Bot;
