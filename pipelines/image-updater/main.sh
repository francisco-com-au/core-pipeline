#!/bin/sh

set -e

export APPS_REPO="francisco-com-au/platform-apps"
# export CONTAINER_REGISTRY_PROJECT="placeholder"

# Figure out current commit sha
SHA=$(git rev-parse HEAD)

BRANCH=feature/image-updater-$SHA

# Clear up cloned repo
rm -rf platform-apps

# Clone repo
gh repo clone $APPS_REPO
cd platform-apps
git checkout main
git checkout -b $BRANCH

# Apply tag
mkdir -p managed/images/$APP_ID/$COMPONENT_ID/$ENV/
echo -n $IMAGE_TAG > managed/images/$APP_ID/$COMPONENT_ID/$ENV/$CONTAINER

# Add changes
git add .

function has_changes () {
    # Push to branch
    git push --set-upstream origin $BRANCH

    # Merge to master
    git checkout main
    git pull
    git merge $BRANCH
    git push
}

git commit -m "Automated commit from the image updater. $SHA" && has_changes
cd ..

# Clear up cloned repo
rm -rf platform-apps