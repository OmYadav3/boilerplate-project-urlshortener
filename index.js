require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/public", express.static(`${process.cwd()}/public`));

// Route for the home page
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// URL shortening endpoint
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  if (!isValidUrl(originalUrl)) {
    // Return a 400 status for invalid input
    return res.status(400).send({ error: "Invalid URL" });
  }
  
  // Store the original URL in the database
  urlDatabase[nextShortUrlId] = originalUrl;
  
  // Respond with the JSON containing original_url and short_url properties
  res.json({
    original_url: originalUrl,
    short_url: nextShortUrlId++
  });
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

// Validation function for URLs
function isValidUrl(url) {
  const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlPattern.test(url);
}

// Declaration for URL database and next short URL ID
let nextShortUrlId = 1;
const urlDatabase = {};
