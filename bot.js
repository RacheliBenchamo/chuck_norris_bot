// Import the node-telegram-bot-api module
const TelegramBot = require('node-telegram-bot-api');

// Replace the value below with the Telegram token you receive from BotFather
const token = '6714644162:AAFnuqWWqNF20MT-wM58y0bqINZ2VT0u2-Y';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Listen for any kind of message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // Send a message back to the same chat confirming receipt
    bot.sendMessage(chatId, 'Received your message');
});


bot.on('text', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();

    if (text === '/start') {
        bot.sendMessage(chatId, 'Welcome to Chuck Norris Joke Bot!');
    }
});
