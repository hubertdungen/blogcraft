#!/usr/bin/env bash
# Helper script to install dependencies and start BlogCraft

set -e

if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

npm start
