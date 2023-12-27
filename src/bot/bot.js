const TelegramBot = require('node-telegram-bot-api');
const getJokes = require('../services/scraper');
const translateText = require('../services/translator');
const ISO6391 = require('iso-639-1');
const { token, defaultLang } = require('../config/config');

class Bot {
    constructor() {
        this.bot = new TelegramBot(token, { polling: true });
        this.jokes = [];
        this.userLanguages = {}; // Map to store user language preferences
        this.defaultLang = defaultLang;
        this.initializeJokes();
        this.handleMessages();
    }

    async initializeJokes() {
        try {
            this.jokes = await getJokes();
            console.log("Loaded jokes");
        } catch (error) {
            console.error("Failed to load jokes", error);
        }
    }

    handleMessages() {
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;
            // Retrieve user-specific language or default
            const userLang = this.userLanguages[chatId] || this.defaultLang;

            // Setting language command
            if (text.toLowerCase().startsWith("set language")) {
                const fullLanguageName = text.split(' ')[2]; // Assuming command is "set language <language-name>"
                const languageCode = ISO6391.getCode(fullLanguageName); // Convert language name to ISO 639-1 code

                if (languageCode) {
                    this.userLanguages[chatId] = languageCode; // Update the language setting for the user
                    const confirmationMsg = await translateText("No Problem", languageCode); // Translate the confirmation message
                    await this.bot.sendMessage(chatId, confirmationMsg);
                } else {
                    await this.bot.sendMessage(chatId, await translateText("Unsupported language. Please choose a valid language.", userLang));
                }
            }

            // Responding with a joke
            else if (!isNaN(text)) {
                const index = parseInt(text, 10) - 1; // Arrays are zero-indexed
                if (index >= 0 && index < this.jokes.length) {
                    try {
                        const joke = this.jokes[index];
                        const translatedJoke = await translateText(joke, userLang); // Translate the joke
                        await this.bot.sendMessage(chatId, `${index + 1}. ${translatedJoke}`);
                    } catch (error) {
                        await this.bot.sendMessage(chatId, await translateText("Error translating joke. Please try again or choose a different language.", userLang));
                    }
                } else {
                    await this.bot.sendMessage(chatId, await translateText(`Please send a number between 1 and ${this.jokes.length}.`, userLang));
                }
            }

            // Catch-all for any other text
            else {
                await this.bot.sendMessage(chatId, await translateText("Please use a valid command or request a joke by number.", userLang));
            }
        });
    }
}

module.exports = Bot;
