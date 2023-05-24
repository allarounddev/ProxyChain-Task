const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const sizeOf = require('image-size');
const http = require('http')
const https = require('https')
const sharp = require('sharp');
const cheerio = require('cheerio');
const zlib = require('zlib');

const app = express();


const proxyMiddleware = createProxyMiddleware({
  target: 'http://127.0.0.1:8080/', // Replace with the target URL you want to proxy
  changeOrigin: true, // Changes the origin of the host header to the target URL
  onProxyRes: async (proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'];

    if (proxyRes) {
      // Intercept image requests

      // Get the dimensions of the image without downloading the entire file
      console.log('http://127.0.0.1:8080' + req.url);
      const size = await getImageSize('http://127.0.0.1:8080' + req.url);
      console.log(size)
      if (size) {
        // Generate a dummy image with the same dimensions
        const dummyImage = generateDummyImage(size.width, size.height);
        return {
          customResponseFunction: () => {
            return {
              statusCode: 200,
              body: dummyImage,
              headers: {
                'Content-Type': 'image/jpeg',
              },
            };
          },
        };
      }
    }
    // Continue with the response
    return proxyRes;
  }
});

// Proxy all requests to the target server
app.use('/', proxyMiddleware);

// Start the server
app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

function getImageSize(url) {
  console.log(url)
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      }).on('end', () => {
        const buffer = Buffer.concat(chunks);
        const size = sizeOf(buffer);
        resolve(size);
      }).on('error', (error) => {
        reject(error);
      });
    });
  });
}


// Helper function to generate a dummy image with specified dimensions
function generateDummyImage(width, height) {
  const imageWidth = parseInt(width);
  const imageHeight = parseInt(height);

  const imageBuffer = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${imageWidth}" height="${imageHeight}"/>`);

  sharp(imageBuffer)
    .png()
    .toBuffer()
    .then((data) => {
      return data; 
      // res.set('Content-Type', 'image/png');
      // res.send(data);
    })
    .catch((error) => {
      // console.error('Error:', error);
      // res.sendStatus(500);
      return null;
    });
}