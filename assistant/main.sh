#!/bin/sh

set -e

# Compile app
npx tsc

# Run app
source ./env
node index.js
