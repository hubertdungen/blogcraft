const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: 'inherit', ...opts });
}

const root = __dirname;
const pkgJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkgJson.version || '0.0.0';
const distDir = path.join(root, 'dist');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

if (!fs.existsSync(path.join(root, 'node_modules'))) {
  console.log('Installing dependencies...');
  run('npm install');
}

console.log('Building production assets...');
run('npx react-app-rewired build', {
  env: { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider' }
});

const exeName = `blogcraft-${version}.exe`;
console.log('Packaging executable...');
run(`npx pkg server.js --targets node18-win-x64 --output dist/${exeName} --assets "build/**/*"`);

console.log(`\nExecutable created at dist/${exeName}`);
