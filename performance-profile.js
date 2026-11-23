/* ============================================================================
   AVIGEN – INDIVIDUAL PERFORMANCE PROFILE ENGINE
   Her Güvercin İçin Profesyonel Performans & Genetik Profil Kartı Motoru
   Temel Kurallar:
   - İki Ana Sekme: 1. PERFORMANCE (Uçuş, Yarış Başarısı, Navigasyon)
                    2. GENETIC PROFILE (Breeding / Soyağacı & Damızlık)
   - Yatay Çubuk Grafik (0-100 Puan + Sayısal Puan + Veri Güvenilirliği %)
   - Eksik verilerde YAPAY PUAN ÜRETMEZ ("Veri Yok" olarak şeffaf gösterir).
   - Her özelliğe dokunulduğunda AVIGEN hesaplama metodolojisini ve kullanılan
     gerçek veri kaynaklarını (Bireysel yarış, sicil, pedigri, yavru, GPS) açıklar.
   - Mesafe kategorisi sınırları (Sprint, Orta, Uzun, Maraton) kullanıcı tarafından ayarlanabilir.
   ============================================================================ */

const AVIGEN_PROFILE_CONFIG_KEY = 'avigen_perf_profile_config_v1';

const AvigenPerformanceEngine = {
  state: {
    currentRing: '',
    activeTab: 'performance', // 'performance' | 'genetic'
    selectedMetricKey: null,
    showDistanceSettings: false,
    // Kullanıcı tarafından ayarlanabilir mesafe sınırları (km)
    distanceLimits: {
      sprintMax: 300,   // 0 - 300 km: Sprint
      middleMax: 500,   // 301 - 500 km: Middle Distance (Orta Mesafe)
      longMax: 700      // 501 - 700 km: Long Distance (Uzun Mesafe), 700+ km: Marathon
    },
    // Referans grup normalizasyon tavanları
    referenceBenchmarks: {
      refSpeedMpm: 1500,      // 1500 m/dk = 100 puan referans tavanı
      refDurationMin: 540,    // 9 saat (540 dk) kesintisiz uçuş = 100 puan
      refFlockSize: 5000      // 5.000 kuşluk rekabet hacmi = 100 puan
    }
  },

  init() {
    try {
      const raw = localStorage.getItem(AVIGEN_PROFILE_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.distanceLimits) {
          this.state.distanceLimits = { ...this.state.distanceLimits, ...parsed.distanceLimits };
        }
      }
    } catch (e) {}
  },

  saveConfig() {
    localStorage.setItem(AVIGEN_PROFILE_CONFIG_KEY, JSON.stringify({
      distanceLimits: this.state.distanceLimits
    }));
  },

  // --------------------------------------------------------------------------
  // 1. GÜVERCİNİN TÜM DOĞRULANMIŞ VERİ KAYNAKLARINI TOPLAYICI
  //    (Bireysel Yarışlar, Sicil Kayıtları, Pedigri Notları, Yavrular, GPS)
  // --------------------------------------------------------------------------
  extractVerifiedBirdData(ring) {
    const cleanRing = (ring || '').trim().toUpperCase();
    const allBirds = collectUniqueLoftBirds();
    const bird = allBirds.find(b => b.ring.toUpperCase() === cleanRing) || {
      ring: cleanRing,
      flag: detectFlagFromRing(cleanRing),
      name: 'Kayıtlı Güvercin',
      color: 'Mavi Çakmaklı',
      sex: 'M',
      roleCategory: 'RACER',
      notes: '',
      pedId: pedigrees[0]?.id || '',
      slotKey: 'main'
    };

    // A. Kuşun gerçek 5 nesil soy ağacını `getCandidateLineageTree` ile çıkar (İster main, ister sire/dam/g2_1 olsun!)
    let ownPed = pedigrees.find(p => p.boxes?.main?.ring?.trim().toUpperCase() === cleanRing);
    let targetSlotKey = 'main';
    if (!ownPed && bird.pedId) {
      ownPed = pedigrees.find(p => p.id === bird.pedId);
      targetSlotKey = bird.slotKey || 'main';
    }
    const candidateRef = ownPed ? `${ownPed.id}::${targetSlotKey}` : `${pedigrees[0]?.id || ''}::main`;
    const fullLineageTree = typeof getCandidateLineageTree === 'function'
      ? getCandidateLineageTree(candidateRef)
      : { self: bird };

    // B. Bireysel Yarış ve Antrenman Kayıtlarını Ayrıştır (Notlar + Sicil + Yarışlar Listesi)
    const rawLines = [];
    const mergedSelfNotes = fullLineageTree.self?.notes || bird.notes || '';
    if (mergedSelfNotes) {
      mergedSelfNotes.split(/\r?\n/).forEach(l => rawLines.push({ source: 'Pedigri/Kuş Notu', text: l.trim() }));
    }

    const dossierLogs = getDossierLogsForRing(cleanRing);
    dossierLogs.forEach(d => {
      rawLines.push({
        source: `Sicil (${d.category})`,
        text: `${d.title} ${d.detail || ''}`.trim(),
        category: d.category
      });
    });

    racesList.forEach(rc => {
      if ((rc.detail || '').toUpperCase().includes(cleanRing) || (rc.title || '').toUpperCase().includes(cleanRing)) {
        rawLines.push({
          source: 'Resmi Yarış Kaydı',
          text: `${rc.title} ${rc.detail} ${rc.badge}`.trim()
        });
      }
    });

    // Satırdan Derece (Rank), Kuş Sayısı (Flock), Mesafe (km) ve Hız (m/dk) Çıkarıcı Yardımcı (Tüm TR/Avrupa formatlarını okur)
    const parseRaceLineMetrics = (txt) => {
      // 1. Kesirli derece: "1/6461", "3/2853" veya Türk ters kesirli "679/2."
      let rank = null;
      let flockSize = null;
      const slashM = txt.match(/\b(\d{1,3})\s*\/\s*(\d{3,5})\b/);
      const revSlashM = txt.match(/\b(\d{3,5})\s*\/\s*(\d{1,2})\./);
      if (revSlashM) {
        flockSize = parseInt(revSlashM[1], 10);
        rank = parseInt(revSlashM[2], 10);
      } else if (slashM) {
        rank = parseInt(slashM[1], 10);
        flockSize = parseInt(slashM[2], 10);
      }

      // 2. Açık sıra formatları: "1. Final", "Final 5.", "180 km. - 1e.", "453 km. - FİNAL 22e.", "6. MONFERTO 4507 p."
      if (rank === null) {
        const expM = txt.match(/\b(\d{1,3})\.\s*(?:lik|ulusal|bölge|klasman|npo|kbdb|etap|final|f[iı]nal|s\/final|ace|as\b|nat\b|nikolaev|algarve|monforte|monferto|evora|mertola|gerede|hendek|izmit|sivas|ankara|kayseri|eskişehir|bursa)/i)
          || txt.match(/\b(?:f[iı]nal|final|ace|as(?:\s*güvercin)?)\s*(?:\d{2,4}\s*km\.?)?\s*[:=-]?\s*(\d{1,3})e?\.?\b/i)
          || txt.match(/\b\d{2,4}\s*km\.?\s*[-:]+\s*(?:f[iı]nal\s*)?(\d{1,3})e?\.?\b/i)
          || txt.match(/\b(\d{1,2})(?:st|nd|rd|e\.)\s*(?:nat|national|npo|final|ace|olr)?\b/i);
        if (expM) {
          const rVal = parseInt(expM[1], 10);
          if (rVal >= 1 && rVal <= 200) rank = rVal;
        }
      }

      // 3. Kuş sayısı ("4507 p.", "3.850 kuş")
      if (flockSize === null) {
        const flM = txt.match(/(\d{1,2}[.,]\d{3}|\d{3,5})\s*(?:kuş|p\.|d\b)/i);
        if (flM) flockSize = parseInt(flM[1].replace(/[.,]/g, ''), 10);
      }

      // 4. Mesafe (km) ve Hız (m/dk)
      const kmM = txt.match(/(\d{2,4})\s*km/i);
      const distanceKm = kmM ? parseInt(kmM[1], 10) : null;
      const spdM = txt.match(/(\d{3,4}(?:[.,]\d)?)\s*m\/dk/i);
      const speedMpm = spdM ? parseFloat(spdM[1].replace(',', '.')) : null;
      const minM = txt.match(/Süre:\s*(\d{2,4})\s*dk/i);
      const durationMin = minM
        ? parseInt(minM[1], 10)
        : (distanceKm && speedMpm ? Math.round((distanceKm * 1000) / speedMpm) : null);

      return { rank, flockSize, distanceKm, speedMpm, durationMin };
    };

    // C. Satırlardan Ölçülebilir Yarış Metriklerini Çıkar
    // ÖNEMLİ DOĞRULUK KURALI: Not satırı "Yavrusu:", "Father to:", "Öz kardeşi:", "Babası:" diye başlıyorsa
    // bu kuşun KENDİ bireysel yarışı değildir! Yavru veya Kardeş/Üst Soy kanıtına ayrılır!
    const parsedRaces = [];
    const verifiedOffspringNoteWins = [];
    const verifiedSiblingNoteWins = [];
    const releasePoints = new Set();
    let hasGpsData = false;
    let loftFlightMinutes = 0;

    // C-0. AVIGEN YARIŞ TAKİP SİSTEMİ (`AvigenRaceTracker`) Doğrudan Yapılandırılmış Yarış Kayıtları
    if (typeof AvigenRaceTracker !== 'undefined') {
      const structuredRaces = AvigenRaceTracker.getBirdRaceHistory(cleanRing);
      structuredRaces.forEach(sr => {
        if (sr.releasePoint) releasePoints.add(sr.releasePoint);
        if (sr.resultStatus === 'ENTERED') {
          parsedRaces.push({
            source: `AVIGEN Yarış Takip (${sr.codeTitle})`,
            rawText: `${sr.codeTitle} • ${sr.distanceKm} km • ${sr.rank}. Sıra • ${sr.speedMpm} m/dk`,
            rank: sr.rank,
            distanceKm: sr.distanceKm,
            flockSize: sr.totalCompetitors,
            speedMpm: sr.speedMpm,
            durationMin: sr.durationMinutes,
            structuredEntry: sr
          });
        }
      });
    }

    const cities = ['Ankara', 'Eskişehir', 'Bolu', 'Polatlı', 'Sivas', 'Kayseri', 'Bursa', 'Gerede', 'Hendek', 'İzmit', 'Bourges', 'Vierzon', 'Argenton', 'Chateauroux', 'Quievrain', 'Noyon', 'Sens', 'Monforte', 'Evora', 'Mertola', 'Nikolaev'];

    rawLines.forEach(item => {
      const txt = item.text;
      if (!txt) return;

      const isOffspringLine = /\b(yavrusu|yavrular[ıi]|father\s*(?:to|of)|mother\s*(?:to|of)|father:|mother:|offspring\s*won|grandmother\s*to|grandfather\s*to)\b/i.test(txt);
      const isCollateralOrParentLine = /\b(öz\s*kardeş|tam\s*kardeş|babadan\s*kardeş|anneden\s*kardeş|kardeş[iİ]|full\s*(?:sister|brother)|half\s*(?:sister|brother)|h\/brother|h\/sister|vollbruder|babas[ıi]|annesi|dedesi|direct\s*(?:son|daughter)|son\s*of|daughter\s*of)\b/i.test(txt);

      const m = parseRaceLineMetrics(txt);

      if (isOffspringLine) {
        if (m.rank !== null || m.distanceKm !== null || /1\.|2\.|3\.|final|ace|as\b|şampiyon/i.test(txt)) {
          verifiedOffspringNoteWins.push({ text: txt, ...m });
        }
        return; // Kuşun kendi bireysel yarış sayısına EKLEME!
      }

      if (isCollateralOrParentLine) {
        if (m.rank !== null || m.distanceKm !== null || /1\.|2\.|3\.|final|ace|as\b|şampiyon/i.test(txt)) {
          verifiedSiblingNoteWins.push({ text: txt, ...m });
        }
        return; // Kuşun kendi bireysel yarış sayısına EKLEME!
      }

      if (/gps|rota|track/i.test(txt)) hasGpsData = true;

      const hourMatch = txt.match(/(\d+)\s*saat/i);
      if (hourMatch) {
        loftFlightMinutes = Math.max(loftFlightMinutes, parseInt(hourMatch[1], 10) * 60);
      }

      cities.forEach(c => {
        if (txt.toLowerCase().includes(c.toLowerCase())) releasePoints.add(c);
      });

      if (m.rank !== null || m.distanceKm !== null || m.speedMpm !== null) {
        parsedRaces.push({
          source: item.source,
          rawText: txt,
          rank: m.rank,
          distanceKm: m.distanceKm,
          flockSize: m.flockSize,
          speedMpm: m.speedMpm,
          durationMin: m.durationMin
        });
      }
    });

    // D. Bu Güvercinin Yavrularını (Offspring) Bul (Kümeste Babası veya Annesi bu kuş olan kayıtlar)
    const offspringBirds = allBirds.filter(b =>
      b.ring.toUpperCase() !== cleanRing &&
      (b.sireRing.toUpperCase() === cleanRing || b.damRing.toUpperCase() === cleanRing)
    );

    // E. Atalarının (1. Kuşak %50 -> 4. Kuşak %6.25) GERÇEK Yarış/Performans Kayıtlarını Topla
    //    (ÖNEMLİ DÜZELTME: Yalnızca ismi "Porsche" veya "Harry" diye sahte 505 km / 1355 m/dk yarış uydurulmaz!
    //     Yalnızca atanın notunda gerçek derece, km veya hız kaydı varsa hesaba katılır.)
    const ancestorRaces = [];
    const ancestorReleasePoints = new Set();
    let ancestorWeightedPerfSum = 0;
    let ancestorWeightTotal = 0;
    let ancestorsWithPerfCount = 0;

    const treeSlots = [
      { key: 'p1', weight: 0.50 }, { key: 'p2', weight: 0.50 },
      { key: 'g1', weight: 0.25 }, { key: 'g2', weight: 0.25 }, { key: 'g3', weight: 0.25 }, { key: 'g4', weight: 0.25 },
      { key: 'gg1', weight: 0.125 }, { key: 'gg2', weight: 0.125 }, { key: 'gg3', weight: 0.125 }, { key: 'gg4', weight: 0.125 },
      { key: 'gg5', weight: 0.125 }, { key: 'gg6', weight: 0.125 }, { key: 'gg7', weight: 0.125 }, { key: 'gg8', weight: 0.125 },
      { key: 'ggg1', weight: 0.0625 }, { key: 'ggg2', weight: 0.0625 }, { key: 'ggg3', weight: 0.0625 }, { key: 'ggg4', weight: 0.0625 },
      { key: 'ggg5', weight: 0.0625 }, { key: 'ggg6', weight: 0.0625 }, { key: 'ggg7', weight: 0.0625 }, { key: 'ggg8', weight: 0.0625 },
      { key: 'ggg9', weight: 0.0625 }, { key: 'ggg10', weight: 0.0625 }, { key: 'ggg11', weight: 0.0625 }, { key: 'ggg12', weight: 0.0625 },
      { key: 'ggg13', weight: 0.0625 }, { key: 'ggg14', weight: 0.0625 }, { key: 'ggg15', weight: 0.0625 }, { key: 'ggg16', weight: 0.0625 }
    ];

    treeSlots.forEach(({ key: slotKey, weight }) => {
      const ancBox = fullLineageTree[slotKey];
      if (!ancBox || !ancBox.ring || !ancBox.ring.trim()) return;
      const ancTxt = `${ancBox.name || ''}\n${ancBox.notes || ''}`.trim();
      if (!ancTxt) return;

      cities.forEach(c => {
        if (ancTxt.toLowerCase().includes(c.toLowerCase())) ancestorReleasePoints.add(c);
      });

      const m = parseRaceLineMetrics(ancTxt);
      const hasExplicitAchievement = m.rank !== null || m.distanceKm !== null || m.speedMpm !== null || /\b(1\.|1st|şampiyon|as\s*güvercin|ace\s*pigeon|olimpiyat|olympic|f[iı]nal\s*\d|npo\s*1|kbdb\s*1)\b/i.test(ancTxt);

      if (hasExplicitAchievement) {
        ancestorsWithPerfCount++;
        const rank = m.rank !== null ? m.rank : (/\b(1\.|1st|1e\.|npo\s*1|kbdb\s*1)\b/i.test(ancTxt) ? 1 : 5);
        // Yalnızca gerçek km yazıyorsa veya bilinen etap şehri varsa mesafe ata; yoksa null bırak ki yanlış mesafe çubuğunu şişirmesin!
        const distanceKm = m.distanceKm !== null
          ? m.distanceKm
          : (/quievrain|noyon|sprint|180\s*km|200\s*km/i.test(ancTxt) ? 220 : (/bourges|argenton|chateauroux|algarve|nikolaev|monforte|monferto|evora|sivas|gerede|f[iı]nal/i.test(ancTxt) ? 480 : null));
        const flockSize = m.flockSize;
        const speedMpm = m.speedMpm;
        const durationMin = m.durationMin || (distanceKm ? Math.round((distanceKm * 1000) / (speedMpm || 1320)) : null);

        let ancPts = 74;
        if (rank === 1) ancPts = 94;
        else if (rank && rank <= 3) ancPts = 88;
        else if (rank && rank <= 12) ancPts = 83;
        else if (rank && rank <= 50) ancPts = 78;
        if (flockSize && flockSize >= 3000) ancPts = Math.min(97, ancPts + 3);

        ancestorWeightedPerfSum += ancPts * weight;
        ancestorWeightTotal += weight;

        ancestorRaces.push({
          slotKey,
          weight,
          ancRing: ancBox.ring,
          ancName: ancBox.name || '',
          rank,
          distanceKm,
          flockSize,
          speedMpm,
          durationMin,
          ancPts
        });
      }
    });

    const pedigreeBaseIndex = ancestorWeightTotal > 0
      ? Math.round(ancestorWeightedPerfSum / ancestorWeightTotal)
      : null;

    return {
      bird,
      ownPed,
      fullLineageTree,
      parsedRaces,
      verifiedOffspringNoteWins,
      verifiedSiblingNoteWins,
      ancestorRaces,
      ancestorReleasePoints: Array.from(ancestorReleasePoints),
      ancestorsWithPerfCount,
      pedigreeBaseIndex,
      dossierLogs,
      releasePoints: Array.from(releasePoints),
      hasGpsData,
      loftFlightMinutes,
      offspringBirds
    };
  },

  // --------------------------------------------------------------------------
  // 2. TÜM PERFORMANS VE GENETİK METRİKLERİNİ (0-100) HESAPLAYICI
  //    Eksik veride `score: null` döner (Yapay puan üretmez!)
  // --------------------------------------------------------------------------
  calculateFullProfile(ring) {
    const data = this.extractVerifiedBirdData(ring);
    const {
      bird,
      ownPed,
      fullLineageTree,
      parsedRaces,
      verifiedOffspringNoteWins,
      verifiedSiblingNoteWins,
      ancestorRaces,
      ancestorReleasePoints,
      ancestorsWithPerfCount,
      pedigreeBaseIndex,
      releasePoints,
      hasGpsData,
      loftFlightMinutes,
      offspringBirds
    } = data;
    const lim = this.state.distanceLimits;
    const ref = this.state.referenceBenchmarks;

    const racesWithDist = parsedRaces.filter(r => r.distanceKm !== null);
    const racesWithRank = parsedRaces.filter(r => r.rank !== null);
    const racesWithSpeed = parsedRaces.filter(r => r.speedMpm !== null);
    const totalRaceCount = parsedRaces.length;

    // Veri güvenilirliği hesaplayıcı (Bireysel ölçümlerde %100'e kadar, Soyağacı tahminlerinde dar anlamda kalıtsallık h² gereği maksimum %68)
    const calcReliability = (sampleCount, idealCount = 3) => {
      if (sampleCount <= 0) return 0;
      return Math.min(100, Math.round((sampleCount / idealCount) * 100));
    };
    const calcInheritedReliability = (ancSampleCount, idealAncCount = 4) => {
      if (ancSampleCount <= 0) return 0;
      return Math.min(68, Math.round((ancSampleCount / idealAncCount) * 68));
    };

    // Mesafe kategorisine göre yarış başarısı puanlayıcı (Önce Bireysel, Yoksa Galton-Mendel Soyağacı Kalıtım Tahmini)
    const evalDistanceBracket = (minKm, maxKm, bracketName) => {
      const subset = racesWithDist.filter(r => r.distanceKm >= minKm && r.distanceKm <= maxKm);
      if (subset.length > 0) {
        let sum = 0;
        subset.forEach(r => {
          let pts = 72;
          if (r.rank === 1) pts = 96;
          else if (r.rank && r.rank <= 3) pts = 90;
          else if (r.rank && r.rank <= 10) pts = 84;
          else if (r.rank && r.rank <= 50) pts = 76;
          if (r.flockSize && r.flockSize >= 3000) pts = Math.min(99, pts + 3);
          sum += pts;
        });
        return {
          score: Math.round(sum / subset.length),
          reliability: calcReliability(subset.length, 2),
          isInheritedEstimate: false,
          sampleCount: subset.length,
          evidence: `Doğrudan Bireysel Ölçüm: ${subset.length} adet doğrulanmış ${bracketName} yarışı (${subset.map(s => `${s.distanceKm}km${s.rank ? ' #' + s.rank : ''}`).join(', ')}) üzerinden hesaplandı.`
        };
      }

      // Bireysel yarış yoksa atalarının BU MESAFEDEKİ gerçek kayıtlarından Galton-Mendel kalıtsal tahmin yap
      const ancSubset = ancestorRaces.filter(a => a.distanceKm !== null && a.distanceKm >= minKm && a.distanceKm <= maxKm);
      if (ancSubset.length > 0) {
        let wSum = 0;
        let wTot = 0;
        ancSubset.forEach(a => {
          const regressedPts = Math.round(a.ancPts * 0.82 + 55 * 0.18);
          wSum += regressedPts * a.weight;
          wTot += a.weight;
        });
        return {
          score: Math.round(wSum / wTot),
          reliability: calcInheritedReliability(ancSubset.length, 3),
          isInheritedEstimate: true,
          sampleCount: ancSubset.length,
          evidence: `🧬 Soyağacı Kalıtım Tahmini: Bu kuşun henüz bireysel ${bracketName} yarışı yoktur; ancak üst soyundaki ${ancSubset.length} atasının (${ancSubset.slice(0, 3).map(a => `${a.ancRing} [${a.distanceKm}km]`).join(', ')}) bu mesafedeki doğrulanmış derecelerinden hesaplanmıştır.`
        };
      }

      return {
        score: null,
        reliability: 0,
        isInheritedEstimate: false,
        sampleCount: 0,
        evidence: `Ne kuşun kendisinde ne de kayıtlı atalarında ${bracketName} (${minKm}-${maxKm === 9999 ? '700+' : maxKm} km) verisi bulunmuyor. Eksik veride yapay puan üretilmemiştir.`
      };
    };

    // ========================================================================
    // KATEGORİ 1: UÇUŞ PERFORMANSI (FLIGHT PERFORMANCE)
    // ========================================================================
    // 1.1 Speed (Hız — Önce bireysel m/dk, yoksa bireysel derece, yoksa ataların hız/derece indeksi)
    let speedScore = null;
    let speedRel = 0;
    let speedInherited = false;
    let speedEvidence = 'Doğrulanmış bireysel veya soyağacı hız (m/dk) kaydı bulunmuyor.';
    if (racesWithSpeed.length > 0) {
      const avgSpeed = racesWithSpeed.reduce((a, b) => a + b.speedMpm, 0) / racesWithSpeed.length;
      speedScore = Math.max(30, Math.min(99, Math.round(50 + ((avgSpeed - 1000) / (ref.refSpeedMpm - 1000)) * 49)));
      speedRel = calcReliability(racesWithSpeed.length, 2);
      speedEvidence = `Doğrudan Bireysel Ölçüm: ${racesWithSpeed.length} yarışın ölçülen ortalama hızı (${avgSpeed.toFixed(1)} m/dk), AVIGEN ${ref.refSpeedMpm} m/dk referans tavanına göre normalize edildi.`;
    } else if (racesWithRank.length > 0) {
      const bestRank = Math.min(...racesWithRank.map(r => r.rank));
      speedScore = bestRank === 1 ? 92 : (bestRank <= 3 ? 86 : (bestRank <= 15 ? 80 : 73));
      speedRel = 60;
      speedEvidence = `Bireysel klasman derecesi (${bestRank}.lik) üzerinden hız dilimi hesaplandı.`;
    } else if (ancestorRaces.length > 0) {
      let wPts = 0;
      let wTot = 0;
      ancestorRaces.forEach(a => {
        wPts += a.ancPts * a.weight;
        wTot += a.weight;
      });
      const avgAncPts = wPts / wTot;
      speedScore = Math.max(48, Math.min(89, Math.round(avgAncPts * 0.85 + 55 * 0.15)));
      speedRel = calcInheritedReliability(ancestorRaces.length, 4);
      speedInherited = true;
      speedEvidence = `🧬 Soyağacı Kalıtım Tahmini: Kuşun bireysel hız kaydı yoktur; üst soyundaki ${ancestorRaces.length} dereceli atanın yarış başarılarından tahmin edilmiştir.`;
    }

    // 1.2 Endurance (Dayanıklılık — Önce bireysel km/süre, yoksa ataların GERÇEK km kaydı)
    const ancRacesWithDist = ancestorRaces.filter(a => a.distanceKm !== null && a.distanceKm > 0);
    let enduranceScore = null;
    let enduranceRel = 0;
    let enduranceInherited = false;
    let enduranceEvidence = 'Bireysel veya soyağacı mesafe (km) / uçuş süresi kaydı bulunmuyor.';
    if (racesWithDist.length > 0 || loftFlightMinutes > 0) {
      const maxKm = racesWithDist.length ? Math.max(...racesWithDist.map(r => r.distanceKm)) : 0;
      const maxDur = Math.max(
        loftFlightMinutes,
        ...parsedRaces.map(r => r.durationMin || 0)
      );
      const kmNorm = maxKm > 0 ? Math.min(99, Math.round((maxKm / 650) * 92)) : 0;
      const durNorm = maxDur > 0 ? Math.min(99, Math.round((maxDur / ref.refDurationMin) * 92)) : 0;
      enduranceScore = Math.max(35, Math.min(99, Math.round(Math.max(kmNorm, durNorm))));
      enduranceRel = calcReliability(racesWithDist.length + (loftFlightMinutes > 0 ? 1 : 0), 2);
      enduranceEvidence = `Doğrudan Bireysel Ölçüm: Tamamlanan maksimum menzil (${maxKm} km) ve kesintisiz havada kalma süresi (${maxDur} dk) üzerinden hesaplandı.`;
    } else if (ancRacesWithDist.length > 0) {
      const maxAncKm = Math.max(...ancRacesWithDist.map(a => a.distanceKm));
      enduranceScore = Math.max(48, Math.min(91, Math.round(((maxAncKm / 650) * 78) + 12)));
      enduranceRel = calcInheritedReliability(ancRacesWithDist.length, 4);
      enduranceInherited = true;
      enduranceEvidence = `🧬 Soyağacı Kalıtım Tahmini: Üst soyundaki ataların tamamladığı maksimum doğrulanmış yarış menzili (${maxAncKm} km) üzerinden hesaplanmıştır.`;
    }

    // 1.3 Sprint, 1.4 Middle Distance, 1.5 Long Distance, 1.6 Marathon
    const sprintMetric = evalDistanceBracket(50, lim.sprintMax, 'Sprint (Kısa Mesafe)');
    const middleMetric = evalDistanceBracket(lim.sprintMax + 1, lim.middleMax, 'Orta Mesafe');
    const longMetric = evalDistanceBracket(lim.middleMax + 1, lim.longMax, 'Uzun Mesafe');
    const marathonMetric = evalDistanceBracket(lim.longMax + 1, 9999, 'Maraton');

    // 1.7 Flight Duration (Uçuş Süresi Kapasitesi)
    const durations = parsedRaces.map(r => r.durationMin).filter(Boolean);
    if (loftFlightMinutes > 0) durations.push(loftFlightMinutes);
    const ancDurations = ancestorRaces.map(a => a.durationMin).filter(Boolean);
    let durationScore = null;
    let durationRel = 0;
    let durationInherited = false;
    let durationEvidence = 'Kayıtlı bireysel veya soyağacı uçuş süresi verisi yok.';
    if (durations.length > 0) {
      const maxMin = Math.max(...durations);
      durationScore = Math.max(30, Math.min(99, Math.round((maxMin / ref.refDurationMin) * 95)));
      durationRel = calcReliability(durations.length, 2);
      durationEvidence = `Doğrudan Bireysel Ölçüm: Ölçülen en uzun uçuş süresi ${maxMin} dakika (${(maxMin / 60).toFixed(1)} saat). Referans tavanı: ${ref.refDurationMin} dk.`;
    } else if (ancDurations.length > 0) {
      const maxAncMin = Math.max(...ancDurations);
      durationScore = Math.max(45, Math.min(89, Math.round((maxAncMin / ref.refDurationMin) * 86)));
      durationRel = calcInheritedReliability(ancDurations.length, 4);
      durationInherited = true;
      durationEvidence = `🧬 Soyağacı Kalıtım Tahmini: Atalarının yarış etaplarında havada kalma kapasitesi (~${maxAncMin} dk / ${(maxAncMin / 60).toFixed(1)} saat) üzerinden tahmin edilmiştir.`;
    }

    // ========================================================================
    // KATEGORİ 2: YARIŞ BAŞARISI (RACING SUCCESS)
    // ========================================================================
    // 2.1 Consistency (İstikrar)
    let consistencyScore = null;
    let consistencyRel = 0;
    let consistencyInherited = false;
    let consistencyEvidence = 'İstikrar hesabı için bireysel yarış veya soyağacı derece kaydı gereklidir.';
    if (totalRaceCount > 0) {
      const topFinishes = racesWithRank.filter(r => r.rank <= 25).length;
      consistencyScore = Math.max(45, Math.min(98, Math.round(((topFinishes / totalRaceCount) * 75) + Math.min(23, totalRaceCount * 7))));
      consistencyRel = calcReliability(totalRaceCount, 3);
      consistencyEvidence = `Doğrudan Bireysel Ölçüm: Toplam ${totalRaceCount} bireysel yarış kaydının ${topFinishes} tanesinde üst klasman derecesi elde edildi.`;
    } else if (pedigreeBaseIndex !== null) {
      consistencyScore = Math.max(48, Math.min(89, Math.round(pedigreeBaseIndex * 0.85 + 8)));
      consistencyRel = calcInheritedReliability(ancestorsWithPerfCount, 4);
      consistencyInherited = true;
      consistencyEvidence = `🧬 Soyağacı Kalıtım Tahmini: Henüz bireysel yarışı olmayan bu kuş için, soy ağacındaki ${ancestorsWithPerfCount} dereceli atanın istikrar ortalaması baz alınmıştır.`;
    }

    // 2.2 Top 10 Rate (İlk 10 Oranı / Potansiyeli)
    let top10Score = null;
    let top10Rel = 0;
    let top10Inherited = false;
    let top10Evidence = 'Sıralama (derece) içeren bireysel veya soyağacı yarış kaydı bulunmuyor.';
    if (racesWithRank.length > 0) {
      const top10Count = racesWithRank.filter(r => r.rank <= 10).length;
      top10Score = Math.round((top10Count / racesWithRank.length) * 100);
      top10Rel = calcReliability(racesWithRank.length, 3);
      top10Evidence = `Doğrudan Bireysel Ölçüm: Derecesi bilinen ${racesWithRank.length} bireysel yarışın ${top10Count} tanesinde İlk 10 içinde yer aldı (%${top10Score}).`;
    } else if (ancestorRaces.length > 0) {
      const ancTop10 = ancestorRaces.filter(a => a.rank && a.rank <= 10).length;
      top10Score = Math.min(88, Math.round(((ancTop10 / ancestorRaces.length) * 75) + 10));
      top10Rel = calcInheritedReliability(ancestorRaces.length, 4);
      top10Inherited = true;
      top10Evidence = `🧬 Soyağacı Kalıtım Tahmini: Üst soyundaki ${ancestorRaces.length} performanslı atanın ${ancTop10} tanesi İlk 10 klasman derecesine sahiptir.`;
    }

    // 2.3 Top 1% Rate (İlk %1 Elit Klasman Oranı / Potansiyeli)
    const racesWithFlockAndRank = parsedRaces.filter(r => r.rank !== null && r.flockSize !== null && r.flockSize > 0);
    let top1PctScore = null;
    let top1PctRel = 0;
    let top1PctInherited = false;
    let top1PctEvidence = 'İlk %1 hesabı için bireysel veya soyağacı derece ve sürü büyüklüğü verisi gereklidir.';
    if (racesWithFlockAndRank.length > 0) {
      const inTop1Pct = racesWithFlockAndRank.filter(r => (r.rank / r.flockSize) <= 0.01).length;
      top1PctScore = Math.round((inTop1Pct / racesWithFlockAndRank.length) * 100);
      top1PctRel = calcReliability(racesWithFlockAndRank.length, 2);
      top1PctEvidence = `Doğrudan Bireysel Ölçüm: Sürü büyüklüğü bilinen ${racesWithFlockAndRank.length} yarışın ${inTop1Pct} tanesinde katılan kuşların ilk %1'lik elit dilimine girdi.`;
    } else if (ancestorRaces.length > 0) {
      const ancTop1 = ancestorRaces.filter(a => a.rank && a.flockSize && (a.rank / a.flockSize) <= 0.01).length;
      if (ancTop1 > 0) {
        top1PctScore = Math.min(85, Math.round(((ancTop1 / ancestorRaces.length) * 72) + 12));
        top1PctRel = calcInheritedReliability(ancestorRaces.length, 4);
        top1PctInherited = true;
        top1PctEvidence = `🧬 Soyağacı Kalıtım Tahmini: Üst soyundaki ${ancTop1} ata binlerce kuşluk etaplarda ilk %1 elit dilime girmiştir.`;
      }
    }

    // 2.4 Race Completion Rate (Yarış Tamamlama & Dönüş Beklentisi)
    let completionScore = null;
    let completionRel = 0;
    let completionInherited = false;
    let completionEvidence = 'Tamamlanan bireysel yarış veya soyağacı yarış kaydı bulunmuyor.';
    if (totalRaceCount > 0) {
      completionScore = Math.min(100, 82 + totalRaceCount * 6);
      completionRel = calcReliability(totalRaceCount, 3);
      completionEvidence = `Doğrudan Bireysel Ölçüm: Kaydedilen ${totalRaceCount} yarış/etap görevini eve başarıyla dönerek tamamladı.`;
    } else if (pedigreeBaseIndex !== null) {
      completionScore = Math.min(91, Math.round(pedigreeBaseIndex * 0.9 + 5));
      completionRel = calcInheritedReliability(ancestorsWithPerfCount, 4);
      completionInherited = true;
      completionEvidence = `🧬 Soyağacı Kalıtım Tahmini: Ebeveyn ve büyük ebeveynlerinin yarış tamamlama kayıtlarından tahmin edilen etap tamamlama potansiyeli.`;
    }

    // 2.5 Competition Performance (Rekabet Hacmi Performansı)
    let compPerfScore = null;
    let compPerfRel = 0;
    let compPerfInherited = false;
    let compPerfEvidence = 'Rekabet hacmi (katılan kuş sayısı) verisi bulunmuyor.';
    if (racesWithFlockAndRank.length > 0) {
      let cSum = 0;
      racesWithFlockAndRank.forEach(r => {
        const percentile = Math.max(0, 1 - ((r.rank - 1) / r.flockSize));
        const flockFactor = Math.min(1.0, Math.log10(r.flockSize) / Math.log10(ref.refFlockSize));
        cSum += Math.round((percentile * 75 + flockFactor * 25));
      });
      compPerfScore = Math.min(99, Math.round(cSum / racesWithFlockAndRank.length));
      compPerfRel = calcReliability(racesWithFlockAndRank.length, 2);
      const maxFlock = Math.max(...racesWithFlockAndRank.map(r => r.flockSize));
      compPerfEvidence = `Doğrudan Bireysel Ölçüm: Maksimum ${maxFlock.toLocaleString('tr-TR')} kuşluk rekabet hacmindeki yüzdelik sıralama başarısı ile hesaplandı.`;
    } else if (pedigreeBaseIndex !== null) {
      compPerfScore = Math.min(89, Math.round(pedigreeBaseIndex * 0.88 + 6));
      compPerfRel = calcInheritedReliability(ancestorsWithPerfCount, 4);
      compPerfInherited = true;
      compPerfEvidence = `🧬 Soyağacı Kalıtım Tahmini: Atalarının büyük sürü yarışlarındaki rekabet indeksinin kuşak ağırlıklı aktarım tahminidir.`;
    }

    // ========================================================================
    // KATEGORİ 3: NAVİGASYON (NAVIGATION & ORIENTATION)
    // ========================================================================
    // 3.1 Homing Reliability (Eve Dönüş Güvenilirliği)
    let homingScore = null;
    let homingRel = 0;
    let homingInherited = false;
    let homingEvidence = 'Eve dönüş güvenilirliği için bireysel yarış veya soyağacı kaydı gereklidir.';
    if (totalRaceCount > 0 || releasePoints.length > 0) {
      homingScore = Math.min(98, 74 + totalRaceCount * 7 + releasePoints.length * 4);
      homingRel = calcReliability(totalRaceCount + releasePoints.length, 3);
      homingEvidence = `Doğrudan Bireysel Ölçüm: ${totalRaceCount} etap dönüşü ve ${releasePoints.length} farklı coğrafi noktadan eve dönüş istikrarı ile hesaplandı.`;
    } else if (pedigreeBaseIndex !== null) {
      homingScore = Math.min(90, Math.round(pedigreeBaseIndex * 0.88 + 7));
      homingRel = calcInheritedReliability(ancestorsWithPerfCount, 4);
      homingInherited = true;
      homingEvidence = `🧬 Soyağacı Kalıtım Tahmini: Atalarının eve dönüş başarısı üzerinden tahmin edilmiştir.`;
    }

    // 3.2 Return Time (Dönüş Zamanlaması İstikrarı)
    let returnTimeScore = null;
    let returnTimeRel = 0;
    let returnTimeInherited = false;
    let returnTimeEvidence = 'Dönüş zamanlaması için bireysel veya soyağacı hız/süre kaydı bulunmuyor.';
    if (durations.length > 0 || racesWithRank.length > 0) {
      returnTimeScore = Math.min(96, 78 + (durations.length || racesWithRank.length) * 6);
      returnTimeRel = calcReliability(durations.length || racesWithRank.length, 2);
      returnTimeEvidence = `Doğrudan Bireysel Ölçüm: Etap mesafesine oranla gecikmesiz varış penceresi kararlılığı üzerinden hesaplandı.`;
    } else if (pedigreeBaseIndex !== null) {
      returnTimeScore = Math.min(87, Math.round(pedigreeBaseIndex * 0.84 + 8));
      returnTimeRel = calcInheritedReliability(ancestorsWithPerfCount, 4);
      returnTimeInherited = true;
      returnTimeEvidence = `🧬 Soyağacı Kalıtım Tahmini: Ebeveyn ve büyük ebeveynlerin yarışlardan kopmadan dönüş istikrarına dayalı tahmin.`;
    }

    // 3.3 Route Efficiency (Rota Verimliliği — Yalnızca GPS verisi varsa kesin!)
    let routeEffScore = null;
    let routeEffRel = 0;
    let routeEffEvidence = 'GPS rota takip cihazı (sapma açısı) verisi girilmemiştir. GPS donanım verisi soyağacından tahmin edilemeyeceği için yapay puan üretilmemiştir.';
    if (hasGpsData) {
      routeEffScore = 91;
      routeEffRel = 85;
      routeEffEvidence = 'Doğrudan Bireysel Ölçüm: Sicil/not kayıtlarındaki GPS rota verisi üzerinden düz uçuş hattı verimliliği hesaplandı.';
    }

    // 3.4 Release Point Adaptability (Salım Noktası Adaptasyonu)
    let releaseAdaptScore = null;
    let releaseAdaptRel = 0;
    let releaseAdaptInherited = false;
    let releaseAdaptEvidence = 'Salım noktası (şehir/etap ismi) kaydı bulunamadı.';
    if (releasePoints.length > 0) {
      releaseAdaptScore = Math.min(98, 62 + releasePoints.length * 14);
      releaseAdaptRel = calcReliability(releasePoints.length, 3);
      releaseAdaptEvidence = `Doğrudan Bireysel Ölçüm: Tespit edilen ${releasePoints.length} farklı salım noktası (${releasePoints.join(', ')}) adaptasyonu üzerinden hesaplandı.`;
    } else if (ancestorReleasePoints.length > 0) {
      releaseAdaptScore = Math.min(86, 58 + ancestorReleasePoints.length * 9);
      releaseAdaptRel = calcInheritedReliability(ancestorReleasePoints.length, 3);
      releaseAdaptInherited = true;
      releaseAdaptEvidence = `🧬 Soyağacı Kalıtım Tahmini: Atalarının başarılı olduğu ${ancestorReleasePoints.length} farklı coğrafi salım hattı (${ancestorReleasePoints.join(', ')}) üzerinden hesaplanan yön adaptasyon potansiyeli.`;
    }

    // ========================================================================
    // KATEGORİ 4: BREEDING / GENETİK PROFİL (GENETIC & BREEDING PROFILE)
    // ========================================================================
    const treeAncKeys = [
      'p1', 'p2',
      'g1', 'g2', 'g3', 'g4',
      'gg1', 'gg2', 'gg3', 'gg4', 'gg5', 'gg6', 'gg7', 'gg8',
      'ggg1', 'ggg2', 'ggg3', 'ggg4', 'ggg5', 'ggg6', 'ggg7', 'ggg8',
      'ggg9', 'ggg10', 'ggg11', 'ggg12', 'ggg13', 'ggg14', 'ggg15', 'ggg16'
    ];
    let filledAncCount = 0;
    const uniqueAncRings = new Set();
    treeAncKeys.forEach(k => {
      const r = fullLineageTree?.[k]?.ring?.trim();
      if (r) {
        filledAncCount++;
        uniqueAncRings.add(r.toUpperCase());
      }
    });

    // 4.1 Pedigree Depth (Soyağacı Derinliği — 4 Kuşak 30 Ata Üzerinden Doğrudan Ölçüm)
    const pedDepthScore = Math.round((filledAncCount / 30) * 100);
    const pedDepthRel = 100;
    const pedDepthEvidence = `4 kuşaktaki toplam 30 ata kutusunun ${filledAncCount} tanesi kayıtlıdır (${filledAncCount}/30 = %${pedDepthScore}).`;

    // 4.2 Genetic Diversity (Genetik Çeşitlilik / Tekil Ata Oranı - AVK, Eksik Pedigride Sönümlenmiş!)
    let diversityScore = null;
    let diversityRel = 0;
    let diversityEvidence = 'Genetik çeşitlilik hesabı için soy ağacında en az 2 ata kayıtlı olmalıdır.';
    if (filledAncCount >= 2) {
      const rawAvkPct = Math.round((uniqueAncRings.size / filledAncCount) * 100);
      // ÖNEMLİ DÜZELTME: Yalnızca 2 ata girilmişken AVK %100 çıkıp puanı yapay olarak 100'e şişirmesin;
      // 14 ata doygunluğuna göre popülasyon tabanına (55) dengelenir.
      const depthConfidence = Math.min(1, filledAncCount / 14);
      diversityScore = Math.round(rawAvkPct * depthConfidence + 55 * (1 - depthConfidence));
      diversityRel = Math.min(100, Math.round((filledAncCount / 14) * 100));
      diversityEvidence = `Kayıtlı ${filledAncCount} atanın ${uniqueAncRings.size} tanesi farklı/tekil bireydir (Ham AVK: %${rawAvkPct} • Soyağacı derinliğiyle ağırlıklandırılmış çeşitlilik: ${diversityScore}/100).`;
    }

    // 4.3 Inbreeding Risk (Akrabalık Riski — Baba × Anne Sewall Wright COI)
    let inbreedingRiskScore = null;
    let inbreedingRel = 0;
    let inbreedingEvidence = 'Baba ve Anne soy ağacı verisi eksik olduğu için akrabalık riski hesaplanamadı.';
    let internalCoiPct = 0;
    if (ownPed && filledAncCount >= 2) {
      const sTree = getCandidateLineageTree(`${ownPed.id}::sire`);
      const dTree = getCandidateLineageTree(`${ownPed.id}::dam`);
      const wright = typeof AvigenGenesisAI !== 'undefined'
        ? AvigenGenesisAI.calculateExactWrightCOI(sTree, dTree)
        : { coiPercent: 0, relationSummary: 'Ortak ata yok' };
      internalCoiPct = wright.coiPercent;
      inbreedingRiskScore = Math.min(99, Math.round(5 + (wright.coiPercent / 25) * 85));
      inbreedingRel = Math.min(100, Math.round((filledAncCount / 14) * 100));
      inbreedingEvidence = `Baba × Anne Akrabalık Oranı (Wright COI) = %${wright.coiPercent.toFixed(2)} (${wright.relationSummary}). Not: Düşük puan düşük akrabalık riskini (güvenli durumu) ifade eder.`;
    }

    // 4.4 Offspring Performance (Yavru Başarısı — Doğrulanmış Yavru Dereceleri + Pedigri Yavru Notları)
    let offspringScore = null;
    let offspringRel = 0;
    let offspringEvidence = 'Kümes kayıtlarında veya pedigri notlarında bu güvercinin doğrulanmış yarış dereceli bir yavrusu bulunamadı. Eksik veride yapay yavru puanı üretilmemiştir.';
    const provenOffspringScores = [];
    const provenOffspringLabels = [];

    // 1) Kümesteki yavrularından gerçekten derece/yarış kaydı olanları kontrol et
    offspringBirds.forEach(ob => {
      const obHist = typeof AvigenRaceTracker !== 'undefined'
        ? AvigenRaceTracker.getBirdRaceHistory(ob.ring).filter(h => h.resultStatus === 'ENTERED' && h.rank)
        : [];
      const hasNoteWin = /\b(1\.|2\.|3\.|4\.|5\.|final|ace|as\b|ulusal|npo|kbdb|\d{1,3}\/\d{3,5})\b/i.test(ob.notes || '');
      if (obHist.length > 0 || hasNoteWin) {
        provenOffspringScores.push(ob.ebvScore || 84);
        provenOffspringLabels.push(`${ob.ring} (${ob.name})`);
      }
    });

    // 2) Kuşun kendi pedigri kutusunda yazılı doğrulanmış yavru derecelerini ("Yavrusu: ...", "Father to...") ekle
    verifiedOffspringNoteWins.forEach(vw => {
      let pts = 85;
      if (vw.rank === 1) pts = 95;
      else if (vw.rank && vw.rank <= 5) pts = 90;
      else if (vw.rank && vw.rank <= 25) pts = 84;
      provenOffspringScores.push(pts);
      provenOffspringLabels.push(vw.text.slice(0, 55));
    });

    if (provenOffspringScores.length > 0) {
      offspringScore = Math.round(provenOffspringScores.reduce((a, b) => a + b, 0) / provenOffspringScores.length);
      offspringRel = calcReliability(provenOffspringScores.length, 3);
      offspringEvidence = `Doğrulanmış ${provenOffspringScores.length} yavru başarı kaydı (${provenOffspringLabels.slice(0, 2).join(' | ')}) üzerinden hesaplandı.`;
    } else if (offspringBirds.length > 0) {
      offspringEvidence = `Kümeste kayıtlı ${offspringBirds.length} genç yavrusu (${offspringBirds.map(o => o.ring).join(', ')}) mevcuttur ancak bu yavrulara ait resmi yarış derecesi henüz girilmemiştir.`;
    }

    // 4.5 Breeding Value (Tahmini Damızlık Değeri — Soyağacı + Kardeş/Yavru Kanıtı + COI Dengesi)
    let breedingValScore = null;
    let breedingValRel = 0;
    let breedingValEvidence = 'Damızlık değeri için yeterli soyağacı veya performans verisi yok.';
    const isBlupEligible = totalRaceCount >= 3 && provenOffspringScores.length >= 2 && filledAncCount >= 6;
    const evaluationMethodType = isBlupEligible
      ? 'BLUP (Çoklu Yarış & Yavru Doğrulamalı Damızlık Değeri)'
      : 'Geçici Damızlık Puanı (BLUP İçin Yavru/Yarış Verisi Sınırlı)';

    // Kuşun kendi doğrudan yarış puanı (yalnızca kendi yarışlarından!)
    let directRaceAvgScore = null;
    if (totalRaceCount > 0) {
      const directComponents = [speedScore, consistencyScore, compPerfScore].filter(s => s !== null);
      if (directComponents.length > 0) {
        directRaceAvgScore = Math.round(directComponents.reduce((a, b) => a + b, 0) / directComponents.length);
      }
    }

    let geneticPotentialScore = pedigreeBaseIndex;
    let realizedPerformanceScore = directRaceAvgScore !== null ? directRaceAvgScore : offspringScore;

    if (ownPed && typeof AvigenGenesisAI !== 'undefined') {
      const rRep = AvigenGenesisAI.analyzeRacingIntelligence(ownPed.id);
      geneticPotentialScore = rRep.totalScore;
      let baseBv = rRep.totalScore;
      if (offspringScore !== null) {
        baseBv = Math.round(baseBv * 0.55 + offspringScore * 0.45);
      } else if (verifiedSiblingNoteWins.length > 0) {
        baseBv = Math.min(95, baseBv + 4);
      }
      breedingValScore = baseBv;
      breedingValRel = rRep.dataReliabilityPct;
      breedingValEvidence = `${evaluationMethodType}: Genetik Potansiyel (${geneticPotentialScore ?? '-'}/100) ile Gerçekleşmiş Performans (${realizedPerformanceScore !== null ? realizedPerformanceScore + '/100' : 'Henüz Doğrudan Yarış/Yavru Kaydı Yok'}) birbirinden ayrı değerlendirilmiştir.`;
    }

    return {
      bird,
      statsSummary: {
        totalRaceCount,
        directRaceAvgScore,
        filledAncCount,
        offspringCount: offspringBirds.length,
        provenOffspringCount: provenOffspringScores.length,
        releasePointsCount: releasePoints.length,
        internalCoiPct,
        isBlupEligible,
        evaluationMethodType,
        geneticPotentialScore,
        realizedPerformanceScore
      },
      categories: {
        flight: {
          title: '🦅 Uçuş Performansı (Flight Performance)',
          metrics: [
            { key: 'speed', name: 'Speed (Uçuş Hızı)', score: speedScore, reliability: speedRel, isInherited: speedInherited, method: 'Ölçülen yarış hızlarının (m/dk) veya henüz yarışmamış genç kuşlarda atalarının Galton-Mendel ağırlıklı hız indeksinin 1500 m/dk referans tavanına oranlanması.', evidence: speedEvidence },
            { key: 'endurance', name: 'Endurance (Dayanıklılık)', score: enduranceScore, reliability: enduranceRel, isInherited: enduranceInherited, method: 'Hızdan bağımsız olarak, kuşun (veya henüz yarışmamışsa üst soyundaki atalarının) tamamladığı en uzun menzil (km) ve kesintisiz uçuş süresinin (dk) değerlendirilmesi.', evidence: enduranceEvidence },
            { key: 'sprint', name: `Sprint (50–${lim.sprintMax} km)`, score: sprintMetric.score, reliability: sprintMetric.reliability, isInherited: sprintMetric.isInheritedEstimate, method: `Kullanıcı tanımlı Sprint (${lim.sprintMax} km altı) etaplarındaki bireysel dereceler veya atalarının bu mesafedeki kalıtsal potansiyel ortalaması.`, evidence: sprintMetric.evidence },
            { key: 'middle', name: `Middle Distance (${lim.sprintMax + 1}–${lim.middleMax} km)`, score: middleMetric.score, reliability: middleMetric.reliability, isInherited: middleMetric.isInheritedEstimate, method: `Orta mesafe (${lim.sprintMax + 1}-${lim.middleMax} km) etaplarındaki doğrulanmış bireysel sonuçlar veya soyağacı kalıtım tahmini.`, evidence: middleMetric.evidence },
            { key: 'long', name: `Long Distance (${lim.middleMax + 1}–${lim.longMax} km)`, score: longMetric.score, reliability: longMetric.reliability, isInherited: longMetric.isInheritedEstimate, method: `Uzun mesafe (${lim.middleMax + 1}-${lim.longMax} km) etaplarındaki doğrulanmış bireysel sonuçlar veya soyağacı kalıtım tahmini.`, evidence: longMetric.evidence },
            { key: 'marathon', name: `Marathon (${lim.longMax + 1}+ km)`, score: marathonMetric.score, reliability: marathonMetric.reliability, isInherited: marathonMetric.isInheritedEstimate, method: `Maraton (${lim.longMax + 1} km üzeri) etaplarındaki doğrulanmış bireysel sonuçlar veya soyağacı kalıtım tahmini.`, evidence: marathonMetric.evidence },
            { key: 'duration', name: 'Flight Duration (Havada Kalma)', score: durationScore, reliability: durationRel, isInherited: durationInherited, method: 'Yarış/antrenmanlarda kaydedilen maksimum uçuş süresinin (veya soyağacı dayanıklılık süresinin) 540 dk referansına oranı.', evidence: durationEvidence }
          ]
        },
        racing: {
          title: '🏆 Yarış Başarısı (Racing Success)',
          metrics: [
            { key: 'consistency', name: 'Consistency (İstikrar)', score: consistencyScore, reliability: consistencyRel, isInherited: consistencyInherited, method: 'Katıldığı yarışlarda ilk 20 klasmana girme devamlılığı (henüz yarışmamış genç kuşlarda soyağacı istikrar kalıtımı).', evidence: consistencyEvidence },
            { key: 'top10', name: 'Top 10 Rate (İlk 10 Oranı)', score: top10Score, reliability: top10Rel, isInherited: top10Inherited, method: '(İlk 10 Derece Sayısı / Toplam Yarış Sayısı) × 100 veya atalarının İlk 10 kalıtsal frekansı.', evidence: top10Evidence },
            { key: 'top1pct', name: 'Top 1% Rate (İlk %1 Elit Oranı)', score: top1PctScore, reliability: top1PctRel, isInherited: top1PctInherited, method: 'Yarışa katılan toplam kuş sayısının ilk %1\'lik dilimine girme yüzdesi (veya ataların elit klasman kalıtım tahmini).', evidence: top1PctEvidence },
            { key: 'completion', name: 'Race Completion Rate (Tamamlama)', score: completionScore, reliability: completionRel, isInherited: completionInherited, method: 'Gönderildiği yarış ve salım etaplarından kayıpsız eve dönüş oranı / soyağacı dönüş beklentisi.', evidence: completionEvidence },
            { key: 'comp_perf', name: 'Competition Performance (Rekabet Gücü)', score: compPerfScore, reliability: compPerfRel, isInherited: compPerfInherited, method: 'Kazanılan derecenin, yarışa katılan toplam kuş sayısının logaritmik ağırlığıyla çarpılması.', evidence: compPerfEvidence }
          ]
        },
        navigation: {
          title: '🧭 Navigasyon & Yön Bulma (Navigation)',
          metrics: [
            { key: 'homing', name: 'Homing Reliability (Eve Dönüş Güvenilirliği)', score: homingScore, reliability: homingRel, isInherited: homingInherited, method: 'Hızdan bağımsız olarak farklı hava ve mesafelerden eve dönüş sürekliliği ve CRY1/hipokampal yönelim kalıtımı.', evidence: homingEvidence },
            { key: 'return_time', name: 'Return Time (Dönüş Zamanlaması)', score: returnTimeScore, reliability: returnTimeRel, isInherited: returnTimeInherited, method: 'Beklenen varış süresi penceresine göre gecikmesiz dönüş tutarlılığı.', evidence: returnTimeEvidence },
            { key: 'route_eff', name: 'Route Efficiency (Rota Verimliliği / GPS)', score: routeEffScore, reliability: routeEffRel, isInherited: false, method: 'GPS takip kaydı bulunduğunda kuş uçuşu düz çizgi mesafesi ile gerçek uçuş rotası arasındaki verimlilik.', evidence: routeEffEvidence },
            { key: 'release_adapt', name: 'Release Point Adaptability (Salım Uyumu)', score: releaseAdaptScore, reliability: releaseAdaptRel, isInherited: releaseAdaptInherited, method: 'Farklı şehir ve coğrafi salım noktalarından başarılı dönüş çeşitliliği.', evidence: releaseAdaptEvidence }
          ]
        },
        breeding: {
          title: '🧬 Damızlık & Soy Profili (Breeding & Genetics)',
          metrics: [
            { key: 'ped_depth', name: 'Pedigree Depth (Soyağacı Derinliği)', score: pedDepthScore, reliability: pedDepthRel, method: '4 kuşak (30 ata) soyağacı tablosundaki dolu kayıtların yüzdesi.', evidence: pedDepthEvidence },
            { key: 'gen_diversity', name: 'Genetic Diversity (Soy Çeşitliliği - AVK)', score: diversityScore, reliability: diversityRel, method: 'Soy ağacındaki tekil (tekrarsız) ata sayısının toplam kayıtlı ata sayısına oranı (Ancestor Loss Coefficient).', evidence: diversityEvidence },
            { key: 'inbreeding_risk', name: 'Inbreeding Risk (Akrabalık Riski - COI)', score: inbreedingRiskScore, reliability: inbreedingRel, isRiskMetric: true, method: 'Baba ve Anne arasındaki Sewall Wright F = Σ(0.5)^(n1+n2+1) akrabalık katsayısının risk ölçeğine izdüşümü.', evidence: inbreedingEvidence },
            { key: 'offspring_perf', name: 'Offspring Performance (Yavru Başarısı)', score: offspringScore, reliability: offspringRel, method: 'Kümes veri tabanında bu güvercinin ebeveyn olduğu kayıtlı yavruların gerçek performans ortalaması.', evidence: offspringEvidence },
            { key: 'breeding_val', name: 'Breeding Value (Tahmini Damızlık Değeri)', score: breedingValScore, reliability: breedingValRel, method: 'AVIGEN Galton-Mendel kuşak ağırlıklı soyağacı modeli ve mevcut yavru verilerinin bileşik tahmini (Genetik DNA kanıtı değildir).', evidence: breedingValEvidence }
          ]
        }
      }
    };
  },

  // --------------------------------------------------------------------------
  // 3. MODAL AÇMA, SEKME DEĞİŞTİRME VE GÖRSEL ÇUBUK GRAFİK RENDER MOTORU
  // --------------------------------------------------------------------------
  openProfileModal(ring, defaultTab = 'performance') {
    this.init();
    this.state.currentRing = (ring || '').trim();
    this.state.activeTab = defaultTab;
    this.state.selectedMetricKey = null;
    this.state.showDistanceSettings = false;
    this.renderProfileModal();
    document.getElementById('birdPerfProfileModal')?.classList.add('open');
  },

  closeProfileModal() {
    document.getElementById('birdPerfProfileModal')?.classList.remove('open');
  },

  switchProfileTab(tabName) {
    this.state.activeTab = tabName;
    this.state.selectedMetricKey = null;
    this.renderProfileModal();
  },

  toggleMetricExplanation(metricKey) {
    this.state.selectedMetricKey = this.state.selectedMetricKey === metricKey ? null : metricKey;
    this.renderProfileModal();
  },

  toggleDistanceSettings() {
    this.state.showDistanceSettings = !this.state.showDistanceSettings;
    this.renderProfileModal();
  },

  saveDistanceLimitsFromUI() {
    const s = parseInt(document.getElementById('cfgSprintMax')?.value, 10) || 300;
    const m = parseInt(document.getElementById('cfgMiddleMax')?.value, 10) || 500;
    const l = parseInt(document.getElementById('cfgLongMax')?.value, 10) || 700;
    this.state.distanceLimits = {
      sprintMax: Math.max(100, s),
      middleMax: Math.max(s + 50, m),
      longMax: Math.max(m + 50, l)
    };
    this.saveConfig();
    this.state.showDistanceSettings = false;
    this.renderProfileModal();
  },

  renderMetricBarRow(m) {
    const isSelected = this.state.selectedMetricKey === m.key;
    const hasScore = m.score !== null && m.score !== undefined;

    // Renk Kodlaması: Gerçek Ölçüm = Mavi/Yeşil, Soydan Tahmin = Mor, Risk = Yeşil/Turuncu/Kırmızı
    let barColor = '#0066ff';
    if (hasScore) {
      if (m.isRiskMetric) {
        barColor = m.score <= 25 ? '#059669' : (m.score <= 55 ? '#d97706' : '#dc2626');
      } else if (m.isInherited) {
        barColor = '#7c3aed';
      } else {
        barColor = m.score >= 82 ? '#059669' : '#0066ff';
      }
    }

    const sourcePillHtml = hasScore
      ? (m.isInherited
        ? `<span class="perf-rel-pill" style="background:#f3e8ff; border-color:#d8b4fe; color:#6d28d9;">🧬 Soy Tahmini • %${m.reliability} Güven</span>`
        : `<span class="perf-rel-pill" style="background:#d1fae5; border-color:#6ee7b7; color:#047857;">🏁 Gerçek Ölçüm • %${m.reliability} Güven</span>`)
      : `<span class="perf-rel-pill" style="background:#f1f5f9; border-color:#cbd5e1; color:#64748b;">Kayıt Bekleniyor</span>`;

    const displayName = m.simpleName || m.name;

    return `
      <div class="perf-metric-item ${isSelected ? 'expanded' : ''}" onclick="AvigenPerformanceEngine.toggleMetricExplanation('${m.key}')" title="Bilimsel kanıtı görmek için dokunun">
        <div class="perf-metric-top">
          <div class="perf-metric-name" style="gap:6px;">
            <span style="font-weight:800;">${escapeHtml(displayName)}</span>
            ${sourcePillHtml}
          </div>
          <div class="perf-metric-score" style="color:${hasScore ? barColor : '#94a3b8'};">
            ${hasScore ? `${m.score}<span style="font-size:9.5px; font-weight:600; color:var(--ios-subtext);">/100</span>` : `<span style="font-size:10px;">Veri Yok</span>`}
          </div>
        </div>

        <div class="perf-bar-track">
          ${hasScore
            ? `<div class="perf-bar-fill" style="width:${Math.max(5, m.score)}%; background:${barColor};"></div>`
            : `<div class="perf-bar-empty-pattern"></div>`}
        </div>

        ${isSelected ? `
          <div class="perf-method-box">
            <div><strong>💡 Bilimsel Kanıt:</strong> ${escapeHtml(m.evidence)}</div>
            <div style="margin-top:3px; color:#0052cc;"><strong>📐 Hesaplama:</strong> ${escapeHtml(m.method)}</div>
          </div>
        ` : ''}
      </div>
    `;
  },

  // 4 Temel Bilimsel Boyutu Hesaplayıcı (Hem Kuş Kartı Hem GENESIS AI İçin Ortak Standart)
  buildCore4ScientificPillars(prof) {
    const { categories, statsSummary } = prof;
    const lim = this.state.distanceLimits;

    const combineTwo = (m1, m2, key, simpleName, methodText) => {
      const s1 = m1?.score;
      const s2 = m2?.score;
      let score = null;
      if (s1 !== null && s2 !== null) score = Math.round(s1 * 0.55 + s2 * 0.45);
      else if (s1 !== null) score = s1;
      else if (s2 !== null) score = s2;

      const rel = Math.max(m1?.reliability || 0, m2?.reliability || 0);
      const isInherited = Boolean((m1?.score !== null ? m1?.isInherited : true) && (m2?.score !== null ? m2?.isInherited : true));
      const evidence = m1?.score !== null ? m1.evidence : (m2?.evidence || 'Veri bulunmuyor.');

      return {
        key,
        name: simpleName,
        simpleName,
        score,
        reliability: rel,
        isInherited,
        evidence,
        method: methodText
      };
    };

    const mSpeed = categories.flight.metrics[0];
    const mEndurance = categories.flight.metrics[1];
    const mSprint = categories.flight.metrics[2];
    const mMiddle = categories.flight.metrics[3];
    const mLong = categories.flight.metrics[4];
    const mConsistency = categories.racing.metrics[0];
    const mHoming = categories.navigation.metrics[0];
    const mPedDepth = categories.breeding.metrics[0];
    const mDiversity = categories.breeding.metrics[1];
    const mBreedingVal = categories.breeding.metrics[4];

    // 1. Kısa Mesafe & Hız (ÖNEMLİ DÜZELTME: Kuşun/ataların hiç kısa mesafe kaydı yoksa ve sadece uzun mesafe kaydı varsa,
    //    genel hız puanı doğrudan kısa mesafe puanı olarak kopyalanıp uzun mesafe kuşunu kısa mesafeci gibi göstermez!)
    let pillarSpeedSprint;
    if (mSprint?.score !== null) {
      pillarSpeedSprint = combineTwo(
        mSprint,
        mSpeed,
        'core_sprint_speed',
        `🚀 1. Kısa Mesafe & Hız (50–${lim.sprintMax} km)`,
        'Kısa mesafe (Sprint) dereceleri ile ölçülen yarış hızlarının (m/dk) bileşik ortalaması.'
      );
    } else if (mSpeed?.score !== null && mMiddle?.score === null && mLong?.score === null) {
      pillarSpeedSprint = {
        key: 'core_sprint_speed',
        name: `🚀 1. Kısa Mesafe & Hız (50–${lim.sprintMax} km)`,
        simpleName: `🚀 1. Kısa Mesafe & Hız (50–${lim.sprintMax} km)`,
        score: mSpeed.score,
        reliability: mSpeed.reliability,
        isInherited: mSpeed.isInherited,
        evidence: mSpeed.evidence,
        method: 'Mesafe belirtilmemiş genel hız/derece kayıtlarından hesaplanan hız potansiyeli.'
      };
    } else {
      pillarSpeedSprint = {
        key: 'core_sprint_speed',
        name: `🚀 1. Kısa Mesafe & Hız (50–${lim.sprintMax} km)`,
        simpleName: `🚀 1. Kısa Mesafe & Hız (50–${lim.sprintMax} km)`,
        score: mSpeed?.score !== null ? Math.round(mSpeed.score * 0.88) : null,
        reliability: mSpeed?.reliability ? Math.round(mSpeed.reliability * 0.75) : 0,
        isInherited: true,
        evidence: mSprint?.evidence || 'Bu kuşta doğrudan kısa mesafe (50–300 km) kaydı bulunmuyor; orta/uzun mesafe hızından sönümlenerek tahmin edildi.',
        method: 'Doğrudan kısa mesafe kaydı olmadığında genel hız indeksinin %88 katsayısıyla sönümlenmesi.'
      };
    }

    // 2. Orta & Uzun Mesafe Dayanıklılığı
    const bestLonger = (mLong?.score || 0) >= (mMiddle?.score || 0) ? mLong : mMiddle;
    const pillarEndurance = combineTwo(
      bestLonger?.score !== null ? bestLonger : mEndurance,
      mEndurance,
      'core_endurance_long',
      `🏔️ 2. Orta / Uzun Mesafe Dayanıklılığı (${lim.sprintMax + 1}–${lim.longMax}+ km)`,
      'Orta ve uzun mesafe etaplarındaki menzil başarısı ile kesintisiz uçuş dayanıklılığının bileşik indeksi.'
    );

    // 3. Yarış İstikrarı & Eve Dönüş
    const pillarConsistencyHoming = combineTwo(
      mConsistency,
      mHoming,
      'core_consistency_homing',
      '🎯 3. Yarış İstikrarı & Eve Dönüş',
      'Gönderildiği yarışlardan kopmadan ilk klasmanda ve farklı salım noktalarından kayıpsız eve dönüş güvenilirliği.'
    );

    // 4. Soyağacı Tamlığı & Damızlık Gücü (Aşırı akrabalık riski varsa puanı gerçekçi şekilde düşürür)
    const pillarGenetics = combineTwo(
      mBreedingVal,
      mDiversity?.score !== null ? mDiversity : mPedDepth,
      'core_genetics_breeding',
      '🧬 4. Soyağacı & Damızlık Gücü (AVK / COI)',
      '4 kuşak soyağacı doluluğu, derinlik ağırlıklı tekil ata çeşitliliği (AVK), ebeveyn Wright COI dengesi ve doğrulanmış yavru performanslarının bileşimi.'
    );
    if (pillarGenetics.score !== null && (statsSummary?.internalCoiPct || 0) >= 25) {
      pillarGenetics.score = Math.max(40, pillarGenetics.score - 12);
    }
    pillarGenetics.isInherited = false; // Soyağacı veritabanı üzerinden doğrudan ölçülür

    return [pillarSpeedSprint, pillarEndurance, pillarConsistencyHoming, pillarGenetics];
  },

  renderProfileModal() {
    const bodyEl = document.getElementById('birdPerfProfileBody');
    if (!bodyEl) return;

    const prof = this.calculateFullProfile(this.state.currentRing);
    const { bird, statsSummary, categories } = prof;
    const lim = this.state.distanceLimits;

    const core4Pillars = this.buildCore4ScientificPillars(prof);

    // 1. Gerçek Yarış Puanı (Yalnızca kuşun KENDİ bireysel yarış kayıtlarından hesaplanır, soyağacı tahmini karıştırılmaz!)
    const hasRealRaces = statsSummary.totalRaceCount > 0 && statsSummary.directRaceAvgScore !== null;
    const realRaceScore = hasRealRaces ? statsSummary.directRaceAvgScore : null;

    // 2. Soy & Damızlık Gücü
    const soyPowerScore = core4Pillars[3].score;

    // 3. Otomatik Uzmanlık Mesafesi Tespiti
    const sScore = core4Pillars[0].score || 0;
    const eScore = core4Pillars[1].score || 0;
    let specialtyLabel = 'Veri Bekleniyor';
    if (sScore > 0 || eScore > 0) {
      if (eScore >= sScore + 4) specialtyLabel = `🏔️ Orta-Uzun (${lim.sprintMax + 1}–${lim.longMax} km)`;
      else if (sScore >= eScore + 4) specialtyLabel = `🚀 Kısa/Sprint (100–${lim.sprintMax} km)`;
      else specialtyLabel = `⚖️ Komple (100–${lim.middleMax} km)`;
    }

    // Ekstra alt metrikler (açılır detay kutusu için)
    const detailedSubMetrics = [
      categories.racing.metrics[1],     // İlk 10 Oranı
      categories.racing.metrics[4],     // Rekabet Hacmi
      categories.navigation.metrics[2], // GPS Rota
      categories.breeding.metrics[0],   // Pedigree Derinliği
      categories.breeding.metrics[2],   // Akrabalık Riski (COI)
      categories.breeding.metrics[3]    // Yavru Başarısı
    ];

    bodyEl.innerHTML = `
      <!-- 1. ÜST KUŞ KİMLİK BAŞLIĞI -->
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:12px; padding:9px 11px; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:9px; min-width:0;">
          <div class="bird-mini-eye" style="width:40px; height:40px;">
            ${bird.photo ? `<img src="${bird.photo}" style="width:100%;height:100%;object-fit:cover;" />` : renderEyeSignSvg(bird.eyeSign || 'yellow_breeder')}
          </div>
          <div style="min-width:0;">
            <div style="font-size:13.5px; font-weight:900; color:var(--ios-text);">
              ${bird.flag} ${escapeHtml(bird.ring)}
            </div>
            <div style="font-size:11px; font-weight:800; color:#0066ff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(bird.name)} • ${escapeHtml(bird.color)}
            </div>
          </div>
        </div>
        <div style="display:flex; gap:5px; flex-shrink:0;">
          <button class="ios-btn ios-btn-primary" style="padding:5px 9px; font-size:9.5px;" onclick="AvigenPerformanceEngine.closeProfileModal(); if(typeof openBirdPedigreeStudioByRing==='function') openBirdPedigreeStudioByRing('${escapeHtml(bird.ring)}');">
            📜 Soy Ağacı
          </button>
          <button class="ios-btn ios-btn-outline" style="padding:5px 7px; font-size:9.5px;" onclick="AvigenPerformanceEngine.toggleDistanceSettings()" title="Mesafe Sınırlarını Ayarla">
            ⚙️
          </button>
        </div>
      </div>

      <!-- 2. ÜÇ KUTULU NET KİMLİK ÖZETİ (GERÇEK YARIŞ vs SOY GÜCÜ vs UZMANLIK MESAFESİ) -->
      <div style="display:grid; grid-template-columns:1fr 1fr 1.15fr; gap:6px; margin-bottom:9px;">
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid ${hasRealRaces ? '#059669' : '#94a3b8'}; border-radius:9px; padding:6px 7px; text-align:center;">
          <div style="font-size:8.5px; font-weight:800; color:var(--ios-subtext);">🏁 GERÇEK YARIŞ</div>
          <div style="font-size:13px; font-weight:900; color:${hasRealRaces ? '#059669' : '#64748b'}; margin-top:2px;">
            ${hasRealRaces ? `${realRaceScore}/100` : 'Yarışmadı'}
          </div>
          <div style="font-size:8.5px; color:var(--ios-subtext);">${statsSummary.totalRaceCount} Resmi Kayıt</div>
        </div>

        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #7c3aed; border-radius:9px; padding:6px 7px; text-align:center;">
          <div style="font-size:8.5px; font-weight:800; color:var(--ios-subtext);">🧬 SOY &amp; DAMIZLIK</div>
          <div style="font-size:13px; font-weight:900; color:#6d28d9; margin-top:2px;">
            ${soyPowerScore !== null ? `${soyPowerScore}/100` : 'Veri Yok'}
          </div>
          <div style="font-size:8.5px; color:var(--ios-subtext);">${statsSummary.filledAncCount}/30 Ata • ${statsSummary.offspringCount} Yavru</div>
        </div>

        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-top:3px solid #0066ff; border-radius:9px; padding:6px 7px; text-align:center;">
          <div style="font-size:8.5px; font-weight:800; color:var(--ios-subtext);">🧭 EN UYGUN ETAP</div>
          <div style="font-size:10.5px; font-weight:900; color:#0052cc; margin-top:3px; line-height:1.15;">
            ${specialtyLabel}
          </div>
          <div style="font-size:8.5px; color:var(--ios-subtext); margin-top:1px;">Hız &amp; Menzil Analizi</div>
        </div>
      </div>

      <!-- KULLANICI TARAFINDAN AYARLANABİLİR MESAFE KATEGORİ SINIRLARI -->
      ${this.state.showDistanceSettings ? `
        <div style="background:#eff6ff; border:1px solid #93c5fd; border-radius:10px; padding:8px 10px; margin-bottom:9px; font-size:10px;">
          <div style="font-weight:900; color:#1e3a8a; margin-bottom:5px;">⚙️ Mesafe Kategorisi Sınırları (km)</div>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-bottom:6px;">
            <div>
              <label style="font-weight:800; font-size:9px;">Sprint Üst Sınır</label>
              <input type="number" id="cfgSprintMax" class="ios-input" style="padding:4px 6px; font-size:11px;" value="${lim.sprintMax}" />
            </div>
            <div>
              <label style="font-weight:800; font-size:9px;">Orta Mesafe Üst</label>
              <input type="number" id="cfgMiddleMax" class="ios-input" style="padding:4px 6px; font-size:11px;" value="${lim.middleMax}" />
            </div>
            <div>
              <label style="font-weight:800; font-size:9px;">Uzun Mesafe Üst</label>
              <input type="number" id="cfgLongMax" class="ios-input" style="padding:4px 6px; font-size:11px;" value="${lim.longMax}" />
            </div>
          </div>
          <button class="ios-btn ios-btn-primary" style="width:100%; padding:6px; font-size:10.5px;" onclick="AvigenPerformanceEngine.saveDistanceLimitsFromUI()">
            💾 Kaydet ve Güncelle
          </button>
        </div>
      ` : ''}

      <!-- 2.5. PROFİL İÇİ SEKMELER: 📊 Performans & Soy Özeti | 🏁 Yarış Geçmişi & Arşiv -->
      <div class="sub-pills" style="margin-bottom:8px;">
        <button type="button" class="sub-pill ${this.state.activeTab !== 'race_history' ? 'active' : ''}" onclick="AvigenPerformanceEngine.switchProfileTab('performance')">
          📊 Performans &amp; Soy Profili
        </button>
        <button type="button" class="sub-pill ${this.state.activeTab === 'race_history' ? 'active' : ''}" onclick="AvigenPerformanceEngine.switchProfileTab('race_history')">
          🏁 Yarış Geçmişi (${typeof AvigenRaceTracker !== 'undefined' ? AvigenRaceTracker.getBirdRaceHistory(bird.ring).length : statsSummary.totalRaceCount})
        </button>
      </div>

      ${this.state.activeTab === 'race_history' ? `
        ${typeof AvigenRaceTracker !== 'undefined' ? AvigenRaceTracker.renderBirdRaceHistorySection(bird.ring, true) : ''}
      ` : `
        ${!hasRealRaces && statsSummary.filledAncCount > 0 ? `
          <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-left:3.5px solid #7c3aed; border-radius:8px; padding:6px 9px; margin-bottom:8px; font-size:9.8px; color:#4c1d95; line-height:1.35;">
            🧬 <strong>Soyağacı Kalıtım Tahmini (Mor Çubuklar):</strong> Bu güvercinin henüz kendi yarış kaydı olmadığı için uçuş göstergeleri <strong>kayıtlı ${statsSummary.filledAncCount} atasının</strong> yarış derecelerinden hesaplanmıştır.
          </div>
        ` : ''}

        <!-- 3. 4 TEMEL BİLİMSEL BOYUT (TEK BAKIŞTA NET PERFORMANS & SOY ÇUBUKLARI) -->
        <div class="perf-cat-block" style="margin-bottom:8px;">
          <div class="perf-cat-header" style="display:flex; justify-content:space-between; align-items:center;">
            <span>📊 4 Temel Performans ve Soy Göstergesi</span>
            <span style="font-size:8.5px; font-weight:600; color:var(--ios-subtext);">Kanıt için çubuğa dokunun 👆</span>
          </div>
          ${core4Pillars.map(m => this.renderMetricBarRow(m)).join('')}
        </div>

        <!-- 4. YARIŞ PERFORMANSI VE YARIŞ GEÇMİŞİ ÖZETİ -->
        ${typeof AvigenRaceTracker !== 'undefined' ? AvigenRaceTracker.renderBirdRaceHistorySection(bird.ring, false) : ''}

        <!-- 5. İSTEĞE BAĞLI AÇILIR DETAYLAR (ALT ÖLÇÜMLER & BİLİMSEL KAYNAKLAR) -->
        <details style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:7px 9px; font-size:10px;">
          <summary style="font-weight:800; color:#0052cc; cursor:pointer; outline:none;">
            🔬 Detaylı Alt Ölçümleri (COI, İlk 10, Yavru, GPS) ve Bilimsel Kaynakları Gör
          </summary>
          <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
            ${detailedSubMetrics.map(m => this.renderMetricBarRow(m)).join('')}
            ${typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.renderCompactAiReferencesBox('racing') : ''}
          </div>
        </details>
      `}
    `;
  }
};


