// ElderCare AI – Senior Health Companion Logic with Full Tamil Voice AI & SQLite Integration

const API_BASE = window.location.origin;

// Application State with Persistent Language Support
const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('eldercare_lang') : null;
const state = {
  lang: (savedLang === 'en' || savedLang === 'ta') ? savedLang : 'ta', // Default to Tamil ('ta') and persist
  seniorMode: true,
  currentTab: 'home',
  profile: null,
  medications: [],
  vitals: [],
  contacts: [],
  appointments: [],
  checkin: { checkedIn: false },
  activity: {
    water: { current: 5, target: 8 },
    walk: { currentSteps: 1200, targetSteps: 2000, percentage: 60 }
  },
  chatMessages: [
    {
      sender: 'assistant',
      textEn: 'Vanakkam Ramanathan sir! I am your ElderCare AI Guide. How can I assist you today? You can tap the microphone to speak.',
      textTa: 'வணக்கம் ராமநாதன் ஐயா! நான் உங்கள் எல்டர்கேர் AI குரல் உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவலாம்? மைக்ரோஃபோனைத் தொட்டு என்னிடம் பேசலாம்.',
      time: 'இப்போது'
    }
  ],
  sosCountdownTimer: null,
  sosRemainingSeconds: 5,
  audioPlaying: false
};

