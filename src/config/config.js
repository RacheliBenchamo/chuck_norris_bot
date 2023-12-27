// config.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    defaultLang: 'en',
    subscriptionKey : process.env.AZURE_TRANSLATOR_KEY,
    endpoint : process.env.AZURE_TRANSLATOR_ENDPOINT,
    location : process.env.AZURE_TRANSLATOR_LOCATION
};
