#!/bin/bash

set -e

# Figure out current commit sha
SHA=$(git rev-parse HEAD)

BRANCH=feature/core-pipeline-$SHA

# Clear up cloned repo
rm -rf platform-apps

# Clone repo
git clone git@github.com:francisco-com-au/platform-apps.git
cd platform-apps
git checkout main
git checkout -b $BRANCH

# Compile app
npx tsc

# Run app
node index.js

# Add changes

# Push to branch
cd platform-apps
git add .
git commit -m "Automated commit from the core pipeline. $SHA"
git push --set-upstream origin $BRANCH

# Merge to master
git checkout main
git merge $BRANCH
git push

