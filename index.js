require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const urlDatabase = {};
let nextShortUrlId = 1;

app.use(express.json());

app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;
  // const isValidUrl = /^(https?):\/\/(\w+\.)+\w{2,}(\/.*)?$/.test(originalUrl);
  // if (!isValidUrl) {
  //   return res.status(400).json({ error: 'invalid url' });
  // }

  // const urlParts = originalUrl.split('/');
  // const host = urlParts[2];
  // dns.lookup(host, (err) => {
  //   if (err) {
  //     return res.status(400).json({ error: 'invalid url' });
  //   }
  // })  
  // Generate short URL
  const shortUrl = nextShortUrlId++;
  urlDatabase[shortUrl] = originalUrl;

  res.json({ original_url: originalUrl, short_url: shortUrl });
});

app.get('/api/shorturl/:shortUrl', (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);
  const originalUrl = urlDatabase[shortUrl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.status(404).json({ error: 'short url not found' });
  }
});


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
