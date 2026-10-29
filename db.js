// ElderCare AI – SQLite Database Engine
// Powered by Node.js native node:sqlite (Zero external dependencies!)

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
let DB_FILE = path.join(DATA_DIR, 'eldercare.db');

// In Vercel / Serverless environments, working directory is read-only.
// Use /tmp for writable SQLite database.
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
if (isServerless) {
  const tmpDbFile = path.join('/tmp', 'eldercare.db');
  if (!fs.existsSync(tmpDbFile)) {
    if (fs.existsSync(DB_FILE)) {
      try {
        fs.copyFileSync(DB_FILE, tmpDbFile);
      } catch (e) {
        console.warn('[DB] Could not copy seed DB to /tmp, will initialize fresh:', e.message);
      }
    }
  }
  DB_FILE = tmpDbFile;
} else {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Initialize SQLite Database Connection
const db = new DatabaseSync(DB_FILE);

// Helper to read initial JSON fallback/seed
function readSeedJson(fileName, fallback = []) {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.warn(`[DB] Error loading seed ${fileName}:`, e.message);
    return fallback;
  }
}

// Helper to sync updated data back to JSON files for backup/visibility
function syncToJsonFile(fileName, data) {
  try {
    const filePath = path.join(DATA_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[DB] Error syncing to ${fileName}:`, e.message);
  }
}

// ================= Table Schemas & Initialization ================= //
function initDatabase() {
  console.log(`[DB] Initializing SQLite database at: ${DB_FILE}`);

  // 1. Senior Profile Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS senior_profile (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Medications Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tamil_name TEXT,
      category TEXT,
      dosage TEXT,
      timing TEXT,
      food_instruction TEXT,
      stock INTEGER DEFAULT 10,
      refill_threshold INTEGER DEFAULT 5,
      taken_today INTEGER DEFAULT 0,
      prescribed_by TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 3. Vitals History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vitals_history (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      systolic INTEGER NOT NULL,
      diastolic INTEGER NOT NULL,
      bp_status TEXT,
      blood_sugar INTEGER NOT NULL,
      sugar_type TEXT DEFAULT 'Fasting',
      sugar_status TEXT,
      pulse INTEGER NOT NULL,
      pulse_status TEXT,
      spo2 INTEGER DEFAULT 98,
      temperature REAL DEFAULT 98.4,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // 4. Emergency Contacts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      tamil_name TEXT,
      relation TEXT,
      tamil_relation TEXT,
      phone TEXT NOT NULL,
      badge TEXT,
      is_primary INTEGER DEFAULT 0,
      is_doctor INTEGER DEFAULT 0,
      is_emergency INTEGER DEFAULT 0,
      is_neighbor INTEGER DEFAULT 0,
      is_hospital INTEGER DEFAULT 0,
      photo TEXT
    );
  `);

  // 5. Activity Goals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_goals (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      water_current INTEGER DEFAULT 4,
      water_target INTEGER DEFAULT 8,
      water_unit TEXT DEFAULT 'Glasses',
      water_last_logged TEXT,
      walk_current_steps INTEGER DEFAULT 1200,
      walk_target_steps INTEGER DEFAULT 2000,
      walk_calories INTEGER DEFAULT 85,
      walk_distance_km REAL DEFAULT 0.85,
      walk_percentage INTEGER DEFAULT 60,
      walk_status TEXT DEFAULT 'Good Pace',
      sleep_hours REAL DEFAULT 7.5,
      sleep_quality TEXT DEFAULT 'Restful',
      adherence_rate TEXT DEFAULT '92%',
      updated_at TEXT NOT NULL
    );
  `);

  // 6. SOS History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sos_history (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      triggered_by TEXT NOT NULL,
      location_lat REAL,
      location_lng REAL,
      location_address TEXT,
      notified TEXT,
      whatsapp_url TEXT,
      notes TEXT,
      cancelled_at TEXT
    );
  `);

  // 7. Health Knowledge Base Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS health_knowledge_base (
      id TEXT PRIMARY KEY,
      keywords TEXT NOT NULL,
      english_question TEXT NOT NULL,
      tamil_question TEXT,
      english_answer TEXT NOT NULL,
      tamil_answer TEXT NOT NULL,
      category TEXT DEFAULT 'General'
    );
  `);

  // 8. Doctor Appointments Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctor_appointments (
      id TEXT PRIMARY KEY,
      doctor_name TEXT NOT NULL,
      tamil_doctor_name TEXT,
      specialty TEXT,
      tamil_specialty TEXT,
      hospital TEXT,
      tamil_hospital TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      phone TEXT,
      status TEXT DEFAULT 'Confirmed'
    );
  `);

  // 9. Daily Senior Safety Check-in Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_checkin (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      time TEXT NOT NULL,
      notified_caregiver TEXT,
      notes TEXT
    );
  `);

  // Seed Data if tables are empty
  seedInitialData();
}

// ================= Auto-Seed from JSON files & Elderly Presets ================= //
function seedInitialData() {
  // 1. Profile
  const profileCount = db.prepare('SELECT COUNT(*) as count FROM senior_profile').get().count;
  if (profileCount === 0) {
    const profile = readSeedJson('senior_profile.json', {
      name: 'Ramanathan Subramanian',
      tamilName: 'ராமநாதன் சுப்ரமணியன்'
    });
    db.prepare('INSERT INTO senior_profile (id, data, updated_at) VALUES (?, ?, ?)')
      .run('default', JSON.stringify(profile), new Date().toISOString());
    console.log('[DB Seed] Inserted senior profile');
  }

  // 2. Medications
  const medCount = db.prepare('SELECT COUNT(*) as count FROM medications').get().count;
  if (medCount === 0) {
    const meds = readSeedJson('medications.json', []);
    const insertMed = db.prepare(`
      INSERT INTO medications (
        id, name, tamil_name, category, dosage, timing, food_instruction,
        stock, refill_threshold, taken_today, prescribed_by, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const m of meds) {
      insertMed.run(
        m.id || 'med-' + Date.now(),
        m.name || 'Medicine',
        m.tamilName || m.name,
        m.category || 'General',
        m.dosage || '1 Tablet',
        m.timing || 'Morning 9:00 AM',
        m.foodInstruction || 'After food',
        m.stock ?? 10,
        m.refillThreshold ?? 5,
        m.takenToday ? 1 : 0,
        m.prescribedBy || 'Family Doctor',
        m.notes || '',
        new Date().toISOString()
      );
    }
    console.log(`[DB Seed] Inserted ${meds.length} medications`);
  }

  // 3. Vitals
  const vitalsCount = db.prepare('SELECT COUNT(*) as count FROM vitals_history').get().count;
  if (vitalsCount === 0) {
    const vitals = readSeedJson('vitals_history.json', []);
    const insertVital = db.prepare(`
      INSERT INTO vitals_history (
        id, date, time, systolic, diastolic, bp_status,
        blood_sugar, sugar_type, sugar_status, pulse, pulse_status,
        spo2, temperature, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of vitals) {
      insertVital.run(
        v.id || 'vit-' + Date.now(),
        v.date || new Date().toISOString().slice(0, 10),
        v.time || '08:00 AM',
        v.bloodPressure ? v.bloodPressure.systolic : 120,
        v.bloodPressure ? v.bloodPressure.diastolic : 80,
        v.bloodPressure ? v.bloodPressure.status : 'Normal',
        v.bloodSugar ? v.bloodSugar.value : 110,
        v.bloodSugar ? (v.bloodSugar.type || 'Fasting') : 'Fasting',
        v.bloodSugar ? v.bloodSugar.status : 'Normal',
        v.pulse ? v.pulse.value : 72,
        v.pulse ? v.pulse.status : 'Steady',
        v.spo2 ? v.spo2.value : 98,
        v.temperature ? v.temperature.value : 98.4,
        v.notes || '',
        new Date().toISOString()
      );
    }
    console.log(`[DB Seed] Inserted ${vitals.length} vitals records`);
  }

  // 4. Contacts
  const contactsCount = db.prepare('SELECT COUNT(*) as count FROM emergency_contacts').get().count;
  if (contactsCount === 0) {
    const contacts = readSeedJson('emergency_contacts.json', []);
    const insertContact = db.prepare(`
      INSERT INTO emergency_contacts (
        id, name, tamil_name, relation, tamil_relation,
        phone, badge, is_primary, is_doctor, is_emergency, is_neighbor, is_hospital, photo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const c of contacts) {
      insertContact.run(
        c.id || 'c-' + Date.now(),
        c.name || '',
        c.tamilName || '',
        c.relation || '',
        c.tamilRelation || '',
        c.phone || '',
        c.badge || '',
        c.isPrimary ? 1 : 0,
        c.isDoctor ? 1 : 0,
        c.isEmergency ? 1 : 0,
        c.isNeighbor ? 1 : 0,
        c.isHospital ? 1 : 0,
        c.photo || ''
      );
    }
    console.log(`[DB Seed] Inserted ${contacts.length} emergency contacts`);
  }

  // 5. Activity Goals
  const actCount = db.prepare('SELECT COUNT(*) as count FROM activity_goals').get().count;
  if (actCount === 0) {
    const act = readSeedJson('activity_goals.json', {});
    db.prepare(`
      INSERT INTO activity_goals (
        id, date, water_current, water_target, water_unit, water_last_logged,
        walk_current_steps, walk_target_steps, walk_calories, walk_distance_km,
        walk_percentage, walk_status, sleep_hours, sleep_quality, adherence_rate, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'daily-goal',
      act.date || new Date().toISOString().slice(0, 10),
      act.water?.current ?? 4,
      act.water?.target ?? 8,
      act.water?.unit || 'Glasses (250ml each)',
      act.water?.lastLogged || '11:30 AM',
      act.walk?.currentSteps ?? 1200,
      act.walk?.targetSteps ?? 2000,
      act.walk?.caloriesBurned ?? 85,
      act.walk?.distanceKm ?? 0.85,
      act.walk?.percentage ?? 60,
      act.walk?.status || 'Good Pace',
      act.sleep?.hours ?? 7.5,
      act.sleep?.quality || 'Restful',
      act.medicationAdherence?.adherenceRate || '92%',
      new Date().toISOString()
    );
    console.log('[DB Seed] Inserted daily activity goals');
  }

  // 6. SOS History
  const sosCount = db.prepare('SELECT COUNT(*) as count FROM sos_history').get().count;
  if (sosCount === 0) {
    const sosList = readSeedJson('sos_history.json', []);
    const insertSos = db.prepare(`
      INSERT INTO sos_history (
        id, timestamp, type, status, triggered_by,
        location_lat, location_lng, location_address, notified, whatsapp_url, notes, cancelled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of sosList) {
      insertSos.run(
        s.id || 'sos-' + Date.now(),
        s.timestamp || new Date().toISOString(),
        s.type || 'Test Drill',
        s.status || 'Closed',
        s.triggeredBy || 'Ramanathan',
        s.location?.lat ?? 13.0418,
        s.location?.lng ?? 80.2341,
        s.location?.address || 'T. Nagar, Chennai',
        JSON.stringify(s.notified || []),
        s.whatsappMessageUrl || '',
        s.notes || '',
        null
      );
    }
    console.log(`[DB Seed] Inserted ${sosList.length} SOS events`);
  }

  // 7. Rich Geriatric Health Knowledge Base in Authentic Tamil
  const kbCount = db.prepare('SELECT COUNT(*) as count FROM health_knowledge_base').get().count;
  if (kbCount === 0) {
    const comprehensiveTamilKb = [
      {
        keywords: ["tea", "sugar tablet", "metformin", "breakfast", "சாப்பாடு", "டீ", "மாத்திரை", "சர்க்கரை மாத்திரை", "காபி"],
        englishQuestion: "Can I take my sugar tablet after drinking tea?",
        tamilQuestion: "தேநீர் குடித்த பிறகு சர்க்கரை மாத்திரை போடலாமா?",
        englishAnswer: "Vanakkam Ramanathan sir! Metformin and diabetes tablets should be taken within 15 minutes of having your breakfast. If you only had plain tea, please eat your breakfast (like idli, dosai, or oats) first, and then take the tablet with warm water. Taking diabetes medication on an empty stomach after just tea can cause gastric irritation or low blood sugar.",
        tamilAnswer: "வணக்கம் ராமநாதன் ஐயா! சர்க்கரை மாத்திரையை (மெட்பார்மின்) காலை உணவை சாப்பிட்ட 15 நிமிடத்திற்குள் எடுத்துக்கொள்வது சிறந்தது. வெறும் டீ மட்டும் குடித்திருந்தால் மாத்திரை போட வேண்டாம்; இட்லி அல்லது சிற்றுண்டி சாப்பிட்டுவிட்டு வெதுவெதுப்பான தண்ணீருடன் மாத்திரை போடுங்கள். வெறும் வயிற்றில் போட்டால் நெஞ்செரிச்சல் அல்லது மயக்கம் வரலாம்."
      },
      {
        keywords: ["bp", "blood pressure", "reading", "ரத்த அழுத்தம்", "அளவீடு", "பிரஷர்", "ரத்த பிரஷர்"],
        englishQuestion: "What is my current blood pressure reading?",
        tamilQuestion: "எனது இரத்த அழுத்த அளவு எப்படி உள்ளது?",
        englishAnswer: "Your latest Blood Pressure is 120/80 mmHg, which is considered perfectly normal and healthy for your age. Keep taking your Telmisartan 40mg on time, drink adequate water, and limit excess salt in your food.",
        tamilAnswer: "ஐயா, உங்கள் சமீபத்திய ரத்த அழுத்தம் 120/80 mmHg ஆக உள்ளது. இது உங்கள் வயதிற்கு மிகவும் சிறப்பான மற்றும் இயல்பான அளவு (Normal). வழக்கமான டெல்மிசார்டன் மருந்தை காலையில் தவறாமல் எடுத்துக்கொள்ளுங்கள். உணவில் உப்பை குறைவாக சேர்த்துக்கொள்ளுங்கள்."
      },
      {
        keywords: ["chest pain", "breathless", "pain in arm", "emergency", "நெஞ்சு வலி", "மூச்சு திணறல்", "மாரடைப்பு", "நெஞ்சு பாரம்"],
        englishQuestion: "I have chest discomfort or breathing trouble, what should I do?",
        tamilQuestion: "நெஞ்சு அசௌகரியமாக உள்ளது அல்லது மூச்சு விட கஷ்டமாக இருந்தால் என்ன செய்வது?",
        englishAnswer: "ALERT: If you are experiencing chest pain, tightness, or shortness of breath, please sit down immediately. Press the RED Emergency SOS button on your screen right away to alert Priya and local emergency services. Do not exert yourself or walk alone.",
        tamilAnswer: "எச்சரிக்கை: நெஞ்சு வலியோ அல்லது மூச்சுத் திணறலோ இருந்தால் உடனே அமைதியாக ஓரிடத்தில் அமருங்கள்! உடனே திரையிலுள்ள சிவப்பு நிற 'அவசர உதவி SOS' பொத்தானை அழுத்துங்கள். உங்கள் மகள் பிரியாவிற்கும் அவசர மருத்துவ உதவிக்கும் (108) உடனே தகவல் சென்றுவிடும். பயப்படாமல் அமைதியாக இருங்கள்."
      },
      {
        keywords: ["joint pain", "knee pain", "calcium", "மூட்டு வலி", "கால் வலி", "எலும்பு", "முழங்கால்", "முழங்கால் வலி", "கால்"],
        englishQuestion: "What can I do for knee or joint stiffness?",
        tamilQuestion: "மூட்டு வலி மற்றும் கால் அசௌகரியத்திற்கு என்ன செய்யலாம்?",
        englishAnswer: "Ensure you take your Calcium + Vitamin D3 tablet after lunch as prescribed by Dr. Meenakshi. Do gentle 10-minute chair stretches and avoid standing for prolonged hours. Applying a warm compress can also provide soothing comfort.",
        tamilAnswer: "மதிய உணவுக்குப் பின் டாக்டர் மீனாட்சி பரிந்துரைத்த கால்சியம் + வைட்டமின் டி3 மாத்திரையை தவறாமல் எடுத்துக்கொள்ளுங்கள். நாற்காலியில் அமர்ந்து மெதுவான உடற்பயிற்சி செய்யலாம். வலி உள்ள இடத்தில் வெதுவெதுப்பான ஒத்தடம் கொடுப்பது நல்ல நிம்மதியைத் தரும்."
      },
      {
        keywords: ["water", "hydration", "தண்ணீர்", "தாகம்", "நீர்", "தண்ணி"],
        englishQuestion: "How much water should I drink today?",
        tamilQuestion: "இன்று எவ்வளவு தண்ணீர் குடிக்க வேண்டும்?",
        englishAnswer: "Your daily hydration goal is 8 glasses (approximately 2 Litres). Drinking water at regular intervals keeps your kidneys healthy and prevents dizziness.",
        tamilAnswer: "இன்றைய இலக்கு 8 டம்ளர் (சுமார் 2 லிட்டர்) தண்ணீர். ஒவ்வொரு மணி நேரத்திற்கும் ஒரு டம்ளர் வெதுவெதுப்பான நீர் குடிப்பது தலைசுற்றலை தடுக்கும் மற்றும் புத்துணர்ச்சியாக வைத்திருக்கும்."
      },
      {
        keywords: ["dizzy", "headache", "tired", "மயக்கம்", "தலைசுற்றல்", "சோர்வு", "தலைவலி"],
        englishQuestion: "I am feeling a little dizzy or tired.",
        tamilQuestion: "எனக்கு லேசாக தலைசுற்றல் அல்லது சோர்வாக இருக்கிறது.",
        englishAnswer: "Please sit or lie down safely with your head slightly supported. Sip a glass of water or tender coconut water. We will notify Priya. If dizziness persists, let us check your blood sugar and blood pressure.",
        tamilAnswer: "உடனே பாதுகாப்பாக கட்டிலிலோ நாற்காலியிலோ அமருங்கள் ஐயா. ஒரு டம்ளர் தண்ணீர் அல்லது இளநீர் குடியுங்கள். உடனடியாக உங்கள் கவனிப்பாளர் பிரியாவிற்கு தகவல் அனுப்புகிறேன். மயக்கம் தொடர்ந்தால் சர்க்கரை மற்றும் ரத்த அழுத்த அளவை சரிபார்க்கலாம்."
      },
      {
        keywords: ["sleep", "insomnia", "இரவு தூக்கம்", "தூக்கம் வரவில்லை", "தூங்க", "நிம்மதியான தூக்கம்"],
        englishQuestion: "I am having difficulty sleeping at night.",
        tamilQuestion: "இரவில் தூக்கம் சரியாக வரவில்லை என்றால் என்ன செய்வது?",
        englishAnswer: "Vanakkam sir. Avoid drinking tea or coffee after 5 PM. Drink a cup of warm milk with a pinch of turmeric or nutmeg 30 minutes before bed. Listen to soothing music, and ensure your room is quiet and dimly lit.",
        tamilAnswer: "ஐயா, மாலை 5 மணிக்கு மேல் டீ அல்லது காபி குடிப்பதைத் தவிர்க்கவும். படுப்பதற்கு 30 நிமிடங்களுக்கு முன் ஒரு டம்ளர் வெதுவெதுப்பான பால் அருந்துங்கள். மொபைல் திரையை பார்க்காமல் அமைதியான பக்தி பாடல் அல்லது மெல்லிசை கேளுங்கள், ஆழ்ந்த அமைதியான தூக்கம் கிடைக்கும்."
      },
      {
        keywords: ["diet", "food", "உணவு", "சாப்பாடு", "இட்லி", "கஞ்சி", "என்ன சாப்பிடலாம்", "டயட்"],
        englishQuestion: "What is the recommended diet for seniors today?",
        tamilQuestion: "வயதானோருக்கான சத்தான மற்றும் சுலபமான உணவு முறை என்ன?",
        englishAnswer: "Eat light and easily digestible meals: steamed idli or oats porridge for breakfast, steamed rice with dal and cooked vegetables for lunch, and light tiffin with warm milk for dinner. Drink plenty of warm water throughout the day.",
        tamilAnswer: "எளிதில் செரிமானமாகும் உணவுகள் சிறந்தது: காலையில் ஆவியில் வெந்த இட்லி அல்லது ஓட்ஸ் கஞ்சி, மதியம் பருப்பு மற்றும் கீரை சேர்த்த சாதம், இரவில் ஆப்பம் அல்லது இடியாப்பம். காரம் மற்றும் எண்ணெயை குறைத்து வெதுவெதுப்பான நீர் அருந்துங்கள்."
      },
      {
        keywords: ["doctor", "appointment", "மருத்துவர்", "டாக்டர்", "சந்திப்பு", "செக்கப்"],
        englishQuestion: "When is my next doctor appointment?",
        tamilQuestion: "எனது அடுத்த மருத்துவ சந்திப்பு எப்போது?",
        englishAnswer: "Your next appointment is with Dr. K. Arvind MD (Cardiologist) on 5th November at Kauvery Hospital at 10:30 AM. Priya will accompany you.",
        tamilAnswer: "உங்கள் அடுத்த மருத்துவ சந்திப்பு: டாக்டர் கே. அரவிந்த் (இதய சிகிச்சை நிபுணர்), வருகிற நவம்பர் 5-ம் தேதி காலை 10:30 மணிக்கு காவேரி மருத்துவமனையில் உள்ளது. உங்கள் மகள் பிரியா உங்களுடன் வருவார்."
      },
      {
        keywords: ["walk", "exercise", "நடை", "உடற்பயிற்சி", "நடப்பது"],
        englishQuestion: "How many steps should I walk daily?",
        tamilQuestion: "தினமும் எவ்வளவு நேரம் அல்லது தூரம் நடக்க வேண்டும்?",
        englishAnswer: "A gentle 20 to 30 minute walk (around 2,000 steps) in the morning or evening is ideal. Use your walking stick for balance and wear comfortable non-slip slippers or shoes.",
        tamilAnswer: "தினமும் காலை அல்லது மாலையில் 20 முதல் 30 நிமிடங்கள் மெதுவாக நடப்பது (சுமார் 2,000 அடிகள்) உடலுக்கும் மூட்டுகளுக்கும் மிகவும் நல்லது. நடக்கும்போது பாதுகாப்பு கைத்தடி (Walking stick) மற்றும் சறுக்காத செருப்புகளைப் பயன்படுத்துங்கள்."
      }
    ];

    const insertKb = db.prepare(`
      INSERT INTO health_knowledge_base (
        id, keywords, english_question, tamil_question,
        english_answer, tamil_answer, category
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    let idx = 1;
    for (const k of comprehensiveTamilKb) {
      insertKb.run(
        'kb-' + idx++,
        JSON.stringify(k.keywords || []),
        k.englishQuestion || '',
        k.tamilQuestion || '',
        k.englishAnswer || '',
        k.tamilAnswer || '',
        'Geriatric Health'
      );
    }
    console.log(`[DB Seed] Inserted ${comprehensiveTamilKb.length} Tamil knowledge base topics`);
  }

  // 8. Doctor Appointments Seed
  const apptCount = db.prepare('SELECT COUNT(*) as count FROM doctor_appointments').get().count;
  if (apptCount === 0) {
    const insertAppt = db.prepare(`
      INSERT INTO doctor_appointments (
        id, doctor_name, tamil_doctor_name, specialty, tamil_specialty,
        hospital, tamil_hospital, date, time, phone, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAppt.run(
      'appt-1',
      'Dr. K. Arvind MD (Cardio)',
      'டாக்டர் கே. அரவிந்த் (இதய சிகிச்சை)',
      'Cardiology & Diabetology',
      'இதயவியல் & சர்க்கரை நோய்',
      'Kauvery Hospital, Chennai',
      'காவேரி மருத்துவமனை, சென்னை',
      '2026-11-05',
      '10:30 AM',
      '+91 94440 98765',
      'Confirmed'
    );
    insertAppt.run(
      'appt-2',
      'Dr. S. Meenakshi (Ortho)',
      'டாக்டர் எஸ். மீனாட்சி (மூட்டு & எலும்பு)',
      'Orthopedics & Joint Care',
      'எலும்பு மற்றும் மூட்டு நலம்',
      'Apollo Clinic, T. Nagar',
      'அப்பல்லோ கிளினிக், தி. நகர்',
      '2026-11-18',
      '04:00 PM',
      '+91 94441 12345',
      'Scheduled'
    );
    console.log('[DB Seed] Inserted doctor appointments');
  }

  // 9. Daily Check-in Seed
  const checkinCount = db.prepare('SELECT COUNT(*) as count FROM daily_checkin').get().count;
  if (checkinCount === 0) {
    db.prepare(`
      INSERT INTO daily_checkin (
        id, date, status, time, notified_caregiver, notes
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      'chk-' + Date.now(),
      new Date().toISOString().slice(0, 10),
      'Safe & Well (நலமாக உள்ளேன்)',
      '08:30 AM',
      'Priya Ramanathan notified via SMS',
      'Morning wellness check-in completed'
    );
    console.log('[DB Seed] Inserted initial daily check-in');
  }
}

// ================= CRUD Operations ================= //

// --- Profile ---
function getProfile() {
  const row = db.prepare('SELECT data FROM senior_profile WHERE id = ?').get('default');
  if (row) {
    try { return JSON.parse(row.data); } catch(e) {}
  }
  return readSeedJson('senior_profile.json', {});
}

function updateProfile(patch) {
  const current = getProfile();
  const updated = { ...current, ...patch };
  db.prepare('UPDATE senior_profile SET data = ?, updated_at = ? WHERE id = ?')
    .run(JSON.stringify(updated), new Date().toISOString(), 'default');
  syncToJsonFile('senior_profile.json', updated);
  return updated;
}

// --- Medications ---
function getMedications() {
  const rows = db.prepare('SELECT * FROM medications ORDER BY created_at ASC').all();
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    tamilName: r.tamil_name,
    category: r.category,
    dosage: r.dosage,
    timing: r.timing,
    foodInstruction: r.food_instruction,
    stock: r.stock,
    refillThreshold: r.refill_threshold,
    takenToday: Boolean(r.taken_today),
    prescribedBy: r.prescribed_by,
    notes: r.notes
  }));
}

function addMedication(med) {
  const id = med.id || ('med-' + Date.now());
  const name = med.name || 'New Medicine';
  const tamilName = med.tamilName || med.name || 'புதிய மருந்து';
  const category = med.category || 'General Care';
  const dosage = med.dosage || '1 Tablet';
  const timing = med.timing || 'Morning 9:00 AM';
  const foodInstruction = med.foodInstruction || 'After food';
  const stock = Number(med.stock) || 10;
  const refillThreshold = Number(med.refillThreshold) || 5;
  const takenToday = med.takenToday ? 1 : 0;
  const prescribedBy = med.prescribedBy || 'Family Doctor';
  const notes = med.notes || '';
  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO medications (
      id, name, tamil_name, category, dosage, timing, food_instruction,
      stock, refill_threshold, taken_today, prescribed_by, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, name, tamilName, category, dosage, timing, foodInstruction,
    stock, refillThreshold, takenToday, prescribedBy, notes, createdAt
  );

  const newMed = {
    id, name, tamilName, category, dosage, timing,
    foodInstruction, stock, refillThreshold,
    takenToday: Boolean(takenToday), prescribedBy, notes
  };

  syncToJsonFile('medications.json', getMedications());
  return newMed;
}

function toggleMedicationTaken(medId) {
  const row = db.prepare('SELECT * FROM medications WHERE id = ?').get(medId);
  if (!row) return null;

  const newTaken = row.taken_today ? 0 : 1;
  let newStock = row.stock;
  if (newTaken === 1 && newStock > 0) newStock -= 1;
  else if (newTaken === 0) newStock += 1;

  db.prepare('UPDATE medications SET taken_today = ?, stock = ? WHERE id = ?')
    .run(newTaken, newStock, medId);

  const updatedMed = {
    id: row.id,
    name: row.name,
    tamilName: row.tamil_name,
    category: row.category,
    dosage: row.dosage,
    timing: row.timing,
    foodInstruction: row.food_instruction,
    stock: newStock,
    refillThreshold: row.refill_threshold,
    takenToday: Boolean(newTaken),
    prescribedBy: row.prescribed_by,
    notes: row.notes
  };

  syncToJsonFile('medications.json', getMedications());
  return updatedMed;
}

function deleteMedication(medId) {
  const res = db.prepare('DELETE FROM medications WHERE id = ?').run(medId);
  syncToJsonFile('medications.json', getMedications());
  return res.changes > 0;
}

// --- Vitals ---
function getVitals() {
  const rows = db.prepare('SELECT * FROM vitals_history ORDER BY rowid DESC').all();
  return rows.map(r => ({
    id: r.id,
    date: r.date,
    time: r.time,
    bloodPressure: {
      systolic: r.systolic,
      diastolic: r.diastolic,
      unit: 'mmHg',
      status: r.bp_status
    },
    bloodSugar: {
      value: r.blood_sugar,
      type: r.sugar_type,
      unit: 'mg/dL',
      status: r.sugar_status
    },
    pulse: {
      value: r.pulse,
      unit: 'BPM',
      status: r.pulse_status
    },
    spo2: {
      value: r.spo2,
      unit: '%',
      status: 'Optimal'
    },
    temperature: {
      value: r.temperature,
      unit: '°F',
      status: 'Normal'
    },
    notes: r.notes
  }));
}

function addVital(v) {
  const id = v.id || ('vit-' + Date.now());
  const date = v.date || new Date().toISOString().slice(0, 10);
  const time = v.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const systolic = Number(v.systolic) || 120;
  const diastolic = Number(v.diastolic) || 80;
  const sugar = Number(v.sugar) || 110;
  const sugarType = v.sugarType || 'Fasting';
  const pulse = Number(v.pulse) || 72;
  const spo2 = Number(v.spo2) || 98;
  const temp = Number(v.temperature) || 98.4;
  const notes = v.notes || 'Recorded via ElderCare AI Platform';

  let bpStatus = 'Normal (சீரானது)';
  if (systolic > 140 || diastolic > 90) bpStatus = 'High / கவனம் தேவை';
  else if (systolic < 95 || diastolic < 60) bpStatus = 'Low / குறைவானது';

  let sugarStatus = 'Normal';
  if (sugar > 140) sugarStatus = 'Elevated / அதிக அளவு';
  else if (sugar < 70) sugarStatus = 'Low / குறைவாக உள்ளது';

  let pulseStatus = 'Steady (அமைதி)';
  if (pulse > 100) pulseStatus = 'Rapid / வேகம்';
  else if (pulse < 55) pulseStatus = 'Slow / மெதுவானது';

  db.prepare(`
    INSERT INTO vitals_history (
      id, date, time, systolic, diastolic, bp_status,
      blood_sugar, sugar_type, sugar_status, pulse, pulse_status,
      spo2, temperature, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, date, time, systolic, diastolic, bpStatus,
    sugar, sugarType, sugarStatus, pulse, pulseStatus,
    spo2, temp, notes, new Date().toISOString()
  );

  const reading = {
    id,
    date,
    time,
    bloodPressure: { systolic, diastolic, unit: 'mmHg', status: bpStatus },
    bloodSugar: { value: sugar, type: sugarType, unit: 'mg/dL', status: sugarStatus },
    pulse: { value: pulse, unit: 'BPM', status: pulseStatus },
    spo2: { value: spo2, unit: '%', status: 'Optimal' },
    temperature: { value: temp, unit: '°F', status: 'Normal' },
    notes
  };

  syncToJsonFile('vitals_history.json', getVitals());
  return reading;
}

// --- Emergency Contacts ---
function getContacts() {
  const rows = db.prepare('SELECT * FROM emergency_contacts ORDER BY is_primary DESC, rowid ASC').all();
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    tamilName: r.tamil_name,
    relation: r.relation,
    tamilRelation: r.tamil_relation,
    phone: r.phone,
    badge: r.badge,
    isPrimary: Boolean(r.is_primary),
    isDoctor: Boolean(r.is_doctor),
    isEmergency: Boolean(r.is_emergency),
    isNeighbor: Boolean(r.is_neighbor),
    isHospital: Boolean(r.is_hospital),
    photo: r.photo
  }));
}

// --- Appointments ---
function getAppointments() {
  const rows = db.prepare('SELECT * FROM doctor_appointments ORDER BY date ASC').all();
  return rows.map(r => ({
    id: r.id,
    doctorName: r.doctor_name,
    tamilDoctorName: r.tamil_doctor_name,
    specialty: r.specialty,
    tamilSpecialty: r.tamil_specialty,
    hospital: r.hospital,
    tamilHospital: r.tamil_hospital,
    date: r.date,
    time: r.time,
    phone: r.phone,
    status: r.status
  }));
}

// --- Daily Check-in ---
function getCheckinStatus() {
  const today = new Date().toISOString().slice(0, 10);
  const row = db.prepare('SELECT * FROM daily_checkin WHERE date = ? ORDER BY rowid DESC LIMIT 1').get(today);
  if (row) {
    return { checkedIn: true, ...row };
  }
  return { checkedIn: false, date: today };
}

function doDailyCheckin(notes = 'Senior checked in safe') {
  const today = new Date().toISOString().slice(0, 10);
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  const id = 'chk-' + Date.now();
  db.prepare(`
    INSERT INTO daily_checkin (id, date, status, time, notified_caregiver, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, today, 'Safe & Well (நலமாக உள்ளேன்)', time, 'Priya Ramanathan notified', notes);
  return { success: true, date: today, time };
}

// --- Activity Goals ---
function getActivity() {
  const r = db.prepare('SELECT * FROM activity_goals WHERE id = ?').get('daily-goal');
  if (!r) return readSeedJson('activity_goals.json', {});

  const currentMeds = getMedications();
  const takenMeds = currentMeds.filter(m => m.takenToday).length;

  return {
    date: r.date,
    water: {
      current: r.water_current,
      target: r.water_target,
      unit: r.water_unit,
      lastLogged: r.water_last_logged
    },
    walk: {
      currentSteps: r.walk_current_steps,
      targetSteps: r.walk_target_steps,
      caloriesBurned: r.walk_calories,
      distanceKm: r.walk_distance_km,
      percentage: r.walk_percentage,
      status: r.walk_status
    },
    sleep: {
      hours: r.sleep_hours,
      quality: r.sleep_quality
    },
    medicationAdherence: {
      totalDosesToday: currentMeds.length,
      takenCount: takenMeds,
      adherenceRate: r.adherence_rate
    }
  };
}

function updateWater(change = 1) {
  const current = getActivity();
  const newCurrent = Math.max(0, Math.min(current.water.target + 4, current.water.current + change));
  const lastLogged = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  db.prepare(`
    UPDATE activity_goals
    SET water_current = ?, water_last_logged = ?, updated_at = ?
    WHERE id = ?
  `).run(newCurrent, lastLogged, new Date().toISOString(), 'daily-goal');

  const updated = getActivity();
  syncToJsonFile('activity_goals.json', updated);
  return updated.water;
}

function updateWalk(steps = 100) {
  const current = getActivity();
  const newSteps = Math.min(10000, current.walk.currentSteps + steps);
  const percentage = Math.round((newSteps / current.walk.targetSteps) * 100);
  const distanceKm = +(newSteps * 0.0007).toFixed(2);
  const caloriesBurned = Math.round(newSteps * 0.04);

  db.prepare(`
    UPDATE activity_goals
    SET walk_current_steps = ?, walk_percentage = ?, walk_distance_km = ?, walk_calories = ?, updated_at = ?
    WHERE id = ?
  `).run(newSteps, percentage, distanceKm, caloriesBurned, new Date().toISOString(), 'daily-goal');

  const updated = getActivity();
  syncToJsonFile('activity_goals.json', updated);
  return updated.walk;
}

// --- SOS History & Trigger ---
function getSosHistory() {
  const rows = db.prepare('SELECT * FROM sos_history ORDER BY rowid DESC').all();
  return rows.map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    type: r.type,
    status: r.status,
    triggeredBy: r.triggered_by,
    location: {
      lat: r.location_lat,
      lng: r.location_lng,
      address: r.location_address
    },
    notified: r.notified ? JSON.parse(r.notified) : [],
    whatsappMessageUrl: r.whatsapp_url,
    notes: r.notes,
    cancelledAt: r.cancelled_at
  }));
}

function triggerSos(body = {}) {
  const contacts = getContacts();
  const primary = contacts.find(c => c.isPrimary) || contacts[0] || { name: 'Priya', phone: '+91 98401 23456' };
  const id = 'sos-' + Date.now();
  const timestamp = new Date().toISOString();
  const type = body.type || 'Manual 1-Tap SOS Alert';
  const status = 'Active Alert Dispatched';
  const triggeredBy = 'Ramanathan Subramanian';
  const lat = 13.0418;
  const lng = 80.2341;
  const address = 'T. Nagar, Chennai, Tamil Nadu - 600017 (Simulated GPS)';
  const notified = [
    `${primary.name} (${primary.phone}) - SMS & Phone Alert Sent`,
    'Emergency Ambulance 108 - Alert Queued'
  ];
  const msg = encodeURIComponent(`EMERGENCY SOS ALERT: Ramanathan sir has triggered emergency assistance from ElderCare AI. Current Location: T. Nagar, Chennai. Please call immediately!`);
  const whatsappUrl = `https://wa.me/919840123456?text=${msg}`;

  db.prepare(`
    INSERT INTO sos_history (
      id, timestamp, type, status, triggered_by,
      location_lat, location_lng, location_address, notified, whatsapp_url, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, timestamp, type, status, triggeredBy,
    lat, lng, address, JSON.stringify(notified), whatsappUrl, 'Emergency button pressed'
  );

  const event = {
    id,
    timestamp,
    type,
    status,
    triggeredBy,
    location: { lat, lng, address },
    notified,
    whatsappMessageUrl: whatsappUrl
  };

  syncToJsonFile('sos_history.json', getSosHistory());
  return event;
}

function cancelSos() {
  const active = db.prepare("SELECT * FROM sos_history WHERE status LIKE '%Active%' ORDER BY rowid DESC LIMIT 1").get();
  if (active) {
    const cancelledAt = new Date().toISOString();
    db.prepare("UPDATE sos_history SET status = 'Cancelled by Senior (False Alarm / Drill)', cancelled_at = ? WHERE id = ?")
      .run(cancelledAt, active.id);
  }
  syncToJsonFile('sos_history.json', getSosHistory());
  return true;
}

// --- Knowledge Base ---
function getKnowledgeBase() {
  const rows = db.prepare('SELECT * FROM health_knowledge_base').all();
  return rows.map(r => ({
    id: r.id,
    keywords: r.keywords ? JSON.parse(r.keywords) : [],
    englishQuestion: r.english_question,
    tamilQuestion: r.tamil_question,
    englishAnswer: r.english_answer,
    tamilAnswer: r.tamil_answer,
    category: r.category
  }));
}

// --- Database Status Summary ---
function getDbStats() {
  const profileCount = db.prepare('SELECT COUNT(*) as c FROM senior_profile').get().c;
  const medCount = db.prepare('SELECT COUNT(*) as c FROM medications').get().c;
  const vitalsCount = db.prepare('SELECT COUNT(*) as c FROM vitals_history').get().c;
  const contactCount = db.prepare('SELECT COUNT(*) as c FROM emergency_contacts').get().c;
  const sosCount = db.prepare('SELECT COUNT(*) as c FROM sos_history').get().c;
  const kbCount = db.prepare('SELECT COUNT(*) as c FROM health_knowledge_base').get().c;
  const apptCount = db.prepare('SELECT COUNT(*) as c FROM doctor_appointments').get().c;

  return {
    engine: 'SQLite (node:sqlite native)',
    status: 'connected',
    databasePath: DB_FILE,
    tables: {
      senior_profile: profileCount,
      medications: medCount,
      vitals_history: vitalsCount,
      emergency_contacts: contactCount,
      sos_history: sosCount,
      health_knowledge_base: kbCount,
      doctor_appointments: apptCount
    },
    totalRecords: profileCount + medCount + vitalsCount + contactCount + sosCount + kbCount + apptCount,
    timestamp: new Date().toISOString()
  };
}

// Initialize on module load
initDatabase();

module.exports = {
  db,
  getProfile,
  updateProfile,
  getMedications,
  addMedication,
  toggleMedicationTaken,
  deleteMedication,
  getVitals,
  addVital,
  getContacts,
  getAppointments,
  getCheckinStatus,
  doDailyCheckin,
  getActivity,
  updateWater,
  updateWalk,
  getSosHistory,
  triggerSos,
  cancelSos,
  getKnowledgeBase,
  getDbStats
};
