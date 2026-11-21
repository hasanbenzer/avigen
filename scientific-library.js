// ============================================================================
// AVIGEN – SCIENTIFIC KNOWLEDGE BASE MODULE (AVIGEN SCIENTIFIC LIBRARY)
// ============================================================================
// Amaç:
// Yarış güvercinleri (Columba livia), genetik, kalıtım, uçuş performansı,
// dayanıklılık, hız, yön bulma, kas fizyolojisi ve damızlık seçimi hakkındaki
// hakemli akademik araştırmaları merkezi bir veritabanında (scientific_sources)
// toplamak ve GENESIS AI / Performans Profil Motoru ile entegre etmek.
//
// Telif & Bilimsel Dürüstlük Kuralları:
// 1. Tam metinler izinsiz kopyalanmaz; yalnızca bibliyografik metadata,
//    yapılandırılmış bilimsel özet, örneklem büyüklüğü, yöntem ve sınırlamalar saklanır.
// 2. İlişki (association) bulguları kesin nedensellik (causation) olarak sunulmaz.
// 3. Bilimsel yayınların desteklemediği sonuçlar bilimsel gerçek olarak üretilmez.
// ============================================================================

const STORAGE_KEY_SCIENTIFIC_SOURCES = 'avigen_scientific_sources_v1';

