require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use(express.json());

let nextShortUrlId = 1;
const urlDatabase = {}; //

function isValidUrl(url) {
  return /^(ftp|http|https):\/\/[^ "]+$/.test(url);
}

app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;


  if (!isValidUrl(originalUrl)) {
    return res.status(404).send({ message: "Invalid Url " });
  }
  urlDatabase[nextShortUrlId] = originalUrl;
  res.json({
    original_url: originalUrl,
    shortUrl: nextShortUrlId++,
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
