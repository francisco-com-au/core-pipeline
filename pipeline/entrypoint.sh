#!/bin/sh

cd github
./main.sh
cd ..

cd argocd
./main.sh
cd ..

cd gcp_pulumi
./main.sh
cd ..
