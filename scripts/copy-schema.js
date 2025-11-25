const fs = require('fs');
const path = require('path');

// Cross-platform script to copy schema.sql to dist folder
const srcPath = path.join(__dirname, '..', 'src', 'config', 'schema.sql');
const destDir = path.join(__dirname, '..', 'dist', 'config');
const destPath = path.join(destDir, 'schema.sql');

try {
  // Ensure destination directory exists
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(srcPath, destPath);
  console.log('✅ Schema file copied successfully');
} catch (error) {
  console.error('❌ Error copying schema file:', error.message);
  process.exit(1);
}
