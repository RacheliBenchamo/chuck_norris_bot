const axios = require('axios');
const { subscriptionKey, endpoint, location } = require('../config/config');

// Function to translate text using an external API service.
const translateText = async (text, targetLang) => {
    // Construct request URL with target language.
    const url = `${endpoint}/translate?api-version=3.0&to=${targetLang}`;

    try {
        // Make an HTTP POST request to the translation service.
        const response = await axios({
            baseURL: url,
            method: 'post',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Ocp-Apim-Subscription-Region': location,
                'Content-Type': 'application/json',
            },
            data: [{ 'text': text }],
        });

        // Extracting the translated text from the response.
        const translation = response.data[0].translations[0].text;
        return translation;

    } catch (error) {
        console.error("Translation API Error:", error);
        // Returning a generic error message; log for detailed error.
        return "Error occurred during translation.";
    }
};

module.exports = translateText;
