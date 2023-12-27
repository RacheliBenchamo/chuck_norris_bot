const path = require('path');
const axios = require('axios');
const { subscriptionKey, endpoint, location} = require('../config/config');


const translateText = async (text, targetLang) => {
    const url = `${endpoint}/translate?api-version=3.0&to=${targetLang}`;

    try {
        const response = await axios({
            baseURL: url,
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Ocp-Apim-Subscription-Region': location,
                'Content-Type': 'application/json',
            },
            data: [{
                'text': text
            }],
        });

        const translation = response.data[0].translations[0].text;
        return translation;

    } catch (error) {
        console.error("Translation API Error:", error);
        return "Error occurred during translation.";
    }
};

module.exports = translateText;