const axios = require('axios');
const cheerio = require('cheerio');

// Function to scrape jokes from a given URL using cheerio
const getJokes = async () => {
    const targetUrl = "https://parade.com/968666/parade/chuck-norris-jokes/";
    const jokesList = [];

    // Headers to mimic a browser request
    const headers = {
        Accept: "text/html",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.5",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    try {
        // Fetching jokes page with axios
        const response = await axios.get(targetUrl, { headers });

        // Using cheerio to parse HTML and extract jokes
        const $ = cheerio.load(response.data);
        $('ol li').each((i, el) => {
            jokesList.push($(el).text().trim()); // Collecting jokes into an array
        });

    } catch (error) {
        console.error("Error fetching jokes:", error); // Logging error
    }

    return jokesList; // Returning list of jokes
};

module.exports = getJokes;