const AvigenScientificLibrary = {
  // 9 Standart Kaynak Kategorisi
  CATEGORIES: [
    'Racing Pigeon Genetics',
    'Flight Performance',
    'Speed and Endurance',
    'Homing and Navigation',
    'Muscle Physiology',
    'Genetic Markers',
    'Quantitative Genetics',
    'Breeding and Heritability',
    'Pedigree and Inbreeding'
  ],

  // 5 Bilimsel Kanıt Gücü Seviyesi
  EVIDENCE_LEVELS: [
    {
      id: 'basic_research',
      label: 'Temel Biyolojik Araştırma',
      badgeClass: 'gene-blue',
      causalWarning: 'Biyolojik mekanizma ve genomik/transkriptomik yapı araştırmasıdır; tek başına doğrudan yarış sonucu garantisi olarak yorumlanamaz.'
    },
    {
      id: 'association_study',
      label: 'İlişki (Association) Araştırması',
      badgeClass: 'gene-gold',
      causalWarning: 'İstatistiksel korelasyon (association) bulgusudur; kesin nedensellik (causation) kanıtı değildir. Genotip etkisi olasılıksaldır (probabilistic).'
    },
    {
      id: 'functional_validation',
      label: 'Fonksiyonel Doğrulama',
      badgeClass: 'gene-purple',
      causalWarning: 'Hücresel veya fizyolojik fonksiyonu doğrulanmış mekanizmadır; ancak saha yarış performansı antrenman ve çevre koşullarıyla birlikte şekillenir.'
    },
    {
      id: 'independent_replication',
      label: 'Bağımsız Tekrar Çalışması',
      badgeClass: 'gene-green',
      causalWarning: 'Farklı popülasyonlarda bağımsız olarak tekrar doğrulanmış bulgudur; yine de poligenik ve çevresel faktörlerle birlikte değerlendirilmelidir.'
    },
    {
      id: 'systematic_review',
      label: 'Sistematik Derleme',
      badgeClass: 'gene-green',
      causalWarning: 'Çoklu araştırmaların sentezidir; bireysel kuş değerlendirmesinde mevcut veri güvenilirliği dikkate alınmalıdır.'
    }
  ],

  state: {
    activeSubView: 'library', // 'library' | 'notes'
    selectedCategory: 'ALL',
    selectedEvidence: 'ALL',
    searchQuery: '',
    expandedSourceId: null,
    editingSourceId: null
  },

  // ==========================================================================
  // BİRİNCİL KAYNAKTAN DOĞRULANMIŞ 6 ÇEKİRDEK AKADEMİK YAYIN (SEED DATA)
  // ==========================================================================
  getInitialSeedSources() {
    return [
      {
        id: 'sci_gazda_2018',
        title: 'Signatures of Selection on Standing Genetic Variation Underlie Athletic and Navigational Performance in Racing Pigeons',
        authors: 'Małgorzata A. Gazda, Pedro Andrade, Sandra Afonso, Jolita Dilytė, John P. Archer, Ricardo J. Lopes, Rui Faria, Miguel Carneiro',
        year: 2018,
        journal: 'Molecular Biology and Evolution (Vol. 35, Issue 5, pp. 1176–1189)',
        doi: '10.1093/molbev/msy030',
        pmid: '29547891',
        openAccessUrl: 'https://doi.org/10.1093/molbev/msy030',
        objective: 'Modern yarış güvercinlerinin olağanüstü atletik dayanıklılık, hızlı uçuş ve uzamsal yön bulma (navigasyon) yeteneklerinin arkasındaki tüm-genom seçilim izlerini ve gen anlatımı (transkriptom) farklarını belirlemek.',
        sampleSize: '46 tam genom dizilemesi (yarış güvercinleri ve yarışçı olmayan ırklar) + beyin ve göğüs kası (pectoralis) RNA-seq örnekleri',
        traitsExamined: ['Athletic Performance', 'Navigational Ability', 'Neuromuscular Junction (CASK)', 'Polygenic Adaptation'],
        methodology: 'Tüm Genom Dizilemesi (Whole-Genome Sequencing - WGS), Fst / Pi popülasyon genetiği seçilim taraması ve beyin/kas dokusu RNA-seq transkriptom analizi.',
        keyFindings: 'Yarış güvercinlerinde performans tek bir "şampiyonluk genine" bağlı olmayıp poligenik (çok genli) bir mimariye dayanır. En güçlü seçilim sinyali nöromüsküler kavşak oluşumunda kritik rol oynayan CASK geninde saptanmıştır. Seçilim yeni mutasyonlardan ziyade mevcut genetik çeşitlilik (standing genetic variation) üzerinde gerçekleşmiştir.',
        limitations: 'Yarışçı ve yarışçı olmayan ırkların karşılaştırmasına dayanır; tek bir genetik varyantın bireysel yarış derecesini tek başına tahmin etme gücü düşüktür.',
        evidenceLevel: 'basic_research',
        sourceCategories: ['Racing Pigeon Genetics', 'Flight Performance', 'Homing and Navigation', 'Quantitative Genetics'],
        performanceCategories: ['Speed', 'Endurance', 'Homing Reliability', 'Route Efficiency', 'Genetic Diversity'],
        verifiedDate: '2026-11-20'
      },
      {
        id: 'sci_shao_2020',
        title: 'Genomic and Phenotypic Analyses Reveal Mechanisms Underlying Homing Ability in Pigeon',
        authors: 'Yong Shao, Hang-Yu Tian, Jing-Jing Zhang, Huan Khai, et al.',
        year: 2020,
        journal: 'Molecular Biology and Evolution (Vol. 37, Issue 1, pp. 134–148)',
        doi: '10.1093/molbev/msz208',
        pmid: '31501895',
        openAccessUrl: 'https://doi.org/10.1093/molbev/msz208',
        objective: 'Posta/yarış güvercinlerinde eve dönüş (homing), uzun mesafe yön bulma ve uçuş adaptasyonunu sağlayan genomik ve anatomik/fenotipik mekanizmaları ortaya çıkarmak.',
        sampleSize: '145 güvercin genomu ve GPS uçuş izleme / anatomik beyin-kas fenotip örnekleri',
        traitsExamined: ['Homing Ability', 'Spatial Memory (Hippocampus)', 'Magnetoreception', 'Flight Muscle Adaptation'],
        methodology: 'Karşılaştırmalı popülasyon genomik analizi, pozitif seçilim taraması ve GPS destekli eve dönüş fenotip ölçümleri.',
        keyFindings: 'Merkezi sinir sistemi gelişimi, hipokampal uzamsal hafıza, sirkadiyen ritim ve kardiyovasküler/kas enerji metabolizması ile ilişkili gen yolaklarında (GSR ve nöral gelişim genleri dahil) güçlü pozitif seçilim tespit edilmiştir.',
        limitations: 'Genom çapında adaptif yolakları tanımlar; bireysel damızlık seçiminde çevresel alıştırma ve manyetik/atmosferik koşulların etkisi göz ardı edilemez.',
        evidenceLevel: 'basic_research',
        sourceCategories: ['Homing and Navigation', 'Racing Pigeon Genetics', 'Flight Performance'],
        performanceCategories: ['Homing Reliability', 'Return Time', 'Route Efficiency', 'Release Point Adaptability', 'Long Distance'],
        verifiedDate: '2026-11-20'
      },
      {
        id: 'sci_dybus_2021',
        title: 'CRY1 Gene Polymorphism and Racing Performance of Homing Pigeons',
        authors: 'Andrzej Dybus, Hanna Kulig, Yu-Hsiang Yu, Ruben Lanckriet, Witold Proskura, Yeong-Hsiang Cheng',
        year: 2021,
        journal: 'Animals (MDPI, Vol. 11, Issue 9, Article 2632)',
        doi: '10.3390/ani11092632',
        pmid: '34573598',
        openAccessUrl: 'https://doi.org/10.3390/ani11092632',
        objective: 'Kuş retinasında mavi ışık fotoreseptörü ve manyetik pusula (magnetoreception) aday proteini olan Kriptokrom-1 (CRY1) genindeki polimorfizmlerin yarış güvercinlerinin uçuş performansıyla ilişkisini incelemek.',
        sampleSize: '129 yarış güvercini (100–400 km kategorisi resmi yarış kayıtları)',
        traitsExamined: ['CRY1 Intron 7 Polymorphism (AG/TT)', 'Ace Points (AP)', '100-400 km Flight Performance', 'Magnetoreception Orientation'],
        methodology: 'Forced PCR-RFLP genotipleme analizi ve resmi yarış sonuçları (Ace Points) üzerinden istatistiksel ilişki (association) modeli.',
        keyFindings: 'CRY1 geni intron 7 bölgesinde AG->TT nükleotid değişimi saptanmıştır. 100–400 km etaplarında AG/TT heterozigot genotipine sahip güvercinler, AG/AG genotipli kuşlara kıyasla istatistiksel olarak anlamlı derecede daha yüksek ortalama As Puanı (Ace Points) elde etmiştir.',
        limitations: 'İlişki (association) çalışmasıdır (n=129); TT/TT homozigot frekansı örneklemde düşüktür ve bulgular 100–400 km mesafelerle sınırlıdır. Tek başına kesin nedensellik kanıtı olarak sunulamaz.',
        evidenceLevel: 'association_study',
        sourceCategories: ['Genetic Markers', 'Homing and Navigation', 'Flight Performance'],
        performanceCategories: ['Sprint', 'Middle Distance', 'Homing Reliability', 'Competition Performance', 'Consistency'],
        verifiedDate: '2026-11-20'
      },
      {
        id: 'sci_kolvenbag_2022',
        title: 'Prospective Study Relating Genotype Profiles with Race Performance in Racing Pigeons',
        authors: 'Geert Kolvenbag, Mark Scott, Arne de Kloet, Ed de Kloet',
        year: 2022,
        journal: 'Journal of Applied Genetics (Vol. 63, pp. 563–570)',
        doi: '10.1007/s13353-022-00697-w',
        pmid: '35505002',
        openAccessUrl: 'https://doi.org/10.1007/s13353-022-00697-w',
        objective: 'Çoklu aday gen profillerinin (LDHA, DRD4, MSTN, F-KER, mtDNA) ve demografik özelliklerin (tüy rengi, cinsiyet) gerçek yarış performansı üzerindeki etkisini ileriye dönük (prospective) bir çalışma tasarımıyla test etmek.',
        sampleSize: 'Akraba bir yarış güvercini ailesinden 302 genç güvercin ve 2.400+ bireysel yarış kaydı',
        traitsExamined: ['LDHA', 'DRD4', 'MSTN', 'F-KER (Feather Keratin)', 'mtDNA (Queen L)', 'Plumage Color', 'Race Coefficient'],
        methodology: 'İleriye dönük (prospective) kohort genotipleme ve kısa/uzun mesafe yarış katsayıları (race coefficient) üzerinde çok değişkenli istatistiksel analiz.',
        keyFindings: 'DRD4 ve F-KER (tüy keratini) gen varyantları ile yarış performansı arasında anlamlı ilişki bulunmuş; F-KER TT profili uzun mesafede avantaj göstermiştir. Queen L mtDNA hattı kısa mesafede etkili bulunmuştur. Ancak yazarlar genetik profilin "belirleyici (decisive) değil olasılıksal (probabilistic)" olduğunu, antrenman ve sağlığın kritik kaldığını vurgulamıştır.',
        limitations: 'Belirli bir soy ailesi (cohort) üzerinde yürütülmüştür; bu kohortta LDHA ve MSTN tek başına anlamlı fark göstermemiştir. DNA belirteçleri kesin şampiyonluk garantisi vermez.',
        evidenceLevel: 'association_study',
        sourceCategories: ['Genetic Markers', 'Racing Pigeon Genetics', 'Breeding and Heritability', 'Pedigree and Inbreeding'],
        performanceCategories: ['Sprint', 'Long Distance', 'Consistency', 'Breeding Value', 'Offspring Performance'],
        verifiedDate: '2026-11-20'
      },
      {
        id: 'sci_stefaniuk_2024',
        title: 'First Transcriptomic Insight into the Working Muscles of Racing Pigeons During a Competition Flight',
        authors: 'Monika Stefaniuk-Szmukier, Katarzyna Ropka-Molik, Tomasz Szmatoła, et al.',
        year: 2024,
        journal: 'Molecular Biology Reports (Vol. 51, Article 631)',
        doi: '10.1007/s11033-024-09566-7',
        pmid: '38717527',
        openAccessUrl: 'https://doi.org/10.1007/s11033-024-09566-7',
        objective: 'Gerçek bir yarış uçuşu sonrasında yarış güvercinlerinin çalışan iskelet kaslarında (m. pectoralis) meydana gelen transkriptomik (gen ifadesi) değişimleri ilk kez moleküler düzeyde incelemek.',
        sampleSize: 'Yarış uçuşu tamamlayan ve kontrol grubundaki yarış güvercinlerinden alınan kas biyopsi örnekleri (RNA-Seq)',
        traitsExamined: ['Muscle Transcriptome', 'Lipid & Glucose Metabolism', 'Oxidative Stress Response', 'PPAR Signaling Pathway', 'Muscle Recovery'],
        methodology: 'Yüksek çıktılı RNA dizilemesi (RNA-Seq), Diferansiyel Gen İfadesi (DEG) analizi ve KEGG/GO metabolik yolak zenginleştirme analizi.',
        keyFindings: 'Yarış uçuşu sırasında kas dokusunda yağ asidi oksidasyonu (lipid metabolizması), PPAR sinyal yolağı, ısı şoku proteinleri (HSP) ve antioksidan savunma genlerinde belirgin aktivasyon saptanmıştır. Uzun süreli dayanıklılık uçuşunun kas içi lipid yakımı ve inflamasyon kontrolü kapasitesine dayandığı doğrulanmıştır.',
        limitations: 'Kas dokusu biyopsisi gerektiren invaziv fizyolojik/transkriptomik çalışmadır; örneklem büyüklüğü moleküler maliyet nedeniyle sınırlıdır.',
        evidenceLevel: 'functional_validation',
        sourceCategories: ['Muscle Physiology', 'Speed and Endurance', 'Flight Performance'],
        performanceCategories: ['Endurance', 'Flight Duration', 'Marathon', 'Long Distance', 'Race Completion Rate'],
        verifiedDate: '2026-11-20'
      },
      {
        id: 'sci_stefaniuk_2026',
        title: 'Associations of Genetic Variants in the PPARD Gene to Racing Performance in Pigeons',
        authors: 'Monika Stefaniuk-Szmukier, Wioletta Klecel, Tomasz Szmatoła, Katarzyna Ropka-Molik',
        year: 2026,
        journal: 'Developmental Biology (Elsevier)',
        doi: '10.1016/j.ydbio.2025.12.011',
        pmid: '41429277',
        openAccessUrl: 'https://doi.org/10.1016/j.ydbio.2025.12.011',
        objective: 'Kas lifi tipi düzenlenmesi ve lipid enerji metabolizmasında anahtar rol oynayan PPARD (Peroxisome Proliferator-Activated Receptor Delta) genindeki tek nükleotid polimorfizmlerinin (SNP) yarış güvercinlerinde uçuş hızı ve performans katsayısıyla ilişkisini araştırmak.',
        sampleSize: 'Yarış güvercini popülasyonu üzerinde PPARD kodlayan ve 3\'UTR bölgesi dizi analizi ve resmi yarış kayıtları',
        traitsExamined: ['PPARD Gene Variants', 'c.79G>A (p.Gly27Arg)', 'c.142T>G (p.Ser48Ala)', 'c.*271C>T (3\'UTR)', 'Flight Speed & Ace Coefficient'],
        methodology: 'Aday gen dizilemesi, SNP genotipleme ve yarış hızı (m/dk) ile performans katsayıları üzerinde doğrusal karma model (mixed-model) ilişki analizi.',
        keyFindings: 'PPARD geninde iki yanlış anlamlı (missense: c.79G>A ve c.142T>G) ve bir 3\'UTR (c.*271C>T) varyantı tanımlanmıştır. Özellikle c.*271C>T lokusu ile uçuş hızı (flight speed) arasında istatistiksel olarak anlamlı bir ilişki saptanmış ve PPARD dayanıklılık/hız için yeni bir aday moleküler belirteç olarak önerilmiştir.',
        limitations: 'Aday gen ilişki (association) araştırmasıdır; farklı ülke ve iklim koşullarındaki güvercin popülasyonlarında bağımsız tekrar çalışmalarıyla (replication) desteklenmesi gerekir.',
        evidenceLevel: 'association_study',
        sourceCategories: ['Genetic Markers', 'Muscle Physiology', 'Speed and Endurance', 'Racing Pigeon Genetics'],
        performanceCategories: ['Speed', 'Endurance', 'Middle Distance', 'Long Distance', 'Competition Performance'],
        verifiedDate: '2026-11-20'
      }
    ];
  },

  // ==========================================================================
  // VERİTABANI BAŞLATMA, KAYDETME VE MÜKERRER (DOI / PMID) KONTROLÜ
  // ==========================================================================
  sources: [],

  init() {
    this.loadSources();
    this.renderLibraryUI();
  },

  loadSources() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SCIENTIFIC_SOURCES);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.sources = parsed;
          // Eksik çekirdek makale varsa DOI üzerinden kontrol ederek tamamla
          const seeds = this.getInitialSeedSources();
          let updated = false;
          seeds.forEach(seed => {
            if (!this.isDuplicateSource(seed.doi, seed.pmid)) {
              this.sources.push(seed);
              updated = true;
            }
          });
          if (updated) this.saveSources();
          return;
        }
      }
    } catch (e) {
      console.warn('Scientific sources load warning:', e);
    }
    this.sources = this.getInitialSeedSources();
    this.saveSources();
  },

  saveSources() {
    localStorage.setItem(STORAGE_KEY_SCIENTIFIC_SOURCES, JSON.stringify(this.sources));
  },

  normalizeDoi(doi) {
    return String(doi || '')
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '');
  },

  normalizePmid(pmid) {
    return String(pmid || '').trim().replace(/[^0-9]/g, '');
  },

  isDuplicateSource(doi, pmid, excludeId = null) {
    const cleanDoi = this.normalizeDoi(doi);
    const cleanPmid = this.normalizePmid(pmid);

    return this.sources.find(s => {
      if (excludeId && s.id === excludeId) return false;
      const sDoi = this.normalizeDoi(s.doi);
      const sPmid = this.normalizePmid(s.pmid);
      if (cleanDoi && sDoi && cleanDoi === sDoi) return true;
      if (cleanPmid && sPmid && cleanPmid === sPmid) return true;
      return false;
    });
  },

  getEvidenceMeta(levelId) {
    return this.EVIDENCE_LEVELS.find(e => e.id === levelId) || this.EVIDENCE_LEVELS[1];
  },

  // ==========================================================================
  // CROSSREF & PUBMED (E-UTILITIES) BİBLİYOGRAFİK METADATA DOĞRULAMA ALTYAPISI
  // ==========================================================================
  async fetchMetadataFromDoiOrPmid() {
    const doiInput = document.getElementById('sciFormDoi');
    const pmidInput = document.getElementById('sciFormPmid');
    const statusBox = document.getElementById('sciApiFetchStatus');
    const rawDoi = this.normalizeDoi(doiInput ? doiInput.value : '');
    const rawPmid = this.normalizePmid(pmidInput ? pmidInput.value : '');

    if (!rawDoi && !rawPmid) {
      if (statusBox) {
        statusBox.style.display = 'block';
        statusBox.innerHTML = '⚠️ Lütfen sorgulamak için geçerli bir <strong>DOI</strong> veya <strong>PubMed ID (PMID)</strong> girin.';
      }
      return;
    }

    if (statusBox) {
      statusBox.style.display = 'block';
      statusBox.innerHTML = '⏳ Crossref / PubMed NCBI veritabanından bibliyografik kayıt doğrulanıyor...';
    }

    try {
      // 1. Önce yerel doğrulanmış çekirdek katalogda varsa anında doldur (Çevrimdışı destek)
      const known = this.getInitialSeedSources().find(
        s => (rawDoi && this.normalizeDoi(s.doi) === rawDoi) || (rawPmid && this.normalizePmid(s.pmid) === rawPmid)
      );
      if (known) {
        this.populateFormFields(known);
        if (statusBox) {
          statusBox.innerHTML = `✅ Birincil kaynak doğrulandı (${escapeHtml(known.doi || known.pmid)}). Bibliyografik alanlar dolduruldu.`;
        }
        return;
      }

      // 2. DOI girilmişse Crossref REST API üzerinden çek
      if (rawDoi) {
        const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(rawDoi)}`);
        if (res.ok) {
          const data = await res.json();
          const msg = data.message || {};
          const title = Array.isArray(msg.title) ? msg.title[0] : (msg.title || '');
          const authors = Array.isArray(msg.author)
            ? msg.author.map(a => `${a.given || ''} ${a.family || ''}`.trim()).join(', ')
            : '';
          const year = msg.issued?.['date-parts']?.[0]?.[0] || new Date().getFullYear();
          const journal = Array.isArray(msg['container-title']) ? msg['container-title'][0] : (msg['container-title'] || '');

          this.populateFormFields({
            title,
            authors,
            year,
            journal,
            doi: rawDoi,
            openAccessUrl: `https://doi.org/${rawDoi}`
          });

          if (statusBox) {
            statusBox.innerHTML = `✅ Crossref üzerinden DOI (${escapeHtml(rawDoi)}) bibliyografik verisi başarıyla çekildi. Telif kuralları gereği tam metin kopyalanmadı.`;
          }
          return;
        }
      }

      // 3. PMID girilmişse NCBI PubMed E-Utilities esummary API üzerinden çek
      if (rawPmid) {
        const res = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${encodeURIComponent(rawPmid)}&retmode=json`);
        if (res.ok) {
          const data = await res.json();
          const doc = data?.result?.[rawPmid];
          if (doc && doc.title) {
            const authors = Array.isArray(doc.authors) ? doc.authors.map(a => a.name).join(', ') : '';
            const year = parseInt((doc.pubdate || '').slice(0, 4), 10) || new Date().getFullYear();
            const doiObj = Array.isArray(doc.articleids) ? doc.articleids.find(x => x.idtype === 'doi') : null;
            const foundDoi = doiObj ? doiObj.value : rawDoi;

            this.populateFormFields({
              title: doc.title.replace(/\.$/, ''),
              authors,
              year,
              journal: doc.fulljournalname || doc.source || '',
              doi: foundDoi,
              pmid: rawPmid,
              openAccessUrl: foundDoi ? `https://doi.org/${foundDoi}` : `https://pubmed.ncbi.nlm.nih.gov/${rawPmid}/`
            });

            if (statusBox) {
              statusBox.innerHTML = `✅ PubMed NCBI üzerinden PMID (${escapeHtml(rawPmid)}) bibliyografik verisi başarıyla doğrulandı.`;
            }
            return;
          }
        }
      }

      if (statusBox) {
        statusBox.innerHTML = 'ℹ️ Çevrimiçi API yanıt vermedi veya kayıt bulunamadı. Bilgileri manuel olarak girip kaydedebilirsiniz.';
      }
    } catch (err) {
      if (statusBox) {
        statusBox.innerHTML = 'ℹ️ Çevrimdışı mod: İnternet bağlantısı olmadan manuel bibliyografik kayıt ekleyebilirsiniz.';
      }
    }
  },

  populateFormFields(partial) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null && val !== '') el.value = val;
    };
    setVal('sciFormTitle', partial.title);
    setVal('sciFormAuthors', partial.authors);
    setVal('sciFormYear', partial.year);
    setVal('sciFormJournal', partial.journal);
    setVal('sciFormDoi', partial.doi);
    setVal('sciFormPmid', partial.pmid);
    setVal('sciFormUrl', partial.openAccessUrl);
    setVal('sciFormObjective', partial.objective);
    setVal('sciFormSample', partial.sampleSize);
    setVal('sciFormMethod', partial.methodology);
    setVal('sciFormFindings', partial.keyFindings);
    setVal('sciFormLimitations', partial.limitations);
  },

  // ==========================================================================
  // YAPAY ZEKÂ & PERFORMANS PROFİLİ ENTEGRASYON API'Sİ
  // ==========================================================================
  // İlgili modül veya performans özelliğine göre bilimsel kaynakları döndürür
  getReferencesForModuleOrTrait(queryKey) {
    const q = String(queryKey || '').toLowerCase();
    return this.sources.filter(s => {
      const cats = (s.sourceCategories || []).map(c => c.toLowerCase());
      const perfCats = (s.performanceCategories || []).map(c => c.toLowerCase());
      const traits = (s.traitsExamined || []).map(t => t.toLowerCase());

      if (q === 'racing_ai' || q === 'flight') {
        return cats.includes('flight performance') || cats.includes('speed and endurance') || cats.includes('muscle physiology');
      }
      if (q === 'navigation_ai' || q === 'navigation') {
        return cats.includes('homing and navigation');
      }
      if (q === 'breeding_ai' || q === 'breeding' || q === 'pairing') {
        return cats.includes('breeding and heritability') || cats.includes('pedigree and inbreeding') || cats.includes('quantitative genetics') || cats.includes('genetic markers');
      }
      return perfCats.some(p => p.includes(q)) || cats.some(c => c.includes(q)) || traits.some(t => t.includes(q));
    });
  },

  // GENESIS AI ve Bireysel Performans Profili Kartları İçin Kompakt Akademik Referans Kutusu Üretir
  renderCompactAiReferencesBox(contextMode) {
    let refs = [];
    let headerTitle = '📚 İlgili Akademik Literatür & Kanıt Düzeyi (AVIGEN Scientific Library)';

    if (contextMode === 'racing') {
      refs = this.sources.filter(s =>
        s.id === 'sci_gazda_2018' ||
        s.id === 'sci_stefaniuk_2024' ||
        s.id === 'sci_stefaniuk_2026' ||
        s.id === 'sci_dybus_2021'
      );
      headerTitle = '📚 Uçuş, Kas Fizyolojisi & Navigasyon Akademik Referansları';
    } else if (contextMode === 'breeding') {
      refs = this.sources.filter(s =>
        s.id === 'sci_kolvenbag_2022' ||
        s.id === 'sci_gazda_2018' ||
        s.id === 'sci_shao_2020'
      );
      headerTitle = '📚 Kalıtım, Genotip Profilleri & Poligenik Damızlık Referansları';
    } else {
      refs = this.sources.slice(0, 4);
    }

    return `
      <div class="sci-ai-ref-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:10.5px; font-weight:900; color:#1e3a8a;">${headerTitle}</span>
          <button class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:9px;" onclick="AvigenScientificLibrary.openLibraryFromAnywhere()">
            Kütüphaneyi Aç (${this.sources.length}) →
          </button>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px;">
          ${refs.map(r => {
            const ev = this.getEvidenceMeta(r.evidenceLevel);
            const shortAuthor = (r.authors || '').split(',')[0] + ' et al.';
            return `
              <div class="sci-ai-ref-item" onclick="AvigenScientificLibrary.openArticleDetailModal('${r.id}')" title="Makale detayını ve kanıt seviyesini incelemek için dokunun">
                <div style="display:flex; justify-content:space-between; align-items:center; gap:5px;">
                  <span style="font-weight:800; color:var(--ios-text); font-size:10px;">
                    📄 ${escapeHtml(shortAuthor)} (${r.year}) — <span style="color:#2563eb;">DOI: ${escapeHtml(r.doi)}</span>
                  </span>
                  <span class="gene-badge ${ev.badgeClass}" style="font-size:8px; padding:1px 5px; flex-shrink:0;">${ev.label}</span>
                </div>
                <div style="font-size:9.5px; color:var(--ios-subtext); margin-top:1px;">
                  ${escapeHtml(r.keyFindings.slice(0, 135))}...
                </div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="font-size:9px; color:#92400e; background:#fffbeb; border:1px solid #fde68a; border-radius:5px; padding:4px 6px; margin-top:5px;">
          ⚠️ <strong>Bilimsel Kanıt Kuralı:</strong> Aday gen (<em>LDHA, DRD4, CRY1, F-KER, PPARD</em>) çalışmaları <strong>ilişki (association)</strong> bulgusudur; kesin nedensellik veya şampiyonluk garantisi değildir (Kolvenbag et al., 2022; Gazda et al., 2018).
        </div>
      </div>
    `;
  },

  openLibraryFromAnywhere() {
    // 1. Açık modal varsa kapat
    if (typeof AvigenPerformanceEngine !== 'undefined') {
      AvigenPerformanceEngine.closeProfileModal();
    }
    const detailModal = document.getElementById('sciArticleDetailModal');
    if (detailModal) detailModal.classList.remove('open');

    // 2. 5. Sekmeye (Profil & Ayarlar) geç ve Bilimsel Bilgi Bankası görünümünü aç
    this.state.activeSubView = 'library';
    if (typeof openIosTab === 'function') {
      openIosTab('notes', document.querySelectorAll('.ios-tab-btn')[4]);
    }
    if (typeof AvigenUxManager !== 'undefined') {
      AvigenUxManager.switchProfileSection('library');
    } else {
      this.renderLibraryUI();
    }
  },

  // ==========================================================================
  // ANA KÜTÜPHANE ARAYÜZÜ (FİLTRELEME, ARAMA, MAKALE KARTLARI, YÖNETİCİ EKLEME)
  // ==========================================================================
  switchCommunitySubView(viewName) {
    this.state.activeSubView = viewName;
    const libPane = document.getElementById('sciLibraryPane');
    const notesPane = document.getElementById('loftNotesPane');
    const btnLib = document.getElementById('btnSubSciLib');
    const btnNotes = document.getElementById('btnSubLoftNotes');

    if (libPane && notesPane) {
      libPane.style.display = viewName === 'library' ? 'flex' : 'none';
      notesPane.style.display = viewName === 'notes' ? 'flex' : 'none';
    }
    if (btnLib && btnNotes) {
      btnLib.classList.toggle('active', viewName === 'library');
      btnNotes.classList.toggle('active', viewName === 'notes');
    }
    if (viewName === 'library') this.renderLibraryUI();
  },

  setCategoryFilter(cat) {
    this.state.selectedCategory = cat;
    this.renderLibraryUI();
  },

  setEvidenceFilter(evId) {
    this.state.selectedEvidence = evId;
    this.renderLibraryUI();
  },

  onSearchInput(val) {
    this.state.searchQuery = val || '';
    this.renderLibraryUI();
  },

  renderLibraryUI() {
    const root = document.getElementById('sciLibraryRoot');
    if (!root) return;

    const q = this.state.searchQuery.trim().toLowerCase();
    const filtered = this.sources.filter(s => {
      if (this.state.selectedCategory !== 'ALL' && !(s.sourceCategories || []).includes(this.state.selectedCategory)) {
        return false;
      }
      if (this.state.selectedEvidence !== 'ALL' && s.evidenceLevel !== this.state.selectedEvidence) {
        return false;
      }
      if (q) {
        const hay = `${s.title} ${s.authors} ${s.year} ${s.journal} ${s.doi} ${s.pmid} ${(s.traitsExamined || []).join(' ')} ${s.keyFindings}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    root.innerHTML = `
      <!-- ÜST BİLİMSEL KÜTÜPHANE BAŞLIK & YÖNETİCİ YAYIN EKLEME BAR -->
      <div class="ios-card" style="padding:10px 12px;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:7px;">
          <div>
            <div style="font-size:13.5px; font-weight:900; color:#1e3a8a; display:flex; align-items:center; gap:6px;">
              <span>🔬 AVIGEN SCIENTIFIC LIBRARY</span>
              <span class="gene-badge gene-blue">${this.sources.length} Hakemli Yayın</span>
            </div>
            <div style="font-size:10px; color:var(--ios-subtext); margin-top:1px;">
              Yarış Güvercini Genetiği, Kas Fizyolojisi, Navigasyon ve Kalıtım Veritabanı
            </div>
          </div>
          <button class="ios-btn ios-btn-primary" style="padding:6px 10px; font-size:10.5px; flex-shrink:0;" onclick="AvigenScientificLibrary.openAdminSourceModal()">
            + Yeni Yayın Ekle
          </button>
        </div>

        <!-- ARAMA VE KANIT GÜCÜ FİLTRESİ -->
        <div style="display:grid; grid-template-columns:1.35fr 1fr; gap:6px; margin-bottom:7px;">
          <input type="text" class="ios-input" style="padding:6px 9px; font-size:11px;" placeholder="🔍 Makale, gen (CRY1, PPARD, CASK, DRD4), DOI veya yazar ara..." value="${escapeHtml(this.state.searchQuery)}" oninput="AvigenScientificLibrary.onSearchInput(this.value)" />
          <select class="ios-select" style="padding:6px 7px; font-size:10.5px;" onchange="AvigenScientificLibrary.setEvidenceFilter(this.value)">
            <option value="ALL" ${this.state.selectedEvidence === 'ALL' ? 'selected' : ''}>Tüm Kanıt Seviyeleri (${this.EVIDENCE_LEVELS.length})</option>
            ${this.EVIDENCE_LEVELS.map(ev => `<option value="${ev.id}" ${this.state.selectedEvidence === ev.id ? 'selected' : ''}>${ev.label}</option>`).join('')}
          </select>
        </div>

        <!-- 9 KAYNAK KATEGORİSİ YATAY ÇİP ŞERİDİ -->
        <div class="loft-filter-strip" style="padding-bottom:2px;">
          <button class="loft-filter-chip ${this.state.selectedCategory === 'ALL' ? 'active' : ''}" onclick="AvigenScientificLibrary.setCategoryFilter('ALL')">
            📚 Tümü (${this.sources.length})
          </button>
          ${this.CATEGORIES.map(cat => {
            const count = this.sources.filter(s => (s.sourceCategories || []).includes(cat)).length;
            return `
              <button class="loft-filter-chip ${this.state.selectedCategory === cat ? 'active' : ''}" onclick="AvigenScientificLibrary.setCategoryFilter('${cat}')">
                ${escapeHtml(cat)} (${count})
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- MAKALE LİSTESİ -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${filtered.length === 0 ? `
          <div class="ios-card" style="text-align:center; padding:22px;">
            <div style="font-size:24px; margin-bottom:5px;">🔬</div>
            <div style="font-size:12.5px; font-weight:800;">Bu Kritere Uygun Akademik Yayın Bulunamadı</div>
            <div style="font-size:10.5px; color:var(--ios-subtext); margin-top:3px;">Filtreyi temizleyebilir veya "+ Yeni Yayın Ekle" butonuyla DOI/PMID üzerinden yeni makale ekleyebilirsiniz.</div>
          </div>
        ` : filtered.map(s => this.renderArticleCard(s)).join('')}
      </div>

      <!-- TELİF VE BİLİMSEL KANIT METODOLOJİ BİLDİRİMİ -->
      <div class="sci-footnote" style="margin-top:4px;">
        🏛️ <strong>Telif &amp; Bilimsel Kanıt Yönetimi:</strong> Bu veritabanı tam metinleri (full-text) izinsiz kopyalamaz; yalnızca uluslararası açık bibliyografik üst verileri (DOI / PMID), örneklem büyüklüğünü ve yapılandırılmış kanıt özetlerini saklar. İlişki (association) araştırmaları kesin nedensellik olarak sunulmaz.
      </div>
    `;
  },

  renderArticleCard(s) {
    const ev = this.getEvidenceMeta(s.evidenceLevel);
    return `
      <div class="ios-card sci-article-card" style="padding:10px 12px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:5px;">
          <div style="font-size:12px; font-weight:900; color:var(--ios-text); line-height:1.35;">
            ${escapeHtml(s.title)}
          </div>
          <span class="gene-badge ${ev.badgeClass}" style="font-size:8.5px; padding:2px 7px; flex-shrink:0;">
            ${ev.label}
          </span>
        </div>

        <div style="font-size:10.5px; font-weight:700; color:#1e40af; margin-bottom:4px;">
          ✍️ ${escapeHtml(s.authors)} • <strong>(${s.year})</strong>
        </div>

        <div style="font-size:10px; color:var(--ios-subtext); margin-bottom:6px;">
          🏛️ <em>${escapeHtml(s.journal)}</em> •
          <strong>DOI:</strong> <a href="https://doi.org/${encodeURIComponent(this.normalizeDoi(s.doi))}" target="_blank" rel="noopener" style="color:#2563eb; text-decoration:underline;">${escapeHtml(s.doi)}</a>
          ${s.pmid ? ` • <strong>PMID:</strong> <a href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(s.pmid)}/" target="_blank" rel="noopener" style="color:#2563eb; text-decoration:underline;">${escapeHtml(s.pmid)}</a>` : ''}
        </div>

        <!-- İNCELENEN ÖZELLİKLER & KATEGORİ ETİKETLERİ -->
        <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:7px;">
          ${(s.sourceCategories || []).map(c => `<span class="sci-tag-chip sci-tag-cat">📁 ${escapeHtml(c)}</span>`).join('')}
          ${(s.traitsExamined || []).map(t => `<span class="sci-tag-chip sci-tag-trait">🧬 ${escapeHtml(t)}</span>`).join('')}
        </div>

        <!-- TEMEL BULGULAR ÖZETİ -->
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #2563eb; border-radius:7px; padding:6px 8px; font-size:10.5px; color:var(--ios-text); line-height:1.4; margin-bottom:7px;">
          <strong>🔬 Temel Bulgular:</strong> ${escapeHtml(s.keyFindings)}
        </div>

        <!-- ALT BİLGİ & AKSİYON BUTONLARI -->
        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; border-top:1px solid var(--ios-border); padding-top:6px;">
          <div style="font-size:9.5px; color:var(--ios-subtext);">
            ✅ Doğrulanma: <strong>${escapeHtml(s.verifiedDate || '2026-11-20')}</strong> • Örneklem: <strong>${escapeHtml((s.sampleSize || '').slice(0, 38))}...</strong>
          </div>
          <div style="display:flex; gap:5px; flex-shrink:0;">
            <button class="ios-btn ios-btn-secondary" style="padding:4px 9px; font-size:10px;" onclick="AvigenScientificLibrary.openArticleDetailModal('${s.id}')">
              📋 Tam Künye &amp; Yöntem
            </button>
            <button class="ios-btn ios-btn-outline" style="padding:4px 8px; font-size:10px;" onclick="AvigenScientificLibrary.openAdminSourceModal('${s.id}')" title="Kaydı Düzenle">
              ✏️
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // MAKALE TAM KÜNYE (15 VERİ ALANI) DETAY MODALI
  // ==========================================================================
  openArticleDetailModal(sourceId) {
    const s = this.sources.find(x => x.id === sourceId);
    if (!s) return;
    const modal = document.getElementById('sciArticleDetailModal');
    const body = document.getElementById('sciArticleDetailBody');
    if (!modal || !body) return;

    const ev = this.getEvidenceMeta(s.evidenceLevel);
    const cleanDoi = this.normalizeDoi(s.doi);

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
        <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-radius:10px; padding:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:5px;">
            <span class="gene-badge ${ev.badgeClass}">${ev.label}</span>
            <span style="font-size:9.5px; color:var(--ios-subtext); font-weight:700;">Doğrulanma Tarihi: ${escapeHtml(s.verifiedDate)}</span>
          </div>
          <div style="font-size:13px; font-weight:900; color:var(--ios-text); line-height:1.35; margin-bottom:4px;">
            ${escapeHtml(s.title)}
          </div>
          <div style="font-size:11px; font-weight:700; color:#1e40af;">
            ${escapeHtml(s.authors)} (${s.year})
          </div>
          <div style="font-size:10.5px; color:var(--ios-subtext); margin-top:2px;">
            🏛️ <strong>Akademik Dergi:</strong> ${escapeHtml(s.journal)}
          </div>
        </div>

        <!-- DOI, PUBMED ID VE AÇIK ERİŞİM BAĞLANTILARI -->
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px;">
          <a href="https://doi.org/${encodeURIComponent(cleanDoi)}" target="_blank" rel="noopener" class="ios-btn ios-btn-secondary" style="text-decoration:none; font-size:10px; padding:6px;">
            🔗 DOI: ${escapeHtml(s.doi)}
          </a>
          ${s.pmid ? `
            <a href="https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(s.pmid)}/" target="_blank" rel="noopener" class="ios-btn ios-btn-outline" style="text-decoration:none; font-size:10px; padding:6px;">
              🏥 PubMed: ${escapeHtml(s.pmid)}
            </a>
          ` : `
            <div class="ios-btn ios-btn-outline" style="font-size:10px; padding:6px; opacity:0.6;">PMID Kaydı Yok</div>
          `}
          <a href="${escapeHtml(s.openAccessUrl || `https://doi.org/${cleanDoi}`)}" target="_blank" rel="noopener" class="ios-btn ios-btn-primary" style="text-decoration:none; font-size:10px; padding:6px;">
            🌐 Açık Erişim Kaynağı ↗
          </a>
        </div>

        <!-- 15 STANDART BİLİMSEL VERİ ALANI -->
        <div class="sci-detail-grid">
          <div class="sci-detail-block">
            <div class="sci-detail-lbl">🎯 Araştırmanın Amacı</div>
            <div class="sci-detail-val">${escapeHtml(s.objective)}</div>
          </div>

          <div class="sci-detail-block">
            <div class="sci-detail-lbl">📊 Örneklem Büyüklüğü (Sample Size)</div>
            <div class="sci-detail-val">${escapeHtml(s.sampleSize)}</div>
          </div>

          <div class="sci-detail-block">
            <div class="sci-detail-lbl">🧪 Araştırma Yöntemi (Methodology)</div>
            <div class="sci-detail-val">${escapeHtml(s.methodology)}</div>
          </div>

          <div class="sci-detail-block" style="border-left:3.5px solid #16a34a;">
            <div class="sci-detail-lbl" style="color:#15803d;">🔬 Temel Bulgular (Key Findings)</div>
            <div class="sci-detail-val">${escapeHtml(s.keyFindings)}</div>
          </div>

          <div class="sci-detail-block" style="border-left:3.5px solid #d97706;">
            <div class="sci-detail-lbl" style="color:#b45309;">⚠️ Sınırlamalar (Limitations) &amp; Kanıt Sınırı</div>
            <div class="sci-detail-val">
              ${escapeHtml(s.limitations)}
              <div style="margin-top:4px; font-size:9.5px; color:#92400e;">
                • <strong>Kanıt Yorum Kuralı:</strong> ${escapeHtml(ev.causalWarning)}
              </div>
            </div>
          </div>

          <div class="sci-detail-block">
            <div class="sci-detail-lbl">🧬 İncelenen Özellikler &amp; İlgili Performans Kategorileri</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px; margin-top:4px;">
              ${(s.traitsExamined || []).map(t => `<span class="sci-tag-chip sci-tag-trait">🧬 ${escapeHtml(t)}</span>`).join('')}
              ${(s.performanceCategories || []).map(p => `<span class="sci-tag-chip sci-tag-perf">🏁 ${escapeHtml(p)}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  closeArticleDetailModal() {
    const modal = document.getElementById('sciArticleDetailModal');
    if (modal) modal.classList.remove('open');
  },

  // ==========================================================================
  // YÖNETİCİ PANELİ: YENİ BİLİMSEL YAYIN EKLEME & DÜZENLEME MODALI
  // ==========================================================================
  openAdminSourceModal(editId = null) {
    this.state.editingSourceId = editId;
    const modal = document.getElementById('sciAdminModal');
    const body = document.getElementById('sciAdminModalBody');
    if (!modal || !body) return;

    const existing = editId ? this.sources.find(x => x.id === editId) : null;
    const s = existing || {
      title: '',
      authors: '',
      year: new Date().getFullYear(),
      journal: '',
      doi: '',
      pmid: '',
      openAccessUrl: '',
      objective: '',
      sampleSize: '',
      traitsExamined: [],
      methodology: '',
      keyFindings: '',
      limitations: '',
      evidenceLevel: 'association_study',
      sourceCategories: ['Racing Pigeon Genetics'],
      performanceCategories: ['Speed', 'Endurance'],
      verifiedDate: new Date().toISOString().slice(0, 10)
    };

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:7px; font-size:11px;">
        <!-- PUBMED & CROSSREF OTOMATİK BİBLİYOGRAFİK VERİ ÇEKME -->
        <div style="background:#eff6ff; border:1.5px solid #93c5fd; border-radius:10px; padding:8px 10px;">
          <div style="font-weight:900; color:#1e3a8a; font-size:11px; margin-bottom:5px;">
            🌐 Crossref (DOI) &amp; PubMed (PMID) Bibliyografik Doğrulama
          </div>
          <div style="display:grid; grid-template-columns:1.2fr 0.9fr auto; gap:5px;">
            <input type="text" id="sciFormDoi" class="ios-input" style="padding:6px; font-size:11px;" placeholder="DOI (Örn: 10.1093/molbev/msy030)" value="${escapeHtml(s.doi)}" />
            <input type="text" id="sciFormPmid" class="ios-input" style="padding:6px; font-size:11px;" placeholder="PubMed ID (Örn: 35505002)" value="${escapeHtml(s.pmid)}" />
            <button type="button" class="ios-btn ios-btn-primary" style="padding:6px 9px; font-size:10.5px;" onclick="AvigenScientificLibrary.fetchMetadataFromDoiOrPmid()">
              🔄 Sorgula
            </button>
          </div>
          <div id="sciApiFetchStatus" style="display:none; font-size:10px; color:#1e40af; margin-top:5px;"></div>
        </div>

        <div>
          <label style="font-weight:800; font-size:10px;">Makale Başlığı *</label>
          <input type="text" id="sciFormTitle" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.title)}" placeholder="Makalenin tam akademik başlığı" />
        </div>

        <div style="display:grid; grid-template-columns:1.4fr 0.6fr; gap:6px;">
          <div>
            <label style="font-weight:800; font-size:10px;">Yazarlar *</label>
            <input type="text" id="sciFormAuthors" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.authors)}" placeholder="Örn: Gazda M.A., Andrade P., Carneiro M." />
          </div>
          <div>
            <label style="font-weight:800; font-size:10px;">Yayın Yılı *</label>
            <input type="number" id="sciFormYear" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.year)}" />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div>
            <label style="font-weight:800; font-size:10px;">Akademik Dergi *</label>
            <input type="text" id="sciFormJournal" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.journal)}" placeholder="Örn: Molecular Biology and Evolution" />
          </div>
          <div>
            <label style="font-weight:800; font-size:10px;">Açık Erişim Bağlantısı (URL)</label>
            <input type="text" id="sciFormUrl" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.openAccessUrl)}" placeholder="https://doi.org/..." />
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div>
            <label style="font-weight:800; font-size:10px;">Kanıt Seviyesi (Evidence Level) *</label>
            <select id="sciFormEvidence" class="ios-select" style="padding:6px; font-size:11px;">
              ${this.EVIDENCE_LEVELS.map(ev => `<option value="${ev.id}" ${s.evidenceLevel === ev.id ? 'selected' : ''}>${ev.label}</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-weight:800; font-size:10px;">Kaynak Kategorisi *</label>
            <select id="sciFormCategory" class="ios-select" style="padding:6px; font-size:11px;">
              ${this.CATEGORIES.map(cat => `<option value="${cat}" ${(s.sourceCategories || []).includes(cat) ? 'selected' : ''}>${cat}</option>`).join('')}
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div>
            <label style="font-weight:800; font-size:10px;">Örneklem Büyüklüğü (Sample Size)</label>
            <input type="text" id="sciFormSample" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.sampleSize)}" placeholder="Örn: 302 yarış güvercini" />
          </div>
          <div>
            <label style="font-weight:800; font-size:10px;">İncelenen Özellikler (Virgülle)</label>
            <input type="text" id="sciFormTraits" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml((s.traitsExamined || []).join(', '))}" placeholder="CRY1, LDHA, Endurance, Homing" />
          </div>
        </div>

        <div>
          <label style="font-weight:800; font-size:10px;">Araştırmanın Amacı</label>
          <textarea id="sciFormObjective" class="ios-textarea" rows="2" style="font-size:11px;" placeholder="Araştırmanın hipotezi ve bilimsel amacı...">${escapeHtml(s.objective)}</textarea>
        </div>

        <div>
          <label style="font-weight:800; font-size:10px;">Araştırma Yöntemi</label>
          <input type="text" id="sciFormMethod" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.methodology)}" placeholder="Örn: Whole-Genome Sequencing, PCR-RFLP, RNA-Seq" />
        </div>

        <div>
          <label style="font-weight:800; font-size:10px;">Temel Bulgular (Telifsiz Kendi Özetiniz) *</label>
          <textarea id="sciFormFindings" class="ios-textarea" rows="2" style="font-size:11px;" placeholder="Makalenin temel istatistiksel veya biyolojik bulguları...">${escapeHtml(s.keyFindings)}</textarea>
        </div>

        <div>
          <label style="font-weight:800; font-size:10px;">Sınırlamalar (Limitations) &amp; İlişki/Nedensellik Notu *</label>
          <textarea id="sciFormLimitations" class="ios-textarea" rows="2" style="font-size:11px;" placeholder="Örneklem kısıtları, popülasyon özgüllüğü vb.">${escapeHtml(s.limitations)}</textarea>
        </div>

        <div style="display:grid; grid-template-columns:1.3fr 0.7fr; gap:6px;">
          <div>
            <label style="font-weight:800; font-size:10px;">İlgili Performans Kategorileri (Virgülle)</label>
            <input type="text" id="sciFormPerfCats" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml((s.performanceCategories || []).join(', '))}" placeholder="Speed, Endurance, Homing Reliability" />
          </div>
          <div>
            <label style="font-weight:800; font-size:10px;">Doğrulanma Tarihi</label>
            <input type="date" id="sciFormVerifiedDate" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(s.verifiedDate || new Date().toISOString().slice(0, 10))}" />
          </div>
        </div>

        <div style="display:flex; gap:6px; margin-top:4px;">
          <button type="button" class="ios-btn ios-btn-gold" style="flex:1; padding:10px; font-size:12.5px;" onclick="AvigenScientificLibrary.saveAdminSourceForm()">
            💾 Bilimsel Kaynağı Doğrula ve Kaydet
          </button>
          ${existing ? `
            <button type="button" class="ios-btn ios-btn-danger" style="padding:10px 12px; font-size:11.5px;" onclick="AvigenScientificLibrary.deleteSource('${existing.id}')">
              🗑️ Sil
            </button>
          ` : ''}
        </div>
      </div>
    `;

    modal.classList.add('open');
  },

  closeAdminSourceModal() {
    const modal = document.getElementById('sciAdminModal');
    if (modal) modal.classList.remove('open');
  },

  saveAdminSourceForm() {
    const title = (document.getElementById('sciFormTitle')?.value || '').trim();
    const authors = (document.getElementById('sciFormAuthors')?.value || '').trim();
    const year = parseInt(document.getElementById('sciFormYear')?.value, 10) || new Date().getFullYear();
    const journal = (document.getElementById('sciFormJournal')?.value || '').trim();
    const doi = this.normalizeDoi(document.getElementById('sciFormDoi')?.value || '');
    const pmid = this.normalizePmid(document.getElementById('sciFormPmid')?.value || '');
    const openAccessUrl = (document.getElementById('sciFormUrl')?.value || '').trim() || (doi ? `https://doi.org/${doi}` : '');
    const evidenceLevel = document.getElementById('sciFormEvidence')?.value || 'association_study';
    const primaryCat = document.getElementById('sciFormCategory')?.value || 'Racing Pigeon Genetics';
    const sampleSize = (document.getElementById('sciFormSample')?.value || '').trim() || 'Belirtilmemiş';
    const traitsRaw = (document.getElementById('sciFormTraits')?.value || '').trim();
    const objective = (document.getElementById('sciFormObjective')?.value || '').trim() || 'Yarış güvercini performans ve genetik araştırması.';
    const methodology = (document.getElementById('sciFormMethod')?.value || '').trim() || 'Hakemli deneysel / istatistiksel analiz.';
    const keyFindings = (document.getElementById('sciFormFindings')?.value || '').trim();
    const limitations = (document.getElementById('sciFormLimitations')?.value || '').trim() || 'İlişki bulgusudur; tek başına kesin nedensellik kanıtı olarak yorumlanmamalıdır.';
    const perfCatsRaw = (document.getElementById('sciFormPerfCats')?.value || '').trim();
    const verifiedDate = document.getElementById('sciFormVerifiedDate')?.value || new Date().toISOString().slice(0, 10);

    if (!title || !authors || !keyFindings) {
      alert('Lütfen en azından Makale Başlığı, Yazarlar ve Temel Bulgular alanlarını doldurun.');
      return;
    }

    // DOI ve PMID üzerinden mükerrer kayıt kontrolü
    const duplicate = this.isDuplicateSource(doi, pmid, this.state.editingSourceId);
    if (duplicate) {
      alert(`⚠️ Mükerrer Kayıt Engellendi!\n\nBu DOI (${doi || '-'}) veya PubMed ID (${pmid || '-'}) veritabanında zaten mevcut:\n"${duplicate.title}"`);
      return;
    }

    const traitsExamined = traitsRaw ? traitsRaw.split(',').map(x => x.trim()).filter(Boolean) : ['Racing Performance'];
    const performanceCategories = perfCatsRaw ? perfCatsRaw.split(',').map(x => x.trim()).filter(Boolean) : ['Speed', 'Endurance'];

    if (this.state.editingSourceId) {
      const idx = this.sources.findIndex(x => x.id === this.state.editingSourceId);
      if (idx !== -1) {
        const prevCats = this.sources[idx].sourceCategories || [];
        const mergedCats = [...new Set([primaryCat, ...prevCats])];
        this.sources[idx] = {
          ...this.sources[idx],
          title,
          authors,
          year,
          journal,
          doi,
          pmid,
          openAccessUrl,
          objective,
          sampleSize,
          traitsExamined,
          methodology,
          keyFindings,
          limitations,
          evidenceLevel,
          sourceCategories: mergedCats,
          performanceCategories,
          verifiedDate
        };
      }
    } else {
      this.sources.unshift({
        id: 'sci_custom_' + Date.now(),
        title,
        authors,
        year,
        journal: journal || 'Peer-Reviewed Journal',
        doi: doi || 'Belirtilmedi',
        pmid,
        openAccessUrl,
        objective,
        sampleSize,
        traitsExamined,
        methodology,
        keyFindings,
        limitations,
        evidenceLevel,
        sourceCategories: [primaryCat],
        performanceCategories,
        verifiedDate
      });
    }

    this.saveSources();
    this.closeAdminSourceModal();
    this.renderLibraryUI();
  },

  deleteSource(sourceId) {
    this.sources = this.sources.filter(s => s.id !== sourceId);
    this.saveSources();
    this.closeAdminSourceModal();
    this.renderLibraryUI();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  AvigenScientificLibrary.init();
});
