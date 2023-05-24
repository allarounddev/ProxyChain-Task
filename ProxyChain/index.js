const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const sizeOf = require('image-size');
const http = require('http')
const https = require('https')
const sharp = require('sharp');
const cheerio = require('cheerio');
const zlib = require('zlib');
const ProxyChain = require('proxy-chain');
const app = express();
const probe = require('probe-image-size');

const server = new ProxyChain.Server({
  port: 3000,
  prepareRequestFunction: async ({ request, username, password, hostname, port, isHttp }) => {
    const size = await getImageSize('http://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg');
    console.log(size.height)
    if ((request.url == "/jpg-image") && (size)) {
      const dummyImage = generateDummyImage(size.width, size.height);
        return {
            customResponseFunction: () => {
                return {
                    statusCode: 200,
                    upstreamProxyUrl: `http://127.0.0.1:3000`,
                    body: "Saved dummy image",
                    // headers: {
                    //   'Content-Type': 'image/*',
                    // },
                };
            },
        };
    }
  },
});


server.listen(() => {
  console.log(`Proxy server is listening on port ${server.port}`);
});


async function getImageSize(url) {
  console.log(url)
  let result = await probe(url);
  console.log(result)
  return result
}


// Helper function to generate a dummy image with specified dimensions
function generateDummyImage(width, height) {
  const imageWidth = parseInt(width);
  const imageHeight = parseInt(height);

  // const imageBuffer = Buffer.from(`<svg xmlns="https://svgsilh.com/svg_v2/1801287.svg" width="${imageWidth}" height="${imageHeight}"/>`);
  console.log("generateDummyImage")

  const image = sharp('./tempdummy.jpg').
  resize(imageWidth,imageHeight).
  flatten().
  toFile('newFile.jpg');

  return image
}