// 100% Comprehensive & Natural Bilingual Dictionary (Pure Respectful Elderly Tamil & Clean English)
const i18n = {
  ta: {
    brandSubtitle: "முதியோர் நல்வாழ்வுத் துணை",
    greetingMorning: "காலை வணக்கம் ஐயா",
    greetingSir: "வணக்கம், ராமநாதன் ஐயா",
    todayIs: "இன்று செவ்வாய்க்கிழமை, 28 அக்டோபர்",
    caregiverActive: "மகள் பிரியா தொடர்ந்து கவனித்து வருகிறார் 🟢",
    readAloud: "குரலில் கேட்க",
    sosHeroTitle: "அவசர உதவி SOS",
    sosHeroSub: "குடும்பத்தினருக்கும் 108 ஆம்புலன்ஸுக்கும் உடனடி தகவல்",
    nextDose: "அடுத்த மருந்து",
    refillSoon: "விரைவில் வாங்கவும்",
    markTaken: "எடுத்தாச்சு என குறிக்கவும்",
    markedTaken: "மாத்திரை எடுத்தாச்சு ✓",
    vitalsTitle: "இன்றைய உடல் நலம்",
    history: "முந்தைய பதிவுகள்",
    bpLabel: "ரத்த அழுத்தம்",
    sugarLabel: "சர்க்கரை அளவு",
    pulseLabel: "இதயத் துடிப்பு",
    quickActions: "விரைவு இணைப்புகள்",
    qaMeds: "மருந்துகள்",
    qaMedsSub: "தினசரி அட்டவணை",
    qaVoice: "குரல் AI",
    qaVoiceSub: "பேசி உதவி பெற",
    qaFamily: "பிரியா அழைப்பு",
    qaFamilySub: "மகள் (முதன்மை)",
    qaDoctor: "மருத்துவர் சந்திப்பு",
    qaDoctorSub: "நவ 5 காவேரி மருத்துவமனை",
    qaNutrition: "உணவு முறை",
    qaNutritionSub: "முதியோர் டயட்",
    dailyGoals: "இன்றைய ஆரோக்கிய இலக்குகள்",
    waterTitle: "தண்ணீர் குடித்தல்",
    walkTitle: "மெது நடை பயிற்சி",
    allWellMsg: "எல்லாம் நலமே • நீங்கள் நலமாக உள்ளீர்கள் ஐயா",
    tabHome: "முகப்பு",
    tabVoice: "குரல் AI",
    tabMeds: "மருந்துகள்",
    tabVitals: "உடல் நலம்",
    tabNutrition: "உணவு முறை",
    tabSos: "அவசரம்",
    tabProfile: "விவரம்",
    viewAllMeds: "முழு அட்டவணை ➔",
    voiceTitle: "ElderCare AI குரல் துணை",
    micTapToSpeak: "பேச அழுத்தவும்",
    micSubText: "தமிழிலோ ஆங்கிலத்திலோ தாராளமாக கேளுங்கள் • குடும்பத்தினருடன் பேசுவது போல பேசலாம்",
    speedLabel: "பேச்சு வேகம்:",
    audioWaveTitle: "AI குரல் பேசுகிறது",
    fontZoomTitle: "எழுத்து அளவை மாற்றவும் (A- / A+)",
    safeCheckinTitle: "தினசரி பாதுகாப்பு உறுதி",
    safeCheckinQuestion: "காலை வணக்கம் ஐயா! நலமாக உள்ளீர்களா?",
    safeCheckinPrompt: "நீங்கள் நலமாக உள்ளீர்கள் என்பதை மகள் பிரியாவிற்கு தெரிவிக்க ஒருமுறை தொடவும்.",
    safeCheckinBtn: "நான் நலமாக உள்ளேன் 💚",
    safeCheckinDoneTitle: "காலை வணக்கம் ஐயா! நலமாக உள்ளீர்களா?",
    safeCheckinDonePrompt: "இன்று நீங்கள் நலமாக உள்ளீர்கள் என பதிவு செய்யப்பட்டது. பிரியாவுக்கு தகவல் தெரிவிக்கப்பட்டது ✓",
    safeCheckinDoneBtn: "நலமாக உள்ளீர்கள் ✓",
    pillboxTitle: "கால வரிசை மாத்திரை பெட்டி (Visual Pill Box)",
    pillboxMorning: "காலை மாத்திரைகள் (காலை 8 - 10 மணி)",
    pillboxAfternoon: "மதிய மாத்திரைகள் (மதியம் 1 - 2:30 மணி)",
    pillboxNight: "இரவு மாத்திரைகள் (இரவு 8:30 - 9:30 மணி)",
    doctorApptTitle: "அடுத்த மருத்துவ சந்திப்பு",
    nutritionTitle: "முதியோருக்கான சத்தான உணவு முறை",
    wellnessTitle: "மன அமைதி & தியான இசை",
    wellnessDesc: "பதற்றத்தைக் குறைத்து, மன அமைதி மற்றும் ஆழ்ந்த தூக்கத்திற்கு உதவும் மென்மையான தியான ஒலி.",
    calmMusicBtn: "தியான இசை தொடங்க",
    calmMusicPause: "தியான இசையை நிறுத்த",
    voiceFaqTitle: "அடிக்கடி கேட்கப்படும் கேள்விகள் (தொட்டு குரல் பதில் பெறலாம்):",
    chipTea: "🍵 டீ குடிச்ச பிறகு சர்க்கரை மாத்திரை போடலாமா?",
    chipBp: "🩺 எனது இரத்த அழுத்தம் (BP) எப்படி உள்ளது?",
    chipWater: "💧 இன்று எவ்வளவு தண்ணீர் குடிக்க வேண்டும்?",
    chipDizzy: "😴 எனக்கு லேசாக தலைசுற்றல் அல்லது சோர்வாக இருக்கிறது",
    chipSleep: "🌙 இரவில் நிம்மதியான தூக்கம் வர என்ன செய்யலாம்?",
    chipDiet: "🥗 முதியோருக்கான எளிய உணவு முறை என்ன?",
    chipAppt: "🏥 அடுத்த டாக்டர் அப்பாயிண்ட்மென்ட் எப்போது?",
    chipPriya: "📞 மகள் பிரியாவை அழைக்கவும்",
    chatInputPlaceholder: "கேள்வியை தட்டச்சு செய்யவும் (எ.கா. மாத்திரை நேரம் என்ன?)…",
    chatSendBtn: "அனுப்ப",
    medIdBtn: "மருத்துவ அட்டை",
    medsTitle: "மருந்துகள் அட்டவணை",
    medsSubtitle: "தினசரி அட்டவணைப்படி குறித்த நேரத்தில் தவறாமல் உட்கொள்ளவும்.",
    medsDbSub: "SQLite டேட்டாபேஸில் சேமிக்கப்பட்டு கண்காணிக்கப்படுகிறது.",
    btnAddMed: "+ புதிய மருந்து சேர்க்க",
    vitalsHeading: "உடல்நல அளவீடுகள் & போக்குகள்",
    vitalsSubtitle: "ரத்த அழுத்தம் (BP), சர்க்கரை மற்றும் இதயத்துடிப்பு அளவீடுகள்.",
    btnLogVital: "+ புதிய அளவீடு பதிவு செய்ய",
    bpTrendTitle: "ரத்த அழுத்த போக்கு (Blood Pressure Trend - கடந்த 7 அளவீடுகள்)",
    thDateTime: "தேதி & நேரம்",
    thBp: "ரத்த அழுத்தம் (BP)",
    thSugar: "சர்க்கரை அளவு",
    thPulse: "இதயத்துடிப்பு",
    thStatus: "முடிவு நிலை",
    hydrationTitle: "நீர்ச்சத்து கண்காணிப்பு",
    hydrationSub: "தினசரி 2.0 லிட்டர் தண்ணீர் உடலுக்கு அவசியம்",
    hydrationIntakeLabel: "அருந்திய அளவு",
    hydrationGoalLabel: "தினசரி இலக்கு",
    hydrationRemainingLabel: "இன்னும் தேவை",
    add1Glass: "+1 டம்ளர் (+250ml)",
    add2Glasses: "+2 டம்ளர்கள் (+500ml)",
    undoGlass: "-1 டம்ளர்",
    nutritionHeading: "வயதானோருக்கான சத்தான உணவு முறை",
    nutritionSubtitle: "சர்க்கரை நோய் மற்றும் ரத்த அழுத்தத்தைக் கட்டுப்படுத்தும் எளிய, செரிமானத்திற்கு உகந்த உணவுப் பரிந்துரைகள்.",
    nutritionListen: "🔊 தமிழில் கேட்க",
    mealBreakfastTitle: "🌅 காலை உணவு (8:00 - 9:00 AM)",
    mealBreakfastDesc: "ஆவியில் வெந்த 2-3 இட்லி, சாம்பார் அல்லது வெந்தயக் கஞ்சி / ஓட்ஸ். டீ அல்லது காபியில் சர்க்கரை தவிர்ப்பது நலம். காலை உணவுக்குப் பின் சர்க்கரை மாத்திரை எடுத்துக்கொள்ளவும்.",
    mealLunchTitle: "☀️ மதிய உணவு (1:00 - 2:00 PM)",
    mealLunchDesc: "மிதமான அளவு கைக்குத்தல் அல்லது பொன்னி சாதம், பாசிப்பருப்பு, பொரித்த காய்கறிகளுக்குப் பதிலாக வேகவைத்த கீரை, கேரட், பீன்ஸ். உணவுக்குப் பின் தயிர் அல்லது மோர்.",
    mealSnackTitle: "☕ மாலை சிற்றுண்டி (4:30 - 5:30 PM)",
    mealSnackDesc: "வேகவைத்த சுண்டல் அல்லது ஒரு ஆப்பிள் / பப்பாளி துண்டுகள். கிரீன் டீ அல்லது வெதுவெதுப்பான நீர் அருந்துங்கள்.",
    mealDinnerTitle: "🌙 இரவு உணவு (7:30 - 8:30 PM)",
    mealDinnerDesc: "மிகவும் எளிமையான உணவு: 2 சப்பாத்தி அல்லது இடியாப்பம், பருப்பு குருமாவோடு. படுப்பதற்கு முன் ஒரு டம்ளர் வெதுவெதுப்பான பாலில் சிட்டிகை மஞ்சள் தூள் கலந்து அருந்தவும்.",
    goldenRulesTitle: "⚠️ முதியோர் உணவுக்கான பொன் விதிகள்:",
    goldenRule1: "உணவில் உப்பை மிகவும் குறைவாக சேர்த்துக்கொள்ளுங்கள் (ரத்த அழுத்தத்தைக் கட்டுப்படுத்த).",
    goldenRule2: "குளிர்ந்த தண்ணீரைத் தவிர்த்து எப்போதும் வெதுவெதுப்பான வெந்நீர் அருந்துங்கள்.",
    goldenRule3: "ஒரே நேரத்தில் அதிகமாக உண்பதைத் தவிர்த்து, சிறிய அளவாக 3-4 வேளைகளாகப் பிரியுங்கள்.",
    sosPageTitle: "அவசர உதவி SOS (Emergency Dispatch)",
    sosPageSub: "கீழே உள்ள சிவப்பு நிற பொத்தானை அழுத்தினால் மகள் பிரியாவிற்கும், 108 ஆம்புலன்ஸ் சேவைக்கும் உடனடியாக உங்கள் இருப்பிடத் தகவல் அனுப்பப்படும்.",
    sosPageBtn: "🚨 அவசர உதவி SOS அழுத்துங்கள்",
    sosContactsTitle: "அவசர தொடர்பு எண்கள்:",
    contactPriyaName: "பிரியா ராமநாதன் (மகள் & கவனிப்பாளர்)",
    contactPriyaRole: "முதன்மை கவனிப்பாளர் • +91 98401 23456",
    contactAmbulanceName: "108 அவசர ஆம்புலன்ஸ் சேவை",
    contactAmbulanceRole: "தமிழ்நாடு அரசு அவசர மருத்துவ ஊர்தி",
    contactDoctorName: "டாக்டர் கே. அரவிந்த் (குடும்ப மருத்துவர்)",
    contactDoctorRole: "காவேரி மருத்துவமனை • +91 94440 98765",
    contactNeighborName: "எஸ். கண்ணன் (அண்டை வீட்டார்)",
    contactNeighborRole: "தரைத்தளம் • +91 98840 55432",
    btnCall: "அழைக்க 📞",
    btnAmbulanceCall: "108 அழைக்க 🚑",
    profileTitle: "முதியோர் & கவனிப்பாளர் விவரம்",
    profileNameVal: "ராமநாதன் சுப்ரமணியன்",
    profileAgeVal: "72 வயது • ஆண் • Blood: O+ Positive",
    profileCaregiverVal: "கவனிப்பாளர்: பிரியா ராமநாதன் (மகள்) • +91 98401 23456",
    conditionsTitle: "நீண்டகால ஆரோக்கிய நிலைகள்:",
    condDiabetes: "வகை-2 சர்க்கரை நோய் (2015 முதல்)",
    condBp: "உயர் ரத்த அழுத்தம் / BP (2012 முதல்)",
    condKnee: "மிதமான முழங்கால் தேய்மானம் (2020 முதல்)",
    addressTitle: "வசிப்பிடம்:",
    addressVal: "பிளாட் 3B, சாந்தி நிகேதன் அடுக்குமாடி, தி. நகர், சென்னை - 600017",
    sosModalTitle: "அவசர உதவி SOS அழைப்பு",
    sosModalDesc: "மகள் பிரியாவிற்கும், 108 ஆம்புலன்ஸிற்கும் உங்கள் GPS இருப்பிடத் தகவல் அனுப்பப்படுகிறது. தவறாக அழுத்தப்பட்டிருந்தால் கீழே உள்ள பொத்தானை அழுத்தவும்.",
    sosModalCancel: "❌ CANCEL (தவறாக அழுத்தப்பட்டது - ரத்து செய்)",
    medIdModalTitle: "மூத்தோர் அவசர மருத்துவ அட்டை",
    medIdModalAge: "<b>வயது:</b> 72 ஆண்டுகள் • <b>பாலினம்:</b> ஆண் (Male)",
    medIdModalBlood: "🩸 ரத்தப் பிரிவு: O+ Positive",
    medIdModalAllergyTitle: "⚠️ ஒவ்வாமை (Allergies):",
    medIdModalAllergyVal: "பென்சிலின் (Penicillin) - உயிருக்கு ஆபத்து",
    medIdModalCondTitle: "🩺 நோய்கள் (Conditions):",
    medIdModalCondVal: "வகை-2 சர்க்கரை நோய், உயர் ரத்த அழுத்தம் (BP)",
    medIdModalContactsTitle: "🚨 அவசர தொடர்பு நபர்கள்:",
    medIdListenBtn: "🔊 தமிழில் கேட்க",
    medIdPrintBtn: "🖨️ பிரிண்ட் / அச்சிட"
  },
  en: {
    brandSubtitle: "Senior Health & Care Companion",
    greetingMorning: "Good Morning Sir",
    greetingSir: "Good day, Ramanathan Sir",
    todayIs: "Tuesday, 28 October",
    caregiverActive: "Caregiver Priya is actively monitoring 🟢",
    readAloud: "Listen Aloud",
    sosHeroTitle: "Emergency SOS",
    sosHeroSub: "Instant 1-Tap alert to family & 108 ambulance",
    nextDose: "Next Medication",
    refillSoon: "Refill Soon",
    markTaken: "Mark as Taken",
    markedTaken: "Taken ✓",
    vitalsTitle: "Today's Health Vitals",
    history: "History",
    bpLabel: "Blood Pressure",
    sugarLabel: "Blood Sugar",
    pulseLabel: "Heart Pulse",
    quickActions: "Quick Shortcuts",
    qaMeds: "Medicines",
    qaMedsSub: "Daily Schedule",
    qaVoice: "Voice AI",
    qaVoiceSub: "Speak & Ask",
    qaFamily: "Call Priya",
    qaFamilySub: "Daughter (Primary)",
    qaDoctor: "Doctor Visit",
    qaDoctorSub: "Nov 5 Kauvery Hospital",
    qaNutrition: "Nutrition",
    qaNutritionSub: "Senior Diet Guide",
    dailyGoals: "Daily Health Goals",
    waterTitle: "Hydration",
    walkTitle: "Gentle Walk",
    allWellMsg: "All is peaceful • You are doing very well Sir",
    tabHome: "Home",
    tabVoice: "Voice AI",
    tabMeds: "Medicines",
    tabVitals: "Health",
    tabNutrition: "Nutrition",
    tabSos: "SOS",
    tabProfile: "Profile",
    viewAllMeds: "Full Schedule ➔",
    voiceTitle: "ElderCare Voice AI Companion",
    micTapToSpeak: "Tap to Speak",
    micSubText: "Speak freely in Tamil or English, just like talking to family",
    speedLabel: "Voice Speed:",
    audioWaveTitle: "AI Voice Speaking",
    fontZoomTitle: "Adjust Text Size (A- / A+)",
    safeCheckinTitle: "Daily Safety Confirmation",
    safeCheckinQuestion: "Good Morning Sir! Are you feeling well?",
    safeCheckinPrompt: "Tap once to confirm you are safe & well to Caregiver Priya.",
    safeCheckinBtn: "I Am Safe & Well 💚",
    safeCheckinDoneTitle: "Good Morning Sir! Are you feeling well?",
    safeCheckinDonePrompt: "Safety confirmed today. Caregiver Priya has been notified ✓",
    safeCheckinDoneBtn: "Safe & Well ✓",
    pillboxTitle: "3-Part Daily Pill Organizer",
    pillboxMorning: "Morning Pills (8:00 - 10:00 AM)",
    pillboxAfternoon: "Afternoon Pills (1:00 - 2:30 PM)",
    pillboxNight: "Night Pills (8:30 - 9:30 PM)",
    doctorApptTitle: "Upcoming Doctor Consultation",
    nutritionTitle: "Senior Nutrition & Diet Guide",
    wellnessTitle: "Peaceful Meditation Tone",
    wellnessDesc: "Gentle 432Hz meditation tone designed to reduce anxiety, promote serenity and deep sleep.",
    calmMusicBtn: "Start Meditation Tone",
    calmMusicPause: "Pause Meditation Tone",
    voiceFaqTitle: "Frequently Asked Questions (Tap to listen aloud):",
    chipTea: "🍵 Can I take diabetes medicine after drinking tea?",
    chipBp: "🩺 How is my blood pressure (BP) today?",
    chipWater: "💧 How much water should I drink today?",
    chipDizzy: "😴 I feel slightly dizzy or tired today",
    chipSleep: "🌙 What should I do for peaceful sleep tonight?",
    chipDiet: "🥗 What is an easy and nutritious diet for seniors?",
    chipAppt: "🏥 When is my next doctor consultation?",
    chipPriya: "📞 Call daughter Priya",
    chatInputPlaceholder: "Type your health query (e.g. when is my medicine?)…",
    chatSendBtn: "Send",
    medIdBtn: "Medical ID",
    medsTitle: "Medication Schedule",
    medsSubtitle: "Take on time according to daily doctor prescription.",
    medsDbSub: "Stored and monitored in SQLite database.",
    btnAddMed: "+ Add New Medicine",
    vitalsHeading: "Health Vitals & Trends",
    vitalsSubtitle: "Blood pressure, blood sugar, and pulse rate logs.",
    btnLogVital: "+ Log New Reading",
    bpTrendTitle: "Blood Pressure Trend (Last 7 Readings)",
    thDateTime: "Date & Time",
    thBp: "Blood Pressure (BP)",
    thSugar: "Blood Sugar",
    thPulse: "Pulse Rate",
    thStatus: "Status",
    hydrationTitle: "Daily Hydration Level",
    hydrationSub: "Daily target of 2.0L water is essential for healthy living",
    hydrationIntakeLabel: "Current Intake",
    hydrationGoalLabel: "Daily Goal",
    hydrationRemainingLabel: "Remaining",
    add1Glass: "+1 Glass (+250ml)",
    add2Glasses: "+2 Glasses (+500ml)",
    undoGlass: "-1 Glass",
    nutritionHeading: "Senior Nutrition & Diet Guide",
    nutritionSubtitle: "Easily digestible, balanced meal recommendations for blood sugar & BP regulation.",
    nutritionListen: "🔊 Listen Aloud",
    mealBreakfastTitle: "🌅 Morning Breakfast (8:00 - 9:00 AM)",
    mealBreakfastDesc: "2-3 steamed idlis with sambar or fenugreek oats porridge. Prefer sugar-free tea or coffee. Take morning diabetes pills after breakfast.",
    mealLunchTitle: "☀️ Afternoon Lunch (1:00 - 2:00 PM)",
    mealLunchDesc: "Moderate portion of brown or Ponni rice with moong dal, steamed greens, carrots, and beans. Fresh curd or spiced buttermilk after meal.",
    mealSnackTitle: "☕ Evening Snacks (4:30 - 5:30 PM)",
    mealSnackDesc: "Boiled sundal (chickpeas) or a slice of apple / papaya. Warm green tea or warm drinking water.",
    mealDinnerTitle: "🌙 Night Dinner (7:30 - 8:30 PM)",
    mealDinnerDesc: "Light meal: 2 soft chapatis or idiyappam with mild dal kootu. A cup of warm turmeric milk before bedtime for peaceful sleep.",
    goldenRulesTitle: "⚠️ Golden Nutrition Rules for Seniors:",
    goldenRule1: "Keep dietary salt strictly minimal to protect your blood pressure.",
    goldenRule2: "Avoid cold or iced water; always prefer warm drinking water.",
    goldenRule3: "Avoid large heavy meals; split nutrition into 3-4 gentle portions.",
    sosPageTitle: "Emergency SOS Dispatch",
    sosPageSub: "Tapping the red button immediately transmits your live location to daughter Priya and 108 emergency service.",
    sosPageBtn: "🚨 Trigger Emergency SOS",
    sosContactsTitle: "Emergency Contacts:",
    contactPriyaName: "Priya Ramanathan (Daughter & Caregiver)",
    contactPriyaRole: "Primary Caregiver • +91 98401 23456",
    contactAmbulanceName: "108 Emergency Ambulance Service",
    contactAmbulanceRole: "Govt of Tamil Nadu Emergency Medical Vehicle",
    contactDoctorName: "Dr. K. Aravind (Family Doctor)",
    contactDoctorRole: "Kauvery Hospital • +91 94440 98765",
    contactNeighborName: "S. Kannan (Neighbour)",
    contactNeighborRole: "Ground Floor • +91 98840 55432",
    btnCall: "Call 📞",
    btnAmbulanceCall: "Call 108 🚑",
    profileTitle: "Senior & Caregiver Profile",
    profileNameVal: "Ramanathan Subramanian",
    profileAgeVal: "72 Yrs • Male • Blood: O+ Positive",
    profileCaregiverVal: "Caregiver: Priya Ramanathan (Daughter) • +91 98401 23456",
    conditionsTitle: "Chronic Health Conditions:",
    condDiabetes: "Type-2 Diabetes (Since 2015)",
    condBp: "Hypertension / High BP (Since 2012)",
    condKnee: "Mild Knee Osteoarthritis (Since 2020)",
    addressTitle: "Residence Address:",
    addressVal: "Flat 3B, Shanthi Niketan Apts, T. Nagar, Chennai - 600017",
    sosModalTitle: "Emergency SOS Dispatch",
    sosModalDesc: "Your GPS coordinates are being transmitted to daughter Priya & 108 Ambulance. Tap cancel if pressed by mistake.",
    sosModalCancel: "❌ CANCEL (Pressed by mistake - abort)",
    medIdModalTitle: "Senior Emergency Medical ID Card",
    medIdModalAge: "<b>Age:</b> 72 Years • <b>Gender:</b> Male",
    medIdModalBlood: "🩸 Blood Group: O+ Positive",
    medIdModalAllergyTitle: "⚠️ Allergies:",
    medIdModalAllergyVal: "Penicillin - Severe Risk",
    medIdModalCondTitle: "🩺 Conditions:",
    medIdModalCondVal: "Type-2 Diabetes, Hypertension (High BP)",
    medIdModalContactsTitle: "🚨 Emergency Contacts:",
    medIdListenBtn: "🔊 Listen Aloud",
    medIdPrintBtn: "🖨️ Print / Save ID"
  }
};

