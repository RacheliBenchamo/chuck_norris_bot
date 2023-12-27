const TelegramBot = require('node-telegram-bot-api');
const getJokes = require('../services/scraper');
const translateText = require('../services/translator');
const ISO6391 = require('iso-639-1');
const { token, defaultLang } = require('../config/config');

// Bot class encapsulating the behavior of the telegram bot.
class Bot {
    constructor() {
        this.bot = new TelegramBot(token, { polling: true }); // Initialize bot with token and enable polling.
        this.jokes = [];  // Array to store jokes from scraper.
        this.userLanguages = {}; // Object to keep track of user's language preferences.
        this.defaultLang = defaultLang; // Default language for the bot.
        this.initializeJokes(); // Fetch jokes upon initialization.
        this.handleMessages(); // Start listening and responding to users.
    }

    // Fetch jokes from external service.
    async initializeJokes() {
        try {
            this.jokes = await getJokes();
        } catch (error) {
            console.error("Failed to load jokes:", error);
        }
    }

    // Main message handler for incoming messages.
    handleMessages() {
        this.bot.on('message', async (msg) => {
            // Extract chat ID and text, and determine user language.
            const chatId = msg.chat.id;
            const text = msg.text || '';
            const userLang = this.userLanguages[chatId] || this.defaultLang;

            if (text === '/start') {
                this.userLanguages[chatId] = this.defaultLang;
                await this.sendWelcomeMessage(chatId, userLang);
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

    // Send a welcome message explaining how the bot works
    async sendWelcomeMessage(chatId, userLang) {
        const welcomeMsg = "Welcome! Use 'set language [language]' to change the language. Send a number (between 1-101) to receive a joke. For example, '5' to get the fifth joke. Send '/start' to reset and switch back to English.";
        await this.bot.sendMessage(chatId, welcomeMsg);
    }

    // Handle language setting command.
    async handleLanguageSetting(chatId, text, userLang) {
        const fullLanguageName = text.split(' ')[2];
        const languageCode = ISO6391.getCode(fullLanguageName);
        if (languageCode) {
            this.userLanguages[chatId] = languageCode;
            const confirmationMsg = await translateText("No Problem", languageCode);
            await this.bot.sendMessage(chatId, confirmationMsg);
        } else {
            // Inform user about unsupported language.
            await this.bot.sendMessage(chatId, await translateText("Unsupported language. Please choose a valid language.", userLang));
        }
    }

    // Respond to user requests for jokes by number.
    async handleJokeRequest(chatId, text, userLang) {
        const index = parseInt(text, 10) - 1;
        if (index >= 0 && index < this.jokes.length) {
            try {
                const joke = this.jokes[index];
                const translatedJoke = await translateText(joke, userLang);
                await this.bot.sendMessage(chatId, `${index + 1}. ${translatedJoke}`);
            } catch (error) {
                // Handle translation or other errors.
                await this.bot.sendMessage(chatId, await translateText("Error translating joke. Please try again or choose a different language.", userLang));
            }
        } else {
            // Prompt user for a valid joke number.
            await this.bot.sendMessage(chatId, await translateText(`Please send a number between 1 and ${this.jokes.length}.`, userLang));
        }
    }

    // Handle unrecognized commands or text.
    async handleOtherText(chatId, userLang) {
        await this.bot.sendMessage(chatId, await translateText("Please use a valid command or request a joke by number.", userLang));
    }
}

module.exports = Bot;