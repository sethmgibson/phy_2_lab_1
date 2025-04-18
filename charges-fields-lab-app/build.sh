#!/bin/bash

# Clean dist folder
rm -rf dist

# Build with parcel
NODE_ENV=production npx parcel build index.html --no-minify --public-url ./

# Create a copy of the index.html that directly references the bundled files
cp dist/index.html dist/static.html

# Fix paths in HTML files
node fix-paths.js

# Ensure all file permissions are set correctly
chmod -R 755 dist

echo "Build completed successfully" 