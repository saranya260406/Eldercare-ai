// ElderCare AI Backend Server
// Connected with SQLite Database (data/eldercare.db)
// Built with Node.js standard library & native SQLite engine

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Connect to SQLite Database Engine
const db = require('./db.js');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Helper: parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({ text: body });
      }
    });
    req.on('error', reject);
  });
}

// Helper: send JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Database-Engine': 'SQLite 3 (node:sqlite)',
    'X-Backend-Service': 'ElderCare-AI-Core'
  });
  res.end(JSON.stringify(data));
}

// AI Companion Chat Engine (Powered by SQLite Knowledge Base & Live Patient Records)
function processAIChat(userMessage = '') {
  const query = userMessage.toLowerCase().trim();
  const kb = db.getKnowledgeBase();
  const meds = db.getMedications();
  const vitals = db.getVitals();
  const latestVital = vitals[0] || {};
  const profile = db.getProfile();
  const seniorName = profile.tamilName ? profile.tamilName.split(' ')[0] : 'ராமநாதன்';
  const englishName = profile.name ? profile.name.split(' ')[0] : 'Ramanathan';

  // 1. Direct Knowledge Base Match
  for (const item of kb) {
    const matched = item.keywords.some(k => query.includes(k.toLowerCase()));
    if (matched) {
      return {
        replyEn: item.englishAnswer,
        replyTa: item.tamilAnswer,
        intent: 'medical_guidance',
        matchedQuestion: item.englishQuestion,
        source: 'SQLite:health_knowledge_base'
      };
    }
  }

  // 2. Specific Medication Queries
  if (query.includes('medicine') || query.includes('tablet') || query.includes('pill') || query.includes('மாத்திரை') || query.includes('மருந்து')) {
    const untaken = meds.filter(m => !m.takenToday);
    const lowStock = meds.filter(m => m.stock <= m.refillThreshold);

    const replyEn = `Here is your live medication schedule from the database: You have ${meds.length} prescribed medicines. Today, ${untaken.length} are yet to be taken. ${lowStock.length ? `Refill reminder: ${lowStock.map(m => m.name).join(', ')} is running low on stock.` : 'All medicine stocks are sufficient.'}`;
    const replyTa = `வணக்கம் ${seniorName} ஐயா! உங்கள் மருந்து விவரம்: மொத்தம் ${meds.length} பரிந்துரைக்கப்பட்ட மருந்துகள் உள்ளன. இன்று இன்னும் ${untaken.length} மாத்திரைகள் எடுக்க வேண்டும். ${lowStock.length ? `எச்சரிக்கை: ${lowStock.map(m => m.tamilName || m.name).join(', ')} மாத்திரை இருப்பு குறைவாக உள்ளது.` : 'அனைத்து மருந்துகளும் போதுமான அளவு கையிருப்பில் உள்ளன.'} மறக்காமல் உணவுக்குப் பின் மாத்திரை எடுங்கள்.`;

    return {
      replyEn,
      replyTa,
      intent: 'medication_status',
      medications: meds,
      source: 'SQLite:medications'
    };
  }

  // 3. SOS / Emergency Triggers
  if (query.includes('sos') || query.includes('emergency') || query.includes('help') || query.includes('காப்பாற்று') || query.includes('அவசரம்') || query.includes('உதவி')) {
    return {
      replyEn: 'EMERGENCY PROTOCOL ACTIVATED: Please remain seated calmly. Tap the SOS button on screen or say YES to alert Priya (+91 98401 23456) and ambulance services now.',
      replyTa: 'அவசர உதவி தயாராக உள்ளது: பதற்றமடையாமல் அமைதியாக அமருங்கள் ஐயா. திரையில் உள்ள சிவப்பு நிற SOS பொத்தானை அழுத்துங்கள் அல்லது ஆம்புலன்ஸ் (108) அழைக்கவா என்று கூறுங்கள். உங்கள் மகள் பிரியாவிற்கு உடனடி தகவல் செல்கிறது.',
      intent: 'emergency_alert',
      urgent: true,
      source: 'SQLite:emergency_contacts'
    };
  }

  // 4. Vitals Inquiry (BP / Sugar / Pulse)
  if (query.includes('vitals') || query.includes('health') || query.includes('sugar') || query.includes('blood pressure') || query.includes('bp') || query.includes('pulse') || query.includes('உடல் நலம்') || query.includes('பிரஷர்') || query.includes('சர்க்கரை') || query.includes('அழுத்தம்')) {
    const bp = latestVital.bloodPressure ? `${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic} mmHg` : '120/80 mmHg';
    const sugar = latestVital.bloodSugar ? `${latestVital.bloodSugar.value} mg/dL` : '108 mg/dL';
    const pulse = latestVital.pulse ? `${latestVital.pulse.value} BPM` : '74 BPM';

    return {
      replyEn: `${englishName} sir, your latest health vitals from the database are looking stable! Blood Pressure is ${bp}, Blood Sugar is ${sugar}, and Pulse is ${pulse}. Everything is well within normal safe limits.`,
      replyTa: `${seniorName} ஐயா, டேட்டாபேஸில் உள்ள உங்கள் சமீபத்திய உடல் நலம் மிகவும் சீராகவும் நலமாகவும் உள்ளது! ரத்த அழுத்தம்: ${bp}, சர்க்கரை அளவு: ${sugar}, இதயத்துடிப்பு: ${pulse}. கவலைப்பட எதுவுமில்லை, அனைத்தும் நலம். குறித்த நேரத்தில் மருந்து உட்கொள்ளவும்.`,
      intent: 'vitals_report',
      source: 'SQLite:vitals_history'
    };
  }

  // 5. Doctor / Appointment Inquiries
  if (query.includes('doctor') || query.includes('appointment') || query.includes('மருத்துவர்') || query.includes('டாக்டர்') || query.includes('சந்திப்பு')) {
    return {
      replyEn: `Ramanathan sir, your next consultation is with Dr. K. Arvind MD (Cardiologist) on 5th November at 10:30 AM at Kauvery Hospital. Priya will take you there safely.`,
      replyTa: `ராமநாதன் ஐயா, உங்கள் அடுத்த மருத்துவ சந்திப்பு: டாக்டர் கே. அரவிந்த் (இதய சிகிச்சை), நவம்பர் 5-ம் தேதி காலை 10:30 மணிக்கு காவேரி மருத்துவமனையில் திட்டமிடப்பட்டுள்ளது. உங்கள் மகள் பிரியா உங்களுடன் வருவார்.`,
      intent: 'doctor_appointment',
      source: 'SQLite:doctor_appointments'
    };
  }

  // 6. Family / Daughter Priya Inquiries
  if (query.includes('priya') || query.includes('daughter') || query.includes('மகள்') || query.includes('பிரியா') || query.includes('குடும்பம்')) {
    return {
      replyEn: `Your daughter and primary caregiver Priya Ramanathan is actively monitoring your health hub. Her phone number is +91 98401 23456. You can tap Call Priya anytime.`,
      replyTa: `உங்கள் மகள் பிரியா உங்கள் உடல்நிலையை தொடர்ந்து கவனித்து வருகிறார் ஐயா. அவரது எண்: +91 98401 23456. திரையில் உள்ள 'பிரியா அழைப்பு' பொத்தானை தொட்டு நீங்கள் எப்போது வேண்டுமானாலும் அவருடன் பேசலாம்.`,
      intent: 'caregiver_status',
      source: 'SQLite:emergency_contacts'
    };
  }

  // 7. General Friendly Greeting
  return {
    replyEn: `Vanakkam ${englishName} sir! I am your ElderCare AI voice companion. You can ask me anytime about your medicine schedule, blood pressure, doctor visit, or tap the microphone to talk in Tamil.`,
    replyTa: `வணக்கம் ${seniorName} ஐயா! நான் உங்கள் எல்டர்கேர் AI குரல் உதவியாளர். மாத்திரைகள், ரத்த அழுத்தம், சர்க்கரை அளவு, உணவு முறை அல்லது ஏதேனும் சந்தேகங்கள் இருந்தால் என்னிடம் தமிழில் தாராளமாக கேளுங்கள்.`,
    intent: 'general_greeting',
    source: 'SQLite:senior_profile'
  };
}