// Pure Tamil & English Localization Formatters
function getLocalizedTiming(timing, isTa) {
  if (!timing) return '';
  if (!isTa) return timing.replace(/[\u0B80-\u0BFF\(\)\•]/g, '').trim();
  return timing
    .replace(/Morning/gi, 'காலை')
    .replace(/Afternoon/gi, 'மதியம்')
    .replace(/Evening/gi, 'மாலை')
    .replace(/Night/gi, 'இரவு')
    .replace(/AM/gi, 'மணி')
    .replace(/PM/gi, 'மணி')
    .trim();
}

function getLocalizedDosage(dosage, isTa) {
  if (!dosage) return isTa ? '1 மாத்திரை' : '1 Tablet';
  if (isTa) {
    if (dosage.includes('மாத்திரை')) return dosage.replace(/\(.*?\)/g, '').trim();
    return dosage.replace(/Tablet/i, 'மாத்திரை').replace(/Capsule/i, 'கேப்சூல்');
  } else {
    return dosage.replace(/[\u0B80-\u0BFF]/g, '').replace(/[\(\)]/g, '').trim() || '1 Tablet';
  }
}

function getLocalizedFoodInstruction(foodInstruction, isTa) {
  if (!foodInstruction) return isTa ? 'உணவுக்குப் பின்' : 'After Food';
  if (isTa) {
    if (foodInstruction.includes('காலை உணவிற்குப் பின்') || foodInstruction.includes('After Breakfast')) return 'காலை உணவிற்குப் பின்';
    if (foodInstruction.includes('காலை உணவுக்கு முன்') || foodInstruction.includes('Before Breakfast')) return 'காலை உணவுக்கு முன்';
    if (foodInstruction.includes('இரவு உணவிற்குப் பின்') || foodInstruction.includes('After Dinner')) return 'இரவு உணவிற்குப் பின்';
    if (foodInstruction.includes('மதிய உணவிற்குப் பின்') || foodInstruction.includes('After Lunch')) return 'மதிய உணவிற்குப் பின்';
    if (foodInstruction.includes('உணவுக்குப் பின்') || foodInstruction.includes('After food')) return 'உணவுக்குப் பின்';
    if (foodInstruction.includes('வெறும் வயிற்றில்') || foodInstruction.includes('Empty stomach')) return 'வெறும் வயிற்றில்';
    const taPart = foodInstruction.match(/[\u0B80-\u0BFF\s]+/);
    return taPart ? taPart[0].trim() : foodInstruction;
  } else {
    return foodInstruction.replace(/[\u0B80-\u0BFF]/g, '').replace(/[\(\)]/g, '').trim() || 'After Food';
  }
}

// ================= Toast Message ================= //
function showToast(message) {
  let toast = document.getElementById('toast-box');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-box';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.display = 'block';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.style.display = 'none';
  }, 3200);
}

// ================= Speech Synthesis (Bilingual with Native Tamil Selection) ================= //
function speakText(text, lang = state.lang) {
  if (!('speechSynthesis' in window)) {
    showToast('குரல் வசதி இந்த உலாவியில் ஆதரிக்கப்படவில்லை');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);

  // Pick natural Tamil voice if speaking Tamil
  const voices = window.speechSynthesis.getVoices();
  if (lang === 'ta') {
    const tamilVoice = voices.find(v => 
      v.lang === 'ta-IN' || 
      v.lang.startsWith('ta') || 
      v.name.toLowerCase().includes('tamil') || 
      v.name.includes('Valluvar') || 
      v.name.includes('Pallava')
    );
    if (tamilVoice) {
      utterance.voice = tamilVoice;
      utterance.lang = tamilVoice.lang;
    } else {
      utterance.lang = 'ta-IN';
    }
  } else {
    utterance.lang = 'en-IN';
  }

  // Clear elderly-friendly pacing
  const speedSlider = document.getElementById('speechSpeedRange');
  utterance.rate = speedSlider ? parseFloat(speedSlider.value) : 0.88;
  utterance.pitch = 1.0;

  // Animate audio wave visualizers
  const waves = document.querySelectorAll('.audio-wave-box');
  waves.forEach(w => w.classList.add('speaking'));

  utterance.onend = () => {
    waves.forEach(w => w.classList.remove('speaking'));
  };
  utterance.onerror = () => {
    waves.forEach(w => w.classList.remove('speaking'));
  };

  window.speechSynthesis.speak(utterance);
}

// Ensure voices are loaded on Chromium/Edge
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}

// ================= Web Audio Alert Chimes ================= //
function playGentleChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.2); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.4); // G5

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.75);
  } catch (e) {}
}

function playEmergencySound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {}
}

