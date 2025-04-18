#!/bin/bash

# Clean dist folder and npm cache
rm -rf dist
npm cache clean --force

# Build with parcel
NODE_ENV=production npx parcel build index.html --no-minify --public-url ./

# Create a copy of the index.html that directly references the bundled files
cp dist/index.html dist/static.html

# Fix paths in HTML files
node fix-paths.js

# Copy html2canvas directly from node_modules to ensure it's available
cp node_modules/html2canvas/dist/html2canvas.min.js dist/html2canvas.js

# Create a special html2canvas file for compatibility
echo "window.html2canvas = html2canvas;" > dist/html2canvas-global.js

# Ensure all file permissions are set correctly
chmod -R 755 dist

echo "Build completed successfully" 