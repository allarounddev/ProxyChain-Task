const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const sizeOf = require('image-size');
const http = require('http')

const app = express();

// Create the proxy middleware
const proxyMiddleware = createProxyMiddleware({
  target: 'http://127.0.0.1:8080/', // Replace with the target URL you want to proxy
  changeOrigin: true, // Changes the origin of the host header to the target URL
  onProxyRes: async (proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'];
    console.log(contentType);
    if (contentType && contentType.startsWith('image/')) {
      // Intercept image requests

      // Get the dimensions of the image without downloading the entire file
      console.log('http://127.0.0.1:8080' + req.url);
      const size = await getImageSize(req.url);

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
  return new Promise((resolve, reject) => {
    http.get(url, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        chunks.push(chunk);
      }).on('end', () => {
        const buffer = Buffer.concat(chunks);
        const size = imageSize(buffer);
        resolve(size);
      }).on('error', (error) => {
        reject(error);
      });
    });
  });
}

// Helper function to generate a dummy image with specified dimensions
function generateDummyImage(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  context.fillStyle = 'gray';
  context.fillRect(0, 0, width, height);
  return canvas.toDataURL('image/jpeg');
}