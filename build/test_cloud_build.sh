#!/bin/bash

repo_root=/Users/franciscogalarza/projects/francisco-com-au/core-pipeline
PULUMI_ACCESS_TOKEN=$(cat $repo_root/pulumi-token)
GH_TOKEN=$(cat $repo_root/github-token)

docker run --rm -it \
    -v $repo_root:/app \
    -e PULUMI_ACCESS_TOKEN=$PULUMI_ACCESS_TOKEN \
    -e GH_TOKEN=$GH_TOKEN \
    --entrypoint /bin/bash \
    pulumi/pulumi
    