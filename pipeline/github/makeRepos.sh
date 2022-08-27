#!/bin/bash
git ls-remote git@github.com:test-hello-world/website.git || gh repo create test-hello-world/website --private --description "Source code for hello-world" --gitignore "Node" --license "MIT"
