const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

lines.forEach((line, idx) => {
  const lineNum = idx + 1;
  if (/[\u0B80-\u0BFF]/.test(line)) {
    const prev = lines[idx - 1] || '';
    const hasI18n = line.includes('data-i18n') || 
                    prev.includes('data-i18n') || 
                    line.includes('lang-btn-text') || 
                    line.includes('profile-avatar-letter') || 
                    line.includes('med-id-avatar-letter') || 
                    line.includes('hero-senior-name') || 
                    line.includes('water-') || 
                    line.includes('profile-') || 
                    line.includes('onclick=');
    if (!hasI18n) {
      console.log('Uncovered line ' + lineNum + ': ' + line.trim());
    }
  }
});