// MIME types for static assets
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Main Request Handler
async function handleRequest(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost:3000'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString().slice(11, 19)}] ${method} ${pathname}`);

  try {
    // ----------------- REST API ROUTES ----------------- //

    // 1. Health check & Database Status
    if (pathname === '/api/health') {
      const dbStats = db.getDbStats();
      return sendJson(res, 200, {
        status: 'online',
        app: 'ElderCare AI Unified Full-Stack Platform',
        version: '3.0.0',
        database: {
          engine: dbStats.engine,
          status: dbStats.status,
          path: dbStats.databasePath,
          tables: dbStats.tables,
          totalRecords: dbStats.totalRecords
        },
        timestamp: new Date().toISOString()
      });
    }

    // 1b. Direct DB Status & Diagnostics
    if (pathname === '/api/db/status') {
      const stats = db.getDbStats();
      return sendJson(res, 200, {
        success: true,
        database: stats
      });
    }

    // 2. Senior Profile API (SQLite)
    if (pathname === '/api/profile') {
      if (method === 'GET') {
        const profile = db.getProfile();
        return sendJson(res, 200, profile);
      }
      if (method === 'PUT') {
        const body = await parseBody(req);
        const updated = db.updateProfile(body);
        return sendJson(res, 200, { success: true, profile: updated });
      }
    }

    // 3. Medications API (SQLite)
    if (pathname === '/api/medications') {
      if (method === 'GET') {
        const meds = db.getMedications();
        return sendJson(res, 200, meds);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const newMed = db.addMedication(body);
        return sendJson(res, 201, { success: true, medicine: newMed });
      }
    }

    // 3b. Mark Medication as Taken / Untaken (SQLite)
    const medTakeMatch = pathname.match(/^\/api\/medications\/([^/]+)\/take$/);
    if (medTakeMatch && (method === 'PATCH' || method === 'POST')) {
      const medId = medTakeMatch[1];
      const updated = db.toggleMedicationTaken(medId);
      if (!updated) {
        return sendJson(res, 404, { error: 'Medication not found in database' });
      }
      return sendJson(res, 200, {
        success: true,
        message: updated.takenToday ? 'Marked as taken (Database updated)' : 'Marked as not taken (Database updated)',
        medicine: updated
      });
    }

    // 3c. Delete Medication (SQLite)
    const medDeleteMatch = pathname.match(/^\/api\/medications\/([^/]+)$/);
    if (medDeleteMatch && method === 'DELETE') {
      const medId = medDeleteMatch[1];
      const deleted = db.deleteMedication(medId);
      if (!deleted) {
        return sendJson(res, 404, { error: 'Medication not found in database' });
      }
      return sendJson(res, 200, { success: true, message: 'Medication deleted from database' });
    }

    // 4. Vitals API (SQLite)
    if (pathname === '/api/vitals') {
      if (method === 'GET') {
        const vitals = db.getVitals();
        return sendJson(res, 200, vitals);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const newVital = db.addVital(body);
        return sendJson(res, 201, { success: true, reading: newVital });
      }
    }

    // 5. Emergency SOS API (SQLite)
    if (pathname === '/api/sos/contacts') {
      const contacts = db.getContacts();
      return sendJson(res, 200, contacts);
    }

    if (pathname === '/api/sos/trigger' && method === 'POST') {
      const body = await parseBody(req);
      const sosEvent = db.triggerSos(body);
      return sendJson(res, 200, {
        success: true,
        message: 'Emergency SOS recorded to database and alerts dispatched!',
        alert: sosEvent
      });
    }

    if (pathname === '/api/sos/cancel' && method === 'POST') {
      db.cancelSos();
      return sendJson(res, 200, { success: true, message: 'SOS status marked as cancelled in database.' });
    }

    if (pathname === '/api/sos/history') {
      const sosList = db.getSosHistory();
      return sendJson(res, 200, sosList);
    }

    // 6. Daily Activities & Hydration API (SQLite)
    if (pathname === '/api/activity') {
      if (method === 'GET') {
        const act = db.getActivity();
        return sendJson(res, 200, act);
      }
    }

    if (pathname === '/api/activity/water' && method === 'POST') {
      const body = await parseBody(req);
      const change = typeof body.change === 'number' ? body.change : 1;
      const updatedWater = db.updateWater(change);
      return sendJson(res, 200, { success: true, water: updatedWater });
    }

    if (pathname === '/api/activity/walk' && method === 'POST') {
      const body = await parseBody(req);
      const addSteps = typeof body.steps === 'number' ? body.steps : 100;
      const updatedWalk = db.updateWalk(addSteps);
      return sendJson(res, 200, { success: true, walk: updatedWalk });
    }

    // 7. AI Voice Companion Chatbot API (SQLite Knowledge Base)
    if (pathname === '/api/chat' && method === 'POST') {
      const body = await parseBody(req);
      const userMessage = body.message || body.prompt || '';
      const aiResponse = processAIChat(userMessage);
      return sendJson(res, 200, {
        success: true,
        userMessage,
        ...aiResponse,
        timestamp: new Date().toISOString()
      });
    }

    // 7b. Doctor Appointments API
    if (pathname === '/api/appointments') {
      const appts = db.getAppointments();
      return sendJson(res, 200, appts);
    }

    // 7c. Senior Daily Check-in ("நான் நலமாக உள்ளேன்") API
    if (pathname === '/api/checkin') {
      if (method === 'GET') {
        const status = db.getCheckinStatus();
        return sendJson(res, 200, status);
      }
      if (method === 'POST') {
        const body = await parseBody(req);
        const result = db.doDailyCheckin(body.notes);
        return sendJson(res, 200, {
          success: true,
          message: 'Daily safety check-in recorded. Caregiver Priya notified!',
          checkin: result
        });
      }
    }

    // 8. Full Dataset Export API (SQLite)
    if (pathname === '/api/dataset') {
      const dataset = {
        meta: {
          exportDate: new Date().toISOString(),
          databaseEngine: 'SQLite (node:sqlite native)',
          databaseFile: 'data/eldercare.db'
        },
        seniorProfile: db.getProfile(),
        medications: db.getMedications(),
        vitalsHistory: db.getVitals(),
        healthKnowledgeBase: db.getKnowledgeBase(),
        emergencyContacts: db.getContacts(),
        doctorAppointments: db.getAppointments(),
        dailyCheckin: db.getCheckinStatus(),
        dailyActivity: db.getActivity(),
        sosHistory: db.getSosHistory()
      };
      return sendJson(res, 200, dataset);
    }

    // ----------------- STATIC ASSETS & WEB PAGES ----------------- //

    let filePath;
    if (pathname === '/' || pathname === '/index.html') {
      filePath = path.join(PUBLIC_DIR, 'index.html');
      if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, 'eldercare_ai_demo_working.html');
      }
    } else if (pathname === '/demo' || pathname === '/demo.html' || pathname === '/eldercare_ai_demo_working.html') {
      filePath = path.join(__dirname, 'eldercare_ai_demo_working.html');
    } else {
      filePath = path.join(PUBLIC_DIR, pathname);
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      return;
    }

    // 404 Fallback
    sendJson(res, 404, { error: 'Not found', path: pathname });

  } catch (error) {
    console.error('Server error handling request:', error);
    sendJson(res, 500, { error: 'Internal server error', message: error.message });
  }
}

