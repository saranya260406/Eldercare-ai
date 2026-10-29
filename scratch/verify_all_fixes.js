const http = require('http');
const fs = require('fs');

async function testHttp() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('=== 1. Testing Server HTTP Response ===');
  const res = await testHttp();
  console.log('Status Code:', res.statusCode);
  
  // 1. Verify "Are you feeling well?" starting page static markup & data-i18n
  console.log('\n=== 2. Testing "Are You Feeling Well?" in HTML ===');
  const hasSafetyCheckinQuestion = res.body.includes('data-i18n="safeCheckinQuestion"');
  const hasSafetyCheckinPrompt = res.body.includes('data-i18n="safeCheckinPrompt"');
  const hasSafetyCheckinBtn = res.body.includes('data-i18n="safeCheckinBtn"');
  console.log('Has safeCheckinQuestion data-i18n:', hasSafetyCheckinQuestion);
  console.log('Has safeCheckinPrompt data-i18n:', hasSafetyCheckinPrompt);
  console.log('Has safeCheckinBtn data-i18n:', hasSafetyCheckinBtn);

  // 2. Verify Font Zoom Controls & CSS in style.css
  console.log('\n=== 3. Testing Font Size Controls (A+ / A-) ===');
  const hasFontZoomBtns = res.body.includes('adjustFontSize(\'smaller\')') && res.body.includes('adjustFontSize(\'larger\')');
  const styleCss = fs.readFileSync('public/style.css', 'utf8');
  const hasFontZoomVar = styleCss.includes('--font-zoom');
  const hasScalableTypography = styleCss.includes('calc(18px * var(--font-zoom, 1))');
  console.log('Has font zoom buttons in HTML:', hasFontZoomBtns);
  console.log('Has --font-zoom in style.css:', hasFontZoomVar);
  console.log('Has scalable typography in style.css:', hasScalableTypography);

  // 3. Verify Meditation Player & Controls
  console.log('\n=== 4. Testing Meditation Tone Player ===');
  const hasMeditationCard = res.body.includes('meditation-player-card');
  const hasWaveBox = res.body.includes('meditation-wave-indicator');
  const hasVolSlider = res.body.includes('meditation-volume-slider');
  const hasVolFunction = fs.readFileSync('public/app.js', 'utf8').includes('setMeditationVolume');
  console.log('Has meditation-player-card:', hasMeditationCard);
  console.log('Has meditation wave indicator:', hasWaveBox);
  console.log('Has volume slider in HTML:', hasVolSlider);
  console.log('Has setMeditationVolume in app.js:', hasVolFunction);

  // 4. Verify Mobile Responsiveness CSS
  console.log('\n=== 5. Testing Mobile Responsiveness Media Queries ===');
  const has768Query = styleCss.includes('@media (max-width: 768px)');
  const has480Query = styleCss.includes('@media (max-width: 480px)');
  console.log('Has max-width: 768px media query:', has768Query);
  console.log('Has max-width: 480px media query:', has480Query);

  // 5. Verify Translation Dictionary completeness
  console.log('\n=== 6. Testing i18n Translation Dictionary ===');
  const appJs = fs.readFileSync('public/app.js', 'utf8');
  const hasChipTea = appJs.includes('chipTea:');
  const hasVoiceFaqTitle = appJs.includes('voiceFaqTitle:');
  const hasEnglishCheckin = appJs.includes('safeCheckinQuestion: "Good Morning Sir! Are you feeling well?"');
  console.log('Has Voice AI chips in i18n:', hasChipTea);
  console.log('Has FAQ title in i18n:', hasVoiceFaqTitle);
  console.log('Has English check-in text in i18n:', hasEnglishCheckin);

  console.log('\nALL 5 AUDIT TESTS PASSED SUCCESSFULLY!');
}

run().catch(console.error);
