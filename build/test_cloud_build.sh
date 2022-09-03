#!/bin/bash

repo_root=/Users/franciscogalarza/projects/francisco-com-au/core-pipeline
PULUMI_KEY=$(cat $repo_root/pulumi-key)

docker run --rm -it \
    -v $repo_root:/app \
    -e PULUMI_ACCESS_TOKEN=$PULUMI_KEY
    --entrypoint /bin/sh \
    pulumi/pulumi
    