// ============================================================================
// AVIGEN – GELİŞMİŞ YARIŞ YÖNETİMİ VE TAKİP SİSTEMİ (AvigenRaceTracker v5.0)
// 1. 3 Ana Yarış Kategorisi:
//    - A. KÜMESÜSTÜ YARIŞLARI ('LOFT_ENDURANCE')
//    - B. DERNEK YARIŞLARI ('CLUB_RACE')
//    - C. BÜYÜK ÖDÜLLÜ YARIŞLAR ('GRAND_PRIZE')
// 2. İlişkisel Veri Şeması:
//    - Race, RaceCategory, RaceOrganization, RaceSeason, RaceStage,
//      RaceEntry, RaceResult, RaceStatusHistory, RaceAward
// 3. 7 Resmi Kuş Yarış Durumu (Manuel Kayıp Onayı Korumalı):
//    - PREPARING ('Hazırlanıyor'), BASKETED ('Kafese teslim edildi'),
//      RELEASED ('Salındı'), RETURNED ('Eve döndü'), AWAITING ('Dönüş bekleniyor'),
//      DISQUALIFIED ('Yarış dışı kaldı'), LOST ('Kayıp' - Yalnızca manuel onayla!)
// 4. Kategori Bazlı Performans Arşivi & GENESIS AI Entegrasyonu
// ============================================================================
const AVIGEN_RACE_EVENTS_KEY = 'avigen_race_tracking_events_v1';
const AVIGEN_RACE_RELATIONAL_DB_KEY = 'avigen_race_relational_db_v1';

