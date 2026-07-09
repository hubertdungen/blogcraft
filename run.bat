@echo off
REM Helper script to install dependencies and start BlogArtifex

IF NOT EXIST node_modules (
  echo Installing dependencies...
  npm install
)

set NODE_OPTIONS=--openssl-legacy-provider
npm start
