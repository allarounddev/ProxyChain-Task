const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors())

app.get('/jpg-image', (req, res) => {
  // Return a dummy JPG image
  res.sendFile('dummy.jpg', { root: __dirname });
});

app.get('/not-image', (req, res) => {
  // Return a text/html response
  res.send('Hello world');
});

app.listen(8080, () => {
  console.log('Express app is listening on port 8080');
});