#!/usr/bin/env node
// Script to build the React app and package it into a Windows executable
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

// Build the application using the project's build script
run('npm run build');

// Determine a compatible Node.js version for pkg
const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
const envNode = process.env.PKG_NODE_VERSION && parseInt(process.env.PKG_NODE_VERSION, 10);
let pkgNode = envNode || (nodeMajor >= 18 ? 18 : 16);
const target = `node${pkgNode}-win-x64`;

// Ensure output directory exists
const outDir = path.join(__dirname, '..', 'dist');
fs.mkdirSync(outDir, { recursive: true });

// Package the server using pkg
run(`npx pkg server.js --targets ${target} --output ${path.join(outDir, 'BlogCraft.exe')}`);