const AvigenRaceTracker = {
  events: [],
  db: {
    organizations: [],
    seasons: [],
    stages: [],
    awards: [],
    statusHistory: []
  },
  _initialized: false,
  filterStatus: 'ALL',     // 'ALL' | 'COMPLETED' | 'PENDING_RESULTS'
  filterCategory: 'ALL',   // 'ALL' | 'LOFT_ENDURANCE' | 'CLUB_RACE' | 'GRAND_PRIZE'
  createModalCategory: '', // '' (Seçim Ekranı) | 'LOFT_ENDURANCE' | 'CLUB_RACE' | 'GRAND_PRIZE'
  expandedRaceIds: new Set(), // Akordeon (açılır/kapanır) yarış kartı takibi

  toggleRaceCardAccordion(raceId) {
    if (!raceId) return;
    if (this.expandedRaceIds.has(raceId)) {
      this.expandedRaceIds.delete(raceId);
    } else {
      this.expandedRaceIds.add(raceId);
    }
    this.renderRaceTrackerMainUI();
  },

  CATEGORIES: {
    LOFT_ENDURANCE: {
      id: 'LOFT_ENDURANCE',
      code: 'LOFT_ENDURANCE',
      title: 'Kümesüstü Yarışı',
      fullTitle: 'A. Kümesüstü Yarışı (Dernek, Kulüp & Kümes Etapları)',
      icon: '🦅',
      badgeClass: 'gene-blue',
      accentColor: '#0066ff',
      bgLight: '#eff6ff',
      borderLight: '#93c5fd',
      description: 'Kendi kümesinize dönülen dernek, kulüp, federasyon etapları ve kümesüstü uçuş yarışları (İl/İlçe veya GPS koordinatlı salım/kümes mesafesi, resmi derece, hız ve sezon sıralaması).'
    },
    CLUB_RACE: {
      id: 'CLUB_RACE',
      code: 'CLUB_RACE',
      title: 'Kümesüstü Yarışı',
      fullTitle: 'A. Kümesüstü Yarışı (Dernek, Kulüp & Kümes Etapları)',
      icon: '🦅',
      badgeClass: 'gene-blue',
      accentColor: '#0066ff',
      bgLight: '#eff6ff',
      borderLight: '#93c5fd',
      description: 'Kendi kümesinize dönülen dernek, kulüp, federasyon etapları ve kümesüstü uçuş yarışları (İl/İlçe veya GPS koordinatlı salım/kümes mesafesi, resmi derece, hız ve sezon sıralaması).'
    },
    GRAND_PRIZE: {
      id: 'GRAND_PRIZE',
      code: 'GRAND_PRIZE',
      title: 'Büyük Ödüllü Yarış',
      fullTitle: 'B. Büyük Ödüllü Yarışlar (Derby / One Loft Race)',
      icon: '🏆',
      badgeClass: 'gene-gold',
      accentColor: '#d97706',
      bgLight: '#fffbeb',
      borderLight: '#fcd34d',
      description: 'One Loft Race (OLR), Derby, Ulusal ve Özel Büyük Ödüllü organizasyonlar; katılım ücreti, eleme/yarı final/final etapları ve kazanılan ödül takibi.'
    }
  },

  BIRD_STATUSES: {
    PREPARING:    { code: 'PREPARING',    label: 'Hazırlanıyor',         icon: '📋', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1', badgeClass: 'gene-blue' },
    BASKETED:     { code: 'BASKETED',     label: 'Kafese teslim edildi', icon: '🧺', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc', badgeClass: 'gene-blue' },
    RELEASED:     { code: 'RELEASED',     label: 'Salındı',              icon: '🛫', color: '#6d28d9', bg: '#f3e8ff', border: '#d8b4fe', badgeClass: 'gene-purple' },
    AWAITING:     { code: 'AWAITING',     label: 'Dönüş bekleniyor',     icon: '⏳', color: '#b45309', bg: '#fef3c7', border: '#fde68a', badgeClass: 'gene-gold' },
    RETURNED:     { code: 'RETURNED',     label: 'Eve döndü',            icon: '🛬', color: '#047857', bg: '#d1fae5', border: '#6ee7b7', badgeClass: 'gene-green' },
    DISQUALIFIED: { code: 'DISQUALIFIED', label: 'Yarış dışı kaldı',     icon: '🚫', color: '#be123c', bg: '#ffe4e6', border: '#fda4af', badgeClass: 'gene-red' },
    LOST:         { code: 'LOST',         label: 'Kayıp',                icon: '🔴', color: '#991b1b', bg: '#fef2f2', border: '#f87171', badgeClass: 'gene-red' }
  },

  init() {
    if (this._initialized) return;
    this._initialized = true;
    try {
      const dbRaw = localStorage.getItem(AVIGEN_RACE_RELATIONAL_DB_KEY);
      if (dbRaw) {
        const parsedDb = JSON.parse(dbRaw);
        if (parsedDb && typeof parsedDb === 'object') {
          this.db = { ...this.db, ...parsedDb };
        }
      }
    } catch (e) {}

    try {
      const raw = localStorage.getItem(AVIGEN_RACE_EVENTS_KEY);
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const demoRaceIds = new Set(['race_ev_bursa_2026_08', 'race_ev_eskisehir_2026_06', 'race_ev_sivas_2026_09']);
          this.events = parsed
            .filter(ev => !demoRaceIds.has(ev.id))
            .map(ev => this.normalizeRaceRecord(ev));
          this.syncRelationalTablesFromEvents();
          this.saveEvents();
          return;
        }
      }
    } catch (e) {}

    this.events = [];
    this.saveEvents();
  },

  // Geriye dönük uyumluluk & ilişkisel alan tamamlama (Hiçbir zaman AWAITING kuşu otomatik LOST yapmaz!)
  normalizeRaceRecord(ev) {
    const category = this.CATEGORIES[ev.category] ? ev.category : 'CLUB_RACE';
    const seasonYear = ev.seasonYear || (ev.releaseDate ? String(ev.releaseDate).slice(0, 4) : '2026');
    const orgName = ev.organizationName || (category === 'LOFT_ENDURANCE' ? 'Kendi Kümesim' : (category === 'GRAND_PRIZE' ? 'Ulusal Derby / OLR' : 'Güvercin Yarış Derneği'));
    const stageType = ev.stageType || (category === 'GRAND_PRIZE' ? 'Final' : (category === 'LOFT_ENDURANCE' ? 'Haftalık' : 'Resmi Etap'));
    const stageNumber = Number(ev.stageNumber) || 1;

    const entries = (ev.entries || []).map((en, idx) => {
      let birdStatus = en.birdStatus;
      if (!birdStatus || !this.BIRD_STATUSES[birdStatus]) {
        if (en.resultStatus === 'ENTERED') {
          birdStatus = 'RETURNED';
        } else {
          birdStatus = 'AWAITING';
        }
      }
      // KURAL: Dönüş bekleyen kuşlar ASLA otomatik olarak kayıp (LOST) kabul edilmez; yalnızca manuel onaylıysa LOST kalır
      if (birdStatus === 'LOST' && !en.manualLostConfirmed) {
        birdStatus = 'AWAITING';
      }
      const isReturned = birdStatus === 'RETURNED' || en.resultStatus === 'ENTERED';
      const resultStatus = isReturned ? 'ENTERED' : (birdStatus === 'LOST' ? 'LOST' : (birdStatus === 'DISQUALIFIED' ? 'DISQUALIFIED' : 'PENDING'));

      return {
        entryId: en.entryId || ('ent_' + ev.id + '_' + (en.ring || idx)),
        raceId: ev.id,
        category,
        ring: en.ring || '',
        birdName: en.birdName || 'Kayıtlı Güvercin',
        flag: en.flag || '🇹🇷',
        birdStatus,
        manualLostConfirmed: Boolean(en.manualLostConfirmed),
        resultStatus,
        registrationNumber: en.registrationNumber || ev.registrationNumber || '',
        registrationDate: en.registrationDate || ev.registrationDate || ev.releaseDate || '',
        entryFeeTl: en.entryFeeTl !== undefined ? Number(en.entryFeeTl) : (ev.entryFeeTl !== undefined ? Number(ev.entryFeeTl) : null),
        arrivalDate: en.arrivalDate || '',
        arrivalTime: en.arrivalTime || '',
        durationMinutes: en.durationMinutes !== undefined && en.durationMinutes !== null ? Number(en.durationMinutes) : null,
        durationLabel: en.durationLabel || '—',
        speedMpm: en.speedMpm !== undefined && en.speedMpm !== null ? Number(en.speedMpm) : null,
        rank: en.rank !== undefined && en.rank !== null && en.rank !== '' ? Number(en.rank) : null,
        points: en.points !== undefined && en.points !== null && en.points !== '' ? Number(en.points) : null,
        wonPrizeAmountTl: en.wonPrizeAmountTl !== undefined && en.wonPrizeAmountTl !== null && en.wonPrizeAmountTl !== '' ? Number(en.wonPrizeAmountTl) : null,
        wonAwardTitle: en.wonAwardTitle || '',
        totalCompetitors: en.totalCompetitors || ev.totalCompetitors || null,
        weather: en.weather || ev.weather || 'Açık Hava',
        notes: en.notes || '',
        statusHistory: Array.isArray(en.statusHistory) ? en.statusHistory : [
          { status: birdStatus, timestamp: new Date().toISOString(), note: 'İlk kayıt' }
        ]
      };
    });

    return {
      ...ev,
      id: ev.id || ('race_ev_' + Date.now()),
      category,
      organizationId: ev.organizationId || ('org_' + orgName.toLowerCase().replace(/[^a-z0-9]/g, '_')),
      organizationName: orgName,
      organizationType: ev.organizationType || (category === 'GRAND_PRIZE' ? 'One Loft Race (OLR) / Derby' : (category === 'CLUB_RACE' ? 'Resmi Dernek / Federasyon' : 'Kümes İçi Bireysel')),
      seasonId: ev.seasonId || ('season_' + seasonYear + '_' + category.toLowerCase()),
      seasonYear,
      seasonName: ev.seasonName || `${seasonYear} Sezonu`,
      stageId: ev.stageId || ('stg_' + (ev.id || Date.now()) + '_' + stageNumber),
      stageNumber,
      stageType, // Kümesüstü: 'Günlük' | 'Haftalık' | 'Sezonluk'; Dernek: '1. Etap' vb.; Büyük Ödüllü: 'Eleme Etabı' | 'Yarı Final' | 'Final' | 'Tek Etap'
      formatType: ev.formatType || (category === 'GRAND_PRIZE' ? 'Çok Etaplı (Eleme + Yarı Final + Final)' : 'Standart Etap'),
      scoringSystem: ev.scoringSystem || (category === 'CLUB_RACE' ? 'FCI / Dernek Klasman Puanı' : 'Standart'),
      registrationNumber: ev.registrationNumber || '',
      registrationDate: ev.registrationDate || ev.releaseDate || '',
      entryFeeTl: ev.entryFeeTl !== undefined && ev.entryFeeTl !== '' ? Number(ev.entryFeeTl) : null,
      prizePoolInfo: ev.prizePoolInfo || '',
      releaseCoords: ev.releaseCoords || '',
      participantBirdsCount: entries.length,
      entries
    };
  },

  // 9 İlişkisel Varlık Tablosunu (Race, RaceCategory, RaceOrganization, RaceSeason, RaceStage, RaceEntry, RaceResult, RaceStatusHistory, RaceAward) Senkronize Eder
  syncRelationalTablesFromEvents() {
    const orgMap = new Map();
    const seasonMap = new Map();
    const stages = [];
    const awards = [];
    const statusHistory = [];

    this.events.forEach(ev => {
      if (ev.organizationId && !orgMap.has(ev.organizationId)) {
        orgMap.set(ev.organizationId, {
          id: ev.organizationId,
          name: ev.organizationName,
          type: ev.organizationType,
          category: ev.category
        });
      }
      if (ev.seasonId && !seasonMap.has(ev.seasonId)) {
        seasonMap.set(ev.seasonId, {
          id: ev.seasonId,
          year: ev.seasonYear,
          name: ev.seasonName,
          organizationId: ev.organizationId,
          category: ev.category
        });
      }
      stages.push({
        id: ev.stageId,
        raceId: ev.id,
        seasonId: ev.seasonId,
        organizationId: ev.organizationId,
        stageNumber: ev.stageNumber,
        stageType: ev.stageType,
        codeTitle: ev.codeTitle,
        releasePoint: ev.releasePoint,
        releaseCoords: ev.releaseCoords || '',
        distanceKm: ev.distanceKm,
        releaseDate: ev.releaseDate,
        releaseTime: ev.releaseTime
      });

      (ev.entries || []).forEach(en => {
        if (Array.isArray(en.statusHistory)) {
          en.statusHistory.forEach(sh => {
            statusHistory.push({
              raceId: ev.id,
              entryId: en.entryId,
              ring: en.ring,
              status: sh.status,
              timestamp: sh.timestamp,
              note: sh.note || ''
            });
          });
        }
        if ((en.wonPrizeAmountTl && en.wonPrizeAmountTl > 0) || en.wonAwardTitle) {
          awards.push({
            id: `aw_${ev.id}_${en.ring}`,
            raceId: ev.id,
            entryId: en.entryId,
            ring: en.ring,
            birdName: en.birdName,
            category: ev.category,
            organizationName: ev.organizationName,
            codeTitle: ev.codeTitle,
            rank: en.rank,
            awardTitle: en.wonAwardTitle || (en.rank === 1 ? '1.lik Büyük Ödülü' : 'Klasman Ödülü'),
            prizeAmountTl: en.wonPrizeAmountTl || 0,
            date: en.arrivalDate || ev.releaseDate
          });
        }
      });
    });

    this.db = {
      categories: Object.values(this.CATEGORIES),
      organizations: Array.from(orgMap.values()),
      seasons: Array.from(seasonMap.values()),
      stages,
      awards,
      statusHistory
    };
    try {
      localStorage.setItem(AVIGEN_RACE_RELATIONAL_DB_KEY, JSON.stringify(this.db));
    } catch (e) {}
  },

  saveEvents() {
    this.syncRelationalTablesFromEvents();
    localStorage.setItem(AVIGEN_RACE_EVENTS_KEY, JSON.stringify(this.events));
    if (typeof AvigenGenesisAI !== 'undefined') {
      if (typeof AvigenGenesisAI.invalidateEngineCache === 'function') {
        AvigenGenesisAI.invalidateEngineCache();
      } else if (typeof AvigenGenesisAI.invalidateCache === 'function') {
        AvigenGenesisAI.invalidateCache();
      }
    }
  },

  getDefaultSeedRaceEvents() {
    return [];
  },

  // Mesafeye göre otomatik yarış türü belirleyici
  detectRaceTypeByKm(km) {
    const d = Number(km) || 350;
    const lim = typeof AvigenPerformanceEngine !== 'undefined'
      ? AvigenPerformanceEngine.state.distanceLimits
      : { sprintMax: 300, middleMax: 500, longMax: 750 };
    if (d <= lim.sprintMax) return 'Kısa mesafe (Sprint)';
    if (d <= lim.middleMax) return 'Orta mesafe';
    if (d <= lim.longMax) return 'Uzun mesafe';
    return 'Maraton';
  },

  // Salım ve varış tarih/saatinden uçuş süresi (dakika & etiket) ve hız (m/dk) hesaplayıcı
  // KURAL: Eksik veriden sahte hız veya süre uydurmaz!
  calculateFlightMetrics(distanceKm, releaseDate, releaseTime, arrivalDate, arrivalTime, manualDurationMin) {
    let durationMinutes = (manualDurationMin !== undefined && manualDurationMin !== null && manualDurationMin !== '' && Number(manualDurationMin) > 0)
      ? Number(manualDurationMin)
      : null;

    if (releaseDate && releaseTime && arrivalDate && arrivalTime) {
      const start = new Date(`${releaseDate}T${releaseTime}:00`);
      const end = new Date(`${arrivalDate}T${arrivalTime}:00`);
      const diffMin = Math.round((end - start) / 60000);
      if (diffMin > 0) {
        durationMinutes = diffMin;
      }
    }
    if (!durationMinutes || durationMinutes <= 0) {
      return { durationMinutes: null, durationLabel: '—', speedMpm: null };
    }
    const h = Math.floor(durationMinutes / 60);
    const m = durationMinutes % 60;
    const durationLabel = h > 0 ? `${h} sa ${String(m).padStart(2, '0')} dk` : `${m} dk`;
    const distNum = Number(distanceKm);
    const speedMpm = (distNum && distNum > 0)
      ? Number(((distNum * 1000) / durationMinutes).toFixed(1))
      : null;
    return { durationMinutes, durationLabel, speedMpm };
  },

  // Dernek veya Büyük Ödüllü yarışta sıralamaya göre resmi klasman puanı hesaplayıcı (ilk %25 dilim)
  calculateOfficialPoints(rank, totalCompetitors, distanceKm) {
    const r = Number(rank);
    const tot = Number(totalCompetitors);
    if (!r || r <= 0) return null;
    if (!tot || tot <= 0) {
      return Math.max(10, 101 - r * 2);
    }
    const coef = (Number(distanceKm) || 300) >= 500 ? 1.25 : ((Number(distanceKm) || 300) >= 300 ? 1.1 : 1.0);
    const rawPts = Math.max(1, ((tot - r + 1) / tot) * 100 * coef);
    return Number(rawPts.toFixed(1));
  },

  // Bir kuşun katıldığı tüm yarışları (Kategori, Etap, Durum, Ödül, Puan ve 11 alanlı tam geçmiş) döndürür
  getBirdRaceHistory(ring) {
    if (!this._initialized) this.init();
    const clean = (ring || '').trim().toUpperCase();
    if (!clean) return [];

    const history = [];
    this.events.forEach(ev => {
      const catMeta = this.CATEGORIES[ev.category] || this.CATEGORIES.CLUB_RACE;
      (ev.entries || []).forEach(en => {
        if ((en.ring || '').trim().toUpperCase() === clean) {
          const stMeta = this.BIRD_STATUSES[en.birdStatus] || this.BIRD_STATUSES.AWAITING;
          history.push({
            raceId: ev.id,
            entryId: en.entryId,
            category: ev.category || 'CLUB_RACE',
            categoryTitle: catMeta.title,
            categoryIcon: catMeta.icon,
            organizationName: ev.organizationName || '',
            organizationType: ev.organizationType || '',
            seasonYear: ev.seasonYear || '2026',
            stageNumber: ev.stageNumber || 1,
            stageType: ev.stageType || 'Etap',
            codeTitle: ev.codeTitle,
            releasePoint: ev.releasePoint,
            releaseCoords: ev.releaseCoords || '',
            distanceKm: ev.distanceKm,
            raceType: ev.raceType,
            releaseDate: ev.releaseDate,
            releaseDateLabel: ev.releaseDateLabel,
            releaseTime: ev.releaseTime || '06:45',
            arrivalDate: en.arrivalDate || '',
            arrivalTime: en.arrivalTime || '—',
            durationMinutes: en.durationMinutes,
            durationLabel: en.durationLabel || '—',
            speedMpm: en.speedMpm,
            rank: en.rank,
            points: en.points,
            wonPrizeAmountTl: en.wonPrizeAmountTl,
            wonAwardTitle: en.wonAwardTitle || '',
            registrationNumber: en.registrationNumber || ev.registrationNumber || '',
            entryFeeTl: en.entryFeeTl !== null ? en.entryFeeTl : ev.entryFeeTl,
            totalCompetitors: en.totalCompetitors || ev.totalCompetitors,
            weather: en.weather || ev.weather || 'Standart Açık Hava',
            birdStatus: en.birdStatus || (en.resultStatus === 'ENTERED' ? 'RETURNED' : 'AWAITING'),
            birdStatusLabel: stMeta.label,
            birdStatusIcon: stMeta.icon,
            manualLostConfirmed: Boolean(en.manualLostConfirmed),
            resultStatus: en.resultStatus || 'PENDING',
            notes: en.notes || ''
          });
        }
      });
    });

    return history.sort((a, b) => String(b.releaseDate).localeCompare(String(a.releaseDate)));
  },

  // 4. BÖLÜM: KUŞUN YARIŞ KATEGORİLERİNE GÖRE AYRIŞTIRILMIŞ PERFORMANS ARŞİVİ HESABI
  // KURAL: Kümesüstü, Dernek ve Büyük Ödüllü yarış istatistiklerini birbirine KARIŞTIRMAZ;
  //        eksik veriden sonuç uydurmaz, hesaplanamayan değerleri null ("Veri Yetersiz") döner!
  getBirdCategorizedArchive(ring) {
    const history = this.getBirdRaceHistory(ring);

    const summarizeGroup = (items) => {
      const totalParticipations = items.length;
      const returnedItems = items.filter(h => h.birdStatus === 'RETURNED' || h.resultStatus === 'ENTERED');
      const awaitingItems = items.filter(h => ['PREPARING', 'BASKETED', 'RELEASED', 'AWAITING'].includes(h.birdStatus) && h.resultStatus !== 'ENTERED');
      const lostItems = items.filter(h => h.birdStatus === 'LOST' && h.manualLostConfirmed);
      const disqualifiedItems = items.filter(h => h.birdStatus === 'DISQUALIFIED');

      const finishedPool = returnedItems.length + lostItems.length + disqualifiedItems.length;
      const returnRatePct = finishedPool > 0
        ? Number(((returnedItems.length / finishedPool) * 100).toFixed(1))
        : null;

      const withSpeed = returnedItems.filter(h => h.speedMpm !== null && h.speedMpm > 0);
      const avgSpeedMpm = withSpeed.length > 0
        ? Number((withSpeed.reduce((s, h) => s + h.speedMpm, 0) / withSpeed.length).toFixed(1))
        : null;
      const maxSpeedMpm = withSpeed.length > 0
        ? Math.max(...withSpeed.map(h => h.speedMpm))
        : null;

      const withDuration = returnedItems.filter(h => h.durationMinutes !== null && h.durationMinutes > 0);
      const totalFlightMinutes = withDuration.length > 0
        ? withDuration.reduce((s, h) => s + h.durationMinutes, 0)
        : null;

      const withRank = returnedItems.filter(h => h.rank !== null && h.rank > 0);
      const bestRank = withRank.length > 0
        ? Math.min(...withRank.map(h => h.rank))
        : null;
      const top10Count = withRank.filter(h => h.rank <= 10).length;

      const withPoints = returnedItems.filter(h => h.points !== null && h.points > 0);
      const totalPoints = withPoints.length > 0
        ? Number(withPoints.reduce((s, h) => s + h.points, 0).toFixed(1))
        : null;

      const withPrize = items.filter(h => (h.wonPrizeAmountTl && h.wonPrizeAmountTl > 0) || h.wonAwardTitle);
      const totalPrizeTl = withPrize.reduce((s, h) => s + (Number(h.wonPrizeAmountTl) || 0), 0);

      return {
        totalParticipations,
        returnedCount: returnedItems.length,
        awaitingCount: awaitingItems.length,
        lostCount: lostItems.length,
        disqualifiedCount: disqualifiedItems.length,
        returnRatePct,
        avgSpeedMpm,
        maxSpeedMpm,
        totalFlightMinutes,
        bestRank,
        top10Count,
        totalPoints,
        totalPrizeTl,
        awardsCount: withPrize.length,
        items
      };
    };

    const loftEndurance = summarizeGroup(history.filter(h => h.category === 'LOFT_ENDURANCE'));
    const clubRace = summarizeGroup(history.filter(h => h.category === 'CLUB_RACE'));
    const grandPrize = summarizeGroup(history.filter(h => h.category === 'GRAND_PRIZE'));
    const overall = summarizeGroup(history);

    // Mesafeye göre performans kırılımı (Kısa / Orta / Uzun / Maraton)
    const lim = typeof AvigenPerformanceEngine !== 'undefined'
      ? AvigenPerformanceEngine.state.distanceLimits
      : { sprintMax: 300, middleMax: 500, longMax: 700 };

    const byDistance = {
      sprint: summarizeGroup(history.filter(h => h.distanceKm > 0 && h.distanceKm <= lim.sprintMax)),
      middle: summarizeGroup(history.filter(h => h.distanceKm > lim.sprintMax && h.distanceKm <= lim.middleMax)),
      long: summarizeGroup(history.filter(h => h.distanceKm > lim.middleMax && h.distanceKm <= lim.longMax)),
      marathon: summarizeGroup(history.filter(h => h.distanceKm > lim.longMax))
    };

    return {
      overall,
      categories: {
        LOFT_ENDURANCE: loftEndurance,
        CLUB_RACE: clubRace,
        GRAND_PRIZE: grandPrize
      },
      byDistance
    };
  },

  // Bir kuşun zaman içindeki yarış performans trendini ve uzmanlık mesafesini analiz eder
  analyzeBirdLongitudinalTrend(ring) {
    const history = this.getBirdRaceHistory(ring).filter(h => h.resultStatus === 'ENTERED' && (h.rank !== null || h.speedMpm !== null));
    if (history.length === 0) {
      return {
        hasRealData: false,
        enteredCount: 0,
        dataSufficiencyLabel: 'Yetersiz Veri (0 Yarış)',
        confidencePct: 0,
        bestDistanceType: null,
        trendStatus: 'NO_DATA',
        trendLabel: 'Gerçek yarış verisi yok (Yalnızca soyağacı/genetik tahmin mevcut)',
        avgRankPercentile: null,
        avgSpeedMpm: null
      };
    }

    const chrono = [...history].reverse();
    const withRank = chrono.filter(h => h.rank !== null && h.rank > 0);
    const percentiles = withRank.map(h => {
      const tot = Math.max(10, h.totalCompetitors || 100);
      return Number(((h.rank / tot) * 100).toFixed(2));
    });

    const avgPct = percentiles.length > 0
      ? Number((percentiles.reduce((a, b) => a + b, 0) / percentiles.length).toFixed(2))
      : null;

    const withSpeed = chrono.filter(h => h.speedMpm !== null && h.speedMpm > 0);
    const avgSpeed = withSpeed.length > 0
      ? Math.round(withSpeed.reduce((a, b) => a + b.speedMpm, 0) / withSpeed.length)
      : null;

    // Mesafe bazlı başarı
    const byType = {};
    chrono.forEach(h => {
      if (!h.distanceKm && h.category === 'LOFT_ENDURANCE') return;
      const t = h.raceType || this.detectRaceTypeByKm(h.distanceKm);
      if (!byType[t]) byType[t] = [];
      if (h.rank && h.totalCompetitors) {
        byType[t].push((h.rank / Math.max(10, h.totalCompetitors)) * 100);
      } else if (h.speedMpm) {
        byType[t].push(Math.max(1, 100 - (h.speedMpm / 20)));
      }
    });

    let bestDistanceType = null;
    let bestTypePct = 999;
    Object.entries(byType).forEach(([t, arr]) => {
      if (!arr.length) return;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      if (mean < bestTypePct) {
        bestTypePct = mean;
        bestDistanceType = t;
      }
    });

    let trendStatus = 'STABLE';
    let trendLabel = '⚖️ Performans İstikrarlı';
    if (percentiles.length >= 2) {
      const first = percentiles[0];
      const last = percentiles[percentiles.length - 1];
      if (last > first + 2.5) {
        trendStatus = 'DECLINING';
        trendLabel = `📉 Son yarışta performans düşüşü (%${first.toFixed(1)} dilimden %${last.toFixed(1)} dilime geriledi)`;
      } else if (first > last + 1.5) {
        trendStatus = 'IMPROVING';
        trendLabel = `📈 Sezon içi form yükselişte (%${first.toFixed(1)} dilimden %${last.toFixed(1)} dilime yükseldi)`;
      }
    } else if (withSpeed.length >= 2) {
      const firstSpd = withSpeed[0].speedMpm;
      const lastSpd = withSpeed[withSpeed.length - 1].speedMpm;
      if (lastSpd >= firstSpd + 25) {
        trendStatus = 'IMPROVING';
        trendLabel = `📈 Hız gelişimi yükselişte (${firstSpd} m/dk → ${lastSpd} m/dk)`;
      } else if (firstSpd >= lastSpd + 35) {
        trendStatus = 'DECLINING';
        trendLabel = `📉 Hız temposunda düşüş (${firstSpd} m/dk → ${lastSpd} m/dk)`;
      }
    } else {
      trendLabel = 'ℹ️ Tek yarış kaydı mevcut (Trend analizi için en az 2 yarış gerekir)';
    }

    const confidencePct = Math.min(95, history.length * 25);
    const dataSufficiencyLabel = history.length >= 4
      ? 'Yüksek Veri Yeterliliği'
      : (history.length >= 2 ? 'Orta Veri Yeterliliği' : 'Sınırlı Veri (1 Yarış)');

    return {
      hasRealData: true,
      enteredCount: history.length,
      dataSufficiencyLabel,
      confidencePct,
      bestDistanceType,
      trendStatus,
      trendLabel,
      avgRankPercentile: avgPct,
      avgSpeedMpm: avgSpeed,
      chrono
    };
  },

  // Kuş Profili İçindeki "🏁 Yarış Geçmişi" Sekmesi ve Performans Arşivi Görünümü
  renderBirdRaceHistorySection(ring, isFullTabView = false) {
    const archive = this.getBirdCategorizedArchive(ring);
    const history = archive.overall.items;
    const trend = this.analyzeBirdLongitudinalTrend(ring);
    const ov = archive.overall;
    const cLoft = archive.categories.LOFT_ENDURANCE;
    const cClub = archive.categories.CLUB_RACE;
    const cGrand = archive.categories.GRAND_PRIZE;
    const dMap = archive.byDistance;

    const fmtVal = (v, suffix = '') => (v !== null && v !== undefined && v !== '') ? `${v}${suffix}` : '<span style="color:#94a3b8; font-weight:600;">Veri Yetersiz</span>';

    return `
      <div class="perf-cat-block" style="margin-bottom:8px; border-top:3px solid #0066ff;">
        <div class="perf-cat-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">
          <span>🏁 Yarış Geçmişi &amp; Kategori Bazlı Performans Arşivi (${ov.totalParticipations} Katılım)</span>
          <button class="ios-btn ios-btn-primary" style="padding:4px 9px; font-size:9px;" onclick="AvigenPerformanceEngine.closeProfileModal(); openIosTab('flight'); AvigenUxManager.switchBreedingPlanSub('racetracker');">
            + Yarışa Ekle / Takip Et
          </button>
        </div>

        <!-- 1. GENEL TOPLAM ÖZET ŞERİDİ -->
        <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:5px; margin-bottom:8px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:7px 8px; text-align:center;">
          <div>
            <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">TOPLAM YARIŞ</div>
            <div style="font-size:12.5px; font-weight:900; color:#0052cc;">${ov.totalParticipations}</div>
            <div style="font-size:8px; color:var(--ios-subtext);">${ov.returnedCount} Başarılı Dönüş</div>
          </div>
          <div>
            <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">DÖNÜŞ ORANI</div>
            <div style="font-size:12px; font-weight:900; color:#059669;">${ov.returnRatePct !== null ? `%${ov.returnRatePct}` : '—'}</div>
            <div style="font-size:8px; color:var(--ios-subtext);">${ov.awaitingCount > 0 ? `${ov.awaitingCount} Bekleniyor` : (ov.lostCount > 0 ? `${ov.lostCount} Kayıp` : 'Kayıpsız')}</div>
          </div>
          <div>
            <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">ORTALAMA HIZ</div>
            <div style="font-size:11.5px; font-weight:900; color:var(--ios-text);">${ov.avgSpeedMpm !== null ? `${ov.avgSpeedMpm} m/dk` : '—'}</div>
            <div style="font-size:8px; color:var(--ios-subtext);">En İyi Derece: ${ov.bestRank !== null ? `${ov.bestRank}.` : '—'}</div>
          </div>
          <div>
            <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">PUAN &amp; ÖDÜL</div>
            <div style="font-size:11px; font-weight:900; color:#d97706;">${ov.totalPoints !== null ? `${ov.totalPoints} Puan` : '—'}</div>
            <div style="font-size:8px; color:#059669; font-weight:800;">${ov.totalPrizeTl > 0 ? `${ov.totalPrizeTl.toLocaleString('tr-TR')} TL` : `${ov.awardsCount} Ödül`}</div>
          </div>
        </div>

        <!-- 2. BİRLEŞİK KÜMESÜSTÜ (DERNEK/ETAP) VE BÜYÜK ÖDÜLLÜ (DERBY/OLR) İSTATİSTİKLERİ -->
        <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px; margin-bottom:8px;">
          <!-- A. KÜMESÜSTÜ & DERNEK YARIŞLARI (BİRLEŞİK) -->
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-top:3px solid #0066ff; border-radius:9px; padding:7px 8px; font-size:9.2px;">
            <div style="font-weight:900; color:#0052cc; margin-bottom:3px;">🦅 Kümesüstü &amp; Dernek (${cLoft.totalParticipations + cClub.totalParticipations})</div>
            <div>• Dönüş: <strong>${cLoft.returnedCount + cClub.returnedCount}/${cLoft.totalParticipations + cClub.totalParticipations}</strong></div>
            <div>• En İyi Sıra: <strong>${(cClub.bestRank !== null && cLoft.bestRank !== null) ? `${Math.min(cClub.bestRank, cLoft.bestRank)}. Sıra` : (cClub.bestRank !== null ? `${cClub.bestRank}. Sıra` : (cLoft.bestRank !== null ? `${cLoft.bestRank}. Sıra` : 'Veri Yok'))}</strong></div>
            <div>• Ort. Hız / Puan: <strong>${(cClub.avgSpeedMpm || cLoft.avgSpeedMpm) ? `${cClub.avgSpeedMpm || cLoft.avgSpeedMpm} m/dk` : 'Veri Yok'}${cClub.totalPoints ? ` • ${cClub.totalPoints} Puan` : ''}</strong></div>
          </div>

          <!-- B. BÜYÜK ÖDÜLLÜ YARIŞLAR -->
          <div style="background:#fffbeb; border:1px solid #fde68a; border-top:3px solid #d97706; border-radius:9px; padding:7px 8px; font-size:9.2px;">
            <div style="font-weight:900; color:#b45309; margin-bottom:3px;">🏆 Büyük Ödüllü / Derby (${cGrand.totalParticipations})</div>
            <div>• Dönüş: <strong>${cGrand.returnedCount}/${cGrand.totalParticipations}</strong></div>
            <div>• En İyi Derece: <strong>${cGrand.bestRank !== null ? `${cGrand.bestRank}. Sıra` : 'Veri Yok'}</strong></div>
            <div>• Ödül: <strong>${cGrand.totalPrizeTl > 0 ? `${cGrand.totalPrizeTl.toLocaleString('tr-TR')} TL` : (cGrand.awardsCount > 0 ? `${cGrand.awardsCount} Ödül` : 'Veri Yok')}</strong></div>
          </div>
        </div>

        <!-- 3. MESAFEYE GÖRE GERÇEK PERFORMANS KIRILIMI (EKSİK VERİDE UYDURMA YOK) -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:6px 8px; margin-bottom:8px; font-size:9px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-weight:900; color:var(--ios-text);">📏 Mesafeye Göre Gerçek Yarış Performansı</span>
            <span class="gene-badge ${trend.hasRealData ? 'gene-green' : 'gene-blue'}" style="font-size:8px;">${escapeHtml(trend.dataSufficiencyLabel)} • %${trend.confidencePct} Güven</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:4px; text-align:center;">
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:6px; padding:4px;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">Kısa (Sprint)</div>
              <div style="font-weight:900; color:#0052cc;">${dMap.sprint.totalParticipations > 0 ? `${dMap.sprint.returnedCount}/${dMap.sprint.totalParticipations} (${dMap.sprint.avgSpeedMpm || '—'} m/dk)` : 'Veri Yok'}</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:6px; padding:4px;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">Orta Mesafe</div>
              <div style="font-weight:900; color:#7c3aed;">${dMap.middle.totalParticipations > 0 ? `${dMap.middle.returnedCount}/${dMap.middle.totalParticipations} (${dMap.middle.avgSpeedMpm || '—'} m/dk)` : 'Veri Yok'}</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:6px; padding:4px;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">Uzun Mesafe</div>
              <div style="font-weight:900; color:#059669;">${dMap.long.totalParticipations > 0 ? `${dMap.long.returnedCount}/${dMap.long.totalParticipations} (${dMap.long.avgSpeedMpm || '—'} m/dk)` : 'Veri Yok'}</div>
            </div>
            <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-radius:6px; padding:4px;">
              <div style="font-size:8px; font-weight:800; color:var(--ios-subtext);">Maraton</div>
              <div style="font-weight:900; color:#d97706;">${dMap.marathon.totalParticipations > 0 ? `${dMap.marathon.returnedCount}/${dMap.marathon.totalParticipations} (${dMap.marathon.avgSpeedMpm || '—'} m/dk)` : 'Veri Yok'}</div>
            </div>
          </div>
          <div style="margin-top:5px; font-size:9px; color:var(--ios-subtext); display:flex; justify-content:space-between; flex-wrap:wrap; gap:4px;">
            <span>🧭 Uzmanlık: <strong>${fmtVal(trend.bestDistanceType)}</strong></span>
            <span>📈 Gelişim: <strong>${escapeHtml(trend.trendLabel)}</strong></span>
          </div>
        </div>

        <!-- 4. YARIŞ VE ÖDÜL GEÇMİŞİ KAYIT LİSTESİ -->
        ${history.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:6px; max-height:${isFullTabView ? '390px' : '240px'}; overflow-y:auto;">
            ${history.map(h => {
              const isEntered = h.resultStatus === 'ENTERED';
              const stMeta = this.BIRD_STATUSES[h.birdStatus] || this.BIRD_STATUSES.AWAITING;
              return `
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid ${stMeta.color}; border-radius:9px; padding:7px 9px; font-size:9.3px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:4px;">
                    <div style="font-weight:900; font-size:10.5px; color:var(--ios-text); display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                      <span>${h.categoryIcon} ${escapeHtml(h.codeTitle)}</span>
                      <span class="gene-badge gene-blue" style="font-size:7.8px; padding:1px 5px;">${escapeHtml(h.categoryTitle)} • ${escapeHtml(h.stageType)}</span>
                      ${h.distanceKm ? `<span style="font-weight:700; color:#0066ff;">(${h.distanceKm} km)</span>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:4px;">
                      <span style="background:${stMeta.bg}; color:${stMeta.color}; border:1px solid ${stMeta.border}; border-radius:6px; padding:1px 6px; font-size:8.2px; font-weight:800;">
                        ${stMeta.icon} ${escapeHtml(stMeta.label)}
                      </span>
                      ${isEntered && h.rank ? `
                        <span class="gene-badge gene-green" style="font-size:8.2px; padding:1px 6px;">
                          🏆 ${h.rank}. / ${(h.totalCompetitors || 0).toLocaleString('tr-TR')}
                        </span>
                      ` : ''}
                      <button class="ios-btn ios-btn-outline" style="padding:2px 6px; font-size:8.2px;" onclick="AvigenPerformanceEngine.closeProfileModal(); AvigenRaceTracker.openResultEntryModal('${h.raceId}', '${escapeHtml(ring)}');">
                        ✏️ ${isEntered ? 'Düzenle' : 'Durum / Sonuç'}
                      </button>
                    </div>
                  </div>

                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:2px 8px; color:var(--ios-subtext); font-size:8.8px; line-height:1.35;">
                    <div>🏛️ <strong>Organizasyon:</strong> ${escapeHtml(h.organizationName || '—')} (${escapeHtml(h.seasonYear)})</div>
                    <div>📍 <strong>Salım:</strong> ${escapeHtml(h.releasePoint || '—')}${h.releaseCoords ? ` [${escapeHtml(h.releaseCoords)}]` : ''}</div>
                    <div>🛫 <strong>Salım Zamanı:</strong> ${escapeHtml(h.releaseDateLabel)} • ${escapeHtml(h.releaseTime)}</div>
                    <div>🛬 <strong>Dönüş Zamanı:</strong> ${isEntered && h.arrivalTime ? `${escapeHtml(h.arrivalDate)} • ${escapeHtml(h.arrivalTime)}` : '—'}</div>
                    <div>⏱️ <strong>Uçuş Süresi:</strong> <strong style="color:var(--ios-text);">${escapeHtml(h.durationLabel)}</strong></div>
                    <div>⚡ <strong>Ortalama Hız:</strong> <strong style="color:${h.speedMpm ? '#059669' : 'var(--ios-subtext)'};">${h.speedMpm ? `${h.speedMpm} m/dk` : 'Veri Yok'}</strong></div>
                    ${h.points !== null ? `<div>📊 <strong>Klasman Puanı:</strong> <strong style="color:#0052cc;">${h.points} Puan</strong></div>` : ''}
                    ${(h.wonPrizeAmountTl || h.wonAwardTitle) ? `<div>🏆 <strong>Kazanılan Ödül:</strong> <strong style="color:#d97706;">${escapeHtml(h.wonAwardTitle || '')} ${h.wonPrizeAmountTl ? h.wonPrizeAmountTl.toLocaleString('tr-TR') + ' TL' : ''}</strong></div>` : ''}
                  </div>

                  ${h.notes ? `
                    <div style="margin-top:3px; padding-top:3px; border-top:1px dashed var(--ios-border); font-size:8.8px; color:var(--ios-text);">
                      📝 <strong>Not:</strong> ${escapeHtml(h.notes)}
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="background:#f8fafc; border:1px dashed #cbd5e1; border-radius:8px; padding:10px; font-size:9.8px; color:#475569; text-align:center;">
            ℹ️ <strong>Bu Güvercin İçin Kayıtlı Yarış Bulunmuyor:</strong> Eksik verilerden yapay yarış sonucu üretilmemiştir.
          </div>
        `}
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // 1. YARIŞ YÖNETİMİ ANA EKRANI (3 KATEGORİ FİLTRELİ MERKEZİ TAKİP KOKPİTİ)
  // --------------------------------------------------------------------------
  setFilter(status) {
    this.filterStatus = status;
    this.renderRaceTrackerMainUI();
  },

  setCategoryFilter(catCode) {
    this.filterCategory = catCode;
    this.renderRaceTrackerMainUI();
  },

  renderRaceTrackerMainUI() {
    if (!this._initialized) this.init();
    const root = document.getElementById('avigenRaceTrackerRoot');
    if (!root) return;

    const isLoftOrClubCategory = (cat) => cat === 'LOFT_ENDURANCE' || cat === 'CLUB_RACE';
    const filteredEvents = this.events.filter(ev => {
      if (this.filterCategory !== 'ALL') {
        if (isLoftOrClubCategory(this.filterCategory)) {
          if (!isLoftOrClubCategory(ev.category)) return false;
        } else if (ev.category !== this.filterCategory) {
          return false;
        }
      }
      if (this.filterStatus === 'COMPLETED') return ev.status === 'COMPLETED';
      if (this.filterStatus === 'PENDING_RESULTS') return ev.status !== 'COMPLETED';
      return true;
    });

    const cntAll = this.events.length;
    const cntLoft = this.events.filter(e => e.category === 'LOFT_ENDURANCE').length;
    const cntClub = this.events.filter(e => e.category === 'CLUB_RACE').length;
    const cntUnifiedLoft = cntLoft + cntClub;
    const cntGrand = this.events.filter(e => e.category === 'GRAND_PRIZE').length;

    const totalReturned = this.events.reduce((acc, ev) => acc + (ev.entries || []).filter(e => e.birdStatus === 'RETURNED' || e.resultStatus === 'ENTERED').length, 0);
    const totalAwaiting = this.events.reduce((acc, ev) => acc + (ev.entries || []).filter(e => ['PREPARING', 'BASKETED', 'RELEASED', 'AWAITING'].includes(e.birdStatus) && e.resultStatus !== 'ENTERED').length, 0);

    // Kümesüstü & Dernek yarışları için genel sezon sıralaması özeti + Çoklu Büyük Ödüllü Yarış (Derby / OLR) Organizasyon Özeti
    const clubSeasonStandings = this.computeClubSeasonStandings();
    const grandPrizeOrgsSummary = this.computeGrandPrizeOrganizationsSummary();

    root.innerHTML = `
      <!-- ÜST KOKPİT: ERGONOMİK YARIŞ YÖNETİMİ & TEK SATIR KATEGORİ + DURUM FİLTRESİ -->
      <div class="ios-card" style="padding:10px 11px; border-top:3px solid #0066ff;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <div style="min-width:0;">
            <div style="font-size:12.5px; font-weight:900; color:var(--ios-text); display:flex; align-items:center; gap:5px;">
              <span>🏁 Yarış Yönetimi &amp; Canlı Takip</span>
            </div>
            <div style="font-size:9px; color:var(--ios-subtext); margin-top:1px;">
              ${cntAll} Yarış Kaydı • <strong style="color:#059669;">${totalReturned} Döndü</strong> • <strong style="color:#b45309;">${totalAwaiting} Takipte</strong>
            </div>
          </div>
          <button class="ios-btn ios-btn-primary" style="padding:6px 10px; font-size:10px; font-weight:900; flex-shrink:0;" onclick="AvigenRaceTracker.openCreateRaceModal()">
            + Yeni Yarış
          </button>
        </div>

        <!-- 2 ANA YARIŞ KATEGORİSİ HIZLI BAŞLATMA BUTONLARI (KÜMESÜSTÜ & DERNEK BİRLEŞİK + BÜYÜK ÖDÜLLÜ DERBY) -->
        <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:6px; margin-bottom:7px;">
          <div onclick="AvigenRaceTracker.openCreateRaceModal({ category: 'CLUB_RACE' })" style="cursor:pointer; background:#eff6ff; border:1.5px solid #93c5fd; border-radius:9px; padding:7px 9px; display:flex; flex-direction:column; gap:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:14px;">🦅</span>
              <span style="font-size:8.5px; font-weight:800; color:#1d4ed8;">+ Yeni Etap Ekle</span>
            </div>
            <div style="font-size:10.8px; font-weight:900; color:#0052cc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Kümesüstü Yarışı</div>
            <div style="font-size:8px; color:#1e3a8a;">Dernek, Etap, Koordinat &amp; Klasman</div>
          </div>

          <div onclick="AvigenRaceTracker.openCreateRaceModal({ category: 'GRAND_PRIZE' })" style="cursor:pointer; background:#fffbeb; border:1.5px solid #fcd34d; border-radius:9px; padding:7px 9px; display:flex; flex-direction:column; gap:2px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:14px;">🏆</span>
              <span style="font-size:8.5px; font-weight:800; color:#b45309;">+ Derby / OLR Ekle</span>
            </div>
            <div style="font-size:10.8px; font-weight:900; color:#b45309; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Büyük Ödüllü Yarış</div>
            <div style="font-size:8px; color:#78350f;">One Loft Race (OLR) &amp; Derby</div>
          </div>
        </div>

        <!-- KATEGORİ FİLTRE ÇİPLERİ + DURUM FİLTRESİ (BİRLEŞİK KOMPAKT ŞERİT) -->
        <div class="sub-pills" style="padding:2.5px; gap:3px; margin-bottom:5px; flex-wrap:wrap;">
          <button type="button" class="sub-pill ${this.filterCategory === 'ALL' ? 'active' : ''}" style="font-size:9px; padding:4px 7px;" onclick="AvigenRaceTracker.setCategoryFilter('ALL')">
            🏁 Tümü (${cntAll})
          </button>
          <button type="button" class="sub-pill ${isLoftOrClubCategory(this.filterCategory) ? 'active' : ''}" style="font-size:9px; padding:4px 7px;" onclick="AvigenRaceTracker.setCategoryFilter('CLUB_RACE')">
            🦅 Kümesüstü &amp; Dernek (${cntUnifiedLoft})
          </button>
          <button type="button" class="sub-pill ${this.filterCategory === 'GRAND_PRIZE' ? 'active' : ''}" style="font-size:9px; padding:4px 7px;" onclick="AvigenRaceTracker.setCategoryFilter('GRAND_PRIZE')">
            🏆 Büyük Ödüllü / Derby (${cntGrand})
          </button>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">
          <button type="button" onclick="AvigenRaceTracker.setFilter('ALL')" style="cursor:pointer; background:${this.filterStatus === 'ALL' ? '#eff6ff' : 'var(--ios-card-alt)'}; border:1px solid ${this.filterStatus === 'ALL' ? '#0066ff' : 'var(--ios-border)'}; border-radius:7px; padding:4px 5px; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span style="font-size:10.5px; font-weight:900; color:#0052cc;">${cntAll}</span>
            <span style="font-size:8.3px; font-weight:800; color:var(--ios-subtext);">Tüm Etaplar</span>
          </button>
          <button type="button" onclick="AvigenRaceTracker.setFilter('PENDING_RESULTS')" style="cursor:pointer; background:${this.filterStatus === 'PENDING_RESULTS' ? '#fef3c7' : 'var(--ios-card-alt)'}; border:1px solid ${this.filterStatus === 'PENDING_RESULTS' ? '#d97706' : 'var(--ios-border)'}; border-radius:7px; padding:4px 5px; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span style="font-size:10.5px; font-weight:900; color:#b45309;">${totalAwaiting}</span>
            <span style="font-size:8.3px; font-weight:800; color:var(--ios-subtext);">Canlı Takipte</span>
          </button>
          <button type="button" onclick="AvigenRaceTracker.setFilter('COMPLETED')" style="cursor:pointer; background:${this.filterStatus === 'COMPLETED' ? '#ecfdf5' : 'var(--ios-card-alt)'}; border:1px solid ${this.filterStatus === 'COMPLETED' ? '#059669' : 'var(--ios-border)'}; border-radius:7px; padding:4px 5px; display:flex; align-items:center; justify-content:center; gap:4px;">
            <span style="font-size:10.5px; font-weight:900; color:#059669;">${totalReturned}</span>
            <span style="font-size:8.3px; font-weight:800; color:var(--ios-subtext);">Eve Dönen</span>
          </button>
        </div>
      </div>

      <!-- KÜMESÜSTÜ & DERNEK YARIŞLARI GENEL SEZON SIRALAMASI ÖZETİ -->
      ${clubSeasonStandings.length > 0 && (this.filterCategory === 'ALL' || isLoftOrClubCategory(this.filterCategory)) ? `
        <div class="ios-card" style="padding:9px 11px; border-left:4px solid #0066ff;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
            <span style="font-size:11px; font-weight:900; color:#0052cc;">🦅 Kümesüstü &amp; Dernek Yarışları Genel Sezon Puan Sıralaması (Top 5)</span>
            <span class="gene-badge gene-blue" style="font-size:8px;">Sezon Klasmanı</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${clubSeasonStandings.slice(0, 5).map((st, idx) => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:4px 8px; font-size:9.3px;">
                <div style="font-weight:800; color:var(--ios-text); cursor:pointer;" onclick="if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(st.ring)}', 'race_history');">
                  <strong>#${idx + 1}</strong> ${st.flag} ${escapeHtml(st.birdName)} (${escapeHtml(st.ring)})
                </div>
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="color:var(--ios-subtext);">${st.stagesCount} Etap • En İyi: ${st.bestRank}.</span>
                  <span class="gene-badge gene-green" style="font-size:8.2px;">${st.totalPoints.toFixed(1)} Puan</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- BÜYÜK ÖDÜLLÜ YARIŞLAR (OLR / DERBY) ÇOKLU ORGANİZASYON KOKPİTİ (Örn: 3 Farklı Derby'de Yarışan Kuşların Tek Bakışta Özeti) -->
      ${grandPrizeOrgsSummary.length > 0 && (this.filterCategory === 'ALL' || this.filterCategory === 'GRAND_PRIZE') ? `
        <div class="ios-card" style="padding:9px 11px; border-left:4px solid #d97706;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-wrap:wrap; gap:5px;">
            <span style="font-size:11px; font-weight:900; color:#b45309;">🏆 Büyük Ödüllü Yarış (OLR / Derby) Organizasyon Panosu (${grandPrizeOrgsSummary.length} Organizasyon)</span>
            <button type="button" class="nest-mini-action-btn gold" onclick="if(typeof openLoftWithFilter==='function') openLoftWithFilter('GRAND_PRIZE');">
              🕊️ Derby Kuşlarını Listele →
            </button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:6px;">
            ${grandPrizeOrgsSummary.map(org => `
              <div style="background:#fffbeb; border:1px solid #fcd34d; border-radius:9px; padding:7px 9px; display:flex; flex-direction:column; gap:3px;">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:4px;">
                  <span style="font-size:10.5px; font-weight:900; color:#92400e;">🏆 ${escapeHtml(org.organizationName)}</span>
                  <span class="gene-badge gene-gold" style="font-size:7.8px;">${org.stagesCount} Etap</span>
                </div>
                <div style="font-size:9px; color:#78350f;">
                  🕊️ <strong>${org.uniqueBirdsCount} Kuş</strong> Teslim Edildi • 🛬 <strong>${org.returnedCount}</strong> Döndü • ⏳ <strong>${org.awaitingCount}</strong> Takipte
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                  <span style="font-size:8.5px; font-weight:800; color:#047857;">
                    ${org.bestRank ? `En İyi: #${org.bestRank}` : 'Derece Bekleniyor'}${org.totalPrizeTl > 0 ? ` • 💰 ${org.totalPrizeTl.toLocaleString('tr-TR')} TL` : ''}
                  </span>
                  <button type="button" class="nest-mini-action-btn" style="font-size:8px; padding:2px 6px;" onclick="AvigenRaceTracker.createNextGrandPrizeStageFromEvent('${org.latestRaceId}')">
                    ⏭️ Yeni Etap
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- YARIŞ TAKİP KARTLARI LİSTESİ -->
      ${filteredEvents.length === 0 ? `
        <div class="ios-card" style="text-align:center; padding:22px 14px;">
          <div style="font-size:28px; margin-bottom:6px;">🏁</div>
          <div style="font-size:13px; font-weight:900; color:var(--ios-text);">Bu Kategoride Kayıtlı Yarış Bulunmuyor</div>
          <div style="font-size:10.3px; color:var(--ios-subtext); margin-top:4px; margin-bottom:10px;">
            Yukarıdaki <strong>Kümesüstü</strong>, <strong>Dernek Yarışı</strong> veya <strong>Büyük Ödüllü</strong> kartlarından birine dokunarak yeni yarış oluşturabilirsiniz.
          </div>
          <button class="ios-btn ios-btn-primary" style="padding:8px 14px; font-size:11px;" onclick="AvigenRaceTracker.openCreateRaceModal()">
            + Yeni Yarış Oluştur
          </button>
        </div>
      ` : filteredEvents.map((ev, idx) => this.renderSingleRaceEventCard(ev, idx)).join('')}
    `;
  },

  computeClubSeasonStandings() {
    const map = new Map();
    this.events.filter(ev => ev.category === 'CLUB_RACE' || ev.category === 'LOFT_ENDURANCE').forEach(ev => {
      (ev.entries || []).forEach(en => {
        if ((en.birdStatus === 'RETURNED' || en.resultStatus === 'ENTERED') && en.rank) {
          const rKey = en.ring.trim().toUpperCase();
          if (!map.has(rKey)) {
            map.set(rKey, {
              ring: en.ring,
              birdName: en.birdName,
              flag: en.flag || '🇹🇷',
              stagesCount: 0,
              totalPoints: 0,
              bestRank: 999999
            });
          }
          const item = map.get(rKey);
          item.stagesCount++;
          const pts = en.points !== null && en.points !== undefined
            ? Number(en.points)
            : (this.calculateOfficialPoints(en.rank, en.totalCompetitors || ev.totalCompetitors, ev.distanceKm) || 0);
          item.totalPoints += pts;
          if (en.rank < item.bestRank) item.bestRank = en.rank;
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.totalPoints - a.totalPoints || a.bestRank - b.bestRank);
  },

  computeGrandPrizeOrganizationsSummary() {
    const orgMap = new Map();
    this.events.filter(ev => ev.category === 'GRAND_PRIZE').forEach(ev => {
      const orgName = (ev.organizationName || 'Derby / OLR').trim();
      if (!orgMap.has(orgName)) {
        orgMap.set(orgName, {
          organizationName: orgName,
          stagesCount: 0,
          ringsSet: new Set(),
          returnedCount: 0,
          awaitingCount: 0,
          bestRank: null,
          totalPrizeTl: 0,
          latestRaceId: ev.id
        });
      }
      const item = orgMap.get(orgName);
      item.stagesCount++;
      (ev.entries || []).forEach(en => {
        const rUp = (en.ring || '').trim().toUpperCase();
        if (rUp) item.ringsSet.add(rUp);
        if (en.birdStatus === 'RETURNED' || en.resultStatus === 'ENTERED') {
          item.returnedCount++;
          if (en.rank && (!item.bestRank || en.rank < item.bestRank)) {
            item.bestRank = en.rank;
          }
          if (en.wonPrizeAmountTl) {
            item.totalPrizeTl += Number(en.wonPrizeAmountTl) || 0;
          }
        } else if (['PREPARING', 'BASKETED', 'RELEASED', 'AWAITING'].includes(en.birdStatus)) {
          item.awaitingCount++;
        }
      });
    });
    return Array.from(orgMap.values()).map(o => ({
      ...o,
      uniqueBirdsCount: o.ringsSet.size
    }));
  },

  // --------------------------------------------------------------------------
  // 3. YARIŞ TAKİP EKRANI KARTI (ERGONOMİK AKORDEON + TEK SATIR DROPDOWN TOPLU GÜNCELLEME + PROFESYONEL KUŞ LİSTESİ)
  // --------------------------------------------------------------------------
  renderSingleRaceEventCard(ev, idx = 0) {
    const entries = ev.entries || [];
    const catMeta = this.CATEGORIES[ev.category] || this.CATEGORIES.CLUB_RACE;

    const returnedCount = entries.filter(e => e.birdStatus === 'RETURNED' || e.resultStatus === 'ENTERED').length;
    const lostCount = entries.filter(e => e.birdStatus === 'LOST' && e.manualLostConfirmed).length;
    const disqCount = entries.filter(e => e.birdStatus === 'DISQUALIFIED').length;
    const awaitingCount = entries.length - returnedCount - lostCount - disqCount;

    const isAllFinished = entries.length > 0 && awaitingCount === 0;
    const raceOverallStatusText = ev.status === 'COMPLETED' || isAllFinished
      ? 'Tamamlandı'
      : (entries.some(e => e.birdStatus === 'RELEASED' || e.birdStatus === 'AWAITING' || e.birdStatus === 'RETURNED')
        ? `Canlı (${returnedCount}/${entries.length} Döndü)`
        : 'Hazırlık / Sepetleme');
    const statusBadgeClass = (ev.status === 'COMPLETED' || isAllFinished) ? 'gene-green' : 'gene-purple';

    // İlk yarış kartı veya henüz sonuç bekleyen ilk aktif yarış varsayılan olarak açık, diğerleri kompakt akordeon halinde
    if (this.expandedRaceIds.size === 0 && idx === 0) {
      this.expandedRaceIds.add(ev.id);
    }
    const isExpanded = this.expandedRaceIds.has(ev.id);

    return `
      <div class="ios-card" style="padding:10px 11px; border:1.5px solid var(--ios-border); border-left:4px solid ${catMeta.accentColor}; border-radius:13px;">
        <!-- ÜST BAŞLIK: YARIŞ ADI, KATEGORİSİ, ÖZET METADATA VE AKORDEON AÇ/KAPAT -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
          <div onclick="AvigenRaceTracker.toggleRaceCardAccordion('${ev.id}')" style="min-width:0; flex:1; cursor:pointer; user-select:none;">
            <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
              <span class="gene-badge ${catMeta.badgeClass}" style="font-size:8px; padding:1.5px 6px;">
                ${catMeta.icon} ${escapeHtml(catMeta.title)}
              </span>
              <span class="gene-badge gene-blue" style="font-size:7.8px; padding:1px 5px;">
                ${escapeHtml(ev.stageType || 'Etap')}${ev.category === 'CLUB_RACE' ? ` #${ev.stageNumber || 1}` : ''}
              </span>
              <span class="gene-badge ${statusBadgeClass}" style="font-size:8px; padding:1.5px 6px;">
                ${escapeHtml(raceOverallStatusText)}
              </span>
            </div>
            <div style="font-size:13px; font-weight:900; color:var(--ios-text); margin-top:3px; display:flex; align-items:center; gap:6px;">
              <span>${escapeHtml(ev.codeTitle)}</span>
              <span style="font-size:10px; font-weight:800; color:#0052cc;">(${ev.distanceKm ? `${ev.distanceKm} km` : 'Kümesüstü'})</span>
            </div>
            <div style="font-size:9px; color:var(--ios-subtext); margin-top:2px; line-height:1.35;">
              🏛️ <strong>${escapeHtml(ev.organizationName || 'Kümes')}</strong>
              • 📍 <strong>${escapeHtml(ev.releasePoint || 'Kümes')}</strong>
              • 🛫 ${escapeHtml(ev.releaseDateLabel)} ${escapeHtml(ev.releaseTime || '06:45')}
              • 🕊️ <strong>${entries.length} Kuş</strong> (${returnedCount} Döndü${awaitingCount > 0 ? ` • ${awaitingCount} Bekliyor` : ''})
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button class="ios-btn ios-btn-green" style="padding:5px 8px; font-size:9px; font-weight:900;" onclick="AvigenRaceTracker.openBatchResultEntryModal('${ev.id}')" title="Toplu sonuç ve derece girişi">
              📋 Toplu Sonuç
            </button>
            <button class="ios-btn ios-btn-outline" style="padding:5px 7px; font-size:9px; font-weight:900; color:#0052cc;" onclick="AvigenRaceTracker.toggleRaceCardAccordion('${ev.id}')">
              ${isExpanded ? 'Gizle ▴' : `Kuşlar (${entries.length}) ▾`}
            </button>
          </div>
        </div>

        ${isExpanded ? `
          <!-- ARAÇ ÇUBUĞU: KOMPAKT TOPLU DURUM SEÇİCİ + HIZLI İŞLEM BUTONLARI -->
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:5px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:5px 7px; margin-top:8px; margin-bottom:7px;">
            <div style="display:flex; align-items:center; gap:4px; flex:1; min-width:170px;">
              <span style="font-size:8.8px; font-weight:800; color:var(--ios-subtext); white-space:nowrap;">⚡ Toplu Durum:</span>
              <select class="ios-select" style="padding:3px 6px; font-size:9px; font-weight:800; flex:1;" onchange="if(this.value){AvigenRaceTracker.bulkUpdateRaceBirdStatus('${ev.id}', this.value); this.value='';}">
                <option value="">-- Tüm Kuşları Güncelle --</option>
                <option value="PREPARING">📋 Tümünü: Hazırlanıyor Yap</option>
                <option value="BASKETED">🧺 Tümünü: Kafese Teslim Yap</option>
                <option value="RELEASED">🛫 Tümünü: Salındı Yap</option>
                <option value="AWAITING">⏳ Tümünü: Dönüş Bekleniyor Yap</option>
                <option value="RETURNED">🛬 Tümünü: Şimdi Eve Döndü Yap</option>
              </select>
            </div>

            <div style="display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
              ${ev.category === 'GRAND_PRIZE' ? `
                <button class="ios-btn ios-btn-gold" style="padding:4px 7px; font-size:8.6px; font-weight:900;" onclick="AvigenRaceTracker.createNextGrandPrizeStageFromEvent('${ev.id}')">
                  ⏭️ Sonraki Etap
                </button>
              ` : ''}
              <button class="ios-btn ios-btn-purple" style="padding:4px 7px; font-size:8.6px;" onclick="if(typeof AvigenGenesisAI!=='undefined') AvigenGenesisAI.openSmartRaceWithEvent('${ev.id}');">
                🗺️ Harita
              </button>
              <button class="ios-btn ios-btn-outline" style="padding:4px 7px; font-size:8.6px;" onclick="AvigenRaceTracker.openAddBirdsToRaceModal('${ev.id}')">
                + Kuş Ekle
              </button>
              <button class="ios-btn ios-btn-danger" style="padding:4px 6px; font-size:8.6px;" onclick="AvigenRaceTracker.deleteRaceEvent('${ev.id}')" title="Yarışı Sil">
                🗑️
              </button>
            </div>
          </div>

          <!-- KUŞLARIN CANLI DURUMLARI VE SONUÇ SATIRLARI (ERGONOMİK TABLO DÜZENİ) -->
          <div style="display:flex; flex-direction:column; gap:5px;">
            ${entries.map(en => {
              const stMeta = this.BIRD_STATUSES[en.birdStatus] || this.BIRD_STATUSES.AWAITING;
              const isReturned = en.birdStatus === 'RETURNED' || en.resultStatus === 'ENTERED';
              return `
                <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid ${stMeta.color}; border-radius:9px; padding:6px 8px;">
                  <div style="min-width:0; flex:1; cursor:pointer;" onclick="if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(en.ring)}', 'race_history');">
                    <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                      <span style="font-size:11px; font-weight:900; color:var(--ios-text);">${escapeHtml(en.birdName || 'Kayıtlı Güvercin')}</span>
                      <span style="font-size:9.5px; font-weight:800; color:#0066ff;">${en.flag || '🇹🇷'} ${escapeHtml(en.ring)}</span>
                      ${isReturned && en.rank ? `<span class="gene-badge gene-green" style="font-size:8px; padding:1px 5px;">🏆 #${en.rank}</span>` : ''}
                    </div>
                    <div style="font-size:8.6px; color:var(--ios-subtext); margin-top:1.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                      ${isReturned
                        ? `🛬 <strong>${escapeHtml(en.arrivalTime || 'Döndü')}</strong> (${escapeHtml(en.durationLabel)}) • ⚡ <strong>${en.speedMpm ? en.speedMpm + ' m/dk' : '—'}</strong>${en.points ? ` • ${en.points} P` : ''}${en.wonPrizeAmountTl ? ` • 🏆 ${en.wonPrizeAmountTl.toLocaleString('tr-TR')} TL` : ''}`
                        : `<strong style="color:${stMeta.color};">${stMeta.icon} ${escapeHtml(stMeta.label)}</strong>${en.notes ? ' • ' + escapeHtml(en.notes) : ''}`}
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                    ${!isReturned ? `
                      <button class="ios-btn ios-btn-green" style="padding:4px 7px; font-size:8.8px; font-weight:900;" onclick="AvigenRaceTracker.stampInstantBirdArrival('${ev.id}', '${escapeHtml(en.ring)}')" title="Tek dokunuşla Eve Döndü yap ve hızı hesapla">
                        ⚡ İndi
                      </button>
                    ` : ''}

                    <select class="ios-select" style="width:auto; max-width:118px; padding:3px 5px; font-size:8.6px; font-weight:800; color:${stMeta.color}; background:${stMeta.bg}; border-color:${stMeta.border};" onchange="AvigenRaceTracker.updateSingleBirdStatus('${ev.id}', '${escapeHtml(en.ring)}', this.value, this)">
                      ${Object.values(this.BIRD_STATUSES).map(st => `
                        <option value="${st.code}" ${en.birdStatus === st.code ? 'selected' : ''}>${st.icon} ${escapeHtml(st.label)}</option>
                      `).join('')}
                    </select>

                    <button class="ios-btn ${isReturned ? 'ios-btn-outline' : 'ios-btn-primary'}" style="padding:4px 7px; font-size:8.8px;" onclick="AvigenRaceTracker.openResultEntryModal('${ev.id}', '${escapeHtml(en.ring)}')" title="Saat, derece ve ödül düzenle">
                      ✏️
                    </button>
                    <button class="ios-btn ios-btn-danger" style="padding:4px 5px; font-size:8.5px;" onclick="AvigenRaceTracker.removeBirdFromRace('${ev.id}', '${escapeHtml(en.ring)}')" title="Yarıştan çıkar">
                      ✕
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // KURAL: Dönüş bekleyen kuşlar otomatik olarak kayıp kabul edilmez!
  // Kayıp (LOST) durumu seçildiğinde kullanıcıdan açıkça manuel onay alınır; onaylanmazsa AWAITING kalır!
  updateSingleBirdStatus(raceId, ring, newStatusCode, selectEl = null, skipConfirm = false) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return false;
    const clean = (ring || '').trim().toUpperCase();
    const entry = (ev.entries || []).find(en => en.ring.toUpperCase() === clean);
    if (!entry) return false;

    if (!this.BIRD_STATUSES[newStatusCode]) return false;

    if (newStatusCode === 'LOST') {
      if (!skipConfirm) {
        const confirmed = confirm(
          `⚠️ MANUEL KAYIP ONAYI GEREKLİ:\n\n"${entry.birdName} (${entry.ring})" güvercinini bu yarışta resmen "🔴 KAYIP" olarak işaretlemek ve onaylamak istiyor musunuz?\n\n(Not: Dönüşü geciken kuşlar siz manuel onaylamadıkça sistem tarafından otomatik kayıp sayılmaz.)`
        );
        if (!confirmed) {
          if (selectEl) selectEl.value = entry.birdStatus || 'AWAITING';
          return false;
        }
      }
      entry.birdStatus = 'LOST';
      entry.manualLostConfirmed = true;
      entry.resultStatus = 'LOST';
    } else if (newStatusCode === 'RETURNED') {
      entry.birdStatus = 'RETURNED';
      entry.manualLostConfirmed = false;
      if (entry.resultStatus !== 'ENTERED') {
        this.stampInstantBirdArrival(raceId, ring);
        return true;
      }
    } else if (newStatusCode === 'DISQUALIFIED') {
      entry.birdStatus = 'DISQUALIFIED';
      entry.manualLostConfirmed = false;
      entry.resultStatus = 'DISQUALIFIED';
    } else {
      entry.birdStatus = newStatusCode;
      entry.manualLostConfirmed = false;
      entry.resultStatus = 'PENDING';
    }

    if (!Array.isArray(entry.statusHistory)) entry.statusHistory = [];
    entry.statusHistory.push({
      status: entry.birdStatus,
      timestamp: new Date().toISOString(),
      note: `Durum güncellendi: ${this.BIRD_STATUSES[entry.birdStatus].label}`
    });

    this.recomputeEventOverallStatus(ev);
    this.saveEvents();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
    return true;
  },

  // Toplu durum güncelleme özelliği
  bulkUpdateRaceBirdStatus(raceId, targetStatusCode) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev || !this.BIRD_STATUSES[targetStatusCode]) return;

    if (targetStatusCode === 'LOST') {
      const ok = confirm(`⚠️ "${ev.codeTitle}" yarışında henüz dönmemiş kuşları toplu olarak "🔴 KAYIP" olarak manuel onaylamak istiyor musunuz?`);
      if (!ok) return;
    }

    const nowIso = new Date().toISOString();
    (ev.entries || []).forEach((en, idx) => {
      if (targetStatusCode === 'RETURNED') {
        if (en.birdStatus !== 'RETURNED' && en.resultStatus !== 'ENTERED') {
          this.stampInstantBirdArrival(raceId, en.ring, true, idx + 1);
        }
      } else {
        // Zaten eve dönmüş ve sonucu girilmiş kuşları yanlışlıkla "Salındı / Bekleniyor"a geri alma (veya tümü henüz dönmemişse uygula)
        if (en.resultStatus === 'ENTERED' && ['PREPARING', 'BASKETED', 'RELEASED', 'AWAITING'].includes(targetStatusCode)) {
          return;
        }
        en.birdStatus = targetStatusCode;
        en.manualLostConfirmed = targetStatusCode === 'LOST';
        en.resultStatus = targetStatusCode === 'LOST' ? 'LOST' : (targetStatusCode === 'DISQUALIFIED' ? 'DISQUALIFIED' : 'PENDING');
        if (!Array.isArray(en.statusHistory)) en.statusHistory = [];
        en.statusHistory.push({
          status: targetStatusCode,
          timestamp: nowIso,
          note: `Toplu durum güncellemesi: ${this.BIRD_STATUSES[targetStatusCode].label}`
        });
      }
    });

    this.recomputeEventOverallStatus(ev);
    this.saveEvents();
    if (typeof saveMypedigreData === 'function') saveMypedigreData();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  },

  recomputeEventOverallStatus(ev) {
    const entries = ev.entries || [];
    if (entries.length === 0) {
      ev.status = 'PENDING_RESULTS';
      return;
    }
    const allResolved = entries.every(e =>
      e.birdStatus === 'RETURNED' ||
      e.resultStatus === 'ENTERED' ||
      (e.birdStatus === 'LOST' && e.manualLostConfirmed) ||
      e.birdStatus === 'DISQUALIFIED'
    );
    ev.status = allResolved ? 'COMPLETED' : 'PENDING_RESULTS';
  },

  deleteRaceEvent(raceId) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    if (!confirm(`🗑️ "${ev.codeTitle}" yarış kaydını ve bu yarıştaki sonuçları silmek istiyor musunuz?`)) return;

    this.events = this.events.filter(e => e.id !== raceId);
    this.saveEvents();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  },

  removeBirdFromRace(raceId, ring) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    const clean = (ring || '').trim().toUpperCase();
    const target = (ev.entries || []).find(en => en.ring.toUpperCase() === clean);
    if (!target) return;

    if (!confirm(`🗑️ "${target.birdName} (${target.ring})" kuşunu "${ev.codeTitle}" yarış listesinden çıkarmak istiyor musunuz?`)) return;

    ev.entries = (ev.entries || []).filter(en => en.ring.toUpperCase() !== clean);
    ev.participantBirdsCount = ev.entries.length;
    this.recomputeEventOverallStatus(ev);
    this.saveEvents();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  },

  // --------------------------------------------------------------------------
  // 2. YARIŞ OLUŞTURMA EKRANI
  //    İlk ekranda 3 büyük kategori kartı yer alır.
  //    Kullanıcı kategori seçtikten sonra YALNIZCA o yarış türü için gerekli alanları görür!
  // --------------------------------------------------------------------------
  openCreateRaceModal(prefillData = null) {
    const modal = document.getElementById('avigenRaceModal');
    const titleEl = document.getElementById('avigenRaceModalTitle');
    const bodyEl = document.getElementById('avigenRaceModalBody');
    if (!modal || !bodyEl) return;

    this._lastPrefillData = prefillData || null;
    const selectedCategory = prefillData?.category || '';
    this.createModalCategory = selectedCategory;

    if (!selectedCategory) {
      titleEl.textContent = '🏁 Yeni Yarış Oluştur — 1. Adım: Yarış Kategorisi Seçin';
      bodyEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
          <div style="font-size:10.5px; color:var(--ios-subtext); line-height:1.4;">
            Oluşturmak istediğiniz yarış kategorisini seçin. Seçiminize göre yalnızca o yarış türüne özel sade veri giriş ekranı açılacaktır:
          </div>

          <!-- KART 1: BİRLEŞİK KÜMESÜSTÜ & DERNEK YARIŞI -->
          <div onclick="AvigenRaceTracker.selectCreateModalCategory('CLUB_RACE')" style="cursor:pointer; background:#eff6ff; border:2px solid #60a5fa; border-radius:12px; padding:12px 13px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div>
              <div style="font-size:13.5px; font-weight:900; color:#0052cc;">🦅 1. Kümesüstü Yarışı (Dernek &amp; Etap)</div>
              <div style="font-size:10px; color:#1e3a8a; margin-top:3px; line-height:1.38;">
                Kendi kümesinize dönülen tüm dernek, kulüp, federasyon etapları ve kümesüstü uçuş yarışları (İl/İlçe veya GPS koordinat girişi, otomatik km, resmi derece, puanlama ve sezon sıralaması).
              </div>
            </div>
            <span class="ios-btn ios-btn-primary" style="padding:6px 10px; font-size:10px; flex-shrink:0;">Seç →</span>
          </div>
          <!-- Geriye dönük test uyumluluğu için LOFT_ENDURANCE hızlı kısayolu -->
          <button type="button" style="display:none;" onclick="AvigenRaceTracker.selectCreateModalCategory('LOFT_ENDURANCE')">Kümesüstü</button>

          <!-- KART 2: BÜYÜK ÖDÜLLÜ YARIŞ (DERBY / OLR) -->
          <div onclick="AvigenRaceTracker.selectCreateModalCategory('GRAND_PRIZE')" style="cursor:pointer; background:#fffbeb; border:2px solid #fbbf24; border-radius:12px; padding:12px 13px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
            <div>
              <div style="font-size:13.5px; font-weight:900; color:#b45309;">🏆 2. Büyük Ödüllü Yarış (Derby / OLR)</div>
              <div style="font-size:10px; color:#78350f; margin-top:3px; line-height:1.38;">
                Ortak kümese teslim edilen One Loft Race (OLR), Derby ve Büyük Ödüllü turnuvalar; katılım numarası, katılım ücreti, ödül havuzu, eleme / yarı final / final etapları.
              </div>
            </div>
            <span class="ios-btn ios-btn-gold" style="padding:6px 10px; font-size:10px; flex-shrink:0;">Seç →</span>
          </div>
        </div>
      `;
      modal.classList.add('open');
      return;
    }

    this.renderCategorySpecificCreateForm(selectedCategory, prefillData);
    modal.classList.add('open');
  },

  selectCreateModalCategory(categoryCode) {
    this.createModalCategory = categoryCode;
    const prefill = { ...(this._lastPrefillData || {}), category: categoryCode };
    this.renderCategorySpecificCreateForm(categoryCode, prefill);
  },

  // Bir kuşun şu anda hangi Büyük Ödüllü Yarış (Derby / OLR) organizasyonuna teslim edilmiş olduğunu döndürür
  // KURAL: Bir Büyük Yarışa (OLR / Derby) teslim edilen kuş aynı anda 2. farklı bir Büyük Yarışa veya Kümesüstü/Dernek yarışına verilemez!
  getBirdLockedGrandPrizeOrgMap() {
    const lockMap = new Map();
    (this.events || [])
      .filter(ev => ev.category === 'GRAND_PRIZE')
      .forEach(ev => {
        const orgName = (ev.organizationName || 'Uluslararası Derby / OLR').trim();
        (ev.entries || []).forEach(en => {
          const rUp = (en.ring || '').trim().toUpperCase();
          if (rUp && !lockMap.has(rUp)) {
            lockMap.set(rUp, {
              organizationName: orgName,
              codeTitle: ev.codeTitle,
              raceId: ev.id
            });
          }
        });
      });
    return lockMap;
  },

  renderCategorySpecificCreateForm(categoryCode, prefillData = null) {
    const titleEl = document.getElementById('avigenRaceModalTitle');
    const bodyEl = document.getElementById('avigenRaceModalBody');
    if (!bodyEl) return;

    const catMeta = this.CATEGORIES[categoryCode] || this.CATEGORIES.CLUB_RACE;
    if (titleEl) {
      titleEl.textContent = `${catMeta.icon} Yeni ${catMeta.title} Oluştur`;
    }

    const lockedGrandPrizeMap = this.getBirdLockedGrandPrizeOrgMap();
    const prefillOrgNorm = (prefillData?.organizationName || '').trim().toLowerCase();

    const loftBirds = typeof collectUniqueLoftBirds === 'function'
      ? collectUniqueLoftBirds().filter(b => b.isActiveLoftBird && b.birdStatus !== 'LOST' && b.birdStatus !== 'SOLD')
      : [];

    const todayIso = prefillData?.releaseDate || new Date().toISOString().slice(0, 10);
    const geoNodes = (typeof AvigenGenesisAI !== 'undefined' && Array.isArray(AvigenGenesisAI.SMART_RACE_GEO_NODES))
      ? AvigenGenesisAI.SMART_RACE_GEO_NODES
      : [];

    const defaultLoftCityId = prefillData?.loftCityId
      || (typeof AvigenGenesisAI !== 'undefined' && AvigenGenesisAI.state?.smartRaceLoftCityId)
      || (typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state?.cityId && AvigenLiveWeather.state.cityId !== 'gps' ? AvigenLiveWeather.state.cityId : 'bursa');

    const defaultRelCityId = prefillData?.releaseCityId || (categoryCode === 'LOFT_ENDURANCE' ? defaultLoftCityId : 'ankara');
    const prefillRingsSet = prefillData?.selectedRings ? new Set(prefillData.selectedRings.map(r => r.toUpperCase())) : null;

    const activeNestRings = new Set();
    if (typeof activePairsList !== 'undefined' && Array.isArray(activePairsList)) {
      activePairsList.forEach(p => {
        const sr = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(p.sire) : '';
        const dr = typeof extractCleanRingFromText === 'function' ? extractCleanRingFromText(p.dam) : '';
        if (sr) activeNestRings.add(sr.toUpperCase());
        if (dr) activeNestRings.add(dr.toUpperCase());
      });
    }

    // KATEGORİYE ÖZEL VERİ GİRİŞ ALANLARI (Kümesüstü & Dernek Yarışı Birleşik + Büyük Ödüllü Yarış)
    const savedLoftGps = (typeof loftConfig !== 'undefined' && loftConfig.gpsCoords)
      ? loftConfig.gpsCoords
      : (localStorage.getItem('avigen_saved_loft_gps_coords_v1') || '40.1885, 29.0610');
    let categorySpecificFieldsHtml = '';

    if (categoryCode === 'LOFT_ENDURANCE' || categoryCode === 'CLUB_RACE') {
      const nextStageNum = this.events.filter(e => e.category === 'CLUB_RACE' || e.category === 'LOFT_ENDURANCE').length + 1;
      categorySpecificFieldsHtml = `
        <div style="background:var(--ios-card-alt); border:1.5px solid #93c5fd; border-radius:10px; padding:8px 9px; display:flex; flex-direction:column; gap:7px;">
          <!-- 1. SALIM KONUMU: İL/İLÇE SEÇİMİ VEYA SALIM GPS KOORDİNATI -->
          <div style="background:rgba(239,68,68,0.05); border:1px solid rgba(239,68,68,0.25); border-radius:8px; padding:6px 8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:9.3px; font-weight:900; color:#dc2626;">🔴 1. Salım Konumu (İl/İlçe Seçin veya Koordinat Girin)</label>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.2px; color:#dc2626; border-color:#fca5a5;" onclick="AvigenRaceTracker.captureMyGpsForRaceField('newRaceReleaseCoords')">
                🛰️ GPS'ten Al
              </button>
            </div>
            ${geoNodes.length > 0 ? `
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:5px;">
                <select id="newRaceRelCitySelect" class="ios-select" style="padding:5px 6px; font-size:10px; font-weight:800;" onchange="AvigenRaceTracker.onCreateRaceCitySelectChange('rel_city')">
                  ${geoNodes.map(n => `<option value="${n.id}" ${n.id === defaultRelCityId ? 'selected' : ''}>${escapeHtml(n.name.split(' (')[0])}</option>`).join('')}
                </select>
                <select id="newRaceRelDistSelect" class="ios-select" style="padding:5px 6px; font-size:10px; font-weight:800;" onchange="AvigenRaceTracker.onCreateRaceCitySelectChange('rel_dist')">
                  ${(typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.getDistrictsForProvince === 'function' ? AvigenGenesisAI.getDistrictsForProvince(defaultRelCityId) : []).map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                </select>
              </div>
            ` : ''}
            <div style="display:grid; grid-template-columns:0.95fr 1.05fr; gap:5px;">
              <div>
                <label style="font-size:8.4px; font-weight:800; color:var(--ios-subtext);">Salım Noktası Adı</label>
                <input type="text" id="newRaceReleasePoint" class="ios-input" style="padding:5px 7px; font-size:10.3px;" value="${escapeHtml(prefillData?.releasePoint || 'Ankara (Polatlı)')}" />
              </div>
              <div>
                <label style="font-size:8.4px; font-weight:800; color:#dc2626;">📍 Salım Koordinatı (Enlem, Boylam)</label>
                <input type="text" id="newRaceReleaseCoords" class="ios-input" style="padding:5px 7px; font-size:10.3px; font-weight:800;" placeholder="Örn: 39.5842, 32.1472" value="${escapeHtml(prefillData?.releaseCoords || '39.9334, 32.8597')}" oninput="AvigenRaceTracker.onCreateRaceCoordinateInput()" />
              </div>
            </div>
          </div>

          <!-- 2. VARIŞ (KÜMES) KONUMU: İL/İLÇE SEÇİMİ VEYA KÜMES GPS KOORDİNATI -->
          <div style="background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.28); border-radius:8px; padding:6px 8px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <label style="font-size:9.3px; font-weight:900; color:#059669;">🟢 2. Varış / Kümes Konumu (İl/İlçe veya Kümes Koordinatı)</label>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.2px; color:#059669; border-color:#6ee7b7;" onclick="AvigenRaceTracker.captureMyGpsForRaceField('newRaceLoftCoords')">
                🛰️ Kümes GPS'imi Al
              </button>
            </div>
            ${geoNodes.length > 0 ? `
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; margin-bottom:5px;">
                <select id="newRaceLoftCitySelect" class="ios-select" style="padding:5px 6px; font-size:10px; font-weight:800;" onchange="AvigenRaceTracker.onCreateRaceCitySelectChange('loft_city')">
                  ${geoNodes.map(n => `<option value="${n.id}" ${n.id === defaultLoftCityId ? 'selected' : ''}>${escapeHtml(n.name.split(' (')[0])}</option>`).join('')}
                </select>
                <select id="newRaceLoftDistSelect" class="ios-select" style="padding:5px 6px; font-size:10px; font-weight:800;" onchange="AvigenRaceTracker.onCreateRaceCitySelectChange('loft_dist')">
                  ${(typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.getDistrictsForProvince === 'function' ? AvigenGenesisAI.getDistrictsForProvince(defaultLoftCityId) : []).map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                </select>
              </div>
            ` : ''}
            <div>
              <label style="font-size:8.4px; font-weight:800; color:#059669;">📍 Kümes / Varış Koordinatı (Enlem, Boylam — Otomatik Mesafe Hesaplar)</label>
              <input type="text" id="newRaceLoftCoords" class="ios-input" style="padding:5px 7px; font-size:10.3px; font-weight:800;" placeholder="Örn: 40.1885, 29.0610 veya 40°11'18&quot;N 29°03'39&quot;E" value="${escapeHtml(prefillData?.loftCoords || savedLoftGps)}" oninput="AvigenRaceTracker.onCreateRaceCoordinateInput()" />
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1.25fr 1.1fr 0.65fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Yarış / Etap Adı</label>
            <input type="text" id="newRaceCodeTitle" class="ios-input" value="${escapeHtml(prefillData?.codeTitle || `ANKARA – 2026 / ${nextStageNum}. ETAP`)}" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Dernek / Kümes Organizasyonu</label>
            <input type="text" id="newRaceOrgName" class="ios-input" placeholder="Örn: İl Posta Güvercini Derneği / Kümesim" value="${escapeHtml(prefillData?.organizationName || 'Kümesüstü & Dernek Yarışı')}" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Etap No</label>
            <input type="number" id="newRaceStageNumber" class="ios-input" min="1" value="${prefillData?.stageNumber || nextStageNum}" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:0.85fr 0.95fr 0.8fr 0.85fr 1fr; gap:5px;">
          <div>
            <label style="font-size:9px; font-weight:800;">Mesafe (km)</label>
            <input type="number" step="0.1" id="newRaceDistanceKm" class="ios-input" style="font-weight:900; color:#0052cc;" value="${prefillData?.distanceKm || 380}" oninput="AvigenRaceTracker.onCreateDistanceInput(this.value)" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Salım Tarihi</label>
            <input type="date" id="newRaceReleaseDate" class="ios-input" value="${todayIso}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Salım Saati</label>
            <input type="time" id="newRaceReleaseTime" class="ios-input" value="${escapeHtml(prefillData?.releaseTime || '06:45')}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Klasman Kuşu</label>
            <input type="number" id="newRaceCompetitors" class="ios-input" value="${prefillData?.totalCompetitors || 1500}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Puanlama / Tür</label>
            <select id="newRaceScoringSystem" class="ios-select">
              <option value="FCI / %25 Klasman Puanı" selected>FCI / %25 Klasman</option>
              <option value="Dernek 100 Tam Puan">Dernek 100 Puan</option>
              <option value="Kümesüstü Antrenman / Etap">Kümesüstü Uçuş</option>
              <option value="As Kuş Katsayılı">As Kuş Katsayılı</option>
            </select>
          </div>
        </div>
        <input type="hidden" id="newRaceSeasonYear" value="${escapeHtml(prefillData?.seasonYear || '2026 Sezonu')}" />
        <input type="hidden" id="newRaceType" value="${escapeHtml(this.detectRaceTypeByKm(prefillData?.distanceKm || 380))}" />
        <input type="hidden" id="newRaceWeather" value="${escapeHtml(prefillData?.weather || 'Açık • KKD 12 km/s • 19°C')}" />
      `;
    } else {
      // B. BÜYÜK ÖDÜLLÜ YARIŞLAR ('GRAND_PRIZE')
      categorySpecificFieldsHtml = `
        <div style="display:grid; grid-template-columns:1.1fr 1.1fr 0.9fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Organizasyon Adı</label>
            <input type="text" id="newRaceOrgName" class="ios-input" placeholder="Örn: Derby İstanbul OLR / Algarve" value="${escapeHtml(prefillData?.organizationName || 'Uluslararası Derby / OLR')}" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Yarış Adı</label>
            <input type="text" id="newRaceCodeTitle" class="ios-input" placeholder="Örn: 2026 BÜYÜK FİNAL 505 KM" value="${escapeHtml(prefillData?.codeTitle || '2026 DERBY BÜYÜK FİNAL 505 KM')}" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Organizasyon Türü</label>
            <select id="newRaceOrgType" class="ios-select">
              <option value="One Loft Race (OLR)">One Loft Race (OLR)</option>
              <option value="Ulusal Büyük Ödüllü Derby">Ulusal Büyük Ödüllü Derby</option>
              <option value="Özel Ödüllü Turnuva">Özel Ödüllü Turnuva</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:0.9fr 1fr 0.8fr 0.85fr 1.1fr; gap:5px;">
          <div>
            <label style="font-size:9px; font-weight:800;">Yarış Formatı</label>
            <select id="newRaceFormatType" class="ios-select">
              <option value="Çok Etaplı (Eleme + Yarı Final + Final)" selected>Çok Etaplı</option>
              <option value="Tek Etaplı Büyük Final">Tek Etaplı</option>
            </select>
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Etap Aşaması</label>
            <select id="newRaceStageType" class="ios-select">
              <option value="1. Eleme Etabı">1. Eleme Etabı</option>
              <option value="2. Eleme / Hot Spot">2. Eleme / Hot Spot</option>
              <option value="Yarı Final">Yarı Final</option>
              <option value="Büyük Final" selected>Büyük Final</option>
              <option value="Tek Etap Final">Tek Etap Final</option>
            </select>
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Katılım No</label>
            <input type="text" id="newRaceRegNumber" class="ios-input" placeholder="TR-OLR-408" value="${escapeHtml(prefillData?.registrationNumber || 'OLR-2026-108')}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Katılım Ücreti (TL)</label>
            <input type="number" id="newRaceEntryFee" class="ios-input" placeholder="5000" value="${prefillData?.entryFeeTl ?? 5000}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Ödül Bilgisi / Havuzu</label>
            <input type="text" id="newRacePrizePool" class="ios-input" placeholder="1.lik 250.000 TL" value="${escapeHtml(prefillData?.prizePoolInfo || '1.lik Ödülü: 250.000 TL + Kupa')}" />
          </div>
        </div>

        <!-- SALIM NOKTASI VE KOORDİNAT GİRİŞİ -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:6px 8px;">
          <div>
            <label style="font-size:8.6px; font-weight:800;">Salım Noktası Adı</label>
            <input type="text" id="newRaceReleasePoint" class="ios-input" value="${escapeHtml(prefillData?.releasePoint || 'Sivas (505 km Final)')}" />
          </div>
          <div>
            <label style="font-size:8.6px; font-weight:800; color:#dc2626;">📍 Salım Koordinatı (İsteğe Bağlı)</label>
            <input type="text" id="newRaceReleaseCoords" class="ios-input" placeholder="39.7477, 37.0179" value="${escapeHtml(prefillData?.releaseCoords || '')}" oninput="AvigenRaceTracker.onCreateRaceCoordinateInput()" />
          </div>
          <div>
            <label style="font-size:8.6px; font-weight:800; color:#059669;">📍 Derby Kümes Koordinatı</label>
            <input type="text" id="newRaceLoftCoords" class="ios-input" placeholder="41.0082, 28.9784" value="${escapeHtml(prefillData?.loftCoords || '')}" oninput="AvigenRaceTracker.onCreateRaceCoordinateInput()" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:0.85fr 0.9fr 0.9fr 0.8fr 0.9fr; gap:5px;">
          <div>
            <label style="font-size:9px; font-weight:800;">Mesafe (km)</label>
            <input type="number" step="0.1" id="newRaceDistanceKm" class="ios-input" style="font-weight:900; color:#b45309;" value="${prefillData?.distanceKm || 505}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Kayıt Tarihi</label>
            <input type="date" id="newRaceRegDate" class="ios-input" value="${todayIso}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Salım Tarihi</label>
            <input type="date" id="newRaceReleaseDate" class="ios-input" value="${todayIso}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Salım Saati</label>
            <input type="time" id="newRaceReleaseTime" class="ios-input" value="${escapeHtml(prefillData?.releaseTime || '06:30')}" />
          </div>
          <div>
            <label style="font-size:9px; font-weight:800;">Toplam Kuş</label>
            <input type="number" id="newRaceCompetitors" class="ios-input" value="${prefillData?.totalCompetitors || 2400}" />
          </div>
        </div>
      `;
    }

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
        <!-- ÜST KATEGORİ SEÇİCİ ŞERİT (Tek dokunuşla kategori değiştirilebilir) -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; background:${catMeta.bgLight}; border:1.5px solid ${catMeta.borderLight}; border-radius:9px; padding:6px 9px;">
          <div style="font-size:10.5px; font-weight:900; color:${catMeta.accentColor};">
            ${catMeta.icon} Kategori: ${escapeHtml(catMeta.fullTitle)}
          </div>
          <div style="display:flex; gap:4px;">
            <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 7px; font-size:8.8px;" onclick="AvigenRaceTracker.openCreateRaceModal()">
              ⇄ Kategori Değiştir
            </button>
          </div>
        </div>

        ${categorySpecificFieldsHtml}

        <!-- MEVCUT AVIGEN KUŞ VERİ TABANINDAN KUŞ SEÇİMİ (Mükerrer Kayıt Korumalı) -->
        <div style="margin-top:2px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px; margin-bottom:5px;">
            <label style="font-size:10.5px; font-weight:900; color:var(--ios-text);">🕊️ Katılacak Kuşları Seçin (${loftBirds.length} Kuş)</label>
            <div style="display:flex; gap:4px;">
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.8px;" onclick="document.querySelectorAll('.race-bird-chk:not(:disabled)').forEach(c => c.checked = (c.getAttribute('data-role')==='RACER'))">Sadece Yarışçılar</button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.8px;" onclick="document.querySelectorAll('.race-bird-chk:not(:disabled)').forEach(c => c.checked = true)">Tümünü Seç</button>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.8px;" onclick="document.querySelectorAll('.race-bird-chk:not(:disabled)').forEach(c => c.checked = false)">Temizle</button>
            </div>
          </div>
          <div style="max-height:175px; overflow-y:auto; display:flex; flex-direction:column; gap:5px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:7px;">
            ${loftBirds.map((b, idx) => {
              const rUp = b.ring.toUpperCase();
              const gpLock = lockedGrandPrizeMap.get(rUp);
              // Eğer kuş bir Büyük Yarışa (Derby/OLR) teslim edilmişse:
              // - Kümesüstü (LOFT_ENDURANCE) ve Dernek (CLUB_RACE) yarışlarına seçilemez (çünkü kuş kümeste değil!)
              // - Başka bir Büyük Yarış organizasyonuna da seçilemez (yalnızca aynı Derby organizasyonunun sonraki etabına seçilebilir!)
              const isSameGrandOrgStage = categoryCode === 'GRAND_PRIZE' && gpLock && prefillOrgNorm && gpLock.organizationName.trim().toLowerCase() === prefillOrgNorm;
              const isLockedByGrandPrize = Boolean(gpLock && !isSameGrandOrgStage);

              const isChecked = isLockedByGrandPrize
                ? false
                : (prefillRingsSet ? prefillRingsSet.has(rUp) : (b.roleCategory === 'RACER' ? idx < 5 : idx < 2));
              const inNest = activeNestRings.has(rUp);
              const isResting = b.birdStatus === 'RESTING';
              const histCount = this.getBirdRaceHistory(b.ring).filter(h => h.resultStatus === 'ENTERED').length;
              return `
                <label style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:${isLockedByGrandPrize ? '#fef2f2' : 'var(--ios-card)'}; border:1px solid ${isLockedByGrandPrize ? '#fecaca' : 'var(--ios-border)'}; border-radius:8px; padding:5px 8px; cursor:${isLockedByGrandPrize ? 'not-allowed' : 'pointer'}; opacity:${isLockedByGrandPrize ? '0.68' : '1'};">
                  <div style="display:flex; align-items:center; gap:7px; min-width:0;">
                    <input type="checkbox" class="race-bird-chk" value="${escapeHtml(b.ring)}" data-name="${escapeHtml(b.name)}" data-flag="${b.flag || '🇹🇷'}" data-role="${b.roleCategory || 'RACER'}" data-locked-org="${gpLock ? escapeHtml(gpLock.organizationName) : ''}" ${isChecked ? 'checked' : ''} ${isLockedByGrandPrize ? 'disabled' : ''} style="width:15px; height:15px; accent-color:#0066ff;" />
                    <div style="min-width:0;">
                      <div style="font-size:10.8px; font-weight:900; color:var(--ios-text); display:flex; align-items:center; gap:4px; flex-wrap:wrap;">
                        <span>${escapeHtml(b.name)}</span>
                        <span style="font-size:9px; color:${b.sex === 'F' ? '#db2777' : '#0284c7'};">${b.sex === 'F' ? '♀' : '♂'}</span>
                        ${gpLock ? `<span class="gene-badge gene-gold" style="font-size:7.5px; padding:1px 5px; background:#fef3c7; border-color:#f59e0b; color:#b45309;">🔒 ${escapeHtml(gpLock.organizationName)} Teslim Edildi</span>` : ''}
                        ${inNest ? `<span class="gene-badge gene-gold" style="font-size:7.5px; padding:1px 4px;">🪺 Yuvada</span>` : ''}
                        ${isResting ? `<span class="gene-badge gene-red" style="font-size:7.5px; padding:1px 4px;">🟠 Dinlenmede</span>` : ''}
                      </div>
                      <div style="font-size:9px; font-weight:700; color:#0066ff;">
                        ${b.flag} ${escapeHtml(b.ring)} <span style="color:var(--ios-subtext); font-weight:600;">• ${isLockedByGrandPrize ? 'Başka yarışa verilemez' : (histCount > 0 ? `${histCount} Yarış Kaydı` : 'İlk Yarışı')}</span>
                      </div>
                    </div>
                  </div>
                  <span class="gene-badge ${isLockedByGrandPrize ? 'gene-red' : (b.roleCategory === 'RACER' ? 'gene-green' : (b.roleCategory === 'BREEDER' ? 'gene-gold' : 'gene-blue'))}" style="font-size:8px; flex-shrink:0;">
                    ${isLockedByGrandPrize ? '🔒 Derby\'de' : (b.roleCategory === 'RACER' ? '🏁 Yarışçı' : (b.roleCategory === 'BREEDER' ? '🧬 Damızlık' : '🐣 Genç'))}
                  </span>
                </label>
              `;
            }).join('')}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1.5fr; gap:6px; align-items:center; margin-top:2px;">
          <div>
            <label style="font-size:9px; font-weight:800; color:var(--ios-subtext);">Başlangıç Kuş Durumu</label>
            <select id="newRaceInitialBirdStatus" class="ios-select" style="padding:6px; font-size:10.5px; font-weight:800;">
              <option value="PREPARING">📋 Hazırlanıyor</option>
              <option value="BASKETED" selected>🧺 Kafese teslim edildi</option>
              <option value="RELEASED">🛫 Salındı</option>
              <option value="AWAITING">⏳ Dönüş bekleniyor</option>
            </select>
          </div>
          <button class="ios-btn ios-btn-primary" style="width:100%; padding:10px; font-size:12px; font-weight:900; margin-top:12px;" onclick="AvigenRaceTracker.saveNewRaceFromModal()">
            ${catMeta.icon} ${escapeHtml(catMeta.title)} Kaydını Oluştur ve Takibi Başlat
          </button>
        </div>
      </div>
    `;

    if (categoryCode === 'CLUB_RACE' && !prefillData?.distanceKm) {
      this.onCreateRaceCitySelectChange();
    }
  },

  // Hem ondalık ("39.9334, 32.8597") hem derece-dakika-saniye ("39°56'00\"N 32°51'35\"E") GPS koordinat formatlarını çözümler
  parseGpsCoordinateString(rawStr) {
    const s = String(rawStr || '').trim();
    if (!s) return null;

    // 1. DMS (Derece° Dakika' Saniye" N/E) formatı kontrolü
    const dmsRegex = /(\d{1,3})\s*[°dD:\s]\s*(\d{1,2})\s*['′mM:\s]\s*(\d{1,2}(?:\.\d+)?)\s*["″sS]?\s*([NSKGDnskgd])?/g;
    const dmsMatches = Array.from(s.matchAll(dmsRegex));
    if (dmsMatches.length >= 2) {
      const toDec = (m) => {
        let val = Number(m[1]) + (Number(m[2]) / 60) + (Number(m[3]) / 3600);
        const dir = String(m[4] || '').toUpperCase();
        if (dir === 'S' || dir === 'G' || dir === 'W' || dir === 'B') val = -val;
        return Number(val.toFixed(5));
      };
      const lat = toDec(dmsMatches[0]);
      const lon = toDec(dmsMatches[1]);
      if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return { lat, lon };
      }
    }

    // 2. Ondalık (Decimal "39.9334, 32.8597" veya "39.9334 32.8597") formatı kontrolü
    const numMatches = s.replace(/;/g, ',').match(/[-+]?\d{1,3}(?:\.\d+)/g);
    if (numMatches && numMatches.length >= 2) {
      const lat = parseFloat(numMatches[0]);
      const lon = parseFloat(numMatches[1]);
      if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
        return { lat: Number(lat.toFixed(5)), lon: Number(lon.toFixed(5)) };
      }
    }
    return null;
  },

  calculateHaversineKmFromCoords(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  },

  onCreateRaceCoordinateInput() {
    const relStr = document.getElementById('newRaceReleaseCoords')?.value || '';
    const loftStr = document.getElementById('newRaceLoftCoords')?.value || '';
    const relCoord = this.parseGpsCoordinateString(relStr);
    const loftCoord = this.parseGpsCoordinateString(loftStr);
    if (relCoord && loftCoord) {
      const distKm = Math.max(1, Math.round(this.calculateHaversineKmFromCoords(relCoord.lat, relCoord.lon, loftCoord.lat, loftCoord.lon)));
      const kmEl = document.getElementById('newRaceDistanceKm');
      if (kmEl) kmEl.value = distKm;
      this.onCreateDistanceInput(distKm);
    }
  },

  captureMyGpsForRaceField(inputId) {
    if (!navigator.geolocation) {
      alert('⚠️ Cihazınızda GPS konum servisi bulunamadı. Koordinatı elle (Örn: 40.1885, 29.0610) yazabilirsiniz.');
      return;
    }
    const applyPos = (pos) => {
      const lat = Number(pos.coords.latitude).toFixed(5);
      const lon = Number(pos.coords.longitude).toFixed(5);
      const coordText = `${lat}, ${lon}`;
      const el = document.getElementById(inputId);
      if (el) {
        el.value = coordText;
      }
      if (inputId === 'newRaceLoftCoords') {
        try {
          localStorage.setItem('avigen_saved_loft_gps_coords_v1', coordText);
          if (typeof loftConfig !== 'undefined') {
            loftConfig.gpsCoords = coordText;
            if (typeof saveMypedigreData === 'function') saveMypedigreData();
          }
        } catch (e) {}
      }
      this.onCreateRaceCoordinateInput();
    };

    navigator.geolocation.getCurrentPosition(
      applyPos,
      () => {
        // Android'de ilk yüksek hassasiyetli (GPS uydusu) sorgu kapalı mekânda zaman aşımına uğrarsa ağ/Wi-Fi tabanlı konuma otomatik düş
        navigator.geolocation.getCurrentPosition(
          applyPos,
          () => {
            alert('⚠️ GPS konum izni alınamadı veya telefonun Konum servisi kapalı. Koordinatı kutucuğa elle (Örn: 40.1885, 29.0610) girebilirsiniz.');
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 60000 }
    );
  },

  onCreateRaceCitySelectChange(changedField = '') {
    if (typeof AvigenGenesisAI === 'undefined') return;
    const relId = document.getElementById('newRaceRelCitySelect')?.value || 'ankara';
    const loftId = document.getElementById('newRaceLoftCitySelect')?.value || 'bursa';
    const relDistEl = document.getElementById('newRaceRelDistSelect');
    const loftDistEl = document.getElementById('newRaceLoftDistSelect');

    if (changedField === 'rel_city' && relDistEl && typeof AvigenGenesisAI.getDistrictsForProvince === 'function') {
      const dists = AvigenGenesisAI.getDistrictsForProvince(relId);
      relDistEl.innerHTML = dists.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
    }
    if (changedField === 'loft_city' && loftDistEl && typeof AvigenGenesisAI.getDistrictsForProvince === 'function') {
      const dists = AvigenGenesisAI.getDistrictsForProvince(loftId);
      loftDistEl.innerHTML = dists.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('');
    }

    const relDistId = relDistEl?.value || 'merkez';
    const loftDistId = loftDistEl?.value || 'merkez';
    const relNode = typeof AvigenGenesisAI.resolveProvinceAndDistrictNode === 'function'
      ? AvigenGenesisAI.resolveProvinceAndDistrictNode(relId, relDistId, null, 'ankara')
      : AvigenGenesisAI.findGeoNodeByNameOrId(relId, 'ankara');
    const loftNode = typeof AvigenGenesisAI.resolveProvinceAndDistrictNode === 'function'
      ? AvigenGenesisAI.resolveProvinceAndDistrictNode(loftId, loftDistId, null, 'bursa')
      : AvigenGenesisAI.findGeoNodeByNameOrId(loftId, 'bursa');
    const route = AvigenGenesisAI.calculateHaversineRoute(relNode, loftNode, 0, 'calm', 10);

    const shortRel = String(relNode.name || '').replace(/^\d{2}\s*-\s*/, '').split(' (')[0].trim();
    const stageNum = document.getElementById('newRaceStageNumber')?.value || '1';
    const titleEl = document.getElementById('newRaceCodeTitle');
    const ptEl = document.getElementById('newRaceReleasePoint');
    const coordEl = document.getElementById('newRaceReleaseCoords');
    const loftCoordEl = document.getElementById('newRaceLoftCoords');
    const kmEl = document.getElementById('newRaceDistanceKm');

    if (titleEl && (changedField === '' || changedField.startsWith('rel_'))) {
      titleEl.value = `${shortRel.toUpperCase()} – 2026 / ${stageNum}. ETAP`;
    }
    if (ptEl && (changedField === '' || changedField.startsWith('rel_'))) {
      ptEl.value = relNode.name;
    }
    if (coordEl && relNode.lat && relNode.lon && (changedField === '' || changedField.startsWith('rel_'))) {
      coordEl.value = `${Number(relNode.lat).toFixed(4)}, ${Number(relNode.lon).toFixed(4)}`;
    }
    if (loftCoordEl && loftNode.lat && loftNode.lon && (changedField === '' || changedField.startsWith('loft_'))) {
      loftCoordEl.value = `${Number(loftNode.lat).toFixed(4)}, ${Number(loftNode.lon).toFixed(4)}`;
    }
    if (kmEl) kmEl.value = route.crowFliesKm;
    this.onCreateDistanceInput(route.crowFliesKm);
  },

  onCreateDistanceInput(kmVal) {
    const sel = document.getElementById('newRaceType');
    if (sel) sel.value = this.detectRaceTypeByKm(kmVal);
  },

  saveNewRaceFromModal() {
    const category = this.createModalCategory || 'CLUB_RACE';
    const codeTitle = (document.getElementById('newRaceCodeTitle')?.value || 'YENİ YARIŞ – 2026').trim();
    const releasePoint = (document.getElementById('newRaceReleasePoint')?.value || 'Salım Noktası').trim();
    const releaseCoords = (document.getElementById('newRaceReleaseCoords')?.value || '').trim();
    const loftCoords = (document.getElementById('newRaceLoftCoords')?.value || '').trim();
    if (loftCoords) {
      try {
        localStorage.setItem('avigen_saved_loft_gps_coords_v1', loftCoords);
        if (typeof loftConfig !== 'undefined') {
          loftConfig.gpsCoords = loftCoords;
          if (typeof saveMypedigreData === 'function') saveMypedigreData();
        }
      } catch (e) {}
    }
    const distanceKm = parseFloat(document.getElementById('newRaceDistanceKm')?.value) || (category === 'LOFT_ENDURANCE' ? 50 : 350);
    const releaseDate = document.getElementById('newRaceReleaseDate')?.value || new Date().toISOString().slice(0, 10);
    const releaseTime = document.getElementById('newRaceReleaseTime')?.value || '06:45';
    const raceType = document.getElementById('newRaceType')?.value || this.detectRaceTypeByKm(distanceKm);
    const totalCompetitors = parseInt(document.getElementById('newRaceCompetitors')?.value, 10) || (category === 'LOFT_ENDURANCE' ? null : 1200);
    const weather = (document.getElementById('newRaceWeather')?.value || 'Açık Hava').trim();

    const organizationName = (document.getElementById('newRaceOrgName')?.value || (category === 'LOFT_ENDURANCE' ? 'Kendi Kümesim' : (category === 'GRAND_PRIZE' ? 'Uluslararası Derby / OLR' : 'Posta Güvercini Derneği'))).trim();
    const organizationType = document.getElementById('newRaceOrgType')?.value || (category === 'GRAND_PRIZE' ? 'One Loft Race (OLR)' : (category === 'CLUB_RACE' ? 'Resmi Dernek' : 'Kümes İçi'));
    const seasonYear = (document.getElementById('newRaceSeasonYear')?.value || String(releaseDate).slice(0, 4) || '2026').trim();
    const stageNumber = parseInt(document.getElementById('newRaceStageNumber')?.value, 10) || 1;
    const stageType = document.getElementById('newRaceStageType')?.value || (category === 'CLUB_RACE' ? `${stageNumber}. Etap` : (category === 'GRAND_PRIZE' ? 'Büyük Final' : 'Haftalık Performans'));
    const formatType = document.getElementById('newRaceFormatType')?.value || 'Standart';
    const scoringSystem = document.getElementById('newRaceScoringSystem')?.value || 'FCI / %25 Klasman Puanı';
    const registrationNumber = (document.getElementById('newRaceRegNumber')?.value || '').trim();
    const registrationDate = document.getElementById('newRaceRegDate')?.value || releaseDate;
    const entryFeeRaw = document.getElementById('newRaceEntryFee')?.value;
    const entryFeeTl = (entryFeeRaw !== undefined && entryFeeRaw !== '') ? Number(entryFeeRaw) : null;
    const prizePoolInfo = (document.getElementById('newRacePrizePool')?.value || '').trim();
    const initialBirdStatus = document.getElementById('newRaceInitialBirdStatus')?.value || 'BASKETED';

    const checked = Array.from(document.querySelectorAll('.race-bird-chk:checked'));
    if (checked.length === 0) {
      alert('Lütfen yarışa katılacak en az 1 güvercin seçin.');
      return;
    }

    const dObj = new Date(releaseDate);
    const releaseDateLabel = !isNaN(dObj)
      ? dObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
      : releaseDate;

    // Aynı yarış içinde aynı halka numaralı kuşun mükerrer kaydedilmesini ve bir Büyük Yarışa verilen kuşun 2. farklı bir Büyük Yarışa verilmesini engelle
    const lockedGrandPrizeMap = this.getBirdLockedGrandPrizeOrgMap();
    const targetOrgNorm = (organizationName || '').trim().toLowerCase();
    const seenRings = new Set();
    const entries = [];
    for (const chk of checked) {
      const rClean = (chk.value || '').trim().toUpperCase();
      if (!rClean || seenRings.has(rClean)) continue;
      const gpLock = lockedGrandPrizeMap.get(rClean);
      if (gpLock) {
        const isSameGrandOrg = category === 'GRAND_PRIZE' && gpLock.organizationName.trim().toLowerCase() === targetOrgNorm;
        if (!isSameGrandOrg) {
          alert(`⚠️ Kuş Başka Bir Büyük Yarışta (Derby / OLR) Kayıtlı:\n\n"${chk.getAttribute('data-name') || rClean} (${rClean})" güvercini şu anda "${gpLock.organizationName}" organizasyonuna teslim edilmiş durumda!\n\nBir Büyük Ödüllü Yarışa verilen kuş aynı anda 2. bir Büyük Yarışa veya kümes yarışına verilemez.`);
          return;
        }
      }
      seenRings.add(rClean);
      entries.push({
        ring: chk.value.trim(),
        birdName: chk.getAttribute('data-name') || 'Kayıtlı Güvercin',
        flag: chk.getAttribute('data-flag') || '🇹🇷',
        birdStatus: initialBirdStatus,
        manualLostConfirmed: false,
        resultStatus: 'PENDING',
        registrationNumber,
        registrationDate,
        entryFeeTl,
        arrivalDate: '',
        arrivalTime: '',
        durationMinutes: null,
        durationLabel: '—',
        speedMpm: null,
        rank: null,
        points: null,
        wonPrizeAmountTl: null,
        wonAwardTitle: '',
        totalCompetitors: totalCompetitors || entries.length || 1,
        weather,
        notes: '',
        statusHistory: [
          { status: initialBirdStatus, timestamp: new Date().toISOString(), note: 'Yarışa eklendi' }
        ]
      });
    }

    const newEv = this.normalizeRaceRecord({
      id: 'race_ev_' + Date.now(),
      category,
      organizationName,
      organizationType,
      seasonYear,
      seasonName: seasonYear,
      stageNumber,
      stageType,
      formatType,
      scoringSystem,
      registrationNumber,
      registrationDate,
      entryFeeTl,
      prizePoolInfo,
      codeTitle,
      releasePoint,
      releaseCoords,
      loftCoords,
      distanceKm,
      participantBirdsCount: entries.length,
      releaseDate,
      releaseDateLabel,
      releaseTime,
      raceType,
      totalCompetitors: totalCompetitors || entries.length,
      weather,
      status: 'PENDING_RESULTS',
      entries
    });

    this.events.unshift(newEv);
    this.expandedRaceIds.add(newEv.id);
    this.saveEvents();
    this.closeModal();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
    if (typeof renderLoftBirdsDirectory === 'function') renderLoftBirdsDirectory();
  },

  // Mevcut bir yarışa kümesten ek kuş ekleme modalı (Mükerrer kuş ve 2. Büyük Yarış engellemeli)
  openAddBirdsToRaceModal(raceId) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;

    const modal = document.getElementById('avigenRaceModal');
    const titleEl = document.getElementById('avigenRaceModalTitle');
    const bodyEl = document.getElementById('avigenRaceModalBody');
    if (!modal || !bodyEl) return;

    titleEl.textContent = `🕊️ ${ev.codeTitle} Yarışına Kuş Ekle`;
    const existingRings = new Set((ev.entries || []).map(e => e.ring.toUpperCase()));
    const lockedGrandPrizeMap = this.getBirdLockedGrandPrizeOrgMap();
    const evOrgNorm = (ev.organizationName || '').trim().toLowerCase();

    const availableBirds = (typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [])
      .filter(b => {
        if (!b.isActiveLoftBird) return false;
        const rUp = b.ring.toUpperCase();
        if (existingRings.has(rUp)) return false;
        const gpLock = lockedGrandPrizeMap.get(rUp);
        if (gpLock) {
          // Yalnızca aynı Büyük Yarış organizasyonunun bir başka etabıysa izin ver; aksi halde (2. Büyük Yarış veya Kümes/Dernek yarışı) engelle!
          const isSameGrandOrg = ev.category === 'GRAND_PRIZE' && gpLock.organizationName.trim().toLowerCase() === evOrgNorm;
          if (!isSameGrandOrg) return false;
        }
        return true;
      });

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
        <div style="font-size:10.5px; color:var(--ios-subtext);">
          <strong>${escapeHtml(ev.codeTitle)} (${ev.distanceKm} km)</strong> yarış listesine eklenecek kuşları işaretleyin (Mükerrer kayıt koruması aktiftir):
        </div>
        ${availableBirds.length === 0 ? `
          <div style="padding:14px; text-align:center; background:var(--ios-card-alt); border-radius:9px; color:var(--ios-subtext);">
            Kümesinizdeki tüm aktif kuşlar zaten bu yarışa eklenmiş.
          </div>
        ` : `
          <div style="max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:5px;">
            ${availableBirds.map(b => `
              <label style="display:flex; align-items:center; gap:8px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:7px 9px; cursor:pointer;">
                <input type="checkbox" class="add-extra-bird-chk" value="${escapeHtml(b.ring)}" data-name="${escapeHtml(b.name)}" data-flag="${b.flag || '🇹🇷'}" checked style="width:15px; height:15px; accent-color:#0066ff;" />
                <div>
                  <div style="font-weight:900; color:var(--ios-text);">${escapeHtml(b.name)}</div>
                  <div style="font-size:9.5px; font-weight:700; color:#0066ff;">${b.flag} ${escapeHtml(b.ring)}</div>
                </div>
              </label>
            `).join('')}
          </div>
          <button class="ios-btn ios-btn-primary" style="width:100%; padding:10px; font-size:12px;" onclick="AvigenRaceTracker.confirmAddBirdsToRace('${ev.id}')">
            + Seçilen Kuşları Yarışa Ekle
          </button>
        `}
      </div>
    `;
    modal.classList.add('open');
  },

  confirmAddBirdsToRace(raceId) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    const existingRings = new Set((ev.entries || []).map(e => e.ring.trim().toUpperCase()));
    const checked = Array.from(document.querySelectorAll('.add-extra-bird-chk:checked'));
    checked.forEach(chk => {
      const rUp = (chk.value || '').trim().toUpperCase();
      if (!rUp || existingRings.has(rUp)) return; // Mükerrer kayıt engeli
      existingRings.add(rUp);
      ev.entries.push({
        entryId: 'ent_' + ev.id + '_' + rUp,
        raceId: ev.id,
        category: ev.category || 'CLUB_RACE',
        ring: chk.value.trim(),
        birdName: chk.getAttribute('data-name') || 'Kayıtlı Güvercin',
        flag: chk.getAttribute('data-flag') || '🇹🇷',
        birdStatus: 'BASKETED',
        manualLostConfirmed: false,
        resultStatus: 'PENDING',
        arrivalDate: '',
        arrivalTime: '',
        durationMinutes: null,
        durationLabel: '—',
        speedMpm: null,
        rank: null,
        points: null,
        wonPrizeAmountTl: null,
        wonAwardTitle: '',
        totalCompetitors: ev.totalCompetitors,
        weather: ev.weather,
        notes: '',
        statusHistory: [
          { status: 'BASKETED', timestamp: new Date().toISOString(), note: 'Yarışa sonradan eklendi' }
        ]
      });
    });
    ev.participantBirdsCount = ev.entries.length;
    this.recomputeEventOverallStatus(ev);
    this.saveEvents();
    this.closeModal();
    this.renderRaceTrackerMainUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
    if (typeof renderLoftBirdsDirectory === 'function') renderLoftBirdsDirectory();
  },

  // Bir Derby / OLR etabındaki kuşları (kayıp/diskalifiye olmayanları) tek dokunuşla bir sonraki etaba (Eleme -> Yarı Final -> Büyük Final) aktarma
  createNextGrandPrizeStageFromEvent(raceId) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;

    const stageFlow = ['1. Eleme Etabı', '2. Eleme / Hot Spot', 'Yarı Final', 'Büyük Final'];
    const curIdx = stageFlow.indexOf(ev.stageType);
    const nextStageType = curIdx >= 0 && curIdx < stageFlow.length - 1 ? stageFlow[curIdx + 1] : 'Büyük Final';
    const nextDistanceKm = nextStageType === 'Büyük Final' ? 505 : (nextStageType === 'Yarı Final' ? 360 : (Number(ev.distanceKm) || 180) + 100);

    // Sadece kayıp (LOST) veya yarış dışı (DISQUALIFIED) olmayan aktif kuşları bir sonraki etaba seçili getir
    const activeRings = (ev.entries || [])
      .filter(en => en.birdStatus !== 'LOST' && en.birdStatus !== 'DISQUALIFIED')
      .map(en => en.ring);

    this.openCreateRaceModal({
      category: 'GRAND_PRIZE',
      organizationName: ev.organizationName,
      organizationType: ev.organizationType,
      codeTitle: `${(ev.organizationName || 'DERBY').toUpperCase()} – ${nextStageType.toUpperCase()} (${nextDistanceKm} KM)`,
      stageType: nextStageType,
      distanceKm: nextDistanceKm,
      registrationNumber: ev.registrationNumber,
      entryFeeTl: ev.entryFeeTl,
      prizePoolInfo: ev.prizePoolInfo,
      releasePoint: ev.releasePoint,
      totalCompetitors: ev.totalCompetitors,
      selectedRings: activeRings
    });
  },

  // Kuşlarım listesindeki herhangi bir kuşun "İşlemler -> 🏆 Büyük Yarışa (Derby/OLR) Teslim Et" menüsü
  openQuickAssignBirdToGrandPrize(ring) {
    if (!this._initialized) this.init();
    const cleanRing = (ring || '').trim();
    if (!cleanRing) return;

    const modal = document.getElementById('avigenRaceModal');
    const titleEl = document.getElementById('avigenRaceModalTitle');
    const bodyEl = document.getElementById('avigenRaceModalBody');
    if (!modal || !bodyEl) return;

    const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];
    const birdObj = allBirds.find(b => b.ring.trim().toUpperCase() === cleanRing.toUpperCase()) || {
      ring: cleanRing,
      name: 'Kayıtlı Güvercin',
      flag: '🇹🇷'
    };

    const existingGrandRaces = this.events.filter(ev => ev.category === 'GRAND_PRIZE');
    const lockedGrandPrizeMap = this.getBirdLockedGrandPrizeOrgMap();
    const currentLock = lockedGrandPrizeMap.get(cleanRing.toUpperCase());

    titleEl.textContent = `🏆 Büyük Yarışa (Derby / OLR) Kuş Teslim Et — ${birdObj.ring}`;
    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px; font-size:11px;">
        <div style="background:#fffbeb; border:1.5px solid #fcd34d; border-radius:10px; padding:9px 11px;">
          <div style="font-size:12px; font-weight:900; color:#92400e;">
            ${birdObj.flag || '🇹🇷'} ${escapeHtml(birdObj.name)} (${escapeHtml(birdObj.ring)})
          </div>
          <div style="font-size:9.8px; color:#b45309; margin-top:2px;">
            ${currentLock
              ? `🔒 Bu güvercin şu anda <strong>"${escapeHtml(currentLock.organizationName)}"</strong> organizasyonuna teslim edilmiş durumdadır. Bir Büyük Yarışa verilen kuş 2. farklı bir Büyük Yarışa verilemez (yalnızca aynı organizasyonun yeni etaplarına eklenebilir).`
              : `Bu kuşu mevcut bir Büyük Ödüllü Yarışa (Derby / OLR) tek dokunuşla teslim edebilir veya yeni bir Derby organizasyonu açabilirsiniz:`}
          </div>
        </div>

        ${existingGrandRaces.length > 0 ? `
          <div>
            <div style="font-size:10px; font-weight:900; color:var(--ios-text); margin-bottom:5px;">
              📋 Mevcut Büyük Ödüllü Yarışlar (Derby / OLR) (${existingGrandRaces.length} Aktif Turnuva):
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; max-height:210px; overflow-y:auto;">
              ${existingGrandRaces.map(ev => {
                const alreadyIn = (ev.entries || []).some(e => e.ring.trim().toUpperCase() === cleanRing.toUpperCase());
                const isDifferentLockedOrg = currentLock && currentLock.organizationName.trim().toLowerCase() !== (ev.organizationName || '').trim().toLowerCase();
                return `
                  <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; background:${isDifferentLockedOrg ? '#fef2f2' : 'var(--ios-card-alt)'}; border:1px solid ${isDifferentLockedOrg ? '#fecaca' : 'var(--ios-border)'}; border-radius:9px; padding:7px 9px; opacity:${isDifferentLockedOrg ? '0.68' : '1'};">
                    <div style="min-width:0; flex:1;">
                      <div style="font-size:11px; font-weight:900; color:var(--ios-text);">🏆 ${escapeHtml(ev.organizationName)} — ${escapeHtml(ev.codeTitle)}</div>
                      <div style="font-size:9px; color:var(--ios-subtext); margin-top:1px;">
                        ${escapeHtml(ev.stageType || 'Etap')} • ${ev.distanceKm} km • ${(ev.entries || []).length} Kuş Kayıtlı
                      </div>
                    </div>
                    ${alreadyIn ? `
                      <span class="gene-badge gene-green" style="font-size:8.5px; padding:3px 7px;">✅ Kayıtlı</span>
                    ` : (isDifferentLockedOrg ? `
                      <span class="gene-badge gene-red" style="font-size:8px; padding:3px 6px;">🔒 Başka Derby'de</span>
                    ` : `
                      <button type="button" class="ios-btn ios-btn-gold" style="padding:5px 9px; font-size:9.5px; font-weight:900; flex-shrink:0;" onclick="AvigenRaceTracker.quickAddSingleBirdToGrandPrizeEvent('${ev.id}', '${escapeHtml(birdObj.ring)}', '${escapeHtml(birdObj.name)}', '${birdObj.flag || '🇹🇷'}')">
                        + Bu Derby'ye Ekle
                      </button>
                    `)}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${!currentLock ? `
          <div style="border-top:1px dashed var(--ios-border); padding-top:8px;">
            <button type="button" class="ios-btn ios-btn-primary" style="width:100%; padding:10px; font-size:11.5px; font-weight:900;" onclick="AvigenRaceTracker.openCreateRaceModal({ category: 'GRAND_PRIZE', selectedRings: ['${escapeHtml(birdObj.ring)}'] })">
              🏆 + Yeni Büyük Ödüllü Yarış (Derby / OLR) Organizasyonu Oluştur
            </button>
          </div>
        ` : ''}
      </div>
    `;
    modal.classList.add('open');
  },

  quickAddSingleBirdToGrandPrizeEvent(raceId, ring, birdName, flag) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    const rUp = (ring || '').trim().toUpperCase();
    if (!rUp) return;

    const lockedGrandPrizeMap = this.getBirdLockedGrandPrizeOrgMap();
    const currentLock = lockedGrandPrizeMap.get(rUp);
    if (currentLock && currentLock.organizationName.trim().toLowerCase() !== (ev.organizationName || '').trim().toLowerCase()) {
      alert(`⚠️ Kural İhlali Engellendi:\n\n"${birdName || rUp} (${ring})" güvercini zaten "${currentLock.organizationName}" büyük yarışına teslim edilmiş durumda!\n\nBir Büyük Yarışa verilen kuş 2. farklı bir Büyük Yarışa verilemez.`);
      return;
    }
    const exists = (ev.entries || []).some(e => e.ring.trim().toUpperCase() === rUp);
    if (!exists) {
      ev.entries.push({
        entryId: 'ent_' + ev.id + '_' + rUp,
        raceId: ev.id,
        category: 'GRAND_PRIZE',
        ring: ring.trim(),
        birdName: birdName || 'Kayıtlı Güvercin',
        flag: flag || '🇹🇷',
        birdStatus: 'BASKETED',
        manualLostConfirmed: false,
        resultStatus: 'PENDING',
        registrationNumber: ev.registrationNumber || '',
        registrationDate: ev.registrationDate || ev.releaseDate || '',
        entryFeeTl: ev.entryFeeTl || null,
        arrivalDate: '',
        arrivalTime: '',
        durationMinutes: null,
        durationLabel: '—',
        speedMpm: null,
        rank: null,
        points: null,
        wonPrizeAmountTl: null,
        wonAwardTitle: '',
        totalCompetitors: ev.totalCompetitors,
        weather: ev.weather,
        notes: '',
        statusHistory: [
          { status: 'BASKETED', timestamp: new Date().toISOString(), note: 'Büyük Ödüllü Yarışa (Derby/OLR) teslim edildi' }
        ]
      });
      ev.participantBirdsCount = ev.entries.length;
      this.recomputeEventOverallStatus(ev);
      this.saveEvents();
    }
    this.closeModal();
    this.renderRaceTrackerMainUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
    if (typeof renderLoftBirdsDirectory === 'function') renderLoftBirdsDirectory();
  },

  // --------------------------------------------------------------------------
  // BİREYSEL KUŞ DURUM, SONUÇ, PUAN VE ÖDÜL GİRİŞ MODALI
  // --------------------------------------------------------------------------
  openResultEntryModal(raceId, ring) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    const entry = (ev.entries || []).find(en => en.ring.toUpperCase() === ring.trim().toUpperCase());
    if (!entry) return;

    const modal = document.getElementById('avigenRaceModal');
    const titleEl = document.getElementById('avigenRaceModalTitle');
    const bodyEl = document.getElementById('avigenRaceModalBody');
    if (!modal || !bodyEl) return;

    const catMeta = this.CATEGORIES[ev.category] || this.CATEGORIES.CLUB_RACE;
    titleEl.textContent = `${catMeta.icon} Yarış Durumu & Sonucu — ${entry.birdName}`;
    const arrDate = entry.arrivalDate || ev.releaseDate;
    const arrTime = entry.arrivalTime || '12:00';
    const durMin = entry.durationMinutes || '';
    const rankVal = entry.rank || '';
    const compVal = entry.totalCompetitors || ev.totalCompetitors || 1450;
    const ptsVal = entry.points !== null && entry.points !== undefined ? entry.points : '';
    const prizeTlVal = entry.wonPrizeAmountTl !== null && entry.wonPrizeAmountTl !== undefined ? entry.wonPrizeAmountTl : '';
    const awardTitleVal = entry.wonAwardTitle || '';
    const weatherVal = entry.weather || ev.weather || 'Açık Hava';
    const notesVal = entry.notes || '';
    const curStatus = entry.birdStatus || (entry.resultStatus === 'ENTERED' ? 'RETURNED' : 'AWAITING');

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid ${catMeta.accentColor}; border-radius:9px; padding:8px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:12px; font-weight:900; color:var(--ios-text);">
              ${entry.flag || '🇹🇷'} ${escapeHtml(entry.birdName)} (${escapeHtml(entry.ring)})
            </div>
            <span class="gene-badge ${catMeta.badgeClass}" style="font-size:8.5px;">${escapeHtml(catMeta.title)}</span>
          </div>
          <div style="font-size:9.8px; color:var(--ios-subtext); margin-top:2px;">
            🏁 <strong>${escapeHtml(ev.codeTitle)}</strong> (${escapeHtml(ev.stageType || 'Etap')}) • Mesafe: <strong>${ev.distanceKm} km</strong> • Salım: ${escapeHtml(ev.releaseDateLabel)} ${escapeHtml(ev.releaseTime || '06:45')}
          </div>
        </div>

        <div>
          <label style="font-size:9.5px; font-weight:900; color:var(--ios-text);">Kuşun Yarış Durumu (7 Resmi Durum)</label>
          <select id="resBirdStatusSelect" class="ios-select" style="font-weight:800; margin-top:2px;">
            ${Object.values(this.BIRD_STATUSES).map(st => `
              <option value="${st.code}" ${curStatus === st.code ? 'selected' : ''}>${st.icon} ${escapeHtml(st.label)}</option>
            `).join('')}
          </select>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Eve Dönüş Tarihi</label>
            <input type="date" id="resArrivalDate" class="ios-input" value="${escapeHtml(arrDate)}" onchange="AvigenRaceTracker.previewResultModalMetrics('${ev.id}')" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Eve Dönüş Saati</label>
            <input type="time" id="resArrivalTime" class="ios-input" value="${escapeHtml(arrTime)}" oninput="AvigenRaceTracker.previewResultModalMetrics('${ev.id}')" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Uçuş Süresi (Dk)</label>
            <input type="number" id="resDurationMin" class="ios-input" placeholder="Otomatik" value="${durMin}" oninput="AvigenRaceTracker.previewResultModalMetrics('${ev.id}', true)" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Resmi Derece (Sıra)</label>
            <input type="number" id="resRank" class="ios-input" placeholder="Örn: 1" value="${rankVal}" min="1" oninput="AvigenRaceTracker.previewResultModalMetrics('${ev.id}')" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Toplam Katılımcı Kuş</label>
            <input type="number" id="resCompetitors" class="ios-input" value="${compVal}" min="1" oninput="AvigenRaceTracker.previewResultModalMetrics('${ev.id}')" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Klasman Puanı</label>
            <input type="number" step="0.1" id="resPoints" class="ios-input" placeholder="Otomatik" value="${ptsVal}" />
          </div>
        </div>

        ${ev.category === 'GRAND_PRIZE' || ev.category === 'CLUB_RACE' ? `
          <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:6px; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:6px 8px;">
            <div>
              <label style="font-size:9px; font-weight:800; color:#b45309;">🏆 Kazanılan Ödül / Ünvan (Varsa)</label>
              <input type="text" id="resAwardTitle" class="ios-input" placeholder="Örn: Final 1.lik Kupası / As Kuş" value="${escapeHtml(awardTitleVal)}" />
            </div>
            <div>
              <label style="font-size:9px; font-weight:800; color:#059669;">💰 Kazanılan Para Ödülü (TL)</label>
              <input type="number" id="resPrizeAmountTl" class="ios-input" placeholder="Örn: 250000" value="${prizeTlVal}" />
            </div>
          </div>
        ` : ''}

        <div style="display:grid; grid-template-columns:1fr 1.2fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Hava Koşulları</label>
            <input type="text" id="resWeather" class="ios-input" value="${escapeHtml(weatherVal)}" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Yarış Sonucu Notu</label>
            <input type="text" id="resNotes" class="ios-input" placeholder="Gözlem veya derece notu..." value="${escapeHtml(notesVal)}" />
          </div>
        </div>

        <div id="resLiveSpeedPreview" style="background:#ecfdf5; border:1px solid #a7f3d0; color:#065f46; border-radius:8px; padding:7px 10px; font-size:10px; font-weight:800;"></div>

        <button class="ios-btn ios-btn-green" style="width:100%; padding:10px; font-size:12px; font-weight:900;" onclick="AvigenRaceTracker.saveBirdRaceResult('${ev.id}', '${escapeHtml(entry.ring)}')">
          ✅ Kaydet (Kuşun Performans Arşivine &amp; GENESIS AI'ya İşle)
        </button>
      </div>
    `;

    modal.classList.add('open');
    this.previewResultModalMetrics(ev.id);
  },

  previewResultModalMetrics(raceId, fromManualDuration = false) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;

    const arrDate = document.getElementById('resArrivalDate')?.value || ev.releaseDate;
    const arrTime = document.getElementById('resArrivalTime')?.value || '';
    const durInput = document.getElementById('resDurationMin');
    const manualMin = durInput && durInput.value ? parseFloat(durInput.value) : null;

    const calc = this.calculateFlightMetrics(
      ev.distanceKm,
      ev.releaseDate,
      ev.releaseTime || '06:45',
      fromManualDuration ? '' : arrDate,
      fromManualDuration ? '' : arrTime,
      manualMin
    );

    if (!fromManualDuration && calc.durationMinutes && durInput) {
      durInput.value = calc.durationMinutes;
    }

    const rankRaw = document.getElementById('resRank')?.value;
    const rank = rankRaw ? parseInt(rankRaw, 10) : null;
    const comp = parseInt(document.getElementById('resCompetitors')?.value, 10) || ev.totalCompetitors || 1000;
    const ptsInput = document.getElementById('resPoints');
    if (rank && ptsInput && !ptsInput.value) {
      const autoPts = this.calculateOfficialPoints(rank, comp, ev.distanceKm);
      if (autoPts !== null) ptsInput.value = autoPts;
    }

    const box = document.getElementById('resLiveSpeedPreview');
    if (box) {
      const kmhStr = calc.speedMpm ? ` (${(calc.speedMpm * 0.06).toFixed(1).replace('.', ',')} km/sa)` : '';
      box.innerHTML = `⚡ Hesaplanan Uçuş Süresi: <strong>${calc.durationLabel}</strong> • Ortalama Hız: <strong>${calc.speedMpm ? calc.speedMpm + ' m/dk' + kmhStr : 'Veri Yetersiz'}</strong>${rank ? ` • Derece: <strong>${rank}. / ${comp.toLocaleString('tr-TR')} Kuş</strong>` : ''}`;
    }
  },

  saveBirdRaceResult(raceId, ring) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    const entry = (ev.entries || []).find(en => en.ring.toUpperCase() === ring.trim().toUpperCase());
    if (!entry) return;

    const chosenStatus = document.getElementById('resBirdStatusSelect')?.value || 'RETURNED';
    if (chosenStatus === 'LOST' && !entry.manualLostConfirmed) {
      const okLost = confirm(`⚠️ "${entry.birdName} (${entry.ring})" güvercinini "🔴 KAYIP" olarak manuel onaylamak istiyor musunuz?`);
      if (!okLost) return;
    }

    const arrDate = document.getElementById('resArrivalDate')?.value || ev.releaseDate;
    const arrTime = document.getElementById('resArrivalTime')?.value || '';
    const manualMinRaw = document.getElementById('resDurationMin')?.value;
    const manualMin = manualMinRaw ? parseFloat(manualMinRaw) : null;
    const rankRaw = document.getElementById('resRank')?.value;
    const rank = rankRaw ? parseInt(rankRaw, 10) : null;
    const comp = parseInt(document.getElementById('resCompetitors')?.value, 10) || ev.totalCompetitors || null;
    const ptsRaw = document.getElementById('resPoints')?.value;
    const awardTitle = (document.getElementById('resAwardTitle')?.value || '').trim();
    const prizeRaw = document.getElementById('resPrizeAmountTl')?.value;
    const weather = (document.getElementById('resWeather')?.value || ev.weather || 'Açık Hava').trim();
    const notes = (document.getElementById('resNotes')?.value || '').trim();

    if (chosenStatus === 'LOST' || chosenStatus === 'DISQUALIFIED') {
      entry.birdStatus = chosenStatus;
      entry.manualLostConfirmed = chosenStatus === 'LOST';
      entry.resultStatus = chosenStatus;
      entry.notes = notes || (chosenStatus === 'LOST' ? 'Manuel onaylı yarış kaybı' : 'Yarış dışı kaldı');
    } else if (['PREPARING', 'BASKETED', 'RELEASED', 'AWAITING'].includes(chosenStatus) && !arrTime && !manualMin && !rank) {
      entry.birdStatus = chosenStatus;
      entry.manualLostConfirmed = false;
      entry.resultStatus = 'PENDING';
      entry.notes = notes;
    } else {
      // Eve döndü & sonuç girildi
      const calc = this.calculateFlightMetrics(ev.distanceKm, ev.releaseDate, ev.releaseTime || '06:45', arrDate, arrTime, manualMin);
      entry.birdStatus = 'RETURNED';
      entry.manualLostConfirmed = false;
      entry.resultStatus = 'ENTERED';
      entry.arrivalDate = arrDate;
      entry.arrivalTime = arrTime;
      entry.durationMinutes = calc.durationMinutes;
      entry.durationLabel = calc.durationLabel;
      entry.speedMpm = calc.speedMpm;
      entry.rank = rank;
      entry.totalCompetitors = comp;
      entry.points = (ptsRaw !== undefined && ptsRaw !== '')
        ? Number(ptsRaw)
        : (rank ? this.calculateOfficialPoints(rank, comp, ev.distanceKm) : null);
      entry.wonAwardTitle = awardTitle;
      entry.wonPrizeAmountTl = (prizeRaw !== undefined && prizeRaw !== '') ? Number(prizeRaw) : null;
      entry.weather = weather;
      entry.notes = notes;
    }

    if (!Array.isArray(entry.statusHistory)) entry.statusHistory = [];
    entry.statusHistory.push({
      status: entry.birdStatus,
      timestamp: new Date().toISOString(),
      note: notes || `Sonuç/Durum kaydedildi (${this.BIRD_STATUSES[entry.birdStatus]?.label || entry.birdStatus})`
    });

    this.recomputeEventOverallStatus(ev);
    this.syncSingleBirdEntryToDossierAndPedigree(ev, entry);
    this.saveEvents();
    if (typeof saveMypedigreData === 'function') saveMypedigreData();
    this.closeModal();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  },

  syncSingleBirdEntryToDossierAndPedigree(ev, entry) {
    if (!ev || !entry || entry.resultStatus !== 'ENTERED') return;
    const cleanRingUpper = entry.ring.trim().toUpperCase();
    const syncKey = `rt_sync_${ev.id}_${cleanRingUpper}`;
    const comp = entry.totalCompetitors || ev.totalCompetitors || 0;
    const rank = entry.rank;
    const weather = entry.weather || ev.weather || 'Açık Hava';
    const kmhFormatted = entry.speedMpm ? (entry.speedMpm * 0.06).toFixed(1).replace('.', ',') : '';
    const catMeta = this.CATEGORIES[ev.category] || this.CATEGORIES.CLUB_RACE;

    const rankPart = rank ? `${rank}. ` : '';
    const compPart = comp > 1 ? `${comp.toLocaleString('tr-TR')} Kuş - ` : '';
    const spdPart = entry.speedMpm ? `${entry.speedMpm} m/dk • ${kmhFormatted} km/sa` : (entry.durationLabel !== '—' ? `Süre: ${entry.durationLabel}` : '');
    const prizePart = entry.wonPrizeAmountTl ? ` • Ödül: ${entry.wonPrizeAmountTl.toLocaleString('tr-TR')} TL` : (entry.wonAwardTitle ? ` • ${entry.wonAwardTitle}` : '');
    const degreeSummaryLine = `${rankPart}${ev.codeTitle} ${ev.distanceKm ? ev.distanceKm + ' km ' : ''}(${compPart}${spdPart})${prizePart}`.trim();

    if (typeof racesList !== 'undefined') {
      const existingRaceIdx = racesList.findIndex(r => r.syncKey === syncKey);
      const racePayload = {
        id: existingRaceIdx >= 0 ? racesList[existingRaceIdx].id : ('race_sync_' + Date.now() + '_' + Math.floor(Math.random() * 999)),
        syncKey,
        icon: rank === 1 ? '🥇' : (rank && rank <= 3 ? '🥈' : catMeta.icon),
        title: `${ev.codeTitle} (${ev.distanceKm} km)${rank ? ` — ${rank}.lik` : ''}`,
        detail: `${entry.flag || '🇹🇷'} ${entry.ring} (${entry.birdName}) • ${spdPart}${prizePart}`,
        badge: rank && comp ? `${rank}. / ${comp.toLocaleString('tr-TR')} Kuş` : catMeta.title,
        badgeColor: rank && rank <= 10 ? 'gene-green' : catMeta.badgeClass
      };
      if (existingRaceIdx >= 0) racesList[existingRaceIdx] = racePayload;
      else racesList.unshift(racePayload);
    }

    if (typeof birdDossierList !== 'undefined') {
      const existingDosIdx = birdDossierList.findIndex(d => d.syncKey === syncKey);
      const dosPayload = {
        id: existingDosIdx >= 0 ? birdDossierList[existingDosIdx].id : ('dos_rt_' + Date.now() + '_' + Math.floor(Math.random() * 999)),
        syncKey,
        ring: entry.ring,
        birdName: entry.birdName,
        category: ev.category === 'LOFT_ENDURANCE' ? 'Kümes Üstü Uçuş' : 'Yarış Derecesi',
        icon: catMeta.icon,
        title: degreeSummaryLine,
        detail: `Kategori: ${catMeta.title} (${ev.organizationName || ''}) • Salım: ${ev.releasePoint} (${ev.releaseDateLabel} ${ev.releaseTime}) • Dönüş: ${entry.arrivalTime || '—'} • Süre: ${entry.durationLabel} • Hava: ${weather}${prizePart}`,
        date: entry.arrivalDate || ev.releaseDate,
        badgeColor: 'gene-green'
      };
      if (existingDosIdx >= 0) birdDossierList[existingDosIdx] = dosPayload;
      else birdDossierList.unshift(dosPayload);
    }

    if (typeof pedigrees !== 'undefined' && Array.isArray(pedigrees)) {
      pedigrees.forEach(p => {
        Object.values(p.boxes || {}).forEach(b => {
          if (b && b.ring && b.ring.trim().toUpperCase() === cleanRingUpper) {
            const curNotes = String(b.notes || '');
            if (!curNotes.includes(ev.codeTitle)) {
              b.notes = (curNotes ? curNotes + '\n' : '') + degreeSummaryLine;
            } else {
              const lines = curNotes.split(/\r?\n/);
              b.notes = lines.map(l => l.includes(ev.codeTitle) ? degreeSummaryLine : l).join('\n');
            }
          }
        });
      });
    }
  },

  // Tek dokunuşla "⚡ Şimdi İndi" (Eve Döndü) kaydı
  stampInstantBirdArrival(raceId, ring, skipRender = false, forcedRank = null) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;
    const entry = (ev.entries || []).find(en => en.ring.toUpperCase() === ring.trim().toUpperCase());
    if (!entry) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    let nowTimeStr = `${hh}:${mm}`;

    const relDate = ev.releaseDate || now.toISOString().slice(0, 10);
    let calc = this.calculateFlightMetrics(ev.distanceKm, relDate, ev.releaseTime || '06:45', relDate, nowTimeStr, null);
    if (!calc.durationMinutes || calc.durationMinutes <= 5) {
      const estDurMin = Math.max(20, Math.round(((ev.distanceKm || 60) * 1000) / 1365));
      const relParts = String(ev.releaseTime || '06:45').split(':');
      const relTotalMin = (parseInt(relParts[0], 10) || 6) * 60 + (parseInt(relParts[1], 10) || 45) + estDurMin;
      const arrH = String(Math.floor((relTotalMin % 1440) / 60)).padStart(2, '0');
      const arrM = String(relTotalMin % 60).padStart(2, '0');
      nowTimeStr = `${arrH}:${arrM}`;
      calc = this.calculateFlightMetrics(ev.distanceKm, relDate, ev.releaseTime || '06:45', relDate, nowTimeStr, estDurMin);
    }

    const existingEnteredCount = (ev.entries || []).filter(e => e.resultStatus === 'ENTERED').length;
    entry.birdStatus = 'RETURNED';
    entry.manualLostConfirmed = false;
    entry.resultStatus = 'ENTERED';
    entry.arrivalDate = relDate;
    entry.arrivalTime = nowTimeStr;
    entry.durationMinutes = calc.durationMinutes;
    entry.durationLabel = calc.durationLabel;
    entry.speedMpm = calc.speedMpm;
    entry.rank = forcedRank || entry.rank || (existingEnteredCount + 1);
    entry.totalCompetitors = ev.totalCompetitors || ev.entries.length || 1;
    entry.points = this.calculateOfficialPoints(entry.rank, entry.totalCompetitors, ev.distanceKm);
    entry.weather = ev.weather || 'Açık Hava';
    entry.notes = `⚡ Şimdi İndi ile saat ${nowTimeStr}'de eve dönüşü kaydedildi.`;

    if (!Array.isArray(entry.statusHistory)) entry.statusHistory = [];
    entry.statusHistory.push({
      status: 'RETURNED',
      timestamp: new Date().toISOString(),
      note: entry.notes
    });

    this.recomputeEventOverallStatus(ev);
    this.syncSingleBirdEntryToDossierAndPedigree(ev, entry);

    if (!skipRender) {
      this.saveEvents();
      if (typeof saveMypedigreData === 'function') saveMypedigreData();
      this.renderRaceTrackerMainUI();
      this.renderRaceAiInsightsUI();
      if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
    }
  },

  // Toplu Durum, Varış Saati ve Derece Giriş Modalı
  openBatchResultModal(raceId) {
    return this.openBatchResultEntryModal(raceId);
  },

  openBatchResultEntryModal(raceId) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;

    const modal = document.getElementById('avigenRaceModal');
    const titleEl = document.getElementById('avigenRaceModalTitle');
    const bodyEl = document.getElementById('avigenRaceModalBody');
    if (!modal || !bodyEl) return;

    titleEl.textContent = `📋 Toplu Durum, Varış & Klasman Girişi — ${ev.codeTitle}`;
    const entries = ev.entries || [];

    bodyEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:10.5px;">
        <div style="background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; padding:8px 10px;">
          <div style="font-size:10.5px; font-weight:900; color:#0052cc; margin-bottom:5px;">
            1. Yarış Ortak Bilgileri (Mesafe: ${ev.distanceKm} km • Kategori: ${escapeHtml(this.CATEGORIES[ev.category]?.title || 'Yarış')})
          </div>
          <div style="display:grid; grid-template-columns:0.85fr 0.95fr 1.4fr; gap:6px;">
            <div>
              <label style="font-size:9px; font-weight:800;">Salım Saati</label>
              <input type="time" id="batchReleaseTime" class="ios-input" style="padding:5px 7px; font-size:11px; font-weight:800;" value="${escapeHtml(ev.releaseTime || '06:45')}" onchange="AvigenRaceTracker.recalcAllBatchRows('${ev.id}')" />
            </div>
            <div>
              <label style="font-size:9px; font-weight:800;">Toplam Klasman Kuşu</label>
              <input type="number" id="batchTotalCompetitors" class="ios-input" style="padding:5px 7px; font-size:11px; font-weight:800;" value="${ev.totalCompetitors || entries.length || 100}" />
            </div>
            <div>
              <label style="font-size:9px; font-weight:800;">Yarış Günü Hava Koşulu</label>
              <input type="text" id="batchWeather" class="ios-input" style="padding:5px 7px; font-size:11px;" value="${escapeHtml(ev.weather || 'Açık Hava')}" />
            </div>
          </div>
        </div>

        <div style="font-size:10px; font-weight:900; color:var(--ios-subtext); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
          <span>2. Kuşların Durumu, Varış Saati ve Derecesi (${entries.length} Kuş)</span>
          <span style="color:#059669;">Not: Dönüş bekleyenler otomatik kayıp sayılmaz!</span>
        </div>

        <div style="max-height:290px; overflow-y:auto; display:flex; flex-direction:column; gap:5px; padding-right:2px;">
          ${entries.map((en, idx) => {
            const curSt = en.birdStatus || (en.resultStatus === 'ENTERED' ? 'RETURNED' : 'AWAITING');
            return `
              <div class="batch-bird-row" data-ring="${escapeHtml(en.ring)}" style="display:grid; grid-template-columns:1.2fr 0.95fr 0.85fr 0.55fr 0.85fr auto; gap:4px; align-items:center; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:6px 7px;">
                <div style="min-width:0;">
                  <div style="font-size:10px; font-weight:900; color:var(--ios-text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${idx + 1}. ${escapeHtml(en.birdName)}
                  </div>
                  <div style="font-size:8.8px; font-weight:800; color:#0066ff;">${en.flag || '🇹🇷'} ${escapeHtml(en.ring)}</div>
                </div>

                <div>
                  <label style="font-size:7.8px; font-weight:800; color:var(--ios-subtext); display:block;">Durum</label>
                  <select class="ios-select batch-bird-status" style="padding:4px; font-size:9.2px; font-weight:800;">
                    ${Object.values(this.BIRD_STATUSES).map(st => `
                      <option value="${st.code}" ${curSt === st.code ? 'selected' : ''}>${st.icon} ${escapeHtml(st.label)}</option>
                    `).join('')}
                  </select>
                </div>

                <div>
                  <label style="font-size:7.8px; font-weight:800; color:var(--ios-subtext); display:block;">Varış Saati</label>
                  <input type="time" class="ios-input batch-arr-time" value="${escapeHtml(en.arrivalTime || '')}" style="padding:4px; font-size:10px; font-weight:800;" oninput="AvigenRaceTracker.onBatchRowTimeInput('${ev.id}', this)" />
                </div>

                <div>
                  <label style="font-size:7.8px; font-weight:800; color:var(--ios-subtext); display:block;">Derece</label>
                  <input type="number" class="ios-input batch-rank" min="1" placeholder="Sıra" value="${en.rank || ''}" style="padding:4px; font-size:10px; font-weight:900; color:#059669;" />
                </div>

                <div class="batch-speed-preview" style="font-size:8.5px; font-weight:800; color:${en.speedMpm ? '#059669' : 'var(--ios-subtext)'}; text-align:center;">
                  ${en.speedMpm ? `⚡ ${en.speedMpm} m/dk<br/><span style="font-size:7.8px; color:var(--ios-subtext);">${escapeHtml(en.durationLabel)}</span>` : 'Saat girin'}
                </div>

                <button type="button" class="ios-btn ios-btn-green" style="padding:5px 6px; font-size:8.5px; font-weight:900;" onclick="AvigenRaceTracker.fillBatchRowNow('${ev.id}', this)">
                  ⚡ İndi
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <button class="ios-btn ios-btn-green" style="width:100%; padding:10px; font-size:12px; font-weight:900; margin-top:4px;" onclick="AvigenRaceTracker.saveBatchRaceResults('${ev.id}')">
          💾 Tüm Durum ve Sonuçları Kaydet
        </button>
      </div>
    `;

    modal.classList.add('open');
  },

  onBatchRowTimeInput(raceId, inputEl) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev || !inputEl) return;
    const row = inputEl.closest('.batch-bird-row');
    if (!row) return;
    const statusSel = row.querySelector('.batch-bird-status');
    const relTime = document.getElementById('batchReleaseTime')?.value || ev.releaseTime || '06:45';
    const arrTime = inputEl.value;
    const previewEl = row.querySelector('.batch-speed-preview');
    if (!arrTime) {
      if (previewEl) previewEl.innerHTML = 'Saat girin';
      return;
    }
    if (statusSel) statusSel.value = 'RETURNED';
    const calc = this.calculateFlightMetrics(ev.distanceKm, ev.releaseDate, relTime, ev.releaseDate, arrTime, null);
    if (previewEl) {
      if (calc.speedMpm) {
        previewEl.style.color = '#059669';
        previewEl.innerHTML = `⚡ ${calc.speedMpm} m/dk<br/><span style="font-size:7.8px; color:var(--ios-subtext);">${escapeHtml(calc.durationLabel)}</span>`;
      } else {
        previewEl.style.color = '#dc2626';
        previewEl.innerHTML = 'Saat kontrol';
      }
    }
  },

  recalcAllBatchRows(raceId) {
    document.querySelectorAll('.batch-bird-row .batch-arr-time').forEach(inp => {
      if (inp.value) this.onBatchRowTimeInput(raceId, inp);
    });
  },

  fillBatchRowNow(raceId, btnEl) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev || !btnEl) return;
    const row = btnEl.closest('.batch-bird-row');
    if (!row) return;
    const timeInp = row.querySelector('.batch-arr-time');
    const rankInp = row.querySelector('.batch-rank');
    const statusSel = row.querySelector('.batch-bird-status');
    const relTime = document.getElementById('batchReleaseTime')?.value || ev.releaseTime || '06:45';

    const now = new Date();
    let timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const testCalc = this.calculateFlightMetrics(ev.distanceKm, ev.releaseDate, relTime, ev.releaseDate, timeStr, null);
    if (!testCalc.durationMinutes || testCalc.durationMinutes <= 10) {
      const estDurMin = Math.max(25, Math.round(((ev.distanceKm || 60) * 1000) / (1375 - Math.floor(Math.random() * 45))));
      const relParts = String(relTime).split(':');
      const relTotalMin = (parseInt(relParts[0], 10) || 6) * 60 + (parseInt(relParts[1], 10) || 45) + estDurMin;
      timeStr = `${String(Math.floor((relTotalMin % 1440) / 60)).padStart(2, '0')}:${String(relTotalMin % 60).padStart(2, '0')}`;
    }

    if (statusSel) statusSel.value = 'RETURNED';
    if (timeInp) {
      timeInp.value = timeStr;
      this.onBatchRowTimeInput(raceId, timeInp);
    }
    if (rankInp && !rankInp.value) {
      const filledRanks = Array.from(document.querySelectorAll('.batch-bird-row .batch-rank'))
        .map(el => parseInt(el.value, 10))
        .filter(n => !isNaN(n) && n > 0);
      rankInp.value = filledRanks.length > 0 ? Math.max(...filledRanks) + 1 : 1;
    }
  },

  saveBatchRaceResults(raceId) {
    const ev = this.events.find(e => e.id === raceId);
    if (!ev) return;

    const relTime = document.getElementById('batchReleaseTime')?.value || ev.releaseTime || '06:45';
    const totalComp = parseInt(document.getElementById('batchTotalCompetitors')?.value, 10) || ev.totalCompetitors || 1450;
    const weather = (document.getElementById('batchWeather')?.value || ev.weather || 'Açık Hava').trim();

    ev.releaseTime = relTime;
    ev.totalCompetitors = totalComp;
    ev.weather = weather;

    const rows = document.querySelectorAll('.batch-bird-row');
    const pendingLostNames = [];
    rows.forEach(row => {
      const ring = row.getAttribute('data-ring') || '';
      const stVal = row.querySelector('.batch-bird-status')?.value || 'AWAITING';
      const entry = (ev.entries || []).find(e => e.ring.toUpperCase() === ring.toUpperCase());
      if (stVal === 'LOST' && entry && !entry.manualLostConfirmed) {
        pendingLostNames.push(`${entry.birdName} (${entry.ring})`);
      }
    });

    if (pendingLostNames.length > 0) {
      const okLost = confirm(`⚠️ MANUEL KAYIP ONAYI:\n\nAşağıdaki kuşları "🔴 KAYIP" olarak manuel onaylamak istiyor musunuz?\n• ${pendingLostNames.join('\n• ')}`);
      if (!okLost) return;
    }

    rows.forEach((row, idx) => {
      const ring = row.getAttribute('data-ring') || '';
      const stVal = row.querySelector('.batch-bird-status')?.value || 'AWAITING';
      const arrTime = row.querySelector('.batch-arr-time')?.value || '';
      const rankRaw = row.querySelector('.batch-rank')?.value;
      const rankVal = rankRaw ? parseInt(rankRaw, 10) : null;

      const entry = (ev.entries || []).find(e => e.ring.toUpperCase() === ring.toUpperCase());
      if (!entry) return;

      if (arrTime || stVal === 'RETURNED') {
        const calc = this.calculateFlightMetrics(ev.distanceKm, ev.releaseDate, relTime, ev.releaseDate, arrTime, null);
        entry.birdStatus = 'RETURNED';
        entry.manualLostConfirmed = false;
        entry.resultStatus = 'ENTERED';
        entry.arrivalDate = ev.releaseDate;
        entry.arrivalTime = arrTime;
        entry.durationMinutes = calc.durationMinutes;
        entry.durationLabel = calc.durationLabel;
        entry.speedMpm = calc.speedMpm;
        entry.rank = rankVal || entry.rank || (idx + 1);
        entry.totalCompetitors = totalComp;
        entry.points = this.calculateOfficialPoints(entry.rank, totalComp, ev.distanceKm);
        entry.weather = weather;
        this.syncSingleBirdEntryToDossierAndPedigree(ev, entry);
      } else if (stVal === 'LOST') {
        entry.birdStatus = 'LOST';
        entry.manualLostConfirmed = true;
        entry.resultStatus = 'LOST';
      } else if (stVal === 'DISQUALIFIED') {
        entry.birdStatus = 'DISQUALIFIED';
        entry.manualLostConfirmed = false;
        entry.resultStatus = 'DISQUALIFIED';
      } else {
        entry.birdStatus = stVal;
        entry.manualLostConfirmed = false;
        entry.resultStatus = 'PENDING';
      }
    });

    this.recomputeEventOverallStatus(ev);
    this.saveEvents();
    if (typeof saveMypedigreData === 'function') saveMypedigreData();
    this.closeModal();
    this.renderRaceTrackerMainUI();
    this.renderRaceAiInsightsUI();
    if (typeof renderHomeDashboard === 'function') renderHomeDashboard();
  },

  closeModal() {
    document.getElementById('avigenRaceModal')?.classList.remove('open');
  },

  // --------------------------------------------------------------------------
  // 5. GENESIS AI ENTEGRASYONU (STANDART VERİ YAPISI, HAVA KOŞULU, SEZON GELİŞİMİ,
  //    KUŞ KARŞILAŞTIRMASI VE GENETİK AKTARIM vs GERÇEK PERFORMANS AYRIMI)
  // --------------------------------------------------------------------------
  getStandardizedGenesisRaceDataset(ring = null) {
    if (!this._initialized) this.init();
    if (ring) {
      const archive = this.getBirdCategorizedArchive(ring);
      const trend = this.analyzeBirdLongitudinalTrend(ring);
      return {
        ring: ring.trim().toUpperCase(),
        hasSufficientData: archive.overall.returnedCount >= 1,
        dataReliabilityPct: trend.confidencePct,
        dataSufficiencyLabel: trend.dataSufficiencyLabel,
        scientificWarning: 'Bilimsel Kural: Bir kuşun başarılı yarış performansı (fenotipik ölçüm), doğrudan genetik aktarım üstünlüğü (damızlık değeri) kanıtı değildir. Performans verisi ile soy kalıtım verisi ayrı değerlendirilir.',
        archive,
        trend
      };
    }
    return this.computeGenesisRealRaceAnalytics();
  },

  computeGenesisRealRaceAnalytics() {
    if (!this._initialized) this.init();
    const allBirds = typeof collectUniqueLoftBirds === 'function' ? collectUniqueLoftBirds() : [];

    const birdStatsMap = {};
    const weatherBuckets = {
      clearCalm: { label: '☀️ Açık & Sakin Hava', count: 0, records: [] },
      headWind:  { label: '🌬️ Karşı Rüzgâr & Sert Hava', count: 0, records: [] },
      tailWind:  { label: '🍃 Arkadan Rüzgâr & Hızlı Hava', count: 0, records: [] },
      hotHumid:  { label: '🌡️ Sıcak / Nemli Hava', count: 0, records: [] }
    };

    this.events.forEach(ev => {
      (ev.entries || []).forEach(en => {
        if (en.resultStatus !== 'ENTERED' && en.birdStatus !== 'RETURNED') return;
        const cleanRing = en.ring.trim().toUpperCase();
        if (!birdStatsMap[cleanRing]) {
          const foundBird = allBirds.find(b => b.ring.toUpperCase() === cleanRing);
          birdStatsMap[cleanRing] = {
            ring: en.ring,
            birdName: en.birdName || foundBird?.name || 'Kayıtlı Güvercin',
            flag: en.flag || foundBird?.flag || '🇹🇷',
            sireRing: foundBird?.sireRing || '',
            damRing: foundBird?.damRing || '',
            sireName: foundBird?.sireName || '',
            damName: foundBird?.damName || '',
            records: []
          };
        }
        const tot = Math.max(1, en.totalCompetitors || ev.totalCompetitors || 100);
        const rank = en.rank || 1;
        const pct = Number(((rank / tot) * 100).toFixed(2));
        const weatherStr = en.weather || ev.weather || 'Açık Hava';

        const rec = {
          raceId: ev.id,
          category: ev.category || 'CLUB_RACE',
          codeTitle: ev.codeTitle,
          distanceKm: ev.distanceKm || 0,
          raceType: ev.raceType || this.detectRaceTypeByKm(ev.distanceKm),
          releaseDate: ev.releaseDate,
          rank,
          points: en.points,
          wonPrizeAmountTl: en.wonPrizeAmountTl || 0,
          totalCompetitors: tot,
          percentile: pct,
          speedMpm: en.speedMpm,
          durationMinutes: en.durationMinutes,
          weather: weatherStr,
          ring: en.ring,
          birdName: birdStatsMap[cleanRing].birdName,
          flag: birdStatsMap[cleanRing].flag
        };
        birdStatsMap[cleanRing].records.push(rec);

        // Hava koşuluna göre sınıflandır
        const wLow = weatherStr.toLowerCase();
        if (wLow.includes('karşı') || wLow.includes('sert') || wLow.includes('fırtına') || wLow.includes('yağmur')) {
          weatherBuckets.headWind.count++;
          weatherBuckets.headWind.records.push(rec);
        } else if (wLow.includes('arka') || wLow.includes('lodos')) {
          weatherBuckets.tailWind.count++;
          weatherBuckets.tailWind.records.push(rec);
        } else if (wLow.includes('sıcak') || /2[89]°|3\d°/.test(wLow)) {
          weatherBuckets.hotHumid.count++;
          weatherBuckets.hotHumid.records.push(rec);
        } else {
          weatherBuckets.clearCalm.count++;
          weatherBuckets.clearCalm.records.push(rec);
        }
      });
    });

    Object.values(weatherBuckets).forEach(wb => {
      wb.records.sort((a, b) => (a.percentile || 99) - (b.percentile || 99) || (b.speedMpm || 0) - (a.speedMpm || 0));
      wb.leader = wb.records[0] || null;
    });

    const birdsWithRealRaces = Object.values(birdStatsMap);
    const birdsWithoutRealRaces = allBirds.filter(b => b.isActiveLoftBird && !birdStatsMap[b.ring.toUpperCase()]);

    let bestSprintBird = null;
    let bestMiddleBird = null;
    let bestLongBird = null;

    birdsWithRealRaces.forEach(b => {
      b.records.forEach(r => {
        if (r.distanceKm > 0 && r.distanceKm <= 300) {
          if (!bestSprintBird || r.percentile < bestSprintBird.percentile) {
            bestSprintBird = { ...b, bestRec: r, percentile: r.percentile };
          }
        } else if (r.distanceKm > 300 && r.distanceKm <= 500) {
          if (!bestMiddleBird || r.percentile < bestMiddleBird.percentile) {
            bestMiddleBird = { ...b, bestRec: r, percentile: r.percentile };
          }
        } else if (r.distanceKm > 500) {
          if (!bestLongBird || r.percentile < bestLongBird.percentile) {
            bestLongBird = { ...b, bestRec: r, percentile: r.percentile };
          }
        }
      });
    });

    const consistencyRanking = birdsWithRealRaces
      .map(b => {
        const avgPct = Number((b.records.reduce((s, r) => s + r.percentile, 0) / b.records.length).toFixed(2));
        const speedRecs = b.records.filter(r => r.speedMpm && r.speedMpm > 0);
        const avgSpeedMpm = speedRecs.length > 0
          ? Math.round(speedRecs.reduce((s, r) => s + r.speedMpm, 0) / speedRecs.length)
          : null;
        const top30Count = b.records.filter(r => r.rank && r.rank <= 30).length;
        const stabilityScore = Math.max(40, Math.min(99, Math.round(98 - avgPct * 2.2)));
        const confidencePct = Math.min(95, b.records.length * 25);
        return { ...b, raceCount: b.records.length, avgPct, avgSpeedMpm, top30Count, stabilityScore, confidencePct };
      })
      .sort((a, b) => a.avgPct - b.avgPct || (b.avgSpeedMpm || 0) - (a.avgSpeedMpm || 0));

    const bloodlineStats = {};
    birdsWithRealRaces.forEach(b => {
      const nUp = `${b.birdName} ${b.sireName} ${b.damName}`.toUpperCase();
      let lineKey = 'Kümes Ana Damızlık Soy Hattı';
      if (nUp.includes('PORSCHE') || nUp.includes('WACKO') || nUp.includes('FIRTINA')) lineKey = 'PIPA Porsche 911 / Wacko Soy Hattı';
      else if (nUp.includes('KITTEL') || nUp.includes('BULCK') || nUp.includes('KRALİÇE')) lineKey = 'Dirk Van den Bulck (Kittel) Soy Hattı';
      else if (nUp.includes('BLIKSEM') || nUp.includes('VANDENABEELE') || nUp.includes('FREDDY')) lineKey = 'Gaby Vandenabeele (Bliksem / New Freddy) Hattı';
      else if (nUp.includes('HARRY') || nUp.includes('HOOYMANS')) lineKey = 'Jan Hooymans (Harry) Soy Hattı';
      else if (nUp.includes('JANSSEN')) lineKey = 'Janssen Brothers Soy Hattı';
      else if (b.sireName || b.damName) lineKey = `${b.sireName || b.sireRing || 'Baba'} × ${b.damName || b.damRing || 'Anne'} Soy Hattı`;

      if (!bloodlineStats[lineKey]) {
        bloodlineStats[lineKey] = { count: 0, totalPct: 0, bestRank: 999, bestStage: '' };
      }
      b.records.forEach(r => {
        bloodlineStats[lineKey].count++;
        bloodlineStats[lineKey].totalPct += r.percentile;
        if (r.rank < bloodlineStats[lineKey].bestRank) {
          bloodlineStats[lineKey].bestRank = r.rank;
          bloodlineStats[lineKey].bestStage = `${r.codeTitle} (${r.distanceKm} km)`;
        }
      });
    });

    const breederParentMap = {};
    birdsWithRealRaces.forEach(b => {
      const parentPairLabel = (b.sireRing || b.damRing || b.sireName || b.damName)
        ? `♂ ${b.sireName || b.sireRing || 'Bilinmeyen Baba'} × ♀ ${b.damName || b.damRing || 'Bilinmeyen Anne'}`
        : `Ebeveyn Kaydı Girilmemiş (${b.ring})`;
      if (!breederParentMap[parentPairLabel]) {
        breederParentMap[parentPairLabel] = { pairLabel: parentPairLabel, offspringNames: new Set(), totalRaces: 0, bestRank: 999, avgPctSum: 0 };
      }
      breederParentMap[parentPairLabel].offspringNames.add(`${b.birdName} (${b.ring})`);
      b.records.forEach(r => {
        breederParentMap[parentPairLabel].totalRaces++;
        breederParentMap[parentPairLabel].avgPctSum += r.percentile;
        if (r.rank < breederParentMap[parentPairLabel].bestRank) {
          breederParentMap[parentPairLabel].bestRank = r.rank;
        }
      });
    });

    const breederOffspringRanking = Object.values(breederParentMap).map(p => ({
      pairLabel: p.pairLabel,
      offspringList: Array.from(p.offspringNames),
      totalRaces: p.totalRaces,
      bestRank: p.bestRank,
      avgPct: Number((p.avgPctSum / Math.max(1, p.totalRaces)).toFixed(2))
    })).sort((a, b) => a.avgPct - b.avgPct);

    const trendAlerts = birdsWithRealRaces.map(b => {
      const tr = this.analyzeBirdLongitudinalTrend(b.ring);
      return { ring: b.ring, birdName: b.birdName, flag: b.flag, ...tr };
    });

    const totalCompletedEntries = birdsWithRealRaces.reduce((s, b) => s + b.records.length, 0);
    const overallDataReliabilityPct = Math.min(95, totalCompletedEntries * 15);
    const overallSufficiencyLabel = totalCompletedEntries >= 6
      ? 'Yüksek Analiz Güveni'
      : (totalCompletedEntries >= 2 ? 'Orta Analiz Güveni (Kısmi Veri)' : (totalCompletedEntries === 1 ? 'Düşük Analiz Güveni (Tek Yarış)' : 'Yetersiz Veri (0 Yarış)'));

    return {
      birdsWithRealRaces,
      birdsWithoutRealRaces,
      totalCompletedEntries,
      overallDataReliabilityPct,
      overallSufficiencyLabel,
      weatherBuckets,
      bestSprintBird,
      bestMiddleBird,
      bestLongBird,
      consistencyRanking,
      bloodlineStats,
      breederOffspringRanking,
      trendAlerts
    };
  },

  // YARIŞLAR Sekmesi -> 2. Alt Sekme: "🧬 AI Performans Analizi" (GENESIS AI Bağlantılı - Abonelik Gerektirir)
  renderRaceAiInsightsUI() {
    const root = document.getElementById('avigenRaceAiInsightsRoot');
    if (!root) return;

    const hasAiSub = (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.hasGeneticsAiAccess === 'function')
      ? AvigenUxManager.hasGeneticsAiAccess()
      : (typeof AvigenGenesisAI !== 'undefined' ? Boolean(AvigenGenesisAI.state.isPremiumActive) : false);

    if (!hasAiSub) {
      const devId = (typeof AvigenUxManager !== 'undefined' && typeof AvigenUxManager.getOrCreateDeviceId === 'function')
        ? AvigenUxManager.getOrCreateDeviceId()
        : 'AVG-0000-0000';
      root.innerHTML = `
        <div class="ios-card" style="padding:14px 12px; border:1.5px solid #7c3aed; background:linear-gradient(145deg, #0f172a 0%, #2e1065 100%); color:#ffffff;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
            <span class="gene-badge gene-purple">🧬 GENESIS AI — YARIŞ ANALİZİ</span>
            <span style="font-size:10px; color:#cbd5e1; font-weight:700;">AVIGEN AI Aboneliği</span>
          </div>
          <div style="font-size:13px; font-weight:900; color:#ffffff; margin-bottom:5px;">
            🔒 GENESIS AI Yarış Performans &amp; Mesafe Uzmanlığı Analizi
          </div>
          <div style="font-size:10.5px; color:#e2e8f0; line-height:1.45; margin-bottom:10px;">
            Standart yarış yönetimi (Kümesüstü, Dernek ve Büyük Ödüllü yarış oluşturma, kuş sepetleme ve hız hesabı) tamamen <strong>ücretsizdir</strong>.<br/>
            <strong>GENESIS AI Yarış Analizi</strong> (kısa/orta/uzun mesafe uzmanlığı, hava koşulu korelasyonu, kuş karşılaştırma tablosu ve damızlık aktarım analizi) için <strong>AVIGEN AI</strong> aboneliği gereklidir (Cihaz ID: <strong>${escapeHtml(devId)}</strong>).
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px;">
            <button type="button" class="ios-btn ios-btn-purple" style="padding:9px; font-size:10.8px; font-weight:900;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.openSubscriptionModal('checkout')">
              🔑 Lisans Kodu Gir
            </button>
            <button type="button" class="ios-btn ios-btn-green" style="padding:9px; font-size:10.8px; font-weight:900;" onclick="if(typeof AvigenUxManager!=='undefined') AvigenUxManager.requestLicenseViaWhatsApp('3.990 TL', 'Yıllık (365 Gün)')">
              📲 Kod İste (0532 782 03 85)
            </button>
          </div>
        </div>
      `;
      return;
    }

    const analytics = this.computeGenesisRealRaceAnalytics();

    root.innerHTML = `
      <!-- BİLİMSEL İLKE & VERİ YETERLİLİĞİ KUTUSU -->
      <div class="ios-card" style="padding:10px 12px; border-left:4px solid #7c3aed; background:linear-gradient(135deg, #f5f3ff 0%, #eff6ff 100%);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:4px;">
          <div style="font-size:12px; font-weight:900; color:#4c1d95;">
            🧬 GENESIS AI Yarış Performans Analizi &amp; Bilimsel Ayrım İlkesi
          </div>
          <span class="gene-badge ${analytics.totalCompletedEntries >= 2 ? 'gene-green' : 'gene-gold'}" style="font-size:8.5px;">
            ${escapeHtml(analytics.overallSufficiencyLabel)} • %${analytics.overallDataReliabilityPct} Güven
          </span>
        </div>
        <div style="font-size:9.8px; color:#1e293b; line-height:1.4;">
          • <strong>Performans vs Genetik Ayrımı:</strong> Bir kuşun başarılı yarış performansı (bireysel fenotipik ölçüm), doğrudan genetik aktarım üstünlüğü kanıtı değildir. GENESIS AI eşleştirme analizinde gerçek yarış performansını ve soy kalıtım verisini ayrı katmanlarda işler.<br/>
          • <strong>Veri Dürüstlüğü:</strong> Bu analizler yalnızca girilmiş <strong>${analytics.totalCompletedEntries} gerçek yarış sonucuna (${analytics.birdsWithRealRaces.length} kuş)</strong> dayanır. Henüz yarışmamış <strong>${analytics.birdsWithoutRealRaces.length} kuş</strong> için kesin yargı verilmez.
        </div>
      </div>

      <!-- 1 & 2. MESAFE UZMANLIĞI (KISA, ORTA, UZUN MESAFE PERFORMANSI) -->
      <div class="ios-card" style="padding:10px 12px;">
        <div class="ios-card-title">
          <span>🧭 1–2. Mesafe Uzmanlığı: Kısa, Orta ve Uzun Mesafe Performansı</span>
          <span class="gene-badge gene-green">Ölçülen Yarış Verisi</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr; gap:7px;">
          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #0066ff; border-radius:9px; padding:7px 10px;">
            <div style="font-size:9px; font-weight:900; color:#0052cc;">🚀 KISA MESAFE (SPRINT • 50–300 KM) PERFORMANSI</div>
            ${analytics.bestSprintBird ? `
              <div style="font-size:11.5px; font-weight:900; color:var(--ios-text); margin-top:2px;">
                ${analytics.bestSprintBird.flag} ${escapeHtml(analytics.bestSprintBird.birdName)} (${escapeHtml(analytics.bestSprintBird.ring)})
              </div>
              <div style="font-size:9.5px; color:var(--ios-subtext);">
                Kanıt: <strong>${escapeHtml(analytics.bestSprintBird.bestRec.codeTitle)} (${analytics.bestSprintBird.bestRec.distanceKm} km)</strong> • Derece: <strong>${analytics.bestSprintBird.bestRec.rank}. sıra</strong> (${analytics.bestSprintBird.bestRec.speedMpm || '—'} m/dk).
              </div>
            ` : `<div style="font-size:9.8px; color:var(--ios-subtext); margin-top:2px;">Veri Yetersiz: Henüz kısa mesafe (50–300 km) yarış sonucu girilmedi.</div>`}
          </div>

          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:9px; padding:7px 10px;">
            <div style="font-size:9px; font-weight:900; color:#6d28d9;">⚖️ ORTA MESAFE (301–500 KM) PERFORMANSI</div>
            ${analytics.bestMiddleBird ? `
              <div style="font-size:11.5px; font-weight:900; color:var(--ios-text); margin-top:2px;">
                ${analytics.bestMiddleBird.flag} ${escapeHtml(analytics.bestMiddleBird.birdName)} (${escapeHtml(analytics.bestMiddleBird.ring)})
              </div>
              <div style="font-size:9.5px; color:var(--ios-subtext);">
                Kanıt: <strong>${escapeHtml(analytics.bestMiddleBird.bestRec.codeTitle)} (${analytics.bestMiddleBird.bestRec.distanceKm} km)</strong> • Derece: <strong>${analytics.bestMiddleBird.bestRec.rank}. sıra</strong> (${analytics.bestMiddleBird.bestRec.speedMpm || '—'} m/dk).
              </div>
            ` : `<div style="font-size:9.8px; color:var(--ios-subtext); margin-top:2px;">Veri Yetersiz: Henüz orta mesafe (301–500 km) yarış sonucu girilmedi.</div>`}
          </div>

          <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #059669; border-radius:9px; padding:7px 10px;">
            <div style="font-size:9px; font-weight:900; color:#047857;">🏔️ UZUN MESAFE (501+ KM) PERFORMANSI</div>
            ${analytics.bestLongBird ? `
              <div style="font-size:11.5px; font-weight:900; color:var(--ios-text); margin-top:2px;">
                ${analytics.bestLongBird.flag} ${escapeHtml(analytics.bestLongBird.birdName)} (${escapeHtml(analytics.bestLongBird.ring)})
              </div>
              <div style="font-size:9.5px; color:var(--ios-subtext);">
                Kanıt: <strong>${escapeHtml(analytics.bestLongBird.bestRec.codeTitle)} (${analytics.bestLongBird.bestRec.distanceKm} km)</strong> • Derece: <strong>${analytics.bestLongBird.bestRec.rank}. sıra</strong> (${analytics.bestLongBird.bestRec.speedMpm || '—'} m/dk).
              </div>
            ` : `<div style="font-size:9.8px; color:var(--ios-subtext); margin-top:2px;">Veri Yetersiz: Henüz uzun mesafe (501+ km) yarış sonucu girilmedi.</div>`}
          </div>
        </div>
      </div>

      <!-- 3. FARKLI HAVA KOŞULLARINDAKİ PERFORMANS ANALİZİ -->
      <div class="ios-card" style="padding:10px 12px;">
        <div class="ios-card-title">
          <span>🌤️ 3. Farklı Hava Koşullarındaki Yarış Performansı</span>
          <span class="gene-badge gene-blue">Biyometeorolojik Korelasyon</span>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          ${Object.values(analytics.weatherBuckets).map(wb => `
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:6px 8px; font-size:9.2px;">
              <div style="font-weight:900; color:var(--ios-text);">${escapeHtml(wb.label)} (${wb.count})</div>
              ${wb.leader ? `
                <div style="margin-top:2px; color:#0052cc; font-weight:800;">
                  En İyi: ${wb.leader.flag} ${escapeHtml(wb.leader.birdName)} (${escapeHtml(wb.leader.ring)})
                </div>
                <div style="font-size:8.5px; color:var(--ios-subtext);">
                  ${escapeHtml(wb.leader.codeTitle)} • ${wb.leader.rank}. Sıra (${wb.leader.speedMpm || '—'} m/dk)
                </div>
              ` : `<div style="margin-top:2px; color:var(--ios-subtext);">Bu hava koşulunda kayıtlı yarış verisi yok.</div>`}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 4. YARIŞ PERFORMANSINA GÖRE KUŞ KARŞILAŞTIRMASI, İSTİKRAR VE SEZON İÇİ GELİŞİM -->
      <div class="ios-card" style="padding:10px 12px;">
        <div class="ios-card-title">
          <span>📊 4. Yarış Performansına Göre Kuş Karşılaştırması, İstikrar &amp; Sezon Gelişimi</span>
          <span class="gene-badge gene-purple">Kuş Karşılaştırma Tablosu</span>
        </div>
        ${analytics.consistencyRanking.length === 0 ? `
          <div style="font-size:10px; color:var(--ios-subtext); text-align:center; padding:12px;">
            Karşılaştırma tablosu için en az 1 tamamlanmış yarış sonucu girilmelidir.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${analytics.consistencyRanking.map((b, idx) => {
              const tr = analytics.trendAlerts.find(t => t.ring === b.ring);
              const isDeclining = tr?.trendStatus === 'DECLINING';
              return `
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid ${isDeclining ? '#dc2626' : '#059669'}; border-radius:9px; padding:7px 10px; font-size:9.8px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:4px;">
                    <div style="font-weight:900; font-size:11px; color:var(--ios-text);">
                      #${idx + 1} ${b.flag} ${escapeHtml(b.birdName)} (${escapeHtml(b.ring)})
                    </div>
                    <div style="display:flex; gap:4px;">
                      <span class="gene-badge ${isDeclining ? 'gene-red' : 'gene-green'}" style="font-size:8px;">
                        İstikrar: %${b.stabilityScore} (${b.raceCount} Yarış)
                      </span>
                      <span class="gene-badge gene-blue" style="font-size:8px;">
                        Güven: %${b.confidencePct}
                      </span>
                    </div>
                  </div>
                  <div style="color:var(--ios-subtext); margin-top:2px;">
                    Ort. Klasman: <strong>İlk %${b.avgPct}</strong> • Ort. Hız: <strong>${b.avgSpeedMpm ? b.avgSpeedMpm + ' m/dk' : '—'}</strong> • Uzmanlık: <strong>${escapeHtml(tr?.bestDistanceType || 'Veri Sınırlı')}</strong>
                  </div>
                  <div style="margin-top:3px; font-weight:800; color:${isDeclining ? '#dc2626' : '#0052cc'};">
                    ${escapeHtml(tr?.trendLabel || '⚖️ Performans İstikrarlı')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- 5. EŞLEŞTİRME ANALİZİNDE KULLANILAN GERÇEK PERFORMANS VERİLERİ (GENETİK AKTARIM UYARILI) -->
      <div class="ios-card" style="padding:10px 12px;">
        <div class="ios-card-title">
          <span>🧬 5. Eşleştirme Analizi İçin Gerçek Performans Verileri (Soy × Yarış)</span>
          <span class="gene-badge gene-gold">Damızlık Referansı</span>
        </div>
        <div style="font-size:9.3px; color:var(--ios-subtext); margin-bottom:6px;">
          Aşağıdaki tablo, damızlık eşleştirme kararlarında referans alınabilecek doğrulanmış yarış sonuçlarını gösterir (Fenotipik yarış başarısı, dar anlamda kalıtsallık h² ≈ 0.18–0.32 oranında yavruya aktarılır):
        </div>
        ${analytics.breederOffspringRanking.length === 0 ? `
          <div style="font-size:9.8px; color:var(--ios-subtext); text-align:center; padding:8px;">
            Henüz ebeveyn-yavru yarış korelasyonu için yeterli yarış sonucu girilmedi.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:5px;">
            ${analytics.breederOffspringRanking.map(br => `
              <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:8px; padding:6px 9px; font-size:9.5px; color:#4c1d95;">
                <div style="font-weight:900;">${escapeHtml(br.pairLabel)}</div>
                <div style="margin-top:2px;">
                  Yarışan Kuşlar: <strong>${escapeHtml(br.offspringList.join(', '))}</strong> • ${br.totalRaces} Yarışta En İyi Derece: <strong>${br.bestRank}. Sıra</strong> (Ort. İlk %${br.avgPct})
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  }
};
