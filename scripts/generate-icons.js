const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svg512 = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="100%" stop-color="#F59E0B" />
    </linearGradient>
  </defs>
  
  <!-- Rounded App Icon Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  
  <!-- Subtle Inner Border Glow -->
  <rect x="8" y="8" width="496" height="496" rx="104" stroke="white" stroke-opacity="0.12" stroke-width="4"/>
  
  <!-- Center Emblem: Stylized Book & Sparkle -->
  <g transform="translate(106, 126)">
    <!-- Book Base / Pages -->
    <path d="M150 160 C100 130 30 135 0 150 L0 50 C30 35 100 30 150 60 C200 30 270 35 300 50 L300 150 C270 135 200 130 150 160 Z" fill="white" fill-opacity="0.95" />
    <path d="M150 60 L150 160" stroke="#4F46E5" stroke-width="6" stroke-linecap="round" />
    
    <!-- Floating Sparkle / Star above book -->
    <path d="M150 -30 L160 5 L195 15 L160 25 L150 60 L140 25 L105 15 L140 5 Z" fill="url(#goldGrad)" />
    
    <!-- Accent Dots -->
    <circle cx="60" cy="5" r="7" fill="#FCD34D" fill-opacity="0.8" />
    <circle cx="240" cy="15" r="5" fill="#FCD34D" fill-opacity="0.8" />
  </g>
  
  <!-- Arabic Brand Mark 'الخلاصة' -->
  <text x="256" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="900" fill="white" text-anchor="middle" letter-spacing="1">الخلاصة</text>
  <text x="256" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#A5B4FC" text-anchor="middle" letter-spacing="4">EL KHOLASA</text>
</svg>
`;

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // 512x512
  await sharp(Buffer.from(svg512))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 192x192
  await sharp(Buffer.from(svg512))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png');
}

main().catch(console.error);
