const express = require('express');
const path = require('path');

const app = express();
const buildPath = path.join(__dirname, process.env.BUILD_DIR || 'build');

app.use(express.static(buildPath));

app.get('*', (_, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`BlogCraft running on port ${port}`);
});
