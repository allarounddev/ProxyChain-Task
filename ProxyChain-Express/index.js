const express = require('express');
const cors = require('cors');
const app = express();
const url = require('url')

app.use(cors())

app.get('/jpg-image', (req, res) => {
  // Return a dummy JPG image
  // res.sendFile('', { root: __dirname });
  const imgUrl = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
  const options = url.parse(imgUrl)
  console.log(options.href)
  // res.sendFile(imgUrl)
  res.redirect(imgUrl);

});

app.get('/not-image', (req, res) => {
  // Return a text/html response
  res.send('Hello world');
});

app.listen(8080, () => {
  console.log('Express app is listening on port 8080');
});