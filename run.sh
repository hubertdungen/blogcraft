#!/usr/bin/env bash
# Helper script to install dependencies and start BlogArtifex

set -e

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

npm start
