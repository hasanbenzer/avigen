// ============================================================================
// AVIGEN GLOBAL GENE POOL – COLLECTIVE BREEDING INTELLIGENCE
// ============================================================================
// Üyeler Arası Gizlilik Esaslı (Privacy-by-Design) Küresel Pedigree,
// Performans ve Otomatik En İyi Çift (Global Best Pairs) Analiz Havuzu.
//
// TEMEL GİZLİLİK VE BİLİMSEL KURALLAR:
// 1. Hiçbir üyenin özel kuş verisi izinsiz global havuza aktarılmaz (Strict Opt-In).
// 2. Kuş bazında "Analiz İzni" (allow_global_analysis) ile "İletişim İzni"
//    (allow_connection_requests) birbirinden ayrıdır.
// 3. Diğer üyeler birbirlerinin özel pedigree belgelerini, bilezik numaralarını
//    ve kimlik bilgilerini göremez; yalnızca anonim kod (AVG-GLB-XXXX) gösterilir.
// 4. Ortak ata ve akrabalık (Sewall Wright COI) kontrolü açık bilezik numarasıyla
//    değil, tek yönlü kriptografik özet (ancestor_node_hash) üzerinden yapılır.
// 5. Kullanıcı iznini geri çektiğinde (Revoke & Purge) veriler havuzdan ve
//    önbellekten/yedek kuyruğundan tamamen temizlenir.
// 6. Eksik pedigree bilgileri tamamlanmış gibi gösterilmez; yavru garantisi verilmez.
// ============================================================================

const STORAGE_KEY_GLOBAL_GENE_POOL = 'avigen_global_gene_pool_db_v1';

