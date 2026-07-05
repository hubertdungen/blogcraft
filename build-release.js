const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const pkgJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkgJson.version || '0.0.0';
const distDir = path.join(root, 'dist');
const pkgConfigFile = 'pkg.config.json';

const releaseTargets = {
  'win-x64': {
    label: 'Windows x64',
    pkgTarget: 'node18-win-x64',
    fileName: `blogcraft-${version}-windows-x64.exe`
  },
  'linux-x64': {
    label: 'Linux x64',
    pkgTarget: 'node18-linux-x64',
    fileName: `blogcraft-${version}-linux-x64`
  },
  'macos-x64': {
    label: 'macOS Intel',
    pkgTarget: 'node18-macos-x64',
    fileName: `blogcraft-${version}-macos-x64`
  },
  'macos-arm64': {
    label: 'macOS Apple Silicon',
    pkgTarget: 'node18-macos-arm64',
    fileName: `blogcraft-${version}-macos-arm64`
  }
};

const targetGroups = {
  win: ['win-x64'],
  windows: ['win-x64'],
  linux: ['linux-x64'],
  mac: ['macos-x64', 'macos-arm64'],
  macos: ['macos-x64', 'macos-arm64'],
  all: ['win-x64', 'linux-x64', 'macos-x64', 'macos-arm64']
};

function quoteArg(arg) {
  const value = String(arg);
  if (/^[A-Za-z0-9_./:=@-]+$/.test(value)) {
    return value;
  }
  return `"${value.replace(/"/g, '\\"')}"`;
}

function run(command, args = [], opts = {}) {
  const line = [command, ...args].map(quoteArg).join(' ');
  execSync(line, { stdio: 'inherit', cwd: root, ...opts });
}

function parseArgs(argv) {
  const requested = [];
  let skipBuild = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--skip-build') {
      skipBuild = true;
    } else if (arg === '--all') {
      requested.push('all');
    } else if (arg === '--current') {
      requested.push('current');
    } else if (arg === '--target' || arg === '--targets') {
      i += 1;
      if (!argv[i]) {
        throw new Error(`${arg} needs a value`);
      }
      requested.push(...argv[i].split(','));
    } else if (arg.startsWith('--target=')) {
      requested.push(...arg.slice('--target='.length).split(','));
    } else if (arg.startsWith('--targets=')) {
      requested.push(...arg.slice('--targets='.length).split(','));
    } else if (arg.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      requested.push(...arg.split(','));
    }
  }

  return {
    requested: requested.length ? requested : ['win'],
    skipBuild
  };
}

function getCurrentTargetKey() {
  if (process.platform === 'win32' && process.arch === 'x64') {
    return 'win-x64';
  }
  if (process.platform === 'linux' && process.arch === 'x64') {
    return 'linux-x64';
  }
  if (process.platform === 'darwin' && process.arch === 'x64') {
    return 'macos-x64';
  }
  if (process.platform === 'darwin' && process.arch === 'arm64') {
    return 'macos-arm64';
  }

  throw new Error(`No release target is configured for ${process.platform}-${process.arch}`);
}

function resolveTargets(requested) {
  const targetKeys = [];

  requested.forEach((rawName) => {
    const name = rawName.trim().toLowerCase();
    if (!name) {
      return;
    }

    if (name === 'current') {
      targetKeys.push(getCurrentTargetKey());
      return;
    }

    if (targetGroups[name]) {
      targetKeys.push(...targetGroups[name]);
      return;
    }

    if (releaseTargets[name]) {
      targetKeys.push(name);
      return;
    }

    throw new Error(`Unknown release target: ${rawName}`);
  });

  return [...new Set(targetKeys)].map((key) => releaseTargets[key]);
}

function ensureDependencies() {
  if (!fs.existsSync(path.join(root, 'node_modules'))) {
    console.log('Installing dependencies...');
    run('npm', ['install']);
  }
}

function ensureProductionBuild(skipBuild) {
  if (!skipBuild) {
    console.log('Building production assets...');
    run('npm', ['run', 'build'], {
      env: { ...process.env, NODE_OPTIONS: '--openssl-legacy-provider' }
    });
  }

  const indexFile = path.join(root, 'build', 'index.html');
  if (!fs.existsSync(indexFile)) {
    throw new Error('Missing build/index.html. Run without --skip-build to create production assets.');
  }
}

function packageTarget(target) {
  const outputPath = path.join('dist', target.fileName);

  console.log(`Packaging ${target.label} portable binary...`);
  run('npx', [
    'pkg',
    'server.js',
    '--config',
    pkgConfigFile,
    '--targets',
    target.pkgTarget,
    '--output',
    outputPath,
    '--public',
    '--no-bytecode',
    '--public-packages',
    '*'
  ]);

  return outputPath;
}

function main() {
  const { requested, skipBuild } = parseArgs(process.argv.slice(2));
  const targets = resolveTargets(requested);

  if (!targets.length) {
    throw new Error('No release targets selected.');
  }

  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  ensureDependencies();
  ensureProductionBuild(skipBuild);

  const outputs = targets.map(packageTarget);

  console.log('\nRelease files created:');
  outputs.forEach((file) => console.log(`- ${file}`));
  console.log('\nRun one of these files and open http://localhost:3000 in a browser.');
}

main();