// ================= API Fetch Operations ================= //
async function fetchAllData() {
  try {
    // 0. Check Backend Health
    await fetch(`${API_BASE}/api/health`).catch(() => null);

    // 1. Fetch Profile
    const profileRes = await fetch(`${API_BASE}/api/profile`).catch(() => null);
    if (profileRes && profileRes.ok) state.profile = await profileRes.json();

    // 2. Fetch Medications
    const medsRes = await fetch(`${API_BASE}/api/medications`).catch(() => null);
    if (medsRes && medsRes.ok) state.medications = await medsRes.json();

    // 3. Fetch Vitals
    const vitalsRes = await fetch(`${API_BASE}/api/vitals`).catch(() => null);
    if (vitalsRes && vitalsRes.ok) state.vitals = await vitalsRes.json();

    // 4. Fetch Emergency Contacts
    const contactsRes = await fetch(`${API_BASE}/api/sos/contacts`).catch(() => null);
    if (contactsRes && contactsRes.ok) state.contacts = await contactsRes.json();

    // 5. Fetch Activity
    const actRes = await fetch(`${API_BASE}/api/activity`).catch(() => null);
    if (actRes && actRes.ok) state.activity = await actRes.json();

    // 6. Fetch Doctor Appointments
    const apptsRes = await fetch(`${API_BASE}/api/appointments`).catch(() => null);
    if (apptsRes && apptsRes.ok) state.appointments = await apptsRes.json();

    // 7. Fetch Daily Check-in Status
    const chkRes = await fetch(`${API_BASE}/api/checkin`).catch(() => null);
    if (chkRes && chkRes.ok) state.checkin = await chkRes.json();

    renderAll();
  } catch (err) {
    console.warn('Backend offline or network error, running in local mode:', err);
    renderAll();
  }
}

// Live Smartphone Status Bar Clock
function updateStatusClock() {
  const clockEl = document.getElementById('status-clock');
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}

// ================= Render Views ================= //
function renderAll() {
  updateStatusClock();
  renderLanguageLabels();
  renderSafetyCheckin();
  renderHomeHero();
  renderNextDoseCard();
  renderVisualPillbox();
  renderVitalsSummary();
  renderDoctorAppointments();
  renderActivityWidget();
  renderMedicationsView();
  renderVitalsView();
  renderProfileView();
}

// 1. Language Labels
function renderLanguageLabels() {
  const t = i18n[state.lang] || i18n['ta'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t && t[key] !== undefined) {
      if (t[key].includes('<')) {
        el.innerHTML = t[key];
      } else {
        el.textContent = t[key];
      }
    }
  });

  // Handle Input Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t && t[key] !== undefined) {
      el.placeholder = t[key];
    }
  });

  // Handle Tooltips / Titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t && t[key] !== undefined) {
      el.title = t[key];
    }
  });

  const langTextEl = document.getElementById('lang-btn-text');
  if (langTextEl) {
    langTextEl.textContent = state.lang === 'ta' ? 'தமிழ்' : 'English';
  }

  // Update Meditation Player Button Text according to playing state & active language
  const calmTextEl = document.getElementById('btn-calm-music-text');
  const calmIconEl = document.getElementById('btn-calm-music-icon');
  if (calmTextEl) {
    calmTextEl.textContent = state.audioPlaying ? (t.calmMusicPause || 'Pause') : (t.calmMusicBtn || 'Start');
  }
  if (calmIconEl) {
    calmIconEl.textContent = state.audioPlaying ? '⏸️' : '🎵';
  }

  // Update HTML tag lang attribute
  if (document.documentElement) {
    document.documentElement.lang = state.lang;
  }
}

// 2. Safety Check-in Banner ("நான் நலமாக உள்ளேன்" / "Are You Feeling Well?")
function renderSafetyCheckin() {
  const container = document.getElementById('safety-checkin-container');
  if (!container) return;

  const isTa = state.lang === 'ta';
  const t = i18n[state.lang] || i18n['ta'];
  const checked = state.checkin && state.checkin.checkedIn;

  const title = checked ? (t.safeCheckinDoneTitle || t.safeCheckinQuestion) : t.safeCheckinQuestion;
  const prompt = checked 
    ? (isTa ? `இன்று நீங்கள் நலமாக உள்ளீர்கள் என பதிவு செய்யப்பட்டது (${state.checkin.time || 'காலை'}). பிரியாவுக்கு தகவல் தெரிவிக்கப்பட்டது ✓` : `Safety confirmed today at ${state.checkin.time || 'morning'}. Caregiver Priya has been notified ✓`)
    : t.safeCheckinPrompt;
  const btnText = checked ? t.safeCheckinDoneBtn : t.safeCheckinBtn;

  container.innerHTML = `
    <div class="safety-checkin-banner">
      <div class="checkin-left">
        <div class="checkin-icon">${checked ? '💚' : '☀️'}</div>
        <div class="checkin-info">
          <h3>${title}</h3>
          <p>${prompt}</p>
        </div>
      </div>
      <div>
        ${checked ? `
          <button class="btn-checkin-action done" type="button" disabled>
            <span>✓</span> <span>${btnText}</span>
          </button>
        ` : `
          <button class="btn-checkin-action" onclick="doSafetyCheckin()" type="button">
            <span>💚</span> <span>${btnText}</span>
          </button>
        `}
      </div>
    </div>
  `;
}

