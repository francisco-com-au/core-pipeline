#!/bin/bash

set -e

export APPS_REPO="francisco-com-au/platform-apps"
export CONTAINER_REGISTRY_PROJECT="placeholder"

# Figure out current commit sha
SHA=$(git rev-parse HEAD)

BRANCH=feature/core-pipeline-$SHA

# Clear up cloned repo
rm -rf platform-apps

# Clone repo
gh repo clone $APPS_REPO
cd platform-apps
git checkout main
git checkout -b $BRANCH
cd ..

# Compile app
npx tsc

# Run app
node index.js

# Add changes
cd platform-apps
git add .

function has_changes () {
    # Push to branch
    git push --set-upstream origin $BRANCH

    # Merge to master
    git checkout main
    git merge $BRANCH
    git push
}

git commit -m "Automated commit from the core pipeline. $SHA" && has_changes
cd ..

# Clear up cloned repo
rm -rf platform-apps

