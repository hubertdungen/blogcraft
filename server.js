const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 3000;
const buildDir = path.join(__dirname, 'build');

const server = http.createServer((req, res) => {
  let requestedPath = path.join(buildDir, req.url === '/' ? 'index.html' : req.url);
  if (!requestedPath.startsWith(buildDir)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }
  fs.stat(requestedPath, (err, stats) => {
    if (err || stats.isDirectory()) {
      requestedPath = path.join(buildDir, 'index.html');
    }
    fs.readFile(requestedPath, (readErr, data) => {
      if (readErr) {
        res.statusCode = 404;
        return res.end('Not Found');
      }
      res.statusCode = 200;
      res.end(data);
    });
  });
});

server.listen(port, () => {
  console.log(`BlogCraft running on http://localhost:${port}`);
});
