const fs = require('fs');
const path = require('path');

// Create a simple PNG (1x1 transparent pixel for favicon, colored for others)
// This is a base64-encoded 1x1 transparent PNG
const transparentPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Base64-encoded 1024x1024 blue square PNG for icon
const bluePNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const assetsDir = path.join(__dirname, 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Create all required assets
const assets = [
  { name: 'favicon.png', data: transparentPNG },
  { name: 'icon.png', data: bluePNG },
  { name: 'splash.png', data: bluePNG },
  { name: 'adaptive-icon.png', data: bluePNG }
];

assets.forEach(asset => {
  const filePath = path.join(assetsDir, asset.name);
  fs.writeFileSync(filePath, asset.data);
  console.log(`Created ${asset.name}`);
});

console.log('\nAll placeholder assets created successfully!');
console.log('These are minimal placeholders. For production, replace them with proper designs.');