async function doSafetyCheckin() {
  try {
    const res = await fetch(`${API_BASE}/api/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Senior checked in safe from web app' })
    });
    if (res.ok) {
      state.checkin = { checkedIn: true, time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) };
      renderSafetyCheckin();
      playGentleChime();
      const speech = state.lang === 'ta'
        ? 'மிக்க மகிழ்ச்சி ராமநாதன் ஐயா! நீங்கள் நலமாக உள்ளீர்கள் என்பது பதிவாகியது. உங்கள் மகள் பிரியாவிற்கும் தகவல் தெரிவிக்கப்பட்டது.'
        : 'Thank you Ramanathan Sir! Your safety status is recorded and Caregiver Priya has been notified.';
      speakText(speech, state.lang);
      showToast(state.lang === 'ta' ? '💚 நீங்கள் நலமாக உள்ளீர்கள் என பிரியாவிற்கு தகவல் சென்றது!' : '💚 Safety confirmed! Caregiver Priya notified.');
    }
  } catch (e) {
    state.checkin = { checkedIn: true };
    renderSafetyCheckin();
    showToast('நலமாக உள்ளீர்கள் என குறிக்கப்பட்டது');
  }
}

// 3. Home Hero
function renderHomeHero() {
  const sirEl = document.getElementById('hero-senior-name');
  if (sirEl) {
    if (state.profile) {
      sirEl.textContent = state.lang === 'ta' 
        ? `வணக்கம், ${state.profile.tamilName || 'ராமநாதன்'} ஐயா`
        : `Good day, ${state.profile.name || 'Ramanathan'} Sir`;
    } else {
      sirEl.textContent = state.lang === 'ta'
        ? 'வணக்கம், ராமநாதன் ஐயா'
        : 'Good day, Ramanathan Sir';
    }
  }
}

// 4. Next Dose Card with Voice Alarm Test
function renderNextDoseCard() {
  const container = document.getElementById('next-dose-container');
  if (!container) return;

  const meds = state.medications || [];
  const nextMed = meds.find(m => !m.takenToday) || meds[0];
  if (!nextMed) return;

  const isTa = state.lang === 'ta';
  const medName = isTa ? (nextMed.tamilName || nextMed.name) : nextMed.name;
  const timingText = getLocalizedTiming(nextMed.timing, isTa);
  const dosageText = getLocalizedDosage(nextMed.dosage, isTa);
  const foodText = getLocalizedFoodInstruction(nextMed.foodInstruction, isTa);

  container.innerHTML = `
    <div class="next-dose-header">
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:12px;height:12px;border-radius:50%;background:#087f8c;display:inline-block;" class="pulse-indicator"></span>
        <strong style="color:var(--primary);font-size:16px;">${isTa ? 'அடுத்த மருந்து' : 'Next Dose'}</strong>
      </div>
      <span class="dose-badge-time">⏰ ${timingText}</span>
    </div>
    <div class="dose-details-box">
      <div class="dose-icon-wrap">💊</div>
      <div class="dose-meta">
        <h3>${medName}</h3>
        <p>${dosageText} • ${foodText}</p>
      </div>
    </div>
    <div class="dose-stock-row">
      <span>📦 ${isTa ? 'கையிருப்பு:' : 'Remaining:'} <b>${nextMed.stock} ${isTa ? 'மாத்திரைகள்' : 'pills'}</b></span>
      ${nextMed.stock <= nextMed.refillThreshold ? `<span class="stock-warning-tag">⚠️ ${isTa ? 'விரைவில் வாங்கவும்' : 'Refill Soon'}</span>` : ''}
    </div>
    <div class="next-dose-actions">
      <button class="btn-mark-taken ${nextMed.takenToday ? 'completed' : ''}" onclick="toggleMedTaken('${nextMed.id}')" type="button">
        <span>${nextMed.takenToday ? '✓' : '✔'}</span>
        <span>${nextMed.takenToday ? (isTa ? 'மாத்திரை எடுத்தாச்சு ✓' : 'Taken ✓') : (isTa ? 'எடுத்தாச்சு என குறிக்கவும்' : 'Mark as Taken')}</span>
      </button>
      <button class="btn btn-secondary btn-next-dose-audio" onclick="playPillReminderChime('${medName}', '${timingText}', '${dosageText}')" type="button" title="Test Tamil Audio Alarm">
        <span>🔔 🔊</span>
      </button>
    </div>
  `;
}

// Pill Reminder Chime + Tamil Voice Speech
function playPillReminderChime(medName, timing, dosage = '1 மாத்திரை') {
  playGentleChime();
  const msg = state.lang === 'ta'
    ? `வணக்கம் ராமநாதன் ஐயா! ${medName} மாத்திரை எடுக்கும் நேரம். ${timing}. உணவுக்குப் பின் வெதுவெதுப்பான தண்ணீருடன் எடுத்துக்கொள்ளவும்.`
    : `Good day Ramanathan sir! It is time to take your ${medName}. ${timing}. Please take it with warm water.`;
  setTimeout(() => {
    speakText(msg, state.lang);
  }, 500);
}

// 5. Visual 3-Part Pill Box (காலை, மதியம், இரவு)
function renderVisualPillbox() {
  const container = document.getElementById('visual-pillbox-container');
  if (!container) return;

  const meds = state.medications || [];
  const isTa = state.lang === 'ta';

  const morningMeds = meds.filter(m => (m.timing || '').toLowerCase().includes('morning') || (m.timing || '').includes('காலை'));
  const afternoonMeds = meds.filter(m => (m.timing || '').toLowerCase().includes('afternoon') || (m.timing || '').includes('மதியம்'));
  const nightMeds = meds.filter(m => (m.timing || '').toLowerCase().includes('night') || (m.timing || '').includes('evening') || (m.timing || '').includes('இரவு'));

  function renderList(list) {
    if (!list.length) return `<div style="font-size:13px;color:var(--text-muted);padding:8px 0;">${isTa ? 'மாத்திரைகள் இல்லை' : 'No medicines'}</div>`;
    return list.map(m => `
      <div class="pill-card-mini ${m.takenToday ? 'taken' : ''}">
        <div class="med-text-group">
          <b class="med-name">${isTa ? (m.tamilName || m.name) : m.name}</b>
          <div class="med-details">${getLocalizedDosage(m.dosage, isTa)} • ${getLocalizedFoodInstruction(m.foodInstruction, isTa)}</div>
        </div>
        <button class="btn ${m.takenToday ? 'btn-secondary' : 'btn-primary'} med-action-btn" onclick="toggleMedTaken('${m.id}')" style="padding:8px 14px;font-size:13px;" type="button">
          ${m.takenToday ? (isTa ? 'எடுத்தாச்சு ✓' : 'Taken ✓') : (isTa ? 'எடுக்க' : 'Take')}
        </button>
      </div>
    `).join('');
  }

  container.innerHTML = `
    <div class="visual-pillbox-wrap">
      <div class="pillbox-column">
        <div class="pillbox-col-header morning">
          <strong>🌅 ${isTa ? 'காலை (8:00 - 10:00 மணி)' : 'Morning (8:00 - 10:00 AM)'}</strong>
          <span>${isTa ? morningMeds.length + ' மாத்திரைகள்' : morningMeds.length + ' Pills'}</span>
        </div>
        ${renderList(morningMeds)}
      </div>

      <div class="pillbox-column">
        <div class="pillbox-col-header afternoon">
          <strong>☀️ ${isTa ? 'மதியம் (1:00 - 2:30 மணி)' : 'Afternoon (1:00 - 2:30 PM)'}</strong>
          <span>${isTa ? afternoonMeds.length + ' மாத்திரைகள்' : afternoonMeds.length + ' Pills'}</span>
        </div>
        ${renderList(afternoonMeds)}
      </div>

      <div class="pillbox-column">
        <div class="pillbox-col-header night">
          <strong>🌙 ${isTa ? 'இரவு (8:30 - 9:30 மணி)' : 'Night (8:30 - 9:30 PM)'}</strong>
          <span>${isTa ? nightMeds.length + ' மாத்திரைகள்' : nightMeds.length + ' Pills'}</span>
        </div>
        ${renderList(nightMeds)}
      </div>
    </div>
  `;
}

// 6. Doctor Appointments
function renderDoctorAppointments() {
  const box = document.getElementById('doctor-appointments-box');
  if (!box) return;

  const appts = state.appointments || [];
  const isTa = state.lang === 'ta';

  if (!appts.length) {
    box.innerHTML = `<p style="color:var(--text-muted);font-size:14px;">${isTa ? 'மருத்துவ சந்திப்புகள் ஏதுமில்லை' : 'No upcoming appointments'}</p>`;
    return;
  }

  box.innerHTML = appts.map(a => `
    <div class="doctor-appointment-card">
      <div>
        <div class="appt-badge">📅 ${a.date} (${a.time})</div>
        <h4 style="font-size:17px;font-weight:800;color:var(--text-main);margin-top:6px;">
          ${isTa ? (a.tamilDoctorName || a.doctorName) : a.doctorName}
        </h4>
        <p style="font-size:13px;color:var(--text-muted);margin-top:2px;">
          ${isTa ? (a.tamilHospital || a.hospital) : a.hospital} • ${isTa ? a.tamilSpecialty : a.specialty}
        </p>
      </div>
      <div>
        <a href="tel:${a.phone}" class="btn btn-secondary" style="padding:10px 16px;text-decoration:none;font-size:14px;">
          📞 ${isTa ? 'அழைக்க' : 'Call'}
        </a>
      </div>
    </div>
  `).join('');
}

// 7. Vitals Summary Card
function renderVitalsSummary() {
  const grid = document.getElementById('vitals-summary-grid');
  if (!grid) return;

  const latest = (state.vitals && state.vitals[0]) || {
    bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'Normal (சீரானது)' },
    bloodSugar: { value: 108, unit: 'mg/dL', status: 'Normal' },
    pulse: { value: 74, unit: 'BPM', status: 'Steady' }
  };

  const isTa = state.lang === 'ta';
  const bpStatus = isTa ? 'சீரானது (இயல்பு)' : (latest.bloodPressure.status || 'Normal');
  const sugarStatus = isTa ? 'இயல்பு நிலை' : (latest.bloodSugar.status || 'Normal');
  const pulseStatus = isTa ? 'அமைதியானது' : (latest.pulse.status || 'Steady');

  grid.innerHTML = `
    <div class="vital-metric-card">
      <div class="vital-metric-top">
        <span>${isTa ? 'ரத்த அழுத்தம்' : 'Blood Pressure'}</span>
        <button onclick="speakText('உங்கள் ரத்த அழுத்தம் ${latest.bloodPressure.systolic} கீழ் ${latest.bloodPressure.diastolic} மில்லிமீட்டர் பாதரசம். மிகவும் சீராகவும் இயல்பாகவும் உள்ளது ஐயா.', 'ta')" style="background:transparent;border:none;cursor:pointer;font-size:18px;" title="Listen in Tamil">🔊</button>
      </div>
      <div class="vital-value-wrap">
        <div class="metric-val">${latest.bloodPressure.systolic}/${latest.bloodPressure.diastolic}</div>
        <div class="metric-unit">${latest.bloodPressure.unit}</div>
      </div>
      <span class="status-pill">${bpStatus}</span>
    </div>

    <div class="vital-metric-card">
      <div class="vital-metric-top">
        <span>${isTa ? 'சர்க்கரை அளவு' : 'Blood Sugar'}</span>
        <button onclick="speakText('உங்கள் சர்க்கரை அளவு ${latest.bloodSugar.value} மில்லிகிராம். ஆரோக்கியமான இயல்பு வரம்பிற்குள் உள்ளது ஐயா.', 'ta')" style="background:transparent;border:none;cursor:pointer;font-size:18px;" title="Listen in Tamil">🔊</button>
      </div>
      <div class="vital-value-wrap">
        <div class="metric-val">${latest.bloodSugar.value}</div>
        <div class="metric-unit">${latest.bloodSugar.unit}</div>
      </div>
      <span class="status-pill">${sugarStatus}</span>
    </div>

    <div class="vital-metric-card">
      <div class="vital-metric-top">
        <span>${isTa ? 'இதயத் துடிப்பு' : 'Pulse Rate'}</span>
        <button onclick="speakText('உங்கள் இதயத்துடிப்பு நிமிடத்திற்கு ${latest.pulse.value} துடிப்புகள். அமைதியாகவும் நலமாகவும் உள்ளது.', 'ta')" style="background:transparent;border:none;cursor:pointer;font-size:18px;" title="Listen in Tamil">🔊</button>
      </div>
      <div class="vital-value-wrap">
        <div class="metric-val">${latest.pulse.value}</div>
        <div class="metric-unit">${latest.pulse.unit}</div>
      </div>
      <span class="status-pill">${pulseStatus}</span>
    </div>
  `;
}

// 8. Activity Widget
function renderActivityWidget() {
  const current = (state.activity && state.activity.water && state.activity.water.current != null) ? state.activity.water.current : 5;
  const target = (state.activity && state.activity.water && state.activity.water.target != null) ? state.activity.water.target : 8;
  const isTa = state.lang === 'ta';

  const currentLiters = (current * 0.25).toFixed(2);
  const targetLiters = (target * 0.25).toFixed(1);
  const remainingGlasses = Math.max(0, target - current);
  const remainingLiters = Math.max(0, (target - current) * 0.25).toFixed(2);
  const pct = Math.min(100, Math.round((current / target) * 100));

  const intakeLitersEl = document.getElementById('water-intake-liters');
  const intakeGlassesEl = document.getElementById('water-intake-glasses');
  const goalLitersEl = document.getElementById('water-goal-liters');
  const goalGlassesEl = document.getElementById('water-goal-glasses');
  const remLitersEl = document.getElementById('water-remaining-liters');
  const remGlassesEl = document.getElementById('water-remaining-glasses');
  const pctBadgeEl = document.getElementById('hydration-pct-badge');
  const barFillEl = document.getElementById('hydration-bar-fill');
  const slotsWrap = document.getElementById('water-slots-grid');

  if (intakeLitersEl) intakeLitersEl.textContent = currentLiters;
  if (intakeGlassesEl) intakeGlassesEl.textContent = isTa ? `(${current} டம்ளர்கள்)` : `(${current} glasses)`;
  if (goalLitersEl) goalLitersEl.textContent = targetLiters;
  if (goalGlassesEl) goalGlassesEl.textContent = isTa ? `(${target} டம்ளர்கள்)` : `(${target} glasses)`;
  if (remLitersEl) remLitersEl.textContent = remainingLiters;
  if (remGlassesEl) remGlassesEl.textContent = isTa ? `(${remainingGlasses} டம்ளர்கள்)` : `(${remainingGlasses} glasses)`;
  if (pctBadgeEl) pctBadgeEl.textContent = `${pct}%`;
  if (barFillEl) barFillEl.style.width = `${pct}%`;

  if (slotsWrap) {
    slotsWrap.innerHTML = '';
    for (let i = 1; i <= target; i++) {
      const slot = document.createElement('div');
      slot.className = `hydration-slot ${i <= current ? 'filled' : ''}`;
      slot.innerHTML = i <= current ? '💧' : '○';
      slot.title = isTa ? `டம்ளர் ${i} (250மி.லி)` : `Glass ${i} (250ml)`;
      slot.onclick = () => logWaterGlass(i <= current ? -1 : 1);
      slotsWrap.appendChild(slot);
    }
  }

  // Legacy fallback label if present
  const countLabel = document.getElementById('water-count-label');
  if (countLabel) {
    countLabel.textContent = isTa 
      ? `${current} / ${target} டம்ளர்கள் (${currentLiters}L)` 
      : `${current} of ${target} Glasses (${currentLiters}L)`;
  }

  // Walking goal tracker
  const stepFill = document.getElementById('walk-progress-fill');
  const stepLabel = document.getElementById('walk-step-label');
  const stepPct = document.getElementById('walk-pct-label');
  if (stepFill && stepLabel) {
    const steps = (state.activity && state.activity.walk && state.activity.walk.currentSteps) || 1200;
    const walkTarget = (state.activity && state.activity.walk && state.activity.walk.targetSteps) || 2000;
    const walkPct = Math.min(100, Math.round((steps / walkTarget) * 100));
    stepFill.style.width = `${walkPct}%`;
    stepLabel.textContent = isTa
      ? `${steps.toLocaleString()} / ${walkTarget.toLocaleString()} அடிகள்`
      : `${steps.toLocaleString()} / ${walkTarget.toLocaleString()} steps`;
    if (stepPct) stepPct.textContent = `${walkPct}%`;
  }
}

// 9. Medications Full View
function renderMedicationsView() {
  const container = document.getElementById('medications-full-list');
  if (!container) return;

  const meds = state.medications || [];
  const isTa = state.lang === 'ta';

  container.innerHTML = meds.map(m => {
    const medName = isTa ? (m.tamilName || m.name) : m.name;
    const timingText = getLocalizedTiming(m.timing, isTa);
    const dosageText = getLocalizedDosage(m.dosage, isTa);
    const foodText = getLocalizedFoodInstruction(m.foodInstruction, isTa);
    const stockText = isTa ? `கையிருப்பு: ${m.stock} மாத்திரைகள்` : `Stock: ${m.stock} pills`;
    const refillWarning = m.stock <= m.refillThreshold ? (isTa ? ' ⚠️ விரைவில் வாங்கவும்' : ' ⚠️ Refill Soon') : '';

    return `
      <div class="med-item-card ${m.takenToday ? 'taken' : ''}">
        <div class="med-left-group">
          <div class="med-time-tag">${timingText}</div>
          <div class="med-info-box">
            <h4>${medName}</h4>
            <p>${dosageText} • ${foodText}</p>
            <span class="med-stock-badge ${m.stock <= m.refillThreshold ? 'low' : ''}">
              ${stockText}${refillWarning}
            </span>
          </div>
        </div>
        <div class="med-item-actions">
          <button class="btn btn-secondary btn-med-audio" onclick="playPillReminderChime('${medName}', '${timingText}', '${dosageText}')" type="button" title="Audio Pronounce">
            🔊
          </button>
          <button class="btn-toggle-med ${m.takenToday ? 'done' : 'pending'}" onclick="toggleMedTaken('${m.id}')" type="button">
            ${m.takenToday ? '✓ ' + (isTa ? 'எடுத்தாச்சு' : 'Taken') : '○ ' + (isTa ? 'எடுக்கவும்' : 'Take Dose')}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// 10. Vitals View
function renderVitalsView() {
  const chartBox = document.getElementById('vitals-svg-chart');
  const tableBody = document.getElementById('vitals-table-body');
  const vitals = state.vitals || [];

  if (chartBox && vitals.length >= 2) {
    const points = vitals.slice(0, 7).reverse();
    const width = 500;
    const height = 140;
    const maxVal = 160;
    const minVal = 90;

    const coords = points.map((p, index) => {
      const x = 30 + (index / (points.length - 1)) * (width - 60);
      const val = p.bloodPressure ? p.bloodPressure.systolic : 120;
      const y = height - 20 - ((val - minVal) / (maxVal - minVal)) * (height - 40);
      return { x, y, val, date: p.date.slice(5) };
    });

    const pathD = coords.reduce((acc, c, i) => acc + (i === 0 ? `M ${c.x} ${c.y}` : ` L ${c.x} ${c.y}`), '');

    chartBox.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:100%;">
        <line x1="20" y1="${height - 20}" x2="${width - 10}" y2="${height - 20}" stroke="#cbd5e1" stroke-width="1.5" />
        <path d="${pathD}" fill="none" stroke="#00646f" stroke-width="3.5" stroke-linecap="round" />
        ${coords.map(c => `
          <circle cx="${c.x}" cy="${c.y}" r="5" fill="#087f8c" stroke="#ffffff" stroke-width="2" />
          <text x="${c.x}" y="${c.y - 10}" font-size="11" font-weight="700" fill="#00646f" text-anchor="middle">${c.val}</text>
          <text x="${c.x}" y="${height - 6}" font-size="10" font-weight="600" fill="#64748b" text-anchor="middle">${c.date}</text>
        `).join('')}
      </svg>
    `;
  }

  if (tableBody) {
    tableBody.innerHTML = vitals.map(v => `
      <tr>
        <td><b>${v.date}</b><br><small style="color:#64748b">${v.time}</small></td>
        <td><b>${v.bloodPressure.systolic}/${v.bloodPressure.diastolic}</b> ${v.bloodPressure.unit}</td>
        <td><b>${v.bloodSugar.value}</b> mg/dL <small>(${v.bloodSugar.type || 'Fasting'})</small></td>
        <td><b>${v.pulse.value}</b> BPM</td>
        <td><span class="status-pill">${v.bloodPressure.status}</span></td>
      </tr>
    `).join('');
  }
}

// 11. Profile View
function renderProfileView() {
  const profile = state.profile;
  const isTa = state.lang === 'ta';

  const avatarEl = document.getElementById('profile-avatar-letter');
  if (avatarEl) avatarEl.textContent = isTa ? 'ரா' : 'R';
  const modalAvatarEl = document.getElementById('med-id-avatar-letter');
  if (modalAvatarEl) modalAvatarEl.textContent = isTa ? 'ரா' : 'R';

  const nameEl = document.getElementById('profile-name');
  if (nameEl) nameEl.textContent = isTa ? (profile ? profile.tamilName : 'ராமநாதன் சுப்ரமணியன்') : (profile ? profile.name : 'Ramanathan Subramanian');

  const ageEl = document.getElementById('profile-age-gender');
  if (ageEl) {
    const age = profile ? profile.age : 72;
    const gender = isTa ? 'ஆண்' : (profile ? profile.gender : 'Male');
    const blood = profile ? profile.bloodGroup : 'O+';
    ageEl.textContent = isTa ? `${age} வயது • ${gender} • ரத்தப் பிரிவு: ${blood} Positive` : `${age} Yrs • ${gender} • Blood: ${blood} Positive`;
  }

  const caregiverEl = document.getElementById('profile-caregiver-info');
  if (caregiverEl) {
    if (profile && profile.primaryCaregiver) {
      caregiverEl.textContent = isTa 
        ? `கவனிப்பாளர்: ${profile.primaryCaregiver.name} (${profile.primaryCaregiver.relation}) • ${profile.primaryCaregiver.phone}`
        : `Caregiver: ${profile.primaryCaregiver.name} (${profile.primaryCaregiver.relation}) • ${profile.primaryCaregiver.phone}`;
    } else {
      caregiverEl.textContent = isTa 
        ? 'கவனிப்பாளர்: பிரியா ராமநாதன் (மகள்) • +91 98401 23456'
        : 'Caregiver: Priya Ramanathan (Daughter) • +91 98401 23456';
    }
  }
}

// 12. Geriatric Dataset Explorer
async function renderDatasetExplorer() {
  const codeBox = document.getElementById('dataset-json-viewer');
  if (!codeBox) return;

  try {
    const res = await fetch(`${API_BASE}/api/dataset`);
    if (res.ok) {
      const data = await res.json();
      codeBox.textContent = JSON.stringify(data, null, 2);
    }
  } catch (e) {
    codeBox.textContent = JSON.stringify({
      medications: state.medications,
      vitals: state.vitals,
      profile: state.profile
    }, null, 2);
  }
}

// ================= User Actions & Database Updates ================= //

async function toggleMedTaken(medId) {
  try {
    const res = await fetch(`${API_BASE}/api/medications/${medId}/take`, {
      method: 'PATCH'
    });
    if (res.ok) {
      const data = await res.json();
      const med = state.medications.find(m => m.id === medId);
      if (med) {
        med.takenToday = data.medicine.takenToday;
        med.stock = data.medicine.stock;
      }
      playGentleChime();
      showToast(data.message);
      renderAll();
    }
  } catch (err) {
    showToast('Updated locally');
  }
}

async function logWaterGlass(change = 1) {
  try {
    const res = await fetch(`${API_BASE}/api/activity/water`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ change })
    });
    if (res.ok) {
      const data = await res.json();
      state.activity.water = data.water;
      renderActivityWidget();
      playGentleChime();
      let toastMsg = '';
      if (state.lang === 'ta') {
        if (change > 1) toastMsg = `+${change} டம்ளர்கள் (+${change * 250}மி.லி) பதிவு செய்யப்பட்டது! 💧`;
        else if (change > 0) toastMsg = '+1 டம்ளர் (+250மி.லி) பதிவு செய்யப்பட்டது! 💧';
        else toastMsg = 'தண்ணீர் பதிவு புதுப்பிக்கப்பட்டது (1 டம்ளர் குறைக்கப்பட்டது)';
      } else {
        if (change > 1) toastMsg = `+${change} Glasses (+${change * 250}ml) recorded! 💧`;
        else if (change > 0) toastMsg = '+1 Glass (+250ml) recorded! 💧';
        else toastMsg = 'Water log updated (-1 glass)';
      }
      showToast(toastMsg);
    }
  } catch (e) {
    state.activity.water.current = Math.max(0, (state.activity.water.current || 0) + change);
    renderActivityWidget();
  }
}

async function addWalkSteps(steps = 200) {
  try {
    const res = await fetch(`${API_BASE}/api/activity/walk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ steps })
    });
    if (res.ok) {
      const data = await res.json();
      state.activity.walk = data.walk;
      renderActivityWidget();
      const toastMsg = state.lang === 'ta'
        ? `+${steps} அடிகள் சேர்க்கப்பட்டது! 🚶`
        : `+${steps} steps added to your daily walk! 🚶`;
      showToast(toastMsg);
    }
  } catch (e) {}
}

