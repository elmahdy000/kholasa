const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/drelm/.gemini/antigravity-ide/brain/da8a3936-865f-4e9f-aa65-15b13eb53374/.user_uploaded/media_1793005663461.jpg';
const publicImagesDir = path.join(__dirname, '..', 'public', 'images');
const publicDir = path.join(__dirname, '..', 'public');
const brainDir = 'C:/Users/drelm/.gemini/antigravity-ide/brain/da8a3936-865f-4e9f-aa65-15b13eb53374';

async function buildLogoAssets() {
  if (!fs.existsSync(publicImagesDir)) {
    fs.mkdirSync(publicImagesDir, { recursive: true });
  }

  console.log('Loading source image...');
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  const rgba = Buffer.alloc(width * height * 4);
  const visited = new Uint8Array(width * height);

  function isNearWhite(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Outer white/off-white background
    return r >= 232 && g >= 232 && b >= 232;
  }

  function getAlpha(idx) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const minVal = Math.min(r, g, b);
    if (minVal >= 250) return 0;
    if (minVal <= 228) return 255;
    return Math.round(((250 - minVal) / (250 - 228)) * 255);
  }

  // BFS Queue
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  // Seed borders
  for (let x = 0; x < width; x++) {
    let p1 = x;
    if (!visited[p1] && isNearWhite(p1 * 3)) {
      visited[p1] = 1;
      queue[tail++] = p1;
    }
    let p2 = (height - 1) * width + x;
    if (!visited[p2] && isNearWhite(p2 * 3)) {
      visited[p2] = 1;
      queue[tail++] = p2;
    }
  }

  for (let y = 0; y < height; y++) {
    let p1 = y * width;
    if (!visited[p1] && isNearWhite(p1 * 3)) {
      visited[p1] = 1;
      queue[tail++] = p1;
    }
    let p2 = y * width + (width - 1);
    if (!visited[p2] && isNearWhite(p2 * 3)) {
      visited[p2] = 1;
      queue[tail++] = p2;
    }
  }

  // Run BFS
  while (head < tail) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    if (cx > 0) {
      const n = curr - 1;
      if (!visited[n] && isNearWhite(n * 3)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cx < width - 1) {
      const n = curr + 1;
      if (!visited[n] && isNearWhite(n * 3)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy > 0) {
      const n = curr - width;
      if (!visited[n] && isNearWhite(n * 3)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
    if (cy < height - 1) {
      const n = curr + width;
      if (!visited[n] && isNearWhite(n * 3)) {
        visited[n] = 1;
        queue[tail++] = n;
      }
    }
  }

  console.log(`BFS visited ${tail} outer background pixels.`);

  // Clean up any stray shadow artifact in the top-left margin (x < 120, y < 150)
  for (let y = 0; y < 150; y++) {
    for (let x = 0; x < 120; x++) {
      const p = y * width + x;
      visited[p] = 1;
    }
  }

  // Build RGBA image
  for (let p = 0; p < width * height; p++) {
    const srcIdx = p * 3;
    const dstIdx = p * 4;

    rgba[dstIdx] = data[srcIdx];
    rgba[dstIdx + 1] = data[srcIdx + 1];
    rgba[dstIdx + 2] = data[srcIdx + 2];

    if (visited[p]) {
      rgba[dstIdx + 3] = getAlpha(srcIdx);
    } else {
      rgba[dstIdx + 3] = 255;
    }
  }

  // 1. Full logo (emblem + text)
  const fullLogo = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicImagesDir, 'logo-full.png'), fullLogo);
  fs.writeFileSync(path.join(brainDir, 'logo-full.png'), fullLogo);
  console.log('✓ Generated logo-full.png');

  // 2. Emblem icon only (crop above text)
  // Emblem height is from top 0 to roughly y = 735 in original 1024x1024
  const emblemOnly = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .extract({ left: 140, top: 20, width: 750, height: 710 })
    .trim({ threshold: 10 })
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicImagesDir, 'logo-icon.png'), emblemOnly);
  fs.writeFileSync(path.join(brainDir, 'logo-icon.png'), emblemOnly);
  console.log('✓ Generated logo-icon.png');

  // 3. Apple Touch Icon (180x180) - Square with emblem on rich burgundy gradient
  const appleIcon = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 128, g: 0, b: 32, alpha: 1 } // #800020
    }
  })
    .composite([
      {
        input: await sharp(emblemOnly).resize(150, 150, { fit: 'contain' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'apple-icon.png'), appleIcon);
  console.log('✓ Generated apple-icon.png');

  // 4. Standard PWA Icons (192 and 512)
  const icon192 = await sharp(emblemOnly)
    .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

  const icon512 = await sharp(emblemOnly)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  console.log('✓ Generated icon-192.png and icon-512.png');

  // 5. Maskable PWA Icons (192 and 512) with solid background and 80% safe zone
  const maskable512 = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 128, g: 0, b: 32, alpha: 1 }
    }
  })
    .composite([
      {
        input: await sharp(emblemOnly).resize(400, 400, { fit: 'contain' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), maskable512);

  const maskable192 = await sharp({
    create: {
      width: 192,
      height: 192,
      channels: 4,
      background: { r: 128, g: 0, b: 32, alpha: 1 }
    }
  })
    .composite([
      {
        input: await sharp(emblemOnly).resize(150, 150, { fit: 'contain' }).toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toBuffer();

  fs.writeFileSync(path.join(publicDir, 'icon-maskable-192.png'), maskable192);
  console.log('✓ Generated icon-maskable-192.png and icon-maskable-512.png');

  // 6. Favicon 48x48 PNG (and overwrite favicon.ico)
  const favicon48 = await sharp(emblemOnly).resize(48, 48, { fit: 'contain' }).png().toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon48);
  fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon48);
  console.log('✓ Generated favicon.ico and favicon.png');
}

buildLogoAssets().catch(console.error);
