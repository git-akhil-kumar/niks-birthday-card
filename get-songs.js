const fs = require('fs');
const path = require('path');

// Get songs directory
const songsDir = path.join(__dirname, 'static', 'songs');

// Read directory and filter MP3 files
const files = fs.readdirSync(songsDir);
const mp3Files = files.filter(file => path.extname(file).toLowerCase() === '.mp3');

// Sort alphabetically
mp3Files.sort();

// Output as JSON
console.log(JSON.stringify(mp3Files, null, 2));