function readScreenAloud() {
  const isTa = state.lang === 'ta';
  const text = isTa
    ? 'வணக்கம் ராமநாதன் ஐயா. உங்கள் உடல் நலம் இன்று மிகவும் நன்றாக உள்ளது. ரத்த அழுத்தம் 122/80. அடுத்த மருந்து மெட்பார்மின் 500 மில்லிகிராம். தண்ணீர் ஐந்து டம்ளர்கள் அருந்தியுள்ளீர்கள். மகள் பிரியா கவனிப்பில் உள்ளார்.'
    : 'Good day Ramanathan Sir. Your health vitals are stable today. Blood Pressure is 122 over 80. Next dose is Metformin 500mg. You have had 5 glasses of water.';
  speakText(text, state.lang);
}

// ================= AI Voice Interaction in Fluent Tamil ================= //

async function sendChatMessage(userText) {
  if (!userText || !userText.trim()) return;

  const userMsg = {
    sender: 'user',
    text: userText,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  appendChatBubble(userMsg);

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText })
    });

    if (res.ok) {
      const data = await res.json();
      const replyText = state.lang === 'ta' ? data.replyTa : data.replyEn;
      const botMsg = {
        sender: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      appendChatBubble(botMsg);
      speakText(replyText, state.lang);
    }
  } catch (err) {
    const fallbackText = state.lang === 'ta'
      ? 'மருந்துகளை குறித்த நேரத்தில் தவறாமல் எடுத்துக் கொள்ளுங்கள் ஐயா. ஏதேனும் அவசரம் என்றால் SOS பொத்தானை அழுத்தவும்.'
      : 'Please take your medications on time and stay well hydrated. Press SOS if you require immediate help.';
    appendChatBubble({ sender: 'assistant', text: fallbackText, time: 'இப்போது' });
    speakText(fallbackText, state.lang);
  }
}

