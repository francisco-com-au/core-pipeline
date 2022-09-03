#!/bin/bash

set -e

# Remove any existing script
rm -f makeRepos.sh

# Compile app
npx tsc

# Make script
node index.js
chmod +x ./makeRepos.sh

# Run script
./makeRepos.sh

# Remove any generated script
rm -f makeRepos.sh
