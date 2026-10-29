const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const lines = html.split('\n');
const tamilRegex = /[\u0B80-\u0BFF]/;

const unlocalized = [];
lines.forEach((line, index) => {
  if (tamilRegex.test(line)) {
    // If line or nearest context does not have data-i18n
    if (!line.includes('data-i18n') && !line.includes('lang="ta"') && !line.includes('<!--') && !line.includes('speakText(')) {
      unlocalized.push({ lineNum: index + 1, content: line.trim() });
    }
  }
});

console.log('Unlocalized Tamil lines count:', unlocalized.length);
unlocalized.forEach(u => console.log(u.lineNum + ': ' + u.content));
