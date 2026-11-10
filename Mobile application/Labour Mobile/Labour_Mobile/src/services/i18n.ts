export type LanguageCode = 'en' | 'si' | 'ta';

export interface Translations {
  // Navigation
  navJobs: string;
  navAlerts: string;
  navHistory: string;
  navProfile: string;

  // Header
  appTitle: string;
  onDuty: string;
  offDuty: string;
  syncLive: string;

  // Profile
  profileTitle: string;
  badgeCredentials: string;
  campusZonesAndLang: string;
  pushNotifications: string;
  pushDesc: string;
  emergencyRingtone: string;
  emergencyDesc: string;
  systemLogs: string;
  systemLogsDesc: string;
  endShift: string;
  endShiftConfirm: string;
  displayLanguage: string;
  statusEnabled: string;
  statusDisabled: string;
  hotlineTitle: string;

  // History & Filters
  historyTitle: string;
  allTrades: string;
  allPeriods: string;
  thisMonth: string;
  yesterday: string;
  earlier: string;
  viewDetails: string;
  viewWorkSlip: string;
  resetAll: string;
  searchPlaceholder: string;

  // Region / Language Screen
  regionTitle: string;
  regionDesc: string;
  assignedSectors: string;
  savePreferences: string;
  savedSuccess: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    navJobs: 'Jobs',
    navAlerts: 'Alerts',
    navHistory: 'History',
    navProfile: 'Profile',

    appTitle: 'SERVA TECHNICIAN',
    onDuty: 'On Duty',
    offDuty: 'Off Duty',
    syncLive: 'DB Synced',

    profileTitle: 'Officer Credentials',
    badgeCredentials: 'Edit Name, ID & Bay',
    campusZonesAndLang: 'Campus Zones & Language',
    pushNotifications: 'Push Notification Alerts',
    pushDesc: 'Dispatch orders & hazard alarms',
    emergencyRingtone: 'Emergency Ringtone Override',
    emergencyDesc: 'Bypasses silent mode for Tier 1 calls',
    systemLogs: 'System & Sync Logs',
    systemLogsDesc: 'Facility audit & connection logs',
    endShift: 'Sign Out / End Shift',
    endShiftConfirm: 'Confirm Shift End? Unassigned work logs will be archived to Bay 3.',
    displayLanguage: 'Display Language',
    statusEnabled: 'Enabled',
    statusDisabled: 'Disabled',
    hotlineTitle: 'Facilities Control Room',

    historyTitle: 'Work History & Audit Log',
    allTrades: 'All Trades',
    allPeriods: 'All Periods',
    thisMonth: 'This Month',
    yesterday: 'Yesterday',
    earlier: 'Earlier',
    viewDetails: 'View Details',
    viewWorkSlip: 'View Work Slip',
    resetAll: 'Reset All',
    searchPlaceholder: 'Search ticket (e.g. 8285), keyword...',