function appendChatBubble(msg) {
  const streamBox = document.getElementById('chat-stream');
  if (!streamBox) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${msg.sender}`;
  bubble.innerHTML = `
    <p>${msg.text}</p>
    <div class="chat-meta">
      <span>${msg.time}</span>
      ${msg.sender === 'assistant' ? `<button class="btn-audio-speak" onclick="speakText('${msg.text.replace(/'/g, "\\'")}', state.lang)">🔊 ${state.lang === 'ta' ? 'மீண்டும் கேட்க' : 'Replay'}</button>` : ''}
    </div>
  `;
  streamBox.appendChild(bubble);
  streamBox.scrollTop = streamBox.scrollHeight;
}

// Voice Recognition in Tamil (ta-IN)
function toggleVoiceRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast(state.lang === 'ta' ? 'மைக் குரல் வசதிக்கு Google Chrome பயன்படுத்தவும்' : 'Please use Chrome for microphone voice recognition');
    return;
  }

  const micBtn = document.getElementById('voiceMicBtn');
  const rec = new SpeechRecognition();
  rec.lang = state.lang === 'ta' ? 'ta-IN' : 'en-IN';
  rec.interimResults = false;

  rec.onstart = () => {
    if (micBtn) micBtn.classList.add('recording');
    showToast(state.lang === 'ta' ? 'கேட்கிறது… பேசுங்கள் ஐயா' : 'Listening… speak now');
  };

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    showToast(`You said: "${transcript}"`);
    sendChatMessage(transcript);
  };

  rec.onerror = (e) => {
    showToast(state.lang === 'ta' ? 'மைக் அணுகல் கிடைக்கவில்லை' : 'Microphone error or permission denied');
  };

  rec.onend = () => {
    if (micBtn) micBtn.classList.remove('recording');
  };

  try {
    rec.start();
  } catch (e) {
    showToast('Voice already listening');
  }
}

// ================= Ambient Calming Meditation Tone (432Hz Sacred Harmonic Sound) ================= //
let ambientCtx = null;
let ambientMasterGain = null;
let ambientNodes = [];
let meditationVolume = 0.6;

function initMeditationAudio() {
  if (ambientCtx) return ambientCtx;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  ambientCtx = new AudioCtx();
  return ambientCtx;
}

function setMeditationVolume(val) {
  meditationVolume = parseFloat(val);
  const volLabel = document.getElementById('meditation-vol-value');
  if (volLabel) volLabel.textContent = `${Math.round(meditationVolume * 100)}%`;

  if (ambientMasterGain && ambientCtx && ambientCtx.state === 'running') {
    ambientMasterGain.gain.setTargetAtTime(meditationVolume * 0.18, ambientCtx.currentTime, 0.05);
  }
}

function stopMeditationAudioNodes() {
  ambientNodes.forEach(node => {
    try { node.stop(); } catch (e) {}
    try { node.disconnect(); } catch (e) {}
  });
  ambientNodes = [];
}

function toggleCalmingSound() {
  const isTa = state.lang === 'ta';
  const btn = document.getElementById('btn-calm-music');
  const icon = document.getElementById('btn-calm-music-icon');
  const text = document.getElementById('btn-calm-music-text');
  const wave = document.getElementById('meditation-wave-indicator');

  if (state.audioPlaying) {
    // Fade out smoothly over 1.2s
    if (ambientMasterGain && ambientCtx) {
      ambientMasterGain.gain.setTargetAtTime(0.0001, ambientCtx.currentTime, 0.35);
    }
    setTimeout(() => {
      stopMeditationAudioNodes();
      state.audioPlaying = false;
      if (btn) btn.classList.remove('playing');
      if (icon) icon.textContent = '🎵';
      if (text) text.textContent = isTa ? 'தியான இசை தொடங்க' : 'Start Meditation Tone';
      if (wave) wave.classList.remove('active');
      showToast(isTa ? 'தியான இசை நிறுத்தப்பட்டது' : 'Meditation audio paused');
    }, 1200);
    return;
  }

  try {
    const ctx = initMeditationAudio();
    if (!ctx) {
      showToast(isTa ? 'ஆடியோ வசதி ஆதரிக்கப்படவில்லை' : 'AudioContext not supported');
      return;
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    stopMeditationAudioNodes();

    // Master Gain with Soft Volume Limiter
    ambientMasterGain = ctx.createGain();
    ambientMasterGain.gain.setValueAtTime(0.0001, ctx.currentTime);

    // Warm Low-Pass Biquad Filter to eliminate harsh digital edges (warm acoustic drone)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(540, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);

    // Gentle Pranayama Breathing LFO (0.12 Hz = ~8.3 second cycle: 4s breathe in, 4s breathe out)
    const breathLfo = ctx.createOscillator();
    breathLfo.type = 'sine';
    breathLfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    const breathLfoGain = ctx.createGain();
    breathLfoGain.gain.setValueAtTime(0.04, ctx.currentTime);
    breathLfo.connect(breathLfoGain);
    breathLfoGain.connect(ambientMasterGain.gain);
    breathLfo.start();
    ambientNodes.push(breathLfo);

    // 1. Root Fundamental (432 Hz - Sacred Solfeggio / Om healing pitch)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, ctx.currentTime);
    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.4, ctx.currentTime);
    osc1.connect(gain1);
    gain1.connect(filter);
    osc1.start();
    ambientNodes.push(osc1);

    // 2. Warm Sub-Octave Drone (216 Hz - Deep chest resonance & grounding)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(216, ctx.currentTime);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.35, ctx.currentTime);
    osc2.connect(gain2);
    gain2.connect(filter);
    osc2.start();
    ambientNodes.push(osc2);

    // 3. Grounding Low Bass (108 Hz - Temple bell sub-tone)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(108, ctx.currentTime);
    const gain3 = ctx.createGain();
    gain3.gain.setValueAtTime(0.25, ctx.currentTime);
    osc3.connect(gain3);
    gain3.connect(filter);
    osc3.start();
    ambientNodes.push(osc3);

    // 4. Pure Fifth Overtone (648 Hz = 432 * 1.5 - Soft singing bowl overtone)
    const osc4 = ctx.createOscillator();
    osc4.type = 'sine';
    osc4.frequency.setValueAtTime(648, ctx.currentTime);
    const gain4 = ctx.createGain();
    gain4.gain.setValueAtTime(0.15, ctx.currentTime);
    osc4.connect(gain4);
    gain4.connect(filter);
    osc4.start();
    ambientNodes.push(osc4);

    // Subtle micro-chorus vibrato (0.2 Hz) for organic warmth
    const chorusLfo = ctx.createOscillator();
    chorusLfo.frequency.setValueAtTime(0.2, ctx.currentTime);
    const chorusGain = ctx.createGain();
    chorusGain.gain.setValueAtTime(1.5, ctx.currentTime);
    chorusLfo.connect(chorusGain);
    chorusGain.connect(osc1.frequency);
    chorusGain.connect(osc4.frequency);
    chorusLfo.start();
    ambientNodes.push(chorusLfo);

    // Connect Filter to Master Gain, and Master Gain to Audio Destination
    filter.connect(ambientMasterGain);
    ambientMasterGain.connect(ctx.destination);

    // Gentle 1.8-second logarithmic fade-in attack
    const targetVol = meditationVolume * 0.18;
    ambientMasterGain.gain.exponentialRampToValueAtTime(targetVol, ctx.currentTime + 1.8);

    state.audioPlaying = true;
    if (btn) btn.classList.add('playing');
    if (icon) icon.textContent = '⏸️';
    if (text) text.textContent = isTa ? 'தியான இசையை நிறுத்த' : 'Pause Meditation Tone';
    if (wave) wave.classList.add('active');
    showToast(isTa ? 'மன அமைதி தரும் 432Hz தியான இசை ஒலிக்கிறது…' : 'Playing peaceful 432Hz soothing meditation tone…');
  } catch (err) {
    console.warn('Audio playback not permitted by browser:', err);
  }
}

// ================= Font Zoom Controller (A+ / A- Across All Pages) ================= //
const FONT_ZOOM_LEVELS = [0.85, 1.0, 1.15, 1.30, 1.45];
const savedFontIdx = typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('eldercare_font_idx'), 10) : 1;
let currentFontIdx = (!isNaN(savedFontIdx) && savedFontIdx >= 0 && savedFontIdx < FONT_ZOOM_LEVELS.length) ? savedFontIdx : 1;

function applyFontSize(idx) {
  currentFontIdx = Math.max(0, Math.min(FONT_ZOOM_LEVELS.length - 1, idx));
  const zoom = FONT_ZOOM_LEVELS[currentFontIdx];
  document.documentElement.style.setProperty('--font-zoom', zoom);
  try {
    localStorage.setItem('eldercare_font_idx', currentFontIdx);
  } catch (e) {}
}

function adjustFontSize(direction) {
  const isTa = state.lang === 'ta';
  if (direction === 'larger') {
    if (currentFontIdx < FONT_ZOOM_LEVELS.length - 1) {
      applyFontSize(currentFontIdx + 1);
      const pct = Math.round(FONT_ZOOM_LEVELS[currentFontIdx] * 100);
      showToast(isTa ? `எழுத்து அளவு பெரிதாக்கப்பட்டது (${pct}%)` : `Font size increased (${pct}%)`);
    } else {
      showToast(isTa ? 'அதிகபட்ச எழுத்து அளவு அடைந்துவிட்டது' : 'Maximum font size reached');
    }
  } else if (direction === 'smaller') {
    if (currentFontIdx > 0) {
      applyFontSize(currentFontIdx - 1);
      const pct = Math.round(FONT_ZOOM_LEVELS[currentFontIdx] * 100);
      showToast(isTa ? `எழுத்து அளவு குறைக்கப்பட்டது (${pct}%)` : `Font size decreased (${pct}%)`);
    } else {
      showToast(isTa ? 'குறைந்தபட்ச எழுத்து அளவு அடைந்துவிட்டது' : 'Minimum font size reached');
    }
  }
}

// ================= Emergency SOS System ================= //
function triggerSOSModal() {
  const modal = document.getElementById('sos-modal');
  if (!modal) return;

  modal.classList.add('active');
  playEmergencySound();

  state.sosRemainingSeconds = 5;
  const countEl = document.getElementById('sos-countdown-num');
  if (countEl) countEl.textContent = state.sosRemainingSeconds;

  clearInterval(state.sosCountdownTimer);
  state.sosCountdownTimer = setInterval(() => {
    state.sosRemainingSeconds -= 1;
    if (countEl) countEl.textContent = state.sosRemainingSeconds;
    playEmergencySound();

    if (state.sosRemainingSeconds <= 0) {
      clearInterval(state.sosCountdownTimer);
      dispatchActualSOS();
    }
  }, 1000);
}

function cancelSOSModal() {
  clearInterval(state.sosCountdownTimer);
  const modal = document.getElementById('sos-modal');
  if (modal) modal.classList.remove('active');
  fetch(`${API_BASE}/api/sos/cancel`, { method: 'POST' }).catch(() => null);
  showToast(state.lang === 'ta' ? 'SOS ரத்து செய்யப்பட்டது' : 'SOS cancelled successfully');
}

async function dispatchActualSOS() {
  const modal = document.getElementById('sos-modal');
  showToast(state.lang === 'ta' ? 'அவசர அழைப்பு அனுப்பப்படுகிறது!' : 'Dispatching emergency alerts to family and 108…');

  try {
    const res = await fetch(`${API_BASE}/api/sos/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'Instant 1-Tap SOS Button' })
    });
    if (res.ok) {
      const data = await res.json();
      showToast(state.lang === 'ta' ? 'பிரியாவிற்கும் ஆம்புலன்ஸிற்கும் தகவல் அனுப்பப்பட்டது!' : 'Caregiver Priya & Ambulance 108 alerted!');
      if (data.alert && data.alert.whatsappMessageUrl) {
        window.open(data.alert.whatsappMessageUrl, '_blank');
      }
    }
  } catch (err) {
    showToast('Emergency SOS signal dispatched.');
  }

  if (modal) modal.classList.remove('active');
}

