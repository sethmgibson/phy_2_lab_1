#!/bin/bash

# Add all PhET simulation files to git
echo "Adding PhET simulation files to git..."

# Core simulation files
git add charges-and-fields/charges-and-fields_en.html
git add charges-and-fields/js
git add charges-and-fields/assets
git add charges-and-fields/mipmaps
git add charges-and-fields/*.json

# Required dependencies
git add assert/js
git add axon/js
git add babel/js
git add brand/js
git add chipper/js
git add dot/js
git add joist/js
git add kite/js
git add phet-core/js
git add phetcommon/js
git add query-string-machine/js
git add scenery/js
git add scenery-phet/js
git add sherpa/lib
git add sun/js
git add tambo/js
git add tandem/js
git add twixt/js
git add utterance-queue/js

echo "Done adding files. Please review with 'git status' before committing and pushing." 