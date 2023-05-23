const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const sizeOf = require('image-size');
const http = require('http')
const https = require('https')
const sharp = require('sharp');
const cheerio = require('cheerio');
const zlib = require('zlib');

const app = express();

// Create the proxy middleware
const proxyMiddleware = createProxyMiddleware({
  target: 'https://oripa.clove.jp/', // Replace with the target URL you want to proxy
  changeOrigin: true, // Changes the origin of the host header to the target URL
  selfHandleResponse: true,
  onProxyRes: async (proxyRes, req, res) => {
    const contentType = proxyRes.headers['content-type'];

    if (true) {
      try {
        const chunks = [];

        // Collect the response data chunks
        proxyRes.on('data', (chunk) => {
          chunks.push(chunk);
        });

        // Wait for the response to finish
        await new Promise((resolve) => {
          proxyRes.on('end', resolve);
        });

        // Combine the response data chunks into a single buffer
        const responseData = Buffer.concat(chunks);

        if (contentType && contentType.includes('image')) {
          console.log('something');
          const sharp = require('sharp');

          const width = 500; // Replace with your desired width
          const height = 500; // Replace with your desired height

          sharp({
            create: {
              width: width,
              height: height,
              channels: 4,
              background: { r: 128, g: 128, b: 128, alpha: 1 }
            }
          })
            .png()
            .toBuffer()
            .then((buffer) => {
              const dummyImageBase64 = buffer.toString('base64');

              // Set the appropriate headers and send the response
              res.setHeader('content-type', 'image/png');
              res.send(Buffer.from(dummyImageBase64, 'base64'));
            })
            .catch((error) => {
              console.error('Failed to create dummy image:', error);
              res.sendStatus(500);
            });
            return;
        }
        // Convert the buffer to a string using the appropriate encoding
        // const encoding = proxyRes.headers['content-encoding'] || 'utf-8';
        // const htmlBody = responseData.toString('utf-8');
        try{
          htmlBody = zlib.gunzipSync(responseData).toString('utf8');
        } catch(err) {
          htmlBody= responseData.toString('utf8');
        }

        if(htmlBody.indexOf("<img") < 0) {
          proxyRes.pipe(res);
          return;
        }

        // Parse the HTML body using Cheerio
        const $ = cheerio.load(htmlBody);

        // Replace all <img> tags with a dummy image of the same size and solid gray color
        $('img').each((index, element) => {
          const imgWidth = $(element).attr('width');
          const imgHeight = $(element).attr('height');
          const dummyImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkwAIYBAAUDAAK+AAPbDjkRAAAAABJRU5ErkJggg==`;

          $(element).attr('src', dummyImage);
          $(element).attr('width', imgWidth);
          $(element).attr('height', imgHeight);
          $(element).css('background-color', 'gray');
        });

        // Get the modified HTML
        const modifiedHtml = $.html();

        // Set the modified HTML as the response
        res.setHeader('content-type', 'text/html');
        res.send(modifiedHtml);
      } catch (error) {
        console.error('Error handling proxy response:', error);
        res.sendStatus(500);
      }
    } 
    else {
      // For other content types, forward the response as-is
      // res.setHeader('content-type', contentType);
      proxyRes.pipe(res);
    }
  }
});

// Proxy all requests to the target server
app.use('/', proxyMiddleware);

// Start the server
app.listen(3000, () => {
  console.log('Proxy server is running on port 3000');
});

async function getImageSize(url) {
  return await new Promise((resolve, reject) => {
    if(url.startsWith("https")) {
      https.get(url, (response) => {
        const chunks = [];
  
        response.on('data', (chunk) => {
          chunks.push(chunk);
        }).on('end', () => {
          const buffer = Buffer.concat(chunks);
          const dimensions = sizeOf(buffer);
          resolve(dimensions);
        }).on('error', (error) => {
          reject(error);
        });
      });
    }
    else {
      http.get(url, (response) => {
        const chunks = [];

        response.on('data', (chunk) => {
          chunks.push(chunk);
        }).on('end', () => {
          const buffer = Buffer.concat(chunks);
          const dimensions = sizeOf(buffer);
          resolve(dimensions);
        }).on('error', (error) => {
          reject(error);
        });
      });
    }
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