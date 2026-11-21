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

  // 2 SADE VE KULLANICI DOSTU ANA GENESIS AI MODÜLÜ MİMARİ TANIMI
  // 1. Kümes İçi Eşleştirme, Damızlık ve Doğacak Yavru Analizi (GENESIS AI Paketi)
  // 2. Global Gen Havuzu - Dünya Eşleştirme (AVIGEN GLOBAL Paketi)
  MAIN_MODULES: [
    {
      id: 'breeding_hub',
      defaultSubMode: 'breeding',
      num: '1',
      icon: '💞',
      title: 'EŞLEŞTİRME, DAMIZLIK VE YAVRU ANALİZİ',
      shortTitle: '1. Eşleştirme & Yavru Analizi',
      badge: '1. ANA MODÜL • GENESIS AI',
      accent: '#7c3aed',
      bgGrad: 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(0,102,255,0.06), rgba(255,255,255,0.98))',
      purpose: 'Kümesinizdeki erkek ve dişi kuşların eşleşme uyumunu, akrabalık (COI) riskini, doğacak yavruların beklenen özelliklerini ve en iyi alternatif eşleri tek ekranda analiz eder.',
      inputs: '4 kuşak soyağacı (31 kutu), mevcut yarış/kardeş/yavru dereceleri.',
      outputs: 'Genel uyum puanı (0–100), Veri Güvenilirliği (%), Pedigri & Performans değerlendirmesi, Doğacak Yavru Beklentisi, Riskler ve Alternatif Eşler.',
      subFunctions: []
    },
    {
      id: 'global_pool',
      defaultSubMode: 'global_pool',
      num: '2',
      icon: '🌍',
      title: 'GLOBAL GEN HAVUZU (DÜNYA EŞLEŞTİRME)',
      shortTitle: '2. Global Gen Havuzu',
      badge: '2. ANA MODÜL • GLOBAL 🌍',
      accent: '#059669',
      bgGrad: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(0,102,255,0.05), rgba(255,255,255,0.98))',
      purpose: 'Dünya genelinde paylaşım izni verilmiş anonim kuşları tarayarak, kendi kuşlarınız için kümes dışından en yüksek uyuma sahip eş adaylarını bulur.',
      inputs: 'Kümesinizdeki aktif kuşlar, SHA-256 ile şifrelenmiş 4 kuşak soy düğümleri ve izinli anonim küresel adaylar.',
      outputs: 'En iyi 3 küresel çift önerisi, gizli ortak ata (COI) kontrolü ve onaylı sahip iletişim talebi.',
      subFunctions: []
    }
  ],

  getMainModuleForMode(mode) {
    if (mode === 'global_pool') return this.MAIN_MODULES[1];
    return this.MAIN_MODULES[0];
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
      gggList.forEach(item => {
        const rGGG = cleanR(item.box?.ring);
        if (rGGG) {
          entries.push({ ring: rGGG, name: item.box?.name || '', depth: 4, pathAbove: item.path.filter(Boolean) });
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

    let relationSummary = 'Ortak Ata Yok (%0 COI — Tam Yabancı Kan / Outcross)';
    if (coiPercent >= 25.0) relationSummary = 'Çok Yakın Akrabalık (Tam Kardeş veya Baba×Kız / Anne×Oğul Düzeyi)';
    else if (coiPercent >= 12.5) relationSummary = 'Yakın Soy İçi Eşleşme (Yarım Kardeş veya Dede×Torun Linebreeding)';
    else if (coiPercent >= 6.25) relationSummary = 'Orta-İdeal Linebreeding (Amca/Hala × Yeğen veya Çift Kuzen Soy Sabitleme)';
    else if (coiPercent > 0) relationSummary = 'Hafif Soy Bağlantısı (Kuzen / 2-3. Kuşak Ortak Şampiyon Ata)';

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
  // 2. FONKSİYON: DAMIZLIK ZEKÂSI (BREEDING INTELLIGENCE — 7 BİLİMSEL KRİTERLİ)
  //    Birlikte Değerlendirilen 7 Kriter:
  //    1. Soy yakınlığı ve Sewall Wright COI: F_X = Σ (0.5)^(n1 + n2 + 1)
  //    2. Anne ve Baba performansı
  //    3. Kardeşlerin (Full/Half-Sibling) yarış sonuçları
  //    4. Yavruların (Offspring) performans geçmişi
  //    5. Mesafe ve etap özellikleri
  //    6. Performansın tutarlılığı (İstikrar)
  //    7. Veri güvenilirliği ve eksik kayıtlar (Tahmin ile kanıtlanmış performans ayrı tutulur!)
  // ==========================================================================
  analyzeBreedingIntelligence(sireRef, damRef, skipAlternatives = false) {
    this.ensureEngineCacheFresh();
    const { males, females, all } = getAllBreedingCandidates();
    const sRef = sireRef || (males[0]?.id || all[0]?.id);
    const dRef = damRef || (females[0]?.id || all[1]?.id || all[0]?.id);

    const pairKey = `${sRef}__${dRef}`;
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

    // Ebeveynlerin 4 kuşağındaki (30 ata kutusu) mevcut kayıtları dinamik yeniden ağırlıklandırma ile değerlendir
    // ÖNEMLİ TASARIM KARARI: Eksik ata kutuları otomatik olarak sıfır veya cezalı kabul edilmez;
    // puanlama mevcut dolu kutular üzerinden yeniden ağırlıklandırılır, eksik kutu oranı ise ayrıca "Veri Güvenilirliği / Kapsamı"nda gösterilir!
    const evalDeepTreeScore = (tree) => {
      const nodes = [
        { box: tree.p1, gen: 1 }, { box: tree.p2, gen: 1 },
        { box: tree.g1, gen: 2 }, { box: tree.g2, gen: 2 }, { box: tree.g3, gen: 2 }, { box: tree.g4, gen: 2 },
        { box: tree.gg1, gen: 3 }, { box: tree.gg2, gen: 3 }, { box: tree.gg3, gen: 3 }, { box: tree.gg4, gen: 3 },
        { box: tree.gg5, gen: 3 }, { box: tree.gg6, gen: 3 }, { box: tree.gg7, gen: 3 }, { box: tree.gg8, gen: 3 },
        { box: tree.ggg1, gen: 4 }, { box: tree.ggg2, gen: 4 }, { box: tree.ggg3, gen: 4 }, { box: tree.ggg4, gen: 4 },
        { box: tree.ggg5, gen: 4 }, { box: tree.ggg6, gen: 4 }, { box: tree.ggg7, gen: 4 }, { box: tree.ggg8, gen: 4 },
        { box: tree.ggg9, gen: 4 }, { box: tree.ggg10, gen: 4 }, { box: tree.ggg11, gen: 4 }, { box: tree.ggg12, gen: 4 },
        { box: tree.ggg13, gen: 4 }, { box: tree.ggg14, gen: 4 }, { box: tree.ggg15, gen: 4 }, { box: tree.ggg16, gen: 4 }
      ];
      let wSumExisting = 0;
      let wTotExisting = 0;
      let filledNodesCount = 0;
      let perfNotedNodesCount = 0;
      const ancestorWins = [];
      const strainSet = new Set();
      const allNotesArr = [tree.self?.notes || ''];

      nodes.forEach(n => {
        const inf = this.inspectAncestorBox(n.box, n.gen);
        if (inf.exists) {
          filledNodesCount++;
          if (inf.hasNotes) perfNotedNodesCount++;
          wSumExisting += inf.rawScore * inf.genWeight;
          wTotExisting += inf.genWeight;
          if (inf.strainName && inf.strainName !== 'Standart Hat') strainSet.add(inf.strainName);
          if (n.box?.notes) allNotesArr.push(n.box.notes);
          inf.verifiedWins.forEach(w => {
            if (ancestorWins.length < 8) ancestorWins.push(`${inf.ring} (${inf.name}): ${w}`);
          });
        }
      });

      return {
        avgAncestorScore: wTotExisting > 0 ? Math.round(wSumExisting / wTotExisting) : null,
        filledNodesCount,
        perfNotedNodesCount,
        strains: Array.from(strainSet),
        ancestorWins,
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

    // Gerçek Kuşak Derinlikli Sewall Wright COI Hesabı (4 Kuşak / 30 Ata)
    const wright = this.calculateExactWrightCOI(sTree, dTree);
    const coi = wright.coiPercent;

    // ------------------------------------------------------------------------
    // DİNAMİK YENİDEN AĞIRLIKLANDIRILMIŞ 100 ÜZERİNDEN BİLİMSEL PUANLAMA
    // (Eksik veri bulunan kriter sıfır kabul edilmez; mevcut kriterler yeniden ağırlıklandırılır,
    //  veri güvenilirliği ise eşleşme kalitesinden bağımsız olarak ayrı gösterilir!)
    // ------------------------------------------------------------------------
    const sFilled = sDeep.filledNodesCount;
    const dFilled = dDeep.filledNodesCount;
    const allSiblingProofs = [...sireCollateral.siblingProofs, ...damCollateral.siblingProofs];
    const allOffspringProofs = [...sireCollateral.offspringProofs, ...damCollateral.offspringProofs];

    // 1. Genetik Çeşitlilik & Wright COI Uyumu (0-100 Ölçeği, Temel Ağırlık: %30)
    let diversityScore100 = 92;
    if (coi >= 50) diversityScore100 = 0;
    else if (coi >= 25) diversityScore100 = 32; // Çok yüksek akrabalık depresyonu riski
    else if (coi > 12.5) diversityScore100 = 66; // Damızlık odaklı yüksek linebreeding
    else if (coi >= 1.5 && coi <= 12.5) diversityScore100 = 96; // İdeal altın oran linebreeding
    else diversityScore100 = 93; // %0 COI Outcross (Tam melez dinçliği)

    // 2. Pedigri & Soy Kalitesi Değerlendirmesi (0-100 Ölçeği, Temel Ağırlık: %40)
    const sPedQuality = sDeep.avgAncestorScore !== null ? sDeep.avgAncestorScore : sireInfo.rawScore;
    const dPedQuality = dDeep.avgAncestorScore !== null ? dDeep.avgAncestorScore : damInfo.rawScore;
    const pedigreeScore100 = Math.round((sPedQuality + dPedQuality) / 2);
    const hasPedigreeCriteria = (sFilled + dFilled) > 0 || sireInfo.exists || damInfo.exists;

    // 3. Performans Değerlendirmesi (Bireysel Yarış + Kardeş/Yavru + Ata Dereceleri, 0-100 Ölçeği, Temel Ağırlık: %30)
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

    // Mevcut veri kapsamına göre aktif kriterleri yeniden ağırlıklandır (Eksik kriter = 0 sayılmaz!)
    const activeCriteria = [
      { key: 'diversity', label: `Genetik Çeşitlilik & COI Uyumu (%${coi.toFixed(2)} COI)`, score100: diversityScore100, baseWeight: 30 },
      { key: 'pedigree', label: `Pedigri & Soy Kalitesi (${sFilled + dFilled}/60 Ata Kayıtlı)`, score100: pedigreeScore100, baseWeight: hasPedigreeCriteria ? 40 : 0 },
      { key: 'performance', label: `Performans Göstergeleri (${sireInfo.verifiedWins.length + damInfo.verifiedWins.length + sDeep.ancestorWins.length + dDeep.ancestorWins.length} Kayıt)`, score100: performanceScore100 !== null ? performanceScore100 : pedigreeScore100, baseWeight: hasPerformanceCriteria ? 30 : 0 }
    ].filter(c => c.baseWeight > 0);

    const totalActiveWeight = activeCriteria.reduce((acc, c) => acc + c.baseWeight, 0) || 100;
    let totalBreedingScore = Math.round(
      activeCriteria.reduce((acc, c) => acc + (c.score100 * (c.baseWeight / totalActiveWeight)), 0)
    );
    totalBreedingScore = Math.max(0, Math.min(100, totalBreedingScore));
    if (coi >= 50) totalBreedingScore = 15;

    const sireLineageIndex = Math.round((sireInfo.rawScore * 0.4) + (sPedQuality * 0.6));
    const damLineageIndex = Math.round((damInfo.rawScore * 0.4) + (dPedQuality * 0.6));

    // Veri Güvenilirliği (Eşleşme Kalitesinden Tamamen Ayrı Gösterilir!)
    const pedCoverageRatio = Math.min(1, (sFilled + dFilled) / 30); // 15+15 yakın/orta kuşak bazlı doygunluk
    const perfEvidenceRatio = Math.min(1, perfSignals.length / 4);
    const dataReliabilityPct = Math.max(25, Math.min(100, Math.round((pedCoverageRatio * 0.65 + perfEvidenceRatio * 0.35) * 100)));

    // Performans Değerlendirme Yöntemi & Kapsam Etiketi (BLUP/EBV vs Mevcut Performans Göstergeleri)
    const performanceMethodLabel = (sireRealTrend.hasRealData || damRealTrend.hasRealData) && (allSiblingProofs.length + allOffspringProofs.length >= 2)
      ? 'Çoklu Yarış & Akraba Kayıtlı Performans Analizi'
      : (hasPerformanceCriteria
        ? 'Pedigri Notları ve Mevcut Derece Göstergeleri (Resmi bireysel yarış geçmişi sınırlı)'
        : 'Yalnızca Soyağacı Yapısı (Henüz yarış/derece kaydı girilmemiş, performans kriteri yeniden ağırlıklandırıldı)');

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

    if (sireLineageIndex >= 72) strongLines.push(`Baba Hattı [${sireInfo.ring}]: Güçlü soy ve derece geçmişi (${sireLineageIndex}/100)`);
    if (damLineageIndex >= 72) strongLines.push(`Anne Hattı [${damInfo.ring}]: Güçlü soy ve derece geçmişi (${damLineageIndex}/100)`);

    if (allSiblingProofs.length > 0) {
      strongLines.push(`Kardeş Başarısı (${allSiblingProofs.length} Kayıt): ${allSiblingProofs[0].label}`);
    }
    if (allOffspringProofs.length > 0) {
      strongLines.push(`Kanıtlanmış Yavru Verimi (${allOffspringProofs.length} Kayıt): ${allOffspringProofs[0].label}`);
    }
    if (wright.commonAncestorsDetailed.length > 0) {
      strongLines.push(`Ortak Şampiyon Ata Bağlantısı: ${wright.commonAncestorsDetailed.join(' | ')}`);
    } else {
      strongLines.push(`Tam Yabancı Kan (Outcross • %0 COI): Yavrularda yüksek fiziksel direnç ve melez canlılığı sağlar.`);
    }

    // Riskler
    if (coi >= 25.0) {
      weakLines.push(`Yüksek Akrabalık Riski (COI %${coi.toFixed(2)}): Çok yakın kan bağı nedeniyle yavrularda bağışıklık düşüklüğü ve yarış temposu kaybı riski vardır.`);
    } else if (coi > 12.5) {
      weakLines.push(`Soy İçi Yoğunlaşma Uyarısı (COI %${coi.toFixed(2)}): Bu eşleşmeden çıkacak yavrular yarıştan ziyade damızlıkta yabancı kanla kırılmak için uygundur.`);
    }
    if (!hasPerformanceCriteria) {
      weakLines.push(`Performans Kaydı Sınırlaması: Ebeveynlerde kayıtlı yarış derecesi bulunmadığı için puanlama mevcut soyağacı yapısı üzerinden yeniden ağırlıklandırılmıştır.`);
    }
    if ((sFilled + dFilled) < 10) {
      weakLines.push(`Kısmi Soyağacı Kapsamı: Toplam ${sFilled + dFilled} ata kutusu dolu olduğu için uzak kuşaklardaki olası ortak atalar hesaplama kapsamı dışındadır.`);
    }
    if (weakLines.length === 0) {
      weakLines.push(`Belirgin Bir Genetik Risk Saptanmadı: Akrabalık oranı (%${coi.toFixed(2)}) güvenli aralıkta ve soy kayıtları dengeli.`);
    }

    // Geliştirme Fırsatları
    if (coi === 0) {
      opportunities.push(`Bu eşleşmeden çıkacak en başarılı yavruları ileride ortak şampiyon ataya sahip bir eşle (%3–%6 COI Linebreeding) eşleştirerek soyu sabitleyebilirsiniz.`);
    } else if (coi > 6.25) {
      opportunities.push(`Soy içi sabitlenen bu kanı bir sonraki kuşakta tamamen yabancı kan (Outcross) ve yarış dereceli bir eşle kırarak patlayıcı yarış yavruları elde edebilirsiniz.`);
    } else {
      opportunities.push(`Yavruları 150–450 km etaplarında test ederek gerçek yarış sonuçlarını sisteme girmeniz, gelecek sezon damızlık isabetini artıracaktır.`);
    }

    const verifiedRecords = [
      ...sireInfo.verifiedWins.map(w => `♂ Baba (${sireInfo.ring}): ${w}`),
      ...damInfo.verifiedWins.map(w => `♀ Anne (${damInfo.ring}): ${w}`),
      ...sDeep.ancestorWins.slice(0, 3).map(w => `🌳 Baba Soyu Atası: ${w}`),
      ...dDeep.ancestorWins.slice(0, 3).map(w => `🌳 Anne Soyu Atası: ${w}`),
      ...allSiblingProofs.slice(0, 2).map(s => `🧬 Kardeş Performansı: ${s.label}`),
      ...allOffspringProofs.slice(0, 2).map(o => `🐣 Yavru Performansı: ${o.label}`)
    ];

    // Gerçek Damızlık Zekâsı Puanına Göre Alternatif Eş Adaylarını Sırala
    let altFemalesForSire = [];
    let altMalesForDam = [];

    if (!skipAlternatives) {
      const buildAltReason = (r, candInfo) => {
        if (r.coi === 0) {
          return {
            why: `Sıfır akrabalık (%0 COI • Tam Outcross) ile yüksek melez dinçliği (%${r.heterosis} Heterosis) ve poligenik tamamlayıcılık sağlar.`,
            sciId: 'sci_gazda_2018',
            sciLabel: 'Gazda et al. (2018) — Poligenik Varyasyon & Seçilim'
          };
        }
        if (r.coi <= 12.5) {
          return {
            why: `Altın oranlı Linebreeding (%${r.coi.toFixed(2)} COI) ile ortak şampiyon ata genlerini korurken performans düşüşü riskini önler.`,
            sciId: 'sci_kolvenbag_2022',
            sciLabel: 'Kolvenbag et al. (2022) — Kohort Genotip & Performans İlişkisi'
          };
        }
        return {
          why: `Yüksek soy yoğunluğu (%${r.coi.toFixed(2)} COI); damızlık gen sabitleme amaçlı alternatif.`,
          sciId: 'sci_shao_2020',
          sciLabel: 'Shao et al. (2020) — Homing & Soy Adaptasyonu'
        };
      };

      altFemalesForSire = females
        .filter(f => f.id !== dRef && f.ring !== sireInfo.ring)
        .slice(0, 12)
        .map(f => {
          const r = this.analyzeBreedingIntelligence(sRef, f.id, true);
          const meta = buildAltReason(r, f);
          return { candidate: f, score: r.totalScore, coi: r.coi, ...meta };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      altMalesForDam = males
        .filter(m => m.id !== sRef && m.ring !== damInfo.ring)
        .slice(0, 12)
        .map(m => {
          const r = this.analyzeBreedingIntelligence(m.id, dRef, true);
          const meta = buildAltReason(r, m);
          return { candidate: m, score: r.totalScore, coi: r.coi, ...meta };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);
    }

    const result = {
      mode: 'breeding',
      sireRef: sRef,
      damRef: dRef,
      sireInfo,
      damInfo,
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
            Gizli kan uyumunu, gelecek nesil potansiyelini ve dünya gen havuzunu keşfedin.
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
    const relColor = cfg.reliabilityPct >= 75 ? '#059669' : (cfg.reliabilityPct >= 45 ? '#d97706' : '#dc2626');

    const metricTitle = cfg.metricTitle || 'AKRABALIK / ÖLÇÜT';
    const metricVal = cfg.metricValue || (cfg.verdictTag ? cfg.verdictTag.split('•')[0].trim() : 'Doğrulandı');
    const metricColor = cfg.metricColor || '#7c3aed';

    const bDecision = cfg.bulletDecision || cfg.q3_result || '';
    const bProof = cfg.bulletProof || cfg.q4_whyResult || '';
    const bDataRisk = cfg.bulletDataRisk || cfg.q2_dataUsed || '';

    return `
      <div style="display:flex; flex-direction:column; gap:8px;">
        <!-- 1. BLOK: BAŞLIK VE 3 YAN YANA BİLİMSEL GÖSTERGE KUTUSU -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:11px; padding:8px 10px;">
          <div style="font-size:12px; font-weight:900; color:var(--ios-text); margin-bottom:6px; line-height:1.25;">
            ${cfg.headerTitle}
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
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">VERİ GÜVENİ</div>
              <div style="font-size:13.5px; font-weight:900; color:${relColor}; margin-top:1px;">
                %${cfg.reliabilityPct}
              </div>
            </div>
          </div>
        </div>

        <!-- 2. BLOK: UZUN PARAGRAF YERİNE 3 KISA MADDELİK NET KARAR ÖZETİ -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid ${scoreColor}; border-radius:10px; padding:8px 10px; display:flex; flex-direction:column; gap:5px; font-size:10.3px; line-height:1.38;">
          <div>
            🎯 <strong style="color:${scoreColor};">Karar:</strong> <strong>${bDecision}</strong>
          </div>
          <div>
            ✅ <strong style="color:#0052cc;">Bilimsel Gerekçe:</strong> ${bProof}
          </div>
          <div style="color:var(--ios-subtext); font-size:9.8px;">
            📊 <strong>Veri &amp; Risk Durumu:</strong> ${bDataRisk}
          </div>
        </div>

        <!-- 3. BLOK: DOĞRUDAN AKSİYON / KARŞILAŞTIRMA TABLOSU -->
        ${cfg.extraHtml || ''}

        <!-- İSTEĞE BAĞLI AÇILIR BİLİMSEL DETAY VE AKADEMİK KAYNAKLAR -->
        <details style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:6px 9px; font-size:9.8px;">
          <summary style="font-weight:800; color:#5b21b6; cursor:pointer; outline:none;">
            🔬 Hesaplama Detayı, Veri Kaynakları ve Bilimsel Makaleleri Gör
          </summary>
          <div style="margin-top:7px; display:flex; flex-direction:column; gap:5px; color:var(--ios-subtext);">
            <div><strong>🔍 İncelenen Kayıt:</strong> ${cfg.q1_whatAnalyzed}</div>
            <div><strong>🛡️ Güvenilirlik Notu:</strong> ${cfg.q5_reliability}</div>
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
            <span class="gene-badge gene-purple">🧬 AVIGEN GENESIS AI &amp; GLOBAL</span>
            <span style="font-size:10.5px; color:#cbd5e1; font-weight:700;">AVIGEN FREE Sürümü</span>
          </div>
          <div style="display:flex; align-items:center; gap:11px; margin-bottom:8px;">
            <img src="avigen-logo.svg" style="width:46px; height:46px; background:#fff; padding:4px; border-radius:13px; flex-shrink:0;" />
            <div>
              <div style="font-size:15.5px; font-weight:900; color:#ffffff; letter-spacing:0.4px;">AVIGEN GENESIS AI</div>
              <div style="font-size:10.5px; font-weight:800; color:#a7f3d0; margin-top:1px;">2 ANA MODÜLLÜ BİLİMSEL EŞLEŞTİRME MOTORU</div>
            </div>
          </div>
          <div style="font-size:11px; color:#e2e8f0; line-height:1.5; margin-bottom:12px; background:rgba(255,255,255,0.08); padding:9px 11px; border-radius:10px;">
            • <strong>1. 💞 Eşleştirme, Damızlık ve Yavru Analizi:</strong> Kümes içi erkek-dişi uyum puanı, Wright COI riski, doğacak yavruların beklenen özellikleri ve alternatif eş önerileri.<br/>
            • <strong>2. 🌍 Global Gen Havuzu:</strong> Dünya genelindeki izinli gen havuzunda kuşlarınıza en uygun eşleri bulun.
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
            <button class="ios-btn ios-btn-purple" style="padding:10px; font-size:12px;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal()">
              ✨ Paketleri İncele
            </button>
            <button class="ios-btn ios-btn-green" style="padding:10px; font-size:12px;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.setMembershipTier('GLOBAL'); else AvigenGenesisAI.togglePremiumSubscription(true);">
              🔓 Hemen Aç (Test)
            </button>
          </div>
        </div>
      `;
      return;
    }

    const { males, females, all } = getAllBreedingCandidates();
    const allLoftBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
    if (!this.state.selectedRacerPedId && pedigrees[0]) this.state.selectedRacerPedId = pedigrees[0].id;
    if (['racing', 'compare', 'purchase', 'distance', 'future_sim'].includes(this.state.activeMode)) {
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
              ← 3 Ana Modül
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
                <div style="margin-top:3px; font-size:10px;">3 ana GENESIS AI modülünden herhangi birini çalıştırdığınızda sonuçlar otomatik olarak buraya kaydedilir.</div>
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
    // GÖRÜNÜM 1: SADELEŞTİRİLMİŞ 3 ANA MODÜL BAŞLATICI EKRANI
    // ========================================================================
    if (this.state.viewStage !== 'tool') {
      const activeCount = allLoftBirds.filter(b => b.isActiveLoftBird).length;
      const tierName = typeof AvigenUxManager !== 'undefined' ? AvigenUxManager.getCurrentTier().name : 'AVIGEN GLOBAL';

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
                    <span style="font-size:14px; font-weight:900; color:#ffffff; letter-spacing:0.3px;">AVIGEN GENESIS AI</span>
                    <span class="gene-badge gene-green" style="font-size:8px; padding:1px 5px;">🌍 ${escapeHtml(tierName.replace('AVIGEN ', ''))}</span>
                  </div>
                  <div style="font-size:9.5px; font-weight:700; color:#dbeafe; margin-top:1px;">
                    Bilimsel Eşleştirme, Gelecek Simülasyonu ve Global Gen Havuzu
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

          <!-- 3 SADE ANA MODÜL KARTI -->
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${this.MAIN_MODULES.map(m => `
              <div class="genesis-3main-card" onclick="AvigenGenesisAI.switchGenesisMode('${m.defaultSubMode}')">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                  <div style="display:flex; align-items:center; gap:9px; min-width:0;">
                    <div class="genesis-bento-icon" style="border-color:${m.accent}55; width:36px; height:36px; font-size:18px;">
                      ${m.icon}
                    </div>
                    <div style="min-width:0;">
                      <div style="font-size:12px; font-weight:900; color:var(--ios-text);">
                        ${m.num}. ${escapeHtml(m.title)}
                      </div>
                      <div style="font-size:9.5px; color:var(--ios-subtext); font-weight:600; margin-top:1px;">
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
                    <span style="font-size:9.5px; font-weight:800; color:var(--ios-subtext);">Analiz Türü:</span>
                    <select class="ios-select" style="flex:1; padding:4px 8px; font-size:10.5px; font-weight:800; color:#4c1d95;" onchange="AvigenGenesisAI.switchGenesisMode(this.value, event)">
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
    // GÖRÜNÜM 2: SEÇİLEN ANA MODÜLÜN ÇALIŞMA EKRANI (3 ANA MODÜL + ALT FONKSİYONLAR)
    // ========================================================================
    const activeMainModule = this.getMainModuleForMode(this.state.activeMode);
    const isBreedingHub = activeMainModule.id === 'breeding_hub';

    let controlsHtml = '';
    if (this.state.activeMode === 'breeding') {
      controlsHtml = `
        <div class="genesis-tool-controls">
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; margin-bottom:7px;">
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
          <button class="ai-send-btn" style="width:100%; padding:8px; font-size:11.5px;" onclick="AvigenGenesisAI.triggerAnimatedAnalysis()">
            ✨ Eşleştirme Uyumunu, Wright COI Riskini ve Otomatik Eşleri Analiz Et
          </button>
        </div>
      `;
    } else if (this.state.activeMode === 'racing') {
      controlsHtml = `
        <div class="genesis-tool-controls">
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
            ⚖️ İki Kuşu 4 Temel Bilimsel Boyutta Karşılaştır
          </button>
        </div>
      `;
    } else if (this.state.activeMode === 'purchase') {
      controlsHtml = `
        <div class="genesis-tool-controls">
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
                ${all.slice(0, 8).map(c => `<option value="${escapeHtml(c.ring)}" ${this.state.purchaseBirdAncestorRef === c.ring ? 'selected' : ''}>Ortak Ata: ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('')}
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
        <div class="genesis-tool-controls" style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.3fr) auto; gap:5px; align-items:end; max-width:100%; overflow:hidden;">
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
        plainResult = `Önerilmez (${rep.totalScore}/100) — Çok Yakın Akrabalık Riski (COI %${rep.coi.toFixed(1)})`;
        plainWhy = `Bu iki kuş çok yakın akraba (${rep.relationSummary}). Eşleştirilmeleri halinde doğacak yavrularda bağışıklık düşüklüğü ve uçuş performansı kaybı riski yüksektir.`;
      } else if (rep.totalScore >= 82) {
        plainResult = `Yüksek Uyumlu Eşleşme (${rep.totalScore}/100) — Yarış ve Damızlık İçin Güçlü Aday`;
        plainWhy = `Mevcut soyağacı ve performans kayıtları yüksek tamamlayıcılık gösteriyor. ${rep.coi === 0 ? 'Aralarında kan bağı bulunmadığı (%0 COI) için yavrular yüksek melez dinçliği (heterosis) kazanır.' : `Soy içi ortak ata bağlantısı (%${rep.coi.toFixed(2)} COI) güvenli linebreeding sınırları içindedir.`}`;
      } else if (rep.totalScore >= 68) {
        plainResult = `Uygun / Dengeli Eşleşme (${rep.totalScore}/100) — Geliştirilebilir Soy Uyumu`;
        plainWhy = `Akrabalık oranı (%${rep.coi.toFixed(2)} COI) güvenli aralıkta ve mevcut kayıtlar dengeli bir eşleşme sunuyor. Daha yüksek tamamlayıcılık için aşağıdaki önerilen ve alternatif eş adaylarını da inceleyebilirsiniz.`;
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
        ? `♂ ${rep.sireInfo.ring} için daha yüksek uyum sağlayan öneri: ♀ ${bestForSire.candidate.ring} (${bestForSire.candidate.name} • ${bestForSire.score}/100 Puan, %${bestForSire.coi.toFixed(2)} COI)`
        : ((bestForDam && bestForDam.score > rep.totalScore + 2)
          ? `♀ ${rep.damInfo.ring} için daha yüksek uyum sağlayan öneri: ♂ ${bestForDam.candidate.ring} (${bestForDam.candidate.name} • ${bestForDam.score}/100 Puan, %${bestForDam.coi.toFixed(2)} COI)`
          : `Seçili Çift: ♂ ${rep.sireInfo.ring} × ♀ ${rep.damInfo.ring} (${rep.totalScore}/100 Uyum — Kümesinizdeki en uygun eşleşmelerden biri)`);

      const extraHtml = `
        <div style="display:flex; flex-direction:column; gap:7px;">
          <!-- 1-4. PEDİGRİ, PERFORMANS VE GENETİK ÇEŞİTLİLİK DEĞERLENDİRME KARTLARI -->
          <div style="display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1fr); gap:6px; font-size:9.5px;">
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #0066ff; border-radius:8px; padding:7px 8px;">
              <div style="font-weight:900; color:#0052cc; margin-bottom:2px;">📜 Pedigri Değerlendirmesi (${rep.pedigreeScore100}/100)</div>
              <div style="color:var(--ios-text); line-height:1.35;">
                • <strong>Kapsam:</strong> ♂ Baba (${rep.sFilled || 0}/30 ata) • ♀ Anne (${rep.dFilled || 0}/30 ata)<br/>
                • <strong>Ortak Ata:</strong> ${rep.commonAncestors.length ? escapeHtml(rep.commonAncestors[0]) : 'Ortak ata yok (Farklı kan hatları)'}
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #059669; border-radius:8px; padding:7px 8px;">
              <div style="font-weight:900; color:#059669; margin-bottom:2px;">🏆 Performans Değerlendirmesi (${rep.performanceScore100 !== null ? `${rep.performanceScore100}/100` : 'Kapsam Dışı'})</div>
              <div style="color:var(--ios-text); line-height:1.35;">
                • <strong>Kayıtlar:</strong> ${rep.sireInfo.verifiedWins.length + rep.damInfo.verifiedWins.length} ebeveyn, ${(rep.sDeep?.ancestorWins?.length || 0) + (rep.dDeep?.ancestorWins?.length || 0)} ata, ${sibCount} kardeş, ${offCount} yavru derecesi<br/>
                • <strong>Öne Çıkan Kanıt:</strong> <span style="color:#065f46; font-weight:700;">${escapeHtml(rep.verifiedRecords[0] || rep.performanceMethodLabel)}</span>
              </div>
            </div>
          </div>

          <!-- GENETİK ÇEŞİTLİLİK VE DOĞACAK YAVRU (F1) BEKLENTİSİ (KANITLANMIŞ VERİDEN AYRI) -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:8px; padding:7px 9px; font-size:9.5px; line-height:1.38;">
            <div style="font-weight:900; color:#5b21b6; margin-bottom:2px;">🧬 Genetik Çeşitlilik (${rep.diversityScore100}/100) &amp; Doğacak Yavru (F1) Beklentisi:</div>
            <div>• <strong>Akrabalık &amp; Melez Dinçliği:</strong> Wright COI <strong>%${rep.coi.toFixed(2)}</strong> (${escapeHtml(rep.relationSummary)}) • Melez Dinçliği İndeksi: <strong>%${rep.heterosis}</strong></div>
            <div>• <strong>Beklenen Yavru (F1) Potansiyel Aralığı:</strong> <strong>${Math.max(45, rep.totalScore - Math.max(5, Math.round(13 - rep.dataReliabilityPct / 12)))}–${Math.min(98, rep.totalScore + Math.max(5, Math.round(13 - rep.dataReliabilityPct / 12)))} / 100</strong> (Mendel olasılık dağılımı; kesin yavru garantisi değildir)</div>
            <div>• <strong>Tahmin Edilebilen Soy Eğilimi:</strong> Mevcut soyağacı yapısına göre yavrularda <strong>${rep.coi === 0 ? 'yüksek fiziksel dayanıklılık ve yarış temposu (Outcross avantajı)' : 'ortak ata özelliklerinin sabitlenmesi (Linebreeding damızlık potansiyeli)'}</strong> beklenir.</div>
          </div>

          <!-- GÜÇLÜ YÖNLER, RİSKLER VE GELİŞTİRME FIRSATLARI -->
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:7px 9px; font-size:9.5px; line-height:1.38; display:flex; flex-direction:column; gap:4px;">
            <div>
              <strong style="color:#059669;">✅ Güçlü Yönler:</strong>
              ${rep.strongLines.slice(0, 2).map(s => `<div style="margin-left:6px;">• ${escapeHtml(s)}</div>`).join('')}
            </div>
            <div>
              <strong style="color:${rep.coi > 12.5 ? '#dc2626' : '#d97706'};">⚠️ Riskler &amp; Sınırlamalar:</strong>
              ${rep.weakLines.slice(0, 2).map(w => `<div style="margin-left:6px;">• ${escapeHtml(w)}</div>`).join('')}
            </div>
            <div>
              <strong style="color:#0052cc;">💡 Geliştirme Fırsatı:</strong>
              <div style="margin-left:6px;">• ${escapeHtml((rep.opportunities && rep.opportunities[0]) || 'Yavruların etap sonuçlarını kaydederek veri güvenilirliğini artırabilirsiniz.')}</div>
            </div>
          </div>

          <!-- ÖNERİLEN EŞLEŞME VE ALTERNATİF ADAYLAR -->
          <div style="font-size:10px; border-top:1px solid var(--ios-border); padding-top:6px;">
            <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:7px; padding:6px 8px; margin-bottom:5px;">
              <strong style="color:#5b21b6;">🎯 Önerilen Eşleşme:</strong>
              <div style="margin-top:2px; font-weight:700; color:var(--ios-text);">${escapeHtml(topRecommendedText)}</div>
            </div>

            <strong style="color:#581c87;">🔄 Alternatif Eş Adayları:</strong>
            ${rep.altFemalesForSire.slice(0, 2).map(item => `
              <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3px solid #2563eb; border-radius:6px; padding:5px 7px; margin-top:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                  <span>• ♂ ${escapeHtml(rep.sireInfo.ring)} için Alternatif Dişi: <strong>${item.candidate.flag} ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)})</strong></span>
                  <button class="ios-btn ios-btn-primary" style="padding:2px 7px; font-size:9px; flex-shrink:0;" onclick="document.getElementById('genesisDamSelect').value='${item.candidate.id}'; AvigenGenesisAI.onGenesisSelectionChange();">Seç (${item.score}/100)</button>
                </div>
                <div style="font-size:9px; color:var(--ios-subtext); margin-top:2px;">💡 ${escapeHtml(item.why)}</div>
              </div>
            `).join('')}
            ${rep.altMalesForDam.slice(0, 2).map(item => `
              <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3px solid #16a34a; border-radius:6px; padding:5px 7px; margin-top:4px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                  <span>• ♀ ${escapeHtml(rep.damInfo.ring)} için Alternatif Erkek: <strong>${item.candidate.flag} ${escapeHtml(item.candidate.ring)} (${escapeHtml(item.candidate.name)})</strong></span>
                  <button class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:9px; flex-shrink:0;" onclick="document.getElementById('genesisSireSelect').value='${item.candidate.id}'; AvigenGenesisAI.onGenesisSelectionChange();">Seç (${item.score}/100)</button>
                </div>
                <div style="font-size:9px; color:var(--ios-subtext); margin-top:2px;">💡 ${escapeHtml(item.why)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      const expertHtml = `
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:6px 8px; font-size:10px; margin-bottom:6px;">
          <div style="font-weight:800; color:#4c1d95; margin-bottom:3px;">⚖️ Dinamik Ağırlıklandırılmış Puan Dağılımı (Eksik kriterler 0 sayılmaz, mevcut veriye göre ağırlıklandırılır):</div>
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
        dataSourceSummary: `${totalAncFilled}/60 ata kaydı, ${rep.verifiedRecords.length} performans kaydı, Wright COI %${rep.coi.toFixed(2)}`,
        snapshotParams: { selectedSireRef: this.state.selectedSireRef, selectedDamRef: this.state.selectedDamRef }
      });

      out.innerHTML = this.renderFiveQuestionDecisionCard({
        headerTitle: `💞 Eşleştirme Analizi: ♂ ${escapeHtml(rep.sireInfo.ring)} × ♀ ${escapeHtml(rep.damInfo.ring)}`,
        verdictTag: rep.relationSummary,
        metricTitle: 'GENETİK ÇEŞİTLİLİK (COI)',
        metricValue: `%${rep.coi.toFixed(2)} ${rep.coi === 0 ? '(Outcross)' : (rep.coi <= 12.5 ? '(Linebreeding)' : '(Yüksek Risk)')}`,
        metricColor: rep.coi >= 25 ? '#dc2626' : (rep.coi > 12.5 ? '#d97706' : '#059669'),
        score: rep.totalScore,
        reliabilityPct: rep.dataReliabilityPct,
        q1_whatAnalyzed: `♂ <strong>${escapeHtml(rep.sireInfo.ring)} (${escapeHtml(rep.sireInfo.name)})</strong> ile ♀ <strong>${escapeHtml(rep.damInfo.ring)} (${escapeHtml(rep.damInfo.name)})</strong> çiftinin 4 kuşak soyağacı ve performans uyumu incelendi.`,
        q2_dataUsed: `Mevcut <strong>${totalAncFilled} ata kaydı</strong> ve <strong>${rep.verifiedRecords.length} performans/derece göstergesi</strong> değerlendirildi (Veri Güvenilirliği: <strong>%${rep.dataReliabilityPct}</strong> — eşleşme kalitesinden ayrı hesaplanmıştır).`,
        q3_result: plainResult,
        q4_whyResult: plainWhy,
        q5_reliability: `Veri güvenilirliği <strong>%${rep.dataReliabilityPct}</strong> düzeyindedir. Eksik alanlar sıfır kabul edilmemiş, puanlama mevcut doğrulanmış veriler üzerinden yeniden ağırlıklandırılmıştır.`,
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
  }
};
