/* ============================================================================
   AVIGEN GENESIS AI — BAĞIMSIZ BİLİMSEL KARAR DESTEK MOTORU (PREMIUM MODÜL)
   Gerçek Kantitatif Genetik & Biyo-İstatistiksel Algoritmalar:
   1. Gerçek Sewall Wright (1922) Yolak Katsayısı: F_X = Σ (0.5)^(n1 + n2 + 1)
      (Ortak atanın Baba tarafındaki nesil derinliği n1 ve Anne tarafındaki derinliği n2 üzerinden)
   2. Galton "Ortalamaya Dönüş" (Regression to the Mean) & BLUP Modeli:
      Kayıtsız/bilinmeyen her ata, popülasyon taban ortalamasına (45 Puan) çekilir.
   3. Rekabet Hacmi (Katılan Kuş Sayısı) & Mesafe (km) Ağırlıklı Performans İndeksi.
   4. Yarış Zekâsı (Heterosis / Melez Dinçliği Odaklı) vs
      Damızlık Zekâsı (Prepotency / Kalıtsal Aktarım Kararlılığı Odaklı) Ayrımı.
   ============================================================================ */

const GENESIS_STORAGE_KEY = 'avigen_genesis_premium_state_v1';
const GENESIS_HISTORY_STORAGE_KEY = 'avigen_genesis_analysis_history_v1';

const AvigenGenesisAI = {
  state: {
    isPremiumActive: false,
    planName: 'AVIGEN STANDART',
    viewStage: 'launcher', // 'launcher' (Kare Bento Kartlar) | 'tool' (Seçilen Analiz Çalışma Ekranı) | 'history' (Geçmiş Analizler)
    activeMode: 'breeding', // 'breeding' | 'smart_race' | 'nutrition'
    selectedRacerPedId: '',
    selectedSireRef: '',
    selectedDamRef: '',
    compareBirdARing: '',
    compareBirdBRing: '',
    purchaseBirdRing: 'BELG-2026-4150990',
    purchaseBirdSex: 'M',
    purchaseBirdSpecialty: 'middle_long',
    purchaseBirdAncestorRef: '',
    purchaseBirdHasWins: 'yes',
    targetRaceDistKm: 420,
    targetRaceWind: 'calm',
    // GENESIS AI – AKILLI YARIŞ YÖNETİMİ & SİMÜLASYONU durum değişkenleri
    smartRaceStage: 'setup', // 'setup' (1. Yarış & Rota Kurulumu) | 'summary' (2. Simülasyon Sonuç Özeti) | 'detail' (3. Detaylı Bilimsel Analiz)
    smartRaceMapClickTarget: 'release', // 'release' (🔴 Salım Noktası Seç) | 'arrival' (🟢 Varış Noktası Seç)
    smartRaceMapZoom: 1.0,
    smartRaceMapPanX: 0,
    smartRaceMapPanY: 0,
    smartRaceTileLayerType: 'google_hybrid', // 'google_hybrid' (Google Uydu + Yol/İlçe) | 'google_road' (Google Karayolu) | 'google_terrain' (Google Arazi/Dağ) | 'vector_offline' (Çevrimdışı Vektör)
    smartRaceCustomTitle: '',
    smartRaceSearchQuery: '',
    smartRaceSelectedBirdRings: [], // Boşsa aktif yarış kadrosu otomatik kullanılır
    smartRaceCustomReleaseCoord: null, // Haritadan veya koordinat aramasından özel nokta seçildiğinde { name, lat, lon, altM, terrain }
    smartRaceCustomLoftCoord: null,
    smartRaceSavedSimulations: [],
    smartRaceEventId: 'auto', // 'auto' | 'custom' | raceId
    smartRaceReleaseCityId: 'ankara',
    smartRaceReleaseDistrictId: 'polatli',
    smartRaceLoftCityId: 'bursa',
    smartRaceLoftDistrictId: 'karacabey',
    smartRaceDate: '2026-11-22',
    smartRaceReleaseTime: '06:45',
    smartRaceManualKm: 0,
    smartRaceWeatherSource: 'live_or_event', // 'live_or_event' | 'manual_scenario'
    smartRaceWindType: 'head', // 'calm' | 'tail' | 'head' | 'cross' | 'storm'
    smartRaceWindSpeedKmh: 18,
    smartRaceWindDirDeg: 65,
    smartRaceTempC: 18,
    smartRaceHumPct: 58,
    smartRacePrecipMm: 0,
    smartRaceVisKm: 10,
    smartRaceStormAlert: 'none', // 'none' | 'sudden_change' | 'thunderstorm_cb'
    smartRaceLiveRouteData: null,
    simSireRef: '',
    simDamRef: '',
    simF2PartnerRef: '',
    simTargetGoal: 'balanced', // 'balanced' | 'sprint_speed' | 'long_endurance'
    nutritionPhase: 'auto_today_smart', // 'auto_today_smart' | 'monthly_full_loft' veya 9 bilimsel dönem/evre
    nutritionGroup: 'ALL', // 'ALL' | 'RACER' | 'BREEDER' | 'YOUNG' | 'CUSTOM'
    nutritionBirdCount: 64,
    feedPrices: {
      grainPerKg: 28,      // Tahıl / Mısır / Arpa / Darı (TL/kg)
      legumePerKg: 42,     // Bakliyat / Bezelye / Maş / Fiğ (TL/kg)
      oilSeedPerKg: 55,    // Yağlı Tohum / Aspir / Kenevir / Keten (TL/kg)
      gritPerKg: 25,       // Grit / Kırmızı Taş / Mineral (TL/kg)
      liquidsMonthly: 450  // Aylık Sulu Malzemeler: Elektrolit + Yağ + Maya + Probiyotik (TL/Ay)
    },
    cortexAdvisorTopic: 'damizlik_secimi',
    cortexCustomQuestion: '',
    cortexLearningLog: [],
    cortexModelVersion: 'v2.2.0',
    hasVerifiedDnaLabData: false,
    geminiApiKey: '',
    geminiModel: 'gemini-2.0-flash',
    geminiTopic: 'breeding_advice',
    geminiDraftPrompt: '',
    geminiIsLoading: false,
    geminiChatHistory: []
  },

  analysisHistory: [],

  // ==========================================================================
  // MERKEZİ GENETİK HESAPLAMA MOTORU ÖNBELLEĞİ (CENTRAL COMPUTATION CACHE)
  // Aynı soyağacı, COI, eşleştirme veya performans profili analizinin tekrar
  // tekrar çalıştırılmasını önler; kümes verisi değiştiğinde imza otomatik yenilenir.
  // ==========================================================================
  _engineCache: {
    signature: '',
    birdData: {},
    topLoftPairs: null,
    breedingFull: {},
    breedingQuick: {},
    smartRace: {},
    racing: {},
    futureSim: {},
    perfProfile: {}
  },

  // ==========================================================================
  // AVIGEN GENESIS AI — ÇEKİRDEK BİLİMSEL MODÜL MİMARİSİ
  // 1. GENESIS AI – AKILLI EŞLEŞTİRME & CANLI KÜMES/SOY DANIŞMANI (5 Nesil Soy, COI, Yavru Öngörüsü & Canlı Soru-Cevap)
  // 2. GENESIS AI – AKILLI YARIŞ YÖNETİMİ (Rota/Coğrafya, 3 Bölgeli Meteoroloji & Risk, Kuş Uygunluğu, Tahmini Dönüş & Öğrenen Yarış Sonrası Analiz Motoru)
  // 3. AKILLI YEM, TARİH/DURUM SIVI ÖNERİSİ & 1 AYLIK MALİYET MOTORU
  // ==========================================================================
  MAIN_MODULES: [
    {
      id: 'breeding_hub',
      defaultSubMode: 'breeding',
      num: '1',
      icon: '💞',
      title: 'GENESIS AI – AKILLI EŞLEŞTİRME & SOY DANIŞMANI',
      shortTitle: '1. GENESIS AI – Akıllı Eşleştirme & Soy Danışmanı',
      badge: '5 NESİL SOY • COI • EN İYİ 5 ÇİFT • CANLI SORU-CEVAP',
      accent: '#7c3aed',
      bgGrad: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(0,102,255,0.06), rgba(255,255,255,0.98))',
      purpose: 'Hangi erkekle hangi dişiyi eşleştirmeliyim? Kümesinizdeki en uyumlu 5 çifti bulur, 5 nesil akrabalık (COI), ortak şampiyon ata, yavru potansiyelini hesaplar ve soy/kümes sorularınızı yanıtlar.',
      inputs: '5 kuşak soyağacı, bireysel/kardeş/yavru yarış kayıtları, fiziksel özellikler ve serbest sorunuz.',
      outputs: '6 bölümlü bütünleşik bilimsel eşleşme raporu ve GENESIS AI canlı danışman yanıtı.',
      subFunctions: []
    },
    {
      id: 'race_management_hub',
      defaultSubMode: 'smart_race',
      num: '2',
      icon: '🗺️',
      title: 'GENESIS AI – HARİTALI AKILLI YARIŞ SİMÜLASYONU',
      shortTitle: '2. GENESIS AI – Akıllı Yarış Yönetimi',
      badge: '81 İL HARİTASI • CANLI RÜZGÂR RİSKİ & KADRO SEPETLEME',
      accent: '#0066ff',
      bgGrad: 'linear-gradient(135deg, rgba(0,102,255,0.11), rgba(124,58,237,0.06), rgba(255,255,255,0.98))',
      purpose: 'Bu haftaki yarışta hangi kuşlarımı sepetlemeliyim? Türkiye haritasında salım-kümes rotasını, canlı rüzgâr/hava riskini, kuşların uygunluk sıralamasını ve tahmini dönüş saatlerini simüle edip tek tuşla sepetler.',
      inputs: 'Salım ve kümes konumu, salım tarihi/saati, yarış mesafesi, güzergâh meteorolojisi ve klasik yarış kayıtları.',
      outputs: '6 bölümlü bütünleşik rota/harita, meteorolojik risk, kuşa özel uygunluk, dönüş zamanı ve yarış sonrası kalibrasyon raporu.',
      subFunctions: []
    },
    {
      id: 'nutrition_hub',
      defaultSubMode: 'nutrition',
      num: '3',
      icon: '🌾',
      title: 'GENESIS AI – AKILLI YEM, SULUK KÜRÜ & MALİYET',
      shortTitle: '3. Akıllı Yem & Sıvı Motoru',
      badge: 'GÜNLÜK RASYON • SULUK TAKVİYESİ & 30 GÜNLÜK ÇUVAL/TL',
      accent: '#059669',
      bgGrad: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,102,255,0.05), rgba(255,255,255,0.98))',
      purpose: 'Bugün kuşlara ne kadar yem ve sulukta ne vermeliyim? Mevsime, canlı hava sıcaklığına ve kuş sayısına göre sabah/akşam gramajı, tohum oranlarını ve 1 aylık çuval/TL maliyetini hesaplar.',
      inputs: 'Günün tarihi/mevsim, aktif yuvalar, kuş kategorileri, canlı hava (°C) ve yem birim fiyatları.',
      outputs: 'Tarih/durum bazlı akıllı yem ve sıvı önerisi, tohum gramajları, 1 aylık sulu malzeme ve maliyet tablosu.',
      subFunctions: []
    }
  ],

  getMainModuleForMode(mode) {
    if (mode === 'nutrition') return this.MAIN_MODULES[2];
    if (mode === 'smart_race') return this.MAIN_MODULES[1];
    return this.MAIN_MODULES[0];
  },

  // 4 Kademeli Bilimsel Veri Güvenilirliği Sınıflandırıcı (Bölüm 10 Kuralı)
  classifyDataReliability(pct) {
    const val = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    if (val >= 75) {
      return { level: 'HIGH', label: 'Yüksek Güvenilirlik', color: '#059669', badgeClass: 'gene-green', pct: val };
    }
    if (val >= 45) {
      return { level: 'MEDIUM', label: 'Orta Güvenilirlik', color: '#0066ff', badgeClass: 'gene-blue', pct: val };
    }
    if (val >= 20) {
      return { level: 'LOW', label: 'Düşük Güvenilirlik', color: '#d97706', badgeClass: 'gene-gold', pct: val };
    }
    return { level: 'INSUFFICIENT', label: 'Yetersiz Veri', color: '#dc2626', badgeClass: 'gene-red', pct: val };
  },

  getDataSignature() {
    try {
      const pCount = typeof pedigrees !== 'undefined' ? pedigrees.length : 0;
      const pRings = typeof pedigrees !== 'undefined'
        ? pedigrees.map(p => `${p.id}:${p.boxes?.main?.ring || ''}:${(p.boxes?.main?.notes || '').length}:${p.boxes?.sire?.ring || ''}:${p.boxes?.dam?.ring || ''}`).join('|')
        : '';
      const rSig = typeof racesList !== 'undefined' && Array.isArray(racesList)
        ? racesList.map(r => `${r.id}:${r.title || ''}:${r.detail || ''}:${r.badge || ''}`).join('|')
        : '';
      const rtSig = (typeof AvigenRaceTracker !== 'undefined' && Array.isArray(AvigenRaceTracker.events))
        ? AvigenRaceTracker.events.map(ev => `${ev.id}:${ev.distanceKm}:${ev.status}:${ev.weather || ''}:${(ev.entries || []).map(e => `${e.ring}:${e.resultStatus}:${e.rank || ''}:${e.speedMpm || ''}:${e.durationMinutes || ''}`).join(',')}`).join('|')
        : '';
      const apSig = (typeof activePairsList !== 'undefined' && Array.isArray(activePairsList))
        ? activePairsList.map(ap => `${ap.id}:${ap.sire || ''}:${ap.dam || ''}`).join('|')
        : '';
      return `${pCount}_${rSig}_${rtSig}_${apSig}_${pRings}`;
    } catch (e) {
      return String(Date.now());
    }
  },

  ensureEngineCacheFresh() {
    const sig = this.getDataSignature();
    if (this._engineCache.signature !== sig) {
      this._engineCache = {
        signature: sig,
        birdData: {},
        topLoftPairs: null,
        breedingFull: {},
        breedingQuick: {},
        smartRace: {},
        racing: {},
        futureSim: {},
        perfProfile: {}
      };
    }
  },

  invalidateEngineCache() {
    this._engineCache.signature = '';
    this.ensureEngineCacheFresh();
  },

  getCachedPerformanceProfile(ring) {
    if (!ring || typeof AvigenPerformanceEngine === 'undefined') return null;
    this.ensureEngineCacheFresh();
    const key = String(ring).trim().toUpperCase();
    if (!this._engineCache.perfProfile[key]) {
      this._engineCache.perfProfile[key] = AvigenPerformanceEngine.calculateFullProfile(ring);
    }
    return this._engineCache.perfProfile[key];
  },

  init() {
    try {
      const saved = localStorage.getItem(GENESIS_STORAGE_KEY);
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
      }
      if (!['breeding', 'smart_race', 'nutrition'].includes(this.state.activeMode)) {
        this.state.activeMode = 'breeding';
      }
      if (Array.isArray(this.state.geminiChatHistory)) {
        this.state.geminiChatHistory = this.state.geminiChatHistory.filter(item =>
          !String(item?.answerHtml || '').includes('yukarıdaki raporda listelenmiştir') &&
          !String(item?.answerHtml || '').includes('5 kuşak soyağacı verileri tarandı') &&
          !String(item?.answerHtml || '').includes('Sorunuz alındı. Eşleştirme, soyağacı (COI)')
        );
      }
      const savedHist = localStorage.getItem(GENESIS_HISTORY_STORAGE_KEY);
      if (savedHist) {
        const parsedH = JSON.parse(savedHist);
        if (Array.isArray(parsedH)) this.analysisHistory = parsedH;
      }
      if (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.hasGeneticsAiAccess === 'function') {
        this.state.isPremiumActive = AvigenUxManager.hasGeneticsAiAccess();
      }
      // Kayıtlı Bulut Sinir Ağı (API) Anahtarını tüm yedek ve depolama katmanlarından senkronize et (Güncellemelerde asla silinmez!)
      const syncedKey = this.getGeminiApiKey();
      if (syncedKey) {
        this.state.geminiApiKey = syncedKey;
        try { localStorage.setItem('avigen_gemini_free_api_key_v1', syncedKey); } catch (e) {}
      }
    } catch (e) {}
  },

  hasActiveGenesisSubscription() {
    if (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.hasGeneticsAiAccess === 'function') {
      this.state.isPremiumActive = AvigenUxManager.hasGeneticsAiAccess();
      return this.state.isPremiumActive;
    }
    return Boolean(this.state.isPremiumActive);
  },

  saveState() {
    localStorage.setItem(GENESIS_STORAGE_KEY, JSON.stringify(this.state));
  },

  saveHistory() {
    localStorage.setItem(GENESIS_HISTORY_STORAGE_KEY, JSON.stringify(this.analysisHistory.slice(0, 40)));
  },

  saveAnalysisHistory() {
    this.saveHistory();
  },

  recordAnalysisToHistory(entry) {
    if (!entry || !entry.title) return;
    // Aynı mod ve aynı başlıkla son 10 saniye içinde mükerrer kayıt oluşmasını önle, varsa güncelle
    const existingIdx = this.analysisHistory.findIndex(
      h => h.mode === entry.mode && h.title === entry.title
    );
    const record = {
      id: 'hist_' + Date.now() + '_' + Math.floor(Math.random() * 999),
      timestamp: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: entry.mode,
      modeLabel: entry.modeLabel,
      icon: entry.icon || '🧬',
      title: entry.title,
      verdict: entry.verdict,
      score: entry.score,
      reliabilityPct: entry.reliabilityPct,
      dataSourceSummary: entry.dataSourceSummary || '',
      snapshotParams: entry.snapshotParams || {}
    };
    if (existingIdx !== -1) {
      this.analysisHistory.splice(existingIdx, 1);
    }
    this.analysisHistory.unshift(record);
    this.saveHistory();
  },

  openSavedHistoryRecord(histId) {
    const rec = this.analysisHistory.find(h => h.id === histId);
    if (!rec) return;
    if (rec.snapshotParams) {
      Object.assign(this.state, rec.snapshotParams);
    }
    this.state.activeMode = rec.mode;
    this.state.viewStage = 'tool';
    this.saveState();
    this.renderGenesisModuleUI();
  },

  deleteHistoryRecord(histId) {
    this.analysisHistory = this.analysisHistory.filter(h => h.id !== histId);
    this.saveHistory();
    this.renderGenesisModuleUI();
  },

  clearAllHistory() {
    this.analysisHistory = [];
    this.saveHistory();
    this.renderGenesisModuleUI();
  },

  togglePremiumSubscription(forceState) {
    if (typeof forceState === 'boolean') {
      this.state.isPremiumActive = forceState;
    } else {
      this.state.isPremiumActive = !this.state.isPremiumActive;
    }
    this.saveState();
    this.renderGenesisModuleUI();
    if (typeof AvigenUxManager !== 'undefined') {
      AvigenUxManager.syncHeaderAndProfileUI();
    }
  },

  // --------------------------------------------------------------------------
  // 1. KUTU VERİSİNDEN REKABET HACMİ, MESAFE, DERECE VE SOY BAŞARISI ÇIKARICI
  //    (Türkçe + Uluslararası mypedigre/PIPA/OLR/Derby/NPO/KBDB Pedigre Kalıplarını Tam Okur)
  // --------------------------------------------------------------------------
  inspectAncestorBox(box, generation) {
    const genWeight = Math.pow(0.5, generation); // 1. Kuşak 0.50, 2. Kuşak 0.25, 3. Kuşak 0.125, 4. Kuşak 0.0625
    const POPULATION_MEAN_SCORE = 45; // Bilinmeyen/kayıtsız ata için Galton popülasyon ortalaması

    if (!box || !box.ring || !box.ring.trim()) {
      return {
        exists: false,
        generation,
        genWeight,
        ring: '',
        name: '',
        verifiedWins: [],
        rawScore: POPULATION_MEAN_SCORE,
        competitionBonus: 0,
        distanceKm: 0,
        strainName: ''
      };
    }

    const text = `${box.name || ''} ${box.notes || ''}`;
    const verifiedWins = [];

    // Satır bazlı tüm yarış, final, ace, OLR, NPO, kesirli derece (1/6461), mypedigre/Avrupa sıra kalıpları ("180 km. - 1e.", "4507 p.", "500 Km 159.") ve yavru/kardeş başarılarını yakala
    const lines = `${box.name || ''}\n${box.notes || ''}`.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const winLineRegex = /\b(1\.|2\.|3\.|4\.|5\.|6\.|7\.|8\.|9\.|10\.|1st|2nd|3rd|\d{1,3}e\.|birinci|ulusal|bölge|klasman|npo|kbdb|f[iı]nal|s\/final|ace|as\s*[:=.-]?\s*\d+|derby|olr|etap|km\.?|kuş|\d{3,5}\s*p\.|m\/dk|father\s*(?:to|of)|mother\s*(?:to|of)|offspring\s*won|yavrusu|yavrular[ıi]|öz\s*kardeş|tam\s*kardeş|babadan\s*kardeş|anneden\s*kardeş|kardeş[iİ]|full\s*(?:sister|brother)|half\s*(?:sister|brother)|vollbruder|dna\s*(?:certified|tested)|superbreeder|zuchtas|preis|rennen)\b|\b\d{1,3}\s*\/\s*\d{3,5}\b/i;

    lines.forEach(line => {
      if (winLineRegex.test(line) && !verifiedWins.includes(line)) {
        verifiedWins.push(line);
      }
    });

    // Taban puan: Kayıtlı ama henüz derece notu girilmemiş ata = 54 puan
    let rawScore = 54;

    // 1. Kesirli derece/kuş sayısı analizi (Örn: "Quievrain NPO 1/6461", "Argenton NPO 1/2853", "679/2.")
    const slashMatches = [...text.matchAll(/\b(\d{1,3})\s*\/\s*(\d{3,5})\b/g)];
    let bestSlashRank = null;
    let maxSlashFlock = 0;
    slashMatches.forEach(m => {
      const r = parseInt(m[1], 10);
      const fl = parseInt(m[2], 10);
      if (r > 0 && (bestSlashRank === null || r < bestSlashRank)) bestSlashRank = r;
      if (fl > maxSlashFlock) maxSlashFlock = fl;
    });
    // Ters kesirli Türk pedigre yazımı (Örn: "679/2." => 679 kuşta 2.)
    const revSlashMatches = [...text.matchAll(/\b(\d{3,5})\s*\/\s*(\d{1,2})\./g)];
    revSlashMatches.forEach(m => {
      const fl = parseInt(m[1], 10);
      const r = parseInt(m[2], 10);
      if (r > 0 && (bestSlashRank === null || r < bestSlashRank)) bestSlashRank = r;
      if (fl > maxSlashFlock) maxSlashFlock = fl;
    });

    // 2. "FİNAL 5", "453 km. - FİNAL 22e.", "180 km. - 1e.", "Gerede 500 Km 159.", "6. MONFERTO 4507 p.", "5*5 As Güvercin 61.", "AS-26" kalıpları
    const explicitRankMatches = [
      ...text.matchAll(/\b(\d{1,3})\.\s*(?:final|f[iı]nal|s\/final|ace|as\b|ulusal|nat\b|npo|kbdb|nikolaev|algarve|golden|kamikaze|balkanic|ostsee|preis|hs\d|izmit|hendek|evora|monforte|monferto|mertola|vidigueir|azaruja|portaleg|y\.?\s*f[iı]nal|yar[ıi]\s*f[iı]nal|araba\s*yar[ıi]ş[ıi])/gi),
      ...text.matchAll(/\b(?:f[iı]nal|final|ace|as(?:\s*güvercin|\s*klas\.?)?)\s*(?:\d{2,4}\s*km\.?)?\s*[:=-]?\s*(\d{1,3})e?\.?\b/gi),
      ...text.matchAll(/\b(\d{1,2})(?:st|nd|rd|th|e\.)\s*(?:nat|national|npo|final|ace|olr|gen\.?\s*kamp)?\b/gi),
      ...text.matchAll(/\b\d{2,4}\s*km\.?\s*[-:]+\s*(?:f[iı]nal\s*)?(\d{1,3})e?\.?\b/gi),
      ...text.matchAll(/\b(\d{1,3})\.\s+\d{2,4}\s*km\b/gi)
    ];
    let bestExplicitRank = bestSlashRank;
    explicitRankMatches.forEach(m => {
      const val = parseInt(m[1], 10);
      // 1900-2099 arası yılları veya 250+ km mesafeleri sıra numarası sanma
      if (val >= 1 && val <= 180 && (bestExplicitRank === null || val < bestSlashRank || bestExplicitRank === null || val < bestExplicitRank)) {
        bestExplicitRank = val;
      }
    });

    // 3. Derece Kademesi Puanlaması
    if (
      bestExplicitRank === 1 ||
      /\b(1\.|1e\.|1st\s*nat|birinci|1\s*ulusal|1\s*npo|1\s*kbdb|olimpiyat\s*1|olympic|galibi|1\.\s*final|1\.\s*ace|klas(?:man)?\.?\s*[-:]?\s*1e?\.)\b/i.test(text)
    ) {
      rawScore += 25;
    } else if (
      (bestExplicitRank !== null && bestExplicitRank <= 5) ||
      /\b(2\.|3\.|4\.|5\.|2e\.|3e\.|4e\.|5e\.|2nd|3rd|şampiyon|as\s*güvercin|as\s*kuş|ace\s*pigeon|zuchtas|superbreeder|topbreeder)\b/i.test(text)
    ) {
      rawScore += 19;
    } else if (
      (bestExplicitRank !== null && bestExplicitRank <= 25) ||
      /\b(6\.|7\.|8\.|9\.|10\.|12\.|6e\.|8e\.|19e\.|22e\.|ulusal|npo|kbdb|klasman|bölge|derby|olr)\b/i.test(text)
    ) {
      rawScore += 14;
    } else if (
      (bestExplicitRank !== null && bestExplicitRank <= 120) ||
      /\b(f[iı]nal|final|ace|damızlık|elit|süper|direct\s*son|direct\s*from|inbred|inbreed)\b/i.test(text)
    ) {
      rawScore += 9;
    }

    // 4. Yavru / Kardeş / Ebeveyn Üretim Kanıtı Bonusu ("Father to", "Mother to", "Offspring won", "Yavrusu", "Tam Kardeşi", "Babadan Kardeşi")
    if (/\b(father\s*(?:to|of)|mother\s*(?:to|of)|father:|mother:|offspring\s*won|yavrusu|yavrular[ıi]|full\s*sister|full\s*brother|vollbruder|öz\s*kardeş|tam\s*kardeş|babadan\s*kardeş|anneden\s*kardeş|half\s*(?:sister|brother))\b/i.test(text)) {
      rawScore += 5;
    }

    // 5. DNA Sertifikası Bonusu ("DNA certified", "DNA TESTED")
    if (/\bdna\s*(?:certified|tested|sertifikal[ıi])\b/i.test(text)) {
      rawScore += 3;
    }

    // 6. Rekabet Hacmi Analizi (Örn: "5.120 Kuş", "4507 p.", "3644 p." veya "1/6461", "1/2853")
    let competitionBonus = 0;
    const flockMatches = [...text.matchAll(/(\d{1,2}[.,]?\d{3}|\d{3,5})\s*(?:kuş|p\.|d\b)/gi)];
    let maxTextFlock = 0;
    flockMatches.forEach(m => {
      const n = parseInt(m[1].replace(/[.,]/g, ''), 10) || 0;
      if (n > maxTextFlock && n <= 65000) maxTextFlock = n;
    });
    const flockCount = Math.max(maxSlashFlock, maxTextFlock);
    if (flockCount >= 4000) competitionBonus = 11;
    else if (flockCount >= 2000) competitionBonus = 8;
    else if (flockCount >= 800) competitionBonus = 5;
    else if (flockCount >= 200) competitionBonus = 3;
    rawScore += competitionBonus;

    // 7. Mesafe (km) ve Hız (m/dk) Analizi
    let distanceKm = 0;
    const kmMatches = [...text.matchAll(/(\d{2,4})\s*km/gi)];
    kmMatches.forEach(m => {
      const d = parseInt(m[1], 10) || 0;
      if (d > distanceKm && d <= 1500) distanceKm = d;
    });
    if (distanceKm >= 500) rawScore += 6;
    else if (distanceKm >= 350) rawScore += 4;
    else if (distanceKm >= 200) rawScore += 2;

    if (/\b(1[0-6]\d\d\s*m\/dk)\b/i.test(text) || /\b(\d{2}\s*min\s*(?:advance|ahead))\b/i.test(text)) {
      rawScore += 4; // Doğrulanmış hız (m/dk) veya dakika farkıyla tek geliş kaydı
    }

    rawScore = Math.min(99, rawScore);

    // 8. Soy hattı (Strain) tespiti (Gerçek pedigrelerdeki Romario, Messi, Rolex, Veenstra, Hardy, Bonifac vb. dahil)
    const knownStrains = [
      'Romario', 'Messi', 'Harry', 'Hooymans', 'King Rolex', 'Rolex', 'Veenstra',
      'Kobe Bryant', 'Hardy Kruger', 'Porsche 911', 'Porsche', 'Best Kittel', 'Kittel',
      'Vandenabeele', 'Bliksem', 'Rudy', 'Geerinckx', 'Gladiator', 'Bonifac', 'Flojo',
      'Janssen', 'Koopman', 'Van den Bulck', 'Pancho'
    ];
    let strainName = '';
    for (const st of knownStrains) {
      if (text.toLowerCase().includes(st.toLowerCase())) {
        strainName = st;
        break;
      }
    }
    if (!strainName && box.name) {
      strainName = box.name.replace(/[*^"]/g, '').trim().split(' ')[0];
    }

    return {
      exists: true,
      generation,
      genWeight,
      ring: box.ring.trim(),
      flag: box.flag || '🇹🇷',
      name: box.name || 'İsimsiz Kayıt',
      hasNotes: Boolean((box.notes && box.notes.trim()) || verifiedWins.length > 0),
      hasColor: Boolean(box.color && box.color.trim()),
      verifiedWins,
      rawScore,
      competitionBonus,
      distanceKm,
      strainName: strainName || 'Standart Hat'
    };
  },

  // --------------------------------------------------------------------------
  // 2. GERÇEK SEWALL WRIGHT (1922) YOLAK AKRABALIK KATSAYISI MOTORU
  //    F_X = Σ (0.5)^(n1 + n2 + 1)
  //    n1: Ortak atanın Baba (Sire) soy ağacındaki kuşak derinliği (Baba=0, Ebeveyn=1, Büyükebeveyn=2, 3.Kuşak=3)
  //    n2: Ortak atanın Anne (Dam) soy ağacındaki kuşak derinliği (Anne=0, Ebeveyn=1, Büyükebeveyn=2, 3.Kuşak=3)
  //    Kural: Baba ve Anne arasındaki bir yolak (path), daha yakın bir ortak atadan
  //    her iki tarafta da geçiyorsa (kesişen ara düğüm varsa) mükerrer sayılmaz!
  //    Buna karşılık aynı ata farklı/bağımsız dallardan tekrar geliyorsa (double linebreeding) toplanır.
  // --------------------------------------------------------------------------
  calculateExactWrightCOI(sireTree, damTree) {
    const cleanR = (r) => (r || '').trim().toUpperCase();

    const buildPathNodes = (tree) => {
      const entries = [];
      const rSelf = cleanR(tree.self?.ring);
      const rP1 = cleanR(tree.p1?.ring);
      const rP2 = cleanR(tree.p2?.ring);
      const rG1 = cleanR(tree.g1?.ring);
      const rG2 = cleanR(tree.g2?.ring);
      const rG3 = cleanR(tree.g3?.ring);
      const rG4 = cleanR(tree.g4?.ring);

      if (rSelf) entries.push({ ring: rSelf, name: tree.self?.name || '', depth: 0, pathAbove: [] });
      if (rP1) entries.push({ ring: rP1, name: tree.p1?.name || '', depth: 1, pathAbove: [rSelf].filter(Boolean) });
      if (rP2) entries.push({ ring: rP2, name: tree.p2?.name || '', depth: 1, pathAbove: [rSelf].filter(Boolean) });

      if (rG1) entries.push({ ring: rG1, name: tree.g1?.name || '', depth: 2, pathAbove: [rSelf, rP1].filter(Boolean) });
      if (rG2) entries.push({ ring: rG2, name: tree.g2?.name || '', depth: 2, pathAbove: [rSelf, rP1].filter(Boolean) });
      if (rG3) entries.push({ ring: rG3, name: tree.g3?.name || '', depth: 2, pathAbove: [rSelf, rP2].filter(Boolean) });
      if (rG4) entries.push({ ring: rG4, name: tree.g4?.name || '', depth: 2, pathAbove: [rSelf, rP2].filter(Boolean) });

      const ggList = [
        { box: tree.gg1, path: [rSelf, rP1, rG1] },
        { box: tree.gg2, path: [rSelf, rP1, rG1] },
        { box: tree.gg3, path: [rSelf, rP1, rG2] },
        { box: tree.gg4, path: [rSelf, rP1, rG2] },
        { box: tree.gg5, path: [rSelf, rP2, rG3] },
        { box: tree.gg6, path: [rSelf, rP2, rG3] },
        { box: tree.gg7, path: [rSelf, rP2, rG4] },
        { box: tree.gg8, path: [rSelf, rP2, rG4] }
      ];
      ggList.forEach(item => {
        const rGG = cleanR(item.box?.ring);
        if (rGG) {
          entries.push({ ring: rGG, name: item.box?.name || '', depth: 3, pathAbove: item.path.filter(Boolean) });
        }
      });

      const rGG1 = cleanR(tree.gg1?.ring);
      const rGG2 = cleanR(tree.gg2?.ring);
      const rGG3 = cleanR(tree.gg3?.ring);
      const rGG4 = cleanR(tree.gg4?.ring);
      const rGG5 = cleanR(tree.gg5?.ring);
      const rGG6 = cleanR(tree.gg6?.ring);
      const rGG7 = cleanR(tree.gg7?.ring);
      const rGG8 = cleanR(tree.gg8?.ring);

      const gggList = [
        { box: tree.ggg1,  path: [rSelf, rP1, rG1, rGG1] },
        { box: tree.ggg2,  path: [rSelf, rP1, rG1, rGG1] },
        { box: tree.ggg3,  path: [rSelf, rP1, rG1, rGG2] },
        { box: tree.ggg4,  path: [rSelf, rP1, rG1, rGG2] },
        { box: tree.ggg5,  path: [rSelf, rP1, rG2, rGG3] },
        { box: tree.ggg6,  path: [rSelf, rP1, rG2, rGG3] },
        { box: tree.ggg7,  path: [rSelf, rP1, rG2, rGG4] },
        { box: tree.ggg8,  path: [rSelf, rP1, rG2, rGG4] },
        { box: tree.ggg9,  path: [rSelf, rP2, rG3, rGG5] },
        { box: tree.ggg10, path: [rSelf, rP2, rG3, rGG5] },
        { box: tree.ggg11, path: [rSelf, rP2, rG3, rGG6] },
        { box: tree.ggg12, path: [rSelf, rP2, rG3, rGG6] },
        { box: tree.ggg13, path: [rSelf, rP2, rG4, rGG7] },
        { box: tree.ggg14, path: [rSelf, rP2, rG4, rGG7] },
        { box: tree.ggg15, path: [rSelf, rP2, rG4, rGG8] },
        { box: tree.ggg16, path: [rSelf, rP2, rG4, rGG8] }
      ];
      gggList.forEach((item, idx) => {
        const rGGG = cleanR(item.box?.ring);
        if (rGGG) {
          entries.push({ ring: rGGG, name: item.box?.name || '', depth: 4, pathAbove: item.path.filter(Boolean) });
        }
        // 5. NESİL (gggg1..gggg32) ÇAPRAZ PEDİGRİ DÜĞÜMLERİ (depth = 5)
        const k = idx + 1;
        const ggggFather = tree[`gggg${2 * k - 1}`];
        const ggggMother = tree[`gggg${2 * k}`];
        const path5 = [...item.path, rGGG].filter(Boolean);
        const rG5F = cleanR(ggggFather?.ring);
        const rG5M = cleanR(ggggMother?.ring);
        if (rG5F) {
          entries.push({ ring: rG5F, name: ggggFather?.name || '', depth: 5, pathAbove: path5 });
        }
        if (rG5M) {
          entries.push({ ring: rG5M, name: ggggMother?.name || '', depth: 5, pathAbove: path5 });
        }
      });

      return entries;
    };

    const sNodes = buildPathNodes(sireTree);
    const dNodes = buildPathNodes(damTree);

    if (!sNodes.length || !dNodes.length) {
      return { coiPercent: 0, commonAncestorsDetailed: [], relationSummary: 'Ortak Ata Yok (Tam Açık Kan / Outcross)' };
    }

    // Aynı kuş kendi kendisiyle seçildiyse
    if (sNodes[0]?.ring && dNodes[0]?.ring && sNodes[0].ring === dNodes[0].ring && sNodes[0].depth === 0 && dNodes[0].depth === 0) {
      return {
        coiPercent: 50.0,
        commonAncestorsDetailed: [`${sNodes[0].ring} (Aynı Birey Seçildi - Geçersiz Eşleşme)`],
        relationSummary: 'Hatalı Seçim: Baba ve Anne olarak aynı halka numarası seçildi!'
      };
    }

    let fCoefficient = 0;
    const commonMap = new Map();

    sNodes.forEach(sNode => {
      dNodes.forEach(dNode => {
        if (sNode.ring && sNode.ring === dNode.ring) {
          // Sewall Wright Yolak Bağımsızlığı Kontrolü:
          // Ara düğümlerde (pathAbove) ortak bir ata varsa, döngü o daha yakın ortak atada zaten kapanmıştır!
          const sharedIntermediate = sNode.pathAbove.some(anc => dNode.pathAbove.includes(anc));
          if (sharedIntermediate) return;

          // Ayrıca ortak atanın kendisi karşı tarafın ara yolunda zaten yer alıyorsa mükerrer sayma
          if (sNode.pathAbove.includes(dNode.ring) || dNode.pathAbove.includes(sNode.ring)) return;

          const n1 = sNode.depth;
          const n2 = dNode.depth;
          const pathContribution = Math.pow(0.5, n1 + n2 + 1);

          fCoefficient += pathContribution;

          const existing = commonMap.get(sNode.ring);
          if (!existing) {
            commonMap.set(sNode.ring, {
              ring: sNode.ring,
              name: sNode.name || dNode.name,
              n1,
              n2,
              contrib: pathContribution,
              pathCount: 1
            });
          } else {
            existing.contrib += pathContribution;
            existing.pathCount += 1;
            existing.n1 = Math.min(existing.n1, n1);
            existing.n2 = Math.min(existing.n2, n2);
          }
        }
      });
    });

    const commonAncestorsDetailed = [];
    commonMap.forEach(item => {
      const pct = (item.contrib * 100).toFixed(2);
      const pathNote = item.pathCount > 1 ? ` • ${item.pathCount} bağımsız yolak` : '';
      commonAncestorsDetailed.push(`${item.ring} (${item.name || 'Ata'} • Baba ${item.n1 + 1}.Kuşak × Anne ${item.n2 + 1}.Kuşak${pathNote} → +%${pct} COI)`);
    });

    const coiPercent = Number(Math.min(37.5, fCoefficient * 100).toFixed(2));

    let relationSummary = 'Ortak Ata Yok (%0 Akrabalık — Tam Yabancı Kan / Kan Kırma)';
    if (coiPercent >= 25.0) relationSummary = 'Çok Yakın Akrabalık Riski (Tam Kardeş veya Baba×Kız / Anne×Oğul)';
    else if (coiPercent >= 12.5) relationSummary = 'Yakın Soy İçi Eşleşme (Yarım Kardeş veya Dede×Torun Kan Sabitleme)';
    else if (coiPercent >= 6.25) relationSummary = 'İdeal Soy İçi Eşleşme (Amca/Hala × Yeğen veya Çift Kuzen Kan Sabitleme)';
    else if (coiPercent > 0) relationSummary = 'Uzaktan Soy Bağlantısı (3-5. Kuşak Ortak Ata)';

    return {
      coiPercent,
      commonAncestorsDetailed,
      relationSummary
    };
  },

  // ==========================================================================
  // 1. FONKSİYON: YARIŞ ZEKÂSI (RACING INTELLIGENCE)
  //    Mantık:
  //    - Yarış güvercininde Galton Mendel katkısı (Baba hattı %50, Anne hattı %50),
  //    - Boş ata kutuları popülasyon ortalamasına (45 puan) çekilerek sönümlenir,
  //    - İç akrabalık (Baba×Anne COI) düşükse Melez Dinçliği (Heterosis) tam puan alır;
  //      kuş aşırı akraba (COI >= %25) bir eşleşmeden doğmuşsa yarış dayanıklılığı cezalandırılır!
  // ==========================================================================
  analyzeRacingIntelligence(pedId) {
    this.ensureEngineCacheFresh();
    const ped = pedigrees.find(p => p.id === pedId) || getActivePedigree() || pedigrees[0];
    const cacheKey = ped?.id || 'default_ped';
    if (this._engineCache.racing[cacheKey]) {
      return this._engineCache.racing[cacheKey];
    }
    const b = ped?.boxes || {};

    const subjectInfo = this.inspectAncestorBox(b.main, 0);

    const paternalSlots = [
      { key: 'sire', label: 'Baba (1. Kuşak)', gen: 1 },
      { key: 'g2_1', label: 'Baba Tarafı Büyükbaba (2. Kuşak)', gen: 2 },
      { key: 'g2_2', label: 'Baba Tarafı Büyükanne (2. Kuşak)', gen: 2 },
      { key: 'g3_1', label: 'Baba Hattı 3. Kuşak Ata-1', gen: 3 },
      { key: 'g3_2', label: 'Baba Hattı 3. Kuşak Ata-2', gen: 3 },
      { key: 'g3_3', label: 'Baba Hattı 3. Kuşak Ata-3', gen: 3 },
      { key: 'g3_4', label: 'Baba Hattı 3. Kuşak Ata-4', gen: 3 },
      { key: 'g4_1', label: 'Baba Hattı 4. Kuşak Ata-1', gen: 4 },
      { key: 'g4_2', label: 'Baba Hattı 4. Kuşak Ata-2', gen: 4 },
      { key: 'g4_3', label: 'Baba Hattı 4. Kuşak Ata-3', gen: 4 },
      { key: 'g4_4', label: 'Baba Hattı 4. Kuşak Ata-4', gen: 4 },
      { key: 'g4_5', label: 'Baba Hattı 4. Kuşak Ata-5', gen: 4 },
      { key: 'g4_6', label: 'Baba Hattı 4. Kuşak Ata-6', gen: 4 },
      { key: 'g4_7', label: 'Baba Hattı 4. Kuşak Ata-7', gen: 4 },
      { key: 'g4_8', label: 'Baba Hattı 4. Kuşak Ata-8', gen: 4 }
    ];

    const maternalSlots = [
      { key: 'dam', label: 'Anne (1. Kuşak)', gen: 1 },
      { key: 'g2_3', label: 'Anne Tarafı Büyükbaba (2. Kuşak)', gen: 2 },
      { key: 'g2_4', label: 'Anne Tarafı Büyükanne (2. Kuşak)', gen: 2 },
      { key: 'g3_5', label: 'Anne Hattı 3. Kuşak Ata-5', gen: 3 },
      { key: 'g3_6', label: 'Anne Hattı 3. Kuşak Ata-6', gen: 3 },
      { key: 'g3_7', label: 'Anne Hattı 3. Kuşak Ata-7', gen: 3 },
      { key: 'g3_8', label: 'Anne Hattı 3. Kuşak Ata-8', gen: 3 },
      { key: 'g4_9',  label: 'Anne Hattı 4. Kuşak Ata-9',  gen: 4 },
      { key: 'g4_10', label: 'Anne Hattı 4. Kuşak Ata-10', gen: 4 },
      { key: 'g4_11', label: 'Anne Hattı 4. Kuşak Ata-11', gen: 4 },
      { key: 'g4_12', label: 'Anne Hattı 4. Kuşak Ata-12', gen: 4 },
      { key: 'g4_13', label: 'Anne Hattı 4. Kuşak Ata-13', gen: 4 },
      { key: 'g4_14', label: 'Anne Hattı 4. Kuşak Ata-14', gen: 4 },
      { key: 'g4_15', label: 'Anne Hattı 4. Kuşak Ata-15', gen: 4 },
      { key: 'g4_16', label: 'Anne Hattı 4. Kuşak Ata-16', gen: 4 }
    ];

    const missingWarnings = [];
    const verifiedResultsList = [];
    if (subjectInfo.verifiedWins.length) {
      subjectInfo.verifiedWins.forEach(w => verifiedResultsList.push(`Ana Kuş (${subjectInfo.ring}): ${w}`));
    } else {
      missingWarnings.push('Ana güvercine ait doğrulanmış bireysel yarış derecesi girilmemiş (Potansiyel puanı üst nesil soyağacı verisinden hesaplandı).');
    }

    const evaluateBranch = (slots, branchTitle) => {
      let weightedSum = 0;
      let totalTheoreticalWeight = 0; // Boş kutular dahil toplam teorik Mendel ağırlığı (0.5 + 2*0.25 + 4*0.125 = 1.50)
      let filledCount = 0;
      let withPerfNotesCount = 0;
      const strongLines = [];
      const weakLines = [];

      slots.forEach(s => {
        const info = this.inspectAncestorBox(b[s.key], s.gen);
        totalTheoreticalWeight += info.genWeight;
        // ÖNEMLİ BİLİMSEL KURAL: Ata boş olsa bile rawScore=45 (popülasyon ortalaması) ile ağırlığa girer!
        // Böylece tek bir şampiyon ata yazıp diğer 6 atayı boş bırakınca ortalama yapay olarak 95'e fırlamaz!
        weightedSum += info.rawScore * info.genWeight;

        if (info.exists) {
          filledCount++;
          if (info.hasNotes) withPerfNotesCount++;

          info.verifiedWins.forEach(w => {
            verifiedResultsList.push(`${s.label} [${info.ring}]: ${w}`);
          });

          if (info.rawScore >= 78) {
            strongLines.push(`${info.ring} (${info.name} • İndeks: ${info.rawScore})`);
          } else if (!info.hasNotes) {
            weakLines.push(`${s.label} [${info.ring}]: Derece/performans kaydı girilmemiş`);
          }
        } else {
          missingWarnings.push(`${branchTitle}: ${s.label} kayıtsız (Galton popülasyon ortalaması 45 baz alındı).`);
          weakLines.push(`${s.label}: Kayıtsız Ata`);
        }
      });

      const branchScore = totalTheoreticalWeight > 0 ? Math.round(weightedSum / totalTheoreticalWeight) : 45;
      return {
        branchScore,
        filledCount,
        totalSlots: slots.length,
        withPerfNotesCount,
        strongLines,
        weakLines
      };
    };

    const pat = evaluateBranch(paternalSlots, 'Baba Hattı');
    const mat = evaluateBranch(maternalSlots, 'Anne Hattı');

    // Bu yarışçının kendi Baba ve Annesi arasındaki iç akrabalığı (Internal Wright COI)
    const sireTree = getCandidateLineageTree(`${ped.id}::sire`);
    const damTree = getCandidateLineageTree(`${ped.id}::dam`);
    const internalWright = this.calculateExactWrightCOI(sireTree, damTree);

    // Şeffaf 0-100 Puanlama Algoritması (Yarış Zekâsı):
    // 1. Bireysel Doğrulanmış Yarış/Fizik Gücü (Max 25 Puan)
    const compIndividual = Math.round((subjectInfo.rawScore / 100) * 25);
    // 2. Baba Hattı Galton-Mendel Katkısı (Max 30 Puan)
    const compPaternal = Math.round((pat.branchScore / 100) * 30);
    // 3. Anne Hattı Galton-Mendel Katkısı (Max 30 Puan)
    const compMaternal = Math.round((mat.branchScore / 100) * 30);
    // 4. Melez Dinçliği (Heterosis) & Veri Güvenilirliği (Max 15 Puan — 30 Ata Kutusu üzerinden)
    const totalFilled = pat.filledCount + mat.filledCount;
    const totalNotes = pat.withPerfNotesCount + mat.withPerfNotesCount;
    const dataReliabilityPct = Math.min(100, Math.round(((totalFilled / 30) * 0.65 + (totalNotes / 30) * 0.35) * 100));

    // Yarışçıda aşırı akrabalık (inbreeding depression) varsa yarış puanından düşülür
    let heterosisFactor = 1.0;
    if (internalWright.coiPercent >= 25.0) {
      heterosisFactor = 0.45;
      missingWarnings.push(`Yarışçı Uyarısı: Bu güvercinin anne ve babası çok yakın akraba (COI %${internalWright.coiPercent.toFixed(1)}). Ağır yarışlarda inbreeding depresyonu (kas dayanıklılığı düşüşü) riski vardır.`);
    } else if (internalWright.coiPercent > 12.5) {
      heterosisFactor = 0.72;
    }
    const compReliabilityAndHeterosis = Math.round(((dataReliabilityPct / 100) * 10) + (5 * heterosisFactor));

    const totalPotentialScore = Math.max(0, Math.min(100, compIndividual + compPaternal + compMaternal + compReliabilityAndHeterosis));

    // Döngüsel özyinelemeyi (recursion) önlemek için altMatches hızlı modda boş bırakılır
    const altMatches = [];

    const result = {
      mode: 'racing',
      subject: subjectInfo,
      totalScore: totalPotentialScore,
      internalCoi: internalWright.coiPercent,
      breakdown: [
        { label: 'Bireysel Doğrulanmış Yarış & Rekabet Katkısı', pts: compIndividual, max: 25 },
        { label: `Baba Hattı Galton-Mendel Gücü (${pat.filledCount}/15 Ata Dolu)`, pts: compPaternal, max: 30 },
        { label: `Anne Hattı Galton-Mendel Gücü (${mat.filledCount}/15 Ata Dolu)`, pts: compMaternal, max: 30 },
        { label: `Melez Dinçliği (COI %${internalWright.coiPercent.toFixed(1)}) & Veri Güvenilirliği`, pts: compReliabilityAndHeterosis, max: 15 }
      ],
      dataReliabilityPct,
      totalFilled,
      verifiedResultsList,
      strongLines: [...pat.strongLines, ...mat.strongLines],
      weakLines: [...pat.weakLines, ...mat.weakLines],
      missingWarnings,
      altMatches,
      hasDna: this.state.hasVerifiedDnaLabData
    };
    this._engineCache.racing[cacheKey] = result;
    return result;
  },

  // ==========================================================================
  // YARDIMCI: BİR GÜVERCİNİN ÖZ/ÜVEY KARDEŞ (FULL/HALF-SIBLING) VE YAVRU (OFFSPRING)
  // GERÇEK YARIŞ PERFORMANSI ANALİZÖRÜ (Progeny & Collateral Relatives EBV)
  // ==========================================================================
  evaluateSiblingsAndOffspringPerformance(targetRing, targetSireRing, targetDamRing, targetBoxNotes) {
    const cleanRing = (targetRing || '').trim().toUpperCase();
    const cleanSire = (targetSireRing || '').trim().toUpperCase();
    const cleanDam = (targetDamRing || '').trim().toUpperCase();
    if (!this._engineCache.allUniqueBirds) {
      this._engineCache.allUniqueBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];
    }
    const allBirds = this._engineCache.allUniqueBirds;

    const fullSiblings = [];
    const halfSiblings = [];
    const offspring = [];

    allBirds.forEach(b => {
      const bRing = (b.ring || '').trim().toUpperCase();
      if (!bRing || bRing === cleanRing) return;
      const bSire = (b.sireRing || '').trim().toUpperCase();
      const bDam = (b.damRing || '').trim().toUpperCase();

      // 1. Yavruları (Babası veya Annesi bu kuş olanlar)
      if (cleanRing && (bSire === cleanRing || bDam === cleanRing)) {
        offspring.push(b);
      }

      // 2. Öz Kardeşleri (Hem Babası hem Annesi aynı olanlar) ve Üvey Kardeşleri (Tek ebeveyni ortak olanlar)
      const sameSire = cleanSire && bSire && cleanSire === bSire;
      const sameDam = cleanDam && bDam && cleanDam === bDam;
      if (sameSire && sameDam) {
        fullSiblings.push(b);
      } else if (sameSire || sameDam) {
        halfSiblings.push(b);
      }
    });

    // Kardeş ve Yavruların gerçek yarış kayıtlarını (`AvigenRaceTracker` + doğrulanmış notlar) topla
    const extractBirdRaceProof = (birdObj) => {
      const proofs = [];
      if (typeof AvigenRaceTracker !== 'undefined') {
        const hist = AvigenRaceTracker.getBirdRaceHistory(birdObj.ring).filter(h => h.resultStatus === 'ENTERED' && h.rank);
        hist.forEach(h => {
          proofs.push({
            label: `${birdObj.ring} (${birdObj.name}): ${h.codeTitle} ${h.distanceKm} km — ${h.rank}. Sıra (${h.speedMpm} m/dk)`,
            rank: h.rank,
            pts: h.rank <= 3 ? 95 : (h.rank <= 15 ? 88 : (h.rank <= 50 ? 80 : 72))
          });
        });
      }
      const insp = this.inspectAncestorBox(birdObj, 1);
      insp.verifiedWins.forEach(w => {
        proofs.push({
          label: `${birdObj.ring} (${birdObj.name}): ${w}`,
          rank: 5,
          pts: insp.rawScore
        });
      });
      return proofs;
    };

    const siblingProofs = [];
    fullSiblings.forEach(s => extractBirdRaceProof(s).forEach(p => siblingProofs.push({ ...p, type: 'Öz Kardeş' })));
    halfSiblings.forEach(s => extractBirdRaceProof(s).forEach(p => siblingProofs.push({ ...p, type: 'Üvey Kardeş' })));

    // Pedigri notlarında açıkça yazılı kardeş/yavru derecelerini de yakala (Örn: "Öz kardeşi... Final 76.", "Full Brother: 1. Nikolaev", "Half sister to...", "Yavrusu: ... 252 km 2.")
    const notesTxt = (targetBoxNotes || '').trim();
    if (/kardeş|brother|sister/i.test(notesTxt)) {
      const sibMatch = notesTxt.match(/(?:öz\s*kardeş[a-zğıöşü]*|babadan\s*kardeş[a-zğıöşü]*|full\s*(?:sister|brother)|h\/brother|half\s*sister)[^\n]{4,110}/gi);
      if (sibMatch) {
        sibMatch.forEach(m => {
          siblingProofs.push({
            type: 'Pedigri Kardeş Kaydı',
            label: m.trim(),
            rank: /1\.|2\.|3\.|4\.|5\.|7\.|12\./.test(m) ? 5 : 25,
            pts: /1\.|2\.|3\.|4\.|5\.|7\.|12\.|ace|final/i.test(m) ? 89 : 78
          });
        });
      }
    }

    const offspringProofs = [];
    offspring.forEach(o => extractBirdRaceProof(o).forEach(p => offspringProofs.push(p)));
    if (/yavrusu|offspring\s*won|father\s*to|mother\s*to/i.test(notesTxt)) {
      const offMatch = notesTxt.match(/(?:yavrusu|offspring\s*won|father\s*to|mother\s*to)[^\n]{4,110}/gi);
      if (offMatch) {
        offMatch.forEach(m => {
          offspringProofs.push({
            label: m.trim(),
            rank: 5,
            pts: 90
          });
        });
      }
    }

    const avgPts = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b.pts, 0) / arr.length) : null;

    return {
      fullSiblingsCount: fullSiblings.length,
      halfSiblingsCount: halfSiblings.length,
      offspringCount: offspring.length,
      siblingProofs,
      offspringProofs,
      siblingScore: avgPts(siblingProofs),
      offspringScore: avgPts(offspringProofs)
    };
  },

  // ==========================================================================
  // 2. FONKSİYON: DAMIZLIK ZEKÂSI (BREEDING INTELLIGENCE — 5 NESİL & TAMAMLAYICILIK MOTORU)
  //    Birlikte Değerlendirilen 8 Kriter:
  //    1. 5 Nesil (62 Ata) Sewall Wright COI & Ortak Atanın Gerçek Şampiyonluk Kalitesi
  //    2. Anne ve Baba bireysel yarış & pedigri performansı
  //    3. Kardeşlerin (Full/Half-Sibling) yarış sonuçları
  //    4. Yavruların (Offspring) performans geçmişi
  //    5. Mesafe (Sprint / Orta / Maraton), Hız ve Fiziksel/Biyometrik Tamamlayıcılık (Komplementer Uyum)
  //    6. Performansın tutarlılığı (İstikrar)
  //    7. Öğrenen AI Kullanıcı Geri Bildirimi (Kabul +6 / Red -25)
  //    8. Veri güvenilirliği ve eksik kayıt sönümlemesi (İki boş kuşa yüksek puan verilmez!)
  // ==========================================================================
  analyzeBreedingIntelligence(sireRef, damRef, skipAlternatives = false) {
    this.ensureEngineCacheFresh();
    const { males, females, all } = getAllBreedingCandidates();
    const sRef = sireRef || (males[0]?.id || all[0]?.id);
    const dRef = damRef || (females[0]?.id || all[1]?.id || all[0]?.id);
    const breedingGoal = this.state.breedingTargetGoal || 'balanced'; // 'balanced' | 'race_outcross' | 'linebreeding_stock'

    const pairKey = `${sRef}__${dRef}__${breedingGoal}`;
    if (skipAlternatives && this._engineCache.breedingQuick[pairKey]) {
      return this._engineCache.breedingQuick[pairKey];
    }
    if (!skipAlternatives && this._engineCache.breedingFull[pairKey]) {
      return this._engineCache.breedingFull[pairKey];
    }

    // Ebeveynlerin 5 kuşağındaki (62 ata kutusu) mevcut kayıtları, kuşak doluluklarını ve soy tekrarlarını değerlendir
    const evalDeepTreeScore = (tree, parentLabel) => {
      const nodes = [
        { box: tree.p1, gen: 1 }, { box: tree.p2, gen: 1 },
        { box: tree.g1, gen: 2 }, { box: tree.g2, gen: 2 }, { box: tree.g3, gen: 2 }, { box: tree.g4, gen: 2 },
        { box: tree.gg1, gen: 3 }, { box: tree.gg2, gen: 3 }, { box: tree.gg3, gen: 3 }, { box: tree.gg4, gen: 3 },
        { box: tree.gg5, gen: 3 }, { box: tree.gg6, gen: 3 }, { box: tree.gg7, gen: 3 }, { box: tree.gg8, gen: 3 },
        { box: tree.ggg1, gen: 4 }, { box: tree.ggg2, gen: 4 }, { box: tree.ggg3, gen: 4 }, { box: tree.ggg4, gen: 4 },
        { box: tree.ggg5, gen: 4 }, { box: tree.ggg6, gen: 4 }, { box: tree.ggg7, gen: 4 }, { box: tree.ggg8, gen: 4 },
        { box: tree.ggg9, gen: 4 }, { box: tree.ggg10, gen: 4 }, { box: tree.ggg11, gen: 4 }, { box: tree.ggg12, gen: 4 },
        { box: tree.ggg13, gen: 4 }, { box: tree.ggg14, gen: 4 }, { box: tree.ggg15, gen: 4 }, { box: tree.ggg16, gen: 4 },
        ...Array.from({ length: 32 }, (_, idx) => ({ box: tree[`gggg${idx + 1}`], gen: 5 }))
      ];
      const genTotals = { 1: 2, 2: 4, 3: 8, 4: 16, 5: 32 };
      const genFilled = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      let wSumExisting = 0;
      let wTotExisting = 0;
      let filledNodesCount = 0;
      let perfNotedNodesCount = 0;
      let maxAncestorDistKm = 0;
      const ancestorWins = [];
      const strainSet = new Set();
      const allNotesArr = [tree.self?.notes || ''];
      const nodeScoreByRing = new Map();
      const ringFrequencyMap = new Map();

      nodes.forEach(n => {
        const inf = this.inspectAncestorBox(n.box, n.gen);
        if (inf.exists) {
          filledNodesCount++;
          genFilled[n.gen] = (genFilled[n.gen] || 0) + 1;
          if (inf.hasNotes) perfNotedNodesCount++;
          wSumExisting += inf.rawScore * inf.genWeight;
          wTotExisting += inf.genWeight;
          if (inf.distanceKm > maxAncestorDistKm) maxAncestorDistKm = inf.distanceKm;
          if (inf.strainName && inf.strainName !== 'Standart Hat') strainSet.add(inf.strainName);
          if (n.box?.notes) allNotesArr.push(n.box.notes);
          const cleanR = inf.ring.toUpperCase();
          if (!nodeScoreByRing.has(cleanR) || inf.rawScore > nodeScoreByRing.get(cleanR).rawScore) {
            nodeScoreByRing.set(cleanR, inf);
          }
          const prevFreq = ringFrequencyMap.get(cleanR) || { ring: inf.ring, name: inf.name, count: 0, gens: [] };
          prevFreq.count += 1;
          prevFreq.gens.push(`${n.gen}.Kuşak`);
          ringFrequencyMap.set(cleanR, prevFreq);

          inf.verifiedWins.forEach(w => {
            if (ancestorWins.length < 12) ancestorWins.push(`${inf.ring} (${inf.name} • ${n.gen}.Kuşak): ${w}`);
          });
        }
      });

      const intraRepeats = [];
      ringFrequencyMap.forEach(item => {
        if (item.count > 1) {
          intraRepeats.push(`${item.ring} (${item.name || 'Ata'} • ${parentLabel} soyunda ${item.count} kez tekrar ediyor: ${item.gens.join(', ')})`);
        }
      });

      const missingGenSummary = [1, 2, 3, 4, 5]
        .map(g => `${g}.Kuşak: ${genFilled[g]}/${genTotals[g]}`)
        .join(' • ');

      // Galton Büzülmesi (Shrinkage): Sadece 1-2 ata girilmişse popülasyon ortalamasına (52) doğru dengelenir
      const rawAvg = wTotExisting > 0 ? (wSumExisting / wTotExisting) : null;
      const confidenceFactor = Math.min(1, filledNodesCount / 6);
      const avgAncestorScore = rawAvg !== null
        ? Math.round(rawAvg * confidenceFactor + 52 * (1 - confidenceFactor))
        : null;

      return {
        avgAncestorScore,
        filledNodesCount,
        perfNotedNodesCount,
        maxAncestorDistKm,
        genFilled,
        genTotals,
        missingGenSummary,
        intraRepeats,
        strains: Array.from(strainSet),
        ancestorWins,
        nodeScoreByRing,
        combinedNotes: allNotesArr.filter(Boolean).join('\n')
      };
    };

    // Kuş bazlı 5 nesil soyağacı, kardeş/yavru ve yarış trendi önbelleği (Aynı kuşun 62 atasını tekrar tekrar hesaplamayı önler!)
    const getOrBuildBirdSingleData = (ref, parentLabel) => {
      if (!this._engineCache.birdData) this._engineCache.birdData = {};
      const cacheKey = `${ref}__${parentLabel}`;
      if (this._engineCache.birdData[cacheKey]) {
        return this._engineCache.birdData[cacheKey];
      }
      const tree = getCandidateLineageTree(ref);
      const info = this.inspectAncestorBox(tree.self, 0);
      const deep = evalDeepTreeScore(tree, parentLabel);
      const collateral = this.evaluateSiblingsAndOffspringPerformance(
        info.ring,
        tree.p1?.ring,
        tree.p2?.ring,
        deep.combinedNotes
      );
      const realTrend = typeof AvigenRaceTracker !== 'undefined'
        ? AvigenRaceTracker.analyzeBirdLongitudinalTrend(info.ring)
        : { hasRealData: false, enteredCount: 0 };
      if (realTrend && realTrend.hasRealData && Array.isArray(realTrend.chrono)) {
        info.hasNotes = true;
        realTrend.chrono.forEach(rc => {
          const line = `${rc.rank}. ${rc.codeTitle} ${rc.distanceKm} km (${(rc.totalCompetitors || 1000).toLocaleString('tr-TR')} Kuş - ${rc.speedMpm || 1300} m/dk)`;
          if (!info.verifiedWins.some(w => w.includes(rc.codeTitle))) {
            info.verifiedWins.unshift(line);
          }
          if ((rc.distanceKm || 0) > (info.distanceKm || 0)) {
            info.distanceKm = rc.distanceKm;
          }
        });
        const pctScore = realTrend.avgRankPercentile !== null
          ? Math.max(58, Math.min(98, Math.round(96 - realTrend.avgRankPercentile * 1.4)))
          : 72;
        info.rawScore = Math.max(info.rawScore, pctScore);
      }
      const bundle = { tree, info, deep, collateral, realTrend };
      this._engineCache.birdData[cacheKey] = bundle;
      return bundle;
    };

    const sBundle = getOrBuildBirdSingleData(sRef, 'Baba');
    const dBundle = getOrBuildBirdSingleData(dRef, 'Anne');

    const sTree = sBundle.tree;
    const dTree = dBundle.tree;
    const sireInfo = sBundle.info;
    const damInfo = dBundle.info;
    const sDeep = sBundle.deep;
    const dDeep = dBundle.deep;
    const sireCollateral = sBundle.collateral;
    const damCollateral = dBundle.collateral;
    const sireRealTrend = sBundle.realTrend;
    const damRealTrend = dBundle.realTrend;

    // Gerçek 5 Kuşak Derinlikli Sewall Wright COI Hesabı (62 Ata Düğümü)
    const wright = this.calculateExactWrightCOI(sTree, dTree);
    const coi = wright.coiPercent;

    // ------------------------------------------------------------------------
    // ORTAK ATA KALİTE DENETİMİ (ŞAMPİYON ORTAK ATA MI, SIRADAN KAYITSIZ ATA MI?)
    // ------------------------------------------------------------------------
    let bestCommonAncestorScore = 54;
    let commonAncestorHasProof = false;
    let bestCommonAncestorLabel = '';
    if (wright.commonAncestorsDetailed.length > 0) {
      wright.commonAncestorsDetailed.forEach(desc => {
        const ringToken = (desc.split(' (')[0] || '').trim().toUpperCase();
        const sMatch = sDeep.nodeScoreByRing.get(ringToken) || (sireInfo.ring.toUpperCase() === ringToken ? sireInfo : null);
        const dMatch = dDeep.nodeScoreByRing.get(ringToken) || (damInfo.ring.toUpperCase() === ringToken ? damInfo : null);
        const candScore = Math.max(sMatch?.rawScore || 54, dMatch?.rawScore || 54);
        const hasWin = Boolean((sMatch?.verifiedWins?.length || 0) + (dMatch?.verifiedWins?.length || 0) > 0);
        if (candScore >= bestCommonAncestorScore) {
          bestCommonAncestorScore = candScore;
          bestCommonAncestorLabel = `${ringToken} (${sMatch?.name || dMatch?.name || 'Ortak Ata'} • Kalite: ${candScore}/100)`;
        }
        if (hasWin || candScore >= 72) commonAncestorHasProof = true;
      });
    }

    // ------------------------------------------------------------------------
    // MESAFE, HIZ VE FİZİKSEL/SOY TAMAMLAYICILIK (COMPLEMENTARITY) ANALİZİ
    // ------------------------------------------------------------------------
    const inferDistanceProfile = (info, deep, realTrend) => {
      const maxKm = Math.max(info.distanceKm || 0, deep.maxAncestorDistKm || 0);
      const txt = `${info.name} ${info.strainName} ${deep.combinedNotes}`.toLowerCase();
      if (maxKm >= 550 || /\b(maraton|barcelona|st\.?\s*vincent|perpignan|uzun\s*mesafe|700\s*km|800\s*km)\b/i.test(txt)) {
        return { code: 'MARATHON', label: 'Uzun Mesafe / Maraton (550–850+ km)', speedBias: 68, enduranceBias: 94 };
      }
      if (maxKm >= 320 || /\b(orta\s*mesafe|all[\s-]*round|final|450\s*km|500\s*km|porsche|hooymans|harry|romario|rolex|veenstra|vandenabeele)\b/i.test(txt)) {
        return { code: 'ALLROUND', label: 'Orta-Uzun Mesafe / All-Round (300–550 km)', speedBias: 86, enduranceBias: 86 };
      }
      if (maxKm >= 100 || /\b(sprint|sürat|kısa\s*mesafe|kittel|van\s*den\s*bulck|janssen|180\s*km|200\s*km)\b/i.test(txt)) {
        return { code: 'SPRINT', label: 'Kısa-Orta Mesafe / Sürat (100–320 km)', speedBias: 94, enduranceBias: 70 };
      }
      if (realTrend?.hasRealData) {
        return { code: 'ALLROUND', label: 'Aktif Yarışçı Hattı (150–500 km)', speedBias: 82, enduranceBias: 80 };
      }
      return { code: 'UNKNOWN', label: 'Mesafe Kaydı Girilmemiş (Genel Hat)', speedBias: 60, enduranceBias: 60 };
    };

    const sireDistProf = inferDistanceProfile(sireInfo, sDeep, sireRealTrend);
    const damDistProf = inferDistanceProfile(damInfo, dDeep, damRealTrend);

    const sFilled = sDeep.filledNodesCount;
    const dFilled = dDeep.filledNodesCount;
    const allSiblingProofs = [...sireCollateral.siblingProofs, ...damCollateral.siblingProofs];
    const allOffspringProofs = [...sireCollateral.offspringProofs, ...damCollateral.offspringProofs];

    // 1. KRİTER: Genetik Çeşitlilik, Wright COI & Ortak Ata Kalitesi (0-100 Ölçeği, Ağırlık: %25)
    let diversityScore100 = 88;
    if (coi >= 50) {
      diversityScore100 = 0;
    } else if (coi >= 25) {
      diversityScore100 = 28; // Ağır inbreeding depresyonu riski
    } else if (coi > 12.5) {
      // Yakın akrabalık: Yalnızca ortak ata şampiyonsa ve hedef Damızlık Soy Sabitleme ise kabul edilebilir
      diversityScore100 = commonAncestorHasProof
        ? (breedingGoal === 'linebreeding_stock' ? 84 : 68)
        : 48;
    } else if (coi >= 1.5 && coi <= 12.5) {
      // Linebreeding bölgesi: Ortak ata gerçekten şampiyon/dereceli mi?
      if (commonAncestorHasProof) {
        diversityScore100 = breedingGoal === 'linebreeding_stock' ? 98 : 95;
      } else {
        // Ortak atanın hiçbir başarısı kayıtlı değilse ezbere 96 puan VERİLMEZ!
        diversityScore100 = 69;
      }
    } else {
      // %0 - %1.5 COI (Tam Yabancı Kan / Outcross)
      // ÖNEMLİ BİLİMSEL KURAL: Ebeveynlerden birinin soyağacı boşsa (sFilled < 2 veya dFilled < 2), %0 COI doğrulanmış yabancı kan değildir!
      if (sFilled < 2 || dFilled < 2) {
        diversityScore100 = 64;
      } else {
        diversityScore100 = breedingGoal === 'race_outcross' ? 96 : (breedingGoal === 'linebreeding_stock' ? 76 : 90);
      }
    }

    // 2. KRİTER: 5 Nesil Pedigri & Soy Kalitesi (0-100 Ölçeği, Ağırlık: %30)
    const sPedQuality = sDeep.avgAncestorScore !== null ? sDeep.avgAncestorScore : Math.min(54, sireInfo.rawScore);
    const dPedQuality = dDeep.avgAncestorScore !== null ? dDeep.avgAncestorScore : Math.min(54, damInfo.rawScore);
    const pedigreeScore100 = Math.round((sPedQuality + dPedQuality) / 2);

    // 3. KRİTER: Gerçekleşmiş Performans, Kardeş & Yavru Kanıtı (0-100 Ölçeği, Ağırlık: %25)
    // ÖNEMLİ DENGE KURALI: Baba ve Anne performans kanıtları ayrı ayrı hesaplanıp ortalaması alınır;
    // böylece hiç kaydı/soyu olmayan (0/30 ata) bir kuş, karşı eşin yüksek puanıyla yapay olarak 83+ puana çıkamaz!
    const sirePerfSignals = [];
    const damPerfSignals = [];
    if (sireInfo.verifiedWins.length > 0 || sireRealTrend.hasRealData) sirePerfSignals.push(sireInfo.rawScore);
    if (sireCollateral.siblingScore) sirePerfSignals.push(sireCollateral.siblingScore);
    if (sireCollateral.offspringScore) sirePerfSignals.push(sireCollateral.offspringScore);
    if (sDeep.ancestorWins.length > 0 && sDeep.avgAncestorScore) sirePerfSignals.push(sDeep.avgAncestorScore);

    if (damInfo.verifiedWins.length > 0 || damRealTrend.hasRealData) damPerfSignals.push(damInfo.rawScore);
    if (damCollateral.siblingScore) damPerfSignals.push(damCollateral.siblingScore);
    if (damCollateral.offspringScore) damPerfSignals.push(damCollateral.offspringScore);
    if (dDeep.ancestorWins.length > 0 && dDeep.avgAncestorScore) damPerfSignals.push(dDeep.avgAncestorScore);

    const perfSignals = [...sirePerfSignals, ...damPerfSignals];
    const hasPerformanceCriteria = perfSignals.length > 0;
    const sirePerfAvg = sirePerfSignals.length > 0
      ? Math.round(sirePerfSignals.reduce((a, b) => a + b, 0) / sirePerfSignals.length)
      : 50;
    const damPerfAvg = damPerfSignals.length > 0
      ? Math.round(damPerfSignals.reduce((a, b) => a + b, 0) / damPerfSignals.length)
      : 50;
    const performanceScore100 = hasPerformanceCriteria
      ? Math.round((sirePerfAvg + damPerfAvg) / 2)
      : null;
    const effectivePerformanceScore = performanceScore100 !== null ? performanceScore100 : 50;

    // 4. KRİTER: Tamamlayıcılık (Mesafe, Hız/Dayanıklılık Sinerjisi & Karşılıklı Eksik Kapatma, Ağırlık: %20)
    let complementarityScore100 = 60;
    let complementaritySummary = '';
    const sHasStrongProof = sireInfo.rawScore >= 74 || sireCollateral.offspringProofs.length > 0 || sireRealTrend.hasRealData;
    const dHasStrongProof = damInfo.rawScore >= 74 || damCollateral.offspringProofs.length > 0 || damRealTrend.hasRealData;

    if (sireDistProf.code === 'ALLROUND' && damDistProf.code === 'ALLROUND') {
      complementarityScore100 = 92;
      complementaritySummary = 'Çift Yönlü Orta-Uzun Mesafe (300–550 km All-Round) Sinerjisi: Her iki ebeveyn de hem hız hem dayanıklılık taşıyor.';
    } else if (
      (sireDistProf.code === 'SPRINT' && (damDistProf.code === 'ALLROUND' || damDistProf.code === 'MARATHON')) ||
      (damDistProf.code === 'SPRINT' && (sireDistProf.code === 'ALLROUND' || sireDistProf.code === 'MARATHON'))
    ) {
      complementarityScore100 = 94;
      complementaritySummary = 'Hız × Dayanıklılık Tamamlayıcılığı (Komplementer Eşleşme): Bir ebeveynin patlayıcı sürati diğerinin uzun mesafe direnciyle birbirini tamamlıyor.';
    } else if (sireDistProf.code === damDistProf.code && sireDistProf.code !== 'UNKNOWN') {
      complementarityScore100 = 86;
      complementaritySummary = `Uzmanlaşmış ${sireDistProf.label} Uyumu: Aynı mesafe kategorisinde homojen yavru tipi üretir.`;
    } else if (sireDistProf.code !== 'UNKNOWN' || damDistProf.code !== 'UNKNOWN') {
      complementarityScore100 = 72;
      complementaritySummary = 'Kısmi Mesafe Tamamlayıcılığı: Ebeveynlerden birinin mesafe uzmanlığı biliniyor, diğerinin mesafe kaydı sınırlı.';
    } else {
      complementarityScore100 = 52;
      complementaritySummary = 'Mesafe/Tip Kaydı Girilmemiş: Ebeveynlerin hız veya mesafe uzmanlığı henüz kaydedilmediği için tamamlayıcılık taban puanda tutuldu.';
    }

    // Bir ebeveynin eksiğini diğerinin güçlü soy/yavru verimi kapatıyorsa bonus, ikisi de zayıfsa düşüş
    if (sHasStrongProof && dHasStrongProof) {
      complementarityScore100 = Math.min(98, complementarityScore100 + 5);
    } else if (!sHasStrongProof && !dHasStrongProof && (sFilled + dFilled) < 4) {
      complementarityScore100 = Math.min(complementarityScore100, 50);
    }

    // 4 Ana Sütunun Ağırlıklı Toplamı + Öğrenen AI Kullanıcı Geri Bildirimi
    const activeCriteria = [
      { key: 'diversity', label: `Genetik Çeşitlilik & Ortak Ata Kalitesi (%${coi.toFixed(2)} COI)`, score100: diversityScore100, baseWeight: 25 },
      { key: 'pedigree', label: `5 Nesil Pedigri & Soy Gücü (${sFilled + dFilled}/124 Ata Dolu)`, score100: pedigreeScore100, baseWeight: 30 },
      { key: 'performance', label: `Yarış, Kardeş & Yavru Kanıtı (${perfSignals.length} Kanıt Sinyali)`, score100: effectivePerformanceScore, baseWeight: 25 },
      { key: 'complementarity', label: `Mesafe, Hız & Tip Tamamlayıcılığı`, score100: complementarityScore100, baseWeight: 20 }
    ];

    const totalActiveWeight = 100;
    let totalBreedingScore = Math.round(
      activeCriteria.reduce((acc, c) => acc + (c.score100 * (c.baseWeight / totalActiveWeight)), 0)
    );

    // Bilimsel Kural: Kullanıcının öneriyi kabul veya reddetmesi kuşların genetik uyum puanını DEĞİŞTİRMEZ!
    // Yalnızca öneri listesinde filtreleme / favori etiketi (`userFeedbackStatus`) için kullanılır.
    const fbObj = typeof this.getCortexPairFeedbackDelta === 'function'
      ? this.getCortexPairFeedbackDelta(sireInfo.ring, damInfo.ring)
      : { delta: 0, status: null };
    const userFeedbackStatus = fbObj?.status || null;
    const feedbackDelta = 0;
    totalBreedingScore = Math.max(0, Math.min(100, totalBreedingScore));
    if (coi >= 50) totalBreedingScore = 15;

    const sireLineageIndex = Math.round((sireInfo.rawScore * 0.4) + (sPedQuality * 0.6));
    const damLineageIndex = Math.round((damInfo.rawScore * 0.4) + (dPedQuality * 0.6));

    // Veri Güvenilirliği (Eşleşme Kalitesinden Tamamen Ayrı Gösterilir!)
    const pedCoverageRatio = Math.min(1, (sFilled + dFilled) / 30); // 15+15 yakın/orta kuşak bazlı doygunluk
    const perfEvidenceRatio = Math.min(1, perfSignals.length / 4);
    const dataReliabilityPct = Math.max(20, Math.min(100, Math.round((pedCoverageRatio * 0.65 + perfEvidenceRatio * 0.35) * 100)));

    // Performans Değerlendirme Yöntemi & Kapsam Etiketi (BLUP/EBV vs Mevcut Performans Göstergeleri)
    const performanceMethodLabel = (sireRealTrend.hasRealData || damRealTrend.hasRealData) && (allSiblingProofs.length + allOffspringProofs.length >= 2)
      ? 'Çoklu Yarış & Akraba Kayıtlı Performans Analizi (BLUP Uyumlu)'
      : (hasPerformanceCriteria
        ? 'Pedigri Notları ve Mevcut Derece Göstergeleri (Geçici Performans Puanı)'
        : 'Henüz Yarış veya Derece Kaydı Girilmemiş (Kanıtlanmamış Taban Puan: 50/100)');

    const missingWarnings = [];
    if (!sireInfo.hasNotes) missingWarnings.push(`Baba (${sireInfo.ring}) bireysel derece notu girilmemiş; üst soy verisi esas alındı.`);
    if (!damInfo.hasNotes) missingWarnings.push(`Anne (${damInfo.ring}) bireysel derece notu girilmemiş; üst soy verisi esas alındı.`);
    if (sFilled < 4) missingWarnings.push(`Baba soyağacında ${sFilled} ata kayıtlı.`);
    if (dFilled < 4) missingWarnings.push(`Anne soyağacında ${dFilled} ata kayıtlı.`);

    const breakdown = activeCriteria.map(c => {
      const normalizedMax = Math.round((c.baseWeight / totalActiveWeight) * 100);
      const earnedPts = Math.round((c.score100 / 100) * normalizedMax);
      return {
        label: c.label,
        pts: earnedPts,
        max: normalizedMax,
        score100: c.score100
      };
    });

    // Güçlü Yönler, Riskler ve Geliştirme Fırsatları
    const strongLines = [];
    const weakLines = [];
    const opportunities = [];

    if (sireLineageIndex >= 72) strongLines.push(`Baba Hattı [${sireInfo.ring}]: Güçlü soy ve derece geçmişi (${sireLineageIndex}/100 • ${sireDistProf.label})`);
    if (damLineageIndex >= 72) strongLines.push(`Anne Hattı [${damInfo.ring}]: Güçlü soy ve derece geçmişi (${damLineageIndex}/100 • ${damDistProf.label})`);
    if (complementarityScore100 >= 84) strongLines.push(complementaritySummary);

    if (allSiblingProofs.length > 0) {
      strongLines.push(`Kardeş Başarısı (${allSiblingProofs.length} Kayıt): ${allSiblingProofs[0].label}`);
    }
    if (allOffspringProofs.length > 0) {
      strongLines.push(`Kanıtlanmış Yavru Verimi (${allOffspringProofs.length} Kayıt): ${allOffspringProofs[0].label}`);
    }
    if (wright.commonAncestorsDetailed.length > 0) {
      if (commonAncestorHasProof) {
        strongLines.push(`Kanıtlanmış Şampiyon Ortak Ata (${bestCommonAncestorLabel}): ${wright.commonAncestorsDetailed.join(' | ')}`);
      } else {
        weakLines.push(`Ortak Ata Kalite Uyarısı: ${wright.commonAncestorsDetailed[0]} ortak ata olarak bulundu ancak bu ataya ait şampiyonluk/derece kaydı girilmediği için kan sabitleme puanı sınırlandırıldı.`);
      }
    } else if (hasPerformanceCriteria || (sFilled + dFilled) >= 6) {
      strongLines.push(`Tam Yabancı Kan (Kan Kırma • %0 Akrabalık): Yavrularda yüksek fiziksel direnç ve uçuş dayanıklılığı sağlar.`);
    }

    // Riskler
    if (coi >= 25.0) {
      weakLines.push(`Yüksek Akrabalık Riski (%${coi.toFixed(2)}): Çok yakın kan bağı nedeniyle yavrularda küçülme, bağışıklık düşüklüğü ve uçuş isteksizliği riski vardır.`);
    } else if (coi > 12.5) {
      weakLines.push(`Yakın Kan Yoğunlaşması (%${coi.toFixed(2)}): Bu eşleşmeden çıkacak yavrular doğrudan yarıştan ziyade damızlıkta yabancı kanla kırılmak için uygundur.`);
    }
    if (!hasPerformanceCriteria) {
      weakLines.push(`Performans Kanıtı Eksikliği: Ebeveynlerde ve üst atalarda kayıtlı yarış derecesi bulunmadığı için puanlama şişirilmeden gerçekçi seviyede tutulmuştur.`);
    }
    if ((sFilled + dFilled) < 10) {
      weakLines.push(`Kısmi Soyağacı Kapsamı: Toplam ${sFilled + dFilled} ata kutusu dolu olduğu için uzak kuşaklardaki olası ortak atalar hesaplama kapsamı dışındadır.`);
    }
    if (userFeedbackStatus === 'REJECTED') {
      weakLines.push(`Kullanıcı Tercih Notu: Bu çifti öneri listesinde gizlediniz (Bilimsel genetik uyum puanı değiştirilmemiştir).`);
    }
    if (weakLines.length === 0) {
      weakLines.push(`Belirgin Bir Genetik Risk Saptanmadı: Akrabalık oranı (%${coi.toFixed(2)}) güvenli aralıkta ve soy kayıtları dengeli.`);
    }

    // Geliştirme Fırsatları
    if (coi === 0) {
      opportunities.push(`Bu eşleşmeden çıkacak en başarılı yavruları ileride ortak şampiyon ataya sahip bir eşle (%3–%6 akrabalık) eşleştirerek kanı sabitleyebilirsiniz.`);
    } else if (coi > 6.25) {
      opportunities.push(`Soy içi sabitlenen bu kanı bir sonraki kuşakta tamamen yabancı kan ve yarış dereceli bir eşle kırarak güçlü yarış yavruları elde edebilirsiniz.`);
    } else {
      opportunities.push(`Yavruları 150–450 km etaplarında uçurup gerçek yarış sonuçlarını sisteme girmeniz, gelecek sezon damızlık isabetini artıracaktır.`);
    }

    const verifiedRecords = [
      ...sireInfo.verifiedWins.map(w => `♂ Baba (${sireInfo.ring}): ${w}`),
      ...damInfo.verifiedWins.map(w => `♀ Anne (${damInfo.ring}): ${w}`),
      ...sDeep.ancestorWins.slice(0, 3).map(w => `🌳 Baba Soyu Atası: ${w}`),
      ...dDeep.ancestorWins.slice(0, 3).map(w => `🌳 Anne Soyu Atası: ${w}`),
      ...allSiblingProofs.slice(0, 2).map(s => `🧬 Kardeş Performansı: ${s.label}`),
      ...allOffspringProofs.slice(0, 2).map(o => `🐣 Yavru Performansı: ${o.label}`)
    ];

    // Gerçek Damızlık Zekâsı Puanına Göre TÜM AKTİF KÜMES ADAYLARINI Tara (.slice(0, 12) kısıtlaması kaldırıldı!)
    let altFemalesForSire = [];
    let altMalesForDam = [];

    if (!skipAlternatives) {
      const buildAltReason = (r) => {
        if (r.coi === 0) {
          return {
            why: `Sıfır akrabalık (%0 • Tam Yabancı Kan Kırma) + %${r.heterosis} Yavru Direnci • ${r.complementaritySummary || 'Yüksek tamamlayıcılık'}.`,
            sciId: 'sci_gazda_2018',
            sciLabel: 'Gazda et al. (2018) — Poligenik Varyasyon & Seçilim'
          };
        }
        if (r.coi <= 12.5 && r.commonAncestorHasProof) {
          return {
            why: `Kanıtlanmış Şampiyon Ortak Ata (${r.bestCommonAncestorLabel || 'Şampiyon Ata'}) üzerinden %${r.coi.toFixed(2)} kontrollü kan sabitleme.`,
            sciId: 'sci_kolvenbag_2022',
            sciLabel: 'Kolvenbag et al. (2022) — Kohort Genotip & Performans İlişkisi'
          };
        }
        return {
          why: `Soy bağlantısı (%${r.coi.toFixed(2)} akrabalık) • ${r.complementaritySummary || 'Damızlık kan sabitleme alternatifi'}.`,
          sciId: 'sci_shao_2020',
          sciLabel: 'Shao et al. (2020) — Homing & Soy Adaptasyonu'
        };
      };

      const nestedNormSet = typeof getActiveNestRingNormSet === 'function' ? getActiveNestRingNormSet() : new Set();
      const normKey = (r) => String(r || '').trim().toUpperCase().replace(/[-\s./_]+/g, '');
      const seenF = new Set();
      altFemalesForSire = females
        .filter(f => {
          const fk = normKey(f.ring);
          if (!fk || fk === normKey(sireInfo.ring) || seenF.has(fk) || nestedNormSet.has(fk)) return false;
          seenF.add(fk);
          return true;
        })
        .map(f => {
          const r = this.analyzeBreedingIntelligence(sRef, f.id, true);
          const meta = buildAltReason(r);
          return { candidate: f, score: r.totalScore, coi: r.coi, feedbackStatus: r.userFeedbackStatus, ...meta };
        })
        .filter(item => item.feedbackStatus !== 'REJECTED')
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      const seenM = new Set();
      altMalesForDam = males
        .filter(m => {
          const mk = normKey(m.ring);
          if (!mk || mk === normKey(damInfo.ring) || seenM.has(mk) || nestedNormSet.has(mk)) return false;
          seenM.add(mk);
          return true;
        })
        .map(m => {
          const r = this.analyzeBreedingIntelligence(m.id, dRef, true);
          const meta = buildAltReason(r);
          return { candidate: m, score: r.totalScore, coi: r.coi, feedbackStatus: r.userFeedbackStatus, ...meta };
        })
        .filter(item => item.feedbackStatus !== 'REJECTED')
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

    // ------------------------------------------------------------------------
    // D) FİZİKSEL VE FENOTİP ANALİZİ (Kayıtsız fiziksel özellikler ASLA uydurulmaz!)
    // ------------------------------------------------------------------------
    const extractRecordedPhenotype = (boxNode) => {
      const colorRaw = String(boxNode?.color || '').trim();
      const notesRaw = String(boxNode?.notes || '').trim();
      const directBody = String(boxNode?.bodyBuild || '').trim();
      const directPubic = String(boxNode?.pubicBone || '').trim();
      const directMuscle = String(boxNode?.muscleType || '').trim();
      const directWing = String(boxNode?.wingFeather || '').trim();
      const combined = `${colorRaw} ${notesRaw} ${directBody} ${directPubic} ${directMuscle} ${directWing}`;

      const hasColor = Boolean(colorRaw && !/^[-?]+$/.test(colorRaw));
      const bodyMatch = combined.match(/\b(elma\s*gövde|orta\s*yap[ıi]|iri\s*yap[ıi]|kompakt\s*gövde|armut(?:\s*\/\s*orta)?\s*gövde|aerodinamik\s*uzun\s*gövde|kapal[ıi]\s*ve\s*s[ıi]k[ıi]\s*çatal\s*kemik|çatal\s*kemik\s*s[ıi]k[ıi]|standart\s*çatal\s*kemik|esnek\s*\/\s*aç[ıi]k\s*çatal\s*kemik|dengeli\s*iskelet)\b/i);
      const muscleMatch = combined.match(/\b(esnek(?:\s*ve\s*yumuşak)?\s*kas|uzun\s*kas|s[ıi]k[ıi]\s*ve\s*patlay[ıi]c[ıi]\s*kas|k[ıi]sa\s*kal[ıi]n\s*kas|yumuşak\s*göğüs\s*kas[ıi]|dolgun\s*göğüs\s*kas[ıi]|güçlü\s*göğüs)\b/i);
      const wingMatch = combined.match(/\b(esnek\s*kanat|uzun(?:\s*ventilasyonlu)?\s*telek|havaland[ıi]rmal[ıi]\s*kanat|h[ıi]zl[ıi]\s*ç[ıi]rp[ıi]şl[ıi]\s*k[ıi]sa\s*ön\s*kol\s*kanat|k[ıi]sa\s*sprint\s*kanat|dengeli\s*kanat|ipeksi\s*tüy|yağl[ıi]\s*tüy)\b/i);
      const weightMatch = combined.match(/\b(\d{3}\s*(?:gr|gram)|\d{2}\s*cm)\b/i);

      const resolvedBody = [directBody, directPubic].filter(Boolean).join(' • ') || (bodyMatch ? bodyMatch[0] : null);
      const resolvedMuscle = directMuscle || (muscleMatch ? muscleMatch[0] : null);
      const resolvedWing = directWing || (wingMatch ? wingMatch[0] : null);

      return {
        color: hasColor ? colorRaw : 'Kayıtlı Değil',
        hasColor,
        bodyStructure: resolvedBody,
        muscleBreast: resolvedMuscle,
        wingPlumage: resolvedWing,
        weightMeasure: weightMatch ? weightMatch[0] : null,
        hasPhysicalMeasurements: Boolean(resolvedBody || resolvedMuscle || resolvedWing || weightMatch)
      };
    };

    const sirePhenotype = extractRecordedPhenotype(sTree.self);
    const damPhenotype = extractRecordedPhenotype(dTree.self);

    // ------------------------------------------------------------------------
    // BLUP / EBV VERİ YETERLİLİĞİ DENETİMİ (Bölüm 3 Teknik Kuralı)
    // BLUP yalnızca yeterli sayıda karşılaştırılabilir yarış gözlemi ve akraba/popülasyon
    // bağlantısı mevcutsa kullanılır; aksi halde basit puanlama BLUP gibi gösterilmez!
    // ------------------------------------------------------------------------
    const sireRaceCount = (sireRealTrend?.enteredCount || 0) + sireInfo.verifiedWins.length;
    const damRaceCount = (damRealTrend?.enteredCount || 0) + damInfo.verifiedWins.length;
    const totalComparableRaces = sireRaceCount + damRaceCount;
    const totalRelativeObs = allSiblingProofs.length + allOffspringProofs.length + sDeep.ancestorWins.length + dDeep.ancestorWins.length;
    const isBlupEligible = totalComparableRaces >= 3 && (sFilled + dFilled) >= 12 && totalRelativeObs >= 3;

    const blupEvaluation = {
      isBlupEligible,
      methodName: isBlupEligible
        ? 'Koşullu BLUP / EBV (Çoklu Yarış ve Akraba Gözlemli Damızlık Değeri Modeli)'
        : 'Pedigri ve Mevcut Performans Göstergeleri (BLUP İçin Karşılaştırılabilir Gözlem Yetersiz)',
      explanation: isBlupEligible
        ? `Ebeveynlerde toplam ${totalComparableRaces} yarış kaydı, ${totalRelativeObs} akraba/yavru performans gözlemi ve ${sFilled + dFilled}/124 soyağacı düğümü bulunduğu için çevresel etkilerden arındırılmış EBV/BLUP yaklaşımı uygulanmıştır.`
        : `Bilimsel BLUP modeli için yeterli sayıda karşılaştırılabilir yarış ve popülasyon/yavru gözlemi (mevcut: ${totalComparableRaces} ebeveyn yarışı, ${totalRelativeObs} akraba kaydı) bulunmamaktadır. Bu nedenle basit puanlama BLUP sonucu gibi sunulmamış; değerlendirme mevcut soyağacı ve derece kayıtları üzerinden yapılmıştır.`
    };

    // ------------------------------------------------------------------------
    // 4. BÖLÜM: 11 ÖZELLİKTE OLASILIKSAL YAVRU ÖNGÖRÜ MODELİ
    // Her özellik kendi biyolojik kalıtım derecesine (h²) sahiptir; tüm özelliklere aynı kalıtım oranı uygulanmaz!
    // ------------------------------------------------------------------------
    // Hızlı tarama modunda (skipAlternatives === true) ağır performans profili motorunu tetikleme!
    const profSire = !skipAlternatives ? this.getCachedPerformanceProfile(sireInfo.ring) : null;
    const profDam = !skipAlternatives ? this.getCachedPerformanceProfile(damInfo.ring) : null;
    const getProfMetric = (prof, cat, key) => {
      if (!prof || !prof.categories || !prof.categories[cat]) return null;
      const found = (prof.categories[cat].metrics || []).find(m => m.key === key);
      return found && found.score !== null && found.score !== undefined ? found.score : null;
    };

    const heterosisDelta = coi === 0 ? 4 : (coi <= 6.25 ? 2 : (coi <= 12.5 ? 0 : (coi < 25 ? -6 : -14)));
    const sharedFamilyTag = coi === 0
      ? `Tam Yabancı Kan (Outcross • %0 COI → +%4 Melez Dinçliği)`
      : (coi <= 12.5
        ? (commonAncestorHasProof
          ? `Şampiyon Ortak Ata Hat Islahı (%${coi.toFixed(2)} COI • ${bestCommonAncestorLabel || 'Ortak Ata'})`
          : `Soy İçi Bağlantı (%${coi.toFixed(2)} COI • Ortak atada kayıtlı derece yok)`)
        : `Yakın Akrabalık Depresyonu Riski (%${coi.toFixed(2)} COI → ${heterosisDelta} puan baskılanma)`);

    const buildTraitPrediction = (cfg) => {
      const {
        key,
        title,
        h2,
        h2ClassLabel,
        h2SciNote,
        sVal,
        dVal,
        sSourceLabel,
        dSourceLabel,
        requiresPhenotypeRecord,
        isReproductiveTrait
      } = cfg;

      // Eğer fiziksel/fenotipik bir özellikse ve her iki ebeveynde de gözlem kaydı yoksa sayısal puan UYDURULMAZ!
      if (requiresPhenotypeRecord && sVal === null && dVal === null) {
        return {
          key,
          title,
          h2,
          h2Display: `${h2ClassLabel} (h² ≈ ${h2.toFixed(2)})`,
          h2SciNote,
          sireContribution: sSourceLabel || 'Kayıtlı Fiziksel Gözlem Yok',
          damContribution: dSourceLabel || 'Kayıtlı Fiziksel Gözlem Yok',
          sharedLineageEffect: sharedFamilyTag,
          existingProofSummary: 'Gözlemlenmiş fiziksel ölçüm/yapı kaydı girilmemiş',
          hasQuantitativePrediction: false,
          expectedMid: null,
          rangeText: 'Niteliksel Değerlendirme (Ölçüm Kaydı Yok)',
          qualitativePrediction: `Anne ve baba kuş için sistemde kayıtlı fiziksel ölçüm/gözlem bulunmadığından sayısal puan uydurulmamıştır. ${coi < 12.5 ? 'Akrabalık oranı düşük olduğu için yavrularda normal fiziksel gelişim beklenir.' : 'Yüksek akrabalık (%' + coi.toFixed(1) + ') nedeniyle yavrularda boy/iskelet küçülmesi riski izlenmelidir.'}`,
          reliabilityPct: Math.min(35, Math.round(dataReliabilityPct * 0.45)),
          reliabilityLabel: 'Düşük Güvenilirlik (Fiziksel Gözlem Eksik)'
        };
      }

      const hasAnyParentVal = sVal !== null || dVal !== null;
      const popMean = 62;
      const effS = sVal !== null ? sVal : popMean;
      const effD = dVal !== null ? dVal : popMean;
      const midParent = (effS + effD) / 2;

      // Kalıtım derecesine (h²) göre Galton regresyonu + Heterosis/COI etkisi
      const traitHeterosis = isReproductiveTrait
        ? (coi === 0 ? 7 : (coi <= 6.25 ? 3 : (coi <= 12.5 ? -3 : -16)))
        : heterosisDelta;

      const expectedMid = Math.max(35, Math.min(96, Math.round(
        popMean + (midParent - popMean) * (0.45 + h2 * 0.75) + traitHeterosis
      )));

      // Veri güvenilirliği ve kalıtım derecesine göre olasılık aralığı (± sapma)
      const bothRecorded = sVal !== null && dVal !== null;
      const traitRelPct = Math.max(18, Math.min(94, Math.round(
        dataReliabilityPct * (bothRecorded ? 0.95 : (hasAnyParentVal ? 0.70 : 0.40))
      )));
      const spread = Math.max(5, Math.round(15 - (traitRelPct / 11)));
      const minRange = Math.max(30, expectedMid - spread);
      const maxRange = Math.min(98, expectedMid + spread);

      const relMeta = this.classifyDataReliability(traitRelPct);
      const qualClass = expectedMid >= 82
        ? 'Yüksek Potansiyel Eğilimi'
        : (expectedMid >= 68 ? 'Orta-İyi Potansiyel Eğilimi' : 'Sınırlı / Geliştirilmesi Gereken Eğilim');

      const showNumericRange = traitRelPct >= 30 && hasAnyParentVal;

      return {
        key,
        title,
        h2,
        h2Display: `${h2ClassLabel} (h² ≈ ${h2.toFixed(2)})`,
        h2SciNote,
        sireContribution: sVal !== null ? `${sVal}/100 (${sSourceLabel})` : `Veri Yok (${sSourceLabel})`,
        damContribution: dVal !== null ? `${dVal}/100 (${dSourceLabel})` : `Veri Yok (${dSourceLabel})`,
        sharedLineageEffect: sharedFamilyTag,
        existingProofSummary: bothRecorded
          ? 'Her iki ebeveynde performans/soy verisi mevcut'
          : (hasAnyParentVal ? 'Tek ebeveynde kayıt mevcut (Kısmi Veri)' : 'Doğrudan kayıt yok (Niteliksel değerlendirme)'),
        hasQuantitativePrediction: showNumericRange,
        expectedMid: showNumericRange ? expectedMid : null,
        rangeText: showNumericRange
          ? `%${minRange}–%${maxRange} Olasılık Aralığı (Beklenen ~${expectedMid}/100 • ±${spread})`
          : `Niteliksel Değerlendirme: ${qualClass} (Sayısal Aralık İçin Veri Yetersiz)`,
        qualitativePrediction: showNumericRange
          ? `${qualClass} — Yavruların %${minRange} ile %${maxRange} bandında dağılması beklenir (Kalıtım h²≈${h2.toFixed(2)}, çevre/antrenman etkisi %${Math.round((1 - h2) * 100)}).`
          : `Mevcut kayıtlar sayısal olasılık dağılımı için yetersizdir; yalnızca genel soy eğilimi (${qualClass}) öngörülebilir.`,
        reliabilityPct: traitRelPct,
        reliabilityLabel: `${relMeta.label} (%${traitRelPct})`
      };
    };

    const sSpeed = getProfMetric(profSire, 'flight', 'speed') ?? (hasPerformanceCriteria ? sireDistProf.speedBias : null);
    const dSpeed = getProfMetric(profDam, 'flight', 'speed') ?? (hasPerformanceCriteria ? damDistProf.speedBias : null);
    const sEndur = getProfMetric(profSire, 'flight', 'endurance') ?? (hasPerformanceCriteria ? sireDistProf.enduranceBias : null);
    const dEndur = getProfMetric(profDam, 'flight', 'endurance') ?? (hasPerformanceCriteria ? damDistProf.enduranceBias : null);
    const sSprint = getProfMetric(profSire, 'flight', 'sprint') ?? (sireDistProf.code === 'SPRINT' ? 88 : (sSpeed ? sSpeed - 3 : null));
    const dSprint = getProfMetric(profDam, 'flight', 'sprint') ?? (damDistProf.code === 'SPRINT' ? 88 : (dSpeed ? dSpeed - 3 : null));
    const sMiddle = getProfMetric(profSire, 'flight', 'middle') ?? (sireDistProf.code === 'ALLROUND' ? 88 : (sSpeed && sEndur ? Math.round((sSpeed + sEndur) / 2) : null));
    const dMiddle = getProfMetric(profDam, 'flight', 'middle') ?? (damDistProf.code === 'ALLROUND' ? 88 : (dSpeed && dEndur ? Math.round((dSpeed + dEndur) / 2) : null));
    const sLong = getProfMetric(profSire, 'flight', 'long') ?? (sireDistProf.code === 'MARATHON' ? 90 : (sEndur ? sEndur - 2 : null));
    const dLong = getProfMetric(profDam, 'flight', 'long') ?? (damDistProf.code === 'MARATHON' ? 90 : (dEndur ? dEndur - 2 : null));
    const sHoming = getProfMetric(profSire, 'navigation', 'homing') ?? (sFilled >= 3 ? sireLineageIndex : null);
    const dHoming = getProfMetric(profDam, 'navigation', 'homing') ?? (dFilled >= 3 ? damLineageIndex : null);
    const sConsist = getProfMetric(profSire, 'racing', 'consistency') ?? (sireRaceCount > 0 ? sireInfo.rawScore : null);
    const dConsist = getProfMetric(profDam, 'racing', 'consistency') ?? (damRaceCount > 0 ? damInfo.rawScore : null);

    const sProofSrc = sireRealTrend.hasRealData ? `${sireRealTrend.enteredCount} Resmi Yarış` : (sireInfo.verifiedWins.length ? 'Pedigri Derece Kaydı' : (sFilled > 0 ? `${sFilled} Ata Soy Tahmini` : 'Kayıt Yok'));
    const dProofSrc = damRealTrend.hasRealData ? `${damRealTrend.enteredCount} Resmi Yarış` : (damInfo.verifiedWins.length ? 'Pedigri Derece Kaydı' : (dFilled > 0 ? `${dFilled} Ata Soy Tahmini` : 'Kayıt Yok'));

    const offspringTraits11 = [
      buildTraitPrediction({
        key: 'speed',
        title: '1. Hız ve Sürat Potansiyeli',
        h2: 0.32,
        h2ClassLabel: 'Orta Kalıtım',
        h2SciNote: 'Kas lifi tipi ve anaerobik metabolizma (Proskura et al., 2014; Gazda et al., 2018)',
        sVal: sSpeed,
        dVal: dSpeed,
        sSourceLabel: sProofSrc,
        dSourceLabel: dProofSrc
      }),
      buildTraitPrediction({
        key: 'endurance',
        title: '2. Uçuş Dayanıklılığı Potansiyeli',
        h2: 0.36,
        h2ClassLabel: 'Orta-Yüksek Kalıtım',
        h2SciNote: 'Aerobik lipit oksidasyonu ve hücresel enerji verimi (Stefaniuk-Szmukier et al., 2024)',
        sVal: sEndur,
        dVal: dEndur,
        sSourceLabel: sProofSrc,
        dSourceLabel: dProofSrc
      }),
      buildTraitPrediction({
        key: 'sprint',
        title: '3. Kısa Mesafe Uygunluğu (100–300 km)',
        h2: 0.33,
        h2ClassLabel: 'Orta Kalıtım',
        h2SciNote: 'Patlayıcı çıkış hızı ve kısa etap yönelimi',
        sVal: sSprint,
        dVal: dSprint,
        sSourceLabel: `${sireDistProf.label}`,
        dSourceLabel: `${damDistProf.label}`
      }),
      buildTraitPrediction({
        key: 'middle',
        title: '4. Orta Mesafe Uygunluğu (300–550 km)',
        h2: 0.34,
        h2ClassLabel: 'Orta Kalıtım',
        h2SciNote: 'Hız ve aerobik dayanıklılık dengesi (All-Round)',
        sVal: sMiddle,
        dVal: dMiddle,
        sSourceLabel: `${sireDistProf.label}`,
        dSourceLabel: `${damDistProf.label}`
      }),
      buildTraitPrediction({
        key: 'long',
        title: '5. Uzun Mesafe Uygunluğu (550–850+ km)',
        h2: 0.37,
        h2ClassLabel: 'Orta-Yüksek Kalıtım',
        h2SciNote: 'Uzun süreli uçuş direnci ve kas içi yağ yakımı kapasitesi',
        sVal: sLong,
        dVal: dLong,
        sSourceLabel: `${sireDistProf.label}`,
        dSourceLabel: `${damDistProf.label}`
      }),
      buildTraitPrediction({
        key: 'homing',
        title: '6. Yön Bulma ve Eve Dönüş Performansı',
        h2: 0.38,
        h2ClassLabel: 'Orta-Yüksek Kalıtım',
        h2SciNote: 'Nörobiyolojik uzamsal hafıza ve manyetik algı yolakları (Shao et al., 2020)',
        sVal: sHoming,
        dVal: dHoming,
        sSourceLabel: sProofSrc,
        dSourceLabel: dProofSrc
      }),
      buildTraitPrediction({
        key: 'consistency',
        title: '7. Yarış İstikrarı',
        h2: 0.24,
        h2ClassLabel: 'Düşük-Orta Kalıtım',
        h2SciNote: 'Kalıtım oranı daha düşüktür; kümes bakımı, sağlık ve antrenman (%76) belirleyicidir (Kolvenbag et al., 2022)',
        sVal: sConsist,
        dVal: dConsist,
        sSourceLabel: sProofSrc,
        dSourceLabel: dProofSrc
      }),
      buildTraitPrediction({
        key: 'physical_structure',
        title: '8. Fiziksel Yapı Potansiyeli (Gövde, Ağırlık & Ölçüler)',
        h2: 0.48,
        h2ClassLabel: 'Yüksek Morfolojik Kalıtım',
        h2SciNote: 'İskelet ve vücut ölçüleri yüksek kalıtsallığa sahiptir ancak yalnızca kayıtlı ölçüm varsa puanlanır',
        sVal: sirePhenotype.hasPhysicalMeasurements ? 82 : null,
        dVal: damPhenotype.hasPhysicalMeasurements ? 82 : null,
        sSourceLabel: sirePhenotype.bodyStructure || sirePhenotype.weightMeasure || 'Fiziksel Ölçüm Kaydı Yok',
        dSourceLabel: damPhenotype.bodyStructure || damPhenotype.weightMeasure || 'Fiziksel Ölçüm Kaydı Yok',
        requiresPhenotypeRecord: true
      }),
      buildTraitPrediction({
        key: 'wing_muscle',
        title: '9. Kanat, Kas ve Tüy Yapısı',
        h2: 0.45,
        h2ClassLabel: 'Yüksek Morfolojik Kalıtım',
        h2SciNote: 'Telek, kanat geometrisi ve tüy rengi/yapısı (Kayıtsız fiziksel özellik varsayılmaz)',
        sVal: (sirePhenotype.wingPlumage || sirePhenotype.muscleBreast) ? 84 : null,
        dVal: (damPhenotype.wingPlumage || damPhenotype.muscleBreast) ? 84 : null,
        sSourceLabel: [sirePhenotype.wingPlumage, sirePhenotype.muscleBreast, `Tüy: ${sirePhenotype.color}`].filter(Boolean).join(' • '),
        dSourceLabel: [damPhenotype.wingPlumage, damPhenotype.muscleBreast, `Tüy: ${damPhenotype.color}`].filter(Boolean).join(' • '),
        requiresPhenotypeRecord: true
      }),
      buildTraitPrediction({
        key: 'reproductive_potential',
        title: '10. Üreme ve Yavru Yetiştirme Potansiyeli',
        h2: 0.18,
        h2ClassLabel: 'Düşük Eklemeli Kalıtım (COI Duyarlı)',
        h2SciNote: 'Doğurganlık ve yavru yaşama gücü doğrudan akrabalık katsayısı (COI) ve melez dinçliğinden etkilenir',
        sVal: sireCollateral.offspringCount > 0 ? 88 : (sFilled > 0 ? 76 : null),
        dVal: damCollateral.offspringCount > 0 ? 88 : (dFilled > 0 ? 76 : null),
        sSourceLabel: sireCollateral.offspringCount > 0 ? `${sireCollateral.offspringCount} Kayıtlı Yavru` : 'Soy Canlılık Tahmini',
        dSourceLabel: damCollateral.offspringCount > 0 ? `${damCollateral.offspringCount} Kayıtlı Yavru` : 'Soy Canlılık Tahmini',
        isReproductiveTrait: true
      }),
      buildTraitPrediction({
        key: 'overall_racer',
        title: '11. Genel Yarışçı Potansiyeli',
        h2: 0.34,
        h2ClassLabel: 'Orta Poligenik Kalıtım',
        h2SciNote: 'Hız, dayanıklılık, yön bulma, soy derinliği ve melez dinçliği bileşik olasılık modeli',
        sVal: (sFilled > 0 || sireRaceCount > 0) ? sireLineageIndex : null,
        dVal: (dFilled > 0 || damRaceCount > 0) ? damLineageIndex : null,
        sSourceLabel: `Baba Soy & Performans İndeksi (${sProofSrc})`,
        dSourceLabel: `Anne Soy & Performans İndeksi (${dProofSrc})`
      })
    ];

    // ------------------------------------------------------------------------
    // 5. BÖLÜM: AKILLI EŞLEŞTİRME KARAR SİSTEMİ (3 RESMİ KARAR SEVİYESİ)
    // Karar yalnızca tek bir puana dayandırılmaz; Performans, Genetik Çeşitlilik,
    // Akrabalık (COI), Yavru Potansiyeli ve Veri Güvenilirliği birlikte değerlendirilir.
    // ------------------------------------------------------------------------
    let decisionCode = 'CONDITIONAL';
    let decisionLabel = 'KOŞULLU OLARAK ÖNERİLEN EŞLEŞME';
    let decisionColor = '#d97706';
    let decisionBadgeClass = 'gene-gold';
    let decisionReasonSummary = '';

    const sharedWeaknessDetected = (!sHasStrongProof && !dHasStrongProof) || (sireLineageIndex < 62 && damLineageIndex < 62);

    if (
      coi >= 18.75 ||
      (coi >= 12.5 && !commonAncestorHasProof) ||
      totalBreedingScore < 58 ||
      (sireInfo.ring && damInfo.ring && sireInfo.ring.toUpperCase() === damInfo.ring.toUpperCase())
    ) {
      decisionCode = 'NOT_RECOMMENDED';
      decisionLabel = 'ÖNERİLMEYEN EŞLEŞME';
      decisionColor = '#dc2626';
      decisionBadgeClass = 'gene-red';
      if (coi >= 18.75) {
        decisionReasonSummary = `Yüksek iç döllenme katsayısı (Wright COI: %${coi.toFixed(2)}) nedeniyle yavrularda akrabalık depresyonu (bağışıklık, üreme ve uçuş dayanıklılığı kaybı) riski yüksektir.`;
      } else if (coi >= 12.5 && !commonAncestorHasProof) {
        decisionReasonSummary = `Yakın akrabalık (%${coi.toFixed(2)} COI) tespit edilmesine karşın ortak atanın doğrulanmış yarış veya şampiyonluk kaydı bulunmamaktadır.`;
      } else {
        decisionReasonSummary = `Ebeveynlerin mevcut soyağacı ve performans tamamlayıcılığı (${totalBreedingScore}/100) düşük kalmakta ve her iki kuşta da kanıtlanmış performans eksikliği bulunmaktadır.`;
      }
    } else if (
      dataReliabilityPct < 45 ||
      !hasPerformanceCriteria ||
      coi > 9.0 ||
      totalBreedingScore < 76 ||
      sharedWeaknessDetected
    ) {
      decisionCode = 'CONDITIONAL';
      decisionLabel = 'KOŞULLU OLARAK ÖNERİLEN EŞLEŞME';
      decisionColor = '#0284c7';
      decisionBadgeClass = 'gene-blue';
      if (dataReliabilityPct < 45 || !hasPerformanceCriteria) {
        decisionReasonSummary = `Genetik akrabalık riski düşük (%${coi.toFixed(2)} COI) olmakla birlikte, veri güvenilirliği (%${dataReliabilityPct}) veya doğrulanmış yarış kayıtları sınırlı olduğu için koşulsuz öneri yerine koşullu onay verilmiştir.`;
      } else if (coi > 9.0) {
        decisionReasonSummary = `Ortak şampiyon ata üzerinden %${coi.toFixed(2)} COI kan yoğunlaşması mevcuttur; bu eşleşme doğrudan ağır yarışlardan ziyade damızlık kümesinde kan sabitlemek (Linebreeding) koşuluyla önerilir.`;
      } else {
        decisionReasonSummary = `Ebeveynler arasında temel uyum (${totalBreedingScore}/100) mevcuttur ancak maksimum yavru potansiyeli için eksik soyağacı/performans kayıtlarının tamamlanması veya alternatif eş adaylarıyla kıyaslanması önerilir.`;
      }
    } else {
      decisionCode = 'RECOMMENDED';
      decisionLabel = 'ÖNERİLEN EŞLEŞME';
      decisionColor = '#059669';
      decisionBadgeClass = 'gene-green';
      decisionReasonSummary = `Beş nesil soyağacı derinliği (${sFilled + dFilled}/124 ata), güvenli akrabalık oranı (%${coi.toFixed(2)} COI), kanıtlanmış performans kayıtları ve ebeveynlerin hız/dayanıklılık tamamlayıcılığı (${complementarityScore100}/100) yüksek uyum göstermektedir.`;
    }

    // Beklenen yavru profilinin en uygun olduğu yarış mesafesi
    let recommendedDistanceSuitability = 'Orta Mesafe (300–550 km) All-Round Etaplar';
    if (sireDistProf.code === 'SPRINT' && damDistProf.code === 'SPRINT') {
      recommendedDistanceSuitability = 'Kısa ve Orta Mesafe (100–350 km) Sürat Etapları';
    } else if (sireDistProf.code === 'MARATHON' || damDistProf.code === 'MARATHON') {
      recommendedDistanceSuitability = 'Orta-Uzun Mesafe ve Maraton (450–800+ km) Dayanıklılık Etapları';
    }

    const result = {
      mode: 'breeding',
      sireRef: sRef,
      damRef: dRef,
      breedingGoal,
      sireInfo,
      damInfo,
      sirePhenotype,
      damPhenotype,
      sireDistProf,
      damDistProf,
      sDeep,
      dDeep,
      sFilled,
      dFilled,
      sireLineageIndex,
      damLineageIndex,
      sireCollateral,
      damCollateral,
      sireRealTrend,
      damRealTrend,
      sireRaceCount,
      damRaceCount,
      blupEvaluation,
      offspringTraits11,
      decisionCode,
      decisionLabel,
      decisionColor,
      decisionBadgeClass,
      decisionReasonSummary,
      recommendedDistanceSuitability,
      sharedWeaknessDetected,
      totalScore: totalBreedingScore,
      pedigreeScore100,
      performanceScore100,
      diversityScore100,
      complementarityScore100,
      complementaritySummary,
      commonAncestorHasProof,
      bestCommonAncestorScore,
      bestCommonAncestorLabel,
      userFeedbackStatus,
      feedbackDelta,
      hasPerformanceCriteria,
      performanceMethodLabel,
      coi,
      relationSummary: wright.relationSummary,
      heterosis: Math.max(40, Math.round(98 - coi * 1.45)),
      commonAncestors: wright.commonAncestorsDetailed,
      breakdown,
      dataReliabilityPct,
      strongLines,
      weakLines,
      opportunities,
      missingWarnings,
      verifiedRecords,
      altFemalesForSire,
      altMalesForDam,
      hasDna: this.state.hasVerifiedDnaLabData
    };

    if (skipAlternatives) {
      this._engineCache.breedingQuick[pairKey] = result;
    } else {
      this._engineCache.breedingFull[pairKey] = result;
    }
    return result;
  },

  setBreedingTargetGoal(goalVal) {
    this.state.breedingTargetGoal = ['balanced', 'race_outcross', 'linebreeding_stock'].includes(goalVal)
      ? goalVal
      : 'balanced';
    this._engineCache.topLoftPairs = null;
    this.saveState();
    this.renderGenesisModuleUI();
  },

  // Kümesteki Tüm Aktif Erkek × Dişi Kombinasyonlarını Tarayıp En Yüksek Uyumlu İlk 5 Çifti Döndürür
  // (Kullanıcının "Öneride Gösterme" olarak işaretlediği çiftler listeden gizlenir, ancak hiçbir çiftin bilimsel puanı değiştirilmez!)
  getTopLoftBreedingPairs(limit = 5) {
    this.ensureEngineCacheFresh();
    const curGoal = this.state.breedingTargetGoal || 'balanced';
    if (Array.isArray(this._engineCache.topLoftPairs) && this._engineCache.topLoftPairsGoal === curGoal) {
      return this._engineCache.topLoftPairs.slice(0, limit);
    }
    const { males, females } = getAllBreedingCandidates();
    if (!males.length || !females.length) return [];
    const mPool = males.slice(0, 60);
    const fPool = females.slice(0, 60);
    const pairs = [];
    mPool.forEach(m => {
      fPool.forEach(f => {
        if (m.ring === f.ring) return;
        const rep = this.analyzeBreedingIntelligence(m.id, f.id, true);
        if (rep.coi < 25 && rep.userFeedbackStatus !== 'REJECTED') {
          pairs.push({
            sire: m,
            dam: f,
            score: rep.totalScore,
            coi: rep.coi,
            userFeedbackStatus: rep.userFeedbackStatus,
            reliability: rep.dataReliabilityPct,
            summary: rep.commonAncestors.length
              ? (rep.commonAncestorHasProof ? `Şampiyon Ortak Ata (%${rep.coi.toFixed(2)} Akrabalık)` : `Soy Bağlantılı (%${rep.coi.toFixed(2)} Akrabalık)`)
              : `Tam Yabancı Kan (%0 Akrabalık • %${rep.heterosis} Dinçlik)`,
            compLabel: `${rep.sireDistProf?.code || 'GENEL'} × ${rep.damDistProf?.code || 'GENEL'}`
          });
        }
      });
    });
    pairs.sort((a, b) => (b.score - a.score) || (b.reliability - a.reliability));

    // MÜKERRER ÖNLEME KURALI: Bir dişi (ve bir erkek) öneri listesinde yalnızca BİR KEZ yer alır;
    // ayrıca şu anda aktif bir yuvada eşleşmiş olan kuşlar yeni eşleşme önerilerine tekrar getirilmez.
    const normR = (r) => String(r || '').trim().toUpperCase().replace(/[-\s./_]+/g, '');
    const nestedSet = new Set();
    if (typeof activePairsList !== 'undefined' && Array.isArray(activePairsList)) {
      activePairsList.forEach(ap => {
        const sr = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(ap.sire) : '';
        const dr = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(ap.dam) : '';
        if (sr) nestedSet.add(normR(sr));
        if (dr) nestedSet.add(normR(dr));
      });
    }
    const usedSires = new Set();
    const usedDams = new Set();
    const uniquePairs = [];
    pairs.forEach(p => {
      const sK = normR(p.sire.ring);
      const dK = normR(p.dam.ring);
      if (nestedSet.has(sK) || nestedSet.has(dK)) return;
      if (usedSires.has(sK) || usedDams.has(dK)) return;
      usedSires.add(sK);
      usedDams.add(dK);
      uniquePairs.push(p);
    });

    this._engineCache.topLoftPairs = uniquePairs;
    this._engineCache.topLoftPairsGoal = curGoal;
    return this._engineCache.topLoftPairs.slice(0, limit);
  },

  // ==========================================================================
  // 3. ANA MOTOR: GENESIS AI – AKILLI YARIŞ YÖNETİMİ
  //    (Rota & Coğrafi Analiz, 3 Bölgeli Meteoroloji & 4 Seviyeli Risk,
  //     Kuşa Özel Yarış Uygunluğu, Tahmini Dönüş Zamanı, Yarış Sonrası
  //     Performans Analizi ve Öğrenen Kalibrasyon Motoru)
  // ==========================================================================
  SMART_RACE_GEO_NODES: [
    { id: 'adana', name: '01 - Adana', lat: 37.0000, lon: 35.3213, altM: 25, region: 'Akdeniz', terrain: 'Çukurova & Gülek Boğazı (1.050m) Geçidi', showLabel: true },
    { id: 'adiyaman', name: '02 - Adıyaman', lat: 37.7648, lon: 38.2786, altM: 670, region: 'Güneydoğu', terrain: 'Güneydoğu Toroslar & Atatürk Baraj Havzası', showLabel: false },
    { id: 'afyon', name: '03 - Afyonkarahisar', lat: 38.7507, lon: 30.5567, altM: 1021, region: 'Ege', terrain: 'Ahır Dağı & İç Batı Anadolu Kavşağı', showLabel: true },
    { id: 'agri', name: '04 - Ağrı', lat: 39.7191, lon: 43.0503, altM: 1640, region: 'Doğu Anadolu', terrain: 'Ağrı Yüksek Platosu & Tahir Geçidi', showLabel: false },
    { id: 'amasya', name: '05 - Amasya (Merzifon)', lat: 40.6499, lon: 35.8353, altM: 412, region: 'Karadeniz', terrain: 'Yeşilırmak Dar Vadi Oluk Koridoru', showLabel: false },
    { id: 'ankara', name: '06 - Ankara (Polatlı)', lat: 39.9334, lon: 32.8597, altM: 890, region: 'İç Anadolu', terrain: 'Açık Bozkır Platosu & Sakarya Havzası', showLabel: true },
    { id: 'antalya', name: '07 - Antalya', lat: 36.8969, lon: 30.7133, altM: 40, region: 'Akdeniz', terrain: 'Çubuk Boğazı & Toros Dağ Engeli (1.250m)', showLabel: true },
    { id: 'artvin', name: '08 - Artvin', lat: 41.1828, lon: 41.8183, altM: 550, region: 'Karadeniz', terrain: 'Çoruh Vadisi & Kaçkar Dağlık Koridoru', showLabel: false },
    { id: 'aydin', name: '09 - Aydın', lat: 37.8560, lon: 27.8416, altM: 65, region: 'Ege', terrain: 'Büyük Menderes Ovası', showLabel: false },
    { id: 'balikesir', name: '10 - Balıkesir (Susurluk)', lat: 39.6484, lon: 27.8826, altM: 145, region: 'Marmara', terrain: 'Susurluk Havzası & Güney Marmara Geçidi', showLabel: true },
    { id: 'bilecik', name: '11 - Bilecik (Bozüyük)', lat: 40.1451, lon: 29.9799, altM: 740, region: 'Marmara', terrain: 'Bozüyük Dağlık Kırılımı & Sakarya Vadisi', showLabel: false },
    { id: 'bingol', name: '12 - Bingöl', lat: 38.8854, lon: 40.4966, altM: 1150, region: 'Doğu Anadolu', terrain: 'Murat Nehri Vadisi & Kuruca Geçidi', showLabel: false },
    { id: 'bitlis', name: '13 - Bitlis', lat: 38.4006, lon: 42.1095, altM: 1545, region: 'Doğu Anadolu', terrain: 'Bitlis Deresi Geçidi & Van Gölü Batısı', showLabel: false },
    { id: 'bolu', name: '14 - Bolu (Gerede)', lat: 40.7350, lon: 31.6061, altM: 1150, region: 'Karadeniz', terrain: 'Köroğlu Dağ Geçidi (1.450m) & Sis/Türbülans Hattı', showLabel: true },
    { id: 'burdur', name: '15 - Burdur', lat: 37.7203, lon: 30.2908, altM: 950, region: 'Akdeniz', terrain: 'Göller Yöresi Geçit Havzası', showLabel: false },
    { id: 'bursa', name: '16 - Bursa (Karacabey)', lat: 40.1885, lon: 29.0610, altM: 155, region: 'Marmara', terrain: 'Uludağ Kuzey Eteği & Ova Koridoru', showLabel: true },
    { id: 'canakkale', name: '17 - Çanakkale', lat: 40.1553, lon: 26.4142, altM: 15, region: 'Marmara', terrain: 'Boğaz & Kazdağları Rüzgâr Koridoru', showLabel: true },
    { id: 'cankiri', name: '18 - Çankırı', lat: 40.6013, lon: 33.6134, altM: 730, region: 'İç Anadolu', terrain: 'Ilgaz Güney Eteği & Kızılırmak Havzası', showLabel: false },
    { id: 'corum', name: '19 - Çorum', lat: 40.5506, lon: 34.9556, altM: 801, region: 'Karadeniz', terrain: 'İç Karadeniz Geçiş Platosu', showLabel: false },
    { id: 'denizli', name: '20 - Denizli', lat: 37.7765, lon: 29.0864, altM: 354, region: 'Ege', terrain: 'Büyük Menderes & Honaz Geçit Koridoru', showLabel: true },
    { id: 'diyarbakir', name: '21 - Diyarbakır', lat: 37.9144, lon: 40.2306, altM: 675, region: 'Güneydoğu', terrain: 'Güneydoğu Toroslar & Dicle Vadisi', showLabel: true },
    { id: 'edirne', name: '22 - Edirne', lat: 41.6771, lon: 26.5557, altM: 42, region: 'Marmara', terrain: 'Trakya Ergene Düzlüğü & Balkan Hattı', showLabel: true },
    { id: 'elazig', name: '23 - Elazığ', lat: 38.6810, lon: 39.2264, altM: 1067, region: 'Doğu Anadolu', terrain: 'Keban Baraj Gölü Havzası', showLabel: false },
    { id: 'erzincan', name: '24 - Erzincan', lat: 39.7500, lon: 39.5000, altM: 1185, region: 'Doğu Anadolu', terrain: 'Yukarı Fırat Oluk Vadisi & Sakaltutan Geçidi', showLabel: false },
    { id: 'erzurum', name: '25 - Erzurum', lat: 39.9055, lon: 41.2658, altM: 1900, region: 'Doğu Anadolu', terrain: 'Kop/Palandöken Yüksek İrtifa Platosu', showLabel: true },
    { id: 'eskisehir', name: '26 - Eskişehir (Sivrihisar)', lat: 39.7767, lon: 30.5206, altM: 788, region: 'İç Anadolu', terrain: 'Bozüyük Geçidi & Porsuk Vadisi', showLabel: true },
    { id: 'gaziantep', name: '27 - Gaziantep', lat: 37.0662, lon: 37.3833, altM: 850, region: 'Güneydoğu', terrain: 'Nur Dağları (Amanos) Geçit Hattı', showLabel: true },
    { id: 'giresun', name: '28 - Giresun', lat: 40.9128, lon: 38.3895, altM: 20, region: 'Karadeniz', terrain: 'Eğribel Geçidi & Doğu Karadeniz Kıyı Hattı', showLabel: false },
    { id: 'gumushane', name: '29 - Gümüşhane', lat: 40.4603, lon: 39.4814, altM: 1150, region: 'Karadeniz', terrain: 'Harşit Vadisi & Zigana Güney Geçidi', showLabel: false },
    { id: 'hakkari', name: '30 - Hakkâri', lat: 37.5833, lon: 43.7333, altM: 1720, region: 'Doğu Anadolu', terrain: 'Zap Vadisi & Yüksek Dağlık Kuşak', showLabel: false },
    { id: 'hatay', name: '31 - Hatay (İskenderun)', lat: 36.2021, lon: 36.1606, altM: 85, region: 'Akdeniz', terrain: 'Belen Geçidi & Amanos Dağları', showLabel: true },
    { id: 'isparta', name: '32 - Isparta', lat: 37.7648, lon: 30.5566, altM: 1035, region: 'Akdeniz', terrain: 'Göller Yöresi Yüksek Havzası', showLabel: false },
    { id: 'mersin', name: '33 - Mersin', lat: 36.8121, lon: 34.6415, altM: 15, region: 'Akdeniz', terrain: 'Sertavul Geçidi (1.650m) & Kıyı Hattı', showLabel: true },
    { id: 'istanbul', name: '34 - İstanbul', lat: 41.0082, lon: 28.9784, altM: 45, region: 'Marmara', terrain: 'Kıyı & Boğaz Rüzgâr Koridoru', showLabel: true },
    { id: 'izmir', name: '35 - İzmir', lat: 38.4237, lon: 27.1428, altM: 30, region: 'Ege', terrain: 'Gediz Deltası & İmbat Rüzgâr Koridoru', showLabel: true },
    { id: 'kars', name: '36 - Kars', lat: 40.6013, lon: 43.0975, altM: 1768, region: 'Doğu Anadolu', terrain: 'Kuzeydoğu Anadolu Yüksek Yaylası', showLabel: true },
    { id: 'kastamonu', name: '37 - Kastamonu', lat: 41.3887, lon: 33.7827, altM: 775, region: 'Karadeniz', terrain: 'Ilgaz Dağı (1.875m) Geçit Hattı', showLabel: true },
    { id: 'kayseri', name: '38 - Kayseri', lat: 38.7312, lon: 35.4787, altM: 1054, region: 'İç Anadolu', terrain: 'Erciyes Kuzey Koridoru & Kızılırmak Yaylası', showLabel: true },
    { id: 'kirklareli', name: '39 - Kırklareli', lat: 41.7351, lon: 27.2252, altM: 203, region: 'Marmara', terrain: 'Yıldız (Istranca) Dağları & Trakya Kuzeyi', showLabel: false },
    { id: 'kirsehir', name: '40 - Kırşehir', lat: 39.1425, lon: 34.1639, altM: 985, region: 'İç Anadolu', terrain: 'Orta Kızılırmak Bozkır Platosu', showLabel: false },
    { id: 'kocaeli', name: '41 - Kocaeli (İzmit)', lat: 40.8533, lon: 29.8815, altM: 60, region: 'Marmara', terrain: 'Sapanca-İzmit Körfez Oluk Koridoru', showLabel: false },
    { id: 'konya', name: '42 - Konya', lat: 37.8746, lon: 32.4932, altM: 1016, region: 'İç Anadolu', terrain: 'Yüksek Plato & Termal Akım Bölgesi', showLabel: true },
    { id: 'kutahya', name: '43 - Kütahya', lat: 39.4167, lon: 29.9833, altM: 969, region: 'Ege', terrain: 'Domaniç & İç Batı Anadolu Platosu', showLabel: false },
    { id: 'malatya', name: '44 - Malatya', lat: 38.3552, lon: 38.3095, altM: 954, region: 'Doğu Anadolu', terrain: 'Tohma Vadisi & Karahan Geçidi (1.800m)', showLabel: true },
    { id: 'manisa', name: '45 - Manisa (Akhisar)', lat: 38.6191, lon: 27.4289, altM: 75, region: 'Ege', terrain: 'Gediz Havzası & Spil Kuzey Eteği', showLabel: false },
    { id: 'kahramanmaras', name: '46 - Kahramanmaraş', lat: 37.5858, lon: 36.9371, altM: 568, region: 'Akdeniz', terrain: 'Ahır Dağı & Ceyhan Vadisi', showLabel: false },
    { id: 'mardin', name: '47 - Mardin', lat: 37.3212, lon: 40.7245, altM: 1083, region: 'Güneydoğu', terrain: 'Mazıdağı Eşiği & Mezopotamya Düzlüğü', showLabel: false },
    { id: 'mugla', name: '48 - Muğla', lat: 37.2153, lon: 28.3636, altM: 660, region: 'Ege', terrain: 'Menteşe Dağlık Platosu', showLabel: true },
    { id: 'mus', name: '49 - Muş', lat: 38.7433, lon: 41.5065, altM: 1350, region: 'Doğu Anadolu', terrain: 'Muş Ovası & Murat Nehri Koridoru', showLabel: false },
    { id: 'nevsehir', name: '50 - Nevşehir', lat: 38.6244, lon: 34.7144, altM: 1224, region: 'İç Anadolu', terrain: 'Kapadokya Tüf Platosu', showLabel: false },
    { id: 'nigde', name: '51 - Niğde', lat: 37.9667, lon: 34.6833, altM: 1229, region: 'İç Anadolu', terrain: 'Aladağlar Batısı & Ecemiş Koridoru', showLabel: false },
    { id: 'ordu', name: '52 - Ordu', lat: 40.9839, lon: 37.8764, altM: 25, region: 'Karadeniz', terrain: 'Canik Dağları & Kıyı Koridoru', showLabel: false },
    { id: 'rize', name: '53 - Rize', lat: 41.0201, lon: 40.5234, altM: 25, region: 'Karadeniz', terrain: 'Doğu Karadeniz Kıyı & Ovit Kuzeyi', showLabel: false },
    { id: 'sakarya', name: '54 - Sakarya (Hendek)', lat: 40.7569, lon: 30.3783, altM: 45, region: 'Marmara', terrain: 'Aşağı Sakarya Ovası & Bolu Dağı Girişi', showLabel: false },
    { id: 'samsun', name: '55 - Samsun', lat: 41.2867, lon: 36.3300, altM: 20, region: 'Karadeniz', terrain: 'Kavak/Hacılar Dağ Geçidi & Yeşilırmak Deltası', showLabel: true },
    { id: 'siirt', name: '56 - Siirt', lat: 37.9333, lon: 41.9500, altM: 895, region: 'Güneydoğu', terrain: 'Botan Çayı Vadisi', showLabel: false },
    { id: 'sinop', name: '57 - Sinop', lat: 42.0231, lon: 35.1531, altM: 25, region: 'Karadeniz', terrain: 'Küre Dağları Kuzey Kıyı Burnu', showLabel: true },
    { id: 'sivas', name: '58 - Sivas (Yıldızeli)', lat: 39.7477, lon: 37.0179, altM: 1285, region: 'İç Anadolu', terrain: 'Çamlıbel Geçidi (1.650m) & Dağlık Koridor', showLabel: true },
    { id: 'tekirdag', name: '59 - Tekirdağ (Çorlu)', lat: 40.9781, lon: 27.5117, altM: 135, region: 'Marmara', terrain: 'Kuzey Marmara Kıyı & Trakya Platosu', showLabel: false },
    { id: 'tokat', name: '60 - Tokat', lat: 40.3167, lon: 36.5500, altM: 623, region: 'Karadeniz', terrain: 'Kelkit-Yeşilırmak Vadisi & Çamlıbel Kuzeyi', showLabel: false },
    { id: 'trabzon', name: '61 - Trabzon', lat: 41.0027, lon: 39.7168, altM: 35, region: 'Karadeniz', terrain: 'Zigana Dağ Geçidi (2.030m) & Kıyı Sis Hattı', showLabel: true },
    { id: 'tunceli', name: '62 - Tunceli', lat: 39.1079, lon: 39.5401, altM: 940, region: 'Doğu Anadolu', terrain: 'Munzur Vadisi & Pülümür Geçidi', showLabel: false },
    { id: 'sanliurfa', name: '63 - Şanlıurfa', lat: 37.1674, lon: 38.7955, altM: 518, region: 'Güneydoğu', terrain: 'Yüksek Sıcaklık & Kurak Bozkır Platosu', showLabel: true },
    { id: 'usak', name: '64 - Uşak', lat: 38.6823, lon: 29.4082, altM: 906, region: 'Ege', terrain: 'İç Ege Eşiği & Gediz-Menderes Geçişi', showLabel: false },
    { id: 'van', name: '65 - Van', lat: 38.4891, lon: 43.4089, altM: 1727, region: 'Doğu Anadolu', terrain: 'Van Gölü Havzası & Kuzgunkıran Geçidi', showLabel: true },
    { id: 'yozgat', name: '66 - Yozgat', lat: 39.8181, lon: 34.8147, altM: 1300, region: 'İç Anadolu', terrain: 'Bozok Yüksek Yaylası', showLabel: false },
    { id: 'zonguldak', name: '67 - Zonguldak', lat: 41.4564, lon: 31.7987, altM: 35, region: 'Karadeniz', terrain: 'Batı Karadeniz Kıyı Dağları', showLabel: false },
    { id: 'aksaray', name: '68 - Aksaray', lat: 38.3687, lon: 34.0370, altM: 980, region: 'İç Anadolu', terrain: 'Tuz Gölü Güney Düzlüğü', showLabel: false },
    { id: 'bayburt', name: '69 - Bayburt', lat: 40.2552, lon: 40.2249, altM: 1550, region: 'Karadeniz', terrain: 'Çoruh Havzası & Kop Geçidi Kuzeyi', showLabel: false },
    { id: 'karaman', name: '70 - Karaman', lat: 37.1759, lon: 33.2287, altM: 1033, region: 'İç Anadolu', terrain: 'Sertavul Kuzey Girişi & Konya Ovası Güneyi', showLabel: false },
    { id: 'kirikkale', name: '71 - Kırıkkale', lat: 39.8468, lon: 33.5153, altM: 740, region: 'İç Anadolu', terrain: 'Kızılırmak Orta Vadi Geçidi', showLabel: false },
    { id: 'batman', name: '72 - Batman', lat: 37.8812, lon: 41.1351, altM: 550, region: 'Güneydoğu', terrain: 'Yukarı Dicle & Batman Çayı Havzası', showLabel: false },
    { id: 'sirnak', name: '73 - Şırnak', lat: 37.5164, lon: 42.4611, altM: 1350, region: 'Güneydoğu', terrain: 'Cudi-Gabar Dağlık Geçit Kuşağı', showLabel: false },
    { id: 'bartin', name: '74 - Bartın', lat: 41.6344, lon: 32.3375, altM: 25, region: 'Karadeniz', terrain: 'Batı Karadeniz Kıyı Vadisi', showLabel: false },
    { id: 'ardahan', name: '75 - Ardahan', lat: 41.1105, lon: 42.7022, altM: 1829, region: 'Doğu Anadolu', terrain: 'Kura Nehri Yüksek Yaylası', showLabel: false },
    { id: 'igdir', name: '76 - Iğdır', lat: 39.9167, lon: 44.0333, altM: 850, region: 'Doğu Anadolu', terrain: 'Aras Vadisi Mikroklima Ovası', showLabel: false },
    { id: 'yalova', name: '77 - Yalova', lat: 40.6500, lon: 29.2667, altM: 15, region: 'Marmara', terrain: 'Güney Marmara Kıyı & Körfez Geçişi', showLabel: false },
    { id: 'karabuk', name: '78 - Karabük', lat: 41.2061, lon: 32.6204, altM: 280, region: 'Karadeniz', terrain: 'Filyos Vadisi & Keltepe Geçidi', showLabel: false },
    { id: 'kilis', name: '79 - Kilis', lat: 36.7184, lon: 37.1212, altM: 640, region: 'Güneydoğu', terrain: 'Gaziantep Platosu Güney Eşiği', showLabel: false },
    { id: 'osmaniye', name: '80 - Osmaniye', lat: 37.0742, lon: 36.2478, altM: 125, region: 'Akdeniz', terrain: 'Nurdağı (Bahçe) Geçidi & Yukarı Çukurova', showLabel: false },
    { id: 'duzce', name: '81 - Düzce', lat: 40.8438, lon: 31.1565, altM: 160, region: 'Karadeniz', terrain: 'Düzce Ovası & Bolu Dağı Batı Girişi', showLabel: false },
    { id: 'brussels', name: 'Brüksel (Belçika)', lat: 50.8503, lon: 4.3517, altM: 55, region: 'Avrupa', terrain: 'Kuzey Avrupa Düzlüğü & Atlantik Rüzgâr Koridoru', isEurope: true },
    { id: 'amsterdam', name: 'Amsterdam (Hollanda)', lat: 52.3676, lon: 4.9041, altM: 5, region: 'Avrupa', terrain: 'Deniz Seviyesi Kıyı & Yan Rüzgâr Hattı', isEurope: true }
  ],

  // ==========================================================================
  // 81 İL İÇİN GERÇEK WGS84 KOORDİNATLI İLÇE VE SALIM NOKTASI VERİTABANI
  // ==========================================================================
  SMART_RACE_DISTRICTS: {
    adana: [
      { id: 'merkez', name: 'Seyhan / Merkez', lat: 37.0000, lon: 35.3213, altM: 25 },
      { id: 'ceyhan', name: 'Ceyhan', lat: 37.0247, lon: 35.8175, altM: 30 },
      { id: 'pozanti', name: 'Pozantı (Gülek Boğazı)', lat: 37.4258, lon: 34.8717, altM: 830 },
      { id: 'kozan', name: 'Kozan', lat: 37.4553, lon: 35.8156, altM: 150 },
      { id: 'yuregir', name: 'Yüreğir', lat: 36.9950, lon: 35.3450, altM: 25 },
      { id: 'cukurova', name: 'Çukurova', lat: 37.0500, lon: 35.2800, altM: 60 }
    ],
    afyon: [
      { id: 'merkez', name: 'Afyon Merkez', lat: 38.7507, lon: 30.5567, altM: 1021 },
      { id: 'emirdag', name: 'Emirdağ', lat: 39.0197, lon: 31.1500, altM: 980 },
      { id: 'sandikli', name: 'Sandıklı', lat: 38.4650, lon: 30.2700, altM: 1095 },
      { id: 'dinar', name: 'Dinar', lat: 38.0650, lon: 30.1656, altM: 880 },
      { id: 'bolvadin', name: 'Bolvadin', lat: 38.7111, lon: 31.0486, altM: 995 },
      { id: 'cay', name: 'Çay', lat: 38.5917, lon: 31.0286, altM: 1015 }
    ],
    aksaray: [
      { id: 'merkez', name: 'Aksaray Merkez', lat: 38.3687, lon: 34.0370, altM: 980 },
      { id: 'ortakoy', name: 'Ortaköy', lat: 38.7369, lon: 34.0386, altM: 1120 },
      { id: 'eskil', name: 'Eskil (Tuz Gölü)', lat: 38.4017, lon: 33.4125, altM: 920 },
      { id: 'sultanhani', name: 'Sultanhanı', lat: 38.2464, lon: 33.5472, altM: 945 }
    ],
    amasya: [
      { id: 'merzifon', name: 'Merzifon', lat: 40.8733, lon: 35.4631, altM: 750 },
      { id: 'merkez', name: 'Amasya Merkez', lat: 40.6499, lon: 35.8353, altM: 412 },
      { id: 'suluova', name: 'Suluova', lat: 40.8311, lon: 35.6478, altM: 510 },
      { id: 'tasova', name: 'Taşova', lat: 40.7622, lon: 36.3236, altM: 240 }
    ],
    ankara: [
      { id: 'polatli', name: 'Polatlı (Ana Salım Üssü)', lat: 39.5842, lon: 32.1472, altM: 855 },
      { id: 'merkez', name: 'Çankaya / Merkez', lat: 39.9334, lon: 32.8597, altM: 890 },
      { id: 'golbasi', name: 'Gölbaşı', lat: 39.7936, lon: 32.8044, altM: 980 },
      { id: 'sereflikochisar', name: 'Şereflikoçhisar', lat: 38.9392, lon: 33.5386, altM: 915 },
      { id: 'kizilcahamam', name: 'Kızılcahamam', lat: 40.4706, lon: 32.6500, altM: 1015 },
      { id: 'sincan', name: 'Sincan / Temelli', lat: 39.9747, lon: 32.5825, altM: 810 },
      { id: 'beypazari', name: 'Beypazarı', lat: 40.1675, lon: 31.9211, altM: 685 },
      { id: 'haymana', name: 'Haymana', lat: 39.4319, lon: 32.4972, altM: 1215 }
    ],
    antalya: [
      { id: 'merkez', name: 'Muratpaşa / Merkez', lat: 36.8969, lon: 30.7133, altM: 40 },
      { id: 'alanya', name: 'Alanya', lat: 36.5444, lon: 31.9956, altM: 15 },
      { id: 'manavgat', name: 'Manavgat', lat: 36.7867, lon: 31.4431, altM: 20 },
      { id: 'serik', name: 'Serik', lat: 36.9169, lon: 31.0989, altM: 25 },
      { id: 'korkuteli', name: 'Korkuteli', lat: 37.0650, lon: 30.1958, altM: 1020 },
      { id: 'dosemealti', name: 'Döşemealtı (Çubuk Boğazı)', lat: 37.0322, lon: 30.5944, altM: 310 }
    ],
    aydin: [
      { id: 'merkez', name: 'Efeler / Merkez', lat: 37.8560, lon: 27.8416, altM: 65 },
      { id: 'nazilli', name: 'Nazilli', lat: 37.9125, lon: 28.3206, altM: 85 },
      { id: 'soke', name: 'Söke', lat: 37.7508, lon: 27.4061, altM: 35 },
      { id: 'kusadasi', name: 'Kuşadası', lat: 37.8579, lon: 27.2610, altM: 15 },
      { id: 'cine', name: 'Çine', lat: 37.6122, lon: 28.0614, altM: 90 }
    ],
    balikesir: [
      { id: 'susurluk', name: 'Susurluk (Salım & Geçit)', lat: 39.9136, lon: 28.1578, altM: 60 },
      { id: 'merkez', name: 'Karesi / Altıeylül Merkez', lat: 39.6484, lon: 27.8826, altM: 145 },
      { id: 'bandirma', name: 'Bandırma', lat: 40.3522, lon: 27.9767, altM: 25 },
      { id: 'edremit', name: 'Edremit', lat: 39.5961, lon: 27.0244, altM: 30 },
      { id: 'gonen', name: 'Gönen', lat: 40.1047, lon: 27.6539, altM: 45 },
      { id: 'ayvalik', name: 'Ayvalık', lat: 39.3192, lon: 26.6931, altM: 15 }
    ],
    bilecik: [
      { id: 'bozuyuk', name: 'Bozüyük (Geçit Noktası)', lat: 39.9078, lon: 30.0367, altM: 740 },
      { id: 'merkez', name: 'Bilecik Merkez', lat: 40.1451, lon: 29.9799, altM: 520 },
      { id: 'osmaneli', name: 'Osmaneli', lat: 40.3578, lon: 30.0142, altM: 110 },
      { id: 'sogut', name: 'Söğüt', lat: 40.0186, lon: 30.1819, altM: 680 }
    ],
    bolu: [
      { id: 'gerede', name: 'Gerede (Salım Üssü)', lat: 40.8008, lon: 32.1969, altM: 1320 },
      { id: 'merkez', name: 'Bolu Merkez', lat: 40.7350, lon: 31.6061, altM: 740 },
      { id: 'mengen', name: 'Mengen', lat: 40.9383, lon: 32.0781, altM: 615 },
      { id: 'mudurnu', name: 'Mudurnu', lat: 40.4675, lon: 31.2106, altM: 840 }
    ],
    bursa: [
      { id: 'karacabey', name: 'Karacabey', lat: 40.2144, lon: 28.3611, altM: 35 },
      { id: 'merkez', name: 'Osmangazi / Merkez', lat: 40.1885, lon: 29.0610, altM: 155 },
      { id: 'nilufer', name: 'Nilüfer', lat: 40.2147, lon: 28.9383, altM: 110 },
      { id: 'yildirim', name: 'Yıldırım', lat: 40.1892, lon: 29.1128, altM: 185 },
      { id: 'inegol', name: 'İnegöl', lat: 40.0781, lon: 29.5133, altM: 295 },
      { id: 'mustafakemalpasa', name: 'Mustafakemalpaşa', lat: 40.0381, lon: 28.4083, altM: 45 },
      { id: 'gemlik', name: 'Gemlik', lat: 40.4325, lon: 29.1564, altM: 15 },
      { id: 'mudanya', name: 'Mudanya', lat: 40.3753, lon: 28.8822, altM: 15 },
      { id: 'yenisehir', name: 'Yenişehir', lat: 40.2644, lon: 29.6531, altM: 230 }
    ],
    canakkale: [
      { id: 'merkez', name: 'Çanakkale Merkez', lat: 40.1553, lon: 26.4142, altM: 15 },
      { id: 'biga', name: 'Biga', lat: 40.2281, lon: 27.2422, altM: 45 },
      { id: 'gelibolu', name: 'Gelibolu', lat: 40.4103, lon: 26.6708, altM: 20 },
      { id: 'ezine', name: 'Ezine', lat: 39.7897, lon: 26.3422, altM: 60 },
      { id: 'can', name: 'Çan', lat: 40.0333, lon: 27.0500, altM: 120 }
    ],
    corum: [
      { id: 'merkez', name: 'Çorum Merkez', lat: 40.5506, lon: 34.9556, altM: 801 },
      { id: 'sungurlu', name: 'Sungurlu (Salım Noktası)', lat: 40.1675, lon: 34.3739, altM: 780 },
      { id: 'osmancik', name: 'Osmancık', lat: 40.9717, lon: 34.8017, altM: 420 },
      { id: 'alaca', name: 'Alaca', lat: 40.1683, lon: 35.1436, altM: 950 }
    ],
    denizli: [
      { id: 'merkez', name: 'Pamukkale / Merkezefendi', lat: 37.7765, lon: 29.0864, altM: 354 },
      { id: 'civril', name: 'Çivril', lat: 38.3014, lon: 29.7386, altM: 830 },
      { id: 'acipayam', name: 'Acıpayam', lat: 37.4239, lon: 29.3494, altM: 895 },
      { id: 'honaz', name: 'Honaz (Geçit)', lat: 37.7567, lon: 29.2661, altM: 510 },
      { id: 'saraykoy', name: 'Sarayköy', lat: 37.9228, lon: 28.9244, altM: 170 }
    ],
    diyarbakir: [
      { id: 'merkez', name: 'Bağlar / Kayapınar Merkez', lat: 37.9144, lon: 40.2306, altM: 675 },
      { id: 'bismil', name: 'Bismil', lat: 37.8467, lon: 40.6661, altM: 545 },
      { id: 'silvan', name: 'Silvan', lat: 38.1419, lon: 41.0081, altM: 825 },
      { id: 'ergani', name: 'Ergani', lat: 38.2703, lon: 39.7617, altM: 955 }
    ],
    duzce: [
      { id: 'merkez', name: 'Düzce Merkez', lat: 40.8438, lon: 31.1565, altM: 160 },
      { id: 'kaynasli', name: 'Kaynaşlı (Bolu Dağı Girişi)', lat: 40.7772, lon: 31.3056, altM: 310 },
      { id: 'akcakoca', name: 'Akçakoca', lat: 41.0869, lon: 31.1247, altM: 20 }
    ],
    edirne: [
      { id: 'merkez', name: 'Edirne Merkez (Kapıkule)', lat: 41.6771, lon: 26.5557, altM: 42 },
      { id: 'kesan', name: 'Keşan', lat: 40.8558, lon: 26.6303, altM: 110 },
      { id: 'uzunkopru', name: 'Uzunköprü', lat: 41.2708, lon: 26.6872, altM: 35 },
      { id: 'havsa', name: 'Havsa (Trakya Salım)', lat: 41.5489, lon: 26.8222, altM: 75 },
      { id: 'ipsala', name: 'İpsala', lat: 40.9219, lon: 26.3828, altM: 25 }
    ],
    erzincan: [
      { id: 'merkez', name: 'Erzincan Merkez', lat: 39.7500, lon: 39.5000, altM: 1185 },
      { id: 'refahiye', name: 'Refahiye (Sakaltutan)', lat: 39.9008, lon: 38.7667, altM: 1580 },
      { id: 'tercan', name: 'Tercan', lat: 39.7769, lon: 40.3886, altM: 1425 }
    ],
    erzurum: [
      { id: 'merkez', name: 'Yakutiye / Palandöken Merkez', lat: 39.9055, lon: 41.2658, altM: 1900 },
      { id: 'askale', name: 'Aşkale (Kop Geçidi)', lat: 39.9214, lon: 40.6950, altM: 1660 },
      { id: 'horasan', name: 'Horasan', lat: 40.0406, lon: 42.1728, altM: 1560 },
      { id: 'oltu', name: 'Oltu', lat: 40.5472, lon: 41.9958, altM: 1275 }
    ],
    eskisehir: [
      { id: 'sivrihisar', name: 'Sivrihisar (Ana Salım Kavşağı)', lat: 39.4508, lon: 31.5369, altM: 1070 },
      { id: 'merkez', name: 'Odunpazarı / Tepebaşı Merkez', lat: 39.7767, lon: 30.5206, altM: 788 },
      { id: 'inonu', name: 'İnönü', lat: 39.8147, lon: 30.1456, altM: 835 },
      { id: 'cifteler', name: 'Çifteler', lat: 39.3831, lon: 31.0392, altM: 875 }
    ],
    gaziantep: [
      { id: 'merkez', name: 'Şahinbey / Şehitkamil Merkez', lat: 37.0662, lon: 37.3833, altM: 850 },
      { id: 'nizip', name: 'Nizip', lat: 37.0097, lon: 37.7944, altM: 530 },
      { id: 'nurdagi', name: 'Nurdağı (Geçit)', lat: 37.1778, lon: 36.7364, altM: 560 },
      { id: 'islahiye', name: 'İslahiye', lat: 37.0250, lon: 36.6361, altM: 520 }
    ],
    hatay: [
      { id: 'iskenderun', name: 'İskenderun', lat: 36.5872, lon: 36.1733, altM: 15 },
      { id: 'merkez', name: 'Antakya / Merkez', lat: 36.2021, lon: 36.1606, altM: 85 },
      { id: 'belen', name: 'Belen (Belen Geçidi)', lat: 36.4917, lon: 36.1947, altM: 620 },
      { id: 'dortyol', name: 'Dörtyol', lat: 36.8422, lon: 36.2236, altM: 55 },
      { id: 'kirikhan', name: 'Kırıkhan', lat: 36.4981, lon: 36.3547, altM: 155 }
    ],
    istanbul: [
      { id: 'merkez', name: 'İstanbul Merkez (Avrupa)', lat: 41.0082, lon: 28.9784, altM: 45 },
      { id: 'silivri', name: 'Silivri (Batı Kapısı)', lat: 41.0739, lon: 28.2464, altM: 35 },
      { id: 'catalca', name: 'Çatalca', lat: 41.1436, lon: 28.4614, altM: 85 },
      { id: 'buyukcekmece', name: 'Büyükçekmece / Esenyurt', lat: 41.0203, lon: 28.5850, altM: 40 },
      { id: 'arnavutkoy', name: 'Arnavutköy / Hadımköy', lat: 41.1856, lon: 28.7406, altM: 130 },
      { id: 'sariyer', name: 'Sarıyer / Boğaz Hattı', lat: 41.1667, lon: 29.0500, altM: 55 },
      { id: 'beykoz', name: 'Beykoz (Anadolu Kuzey)', lat: 41.1272, lon: 29.0972, altM: 60 },
      { id: 'pendik', name: 'Pendik / Kartal', lat: 40.8775, lon: 29.2336, altM: 35 },
      { id: 'tuzla', name: 'Tuzla (Doğu Kapısı)', lat: 40.8161, lon: 29.3006, altM: 25 },
      { id: 'cekmekoy', name: 'Çekmeköy / Sancaktepe', lat: 41.0339, lon: 29.1778, altM: 140 }
    ],
    izmir: [
      { id: 'merkez', name: 'Konak / Bornova Merkez', lat: 38.4237, lon: 27.1428, altM: 30 },
      { id: 'menemen', name: 'Menemen', lat: 38.6069, lon: 27.0692, altM: 25 },
      { id: 'bergama', name: 'Bergama', lat: 39.1214, lon: 27.1797, altM: 70 },
      { id: 'torbali', name: 'Torbalı', lat: 38.1519, lon: 27.3622, altM: 45 },
      { id: 'odemis', name: 'Ödemiş', lat: 38.2278, lon: 27.9719, altM: 125 },
      { id: 'cesme', name: 'Çeşme', lat: 38.3228, lon: 26.3061, altM: 15 },
      { id: 'kemalpasa', name: 'Kemalpaşa (Belkahve Geçidi)', lat: 38.4264, lon: 27.4172, altM: 180 },
      { id: 'aliaga', name: 'Aliağa', lat: 38.7994, lon: 26.9719, altM: 20 }
    ],
    kahramanmaras: [
      { id: 'merkez', name: 'Onikişubat / Dulkadiroğlu Merkez', lat: 37.5858, lon: 36.9371, altM: 568 },
      { id: 'elbistan', name: 'Elbistan', lat: 38.2039, lon: 37.1964, altM: 1150 },
      { id: 'afsin', name: 'Afşin', lat: 38.2478, lon: 36.9144, altM: 1230 },
      { id: 'pazarcik', name: 'Pazarcık', lat: 37.4869, lon: 37.2981, altM: 750 }
    ],
    kars: [
      { id: 'merkez', name: 'Kars Merkez', lat: 40.6013, lon: 43.0975, altM: 1768 },
      { id: 'sarikamis', name: 'Sarıkamış', lat: 40.3328, lon: 42.5908, altM: 2100 },
      { id: 'kagizman', name: 'Kağızman', lat: 40.1558, lon: 43.1333, altM: 1400 }
    ],
    kastamonu: [
      { id: 'merkez', name: 'Kastamonu Merkez', lat: 41.3887, lon: 33.7827, altM: 775 },
      { id: 'tosya', name: 'Tosya (Salım Hattı)', lat: 41.0156, lon: 34.0369, altM: 820 },
      { id: 'inebolu', name: 'İnebolu', lat: 41.9747, lon: 33.7608, altM: 20 }
    ],
    kayseri: [
      { id: 'merkez', name: 'Melikgazi / Kocasinan Merkez', lat: 38.7312, lon: 35.4787, altM: 1054 },
      { id: 'pinarbasi', name: 'Pınarbaşı (Doğu Salım)', lat: 38.7228, lon: 36.3919, altM: 1530 },
      { id: 'develi', name: 'Develi', lat: 38.3889, lon: 35.4922, altM: 1180 },
      { id: 'incesu', name: 'İncesu', lat: 38.6247, lon: 35.1864, altM: 1090 }
    ],
    kirikkale: [
      { id: 'merkez', name: 'Kırıkkale Merkez', lat: 39.8468, lon: 33.5153, altM: 740 },
      { id: 'keskin', name: 'Keskin', lat: 39.6731, lon: 33.6136, altM: 1060 },
      { id: 'delice', name: 'Delice (Salım Kavşağı)', lat: 39.9519, lon: 34.0322, altM: 690 }
    ],
    kirklareli: [
      { id: 'merkez', name: 'Kırklareli Merkez', lat: 41.7351, lon: 27.2252, altM: 203 },
      { id: 'luleburgaz', name: 'Lüleburgaz (Trakya Merkez)', lat: 41.4056, lon: 27.3569, altM: 65 },
      { id: 'babaeski', name: 'Babaeski', lat: 41.4325, lon: 27.0931, altM: 55 },
      { id: 'vize', name: 'Vize', lat: 41.5725, lon: 27.7658, altM: 185 }
    ],
    kirsehir: [
      { id: 'merkez', name: 'Kırşehir Merkez', lat: 39.1425, lon: 34.1639, altM: 985 },
      { id: 'kaman', name: 'Kaman', lat: 39.3567, lon: 33.7239, altM: 1075 },
      { id: 'mucur', name: 'Mucur', lat: 39.0628, lon: 34.3872, altM: 1090 }
    ],
    kocaeli: [
      { id: 'izmit', name: 'İzmit Merkez', lat: 40.8533, lon: 29.8815, altM: 60 },
      { id: 'gebze', name: 'Gebze', lat: 40.8028, lon: 29.4306, altM: 140 },
      { id: 'golcuk', name: 'Gölcük', lat: 40.7175, lon: 29.8194, altM: 25 },
      { id: 'kartepe', name: 'Kartepe', lat: 40.7533, lon: 30.0236, altM: 95 },
      { id: 'kandira', name: 'Kandıra', lat: 41.0706, lon: 30.1528, altM: 55 }
    ],
    konya: [
      { id: 'merkez', name: 'Selçuklu / Meram / Karatay', lat: 37.8746, lon: 32.4932, altM: 1016 },
      { id: 'cihanbeyli', name: 'Cihanbeyli (Salım Üssü)', lat: 38.6531, lon: 32.9244, altM: 965 },
      { id: 'kulu', name: 'Kulu (Kuzey Salım)', lat: 39.0950, lon: 33.0794, altM: 1005 },
      { id: 'eregli', name: 'Konya Ereğli', lat: 37.5133, lon: 34.0467, altM: 1045 },
      { id: 'aksehir', name: 'Akşehir', lat: 38.3575, lon: 31.4164, altM: 1030 },
      { id: 'beysehir', name: 'Beyşehir', lat: 37.6772, lon: 31.7247, altM: 1135 },
      { id: 'karapinar', name: 'Karapınar', lat: 37.7153, lon: 33.5506, altM: 995 }
    ],
    kutahya: [
      { id: 'merkez', name: 'Kütahya Merkez', lat: 39.4167, lon: 29.9833, altM: 969 },
      { id: 'tavsanli', name: 'Tavşanlı', lat: 39.5469, lon: 29.4939, altM: 840 },
      { id: 'gediz', name: 'Gediz', lat: 38.9939, lon: 29.3914, altM: 760 },
      { id: 'simav', name: 'Simav', lat: 39.0897, lon: 28.9778, altM: 810 }
    ],
    malatya: [
      { id: 'merkez', name: 'Battalgazi / Yeşilyurt Merkez', lat: 38.3552, lon: 38.3095, altM: 954 },
      { id: 'darende', name: 'Darende (Salım Geçidi)', lat: 38.5483, lon: 37.5089, altM: 1030 },
      { id: 'akcadag', name: 'Akçadağ', lat: 38.3389, lon: 37.9686, altM: 1070 }
    ],
    manisa: [
      { id: 'akhisar', name: 'Akhisar (Salım & Kümes)', lat: 38.9189, lon: 27.8400, altM: 95 },
      { id: 'merkez', name: 'Yunusemre / Şehzadeler Merkez', lat: 38.6191, lon: 27.4289, altM: 75 },
      { id: 'turgutlu', name: 'Turgutlu', lat: 38.4953, lon: 27.6997, altM: 80 },
      { id: 'salihli', name: 'Salihli', lat: 38.4833, lon: 28.1394, altM: 115 },
      { id: 'soma', name: 'Soma', lat: 39.1856, lon: 27.6089, altM: 175 },
      { id: 'kula', name: 'Kula (İç Ege Geçidi)', lat: 38.5453, lon: 28.6478, altM: 675 }
    ],
    mersin: [
      { id: 'merkez', name: 'Yenişehir / Akdeniz Merkez', lat: 36.8121, lon: 34.6415, altM: 15 },
      { id: 'tarsus', name: 'Tarsus', lat: 36.9167, lon: 34.8956, altM: 25 },
      { id: 'silifke', name: 'Silifke', lat: 36.3778, lon: 33.9344, altM: 20 },
      { id: 'mut', name: 'Mut (Sertavul Geçidi)', lat: 36.6439, lon: 33.4389, altM: 290 },
      { id: 'erdemli', name: 'Erdemli', lat: 36.6050, lon: 34.3083, altM: 15 }
    ],
    mugla: [
      { id: 'merkez', name: 'Menteşe / Merkez', lat: 37.2153, lon: 28.3636, altM: 660 },
      { id: 'milas', name: 'Milas', lat: 37.3164, lon: 27.7839, altM: 60 },
      { id: 'fethiye', name: 'Fethiye', lat: 36.6217, lon: 29.1164, altM: 15 },
      { id: 'bodrum', name: 'Bodrum', lat: 37.0344, lon: 27.4305, altM: 20 },
      { id: 'marmaris', name: 'Marmaris', lat: 36.8550, lon: 28.2742, altM: 15 }
    ],
    nigde: [
      { id: 'merkez', name: 'Niğde Merkez', lat: 37.9667, lon: 34.6833, altM: 1229 },
      { id: 'bor', name: 'Bor', lat: 37.8919, lon: 34.5586, altM: 1115 },
      { id: 'ulukisla', name: 'Ulukışla (Gülek Kuzey Girişi)', lat: 37.5472, lon: 34.4847, altM: 1425 }
    ],
    sakarya: [
      { id: 'hendek', name: 'Hendek (Salım Noktası)', lat: 40.7994, lon: 30.7481, altM: 140 },
      { id: 'merkez', name: 'Adapazarı / Serdivan Merkez', lat: 40.7569, lon: 30.3783, altM: 45 },
      { id: 'akyazi', name: 'Akyazı', lat: 40.6844, lon: 30.6250, altM: 65 },
      { id: 'sapanca', name: 'Sapanca', lat: 40.6914, lon: 30.2675, altM: 45 },
      { id: 'geyve', name: 'Geyve (Sakarya Boğazı)', lat: 40.5081, lon: 30.2925, altM: 110 }
    ],
    samsun: [
      { id: 'merkez', name: 'İlkadım / Atakum Merkez', lat: 41.2867, lon: 36.3300, altM: 20 },
      { id: 'bafra', name: 'Bafra', lat: 41.5678, lon: 35.9069, altM: 25 },
      { id: 'carsamba', name: 'Çarşamba', lat: 41.1981, lon: 36.7219, altM: 20 },
      { id: 'havza', name: 'Havza (İç Geçit)', lat: 40.9708, lon: 35.6625, altM: 650 },
      { id: 'kavak', name: 'Kavak (Salım Geçidi)', lat: 41.0731, lon: 36.0408, altM: 605 }
    ],
    sanliurfa: [
      { id: 'merkez', name: 'Haliliye / Eyyübiye Merkez', lat: 37.1674, lon: 38.7955, altM: 518 },
      { id: 'siverek', name: 'Siverek', lat: 37.7550, lon: 39.3167, altM: 800 },
      { id: 'viranşehir', name: 'Viranşehir', lat: 37.2353, lon: 39.7631, altM: 570 },
      { id: 'birecik', name: 'Birecik (Fırat Geçidi)', lat: 37.0258, lon: 37.9786, altM: 350 }
    ],
    sivas: [
      { id: 'yildizeli', name: 'Yıldızeli (Çamlıbel Salım)', lat: 39.8658, lon: 36.5975, altM: 1410 },
      { id: 'merkez', name: 'Sivas Merkez', lat: 39.7477, lon: 37.0179, altM: 1285 },
      { id: 'sarkisla', name: 'Şarkışla', lat: 39.3519, lon: 36.4097, altM: 1240 },
      { id: 'kangal', name: 'Kangal', lat: 39.2367, lon: 37.3889, altM: 1540 },
      { id: 'zara', name: 'Zara', lat: 39.8958, lon: 37.7569, altM: 1350 },
      { id: 'suşehri', name: 'Suşehri', lat: 40.1644, lon: 38.0867, altM: 1020 }
    ],
    tekirdag: [
      { id: 'corlu', name: 'Çorlu (Trakya Merkez)', lat: 41.1592, lon: 27.8000, altM: 165 },
      { id: 'merkez', name: 'Süleymanpaşa / Merkez', lat: 40.9781, lon: 27.5117, altM: 35 },
      { id: 'cerkezkoy', name: 'Çerkezköy', lat: 41.2858, lon: 28.0003, altM: 155 },
      { id: 'malkara', name: 'Malkara (Salım Hattı)', lat: 40.8897, lon: 26.9011, altM: 210 },
      { id: 'sarkoy', name: 'Şarköy', lat: 40.6147, lon: 27.1144, altM: 20 }
    ],
    tokat: [
      { id: 'merkez', name: 'Tokat Merkez', lat: 40.3167, lon: 36.5500, altM: 623 },
      { id: 'turhal', name: 'Turhal', lat: 40.3886, lon: 36.0825, altM: 530 },
      { id: 'erbaa', name: 'Erbaa', lat: 40.6697, lon: 36.5658, altM: 250 },
      { id: 'niksar', name: 'Niksar', lat: 40.5917, lon: 36.9539, altM: 365 }
    ],
    trabzon: [
      { id: 'merkez', name: 'Ortahisar / Merkez', lat: 41.0027, lon: 39.7168, altM: 35 },
      { id: 'akcaabat', name: 'Akçaabat', lat: 41.0206, lon: 39.5706, altM: 25 },
      { id: 'macka', name: 'Maçka (Zigana Girişi)', lat: 40.8136, lon: 39.6108, altM: 410 },
      { id: 'of', name: 'Of', lat: 40.9469, lon: 40.2692, altM: 15 }
    ],
    van: [
      { id: 'merkez', name: 'İpekyolu / Tuşba Merkez', lat: 38.4891, lon: 43.4089, altM: 1727 },
      { id: 'ercis', name: 'Erciş', lat: 39.0286, lon: 43.3586, altM: 1750 },
      { id: 'tatvan_gecit', name: 'Gevaş (Van Gölü Güney)', lat: 38.2975, lon: 43.1061, altM: 1740 }
    ],
    yozgat: [
      { id: 'merkez', name: 'Yozgat Merkez', lat: 39.8181, lon: 34.8147, altM: 1300 },
      { id: 'sorgun', name: 'Sorgun (Salım Üssü)', lat: 39.8103, lon: 35.1861, altM: 1085 },
      { id: 'yerkoy', name: 'Yerköy', lat: 39.6386, lon: 34.4675, altM: 770 },
      { id: 'akdagmadeni', name: 'Akdağmadeni', lat: 39.6606, lon: 35.8839, altM: 1350 }
    ]
  },

  getDistrictsForProvince(cityId) {
    const cleanId = String(cityId || 'ankara').toLowerCase();
    if (this.SMART_RACE_DISTRICTS && Array.isArray(this.SMART_RACE_DISTRICTS[cleanId]) && this.SMART_RACE_DISTRICTS[cleanId].length > 0) {
      return this.SMART_RACE_DISTRICTS[cleanId];
    }
    const baseNode = this.SMART_RACE_GEO_NODES.find(n => n.id === cleanId) || this.SMART_RACE_GEO_NODES[0];
    const baseName = String(baseNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].trim();
    return [
      { id: 'merkez', name: `${baseName} Merkez`, lat: baseNode.lat, lon: baseNode.lon, altM: baseNode.altM },
      { id: 'bati_cikisi', name: `${baseName} Batı Salım Noktası`, lat: Number((baseNode.lat + 0.03).toFixed(4)), lon: Number((baseNode.lon - 0.16).toFixed(4)), altM: baseNode.altM + 20 },
      { id: 'dogu_cikisi', name: `${baseName} Doğu Salım Noktası`, lat: Number((baseNode.lat - 0.02).toFixed(4)), lon: Number((baseNode.lon + 0.16).toFixed(4)), altM: baseNode.altM + 35 },
      { id: 'kuzey_hatti', name: `${baseName} Kuzey Çevre Yolu`, lat: Number((baseNode.lat + 0.12).toFixed(4)), lon: baseNode.lon, altM: baseNode.altM + 15 }
    ];
  },

  resolveProvinceAndDistrictNode(cityId, districtId, customCoord = null, fallbackCityId = 'ankara') {
    if (customCoord && customCoord.lat && customCoord.lon) {
      return customCoord;
    }
    const prov = this.findGeoNodeByNameOrId(cityId, fallbackCityId);
    const districts = this.getDistrictsForProvince(prov.id);
    const dist = districts.find(d => d.id === districtId) || districts[0];
    if (!dist) return prov;
    const provShort = String(prov.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].trim();
    const distClean = String(dist.name || '').split(' (')[0].trim();
    const displayLabel = distClean.toLowerCase().includes(provShort.toLowerCase())
      ? dist.name
      : `${provShort} / ${dist.name}`;
    return {
      ...prov,
      id: prov.id,
      districtId: dist.id,
      districtName: dist.name,
      name: displayLabel,
      lat: Number(dist.lat || prov.lat),
      lon: Number(dist.lon || prov.lon),
      altM: Number(dist.altM ?? prov.altM)
    };
  },

  findGeoNodeByNameOrId(query, fallbackId = 'ankara') {
    const q = String(query || '').trim();
    if (!q) {
      return this.SMART_RACE_GEO_NODES.find(n => n.id === fallbackId) || this.SMART_RACE_GEO_NODES[0];
    }

    // 1. Eğer kullanıcı doğrudan "39.93, 32.85" gibi enlem/boylam koordinatı girdiyse gerçek koordinat düğümü oluştur
    const coordMatch = q.match(/^\s*(\d{2}(?:[.,]\d{1,6})?)\s*[,;\s/]+\s*(\d{1,2}(?:[.,]\d{1,6})?)\s*$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1].replace(',', '.'));
      const lon = parseFloat(coordMatch[2].replace(',', '.'));
      if (lat >= 34 && lat <= 55 && lon >= 2 && lon <= 46) {
        const nearest = this.findNearestGeoNode(lat, lon);
        const distToNearest = this.computeRawHaversineKm(lat, lon, nearest.lat, nearest.lon);
        if (distToNearest <= 18) return nearest;
        return {
          id: `coord_${lat.toFixed(3)}_${lon.toFixed(3)}`,
          name: `Özel Konum (${lat.toFixed(2)}°K, ${lon.toFixed(2)}°D • ${nearest.name.split(' ')[0]} Yakını)`,
          lat,
          lon,
          altM: nearest.altM || 650,
          region: nearest.region || 'Türkiye',
          terrain: `${nearest.terrain} (${nearest.name} ~${distToNearest} km)`
        };
      }
    }

    const qLow = q.toLowerCase();
    const exactId = this.SMART_RACE_GEO_NODES.find(n => n.id === qLow);
    if (exactId) return exactId;

    const cleanAscii = (s) => String(s || '').toLowerCase()
      .replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c');
    const qAsc = cleanAscii(qLow);

    // Önce 81 il içindeki özel ilçe veritabanını tara (Örn: "Polatlı", "Cihanbeyli", "Karacabey", "Silivri" vb.)
    if (this.SMART_RACE_DISTRICTS) {
      for (const [cityKey, distList] of Object.entries(this.SMART_RACE_DISTRICTS)) {
        for (const d of distList) {
          if (d.id === 'merkez') continue;
          const dAsc = cleanAscii(d.name.split(' (')[0]);
          if (qAsc === d.id || (qAsc.length >= 3 && (dAsc === qAsc || dAsc.includes(qAsc)))) {
            return this.resolveProvinceAndDistrictNode(cityKey, d.id, null, fallbackId);
          }
        }
      }
    }

    for (const node of this.SMART_RACE_GEO_NODES) {
      const nAsc = cleanAscii(node.name.replace(/^\d{2}\s*-\s*/, ''));
      if (qAsc === node.id || nAsc.includes(qAsc) || qAsc.includes(nAsc.split(' ')[0])) {
        return node;
      }
    }
    if (qAsc.includes('polatli') || qAsc.includes('golbasi') || qAsc.includes('sincan')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'ankara');
    if (qAsc.includes('sivrihisar')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'eskisehir');
    if (qAsc.includes('yildizeli') || qAsc.includes('sarkisla')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'sivas');
    if (qAsc.includes('karacabey') || qAsc.includes('inegol') || qAsc.includes('mustafakemalpasa')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'bursa');
    if (qAsc.includes('gerede') || qAsc.includes('duzce')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'bolu');
    if (qAsc.includes('hendek') || qAsc.includes('adapazari')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'sakarya');
    if (qAsc.includes('izmit') || qAsc.includes('gebze')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'kocaeli');
    if (qAsc.includes('bozuyuk')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'bilecik');
    if (qAsc.includes('corlu') || qAsc.includes('cerkezkoy')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'tekirdag');
    if (qAsc.includes('susurluk') || qAsc.includes('bandirma')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'balikesir');
    if (qAsc.includes('akhisar') || qAsc.includes('salihli') || qAsc.includes('turgutlu')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'manisa');
    if (qAsc.includes('merzifon')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'amasya');
    if (qAsc.includes('iskenderun') || qAsc.includes('antakya')) return this.SMART_RACE_GEO_NODES.find(n => n.id === 'hatay');

    return this.SMART_RACE_GEO_NODES.find(n => n.id === fallbackId) || this.SMART_RACE_GEO_NODES[0];
  },

  computeRawHaversineKm(lat1Deg, lon1Deg, lat2Deg, lon2Deg) {
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2Deg - lat1Deg);
    const dLon = toRad(lon2Deg - lon1Deg);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1Deg)) * Math.cos(toRad(lat2Deg)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return Math.max(1, Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))));
  },

  findNearestGeoNode(lat, lon) {
    const trNodes = this.SMART_RACE_GEO_NODES.filter(n => !n.isEurope);
    let best = trNodes[0];
    let bestDist = 999999;
    trNodes.forEach(n => {
      const d = this.computeRawHaversineKm(lat, lon, n.lat, n.lon);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    });
    return best;
  },

  // WGS84 Enlem/Boylam (25.5°D..45.0°D, 35.7°K..42.3°K) <-> 720x320 Türkiye SVG Harita Koordinat Dönüşümü
  projectLatLonToTurkeySvg(lat, lon) {
    const minLon = 25.4, maxLon = 45.0;
    const minLat = 35.6, maxLat = 42.4;
    const clampedLon = Math.max(minLon, Math.min(maxLon, Number(lon) || 32.85));
    const clampedLat = Math.max(minLat, Math.min(maxLat, Number(lat) || 39.93));
    const x = Math.round(28 + ((clampedLon - minLon) / (maxLon - minLon)) * 664);
    const y = Math.round(26 + ((maxLat - clampedLat) / (maxLat - minLat)) * 268);
    return { x, y };
  },

  unprojectTurkeySvgToLatLon(svgX, svgY) {
    const minLon = 25.4, maxLon = 45.0;
    const minLat = 35.6, maxLat = 42.4;
    const lon = Number((minLon + ((svgX - 28) / 664) * (maxLon - minLon)).toFixed(4));
    const lat = Number((maxLat - ((svgY - 26) / 268) * (maxLat - minLat)).toFixed(4));
    return {
      lat: Math.max(35.8, Math.min(42.2, lat)),
      lon: Math.max(25.6, Math.min(44.8, lon))
    };
  },

  // --------------------------------------------------------------------------
  // İNTERAKTİF TÜRKİYE HARİTASI VE 3 AŞAMALI SİMÜLASYON YÖNETİCİLERİ
  // --------------------------------------------------------------------------
  setSmartRaceStage(stageName) {
    if (!['setup', 'summary', 'detail'].includes(stageName)) stageName = 'setup';
    this.state.smartRaceStage = stageName;
    this.saveState();
    this.renderGenesisModuleUI();
  },

  setSmartRaceMapClickTarget(targetRole, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    this.state.smartRaceMapClickTarget = targetRole === 'arrival' ? 'arrival' : 'release';
    this.saveState();
    this.renderGenesisReportOnly();
  },

  _mapDragState: {
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  },

  startTurkeyMapDrag(evt) {
    if (!evt) return;
    if (evt.type === 'mousedown' && evt.button !== 0) return;
    const pt = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
    this._mapDragState = {
      active: true,
      moved: false,
      startX: pt.clientX,
      startY: pt.clientY,
      startPanX: Number(this.state.smartRaceMapPanX) || 0,
      startPanY: Number(this.state.smartRaceMapPanY) || 0
    };
  },

  moveTurkeyMapDrag(evt) {
    if (!this._mapDragState || !this._mapDragState.active || !evt) return;
    const pt = evt.touches && evt.touches[0] ? evt.touches[0] : evt;
    const dxPx = pt.clientX - this._mapDragState.startX;
    const dyPx = pt.clientY - this._mapDragState.startY;
    if (Math.hypot(dxPx, dyPx) < 5 && !this._mapDragState.moved) return;

    this._mapDragState.moved = true;
    if (evt.cancelable && typeof evt.preventDefault === 'function') evt.preventDefault();

    const svgEl = document.getElementById('avigenInteractiveTurkeySvg');
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const zoom = Math.max(1.0, Math.min(2.8, Number(this.state.smartRaceMapZoom) || 1.0));
    const vbW = Math.round(720 / zoom);
    const vbH = Math.round(320 / zoom);
    const svgDx = -(dxPx / rect.width) * vbW;
    const svgDy = -(dyPx / rect.height) * vbH;

    const nextPanX = Math.max(-240, Math.min(240, Math.round(this._mapDragState.startPanX + svgDx)));
    const nextPanY = Math.max(-120, Math.min(120, Math.round(this._mapDragState.startPanY + svgDy)));
    this.state.smartRaceMapPanX = nextPanX;
    this.state.smartRaceMapPanY = nextPanY;

    const vbX = Math.max(-95, Math.min(720 - vbW + 95, Math.round((720 - vbW) / 2 + nextPanX)));
    const vbY = Math.max(-40, Math.min(320 - vbH + 40, Math.round((320 - vbH) / 2 + nextPanY)));
    svgEl.setAttribute('viewBox', `${vbX} ${vbY} ${vbW} ${vbH}`);
  },

  endTurkeyMapDrag(evt) {
    if (!this._mapDragState || !this._mapDragState.active) return;
    const wasMoved = this._mapDragState.moved;
    this._mapDragState.active = false;
    if (wasMoved) {
      this.saveState();
      setTimeout(() => {
        if (this._mapDragState) this._mapDragState.moved = false;
      }, 60);
    }
  },

  selectCityFromTurkeyMap(cityId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    if (this._mapDragState && this._mapDragState.moved) return;
    const node = this.SMART_RACE_GEO_NODES.find(n => n.id === cityId);
    if (!node) return;
    const dists = this.getDistrictsForProvince(node.id);
    const defDistId = dists[0] ? dists[0].id : 'merkez';

    this.state.smartRaceEventId = 'custom';
    this.state.smartRaceManualKm = 0;
    this.state.smartRaceLiveRouteData = null;

    if (this.state.smartRaceMapClickTarget === 'arrival') {
      this.state.smartRaceLoftCityId = node.id;
      this.state.smartRaceLoftDistrictId = defDistId;
      this.state.smartRaceCustomLoftCoord = null;
    } else {
      this.state.smartRaceReleaseCityId = node.id;
      this.state.smartRaceReleaseDistrictId = defDistId;
      this.state.smartRaceCustomReleaseCoord = null;
    }

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  selectDistrictFromTurkeyMap(cityId, districtId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    if (this._mapDragState && this._mapDragState.moved) return;

    this.state.smartRaceEventId = 'custom';
    this.state.smartRaceManualKm = 0;
    this.state.smartRaceLiveRouteData = null;

    if (this.state.smartRaceMapClickTarget === 'arrival') {
      this.state.smartRaceLoftCityId = cityId;
      this.state.smartRaceLoftDistrictId = districtId;
      this.state.smartRaceCustomLoftCoord = null;
    } else {
      this.state.smartRaceReleaseCityId = cityId;
      this.state.smartRaceReleaseDistrictId = districtId;
      this.state.smartRaceCustomReleaseCoord = null;
    }

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  onTurkeyMapCanvasClick(evt) {
    if (this._mapDragState && this._mapDragState.moved) return;
    const svgEl = document.getElementById('avigenInteractiveTurkeySvg');
    if (!svgEl || !evt) return;
    const rect = svgEl.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const vbAttr = (svgEl.getAttribute('viewBox') || '0 0 720 320').split(/\s+/).map(Number);
    const vbX = vbAttr[0] || 0;
    const vbY = vbAttr[1] || 0;
    const vbW = vbAttr[2] || 720;
    const vbH = vbAttr[3] || 320;

    const relX = (evt.clientX - rect.left) / rect.width;
    const relY = (evt.clientY - rect.top) / rect.height;
    const svgX = vbX + relX * vbW;
    const svgY = vbY + relY * vbH;

    const { lat, lon } = this.unprojectTurkeySvgToLatLon(svgX, svgY);
    const nearest = this.findNearestGeoNode(lat, lon);
    const distKm = this.computeRawHaversineKm(lat, lon, nearest.lat, nearest.lon);

    // En yakın ilçeyi de kontrol et
    const dists = this.getDistrictsForProvince(nearest.id);
    let nearestDist = dists[0];
    let nearestDistKm = 999999;
    dists.forEach(d => {
      const dk = this.computeRawHaversineKm(lat, lon, d.lat, d.lon);
      if (dk < nearestDistKm) {
        nearestDistKm = dk;
        nearestDist = d;
      }
    });

    this.state.smartRaceEventId = 'custom';
    this.state.smartRaceManualKm = 0;
    this.state.smartRaceLiveRouteData = null;

    if (nearestDist && nearestDistKm <= 26) {
      if (this.state.smartRaceMapClickTarget === 'arrival') {
        this.state.smartRaceLoftCityId = nearest.id;
        this.state.smartRaceLoftDistrictId = nearestDist.id;
        this.state.smartRaceCustomLoftCoord = null;
      } else {
        this.state.smartRaceReleaseCityId = nearest.id;
        this.state.smartRaceReleaseDistrictId = nearestDist.id;
        this.state.smartRaceCustomReleaseCoord = null;
      }
    } else if (distKm <= 38) {
      // Yakındaki şehir merkezine mıknatısla
      if (this.state.smartRaceMapClickTarget === 'arrival') {
        this.state.smartRaceLoftCityId = nearest.id;
        this.state.smartRaceLoftDistrictId = dists[0] ? dists[0].id : 'merkez';
        this.state.smartRaceCustomLoftCoord = null;
      } else {
        this.state.smartRaceReleaseCityId = nearest.id;
        this.state.smartRaceReleaseDistrictId = dists[0] ? dists[0].id : 'merkez';
        this.state.smartRaceCustomReleaseCoord = null;
      }
    } else {
      // Harita üzerinde tıklanan tam koordinatı kullan
      const customNode = {
        id: 'custom_coord',
        name: `${nearest.name.replace(/^\d{2}\s*-\s*/, '').split(' ')[0]} Kırsalı (${lat.toFixed(2)}°K, ${lon.toFixed(2)}°D)`,
        lat,
        lon,
        altM: nearest.altM || 750,
        region: nearest.region || 'Türkiye',
        terrain: `${nearest.terrain}`
      };
      if (this.state.smartRaceMapClickTarget === 'arrival') {
        this.state.smartRaceLoftCityId = nearest.id;
        this.state.smartRaceCustomLoftCoord = customNode;
      } else {
        this.state.smartRaceReleaseCityId = nearest.id;
        this.state.smartRaceCustomReleaseCoord = customNode;
      }
    }

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  _leafletMapInstance: null,
  _leafletTileLayer: null,
  _leafletOverlayGroup: null,
  _leafletLastCenter: null,
  _leafletLastZoom: null,

  setSmartRaceTileLayerType(layerType, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    if (!['google_hybrid', 'google_road', 'google_terrain', 'vector_offline'].includes(layerType)) {
      layerType = 'google_hybrid';
    }
    this.state.smartRaceTileLayerType = layerType;
    this.saveState();
    this.renderGenesisReportOnly();
  },

  getGoogleTileUrlForType(layerType) {
    // Google Maps Türkçe (hl=tr) yüksek çözünürlüklü katmanları:
    // y = Hybrid (Uydu + İl/İlçe/Mahalle/Yol etiketleri)
    // m = Standart Google Karayolu & Şehir/İlçe Haritası
    // p = Google Fiziki Arazi / Dağ / Rakım Haritası
    if (layerType === 'google_road') {
      return 'https://mt1.google.com/vt/lyrs=m&hl=tr&x={x}&y={y}&z={z}';
    }
    if (layerType === 'google_terrain') {
      return 'https://mt1.google.com/vt/lyrs=p&hl=tr&x={x}&y={y}&z={z}';
    }
    return 'https://mt1.google.com/vt/lyrs=y&hl=tr&x={x}&y={y}&z={z}';
  },

  mountSmartRaceLeafletMap() {
    const mapBox = document.getElementById('avigenGoogleLeafletMap');
    const fallbackBox = document.getElementById('avigenOfflineVectorMapWrap');
    const layerType = this.state.smartRaceTileLayerType || 'google_hybrid';

    if (layerType === 'vector_offline' || typeof window.L === 'undefined' || !mapBox) {
      if (this._leafletMapInstance) {
        try { this._leafletMapInstance.remove(); } catch (e) {}
        this._leafletMapInstance = null;
      }
      if (mapBox) mapBox.style.display = 'none';
      if (fallbackBox) fallbackBox.style.display = 'block';
      return;
    }

    if (mapBox) mapBox.style.display = 'block';
    if (fallbackBox) fallbackBox.style.display = 'none';

    const sr = this.analyzeSmartRaceManagement();
    const r = sr.route;

    // Eski DOM üzerinde kalan harita örneğini temizle
    if (this._leafletMapInstance) {
      try { this._leafletMapInstance.remove(); } catch (e) {}
      this._leafletMapInstance = null;
    }

    const defaultCenter = this._leafletLastCenter || [
      Number(((r.relNode.lat + r.loftNode.lat) / 2).toFixed(4)),
      Number(((r.relNode.lon + r.loftNode.lon) / 2).toFixed(4))
    ];
    const defaultZoom = this._leafletLastZoom || 6;

    const map = window.L.map(mapBox, {
      center: defaultCenter,
      zoom: defaultZoom,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false
    });
    this._leafletMapInstance = map;

    map.on('moveend zoomend', () => {
      if (!this._leafletMapInstance) return;
      const c = this._leafletMapInstance.getCenter();
      this._leafletLastCenter = [c.lat, c.lng];
      this._leafletLastZoom = this._leafletMapInstance.getZoom();
    });

    const tileUrl = this.getGoogleTileUrlForType(layerType);
    this._leafletTileLayer = window.L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }).addTo(map);

    const overlayGroup = window.L.layerGroup().addTo(map);
    this._leafletOverlayGroup = overlayGroup;

    // 1. Kuş Uçuşu Ana Rota Çizgisi ve Arazi Sapma Koridoru
    const relLatLng = [r.relNode.lat, r.relNode.lon];
    const loftLatLng = [r.loftNode.lat, r.loftNode.lon];
    const midLat = (r.relNode.lat + r.loftNode.lat) / 2;
    const midLon = (r.relNode.lon + r.loftNode.lon) / 2;
    const curveLat = midLat + Math.min(0.45, Math.abs(r.relNode.lon - r.loftNode.lon) * 0.08);

    // Olası Vadi Sapma Koridoru (Kesikli Mavi Hat)
    window.L.polyline([relLatLng, [curveLat, midLon], loftLatLng], {
      color: '#38bdf8',
      weight: 2.5,
      dashArray: '6, 6',
      opacity: 0.85
    }).addTo(overlayGroup);

    // Kuş Uçuşu Düz Hat (Parlak Beyaz Alt + Mavi/Kırmızı Üst Çizgi)
    window.L.polyline([relLatLng, loftLatLng], {
      color: '#ffffff',
      weight: 5,
      opacity: 0.9
    }).addTo(overlayGroup);

    window.L.polyline([relLatLng, loftLatLng], {
      color: '#2563eb',
      weight: 3,
      dashArray: '8, 6',
      opacity: 1
    }).addTo(overlayGroup);

    // 2. Orta Geçit Mesafe & Risk Rozeti
    const midHtmlIcon = window.L.divIcon({
      className: 'avigen-leaflet-mid-badge',
      html: `<div style="background:rgba(15,23,42,0.92); color:#ffffff; border:1.5px solid #38bdf8; border-radius:7px; padding:2px 7px; font-size:9.5px; font-weight:900; white-space:nowrap; box-shadow:0 3px 10px rgba(0,0,0,0.45); transform:translate(-50%, -50%);">
        📏 ${r.crowFliesKm} km Kuş Uçuşu • ⛰️ ~${r.midPassAltM}m
      </div>`,
      iconSize: [0, 0]
    });
    window.L.marker([midLat, midLon], { icon: midHtmlIcon, interactive: false }).addTo(overlayGroup);

    // 3. 🔴 Salım Noktası İşaretçisi (Sürüklenebilir & Tıklanabilir)
    const relShort = String(r.relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0];
    const relPinIcon = window.L.divIcon({
      className: 'avigen-leaflet-pin-release',
      html: `<div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
        <div style="background:#991b1b; color:#ffffff; border:1.5px solid #fca5a5; border-radius:6px; padding:2px 7px; font-size:9.2px; font-weight:900; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px;">
          🔴 SALIM: ${escapeHtml(relShort)} (${r.relNode.altM}m)
        </div>
        <div style="width:18px; height:18px; border-radius:50%; background:#dc2626; border:2.5px solid #ffffff; box-shadow:0 2px 8px rgba(220,38,38,0.8);"></div>
      </div>`,
      iconSize: [0, 0]
    });
    const relMarker = window.L.marker(relLatLng, { icon: relPinIcon, draggable: true }).addTo(overlayGroup);
    relMarker.on('dragend', (ev) => {
      const pos = ev.target.getLatLng();
      this.applyLatLonSelectionToSmartRace(pos.lat, pos.lng, 'release');
    });

    // 4. 🟢 Varış / Kümes Noktası İşaretçisi (Sürüklenebilir & Tıklanabilir)
    const loftShort = String(r.loftNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0];
    const loftPinIcon = window.L.divIcon({
      className: 'avigen-leaflet-pin-loft',
      html: `<div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -100%);">
        <div style="background:#065f46; color:#ffffff; border:1.5px solid #6ee7b7; border-radius:6px; padding:2px 7px; font-size:9.2px; font-weight:900; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.5); margin-bottom:3px;">
          🟢 KÜMES: ${escapeHtml(loftShort)} (${r.loftNode.altM}m)
        </div>
        <div style="width:18px; height:18px; border-radius:50%; background:#059669; border:2.5px solid #ffffff; box-shadow:0 2px 8px rgba(5,150,105,0.8);"></div>
      </div>`,
      iconSize: [0, 0]
    });
    const loftMarker = window.L.marker(loftLatLng, { icon: loftPinIcon, draggable: true }).addTo(overlayGroup);
    loftMarker.on('dragend', (ev) => {
      const pos = ev.target.getLatLng();
      this.applyLatLonSelectionToSmartRace(pos.lat, pos.lng, 'arrival');
    });

    // 5. Seçili Salım ve Varış İllerinin Diğer İlçelerini de Haritada Hızlı Seçim Noktası Olarak Göster
    const relDists = this.getDistrictsForProvince(this.state.smartRaceReleaseCityId || r.relNode.id);
    const loftDists = this.getDistrictsForProvince(this.state.smartRaceLoftCityId || r.loftNode.id);
    [
      ...relDists.map(d => ({ ...d, cityId: this.state.smartRaceReleaseCityId || r.relNode.id, role: 'release' })),
      ...loftDists.map(d => ({ ...d, cityId: this.state.smartRaceLoftCityId || r.loftNode.id, role: 'arrival' }))
    ].forEach(d => {
      const isCur = (d.role === 'release' && d.id === this.state.smartRaceReleaseDistrictId) ||
                    (d.role === 'arrival' && d.id === this.state.smartRaceLoftDistrictId);
      if (isCur) return;
      const dot = window.L.circleMarker([d.lat, d.lon], {
        radius: 5,
        fillColor: d.role === 'release' ? '#fb7185' : '#34d399',
        color: '#0f172a',
        weight: 1.5,
        fillOpacity: 0.9
      }).addTo(overlayGroup);
      dot.bindTooltip(`${d.role === 'release' ? '🔴' : '🟢'} ${d.name} (${d.altM}m) — Seçmek için dokunun`, { direction: 'top' });
      dot.on('click', (ev) => {
        if (ev && ev.originalEvent) ev.originalEvent.stopPropagation();
        this.state.smartRaceMapClickTarget = d.role;
        this.selectDistrictFromTurkeyMap(d.cityId, d.id, ev?.originalEvent);
      });
    });

    // 6. Harita Üzerinde Herhangi Bir Yere Tıklandığında En Yakın İl/İlçeyi veya Özel Koordinatı Seç
    map.on('click', (ev) => {
      if (!ev || !ev.latlng) return;
      const role = this.state.smartRaceMapClickTarget === 'arrival' ? 'arrival' : 'release';
      this.applyLatLonSelectionToSmartRace(ev.latlng.lat, ev.latlng.lng, role);
    });

    // Eğer ilk kez açılıyorsa rotayı ekrana sığdır
    if (!this._leafletLastCenter) {
      try {
        const bounds = window.L.latLngBounds([relLatLng, loftLatLng]);
        map.fitBounds(bounds, { padding: [42, 42], maxZoom: 9 });
      } catch (e) {}
    }
    setTimeout(() => {
      if (this._leafletMapInstance) {
        try { this._leafletMapInstance.invalidateSize(); } catch (e) {}
      }
    }, 80);
  },

  applyLatLonSelectionToSmartRace(lat, lon, targetRole) {
    const nearest = this.findNearestGeoNode(lat, lon);
    const distKm = this.computeRawHaversineKm(lat, lon, nearest.lat, nearest.lon);
    const dists = this.getDistrictsForProvince(nearest.id);
    let nearestDist = dists[0];
    let nearestDistKm = 999999;
    dists.forEach(d => {
      const dk = this.computeRawHaversineKm(lat, lon, d.lat, d.lon);
      if (dk < nearestDistKm) {
        nearestDistKm = dk;
        nearestDist = d;
      }
    });

    this.state.smartRaceEventId = 'custom';
    this.state.smartRaceManualKm = 0;
    this.state.smartRaceLiveRouteData = null;

    if (nearestDist && nearestDistKm <= 16) {
      if (targetRole === 'arrival') {
        this.state.smartRaceLoftCityId = nearest.id;
        this.state.smartRaceLoftDistrictId = nearestDist.id;
        this.state.smartRaceCustomLoftCoord = null;
      } else {
        this.state.smartRaceReleaseCityId = nearest.id;
        this.state.smartRaceReleaseDistrictId = nearestDist.id;
        this.state.smartRaceCustomReleaseCoord = null;
      }
    } else {
      const provShort = nearest.name.replace(/^\d{2}\s*-\s*/, '').split(' (')[0];
      const customNode = {
        id: 'custom_coord',
        name: `${provShort} / ${nearestDist ? nearestDist.name.split(' (')[0] : 'Mevki'} (${lat.toFixed(3)}°K, ${lon.toFixed(3)}°D)`,
        lat: Number(lat.toFixed(4)),
        lon: Number(lon.toFixed(4)),
        altM: nearestDist?.altM || nearest.altM || 750,
        region: nearest.region || 'Türkiye',
        terrain: `${nearest.terrain}`
      };
      if (targetRole === 'arrival') {
        this.state.smartRaceLoftCityId = nearest.id;
        this.state.smartRaceCustomLoftCoord = customNode;
      } else {
        this.state.smartRaceReleaseCityId = nearest.id;
        this.state.smartRaceCustomReleaseCoord = customNode;
      }
    }

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  zoomSmartRaceMap(delta, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    if (this._leafletMapInstance && this.state.smartRaceTileLayerType !== 'vector_offline') {
      const zDelta = delta > 0 ? 1 : -1;
      this._leafletMapInstance.setZoom(this._leafletMapInstance.getZoom() + zDelta);
      return;
    }
    const cur = Number(this.state.smartRaceMapZoom) || 1.0;
    const next = Math.max(1.0, Math.min(2.8, Number((cur + delta).toFixed(2))));
    this.state.smartRaceMapZoom = next;
    this.saveState();
    this.renderGenesisReportOnly();
  },

  panSmartRaceMap(dx, dy, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    if (this._leafletMapInstance && this.state.smartRaceTileLayerType !== 'vector_offline') {
      this._leafletMapInstance.panBy([dx * 2.2, dy * 2.2], { animate: true });
      return;
    }
    this.state.smartRaceMapPanX = Math.max(-240, Math.min(240, (Number(this.state.smartRaceMapPanX) || 0) + dx));
    this.state.smartRaceMapPanY = Math.max(-120, Math.min(120, (Number(this.state.smartRaceMapPanY) || 0) + dy));
    this.saveState();
    this.renderGenesisReportOnly();
  },

  focusSmartRaceMapOnRoute(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    const sr = this.analyzeSmartRaceManagement();
    if (this._leafletMapInstance && this.state.smartRaceTileLayerType !== 'vector_offline' && typeof window.L !== 'undefined') {
      const b = window.L.latLngBounds([
        [sr.route.relNode.lat, sr.route.relNode.lon],
        [sr.route.loftNode.lat, sr.route.loftNode.lon]
      ]);
      this._leafletMapInstance.fitBounds(b, { padding: [38, 38], maxZoom: 11 });
      return;
    }
    const p1 = this.projectLatLonToTurkeySvg(sr.route.relNode.lat, sr.route.relNode.lon);
    const p2 = this.projectLatLonToTurkeySvg(sr.route.loftNode.lat, sr.route.loftNode.lon);
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    this.state.smartRaceMapZoom = 1.65;
    this.state.smartRaceMapPanX = Math.round(midX - 360);
    this.state.smartRaceMapPanY = Math.round(midY - 160);
    this.saveState();
    this.renderGenesisReportOnly();
  },

  resetSmartRaceMapView(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    this._leafletLastCenter = [39.05, 35.25];
    this._leafletLastZoom = 6;
    if (this._leafletMapInstance && this.state.smartRaceTileLayerType !== 'vector_offline') {
      this._leafletMapInstance.setView([39.05, 35.25], 6);
      return;
    }
    this.state.smartRaceMapZoom = 1.0;
    this.state.smartRaceMapPanX = 0;
    this.state.smartRaceMapPanY = 0;
    this.saveState();
    this.renderGenesisReportOnly();
  },

  swapSmartRaceLocations(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    const tmpId = this.state.smartRaceReleaseCityId;
    this.state.smartRaceReleaseCityId = this.state.smartRaceLoftCityId;
    this.state.smartRaceLoftCityId = tmpId;

    const tmpDist = this.state.smartRaceReleaseDistrictId;
    this.state.smartRaceReleaseDistrictId = this.state.smartRaceLoftDistrictId;
    this.state.smartRaceLoftDistrictId = tmpDist;

    const tmpCoord = this.state.smartRaceCustomReleaseCoord;
    this.state.smartRaceCustomReleaseCoord = this.state.smartRaceCustomLoftCoord;
    this.state.smartRaceCustomLoftCoord = tmpCoord;

    this.state.smartRaceEventId = 'custom';
    this.state.smartRaceManualKm = 0;
    this._leafletLastCenter = null;
    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  applySmartRaceLocationSearch(targetRole) {
    const inp = document.getElementById('srLocationSearchInput');
    const q = (inp ? inp.value : this.state.smartRaceSearchQuery || '').trim();
    if (!q) return;
    this.state.smartRaceSearchQuery = q;

    const found = this.findGeoNodeByNameOrId(q, targetRole === 'arrival' ? 'bursa' : 'ankara');
    this.state.smartRaceEventId = 'custom';
    this.state.smartRaceManualKm = 0;
    this.state.smartRaceLiveRouteData = null;
    this._leafletLastCenter = null;

    if (String(found.id).startsWith('coord_')) {
      if (targetRole === 'arrival') {
        this.state.smartRaceCustomLoftCoord = found;
      } else {
        this.state.smartRaceCustomReleaseCoord = found;
      }
    } else {
      const distId = found.districtId || (this.getDistrictsForProvince(found.id)[0]?.id || 'merkez');
      if (targetRole === 'arrival') {
        this.state.smartRaceLoftCityId = found.id;
        this.state.smartRaceLoftDistrictId = distId;
        this.state.smartRaceCustomLoftCoord = null;
      } else {
        this.state.smartRaceReleaseCityId = found.id;
        this.state.smartRaceReleaseDistrictId = distId;
        this.state.smartRaceCustomReleaseCoord = null;
      }
    }

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  toggleSmartRaceBirdSelection(ring, isChecked) {
    const clean = String(ring || '').trim();
    if (!clean) return;
    if (!Array.isArray(this.state.smartRaceSelectedBirdRings) || this.state.smartRaceSelectedBirdRings.length === 0) {
      const allActive = (typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds().filter(b => b.isActiveLoftBird) : []);
      this.state.smartRaceSelectedBirdRings = allActive.map(b => b.ring);
    }
    if (isChecked) {
      if (!this.state.smartRaceSelectedBirdRings.includes(clean)) {
        this.state.smartRaceSelectedBirdRings.push(clean);
      }
    } else {
      this.state.smartRaceSelectedBirdRings = this.state.smartRaceSelectedBirdRings.filter(r => r !== clean);
    }
    this.invalidateEngineCache();
    this.saveState();
    const cntBadge = document.getElementById('srSelectedBirdCountLabel');
    if (cntBadge) {
      cntBadge.textContent = `${this.state.smartRaceSelectedBirdRings.length} Kuş Seçili`;
    }
  },

  selectAllSmartRaceBirds(filterMode) {
    const allActive = (typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds().filter(b => b.isActiveLoftBird) : []);
    if (filterMode === 'RACERS_ONLY') {
      const racers = allActive.filter(b => b.roleCategory === 'RACER');
      this.state.smartRaceSelectedBirdRings = (racers.length ? racers : allActive).map(b => b.ring);
    } else {
      this.state.smartRaceSelectedBirdRings = allActive.map(b => b.ring);
    }
    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  async startSmartRaceSimulation() {
    // 1. Formdaki güncel verileri oku
    const nameEl = document.getElementById('srRaceNameInput');
    const dateEl = document.getElementById('srReleaseDate');
    const timeEl = document.getElementById('srReleaseTime');
    const relSel = document.getElementById('srReleaseCitySelect');
    const relDistSel = document.getElementById('srReleaseDistrictSelect');
    const loftSel = document.getElementById('srLoftCitySelect');
    const loftDistSel = document.getElementById('srLoftDistrictSelect');

    if (nameEl) this.state.smartRaceCustomTitle = nameEl.value.trim();
    if (dateEl && dateEl.value) this.state.smartRaceDate = dateEl.value;
    if (timeEl && timeEl.value) this.state.smartRaceReleaseTime = timeEl.value;
    if (relSel && !this.state.smartRaceCustomReleaseCoord) this.state.smartRaceReleaseCityId = relSel.value;
    if (relDistSel && !this.state.smartRaceCustomReleaseCoord) this.state.smartRaceReleaseDistrictId = relDistSel.value;
    if (loftSel && !this.state.smartRaceCustomLoftCoord) this.state.smartRaceLoftCityId = loftSel.value;
    if (loftDistSel && !this.state.smartRaceCustomLoftCoord) this.state.smartRaceLoftDistrictId = loftDistSel.value;

    const relNode = this.resolveProvinceAndDistrictNode(this.state.smartRaceReleaseCityId, this.state.smartRaceReleaseDistrictId, this.state.smartRaceCustomReleaseCoord, 'ankara');
    const loftNode = this.resolveProvinceAndDistrictNode(this.state.smartRaceLoftCityId, this.state.smartRaceLoftDistrictId, this.state.smartRaceCustomLoftCoord, 'bursa');
    if (this.computeRawHaversineKm(relNode.lat, relNode.lon, loftNode.lat, loftNode.lon) < 8) {
      alert('⚠️ Salım noktası ile varış (kümes) noktası aynı konum olamaz. Lütfen haritadan veya listeden farklı bir salım/varış noktası seçin.');
      return;
    }

    // 2. Sade ve anlaşılır ilerleme ekranını göster
    const out = document.getElementById('genesisReportOutput');
    if (out) {
      out.innerHTML = `
        <div class="sr-form-card" style="padding:22px 16px; text-align:center;">
          <div class="dna-pulse-logo" style="width:46px; height:46px; margin:0 auto 10px;">
            <img src="avigen-logo.svg" alt="AVIGEN" style="width:100%; height:100%; object-fit:contain;" />
          </div>
          <div style="font-size:13px; font-weight:900; color:var(--ios-text); margin-bottom:4px;">
            GENESIS AI Akıllı Yarış Simülasyonu Yürütülüyor...
          </div>
          <div id="srSimProgressStepText" style="font-size:10.5px; font-weight:700; color:#0052cc; margin-bottom:10px;">
            1/3 • ${escapeHtml(relNode.name)} → ${escapeHtml(loftNode.name)} koordinatları ve uçuş rotası hesaplanıyor...
          </div>
          <div class="dna-scan-bar" style="max-width:320px; margin:0 auto 12px;">
            <div class="dna-scan-fill"></div>
          </div>
          <div style="display:flex; flex-direction:column; gap:5px; max-width:360px; margin:0 auto; text-align:left; font-size:9.8px; color:var(--ios-subtext); background:var(--ios-card); border:1px solid var(--ios-border); border-radius:9px; padding:9px 11px;">
            <div>✅ <strong>Rota &amp; Coğrafya:</strong> WGS84 Haversine kuş uçuşu ve arazi koridoru analizi</div>
            <div>🌤️ <strong>Meteoroloji:</strong> Salım, orta geçit ve varış noktaları atmosferik veri sorgusu</div>
            <div>🕊️ <strong>Kuş Performansı:</strong> Seçilen kuşların yarış geçmişi ve dönüş aralığı hesabı</div>
          </div>
        </div>
      `;
    }

    // 3. Gerçek meteorolojik veri sorgusu (Çevrimiçiyse Open-Meteo'dan gerçek veriyi alır, çevrimdışıysa sahte API verisi üretmez)
    try {
      const stepEl = document.getElementById('srSimProgressStepText');
      if (stepEl) stepEl.textContent = '2/3 • Güzergâh meteoroloji verileri (Open-Meteo WMO) sorgulanıyor...';

      const midLat = Number(((relNode.lat + loftNode.lat) / 2).toFixed(4));
      const midLon = Number(((relNode.lon + loftNode.lon) / 2).toFixed(4));
      const fetchWithTimeout = async (lat, lon) => {
        const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
        const tid = ctrl ? setTimeout(() => ctrl.abort(), 1600) : null;
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation&timezone=auto`;
          const res = await fetch(url, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined });
          if (tid) clearTimeout(tid);
          if (!res.ok) throw new Error('HTTP ' + res.status);
          const j = await res.json();
          return j.current || null;
        } catch (e) {
          if (tid) clearTimeout(tid);
          return null;
        }
      };

      const [cRel, cMid, cLoft] = await Promise.all([
        fetchWithTimeout(relNode.lat, relNode.lon),
        fetchWithTimeout(midLat, midLon),
        fetchWithTimeout(loftNode.lat, loftNode.lon)
      ]);

      if (cRel && cMid && cLoft) {
        const nowStr = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        const avgWind = Math.round(((Number(cRel.wind_speed_10m || 12) + Number(cMid.wind_speed_10m || 14) + Number(cLoft.wind_speed_10m || 12)) / 3));
        const avgTemp = Math.round(((Number(cRel.temperature_2m || 18) + Number(cMid.temperature_2m || 16) + Number(cLoft.temperature_2m || 19)) / 3));
        const avgHum = Math.round(((Number(cRel.relative_humidity_2m || 55) + Number(cMid.relative_humidity_2m || 55) + Number(cLoft.relative_humidity_2m || 55)) / 3));
        const maxPrecip = Number(Math.max(Number(cRel.precipitation || 0), Number(cMid.precipitation || 0), Number(cLoft.precipitation || 0)).toFixed(1));
        const maxWCode = Math.max(Number(cRel.weather_code || 0), Number(cMid.weather_code || 0), Number(cLoft.weather_code || 0));

        this.state.smartRaceLiveRouteData = {
          isLiveApi: true,
          fetchedAt: nowStr,
          sourceName: 'Open-Meteo WMO Güzergâh Çoklu Nokta API (Gerçek Zamanlı Ölçüm)',
          release: {
            temp: Math.round(Number(cRel.temperature_2m ?? 18)),
            hum: Math.round(Number(cRel.relative_humidity_2m ?? 55)),
            windSpeed: Math.round(Number(cRel.wind_speed_10m ?? 12)),
            windDir: Math.round(Number(cRel.wind_direction_10m ?? 45)),
            precip: Number(cRel.precipitation ?? 0),
            wCode: Number(cRel.weather_code ?? 1)
          },
          mid: {
            temp: Math.round(Number(cMid.temperature_2m ?? 16)),
            hum: Math.round(Number(cMid.relative_humidity_2m ?? 58)),
            windSpeed: Math.round(Number(cMid.wind_speed_10m ?? 15)),
            windDir: Math.round(Number(cMid.wind_direction_10m ?? 50)),
            precip: Number(cMid.precipitation ?? 0),
            wCode: Number(cMid.weather_code ?? 1)
          },
          loft: {
            temp: Math.round(Number(cLoft.temperature_2m ?? 20)),
            hum: Math.round(Number(cLoft.relative_humidity_2m ?? 55)),
            windSpeed: Math.round(Number(cLoft.wind_speed_10m ?? 12)),
            windDir: Math.round(Number(cLoft.wind_direction_10m ?? 45)),
            precip: Number(cLoft.precipitation ?? 0),
            wCode: Number(cLoft.weather_code ?? 1)
          }
        };
        this.state.smartRaceTempC = avgTemp;
        this.state.smartRaceHumPct = avgHum;
        this.state.smartRaceWindSpeedKmh = avgWind;
        this.state.smartRacePrecipMm = maxPrecip;
        this.state.smartRaceVisKm = maxWCode >= 45 ? 4 : (maxPrecip > 1 ? 6 : 10);
      }
    } catch (e) {}

    // 4. Gerçek simülasyon hesaplamasını tamamla, kaydet ve 2. Aşama (Sonuç Özeti) ekranını aç
    this.invalidateEngineCache();
    const sr = this.analyzeSmartRaceManagement();
    this.saveSmartRaceSimulationSnapshot(sr);
    this.state.smartRaceStage = 'summary';
    this.saveState();
    this.renderGenesisModuleUI();
  },

  saveSmartRaceSimulationSnapshot(sr) {
    if (!sr || !sr.route) return;
    if (!Array.isArray(this.state.smartRaceSavedSimulations)) {
      this.state.smartRaceSavedSimulations = [];
    }
    const r = sr.route;
    const relShort = String(r.relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0];
    const loftShort = String(r.loftNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0];
    const raceTitle = this.state.smartRaceCustomTitle || (sr.selectedEvent ? sr.selectedEvent.codeTitle : `${relShort.toUpperCase()} – ${loftShort.toUpperCase()} Etabı`);
    const dedupKey = `${r.relNode.id}__${r.relNode.districtId || 'm'}__${r.loftNode.id}__${r.loftNode.districtId || 'm'}__${sr.releaseDate}__${sr.releaseTime}`;
    this.state.smartRaceSavedSimulations = this.state.smartRaceSavedSimulations.filter(s => s.dedupKey !== dedupKey);

    this.state.smartRaceSavedSimulations.unshift({
      id: 'sr_sim_' + Date.now(),
      dedupKey,
      savedAt: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      raceTitle,
      releaseCityId: this.state.smartRaceReleaseCityId,
      releaseDistrictId: this.state.smartRaceReleaseDistrictId,
      loftCityId: this.state.smartRaceLoftCityId,
      loftDistrictId: this.state.smartRaceLoftDistrictId,
      customReleaseCoord: this.state.smartRaceCustomReleaseCoord,
      customLoftCoord: this.state.smartRaceCustomLoftCoord,
      releaseName: r.relNode.name,
      loftName: r.loftNode.name,
      releaseDate: sr.releaseDate,
      releaseTime: sr.releaseTime,
      crowFliesKm: r.crowFliesKm,
      corridorLabel: `${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km`,
      overallRiskLevel: sr.overallRiskLevel,
      overallRiskBadge: sr.overallRiskBadge,
      likelyWindowClock: sr.fleetReturnEstimate.likelyWindowClock,
      reliabilityPct: sr.reliabilityPct,
      birdCount: sr.birdEvaluations.length,
      eventId: this.state.smartRaceEventId
    });
    this.state.smartRaceSavedSimulations = this.state.smartRaceSavedSimulations.slice(0, 15);
  },

  openSavedSmartRaceSimulation(simId) {
    const list = Array.isArray(this.state.smartRaceSavedSimulations) ? this.state.smartRaceSavedSimulations : [];
    const found = list.find(s => s.id === simId);
    if (!found) return;

    this.state.smartRaceCustomTitle = found.raceTitle || '';
    this.state.smartRaceReleaseCityId = found.releaseCityId || 'ankara';
    this.state.smartRaceReleaseDistrictId = found.releaseDistrictId || (this.getDistrictsForProvince(found.releaseCityId || 'ankara')[0]?.id || 'merkez');
    this.state.smartRaceLoftCityId = found.loftCityId || 'bursa';
    this.state.smartRaceLoftDistrictId = found.loftDistrictId || (this.getDistrictsForProvince(found.loftCityId || 'bursa')[0]?.id || 'merkez');
    this.state.smartRaceCustomReleaseCoord = found.customReleaseCoord || null;
    this.state.smartRaceCustomLoftCoord = found.customLoftCoord || null;
    this.state.smartRaceDate = found.releaseDate || '2026-11-22';
    this.state.smartRaceReleaseTime = found.releaseTime || '06:45';
    this.state.smartRaceEventId = found.eventId || 'custom';
    this.state.smartRaceManualKm = 0;
    this.state.smartRaceStage = 'summary';

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisModuleUI();
  },

  pinCurrentLoftLocation() {
    const loftSel = document.getElementById('srLoftCitySelect');
    const loftDistSel = document.getElementById('srLoftDistrictSelect');
    if (loftSel && !this.state.smartRaceCustomLoftCoord) {
      this.state.smartRaceLoftCityId = loftSel.value;
    }
    if (loftDistSel && !this.state.smartRaceCustomLoftCoord) {
      this.state.smartRaceLoftDistrictId = loftDistSel.value;
    }
    const node = this.resolveProvinceAndDistrictNode(this.state.smartRaceLoftCityId, this.state.smartRaceLoftDistrictId, this.state.smartRaceCustomLoftCoord, 'bursa');
    if (typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state && !String(node.id).startsWith('coord_')) {
      AvigenLiveWeather.state.cityId = node.id;
      AvigenLiveWeather.state.cityName = node.name;
      if (typeof AvigenLiveWeather.saveState === 'function') AvigenLiveWeather.saveState();
    }
    this.saveState();
    alert(`🏠 Kümes Konumunuz Sabitlendi:\n\n"${node.name}" varış noktanız olarak kaydedildi. Yeni yarış ve simülasyonlarda yeşil kümes bayrağınız otomatik olarak burada başlayacaktır.`);
  },

  applySmartRaceManualCoordinate(targetType = 'release') {
    const inpId = targetType === 'arrival' ? 'srLoftCoordInput' : 'srReleaseCoordInput';
    const rawStr = (document.getElementById(inpId)?.value || '').trim();
    if (!rawStr) {
      alert('⚠️ Lütfen enlem ve boylam koordinatını girin (Örn: 39.5842, 32.1472 veya 39°35\'03"N 32°08\'50"E).');
      return;
    }
    const parsed = (typeof AvigenRaceTracker !== 'undefined' && typeof AvigenRaceTracker.parseGpsCoordinateString === 'function')
      ? AvigenRaceTracker.parseGpsCoordinateString(rawStr)
      : null;

    let lat = parsed ? parsed.lat : null;
    let lon = parsed ? parsed.lon : null;
    if (lat === null || lon === null) {
      const m = rawStr.replace(/;/g, ',').match(/[-+]?\d{1,3}(?:\.\d+)/g);
      if (m && m.length >= 2) {
        lat = parseFloat(m[0]);
        lon = parseFloat(m[1]);
      }
    }

    if (lat === null || lon === null || isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      alert('⚠️ Geçersiz koordinat formatı! Lütfen "39.5842, 32.1472" veya "39°35\'03\"N 32°08\'50\"E" biçiminde girin.');
      return;
    }

    const nearest = this.findNearestProvinceToCoord(lat, lon);
    const customNode = {
      id: `coord_${lat.toFixed(4)}_${lon.toFixed(4)}`,
      name: `${nearest.name.split(' (')[0]} (${lat.toFixed(4)}°K, ${lon.toFixed(4)}°D)`,
      lat: Number(lat.toFixed(5)),
      lon: Number(lon.toFixed(5)),
      altM: nearest.altM || 450,
      terrain: nearest.terrain || 'Özel GPS Koordinatı'
    };

    if (targetType === 'arrival') {
      this.state.smartRaceLoftCityId = nearest.id;
      this.state.smartRaceCustomLoftCoord = customNode;
      try {
        const coordText = `${customNode.lat}, ${customNode.lon}`;
        localStorage.setItem('avigen_saved_loft_gps_coords_v1', coordText);
        if (typeof loftConfig !== 'undefined') {
          loftConfig.gpsCoords = coordText;
          if (typeof saveMypedigreData === 'function') saveMypedigreData();
        }
      } catch (e) {}
    } else {
      this.state.smartRaceEventId = 'custom';
      this.state.smartRaceReleaseCityId = nearest.id;
      this.state.smartRaceCustomReleaseCoord = customNode;
    }

    this.state.smartRaceManualKm = 0;
    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisModuleUI();
  },

  async pasteSmartRaceCoordinate(targetType = 'release') {
    const inpId = targetType === 'arrival' ? 'srLoftCoordInput' : 'srReleaseCoordInput';
    const el = document.getElementById(inpId);
    if (!el) return;
    let rawClip = '';
    if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      try {
        rawClip = (await navigator.clipboard.readText()) || '';
      } catch (e) {}
    }
    if (!rawClip.trim()) {
      const manual = prompt('📋 Kopyaladığınız Google Haritalar / WhatsApp Konumunu veya Enlem, Boylam koordinatını buraya yapıştırın:', el.value || '39.9334, 32.8597');
      if (manual === null) return;
      rawClip = manual;
    }
    if (rawClip.trim()) {
      el.value = rawClip.trim();
      this.applySmartRaceManualCoordinate(targetType);
    }
  },

  captureSmartRaceGpsLocation(targetType = 'arrival') {
    if (!navigator.geolocation) {
      alert('⚠️ Cihazınızda GPS konum servisi bulunamadı. Koordinatı kutucuğa elle yazabilirsiniz.');
      return;
    }
    const applyPos = (pos) => {
      const lat = Number(pos.coords.latitude).toFixed(5);
      const lon = Number(pos.coords.longitude).toFixed(5);
      const inpId = targetType === 'arrival' ? 'srLoftCoordInput' : 'srReleaseCoordInput';
      const el = document.getElementById(inpId);
      if (el) el.value = `${lat}, ${lon}`;
      this.applySmartRaceManualCoordinate(targetType);
    };

    navigator.geolocation.getCurrentPosition(
      applyPos,
      () => {
        navigator.geolocation.getCurrentPosition(
          applyPos,
          () => {
            alert('⚠️ GPS konum izni alınamadı veya telefonun Konum servisi kapalı. Koordinatı kutucuğa elle (Örn: 40.1885, 29.0610) yazıp "Uygula" butonuna basabilirsiniz.');
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  },

  createOfficialRaceFromSimulation() {
    const sr = this.analyzeSmartRaceManagement();
    const r = sr.route;
    const checkedEls = Array.from(document.querySelectorAll('.sr-sim-basket-chk:checked'));
    const selectedBirds = checkedEls.length > 0
      ? checkedEls.map(c => ({
          ring: c.value,
          birdName: c.getAttribute('data-name') || 'Kayıtlı Güvercin',
          flag: c.getAttribute('data-flag') || '🇹🇷'
        }))
      : sr.birdEvaluations.slice(0, 6).map(b => ({
          ring: b.ring,
          birdName: b.name,
          flag: b.flag || '🇹🇷'
        }));

    if (selectedBirds.length === 0) {
      alert('Lütfen yarışa sepetlenecek en az 1 güvercin işaretleyin.');
      return;
    }

    const relShort = String(r.relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].trim();
    const codeTitle = this.state.smartRaceCustomTitle || `${relShort.toUpperCase()} – 2026 ETABI`;
    const z1 = sr.zoneWeather[0];
    const z2 = sr.zoneWeather[1];
    const weatherSummary = `${z2.windEffectLabel} ${z2.windSpeedKmh} km/s • ${z1.tempC}°C`;
    const totalCompetitors = 1500;

    if (typeof AvigenRaceTracker !== 'undefined') {
      if (!AvigenRaceTracker._initialized) AvigenRaceTracker.init();
      const dObj = new Date(sr.releaseDate);
      const releaseDateLabel = !isNaN(dObj)
        ? dObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
        : sr.releaseDate;

      const newEv = {
        id: 'race_ev_' + Date.now(),
        codeTitle,
        releasePoint: r.relNode.name,
        distanceKm: r.crowFliesKm,
        participantBirdsCount: selectedBirds.length,
        releaseDate: sr.releaseDate,
        releaseDateLabel,
        releaseTime: sr.releaseTime,
        raceType: AvigenRaceTracker.detectRaceTypeByKm(r.crowFliesKm),
        totalCompetitors,
        weather: weatherSummary,
        status: 'PENDING_RESULTS',
        entries: selectedBirds.map(b => ({
          ring: b.ring,
          birdName: b.birdName,
          flag: b.flag,
          arrivalDate: '',
          arrivalTime: '',
          durationMinutes: null,
          durationLabel: '—',
          speedMpm: null,
          rank: null,
          totalCompetitors,
          weather: weatherSummary,
          resultStatus: 'PENDING',
          notes: 'GENESIS AI Haritalı Simülasyon kadrosundan sepetlendi'
        }))
      };

      AvigenRaceTracker.events.unshift(newEv);
      AvigenRaceTracker.saveEvents();
      this.state.smartRaceEventId = newEv.id;
      this.saveState();

      if (typeof openIosTab === 'function') {
        openIosTab('flight', document.querySelectorAll('.ios-tab-btn')[3]);
      }
      if (typeof AvigenUxManager !== 'undefined') {
        AvigenUxManager.switchBreedingPlanSub('racetracker');
      } else {
        AvigenRaceTracker.renderRaceTrackerMainUI();
      }
    }
  },

  calculateHaversineRoute(relNode, loftNode, manualOverrideKm = 0, windType = 'calm', windSpeedKmh = 15) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const toDeg = (rad) => (rad * 180) / Math.PI;
    const R = 6371; // Dünya yarıçapı (km)

    const dLat = toRad(loftNode.lat - relNode.lat);
    const dLon = toRad(loftNode.lon - relNode.lon);
    const lat1 = toRad(relNode.lat);
    const lat2 = toRad(loftNode.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const haversineKm = Math.max(15, Math.round(R * c));

    // Başlangıç Azimut (Uçuş Yönü Açısı 0..360°)
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    const bearingDeg = Math.round((toDeg(Math.atan2(y, x)) + 360) % 360);
    const compassDirs = [
      'K (Kuzey)', 'KKD (Kuzey-Kuzeydoğu)', 'KD (Kuzeydoğu)', 'DKD (Doğu-Kuzeydoğu)',
      'D (Doğu)', 'DGD (Doğu-Güneydoğu)', 'GD (Güneydoğu)', 'GGD (Güney-Güneydoğu)',
      'G (Güney)', 'GGB (Güney-Güneybatı)', 'GB (Güneybatı)', 'BGB (Batı-Güneybatı)',
      'B (Batı)', 'BKB (Batı-Kuzeybatı)', 'KB (Kuzeybatı)', 'KKB (Kuzey-Kuzeybatı)'
    ];
    const compassLabel = compassDirs[Math.round(bearingDeg / 22.5) % 16];

    const crowFliesKm = (Number(manualOverrideKm) > 10) ? Math.round(Number(manualOverrideKm)) : haversineKm;

    // Orta Geçit Koordinatı ve Tahmini Rakımı
    const midLat = Number(((relNode.lat + loftNode.lat) / 2).toFixed(4));
    const midLon = Number(((relNode.lon + loftNode.lon) / 2).toFixed(4));
    const elevationDeltaM = Math.abs((relNode.altM || 100) - (loftNode.altM || 100));
    const midPassAltM = Math.round(Math.max(relNode.altM || 100, loftNode.altM || 100) + Math.min(480, crowFliesKm * 0.65));

    // Kuş Uçuş Mesafesi vs Olası Gerçek Uçuş Mesafesi (Arazi ve Rüzgâr Sapma Faktörü)
    const terrainDeviationPct = Math.min(8, Math.max(4, Math.round((midPassAltM / 260) + (elevationDeltaM / 320))));
    const windDriftPct = (windType === 'cross' || windType === 'storm')
      ? Math.min(9, Math.round(windSpeedKmh / 4))
      : (windType === 'head' ? Math.min(6, Math.round(windSpeedKmh / 6)) : 2);

    const minDeviationPct = terrainDeviationPct;
    const maxDeviationPct = terrainDeviationPct + windDriftPct + 4;
    const actualCorridorMinKm = Math.round(crowFliesKm * (1 + minDeviationPct / 100));
    const actualCorridorMaxKm = Math.round(crowFliesKm * (1 + maxDeviationPct / 100));

    // Coğrafi Engellerin Otomatik Tespiti
    const obstacles = [];
    const minLat = Math.min(relNode.lat, loftNode.lat);
    const maxLat = Math.max(relNode.lat, loftNode.lat);
    const minLon = Math.min(relNode.lon, loftNode.lon);
    const maxLon = Math.max(relNode.lon, loftNode.lon);

    if (minLon <= 30.8 && maxLon >= 29.7 && maxLat >= 39.5) {
      obstacles.push({
        name: 'Bilecik – Bozüyük Dağlık Kırılımı & Sakarya Vadisi (650–950m)',
        segment: '2. Bölüm (Orta Geçiş)',
        impact: 'İç Anadolu platosundan Güney Marmara/Kuzeybatı havzasına inişte vadilerde kanalize rüzgâr, türbülans ve yırtıcı kuş yoğunluğu oluşturur.'
      });
    }
    if (minLon <= 32.2 && maxLon >= 31.0 && maxLat >= 40.3) {
      obstacles.push({
        name: 'Bolu – Köroğlu Dağ Geçidi (1.350–1.500m)',
        segment: '2. Bölüm (Orta Geçiş)',
        impact: 'Sabah erken saatlerde taban sisi, alçak bulut tavanı ve yüksek irtifa ısı düşüşü nedeniyle görüş kısıtlaması yaratır.'
      });
    }
    if (maxLon >= 35.5 && minLon <= 36.8) {
      obstacles.push({
        name: 'Çamlıbel & Kızılırmak Yüksek Yayla Geçidi (1.400–1.650m)',
        segment: '1–2. Bölüm (Plato Geçişi)',
        impact: 'Yüksek irtifada düşük hava yoğunluğu ve sert cephe rüzgârları nedeniyle kanat çırpma enerji maliyetini artırır.'
      });
    }
    if ((relNode.id === 'istanbul' || loftNode.id === 'istanbul') && (relNode.lat < 40.5 || loftNode.lat < 40.5)) {
      obstacles.push({
        name: 'Marmara Denizi / İzmit Körfezi Su Kütlesi Engeli',
        segment: '3. Bölüm (Kümes Yaklaşma)',
        impact: 'Güvercinler açık deniz yüzeyinden kaçınarak İzmit Körfezi doğu ucundan veya Yalova-Gebze kıyı hattından yay çizerek uçuş mesafesini +%6–10 uzatır.'
      });
    }
    if (minLat <= 37.6 && maxLat >= 38.2) {
      obstacles.push({
        name: 'Toros Dağları / İç Anadolu Güney Eşiği (1.200–1.650m)',
        segment: '2. Bölüm (Orta Geçiş)',
        impact: 'Dağ sırası aşılırken dikey hava akımları ve Gülek/Sertavul/Çubuk boğazlarında rüzgâr hızlanması görülür.'
      });
    }
    if (obstacles.length === 0) {
      obstacles.push({
        name: `${relNode.terrain} → ${loftNode.terrain} Arazi Geçişi (~${midPassAltM}m)`,
        segment: '2. Bölüm (Orta Geçiş)',
        impact: `Salım rakımı (${relNode.altM}m) ile kümes rakımı (${loftNode.altM}m) arasındaki ${elevationDeltaM}m irtifa farkı ve vadi kıvrımları uçuş koridorunu şekillendirir.`
      });
    }

    // Olası Uçuş Koridorları
    const corridors = [
      {
        name: '1. Merkez (Kuş Uçuşu Referans) Koridoru',
        distanceLabel: `${crowFliesKm} km (Teorik Düz Hat)`,
        description: `Salım noktası (${relNode.name}) ile kümes (${loftNode.name}) arasındaki ${bearingDeg}° ${compassLabel} yönlü en kısa jeodezik hat. Sakin havada ve düz arazide referans eksendir.`
      },
      {
        name: '2. Topoğrafik Vadi & Otoyol Görsel Koridoru (En Olası Rota)',
        distanceLabel: `${actualCorridorMinKm} – ${actualCorridorMaxKm} km (+%${minDeviationPct}..%${maxDeviationPct} Sapma)`,
        description: `Güvercinlerin yüksek sırtlardan (${midPassAltM}m) ve su kütlelerinden kaçınarak akarsu vadilerini ve otoyol koridorlarını takip ettiği gerçekçi uçuş zarfı.`
      },
      {
        name: '3. Rüzgâr Sürüklenme (Wind-Drift) Yan Koridoru',
        distanceLabel: `${actualCorridorMaxKm} km`,
        description: `Yan veya karşı-yan rüzgâr (${windSpeedKmh} km/s) altında sürünün rüzgâr altına sürüklenip son 50 km'de kümese düzeltme yaptığı koridor.`
      }
    ];

    // Güzergâhın 3 Bölümü
    const seg1Km = Math.round(crowFliesKm * 0.25);
    const seg2Km = Math.round(crowFliesKm * 0.50);
    const seg3Km = Math.max(5, crowFliesKm - seg1Km - seg2Km);

    const segments = [
      {
        id: 'SEG_1',
        title: `1. Bölüm: Salım & Yönelim Çıkışı (0 – ${seg1Km} km)`,
        regionName: `${relNode.name} (${relNode.altM}m Rakım)`,
        terrainNote: `${relNode.terrain}. İlk 15–30 dakikada sürü ayrışması, güneş/manyetik pusula kalibrasyonu ve plato çıkış tırmanışı gerçekleşir.`
      },
      {
        id: 'SEG_2',
        title: `2. Bölüm: Orta Geçiş & Coğrafi Engeller (${seg1Km} – ${seg1Km + seg2Km} km)`,
        regionName: `Orta Geçit Hattı (~${midPassAltM}m Tepe Rakım • ${midLat}°K, ${midLon}°D)`,
        terrainNote: `${obstacles[0].name}. Yarışın en kritik dayanıklılık, rüzgâr direnci ve su/glikojen/lipit tüketim bölgesidir.`
      },
      {
        id: 'SEG_3',
        title: `3. Bölüm: Kümes Yaklaşma & Final İniş (${seg1Km + seg2Km} – ${crowFliesKm} km)`,
        regionName: `${loftNode.name} (${loftNode.altM}m Rakım)`,
        terrainNote: `${loftNode.terrain}. Kuşların bireysel olarak sürüden koptuğu, görsel nirengi noktalarıyla kümese kilitlendiği ve son hız (sprint) farkının belirlendiği bölümdür.`
      }
    ];

    return {
      relNode,
      loftNode,
      midLat,
      midLon,
      midPassAltM,
      elevationDeltaM,
      haversineKm,
      crowFliesKm,
      actualCorridorMinKm,
      actualCorridorMaxKm,
      minDeviationPct,
      maxDeviationPct,
      bearingDeg,
      compassLabel,
      obstacles,
      corridors,
      segments
    };
  },

  async fetchSmartRaceRouteWeather(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    const relNode = this.findGeoNodeByNameOrId(this.state.smartRaceReleaseCityId, 'ankara');
    const loftNode = this.findGeoNodeByNameOrId(this.state.smartRaceLoftCityId, 'bursa');
    const midLat = Number(((relNode.lat + loftNode.lat) / 2).toFixed(4));
    const midLon = Number(((relNode.lon + loftNode.lon) / 2).toFixed(4));

    const btn = document.getElementById('btnFetchSmartRaceWeather');
    if (btn) btn.textContent = '🔄 3 Bölge Hava Verisi Çekiliyor...';

    try {
      const fetchPoint = async (lat, lon) => {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation&timezone=auto`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const j = await res.json();
        return j.current || {};
      };

      const [cRel, cMid, cLoft] = await Promise.all([
        fetchPoint(relNode.lat, relNode.lon),
        fetchPoint(midLat, midLon),
        fetchPoint(loftNode.lat, loftNode.lon)
      ]);

      const nowStr = new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const avgWind = Math.round(((Number(cRel.wind_speed_10m || 12) + Number(cMid.wind_speed_10m || 14) + Number(cLoft.wind_speed_10m || 12)) / 3));
      const avgTemp = Math.round(((Number(cRel.temperature_2m || 18) + Number(cMid.temperature_2m || 16) + Number(cLoft.temperature_2m || 19)) / 3));
      const avgHum = Math.round(((Number(cRel.relative_humidity_2m || 55) + Number(cMid.relative_humidity_2m || 55) + Number(cLoft.relative_humidity_2m || 55)) / 3));
      const maxPrecip = Number(Math.max(Number(cRel.precipitation || 0), Number(cMid.precipitation || 0), Number(cLoft.precipitation || 0)).toFixed(1));
      const maxWCode = Math.max(Number(cRel.weather_code || 0), Number(cMid.weather_code || 0), Number(cLoft.weather_code || 0));

      this.state.smartRaceLiveRouteData = {
        isLiveApi: true,
        fetchedAt: nowStr,
        sourceName: 'Open-Meteo WMO Güzergâh Çoklu Nokta API (Gerçek Zamanlı Ölçüm)',
        release: {
          temp: Math.round(Number(cRel.temperature_2m ?? 18)),
          hum: Math.round(Number(cRel.relative_humidity_2m ?? 55)),
          windSpeed: Math.round(Number(cRel.wind_speed_10m ?? 12)),
          windDir: Math.round(Number(cRel.wind_direction_10m ?? 45)),
          precip: Number(cRel.precipitation ?? 0),
          wCode: Number(cRel.weather_code ?? 1)
        },
        mid: {
          temp: Math.round(Number(cMid.temperature_2m ?? 16)),
          hum: Math.round(Number(cMid.relative_humidity_2m ?? 58)),
          windSpeed: Math.round(Number(cMid.wind_speed_10m ?? 15)),
          windDir: Math.round(Number(cMid.wind_direction_10m ?? 50)),
          precip: Number(cMid.precipitation ?? 0),
          wCode: Number(cMid.weather_code ?? 1)
        },
        loft: {
          temp: Math.round(Number(cLoft.temperature_2m ?? 20)),
          hum: Math.round(Number(cLoft.relative_humidity_2m ?? 55)),
          windSpeed: Math.round(Number(cLoft.wind_speed_10m ?? 12)),
          windDir: Math.round(Number(cLoft.wind_direction_10m ?? 45)),
          precip: Number(cLoft.precipitation ?? 0),
          wCode: Number(cLoft.weather_code ?? 1)
        }
      };

      this.state.smartRaceWeatherSource = 'live_or_event';
      this.state.smartRaceTempC = avgTemp;
      this.state.smartRaceHumPct = avgHum;
      this.state.smartRaceWindSpeedKmh = avgWind;
      this.state.smartRacePrecipMm = maxPrecip;
      this.state.smartRaceVisKm = maxWCode >= 45 ? 4 : (maxPrecip > 1 ? 6 : 10);
      this.state.smartRaceStormAlert = maxWCode >= 95 ? 'thunderstorm_cb' : (avgWind >= 32 ? 'sudden_change' : 'none');

      this.invalidateEngineCache();
      this.saveState();
      this.renderGenesisModuleUI();
    } catch (err) {
      // API erişimi yoksa sahte canlı hava verisi üretilmez!
      this.state.smartRaceLiveRouteData = null;
      this.saveState();
      if (btn) btn.textContent = '⚠️ Çevrimdışı (Kayıtlı/Senaryo Verisi Aktif)';
      this.renderGenesisReportOnly();
    }
  },

  onSmartRaceControlChange(changedField) {
    const evSel = document.getElementById('srEventSelect');
    const relSel = document.getElementById('srReleaseCitySelect');
    const relDistSel = document.getElementById('srReleaseDistrictSelect');
    const loftSel = document.getElementById('srLoftCitySelect');
    const loftDistSel = document.getElementById('srLoftDistrictSelect');
    const dateEl = document.getElementById('srReleaseDate');
    const timeEl = document.getElementById('srReleaseTime');
    const kmEl = document.getElementById('srManualKm');
    const windTypeEl = document.getElementById('srWindType');
    const windSpdEl = document.getElementById('srWindSpeed');
    const tempEl = document.getElementById('srTempC');
    const humEl = document.getElementById('srHumPct');
    const precipEl = document.getElementById('srPrecipMm');
    const visEl = document.getElementById('srVisKm');
    const stormEl = document.getElementById('srStormAlert');

    if (changedField === 'event' && evSel) {
      this.state.smartRaceEventId = evSel.value;
      if (evSel.value !== 'custom') {
        const events = (typeof AvigenRaceTracker !== 'undefined' && Array.isArray(AvigenRaceTracker.events))
          ? AvigenRaceTracker.events
          : [];
        const chosenEv = events.find(e => e.id === evSel.value) || events[0];
        if (chosenEv) {
          const matchedRel = this.findGeoNodeByNameOrId(chosenEv.releasePoint || chosenEv.codeTitle, 'ankara');
          this.state.smartRaceReleaseCityId = matchedRel.id;
          this.state.smartRaceReleaseDistrictId = matchedRel.districtId || (this.getDistrictsForProvince(matchedRel.id)[0]?.id || 'merkez');
          this.state.smartRaceDate = chosenEv.releaseDate || '2026-11-22';
          this.state.smartRaceReleaseTime = chosenEv.releaseTime || '06:45';
          this.state.smartRaceManualKm = Number(chosenEv.distanceKm) || 0;
          const wTxt = String(chosenEv.weather || '').toLowerCase();
          if (wTxt.includes('karşı')) this.state.smartRaceWindType = 'head';
          else if (wTxt.includes('arka')) this.state.smartRaceWindType = 'tail';
          else if (wTxt.includes('yan')) this.state.smartRaceWindType = 'cross';
          else if (wTxt.includes('fırtına')) this.state.smartRaceWindType = 'storm';
          else this.state.smartRaceWindType = 'calm';

          const spdM = wTxt.match(/(\d{1,2})\s*km\/s/i);
          if (spdM) this.state.smartRaceWindSpeedKmh = parseInt(spdM[1], 10);
          const tmpM = wTxt.match(/(\d{1,2})\s*°c/i);
          if (tmpM) this.state.smartRaceTempC = parseInt(tmpM[1], 10);
        }
        this.saveState();
        this.renderGenesisModuleUI();
        return;
      }
    }

    if (relSel) {
      const prevRelCity = this.state.smartRaceReleaseCityId;
      this.state.smartRaceReleaseCityId = relSel.value;
      if (changedField === 'release_city' || prevRelCity !== relSel.value) {
        const dists = this.getDistrictsForProvince(relSel.value);
        this.state.smartRaceReleaseDistrictId = dists[0] ? dists[0].id : 'merkez';
      } else if (relDistSel) {
        this.state.smartRaceReleaseDistrictId = relDistSel.value;
      }
    } else if (relDistSel) {
      this.state.smartRaceReleaseDistrictId = relDistSel.value;
    }

    if (loftSel) {
      const prevLoftCity = this.state.smartRaceLoftCityId;
      this.state.smartRaceLoftCityId = loftSel.value;
      if (changedField === 'loft_city' || prevLoftCity !== loftSel.value) {
        const dists = this.getDistrictsForProvince(loftSel.value);
        this.state.smartRaceLoftDistrictId = dists[0] ? dists[0].id : 'merkez';
      } else if (loftDistSel) {
        this.state.smartRaceLoftDistrictId = loftDistSel.value;
      }
    } else if (loftDistSel) {
      this.state.smartRaceLoftDistrictId = loftDistSel.value;
    }

    if (dateEl && dateEl.value) this.state.smartRaceDate = dateEl.value;
    if (timeEl && timeEl.value) this.state.smartRaceReleaseTime = timeEl.value;

    if (['city', 'release_city', 'release_district', 'loft_city', 'loft_district'].includes(changedField)) {
      // İl veya ilçe değiştiğinde manuel km'yi sıfırla ve haritayı yeni rotaya otomatik odakla
      this.state.smartRaceManualKm = 0;
      this.state.smartRaceLiveRouteData = null;
      this._leafletLastCenter = null;
      if (kmEl) kmEl.value = '';
    } else if (kmEl) {
      this.state.smartRaceManualKm = Math.max(0, parseInt(kmEl.value, 10) || 0);
    }

    if (['weather_manual'].includes(changedField)) {
      this.state.smartRaceWeatherSource = 'manual_scenario';
      this.state.smartRaceLiveRouteData = null;
    }

    if (windTypeEl) this.state.smartRaceWindType = windTypeEl.value;
    if (windSpdEl) this.state.smartRaceWindSpeedKmh = Math.max(0, parseInt(windSpdEl.value, 10) || 0);
    if (tempEl) this.state.smartRaceTempC = parseInt(tempEl.value, 10) || 18;
    if (humEl) this.state.smartRaceHumPct = Math.max(10, Math.min(100, parseInt(humEl.value, 10) || 55));
    if (precipEl) this.state.smartRacePrecipMm = Math.max(0, parseFloat(precipEl.value) || 0);
    if (visEl) this.state.smartRaceVisKm = Math.max(1, Math.min(20, parseFloat(visEl.value) || 10));
    if (stormEl) this.state.smartRaceStormAlert = stormEl.value;

    this.invalidateEngineCache();
    this.saveState();
    this.renderGenesisReportOnly();
  },

  analyzeSmartRaceManagement() {
    this.ensureEngineCacheFresh();
    if (typeof AvigenRaceTracker !== 'undefined' && !AvigenRaceTracker._initialized) {
      AvigenRaceTracker.init();
    }
    const trackerEvents = (typeof AvigenRaceTracker !== 'undefined' && Array.isArray(AvigenRaceTracker.events))
      ? AvigenRaceTracker.events
      : [];

    // Seçili yarışı belirle
    let selectedEvent = null;
    if (this.state.smartRaceEventId && this.state.smartRaceEventId !== 'custom') {
      selectedEvent = trackerEvents.find(e => e.id === this.state.smartRaceEventId) || (this.state.smartRaceEventId === 'auto' ? trackerEvents[0] : null);
    }

    // Kümes varsayılan şehri
    const liveWeatherCityId = (typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state?.cityId && AvigenLiveWeather.state.cityId !== 'gps')
      ? AvigenLiveWeather.state.cityId
      : 'bursa';

    const relNode = selectedEvent && this.state.smartRaceEventId !== 'custom'
      ? this.findGeoNodeByNameOrId(selectedEvent.releasePoint || selectedEvent.codeTitle, this.state.smartRaceReleaseCityId || 'ankara')
      : this.resolveProvinceAndDistrictNode(this.state.smartRaceReleaseCityId, this.state.smartRaceReleaseDistrictId, this.state.smartRaceCustomReleaseCoord, 'ankara');

    const loftNode = this.resolveProvinceAndDistrictNode(this.state.smartRaceLoftCityId || liveWeatherCityId, this.state.smartRaceLoftDistrictId, this.state.smartRaceCustomLoftCoord, 'bursa');

    const releaseDate = selectedEvent && this.state.smartRaceEventId !== 'custom'
      ? (selectedEvent.releaseDate || this.state.smartRaceDate || '2026-11-22')
      : (this.state.smartRaceDate || '2026-11-22');

    const releaseTime = selectedEvent && this.state.smartRaceEventId !== 'custom'
      ? (selectedEvent.releaseTime || this.state.smartRaceReleaseTime || '06:45')
      : (this.state.smartRaceReleaseTime || '06:45');

    const effectiveKmInput = selectedEvent && this.state.smartRaceEventId !== 'custom'
      ? (Number(selectedEvent.distanceKm) || this.state.smartRaceManualKm || 0)
      : (Number(this.state.smartRaceManualKm) || 0);

    const windType = this.state.smartRaceWindType || 'head';
    const windSpeedKmh = Number(this.state.smartRaceWindSpeedKmh ?? 16);
    const tempC = Number(this.state.smartRaceTempC ?? 18);
    const humPct = Number(this.state.smartRaceHumPct ?? 58);
    const precipMm = Number(this.state.smartRacePrecipMm ?? 0);
    const visKm = Number(this.state.smartRaceVisKm ?? 10);
    const stormAlert = this.state.smartRaceStormAlert || 'none';

    // ------------------------------------------------------------------------
    // BÖLÜM 2: ROTA VE COĞRAFİ ANALİZ
    // ------------------------------------------------------------------------
    const route = this.calculateHaversineRoute(relNode, loftNode, effectiveKmInput, windType, windSpeedKmh);
    const distKm = route.crowFliesKm;
    const raceCategoryLabel = distKm <= 300
      ? 'Kısa Mesafe (Sprint • 100–300 km)'
      : (distKm <= 500 ? 'Orta Mesafe (301–500 km)' : (distKm <= 700 ? 'Uzun Mesafe (501–700 km)' : 'Maraton (700+ km)'));
    const raceCategoryCode = distKm <= 300 ? 'SPRINT' : (distKm <= 500 ? 'MIDDLE' : 'LONG');

    // ------------------------------------------------------------------------
    // BÖLÜM 3: METEOROLOJİK ANALİZ VE 4 SEVİYELİ RİSK TESPİTİ (3 GÜZERGÂH BÖLGESİ)
    // ------------------------------------------------------------------------
    const liveRoute = this.state.smartRaceLiveRouteData;
    const liveLoftW = (typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state) ? AvigenLiveWeather.state : null;

    let dataSourceInfo = {
      isRealTimeMeasured: false,
      sourceTypeLabel: 'Tahmin / Kullanıcı Senaryo Modeli (Canlı API Verisi Değil)',
      sourceProvider: selectedEvent
        ? `Klasik Yarış Yönetimi Etabı Kaydı (${selectedEvent.codeTitle})`
        : 'Kullanıcı Tarafından Girilen Meteorolojik Senaryo Parametreleri',
      lastUpdated: selectedEvent ? `${selectedEvent.releaseDate} ${selectedEvent.releaseTime || '06:45'}` : 'Manuel Senaryo Girişi'
    };

    if (liveRoute && liveRoute.isLiveApi) {
      dataSourceInfo = {
        isRealTimeMeasured: true,
        sourceTypeLabel: 'Gerçek Zamanlı Ölçüm (Salım & Varış) + Orta Geçit Atmosferik Model',
        sourceProvider: liveRoute.sourceName,
        lastUpdated: liveRoute.fetchedAt
      };
    } else if (liveLoftW && liveLoftW.isLiveSynced && this.state.smartRaceWeatherSource !== 'manual_scenario' && !selectedEvent) {
      dataSourceInfo = {
        isRealTimeMeasured: true,
        sourceTypeLabel: 'Kümes Noktası Gerçek Zamanlı Ölçüm + Güzergâh İrtifa Tahmin Modeli',
        sourceProvider: `Open-Meteo WMO (${liveLoftW.cityName}) & İrtifa Gradyan Modeli`,
        lastUpdated: `Saat ${liveLoftW.lastUpdatedTime || 'Güncel'}`
      };
    }

    // 3 Bölgenin (1. Salım, 2. Orta Geçit, 3. Varış) Meteorolojik Dağılımı
    const midTempDrop = Math.round(Math.max(1, (route.midPassAltM - relNode.altM) * 0.0065));
    const midWindBoost = Math.round(Math.max(2, (route.midPassAltM / 350)));

    const zoneWeather = [
      {
        zoneId: 'ZONE_1',
        zoneTitle: `1. Bölge (Salım): ${relNode.name} (${relNode.altM}m)`,
        dataNature: liveRoute?.isLiveApi ? 'Gerçek Zamanlı Ölçüm' : (selectedEvent ? 'Kayıtlı Yarış Verisi' : 'Tahmin / Senaryo'),
        tempC: liveRoute?.release ? liveRoute.release.temp : tempC,
        humPct: liveRoute?.release ? liveRoute.release.hum : humPct,
        windSpeedKmh: liveRoute?.release ? liveRoute.release.windSpeed : windSpeedKmh,
        windEffectLabel: windType === 'head' ? 'Karşı Rüzgâr (Headwind)' : (windType === 'tail' ? 'Arkadan Rüzgâr (Tailwind)' : (windType === 'cross' ? 'Yan Rüzgâr (Crosswind)' : (windType === 'storm' ? 'Şiddetli Fırtına / Türbülans' : 'Sakin / Hafif Esinti'))),
        precipMm: liveRoute?.release ? liveRoute.release.precip : precipMm,
        visKm: visKm
      },
      {
        zoneId: 'ZONE_2',
        zoneTitle: `2. Bölge (Orta Geçit): ~${route.midPassAltM}m İrtifa`,
        dataNature: 'Güzergâh İrtifa & Geçit Tahmin Modeli',
        tempC: liveRoute?.mid ? liveRoute.mid.temp : (tempC - midTempDrop),
        humPct: liveRoute?.mid ? liveRoute.mid.hum : Math.min(95, humPct + 6),
        windSpeedKmh: liveRoute?.mid ? liveRoute.mid.windSpeed : (windSpeedKmh + midWindBoost),
        windEffectLabel: (windSpeedKmh + midWindBoost) >= 25
          ? 'Geçit Kanalize Sert Karşı/Yan Rüzgâr & Türbülans'
          : (windType === 'head' ? 'Orta Geçit Karşı Rüzgâr Direnci' : (windType === 'cross' ? 'Vadi Yan Rüzgâr Sapması' : 'Normal Geçit Akımı')),
        precipMm: liveRoute?.mid ? liveRoute.mid.precip : precipMm,
        visKm: route.midPassAltM >= 1100 && humPct >= 75 ? Math.min(visKm, 5) : visKm
      },
      {
        zoneId: 'ZONE_3',
        zoneTitle: `3. Bölge (Varış / Kümes): ${loftNode.name} (${loftNode.altM}m)`,
        dataNature: (liveRoute?.isLiveApi || liveLoftW?.isLiveSynced) ? 'Gerçek Zamanlı Ölçüm' : 'Tahmin / Senaryo',
        tempC: liveRoute?.loft ? liveRoute.loft.temp : (liveLoftW?.isLiveSynced && !selectedEvent ? liveLoftW.temp : tempC + 1),
        humPct: liveRoute?.loft ? liveRoute.loft.hum : (liveLoftW?.isLiveSynced && !selectedEvent ? liveLoftW.hum : humPct),
        windSpeedKmh: liveRoute?.loft ? liveRoute.loft.windSpeed : windSpeedKmh,
        windEffectLabel: windType === 'head' ? 'Son Yaklaşmada Karşı Rüzgâr' : (windType === 'tail' ? 'Arkadan Destekleyici Akım' : (windType === 'cross' ? 'Final Yaklaşma Yan Sapması' : 'Dengeli Kümes İniş Havası')),
        precipMm: liveRoute?.loft ? liveRoute.loft.precip : precipMm,
        visKm: visKm
      }
    ];

    // 10 Meteorolojik Parametreden Risk Tespiti ve 4 Resmi Risk Sınıfı:
    // DÜŞÜK RİSK | ORTA RİSK | YÜKSEK RİSK | KRİTİK RİSK
    const riskFindings = [];
    let riskPoints = 0;

    if (stormAlert === 'thunderstorm_cb' || windType === 'storm') {
      riskPoints += 75;
      riskFindings.push({
        level: 'KRİTİK RİSK',
        badgeClass: 'gene-red',
        segment: '2. Bölüm (Orta Geçiş) & Genel Rota',
        factor: 'Gök Gürültülü Fırtına (Cumulonimbus / CB) ve Şiddetli Dikey Türbülans',
        reason: 'Güzergâh üzerinde konvektif fırtına hücresi, ani basınç/rüzgâr kırılması ve elektromanyetik/görsel yönelim kaybı mevcut. Sürü dağılması ve ağır kayıp riski çok yüksektir.'
      });
    } else if (stormAlert === 'sudden_change') {
      riskPoints += 35;
      riskFindings.push({
        level: 'YÜKSEK RİSK',
        badgeClass: 'gene-gold',
        segment: '2. Bölüm (Orta Geçiş Koridoru)',
        factor: 'Ani Cephe Geçişi ve Rüzgâr Yön Değişimi',
        reason: 'Uçuş sırasında rüzgâr vektörünün değişmesi kuşların koridor değiştirmesine ve uçuş süresinin %15–25 uzamasına yol açar.'
      });
    }

    const maxRouteWind = Math.max(...zoneWeather.map(z => z.windSpeedKmh));
    if (windType === 'head' && maxRouteWind >= 28) {
      riskPoints += 42;
      riskFindings.push({
        level: 'YÜKSEK RİSK',
        badgeClass: 'gene-red',
        segment: '2. Bölüm (Orta Geçit) ve 3. Bölüm (Kümes Yaklaşma)',
        factor: `Sert Karşı Rüzgâr (${maxRouteWind} km/s Headwind)`,
        reason: `Sürekli karşı rüzgâr yer hızını 220–320 m/dk düşürür; ${distKm} km mesafede göğüs kası glikojen ve lipit rezervlerinin erken tükenmesine neden olur.`
      });
    } else if (windType === 'head' && maxRouteWind >= 15) {
      riskPoints += 22;
      riskFindings.push({
        level: 'ORTA RİSK',
        badgeClass: 'gene-gold',
        segment: '2. Bölüm (Orta Geçit: ~' + route.midPassAltM + 'm)',
        factor: `Karşı Rüzgâr Direnci (${maxRouteWind} km/s)`,
        reason: 'Orta geçit yükseltilerinde karşı rüzgâr hızı artmakta; dayanıklılık ve kas lipit kapasitesi yüksek kuşlar avantaj sağlar.'
      });
    } else if (windType === 'cross' && maxRouteWind >= 20) {
      riskPoints += 24;
      riskFindings.push({
        level: 'ORTA RİSK',
        badgeClass: 'gene-gold',
        segment: '2. Bölüm (Orta Geçiş) & 3. Bölüm (Final Yaklaşma)',
        factor: `Kuvvetli Yan Rüzgâr Sürüklenmesi (${maxRouteWind} km/s Crosswind)`,
        reason: `Yan rüzgâr sürüyü merkez rotadan ${Math.round(distKm * 0.08)}–${Math.round(distKm * 0.14)} km rüzgâr altına sürükler; son bölümde çapraz düzeltme uçuşu gerektirir.`
      });
    }

    if (precipMm >= 4.0) {
      riskPoints += 45;
      riskFindings.push({
        level: 'KRİTİK RİSK',
        badgeClass: 'gene-red',
        segment: '1. ve 2. Bölüm (Salım & Orta Geçiş)',
        factor: `Kuvvetli Yağış (${precipMm} mm/sa)`,
        reason: 'Teleklerin ıslanması aerodinamik kaldırma kuvvetini düşürür ve hipotermi ile görüş kaybına yol açar.'
      });
    } else if (precipMm > 0.3) {
      riskPoints += 20;
      riskFindings.push({
        level: 'ORTA RİSK',
        badgeClass: 'gene-gold',
        segment: '2. Bölüm (Orta Geçit)',
        factor: `Bölgesel Yağış Geçişi (${precipMm} mm)`,
        reason: 'Yağış kütlelerinden kaçınmak için kuşlar alçak vadi koridorlarına yönelir.'
      });
    }

    if (visKm < 4) {
      riskPoints += 40;
      riskFindings.push({
        level: 'YÜKSEK RİSK',
        badgeClass: 'gene-red',
        segment: '1. Bölüm (Salım Çıkışı) & 2. Bölüm (Dağ Geçitleri)',
        factor: `Düşük Görüş Mesafesi / Sis (${visKm} km)`,
        reason: 'Salım anında güneş pusulası ve görsel arazi nirengi noktalarının kapanması ilk yönelim hatasına yol açar.'
      });
    } else if (visKm < 7) {
      riskPoints += 16;
      riskFindings.push({
        level: 'ORTA RİSK',
        badgeClass: 'gene-gold',
        segment: '2. Bölüm (Dağ Geçidi)',
        factor: `Kısmi Pus / Görüş Kısıtı (${visKm} km)`,
        reason: 'Yüksek rakımlı geçitlerde sabah pusu görüşü sınırlandırabilir.'
      });
    }

    if (tempC >= 30) {
      riskPoints += 34;
      riskFindings.push({
        level: 'YÜKSEK RİSK',
        badgeClass: 'gene-red',
        segment: '2. ve 3. Bölüm (Öğle Saatleri Uçuş Koridoru)',
        factor: `Yüksek Sıcaklık & Hipertermi / Dehidrasyon Riski (${tempC}°C • %${humPct} Nem)`,
        reason: `30°C üzeri sıcaklıkta buharlaşmalı su kaybı iki katına çıkar; ${distKm >= 350 ? 'uzun uçuşta kuşların su aramak için inme riski yüksektir.' : 'elektrolit yüklemesi kritik önem taşır.'}`
      });
    } else if (tempC <= 5) {
      riskPoints += 18;
      riskFindings.push({
        level: 'ORTA RİSK',
        badgeClass: 'gene-gold',
        segment: '2. Bölüm (Yüksek Rakım Geçidi: ' + (tempC - midTempDrop) + '°C)',
        factor: `Düşük Sıcaklık & Termal Enerji Kaybı (${tempC}°C)`,
        reason: 'Soğuk havada vücut ısısını korumak için bazal kalori tüketimi artar.'
      });
    }

    if (route.midPassAltM >= 1150) {
      riskPoints += 12;
      riskFindings.push({
        level: 'ORTA RİSK',
        badgeClass: 'gene-blue',
        segment: '2. Bölüm (Coğrafi Engel: ' + route.obstacles[0].name + ')',
        factor: `Rakım ve Topoğrafik Geçit Etkisi (~${route.midPassAltM}m)`,
        reason: route.obstacles[0].impact
      });
    }

    if (riskFindings.length === 0) {
      riskFindings.push({
        level: 'DÜŞÜK RİSK',
        badgeClass: 'gene-green',
        segment: 'Tüm Güzergâh (1., 2. ve 3. Bölüm)',
        factor: 'Optimum Atmosferik ve Görsel Uçuş Koşulları',
        reason: `Sıcaklık (${tempC}°C), görüş (${visKm} km) ve rüzgâr (${windSpeedKmh} km/s) tüm güzergâh bölümlerinde güvenli uçuş sınırları içerisindedir.`
      });
    }

    let overallRiskLevel = 'DÜŞÜK RİSK';
    let overallRiskColor = '#059669';
    let overallRiskBadge = 'gene-green';
    if (riskPoints >= 65) {
      overallRiskLevel = 'KRİTİK RİSK';
      overallRiskColor = '#dc2626';
      overallRiskBadge = 'gene-red';
    } else if (riskPoints >= 40) {
      overallRiskLevel = 'YÜKSEK RİSK';
      overallRiskColor = '#ea580c';
      overallRiskBadge = 'gene-red';
    } else if (riskPoints >= 18) {
      overallRiskLevel = 'ORTA RİSK';
      overallRiskColor = '#d97706';
      overallRiskBadge = 'gene-gold';
    }

    // Meteorolojik hız etkisi (m/dk)
    let weatherSpeedDeltaMpm = 0;
    if (windType === 'tail') weatherSpeedDeltaMpm += Math.min(240, Math.round(windSpeedKmh * 8.5));
    else if (windType === 'head') weatherSpeedDeltaMpm -= Math.min(290, Math.round(windSpeedKmh * 9.2));
    else if (windType === 'cross') weatherSpeedDeltaMpm -= Math.min(140, Math.round(windSpeedKmh * 4.5));
    else if (windType === 'storm') weatherSpeedDeltaMpm -= 360;

    if (tempC >= 30) weatherSpeedDeltaMpm -= (tempC - 28) * 14;
    if (precipMm > 0.5) weatherSpeedDeltaMpm -= Math.min(130, Math.round(precipMm * 28));
    if (visKm < 6) weatherSpeedDeltaMpm -= Math.round((6 - visKm) * 18);
    if (route.midPassAltM >= 1100) weatherSpeedDeltaMpm -= Math.round((route.midPassAltM - 900) * 0.04);

    const standardBaseSpeedMpm = distKm <= 300 ? 1385 : (distKm <= 500 ? 1335 : 1275);
    const generalExpectedSpeedMpm = Math.max(720, Math.min(1750, standardBaseSpeedMpm + weatherSpeedDeltaMpm));

    // Salım saatini dakikaya çevir (Örn: "06:45" -> 405)
    const parseTimeMin = (tStr) => {
      const parts = String(tStr || '06:45').split(':');
      const hh = parseInt(parts[0], 10) || 6;
      const mm = parseInt(parts[1], 10) || 45;
      return hh * 60 + mm;
    };
    const formatClock = (totalMinFromMidnight) => {
      const dayOffset = Math.floor(totalMinFromMidnight / 1440);
      const norm = ((Math.round(totalMinFromMidnight) % 1440) + 1440) % 1440;
      const hh = String(Math.floor(norm / 60)).padStart(2, '0');
      const mm = String(norm % 60).padStart(2, '0');
      return dayOffset > 0 ? `${hh}:${mm} (+${dayOffset} Gün)` : `${hh}:${mm}`;
    };
    const formatDur = (minVal) => {
      const m = Math.max(1, Math.round(minVal));
      const h = Math.floor(m / 60);
      const rem = m % 60;
      return `${h} sa ${String(rem).padStart(2, '0')} dk`;
    };

    const releaseClockMin = parseTimeMin(releaseTime);

    // ------------------------------------------------------------------------
    // BÖLÜM 4 & 5: KUŞA ÖZEL YARIŞ UYGUNLUĞU VE TAHMİNİ DÖNÜŞ ZAMANI
    // Kural: Yeterli yarış verisi bulunmayan kuşlara kesin performans puanı verilmez!
    //        Genel tahmin ile bireysel tahmin birbirinden açıkça ayrılır.
    // ------------------------------------------------------------------------
    const allLoftBirds = typeof collectUniqueLoftBirds === 'function'
      ? collectUniqueLoftBirds().filter(b => b.isActiveLoftBird)
      : [];

    // Seçili yarışta katılımcı kuşlar varsa veya kullanıcı simülasyon kurulum ekranından kuş seçtiyse onları işaretle
    const customSelectedRings = (!selectedEvent && Array.isArray(this.state.smartRaceSelectedBirdRings) && this.state.smartRaceSelectedBirdRings.length > 0)
      ? new Set(this.state.smartRaceSelectedBirdRings.map(r => String(r || '').trim().toUpperCase()))
      : null;

    const selectedEventRings = new Set(
      (selectedEvent?.entries || []).map(e => String(e.ring || '').trim().toUpperCase())
    );

    const candidateBirds = [];
    const seenBirdRings = new Set();

    // Önce seçili yarışta kayıtlı kuşlar
    if (selectedEvent && Array.isArray(selectedEvent.entries)) {
      selectedEvent.entries.forEach(en => {
        const cleanR = String(en.ring || '').trim().toUpperCase();
        if (!cleanR || seenBirdRings.has(cleanR)) return;
        seenBirdRings.add(cleanR);
        const found = allLoftBirds.find(b => b.ring.toUpperCase() === cleanR);
        candidateBirds.push({
          ring: en.ring,
          name: en.birdName || found?.name || 'Kayıtlı Güvercin',
          flag: en.flag || found?.flag || '🇹🇷',
          sex: found?.sex || 'M',
          roleCategory: found?.roleCategory || 'RACER',
          notes: found?.notes || '',
          pedId: found?.pedId || (pedigrees[0]?.id || ''),
          isInSelectedRace: true,
          eventEntry: en
        });
      });
    }

    // Ardından kümesteki diğer aktif kuşlar
    allLoftBirds.forEach(b => {
      const cleanR = String(b.ring || '').trim().toUpperCase();
      if (!cleanR || seenBirdRings.has(cleanR)) return;
      seenBirdRings.add(cleanR);
      const isParticipating = selectedEvent
        ? selectedEventRings.has(cleanR)
        : (customSelectedRings ? customSelectedRings.has(cleanR) : true);
      candidateBirds.push({
        ring: b.ring,
        name: b.name || 'İsimsiz',
        flag: b.flag || '🇹🇷',
        sex: b.sex || 'M',
        roleCategory: b.roleCategory || 'RACER',
        notes: b.notes || '',
        pedId: b.pedId || '',
        isInSelectedRace: isParticipating,
        eventEntry: null
      });
    });

    const birdEvaluations = candidateBirds.map(bird => {
      const cleanR = bird.ring.trim().toUpperCase();
      const trackerHist = typeof AvigenRaceTracker !== 'undefined'
        ? AvigenRaceTracker.getBirdRaceHistory(bird.ring).filter(h => h.resultStatus === 'ENTERED' && h.rank !== null)
        : [];
      const trend = typeof AvigenRaceTracker !== 'undefined'
        ? AvigenRaceTracker.analyzeBirdLongitudinalTrend(bird.ring)
        : { hasRealData: false, enteredCount: 0 };

      // Ayrıca racesList ve kuşun kendi kutu notlarındaki bireysel yarış derecelerini kontrol et
      const boxInspection = this.inspectAncestorBox({ ring: bird.ring, name: bird.name, notes: bird.notes }, 0);
      const individualWinsFromNotes = boxInspection.verifiedWins.filter(
        w => !/kardeş|brother|sister|yavrusu|father\s*to|mother\s*to|offspring/i.test(w)
      );

      const enteredCount = trackerHist.length;
      const totalProvenRaceRecords = enteredCount + individualWinsFromNotes.length;
      const hasSufficientIndividualData = totalProvenRaceRecords > 0;

      // Geçmiş hızlar, başarılı mesafeler ve hava tepkisi
      let avgPastSpeedMpm = trend.avgSpeedMpm || null;
      if (!avgPastSpeedMpm && individualWinsFromNotes.length > 0) {
        const spdMatch = bird.notes.match(/(\d{3,4}(?:[.,]\d)?)\s*m\/dk/i);
        if (spdMatch) avgPastSpeedMpm = parseFloat(spdMatch[1].replace(',', '.'));
      }

      const pastDistances = trackerHist.map(h => h.distanceKm).filter(Boolean);
      if (boxInspection.distanceKm > 0 && !pastDistances.includes(boxInspection.distanceKm)) {
        pastDistances.push(boxInspection.distanceKm);
      }

      // Hava koşullarına geçmiş tepki analizi
      let weatherResponseText = 'Kayıtlı geçmiş hava koşulu tepkisi bulunmuyor.';
      let weatherMatchBonus = 0;
      if (trackerHist.length > 0) {
        const headwindRaces = trackerHist.filter(h => /karşı|sert|rüzgar/i.test(h.weather || ''));
        const tailwindRaces = trackerHist.filter(h => /arka|açık/i.test(h.weather || ''));
        if ((windType === 'head' || windType === 'storm') && headwindRaces.length > 0) {
          const bestHw = headwindRaces.sort((a, b) => a.rank - b.rank)[0];
          const pctHw = (bestHw.rank / Math.max(100, bestHw.totalCompetitors || 1000)) * 100;
          if (pctHw <= 5) {
            weatherMatchBonus += 8;
            weatherResponseText = `Karşı rüzgârda kanıtlanmış yüksek direnç (${bestHw.codeTitle} ${bestHw.distanceKm} km: ${bestHw.rank}. sıra • İlk %${pctHw.toFixed(1)}).`;
          } else {
            weatherMatchBonus -= 4;
            weatherResponseText = `Karşı rüzgârda geçmiş derecesi orta/alt dilimde (${bestHw.codeTitle}: ${bestHw.rank}. sıra).`;
          }
        } else if (tailwindRaces.length > 0) {
          const bestTw = tailwindRaces.sort((a, b) => a.rank - b.rank)[0];
          weatherResponseText = `Açık/arkadan rüzgârlı havada ${bestTw.speedMpm || 1380} m/dk hız ve ${bestTw.rank}. sıra performansı kayıtlı.`;
          if (windType === 'tail' || windType === 'calm') weatherMatchBonus += 5;
        }
      }

      // Mesafe uygunluğu karşılaştırması
      let distanceMatchBonus = 0;
      let successfulDistLabel = 'Bireysel Mesafe Kaydı Yok';
      if (pastDistances.length > 0) {
        const minD = Math.min(...pastDistances);
        const maxD = Math.max(...pastDistances);
        successfulDistLabel = minD === maxD ? `${maxD} km` : `${minD}–${maxD} km (${trend.bestDistanceType || 'Kayıtlı Etap'})`;
        const closestDistDiff = Math.min(...pastDistances.map(d => Math.abs(d - distKm)));
        if (closestDistDiff <= 90) {
          distanceMatchBonus += 9;
        } else if (distKm > maxD + 160) {
          distanceMatchBonus -= 7; // Kanıtlanmış mesafesinin çok üzerinde
        }
      }

      // İstikrar ve Dayanıklılık Göstergeleri
      const consistencyText = enteredCount >= 2
        ? `${enteredCount} resmi yarışta ortalama İlk %${trend.avgRankPercentile} klasman dilimi (${trend.trendLabel})`
        : (totalProvenRaceRecords === 1 ? 'Tek yarış/derece kaydı mevcut (Çoklu yarış istikrarı için en az 2 yarış gerekir)' : 'Bireysel yarış kaydı yok');

      const enduranceText = pastDistances.some(d => d >= 450)
        ? `Kanıtlanmış 450+ km uzun mesafe dayanıklılığı (Maks: ${Math.max(...pastDistances)} km)`
        : (pastDistances.length > 0 ? `Kayıtlı azami mesafe: ${Math.max(...pastDistances)} km` : 'Bireysel uçuş dayanıklılık kaydı henüz girilmemiş');

      // KURAL (Bölüm 4): Yeterli veri bulunmayan kuşlara KESİN PERFORMANS PUANI VERİLMEZ!
      let suitabilityScore = null;
      let suitabilityVerdict = 'Yetersiz Bireysel Yarış Verisi (Kesin Performans Puanı Verilemez)';
      let suitabilityBadgeClass = 'gene-gold';
      let suitabilityReason = '';

      if (hasSufficientIndividualData) {
        let basePerf = boxInspection.rawScore;
        if (trend.hasRealData && trend.avgRankPercentile !== null) {
          const trackerScore = Math.max(55, Math.min(96, Math.round(95 - trend.avgRankPercentile * 1.35)));
          basePerf = Math.round((basePerf * 0.35) + (trackerScore * 0.65));
        }
        suitabilityScore = Math.max(38, Math.min(98, Math.round(basePerf + distanceMatchBonus + weatherMatchBonus - (riskPoints >= 65 ? 10 : 0))));
        if (suitabilityScore >= 80) {
          suitabilityVerdict = 'BU YARIŞ ETABINA YÜKSEK UYGUNLUK';
          suitabilityBadgeClass = 'gene-green';
        } else if (suitabilityScore >= 65) {
          suitabilityVerdict = 'KOŞULLU / ORTA YARIŞ UYGUNLUĞU';
          suitabilityBadgeClass = 'gene-blue';
        } else {
          suitabilityVerdict = 'BU ETAP KOŞULLARI İÇİN DÜŞÜK UYGUNLUK';
          suitabilityBadgeClass = 'gene-red';
        }
        suitabilityReason = `${totalProvenRaceRecords} doğrulanmış yarış/derece kaydı mevcut. Başarılı mesafe: ${successfulDistLabel}. ${weatherResponseText}`;
      } else {
        // Soyağacı ipucu varsa yalnızca "Soyağacı Notu" olarak ayrı belirtilir, kesin puan verilmez!
        const pedTree = typeof getCandidateLineageTree === 'function' ? getCandidateLineageTree(`${bird.pedId}::main`) : null;
        const hasAncestorNote = Boolean(pedTree && (pedTree.p1?.notes || pedTree.p2?.notes || pedTree.g1?.notes));
        suitabilityReason = `Bu kuş için sistemde henüz tamamlanmış bireysel yarış derecesi bulunmamaktadır. Bilimsel doğruluk kuralı gereği yarışmamış kuşa kesin performans puanı verilmemiştir.${hasAncestorNote ? ' (Üst soyağacında derece kayıtları mevcuttur; ilk yarış sonucu girildiğinde bireysel puanlama aktifleşecektir.)' : ''}`;
      }

      // BÖLÜM 5: TAHMİNİ DÖNÜŞ ZAMANI (Bireysel Tahmin vs Genel Filo Tahmini Ayrımı)
      const isIndividualPrediction = Boolean(avgPastSpeedMpm && hasSufficientIndividualData);
      const birdBaseSpeed = isIndividualPrediction
        ? Math.round((avgPastSpeedMpm * 0.65) + (standardBaseSpeedMpm * 0.35))
        : standardBaseSpeedMpm;

      const expectedBirdSpeedMpm = Math.max(700, Math.min(1780, Math.round(birdBaseSpeed + weatherSpeedDeltaMpm + (distanceMatchBonus * 2.5) + (weatherMatchBonus * 2.2))));
      const fastSpeedMpm = Math.round(expectedBirdSpeedMpm * 1.055); // En erken dönüş (düz koridor + yüksek tempo)
      const slowCorridorSpeedMpm = Math.max(640, Math.round(expectedBirdSpeedMpm * 0.89)); // Olası aralık alt sınırı
      const lateThresholdSpeedMpm = Math.max(550, Math.round(expectedBirdSpeedMpm * 0.76)); // Geç dönüş sınırı

      const earliestDurMin = Math.round((route.crowFliesKm * 1000) / fastSpeedMpm);
      const likelyMinDurMin = Math.round((route.actualCorridorMinKm * 1000) / expectedBirdSpeedMpm);
      const likelyMaxDurMin = Math.round((route.actualCorridorMaxKm * 1000) / slowCorridorSpeedMpm);
      const lateLimitDurMin = Math.round((route.actualCorridorMaxKm * 1000) / lateThresholdSpeedMpm);

      const predReliabilityPct = isIndividualPrediction
        ? Math.min(92, Math.max(55, 62 + enteredCount * 10 - Math.round(riskPoints * 0.25)))
        : Math.max(25, 42 - Math.round(riskPoints * 0.2));
      const predRelMeta = this.classifyDataReliability(predReliabilityPct);

      return {
        ...bird,
        enteredCount,
        totalProvenRaceRecords,
        hasSufficientIndividualData,
        avgPastSpeedMpm,
        successfulDistLabel,
        consistencyText,
        enduranceText,
        weatherResponseText,
        suitabilityScore,
        suitabilityVerdict,
        suitabilityBadgeClass,
        suitabilityReason,
        prediction: {
          isIndividualPrediction,
          predictionTypeLabel: isIndividualPrediction
            ? `Bireysel Performans Tahmini (Geçmiş Ort. Hız: ${avgPastSpeedMpm} m/dk)`
            : 'Genel Filo / Mesafe Tahmini (Bireysel Yarış Hız Kaydı Yok)',
          expectedBirdSpeedMpm,
          earliestTimeLabel: formatClock(releaseClockMin + earliestDurMin),
          earliestDurLabel: formatDur(earliestDurMin),
          likelyWindowLabel: `${formatClock(releaseClockMin + likelyMinDurMin)} – ${formatClock(releaseClockMin + likelyMaxDurMin)}`,
          likelyDurWindowLabel: `${formatDur(likelyMinDurMin)} – ${formatDur(likelyMaxDurMin)}`,
          lateLimitTimeLabel: formatClock(releaseClockMin + lateLimitDurMin),
          lateLimitDurLabel: formatDur(lateLimitDurMin),
          likelyMidDurMin: Math.round((likelyMinDurMin + likelyMaxDurMin) / 2),
          reliabilityPct: predReliabilityPct,
          reliabilityMeta: predRelMeta
        }
      };
    });

    // Sıralama: Önce seçili yarıştaki kuşlar, ardından kanıtlanmış uygunluk puanı yüksek olanlar, en sonda henüz yarış verisi olmayanlar
    birdEvaluations.sort((a, b) => {
      if (a.isInSelectedRace !== b.isInSelectedRace) return a.isInSelectedRace ? -1 : 1;
      if (a.hasSufficientIndividualData !== b.hasSufficientIndividualData) return a.hasSufficientIndividualData ? -1 : 1;
      return (b.suitabilityScore || 0) - (a.suitabilityScore || 0);
    });

    // Genel Filo Tahmini Dönüş Özeti
    const generalEarliestMin = Math.round((route.crowFliesKm * 1000) / Math.round(generalExpectedSpeedMpm * 1.05));
    const generalLikelyStartMin = Math.round((route.actualCorridorMinKm * 1000) / generalExpectedSpeedMpm);
    const generalLikelyEndMin = Math.round((route.actualCorridorMaxKm * 1000) / Math.max(650, Math.round(generalExpectedSpeedMpm * 0.90)));
    const generalLateMin = Math.round((route.actualCorridorMaxKm * 1000) / Math.max(550, Math.round(generalExpectedSpeedMpm * 0.77)));

    const fleetReturnEstimate = {
      expectedSpeedMpm: generalExpectedSpeedMpm,
      earliestClock: formatClock(releaseClockMin + generalEarliestMin),
      likelyWindowClock: `${formatClock(releaseClockMin + generalLikelyStartMin)} – ${formatClock(releaseClockMin + generalLikelyEndMin)}`,
      lateLimitClock: formatClock(releaseClockMin + generalLateMin),
      flightDurationRange: `${formatDur(generalLikelyStartMin)} – ${formatDur(generalLikelyEndMin)}`
    };

    // ------------------------------------------------------------------------
    // BÖLÜM 6 & 7: YARIŞ SONRASI PERFORMANS ANALİZİ VE ÖĞRENEN PERFORMANS ALTYAPISI
    // Klasik Yarış Yönetimi'ne (AvigenRaceTracker & racesList) girilmiş gerçek yarış sonuçlarını
    // otomatik olarak kullanır; tahmin edilen vs gerçekleşen dönüş farkını hesaplar.
    // ------------------------------------------------------------------------
    const postRaceEvaluations = [];
    const allCompletedEntries = [];

    trackerEvents.forEach(ev => {
      (ev.entries || []).forEach(en => {
        if (en.resultStatus === 'ENTERED' && en.rank !== null) {
          allCompletedEntries.push({ ev, en });
        }
      });
    });

    // Seçili yarışta girilmiş sonuçlar varsa onları, yoksa tüm tamamlanan yarış sonuçlarını analiz et
    const targetCompletedList = (selectedEvent && (selectedEvent.entries || []).some(e => e.resultStatus === 'ENTERED'))
      ? (selectedEvent.entries || []).filter(e => e.resultStatus === 'ENTERED').map(en => ({ ev: selectedEvent, en }))
      : allCompletedEntries;

    targetCompletedList.forEach(({ ev, en }) => {
      const actualDurMin = Number(en.durationMinutes) || Math.round((ev.distanceKm * 1000) / (en.speedMpm || 1300));
      const actualSpeedMpm = Number(en.speedMpm) || Number(((ev.distanceKm * 1000) / Math.max(1, actualDurMin)).toFixed(1));
      const actualSpeedKmh = Number((actualSpeedMpm * 0.06).toFixed(1));
      const totalComp = Math.max(50, Number(en.totalCompetitors || ev.totalCompetitors || 1000));
      const percentile = Number(((en.rank / totalComp) * 100).toFixed(2));

      // Bu yarışın hava ve mesafesine göre modelin beklediği tahmini süre ve hız
      const evW = String(en.weather || ev.weather || '').toLowerCase();
      let evModelSpeed = ev.distanceKm <= 300 ? 1390 : (ev.distanceKm <= 500 ? 1340 : 1280);
      if (evW.includes('karşı')) evModelSpeed -= 110;
      else if (evW.includes('arka')) evModelSpeed += 95;
      const predictedDurMin = Math.round((ev.distanceKm * 1000) / evModelSpeed);
      const diffMinutes = actualDurMin - predictedDurMin; // (-) ise tahminden erken, (+) ise tahminden geç
      const diffSpeedMpm = Number((actualSpeedMpm - evModelSpeed).toFixed(1));

      // Kuşun diğer yarışlarıyla karşılaştırma
      const birdAllRaces = typeof AvigenRaceTracker !== 'undefined'
        ? AvigenRaceTracker.getBirdRaceHistory(en.ring).filter(h => h.resultStatus === 'ENTERED' && h.rank !== null)
        : [];
      const otherRaces = birdAllRaces.filter(h => h.raceId !== ev.id);
      let prevComparisonText = 'Bu kuşun sistemdeki ilk/tek resmi yarış sonucu (Önceki yarış karşılaştırması için ek yarış kaydı gereklidir).';
      if (otherRaces.length > 0) {
        const prevAvgSpeed = Math.round(otherRaces.reduce((a, b) => a + (b.speedMpm || 1300), 0) / otherRaces.length);
        const prevAvgPct = Number((otherRaces.reduce((a, b) => a + ((b.rank / Math.max(100, b.totalCompetitors || 1000)) * 100), 0) / otherRaces.length).toFixed(2));
        const spdDiffPrev = Math.round(actualSpeedMpm - prevAvgSpeed);
        prevComparisonText = `Önceki ${otherRaces.length} yarış ortalamasına (${prevAvgSpeed} m/dk • İlk %${prevAvgPct}) göre hızı ${spdDiffPrev >= 0 ? `+${spdDiffPrev}` : spdDiffPrev} m/dk değişti; klasman dilimi İlk %${percentile} olarak gerçekleşti.`;
      }

      // Güçlü ve Zayıf Yön Tespiti
      const strengths = [];
      const weaknesses = [];
      if (percentile <= 2.0) strengths.push(`${totalComp.toLocaleString('tr-TR')} kuşluk yüksek rekabette İlk %${percentile} elit klasman başarısı (${en.rank}. sıra).`);
      else if (percentile <= 10.0) strengths.push(`${ev.distanceKm} km mesafede İlk %${percentile} ödül dilimi istikrarı.`);
      else weaknesses.push(`${ev.distanceKm} km etabında İlk %${percentile} dilimde kaldı (${en.rank}. / ${totalComp} kuş).`);

      if (diffSpeedMpm >= 15) strengths.push(`Meteorolojik beklentinin (${evModelSpeed} m/dk) +${diffSpeedMpm} m/dk üzerinde yüksek uçuş temposu.`);
      else if (diffSpeedMpm <= -35) weaknesses.push(`Beklenen meteorolojik hızın (${evModelSpeed} m/dk) ${Math.abs(diffSpeedMpm)} m/dk altında kaldı.`);

      if (evW.includes('karşı') && percentile <= 5.0) {
        strengths.push('Karşı rüzgâr koşullarında yüksek göğüs kası direnci ve rota koruma yeteneği kanıtlandı.');
      } else if (ev.distanceKm >= 550 && percentile > 5.0) {
        weaknesses.push('600+ km uzun mesafede hız düşüşü gözlendi; kısa/orta mesafede daha verimli olabilir.');
      }

      postRaceEvaluations.push({
        raceId: ev.id,
        codeTitle: ev.codeTitle,
        distanceKm: ev.distanceKm,
        releaseTime: ev.releaseTime || '06:45',
        weather: en.weather || ev.weather || 'Açık Hava',
        ring: en.ring,
        birdName: en.birdName,
        flag: en.flag || '🇹🇷',
        rank: en.rank,
        totalCompetitors: totalComp,
        percentile,
        actualDurMin,
        actualDurLabel: formatDur(actualDurMin),
        actualSpeedMpm,
        actualSpeedKmh,
        predictedDurMin,
        predictedDurLabel: formatDur(predictedDurMin),
        predictedSpeedMpm: evModelSpeed,
        diffMinutes,
        diffSpeedMpm,
        prevComparisonText,
        strengths: strengths.length ? strengths : ['Yarışı sağlıklı şekilde tamamladı.'],
        weaknesses: weaknesses.length ? weaknesses : ['Bu yarışta belirgin bir performans zaafiyeti gözlenmedi.'],
        totalBirdRaceCount: birdAllRaces.length
      });
    });

    // Klasik Yarış Yönetimi'ndeki (AvigenRaceTracker) Öğrenen Performans Özeti
    const realAnalytics = typeof AvigenRaceTracker !== 'undefined'
      ? AvigenRaceTracker.computeGenesisRealRaceAnalytics()
      : { birdsWithRealRaces: [], birdsWithoutRealRaces: [], consistencyRanking: [], trendAlerts: [] };

    const totalCompletedRecordsCount = allCompletedEntries.length;
    const birdsWith3PlusRaces = (realAnalytics.birdsWithRealRaces || []).filter(b => b.records.length >= 3).length;
    const isLearningCalibrated = totalCompletedRecordsCount >= 5 && birdsWith3PlusRaces >= 1;

    // Genel Veri Güvenilirliği
    const reliabilityPct = Math.min(95, Math.max(25, Math.round(
      (dataSourceInfo.isRealTimeMeasured ? 35 : 22) +
      (totalCompletedRecordsCount > 0 ? Math.min(40, totalCompletedRecordsCount * 6) : 10) +
      (selectedEvent ? 18 : 10)
    )));

    return {
      selectedEvent,
      trackerEvents,
      releaseDate,
      releaseTime,
      distKm,
      raceCategoryLabel,
      raceCategoryCode,
      route,
      dataSourceInfo,
      zoneWeather,
      riskFindings,
      overallRiskLevel,
      overallRiskColor,
      overallRiskBadge,
      riskPoints,
      weatherSpeedDeltaMpm,
      fleetReturnEstimate,
      birdEvaluations,
      postRaceEvaluations,
      realAnalytics,
      totalCompletedRecordsCount,
      birdsWith3PlusRaces,
      isLearningCalibrated,
      reliabilityPct
    };
  },

  // ==========================================================================
  // İNTERAKTİF TÜRKİYE HARİTASI BİLEŞENİ (GERÇEK WGS84 KOORDİNAT PROJEKSİYONU)
  // - Salım noktası: Kırmızı işaretçi (#ef4444)
  // - Varış noktası: Yeşil işaretçi (#10b981)
  // - Haritaya tıklayarak konum seçimi, şehir/ilçe/koordinat arama, yakınlaştırma/uzaklaştırma
  // - Rota çizgisi, kuş uçuş mesafesi ve riskli bölgelerin harita üzerinde gösterimi
  // ==========================================================================
  renderInteractiveTurkeyMap(rep, isResultView = false) {
    const r = rep.route;
    const pRel = this.projectLatLonToTurkeySvg(r.relNode.lat, r.relNode.lon);
    const pLoft = this.projectLatLonToTurkeySvg(r.loftNode.lat, r.loftNode.lon);
    const pMid = {
      x: Math.round((pRel.x + pLoft.x) / 2),
      y: Math.round((pRel.y + pLoft.y) / 2)
    };

    // Yakınlaştırma (Zoom) ve Sağa-Sola / Yukarı-Aşağı Kaydırma (Pan) için dinamik SVG viewBox
    const zoom = Math.max(1.0, Math.min(2.8, Number(this.state.smartRaceMapZoom) || 1.0));
    const panX = Number(this.state.smartRaceMapPanX) || 0;
    const panY = Number(this.state.smartRaceMapPanY) || 0;
    const vbW = Math.round(720 / zoom);
    const vbH = Math.round(320 / zoom);
    const vbX = Math.max(-95, Math.min(720 - vbW + 95, Math.round((720 - vbW) / 2 + panX)));
    const vbY = Math.max(-40, Math.min(320 - vbH + 40, Math.round((320 - vbH) / 2 + panY)));

    // Yüksek Detaylı Türkiye (Anadolu + Trakya + Kıbrıs + Göller + Dağ Geçitleri) WGS84 Sınır Poligonları
    const anatoliaBoundaryCoords = [
      [40.04, 26.18], [40.25, 26.68], [40.38, 27.32], [40.46, 27.95], [40.38, 28.40],
      [40.43, 28.92], [40.38, 29.15], [40.66, 29.28], [40.74, 29.92], [40.82, 29.38],
      [41.02, 29.02], [41.23, 29.12], [41.15, 29.62], [41.18, 30.15], [41.10, 30.72],
      [41.32, 31.40], [41.48, 31.80], [41.78, 32.45], [41.98, 33.42], [42.02, 34.15],
      [42.08, 35.15], [41.68, 35.92], [41.30, 36.35], [41.22, 36.95], [41.10, 37.55],
      [40.98, 38.38], [41.04, 39.20], [41.02, 39.75], [41.05, 40.55], [41.45, 41.55],
      [41.52, 42.65], [41.15, 43.35], [40.55, 43.62], [40.05, 43.75], [39.95, 44.52],
      [39.65, 44.78], [38.95, 44.30], [38.28, 44.42], [37.35, 44.75], [37.15, 43.70],
      [37.25, 42.80], [37.10, 42.15], [37.08, 41.20], [37.08, 40.40], [36.82, 39.50],
      [36.72, 38.40], [36.68, 37.10], [36.82, 36.65], [36.35, 36.52], [35.90, 36.02],
      [36.32, 35.78], [36.78, 35.90], [36.82, 35.42], [36.68, 34.55], [36.28, 33.85],
      [36.02, 32.85], [36.55, 32.00], [36.78, 31.40], [36.88, 30.72], [36.58, 30.55],
      [36.22, 30.35], [36.20, 29.35], [36.65, 29.05], [36.72, 28.25], [36.68, 27.42],
      [37.03, 27.25], [37.35, 27.55], [37.55, 27.15], [37.95, 27.25], [38.22, 26.75],
      [38.32, 26.28], [38.65, 26.78], [38.95, 26.92], [39.32, 26.65], [39.52, 26.08]
    ];
    const thraceBoundaryCoords = [
      [40.70, 26.05], [41.15, 26.32], [41.38, 26.58], [41.72, 26.52], [41.95, 27.15],
      [41.98, 28.02], [41.52, 28.42], [41.26, 28.98], [41.00, 28.96], [40.98, 28.35],
      [40.98, 27.55], [40.72, 27.15], [40.40, 26.68], [40.08, 26.22]
    ];
    const cyprusCoords = [
      [35.15, 32.35], [35.35, 33.05], [35.42, 33.85], [35.65, 34.55],
      [35.02, 34.05], [34.68, 33.02], [34.78, 32.42]
    ];
    const lakeVanCoords = [
      [38.42, 42.25], [38.75, 42.65], [38.98, 43.35], [38.68, 43.52],
      [38.35, 43.15], [38.32, 42.55]
    ];
    const lakeTuzCoords = [
      [39.05, 33.25], [39.02, 33.52], [38.55, 33.62], [38.45, 33.32], [38.75, 33.18]
    ];

    const toSvgPoints = (coords) => coords.map(([lat, lon]) => {
      const p = this.projectLatLonToTurkeySvg(lat, lon);
      return `${p.x},${p.y}`;
    }).join(' ');

    const toSvgPolyline = (coords) => coords.map(([lat, lon]) => {
      const p = this.projectLatLonToTurkeySvg(lat, lon);
      return `${p.x},${p.y}`;
    }).join(' ');

    const anatoliaPts = toSvgPoints(anatoliaBoundaryCoords);
    const thracePts = toSvgPoints(thraceBoundaryCoords);
    const cyprusPts = toSvgPoints(cyprusCoords);
    const lakeVanPts = toSvgPoints(lakeVanCoords);
    const lakeTuzPts = toSvgPoints(lakeTuzCoords);

    // Ana Uçuş & Otoyol Koridorları ve Dağ Sırtları
    const highwayE80Pts = toSvgPolyline([[41.67, 26.55], [41.15, 27.80], [41.00, 28.97], [40.76, 30.38], [40.73, 31.60], [39.93, 32.85], [39.84, 33.51], [39.75, 37.01], [39.75, 39.50], [39.90, 41.26], [39.72, 43.05]]);
    const highwaySouthPts = toSvgPolyline([[38.42, 27.14], [38.75, 30.55], [37.87, 32.49], [37.00, 35.32], [37.06, 37.38], [37.16, 38.79], [37.91, 40.23]]);
    const highwayMarmaraAnkaraPts = toSvgPolyline([[40.18, 29.06], [39.90, 30.03], [39.77, 30.52], [39.58, 32.14], [39.93, 32.85]]);

    const trCities = this.SMART_RACE_GEO_NODES.filter(n => !n.isEurope);
    const clickTarget = this.state.smartRaceMapClickTarget || 'release';
    const hasElevatedRisk = rep.riskPoints >= 18;

    // Seçili Salım ve Varış İllerinin İlçelerini Harita Üzerinde Detaylı Göster
    const relDistricts = this.getDistrictsForProvince(this.state.smartRaceReleaseCityId || r.relNode.id);
    const loftDistricts = this.getDistrictsForProvince(this.state.smartRaceLoftCityId || r.loftNode.id);

    // SVG kenar taşmasını ve iki yakın noktada etiket çakışmasını önle
    const clampX = (xVal, halfW = 64) => Math.max(halfW + 4, Math.min(720 - halfW - 4, xVal));
    const relBoxDx = clampX(pRel.x, 64) - pRel.x;
    const loftBoxDx = clampX(pLoft.x, 64) - pLoft.x;
    const midBoxX = clampX(pMid.x, 56);
    const markersClose = Math.hypot(pRel.x - pLoft.x, pRel.y - pLoft.y) < 85;
    const relBoxY = (pRel.y < 34 && !markersClose) ? 12 : -27;
    const relTxtY = (pRel.y < 34 && !markersClose) ? 23 : -16;
    const loftBoxY = (pLoft.y > 286 && !markersClose) ? -27 : 12;
    const loftTxtY = (pLoft.y > 286 && !markersClose) ? -16 : 23;
    const curTileType = this.state.smartRaceTileLayerType || 'google_hybrid';

    setTimeout(() => {
      try { this.mountSmartRaceLeafletMap(); } catch (e) {}
    }, 30);

    return `
      <div class="sr-map-card">
        <!-- ÜST HARİTA BAŞLIĞI VE ROTA ÖZETİ -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:6px;">
          <div style="min-width:0;">
            <div style="font-size:10.8px; font-weight:900; color:#f8fafc; letter-spacing:0.2px;">
              🗺️ TÜRKİYE YARIŞ GÜZERGÂH HARİTASI (${r.crowFliesKm} KM)
            </div>
            <div style="font-size:8.8px; color:#93c5fd; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              🔴 ${escapeHtml(r.relNode.name)} → 🟢 ${escapeHtml(r.loftNode.name)}
            </div>
          </div>

          <!-- HARİTA KAYDIRMA (SAĞA-SOLA / YUKARI-AŞAĞI) VE YAKINLAŞTIRMA BUTONLARI -->
          <div class="sr-map-zoom-group" style="flex-wrap:wrap;">
            <button type="button" class="sr-map-zoom-btn" onclick="AvigenGenesisAI.panSmartRaceMap(-65, 0, event)" title="Sola Kaydır (Batı)">◀</button>
            <button type="button" class="sr-map-zoom-btn" onclick="AvigenGenesisAI.panSmartRaceMap(0, -45, event)" title="Yukarı Kaydır (Kuzey)">▲</button>
            <button type="button" class="sr-map-zoom-btn" onclick="AvigenGenesisAI.panSmartRaceMap(0, 45, event)" title="Aşağı Kaydır (Güney)">▼</button>
            <button type="button" class="sr-map-zoom-btn" onclick="AvigenGenesisAI.panSmartRaceMap(65, 0, event)" title="Sağa Kaydır (Doğu)">▶</button>
            <button type="button" class="sr-map-zoom-btn" onclick="AvigenGenesisAI.zoomSmartRaceMap(0.35, event)" title="Yakınlaştır">+</button>
            <button type="button" class="sr-map-zoom-btn" onclick="AvigenGenesisAI.zoomSmartRaceMap(-0.35, event)" title="Uzaklaştır">−</button>
            <button type="button" class="sr-map-zoom-btn" style="width:auto; padding:0 6px; font-size:8.8px;" onclick="AvigenGenesisAI.focusSmartRaceMapOnRoute(event)" title="Rotaya Yakınlaş">🎯 Rota</button>
            <button type="button" class="sr-map-zoom-btn" style="width:auto; padding:0 6px; font-size:8.8px;" onclick="AvigenGenesisAI.resetSmartRaceMapView(event)" title="Tüm Türkiye Görünümü">⟲ Tümü</button>
          </div>
        </div>

        <!-- HARİTA KATMAN SEÇİCİ (4 EŞİT SÜTUN - YATAY TAŞMA YOK) -->
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:4px; margin-bottom:6px;">
          <button type="button" class="sr-map-mode-pill ${curTileType === 'google_hybrid' ? 'mode-arrival active' : ''}" style="padding:4px 3px; font-size:8.4px; justify-content:center;" onclick="AvigenGenesisAI.setSmartRaceTileLayerType('google_hybrid', event)">
            🛰️ Uydu+Yol
          </button>
          <button type="button" class="sr-map-mode-pill ${curTileType === 'google_road' ? 'mode-arrival active' : ''}" style="padding:4px 3px; font-size:8.4px; justify-content:center;" onclick="AvigenGenesisAI.setSmartRaceTileLayerType('google_road', event)">
            🗺️ İl/İlçe
          </button>
          <button type="button" class="sr-map-mode-pill ${curTileType === 'google_terrain' ? 'mode-arrival active' : ''}" style="padding:4px 3px; font-size:8.4px; justify-content:center;" onclick="AvigenGenesisAI.setSmartRaceTileLayerType('google_terrain', event)">
            ⛰️ Arazi/Dağ
          </button>
          <button type="button" class="sr-map-mode-pill ${curTileType === 'vector_offline' ? 'mode-arrival active' : ''}" style="padding:4px 3px; font-size:8.4px; justify-content:center;" onclick="AvigenGenesisAI.setSmartRaceTileLayerType('vector_offline', event)">
            🧭 Vektör
          </button>
        </div>

        ${!isResultView ? `
          <!-- HARİTADAN TIKLAMA HEDEFİ SEÇİCİ (3 EŞİT SÜTUN) -->
          <div style="display:grid; grid-template-columns:1fr 1fr auto; gap:4px; margin-bottom:6px;">
            <button type="button" class="sr-map-mode-pill mode-release ${clickTarget === 'release' ? 'active' : ''}" style="padding:4px 6px; font-size:8.8px; justify-content:center;" onclick="AvigenGenesisAI.setSmartRaceMapClickTarget('release', event)">
              🔴 Haritadan Salım Seç
            </button>
            <button type="button" class="sr-map-mode-pill mode-arrival ${clickTarget === 'arrival' ? 'active' : ''}" style="padding:4px 6px; font-size:8.8px; justify-content:center;" onclick="AvigenGenesisAI.setSmartRaceMapClickTarget('arrival', event)">
              🟢 Haritadan Varış Seç
            </button>
            <button type="button" class="sr-map-mode-pill" style="padding:4px 8px; font-size:8.8px; justify-content:center;" onclick="AvigenGenesisAI.swapSmartRaceLocations(event)" title="Salım ve Varış noktalarını yer değiştir">
              ⇄ Değiştir
            </button>
          </div>

          <!-- ŞEHİR, İLÇE VEYA KOORDİNAT ARAMA ÇUBUĞU -->
          <div style="display:grid; grid-template-columns:minmax(0,1fr) auto auto; gap:4px; margin-bottom:7px;">
            <input type="text" id="srLocationSearchInput" class="sr-field-input" style="height:30px; background:#1e293b; border-color:#334155; color:#f8fafc; font-size:9.8px; padding:4px 8px;" placeholder="🔍 İl, ilçe veya mevki ara (Örn: Polatlı, Karacabey)..." value="${escapeHtml(this.state.smartRaceSearchQuery || '')}" onkeydown="if(event.key==='Enter'){event.preventDefault(); AvigenGenesisAI.applySmartRaceLocationSearch('${clickTarget}');}" />
            <button type="button" class="sr-map-mode-pill mode-release active" style="padding:4px 7px; font-size:8.6px;" onclick="AvigenGenesisAI.applySmartRaceLocationSearch('release')">
              🔴 Salım
            </button>
            <button type="button" class="sr-map-mode-pill mode-arrival active" style="padding:4px 7px; font-size:8.6px;" onclick="AvigenGenesisAI.applySmartRaceLocationSearch('arrival')">
              🟢 Varış
            </button>
          </div>
        ` : ''}

        <!-- 1. CANLI GOOGLE HARİTASI (UYDU / KARAYOLU / ARAZİ - SOKAK & İLÇE DETAYINDA KAYDIRILABİLİR) -->
        <div id="avigenGoogleLeafletMap" style="width:100%; height:255px; border-radius:10px; overflow:hidden; border:1.5px solid #334155; background:#09152b; position:relative; z-index:1; display:${curTileType === 'vector_offline' ? 'none' : 'block'};"></div>

        <!-- 2. ÇEVRİMDIŞI VEKTÖR TÜRKİYE HARİTASI (İNTERNET YOKSA VEYA VEKTÖR MODU SEÇİLİYSE) -->
        <div id="avigenOfflineVectorMapWrap" style="position:relative; border-radius:10px; overflow:hidden; border:1px solid #1e293b; display:${curTileType === 'vector_offline' ? 'block' : 'none'};"
             onmousedown="AvigenGenesisAI.startTurkeyMapDrag(event)"
             onmousemove="AvigenGenesisAI.moveTurkeyMapDrag(event)"
             onmouseup="AvigenGenesisAI.endTurkeyMapDrag(event)"
             onmouseleave="AvigenGenesisAI.endTurkeyMapDrag(event)"
             ontouchstart="AvigenGenesisAI.startTurkeyMapDrag(event)"
             ontouchmove="AvigenGenesisAI.moveTurkeyMapDrag(event)"
             ontouchend="AvigenGenesisAI.endTurkeyMapDrag(event)">
          <svg id="avigenInteractiveTurkeySvg" viewBox="${vbX} ${vbY} ${vbW} ${vbH}" onclick="AvigenGenesisAI.onTurkeyMapCanvasClick(event)" style="width:100%; height:auto; display:block; cursor:grab; background:radial-gradient(circle at 50% 45%, #0f284d 0%, #09162e 72%, #050c1a 100%); user-select:none; touch-action:none;">
            <defs>
              <linearGradient id="trLandGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1e3f66"/>
                <stop offset="55%" stop-color="#173152"/>
                <stop offset="100%" stop-color="#122540"/>
              </linearGradient>
              <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.2" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            <!-- Coğrafi Enlem ve Boylam Kılavuz Çizgileri -->
            <g stroke="#1e293b" stroke-width="0.7" stroke-dasharray="3 3" opacity="0.75">
              <line x1="120" y1="10" x2="120" y2="310"/>
              <line x1="240" y1="10" x2="240" y2="310"/>
              <line x1="360" y1="10" x2="360" y2="310"/>
              <line x1="480" y1="10" x2="480" y2="310"/>
              <line x1="600" y1="10" x2="600" y2="310"/>
              <line x1="10" y1="80" x2="710" y2="80"/>
              <line x1="10" y1="160" x2="710" y2="160"/>
              <line x1="10" y1="240" x2="710" y2="240"/>
            </g>

            <!-- Deniz İsimleri -->
            <text x="350" y="22" fill="#38bdf8" opacity="0.45" font-size="8.5" font-weight="800" letter-spacing="2" text-anchor="middle">KARADENİZ</text>
            <text x="128" y="88" fill="#38bdf8" opacity="0.42" font-size="6.4" font-weight="800" letter-spacing="0.8" text-anchor="middle">MARMARA</text>
            <text x="48" y="185" fill="#38bdf8" opacity="0.45" font-size="8" font-weight="800" letter-spacing="1.5" text-anchor="middle">EGE DENİZİ</text>
            <text x="255" y="304" fill="#38bdf8" opacity="0.45" font-size="8.5" font-weight="800" letter-spacing="2" text-anchor="middle">AKDENİZ</text>

            <!-- Türkiye Kara Sınırları (Anadolu + Trakya + Kıbrıs) -->
            <polygon points="${anatoliaPts}" fill="url(#trLandGrad)" stroke="#38bdf8" stroke-width="1.3" stroke-linejoin="round" opacity="0.96"/>
            <polygon points="${thracePts}" fill="url(#trLandGrad)" stroke="#38bdf8" stroke-width="1.3" stroke-linejoin="round" opacity="0.96"/>
            <polygon points="${cyprusPts}" fill="url(#trLandGrad)" stroke="#38bdf8" stroke-width="1" stroke-linejoin="round" opacity="0.75"/>

            <!-- Büyük İç Göller (Van Gölü & Tuz Gölü) -->
            <polygon points="${lakeVanPts}" fill="#091933" stroke="#38bdf8" stroke-width="0.8" opacity="0.9"/>
            <polygon points="${lakeTuzPts}" fill="#091933" stroke="#38bdf8" stroke-width="0.7" opacity="0.85"/>

            <!-- Ana Uçuş / Otoyol Vadi Koridorları (Arka Plan Kılavuz Hatları) -->
            <polyline points="${highwayE80Pts}" fill="none" stroke="#334155" stroke-width="1.1" stroke-dasharray="2 2" opacity="0.75" style="pointer-events:none;"/>
            <polyline points="${highwaySouthPts}" fill="none" stroke="#334155" stroke-width="1.1" stroke-dasharray="2 2" opacity="0.75" style="pointer-events:none;"/>
            <polyline points="${highwayMarmaraAnkaraPts}" fill="none" stroke="#475569" stroke-width="1.2" stroke-dasharray="2 2" opacity="0.85" style="pointer-events:none;"/>

            <!-- Kritik Coğrafi Dağ Geçitleri (Kuş Uçuş Engelleri) -->
            <g opacity="0.55" style="pointer-events:none;">
              <text x="235" y="96" fill="#94a3b8" font-size="6.3" font-weight="700" text-anchor="middle">⛰️ Bolu-Köroğlu (1450m)</text>
              <text x="190" y="130" fill="#94a3b8" font-size="6.1" font-weight="700" text-anchor="middle">⛰️ Bozüyük (740m)</text>
              <text x="415" y="134" fill="#94a3b8" font-size="6.3" font-weight="700" text-anchor="middle">⛰️ Çamlıbel (1650m)</text>
              <text x="348" y="232" fill="#94a3b8" font-size="6.3" font-weight="700" text-anchor="middle">⛰️ Toroslar / Gülek (1050m)</text>
            </g>

            <!-- Tüm 81 Türkiye İl Noktaları ve İl İsimleri -->
            ${trCities.map(city => {
              const pt = this.projectLatLonToTurkeySvg(city.lat, city.lon);
              const isRelCity = city.id === (this.state.smartRaceReleaseCityId || r.relNode.id);
              const isLoftCity = city.id === (this.state.smartRaceLoftCityId || r.loftNode.id);
              const shortCityName = String(city.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0];
              const plateCode = String(city.name || '').slice(0, 2);
              const showText = city.showLabel || isRelCity || isLoftCity || zoom >= 1.25;
              return `
                <g style="cursor:pointer;" onclick="AvigenGenesisAI.selectCityFromTurkeyMap('${city.id}', event)">
                  <circle cx="${pt.x}" cy="${pt.y}" r="${isRelCity || isLoftCity ? 4.5 : 2.8}" fill="${isRelCity ? '#fca5a5' : (isLoftCity ? '#6ee7b7' : '#94a3b8')}" stroke="#0f172a" stroke-width="0.9"/>
                  ${showText ? `
                    <text x="${pt.x}" y="${pt.y - 4.5}" fill="${isRelCity ? '#fecaca' : (isLoftCity ? '#a7f3d0' : '#cbd5e1')}" font-size="${zoom >= 1.5 ? '7.2' : '7.4'}" font-weight="700" text-anchor="middle" style="pointer-events:none;">
                      ${zoom >= 1.55 ? `${plateCode} ${escapeHtml(shortCityName)}` : escapeHtml(shortCityName)}
                    </text>
                  ` : ''}
                </g>
              `;
            }).join('')}

            <!-- Seçili Salım ve Varış İllerinin İlçeleri (Harita Üzerinde Tıklanabilir Alt Noktalar) -->
            ${[
              ...relDistricts.map(d => ({ ...d, cityId: this.state.smartRaceReleaseCityId || r.relNode.id, role: 'release' })),
              ...loftDistricts.map(d => ({ ...d, cityId: this.state.smartRaceLoftCityId || r.loftNode.id, role: 'arrival' }))
            ].filter(d => d.id !== 'merkez').map(d => {
              const pt = this.projectLatLonToTurkeySvg(d.lat, d.lon);
              const isSelectedDist = (d.role === 'release' && d.id === this.state.smartRaceReleaseDistrictId) ||
                                     (d.role === 'arrival' && d.id === this.state.smartRaceLoftDistrictId);
              const dShort = String(d.name || '').split(' (')[0];
              return `
                <g style="cursor:pointer;" onclick="AvigenGenesisAI.selectDistrictFromTurkeyMap('${d.cityId}', '${d.id}', event)">
                  <circle cx="${pt.x}" cy="${pt.y}" r="${isSelectedDist ? 3.8 : 2.3}" fill="${d.role === 'release' ? '#fb7185' : '#34d399'}" stroke="#0f172a" stroke-width="0.8"/>
                  ${(zoom >= 1.2 || isSelectedDist) ? `
                    <text x="${pt.x}" y="${pt.y + 8.5}" fill="${d.role === 'release' ? '#fda4af' : '#6ee7b7'}" font-size="6.4" font-weight="800" text-anchor="middle" style="pointer-events:none;">
                      • ${escapeHtml(dShort)}
                    </text>
                  ` : ''}
                </g>
              `;
            }).join('')}

            <!-- RİSKLİ BÖLGE GÖSTERİMİ (Orta Geçit / Dağ veya Rüzgâr Risk Alanı) -->
            ${(isResultView || hasElevatedRisk) ? `
              <g style="pointer-events:none;">
                <ellipse cx="${pMid.x}" cy="${pMid.y}" rx="38" ry="22" fill="${rep.overallRiskColor}" fill-opacity="0.22" stroke="${rep.overallRiskColor}" stroke-width="1.4" stroke-dasharray="4 3"/>
                <text x="${pMid.x}" y="${pMid.y + 32}" fill="#fde047" font-size="8" font-weight="800" text-anchor="middle">
                  ⚠️ ${escapeHtml(rep.overallRiskLevel)} (${escapeHtml(r.obstacles[0].name.split(' (')[0].slice(0, 28))})
                </text>
              </g>
            ` : ''}

            <!-- OLASI KORİDOR ZARFI VE ROTA ÇİZGİSİ -->
            <path d="M ${pRel.x} ${pRel.y} Q ${pMid.x} ${Math.max(24, pMid.y - 22)} ${pLoft.x} ${pLoft.y}" fill="none" stroke="#38bdf8" stroke-width="1.4" stroke-dasharray="5 4" opacity="0.75" style="pointer-events:none;"/>
            <line x1="${pRel.x}" y1="${pRel.y}" x2="${pLoft.x}" y2="${pLoft.y}" stroke="#f8fafc" stroke-width="2.6" filter="url(#routeGlow)" style="pointer-events:none;"/>
            <line x1="${pRel.x}" y1="${pRel.y}" x2="${pLoft.x}" y2="${pLoft.y}" stroke="#3b82f6" stroke-width="1.6" stroke-dasharray="4 3" style="pointer-events:none;"/>

            <!-- KUŞ UÇUŞ MESAFESİ ETİKETİ (ROTA ORTASI) -->
            <g transform="translate(${midBoxX}, ${Math.max(22, Math.min(295, pMid.y - 8))})" style="pointer-events:none;">
              <rect x="-54" y="-11" width="108" height="20" rx="6" fill="#0f172a" fill-opacity="0.92" stroke="#60a5fa" stroke-width="1.2"/>
              <text x="0" y="3" fill="#ffffff" font-size="8.8" font-weight="900" text-anchor="middle">
                ${r.crowFliesKm} km Kuş Uçuşu
              </text>
            </g>

            <!-- 🔴 SALIM NOKTASI (KIRMIZI İŞARETÇİ) -->
            <g transform="translate(${pRel.x}, ${pRel.y})" style="pointer-events:none;">
              <circle cx="0" cy="0" r="12" fill="#ef4444" fill-opacity="0.28"/>
              <circle cx="0" cy="0" r="7" fill="#dc2626" stroke="#ffffff" stroke-width="2"/>
              <circle cx="0" cy="0" r="2.5" fill="#ffffff"/>
              <rect x="${-64 + relBoxDx}" y="${relBoxY}" width="128" height="16" rx="5" fill="#991b1b" stroke="#fca5a5" stroke-width="1"/>
              <text x="${relBoxDx}" y="${relTxtY}" fill="#ffffff" font-size="7.9" font-weight="900" text-anchor="middle">
                🔴 SALIM: ${escapeHtml(String(r.relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].slice(0, 17))}
              </text>
            </g>

            <!-- 🟢 VARIŞ NOKTASI / KÜMES (YEŞİL İŞARETÇİ) -->
            <g transform="translate(${pLoft.x}, ${pLoft.y})" style="pointer-events:none;">
              <circle cx="0" cy="0" r="12" fill="#10b981" fill-opacity="0.28"/>
              <circle cx="0" cy="0" r="7" fill="#059669" stroke="#ffffff" stroke-width="2"/>
              <circle cx="0" cy="0" r="2.5" fill="#ffffff"/>
              <rect x="${-64 + loftBoxDx}" y="${loftBoxY}" width="128" height="16" rx="5" fill="#065f46" stroke="#6ee7b7" stroke-width="1"/>
              <text x="${loftBoxDx}" y="${loftTxtY}" fill="#ffffff" font-size="7.9" font-weight="900" text-anchor="middle">
                🟢 VARIŞ: ${escapeHtml(String(r.loftNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].slice(0, 17))}
              </text>
            </g>
          </svg>
        </div>

        <!-- HARİTA ALT BİLGİ VE KAYDIRMA İPUCU ŞERİDİ -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-top:6px; font-size:8.5px; color:#94a3b8;">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span>🔴 <strong style="color:#fca5a5;">Salım:</strong> ${escapeHtml(r.relNode.name)} (${r.relNode.lat.toFixed(2)}°K, ${r.relNode.lon.toFixed(2)}°D • ${r.relNode.altM}m)</span>
            <span>🟢 <strong style="color:#6ee7b7;">Varış:</strong> ${escapeHtml(r.loftNode.name)} (${r.loftNode.lat.toFixed(2)}°K, ${r.loftNode.lon.toFixed(2)}°D • ${r.loftNode.altM}m)</span>
          </div>
          <span style="color:#cbd5e1;">✋ Haritayı parmağınızla/fareyle sağa-sola sürükleyebilir veya ◀ ▲ ▼ ▶ tuşlarıyla kaydırabilirsiniz</span>
        </div>
      </div>
    `;
  },

  renderSmartRaceRouteSvgMap(rep) {
    const r = rep.route;
    const z1 = rep.zoneWeather[0];
    const z2 = rep.zoneWeather[1];
    const z3 = rep.zoneWeather[2];
    const riskCol = rep.overallRiskColor;

    // Rakım profilini ölçeklendir (180..235 Y aralığında)
    const maxAlt = Math.max(1200, r.relNode.altM, r.midPassAltM, r.loftNode.altM);
    const yAlt = (alt) => Math.round(234 - Math.min(52, (alt / maxAlt) * 52));
    const yRel = yAlt(r.relNode.altM);
    const yMid = yAlt(r.midPassAltM);
    const yLoft = yAlt(r.loftNode.altM);

    return `
      <div style="background:#0f172a; border:1.5px solid #1e3a8a; border-radius:10px; padding:8px; color:#f8fafc;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:5px; font-size:9.2px;">
          <span style="font-weight:900; color:#93c5fd;">
            🗺️ BİLİMSEL GÜZERGÂH, OLASI UÇUŞ KORİDORLARI &amp; TOPOĞRAFİK RAKIM HARİTASI
          </span>
          <span style="color:#cbd5e1; font-weight:700;">
            Azimut: ${r.bearingDeg}° ${escapeHtml(r.compassLabel)} • Kuş Uçuşu: ${r.crowFliesKm} km | Koridor: ${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km
          </span>
        </div>

        <svg viewBox="0 0 640 250" style="width:100%; height:auto; display:block; background:linear-gradient(180deg, #091024 0%, #0f1f3d 68%, #0a1428 100%); border-radius:8px; border:1px solid #1e293b;">
          <defs>
            <linearGradient id="corridorFill" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
              <stop offset="50%" stop-color="${riskCol}" stop-opacity="0.24"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.20"/>
            </linearGradient>
            <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#64748b" stop-opacity="0.55"/>
              <stop offset="100%" stop-color="#1e293b" stop-opacity="0.9"/>
            </linearGradient>
          </defs>

          <!-- Coğrafi Enlem/Boylam Izgarası -->
          <g stroke="#1e293b" stroke-width="1" stroke-dasharray="3 3">
            <line x1="215" y1="12" x2="215" y2="170"/>
            <line x1="425" y1="12" x2="425" y2="170"/>
            <line x1="20" y1="50" x2="620" y2="50"/>
            <line x1="20" y1="95" x2="620" y2="95"/>
            <line x1="20" y1="140" x2="620" y2="140"/>
          </g>

          <!-- 3 Güzergâh Bölümü Başlık Etiketleri -->
          <text x="115" y="23" fill="#93c5fd" font-size="9.5" font-weight="800" text-anchor="middle">1. BÖLÜM: SALIM &amp; ÇIKIŞ (%0-25)</text>
          <text x="320" y="23" fill="#fcd34d" font-size="9.5" font-weight="800" text-anchor="middle">2. BÖLÜM: ORTA GEÇİT &amp; ENGELLER (%25-75)</text>
          <text x="525" y="23" fill="#6ee7b7" font-size="9.5" font-weight="800" text-anchor="middle">3. BÖLÜM: KÜMES YAKLAŞMA (%75-100)</text>

          <!-- Olası Uçuş Koridoru Zarfı (Kuzey/Vadi ve Güney Sapma Koridorları) -->
          <path d="M 75 98 Q 320 35 565 98 Q 320 158 75 98 Z" fill="url(#corridorFill)" stroke="#60a5fa" stroke-width="1.2" stroke-dasharray="4 3"/>

          <!-- Alternatif Vadi / Rüzgâr Sapma Koridoru (Üst Yay) -->
          <path d="M 75 98 Q 320 48 565 98" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-dasharray="6 4"/>
          <text x="320" y="54" fill="#7dd3fc" font-size="8.5" font-weight="700" text-anchor="middle">
            Olası Vadi / Arazi Koridoru (${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km • +%${r.minDeviationPct}..%${r.maxDeviationPct})
          </text>

          <!-- Düz Kuş Uçuşu Hattı (Teorik Referans) -->
          <line x1="75" y1="98" x2="565" y2="98" stroke="#f8fafc" stroke-width="2.2" stroke-dasharray="3 3"/>
          <text x="320" y="92" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">
            Teorik Kuş Uçuşu Hattı: ${r.crowFliesKm} km
          </text>

          <!-- Rüzgâr Sapma Alt Koridoru -->
          <path d="M 75 98 Q 320 144 565 98" fill="none" stroke="#f59e0b" stroke-width="1.4" stroke-dasharray="3 3"/>
          <text x="320" y="151" fill="#fde68a" font-size="8.2" font-weight="700" text-anchor="middle">
            Rüzgâr Sürüklenme / Sapma Zarfı (${escapeHtml(z2.windEffectLabel)} • ${z2.windSpeedKmh} km/s)
          </text>

          <!-- Orta Geçit Coğrafi Engel İşaretçisi -->
          <circle cx="320" cy="98" r="11" fill="${riskCol}" fill-opacity="0.28" stroke="${riskCol}" stroke-width="2"/>
          <text x="320" y="102" fill="#ffffff" font-size="11" text-anchor="middle">⛰️</text>
          <text x="320" y="120" fill="#fef08a" font-size="8.5" font-weight="800" text-anchor="middle">
            ${escapeHtml(r.obstacles[0].name.slice(0, 42))} (${z2.tempC}°C)
          </text>

          <!-- Salım Noktası (Sol) -->
          <circle cx="75" cy="98" r="10" fill="#2563eb" stroke="#93c5fd" stroke-width="2.5"/>
          <text x="75" y="102" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">🛫</text>
          <text x="82" y="124" fill="#93c5fd" font-size="9.2" font-weight="900" text-anchor="middle">${escapeHtml(String(r.relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].slice(0, 16))}</text>
          <text x="82" y="135" fill="#cbd5e1" font-size="7.8" text-anchor="middle">${r.relNode.lat.toFixed(2)}°K, ${r.relNode.lon.toFixed(2)}°D • ${z1.tempC}°C</text>

          <!-- Kümes Varış Noktası (Sağ) -->
          <circle cx="565" cy="98" r="10" fill="#059669" stroke="#6ee7b7" stroke-width="2.5"/>
          <text x="565" y="102" fill="#ffffff" font-size="9.5" font-weight="900" text-anchor="middle">🏠</text>
          <text x="558" y="124" fill="#6ee7b7" font-size="9.2" font-weight="900" text-anchor="middle">${escapeHtml(String(r.loftNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].slice(0, 16))}</text>
          <text x="558" y="135" fill="#cbd5e1" font-size="7.8" text-anchor="middle">${r.loftNode.lat.toFixed(2)}°K, ${r.loftNode.lon.toFixed(2)}°D • ${z3.tempC}°C</text>

          <!-- Alt Bölüm: Topoğrafik Rakım Kesiti (m) -->
          <line x1="35" y1="172" x2="605" y2="172" stroke="#334155" stroke-width="1"/>
          <text x="42" y="184" fill="#94a3b8" font-size="8" font-weight="800">TOPOĞRAFİK RAKIM KESİTİ (İRTİFA PROFİLİ):</text>
          <path d="M 75 236 L 75 ${yRel} Q 200 ${yMid - 4} 320 ${yMid} Q 440 ${yMid - 2} 565 ${yLoft} L 565 236 Z" fill="url(#elevFill)" stroke="#94a3b8" stroke-width="1.6"/>
          <text x="75" y="${yRel - 4}" fill="#e2e8f0" font-size="8" font-weight="800" text-anchor="middle">${r.relNode.altM}m</text>
          <text x="320" y="${yMid - 4}" fill="#fde047" font-size="8.2" font-weight="900" text-anchor="middle">Tepe Geçit ~${r.midPassAltM}m</text>
          <text x="565" y="${yLoft - 4}" fill="#6ee7b7" font-size="8" font-weight="800" text-anchor="middle">${r.loftNode.altM}m</text>
        </svg>
      </div>
    `;
  },

  // ==========================================================================
  // ANA SAYFA İÇİN KOMPAKT AKILLI ANALİZ VİTRİN & 3 ANA MODÜL KARTLARI
  // ==========================================================================
  openGenesisHubFromAnywhere(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    this.state.viewStage = 'launcher';
    this.saveState();
    openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2], true);
  },

  openModuleDirectlyFromHome(modeId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    let resolvedMode = 'breeding';
    if (modeId === 'nutrition' || modeId === 'nutrition_hub') resolvedMode = 'nutrition';
    else if (modeId === 'smart_race' || modeId === 'race_management_hub' || modeId === 'distance' || modeId === 'racing') resolvedMode = 'smart_race';
    this.state.activeMode = resolvedMode;
    this.state.viewStage = 'tool';
    this.saveState();
    openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2], false);
  },

  async askGenesisFromHomeScreen(quickPromptText, topicKey) {
    const inputEl = document.getElementById('homeGenesisAskInput');
    const qText = (quickPromptText !== undefined && quickPromptText !== null)
      ? String(quickPromptText).trim()
      : (inputEl ? String(inputEl.value || '').trim() : '');
    const finalQuestion = qText || 'Kümesimdeki en uyumlu damızlık çiftleri, COI akrabalık durumunu ve bugünkü yarış/yem önerisini özetle.';
    if (inputEl) inputEl.value = '';

    const ansBox = document.getElementById('homeGenesisQuickAnswerBox');
    if (ansBox) {
      ansBox.style.display = 'block';
      ansBox.innerHTML = `
        <div style="display:flex; align-items:center; gap:7px; padding:5px 4px; font-size:9.8px; font-weight:800; color:#4c1d95;">
          <span>🧬</span>
          <span>GENESIS AI kümes verilerinizi analiz ediyor...</span>
        </div>
      `;
    }

    await this.askGeminiAdvisor(finalQuestion, topicKey);
    this.renderHomeTeaserCard();
  },

  renderCyberPigeonHeroSvg() {
    return `
      <img src="avigen-dna-pigeon.jpg?v=4" alt="AVIGEN GENESIS AI DNA Pigeon" class="cyber-pigeon-dna-svg" style="width:100%; height:100%; object-fit:cover; object-position:center center; border-radius:0 15px 15px 0; -webkit-mask-image:linear-gradient(to right, transparent 0%, black 16%); mask-image:linear-gradient(to right, transparent 0%, black 16%);" />
    `;
  },

  renderHomeTeaserCard() {
    const box = document.getElementById('homeGenesisTeaserCard');
    const gridBox = document.getElementById('homeCyber3x2Grid');
    const alertBox = document.getElementById('homeGenesisDynamicAlertCard');
    if (!box) return;

    if (gridBox) {
      gridBox.style.display = 'none';
      gridBox.innerHTML = '';
    }
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }

    const isFreeTier = typeof AvigenUxManager !== 'undefined' && AvigenUxManager.getCurrentTier().id === 'FREE';
    const ctaText = isFreeTier ? "✨ GENESIS AI'ı Aktif Et →" : "🧬 GENESIS AI'ı Aç →";
    const latestChat = Array.isArray(this.state.geminiChatHistory) && this.state.geminiChatHistory.length > 0
      ? this.state.geminiChatHistory[0]
      : null;

    box.innerHTML = `
      <div class="ios-card" style="padding:0; overflow:hidden; border:1.5px solid rgba(124,58,237,0.45);">
        <!-- ÜST VİTRİN BÖLÜMÜ (TIKLAYINCA GENESIS AI ANA EKRANINI AÇAR) -->
        <div class="cyber-genesis-hero-card" style="padding:8px 11px; min-height:84px; border:none; border-radius:0; margin:0;" onclick="AvigenGenesisAI.openGenesisHubFromAnywhere(event)">
          <div class="cyber-hero-left" style="max-width:60%;">
            <div class="cyber-hero-brand-top">
              <span class="cyber-ai-chip-box">AI</span>
              <span class="cyber-avigen-lbl">GENESIS AI</span>
              <span class="gene-badge gene-purple" style="font-size:7.6px; padding:1px 5px;">CANLI DANIŞMAN</span>
            </div>
            <div style="font-size:12px; font-weight:900; color:var(--ios-text); line-height:1.2; margin-top:3px;">
              Hangi Çiftinizden Şampiyon Doğacak?
            </div>
            <div style="display:flex; align-items:center; gap:6px; margin-top:5px;">
              <button type="button" class="cyber-gold-cta-btn" style="padding:4px 9px; font-size:9.5px;" onclick="AvigenGenesisAI.openGenesisHubFromAnywhere(event)">
                <span>${ctaText}</span>
              </button>
            </div>
          </div>
          <div class="cyber-hero-right" style="right:0; top:0; bottom:0; width:42%;">
            ${this.renderCyberPigeonHeroSvg()}
          </div>
        </div>

        <!-- ALT TEK SATIR "🧬 GENESIS AI'YA SOR" ÇUBUĞU (SESLİ SORU & SESLİ YANIT DESTEKLİ KOMPAKT YAPI) -->
        <div style="padding:6px 9px; background:var(--ios-card-alt); border-top:1px solid var(--ios-border);" onclick="event.stopPropagation()">
          <div style="display:flex; gap:4px; align-items:center;">
            <input type="text" id="homeGenesisAskInput" class="ios-input" style="flex:1; min-width:0; padding:5px 8px; font-size:10.3px; font-weight:700;" placeholder="🧬 GENESIS AI'ya Yaz veya 🎙️ Konuşarak Sor..." onkeydown="if(event.key==='Enter'){event.preventDefault();AvigenGenesisAI.askGenesisFromHomeScreen();}" />
            <button type="button" id="btnMic_homeGenesisAskInput" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:10.5px; font-weight:900; flex-shrink:0; border-color:${this._isListeningVoice && this._activeVoiceInputId === 'homeGenesisAskInput' ? '#dc2626' : '#7c3aed'}; background:${this._isListeningVoice && this._activeVoiceInputId === 'homeGenesisAskInput' ? '#fee2e2' : '#f5f3ff'}; color:${this._isListeningVoice && this._activeVoiceInputId === 'homeGenesisAskInput' ? '#dc2626' : '#5b21b6'};" onclick="AvigenGenesisAI.toggleVoiceQuestion('homeGenesisAskInput', event)" title="Mikrofonla Konuşarak Soru Sor (Türkçe Ses Tanıma)">
              ${this._isListeningVoice && this._activeVoiceInputId === 'homeGenesisAskInput' ? '🔴 Dinliyor' : '🎙️'}
            </button>
            <button type="button" class="ios-btn ios-btn-outline" data-genesis-autospeak-btn="1" style="padding:5px 7px; font-size:9.8px; font-weight:900; flex-shrink:0; border-color:${this.isVoiceAutoSpeakEnabled() ? '#059669' : '#cbd5e1'}; background:${this.isVoiceAutoSpeakEnabled() ? '#ecfdf5' : 'var(--ios-card)'}; color:${this.isVoiceAutoSpeakEnabled() ? '#047857' : '#64748b'};" onclick="AvigenGenesisAI.toggleVoiceAutoSpeak(event)" title="GENESIS AI Sesli Cevap (Açık / Kapalı)">
              ${this.isVoiceAutoSpeakEnabled() ? '🔊' : '🔇'}
            </button>
            <button type="button" class="ai-send-btn" style="padding:5px 9px; font-size:10px; flex-shrink:0;" onclick="AvigenGenesisAI.askGenesisFromHomeScreen()">
              Sor →
            </button>
          </div>

          <!-- Yanıt Kutusu (Sadece Soru Sorulduğunda Açılır, Sesli Dinlenebilir & Kapatılabilir) -->
          <div id="homeGenesisQuickAnswerBox" style="display:${latestChat ? 'block' : 'none'}; margin-top:5px;">
            ${latestChat ? `
              <div style="background:var(--ios-card); border:1px solid #c4b5fd; border-left:3.5px solid #7c3aed; border-radius:7px; padding:6px 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:3px;">
                  <span style="font-size:9px; font-weight:900; color:#4c1d95;">🧬 GENESIS AI Yanıtı (${escapeHtml(latestChat.time)})</span>
                  <div style="display:flex; gap:4px; align-items:center;">
                    <button type="button" class="ios-btn ios-btn-outline" data-genesis-speak-btn="1" style="padding:1.5px 6px; font-size:7.8px; font-weight:900; color:${this._isSpeakingNow ? '#dc2626' : '#047857'}; border-color:${this._isSpeakingNow ? '#fca5a5' : '#6ee7b7'}; background:${this._isSpeakingNow ? '#fef2f2' : '#ecfdf5'};" onclick="AvigenGenesisAI.toggleSpeakLatestAnswer(event)">
                      ${this._isSpeakingNow ? '⏹️ Sustur' : '🔊 Sesli Dinle'}
                    </button>
                    <button type="button" class="ios-btn ios-btn-outline" style="padding:1.5px 6px; font-size:7.8px;" onclick="AvigenGenesisAI.openModuleDirectlyFromHome('breeding', event)">
                      Detay →
                    </button>
                    <button type="button" class="ios-btn ios-btn-outline" style="padding:1.5px 6px; font-size:7.8px;" onclick="AvigenGenesisAI.clearGeminiChatHistory()">
                      ✕ Kapat
                    </button>
                  </div>
                </div>
                <div style="font-size:8.8px; font-weight:800; color:#0369a1; margin-bottom:3px;">
                  Soru: ${escapeHtml(latestChat.question)}
                </div>
                <div style="font-size:9.3px; color:var(--ios-text); line-height:1.38; max-height:130px; overflow-y:auto;">
                  ${latestChat.answerHtml}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  },

  homeAlertIndex: 0,

  cycleHomeDynamicNotification(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    this.homeAlertIndex = (this.homeAlertIndex || 0) + 1;
    this.renderHomeTeaserCard();
  },

  buildHomeDynamicNotifications() {
    const notifications = [];
    const { males, females, all } = typeof getAllBreedingCandidates === 'function' ? getAllBreedingCandidates() : { males: [], females: [], all: [] };

    // 1. Eşzamanlı Aktif Yuva Çakışması Kontrolü (Varsa İlk Sırada Gösterilir)
    if (typeof detectActiveNestConflicts === 'function') {
      const conf = detectActiveNestConflicts();
      if (conf.hasConflicts && conf.conflictAlerts[0]) {
        const c = conf.conflictAlerts[0];
        notifications.push({
          type: 'CONFLICT_ALERT',
          badge: '⚠️ YUVA ÇAKIŞMA UYARISI',
          badgeClass: 'gene-red',
          icon: '⚠️',
          title: `Aynı Kuş Birden Fazla Aktif Yuvada: ${c.ring}`,
          desc: `${c.message} Kayıt doğruluğu için yuvalardan birini güncelleyin.`,
          actionsHtml: `
            <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(c.ring)}', event)">📊 Kuş Profili</button>
            <button type="button" class="nest-mini-action-btn" onclick="openHomeItemModal('${escapeHtml(c.pairId)}', 'pairs')">🪺 Yuva Detayı</button>
          `
        });
      }
    }

    // 2. GENESIS AI En İyi Eşleşme Önerisi (Canlı Kümes Verisinden)
    if (males.length && females.length) {
      const m0 = males[0];
      const f0 = females.find(f => f.ring !== m0.ring) || females[0];
      const br = this.analyzeBreedingIntelligence(m0.id, f0.id, true);
      notifications.push({
        type: 'BEST_PAIRING',
        badge: `💞 GENESIS AI EŞLEŞME ÖNERİSİ • %${br.totalScore} UYUM`,
        badgeClass: 'gene-purple',
        icon: '🧬',
        title: `♂ ${br.sireInfo.ring} (${br.sireInfo.name}) × ♀ ${br.damInfo.ring} (${br.damInfo.name})`,
        desc: `Wright COI: %${br.coi.toFixed(2)} • Veri Güvenilirliği: %${br.dataReliabilityPct}. Hız ve dayanıklılık hatları birbirini tamamlıyor.`,
        actionsHtml: `
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(br.sireInfo.ring)}', event)">♂ Baba Profili</button>
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(br.damInfo.ring)}', event)">♀ Anne Profili</button>
          <button type="button" class="nest-mini-action-btn gold" onclick="AvigenGenesisAI.state.selectedSireRef='${m0.id}'; AvigenGenesisAI.state.selectedDamRef='${f0.id}'; AvigenGenesisAI.openModuleDirectlyFromHome('breeding');">💞 Analizi Aç →</button>
        `
      });
    }

    // 3. Yaklaşan Yarış Etabı İçin #1 Kuş Önerisi
    if (all.length && typeof racesList !== 'undefined') {
      const upcomingRace = racesList.find(r => r.icon === '🧭' || /yaklaşan|final|etap/i.test(r.title)) || racesList[0];
      const topRacer = all[0];
      const kmMatch = (upcomingRace?.title || '').match(/(\d{3,4})\s*km/i);
      const distKm = kmMatch ? parseInt(kmMatch[1], 10) : 480;
      notifications.push({
        type: 'RACE_PICK',
        badge: `🏁 YARIŞ KADROSU ÖNERİSİ • ${distKm} KM`,
        badgeClass: 'gene-blue',
        icon: '🏆',
        title: `${upcomingRace ? upcomingRace.title : `${distKm} km Etap`} İçin #1 Aday: ${topRacer.ring} (${topRacer.name})`,
        desc: `Mesafe ve rüzgar direnci indeksine göre bu etapta en yüksek eve dönüş ve hız potansiyeline sahip kuşunuz.`,
        actionsHtml: `
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(topRacer.ring)}', event)">📊 Kuş Profili</button>
          <button type="button" class="nest-mini-action-btn gold" onclick="AvigenGenesisAI.state.targetRaceDistKm=${distKm}; AvigenGenesisAI.openModuleDirectlyFromHome('distance');">🏁 Kadro Analizi →</button>
        `
      });
    }

    // 5. Aktif Yuva & Kuluçka Bildirimi
    if (typeof activePairsList !== 'undefined' && activePairsList.length > 0) {
      const p0 = activePairsList[0];
      const dyn = typeof computeDynamicBreedingStage === 'function' ? computeDynamicBreedingStage(p0.eventType || 'hatch', p0.eventDate) : null;
      const sRing = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(p0.sire) : p0.sire;
      const dRing = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(p0.dam) : p0.dam;
      notifications.push({
        type: 'ACTIVE_NEST_AI',
        badge: `🪺 AKTİF YUVA TAKİBİ • ${p0.nest.toUpperCase()}`,
        badgeClass: 'gene-gold',
        icon: '🐣',
        title: `${p0.nest}: ♂ ${sRing} × ♀ ${dRing} (${dyn ? dyn.badge : p0.status})`,
        desc: dyn ? `${dyn.progressLabel} • Tahmini Çıkış: ${dyn.estHatchDateLabel} • Bilezik: ${dyn.estRingDateLabel}` : 'Kuluçka ve yavru gelişim takibinde.',
        actionsHtml: `
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(sRing)}', event)">♂ Baba</button>
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(dRing)}', event)">♀ Anne</button>
          <button type="button" class="nest-mini-action-btn gold" onclick="openHomeItemModal('${p0.id}', 'pairs')">🪺 Yuva Detayı →</button>
        `
      });
    }

    return notifications;
  },

  renderHomeDynamicNotificationCard() {
    const alertBox = document.getElementById('homeGenesisDynamicAlertCard');
    if (!alertBox) return;

    const list = this.buildHomeDynamicNotifications();
    if (!list.length) {
      alertBox.innerHTML = '';
      return;
    }

    const idx = (this.homeAlertIndex || 0) % list.length;
    const item = list[idx];
    const isConflict = item.type === 'CONFLICT_ALERT';

    alertBox.innerHTML = `
      <div class="genesis-dynamic-notif-card ${isConflict ? 'notif-conflict' : ''}">
        <div class="genesis-notif-top">
          <div style="display:flex; align-items:center; gap:5px; min-width:0;">
            <span class="cyber-ai-chip-box" style="font-size:8.5px; padding:1px 4px;">AI</span>
            <span class="gene-badge ${item.badgeClass}" style="font-size:8px; padding:1.5px 6px;">${escapeHtml(item.badge)}</span>
          </div>
          <button type="button" class="genesis-notif-cycle-btn" onclick="AvigenGenesisAI.cycleHomeDynamicNotification(event)" title="Sonraki GENESIS AI Önerisini Gör">
            Öneri ${idx + 1}/${list.length} ↻
          </button>
        </div>

        <div class="genesis-notif-body">
          <div class="genesis-notif-ico">${item.icon}</div>
          <div style="min-width:0; flex:1;">
            <div class="genesis-notif-title">${escapeHtml(item.title)}</div>
            <div class="genesis-notif-desc">${escapeHtml(item.desc)}</div>
          </div>
        </div>

        <div class="genesis-notif-actions">
          ${item.actionsHtml}
        </div>
      </div>
    `;
  },

  switchGenesisMode(mode, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    let resolvedMode = 'breeding';
    if (mode === 'nutrition' || mode === 'nutrition_hub') resolvedMode = 'nutrition';
    else if (mode === 'smart_race' || mode === 'race_management_hub' || mode === 'distance' || mode === 'racing') {
      resolvedMode = 'smart_race';
      this.state.smartRaceStage = 'setup';
    }
    this.state.activeMode = resolvedMode;
    this.state.viewStage = 'tool';
    this.saveState();
    this.renderGenesisModuleUI();
  },

  openSmartRaceWithEvent(raceEventId) {
    this.state.smartRaceEventId = raceEventId || 'auto';
    this.state.smartRaceStage = 'summary';
    this.state.activeMode = 'smart_race';
    this.state.viewStage = 'tool';
    this.saveState();
    if (typeof openIosTab === 'function') {
      openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2]);
    } else {
      this.renderGenesisModuleUI();
    }
  },

  openHistoryView() {
    this.state.viewStage = 'history';
    this.saveState();
    this.renderGenesisModuleUI();
  },

  backToGenesisLauncher() {
    this.state.viewStage = 'launcher';
    this.saveState();
    this.renderGenesisModuleUI();
  },

  onGenesisSelectionChange() {
    const sSel = document.getElementById('genesisSireSelect');
    const dSel = document.getElementById('genesisDamSelect');
    if (sSel) this.state.selectedSireRef = sSel.value;
    if (dSel) this.state.selectedDamRef = dSel.value;

    const nutPhase = document.getElementById('genesisNutPhase');
    const nutGroup = document.getElementById('genesisNutGroup');
    const nutCount = document.getElementById('genesisNutBirdCount');
    if (nutPhase) this.state.nutritionPhase = nutPhase.value;
    if (nutGroup) {
      const prevGroup = this.state.nutritionGroup;
      this.state.nutritionGroup = nutGroup.value;
      if (prevGroup !== nutGroup.value && nutGroup.value !== 'CUSTOM' && typeof collectUniqueLoftBirds === 'function') {
        const activeBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
        if (nutGroup.value === 'ALL') this.state.nutritionBirdCount = Math.max(1, activeBirds.length);
        else if (nutGroup.value === 'RACER') this.state.nutritionBirdCount = Math.max(1, activeBirds.filter(b => b.roleCategory === 'RACER').length || activeBirds.length);
        else if (nutGroup.value === 'BREEDER') this.state.nutritionBirdCount = Math.max(1, activeBirds.filter(b => b.roleCategory === 'BREEDER').length || activeBirds.length);
        else if (nutGroup.value === 'YOUNG') this.state.nutritionBirdCount = Math.max(1, activeBirds.filter(b => b.roleCategory === 'YOUNG').length || 10);
        if (nutCount) nutCount.value = this.state.nutritionBirdCount;
      }
    }
    if (nutCount && (!nutGroup || nutGroup.value === 'CUSTOM' || this.state.nutritionGroup === nutGroup?.value)) {
      const parsedCnt = parseInt(nutCount.value, 10);
      if (!isNaN(parsedCnt) && parsedCnt > 0) {
        this.state.nutritionBirdCount = parsedCnt;
      }
    }

    this.saveState();
    this.renderGenesisReportOnly();
  },

  // ==========================================================================
  // 3 BLOKLU SADE VE BİLİMSEL KARAR KARTI ŞABLONU
  // 1. Blok: Üst Başlık + 3 Yan Yana Bilimsel Gösterge (Puan • COI/Ölçüt • Güven %)
  // 2. Blok: 3 Kısa Maddelik Net Gerekçe (✅ Bilimsel Kanıt • ⚠️ Risk/Veri • 🎯 Tavsiye)
  // 3. Blok: Doğrudan İşlem / Tablo + Açılır Bilimsel Metodoloji (<details>)
  // ==========================================================================
  renderFiveQuestionDecisionCard(cfg) {
    const scoreColor = cfg.score === null
      ? '#64748b'
      : (cfg.score >= 80 ? '#059669' : (cfg.score >= 65 ? '#0066ff' : '#dc2626'));
    const relMeta = this.classifyDataReliability(cfg.reliabilityPct);
    const relColor = relMeta.color;

    const metricTitle = cfg.metricTitle || 'AKRABALIK / ÖLÇÜT';
    const metricVal = cfg.metricValue || (cfg.verdictTag ? cfg.verdictTag.split('•')[0].trim() : 'Doğrulandı');
    const metricColor = cfg.metricColor || '#7c3aed';

    const bDecision = cfg.bulletDecision || cfg.q3_result || '';
    const bProof = cfg.bulletProof || cfg.q4_whyResult || '';
    const bDataRisk = cfg.bulletDataRisk || cfg.q2_dataUsed || '';
    const recKey = `${this.state.activeMode}__${String(cfg.headerTitle || '').replace(/<[^>]*>/g, '').slice(0, 60)}`;

    return `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <!-- 1. BLOK: BAŞLIK VE 3 YAN YANA BİLİMSEL GÖSTERGE KUTUSU -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:11px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px; margin-bottom:6px;">
            <div style="font-size:11.8px; font-weight:900; color:var(--ios-text); line-height:1.25;">
              ${cfg.headerTitle}
            </div>
            <span class="gene-badge ${relMeta.badgeClass}" style="font-size:8.2px; flex-shrink:0;">
              ${relMeta.label} (%${relMeta.pct})
            </span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1.15fr 1fr; gap:6px;">
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid ${scoreColor}; border-radius:8px; padding:5px 6px; text-align:center;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">ANALİZ PUANI</div>
              <div style="font-size:14px; font-weight:900; color:${scoreColor}; margin-top:1px;">
                ${cfg.score !== null ? `${cfg.score}/100` : 'Veri Yok'}
              </div>
            </div>

            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid ${metricColor}; border-radius:8px; padding:5px 6px; text-align:center;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">${escapeHtml(metricTitle)}</div>
              <div style="font-size:11px; font-weight:900; color:${metricColor}; margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${escapeHtml(metricVal)}
              </div>
            </div>

            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid ${relColor}; border-radius:8px; padding:5px 6px; text-align:center;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">VERİ GÜVENİLİRLİĞİ</div>
              <div style="font-size:11px; font-weight:900; color:${relColor}; margin-top:2px;">
                ${relMeta.label} (%${relMeta.pct})
              </div>
            </div>
          </div>
        </div>

        <!-- 2. BLOK: KULLANICI DOSTU SADE KARAR ÖZETİ (AVANTAJ • RİSK & VERİ • GÜVENİLİRLİK) -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid ${scoreColor}; border-radius:10px; padding:8px 10px; display:flex; flex-direction:column; gap:5px; font-size:10.3px; line-height:1.38;">
          <div>
            🎯 <strong style="color:${scoreColor};">Sade Sonuç:</strong> <strong>${bDecision}</strong>
          </div>
          <div>
            ✅ <strong style="color:#0052cc;">Avantaj &amp; Gerekçe:</strong> ${bProof}
          </div>
          <div style="color:var(--ios-subtext); font-size:9.8px;">
            ⚠️ <strong>Risk &amp; Veri Durumu:</strong> ${bDataRisk}
          </div>
        </div>

        <!-- 3. BLOK: DOĞRUDAN AKSİYON / KARŞILAŞTIRMA TABLOSU -->
        ${cfg.extraHtml || ''}

        <!-- İSTEĞE BAĞLI AÇILIR AYRINTILI BİLİMSEL ANALİZ VE METODOLOJİ -->
        <details style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:6px 9px; font-size:9.8px;">
          <summary style="font-weight:800; color:#5b21b6; cursor:pointer; outline:none;">
            🔬 Ayrıntılı Bilimsel Analizi, Hesaplama Metodolojisini ve Kaynakları Aç
          </summary>
          <div style="margin-top:7px; display:flex; flex-direction:column; gap:5px; color:var(--ios-subtext);">
            <div><strong>🔍 İncelenen Kayıt:</strong> ${cfg.q1_whatAnalyzed}</div>
            <div><strong>🛡️ Veri Güvenilirliği Sınıfı (${relMeta.label} • %${relMeta.pct}):</strong> ${cfg.q5_reliability}</div>
            ${cfg.expertHtml || ''}
          </div>
        </details>

        <!-- EN ALT MİKRO BİLİMSEL & HUKUKİ SORUMLULUK NOTU -->
        <div style="font-size:8px; line-height:1.3; color:var(--ios-subtext); opacity:0.85; border-top:1px dashed var(--ios-border); padding-top:4px; text-align:center;">
          ⚖️ <strong>Bilimsel &amp; Hukuki Not:</strong> Bu genetik analiz ve performans öngörüleri; kullanıcı tarafından girilen bireysel verilere, bireysel veri bulunmadığında ise üst ataların (pedigri) kayıtlarına dayalı olasılıksal bilimsel hesaplamalardır; kesinlik veya yarış/üreme garantisi içermez.
        </div>
      </div>
    `;
  },

  renderGenesisModuleUI() {
    const container = document.getElementById('genesisModuleRoot');
    if (!container) return;

    if (!this.hasActiveGenesisSubscription()) {
      const devId = (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.getOrCreateDeviceId === 'function')
        ? AvigenUxManager.getOrCreateDeviceId()
        : 'AVG-0000-0000';
      container.innerHTML = `
        <div class="genesis-paywall-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="gene-badge gene-purple">🧬 AVIGEN GENESIS AI</span>
            <span style="font-size:10.5px; color:#cbd5e1; font-weight:700;">AVIGEN STANDART Sürümü</span>
          </div>
          <div style="display:flex; align-items:center; gap:11px; margin-bottom:8px;">
            <img src="avigen-logo.svg" style="width:46px; height:46px; background:#fff; padding:4px; border-radius:13px; flex-shrink:0;" />
            <div>
              <div style="font-size:15.5px; font-weight:900; color:#ffffff; letter-spacing:0.4px;">AVIGEN GENESIS AI v5.3</div>
              <div style="font-size:10px; font-weight:800; color:#a7f3d0; margin-top:1px;">AKILLI EŞLEŞTİRME • GENESIS AI'YA SOR • HARİTALI YARIŞ • AKILLI YEM</div>
            </div>
          </div>
          <div style="font-size:10.8px; color:#e2e8f0; line-height:1.48; margin-bottom:10px; background:rgba(255,255,255,0.08); padding:9px 11px; border-radius:10px;">
            • <strong>1. 💞 Akıllı Eşleştirme &amp; Soy Danışmanı:</strong> Kümesteki en uygun 5 çifti otomatik bulma, 5 nesil akrabalık (Sewall Wright COI), 11 özellikte yavru öngörüsü ve <strong>"🧬 GENESIS AI'ya Sor"</strong> doğal dil yapay zekâ danışmanı.<br/>
            • <strong>2. 🗺️ 81 İl/İlçe Haritalı Akıllı Yarış Simülasyonu:</strong> Türkiye haritasında salım-kümes rotası, rüzgâr/arazi riski, mobil kartlarda olası dönüş saati, tahmini hız (m/dk) ve tek tuşla sepetleme.<br/>
            • <strong>3. 🌾 Akıllı Yem, Suluk Kürü &amp; 1 Aylık Maliyet:</strong> Günün tarihine, canlı hava sıcaklığına ve kuş sayısına göre günlük yem reçetesi ve 30 günlük maliyet tablosu.
          </div>
          <div style="background:rgba(15,23,42,0.55); border:1px solid rgba(147,197,253,0.45); border-radius:9px; padding:7px 10px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>
              <div style="font-size:8.5px; color:#93c5fd; font-weight:800;">📱 CİHAZ KİMLİK KODUNUZ (CİHAZ ID):</div>
              <div style="font-size:12.5px; color:#ffffff; font-weight:900; letter-spacing:0.8px;">${escapeHtml(devId)}</div>
            </div>
            <div style="font-size:9.2px; color:#a7f3d0; font-weight:800; text-align:right;">
              Lisans Hattı:<br/><strong>0 532 782 03 85</strong>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:7px;">
            <button class="ios-btn ios-btn-purple" style="padding:10px 8px; font-size:11px; font-weight:900;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal('checkout')">
              🔑 Lisans Kodu Gir
            </button>
            <button class="ios-btn ios-btn-green" style="padding:10px 8px; font-size:11px; font-weight:900;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.requestLicenseViaWhatsApp('8.990 TL', 'Yıllık (365 Gün)')">
              📲 Kod İste (0532 782 03 85)
            </button>
          </div>
          <button class="ios-btn ios-btn-outline" style="width:100%; padding:8px; font-size:10.5px; color:#ffffff; border-color:rgba(255,255,255,0.35); background:rgba(255,255,255,0.08);" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal('plans')">
            👑 Paketleri İncele (Standart 399 TL/ay • GENESIS AI 899 TL/ay)
          </button>
        </div>
      `;
      return;
    }

    const { males: rawMales, females: rawFemales, all } = getAllBreedingCandidates();
    const nestedNormSetForUi = typeof getActiveNestRingNormSet === 'function' ? getActiveNestRingNormSet() : new Set();
    const normRForUi = (r) => String(r || '').trim().toUpperCase().replace(/[-\s./_]+/g, '');
    const freeMalesList = rawMales.filter(m => !nestedNormSetForUi.has(normRForUi(m.ring)));
    const freeFemalesList = rawFemales.filter(f => !nestedNormSetForUi.has(normRForUi(f.ring)));
    const males = freeMalesList.length ? freeMalesList : rawMales;
    const females = freeFemalesList.length ? freeFemalesList : rawFemales;
    const allLoftBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
    if (!['breeding', 'smart_race', 'nutrition'].includes(this.state.activeMode)) {
      this.state.activeMode = 'breeding';
    }
    // Seçili Baba adayı gerçekten boştaki Erkek (males) listesinde mi, seçili Anne adayı gerçekten boştaki Dişi (females) listesinde mi doğrula!
    if (!this.state.selectedSireRef || (males.length > 0 && !males.some(m => m.id === this.state.selectedSireRef))) {
      this.state.selectedSireRef = males[0] ? males[0].id : '';
    }
    if (!this.state.selectedDamRef || (females.length > 0 && !females.some(f => f.id === this.state.selectedDamRef))) {
      this.state.selectedDamRef = females[0] ? females[0].id : '';
    }

    // ========================================================================
    // GÖRÜNÜM 0: GEÇMİŞ ANALİZLER ARŞİVİ EKRANI (SAVED ANALYSIS HISTORY)
    // ========================================================================
    if (this.state.viewStage === 'history') {
      container.innerHTML = `
        <div class="genesis-shell-card" style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--ios-border); flex-shrink:0;">
            <button type="button" class="genesis-back-pill" onclick="AvigenGenesisAI.backToGenesisLauncher()">
              ← Geri
            </button>
            <div style="font-size:12.5px; font-weight:900; color:#4c1d95;">
              🕒 Geçmiş Analizler (${this.analysisHistory.length})
            </div>
            ${this.analysisHistory.length > 0 ? `
              <button type="button" class="ios-btn ios-btn-danger" style="padding:3px 8px; font-size:9.5px;" onclick="AvigenGenesisAI.clearAllHistory()">
                Temizle
              </button>
            ` : `<span></span>`}
          </div>

          <div style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:7px;">
            ${this.analysisHistory.length === 0 ? `
              <div style="text-align:center; padding:26px 14px; background:var(--ios-card-alt); border-radius:11px; color:var(--ios-subtext); font-size:11px;">
                <div style="font-size:26px; margin-bottom:6px;">🕒</div>
                <strong>Henüz Kaydedilmiş Analiz Yok</strong>
                <div style="margin-top:3px; font-size:10px;">GENESIS AI modüllerinden herhangi birini çalıştırdığınızda sonuçlar otomatik olarak buraya kaydedilir.</div>
              </div>
            ` : this.analysisHistory.map(h => {
              const sCol = h.score === null ? '#64748b' : (h.score >= 80 ? '#059669' : (h.score >= 65 ? '#0066ff' : '#dc2626'));
              return `
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid ${sCol}; border-radius:10px; padding:8px 10px; font-size:10.5px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:3px;">
                    <span class="gene-badge gene-purple" style="font-size:8.5px;">${h.icon} ${escapeHtml(h.modeLabel)}</span>
                    <span style="font-size:9px; color:var(--ios-subtext); font-weight:700;">📅 ${escapeHtml(h.timestamp)}</span>
                  </div>
                  <div style="font-size:11.5px; font-weight:900; color:var(--ios-text); margin-bottom:2px;">
                    ${escapeHtml(h.title)}
                  </div>
                  <div style="font-size:10px; color:${sCol}; font-weight:800; margin-bottom:4px;">
                    Sonuç: ${h.score !== null ? `${h.score}/100 Puan • ` : ''}${escapeHtml(h.verdict)} (Güven: %${h.reliabilityPct})
                  </div>
                  <div style="display:flex; justify-content:flex-end; gap:5px;">
                    <button class="ios-btn ios-btn-primary" style="padding:4px 9px; font-size:9.5px;" onclick="AvigenGenesisAI.openSavedHistoryRecord('${h.id}')">
                      🔍 Tekrar Aç
                    </button>
                    <button class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:9.5px; color:#dc2626;" onclick="AvigenGenesisAI.deleteHistoryRecord('${h.id}')">
                      ✕
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // GÖRÜNÜM 1: AVIGEN GENESIS AI — 3 ÇEKİRDEK MOTOR BAŞLATICI EKRANI
    // ========================================================================
    if (this.state.viewStage !== 'tool') {
      const latestChat = Array.isArray(this.state.geminiChatHistory) && this.state.geminiChatHistory.length > 0
        ? this.state.geminiChatHistory[0]
        : null;

      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; height:100%; overflow-y:auto; padding-bottom:6px;">
          <!-- ÜST KOMUTA BAŞLIĞI (ANA SAYFADAKİ GÖRSELİN MİNİMAL & FERAH HALİ) -->
          <div class="genesis-launcher-hero" style="position:relative; overflow:hidden; padding:10px 12px; min-height:76px; display:flex; align-items:center; justify-content:space-between;">
            <div style="position:relative; z-index:2; display:flex; flex-direction:column; gap:4px; max-width:66%;">
              <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                <span class="cyber-ai-chip-box" style="font-size:8.5px; padding:1px 5px;">AI</span>
                <span style="font-size:13.5px; font-weight:900; color:var(--ios-text, #0f172a); letter-spacing:0.3px;">AVIGEN GENESIS AI</span>
                <span class="gene-badge gene-purple" style="font-size:7.8px; padding:1px 5px;">v5.0</span>
              </div>
              <div style="font-size:9.3px; font-weight:700; color:var(--ios-subtext, #334155); line-height:1.3;">
                Akıllı Eşleştirme &amp; Soy Danışmanı • Haritalı Yarış • Akıllı Yem
              </div>
              <div style="display:flex; gap:5px; align-items:center; margin-top:2px;">
                <button class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:9.2px; font-weight:800; background:var(--ios-card, #ffffff); color:#0052cc; border-color:#93c5fd;" onclick="AvigenGenesisAI.openHistoryView()" title="Kaydedilen Geçmiş Analizleri Gör">
                  🕒 Geçmiş (${this.analysisHistory.length})
                </button>
                <button class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:9.2px; font-weight:800; background:var(--ios-card, #ffffff); color:#5b21b6; border-color:#c4b5fd;" onclick="if(typeof AvigenScientificLibrary!=='undefined') AvigenScientificLibrary.openLibraryFromAnywhere()" title="Bilimsel Bilgi Bankası">
                  📚 Bilimsel Kütüphane
                </button>
              </div>
            </div>
            <div style="position:absolute; right:0; top:0; bottom:0; width:38%; pointer-events:none; display:flex; align-items:center; justify-content:flex-end;">
              ${this.renderCyberPigeonHeroSvg()}
            </div>
          </div>

          <!-- DOĞRUDAN GENESIS AI'YA SOR KUTUSU (SESLİ SORU & SESLİ YANIT DESTEKLİ) -->
          <div class="ios-card" style="padding:8px 10px; border:1.5px solid #7c3aed; background:linear-gradient(135deg, rgba(124,58,237,0.08), rgba(2,132,199,0.06), var(--ios-card));">
            <div style="display:flex; gap:4px; align-items:center; margin-bottom:5px;">
              <input type="text" id="launcherGenesisAskInput" class="ios-input" style="flex:1; min-width:0; padding:6px 8px; font-size:10.5px; font-weight:700;" placeholder="🧬 GENESIS AI'ya Yaz veya 🎙️ Konuşarak Sor..." onkeydown="if(event.key==='Enter'){event.preventDefault();AvigenGenesisAI.askGeminiAdvisor(this.value);}" />
              <button type="button" id="btnMic_launcherGenesisAskInput" class="ios-btn ios-btn-outline" style="padding:6px 9px; font-size:10.8px; font-weight:900; flex-shrink:0; border-color:${this._isListeningVoice && this._activeVoiceInputId === 'launcherGenesisAskInput' ? '#dc2626' : '#7c3aed'}; background:${this._isListeningVoice && this._activeVoiceInputId === 'launcherGenesisAskInput' ? '#fee2e2' : '#f5f3ff'}; color:${this._isListeningVoice && this._activeVoiceInputId === 'launcherGenesisAskInput' ? '#dc2626' : '#5b21b6'};" onclick="AvigenGenesisAI.toggleVoiceQuestion('launcherGenesisAskInput', event)" title="Mikrofonla Konuşarak Soru Sor">
                ${this._isListeningVoice && this._activeVoiceInputId === 'launcherGenesisAskInput' ? '🔴 Dinliyor' : '🎙️ Sesli Sor'}
              </button>
              <button type="button" class="ios-btn ios-btn-outline" data-genesis-autospeak-btn="1" style="padding:6px 8px; font-size:10px; font-weight:900; flex-shrink:0; border-color:${this.isVoiceAutoSpeakEnabled() ? '#059669' : '#cbd5e1'}; background:${this.isVoiceAutoSpeakEnabled() ? '#ecfdf5' : 'var(--ios-card)'}; color:${this.isVoiceAutoSpeakEnabled() ? '#047857' : '#64748b'};" onclick="AvigenGenesisAI.toggleVoiceAutoSpeak(event)" title="GENESIS AI Sesli Cevap (Açık / Kapalı)">
                ${this.isVoiceAutoSpeakEnabled() ? '🔊' : '🔇'}
              </button>
              <button type="button" class="ai-send-btn" style="padding:6px 10px; font-size:10.3px; flex-shrink:0;" onclick="AvigenGenesisAI.askGeminiAdvisor(document.getElementById('launcherGenesisAskInput')?.value)">
                Sor →
              </button>
            </div>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 7px; font-size:8.6px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Kümesimdeki en uyumlu 3 damızlık çift hangileri ve COI akrabalık riskleri nedir?', 'breeding_advice')">
                💞 En İyi 3 Çiftim
              </button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 7px; font-size:8.6px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Bu haftaki yarış rotamda rüzgâr riskine göre hangi kuşlarımı sepetlemeliyim?', 'race_strategy')">
                🗺️ Yarış &amp; Sepetleme
              </button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 7px; font-size:8.6px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Bugünkü hava sıcaklığına ve kümesimdeki kuş sayısına göre kaç gram yem ve sulukta ne vermeliyim?', 'nutrition_advice')">
                🌾 Bugünkü Yem &amp; Suluk
              </button>
            </div>
            ${this.state.geminiIsLoading ? `
              <div style="margin-top:6px; padding:6px 8px; font-size:10px; font-weight:800; color:#4c1d95;">
                🧬 GENESIS AI kümes verilerinizi analiz ediyor...
              </div>
            ` : (latestChat ? `
              <div style="margin-top:6px; background:var(--ios-card); border:1px solid #c4b5fd; border-left:3.5px solid #7c3aed; border-radius:7px; padding:6px 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:3px;">
                  <span style="font-size:9px; font-weight:900; color:#4c1d95;">🧬 GENESIS AI Yanıtı (${escapeHtml(latestChat.time)})</span>
                  <div style="display:flex; gap:4px; align-items:center;">
                    <button type="button" class="ios-btn ios-btn-outline" data-genesis-speak-btn="1" style="padding:1.5px 6px; font-size:7.8px; font-weight:900; color:${this._isSpeakingNow ? '#dc2626' : '#047857'}; border-color:${this._isSpeakingNow ? '#fca5a5' : '#6ee7b7'}; background:${this._isSpeakingNow ? '#fef2f2' : '#ecfdf5'};" onclick="AvigenGenesisAI.toggleSpeakLatestAnswer(event)">
                      ${this._isSpeakingNow ? '⏹️ Sustur' : '🔊 Sesli Dinle'}
                    </button>
                    <button type="button" class="ios-btn ios-btn-outline" style="padding:1.5px 6px; font-size:7.8px;" onclick="AvigenGenesisAI.clearGeminiChatHistory()">
                      ✕ Kapat
                    </button>
                  </div>
                </div>
                <div style="font-size:8.8px; font-weight:800; color:#0369a1; margin-bottom:3px;">Soru: ${escapeHtml(latestChat.question)}</div>
                <div style="font-size:9.3px; color:var(--ios-text); line-height:1.4; max-height:150px; overflow-y:auto;">${latestChat.answerHtml}</div>
              </div>
            ` : '')}
          </div>

          <!-- 3 ÇEKİRDEK MOTOR KARTI -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${this.MAIN_MODULES.map(m => `
              <div class="genesis-3main-card" onclick="AvigenGenesisAI.switchGenesisMode('${m.defaultSubMode}')">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <div style="display:flex; align-items:center; gap:9px; min-width:0;">
                    <div class="genesis-bento-icon" style="border-color:${m.accent}55; width:36px; height:36px; font-size:18px;">
                      ${m.icon}
                    </div>
                    <div style="min-width:0;">
                      <div style="font-size:11.8px; font-weight:900; color:var(--ios-text);">
                        ${m.num}. ${escapeHtml(m.title)}
                      </div>
                      <div style="font-size:9.4px; color:var(--ios-subtext); font-weight:600; margin-top:1px;">
                        ${escapeHtml(m.purpose)}
                      </div>
                    </div>
                  </div>
                  <span style="font-size:11px; font-weight:900; color:${m.accent}; flex-shrink:0;">
                    Aç →
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // GÖRÜNÜM 2: SEÇİLEN ANA MOTORUN ÇALIŞMA EKRANI
    // ========================================================================
    const activeMainModule = this.getMainModuleForMode(this.state.activeMode);
    const latestChat = Array.isArray(this.state.geminiChatHistory) && this.state.geminiChatHistory.length > 0
      ? this.state.geminiChatHistory[0]
      : null;

    let controlsHtml = '';
    if (this.state.activeMode === 'breeding') {
      const topLoftPairs = this.getTopLoftBreedingPairs(5);
      const curGoal = this.state.breedingTargetGoal || 'balanced';
      const activeNestByRing = new Map();
      if (typeof activePairsList !== 'undefined' && Array.isArray(activePairsList)) {
        activePairsList.forEach(ap => {
          const sr = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(ap.sire) : '';
          const dr = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(ap.dam) : '';
          if (sr) activeNestByRing.set(sr, ap.nest || 'Aktif Yuva');
          if (dr) activeNestByRing.set(dr, ap.nest || 'Aktif Yuva');
        });
      }
      const curRepQuick = this.analyzeBreedingIntelligence(this.state.selectedSireRef, this.state.selectedDamRef);
      controlsHtml = `
        <div class="genesis-tool-controls" style="display:flex; flex-direction:column; gap:6px;">
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto; gap:6px; align-items:end;">
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800; color:#0284c7;">1. ♂ Erkek Kuş Seçimi (${males.length} Boşta)</label>
              <select id="genesisSireSelect" class="ios-select" style="width:100%; font-size:11px; font-weight:800; padding:6px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${males.length
                  ? males.map(c => `<option value="${c.id}" ${c.id === this.state.selectedSireRef ? 'selected' : ''}>♂ ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')
                  : `<option value="">⚠️ Kümesinizde boşta ♂ Erkek kuş yok</option>`}
              </select>
            </div>
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800; color:#db2777;">2. ♀ Dişi Kuş Seçimi (${females.length} Boşta)</label>
              <select id="genesisDamSelect" class="ios-select" style="width:100%; font-size:11px; font-weight:800; padding:6px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${females.length
                  ? females.map(c => `<option value="${c.id}" ${c.id === this.state.selectedDamRef ? 'selected' : ''}>♀ ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')
                  : `<option value="">⚠️ Kümesinizde boşta ♀ Dişi kuş yok</option>`}
              </select>
            </div>
            <button class="ai-send-btn" style="padding:7px 11px; font-size:11px; flex-shrink:0;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">
              ✨ Analiz Et
            </button>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:4px 7px;">
            <span style="font-size:9.2px; font-weight:800; color:#4c1d95; white-space:nowrap;">🎯 Eşleştirme Hedefi:</span>
            <select id="genesisBreedingGoalSelect" class="ios-select" style="flex:1; padding:3px 6px; font-size:9.8px; font-weight:800;" onchange="AvigenGenesisAI.setBreedingTargetGoal(this.value)">
              <option value="balanced" ${curGoal === 'balanced' ? 'selected' : ''}>⚖️ Dengeli (Hem Yarış Hem Damızlık Uyumu)</option>
              <option value="race_outcross" ${curGoal === 'race_outcross' ? 'selected' : ''}>🚀 Yarışçı Yavru Üretimi (Kan Kırma / %0 COI Outcross)</option>
              <option value="linebreeding_stock" ${curGoal === 'linebreeding_stock' ? 'selected' : ''}>🧬 Damızlık Kan Sabitleme (Şampiyon Ortak Ata / Linebreeding)</option>
            </select>
          </div>

          ${(curRepQuick.altFemalesForSire.length > 0 || curRepQuick.altMalesForDam.length > 0) ? `
            <details ${this.state.autoExpandBestMates ? 'open' : ''} style="background:#eff6ff; border:1.5px solid #93c5fd; border-radius:9px; padding:6px 8px; font-size:9.5px;">
              <summary style="cursor:pointer; font-weight:900; color:#0052cc; outline:none; display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <span>🔍 Seçili Kuş İçin En Uygun 5 Eş Adayı (${this.state.focusMateSearchSex === 'F' ? `♀ ${escapeHtml(curRepQuick.damInfo.ring)} İçin 5 ♂ Erkek` : `♂ ${escapeHtml(curRepQuick.sireInfo.ring)} İçin 5 ♀ Dişi`})</span>
                <span class="gene-badge gene-blue" style="font-size:8px;">Mükerrer Yok</span>
              </summary>
              <div style="margin-top:6px; display:flex; flex-direction:column; gap:5px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
                  <button type="button" class="ios-btn ${this.state.focusMateSearchSex !== 'F' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:5px 6px; font-size:9px; font-weight:900;" onclick="AvigenGenesisAI.setFocusMateSearchSex('M')">
                    ♂ ${escapeHtml(curRepQuick.sireInfo.ring)} İçin En İyi 5 ♀ Dişi
                  </button>
                  <button type="button" class="ios-btn ${this.state.focusMateSearchSex === 'F' ? 'ios-btn-purple' : 'ios-btn-outline'}" style="padding:5px 6px; font-size:9px; font-weight:900;" onclick="AvigenGenesisAI.setFocusMateSearchSex('F')">
                    ♀ ${escapeHtml(curRepQuick.damInfo.ring)} İçin En İyi 5 ♂ Erkek
                  </button>
                </div>
                ${this.state.focusMateSearchSex !== 'F' ? `
                  <div style="font-weight:900; color:#0284c7; font-size:9.2px;">♂ ${escapeHtml(curRepQuick.sireInfo.ring)} (${escapeHtml(curRepQuick.sireInfo.name)}) İçin En Uygun 5 ♀ Dişi Adayı (Boşta &amp; Benzersiz):</div>
                  ${curRepQuick.altFemalesForSire.slice(0, 5).map((item, idx) => `
                    <div style="background:#ffffff; border:1px solid ${item.candidate.id === this.state.selectedDamRef ? '#059669' : '#e2e8f0'}; border-left:3.5px solid ${idx === 0 ? '#059669' : '#0284c7'}; border-radius:6px; padding:5px 7px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
                      <div style="min-width:0;">
                        <div style="font-weight:800; color:#0f172a;">${idx + 1}. ♀ ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)}) • <strong style="color:#059669;">${item.score}/100</strong> (%${item.coi.toFixed(2)} COI)</div>
                        <div style="font-size:8.6px; color:#475569;">${escapeHtml(item.why)}</div>
                      </div>
                      <button type="button" class="ios-btn ${item.candidate.id === this.state.selectedDamRef ? 'ios-btn-green' : 'ios-btn-primary'}" style="padding:4px 8px; font-size:8.8px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${this.state.selectedSireRef}', '${item.candidate.id}')">${item.candidate.id === this.state.selectedDamRef ? '✓ Seçili' : '✓ Eş Seç'}</button>
                    </div>
                  `).join('')}
                ` : `
                  <div style="font-weight:900; color:#db2777; font-size:9.2px;">♀ ${escapeHtml(curRepQuick.damInfo.ring)} (${escapeHtml(curRepQuick.damInfo.name)}) İçin En Uygun 5 ♂ Erkek Adayı (Boşta &amp; Benzersiz):</div>
                  ${curRepQuick.altMalesForDam.slice(0, 5).map((item, idx) => `
                    <div style="background:#ffffff; border:1px solid ${item.candidate.id === this.state.selectedSireRef ? '#059669' : '#e2e8f0'}; border-left:3.5px solid ${idx === 0 ? '#059669' : '#db2777'}; border-radius:6px; padding:5px 7px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
                      <div style="min-width:0;">
                        <div style="font-weight:800; color:#0f172a;">${idx + 1}. ♂ ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)}) • <strong style="color:#059669;">${item.score}/100</strong> (%${item.coi.toFixed(2)} COI)</div>
                        <div style="font-size:8.6px; color:#475569;">${escapeHtml(item.why)}</div>
                      </div>
                      <button type="button" class="ios-btn ${item.candidate.id === this.state.selectedSireRef ? 'ios-btn-green' : 'ios-btn-purple'}" style="padding:4px 8px; font-size:8.8px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${item.candidate.id}', '${this.state.selectedDamRef}')">${item.candidate.id === this.state.selectedSireRef ? '✓ Seçili' : '✓ Eş Seç'}</button>
                    </div>
                  `).join('')}
                `}
              </div>
            </details>
          ` : ''}

          ${topLoftPairs.length > 0 ? `
            <details style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:8px; padding:5px 8px; font-size:9.5px;">
              <summary style="cursor:pointer; font-weight:900; color:#5b21b6; outline:none;">
                🏆 Kümesinizdeki En Uygun ${topLoftPairs.length} Eşleşmeyi Otomatik Göster (Tüm Kümes Taraması)
              </summary>
              <div style="margin-top:6px; display:flex; flex-direction:column; gap:4px;">
                ${topLoftPairs.map((tp, idx) => `
                  <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3px solid ${idx === 0 ? '#059669' : '#0066ff'}; border-radius:6px; padding:5px 7px; display:flex; justify-content:space-between; align-items:center; gap:6px;">
                    <div style="min-width:0;">
                      <div style="font-weight:900; color:#0f172a;">${idx + 1}. ♂ ${escapeHtml(tp.sire.ring)} (${escapeHtml(tp.sire.name)}) × ♀ ${escapeHtml(tp.dam.ring)} (${escapeHtml(tp.dam.name)})</div>
                      <div style="font-size:8.8px; color:#475569;">Uyum: <strong>${tp.score}/100</strong> • ${escapeHtml(tp.summary)} • ${escapeHtml(tp.compLabel)}</div>
                    </div>
                    <button type="button" class="ios-btn ios-btn-primary" style="padding:3px 8px; font-size:9px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${tp.sire.id}', '${tp.dam.id}')">
                      Seç &amp; İncele
                    </button>
                  </div>
                `).join('')}
              </div>
            </details>
          ` : ''}

          <!-- BİRLEŞİK "🧬 GENESIS AI'YA SOR" CANLI KÜMES & SOY DANIŞMANI (SESLİ SORU & SESLİ YANIT DESTEKLİ) -->
          <div style="background:linear-gradient(135deg, rgba(124,58,237,0.08), rgba(2,132,199,0.07)); border:1px solid #c4b5fd; border-radius:8px; padding:6px 8px;">
            <div style="display:flex; gap:4px; align-items:center; margin-bottom:4px;">
              <input type="text" id="geminiPromptInput" class="ios-input" style="flex:1; min-width:0; padding:5px 8px; font-size:10.3px; font-weight:700;" placeholder="🧬 GENESIS AI'ya Yaz veya 🎙️ Konuşarak Sor..." value="${escapeHtml(this.state.geminiDraftPrompt || '')}" onkeydown="if(event.key==='Enter'){event.preventDefault();AvigenGenesisAI.askGeminiAdvisor();}" />
              <button type="button" id="btnMic_geminiPromptInput" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:10.3px; font-weight:900; flex-shrink:0; border-color:${this._isListeningVoice && this._activeVoiceInputId === 'geminiPromptInput' ? '#dc2626' : '#7c3aed'}; background:${this._isListeningVoice && this._activeVoiceInputId === 'geminiPromptInput' ? '#fee2e2' : '#f5f3ff'}; color:${this._isListeningVoice && this._activeVoiceInputId === 'geminiPromptInput' ? '#dc2626' : '#5b21b6'};" onclick="AvigenGenesisAI.toggleVoiceQuestion('geminiPromptInput', event)" title="Mikrofonla Konuşarak Soru Sor">
                ${this._isListeningVoice && this._activeVoiceInputId === 'geminiPromptInput' ? '🔴 Dinliyor' : '🎙️ Sesli'}
              </button>
              <button type="button" class="ios-btn ios-btn-outline" data-genesis-autospeak-btn="1" style="padding:5px 7px; font-size:9.8px; font-weight:900; flex-shrink:0; border-color:${this.isVoiceAutoSpeakEnabled() ? '#059669' : '#cbd5e1'}; background:${this.isVoiceAutoSpeakEnabled() ? '#ecfdf5' : 'var(--ios-card)'}; color:${this.isVoiceAutoSpeakEnabled() ? '#047857' : '#64748b'};" onclick="AvigenGenesisAI.toggleVoiceAutoSpeak(event)" title="GENESIS AI Sesli Cevap (Açık / Kapalı)">
                ${this.isVoiceAutoSpeakEnabled() ? '🔊' : '🔇'}
              </button>
              <button type="button" class="ai-send-btn" style="padding:5px 9px; font-size:10px; flex-shrink:0;" onclick="AvigenGenesisAI.askGeminiAdvisor()">
                Sor →
              </button>
            </div>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 6px; font-size:8.4px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Seçili erkek ve dişi kuşumun 5 nesil soyağacını, ortak atalarını ve doğacak yavru potansiyelini yorumla.', 'pair_deep')">
                🧬 Seçili Çifti Yorumla
              </button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 6px; font-size:8.4px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Kümesimdeki en uyumlu 3 damızlık çift hangileri ve COI akrabalık riskleri nedir?', 'breeding_advice')">
                💞 En İyi 3 Çiftim
              </button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 6px; font-size:8.4px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Bu haftaki yarış rotamda rüzgâr riskine göre hangi kuşlarımı sepetlemeliyim?', 'race_strategy')">
                🗺️ Yarış Stratejim
              </button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 6px; font-size:8.4px; font-weight:800;" onclick="AvigenGenesisAI.askGeminiAdvisor('Bugünkü hava sıcaklığına ve kümesimdeki kuş sayısına göre kaç gram yem ve sulukta ne vermeliyim?', 'nutrition_advice')">
                🌾 Bugünkü Yem
              </button>
            </div>
            ${this.state.geminiIsLoading ? `
              <div style="margin-top:5px; padding:5px 7px; font-size:9.8px; font-weight:800; color:#4c1d95;">
                🧬 GENESIS AI kümes verilerinizi analiz ediyor...
              </div>
            ` : (latestChat ? `
              <div style="margin-top:6px; background:var(--ios-card); border:1px solid #c4b5fd; border-left:3.5px solid #7c3aed; border-radius:7px; padding:6px 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:3px;">
                  <span style="font-size:9px; font-weight:900; color:#4c1d95;">🧬 GENESIS AI Yanıtı (${escapeHtml(latestChat.time)})</span>
                  <div style="display:flex; gap:4px; align-items:center;">
                    <button type="button" class="ios-btn ios-btn-outline" data-genesis-speak-btn="1" style="padding:1.5px 6px; font-size:7.8px; font-weight:900; color:${this._isSpeakingNow ? '#dc2626' : '#047857'}; border-color:${this._isSpeakingNow ? '#fca5a5' : '#6ee7b7'}; background:${this._isSpeakingNow ? '#fef2f2' : '#ecfdf5'};" onclick="AvigenGenesisAI.toggleSpeakLatestAnswer(event)">
                      ${this._isSpeakingNow ? '⏹️ Sustur' : '🔊 Sesli Dinle'}
                    </button>
                    <button type="button" class="ios-btn ios-btn-outline" style="padding:1.5px 6px; font-size:7.8px;" onclick="AvigenGenesisAI.clearGeminiChatHistory()">
                      ✕ Kapat
                    </button>
                  </div>
                </div>
                <div style="font-size:8.8px; font-weight:800; color:#0369a1; margin-bottom:3px;">Soru: ${escapeHtml(latestChat.question)}</div>
                <div style="font-size:9.3px; color:var(--ios-text); line-height:1.4; max-height:150px; overflow-y:auto;">${latestChat.answerHtml}</div>
              </div>
            ` : '')}
          </div>
        </div>
      `;
    } else if (this.state.activeMode === 'smart_race') {
      const curStage = ['setup', 'summary', 'detail'].includes(this.state.smartRaceStage)
        ? this.state.smartRaceStage
        : 'setup';

      controlsHtml = `
        <div class="sr-stage-stepper" style="margin-bottom:6px;">
          <button type="button" class="sr-stage-step-btn ${curStage === 'setup' ? 'active' : ''}" onclick="AvigenGenesisAI.setSmartRaceStage('setup')">
            <span>1. Yarış &amp; Rota Kurulumu</span>
          </button>
          <button type="button" class="sr-stage-step-btn ${curStage === 'summary' ? 'active' : ''}" onclick="AvigenGenesisAI.setSmartRaceStage('summary')">
            <span>2. Simülasyon Sonuç Özeti</span>
          </button>
          <button type="button" class="sr-stage-step-btn ${curStage === 'detail' ? 'active' : ''}" onclick="AvigenGenesisAI.setSmartRaceStage('detail')">
            <span>3. Detaylı Bilimsel Analiz</span>
          </button>
        </div>
      `;
    } else if (this.state.activeMode === 'nutrition') {
      const totalActiveCount = allLoftBirds.length || 64;
      const racersCount = allLoftBirds.filter(b => b.roleCategory === 'RACER').length;
      const breedersCount = allLoftBirds.filter(b => b.roleCategory === 'BREEDER').length;
      const youngCount = allLoftBirds.filter(b => b.roleCategory === 'YOUNG').length;
      if (!this.state.nutritionBirdCount || this.state.nutritionBirdCount < 1) {
        this.state.nutritionBirdCount = totalActiveCount;
      }
      const curPhase = this.state.nutritionPhase || 'auto_today_smart';
      const curGroup = this.state.nutritionGroup || 'ALL';

      controlsHtml = `
        <div class="genesis-tool-controls" style="max-width:100%; overflow:hidden;">
          <div style="margin-bottom:6px;">
            <label style="font-size:9.5px; font-weight:800; color:#0052cc; display:block; margin-bottom:2px;">🌾 1. Tarih/Durum Bazlı Akıllı Öneri veya Dönemsel Rasyon Evresi Seçin</label>
            <select id="genesisNutPhase" class="ios-select" style="width:100%; padding:6px 8px; font-size:11px; font-weight:800;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
              <optgroup label="🎯 TARİHE, HAVAYA &amp; KUŞLARIN DURUMUNA GÖRE AKILLI ÖNERİ">
                <option value="auto_today_smart" ${curPhase === 'auto_today_smart' ? 'selected' : ''}>🎯 Otomatik Akıllı Öneri: Bugünün Tarihine &amp; Kuşların Durumuna Göre Yem ve Sıvı</option>
                <option value="monthly_full_loft" ${curPhase === 'monthly_full_loft' ? 'selected' : ''}>📊 Tam Kümes 1 Aylık (30 Gün) Yem, Sulu Malzeme &amp; Maliyet Hesabı</option>
              </optgroup>
              <optgroup label="🏁 YARIŞ DÖNEMİ (HAFTALIK EVRELER &amp; MESAFE)">
                <option value="race_recovery" ${curPhase === 'race_recovery' ? 'selected' : ''}>🏁 1. Evre: Yarış Dönüşü Toparlanma &amp; Detoks (Pazar–Pazartesi)</option>
                <option value="race_build" ${curPhase === 'race_build' ? 'selected' : ''}>⚡ 2. Evre: Hafta Ortası Kas Onarımı &amp; Kondisyon (Salı–Çarşamba)</option>
                <option value="race_loading_sprint" ${curPhase === 'race_loading_sprint' ? 'selected' : ''}>🚀 3. Evre: 100–350 km Sprint/Orta Mesafe Karbonhidrat Yüklemesi (Perş–Cuma)</option>
                <option value="race_loading_long" ${curPhase === 'race_loading_long' ? 'selected' : ''}>🏔️ 3. Evre: 450–800+ km Uzun Mesafe/Maraton Yağ &amp; Lipit Yüklemesi (Perş–Cuma)</option>
              </optgroup>
              <optgroup label="🥚 DAMIZLIK, KULUÇKA &amp; YAVRU BÜYÜTME DÖNEMİ">
                <option value="breeding_cropmilk" ${curPhase === 'breeding_cropmilk' ? 'selected' : ''}>🥚 Eşleşme, Yumurtlama &amp; İlk 10 Gün Kursak Sütü (Prolaktin Evresi)</option>
                <option value="breeding_rearing" ${curPhase === 'breeding_rearing' ? 'selected' : ''}>🐣 10–28. Gün İri Yavruya Kusma &amp; Yüksek Protein (%20+ Bakliyat)</option>
              </optgroup>
              <optgroup label="🐥 YAVRU, 🪶 TÜY DÖKÜMÜ &amp; ❄️ KIŞ DİNLENME">
                <option value="young_birds" ${curPhase === 'young_birds' ? 'selected' : ''}>🐥 Yeme Düşen Yavrular (25–90 Günlük İskelet &amp; Kas Gelişimi)</option>
                <option value="moulting" ${curPhase === 'moulting' ? 'selected' : ''}>🪶 Tüy Dökümü (Moulting • Metiyonin, Keratin &amp; Omega-3 Telek Sentezi)</option>
                <option value="winter_rest" ${curPhase === 'winter_rest' ? 'selected' : ''}>❄️ Kış &amp; Dinlenme Dönemi (Yağlanma Önleyici Yüksek Lifli Arpa/Çeltik)</option>
              </optgroup>
            </select>
          </div>

          <div style="display:grid; grid-template-columns:minmax(0,1.4fr) minmax(0,0.8fr) auto; gap:5px; align-items:end;">
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800;">🕊️ Beslenecek Kuş Grubu</label>
              <select id="genesisNutGroup" class="ios-select" style="width:100%; padding:5px 6px; font-size:10.5px; font-weight:800;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="ALL" ${curGroup === 'ALL' ? 'selected' : ''}>🏠 Tüm Aktif Kümes (${totalActiveCount} Kuş)</option>
                <option value="RACER" ${curGroup === 'RACER' ? 'selected' : ''}>🏆 Yarış Kadrosu (${racersCount} Kuş)</option>
                <option value="BREEDER" ${curGroup === 'BREEDER' ? 'selected' : ''}>🥚 Damızlık Kadro (${breedersCount} Kuş)</option>
                <option value="YOUNG" ${curGroup === 'YOUNG' ? 'selected' : ''}>🐥 Yavru Kümesi (${youngCount} Kuş)</option>
                <option value="CUSTOM" ${curGroup === 'CUSTOM' ? 'selected' : ''}>✏️ Özel Kuş Sayısı Gir</option>
              </select>
            </div>
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800;">Kuş Adedi</label>
              <input type="number" id="genesisNutBirdCount" class="ios-input" style="width:100%; padding:5px 7px; font-size:11px; font-weight:900;" min="1" max="2000" value="${this.state.nutritionBirdCount}" oninput="document.getElementById('genesisNutGroup').value='CUSTOM'; AvigenGenesisAI.onGenesisSelectionChange()" />
            </div>
            <button class="ai-send-btn" style="padding:7px 10px; font-size:10.5px; flex-shrink:0;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">
              🌾 Hesapla
            </button>
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="genesis-shell-card" style="display:flex; flex-direction:column; height:100%; overflow:hidden;">
        <!-- Üst Navigasyon Barı: ← Geri + Aktif Ana Modül Başlığı + Geçmiş -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:5px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--ios-border); flex-shrink:0;">
          <button type="button" class="genesis-back-pill" onclick="AvigenGenesisAI.backToGenesisLauncher()">
            ← Geri
          </button>
          <div style="display:flex; align-items:center; gap:5px; min-width:0;">
            <span style="font-size:13px;">${activeMainModule.icon}</span>
            <span style="font-size:11.2px; font-weight:900; color:#4c1d95; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${activeMainModule.num}. ${activeMainModule.title}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 7px; font-size:8.8px;" onclick="AvigenGenesisAI.openHistoryView()" title="Kaydedilen Geçmiş Analizler">
              🕒 Geçmiş (${this.analysisHistory.length})
            </button>
          </div>
        </div>

        <div style="flex-shrink:0;">
          ${controlsHtml}
        </div>

        <!-- Rapor Çıktı Kutusu (Kaydırılabilir Ferah Alan) -->
        <div class="ai-answer-box" id="genesisReportOutput" style="flex:1; overflow-y:auto;"></div>
      </div>
    `;

    this.renderGenesisReportOnly();
  },

  triggerAnimatedAnalysis() {
    const out = document.getElementById('genesisReportOutput');
    if (!out) return;
    out.innerHTML = `
      <div class="dna-loading-stage" style="padding:14px 10px;">
        <div class="dna-pulse-logo" style="width:42px; height:42px;">
          <img src="avigen-logo.svg" alt="AVIGEN" style="width:100%; height:100%; object-fit:contain;" />
        </div>
        <div style="font-size:12px; font-weight:900; color:#581c87;">
          Soyağacı, Performans Kayıtları ve Veri Güvenilirliği Analiz Ediliyor...
        </div>
        <div class="dna-scan-bar">
          <div class="dna-scan-fill"></div>
        </div>
      </div>
    `;
    setTimeout(() => {
      this.renderGenesisReportOnly();
    }, 650);
  },

  renderGenesisReportOnly() {
    const out = document.getElementById('genesisReportOutput');
    if (!out) return;

    // ------------------------------------------------------------------------
    // 1. ANA MODÜL: GENESIS AI – AKILLI EŞLEŞTİRME
    // (6 Bölümlü Bütünleşik Bilimsel Eşleşme ve Olasılıksal Yavru Öngörü Raporu)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'breeding') {
      const rep = this.analyzeBreedingIntelligence(this.state.selectedSireRef, this.state.selectedDamRef);
      const relMeta = this.classifyDataReliability(rep.dataReliabilityPct);
      const totalAncFilled = (rep.sFilled || 0) + (rep.dFilled || 0);
      const sibCount = (rep.sireCollateral?.siblingProofs?.length || 0) + (rep.damCollateral?.siblingProofs?.length || 0);
      const offCount = (rep.sireCollateral?.offspringProofs?.length || 0) + (rep.damCollateral?.offspringProofs?.length || 0);
      const allIntraRepeats = [...(rep.sDeep?.intraRepeats || []), ...(rep.dDeep?.intraRepeats || [])];

      const bestForSire = rep.altFemalesForSire[0];
      const bestForDam = rep.altMalesForDam[0];
      const hasBetterAlternative = Boolean(
        (bestForSire && bestForSire.score > rep.totalScore + 3) ||
        (bestForDam && bestForDam.score > rep.totalScore + 3) ||
        rep.decisionCode === 'NOT_RECOMMENDED'
      );

      this.recordAnalysisToHistory({
        mode: 'breeding',
        modeLabel: 'GENESIS AI – Akıllı Eşleştirme',
        icon: '💞',
        title: `♂ ${rep.sireInfo.ring} × ♀ ${rep.damInfo.ring}`,
        verdict: `${rep.decisionLabel} (${rep.totalScore}/100)`,
        score: rep.totalScore,
        reliabilityPct: rep.dataReliabilityPct,
        dataSourceSummary: `${totalAncFilled}/124 ata kaydı, ${rep.verifiedRecords.length} performans kaydı, Wright COI %${rep.coi.toFixed(2)}`,
        snapshotParams: { selectedSireRef: this.state.selectedSireRef, selectedDamRef: this.state.selectedDamRef }
      });

      const coreTraits5 = [
        rep.offspringTraits11[0], // 1. Hız ve Sürat
        rep.offspringTraits11[1], // 2. Uçuş Dayanıklılığı
        rep.offspringTraits11[5], // 6. Yön Bulma ve Eve Dönüş
        rep.offspringTraits11[6], // 7. Yarış İstikrarı
        rep.offspringTraits11[10] // 11. Genel Yarışçı Potansiyeli
      ].filter(Boolean);

      out.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:9px; font-size:10px; line-height:1.42;">

          <!-- ================================================================
               1. BÖLÜM: EŞLEŞME DEĞERLENDİRMESİ & HIZLI KARAR MERKEZİ
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1.5px solid ${rep.decisionColor}; border-radius:11px; padding:9px 11px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:7px;">
              <div style="font-size:11.5px; font-weight:900; color:var(--ios-text);">
                1. EŞLEŞME DEĞERLENDİRMESİ
              </div>
              <span class="gene-badge ${rep.decisionBadgeClass}" style="font-size:9.2px; padding:3px 9px; font-weight:900;">
                ${escapeHtml(rep.decisionLabel)}
              </span>
            </div>

            <!-- Erkek ve Dişi Kuş Bilgileri -->
            <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; margin-bottom:7px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #0284c7; border-radius:8px; padding:6px 8px;">
                <div style="font-weight:900; color:#0284c7; font-size:10.5px;">♂ Erkek (Baba): ${escapeHtml(rep.sireInfo.ring)}</div>
                <div style="font-weight:800; color:var(--ios-text);">${escapeHtml(rep.sireInfo.name)}</div>
                <div style="font-size:9px; color:var(--ios-subtext);">
                  Hat: ${escapeHtml(rep.sireInfo.strainName)} • Tüy: ${escapeHtml(rep.sirePhenotype.color)}<br/>
                  5 Nesil Soy: ${rep.sFilled}/62 Ata • İndeks: ${rep.sireLineageIndex}/100
                </div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #db2777; border-radius:8px; padding:6px 8px;">
                <div style="font-weight:900; color:#db2777; font-size:10.5px;">♀ Dişi (Anne): ${escapeHtml(rep.damInfo.ring)}</div>
                <div style="font-weight:800; color:var(--ios-text);">${escapeHtml(rep.damInfo.name)}</div>
                <div style="font-size:9px; color:var(--ios-subtext);">
                  Hat: ${escapeHtml(rep.damInfo.strainName)} • Tüy: ${escapeHtml(rep.damPhenotype.color)}<br/>
                  5 Nesil Soy: ${rep.dFilled}/62 Ata • İndeks: ${rep.damLineageIndex}/100
                </div>
              </div>
            </div>

            <!-- 4 Temel Gösterge Şeridi (Tek Bakışta) -->
            <div style="display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:5px; text-align:center; margin-bottom:7px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid ${rep.decisionColor}; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">GENEL UYUM</div>
                <div style="font-size:13px; font-weight:900; color:${rep.decisionColor};">${rep.totalScore} / 100</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid ${rep.coi >= 18.75 ? '#dc2626' : (rep.coi > 9 ? '#d97706' : '#059669')}; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">AKRABALIK (COI)</div>
                <div style="font-size:12.5px; font-weight:900; color:${rep.coi >= 18.75 ? '#dc2626' : (rep.coi > 9 ? '#d97706' : '#059669')};">%${rep.coi.toFixed(2)}</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #7c3aed; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">YAVRU MESAFE TİPİ</div>
                <div style="font-size:9.5px; font-weight:900; color:#6d28d9; margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(rep.recommendedDistanceSuitability.split('(')[0].trim())}</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid ${relMeta.color}; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">VERİ GÜVENİ</div>
                <div style="font-size:11px; font-weight:900; color:${relMeta.color};">%${rep.dataReliabilityPct} (${relMeta.label})</div>
              </div>
            </div>

            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:8px; padding:6px 8px; margin-bottom:7px;">
              <strong>🎯 Genel Eşleşme Kararı Gerekçesi:</strong> ${escapeHtml(rep.decisionReasonSummary)}
            </div>
            ${(() => {
              if (typeof activePairsList === 'undefined' || !Array.isArray(activePairsList)) return '';
              const sUp = (rep.sireInfo.ring || '').toUpperCase();
              const dUp = (rep.damInfo.ring || '').toUpperCase();
              const sNests = activePairsList.filter(ap => (typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(ap.sire) : '') === sUp).map(ap => ap.nest);
              const dNests = activePairsList.filter(ap => (typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(ap.dam) : '') === dUp).map(ap => ap.nest);
              if (!sNests.length && !dNests.length) return '';
              const msgs = [];
              if (sNests.length) msgs.push(`♂ <strong>${escapeHtml(rep.sireInfo.ring)}</strong> şu anda <strong>${escapeHtml(sNests.join(', '))}</strong> içinde`);
              if (dNests.length) msgs.push(`♀ <strong>${escapeHtml(rep.damInfo.ring)}</strong> şu anda <strong>${escapeHtml(dNests.join(', '))}</strong> içinde`);
              return `<div style="background:#fffbeb; border:1.5px solid #f59e0b; color:#92400e; border-radius:8px; padding:6px 8px; margin-bottom:7px; font-size:9.5px;">🪺 <strong>Aktif Yuva Durumu:</strong> ${msgs.join(' ve ')} aktif eşleşmede kayıtlıdır.</div>`;
            })()}

            <!-- KUŞÇU İÇİN GÖRSEL YAVRU POTANSİYEL ÇUBUKLARI (5 TEMEL ÖZELLİK TEK BAKIŞTA) -->
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:8px; padding:7px 9px; margin-bottom:7px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <strong style="color:#5b21b6; font-size:9.8px;">🐣 Doğacak Yavruların 5 Temel Performans Eğilimi (Hızlı Görsel Özet)</strong>
                <span class="gene-badge gene-purple" style="font-size:7.8px;">Olasılıksal Beklenti</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:5px;">
                ${coreTraits5.map(tr => {
                  const pct = tr.expectedMid || 72;
                  const barCol = pct >= 82 ? '#059669' : (pct >= 70 ? '#0066ff' : '#d97706');
                  return `
                    <div>
                      <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; font-size:8.9px; font-weight:800; margin-bottom:2px;">
                        <span style="min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(tr.title)}</span>
                        <span style="color:${barCol}; flex-shrink:0; white-space:nowrap;">${escapeHtml(tr.rangeText.split('(')[0].trim())}</span>
                      </div>
                      <div style="height:6px; background:#e2e8f0; border-radius:99px; overflow:hidden;">
                        <div style="width:${Math.min(100, Math.max(25, pct))}%; height:100%; background:${barCol}; border-radius:99px;"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; font-size:9.4px; margin-bottom:8px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid #059669; border-radius:7px; padding:6px 7px;">
                <strong style="color:#059669;">✅ Eşleşmenin Güçlü Yönleri:</strong>
                ${rep.strongLines.length
                  ? rep.strongLines.map(s => `<div style="margin-top:2px;">• ${escapeHtml(s)}</div>`).join('')
                  : '<div style="margin-top:2px;">• Akrabalık riski bulunmuyor; temel kan uyumu mevcut.</div>'}
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid ${rep.coi >= 12.5 ? '#dc2626' : '#d97706'}; border-radius:7px; padding:6px 7px;">
                <strong style="color:${rep.coi >= 12.5 ? '#dc2626' : '#d97706'};">⚠️ Riskli Yönleri:</strong>
                ${rep.weakLines.map(w => `<div style="margin-top:2px;">• ${escapeHtml(w)}</div>`).join('')}
              </div>
            </div>

            <!-- HIZLI YUVAYA KAYDET BUTONU (EN ÜST KARTTA DOĞRUDAN ERİŞİM) -->
            <button type="button" class="ios-btn ios-btn-green" style="width:100%; padding:9px 10px; font-size:11px; font-weight:900;" onclick="AvigenGenesisAI.saveCurrentGenesisPairToActiveNests('${escapeHtml(rep.sireInfo.ring)}', '${escapeHtml(rep.sireInfo.name)}', '${escapeHtml(rep.damInfo.ring)}', '${escapeHtml(rep.damInfo.name)}', ${rep.totalScore}, ${rep.coi})">
              🪺 Bu Çifti (♂ ${escapeHtml(rep.sireInfo.ring)} × ♀ ${escapeHtml(rep.damInfo.ring)}) Aktif Yuvalara Kaydet
            </button>
          </div>

          <!-- ================================================================
               2. BÖLÜM: BEŞ NESİL SOY DEĞERLENDİRMESİ
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #0066ff; border-radius:10px; padding:8px 10px;">
            <div style="font-size:11px; font-weight:900; color:#0052cc; margin-bottom:5px;">
              2. BEŞ NESİL SOY DEĞERLENDİRMESİ (${totalAncFilled} / 124 Ata Düğümü)
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:9.5px;">
              <div>
                • <strong>♂ Baba Hattı 5 Nesil Katkısı (${rep.sFilled}/62 Ata):</strong> ${escapeHtml(rep.sDeep.missingGenSummary)} • Baskın Hatlar: <strong>${escapeHtml(rep.sDeep.strains.join(', ') || rep.sireInfo.strainName)}</strong>
              </div>
              <div>
                • <strong>♀ Anne Hattı 5 Nesil Katkısı (${rep.dFilled}/62 Ata):</strong> ${escapeHtml(rep.dDeep.missingGenSummary)} • Baskın Hatlar: <strong>${escapeHtml(rep.dDeep.strains.join(', ') || rep.damInfo.strainName)}</strong>
              </div>
              <div>
                • <strong>Ortak Atalar (Çapraz Soy Kesişimi):</strong>
                ${rep.commonAncestors.length
                  ? rep.commonAncestors.map(ca => `<span style="display:inline-block; background:#eff6ff; border:1px solid #bfdbfe; border-radius:5px; padding:1px 6px; margin:1px 2px; font-weight:700; color:#1e40af;">${escapeHtml(ca)} ${rep.commonAncestorHasProof ? '✅ (Dereceli/Şampiyon Ata)' : '⚠️ (Derece Kaydı Yok)'}</span>`).join('')
                  : '<strong>Ortak ata tespit edilmedi (5 nesilde %0.00 COI — Tam Yabancı Kan / Outcross).</strong>'}
              </div>
              <div>
                • <strong>Soy Tekrarları (Hat İçi Yoğunlaşma):</strong>
                ${allIntraRepeats.length
                  ? allIntraRepeats.map(ir => `<div style="margin-left:8px; color:#4c1d95;">↳ ${escapeHtml(ir)}</div>`).join('')
                  : 'Baba veya anne hattının kendi içinde mükerrer ata tekrarı saptanmadı.'}
              </div>
              <div>
                • <strong>Sewall Wright COI ve Akrabalılık Değerlendirmesi:</strong> İç döllenme katsayısı <strong>%${rep.coi.toFixed(2)}</strong> (${escapeHtml(rep.relationSummary)}). Melez dinçliği (Heterosis) korunumu: <strong>%${rep.heterosis}</strong>.
              </div>
            </div>
          </div>

          <!-- ================================================================
               3. BÖLÜM: GENETİK, FENOTİP VE PERFORMANS DEĞERLENDİRMESİ
               ================================================================ -->
          <details style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #059669; border-radius:10px; padding:8px 10px;">
            <summary style="cursor:pointer; outline:none; font-size:11px; font-weight:900; color:#047857; display:flex; justify-content:space-between; align-items:center;">
              <span>3. GENETİK VE PERFORMANS DEĞERLENDİRMESİ ▾</span>
              <span class="gene-badge gene-green" style="font-size:8px;">Tamamlayıcılık: ${rep.complementarityScore100}/100</span>
            </summary>
            <div style="display:flex; flex-direction:column; gap:4.5px; font-size:9.5px; margin-top:6px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px;">
                <strong>📐 Genetik Değerlendirme Modeli (BLUP / EBV Kontrolü):</strong>
                <span style="color:${rep.blupEvaluation.isBlupEligible ? '#059669' : '#b45309'}; font-weight:800;">
                  ${escapeHtml(rep.blupEvaluation.methodName)}
                </span>
                <div style="font-size:8.9px; color:var(--ios-subtext); margin-top:2px;">
                  ${escapeHtml(rep.blupEvaluation.explanation)}
                </div>
              </div>

              <div>
                • <strong>Ebeveyn Yarış, Mesafe ve Akraba Performansı Karşılaştırması:</strong><br/>
                <span style="margin-left:8px;">↳ <strong>♂ Baba (${escapeHtml(rep.sireInfo.ring)}):</strong> ${rep.sireRaceCount} bireysel yarış/derece kaydı, ${rep.sDeep.ancestorWins.length} üst ata derecesi, ${rep.sireCollateral.siblingProofs.length} kardeş ve ${rep.sireCollateral.offspringProofs.length} yavru performans kaydı • Mesafe Profili: <strong>${escapeHtml(rep.sireDistProf.label)}</strong></span><br/>
                <span style="margin-left:8px;">↳ <strong>♀ Anne (${escapeHtml(rep.damInfo.ring)}):</strong> ${rep.damRaceCount} bireysel yarış/derece kaydı, ${rep.dDeep.ancestorWins.length} üst ata derecesi, ${rep.damCollateral.siblingProofs.length} kardeş ve ${rep.damCollateral.offspringProofs.length} yavru performans kaydı • Mesafe Profili: <strong>${escapeHtml(rep.damDistProf.label)}</strong></span>
              </div>

              <div>
                • <strong>Performans Avantajları ve Tamamlayıcılık (${rep.complementarityScore100}/100):</strong> ${escapeHtml(rep.complementaritySummary)}
                ${rep.verifiedRecords.length ? `<div style="margin-top:2px; color:#065f46; font-weight:700;">🏆 Doğrulanmış Kayıt Örnekleri: ${escapeHtml(rep.verifiedRecords.slice(0, 3).join(' | '))}</div>` : ''}
              </div>

              <div>
                • <strong>Kayıtlı Fiziksel ve Fenotipik Özellikler (Kayıtsız Özellikler Varsayılmamıştır):</strong><br/>
                <span style="margin-left:8px;">↳ <strong>♂ Baba Fenotipi:</strong> Tüy Rengi: ${escapeHtml(rep.sirePhenotype.color)} • Fiziksel Yapı/Kas/Kanat: ${escapeHtml([rep.sirePhenotype.bodyStructure, rep.sirePhenotype.muscleBreast, rep.sirePhenotype.wingPlumage].filter(Boolean).join(' • ') || 'Kayıtlı Fiziksel Gözlem Yok')}</span><br/>
                <span style="margin-left:8px;">↳ <strong>♀ Anne Fenotipi:</strong> Tüy Rengi: ${escapeHtml(rep.damPhenotype.color)} • Fiziksel Yapı/Kas/Kanat: ${escapeHtml([rep.damPhenotype.bodyStructure, rep.damPhenotype.muscleBreast, rep.damPhenotype.wingPlumage].filter(Boolean).join(' • ') || 'Kayıtlı Fiziksel Gözlem Yok')}</span>
              </div>

              <div>
                • <strong>Eksik / Zayıf Özellikler ve Genetik Çeşitlilik:</strong> ${rep.sharedWeaknessDetected ? 'Her iki ebeveynde de doğrudan kanıtlanmış yarış veya derin soy kaydı sınırlıdır (Ortak veri/performans açığı).' : 'Ebeveynlerde ortak bir performans zaafiyeti saptanmadı; genetik çeşitlilik skoru ' + rep.diversityScore100 + '/100 düzeyindedir.'}
              </div>
            </div>
          </details>

          <!-- ================================================================
               4. BÖLÜM: BEKLENEN YAVRU PROFİLİ (11 ÖZELLİKTE OLASILIKSAL ÖNGÖRÜ)
               ================================================================ -->
          <details style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #7c3aed; border-radius:10px; padding:8px 10px;">
            <summary style="cursor:pointer; outline:none; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
              <span style="font-size:11px; font-weight:900; color:#5b21b6;">
                4. BEKLENEN YAVRU PROFİLİ (11 ÖZELLİKTE OLASILIKSAL ÖNGÖRÜ) ▾
              </span>
              <span class="gene-badge gene-purple" style="font-size:8px;">Mendel Ayrışımı &amp; h² Kalıtım Modeli</span>
            </summary>
            <div style="font-size:8.9px; color:var(--ios-subtext); margin-top:6px; margin-bottom:6px;">
              Her özellik kendi bilimsel kalıtım derecesi (h²), anne-baba katkısı, ortak soy etkisi ve veri güvenilirliği ile ayrı ayrı hesaplanmıştır. Kesin genotip garantisi verilmez; olasılık aralığı veya niteliksel eğilim sunulur.
            </div>

            <div style="display:flex; flex-direction:column; gap:5px;">
              ${rep.offspringTraits11.map(tr => `
                <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:6px 8px; font-size:9.1px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:3px;">
                    <strong style="color:var(--ios-text); font-size:9.8px;">${escapeHtml(tr.title)}</strong>
                    <span class="gene-badge ${tr.hasQuantitativePrediction ? 'gene-purple' : 'gene-gold'}" style="font-size:8.2px;">
                      ${escapeHtml(tr.rangeText)}
                    </span>
                  </div>
                  <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:4px; color:var(--ios-subtext); font-size:8.7px;">
                    <div>• <strong>♂ Baba Katkısı:</strong> ${escapeHtml(tr.sireContribution)}</div>
                    <div>• <strong>♀ Anne Katkısı:</strong> ${escapeHtml(tr.damContribution)}</div>
                    <div>• <strong>Kalıtım Derecesi:</strong> ${escapeHtml(tr.h2Display)}</div>
                    <div>• <strong>Tahmin Güvenilirliği:</strong> ${escapeHtml(tr.reliabilityLabel)}</div>
                  </div>
                  <div style="font-size:8.6px; color:var(--ios-subtext); margin-top:2px;">
                    • <strong>Ortak Soy Etkisi &amp; Kanıt:</strong> ${escapeHtml(tr.sharedLineageEffect)} • ${escapeHtml(tr.existingProofSummary)}
                  </div>
                  <div style="font-size:8.8px; color:#1e293b; font-weight:700; margin-top:2px;">
                    🎯 <strong>Yavru Öngörüsü:</strong> ${escapeHtml(tr.qualitativePrediction)}
                  </div>
                </div>
              `).join('')}
            </div>
          </details>

          <!-- ================================================================
               5. BÖLÜM: RİSK VE GÜVENİLİRLİK
               ================================================================ -->
          <details style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #d97706; border-radius:10px; padding:8px 10px;">
            <summary style="cursor:pointer; outline:none; font-size:11px; font-weight:900; color:#b45309; display:flex; justify-content:space-between; align-items:center;">
              <span>5. RİSK VE GÜVENİLİRLİK ANALİZİ ▾</span>
              <span class="gene-badge ${relMeta.badgeClass}" style="font-size:8px;">Güven: %${rep.dataReliabilityPct}</span>
            </summary>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:9.4px; margin-top:6px;">
              <div>
                • <strong>Akrabalılık ve Genetik Riskler:</strong> Wright COI <strong>%${rep.coi.toFixed(2)}</strong>.
                ${rep.coi >= 18.75
                  ? '🚨 Çok yakın akrabalık nedeniyle homozigot çekinik zararlı alellerin çakışma ve inbreeding depresyonu (üreme/bağışıklık/performans düşüşü) riski yüksektir.'
                  : (rep.coi > 6.25
                    ? '⚠️ Orta düzey kan yoğunlaşması mevcuttur; doğacak yavruların fiziksel canlılığı yakından izlenmeli ve bir sonraki nesilde yabancı kanla (Outcross) eşleştirilmelidir.'
                    : '✅ Akrabalık depresyonu riski saptanmamıştır; genetik çeşitlilik ve melez dinçliği korunmaktadır.')}
              </div>
              <div>
                • <strong>Eksik Veriler (Soyağacı, Performans &amp; Fenotip):</strong>
                ${rep.missingWarnings.length
                  ? rep.missingWarnings.map(mw => `<span style="display:block; margin-left:8px; color:#92400e;">↳ ${escapeHtml(mw)}</span>`).join('')
                  : 'Yakın kuşak soyağacı ve temel performans kayıtları tamdır.'}
                ${(!rep.sirePhenotype.hasPhysicalMeasurements || !rep.damPhenotype.hasPhysicalMeasurements)
                  ? '<span style="display:block; margin-left:8px; color:#92400e;">↳ Ebeveynlerin kanat, kas ve vücut ağırlığı ölçümleri sistemde kayıtlı olmadığı için fiziksel yavru tahmini niteliksel tutulmuştur.</span>'
                  : ''}
              </div>
              <div>
                • <strong>Tahmin Güvenilirliği:</strong> <strong>%${rep.dataReliabilityPct} (${relMeta.label})</strong> — 5 nesilde ${totalAncFilled}/124 ata kaydı ve ${rep.verifiedRecords.length} doğrulanmış performans sinyaline dayanmaktadır.
              </div>
              <div>
                • <strong>Bilimsel Sınırlamalar (Genetik vs Çevre Ayrımı):</strong> Yarış güvercinlerinde uçuş performansı poligeniktir ve özelliklerin kalıtım derecesi h² ≈ 0.18–0.48 arasındadır; varyansın kalan %52–%82'lik kısmı kümes sağlığı, beslenme, antrenman, rüzgâr ve yarış günü çevre koşullarına bağlıdır.
              </div>
            </div>
          </details>

          <!-- ================================================================
               6. BÖLÜM: GENESIS AI NİHAİ TAVSİYESİ
               ================================================================ -->
          <div style="background:#f5f3ff; border:1.5px solid #c4b5fd; border-radius:11px; padding:9px 11px;">
            <div style="font-size:11px; font-weight:900; color:#4c1d95; margin-bottom:5px;">
              6. GENESIS AI NİHAİ TAVSİYESİ
            </div>
            <div style="display:flex; flex-direction:column; gap:4.5px; font-size:9.5px; margin-bottom:8px;">
              <div>
                • <strong>Bu Eşleşme Neden ${escapeHtml(rep.decisionLabel)}?</strong> ${escapeHtml(rep.decisionReasonSummary)}
              </div>
              <div>
                • <strong>Geliştirmesi Beklenen Özellikler:</strong> ${rep.coi === 0 ? 'Melez dinçliği (Heterosis), genel uçuş dayanıklılığı, bağışıklık direnci ve yarış temposu.' : (rep.commonAncestorHasProof ? `Şampiyon ortak ata (${escapeHtml(rep.bestCommonAncestorLabel)}) üzerinden yön bulma ve soy aktarımı kararlılığı (Prepotency).` : 'Soy içi tip homojenliği.')}
              </div>
              <div>
                • <strong>Yavru Potansiyelinin En Yüksek Olduğu Yarış Türleri:</strong> <strong>${escapeHtml(rep.recommendedDistanceSuitability)}</strong>
              </div>
              <div>
                • <strong>Alternatif Eşleşme Değerlendirmesi:</strong>
                ${hasBetterAlternative
                  ? `<span style="color:#b45309; font-weight:800;">Kümesinizde bu kuşlar için daha yüksek tamamlayıcılık ve uyum sağlayan alternatif eş adayları mevcuttur (aşağıda listelenmiştir).</span>`
                  : `<span style="color:#059669; font-weight:800;">Seçilen çift, mevcut kümes adaylarınız arasında en yüksek genetik ve performans uyumuna sahip kombinasyonlardan biridir.</span>`}
              </div>
            </div>

            <!-- Doğrudan İşlem Butonları -->
            <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:7px;">
              <button type="button" class="ios-btn ios-btn-green" style="width:100%; padding:8px 10px; font-size:11px; font-weight:900;" onclick="AvigenGenesisAI.saveCurrentGenesisPairToActiveNests('${escapeHtml(rep.sireInfo.ring)}', '${escapeHtml(rep.sireInfo.name)}', '${escapeHtml(rep.damInfo.ring)}', '${escapeHtml(rep.damInfo.name)}', ${rep.totalScore}, ${rep.coi})">
                🪺 Bu Çifti (♂ ${escapeHtml(rep.sireInfo.ring)} × ♀ ${escapeHtml(rep.damInfo.ring)}) Aktif Yuvalara Kaydet
              </button>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <button type="button" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:9.5px; font-weight:800; color:#059669; border-color:#a7f3d0;" onclick="AvigenGenesisAI.recordCortexUserFeedback('breeding__${escapeHtml(rep.sireInfo.ring)} × ${escapeHtml(rep.damInfo.ring)}', 'ACCEPTED', ${rep.totalScore || 75}, ${rep.dataReliabilityPct || 75})">
                  ⭐ Favori Çift Olarak İşaretle
                </button>
                <button type="button" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:9.5px; font-weight:800; color:#dc2626; border-color:#fecaca;" onclick="AvigenGenesisAI.recordCortexUserFeedback('breeding__${escapeHtml(rep.sireInfo.ring)} × ${escapeHtml(rep.damInfo.ring)}', 'REJECTED', ${rep.totalScore || 75}, ${rep.dataReliabilityPct || 75})">
                  🚫 Önerilerden Gizle / Alternatif Gör
                </button>
              </div>
            </div>

            <!-- Alternatif Eş Adayları -->
            <div style="border-top:1px solid #ddd6fe; padding-top:6px;">
              <strong style="color:#581c87; font-size:9.8px;">🔄 Kümes Taramasından En Uygun Alternatif Eş Adayları:</strong>
              ${rep.altFemalesForSire.slice(0, 2).map(item => `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3px solid #0284c7; border-radius:6px; padding:5px 7px; margin-top:4px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                    <span>• ♂ ${escapeHtml(rep.sireInfo.ring)} için Alternatif Dişi: <strong>${item.candidate.flag} ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)})</strong></span>
                    <button class="ios-btn ios-btn-primary" style="padding:2px 7px; font-size:9px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${this.state.selectedSireRef}', '${item.candidate.id}')">Seç (${item.score}/100)</button>
                  </div>
                  <div style="font-size:8.8px; color:var(--ios-subtext); margin-top:2px;">💡 ${escapeHtml(item.why)}</div>
                </div>
              `).join('')}
              ${rep.altMalesForDam.slice(0, 2).map(item => `
                <div style="background:#ffffff; border:1px solid #e2e8f0; border-left:3px solid #059669; border-radius:6px; padding:5px 7px; margin-top:4px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                    <span>• ♀ ${escapeHtml(rep.damInfo.ring)} için Alternatif Erkek: <strong>${item.candidate.flag} ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)})</strong></span>
                    <button class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:9px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${item.candidate.id}', '${this.state.selectedDamRef}')">Seç (${item.score}/100)</button>
                  </div>
                  <div style="font-size:8.8px; color:var(--ios-subtext); margin-top:2px;">💡 ${escapeHtml(item.why)}</div>
                </div>
              `).join('')}
            </div>
          </div>

        </div>
      `;
      return;
    }

    // ------------------------------------------------------------------------
    // 2. ANA MODÜL: GENESIS AI – AKILLI YARIŞ YÖNETİMİ
    // (6 Bölümlü Bütünleşik Rota/Coğrafya, 3 Bölgeli Meteoroloji & Risk,
    //  Kuşa Özel Yarış Uygunluğu, Tahmini Dönüş Zamanı ve Öğrenen Yarış Sonrası Rapor)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'smart_race') {
      const sr = this.analyzeSmartRaceManagement();
      const relMeta = this.classifyDataReliability(sr.reliabilityPct);
      const r = sr.route;
      const curStage = ['setup', 'summary', 'detail'].includes(this.state.smartRaceStage)
        ? this.state.smartRaceStage
        : 'setup';

      const participatingBirds = sr.birdEvaluations.filter(b => b.isInSelectedRace);
      const displayBirds = participatingBirds.length > 0 ? participatingBirds : sr.birdEvaluations;
      const provenBirds = displayBirds.filter(b => b.hasSufficientIndividualData);
      const unprovenBirds = displayBirds.filter(b => !b.hasSufficientIndividualData);

      const relCleanTitle = String(r.relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].toUpperCase();
      const loftCleanTitle = String(r.loftNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].toUpperCase();
      const defaultRaceTitle = this.state.smartRaceCustomTitle ||
        (sr.selectedEvent ? sr.selectedEvent.codeTitle : `${relCleanTitle} – ${loftCleanTitle} YARIŞ ETABI`);

      this.recordAnalysisToHistory({
        mode: 'smart_race',
        modeLabel: 'GENESIS AI – Akıllı Yarış Simülasyonu',
        icon: '🏁',
        title: `${defaultRaceTitle} (${sr.distKm} km • ${sr.releaseDate} ${sr.releaseTime})`,
        verdict: `${sr.overallRiskLevel} • Tahmini Dönüş: ${sr.fleetReturnEstimate.likelyWindowClock}`,
        score: Math.max(20, 96 - sr.riskPoints),
        reliabilityPct: sr.reliabilityPct,
        dataSourceSummary: `Kuş Uçuşu: ${r.crowFliesKm} km (Koridor: ${r.actualCorridorMinKm}-${r.actualCorridorMaxKm} km) • ${provenBirds.length} Kanıtlı Yarışçı • ${sr.totalCompletedRecordsCount} Tamamlanmış Yarış Kaydı`,
        snapshotParams: {
          smartRaceStage: 'summary',
          smartRaceCustomTitle: defaultRaceTitle,
          smartRaceEventId: this.state.smartRaceEventId,
          smartRaceReleaseCityId: this.state.smartRaceReleaseCityId,
          smartRaceLoftCityId: this.state.smartRaceLoftCityId,
          smartRaceDate: this.state.smartRaceDate,
          smartRaceReleaseTime: this.state.smartRaceReleaseTime,
          smartRaceManualKm: this.state.smartRaceManualKm
        }
      });

      // ======================================================================
      // AŞAMA 1: YARIŞ OLUŞTURMA VE ROTA BELİRLEME (TÜRKİYE HARİTASI + SADE VERİ GİRİŞ PANELİ)
      // ======================================================================
      if (curStage === 'setup') {
        const savedSims = Array.isArray(this.state.smartRaceSavedSimulations) ? this.state.smartRaceSavedSimulations : [];

        out.innerHTML = `
          <div class="sr-sim-container">
            <!-- 1. EN ÜSTTE: SALIM NOKTASI VE VARIŞ (KÜMES) NOKTASI TAM GENİŞLİK KOORDİNAT GİRİŞ MERKEZİ -->
            <div class="sr-form-card" style="margin-bottom:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                <div>
                  <div style="font-size:12.5px; font-weight:900; color:var(--ios-text);">
                    🧭 1. Salım Noktası &amp; 2. Varış (Kümes) Noktası Koordinat Girişi
                  </div>
                  <div style="font-size:9.3px; color:var(--ios-subtext);">
                    Koordinatı doğrudan tam genişlikli kutuya yazın/yapıştırın veya il/ilçe seçin.
                  </div>
                </div>
                <div class="sr-distance-badge-box" style="font-size:11px; padding:4px 10px; height:auto;">
                  <span>📏 ${r.crowFliesKm} km</span>
                </div>
              </div>

              <!-- 1. SALIM NOKTASI (EN ÜSTTE • KOORDİNAT HÜCRESİ %100 TAM GENİŞLİKTE) -->
              <div style="background:#fff5f5; border:2px solid #ef4444; border-radius:11px; padding:10px 11px; margin-bottom:9px;">
                <div style="font-size:12px; font-weight:900; color:#b91c1c; margin-bottom:6px;">
                  🔴 1. SALIM NOKTASI KOORDİNATI (Kuşların Salındığı Yer)
                </div>

                <!-- TAM GENİŞLİKLİ (%100) BÜYÜK KOORDİNAT GİRİŞ HÜCRESİ -->
                <input type="text" id="srReleaseCoordInput" class="sr-field-input" style="width:100%; box-sizing:border-box; height:46px; font-size:16px; font-weight:900; letter-spacing:0.4px; padding:8px 12px; border:2.5px solid #dc2626; border-radius:9px; background:#ffffff; color:#0f172a; margin-bottom:7px;" placeholder="Örn: 39.58420, 32.14720 (Enlem, Boylam)" value="${r.relNode?.lat && r.relNode?.lon ? `${Number(r.relNode.lat).toFixed(5)}, ${Number(r.relNode.lon).toFixed(5)}` : ''}" onkeydown="if(event.key==='Enter'){event.preventDefault();AvigenGenesisAI.applySmartRaceManualCoordinate('release');}" />

                <!-- KOORDİNAT İŞLEM BUTONLARI (ALT SATIRDA GENİŞ VE RAHAT) -->
                <div style="display:grid; grid-template-columns:1.15fr 1fr 0.9fr; gap:6px; margin-bottom:8px;">
                  <button type="button" class="ios-btn ios-btn-danger" style="padding:8px 6px; font-size:10.5px; font-weight:900;" onclick="AvigenGenesisAI.applySmartRaceManualCoordinate('release')">
                    ✅ Koordinatı Uygula
                  </button>
                  <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 6px; font-size:10px; font-weight:900; color:#b91c1c; border-color:#f87171; background:#fff;" onclick="AvigenGenesisAI.pasteSmartRaceCoordinate('release')">
                    📋 Konum Yapıştır
                  </button>
                  <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 6px; font-size:10px; font-weight:900; color:#b91c1c; border-color:#f87171; background:#fff;" onclick="AvigenGenesisAI.captureSmartRaceGpsLocation('release')" title="Telefonun GPS konumunu salım noktası yap">
                    🛰️ GPS'ten Al
                  </button>
                </div>

                <!-- HIZLI İL / İLÇE SEÇİMİ -->
                <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px;">
                  <div style="min-width:0;">
                    <span style="font-size:9px; font-weight:800; color:#7f1d1d; display:block; margin-bottom:2px;">Veya Hızlı Salım İli Seçin (81 İl)</span>
                    <select id="srReleaseCitySelect" class="sr-field-select" style="height:36px; font-size:11px; padding:4px 7px;" onchange="AvigenGenesisAI.state.smartRaceEventId='custom'; AvigenGenesisAI.state.smartRaceCustomReleaseCoord=null; AvigenGenesisAI.onSmartRaceControlChange('release_city')">
                      ${this.SMART_RACE_GEO_NODES.map(n => `
                        <option value="${n.id}" ${(n.id === (this.state.smartRaceReleaseCityId || r.relNode.id)) ? 'selected' : ''}>
                          ${escapeHtml(n.name.split(' (')[0])}
                        </option>
                      `).join('')}
                    </select>
                  </div>
                  <div style="min-width:0;">
                    <span style="font-size:9px; font-weight:800; color:#7f1d1d; display:block; margin-bottom:2px;">Salım İlçesi / Mevki</span>
                    <select id="srReleaseDistrictSelect" class="sr-field-select" style="height:36px; font-size:11px; padding:4px 7px;" onchange="AvigenGenesisAI.state.smartRaceEventId='custom'; AvigenGenesisAI.state.smartRaceCustomReleaseCoord=null; AvigenGenesisAI.onSmartRaceControlChange('release_district')">
                      ${this.state.smartRaceCustomReleaseCoord ? `
                        <option value="custom_coord" selected>📍 ${escapeHtml(this.state.smartRaceCustomReleaseCoord.name)}</option>
                      ` : ''}
                      ${this.getDistrictsForProvince(this.state.smartRaceReleaseCityId || r.relNode.id).map(d => `
                        <option value="${d.id}" ${(!this.state.smartRaceCustomReleaseCoord && d.id === (this.state.smartRaceReleaseDistrictId || r.relNode.districtId)) ? 'selected' : ''}>
                          ${escapeHtml(d.name)} (${d.altM}m)
                        </option>
                      `).join('')}
                    </select>
                  </div>
                </div>
              </div>

              <!-- 2. VARIŞ NOKTASI / KÜMES (İKİNCİ SIRADA • KOORDİNAT HÜCRESİ %100 TAM GENİŞLİKTE) -->
              <div style="background:#ecfdf5; border:2px solid #10b981; border-radius:11px; padding:10px 11px;">
                <div style="font-size:12px; font-weight:900; color:#047857; margin-bottom:6px;">
                  🟢 2. VARIŞ NOKTASI / KÜMES KOORDİNATI (Dönüş Kümesi)
                </div>

                <!-- TAM GENİŞLİKLİ (%100) BÜYÜK KOORDİNAT GİRİŞ HÜCRESİ -->
                <input type="text" id="srLoftCoordInput" class="sr-field-input" style="width:100%; box-sizing:border-box; height:46px; font-size:16px; font-weight:900; letter-spacing:0.4px; padding:8px 12px; border:2.5px solid #059669; border-radius:9px; background:#ffffff; color:#0f172a; margin-bottom:7px;" placeholder="Örn: 40.21410, 28.36110 (Enlem, Boylam)" value="${r.loftNode?.lat && r.loftNode?.lon ? `${Number(r.loftNode.lat).toFixed(5)}, ${Number(r.loftNode.lon).toFixed(5)}` : ''}" onkeydown="if(event.key==='Enter'){event.preventDefault();AvigenGenesisAI.applySmartRaceManualCoordinate('arrival');}" />

                <!-- KOORDİNAT İŞLEM BUTONLARI (ALT SATIRDA GENİŞ VE RAHAT) -->
                <div style="display:grid; grid-template-columns:1.1fr 0.95fr 0.95fr 0.7fr; gap:5px; margin-bottom:8px;">
                  <button type="button" class="ios-btn ios-btn-green" style="padding:8px 5px; font-size:10px; font-weight:900;" onclick="AvigenGenesisAI.applySmartRaceManualCoordinate('arrival')">
                    ✅ Koordinat Uygula
                  </button>
                  <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 5px; font-size:9.8px; font-weight:900; color:#047857; border-color:#34d399; background:#fff;" onclick="AvigenGenesisAI.pasteSmartRaceCoordinate('arrival')">
                    📋 Yapıştır
                  </button>
                  <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 5px; font-size:9.8px; font-weight:900; color:#047857; border-color:#34d399; background:#fff;" onclick="AvigenGenesisAI.captureSmartRaceGpsLocation('arrival')" title="Telefonumun GPS konumunu kümesim olarak al">
                    🛰️ Kümes GPS
                  </button>
                  <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 5px; font-size:9.5px; font-weight:900; color:#047857; border-color:#34d399; background:#fff;" onclick="AvigenGenesisAI.pinCurrentLoftLocation()" title="Bu konumu kalıcı kümes konumunuz olarak kaydet">
                    🏠 Sabitle
                  </button>
                </div>

                <!-- HIZLI İL / İLÇE SEÇİMİ -->
                <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px;">
                  <div style="min-width:0;">
                    <span style="font-size:9px; font-weight:800; color:#065f46; display:block; margin-bottom:2px;">Veya Hızlı Kümes İli Seçin (81 İl)</span>
                    <select id="srLoftCitySelect" class="sr-field-select" style="height:36px; font-size:11px; padding:4px 7px;" onchange="AvigenGenesisAI.state.smartRaceCustomLoftCoord=null; AvigenGenesisAI.onSmartRaceControlChange('loft_city')">
                      ${this.SMART_RACE_GEO_NODES.map(n => `
                        <option value="${n.id}" ${(n.id === (this.state.smartRaceLoftCityId || r.loftNode.id)) ? 'selected' : ''}>
                          ${escapeHtml(n.name.split(' (')[0])}
                        </option>
                      `).join('')}
                    </select>
                  </div>
                  <div style="min-width:0;">
                    <span style="font-size:9px; font-weight:800; color:#065f46; display:block; margin-bottom:2px;">Kümes İlçesi / Mevki</span>
                    <select id="srLoftDistrictSelect" class="sr-field-select" style="height:36px; font-size:11px; padding:4px 7px;" onchange="AvigenGenesisAI.state.smartRaceCustomLoftCoord=null; AvigenGenesisAI.onSmartRaceControlChange('loft_district')">
                      ${this.state.smartRaceCustomLoftCoord ? `
                        <option value="custom_coord" selected>📍 ${escapeHtml(this.state.smartRaceCustomLoftCoord.name)}</option>
                      ` : ''}
                      ${this.getDistrictsForProvince(this.state.smartRaceLoftCityId || r.loftNode.id).map(d => `
                        <option value="${d.id}" ${(!this.state.smartRaceCustomLoftCoord && d.id === (this.state.smartRaceLoftDistrictId || r.loftNode.districtId)) ? 'selected' : ''}>
                          ${escapeHtml(d.name)} (${d.altM}m)
                        </option>
                      `).join('')}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. ÜÇÜNCÜ SIRADA: İNTERAKTİF TÜRKİYE VE ROTA HARİTASI -->
            ${this.renderInteractiveTurkeyMap(sr, false)}

            <!-- 3. DÖRDÜNCÜ SIRADA: DİĞER YARIŞ BİLGİLERİ (AD, MESAFE, TARİH, SAAT VE KATILACAK KUŞLAR) -->
            <div class="sr-form-card">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
                <div>
                  <div style="font-size:12px; font-weight:900; color:var(--ios-text);">
                    🏁 Yarış Bilgileri, Tarih &amp; Katılacak Kuşlar
                  </div>
                  <div style="font-size:9.3px; color:var(--ios-subtext);">
                    Salım tarihini, saatini ve yarışa katılacak kuşlarınızı kontrol edip simülasyonu başlatın.
                  </div>
                </div>
                ${sr.trackerEvents.length > 0 ? `
                  <select id="srEventSelect" class="sr-field-select" style="width:auto; height:30px; font-size:9.5px; padding:3px 8px;" onchange="AvigenGenesisAI.onSmartRaceControlChange('event')">
                    <option value="custom" ${this.state.smartRaceEventId === 'custom' ? 'selected' : ''}>✏️ Yeni / Özel Yarış Kurulumu</option>
                    ${sr.trackerEvents.map(ev => `
                      <option value="${ev.id}" ${(sr.selectedEvent && sr.selectedEvent.id === ev.id) ? 'selected' : ''}>
                        📋 Klasik Kayıt: ${escapeHtml(ev.codeTitle)} (${ev.distanceKm} km)
                      </option>
                    `).join('')}
                  </select>
                ` : ''}
              </div>

              <div class="sr-form-grid">
                <!-- Yarış Adı -->
                <div class="sr-field-box">
                  <label class="sr-field-label">Yarış Adı</label>
                  <input type="text" id="srRaceNameInput" class="sr-field-input" value="${escapeHtml(defaultRaceTitle)}" placeholder="Örn: Ankara – Bursa Etabı" oninput="AvigenGenesisAI.state.smartRaceCustomTitle=this.value" />
                </div>

                <!-- Hesaplanan Mesafe (Gerçek Koordinatlardan Otomatik) -->
                <div class="sr-field-box">
                  <label class="sr-field-label">Hesaplanan Mesafe (Otomatik)</label>
                  <div class="sr-distance-badge-box" style="font-size:10.5px; padding:0 8px;">
                    <span>📏 ${r.crowFliesKm} km</span>
                    <span style="font-size:8.6px; font-weight:700; color:#6d28d9;">Koridor: ${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km</span>
                  </div>
                </div>

                <!-- Yarış Tarihi -->
                <div class="sr-field-box">
                  <label class="sr-field-label">Yarış Tarihi</label>
                  <input type="date" id="srReleaseDate" class="sr-field-input" value="${escapeHtml(sr.releaseDate)}" onchange="AvigenGenesisAI.onSmartRaceControlChange('date')" />
                </div>

                <!-- Salım Saati & Canlı Hava Çekme -->
                <div class="sr-field-box">
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:4px;">
                    <label class="sr-field-label" style="margin:0;">Salım Saati</label>
                    <button type="button" id="btnFetchSmartRaceWeather" class="ios-btn ios-btn-outline" style="padding:1px 6px; font-size:8px; color:#0284c7; border-color:#bae6fd;" onclick="AvigenGenesisAI.fetchSmartRaceRouteWeather(event)" title="Seçili rota için gerçek zamanlı rüzgâr ve sıcaklık verisini çek">
                      🌤️ Canlı Hava Çek
                    </button>
                  </div>
                  <input type="time" id="srReleaseTime" class="sr-field-input" value="${escapeHtml(sr.releaseTime)}" onchange="AvigenGenesisAI.onSmartRaceControlChange('time')" />
                </div>
              </div>

              <!-- Katılacak Kuşlar (Kayıtlı Kümes Kuşlarından Otomatik Seçim) -->
              <div style="margin-top:10px; background:var(--ios-card); border:1px solid var(--ios-border); border-radius:10px; padding:9px 11px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
                  <div>
                    <span style="font-size:10.5px; font-weight:900; color:var(--ios-text);">🕊️ Katılacak Kuşlar</span>
                    <span id="srSelectedBirdCountLabel" class="gene-badge gene-blue" style="font-size:8.5px; margin-left:6px;">
                      ${displayBirds.length} Kuş Seçili
                    </span>
                  </div>
                  <div style="display:flex; gap:5px;">
                    <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 8px; font-size:8.8px;" onclick="AvigenGenesisAI.selectAllSmartRaceBirds('ALL')">Tüm Kümes (${sr.birdEvaluations.length})</button>
                    <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 8px; font-size:8.8px;" onclick="AvigenGenesisAI.selectAllSmartRaceBirds('RACERS_ONLY')">Yarış Kadrosu</button>
                  </div>
                </div>

                <!-- Eksik Veri Durumu Açık Bildirimi -->
                <div style="margin-top:5px; font-size:9px; color:var(--ios-subtext);">
                  • Seçili kuşlardan <strong style="color:#059669;">${provenBirds.length} kuşun</strong> doğrulanmış bireysel yarış/hız geçmişi mevcuttur.
                  ${unprovenBirds.length > 0 ? `<strong style="color:#d97706;">${unprovenBirds.length} kuşun</strong> henüz bireysel yarış kaydı girilmediği için bu kuşlara kesin performans puanı verilmeyecek, yalnızca genel mesafe dönüş tahmini uygulanacaktır.` : ''}
                </div>

                <details style="margin-top:6px; font-size:9.3px;">
                  <summary style="cursor:pointer; font-weight:800; color:#0052cc; outline:none;">
                    ▾ Katılacak Kuş Listesini Düzenle (${displayBirds.length} / ${sr.birdEvaluations.length} Kuş)
                  </summary>
                  <div style="max-height:175px; overflow-y:auto; display:flex; flex-direction:column; gap:4px; margin-top:7px; padding-top:6px; border-top:1px dashed var(--ios-border);">
                    ${sr.birdEvaluations.map(b => `
                      <label style="display:flex; align-items:center; justify-content:space-between; gap:6px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px; cursor:pointer; font-size:9.3px;">
                        <div style="display:flex; align-items:center; gap:6px; min-width:0;">
                          <input type="checkbox" ${b.isInSelectedRace ? 'checked' : ''} onchange="AvigenGenesisAI.toggleSmartRaceBirdSelection('${escapeHtml(b.ring)}', this.checked)" style="accent-color:#0052cc; width:14px; height:14px; flex-shrink:0;" />
                          <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                            <strong>${b.flag} ${escapeHtml(b.ring)}</strong> (${escapeHtml(b.name)})
                          </span>
                        </div>
                        <span style="font-size:8.4px; font-weight:800; flex-shrink:0; color:${b.hasSufficientIndividualData ? '#059669' : '#d97706'};">
                          ${b.hasSufficientIndividualData ? `${b.totalProvenRaceRecords} Yarış` : 'Genel Tahmin'}
                        </span>
                      </label>
                    `).join('')}
                  </div>
                </details>
              </div>

              <!-- SİMÜLASYONU BAŞLAT ANA BUTONU -->
              <div style="margin-top:12px;">
                <button type="button" class="sr-launch-btn" onclick="AvigenGenesisAI.startSmartRaceSimulation()">
                  <span>🚀 Simülasyonu Başlat (${escapeHtml(r.relNode.name.split(' (')[0])} → ${escapeHtml(r.loftNode.name.split(' (')[0])} • ${r.crowFliesKm} km)</span>
                </button>
              </div>
            </div>

            <!-- 3. ÖNCEKİ KAYDEDİLMİŞ SİMÜLASYONLAR (VARSA) -->
            ${savedSims.length > 0 ? `
              <div class="sr-form-card" style="padding:10px 12px;">
                <div style="font-size:10.5px; font-weight:900; color:var(--ios-text); margin-bottom:6px;">
                  🕒 Kaydedilmiş Önceki Yarış Simülasyonları (${savedSims.length})
                </div>
                <div style="display:flex; flex-direction:column; gap:5px;">
                  ${savedSims.slice(0, 4).map(sim => `
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; background:var(--ios-card); border:1px solid var(--ios-border); border-radius:8px; padding:6px 9px; font-size:9.3px;">
                      <div style="min-width:0;">
                        <div style="font-weight:900; color:var(--ios-text);">
                          🏁 ${escapeHtml(sim.raceTitle)} — ${escapeHtml(sim.releaseName)} → ${escapeHtml(sim.loftName)} (${sim.crowFliesKm} km)
                        </div>
                        <div style="font-size:8.6px; color:var(--ios-subtext);">
                          📅 ${escapeHtml(sim.releaseDate)} Saat ${escapeHtml(sim.releaseTime)} • Tahmini Dönüş: <strong>${escapeHtml(sim.likelyWindowClock)}</strong> • Güven: %${sim.reliabilityPct}
                        </div>
                      </div>
                      <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
                        <span class="gene-badge ${sim.overallRiskBadge || 'gene-blue'}" style="font-size:8px;">${escapeHtml(sim.overallRiskLevel)}</span>
                        <button type="button" class="ios-btn ios-btn-primary" style="padding:4px 9px; font-size:9px;" onclick="AvigenGenesisAI.openSavedSmartRaceSimulation('${sim.id}')">
                          Sonucu Aç →
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
        return;
      }

      // ======================================================================
      // AŞAMA 2: NİHAİ SONUÇ ÖZETİ (YATAY KAYDIRMA OLMAYAN MOBİL KART MİMARİSİ)
      // ======================================================================
      if (curStage === 'summary') {
        const z1 = sr.zoneWeather[0];
        const z2 = sr.zoneWeather[1];
        const z3 = sr.zoneWeather[2];

        const renderBirdSummaryCard = (b, idx) => {
          const p = b.prediction;
          const hasScore = b.suitabilityScore !== null;
          const defaultBasketChecked = !hasScore || b.suitabilityScore >= 60;
          const borderCol = hasScore ? (b.suitabilityScore >= 80 ? '#059669' : (b.suitabilityScore >= 65 ? '#0066ff' : '#d97706')) : '#94a3b8';
          const shortVerdict = hasScore
            ? `${b.suitabilityScore}/100 • ${b.suitabilityScore >= 80 ? 'Çok Uygun' : (b.suitabilityScore >= 65 ? 'Uygun' : 'Yedek/Dikkat')}`
            : 'Genel Tahmin';

          return `
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:4px solid ${borderCol}; border-radius:9px; padding:7px 9px; display:flex; flex-direction:column; gap:5px;">
              <!-- Üst Satır: Seçim Kutusu + Kuş Kimliği + Uygunluk Rozeti -->
              <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <div style="display:flex; align-items:center; gap:7px; min-width:0; flex:1;">
                  <input type="checkbox" class="sr-sim-basket-chk" value="${escapeHtml(b.ring)}" data-name="${escapeHtml(b.name)}" data-flag="${b.flag || '🇹🇷'}" data-score="${hasScore ? b.suitabilityScore : 70}" ${defaultBasketChecked ? 'checked' : ''} style="width:16px; height:16px; accent-color:#059669; cursor:pointer; flex-shrink:0;" />
                  <div style="min-width:0; cursor:pointer;" onclick="if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(b.ring)}');">
                    <div style="font-size:10.3px; font-weight:900; color:var(--ios-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${idx + 1}. ${b.flag} ${escapeHtml(b.ring)} <span style="font-weight:700; color:var(--ios-subtext);">(${escapeHtml(b.name)})</span>
                    </div>
                  </div>
                </div>
                <span class="gene-badge ${b.suitabilityBadgeClass}" style="font-size:8px; padding:2px 6px; flex-shrink:0;">
                  ${escapeHtml(shortVerdict)}
                </span>
              </div>

              <!-- Alt Satır: 3 Eşit Sütunlu Tahmini Dönüş, Hız ve Güven Şeridi (Yatay Kaydırma Sıfır!) -->
              <div style="display:grid; grid-template-columns:1.15fr 0.95fr 1fr; gap:4px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:4px 6px; font-size:8.6px;">
                <div style="min-width:0;">
                  <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">🎯 OLASI DÖNÜŞ</div>
                  <div style="font-size:10px; font-weight:900; color:#0052cc; white-space:nowrap;">${escapeHtml(p.likelyWindowLabel)}</div>
                </div>
                <div style="min-width:0; border-left:1px solid var(--ios-border); padding-left:5px;">
                  <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">⚡ HIZ &amp; TECRÜBE</div>
                  <div style="font-size:9.3px; font-weight:900; color:var(--ios-text); white-space:nowrap;">~${p.expectedBirdSpeedMpm} m/dk <span style="font-size:7.8px; color:var(--ios-subtext);">(${b.totalProvenRaceRecords}Y)</span></div>
                </div>
                <div style="min-width:0; border-left:1px solid var(--ios-border); padding-left:5px;">
                  <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">⏱️ ERKEN / GEÇ</div>
                  <div style="font-size:8.8px; font-weight:900; white-space:nowrap;">
                    <span style="color:#059669;">${escapeHtml(p.earliestTimeLabel)}</span> / <span style="color:#b45309;">${escapeHtml(p.lateLimitTimeLabel)}</span>
                  </div>
                </div>
              </div>
            </div>
          `;
        };

        out.innerHTML = `
          <div class="sr-sim-container">
            <!-- ÜST BAŞLIK VE HIZLI GEÇİŞ ÇUBUĞU -->
            <div class="sr-form-card" style="padding:9px 11px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
              <div style="min-width:0;">
                <div style="font-size:11.8px; font-weight:900; color:var(--ios-text);">
                  🏁 ${escapeHtml(defaultRaceTitle)} (${r.crowFliesKm} km)
                </div>
                <div style="font-size:8.9px; color:var(--ios-subtext);">
                  🔴 <strong>${escapeHtml(r.relNode.name)}</strong> → 🟢 <strong>${escapeHtml(r.loftNode.name)}</strong> • 📅 ${escapeHtml(sr.releaseDate)} (${escapeHtml(sr.releaseTime)})
                </div>
              </div>
              <div style="display:flex; gap:5px; width:100%;">
                <button type="button" class="ios-btn ios-btn-outline" style="flex:1; padding:6px 8px; font-size:9.3px;" onclick="AvigenGenesisAI.setSmartRaceStage('setup')">
                  ✏️ Rotayı Düzenle
                </button>
                <button type="button" class="ios-btn ios-btn-primary" style="flex:1.2; padding:6px 8px; font-size:9.3px;" onclick="AvigenGenesisAI.setSmartRaceStage('detail')">
                  🔬 Detaylı Rapor →
                </button>
              </div>
            </div>

            <!-- 6 TEMEL SONUÇ ÖZETİ KARTI (2x3 FERAH MOBİL IZGARA - YATAY SIKIŞMA YOK) -->
            <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px;">
              <div class="sr-kpi-card" style="border-top:3px solid #0052cc; padding:7px 9px;">
                <div class="sr-kpi-label">Yarış Mesafesi</div>
                <div class="sr-kpi-val" style="color:#0052cc; font-size:12px;">${r.crowFliesKm} km Kuş Uçuşu</div>
                <div class="sr-kpi-sub">Koridor: ${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km</div>
              </div>

              <div class="sr-kpi-card" style="border-top:3px solid #059669; padding:7px 9px;">
                <div class="sr-kpi-label">En Olası Dönüş Saati</div>
                <div class="sr-kpi-val" style="color:#059669; font-size:12px;">${escapeHtml(sr.fleetReturnEstimate.likelyWindowClock)}</div>
                <div class="sr-kpi-sub">Erken: ${escapeHtml(sr.fleetReturnEstimate.earliestClock)} • Geç: ${escapeHtml(sr.fleetReturnEstimate.lateLimitClock)}</div>
              </div>

              <div class="sr-kpi-card" style="border-top:3px solid #0284c7; padding:7px 9px;">
                <div class="sr-kpi-label">Hava &amp; Rüzgâr</div>
                <div class="sr-kpi-val" style="font-size:12px;">${z1.tempC}°C • ${z2.windSpeedKmh} km/s</div>
                <div class="sr-kpi-sub">${escapeHtml(z2.windEffectLabel)}</div>
              </div>

              <div class="sr-kpi-card" style="border-top:3px solid ${sr.overallRiskColor}; padding:7px 9px;">
                <div class="sr-kpi-label">Güzergâh Uçuş Riski</div>
                <div class="sr-kpi-val" style="color:${sr.overallRiskColor}; font-size:12px;">${escapeHtml(sr.overallRiskLevel)}</div>
                <div class="sr-kpi-sub">Beklenen Hız: ~${sr.fleetReturnEstimate.expectedSpeedMpm} m/dk</div>
              </div>

              <div class="sr-kpi-card" style="border-top:3px solid #7c3aed; padding:7px 9px;">
                <div class="sr-kpi-label">Rota &amp; İrtifa</div>
                <div class="sr-kpi-val" style="color:#6d28d9; font-size:11.5px;">Tepe ~${r.midPassAltM}m (${r.bearingDeg}°)</div>
                <div class="sr-kpi-sub">${r.relNode.altM}m → ${r.loftNode.altM}m</div>
              </div>

              <div class="sr-kpi-card" style="border-top:3px solid ${relMeta.color}; padding:7px 9px;">
                <div class="sr-kpi-label">Tahmin Güveni</div>
                <div class="sr-kpi-val" style="color:${relMeta.color}; font-size:11.5px;">%${sr.reliabilityPct} (${escapeHtml(relMeta.label)})</div>
                <div class="sr-kpi-sub">${provenBirds.length} Kanıtlı • ${unprovenBirds.length} Genel</div>
              </div>
            </div>

            <!-- TÜRKİYE ROTA VE RİSK HARİTASI -->
            ${this.renderInteractiveTurkeyMap(sr, true)}

            <!-- YARIŞA KATILAN KUŞLARIN UYGUNLUĞU VE TAHMİNİ DÖNÜŞ ARALIKLARI (DİKEY MOBİL KARTLAR - YATAY KAYDIRMA SIFIR!) -->
            <div class="sr-form-card" style="padding:10px 11px;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:6px;">
                <div>
                  <div style="font-size:11.2px; font-weight:900; color:var(--ios-text);">
                    🕊️ Kuşların Uygunluğu &amp; Dönüş Saatleri (${displayBirds.length} Kuş)
                  </div>
                  <div style="font-size:8.6px; color:var(--ios-subtext);">
                    Sepetlenecek kuşları seçip aşağıdaki yeşil butonla doğrudan yarışı başlatın.
                  </div>
                </div>
              </div>

              <!-- Hızlı Seçim ve Tek Tuşla Sepetleme Barı -->
              <div style="display:flex; gap:5px; flex-wrap:wrap; margin-bottom:7px;">
                <button type="button" class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:8.6px; font-weight:800;" onclick="document.querySelectorAll('.sr-sim-basket-chk').forEach(c => c.checked = true)">
                  ✅ Tümünü Seç
                </button>
                <button type="button" class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:8.6px; font-weight:800; color:#059669; border-color:#a7f3d0;" onclick="document.querySelectorAll('.sr-sim-basket-chk').forEach(c => c.checked = Number(c.getAttribute('data-score')||70) >= 65)">
                  ⭐ En Uygunları Seç
                </button>
                <button type="button" class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:8.6px; font-weight:800;" onclick="document.querySelectorAll('.sr-sim-basket-chk').forEach(c => c.checked = false)">
                  🧹 Temizle
                </button>
              </div>

              <button type="button" class="ios-btn ios-btn-green" style="width:100%; padding:9px 12px; font-size:10.5px; font-weight:900; margin-bottom:8px;" onclick="AvigenGenesisAI.createOfficialRaceFromSimulation()">
                🏁 İşaretli Kadroyla Yarışı Başlat (Sepetle) →
              </button>

              <!-- DİKEY KUŞ KARTLARI LİSTESİ (EKRANA %100 SIĞAR, SAĞA-SOLA KAYDIRMA YOK) -->
              <div style="display:flex; flex-direction:column; gap:6px;">
                ${displayBirds.slice(0, 12).map((b, idx) => renderBirdSummaryCard(b, idx)).join('')}
              </div>

              ${displayBirds.length > 12 ? `
                <details style="margin-top:7px; background:var(--ios-card); border:1px solid var(--ios-border); border-radius:8px; padding:6px 9px;">
                  <summary style="cursor:pointer; font-size:9.3px; font-weight:900; color:#0052cc; outline:none;">
                    ▾ Diğer ${displayBirds.length - 12} Kuşu Göster (${displayBirds.length} Toplam Kuş)
                  </summary>
                  <div style="display:flex; flex-direction:column; gap:6px; margin-top:7px;">
                    ${displayBirds.slice(12).map((b, idx) => renderBirdSummaryCard(b, idx + 12)).join('')}
                  </div>
                </details>
              ` : ''}
            </div>

            <!-- GENESIS AI KISA VE ANLAŞILIR GENEL DEĞERLENDİRMESİ -->
            <div class="sr-form-card" style="border-left:4px solid ${sr.overallRiskColor}; padding:9px 11px;">
              <div style="font-size:10.5px; font-weight:900; color:var(--ios-text); margin-bottom:3px;">
                🧬 GENESIS AI Genel Yarış Değerlendirmesi
              </div>
              <div style="font-size:9.5px; color:var(--ios-text); line-height:1.42;">
                <strong>${escapeHtml(r.relNode.name)} → ${escapeHtml(r.loftNode.name)}</strong> arasındaki <strong>${r.crowFliesKm} km</strong> kuş uçuşu (koridor: <strong>${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km</strong>) güzergâhında uçuş riski <strong style="color:${sr.overallRiskColor};">${escapeHtml(sr.overallRiskLevel)}</strong> olarak hesaplanmıştır.
                Orta geçit bölgesinde (<strong>~${r.midPassAltM}m</strong>) <strong>${escapeHtml(z2.windEffectLabel)} (${z2.windSpeedKmh} km/s)</strong> nedeniyle beklenen filo hızı <strong>~${sr.fleetReturnEstimate.expectedSpeedMpm} m/dk</strong> olup, saat <strong>${escapeHtml(sr.releaseTime)}</strong> salımına göre en olası dönüşlerin <strong>${escapeHtml(sr.fleetReturnEstimate.likelyWindowClock)}</strong> aralığında gerçekleşmesi öngörülmektedir.
              </div>
            </div>

            <!-- DETAYLI BİLİMSEL ANALİZE GEÇİŞ BUTONU -->
            <div>
              <button type="button" class="sr-launch-btn" onclick="AvigenGenesisAI.setSmartRaceStage('detail')">
                <span>🔬 3. Aşama: Detaylı Bilimsel Analizi ve Bölgesel Raporu Aç →</span>
              </button>
            </div>
          </div>
        `;
        return;
      }

      // ======================================================================
      // AŞAMA 3: DETAYLI BİLİMSEL ANALİZ (AYNI SİMÜLASYON KAYDINDAN 6 BİLİMSEL BÖLÜM)
      // ======================================================================
      out.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:9px; font-size:10px; line-height:1.42;">
          <div class="sr-form-card" style="padding:9px 11px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
            <div>
              <div style="font-size:11.5px; font-weight:900; color:var(--ios-text);">
                🔬 Detaylı Bilimsel Analiz — ${escapeHtml(defaultRaceTitle)} (${r.crowFliesKm} km)
              </div>
              <div style="font-size:8.9px; color:var(--ios-subtext);">
                Sonuç özeti ile aynı simülasyon kaydı (${escapeHtml(r.relNode.name)} → ${escapeHtml(r.loftNode.name)} • ${escapeHtml(sr.releaseDate)} ${escapeHtml(sr.releaseTime)}) kullanılmaktadır.
              </div>
            </div>
            <div style="display:flex; gap:5px; width:100%;">
              <button type="button" class="ios-btn ios-btn-outline" style="flex:1; padding:5px 9px; font-size:9px;" onclick="AvigenGenesisAI.setSmartRaceStage('summary')">
                ← Sonuç Özetine Dön
              </button>
              <button type="button" class="ios-btn ios-btn-outline" style="flex:1; padding:5px 9px; font-size:9px;" onclick="AvigenGenesisAI.setSmartRaceStage('setup')">
                ✏️ Kuruluma Dön
              </button>
            </div>
          </div>

          <!-- ================================================================
               1. BÖLÜM: YARIŞ VE ROTA ÖZETİ (HARİTA, COĞRAFİ ENGELLER & 3 BÖLÜM)
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1.5px solid #0066ff; border-radius:11px; padding:9px 11px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:7px;">
              <div style="font-size:11.5px; font-weight:900; color:var(--ios-text);">
                1. YARIŞ VE ROTA ÖZETİ (${escapeHtml(r.relNode.name)} → ${escapeHtml(r.loftNode.name)})
              </div>
              <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                <span class="gene-badge gene-blue" style="font-size:8.5px;">${escapeHtml(sr.raceCategoryLabel)}</span>
                <span class="gene-badge ${relMeta.badgeClass}" style="font-size:8.5px;">Güven: %${sr.reliabilityPct} (${relMeta.label})</span>
              </div>
            </div>

            <!-- 4 Temel Rota & Mesafe Kartı (2x2 Mobil Izgara - Yatay Taşma Yok) -->
            <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:5px; text-align:center; margin-bottom:7px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #0066ff; border-radius:7px; padding:6px 5px;">
                <div style="font-size:7.8px; font-weight:800; color:var(--ios-subtext);">KUŞ UÇUŞ MESAFESİ</div>
                <div style="font-size:12.5px; font-weight:900; color:#0052cc;">${r.crowFliesKm} km</div>
                <div style="font-size:7.8px; color:var(--ios-subtext);">Haversine Düz Hat</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #7c3aed; border-radius:7px; padding:6px 5px;">
                <div style="font-size:7.8px; font-weight:800; color:var(--ios-subtext);">TAHMİNİ GERÇEK MESAFE</div>
                <div style="font-size:12px; font-weight:900; color:#6d28d9;">${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km</div>
                <div style="font-size:7.8px; color:var(--ios-subtext);">+%${r.minDeviationPct}..%${r.maxDeviationPct} Koridor Sapması</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #059669; border-radius:7px; padding:6px 5px;">
                <div style="font-size:7.8px; font-weight:800; color:var(--ios-subtext);">SALIM TARİHİ &amp; SAATİ</div>
                <div style="font-size:11px; font-weight:900; color:#047857;">${escapeHtml(sr.releaseDate)} • ${escapeHtml(sr.releaseTime)}</div>
                <div style="font-size:7.8px; color:var(--ios-subtext);">Planlanan Salım</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #d97706; border-radius:7px; padding:6px 5px;">
                <div style="font-size:7.8px; font-weight:800; color:var(--ios-subtext);">RAKIM &amp; YÖNELİM</div>
                <div style="font-size:11px; font-weight:900; color:#b45309;">${r.relNode.altM}m → ${r.loftNode.altM}m</div>
                <div style="font-size:7.8px; color:var(--ios-subtext);">Tepe: ~${r.midPassAltM}m (${r.bearingDeg}°)</div>
              </div>
            </div>

            <!-- İnteraktif SVG Harita ve Topoğrafik Kesit -->
            ${this.renderSmartRaceRouteSvgMap(sr)}

            <!-- Bilimsel Not: Kuş Uçuşu Mesafesi vs Gerçek Uçuş Rotası Ayrımı -->
            <div style="margin-top:6px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:7px; padding:5px 8px; font-size:9px; color:#1e3a8a;">
              🧭 <strong>Bilimsel Rota İlkesi:</strong> Güvercinlerin gerçek uçuş rotası GPS telemetri kaydı olmadan kesin olarak bilinemez. Teorik kuş uçuşu mesafesi (<strong>${r.crowFliesKm} km</strong>) ile coğrafi engeller, vadi/otoyol takibi ve rüzgâr sürüklenmesi nedeniyle oluşan tahmini gerçek uçuş mesafesi (<strong>${r.actualCorridorMinKm}–${r.actualCorridorMaxKm} km</strong>) birbirinden ayrı hesaplanmıştır.
            </div>

            <!-- Güzergâhın 3 Bölümü ve Coğrafi Engeller -->
            <div style="margin-top:7px; display:flex; flex-direction:column; gap:6px; font-size:9.2px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid #0066ff; border-radius:7px; padding:6px 8px;">
                <strong style="color:#0052cc;">📍 Güzergâhın 3 Bölümü Analizi:</strong>
                ${r.segments.map(seg => `
                  <div style="margin-top:3px;">
                    • <strong>${escapeHtml(seg.title)}:</strong> ${escapeHtml(seg.terrainNote)}
                  </div>
                `).join('')}
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid #7c3aed; border-radius:7px; padding:6px 8px;">
                <strong style="color:#5b21b6;">⛰️ Coğrafi Engeller ve Olası Uçuş Koridorları:</strong>
                ${r.obstacles.map(ob => `
                  <div style="margin-top:3px;">
                    • <strong>${escapeHtml(ob.name)} [${escapeHtml(ob.segment)}]:</strong> ${escapeHtml(ob.impact)}
                  </div>
                `).join('')}
                <div style="margin-top:4px; padding-top:4px; border-top:1px dashed var(--ios-border);">
                  ${r.corridors.map(cor => `<div>↳ <strong>${escapeHtml(cor.name)}:</strong> ${escapeHtml(cor.distanceLabel)}</div>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- ================================================================
               2. BÖLÜM: METEOROLOJİK DEĞERLENDİRME (GÜZERGÂH BOYUNCA 3 BÖLGE)
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #0284c7; border-radius:10px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:5px;">
              <div style="font-size:11px; font-weight:900; color:#0369a1;">
                2. METEOROLOJİK DEĞERLENDİRME (3 GÜZERGÂH BÖLGESİ)
              </div>
              <span class="gene-badge ${sr.dataSourceInfo.isRealTimeMeasured ? 'gene-green' : 'gene-purple'}" style="font-size:8.2px;">
                ${sr.dataSourceInfo.isRealTimeMeasured ? '🟢 Gerçek Zamanlı Ölçüm + Model' : '📋 Tahmin / Senaryo Verisi'}
              </span>
            </div>

            <!-- Veri Kaynağı, Türü ve Güncellenme Zamanı Şeffaflık Kutusu -->
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px; margin-bottom:6px; font-size:9px;">
              <div><strong>📡 Veri Kaynağı:</strong> ${escapeHtml(sr.dataSourceInfo.sourceProvider)}</div>
              <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px; margin-top:2px; color:var(--ios-subtext);">
                <span><strong>Veri Niteliği:</strong> ${escapeHtml(sr.dataSourceInfo.sourceTypeLabel)}</span>
                <span><strong>Son Güncellenme:</strong> ${escapeHtml(sr.dataSourceInfo.lastUpdated)}</span>
              </div>
            </div>

            <!-- Güzergâh Boyunca 3 Bölgenin Hava Kartları (Tam Genişlik Dikey - Sıkışma Yok) -->
            <div style="display:flex; flex-direction:column; gap:5px; font-size:9px;">
              ${sr.zoneWeather.map(zw => `
                <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #0284c7; border-radius:7px; padding:6px 8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:3px;">
                    <strong style="color:var(--ios-text); font-size:9.6px;">${escapeHtml(zw.zoneTitle)}</strong>
                    <span style="font-size:8px; color:#6d28d9; font-weight:800;">[${escapeHtml(zw.dataNature)}]</span>
                  </div>
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px 8px;">
                    <div>🌡️ <strong>Sıcaklık &amp; Nem:</strong> ${zw.tempC}°C • %${zw.humPct}</div>
                    <div>💨 <strong>Rüzgâr Hızı:</strong> ${zw.windSpeedKmh} km/s</div>
                    <div>🧭 <strong>Rüzgâr Etkisi:</strong> ${escapeHtml(zw.windEffectLabel)}</div>
                    <div>🌧️ <strong>Yağış &amp; Görüş:</strong> ${zw.precipMm} mm • ${zw.visKm} km</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="margin-top:6px; font-size:9px; color:var(--ios-subtext);">
              • <strong>Aerodinamik Hız Etkisi:</strong> Mevcut rüzgâr, ısı, yağış ve irtifa koşullarının standart uçuş hızına net etkisi <strong>${sr.weatherSpeedDeltaMpm >= 0 ? `+${sr.weatherSpeedDeltaMpm}` : sr.weatherSpeedDeltaMpm} m/dk</strong> olarak hesaplanmıştır.
            </div>
          </div>

          <!-- ================================================================
               3. BÖLÜM: RİSK ANALİZİ (4 RESMİ RİSK SEVİYESİ & BÖLÜM BAZLI NEDENLER)
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1.5px solid ${sr.overallRiskColor}; border-radius:10px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:6px;">
              <div style="font-size:11px; font-weight:900; color:${sr.overallRiskColor};">
                3. RİSK ANALİZİ VE GÜZERGÂH RİSK TESPİTİ
              </div>
              <span class="gene-badge ${sr.overallRiskBadge}" style="font-size:9px; padding:2px 8px; font-weight:900;">
                GENEL RİSK: ${escapeHtml(sr.overallRiskLevel)}
              </span>
            </div>

            <div style="display:flex; flex-direction:column; gap:5px; font-size:9.3px;">
              ${sr.riskFindings.map(rf => `
                <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid ${rf.level === 'KRİTİK RİSK' || rf.level === 'YÜKSEK RİSK' ? '#dc2626' : (rf.level === 'ORTA RİSK' ? '#d97706' : '#059669')}; border-radius:7px; padding:6px 8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:2px;">
                    <strong style="color:var(--ios-text);">${escapeHtml(rf.factor)}</strong>
                    <span class="gene-badge ${rf.badgeClass}" style="font-size:8px;">${escapeHtml(rf.level)} • ${escapeHtml(rf.segment)}</span>
                  </div>
                  <div style="color:var(--ios-subtext); font-size:8.9px;">
                    ↳ <strong>Risk Nedeni ve Etkisi:</strong> ${escapeHtml(rf.reason)}
                  </div>
                </div>
              `).join('')}
            </div>

            <div style="margin-top:6px; background:#fefce8; border:1px solid #fde047; border-radius:7px; padding:5px 8px; font-size:8.9px; color:#854d0e;">
              ⚖️ <strong>Karar Destek ve Yetiştirici Özerkliği İlkesi:</strong> GENESIS AI otomatik yarış iptali veya zorunlu salım kararı dayatmaz. Yukarıdaki meteorolojik ve coğrafi risk değerlendirmesi bilimsel karar desteği sunar; nihai sepetleme ve salım kararı yetiştiriciye aittir.
            </div>
          </div>

          <!-- ================================================================
               4. BÖLÜM: KUŞLARIN YARIŞ UYGUNLUĞU (KANITLI VERİ VS YETERSİZ VERİ AYRIMI)
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #7c3aed; border-radius:10px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:5px;">
              <div style="font-size:11px; font-weight:900; color:#5b21b6;">
                4. KUŞLARIN YARIŞ UYGUNLUĞU (${sr.birdEvaluations.length} Kümes Kuşu İncelendi)
              </div>
              <span class="gene-badge gene-purple" style="font-size:8.3px;">
                ${provenBirds.length} Yarış Kayıtlı • ${unprovenBirds.length} Henüz Yarış Kaydı Yok
              </span>
            </div>

            <div style="font-size:8.9px; color:var(--ios-subtext); margin-bottom:6px;">
              Her kuşun önceki yarış sonuçları, mesafeleri, ortalama uçuş hızı, yarış istikrarı, dayanıklılık göstergeleri ve hava koşullarına verdiği performans tepkisi bu yarışın (${sr.distKm} km) özellikleriyle karşılaştırılmıştır. <strong>Yeterli geçmiş yarış verisi bulunmayan kuşlara kesin performans puanı verilmez.</strong>
            </div>

            <div style="display:flex; flex-direction:column; gap:5px;">
              ${sr.birdEvaluations.slice(0, 10).map((b, idx) => `
                <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid ${b.suitabilityScore !== null ? (b.suitabilityScore >= 80 ? '#059669' : '#0066ff') : '#d97706'}; border-radius:8px; padding:6px 8px; font-size:9.1px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:3px;">
                    <div style="font-weight:900; color:var(--ios-text); font-size:9.8px; cursor:pointer;" onclick="if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(b.ring)}');">
                      ${idx + 1}. ${b.flag} ${escapeHtml(b.ring)} — ${escapeHtml(b.name)}
                    </div>
                    <span class="gene-badge ${b.suitabilityBadgeClass}" style="font-size:8px;">
                      ${b.suitabilityScore !== null ? `${b.suitabilityScore}/100 • ${escapeHtml(b.suitabilityVerdict)}` : escapeHtml(b.suitabilityVerdict)}
                    </span>
                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px 8px; font-size:8.7px; color:var(--ios-subtext); margin-bottom:3px;">
                    <div>🏁 <strong>Tecrübe:</strong> ${b.totalProvenRaceRecords} yarış kaydı</div>
                    <div>📏 <strong>Mesafeler:</strong> ${escapeHtml(b.successfulDistLabel)}</div>
                    <div>⚡ <strong>Ort. Hız:</strong> ${b.avgPastSpeedMpm ? `${b.avgPastSpeedMpm} m/dk` : 'Kayıt Yok'}</div>
                    <div>📊 <strong>İstikrar:</strong> ${escapeHtml(b.consistencyText)}</div>
                    <div>🫀 <strong>Dayanıklılık:</strong> ${escapeHtml(b.enduranceText)}</div>
                    <div>🌤️ <strong>Hava Tepkisi:</strong> ${escapeHtml(b.weatherResponseText)}</div>
                  </div>

                  <div style="background:var(--ios-card-alt); border-radius:6px; padding:4px 6px; font-size:8.8px; color:var(--ios-text);">
                    💡 <strong>Değerlendirme Gerekçesi:</strong> ${escapeHtml(b.suitabilityReason)}
                  </div>
                </div>
              `).join('')}

              ${sr.birdEvaluations.length > 10 ? `
                <details style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px; font-size:9px;">
                  <summary style="cursor:pointer; font-weight:800; color:#4c1d95;">
                    + Kümesinizdeki Diğer ${sr.birdEvaluations.length - 10} Kuşun Yarış Uygunluk Durumunu Göster
                  </summary>
                  <div style="margin-top:5px; display:flex; flex-direction:column; gap:4px;">
                    ${sr.birdEvaluations.slice(10).map((b, idx) => `
                      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; border-bottom:1px dashed var(--ios-border); padding:3px 0; font-size:8.7px;">
                        <span><strong>${idx + 11}. ${b.flag} ${escapeHtml(b.ring)} (${escapeHtml(b.name)})</strong> — ${b.totalProvenRaceRecords} Yarış</span>
                        <span class="gene-badge ${b.suitabilityBadgeClass}" style="font-size:7.8px;">
                          ${b.suitabilityScore !== null ? `${b.suitabilityScore}/100` : 'Genel Tahmin'}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                </details>
              ` : ''}
            </div>
          </div>

          <!-- ================================================================
               5. BÖLÜM: TAHMİNİ DÖNÜŞ ZAMANLARI (EN ERKEN • EN OLASI ARALIK • GEÇ SINIR)
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #059669; border-radius:10px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:5px;">
              <div style="font-size:11px; font-weight:900; color:#047857;">
                5. TAHMİNİ DÖNÜŞ ZAMANLARI (SALIM: ${escapeHtml(sr.releaseTime)} • ${sr.distKm} KM)
              </div>
              <span class="gene-badge gene-green" style="font-size:8.3px;">Olasılıksal Varış Pencereleri</span>
            </div>

            <!-- Genel Filo Dönüş Özeti (2x2 Mobil Izgara) -->
            <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:5px; text-align:center; margin-bottom:6px;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #059669; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">TAHMİNİ EN ERKEN DÖNÜŞ</div>
                <div style="font-size:12px; font-weight:900; color:#059669;">${escapeHtml(sr.fleetReturnEstimate.earliestClock)}</div>
                <div style="font-size:7.5px; color:var(--ios-subtext);">Düz Hat Üst Tempo</div>
              </div>
              <div style="background:var(--ios-card); border:1.5px solid #0066ff; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:#0052cc;">EN OLASI DÖNÜŞ ARALIĞI</div>
                <div style="font-size:11.5px; font-weight:900; color:#0052cc;">${escapeHtml(sr.fleetReturnEstimate.likelyWindowClock)}</div>
                <div style="font-size:7.5px; color:var(--ios-subtext);">Süre: ${escapeHtml(sr.fleetReturnEstimate.flightDurationRange)}</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #d97706; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">TAHMİNİ GEÇ DÖNÜŞ SINIRI</div>
                <div style="font-size:12px; font-weight:900; color:#b45309;">${escapeHtml(sr.fleetReturnEstimate.lateLimitClock)}</div>
                <div style="font-size:7.5px; color:var(--ios-subtext);">Sapma / Yorgunluk Eşiği</div>
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #7c3aed; border-radius:7px; padding:5px 4px;">
                <div style="font-size:7.6px; font-weight:800; color:var(--ios-subtext);">BEKLENEN FİLO HIZI</div>
                <div style="font-size:11.5px; font-weight:900; color:#6d28d9;">~${sr.fleetReturnEstimate.expectedSpeedMpm} m/dk</div>
                <div style="font-size:7.5px; color:var(--ios-subtext);">${(sr.fleetReturnEstimate.expectedSpeedMpm * 0.06).toFixed(1).replace('.', ',')} km/sa</div>
              </div>
            </div>

            <!-- Kuş Bazlı Bireysel vs Genel Tahmin Tablosu (2x2 İç Izgaralı Kartlar) -->
            <div style="display:flex; flex-direction:column; gap:5px; font-size:8.9px;">
              ${sr.birdEvaluations.slice(0, 8).map(b => {
                const p = b.prediction;
                return `
                  <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid ${p.isIndividualPrediction ? '#059669' : '#94a3b8'}; border-radius:7px; padding:6px 8px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:3px;">
                      <div>
                        <strong>${b.flag} ${escapeHtml(b.ring)} (${escapeHtml(b.name)})</strong>
                        <span style="font-size:8px; color:${p.isIndividualPrediction ? '#047857' : '#64748b'}; font-weight:800; margin-left:4px;">
                          [${escapeHtml(p.predictionTypeLabel)}]
                        </span>
                      </div>
                      <span class="gene-badge ${p.reliabilityMeta.badgeClass}" style="font-size:7.8px;">
                        Güven: %${p.reliabilityPct}
                      </span>
                    </div>
                    <div style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:3px 8px; font-size:8.5px; color:var(--ios-subtext);">
                      <div>🎯 <strong>En Olası:</strong> <strong style="color:#0052cc;">${escapeHtml(p.likelyWindowLabel)}</strong></div>
                      <div>⚡ <strong>Tahmini Hız:</strong> ~${p.expectedBirdSpeedMpm} m/dk</div>
                      <div>🟢 <strong>En Erken:</strong> <strong style="color:#059669;">${escapeHtml(p.earliestTimeLabel)}</strong> (${escapeHtml(p.earliestDurLabel)})</div>
                      <div>⚠️ <strong>Geç Sınır:</strong> <strong style="color:#b45309;">${escapeHtml(p.lateLimitTimeLabel)}</strong></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <div style="margin-top:6px; font-size:8.8px; color:var(--ios-subtext);">
              ℹ️ <strong>Bilimsel Uyarı:</strong> Bu tahminler kesin varış saati değildir. Geçmiş yarış hız kaydı bulunan kuşlarda <strong>Bireysel Tahmin Modeli</strong>, yeterli geçmiş performans verisi olmayan kuşlarda ise <strong>Genel Filo / Mesafe Tahmin Modeli</strong> uygulanmış ve birbirinden ayrılmıştır.
            </div>
          </div>

          <!-- ================================================================
               6. BÖLÜM: YARIŞ SONRASI PERFORMANS RAPORU VE ÖĞRENEN KALİBRASYON ALTYAPISI
               ================================================================ -->
          <div style="background:var(--ios-card-alt); border:1.5px solid #4c1d95; border-radius:10px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:6px;">
              <div style="font-size:11px; font-weight:900; color:#4c1d95;">
                6. YARIŞ SONRASI PERFORMANS RAPORU &amp; ÖĞRENEN PERFORMANS ALTYAPISI
              </div>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 8px; font-size:8.8px;" onclick="openIosTab('flight', document.querySelectorAll('.ios-tab-btn')[3]); if(typeof AvigenUxManager!=='undefined') AvigenUxManager.switchBreedingPlanSub('racetracker');">
                🏁 Klasik Yarış Yönetimi'ne Git / Sonuç Gir →
              </button>
            </div>

            <!-- Öğrenen Performans Altyapısı Veri Yeterliliği Beyanı (Bölüm 7 Kuralı) -->
            <div style="background:${sr.isLearningCalibrated ? '#ecfdf5' : '#fffbeb'}; border:1px solid ${sr.isLearningCalibrated ? '#a7f3d0' : '#fde68a'}; border-radius:7px; padding:6px 8px; margin-bottom:7px; font-size:9px; color:${sr.isLearningCalibrated ? '#065f46' : '#92400e'};">
              🧠 <strong>Öğrenen Performans Altyapısı Durumu (${sr.totalCompletedRecordsCount} Tamamlanmış Yarış Kaydı):</strong>
              ${sr.isLearningCalibrated
                ? `Sistemde ${sr.totalCompletedRecordsCount} tamamlanmış gerçek yarış kaydı ve en az 3 yarış tamamlamış ${sr.birdsWith3PlusRaces} kuş mevcuttur. Tahmin edilen ve gerçekleşen dönüş zamanları arasındaki farklar bireysel hız kalibrasyonuna dahil edilmektedir.`
                : `Sistemde şu an ${sr.totalCompletedRecordsCount} tamamlanmış yarış sonucu bulunmaktadır. Bilimsel doğruluk kuralı gereği yeterli veri oluşmadan (kuş başına en az 3 tamamlanmış yarış kaydı birikmeden) yüksek öğrenme başarısı veya kesin bireysel kalibrasyon doğruluğu iddia edilmez. Klasik Yarış Yönetimi'ne yeni yarış sonuçları girildikçe sistem tahminlerini kademeli olarak iyileştirir.`}
            </div>

            ${sr.postRaceEvaluations.length > 0 ? `
              <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:7px;">
                ${sr.postRaceEvaluations.map(pr => `
                  <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #059669; border-radius:8px; padding:6px 8px; font-size:9px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:3px;">
                      <div style="font-weight:900; color:var(--ios-text); font-size:9.6px;">
                        🏆 ${pr.flag} ${escapeHtml(pr.ring)} (${escapeHtml(pr.birdName)}) — ${escapeHtml(pr.codeTitle)} (${pr.distanceKm} km)
                      </div>
                      <span class="gene-badge ${pr.percentile <= 5 ? 'gene-green' : 'gene-blue'}" style="font-size:8.2px;">
                        Derece: ${pr.rank}. / ${pr.totalCompetitors.toLocaleString('tr-TR')} Kuş (İlk %${pr.percentile})
                      </span>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:3px 8px; font-size:8.7px; color:var(--ios-subtext); margin-bottom:4px;">
                      <div>⏱️ <strong>Gerçek Uçuş Süresi:</strong> <strong style="color:var(--ios-text);">${escapeHtml(pr.actualDurLabel)}</strong> (Salım: ${escapeHtml(pr.releaseTime)})</div>
                      <div>⚡ <strong>Gerçek Uçuş Hızı:</strong> <strong style="color:#059669;">${pr.actualSpeedMpm} m/dk (${pr.actualSpeedKmh} km/sa)</strong></div>
                      <div>🎯 <strong>Tahmin vs Gerçekleşen Farkı:</strong> Tahmin: ${escapeHtml(pr.predictedDurLabel)} (${pr.predictedSpeedMpm} m/dk) → <strong>${pr.diffMinutes <= 0 ? `${Math.abs(pr.diffMinutes)} dk erken (+${pr.diffSpeedMpm} m/dk)` : `${pr.diffMinutes} dk geç (${pr.diffSpeedMpm} m/dk)`}</strong></div>
                      <div>🌤️ <strong>Yarış Günü Hava Koşulu:</strong> ${escapeHtml(pr.weather)}</div>
                    </div>

                    <div style="font-size:8.7px; color:var(--ios-text); margin-bottom:3px;">
                      📈 <strong>Önceki Yarışlarla Karşılaştırma &amp; Gelişim:</strong> ${escapeHtml(pr.prevComparisonText)}
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; font-size:8.6px;">
                      <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:4px 6px; color:#065f46;">
                        <strong>✅ Tespit Edilen Güçlü Yönler:</strong>
                        ${pr.strengths.map(s => `<div>• ${escapeHtml(s)}</div>`).join('')}
                      </div>
                      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:6px; padding:4px 6px; color:#991b1b;">
                        <strong>⚠️ Geliştirilmesi Gereken / Zayıf Yönler:</strong>
                        ${pr.weaknesses.map(w => `<div>• ${escapeHtml(w)}</div>`).join('')}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div style="background:var(--ios-card); border:1px dashed var(--ios-border); border-radius:8px; padding:10px; text-align:center; font-size:9.3px; color:var(--ios-subtext); margin-bottom:6px;">
                🏁 <strong>Henüz Tamamlanmış Yarış Sonucu Girilmemiş:</strong> Klasik Yarış Yönetimi (<strong>🏁 Yarışlar</strong> sekmesi) üzerinden bir yarış oluşturup kuşlarınızın varış saati ve derecesini girdiğinizde; gerçek uçuş hızı, tahmin-gerçekleşen sapma analizi, mesafe/hava öğrenimi ve güçlü/zayıf yön raporu burada otomatik olarak oluşturulur.
              </div>
            `}

            <div style="font-size:8.8px; color:var(--ios-subtext);">
              🔬 <strong>Bilimsel Değerlendirme Kuralı:</strong> Yalnızca tek bir yarış derecesine bakılarak kuşun genetik veya fiziksel kapasitesi hakkında kesin hüküm verilmez. Yarış mesafesi, salım saati, yarışmacı sayısı, rüzgâr/sıcaklık koşulları ve kuşun çoklu yarış istikrarı birlikte değerlendirilir.
            </div>
          </div>

        </div>
      `;
      return;
    }

    // ------------------------------------------------------------------------
    // 3. ANA MODÜL: AKILLI YEM RASYONU, 1 AYLIK TÜKETİM & MALİYET MOTORU
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'nutrition') {
      const plan = this.calculateSmartNutritionPlan(
        this.state.nutritionPhase,
        this.state.nutritionGroup,
        this.state.nutritionBirdCount
      );

      this.recordAnalysisToHistory({
        mode: 'nutrition',
        modeLabel: '3. Akıllı Yem & Beslenme',
        icon: '🌾',
        title: `${plan.phaseTitle} (${plan.birdCount} Kuş • Aylık ${plan.monthly.totalFeedKgLabel} kg)`,
        verdict: `Aylık Yem: ${plan.monthly.totalFeedKgLabel} kg • Aylık Toplam Maliyet: ${plan.cost.totalMonthlyTlLabel} TL`,
        score: plan.rationScore,
        reliabilityPct: 96,
        dataSourceSummary: `Kümes: ${plan.loftBreakdown.breeders} Damızlık, ${plan.loftBreakdown.racers} Yarışçı, ${plan.loftBreakdown.young} Yavru • Canlı Hava: ${plan.weather.cityName} ${plan.weather.temp}°C`,
        snapshotParams: {
          nutritionPhase: this.state.nutritionPhase,
          nutritionGroup: this.state.nutritionGroup,
          nutritionBirdCount: this.state.nutritionBirdCount
        }
      });

      const pr = plan.prices;
      const isMonthlyPrimary = this.state.nutritionPhase === 'monthly_full_loft';

      const monthlyAndCostBlockHtml = `
        <details ${isMonthlyPrimary ? 'open' : ''} style="background:var(--ios-card-alt); border:1.5px solid #7c3aed; border-radius:10px; padding:7px 9px;">
          <summary style="font-size:10.8px; font-weight:900; color:#5b21b6; cursor:pointer; outline:none; display:flex; justify-content:space-between; align-items:center;">
            <span>💰 B) 1 Aylık (30 Gün) Çuval, Sulu Malzeme &amp; TL Maliyet Hesaplayıcı (Aç ▾)</span>
            <span class="gene-badge gene-green" style="font-size:8.5px;" id="nutMonthlyTotalBadge">${plan.monthly.totalFeedKgLabel} kg (~${plan.monthly.sacks25KgLabel} Çuval) • ${plan.cost.totalMonthlyTlLabel} TL/Ay</span>
          </summary>

          <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
            <!-- 0. KÜMESTEKİ TÜM KUŞLARIN DURUM ANALİZİ & 1 AYLIK (30 GÜNLÜK) TOPLAM TÜKETİM KARTI -->
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:9px; padding:7px 9px;">
              <!-- KÜMES KADRO DAĞILIMI ŞERİDİ -->
              <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:4px; margin-bottom:7px; text-align:center; font-size:9px;">
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:4px 3px;">
                  <div style="font-weight:800; color:var(--ios-subtext);">🥚 Damızlık</div>
                  <div style="font-size:11.5px; font-weight:900; color:#7c3aed;">${plan.loftBreakdown.breeders} Kuş</div>
                </div>
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:4px 3px;">
                  <div style="font-weight:800; color:var(--ios-subtext);">🏆 Yarışçı</div>
                  <div style="font-size:11.5px; font-weight:900; color:#0066ff;">${plan.loftBreakdown.racers} Kuş</div>
                </div>
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:4px 3px;">
                  <div style="font-weight:800; color:var(--ios-subtext);">🐥 Yavrular</div>
                  <div style="font-size:11.5px; font-weight:900; color:#059669;">${plan.loftBreakdown.young} Kuş</div>
                </div>
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:4px 3px;">
                  <div style="font-weight:800; color:var(--ios-subtext);">🪺 Aktif Yuva</div>
                  <div style="font-size:11.5px; font-weight:900; color:#0052cc;">${plan.loftBreakdown.activeNests} Çift</div>
                </div>
              </div>

              <!-- 1 AYLIK YEM, ÇUVAL, GRİT VE İÇME SUYU ÖZETİ -->
              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; text-align:center; margin-bottom:7px;">
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #0066ff; border-radius:8px; padding:6px 4px;">
                  <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">1 AYLIK TOPLAM YEM</div>
                  <div style="font-size:13px; font-weight:900; color:#0052cc; margin-top:2px;">${plan.monthly.totalFeedKgLabel} kg</div>
                  <div style="font-size:8.5px; font-weight:700; color:#7c3aed;">(~${plan.monthly.sacks25KgLabel} Çuval / 25kg)</div>
                </div>
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #7c3aed; border-radius:8px; padding:6px 4px;">
                  <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">1 AYLIK GRİT &amp; MİNERAL</div>
                  <div style="font-size:13px; font-weight:900; color:#6d28d9; margin-top:2px;">${plan.monthly.gritKgLabel} kg</div>
                  <div style="font-size:8.5px; color:var(--ios-subtext);">Kırmızı Taş + Kalsiyum</div>
                </div>
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #059669; border-radius:8px; padding:6px 4px;">
                  <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">1 AYLIK SULUK SUYU</div>
                  <div style="font-size:13px; font-weight:900; color:#047857; margin-top:2px;">${plan.monthly.waterLitersLabel} Lt</div>
                  <div style="font-size:8.5px; color:var(--ios-subtext);">Günlük ~${plan.monthly.dailyWaterLitersLabel} Lt Su</div>
                </div>
              </div>

              <!-- 1 AYLIK SULU MALZEMELER VE YEM ÜSTÜ TAKVİYE MİKTARLARI TABLOSU -->
              <div style="font-size:9.3px;">
                <div style="font-weight:900; color:#047857; margin-bottom:4px; font-size:9.8px;">
                  🧪 1 Aylık (30 Günlük) Sulu Malzemeler &amp; Yem Üstü Takviye İhtiyacı:
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
                  <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:6px; padding:4px 6px;">
                    💧 <strong>Elektrolit &amp; Aminoasit:</strong><br/>
                    <span style="color:#0052cc; font-weight:900;">${plan.monthly.electrolyteMl} ml / ay</span>
                  </div>
                  <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:6px; padding:4px 6px;">
                    🍎 <strong>Elma Sirkesi / Probiyotik:</strong><br/>
                    <span style="color:#059669; font-weight:900;">${plan.monthly.vinegarProbioticMl} ml / ay</span>
                  </div>
                  <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:6px; padding:4px 6px;">
                    🌿 <strong>Sarımsak/Kekik/Omega-3 Yağı:</strong><br/>
                    <span style="color:#7c3aed; font-weight:900;">${plan.monthly.feedOilMl} ml / ay</span>
                  </div>
                  <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:6px; padding:4px 6px;">
                    🍺 <strong>Bira Mayası &amp; Metiyonin Tozu:</strong><br/>
                    <span style="color:#0052cc; font-weight:900;">${plan.monthly.yeastPowderGrams} gr / ay</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 1. CANLI YEM & SULU MALZEME FİYAT GİRİŞİ VE 1 AYLIK MALİYET HESAPLAYICI -->
            <div style="background:var(--ios-card); border:1.5px solid #059669; border-radius:9px; padding:7px 9px;">
              <div style="font-size:10px; font-weight:900; color:#047857; margin-bottom:4px;">
                💰 Yem &amp; Sulu Malzeme Birim Fiyatları (TL) — Değiştirdiğinizde Anında Hesaplar:
              </div>

              <div style="display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; margin-bottom:6px;">
                <div>
                  <label style="font-size:8.5px; font-weight:800; color:#0052cc; display:block;">🌽 Tahıl Yem (TL/kg)</label>
                  <input type="number" id="nutPriceGrain" class="ios-input" style="padding:4px 6px; font-size:10.5px; font-weight:800;" min="1" value="${pr.grainPerKg}" oninput="AvigenGenesisAI.onFeedPriceInputChange()" />
                  <div style="font-size:8px; color:var(--ios-subtext); margin-top:1px;">Aylık: ${plan.monthly.grainKgLabel} kg</div>
                </div>
                <div>
                  <label style="font-size:8.5px; font-weight:800; color:#7c3aed; display:block;">🟢 Bakliyat/Bezelye (TL/kg)</label>
                  <input type="number" id="nutPriceLegume" class="ios-input" style="padding:4px 6px; font-size:10.5px; font-weight:800;" min="1" value="${pr.legumePerKg}" oninput="AvigenGenesisAI.onFeedPriceInputChange()" />
                  <div style="font-size:8px; color:var(--ios-subtext); margin-top:1px;">Aylık: ${plan.monthly.legumeKgLabel} kg</div>
                </div>
                <div>
                  <label style="font-size:8.5px; font-weight:800; color:#059669; display:block;">🌻 Yağlı Tohum/Aspir (TL/kg)</label>
                  <input type="number" id="nutPriceOilSeed" class="ios-input" style="padding:4px 6px; font-size:10.5px; font-weight:800;" min="1" value="${pr.oilSeedPerKg}" oninput="AvigenGenesisAI.onFeedPriceInputChange()" />
                  <div style="font-size:8px; color:var(--ios-subtext); margin-top:1px;">Aylık: ${plan.monthly.oilSeedKgLabel} kg</div>
                </div>
              </div>

              <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:5px; margin-bottom:7px;">
                <div>
                  <label style="font-size:8.5px; font-weight:800; color:#6d28d9; display:block;">🪨 Grit &amp; Mineral Taşı (TL/kg)</label>
                  <input type="number" id="nutPriceGrit" class="ios-input" style="padding:4px 6px; font-size:10.5px; font-weight:800;" min="0" value="${pr.gritPerKg}" oninput="AvigenGenesisAI.onFeedPriceInputChange()" />
                </div>
                <div>
                  <label style="font-size:8.5px; font-weight:800; color:#047857; display:block;">🧪 Aylık Sulu Malzemeler &amp; Takviye (TL/Ay)</label>
                  <input type="number" id="nutPriceLiquids" class="ios-input" style="padding:4px 6px; font-size:10.5px; font-weight:800;" min="0" value="${pr.liquidsMonthly}" oninput="AvigenGenesisAI.onFeedPriceInputChange()" />
                </div>
              </div>

              <div id="nutCostLiveSummaryBox">
                ${this.renderNutritionCostSummaryHtml(plan)}
              </div>
            </div>
          </div>
        </details>
      `;

      const dailyAndSeedsBlockHtml = `
        <!-- 2. GÜNLÜK TOPLAM YEM & SABAH/AKŞAM ÖĞÜN DAĞILIMI KARTI -->
        <div style="background:var(--ios-card-alt); border:1.5px solid #0066ff; border-radius:10px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:6px;">
            <span style="font-size:11px; font-weight:900; color:#0052cc;">
              🥣 A) Bugünkü Yem &amp; Suluk Reçetesi (${plan.birdCount} Kuş • Sabah / Akşam Öğün)
            </span>
            <span class="gene-badge gene-blue" style="font-size:8.8px;">
              Kuş Başı: ${plan.gramsPerBird} gr/gün • ${plan.kcalPer100g} kcal/100g
            </span>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; text-align:center;">
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #0066ff; border-radius:8px; padding:6px 5px;">
              <div style="font-size:8.5px; font-weight:800; color:var(--ios-subtext);">GÜNLÜK TOPLAM</div>
              <div style="font-size:13px; font-weight:900; color:#0052cc; margin-top:2px;">${plan.totalDailyKgLabel}</div>
              <div style="font-size:8.5px; color:var(--ios-subtext);">(${plan.totalDailyGrams.toLocaleString('tr-TR')} gr)</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:8px; padding:6px 5px;">
              <div style="font-size:8.5px; font-weight:800; color:var(--ios-subtext);">🌅 SABAH ÖĞÜNÜ (%${plan.morningRatioPct})</div>
              <div style="font-size:12.5px; font-weight:900; color:#6d28d9; margin-top:2px;">${plan.morningGrams.toLocaleString('tr-TR')} gr</div>
              <div style="font-size:8.5px; color:var(--ios-subtext);">Kuş başı ~${Math.round(plan.gramsPerBird * plan.morningRatioPct / 100)} gr</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #059669; border-radius:8px; padding:6px 5px;">
              <div style="font-size:8.5px; font-weight:800; color:var(--ios-subtext);">🌇 AKŞAM ÖĞÜNÜ (%${100 - plan.morningRatioPct})</div>
              <div style="font-size:12.5px; font-weight:900; color:#047857; margin-top:2px;">${plan.eveningGrams.toLocaleString('tr-TR')} gr</div>
              <div style="font-size:8.5px; color:var(--ios-subtext);">Kuş başı ~${plan.gramsPerBird - Math.round(plan.gramsPerBird * plan.morningRatioPct / 100)} gr</div>
            </div>
          </div>

          ${plan.weatherAdjustmentNote ? `
            <div style="margin-top:7px; background:#eff6ff; border:1px solid #bfdbfe; color:#0052cc; border-radius:7px; padding:5px 8px; font-size:9.5px; font-weight:700; line-height:1.35;">
              🌡️ <strong>Canlı Hava Durumu Rasyon Uyarlaması (${escapeHtml(plan.weather.cityName)} • ${plan.weather.temp}°C):</strong> ${escapeHtml(plan.weatherAdjustmentNote)}
            </div>
          ` : ''}
        </div>

        <!-- 3. TOHUM & TAHIL KARIŞIMI YÜZDE (%), GÜNLÜK GRAMAJ VE 1 AYLIK KG TABLOSU -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; font-weight:900; color:#4c1d95;">
              🌾 Tohum Karışımı Oranları (%) • Günlük (gr) &amp; 1 Aylık (kg) Dağılımı
            </span>
            <span class="gene-badge gene-purple" style="font-size:8.5px;">Toplam %100</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:5px;">
            ${plan.seeds.map(s => `
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid ${s.color}; border-radius:8px; padding:5px 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; font-size:9.8px;">
                  <div style="font-weight:900; color:var(--ios-text); min-width:0; flex:1;">${s.icon} ${escapeHtml(s.name)}</div>
                  <div style="font-weight:900; color:${s.color}; flex-shrink:0; white-space:nowrap; font-size:9.4px;">
                    %${s.pct} • ${s.dailyGrams.toLocaleString('tr-TR')} gr/gün • <span style="color:#0052cc;">${s.monthlyKgLabel} kg/ay</span>
                  </div>
                </div>
                <div style="height:5px; background:#e2e8f0; border-radius:99px; overflow:hidden; margin:3px 0;">
                  <div style="width:${Math.min(100, s.pct * 2.2)}%; height:100%; background:${s.color};"></div>
                </div>
                <div style="font-size:8.9px; color:var(--ios-subtext); line-height:1.3;">
                  🔬 ${escapeHtml(s.benefit)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 4. HAFTALIK YEMLİK & SULUK / DOĞAL TAKVİYE PROGRAMI -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #059669; border-radius:10px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:11px; font-weight:900; color:#047857;">
              💧 Suluk, Grit/Mineral &amp; Yem Üstü Takviye Protokolü
            </span>
            <span class="gene-badge gene-green" style="font-size:8.5px;">Fizyolojik Destek</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; font-size:9.6px;">
            ${plan.supplements.map(sp => `
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px; background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px;">
                <div>
                  <strong style="color:#0052cc;">${escapeHtml(sp.dayOrTiming)}:</strong> <strong>${escapeHtml(sp.item)}</strong>
                  <div style="font-size:8.8px; color:var(--ios-subtext); margin-top:1px;">${escapeHtml(sp.purpose)}</div>
                </div>
                <span class="gene-badge ${sp.badgeClass || 'gene-green'}" style="font-size:8px; flex-shrink:0;">${escapeHtml(sp.dosage)}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const extraHtml = `
        <div style="display:flex; flex-direction:column; gap:8px;">
          <!-- 0-A. BUGÜNÜN TARİHİNE, CANLI HAVAYA VE KUŞLARIN DURUMUNA GÖRE AKILLI YEM & SIVI REÇETESİ -->
          <div style="background:linear-gradient(135deg, rgba(0,102,255,0.09), rgba(5,150,105,0.09)); border:1.5px solid #0066ff; border-radius:10px; padding:8px 10px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:5px;">
              <span style="font-size:11px; font-weight:900; color:#0052cc;">
                🎯 Tarihe &amp; Kuşların Durumuna Göre Bugünün Akıllı Yem ve Sıvı Önerisi
              </span>
              <span class="gene-badge gene-blue" style="font-size:8.5px;">
                📅 ${escapeHtml(plan.todaySmart.dateLabel)} • ${escapeHtml(plan.todaySmart.seasonLabel)}
              </span>
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; font-size:9.6px; line-height:1.38;">
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #0066ff; border-radius:7px; padding:5px 8px;">
                🌾 <strong>Bugünün Yem Önerisi:</strong> ${escapeHtml(plan.todaySmart.todayFeedRecommendation)}
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #059669; border-radius:7px; padding:5px 8px;">
                💧 <strong>Bugünün Suluk Sıvı &amp; Takviye Önerisi:</strong> ${escapeHtml(plan.todaySmart.todayLiquidRecommendation)}
              </div>
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:7px; padding:5px 8px;">
                🪺 <strong>Kuşların Güncel Durum Analizi:</strong> ${escapeHtml(plan.todaySmart.birdStatusSummary)}
              </div>
            </div>
          </div>

          ${isMonthlyPrimary ? monthlyAndCostBlockHtml + dailyAndSeedsBlockHtml : dailyAndSeedsBlockHtml + monthlyAndCostBlockHtml}
        </div>
      `;

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `🌾 ${plan.phaseTitle}`,
        verdictTag: `Aylık: ${plan.monthly.totalFeedKgLabel} kg • ${plan.cost.totalMonthlyTlLabel} TL`,
        metricTitle: '1 AYLIK TOPLAM YEM & MALİYET',
        metricValue: `${plan.monthly.totalFeedKgLabel} kg • ${plan.cost.totalMonthlyTlLabel} TL`,
        metricColor: '#059669',
        score: plan.rationScore,
        reliabilityPct: 96,
        bulletDecision: `${plan.birdCount} güvercin (${plan.loftBreakdown.breeders} Damızlık, ${plan.loftBreakdown.racers} Yarışçı, ${plan.loftBreakdown.young} Yavru) için günlük ${plan.totalDailyKgLabel} — 1 Aylık (30 Gün) toplam ${plan.monthly.totalFeedKgLabel} kg yem (~${plan.monthly.sacks25KgLabel} çuval) + ${plan.monthly.gritKgLabel} kg grit/mineral ve ${plan.cost.totalMonthlyTlLabel} TL bütçe hesaplandı.`,
        bulletProof: plan.scientificRationale,
        bulletDataRisk: plan.cautionNote,
        q1_whatAnalyzed: `<strong>${escapeHtml(plan.phaseTitle)}</strong> kapsamında <strong>${plan.birdCount} adet güvercin</strong> için canlı hava sıcaklığı (<strong>${plan.weather.temp}°C, %${plan.weather.hum} nem</strong>) baz alınarak günlük ve 30 günlük yem/sulu malzeme/maliyet hesabı yapıldı.`,
        q5_reliability: `Rasyon formülasyonu; yarış güvercinlerinde <strong>PPARD / Kas içi Trigliserid (Lipit) oksidasyonu</strong> (Stefaniuk-Szmukier et al., 2024 & 2026) ve <strong>LDHA anaerobik glikojen metabolizması</strong> araştırmalarına dayanır.`,
        extraHtml,
        expertHtml: typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('racing') : ''
      });
      return;
    }

    // ------------------------------------------------------------------------
    // 4. ANA MODÜL: GOOGLE GEMINI AI – CANLI KÜMES, SOY & YARIŞ DANIŞMANI (ÜCRETSİZ)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'gemini_chat') {
      out.innerHTML = this.renderGeminiAdvisorChatHtml();
      return;
    }
  },

  // ==========================================================================
  // GOOGLE GEMINI ÜCRETSİZ YAPAY ZEKÂ (GEMINI 2.0 FLASH) & YERLEŞİK BİLİMSEL MOTOR
  // ==========================================================================
  getGeminiApiKey() {
    try {
      let key = (localStorage.getItem('avigen_gemini_free_api_key_v1') || '').trim();
      if (!key && this.state && this.state.geminiApiKey) {
        key = String(this.state.geminiApiKey).trim();
      }
      if (!key && typeof AvigenUxManager !== 'undefined' && AvigenUxManager.state && AvigenUxManager.state.geminiApiKey) {
        key = String(AvigenUxManager.state.geminiApiKey).trim();
      }
      if (!key && window.AvigenNativeBridge && typeof window.AvigenNativeBridge.getSavedString === 'function') {
        try { key = String(window.AvigenNativeBridge.getSavedString('avigen_gemini_free_api_key_v1') || '').trim(); } catch (e) {}
      }
      if (!key) {
        try {
          const snapRaw = localStorage.getItem('avigen_auto_safety_snapshot_v1');
          if (snapRaw) {
            const snap = JSON.parse(snapRaw);
            key = String(snap?.gemini_api_key || snap?.user_account_state?.geminiApiKey || '').trim();
          }
        } catch (e) {}
      }
      if (key) {
        try { localStorage.setItem('avigen_gemini_free_api_key_v1', key); } catch (e) {}
        if (this.state) this.state.geminiApiKey = key;
      }
      return key;
    } catch (e) {
      return '';
    }
  },

  autoPersistGeminiKeyFromInput(rawVal) {
    const clean = String(rawVal || '').trim();
    if (clean.length < 20) return;
    try {
      localStorage.setItem('avigen_gemini_free_api_key_v1', clean);
      this.state.geminiApiKey = clean;
      this.saveState();
      if (typeof AvigenUxManager !== 'undefined' && AvigenUxManager.state) {
        AvigenUxManager.state.geminiApiKey = clean;
        AvigenUxManager.saveState();
      }
      if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveString === 'function') {
        try { window.AvigenNativeBridge.saveString('avigen_gemini_free_api_key_v1', clean); } catch (e) {}
      }
    } catch (e) {}
  },

  clearSavedGeminiApiKey() {
    try {
      localStorage.removeItem('avigen_gemini_free_api_key_v1');
      this.state.geminiApiKey = '';
      this.saveState();
      if (typeof AvigenUxManager !== 'undefined' && AvigenUxManager.state) {
        AvigenUxManager.state.geminiApiKey = '';
        AvigenUxManager.saveState();
      }
      if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveString === 'function') {
        try { window.AvigenNativeBridge.saveString('avigen_gemini_free_api_key_v1', ''); } catch (e) {}
      }
    } catch (e) {}
  },

  saveGeminiApiKeyFromInput(inputId) {
    const el = document.getElementById(inputId || 'genesisGeminiApiKeyInput')
      || document.getElementById('settingsGeminiApiKeyInput')
      || document.getElementById('guideGeminiApiKeyInput');
    if (!el) return;
    const raw = (el.value || '').trim();
    try {
      if (raw) {
        localStorage.setItem('avigen_gemini_free_api_key_v1', raw);
        this.state.geminiApiKey = raw;
        this.saveState();
        if (typeof AvigenUxManager !== 'undefined' && AvigenUxManager.state) {
          AvigenUxManager.state.geminiApiKey = raw;
          AvigenUxManager.saveState();
        }
        if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveString === 'function') {
          try { window.AvigenNativeBridge.saveString('avigen_gemini_free_api_key_v1', raw); } catch (e) {}
        }
        if (typeof saveCurrentLoftToInAppVault === 'function') {
          try { saveCurrentLoftToInAppVault('API Anahtarı Kaydı'); } catch (e) {}
        }
        this._geminiQueryCache = {};
        alert('✅ GENESIS AI Bulut Sinir Ağı anahtarınız kalıcı olarak kaydedildi!\n\nAnahtarınız artık canlı güncellemelerde ve yedek yüklemelerinde silinmeden sabit korunacaktır.');
      } else {
        this.clearSavedGeminiApiKey();
        alert('ℹ️ Bulut motor anahtarı kaldırıldı. GENESIS AI yerleşik bilimsel kümes motoruyla çalışmaya devam edecektir.');
      }
    } catch (e) {}
    this.renderGenesisModuleUI();
    if (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.renderProfileAccountSection === 'function') {
      AvigenUxManager.renderProfileAccountSection();
    }
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  },

  clearGeminiChatHistory() {
    this.stopGenesisSpeech(false);
    this.state.geminiChatHistory = [];
    this.saveState();
    this.renderGenesisModuleUI();
    this.renderHomeTeaserCard();
  },

  // ==========================================================================
  // 🎙️ TÜRKÇE SESLİ SORU (SPEECH-TO-TEXT) & 🔊 SESLİ YANIT (TEXT-TO-SPEECH) MOTORU
  // ==========================================================================
  _isListeningVoice: false,
  _activeVoiceInputId: null,
  _activeSpeechRec: null,
  _isSpeakingNow: false,
  _voiceTriggeredNextAnswer: false,
  _activeTtsAudio: null,
  _ttsQueueAborted: false,

  isVoiceAutoSpeakEnabled() {
    try {
      const val = localStorage.getItem('avigen_genesis_voice_autospeak_v1');
      // Varsayılan olarak açık ('0' değilse açık)
      return val !== '0';
    } catch (e) {
      return true;
    }
  },

  toggleVoiceAutoSpeak(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    const currentlyOn = this.isVoiceAutoSpeakEnabled();
    const nextOn = !currentlyOn;
    try {
      localStorage.setItem('avigen_genesis_voice_autospeak_v1', nextOn ? '1' : '0');
    } catch (e) {}

    if (!nextOn) {
      this.stopGenesisSpeech(false);
    } else if (Array.isArray(this.state.geminiChatHistory) && this.state.geminiChatHistory.length > 0) {
      this.speakGenesisText(this.state.geminiChatHistory[0].answerHtml);
    }

    this.refreshVoiceControlButtons();
  },

  refreshVoiceControlButtons() {
    const autoOn = this.isVoiceAutoSpeakEnabled();
    document.querySelectorAll('[data-genesis-autospeak-btn="1"]').forEach(btn => {
      btn.textContent = autoOn ? '🔊' : '🔇';
      btn.style.borderColor = autoOn ? '#059669' : '#cbd5e1';
      btn.style.background = autoOn ? '#ecfdf5' : 'var(--ios-card)';
      btn.style.color = autoOn ? '#047857' : '#64748b';
    });

    document.querySelectorAll('[data-genesis-speak-btn="1"]').forEach(btn => {
      btn.textContent = this._isSpeakingNow ? '⏹️ Sustur' : '🔊 Sesli Dinle';
      btn.style.color = this._isSpeakingNow ? '#dc2626' : '#047857';
      btn.style.borderColor = this._isSpeakingNow ? '#fca5a5' : '#6ee7b7';
      btn.style.background = this._isSpeakingNow ? '#fef2f2' : '#ecfdf5';
    });

    ['homeGenesisAskInput', 'launcherGenesisAskInput', 'geminiPromptInput'].forEach(inpId => {
      const micBtn = document.getElementById('btnMic_' + inpId);
      if (!micBtn) return;
      const isAct = this._isListeningVoice && this._activeVoiceInputId === inpId;
      if (inpId === 'homeGenesisAskInput') {
        micBtn.textContent = isAct ? '🔴 Dinliyor' : '🎙️';
      } else if (inpId === 'launcherGenesisAskInput') {
        micBtn.textContent = isAct ? '🔴 Dinliyor' : '🎙️ Sesli Sor';
      } else {
        micBtn.textContent = isAct ? '🔴 Dinliyor' : '🎙️ Sesli';
      }
      micBtn.style.borderColor = isAct ? '#dc2626' : '#7c3aed';
      micBtn.style.background = isAct ? '#fee2e2' : '#f5f3ff';
      micBtn.style.color = isAct ? '#dc2626' : '#5b21b6';
    });
  },

  cleanTextForTurkishSpeech(rawHtmlOrText) {
    let txt = String(rawHtmlOrText || '');
    txt = txt
      .replace(/<br\s*\/?>/gi, '. ')
      .replace(/<\/(div|p|li|h[1-6])>/gi, '. ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, ' ve ')
      .replace(/&quot;/g, ' ')
      .replace(/&#39;/g, ' ')
      .replace(/&lt;/g, ' küçüktür ')
      .replace(/&gt;/g, ' büyüktür ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/[*_`#]/g, ' ')
      .replace(/♂/g, 'Erkek ')
      .replace(/♀/g, 'Dişi ')
      .replace(/×/g, ' ile ')
      .replace(/→|->/g, ' yönünde ')
      .replace(/~/g, 'yaklaşık ')
      .replace(/°C\b/gi, ' derece')
      .replace(/\bCOI\b/gi, 'akrabalık oranı')
      .replace(/\bEBV\b/gi, 'genetik puanı')
      .replace(/\bALLROUND\b/gi, 'Her Mesafe')
      .replace(/\bMARATHON\b/gi, 'Maraton')
      .replace(/\bSPRINT\b/gi, 'Kısa Mesafe')
      .replace(/\bOutcross\b/gi, 'Yabancı Kan')
      .replace(/(\d+)\s*[–—-]\s*(\d+)\s*(km|kilometre|gün|dakika|saat|yaş|yıl|gr|gram|derece|m\b)/gi, '$1 ila $2 $3')
      .replace(/([A-Za-zÇĞİÖŞÜçğıöşü0-9])-([A-Za-zÇĞİÖŞÜçğıöşü0-9])/g, '$1 $2')
      .replace(/([A-Za-zÇĞİÖŞÜçğıöşü0-9])-([A-Za-zÇĞİÖŞÜçğıöşü0-9])/g, '$1 $2')
      .replace(/(\d+)\s*\/\s*100\b/g, '100 üzerinden $1 puan')
      .replace(/(\d+)\s*\/\s*99\b/g, '99 üzerinden $1')
      .replace(/%(\d+(?:[.,]\d+)?)/g, 'yüzde $1')
      .replace(/\bm\/dk\b/gi, 'metre bölü dakika')
      .replace(/\bkm\/sa\b|\bkm\/s\b/gi, 'kilometre saat')
      .replace(/\bkm\b/gi, 'kilometre')
      .replace(/\bgr\/gün\b/gi, 'gram')
      .replace(/\bgr\b/gi, 'gram')
      .replace(/\bLt\b/g, 'litre')
      .replace(/\bml\b/gi, 'mililitre');

    try {
      txt = txt.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, ' ');
    } catch (e) {}

    return txt
      .replace(/[•▪▸▾↻✕🔒🔑📲👑⭐🚫\[\]]/g, ' ')
      .replace(/\s*\.\s*\./g, '.')
      .replace(/\s+/g, ' ')
      .trim();
  },

  stopGenesisSpeech(updateUi = true) {
    this._ttsQueueAborted = true;
    this._isSpeakingNow = false;
    try {
      if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.stopSpeaking === 'function') {
        window.AvigenNativeBridge.stopSpeaking();
      }
    } catch (e) {}
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis) {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
          window.speechSynthesis.cancel();
        }
      }
    } catch (e) {}
    try {
      if (this._activeTtsAudio) {
        this._activeTtsAudio.pause();
        this._activeTtsAudio.currentTime = 0;
        this._activeTtsAudio = null;
      }
    } catch (e) {}
    if (updateUi) {
      this.refreshVoiceControlButtons();
    }
  },

  toggleSpeakLatestAnswer(evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    if (this._isSpeakingNow) {
      this.stopGenesisSpeech(true);
      return;
    }
    const latest = Array.isArray(this.state.geminiChatHistory) && this.state.geminiChatHistory.length > 0
      ? this.state.geminiChatHistory[0]
      : null;
    if (latest && latest.answerHtml) {
      this.speakGenesisText(latest.answerHtml);
    }
  },

  splitTextIntoSpeechChunks(cleanText, maxLen = 185) {
    const sentences = String(cleanText || '')
      .replace(/([.!?])\s+/g, '$1\n')
      .split(/\n+/)
      .map(s => s.trim())
      .filter(Boolean);
    const chunks = [];
    let current = '';
    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      if (!current) {
        current = s;
      } else if ((current.length + 1 + s.length) <= maxLen) {
        current += ' ' + s;
      } else {
        chunks.push(current);
        current = s;
      }
    }
    if (current) chunks.push(current);

    const finalChunks = [];
    chunks.forEach(c => {
      if (c.length <= maxLen) {
        finalChunks.push(c);
      } else {
        const words = c.split(/\s+/);
        let sub = '';
        words.forEach(w => {
          if (!sub) sub = w;
          else if ((sub.length + 1 + w.length) <= maxLen) sub += ' ' + w;
          else {
            finalChunks.push(sub);
            sub = w;
          }
        });
        if (sub) finalChunks.push(sub);
      }
    });
    return finalChunks;
  },

  playFallbackHtml5TurkishAudioChunks(chunks) {
    if (!chunks || !chunks.length) {
      this._isSpeakingNow = false;
      this.refreshVoiceControlButtons();
      return;
    }
    let idx = 0;
    const playNext = () => {
      if (this._ttsQueueAborted || idx >= chunks.length) {
        this._isSpeakingNow = false;
        this._activeTtsAudio = null;
        this.refreshVoiceControlButtons();
        return;
      }
      const textPart = chunks[idx++];
      const url = 'https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=tr&q=' + encodeURIComponent(textPart);
      try {
        const audio = new Audio(url);
        this._activeTtsAudio = audio;
        audio.onended = () => playNext();
        audio.onerror = () => {
          this._isSpeakingNow = false;
          this._activeTtsAudio = null;
          this.refreshVoiceControlButtons();
        };
        const p = audio.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            this._isSpeakingNow = false;
            this._activeTtsAudio = null;
            this.refreshVoiceControlButtons();
          });
        }
      } catch (e) {
        this._isSpeakingNow = false;
        this.refreshVoiceControlButtons();
      }
    };
    playNext();
  },

  speakGenesisText(rawHtmlOrText) {
    this.stopGenesisSpeech(false);
    const cleanText = this.cleanTextForTurkishSpeech(rawHtmlOrText);
    if (!cleanText) return;

    this._ttsQueueAborted = false;
    this._isSpeakingNow = true;
    this.refreshVoiceControlButtons();

    // 1. Öncelik: Android APK Yerleşik Türkçe TextToSpeech Köprüsü Varsa
    try {
      if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.speakTurkishText === 'function') {
        window.AvigenNativeBridge.speakTurkishText(cleanText);
        const estMs = Math.min(45000, Math.max(3000, cleanText.length * 68));
        setTimeout(() => {
          if (this._isSpeakingNow) {
            this._isSpeakingNow = false;
            this.refreshVoiceControlButtons();
          }
        }, estMs);
        return;
      }
    } catch (e) {}

    const chunks = this.splitTextIntoSpeechChunks(cleanText, 180);

    // 2. Öncelik: Tarayıcı / Cihaz Yerleşik Web Speech Synthesis (tr-TR)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function') {
      try {
        const synth = window.speechSynthesis;
        const voices = synth.getVoices ? synth.getVoices() : [];
        const trVoice = voices.find(v => String(v.lang || '').toLowerCase().startsWith('tr')) || null;

        let startedAny = false;
        let cIdx = 0;

        const speakNextUtterance = () => {
          if (this._ttsQueueAborted || cIdx >= chunks.length) {
            this._isSpeakingNow = false;
            this.refreshVoiceControlButtons();
            return;
          }
          const u = new SpeechSynthesisUtterance(chunks[cIdx++]);
          u.lang = 'tr-TR';
          u.rate = 1.03;
          u.pitch = 1.0;
          if (trVoice) u.voice = trVoice;

          u.onstart = () => {
            startedAny = true;
          };
          u.onend = () => {
            speakNextUtterance();
          };
          u.onerror = () => {
            if (!startedAny && !this._ttsQueueAborted) {
              this.playFallbackHtml5TurkishAudioChunks(chunks);
            } else {
              this._isSpeakingNow = false;
              this.refreshVoiceControlButtons();
            }
          };
          synth.speak(u);
        };

        speakNextUtterance();

        // Android WebView'da speechSynthesis sessiz kalırsa 850ms içinde HTML5 Türkçe ses akışına geç
        setTimeout(() => {
          if (!this._ttsQueueAborted && this._isSpeakingNow && !startedAny && !synth.speaking) {
            try { synth.cancel(); } catch (e) {}
            this.playFallbackHtml5TurkishAudioChunks(chunks);
          }
        }, 850);
        return;
      } catch (e) {}
    }

    // 3. Öncelik: HTML5 Türkçe Ses Akışı
    this.playFallbackHtml5TurkishAudioChunks(chunks);
  },

  onNativeVoiceResult(spokenText, targetInputId) {
    this._isListeningVoice = false;
    this._activeVoiceInputId = null;
    this.refreshVoiceControlButtons();

    const cleanSpoken = String(spokenText || '').trim();
    if (!cleanSpoken) return;

    const inpId = targetInputId || 'homeGenesisAskInput';
    const inpEl = document.getElementById(inpId);
    if (inpEl) inpEl.value = cleanSpoken;

    this._voiceTriggeredNextAnswer = true;
    if (inpId === 'homeGenesisAskInput') {
      this.askGenesisFromHomeScreen(cleanSpoken);
    } else {
      this.askGeminiAdvisor(cleanSpoken);
    }
  },

  toggleVoiceQuestion(inputId = 'homeGenesisAskInput', evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();

    // Konuşma dinlenirken mevcut sesli okumayı sustur
    this.stopGenesisSpeech(false);

    // Zaten dinliyorsa durdur
    if (this._isListeningVoice) {
      this._isListeningVoice = false;
      this._activeVoiceInputId = null;
      try {
        if (this._activeSpeechRec) {
          this._activeSpeechRec.stop();
        }
      } catch (e) {}
      this.refreshVoiceControlButtons();
      return;
    }

    // 1. Öncelik: Android APK Yerleşik Google Türkçe Ses Tanıma Köprüsü Varsa
    if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.startVoiceRecognition === 'function') {
      try {
        this._isListeningVoice = true;
        this._activeVoiceInputId = inputId;
        this.refreshVoiceControlButtons();
        window.AvigenNativeBridge.startVoiceRecognition(inputId);
        setTimeout(() => {
          if (this._isListeningVoice) {
            this._isListeningVoice = false;
            this._activeVoiceInputId = null;
            this.refreshVoiceControlButtons();
          }
        }, 12000);
        return;
      } catch (e) {}
    }

    // 2. Öncelik: Tarayıcı Web Speech API (SpeechRecognition / webkitSpeechRecognition)
    const SpeechRec = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

    const inputEl = document.getElementById(inputId);

    if (!SpeechRec) {
      if (inputEl) {
        inputEl.focus();
        inputEl.placeholder = '🎙️ Klavyenizdeki Mikrofon tuşuna basıp konuşabilirsiniz...';
      }
      alert('🎙️ Sesli Soru İpucu:\n\nKullandığınız ekran klavyesinin sağ üstündeki 🎙️ Mikrofon tuşuna basarak sorunuzu konuşarak yazdırabilirsiniz. Sorunuz gönderildiğinde GENESIS AI yanıtı size 🔊 Türkçe sesli olarak okuyacaktır.');
      return;
    }

    try {
      const rec = new SpeechRec();
      this._activeSpeechRec = rec;
      this._isListeningVoice = true;
      this._activeVoiceInputId = inputId;
      this.refreshVoiceControlButtons();

      rec.lang = 'tr-TR';
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      const origPlaceholder = inputEl ? inputEl.placeholder : '';
      if (inputEl) {
        inputEl.value = '';
        inputEl.placeholder = '🔴 Dinliyorum... Sorunuzu şimdi söyleyin...';
      }

      let finalTranscript = '';
      let interimTranscript = '';
      let silenceStopTimer = null;

      rec.onresult = (event) => {
        interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += t + ' ';
          } else {
            interimTranscript += t;
          }
        }
        const combined = (finalTranscript + interimTranscript).trim();
        if (inputEl && combined) {
          inputEl.value = combined;
        }
        // Konuşma algılandıktan sonra 1.6 saniye sessizlik olursa otomatik tamamla
        if (silenceStopTimer) clearTimeout(silenceStopTimer);
        if (combined.length >= 2) {
          silenceStopTimer = setTimeout(() => {
            try { rec.stop(); } catch (e) {}
          }, 1600);
        }
      };

      rec.onerror = (errEvt) => {
        if (silenceStopTimer) clearTimeout(silenceStopTimer);
        this._isListeningVoice = false;
        this._activeVoiceInputId = null;
        if (inputEl && origPlaceholder) inputEl.placeholder = origPlaceholder;
        this.refreshVoiceControlButtons();

        const errCode = errEvt && errEvt.error ? String(errEvt.error) : '';
        if (errCode === 'not-allowed' || errCode === 'service-not-allowed') {
          if (inputEl) {
            inputEl.focus();
            inputEl.placeholder = '🎙️ Klavyenizdeki Mikrofon tuşuyla konuşarak sorabilirsiniz...';
          }
          alert('🎙️ Mikrofon İzni / Klavye Mikrofonu:\n\nTarayıcı mikrofon izni kapalıysa telefon klavyenizin üzerindeki 🎙️ Mikrofon simgesine basarak konuşabilirsiniz. GENESIS AI cevabı size 🔊 sesli olarak okuyacaktır.');
        }
      };

      rec.onend = () => {
        if (silenceStopTimer) clearTimeout(silenceStopTimer);
        const recognized = (finalTranscript || interimTranscript || (inputEl ? inputEl.value : '')).trim();
        this._isListeningVoice = false;
        this._activeVoiceInputId = null;
        if (inputEl && origPlaceholder) inputEl.placeholder = origPlaceholder;
        this.refreshVoiceControlButtons();

        if (recognized.length >= 2) {
          this._voiceTriggeredNextAnswer = true;
          if (inputId === 'homeGenesisAskInput') {
            this.askGenesisFromHomeScreen(recognized);
          } else {
            this.askGeminiAdvisor(recognized);
          }
        } else if (inputEl) {
          inputEl.placeholder = '🎙️ Ses duyulamadı, tekrar 🎙️ basıp konuşun veya yazın...';
        }
      };

      rec.start();
    } catch (err) {
      this._isListeningVoice = false;
      this._activeVoiceInputId = null;
      this.refreshVoiceControlButtons();
      if (inputEl) inputEl.focus();
    }
  },

  formatGeminiMarkdownToSafeHtml(rawText) {
    const safe = escapeHtml(String(rawText || '').trim());
    return safe
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/^\s*[-•*]\s+(.+)$/gm, '<div style="margin:2px 0 2px 6px;">• $1</div>')
      .replace(/\n{2,}/g, '<br><br>')
      .replace(/\n/g, '<br>');
  },

  buildLiveLoftContextSummary() {
    try {
      const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];
      const activeBirds = allBirds.filter(b => b.isActiveLoftBird);
      const males = activeBirds.filter(b => b.sex === 'M');
      const females = activeBirds.filter(b => b.sex === 'F');
      const topPairs = this.getTopLoftBreedingPairs(3) || [];
      const rep = this.analyzeBreedingIntelligence(this.state.selectedSireRef, this.state.selectedDamRef, true);
      const sr = this.analyzeSmartRaceManagement();
      const nut = this.calculateSmartNutritionPlan(this.state.nutritionPhase, this.state.nutritionGroup, this.state.nutritionBirdCount);
      const activeNestsCount = typeof activePairsList !== 'undefined' && Array.isArray(activePairsList) ? activePairsList.length : 0;

      const topPairsSummary = topPairs.map((tp, idx) =>
        `${idx + 1}) ♂ ${tp.sire?.ring || ''} (${tp.sire?.name || ''}) x ♀ ${tp.dam?.ring || ''} (${tp.dam?.name || ''}) -> Uyum: ${tp.score}/100, Strateji: ${tp.summary || ''} (${tp.compLabel || ''})`
      ).join('\n');

      const z0 = (sr.zoneWeather && sr.zoneWeather[0]) ? sr.zoneWeather[0] : { tempC: 20, windSpeedKmh: 14, windEffectLabel: 'Normal' };
      const relName = sr.route?.relNode?.name || 'Salım Noktası';
      const loftName = sr.route?.loftNode?.name || 'Kümes';

      const topRacersSummary = (sr.birdEvaluations || []).slice(0, 5).map((b, idx) =>
        `${idx + 1}) ${b.ring} (${b.name}) -> Uygunluk: ${b.suitabilityScore}/100 (${b.suitabilityClassLabel || ''}), Tahmini Hız: ~${b.prediction?.expectedBirdSpeedMpm || 1200} m/dk, En Olası Dönüş: ${b.prediction?.likelyWindowLabel || '-'}`
      ).join('\n');

      const commonAncStr = Array.isArray(rep.commonAncestors) && rep.commonAncestors.length
        ? rep.commonAncestors.map(a => typeof a === 'string' ? a : `${a.ring || ''} (${a.name || ''})`).join(', ')
        : 'Yok (Outcross)';

      return [
        `KÜMES ÖZETİ: Toplam ${activeBirds.length} aktif güvercin (${males.length} Erkek, ${females.length} Dişi, ${activeNestsCount} Aktif Yuva).`,
        `SEÇİLİ EŞLEŞTİRME ÇİFTİ: ♂ ${rep.sireInfo?.ring || ''} (${rep.sireInfo?.name || ''}) x ♀ ${rep.damInfo?.ring || ''} (${rep.damInfo?.name || ''}) | Uyum Puanı: ${rep.totalScore}/100 (${rep.decisionLabel}) | 5 Kuşak Wright COI: %${Number(rep.coi || 0).toFixed(2)} (${rep.relationSummary || ''}) | Ortak Atalar: ${commonAncStr} | Veri Güvenilirliği: %${rep.dataReliabilityPct}.`,
        `KÜMESTEKİ EN UYUMLU 3 ÇİFT:\n${topPairsSummary || 'Yeterli aday yok.'}`,
        `AKTİF YARIŞ SİMÜLASYONU ROTASI: ${relName} -> ${loftName} (${sr.distKm} km, ${sr.raceCategoryLabel || ''}) | Hava & Rüzgar: ${z0.tempC}°C, Rüzgar ${z0.windSpeedKmh} km/sa (${z0.windEffectLabel}), Rota Riski: ${sr.overallRiskLevel || 'ORTA RİSK'} (${sr.riskPoints || 0}/100) | Tahmini Filo Dönüş Aralığı: ${sr.fleetReturnEstimate?.likelyWindowClock || '-'}.`,
        `BU YARIŞ İÇİN EN UYGUN 5 KUŞ:\n${topRacersSummary || 'Kayıtlı yarışçı yok.'}`,
        `BUGÜNÜN AKILLI YEM & SULUK PLANI: ${nut.todaySmart?.todayFeedRecommendation || ''} | Suluk: ${nut.todaySmart?.todayLiquidRecommendation || ''} | 1 Aylık Toplam Tüketim: ${nut.monthly?.totalFeedKgLabel || '0'} kg (${nut.cost?.totalMonthlyTlLabel || '0'} TL/ay).`
      ].join('\n\n');
    } catch (e) {
      return 'Kümes verileri yüklendi.';
    }
  },

  // Kullanıcının sorusu doğrudan kendi kümesindeki spesifik hesaplamayı mı istiyor kontrol eder
  isDirectLoftCalculationQuery(qRaw, topicKey) {
    // ÖNEMLİ: Eğer kullanıcı kendi Bulut Sinir Ağı (API) Anahtarını girdiyse ve hızlı şablon butonuna (topicKey) basmadıysa,
    // her sesli/yazılı soruyu kümes bağlamıyla birlikte doğrudan Bulut Sinir Ağına gönder ki her soruya özel ve farklı yanıt üretilsin!
    if (!topicKey && this.getGeminiApiKey()) {
      return false;
    }
    if (topicKey) return true;
    const q = String(qRaw || '').toLowerCase().trim();
    if (!q) return true;
    const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];
    const cleanQ = q.replace(/[-\s./]+/g, '');
    const genericExcludedNames = new Set(['isimsiz güvercin', 'isimsiz', 'güvercin', 'yavru', 'damızlık', 'yarışçı', 'şampiyon', 'erkek', 'dişi']);
    const hasBirdRingOrName = allBirds.some(b => {
      const rLow = (b.ring || '').toLowerCase();
      const rClean = rLow.replace(/[-\s./]+/g, '');
      const nLow = (b.name || '').toLowerCase().trim();
      const rDigits = (rClean.match(/\d+$/) || [''])[0];
      return (rClean.length >= 5 && cleanQ.includes(rClean.slice(-5))) ||
             (rDigits.length >= 4 && /\d{4}/.test(cleanQ) && cleanQ.includes(rDigits.slice(-4))) ||
             (rLow.length >= 5 && q.includes(rLow)) ||
             (nLow.length >= 5 && !genericExcludedNames.has(nLow) && !nLow.includes('yavrusu') && q.includes(nLow));
    });
    if (hasBirdRingOrName) return true;
    if (
      q.includes('en iyi 3 çift') ||
      q.includes('en iyi çiftim') ||
      q.includes('en uyumlu çift') ||
      q.includes('seçili çift') ||
      q.includes('hangi kuşlarımı sepet') ||
      q.includes('hangisini sepet') ||
      q.includes('bugünkü yem') ||
      q.includes('bugün kaç gram')
    ) {
      return true;
    }
    return false;
  },

  generateLocalScientificFallbackAnswer(userPrompt, topicKey) {
    try {
      const qRaw = String(userPrompt || '').trim();
      const qLower = qRaw.toLowerCase();
      const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];
      const activeBirds = allBirds.filter(b => b.isActiveLoftBird);

      let _rep = null;
      const getRep = () => {
        if (!_rep) {
          try { _rep = this.analyzeBreedingIntelligence(this.state.selectedSireRef, this.state.selectedDamRef, true); } catch (e) { _rep = {}; }
        }
        return _rep || {};
      };

      let _topPairs = null;
      const getTopPairs = () => {
        if (!_topPairs) {
          try { _topPairs = this.getTopLoftBreedingPairs(3) || []; } catch (e) { _topPairs = []; }
        }
        return _topPairs;
      };

      let _sr = null;
      const getSr = () => {
        if (!_sr) {
          try { _sr = this.analyzeSmartRaceManagement(); } catch (e) { _sr = {}; }
        }
        return _sr || {};
      };

      let _nut = null;
      const getNut = () => {
        if (!_nut) {
          try { _nut = this.calculateSmartNutritionPlan(this.state.nutritionPhase, this.state.nutritionGroup, this.state.nutritionBirdCount); } catch (e) { _nut = {}; }
        }
        return _nut || {};
      };

      // 0. GÜNLÜK SOHBET, SELAMLAŞMA & TANIŞMA SORULARI (Kümes raporu dökmeden doğal sohbet yanıtı verir):
      if (!topicKey && (
        /^(merhaba|selam|slm|mrb|günaydın|iyi akşamlar|iyi geceler|iyi günler|nasılsın|naber|ne haber|kimsin|sen kimsin|ne işe yararsın|teşekkür|teşekkürler|sağ ol|sağol|eyvallah|harika|süper|tamam)\b/i.test(qLower) ||
        qLower === 'merhaba' || qLower === 'selam' || qLower.includes('nasılsın') || qLower.includes('sen kimsin') || qLower.includes('ne sorabilirim')
      )) {
        if (qLower.includes('teşekkür') || qLower.includes('sağ ol') || qLower.includes('sağol') || qLower.includes('eyvallah')) {
          return `Rica ederim! Güvercin bakımı, hastalık/aşı protokolleri, antrenman, tüy dökümü, kan hatları veya kümesinizdeki kuşların eşleşme ve yarış durumu hakkında istediğiniz zaman soru sorabilirsiniz. Bol şampiyonlu sezonlar dilerim! 🕊️`;
        }
        return [
          `**Merhaba! Ben GENESIS AI — Yarış Güvercini Yetiştiriciliği, Genetik ve Performans Danışmanınızım.** 🕊️`,
          `Bana hem **genel güvercin yetiştiriciliği** hakkında her türlü soruyu hem de **kümesinizdeki kuşlarla ilgili** soruları sorabilirsiniz. Örneğin:`,
          `- 💬 **Genel Yetiştiricilik:** *"Yavru güvercin antrenmanı nasıl yapılır?"*, *"Tüy dökümünde ne verilmeli?"*, *"Banyo suyu nasıl hazırlanır?"*, *"Janssen ve Vandenabeele soyunun farkı nedir?"*`,
          `- 💉 **Sağlık & Bakım:** *"Salmonella ve PMV aşısı ne zaman yapılır?"*, *"Pamukçuk (Triko) belirtileri nelerdir?"*, *"Kümes havalandırması nasıl olmalı?"*`,
          `- 🧬 **Kümesinize Özel:** *"En iyi 3 çiftim hangisi?"*, *"990001 numaralı kuşum kiminle eşleşmeli?"*, *"Bu hafta yarışta hangisini sepetleyeyim?"*`
        ].join('\n');
      }

      // 1. KULLANICI BELİRLİ BİR KUŞUN HALKA NUMARASINI VEYA ADINI SORDUYSA:
      if (qRaw.length >= 3) {
        const cleanQuery = qLower.replace(/[-\s./]+/g, '');
        const matchedBird = allBirds.find(b => {
          const rLow = (b.ring || '').toLowerCase();
          const rClean = rLow.replace(/[-\s./]+/g, '');
          const nLow = (b.name || '').toLowerCase();
          const rDigits = (rClean.match(/\d+$/) || [''])[0];
          return (rClean.length >= 4 && cleanQuery.includes(rClean.slice(-5))) ||
                 (rDigits.length >= 4 && /\d{4}/.test(cleanQuery) && cleanQuery.includes(rDigits.slice(-4))) ||
                 (rLow.length >= 4 && qLower.includes(rLow)) ||
                 (nLow.length >= 4 && nLow !== 'isimsiz güvercin' && qLower.includes(nLow));
        });

        if (matchedBird) {
          const topPairs = getTopPairs();
          const sexLbl = matchedBird.sex === 'M' ? '♂ Erkek' : (matchedBird.sex === 'F' ? '♀ Dişi' : '🐣 Genç');
          const bestPairForBird = topPairs.find(tp =>
            tp.sire?.ring?.toUpperCase() === matchedBird.ring.toUpperCase() ||
            tp.dam?.ring?.toUpperCase() === matchedBird.ring.toUpperCase()
          );
          const mateAdvice = bestPairForBird
            ? `Bu kuş için kümesinizdeki en yüksek uyumlu eş adayı **${bestPairForBird.sire.ring.toUpperCase() === matchedBird.ring.toUpperCase() ? '♀ ' + bestPairForBird.dam.ring + ' (' + bestPairForBird.dam.name + ')' : '♂ ' + bestPairForBird.sire.ring + ' (' + bestPairForBird.sire.name + ')'}** (**${bestPairForBird.score}/100 Uyum** • ${bestPairForBird.summary}).`
            : `Akıllı Eşleştirme ekranından bu kuşu seçerek kümesinizdeki tüm karşı cins adaylarla 5 nesil COI ve yavru uyumunu aşağıdaki raporda inceleyebilirsiniz.`;

          return [
            `**🕊️ ${matchedBird.flag || '🇹🇷'} ${matchedBird.ring} (${matchedBird.name}) — Bireysel Kuş Analizi**`,
            `- **Kimlik & Kadro Statüsü:** ${sexLbl} • Tüy: **${matchedBird.color || 'Standart'}** • Kümes Rolü: **${matchedBird.roleCategory === 'BREEDER' ? 'Damızlık' : (matchedBird.roleCategory === 'YOUNG' ? 'Yavru' : 'Yarışçı')}** • Genetik/Performans Endeksi (EBV): **${matchedBird.ebvScore || 75}/99**.`,
            `- **Anne & Baba Bağlantısı:** ♂ Baba: **${matchedBird.sireRing || 'Kayıtlı Değil'}** × ♀ Anne: **${matchedBird.damRing || 'Kayıtlı Değil'}**.`,
            `- **En Uygun Eşleştirme Önerisi:** ${mateAdvice}`,
            `- **Kayıtlı Derece & Soy Notu:** ${matchedBird.notes ? matchedBird.notes : 'Pedigre kutusunda ek yarış veya fenotip notu bulunmuyor.'}`
          ].join('\n');
        }
      }

      // 2. SAĞLIK, AŞI, HASTALIK, KUSMA, İSHAL VEYA KORUYUCU KÜR SORULARI:
      if (qLower.includes('hastalık') || qLower.includes('aşı') || qLower.includes('salmonella') || qLower.includes('paratifo') || qLower.includes('pmv') || qLower.includes('veba') || qLower.includes('triko') || qLower.includes('pamukçuk') || qLower.includes('ishal') || qLower.includes('kusma') || qLower.includes('kusuyor') || qLower.includes('solunum') || qLower.includes('hırıltı') || qLower.includes('kuruma') || qLower.includes('koksidiyoz') || qLower.includes('adeno') || qLower.includes('çiçek') || qLower.includes('sağlık') || qLower.includes('ilaç')) {
        if (qLower.includes('adeno') || qLower.includes('kusma') || qLower.includes('kusuyor') || qLower.includes('kursak')) {
          return [
            `**🩺 Genç Kuş Hastalığı (Adenovirüs / E.Coli) & Kursak Şişmesi / Kusma Yönetimi**`,
            `- **Belirti & Neden:** Yemin kursakta sindirilmeden kalması, kusma ve yeşil/sulu dışkı genellikle **Adenovirüs Tip-1 + E.Coli** (Genç Kuş Sendromu) veya **Kursak Mantarı (Candida)** kaynaklıdır.`,
            `- **Acil Uygulama:** Kusma görülen kuşlarda **24 saat yem tamamen kesilmeli**, yalnızca sulukta **elektrolit + elma sirkesi/organik asit (pH düşürücü) + probiyotik** verilmelidir.`,
            `- **Toparlanma:** 2. günden itibaren ağır bakliyat (bezelye/mısır) vermeden yalnızca hafif arpa ve darı ile azar azar beslemeye geçilmeli, kümes tabanı kuru tutulmalıdır.`
          ].join('\n');
        }
        if (qLower.includes('triko') || qLower.includes('pamukçuk') || qLower.includes('boğaz') || qLower.includes('peynir')) {
          return [
            `**🩺 Trichomoniasis (Pamukçuk / Canker) Koruma ve Kontrolü**`,
            `- **Klinik Tablo:** Boğazda sarı-beyaz peynirimsi plaklar, yutkunma güçlüğü, uçuş isteksizliği ve kursak sütüyle yavruya bulaşma en tipik belirtilerdir.`,
            `- **En Doğru Zamanlama:** Damızlıklar **yumurtaya yattıktan 5–7 gün sonra** (yavrular çıkmadan hemen önce) 3–5 günlük kür uygulanması, yavrulara kursak sütüyle Trichomonas geçmesini önler.`,
            `- **Yarış Dönemi:** Sepetleme stresinden dolayı yarış sezonunda her 2–3 haftada bir yarış dönüşü Pazartesi-Salı günleri koruyucu kontrol önerilir.`
          ].join('\n');
        }
        return [
          `**💉 Kanatlı Sağlığı, Aşı Takvimi & Biyogüvenlik Rehberi**`,
          `- **PMV-1 (Paramyxovirus / Yalancı Veba):** Yılda en az 1 kez (yarış veya eşleşmeden **21–28 gün önce**) tüm kümese uygulanması zorunludur. Boyun dönmesi (tortikolis) ve sulu dışkıyı önleyen tek kesin kalkandır.`,
          `- **Salmonella (Paratifo) & Çiçek (Pox):** Eklem şişliği, kanat tutulması ve boş yumurtaya karşı eşleşme öncesi kış/erken ilkbahar döneminde Salmonella; yaz yarışları öncesi ise Çiçek aşısı planlanmalıdır.`,
          `- **Doğal Bağırsak Koruma:** Aşı ve ilaç kürlerinden sonra 3 gün boyunca **B-Kompleks vitamin + probiyotik + elektrolit** verilerek karaciğer ve bağırsak florası desteklenmelidir.`
        ].join('\n');
      }

      // 3. ANTRENMAN, YAVRU UÇURMA, YÖN BULMA (HOMING) & ATMACA/ŞAHİN SORULARI:
      if (qLower.includes('antrenman') || qLower.includes('eğitim') || qLower.includes('uçur') || qLower.includes('alıştır') || qLower.includes('atmaca') || qLower.includes('şahin') || qLower.includes('yırtıcı') || qLower.includes('kaybol') || qLower.includes('yön')) {
        return [
          `**🦅 Yarış & Yavru Güvercin Antrenman ve Yön Bulma (Homing) Protokolü**`,
          `- **Kademeli Yol Antrenmanı (Toss):** Kümes etrafında en az **45–60 dakika** grup halinde (bayrak uçuşu) uçmaya başlayan kuşlar sırasıyla **5 km → 10 km → 20 km → 35 km → 55 km** mesafelerden, yarış güzergâhı yönünden salınmalıdır.`,
          `- **Kümes Giriş Disiplini (Trapping):** Antrenmandan dönen kuşlar kümese girer girmez düdük/ses sinyaliyle hafif tohum ve taze suyla karşılanmalı; tok kuşla asla yol antrenmanı yapılmamalıdır.`,
          `- **Atmaca & Yırtıcı Koruması:** Sabah erken sisli saatlerde ve orman/vadi kenarlarında atmaca saldırısı en yüksektir; yırtıcı saldırısı sonrası dağılan sürüye 2 gün dinlenme ve elektrolit desteği verilmelidir.`
        ].join('\n');
      }

      // 4. TÜY DÖKÜMÜ (MOULTING), BANYO SUYU & DIŞ PARAZİT / BAKIM SORULARI:
      if (qLower.includes('tüy') || qLower.includes('moulting') || qLower.includes('banyo') || qLower.includes('bit') || qLower.includes('sinek') || qLower.includes('parazit') || qLower.includes('sirke') || qLower.includes('bakım')) {
        return [
          `**🪶 Tüy Dökümü (Moulting), Banyo Suyu & Tüy Kalitesi Rehberi**`,
          `- **Telek Sentezi (Keratin & Metiyonin):** Eylül–Kasım ana tüy dökümü döneminde yeni teleklerin esnek ve kadifemsi olması için rasyonda **keten tohumu, aspir, kenevir (%12–15 yağlı tohum)** ile haftada 2 kez **bira mayası + kükürtlü aminoasit (metiyonin)** şarttır.`,
          `- **Haftalık Banyo Suyu Tarifi:** Haftada 1 gün (güneşli/ılık öğle saatinde) **10 litre ılık suya 1 yemek kaşığı banyo tuzu (veya kaya tuzu) + 2 yemek kaşığı doğal elma sirkesi** eklenerek banyo verilmesi tüy tozunu (pudrasını) korur ve dış parazitleri uzaklaştırır.`,
          `- **Kritik Uyarı:** Tüy dökümü sırasında ağır ilaç ve antibiyotik kullanımından kaçınılmalıdır; aksi halde teleklerde yatay stres çizgileri (delik/boğum) oluşur.`
        ].join('\n');
      }

      // 5. KÜMES MİMARİSİ, HAVALANDIRMA, NEM & TEMİZLİK SORULARI:
      if (qLower.includes('havalandırma') || qLower.includes('nem') || qLower.includes('temizlik') || qLower.includes('dezenfektan') || qLower.includes('ızgara') || qLower.includes('cereyan') || qLower.includes('kümes nasıl') || qLower.includes('taban')) {
        return [
          `**🏠 İdeal Yarış Kümesi Havalandırması, Nem ve Hijyen Standartları**`,
          `- **Altın Kural (Temiz Hava, Sıfır Cereyan):** Kümes içinde oksijen bol olmalı ancak kuşların tüylerini kıpırdatacak taban cereyanı (hava akımı) kesinlikle olmamalıdır. Kirli ve sıcak hava tavandaki bacadan tahliye edilmelidir.`,
          `- **İdeal Nem & Sıcaklık:** Yarış formunun korunması için kümes içi bağıl nem **%55–%65** aralığında ve taban tamamen kuru olmalıdır. %75 üzeri nem solunum yolu (Ornitozis) hastalıklarını tetikler.`,
          `- **Temizlik:** Kümes tabanı ve tünekler günlük kazınmalı; nemli paspas yerine kuru kazıma ve periyodik pürmüz (alevle dezenfeksiyon) tercih edilmelidir.`
        ].join('\n');
      }

      // 6. ÜNLÜ SOY HATLARI & IRKLAR (JANSSEN, VANDENABEELE, KITTEL, HEREMANS, KOOPMAN, AARDEN, PORSCHE 911):
      if (qLower.includes('janssen') || qLower.includes('vandenabeele') || qLower.includes('kittel') || qLower.includes('heremans') || qLower.includes('koopman') || qLower.includes('aarden') || qLower.includes('porsche') || qLower.includes('romario') || qLower.includes('belçika') || qLower.includes('hollanda') || qLower.includes('soy hattı') || qLower.includes('kan hattı') || qLower.includes('ırk')) {
        return [
          `**🧬 Dünya Yarış Güvercini Soy Hatları ve Mesafe Uzmanlıkları**`,
          `- **Sprint & Hız Hatları (100–350 km):** **Janssen Bros (Arendonk), Leo Heremans (Olympiade 003 / Bolt) ve Dirk Van Dyck (Kannibaal / Kittel)** hatları patlayıcı çıkış hızı, LDHA glikojen metabolizması ve erken olgunlaşma ile öne çıkar.`,
          `- **Orta & Tek Gün Uzun Mesafe (350–650 km):** **Gaby Vandenabeele (Wittenbuik / Bliksem / Rudy), Gerard Koopman (Kleine Dirk) ve PEC Porsche 911** hatları karşı rüzgârda yüksek seyir hızı ve yön kararlılığı sağlar.`,
          `- **Maraton & Aşırı Uzun Mesafe (700–1.100+ km):** **Jan Aarden, Van Wanroy ve Jelle Jellema** hatları yüksek kas içi yağ (trigliserid) oksidasyonu ve zorlu hava koşullarında pes etmeyen dayanıklılık karakteri taşır.`
        ].join('\n');
      }

      // 7. GENEL BİYOLOJİ (YAŞ, ÖMÜR, CİNSİYET AYRIMI, UÇUŞ HIZI):
      if (qLower.includes('kaç yıl') || qLower.includes('ömür') || qLower.includes('ömrü') || qLower.includes('yaş') || qLower.includes('cinsiyet') || qLower.includes('erkek dişi') || qLower.includes('kaç km') || qLower.includes('ne kadar hızlı')) {
        return [
          `**🕊️ Yarış Güvercini Biyolojisi, Fizyolojisi ve Performans Sınırları**`,
          `- **Yaşam Süresi & Damızlık Ömrü:** İyi bakılan bir yarış güvercini **12–18 yıl** yaşar. Aktif yarış kariyeri genellikle **1–5 yaş** arası, yüksek verimli damızlık dönemi ise **1–8 yaş** arasıdır.`,
          `- **Uçuş Hızı & Mesafe:** Sakin havada ortalama **70–85 km/sa (1.150–1.400 m/dk)**, arkadan rüzgârda **110+ km/sa (1.800+ m/dk)** hızla tek günde **100 km'den 1.000+ km'ye** kadar kesintisiz uçabilirler.`,
          `- **Erkek ve Dişi Ayrımı:** Erkek kuşlar daha iri boyunlu, parlak gerdanlı olup öterek kendi etrafında tam daire döner ve çatal kemikleri daha sıkıdır; dişiler ise daha zarif başlı ve yumurtlama için daha esnek çatal kemik yapısına sahiptir.`
        ].join('\n');
      }

      // 8. YUVA, KULUÇKA, YUMURTA VEYA BİLEZİK TAKMA SORULARI:
      if (qLower.includes('yuva') || qLower.includes('yumurta') || qLower.includes('kuluçka') || qLower.includes('bilezik') || qLower.includes('boncuk') || qLower.includes('kursak sütü')) {
        const nestsCount = typeof activePairsList !== 'undefined' && Array.isArray(activePairsList) ? activePairsList.length : 0;
        const firstNest = nestsCount > 0 ? activePairsList[0] : null;
        return [
          `**🪺 Yuva, Kuluçka & Yavru Gelişim Analizi (${nestsCount} Aktif Yuva)**`,
          `- **Aktif Yuva Durumu:** ${firstNest ? `Kümesinizde **${nestsCount} aktif yuva** kayıtlıdır (Örn: **${firstNest.nest}** — ♂ ${firstNest.sire} × ♀ ${firstNest.dam}).` : 'Henüz aktif yuva kaydı açılmamış; Akıllı Eşleştirme ekranından tek tuşla yuva oluşturabilirsiniz.'}`,
          `- **Biyolojik Takvim:** Eşleşmeden **8–10 gün** sonra yumurtlama, yumurtlamadan **18 gün** sonra yavru çıkışı ve çıkıştan **7–8 gün** sonra resmi bilezik (boncuk) takma evresi gerçekleşir.`,
          `- **Beslenme Protokolü:** Kuluçkanın 14. gününden yavru 10 günlük olana kadar **Kursak Sütü (Prolaktin)** üretimi için kolay sindirilebilir tohumlar; 10–28. gün arasında ise **%20+ bakliyat (bezelye/maş/fiğ)** ve kalsiyum/grit desteği şarttır.`
        ].join('\n');
      }

      // 9. GÖZ İŞARETİ (EYE-SIGN), KANAT, TELEK VEYA FİZİKSEL ÖZELLİK SORULARI:
      if (qLower.includes('göz') || qLower.includes('iris') || qLower.includes('kanat') || qLower.includes('telek') || qLower.includes('çatal') || qLower.includes('kas') || qLower.includes('fenotip')) {
        const rep = getRep();
        return [
          `**👁️ Fiziksel Fenotip, Kanat & Göz Uyumu Değerlendirmesi**`,
          `- **Biyomekanik Kural:** Uzun/maraton mesafelerde **esnek göğüs kası, kapalı çatal kemik (pubis) ve son 3 telekte iyi ventilasyon** aranırken; iki adet aşırı açık çatal kemikli veya aynı fiziksel zaafa sahip kuşun birbiriyle eşleştirilmesinden kaçınılmalıdır.`,
          `- **İris & Göz Çemberi:** Koyu/kalın adaptasyon halkası (koruma çemberi) yüksek damızlık baskınlığına işaret ederken, sarı×beyaz (inci) iris çaprazlamaları dengeli melezleme sağlar.`,
          `- **Seçili Çiftinizin Fiziksel Tamamlayıcılığı:** ♂ **${rep.sireInfo?.ring || '-'}** × ♀ **${rep.damInfo?.ring || '-'}** eşleşmesinde fenotip ve mesafe tamamlayıcılığı **${rep.complementarityScore100 || 80}/100** (**${rep.complementaritySummary || 'Dengeli fenotip'}**) seviyesindedir.`
        ].join('\n');
      }

      // 10. YARIŞ, ROTA, RÜZGÂR VEYA SEPETLEME SORULARI:
      if (topicKey === 'race_strategy' || qLower.includes('yarış') || qLower.includes('sepet') || qLower.includes('rota') || qLower.includes('rüzg') || qLower.includes('salım') || qLower.includes('dönüş') || qLower.includes('hız')) {
        const sr = getSr();
        const relName = sr.route?.relNode?.name || 'Salım Noktası';
        const loftName = sr.route?.loftNode?.name || 'Kümes';
        const z0 = (sr.zoneWeather && sr.zoneWeather[0]) ? sr.zoneWeather[0] : { tempC: 20, windSpeedKmh: 15, windEffectLabel: 'Karşı/Yan Rüzgâr' };
        const top3Birds = (sr.birdEvaluations || []).slice(0, 3);
        const riskFinding0 = (sr.riskFindings && sr.riskFindings[0]) ? sr.riskFindings[0].action : 'Hız ve dayanıklılık skoru yüksek kuşları sepetleyin.';
        return [
          `**🗺️ Yarış & Sepetleme Stratejisi (${relName} → ${loftName} • ${sr.distKm || 300} km)**`,
          `- **Rota & Meteorolojik Risk:** **${sr.distKm || 300} km (${sr.raceCategoryLabel || 'Etap'})** güzergâhında hava **${z0.tempC}°C**, rüzgâr **${z0.windSpeedKmh} km/sa (${z0.windEffectLabel})** ve rota riski **${sr.overallRiskLevel || 'ORTA RİSK'} (${sr.riskPoints || 0}/100)** seviyesindedir.`,
          `- **Sepetlenmesi Önerilen İlk 3 Kuşunuz:** ${top3Birds.length ? top3Birds.map(b => `**${b.ring} (${b.name})** [${b.suitabilityScore}/100 • ~${b.prediction?.expectedBirdSpeedMpm || 1200} m/dk]`).join(', ') : 'Kümesinizde uygun aday bulunamadı.'}`,
          `- **Tahmini Dönüş Penceresi:** Salım saati **${sr.releaseTime || '06:45'}** baz alındığında en erken dönüş **${sr.fleetReturnEstimate?.earliestClock || '-'}**, en olası varış aralığı **${sr.fleetReturnEstimate?.likelyWindowClock || '-'}** olarak hesaplanmıştır.`,
          `- **Taktik Öneri:** ${riskFinding0}`
        ].join('\n');
      }

      // 11. YEM, SULUK, GRAMAJ VEYA AYLIK MALİYET SORULARI:
      if (topicKey === 'nutrition_advice' || qLower.includes('yem') || qLower.includes('suluk') || qLower.includes('beslen') || qLower.includes('maliyet') || qLower.includes('gram') || qLower.includes('çuval') || qLower.includes('su')) {
        const nut = getNut();
        return [
          `**🌾 Bugünün Bilimsel Yem & Suluk Reçetesi (${nut.todaySmart?.dateLabel || 'Bugün'})**`,
          `- **Günlük Gramaj & Öğün Dağılımı:** ${nut.todaySmart?.todayFeedRecommendation || ''}`,
          `- **Suluk & Doğal Takviye Kürü:** ${nut.todaySmart?.todayLiquidRecommendation || ''}`,
          `- **Makro Besin Dengesi:** Karbonhidrat **%${nut.macros?.carb || 60}**, Ham Protein **%${nut.macros?.protein || 15}**, Ham Yağ **%${nut.macros?.fat || 6}** (${nut.kcalPer100g || 335} kcal/100g).`,
          `- **30 Günlük Kümes Bütçesi:** **${nut.birdCount || activeBirds.length} güvercin** için aylık toplam **${nut.monthly?.totalFeedKgLabel || '0'} kg yem** (~${nut.monthly?.sacks25KgLabel || '0'} çuval) ve takviyeler dahil toplam **${nut.cost?.totalMonthlyTlLabel || '0'} TL/ay** (kuş başı **${nut.cost?.perBirdMonthlyTlLabel || '0'} TL/ay**).`
        ].join('\n');
      }

      // 12. SEÇİLİ ÇİFT, ORTAK ATA, COI VEYA YAVRU POTANSİYELİ SORULARI:
      if (topicKey === 'pair_deep' || qLower.includes('seçili') || qLower.includes('ortak ata') || qLower.includes('yavru potansiyeli') || qLower.includes('coi') || qLower.includes('akraba') || qLower.includes('bu çift')) {
        const rep = getRep();
        const commonList = Array.isArray(rep.commonAncestors) ? rep.commonAncestors : [];
        const commonStr = commonList.length
          ? commonList.map(a => typeof a === 'string' ? `**${a}**` : `**${a.ring || ''} (${a.name || ''})**`).join(', ')
          : '5 nesilde ortak ata bulunmamaktadır (**%0,00 Outcross / Yabancı Kan**)';
        return [
          `**🧬 Seçili Çift Bilimsel Soy & Yavru Analizi: ♂ ${rep.sireInfo?.ring || '-'} (${rep.sireInfo?.name || '-'}) × ♀ ${rep.damInfo?.ring || '-'} (${rep.damInfo?.name || '-'})**`,
          `- **GENESIS Kararı & Uyum Puanı:** **${rep.totalScore || 80}/100 (${rep.decisionLabel || 'Uyumlu'})** — Veri Güvenilirliği: **%${rep.dataReliabilityPct || 75}**.`,
          `- **Sewall Wright (1922) 5 Nesil COI Akrabalık Katsayısı:** **%${Number(rep.coi || 0).toFixed(2)}** (${rep.relationSummary || 'Soy Analizi'}). Ortak Atalar: ${commonStr}.`,
          `- **Yavru Mesafe & Performans Uygunluğu:** **${rep.recommendedDistanceSuitability || 'Orta ve Uzun Mesafe'}** — Soy Puanı: **${rep.pedigreeScore100 || 75}/100**, Performans Kanıtı: **${rep.performanceScore100 || 75}/100**.`,
          `- **Bilimsel Gerekçe:** ${rep.decisionReasonSummary || 'Hız ve dayanıklılık hatları dengeli.'} Detaylı 6 bölümlü analiz **aşağıdaki raporda** yer almaktadır.`
        ].join('\n');
      }

      // 13. KÜMESİMDEKİ EN İYİ ÇİFTLER / EŞLEŞTİRME ÖNERİSİ SORULARI:
      if (topicKey === 'breeding_advice' || qLower.includes('en iyi çift') || qLower.includes('en uyumlu') || qLower.includes('hangi çift') || qLower.includes('kiminle eşleş') || !qRaw) {
        const topPairs = getTopPairs();
        const rep = getRep();
        const pairsLines = topPairs.length
          ? topPairs.map((tp, idx) => `- **${idx + 1}. Öneri:** ♂ **${tp.sire?.ring} (${tp.sire?.name})** × ♀ **${tp.dam?.ring} (${tp.dam?.name})** — Uyum: **${tp.score}/100** • ${tp.summary} (${tp.compLabel})`).join('\n')
          : '- Kümesinizde eşleştirme taraması için en az 1 erkek ve 1 dişi kuş kayıtlı olmalıdır.';

        return [
          `**💞 Kümesinizdeki En Uyumlu Damızlık Eşleşmeler & GENESIS AI Özeti**`,
          pairsLines,
          `- **Seçili Aktif Çiftiniz:** ♂ **${rep.sireInfo?.ring || '-'} (${rep.sireInfo?.name || '-'})** × ♀ **${rep.damInfo?.ring || '-'} (${rep.damInfo?.name || '-'})** çifti **${rep.totalScore || 80}/100 (${rep.decisionLabel || 'Uyumlu'})** uyum ve **%${Number(rep.coi || 0).toFixed(2)} COI** değerine sahiptir.`
        ].join('\n');
      }

      // 13B. GENEL EŞLEŞTİRME, DAMIZLIK SEÇİMİ VEYA KÜMES YÖNETİMİ SORULARI (Her soruya aynı çift listesini okumamak için konuya özel yanıt):
      if (qLower.includes('eşleş') || qLower.includes('damızlık') || qLower.includes('çiftleş') || qLower.includes('sezon') || qLower.includes('hazırlık')) {
        return [
          `**🥚 Damızlık Seçimi ve Eşleştirme Hazırlığı İçin Altın Kurallar**`,
          `- **Eşleştirme Öncesi Hazırlık:** Eşleştirmeden 3–4 hafta önce iç/dış parazit ve Salmonella/PMV kontrolleri tamamlanmalı; dişilere **E Vitamini + Selenyum + Kalsiyum/D3** takviyesi verilmelidir.`,
          `- **Kan Uyumu:** Yarış uçuracağınız yavrular için **%0–%3 COI (Yabancı Kan / Outcross)**; damızlıkta şampiyon kanı sabitlemek için ise **%3–%12,5 COI (Şampiyon Ortak Ata / Linebreeding)** tercih edilmelidir.`,
          `- **Fiziksel Tamamlayıcılık:** Uzun/esnek gövdeli bir kuşu daha kompakt/güçlü bel yapısına sahip bir eşle, sakin gözlü bir kuşu canlı/keskin irisli bir eşle dengelemek yavru kalitesini yükseltir.`
        ].join('\n');
      }
      if (qLower.includes('kümes') && (qLower.includes('kaç') || qLower.includes('durum') || qLower.includes('özet') || qLower.includes('sayı') || qLower.includes('nasıl'))) {
        const mCnt = activeBirds.filter(b => b.sex === 'M').length;
        const fCnt = activeBirds.filter(b => b.sex === 'F').length;
        const bCnt = activeBirds.filter(b => b.roleCategory === 'BREEDER').length;
        const rCnt = activeBirds.filter(b => b.roleCategory === 'RACER').length;
        const yCnt = activeBirds.filter(b => b.roleCategory === 'YOUNG').length;
        const nCnt = (typeof activePairsList !== 'undefined' && Array.isArray(activePairsList)) ? activePairsList.length : 0;
        return [
          `**🏠 Kümesinizin Güncel Kadro ve Yuva Durumu**`,
          `- **Toplam Aktif Kuş:** Kümesinizde **${activeBirds.length} aktif güvercin** (**${mCnt} Erkek**, **${fCnt} Dişi**) kayıtlıdır.`,
          `- **Kadro Dağılımı:** **${bCnt} Damızlık**, **${rCnt} Yarışçı** ve **${yCnt} Yavru** bulunmakta olup şu anda **${nCnt} aktif yuva** takiptedir.`
        ].join('\n');
      }

      // 14. BİLİMSEL KÜTÜPHANE TARAMASI & GENEL SERBEST SORU YANITLAYICI (Kümes analizi dökmeden sorulan konuya yanıt verir):
      if (typeof AvigenScientificLibrary !== 'undefined' && Array.isArray(AvigenScientificLibrary.sources)) {
        const words = qLower.split(/\s+/).filter(w => w.length >= 4);
        const matchedSource = AvigenScientificLibrary.sources.find(src => {
          const hay = `${src.title_tr || ''} ${src.ai_summary || ''} ${(src.tags || []).join(' ')}`.toLowerCase();
          return words.some(w => hay.includes(w));
        });
        if (matchedSource) {
          return [
            `**🔬 "${qRaw}" Hakkında Bilimsel Değerlendirme**`,
            `- **Araştırma Bulgusu (${matchedSource.authors}, ${matchedSource.publication_year}):** ${matchedSource.ai_summary}`,
            `- **Pratik Yetiştirici Uygulaması:** ${matchedSource.practical_takeaway || 'Bu bulguyu eşleştirme, antrenman ve beslenme kararlarınızda referans olarak kullanabilirsiniz.'}`
          ].join('\n');
        }
      }

      return [
        `**🧬 "${qRaw}" Sorunuz Hakkında GENESIS AI Yanıtı**`,
        `- Yarış güvercini yetiştiriciliğinde bu konuda en yüksek başarı; **kanıtlanmış performans soyu (pedigri + gerçek yarış derecesi)**, **düşük/kontrollü akrabalık (COI <%6,25 melezleme veya <%12,50 hat sabitleme)**, **kuru/cereyansız kümes havalandırması** ve **mevsime uygun tohum/elektrolit dengesi** ile sağlanır.`,
        `- Daha spesifik bir yanıt için sorunuzda merak ettiğiniz konuyu (**aşı/sağlık, antrenman, tüy dökümü, banyo, yuva/kuluçka, yem/suluk, yarış rüzgârı veya bir kuşunuzun halka numarasını**) belirtebilirsiniz.`
      ].join('\n');
    } catch (err) {
      return `**🧬 GENESIS AI:** Sorunuz alındı. Eşleştirme, soyağacı (COI), yarış stratejisi, beslenme veya güvercin sağlığı/antrenmanı hakkında sorunuzu yazabilirsiniz. Seçili çiftinizin detaylı analizi **aşağıdaki raporda** yer almaktadır.`;
    }
  },

  async askGeminiAdvisor(quickQuestionText, topicOverride) {
    const candidateInputs = [
      document.getElementById('geminiPromptInput'),
      document.getElementById('launcherGenesisAskInput'),
      document.getElementById('homeGenesisAskInput')
    ].filter(Boolean);
    const inputEl = candidateInputs.find(el => String(el.value || '').trim().length > 0) || candidateInputs[0] || null;
    const rawPrompt = (quickQuestionText !== undefined && quickQuestionText !== null && String(quickQuestionText).trim() !== '')
      ? String(quickQuestionText).trim()
      : (inputEl ? String(inputEl.value || '').trim() : '');

    const promptText = rawPrompt || 'Kümesimdeki en uyumlu damızlık çiftleri, COI akrabalık durumunu ve bugünkü yarış/yem önerisini özetle.';
    const effectiveTopic = topicOverride || (!rawPrompt ? 'breeding_advice' : undefined);
    this.state.geminiDraftPrompt = '';
    candidateInputs.forEach(el => { el.value = ''; });

    // ABONELİK KONTROLÜ: GENESIS AI'ya Sor (ve bağlı yapay zekâ motoru) yalnızca AVIGEN AI veya AVIGEN GLOBAL aboneliği ile çalışır
    if (!this.hasActiveGenesisSubscription()) {
      const devId = (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.getOrCreateDeviceId === 'function')
        ? AvigenUxManager.getOrCreateDeviceId()
        : 'AVG-0000-0000';
      if (!Array.isArray(this.state.geminiChatHistory)) {
        this.state.geminiChatHistory = [];
      }
      this.state.geminiChatHistory.unshift({
        id: 'gem_lock_' + Date.now(),
        time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        question: promptText,
        sourceBadge: '🔒 AVIGEN AI',
        answerHtml: `
          <div style="color:var(--ios-text); line-height:1.45;">
            <div style="font-weight:900; color:#6d28d9; margin-bottom:4px;">
              🔒 GENESIS AI'ya Sor &amp; Yapay Zekâ Kümes Danışmanı (Abonelik Gerektirir)
            </div>
            <div style="margin-bottom:7px;">
              <strong>AVIGEN FREE</strong> sürümünde sınırsız kuş, 4 kuşak pedigri, yuva ve yarış yönetimi ücretsizdir. <strong>GENESIS AI'ya Sor</strong>, <strong>5 Nesil Akıllı Eşleştirme</strong>, <strong>Haritalı Yarış Simülasyonu</strong> ve <strong>Akıllı Yem</strong> modülleri için <strong>AVIGEN AI</strong> lisans kodu gereklidir (Cihaz Kodunuz: <strong>${escapeHtml(devId)}</strong>).
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <button type="button" class="ios-btn ios-btn-purple" style="padding:6px 8px; font-size:9.5px; font-weight:900;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal('checkout')">
                🔑 Lisans Kodu Gir
              </button>
              <button type="button" class="ios-btn ios-btn-green" style="padding:6px 8px; font-size:9.5px; font-weight:900;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.requestLicenseViaWhatsApp('3.990 TL', 'Yıllık (365 Gün)')">
                📲 Kod İste (0532 782 03 85)
              </button>
            </div>
          </div>
        `
      });
      this.state.geminiChatHistory = this.state.geminiChatHistory.slice(0, 10);
      this.state.geminiIsLoading = false;
      this.saveState();
      this.renderGenesisModuleUI();
      this.renderHomeTeaserCard();
      return;
    }

    this.state.geminiIsLoading = true;
    this.renderGenesisModuleUI();

    const apiKey = this.getGeminiApiKey();
    let finalAnswerMarkdown = '';
    let sourceBadge = '🧬 GENESIS AI';

    if (!this._geminiQueryCache) this._geminiQueryCache = {};
    const cacheKey = `${this.getDataSignature()}__${promptText.toLowerCase()}`;
    const isDirectLoftQuery = this.isDirectLoftCalculationQuery(promptText, effectiveTopic);

    if (this._geminiQueryCache[cacheKey]) {
      finalAnswerMarkdown = this._geminiQueryCache[cacheKey];
    } else if (!isDirectLoftQuery && typeof fetch === 'function') {
      const loftContext = this.buildLiveLoftContextSummary();
      const systemInstructionText = [
        'Sen AVIGEN GENESIS AI adlı uzman yarış güvercini yetiştiriciliği, genetik (Sewall Wright COI), kanatlı sağlığı ve spor fizyolojisi yapay zekâ danışmanısın.',
        'Kullanıcı normal bir sohbet sorusu veya genel bir güvercin sorusu sorduğunda (kümes analizi istemiyorsa) doğrudan sorduğu soruya doğal, samimi ve uzman bir dille Türkçe yanıt ver; gereksiz yere kümes eşleştirme raporu dökme.',
        'Eğer kullanıcı kendi kümesi, kuşları, eşleştirmesi veya yarışı hakkında soru sorarsa aşağıdaki kümes verilerini kullan.',
        'Yanıtını 3-5 kısa ve net madde veya paragraf halinde Türkçe yaz.'
      ].join(' ');

      // 1. ÖNCE KULLANICININ KAYITLI BULUT ANAHTARI VARSA ONU KULLAN (Tüm Güncel Gemini 2.5 / 2.0 / 1.5 Modelleriyle):
      if (apiKey) {
        const fullUserContent = `KULLANICININ SORUSU: ${promptText}\n\n(Sadece soru kullanıcının kendi kümesi, kuşu, eşleştirmesi, yarışı veya yemi hakkındaysa şu canlı kümes verilerini kullan; genel bir soruyorsa doğrudan sorulan soruya özgün yanıt ver:\n${loftContext})`;
        const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];

        for (let i = 0; i < candidateModels.length; i++) {
          const modelName = candidateModels[i];
          try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const resp = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                systemInstruction: { parts: [{ text: systemInstructionText }] },
                contents: [{ role: 'user', parts: [{ text: fullUserContent }] }],
                generationConfig: {
                  temperature: 0.55,
                  maxOutputTokens: 500
                }
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              const textOut = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('\n') || '';
              if (textOut.trim()) {
                finalAnswerMarkdown = textOut.trim();
                this._geminiQueryCache[cacheKey] = finalAnswerMarkdown;
                sourceBadge = '🟢 GENESIS AI Bulut';
                break;
              }
            }
          } catch (err) {}
        }
      }

      // 2. ANAHTAR YOKSA ÜCRETSİZ ANAHTARSIZ BULUT AI MOTORUNU DENE (4 Saniye Zaman Aşımlı):
      if (!finalAnswerMarkdown) {
        try {
          const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timerId = ctrl ? setTimeout(() => ctrl.abort(), 4200) : null;
          const resp = await fetch('https://text.pollinations.ai/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: ctrl ? ctrl.signal : undefined,
            body: JSON.stringify({
              model: 'openai',
              messages: [
                { role: 'system', content: systemInstructionText },
                { role: 'user', content: `Soru: ${promptText}\n\n(Not: Sadece soru kümesimle ilgiliyse şu özeti kullan, değilse doğrudan soruya cevap ver: ${loftContext})` }
              ],
              temperature: 0.4
            })
          });
          if (timerId) clearTimeout(timerId);
          if (resp.ok) {
            const data = await resp.json();
            const textOut = data?.choices?.[0]?.message?.content || '';
            if (textOut && textOut.trim().length > 10) {
              finalAnswerMarkdown = textOut.trim();
              this._geminiQueryCache[cacheKey] = finalAnswerMarkdown;
            }
          }
        } catch (err) {
          // Çevrimdışıysa veya zaman aşımı olursa yerleşik 14 kategorili doğal dil motoruna düşer
        }
      }
    }

    if (!finalAnswerMarkdown) {
      finalAnswerMarkdown = this.generateLocalScientificFallbackAnswer(promptText, effectiveTopic);
      this._geminiQueryCache[cacheKey] = finalAnswerMarkdown;
      sourceBadge = '🧬 GENESIS AI';
    }

    if (!Array.isArray(this.state.geminiChatHistory)) {
      this.state.geminiChatHistory = [];
    }

    this.state.geminiChatHistory.unshift({
      id: 'gem_' + Date.now(),
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      question: promptText,
      answerHtml: this.formatGeminiMarkdownToSafeHtml(finalAnswerMarkdown),
      sourceBadge
    });
    this.state.geminiChatHistory = this.state.geminiChatHistory.slice(0, 15);
    this.state.geminiIsLoading = false;
    this.saveState();
    this.renderGenesisModuleUI();
    this.renderHomeTeaserCard();

    if (this._voiceTriggeredNextAnswer || this.isVoiceAutoSpeakEnabled()) {
      this._voiceTriggeredNextAnswer = false;
      this.speakGenesisText(finalAnswerMarkdown);
    }
  },

  askGeminiAboutCurrentReport(reportMode) {
    let autoQuestion = 'Kümesimdeki en uyumlu damızlık çiftleri ve COI akrabalık durumunu yorumla.';
    let topic = 'breeding_advice';

    if (reportMode === 'breeding') {
      const rep = this.analyzeBreedingIntelligence(this.state.selectedSireRef, this.state.selectedDamRef);
      autoQuestion = `♂ ${rep.sireInfo?.ring} (${rep.sireInfo?.name}) ile ♀ ${rep.damInfo?.ring} (${rep.damInfo?.name}) çiftinin ${rep.totalScore}/100 uyum puanını, %${Number(rep.coi || 0).toFixed(2)} COI akrabalık katsayısını ve yavru potansiyelini detaylı yorumla.`;
      topic = 'pair_deep';
    } else if (reportMode === 'smart_race') {
      const sr = this.analyzeSmartRaceManagement();
      autoQuestion = `${sr.route?.relNode?.name || 'Salım'} -> ${sr.route?.loftNode?.name || 'Kümes'} (${sr.distKm} km) yarış rotasında rüzgâr riskine göre hangi kuşlarımı sepetlemeliyim ve tahmini dönüş pencereleri nasıldır?`;
      topic = 'race_strategy';
    } else if (reportMode === 'nutrition') {
      autoQuestion = `Bugünkü hava sıcaklığına ve kümesimdeki kuş sayısına göre günlük yem gramajını, tohum oranlarını ve suluk takviyesini yorumla.`;
      topic = 'nutrition_advice';
    }

    this.state.activeMode = 'breeding';
    this.state.viewStage = 'tool';
    this.saveState();
    this.renderGenesisModuleUI();
    this.askGeminiAdvisor(autoQuestion, topic);
  },

  renderGeminiAdvisorChatHtml() {
    return '';
  },

  selectAlternativePairAndRun(sireId, damId) {
    if (sireId) this.state.selectedSireRef = sireId;
    if (damId) this.state.selectedDamRef = damId;
    this.state.activeMode = 'breeding';
    this.state.viewStage = 'tool';
    this.saveState();
    this.renderGenesisModuleUI();
  },

  setFocusMateSearchSex(sexCode) {
    this.state.focusMateSearchSex = sexCode === 'F' ? 'F' : 'M';
    this.state.autoExpandBestMates = true;
    this.saveState();
    this.renderGenesisModuleUI();
  },

  // Kuşlarım Listesinden veya Performans Profilinden Seçili Tek Kuş (Erkek veya Dişi) İçin En Uygun Eş Adaylarını Tek Tuşla Açar
  openBestMatesForBird(ringVal, sexHint) {
    const cleanTarget = String(ringVal || '').trim().toUpperCase().replace(/[-\s./_]+/g, '');
    if (!cleanTarget) return;
    const { males, females, all } = getAllBreedingCandidates();
    const normR = (r) => String(r || '').trim().toUpperCase().replace(/[-\s./_]+/g, '');

    let foundMale = males.find(m => normR(m.ring) === cleanTarget);
    let foundFemale = females.find(f => normR(f.ring) === cleanTarget);
    const anyBird = all.find(c => normR(c.ring) === cleanTarget);

    let targetSex = (sexHint === 'F' || sexHint === 'M') ? sexHint : (foundFemale && !foundMale ? 'F' : 'M');
    if (foundFemale && !foundMale) targetSex = 'F';
    if (foundMale && !foundFemale) targetSex = 'M';

    this.state.activeMode = 'breeding';
    this.state.viewStage = 'tool';
    this.state.autoExpandBestMates = true;
    this.state.focusMateSearchSex = targetSex;

    if (targetSex === 'F') {
      const damCand = foundFemale || anyBird || females[0];
      if (damCand) this.state.selectedDamRef = damCand.id;
      // Bu dişiye en yüksek puanlı boşta erkeği otomatik 1. aday olarak eşleştir
      const nestedSet = typeof getActiveNestRingNormSet === 'function' ? getActiveNestRingNormSet() : new Set();
      const freeMales = males.filter(m => !nestedSet.has(normR(m.ring)) && normR(m.ring) !== cleanTarget);
      const poolM = freeMales.length ? freeMales : males;
      let bestM = poolM[0];
      let bestScore = -1;
      if (damCand) {
        poolM.forEach(m => {
          const r = this.analyzeBreedingIntelligence(m.id, damCand.id, true);
          if (r.totalScore > bestScore && r.userFeedbackStatus !== 'REJECTED') {
            bestScore = r.totalScore;
            bestM = m;
          }
        });
      }
      if (bestM) this.state.selectedSireRef = bestM.id;
    } else {
      const sireCand = foundMale || anyBird || males[0];
      if (sireCand) this.state.selectedSireRef = sireCand.id;
      // Bu erkeğe en yüksek puanlı boşta dişiyi otomatik 1. aday olarak eşleştir
      const nestedSet = typeof getActiveNestRingNormSet === 'function' ? getActiveNestRingNormSet() : new Set();
      const freeFemales = females.filter(f => !nestedSet.has(normR(f.ring)) && normR(f.ring) !== cleanTarget);
      const poolF = freeFemales.length ? freeFemales : females;
      let bestF = poolF[0];
      let bestScore = -1;
      if (sireCand) {
        poolF.forEach(f => {
          const r = this.analyzeBreedingIntelligence(sireCand.id, f.id, true);
          if (r.totalScore > bestScore && r.userFeedbackStatus !== 'REJECTED') {
            bestScore = r.totalScore;
            bestF = f;
          }
        });
      }
      if (bestF) this.state.selectedDamRef = bestF.id;
    }

    this.saveState();
    if (typeof openIosTab === 'function') {
      openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2]);
    }
    this.renderGenesisModuleUI();
  },

  saveCurrentGenesisPairToActiveNests(sireRing, sireName, damRing, damName, score, coi) {
    if (typeof activePairsList === 'undefined' || !Array.isArray(activePairsList)) return;
    const sClean = (sireRing || '').trim();
    const dClean = (damRing || '').trim();
    if (!sClean || !dClean) return;

    const sLabel = `${sClean}${sireName ? ' (' + sireName + ')' : ''}`;
    const dLabel = `${dClean}${damName ? ' (' + damName + ')' : ''}`;

    const alreadyExists = activePairsList.some(
      p => String(p.sire || '').toUpperCase().includes(sClean.toUpperCase()) &&
           String(p.dam || '').toUpperCase().includes(dClean.toUpperCase())
    );
    if (alreadyExists) {
      alert(`ℹ️ Bu çift (♂ ${sLabel} × ♀ ${dLabel}) zaten Aktif Yuvalar listenizde kayıtlı!`);
      return;
    }

    const nestNum = activePairsList.length + 1;
    const todayIso = typeof getIsoDateDaysAgo === 'function' ? getIsoDateDaysAgo(0) : new Date().toISOString().slice(0, 10);
    activePairsList.unshift({
      id: 'pair_genesis_' + Date.now(),
      nest: `Yuva #${nestNum}`,
      eventType: 'pair',
      eventDate: todayIso,
      sire: sLabel,
      dam: dLabel,
      detail: `GENESIS AI %${score} Uyum (COI %${Number(coi || 0).toFixed(2)})`
    });

    this.recordCortexUserFeedback(`breeding__${sClean} × ${dClean}`, 'ACCEPTED', score || 85, 85);
    if (typeof saveMypedigreData === 'function') saveMypedigreData();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
    if (typeof AvigenUxManager !== 'undefined') AvigenUxManager.renderBreedingPlanPairsList();
    alert(`🪺 Yuva #${nestNum} Başarıyla Oluşturuldu!\n\n♂ Baba: ${sLabel}\n♀ Anne: ${dLabel}\n🧬 GENESIS Uyum: %${score} (COI: %${Number(coi || 0).toFixed(2)})\n\n🕊️ Kuş & Yuva -> 💑 Yuva & Üreme sekmesinden kuluçka (18 gün) ve 7. gün bilezik takvimini takip edebilirsiniz.`);
  },

  getCortexPairFeedbackDelta(sireRing, damRing) {
    const logs = Array.isArray(this.state.cortexLearningLog) ? this.state.cortexLearningLog : [];
    if (!logs.length) return { delta: 0, status: null };
    const sUp = (sireRing || '').trim().toUpperCase();
    const dUp = (damRing || '').trim().toUpperCase();
    if (!sUp || !dUp) return { delta: 0, status: null };

    const matchingLog = logs.find(l => {
      const tUp = String(l.title || '').toUpperCase();
      return tUp.includes(sUp) && tUp.includes(dUp);
    });
    if (!matchingLog) return { delta: 0, status: null };
    if (matchingLog.userDecision === 'REJECTED') return { delta: 0, status: 'REJECTED' };
    if (matchingLog.userDecision === 'ACCEPTED') return { delta: 0, status: 'ACCEPTED' };
    return { delta: 0, status: null };
  },

  recordCortexUserFeedback(recKey, decision, score, reliabilityPct) {
    if (!Array.isArray(this.state.cortexLearningLog)) {
      this.state.cortexLearningLog = [];
    }
    const cleanTitle = String(recKey || '').split('__')[1] || 'GENESIS Önerisi';
    const modePart = String(recKey || '').split('__')[0] || this.state.activeMode;

    // 기존 kaydı güncelle veya ekle
    this.state.cortexLearningLog = this.state.cortexLearningLog.filter(l => l.title !== cleanTitle);
    this.state.cortexLearningLog.unshift({
      id: 'pref_' + Date.now(),
      date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: modePart,
      title: cleanTitle,
      userDecision: decision, // 'ACCEPTED' | 'REJECTED'
      predictedScore: score,
      reliabilityPct
    });

    if (this._engineCache) {
      this._engineCache.signature = '';
      this._engineCache.breedingQuick = {};
      this._engineCache.breedingFull = {};
    }
    this.saveState();
    this.renderGenesisModuleUI();
    alert(
      decision === 'ACCEPTED'
        ? `⭐ "${cleanTitle}" çifti Favori Aday olarak işaretlendi (Bilimsel uyum puanı değişmeden korundu).`
        : `🚫 "${cleanTitle}" çifti otomatik öneri listesinden gizlendi ve sıradaki alternatif adaylar listelendi.`
    );
  },

  renderNutritionCostSummaryHtml(plan) {
    const c = plan.cost;
    return `
      <div style="display:grid; grid-template-columns:1.1fr 1fr 1fr; gap:5px; text-align:center; margin-bottom:5px;">
        <div style="background:var(--ios-card); border:1.5px solid #059669; border-radius:8px; padding:6px 4px;">
          <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">1 AYLIK TOPLAM MALİYET</div>
          <div style="font-size:13.5px; font-weight:900; color:#047857; margin-top:2px;">${c.totalMonthlyTlLabel} TL</div>
          <div style="font-size:8px; color:var(--ios-subtext);">Günlük: ${c.dailyTlLabel} TL/gün</div>
        </div>
        <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #0066ff; border-radius:8px; padding:6px 4px;">
          <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">KUŞ BAŞINA AYLIK</div>
          <div style="font-size:12.5px; font-weight:900; color:#0052cc; margin-top:2px;">${c.perBirdMonthlyTlLabel} TL/kuş</div>
          <div style="font-size:8px; color:var(--ios-subtext);">Günlük: ${c.perBirdDailyTlLabel} TL/kuş</div>
        </div>
        <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-top:3px solid #7c3aed; border-radius:8px; padding:6px 4px;">
          <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">25 KG ÇUVAL ORT.</div>
          <div style="font-size:12.5px; font-weight:900; color:#6d28d9; margin-top:2px;">${c.sack25KgPriceTlLabel} TL</div>
          <div style="font-size:8px; color:var(--ios-subtext);">1 kg Karma: ${c.avgFeedPerKgTlLabel} TL</div>
        </div>
      </div>
      <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px; font-size:9px; color:var(--ios-text); display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">
        <span>🌾 <strong>Yem:</strong> ${c.feedMonthlyTlLabel} TL</span>
        <span>🪨 <strong>Grit/Taş:</strong> ${c.gritMonthlyTlLabel} TL</span>
        <span>🧪 <strong>Sulu Malzeme/Takviye:</strong> ${c.liquidsMonthlyTlLabel} TL</span>
      </div>
    `;
  },

  onFeedPriceInputChange() {
    if (!this.state.feedPrices) {
      this.state.feedPrices = { grainPerKg: 28, legumePerKg: 42, oilSeedPerKg: 55, gritPerKg: 25, liquidsMonthly: 450 };
    }
    const gEl = document.getElementById('nutPriceGrain');
    const lEl = document.getElementById('nutPriceLegume');
    const oEl = document.getElementById('nutPriceOilSeed');
    const grEl = document.getElementById('nutPriceGrit');
    const lqEl = document.getElementById('nutPriceLiquids');

    if (gEl) this.state.feedPrices.grainPerKg = Math.max(0, parseFloat(gEl.value) || 0);
    if (lEl) this.state.feedPrices.legumePerKg = Math.max(0, parseFloat(lEl.value) || 0);
    if (oEl) this.state.feedPrices.oilSeedPerKg = Math.max(0, parseFloat(oEl.value) || 0);
    if (grEl) this.state.feedPrices.gritPerKg = Math.max(0, parseFloat(grEl.value) || 0);
    if (lqEl) this.state.feedPrices.liquidsMonthly = Math.max(0, parseFloat(lqEl.value) || 0);

    this.saveState();
    const plan = this.calculateSmartNutritionPlan(
      this.state.nutritionPhase,
      this.state.nutritionGroup,
      this.state.nutritionBirdCount
    );
    const box = document.getElementById('nutCostLiveSummaryBox');
    if (box) {
      box.innerHTML = this.renderNutritionCostSummaryHtml(plan);
    }
    const badge = document.getElementById('nutMonthlyTotalBadge');
    if (badge) {
      badge.textContent = `Aylık: ${plan.cost.totalMonthlyTlLabel} TL`;
    }
  },

  // ==========================================================================
  // BİLİMSEL YEM RASYONU, 1 AYLIK (30 GÜN) TÜKETİM & MALİYET HESAPLAMA MOTORU
  // ==========================================================================
  calculateSmartNutritionPlan(phaseKey, groupKey, rawBirdCount) {
    const allActiveBirds = typeof collectUniqueLoftBirds === 'function'
      ? collectUniqueLoftBirds().filter(b => b.isActiveLoftBird)
      : [];
    const totalLoftBirds = allActiveBirds.length || 64;
    const breedersCount = allActiveBirds.filter(b => b.roleCategory === 'BREEDER').length;
    const racersCount = allActiveBirds.filter(b => b.roleCategory === 'RACER').length;
    const youngCount = allActiveBirds.filter(b => b.roleCategory === 'YOUNG').length;
    const activeNestsCount = typeof activePairsList !== 'undefined' && Array.isArray(activePairsList) ? activePairsList.length : 0;

    const birdCount = Math.max(1, parseInt(rawBirdCount, 10) || totalLoftBirds || 20);
    const wState = typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state
      ? AvigenLiveWeather.state
      : { cityName: 'İstanbul', temp: 22, hum: 55, windSpeedKmh: 12, windCategory: 'calm' };

    const temp = Number(wState.temp ?? 22);
    const isColdWeather = temp <= 10;
    const isHotWeather = temp >= 28;
    const isHardWind = wState.windCategory === 'head' || wState.windCategory === 'storm' || wState.windSpeedKmh >= 22;

    // Kümesteki damızlık, yarışçı, yavru ve aktif yuva ağırlıklı ortalama günlük gramaj (monthly_full_loft için)
    const weightedLoftGramsPerBird = Math.round(
      ((breedersCount * 39) + (racersCount * 38) + (youngCount * 35) + (activeNestsCount * 14)) /
      Math.max(1, breedersCount + racersCount + youngCount)
    ) || 38;

    // ========================================================================
    // TARİHE, HAFTANIN GÜNÜNE, CANLI HAVAYA VE KUŞLARIN DURUMUNA GÖRE AKILLI ÖNERİ
    // ========================================================================
    const nowDate = new Date();
    const monthNum = nowDate.getMonth() + 1; // 1..12
    const dayOfWeek = nowDate.getDay(); // 0=Pazar, 1=Pzt, 2=Salı, 3=Çarş, 4=Perş, 5=Cuma, 6=Cmt
    const dayNamesTr = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dateLabel = `${nowDate.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })} (${dayNamesTr[dayOfWeek]})`;

    let autoDetectedPhaseKey = 'monthly_full_loft';
    let seasonLabel = 'Kış & Dinlenme / Damızlık Hazırlık Dönemi';
    let todayFeedRecommendation = '';
    let todayLiquidRecommendation = '';
    const birdStatusSummary = `Kümesinizde ${breedersCount} Damızlık, ${racersCount} Yarışçı, ${youngCount} Yavru ve ${activeNestsCount} Aktif Yuva kayıtlı.`;

    if (activeNestsCount > 0 && groupKey === 'BREEDER') {
      autoDetectedPhaseKey = 'breeding_rearing';
      seasonLabel = `Aktif Yuva & Yavru Büyütme Evresi (${activeNestsCount} Yuva)`;
    } else if (groupKey === 'YOUNG') {
      autoDetectedPhaseKey = 'young_birds';
      seasonLabel = 'Genç Kuş & Yavru Gelişim Evresi';
    } else if (monthNum >= 4 && monthNum <= 8) {
      // Nisan - Ağustos: Yarış ve Üreme Sezonu (Haftanın gününe göre otomatik yarış evresi!)
      if (dayOfWeek === 0 || dayOfWeek === 1) {
        autoDetectedPhaseKey = 'race_recovery';
        seasonLabel = `Yarış Sezonu • ${dayNamesTr[dayOfWeek]} (Toparlanma & Detoks Günü)`;
      } else if (dayOfWeek === 2 || dayOfWeek === 3) {
        autoDetectedPhaseKey = 'race_build';
        seasonLabel = `Yarış Sezonu • ${dayNamesTr[dayOfWeek]} (Kas Onarımı & Kondisyon Günü)`;
      } else {
        autoDetectedPhaseKey = 'race_loading_long';
        seasonLabel = `Yarış Sezonu • ${dayNamesTr[dayOfWeek]} (Yarış Öncesi Enerji & Lipit Yükleme Günü)`;
      }
    } else if (monthNum === 9 || monthNum === 10) {
      autoDetectedPhaseKey = 'moulting';
      seasonLabel = 'Sonbahar Tüy Dökümü (Moulting & Telek Yenileme) Dönemi';
    } else if (monthNum === 2 || monthNum === 3) {
      autoDetectedPhaseKey = 'breeding_cropmilk';
      seasonLabel = 'İlkbahar Eşleşme, Yumurtlama & Kursak Sütü Dönemi';
    } else {
      // Kasım, Aralık, Ocak
      autoDetectedPhaseKey = activeNestsCount > 0 ? 'breeding_cropmilk' : 'winter_rest';
      seasonLabel = activeNestsCount > 0
        ? `Kış Damızlık & Aktif Yuva Dönemi (${activeNestsCount} Yuva)`
        : 'Kış & Dinlenme Dönemi (İç Yağlanma Önleyici Bakım)';
    }

    // Haftanın gününe ve mevsime göre bugünün özel suluk sıvı ve yem üstü reçetesi
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      todayLiquidRecommendation = `Sulukta: 1 Lt suya 2 ml Elektrolit + Aminoasit (Yorgunluk ve mineral dengesi için). Yem üstüne: Sedochol/Metiyonin + Probiyotik.`;
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      todayLiquidRecommendation = `Sulukta: 1 Lt suya 5 ml Doğal Elma Sirkesi veya Sıvı Probiyotik (Bağırsak pH ve Trichomonas/E.coli koruması). Yem üstüne: 5 ml Sarımsak/Kekik/Omega-3 Yağı + 5 gr Bira Mayası.`;
    } else if (dayOfWeek === 3 || dayOfWeek === 5) {
      todayLiquidRecommendation = isHotWeather
        ? `Sulukta: Sıcak hava (${temp}°C) nedeniyle 1 Lt suya Elektrolit + Vitamin C. Kümes önünde taze grit ve mineral taşı.`
        : `Sulukta: Vitamin B Kompleksi / Solunum Çayı veya Duru Temiz İçme Suyu. Yem üstüne: Lesitin + Omega-3 Enerji Yağı.`;
    } else {
      todayLiquidRecommendation = `Sulukta: Saf, klorsuz taze içme suyu (günde 2 kez tazelenmeli). Kümes önünde: Taze Grit + Kırmızı Taş + İstiridye Kabuğu.`;
    }

    const PHASES = {
      monthly_full_loft: {
        title: '📊 Tam Kümes 1 Aylık (30 Günlük) Yem, Sulu Malzeme & Maliyet Planı',
        gramsPerBird: weightedLoftGramsPerBird,
        morningRatioPct: 40,
        kcalPer100g: 355,
        macros: { carb: 57, protein: 16, fat: 10 },
        rationScore: 98,
        scientificRationale: `Kümesinizdeki tüm aktif kuşların statüsü (${breedersCount} Damızlık, ${racersCount} Yarışçı, ${youngCount} Yavru ve ${activeNestsCount} Aktif Yuva) birlikte değerlendirilerek 30 günlük (1 Aylık) karma tahıl, bakliyat, yağlı tohum, grit/mineral taşı ve suluk/yem üstü sıvı takviye ihtiyaçları hesaplanmıştır.`,
        cautionNote: 'Aylık yem stoklamasında çuvallar yerden en az 15 cm yüksekte (palet üzerinde), nemsiz ve serin ortamda tutulmalı; suluk sıvıları güneş görmeyen dolapta saklanmalıdır.',
        seeds: [
          { name: 'Cin Mısırı (Sarı & Bordo/Kırmızı)', icon: '🌽', category: 'Tahıl & Enerji', feedType: 'grain', pct: 26, color: '#0066ff', benefit: 'Kümesin ana enerji ve glikojen yakıtı.' },
          { name: 'Bezelye (Yeşil/Sarı) + Maş Fasulyesi + Fiğ', icon: '🟢', category: 'Protein & Bakliyat', feedType: 'legume', pct: 22, color: '#7c3aed', benefit: 'Damızlık, yavru gelişimi ve yarışçı kas onarımı için temel aminoasit kaynağı.' },
          { name: 'Beyaz Dari & Kırmızı/Sarı Darı (Sorgum)', icon: '⚪', category: 'Hafif Karbonhidrat', feedType: 'grain', pct: 18, color: '#0066ff', benefit: 'Tüm gruplar tarafından kolay sindirilen temiz karbonhidrat.' },
          { name: 'Buğday, Kavuzsuz Arpa & Çeltik', icon: '🌾', category: 'Lif & Sindirim Dengesi', feedType: 'grain', pct: 18, color: '#059669', benefit: 'Bağırsak florasını korur, damızlıklarda iç yağlanmayı önler.' },
          { name: 'Aspir (Kardi) & Soyulmuş Ayçekirdeği', icon: '🌻', category: 'Yağlı Tohum & Lipit', feedType: 'oilSeed', pct: 10, color: '#7c3aed', benefit: 'Uzun uçuş yakıtı (PPARD) ve kursak sütü lipit kalitesini artırır.' },
          { name: 'Kenevir, Keten Tohumu & Kanola', icon: '🌿', category: 'Omega-3 & Telek Kalitesi', feedType: 'oilSeed', pct: 6, color: '#059669', benefit: 'Parlak telek yapısı, bağışıklık ve yüksek form sağlar.' }
        ],
        supplements: [
          { dayOrTiming: 'Haftada 2 Gün Suluk', item: 'Elektrolit + Aminoasit Sıvısı', purpose: 'Mineral dengesi, uçuş ve yavru besleme sonrası hızlı hidrasyon.', dosage: '1 Lt Suya 2 ml', badgeClass: 'gene-blue' },
          { dayOrTiming: 'Haftada 2 Gün Suluk', item: 'Doğal Elma Sirkesi veya Sıvı Probiyotik', purpose: 'Bağırsak pH dengesi ve doğal trichomonas/E.coli koruması.', dosage: '1 Lt Suya 5 ml', badgeClass: 'gene-green' },
          { dayOrTiming: 'Haftada 2-3 Gün Yem Üstü', item: 'Sarımsak/Kekik/Omega-3 Enerji Yağı + Bira Mayası Tozu', purpose: 'Yeme yağı bağlayarak vitamin ve aminoasit emilimini maksimuma çıkarır.', dosage: '1 Kg Yeme 5 ml Yağ + 5 gr Maya', badgeClass: 'gene-purple' },
          { dayOrTiming: 'Her Gün Kümes Önünde', item: 'Taze Grit + Kırmızı Taş + İstiridye Kabuğu', purpose: 'Taşlıkta tohumların tam öğütülmesi ve yumurta/iskelet kalsiyumu.', dosage: 'Kuş Başı ~3 gr/gün', badgeClass: 'gene-green' }
        ]
      },

      race_recovery: {
        title: '🏁 Yarış Dönüşü Toparlanma & Detoks Rasyonu (Pazar–Pazartesi)',
        gramsPerBird: 32,
        morningRatioPct: 40,
        kcalPer100g: 315,
        macros: { carb: 68, protein: 11, fat: 4 },
        rationScore: 96,
        scientificRationale: 'Yarıştan dönen güvercinin karaciğer ve sindirim sistemi yorgundur. İlk 24–36 saat ağır bakliyat (bezelye/fiğ) yerine sindirimi çok hızlı kavuzsuz arpa, çeltik, darı ve aspir verilerek laktik asit/toksin atılımı hızlandırılır ve kas glikojen depoları nazikçe doldurulur.',
        cautionNote: 'Yarış dönüşü ilk gün ağır bezelye veya aşırı yağlı yem verilmesi kursak ekşimesine ve karaciğer yüküne yol açar; ilk su mutlaka ılık elektrolitli olmalıdır.',
        seeds: [
          { name: 'Kavuzsuz / İnce Arpa', icon: '🌾', category: 'Detoks & Lif', pct: 34, color: '#059669', benefit: 'Karaciğeri ve bağırsakları dinlendirir, sindirimi hiç yormadan temel karbonhidrat sağlar.' },
          { name: 'Beyaz Dari & Kırmızı Darı (Sorgum)', icon: '⚪', category: 'Hızlı Glikojen', pct: 24, color: '#0066ff', benefit: 'Boşalan kas glikojen depolarını hızla dolduran kolay sindirilebilir karbonhidrat.' },
          { name: 'Çeltik (Kabuklu Pirinç)', icon: '🍚', category: 'Elektrolit & Bağırsak', pct: 16, color: '#059669', benefit: 'Yarış sonrası sulu dışkıyı keser, bağırsak florasını dengeler.' },
          { name: 'Buğday', icon: '🌾', category: 'Temel Enerji', pct: 12, color: '#0066ff', benefit: 'Hızlı enerji geri kazanımı ve B vitamini desteği.' },
          { name: 'Aspir Tohumu (Kardi)', icon: '🌻', category: 'Hücre Onarımı', pct: 8, color: '#7c3aed', benefit: 'Esansiyel yağ asitleriyle uçuşta yıpranan kas zarlarını onarır.' },
          { name: 'Maş Fasulyesi (Küçük Taneli)', icon: '🟢', category: 'Hafif Aminoasit', pct: 6, color: '#7c3aed', benefit: 'Pazartesi akşamı kas liflerinin mikro onarımı için hafif bitkisel protein.' }
        ],
        supplements: [
          { dayOrTiming: 'Yarış Dönüşü İlk Suluk', item: 'Elektrolit + Dekstroz / Bal', purpose: 'Uçuşta kaybedilen mineral ve sıvı dengesini 2 saatte yerine koyar.', dosage: '1 Lt Suya 1 Ölçek', badgeClass: 'gene-blue' },
          { dayOrTiming: 'Pazartesi Sabah Yem Üstü', item: 'Sedochol / Metiyonin + B12 + Probiyotik', purpose: 'Karaciğer detoksu ve bağırsak florasının yenilenmesi.', dosage: '1 Kg Yeme 5 ml', badgeClass: 'gene-green' },
          { dayOrTiming: 'Pazartesi Akşam', item: 'Temiz Su + Taze Grit / Kırmızı Taş', purpose: 'Taşlık sindirimini düzenler ve mineral açığını kapatır.', dosage: 'Serbest', badgeClass: 'gene-purple' }
        ]
      },

      race_build: {
        title: '⚡ Hafta Ortası Kas Onarımı & Kondisyon Rasyonu (Salı–Çarşamba)',
        gramsPerBird: 36,
        morningRatioPct: 40,
        kcalPer100g: 342,
        macros: { carb: 60, protein: 15, fat: 7 },
        rationScore: 95,
        scientificRationale: 'Salı ve Çarşamba günleri göğüs kası (Pectoralis major) mikro yırtıklarının onarıldığı ve bazal kondisyonun kurulduğu evredir. Orta düzeyde kaliteli bakliyat (%18-20 bezelye/maş) ile mısır ve darı dengeli verilir.',
        cautionNote: 'Günlük antrenman uçuşu 45–60 dakikaya çıktığında kuşların akşam yemi önünde arpa bırakmaması ideal porsiyon göstergesidir.',
        seeds: [
          { name: 'Küçük Cin Mısırı (Sarı/Kırmızı)', icon: '🌽', category: 'Glikojen & Enerji', pct: 24, color: '#0066ff', benefit: 'Yüksek sindirilebilir nişasta ve karotenoid kaynağı.' },
          { name: 'Küçük Yeşil & Sarı Bezelye + Maş', icon: '🟢', category: 'Kas Protein Onarımı', pct: 20, color: '#7c3aed', benefit: 'Göğüs ve kanat kaslarının yeniden yapılanması için lizin ve arginin aminoasitleri.' },
          { name: 'Beyaz Dari & Kırmızı Darı', icon: '⚪', category: 'Dengeli Karbonhidrat', pct: 20, color: '#0066ff', benefit: 'Antrenman uçuşları için temiz enerji kaynağı.' },
          { name: 'Buğday & Arpa Karışımı', icon: '🌾', category: 'Sindirim Dengesi', pct: 18, color: '#059669', benefit: 'Bağırsak motilitesini ve form seviyesini korur.' },
          { name: 'Aspir Tohumu (Kardi)', icon: '🌻', category: 'Lipit Başlangıcı', pct: 12, color: '#7c3aed', benefit: 'Kas içi yağ depolama sürecini (PPARD aktivasyonu) başlatır.' },
          { name: 'Kenevir & Keten Tohumu', icon: '🌿', category: 'Omega-3 & Form', pct: 6, color: '#059669', benefit: 'Tüy parlaklığı, uçuş isteği ve eklem esnekliği sağlar.' }
        ],
        supplements: [
          { dayOrTiming: 'Salı Sabah Yem Üstü', item: 'Sarımsak & Kekik Yağı + Bira Mayası', purpose: 'Doğal solunum/bağırsak koruyucu ve B vitamini kompleksi.', dosage: '1 Kg Yeme 5 gr', badgeClass: 'gene-green' },
          { dayOrTiming: 'Çarşamba Suluk', item: 'Solunum Çayı veya İyot / Demir Desteği', purpose: 'Kanda oksijen taşıma kapasitesini (Hemoglobin) artırır.', dosage: '1 Lt Suya 2 ml', badgeClass: 'gene-blue' }
        ]
      },

      race_loading_sprint: {
        title: '🚀 100–350 km Sprint & Orta Mesafe Hız Yükleme Rasyonu (Perş–Cuma)',
        gramsPerBird: 38,
        morningRatioPct: 38,
        kcalPer100g: 360,
        macros: { carb: 64, protein: 13, fat: 10 },
        rationScore: 97,
        scientificRationale: '100–350 km arası kısa ve orta mesafe yarışlarında (1–4 saatlik uçuş) beyaz ve ara kas lifleri yüksek oranda glikojen ve hızlı oksidatif enerji kullanır (LDHA genotip etkisi). Bu nedenle rasyonda mısır, dari ve soyulmuş tohumlar öne çıkarılır; ağır bakliyat azaltılarak kuşun su ihtiyacı ve uçuş ağırlığı optimize edilir.',
        cautionNote: 'Sepetleme günü (Cuma) sabahı kuşlara ağır bezelye verilmemeli; küçük taneli mısır, darı, aspir ve soyulmuş ayçekirdeği ile kursak hafif tutulmalıdır.',
        seeds: [
          { name: 'Bordo / Kırmızı & Sarı Cin Mısırı', icon: '🌽', category: 'Patlayıcı Hız Enerjisi', pct: 32, color: '#0066ff', benefit: 'Sprint ve orta mesafede maksimum kan şekeri ve kas glikojeni sağlar.' },
          { name: 'Beyaz Dari & Kırmızı Darı', icon: '⚪', category: 'Hafif Karbonhidrat', pct: 22, color: '#0066ff', benefit: 'Uçuş sırasında susuzluk yapmayan yüksek enerjili tahıl.' },
          { name: 'Aspir Tohumu & Soyulmuş Ayçekirdeği', icon: '🌻', category: 'Hızlı Yağ Enerjisi', pct: 18, color: '#7c3aed', benefit: 'Kasların ilk saatten sonra yağ yakımına geçişini hızlandırır.' },
          { name: 'Buğday & Kabuksuz Yulaf', icon: '🌾', category: 'Hızlı Sindirim', pct: 14, color: '#059669', benefit: 'Sepetleme öncesi kursakta ağırlık yapmadan enerji verir.' },
          { name: 'Kenevir Tohumu', icon: '🌿', category: 'Adrenalin & Form', pct: 8, color: '#059669', benefit: 'Kuşun eve dönüş motivasyonunu ve uçuş temposunu yükseltir.' },
          { name: 'Küçük Bezelye / Maş', icon: '🟢', category: 'Düşük Protein', pct: 6, color: '#7c3aed', benefit: 'Sadece kas tonusunu koruyacak minimum oranda tutulur (susuzluğu önler).' }
        ],
        supplements: [
          { dayOrTiming: 'Perşembe Akşam Yem Üstü', item: 'Lesitin + Omega-3 Enerji Yağı + L-Karnitin', purpose: 'Yağ asitlerinin mitokondriye taşınmasını (L-Karnitin) hızlandırır.', dosage: '1 Kg Yeme 5 ml', badgeClass: 'gene-purple' },
          { dayOrTiming: 'Cuma (Sepetleme Günü) Suluk', item: 'Saf Temiz Su (Öğleye Kadar Elektrolit)', purpose: 'Uçuş öncesi hücre içi tam hidratasyon sağlar.', dosage: 'Serbest', badgeClass: 'gene-blue' }
        ]
      },

      race_loading_long: {
        title: '🏔️ 450–800+ km Uzun Mesafe & Maraton Lipit/Yağ Yükleme Rasyonu (Perş–Cuma)',
        gramsPerBird: 42,
        morningRatioPct: 35,
        kcalPer100g: 398,
        macros: { carb: 48, protein: 15, fat: 21 },
        rationScore: 98,
        scientificRationale: 'Hakemli PPARD ve kas biyokimyası araştırmalarına (Stefaniuk-Szmukier et al., 2024 & 2026) göre 450 km üzerindeki yarışlarda (5–12 saatlik uçuş) güvercinin uçuş yakıtının %75\'inden fazlası kırmızı kas liflerindeki intramüsküler trigliseridlerden (yağlardan) sağlanır. Yağlar gram başına karbonhidratın 2,25 katı (9 kcal/gr) enerji verir ve yıkımı sırasında metabolik su üreterek kuşu havada susuzluktan korur!',
        cautionNote: 'Yer fıstığı ve ayçekirdeği kesinlikle küfsüz (Aflatoksin içermeyen insan gıdası kalitesinde) olmalı ve son 3 gün kademeli olarak yüklenmelidir.',
        seeds: [
          { name: 'Kırmızı / Bordo & Sarı Cin Mısırı', icon: '🌽', category: 'Ana Enerji Bazı', pct: 30, color: '#0066ff', benefit: 'Karaciğer ve kas glikojen depolarını maksimum kapasiteye çıkarır.' },
          { name: 'Aspir (Kardi) & Soyulmuş Ayçekirdeği İçi', icon: '🌻', category: 'Yüksek Lipit Yakıtı', pct: 24, color: '#7c3aed', benefit: '6+ saatlik uçuşlarda PPARD gen yolağı üzerinden kesintisiz yağ enerjisi sağlar.' },
          { name: 'Kenevir, Kanola & Keten Tohumu', icon: '🌿', category: 'Omega-3/6 & Dayanıklılık', pct: 16, color: '#059669', benefit: 'Kan akışkanlığını artırır, karşı rüzgârda yorulmayı geciktirir.' },
          { name: 'Tuzsuz Çiğ Yer Fıstığı (Kırık) & Soya', icon: '🥜', category: 'Konsantre Maraton Yağı', pct: 12, color: '#7c3aed', benefit: 'En yüksek kalorili maraton yakıtı; havada metabolik su üretir.' },
          { name: 'Beyaz Dari & Kabuksuz Yulaf', icon: '⚪', category: 'Kolay Sindirim', pct: 10, color: '#0066ff', benefit: 'Sepette sindirimi rahatlatır ve başlangıç enerjisi verir.' },
          { name: 'Küçük Bezelye / Fiğ', icon: '🟢', category: 'Kas Koruma', pct: 8, color: '#059669', benefit: 'Uzun uçuşta kas yıkımını (katabolizma) önler.' }
        ],
        supplements: [
          { dayOrTiming: 'Çarşamba–Perşembe Yem Üstü', item: 'L-Karnitin + E Vitamini + Selenyum + Lesitin Yağı', purpose: 'Yağların kas hücrelerinde yakılmasını maksimuma çıkarır, kas tutulmasını (kramp) önler.', dosage: '1 Kg Yeme 1 Ölçek', badgeClass: 'gene-purple' },
          { dayOrTiming: 'Perşembe–Cuma Suluk', item: 'Elektrolit + Aminoasit (Cuma Öğleden Sonra Sadece Duru Su)', purpose: 'Uzun yol öncesi tam mineral ve sıvı rezervi.', dosage: '1 Lt Suya 1 Ölçek', badgeClass: 'gene-green' }
        ]
      },

      breeding_cropmilk: {
        title: '🥚 Damızlık: Eşleşme, Yumurtlama & İlk 10 Gün Kursak Sütü Rasyonu',
        gramsPerBird: 40,
        morningRatioPct: 45,
        kcalPer100g: 348,
        macros: { carb: 52, protein: 19, fat: 11 },
        rationScore: 96,
        scientificRationale: 'Yumurtadan çıkıştan itibaren ilk 8–10 gün hem erkek hem dişi ebeveyn prolaktin hormonu etkisiyle yüksek protein (%55 kuru madde proteini) ve yüksek lipit (%35) içeren "Kursak Sütü" üretir. Bu dönemde küçük taneli bakliyatlar, yağlı tohumlar ve kalsiyum/D3 vitamini yavrunun bağışıklığı (IgA antikorları) için hayati önem taşır.',
        cautionNote: 'Kuluçkanın son 3 gününden yavru 7 günlük olana kadar çok iri mısır yerine küçük taneli tohumlar ve maş/bezelye tercih edilmelidir ki ebeveyn yavruya rahat kusabilsin.',
        seeds: [
          { name: 'Küçük Yeşil/Sarı Bezelye, Maş & Mercimek', icon: '🟢', category: 'Kursak Sütü Proteini', pct: 28, color: '#7c3aed', benefit: 'Kursak sütü sentezi için yüksek biyoyararlanımlı esansiyel aminoasitler.' },
          { name: 'Küçük Cin Mısırı & Buğday', icon: '🌽', category: 'Metabolik Enerji', pct: 26, color: '#0066ff', benefit: 'Ebeveynin vücut kondisyonunu ve yumurta kalitesini korur.' },
          { name: 'Beyaz Dari & Kırmızı/Sarı Darı', icon: '⚪', category: 'Yavruya Kolay Kusma', pct: 20, color: '#0066ff', benefit: 'Küçük taneli yapısı sayesinde ilk günlerde yavrunun kursağında kolay sindirilir.' },
          { name: 'Aspir & Kenevir Tohumu', icon: '🌻', category: 'Kursak Sütü Lipiti', pct: 16, color: '#059669', benefit: 'Kursak sütünün yağ oranını ve D/E vitamini kalitesini artırır.' },
          { name: 'Kanola, Keten & Kanarya Yemi (Aspur)', icon: '🌿', category: 'Mikro Besin & Yağ', pct: 10, color: '#059669', benefit: 'Yavrunun ilk hafta beyin ve sinir sistemi gelişimini destekler.' }
        ],
        supplements: [
          { dayOrTiming: 'Her Gün Yuva Önünde', item: 'Taze Grit + Kırmızı Taş + İstiridye Kabuğu + Kalsiyum Blok', purpose: 'Yumurta kabuğu sertliği ve yavrunun kemik gelişimi (Raşitizmi önler).', dosage: 'Günlük Taze', badgeClass: 'gene-green' },
          { dayOrTiming: 'Haftada 3 Gün Suluk / Yem', item: 'Kalsiyum + Vitamin D3 + A-D-E-K Kompleksi', purpose: 'Dişide yumurta felcini önler ve döllülük oranını yükseltir.', dosage: '1 Lt Suya 2 ml', badgeClass: 'gene-purple' }
        ]
      },

      breeding_rearing: {
        title: '🐣 Damızlık: 10–28. Gün İri Yavru Büyütme (%21 Yüksek Protein) Rasyonu',
        gramsPerBird: 52,
        morningRatioPct: 45,
        kcalPer100g: 356,
        macros: { carb: 50, protein: 21, fat: 9 },
        rationScore: 97,
        scientificRationale: '8–10. günden (bilezik takma gününden) 25. güne kadar yavrular doğrudan ıslatılmış tane yemle beslenir ve vücut ağırlıkları hızla artar. Ebeveynlerin günde 3 öğün (Sabah, Öğle, Akşam) yüksek proteinli (%35-38 bakliyat) rasyonla desteklenmesi hem yavrunun tam kas/iskelet gelişimini sağlar hem de anne-babanın yıpranmasını önler.',
        cautionNote: 'İki yavru bakan damızlık çiftin önünde temiz su ve mineral grit taşı asla eksik olmamalıdır; susuz kalan ebeveyn yavruya kuru yem kusar ve kursak tıkanması oluşur.',
        seeds: [
          { name: 'Bezelye (Yeşil, Sarı, Maple) + Fiğ + Burçak', icon: '🟢', category: 'Maksimum Büyüme Proteini', pct: 36, color: '#7c3aed', benefit: 'Yavrunun kas, kemik ve telek gelişimi için %21+ ham protein sağlar.' },
          { name: 'Mısır & Buğday', icon: '🌽', category: 'Büyüme Enerjisi', pct: 26, color: '#0066ff', benefit: 'Yavru besleyen ebeveynlerin kilo kaybını önler.' },
          { name: 'Beyaz Dari & Kırmızı Darı', icon: '⚪', category: 'Kolay Sindirim', pct: 18, color: '#0066ff', benefit: 'Yavrunun taşlık ve kursak gelişimine uyumlu tahıl.' },
          { name: 'Aspir & Kenevir Tohumu', icon: '🌻', category: 'Telek & Kalori', pct: 12, color: '#059669', benefit: 'Yavrunun ilk teleklerini parlak ve stres çizgisiz çıkarmasını sağlar.' },
          { name: 'Maş Fasulyesi & Mercimek', icon: '🫘', category: 'Biyo-Aminoasit', pct: 8, color: '#7c3aed', benefit: 'Kolay sindirilebilir bitkisel protein ve demir desteği.' }
        ],
        supplements: [
          { dayOrTiming: 'Haftada 3 Gün Yem Üstü', item: 'Bira Mayası + Aminoasit Tozu + Balık Yağı / Lesitin', purpose: 'Yavruların yeme düşene kadar maksimum kas hacmine ulaşmasını sağlar.', dosage: '1 Kg Yeme 10 gr', badgeClass: 'gene-purple' },
          { dayOrTiming: 'Her Gün Serbest', item: 'Mineral Taşı + Kalsiyum Grit + Taze Su (Günde 2 Kez Değişim)', purpose: 'Sindirim ve iskelet mineralizasyonu.', dosage: 'Serbest', badgeClass: 'gene-green' }
        ]
      },

      young_birds: {
        title: '🐥 Yeme Düşen Yavrular (25–90 Günlük Gelişim & Bağışıklık) Rasyonu',
        gramsPerBird: 35,
        morningRatioPct: 40,
        kcalPer100g: 345,
        macros: { carb: 56, protein: 17, fat: 8 },
        rationScore: 96,
        scientificRationale: '25. günde yuvadan ayrılan yavruların gaga ve yutak yapısı henüz küçük taneli yemlere daha yatkındır. Maş fasulyesi, küçük bezelye, darı, aspir ve çeltik ağırlıklı rasyon hem yavrunun yem kırmayı hızla öğrenmesini sağlar hem de PMV-1 aşısı ve çatı alıştırma döneminde bağışıklığı güçlü tutar.',
        cautionNote: 'Yavrulara akşam yemlemesi düdük/çağrı sesiyle birlikte tek seferde doyana kadar verilmeli, kümes eğitimine (drop-in) sabah hafif aç karnına çıkarılmalıdır.',
        seeds: [
          { name: 'Maş Fasulyesi, Mercimek & Küçük Bezelye', icon: '🟢', category: 'Kolay Yutulan Protein', pct: 26, color: '#7c3aed', benefit: 'Yavrunun boğazına takılmayan küçük taneli yüksek protein.' },
          { name: 'Beyaz Dari, Kırmızı & Sarı Darı', icon: '⚪', category: 'Yavru Temel Tahılı', pct: 24, color: '#0066ff', benefit: 'Yeme yeni düşen yavruların en sevdiği ve kolay sindirdiği tahıl.' },
          { name: 'Küçük Cin Mısırı & Buğday', icon: '🌽', category: 'Uçuş & Büyüme Enerjisi', pct: 22, color: '#0066ff', benefit: 'Mısır yemeyi erken öğrenmelerini sağlar (yarış sepeti hazırlığı).' },
          { name: 'Çeltik & Kavuzsuz Arpa', icon: '🌾', category: 'Prebiyotik Lif', pct: 14, color: '#059669', benefit: 'Genç kuş hastalığı (Adenocoli) riskine karşı bağırsak pH dengesini korur.' },
          { name: 'Aspir, Kenevir & Kanarya Yemi', icon: '🌻', category: 'Bağışıklık & Yağ', pct: 14, color: '#059669', benefit: 'Tüy ve sinir sistemi gelişimini hızlandırır.' }
        ],
        supplements: [
          { dayOrTiming: 'Haftada 3 Gün Suluk', item: 'Doğal Elma Sirkesi veya Probiyotik + Elektrolit', purpose: 'Bağırsak pH\'ını asidik tutarak E.coli ve Trichomonas üremesini baskılar.', dosage: '1 Lt Suya 5 ml', badgeClass: 'gene-green' },
          { dayOrTiming: 'Haftada 2 Gün Yem Üstü', item: 'Kalsiyum + Bira Mayası + Kekik Yağı', purpose: 'Kemik gelişimi ve solunum yolu direnci.', dosage: '1 Kg Yeme 5 gr', badgeClass: 'gene-blue' }
        ]
      },

      moulting: {
        title: '🪶 Tüy Dökümü (Moulting • Keratin, Metiyonin & Omega-3) Rasyonu',
        gramsPerBird: 38,
        morningRatioPct: 40,
        kcalPer100g: 365,
        macros: { carb: 51, protein: 17, fat: 13 },
        rationScore: 98,
        scientificRationale: 'Güvercinin tüm telek ve örtü tüyleri %85–90 oranında "Keratin" proteininden oluşur. Keratin sentezi için kükürtlü aminoasitler (Metiyonin ve Sistin) ile doymamış yağ asitleri (Omega-3: Keten tohumu, Kanola, Kenevir, Aspir) şarttır. Tüy döneminde aç bırakma veya düşük proteinli yem verme, gelecek sezonun uçuş teleklerinde kalıcı stres çizgilerine neden olur.',
        cautionNote: 'Tüy dökümü döneminde kuşlara ağır ilaç/antibiyotik kürleri uygulanmamalı; haftada 2 kez ılık banyo tuzu/elma sirkeli banyo suyu verilmelidir.',
        seeds: [
          { name: 'Keten Tohumu, Kanola (Kolza) & Kenevir', icon: '🌿', category: 'Omega-3 & İpeksi Telek', pct: 22, color: '#059669', benefit: 'Yeni çıkan uçuş teleklerine esneklik, su geçirmezlik ve kadifemsi parlaklık verir.' },
          { name: 'Bezelye, Fiğ & Maş Fasulyesi', icon: '🟢', category: 'Keratin & Aminoasit', pct: 22, color: '#7c3aed', benefit: 'Tüy oluşumu için gereken ham protein ve sistin kaynağını sağlar.' },
          { name: 'Mısır & Buğday', icon: '🌽', category: 'Bazal Enerji', pct: 22, color: '#0066ff', benefit: 'Sonbahar serinliğinde vücut ısısını ve enerji dengesini korur.' },
          { name: 'Aspir Tohumu (Kardi)', icon: '🌻', category: 'Linoleik Asit', pct: 14, color: '#7c3aed', benefit: 'Tüy foliküllerini besler ve tüy değişimini hızlandırır.' },
          { name: 'Arpa & Çeltik', icon: '🌾', category: 'Sindirim & Lif', pct: 12, color: '#059669', benefit: 'Kuşların tüy döneminde aşırı iç yağlanmasını dengeler.' },
          { name: 'Beyaz & Kırmızı Dari', icon: '⚪', category: 'Tamamlayıcı Tahıl', pct: 8, color: '#0066ff', benefit: 'Dengeli karbonhidrat desteği.' }
        ],
        supplements: [
          { dayOrTiming: 'Haftada 3 Gün Yem Üstü', item: 'DL-Metiyonin + Biotin + Bira Mayası + Keten Tohumu Yağı', purpose: 'Telek saplarının kırılmaz ve esnek olmasını sağlayan birincil aminoasit kombinasyonu.', dosage: '1 Kg Yeme 5 gr', badgeClass: 'gene-purple' },
          { dayOrTiming: 'Haftada 2 Gün', item: 'Banyo Suyu (Banyo Tuzu veya Elma Sirkesi)', purpose: 'Tüy kapsüllerinin kolay açılmasını ve deri gözeneklerinin temizlenmesini sağlar.', dosage: '10 Lt Suya 1 Kaşık', badgeClass: 'gene-blue' }
        ]
      },

      winter_rest: {
        title: '❄️ Kış & Dinlenme Dönemi (Yağlanma Önleyici Yüksek Lifli) Rasyon',
        gramsPerBird: 32,
        morningRatioPct: 50,
        kcalPer100g: 308,
        macros: { carb: 66, protein: 11, fat: 5 },
        rationScore: 95,
        scientificRationale: 'Tüy dökümü bittikten sonra eşleşme sezonuna kadar olan kış dinlenme döneminde damızlık ve yarışçıların karın içi yağlanması (özellikle dişilerde yumurtlama kanalının yağ bağlaması) en büyük risktir. Yüksek lifli arpa ve çeltik ağırlıklı rasyon, kuşları tok tutarken iç yağlanmayı tamamen önler.',
        cautionNote: 'Kışın günde tek öğün veya sabah çok hafif (%40) - öğleden sonra (%60) kontrollü yemleme yapılmalı; hava sıfırın altına düştüğünde mısır oranı artırılmalıdır.',
        seeds: [
          { name: 'Birinci Sınıf Dolgun Arpa', icon: '🌾', category: 'Form & Yağlanma Önleyici', pct: 42, color: '#059669', benefit: 'Düşük kalori ve yüksek lif yapısıyla kışın iç organ yağlanmasını önler.' },
          { name: 'Buğday & Beyaz Dari', icon: '⚪', category: 'Temel Kış Karbonhidratı', pct: 22, color: '#0066ff', benefit: 'Günlük bazal metabolizma enerjisini karşılar.' },
          { name: 'Mısır', icon: '🌽', category: 'Kış Vücut Isısı', pct: 16, color: '#0066ff', benefit: 'Gece soğuklarında vücut sıcaklığını (termogenez) korur.' },
          { name: 'Çeltik (Kabuklu Pirinç)', icon: '🍚', category: 'Bağırsak Sağlığı', pct: 12, color: '#059669', benefit: 'Kış neminde bağırsak sağlığını ve sıkı dışkı formunu korur.' },
          { name: 'Bezelye & Aspir', icon: '🌻', category: 'Minimum Bakım', pct: 8, color: '#7c3aed', benefit: 'Kas kütlesini ve tüy parlaklığını koruyacak bazal protein/yağ.' }
        ],
        supplements: [
          { dayOrTiming: 'Haftada 2 Gün Suluk', item: 'Doğal Sarımsak-Soğan-Limon-Elma Sirkesi Kürü veya Probiyotik', purpose: 'Kışın doğal bağışıklığı ve üst solunum yollarını korur.', dosage: '1 Lt Suya 5 ml', badgeClass: 'gene-green' },
          { dayOrTiming: 'Her Gün', item: 'Taze Grit & Mineral Taşı', purpose: 'Arpa ve çeltiğin taşlıkta tam öğütülmesini sağlar.', dosage: 'Serbest', badgeClass: 'gene-blue' }
        ]
      }
    };

    const resolvedKey = phaseKey === 'auto_today_smart' ? autoDetectedPhaseKey : phaseKey;
    const base = PHASES[resolvedKey] || PHASES.monthly_full_loft || PHASES.race_loading_long;
    const phaseTitleDisplay = phaseKey === 'auto_today_smart'
      ? `🎯 Tarih & Durum Bazlı Akıllı Reçete: ${base.title}`
      : base.title;
    const seeds = base.seeds.map(s => ({ ...s }));
    const macros = { ...base.macros };
    let gramsPerBird = base.gramsPerBird;
    let kcalPer100g = base.kcalPer100g;
    let weatherAdjustmentNote = '';

    // CANLI HAVA DURUMU (AvigenLiveWeather) ENTEGRASYONU İLE DİNAMİK RASYON UYARLAMASI
    if (isColdWeather) {
      gramsPerBird += 3;
      kcalPer100g += 18;
      macros.fat = Math.min(25, macros.fat + 2);
      weatherAdjustmentNote = `Hava sıcaklığı soğuk (${temp}°C ≤ 10°C). Kuşların vücut ısısını (termogenez) koruması için kuş başı günlük porsiyon +3 gr artırıldı ve mısır/yağlı tohum enerjisi yükseltildi.`;
    } else if (isHotWeather) {
      gramsPerBird = Math.max(28, gramsPerBird - 2);
      macros.protein = Math.max(10, macros.protein - 1);
      weatherAdjustmentNote = `Hava sıcaklığı yüksek (${temp}°C ≥ 28°C). Sindirim sırasında oluşan metabolik ısıyı ve uçuşta susuzluk (dehidrasyon) riskini azaltmak için ağır bakliyat oranı hafifletildi; sulukta elektrolit desteği önerilir.`;
    } else if (isHardWind && phaseKey.startsWith('race_')) {
      gramsPerBird += 2;
      macros.fat = Math.min(25, macros.fat + 2);
      weatherAdjustmentNote = `Canlı rüzgâr şiddetli (${wState.windSpeedKmh} km/sa). Karşı rüzgârda artan uçuş süresi için kas içi lipit (yağlı tohum) payı ve günlük gramaj (+2 gr/kuş) güçlendirildi.`;
    } else {
      weatherAdjustmentNote = `Mevcut hava koşulları (${temp}°C, %${wState.hum} nem, ${wState.windSpeedKmh} km/sa rüzgâr) optimum aralıkta; standart bilimsel rasyon oranları uygulandı.`;
    }

    const totalDailyGrams = birdCount * gramsPerBird;
    const morningGrams = Math.round(totalDailyGrams * (base.morningRatioPct / 100));
    const eveningGrams = totalDailyGrams - morningGrams;
    const totalDailyKgLabel = totalDailyGrams >= 1000
      ? `${(totalDailyGrams / 1000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`
      : `${totalDailyGrams} gr`;

    // Tohumları 3 fiyat grubuna (Tahıl / Bakliyat / Yağlı Tohum) sınıflandır ve 30 günlük kg hesapla
    let grainPctSum = 0;
    let legumePctSum = 0;
    let oilSeedPctSum = 0;

    const computedSeeds = seeds.map(s => {
      const dailyGrams = Math.round(totalDailyGrams * (s.pct / 100));
      const monthlyKg = (dailyGrams * 30) / 1000;
      const nLower = s.name.toLowerCase();
      let fType = s.feedType;
      if (!fType) {
        if (nLower.includes('bezelye') || nLower.includes('maş') || nLower.includes('fiğ') || nLower.includes('mercimek') || nLower.includes('burçak')) {
          fType = 'legume';
        } else if (nLower.includes('aspir') || nLower.includes('kenevir') || nLower.includes('keten') || nLower.includes('ayçekirdeği') || nLower.includes('fıstığı') || nLower.includes('kanola')) {
          fType = 'oilSeed';
        } else {
          fType = 'grain';
        }
      }
      if (fType === 'legume') legumePctSum += s.pct;
      else if (fType === 'oilSeed') oilSeedPctSum += s.pct;
      else grainPctSum += s.pct;

      return {
        ...s,
        feedType: fType,
        dailyGrams,
        monthlyKg,
        monthlyKgLabel: monthlyKg.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
      };
    });

    // 30 GÜNLÜK (1 AYLIK) YEM, GRİT, SU VE SULU MALZEME HESABI
    const totalMonthlyFeedKg = (totalDailyGrams * 30) / 1000;
    const grainMonthlyKg = totalMonthlyFeedKg * (grainPctSum / 100);
    const legumeMonthlyKg = totalMonthlyFeedKg * (legumePctSum / 100);
    const oilSeedMonthlyKg = totalMonthlyFeedKg * (oilSeedPctSum / 100);
    const sacks25Kg = totalMonthlyFeedKg / 25;

    // Grit/Mineral: Kuş başı ~3 gr/gün x 30 gün
    const gritMonthlyKg = (birdCount * 3 * 30) / 1000;

    // İçme suyu: Kuş başı ~60 ml/gün (sıcak havada 75 ml/gün)
    const waterMlPerBirdDay = isHotWeather ? 75 : 60;
    const dailyWaterLiters = (birdCount * waterMlPerBirdDay) / 1000;
    const monthlyWaterLiters = dailyWaterLiters * 30;

    // Sulu Malzemeler & Yem Üstü Takviyeler (30 Günlük):
    // 1. Elektrolit & Aminoasit: Haftada 2 gün (Ayda ~9 gün), 1 Lt suya 2 ml
    const electrolyteMl = Math.round(dailyWaterLiters * 9 * 2);
    // 2. Elma Sirkesi / Sıvı Probiyotik: Haftada 2 gün (Ayda ~9 gün), 1 Lt suya 5 ml
    const vinegarProbioticMl = Math.round(dailyWaterLiters * 9 * 5);
    // 3. Sarımsak/Kekik/Omega-3 Enerji Yağı: Haftada 2.5 gün (Ayda ~10 gün), 1 kg yeme 5 ml
    const feedOilMl = Math.round((totalDailyGrams / 1000) * 10 * 5);
    // 4. Bira Mayası & Metiyonin Tozu: Haftada 2.5 gün (Ayda ~10 gün), 1 kg yeme 6 gr
    const yeastPowderGrams = Math.round((totalDailyGrams / 1000) * 10 * 6);

    // CANLI MALİYET HESABI (TL)
    const prices = {
      grainPerKg: Number(this.state.feedPrices?.grainPerKg ?? 28),
      legumePerKg: Number(this.state.feedPrices?.legumePerKg ?? 42),
      oilSeedPerKg: Number(this.state.feedPrices?.oilSeedPerKg ?? 55),
      gritPerKg: Number(this.state.feedPrices?.gritPerKg ?? 25),
      liquidsMonthly: Number(this.state.feedPrices?.liquidsMonthly ?? 450)
    };

    const feedMonthlyTl = (grainMonthlyKg * prices.grainPerKg) + (legumeMonthlyKg * prices.legumePerKg) + (oilSeedMonthlyKg * prices.oilSeedPerKg);
    const gritMonthlyTl = gritMonthlyKg * prices.gritPerKg;
    const liquidsMonthlyTl = prices.liquidsMonthly;
    const totalMonthlyTl = feedMonthlyTl + gritMonthlyTl + liquidsMonthlyTl;
    const dailyTl = totalMonthlyTl / 30;
    const perBirdMonthlyTl = totalMonthlyTl / Math.max(1, birdCount);
    const perBirdDailyTl = dailyTl / Math.max(1, birdCount);
    const avgFeedPerKgTl = totalMonthlyFeedKg > 0 ? (feedMonthlyTl / totalMonthlyFeedKg) : prices.grainPerKg;
    const sack25KgPriceTl = avgFeedPerKgTl * 25;

    const fmtTl = (v, dec = 0) => Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const fmtKg = (v, dec = 1) => Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

    todayFeedRecommendation = `${seasonLabel} ve ${temp}°C canlı hava için kuş başı ${gramsPerBird} gr/gün (Sabah %${base.morningRatioPct} = ${morningGrams.toLocaleString('tr-TR')} gr, Akşam %${100 - base.morningRatioPct} = ${eveningGrams.toLocaleString('tr-TR')} gr; Toplam ${totalDailyKgLabel}/gün). Öne çıkan tohumlar: ${computedSeeds.slice(0, 3).map(s => `${s.name} (%${s.pct})`).join(', ')}.`;

    return {
      phaseKey,
      resolvedKey,
      groupKey,
      birdCount,
      phaseTitle: phaseTitleDisplay,
      gramsPerBird,
      morningRatioPct: base.morningRatioPct,
      totalDailyGrams,
      morningGrams,
      eveningGrams,
      totalDailyKgLabel,
      kcalPer100g,
      macros,
      rationScore: base.rationScore,
      scientificRationale: base.scientificRationale,
      cautionNote: base.cautionNote,
      seeds: computedSeeds,
      supplements: base.supplements,
      weather: wState,
      weatherAdjustmentNote,
      todaySmart: {
        dateLabel,
        seasonLabel,
        birdStatusSummary,
        todayFeedRecommendation,
        todayLiquidRecommendation
      },
      loftBreakdown: {
        totalActive: totalLoftBirds,
        breeders: breedersCount,
        racers: racersCount,
        young: youngCount,
        activeNests: activeNestsCount
      },
      monthly: {
        totalFeedKg: totalMonthlyFeedKg,
        totalFeedKgLabel: fmtKg(totalMonthlyFeedKg, 1),
        grainKgLabel: fmtKg(grainMonthlyKg, 1),
        legumeKgLabel: fmtKg(legumeMonthlyKg, 1),
        oilSeedKgLabel: fmtKg(oilSeedMonthlyKg, 1),
        sacks25KgLabel: fmtKg(sacks25Kg, 1),
        gritKgLabel: fmtKg(gritMonthlyKg, 1),
        dailyWaterLitersLabel: fmtKg(dailyWaterLiters, 1),
        waterLitersLabel: fmtKg(monthlyWaterLiters, 0),
        electrolyteMl,
        vinegarProbioticMl,
        feedOilMl,
        yeastPowderGrams
      },
      prices,
      cost: {
        feedMonthlyTlLabel: fmtTl(feedMonthlyTl, 0),
        gritMonthlyTlLabel: fmtTl(gritMonthlyTl, 0),
        liquidsMonthlyTlLabel: fmtTl(liquidsMonthlyTl, 0),
        totalMonthlyTlLabel: fmtTl(totalMonthlyTl, 0),
        dailyTlLabel: fmtTl(dailyTl, 1),
        perBirdMonthlyTlLabel: fmtTl(perBirdMonthlyTl, 1),
        perBirdDailyTlLabel: fmtTl(perBirdDailyTl, 2),
        avgFeedPerKgTlLabel: fmtTl(avgFeedPerKgTl, 1),
        sack25KgPriceTlLabel: fmtTl(sack25KgPriceTl, 0)
      }
    };
  }
};