    regionTitle: 'Campus Region & Display Language',
    regionDesc: 'Configure assigned campus sectors and choose your preferred application language.',
    assignedSectors: 'Assigned Campus Sectors',
    savePreferences: 'Save Language & Zone Configuration',
    savedSuccess: 'Language preferences and campus zone settings saved successfully!',
  },

  si: {
    navJobs: 'කාර්යයන් (Jobs)',
    navAlerts: 'දැනුම්දීම් (Alerts)',
    navHistory: 'ඉතිහාසය (History)',
    navProfile: 'පැතිකඩ (Profile)',

    appTitle: 'සර්වා කාර්මික සේවාව',
    onDuty: 'රාජකාරියේ නියුතු',
    offDuty: 'රාජකාරියෙන් බැහැර',
    syncLive: 'සම්බන්ධිතයි',

    profileTitle: 'නිලධාරී තොරතුරු',
    badgeCredentials: 'නම, හැඳුනුම් අංකය සහ අංශය',
    campusZonesAndLang: 'මණ්ඩප කලාප සහ භාෂාව',
    pushNotifications: 'ක්ෂණික දැනුම්දීම් ඇඟවීම්',
    pushDesc: 'හදිසි පැවරුම් සහ උපද්‍රව ඇඟවීම්',
    emergencyRingtone: 'හදිසි නාද රටා අවලංගු කිරීම',
    emergencyDesc: 'හදිසි ඇමතුම් සඳහා නිහඬ ප්‍රකාරය මඟහරියි',
    systemLogs: 'පද්ධති සටහන් සහ සමමුහුර්තකරණය',
    systemLogsDesc: 'මධ්‍යම සේවා සටහන් සහ වාර්තා',
    endShift: 'වැඩ මුරය අවසන් කරන්න',
    endShiftConfirm: 'වැඩ මුරය අවසන් කිරීම තහවුරු කරන්නද? සටහන් සුරක්ෂිත කෙරේ.',
    displayLanguage: 'යෙදුම් භාෂාව (Display Language)',
    statusEnabled: 'සක්‍රියයි',
    statusDisabled: 'අක්‍රියයි',
    hotlineTitle: 'මධ්‍යම පහසුකම් පාලන මැදිරිය',

    historyTitle: 'කාර්ය ඉතිහාසය සහ විගණන ලේඛනය',
    allTrades: 'සියලු ක්ෂේත්‍ර',
    allPeriods: 'සියලු කාලසීමා',
    thisMonth: 'මෙම මාසය',
    yesterday: 'ඊයේ දිනය',
    earlier: 'පෙර සටහන්',
    viewDetails: 'විස්තර බලන්න',
    viewWorkSlip: 'වැඩ පත්‍රිකාව බලන්න',
    resetAll: 'නැවත සකසන්න',
    searchPlaceholder: 'ටිකට්පත් අංකය හෝ වචන සොයන්න...',

    regionTitle: 'මණ්ඩප කලාප සහ යෙදුම් භාෂාව',
    regionDesc: 'පැවරූ මණ්ඩප අංශ තෝරා යෙදුමේ භාෂාව සකසන්න.',
    assignedSectors: 'පැවරූ මණ්ඩප අංශ',
    savePreferences: 'භාෂාව සහ කලාප සැකසුම් සුරකින්න',
    savedSuccess: 'භාෂා මනාපයන් සහ කලාප සැකසුම් සාර්ථකව සුරකින ලදී!',
  },

  ta: {
    navJobs: 'பணிகள் (Jobs)',
    navAlerts: 'அறிவிப்புகள் (Alerts)',
    navHistory: 'வரலாறு (History)',
    navProfile: 'சுயவிவரம் (Profile)',

    appTitle: 'செர்வா தொழில்நுட்ப போர்ட்டல்',
    onDuty: 'பணியில் உள்ளார்',
    offDuty: 'பணியில் இல்லை',
    syncLive: 'இணைக்கப்பட்டது',

    profileTitle: 'அதிகாரி சான்றுகள்',
    badgeCredentials: 'பெயர், அடையாள எண் & பகுதி திருத்து',
    campusZonesAndLang: 'வளாக மண்டலங்கள் & மொழி',
    pushNotifications: 'அறிவிப்பு எச்சரிக்கைகள்',
    pushDesc: 'பணி ஆணைகள் மற்றும் அபாய எச்சரிக்கைகள்',
    emergencyRingtone: 'அவசர அழைப்பு ரிங்டோன் முன்னுரிமை',
    emergencyDesc: 'முக்கிய அழைப்புகளுக்கு அமைதி நிலையை மீறுகிறது',
    systemLogs: 'கணினி பதிவுகள் & ஒத்திசைவு',
    systemLogsDesc: 'பராமரிப்பு தணிக்கை மற்றும் இணைப்பு பதிவுகள்',
    endShift: 'வேலையை முடிக்கவும் / வெளியேறு',
    endShiftConfirm: 'ஷிப்ட் முடிவை உறுதிப்படுத்துகிறீர்களா?',
    displayLanguage: 'பயன்பாட்டு மொழி (Display Language)',
    statusEnabled: 'செயலில்',
    statusDisabled: 'முடக்கப்பட்டது',
    hotlineTitle: 'வசதிகள் கட்டுப்பாட்டு அறை',

    historyTitle: 'பணி வரலாறு மற்றும் தணிக்கை பதிவு',
    allTrades: 'அனைத்து தொழில்கள்',
    allPeriods: 'அனைத்து காலங்களும்',
    thisMonth: 'இந்த மாதம்',
    yesterday: 'நேற்று',
    earlier: 'முந்தைய பதிவுகள்',
    viewDetails: 'விவரங்களை காண்க',
    viewWorkSlip: 'பணி சீட்டை காண்க',
    resetAll: 'மீட்டமைக்க',
    searchPlaceholder: 'டிக்கெட் எண் அல்லது தேடல் சொல்...',

    regionTitle: 'வளாக மண்டலம் & பயன்பாட்டு மொழி',
    regionDesc: 'ஒதுக்கப்பட்ட வளாக பகுதிகள் மற்றும் விரும்பிய மொழியை தேர்வு செய்யவும்.',
    assignedSectors: 'ஒதுக்கப்பட்ட வளாக பிரிவுகள்',
    savePreferences: 'மொழி மற்றும் மண்டலத்தை சேமிக்க',
    savedSuccess: 'மொழி விருப்பத்தேர்வுகள் வெற்றிகரமாக சேமிக்கப்பட்டன!',
  },
};

export const getTranslation = (lang?: LanguageCode): Translations => {
  if (lang && translations[lang]) {
    return translations[lang];
  }
  return translations.en;
};