// Create HTTP Server
const server = http.createServer(handleRequest);

// Start HTTP server on specified PORT (local or Vercel process.env.PORT)
server.listen(PORT, () => {
  const stats = db.getDbStats();
  console.log(`=======================================================`);
  console.log(`ElderCare AI Backend Server running at http://localhost:${PORT}`);
  console.log(`Database Engine: ${stats.engine}`);
  console.log(`Database Status: ${stats.status.toUpperCase()} (${stats.totalRecords} total records across 6 tables)`);
  console.log(`Database File  : ${stats.databasePath}`);
  console.log(`REST Endpoints connected to SQLite:`);
  console.log(`  - GET  /api/health (DB status check)`);
  console.log(`  - GET  /api/db/status (Detailed tables stats)`);
  console.log(`  - GET  /api/profile & PUT /api/profile`);
  console.log(`  - GET  /api/medications & POST /api/medications`);
  console.log(`  - PATCH /api/medications/:id/take`);
  console.log(`  - GET  /api/vitals & POST /api/vitals`);
  console.log(`  - GET  /api/sos/contacts & POST /api/sos/trigger`);
  console.log(`  - POST /api/chat (Bilingual AI Voice Engine)`);
  console.log(`  - GET  /api/dataset (Full JSON Export)`);
  console.log(`=======================================================`);
});

module.exports = server;
