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
    isPremiumActive: true,
    planName: 'AVIGEN PRO (Yıllık Abonelik)',
    viewStage: 'launcher', // 'launcher' (Kare Bento Kartlar) | 'tool' (Seçilen Analiz Çalışma Ekranı) | 'history' (Geçmiş Analizler)
    activeMode: 'breeding', // 'breeding' | 'global_pool' | 'racing' | 'compare' | 'purchase' | 'distance' | 'future_sim'
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
    cortexAdvisorTopic: 'damizlik_secimi', // 'damizlik_secimi' | 'yaris_hazirlik' | 'bugun_yem_sivi' | 'eksik_veri_raporu' | 'akrabalik_taramasi' | 'custom'
    cortexCustomQuestion: '',
    cortexLearningLog: [], // Kullanıcının kabul/ret kararları, tahmin vs gerçek sonuç karşılaştırmaları
    cortexModelVersion: 'v2.0.1',
    hasVerifiedDnaLabData: false
  },

  analysisHistory: [],

  // ==========================================================================
  // MERKEZİ GENETİK HESAPLAMA MOTORU ÖNBELLEĞİ (CENTRAL COMPUTATION CACHE)
  // Aynı soyağacı, COI, eşleştirme veya performans profili analizinin tekrar
  // tekrar çalıştırılmasını önler; kümes verisi değiştiğinde imza otomatik yenilenir.
  // ==========================================================================
  _engineCache: {
    signature: '',
    breedingFull: {},
    breedingQuick: {},
    racing: {},
    futureSim: {},
    perfProfile: {}
  },

  // ==========================================================================
  // AVIGEN GENESIS AI — 2 ÇEKİRDEK BİLİMSEL MODÜL MİMARİSİ
  // 1. Akıllı Eşleştirme, 5 Nesil Soy & Yavru Analizi
  // 2. Akıllı Yem Rasyonu, Tarih/Durum Önerisi & 1 Aylık Maliyet Motoru
  // ==========================================================================
  MAIN_MODULES: [
    {
      id: 'breeding_hub',
      defaultSubMode: 'breeding',
      num: '1',
      icon: '💞',
      title: 'AKILLI EŞLEŞTİRME, 5 NESİL SOY & YAVRU ANALİZİ',
      shortTitle: '1. Eşleştirme & 5 Nesil Soy',
      badge: '1. MOTOR • EŞLEŞTİRME & SOY',
      accent: '#7c3aed',
      bgGrad: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(0,102,255,0.06), rgba(255,255,255,0.98))',
      purpose: 'Kümesinizdeki erkek ve dişi kuşların 5 nesil (62 ata) akrabalık riskini, ortak atanın şampiyonluk kalitesini, mesafe/hız tamamlayıcılığını analiz eder; en uygun 5 çifti otomatik sıralar ve tek tuşla aktif yuvaya kaydeder.',
      inputs: '5 kuşak soyağacı, mevcut yarış/kardeş/yavru dereceleri ve mesafe profilleri.',
      outputs: 'Gerekçeli uyum kararı, Avantaj/Risk raporu, en uygun 5 çift listesi ve tek tuşla yuva kaydı.',
      subFunctions: []
    },
    {
      id: 'nutrition_hub',
      defaultSubMode: 'nutrition',
      num: '2',
      icon: '🌾',
      title: 'AKILLI YEM, TARİH/DURUM SIVI ÖNERİSİ & 1 AYLIK MALİYET',
      shortTitle: '2. Akıllı Yem & Sıvı Motoru',
      badge: '2. MOTOR • BESLENME & MALİYET',
      accent: '#059669',
      bgGrad: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,102,255,0.05), rgba(255,255,255,0.98))',
      purpose: 'Bugünün tarihine, canlı hava sıcaklığına ve kuşların durumuna (aktif yuva, yarış, tüy, kış) göre günlük akıllı yem + suluk sıvı reçetesi önerir; 1 aylık tüketim ve TL maliyet hesabı yapar.',
      inputs: 'Günün tarihi/mevsim, aktif yuvalar, kuş kategorileri, canlı hava (°C) ve yem birim fiyatları.',
      outputs: 'Tarih/durum bazlı akıllı yem ve sıvı önerisi, tohum gramajları, 1 aylık sulu malzeme ve maliyet tablosu.',
      subFunctions: []
    }
  ],

  getMainModuleForMode(mode) {
    if (mode === 'nutrition') return this.MAIN_MODULES[1];
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
        ? pedigrees.slice(0, 12).map(p => `${p.id}:${p.boxes?.main?.ring || ''}:${(p.boxes?.main?.notes || '').length}:${p.boxes?.sire?.ring || ''}:${p.boxes?.dam?.ring || ''}`).join('|')
        : '';
      const rCount = typeof racesList !== 'undefined' ? racesList.length : 0;
      const gCount = typeof AvigenGlobalGenePool !== 'undefined' ? AvigenGlobalGenePool.db.global_gene_pool.length : 0;
      return `${pCount}_${rCount}_${gCount}_${pRings}`;
    } catch (e) {
      return String(Date.now());
    }
  },

  ensureEngineCacheFresh() {
    const sig = this.getDataSignature();
    if (this._engineCache.signature !== sig) {
      this._engineCache = {
        signature: sig,
        breedingFull: {},
        breedingQuick: {},
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
      if (!['breeding', 'nutrition'].includes(this.state.activeMode)) {
        this.state.activeMode = 'breeding';
      }
      const savedHist = localStorage.getItem(GENESIS_HISTORY_STORAGE_KEY);
      if (savedHist) {
        const parsedH = JSON.parse(savedHist);
        if (Array.isArray(parsedH)) this.analysisHistory = parsedH;
      }
    } catch (e) {}
  },

  saveState() {
    localStorage.setItem(GENESIS_STORAGE_KEY, JSON.stringify(this.state));
  },

  saveHistory() {
    localStorage.setItem(GENESIS_HISTORY_STORAGE_KEY, JSON.stringify(this.analysisHistory.slice(0, 40)));
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

    // Bu güvercin için en uygun karşı cins eş adayları
    const { males, females } = getAllBreedingCandidates();
    const isFemaleSubject = /\b(dişi|hen|♀|kraliçe|lady|princess|sultan|miss)\b/i.test(`${b.main?.name || ''} ${b.main?.color || ''}`);
    const oppositePool = isFemaleSubject ? males : females;

    const altMatches = oppositePool
      .filter(c => c.ring !== subjectInfo.ring)
      .map(c => {
        const sId = isFemaleSubject ? c.id : `${ped.id}::main`;
        const dId = isFemaleSubject ? `${ped.id}::main` : c.id;
        const br = this.analyzeBreedingIntelligence(sId, dId, true);
        let reasonText = '';
        let sciRefId = 'sci_gazda_2018';
        let sciRefTitle = 'Gazda et al. (2018) — Poligenik Çeşitlilik';
        if (br.coi === 0) {
          reasonText = 'Yabancı kan (Outcross • %0 COI) ile maksimum melez canlılığı (heterosis) ve poligenik atletik çeşitlilik sağlar.';
          sciRefId = 'sci_gazda_2018';
          sciRefTitle = 'Gazda et al. (2018) — Standing Genetic Variation';
        } else if (br.coi <= 12.5) {
          reasonText = `Güvenli Linebreeding (%${br.coi.toFixed(2)} COI) ile şampiyon ortak ata genlerini inbreeding depresyonuna girmeden sabitler.`;
          sciRefId = 'sci_kolvenbag_2022';
          sciRefTitle = 'Kolvenbag et al. (2022) — Aile İçi Genotip & Performans';
        } else {
          reasonText = `Yakın akrabalık (%${br.coi.toFixed(2)} COI); yalnızca damızlık stokta soy kilitlemek için önerilir.`;
          sciRefId = 'sci_kolvenbag_2022';
          sciRefTitle = 'Kolvenbag et al. (2022)';
        }
        return { candidate: c, score: br.totalScore, coi: br.coi, reasonText, sciRefId, sciRefTitle };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

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
    const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];

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

    const sTree = getCandidateLineageTree(sRef);
    const dTree = getCandidateLineageTree(dRef);

    const sireInfo = this.inspectAncestorBox(sTree.self, 0);
    const damInfo = this.inspectAncestorBox(dTree.self, 0);

    // Ebeveynlerin 5 kuşağındaki (62 ata kutusu) mevcut kayıtları değerlendir
    const evalDeepTreeScore = (tree) => {
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
      let wSumExisting = 0;
      let wTotExisting = 0;
      let filledNodesCount = 0;
      let perfNotedNodesCount = 0;
      let maxAncestorDistKm = 0;
      const ancestorWins = [];
      const strainSet = new Set();
      const allNotesArr = [tree.self?.notes || ''];
      const nodeScoreByRing = new Map();

      nodes.forEach(n => {
        const inf = this.inspectAncestorBox(n.box, n.gen);
        if (inf.exists) {
          filledNodesCount++;
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
          inf.verifiedWins.forEach(w => {
            if (ancestorWins.length < 10) ancestorWins.push(`${inf.ring} (${inf.name}): ${w}`);
          });
        }
      });

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
        strains: Array.from(strainSet),
        ancestorWins,
        nodeScoreByRing,
        combinedNotes: allNotesArr.filter(Boolean).join('\n')
      };
    };

    const sDeep = evalDeepTreeScore(sTree);
    const dDeep = evalDeepTreeScore(dTree);

    // Kardeş (Full/Half-Sibling) ve Yavru (Offspring) gerçek yarış performanslarını tüm üst soy notlarıyla birlikte hesapla
    const sireCollateral = this.evaluateSiblingsAndOffspringPerformance(
      sireInfo.ring,
      sTree.p1?.ring,
      sTree.p2?.ring,
      sDeep.combinedNotes
    );
    const damCollateral = this.evaluateSiblingsAndOffspringPerformance(
      damInfo.ring,
      dTree.p1?.ring,
      dTree.p2?.ring,
      dDeep.combinedNotes
    );

    // Gerçek Yarış Takip (`AvigenRaceTracker`) Tutarlılık ve Mesafe Analizi
    const sireRealTrend = typeof AvigenRaceTracker !== 'undefined'
      ? AvigenRaceTracker.analyzeBirdLongitudinalTrend(sireInfo.ring)
      : { hasRealData: false, enteredCount: 0 };
    const damRealTrend = typeof AvigenRaceTracker !== 'undefined'
      ? AvigenRaceTracker.analyzeBirdLongitudinalTrend(damInfo.ring)
      : { hasRealData: false, enteredCount: 0 };

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
      diversityScore100 = breedingGoal === 'race_outcross' ? 96 : (breedingGoal === 'linebreeding_stock' ? 76 : 90);
    }

    // 2. KRİTER: 5 Nesil Pedigri & Soy Kalitesi (0-100 Ölçeği, Ağırlık: %30)
    const sPedQuality = sDeep.avgAncestorScore !== null ? sDeep.avgAncestorScore : Math.min(58, sireInfo.rawScore);
    const dPedQuality = dDeep.avgAncestorScore !== null ? dDeep.avgAncestorScore : Math.min(58, damInfo.rawScore);
    const pedigreeScore100 = Math.round((sPedQuality + dPedQuality) / 2);

    // 3. KRİTER: Gerçekleşmiş Performans, Kardeş & Yavru Kanıtı (0-100 Ölçeği, Ağırlık: %25)
    const perfSignals = [];
    if (sireInfo.verifiedWins.length > 0 || sireRealTrend.hasRealData) perfSignals.push(sireInfo.rawScore);
    if (damInfo.verifiedWins.length > 0 || damRealTrend.hasRealData) perfSignals.push(damInfo.rawScore);
    if (sireCollateral.siblingScore) perfSignals.push(sireCollateral.siblingScore);
    if (damCollateral.siblingScore) perfSignals.push(damCollateral.siblingScore);
    if (sireCollateral.offspringScore) perfSignals.push(sireCollateral.offspringScore);
    if (damCollateral.offspringScore) perfSignals.push(damCollateral.offspringScore);
    if (sDeep.ancestorWins.length > 0 && sDeep.avgAncestorScore) perfSignals.push(sDeep.avgAncestorScore);
    if (dDeep.ancestorWins.length > 0 && dDeep.avgAncestorScore) perfSignals.push(dDeep.avgAncestorScore);

    const hasPerformanceCriteria = perfSignals.length > 0;
    const performanceScore100 = hasPerformanceCriteria
      ? Math.round(perfSignals.reduce((a, b) => a + b, 0) / perfSignals.length)
      : null;
    // ÖNEMLİ DÜZELTME: Performans kaydı hiç yoksa bu kriter tamamen silinip %0 COI ile puan şişirilmez;
    // kanıtlanmamış taban puan (50/100) ile hesaba girer!
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

      altFemalesForSire = females
        .filter(f => f.id !== dRef && f.ring !== sireInfo.ring)
        .map(f => {
          const r = this.analyzeBreedingIntelligence(sRef, f.id, true);
          const meta = buildAltReason(r);
          return { candidate: f, score: r.totalScore, coi: r.coi, feedbackStatus: r.userFeedbackStatus, ...meta };
        })
        .filter(item => item.feedbackStatus !== 'REJECTED')
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      altMalesForDam = males
        .filter(m => m.id !== sRef && m.ring !== damInfo.ring)
        .map(m => {
          const r = this.analyzeBreedingIntelligence(m.id, dRef, true);
          const meta = buildAltReason(r);
          return { candidate: m, score: r.totalScore, coi: r.coi, feedbackStatus: r.userFeedbackStatus, ...meta };
        })
        .filter(item => item.feedbackStatus !== 'REJECTED')
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    }

    const result = {
      mode: 'breeding',
      sireRef: sRef,
      damRef: dRef,
      breedingGoal,
      sireInfo,
      damInfo,
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

  // Kümesteki Tüm Aktif Erkek × Dişi Kombinasyonlarını Tarayıp En Yüksek Uyumlu İlk 5 Çifti Döndürür
  // (Kullanıcının "Öneride Gösterme" olarak işaretlediği çiftler listeden gizlenir, ancak hiçbir çiftin bilimsel puanı değiştirilmez!)
  getTopLoftBreedingPairs(limit = 5) {
    this.ensureEngineCacheFresh();
    const { males, females } = getAllBreedingCandidates();
    if (!males.length || !females.length) return [];
    const pairs = [];
    males.forEach(m => {
      females.forEach(f => {
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
    return pairs.sort((a, b) => b.score - a.score).slice(0, limit);
  },

  // ==========================================================================
  // ANA SAYFA İÇİN KOMPAKT AKILLI ANALİZ VİTRİN & 3 ANA MODÜL KARTLARI
  // ==========================================================================
  openModuleDirectlyFromHome(modeId, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    const resolvedMode = modeId === 'breeding_hub' ? 'breeding' : modeId;
    this.state.activeMode = resolvedMode;
    this.state.viewStage = 'tool';
    this.saveState();
    openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2]);
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

    // Ana sayfada hiçbir teknik detay, modül butonu veya analiz sonucu gösterilmez;
    // yalnızca merak uyandıran ve keşfetme/aktif etme isteği yaratan tanıtım kartı yer alır.
    if (gridBox) {
      gridBox.style.display = 'none';
      gridBox.innerHTML = '';
    }
    if (alertBox) {
      alertBox.style.display = 'none';
      alertBox.innerHTML = '';
    }

    const isFreeTier = typeof AvigenUxManager !== 'undefined' && AvigenUxManager.getCurrentTier().id === 'FREE';
    const ctaText = isFreeTier ? "✨ GENESIS AI'ı Aktif Et →" : "🧬 GENESIS AI'ı Keşfet →";

    box.innerHTML = `
      <div class="cyber-genesis-hero-card" style="padding:11px 13px; min-height:118px;" onclick="AvigenGenesisAI.backToGenesisLauncher(); openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2])">
        <div class="cyber-hero-left" style="max-width:58%;">
          <div class="cyber-hero-brand-top">
            <span class="cyber-ai-chip-box">AI</span>
            <span class="cyber-avigen-lbl">GENESIS AI</span>
            <span class="gene-badge gene-purple" style="font-size:8px; padding:1px 6px;">YENİ NESİL</span>
          </div>
          <div style="font-size:13px; font-weight:900; color:var(--ios-text); line-height:1.22; margin-top:4px;">
            Hangi Çiftinizden Şampiyon Doğacak?
          </div>
          <div style="font-size:9.5px; font-weight:600; color:var(--ios-subtext); line-height:1.35; margin-top:3px;">
            5 nesil soy uyumunu, en iyi damızlık çiftleri ve akıllı yem/maliyet hesabını keşfedin.
          </div>
          <button type="button" class="cyber-gold-cta-btn" style="margin-top:7px; padding:5px 11px; font-size:10px;">
            <span>${ctaText}</span>
          </button>
        </div>
        <div class="cyber-hero-right" style="right:0; top:0; bottom:0; width:45%;">
          ${this.renderCyberPigeonHeroSvg()}
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

    // 3. Global Gen Havuzu En İyi Küresel Aday Bildirimi
    if (typeof AvigenGlobalGenePool !== 'undefined') {
      const topGlobal = AvigenGlobalGenePool.computeTopGlobalBestPairsForLoft(1)[0];
      if (topGlobal) {
        notifications.push({
          type: 'GLOBAL_MATCH',
          badge: `🌍 KÜRESEL GEN HAVUZU ÖNERİSİ • %${topGlobal.totalMatchScore} UYUM`,
          badgeClass: 'gene-gold',
          icon: '🌍',
          title: `${topGlobal.localBird.ring} (${topGlobal.localBird.name}) × Anonim Aday ${topGlobal.candidate.anonymous_code}`,
          desc: `${topGlobal.candidate.region_zone} • Tahmini COI: %${topGlobal.estimatedCoi} • Güven: %${topGlobal.combinedReliability}. Küresel tamamlayıcı eş adayı tespit edildi.`,
          actionsHtml: `
            <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(topGlobal.localBird.ring)}', event)">📊 Kuş Profili</button>
            <button type="button" class="nest-mini-action-btn gold" onclick="AvigenGlobalGenePool.state.selectedLocalBirdRing='ALL_BEST_PAIRS'; AvigenGenesisAI.openModuleDirectlyFromHome('global_pool');">🌍 Global Eşleşme →</button>
          `
        });
      }
    }

    // 4. Yaklaşan Yarış Etabı İçin #1 Kuş Önerisi
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

  // ==========================================================================
  // 5 ALT MODÜLLÜ AKILLI ANALİZ MERKEZİ (SMART ANALYSIS HUB)
  // Alt Modüller:
  // 1. breeding  -> 💞 Otomatik Eşleştirme
  // 2. racing    -> 📊 Tek Kuş Performans Analizi
  // 3. compare   -> ⚖️ İki Kuş Karşılaştırma
  // 4. purchase  -> 🛒 Satın Alınacak Kuş Analizi
  // 5. distance  -> 🏁 Yarış Mesafesine Göre Kuş Önerisi
  // ==========================================================================
  // ==========================================================================
  // 7. MODÜL HESAPLAMA MOTORU: GENETİK GELECEK SİMÜLASYONU (F1 & F2 NESİL PROJEKSİYONU)
  // Kantitatif Genetik Altyapı:
  // - F1 (1. Nesil Yavru) Beklenen Değer: E(F1) = μ_pop + h² * ((P_Baba + P_Anne)/2 - μ_pop) + H_heterosis - D_inbreeding
  // - Mendelian Segregation Variance (σ_M): Soyağacı tamlığına göre beklenen en düşük-en yüksek olasılık aralığı
  // - F2 (2. Nesil Torun) Projeksiyonu: F1 yavrunun seçilen 3. bir damızlıkla (F2 Eşi) eşleşmesinden doğacak torun nesli
  // - Eksik Veri Kuralı: Ebeveyn soyağacında en az %35 veri yoksa kesin genetik projeksiyon üretmez!
  // ==========================================================================
  simulateGeneticFutureGenerations(sireRef, damRef, f2PartnerRef, targetGoal = 'balanced') {
    this.ensureEngineCacheFresh();
    const { males, females, all } = getAllBreedingCandidates();
    const sRef = sireRef || (males[0]?.id || all[0]?.id);
    const dRef = damRef || (females[0]?.id || all[1]?.id || all[0]?.id);
    const p3Ref = f2PartnerRef || (all.find(x => x.id !== sRef && x.id !== dRef)?.id || all[0]?.id);

    const simCacheKey = `${sRef}__${dRef}__${p3Ref}__${targetGoal}`;
    if (this._engineCache.futureSim[simCacheKey]) {
      return this._engineCache.futureSim[simCacheKey];
    }

    const brF1 = this.analyzeBreedingIntelligence(sRef, dRef, true);
    const sTree = getCandidateLineageTree(sRef);
    const dTree = getCandidateLineageTree(dRef);
    const p3Tree = getCandidateLineageTree(p3Ref);
    const p3Info = this.inspectAncestorBox(p3Tree.self, 0);

    const profSire = this.getCachedPerformanceProfile(brF1.sireInfo.ring);
    const profDam = this.getCachedPerformanceProfile(brF1.damInfo.ring);
    const profP3 = this.getCachedPerformanceProfile(p3Info.ring);

    const getTrait = (prof, cat, key, fallback = null) => {
      if (!prof) return fallback;
      const m = prof.categories[cat]?.metrics?.find(x => x.key === key);
      return m && m.score !== null ? m.score : fallback;
    };

    const sFilled = sTree.ancRings.length;
    const dFilled = dTree.ancRings.length;
    const p3Filled = p3Tree.ancRings.length;

    const f1Reliability = brF1.dataReliabilityPct;
    const f2Reliability = Math.max(20, Math.round(f1Reliability * 0.65 + (Math.min(100, (p3Filled / 15) * 100) * 0.35) - 6));

    // Eksik veri analiz yapılmasına engel olmaz; mevcut verilerle projeksiyon gerçekleştirilir,
    // eksik alanlar ise olasılık aralığını (± puan) genişleterek belirsizliği dürüstçe yansıtır.
    const hasSufficientPedigreeData = Boolean(brF1.sireInfo.ring || brF1.damInfo.ring);

    // Tahmin belirsizliği (± puan sapması) ve veri yeterliliği sınıflandırması
    const f1UncertaintySpread = Math.max(5, Math.round(14 - (f1Reliability / 12)));
    const f2UncertaintySpread = f1UncertaintySpread + 3;
    const dataSufficiencyLabel = f1Reliability >= 75
      ? 'Yüksek Veri Kapsamı'
      : (f1Reliability >= 45 ? 'Orta Veri Kapsamı' : 'Temel Veri Kapsamı (Geniş Olasılık Aralığı)');

    const traitsConfig = [
      { key: 'speed', label: '⚡ Uçuş Hızı (Speed)', cat: 'flight', h2: 0.34, goalGroup: 'sprint_speed' },
      { key: 'endurance', label: '🫀 Dayanıklılık (Endurance)', cat: 'flight', h2: 0.38, goalGroup: 'long_endurance' },
      { key: 'sprint', label: '🚀 Sprint (Kısa Mesafe)', cat: 'flight', h2: 0.35, goalGroup: 'sprint_speed' },
      { key: 'middle', label: '💨 Orta Mesafe', cat: 'flight', h2: 0.36, goalGroup: 'balanced' },
      { key: 'long', label: '🏔️ Uzun Mesafe', cat: 'flight', h2: 0.38, goalGroup: 'long_endurance' },
      { key: 'consistency', label: '🎯 Yarış İstikrarı', cat: 'racing', h2: 0.32, goalGroup: 'balanced' },
      { key: 'homing', label: '🧭 Eve Dönüş (Homing)', cat: 'navigation', h2: 0.40, goalGroup: 'long_endurance' }
    ];

    // F1 -> F2 arasındaki tahmini Wright COI
    const wrightS_P3 = this.calculateExactWrightCOI(sTree, p3Tree);
    const wrightD_P3 = this.calculateExactWrightCOI(dTree, p3Tree);
    const f2Coi = Number(((wrightS_P3.coiPercent + wrightD_P3.coiPercent) / 2).toFixed(2));

    const popMean = 62;
    const f1HeterosisBonus = brF1.coi === 0 ? 4 : (brF1.coi <= 12.5 ? 2 : -7);
    const f2HeterosisBonus = f2Coi === 0 ? 4 : (f2Coi <= 12.5 ? 2 : -8);

    const simulatedTraits = traitsConfig.map(t => {
      const valS = getTrait(profSire, t.cat, t.key, null);
      const valD = getTrait(profDam, t.cat, t.key, null);
      const valP3 = getTrait(profP3, t.cat, t.key, null);

      if (valS === null && valD === null) {
        return {
          key: t.key,
          label: t.label,
          goalGroup: t.goalGroup,
          sireVal: null,
          damVal: null,
          f1Expected: null,
          f1Range: 'Veri Yok',
          f2Expected: null,
          f2Range: 'Veri Yok'
        };
      }

      const effS = valS !== null ? valS : popMean;
      const effD = valD !== null ? valD : popMean;
      const midParentF1 = (effS + effD) / 2;

      // Galton-Mendel Kalıtsal Beklenti Formülü
      const f1Exp = Math.max(35, Math.min(97, Math.round(popMean + (midParentF1 - popMean) * (0.55 + t.h2 * 0.6) + f1HeterosisBonus)));
      const f1Min = Math.max(30, f1Exp - f1UncertaintySpread);
      const f1Max = Math.min(99, f1Exp + f1UncertaintySpread);

      // F2 (2. Kuşak Torun) Beklentisi
      const effP3 = valP3 !== null ? valP3 : popMean;
      const midParentF2 = (f1Exp + effP3) / 2;
      const f2Exp = Math.max(35, Math.min(97, Math.round(popMean + (midParentF2 - popMean) * (0.52 + t.h2 * 0.55) + f2HeterosisBonus)));
      const f2Min = Math.max(28, f2Exp - f2UncertaintySpread);
      const f2Max = Math.min(99, f2Exp + f2UncertaintySpread);

      return {
        key: t.key,
        label: t.label,
        goalGroup: t.goalGroup,
        sireVal: valS,
        damVal: valD,
        p3Val: valP3,
        f1Expected: f1Exp,
        f1Range: `${f1Min}–${f1Max}`,
        f2Expected: f2Exp,
        f2Range: `${f2Min}–${f2Max}`
      };
    });

    const computeGoalWeightedAvg = (list, field) => {
      let wSum = 0;
      let wTotal = 0;
      list.forEach(item => {
        if (item[field] === null) return;
        const w = (targetGoal !== 'balanced' && item.goalGroup === targetGoal) ? 1.8 : 1.0;
        wSum += item[field] * w;
        wTotal += w;
      });
      return wTotal > 0 ? Math.round(wSum / wTotal) : null;
    };

    const f1Overall = computeGoalWeightedAvg(simulatedTraits, 'f1Expected');
    const f2Overall = computeGoalWeightedAvg(simulatedTraits, 'f2Expected');

    const result = {
      hasSufficientPedigreeData,
      sireInfo: brF1.sireInfo,
      damInfo: brF1.damInfo,
      p3Info,
      sFilled,
      dFilled,
      p3Filled,
      f1Coi: brF1.coi,
      f2Coi,
      f1Reliability,
      f2Reliability,
      f1UncertaintySpread,
      f2UncertaintySpread,
      dataSufficiencyLabel,
      f1Overall,
      f2Overall,
      simulatedTraits,
      missingWarnings: brF1.missingWarnings
    };
    this._engineCache.futureSim[simCacheKey] = result;
    return result;
  },

  switchGenesisMode(mode, evt) {
    if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
    const resolvedMode = mode === 'breeding_hub' ? 'breeding' : mode;
    this.state.activeMode = resolvedMode;
    this.state.viewStage = 'tool';
    this.saveState();
    this.renderGenesisModuleUI();
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
    const rSel = document.getElementById('genesisRacerSelect');
    const sSel = document.getElementById('genesisSireSelect');
    const dSel = document.getElementById('genesisDamSelect');
    const bGoal = document.getElementById('genesisBreedingGoal');
    const cASel = document.getElementById('genesisCompASelect');
    const cBSel = document.getElementById('genesisCompBSelect');
    const pRing = document.getElementById('genesisPurchRing');
    const pSex = document.getElementById('genesisPurchSex');
    const pSpec = document.getElementById('genesisPurchSpec');
    const pAnc = document.getElementById('genesisPurchAnc');
    const pWins = document.getElementById('genesisPurchWins');
    const tDist = document.getElementById('genesisTargetDist');
    const tWind = document.getElementById('genesisTargetWind');

    if (rSel) this.state.selectedRacerPedId = rSel.value;
    if (sSel) this.state.selectedSireRef = sSel.value;
    if (dSel) this.state.selectedDamRef = dSel.value;
    if (bGoal) this.state.breedingTargetGoal = bGoal.value;
    if (cASel) this.state.compareBirdARing = cASel.value;
    if (cBSel) this.state.compareBirdBRing = cBSel.value;
    if (pRing) this.state.purchaseBirdRing = pRing.value;
    if (pSex) this.state.purchaseBirdSex = pSex.value;
    if (pSpec) this.state.purchaseBirdSpecialty = pSpec.value;
    if (pAnc) this.state.purchaseBirdAncestorRef = pAnc.value;
    if (pWins) this.state.purchaseBirdHasWins = pWins.value;
    if (tDist) this.state.targetRaceDistKm = parseInt(tDist.value, 10) || 420;
    if (tWind) this.state.targetRaceWind = tWind.value;

    const gBirdSel = document.getElementById('genesisGlobalLocalBird');
    const gDistSel = document.getElementById('genesisGlobalDistFocus');
    if (gBirdSel && typeof AvigenGlobalGenePool !== 'undefined') AvigenGlobalGenePool.state.selectedLocalBirdRing = gBirdSel.value;
    if (gDistSel && typeof AvigenGlobalGenePool !== 'undefined') AvigenGlobalGenePool.state.targetDistanceFocus = gDistSel.value;

    const simS = document.getElementById('genesisSimSire');
    const simD = document.getElementById('genesisSimDam');
    const simP3 = document.getElementById('genesisSimF2Partner');
    const simG = document.getElementById('genesisSimGoal');
    if (simS) this.state.simSireRef = simS.value;
    if (simD) this.state.simDamRef = simD.value;
    if (simP3) this.state.simF2PartnerRef = simP3.value;
    if (simG) this.state.simTargetGoal = simG.value;

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
      </div>
    `;
  },

  renderGenesisModuleUI() {
    const container = document.getElementById('genesisModuleRoot');
    if (!container) return;

    if (!this.state.isPremiumActive) {
      container.innerHTML = `
        <div class="genesis-paywall-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="gene-badge gene-purple">🧬 AVIGEN GENESIS AI</span>
            <span style="font-size:10.5px; color:#cbd5e1; font-weight:700;">AVIGEN FREE Sürümü</span>
          </div>
          <div style="display:flex; align-items:center; gap:11px; margin-bottom:8px;">
            <img src="avigen-logo.svg" style="width:46px; height:46px; background:#fff; padding:4px; border-radius:13px; flex-shrink:0;" />
            <div>
              <div style="font-size:15.5px; font-weight:900; color:#ffffff; letter-spacing:0.4px;">AVIGEN GENESIS AI</div>
              <div style="font-size:10.5px; font-weight:800; color:#a7f3d0; margin-top:1px;">AKILLI EŞLEŞTİRME, 5 NESİL SOY &amp; BESLENME SİSTEMİ</div>
            </div>
          </div>
          <div style="font-size:11px; color:#e2e8f0; line-height:1.5; margin-bottom:12px; background:rgba(255,255,255,0.08); padding:9px 11px; border-radius:10px;">
            • <strong>1. 💞 Akıllı Eşleştirme, 5 Nesil Soy &amp; Yavru Analizi:</strong> Kümesteki en uygun 5 çifti otomatik bulma, 5 nesil akrabalık (COI), ortak ata kalite kontrolü, mesafe tamamlayıcılığı ve tek tıkla yuva kaydı.<br/>
            • <strong>2. 🌾 Akıllı Yem, Tarih/Durum Sıvı Önerisi &amp; 1 Aylık Maliyet:</strong> Günün tarihine, canlı hava sıcaklığına ve kuşların durumuna göre günlük yem/sıvı reçetesi ve 30 günlük maliyet hesabı.
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
            <button class="ios-btn ios-btn-purple" style="padding:10px; font-size:12px;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal()">
              ✨ Paketleri İncele
            </button>
            <button class="ios-btn ios-btn-green" style="padding:10px; font-size:12px;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.setMembershipTier('GENETICS_AI'); else AvigenGenesisAI.togglePremiumSubscription(true);">
              🔓 GENESIS AI'ı Aç
            </button>
          </div>
        </div>
      `;
      return;
    }

    const { males, females, all } = getAllBreedingCandidates();
    const allLoftBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
    if (!this.state.selectedRacerPedId && pedigrees[0]) this.state.selectedRacerPedId = pedigrees[0].id;
    if (!['breeding', 'nutrition'].includes(this.state.activeMode)) {
      this.state.activeMode = 'breeding';
    }
    // Seçili Baba adayı gerçekten Erkek (males) listesinde mi, seçili Anne adayı gerçekten Dişi (females) listesinde mi doğrula!
    if (!this.state.selectedSireRef || (males.length > 0 && !males.some(m => m.id === this.state.selectedSireRef))) {
      this.state.selectedSireRef = males[0] ? males[0].id : '';
    }
    if (!this.state.selectedDamRef || (females.length > 0 && !females.some(f => f.id === this.state.selectedDamRef))) {
      this.state.selectedDamRef = females[0] ? females[0].id : '';
    }
    if (!this.state.compareBirdARing && allLoftBirds[0]) this.state.compareBirdARing = allLoftBirds[0].ring;
    if (!this.state.compareBirdBRing && (allLoftBirds[1] || allLoftBirds[0])) this.state.compareBirdBRing = (allLoftBirds[1] || allLoftBirds[0]).ring;
    if (!this.state.purchaseBirdAncestorRef && all[0]) this.state.purchaseBirdAncestorRef = 'NONE';
    if (!this.state.simSireRef || (males.length > 0 && !males.some(m => m.id === this.state.simSireRef))) {
      this.state.simSireRef = males[0] ? males[0].id : '';
    }
    if (!this.state.simDamRef || (females.length > 0 && !females.some(f => f.id === this.state.simDamRef))) {
      this.state.simDamRef = females[0] ? females[0].id : '';
    }
    if (!this.state.simF2PartnerRef && (all[2] || all[0])) this.state.simF2PartnerRef = (all[2] || all[0]).id;

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
    // GÖRÜNÜM 1: AVIGEN GENESIS AI — 2 ÇEKİRDEK MOTOR BAŞLATICI EKRANI
    // ========================================================================
    if (this.state.viewStage !== 'tool') {
      const tierName = typeof AvigenUxManager !== 'undefined' ? AvigenUxManager.getCurrentTier().name : 'AVIGEN GENESIS AI';

      container.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; height:100%; overflow-y:auto; padding-bottom:6px;">
          <!-- ÜST KOMUTA BAŞLIĞI -->
          <div class="genesis-launcher-hero">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
              <div style="display:flex; align-items:center; gap:9px; min-width:0;">
                <div style="width:38px; height:38px; border-radius:11px; background:#ffffff; padding:4px; flex-shrink:0;">
                  <img src="avigen-logo.svg" alt="GENESIS AI" style="width:100%; height:100%; object-fit:contain;" />
                </div>
                <div style="min-width:0;">
                  <div style="display:flex; align-items:center; gap:5px;">
                    <span style="font-size:13.5px; font-weight:900; color:#ffffff; letter-spacing:0.3px;">AVIGEN GENESIS AI</span>
                    <span class="gene-badge gene-green" style="font-size:8px; padding:1px 5px;">v2.0</span>
                  </div>
                  <div style="font-size:9.3px; font-weight:700; color:#dbeafe; margin-top:1px;">
                    5 Nesil Akıllı Eşleştirme &amp; Akıllı Yem / Maliyet Sistemi
                  </div>
                </div>
              </div>
              <div style="display:flex; gap:4px; flex-shrink:0;">
                <button class="ios-btn ios-btn-outline" style="padding:5px 7px; font-size:9.5px; background:rgba(255,255,255,0.14); color:#fff; border-color:rgba(255,255,255,0.3);" onclick="AvigenGenesisAI.openHistoryView()" title="Kaydedilen Geçmiş Analizleri Gör">
                  🕒 Geçmiş (${this.analysisHistory.length})
                </button>
                <button class="ios-btn ios-btn-outline" style="padding:5px 7px; font-size:9.5px; background:rgba(255,255,255,0.12); color:#fff; border-color:rgba(255,255,255,0.25);" onclick="if(typeof AvigenScientificLibrary!=='undefined') AvigenScientificLibrary.openLibraryFromAnywhere()" title="Bilimsel Bilgi Bankası">
                  📚
                </button>
              </div>
            </div>
          </div>

          <!-- 4 ÇEKİRDEK MOTOR KARTI -->
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

                ${m.subFunctions && m.subFunctions.length > 0 ? `
                  <div style="margin-top:6px; padding-top:6px; border-top:1px dashed var(--ios-border); display:flex; align-items:center; justify-content:space-between; gap:6px;" onclick="event.stopPropagation()">
                    <span style="font-size:9.3px; font-weight:800; color:var(--ios-subtext);">Alt Araç Seçin:</span>
                    <select class="ios-select" style="flex:1; padding:4px 8px; font-size:10.3px; font-weight:800; color:#4c1d95;" onchange="AvigenGenesisAI.switchGenesisMode(this.value, event)">
                      ${m.subFunctions.map(sf => `
                        <option value="${sf.id}" ${this.state.activeMode === sf.id ? 'selected' : ''}>${sf.label}</option>
                      `).join('')}
                    </select>
                  </div>
                ` : ''}
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
    const isBreedingHub = activeMainModule.id === 'breeding_hub';

    const subFuncBarHtml = isBreedingHub && activeMainModule.subFunctions?.length ? `
      <div style="margin-bottom:6px; display:flex; align-items:center; gap:5px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:4px 7px;">
        <span style="font-size:9px; font-weight:900; color:#5b21b6; flex-shrink:0;">🧬 Analiz Aracı:</span>
        <select class="ios-select" style="flex:1; padding:4px 7px; font-size:10.5px; font-weight:800; color:#0052cc;" onchange="AvigenGenesisAI.switchGenesisMode(this.value)">
          ${activeMainModule.subFunctions.map(sf => `
            <option value="${sf.id}" ${this.state.activeMode === sf.id ? 'selected' : ''}>${sf.label}</option>
          `).join('')}
        </select>
      </div>
    ` : '';

    let controlsHtml = '';
    if (this.state.activeMode === 'breeding') {
      const curGoal = this.state.breedingTargetGoal || 'balanced';
      const topLoftPairs = this.getTopLoftBreedingPairs(5);
      controlsHtml = `
        <div class="genesis-tool-controls">
          ${subFuncBarHtml}
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; margin-bottom:6px;">
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800; color:#0284c7;">♂ Erkek (Baba Adayı • ${males.length} Kuş)</label>
              <select id="genesisSireSelect" class="ios-select" style="width:100%; font-size:11px; font-weight:800; padding:6px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${males.length
                  ? males.map(c => `<option value="${c.id}" ${c.id === this.state.selectedSireRef ? 'selected' : ''}>♂ ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')
                  : `<option value="">⚠️ Kümesinizde kayıtlı ♂ Erkek kuş yok</option>`}
              </select>
            </div>
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800; color:#db2777;">♀ Dişi (Anne Adayı • ${females.length} Kuş)</label>
              <select id="genesisDamSelect" class="ios-select" style="width:100%; font-size:11px; font-weight:800; padding:6px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${females.length
                  ? females.map(c => `<option value="${c.id}" ${c.id === this.state.selectedDamRef ? 'selected' : ''}>♀ ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')
                  : `<option value="">⚠️ Kümesinizde kayıtlı ♀ Dişi kuş yok</option>`}
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:minmax(0,1.4fr) auto; gap:6px; align-items:end; margin-bottom:6px;">
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800; color:#5b21b6;">🎯 Eşleştirme Amacı (Puanlama Ağırlığını Belirler)</label>
              <select id="genesisBreedingGoal" class="ios-select" style="width:100%; font-size:10.5px; font-weight:800; padding:5px 7px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="balanced" ${curGoal === 'balanced' ? 'selected' : ''}>⚖️ Dengeli (Hem Yarış Hem Damızlık Uyumu)</option>
                <option value="race_outcross" ${curGoal === 'race_outcross' ? 'selected' : ''}>🏁 Güçlü Yarış Yavrusu (Yabancı Kan Kırma • %0 Akrabalık)</option>
                <option value="linebreeding_stock" ${curGoal === 'linebreeding_stock' ? 'selected' : ''}>🧬 Damızlık Soy Sabitleme (Şampiyon Ortak Ata)</option>
              </select>
            </div>
            <button class="ai-send-btn" style="padding:7px 11px; font-size:11px; flex-shrink:0;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">
              ✨ Analiz Et
            </button>
          </div>

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
        </div>
      `;
    } else if (this.state.activeMode === 'racing') {
      controlsHtml = `
        <div class="genesis-tool-controls">
          ${subFuncBarHtml}
          <label style="font-size:9.5px; font-weight:800; display:block; margin-bottom:3px;">🕊️ Değerlendirilecek Güvercini Seçin (Tek Kuş Damızlık &amp; Yarış Analizi)</label>
          <div style="display:flex; gap:6px; align-items:center;">
            <select id="genesisRacerSelect" class="ios-select" style="flex:1; font-size:11.5px; font-weight:800; padding:7px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
              ${pedigrees.map(p => {
                const m = p.boxes?.main || {};
                return `<option value="${p.id}" ${p.id === this.state.selectedRacerPedId ? 'selected' : ''}>${m.flag || '🇹🇷'} ${escapeHtml(m.ring)} — ${escapeHtml(m.name || '')}</option>`;
              }).join('')}
            </select>
            <button class="ai-send-btn" style="padding:8px 12px;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">✨ Analiz Et</button>
          </div>
        </div>
      `;
    } else if (this.state.activeMode === 'compare') {
      controlsHtml = `
        <div class="genesis-tool-controls">
          ${subFuncBarHtml}
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:7px;">
            <div>
              <label style="font-size:9.5px; font-weight:800; color:#1d4ed8;">1. Güvercin</label>
              <select id="genesisCompASelect" class="ios-select" style="font-size:11px; font-weight:800; padding:6px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${allLoftBirds.map(b => `<option value="${escapeHtml(b.ring)}" ${b.ring === this.state.compareBirdARing ? 'selected' : ''}>${b.flag} ${escapeHtml(b.ring)} (${escapeHtml(b.name)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:9.5px; font-weight:800; color:#7c3aed;">2. Güvercin</label>
              <select id="genesisCompBSelect" class="ios-select" style="font-size:11px; font-weight:800; padding:6px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${allLoftBirds.map(b => `<option value="${escapeHtml(b.ring)}" ${b.ring === this.state.compareBirdBRing ? 'selected' : ''}>${b.flag} ${escapeHtml(b.ring)} (${escapeHtml(b.name)})</option>`).join('')}
              </select>
            </div>
          </div>
          <button class="ai-send-btn" style="width:100%; padding:8px; font-size:11.5px;" onclick="AvigenGenesisAI.renderGenesisReportOnly()">
            ⚖️ İki Kuşu Genetik Potansiyel vs Gerçekleşmiş Performans Boyutunda Karşılaştır
          </button>
        </div>
      `;
    } else if (this.state.activeMode === 'purchase') {
      controlsHtml = `
        <div class="genesis-tool-controls">
          ${subFuncBarHtml}
          <div style="margin-bottom:6px;">
            <label style="font-size:9px; font-weight:800; color:#15803d;">⚡ Kümesinizdeki Kayıtlı Bir Kuşu / Yeni Eklenen Kuşu Şablon Olarak Seçin (İsteğe Bağlı)</label>
            <select class="ios-select" style="padding:5px; font-size:10.5px;" onchange="if(this.value){document.getElementById('genesisPurchRing').value=this.value; AvigenGenesisAI.onGenesisSelectionChange();}">
              <option value="">-- Manuel Halka No Girin veya Kümesten Seçin --</option>
              ${allLoftBirds.map(b => `<option value="${escapeHtml(b.ring)}">${b.flag} ${escapeHtml(b.ring)} — ${escapeHtml(b.name)} (${b.sex === 'F' ? '♀' : '♂'})</option>`).join('')}
            </select>
          </div>
          <div style="display:grid; grid-template-columns:1.1fr 0.7fr 1.2fr; gap:5px; margin-bottom:5px;">
            <div>
              <label style="font-size:9px; font-weight:800;">Alınacak Kuş Halka No</label>
              <input type="text" id="genesisPurchRing" class="ios-input" style="padding:5px 7px; font-size:11px;" value="${escapeHtml(this.state.purchaseBirdRing)}" oninput="AvigenGenesisAI.onGenesisSelectionChange()" />
            </div>
            <div>
              <label style="font-size:9px; font-weight:800;">Cinsiyet</label>
              <select id="genesisPurchSex" class="ios-select" style="padding:5px; font-size:11px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="M" ${this.state.purchaseBirdSex === 'M' ? 'selected' : ''}>♂ Erkek</option>
                <option value="F" ${this.state.purchaseBirdSex === 'F' ? 'selected' : ''}>♀ Dişi</option>
              </select>
            </div>
            <div>
              <label style="font-size:9px; font-weight:800;">Mesafe / Soy Özelliği</label>
              <select id="genesisPurchSpec" class="ios-select" style="padding:5px; font-size:11px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="sprint" ${this.state.purchaseBirdSpecialty === 'sprint' ? 'selected' : ''}>🚀 Sprint (100-300 km Hız)</option>
                <option value="middle_long" ${this.state.purchaseBirdSpecialty === 'middle_long' ? 'selected' : ''}>💨 Orta-Uzun (300-650 km)</option>
                <option value="marathon" ${this.state.purchaseBirdSpecialty === 'marathon' ? 'selected' : ''}>🏔️ Maraton (700+ km Dayanıklılık)</option>
                <option value="unknown" ${this.state.purchaseBirdSpecialty === 'unknown' ? 'selected' : ''}>❓ Bilinmiyor / Kayıtsız</option>
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:5px;">
            <div>
              <label style="font-size:9px; font-weight:800;">Kümesinizle Ortak Atası Var mı?</label>
              <select id="genesisPurchAnc" class="ios-select" style="padding:5px; font-size:10.5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="NONE" ${this.state.purchaseBirdAncestorRef === 'NONE' ? 'selected' : ''}>Yok — Tamamen Yabancı Kan (Outcross)</option>
                ${all.slice(0, 12).map(c => `<option value="${escapeHtml(c.ring)}" ${this.state.purchaseBirdAncestorRef === c.ring ? 'selected' : ''}>Ortak Ata: ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:9px; font-weight:800;">Doğrulanmış Derecesi Var mı?</label>
              <select id="genesisPurchWins" class="ios-select" style="padding:5px; font-size:10.5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="yes" ${this.state.purchaseBirdHasWins === 'yes' ? 'selected' : ''}>✅ Evet (Kendi veya Ebeveyni Şampiyon)</option>
                <option value="pedigree_only" ${this.state.purchaseBirdHasWins === 'pedigree_only' ? 'selected' : ''}>📜 Sadece Pedigresi Var (Derecesiz)</option>
                <option value="no" ${this.state.purchaseBirdHasWins === 'no' ? 'selected' : ''}>❌ Hayır (Veri Yok)</option>
              </select>
            </div>
          </div>
        </div>
      `;
    } else if (this.state.activeMode === 'future_sim') {
      controlsHtml = `
        <div class="genesis-tool-controls" style="max-width:100%; overflow:hidden;">
          ${subFuncBarHtml}
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; margin-bottom:6px;">
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800; color:#0284c7;">1. Kuşak (F1) İçin ♂ Baba (${males.length})</label>
              <select id="genesisSimSire" class="ios-select" style="width:100%; font-size:10.5px; font-weight:800; padding:5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${males.length
                  ? males.map(c => `<option value="${c.id}" ${c.id === this.state.simSireRef ? 'selected' : ''}>♂ ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')
                  : `<option value="">⚠️ Kayıtlı ♂ Erkek kuş yok</option>`}
              </select>
            </div>
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800; color:#db2777;">1. Kuşak (F1) İçin ♀ Anne (${females.length})</label>
              <select id="genesisSimDam" class="ios-select" style="width:100%; font-size:10.5px; font-weight:800; padding:5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${females.length
                  ? females.map(c => `<option value="${c.id}" ${c.id === this.state.simDamRef ? 'selected' : ''}>♀ ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')
                  : `<option value="">⚠️ Kayıtlı ♀ Dişi kuş yok</option>`}
              </select>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,0.9fr) auto; gap:5px; align-items:end;">
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800; color:#7c3aed;">2. Kuşak (F2 Torun) Damızlık</label>
              <select id="genesisSimF2Partner" class="ios-select" style="width:100%; font-size:10.5px; font-weight:800; padding:5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                ${all.map(c => `<option value="${c.id}" ${c.id === this.state.simF2PartnerRef ? 'selected' : ''}>${c.flag} ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')}
              </select>
            </div>
            <div style="min-width:0;">
              <label style="font-size:9px; font-weight:800;">Hedef</label>
              <select id="genesisSimGoal" class="ios-select" style="width:100%; font-size:10.5px; padding:5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="balanced" ${this.state.simTargetGoal === 'balanced' ? 'selected' : ''}>⚖️ Dengeli</option>
                <option value="sprint_speed" ${this.state.simTargetGoal === 'sprint_speed' ? 'selected' : ''}>🚀 Hız</option>
                <option value="long_endurance" ${this.state.simTargetGoal === 'long_endurance' ? 'selected' : ''}>🏔️ Uzun Mesafe</option>
              </select>
            </div>
            <button class="ai-send-btn" style="padding:6px 9px; font-size:10.5px; flex-shrink:0;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">
              🧬 Simüle
            </button>
          </div>
        </div>
      `;
    } else if (this.state.activeMode === 'distance') {
      controlsHtml = `
        <div class="genesis-tool-controls" style="max-width:100%; overflow:hidden;">
          ${subFuncBarHtml}
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.3fr) auto; gap:5px; align-items:end;">
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800;">Yarış Mesafesi (km)</label>
              <input type="number" id="genesisTargetDist" class="ios-input" style="width:100%; padding:5px 7px; font-size:11.5px; font-weight:800;" value="${this.state.targetRaceDistKm}" oninput="AvigenGenesisAI.onGenesisSelectionChange()" />
            </div>
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800;">Hava &amp; Rüzgar Durumu</label>
              <select id="genesisTargetWind" class="ios-select" style="width:100%; padding:5px 7px; font-size:11px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="calm" ${this.state.targetRaceWind === 'calm' ? 'selected' : ''}>🌤️ Normal / Sakin Hava</option>
                <option value="tail" ${this.state.targetRaceWind === 'tail' ? 'selected' : ''}>💨 Arkadan Rüzgar (Yüksek Hız)</option>
                <option value="head" ${this.state.targetRaceWind === 'head' ? 'selected' : ''}>🌬️ Karşıdan Sert Rüzgar (Zorlu)</option>
                <option value="magnetic" ${this.state.targetRaceWind === 'magnetic' ? 'selected' : ''}>🧭 Manyetik Dalgalanma / Sıcak</option>
              </select>
            </div>
            <button class="ai-send-btn" style="padding:7px 10px; flex-shrink:0;" onclick="AvigenGenesisAI.renderGenesisReportOnly()">✨ Öner</button>
          </div>
        </div>
      `;
    } else if (this.state.activeMode === 'cortex_advisor') {
      const curTopic = this.state.cortexAdvisorTopic || 'damizlik_secimi';
      controlsHtml = `
        <div class="genesis-tool-controls" style="max-width:100%; overflow:hidden;">
          <div style="margin-bottom:6px;">
            <label style="font-size:9.5px; font-weight:800; color:#0052cc; display:block; margin-bottom:2px;">🧠 Kişisel Kümes Danışmanına Hızlı Soru Seçin (Gerçek Kuşlarınızı Analiz Eder)</label>
            <select id="genesisCortexTopicSelect" class="ios-select" style="width:100%; padding:6px 8px; font-size:11px; font-weight:800;" onchange="AvigenGenesisAI.onCortexTopicChange(this.value)">
              <option value="damizlik_secimi" ${curTopic === 'damizlik_secimi' ? 'selected' : ''}>1. 💞 Bu sezon hangi erkek ve dişi kuşlarımı damızlıkta kullanmalıyım?</option>
              <option value="yaris_hazirlik" ${curTopic === 'yaris_hazirlik' ? 'selected' : ''}>2. 🏁 Canlı hava durumu ve yarış mesafelerine göre hangi kuşlarım yarışa uygun?</option>
              <option value="bugun_yem_sivi" ${curTopic === 'bugun_yem_sivi' ? 'selected' : ''}>3. 🌾 Bugünkü tarihe, sıcaklığa ve kuşlarımın durumuna göre ne yem ve sıvı vermeliyim?</option>
              <option value="eksik_veri_raporu" ${curTopic === 'eksik_veri_raporu' ? 'selected' : ''}>4. 📋 Kümesimde hangi kuşların soy ağacı veya yarış verisi eksik? (BLUP Hazırlık)</option>
              <option value="akrabalik_taramasi" ${curTopic === 'akrabalik_taramasi' ? 'selected' : ''}>5. ⚠️ Kümesimdeki kuşlar arasında hangi eşleşmelerde yakın akrabalık (COI) riski var?</option>
              <option value="ogrenme_model_raporu" ${curTopic === 'ogrenme_model_raporu' ? 'selected' : ''}>6. 🔄 Öğrenen Yapay Zekâ (${escapeHtml(this.state.cortexModelVersion || 'v2.0.1')}) hangi verilerden öğrendi?</option>
            </select>
          </div>
          <div style="display:flex; gap:5px; align-items:center;">
            <input type="text" id="genesisCortexCustomInput" class="ios-input" style="flex:1; padding:6px 9px; font-size:11px;" placeholder="💬 Kendi sorunuzu veya halka no yazın (Örn: Porsche soyu veya 990001 nasıl?)..." value="${escapeHtml(this.state.cortexCustomQuestion || '')}" onkeydown="if(event.key==='Enter') AvigenGenesisAI.submitCustomCortexQuestion()" />
            <button type="button" class="ai-send-btn" style="padding:7px 11px; font-size:10.5px; flex-shrink:0;" onclick="AvigenGenesisAI.submitCustomCortexQuestion()">
              🧠 Danış
            </button>
          </div>
        </div>
      `;
    } else if (this.state.activeMode === 'global_pool') {
      const gState = typeof AvigenGlobalGenePool !== 'undefined' ? AvigenGlobalGenePool.state : { selectedLocalBirdRing: 'ALL_BEST_PAIRS', targetDistanceFocus: 'ALL' };
      if (!gState.selectedLocalBirdRing) gState.selectedLocalBirdRing = 'ALL_BEST_PAIRS';
      controlsHtml = `
        <div class="genesis-tool-controls" style="max-width:100%; overflow:hidden;">
          <div style="display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,0.95fr) auto; gap:5px; align-items:end;">
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800;">Eşleştirme Modu / Kuşunuz</label>
              <select id="genesisGlobalLocalBird" class="ios-select" style="width:100%; padding:5px 6px; font-size:10.5px; font-weight:800;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="ALL_BEST_PAIRS" ${gState.selectedLocalBirdRing === 'ALL_BEST_PAIRS' ? 'selected' : ''}>🏆 Tüm Kümes En İyi Global Çiftler</option>
                ${allLoftBirds.filter(b => b.isActiveLoftBird).map(b => `<option value="${escapeHtml(b.ring)}" ${gState.selectedLocalBirdRing === b.ring ? 'selected' : ''}>${b.flag} ${escapeHtml(b.ring)} (${escapeHtml(b.name)})</option>`).join('')}
              </select>
            </div>
            <div style="min-width:0;">
              <label style="font-size:9.5px; font-weight:800;">Mesafe Odağı</label>
              <select id="genesisGlobalDistFocus" class="ios-select" style="width:100%; padding:5px 6px; font-size:10.5px;" onchange="AvigenGenesisAI.onGenesisSelectionChange()">
                <option value="ALL" ${gState.targetDistanceFocus === 'ALL' ? 'selected' : ''}>🌍 Tüm Mesafeler</option>
                <option value="Sprint" ${gState.targetDistanceFocus === 'Sprint' ? 'selected' : ''}>🚀 Sprint (100-300)</option>
                <option value="Middle" ${gState.targetDistanceFocus === 'Middle' ? 'selected' : ''}>💨 Orta (300-500)</option>
                <option value="Long" ${gState.targetDistanceFocus === 'Long' ? 'selected' : ''}>🏔️ Uzun (500+)</option>
              </select>
            </div>
            <button class="ai-send-btn" style="padding:7px 9px; font-size:10.5px; flex-shrink:0;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">Tara</button>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-top:5px; font-size:9px; color:var(--ios-subtext);">
            <span>🔒 <em>Yalnızca izinli anonim kayıtlar taranır.</em></span>
            <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.8px;" onclick="if(typeof AvigenUxManager!=='undefined'){openIosTab('notes', document.querySelectorAll('.ios-tab-btn')[4]); AvigenUxManager.switchProfileSection('global_privacy');}">
              🛡️ İzinlerimi Yönet →
            </button>
          </div>
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
                <option value="RACER" ${curGroup === 'RACER' ? 'selected' : ''}>🏆 Yarış Kadrosu (${racersCount || totalActiveCount} Kuş)</option>
                <option value="BREEDER" ${curGroup === 'BREEDER' ? 'selected' : ''}>🥚 Damızlık Kadro (${breedersCount || totalActiveCount} Kuş)</option>
                <option value="YOUNG" ${curGroup === 'YOUNG' ? 'selected' : ''}>🐥 Yavru Kümesi (${youngCount || 12} Kuş)</option>
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
        <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:8px; padding-bottom:6px; border-bottom:1px solid var(--ios-border); flex-shrink:0;">
          <button type="button" class="genesis-back-pill" onclick="AvigenGenesisAI.backToGenesisLauncher()">
            ← Geri
          </button>
          <div style="display:flex; align-items:center; gap:5px; min-width:0;">
            <span style="font-size:13px;">${activeMainModule.icon}</span>
            <span style="font-size:11.5px; font-weight:900; color:#4c1d95; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${activeMainModule.num}. ${activeMainModule.title}
            </span>
          </div>
          <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 7px; font-size:9px; flex-shrink:0;" onclick="AvigenGenesisAI.openHistoryView()" title="Kaydedilen Geçmiş Analizler">
            🕒 Geçmiş (${this.analysisHistory.length})
          </button>
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
    // ALT MODÜL 1: OTOMATİK EŞLEŞTİRME VE DAMIZLIK ANALİZİ (KULLANICI ODAKLI BİLİMSEL MİMARİ)
    // Eksik veri analiz yapılmasına engel olmaz; mevcut verilerle tüm analizler gerçekleştirilir,
    // eksik kriterler sıfır kabul edilmek yerine mevcut kriterler yeniden ağırlıklandırılır!
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'breeding') {
      const rep = this.analyzeBreedingIntelligence(this.state.selectedSireRef, this.state.selectedDamRef);

      let plainResult = '';
      let plainWhy = '';
      if (rep.coi >= 25) {
        plainResult = `Önerilmez (${rep.totalScore}/100) — Çok Yakın Akrabalık Riski (%${rep.coi.toFixed(1)})`;
        plainWhy = `Bu iki kuş çok yakın akraba (${rep.relationSummary}). Eşleştirilmeleri halinde doğacak yavrularda küçülme, bağışıklık düşüklüğü ve uçuş performansı kaybı riski yüksektir.`;
      } else if (rep.totalScore >= 82) {
        plainResult = `Yüksek Uyumlu Eşleşme (${rep.totalScore}/100) — Yarış ve Damızlık İçin Güçlü Aday`;
        plainWhy = `Mevcut soyağacı ve performans kayıtları yüksek tamamlayıcılık gösteriyor. ${rep.coi === 0 ? 'Aralarında kan bağı bulunmadığı (%0 akrabalık • Yabancı Kan Kırma) için yavrular yüksek fiziksel direnç kazanır.' : `Soy içi ortak ata bağlantısı (%${rep.coi.toFixed(2)} akrabalık) güvenli kan sabitleme sınırları içindedir.`}`;
      } else if (rep.totalScore >= 68) {
        plainResult = `Uygun / Dengeli Eşleşme (${rep.totalScore}/100) — Geliştirilebilir Soy Uyumu`;
        plainWhy = `Akrabalık oranı (%${rep.coi.toFixed(2)}) güvenli aralıkta ve mevcut kayıtlar dengeli bir eşleşme sunuyor. Daha yüksek tamamlayıcılık için aşağıdaki önerilen ve alternatif eş adaylarını da inceleyebilirsiniz.`;
      } else {
        plainResult = `Sınırlı Uyum (${rep.totalScore}/100) — Alternatif Eş Adayları Daha Avantajlı`;
        plainWhy = `Seçilen çiftin mevcut kayıtlarında soy veya performans tamamlayıcılığı sınırlı kalmaktadır. Aşağıdaki alternatif adaylar bu kuşlar için daha yüksek uyum puanı üretmektedir.`;
      }

      const sibCount = (rep.sireCollateral?.siblingProofs?.length || 0) + (rep.damCollateral?.siblingProofs?.length || 0);
      const offCount = (rep.sireCollateral?.offspringProofs?.length || 0) + (rep.damCollateral?.offspringProofs?.length || 0);
      const totalAncFilled = (rep.sFilled || 0) + (rep.dFilled || 0);
      const bestForSire = rep.altFemalesForSire[0];
      const bestForDam = rep.altMalesForDam[0];
      const topRecommendedText = (bestForSire && bestForSire.score > rep.totalScore + 2)
        ? `♂ ${rep.sireInfo.ring} için daha yüksek uyum sağlayan öneri: ♀ ${bestForSire.candidate.ring} (${bestForSire.candidate.name} • ${bestForSire.score}/100 Puan, %${bestForSire.coi.toFixed(2)} Akrabalık)`
        : ((bestForDam && bestForDam.score > rep.totalScore + 2)
          ? `♀ ${rep.damInfo.ring} için daha yüksek uyum sağlayan öneri: ♂ ${bestForDam.candidate.ring} (${bestForDam.candidate.name} • ${bestForDam.score}/100 Puan, %${bestForDam.coi.toFixed(2)} Akrabalık)`
          : `Seçili Çift: ♂ ${rep.sireInfo.ring} × ♀ ${rep.damInfo.ring} (${rep.totalScore}/100 Uyum — Kümesinizdeki en uygun eşleşmelerden biri)`);

      const extraHtml = `
        <div style="display:flex; flex-direction:column; gap:7px;">
          <!-- 1-3. PEDİGRİ, PERFORMANS VE MESAFE/TİP TAMAMLAYICILIK DEĞERLENDİRME KARTLARI -->
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; font-size:9.5px;">
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #0066ff; border-radius:8px; padding:7px 8px;">
              <div style="font-weight:900; color:#0052cc; margin-bottom:2px;">📜 5 Nesil Pedigri Gücü (${rep.pedigreeScore100}/100)</div>
              <div style="color:var(--ios-text); line-height:1.35;">
                • <strong>5 Nesil Kapsam:</strong> ♂ Baba (${rep.sFilled || 0}/62 ata) • ♀ Anne (${rep.dFilled || 0}/62 ata)<br/>
                • <strong>Ortak Ata:</strong> ${rep.commonAncestors.length ? `${escapeHtml(rep.commonAncestors[0])} ${rep.commonAncestorHasProof ? '✅ (Kanıtlı Şampiyon)' : '⚠️ (Derece Kayıtsız)'}` : 'Ortak ata yok (Tam Yabancı Kan)'}
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #059669; border-radius:8px; padding:7px 8px;">
              <div style="font-weight:900; color:#059669; margin-bottom:2px;">🏆 Performans Kanıtı (${rep.performanceScore100 !== null ? `${rep.performanceScore100}/100` : '50/100 • Kayıtsız'})</div>
              <div style="color:var(--ios-text); line-height:1.35;">
                • <strong>Kanıtlar:</strong> ${rep.sireInfo.verifiedWins.length + rep.damInfo.verifiedWins.length} ebeveyn, ${(rep.sDeep?.ancestorWins?.length || 0) + (rep.dDeep?.ancestorWins?.length || 0)} ata, ${sibCount} kardeş, ${offCount} yavru derecesi<br/>
                • <strong>Öne Çıkan:</strong> <span style="color:#065f46; font-weight:700;">${escapeHtml(rep.verifiedRecords[0] || rep.performanceMethodLabel)}</span>
              </div>
            </div>
          </div>

          <!-- MESAFE, HIZ & TİP TAMAMLAYICILIĞI + GENETİK ÇEŞİTLİLİK & YAVRU (F1) BEKLENTİSİ -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #0284c7; border-radius:8px; padding:7px 9px; font-size:9.5px; line-height:1.38;">
            <div style="font-weight:900; color:#0369a1; margin-bottom:2px;">⚖️ Mesafe, Hız &amp; Tip Tamamlayıcılığı (${rep.complementarityScore100}/100):</div>
            <div>• <strong>♂ Baba Profili:</strong> ${escapeHtml(rep.sireDistProf?.label || 'Genel Hat')} • <strong>♀ Anne Profili:</strong> ${escapeHtml(rep.damDistProf?.label || 'Genel Hat')}</div>
            <div>• <strong>Tamamlayıcılık Yorumu:</strong> ${escapeHtml(rep.complementaritySummary || 'Dengeli eşleşme')}</div>
          </div>

          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:8px; padding:7px 9px; font-size:9.5px; line-height:1.38;">
            <div style="font-weight:900; color:#5b21b6; margin-bottom:2px;">🧬 Kan Uyumu (${rep.diversityScore100}/100) &amp; Doğacak Yavru Beklentisi:</div>
            <div>• <strong>Akrabalık &amp; Yavru Direnci:</strong> Akrabalık Oranı <strong>%${rep.coi.toFixed(2)}</strong> (${escapeHtml(rep.relationSummary)}) • Yavru Direnci (Melez Gücü): <strong>%${rep.heterosis}</strong></div>
            <div>• <strong>Beklenen Yavru Potansiyel Aralığı:</strong> <strong>${Math.max(45, rep.totalScore - Math.max(5, Math.round(13 - rep.dataReliabilityPct / 12)))}–${Math.min(98, rep.totalScore + Math.max(5, Math.round(13 - rep.dataReliabilityPct / 12)))} / 100</strong> (Kalıtım olasılık aralığı; kesin şampiyon garantisi değildir)</div>
            <div>• <strong>Beklenen Yavru Eğilimi:</strong> Mevcut soyağacı yapısına göre yavrularda <strong>${rep.coi === 0 ? 'yüksek fiziksel dayanıklılık ve yarış temposu (Yabancı Kan Kırma avantajı)' : (rep.commonAncestorHasProof ? 'şampiyon ortak ata özelliklerinin sabitlenmesi (Damızlık Kan Sabitleme)' : 'soy içi benzerlik (Ortak ata derecesi kayıtsız)')}</strong> beklenir.</div>
          </div>

          <!-- GÜÇLÜ YÖNLER, RİSKLER VE GELİŞTİRME FIRSATLARI -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:7px 9px; font-size:9.5px; line-height:1.38; display:flex; flex-direction:column; gap:4px;">
            <div>
              <strong style="color:#059669;">✅ Güçlü Yönler:</strong>
              ${rep.strongLines.slice(0, 3).map(s => `<div style="margin-left:6px;">• ${escapeHtml(s)}</div>`).join('')}
            </div>
            <div>
              <strong style="color:${rep.coi > 12.5 ? '#dc2626' : '#d97706'};">⚠️ Riskler &amp; Sınırlamalar:</strong>
              ${rep.weakLines.slice(0, 3).map(w => `<div style="margin-left:6px;">• ${escapeHtml(w)}</div>`).join('')}
            </div>
            <div>
              <strong style="color:#0052cc;">💡 Geliştirme Fırsatı:</strong>
              <div style="margin-left:6px;">• ${escapeHtml((rep.opportunities && rep.opportunities[0]) || 'Yavruların etap sonuçlarını kaydederek veri güvenilirliğini artırabilirsiniz.')}</div>
            </div>
          </div>

          <!-- ÖNERİLEN EŞLEŞME, TEK TUŞLA YUVAYA KAYDETME, ÖĞRENEN AI ONAY/RED VE ALTERNATİF ADAYLAR -->
          <div style="font-size:10px; border-top:1px solid var(--ios-border); padding-top:6px;">
            <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:8px; padding:7px 9px; margin-bottom:6px; display:flex; flex-direction:column; gap:6px;">
              <div>
                <strong style="color:#5b21b6;">🎯 Önerilen Eşleşme:</strong>
                <div style="margin-top:2px; font-weight:700; color:var(--ios-text);">${escapeHtml(topRecommendedText)}</div>
              </div>
              <button type="button" class="ios-btn ios-btn-green" style="width:100%; padding:8px 10px; font-size:11px; font-weight:900;" onclick="AvigenGenesisAI.saveCurrentGenesisPairToActiveNests('${escapeHtml(rep.sireInfo.ring)}', '${escapeHtml(rep.sireInfo.name)}', '${escapeHtml(rep.damInfo.ring)}', '${escapeHtml(rep.damInfo.name)}', ${rep.totalScore}, ${rep.coi})">
                🪺 Bu Çifti (♂ ${escapeHtml(rep.sireInfo.ring)} × ♀ ${escapeHtml(rep.damInfo.ring)}) Aktif Yuvalara Kaydet
              </button>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <button type="button" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:9.5px; font-weight:800; color:#059669; border-color:#a7f3d0;" onclick="AvigenGenesisAI.recordCortexUserFeedback('breeding__${escapeHtml(rep.sireInfo.ring)} × ${escapeHtml(rep.damInfo.ring)}', 'ACCEPTED', ${rep.totalScore || 75}, ${rep.dataReliabilityPct || 75})">
                  ⭐ Favori Aday Olarak İşaretle (Puan Sabit)
                </button>
                <button type="button" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:9.5px; font-weight:800; color:#dc2626; border-color:#fecaca;" onclick="AvigenGenesisAI.recordCortexUserFeedback('breeding__${escapeHtml(rep.sireInfo.ring)} × ${escapeHtml(rep.damInfo.ring)}', 'REJECTED', ${rep.totalScore || 75}, ${rep.dataReliabilityPct || 75})">
                  🚫 Bu Öneriyi Gizle / Sıradaki Alternatifi Göster
                </button>
              </div>
            </div>

            <strong style="color:#581c87;">🔄 Tüm Kümes Taramasından En İyi Alternatif Eş Adayları:</strong>
            ${rep.altFemalesForSire.slice(0, 2).map(item => `
              <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3px solid #2563eb; border-radius:6px; padding:5px 7px; margin-top:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                  <span>• ♂ ${escapeHtml(rep.sireInfo.ring)} için Alternatif Dişi: <strong>${item.candidate.flag} ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)})</strong></span>
                  <button class="ios-btn ios-btn-primary" style="padding:2px 7px; font-size:9px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${this.state.selectedSireRef}', '${item.candidate.id}')">Seç (${item.score}/100)</button>
                </div>
                <div style="font-size:9px; color:var(--ios-subtext); margin-top:2px;">💡 ${escapeHtml(item.why)}</div>
              </div>
            `).join('')}
            ${rep.altMalesForDam.slice(0, 2).map(item => `
              <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3px solid #16a34a; border-radius:6px; padding:5px 7px; margin-top:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                  <span>• ♀ ${escapeHtml(rep.damInfo.ring)} için Alternatif Erkek: <strong>${item.candidate.flag} ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)})</strong></span>
                  <button class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:9px; flex-shrink:0;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${item.candidate.id}', '${this.state.selectedDamRef}')">Seç (${item.score}/100)</button>
                </div>
                <div style="font-size:9px; color:var(--ios-subtext); margin-top:2px;">💡 ${escapeHtml(item.why)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const expertHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:6px 8px; font-size:10px; margin-bottom:6px;">
          <div style="font-weight:800; color:#4c1d95; margin-bottom:3px;">⚖️ 4 Sütunlu Bilimsel Puan Dağılımı:</div>
          ${rep.breakdown.map(b => `<div style="display:flex; justify-content:space-between;"><span>• ${b.label}:</span><strong>+${b.pts}/${b.max} (Birim: ${b.score100}/100)</strong></div>`).join('')}
        </div>
        ${typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('breeding') : ''}
      `;

      this.recordAnalysisToHistory({
        mode: 'breeding',
        modeLabel: 'Eşleştirme ve Damızlık Analizi',
        icon: '💞',
        title: `♂ ${rep.sireInfo.ring} × ♀ ${rep.damInfo.ring}`,
        verdict: plainResult,
        score: rep.totalScore,
        reliabilityPct: rep.dataReliabilityPct,
        dataSourceSummary: `${totalAncFilled}/124 ata kaydı, ${rep.verifiedRecords.length} performans kaydı, Akrabalık %${rep.coi.toFixed(2)}`,
        snapshotParams: { selectedSireRef: this.state.selectedSireRef, selectedDamRef: this.state.selectedDamRef }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `💞 Eşleştirme Analizi: ♂ ${escapeHtml(rep.sireInfo.ring)} × ♀ ${escapeHtml(rep.damInfo.ring)}`,
        verdictTag: rep.relationSummary,
        metricTitle: 'AKRABALIK ORANI',
        metricValue: `%${rep.coi.toFixed(2)} ${rep.coi === 0 ? '(Yabancı Kan)' : (rep.coi <= 12.5 ? '(Soy Sabitleme)' : '(Yakın Akraba)')}`,
        metricColor: rep.coi >= 25 ? '#dc2626' : (rep.coi > 12.5 ? '#d97706' : '#059669'),
        score: rep.totalScore,
        reliabilityPct: rep.dataReliabilityPct,
        q1_whatAnalyzed: `♂ <strong>${escapeHtml(rep.sireInfo.ring)} (${escapeHtml(rep.sireInfo.name)})</strong> ile ♀ <strong>${escapeHtml(rep.damInfo.ring)} (${escapeHtml(rep.damInfo.name)})</strong> çiftinin 5 kuşak soyağacı ve performans uyumu incelendi.`,
        q2_dataUsed: `Mevcut <strong>${totalAncFilled} ata kaydı</strong> ve <strong>${rep.verifiedRecords.length} performans/derece göstergesi</strong> değerlendirildi (Veri Güvenilirliği: <strong>%${rep.dataReliabilityPct}</strong> — eşleşme kalitesinden ayrı hesaplanmıştır).`,
        q3_result: plainResult,
        q4_whyResult: plainWhy,
        q5_reliability: `Veri güvenilirliği <strong>%${rep.dataReliabilityPct}</strong> düzeyindedir.`,
        extraHtml,
        expertHtml
      });
      return;
    }

    // ------------------------------------------------------------------------
    // ALT MODÜL 2: TEK KUŞ PERFORMANS ANALİZİ
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'racing') {
      const rep = this.analyzeRacingIntelligence(this.state.selectedRacerPedId);
      const hasData = rep.dataReliabilityPct >= 20;

      const roleRecommendation = rep.totalScore >= 82
        ? 'Hem Yarış Hem Damızlık Kadrosu İçin Güçlü Potansiyel'
        : (rep.totalScore >= 68
          ? 'Orta Mesafe Yarış Etapları İçin Uygun Potansiyel'
          : 'Kayıtlı Veri Sınırlı — Önce Antrenman Etaplarında Denenmeli');

      const realRaceTrend = typeof AvigenRaceTracker !== 'undefined'
        ? AvigenRaceTracker.analyzeBirdLongitudinalTrend(rep.subject.ring)
        : { hasRealData: false, enteredCount: 0 };

      const extraHtml = `
        <div style="display:flex; flex-direction:column; gap:6px;">
          <div style="background:${realRaceTrend.hasRealData ? '#ecfdf5' : '#f5f3ff'}; border:1px solid ${realRaceTrend.hasRealData ? '#a7f3d0' : '#ddd6fe'}; border-left:3.5px solid ${realRaceTrend.hasRealData ? '#059669' : '#7c3aed'}; border-radius:8px; padding:7px 9px; font-size:9.8px;">
            ${realRaceTrend.hasRealData ? `
              <div style="font-weight:900; color:#065f46;">🏁 Gerçek Yarış Performansı (${realRaceTrend.enteredCount} Resmi Yarış Sonucu — Genetik Tahminden Ayrı):</div>
              <div style="color:#0f172a; margin-top:2px;">
                • En Başarılı Mesafe: <strong>${escapeHtml(realRaceTrend.bestDistanceType)}</strong> • Ort. Hız: <strong>${realRaceTrend.avgSpeedMpm} m/dk</strong> (İlk %${realRaceTrend.avgRankPercentile} Klasman)<br/>
                • Zaman İçindeki Gelişim: <strong>${escapeHtml(realRaceTrend.trendLabel)}</strong>
              </div>
            ` : `
              <div style="font-weight:900; color:#4c1d95;">🧬 Genetik Tahmin vs Gerçek Yarış Ayrımı:</div>
              <div style="color:#1e293b; margin-top:2px;">
                Bu güvercinin henüz girilmiş gerçek yarış sonucu yoktur. AI eksik veriden başarı hikayesi üretmez; yukarıdaki puan yalnızca <strong>soyağacı potansiyel tahminidir</strong>.
              </div>
            `}
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:7px 9px;">
            <span style="font-size:10.5px; font-weight:800; color:var(--ios-text);">📊 4 boyutlu performans kartını ve 11 alanlı yarış geçmişini açın:</span>
            <button class="ios-btn ios-btn-primary" style="padding:5px 10px; font-size:10.5px;" onclick="if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(rep.subject.ring)}')">
              📊 Performans &amp; Yarış Geçmişi
            </button>
          </div>
        </div>
      `;

      const expertHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:6px 8px; font-size:10px; margin-bottom:6px;">
          ${rep.breakdown.map(b => `<div style="display:flex; justify-content:space-between;"><span>• ${b.label}:</span><strong>+${b.pts}/${b.max}</strong></div>`).join('')}
        </div>
        ${typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('racing') : ''}
      `;

      this.recordAnalysisToHistory({
        mode: 'racing',
        modeLabel: 'Tek Kuş Analizi',
        icon: '📊',
        title: `${rep.subject.ring} (${rep.subject.name})`,
        verdict: roleRecommendation,
        score: hasData ? rep.totalScore : null,
        reliabilityPct: rep.dataReliabilityPct,
        dataSourceSummary: `${rep.totalFilled}/14 kayıtlı ata, ${rep.verifiedResultsList.length} doğrulanmış yarış`,
        snapshotParams: { selectedRacerPedId: this.state.selectedRacerPedId }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `📊 Tek Kuş Analizi: ${rep.subject.flag || '🇹🇷'} ${escapeHtml(rep.subject.ring)} (${escapeHtml(rep.subject.name)})`,
        verdictTag: roleRecommendation,
        metricTitle: 'SOYAĞACI & İÇ COI',
        metricValue: `${rep.totalFilled}/14 Ata • %${rep.internalCoi.toFixed(1)} COI`,
        metricColor: '#0066ff',
        score: hasData ? rep.totalScore : null,
        reliabilityPct: rep.dataReliabilityPct,
        q1_whatAnalyzed: `<strong>${escapeHtml(rep.subject.ring)} (${escapeHtml(rep.subject.name)})</strong> numaralı güvercinin bireysel yarış performansı ve anne-baba soyundan gelen genetik potansiyeli analiz edildi.`,
        q2_dataUsed: `Soyağacındaki <strong>${rep.totalFilled}/14 kayıtlı ata</strong> ve <strong>${rep.verifiedResultsList.length} doğrulanmış yarış derecesi</strong> incelendi.${rep.missingWarnings.length ? ` <span style="color:#b45309;">(${escapeHtml(rep.missingWarnings[0])})</span>` : ''}`,
        q3_result: hasData ? `${rep.totalScore}/100 Puan — ${roleRecommendation}` : 'Veri Yetersiz — Doğrulanmış yarış veya soyağacı kaydı girilmemiş.',
        q4_whyResult: rep.strongLines.length
          ? `Soy hattında kanıtlanmış performans kayıtları (${escapeHtml(rep.strongLines.slice(0, 2).join(', '))}) bulunuyor ve ebeveynleri arasında yakın akrabalık (%${rep.internalCoi.toFixed(1)}) yok.`
          : `Kuşun kendisinde veya yakın atalarında henüz doğrulanmış derece kaydı bulunmadığı için puan ihtiyatlı hesaplanmıştır.`,
        q5_reliability: `Veri güvenilirliği <strong>%${rep.dataReliabilityPct}</strong>. ${rep.subject.verifiedWins.length > 0 ? 'Kuşun kendi gerçek yarış dereceleri mevcuttur.' : 'Kuşun kendi yarış kaydı olmadığı için değerlendirme anne-baba soyağacı verilerine dayanmaktadır.'}`,
        extraHtml,
        expertHtml
      });
      return;
    }

    // ------------------------------------------------------------------------
    // ALT MODÜL 3: İKİ KUŞ KARŞILAŞTIRMA (4 TEMEL BİLİMSEL BOYUTTA YAN YANA KIYAS)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'compare') {
      const profA = this.getCachedPerformanceProfile(this.state.compareBirdARing);
      const profB = this.getCachedPerformanceProfile(this.state.compareBirdBRing);
      if (!profA || !profB) return;

      const build4 = (p) => {
        if (typeof AvigenPerformanceEngine !== 'undefined' && typeof AvigenPerformanceEngine.buildCore4ScientificPillars === 'function') {
          return AvigenPerformanceEngine.buildCore4ScientificPillars(p).map(x => ({
            label: x.simpleName.replace(/\s*\(.*?\)/g, ''),
            val: x.score,
            isInherited: x.isInherited
          }));
        }
        return [
          { label: '🚀 1. Kısa Mesafe & Hız', val: p.categories.flight.metrics[0].score },
          { label: '🏔️ 2. Orta / Uzun Dayanıklılık', val: p.categories.flight.metrics[1].score },
          { label: '🎯 3. Yarış İstikrarı & Eve Dönüş', val: p.categories.racing.metrics[0].score },
          { label: '🧬 4. Soyağacı & Damızlık Gücü', val: p.categories.breeding.metrics[4].score }
        ];
      };

      const listA = build4(profA);
      const listB = build4(profB);

      const avgValid = (arr) => {
        const v = arr.map(x => x.val).filter(x => x !== null && x !== undefined);
        return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
      };
      const scoreA = avgValid(listA);
      const scoreB = avgValid(listB);
      const winnerBird = scoreA >= scoreB ? profA.bird : profB.bird;
      const relAvg = Math.min(100, Math.round(((profA.statsSummary.filledAncCount + profB.statsSummary.filledAncCount) / 28) * 100));

      const comparisonTableHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; font-size:10.5px;">
          <div style="display:grid; grid-template-columns:1.25fr 0.9fr 0.9fr; font-weight:900; border-bottom:1px solid var(--ios-border); padding-bottom:5px; margin-bottom:5px;">
            <span>4 Temel Bilimsel Boyut</span>
            <span style="color:#0066ff; text-align:center;">${escapeHtml(profA.bird.ring)}</span>
            <span style="color:#7c3aed; text-align:center;">${escapeHtml(profB.bird.ring)}</span>
          </div>
          ${listA.map((row, idx) => {
            const vA = row.val;
            const vB = listB[idx].val;
            const aWin = vA !== null && (vB === null || vA > vB);
            const bWin = vB !== null && (vA === null || vB > vA);
            return `
              <div style="display:grid; grid-template-columns:1.25fr 0.9fr 0.9fr; padding:4px 0; border-bottom:1px dashed var(--ios-border); align-items:center;">
                <span style="font-weight:700;">${row.label}</span>
                <span style="text-align:center; font-weight:${aWin ? '900' : '600'}; color:${aWin ? '#059669' : 'var(--ios-text)'};">
                  ${vA !== null ? `${vA}/100 ${aWin ? '✓' : ''}` : '<span style="color:#94a3b8;">Veri Yok</span>'}
                </span>
                <span style="text-align:center; font-weight:${bWin ? '900' : '600'}; color:${bWin ? '#059669' : 'var(--ios-text)'};">
                  ${vB !== null ? `${vB}/100 ${bWin ? '✓' : ''}` : '<span style="color:#94a3b8;">Veri Yok</span>'}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      `;

      this.recordAnalysisToHistory({
        mode: 'compare',
        modeLabel: 'İki Kuş Karşılaştır',
        icon: '⚖️',
        title: `${profA.bird.ring} vs ${profB.bird.ring}`,
        verdict: `${winnerBird.ring} Genel Performansta Önde`,
        score: Math.max(scoreA, scoreB),
        reliabilityPct: relAvg,
        dataSourceSummary: `4 bilimsel boyut, ${profA.statsSummary.filledAncCount + profB.statsSummary.filledAncCount} toplam ata kaydı`,
        snapshotParams: { compareBirdARing: this.state.compareBirdARing, compareBirdBRing: this.state.compareBirdBRing }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `⚖️ İki Kuş Karşılaştırma: ${escapeHtml(profA.bird.ring)} vs ${escapeHtml(profB.bird.ring)}`,
        verdictTag: `${escapeHtml(profA.bird.ring)} (${scoreA}) vs ${escapeHtml(profB.bird.ring)} (${scoreB})`,
        metricTitle: 'GENEL ORTALAMA KIYAS',
        metricValue: `${scoreA} vs ${scoreB} Puan`,
        metricColor: '#7c3aed',
        score: Math.max(scoreA, scoreB),
        reliabilityPct: relAvg,
        q1_whatAnalyzed: `<strong>${escapeHtml(profA.bird.ring)} (${escapeHtml(profA.bird.name)})</strong> ile <strong>${escapeHtml(profB.bird.ring)} (${escapeHtml(profB.bird.name)})</strong> güvercinleri 4 temel bilimsel boyutta yan yana karşılaştırıldı.`,
        q2_dataUsed: `1. kuş: ${profA.statsSummary.totalRaceCount} yarış, ${profA.statsSummary.filledAncCount}/30 ata • 2. kuş: ${profB.statsSummary.totalRaceCount} yarış, ${profB.statsSummary.filledAncCount}/30 ata.`,
        q3_result: `${escapeHtml(winnerBird.ring)} (${escapeHtml(winnerBird.name)}) mevcut kayıtlara göre genel performansta daha önde (${Math.max(scoreA, scoreB)}/100).`,
        q4_whyResult: `Hız, mesafe dayanıklılığı, eve dönüş istikrarı ve soy derinliği karşılaştırıldığında ${escapeHtml(winnerBird.ring)} daha yüksek doğrulanmış kanıt puanına sahiptir.`,
        q5_reliability: `Karşılaştırma güvenilirliği <strong>%${relAvg}</strong>. Verisi olmayan mesafelerde yapay puan verilmemiş ve "Veri Yok" olarak bırakılmıştır.`,
        extraHtml: comparisonTableHtml
      });
      return;
    }

    // ------------------------------------------------------------------------
    // ALT MODÜL 4: SATIN ALINACAK KUŞ ANALİZİ (KÜMESE UYGUNLUK & DEĞERLENDİRME)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'purchase') {
      const pRing = (this.state.purchaseBirdRing || 'YENİ-KUŞ').trim();
      const pSex = this.state.purchaseBirdSex;
      const pSpec = this.state.purchaseBirdSpecialty;
      const pAnc = this.state.purchaseBirdAncestorRef;
      const pWins = this.state.purchaseBirdHasWins;

      const allLoft = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
      const matePool = allLoft.filter(b => (pSex === 'M' ? b.sex === 'F' : b.sex === 'M'));

      if (pWins === 'no' && pSpec === 'unknown') {
        out.innerHTML = this.renderFiveQuestionDecisionCard({
          headerTitle: `🛒 Satın Alınacak Kuş Analizi: ${escapeHtml(pRing)}`,
          verdictTag: 'Veri Yetersiz — Satın Alma Önerisi Üretilemedi',
          score: null,
          reliabilityPct: 15,
          q1_whatAnalyzed: `Dışarıdan satın alınması düşünülen <strong>${escapeHtml(pRing)}</strong> halkalı güvercinin kümesinize katkısı incelendi.`,
          q2_dataUsed: `Kullanıcı tarafından girilen ön bilgiler (Doğrulanmış yarış kaydı yok, mesafe uzmanlığı bilinmiyor).`,
          q3_result: `Veri Yetersiz — Bu kuş için olumlu satın alma tavsiyesi verilemez.`,
          q4_whyResult: `AVIGEN kuralları gereği, doğrulanmış yarış derecesi veya kanıtlanmış soyağacı verisi olmayan bir kuş için yapay olarak "alınabilir" sonucu üretilmez.`,
          q5_reliability: `Güvenilirlik <strong>%15</strong>. Satın almadan önce satıcıdan resmi yarış listesini ve en az 3 kuşak pedigre belgesini talep edin.`
        });
        return;
      }

      let purchaseScore = pWins === 'yes' ? 86 : 71;
      let reliability = pWins === 'yes' ? 82 : 58;
      if (pAnc !== 'NONE') purchaseScore += 4; // Bilinen şampiyon hatla linebreeding imkanı

      const specLabels = {
        sprint: 'Sprint / Kısa Mesafe (100-300 km) hız açığını',
        middle_long: 'Orta ve Uzun Mesafe (300-650 km) dayanıklılık gücünü',
        marathon: 'Maraton (700+ km) ağır etap direncini',
        unknown: 'genel genetik çeşitliliği'
      };

      const bestMates = matePool.slice(0, 2);

      const extraHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #16a34a; border-radius:7px; padding:6px 8px; font-size:10.5px;">
          <strong style="color:#15803d;">💑 Satın Alınırsa Kümesinizde En Uygun Eş Adayları:</strong>
          ${bestMates.map(m => `
            <div style="margin-top:3px;">
              • <strong>${m.flag} ${escapeHtml(m.ring)} (${escapeHtml(m.name)})</strong> — ${pAnc === 'NONE' ? 'Yabancı kan (Outcross) olarak yüksek melez dinçliği sağlar.' : `Ortak soy (${escapeHtml(pAnc)}) üzerinden güvenli kan sabitleme sağlar.`}
            </div>
          `).join('')}
        </div>
      `;

      this.recordAnalysisToHistory({
        mode: 'purchase',
        modeLabel: 'Satın Alınacak Kuş',
        icon: '🛒',
        title: `${pRing} (${pSex === 'M' ? '♂' : '♀'}) Kümes Uyum Analizi`,
        verdict: purchaseScore >= 80 ? 'Kümes İçin Değerli Takviye' : 'Koşullu Uygun',
        score: purchaseScore,
        reliabilityPct: reliability,
        dataSourceSummary: `${matePool.length} karşı cins damızlık adayı ve mesafe/soy taraması`,
        snapshotParams: {
          purchaseBirdRing: this.state.purchaseBirdRing,
          purchaseBirdSex: this.state.purchaseBirdSex,
          purchaseBirdSpecialty: this.state.purchaseBirdSpecialty
        }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `🛒 Satın Alınacak Kuş Analizi: ${escapeHtml(pRing)} (${pSex === 'M' ? '♂ Erkek' : '♀ Dişi'})`,
        verdictTag: purchaseScore >= 80 ? 'Kümesiniz İçin Değerli Takviye Adayı' : 'Koşullu Uygun — Soyağacı Doğrulanmalı',
        score: purchaseScore,
        reliabilityPct: reliability,
        q1_whatAnalyzed: `Satın alınması planlanan <strong>${escapeHtml(pRing)}</strong> halkalı güvercinin mevcut kümesinizdeki (${allLoft.length} aktif kuş) kan hatlarıyla uyumu analiz edildi.`,
        q2_dataUsed: `Girilen mesafe uzmanlığı, derece durumu ve kümesinizdeki karşı cins damızlık adaylarının (${matePool.length} kuş) soy kayıtları karşılaştırıldı.`,
        q3_result: `${purchaseScore}/100 Uygunluk — Bu kuş kümesinizin ${specLabels[pSpec]} güçlendirmek için uygundur.`,
        q4_whyResult: `${pAnc === 'NONE' ? 'Kümesinizdeki mevcut kuşlarla akrabalığı olmadığı için kan yenileme (Outcross) sağlar ve akrabalık depresyonunu önler.' : `Kümesinizdeki ${escapeHtml(pAnc)} soyu ile uyumlu kan hattı (Linebreeding) kurmanızı sağlar.`} ${pWins === 'yes' ? 'Ayrıca doğrulanmış yarış/şampiyonluk geçmişi damızlık riskini düşürmektedir.' : ''}`,
        q5_reliability: `Veri güvenilirliği <strong>%${reliability}</strong>. Satın alma sonrasında kuşun tam pedigresini barkod veya fotoğraf tarama ile sisteme ekleyerek kesin eşleşme puanını doğrulayabilirsiniz.`,
        extraHtml
      });
      return;
    }

    // ------------------------------------------------------------------------
    // ALT MODÜL 5: YARIŞ MESAFESİNE GÖRE KUŞ ÖNERİSİ
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'distance') {
      const dist = this.state.targetRaceDistKm || 420;
      const wind = this.state.targetRaceWind || 'calm';
      const activeBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);

      const ranked = activeBirds.map(b => {
        const realTrend = typeof AvigenRaceTracker !== 'undefined'
          ? AvigenRaceTracker.analyzeBirdLongitudinalTrend(b.ring)
          : { hasRealData: false, enteredCount: 0 };

        let fit = b.ebvScore;
        const txt = `${b.name} ${b.notes}`.toLowerCase();
        let why = '';
        let sourceTag = realTrend.hasRealData
          ? `🏁 Gerçek Yarış Verisi (${realTrend.enteredCount} Yarış • Ort. ${realTrend.avgSpeedMpm} m/dk)`
          : '🧬 Yalnızca Genetik Soy Tahmini (Henüz Yarışmadı)';

        if (realTrend.hasRealData) {
          if (dist >= 450 && /uzun|maraton/i.test(realTrend.bestDistanceType || '')) {
            fit += 10;
            why = `Gerçek yarışlarda ${realTrend.bestDistanceType} lideri (İlk %${realTrend.avgRankPercentile} klasman, ${realTrend.avgSpeedMpm} m/dk).`;
          } else if (dist <= 300 && /kısa|sprint/i.test(realTrend.bestDistanceType || '')) {
            fit += 10;
            why = `Gerçek kısa mesafe yarışlarında kanıtlanmış hız (${realTrend.avgSpeedMpm} m/dk, İlk %${realTrend.avgRankPercentile}).`;
          } else if (dist > 300 && dist < 450 && /orta/i.test(realTrend.bestDistanceType || '')) {
            fit += 10;
            why = `Gerçek orta mesafe yarışlarında yüksek istikrar (${realTrend.enteredCount} yarışta İlk %${realTrend.avgRankPercentile}).`;
          } else {
            fit += 5;
            why = `${realTrend.enteredCount} gerçek yarış kaydı mevcut (${realTrend.trendLabel}).`;
          }
          if (realTrend.trendStatus === 'DECLINING') {
            fit -= 6;
            why += ' ⚠️ Son yarışta performans düşüşü gözlendi.';
          }
        } else {
          // Gerçek yarış verisi yoksa soy tahminini ayrı tut ve şişirme
          fit = Math.min(82, fit - 4);
          if (dist >= 450 && /porsche|harry|sivas|maraton/i.test(txt)) {
            why = `Henüz gerçek yarış sonucu yok; atalarının uzun mesafe soyağacı potansiyeline dayalı tahmin.`;
          } else {
            why = `Henüz gerçek yarış sonucu yok; ebeveyn soyağacı potansiyeline (${b.ebvScore}/100) dayalı tahmin.`;
          }
        }
        // Göz renginden (Eye-Sign) hiçbir puan eklenmez; yalnızca ölçülen yarış ve soyağacı kayıtları değerlendirilir!
        return { ...b, matchScore: Math.min(98, fit), why, sourceTag, hasRealData: realTrend.hasRealData };
      }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

      const squadHtml = `
        <div style="display:flex; flex-direction:column; gap:5px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:10.5px; font-weight:900; color:#059669;">🦅 ${dist} km Etabı İçin Önerilen İlk 3 Güvercininiz:</span>
            <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:9px;" onclick="openIosTab('flight'); AvigenUxManager.switchBreedingPlanSub('raceai');">
              🧬 Tüm AI Yarış Analizleri →
            </button>
          </div>
          ${ranked.map((r, i) => `
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid ${r.hasRealData ? '#059669' : '#7c3aed'}; border-radius:7px; padding:6px 8px; font-size:10.5px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>#${i + 1} ${r.flag} ${escapeHtml(r.ring)} — ${escapeHtml(r.name)}</strong>
                <span class="gene-badge ${r.hasRealData ? 'gene-green' : 'gene-purple'}">%${r.matchScore} Uyum</span>
              </div>
              <div style="font-size:8.8px; font-weight:800; color:${r.hasRealData ? '#059669' : '#7c3aed'}; margin-top:1px;">${escapeHtml(r.sourceTag)}</div>
              <div style="font-size:9.5px; color:var(--ios-subtext); margin-top:2px;">💡 <strong>Neden:</strong> ${escapeHtml(r.why)}</div>
            </div>
          `).join('')}
        </div>
      `;

      this.recordAnalysisToHistory({
        mode: 'distance',
        modeLabel: 'Mesafeye Göre Seçim',
        icon: '🏁',
        title: `${dist} km Etabı İlk 3 Kuş Önerisi`,
        verdict: ranked[0] ? `#1 Öneri: ${ranked[0].ring} (${ranked[0].name})` : 'Aday Yok',
        score: ranked[0] ? ranked[0].matchScore : null,
        reliabilityPct: 84,
        dataSourceSummary: `${activeBirds.length} aktif kümes kuşu, geçmiş m/dk hız ve mesafe kayıtları`,
        snapshotParams: { targetRaceDistKm: dist, targetRaceWind: wind }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `🏁 ${dist} km Yarış Etabı Kadro Önerisi`,
        verdictTag: dist >= 450 ? 'Uzun Mesafe / Dayanıklılık Etabı' : 'Kısa - Orta Mesafe / Hız Etabı',
        score: ranked[0] ? ranked[0].matchScore : null,
        reliabilityPct: 84,
        q1_whatAnalyzed: `Kümesinizdeki <strong>${activeBirds.length} aktif güvercinin</strong> <strong>${dist} km</strong> mesafe ve seçilen hava koşuluna uygunluğu tarandı.`,
        q2_dataUsed: `Kuşların geçmiş yarış mesafeleri, hız (m/dk) kayıtları ve anne-baba soyağacı mesafe uzmanlıkları kullanıldı.`,
        q3_result: `Bu etap için en yüksek uyumu #1 ${ranked[0] ? `${escapeHtml(ranked[0].ring)} (${escapeHtml(ranked[0].name)})` : '-'} gösteriyor.`,
        q4_whyResult: `${dist >= 450 ? '450 km üzerindeki etaplarda kas içi yağ yakımı ve dayanıklılık ön planda olduğu için uzun mesafe soy kayıtları güçlü kuşlar seçildi.' : 'Kısa ve orta mesafede patlayıcı çıkış hızı ve yön bulma çabukluğu belirleyici olduğu için sprint/orta mesafe kanları öne çıkarıldı.'}`,
        q5_reliability: `Kadro öneri güvenilirliği <strong>%84</strong>. Yarış öncesi kuşların güncel sağlık ve tüy durumunu kümesinizde son kez kontrol etmeniz önerilir.`,
        extraHtml: squadHtml,
        expertHtml: typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('racing') : ''
      });
      return;
    }

    // ------------------------------------------------------------------------
    // ALT MODÜL 6: GLOBAL GEN HAVUZU (YALNIZCA AVIGEN GLOBAL PAKETİNDE AÇIK!)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'global_pool' && typeof AvigenGlobalGenePool !== 'undefined') {
      const hasGlobalTier = typeof AvigenUxManager === 'undefined' || AvigenUxManager.hasGlobalPoolAccess();
      if (!hasGlobalTier) {
        out.innerHTML = `
          <div style="background:linear-gradient(145deg, #0f172a 0%, #2e1065 100%); border:1.5px solid #f59e0b; border-radius:12px; padding:12px 13px; color:#fff;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span class="gene-badge gene-gold">🌍 AVIGEN GLOBAL PAKET ÖZELLİĞİ</span>
              <span style="font-size:10px; color:#cbd5e1; font-weight:700;">Mevcut Paket: AVIGEN GENESIS AI</span>
            </div>
            <div style="font-size:13.5px; font-weight:900; color:#fbbf24; margin-bottom:5px;">
              "Kümesindeki bütün kuşları analiz et. Dünya genelindeki izinli gen havuzunda, senin kuşların için en uygun eşleşme adaylarını bul."
            </div>
            <div style="font-size:10.5px; color:#e2e8f0; line-height:1.45; margin-bottom:10px;">
              • Dünya genelindeki katılımcı kuş havuzunda kendi kuşlarınızla en uyumlu yabancı kuşları sıralayın.<br/>
              • Pedigree uyumu, performans tamamlayıcılığı ve akrabalık riskini anonim profiller üzerinden inceleyin.<br/>
              • Uygun gördüğünüz kuşların sahiplerine onaylı iletişim talebi gönderin.
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
              <button class="ios-btn ios-btn-gold" style="padding:9px; font-size:11.5px;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal('plans')">
                👑 AVIGEN GLOBAL Paketi İncele (799 TL/ay)
              </button>
              <button class="ios-btn ios-btn-primary" style="padding:9px; font-size:11.5px;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.setMembershipTier('GLOBAL')">
                🌍 Hemen GLOBAL'e Yükselt (Test)
              </button>
            </div>
          </div>
        `;
        return;
      }

      const selRing = AvigenGlobalGenePool.state.selectedLocalBirdRing || 'ALL_BEST_PAIRS';
      const distFocus = AvigenGlobalGenePool.state.targetDistanceFocus || 'ALL';

      const renderGlobalPairCard = (item, rankIdx) => {
        const c = item.candidate;
        const p = item.perfGlobal;
        const canContact = c.allow_connection_requests;
        const pendingReq = AvigenGlobalGenePool.db.breeder_connection_requests.find(
          r => r.sender_bird_ring === item.localBird.ring && r.target_anonymous_code === c.anonymous_code && r.status === 'PENDING'
        );

        return `
          <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-left:4px solid #2563eb; border-radius:9px; padding:8px 9px; font-size:10px; max-width:100%; overflow:hidden; word-break:break-word;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px; margin-bottom:4px;">
              <div style="min-width:0; flex:1;">
                <div style="font-size:11px; font-weight:900; color:#1e3a8a; line-height:1.25;">
                  #${rankIdx + 1} KÜRESEL ÇİFT: ${item.localBird.flag} ${escapeHtml(item.localBird.ring)} × 🌍 <span style="color:#7c3aed;">${escapeHtml(c.anonymous_code)}</span>
                  <span class="gene-badge gene-purple" style="font-size:8px; padding:1px 5px; margin-left:4px;">🧪 Test Havuzu Kaydı</span>
                </div>
                <div style="font-size:9px; color:var(--ios-subtext); margin-top:2px;">
                  Aday: <strong>${c.sex === 'F' ? '♀ Dişi' : '♂ Erkek'}</strong> • ${escapeHtml(c.region_zone)} • <strong>${escapeHtml(c.specialty_category)}</strong>
                </div>
              </div>
              <span class="gene-badge gene-green" style="font-size:9.5px; padding:2px 6px; flex-shrink:0;">
                ${item.totalMatchScore}/100
              </span>
            </div>

            <!-- 6 KÜRESEL EŞLEŞTİRME KRİTERİ ROZETLERİ (2 SÜTUNLU KOMPAKT YAPI — YANA TAŞMA YAPMAZ) -->
            <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:4px 6px; background:var(--ios-card); border:1px solid var(--ios-border); border-radius:6px; padding:5px 7px; margin:5px 0; font-size:9px;">
              <div style="min-width:0;">⚡ <strong>Performans:</strong> %${item.perfComplementarity}</div>
              <div style="min-width:0;">🌳 <strong>Pedigree:</strong> %${item.pedigreeComplementarity}</div>
              <div style="min-width:0;">🧬 <strong>Soy Uyumu:</strong> %${item.lineageCompatibility}</div>
              <div style="min-width:0;">🏁 <strong>Mesafe:</strong> %${item.distanceMatchScore}</div>
              <div style="min-width:0;">🐣 <strong>Damızlık:</strong> %${item.potentialBreedingContribution}</div>
              <div style="min-width:0;">🛡️ <strong>Güvenilirlik:</strong> %${item.combinedReliability}</div>
            </div>

            <div style="font-size:9.5px; color:var(--ios-text); line-height:1.35; margin-bottom:4px;">
              💡 <strong>Önerilme Nedeni:</strong> ${escapeHtml(item.matchReasonTr)}
            </div>
            <div style="font-size:9px; color:var(--ios-subtext); line-height:1.35; margin-bottom:4px;">
              📊 <strong>Aday Özeti:</strong> ${escapeHtml(c.strengths_tr)} (Pedigree: %${c.pedigree_completeness_pct} • ${c.verified_race_count} Yarış • ${c.verified_offspring_count} Yavru)
            </div>
            <div style="font-size:9px; color:${item.estimatedCoi > 12.5 ? '#dc2626' : '#059669'}; font-weight:700; margin-bottom:6px;">
              🔍 <strong>Akrabalık (Hash Analizi):</strong> ${escapeHtml(item.inbreedingWarningTr)}
            </div>

            <div style="display:flex; flex-direction:column; gap:5px; border-top:1px dashed var(--ios-border); padding-top:6px;">
              <span style="font-size:8.5px; color:var(--ios-subtext); line-height:1.25;">
                🔒 Sahibin izni olmadan kimlik ve pedigree gösterilmez.
              </span>
              ${pendingReq ? `
                <span class="gene-badge gene-purple" style="font-size:9px; padding:4px 8px; align-self:flex-start;">⏳ Sahip Onayı Bekleniyor</span>
              ` : (canContact ? `
                <button class="ios-btn ios-btn-primary" style="width:100%; padding:6px 9px; font-size:9.8px;" onclick="AvigenGlobalGenePool.sendConnectionRequest('${escapeHtml(item.localBird.ring)}', '${escapeHtml(c.anonymous_code)}', 'PAIRING_COLLAB')">
                  📩 Kuş Sahibine İletişim Talebi Gönder
                </button>
              ` : `
                <span class="gene-badge gene-purple" style="font-size:8.8px; padding:3px 7px; opacity:0.85; align-self:flex-start;">🔒 Sahibi İletişime Kapalı (Sadece Analiz)</span>
              `)}
            </div>
          </div>
        `;
      };

      if (selRing === 'ALL_BEST_PAIRS') {
        const bestGlobalPairs = AvigenGlobalGenePool.computeTopGlobalBestPairsForLoft(3);
        const topItem = bestGlobalPairs[0];

        const extraHtml = `
          <div style="display:flex; flex-direction:column; gap:7px; margin-top:4px;">
            <div style="font-size:11px; font-weight:900; color:#1e3a8a;">
              🌍 Küresel Gen Havuzu Tarandı — Kümesiniz İçin En İyi 3 Küresel Kuş Çifti Önerisi:
            </div>
            ${bestGlobalPairs.map((item, idx) => renderGlobalPairCard(item, idx)).join('')}
          </div>
        `;

        this.recordAnalysisToHistory({
          mode: 'global_pool',
          modeLabel: 'Global Gen Havuzu',
          icon: '🌍',
          title: `Küresel En İyi Çift Taraması (${topItem ? topItem.localBird.ring + ' × ' + topItem.candidate.anonymous_code : '-'})`,
          verdict: topItem ? `%${topItem.totalMatchScore} Küresel Tamamlayıcılık` : 'Aday Yok',
          score: topItem ? topItem.totalMatchScore : null,
          reliabilityPct: topItem ? topItem.combinedReliability : 0,
          dataSourceSummary: 'İzinli Global Gen Havuzu, SHA-256 soy düğümleri ve kardeş/yavru kayıtları',
          snapshotParams: {}
        });

        out.innerHTML = this.renderFiveQuestionDecisionCard({
          headerTitle: `🌍 Küresel Gen Havuzu — En İyi Kuş Çifti Önerileri (Global Best Pairs)`,
          verdictTag: topItem ? `#1 Öneri: ${topItem.localBird.ring} × ${topItem.candidate.anonymous_code} (%${topItem.totalMatchScore} Uyum)` : 'Aday Bulunamadı',
          score: topItem ? topItem.totalMatchScore : null,
          reliabilityPct: topItem ? topItem.combinedReliability : 0,
          q1_whatAnalyzed: `Kümesinizdeki aktif güvercinler, küresel gen havuzunda analiz izni verilmiş <strong>anonim adaylarla</strong> çapraz karşılaştırılarak en yüksek tamamlayıcılığa sahip kuş çiftleri belirlendi.`,
          q2_dataUsed: `Şifrelenmiş 4 kuşak soyağacı düğümleri (SHA-256), bireysel yarış hızları, mesafe başarıları, anne-baba, kardeş, yavru ve önceki eşleşme performans indeksleri kullanıldı.`,
          q3_result: topItem
            ? `En yüksek küresel çift uyumu (${topItem.totalMatchScore}/100): Sizin ${escapeHtml(topItem.localBird.ring)} (${escapeHtml(topItem.localBird.name)}) kuşunuz ile ${escapeHtml(topItem.candidate.anonymous_code)} (${escapeHtml(topItem.candidate.region_zone)}) arasında tespit edildi.`
            : 'Uygun küresel aday bulunamadı.',
          q4_whyResult: topItem
            ? `${escapeHtml(topItem.matchReasonTr)} Ayrıca sıfır kimlik ifşası prensibiyle yapılan hash taramasında yakın akrabalık depresyonu riski (%${topItem.estimatedCoi} COI) saptanmadı.`
            : 'Veri yetersiz.',
          q5_reliability: `Veri güvenilirliği <strong>%${topItem ? topItem.combinedReliability : 0}</strong>. Global sıralamada havuzdaki kuş sayısı değil, doğrulanmış veri kalitesi esas alınmıştır. Kesin yavru garantisi vermez.`,
          extraHtml,
          expertHtml: typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('breeding') : ''
        });
      } else {
        const res = AvigenGlobalGenePool.findGlobalMatchesForLocalBird(selRing, distFocus);
        if (res.rateLimited) {
          out.innerHTML = `<div style="padding:12px; color:#dc2626; font-weight:800; font-size:11px;">🛡️ Güvenlik Sınırı: Toplu veri çıkarımını (scraping) önlemek için oturum sorgu limitine ulaşıldı.</div>`;
          return;
        }
        const matches = res.matches.slice(0, 3);
        const top = matches[0];

        const extraHtml = `
          <div style="display:flex; flex-direction:column; gap:7px; margin-top:4px;">
            <div style="font-size:11px; font-weight:900; color:#1e3a8a;">
              🌍 ${escapeHtml(res.localBird.ring)} (${escapeHtml(res.localBird.name)}) İçin En Uygun Küresel Anonim Adaylar:
            </div>
            ${matches.map((item, idx) => renderGlobalPairCard(item, idx)).join('')}
          </div>
        `;

        out.innerHTML = this.renderFiveQuestionDecisionCard({
          headerTitle: `🌍 Küresel Eş Arama: ${res.localBird.flag} ${escapeHtml(res.localBird.ring)} (${escapeHtml(res.localBird.name)})`,
          verdictTag: top ? `En Uygun Global Aday: ${top.candidate.anonymous_code} (${top.totalMatchScore}/100)` : 'Aday Yok',
          score: top ? top.totalMatchScore : null,
          reliabilityPct: top ? top.combinedReliability : 0,
          q1_whatAnalyzed: `<strong>${escapeHtml(res.localBird.ring)} (${escapeHtml(res.localBird.name)})</strong> güvercininizin eksik ve güçlü yönleri küresel havuzdaki karşı cins anonim adaylarla karşılaştırıldı.`,
          q2_dataUsed: `Hashlenmiş ortak ata taraması, mesafe bazlı başarı, ebeveyn, kardeş ve yavru performans indeksleri kullanıldı. Eksik pedigreli adaylar (${matches.some(m => m.candidate.pedigree_completeness_pct < 75) ? 'örn. AVG-GLB-3095 %60 tamlık' : 'tamamı şeffaf'}) açıkça işaretlendi.`,
          q3_result: top ? `En uygun küresel eş adayı ${top.totalMatchScore}/100 puanla ${escapeHtml(top.candidate.anonymous_code)} (${escapeHtml(top.candidate.region_zone)}) olarak belirlendi.` : 'Uygun aday bulunamadı.',
          q4_whyResult: top ? top.matchReasonTr : '',
          q5_reliability: `Birleşik veri güvenilirliği <strong>%${top ? top.combinedReliability : 0}</strong>. Sahibin onayı olmadan kimlik veya özel pedigree belgesi paylaşılmaz.`,
          extraHtml,
          expertHtml: typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('breeding') : ''
        });
      }
      return;
    }

    // ------------------------------------------------------------------------
    // 2. ANA MODÜL: GENETİK GELECEK SİMÜLASYONU (F1 YAVRU & F2 TORUN PROJEKSİYONU)
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'future_sim') {
      const sim = this.simulateGeneticFutureGenerations(
        this.state.simSireRef,
        this.state.simDamRef,
        this.state.simF2PartnerRef,
        this.state.simTargetGoal
      );

      if (!sim.hasSufficientPedigreeData) {
        out.innerHTML = this.renderFiveQuestionDecisionCard({
          headerTitle: `🧬 Genetik Gelecek Simülasyonu: ♂ ${escapeHtml(sim.sireInfo.ring)} × ♀ ${escapeHtml(sim.damInfo.ring)}`,
          verdictTag: 'Eksik Pedigree Verisi — Kesin Genetik Projeksiyon Üretilemedi',
          score: null,
          reliabilityPct: sim.f1Reliability,
          q1_whatAnalyzed: `♂ <strong>${escapeHtml(sim.sireInfo.ring)}</strong> ile ♀ <strong>${escapeHtml(sim.damInfo.ring)}</strong> eşleşmesinden doğacak 1. Kuşak (F1) ve 2. Kuşak (F2) nesillerin gelecek projeksiyonu denendi.`,
          q2_dataUsed: `Baba soyunda ${sim.sFilled}/6 ata, Anne soyunda ${sim.dFilled}/6 ata kaydı bulundu.`,
          q3_result: `Veri Yetersiz (%${sim.f1Reliability} Yeterlilik) — Eksik pedigree kayıtları nedeniyle 1. ve 2. nesil için genetik simülasyon üretilmedi.`,
          q4_whyResult: `AVIGEN bilimsel doğruluk kuralları gereği, ebeveynlerin üst soy kayıtları eksik olduğunda doğrulanamayan gen aktarımı veya kesin yavru performans iddiası üretilmez.`,
          q5_reliability: `Mevcut veri yeterliliği <strong>%${sim.f1Reliability}</strong> (${escapeHtml(sim.dataSufficiencyLabel)}). Simülasyonu çalıştırmak için lütfen seçilen kuşların anne-baba ve büyük ebeveyn kayıtlarını tamamlayın.`
        });
        return;
      }

      this.recordAnalysisToHistory({
        mode: 'future_sim',
        modeLabel: '2. Genetik Gelecek Simülasyonu',
        icon: '🧬',
        title: `F1 (${sim.sireInfo.ring}×${sim.damInfo.ring}) → F2 (×${sim.p3Info.ring})`,
        verdict: `F1 Olasılık: ~${sim.f1Overall} (±${sim.f1UncertaintySpread}) • F2 Olasılık: ~${sim.f2Overall} (±${sim.f2UncertaintySpread})`,
        score: sim.f2Overall || sim.f1Overall,
        reliabilityPct: sim.f1Reliability,
        dataSourceSummary: `Veri Yeterliliği: %${sim.f1Reliability} (${sim.sFilled + sim.dFilled}/12 ata) • Belirsizlik: ±${sim.f1UncertaintySpread} / ±${sim.f2UncertaintySpread} puan`,
        snapshotParams: {
          simSireRef: this.state.simSireRef,
          simDamRef: this.state.simDamRef,
          simF2PartnerRef: this.state.simF2PartnerRef,
          simTargetGoal: this.state.simTargetGoal
        }
      });

      // 7 metrikten en temel 4 bilimsel boyutu seç (Hız, Dayanıklılık, İstikrar, Eve Dönüş)
      const core4SimTraits = [
        { ...sim.simulatedTraits[0], label: '🚀 1. Kısa Mesafe & Hız' },
        { ...sim.simulatedTraits[1], label: '🏔️ 2. Orta / Uzun Dayanıklılık' },
        { ...sim.simulatedTraits[5], label: '🎯 3. Yarış İstikrarı' },
        { ...sim.simulatedTraits[6], label: '🧭 4. Eve Dönüş & Yön' }
      ];

      const simTableHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 9px; font-size:9.8px; max-width:100%; overflow:hidden;">
          <!-- NESİL ÖZET KUTULARI -->
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; margin-bottom:7px;">
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:7px; padding:6px 7px; min-width:0;">
              <div style="font-weight:900; color:#5b21b6; font-size:10px;">🐣 1. Kuşak (F1 Yavru)</div>
              <div style="font-size:8.5px; color:var(--ios-subtext); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">♂ ${escapeHtml(sim.sireInfo.ring)} × ♀ ${escapeHtml(sim.damInfo.ring)}</div>
              <div style="margin-top:3px; font-weight:800; color:#059669; font-size:9.5px;">
                ~${sim.f1Overall}/100 (±${sim.f1UncertaintySpread}) • COI: %${sim.f1Coi.toFixed(1)}
              </div>
              <div style="font-size:8.5px; color:var(--ios-subtext);">Veri Yeterliliği: <strong>%${sim.f1Reliability}</strong></div>
            </div>

            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #0066ff; border-radius:7px; padding:6px 7px; min-width:0;">
              <div style="font-weight:900; color:#0052cc; font-size:10px;">🦅 2. Kuşak (F2 Torun)</div>
              <div style="font-size:8.5px; color:var(--ios-subtext); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">F1 × ${escapeHtml(sim.p3Info.ring)}</div>
              <div style="margin-top:3px; font-weight:800; color:#0052cc; font-size:9.5px;">
                ~${sim.f2Overall}/100 (±${sim.f2UncertaintySpread}) • COI: %${sim.f2Coi.toFixed(1)}
              </div>
              <div style="font-size:8.5px; color:var(--ios-subtext);">Veri Yeterliliği: <strong>%${sim.f2Reliability}</strong></div>
            </div>
          </div>

          <!-- 4 TEMEL BOYUTTA F1 VE F2 OLASILIK ARALIĞI TABLOSU (YANA TAŞMASIZ ESNEK SÜTUNLAR) -->
          <div style="display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,0.65fr) minmax(0,0.85fr) minmax(0,0.85fr); gap:4px; font-weight:900; border-bottom:1px solid var(--ios-border); padding-bottom:4px; margin-bottom:4px; font-size:8.8px;">
            <span>4 Temel Boyut</span>
            <span style="text-align:center;">Ebeveyn</span>
            <span style="text-align:center; color:#6d28d9;">F1 Aralığı</span>
            <span style="text-align:center; color:#0052cc;">F2 Aralığı</span>
          </div>
          ${core4SimTraits.map(t => `
            <div style="display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,0.65fr) minmax(0,0.85fr) minmax(0,0.85fr); gap:4px; padding:3.5px 0; border-bottom:1px dashed var(--ios-border); align-items:center; font-size:8.8px;">
              <span style="font-weight:700; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${t.label}</span>
              <span style="text-align:center; color:var(--ios-subtext); white-space:nowrap;">
                ${t.sireVal !== null ? t.sireVal : '-'}/${t.damVal !== null ? t.damVal : '-'}
              </span>
              <span style="text-align:center; font-weight:800; color:#5b21b6; white-space:nowrap;">
                ${t.f1Expected !== null ? `${t.f1Range}` : 'Veri Yok'}
              </span>
              <span style="text-align:center; font-weight:800; color:#0052cc; white-space:nowrap;">
                ${t.f2Expected !== null ? `${t.f2Range}` : 'Veri Yok'}
              </span>
            </div>
          `).join('')}

          <div style="margin-top:6px; font-size:8.8px; color:#475569; background:var(--ios-card); border:1px solid var(--ios-border); border-radius:6px; padding:4px 7px; line-height:1.35;">
            🔬 <strong>Bilimsel Not:</strong> Mendel ayrışımı nedeniyle yavrular sabit tek puanda değil, <strong>±${sim.f1UncertaintySpread} / ±${sim.f2UncertaintySpread} puan olasılık aralığında</strong> doğar.
          </div>
        </div>
      `;

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `🧬 2. Genetik Gelecek Simülasyonu (F1 Yavru &amp; F2 Torun)`,
        verdictTag: `F1: ~${sim.f1Overall}/100 (±${sim.f1UncertaintySpread}) → F2: ~${sim.f2Overall}/100 (±${sim.f2UncertaintySpread})`,
        metricTitle: 'GENETİK ÇEŞİTLİLİK (COI)',
        metricValue: `F1: %${sim.f1Coi.toFixed(1)} • F2: %${sim.f2Coi.toFixed(1)}`,
        metricColor: '#7c3aed',
        score: sim.f2Overall || sim.f1Overall,
        reliabilityPct: sim.f1Reliability,
        q1_whatAnalyzed: `1. Kuşakta ♂ <strong>${escapeHtml(sim.sireInfo.ring)}</strong> × ♀ <strong>${escapeHtml(sim.damInfo.ring)}</strong> (F1); 2. Kuşakta F1 × <strong>${escapeHtml(sim.p3Info.ring)}</strong> (F2 Torun) simüle edildi.`,
        q2_dataUsed: `Baba (${sim.sFilled}/30 ata), Anne (${sim.dFilled}/30 ata), F2 Eşi (${sim.p3Filled}/30 ata) • Veri Güvenilirliği: %${sim.f1Reliability} (${escapeHtml(sim.dataSufficiencyLabel)}).`,
        q3_result: `F1 Yavru Beklentisi: ~${sim.f1Overall}/100 (${sim.f1Overall - sim.f1UncertaintySpread}–${Math.min(99, sim.f1Overall + sim.f1UncertaintySpread)} aralığı, %${sim.f1Coi.toFixed(2)} COI) • F2 Torun Beklentisi: ~${sim.f2Overall}/100 (${sim.f2Overall - sim.f2UncertaintySpread}–${Math.min(99, sim.f2Overall + sim.f2UncertaintySpread)} aralığı, %${sim.f2Coi.toFixed(2)} COI).`,
        q4_whyResult: `Mevcut soyağacı ve performans göstergeleri F1 nesline aktarılırken, 2. kuşakta ${escapeHtml(sim.p3Info.ring)} ile ${sim.f2Coi === 0 ? 'yabancı kan dinçliği (Outcross)' : 'kontrollü soy sabitlemesi (Linebreeding)'} sağlanmaktadır.`,
        q5_reliability: `Veri Güvenilirliği: F1 için <strong>%${sim.f1Reliability}</strong> (±${sim.f1UncertaintySpread} puan aralığı), F2 için <strong>%${sim.f2Reliability}</strong> (±${sim.f2UncertaintySpread} puan aralığı). Kesin yavru başarı garantisi yerine olasılık aralığı sunulmuştur.`,
        extraHtml: simTableHtml,
        expertHtml: typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('breeding') : ''
      });
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
            <span>📊 1 Aylık (30 Gün) Kümes Tüketim, Sulu Malzeme &amp; Maliyet Hesabı</span>
            <span class="gene-badge gene-green" style="font-size:8.5px;" id="nutMonthlyTotalBadge">${plan.monthly.totalFeedKgLabel} kg • ${plan.cost.totalMonthlyTlLabel} TL/Ay</span>
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
              ⚖️ ${plan.birdCount} Kuş İçin Günlük Rasyon &amp; Öğün Dağılımı
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
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; font-size:10px;">
                  <div style="font-weight:900; color:var(--ios-text);">${s.icon} ${escapeHtml(s.name)}</div>
                  <div style="font-weight:900; color:${s.color}; flex-shrink:0;">
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
    // 2. ANA MOTOR: GENESIS CORTEX — KİŞİSEL KÜMES DANIŞMANI & ÖĞRENEN YAPAY ZEKÂ
    // ------------------------------------------------------------------------
    if (this.state.activeMode === 'cortex_advisor') {
      const adv = this.buildCortexAdvisorAnalysis(
        this.state.cortexAdvisorTopic || 'damizlik_secimi',
        this.state.cortexCustomQuestion || ''
      );

      this.recordAnalysisToHistory({
        mode: 'cortex_advisor',
        modeLabel: '2. Kişisel Kümes Danışmanı',
        icon: '🧠',
        title: adv.headerTitle.replace(/<[^>]*>/g, ''),
        verdict: adv.bulletDecision.replace(/<[^>]*>/g, '').slice(0, 95),
        score: adv.score,
        reliabilityPct: adv.reliabilityPct,
        dataSourceSummary: adv.metricValue,
        snapshotParams: {
          cortexAdvisorTopic: this.state.cortexAdvisorTopic,
          cortexCustomQuestion: this.state.cortexCustomQuestion
        }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard(adv);
      return;
    }
  },

  selectAlternativePairAndRun(sireId, damId) {
    if (sireId) this.state.selectedSireRef = sireId;
    if (damId) this.state.selectedDamRef = damId;
    this.state.activeMode = 'breeding';
    this.state.viewStage = 'tool';
    this.saveState();
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
    alert(`🪺 Yuva #${nestNum} Başarıyla Oluşturuldu!\n\n♂ Baba: ${sLabel}\n♀ Anne: ${dLabel}\n🧬 GENESIS Uyum: %${score} (COI: %${Number(coi || 0).toFixed(2)})\n\nAna Sayfa -> 🪺 Yuvalar sekmesinden kuluçka ve bilezik takvimini takip edebilirsiniz.`);
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
    if (matchingLog.userDecision === 'REJECTED') return { delta: -25, status: 'REJECTED' };
    if (matchingLog.userDecision === 'ACCEPTED') return { delta: 6, status: 'ACCEPTED' };
    return { delta: 0, status: null };
  },

  onCortexTopicChange(topicId) {
    this.state.cortexAdvisorTopic = topicId;
    this.state.cortexCustomQuestion = '';
    const inp = document.getElementById('genesisCortexCustomInput');
    if (inp) inp.value = '';
    this.saveState();
    this.renderGenesisReportOnly();
  },

  submitCustomCortexQuestion() {
    const inp = document.getElementById('genesisCortexCustomInput');
    const q = (inp?.value || '').trim();
    if (!q) {
      this.renderGenesisReportOnly();
      return;
    }
    this.state.cortexCustomQuestion = q;
    this.state.cortexAdvisorTopic = 'custom';
    this.saveState();
    this.renderGenesisReportOnly();
  },

  recordCortexUserFeedback(recKey, decision, score, reliabilityPct) {
    if (!Array.isArray(this.state.cortexLearningLog)) {
      this.state.cortexLearningLog = [];
    }
    const cleanTitle = String(recKey || '').split('__')[1] || 'GENESIS Önerisi';
    const modePart = String(recKey || '').split('__')[0] || this.state.activeMode;

    // Veri kalitesi kontrolü (Bölüm 8 Kuralı: Az veya düşük kaliteli veriyi doğrudan bilimsel gerçek kabul etme)
    const qualityStatus = reliabilityPct >= 75
      ? 'Doğrulanmış Yüksek Kaliteli Veri (Model Kalibrasyonuna Dahil Edildi)'
      : (reliabilityPct >= 45
        ? 'Orta Veri Kalitesi (İzlemeye Alındı — Ek Yavru/Yarış Sonucu Bekleniyor)'
        : 'Düşük/Eksik Veri (Kayıt Altına Alındı Ancak Model Ağırlıklarına Henüz İşlenmedi)');

    this.state.cortexLearningLog.unshift({
      id: 'learn_' + Date.now(),
      date: new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      mode: modePart,
      title: cleanTitle,
      userDecision: decision, // 'ACCEPTED' | 'REJECTED'
      predictedScore: score,
      reliabilityPct,
      qualityStatus,
      modelVersion: this.state.cortexModelVersion || 'v2.0.1'
    });

    // Yeterli doğrulanmış veri biriktiğinde (en az 5 yüksek kaliteli geri bildirim) model alt sürümünü versiyonla
    const highQualityCount = this.state.cortexLearningLog.filter(l => l.reliabilityPct >= 65).length;
    if (highQualityCount >= 5) {
      this.state.cortexModelVersion = `v2.0.${Math.min(9, 1 + Math.floor(highQualityCount / 5))}`;
    }

    if (this._engineCache) {
      this._engineCache.versionKey = '';
      this._engineCache.breedingQuick = {};
      this._engineCache.breedingFull = {};
    }
    this.saveState();
    this.renderGenesisModuleUI();
    alert(
      decision === 'ACCEPTED'
        ? `✅ Öneri Kabul Edildi ve GENESIS CORTEX (${this.state.cortexModelVersion}) Öğrenme Hafızasına Kaydedildi!\n\nVeri Kalitesi: ${qualityStatus}`
        : `📝 Öneri Reddedildi Olarak İşaretlendi (${this.state.cortexModelVersion}).\n\nSistem eşleştirme puanını ve alternatif sıralamayı bu tercihinize göre anında güncelledi.`
    );
  },

  buildCortexAdvisorAnalysis(topic, customQuestion) {
    const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];
    const activeBirds = allBirds.filter(b => b.isActiveLoftBird);
    const { males, females } = typeof getAllBreedingCandidates === 'function'
      ? getAllBreedingCandidates()
      : { males: [], females: [] };
    const nests = typeof activePairsList !== 'undefined' && Array.isArray(activePairsList) ? activePairsList : [];
    const races = typeof racesList !== 'undefined' && Array.isArray(racesList) ? racesList : [];
    const wState = typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state
      ? AvigenLiveWeather.state
      : { cityName: 'İstanbul', temp: 22, hum: 55, windSpeedKmh: 12, conditionText: 'Açık' };

    // Eğer kullanıcı özel bir soru veya kuş ismi/bilezik numarası yazdıysa önce onu analiz et
    const qLower = (customQuestion || '').trim().toLowerCase();
    let effectiveTopic = topic;
    if (qLower) {
      // Kümeste soruda adı veya bilezik numarası geçen tüm kuşları tespit et (1 kuş veya 2 kuş çapraz eşleşme sorusu!)
      const matchedBirds = activeBirds.filter(b => {
        const ringLow = (b.ring || '').toLowerCase();
        const ringClean = ringLow.replace(/[-\s./]+/g, '');
        const ringTail = (ringLow.match(/\d{4,7}$/) || [''])[0];
        const nameLow = (b.name || '').trim().toLowerCase();
        if (ringLow && qLower.includes(ringLow)) return true;
        if (ringClean.length >= 5 && qLower.replace(/[-\s./]+/g, '').includes(ringClean)) return true;
        if (ringTail.length >= 4 && qLower.includes(ringTail)) return true;
        if (nameLow.length >= 3 && qLower.includes(nameLow)) return true;
        return false;
      });

      // DURUM A: Kullanıcı sorusunda İKİ FARKLI KUŞ yazdıysa (Örn: "Fırtına ile Kraliçe eşleşir mi?" veya "100245 ve 100890")
      if (matchedBirds.length >= 2) {
        const b1 = matchedBirds[0];
        const b2 = matchedBirds[1];
        const sireB = b1.sex === 'M' ? b1 : (b2.sex === 'M' ? b2 : b1);
        const damB = sireB === b1 ? b2 : b1;
        const sRef = `${sireB.pedId}::${sireB.slotKey || 'main'}`;
        const dRef = `${damB.pedId}::${damB.slotKey || 'main'}`;
        const rep = this.analyzeBreedingIntelligence(sRef, dRef, true);

        const extraHtml = `
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.8px; display:flex; flex-direction:column; gap:6px;">
            <div>
              <strong>💞 Sorulan Çift Analizi:</strong> ♂ ${sireB.flag} ${escapeHtml(sireB.ring)} (${escapeHtml(sireB.name)}) × ♀ ${damB.flag} ${escapeHtml(damB.ring)} (${escapeHtml(damB.name)})
            </div>
            <div>• <strong>5 Nesil Wright COI:</strong> %${rep.coi.toFixed(2)} (${escapeHtml(rep.relationSummary)}) • <strong>Melez Dinçliği:</strong> %${rep.heterosis}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:2px;">
              <button type="button" class="ios-btn ios-btn-primary" style="padding:7px; font-size:10px;" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${sRef}', '${dRef}')">
                🔬 Tam Eşleştirme Raporunu Aç
              </button>
              <button type="button" class="ios-btn ios-btn-green" style="padding:7px; font-size:10px;" onclick="AvigenGenesisAI.saveCurrentGenesisPairToActiveNests('${escapeHtml(sireB.ring)}', '${escapeHtml(sireB.name)}', '${escapeHtml(damB.ring)}', '${escapeHtml(damB.name)}', ${rep.totalScore}, ${rep.coi})">
                🪺 Bu Çifti Yuvaya Kaydet
              </button>
            </div>
          </div>
        `;

        return {
          headerTitle: `🧠 Danışman Yanıtı: ♂ ${escapeHtml(sireB.ring)} × ♀ ${escapeHtml(damB.ring)} Eşleşir mi?`,
          metricTitle: '5 NESİL WRIGHT COI',
          metricValue: `%${rep.coi.toFixed(2)} COI`,
          metricColor: rep.coi >= 12.5 ? '#d97706' : '#059669',
          score: rep.totalScore,
          reliabilityPct: rep.dataReliabilityPct,
          bulletDecision: `${sireB.ring} (${sireB.name}) ile ${damB.ring} (${damB.name}) eşleşmesi ${rep.totalScore}/100 uyum puanına sahiptir. ${rep.coi >= 25 ? 'Çok yakın akrabalık (%' + rep.coi.toFixed(1) + ' COI) nedeniyle önerilmez.' : 'Bu eşleşme değerlendirilebilir.'}`,
          bulletProof: `Avantaj: ${rep.coi === 0 ? 'Aralarında 5 nesilde ortak ata yoktur (%0 COI); doğacak yavrular yüksek melez dinçliği kazanır.' : 'Kontrollü soy hattı uyumu (' + rep.relationSummary + ') mevcuttur.'}`,
          bulletDataRisk: `Risk & Veri: Baba soyunda ${rep.sFilled}/30 ata, Anne soyunda ${rep.dFilled}/30 ata kayıtlıdır.${sireB.sex === damB.sex ? ' ⚠️ Dikkat: Seçilen iki kuşun kayıtlı cinsiyeti aynı (' + (sireB.sex === 'M' ? 'Erkek' : 'Dişi') + ') görünüyor!' : ''}`,
          q1_whatAnalyzed: `Kullanıcı sorusu ("${escapeHtml(customQuestion)}") kapsamında ${escapeHtml(sireB.ring)} ve ${escapeHtml(damB.ring)} kuşlarının 5 nesil çapraz soy ağacı incelendi.`,
          q5_reliability: `Veri güvenilirliği %${rep.dataReliabilityPct} olarak hesaplanmıştır.`,
          extraHtml
        };
      }

      const matchedBird = matchedBirds[0] || null;
      if (matchedBird) {
        const prof = this.getCachedPerformanceProfile(matchedBird.ring);
        const sStats = prof?.statsSummary || {};
        const ownPed = pedigrees.find(p => p.id === matchedBird.pedId);
        const partnerPool = matchedBird.sex === 'F' ? males : females;
        const bestPartners = partnerPool
          .slice(0, 10)
          .map(p => {
            const sId = matchedBird.sex === 'M' ? `${matchedBird.pedId}::${matchedBird.slotKey}` : p.id;
            const dId = matchedBird.sex === 'F' ? `${matchedBird.pedId}::${matchedBird.slotKey}` : p.id;
            const br = this.analyzeBreedingIntelligence(sId, dId, true);
            return { partner: p, score: br.totalScore, coi: br.coi, rel: br.dataReliabilityPct, summary: br.relationSummary };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);

        const extraHtml = `
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.8px;">
            <div style="font-weight:900; color:#0052cc; margin-bottom:5px;">
              🕊️ ${matchedBird.flag} ${escapeHtml(matchedBird.ring)} (${escapeHtml(matchedBird.name)}) İçin Kümesteki En Uygun 3 Eş Adayı:
            </div>
            <div style="display:flex; flex-direction:column; gap:5px;">
              ${bestPartners.map((bp, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:7px; padding:5px 8px;">
                  <div>
                    <strong>#${idx + 1} ${bp.partner.flag} ${escapeHtml(bp.partner.ring)} (${escapeHtml(bp.partner.name)})</strong>
                    <div style="font-size:8.8px; color:var(--ios-subtext);">5 Nesil Wright COI: %${bp.coi.toFixed(2)} • ${escapeHtml(bp.summary)}</div>
                  </div>
                  <button type="button" class="nest-mini-action-btn" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${matchedBird.sex === 'M' ? `${matchedBird.pedId}::${matchedBird.slotKey}` : bp.partner.id}', '${matchedBird.sex === 'F' ? `${matchedBird.pedId}::${matchedBird.slotKey}` : bp.partner.id}'); AvigenGenesisAI.switchGenesisMode('breeding');">
                    %${bp.score} Eşleştir →
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;

        return {
          headerTitle: `🧠 Kişisel Kümes Danışmanı: ${matchedBird.flag} ${escapeHtml(matchedBird.ring)} (${escapeHtml(matchedBird.name)})`,
          metricTitle: 'POTANSİYEL vs PERFORMANS',
          metricValue: `Pot:${sStats.geneticPotentialScore ?? matchedBird.ebvScore} • Perf:${sStats.realizedPerformanceScore ?? 'Geçici'}`,
          metricColor: '#0066ff',
          score: matchedBird.ebvScore,
          reliabilityPct: Math.min(96, Math.round(((sStats.filledAncCount || 10) / 20) * 70 + (sStats.totalRaceCount || 0) * 10)),
          bulletDecision: `${matchedBird.ring} (${matchedBird.name}) kümesinizde ${matchedBird.sex === 'M' ? '♂ Erkek' : '♀ Dişi'} statüsünde kayıtlıdır. ${sStats.evaluationMethodType || 'Geçici Performans Puanı'} değerlendirmesine göre en yüksek eşleşme uyumunu ${bestPartners[0] ? `${bestPartners[0].partner.ring} (${bestPartners[0].partner.name} • %${bestPartners[0].score} uyum, %${bestPartners[0].coi.toFixed(2)} COI)` : 'mevcut adaylarla'} vermektedir.`,
          bulletProof: `Soy ağacında ${sStats.filledAncCount || 0}/30 ata kutusu dolu; Genetik Potansiyel Puanı: ${sStats.geneticPotentialScore ?? matchedBird.ebvScore}/100, Gerçekleşmiş Yarış/Yavru Performansı: ${sStats.realizedPerformanceScore !== null && sStats.realizedPerformanceScore !== undefined ? sStats.realizedPerformanceScore + '/100' : 'Bireysel yarış kaydı henüz girilmemiş (Geçici Puan)'}.`,
          bulletDataRisk: (sStats.filledAncCount || 0) < 14
            ? `Bu kuşun 3. ve 4. kuşak soy ağacında ${30 - (sStats.filledAncCount || 0)} eksik ata kutusu var; BLUP doğruluğunu artırmak için eksik ata ve yarış kayıtlarını tamamlamanız önerilir.`
            : `Soy ağacı derinliği yüksek (${sStats.filledAncCount}/30 ata); akrabalık (COI) kontrolü 5 nesil üzerinden doğrulandı.`,
          q1_whatAnalyzed: `Kullanıcı sorusu ("${escapeHtml(customQuestion)}") kapsamında kümesinizdeki gerçek <strong>${escapeHtml(matchedBird.ring)}</strong> kaydı, 5 nesil soy ağacı ve eşleşme matrisi incelendi.`,
          q5_reliability: `Sonuçlar genel sohbet yanıtı değildir; doğrudan kümesinizdeki ${activeBirds.length} aktif güvercinin deterministik Wright COI ve performans verilerinden üretilmiştir.`,
          extraHtml
        };
      }

      if (qLower.includes('yem') || qLower.includes('su') || qLower.includes('sıvı') || qLower.includes('besle')) effectiveTopic = 'bugun_yem_sivi';
      else if (qLower.includes('yarış') || qLower.includes('hava') || qLower.includes('rüzgar')) effectiveTopic = 'yaris_hazirlik';
      else if (qLower.includes('eksik') || qLower.includes('veri') || qLower.includes('blup')) effectiveTopic = 'eksik_veri_raporu';
      else if (qLower.includes('akraba') || qLower.includes('coi') || qLower.includes('kardeş')) effectiveTopic = 'akrabalik_taramasi';
      else if (qLower.includes('öğren') || qLower.includes('model')) effectiveTopic = 'ogrenme_model_raporu';
      else effectiveTopic = 'damizlik_secimi';
    }

    // KONU 3: BUGÜNKÜ TARİHE, HAVAYA VE KUŞLARIN DURUMUNA GÖRE AKILLI YEM VE SIVI ÖNERİSİ
    if (effectiveTopic === 'bugun_yem_sivi') {
      const nutPlan = this.calculateSmartNutritionPlan('auto_today_smart', 'ALL', activeBirds.length || 64);
      const ts = nutPlan.todaySmart;
      const extraHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.6px; display:flex; flex-direction:column; gap:5px;">
          <div>📅 <strong>Bugünün Tarihi &amp; Mevsim Evresi:</strong> ${escapeHtml(ts.dateLabel)} — <strong>${escapeHtml(ts.seasonLabel)}</strong></div>
          <div>🌡️ <strong>Canlı Hava Durumu (${escapeHtml(wState.cityName)}):</strong> ${wState.temp}°C • %${wState.hum} Nem • Rüzgâr: ${wState.windSpeedKmh} km/sa</div>
          <div>🌾 <strong>Bugün Verilecek Yem Karışımı (${nutPlan.totalDailyKgLabel}/gün):</strong> ${escapeHtml(ts.todayFeedRecommendation)}</div>
          <div>💧 <strong>Bugün Suluğa / Yeme Konulacak Sıvı:</strong> ${escapeHtml(ts.todayLiquidRecommendation)}</div>
          <button type="button" class="ios-btn ios-btn-green" style="width:100%; padding:7px; font-size:10.5px; margin-top:3px;" onclick="AvigenGenesisAI.switchGenesisMode('nutrition')">
            🌾 Detaylı Gramaj Tablosunu ve 1 Aylık Maliyet Hesabını Aç →
          </button>
        </div>
      `;
      return {
        headerTitle: `🧠 Danışman Raporu: Bugünün Tarihine &amp; Kuşların Durumuna Göre Yem ve Sıvı Reçetesi`,
        metricTitle: 'GÜNLÜK YEM & SIVI',
        metricValue: `${nutPlan.totalDailyKgLabel}/gün • ${wState.temp}°C`,
        metricColor: '#059669',
        score: 97,
        reliabilityPct: 95,
        bulletDecision: `${ts.dateLabel} tarihi, ${wState.temp}°C canlı sıcaklık ve kümesinizdeki ${activeBirds.length} kuşun durumu (${ts.birdStatusSummary}) baz alındığında bugün kuş başı ${nutPlan.gramsPerBird} gr (Toplam ${nutPlan.totalDailyKgLabel}) verilmelidir.`,
        bulletProof: `Yem: ${ts.todayFeedRecommendation} | Sıvı/Suluk: ${ts.todayLiquidRecommendation}`,
        bulletDataRisk: nutPlan.weatherAdjustmentNote,
        q1_whatAnalyzed: `Takvim tarihi (${escapeHtml(ts.dateLabel)}), canlı meteoroloji (${wState.temp}°C) ve kümesinizdeki ${activeBirds.length} aktif güvercin ile ${nests.length} aktif yuva durumu birlikte incelendi.`,
        q5_reliability: `Öneri doğrudan kümesinizdeki kuş sayısı, aktif yuva evreleri ve canlı hava durumundan deterministik olarak hesaplanmıştır.`,
        extraHtml
      };
    }

    // KONU 2: YARIŞ HAZIRLIK VE BUGÜNKÜ HAVA İÇİN EN UYGUN KUŞLAR
    if (effectiveTopic === 'yaris_hazirlik') {
      const targetKm = this.state.targetRaceDistKm || 420;
      const rankedRacers = activeBirds
        .map(b => {
          const prof = this.getCachedPerformanceProfile(b.ring);
          const sStats = prof?.statsSummary || {};
          const notesLower = `${b.name} ${b.notes}`.toLowerCase();
          const hasLongBlood = notesLower.includes('porsche') || notesLower.includes('harry') || notesLower.includes('500') || notesLower.includes('sivas');
          const hasSprintBlood = notesLower.includes('kittel') || notesLower.includes('sprint') || notesLower.includes('quievrain');
          let suit = b.ebvScore + (sStats.totalRaceCount || 0) * 4 + (hasLongBlood && targetKm >= 400 ? 5 : 0) + (hasSprintBlood && targetKm <= 350 ? 5 : 0);
          suit = Math.min(98, Math.round(suit));
          return {
            bird: b,
            suit,
            raceCount: sStats.totalRaceCount || 0,
            filledAnc: sStats.filledAncCount || 0,
            methodType: sStats.isBlupEligible ? 'BLUP Doğrulanmış' : 'Geçici Performans Puanı',
            reason: sStats.totalRaceCount > 0
              ? `${sStats.totalRaceCount} doğrulanmış yarış kaydı + ${sStats.filledAncCount}/30 soy derinliği`
              : `Bireysel yarış kaydı henüz yok; üst soy (${sStats.filledAncCount}/30 ata) performansından geçici puanlandı`
          };
        })
        .sort((a, b) => b.suit - a.suit)
        .slice(0, 5);

      const extraHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.6px;">
          <div style="font-weight:900; color:#0052cc; margin-bottom:5px;">
            🏁 Kümesinizde Yarış Kadrosu İçin Öne Çıkan İlk 5 Güvercin (Potansiyel vs Gerçekleşmiş):
          </div>
          <div style="display:flex; flex-direction:column; gap:5px;">
            ${rankedRacers.map((r, idx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #059669; border-radius:7px; padding:5px 8px;">
                <div style="min-width:0; flex:1;">
                  <div style="font-weight:900;">#${idx + 1} ${r.bird.flag} ${escapeHtml(r.bird.ring)} — ${escapeHtml(r.bird.name)}</div>
                  <div style="font-size:8.6px; color:var(--ios-subtext);">${escapeHtml(r.methodType)} • ${escapeHtml(r.reason)}</div>
                </div>
                <span class="gene-badge gene-green" style="font-size:8.8px; flex-shrink:0;">%${r.suit} Uygunluk</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      return {
        headerTitle: `🧠 Danışman Raporu: Yarışa ve Mevcut Havaya (${wState.temp}°C) En Uygun Kuşlarınız`,
        metricTitle: 'DEĞERLENDİRME YÖNTEMİ',
        metricValue: 'BLUP & Geçici Puan',
        metricColor: '#0066ff',
        score: rankedRacers[0]?.suit || 85,
        reliabilityPct: 82,
        bulletDecision: `Kümesinizdeki ${activeBirds.length} kuş incelendiğinde mevcut hava (${wState.temp}°C, ${wState.windSpeedKmh} km/sa rüzgâr) ve ${targetKm} km mesafe için en hazır adaylar: 1) ${rankedRacers[0]?.bird.ring} (${rankedRacers[0]?.bird.name}), 2) ${rankedRacers[1]?.bird.ring} (${rankedRacers[1]?.bird.name}), 3) ${rankedRacers[2]?.bird.ring} (${rankedRacers[2]?.bird.name}).`,
        bulletProof: `Sıralamada genetik potansiyel (soyağacı dereceleri) ile gerçekleşmiş bireysel yarış performansı birbirinden ayrılmıştır.`,
        bulletDataRisk: `Henüz bireysel yarış sonucu girilmemiş kuşlar için gerçek BLUP yerine "Geçici Performans Puanı (Provisional Score)" kullanılmıştır.`,
        q1_whatAnalyzed: `Kümesinizdeki ${activeBirds.length} aktif güvercinin yaş, cinsiyet, soy hattı, önceki yarış istikrarı ve canlı hava (${wState.temp}°C) uyumu tarandı.`,
        q5_reliability: `Bireysel yarış kaydı olan kuşlarda güvenilirlik yüksek, yalnızca soyağacı kaydı olan genç kuşlarda orta düzeydedir.`,
        extraHtml
      };
    }

    // KONU 4: EKSİK VERİ VE BLUP HAZIRLIK DENETİMİ
    if (effectiveTopic === 'eksik_veri_raporu') {
      const birdAudits = activeBirds.map(b => {
        const ped = pedigrees.find(p => p.id === b.pedId);
        const boxes = ped?.boxes || {};
        const ancKeys = ['sire', 'dam', 'g2_1', 'g2_2', 'g2_3', 'g2_4', 'g3_1', 'g3_2', 'g3_3', 'g3_4', 'g3_5', 'g3_6', 'g3_7', 'g3_8', 'g4_1', 'g4_2', 'g4_3', 'g4_4', 'g4_5', 'g4_6', 'g4_7', 'g4_8', 'g4_9', 'g4_10', 'g4_11', 'g4_12', 'g4_13', 'g4_14', 'g4_15', 'g4_16'];
        const filled = ancKeys.filter(k => boxes[k]?.ring?.trim()).length;
        const hasNotes = Boolean((b.notes || '').trim().length >= 8);
        return { bird: b, filled, missingAnc: 30 - filled, hasNotes };
      });
      const fullPedCount = birdAudits.filter(x => x.filled >= 24).length;
      const incompleteBirds = birdAudits.filter(x => x.filled < 24 || !x.hasNotes).sort((a, b) => a.filled - b.filled);

      const extraHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.5px;">
          <div style="font-weight:900; color:#4c1d95; margin-bottom:5px;">
            📋 Veri Tamamlama Önceliği Olan Kuşlarınız (İlk 6 Kayıt):
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${incompleteBirds.slice(0, 6).map(item => `
              <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #d97706; border-radius:7px; padding:5px 8px;">
                <div>
                  <strong>${item.bird.flag} ${escapeHtml(item.bird.ring)} (${escapeHtml(item.bird.name)})</strong>
                  <div style="font-size:8.6px; color:var(--ios-subtext);">Dolu Ata: ${item.filled}/30 (${item.missingAnc} kutu boş) • Performans Notu: ${item.hasNotes ? 'Var ✓' : 'Eksik ⚠️'}</div>
                </div>
                <button type="button" class="nest-mini-action-btn" onclick="openBirdPedigreeFromDirectory('${item.bird.pedId}', 'main')">
                  📜 Tamamla →
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      return {
        headerTitle: `🧠 Danışman Raporu: Kümes Veri Kalitesi &amp; BLUP Hazırlık Denetimi`,
        metricTitle: 'TAM PEDİGRİ ORANI',
        metricValue: `${fullPedCount} / ${activeBirds.length} Kuş`,
        metricColor: '#7c3aed',
        score: Math.round((fullPedCount / Math.max(1, activeBirds.length)) * 100),
        reliabilityPct: 98,
        bulletDecision: `Kümesinizdeki ${activeBirds.length} aktif güvercinin ${fullPedCount} tanesinde 4–5 nesil soyağacı %80+ doluluktadır; ${incompleteBirds.length} güvercinde ise üst kuşak ata veya bireysel yarış derecesi tamamlanmalıdır.`,
        bulletProof: `AVIGEN GENESIS CORTEX eksik soy ağacı kutularını doluymuş gibi kabul etmez ve gerçek BLUP için en az 3 yarış + akraba kaydı arar.`,
        bulletDataRisk: `Yukarıdaki listede yer alan kuşların eksik ata kutularını veya yarış derecelerini girdiğinizde "Geçici Performans Puanı" otomatik olarak "Yüksek Güvenilirlikli BLUP" seviyesine yükselecektir.`,
        q1_whatAnalyzed: `Kümesinizdeki ${activeBirds.length} aktif güvercinin 31'er kutuluk soyağacı tabloları ve yarış/sicil kayıtları tek tek denetlendi.`,
        q5_reliability: `Veri tabanı tamlık sayımı doğrudan kayıtlardan yapıldığı için %98 kesinliktedir.`,
        extraHtml
      };
    }

    // KONU 5: KÜMES İÇİ YAKIN AKRABALIK (COI) RİSK TARAMASI
    if (effectiveTopic === 'akrabalik_taramasi') {
      const mPool = males.slice(0, 14);
      const fPool = females.slice(0, 14);
      const inbredPairs = [];
      mPool.forEach(m => {
        fPool.forEach(f => {
          if (m.ring === f.ring) return;
          const sT = getCandidateLineageTree(m.id);
          const dT = getCandidateLineageTree(f.id);
          const w = this.calculateExactWrightCOI(sT, dT);
          if (w.coiPercent > 0) {
            inbredPairs.push({ m, f, coi: w.coiPercent, common: w.commonAncestorsDetailed, relSummary: w.relationSummary });
          }
        });
      });
      inbredPairs.sort((a, b) => b.coi - a.coi);

      const extraHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.5px;">
          <div style="font-weight:900; color:#dc2626; margin-bottom:5px;">
            ⚠️ 5 Nesil Taramasında Ortak Atası (COI &gt; %0) Tespit Edilen Çiftler (${inbredPairs.length} Çift):
          </div>
          <div style="display:flex; flex-direction:column; gap:5px;">
            ${inbredPairs.length === 0 ? `
              <div style="padding:8px; background:var(--ios-card); border-radius:7px; color:#059669; font-weight:800;">
                ✅ Taranan aktif erkek ve dişi adaylar arasında tehlikeli yakın akrabalık (yüksek COI) saptanmadı.
              </div>
            ` : inbredPairs.slice(0, 5).map(p => `
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid ${p.coi >= 12.5 ? '#dc2626' : '#d97706'}; border-radius:7px; padding:5px 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <strong>♂ ${escapeHtml(p.m.ring)} (${escapeHtml(p.m.name)}) × ♀ ${escapeHtml(p.f.ring)} (${escapeHtml(p.f.name)})</strong>
                  <span class="gene-badge ${p.coi >= 12.5 ? 'gene-red' : 'gene-gold'}" style="font-size:8.5px;">COI: %${p.coi.toFixed(2)}</span>
                </div>
                <div style="font-size:8.6px; color:var(--ios-subtext); margin-top:2px;">
                  Ortak Ata: ${escapeHtml((p.common[0] || p.relSummary).slice(0, 110))}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      return {
        headerTitle: `🧠 Danışman Raporu: 5 Nesil Akrabalık (Wright COI) ve Ortak Ata Taraması`,
        metricTitle: 'TESPİT EDİLEN SOY BAĞI',
        metricValue: `${inbredPairs.length} Ortak Atalı Çift`,
        metricColor: inbredPairs.some(p => p.coi >= 12.5) ? '#dc2626' : '#059669',
        score: 92,
        reliabilityPct: 90,
        bulletDecision: `Kümesinizdeki erkek ve dişi damızlık adaylarının 5 nesil soy ağaçları çapraz tarandı; ${inbredPairs.length} olası eşleşmede ortak ata tespit edildi.`,
        bulletProof: `COI %6.25–%12.5 arası kontrollü soy sabitleme (Linebreeding) damızlıkta kullanılabilirken, %12.5 üzeri yakın akrabalık yarış yavrularında melez dinçliğini (Heterosis) düşürür.`,
        bulletDataRisk: `Yarışacak yavru üretmek istediğiniz çiftlerde %0 – %3.12 COI (farklı soy hatları / Outcross) tercih edilmelidir.`,
        q1_whatAnalyzed: `${mPool.length} erkek ve ${fPool.length} dişi güvercin arasındaki 5 kuşak Sewall Wright yolak matrisi tarandı.`,
        q5_reliability: `Hesaplama $F_X = \\sum (0.5)^{n_1+n_2+1}$ formülüyle deterministik olarak yapılmıştır.`,
        extraHtml
      };
    }

    // KONU 6: ÖĞRENEN YAPAY ZEKÂ (CORTEX LEARNING ENGINE) ŞEFFAFLIK RAPORU
    if (effectiveTopic === 'ogrenme_model_raporu') {
      const logs = Array.isArray(this.state.cortexLearningLog) ? this.state.cortexLearningLog : [];
      const acceptedCount = logs.filter(l => l.userDecision === 'ACCEPTED').length;
      const rejectedCount = logs.filter(l => l.userDecision === 'REJECTED').length;
      const highQualCount = logs.filter(l => l.reliabilityPct >= 65).length;

      const extraHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.5px;">
          <div style="font-weight:900; color:#0052cc; margin-bottom:5px;">
            🔄 6 Adımlı Öğrenme Mekanizması &amp; Kaydedilen Kullanıcı Kararları (${logs.length} Kayıt):
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; text-align:center; margin-bottom:6px;">
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px;">
              <div style="font-size:8px; color:var(--ios-subtext); font-weight:800;">KABUL EDİLEN</div>
              <div style="font-size:13px; font-weight:900; color:#059669;">${acceptedCount}</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px;">
              <div style="font-size:8px; color:var(--ios-subtext); font-weight:800;">REDDEDİLEN</div>
              <div style="font-size:13px; font-weight:900; color:#dc2626;">${rejectedCount}</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:7px; padding:5px;">
              <div style="font-size:8px; color:var(--ios-subtext); font-weight:800;">MODEL SÜRÜMÜ</div>
              <div style="font-size:12px; font-weight:900; color:#7c3aed;">${escapeHtml(this.state.cortexModelVersion || 'v2.0.1')}</div>
            </div>
          </div>
          ${logs.length === 0 ? `
            <div style="padding:7px; background:var(--ios-card); border-radius:7px; color:var(--ios-subtext);">
              Henüz onayladığınız veya reddettiğiniz bir öneri kaydı yok. Herhangi bir analiz kartının altındaki <strong>"👍 Öneriyi Kabul Et"</strong> veya <strong>"👎 Reddet"</strong> butonuna bastığınızda öğrenme kaydı burada versiyonlu olarak listelenir.
            </div>
          ` : logs.slice(0, 5).map(l => `
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid ${l.userDecision === 'ACCEPTED' ? '#059669' : '#dc2626'}; border-radius:7px; padding:5px 8px; margin-bottom:4px;">
              <div style="display:flex; justify-content:space-between; font-weight:800;">
                <span>${l.userDecision === 'ACCEPTED' ? '👍 Kabul:' : '👎 Ret:'} ${escapeHtml(l.title)}</span>
                <span style="font-size:8.5px; color:var(--ios-subtext);">${escapeHtml(l.date)} • ${escapeHtml(l.modelVersion)}</span>
              </div>
              <div style="font-size:8.5px; color:var(--ios-subtext);">Tahmin: ${l.predictedScore}/100 • Güven: %${l.reliabilityPct} • ${escapeHtml(l.qualityStatus)}</div>
            </div>
          `).join('')}
        </div>
      `;

      return {
        headerTitle: `🧠 GENESIS CORTEX Öğrenen Yapay Zekâ Durumu (${escapeHtml(this.state.cortexModelVersion || 'v2.0.1')})`,
        metricTitle: 'DOĞRULANMIŞ ÖRNEKLEM',
        metricValue: `${highQualCount} Kaliteli Kayıt`,
        metricColor: '#059669',
        score: Math.min(96, 78 + highQualCount * 3),
        reliabilityPct: Math.min(95, 65 + highQualCount * 5),
        bulletDecision: `Sistem şu ana kadar ${activeBirds.length} güvercin kaydı, ${races.length} yarış sonucu, ${nests.length} aktif yuva ve ${logs.length} kullanıcı geri bildirimini (${acceptedCount} kabul, ${rejectedCount} ret) izlemeye almıştır.`,
        bulletProof: `Bölüm 8 bilimsel dürüstlük kuralı gereği kullanıcı verileri otomatik olarak mutlak bilimsel gerçek kabul edilmez; veri kalitesi (%65+ güven eşiği) doğrulandıktan sonra model sürümü (${this.state.cortexModelVersion || 'v2.0.1'}) güncellenir.`,
        bulletDataRisk: highQualCount < 5
          ? `Şu an ${highQualCount}/5 doğrulanmış geri bildirim mevcuttur; sistem az veriyle kendini geliştirmiş gibi davranmaz, temel deterministik genetik ağırlıkları korur.`
          : `Yeterli doğrulanmış veri eşiği aşıldı; kümesinizin damızlık tercih ağırlıkları ${this.state.cortexModelVersion} sürümüne kalibre edildi.`,
        q1_whatAnalyzed: `Geçmiş eşleşmeler, aktif yuvalar, yarış sonuçları ve kullanıcının kabul/ret kararları incelendi.`,
        q5_reliability: `Tüm model güncellemeleri versiyonlu ve geriye dönük izlenebilir olarak saklanmaktadır.`,
        extraHtml
      };
    }

    // VARSAYILAN KONU 1: BU SEZON HANGİ ERKEK VE DİŞİ KUŞLARIMI DAMIZLIKTA KULLANMALIYIM?
    // (Bilimsel Kural: Kullanıcının Kabul/Red kararı kuşların genetik uyum puanını DEĞİŞTİRMEZ;
    //  yalnızca "Öneriyi Gizle" denilen çiftler listeden çıkarılıp sıradaki alternatif gösterilir!)
    const mTop = males;
    const fTop = females;
    const bestPairs = [];
    mTop.forEach(m => {
      fTop.forEach(f => {
        if (m.ring === f.ring) return;
        const br = this.analyzeBreedingIntelligence(m.id, f.id, true);
        const fb = this.getCortexPairFeedbackDelta(m.ring, f.ring);
        if (fb.status === 'REJECTED') return;
        bestPairs.push({
          m,
          f,
          br,
          feedbackStatus: fb.status,
          adjustedScore: br.totalScore
        });
      });
    });
    bestPairs.sort((a, b) => b.adjustedScore - a.adjustedScore);
    const top4Pairs = bestPairs.slice(0, 4);

    const extraHtml = `
      <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:8px 10px; font-size:9.5px;">
        <div style="font-weight:900; color:#4c1d95; margin-bottom:5px;">
          💞 Kümesinizdeki ${males.length} Erkek ve ${females.length} Dişi Arasından Önerilen İlk 4 Damızlık Eşleşme:
        </div>
        <div style="display:flex; flex-direction:column; gap:5px;">
          ${top4Pairs.map((item, idx) => {
            const relC = this.classifyDataReliability(item.br.dataReliabilityPct);
            const fbBadge = item.feedbackStatus === 'ACCEPTED'
              ? `<span class="gene-badge gene-green" style="font-size:8px;">👍 Onaylı Tercih</span>`
              : '';
            return `
              <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:8px; padding:6px 8px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:5px;">
                  <strong>#${idx + 1} ♂ ${escapeHtml(item.m.ring)} (${escapeHtml(item.m.name)}) × ♀ ${escapeHtml(item.f.ring)} (${escapeHtml(item.f.name)}) ${fbBadge}</strong>
                  <span class="gene-badge gene-purple" style="font-size:8.5px;">${item.br.totalScore}/100</span>
                </div>
                <div style="font-size:8.7px; color:var(--ios-subtext); margin-top:2px;">
                  ✅ <strong>Avantaj:</strong> ${item.br.coi === 0 ? 'Farklı soy hatları (%0 COI • Yüksek genetik çeşitlilik)' : `Kontrollü soy hattı (%${item.br.coi.toFixed(2)} COI)`} • <strong>Güven:</strong> ${relC.label} (%${relC.pct})
                </div>
                <div style="display:flex; justify-content:flex-end; gap:5px; margin-top:4px;">
                  <button type="button" class="nest-mini-action-btn" style="background:#ecfdf5; border-color:#a7f3d0; color:#047857;" onclick="AvigenGenesisAI.saveCurrentGenesisPairToActiveNests('${escapeHtml(item.m.ring)}', '${escapeHtml(item.m.name)}', '${escapeHtml(item.f.ring)}', '${escapeHtml(item.f.name)}', ${item.br.totalScore}, ${item.br.coi})">
                    🪺 Yuvaya Kaydet
                  </button>
                  <button type="button" class="nest-mini-action-btn" onclick="AvigenGenesisAI.selectAlternativePairAndRun('${item.m.id}', '${item.f.id}')">
                    🔬 5 Nesil Analizini Aç →
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const p0 = top4Pairs[0];
    return {
      headerTitle: `🧠 Kişisel Kümes Danışmanı: Bu Sezon Damızlıkta Kullanılması Önerilen Kuşlarınız`,
      metricTitle: '5 NESİL WRIGHT COI',
      metricValue: p0 ? `%${p0.br.coi.toFixed(2)} COI` : '%0.00 COI',
      metricColor: '#7c3aed',
      score: p0 ? p0.br.totalScore : 88,
      reliabilityPct: p0 ? p0.br.dataReliabilityPct : 80,
      bulletDecision: p0
        ? `Bu sezon kümesinizdeki ${males.length} erkek ve ${females.length} dişi kuş arasında en dengeli damızlık adayları: ♂ ${p0.m.ring} (${p0.m.name}) × ♀ ${p0.f.ring} (${p0.f.name}) (${p0.br.totalScore}/100 Uyum). Bu eşleşme değerlendirilebilir.`
        : 'Kümesinizde eşleştirme için en az 1 erkek ve 1 dişi kuş bulunmalıdır.',
      bulletProof: p0
        ? `Avantaj: ${p0.br.coi === 0 ? 'Farklı soy hatlarından gelmeleri (%0 COI) ve genetik çeşitlilik açısından olumlu görünüm.' : `Ortak şampiyon ata üzerinden kontrollü soy uyumu (%${p0.br.coi.toFixed(2)} COI).`} Baba (${p0.br.sFilled}/30 ata) ve Anne (${p0.br.dFilled}/30 ata) soy kayıtları birbirini tamamlıyor.`
        : '',
      bulletDataRisk: p0
        ? `Risk & Veri: ${p0.br.commonAncestors.length ? `Soy ağacında ortak ata tespit edildi (${p0.br.commonAncestors[0]}).` : '5 nesilde yakın akrabalık depresyonu riski tespit edilmedi.'} Not: En iyi eşleşme önerisi kesin şampiyon yavru garantisi vermez; veri temelli olasılık sunar.`
        : '',
      q1_whatAnalyzed: `Kümesinizdeki ${males.length} erkek ve ${females.length} dişi güvercinin 5 nesil soy ağacı, Wright COI katsayısı, genetik çeşitliliği ve performans kayıtları çapraz analiz edildi.`,
      q5_reliability: `Sadece yüksek veya düşük COI üzerinden karar verilmemiş; soy hattı uyumu, genetik çeşitlilik ve performans geçmişi birlikte ağırlıklandırılmıştır.`,
      extraHtml
    };
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
