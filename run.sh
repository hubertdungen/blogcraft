#!/usr/bin/env bash
# Helper script to install dependencies and start BlogCraft

set -e

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

export NODE_OPTIONS=--openssl-legacy-provider
export CHOKIDAR_USEPOLLING=true
npx react-scripts start