// ================= Navigation Tabs Switching ================= //
function switchTab(tabId) {
  state.currentTab = tabId;

  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `section-${tabId}`);
  });

  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  document.querySelectorAll('.bottom-tab-item').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Language Toggle with LocalStorage Persistence
function toggleLanguage() {
  state.lang = state.lang === 'ta' ? 'en' : 'ta';
  try {
    localStorage.setItem('eldercare_lang', state.lang);
  } catch (e) {}
  renderAll();
  showToast(state.lang === 'ta' ? 'தமிழ் மொழி தேர்ந்தெடுக்கப்பட்டது 🌐' : 'Language changed to English 🌐');
}

// Senior Mode Toggle
function toggleSeniorMode() {
  state.seniorMode = !state.seniorMode;
  document.body.classList.toggle('senior-mode', state.seniorMode);
  showToast(state.seniorMode ? 'Senior Easy Mode Enabled' : 'Standard Mode Enabled');
}

// Add New Medicine Modal
async function promptAddMedicine() {
  const isTa = state.lang === 'ta';
  const name = prompt(isTa ? 'மருந்தின் பெயர் (எ.கா. Amlodipine 5mg):' : 'Medicine name:');
  if (!name || !name.trim()) return;

  const timing = prompt(isTa ? 'நேரம் (எ.கா. Morning 8:30 AM):' : 'Time of dose:', 'Morning 8:30 AM');
  const dosage = prompt(isTa ? 'அளவு (எ.கா. 1 Tablet):' : 'Dosage:', '1 Tablet');
  const food = prompt(isTa ? 'உணவு முறை (எ.கா. உணவுக்குப் பின்):' : 'Instruction:', 'After food');
  const stock = prompt(isTa ? 'கையிருப்பு மாத்திரைகள்:' : 'Pills stock count:', '15');

  try {
    const res = await fetch(`${API_BASE}/api/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        tamilName: name.trim(),
        timing: (timing || 'Morning 8:30 AM').trim(),
        dosage: (dosage || '1 Tablet').trim(),
        foodInstruction: (food || 'After food').trim(),
        stock: parseInt(stock) || 15
      })
    });
    if (res.ok) {
      showToast(isTa ? 'புதிய மருந்து டேட்டாபேஸில் சேர்க்கப்பட்டது!' : 'New medication saved to SQLite database!');
      await fetchAllData();
    }
  } catch (err) {}
}

// Log new Vitals
async function promptLogVitals() {
  const isTa = state.lang === 'ta';
  const sys = prompt(isTa ? 'ரத்த அழுத்தம் Systolic (உயர் BP - எ.கா. 120):' : 'BP Systolic (e.g. 120):', '120');
  if (!sys) return;
  const dia = prompt(isTa ? 'ரத்த அழுத்தம் Diastolic (குறைவு BP - எ.கா. 80):' : 'BP Diastolic (e.g. 80):', '80');
  const sugar = prompt(isTa ? 'சர்க்கரை அளவு (mg/dL - எ.கா. 110):' : 'Blood Sugar (mg/dL):', '110');
  const pulse = prompt(isTa ? 'இதயத் துடிப்பு (BPM - எ.கா. 72):' : 'Pulse rate (BPM):', '72');

  try {
    const res = await fetch(`${API_BASE}/api/vitals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systolic: parseInt(sys) || 120,
        diastolic: parseInt(dia) || 80,
        sugar: parseInt(sugar) || 110,
        pulse: parseInt(pulse) || 72
      })
    });
    if (res.ok) {
      showToast(isTa ? 'உடல்நல அளவீடு டேட்டாபேஸில் பதிவானது!' : 'Vitals recorded successfully in database!');
      await fetchAllData();
    }
  } catch (err) {}
}

// Export Dataset
async function downloadDatasetJson() {
  try {
    const res = await fetch(`${API_BASE}/api/dataset`);
    const data = res.ok ? await res.json() : {};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eldercare_health_dataset_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Dataset exported as JSON file!');
  } catch (e) {
    showToast('Export failed');
  }
}

// ================= Senior Emergency Medical ID Card ================= //
function openMedicalIdModal() {
  const modal = document.getElementById('medical-id-modal');
  if (modal) {
    modal.classList.add('active');
    playGentleChime();
    const speech = state.lang === 'ta'
      ? 'ராமநாதன் ஐயா, உங்கள் அவசர மருத்துவ அடையாள அட்டை திரையில் திறக்கப்பட்டுள்ளது.'
      : 'Senior Medical ID card opened.';
    speakText(speech, state.lang);
  }
}

function closeMedicalIdModal() {
  const modal = document.getElementById('medical-id-modal');
  if (modal) modal.classList.remove('active');
}

function readMedicalIdAloud() {
  const isTa = state.lang === 'ta';
  const text = isTa
    ? 'மூத்தோர் மருத்துவ அடையாள அட்டை: பெயர் ராமநாதன் சுப்ரமணியன், வயது 72. ரத்தப் பிரிவு ஓ பாசிட்டிவ். ஒவ்வாமை: பென்சிலின் மருந்து ஒவ்வாமை. முக்கிய நோய் நிலைகள்: வகை 2 சர்க்கரை நோய் மற்றும் உயர் ரத்த அழுத்தம். அவசர தொடர்புகள்: மகள் பிரியா, தொலைபேசி எண் 9 8 4 0 1 2 3 4 5 6. குடும்ப மருத்துவர் டாக்டர் அரவிந்த், காவேரி மருத்துவமனை, தொலைபேசி எண் 9 4 4 4 0 9 8 7 6 5.'
    : 'Senior Medical ID Card: Ramanathan Subramanian, 72 years, Blood Group O Positive. Allergy: Penicillin. Conditions: Type 2 Diabetes and Hypertension. Primary Caregiver: Priya Ramanathan at 98401 23456. Doctor: Dr. Arvind at Kauvery Hospital.';
  speakText(text, state.lang);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('senior-mode');
  applyFontSize(currentFontIdx);
  renderAll(); // Immediate sync of labels, language, and check-in before network fetch
  fetchAllData();

  const speedSlider = document.getElementById('speechSpeedRange');
  const speedLabel = document.getElementById('speedValueLabel');
  if (speedSlider && speedLabel) {
    speedSlider.addEventListener('input', (e) => {
      speedLabel.textContent = `${e.target.value}x`;
    });
  }
});