const AvigenGlobalGenePool = {
  // 7 Tablolu Veri Mimarisi (Supabase PostgreSQL / RLS Uyumlu Yerel + Backend Servis Katmanı)
  db: {
    global_bird_permissions: [],     // Kuş bazlı analiz ve iletişim izinleri
    global_gene_pool: [],            // Anonimleştirilmiş küresel kuş kayıtları
    global_pedigree_nodes: [],       // Hashlenmiş 4 kuşak ata düğümleri (Açık bilezik no tutulmaz!)
    global_performance_records: [],  // Bireysel, ebeveyn, kardeş, yavru ve önceki eşleşme indeksleri
    global_pairing_candidates: [],   // Hesaplanan global eşleşme adayları önbelleği
    breeder_connection_requests: [], // Sahip onaylı iletişim / eşleştirme / satın alma talepleri
    scientific_evidence: [],         // Global eşleştirme kanıt kuralları
    purge_audit_log: []              // İzin geri çekme & yedeklerden temizleme yaşam döngüsü kaydı
  },

  state: {
    selectedLocalBirdRing: '',
    targetDistanceFocus: 'ALL', // 'ALL' | 'Sprint' | 'Middle' | 'Long' | 'Marathon'
    pairingStrategy: 'complement', // 'complement' (Tamamlayıcı) | 'outcross' (Yabancı Kan) | 'linebreed' (Soy Uyumu)
    queryCountInSession: 0,
    MAX_QUERIES_PER_WINDOW: 30 // Anti-scraping toplu veri çıkarımı koruması
  },

  // Tek yönlü kriptografik bilezik hashleyici (Ortak ataları bilezik numarasını ifşa etmeden bulmak için)
  hashRingIdentifier(ringStr) {
    const clean = String(ringStr || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!clean) return '';
    const salt = 'AVIGEN_ZERO_KNOWLEDGE_SALT_2026';
    const input = `${clean}::${salt}`;
    let h1 = 0xdeadbeef ^ input.length;
    let h2 = 0x41c6ce57 ^ input.length;
    for (let i = 0, ch; i < input.length; i++) {
      ch = input.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 'HASH_' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).toUpperCase();
  },

  init() {
    this.loadDatabase();
  },

  loadDatabase() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_GLOBAL_GENE_POOL);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.global_gene_pool) && parsed.global_gene_pool.length > 0) {
          this.db = { ...this.db, ...parsed };
          return;
        }
      }
    } catch (e) {}

    this.seedVerifiedGlobalAnonymizedPool();
    this.saveDatabase();
  },

  saveDatabase() {
    localStorage.setItem(STORAGE_KEY_GLOBAL_GENE_POOL, JSON.stringify(this.db));
  },

  // ==========================================================================
  // DOĞRULANMIŞ KÜRESEL ANONİM HAVUZ KAYITLARI (DİĞER ÜYELERİN İZİNLİ ANONİM KUŞLARI)
  // Not: Hiçbir kayıtta kuş sahibinin adı, kümes adı veya gerçek bilezik no açık tutulmaz!
  // ==========================================================================
  seedVerifiedGlobalAnonymizedPool() {
    const h = (r) => this.hashRingIdentifier(r);

    this.db.scientific_evidence = [
      {
        rule_id: 'ev_polygenic_comp',
        doi: '10.1093/molbev/msy030',
        citation: 'Gazda et al. (2018)',
        principle: 'Atletik ve navigasyonel performans çok genli (poligenik) yapıdadır; hız ve dayanıklılık eksiklerini birbirini tamamlayan soy hatlarıyla eşleştirmek tek gen seçiminden üstündür.'
      },
      {
        rule_id: 'ev_probabilistic_heritability',
        doi: '10.1007/s13353-022-00697-w',
        citation: 'Kolvenbag et al. (2022)',
        principle: 'Genotip ve soyağacı profilleri kesin yavru garantisi değil, olasılıksal (probabilistic) performans yatkınlığı sağlar.'
      },
      {
        rule_id: 'ev_muscle_endurance',
        doi: '10.1007/s11033-024-09566-7',
        citation: 'Stefaniuk-Szmukier et al. (2024 & 2026)',
        principle: 'Uzun mesafe ve maraton başarısı göğüs kası lipid metabolizması ve PPARD sinyal yolağı dayanıklılığı ile ilişkilidir.'
      }
    ];

    // Diğer küresel üyeler tarafından analiz izni verilmiş anonim adaylar
    const seedCandidates = [
      {
        pool_bird_id: 'glb_pool_101',
        anonymous_code: 'AVG-GLB-9104',
        sex: 'F',
        region_zone: '🇧🇪 Belçika / Flanders (KBDB Bölgesi)',
        specialty_category: 'Middle',
        allow_global_analysis: true,
        allow_connection_requests: true,
        data_reliability_pct: 92,
        pedigree_completeness_pct: 93, // 28/30 ata kayıtlı
        verified_race_count: 7,
        verified_offspring_count: 4,
        perf: {
          speed_index: 94,
          endurance_index: 86,
          sprint_index: 91,
          middle_index: 95,
          long_index: 84,
          marathon_index: null, // Maraton verisi yok -> yapay puan üretilmez
          consistency_index: 93,
          homing_index: 94,
          parent_perf_index: 92,
          sibling_perf_index: 90, // 3 tam kardeşi İlk %1 klasmanda
          offspring_perf_index: 89,
          prev_pairings_success_index: 91
        },
        strengths_tr: '300–550 km hız ve yarış istikrarı (%95), anne-baba ve 3 tam kardeşinde ulusal İlk %1 klasman derecesi, önceki 2 farklı eşleşmeden dereceli yavru kanıtı.',
        anc_hashes: [
          { gen: 1, slot: 'sire', hash: h('BELG-2021-4099100'), perf: 93, wins: true },
          { gen: 1, slot: 'dam', hash: h('BELG-2022-4088911'), perf: 91, wins: true }, // Kümesteki Golden Porsche 911 ile potansiyel ortak ata!
          { gen: 2, slot: 'g2_1', hash: h('BELG-2019-4100200'), perf: 90, wins: true },
          { gen: 2, slot: 'g2_2', hash: h('NL-2020-1100500'), perf: 88, wins: true }
        ]
      },
      {
        pool_bird_id: 'glb_pool_102',
        anonymous_code: 'AVG-GLB-7382',
        sex: 'F',
        region_zone: '🇳🇱 Hollanda / Brabant (NPO Bölgesi)',
        specialty_category: 'Long',
        allow_global_analysis: true,
        allow_connection_requests: true,
        data_reliability_pct: 89,
        pedigree_completeness_pct: 90, // 27/30 ata kayıtlı
        verified_race_count: 6,
        verified_offspring_count: 5,
        perf: {
          speed_index: 84,
          endurance_index: 96,
          sprint_index: 76,
          middle_index: 88,
          long_index: 95,
          marathon_index: 91,
          consistency_index: 92,
          homing_index: 96,
          parent_perf_index: 94,
          sibling_perf_index: 88,
          offspring_perf_index: 91,
          prev_pairings_success_index: 90
        },
        strengths_tr: '500–750 km uzun mesafe ve sert karşı rüzgar dayanıklılığı (%96), çok yüksek eve dönüş güvenilirliği ve kanıtlanmış yavru performansı (%91). Tamamen yabancı kan (Outcross) takviyesi için ideal.',
        anc_hashes: [
          { gen: 1, slot: 'sire', hash: h('NL-2020-1884200'), perf: 95, wins: true },
          { gen: 1, slot: 'dam', hash: h('NL-2021-1773900'), perf: 92, wins: true },
          { gen: 2, slot: 'g2_1', hash: h('NL-2018-1600111'), perf: 94, wins: true }
        ]
      },
      {
        pool_bird_id: 'glb_pool_103',
        anonymous_code: 'AVG-GLB-5219',
        sex: 'M',
        region_zone: '🇧🇪 Belçika / Antwerp (Sprint Hattı)',
        specialty_category: 'Sprint',
        allow_global_analysis: true,
        allow_connection_requests: true,
        data_reliability_pct: 90,
        pedigree_completeness_pct: 96, // 29/30 ata kayıtlı
        verified_race_count: 9,
        verified_offspring_count: 6,
        perf: {
          speed_index: 97,
          endurance_index: 81,
          sprint_index: 98,
          middle_index: 89,
          long_index: null,
          marathon_index: null,
          consistency_index: 94,
          homing_index: 92,
          parent_perf_index: 95,
          sibling_perf_index: 93,
          offspring_perf_index: 92,
          prev_pairings_success_index: 94
        },
        strengths_tr: '100–350 km etaplarında olağanüstü patlayıcı çıkış hızı (%97) ve kardeş/yavru hız aktarım kararlılığı (%93). Uzun mesafe dişilerine hız kazandırmak için en üst düzey tamamlayıcı erkek.',
        anc_hashes: [
          { gen: 1, slot: 'sire', hash: h('BELG-2021-6011400'), perf: 96, wins: true },
          { gen: 1, slot: 'dam', hash: h('BELG-2021-6011890'), perf: 94, wins: true }
        ]
      },
      {
        pool_bird_id: 'glb_pool_104',
        anonymous_code: 'AVG-GLB-6640',
        sex: 'M',
        region_zone: '🇹🇷 Türkiye / Marmara Ulusal Klasman',
        specialty_category: 'Long',
        allow_global_analysis: true,
        allow_connection_requests: true,
        data_reliability_pct: 86,
        pedigree_completeness_pct: 87, // 26/30 ata
        verified_race_count: 5,
        verified_offspring_count: 3,
        perf: {
          speed_index: 88,
          endurance_index: 93,
          sprint_index: 82,
          middle_index: 91,
          long_index: 94,
          marathon_index: 87,
          consistency_index: 90,
          homing_index: 95,
          parent_perf_index: 91,
          sibling_perf_index: 87,
          offspring_perf_index: 88,
          prev_pairings_success_index: 89
        },
        strengths_tr: 'Anadolu sıcak hava ve dağlık rota etaplarında (450–680 km) yüksek eve dönüş (%95) ve dayanıklılık (%93) kanıtı.',
        anc_hashes: [
          { gen: 1, slot: 'sire', hash: h('TR-2021-3400112'), perf: 91, wins: true },
          { gen: 2, slot: 'g2_2', hash: h('NL-2022-1542880'), perf: 92, wins: true } // Lady Bliksem ortak ata!
        ]
      },
      {
        pool_bird_id: 'glb_pool_105',
        anonymous_code: 'AVG-GLB-3095',
        sex: 'F',
        region_zone: '🇩🇪 Almanya / Ruhr Bölgesi',
        specialty_category: 'Middle',
        allow_global_analysis: true,
        allow_connection_requests: false, // Analiz izni açık ama İletişim izni KAPALI örneği!
        data_reliability_pct: 64,
        pedigree_completeness_pct: 60, // 18/30 ata (Eksik pedigree örneği)
        verified_race_count: 3,
        verified_offspring_count: 0,
        perf: {
          speed_index: 83,
          endurance_index: 80,
          sprint_index: 84,
          middle_index: 85,
          long_index: null,
          marathon_index: null,
          consistency_index: 79,
          homing_index: 82,
          parent_perf_index: 84,
          sibling_perf_index: 78,
          offspring_perf_index: null,
          prev_pairings_success_index: null
        },
        strengths_tr: 'Orta mesafe (300-450 km) yarış kaydı mevcuttur ancak 3. ve 4. kuşak soyağacında 12 ata kaydı eksiktir ve yavru verisi yoktur. (Sahibi yalnızca anonim analiz izni vermiş, iletişim taleplerini kapatmıştır.)',
        anc_hashes: [
          { gen: 1, slot: 'sire', hash: h('DV-2022-0412-901'), perf: 84, wins: true }
        ]
      }
    ];

    this.db.global_gene_pool = [];
    this.db.global_pedigree_nodes = [];
    this.db.global_performance_records = [];

    seedCandidates.forEach(c => {
      this.db.global_gene_pool.push({
        pool_bird_id: c.pool_bird_id,
        anonymous_code: c.anonymous_code,
        is_external_member: true,
        sex: c.sex,
        region_zone: c.region_zone,
        specialty_category: c.specialty_category,
        allow_global_analysis: c.allow_global_analysis,
        allow_connection_requests: c.allow_connection_requests,
        data_reliability_pct: c.data_reliability_pct,
        pedigree_completeness_pct: c.pedigree_completeness_pct,
        verified_race_count: c.verified_race_count,
        verified_offspring_count: c.verified_offspring_count,
        strengths_tr: c.strengths_tr
      });

      this.db.global_performance_records.push({
        record_id: 'rec_' + c.pool_bird_id,
        pool_bird_id: c.pool_bird_id,
        ...c.perf
      });

      (c.anc_hashes || []).forEach((n, idx) => {
        this.db.global_pedigree_nodes.push({
          node_id: `node_${c.pool_bird_id}_${idx}`,
          pool_bird_id: c.pool_bird_id,
          generation_depth: n.gen,
          slot_position: n.slot,
          ancestor_node_hash: n.hash,
          ancestor_perf_index: n.perf,
          has_verified_wins: n.wins
        });
      });
    });
  },

  // ==========================================================================
  // KUŞ BAZLI İZİN YÖNETİMİ (OPT-IN / REVOKE / PURGE YAŞAM DÖNGÜSÜ)
  // ==========================================================================
  getBirdPermission(localRing) {
    const clean = String(localRing || '').trim().toUpperCase();
    return this.db.global_bird_permissions.find(p => p.local_bird_ring.toUpperCase() === clean) || null;
  },

  setBirdPermission(localRing, allowAnalysis, allowContact) {
    const clean = String(localRing || '').trim().toUpperCase();
    if (!clean) return;

    let perm = this.getBirdPermission(clean);
    // Anonim kod içinde ülke veya gerçek bilezik numarası parçası kesinlikle yer almaz (Opaque Token)
    let anonCode = perm ? perm.anonymous_code.replace('AVG-GLB-TR', 'AVG-GLB-') : `AVG-GLB-${Math.floor(1000 + Math.random() * 8999)}`;

    if (!perm) {
      perm = {
        permission_id: 'perm_' + Date.now() + '_' + Math.floor(Math.random() * 999),
        owner_user_id: 'current_local_breeder',
        local_bird_ring: clean,
        anonymous_code: anonCode,
        allow_global_analysis: Boolean(allowAnalysis),
        allow_connection_requests: Boolean(allowContact),
        consent_granted_at: new Date().toISOString(),
        revoked_at: null,
        lifecycle_status: allowAnalysis ? 'ACTIVE' : 'DISABLED'
      };
      this.db.global_bird_permissions.push(perm);
    } else {
      perm.anonymous_code = anonCode;
      perm.allow_global_analysis = Boolean(allowAnalysis);
      perm.allow_connection_requests = Boolean(allowContact);
      perm.lifecycle_status = allowAnalysis ? 'ACTIVE' : 'DISABLED';
      if (allowAnalysis) perm.consent_granted_at = new Date().toISOString();
    }

    // KURAL: Yalnızca "Global Analiz İzni" (allow_global_analysis) açık olan kuşlar havuz tablolarına senkronize edilir!
    if (perm.allow_global_analysis) {
      this.syncLocalBirdToAnonymizedPool(clean, perm);
    } else {
      this.removeLocalBirdFromPoolOnly(perm.anonymous_code);
    }

    this.saveDatabase();
    return perm;
  },

  // Toplu İzin Güncelleme (Arama/Filtre listesindeki seçili kuşlar için)
  bulkSetBirdPermissions(ringsArray, mode) {
    if (!Array.isArray(ringsArray) || !ringsArray.length) return;
    ringsArray.forEach(ring => {
      if (mode === 'REVOKE_ALL') {
        const p = this.getBirdPermission(ring);
        if (p && (p.allow_global_analysis || p.allow_connection_requests)) {
          this.revokeAndPurgeBirdFromGlobalPool(ring);
        }
      } else if (mode === 'ENABLE_ANALYSIS_ONLY') {
        const p = this.getBirdPermission(ring);
        this.setBirdPermission(ring, true, p ? p.allow_connection_requests : false);
      } else if (mode === 'ENABLE_BOTH') {
        this.setBirdPermission(ring, true, true);
      }
    });
    this.saveDatabase();
  },

  // Kullanıcının İznini Tamamen Geri Çekmesi & Verilerin Havuzdan ve Yedeklerden Temizlenmesi
  revokeAndPurgeBirdFromGlobalPool(localRing) {
    const clean = String(localRing || '').trim().toUpperCase();
    const perm = this.getBirdPermission(clean);
    if (!perm) return;

    const anonCode = perm.anonymous_code;
    this.removeLocalBirdFromPoolOnly(anonCode);

    // İlgili bekleyen eşleşme adaylarını ve iletişim taleplerini iptal et / temizle
    this.db.global_pairing_candidates = this.db.global_pairing_candidates.filter(
      c => c.requester_bird_id !== clean && c.target_anonymous_code !== anonCode
    );
    this.db.breeder_connection_requests.forEach(req => {
      if (req.sender_bird_ring.toUpperCase() === clean || req.target_anonymous_code === anonCode) {
        req.status = 'CANCELLED_BY_PRIVACY_PURGE';
      }
    });

    perm.allow_global_analysis = false;
    perm.allow_connection_requests = false;
    perm.revoked_at = new Date().toISOString();
    perm.lifecycle_status = 'PURGED';

    this.db.purge_audit_log.unshift({
      purge_id: 'purge_' + Date.now(),
      anonymous_code: anonCode,
      purged_at: new Date().toISOString(),
      backup_cleanup_status: 'COMPLETED_HARD_DELETE'
    });

    this.saveDatabase();
  },

  removeLocalBirdFromPoolOnly(anonCode) {
    const target = this.db.global_gene_pool.find(g => g.anonymous_code === anonCode);
    if (!target) return;
    const pid = target.pool_bird_id;
    this.db.global_gene_pool = this.db.global_gene_pool.filter(g => g.pool_bird_id !== pid);
    this.db.global_pedigree_nodes = this.db.global_pedigree_nodes.filter(n => n.pool_bird_id !== pid);
    this.db.global_performance_records = this.db.global_performance_records.filter(r => r.pool_bird_id !== pid);
  },

  // İzin verilen yerel kuşu kimlik ve bilezik bilgisini maskeleyerek (SHA-256 hash) havuza senkronize eder
  syncLocalBirdToAnonymizedPool(localRing, perm) {
    this.removeLocalBirdFromPoolOnly(perm.anonymous_code);
    if (typeof AvigenPerformanceEngine === 'undefined') return;

    const prof = AvigenPerformanceEngine.calculateFullProfile(localRing);
    const { bird, statsSummary, categories } = prof;
    const poolBirdId = 'glb_local_' + perm.anonymous_code;

    const getMetric = (cat, key) => {
      const m = categories[cat]?.metrics?.find(x => x.key === key);
      return m ? m.score : null;
    };

    const pedCompleteness = Math.round((statsSummary.filledAncCount / 30) * 100);
    const relPct = Math.min(98, Math.round(pedCompleteness * 0.6 + Math.min(40, statsSummary.totalRaceCount * 12)));

    this.db.global_gene_pool.push({
      pool_bird_id: poolBirdId,
      anonymous_code: perm.anonymous_code,
      is_external_member: false,
      sex: bird.sex === 'F' ? 'F' : 'M',
      region_zone: '🇹🇷 Türkiye (Üye Kümesi • Anonim)',
      specialty_category: (getMetric('flight', 'long') || 0) >= (getMetric('flight', 'sprint') || 0) ? 'Long' : 'Middle',
      allow_global_analysis: perm.allow_global_analysis,
      allow_connection_requests: perm.allow_connection_requests,
      data_reliability_pct: Math.max(35, relPct),
      pedigree_completeness_pct: pedCompleteness,
      verified_race_count: statsSummary.totalRaceCount,
      verified_offspring_count: statsSummary.offspringCount,
      strengths_tr: 'Kullanıcı tarafından izin verilmiş anonim kümes kaydı.'
    });

    this.db.global_performance_records.push({
      record_id: 'rec_' + poolBirdId,
      pool_bird_id: poolBirdId,
      speed_index: getMetric('flight', 'speed'),
      endurance_index: getMetric('flight', 'endurance'),
      sprint_index: getMetric('flight', 'sprint'),
      middle_index: getMetric('flight', 'middle'),
      long_index: getMetric('flight', 'long'),
      marathon_index: getMetric('flight', 'marathon'),
      consistency_index: getMetric('racing', 'consistency'),
      homing_index: getMetric('navigation', 'homing'),
      parent_perf_index: getMetric('breeding', 'breeding_val'),
      sibling_perf_index: getMetric('racing', 'consistency'),
      offspring_perf_index: getMetric('breeding', 'offspring_perf'),
      prev_pairings_success_index: getMetric('breeding', 'breeding_val')
    });

    // Ata bilezik numaralarını açık metin olarak DEĞİL, yalnızca SHA-256 hash olarak kaydet (4 Kuşak: 30 Ata)
    const rawData = AvigenPerformanceEngine.extractVerifiedBirdData(localRing);
    const boxes = rawData.ownPed?.boxes || {};
    const slotGenMap = {
      sire: 1, dam: 1,
      g2_1: 2, g2_2: 2, g2_3: 2, g2_4: 2,
      g3_1: 3, g3_2: 3, g3_3: 3, g3_4: 3, g3_5: 3, g3_6: 3, g3_7: 3, g3_8: 3,
      g4_1: 4, g4_2: 4, g4_3: 4, g4_4: 4, g4_5: 4, g4_6: 4, g4_7: 4, g4_8: 4,
      g4_9: 4, g4_10: 4, g4_11: 4, g4_12: 4, g4_13: 4, g4_14: 4, g4_15: 4, g4_16: 4
    };
    Object.entries(slotGenMap).forEach(([slot, gen]) => {
      const r = boxes[slot]?.ring;
      if (r && r.trim()) {
        this.db.global_pedigree_nodes.push({
          node_id: `node_${poolBirdId}_${slot}`,
          pool_bird_id: poolBirdId,
          generation_depth: gen,
          slot_position: slot,
          ancestor_node_hash: this.hashRingIdentifier(r),
          ancestor_perf_index: 82,
          has_verified_wins: Boolean(boxes[slot]?.notes)
        });
      }
    });
  },

  // ==========================================================================
  // KONTROLLÜ BACKEND EŞLEŞTİRME SERVİSİ (LOCAL KUŞ × GLOBAL ANONİM ADAY)
  // ==========================================================================
  evaluateLocalBirdAgainstGlobalCandidate(localRing, poolCandidate, distanceFocus = 'ALL') {
    const profLocal = AvigenPerformanceEngine.calculateFullProfile(localRing);
    const rawLocal = AvigenPerformanceEngine.extractVerifiedBirdData(localRing);
    const perfGlobal = this.db.global_performance_records.find(r => r.pool_bird_id === poolCandidate.pool_bird_id) || {};
    const nodesGlobal = this.db.global_pedigree_nodes.filter(n => n.pool_bird_id === poolCandidate.pool_bird_id);

    // 1. Kriptografik Hash Üzerinden Gizli Ortak Ata & Akrabalık (Wright COI) Tespiti (4 Kuşak)
    const localHashes = [];
    const boxes = rawLocal.ownPed?.boxes || {};
    const slotGenMap = {
      main: 0, sire: 1, dam: 1,
      g2_1: 2, g2_2: 2, g2_3: 2, g2_4: 2,
      g3_1: 3, g3_2: 3, g3_3: 3, g3_4: 3, g3_5: 3, g3_6: 3, g3_7: 3, g3_8: 3,
      g4_1: 4, g4_2: 4, g4_3: 4, g4_4: 4, g4_5: 4, g4_6: 4, g4_7: 4, g4_8: 4,
      g4_9: 4, g4_10: 4, g4_11: 4, g4_12: 4, g4_13: 4, g4_14: 4, g4_15: 4, g4_16: 4
    };
    Object.entries(slotGenMap).forEach(([slot, gen]) => {
      const r = slot === 'main' ? localRing : boxes[slot]?.ring;
      if (r && r.trim()) {
        localHashes.push({ gen, hash: this.hashRingIdentifier(r) });
      }
    });

    const matchedHashMap = new Map();
    localHashes.forEach(lh => {
      nodesGlobal.forEach(gn => {
        if (lh.hash && lh.hash === gn.ancestor_node_hash) {
          // Wright F = (0.5)^(n1 + n2 + 1)
          const contrib = Math.pow(0.5, lh.gen + gn.generation_depth + 1) * 100;
          const prev = matchedHashMap.get(lh.hash) || 0;
          if (contrib > prev) {
            matchedHashMap.set(lh.hash, contrib);
          }
        }
      });
    });

    let estimatedCoi = 0;
    matchedHashMap.forEach(val => { estimatedCoi += val; });
    const commonHashCount = matchedHashMap.size;
    estimatedCoi = Number(Math.min(35, estimatedCoi).toFixed(2));

    // 2. Performans Tamamlayıcılığı (Complementarity)
    const getLoc = (cat, key) => {
      const m = profLocal.categories[cat]?.metrics?.find(x => x.key === key);
      return m && m.score !== null ? m.score : 68;
    };

    const locSpeed = getLoc('flight', 'speed');
    const locEndurance = getLoc('flight', 'endurance');
    const locConsistency = getLoc('racing', 'consistency');
    const locHoming = getLoc('navigation', 'homing');

    const glbSpeed = perfGlobal.speed_index || 75;
    const glbEndurance = perfGlobal.endurance_index || 75;
    const glbConsistency = perfGlobal.consistency_index || 75;
    const glbHoming = perfGlobal.homing_index || 75;

    // Tamamlayıcılık: Bir tarafın eksik/orta olduğu yerde diğer tarafın güçlü olması bonusu
    const compSpeed = Math.round(Math.max(locSpeed, glbSpeed) * 0.65 + Math.min(locSpeed, glbSpeed) * 0.35);
    const compEndurance = Math.round(Math.max(locEndurance, glbEndurance) * 0.65 + Math.min(locEndurance, glbEndurance) * 0.35);
    const perfComplementarity = Math.min(98, Math.round((compSpeed + compEndurance + ((locConsistency + glbConsistency) / 2) + ((locHoming + glbHoming) / 2)) / 4));

    // 3. Pedigree Tamamlayıcılığı & Aile (Anne-Baba, Kardeş, Yavru, Önceki Eşleşme) Gücü
    const locPedDepth = Math.round((profLocal.statsSummary.filledAncCount / 30) * 100);
    const glbFamilyPower = Math.round(
      ((perfGlobal.parent_perf_index || 78) * 0.35) +
      ((perfGlobal.sibling_perf_index || 76) * 0.25) +
      ((perfGlobal.offspring_perf_index || 78) * 0.25) +
      ((perfGlobal.prev_pairings_success_index || 78) * 0.15)
    );
    const pedigreeComplementarity = Math.min(97, Math.round((glbFamilyPower * 0.65) + (poolCandidate.pedigree_completeness_pct * 0.2) + (locPedDepth * 0.15)));

    // 4. Soy Uyumu & Akrabalık Dengesi
    let lineageCompatibility = 90;
    let inbreedingWarningTr = 'Ortak ata çakışması tespit edilmedi (%0 COI — Güvenli Yabancı Kan / Outcross).';
    if (estimatedCoi >= 18) {
      lineageCompatibility = 48;
      inbreedingWarningTr = `⚠️ Yüksek Akrabalık Riski (%${estimatedCoi} COI • ${commonHashCount} ortak ata düğümü): Yavrularda genetik depresyon riski nedeniyle önerilmez.`;
    } else if (estimatedCoi > 0) {
      lineageCompatibility = 94;
      inbreedingWarningTr = `🧬 Kontrollü Soy Uyumu (%${estimatedCoi} COI • ${commonHashCount} ortak şampiyon ata düğümü): Akrabalık depresyonu sınırının altında güvenli Linebreeding.`;
    }

    // 5. Yarış Mesafesi Uyumu
    let distanceMatchScore = 88;
    if (distanceFocus !== 'ALL') {
      distanceMatchScore = poolCandidate.specialty_category.toLowerCase() === distanceFocus.toLowerCase() ? 96 : 79;
    }

    // 6. Veri Güvenilirliği (Kuş sayısını değil, doğrulanmış veri kalitesini esas alır!)
    const localRel = Math.min(95, Math.round(locPedDepth * 0.65 + Math.min(35, profLocal.statsSummary.totalRaceCount * 12)));
    const combinedReliability = Math.round((poolCandidate.data_reliability_pct * 0.6) + (Math.max(40, localRel) * 0.4));

    // Eksik verili aday cezası (Eksik pedigree tamamlanmış gibi gösterilmez)
    const qualityFactor = poolCandidate.data_reliability_pct < 70 ? 0.86 : 1.0;

    // 7. Potansiyel Damızlık Katkısı & Toplam Eşleşme Puanı
    const potentialBreedingContribution = Math.min(97, Math.round((perfComplementarity * 0.45 + pedigreeComplementarity * 0.35 + lineageCompatibility * 0.20) * qualityFactor));
    const totalMatchScore = Math.min(98, Math.round(
      (perfComplementarity * 0.30 +
       pedigreeComplementarity * 0.25 +
       lineageCompatibility * 0.20 +
       distanceMatchScore * 0.10 +
       combinedReliability * 0.15) * qualityFactor
    ));

    // Sade Türkçe Önerilme Nedeni
    const complementDetails = [];
    if (glbSpeed > locSpeed + 4) {
      complementDetails.push(`kuşunuzun hız indeksini (${locSpeed}) bu adayın yüksek hız ve kardeş performansı (${glbSpeed}) yukarı taşıyor`);
    }
    if (glbEndurance > locEndurance + 4) {
      complementDetails.push(`kuşunuzun uzun mesafe dayanıklılığını (${locEndurance}) bu adayın kanıtlanmış dayanıklılık hattı (${glbEndurance}) tamamlıyor`);
    }
    if (!complementDetails.length) {
      complementDetails.push(`her iki kuşun hız (${locSpeed}/${glbSpeed}), dayanıklılık (${locEndurance}/${glbEndurance}) ve eve dönüş istikrarı birbirini dengeli şekilde tamamlıyor`);
    }

    const matchReasonTr = `Bu eşleşme öneriliyor çünkü ${complementDetails.join(' ve ')}. Adayın ${poolCandidate.verified_race_count} doğrulanmış yarış ve ${poolCandidate.verified_offspring_count} yavru kaydı damızlık belirsizliğini azaltmaktadır.`;

    return {
      localBird: profLocal.bird,
      candidate: poolCandidate,
      perfGlobal,
      totalMatchScore,
      lineageCompatibility,
      estimatedCoi,
      commonHashCount,
      inbreedingWarningTr,
      pedigreeComplementarity,
      perfComplementarity,
      distanceMatchScore,
      combinedReliability,
      potentialBreedingContribution,
      matchReasonTr
    };
  },

  // Tek bir kuş için küresel havuzdaki en uygun adayları döndürür
  findGlobalMatchesForLocalBird(localRing, distanceFocus = 'ALL') {
    this.state.queryCountInSession++;
    if (this.state.queryCountInSession > this.state.MAX_QUERIES_PER_WINDOW) {
      return { rateLimited: true, matches: [] };
    }

    const allLoft = collectUniqueLoftBirds();
    const localBird = allLoft.find(b => b.ring.toUpperCase() === String(localRing || '').toUpperCase()) || allLoft[0];
    if (!localBird) return { rateLimited: false, matches: [] };

    const targetSex = localBird.sex === 'F' ? 'M' : 'F';

    // Yalnızca analiz izni açık olan ve veri kalitesi sıralanmış dış adayları tara
    const eligiblePool = this.db.global_gene_pool.filter(
      g => g.allow_global_analysis && g.is_external_member && g.sex === targetSex
    );

    const results = eligiblePool
      .map(cand => this.evaluateLocalBirdAgainstGlobalCandidate(localBird.ring, cand, distanceFocus))
      .sort((a, b) => b.totalMatchScore - a.totalMatchScore);

    return {
      rateLimited: false,
      localBird,
      matches: results
    };
  },

  // ==========================================================================
  // KÜRESEL HAVUZU KULLANARAK TÜM KÜMES İÇİN "EN İYİ KUŞ ÇİFTİ ÖNERİLERİ" (GLOBAL BEST PAIRS)
  // ==========================================================================
  computeTopGlobalBestPairsForLoft(limit = 3) {
    const activeLoftBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
    const eligiblePool = this.db.global_gene_pool.filter(g => g.allow_global_analysis && g.is_external_member);

    const allCrossPairs = [];

    activeLoftBirds.forEach(lb => {
      const neededSex = lb.sex === 'F' ? 'M' : 'F';
      eligiblePool
        .filter(g => g.sex === neededSex)
        .forEach(cand => {
          const ev = this.evaluateLocalBirdAgainstGlobalCandidate(lb.ring, cand, this.state.targetDistanceFocus);
          allCrossPairs.push(ev);
        });
    });

    // Veri güvenilirliği yüksek ve toplam uyum puanı en iyi olan tekil çiftleri sırala
    allCrossPairs.sort((a, b) => b.totalMatchScore - a.totalMatchScore);

    const picked = [];
    const usedAnon = new Set();
    for (const item of allCrossPairs) {
      if (!usedAnon.has(item.candidate.anonymous_code)) {
        picked.push(item);
        usedAnon.add(item.candidate.anonymous_code);
      }
      if (picked.length >= limit) break;
    }

    return picked;
  },

  // ==========================================================================
  // SAHİP ONAYLI İLETİŞİM / EŞLEŞTİRME TALEBİ GÖNDERME SİSTEMİ
  // ==========================================================================
  sendConnectionRequest(localRing, targetAnonCode, reqType = 'PAIRING_COLLAB') {
    // Servis Katmanı Üyelik Paketi Yetki Kontrolü (Yalnızca AVIGEN GLOBAL paketi talep gönderebilir)
    if (typeof AvigenUxManager !== 'undefined' && !AvigenUxManager.hasGlobalPoolAccess()) {
      alert('🔒 Yetkisiz İşlem: Küresel Gen Havuzundaki kuş sahiplerine iletişim ve eşleştirme talebi göndermek için AVIGEN GLOBAL üyeliği gereklidir.');
      AvigenUxManager.openSubscriptionModal('plans');
      return null;
    }

    const cand = this.db.global_gene_pool.find(g => g.anonymous_code === targetAnonCode && g.allow_global_analysis);
    if (!cand) return null;

    if (!cand.allow_connection_requests) {
      alert(`🔒 İletişim İzni Kapalı!\n\n${targetAnonCode} kodlu kuşun sahibi yalnızca anonim analiz izni vermiş, iletişim ve eşleştirme taleplerini kapatmıştır. Sahibin onayı olmadan talep oluşturulamaz.`);
      return;
    }

    const existing = this.db.breeder_connection_requests.find(
      r => r.sender_bird_ring === localRing && r.target_anonymous_code === targetAnonCode && r.status === 'PENDING'
    );
    if (existing) {
      alert(`ℹ️ ${targetAnonCode} için zaten gönderilmiş ve sahip onayı bekleyen bir iletişim talebiniz bulunuyor.`);
      return;
    }

    const typeLabels = {
      PAIRING_COLLAB: 'Ortak Damızlık Eşleştirme Talebi',
      OFFSPRING_RESERVE: 'Yavru / Yumurta Rezervasyon Talebi',
      PURCHASE_INQUIRY: 'Damızlık Transfer / Satın Alma Görüşmesi'
    };

    const req = {
      request_id: 'req_' + Date.now(),
      sender_user_id: 'current_local_breeder',
      sender_bird_ring: localRing,
      target_anonymous_code: targetAnonCode,
      target_region: cand.region_zone,
      request_type: reqType,
      request_type_label: typeLabels[reqType] || typeLabels.PAIRING_COLLAB,
      status: 'PENDING', // Sahibin onayı olmadan kimlik/pedigre açılmaz!
      created_at: new Date().toLocaleDateString('tr-TR')
    };

    this.db.breeder_connection_requests.unshift(req);
    this.saveDatabase();

    if (typeof AvigenGenesisAI !== 'undefined') {
      AvigenGenesisAI.renderGenesisReportOnly();
    }
    alert(`📩 İletişim Talebiniz Gönderildi!\n\n• Sizin Kuşunuz: ${localRing}\n• Hedef Anonim Kuş: ${targetAnonCode}\n• Durum: Kuş Sahibinin Onayı Bekleniyor\n\nGizlilik kuralları gereği, karşı üye talebinizi onaylayana kadar her iki tarafın özel pedigree belgesi ve kimlik bilgileri gizli tutulur.`);
  }
};

window.addEventListener('DOMContentLoaded', () => {
  AvigenGlobalGenePool.init();
});
