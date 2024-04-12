require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dns = require("dns");

const app = express();
const port = process.env.PORT || 3000;

// Declaration for URL database and next short URL ID
let nextShortUrlId = 1;
const urlDatabase = {};

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/public", express.static(`${process.cwd()}/public`));

// Route for the home page
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// URL validation function with DNS lookup
async function isValidUrl(url) {
  const urlPattern = /^(http|https):\/\/[^ "]+$/;

  if (!urlPattern.test(url)) {
    return false;
  }

  const host = new URL(url).hostname;

  try {
    await new Promise((resolve, reject) => {
      dns.lookup(host, (err) => {
        if (err) {
          reject(false); // Host not found
        } else {
          resolve(true); // Host found
        }
      });
    });
    return true;
  } catch (error) {
    return false;
  }
}

// URL shortening endpoint
app.post("/api/shorturl", async function (req, res) {
  const originalUrl = req.body.url;

  try {
    const isValid = await isValidUrl(originalUrl);

    if (!isValid) {
      // Return a 400 status for invalid input and include the error message
      return res.status(400).json({ error: "invalid url" });
    }
    
    // Store the original URL in the database
    urlDatabase[nextShortUrlId] = originalUrl;
    
    // Respond with the JSON containing original_url and short_url properties
    res.json({
      original_url: originalUrl,
      short_url: nextShortUrlId++
    });
  } catch (error) {
    // Handle DNS lookup errors
    return res.status(400).json({ error: "invalid url" });
  }
});

// Redirection endpoint for short URLs
app.get('/api/shorturl/:shortUrlId', (req, res) => {
  const shortUrlId = req.params.shortUrlId;
  const originalUrl = urlDatabase[shortUrlId];
  
  if (originalUrl) {
    // Redirect to the original URL
    res.redirect(originalUrl);
  } else {
    // If the short URL is not found, return a 404 error
    res.status(404).send('Short URL not found');
  }
});

// Start the server
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
