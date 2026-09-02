import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svgPath = path.resolve('public/icon.svg');
const svgBuffer = fs.readFileSync(svgPath);

async function generate() {
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/pwa-192x192.png');

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/pwa-512x512.png');

  // apple-touch-icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');

  // maskable 512x512 with safe margin padding (center scaled to 80%)
  const innerSize = Math.round(512 * 0.8);
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).toBuffer();
  
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 11, g: 14, b: 20, alpha: 1 }
    }
  })
  .composite([{ input: innerBuffer, gravity: 'center' }])
  .png()
  .toFile('public/pwa-maskable-512x512.png');

  // favicon 32x32 png
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.ico');

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
