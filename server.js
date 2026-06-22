const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const buildDir = path.join(__dirname, 'build');
const indexFile = path.join(buildDir, 'index.html');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      return res.end(error.code === 'ENOENT' ? 'Not Found' : 'Internal Server Error');
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    return res.end(data);
  });
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname);
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Bad Request');
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^[/\\]+/, '');
  const requestedPath = path.resolve(buildDir, relativePath);
  const pathWithinBuild = path.relative(buildDir, requestedPath);

  if (pathWithinBuild.startsWith('..') || path.isAbsolute(pathWithinBuild)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Forbidden');
  }

  fs.stat(requestedPath, (err, stats) => {
    if (!err && stats.isFile()) {
      return sendFile(res, requestedPath);
    }

    // Support client-side routes, but do not hide missing asset errors.
    if (!path.extname(relativePath)) {
      return sendFile(res, indexFile);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not Found');
  });
});

server.listen(port, () => {
  console.log(`BlogCraft running on http://localhost:${port}`);
});
