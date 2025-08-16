@echo off
REM Helper script to install dependencies and start BlogCraft

IF NOT EXIST node_modules (
  echo Installing dependencies...
  npm install
)

set NODE_OPTIONS=--openssl-legacy-provider
set CHOKIDAR_USEPOLLING=true
npx react-scripts start
