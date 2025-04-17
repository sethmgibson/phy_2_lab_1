#!/bin/bash

# Print environment information
echo "PWD: $(pwd)"
echo "Node version: $(node -v)"
echo "Railway environment: $RAILWAY_ENVIRONMENT"

# Install dependencies
npm install

# Check for all required PhET directories
REQUIRED_DIRS=(
  "axon"
  "babel"
  "brand"
  "charges-and-fields"
  "chipper"
  "dot"
  "joist"
  "kite"
  "perennial-alias"
  "phet-core"
  "phetcommon"
  "phetmarks"
  "query-string-machine"
  "scenery-phet"
  "scenery"
  "sherpa"
  "sun"
  "tambo"
  "tandem"
  "twixt"
  "utterance-queue"
)

echo "Checking for required directories..."
MISSING_DIRS=()
for dir in "${REQUIRED_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    MISSING_DIRS+=("$dir")
    echo "❌ Missing: $dir"
  else
    echo "✅ Found: $dir"
    # Count the number of JS files
    JS_COUNT=$(find "$dir" -name "*.js" | wc -l)
    echo "   Contains $JS_COUNT JS files"
  fi
done

if [ ${#MISSING_DIRS[@]} -gt 0 ]; then
  echo "Warning: Missing ${#MISSING_DIRS[@]} required directories"
else
  echo "All required directories are present"
fi

# Build the lab app
echo "Building lab app..."
cd charges-fields-lab-app
npm install
npm run build
cd ..

# Create a file manifest for debugging
echo "Creating file manifest..."
find . -name "*.js" | grep -v "node_modules" | sort > file_manifest.txt
echo "File manifest created with $(wc -l < file_manifest.txt) JS files"

# Check if key files exist
KEY_FILES=(
  "/joist/js/Sim.js"
  "/joist/js/preferences/PreferencesModel.js"
  "/joist/js/simLauncher.js"
  "/tandem/js/Tandem.js"
)

echo "Checking for key files..."
for file in "${KEY_FILES[@]}"; do
  if [ -f ".${file}" ]; then
    echo "✅ Found: ${file}"
  else
    echo "❌ Missing: ${file}"
  fi
done

echo "Build script completed" 