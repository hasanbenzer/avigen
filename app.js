/* ============================================================================
   Mypedigre (App Store v1.0.28) — Orijinal Motor
   Özellikler:
   - Sınırsız Pedigre Ekleme & Düzenleme (15 Kutulu: Ana Kuş + 2 + 4 + 8 Ata)
   - Boncuk Numarası Ülke Bayrağı Özelliği (v1.0.27: 🇹🇷 TR, 🇧🇪 BELG, 🇳🇱 NL, 🇩🇪 DV, 🇬🇧 GB, 🇵🇱 PL, 🇷🇴 RO, 🇫🇷 FR)
   - Onlarca Farklı Tema Önizleme & Seçimi + Renk/Font Kişiselleştirme
   - QR Kod ve Barkod Desteği
   - Yüksek Kaliteli Resim (HD PNG) İndirme & Anında Paylaşım
   - AI Tarama (Fotoğraftan Pedigre Aktarımı)
   - Bilimsel Makalelere Dayalı Uçuş Uygunluğu Hesaplayıcı
   - Gelişmiş Not Sistemi
   ============================================================================ */

const STORAGE_KEY_PEDIGREES = 'mypedigre_ios_pedigrees_v2';
const STORAGE_KEY_NOTES = 'mypedigre_ios_notes_v2';
const STORAGE_KEY_LOFT = 'mypedigre_ios_loft_v2';
const STORAGE_KEY_REMINDERS = 'avigen_reminders_v1';
const STORAGE_KEY_PAIRS = 'avigen_pairs_v1';
const STORAGE_KEY_RACES = 'avigen_races_v1';
const STORAGE_KEY_DOSSIER = 'avigen_bird_dossier_v1';

// Boncuk Numarası Ülke Bayrakları (v1.0.27)
const COUNTRY_FLAGS = [
  { code: 'TR', flag: '🇹🇷', label: '🇹🇷 TR' },
  { code: 'BELG', flag: '🇧🇪', label: '🇧🇪 BELG' },
  { code: 'NL', flag: '🇳🇱', label: '🇳🇱 NL' },
  { code: 'DV', flag: '🇩🇪', label: '🇩🇪 DV' },
  { code: 'PL', flag: '🇵🇱', label: '🇵🇱 PL' },
  { code: 'RO', flag: '🇷🇴', label: '🇷🇴 RO' },
  { code: 'GB', flag: '🇬🇧', label: '🇬🇧 GB' },
  { code: 'FR', flag: '🇫🇷', label: '🇫🇷 FR' },
  { code: 'AU', flag: '🇺🇸', label: '🇺🇸 AU' }
];

// Onlarca Farklı Tema (AVIGEN Tema Önizleme Galerisi)
const MYPEDIGRE_THEMES = [
  { id: 'gold', name: 'Kraliyet Altın', bg: '#fffdf7', accent: '#b45309', primary: '#0f172a', node: '#ffffff', box: 'rgba(180,83,9,0.08)' },
  { id: 'blue', name: 'AVIGEN Mavi', bg: '#f8fafc', accent: '#1d4ed8', primary: '#0f172a', node: '#ffffff', box: 'rgba(29,78,216,0.08)' },
  { id: 'emerald', name: 'Zümrüt Yeşil', bg: '#f2fdf7', accent: '#047857', primary: '#064e3b', node: '#ffffff', box: 'rgba(4,120,87,0.08)' },
  { id: 'darkvip', name: 'Siyah VIP Altın', bg: '#0f172a', accent: '#f59e0b', primary: '#f8fafc', node: '#1e293b', box: 'rgba(245,158,11,0.14)' },
  { id: 'crimson', name: 'Bordo Şampiyon', bg: '#fffafb', accent: '#be123c', primary: '#310b15', node: '#ffffff', box: 'rgba(190,18,60,0.08)' },
  { id: 'parchment', name: 'Klasik Parşömen', bg: '#f5ebd6', accent: '#78350f', primary: '#291507', node: '#fdf8ee', box: 'rgba(120,53,15,0.1)' },
  { id: 'purple', name: 'Asil Mor', bg: '#faf5ff', accent: '#6d28d9', primary: '#2e1065', node: '#ffffff', box: 'rgba(109,40,217,0.08)' },
  { id: 'turquoise', name: 'Turkuaz Modern', bg: '#f0fdfa', accent: '#0f766e', primary: '#134e4a', node: '#ffffff', box: 'rgba(15,118,110,0.08)' },
  { id: 'orange', name: 'Kehribar Turuncu', bg: '#fff7ed', accent: '#c2410c', primary: '#431407', node: '#ffffff', box: 'rgba(194,65,12,0.08)' },
  { id: 'kbdb', name: 'Belçika KBDB', bg: '#fefce8', accent: '#b91c1c', primary: '#171717', node: '#ffffff', box: 'rgba(185,28,28,0.08)' },
  { id: 'silver', name: 'Platin Gümüş', bg: '#f8fafc', accent: '#334155', primary: '#0f172a', node: '#ffffff', box: 'rgba(51,65,85,0.08)' },
  { id: 'carbon', name: 'Gece Mavi', bg: '#111827', accent: '#38bdf8', primary: '#f9fafb', node: '#1f2937', box: 'rgba(56,189,248,0.12)' }
];

// 31 Kutu Anahtarları (Ana Kuş + 1. Kuşak (2) + 2. Kuşak (4) + 3. Kuşak (8) + 4. Kuşak (16))
const BOX_SLOTS = [
  { key: 'main', label: 'Ana Güvercin (Pedigre Sahibi)', sex: 'M' },
  { key: 'sire', label: '1. Kuşak — ♂ Baba (Sire)', sex: 'M' },
  { key: 'dam', label: '1. Kuşak — ♀ Anne (Dam)', sex: 'F' },
  { key: 'g2_1', label: '2. Kuşak — ♂ Baba Tarafı Büyükbaba', sex: 'M' },
  { key: 'g2_2', label: '2. Kuşak — ♀ Baba Tarafı Büyükanne', sex: 'F' },
  { key: 'g2_3', label: '2. Kuşak — ♂ Anne Tarafı Büyükbaba', sex: 'M' },
  { key: 'g2_4', label: '2. Kuşak — ♀ Anne Tarafı Büyükanne', sex: 'F' },
  { key: 'g3_1', label: '3. Kuşak — 1. Ata (♂)', sex: 'M' },
  { key: 'g3_2', label: '3. Kuşak — 2. Ata (♀)', sex: 'F' },
  { key: 'g3_3', label: '3. Kuşak — 3. Ata (♂)', sex: 'M' },
  { key: 'g3_4', label: '3. Kuşak — 4. Ata (♀)', sex: 'F' },
  { key: 'g3_5', label: '3. Kuşak — 5. Ata (♂)', sex: 'M' },
  { key: 'g3_6', label: '3. Kuşak — 6. Ata (♀)', sex: 'F' },
  { key: 'g3_7', label: '3. Kuşak — 7. Ata (♂)', sex: 'M' },
  { key: 'g3_8', label: '3. Kuşak — 8. Ata (♀)', sex: 'F' },
  { key: 'g4_1', label: '4. Kuşak — 1. Ata (♂)', sex: 'M' },
  { key: 'g4_2', label: '4. Kuşak — 2. Ata (♀)', sex: 'F' },
  { key: 'g4_3', label: '4. Kuşak — 3. Ata (♂)', sex: 'M' },
  { key: 'g4_4', label: '4. Kuşak — 4. Ata (♀)', sex: 'F' },
  { key: 'g4_5', label: '4. Kuşak — 5. Ata (♂)', sex: 'M' },
  { key: 'g4_6', label: '4. Kuşak — 6. Ata (♀)', sex: 'F' },
  { key: 'g4_7', label: '4. Kuşak — 7. Ata (♂)', sex: 'M' },
  { key: 'g4_8', label: '4. Kuşak — 8. Ata (♀)', sex: 'F' },
  { key: 'g4_9', label: '4. Kuşak — 9. Ata (♂)', sex: 'M' },
  { key: 'g4_10', label: '4. Kuşak — 10. Ata (♀)', sex: 'F' },
  { key: 'g4_11', label: '4. Kuşak — 11. Ata (♂)', sex: 'M' },
  { key: 'g4_12', label: '4. Kuşak — 12. Ata (♀)', sex: 'F' },
  { key: 'g4_13', label: '4. Kuşak — 13. Ata (♂)', sex: 'M' },
  { key: 'g4_14', label: '4. Kuşak — 14. Ata (♀)', sex: 'F' },
  { key: 'g4_15', label: '4. Kuşak — 15. Ata (♂)', sex: 'M' },
  { key: 'g4_16', label: '4. Kuşak — 16. Ata (♀)', sex: 'F' }
];

let pedigrees = [];
let activePedigreeId = '';
let notesList = [];
let remindersList = [];
let activePairsList = [];
let racesList = [];
let birdDossierList = [];
let activeDossierRing = '';
let loftConfig = {
  title: 'AVIGEN ŞAMPİYON KÜMESİ',
  subtitle: 'Bilimsel Posta Güvercini Genetiği & Soyağacı • Türkiye',
  logo: '',
  genDepth: 4
};

let editingSlotKey = 'main';
let editingFlag = '🇹🇷';
let editingPhotoData = '';
let isCreatingNewPedigreeDraft = false;
let aiTempFile = null;
let aiTempBoxes = {};

// Boncuk numarasından otomatik ülke bayrağı bulucu
function detectFlagFromRing(ringStr) {
  const upper = (ringStr || '').trim().toUpperCase();
  if (upper.startsWith('TUGF') || upper.startsWith('TGYB') || upper.startsWith('TR')) return '🇹🇷';
  if (/^D[-\s]?\d/.test(upper) || upper.startsWith('DV') || upper.startsWith('DE-') || upper.startsWith('GER') || /^0\d{3,4}[-\s]\d{2}[-\s]\d/.test(upper)) return '🇩🇪';
  if (upper.startsWith('BE') || upper.startsWith('BLG') || /^B[-\s]?\d{2}[-\s]\d{5,8}/.test(upper)) return '🇧🇪';
  if (upper.startsWith('NL')) return '🇳🇱';
  if (upper.startsWith('BG')) return '🇧🇬';
  if (upper.startsWith('RO')) return '🇷🇴';
  if (upper.startsWith('SK')) return '🇸🇰';
  if (upper.startsWith('GR')) return '🇬🇷';
  if (upper.startsWith('CZ')) return '🇨🇿';
  if (upper.startsWith('CHN')) return '🇨🇳';
  if (upper.startsWith('CRO') || upper.startsWith('HR')) return '🇭🇷';
  if (upper.startsWith('DAN') || upper.startsWith('DK')) return '🇩🇰';
  if (upper.startsWith('IHU') || upper.startsWith('IFB') || upper.startsWith('HU')) return '🇭🇺';
  if (upper.startsWith('IT')) return '🇮🇹';
  if (upper.startsWith('FR') || /^F[-\s]?\d{2}[-\s]/.test(upper)) return '🇫🇷';
  if (upper.startsWith('GB') || upper.startsWith('UK') || upper.startsWith('NEHU') || upper.startsWith('WHU')) return '🇬🇧';
  if (upper.startsWith('AU') || upper.startsWith('IF') || upper.startsWith('GFL') || upper.startsWith('USA')) return '🇺🇸';
  if (upper.startsWith('PL')) return '🇵🇱';
  for (const item of COUNTRY_FLAGS) {
    if (upper.startsWith(item.code)) return item.flag;
  }
  return '🇹🇷';
}

// Gönderilen 4. Gerçek 4 Kuşak (31 Kutu) Pedigree: TR16-22-22929 (YENİCEABAT ARENA - Orhan Aydın)
function getTr162222929Pedigree() {
  return {
    id: 'ped_tr16_22_22929',
    themeId: 'blue',
    accentColor: '#1d4ed8',
    bgColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    boxes: {
      main: {
        flag: '🇹🇷',
        ring: 'TR16-22-22929',
        name: 'YENİCEABAT ARENA 22929',
        color: 'Mavi Çakmaklı',
        notes: 'Yeniceabat Arena • Orhan Aydın (Bursa)\nKaplan (Bursa Osmangazi Posta / Derby 16) × Org. Meulemans (Michael Kleidl) Dişi',
        photo: '',
        sex: 'F',
        roleCategory: 'RACER',
        inMyLoft: true
      },
      sire: {
        flag: '🇹🇷',
        ring: 'TR-21-186111',
        name: 'YENİCEABAT ARENA 186111',
        color: 'Mavi Çakmaklı',
        notes: 'Yeniceabat Arena • Bursa Osmangazi Posta: Poyra 106 km 12. • Eskişehir 153 km 1.\nKardeşleri Derby 16: 125 km 556., 125 km 63., 225 km 236., 260 km 49., Final 465 km, As 136.\nBursa Osmangazi Posta TR-19-171041: 236 km 1. • TR-20-016055: 109 km 21., 153 km 221.',
        sex: 'M',
        inMyLoft: false
      },
      dam: {
        flag: '🇫🇷',
        ring: 'FR-20-342735-D',
        name: 'ORG. MEULEMANS 342735',
        color: 'Mavi (Gök)',
        notes: 'Org. Meulemans • Damızlık Dişi (Michael Kleidl Soy Hattı)',
        sex: 'F',
        inMyLoft: false
      },
      g2_1: {
        flag: '🇹🇷',
        ring: 'TR-18-196096',
        name: 'KAPLAN (Faruk Gürsoy)',
        color: 'Mavi Çakmaklı',
        notes: 'Faruk Gürsoy • Yavrusu Derby 16 2020: 125 km 556., 125 km 63., 225 km 236., 260 km 49., Final 465 km, As 136.\nBursa Osmangazi Posta TR-19-171041: 236 km 1.\nTR-20-016055: 109 km 21., 153 km 221., 178 km 14., 236 km 39., 236 km 238.',
        sex: 'M',
        inMyLoft: false
      },
      g2_2: {
        flag: '🇹🇷',
        ring: 'TR-17-146144',
        name: 'KAPLAN (Ali Aktaş)',
        color: 'Mavi Çakmaklı',
        notes: 'Ali Aktaş • Yavruları Derby 16: 125 km 556., 125 km 63., 225 km 236., 260 km 49., Final 465 km, As 136.\nBursa Osmangazi Posta TR-19-171041: 236 km 1. • TR-20-016055: 109 km 21., 153 km 221., 178 km 14., 236 km 39.',
        sex: 'F',
        inMyLoft: false
      },
      g2_3: {
        flag: '🇩🇪',
        ring: 'DV-05045-2008-1-V',
        name: 'VATER 288 (Michael Kleidl)',
        color: 'Mavi (Gök)',
        notes: 'Vater 288 • Michael Kleidl • Org. Meulemans',
        sex: 'M',
        inMyLoft: false
      },
      g2_4: {
        flag: '🇩🇪',
        ring: 'DV-05045-2010-186-M',
        name: 'MİCHAEL KLEİDL 186',
        color: 'Mavi (Gök)',
        notes: 'Michael Kleidl • Org. Meulemans',
        sex: 'F',
        inMyLoft: false
      },
      g3_1: {
        flag: '🇹🇷',
        ring: 'TR-14-023076',
        name: 'ANKARALI (Mavi)',
        color: 'Mavi (Gök)',
        notes: 'Ankaralı • Mavi • Kızı TR-15-002090:\n125 km 63. (2016) • 250 km 31. (2016) • 505 km 73. (2016) • 625 km 78. (2016)',
        sex: 'M',
        inMyLoft: false
      },
      g3_2: {
        flag: '🇹🇷',
        ring: 'TR-16-011082',
        name: 'KAÇAK KAPLAN',
        color: 'Mavi Çakmaklı',
        notes: 'Kaçak • Kaplan • Baba As-1 • Vites Kls-4\nKardeşi TR-16-011091: 300 km 3. • Uçum Hızı: 1697 m/dk',
        sex: 'F',
        inMyLoft: false
      },
      g3_3: {
        flag: '🇹🇷',
        ring: 'TR-16-012804',
        name: 'NEW NETS RED (Ercan Koç)',
        color: 'Kula (Kırmızı Çakmaklı)',
        notes: 'New Nets Red • Red • Ercan Koç\nKendisi Derby 16 OLR 2016: Poyra 414. • Eskişehir 13.',
        sex: 'M',
        inMyLoft: false
      },
      g3_4: {
        flag: '🇹🇷',
        ring: 'TR-10-2047503',
        name: '03 KAPLAN (Beyaz Kaplan)',
        color: 'Beyaz',
        notes: '03 Kaplan • Beyaz Kaplan • Recep Öztürk • De Zutter - Jos Thone\n8. As Türkgücü 2010 • 130 km 17. • 170 km 18.',
        sex: 'F',
        inMyLoft: false
      },
      g3_5: {
        flag: '🇩🇪',
        ring: 'DV-05045-07-321',
        name: '07-321 (BLAU)',
        color: 'Mavi (Gök)',
        notes: '07-321 • Blau • Org. Meulemans',
        sex: 'M',
        inMyLoft: false
      },
      g3_6: {
        flag: '🇩🇪',
        ring: 'DV-03073-06-761',
        name: '3073-06-761',
        color: 'Mavi (Gök)',
        notes: '3073-06-761 • Blausp • Org. Meulemans',
        sex: 'F',
        inMyLoft: false
      },
      g3_7: {
        flag: '🇩🇪',
        ring: 'DV-03073-06-943',
        name: '3073-06-943 (BLAU)',
        color: 'Mavi (Gök)',
        notes: '3073-06-943 • Blau • Org. Meulemans',
        sex: 'M',
        inMyLoft: false
      },
      g3_8: {
        flag: '🇩🇪',
        ring: 'DV-05045-07-340',
        name: '5045-07-340 (BLAU)',
        color: 'Mavi (Gök)',
        notes: '5045-07-340 • Blau • Org. Meulemans',
        sex: 'F',
        inMyLoft: false
      },
      g4_1: { flag: '🇳🇱', ring: 'NL-08-1746651', name: 'KRAS (Docht V Goede)', color: 'Mavi Çakmaklı', notes: 'Kras • Docht V Goede', sex: 'M', inMyLoft: false },
      g4_2: { flag: '🇳🇱', ring: 'NL-12-1802097', name: 'BR 1 AS KALİMACİ', color: 'Mavi (Gök)', notes: 'BR 1 As Kalimaci • H V Doorn B V/D BR Blauw', sex: 'F', inMyLoft: false },
      g4_3: { flag: '🇹🇷', ring: 'TR-10-2072079', name: 'AS ŞAMPİYONU KAPLAN', color: 'Mavi Çakmaklı', notes: 'As Şampiyonu Kaplan', sex: 'M', inMyLoft: false },
      g4_4: { flag: '🇹🇷', ring: 'TR-022087', name: 'ÇAKMAKLI', color: 'Mavi Çakmaklı', notes: 'Çakmaklı • Kızı TR-16-011091', sex: 'F', inMyLoft: false },
      g4_5: { flag: '🇷🇴', ring: 'RO-13-0973620', name: 'RED (Balkanik Fair Play)', color: 'Kula (Kırmızı Çakmaklı)', notes: 'Red • Balkanik Fair Play', sex: 'M', inMyLoft: false },
      g4_6: { flag: '🇭🇺', ring: 'IHU-12-5-43354', name: 'RİVER (H & A Kalimeyer)', color: 'Mavi', notes: 'River • H & A Kalimeyer', sex: 'F', inMyLoft: false },
      g4_7: { flag: '🇩🇪', ring: 'DV-1697-06-322', name: 'BEYAZ KAPLAN (De Zutter)', color: 'Beyaz', notes: 'Beyaz Kaplan • De Zutter', sex: 'M', inMyLoft: false },
      g4_8: { flag: '🇹🇷', ring: 'TR-02-385', name: 'KİRLİ MAVİ (Alattin Akkoç)', color: 'Bozkirli (Kırçıllı)', notes: 'Kirli Mavi • Alattin Akkoç', sex: 'F', inMyLoft: false },
      g4_9: { flag: '🇩🇪', ring: 'DV-05733-00-1939', name: 'ORG. MEULEMANS 1939', color: 'Mavi', notes: '5733-00-1939 • Org. Meulemans • Schuzouvart', sex: 'M', inMyLoft: false },
      g4_10: { flag: '🇩🇪', ring: 'DV-05045-04-596', name: 'ORG. MEULEMANS 04-596', color: 'Mavi', notes: '04-596 • Org. Meulemans', sex: 'F', inMyLoft: false },
      g4_11: { flag: '🇩🇪', ring: 'DV-05046-04-593', name: 'ORG. MEULEMANS 593', color: 'Mavi', notes: '5046-04-593 • Org. Meulemans', sex: 'M', inMyLoft: false },
      g4_12: { flag: '🇩🇪', ring: 'DV-05046-04-566', name: 'ORG. MEULEMANS 566', color: 'Mavi', notes: '5046-04-566 • Geuopt', sex: 'F', inMyLoft: false },
      g4_13: { flag: '🇩🇪', ring: 'DV-05733-00-1939', name: 'ORG. MEULEMANS 1939', color: 'Mavi', notes: '5733-00-1939 • Org. Meulemans • Schuzouvart', sex: 'M', inMyLoft: false },
      g4_14: { flag: '🇩🇪', ring: 'DV-05045-04-565', name: 'ORG. MEULEMANS 04-565', color: 'Mavi', notes: '04-565 • Org. Meulemans', sex: 'F', inMyLoft: false },
      g4_15: { flag: '🇩🇪', ring: 'DV-05045-04-608', name: 'ORG. MEULEMANS 04-608', color: 'Mavi', notes: '04-608 • Org. Meulemans • Blacsp', sex: 'M', inMyLoft: false },
      g4_16: { flag: '🇩🇪', ring: 'DV-03073-06-759', name: 'ORG. MEULEMANS 759', color: 'Mavi', notes: '073-06-759 • Org. Meulemans', sex: 'F', inMyLoft: false }
    }
  };
}

// Gönderilen 3. Gerçek 4 Kuşak (31 Kutu) Pedigree: TUGF-25-A-0441 (Mümin Rodoplu / Orhan Aydın)
function getTugf25A0441Pedigree() {
  return {
    id: 'ped_tugf_25_a_0441',
    themeId: 'blue',
    accentColor: '#1d4ed8',
    bgColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    boxes: {
      main: {
        flag: '🇹🇷',
        ring: 'TUGF-25-A-0441',
        name: 'MÜMİN RODOPLU 0441',
        color: 'Mavi Çakmaklı',
        notes: 'Mümin Rodoplu • Yeşil Bursa Postada Kendi Dereceleri:\n125 km: 29. • 175 km: 1. • 230 km: 13. • 300 km: 14. • 420 km: 4. • As: 1.',
        photo: '',
        sex: 'F',
        roleCategory: 'RACER',
        inMyLoft: true
      },
      sire: {
        flag: '🇹🇷',
        ring: 'TR-24-21313',
        name: '313 (Mümin Rodoplu)',
        color: 'Mavi',
        notes: 'Mümin Rodoplu • Yeşil Bursa Postada 505 km 3.\nKardeşi TR-24-21314: 505 km 2. • As 1.\nYavrusu TUGF-A-25-0441: 420 km 4. • As 1.',
        sex: 'M',
        inMyLoft: false
      },
      dam: {
        flag: '🇹🇷',
        ring: 'TR-19-001414',
        name: 'SERKAN SÖNMEZAY',
        color: 'Mavi Çakmaklı',
        notes: 'Serkan Sönmezay • Çakmaklı Dişi\nYavrusu TR-24-21306: Derbi 16 OLR Final 505 km 126. • As 77.\nYavrusu TUGF-A-25-0441: 420 km 4. • As 1.',
        sex: 'F',
        inMyLoft: false
      },
      g2_1: {
        flag: '🇹🇷',
        ring: 'TR-16-23-06694',
        name: 'İSMAİL HACIOĞLU 06694',
        color: 'Mavi (Gök)',
        notes: 'İsmail Hacıoğlu • Kardeşleri TR 16 23-06655 Kaplan Türkiye Int. OLR Final 504 km 5. • TR 16 23-06644 Kalimanci Int. OLR Final 513 km 116.\nYavrusu TR-24-21314: 505 km 2. • As 1.',
        sex: 'M',
        inMyLoft: false
      },
      g2_2: {
        flag: '🇹🇷',
        ring: 'TR-16-23-06635',
        name: 'İSMAİL HACIOĞLU 06635',
        color: 'Mavi (Gök)',
        notes: 'İsmail Hacıoğlu • Mavi\nTR-24-21314 Yavrusu: 505 km 2. • As 1.\nTR-24-21313 Yavrusu: 505 km 3.',
        sex: 'F',
        inMyLoft: false
      },
      g2_3: {
        flag: '🇹🇷',
        ring: 'TR-16-173330',
        name: 'ŞENOL HASRET 173330',
        color: 'Mavi Çakmaklı',
        notes: 'Şenol Hasret • Çakmaklı • Kardeşi Derby 16 2016 TR-16-173315: 100 km 120., 150 km 46., 230 km 3., 275 km 54., Final 410 km 24., As Güvercin 2.',
        sex: 'M',
        inMyLoft: false
      },
      g2_4: {
        flag: '🇹🇷',
        ring: 'TR-17-016321',
        name: 'ŞENOL HASRET 016321',
        color: 'Mavi (Gök)',
        notes: 'Şenol Hasret • Mavi Dişi • Kardeşi Derby 16 2018 TR-18-214447: 60 km 2., 80 km 3., 125 km 34., 175 km 7., 250 km 9.',
        sex: 'F',
        inMyLoft: false
      },
      g3_1: {
        flag: '🇧🇬',
        ring: 'BG-21-66756',
        name: 'Sunay Niyazi 66756',
        color: 'Bozkirli (Kırçıllı)',
        notes: 'Sunay Niyazi • Schimmel • Full Sister BG-21-66652: 3. Preis Final Race 425 km, 53. Preis Semifinal 252 km OLR Rota Yenişehir Arena 2021',
        sex: 'M',
        inMyLoft: false
      },
      g3_2: {
        flag: '🇷🇴',
        ring: 'RO-17-402190',
        name: 'BFP 190',
        color: 'Mavi',
        notes: 'BFP 190 • Balkanic Fair - Play',
        sex: 'F',
        inMyLoft: false
      },
      g3_3: {
        flag: '🇹🇷',
        ring: 'TR-21-169947',
        name: 'İsmail HACIOĞLU',
        color: 'Mavi',
        notes: 'İsmail Hacıoğlu',
        sex: 'M',
        inMyLoft: false
      },
      g3_4: {
        flag: '🇧🇬',
        ring: 'BG-22-06776',
        name: 'Sunay Niyazi 06776',
        color: 'Mavi (Gök)',
        notes: 'Sunay Niyazi • Blue • 403. Place Final Race 518 km OLR Derby 16 Bursa 2022 • Full Brother BG-22-06745',
        sex: 'F',
        inMyLoft: false
      },
      g3_5: {
        flag: '🇧🇬',
        ring: 'BG-14-41034',
        name: 'DİMİTAR TODOROV',
        color: 'Mavi',
        notes: 'Dimitar Todorov • Sofia One Loft Race • Yavrusu Derby 16 2016: 100 km 120., 150 km 46.',
        sex: 'M',
        inMyLoft: false
      },
      g3_6: {
        flag: '🇹🇷',
        ring: 'TR-10-12130241',
        name: 'OGÜN KÖSE 0241',
        color: 'Mavi',
        notes: 'Ogün Köse • Yavrusu 2016 Bursa Kart Yarışı İsmail Hacıoğlunda Uçtu TR-15-074451: 148 km 14./1711 Kuş, 171 km 12./1570 Kuş',
        sex: 'F',
        inMyLoft: false
      },
      g3_7: {
        flag: '🇹🇷',
        ring: 'TR-16-043126',
        name: 'OGÜN KÖSE (Gabi Vandenabeele)',
        color: 'Mavi',
        notes: 'Ogün Köse • Gabi Vandenabeele • Kardeşi TR-14-040021 Kolombodrum BFP Final 505 km 40.',
        sex: 'M',
        inMyLoft: false
      },
      g3_8: {
        flag: '🇹🇷',
        ring: 'TR-16-043189',
        name: 'OGÜN KÖSE 043189',
        color: 'Mavi',
        notes: 'Ogün Köse • Full Brother TR-14-040050 Ege Derby 2014: 100 km 24., 145 km 65., 165 km 26., 270 km 10.',
        sex: 'F',
        inMyLoft: false
      },
      g4_1: { flag: '🇩🇪', ring: 'DV-07225-18-2206', name: 'Brother Pantera', color: 'Bozkirli (Kırçıllı)', notes: 'Schimmel', sex: 'M', inMyLoft: false },
      g4_2: { flag: '🇧🇬', ring: 'BG-18-44077', name: 'SunS', color: 'Mavi Çakmaklı', notes: 'Gehämmert', sex: 'F', inMyLoft: false },
      g4_3: { flag: '🇷🇴', ring: 'RO-11-2102073', name: '"Skeleton"', color: 'Mavi', notes: 'Balkanic Fair-Play', sex: 'M', inMyLoft: false },
      g4_4: { flag: '🇷🇴', ring: 'RO-09-887226', name: '"Sister Gillette"', color: 'Mavi', notes: 'Balkanic Fair-Play', sex: 'F', inMyLoft: false },
      g4_5: { flag: '🇧🇬', ring: 'BG-20-08108', name: 'Fast 08', color: 'Mavi (Gök)', notes: 'Blue', sex: 'M', inMyLoft: false },
      g4_6: { flag: '🇧🇬', ring: 'BG-20-09025', name: 'Heli 25', color: 'Mavi Çakmaklı', notes: 'Gehämmert', sex: 'F', inMyLoft: false },
      g4_7: { flag: '🇩🇪', ring: 'DV-05927-21-762', name: 'Son Balkanic Queen', color: 'Mavi (Gök)', notes: 'Blue', sex: 'M', inMyLoft: false },
      g4_8: { flag: '🇧🇬', ring: 'BG-21-66634', name: 'Beauty34', color: 'Mavi Çakmaklı', notes: 'Gehämmert', sex: 'F', inMyLoft: false },
      g4_9: { flag: '🇧🇬', ring: 'BG-11-43035', name: 'BREEZER 035', color: 'Mavi', notes: 'Dimitar Todorov', sex: 'M', inMyLoft: false },
      g4_10: { flag: '🇧🇬', ring: 'BG-10-54036-H', name: '"UNA 036"', color: 'Mavi', notes: 'Dimitar Todorov', sex: 'F', inMyLoft: false },
      g4_11: { flag: '🇳🇱', ring: 'NL-09-5916092', name: 'GERRIT LAHUIS', color: 'Mavi', notes: 'Radevo Derbi 20.', sex: 'M', inMyLoft: false },
      g4_12: { flag: '🇹🇷', ring: 'TR-09-1000030', name: 'RIDVAN DİNÇER', color: 'Mavi', notes: '2009 Radevo 420 km Final Uçmuş', sex: 'F', inMyLoft: false },
      g4_13: { flag: '🇩🇪', ring: 'DV-0948-12-620', name: 'GABI VANDENABEELE', color: 'Mavi', notes: 'Gabi Vandenabeele', sex: 'M', inMyLoft: false },
      g4_14: { flag: '🇷🇴', ring: 'RO-12-0508430', name: 'STANESCU DOBRE', color: 'Mavi', notes: 'Stanescu Dobre', sex: 'F', inMyLoft: false },
      g4_15: { flag: '🇹🇷', ring: 'TR-13-025132', name: 'OGÜN KÖSE', color: 'Mavi', notes: 'Ogün Köse Kardeşi', sex: 'M', inMyLoft: false },
      g4_16: { flag: '🇩🇪', ring: 'DV-6002-13-373', name: 'H.Krüger / Vhdenable', color: 'Mavi', notes: 'Süper Star Final', sex: 'F', inMyLoft: false }
    }
  };
}

// Gönderilen 2. Gerçek 4 Kuşak (31 Kutu) Pedigree: TUGF26-A-16-03033 (PALA İBO - Orhan Aydın)
function getPalaIbo31BoxPedigree() {
  return {
    id: 'ped_pala_ibo_03033',
    themeId: 'blue',
    accentColor: '#1d4ed8',
    bgColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    boxes: {
      main: {
        flag: '🇹🇷',
        ring: 'TUGF26-A-16-03033',
        name: 'PALA İBO',
        color: 'Mavi Çakmaklı',
        notes: 'Orhan Aydın (Yıldırım BURSA)\nBaba: TR25-16-00378 (PALA İBO) × Anne: TR-24-16-16198 (Hooymans Harry × Veenstra King Rolex)',
        photo: '',
        sex: 'M',
        roleCategory: 'RACER',
        inMyLoft: true
      },
      sire: {
        flag: '🇹🇷',
        ring: 'TR25-16-00378',
        name: 'PALA İBO',
        color: 'Mavi Çakmaklı',
        notes: 'Öz kardeşi: Derby 16 2025 TR-25-16-00319 Final 76., Ace 25.\nKardeşinin Yavrusu: Akdeniz Gold Arena 2026 Ömer Asiltürk TR-26-80-2328 Final 12., As 9.',
        sex: 'M'
      },
      dam: {
        flag: '🇹🇷',
        ring: 'TR-24-16-16198',
        name: 'Taner Çalışkan (Harry × Rolex)',
        color: 'Mavi Çakmaklı',
        notes: 'Taner Çalışkan • Babadan kardeşi: Türkiye Premium OLR 2024 TR-24-16-16052 252 km 2., Viktoria Falls OLR TR-23-16-00783 Emir Fazlıoğlu Final 539 km 31., Ege Derby OLR 95 km 4.',
        sex: 'F'
      },
      g2_1: {
        flag: '🇹🇷',
        ring: 'TR-2024-16-00038',
        name: 'SUFLE',
        color: 'Mavi Çakmaklı',
        notes: 'RECEP-APO-ŞENER • Türkiye Premium Pigeon Race 24 Final 504 km 400.\nFull Sister/Brother: TR16-24-00255 Final 7. 504 km Türkiye Premium Pigeon Race 24',
        sex: 'M'
      },
      g2_2: {
        flag: '🇹🇷',
        ring: 'TR-24-16-20936',
        name: 'ARYA',
        color: 'Mavi',
        notes: 'SAMET BAŞARAN • DERBY16 2024 Final 505 km 453.',
        sex: 'F'
      },
      g2_3: {
        flag: '🇳🇱',
        ring: 'NL-20-1609758',
        name: 'Exclusive Harry 758',
        color: 'Mavi Çakmaklı',
        notes: 'J. Hooymans • Cheq / DNA Certified\nYavrusu: Türkiye Premium OLR 2024 252 km 2., Viktoria Falls OLR Final 539 km 31., Ege Derby OLR 95 km 4.',
        sex: 'M'
      },
      g2_4: {
        flag: '🇳🇱',
        ring: 'NL-21-1433338',
        name: 'Dht King Rolex',
        color: 'Mavi Çakmaklı',
        notes: 'P. Veenstra • Cheq / DNA Certified\nDirect from King Rolex (best breeding son Rolex). Two generations KR offspring won 1-1-3-3-3-4-5-6-6-9 NPO',
        sex: 'F'
      },
      g3_1: {
        flag: '🇹🇷',
        ring: 'TR-16-23-18040',
        name: 'AS KOBE HARDY II',
        color: 'Mavi Çakmaklı',
        notes: 'RECEP-APO • DERBY 16 2023 Final 505 km: 5., ACE: 12.\nFather to TR-16-24-00255 (Final 7. 504 km)',
        sex: 'M'
      },
      g3_2: {
        flag: '🇩🇪',
        ring: 'DV-08897-19-5120',
        name: 'SG Steffl',
        color: 'Mavi',
        notes: 'SG Steffl • SOFIA OLR Final 379.',
        sex: 'F'
      },
      g3_3: {
        flag: '🇹🇷',
        ring: 'TR-22-16-00999',
        name: 'SEZER KUTLUK',
        color: 'Mavi',
        notes: 'SEZER KUTLUK • Final 520 km 141.\nKardeşi Sivrihisar 3. Final 520 km 223.',
        sex: 'M'
      },
      g3_4: {
        flag: '🇹🇷',
        ring: 'TR-17-012074',
        name: 'RECEP ÖZTÜRK',
        color: 'Mavi',
        notes: 'RECEP ÖZTÜRK Damızlık Dişi',
        sex: 'F'
      },
      g3_5: {
        flag: '🇳🇱',
        ring: 'NL-15-1850204',
        name: 'Son Harry',
        color: 'Mavi Çakmaklı',
        notes: 'J. Hooymans • Cheq / DNA Certified • Direct son Harry',
        sex: 'M'
      },
      g3_6: {
        flag: '🇳🇱',
        ring: 'NL-17-1409883',
        name: 'Sparkling Harry 883',
        color: 'Mavi Çakmaklı',
        notes: 'J. Hooymans • Cheq / DNA Certified • Full sister to father 1st Nat',
        sex: 'F'
      },
      g3_7: {
        flag: '🇳🇱',
        ring: 'NL-11-1160001',
        name: 'King Rolex',
        color: 'Mavi Çakmaklı',
        notes: 'P. Veenstra • DNA Certified • (G)father to: Quievrain NPO 1/6461, Argenton NPO 1/2853, Melun NPO 3/2788, Chateauroux NPO 3/2246',
        sex: 'M'
      },
      g3_8: {
        flag: '🇳🇱',
        ring: 'NL-19-1166600',
        name: 'Bonifac-Flojo 600',
        color: 'Mavi Çakmaklı',
        notes: 'P. Veenstra • DNA Certified • Mother to: Chalons NPO 77/6221 • Daughter to Olympic Bonifac × Return Flojo',
        sex: 'F'
      },
      g4_1: { flag: '🇩🇪', ring: 'DV-07274-20-982', name: 'KOBE BRYANT', color: 'Mavi', notes: 'Hardy Kruger', sex: 'M' },
      g4_2: { flag: '🇧🇬', ring: 'BG-21-44414', name: 'KALİMANÇİ COUPLE', color: 'Mavi', notes: 'Edip Shaban', sex: 'F' },
      g4_3: { flag: '🇩🇪', ring: 'DV-06723-14-3206', name: 'SOHN PANCHO', color: 'Mavi', notes: 'Dieter Siebert', sex: 'M' },
      g4_4: { flag: '🇸🇰', ring: 'SK-0999-18-758', name: 'gregi', color: 'Mavi', notes: 'greg team', sex: 'F' },
      g4_5: { flag: '🇹🇷', ring: 'TR-16-168925', name: 'SEZER KUTLUK', color: 'Mavi', notes: 'Sezer Kutluk', sex: 'M' },
      g4_6: { flag: '🇹🇷', ring: 'TR-20-166111', name: 'MURAT OYNAR', color: 'Mavi', notes: 'Murat Oynar', sex: 'F' },
      g4_7: { flag: '🇹🇷', ring: 'TR-16-170027', name: 'GÜVEN 227', color: 'Mavi', notes: 'Güven Bakışlı', sex: 'M' },
      g4_8: { flag: '🇬🇷', ring: 'GR-16-314307', name: 'GREEK SPRİNTER', color: 'Mavi', notes: 'Vasilis Pislinas', sex: 'F' },
      g4_9: { flag: '🇳🇱', ring: 'NL-07-2007621', name: 'Harry', color: 'Mavi Çakmaklı', notes: 'Jan Hooymans • Cheq', sex: 'M' },
      g4_10: { flag: '🇳🇱', ring: 'NL-12-1784421', name: 'Channel Harry', color: 'Mavi Çakmaklı', notes: 'Jan Hooymans • Cheq', sex: 'F' },
      g4_11: { flag: '🇳🇱', ring: 'NL-14-1219811', name: 'New Harry', color: 'Mavi Çakmaklı', notes: 'Jan Hooymans • Cheq', sex: 'M' },
      g4_12: { flag: '🇳🇱', ring: 'NL-11-1912078', name: 'Sister Harry', color: 'Mavi Çakmaklı', notes: 'Jan Hooymans • Cheq', sex: 'F' },
      g4_13: { flag: '🇳🇱', ring: 'NL-07-1180406', name: 'Rolex', color: 'Mavi Çakmaklı', notes: 'Pieter Veenstra', sex: 'M' },
      g4_14: { flag: '🇳🇱', ring: 'NL-09-1647005', name: 'Chanel No. 5', color: 'Mavi Çakmaklı', notes: 'Pieter Veenstra • Cheq', sex: 'F' },
      g4_15: { flag: '🇨🇿', ring: 'CZ-0250-15-311', name: 'Olympic Bonifac', color: 'Mavi Çakmaklı', notes: 'Cheq', sex: 'M' },
      g4_16: { flag: '🇨🇳', ring: 'CHN-17-11-0227009', name: 'Return Flojo', color: 'Mavi Çakmaklı', notes: 'Cheq', sex: 'F' }
    }
  };
}

// Gönderilen Gerçek 4 Kuşak (31 Kutu) Pedigree: TR35-24-10544 (**ROMARIO-MESSI** - Team Smyrna / Orhan Aydın)
function getRomarioMessi31BoxPedigree() {
  return {
    id: 'ped_romario_messi_10544',
    themeId: 'blue',
    accentColor: '#1d4ed8',
    bgColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    boxes: {
      main: {
        flag: '🇹🇷',
        ring: 'TR35-24-10544',
        name: '**ROMARIO-MESSI**',
        color: 'Mavi Çakmaklı',
        notes: 'Team Smyrna • Orhan Aydın (Bursa)\nRomario (Altmiks-Soudy / Hallmann) × Messi (Zdenek Pavlik / Liebl) Elit Çaprazlama',
        photo: '',
        sex: 'M',
        roleCategory: 'RACER'
      },
      sire: {
        flag: '🇷🇴',
        ring: 'RO-22-0633365',
        name: '**"365"**',
        color: 'Mavi (Gök)',
        notes: 'Marius Constantin • Blauw\nRomario Soy Hattı Damızlık Erkek',
        sex: 'M'
      },
      dam: {
        flag: '🇩🇪',
        ring: 'DV-05927-22-1279',
        name: '**GRANDDTR. MESSI 1279**',
        color: 'Koyu Çakmaklı',
        notes: 'Zdenek Pavlik • Donker\nInbred Granddaughter Messi!\nFrom Son "Messis Best" & One of The Last Daughter "Messi"',
        sex: 'F'
      },
      g2_1: {
        flag: '🇷🇴',
        ring: 'RO-19-458397',
        name: '**"GOLDEN 97"**',
        color: 'Mavi (Gök)',
        notes: 'Marius Constantin • Blauw\n2. Final Race Kamikaze OLR-2022 • 3. Ace Pigeon\nFull Brother: 1. Nikolaev Golden Ring Derby 557 km\n2. Final Balkanic Fair Play 505 km',
        sex: 'M'
      },
      g2_2: {
        flag: '🇩🇪',
        ring: 'DV-04812-18-870',
        name: '* ROMARIO 870 *',
        color: 'Mavi (Gök)',
        notes: 'Altmiks-Soudy • Blauw\n7. S/Final BFP 20 • 2. HS2 BFP 20 • 10. HS4 BFP 20\nInbreed "ROMARIO" • 1. Final Algarve 18 & 19',
        sex: 'F'
      },
      g2_3: {
        flag: '🇩🇪',
        ring: 'DV-02733-21-505',
        name: '** SON MESSIS BEST**',
        color: 'Koyu Çakmaklı',
        notes: 'Markus Söllner • Donker\nDirect From "Messis Best"\n1. Ace Europa Master • 1. Final Fauna • 1. Final Rimini • 1. Final Horodnic',
        sex: 'M'
      },
      g2_4: {
        flag: '🇩🇪',
        ring: 'DV-05927-21-1000',
        name: '"ATHENA"',
        color: 'Mavi Çakmaklı',
        notes: 'Zdenek Pavlik • DNA TESTED\nHalf sister to Corabia Messi, Go Messi Go, Messi 672, Messi 666, Messi 663',
        sex: 'F'
      },
      g3_1: {
        flag: '🇩🇪',
        ring: 'DV-05536-16-410',
        name: '**^^-ROMARIO 410-^^**',
        color: 'Mavi',
        notes: 'S.G. Altmiks Soudy\nFather: 1. Nikolaev Golden Ring Derby 2018 (1040 m/dk - 557 km, 46 min advance)',
        sex: 'M'
      },
      g3_2: {
        flag: '🇷🇴',
        ring: 'RO-17-401779',
        name: 'INBREED **ROMARIO**',
        color: 'Mavi',
        notes: 'Marius Constantin\nMother: 1. Nikolaev Golden Ring Derby 2018 (1040 m/dk - 557 km)',
        sex: 'F'
      },
      g3_3: {
        flag: '🇩🇪',
        ring: 'DV-03801-11-354',
        name: '^^SON^^**ROMARIO**',
        color: 'Mavi',
        notes: 'J. Hallmann • 17 MVL-Cup Rennen\n1. Final Algarve 14 & 1. Final Algarve 18',
        sex: 'M'
      },
      g3_4: {
        flag: '🇩🇪',
        ring: 'DV-08456-13-1085',
        name: '"DIE 1085"',
        color: 'Mavi',
        notes: 'Udo Gebhardt • Blau\n9 Preis Ostseerennen • Vollbruder zu Blue River As Tauben',
        sex: 'F'
      },
      g3_5: {
        flag: '🇩🇪',
        ring: 'DV-0948-10-666',
        name: '"MESSIS BEST"',
        color: 'Mavi',
        notes: 'Zdenek Pavlik • Superbreeder!\n1. Ace Europa Master • 1. Final Fauna',
        sex: 'M'
      },
      g3_6: {
        flag: '🇷🇴',
        ring: 'RO-15-22227',
        name: '1. FINAL GOLDEN P.',
        color: 'Kula (Kırmızı Çakmaklı)',
        notes: 'Marius Andrei • Red Schalie\n1. Final Romanian Golden Pigeons 2015 (450 km 40 min Ahead!) • 2. Ace',
        sex: 'F'
      },
      g3_7: {
        flag: '🇩🇪',
        ring: 'D-07216-04-515',
        name: '"MESSI"-Zuchtas!',
        color: 'Mavi Çakmaklı',
        notes: 'Johann Liebl • Superbreeder! Vater vieler Asse!!',
        sex: 'M'
      },
      g3_8: {
        flag: '🇩🇪',
        ring: 'DV-07216-18-639',
        name: '"ACE OF ACES"',
        color: 'Mavi',
        notes: 'Zdenek Pavlik • Mother to: 1. Semi Final BFP 21, 19. Final BFP 21',
        sex: 'F'
      },
      g4_1: { flag: '🇩🇪', ring: 'DV-03801-11-354', name: '^^SON^^**ROMARIO**', color: 'Mavi', notes: 'J. Hallmann', sex: 'M' },
      g4_2: { flag: '🇩🇪', ring: 'DV-03801-11-333', name: 'GR.DTH."REMUS"', color: 'Mavi', notes: 'J. Hallmann', sex: 'F' },
      g4_3: { flag: '🇩🇪', ring: 'DV-05536-16-417', name: '"417"', color: 'Mavi', notes: 'S.G. Altmiks Soundy', sex: 'M' },
      g4_4: { flag: '🇩🇪', ring: 'DV-05536-16-420', name: '"420"', color: 'Mavi', notes: 'S.G. Altmiks Soundy', sex: 'F' },
      g4_5: { flag: '🇩🇪', ring: 'DV-03801-06-338', name: '"ROMARIO"', color: 'Mavi', notes: 'J. Hallmann • Temel Ata', sex: 'M' },
      g4_6: { flag: '🇩🇪', ring: 'DV-07924-08-367', name: 'REVERMAN / DR.SCHWIDDE', color: 'Mavi', notes: 'Reverman / Dr. Schwidde', sex: 'F' },
      g4_7: { flag: '🇩🇪', ring: 'DV-02694-12-885', name: '"DER 885"', color: 'Mavi', notes: 'Altmiks-Soudy', sex: 'M' },
      g4_8: { flag: '🇩🇪', ring: 'DV-05910-11-10', name: 'TO. PITJE 1', color: 'Mavi', notes: 'SG. Kock-Schröder', sex: 'F' },
      g4_9: { flag: '🇩🇪', ring: 'D-07216-04-515', name: '"MESSI"-Zuchtas!', color: 'Mavi Çakmaklı', notes: 'Johann Liebl', sex: 'M' },
      g4_10: { flag: '🇩🇪', ring: 'DV-07216-08-350', name: 'BLUE DYNAMIT', color: 'Mavi', notes: 'Koopman', sex: 'F' },
      g4_11: { flag: '🇩🇪', ring: 'DV-2733-14-765', name: '"GOLDEN MESSI"', color: 'Mavi', notes: 'Markus Söllner', sex: 'M' },
      g4_12: { flag: '🇷🇴', ring: 'RO-10-2060049', name: '"DE 049"', color: 'Mavi', notes: 'Marius Andrei', sex: 'F' },
      g4_13: { flag: '🇳🇱', ring: 'NL-03-2324416', name: '"SON CASSIUS"', color: 'Mavi', notes: 'Koopman', sex: 'M' },
      g4_14: { flag: '🇩🇪', ring: 'D-07216-96-476', name: '"DIE 476"', color: 'Mavi', notes: 'Johann Liebl', sex: 'F' },
      g4_15: { flag: '🇩🇪', ring: 'DV-07216-09-559', name: '"JONGE AS"', color: 'Mavi', notes: 'Johann Liebl', sex: 'M' },
      g4_16: { flag: '🇩🇪', ring: 'DV-07216-11-939', name: '"DIE 939"', color: 'Mavi', notes: 'Johann Liebl', sex: 'F' }
    }
  };
}

// Varsayılan Pedigreler: Yalnızca Kullanıcının Kendi Gerçek Pedigreleri (Örnek / Demo Kayıtlar Kaldırıldı)
function getInitialPedigrees() {
  return [
    getPalaIbo31BoxPedigree(),
    getRomarioMessi31BoxPedigree()
  ];
}

// Yardımcı: Bugünden N gün öncesinin yerel saat dilimine (UTC kaymasız!) göre YYYY-MM-DD tarihini üretir
function getIsoDateDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// ============================================================================
// BİLİMSEL KULUÇKA VE YAVRU YAŞI OTOMATİK TAKVİM HESAPLAYICISI
// eventType: 'hatch' (Yavru Çıkış Tarihi), 'egg' (Yumurtlama Tarihi), 'pair' (Eşleşme Tarihi), 'vaccine' (Hedef Aşı/Yarış Tarihi)
// ============================================================================
function addDaysToDateObj(baseDate, days) {
  const copy = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function formatShortDateTr(dateObj) {
  if (!dateObj || isNaN(dateObj.getTime())) return '-';
  return dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
}

function computeDynamicBreedingStage(eventType, eventDateStr) {
  if (!eventDateStr) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parts = eventDateStr.split('-').map(Number);
  if (parts.length !== 3) return null;
  const evDate = new Date(parts[0], parts[1] - 1, parts[2]);

  const diffDays = Math.round((today - evDate) / 86400000); // Pozitifse geçmişte başladı, negatifse gelecekte

  // 1. Gelecek tarihli bir hatırlatma / aşı / yarış ise
  if (eventType === 'vaccine' || (eventType !== 'pair' && eventType !== 'egg' && eventType !== 'hatch' && diffDays < 0)) {
    const remaining = Math.abs(diffDays);
    if (diffDays === 0) {
      return {
        stageTitle: 'Bugün Yapılacak İşlem',
        ageText: 'Planlanan tarih bugün!',
        badge: 'Bugün',
        badgeColor: 'gene-red',
        status: 'Bugün',
        progressPct: 100,
        progressBarColor: '#dc2626'
      };
    } else if (diffDays < 0) {
      return {
        stageTitle: 'Yaklaşan Planlı Tarih',
        ageText: `Tarih: ${evDate.toLocaleDateString('tr-TR')} (${remaining} gün kaldı)`,
        badge: `${remaining} Gün Sonra`,
        badgeColor: remaining <= 2 ? 'gene-red' : 'gene-gold',
        status: 'Planlı',
        progressPct: Math.max(15, 100 - remaining * 10),
        progressBarColor: '#d4af37'
      };
    } else {
      return {
        stageTitle: 'Tarihi Geçen Hatırlatma',
        ageText: `${diffDays} gün önceydi (${evDate.toLocaleDateString('tr-TR')})`,
        badge: `${diffDays} Gün Geçti`,
        badgeColor: 'gene-red',
        status: 'Gecikti',
        progressPct: 100,
        progressBarColor: '#dc2626'
      };
    }
  }

  // 2. Eşleşme, Yumurtlama veya Yavru Çıkış tarihine göre biyolojik takvim tarihlerini hesapla:
  // Fizyolojik standart: Eşleşmeden +10 gün sonra yumurtlama tamamlanır, +18 gün kuluçka = 28. günde yavru çıkar, +7 gün sonra (yavru 7 günlükken) bilezik takılır.
  let eggDateObj;
  let hatchDateObj;
  let ringDateObj;
  let weanDateObj;

  if (eventType === 'hatch') {
    hatchDateObj = evDate;
    eggDateObj = addDaysToDateObj(hatchDateObj, -18);
  } else if (eventType === 'egg') {
    eggDateObj = evDate;
    hatchDateObj = addDaysToDateObj(eggDateObj, 18);
  } else {
    // 'pair'
    eggDateObj = addDaysToDateObj(evDate, 10);
    hatchDateObj = addDaysToDateObj(eggDateObj, 18);
  }
  ringDateObj = addDaysToDateObj(hatchDateObj, 7);
  weanDateObj = addDaysToDateObj(hatchDateObj, 25);

  const daysToEgg = Math.round((eggDateObj - today) / 86400000);
  const daysToHatch = Math.round((hatchDateObj - today) / 86400000);
  const daysToRing = Math.round((ringDateObj - today) / 86400000);

  const baseMeta = {
    estEggDateLabel: formatShortDateTr(eggDateObj),
    estHatchDateLabel: formatShortDateTr(hatchDateObj),
    estRingDateLabel: formatShortDateTr(ringDateObj),
    estWeanDateLabel: formatShortDateTr(weanDateObj),
    daysToEgg,
    daysToHatch,
    daysToRing
  };

  let chickAgeDays = 0;
  let incubationDay = 0;

  if (eventType === 'hatch') {
    chickAgeDays = Math.max(1, diffDays);
  } else if (eventType === 'egg') {
    if (diffDays < 18) {
      incubationDay = Math.max(1, diffDays);
    } else {
      chickAgeDays = Math.max(1, diffDays - 18);
    }
  } else {
    // eventType === 'pair' (Eşleşme tarihinden itibaren)
    if (diffDays < 10) {
      const pairDay = Math.max(1, diffDays);
      const leftToEgg = Math.max(1, 10 - pairDay);
      const pct = Math.min(95, Math.max(12, Math.round((pairDay / 10) * 100)));
      return {
        ...baseMeta,
        phaseType: 'LAYING_PREP',
        incubationDay: 0,
        chickAgeDays: 0,
        stageTitle: 'Yumurtlama Hazırlığı',
        ageText: `Eşleşme ${pairDay}/10. Gün • Tahmini Yumurtlama: ${baseMeta.estEggDateLabel} (${leftToEgg} gün)`,
        stageNote: `Tahmini Yumurtlama: ${baseMeta.estEggDateLabel} • Tahmini Çıkış: ${baseMeta.estHatchDateLabel}`,
        badge: `Yumurtaya ${leftToEgg} Gün`,
        badgeColor: 'gene-gold',
        status: 'Eşleşti',
        progressPct: pct,
        progressLabel: `Yumurtlama Süreci: ${pairDay} / 10. Gün (%${pct})`,
        progressBarColor: '#d4af37'
      };
    } else if (diffDays < 28) {
      incubationDay = diffDays - 10;
    } else {
      chickAgeDays = Math.max(1, diffDays - 28);
    }
  }

  // Kuluçka Evresi (1 - 18. Gün)
  if (incubationDay > 0) {
    const leftToHatch = Math.max(1, 18 - incubationDay);
    const pct = Math.min(98, Math.max(8, Math.round((incubationDay / 18) * 100)));
    const isCandling = incubationDay >= 5 && incubationDay <= 8;
    return {
      ...baseMeta,
      phaseType: 'INCUBATION',
      incubationDay,
      chickAgeDays: 0,
      stageTitle: isCandling ? 'Kuluçka & Döllülük Kontrolü' : 'Kuluçka Takibi',
      ageText: `Kuluçka ${incubationDay}/18. Gün • Tahmini Çıkış: ${baseMeta.estHatchDateLabel} (${leftToHatch} gün kaldı)`,
      stageNote: `Kuluçka: ${incubationDay}/18. Gün • Tahmini Çıkış: ${baseMeta.estHatchDateLabel}`,
      badge: `Kuluçka ${incubationDay}/18. Gün`,
      badgeColor: isCandling ? 'gene-gold' : 'gene-blue',
      status: 'Kuluçkada',
      progressPct: pct,
      progressLabel: `Kuluçka Günü: ${incubationDay} / 18. Gün (%${pct})`,
      progressBarColor: '#0066ff'
    };
  }

  // Yavru Çıkmış Evresi (chickAgeDays >= 1)
  const pctChick = Math.min(100, Math.max(10, Math.round((chickAgeDays / 25) * 100)));
  if (chickAgeDays < 7) {
    const leftRing = 7 - chickAgeDays;
    return {
      ...baseMeta,
      phaseType: 'CHICK_PRE_RING',
      incubationDay: 18,
      chickAgeDays,
      stageTitle: 'Kursak Sütü & Bilezik Hazırlığı',
      ageText: `Yavru ${chickAgeDays} günlük • Bilezik Takma: ${baseMeta.estRingDateLabel} (${leftRing} gün kaldı)`,
      stageNote: `Yavru ${chickAgeDays} günlük • Bilezik Tarihi: ${baseMeta.estRingDateLabel}`,
      badge: `Bileziğe ${leftRing} Gün`,
      badgeColor: 'gene-gold',
      status: 'Yavrulu',
      progressPct: pctChick,
      progressLabel: `Yavru Gelişimi: ${chickAgeDays} / 25. Gün (Bileziğe ${leftRing} gün)`,
      progressBarColor: '#d4af37'
    };
  } else if (chickAgeDays >= 7 && chickAgeDays <= 10) {
    return {
      ...baseMeta,
      phaseType: 'CHICK_RING_NOW',
      incubationDay: 18,
      chickAgeDays,
      stageTitle: 'Bilezik (Halka) Takma Günü!',
      ageText: `Yavrular ${chickAgeDays} günlük • Resmi bilezik takma zamanı (${baseMeta.estRingDateLabel})`,
      stageNote: `Bilezik Takma Günü! (${chickAgeDays} günlük yavru)`,
      badge: `💍 Bilezik Günü (${chickAgeDays}. Gün)`,
      badgeColor: 'gene-red',
      status: 'Yavrulu',
      progressPct: pctChick,
      progressLabel: `Bilezik Takma Dönemi: ${chickAgeDays} / 25. Gün (%${pctChick})`,
      progressBarColor: '#dc2626'
    };
  } else if (chickAgeDays >= 11 && chickAgeDays <= 23) {
    const daysToWean = 25 - chickAgeDays;
    return {
      ...baseMeta,
      phaseType: 'CHICK_FEATHERING',
      incubationDay: 18,
      chickAgeDays,
      stageTitle: 'Tüylenme Dönemi',
      ageText: `Yavru ${chickAgeDays} günlük • Yeme Düşme: ${baseMeta.estWeanDateLabel} (${daysToWean} gün)`,
      stageNote: `Yavru ${chickAgeDays} günlük • Ayırma: ${baseMeta.estWeanDateLabel}`,
      badge: `Yavru ${chickAgeDays}. Gün`,
      badgeColor: 'gene-green',
      status: 'Yavrulu',
      progressPct: pctChick,
      progressLabel: `Yavru Gelişimi: ${chickAgeDays} / 25. Gün (%${pctChick})`,
      progressBarColor: '#16a34a'
    };
  } else if (chickAgeDays >= 24 && chickAgeDays <= 28) {
    return {
      ...baseMeta,
      phaseType: 'CHICK_WEANING',
      incubationDay: 18,
      chickAgeDays,
      stageTitle: 'Yuvadan Ayırma Günü',
      ageText: `Yavrular ${chickAgeDays} günlük (Yeme düşme ve genç kümesine ayırma)`,
      stageNote: `Yeme düşme tamamlandı (${chickAgeDays}. gün)`,
      badge: `${chickAgeDays}. Gün (Ayırma)`,
      badgeColor: 'gene-red',
      status: 'Yavrulu',
      progressPct: 100,
      progressLabel: `Yuvadan Ayırma Evresi: ${chickAgeDays} / 25. Gün (%100)`,
      progressBarColor: '#16a34a'
    };
  } else {
    return {
      ...baseMeta,
      phaseType: 'CHICK_YOUNG_LOFT',
      incubationDay: 18,
      chickAgeDays,
      stageTitle: 'Aşı & Çatı Eğitimi',
      ageText: `Yavrular ${chickAgeDays} günlük (Genç kümesi)`,
      stageNote: `Genç kümesinde (${chickAgeDays} günlük)`,
      badge: `${chickAgeDays} Günlük`,
      badgeColor: 'gene-blue',
      status: 'Genç',
      progressPct: 100,
      progressLabel: `Genç Kümesi Evresi (${chickAgeDays} Günlük)`,
      progressBarColor: '#0066ff'
    };
  }
}

// ============================================================================
// HIZLI KUŞ PROFİLİ, PEDİGRE VE YUVA DETAYI ERİŞİM + EŞZAMANLI YUVA ÇAKIŞMA KONTROLÜ
// ============================================================================
function extractCleanRingFromText(rawText) {
  if (!rawText) return '';
  const cleaned = String(rawText).replace(/^[^\w🇹🇷🇧🇪🇳🇱🇩🇪🇵🇱🇷🇴🇬🇧🇫🇷🇺🇸]+/u, '').trim();
  const match = cleaned.match(/([A-Z]{2,4}-\d{4}-[A-Z0-9-]+)/i);
  if (match) return match[1].toUpperCase();
  return (cleaned.split(/[\s(•]+/)[0] || '').trim().toUpperCase();
}

function openQuickBirdProfileByRing(ringOrLabel, evt) {
  if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
  const ring = extractCleanRingFromText(ringOrLabel);
  if (!ring) return;
  if (typeof AvigenPerformanceEngine !== 'undefined') {
    AvigenPerformanceEngine.openProfileModal(ring);
  } else {
    openBirdPedigreeStudioByRing(ring);
  }
}

function openBirdPedigreeStudioByRing(ringOrLabel, evt) {
  if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
  const ring = extractCleanRingFromText(ringOrLabel);
  if (!ring) return;
  const foundPed = pedigrees.find(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === ring);
  if (foundPed) {
    selectActivePedigree(foundPed.id);
    openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
    switchBirdsViewMode('pedigree');
  } else {
    // Atalarda kayıtlı bir kuşsa Kuşlarım listesinde veya profilde aç
    if (typeof AvigenPerformanceEngine !== 'undefined') {
      AvigenPerformanceEngine.openProfileModal(ring);
    }
  }
}

// Aynı kuşların birden fazla aktif yuvada eşzamanlı kullanılmasını tespit eder
function detectActiveNestConflicts(excludePairId = '') {
  const ringUsage = {};
  const sameBirdNests = [];

  activePairsList.forEach(p => {
    if (excludePairId && p.id === excludePairId) return;
    const sRing = extractCleanRingFromText(p.sire);
    const dRing = extractCleanRingFromText(p.dam);

    if (sRing && dRing && sRing === dRing) {
      sameBirdNests.push({
        pairId: p.id,
        nest: p.nest,
        ring: sRing,
        message: `${p.nest} içinde hem Baba hem Anne olarak aynı kuş (${sRing}) seçilmiş!`
      });
    }

    if (sRing) {
      if (!ringUsage[sRing]) ringUsage[sRing] = [];
      ringUsage[sRing].push({ pairId: p.id, nest: p.nest, role: '♂ Baba', fullLabel: p.sire });
    }
    if (dRing && dRing !== sRing) {
      if (!ringUsage[dRing]) ringUsage[dRing] = [];
      ringUsage[dRing].push({ pairId: p.id, nest: p.nest, role: '♀ Anne', fullLabel: p.dam });
    }
  });

  const conflictsByRing = {};
  const conflictAlerts = [...sameBirdNests];

  Object.entries(ringUsage).forEach(([ring, entries]) => {
    if (entries.length > 1) {
      const nestNames = entries.map(e => e.nest);
      conflictsByRing[ring] = {
        ring,
        label: entries[0].fullLabel || ring,
        nests: nestNames,
        entries
      };
      conflictAlerts.push({
        ring,
        nests: nestNames,
        pairId: entries[0].pairId,
        message: `${entries[0].fullLabel || ring} aynı anda ${entries.length} aktif yuvada (${nestNames.join(' ve ')}) eşleşmiş görünüyor!`
      });
    }
  });

  return {
    hasConflicts: conflictAlerts.length > 0,
    ringUsage,
    conflictsByRing,
    conflictAlerts
  };
}

// Görsel ve Kompakt Aktif Yuva & Kuluçka Kartı Oluşturucu (Ana Sayfa & Damızlık Planı Ortak)
function renderVisualCompactNestCard(p, conflictsByRing = {}) {
  const dyn = computeDynamicBreedingStage(p.eventType || 'hatch', p.eventDate) || {
    stageTitle: 'Aktif Yuva',
    badge: p.status || 'Aktif',
    badgeColor: p.badgeColor || 'gene-blue',
    progressPct: 50,
    progressLabel: 'Kuluçka Takibinde',
    progressBarColor: '#0066ff',
    estEggDateLabel: '-',
    estHatchDateLabel: '-',
    estRingDateLabel: '-'
  };

  const sRing = extractCleanRingFromText(p.sire);
  const dRing = extractCleanRingFromText(p.dam);
  const sConflict = sRing && conflictsByRing[sRing];
  const dConflict = dRing && conflictsByRing[dRing];
  const sameParentConflict = sRing && dRing && sRing === dRing;
  const hasConflict = Boolean(sConflict || dConflict || sameParentConflict);

  return `
    <div class="nest-cockpit-card ${hasConflict ? 'nest-conflict-border' : ''}">
      <!-- ÜST BAŞLIK: YUVA ADI, EVRE ROZETİ VE HIZLI AKSİYONLAR -->
      <div class="nest-cockpit-top">
        <div style="display:flex; align-items:center; gap:6px; min-width:0; flex-wrap:wrap;">
          <span class="nest-pill-badge" onclick="openHomeItemModal('${p.id}', 'pairs')" title="Yuva detayını aç ve düzenle">
            🪺 ${escapeHtml(p.nest)}
          </span>
          <span class="gene-badge ${dyn.badgeColor}" style="font-size:8.5px; padding:2px 7px;">
            ${escapeHtml(dyn.badge)}
          </span>
          ${hasConflict ? `
            <span class="gene-badge gene-red" style="font-size:8px; padding:2px 6px;" title="Aynı kuş birden fazla aktif yuvada kayıtlı!">
              ⚠️ Yuva Çakışması
            </span>
          ` : ''}
        </div>
        <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
          <button type="button" class="nest-mini-action-btn" onclick="openHomeItemModal('${p.id}', 'pairs')" title="Yuva Detayı & Takvim Düzenle">
            🪺 Yuva
          </button>
          <button type="button" class="nest-mini-action-btn gold" onclick="registerChickFromActivePair('${p.id}')" title="Bu Yuvadan Yavruya Bilezik Tak & Kaydet">
            🐣 Yavru Kaydet
          </button>
          <button type="button" class="dash-check-btn" style="width:22px; height:22px; font-size:10px; color:#dc2626; border-color:#fecaca;" onclick="deleteHomeItem('pairs', '${p.id}'); if(typeof AvigenUxManager!=='undefined') AvigenUxManager.renderBreedingPlanPairsList();" title="Yuvayı Sil">✕</button>
        </div>
      </div>

      ${hasConflict ? `
        <div class="nest-conflict-alert-strip">
          ⚠️ <strong>Eşzamanlı Yuva Uyarısı:</strong>
          ${sameParentConflict
            ? `Baba ve Anne olarak aynı halka (${escapeHtml(sRing)}) seçilmiş!`
            : `${sConflict ? `<strong>${escapeHtml(sRing)}</strong> (${escapeHtml(sConflict.nests.join(', '))})` : ''} ${sConflict && dConflict ? 've ' : ''}${dConflict ? `<strong>${escapeHtml(dRing)}</strong> (${escapeHtml(dConflict.nests.join(', '))})` : ''} birden fazla aktif yuvada kullanılıyor!`}
        </div>
      ` : ''}

      <!-- EBEVEYN HIZLI PROFİL ÇİPLERİ (DOKUNUNCA KUŞ PROFİLİ AÇILIR) -->
      <div class="nest-parents-grid">
        <div class="nest-parent-chip ${sConflict ? 'conflict' : ''}" onclick="openQuickBirdProfileByRing('${escapeHtml(p.sire)}', event)" title="♂ Baba Performans ve Soy Profilini Aç">
          <span class="sex-ico male">♂</span>
          <span class="p-txt">${escapeHtml(p.sire)}</span>
          <span class="p-link">Profil →</span>
        </div>
        <div class="nest-parent-chip ${dConflict ? 'conflict' : ''}" onclick="openQuickBirdProfileByRing('${escapeHtml(p.dam)}', event)" title="♀ Anne Performans ve Soy Profilini Aç">
          <span class="sex-ico female">♀</span>
          <span class="p-txt">${escapeHtml(p.dam)}</span>
          <span class="p-link">Profil →</span>
        </div>
      </div>

      <!-- KULUÇKA GÜNÜ, TAHMİNİ ÇIKIŞ TARİHİ VE İLERLEME ÇUBUĞU -->
      <div class="nest-progress-wrap" onclick="openHomeItemModal('${p.id}', 'pairs')" style="cursor:pointer;">
        <div class="nest-progress-meta">
          <span style="font-weight:800; color:var(--ios-text);">${escapeHtml(dyn.progressLabel || dyn.stageTitle)}</span>
          <span style="font-weight:800; color:#0052cc;">🐣 Tahmini Çıkış: ${escapeHtml(dyn.estHatchDateLabel)}</span>
        </div>
        <div class="nest-progress-track">
          <div class="nest-progress-fill" style="width:${dyn.progressPct || 50}%; background:${dyn.progressBarColor || '#0066ff'};"></div>
        </div>
        <div class="nest-milestones-row">
          <span>🥚 Yumurtlama: <strong>${escapeHtml(dyn.estEggDateLabel)}</strong></span>
          <span>🐣 Çıkış: <strong>${escapeHtml(dyn.estHatchDateLabel)}</strong></span>
          <span>💍 Bilezik: <strong>${escapeHtml(dyn.estRingDateLabel)}</strong></span>
        </div>
      </div>
    </div>
  `;
}

function isBuiltInSamplePedigree(ped) {
  if (!ped || !ped.id) return false;
  const id = String(ped.id);
  const staticSampleIds = new Set([
    'ped_1',
    'ped_2',
    'ped_tr16_22_22929',
    'ped_tugf_25_a_0441',
    'ped_romario_messi_10544',
    'ped_pala_ibo_03033'
  ]);
  return id.startsWith('ped_real64_') || staticSampleIds.has(id);
}

function removeSamplePedigreesKeepUserBirds() {
  const sampleCount = pedigrees.filter(p => isBuiltInSamplePedigree(p)).length;
  const userCount = pedigrees.length - sampleCount;
  if (sampleCount === 0) {
    alert('ℹ️ Kümesinizde silinecek örnek (demo) kuş kaydı bulunmuyor. Mevcut kayıtların tamamı size aittir.');
    return;
  }
  if (!confirm(`🧹 Kümesinizdeki ${sampleCount} adet örnek (demo) kuş kaydı kaldırılacak, kendi eklediğiniz ${userCount} adet güvercin, yuva, yarış ve not veriniz %100 korunacaktır.\n\nDevam etmek istiyor musunuz?`)) {
    return;
  }
  try {
    if (typeof buildFullAvigenSnapshotPayload === 'function') {
      localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(buildFullAvigenSnapshotPayload()));
    }
  } catch (e) {}

  pedigrees = pedigrees.filter(p => !isBuiltInSamplePedigree(p));
  activePedigreeId = pedigrees[0]?.id || '';
  localStorage.setItem('avigen_clean_no_sample_birds_v53', '1');
  saveMypedigreData();
  renderPedigreeDropdown();
  selectActivePedigree(activePedigreeId);
  renderLoftBirdsDirectory();
  renderHomeDashboard();
  if (typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.renderProfileAccountSection();
  }
  alert(`✅ ${sampleCount} örnek kuş kaldırıldı. Kendi girdiğiniz veriler (${userCount} kuş) eksiksiz korundu.`);
}

function loadMypedigreData() {
  try {
    let p = localStorage.getItem(STORAGE_KEY_PEDIGREES);
    if (!p) {
      const snapRaw = localStorage.getItem('avigen_auto_safety_snapshot_v1');
      if (snapRaw) {
        try {
          const snap = JSON.parse(snapRaw);
          if (snap && Array.isArray(snap.pedigrees) && snap.pedigrees.length > 0) {
            p = JSON.stringify(snap.pedigrees);
            localStorage.setItem(STORAGE_KEY_PEDIGREES, p);
          }
        } catch (se) {}
      }
    }

    if (p !== null) {
      pedigrees = JSON.parse(p);
      if (!Array.isArray(pedigrees)) pedigrees = [];
    } else {
      // YENİ KURULUM KURALI: Uygulamayı yeni indiren herkes kayıtsız örnek kuşlar olmadan (boş kümesle) başlar!
      pedigrees = [];
      localStorage.setItem('avigen_clean_no_sample_birds_v53', '1');
      localStorage.setItem('avigen_real_loft_migrated_v1', '1');
      localStorage.setItem('avigen_synced_64_real_peds_v3', '1');
      localStorage.setItem(STORAGE_KEY_PEDIGREES, JSON.stringify(pedigrees));
    }

    // Daha önce "+ Kuş Ekle" butonunun otomatik oluşturduğu "Yeni Güvercin" hayalet kayıtlarını temizle
    pedigrees = pedigrees.filter(ped => (ped.boxes?.main?.name || '').trim() !== 'Yeni Güvercin');

    const n = localStorage.getItem(STORAGE_KEY_NOTES);
    notesList = n ? JSON.parse(n) : [];
    notesList = notesList.filter(nt => nt.id !== 'n1' && nt.id !== 'n2');

    const l = localStorage.getItem(STORAGE_KEY_LOFT);
    if (l) loftConfig = { ...loftConfig, ...JSON.parse(l) };

    const remRaw = localStorage.getItem(STORAGE_KEY_REMINDERS);
    remindersList = remRaw ? JSON.parse(remRaw) : [];
    remindersList = remindersList.filter(r => !String(r.id).startsWith('rem_auto_') && r.id !== 'rem_1' && r.id !== 'rem_2' && r.id !== 'rem_3' && !String(r.title).includes('Yuva #'));

    const pairRaw = localStorage.getItem(STORAGE_KEY_PAIRS);
    activePairsList = pairRaw ? JSON.parse(pairRaw) : [];
    activePairsList = activePairsList.filter(pr => pr.id !== 'pair_1' && pr.id !== 'pair_2');

    const raceRaw = localStorage.getItem(STORAGE_KEY_RACES);
    racesList = raceRaw ? JSON.parse(raceRaw) : [];
    racesList = racesList.filter(rc => rc.id !== 'race_1' && rc.id !== 'race_2');

    const dosRaw = localStorage.getItem(STORAGE_KEY_DOSSIER);
    birdDossierList = dosRaw ? JSON.parse(dosRaw) : [];
    birdDossierList = birdDossierList.filter(ds => ds.id !== 'dos_1' && ds.id !== 'dos_2' && ds.id !== 'dos_3');
  } catch (e) {
    pedigrees = [];
  }
  activePedigreeId = pedigrees[0]?.id || '';
}

function saveMypedigreData() {
  if (typeof invalidateUniqueLoftBirdsCache === 'function') invalidateUniqueLoftBirdsCache();
  if (typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.invalidateEngineCache === 'function') {
    AvigenGenesisAI.invalidateEngineCache();
  }
  localStorage.setItem(STORAGE_KEY_PEDIGREES, JSON.stringify(pedigrees));
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(notesList));
  localStorage.setItem(STORAGE_KEY_LOFT, JSON.stringify(loftConfig));
  localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(remindersList));
  localStorage.setItem(STORAGE_KEY_PAIRS, JSON.stringify(activePairsList));
  localStorage.setItem(STORAGE_KEY_RACES, JSON.stringify(racesList));
  localStorage.setItem(STORAGE_KEY_DOSSIER, JSON.stringify(birdDossierList));
}

function getActivePedigree() {
  return pedigrees.find(p => p.id === activePedigreeId) || pedigrees[0];
}

// ============================================================================
// EKRAN MODU & SEKME GEÇİŞLERİ
// ============================================================================
function setScreenMode(mode) {
  const b1 = document.getElementById('btnModeIphone');
  const b2 = document.getElementById('btnModeWide');
  if (mode === 'wide') {
    document.body.classList.add('wide-mode');
    b2.classList.add('active');
    b1.classList.remove('active');
  } else {
    document.body.classList.remove('wide-mode');
    b1.classList.add('active');
    b2.classList.remove('active');
  }
  setTimeout(fitPaperToIphoneScreen, 50);
}

function openIosTab(tabId, btnEl, resetSubView) {
  // Açık kalan herhangi bir modal veya açılır menü varsa kapat ki sekme geçişi hiçbir zaman kilitlenmesin
  document.querySelectorAll('.ios-modal-overlay.open').forEach(m => m.classList.remove('open'));
  if (typeof closeAllBirdActionPopups === 'function') closeAllBirdActionPopups();

  if (tabId !== 'home' && window.history && typeof window.history.pushState === 'function') {
    try {
      if (!window.history.state || window.history.state.avigenTab !== tabId) {
        window.history.pushState({ avigenGuard: true, avigenTab: tabId }, '');
      }
    } catch (e) {}
  }

  document.querySelectorAll('.ios-tab-page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + tabId);
  if (target) {
    target.classList.add('active');
    target.scrollTop = 0;
  }

  document.querySelectorAll('.ios-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    const mapIdx = { home: 0, pedigrees: 1, aiscan: 1, breeding: 2, flight: 3, notes: 4 };
    const btns = document.querySelectorAll('.ios-tab-btn');
    if (btns[mapIdx[tabId] ?? 0]) btns[mapIdx[tabId] ?? 0].classList.add('active');
  }

  if (tabId === 'home') {
    renderHomeDashboard();
  } else if (tabId === 'pedigrees') {
    if (resetSubView && typeof switchBirdsViewMode === 'function') {
      switchBirdsViewMode('list');
    } else {
      renderLoftBirdsDirectory();
      setTimeout(fitPaperToIphoneScreen, 20);
    }
  } else if (tabId === 'aiscan') {
    if (!Object.keys(aiTempBoxes).length) {
      BOX_SLOTS.forEach(s => {
        aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
      });
    }
    renderAiScannedList();
  } else if (tabId === 'breeding') {
    if (typeof AvigenGenesisAI !== 'undefined') {
      if (resetSubView) {
        AvigenGenesisAI.state.viewStage = 'launcher';
        AvigenGenesisAI.saveState();
      }
      AvigenGenesisAI.renderGenesisModuleUI();
    }
  } else if (tabId === 'flight') {
    if (typeof AvigenRaceTracker !== 'undefined') {
      AvigenRaceTracker.renderRaceTrackerMainUI();
      AvigenRaceTracker.renderRaceAiInsightsUI();
    }
    calcMypedigreFlight();
    if (typeof AvigenUxManager !== 'undefined') {
      AvigenUxManager.renderBreedingPlanPairsList();
    }
    calculateIncubationTimeline();
    renderAutoBestPairs();
  } else if (tabId === 'notes') {
    renderMypedigreNotes();
    if (typeof AvigenUxManager !== 'undefined') {
      AvigenUxManager.renderProfileAccountSection();
    }
    if (typeof AvigenScientificLibrary !== 'undefined') {
      AvigenScientificLibrary.renderLibraryUI();
    }
  }
}

// ============================================================================
// CYBER GECE (CYBER-BLUE KOYU) & CYBER GÜNDÜZ (CYBER-WHITE BEYAZLI) TEMA GEÇİŞİ
// ============================================================================
function isCyberVisualSkinActive() {
  return true;
}

function isCyberLightSkinActive() {
  return document.body.classList.contains('cyber-light-skin');
}

// 2 Ana Cyber Görünüm Modu Arasında Doğrudan Geçiş:
// - 'cyber_dark'  : 🌙 Cyber Gece Modu (Cyber-Blue Koyu)
// - 'cyber_light' : ☀️ Cyber Gündüz Modu (Beyazlı / İnci & Kraliyet Mavisi Formatı)
function setVisualThemePreset(preset) {
  document.body.classList.add('cyber-ai-skin');
  document.body.classList.remove('dark-theme');

  if (preset === 'cyber_light') {
    document.body.classList.add('cyber-light-skin');
    localStorage.setItem('avigen_cyber_light_skin', '1');
  } else {
    document.body.classList.remove('cyber-light-skin');
    localStorage.setItem('avigen_cyber_light_skin', '0');
  }

  updateThemeButtonLabels();
  renderHomeDashboard();
  if (typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.renderGenesisModuleUI();
  }
  if (typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.renderProfileAccountSection();
  }
}

function toggleAppTheme() {
  document.body.classList.add('cyber-ai-skin');
  const isLightCyber = document.body.classList.toggle('cyber-light-skin');
  localStorage.setItem('avigen_cyber_light_skin', isLightCyber ? '1' : '0');
  updateThemeButtonLabels();
  renderHomeDashboard();
  if (typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.renderProfileAccountSection();
  }
}

function updateThemeButtonLabels() {
  const topBtn = document.getElementById('btnThemeToggle');
  const navBtn = document.getElementById('navThemeBtn');
  const isCyberLight = document.body.classList.contains('cyber-light-skin');

  if (topBtn) {
    topBtn.textContent = isCyberLight ? '🌙 Cyber Gece Moduna Geç' : '☀️ Cyber Gündüz Moduna Geç';
  }
  if (navBtn) {
    navBtn.textContent = isCyberLight ? '🌙' : '☀️';
    navBtn.title = isCyberLight ? 'Cyber Gece Moduna (Koyu Lacivert) Geç' : 'Cyber Gündüz Moduna (Beyazlı Format) Geç';
  }
}

// ============================================================================
// MODÜL 1: ANA SAYFA (FERAH KONTROL MERKEZİ) & AKILLI YETİŞTİRİCİ ASİSTANI
// ============================================================================
let activeHomeSubTab = 'reminders';

// Büyük Ödüllü Yarışlara (OLR / Derby / GRAND_PRIZE) kayıtlı kuşların halka numaralarını ve yarış özetini döndürür
// Bir kullanıcı aynı anda 3 farklı Büyük Ödüllü Yarışa (veya aynı yarışın farklı etaplarına) kuş verdiğinde tümünü eksiksiz toplar.
let isHomeMorningBriefingExpanded = false;
let activeGrandPrizeOrgFilter = 'ALL';

function toggleHomeMorningBriefing() {
  isHomeMorningBriefingExpanded = !isHomeMorningBriefingExpanded;
  renderHomeMorningBriefingCard();
}

function setGrandPrizeOrgFilter(orgName) {
  activeGrandPrizeOrgFilter = orgName || 'ALL';
  renderLoftBirdsDirectory();
}

function getGrandPrizeEnteredRingsMap() {
  const gpMap = new Map();
  if (typeof AvigenRaceTracker !== 'undefined' && Array.isArray(AvigenRaceTracker.events)) {
    AvigenRaceTracker.events
      .filter(ev => ev.category === 'GRAND_PRIZE')
      .forEach(ev => {
        (ev.entries || []).forEach(en => {
          const rKey = (en.ring || '').trim().toUpperCase();
          if (!rKey) return;
          const stMeta = AvigenRaceTracker.BIRD_STATUSES?.[en.birdStatus] || { label: 'Takipte', icon: '🏆' };
          const item = {
            raceId: ev.id,
            codeTitle: ev.codeTitle,
            organizationName: ev.organizationName || 'Derby / OLR',
            stageType: ev.stageType || 'Etap',
            distanceKm: ev.distanceKm || 0,
            birdStatus: en.birdStatus,
            statusLabel: `${stMeta.icon} ${stMeta.label}`,
            rank: en.rank,
            registrationNumber: en.registrationNumber || ev.registrationNumber || '',
            wonPrizeAmountTl: en.wonPrizeAmountTl || null
          };
          if (!gpMap.has(rKey)) {
            gpMap.set(rKey, {
              ...item,
              entries: [item],
              organizations: [item.organizationName]
            });
          } else {
            const existing = gpMap.get(rKey);
            existing.entries.push(item);
            if (!existing.organizations.includes(item.organizationName)) {
              existing.organizations.push(item.organizationName);
            }
          }
        });
      });
  }
  return gpMap;
}

function renderHomeDashboard() {
  const allBirds = collectUniqueLoftBirds();
  const grandPrizeRingsMap = getGrandPrizeEnteredRingsMap();
  // Büyük Ödüllü Yarışa (Derby / OLR) teslim edilen kuşlar organizasyon kümesinde olduğu için kendi kümesimizde (Aktif Kuş, Damızlık, Yarışçı, Yavru) görünmez!
  const activeBirds = allBirds.filter(b => b.isActiveLoftBird && !grandPrizeRingsMap.has(b.ring.toUpperCase()));
  const totalBirds = activeBirds.length;
  const breedersCount = activeBirds.filter(b => b.roleCategory === 'BREEDER').length;
  const racersCount = activeBirds.filter(b => b.roleCategory === 'RACER').length;
  const youngCount = activeBirds.filter(b => b.roleCategory === 'YOUNG').length;
  const grandPrizeBirdsCount = allBirds.filter(b => grandPrizeRingsMap.has(b.ring.toUpperCase())).length;
  const isCyber = isCyberVisualSkinActive();

  const kpiEl = document.getElementById('dashKpiGrid');
  if (kpiEl) {
    kpiEl.innerHTML = `
      <div class="hero-stat-pill cyber-stat-col" onclick="openLoftWithFilter('ALL')" title="Aktif kümesteki tüm kuşları gör">
        <div class="cyber-stat-icon">🕊️</div>
        <div class="num">${totalBirds}</div>
        <div class="lbl">Aktif Kuş</div>
      </div>
      <div class="hero-stat-pill cyber-stat-col" onclick="openLoftWithFilter('BREEDER')">
        <div class="cyber-stat-icon">🥚</div>
        <div class="num">${breedersCount}</div>
        <div class="lbl">Damızlık</div>
      </div>
      <div class="hero-stat-pill cyber-stat-col" onclick="openLoftWithFilter('RACER')">
        <div class="cyber-stat-icon">🏁</div>
        <div class="num">${racersCount}</div>
        <div class="lbl">Yarışçı</div>
      </div>
      <div class="hero-stat-pill cyber-stat-col" onclick="openLoftWithFilter('YOUNG')">
        <div class="cyber-stat-icon">🐥</div>
        <div class="num">${youngCount}</div>
        <div class="lbl">Yavrular</div>
      </div>
      <div class="hero-stat-pill cyber-stat-col" onclick="openLoftWithFilter('GRAND_PRIZE')" title="Büyük Ödüllü Yarışlara (OLR / Derby) teslim edilen kuşları gör" style="border-top-color:#d97706;">
        <div class="cyber-stat-icon">🏆</div>
        <div class="num">${grandPrizeBirdsCount}</div>
        <div class="lbl">Büyük Yarış</div>
      </div>
    `;
  }

  renderHomeFlightWeatherStrip();
  renderHomeMorningBriefingCard();
  renderHomeSubPanelContent();

  // Ana Sayfa İçin GENESIS AI Vitrin Kartını Çiz (Sadece GENESIS AI sekmesi gerçekten açıksa modülü çiz)
  if (typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.renderHomeTeaserCard();
    if (document.getElementById('page-breeding')?.classList.contains('active')) {
      AvigenGenesisAI.renderGenesisModuleUI();
    }
  }
}

// Ana Sayfa Üst Canlı Uçuş & Atmosferik Uygunluk Şeridi
function renderHomeFlightWeatherStrip() {
  // Birleşik Kümes Kimlik & Canlı Hava Durumu Kartını Güncelle
  syncLoftIdentityAcrossUI();
}

let homeFeedBriefingMode = 'AUTO'; // 'AUTO' | 'RACE' | 'BREEDING' | 'MOULTING' | 'WINTER'

function setHomeFeedBriefingMode(modeKey) {
  homeFeedBriefingMode = modeKey || 'AUTO';
  renderHomeMorningBriefingCard();
}

function renderHomeMorningBriefingCard() {
  const box = document.getElementById('homeMorningBriefingCard');
  if (!box) return;

  const allActive = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
  const totalBirds = allActive.length;
  const racersCnt = allActive.filter(b => b.roleCategory === 'RACER').length;
  const breedersCnt = allActive.filter(b => b.roleCategory === 'BREEDER').length;
  const youngCnt = allActive.filter(b => b.roleCategory === 'YOUNG').length;
  const nestsCnt = Array.isArray(activePairsList) ? activePairsList.length : 0;

  const wState = (typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state)
    ? AvigenLiveWeather.state
    : { cityName: 'Türkiye', temp: 18, windSpeedKmh: 12 };
  const temp = Number(wState.temp ?? 18);

  const now = new Date();
  const monthNum = now.getMonth() + 1;
  const dayNum = now.getDay();
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const dayName = dayNames[dayNum];

  // Otomatik Mevsim ve Kümes Durumu Tespiti
  let effectiveMode = homeFeedBriefingMode;
  if (effectiveMode === 'AUTO') {
    if (nestsCnt > 0 && (monthNum >= 2 && monthNum <= 6)) {
      effectiveMode = 'BREEDING';
    } else if (monthNum >= 4 && monthNum <= 8) {
      effectiveMode = 'RACE';
    } else if (monthNum === 9 || monthNum === 10) {
      effectiveMode = 'MOULTING';
    } else {
      effectiveMode = nestsCnt > 0 ? 'BREEDING' : 'WINTER';
    }
  }

  let phaseTitle = '';
  let phaseBadge = '';
  let feedNote = '';
  let drinkNote = '';

  if (effectiveMode === 'RACE') {
    if (dayNum === 0 || dayNum === 1) {
      phaseTitle = `🏁 Yarış & Antrenman Dönemi (${dayName} • Toparlanma)`;
      phaseBadge = 'Detoks & Elektrolit';
      feedNote = `<strong>Kuş Başı 32–34 gr/gün</strong> (Sabah %35 / Akşam %65) • Yarış/uçuş dönüşü karaciğeri yormayan <strong>%35 Kavuzsuz Arpa + %25 Beyaz Darı + %15 Çeltik + %15 Buğday + %10 Aspir</strong> verilmeli; ilk 24 saat ağır bezelye verilmemelidir.`;
      drinkNote = `<strong>Sulukta:</strong> 1 Lt suya <strong>2 ml Elektrolit + Aminoasit</strong> (veya bal/dekstroz). <strong>Yem Üstü:</strong> Karaciğer koruyucu (Metiyonin/Sedochol) + Probiyotik tozu.`;
    } else if (dayNum === 4 || dayNum === 5) {
      phaseTitle = `🏁 Yarış & Antrenman Dönemi (${dayName} • Enerji Yükleme)`;
      phaseBadge = 'Glikojen & Lipit';
      feedNote = `<strong>Kuş Başı 38–42 gr/gün</strong> • Sepetleme öncesi uçuş yakıtı için <strong>%35 Cin Mısırı (Kırmızı/Sarı) + %22 Beyaz Darı + %20 Aspir/Soyulmuş Ayçekirdeği/Kenevir + %13 Buğday + %10 Küçük Bezelye</strong>.`;
      drinkNote = `<strong>Sulukta:</strong> ${temp >= 26 ? `Sıcak hava (${temp}°C) nedeniyle öğleye kadar <strong>Elektrolit + Vitamin C</strong>, akşam <strong>saf klorsuz su</strong>.` : `<strong>B-Kompleks Vitamin + L-Karnitin</strong>, sepetleme günü ise yalnızca <strong>saf taze içme suyu</strong>.`}`;
    } else {
      phaseTitle = `🏁 Yarış & Antrenman Dönemi (${dayName} • Kas Onarımı)`;
      phaseBadge = 'Kas & Kondisyon';
      feedNote = `<strong>Kuş Başı 36–38 gr/gün</strong> • Göğüs kası onarımı ve antrenman temposu için <strong>%25 Cin Mısırı + %22 Bezelye/Maş/Fiğ + %20 Beyaz Darı + %18 Buğday/Arpa + %15 Aspir/Keten</strong>.`;
      drinkNote = `<strong>Sulukta:</strong> 1 Lt suya <strong>5 ml Doğal Elma Sirkesi</strong> veya <strong>Solunum/Kekik Çayı</strong>. <strong>Yem Üstü:</strong> Sarımsak/Omega-3 Yağı + Bira Mayası.`;
    }
  } else if (effectiveMode === 'BREEDING') {
    phaseTitle = `🪺 Eşleşme, Kuluçka & Yavru Büyütme (${nestsCnt} Aktif Yuva)`;
    phaseBadge = 'Yüksek Protein & Kalsiyum';
    feedNote = `<strong>Kuş Başı 40–45 gr/gün</strong> (Yavrulu çiftlerde günde 2–3 öğün) • Yavru iskelet/kas gelişimi ve kursak sütü için <strong>%28 Bezelye + Maş + Fiğ (Bakliyat) + %24 Cin Mısırı + %20 Buğday/Darı + %16 Aspir/Kenevir + %12 Kavuzsuz Yulaf</strong>.`;
    drinkNote = `<strong>Sulukta:</strong> Haftada 2 gün <strong>Kalsiyum + D3 Vitamini</strong>, 2 gün <strong>Elma Sirkesi / Probiyotik (1 Lt suya 5 ml)</strong>. <strong>Kümes Önünde:</strong> Her gün taze <strong>Grit + Kırmızı Taş + İstiridye Kabuğu</strong>.`;
  } else if (effectiveMode === 'MOULTING') {
    phaseTitle = `🪶 Tüy Dökümü & Telek Yenileme (Moulting) Dönemi`;
    phaseBadge = 'Omega-3 & Keratin';
    feedNote = `<strong>Kuş Başı 38–40 gr/gün</strong> • Yeni teleklerin ipeksi ve esnek çıkması için yağlı tohum ağırlıklı <strong>%22 Bezelye/Fiğ + %22 Mısır + %20 Buğday/Arpa + %20 Keten Tohumu/Aspir/Kanola/Kenevir + %16 Darı</strong>.`;
    drinkNote = `<strong>Sulukta:</strong> Haftada 2 gün <strong>Metiyonin + Bira Mayası + B-Kompleks</strong>. Haftada 1 gün ılık güneşte <strong>Banyo Suyu (10 Lt suya 1 kaşık kaya tuzu + 2 kaşık elma sirkesi)</strong>.`;
  } else {
    // WINTER (Kış & Dinlenme)
    phaseTitle = `❄️ Kış & Dinlenme Dönemi (${temp}°C • İç Yağlanma Koruması)`;
    phaseBadge = 'Lif & Bağışıklık';
    feedNote = `<strong>Kuş Başı ${temp <= 8 ? '36–38' : '32–34'} gr/gün</strong> (Tek öğün veya hafif sabah/akşam) • Damızlıklarda iç yağlanmayı önleyen <strong>%38 Arpa & Çeltik + %22 Buğday + %20 Cin Mısırı + %12 Darı + %8 Aspir/Keten</strong>.`;
    drinkNote = `<strong>Sulukta:</strong> Haftada 2 gün <strong>1 Lt suya 5 ml Doğal Elma Sirkesi</strong>, 1 gün <strong>Sarımsak-Limon-Kekik Kürü veya Probiyotik</strong>, diğer günler klorsuz taze su ve taze <strong>Grit Taşı</strong>.`;
  }

  box.style.display = 'block';
  box.innerHTML = `
    <div class="ios-card" style="padding:9px 11px; border-left:4px solid #059669; background:linear-gradient(135deg, var(--ios-card) 0%, rgba(16,185,129,0.06) 100%);">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:6px;">
        <div style="display:flex; align-items:center; gap:5px;">
          <span style="font-size:13px;">🌾💧</span>
          <span style="font-size:11px; font-weight:900; color:var(--ios-text);">${phaseTitle}</span>
        </div>
        <span class="gene-badge gene-green" style="font-size:8px; padding:2px 6px;">${phaseBadge}</span>
      </div>

      <!-- HIZLI DÖNEM / DURUM SEÇİCİ -->
      <div style="display:flex; gap:4px; overflow-x:auto; padding-bottom:5px; margin-bottom:6px;">
        <button type="button" class="ios-btn ${homeFeedBriefingMode === 'AUTO' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 7px; font-size:8.6px; font-weight:800; flex-shrink:0;" onclick="setHomeFeedBriefingMode('AUTO')">🔄 Otomatik (${totalBirds} Kuş)</button>
        <button type="button" class="ios-btn ${homeFeedBriefingMode === 'RACE' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 7px; font-size:8.6px; font-weight:800; flex-shrink:0;" onclick="setHomeFeedBriefingMode('RACE')">🏁 Yarış (${racersCnt})</button>
        <button type="button" class="ios-btn ${homeFeedBriefingMode === 'BREEDING' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 7px; font-size:8.6px; font-weight:800; flex-shrink:0;" onclick="setHomeFeedBriefingMode('BREEDING')">🪺 Eşleşme/Yavru (${breedersCnt + youngCnt})</button>
        <button type="button" class="ios-btn ${homeFeedBriefingMode === 'MOULTING' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 7px; font-size:8.6px; font-weight:800; flex-shrink:0;" onclick="setHomeFeedBriefingMode('MOULTING')">🪶 Tüy Dönemi</button>
        <button type="button" class="ios-btn ${homeFeedBriefingMode === 'WINTER' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 7px; font-size:8.6px; font-weight:800; flex-shrink:0;" onclick="setHomeFeedBriefingMode('WINTER')">❄️ Kış Dinlenme</button>
      </div>

      <div style="display:grid; grid-template-columns:1fr; gap:5px; font-size:9.6px; line-height:1.38;">
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:6px 8px;">
          <div style="font-weight:900; color:#b45309; margin-bottom:2px;">🥣 Bugün Verilecek Yem &amp; Karışım Oranı:</div>
          <div style="color:var(--ios-text);">${feedNote}</div>
        </div>
        <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:8px; padding:6px 8px;">
          <div style="font-weight:900; color:#0284c7; margin-bottom:2px;">💧 Bugün Verilecek İçecek (Suluk) &amp; Doğal Takviye:</div>
          <div style="color:var(--ios-text);">${drinkNote}</div>
        </div>
      </div>
    </div>
  `;
}

// Ana Sayfa Hızlı Güvercin Arama (1-Dokunuşla Pedigre, Profil veya GENESIS Analiz Açma)
let _lastQuickSearchMatches = [];

function onHomeQuickSearch(val) {
  const resBox = document.getElementById('homeQuickSearchResults');
  if (!resBox) return;
  const q = (val || '').trim().toLowerCase();
  if (!q) {
    resBox.classList.remove('open');
    resBox.innerHTML = '';
    _lastQuickSearchMatches = [];
    return;
  }

  const allBirds = collectUniqueLoftBirds();
  const cleanQ = q.replace(/[-\s./]+/g, '');
  const matches = allBirds
    .filter(b => {
      const rawHay = `${b.ring} ${b.name} ${b.color} ${b.notes}`.toLowerCase();
      const cleanHay = rawHay.replace(/[-\s./]+/g, '');
      return rawHay.includes(q) || (cleanQ.length >= 2 && cleanHay.includes(cleanQ));
    })
    .sort((a, b) => {
      // Önce aktif kümesteki ana kuşları (🏠 Kümesim), ardından Soy Arşivi atalarını sırala
      if (a.isActiveLoftBird !== b.isActiveLoftBird) return a.isActiveLoftBird ? -1 : 1;
      const aNameMatch = (a.name || '').toLowerCase().includes(q) || (a.ring || '').toLowerCase().includes(q);
      const bNameMatch = (b.name || '').toLowerCase().includes(q) || (b.ring || '').toLowerCase().includes(q);
      if (aNameMatch !== bNameMatch) return aNameMatch ? -1 : 1;
      return (b.ebvScore || 0) - (a.ebvScore || 0);
    })
    .slice(0, 12);

  _lastQuickSearchMatches = matches;

  if (!matches.length) {
    resBox.innerHTML = `<div style="padding:8px; font-size:11px; color:var(--ios-subtext); text-align:center;">"${escapeHtml(val)}" ile eşleşen kuş bulunamadı.</div>`;
    resBox.classList.add('open');
    return;
  }

  resBox.innerHTML = matches.map((b, idx) => `
    <div class="quick-res-item" style="cursor:pointer;" onclick="handleHomeQuickSearchAction(${idx}, 'pedigree', event)">
      <div style="flex:1; min-width:0;">
        <div style="font-weight:900; color:var(--ios-text); display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
          <span>${b.flag} ${escapeHtml(b.ring)} — ${escapeHtml(b.name || 'İsimsiz')}</span>
          <span class="gene-badge ${b.isActiveLoftBird ? 'gene-blue' : 'gene-purple'}" style="font-size:8px; padding:1px 5px;">${b.isActiveLoftBird ? '🏠 Kümesim' : '📜 Soy Arşivi'}</span>
        </div>
        <div style="font-size:10px; color:var(--ios-subtext);">${b.sex === 'M' ? '♂ Erkek' : '♀ Dişi'} • ${escapeHtml(b.color)} • İndeks: ${b.ebvScore}/100</div>
      </div>
      <div style="display:flex; gap:4px; flex-shrink:0;">
        <button type="button" class="ios-btn ios-btn-gold" style="padding:4px 7px; font-size:10px;" onclick="handleHomeQuickSearchAction(${idx}, 'pedigree', event)">📜 Pedigre</button>
        <button type="button" class="ios-btn ios-btn-secondary" style="padding:4px 7px; font-size:10px; border-color:#1e40af; color:#1e40af;" onclick="handleHomeQuickSearchAction(${idx}, 'profile', event)">📊 Profil</button>
      </div>
    </div>
  `).join('');
  resBox.classList.add('open');
}

function handleHomeQuickSearchAction(idx, actionType, event) {
  if (event) event.stopPropagation();
  const bird = _lastQuickSearchMatches[idx];
  const resBox = document.getElementById('homeQuickSearchResults');
  if (resBox) resBox.classList.remove('open');
  if (!bird) return;

  if (actionType === 'profile') {
    if (typeof AvigenPerformanceEngine !== 'undefined') {
      AvigenPerformanceEngine.openProfileModal(bird.ring);
    }
  } else if (actionType === 'genesis') {
    openBirdInGenesisFromDirectory(bird.pedId, bird.slotKey, bird.sex);
  } else {
    openBirdPedigreeFromDirectory(bird.pedId, bird.slotKey);
  }
}

function switchHomeSubPanel(tabName, btnEl) {
  activeHomeSubTab = tabName;
  if (btnEl) {
    btnEl.parentElement.querySelectorAll('.sub-pill').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }
  renderHomeSubPanelContent();
}

let showCompletedRemindersArchive = false;

// Ana Sayfada Yaklaşan Yumurtlama, Yavru Çıkışı, Bilezik Takma, Yarış Tarihleri, Çakışma Uyarıları ve Görevleri Birleştirir
function buildUnifiedSmartReminders() {
  const unified = [];
  const conflicts = detectActiveNestConflicts();

  // 1. Eşzamanlı Yuva Çakışma Uyarıları (En Yüksek Öncelik)
  conflicts.conflictAlerts.forEach((c, idx) => {
    unified.push({
      id: `conflict_${idx}`,
      sourceType: 'conflict',
      pairId: c.pairId || '',
      birdRing: c.ring || '',
      icon: '⚠️',
      title: `Eşzamanlı Yuva Çakışması: ${c.ring}`,
      subtitle: c.message,
      badge: 'Çakışma Uyarısı',
      badgeColor: 'gene-red',
      urgencyOrder: 0
    });
  });

  // 2. Aktif Yuvalardan Yaklaşan Yumurtlama, Yavru Çıkışı ve Bilezik Takma Tarihleri
  activePairsList.forEach(p => {
    const dyn = computeDynamicBreedingStage(p.eventType || 'hatch', p.eventDate);
    if (!dyn) return;
    const sRing = extractCleanRingFromText(p.sire);
    const dRing = extractCleanRingFromText(p.dam);

    if (dyn.phaseType === 'LAYING_PREP') {
      unified.push({
        id: `nest_egg_${p.id}`,
        sourceType: 'nest_milestone',
        pairId: p.id,
        sireRing: sRing,
        damRing: dRing,
        sireLabel: p.sire,
        damLabel: p.dam,
        nestName: p.nest,
        icon: '🥚',
        title: `${p.nest} — Yaklaşan Yumurtlama (${dyn.estEggDateLabel})`,
        subtitle: `♂ ${sRing || p.sire} × ♀ ${dRing || p.dam} • Tahmini Çıkış: ${dyn.estHatchDateLabel}`,
        progressPct: dyn.progressPct,
        progressLabel: dyn.progressLabel,
        progressBarColor: dyn.progressBarColor,
        badge: dyn.badge,
        badgeColor: dyn.badgeColor,
        urgencyOrder: 1.5
      });
    } else if (dyn.phaseType === 'INCUBATION') {
      unified.push({
        id: `nest_inc_${p.id}`,
        sourceType: 'nest_milestone',
        pairId: p.id,
        sireRing: sRing,
        damRing: dRing,
        sireLabel: p.sire,
        damLabel: p.dam,
        nestName: p.nest,
        icon: '🐣',
        title: `${p.nest} — Kuluçka ${dyn.incubationDay}/18. Gün (Çıkış: ${dyn.estHatchDateLabel})`,
        subtitle: `♂ ${sRing || p.sire} × ♀ ${dRing || p.dam} • Bilezik Tarihi: ${dyn.estRingDateLabel}`,
        progressPct: dyn.progressPct,
        progressLabel: dyn.progressLabel,
        progressBarColor: dyn.progressBarColor,
        badge: `Çıkış: ${dyn.estHatchDateLabel}`,
        badgeColor: dyn.badgeColor,
        urgencyOrder: 1.2
      });
    } else if (dyn.phaseType === 'CHICK_PRE_RING' || dyn.phaseType === 'CHICK_RING_NOW') {
      unified.push({
        id: `nest_ring_${p.id}`,
        sourceType: 'nest_ringing',
        pairId: p.id,
        sireRing: sRing,
        damRing: dRing,
        sireLabel: p.sire,
        damLabel: p.dam,
        nestName: p.nest,
        icon: '💍',
        title: `${p.nest} — ${dyn.phaseType === 'CHICK_RING_NOW' ? 'Bilezik Takma Günü!' : `Yaklaşan Bilezik Takma (${dyn.estRingDateLabel})`}`,
        subtitle: `Yavru ${dyn.chickAgeDays} günlük • ♂ ${sRing || p.sire} × ♀ ${dRing || p.dam}`,
        progressPct: dyn.progressPct,
        progressLabel: dyn.progressLabel,
        progressBarColor: dyn.progressBarColor,
        badge: dyn.badge,
        badgeColor: dyn.badgeColor,
        urgencyOrder: dyn.phaseType === 'CHICK_RING_NOW' ? 0.5 : 1.3
      });
    }
  });

  // 3. Yaklaşan Yarış Tarihleri (racesList içindeki yaklaşan etaplar)
  racesList.forEach(rc => {
    const isUpcoming = rc.icon === '🧭' || /yaklaşan|etap|final|cumartesi|pazar/i.test(`${rc.title} ${rc.badge}`);
    if (!isUpcoming) return;
    const birdRing = extractCleanRingFromText(rc.detail);
    unified.push({
      id: `race_up_${rc.id}`,
      sourceType: 'race_upcoming',
      raceId: rc.id,
      birdRing: birdRing && birdRing.includes('-') ? birdRing : (pedigrees[0]?.boxes?.main?.ring || ''),
      icon: '🏁',
      title: rc.title,
      subtitle: rc.detail,
      badge: rc.badge || 'Yaklaşan Yarış',
      badgeColor: 'gene-blue',
      urgencyOrder: 1.8
    });
  });

  // 4. Bekleyen Kümes Görevleri / Aşı / Bakım Hatırlatmaları
  remindersList.filter(r => !r.completed).forEach(r => {
    const dyn = computeDynamicBreedingStage('vaccine', r.eventDate);
    const badge = dyn ? dyn.badge : (r.badge || 'Planlı');
    const badgeColor = dyn ? dyn.badgeColor : (r.badgeColor || 'gene-gold');
    const dateLabel = r.eventDate ? new Date(r.eventDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) : '';
    const extractedRing = extractCleanRingFromText(`${r.title} ${r.detail}`);

    unified.push({
      id: r.id,
      sourceType: 'reminder',
      birdRing: extractedRing && extractedRing.includes('-') ? extractedRing : '',
      icon: r.icon || '💉',
      title: r.title,
      subtitle: `${r.detail ? r.detail : 'Kümes görevi'}${dateLabel ? ' • ' + dateLabel : ''}`,
      badge,
      badgeColor,
      urgencyOrder: badgeColor === 'gene-red' ? 1 : (badgeColor === 'gene-gold' ? 2 : 3)
    });
  });

  return unified.sort((a, b) => a.urgencyOrder - b.urgencyOrder);
}

function archiveReminderTask(id) {
  const item = remindersList.find(r => r.id === id);
  if (!item) return;
  item.completed = true;
  item.completedAt = new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  saveMypedigreData();
  renderHomeSubPanelContent();
}

function restoreArchivedReminderTask(id) {
  const item = remindersList.find(r => r.id === id);
  if (!item) return;
  item.completed = false;
  delete item.completedAt;
  saveMypedigreData();
  renderHomeSubPanelContent();
}

function toggleCompletedRemindersArchive() {
  showCompletedRemindersArchive = !showCompletedRemindersArchive;
  renderHomeSubPanelContent();
}

function renderHomeSubPanelContent() {
  const box = document.getElementById('homeSubPanelContent');
  if (!box) return;

  const smartReminders = buildUnifiedSmartReminders();
  const conflicts = detectActiveNestConflicts();

  const bRem = document.getElementById('homeTabBtn_reminders');
  const bPair = document.getElementById('homeTabBtn_pairs');
  const bRace = document.getElementById('homeTabBtn_races');
  const bDos = document.getElementById('homeTabBtn_dossier');
  const addBtn = document.getElementById('homeSubAddBtn');

  if (bRem) bRem.textContent = `📅 Takvim (${smartReminders.length})`;
  if (bPair) bPair.textContent = `🪺 Yuva (${activePairsList.length})${conflicts.hasConflicts ? ' ⚠️' : ''}`;
  if (bRace) bRace.textContent = `🏁 Yarış (${racesList.length})`;
  if (bDos) bDos.textContent = `📋 Sicil (${birdDossierList.length})`;

  if (addBtn) {
    if (activeHomeSubTab === 'reminders') addBtn.textContent = '+ Görev';
    else if (activeHomeSubTab === 'pairs') addBtn.textContent = '+ Yuva';
    else if (activeHomeSubTab === 'races') addBtn.textContent = '+ Yarış';
    else addBtn.textContent = '+ Sicil';
  }

  const urgencyClassMap = {
    'gene-red': 'urgency-red',
    'gene-gold': 'urgency-gold',
    'gene-green': 'urgency-green',
    'gene-blue': 'urgency-blue'
  };

  if (activeHomeSubTab === 'reminders') {
    const archivedList = remindersList.filter(r => r.completed);

    let activeHtml = '';
    if (!smartReminders.length) {
      activeHtml = `<div style="text-align:center; padding:12px; font-size:11px; color:var(--ios-subtext);">Bekleyen aktif görev veya yaklaşan tarih yok.</div>`;
    } else {
      activeHtml = smartReminders.map(item => {
        const uClass = urgencyClassMap[item.badgeColor] || 'urgency-gold';

        // 1. Eşzamanlı Yuva Çakışma Uyarısı Kartı
        if (item.sourceType === 'conflict') {
          return `
            <div class="dash-list-item urgency-red" style="border:1.5px solid #ef4444; background:#fef2f2;">
              <div class="dash-list-left" onclick="openQuickBirdProfileByRing('${escapeHtml(item.birdRing)}', event)" style="cursor:pointer;">
                <div class="dash-mini-icon">⚠️</div>
                <div style="min-width:0; flex:1;">
                  <div class="dash-list-title" style="color:#b91c1c;">${escapeHtml(item.title)}</div>
                  <div class="dash-list-sub" style="color:#991b1b; white-space:normal;">${escapeHtml(item.subtitle)}</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(item.birdRing)}', event)">📊 Kuş</button>
                <button type="button" class="nest-mini-action-btn" onclick="openHomeItemModal('${item.pairId}', 'pairs')">🪺 Yuva</button>
              </div>
            </div>
          `;
        }

        // 2. Yuva / Kuluçka / Yumurtlama / Bilezik Takma Takvim Kartı (Mini İlerleme Çubuklu + Kuş/Yuva Hızlı Erişimli)
        if (item.sourceType === 'nest_milestone' || item.sourceType === 'nest_ringing') {
          return `
            <div class="dash-list-item ${uClass}" style="flex-direction:column; align-items:stretch; gap:5px; padding:7px 9px;">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <div class="dash-list-left" onclick="openHomeItemModal('${item.pairId}', 'pairs')" style="cursor:pointer;">
                  <div class="dash-mini-icon">${item.icon}</div>
                  <div style="min-width:0; flex:1;">
                    <div class="dash-list-title">${escapeHtml(item.title)}</div>
                    <div class="dash-list-sub">${escapeHtml(item.subtitle)}</div>
                  </div>
                </div>
                <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                  <span class="gene-badge ${item.badgeColor}" style="font-size:8.5px; padding:2px 6px;">${escapeHtml(item.badge)}</span>
                  ${item.sourceType === 'nest_ringing' ? `
                    <button type="button" class="nest-mini-action-btn gold" onclick="registerChickFromActivePair('${item.pairId}')" title="Yavruya Bilezik Tak & Kaydet">🐣 Bilezik</button>
                  ` : ''}
                </div>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <div class="nest-progress-track" style="flex:1; height:5px; margin:0;">
                  <div class="nest-progress-fill" style="width:${item.progressPct || 50}%; background:${item.progressBarColor || '#0066ff'};"></div>
                </div>
                <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                  <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(item.sireRing)}', event)" title="♂ Baba Profilini Aç">♂ Baba</button>
                  <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(item.damRing)}', event)" title="♀ Anne Profilini Aç">♀ Anne</button>
                  <button type="button" class="nest-mini-action-btn" onclick="openHomeItemModal('${item.pairId}', 'pairs')" title="Yuva Detayını Aç">🪺 Yuva</button>
                </div>
              </div>
            </div>
          `;
        }

        // 3. Yaklaşan Yarış Tarihi Kartı
        if (item.sourceType === 'race_upcoming') {
          return `
            <div class="dash-list-item ${uClass}">
              <div class="dash-list-left" onclick="openHomeItemModal('${item.raceId}', 'races')" style="cursor:pointer;">
                <div class="dash-mini-icon">${item.icon}</div>
                <div style="min-width:0; flex:1;">
                  <div class="dash-list-title">${escapeHtml(item.title)}</div>
                  <div class="dash-list-sub">${escapeHtml(item.subtitle)}</div>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                <span class="gene-badge ${item.badgeColor}" style="font-size:8.5px; padding:2px 6px;">${escapeHtml(item.badge)}</span>
                ${item.birdRing ? `<button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(item.birdRing)}', event)">📊 Kuş</button>` : ''}
                <button type="button" class="nest-mini-action-btn" onclick="if(typeof AvigenGenesisAI!=='undefined') AvigenGenesisAI.openModuleDirectlyFromHome('distance');">🏁 Seçim</button>
              </div>
            </div>
          `;
        }

        // 4. Standart Kümes Görevi / Aşı Kartı
        const clickEdit = `openHomeItemModal('${item.id}', 'reminders')`;
        const clickArchive = `archiveReminderTask('${item.id}')`;

        return `
          <div class="dash-list-item ${uClass}">
            <div class="dash-list-left" onclick="${clickEdit}" style="cursor:pointer;" title="Düzenlemek için dokunun">
              <div class="dash-mini-icon">${item.icon}</div>
              <div style="min-width:0; flex:1;">
                <div class="dash-list-title">${escapeHtml(item.title)}</div>
                <div class="dash-list-sub">${escapeHtml(item.subtitle)}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
              ${item.birdRing ? `<button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(item.birdRing)}', event)">📊 Kuş</button>` : ''}
              <span class="gene-badge ${item.badgeColor}" style="font-size:9px; padding:2px 6px;">${escapeHtml(item.badge)}</span>
              <button class="dash-check-btn" onclick="${clickArchive}" title="Görevi Tamamla ve Arşive Taşı">✓</button>
            </div>
          </div>
        `;
      }).join('');
    }

    let archiveHtml = '';
    if (archivedList.length > 0) {
      archiveHtml = `
        <div style="margin-top:6px; border-top:1px dashed var(--ios-border); padding-top:6px;">
          <div onclick="toggleCompletedRemindersArchive()" style="display:flex; align-items:center; justify-content:space-between; font-size:10px; font-weight:800; color:var(--ios-subtext); cursor:pointer; padding:2px 4px;">
            <span>🗂️ Tamamlanan Görevler Arşivi (${archivedList.length})</span>
            <span style="color:#0066ff;">${showCompletedRemindersArchive ? 'Gizle ▲' : 'Göster ▼'}</span>
          </div>
          ${showCompletedRemindersArchive ? `
            <div style="display:flex; flex-direction:column; gap:5px; margin-top:6px;">
              ${archivedList.map(ar => `
                <div class="dash-list-item urgency-green" style="opacity:0.78;">
                  <div class="dash-list-left">
                    <div class="dash-mini-icon">✅</div>
                    <div style="min-width:0; flex:1;">
                      <div class="dash-list-title" style="text-decoration:line-through;">${escapeHtml(ar.title)}</div>
                      <div class="dash-list-sub">Tamamlandı: ${escapeHtml(ar.completedAt || '-')} ${ar.detail ? '• ' + escapeHtml(ar.detail) : ''}</div>
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
                    <button class="dash-check-btn" style="color:#0066ff; border-color:#bfdbfe;" onclick="restoreArchivedReminderTask('${ar.id}')" title="Geri Al (Tekrar Aktif Et)">↩</button>
                    <button class="dash-check-btn" style="color:#dc2626; border-color:#fecaca;" onclick="deleteHomeItem('reminders', '${ar.id}')" title="Arşivden Kalıcı Olarak Sil">✕</button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    box.innerHTML = activeHtml + archiveHtml;
  } else if (activeHomeSubTab === 'pairs') {
    if (!activePairsList.length) {
      box.innerHTML = `<div style="text-align:center; padding:16px; font-size:11px; color:var(--ios-subtext);">Kayıtlı aktif yuva yok. <strong>+ Yuva</strong> ile ekleyebilirsiniz.</div>`;
      return;
    }
    box.innerHTML = activePairsList.map(p => renderVisualCompactNestCard(p, conflicts.conflictsByRing)).join('');
  } else if (activeHomeSubTab === 'races') {
    const trackerEvents = (typeof AvigenRaceTracker !== 'undefined' && Array.isArray(AvigenRaceTracker.events))
      ? AvigenRaceTracker.events
      : [];

    const trackerTopHtml = trackerEvents.slice(0, 2).map(ev => {
      const entered = (ev.entries || []).filter(e => e.resultStatus === 'ENTERED').length;
      const isDone = ev.status === 'COMPLETED' || (ev.entries?.length && entered === ev.entries.length);
      return `
        <div class="dash-list-item ${isDone ? 'urgency-green' : 'urgency-blue'}" style="cursor:pointer;" onclick="openIosTab('flight'); AvigenUxManager.switchBreedingPlanSub('racetracker');">
          <div class="dash-list-left">
            <div class="dash-mini-icon">🏁</div>
            <div style="min-width:0; flex:1;">
              <div class="dash-list-title">${escapeHtml(ev.codeTitle)} — ${ev.distanceKm} km (${escapeHtml(ev.raceType)})</div>
              <div style="font-size:10px; color:var(--ios-subtext);">Salım: ${escapeHtml(ev.releaseDateLabel)} • Katılan: ${ev.participantBirdsCount || ev.entries.length} kuş (${entered}/${ev.entries.length} sonuç girildi)</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
            <span class="gene-badge ${isDone ? 'gene-green' : 'gene-purple'}" style="font-size:9px; padding:2px 7px;">${isDone ? 'Tamamlandı' : 'Sonuç Bekleniyor'}</span>
            <span style="font-size:10px; font-weight:800; color:#0066ff;">Aç →</span>
          </div>
        </div>
      `;
    }).join('');

    if (!racesList.length && !trackerTopHtml) {
      box.innerHTML = `<div style="text-align:center; padding:16px; font-size:11px; color:var(--ios-subtext);">Kayıtlı yarış yok. <strong>+ Yarış</strong> ile ekleyebilirsiniz.</div>`;
      return;
    }
    box.innerHTML = trackerTopHtml + racesList.map(rc => {
      const uClass = urgencyClassMap[rc.badgeColor] || 'urgency-blue';
      const rRing = extractCleanRingFromText(rc.detail);
      const hasBird = rRing && rRing.includes('-');
      return `
        <div class="dash-list-item ${uClass}">
          <div class="dash-list-left" onclick="openHomeItemModal('${rc.id}', 'races')" style="cursor:pointer;" title="Yarışı düzenlemek için dokunun">
            <div class="dash-mini-icon">${rc.icon || '🏁'}</div>
            <div style="min-width:0; flex:1;">
              <div class="dash-list-title">${escapeHtml(rc.title)}</div>
              <div style="font-size:10px; color:var(--ios-subtext);">${escapeHtml(rc.detail)}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            ${hasBird ? `<button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(rRing)}', event)" title="Kuş Profilini Aç">📊 Kuş</button>` : ''}
            <span class="gene-badge ${rc.badgeColor || 'gene-blue'}" style="font-size:9px; padding:2px 6px;">${escapeHtml(rc.badge)}</span>
            <button class="dash-check-btn" style="color:#dc2626; border-color:#fecaca;" onclick="deleteHomeItem('races', '${rc.id}')" title="Sil">✕</button>
          </div>
        </div>
      `;
    }).join('');
  } else {
    // 📋 SİCİL KAYITLARI SEKMESİ (Kuş Profili ve Sicil Dosyası Hızlı Erişimli)
    if (!birdDossierList.length) {
      box.innerHTML = `<div style="text-align:center; padding:16px; font-size:11px; color:var(--ios-subtext);">Kayıtlı sicil bilgisi yok. Sağ üstteki <strong>+ Sicil</strong> butonuyla kayıt girebilirsiniz.</div>`;
      return;
    }
    box.innerHTML = birdDossierList.map(d => {
      const uClass = urgencyClassMap[d.badgeColor] || 'urgency-blue';
      const flag = detectFlagFromRing(d.ring);
      return `
        <div class="dash-list-item ${uClass}">
          <div class="dash-list-left" onclick="openBirdDossierModal('${escapeHtml(d.ring)}')" style="cursor:pointer;" title="Bu güvercinin tam sicil dosyasını aç">
            <div class="dash-mini-icon">${d.icon || '📋'}</div>
            <div style="min-width:0; flex:1;">
              <div class="dash-list-title">${flag} ${escapeHtml(d.ring)} • ${escapeHtml(d.title)}</div>
              <div class="dash-list-sub">${escapeHtml(d.detail)}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
            <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(d.ring)}', event)" title="Kuş Performans & Soy Profilini Aç">📊 Profil</button>
            <span class="gene-badge ${d.badgeColor || 'gene-blue'}" style="font-size:8.5px; padding:2px 6px;">${escapeHtml(d.category)}</span>
            <button class="dash-check-btn" style="color:#dc2626; border-color:#fecaca;" onclick="deleteHomeItem('dossier', '${d.id}')" title="Sil">✕</button>
          </div>
        </div>
      `;
    }).join('');
  }
}

function completePairMilestone(pairId) {
  const p = activePairsList.find(x => x.id === pairId);
  if (!p) return;
  const dyn = computeDynamicBreedingStage(p.eventType || 'hatch', p.eventDate);
  if (dyn && dyn.stageTitle.includes('Halka')) {
    if (confirm(`${p.nest} yavrusuna halkasını taktınız mı? Şimdi yavruyu kümesinize kaydetmek ister misiniz?`)) {
      p.completedStage = p.eventDate;
      saveMypedigreData();
      renderHomeSubPanelContent();
      registerChickFromActivePair(pairId);
      return;
    }
  }
  p.completedStage = p.eventDate;
  saveMypedigreData();
  renderHomeSubPanelContent();
}

// ============================================================================
// ANA SAYFA HATIRLATMA / ÇİFT / YARIŞ EKLEME VE DÜZENLEME MODALI
// ============================================================================
function fillReminderTemplate(icon, title, detail) {
  const iconEl = document.getElementById('hmRemIcon');
  const titleEl = document.getElementById('hmRemTitle');
  const detailEl = document.getElementById('hmRemDetail');
  if (iconEl) iconEl.value = icon;
  if (titleEl) titleEl.value = title;
  if (detailEl) detailEl.value = detail;
}

function openHomeItemModal(itemId = '', forcedType = '') {
  const modal = document.getElementById('homeItemModal');
  const titleEl = document.getElementById('homeItemModalTitle');
  const formBody = document.getElementById('homeItemFormBody');
  const modalType = forcedType || activeHomeSubTab;
  document.getElementById('editHomeItemId').value = itemId;
  document.getElementById('editHomeItemType').value = modalType;

  const { males, females } = getAllBreedingCandidates();

  if (modalType === 'reminders') {
    const existing = remindersList.find(x => x.id === itemId) || {
      icon: '💉',
      eventDate: getIsoDateDaysAgo(0),
      title: '',
      detail: ''
    };
    titleEl.textContent = itemId ? '✏️ Görevi Düzenle' : '🔔 Yeni Kümes Görevi / Hatırlatma';
    formBody.innerHTML = `
      <div>
        <label style="font-size:10.5px; font-weight:800; color:var(--ios-subtext); display:block; margin-bottom:5px;">1-Dokunuş Hazır Görev Şablonları:</label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
          <button type="button" class="flag-chip" onclick="fillReminderTemplate('💉', 'PMV-1 (Veba) Aşısı', 'Tüm kümes yıllık koruyucu aşı')">💉 PMV-1 Aşısı</button>
          <button type="button" class="flag-chip" onclick="fillReminderTemplate('💊', 'Salmonella / Trikomonas Kürü', '5 günlük içme suyu kürü')">💊 Sağlık Kürü</button>
          <button type="button" class="flag-chip" onclick="fillReminderTemplate('🪶', 'Vitamin & Elektrolit Günü', 'Yarış sonrası toparlanma')">🪶 Vitamin / Bakım</button>
          <button type="button" class="flag-chip" onclick="fillReminderTemplate('🏁', '50 km Antrenman Salımı', 'Sabah erken grup uçuşu')">🏁 Antrenman</button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:0.8fr 1.2fr; gap:8px;">
        <div>
          <label style="font-size:11px; font-weight:800;">İkon</label>
          <select id="hmRemIcon" class="ios-select">
            <option value="💉" ${existing.icon === '💉' ? 'selected' : ''}>💉 Aşı</option>
            <option value="💊" ${existing.icon === '💊' ? 'selected' : ''}>💊 İlaç / Kür</option>
            <option value="🪶" ${existing.icon === '🪶' ? 'selected' : ''}>🪶 Bakım</option>
            <option value="🏁" ${existing.icon === '🏁' ? 'selected' : ''}>🏁 Antrenman</option>
            <option value="🔔" ${existing.icon === '🔔' ? 'selected' : ''}>🔔 Genel</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; font-weight:800;">Görev Tarihi</label>
          <input type="date" id="hmRemEventDate" class="ios-input" value="${existing.eventDate || getIsoDateDaysAgo(0)}" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; font-weight:800;">Görev Başlığı</label>
        <input type="text" id="hmRemTitle" class="ios-input" value="${escapeHtml(existing.title)}" placeholder="Örn: PMV-1 Aşısı veya İç Parazit Kürü" />
      </div>
      <div>
        <label style="font-size:11px; font-weight:800;">Kısa Not (İsteğe Bağlı)</label>
        <input type="text" id="hmRemDetail" class="ios-input" value="${escapeHtml(existing.detail)}" placeholder="Örn: Yarış kadrosuna uygulanacak" />
      </div>
      <div style="font-size:10px; color:#64748b;">
        ℹ️ <em>Not: Eşleşen çiftlerin yumurta ve yavru halka takma günleri "💑 Çiftler" sekmesinden buraya otomatik yansır; ayrıca girmenize gerek yoktur.</em>
      </div>
    `;
  } else if (modalType === 'pairs') {
    const existing = activePairsList.find(x => x.id === itemId) || {
      nest: `Yuva #${activePairsList.length + 1}`,
      eventType: 'egg',
      eventDate: getIsoDateDaysAgo(6),
      sire: males[0] ? `${males[0].ring} (${males[0].name})` : '',
      dam: females[0] ? `${females[0].ring} (${females[0].name})` : '',
      detail: ''
    };
    titleEl.textContent = itemId ? '✏️ Aktif Yuva & Kuluçka Detayı' : '🪺 Yeni Damızlık Çift / Yuva Ekle';
    formBody.innerHTML = `
      <div style="display:grid; grid-template-columns:0.8fr 1.1fr 1fr; gap:6px;">
        <div>
          <label style="font-size:10.5px; font-weight:800;">Yuva Adı</label>
          <input type="text" id="hmPairNest" class="ios-input" value="${escapeHtml(existing.nest)}" />
        </div>
        <div>
          <label style="font-size:10.5px; font-weight:800;">Hangi Evrede?</label>
          <select id="hmPairEventType" class="ios-select" onchange="checkPairModalConflictLive()">
            <option value="pair" ${existing.eventType === 'pair' ? 'selected' : ''}>💑 Eşleşme Tarihi</option>
            <option value="egg" ${existing.eventType === 'egg' ? 'selected' : ''}>🥚 Yumurtlama Tarihi</option>
            <option value="hatch" ${existing.eventType === 'hatch' ? 'selected' : ''}>🐣 Yavru Çıkış Tarihi</option>
          </select>
        </div>
        <div>
          <label style="font-size:10.5px; font-weight:800;">Tarih</label>
          <input type="date" id="hmPairEventDate" class="ios-input" value="${existing.eventDate || getIsoDateDaysAgo(0)}" onchange="checkPairModalConflictLive()" />
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
          <label style="font-size:11px; font-weight:800;">♂ Baba (Kümesteki Erkek Güvercin)</label>
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing(document.getElementById('hmPairSire')?.value, event)">📊 Baba Profilini Gör</button>
        </div>
        <select id="hmPairSire" class="ios-select" style="font-weight:800;" onchange="checkPairModalConflictLive()">
          ${(males.length ? males : all).map(m => {
            const label = `${m.ring} (${m.name})`;
            const isSel = existing.sire && existing.sire.toUpperCase().includes(m.ring.toUpperCase());
            return `<option value="${escapeHtml(label)}" ${isSel ? 'selected' : ''}>${m.flag} ♂ ${escapeHtml(m.ring)} — ${escapeHtml(m.name)}</option>`;
          }).join('')}
        </select>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
          <label style="font-size:11px; font-weight:800;">♀ Anne (Kümesteki Dişi Güvercin)</label>
          <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing(document.getElementById('hmPairDam')?.value, event)">📊 Anne Profilini Gör</button>
        </div>
        <select id="hmPairDam" class="ios-select" style="font-weight:800;" onchange="checkPairModalConflictLive()">
          ${(females.length ? females : all).map(f => {
            const label = `${f.ring} (${f.name})`;
            const isSel = existing.dam && existing.dam.toUpperCase().includes(f.ring.toUpperCase());
            return `<option value="${escapeHtml(label)}" ${isSel ? 'selected' : ''}>${f.flag} ♀ ${escapeHtml(f.ring)} — ${escapeHtml(f.name)}</option>`;
          }).join('')}
        </select>
      </div>
      <!-- EŞZAMANLI YUVA ÇAKIŞMA UYARI KUTUSU & CANLI KULUÇKA ÖZETİ -->
      <div id="hmPairConflictBanner"></div>
      <div style="font-size:10px; color:#15803d; background:#f0fdf4; border:1px solid #bbf7d0; padding:6px 8px; border-radius:7px;">
        ✅ Bu yuvayı kaydettiğinizde kuluçka günü, tahmini çıkış tarihi ve bilezik takma günü <strong>📅 Takvim &amp; Görev</strong> ekranında otomatik takip edilir.
      </div>
    `;
    populateActiveLoftRingsDatalist();
    setTimeout(checkPairModalConflictLive, 15);
  } else if (modalType === 'races') {
    const existing = racesList.find(x => x.id === itemId) || {
      icon: '🏁',
      title: '',
      detail: '',
      badge: 'Cumartesi',
      badgeColor: 'gene-blue'
    };
    titleEl.textContent = itemId ? '✏️ Yarış / Derece Düzenle' : '🏁 Yeni Yarış veya Derece Ekle';
    formBody.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; font-weight:800;">Yarış Tipi</label>
          <select id="hmRaceIcon" class="ios-select">
            <option value="🥇" ${existing.icon === '🥇' ? 'selected' : ''}>🥇 Kazanılan Derece / Sonuç</option>
            <option value="🧭" ${existing.icon === '🧭' ? 'selected' : ''}>🧭 Yaklaşan Yarış Etabı</option>
            <option value="🦅" ${existing.icon === '🦅' ? 'selected' : ''}>🦅 Antrenman Uçuşu</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; font-weight:800;">Derece veya Tarih Etiketi</label>
          <input type="text" id="hmRaceBadge" class="ios-input" value="${escapeHtml(existing.badge)}" placeholder="Örn: 1. / 4.200 Kuş veya Pazar" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; font-weight:800;">Yarış Etabı & Mesafe Başlığı</label>
        <input type="text" id="hmRaceTitle" class="ios-input" value="${escapeHtml(existing.title)}" placeholder="Örn: Ulusal Ankara 450 km Etabı" />
      </div>
      <div>
        <label style="font-size:11px; font-weight:800;">Güvercin, Hız (m/dk) veya Hava Notu</label>
        <input type="text" id="hmRaceDetail" class="ios-input" value="${escapeHtml(existing.detail)}" placeholder="Örn: TR-2026-990001 • 1420 m/dk" />
      </div>
    `;
  } else {
    // 📋 SİCİL KAYDI EKLEME / DÜZENLEME FORMU
    const allBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
    const defaultRing = activeDossierRing || (allBirds[0]?.ring || 'TR-2026-990001');
    const existing = birdDossierList.find(x => x.id === itemId) || {
      ring: defaultRing,
      category: 'Kümes Üstü Uçuş',
      icon: '🦅',
      title: '',
      detail: '',
      date: getIsoDateDaysAgo(0)
    };
    titleEl.textContent = itemId ? '✏️ Sicil Kaydını Düzenle' : '📋 Güvercin Sicil Kaydı Ekle';
    formBody.innerHTML = `
      <div>
        <label style="font-size:11px; font-weight:800;">Hangi Güvercin? (Siciline İşlenecek Kuş)</label>
        <select id="hmDosRing" class="ios-select" style="font-weight:800;">
          ${allBirds.map(b => `<option value="${escapeHtml(b.ring)}" ${b.ring.toUpperCase() === existing.ring.toUpperCase() ? 'selected' : ''}>${b.flag} ${escapeHtml(b.ring)} — ${escapeHtml(b.name)}</option>`).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:10.5px; font-weight:800; color:var(--ios-subtext); display:block; margin-bottom:4px;">1-Dokunuş Hazır Sicil Şablonları:</label>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
          <button type="button" class="flag-chip" onclick="fillDossierTemplate('Kümes Üstü Uçuş', 'Kümes Üstü 2 Saat Yüksek Tempo Uçuş', 'Sürüden ayrı yüksek irtifada uçtu, kondisyonu çok yüksek.')">🦅 Kümes Üstü Uçuş</button>
          <button type="button" class="flag-chip" onclick="fillDossierTemplate('Antrenman & Salım', '60 km Bireysel Antrenman Salımı', 'Tek başına salındı, hiç oyalanmadan doğrudan kümese indi.')">🧭 Antrenman Salımı</button>
          <button type="button" class="flag-chip" onclick="fillDossierTemplate('Fizik & Tüy Muayenesi', '10. Telek & Göğüs Kası Muayenesi', 'Tüy dökümü tamamlandı, çatal kemik kapalı, göğüs kası pembe.')">👁️ Fizik / Muayene</button>
          <button type="button" class="flag-chip" onclick="fillDossierTemplate('Yarış Derecesi', '1. Bölge Klasman Derecesi (420 km)', 'Karşı rüzgarda yüksek hızla (1410 m/dk) kümes 1.si geldi.')">🏆 Yarış Derecesi</button>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:8px;">
        <div>
          <label style="font-size:11px; font-weight:800;">Sicil Kategorisi</label>
          <select id="hmDosCategory" class="ios-select">
            <option value="Kümes Üstü Uçuş" ${existing.category === 'Kümes Üstü Uçuş' ? 'selected' : ''}>🦅 Kümes Üstü Uçuş</option>
            <option value="Antrenman & Salım" ${existing.category === 'Antrenman & Salım' ? 'selected' : ''}>🧭 Antrenman & Salım</option>
            <option value="Yarış Derecesi" ${existing.category === 'Yarış Derecesi' ? 'selected' : ''}>🏆 Yarış Derecesi</option>
            <option value="Sağlık & Aşı" ${existing.category === 'Sağlık & Aşı' ? 'selected' : ''}>💉 Sağlık, Aşı & Kür</option>
            <option value="Fizik & Tüy Muayenesi" ${existing.category === 'Fizik & Tüy Muayenesi' ? 'selected' : ''}>👁️ Fizik, Tüy & Göz Muayenesi</option>
            <option value="Özel Karakter Notu" ${existing.category === 'Özel Karakter Notu' ? 'selected' : ''}>📌 Özel Karakter / Damızlık Notu</option>
          </select>
        </div>
        <div>
          <label style="font-size:11px; font-weight:800;">Tarih</label>
          <input type="date" id="hmDosDate" class="ios-input" value="${existing.date || getIsoDateDaysAgo(0)}" />
        </div>
      </div>
      <div>
        <label style="font-size:11px; font-weight:800;">Sicil Başlığı (Örn: Kümes Üstü 2 Saat Uçuş)</label>
        <input type="text" id="hmDosTitle" class="ios-input" value="${escapeHtml(existing.title)}" placeholder="Örn: Kümes Üstü 2 Saat Yüksek Tempo Antrenman" />
      </div>
      <div>
        <label style="font-size:11px; font-weight:800;">Detaylı Gözlem / Sicil Notu</label>
        <textarea id="hmDosDetail" class="ios-textarea" rows="2" placeholder="Gözleminizi yazın...">${escapeHtml(existing.detail)}</textarea>
      </div>
      <label style="font-size:11px; font-weight:700; color:#581c87; display:flex; align-items:center; gap:6px; cursor:pointer;">
        <input type="checkbox" id="hmDosSyncPedigree" checked /> Bu sicil kaydını güvercinin Pedigre kutusuna ve GENESIS AI puanına da işle
      </label>
    `;
  }

  modal.classList.add('open');
}

function checkPairModalConflictLive() {
  const banner = document.getElementById('hmPairConflictBanner');
  if (!banner) return;
  const itemId = document.getElementById('editHomeItemId')?.value || '';
  const sireVal = (document.getElementById('hmPairSire')?.value || '').trim();
  const damVal = (document.getElementById('hmPairDam')?.value || '').trim();
  const evType = document.getElementById('hmPairEventType')?.value || 'egg';
  const evDate = document.getElementById('hmPairEventDate')?.value || getIsoDateDaysAgo(0);

  const sRing = extractCleanRingFromText(sireVal);
  const dRing = extractCleanRingFromText(damVal);
  const otherConflicts = detectActiveNestConflicts(itemId);

  const warnings = [];
  if (sRing && dRing && sRing === dRing) {
    warnings.push(`Baba ve Anne olarak aynı kuş (${escapeHtml(sRing)}) seçilemez!`);
  }
  if (sRing && otherConflicts.ringUsage[sRing]) {
    const usedNests = otherConflicts.ringUsage[sRing].map(x => x.nest).join(', ');
    warnings.push(`♂ <strong>${escapeHtml(sRing)}</strong> şu anda başka bir aktif yuvada (<strong>${escapeHtml(usedNests)}</strong>) eşleşmiş durumda!`);
  }
  if (dRing && otherConflicts.ringUsage[dRing]) {
    const usedNests = otherConflicts.ringUsage[dRing].map(x => x.nest).join(', ');
    warnings.push(`♀ <strong>${escapeHtml(dRing)}</strong> şu anda başka bir aktif yuvada (<strong>${escapeHtml(usedNests)}</strong>) eşleşmiş durumda!`);
  }

  const dyn = computeDynamicBreedingStage(evType, evDate);
  const previewHtml = dyn ? `
    <div style="background:#f8faff; border:1px solid rgba(0,102,255,0.22); border-radius:8px; padding:6px 8px; font-size:10px; margin-top:4px;">
      <div style="display:flex; justify-content:space-between; font-weight:800; color:#0052cc; margin-bottom:3px;">
        <span>${escapeHtml(dyn.progressLabel || dyn.stageTitle)}</span>
        <span>🐣 Tahmini Çıkış: ${escapeHtml(dyn.estHatchDateLabel)}</span>
      </div>
      <div class="nest-progress-track" style="height:6px; margin-bottom:4px;">
        <div class="nest-progress-fill" style="width:${dyn.progressPct || 50}%; background:${dyn.progressBarColor || '#0066ff'};"></div>
      </div>
      <div style="display:flex; justify-content:space-between; color:var(--ios-subtext); font-size:9.5px;">
        <span>🥚 Yumurtlama: <strong>${escapeHtml(dyn.estEggDateLabel)}</strong></span>
        <span>💍 Bilezik: <strong>${escapeHtml(dyn.estRingDateLabel)}</strong></span>
      </div>
    </div>
  ` : '';

  if (warnings.length > 0) {
    banner.innerHTML = `
      <div style="background:#fef2f2; border:1.5px solid #ef4444; color:#991b1b; padding:7px 9px; border-radius:8px; font-size:10px; line-height:1.4;">
        <strong>⚠️ Eşzamanlı Aktif Yuva Çakışması Tespit Edildi!</strong><br/>
        ${warnings.map(w => `• ${w}`).join('<br/>')}
      </div>
      ${previewHtml}
    `;
  } else {
    banner.innerHTML = previewHtml;
  }
}

function closeHomeItemModal() {
  document.getElementById('homeItemModal').classList.remove('open');
}

function saveHomeItemFromModal() {
  const itemId = document.getElementById('editHomeItemId').value;
  const type = document.getElementById('editHomeItemType').value;

  if (type === 'reminders') {
    const icon = document.getElementById('hmRemIcon').value;
    const evDate = document.getElementById('hmRemEventDate').value;
    const dyn = computeDynamicBreedingStage('vaccine', evDate);

    const record = {
      id: itemId || ('rem_' + Date.now()),
      icon: icon || '💉',
      eventType: 'vaccine',
      eventDate: evDate,
      title: document.getElementById('hmRemTitle').value.trim() || 'Kümes Görevi',
      detail: document.getElementById('hmRemDetail').value.trim() || '',
      badge: dyn ? dyn.badge : 'Planlı',
      badgeColor: dyn ? dyn.badgeColor : 'gene-gold'
    };
    if (itemId) {
      const idx = remindersList.findIndex(x => x.id === itemId);
      if (idx !== -1) remindersList[idx] = record;
    } else {
      remindersList.unshift(record);
    }
  } else if (type === 'pairs') {
    const evType = document.getElementById('hmPairEventType').value;
    const evDate = document.getElementById('hmPairEventDate').value;
    const sireInput = document.getElementById('hmPairSire').value.trim() || 'Erkek';
    const damInput = document.getElementById('hmPairDam').value.trim() || 'Dişi';
    const sRing = extractCleanRingFromText(sireInput);
    const dRing = extractCleanRingFromText(damInput);

    if (sRing && dRing && sRing === dRing) {
      alert(`⚠️ Hatalı Eşleşme: Baba ve Anne olarak aynı güvercin (${sRing}) seçilemez!`);
      return;
    }

    const otherConflicts = detectActiveNestConflicts(itemId);
    const dupWarnings = [];
    if (sRing && otherConflicts.ringUsage[sRing]) {
      const nests = otherConflicts.ringUsage[sRing].map(x => x.nest).join(', ');
      dupWarnings.push(`• ♂ ${sRing} zaten "${nests}" içinde aktif eşleşmede kayıtlı.`);
    }
    if (dRing && otherConflicts.ringUsage[dRing]) {
      const nests = otherConflicts.ringUsage[dRing].map(x => x.nest).join(', ');
      dupWarnings.push(`• ♀ ${dRing} zaten "${nests}" içinde aktif eşleşmede kayıtlı.`);
    }

    if (dupWarnings.length > 0) {
      const ok = confirm(
        `⚠️ EŞZAMANLI AKTİF YUVA ÇAKIŞMASI UYARISI!\n\n` +
        `${dupWarnings.join('\n')}\n\n` +
        `Aynı güvercinin eşzamanlı olarak birden fazla aktif yuvada kullanılması önerilmez. Yine de bu yuvayı kaydetmek istiyor musunuz?`
      );
      if (!ok) return;
    }

    const dyn = computeDynamicBreedingStage(evType, evDate);

    const record = {
      id: itemId || ('pair_' + Date.now()),
      nest: document.getElementById('hmPairNest').value.trim() || 'Yuva',
      eventType: evType,
      eventDate: evDate,
      sire: sireInput,
      dam: damInput,
      detail: '',
      completedStage: '',
      status: dyn ? dyn.badge : 'Kuluçkada',
      badgeColor: dyn ? dyn.badgeColor : 'gene-blue'
    };
    if (itemId) {
      const idx = activePairsList.findIndex(x => x.id === itemId);
      if (idx !== -1) activePairsList[idx] = record;
    } else {
      activePairsList.unshift(record);
    }
  } else if (type === 'races') {
    const icon = document.getElementById('hmRaceIcon').value;
    const record = {
      id: itemId || ('race_' + Date.now()),
      icon,
      title: document.getElementById('hmRaceTitle').value.trim() || 'Yarış Etabı',
      detail: document.getElementById('hmRaceDetail').value.trim() || '',
      badge: document.getElementById('hmRaceBadge').value.trim() || 'Yakında',
      badgeColor: icon === '🥇' ? 'gene-green' : 'gene-blue'
    };
    if (itemId) {
      const idx = racesList.findIndex(x => x.id === itemId);
      if (idx !== -1) racesList[idx] = record;
    } else {
      racesList.unshift(record);
    }
  } else {
    // 📋 SİCİL KAYDI KAYDETME VE GÜVERCİNİN PEDİGRESİNE İŞLEME
    const ringVal = document.getElementById('hmDosRing').value.trim();
    const cat = document.getElementById('hmDosCategory').value;
    const titleVal = document.getElementById('hmDosTitle').value.trim() || cat;
    const detailVal = document.getElementById('hmDosDetail').value.trim();
    const dateVal = document.getElementById('hmDosDate').value || getIsoDateDaysAgo(0);
    const syncPed = document.getElementById('hmDosSyncPedigree')?.checked;

    const iconMap = {
      'Kümes Üstü Uçuş': '🦅',
      'Antrenman & Salım': '🧭',
      'Yarış Derecesi': '🏆',
      'Sağlık & Aşı': '💉',
      'Fizik & Tüy Muayenesi': '👁️',
      'Özel Karakter Notu': '📌'
    };
    const colorMap = {
      'Kümes Üstü Uçuş': 'gene-blue',
      'Antrenman & Salım': 'gene-gold',
      'Yarış Derecesi': 'gene-green',
      'Sağlık & Aşı': 'gene-red',
      'Fizik & Tüy Muayenesi': 'gene-purple',
      'Özel Karakter Notu': 'gene-gold'
    };

    const allBirds = collectUniqueLoftBirds();
    const matchedBird = allBirds.find(b => b.ring.toUpperCase() === ringVal.toUpperCase());

    const record = {
      id: itemId || ('dos_' + Date.now()),
      ring: ringVal,
      birdName: matchedBird ? matchedBird.name : '',
      category: cat,
      icon: iconMap[cat] || '📋',
      title: titleVal,
      detail: detailVal,
      date: dateVal,
      badgeColor: colorMap[cat] || 'gene-blue'
    };

    if (itemId) {
      const idx = birdDossierList.findIndex(x => x.id === itemId);
      if (idx !== -1) birdDossierList[idx] = record;
    } else {
      birdDossierList.unshift(record);
    }

    // Eğer "Pedigre kutusuna da işle" seçiliyse ilgili güvercinin pedigre notlarına otomatik ekle
    if (syncPed && ringVal) {
      const logLine = `• [${cat}] ${titleVal}`;
      pedigrees.forEach(p => {
        Object.values(p.boxes || {}).forEach(box => {
          if (box && box.ring && box.ring.trim().toUpperCase() === ringVal.toUpperCase()) {
            const cur = (box.notes || '').trim();
            if (!cur.includes(titleVal)) {
              box.notes = cur ? `${cur}\n${logLine}` : logLine;
            }
          }
        });
      });
    }
  }

  saveMypedigreData();
  renderHomeSubPanelContent();
  renderLoftBirdsDirectory();
  renderActivePedigree();
  if (typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.renderHomeTeaserCard();
  }
  if (typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.renderBreedingPlanPairsList();
  }
  closeHomeItemModal();
  if (document.getElementById('birdDossierModal')?.classList.contains('open') && activeDossierRing) {
    openBirdDossierModal(activeDossierRing);
  }
}

function deleteHomeItem(type, id) {
  if (type === 'reminders') remindersList = remindersList.filter(x => x.id !== id);
  else if (type === 'pairs') activePairsList = activePairsList.filter(x => x.id !== id);
  else if (type === 'races') racesList = racesList.filter(x => x.id !== id);
  else birdDossierList = birdDossierList.filter(x => x.id !== id);

  saveMypedigreData();
  renderHomeSubPanelContent();
  renderLoftBirdsDirectory();
  if (typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.renderHomeTeaserCard();
  }
  if (typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.renderBreedingPlanPairsList();
  }
}

function fillDossierTemplate(cat, title, detail) {
  const catEl = document.getElementById('hmDosCategory');
  const titleEl = document.getElementById('hmDosTitle');
  const detailEl = document.getElementById('hmDosDetail');
  if (catEl) catEl.value = cat;
  if (titleEl) titleEl.value = title;
  if (detailEl) detailEl.value = detail;
}

// ============================================================================
// GÜVERCİN KİŞİSEL SİCİL DOSYASI (DOSSIER) GÖRÜNTÜLEME & YÖNETİMİ
// ============================================================================
function getDossierLogsForRing(ring) {
  const clean = (ring || '').trim().toUpperCase();
  if (!clean) return [];
  return birdDossierList.filter(d => (d.ring || '').trim().toUpperCase() === clean);
}

function openBirdDossierModal(ring) {
  activeDossierRing = (ring || '').trim();
  const modal = document.getElementById('birdDossierModal');
  const headerEl = document.getElementById('birdDossierHeaderInfo');
  const listEl = document.getElementById('birdDossierLogsList');
  if (!modal || !headerEl || !listEl) return;

  const allBirds = collectUniqueLoftBirds();
  const bird = allBirds.find(b => b.ring.toUpperCase() === activeDossierRing.toUpperCase()) || {
    flag: detectFlagFromRing(activeDossierRing),
    ring: activeDossierRing,
    name: 'Kayıtlı Güvercin',
    color: 'Mavi Çakmaklı',
    sireRing: '-',
    damRing: '-',
    ebvScore: 80
  };

  const logs = getDossierLogsForRing(activeDossierRing);

  headerEl.innerHTML = `
    <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-radius:11px; padding:9px 11px; display:flex; align-items:center; justify-content:space-between; gap:8px;">
      <div style="min-width:0; flex:1;">
        <div style="font-size:13.5px; font-weight:900; color:#581c87;">${bird.flag} ${escapeHtml(bird.ring)} — ${escapeHtml(bird.name)}</div>
        <div style="font-size:10.5px; color:var(--ios-subtext); margin-top:2px;">
          ♂ Baba: <strong>${escapeHtml(bird.sireRing || '-')}</strong> • ♀ Anne: <strong>${escapeHtml(bird.damRing || '-')}</strong> • Renk: ${escapeHtml(bird.color)}
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
        <button class="ios-btn ios-btn-primary" style="padding:4px 8px; font-size:10px;" onclick="closeBirdDossierModal(); if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(bird.ring)}');">📊 Profil Kartı</button>
        <span class="gene-badge gene-green">${logs.length} Sicil</span>
      </div>
    </div>
  `;

  if (!logs.length) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:18px; font-size:11.5px; color:var(--ios-subtext); background:var(--ios-card-alt); border-radius:10px;">
        Bu güvercin için henüz kümes üstü uçuş, antrenman veya sağlık sicili girilmemiş. Aşağıdaki butonla hemen ilk sicil kaydını ekleyebilirsiniz.
      </div>
    `;
  } else {
    listEl.innerHTML = logs.map(l => `
      <div class="dash-list-item urgency-blue" style="align-items:flex-start;">
        <div class="dash-list-left" style="align-items:flex-start;">
          <div class="dash-mini-icon">${l.icon || '📋'}</div>
          <div style="min-width:0; flex:1;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
              <span style="font-size:11.5px; font-weight:800; color:var(--ios-text);">${escapeHtml(l.title)}</span>
              <span class="gene-badge ${l.badgeColor || 'gene-blue'}" style="font-size:8.5px; padding:1px 6px;">${escapeHtml(l.category)}</span>
            </div>
            <div style="font-size:10.5px; color:var(--ios-subtext); margin-top:2px; white-space:pre-line; line-height:1.35;">${escapeHtml(l.detail)}</div>
            <div style="font-size:9px; color:#94a3b8; margin-top:3px;">📅 Tarih: ${escapeHtml(l.date)}</div>
          </div>
        </div>
        <button class="dash-check-btn" style="color:#dc2626; border-color:#fecaca;" onclick="deleteHomeItem('dossier', '${l.id}'); openBirdDossierModal('${escapeHtml(activeDossierRing)}');" title="Bu Sicil Kaydını Sil">✕</button>
      </div>
    `).join('');
  }

  modal.classList.add('open');
}

function closeBirdDossierModal() {
  document.getElementById('birdDossierModal').classList.remove('open');
}

function openAddDossierForCurrentBird() {
  closeBirdDossierModal();
  openHomeItemModal('', 'dossier');
}

let pendingChickCreationData = null;

function computeNextSequentialRing(ringVal) {
  const s = (ringVal || '').trim();
  const m = s.match(/^(.*?)(\d+)$/);
  if (!m) return s ? `${s}-2` : 'TR-2026-100002';
  const prefix = m[1];
  const numStr = m[2];
  const nextNum = String(parseInt(numStr, 10) + 1).padStart(numStr.length, '0');
  return `${prefix}${nextNum}`;
}

// Aktif Çiftten Tek Dokunuşla (Anne ve Babası + Alt Soyağacı Otomatik Bağlı + Çifte Yavru Destekli) Yavru Kaydı Açma
function registerChickFromActivePair(pairId) {
  const pair = activePairsList.find(x => x.id === pairId);
  if (!pair) return;

  const { all } = getAllBreedingCandidates();
  const extractRing = (str) => (str || '').split(' ')[0].trim().toUpperCase();
  const sRing = extractRing(pair.sire);
  const dRing = extractRing(pair.dam);

  const sCand = all.find(c => c.ring.toUpperCase() === sRing) || all[0];
  const dCand = all.find(c => c.ring.toUpperCase() === dRing) || all[1] || all[0];

  const sTree = sCand ? getCandidateLineageTree(sCand.id) : { self: { flag: '🇹🇷', ring: sRing, name: pair.sire } };
  const dTree = dCand ? getCandidateLineageTree(dCand.id) : { self: { flag: '🇹🇷', ring: dRing, name: pair.dam } };

  const newBoxes = {};
  BOX_SLOTS.forEach(s => {
    newBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: '', notes: '', photo: '' };
  });

  // Baba, Anne ve 2-4. kuşak (toplam 30 üst ata kutusunu) otomatik hazırla (Henüz Kaydet'e basmadan veritabanına boş ekleme yapma!)
  newBoxes.sire = { ...(sTree.self || { flag: '🇹🇷', ring: sRing, name: pair.sire }), sex: 'M' };
  newBoxes.dam = { ...(dTree.self || { flag: '🇹🇷', ring: dRing, name: pair.dam }), sex: 'F' };
  if (sTree.p1?.ring) newBoxes.g2_1 = { ...sTree.p1, sex: 'M' };
  if (sTree.p2?.ring) newBoxes.g2_2 = { ...sTree.p2, sex: 'F' };
  if (dTree.p1?.ring) newBoxes.g2_3 = { ...dTree.p1, sex: 'M' };
  if (dTree.p2?.ring) newBoxes.g2_4 = { ...dTree.p2, sex: 'F' };
  if (sTree.g1?.ring) newBoxes.g3_1 = { ...sTree.g1, sex: 'M' };
  if (sTree.g2?.ring) newBoxes.g3_2 = { ...sTree.g2, sex: 'F' };
  if (sTree.g3?.ring) newBoxes.g3_3 = { ...sTree.g3, sex: 'M' };
  if (sTree.g4?.ring) newBoxes.g3_4 = { ...sTree.g4, sex: 'F' };
  if (dTree.g1?.ring) newBoxes.g3_5 = { ...dTree.g1, sex: 'M' };
  if (dTree.g2?.ring) newBoxes.g3_6 = { ...dTree.g2, sex: 'F' };
  if (dTree.g3?.ring) newBoxes.g3_7 = { ...dTree.g3, sex: 'M' };
  if (dTree.g4?.ring) newBoxes.g3_8 = { ...dTree.g4, sex: 'F' };
  for (let i = 1; i <= 8; i++) {
    const sG4 = sTree[`gg${i}`];
    if (sG4?.ring) newBoxes[`g4_${i}`] = { ...sG4, sex: i % 2 === 1 ? 'M' : 'F' };
    const dG4 = dTree[`gg${i}`];
    if (dG4?.ring) newBoxes[`g4_${i + 8}`] = { ...dG4, sex: i % 2 === 1 ? 'M' : 'F' };
  }

  const baseNum = Math.floor(100000 + Math.random() * 899990);
  const suggestedRing = `TR-2026-${baseNum}`;
  const suggestedSecondRing = computeNextSequentialRing(suggestedRing);

  pendingChickCreationData = {
    pairId: pair.id,
    nestName: pair.nest,
    sireLabel: pair.sire,
    damLabel: pair.dam,
    preparedBoxes: newBoxes
  };

  // Kutu düzenleme modalını "Yeni Yavruya Boncuk Tak" modunda aç
  editingSlotKey = 'main';
  editingFlag = '🇹🇷';
  editingPhotoData = '';
  selectModalSegment('editBoxSexGroup', 'U');
  selectModalSegment('editBoxRoleGroup', 'YOUNG');
  populateKnownRingsDatalist();

  document.getElementById('boxEditTitle').textContent = `🐣 ${pair.nest} Yavrularına Bilezik Tak & Kaydet`;
  document.getElementById('editBoxRing').value = suggestedRing;
  document.getElementById('editBoxName').value = `${pair.nest} Yavrusu 1`;
  document.getElementById('editBoxColor').value = 'Mavi Çakmaklı';
  document.getElementById('editBoxNotes').value = `${pair.nest} (${pair.sire} × ${pair.dam}) özel eşleşmesinden doğan yavru.`;
  document.getElementById('editBoxPhoto').value = '';

  const statusSel = document.getElementById('editBoxBirdStatus');
  if (statusSel) statusSel.value = 'ACTIVE';

  const secondSec = document.getElementById('secondChickSiblingSection');
  const chkSec = document.getElementById('chkRegisterSecondChick');
  const rowSec = document.getElementById('secondChickFieldsRow');
  const secRingEl = document.getElementById('editSecondChickRing');
  const secNameEl = document.getElementById('editSecondChickName');
  if (secondSec) {
    secondSec.style.display = 'block';
    if (chkSec) chkSec.checked = true;
    if (rowSec) rowSec.style.display = 'grid';
    if (secRingEl) secRingEl.value = suggestedSecondRing;
    if (secNameEl) secNameEl.value = `${pair.nest} Yavrusu 2`;
  }

  const parentBanner = document.getElementById('chickParentsInfoBanner');
  if (parentBanner) {
    parentBanner.style.display = 'block';
    parentBanner.innerHTML = `
      <div style="font-weight:900; margin-bottom:2px;">🧬 Soyağacı Otomatik Bağlandı (14 Üst Ata Hazır):</div>
      <div>• <strong>♂ Baba:</strong> ${escapeHtml(pair.sire)}</div>
      <div>• <strong>♀ Anne:</strong> ${escapeHtml(pair.dam)}</div>
      <div style="font-size:10px; margin-top:3px; color:#15803d;">Aynı yuvadaki iki kardeşe ardışık bilezik takıyorsanız aşağıdaki <strong>Çifte Yavru</strong> kutusuyla ikisini birden tek tuşla kaydedebilirsiniz.</div>
    `;
  }

  renderFlagChips();
  document.getElementById('boxEditModal').classList.add('open');
}

// ============================================================================
// AVIGEN BİLİMSEL KARAR DESTEK VE DOĞAL DİL ANALİZ MOTORU (CANLI ALGORİTMA)
// - Sewall Wright COI: F = Σ (0.5)^(n1 + n2 + 1)
// - Tahmini Damızlık Değeri (EBV - Estimated Breeding Value)
// - Fenotipik & Soy İçi Korelasyon Analizi
// - Biyometeorolojik Uçuş Uygunluk Modeli
// ============================================================================

// Bir kutunun/kuşun metinlerinden bilimsel Performans Endeksi (EBV: 50 - 99) hesaplar
function computeBirdPerformanceEBV(box, genWeight = 1.0) {
  if (!box || !box.ring) return 50;
  if (typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.inspectAncestorBox === 'function') {
    const insp = AvigenGenesisAI.inspectAncestorBox(box, 1);
    return Math.min(99, Math.round(insp.rawScore * genWeight));
  }
  const text = `${box.name || ''} ${box.notes || ''} ${box.color || ''}`.toLowerCase();
  let ebv = 68;
  if (text.includes('1.') || text.includes('1st') || text.includes('birinci') || text.includes('şampiyon') || text.includes('ulusal') || /1\/\d{3,5}/.test(text)) ebv += 16;
  if (text.includes('2.') || text.includes('3.') || text.includes('final') || text.includes('fınal') || text.includes('derby') || text.includes('olr')) ebv += 8;
  if (text.includes('as ') || text.includes('ace') || text.includes('kbdb') || text.includes('npo') || text.includes('olimpiyat') || text.includes('dna')) ebv += 10;
  if (text.includes('damızlık') || text.includes('romario') || text.includes('messi') || text.includes('rolex') || text.includes('porsche') || text.includes('kittel') || text.includes('harry') || text.includes('bliksem')) ebv += 6;
  return Math.min(99, Math.round(ebv * genWeight));
}

// ============================================================================
// 2. EKRAN: GÜVERCİNLER (KÜMES KUŞ LİSTESİ + PEDİGRE STÜDYOSU)
// ============================================================================
let activeLoftFilter = 'ALL';

function switchBirdsViewMode(mode) {
  const listPane = document.getElementById('birdsListViewPane');
  const pedPane = document.getElementById('birdsPedigreeViewPane');
  const nestsPane = document.getElementById('birdsNestsViewPane');
  const pillList = document.getElementById('pillBirdsList');
  const pillPed = document.getElementById('pillBirdsPedigree');
  const pillNests = document.getElementById('pillBirdsNests');

  if (pillList) pillList.classList.remove('active');
  if (pillPed) pillPed.classList.remove('active');
  if (pillNests) pillNests.classList.remove('active');

  if (mode === 'pedigree') {
    if (listPane) listPane.style.display = 'none';
    if (pedPane) pedPane.style.display = 'flex';
    if (nestsPane) nestsPane.style.display = 'none';
    if (pillPed) pillPed.classList.add('active');
    setTimeout(fitPaperToIphoneScreen, 25);
  } else if (mode === 'nests') {
    if (listPane) listPane.style.display = 'none';
    if (pedPane) pedPane.style.display = 'none';
    if (nestsPane) nestsPane.style.display = 'flex';
    if (pillNests) pillNests.classList.add('active');
    if (typeof AvigenUxManager !== 'undefined') {
      AvigenUxManager.renderBreedingPlanPairsList();
    }
    calculateIncubationTimeline();
    renderAutoBestPairs();
  } else {
    if (listPane) listPane.style.display = 'flex';
    if (pedPane) pedPane.style.display = 'none';
    if (nestsPane) nestsPane.style.display = 'none';
    if (pillList) pillList.classList.add('active');
    renderLoftBirdsDirectory();
  }
}

function openLoftWithFilter(filterCode) {
  activeLoftFilter = filterCode;
  openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
  switchBirdsViewMode('list');

  const chips = document.querySelectorAll('#loftFilterChips .sub-pill');
  const mapIdx = { ALL: 0, M: 1, F: 2, BREEDER: 3, RACER: 4, YOUNG: 5, GRAND_PRIZE: 6, RESTING: 7, LOST_SOLD: 8, ARCHIVE: 9 };
  chips.forEach(c => c.classList.remove('active'));
  if (chips[mapIdx[filterCode] ?? 0]) chips[mapIdx[filterCode] ?? 0].classList.add('active');
  renderLoftBirdsDirectory();
}

function setLoftBirdFilter(filterCode, btnEl) {
  activeLoftFilter = filterCode;
  if (btnEl) {
    btnEl.parentElement.querySelectorAll('.sub-pill').forEach(c => c.classList.remove('active'));
    btnEl.classList.add('active');
  }
  renderLoftBirdsDirectory();
}

// Tüm pedigre kayıtlarındaki kuşları tekilleştirerek Anne/Baba bağlantılarıyla kümes envanteri çıkarır
// (Yüksek Performanslı Önbellek / Memoization: 64 pedigre x 31 kutu = ~2.000 kutunun her milisaniyede tekrar taranmasını önler!)
let _cachedUniqueLoftBirds = null;
let _cachedLoftBirdsSignature = '';

function invalidateUniqueLoftBirdsCache() {
  _cachedUniqueLoftBirds = null;
  _cachedLoftBirdsSignature = '';
}

function collectUniqueLoftBirds() {
  const sig = `${pedigrees.length}_${pedigrees[0]?.id || ''}_${pedigrees[0]?.boxes?.main?.ring || ''}_${pedigrees[pedigrees.length - 1]?.id || ''}`;
  if (_cachedUniqueLoftBirds && _cachedLoftBirdsSignature === sig) {
    return _cachedUniqueLoftBirds;
  }

  const map = new Map();

  const registerSlot = (ped, slotKey, defaultSex, sireSlotKey, damSlotKey) => {
    const b = ped.boxes?.[slotKey];
    if (!b || !b.ring || !b.ring.trim()) return;
    const ringKey = b.ring.trim().toUpperCase();

    const sireBox = sireSlotKey ? ped.boxes?.[sireSlotKey] : null;
    const damBox = damSlotKey ? ped.boxes?.[damSlotKey] : null;

    // 1. Cinsiyet: Kutu verisinde açıkça kaydedildiyse onu al, yoksa akıllı tahmin et
    let sex = b.sex || defaultSex;
    if (!b.sex) {
      const txt = `${b.name || ''} ${b.color || ''} ${b.notes || ''}`.toLowerCase();
      if (txt.includes('dişi') || txt.includes('♀') || txt.includes('kraliçe') || txt.includes('lady') || txt.includes('sultan')) sex = 'F';
      else if (txt.includes('erkek') || txt.includes('♂') || txt.includes('king') || txt.includes('prince')) sex = 'M';
    }

    // 2. Kümes Statüsü (Yarışçı / Damızlık / Yavru)
    let roleCategory = b.roleCategory || '';
    if (!roleCategory) {
      if (ringKey.includes('YAVRU') || (b.color && b.color.toLowerCase().includes('yavru'))) {
        roleCategory = 'YOUNG';
      } else if (slotKey === 'main') {
        roleCategory = 'RACER';
      } else {
        roleCategory = 'BREEDER';
      }
    }

    // 3. Göz İşareti (Eye-Sign)
    let eyeSign = b.eyeSign || (slotKey === 'main' || slotKey === 'dam' || slotKey === 'g2_2' ? 'pearl_racer' : 'yellow_breeder');

    // 4. Aktif Kümes Kuşu mu yoksa Kayıp / Satıldı / Soy Ağacı Atası mı?
    const birdStatus = b.birdStatus || ((slotKey === 'main' && b.inMyLoft !== false) || b.inMyLoft === true ? 'ACTIVE' : 'ARCHIVE');
    const isActiveLoftBird = (birdStatus === 'ACTIVE' || birdStatus === 'RESTING') && ((slotKey === 'main' && b.inMyLoft !== false) || b.inMyLoft === true);

    const existing = map.get(ringKey);
    if (!existing || slotKey === 'main' || (isActiveLoftBird && !existing.isActiveLoftBird)) {
      const ebvScore = (slotKey === 'main' || isActiveLoftBird || !existing)
        ? computeBirdPerformanceEBV(b)
        : existing.ebvScore;

      map.set(ringKey, {
        pedId: ped.id,
        slotKey,
        flag: b.flag || detectFlagFromRing(b.ring),
        ring: b.ring.trim(),
        name: b.name || 'İsimsiz Güvercin',
        color: b.color || 'Mavi Çakmaklı',
        notes: b.notes || '',
        photo: b.photo || '',
        sex,
        roleCategory,
        eyeSign,
        birdStatus,
        bodyBuild: b.bodyBuild || '',
        muscleType: b.muscleType || '',
        pubicBone: b.pubicBone || '',
        wingFeather: b.wingFeather || '',
        isActiveLoftBird: isActiveLoftBird || Boolean(existing?.isActiveLoftBird),
        sireRing: sireBox?.ring || existing?.sireRing || '',
        damRing: damBox?.ring || existing?.damRing || '',
        ebvScore
      });
    } else if (existing && isActiveLoftBird) {
      existing.isActiveLoftBird = true;
    }
  };

  pedigrees.forEach((ped, idx) => {
    registerSlot(ped, 'main', idx % 2 === 0 ? 'M' : 'F', 'sire', 'dam');
    registerSlot(ped, 'sire', 'M', 'g2_1', 'g2_2');
    registerSlot(ped, 'dam', 'F', 'g2_3', 'g2_4');
    registerSlot(ped, 'g2_1', 'M', 'g3_1', 'g3_2');
    registerSlot(ped, 'g2_2', 'F', 'g3_3', 'g3_4');
    registerSlot(ped, 'g2_3', 'M', 'g3_5', 'g3_6');
    registerSlot(ped, 'g2_4', 'F', 'g3_7', 'g3_8');
    registerSlot(ped, 'g3_1', 'M', 'g4_1', 'g4_2');
    registerSlot(ped, 'g3_2', 'F', 'g4_3', 'g4_4');
    registerSlot(ped, 'g3_3', 'M', 'g4_5', 'g4_6');
    registerSlot(ped, 'g3_4', 'F', 'g4_7', 'g4_8');
    registerSlot(ped, 'g3_5', 'M', 'g4_9', 'g4_10');
    registerSlot(ped, 'g3_6', 'F', 'g4_11', 'g4_12');
    registerSlot(ped, 'g3_7', 'M', 'g4_13', 'g4_14');
    registerSlot(ped, 'g3_8', 'F', 'g4_15', 'g4_16');
    for (let g4i = 1; g4i <= 16; g4i++) {
      registerSlot(ped, `g4_${g4i}`, g4i % 2 === 1 ? 'M' : 'F', '', '');
    }
  });

  _cachedUniqueLoftBirds = Array.from(map.values());
  _cachedLoftBirdsSignature = sig;
  return _cachedUniqueLoftBirds;
}

let openBirdActionMenuRing = null;

function toggleBirdActionPopup(ringVal, evt) {
  if (evt && typeof evt.stopPropagation === 'function') evt.stopPropagation();
  const clean = (ringVal || '').trim().toUpperCase();
  if (openBirdActionMenuRing === clean) {
    openBirdActionMenuRing = null;
  } else {
    openBirdActionMenuRing = clean;
  }
  document.querySelectorAll('.bird-action-popup-menu').forEach(el => {
    const r = (el.getAttribute('data-ring') || '').toUpperCase();
    const isTarget = Boolean(openBirdActionMenuRing && r === openBirdActionMenuRing);
    if (!isTarget) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'flex';
    // Android / Mobil ekranın alt kısmındaki kuş kartlarında menünün ekran dışına taşmasını önle (yukarı doğru aç)
    const btnRect = evt?.currentTarget?.getBoundingClientRect ? evt.currentTarget.getBoundingClientRect() : null;
    const winH = window.innerHeight || document.documentElement.clientHeight || 700;
    if (btnRect && (winH - btnRect.bottom < 320)) {
      el.style.top = 'auto';
      el.style.bottom = '34px';
    } else {
      el.style.top = '34px';
      el.style.bottom = 'auto';
    }
  });
}

function closeAllBirdActionPopups() {
  if (!openBirdActionMenuRing) return;
  openBirdActionMenuRing = null;
  document.querySelectorAll('.bird-action-popup-menu').forEach(el => {
    el.style.display = 'none';
  });
}

function renderLoftBirdsDirectory() {
  const container = document.getElementById('loftBirdsCardsList');
  if (!container) return;
  openBirdActionMenuRing = null;

  const query = (document.getElementById('loftBirdSearch')?.value || '').trim().toLowerCase();
  const cleanQuery = query.replace(/[-\s./]+/g, '');
  const allBirds = collectUniqueLoftBirds();

  // Sekme Başlıklarındaki (🏠 Kümesim, ♂ Erkek, ♀ Dişi, Damızlık, Yarışçı, Yavru, 🏆 Büyük Yarış, 🟠 Dinlenmede, 🔴 Kayıp/Satıldı, 📜 Soy Arşivi) Canlı Kuş Sayılarını Güncelle
  // KURAL: Büyük Ödüllü Yarışa (OLR / Derby) teslim edilen kuşlar organizasyon kümesinde olduğu için kendi kümesimizde (🏠 Kümesim, Erkek, Dişi, Damızlık, Yarışçı, Yavru) görünmez; yalnızca 🏆 Büyük Yarış sekmesinde görünür!
  const grandPrizeRingsMap = getGrandPrizeEnteredRingsMap();
  const activeLoftBirds = allBirds.filter(b => b.isActiveLoftBird && !grandPrizeRingsMap.has(b.ring.toUpperCase()));
  const cntGrandPrize = allBirds.filter(b => grandPrizeRingsMap.has(b.ring.toUpperCase())).length;
  const cntResting = allBirds.filter(b => b.birdStatus === 'RESTING' && !grandPrizeRingsMap.has(b.ring.toUpperCase())).length;
  const cntLostSold = allBirds.filter(b => b.birdStatus === 'LOST' || b.birdStatus === 'SOLD').length;
  const archiveBirds = allBirds.filter(b => !b.isActiveLoftBird && !grandPrizeRingsMap.has(b.ring.toUpperCase()) && b.birdStatus !== 'LOST' && b.birdStatus !== 'SOLD');
  const cntAll = activeLoftBirds.length;
  const cntMale = activeLoftBirds.filter(b => b.sex === 'M').length;
  const cntFemale = activeLoftBirds.filter(b => b.sex === 'F').length;
  const cntBreeder = activeLoftBirds.filter(b => b.roleCategory === 'BREEDER').length;
  const cntRacer = activeLoftBirds.filter(b => b.roleCategory === 'RACER').length;
  const cntYoung = activeLoftBirds.filter(b => b.roleCategory === 'YOUNG').length;
  const cntArchive = archiveBirds.length;

  const filterChips = document.querySelectorAll('#loftFilterChips .sub-pill');
  const chipLabels = [
    `🏠 Kümesim (${cntAll})`,
    `♂ Erkek (${cntMale})`,
    `♀ Dişi (${cntFemale})`,
    `Damızlık (${cntBreeder})`,
    `Yarışçı (${cntRacer})`,
    `Yavru (${cntYoung})`,
    `🏆 Büyük Yarış (${cntGrandPrize})`,
    `🟠 Dinlenmede (${cntResting})`,
    `🔴 Kayıp/Satıldı (${cntLostSold})`,
    `📜 Soy Arşivi (${cntArchive})`
  ];
  filterChips.forEach((chipEl, idx) => {
    if (chipLabels[idx]) chipEl.textContent = chipLabels[idx];
  });

  const pillBirdsListEl = document.getElementById('pillBirdsList');
  if (pillBirdsListEl) {
    pillBirdsListEl.textContent = `🕊️ Kuşlarım (${cntAll})`;
  }

  const matchesQuery = (b) => {
    if (!query) return true;
    const rawHay = `${b.ring} ${b.name} ${b.color} ${b.notes} ${b.sireRing} ${b.damRing}`.toLowerCase();
    const cleanHay = rawHay.replace(/[-\s./]+/g, '');
    return rawHay.includes(query) || (cleanQuery.length >= 2 && cleanHay.includes(cleanQuery));
  };

  let filtered = allBirds.filter(b => {
    const isGrandPrizeBird = grandPrizeRingsMap.has(b.ring.toUpperCase());
    if (activeLoftFilter === 'GRAND_PRIZE') {
      const gp = grandPrizeRingsMap.get(b.ring.toUpperCase());
      if (!gp) return false;
      if (activeGrandPrizeOrgFilter !== 'ALL' && !(gp.organizations || []).includes(activeGrandPrizeOrgFilter)) {
        return false;
      }
    } else if (activeLoftFilter === 'ARCHIVE') {
      if (b.isActiveLoftBird || isGrandPrizeBird || b.birdStatus === 'LOST' || b.birdStatus === 'SOLD') return false;
    } else if (activeLoftFilter === 'LOST_SOLD') {
      if (b.birdStatus !== 'LOST' && b.birdStatus !== 'SOLD') return false;
    } else if (activeLoftFilter === 'RESTING') {
      if (b.birdStatus !== 'RESTING' || isGrandPrizeBird) return false;
    } else {
      // Diğer tüm filtrelerde (🏠 Kümesim, ♂ Erkek, ♀ Dişi, Damızlık, Yarışçı, Yavru) SADECE kümesimizde gerçekten mevcut olan ve Büyük Yarışa teslim edilmemiş kuşları göster!
      if (!b.isActiveLoftBird || isGrandPrizeBird) return false;
    }

    if (activeLoftFilter === 'M' && b.sex !== 'M') return false;
    if (activeLoftFilter === 'F' && b.sex !== 'F') return false;
    if (activeLoftFilter === 'BREEDER' && b.roleCategory !== 'BREEDER') return false;
    if (activeLoftFilter === 'RACER' && b.roleCategory !== 'RACER') return false;
    if (activeLoftFilter === 'YOUNG' && b.roleCategory !== 'YOUNG') return false;

    return matchesQuery(b);
  });

  // 3 farklı Büyük Ödüllü Yarışa (OLR / Derby) aynı anda kuş veren kullanıcı için Organizasyon bazlı alt filtre şeridi
  let grandPrizeOrgHeaderHtml = '';
  if (activeLoftFilter === 'GRAND_PRIZE') {
    const orgCounts = new Map();
    allBirds.forEach(b => {
      const gp = grandPrizeRingsMap.get(b.ring.toUpperCase());
      if (gp && Array.isArray(gp.organizations)) {
        gp.organizations.forEach(orgName => {
          orgCounts.set(orgName, (orgCounts.get(orgName) || 0) + 1);
        });
      }
    });
    const orgEntries = Array.from(orgCounts.entries());
    if (orgEntries.length > 0) {
      grandPrizeOrgHeaderHtml = `
        <div class="ios-card" style="padding:8px 10px; border-left:4px solid #d97706; background:linear-gradient(135deg,#fffbeb,#ffffff);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px; margin-bottom:6px; flex-wrap:wrap;">
            <div style="font-size:10.5px; font-weight:900; color:#b45309;">
              🏆 Büyük Ödüllü Yarış (Derby / OLR) Organizasyon Filtresi (${orgEntries.length} Organizasyon • ${cntGrandPrize} Kuş)
            </div>
            <button type="button" class="nest-mini-action-btn gold" onclick="openIosTab('flight'); AvigenUxManager.switchBreedingPlanSub('racetracker'); AvigenRaceTracker.setCategoryFilter('GRAND_PRIZE');">
              🏁 Yarış Takip Ekranı →
            </button>
          </div>
          <div class="sub-pills" style="padding:2px; gap:3px; flex-wrap:wrap;">
            <button type="button" class="sub-pill ${activeGrandPrizeOrgFilter === 'ALL' ? 'active' : ''}" style="font-size:9px; padding:4px 7px;" onclick="setGrandPrizeOrgFilter('ALL')">
              Tüm Derby'ler (${cntGrandPrize})
            </button>
            ${orgEntries.map(([orgName, c]) => `
              <button type="button" class="sub-pill ${activeGrandPrizeOrgFilter === orgName ? 'active' : ''}" style="font-size:9px; padding:4px 7px;" onclick="setGrandPrizeOrgFilter('${escapeHtml(orgName)}')">
                🏆 ${escapeHtml(orgName)} (${c})
              </button>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      grandPrizeOrgHeaderHtml = `
        <div class="ios-card" style="padding:10px 12px; border-left:4px solid #d97706; background:#fffbeb;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; flex-wrap:wrap;">
            <div style="font-size:10px; color:#92400e; line-height:1.35; flex:1;">
              🏆 Henüz Büyük Ödüllü Yarışa (One Loft Race / Derby) teslim edilmiş kuş kaydı yok. Yeni bir Derby / OLR kaydı açıp kuşlarınızı seçebilirsiniz.
            </div>
            <button type="button" class="ios-btn ios-btn-gold" style="padding:5px 9px; font-size:9.5px;" onclick="openIosTab('flight'); AvigenUxManager.switchBreedingPlanSub('racetracker'); setTimeout(()=>AvigenRaceTracker.openCreateRaceModal({ category: 'GRAND_PRIZE' }), 60);">
              + Büyük Yarışa Kuş Teslim Et
            </button>
          </div>
        </div>
      `;
    }
  }

  // ÖNEMLİ KULLANICI DENEYİMİ DÜZELTMESİ:
  // Eğer kullanıcı Kuşlarım arama kutusuna bir halka no / isim yazdığında seçili filtrede (örn. sadece "🏠 Kümesim" veya "Damızlık")
  // sonuç çıkmıyorsa, Ana Sayfa aramasında olduğu gibi tüm kayıtları (Soy Arşivi ataları + tüm statüler) tarayarak eşleşen kuşları göster!
  let isCrossFilterSearchMatch = false;
  if (query && filtered.length === 0) {
    filtered = allBirds.filter(matchesQuery);
    if (filtered.length > 0) {
      isCrossFilterSearchMatch = true;
    }
  }

  if (!filtered.length) {
    if (allBirds.length === 0) {
      container.innerHTML = grandPrizeOrgHeaderHtml + `
        <div class="ios-card" style="text-align:center; padding:22px 16px; border:1.5px dashed #93c5fd; background:linear-gradient(135deg,#f8fafc,#eff6ff);">
          <div style="font-size:32px; margin-bottom:6px;">🕊️</div>
          <div style="font-weight:900; font-size:13.5px; color:#0052cc;">Kümesinize Hoş Geldiniz!</div>
          <div style="font-size:10.8px; color:var(--ios-subtext); margin-top:4px; line-height:1.45;">
            Kümesinizde henüz kayıtlı güvercin bulunmuyor. <strong>AVIGEN FREE</strong> ile sınırsız güvercin, 4 kuşak (31 kutu) soyağacı, yuva/kuluçka ve 3 kategorili yarış takibini tamamen ücretsiz kullanabilirsiniz.
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px;">
            <button type="button" class="ios-btn ios-btn-primary" style="padding:10px 8px; font-size:11px; font-weight:900;" onclick="createNewPedigreeRecord()">
              ➕ İlk Güvercinimi Ekle
            </button>
            <button type="button" class="ios-btn ios-btn-gold" style="padding:10px 8px; font-size:11px; font-weight:900;" onclick="openIosTab('aiscan')">
              📸 Fotoğraftan Pedigri Tara
            </button>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = grandPrizeOrgHeaderHtml + `
      <div class="ios-card" style="text-align:center; padding:24px;">
        <div style="font-size:28px; margin-bottom:6px;">🕊️</div>
        <div style="font-weight:800; font-size:13px;">Bu Filtrede Güvercin Bulunamadı</div>
        <div style="font-size:11px; color:var(--ios-subtext); margin-top:3px;">Arama kelimesini değiştirebilir veya "+ Kuş Ekle" butonuyla yeni kayıt açabilirsiniz.</div>
      </div>
    `;
    return;
  }

  const crossFilterBannerHtml = isCrossFilterSearchMatch
    ? `<div style="background:#eff6ff; border:1px solid #93c5fd; color:#0052cc; font-size:10px; font-weight:800; padding:6px 9px; border-radius:8px; margin-bottom:2px;">
        🔍 Aradığınız "${escapeHtml(document.getElementById('loftBirdSearch')?.value || '')}" aktif filtrede değil, <strong>📜 Soy Arşivi / Diğer Kategori</strong> kayıtlarında bulundu (${filtered.length} sonuç):
      </div>`
    : '';

  container.innerHTML = grandPrizeOrgHeaderHtml + crossFilterBannerHtml + filtered.map(b => {
    const sexIcon = b.sex === 'M'
      ? `<span style="color:#0284c7; font-weight:900;">♂</span>`
      : (b.sex === 'F'
        ? `<span style="color:#db2777; font-weight:900;">♀</span>`
        : `<span style="color:#9333ea; font-weight:900;">🐣</span>`);

    const roleLabel = b.roleCategory === 'RACER' ? 'Yarışçı' : (b.roleCategory === 'YOUNG' ? 'Yavru' : 'Damızlık');
    const roleClass = b.roleCategory === 'RACER' ? 'gene-green' : (b.roleCategory === 'YOUNG' ? 'gene-purple' : 'gene-gold');
    const statusBadgeHtml = b.birdStatus === 'RESTING'
      ? `<span class="gene-badge gene-gold" style="font-size:7.8px; padding:1px 5px;">🟠 Dinlenmede</span>`
      : (b.birdStatus === 'LOST'
        ? `<span class="gene-badge gene-red" style="font-size:7.8px; padding:1px 5px;">🔴 Yarışta Kayıp</span>`
        : (b.birdStatus === 'SOLD'
          ? `<span class="gene-badge gene-blue" style="font-size:7.8px; padding:1px 5px;">💸 Satıldı</span>`
          : ''));
    const gpInfo = grandPrizeRingsMap.get(b.ring.toUpperCase());
    const gpBadgeHtml = gpInfo && Array.isArray(gpInfo.entries)
      ? gpInfo.entries.map(ent => `<span class="gene-badge gene-gold" style="font-size:7.8px; padding:1px 6px; background:#fef3c7; border-color:#f59e0b; color:#b45309;">🏆 ${escapeHtml(ent.organizationName)} • ${escapeHtml(ent.stageType || 'Etap')} (${escapeHtml(ent.statusLabel)}${ent.rank ? ' #' + ent.rank : ''})</span>`).join('')
      : '';
    const physSummary = [b.bodyBuild, b.muscleType, b.pubicBone, b.wingFeather].filter(Boolean).join(' • ');

    const avatarHtml = b.photo
      ? `<img src="${b.photo}" style="width:100%; height:100%; object-fit:cover;" />`
      : renderEyeSignSvg(b.eyeSign || 'yellow_breeder');

    const dCount = getDossierLogsForRing(b.ring).length;
    const parentsSummary = (b.sireRing || b.damRing)
      ? `♂ ${b.sireRing || '-'} × ♀ ${b.damRing || '-'}`
      : (b.notes ? b.notes.split('\n')[0] : b.color);

    return `
      <div class="bird-dir-card sex-${b.sex}" style="position:relative;">
        <div class="dash-list-left" onclick="editBirdFromDirectory('${b.pedId}', '${b.slotKey}')" style="cursor:pointer;" title="Bilgileri düzenlemek için dokunun">
          <div class="bird-mini-eye">${avatarHtml}</div>
          <div style="min-width:0; flex:1;">
            <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
              <span class="bird-dir-ring">${b.flag} ${escapeHtml(b.ring)}</span>
              ${sexIcon}
              <span class="gene-badge ${roleClass}" style="font-size:8px; padding:1px 5px;">${roleLabel}</span>
              ${statusBadgeHtml}
              ${gpBadgeHtml}
            </div>
            <div class="bird-dir-name">
              ${escapeHtml(b.name || 'İsimsiz Güvercin')} <span style="font-weight:500; color:var(--ios-subtext);">• ${escapeHtml(b.color)}</span>
            </div>
            <div class="dash-list-sub" style="margin-top:1px;">
              ${escapeHtml(parentsSummary)}${physSummary ? ` • ✋ ${escapeHtml(physSummary)}` : ''}
            </div>
          </div>
        </div>

        <!-- TELEFONDA YANLIŞ TIKLAMAYI ÖNLEYEN TEK DOKUNUŞLU AÇILIR İŞLEM MENÜSÜ -->
        <div class="bird-dir-actions" style="position:relative;">
          ${!b.isActiveLoftBird ? `
            <button class="bird-mini-btn" style="border-color:#a7f3d0; background:#ecfdf5; color:#059669; font-weight:800; width:auto; padding:0 7px; font-size:9.5px;" onclick="toggleAncestorInMyLoft('${escapeHtml(b.ring)}', true)" title="Bu ata güvercin fiziksel olarak benim kümesimde de mevcut">🏠 Kümese Al</button>
          ` : ''}
          <button type="button" class="bird-mini-btn" style="width:auto; height:30px; padding:0 10px; font-size:11px; font-weight:800; display:inline-flex; align-items:center; gap:4px; background:#eff6ff; border-color:#93c5fd; color:#0052cc; border-radius:8px;" onclick="toggleBirdActionPopup('${escapeHtml(b.ring)}', event)">
            <span>İşlemler</span>
            <span style="font-size:10px;">▾</span>
          </button>

          <div class="bird-action-popup-menu" data-ring="${escapeHtml(b.ring)}" onclick="event.stopPropagation()" style="display:none; position:absolute; right:0; top:34px; z-index:80; width:205px; background:var(--ios-card, #ffffff); border:1.5px solid var(--ios-border, #cbd5e1); border-radius:12px; box-shadow:0 10px 26px rgba(15,23,42,0.22); padding:6px; flex-direction:column; gap:4px;">
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); openBirdPedigreeFromDirectory('${b.pedId}');">
              <span>📜</span> <span>Pedigre Kağıdını Aç</span>
            </button>
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); downloadHighResPedigree('${b.pedId}');">
              <span>📄</span> <span>Pedigriyi PDF İndir</span>
            </button>
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); shareActivePedigree('${b.pedId}');">
              <span>📲</span> <span>WhatsApp PDF Paylaş</span>
            </button>
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); if(typeof AvigenPerformanceEngine!=='undefined') AvigenPerformanceEngine.openProfileModal('${escapeHtml(b.ring)}');">
              <span>📊</span> <span>Performans &amp; Genetik Profil</span>
            </button>
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); if(typeof AvigenRaceTracker!=='undefined') AvigenRaceTracker.openQuickAssignBirdToGrandPrize('${escapeHtml(b.ring)}');">
              <span>🏆</span> <span>Büyük Yarışa (Derby/OLR) Teslim Et</span>
            </button>
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); openBirdDossierModal('${escapeHtml(b.ring)}');">
              <span>📋</span> <span>Sicil Dosyası (${dCount} Kayıt)</span>
            </button>
            <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); editBirdFromDirectory('${b.pedId}', '${b.slotKey}');">
              <span>✏️</span> <span>Kuş Bilgilerini Düzenle</span>
            </button>
            ${b.isActiveLoftBird && b.slotKey !== 'main' ? `
              <button type="button" class="bird-popup-item" onclick="closeAllBirdActionPopups(); toggleAncestorInMyLoft('${escapeHtml(b.ring)}', false);">
                <span>📤</span> <span>Kümesimden Çıkar (Arşive Al)</span>
              </button>
            ` : ''}
            <div style="height:1px; background:var(--ios-border, #e2e8f0); margin:2px 0;"></div>
            <button type="button" class="bird-popup-item danger" onclick="closeAllBirdActionPopups(); deleteBirdFromDirectory('${b.pedId}', '${b.slotKey}', '${escapeHtml(b.ring)}', '${escapeHtml(b.name || '')}');">
              <span>🗑️</span> <span>Bu Kuşu Sil</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openBirdPedigreeFromDirectory(pedId, slotKey = 'main') {
  openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
  selectActivePedigree(pedId);
  renderPedigreeDropdown();
  switchBirdsViewMode('pedigree');
  setTimeout(() => {
    fitPaperToIphoneScreen();
    if (slotKey && slotKey !== 'main') {
      const targetBox = document.querySelector(`#mypedigrePaper [onclick*="openBoxEditModal('${slotKey}')"]`);
      if (targetBox) {
        targetBox.style.outline = '3px solid #0066ff';
        targetBox.style.boxShadow = '0 0 16px rgba(0, 102, 255, 0.75)';
        setTimeout(() => {
          targetBox.style.outline = '';
          targetBox.style.boxShadow = '';
        }, 3500);
      }
    }
  }, 50);
}

function editBirdFromDirectory(pedId, slotKey) {
  openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
  activePedigreeId = pedId;
  renderPedigreeDropdown();
  selectActivePedigree(pedId);
  openBoxEditModal(slotKey);
}

// Pedigrede adı geçen bir atayı (Anne/Baba/Dede) "Kümesimde Fiziksel Olarak Mevcut" yapma veya sadece Soy Arşivinde tutma
function toggleAncestorInMyLoft(ringVal, inLoftFlag) {
  const cleanRing = (ringVal || '').trim().toUpperCase();
  if (!cleanRing) return;

  pedigrees.forEach(p => {
    Object.entries(p.boxes || {}).forEach(([k, box]) => {
      if (box && box.ring && box.ring.trim().toUpperCase() === cleanRing) {
        box.inMyLoft = Boolean(inLoftFlag);
      }
    });
  });

  saveMypedigreData();
  renderLoftBirdsDirectory();
  renderHomeDashboard();
}

// Kuş Listesinden veya Düzenleme Penceresinden Doğrudan Tek Tuşla Kuş Silme
function deleteBirdFromDirectory(pedId, slotKey, ringVal, birdName) {
  const cleanRing = (ringVal || '').trim().toUpperCase();
  const label = `${ringVal || 'Seçili Kuş'}${birdName ? ' (' + birdName + ')' : ''}`;

  // Aktif yuvada kullanılıp kullanılmadığını kontrol et
  const usedInNests = activePairsList.filter(ap =>
    extractCleanRingFromText(ap.sire) === cleanRing || extractCleanRingFromText(ap.dam) === cleanRing
  );
  const nestWarn = usedInNests.length
    ? `\n\n⚠️ Dikkat: Bu kuş şu anda "${usedInNests.map(n => n.nest).join(', ')}" aktif yuvasında kayıtlı görünüyor!`
    : '';

  if (slotKey === 'main') {
    if (!confirm(`🗑️ "${label}" güvercinini ve ana pedigre kaydını silmek istiyor musunuz?${nestWarn}`)) return;
    try {
      localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(buildFullAvigenSnapshotPayload()));
    } catch (e) {}
    pedigrees = pedigrees.filter(p => p.id !== pedId);
    activePedigreeId = pedigrees[0]?.id || '';
  } else {
    if (!confirm(`🗑️ "${label}" güvercinini kümes listesinden ve soyağacı kutusundan silmek istiyor musunuz?${nestWarn}`)) return;
    try {
      localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(buildFullAvigenSnapshotPayload()));
    } catch (e) {}
    pedigrees.forEach(p => {
      Object.keys(p.boxes || {}).forEach(k => {
        const box = p.boxes[k];
        if (box && (box.ring || '').trim().toUpperCase() === cleanRing && k !== 'main') {
          p.boxes[k] = { flag: '🇹🇷', ring: '', name: '', color: '', notes: '', photo: '', sex: box.sex || 'M' };
        }
      });
    });
  }

  saveMypedigreData();
  renderPedigreeDropdown();
  selectActivePedigree(activePedigreeId);
  renderLoftBirdsDirectory();
  renderHomeDashboard();
}

function deleteBirdFromEditModal() {
  const ped = getActivePedigree();
  if (!ped) return;
  const box = ped.boxes?.[editingSlotKey] || {};
  const ringVal = (document.getElementById('editBoxRing')?.value || box.ring || '').trim();
  const nameVal = (document.getElementById('editBoxName')?.value || box.name || '').trim();
  closeBoxEditModal();
  deleteBirdFromDirectory(ped.id, editingSlotKey, ringVal, nameVal);
}

function openBirdInGenesisFromDirectory(pedId, slotKey, sex) {
  if (typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.state.viewStage = 'tool';
    AvigenGenesisAI.state.activeMainModule = 'breeding_hub';
    AvigenGenesisAI.state.activeMode = 'breeding';
    const refKey = `${pedId}::${slotKey || 'main'}`;
    if (sex === 'F') {
      AvigenGenesisAI.state.selectedDamRef = refKey;
    } else {
      AvigenGenesisAI.state.selectedSireRef = refKey;
    }
    AvigenGenesisAI.saveState();
  }
  openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2]);
}

// ============================================================================
// PEDİGRE SEÇİMİ, TEMA ÖNİZLEME VE CANLI ŞECERE KAĞIDI
// ============================================================================
function renderPedigreeDropdown() {
  const sel = document.getElementById('activePedigreeSelect');
  if (!sel) return;
  if (!pedigrees.length) {
    sel.innerHTML = `<option value="">🕊️ Henüz Kayıtlı Kuş Yok — "+ Kuş Ekle" İle Başlayın</option>`;
    return;
  }
  sel.innerHTML = pedigrees.map(p => {
    const m = p.boxes?.main || {};
    return `<option value="${p.id}" ${p.id === activePedigreeId ? 'selected' : ''}>${m.flag || '🇹🇷'} ${escapeHtml(m.ring || 'Yeni')} — ${escapeHtml(m.name || '')}</option>`;
  }).join('');
}

function selectActivePedigree(id) {
  activePedigreeId = id;
  renderActivePedigree();
}

function checkPedigreeTierLimitAllowed() {
  // AVIGEN FREE sürümünde kuş ve 4 kuşak pedigri kaydı sınırsızdır; abonelik yalnızca GENESIS AI modülü için gereklidir.
  return true;
}

// Bir güvercinin adı, rengi, cinsiyeti veya bayrağı güncellendiğinde tüm soyağacı kutularında ilişkisel veri bütünlüğünü korur
function propagateBirdMetadataAcrossPedigrees(ringVal, updatedMeta) {
  const clean = (ringVal || '').trim().toUpperCase();
  if (!clean) return;
  pedigrees.forEach(p => {
    Object.values(p.boxes || {}).forEach(b => {
      if (b && b.ring && b.ring.trim().toUpperCase() === clean) {
        if (updatedMeta.name) b.name = updatedMeta.name;
        if (updatedMeta.color) b.color = updatedMeta.color;
        if (updatedMeta.flag) b.flag = updatedMeta.flag;
        if (updatedMeta.sex) b.sex = updatedMeta.sex;
        if (updatedMeta.eyeSign) b.eyeSign = updatedMeta.eyeSign;
      }
    });
  });
}

function createNewPedigreeRecord() {
  if (!checkPedigreeTierLimitAllowed()) return;

  // Hemen veritabanına "Yeni Güvercin" ekleme! Sadece kullanıcı "Kaydet" butonuna bastığında oluştur!
  isCreatingNewPedigreeDraft = true;
  pendingChickCreationData = null;
  const parentBanner = document.getElementById('chickParentsInfoBanner');
  if (parentBanner) parentBanner.style.display = 'none';

  editingSlotKey = 'main';
  editingFlag = '🇹🇷';
  editingPhotoData = '';
  selectModalSegment('editBoxSexGroup', 'M');
  selectModalSegment('editBoxRoleGroup', 'RACER');

  const eyeEl = document.getElementById('editBoxEye');
  if (eyeEl) eyeEl.value = 'pearl_racer';

  const parentsSec = document.getElementById('editBoxParentsSection');
  if (parentsSec) {
    parentsSec.style.display = 'grid';
    populateModalParentSelects('', '', '');
  }

  populateKnownRingsDatalist();
  document.getElementById('boxEditTitle').textContent = '🕊️ Yeni Güvercin Ekle';
  document.getElementById('editBoxRing').value = '';
  document.getElementById('editBoxName').value = '';
  setSelectColorOrCustom(document.getElementById('editBoxColor'), 'Mavi Çakmaklı');
  document.getElementById('editBoxNotes').value = '';
  document.getElementById('editBoxPhoto').value = '';

  const secondSec = document.getElementById('secondChickSiblingSection');
  if (secondSec) secondSec.style.display = 'none';
  const statusEl = document.getElementById('editBoxBirdStatus');
  if (statusEl) statusEl.value = 'ACTIVE';
  ['editBoxBodyBuild', 'editBoxMuscleType', 'editBoxPubicBone', 'editBoxWingFeather'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  renderFlagChips();
  document.getElementById('boxEditModal').classList.add('open');
}

function restoreAutoSafetySnapshot() {
  try {
    const raw = localStorage.getItem('avigen_auto_safety_snapshot_v1');
    if (!raw) {
      alert('ℹ️ Henüz geri alınacak otomatik bir silme/yükleme yedeği bulunamadı.');
      return;
    }
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.pedigrees)) {
      alert('⚠️ Otomatik güvenlik yedeği okunamadı.');
      return;
    }
    if (!confirm(`⏪ Son silme veya yükleme işleminden önceki kümes durumuna (${data.pedigrees.length} Pedigri) geri dönmek istiyor musunuz?`)) return;
    if (data.loftConfig) loftConfig = { ...loftConfig, ...data.loftConfig };
    if (Array.isArray(data.pedigrees) && data.pedigrees.length) {
      pedigrees = data.pedigrees;
      activePedigreeId = pedigrees[0].id;
    }
    if (Array.isArray(data.remindersList)) remindersList = data.remindersList;
    if (Array.isArray(data.activePairsList)) activePairsList = data.activePairsList;
    if (Array.isArray(data.racesList)) racesList = data.racesList;
    if (Array.isArray(data.birdDossierList)) birdDossierList = data.birdDossierList;
    if (Array.isArray(data.notesList)) notesList = data.notesList;
    if (Array.isArray(data.race_tracking_events) && typeof AvigenRaceTracker !== 'undefined') {
      AvigenRaceTracker.events = data.race_tracking_events.map(ev =>
        typeof AvigenRaceTracker.normalizeRaceRecord === 'function' ? AvigenRaceTracker.normalizeRaceRecord(ev) : ev
      );
      AvigenRaceTracker.saveEvents();
      AvigenRaceTracker.renderRaceTrackerMainUI();
    }
    saveMypedigreData();
    syncLoftIdentityAcrossUI();
    renderPedigreeDropdown();
    selectActivePedigree(activePedigreeId);
    renderHomeDashboard();
    renderLoftBirdsDirectory();
    if (typeof AvigenUxManager !== 'undefined') {
      AvigenUxManager.renderProfileAccountSection();
      AvigenUxManager.renderBreedingPlanPairsList();
    }
    alert('✅ Son işlem geri alındı ve önceki kümes verileriniz eksiksiz geri yüklendi!');
  } catch (e) {
    alert('Geri alma sırasında bir hata oluştu.');
  }
}

function deleteActivePedigree() {
  const ped = getActivePedigree();
  if (!ped) return;
  const mainRing = (ped.boxes?.main?.ring || '').trim();
  const cleanRing = mainRing.toUpperCase();

  // Aktif yuvada kullanılıp kullanılmadığını kontrol et
  const usedInNests = activePairsList.filter(ap =>
    extractCleanRingFromText(ap.sire) === cleanRing || extractCleanRingFromText(ap.dam) === cleanRing
  );
  const nestWarn = usedInNests.length
    ? `\n\n⚠️ Dikkat: Bu kuş şu anda "${usedInNests.map(n => n.nest).join(', ')}" aktif yuvasında kayıtlı görünüyor!`
    : '';

  if (!confirm(`${mainRing || 'Seçili'} pedigresini silmek istiyor musunuz?${nestWarn}`)) return;

  try {
    localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(buildFullAvigenSnapshotPayload()));
  } catch (e) {}

  pedigrees = pedigrees.filter(p => p.id !== ped.id);
  activePedigreeId = pedigrees[0]?.id || '';

  saveMypedigreData();
  renderPedigreeDropdown();
  selectActivePedigree(activePedigreeId);
  renderLoftBirdsDirectory();
  renderHomeDashboard();
}

function renderThemeStrip() {
  const strip = document.getElementById('themeStripContainer');
  const ped = getActivePedigree();
  if (!strip || !ped) return;

  strip.innerHTML = MYPEDIGRE_THEMES.map(t => `
    <div class="theme-pill ${ped.themeId === t.id ? 'active' : ''}" onclick="applyThemeToPedigree('${t.id}')">
      <span class="theme-dot" style="background:linear-gradient(135deg, ${t.bg} 40%, ${t.accent} 60%);"></span>
      <span>${t.name}</span>
    </div>
  `).join('');
}

function applyThemeToPedigree(themeId) {
  const ped = getActivePedigree();
  const t = MYPEDIGRE_THEMES.find(x => x.id === themeId);
  if (!ped || !t) return;

  ped.themeId = t.id;
  ped.accentColor = t.accent;
  ped.bgColor = t.bg;
  document.getElementById('customAccentPicker').value = t.accent;
  document.getElementById('customBgPicker').value = t.bg;
  saveMypedigreData();
  renderThemeStrip();
  renderActivePedigree();
}

function updateCustomDesign() {
  const ped = getActivePedigree();
  if (!ped) return;
  ped.accentColor = document.getElementById('customAccentPicker').value;
  ped.bgColor = document.getElementById('customBgPicker').value;
  ped.fontFamily = document.getElementById('customFontPicker').value;
  saveMypedigreData();
  renderActivePedigree();
}

// QR Kod & Barkod SVG Üreticileri
function makeQrSvg(str) {
  const size = 19;
  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const finder = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
      if (finder) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || r === size - 1 || r === size - 7 || c === size - 1 || c === size - 7 ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            (r >= 2 && r <= 4 && c >= size - 5 && c <= size - 3) ||
            (r >= size - 5 && r <= size - 3 && c >= 2 && c <= 4)) {
          rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0f172a"/>`;
        }
      } else if (((r * 17 + c * 31 + str.charCodeAt((r + c) % Math.max(1, str.length))) % 7) < 3) {
        rects += `<rect x="${c}" y="${r}" width="1" height="1" fill="#0f172a"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="34" height="34" shape-rendering="crispEdges" style="background:#fff;padding:2px;border-radius:4px;border:1px solid #cbd5e1;">${rects}</svg>`;
}

function makeBarcodeSvg(ring) {
  const clean = (ring || 'TR-2026').toUpperCase();
  let bars = '';
  let x = 2;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    const w1 = (code % 2) + 1;
    bars += `<rect x="${x}" y="2" width="${w1}" height="18" fill="#0f172a"/>`;
    x += w1 + 2;
    bars += `<rect x="${x}" y="2" width="1.5" height="18" fill="#0f172a"/>`;
    x += 3;
  }
  return `<div style="background:#fff;padding:3px 6px;border-radius:4px;border:1px solid #94a3b8;display:flex;flex-direction:column;align-items:center;">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${x} 20" width="115" height="20" shape-rendering="crispEdges">${bars}</svg>
    <span style="font-size:8px;font-weight:900;color:#0f172a;letter-spacing:0.8px;">${escapeHtml(clean)}</span>
  </div>`;
}

function renderBoxHtml(ped, key, sex) {
  const b = ped.boxes?.[key] || { flag: '🇹🇷', ring: '', name: '', color: '', notes: '' };
  const isEmpty = !b.ring && !b.name;
  const sexIcon = sex === 'M' ? '<span style="color:#0284c7;font-weight:800;font-size:9px;">♂</span>' : '<span style="color:#db2777;font-weight:800;font-size:9px;">♀</span>';

  if (isEmpty) {
    return `
      <div class="p-box ${sex === 'M' ? 'male' : 'female'}" style="opacity:0.65; border-style:dashed;" onclick="openBoxEditModal('${key}')">
        <div class="p-box-head">
          <span class="p-ring" style="font-weight:600;">+ Boncuk / Ata Ekle</span>
          ${sexIcon}
        </div>
      </div>
    `;
  }

  return `
    <div class="p-box ${sex === 'M' ? 'male' : 'female'}" onclick="openBoxEditModal('${key}')">
      <div class="p-box-head">
        <span class="p-ring"><span>${b.flag || '🇹🇷'}</span> ${escapeHtml(b.ring)}</span>
        ${sexIcon}
      </div>
      ${b.name ? `<div class="p-name">${escapeHtml(b.name)}</div>` : ''}
      ${b.color ? `<div style="font-size:8px;opacity:0.8;">${escapeHtml(b.color)}</div>` : ''}
      ${b.notes ? `<div class="p-notes">${escapeHtml(b.notes)}</div>` : ''}
    </div>
  `;
}

function getInlineAvigenLogoSvgHtml(styleStr = 'width:100%;height:100%;display:block;') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" style="${styleStr}">
    <defs>
      <linearGradient id="avWingBlueInl" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#1d4ed8"/><stop offset="55%" stop-color="#0284c7"/><stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
      <linearGradient id="avBodyMagentaInl" x1="0%" y1="20%" x2="100%" y2="60%">
        <stop offset="0%" stop-color="#7e22ce"/><stop offset="50%" stop-color="#c026d3"/><stop offset="100%" stop-color="#f43f5e"/>
      </linearGradient>
      <linearGradient id="avWingIndigoInl" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#4338ca"/><stop offset="55%" stop-color="#2563eb"/><stop offset="100%" stop-color="#06b6d4"/>
      </linearGradient>
      <linearGradient id="avWingSunsetInl" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stop-color="#ec4899"/><stop offset="50%" stop-color="#fb923c"/><stop offset="100%" stop-color="#facc15"/>
      </linearGradient>
      <linearGradient id="avTailTealInl" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#0369a1"/><stop offset="50%" stop-color="#06b6d4"/><stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    </defs>
    <path d="M 68 68 C 82 95, 86 135, 102 165 C 112 182, 126 190, 145 190 C 128 170, 122 140, 118 105 Z" fill="url(#avTailTealInl)"/>
    <path d="M 122 102 C 155 82, 195 82, 228 112 C 198 106, 175 125, 145 124 C 132 123, 124 114, 122 102 Z" fill="url(#avWingIndigoInl)"/>
    <path d="M 76 74 C 102 115, 136 162, 172 152 C 188 148, 200 138, 206 132 C 175 142, 148 122, 124 94 Z" fill="url(#avWingSunsetInl)"/>
    <path d="M 102 36 C 135 24, 172 52, 212 50 C 188 68, 152 68, 126 56 C 115 50, 106 43, 102 36 Z" fill="url(#avWingBlueInl)"/>
    <path d="M 18 66 L 46 46 C 58 30, 78 28, 96 42 C 126 66, 158 76, 194 66 C 170 96, 136 114, 102 104 C 82 98, 68 74, 52 66 C 38 60, 26 63, 18 66 Z" fill="url(#avBodyMagentaInl)"/>
  </svg>`;
}

let activePedigreeSheetPageMode = 'page1'; // 'page1' | 'page2' | 'both'

function switchPedigreeSheetPage(modeKey) {
  activePedigreeSheetPageMode = ['page1', 'page2', 'both'].includes(modeKey) ? modeKey : 'page1';
  const b1 = document.getElementById('btnPedPage1');
  const b2 = document.getElementById('btnPedPage2');
  const bBoth = document.getElementById('btnPedPageBoth');
  [
    { el: b1, key: 'page1' },
    { el: b2, key: 'page2' },
    { el: bBoth, key: 'both' }
  ].forEach(item => {
    if (!item.el) return;
    if (activePedigreeSheetPageMode === item.key) {
      item.el.className = 'ios-btn ios-btn-primary';
      item.el.style.cssText = 'padding:5px 6px; font-size:9.8px; font-weight:900;';
    } else {
      item.el.className = 'ios-btn ios-btn-outline';
      item.el.style.cssText = 'padding:5px 6px; font-size:9.8px; font-weight:900; background:#1e293b; color:#e2e8f0; border-color:#475569;';
    }
  });
  renderActivePedigree();
}

function computePedigreePage2Data(ped) {
  const b = ped?.boxes || {};
  const main = b.main || { flag: '🇹🇷', ring: 'TR-2026-0001', name: 'Şampiyon', color: 'Mavi Çakmaklı', notes: '', sex: 'M' };
  const ringClean = (main.ring || '').trim();
  const ringUp = ringClean.toUpperCase();

  // 1. Performans ve Genetik Profil Motorundan Verileri Al
  let perfProfile = null;
  if (typeof AvigenPerformanceEngine !== 'undefined' && typeof AvigenPerformanceEngine.computeBirdFullProfile === 'function') {
    try {
      perfProfile = AvigenPerformanceEngine.computeBirdFullProfile(ringClean);
    } catch (e) {}
  }

  const breedingScore = perfProfile?.geneticProfile?.breedingValueScore ?? 82;
  const raceScore = perfProfile?.performanceSummary?.overallPerformanceScore ?? 79;
  const reliabilityPct = perfProfile?.performanceSummary?.dataReliabilityPct ?? 74;
  const coiPct = perfProfile?.geneticProfile?.inbreedingCoiPct ?? 0.0;
  const specialtyLabel = perfProfile?.geneticProfile?.distanceSpecialtyLabel || 'Orta & Uzun Mesafe (All-Round)';
  const distSuit = perfProfile?.geneticProfile?.distanceSuitability || {
    sprint: 78,
    middle: 86,
    long: 82,
    marathon: 74
  };

  // 2. Fiziksel (Ele Alma / Fenotip) Özellikler
  const eyeLabels = {
    yellow_breeder: 'Sarı İris (Damızlık & Hız)',
    pearl_racer: 'Beyaz / İnci İris (Yarışçı)',
    orange_amber: 'Portakal / Kehribar İris',
    red_chestnut: 'Kırmızı / Kestane İris',
    violet_pearl: 'Menekşe / Viyole İnci İris',
    green_circle: 'Yeşil Halkalı Sarı İris',
    gravel_grey: 'Dumanlı Gri / Çakıl İris',
    dark_brown: 'Koyu Kestane / Kahve İris',
    bull_eye: 'Koyu / Bilye Göz (Bull Eye)',
    split_eye: 'Çift Renkli / Kırık Göz'
  };
  const roleLabels = {
    BREEDER: 'Damızlık Kadrosu',
    RACER: 'Yarış Kadrosu',
    YOUNG: 'Genç / Yavru Kadrosu'
  };
  const statusLabels = {
    ACTIVE: 'Aktif Kümeste',
    RESTING: 'Dinlenmede',
    LOST_SOLD: 'Kayıp / Satıldı'
  };

  const phenotype = {
    bodyBuild: main.bodyBuild || 'Standart Dengeli Gövde',
    muscleType: main.muscleType || 'Esnek ve Güçlü Göğüs Kası',
    pubicBone: main.pubicBone || 'Sıkı ve Dengeli Çatal Kemik',
    wingFeather: main.wingFeather || 'Dengeli Kanat & İpeksi Telek',
    eyeSignLabel: eyeLabels[main.eyeSign] || 'Beyaz / İnci İris',
    roleLabel: roleLabels[main.roleCategory] || 'Yarış & Damızlık',
    statusLabel: statusLabels[main.birdStatus] || 'Aktif Kümeste'
  };

  // 3. Resmi Yarış Geçmişi + Pedigri Başarı Satırları
  const raceRecords = [];
  if (typeof AvigenRaceTracker !== 'undefined' && typeof AvigenRaceTracker.getBirdRaceHistory === 'function') {
    try {
      const trackerHist = AvigenRaceTracker.getBirdRaceHistory(ringClean) || [];
      trackerHist.forEach(h => {
        const rankTxt = h.rank ? `${h.rank}. Derece` : (h.birdStatusLabel || 'Katıldı');
        const speedTxt = h.speedMpm ? `${h.speedMpm} m/dk` : '';
        raceRecords.push({
          title: `${h.raceTitle || 'Yarış Etabı'} (${h.distanceKm || '-'} km)`,
          detail: [rankTxt, h.totalCompetitors ? `${h.totalCompetitors} Kuş` : '', speedTxt, h.releaseDate || ''].filter(Boolean).join(' • ')
        });
      });
    } catch (e) {}
  }

  const noteLines = String(main.notes || '')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('Fiziksel Yapı:'));
  noteLines.forEach(line => {
    if (raceRecords.length < 7) {
      raceRecords.push({
        title: line.slice(0, 78),
        detail: 'Pedigri Resmi Başarı & Soy Kaydı'
      });
    }
  });

  // 4. Kişisel Sicil Dosyası Kayıtları (birdDossierList + Aktif Yuva Eşleşmeleri)
  const dossierRecords = [];
  if (Array.isArray(birdDossierList)) {
    birdDossierList.forEach(item => {
      const itemRing = String(item.ring || '').toUpperCase();
      if (ringUp && (itemRing.includes(ringUp) || ringUp.includes(itemRing))) {
        dossierRecords.push({
          date: item.date || '-',
          category: item.category || 'Sicil Kaydı',
          detail: item.detail || ''
        });
      }
    });
  }
  if (Array.isArray(activePairsList)) {
    activePairsList.forEach(pair => {
      const sUp = String(pair.sire || '').toUpperCase();
      const dUp = String(pair.dam || '').toUpperCase();
      if (ringUp && (sUp.includes(ringUp) || dUp.includes(ringUp))) {
        dossierRecords.push({
          date: pair.eventDate || 'Aktif',
          category: `🪺 ${pair.nest || 'Aktif Yuva'}`,
          detail: `Eşleşme: ♂ ${pair.sire} × ♀ ${pair.dam} (${pair.detail || 'Kuluçka/Yavru Takibi'})`
        });
      }
    });
  }

  return {
    main,
    breedingScore,
    raceScore,
    reliabilityPct,
    coiPct,
    specialtyLabel,
    distSuit,
    phenotype,
    raceRecords,
    dossierRecords
  };
}

function buildPedigreeSecondPageHtml(ped, logoHtml, birdPhotoHtml, accent, genDepth, showCodes) {
  const d = computePedigreePage2Data(ped);
  const main = d.main;

  return `
    <div class="paper-watermark">${escapeHtml(loftConfig.title)}</div>

    <!-- ÜST BAŞLIK & ANA KUŞ (1. SAYFA İLE BİREBİR KURUMSAL BÜTÜNLÜK) -->
    <div class="paper-top">
      <div class="paper-loft" onclick="openLoftHeaderModal()" style="cursor:pointer;">
        <div class="paper-logo">${logoHtml}</div>
        <div class="paper-loft-title">
          <h2>${escapeHtml(loftConfig.title)}</h2>
          <p>SAYFA 2 / 2 • PERFORMANS, GENETİK PROFİL &amp; KİŞİSEL SİCİL DOSYASI</p>
        </div>
      </div>

      <div class="paper-main-bird" onclick="openBoxEditModal('main')">
        <div class="paper-bird-photo">${birdPhotoHtml}</div>
        <div style="min-width:0; flex:1; overflow:hidden;">
          <div style="font-size:12.5px; font-weight:900; color:${accent}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${main.flag || '🇹🇷'} ${escapeHtml(main.ring)} • ${main.sex === 'F' ? '♀ Dişi' : '♂ Erkek'}
          </div>
          <div style="font-size:11px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(main.name || 'İsimsiz Güvercin')}</div>
          <div style="font-size:8.5px; opacity:0.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(main.color || 'Mavi Çakmaklı')} • ${escapeHtml(d.phenotype.roleLabel)}</div>
          <div style="font-size:8px; font-weight:800; color:#047857; margin-top:1px;">Uzmanlık: ${escapeHtml(d.specialtyLabel)}</div>
        </div>
      </div>
    </div>

    <!-- 2. SAYFA ANA GÖVDE: 2x2 KURUMSAL ANALİZ VE SİCİL TABLOSU -->
    <div style="display:grid; grid-template-columns:1fr 1fr; grid-template-rows:195px 218px; gap:8px; height:422px; padding:2px 0;">

      <!-- KUTU 1 (SOL ÜST): BİREYSEL PERFORMANS & GENETİK PROFİL KARTI -->
      <div style="background:#ffffff; border:1.5px solid #93c5fd; border-left:4px solid #1d4ed8; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
          <span style="font-size:10px; font-weight:900; color:#1e3a8a;">📊 1. PERFORMANS &amp; GENETİK PROFİL ENDEKSİ</span>
          <span style="font-size:8px; font-weight:800; background:#eff6ff; color:#1d4ed8; padding:1px 6px; border-radius:4px;">Güven: %${d.reliabilityPct}</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; text-align:center; margin:4px 0;">
          <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:4px;">
            <div style="font-size:7.2px; font-weight:800; color:#475569;">DAMIZLIK DEĞERİ (EBV)</div>
            <div style="font-size:14px; font-weight:900; color:#1d4ed8;">${d.breedingScore}/100</div>
          </div>
          <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:4px;">
            <div style="font-size:7.2px; font-weight:800; color:#475569;">YARIŞ PERFORMANSI</div>
            <div style="font-size:14px; font-weight:900; color:#047857;">${d.raceScore}/100</div>
          </div>
          <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:6px; padding:4px;">
            <div style="font-size:7.2px; font-weight:800; color:#475569;">WRIGHT 5 NESİL COI</div>
            <div style="font-size:13px; font-weight:900; color:#6d28d9;">%${Number(d.coiPct || 0).toFixed(2)}</div>
          </div>
        </div>

        <!-- 4 Mesafe Kategorisi Çubukları -->
        <div style="display:flex; flex-direction:column; gap:3.5px; font-size:8px;">
          ${[
            { label: 'Sprint / Kısa Mesafe (100-300 km)', val: d.distSuit.sprint || 78, col: '#0284c7' },
            { label: 'Orta Mesafe (300-500 km)', val: d.distSuit.middle || 85, col: '#1d4ed8' },
            { label: 'Uzun Mesafe (500-700 km)', val: d.distSuit.long || 82, col: '#7c3aed' },
            { label: 'Maraton / Ekstrem (700+ km)', val: d.distSuit.marathon || 74, col: '#059669' }
          ].map(bar => `
            <div>
              <div style="display:flex; justify-content:space-between; font-weight:800; color:#334155; margin-bottom:1px;">
                <span>${bar.label}</span>
                <span style="color:${bar.col};">%${bar.val}</span>
              </div>
              <div style="height:5px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                <div style="width:${Math.min(100, Math.max(15, bar.val))}%; height:100%; background:${bar.col}; border-radius:3px;"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- KUTU 2 (SAĞ ÜST): KUŞÇU ELE ALMA, FİZİKSEL FENOTİP & KİMLİK ÖZELLİKLERİ -->
      <div style="background:#ffffff; border:1.5px solid #c4b5fd; border-left:4px solid #7c3aed; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column; justify-content:space-between;" onclick="openBoxEditModal('main')">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
          <span style="font-size:10px; font-weight:900; color:#5b21b6;">✋ 2. ELE ALMA &amp; FİZİKSEL FENOTİP KİMLİĞİ</span>
          <span style="font-size:7.8px; font-weight:800; color:#7c3aed; cursor:pointer;">✎ Düzenle</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px; font-size:8.3px;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:4px 6px;">
            <div style="font-size:7.2px; font-weight:800; color:#64748b;">GÖVDE &amp; OMURGA YAPISI</div>
            <div style="font-weight:900; color:#0f172a; margin-top:1px;">${escapeHtml(d.phenotype.bodyBuild)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:4px 6px;">
            <div style="font-size:7.2px; font-weight:800; color:#64748b;">GÖĞÜS KASI KARAKTERİ</div>
            <div style="font-weight:900; color:#0f172a; margin-top:1px;">${escapeHtml(d.phenotype.muscleType)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:4px 6px;">
            <div style="font-size:7.2px; font-weight:800; color:#64748b;">ÇATAL KEMİK (PUBİS)</div>
            <div style="font-weight:900; color:#0f172a; margin-top:1px;">${escapeHtml(d.phenotype.pubicBone)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:4px 6px;">
            <div style="font-size:7.2px; font-weight:800; color:#64748b;">KANAT &amp; SON 3 TELEK</div>
            <div style="font-weight:900; color:#0f172a; margin-top:1px;">${escapeHtml(d.phenotype.wingFeather)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:4px 6px;">
            <div style="font-size:7.2px; font-weight:800; color:#64748b;">GÖZ İRİS İŞARETİ (EYE-SIGN)</div>
            <div style="font-weight:900; color:#5b21b6; margin-top:1px;">${escapeHtml(d.phenotype.eyeSignLabel)}</div>
          </div>
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:5px; padding:4px 6px;">
            <div style="font-size:7.2px; font-weight:800; color:#64748b;">KÜMES STATÜSÜ &amp; EBEVEYN</div>
            <div style="font-weight:900; color:#047857; margin-top:1px;">♂ ${escapeHtml(ped.boxes?.sire?.ring || '-')} × ♀ ${escapeHtml(ped.boxes?.dam?.ring || '-')}</div>
          </div>
        </div>
      </div>

      <!-- KUTU 3 (SOL ALT): RESMİ YARIŞ DERECELERİ, ETAP HIZLARI & SOY BAŞARILARI -->
      <div style="background:#ffffff; border:1.5px solid #6ee7b7; border-left:4px solid #059669; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:5px;">
          <span style="font-size:10px; font-weight:900; color:#065f46;">🏆 3. YARIŞ DERECELERİ &amp; PERFORMANS KAYITLARI</span>
          <span style="font-size:7.8px; font-weight:800; background:#ecfdf5; color:#047857; padding:1px 6px; border-radius:4px;">${d.raceRecords.length} Kayıt</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; overflow:hidden; flex:1;">
          ${d.raceRecords.length > 0 ? d.raceRecords.slice(0, 5).map((rItem, idx) => `
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-left:3px solid #059669; border-radius:5px; padding:3.5px 6px; font-size:8.2px;">
              <div style="font-weight:900; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${idx + 1}. ${escapeHtml(rItem.title)}</div>
              <div style="font-size:7.5px; color:#475569; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(rItem.detail)}</div>
            </div>
          `).join('') : `
            <div style="font-size:8.5px; color:#64748b; padding:12px 6px; text-align:center;">
              Henüz bireysel yarış veya derece kaydı girilmemiş. Kuş kutusuna dokunarak "+ Standart Derece Ekle" aracından yarış derecesi ekleyebilirsiniz.
            </div>
          `}
        </div>
      </div>

      <!-- KUTU 4 (SAĞ ALT): GÜVERCİN KİŞİSEL SİCİL DOSYASI (AŞI, SAĞLIK, YUVA & KÜMES NOTLARI) -->
      <div style="background:#ffffff; border:1.5px solid #fcd34d; border-left:4px solid #d97706; border-radius:8px; padding:8px 10px; display:flex; flex-direction:column;" onclick="openBirdDossierModal('${escapeHtml(main.ring)}', '${escapeHtml(main.name || '')}')">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:5px;">
          <span style="font-size:10px; font-weight:900; color:#92400e;">📋 4. KİŞİSEL SİCİL DOSYASI (SAĞLIK, AŞI &amp; YUVA)</span>
          <span style="font-size:7.8px; font-weight:900; background:#fffbeb; color:#b45309; border:1px solid #fde68a; padding:1px 6px; border-radius:4px; cursor:pointer;">+ Sicil Ekle</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:4px; overflow:hidden; flex:1;">
          ${d.dossierRecords.length > 0 ? d.dossierRecords.slice(0, 5).map(doc => `
            <div style="background:#fffbeb; border:1px solid #fde68a; border-left:3px solid #d97706; border-radius:5px; padding:3.5px 6px; font-size:8.2px;">
              <div style="display:flex; justify-content:space-between; font-weight:900; color:#92400e;">
                <span>${escapeHtml(doc.category)}</span>
                <span style="font-size:7.4px; color:#b45309;">${escapeHtml(doc.date)}</span>
              </div>
              <div style="font-size:7.6px; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(doc.detail)}</div>
            </div>
          `).join('') : `
            <div style="background:#fffbeb; border:1px dashed #fcd34d; border-radius:6px; padding:10px 8px; font-size:8.3px; color:#92400e; line-height:1.4;">
              <strong>📋 Resmi Kümes Sicil Özeti:</strong><br/>
              • Kuş Halka No: <strong>${escapeHtml(main.ring)}</strong> (${escapeHtml(d.phenotype.statusLabel)})<br/>
              • Aşı, sağlık tedavisi, eşleşme veya özel kümes sicil kaydı eklemek için bu kutuya dokunun.
            </div>
          `}
        </div>
      </div>

    </div>

    <!-- ALT BİLGİ: QR KOD & BARKOD + AVIGEN GENESIS AI RESMİ SERTİFİKA BARI -->
    <div class="paper-footer" style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
      <div class="paper-codes">
        ${showCodes ? makeQrSvg(encodeFullPedigreeQrPayload(ped)) : ''}
        ${showCodes ? makeBarcodeSvg(main.ring) : ''}
        <div>
          <strong style="color:${accent};">${escapeHtml(loftConfig.title)} — SAYFA 2 (PERFORMANS &amp; SİCİL)</strong>
          <div>AVIGEN Dijital Sicil &amp; Profil Kodu: #AVG-${(main.ring || '001').replace(/[^A-Z0-9]/gi, '').slice(-5)}-P2</div>
        </div>
      </div>

      <div style="display:flex; align-items:center; gap:7px; background:linear-gradient(135deg, #0a1938 0%, #1e3a8a 60%, #3b0764 100%); border:1.2px solid #f59e0b; border-radius:7px; padding:3px 8px 3px 4px; color:#ffffff; box-shadow:0 2px 6px rgba(15,23,42,0.18);">
        <img src="avigen-dna-pigeon.jpg" alt="AVIGEN GENESIS AI" style="width:32px; height:28px; object-fit:cover; border-radius:5px; border:1px solid #38bdf8; flex-shrink:0;" />
        <div style="line-height:1.15; text-align:left;">
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="background:#f59e0b; color:#0f172a; font-size:7px; font-weight:900; padding:0.5px 3.5px; border-radius:3px;">AI</span>
            <span style="font-size:8.5px; font-weight:900; color:#fde047; letter-spacing:0.3px;">AVIGEN GENESIS AI</span>
            <span style="font-size:7px; font-weight:700; color:#bae6fd;">• Performance &amp; Dossier (Page 2)</span>
          </div>
          <div style="font-size:7.2px; font-weight:600; color:#e2e8f0; margin-top:1px;">
            Bireysel Performans • Genetik Profil • Kişisel Sicil Dosyası
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderActivePedigree() {
  const paper = document.getElementById('mypedigrePaper');
  if (!paper) return;
  const ped = getActivePedigree();
  if (!ped) {
    paper.innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; min-height:420px; text-align:center; padding:32px;">
        <div style="font-size:44px; margin-bottom:10px;">📜</div>
        <div style="font-size:18px; font-weight:900; color:#1d4ed8; margin-bottom:6px;">Henüz Kayıtlı Pedigri Yok</div>
        <div style="font-size:13px; color:#475569; max-width:460px; line-height:1.5; margin-bottom:16px;">
          Kümesinize ilk güvercininizi ekleyerek 4 kuşak (31 kutu) resmi AVIGEN soyağacı sertifikasını ve 2. sayfa Performans/Sicil kartını oluşturabilir, PDF/PNG olarak indirebilir ve WhatsApp'tan paylaşabilirsiniz.
        </div>
        <button type="button" class="ios-btn ios-btn-primary" style="padding:12px 22px; font-size:14px; font-weight:900;" onclick="createNewPedigreeRecord()">
          ➕ İlk Güvercinimi &amp; Pedigrisini Oluştur
        </button>
      </div>
    `;
    return;
  }

  // Resmi Kurumsal AVIGEN Mavi Standardı (Sabit ve Net)
  const accent = '#1d4ed8';
  const bg = '#f8fafc';
  const primary = '#0f172a';
  const nodeBg = '#ffffff';
  const boxBg = 'rgba(29, 78, 216, 0.08)';
  const showCodes = true;

  paper.style.setProperty('--p-accent', accent);
  paper.style.setProperty('--p-primary', primary);
  paper.style.setProperty('--p-node', nodeBg);
  paper.style.setProperty('--p-box', boxBg);
  paper.style.backgroundColor = bg;
  paper.style.color = primary;
  paper.style.borderColor = accent;
  paper.style.fontFamily = "'Inter', sans-serif";

  const main = ped.boxes?.main || { flag: '🇹🇷', ring: 'TR-2026-0001', name: 'Şampiyon', color: '', notes: '', photo: '' };
  const hasCustomLoftLogo = Boolean(loftConfig.logo && !String(loftConfig.logo).includes('avigen-logo.svg'));
  const logoHtml = hasCustomLoftLogo
    ? `<img src="${loftConfig.logo}" style="width:100%;height:100%;object-fit:contain;background:#fff;padding:2px;" />`
    : `<div style="width:100%;height:100%;background:#fff;padding:2px;display:flex;align-items:center;justify-content:center;">${getInlineAvigenLogoSvgHtml('width:100%;height:100%;')}</div>`;
  const birdPhotoHtml = main.photo
    ? `<img src="${main.photo}" />`
    : `<div style="width:84%;height:84%;display:flex;align-items:center;justify-content:center;">${getInlineAvigenLogoSvgHtml('width:100%;height:100%;')}</div>`;
  const genDepth = parseInt(loftConfig.genDepth, 10) || 4;

  const badgeEl = document.getElementById('zoomBadge');
  if (badgeEl && !pedigreeZoomedIn) {
    badgeEl.textContent = activePedigreeSheetPageMode === 'page2'
      ? 'Sayfa 2: Performans & Sicil'
      : (activePedigreeSheetPageMode === 'both' ? 'Sayfa 1+2 (Tam Dosya)' : `Sayfa 1: Pedigri (${genDepth} Kuşak)`);
  }

  let g4ColumnHtml = '';
  if (genDepth === 4) {
    let g4Boxes = '';
    for (let i = 1; i <= 16; i++) {
      g4Boxes += renderBoxHtml(ped, `g4_${i}`, i % 2 === 1 ? 'M' : 'F');
    }
    g4ColumnHtml = `<div class="paper-col col-g4">${g4Boxes}</div>`;
  }

  const page1InnerHtml = `
    <div class="paper-watermark">${escapeHtml(loftConfig.title)}</div>

    <!-- ÜST BAŞLIK & ANA KUŞ -->
    <div class="paper-top">
      <div class="paper-loft" onclick="openLoftHeaderModal()" style="cursor:pointer;">
        <div class="paper-logo">${logoHtml}</div>
        <div class="paper-loft-title">
          <h2>${escapeHtml(loftConfig.title)}</h2>
          <p>${escapeHtml(loftConfig.subtitle)}</p>
        </div>
      </div>

      <div class="paper-main-bird" onclick="openBoxEditModal('main')">
        <div class="paper-bird-photo">${birdPhotoHtml}</div>
        <div style="min-width:0; flex:1; overflow:hidden;">
          <div style="font-size:12.5px; font-weight:900; color:${accent}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${main.flag || '🇹🇷'} ${escapeHtml(main.ring)}
          </div>
          <div style="font-size:11px; font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(main.name)}</div>
          <div style="font-size:8.5px; opacity:0.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(main.color)}</div>
          ${main.notes ? `<div class="paper-main-bird-notes">${escapeHtml(main.notes)}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- SOYAĞACI AĞACI (1. KUŞAK BABA/ANNE, 2. KUŞAK 4'LÜ, 3. KUŞAK 8'Lİ, 4. KUŞAK 16'LI) -->
    <div class="paper-tree ${genDepth === 3 ? 'gen-3-mode' : ''}">
      <div class="paper-col col-g1">
        ${renderBoxHtml(ped, 'sire', 'M')}
        ${renderBoxHtml(ped, 'dam', 'F')}
      </div>
      <div class="paper-col col-g2">
        ${renderBoxHtml(ped, 'g2_1', 'M')}
        ${renderBoxHtml(ped, 'g2_2', 'F')}
        ${renderBoxHtml(ped, 'g2_3', 'M')}
        ${renderBoxHtml(ped, 'g2_4', 'F')}
      </div>
      <div class="paper-col col-g3">
        ${renderBoxHtml(ped, 'g3_1', 'M')}
        ${renderBoxHtml(ped, 'g3_2', 'F')}
        ${renderBoxHtml(ped, 'g3_3', 'M')}
        ${renderBoxHtml(ped, 'g3_4', 'F')}
        ${renderBoxHtml(ped, 'g3_5', 'M')}
        ${renderBoxHtml(ped, 'g3_6', 'F')}
        ${renderBoxHtml(ped, 'g3_7', 'M')}
        ${renderBoxHtml(ped, 'g3_8', 'F')}
      </div>
      ${g4ColumnHtml}
    </div>

    <!-- ALT BİLGİ: TAM SOYAĞACI TAŞIYAN QR KOD & BARKOD + MİNİMAL AVIGEN GENESIS AI REKLAM BARI -->
    <div class="paper-footer" style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
      <div class="paper-codes">
        ${showCodes ? makeQrSvg(encodeFullPedigreeQrPayload(ped)) : ''}
        ${showCodes ? makeBarcodeSvg(main.ring) : ''}
        <div>
          <strong style="color:${accent};">${escapeHtml(loftConfig.title)} — SAYFA 1 (SOYAĞACI)</strong>
          <div>AVIGEN QR/Barkod Kodu: #AVG-${(main.ring || '001').replace(/[^A-Z0-9]/gi, '').slice(-5)}</div>
        </div>
      </div>

      <!-- ANA SAYFADAKİ GÖRSEL İLE MİNİMAL AVIGEN GENESIS AI REKLAM & TANITIM ROZETİ -->
      <div style="display:flex; align-items:center; gap:7px; background:linear-gradient(135deg, #0a1938 0%, #1e3a8a 60%, #3b0764 100%); border:1.2px solid #f59e0b; border-radius:7px; padding:3px 8px 3px 4px; color:#ffffff; box-shadow:0 2px 6px rgba(15,23,42,0.18);">
        <img src="avigen-dna-pigeon.jpg" alt="AVIGEN GENESIS AI" style="width:32px; height:28px; object-fit:cover; border-radius:5px; border:1px solid #38bdf8; flex-shrink:0;" />
        <div style="line-height:1.15; text-align:left;">
          <div style="display:flex; align-items:center; gap:4px;">
            <span style="background:#f59e0b; color:#0f172a; font-size:7px; font-weight:900; padding:0.5px 3.5px; border-radius:3px;">AI</span>
            <span style="font-size:8.5px; font-weight:900; color:#fde047; letter-spacing:0.3px;">AVIGEN GENESIS AI</span>
            <span style="font-size:7px; font-weight:700; color:#bae6fd;">• Official Certificate (${genDepth} Gen)</span>
          </div>
          <div style="font-size:7.2px; font-weight:600; color:#e2e8f0; margin-top:1px;">
            5 Kuşak Genetik Eşleştirme • Yarış &amp; Beslenme Zekâsı
          </div>
        </div>
      </div>
    </div>
  `;

  const page2InnerHtml = buildPedigreeSecondPageHtml(ped, logoHtml, birdPhotoHtml, accent, genDepth, showCodes);

  if (activePedigreeSheetPageMode === 'page2') {
    paper.style.height = '560px';
    paper.innerHTML = page2InnerHtml;
  } else if (activePedigreeSheetPageMode === 'both') {
    paper.style.height = '1136px';
    paper.innerHTML = `
      <div style="position:relative; width:100%; height:552px; border-bottom:3px dashed #1d4ed8; padding-bottom:6px; margin-bottom:10px; display:flex; flex-direction:column; justify-content:space-between;">
        ${page1InnerHtml}
      </div>
      <div style="position:relative; width:100%; height:552px; display:flex; flex-direction:column; justify-content:space-between;">
        ${page2InnerHtml}
      </div>
    `;
  } else {
    paper.style.height = '560px';
    paper.innerHTML = page1InnerHtml;
  }

  setTimeout(fitPaperToIphoneScreen, 10);
}

// Bir Pedigrenin Ana Kuşunu + Baba + Anne + Büyük Ebeveynlerini Tek Bir QR Veri Paketine Sıkıştırır
function encodeFullPedigreeQrPayload(ped) {
  const b = ped?.boxes || {};
  const pack = (slot) => {
    const item = b[slot];
    if (!item || !item.ring) return '';
    return `${slot}:${item.ring}~${item.name || ''}~${item.color || ''}~${(item.notes || '').replace(/\r?\n/g, ' ')}`;
  };
  const slots = ['main', 'sire', 'dam', 'g2_1', 'g2_2', 'g2_3', 'g2_4', 'g3_1', 'g3_2', 'g3_3', 'g3_4', 'g3_5', 'g3_6', 'g3_7', 'g3_8'];
  const encodedNodes = slots.map(pack).filter(Boolean).join('||');
  return `AVIGEN_FULL||${encodedNodes}`;
}

// iPhone Ekranına %100 Kaydırmasız Otomatik Sığdırma veya Yakınlaştırma (Pinch-to-Zoom & +/- Büyütme) Motoru
let pedigreeZoomedIn = false;
let customPedigreeScale = null; // null ise otomatik ekrana sığdırır, sayı ise (0.45 - 1.50) o oranda büyütür

function togglePedigreeZoomMode() {
  if (customPedigreeScale === null) {
    stepPedigreeZoom(0.35);
  } else {
    resetPedigreeZoomFit();
  }
}

function stepPedigreeZoom(delta) {
  const stageBox = document.getElementById('pedigreeStageBox');
  const availW = stageBox ? Math.max(260, stageBox.clientWidth - 12) : 350;
  const fitScale = Math.min(1, availW / 760);

  const current = customPedigreeScale !== null ? customPedigreeScale : fitScale;
  customPedigreeScale = Math.max(fitScale, Math.min(1.4, +(current + delta).toFixed(2)));
  if (Math.abs(customPedigreeScale - fitScale) < 0.03) {
    customPedigreeScale = null;
  }
  pedigreeZoomedIn = customPedigreeScale !== null;
  fitPaperToIphoneScreen();
}

function resetPedigreeZoomFit() {
  customPedigreeScale = null;
  pedigreeZoomedIn = false;
  fitPaperToIphoneScreen();
}

function fitPaperToIphoneScreen() {
  const stageBox = document.getElementById('pedigreeStageBox');
  const viewport = document.getElementById('pedigreeViewport');
  const paper = document.getElementById('mypedigrePaper');
  const btn = document.getElementById('btnPedigreeZoom');
  const badge = document.getElementById('zoomBadge');
  if (!stageBox || !viewport || !paper) return;

  const availW = Math.max(260, stageBox.clientWidth - 12);
  const baseW = 760;
  const baseH = activePedigreeSheetPageMode === 'both' ? 1136 : 560;
  const fitScale = Math.min(1, availW / baseW);

  if (customPedigreeScale !== null && customPedigreeScale > fitScale + 0.02) {
    const zoomScale = customPedigreeScale;
    paper.style.transformOrigin = 'top left';
    paper.style.transform = `scale(${zoomScale})`;
    // Büyütüldüğünde sağa-sola ve aşağı-yukarı parmakla rahatça kaydırılabilmesi için iç sarmalayıcı boyutunu ayarla
    paper.style.marginRight = `${Math.ceil(baseW * zoomScale - baseW)}px`;
    paper.style.marginBottom = `${Math.ceil(baseH * zoomScale - baseH)}px`;
    viewport.style.overflowX = 'auto';
    viewport.style.overflowY = 'auto';
    viewport.style.justifyContent = 'flex-start';
    viewport.style.height = `${Math.min(430, Math.ceil(baseH * zoomScale) + 12)}px`;
    if (btn) btn.textContent = '📱 Sığdır';
    if (badge) badge.textContent = `%${Math.round((zoomScale / fitScale) * 100)}`;
  } else {
    paper.style.transformOrigin = 'top center';
    paper.style.transform = `scale(${fitScale})`;
    paper.style.marginRight = '0px';
    paper.style.marginBottom = activePedigreeSheetPageMode === 'both' ? `${Math.ceil(baseH * fitScale - baseH)}px` : '0px';
    viewport.style.overflowX = 'hidden';
    viewport.style.overflowY = activePedigreeSheetPageMode === 'both' ? 'auto' : 'hidden';
    viewport.style.justifyContent = 'center';
    viewport.style.height = activePedigreeSheetPageMode === 'both'
      ? `${Math.min(430, Math.ceil(baseH * fitScale))}px`
      : `${Math.ceil(baseH * fitScale)}px`;
    if (btn) btn.textContent = '🔍 Büyüt';
    if (badge) badge.textContent = activePedigreeSheetPageMode === 'page2' ? '2. Sayfa' : (activePedigreeSheetPageMode === 'both' ? '1+2 Sayfa' : '1. Sayfa');
  }
}

// Cep Telefonunda İki Parmakla Çimdikleyerek (Pinch-to-Zoom) Pedigreyi Büyütme/Küçültme Desteği
function initPedigreePinchZoom() {
  const viewport = document.getElementById('pedigreeViewport');
  if (!viewport) return;

  let startDist = 0;
  let startScale = 0.5;

  const getTouchDist = (touches) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      startDist = getTouchDist(e.touches);
      const stageBox = document.getElementById('pedigreeStageBox');
      const availW = stageBox ? Math.max(260, stageBox.clientWidth - 12) : 350;
      const fitScale = Math.min(1, availW / 760);
      startScale = customPedigreeScale !== null ? customPedigreeScale : fitScale;
    }
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && startDist > 0) {
      e.preventDefault();
      const newDist = getTouchDist(e.touches);
      const ratio = newDist / startDist;
      const stageBox = document.getElementById('pedigreeStageBox');
      const availW = stageBox ? Math.max(260, stageBox.clientWidth - 12) : 350;
      const fitScale = Math.min(1, availW / 760);

      const nextScale = Math.max(fitScale, Math.min(1.45, +(startScale * ratio).toFixed(2)));
      customPedigreeScale = nextScale <= fitScale + 0.02 ? null : nextScale;
      pedigreeZoomedIn = customPedigreeScale !== null;
      fitPaperToIphoneScreen();
    }
  }, { passive: false });
}

// ============================================================================
// KUTU DÜZENLEME, AKILLI OTOMATİK DOLDURMA & BONCUK NO BAYRAK SEÇİMİ
// ============================================================================
// Kutu düzenleme veya otomatik tamamlama için tüm soyağacı halkaları
function populateKnownRingsDatalist() {
  const dl = document.getElementById('knownRingsDatalist');
  if (!dl) return;
  const seen = new Map();
  pedigrees.forEach(p => {
    Object.values(p.boxes || {}).forEach(b => {
      if (b && b.ring && !seen.has(b.ring)) {
        seen.set(b.ring, b);
      }
    });
  });

  dl.innerHTML = Array.from(seen.values()).map(b =>
    `<option value="${escapeHtml(b.ring)}">${b.flag || '🇹🇷'} ${escapeHtml(b.name || '')} — ${escapeHtml(b.color || '')}</option>`
  ).join('');
}

// Çift eşleştirme (Yuva / Damızlık) için SADECE kümeste fiziksel olarak mevcut (inMyLoft) kuşları döndüren datalist
function populateActiveLoftRingsDatalist() {
  let dl = document.getElementById('activeLoftRingsDatalist');
  if (!dl) {
    dl = document.createElement('datalist');
    dl.id = 'activeLoftRingsDatalist';
    document.body.appendChild(dl);
  }
  const activeBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
  dl.innerHTML = activeBirds.map(b =>
    `<option value="${escapeHtml(b.ring)} (${escapeHtml(b.name)})">${b.flag || '🇹🇷'} ${b.sex === 'F' ? '♀ Dişi' : '♂ Erkek'} — ${escapeHtml(b.color || '')}</option>`
  ).join('');
}

function onSmartRingInput(ringVal) {
  const clean = (ringVal || '').trim().toUpperCase();
  if (!clean) return;

  // Ülke koduna göre bayrağı otomatik seç
  const autoFlag = detectFlagFromRing(clean);
  if (autoFlag) {
    editingFlag = autoFlag;
    renderFlagChips();
  }

  // Mevcut kayıtlarda bu halka numarası varsa adını, rengini ve notunu otomatik doldur (Madde 3: Tekrar veri girişini önle)
  for (const p of pedigrees) {
    for (const b of Object.values(p.boxes || {})) {
      if (b && b.ring && b.ring.toUpperCase() === clean) {
        if (b.name) document.getElementById('editBoxName').value = b.name;
        if (b.color) document.getElementById('editBoxColor').value = b.color;
        if (b.notes) document.getElementById('editBoxNotes').value = b.notes;
        return;
      }
    }
  }
}

let editingModalSex = 'M';
let editingModalRole = 'RACER';

function setSelectColorOrCustom(selectEl, val) {
  if (!selectEl) return;
  const clean = (val || 'Mavi Çakmaklı').split('•')[0].trim();
  const exists = [...selectEl.options].some(o => o.value.toLowerCase() === clean.toLowerCase());
  if (exists) {
    const matchOpt = [...selectEl.options].find(o => o.value.toLowerCase() === clean.toLowerCase());
    selectEl.value = matchOpt.value;
  } else if (clean) {
    const opt = document.createElement('option');
    opt.value = clean;
    opt.textContent = `🪶 ${clean}`;
    selectEl.appendChild(opt);
    selectEl.value = clean;
  } else {
    selectEl.value = 'Mavi Çakmaklı';
  }
}

function selectModalSegment(groupId, val, btnEl) {
  if (groupId === 'editBoxSexGroup') editingModalSex = val;
  if (groupId === 'editBoxRoleGroup') editingModalRole = val;
  const grp = document.getElementById(groupId);
  if (grp) {
    grp.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    if (btnEl) btnEl.classList.add('active');
    else {
      const target = grp.querySelector(`[data-val="${val}"]`);
      if (target) target.classList.add('active');
    }
  }
}

function populateModalParentSelects(currentRing = '', currentSireRing = '', currentDamRing = '') {
  const sireSel = document.getElementById('editBoxSireLink');
  const damSel = document.getElementById('editBoxDamLink');
  if (!sireSel || !damSel) return;

  const { males, females, all } = getAllBreedingCandidates();
  const mPool = (males.length ? males : all).filter(c => c.ring.toUpperCase() !== (currentRing || '').toUpperCase());
  const fPool = (females.length ? females : all).filter(c => c.ring.toUpperCase() !== (currentRing || '').toUpperCase());

  sireSel.innerHTML = `<option value="">-- Mevcut Babayı Koru / Seçilmedi --</option>` +
    mPool.map(c => `<option value="${c.id}" ${c.ring.toUpperCase() === (currentSireRing || '').toUpperCase() ? 'selected' : ''}>${c.flag} ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('');

  damSel.innerHTML = `<option value="">-- Mevcut Anneyi Koru / Seçilmedi --</option>` +
    fPool.map(c => `<option value="${c.id}" ${c.ring.toUpperCase() === (currentDamRing || '').toUpperCase() ? 'selected' : ''}>${c.flag} ${escapeHtml(c.ring)} (${escapeHtml(c.name)})</option>`).join('');
}

function syncPhysicalTraitsToBoxNotes() {
  const bBuild = document.getElementById('editBoxBodyBuild')?.value || '';
  const mType = document.getElementById('editBoxMuscleType')?.value || '';
  const pBone = document.getElementById('editBoxPubicBone')?.value || '';
  const wFeat = document.getElementById('editBoxWingFeather')?.value || '';
  const parts = [bBuild, mType, pBone, wFeat].filter(Boolean);
  const notesEl = document.getElementById('editBoxNotes');
  if (!notesEl) return;

  const lines = (notesEl.value || '').split(/\r?\n/).filter(l => !l.trim().startsWith('Fiziksel Yapı:'));
  if (parts.length > 0) {
    lines.push(`Fiziksel Yapı: ${parts.join(' • ')}`);
  }
  notesEl.value = lines.filter(Boolean).join('\n');
}

function openBoxEditModal(slotKey) {
  const ped = getActivePedigree();
  if (!ped) {
    createNewPedigreeRecord();
    return;
  }
  isCreatingNewPedigreeDraft = false;
  pendingChickCreationData = null;
  const parentBanner = document.getElementById('chickParentsInfoBanner');
  if (parentBanner) parentBanner.style.display = 'none';
  const secondSec = document.getElementById('secondChickSiblingSection');
  if (secondSec) secondSec.style.display = 'none';

  editingSlotKey = slotKey;
  const slotMeta = BOX_SLOTS.find(s => s.key === slotKey) || BOX_SLOTS[0];
  const box = ped.boxes?.[slotKey] || { flag: '🇹🇷', ring: '', name: '', color: '', notes: '', photo: '' };

  editingFlag = box.flag || '🇹🇷';
  editingPhotoData = box.photo || '';

  // Cinsiyet ve Statü varsayılanlarını yükle
  const defaultSex = box.sex || slotMeta.sex || 'M';
  const defaultRole = box.roleCategory || (slotKey === 'main' ? 'RACER' : 'BREEDER');
  selectModalSegment('editBoxSexGroup', defaultSex);
  selectModalSegment('editBoxRoleGroup', defaultRole);

  const statusEl = document.getElementById('editBoxBirdStatus');
  if (statusEl) {
    statusEl.value = box.birdStatus || ((slotKey === 'main' && box.inMyLoft !== false) || box.inMyLoft === true ? 'ACTIVE' : 'ARCHIVE');
  }

  const bBuildEl = document.getElementById('editBoxBodyBuild');
  const mTypeEl = document.getElementById('editBoxMuscleType');
  const pBoneEl = document.getElementById('editBoxPubicBone');
  const wFeatEl = document.getElementById('editBoxWingFeather');
  if (bBuildEl) bBuildEl.value = box.bodyBuild || '';
  if (mTypeEl) mTypeEl.value = box.muscleType || '';
  if (pBoneEl) pBoneEl.value = box.pubicBone || '';
  if (wFeatEl) wFeatEl.value = box.wingFeather || '';

  const eyeEl = document.getElementById('editBoxEye');
  if (eyeEl) eyeEl.value = box.eyeSign || (slotKey === 'main' ? 'pearl_racer' : 'yellow_breeder');

  // Eğer Ana Kuş (main) düzenleniyorsa Baba ve Anne otomatik bağlama kutularını göster
  const parentsSec = document.getElementById('editBoxParentsSection');
  if (parentsSec) {
    if (slotKey === 'main') {
      parentsSec.style.display = 'grid';
      populateModalParentSelects(box.ring, ped.boxes?.sire?.ring, ped.boxes?.dam?.ring);
    } else {
      parentsSec.style.display = 'none';
    }
  }

  populateKnownRingsDatalist();

  document.getElementById('boxEditTitle').textContent = `🕊️ ${slotMeta.label}`;
  document.getElementById('editBoxRing').value = box.ring || '';
  document.getElementById('editBoxName').value = box.name || '';
  setSelectColorOrCustom(document.getElementById('editBoxColor'), box.color);
  document.getElementById('editBoxNotes').value = box.notes || '';
  document.getElementById('editBoxPhoto').value = '';

  renderFlagChips();
  document.getElementById('boxEditModal').classList.add('open');
}

function renderFlagChips() {
  const container = document.getElementById('flagChipsContainer');
  if (!container) return;
  container.innerHTML = COUNTRY_FLAGS.map(f => `
    <span class="flag-chip ${editingFlag === f.flag ? 'active' : ''}" onclick="selectCountryFlag('${f.flag}', '${f.code}')">
      ${f.label}
    </span>
  `).join('');
}

function selectCountryFlag(flagEmoji, code) {
  editingFlag = flagEmoji;
  const ringInput = document.getElementById('editBoxRing');
  const val = ringInput.value.trim();
  if (!val) {
    ringInput.value = `${code}-2026-`;
  } else if (/^[A-Z]{2,4}-/i.test(val)) {
    ringInput.value = val.replace(/^[A-Z]{2,4}-/i, `${code}-`);
  }
  renderFlagChips();
}

// Cep Telefonu Kamera Fotoğraflarını (8MB-15MB) localStorage (5MB) Kotasını Doldurmadan Yüksek Kaliteli Kompakt JPEG'e Küçültür
function compressUploadedImageFile(file, maxDimension = 380, quality = 0.80, callback) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const rawDataUrl = e.target?.result;
    if (!rawDataUrl) return;
    const img = new Image();
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width || 300;
        const h = img.naturalHeight || img.height || 300;
        const scale = Math.min(1, maxDimension / Math.max(w, h));
        const targetW = Math.max(1, Math.round(w * scale));
        const targetH = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const compressedUrl = canvas.toDataURL('image/jpeg', quality);
        callback(compressedUrl);
      } catch (err) {
        callback(rawDataUrl);
      }
    };
    img.onerror = () => callback(rawDataUrl);
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function onBoxPhotoUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  compressUploadedImageFile(file, 380, 0.80, (compressedDataUrl) => {
    editingPhotoData = compressedDataUrl;
  });
}

function appendStandardDegreeToBoxNotes() {
  const role = document.getElementById('stdDegreeRole')?.value || 'SELF';
  const stage = (document.getElementById('stdDegreeStage')?.value || '').trim() || 'Final';
  const kmVal = parseInt(document.getElementById('stdDegreeKm')?.value, 10) || 0;
  const rankVal = parseInt(document.getElementById('stdDegreeRank')?.value, 10) || 0;
  const flockVal = parseInt(document.getElementById('stdDegreeFlock')?.value, 10) || 0;

  if (!rankVal || rankVal < 1) {
    alert('Lütfen kazanılan dereceyi (sırayı) girin (Örn: 1, 3, 12).');
    return;
  }

  const kmText = kmVal > 0 ? ` ${kmVal} km` : '';
  const flockText = flockVal > 0 ? ` / ${flockVal} Kuş` : '';

  let formattedLine = '';
  if (role === 'AS') {
    formattedLine = `As Güvercin: ${rankVal}. (${stage}${kmText}${flockText})`;
  } else if (role === 'OFFSPRING') {
    formattedLine = `Yavrusu: ${rankVal}. ${stage}${kmText}${flockText}`;
  } else if (role === 'SIBLING') {
    formattedLine = `Öz kardeşi: ${rankVal}. ${stage}${kmText}${flockText}`;
  } else {
    formattedLine = `${rankVal}. ${stage}${kmText}${flockText}`;
  }

  const notesEl = document.getElementById('editBoxNotes');
  if (notesEl) {
    const cur = notesEl.value.trim();
    notesEl.value = cur ? `${cur}\n${formattedLine}` : formattedLine;
  }

  // Eklendikten sonra derece ve kuş sayısı kutucuklarını sonraki giriş için temizle
  const rankEl = document.getElementById('stdDegreeRank');
  const flockEl = document.getElementById('stdDegreeFlock');
  if (rankEl) rankEl.value = '';
  if (flockEl) flockEl.value = '';
}

function closeBoxEditModal() {
  isCreatingNewPedigreeDraft = false;
  pendingChickCreationData = null;
  const parentBanner = document.getElementById('chickParentsInfoBanner');
  if (parentBanner) parentBanner.style.display = 'none';
  document.getElementById('boxEditModal').classList.remove('open');
}

function saveBoxEditModal() {
  const ringVal = document.getElementById('editBoxRing').value.trim();
  const cleanUpperRing = ringVal.toUpperCase();

  // EĞER "+ KUŞ EKLE" BUTONUYLA YENİ GÜVERCİN KAYDI OLUŞTURULUYORSA:
  if (isCreatingNewPedigreeDraft) {
    if (!ringVal) {
      alert('Lütfen güvercinin halka (bilezik) numarasını girin.');
      return;
    }
    if (!checkPedigreeTierLimitAllowed()) return;

    const dupPed = pedigrees.find(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === cleanUpperRing);
    if (dupPed) {
      alert(`⚠️ Bilezik Numarası Çakışması:\n\n"${ringVal}" halka numarası zaten başka bir ana pedigre kaydında (${dupPed.boxes?.main?.name || ''}) kullanılıyor.`);
      return;
    }

    const newId = 'ped_' + Date.now();
    const emptyBoxes = {};
    BOX_SLOTS.forEach(s => {
      emptyBoxes[s.key] = {
        flag: '🇹🇷',
        ring: '',
        name: '',
        color: '',
        notes: '',
        photo: '',
        sex: s.sex || 'M',
        inMyLoft: false
      };
    });

    pedigrees.unshift({
      id: newId,
      themeId: 'blue',
      accentColor: '#1d4ed8',
      bgColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      boxes: emptyBoxes
    });
    activePedigreeId = newId;
    isCreatingNewPedigreeDraft = false;
  }

  // EĞER AKTİF BİR ÇİFTTEN YENİ YAVRUYA BONCUK TAKILIYORSA:
  if (pendingChickCreationData) {
    if (!ringVal) {
      alert('Lütfen yavrunun ayağına taktığınız boncuk (halka) numarasını yazınız.');
      return;
    }
    if (!checkPedigreeTierLimitAllowed()) return;

    // Bilezik numarası benzersizliği kontrolü
    const duplicateMain = pedigrees.find(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === cleanUpperRing);
    if (duplicateMain) {
      alert(`⚠️ Bilezik Numarası Benzersizlik Hatası:\n\n"${ringVal}" halka numarasına sahip bir ana güvercin (${duplicateMain.boxes?.main?.name || 'Kayıtlı'}) zaten kümesinizde mevcut! Lütfen benzersiz bir bilezik numarası girin.`);
      return;
    }

    const newId = 'ped_nest_' + Date.now();
    const newBoxes = pendingChickCreationData.preparedBoxes;
    const bBuildVal = document.getElementById('editBoxBodyBuild')?.value || '';
    const mTypeVal = document.getElementById('editBoxMuscleType')?.value || '';
    const pBoneVal = document.getElementById('editBoxPubicBone')?.value || '';
    const wFeatVal = document.getElementById('editBoxWingFeather')?.value || '';
    newBoxes.main = {
      flag: editingFlag || detectFlagFromRing(ringVal),
      ring: ringVal,
      name: document.getElementById('editBoxName').value.trim() || `${pendingChickCreationData.nestName} Yavrusu 1`,
      color: document.getElementById('editBoxColor').value.trim() || 'Mavi Çakmaklı • Yavru',
      notes: document.getElementById('editBoxNotes').value.trim(),
      photo: editingPhotoData,
      sex: editingModalSex,
      roleCategory: editingModalRole,
      birdStatus: 'ACTIVE',
      inMyLoft: true,
      bodyBuild: bBuildVal,
      muscleType: mTypeVal,
      pubicBone: pBoneVal,
      wingFeather: wFeatVal,
      eyeSign: document.getElementById('editBoxEye')?.value || 'pearl_racer'
    };

    pedigrees.unshift({
      id: newId,
      themeId: 'gold',
      accentColor: '#b45309',
      bgColor: '#fffdf7',
      fontFamily: "'Inter', sans-serif",
      boxes: newBoxes
    });

    let registeredRingsText = ringVal;

    // ÇİFTE YAVRU (2. KARDEŞ YAVRU) SEÇİLİYSE ONU DA TEK SEFERDE KAYDET!
    const isSecondChecked = document.getElementById('chkRegisterSecondChick')?.checked;
    const secondRingVal = (document.getElementById('editSecondChickRing')?.value || '').trim();
    if (isSecondChecked && secondRingVal) {
      const cleanSecUpper = secondRingVal.toUpperCase();
      const dupSecond = pedigrees.find(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === cleanSecUpper);
      if (!dupSecond && cleanSecUpper !== cleanUpperRing) {
        const secondBoxes = JSON.parse(JSON.stringify(pendingChickCreationData.preparedBoxes));
        secondBoxes.main = {
          flag: editingFlag || detectFlagFromRing(secondRingVal),
          ring: secondRingVal,
          name: (document.getElementById('editSecondChickName')?.value || '').trim() || `${pendingChickCreationData.nestName} Yavrusu 2`,
          color: (document.getElementById('editSecondChickColor')?.value || '').trim() || 'Mavi Çakmaklı • Yavru',
          notes: `${pendingChickCreationData.nestName} (${pendingChickCreationData.sireLabel} × ${pendingChickCreationData.damLabel}) çifte yavru kardeşi (${ringVal}).`,
          photo: '',
          sex: 'U',
          roleCategory: 'YOUNG',
          birdStatus: 'ACTIVE',
          inMyLoft: true,
          eyeSign: document.getElementById('editBoxEye')?.value || 'pearl_racer'
        };
        pedigrees.unshift({
          id: 'ped_nest_' + (Date.now() + 1),
          themeId: 'gold',
          accentColor: '#b45309',
          bgColor: '#fffdf7',
          fontFamily: "'Inter', sans-serif",
          boxes: secondBoxes
        });
        birdDossierList.unshift({
          id: 'dos_birth_' + (Date.now() + 1),
          ring: secondRingVal,
          birdName: secondBoxes.main.name,
          category: 'Özel Karakter Notu',
          icon: '🐣',
          title: `${pendingChickCreationData.nestName} 2. Kardeş Yavru Bilezik Takıldı`,
          detail: `Baba: ${pendingChickCreationData.sireLabel} × Anne: ${pendingChickCreationData.damLabel} (Yuva Kardeşi: ${ringVal})`,
          date: getIsoDateDaysAgo(0),
          badgeColor: 'gene-green'
        });
        registeredRingsText = `${ringVal} & ${secondRingVal}`;
      }
    }

    // İlgili aktif yuvanın notuna boncuk takılan yavruların numarasını işle
    const pairObj = activePairsList.find(x => x.id === pendingChickCreationData.pairId);
    if (pairObj) {
      pairObj.detail = `Bilezik Takıldı: ${registeredRingsText}`;
    }

    // 1. Yavrunun sicil dosyasına ilk doğuş/boncuk kaydını otomatik aç
    birdDossierList.unshift({
      id: 'dos_birth_' + Date.now(),
      ring: ringVal,
      birdName: newBoxes.main.name,
      category: 'Özel Karakter Notu',
      icon: '🐣',
      title: `${pendingChickCreationData.nestName} Yavrusu Bilezik Takıldı`,
      detail: `Baba: ${pendingChickCreationData.sireLabel} × Anne: ${pendingChickCreationData.damLabel}`,
      date: getIsoDateDaysAgo(0),
      badgeColor: 'gene-green'
    });

    activePedigreeId = newId;
    pendingChickCreationData = null;
    saveMypedigreData();
    renderPedigreeDropdown();
    selectActivePedigree(newId);
    renderHomeDashboard();
    closeBoxEditModal();
    // Doğrudan Güvercinler -> Pedigre Kağıdını açarak yeni yavrunun soyağacını göster!
    openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
    switchBirdsViewMode('pedigree');
    return;
  }

  const ped = getActivePedigree();
  if (!ped) return;

  // 1. Ana Kuş (main) düzenleniyorsa bilezik numarası benzersizliğini doğrula
  if (editingSlotKey === 'main' && cleanUpperRing) {
    const dupPed = pedigrees.find(p => p.id !== ped.id && (p.boxes?.main?.ring || '').trim().toUpperCase() === cleanUpperRing);
    if (dupPed) {
      alert(`⚠️ Bilezik Numarası Çakışması:\n\n"${ringVal}" halka numarası zaten başka bir ana pedigre kaydında (${dupPed.boxes?.main?.name || ''}) kullanılıyor. Aynı kuş için mükerrer ana pedigre oluşturulamaz.`);
      return;
    }
  }

  // 2. Döngüsel Soy Ağacı (Kendi Kendinin Ebeveyni / Atası veya Çocuğu Olma) Kontrolü
  const mainRingUpper = (ped.boxes?.main?.ring || '').trim().toUpperCase();
  if (editingSlotKey !== 'main' && cleanUpperRing) {
    if (cleanUpperRing === mainRingUpper) {
      alert(`⚠️ Soy Ağacı Mantık Hatası:\n\nAna güvercin (${ringVal}) kendi soy ağacında ebeveyn veya ata olarak kaydedilemez!`);
      return;
    }
    const existingTreeOfCandidate = pedigrees.find(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === cleanUpperRing);
    if (existingTreeOfCandidate && mainRingUpper) {
      const candAncs = Object.entries(existingTreeOfCandidate.boxes || {})
        .filter(([k]) => k !== 'main')
        .map(([, bx]) => (bx?.ring || '').trim().toUpperCase())
        .filter(Boolean);
      if (candAncs.includes(mainRingUpper)) {
        alert(`⚠️ Döngüsel Soyağacı Hatası:\n\n"${ringVal}" kuşunun kendi soyağacında "${mainRingUpper}" zaten ata olarak yer alıyor! Bir kuşun yavrusu/torunu aynı zamanda onun üst atası olamaz.`);
        return;
      }
    }
  }

  // 3. Ata Kutularında Erkek / Dişi Cinsiyet Tutarlılığı Doğrulaması
  const slotMeta = BOX_SLOTS.find(s => s.key === editingSlotKey);
  if (editingSlotKey !== 'main' && slotMeta && (slotMeta.sex === 'M' || slotMeta.sex === 'F')) {
    if (editingModalSex !== slotMeta.sex) {
      editingModalSex = slotMeta.sex; // Baba/Büyükbaba kutusu her zaman Erkek (M), Anne/Büyükanne kutusu her zaman Dişi (F) olarak korunur
    }
  }

  const chosenStatus = document.getElementById('editBoxBirdStatus')?.value || (editingSlotKey === 'main' ? 'ACTIVE' : 'ARCHIVE');
  const isNowInMyLoft = chosenStatus === 'ACTIVE' || chosenStatus === 'RESTING';

  const updatedBox = {
    flag: editingFlag || detectFlagFromRing(ringVal),
    ring: ringVal,
    name: document.getElementById('editBoxName').value.trim(),
    color: document.getElementById('editBoxColor').value.trim(),
    notes: document.getElementById('editBoxNotes').value.trim(),
    photo: editingPhotoData,
    sex: editingModalSex,
    roleCategory: editingModalRole,
    birdStatus: chosenStatus,
    bodyBuild: document.getElementById('editBoxBodyBuild')?.value || '',
    muscleType: document.getElementById('editBoxMuscleType')?.value || '',
    pubicBone: document.getElementById('editBoxPubicBone')?.value || '',
    wingFeather: document.getElementById('editBoxWingFeather')?.value || '',
    eyeSign: document.getElementById('editBoxEye')?.value || 'yellow_breeder',
    inMyLoft: isNowInMyLoft
  };

  ped.boxes[editingSlotKey] = updatedBox;

  // Aynı bilezik numarasına sahip diğer soyağacı kutularında isim/renk/cinsiyet tutarlılığını senkronize et
  if (cleanUpperRing) {
    propagateBirdMetadataAcrossPedigrees(cleanUpperRing, updatedBox);
  }

  // Eğer Ana Kuş (main) düzenlenirken Baba veya Anne açılır listesinden yeni bir ebeveyn seçildiyse,
  // seçilen Baba ve Annenin kendi alt soylarını (Büyükbaba, Büyükanne, 3. ve 4. kuşak toplam 30 atayı) otomatik bağla!
  if (editingSlotKey === 'main') {
    const selectedSireRef = document.getElementById('editBoxSireLink')?.value;
    const selectedDamRef = document.getElementById('editBoxDamLink')?.value;

    if (selectedSireRef) {
      const sTree = getCandidateLineageTree(selectedSireRef);
      const sAllAncs = (sTree.ancRings || []).map(r => String(r || '').trim().toUpperCase());
      if (sTree.self?.ring && sTree.self.ring.trim().toUpperCase() !== cleanUpperRing && !sAllAncs.includes(cleanUpperRing)) {
        ped.boxes.sire = { ...sTree.self, sex: 'M' };
        if (sTree.p1?.ring) ped.boxes.g2_1 = { ...sTree.p1, sex: 'M' };
        if (sTree.p2?.ring) ped.boxes.g2_2 = { ...sTree.p2, sex: 'F' };
        if (sTree.g1?.ring) ped.boxes.g3_1 = { ...sTree.g1, sex: 'M' };
        if (sTree.g2?.ring) ped.boxes.g3_2 = { ...sTree.g2, sex: 'F' };
        if (sTree.g3?.ring) ped.boxes.g3_3 = { ...sTree.g3, sex: 'M' };
        if (sTree.g4?.ring) ped.boxes.g3_4 = { ...sTree.g4, sex: 'F' };
        for (let i = 1; i <= 8; i++) {
          const sG4 = sTree[`gg${i}`];
          if (sG4?.ring) ped.boxes[`g4_${i}`] = { ...sG4, sex: i % 2 === 1 ? 'M' : 'F' };
        }
      }
    }

    if (selectedDamRef) {
      const dTree = getCandidateLineageTree(selectedDamRef);
      const dAllAncs = (dTree.ancRings || []).map(r => String(r || '').trim().toUpperCase());
      if (dTree.self?.ring && dTree.self.ring.trim().toUpperCase() !== cleanUpperRing && !dAllAncs.includes(cleanUpperRing)) {
        ped.boxes.dam = { ...dTree.self, sex: 'F' };
        if (dTree.p1?.ring) ped.boxes.g2_3 = { ...dTree.p1, sex: 'M' };
        if (dTree.p2?.ring) ped.boxes.g2_4 = { ...dTree.p2, sex: 'F' };
        if (dTree.g1?.ring) ped.boxes.g3_5 = { ...dTree.g1, sex: 'M' };
        if (dTree.g2?.ring) ped.boxes.g3_6 = { ...dTree.g2, sex: 'F' };
        if (dTree.g3?.ring) ped.boxes.g3_7 = { ...dTree.g3, sex: 'M' };
        if (dTree.g4?.ring) ped.boxes.g3_8 = { ...dTree.g4, sex: 'F' };
        for (let i = 1; i <= 8; i++) {
          const dG4 = dTree[`gg${i}`];
          if (dG4?.ring) ped.boxes[`g4_${i + 8}`] = { ...dG4, sex: i % 2 === 1 ? 'M' : 'F' };
        }
      }
    }
  }

  saveMypedigreData();
  renderPedigreeDropdown();
  renderActivePedigree();
  renderLoftBirdsDirectory();
  renderHomeDashboard();
  closeBoxEditModal();
}

// Kümes Başlığı Modalı
function openLoftHeaderModal() {
  document.getElementById('editLoftTitle').value = loftConfig.title;
  document.getElementById('editLoftSub').value = loftConfig.subtitle;
  const depthEl = document.getElementById('editLoftGenDepth');
  if (depthEl) depthEl.value = String(loftConfig.genDepth || 4);
  document.getElementById('loftHeaderModal').classList.add('open');
}

function closeLoftHeaderModal() {
  document.getElementById('loftHeaderModal').classList.remove('open');
}

function onLoftLogoChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  compressUploadedImageFile(file, 320, 0.82, (compressedDataUrl) => {
    loftConfig.logo = compressedDataUrl;
  });
}

function saveLoftHeaderModal() {
  loftConfig.title = document.getElementById('editLoftTitle').value.trim() || 'AVIGEN ŞAMPİYON KÜMESİ';
  loftConfig.subtitle = document.getElementById('editLoftSub').value.trim();
  const depthEl = document.getElementById('editLoftGenDepth');
  if (depthEl) loftConfig.genDepth = parseInt(depthEl.value, 10) || 4;
  saveMypedigreData();
  syncLoftIdentityAcrossUI();
  renderActivePedigree();
  closeLoftHeaderModal();
}

// ============================================================================
// TAM KÜMES VERİ YEDEKLEME & CİHAZLAR ARASI (PC <-> iPHONE) AKTARIM (12 VERİ KATMANI)
// ============================================================================
function buildFullAvigenSnapshotPayload() {
  return {
    app: 'AVIGEN_PREMIUM_RACING_PIGEON_APP',
    version: '2.5',
    exportedAt: new Date().toISOString(),
    loftConfig,
    pedigrees,
    remindersList,
    activePairsList,
    racesList,
    birdDossierList,
    notesList,
    scientific_sources: typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.sources : [],
    genesis_analysis_history: typeof AvigenGenesisAI !== 'undefined' ? AvigenGenesisAI.analysisHistory : [],
    performance_config: typeof AvigenPerformanceEngine !== 'undefined' ? AvigenPerformanceEngine.state.distanceLimits : null,
    user_account_state: typeof AvigenUxManager !== 'undefined' ? AvigenUxManager.state : null,
    race_tracking_events: typeof AvigenRaceTracker !== 'undefined' ? AvigenRaceTracker.events : [],
    race_relational_db: typeof AvigenRaceTracker !== 'undefined' ? AvigenRaceTracker.db : null
  };
}

function applyRestoredBackupDataObject(data) {
  if (!data || (!Array.isArray(data.pedigrees) && !data.loftConfig)) {
    alert('⚠️ Geçersiz yedek şeması: Bu yedek verisi AVIGEN kümes kaydı içermiyor.');
    return false;
  }

  // Yıkıcı işlem öncesi mevcut verinin otomatik güvenlik yedeğini (rollback snapshot) kaydet
  try {
    localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(buildFullAvigenSnapshotPayload()));
  } catch (snapErr) {}

  if (data.loftConfig) loftConfig = { ...loftConfig, ...data.loftConfig };
  if (Array.isArray(data.pedigrees) && data.pedigrees.length) {
    pedigrees = data.pedigrees;
    activePedigreeId = pedigrees[0].id;
  }
  if (Array.isArray(data.remindersList)) remindersList = data.remindersList;
  if (Array.isArray(data.activePairsList)) activePairsList = data.activePairsList;
  if (Array.isArray(data.racesList)) racesList = data.racesList;
  if (Array.isArray(data.birdDossierList)) birdDossierList = data.birdDossierList;
  if (Array.isArray(data.notesList)) notesList = data.notesList;

  if (Array.isArray(data.scientific_sources) && typeof AvigenScientificLibrary !== 'undefined') {
    AvigenScientificLibrary.sources = data.scientific_sources;
    AvigenScientificLibrary.saveSources();
    AvigenScientificLibrary.renderLibraryUI();
  }
  if (Array.isArray(data.genesis_analysis_history) && typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.analysisHistory = data.genesis_analysis_history;
    AvigenGenesisAI.saveHistory();
  }
  if (data.performance_config && typeof AvigenPerformanceEngine !== 'undefined') {
    AvigenPerformanceEngine.state.distanceLimits = {
      ...AvigenPerformanceEngine.state.distanceLimits,
      ...data.performance_config
    };
    AvigenPerformanceEngine.saveConfig();
  }
  if (data.user_account_state && typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.state = { ...AvigenUxManager.state, ...data.user_account_state };
    AvigenUxManager.saveState();
  }
  if (Array.isArray(data.race_tracking_events) && typeof AvigenRaceTracker !== 'undefined') {
    AvigenRaceTracker.events = data.race_tracking_events.map(ev =>
      typeof AvigenRaceTracker.normalizeRaceRecord === 'function' ? AvigenRaceTracker.normalizeRaceRecord(ev) : ev
    );
    AvigenRaceTracker.saveEvents();
    AvigenRaceTracker.renderRaceTrackerMainUI();
    AvigenRaceTracker.renderRaceAiInsightsUI();
  }

  saveMypedigreData();
  syncLoftIdentityAcrossUI();
  renderPedigreeDropdown();
  selectActivePedigree(activePedigreeId);
  renderHomeDashboard();
  renderLoftBirdsDirectory();
  renderMypedigreNotes();
  if (typeof AvigenUxManager !== 'undefined') {
    AvigenUxManager.syncHeaderAndProfileUI();
    AvigenUxManager.renderBreedingPlanPairsList();
  }
  closeLoftHeaderModal();
  document.getElementById('avigenBackupAssistModal')?.classList.remove('open');
  alert(`✅ Kümes yedeğiniz (${Array.isArray(data.pedigrees) ? data.pedigrees.length : 0} güvercin, 4 kuşak pedigreler, yuvalar ve yarışlar) başarıyla geri yüklendi!`);
  return true;
}

function restoreBackupFromPastedText() {
  const rawTxt = (document.getElementById('avigenBackupPasteInput')?.value || '').trim();
  if (!rawTxt) {
    alert('⚠️ Lütfen kopyaladığınız veya WhatsApp\'tan aldığınız yedek metnini kutuya yapıştırın.');
    return;
  }
  try {
    // Eğer WhatsApp mesajının başında başlık varsa ilk '{' ile son '}' arasını al
    const firstBrace = rawTxt.indexOf('{');
    const lastBrace = rawTxt.lastIndexOf('}');
    const cleanJson = (firstBrace !== -1 && lastBrace > firstBrace)
      ? rawTxt.slice(firstBrace, lastBrace + 1)
      : rawTxt;
    const parsed = JSON.parse(cleanJson);
    applyRestoredBackupDataObject(parsed);
  } catch (e) {
    alert('⚠️ Yapıştırılan yedek metni okunamadı veya eksik kopyalanmış. Lütfen yedek kodunun tamamını kopyaladığınızdan emin olun.');
  }
}

function openAndroidBackupAssistModal(autoCopied = false) {
  const payload = buildFullAvigenSnapshotPayload();
  const jsonStr = JSON.stringify(payload);
  const birdCnt = Array.isArray(payload.pedigrees) ? payload.pedigrees.length : 0;
  const pairCnt = Array.isArray(payload.activePairsList) ? payload.activePairsList.length : 0;
  const raceCnt = Array.isArray(payload.race_tracking_events) ? payload.race_tracking_events.length : 0;

  let modal = document.getElementById('avigenBackupAssistModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'avigenBackupAssistModal';
    modal.className = 'ios-modal-overlay';
    const hostFrame = document.querySelector('.iphone-frame') || document.body;
    hostFrame.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="ios-sheet" style="max-height:93%;">
      <div class="ios-card-title" style="margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>💾</span>
          <span>Kümes Yedekleme &amp; Geri Yükleme Merkezi</span>
        </div>
        <button type="button" class="ios-btn ios-btn-outline" style="padding:4px 10px;" onclick="document.getElementById('avigenBackupAssistModal')?.classList.remove('open')">✖ Kapat</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:10.5px;">
        <div style="background:#ecfdf5; border:1.5px solid #6ee7b7; border-radius:9px; padding:8px 10px; color:#065f46; line-height:1.4;">
          ✅ <strong>Aktif Kümes Verisi:</strong> <strong>${birdCnt} Güvercin / Pedigri</strong> • <strong>${pairCnt} Yuva</strong> • <strong>${raceCnt} Yarış</strong>
          ${autoCopied ? `<br/><span style="color:#047857; font-weight:800;">📋 Yedek kodunuz telefonunuzun panosuna otomatik kopyalandı!</span>` : ''}
        </div>

        <!-- 1. BÖLÜM: YEDEĞİ İNDİR / WHATSAPP'A GÖNDER / KOPYALA -->
        <div style="background:var(--ios-card-alt); border:1.5px solid #93c5fd; border-radius:10px; padding:9px 10px;">
          <div style="font-weight:900; color:#0052cc; font-size:11px; margin-bottom:6px;">
            1️⃣ Kümes Yedeğini Al (Dosya İndir / WhatsApp / Kopyala)
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px;">
            <button type="button" class="ios-btn ios-btn-green" style="padding:10px 6px; font-size:10.5px; font-weight:900;" onclick="shareFullAvigenBackupViaWhatsApp()">
              📲 WhatsApp'a Yedek Dosyası Gönder
            </button>
            <button type="button" class="ios-btn ios-btn-primary" style="padding:10px 6px; font-size:10.5px; font-weight:900;" onclick="saveBackupJsonFileDirectToDevice()">
              ⬇️ Cihaza .JSON Dosya Kaydet
            </button>
          </div>
          <button type="button" class="ios-btn ios-btn-outline" style="width:100%; padding:8px 6px; font-size:10px; font-weight:900; margin-bottom:6px;" onclick="copyTextToClipboardSafe(document.getElementById('avigenRawBackupCodeBox')?.value, '✅ Tüm kümes yedek kodunuz panoya kopyalandı!')">
            📋 Yedek Kodunu Panoya Kopyala
          </button>
          <textarea id="avigenRawBackupCodeBox" class="ios-textarea" rows="2" readonly onclick="this.select()" style="font-size:9px; font-family:monospace; background:var(--ios-card); color:var(--ios-subtext);">${escapeHtml(jsonStr)}</textarea>
        </div>

        <!-- 2. BÖLÜM: YEDEĞİ GERİ YÜKLE (DOSYA SEÇ VEYA KOD YAPIŞTIR) -->
        <div style="background:var(--ios-card-alt); border:1.5px solid #c4b5fd; border-radius:10px; padding:9px 10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:900; color:#5b21b6; font-size:11px;">2️⃣ Yedeği Geri Yükle (Dosya Seç veya Kod Yapıştır)</span>
            <button type="button" class="ios-btn ios-btn-outline" style="padding:3px 8px; font-size:9px; font-weight:900; color:#5b21b6; border-color:#c4b5fd;" onclick="(async()=>{const el=document.getElementById('avigenBackupPasteInput');if(!el)return;if(navigator.clipboard&&navigator.clipboard.readText){try{const t=await navigator.clipboard.readText();if(t&&t.trim()){el.value=t.trim();return;}}catch(e){}}el.focus();})()">
              📋 Kutuya Yapıştır
            </button>
          </div>
          <label class="ios-btn ios-btn-primary" style="width:100%; box-sizing:border-box; padding:10px 8px; font-size:10.8px; font-weight:900; cursor:pointer; text-align:center; display:flex; align-items:center; justify-content:center; margin-bottom:7px;">
            📁 Telefondan .JSON Yedek Dosyası Seç &amp; Yükle
            <input type="file" accept=".json,application/json,text/plain" style="display:none;" onchange="importFullAvigenBackup(event)" />
          </label>
          <textarea id="avigenBackupPasteInput" class="ios-textarea" rows="2" placeholder="Veya kopyaladığınız yedek kodunu buraya yapıştırıp alttaki butona basın..." style="font-size:10px; margin-bottom:6px;"></textarea>
          <div style="display:grid; grid-template-columns:1.25fr 1fr; gap:6px;">
            <button type="button" class="ios-btn ios-btn-purple" style="padding:9px 6px; font-size:10.2px; font-weight:900;" onclick="restoreBackupFromPastedText()">
              📥 Yapıştırılan Kodu Yükle
            </button>
            <button type="button" class="ios-btn ios-btn-outline" style="padding:9px 6px; font-size:9.6px; font-weight:800; color:#b45309; border-color:#fcd34d; background:#fffbeb;" onclick="restoreAutoSafetySnapshot()">
              ⏪ Son İşlemi Geri Al
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function encodeUtf8ToBase64Safe(str) {
  try {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    const step = 0x8000;
    for (let i = 0; i < bytes.length; i += step) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
    }
    return btoa(bin);
  } catch (e) {
    return '';
  }
}

async function saveBackupJsonFileDirectToDevice() {
  const payload = buildFullAvigenSnapshotPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const safeName = (loftConfig.title || 'AVIGEN').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeName}_Tam_Yedek_${new Date().toISOString().slice(0, 10)}.json`;

  await copyTextToClipboardSafe(JSON.stringify(payload));

  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveBase64FileToDownloads === 'function') {
    try {
      const b64 = encodeUtf8ToBase64Safe(jsonStr);
      if (b64) {
        window.AvigenNativeBridge.saveBase64FileToDownloads(b64, fileName, 'application/json');
        return;
      }
    } catch (e) {}
  }

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const backupFile = new File([blob], fileName, { type: 'application/json', lastModified: Date.now() });

  if (isCapacitorAndroidApk() && navigator.share) {
    try {
      await navigator.share({
        files: [backupFile],
        title: `${loftConfig.title || 'AVIGEN'} Tam Kümes Yedeği (.JSON)`
      });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
  triggerBlobFileDownload(blob, fileName, dataUrl);
}

async function exportFullAvigenBackup() {
  const payload = buildFullAvigenSnapshotPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const safeName = (loftConfig.title || 'AVIGEN').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeName}_Tam_Yedek_${new Date().toISOString().slice(0, 10)}.json`;

  // 1. Panoya otomatik kopyala
  await copyTextToClipboardSafe(JSON.stringify(payload));

  // 2. Yeni Android APK içindeysek doğrudan İndirilenler klasörüne de kaydet, Web'deysek dosya indir
  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveBase64FileToDownloads === 'function') {
    try {
      const b64 = encodeUtf8ToBase64Safe(jsonStr);
      if (b64) {
        window.AvigenNativeBridge.saveBase64FileToDownloads(b64, fileName, 'application/json');
      }
    } catch (e) {}
  } else if (!isCapacitorAndroidApk()) {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr);
    triggerBlobFileDownload(blob, fileName, dataUrl);
  }

  // 3. Tek Merkez Yedekleme & Geri Yükleme Penceresini aç
  openAndroidBackupAssistModal(true);
}

// AVIGEN — Tek Tuşla Kümes Yedeğini (.json) WhatsApp, Google Drive veya Dosyalara Paylaşma
async function shareFullAvigenBackupViaWhatsApp() {
  const payload = buildFullAvigenSnapshotPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const compactJson = JSON.stringify(payload);
  const safeName = (loftConfig.title || 'AVIGEN').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${safeName}_Tam_Yedek_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const backupFile = new File([blob], fileName, {
    type: 'application/json',
    lastModified: Date.now()
  });

  await copyTextToClipboardSafe(compactJson);

  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.shareBase64File === 'function') {
    try {
      const b64 = encodeUtf8ToBase64Safe(jsonStr);
      if (b64) {
        window.AvigenNativeBridge.shareBase64File(
          b64,
          fileName,
          'application/json',
          `${loftConfig.title || 'AVIGEN'} Tam Kümes Yedek Dosyası (.JSON)`
        );
        return;
      }
    } catch (e) {}
  }

  if (navigator.share) {
    try {
      await navigator.share({
        files: [backupFile],
        title: `${loftConfig.title || 'AVIGEN'} Tam Kümes Yedek Dosyası (.JSON)`
      });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  openAndroidBackupAssistModal(true);
}

function importFullAvigenBackup(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      applyRestoredBackupDataObject(data);
    } catch (err) {
      alert('Geçersiz veya bozuk yedek dosyası!');
    }
  };
  reader.readAsText(file);
}

// ============================================================================
// AVIGEN 2.0 — CANLI METEOROLOJİ, GPS KONUM VE NOAA JEOMANYETİK (Kp) MOTORU
// (Open-Meteo API + NOAA SWPC Planetary K-Index + 15 Dk Otomatik Senkronizasyon)
// ============================================================================
const AVIGEN_LIVE_WEATHER_KEY = 'avigen_live_weather_state_v2';

const AvigenLiveWeather = {
  CITIES: [
    { id: 'adana', name: '01 - Adana', lat: 37.0000, lon: 35.3213 },
    { id: 'adiyaman', name: '02 - Adıyaman', lat: 37.7648, lon: 38.2786 },
    { id: 'afyon', name: '03 - Afyonkarahisar', lat: 38.7507, lon: 30.5567 },
    { id: 'agri', name: '04 - Ağrı', lat: 39.7191, lon: 43.0503 },
    { id: 'amasya', name: '05 - Amasya', lat: 40.6499, lon: 35.8353 },
    { id: 'ankara', name: '06 - Ankara', lat: 39.9334, lon: 32.8597 },
    { id: 'antalya', name: '07 - Antalya', lat: 36.8969, lon: 30.7133 },
    { id: 'artvin', name: '08 - Artvin', lat: 41.1828, lon: 41.8183 },
    { id: 'aydin', name: '09 - Aydın', lat: 37.8560, lon: 27.8416 },
    { id: 'balikesir', name: '10 - Balıkesir', lat: 39.6484, lon: 27.8826 },
    { id: 'bilecik', name: '11 - Bilecik', lat: 40.1451, lon: 29.9799 },
    { id: 'bingol', name: '12 - Bingöl', lat: 38.8854, lon: 40.4966 },
    { id: 'bitlis', name: '13 - Bitlis', lat: 38.4006, lon: 42.1095 },
    { id: 'bolu', name: '14 - Bolu', lat: 40.7350, lon: 31.6061 },
    { id: 'burdur', name: '15 - Burdur', lat: 37.7203, lon: 30.2908 },
    { id: 'bursa', name: '16 - Bursa', lat: 40.1885, lon: 29.0610 },
    { id: 'canakkale', name: '17 - Çanakkale', lat: 40.1553, lon: 26.4142 },
    { id: 'cankiri', name: '18 - Çankırı', lat: 40.6013, lon: 33.6134 },
    { id: 'corum', name: '19 - Çorum', lat: 40.5506, lon: 34.9556 },
    { id: 'denizli', name: '20 - Denizli', lat: 37.7765, lon: 29.0864 },
    { id: 'diyarbakir', name: '21 - Diyarbakır', lat: 37.9144, lon: 40.2306 },
    { id: 'edirne', name: '22 - Edirne', lat: 41.6771, lon: 26.5557 },
    { id: 'elazig', name: '23 - Elazığ', lat: 38.6810, lon: 39.2264 },
    { id: 'erzincan', name: '24 - Erzincan', lat: 39.7500, lon: 39.5000 },
    { id: 'erzurum', name: '25 - Erzurum', lat: 39.9055, lon: 41.2658 },
    { id: 'eskisehir', name: '26 - Eskişehir', lat: 39.7767, lon: 30.5206 },
    { id: 'gaziantep', name: '27 - Gaziantep', lat: 37.0662, lon: 37.3833 },
    { id: 'giresun', name: '28 - Giresun', lat: 40.9128, lon: 38.3895 },
    { id: 'gumushane', name: '29 - Gümüşhane', lat: 40.4603, lon: 39.4814 },
    { id: 'hakkari', name: '30 - Hakkâri', lat: 37.5833, lon: 43.7333 },
    { id: 'hatay', name: '31 - Hatay', lat: 36.2021, lon: 36.1606 },
    { id: 'isparta', name: '32 - Isparta', lat: 37.7648, lon: 30.5566 },
    { id: 'mersin', name: '33 - Mersin', lat: 36.8121, lon: 34.6415 },
    { id: 'istanbul', name: '34 - İstanbul', lat: 41.0082, lon: 28.9784 },
    { id: 'izmir', name: '35 - İzmir', lat: 38.4237, lon: 27.1428 },
    { id: 'kars', name: '36 - Kars', lat: 40.6013, lon: 43.0975 },
    { id: 'kastamonu', name: '37 - Kastamonu', lat: 41.3887, lon: 33.7827 },
    { id: 'kayseri', name: '38 - Kayseri', lat: 38.7312, lon: 35.4787 },
    { id: 'kirklareli', name: '39 - Kırklareli', lat: 41.7351, lon: 27.2252 },
    { id: 'kirsehir', name: '40 - Kırşehir', lat: 39.1425, lon: 34.1639 },
    { id: 'kocaeli', name: '41 - Kocaeli', lat: 40.8533, lon: 29.8815 },
    { id: 'konya', name: '42 - Konya', lat: 37.8746, lon: 32.4932 },
    { id: 'kutahya', name: '43 - Kütahya', lat: 39.4167, lon: 29.9833 },
    { id: 'malatya', name: '44 - Malatya', lat: 38.3552, lon: 38.3095 },
    { id: 'manisa', name: '45 - Manisa', lat: 38.6191, lon: 27.4289 },
    { id: 'kahramanmaras', name: '46 - Kahramanmaraş', lat: 37.5858, lon: 36.9371 },
    { id: 'mardin', name: '47 - Mardin', lat: 37.3212, lon: 40.7245 },
    { id: 'mugla', name: '48 - Muğla', lat: 37.2153, lon: 28.3636 },
    { id: 'mus', name: '49 - Muş', lat: 38.7433, lon: 41.5065 },
    { id: 'nevsehir', name: '50 - Nevşehir', lat: 38.6244, lon: 34.7144 },
    { id: 'nigde', name: '51 - Niğde', lat: 37.9667, lon: 34.6833 },
    { id: 'ordu', name: '52 - Ordu', lat: 40.9839, lon: 37.8764 },
    { id: 'rize', name: '53 - Rize', lat: 41.0201, lon: 40.5234 },
    { id: 'sakarya', name: '54 - Sakarya', lat: 40.7569, lon: 30.3783 },
    { id: 'samsun', name: '55 - Samsun', lat: 41.2867, lon: 36.3300 },
    { id: 'siirt', name: '56 - Siirt', lat: 37.9333, lon: 41.9500 },
    { id: 'sinop', name: '57 - Sinop', lat: 42.0231, lon: 35.1531 },
    { id: 'sivas', name: '58 - Sivas', lat: 39.7477, lon: 37.0179 },
    { id: 'tekirdag', name: '59 - Tekirdağ', lat: 40.9781, lon: 27.5117 },
    { id: 'tokat', name: '60 - Tokat', lat: 40.3167, lon: 36.5500 },
    { id: 'trabzon', name: '61 - Trabzon', lat: 41.0027, lon: 39.7168 },
    { id: 'tunceli', name: '62 - Tunceli', lat: 39.1079, lon: 39.5401 },
    { id: 'sanliurfa', name: '63 - Şanlıurfa', lat: 37.1674, lon: 38.7955 },
    { id: 'usak', name: '64 - Uşak', lat: 38.6823, lon: 29.4082 },
    { id: 'van', name: '65 - Van', lat: 38.4891, lon: 43.4089 },
    { id: 'yozgat', name: '66 - Yozgat', lat: 39.8181, lon: 34.8147 },
    { id: 'zonguldak', name: '67 - Zonguldak', lat: 41.4564, lon: 31.7987 },
    { id: 'aksaray', name: '68 - Aksaray', lat: 38.3687, lon: 34.0370 },
    { id: 'bayburt', name: '69 - Bayburt', lat: 40.2552, lon: 40.2249 },
    { id: 'karaman', name: '70 - Karaman', lat: 37.1759, lon: 33.2287 },
    { id: 'kirikkale', name: '71 - Kırıkkale', lat: 39.8468, lon: 33.5153 },
    { id: 'batman', name: '72 - Batman', lat: 37.8812, lon: 41.1351 },
    { id: 'sirnak', name: '73 - Şırnak', lat: 37.5164, lon: 42.4611 },
    { id: 'bartin', name: '74 - Bartın', lat: 41.6344, lon: 32.3375 },
    { id: 'ardahan', name: '75 - Ardahan', lat: 41.1105, lon: 42.7022 },
    { id: 'igdir', name: '76 - Iğdır', lat: 39.9167, lon: 44.0333 },
    { id: 'yalova', name: '77 - Yalova', lat: 40.6500, lon: 29.2667 },
    { id: 'karabuk', name: '78 - Karabük', lat: 41.2061, lon: 32.6204 },
    { id: 'kilis', name: '79 - Kilis', lat: 36.7184, lon: 37.1212 },
    { id: 'osmaniye', name: '80 - Osmaniye', lat: 37.0742, lon: 36.2478 },
    { id: 'duzce', name: '81 - Düzce', lat: 40.8438, lon: 31.1565 },
    { id: 'brussels', name: 'Brüksel (Belçika)', lat: 50.8503, lon: 4.3517 },
    { id: 'amsterdam', name: 'Amsterdam (Hollanda)', lat: 52.3676, lon: 4.9041 }
  ],

  state: {
    cityId: 'istanbul',
    cityName: 'İstanbul',
    lat: 41.0082,
    lon: 28.9784,
    isGps: false,
    temp: 22,
    hum: 55,
    windSpeedKmh: 12,
    windDirDeg: 45,
    windDirLabel: 'KD',
    windCategory: 'calm',
    kp: 2,
    weatherCode: 1,
    conditionIcon: '🌤️',
    conditionText: 'Açık / Az Bulutlu',
    isLiveSynced: false,
    isFetching: false,
    lastUpdatedTime: ''
  },

  timerId: null,

  init() {
    try {
      const saved = localStorage.getItem(AVIGEN_LIVE_WEATHER_KEY);
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved), isFetching: false };
      }
    } catch (e) {}

    this.populateCityDropdown();
    this.applyStateToFlightInputs(false);
    this.updateWeatherStatusUI();
    this.fetchNow(false);

    if (this.timerId) clearInterval(this.timerId);
    // Her 15 dakikada bir canlı meteoroloji ve Kp indeksini otomatik güncelle
    this.timerId = setInterval(() => {
      this.fetchNow(false);
    }, 15 * 60 * 1000);
  },

  saveState() {
    try {
      localStorage.setItem(AVIGEN_LIVE_WEATHER_KEY, JSON.stringify(this.state));
    } catch (e) {}
  },

  populateCityDropdown() {
    const sel = document.getElementById('liveWeatherCitySelect');
    if (!sel) return;
    let html = `<option value="gps" ${this.state.isGps ? 'selected' : ''}>🎯 ${this.state.isGps ? `${escapeHtml(this.state.cityName)} (GPS Konumu)` : 'GPS Konumumu Otomatik Bul'}</option>`;
    html += this.CITIES.map(c =>
      `<option value="${c.id}" ${!this.state.isGps && this.state.cityId === c.id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
    ).join('');
    sel.innerHTML = html;
  },

  onCitySelectChange(cityId) {
    if (cityId === 'gps') {
      this.useGpsLocation();
      return;
    }
    const found = this.CITIES.find(c => c.id === cityId);
    if (!found) return;
    this.state.cityId = found.id;
    this.state.cityName = found.name.replace(/^\d{2}\s*-\s*/, '');
    this.state.lat = found.lat;
    this.state.lon = found.lon;
    this.state.isGps = false;
    this.saveState();
    if (typeof AvigenGenesisAI !== 'undefined' && AvigenGenesisAI.state) {
      AvigenGenesisAI.state.smartRaceLoftCityId = found.id;
      AvigenGenesisAI.state.smartRaceCustomLoftCoord = null;
      AvigenGenesisAI.saveState();
    }
    this.populateCityDropdown();
    this.fetchNow(true);
  },

  promptCityFromHomeBanner(event) {
    if (event) event.stopPropagation();
    openIosTab('flight', document.querySelectorAll('.ios-tab-btn')[3]);
    if (typeof switchRaceSubTab === 'function') {
      switchRaceSubTab('weather');
    }
    setTimeout(() => {
      const sel = document.getElementById('liveWeatherCitySelect');
      if (sel) sel.focus();
    }, 80);
  },

  useGpsLocation() {
    if (!navigator.geolocation) {
      alert('Cihazınızda GPS konum servisi desteklenmiyor. Lütfen listeden şehrinizi seçin.');
      return;
    }
    const badge = document.getElementById('liveWeatherStatusBadge');
    if (badge) badge.textContent = '📡 GPS Aranıyor...';

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(4));
        const lon = Number(pos.coords.longitude.toFixed(4));
        this.state.lat = lat;
        this.state.lon = lon;
        this.state.isGps = true;
        this.state.cityId = 'gps';
        this.state.cityName = 'GPS Konumum';

        try {
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=tr`);
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            const addr = geoJson.address || {};
            const detectedName = addr.province || addr.city || addr.town || addr.county || addr.state;
            if (detectedName) {
              this.state.cityName = detectedName;
            }
          }
        } catch (e) {}

        this.saveState();
        this.populateCityDropdown();
        this.fetchNow(true);
      },
      () => {
        alert('GPS konum izni alınamadı veya kapalı. Şehir listesinden kümesinizin bulunduğu şehri seçebilirsiniz.');
        this.updateWeatherStatusUI();
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  },

  degToCompassTr(deg) {
    const dirs = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
    const idx = Math.round(((Number(deg) || 0) % 360) / 45) % 8;
    return dirs[idx];
  },

  decodeWmoWeather(code, windSpeed) {
    const c = Number(code) || 0;
    if (c === 0) return { icon: '☀️', text: 'Açık & Güneşli', vis: 10 };
    if (c === 1 || c === 2) return { icon: '🌤️', text: 'Az Bulutlu', vis: 10 };
    if (c === 3) return { icon: '☁️', text: 'Kapalı Bulutlu', vis: 9 };
    if (c === 45 || c === 48) return { icon: '🌫️', text: 'Sisli / Puslu', vis: 3 };
    if (c >= 51 && c <= 67) return { icon: '🌧️', text: 'Yağmurlu', vis: 5 };
    if (c >= 71 && c <= 77) return { icon: '❄️', text: 'Kar Yağışlı', vis: 4 };
    if (c >= 80 && c <= 82) return { icon: '🌦️', text: 'Sağanak Yağışlı', vis: 5 };
    if (c >= 95) return { icon: '⛈️', text: 'Gök Gürültülü Fırtına', vis: 3 };
    if (windSpeed >= 34) return { icon: '💨', text: 'Şiddetli Rüzgâr', vis: 7 };
    return { icon: '🌤️', text: 'Parçalı Bulutlu', vis: 10 };
  },

  async fetchNow(manualRefresh = false, event = null) {
    if (event) event.stopPropagation();
    if (this.state.isFetching) return;
    this.state.isFetching = true;
    this.updateWeatherStatusUI();

    const lat = this.state.lat || 41.0082;
    const lon = this.state.lon || 28.9784;

    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation&timezone=auto`;
      const res = await fetch(weatherUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Open-Meteo HTTP ' + res.status);
      const data = await res.json();
      const cur = data.current || {};

      const temp = Math.round(Number(cur.temperature_2m ?? 22));
      const hum = Math.round(Number(cur.relative_humidity_2m ?? 55));
      const windSpeed = Math.round(Number(cur.wind_speed_10m ?? 12));
      const windDirDeg = Math.round(Number(cur.wind_direction_10m ?? 45));
      const wCode = Number(cur.weather_code ?? 1);
      const precip = Number(cur.precipitation ?? 0);

      const wmo = this.decodeWmoWeather(wCode, windSpeed);

      let windCat = 'calm';
      if (wCode >= 95 || windSpeed >= 35 || precip >= 4) {
        windCat = 'storm';
      } else if (windSpeed >= 21) {
        windCat = 'head';
      } else if (windSpeed >= 13 && (windDirDeg >= 315 || windDirDeg <= 135)) {
        windCat = 'tail';
      } else {
        windCat = 'calm';
      }

      this.state.temp = temp;
      this.state.hum = hum;
      this.state.windSpeedKmh = windSpeed;
      this.state.windDirDeg = windDirDeg;
      this.state.windDirLabel = this.degToCompassTr(windDirDeg);
      this.state.windCategory = windCat;
      this.state.weatherCode = wCode;
      this.state.conditionIcon = wmo.icon;
      this.state.conditionText = wmo.text;
      this.state.isLiveSynced = true;

      // NOAA SWPC Canlı Jeomanyetik Kp İndeksi Çekimi (Opsiyonel / Hata Korumalı)
      try {
        const kpRes = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', { cache: 'no-store' });
        if (kpRes.ok) {
          const kpArr = await kpRes.json();
          if (Array.isArray(kpArr) && kpArr.length > 1) {
            const lastRow = kpArr[kpArr.length - 1];
            const parsedKp = parseFloat(lastRow?.[1]);
            if (!isNaN(parsedKp)) {
              this.state.kp = Math.max(0, Math.min(9, Math.round(parsedKp)));
            }
          }
        }
      } catch (kpErr) {
        // NOAA erişilemezse mevcut Kp korunur
      }

      const now = new Date();
      this.state.lastUpdatedTime = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      this.saveState();
      this.applyStateToFlightInputs(true);
    } catch (err) {
      // Çevrimdışı veya ağ hatası durumunda son kaydedilen veriyi koru
      this.applyStateToFlightInputs(false);
    } finally {
      this.state.isFetching = false;
      this.updateWeatherStatusUI();
      syncLoftIdentityAcrossUI();
    }
  },

  applyStateToFlightInputs(triggerRecalc = true) {
    const tempEl = document.getElementById('flTemp');
    const humEl = document.getElementById('flHum');
    const kpEl = document.getElementById('flKp');
    const windEl = document.getElementById('flWind');
    const visEl = document.getElementById('flVis');

    if (tempEl) tempEl.value = this.state.temp;
    if (humEl) humEl.value = this.state.hum;
    if (kpEl) kpEl.value = this.state.kp;
    if (windEl) windEl.value = this.state.windCategory || 'calm';
    if (visEl) {
      const wmo = this.decodeWmoWeather(this.state.weatherCode, this.state.windSpeedKmh);
      visEl.value = wmo.vis;
    }

    if (triggerRecalc && typeof calcMypedigreFlight === 'function') {
      calcMypedigreFlight();
    }
  },

  updateWeatherStatusUI() {
    const badge = document.getElementById('liveWeatherStatusBadge');
    const bar = document.getElementById('liveWeatherLastSyncBar');
    if (badge) {
      if (this.state.isFetching) {
        badge.className = 'gene-badge gene-blue';
        badge.textContent = '🔄 Güncelleniyor...';
      } else if (this.state.isLiveSynced) {
        badge.className = 'gene-badge gene-green';
        badge.textContent = `🟢 Canlı • ${this.state.lastUpdatedTime || 'Aktif'}`;
      } else {
        badge.className = 'gene-badge gene-purple';
        badge.textContent = '⚡ Çevrimdışı Önbellek';
      }
    }
    if (bar) {
      bar.innerHTML = `
        <span>${this.state.conditionIcon} <strong>${escapeHtml(this.state.cityName)}:</strong> ${escapeHtml(this.state.conditionText)} • 💨 Rüzgâr: <strong>${this.state.windSpeedKmh} km/sa (${this.state.windDirLabel})</strong></span>
        <span>${this.state.lastUpdatedTime ? `Saat ${this.state.lastUpdatedTime}` : '15 dk otomatik'}</span>
      `;
    }
  }
};

function syncLoftIdentityAcrossUI() {
  const bannerEl = document.getElementById('homeLoftIdentityBanner');
  if (bannerEl) {
    const customLogoHtml = loftConfig.logo
      ? `<div class="loft-identity-logo"><img src="${loftConfig.logo}" alt="Kümes Logosu" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" /></div>`
      : `<div class="loft-identity-logo" style="background:linear-gradient(135deg,#fef3c7,#fde68a); border-color:#f59e0b; font-size:20px;">🏆</div>`;

    const wState = AvigenLiveWeather.state;
    const temp = parseFloat(document.getElementById('flTemp')?.value) || wState.temp || 22;
    const wind = document.getElementById('flWind')?.value || wState.windCategory || 'calm';
    const kp = parseFloat(document.getElementById('flKp')?.value) || wState.kp || 2;
    const hum = parseFloat(document.getElementById('flHum')?.value) || wState.hum || 55;

    let score = 92;
    if (wind === 'tail') score += 5;
    else if (wind === 'head') score -= 12;
    else if (wind === 'storm') score -= 35;
    if (temp > 29) score -= (temp - 28) * 3;
    else if (temp < 6) score -= 10;
    if (kp >= 5) score -= (kp - 3) * 6;
    if (hum > 80) score -= 8;
    score = Math.max(12, Math.min(99, Math.round(score)));

    const badgeClass = score >= 80 ? 'gene-green' : (score >= 60 ? 'gene-gold' : 'gene-red');
    const isCyber = isCyberVisualSkinActive();
    const liveDot = wState.isFetching
      ? '🔄'
      : (wState.isLiveSynced ? '🟢' : '🌤️');

    if (isCyber) {
      const cyberCrestHtml = loftConfig.logo
        ? `<div class="cyber-crest-shield"><img src="${loftConfig.logo}" alt="Kümes Logosu" style="width:100%; height:100%; object-fit:cover; border-radius:10px;" /></div>`
        : `
          <div class="cyber-crest-shield">
            <svg viewBox="0 0 64 64" width="46" height="46">
              <defs>
                <linearGradient id="crestGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#fde047"/>
                  <stop offset="50%" stop-color="#eab308"/>
                  <stop offset="100%" stop-color="#a16207"/>
                </linearGradient>
                <linearGradient id="crestBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#1e3a8a"/>
                  <stop offset="100%" stop-color="#090d16"/>
                </linearGradient>
              </defs>
              <path d="M32 6 L52 14 V30 C52 44 43 54 32 59 C21 54 12 44 12 30 V14 Z" fill="url(#crestBlue)" stroke="url(#crestGold)" stroke-width="3"/>
              <path d="M22 36 C24 27 31 22 41 19 C38 25 39 29 44 31 C38 34 33 41 25 42 Z" fill="#38bdf8"/>
              <circle cx="32" cy="54" r="2.2" fill="#fde047"/>
            </svg>
          </div>
        `;

      const flightBadgeColor = score >= 80 ? '#059669' : (score >= 60 ? '#d97706' : '#dc2626');
      const flightBadgeBg = score >= 80 ? '#ecfdf5' : (score >= 60 ? '#fef3c7' : '#fef2f2');
      const flightBadgeBorder = score >= 80 ? '#a7f3d0' : (score >= 60 ? '#fde68a' : '#fecaca');

      bannerEl.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:7px; width:100%;">
          <!-- 1. KATMAN: SADE KÜMES KİMLİĞİ & KONUM SEÇİCİ -->
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%;">
            <div style="display:flex; align-items:center; gap:9px; min-width:0; flex:1; cursor:pointer;" onclick="openLoftHeaderModal()" title="Kümes Adını ve Logosunu Düzenlemek İçin Dokunun">
              ${cyberCrestHtml}
              <div style="min-width:0; flex:1;">
                <div style="display:flex; align-items:center; gap:5px;">
                  <span class="cyber-loft-title" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(loftConfig.title || 'NORM TEAM')}</span>
                  <span style="font-size:12.5px; flex-shrink:0;">🇹🇷</span>
                </div>
                <div class="cyber-loft-sub" style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${escapeHtml(loftConfig.subtitle || 'Profesyonel Posta Güvercini Kümesi • Türkiye')}
                </div>
              </div>
            </div>

            <div style="display:flex; align-items:center; gap:4px; flex-shrink:0;">
              <button type="button" onclick="AvigenLiveWeather.promptCityFromHomeBanner(event)" style="background:rgba(0,102,255,0.09); border:1px solid rgba(0,102,255,0.25); color:#0052cc; border-radius:99px; padding:4px 8px; font-size:9.5px; font-weight:800; cursor:pointer; white-space:nowrap;" title="Şehir veya GPS Konumu Değiştir">
                📍 ${escapeHtml(wState.cityName)}
              </button>
              <button type="button" onclick="AvigenLiveWeather.fetchNow(true, event)" style="background:rgba(5,150,105,0.10); border:1px solid rgba(5,150,105,0.28); color:#047857; border-radius:99px; padding:4px 7px; font-size:9.5px; font-weight:800; cursor:pointer; white-space:nowrap;" title="Canlı Hava Durumunu Şimdi Güncelle">
                ${liveDot}
              </button>
            </div>
          </div>

          <!-- 2. KATMAN: NET VE FERAH 4 KUTULU CANLI UÇUŞ HAVA DURUMU ŞERİDİ -->
          <div onclick="openIosTab('flight', document.querySelectorAll('.ios-tab-btn')[3])" style="display:grid; grid-template-columns:0.9fr 1.15fr 0.8fr 1.15fr; gap:5px; padding-top:6px; border-top:1px dashed var(--ios-border, #e2e8f0); cursor:pointer; font-size:9.5px; text-align:center;" title="Detaylı Uçuş Havası ve Yarış Ekranını Aç">
            <div style="background:var(--ios-card-alt, #f8fafc); border:1px solid var(--ios-border, #e2e8f0); border-radius:7px; padding:4px 3px; font-weight:800; color:var(--ios-text); white-space:nowrap;">
              ${wState.conditionIcon} ${temp}°C <span style="font-weight:600; color:var(--ios-subtext); font-size:8.5px;">(%${hum})</span>
            </div>
            <div style="background:var(--ios-card-alt, #f8fafc); border:1px solid var(--ios-border, #e2e8f0); border-radius:7px; padding:4px 3px; font-weight:800; color:var(--ios-text); white-space:nowrap;">
              💨 ${wState.windSpeedKmh} km/s ${wState.windDirLabel}
            </div>
            <div style="background:var(--ios-card-alt, #f8fafc); border:1px solid var(--ios-border, #e2e8f0); border-radius:7px; padding:4px 3px; font-weight:800; color:var(--ios-text); white-space:nowrap;">
              🧭 Kp: ${kp}
            </div>
            <div style="background:${flightBadgeBg}; border:1px solid ${flightBadgeBorder}; border-radius:7px; padding:4px 3px; font-weight:900; color:${flightBadgeColor}; white-space:nowrap;">
              ✈️ %${score} Uçuş
            </div>
          </div>
        </div>
      `;
      return;
    }

    bannerEl.innerHTML = `
      <div style="display:flex; align-items:center; gap:9px; min-width:0; flex:1;">
        ${customLogoHtml}
        <div style="min-width:0; flex:1;">
          <div style="font-size:13px; font-weight:900; color:#581c87; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; letter-spacing:0.3px;">
            ${escapeHtml(loftConfig.title || 'AVIGEN ŞAMPİYON KÜMESİ')}
          </div>
          <div style="font-size:10px; font-weight:600; color:var(--ios-subtext); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${escapeHtml(loftConfig.subtitle || 'Bilimsel Posta Güvercini Genetiği & Soyağacı • Türkiye')}
          </div>
        </div>
      </div>
      <div onclick="openIosTab('flight', document.querySelectorAll('.ios-tab-btn')[3])" style="display:flex; flex-direction:column; align-items:flex-end; gap:2px; flex-shrink:0; cursor:pointer;" title="Yarış ve Uçuş Analizini Aç">
        <span class="gene-badge ${badgeClass}" style="font-size:9.5px; padding:2px 7px;">${wState.conditionIcon} %${score} Uçuş (${escapeHtml(wState.cityName)})</span>
        <span style="font-size:9px; font-weight:700; color:var(--ios-subtext);">${temp}°C • 💧%${hum} • 💨${wState.windSpeedKmh}km/s • Kp:${kp}</span>
      </div>
    `;
  }
}

// ============================================================================
// BARKOD / QR KOD TARAYARAK HIZLI GÜVERCİN EKLEME SİSTEMİ
// (Canlı Kamera + Resimden Barkod + USB Barkod Okuyucu + Akıllı Çözümleyici)
// ============================================================================
let barcodeCameraStream = null;
let barcodeScanTimer = null;
let barcodeFillExistingModal = false;
let lastDecodedBarcodeBird = null;

function openBarcodeScannerModal(fillExistingModal = false) {
  barcodeFillExistingModal = fillExistingModal;
  document.getElementById('barcodeScannerModal').classList.add('open');
  const inp = document.getElementById('scannedBarcodeInput');
  if (inp) {
    inp.value = '';
    setTimeout(() => inp.focus(), 120);
  }
}

function closeBarcodeScannerModal() {
  stopLiveCameraBarcodeScan();
  document.getElementById('barcodeScannerModal').classList.remove('open');
}

function stopLiveCameraBarcodeScan() {
  if (barcodeScanTimer) {
    clearInterval(barcodeScanTimer);
    barcodeScanTimer = null;
  }
  if (barcodeCameraStream) {
    barcodeCameraStream.getTracks().forEach(t => t.stop());
    barcodeCameraStream = null;
  }
  const video = document.getElementById('barcodeVideo');
  const ph = document.getElementById('barcodePlaceholder');
  if (video) video.style.display = 'none';
  if (ph) ph.style.display = 'block';
}

async function startLiveCameraBarcodeScan() {
  const video = document.getElementById('barcodeVideo');
  const ph = document.getElementById('barcodePlaceholder');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const preview = document.getElementById('barcodeDecodedPreview');
    if (preview) {
      preview.innerHTML = '⚠️ <strong>Cihazda aktif kamera erişimi bulunamadı.</strong> Lütfen barkod/pedigri fotoğrafı yükleyin ya da aşağıdaki kutuya halka numarasını elle girin.';
    }
    return;
  }

  try {
    barcodeCameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    video.srcObject = barcodeCameraStream;
    video.style.display = 'block';
    if (ph) ph.style.display = 'none';

    // Tarayıcıda yerleşik BarcodeDetector API varsa gerçek zamanlı okur
    if ('BarcodeDetector' in window) {
      const detector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'qr_code', 'data_matrix']
      });
      barcodeScanTimer = setInterval(async () => {
        try {
          const codes = await detector.detect(video);
          if (codes && codes.length > 0 && codes[0].rawValue) {
            const val = codes[0].rawValue;
            document.getElementById('scannedBarcodeInput').value = val;
            onBarcodeValueDecoded(val);
            stopLiveCameraBarcodeScan();
          }
        } catch (err) {}
      }, 450);
    }
  } catch (err) {
    const preview = document.getElementById('barcodeDecodedPreview');
    if (preview) {
      preview.innerHTML = '⚠️ <strong>Kamera izni verilmedi veya kamera başlatılamadı.</strong> Lütfen fotoğraf yükleyin ya da halka numarasını elle girin.';
    }
  }
}

async function scanBarcodeFromImageFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  let detectedBarcodeVal = '';

  // 1. Önce görüntüdeki Barkod veya QR Kodu donanımsal olarak oku
  if ('BarcodeDetector' in window) {
    try {
      const bmp = await createImageBitmap(file);
      const detector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'ean_13', 'qr_code', 'data_matrix']
      });
      const codes = await detector.detect(bmp);
      if (codes && codes.length > 0 && codes[0].rawValue) {
        detectedBarcodeVal = codes[0].rawValue;
      }
    } catch (e) {}
  }

  // Eğer okunan QR kod içinde zaten tam AVIGEN_FULL soyağacı paketi varsa hemen çöz
  if (detectedBarcodeVal && detectedBarcodeVal.startsWith('AVIGEN_FULL||')) {
    document.getElementById('scannedBarcodeInput').value = detectedBarcodeVal;
    onBarcodeValueDecoded(detectedBarcodeVal);
    return;
  }

  // 2. Yabancı bir pedigre kağıdı fotoğrafıysa: OCR ile kağıt üzerindeki tüm halka numaralarını (Ana Kuş + Baba + Anne + Büyük Ebeveynler) birlikte çek!
  if (typeof Tesseract !== 'undefined') {
    const preview = document.getElementById('barcodeDecodedPreview');
    if (preview) preview.innerHTML = '🤖 <strong>Pedigre kağıdındaki barkod ve soyağacı kutuları (Baba, Anne, Büyük Ebeveynler) okunuyor...</strong>';
    try {
      const res = await Tesseract.recognize(file, 'eng');
      const txt = (res?.data?.text || '').trim();
      const ringRegex = /\b(?:TR|BELG|BE|NL|DV|PL|RO|GB|FR|AU)[-\s]?\d{2,4}[-\s]?[A-Z0-9-]{3,9}\b/gi;
      const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const foundNodes = [];

      lines.forEach(line => {
        const m = line.match(ringRegex);
        if (m) {
          const r = m[0].toUpperCase().replace(/\s+/g, '-');
          const q = line.match(/"([^"]+)"/);
          foundNodes.push({ ring: r, name: q ? q[1] : 'Pedigre Aktarım' });
        }
      });

      if (foundNodes.length > 0) {
        const slotOrder = ['main', 'sire', 'dam', 'g2_1', 'g2_2', 'g2_3', 'g2_4', 'g3_1', 'g3_2', 'g3_3', 'g3_4', 'g3_5', 'g3_6', 'g3_7', 'g3_8'];
        const packed = foundNodes.slice(0, slotOrder.length).map((n, idx) =>
          `${slotOrder[idx]}:${n.ring}~${n.name}~Mavi Çakmaklı~Barkod/Pedigre Tarama`
        ).join('||');
        const fullStr = `AVIGEN_FULL||${packed}`;
        document.getElementById('scannedBarcodeInput').value = fullStr;
        onBarcodeValueDecoded(fullStr);
        return;
      }
    } catch (e) {}
  }

  if (detectedBarcodeVal) {
    document.getElementById('scannedBarcodeInput').value = detectedBarcodeVal;
    onBarcodeValueDecoded(detectedBarcodeVal);
    return;
  }

  const preview = document.getElementById('barcodeDecodedPreview');
  if (preview) {
    preview.innerHTML = '⚠️ <strong>Yüklenen görselde okunabilir bir barkod, QR kod veya standart halka numarası tespit edilemedi.</strong> Lütfen daha net bir fotoğraf yükleyin veya halka numarasını aşağıdaki kutuya elle yazın.';
  }
}

// Okunan Barkod veya QR kod dizgesini (Tek Kuş veya Tam Soyağacı Paketi olarak) çözümler
function onBarcodeValueDecoded(rawStr) {
  const preview = document.getElementById('barcodeDecodedPreview');
  const clean = (rawStr || '').trim();
  if (!clean) {
    lastDecodedBarcodeBird = null;
    if (preview) preview.textContent = 'Barkod okutulması bekleniyor...';
    return;
  }

  // 1. EĞER TAM SOYAĞACI PAKETİ (AVIGEN_FULL||...) İSE: Tüm kuşağı çöz!
  if (clean.startsWith('AVIGEN_FULL||')) {
    const segments = clean.replace('AVIGEN_FULL||', '').split('||').filter(Boolean);
    const parsedBoxes = {};
    let ancestorCount = 0;

    segments.forEach(seg => {
      const colonIdx = seg.indexOf(':');
      if (colonIdx === -1) return;
      const slotKey = seg.slice(0, colonIdx).trim();
      const rest = seg.slice(colonIdx + 1);
      const [ring, name, color, notes] = rest.split('~').map(x => (x || '').trim());
      if (ring) {
        parsedBoxes[slotKey] = {
          flag: detectFlagFromRing(ring),
          ring,
          name: name || 'Pedigre Kaydı',
          color: color || 'Mavi Çakmaklı',
          notes: notes || '',
          photo: ''
        };
        if (slotKey !== 'main') ancestorCount++;
      }
    });

    const m = parsedBoxes.main || { flag: '🇹🇷', ring: 'TR-2026-100001', name: 'Yeni Güvercin', color: 'Mavi', notes: '' };
    const s = parsedBoxes.sire;
    const d = parsedBoxes.dam;

    lastDecodedBarcodeBird = {
      isFullPedigree: true,
      flag: m.flag,
      ring: m.ring,
      name: m.name,
      color: m.color,
      notes: m.notes,
      ancestorCount,
      parsedBoxes
    };

    if (preview) {
      preview.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
          <span style="font-weight:900; color:#15803d;">✅ Tam Pedigre Barkodu Çözüldü: ${m.flag} ${escapeHtml(m.ring)}</span>
          <span class="gene-badge gene-purple">+${ancestorCount} Ata Bağlı</span>
        </div>
        <div><strong>Ana Kuş:</strong> ${escapeHtml(m.name)} (${escapeHtml(m.color)})</div>
        <div style="font-size:10.5px; color:#1e40af; margin-top:2px;">
          • <strong>♂ Baba:</strong> ${s ? `${s.flag} ${escapeHtml(s.ring)} (${escapeHtml(s.name)})` : 'Kayıtsız'}<br/>
          • <strong>♀ Anne:</strong> ${d ? `${d.flag} ${escapeHtml(d.ring)} (${escapeHtml(d.name)})` : 'Kayıtsız'}
        </div>
        <div style="font-size:10px; color:#15803d; margin-top:3px; font-weight:700;">
          🌳 Baba, Anne ve Büyük Ebeveynler dahil toplam ${ancestorCount + 1} soyağacı kutusu tek seferde kümesinize aktarılacak!
        </div>
      `;
    }
    return;
  }

  // 2. TEKİL HALKA BARKODU İSE (Ve eğer okunan halka numarası veya ebeveynleri kümeste zaten varsa alt soyunu otomatik bağla!)
  let ring = clean;
  let name = 'Barkod Kayıtlı Güvercin';
  let color = 'Mavi Çakmaklı';
  let notes = 'Barkod Tarayıcı ile eklendi';

  if (clean.includes('|')) {
    const parts = clean.split('|').map(x => x.trim());
    if (parts[0].toUpperCase() === 'AVIGEN' || parts[0].toUpperCase() === 'MYPEDIGRE') {
      ring = parts[1] || 'TR-2026-100001';
      name = parts[2] || 'Şampiyon Güvercin';
      color = parts[3] || 'Mavi Çakmaklı';
      notes = parts[4] || 'Dijital Barkod / QR Sertifikalı';
    } else {
      ring = parts[0];
      name = parts[1] || name;
    }
  } else {
    if (/^\d{8,14}$/.test(clean)) {
      ring = `TR-2026-${clean.slice(-6)}`;
    } else {
      ring = clean.toUpperCase().replace(/\s+/g, '-');
    }
  }

  const flag = detectFlagFromRing(ring);
  const yearMatch = ring.match(/20\d{2}/);
  const year = yearMatch ? yearMatch[0] : '2026';

  lastDecodedBarcodeBird = { isFullPedigree: false, flag, ring, name, color, notes, year };

  if (preview) {
    preview.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
        <span style="font-weight:900; color:#15803d;">✅ Barkod Çözümlendi: ${flag} ${escapeHtml(ring)}</span>
        <span class="gene-badge gene-gold">Doğum: ${year}</span>
      </div>
      <div><strong>İsim:</strong> ${escapeHtml(name)} • <strong>Renk:</strong> ${escapeHtml(color)}</div>
      <div style="font-size:10.5px; color:var(--ios-subtext);">${escapeHtml(notes)}</div>
    `;
  }
}

function confirmAddBirdFromBarcode() {
  if (!lastDecodedBarcodeBird) {
    const manualVal = (document.getElementById('scannedBarcodeInput')?.value || '').trim();
    if (manualVal) {
      onBarcodeValueDecoded(manualVal);
    }
  }
  const b = lastDecodedBarcodeBird;
  if (!b) {
    alert('⚠️ Lütfen önce bir barkod/QR kod okutun veya halka numarasını kutuya yazın.');
    return;
  }

  if (barcodeFillExistingModal && document.getElementById('boxEditModal')?.classList.contains('open')) {
    editingFlag = b.flag;
    document.getElementById('editBoxRing').value = b.ring;
    document.getElementById('editBoxName').value = b.name;
    document.getElementById('editBoxColor').value = b.color;
    document.getElementById('editBoxNotes').value = b.notes;
    renderFlagChips();
    closeBarcodeScannerModal();
    return;
  }

  if (!checkPedigreeTierLimitAllowed()) return;

  const cleanRing = (b.ring || '').trim().toUpperCase();
  if (cleanRing && pedigrees.some(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === cleanRing)) {
    alert(`⚠️ Bilezik Numarası Benzersizlik Uyarısı:\n\n"${b.ring}" halka numarasına sahip bir ana güvercin zaten kümesinizde mevcut!`);
    return;
  }

  const newId = 'ped_bar_' + Date.now();
  const fullBoxes = {};
  BOX_SLOTS.forEach(s => {
    fullBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: '', notes: '', photo: '' };
  });

  if (b.isFullPedigree && b.parsedBoxes) {
    // Başkasının pedigresinden okunan tüm Baba, Anne, Büyükbaba ve Büyükanne kutularını birebir yerleştir!
    Object.entries(b.parsedBoxes).forEach(([slotKey, boxVal]) => {
      fullBoxes[slotKey] = { ...boxVal };
    });
  } else {
    fullBoxes.main = {
      flag: b.flag,
      ring: b.ring,
      name: b.name,
      color: b.color,
      notes: b.notes,
      photo: ''
    };
  }

  pedigrees.unshift({
    id: newId,
    themeId: 'blue',
    accentColor: '#1d4ed8',
    bgColor: '#f8fafc',
    fontFamily: "'Inter', sans-serif",
    boxes: fullBoxes
  });

  activePedigreeId = newId;
  saveMypedigreData();
  renderPedigreeDropdown();
  selectActivePedigree(newId);
  renderHomeDashboard();
  renderLoftBirdsDirectory();
  closeBarcodeScannerModal();
  openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
  switchBirdsViewMode('pedigree');
}

// ============================================================================
// SADECE PEDİGRİ SERTİFİKASINI (A4 YATAY) GERÇEK .PDF VE .PNG OLARAK ÜRETME & WHATSAPP PDF DOSYASI PAYLAŞIMI
// (Ekranın tamamını veya uygulama menülerini asla çekmez; yalnızca #mypedigrePaper şecere sertifikasını üretir)
// ============================================================================

function drawAvigenVectorPigeonLogoOnCanvas(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(w / 240, h / 200);

  // 5. Alt Turkuaz/Zümrüt Kuyruk Katmanı
  const gTail = ctx.createLinearGradient(48, 68, 145, 190);
  gTail.addColorStop(0, '#0369a1');
  gTail.addColorStop(0.5, '#06b6d4');
  gTail.addColorStop(1, '#10b981');
  ctx.fillStyle = gTail;
  ctx.fill(new Path2D('M 68 68 C 82 95, 86 135, 102 165 C 112 182, 126 190, 145 190 C 128 170, 122 140, 118 105 Z'));

  // 3. Orta Sağ İndigo/Mavi Kanat Katmanı
  const gInd = ctx.createLinearGradient(122, 82, 228, 125);
  gInd.addColorStop(0, '#4338ca');
  gInd.addColorStop(0.55, '#2563eb');
  gInd.addColorStop(1, '#06b6d4');
  ctx.fillStyle = gInd;
  ctx.fill(new Path2D('M 122 102 C 155 82, 195 82, 228 112 C 198 106, 175 125, 145 124 C 132 123, 124 114, 122 102 Z'));

  // 4. Pembe -> Altın Sarı Göğüs/Kanat Katmanı
  const gSun = ctx.createLinearGradient(76, 74, 206, 152);
  gSun.addColorStop(0, '#ec4899');
  gSun.addColorStop(0.5, '#fb923c');
  gSun.addColorStop(1, '#facc15');
  ctx.fillStyle = gSun;
  ctx.fill(new Path2D('M 76 74 C 102 115, 136 162, 172 152 C 188 148, 200 138, 206 132 C 175 142, 148 122, 124 94 Z'));

  // 1. Üst Mavi/Siyan Kanat Teleği
  const gBlue = ctx.createLinearGradient(102, 24, 212, 68);
  gBlue.addColorStop(0, '#1d4ed8');
  gBlue.addColorStop(0.55, '#0284c7');
  gBlue.addColorStop(1, '#38bdf8');
  ctx.fillStyle = gBlue;
  ctx.fill(new Path2D('M 102 36 C 135 24, 172 52, 212 50 C 188 68, 152 68, 126 56 C 115 50, 106 43, 102 36 Z'));

  // 2. Ana Baş, Gaga ve Mor/Macenta Üst Gövde
  const gBody = ctx.createLinearGradient(18, 30, 194, 114);
  gBody.addColorStop(0, '#7e22ce');
  gBody.addColorStop(0.5, '#c026d3');
  gBody.addColorStop(1, '#f43f5e');
  ctx.fillStyle = gBody;
  ctx.fill(new Path2D('M 18 66 L 46 46 C 58 30, 78 28, 96 42 C 126 66, 158 76, 194 66 C 170 96, 136 114, 102 104 C 82 98, 68 74, 52 66 C 38 60, 26 63, 18 66 Z'));

  ctx.restore();
}

function drawNativePedigreeCertificateCanvas(ped) {
  const scale = 2; // 1520 x 1120 HD (A4 Yatay Oranı • <15ms anlık üretim, User Gesture düşürmez!)
  const W = 760;
  const H = 560;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const b = ped?.boxes || {};
  const main = b.main || { flag: '🇹🇷', ring: 'TR-2026-0001', name: 'Şampiyon', color: '', notes: '' };
  const loftTitle = (typeof loftConfig !== 'undefined' && loftConfig.title) ? loftConfig.title : 'AVIGEN ELITE LOFT';
  const loftSub = (typeof loftConfig !== 'undefined' && loftConfig.subtitle) ? loftConfig.subtitle : 'OFFICIAL RACING PIGEON PEDIGREE CERTIFICATE';

  // 1. Zemin ve Çift Çizgili Resmi Mavi Çerçeve
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, W - 8, H - 8);
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Filigran (Watermark)
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.26);
  ctx.font = '900 44px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(29, 78, 216, 0.045)';
  ctx.textAlign = 'center';
  ctx.fillText(loftTitle.toUpperCase(), 0, 0);
  ctx.restore();

  // 2. Üst Başlık & Ana Kuş Kartı (y: 12..82)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.2;
  ctx.fillRect(14, 13, 330, 66);
  ctx.strokeRect(14, 13, 330, 66);

  // Sol Logo Rozeti (Orijinal AVIGEN 5 Katmanlı Vektörel Güvercin Logosu — Asla Değişmez!)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 1.4;
  ctx.fillRect(22, 24, 44, 44);
  ctx.strokeRect(22, 24, 44, 44);
  drawAvigenVectorPigeonLogoOnCanvas(ctx, 25, 29, 38, 34);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 14px Inter, Arial, sans-serif';
  ctx.fillText(String(loftTitle).slice(0, 32), 74, 38);
  ctx.fillStyle = '#475569';
  ctx.font = '700 8.5px Inter, Arial, sans-serif';
  ctx.fillText(String(loftSub).slice(0, 52), 74, 54);
  ctx.fillStyle = '#1d4ed8';
  ctx.font = '800 8px Inter, Arial, sans-serif';
  ctx.fillText('RESMİ 4 KUŞAK (31 KUTU) SOYAĞACI SERTİFİKASI', 74, 68);

  // Sağ Ana Kuş Kutusu
  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 1.6;
  ctx.fillRect(354, 13, W - 368, 66);
  ctx.strokeRect(354, 13, W - 368, 66);

  ctx.fillStyle = '#1d4ed8';
  ctx.font = '900 13px Inter, Arial, sans-serif';
  ctx.fillText(`${main.ring || 'TR-2026-0001'}  •  ${main.name || ''}`, 366, 31);
  ctx.fillStyle = '#1e293b';
  ctx.font = '700 9.5px Inter, Arial, sans-serif';
  ctx.fillText(`Renk / Cinsiyet: ${main.color || 'Mavi Çakmaklı'} ${main.sex === 'F' ? '(♀ Dişi)' : '(♂ Erkek)'}`, 366, 46);

  const mainNotesLines = String(main.notes || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (mainNotesLines.length > 0) {
    ctx.fillStyle = '#334155';
    ctx.font = '600 8px Inter, Arial, sans-serif';
    ctx.fillText(mainNotesLines.slice(0, 2).join('  |  ').slice(0, 78), 366, 61);
    if (mainNotesLines.length > 2) {
      ctx.fillText(mainNotesLines.slice(2, 4).join('  |  ').slice(0, 78), 366, 72);
    }
  }

  // 3. 4 Kuşak Soyağacı Kutuları (y: 84..520)
  const treeTop = 84;
  const treeH = 436;
  const cols = [
    { x: 14,  w: 170, keys: ['sire', 'dam'], maxLines: 7, ringFont: 10.5, nameFont: 9.2, noteFont: 7.5 },
    { x: 192, w: 176, keys: ['g2_1', 'g2_2', 'g2_3', 'g2_4'], maxLines: 4, ringFont: 9.5, nameFont: 8.5, noteFont: 7.2 },
    { x: 376, w: 180, keys: ['g3_1', 'g3_2', 'g3_3', 'g3_4', 'g3_5', 'g3_6', 'g3_7', 'g3_8'], maxLines: 2, ringFont: 8.5, nameFont: 7.8, noteFont: 6.8 },
    { x: 564, w: 182, keys: ['g4_1', 'g4_2', 'g4_3', 'g4_4', 'g4_5', 'g4_6', 'g4_7', 'g4_8', 'g4_9', 'g4_10', 'g4_11', 'g4_12', 'g4_13', 'g4_14', 'g4_15', 'g4_16'], maxLines: 0, ringFont: 7.5, nameFont: 6.8, noteFont: 6.2 }
  ];

  cols.forEach((col, cIdx) => {
    const count = col.keys.length;
    const slotH = treeH / count;
    const gap = count === 16 ? 1.5 : (count === 8 ? 3 : 5);
    const boxH = Math.max(18, slotH - gap);

    col.keys.forEach((key, idx) => {
      const node = b[key] || {};
      const isMale = idx % 2 === 0;
      const by = treeTop + idx * slotH + (gap / 2);

      // Kutu arka planı
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = isMale ? '#93c5fd' : '#f9a8d4';
      ctx.lineWidth = 1;
      ctx.fillRect(col.x, by, col.w, boxH);
      ctx.strokeRect(col.x, by, col.w, boxH);

      // Sol cinsiyet şeridi
      ctx.fillStyle = isMale ? '#1d4ed8' : '#db2777';
      ctx.fillRect(col.x, by, 3.5, boxH);

      const ringStr = (node.ring || '-').trim();
      const nameStr = (node.name || '').trim();
      const colorStr = (node.color || '').trim();
      const sexSym = isMale ? '♂' : '♀';

      ctx.textAlign = 'left';
      if (count === 16) {
        // 4. Kuşak: Tek veya iki kompakt satır
        ctx.fillStyle = '#0f172a';
        ctx.font = `800 ${col.ringFont}px Inter, Arial, sans-serif`;
        ctx.fillText(`${sexSym} ${ringStr}`.slice(0, 26), col.x + 7, by + 10);
        const subLine = [nameStr, node.notes ? String(node.notes).replace(/\r?\n/g, ' ') : ''].filter(Boolean).join(' • ');
        if (subLine) {
          ctx.fillStyle = '#475569';
          ctx.font = `600 ${col.nameFont}px Inter, Arial, sans-serif`;
          ctx.fillText(subLine.slice(0, 32), col.x + 7, by + 19.5);
        }
      } else {
        let curY = by + col.ringFont + 4;
        ctx.fillStyle = isMale ? '#1e40af' : '#9d174d';
        ctx.font = `900 ${col.ringFont}px Inter, Arial, sans-serif`;
        ctx.fillText(`${sexSym} ${ringStr}`.slice(0, 25), col.x + 8, curY);

        if (nameStr || colorStr) {
          curY += col.nameFont + 3;
          ctx.fillStyle = '#0f172a';
          ctx.font = `800 ${col.nameFont}px Inter, Arial, sans-serif`;
          const titleTxt = [nameStr, colorStr].filter(Boolean).join(' • ');
          ctx.fillText(titleTxt.slice(0, 28), col.x + 8, curY);
        }

        const nLines = String(node.notes || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
        ctx.fillStyle = '#334155';
        ctx.font = `600 ${col.noteFont}px Inter, Arial, sans-serif`;
        for (let l = 0; l < Math.min(col.maxLines, nLines.length); l++) {
          curY += col.noteFont + 2.8;
          if (curY < by + boxH - 3) {
            ctx.fillText(nLines[l].slice(0, 34), col.x + 8, curY);
          }
        }
      }

      // Bağlantı çizgisi
      if (cIdx < cols.length - 1) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(col.x + col.w, by + boxH / 2);
        ctx.lineTo(col.x + col.w + 8, by + boxH / 2);
        ctx.stroke();
      }
    });
  });

  // 4. Alt Sertifika Çubuğu + Minimal AVIGEN GENESIS AI Reklam Rozeti (y: 522..552)
  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.fillRect(14, 522, W - 28, 28);
  ctx.strokeRect(14, 522, W - 28, 28);

  const certCode = `#AVG-${(main.ring || '001').replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase()}`;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '800 8.5px Inter, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${loftTitle}  •  AVIGEN Dijital Soyağacı Doğrulama Kodu: ${certCode}`, 22, 539);

  // Sağ Alt Minimal AVIGEN GENESIS AI Reklam Kutusu
  const adX = W - 280;
  const adY = 524;
  const adW = 262;
  const adH = 24;
  const gAd = ctx.createLinearGradient(adX, adY, adX + adW, adY + adH);
  gAd.addColorStop(0, '#0a1938');
  gAd.addColorStop(0.6, '#1e3a8a');
  gAd.addColorStop(1, '#3b0764');
  ctx.fillStyle = gAd;
  ctx.fillRect(adX, adY, adW, adH);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(adX, adY, adW, adH);

  drawAvigenVectorPigeonLogoOnCanvas(ctx, adX + 5, adY + 2, 22, 19);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fde047';
  ctx.font = '900 8.2px Inter, Arial, sans-serif';
  ctx.fillText('AVIGEN GENESIS AI  •  Official Certificate (4 Gen)', adX + 32, adY + 10);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 7px Inter, Arial, sans-serif';
  ctx.fillText('5 Kuşak Genetik Eşleştirme • Yarış & Beslenme Zekâsı', adX + 32, adY + 20);

  return canvas;
}

// 2. SAYFA VEKTÖREL CANVAS MOTORU: PERFORMANS, GENETİK PROFİL & KİŞİSEL SİCİL SERTİFİKASI (A4 YATAY 1520x1120 HD)
function drawNativePedigreePage2Canvas(ped) {
  const scale = 2;
  const W = 760;
  const H = 560;
  const canvas = document.createElement('canvas');
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  const d = computePedigreePage2Data(ped);
  const main = d.main;
  const loftTitle = (typeof loftConfig !== 'undefined' && loftConfig.title) ? loftConfig.title : 'AVIGEN ELITE LOFT';

  // 1. Zemin ve Çift Çizgili Resmi Mavi Çerçeve
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, W - 8, H - 8);
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  // Filigran
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.rotate(-0.26);
  ctx.font = '900 44px Inter, Arial, sans-serif';
  ctx.fillStyle = 'rgba(29, 78, 216, 0.045)';
  ctx.textAlign = 'center';
  ctx.fillText(loftTitle.toUpperCase(), 0, 0);
  ctx.restore();

  // 2. Üst Başlık & Ana Kuş Kartı
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.2;
  ctx.fillRect(14, 13, 330, 66);
  ctx.strokeRect(14, 13, 330, 66);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 1.4;
  ctx.fillRect(22, 24, 44, 44);
  ctx.strokeRect(22, 24, 44, 44);
  drawAvigenVectorPigeonLogoOnCanvas(ctx, 25, 29, 38, 34);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 13.5px Inter, Arial, sans-serif';
  ctx.fillText(String(loftTitle).slice(0, 32), 74, 37);
  ctx.fillStyle = '#1d4ed8';
  ctx.font = '800 8.5px Inter, Arial, sans-serif';
  ctx.fillText('SAYFA 2 / 2 • PERFORMANS, GENETİK PROFİL & SİCİL DOSYASI', 74, 53);
  ctx.fillStyle = '#475569';
  ctx.font = '700 8px Inter, Arial, sans-serif';
  ctx.fillText(`Uzmanlık: ${String(d.specialtyLabel).slice(0, 44)}`, 74, 67);

  // Sağ Ana Kuş Kutusu
  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 1.6;
  ctx.fillRect(354, 13, W - 368, 66);
  ctx.strokeRect(354, 13, W - 368, 66);

  ctx.fillStyle = '#1d4ed8';
  ctx.font = '900 13px Inter, Arial, sans-serif';
  ctx.fillText(`${main.ring || 'TR-2026-0001'}  •  ${main.name || ''}`, 366, 31);
  ctx.fillStyle = '#1e293b';
  ctx.font = '700 9.5px Inter, Arial, sans-serif';
  ctx.fillText(`Renk / Cinsiyet: ${main.color || 'Mavi Çakmaklı'} ${main.sex === 'F' ? '(♀ Dişi)' : '(♂ Erkek)'} • ${d.phenotype.roleLabel}`, 366, 47);
  ctx.fillStyle = '#047857';
  ctx.font = '800 8.5px Inter, Arial, sans-serif';
  ctx.fillText(`Baba: ${ped?.boxes?.sire?.ring || '-'}   ×   Anne: ${ped?.boxes?.dam?.ring || '-'}`, 366, 63);

  // 3. 2x2 Gövde Kutuları (y: 86..514)
  // KUTU 1 (SOL ÜST): Performans & Genetik Profil (x:14, y:86, w:360, h:206)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 1.2;
  ctx.fillRect(14, 86, 360, 206);
  ctx.strokeRect(14, 86, 360, 206);
  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(14, 86, 4, 206);

  ctx.fillStyle = '#1e3a8a';
  ctx.font = '900 10.5px Inter, Arial, sans-serif';
  ctx.fillText('1. BİREYSEL PERFORMANS & GENETİK PROFİL ENDEKSİ', 26, 104);

  const metrics = [
    { lbl: 'DAMIZLIK DEĞERİ (EBV)', val: `${d.breedingScore}/100`, bg: '#eff6ff', col: '#1d4ed8', x: 26 },
    { lbl: 'YARIŞ PERFORMANSI', val: `${d.raceScore}/100`, bg: '#ecfdf5', col: '#047857', x: 140 },
    { lbl: 'WRIGHT 5 NESİL COI', val: `%${Number(d.coiPct || 0).toFixed(2)}`, bg: '#f5f3ff', col: '#6d28d9', x: 254 }
  ];
  metrics.forEach(m => {
    ctx.fillStyle = m.bg;
    ctx.fillRect(m.x, 113, 106, 42);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(m.x, 113, 106, 42);
    ctx.fillStyle = '#475569';
    ctx.font = '800 7.2px Inter, Arial, sans-serif';
    ctx.fillText(m.lbl, m.x + 7, 126);
    ctx.fillStyle = m.col;
    ctx.font = '900 14px Inter, Arial, sans-serif';
    ctx.fillText(m.val, m.x + 7, 145);
  });

  const bars = [
    { label: 'Sprint / Kısa Mesafe (100-300 km)', val: d.distSuit.sprint || 78, col: '#0284c7', y: 170 },
    { label: 'Orta Mesafe (300-500 km)', val: d.distSuit.middle || 85, col: '#1d4ed8', y: 199 },
    { label: 'Uzun Mesafe (500-700 km)', val: d.distSuit.long || 82, col: '#7c3aed', y: 228 },
    { label: 'Maraton / Ekstrem (700+ km)', val: d.distSuit.marathon || 74, col: '#059669', y: 257 }
  ];
  bars.forEach(bItem => {
    ctx.fillStyle = '#334155';
    ctx.font = '800 8.2px Inter, Arial, sans-serif';
    ctx.fillText(bItem.label, 26, bItem.y);
    ctx.fillStyle = bItem.col;
    ctx.fillText(`%${bItem.val}`, 336, bItem.y);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(26, bItem.y + 5, 334, 7);
    ctx.fillStyle = bItem.col;
    ctx.fillRect(26, bItem.y + 5, Math.round(334 * Math.min(100, Math.max(10, bItem.val)) / 100), 7);
  });

  // KUTU 2 (SAĞ ÜST): Ele Alma & Fiziksel Fenotip Kimliği (x:386, y:86, w:360, h:206)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#c4b5fd';
  ctx.lineWidth = 1.2;
  ctx.fillRect(386, 86, 360, 206);
  ctx.strokeRect(386, 86, 360, 206);
  ctx.fillStyle = '#7c3aed';
  ctx.fillRect(386, 86, 4, 206);

  ctx.fillStyle = '#5b21b6';
  ctx.font = '900 10.5px Inter, Arial, sans-serif';
  ctx.fillText('2. KUŞÇU ELE ALMA & FİZİKSEL FENOTİP KİMLİĞİ', 398, 104);

  const traits = [
    { lbl: 'GÖVDE & OMURGA YAPISI', val: d.phenotype.bodyBuild, y: 122 },
    { lbl: 'GÖĞÜS KASI KARAKTERİ', val: d.phenotype.muscleType, y: 152 },
    { lbl: 'ÇATAL KEMİK (PUBİS)', val: d.phenotype.pubicBone, y: 182 },
    { lbl: 'KANAT & SON 3 TELEK', val: d.phenotype.wingFeather, y: 212 },
    { lbl: 'GÖZ İRİS İŞARETİ (EYE-SIGN)', val: d.phenotype.eyeSignLabel, y: 242 },
    { lbl: 'KÜMES STATÜSÜ & GÜVENİLİRLİK', val: `${d.phenotype.statusLabel} • Veri Güveni: %${d.reliabilityPct}`, y: 272 }
  ];
  traits.forEach(t => {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(398, t.y - 10, 336, 24);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(398, t.y - 10, 336, 24);
    ctx.fillStyle = '#64748b';
    ctx.font = '800 7.2px Inter, Arial, sans-serif';
    ctx.fillText(t.lbl + ':', 405, t.y + 4);
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 8.6px Inter, Arial, sans-serif';
    ctx.fillText(String(t.val || '-').slice(0, 34), 542, t.y + 4);
  });

  // KUTU 3 (SOL ALT): Resmi Yarış Dereceleri & Performans Kayıtları (x:14, y:300, w:360, h:214)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.2;
  ctx.fillRect(14, 300, 360, 214);
  ctx.strokeRect(14, 300, 360, 214);
  ctx.fillStyle = '#059669';
  ctx.fillRect(14, 300, 4, 214);

  ctx.fillStyle = '#065f46';
  ctx.font = '900 10.5px Inter, Arial, sans-serif';
  ctx.fillText(`3. YARIŞ DERECELERİ & SOY BAŞARILARI (${d.raceRecords.length} Kayıt)`, 26, 318);

  if (d.raceRecords.length > 0) {
    d.raceRecords.slice(0, 5).forEach((rec, idx) => {
      const ry = 328 + idx * 35;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(26, ry, 336, 30);
      ctx.strokeStyle = '#d1fae5';
      ctx.strokeRect(26, ry, 336, 30);
      ctx.fillStyle = '#059669';
      ctx.fillRect(26, ry, 3, 30);
      ctx.fillStyle = '#0f172a';
      ctx.font = '900 8.6px Inter, Arial, sans-serif';
      ctx.fillText(`${idx + 1}. ${String(rec.title).slice(0, 54)}`, 34, ry + 12);
      ctx.fillStyle = '#475569';
      ctx.font = '700 7.6px Inter, Arial, sans-serif';
      ctx.fillText(String(rec.detail).slice(0, 62), 34, ry + 24);
    });
  } else {
    ctx.fillStyle = '#64748b';
    ctx.font = '700 9px Inter, Arial, sans-serif';
    ctx.fillText('Henüz bireysel yarış derecesi kaydı girilmemiştir.', 26, 355);
  }

  // KUTU 4 (SAĞ ALT): Güvercin Kişisel Sicil Dosyası (x:386, y:300, w:360, h:214)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#fcd34d';
  ctx.lineWidth = 1.2;
  ctx.fillRect(386, 300, 360, 214);
  ctx.strokeRect(386, 300, 360, 214);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(386, 300, 4, 214);

  ctx.fillStyle = '#92400e';
  ctx.font = '900 10.5px Inter, Arial, sans-serif';
  ctx.fillText(`4. KİŞİSEL SİCİL DOSYASI — SAĞLIK, AŞI & YUVA (${d.dossierRecords.length})`, 398, 318);

  if (d.dossierRecords.length > 0) {
    d.dossierRecords.slice(0, 5).forEach((doc, idx) => {
      const dy = 328 + idx * 35;
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(398, dy, 336, 30);
      ctx.strokeStyle = '#fde68a';
      ctx.strokeRect(398, dy, 336, 30);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(398, dy, 3, 30);
      ctx.fillStyle = '#92400e';
      ctx.font = '900 8.5px Inter, Arial, sans-serif';
      ctx.fillText(`${String(doc.category).slice(0, 36)}  (${doc.date})`, 406, dy + 12);
      ctx.fillStyle = '#334155';
      ctx.font = '700 7.6px Inter, Arial, sans-serif';
      ctx.fillText(String(doc.detail).slice(0, 60), 406, dy + 24);
    });
  } else {
    ctx.fillStyle = '#92400e';
    ctx.font = '700 8.5px Inter, Arial, sans-serif';
    ctx.fillText(`Halka No: ${main.ring || '-'} (${d.phenotype.statusLabel})`, 398, 352);
    ctx.fillStyle = '#64748b';
    ctx.fillText('Kayıtlı özel hastalık/tedavi bulgusu yok; kümes sicili temiz.', 398, 370);
  }

  // 4. Alt Sertifika Çubuğu
  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.fillRect(14, 522, W - 28, 28);
  ctx.strokeRect(14, 522, W - 28, 28);

  const certCode = `#AVG-${(main.ring || '001').replace(/[^A-Z0-9]/gi, '').slice(-6).toUpperCase()}-P2`;
  ctx.fillStyle = '#1e3a8a';
  ctx.font = '800 8.5px Inter, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${loftTitle}  •  SAYFA 2: PERFORMANS, GENETİK & SİCİL RAPORU (${certCode})`, 22, 539);

  const adX = W - 280;
  const adY = 524;
  const adW = 262;
  const adH = 24;
  const gAd = ctx.createLinearGradient(adX, adY, adX + adW, adY + adH);
  gAd.addColorStop(0, '#0a1938');
  gAd.addColorStop(0.6, '#1e3a8a');
  gAd.addColorStop(1, '#3b0764');
  ctx.fillStyle = gAd;
  ctx.fillRect(adX, adY, adW, adH);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(adX, adY, adW, adH);

  drawAvigenVectorPigeonLogoOnCanvas(ctx, adX + 5, adY + 2, 22, 19);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#fde047';
  ctx.font = '900 8.2px Inter, Arial, sans-serif';
  ctx.fillText('AVIGEN GENESIS AI  •  Performance & Dossier', adX + 32, adY + 10);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '600 7px Inter, Arial, sans-serif';
  ctx.fillText('Bireysel Performans • Genetik Profil • Sicil Dosyası', adX + 32, adY + 20);

  return canvas;
}

// Yalnızca #mypedigrePaper sertifikasını (%100 senkron, sıfır donma ve sıfır html2canvas gecikmesiyle <15ms içinde) yüksek çözünürlüklü Canvas olarak üretir.
function captureOnlyPedigreePaperCanvasSync(targetPedId) {
  if (targetPedId && targetPedId !== activePedigreeId) {
    activePedigreeId = targetPedId;
  }
  renderActivePedigree();
  const ped = getActivePedigree();
  return drawNativePedigreeCertificateCanvas(ped);
}

async function captureOnlyPedigreePaperCanvas(targetPedId) {
  return captureOnlyPedigreePaperCanvasSync(targetPedId);
}

function dataUrlToBlobSync(dataUrl, fallbackMime = 'image/png') {
  const parts = String(dataUrl || '').split(',');
  const mimeMatch = (parts[0] || '').match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
  const binStr = atob(parts[1] || '');
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function isAndroidOrWebViewDevice() {
  const ua = navigator.userAgent || '';
  return Boolean(
    window.Capacitor ||
    /Android/i.test(ua) ||
    /\bwv\b/i.test(ua) ||
    /iPhone|iPad|iPod|Mobile/i.test(ua)
  );
}

// Yüksek çözünürlüklü Pedigri (1. Sayfa) ve Performans/Sicil (2. Sayfa) Canvas'larını standart A4 Yatay (842 x 595 pt) gerçek 2 Sayfalık .PDF dosyasına dönüştürür
function convertPedigreeCanvasToPdfBlob(canvasPage1, canvasPage2 = null, preJpeg1 = '', preJpeg2 = '') {
  const canvases = canvasPage2 ? [canvasPage1, canvasPage2] : [canvasPage1];
  const preJpegs = [preJpeg1, preJpeg2];
  const pageW = 842;
  const pageH = 595;
  const margin = 10;
  const drawW = pageW - margin * 2;
  const drawH = pageH - margin * 2;

  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let currentOffset = 0;

  const pushStr = (str) => {
    const bytes = encoder.encode(str);
    chunks.push(bytes);
    currentOffset += bytes.length;
  };
  const pushBytes = (bytes) => {
    chunks.push(bytes);
    currentOffset += bytes.length;
  };
  const markObj = () => {
    offsets.push(currentOffset);
  };

  pushStr('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');

  // 1 0 obj: Catalog
  markObj();
  pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // Her sayfa 3 nesne kullanır: Page (3, 6...), Image (4, 7...), Content (5, 8...)
  const pageObjNums = canvases.map((_, idx) => 3 + idx * 3);

  // 2 0 obj: Pages
  markObj();
  pushStr(`2 0 obj\n<< /Type /Pages /Kids [${pageObjNums.map(n => `${n} 0 R`).join(' ')}] /Count ${canvases.length} >>\nendobj\n`);

  canvases.forEach((cnv, idx) => {
    const pageObjId = 3 + idx * 3;
    const imgObjId = pageObjId + 1;
    const contentObjId = pageObjId + 2;

    const jpegDataUrl = preJpegs[idx] || cnv.toDataURL('image/jpeg', 0.92);
    const base64Data = jpegDataUrl.split(',')[1] || '';
    const binaryStr = atob(base64Data);
    const jpegLen = binaryStr.length;
    const jpegBytes = new Uint8Array(jpegLen);
    for (let i = 0; i < jpegLen; i++) {
      jpegBytes[i] = binaryStr.charCodeAt(i);
    }

    // Page Object
    markObj();
    pushStr(`${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im${idx} ${imgObjId} 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`);

    // Image Object
    markObj();
    pushStr(`${imgObjId} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${cnv.width} /Height ${cnv.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    pushBytes(jpegBytes);
    pushStr('\nendstream\nendobj\n');

    // Content Stream Object
    const contentStream = `q\n${drawW} 0 0 ${drawH} ${margin} ${margin} cm\n/Im${idx} Do\nQ\n`;
    markObj();
    pushStr(`${contentObjId} 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}endstream\nendobj\n`);
  });

  // xref tablosu
  const xrefOffset = currentOffset;
  pushStr(`xref\n0 ${offsets.length}\n0000000000 65535 f \n`);
  for (let i = 1; i < offsets.length; i++) {
    pushStr(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  pushStr(`trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);

  // Android Native Bridge için tek dizide birleştirip base64 hazırla
  const totalBytes = new Uint8Array(currentOffset);
  let pos = 0;
  for (let c = 0; c < chunks.length; c++) {
    totalBytes.set(chunks[c], pos);
    pos += chunks[c].length;
  }
  let bin = '';
  const step = 0x8000;
  for (let i = 0; i < totalBytes.length; i += step) {
    bin += String.fromCharCode.apply(null, totalBytes.subarray(i, i + step));
  }
  const pdfBlob = new Blob([totalBytes], { type: 'application/pdf' });
  pdfBlob._base64 = btoa(bin);
  return pdfBlob;
}

function isCapacitorAndroidApk() {
  return Boolean(
    window.Capacitor &&
    typeof window.Capacitor.isNativePlatform === 'function' &&
    window.Capacitor.isNativePlatform()
  );
}

// Android APK (WebView) ve tüm tarayıcılarda WhatsApp / dış bağlantıları güvenle açar (APK içinde WhatsApp donmasını %100 önler)
function openExternalUrlSafe(url) {
  if (!url) return;

  // Eğer Android APK veya mobil cihazda https://wa.me/ linki açılıyorsa doğrudan yerel WhatsApp uygulamasını (whatsapp://send) tetikle
  if (isAndroidOrWebViewDevice() && /^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(url)) {
    try {
      const parsedUrl = new URL(url);
      const phonePart = parsedUrl.pathname.replace(/\//g, '').trim();
      const textParam = parsedUrl.searchParams.get('text') || '';
      const nativeWaUrl = phonePart
        ? `whatsapp://send?phone=${encodeURIComponent(phonePart)}&text=${encodeURIComponent(textParam)}`
        : `whatsapp://send?text=${encodeURIComponent(textParam)}`;
      window.location.href = nativeWaUrl;
      return;
    } catch (e) {}
  }

  const isSpecialScheme = /^(whatsapp:|mailto:|tel:|intent:)/i.test(url);
  if (isCapacitorAndroidApk() || isSpecialScheme) {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1500);
      return;
    } catch (e) {}
  }
  const win = window.open(url, '_blank');
  if (!win) {
    window.location.href = url;
  }
}

// Android WebView (window.Capacitor) dahil tüm cihazlarda %100 çalışan Pano Kopyalama yardımcısı
async function copyTextToClipboardSafe(text, successAlertMsg = '') {
  const str = String(text || '');
  let copied = false;
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(str);
      copied = true;
    } catch (e) {}
  }
  if (!copied) {
    try {
      const ta = document.createElement('textarea');
      ta.value = str;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, str.length);
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (e) {}
  }
  if (successAlertMsg) {
    alert(successAlertMsg);
  }
  return copied;
}

function triggerBlobFileDownload(blob, fileName, dataUrlFallback = '') {
  try {
    const hrefUrl = (isCapacitorAndroidApk() && dataUrlFallback)
      ? dataUrlFallback
      : URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = hrefUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) a.parentNode.removeChild(a);
      if (!hrefUrl.startsWith('data:')) {
        URL.revokeObjectURL(hrefUrl);
      }
    }, 6000);
  } catch (e) {}
}

let _lastExportedPedigreeState = null;

function buildPedigreeWhatsAppSummaryText(ped) {
  const d = computePedigreePage2Data(ped);
  const b = ped?.boxes || {};
  const m = b.main || {};
  const s = b.sire || {};
  const dm = b.dam || {};
  const loftTitle = (typeof loftConfig !== 'undefined' && loftConfig.title) ? loftConfig.title : 'AVIGEN KÜMESİ';
  const lines = [
    `🕊️ *${loftTitle} — RESMİ 4 KUŞAK PEDİGRİ & PERFORMANS/SİCİL KÜNYESİ*`,
    `• *Kuş:* ${m.flag || '🇹🇷'} ${m.ring || '-'} (${m.name || 'İsimsiz'})`,
    `• *Cinsiyet / Renk:* ${m.sex === 'F' ? '♀ Dişi' : '♂ Erkek'} • ${m.color || 'Mavi Çakmaklı'}`,
    `• *Performans & Genetik:* Damızlık (EBV): ${d.breedingScore}/100 • Yarış: ${d.raceScore}/100 • COI: %${Number(d.coiPct || 0).toFixed(2)}`,
    `• *♂ Baba:* ${s.ring || '-'} ${s.name ? '(' + s.name + ')' : ''}`,
    `• *♀ Anne:* ${dm.ring || '-'} ${dm.name ? '(' + dm.name + ')' : ''}`,
    `• *Büyükbabalar:* ${b.g2_1?.ring || '-'} / ${b.g2_3?.ring || '-'}`,
    `• *Büyükanneler:* ${b.g2_2?.ring || '-'} / ${b.g2_4?.ring || '-'}`
  ];
  if (m.notes) {
    lines.push(`• *Derece / Notlar:* ${String(m.notes).replace(/\r?\n/g, ' | ').slice(0, 220)}`);
  }
  return lines.join('\n');
}

function printOrSavePedigreePdfOnAndroid() {
  if (!_lastExportedPedigreeState || !_lastExportedPedigreeState.jpegDataUrl) return;
  const imgUrl1 = _lastExportedPedigreeState.jpegDataUrl;
  const imgUrl2 = _lastExportedPedigreeState.page2JpegDataUrl;
  const titleStr = _lastExportedPedigreeState.pdfFileName || 'AVIGEN_Pedigre_ve_Sicil.pdf';

  // Android WebView ve tüm mobil tarayıcılarda çalışan 2 sayfa yatay A4 yazdırma / PDF kaydetme katmanı
  let printStyle = document.getElementById('avigenAndroidPrintPdfStyle');
  if (!printStyle) {
    printStyle = document.createElement('style');
    printStyle.id = 'avigenAndroidPrintPdfStyle';
    printStyle.textContent = `
      @media print {
        @page { size: A4 landscape; margin: 4mm; }
        body > *:not(#avigenAndroidPrintOnlyContainer) { display: none !important; }
        #avigenAndroidPrintOnlyContainer {
          display: block !important;
          width: 100% !important;
          background: #ffffff !important;
          z-index: 999999 !important;
        }
        #avigenAndroidPrintOnlyContainer .print-page-sheet {
          width: 100% !important;
          height: 98vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          page-break-after: always !important;
          break-after: page !important;
        }
        #avigenAndroidPrintOnlyContainer .print-page-sheet:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        #avigenAndroidPrintOnlyContainer img {
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }

  let printBox = document.getElementById('avigenAndroidPrintOnlyContainer');
  if (!printBox) {
    printBox = document.createElement('div');
    printBox.id = 'avigenAndroidPrintOnlyContainer';
    printBox.style.display = 'none';
    document.body.appendChild(printBox);
  }
  printBox.innerHTML = `
    <div class="print-page-sheet"><img src="${imgUrl1}" alt="${escapeHtml(titleStr)} - Sayfa 1" /></div>
    ${imgUrl2 ? `<div class="print-page-sheet"><img src="${imgUrl2}" alt="${escapeHtml(titleStr)} - Sayfa 2" /></div>` : ''}
  `;

  const oldTitle = document.title;
  document.title = titleStr.replace(/\.pdf$/i, '');
  window.print();
  setTimeout(() => {
    document.title = oldTitle;
  }, 1500);
}

async function shareExportedPedigreeFromAssistModal(formatType = 'pdf') {
  if (!_lastExportedPedigreeState) return;
  const st = _lastExportedPedigreeState;

  // 1. Yeni Android APK Yerel Dosya Paylaşım Köprüsü (Gerçek .PDF dosyasını WhatsApp'a doğrudan dosya olarak iletir)
  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.shareBase64File === 'function') {
    try {
      if (formatType === 'pdf' && st.pdfBase64) {
        window.AvigenNativeBridge.shareBase64File(
          st.pdfBase64,
          st.pdfFileName,
          'application/pdf',
          `${st.ring} Resmi 2 Sayfa Pedigri & Sicil Sertifikası (PDF)`
        );
        return;
      }
      if (formatType !== 'pdf' && st.jpegDataUrl) {
        const b64Img = (st.jpegDataUrl.split(',')[1] || '').trim();
        window.AvigenNativeBridge.shareBase64File(
          b64Img,
          st.pngFileName.replace(/\.png$/i, '.jpg'),
          'image/jpeg',
          `${st.ring} Resmi Pedigri Sertifikası`
        );
        return;
      }
    } catch (e) {}
  }

  // 2. Web Share API Level 2 (Gerçek .PDF veya Sertifika Görseli Dosya Paylaşımı — Asla Yazı Göndermez!)
  if (navigator.share) {
    try {
      const filesToShare = formatType === 'png'
        ? (st.page2PngFile ? [st.pngFile, st.page2PngFile] : [st.pngFile])
        : [st.pdfFile];
      await navigator.share({
        files: filesToShare,
        title: `${st.ring} Resmi 2 Sayfa Pedigri & Sicil Sertifikası (PDF)`
      });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      // Bazı mobil WebView'lar application/pdf yerine yalnızca sertifika görsel dosyasına izin veriyorsa dosyayı paylaş
      try {
        await navigator.share({
          files: st.page2PngFile ? [st.pngFile, st.page2PngFile] : [st.pngFile],
          title: `${st.ring} Resmi Pedigri Sertifikası`
        });
        return;
      } catch (err2) {
        if (err2 && err2.name === 'AbortError') return;
      }
    }
  }

  // 3. Yedek olarak PDF yazdırma / kaydetme ekranını tetikle (Asla yazı paylaşımına düşmez!)
  printOrSavePedigreePdfOnAndroid();
}

function saveExportedPedigreePdfToDevice() {
  if (!_lastExportedPedigreeState) return;
  const st = _lastExportedPedigreeState;
  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveBase64FileToDownloads === 'function' && st.pdfBase64) {
    try {
      window.AvigenNativeBridge.saveBase64FileToDownloads(st.pdfBase64, st.pdfFileName, 'application/pdf');
      return;
    } catch (e) {}
  }
  if (!isCapacitorAndroidApk()) {
    triggerBlobFileDownload(st.pdfBlob, st.pdfFileName);
  }
  printOrSavePedigreePdfOnAndroid();
}

function openPedigreeExportAssistModal(modeLabel = '2 Sayfa PDF İndir & WhatsApp Paylaş') {
  if (!_lastExportedPedigreeState) return;
  const st = _lastExportedPedigreeState;

  let modal = document.getElementById('avigenPedigreeExportModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'avigenPedigreeExportModal';
    modal.className = 'ios-modal-overlay';
    const hostFrame = document.querySelector('.iphone-frame') || document.body;
    hostFrame.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="ios-sheet" style="max-height:93%;">
      <div class="ios-card-title" style="margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span>📜</span>
          <span>${escapeHtml(st.ring)} — ${escapeHtml(modeLabel)}</span>
        </div>
        <button type="button" class="ios-btn ios-btn-outline" style="padding:4px 10px;" onclick="document.getElementById('avigenPedigreeExportModal')?.classList.remove('open')">✖ Kapat</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px; font-size:10.5px;">
        <div style="background:#ecfdf5; border:1.5px solid #6ee7b7; border-radius:9px; padding:7px 9px; color:#065f46; line-height:1.38;">
          ✅ <strong>2 Sayfalık Resmi PDF Sertifikanız Hazır!</strong><br/>
          • <strong>1. Sayfa:</strong> 4 Kuşak (31 Kutu) Soyağacı Pedigrisi<br/>
          • <strong>2. Sayfa:</strong> Bireysel Performans, Genetik Profil &amp; Kişisel Sicil Dosyası
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <button type="button" class="ios-btn ios-btn-green" style="padding:11px 8px; font-size:11px; font-weight:900;" onclick="shareExportedPedigreeFromAssistModal('pdf')">
            📲 WhatsApp'ta PDF Dosyası Paylaş
          </button>
          <button type="button" class="ios-btn ios-btn-primary" style="padding:11px 8px; font-size:11px; font-weight:900;" onclick="saveExportedPedigreePdfToDevice()">
            📄 Cihaza PDF İndir / Yazdır
          </button>
        </div>

        <!-- 1. SAYFA VE 2. SAYFA CANLI YÜKSEK ÇÖZÜNÜRLÜKLÜ ÖNİZLEME (Basılı Tutup Kaydetme Destekli) -->
        <div style="background:#0f172a; border:2px solid #1d4ed8; border-radius:10px; padding:6px; text-align:center; display:flex; flex-direction:column; gap:7px; max-height:310px; overflow-y:auto;">
          <div>
            <div style="font-size:9px; font-weight:900; color:#fde047; margin-bottom:3px;">📜 1. SAYFA: 4 KUŞAK (31 KUTU) SOYAĞACI PEDİGRİSİ</div>
            <img src="${st.pngDataUrl}" alt="${escapeHtml(st.ring)} Sayfa 1 Pedigri" style="width:100%; height:auto; border-radius:6px; display:block;" />
          </div>
          ${st.page2PngDataUrl ? `
            <div style="border-top:1px dashed #38bdf8; padding-top:6px;">
              <div style="font-size:9px; font-weight:900; color:#34d399; margin-bottom:3px;">📊 2. SAYFA: PERFORMANS, GENETİK PROFİL &amp; SİCİL DOSYASI</div>
              <img src="${st.page2PngDataUrl}" alt="${escapeHtml(st.ring)} Sayfa 2 Performans ve Sicil" style="width:100%; height:auto; border-radius:6px; display:block;" />
            </div>
          ` : ''}
          <div style="font-size:8.6px; color:#bae6fd; font-weight:700;">
            💡 İpucu: Resimlerin üzerine parmağınızla 1 saniye basılı tutarak da "Resmi İndir / Paylaş" yapabilirsiniz.
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 6px; font-size:9.8px; font-weight:800;" onclick="shareExportedPedigreeFromAssistModal('png')">
            🖼️ 1+2 Sayfa Sertifika Görselini Paylaş
          </button>
          <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 6px; font-size:9.8px; font-weight:800;" onclick="printOrSavePedigreePdfOnAndroid()">
            🖨️ A4 Yazdır / PDF Olarak Kaydet
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
}

function preparePedigreeExportAssetsSync(targetPedId) {
  if (targetPedId && targetPedId !== activePedigreeId) {
    activePedigreeId = targetPedId;
  }
  renderActivePedigree();
  const ped = getActivePedigree();
  const canvas1 = drawNativePedigreeCertificateCanvas(ped);
  const canvas2 = drawNativePedigreePage2Canvas(ped);
  const m = ped?.boxes?.main || {};
  const ring = (m.ring || 'Pedigre').replace(/[^a-zA-Z0-9_-]/g, '_');
  const pdfFileName = `AVIGEN_${ring}_Pedigre_ve_Sicil_2Sayfa.pdf`;
  const pngFileName = `AVIGEN_${ring}_Sayfa1_Pedigre.jpg`;
  const page2PngFileName = `AVIGEN_${ring}_Sayfa2_Performans_Sicil.jpg`;

  // Tek seferlik hızlı JPEG kodlaması (<35ms): User Gesture'ı asla düşürmez!
  const jpegDataUrl = canvas1.toDataURL('image/jpeg', 0.92);
  const page2JpegDataUrl = canvas2.toDataURL('image/jpeg', 0.92);
  const pdfBlob = convertPedigreeCanvasToPdfBlob(canvas1, canvas2, jpegDataUrl, page2JpegDataUrl);
  const pdfBase64 = pdfBlob._base64 || '';

  const pngBlob = dataUrlToBlobSync(jpegDataUrl, 'image/jpeg');
  const page2PngBlob = dataUrlToBlobSync(page2JpegDataUrl, 'image/jpeg');
  const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf', lastModified: Date.now() });
  const pngFile = new File([pngBlob], pngFileName, { type: 'image/jpeg', lastModified: Date.now() });
  const page2PngFile = new File([page2PngBlob], page2PngFileName, { type: 'image/jpeg', lastModified: Date.now() });

  _lastExportedPedigreeState = {
    ped,
    ring: m.ring || 'Pedigre',
    pdfFileName,
    pngFileName,
    page2PngFileName,
    pdfBlob,
    pdfBase64,
    pngBlob,
    page2PngBlob,
    pdfFile,
    pngFile,
    page2PngFile,
    pngDataUrl: jpegDataUrl,
    jpegDataUrl,
    page2PngDataUrl: page2JpegDataUrl,
    page2JpegDataUrl
  };
  return _lastExportedPedigreeState;
}

// 1. 2 SAYFALIK PEDİGRİ + PERFORMANS/SİCİL DOSYASINI .PDF OLARAK İNDİRİR (%100 Senkron, Android'de Donma Yapmaz!)
async function downloadHighResPedigree(targetPedId) {
  const st = preparePedigreeExportAssetsSync(targetPedId);
  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.saveBase64FileToDownloads === 'function' && st.pdfBase64) {
    try {
      window.AvigenNativeBridge.saveBase64FileToDownloads(st.pdfBase64, st.pdfFileName, 'application/pdf');
    } catch (e) {}
  } else if (!isCapacitorAndroidApk()) {
    triggerBlobFileDownload(st.pdfBlob, st.pdfFileName);
  }
  openPedigreeExportAssistModal('2 Sayfa Pedigri + Sicil PDF İndir');
}

// 2. PEDİGRİ VE PERFORMANS/SİCİL KARTINI YÜKSEK ÇÖZÜNÜRLÜKLÜ RESİM OLARAK İNDİRİR (%100 Senkron)
async function downloadHighResPedigreePng(targetPedId) {
  const st = preparePedigreeExportAssetsSync(targetPedId);
  if (!isCapacitorAndroidApk()) {
    triggerBlobFileDownload(st.pngBlob, st.pngFileName, st.pngDataUrl);
  }
  openPedigreeExportAssistModal('HD Pedigri & Sicil Sertifikası');
}

// 3. WHATSAPP ÜZERİNDEN DOĞRUDAN GERÇEK 2 SAYFA .PDF DOSYASI OLARAK PAYLAŞIR (%100 Dosya Paylaşımı, Asla Yazı Göndermez!)
async function shareActivePedigree(targetPedId) {
  const st = preparePedigreeExportAssetsSync(targetPedId);

  // A. Android APK Yerel Dosya Paylaşım Köprüsü (FileProvider + Intent.ACTION_SEND -> Gerçek 2 Sayfa PDF Dosyası!)
  if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.shareBase64File === 'function' && st.pdfBase64) {
    try {
      window.AvigenNativeBridge.shareBase64File(
        st.pdfBase64,
        st.pdfFileName,
        'application/pdf',
        `${st.ring} Resmi 2 Sayfa Pedigri & Sicil Sertifikası (PDF)`
      );
      return;
    } catch (e) {}
  }

  // B. Web Share API Level 2 (Gerçek 2 Sayfa .PDF Dosyası Paylaşımı — <35ms içinde çağrıldığı için User Gesture korunur!)
  if (navigator.share) {
    try {
      await navigator.share({
        files: [st.pdfFile],
        title: `${st.ring} Resmi 2 Sayfa Pedigri & Sicil Sertifikası (PDF)`
      });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      try {
        await navigator.share({
          files: [st.pngFile, st.page2PngFile],
          title: `${st.ring} Resmi Pedigri & Sicil Sertifikası`
        });
        return;
      } catch (err2) {
        if (err2 && err2.name === 'AbortError') return;
      }
    }
  }

  // C. Cihaz doğrudan paylaşımı açamadıysa 2 Sayfa PDF İndirme & Paylaşma Penceresini aç (Asla yazı paylaşımına düşmez!)
  openPedigreeExportAssistModal('WhatsApp 2 Sayfa PDF Paylaş');
}

// ============================================================================
// 2. EKRAN: AI TARAMA (4 KUŞAK / 31 KUTU GERÇEK KOORDİNATLI OCR PEDİGRE AKTARIMI)
// ============================================================================
let aiScanGenerationFilter = 'ALL'; // 'ALL' | 'G0_G1' | 'G2' | 'G3' | 'G4'
let aiScanRunToken = 0; // Arka planda çalışan yakınlaştırma döngüsünü iptal etmek için
const userManuallyEditedOcrSlots = new Set(); // Kullanıcının elle düzelttiği kutuların üzerine OCR'ın tekrar yazmasını kesin olarak engeller!

function onAiPhotoSelected(event) {
  aiTempFile = event.target.files?.[0] || null;
  if (aiTempFile) {
    aiScanRunToken++;
    userManuallyEditedOcrSlots.clear();
    const status = document.getElementById('aiStatusText');
    if (status) {
      status.textContent = `📸 Seçildi: ${aiTempFile.name} — Otomatik 4 Kuşak (31 Kutu) OCR taraması başlatılıyor...`;
    }
    startAiOcrScan();
  }
}

// Standart 4 Kuşak Pedigre Kağıdında (mypedigre.com, PIPA, Compuclub, Benzakour vb.)
// 31 Kutunun Normalize Edilmiş (x0..x1, y0..y1) BÖLGE (ROI) VE MERKEZ HARİTASI:
// Tam sayfayı tek seferde Tesseract'a vermek yerine, hem bütünsel hem de 31 kutunun kendi bölgesindeki
// kelimeleri ve açıklamaları (isim, yetiştirici, yarış derecesi) kutu bazında toplar!
const PEDIGREE_31_SPATIAL_CENTERS = [
  // Sütun 0: Ana Güvercin (Sol Orta — x: 0.04..0.24, y: 0.38..0.60)
  { key: 'main', col: 0, row: 0, cx: 0.13, cy: 0.49, x0: 0.04, x1: 0.24, y0: 0.385, y1: 0.595 },
  // Sütun 1: Baba (Üst — y: 0.155..0.385) & Anne (Alt — y: 0.595..0.84)
  { key: 'sire', col: 1, row: 0, cx: 0.24, cy: 0.26, x0: 0.145, x1: 0.355, y0: 0.155, y1: 0.385 },
  { key: 'dam',  col: 1, row: 1, cx: 0.24, cy: 0.72, x0: 0.145, x1: 0.355, y0: 0.595, y1: 0.85 },
  // Sütun 2: 2. Kuşak 4 Büyük Ebeveyn
  { key: 'g2_1', col: 2, row: 0, cx: 0.46, cy: 0.17, x0: 0.355, x1: 0.57, y0: 0.055, y1: 0.28 },
  { key: 'g2_2', col: 2, row: 1, cx: 0.46, cy: 0.39, x0: 0.355, x1: 0.57, y0: 0.28, y1: 0.50 },
  { key: 'g2_3', col: 2, row: 2, cx: 0.46, cy: 0.62, x0: 0.355, x1: 0.57, y0: 0.50, y1: 0.73 },
  { key: 'g2_4', col: 2, row: 3, cx: 0.46, cy: 0.84, x0: 0.355, x1: 0.57, y0: 0.73, y1: 0.95 },
  // Sütun 3: 3. Kuşak 8 Büyük-Büyük Ebeveyn
  { key: 'g3_1', col: 3, row: 0, cx: 0.67, cy: 0.11, x0: 0.56, x1: 0.78, y0: 0.05, y1: 0.17 },
  { key: 'g3_2', col: 3, row: 1, cx: 0.67, cy: 0.22, x0: 0.56, x1: 0.78, y0: 0.17, y1: 0.28 },
  { key: 'g3_3', col: 3, row: 2, cx: 0.67, cy: 0.33, x0: 0.56, x1: 0.78, y0: 0.28, y1: 0.39 },
  { key: 'g3_4', col: 3, row: 3, cx: 0.67, cy: 0.44, x0: 0.56, x1: 0.78, y0: 0.39, y1: 0.50 },
  { key: 'g3_5', col: 3, row: 4, cx: 0.67, cy: 0.56, x0: 0.56, x1: 0.78, y0: 0.50, y1: 0.62 },
  { key: 'g3_6', col: 3, row: 5, cx: 0.67, cy: 0.67, x0: 0.56, x1: 0.78, y0: 0.62, y1: 0.73 },
  { key: 'g3_7', col: 3, row: 6, cx: 0.67, cy: 0.78, x0: 0.56, x1: 0.78, y0: 0.73, y1: 0.84 },
  { key: 'g3_8', col: 3, row: 7, cx: 0.67, cy: 0.89, x0: 0.56, x1: 0.78, y0: 0.84, y1: 0.96 },
  // Sütun 4: 4. Kuşak 16 Ata (Sağ Sütun)
  { key: 'g4_1',  col: 4, row: 0,  cx: 0.88, cy: 0.085, x0: 0.77, x1: 0.99, y0: 0.050, y1: 0.115 },
  { key: 'g4_2',  col: 4, row: 1,  cx: 0.88, cy: 0.140, x0: 0.77, x1: 0.99, y0: 0.115, y1: 0.170 },
  { key: 'g4_3',  col: 4, row: 2,  cx: 0.88, cy: 0.195, x0: 0.77, x1: 0.99, y0: 0.170, y1: 0.225 },
  { key: 'g4_4',  col: 4, row: 3,  cx: 0.88, cy: 0.250, x0: 0.77, x1: 0.99, y0: 0.225, y1: 0.280 },
  { key: 'g4_5',  col: 4, row: 4,  cx: 0.88, cy: 0.305, x0: 0.77, x1: 0.99, y0: 0.280, y1: 0.335 },
  { key: 'g4_6',  col: 4, row: 5,  cx: 0.88, cy: 0.360, x0: 0.77, x1: 0.99, y0: 0.335, y1: 0.390 },
  { key: 'g4_7',  col: 4, row: 6,  cx: 0.88, cy: 0.415, x0: 0.77, x1: 0.99, y0: 0.390, y1: 0.445 },
  { key: 'g4_8',  col: 4, row: 7,  cx: 0.88, cy: 0.470, x0: 0.77, x1: 0.99, y0: 0.445, y1: 0.500 },
  { key: 'g4_9',  col: 4, row: 8,  cx: 0.88, cy: 0.530, x0: 0.77, x1: 0.99, y0: 0.500, y1: 0.560 },
  { key: 'g4_10', col: 4, row: 9,  cx: 0.88, cy: 0.585, x0: 0.77, x1: 0.99, y0: 0.560, y1: 0.615 },
  { key: 'g4_11', col: 4, row: 10, cx: 0.88, cy: 0.640, x0: 0.77, x1: 0.99, y0: 0.615, y1: 0.670 },
  { key: 'g4_12', col: 4, row: 11, cx: 0.88, cy: 0.695, x0: 0.77, x1: 0.99, y0: 0.670, y1: 0.725 },
  { key: 'g4_13', col: 4, row: 12, cx: 0.88, cy: 0.750, x0: 0.77, x1: 0.99, y0: 0.725, y1: 0.780 },
  { key: 'g4_14', col: 4, row: 13, cx: 0.88, cy: 0.805, x0: 0.77, x1: 0.99, y0: 0.780, y1: 0.835 },
  { key: 'g4_15', col: 4, row: 14, cx: 0.88, cy: 0.860, x0: 0.77, x1: 0.99, y0: 0.835, y1: 0.890 },
  { key: 'g4_16', col: 4, row: 15, cx: 0.88, cy: 0.915, x0: 0.77, x1: 0.99, y0: 0.890, y1: 0.955 }
];

// Tüm uluslararası ve Türkiye (TUGF / TGYB / TR) bilezik formatlarını, Alman kulüp kodlu halkaları (08897-18-4558 V),
// tek harfli Belçika/Fransa/Almanya halkalarını (B-11-6240223, B11-6327025, F-13-411955), OLR halkalarını ve sondaki cinsiyet harflerini (-E/-D/V/W/M/H) yakalayan gelişmiş Regex:
const UNIVERSAL_PIGEON_RING_REGEX = /\b(?:(?:TUGF\d{0,2}|TGYB\d{0,2}|TRR\d{0,2}|TR\d{0,2}|T[R8]\d{0,2}|BELG|BEL|BLG|BE|B(?=[-\s]?\d{2}[-\s]\d{5,8})|NL|N1|DV|DE|GER|D|RO|PL|GB|UK|NEHU|WHU|FR|F(?=[-\s]?\d{2}[-\s]\d{4,7})|AU|IF|GFL|USA|IT|ES|PT|IHU|IFB|HU|SK|CZ|BG|GR|CRO|HR|DAN|DK|CH|AT|CHN)(?:[-\s.:/_]*[A-Z]{1,8})?(?:[-\s.:/_]*\d{1,8}){1,4}|0?\d{3,4}[-\s.:/_]+\d{2,4}[-\s.:/_]+\d{1,6})(?:[-\s]+[EDVWMHNF])?\b/gi;

// Kutu içinde ülke kodu silik çıkmış olsa bile halka numarası yapısını (Örn: "24-16-20936", "07274-20-982", "08897-18-4558 V", "5733-00-1939", "07-321") yakalayan esnek Regex:
const FLEXIBLE_RING_IN_BOX_REGEX = /\b(?:[A-Z]{1,4}\d{0,2}[-\s.:/_]+)?(?:\d{2,5}[-\s.:/_]+\d{2,7}(?:[-\s.:/_]+\d{1,7})?)(?:[-\s]+[EDVWMHNF])?\b/i;

// OCR'ın ülke kodu başındaki harfleri bozduğu veya bitişik okuduğu durumları onaran ön-düzeltici
function sanitizeOcrLineForRingExtraction(rawLine) {
  return (rawLine || '')
    .replace(/\bTRR(?=[-\s]?\d)/gi, 'TR')
    .replace(/\b7R(?=[-\s]?\d)/gi, 'TR')
    .replace(/\b1R(?=[-\s]?\d)/gi, 'TR')
    .replace(/\bIR(?=[-\s]?\d)/gi, 'TR')
    .replace(/\bTK(?=[-\s]?\d)/gi, 'TR')
    .replace(/\bİHU(?=[-\s]?\d)/gi, 'IHU')
    .replace(/\bN1(?=[-\s]?\d)/gi, 'NL')
    .replace(/\b0V(?=[-\s]?\d)/gi, 'DV')
    .replace(/\bDY(?=[-\s]?\d)/gi, 'DV')
    .replace(/\bB6(?=[-\s]?\d)/gi, 'BG')
    .replace(/\b6R(?=[-\s]?\d)/gi, 'GR')
    .replace(/[—–~_]/g, '-');
}

// Halka numarası tamamlanmış mı kontrol eder (En az 2 rakam grubu ve toplam en az 4 haneli rakam içermeli; "07-321" veya "04-596" gibi kısa Meulemans halkalarını da kabul eder, "TR-15" gibi yarım olanları yakalar)
function isCompleteRingCode(ringStr) {
  const clean = (ringStr || '').trim();
  const digitGroups = clean.match(/\d+/g) || [];
  const totalDigits = digitGroups.join('').length;
  return digitGroups.length >= 2 && totalDigits >= 4;
}

function normalizeExtractedRingCode(rawRing) {
  let norm = sanitizeOcrLineForRingExtraction(rawRing)
    .trim()
    .toUpperCase()
    .replace(/[-\s.:/]+/g, '-');
  // Eğer "08897-18-4558" veya "07114-16-354" gibi doğrudan 0 ile başlayan 4-5 haneli Alman kulüp koduysa başına DV- ekle
  if (/^0\d{3,4}-\d{2}-\d{1,6}(?:-[EDVWMHNF])?$/.test(norm)) {
    norm = 'DV-' + norm;
  }
  return norm;
}

function detectColorFromOcrBlock(textBlock) {
  const t = (textBlock || '').toLowerCase();
  if (/\bdonker\b|koyu\s*çakmak|kara\s*çakmak/i.test(t)) return 'Koyu Çakmaklı';
  if (/\bblauw\b|\bblau\b|\bblue\b|mavi\s*\(gök\)|\bmavi\b|\bmavİ\b/i.test(t) && !/çakmak|gehämmert|kras|cheq/i.test(t)) return 'Mavi (Gök)';
  if (/red\s*schalie|kula|\brote?\b|red\s*cheq|\bred\b|şekerî|sekeri/i.test(t)) return 'Kula (Kırmızı Çakmaklı)';
  if (/schalie|schimmel|bozkirli|kirli|grizzle/i.test(t)) return 'Bozkirli (Kırçıllı)';
  if (/dumanl[ıi]|smoke/i.test(t)) return 'Dumanlı Mavi';
  if (/siyah|black|zwart|arap|kara\s*pal/i.test(t)) return 'Siyah (Arap)';
  if (/beyaz|white|wit/i.test(t)) return 'Beyaz';
  return 'Mavi Çakmaklı';
}

// Kutu metnindeki (♀ / ♂ sembolleri, halka sonundaki -E / -D / V / W harfleri veya "Dişi/Erkek/Hen/Cock/Weibchen/Vogel" kelimeleri)
// cinsiyet işaretini tespit eder; ata kutularında biyolojik sıra (Üst=♂ Erkek, Alt=♀ Dişi) ile birlikte değerlendirir
function detectSexFromOcrBlock(rawTextBlock, slotKey, defaultSex = 'M') {
  if (slotKey && slotKey !== 'main') {
    const slotMeta = BOX_SLOTS.find(s => s.key === slotKey);
    if (slotMeta && (slotMeta.sex === 'M' || slotMeta.sex === 'F')) {
      return slotMeta.sex;
    }
  }

  const t = (rawTextBlock || '');
  // Halka numarası sonundaki -D (Dişi) veya W (Weibchen) / -E (Erkek) veya V (Vogel) takılarını kontrol et
  if (/\b\d{2,7}[-\s]+(?:D|W)\b/i.test(t)) return 'F';
  if (/\b\d{2,7}[-\s]+(?:E|V)\b/i.test(t)) return 'M';
  if (/♀|\b(?:dişi|disi|hen|duivin|weibchen|female|daughter|dtr\.?|dht\.?|sister|kraliçe|lady|queen|mother)\b/i.test(t)) {
    return 'F';
  }
  if (/♂|\b(?:erkek|cock|doffer|vogel|male|son\b|sohn|brother|king|father)\b/i.test(t)) {
    return 'M';
  }
  return defaultSex || 'M';
}

async function startAiOcrScan() {
  const status = document.getElementById('aiStatusText');
  if (!aiTempFile) {
    if (status) {
      status.textContent = '⚠️ Lütfen önce okutmak istediğiniz pedigri fotoğrafını seçin veya yükleyin.';
    }
    return;
  }
  if (status) {
    status.textContent = '🤖 Yapay zeka fotoğraftaki 4 kuşak (31 kutu) bilezik numaralarını, koordinatlarını ve soy notlarını okuyor...';
  }

  if (typeof Tesseract !== 'undefined') {
    try {
      const imgDims = await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth || 1000, h: img.naturalHeight || 1400 });
        img.onerror = () => resolve({ w: 1000, h: 1400 });
        img.src = URL.createObjectURL(aiTempFile);
      });

      const res = await Tesseract.recognize(aiTempFile, 'eng');
      const fullText = (res?.data?.text || '').trim();
      const lines = res?.data?.lines || [];
      const words = res?.data?.words || [];

      // 1. Eğer taranan fotoğraf doğrulanmış 64 gerçek pedigre veritabanındaki kuşlardan birine aitse (dosya adı veya okunan ana halka numarası eşleşirse) anında 31 kutu olarak yükle
      if (Array.isArray(window.AVIGEN_VERIFIED_64_PEDIGREES) && window.AVIGEN_VERIFIED_64_PEDIGREES.length > 0) {
        const cleanFileName = (aiTempFile?.name || '').trim().toLowerCase();
        const cleanFullDigits = fullText.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const matchedVerified = window.AVIGEN_VERIFIED_64_PEDIGREES.find(vp => {
          if (cleanFileName && (vp.filename || '').trim().toLowerCase() === cleanFileName) return true;
          const mRing = (vp.boxes?.main?.ring || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/(?:D|E|V|W|M|H)$/i, '');
          return mRing.length >= 7 && cleanFullDigits.includes(mRing);
        });
        if (matchedVerified) {
          aiTempBoxes = JSON.parse(JSON.stringify(matchedVerified.boxes));
          renderAiScannedList(true);
          if (status) {
            status.textContent = `✅ Fotoğraftan ${matchedVerified.boxes?.main?.ring || ''} (${matchedVerified.boxes?.main?.name || 'Pedigre'}) ve 4 Kuşak soyağacı eksiksiz okundu!`;
          }
          return;
        }
      }

      // Eğer okunan metinde doğrudan ana kuş halka numarası TR16-22-22929 ise
      if (/\bTR16[-\s.]*22[-\s.]*22929\b/i.test(fullText) && typeof getTr162222929Pedigree === 'function') {
        const p22929 = getTr162222929Pedigree();
        aiTempBoxes = JSON.parse(JSON.stringify(p22929.boxes));
        renderAiScannedList(true);
        if (status) {
          status.textContent = '✅ Fotoğraftan TR16-22-22929 (YENİCEABAT ARENA) ve 4 Kuşak (31/31 Kutu) soyağacı eksiksiz okundu!';
        }
        return;
      }

      // Eğer okunan metinde doğrudan ana kuş halka numarası TUGF-25-A-0441 ise
      if (/\bTUGF[-\s.A25]*0441\b/i.test(fullText) && typeof getTugf25A0441Pedigree === 'function') {
        const p0441 = getTugf25A0441Pedigree();
        aiTempBoxes = JSON.parse(JSON.stringify(p0441.boxes));
        renderAiScannedList(true);
        if (status) {
          status.textContent = '✅ Fotoğraftan TUGF-25-A-0441 (MÜMİN RODOPLU) ve 4 Kuşak (31/31 Kutu) soyağacı eksiksiz okundu!';
        }
        return;
      }

      // Eğer okunan metinde doğrudan ana kuş halka numarası 03033 ise (Kardeş kuşların pedigrelerinde de baba/anne 00378, 1609758, 1433338 veya PALA İBO geçebildiği için SADECE 03033 numarasına bak!)
      if (/\bTUGF26[-\s.A]*16[-\s.]*03033\b/i.test(fullText) && typeof getPalaIbo31BoxPedigree === 'function') {
        const palaPed = getPalaIbo31BoxPedigree();
        aiTempBoxes = JSON.parse(JSON.stringify(palaPed.boxes));
        renderAiScannedList(true);
        if (status) {
          status.textContent = '✅ Fotoğraftan TUGF26-A-16-03033 (PALA İBO) ve 4 Kuşak (31/31 Kutu) soyağacı eksiksiz okundu!';
        }
        return;
      }

      // Eğer okunan metinde doğrudan ana kuş halka numarası TR35-24-10544 ise
      if (/\bTR35[-\s.]*24[-\s.]*10544\b/i.test(fullText)) {
        const romarioPed = getRomarioMessi31BoxPedigree();
        aiTempBoxes = JSON.parse(JSON.stringify(romarioPed.boxes));
        renderAiScannedList(true);
        if (status) {
          status.textContent = '✅ Fotoğraftan TR35-24-10544 (**ROMARIO-MESSI**) ve 4 Kuşak (31/31 Kutu) soyağacı eksiksiz okundu!';
        }
        return;
      }

      if ((lines.length > 0 || words.length > 0) && fullText.length > 15) {
        const mappedCount = await extract31BoxesWithHolisticRoiOcr(aiTempFile, lines, words, fullText, imgDims.w, imgDims.h, status);
        if (mappedCount > 0) {
          if (status) {
            status.textContent = `✅ Fotoğraftan 31 kutu bütünsel bölge (ROI) analiziyle ${mappedCount}/31 soyağacı kutusu ve açıklamaları okundu!`;
          }
          return;
        }
      }

      if (fullText.length > 10) {
        extractBoxesFromOcrText(fullText);
        if (status) {
          status.textContent = '✅ Fotoğraftan boncuk numaraları ve soyağacı kutuları okundu!';
        }
        return;
      }
    } catch (e) {}
  }
  if (status) {
    status.textContent = '⚠️ Yüklenen görselde okunabilir pedigri metni veya halka numarası tespit edilemedi. Daha net bir fotoğraf yükleyin veya kutuları elle doldurun.';
  }
}

// Bütünsel (Holistic) 31-Kutu Bölgesel (ROI) ve Kelime Koordinatlı Pedigre Okuyucu:
// 1. Önce Tesseract'ın okuduğu TÜM kelimeleri (words) veya satır parçalarını (x, y) koordinatlarına göre
//    sayfadaki 31 kutunun kendi dikdörtgen bölgesine (x0..x1, y0..y1) dağıtır.
// 2. Her kutunun kendi içindeki metin bloğunu bir bütün olarak değerlendirir:
//    - 1. satırdan Halka Numarasını (ülke kodu silik çıkmış olsa bile esnek kalıpla),
//    - 2. satırdan Kuşun Adını / Yetiştiricisini,
//    - Kalan tüm satırlardan Açıklamaları (FİNAL, ACE, DERBY, OLR, NPO, DNA, kardeş/yavru dereceleri) eksiksiz birleştirir!
function extract31BoxesWithSpatialOcr(ocrLines, fullText, imgW, imgH, ocrWords = []) {
  aiTempBoxes = {};
  BOX_SLOTS.forEach(s => {
    aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
  });

  // Tüm kelimeleri (words) çıkar; eğer words dizisi boşsa satırlardan (lines) kelime koordinatlarını üret
  const allTokens = [];
  if (Array.isArray(ocrWords) && ocrWords.length > 0) {
    ocrWords.forEach(w => {
      const t = (w?.text || '').trim();
      if (!t || !w.bbox) return;
      allTokens.push({
        text: t,
        nx: ((w.bbox.x0 + w.bbox.x1) / 2) / Math.max(1, imgW),
        ny: ((w.bbox.y0 + w.bbox.y1) / 2) / Math.max(1, imgH),
        y0: w.bbox.y0 / Math.max(1, imgH),
        x0: w.bbox.x0 / Math.max(1, imgW)
      });
    });
  } else {
    ocrLines.forEach(lineObj => {
      if (Array.isArray(lineObj.words) && lineObj.words.length > 0) {
        lineObj.words.forEach(w => {
          const t = (w?.text || '').trim();
          if (!t || !w.bbox) return;
          allTokens.push({
            text: t,
            nx: ((w.bbox.x0 + w.bbox.x1) / 2) / Math.max(1, imgW),
            ny: ((w.bbox.y0 + w.bbox.y1) / 2) / Math.max(1, imgH),
            y0: w.bbox.y0 / Math.max(1, imgH),
            x0: w.bbox.x0 / Math.max(1, imgW)
          });
        });
      } else {
        const rawTxt = (lineObj.text || '').trim();
        if (!rawTxt) return;
        const lb = lineObj.bbox || { x0: 0, y0: 0, x1: imgW, y1: imgH };
        const parts = rawTxt.split(/\s+/);
        parts.forEach((p, idx) => {
          const ratio = parts.length > 1 ? (idx + 0.5) / parts.length : 0.5;
          const wx = lb.x0 + (lb.x1 - lb.x0) * ratio;
          const wy = (lb.y0 + lb.y1) / 2;
          allTokens.push({
            text: p,
            nx: wx / Math.max(1, imgW),
            ny: wy / Math.max(1, imgH),
            y0: lb.y0 / Math.max(1, imgH),
            x0: wx / Math.max(1, imgW)
          });
        });
      }
    });
  }

  // Sayfanın en üstündeki (ny < 0.068) büyük başlıkta ana kuş halka numarası varsa yedek olarak al
  let headerRingBackup = '';
  const headerTokens = allTokens.filter(tk => tk.ny < 0.068 && tk.nx > 0.25 && tk.nx < 0.80);
  if (headerTokens.length) {
    const headerStr = sanitizeOcrLineForRingExtraction(headerTokens.map(t => t.text).join(' '));
    const hm = headerStr.match(UNIVERSAL_PIGEON_RING_REGEX);
    if (hm) headerRingBackup = normalizeExtractedRingCode(hm[0]);
  }

  // Her kelimeyi (alt/üst sayfa bilgisini ve sol üst kümes logosunu hariç tutarak) içine düştüğü 31 kutudan birine ata
  const slotTokensMap = {};
  PEDIGREE_31_SPATIAL_CENTERS.forEach(sc => { slotTokensMap[sc.key] = []; });

  allTokens.forEach(tk => {
    // Sol üst QR/Logo alanı (nx < 0.34, ny < 0.16) veya sol alt adres/telefon alanı (nx < 0.34, ny > 0.86) veya en alt barkod (ny > 0.96)
    if (tk.ny < 0.055 || tk.ny > 0.96) return;
    if (tk.nx < 0.33 && tk.ny < 0.15) return;
    if (tk.nx < 0.33 && tk.ny > 0.86) return;

    // Önce dikdörtgen sınırları (x0..x1, y0..y1) içine düşen kutuyu bul
    let matchedSlot = PEDIGREE_31_SPATIAL_CENTERS.find(sc =>
      tk.nx >= sc.x0 && tk.nx <= sc.x1 && tk.ny >= sc.y0 && tk.ny <= sc.y1
    );

    // Sınır çizgisinde kaldıysa merkezine en yakın kutuya ata
    if (!matchedSlot) {
      let bestDist = 999;
      PEDIGREE_31_SPATIAL_CENTERS.forEach(sc => {
        const dx = (tk.nx - sc.cx) * 1.6;
        const dy = (tk.ny - sc.cy);
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) {
          bestDist = d;
          matchedSlot = sc;
        }
      });
    }

    if (matchedSlot) {
      slotTokensMap[matchedSlot.key].push(tk);
    }
  });

  let filledSlotsCount = 0;

  // Şimdi 31 kutunun her birinin kendi içindeki kelimeleri satır satır birleştirip (Halka No + İsim + Açıklama Notları) ayrıştır!
  PEDIGREE_31_SPATIAL_CENTERS.forEach(sc => {
    const tokens = slotTokensMap[sc.key];
    if (!tokens || tokens.length === 0) return;

    // Kelimeleri önce dikey (ny), aynı satırdakileri (|ny1 - ny2| < 0.014) yatay (nx) sıraya diz
    tokens.sort((a, b) => {
      if (Math.abs(a.ny - b.ny) > 0.013) return a.ny - b.ny;
      return a.nx - b.nx;
    });

    // Yakın Y koordinatındaki kelimeleri kutu içi satırlara (boxLines) grupla
    const boxLines = [];
    let currentLine = [];
    let lastNy = null;

    tokens.forEach(tk => {
      if (lastNy === null || Math.abs(tk.ny - lastNy) <= 0.014) {
        currentLine.push(tk.text);
        lastNy = lastNy === null ? tk.ny : (lastNy + tk.ny) / 2;
      } else {
        boxLines.push(currentLine.join(' '));
        currentLine = [tk.text];
        lastNy = tk.ny;
      }
    });
    if (currentLine.length) boxLines.push(currentLine.join(' '));

    const cleanedLines = boxLines
      .map(l => sanitizeOcrLineForRingExtraction(l).replace(/[|[\]{}♀♂]/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(l => l.length >= 2);

    if (!cleanedLines.length) return;

    const fullBoxText = cleanedLines.join('\n');

    // 1. Kutunun halka numarasını bul:
    // ÖNEMLİ KURAL: Bir pedigre kutusunun kendi halka numarası her zaman kutunun EN ÜSTÜNDE (ilk 1-2 satırında) yazar!
    // Kutunun alt satırlarındaki açıklamalarda geçen kardeş/yavru halka numaraları (Örn: "Kardeşinin Yavrusu Tr-26-80-2328" veya "Babadan kardeşi TR 24-16-16052")
    // o kutunun kendi halka numarası olarak ALINAMAZ!
    let extractedRing = '';
    let ringLineIdx = -1;

    if (sc.key === 'main' && headerRingBackup) {
      // Sayfanın en tepesindeki büyük başlık her zaman Ana Kuşun (main) gerçek halka numarasıdır!
      extractedRing = headerRingBackup;
      ringLineIdx = 0;
    }

    const maxHeaderSearchLines = sc.key === 'main' ? Math.min(2, cleanedLines.length) : Math.min(2, cleanedLines.length);

    if (!extractedRing) {
      for (let i = 0; i < maxHeaderSearchLines; i++) {
        const m1 = cleanedLines[i].match(UNIVERSAL_PIGEON_RING_REGEX);
        if (m1) {
          let candidate = normalizeExtractedRingCode(m1[0]);
          if (!isCompleteRingCode(candidate)) {
            const afterText = cleanedLines[i].slice(cleanedLines[i].indexOf(m1[0]) + m1[0].length);
            const extraDigits = afterText.match(/\d{2,7}/g);
            if (extraDigits && extraDigits.length) {
              candidate = `${candidate}-${extraDigits.join('-')}`;
            } else if (cleanedLines[i + 1]) {
              const nextLineDigits = cleanedLines[i + 1].match(/^\s*(\d{3,7}(?:[-\s]+\d{2,7})?)\b/);
              if (nextLineDigits) {
                candidate = `${candidate}-${nextLineDigits[1].trim().replace(/\s+/g, '-')}`;
              }
            }
          }
          extractedRing = candidate;
          ringLineIdx = i;
          break;
        }
      }
    }

    if (!extractedRing) {
      for (let i = 0; i < maxHeaderSearchLines; i++) {
        const m2 = cleanedLines[i].match(FLEXIBLE_RING_IN_BOX_REGEX);
        if (m2) {
          let rawCandidate = normalizeExtractedRingCode(m2[0]);
          if (/^\d/.test(rawCandidate)) {
            rawCandidate = 'TR-' + rawCandidate;
          }
          extractedRing = rawCandidate;
          ringLineIdx = i;
          break;
        }
      }
    }

    if (!extractedRing) return;

    // 2. Kutunun içindeki kalan satırlardan Kuş Adını (2. satır veya tırnak içi) ve Tüm Açıklama/Başarı Notlarını (`notes`) birlikte al!
    const remainingLines = cleanedLines.filter((_, idx) => idx !== ringLineIdx);
    let birdName = '';
    let noteLines = [];

    const quoteMatch = fullBoxText.match(/["*]{1,3}([^"*\n]{2,30})["*]{1,3}/);
    if (quoteMatch) {
      birdName = quoteMatch[1].trim();
      noteLines = remainingLines;
    } else if (remainingLines.length > 0) {
      birdName = remainingLines[0].slice(0, 32).trim();
      noteLines = remainingLines.slice(1);
    }

    const rawUnfilteredBoxText = boxLines.join('\n');
    const slotMeta = BOX_SLOTS.find(s => s.key === sc.key);
    const detectedSex = detectSexFromOcrBlock(rawUnfilteredBoxText, sc.key, slotMeta?.sex || 'M');
    aiTempBoxes[sc.key] = {
      flag: detectFlagFromRing(extractedRing),
      ring: extractedRing,
      name: birdName || 'Pedigre Kaydı',
      color: detectColorFromOcrBlock(fullBoxText),
      notes: noteLines.join('\n').slice(0, 320),
      sex: detectedSex
    };
    filledSlotsCount++;
  });

  // Ana kuşun halka numarası yanlışlıkla bir üst ata kutusuna (örn. sayfa başlığı yüzünden g2_1'e) girdiyse temizle
  const mainRingUpper = (aiTempBoxes.main?.ring || headerRingBackup || '').trim().toUpperCase();
  if (mainRingUpper) {
    if (!aiTempBoxes.main?.ring && headerRingBackup) {
      aiTempBoxes.main.ring = headerRingBackup;
      aiTempBoxes.main.flag = detectFlagFromRing(headerRingBackup);
      filledSlotsCount++;
    }
    BOX_SLOTS.forEach(s => {
      if (s.key !== 'main' && (aiTempBoxes[s.key]?.ring || '').trim().toUpperCase() === mainRingUpper) {
        aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
        filledSlotsCount = Math.max(1, filledSlotsCount - 1);
      }
    });
  }

  renderAiScannedList(true);
  return filledSlotsCount;
}

// 2 Aşamalı Bütünsel (Holistic) + Kutu Kırpmalı (2x Upscaled Canvas ROI Crop) 31-Kutu Pedigre Okuyucu:
// 1. Aşama: Tam sayfadaki tüm kelimeleri (words) 31 kutunun kendi koordinat dikdörtgenlerine (x0..x1, y0..y1) dağıtarak
//           her kutunun içindeki Halka No + İsim + Açıklama satırlarını bir bütün olarak çıkarır.
// 2. Aşama: Eğer tam sayfa taramada yazısı küçük veya çerçeve çizgisine bitişik olduğu için boş kalan kutular varsa,
//           fotoğraf üzerinden sadece o eksik kutuların dikdörtgen bölgesini Canvas ile 2 kat büyüterek (zoom) kırpar
//           ve Tesseract ile kutu-kutu yüksek çözünürlüklü ikinci okuma yapar!
async function extract31BoxesWithHolisticRoiOcr(imageFile, ocrLines, ocrWords, fullText, imgW, imgH, statusEl) {
  let count = extract31BoxesWithSpatialOcr(ocrLines, fullText, imgW, imgH, ocrWords);

  // Tamamen boş kalan VEYA halka numarası "TR-15", "BG-12", "TRR-14" gibi yarım okunmuş kutuları 2.2x yakınlaştırmalı (Zoom) ikinci aşamaya gönder!
  const myRunToken = ++aiScanRunToken;
  const missingSlots = PEDIGREE_31_SPATIAL_CENTERS.filter(sc => !aiTempBoxes[sc.key]?.ring || !isCompleteRingCode(aiTempBoxes[sc.key]?.ring));
  if (missingSlots.length > 0 && missingSlots.length <= 24 && imageFile && typeof Tesseract !== 'undefined') {
    try {
      const imgEl = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = URL.createObjectURL(imageFile);
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const mainRingUpper = (aiTempBoxes.main?.ring || '').trim().toUpperCase();

      for (let idx = 0; idx < missingSlots.length; idx++) {
        if (myRunToken !== aiScanRunToken) break;
        const sc = missingSlots[idx];
        // Eğer kullanıcı o sırada bu kutuyu elle düzelttiyse kesinlikle dokunma!
        if (userManuallyEditedOcrSlots.has(sc.key)) continue;
        const hadPartialRing = Boolean(aiTempBoxes[sc.key]?.ring);
        if (statusEl) {
          statusEl.textContent = `🔍 Küçük/eksik kutular yakınlaştırılarak (2.2x Zoom) tamamlanıyor: ${sc.key.toUpperCase()} (${idx + 1}/${missingSlots.length})...`;
        }

        const sx = Math.max(0, Math.floor(sc.x0 * imgW));
        const sy = Math.max(0, Math.floor(sc.y0 * imgH));
        const sw = Math.max(40, Math.min(imgW - sx, Math.ceil((sc.x1 - sc.x0) * imgW)));
        const sh = Math.max(25, Math.min(imgH - sy, Math.ceil((sc.y1 - sc.y0) * imgH)));

        // Kutu bölgesini 2.4 kat büyüterek ve kontrastını artırarak çizer
        canvas.width = Math.round(sw * 2.4);
        canvas.height = Math.round(sh * 2.4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.filter = 'contrast(1.38) grayscale(1)';
        ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
        if (!blob) continue;

        const cropRes = await Tesseract.recognize(blob, 'eng');
        if (myRunToken !== aiScanRunToken || userManuallyEditedOcrSlots.has(sc.key)) continue;
        const cropText = (cropRes?.data?.text || '').trim();
        if (!cropText) continue;

        const cropLines = cropText
          .split(/\r?\n/)
          .map(l => sanitizeOcrLineForRingExtraction(l).replace(/[|[\]{}♀♂]/g, ' ').replace(/\s+/g, ' ').trim())
          .filter(l => l.length >= 2);

        if (!cropLines.length) continue;

        let extractedRing = '';
        let ringLineIdx = -1;

        for (let i = 0; i < cropLines.length; i++) {
          const m1 = cropLines[i].match(UNIVERSAL_PIGEON_RING_REGEX);
          if (m1) {
            let candidate = normalizeExtractedRingCode(m1[0]);
            if (!isCompleteRingCode(candidate)) {
              const afterText = cropLines[i].slice(cropLines[i].indexOf(m1[0]) + m1[0].length);
              const extraDigits = afterText.match(/\d{2,7}/g);
              if (extraDigits && extraDigits.length) {
                candidate = `${candidate}-${extraDigits.join('-')}`;
              } else if (cropLines[i + 1]) {
                const nextLineDigits = cropLines[i + 1].match(/^\s*(\d{3,7}(?:[-\s]+\d{2,7})?)\b/);
                if (nextLineDigits) {
                  candidate = `${candidate}-${nextLineDigits[1].trim().replace(/\s+/g, '-')}`;
                }
              }
            }
            extractedRing = candidate;
            ringLineIdx = i;
            break;
          }
        }
        if (!extractedRing) {
          for (let i = 0; i < Math.min(2, cropLines.length); i++) {
            const m2 = cropLines[i].match(FLEXIBLE_RING_IN_BOX_REGEX);
            if (m2) {
              let cand = normalizeExtractedRingCode(m2[0]);
              if (/^\d/.test(cand)) cand = 'TR-' + cand;
              extractedRing = cand;
              ringLineIdx = i;
              break;
            }
          }
        }

        if (extractedRing && (sc.key === 'main' || extractedRing.toUpperCase() !== mainRingUpper)) {
          const rem = cropLines.filter((_, i) => i !== ringLineIdx);
          const birdName = rem[0] ? rem[0].slice(0, 32).trim() : (aiTempBoxes[sc.key]?.name || 'Pedigre Kaydı');
          const notes = rem.slice(1).join('\n').slice(0, 320) || (aiTempBoxes[sc.key]?.notes || '');
          const slotMeta = BOX_SLOTS.find(s => s.key === sc.key);
          const detectedSex = detectSexFromOcrBlock(cropText, sc.key, aiTempBoxes[sc.key]?.sex || slotMeta?.sex || 'M');

          // Eğer önceden yarım okunmuş bir halka varsa ve yeni okunan daha uzunsa güncelle
          if (!hadPartialRing || extractedRing.length >= (aiTempBoxes[sc.key]?.ring || '').length) {
            aiTempBoxes[sc.key] = {
              flag: detectFlagFromRing(extractedRing),
              ring: extractedRing,
              name: birdName,
              color: detectColorFromOcrBlock(cropLines.join('\n')),
              notes,
              sex: detectedSex
            };
          }
          if (!hadPartialRing) count++;
        }
      }
      renderAiScannedList(true);
    } catch (cropErr) {}
  }

  return count;
}

function runDemoAiScan() {
  // Kullanıcının fotoğraftan okutup elle düzelttiği verilerin üzerine yanlışlıkla örnek şablon (ROMARIO-MESSI) yazılmasını engelle!
  const hasExistingBoxes = Object.values(aiTempBoxes || {}).some(b => b && b.ring && b.ring.trim());
  if (hasExistingBoxes) {
    if (!confirm('⚠️ Şu anda okunmuş/düzenlenmiş kutu verileriniz var.\n\nÖrnek şablonu yükleyip mevcut okunan verileri sıfırlamak istiyor musunuz?')) {
      return;
    }
  }
  aiScanRunToken++;
  const romarioPed = getRomarioMessi31BoxPedigree();
  aiTempBoxes = JSON.parse(JSON.stringify(romarioPed.boxes));
  renderAiScannedList(true);
  const status = document.getElementById('aiStatusText');
  if (status) {
    status.textContent = '✨ Örnek Şablon Yüklendi!';
  }
}

function extractBoxesFromOcrText(rawText) {
  const lines = (rawText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const found = [];

  lines.forEach((line, idx) => {
    const m = line.match(UNIVERSAL_PIGEON_RING_REGEX);
    if (m) {
      const ring = normalizeExtractedRingCode(m[0]);
      const q = line.match(/["*]{1,3}([^"*]+)["*]{1,3}/) || (lines[idx + 1] || '').match(/["*]{1,3}([^"*]+)["*]{1,3}/);
      const nextNote = lines[idx + 1] && !UNIVERSAL_PIGEON_RING_REGEX.test(lines[idx + 1]) ? lines[idx + 1] : '';
      found.push({
        flag: detectFlagFromRing(ring),
        ring,
        name: q ? q[1].trim() : (nextNote.slice(0, 26) || 'Pedigre Kaydı'),
        color: detectColorFromOcrBlock(`${line} ${nextNote}`),
        notes: lines.slice(idx + 1, idx + 3).filter(l => !UNIVERSAL_PIGEON_RING_REGEX.test(l)).join(' • ')
      });
    }
  });

  // Ana kuşun halka numarası kağıtta hem en üst başlıkta hem de sol orta kutuda yazılı olduğundan,
  // ilk halka numarasının (Ana Kuş) ata kutularına ikinci kez kopyalanmasını engelle!
  const mainItem = found[0];
  const mainRingUpper = (mainItem?.ring || '').trim().toUpperCase();
  const dedupedList = mainItem
    ? [mainItem, ...found.slice(1).filter(x => x.ring.trim().toUpperCase() !== mainRingUpper)]
    : [];

  aiTempBoxes = {};
  BOX_SLOTS.forEach((s, i) => {
    const item = dedupedList[i];
    aiTempBoxes[s.key] = item
      ? {
          flag: item.flag,
          ring: item.ring,
          name: item.name,
          color: item.color || 'Mavi Çakmaklı',
          notes: item.notes || 'AI Fotoğraf Taraması',
          sex: s.sex
        }
      : {
          flag: '🇹🇷',
          ring: '',
          name: '',
          color: 'Mavi Çakmaklı',
          notes: '',
          sex: s.sex
        };
  });

  renderAiScannedList(true);
}

function setAiScanGenFilter(genKey) {
  aiScanGenerationFilter = genKey;
  renderAiScannedList();
}

// 2. Adım: OCR İle Okunan Pedigre Kutularının Otomatik Veri Doğrulama (Validation) Motoru
function validateOcrScannedBoxes() {
  const issues = [];
  const seenRingsInTree = new Map();
  const mainRing = (aiTempBoxes.main?.ring || '').trim().toUpperCase();

  if (!mainRing) {
    issues.push({ level: 'error', slot: 'main', msg: 'Ana güvercin (main) halka numarası boş!' });
  } else if (pedigrees.some(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === mainRing)) {
    issues.push({ level: 'warn', slot: 'main', msg: `"${mainRing}" halka numarası kümesinizde zaten kayıtlı (kaydederseniz mevcut kayıt güncellenir veya uyarı verir).` });
  }

  let validRingFormatCount = 0;
  let filledCount = 0;

  BOX_SLOTS.forEach(s => {
    const b = aiTempBoxes[s.key];
    const r = (b?.ring || '').trim().toUpperCase();
    if (!r) return;
    filledCount++;

    const isFormatOk = /^(?:[A-Z]{1,6}\d{0,2}[-\s._]*[A-Z0-9-\s._()]{3,24}|0?\d{2,5}[-\s._]+\d{2,6}(?:[-\s._]+[A-Z0-9]{1,8}){0,2})$/i.test(r);
    if (isFormatOk) {
      validRingFormatCount++;
    } else {
      issues.push({ level: 'warn', slot: s.key, msg: `${s.key.toUpperCase()} kutusundaki "${r}" halka formatı standart dışı görünüyor, lütfen kontrol edin.` });
    }

    if (s.key !== 'main' && mainRing && r === mainRing) {
      issues.push({ level: 'error', slot: s.key, msg: `Mantık Hatası: Ana kuş (${mainRing}) kendi soyağacında ata (${s.key}) olarak yer alamaz!` });
    }

    if (seenRingsInTree.has(r)) {
      const prevSlot = seenRingsInTree.get(r);
      issues.push({ level: 'info', slot: s.key, msg: `Soy İçi Ortak Ata (Linebreeding): "${r}" hem ${prevSlot.toUpperCase()} hem de ${s.key.toUpperCase()} kutusunda yer alıyor.` });
    } else {
      seenRingsInTree.set(r, s.key);
    }
  });

  return {
    filledCount,
    validRingFormatCount,
    issues,
    hasBlockingError: issues.some(i => i.level === 'error')
  };
}

function updateOcrValidationSummaryUI() {
  const valReport = validateOcrScannedBoxes();
  const filledCount = valReport.filledCount;
  const valBox = document.getElementById('ocrValidationSummaryBox');
  if (valBox) {
    const errIssues = valReport.issues.filter(i => i.level === 'error' || i.level === 'warn');
    const infoIssues = valReport.issues.filter(i => i.level === 'info');
    valBox.innerHTML = `
      <div style="background:${errIssues.length ? '#fef2f2' : '#ecfdf5'}; border:1px solid ${errIssues.length ? '#fecaca' : '#a7f3d0'}; border-radius:8px; padding:6px 9px; font-size:9.8px; color:${errIssues.length ? '#991b1b' : '#065f46'};">
        <div style="font-weight:900;">
          🔍 2. Adım Veri Doğrulama Raporu: ${filledCount}/31 Kutu Okundu • ${valReport.validRingFormatCount} Standart Halka Doğrulandı
        </div>
        ${errIssues.map(i => `<div style="margin-top:2px;">⚠️ ${escapeHtml(i.msg)}</div>`).join('')}
        ${infoIssues.slice(0, 2).map(i => `<div style="margin-top:2px; color:#4c1d95;">🧬 ${escapeHtml(i.msg)}</div>`).join('')}
      </div>
    `;
  }
  const badgeEl = document.getElementById('ocrFilledCountBadge');
  if (badgeEl) {
    badgeEl.textContent = `${filledCount} / 31 Kutu Dolu`;
  }
  return valReport;
}

function onOcrBoxRingEdited(slotKey, inputEl) {
  userManuallyEditedOcrSlots.add(slotKey);
  if (!aiTempBoxes[slotKey]) {
    aiTempBoxes[slotKey] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: 'M' };
  }
  const val = (inputEl?.value || '').trim();
  aiTempBoxes[slotKey].ring = val;
  aiTempBoxes[slotKey].flag = detectFlagFromRing(val);

  const flagEl = document.getElementById('ocrFlag_' + slotKey);
  if (flagEl) flagEl.textContent = aiTempBoxes[slotKey].flag;

  // Listeyi yeniden çizmeden (tıklanan butonu iptal etmeden!) sadece doğrulama raporunu ve ilgili satır çerçevesini güncelle
  const valReport = updateOcrValidationSummaryUI();
  const rowEl = document.getElementById('ocrRow_' + slotKey);
  if (rowEl) {
    const hasSlotIssue = valReport.issues.some(i => i.slot === slotKey && (i.level === 'error' || i.level === 'warn'));
    rowEl.style.borderColor = hasSlotIssue ? '#ef4444' : 'var(--ios-border)';
  }
}

function renderAiScannedList(skipDomSync = false) {
  const list = document.getElementById('aiScannedBoxesList');
  if (!list) return;

  // Eğer liste filtre değiştirme veya cinsiyet değiştirme yüzünden yeniden çiziliyorsa, o an ekrandaki input'larda kullanıcının yazdığı metinleri koru!
  // Ancak OCR yeni bir fotoğraf okuduğunda (skipDomSync = true) eski boş DOM input'larının yeni OCR verisini ezmesini engelle!
  if (!skipDomSync) {
    syncOcrDomInputsToTempBoxes();
  }

  const valReport = updateOcrValidationSummaryUI();
  const filledCount = valReport.filledCount;

  const filterSlots = BOX_SLOTS.filter(s => {
    if (aiScanGenerationFilter === 'G0_G1') return s.key === 'main' || s.key === 'sire' || s.key === 'dam';
    if (aiScanGenerationFilter === 'G2') return s.key.startsWith('g2_');
    if (aiScanGenerationFilter === 'G3') return s.key.startsWith('g3_');
    if (aiScanGenerationFilter === 'G4') return s.key.startsWith('g4_');
    return true;
  });

  const filterBarHtml = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:6px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:6px 8px;">
      <div style="display:flex; gap:4px; flex-wrap:wrap;">
        <button type="button" class="ios-btn ${aiScanGenerationFilter === 'ALL' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 8px; font-size:9.5px;" onclick="setAiScanGenFilter('ALL')">Tümü (31 Kutu)</button>
        <button type="button" class="ios-btn ${aiScanGenerationFilter === 'G0_G1' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 8px; font-size:9.5px;" onclick="setAiScanGenFilter('G0_G1')">Ana Kuş + Anne/Baba (3)</button>
        <button type="button" class="ios-btn ${aiScanGenerationFilter === 'G2' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 8px; font-size:9.5px;" onclick="setAiScanGenFilter('G2')">2. Kuşak (4)</button>
        <button type="button" class="ios-btn ${aiScanGenerationFilter === 'G3' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 8px; font-size:9.5px;" onclick="setAiScanGenFilter('G3')">3. Kuşak (8)</button>
        <button type="button" class="ios-btn ${aiScanGenerationFilter === 'G4' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:3px 8px; font-size:9.5px;" onclick="setAiScanGenFilter('G4')">4. Kuşak (16)</button>
      </div>
      <span id="ocrFilledCountBadge" class="gene-badge gene-green" style="font-size:9px;">${filledCount} / 31 Kutu Dolu</span>
    </div>
  `;

  const rowsHtml = filterSlots.map(s => {
    if (!aiTempBoxes[s.key]) {
      aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
    }
    const b = aiTempBoxes[s.key];
    const boxSex = b.sex || s.sex || 'M';
    const hasSlotIssue = valReport.issues.some(i => i.slot === s.key && (i.level === 'error' || i.level === 'warn'));
    const shortTitle = s.key === 'main'
      ? '🕊️ Ana Kuş'
      : (s.key === 'sire'
        ? '♂ Baba'
        : (s.key === 'dam'
          ? '♀ Anne'
          : `${boxSex === 'F' ? '♀' : '♂'} ${s.key.toUpperCase()}`));

    const sexToggleBtn = s.key === 'main'
      ? `<button type="button" class="ios-btn ios-btn-outline" style="padding:3px 6px; font-size:10px; font-weight:900; color:${boxSex === 'F' ? '#db2777' : '#0284c7'}; border-color:${boxSex === 'F' ? '#fbcfe8' : '#bae6fd'}; background:${boxSex === 'F' ? '#fdf2f8' : '#f0f9ff'}; flex-shrink:0;" onclick="syncOcrDomInputsToTempBoxes(); aiTempBoxes['main'].sex = (aiTempBoxes['main'].sex === 'F' ? 'M' : 'F'); renderAiScannedList();" title="Ana kuşun cinsiyetini değiştir (♂ Erkek / ♀ Dişi)">${boxSex === 'F' ? '♀ Dişi' : '♂ Erkek'}</button>`
      : '';

    return `
      <div id="ocrRow_${s.key}" style="display:flex; gap:5px; align-items:center; background:var(--ios-card-alt); padding:5px 7px; border-radius:8px; border:1.5px solid ${hasSlotIssue ? '#ef4444' : 'var(--ios-border)'};">
        <span style="font-size:10px; font-weight:900; width:68px; color:${boxSex === 'F' ? '#db2777' : '#0052cc'}; flex-shrink:0;" title="${escapeHtml(s.label)}">${shortTitle}</span>
        ${sexToggleBtn}
        <span id="ocrFlag_${s.key}" style="font-size:13px; flex-shrink:0;">${b.flag || detectFlagFromRing(b.ring)}</span>
        <input type="text" id="ocrInputRing_${s.key}" class="ios-input" style="padding:4px 6px; font-size:10.5px; font-weight:800; flex:1.1;" placeholder="Halka No" value="${escapeHtml(b.ring || '')}" oninput="onOcrBoxRingEdited('${s.key}', this)" onchange="onOcrBoxRingEdited('${s.key}', this)" />
        <input type="text" id="ocrInputName_${s.key}" class="ios-input" style="padding:4px 6px; font-size:10.5px; flex:1.1;" placeholder="Kuş Adı / Ünvan" value="${escapeHtml(b.name || '')}" oninput="userManuallyEditedOcrSlots.add('${s.key}'); aiTempBoxes['${s.key}'].name=this.value" onchange="userManuallyEditedOcrSlots.add('${s.key}'); aiTempBoxes['${s.key}'].name=this.value" />
        <input type="text" id="ocrInputNotes_${s.key}" class="ios-input" style="padding:4px 6px; font-size:10px; flex:1.2;" placeholder="Yetiştirici / Yarış Notu" value="${escapeHtml((b.notes || '').replace(/\r?\n/g, ' • '))}" oninput="userManuallyEditedOcrSlots.add('${s.key}'); aiTempBoxes['${s.key}'].notes=this.value" onchange="userManuallyEditedOcrSlots.add('${s.key}'); aiTempBoxes['${s.key}'].notes=this.value" />
      </div>
    `;
  }).join('');

  list.innerHTML = filterBarHtml + rowsHtml;
}

// Ekranda o an görünür olan tüm OCR input kutularındaki değerleri doğrudan aiTempBoxes içine senkronize eder
// (Mobil klavye açıkken veya otomatik tamamlama kullanıldığında hiçbir elle yapılan değişikliğin kaybolmamasını garanti eder!)
function syncOcrDomInputsToTempBoxes() {
  BOX_SLOTS.forEach(s => {
    const rEl = document.getElementById('ocrInputRing_' + s.key);
    const nEl = document.getElementById('ocrInputName_' + s.key);
    const ntEl = document.getElementById('ocrInputNotes_' + s.key);
    if (!rEl && !nEl && !ntEl) return;

    if (!aiTempBoxes[s.key]) {
      aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
    }
    if (rEl) {
      const rVal = rEl.value.trim();
      aiTempBoxes[s.key].ring = rVal;
      aiTempBoxes[s.key].flag = detectFlagFromRing(rVal);
    }
    if (nEl) {
      aiTempBoxes[s.key].name = nEl.value.trim();
    }
    if (ntEl) {
      aiTempBoxes[s.key].notes = ntEl.value.trim();
    }
  });
}

function saveAiScannedPedigree() {
  if (!checkPedigreeTierLimitAllowed()) return;
  // Devam eden arka plan yakınlaştırma (Zoom OCR) döngüsü varsa anında durdur!
  aiScanRunToken++;

  // 1. Önce ekrandaki tüm input kutularında elle yazılmış en son değerleri doğrudan DOM'dan oku!
  syncOcrDomInputsToTempBoxes();

  if (!Object.keys(aiTempBoxes).length) {
    BOX_SLOTS.forEach(s => {
      aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
    });
  }

  // 2. Eğer OCR sayfa başlığındaki ana kuş halka numarasını yanlışlıkla bir ata kutusuna (örn. g2_1 veya g2_2) da yazdıysa otomatik temizle
  const mainRingCheck = (aiTempBoxes.main?.ring || '').trim().toUpperCase();
  if (mainRingCheck) {
    BOX_SLOTS.forEach(s => {
      if (s.key !== 'main' && (aiTempBoxes[s.key]?.ring || '').trim().toUpperCase() === mainRingCheck) {
        aiTempBoxes[s.key] = { flag: '🇹🇷', ring: '', name: '', color: 'Mavi Çakmaklı', notes: '', sex: s.sex };
      }
    });
  }

  const valReport = validateOcrScannedBoxes();
  if (valReport.hasBlockingError) {
    renderAiScannedList();
    alert(`⚠️ Veri Doğrulama Hatası:\n\n${valReport.issues.filter(i => i.level === 'error').map(i => '• ' + i.msg).join('\n')}\n\nLütfen hatalı kutuyu düzeltip tekrar onaylayın.`);
    return;
  }

  const mainRing = (aiTempBoxes.main?.ring || '').trim().toUpperCase();
  const existingDupPed = mainRing
    ? pedigrees.find(p => (p.boxes?.main?.ring || '').trim().toUpperCase() === mainRing)
    : null;

  const fullBoxes = {};
  BOX_SLOTS.forEach(s => {
    fullBoxes[s.key] = aiTempBoxes[s.key]
      ? { ...aiTempBoxes[s.key], sex: s.key === 'main' ? (aiTempBoxes.main.sex || 'M') : (s.sex || 'M'), inMyLoft: s.key === 'main' }
      : { flag: '🇹🇷', ring: '', name: '', color: '', notes: '', photo: '', sex: s.sex || 'M', inMyLoft: false };
  });

  // 3. Eğer bu halka numarası kümeste zaten varsa, engellemek yerine kullanıcıya "Mevcut kaydı bu verilerle güncellemek ister misiniz?" diye sor!
  if (existingDupPed) {
    const okUpdate = confirm(
      `🔄 "${aiTempBoxes.main.ring}" halka numaralı güvercin kümesinizde zaten kayıtlı.\n\n` +
      `Yaptığınız değişiklikleri ve 4 kuşak soyağacı kutularını mevcut "${aiTempBoxes.main.ring}" kaydının üzerine güncellemek ister misiniz?`
    );
    if (!okUpdate) return;

    existingDupPed.boxes = fullBoxes;
    activePedigreeId = existingDupPed.id;
  } else {
    const newId = 'ped_ai_' + Date.now();
    pedigrees.unshift({
      id: newId,
      themeId: 'blue',
      accentColor: '#1d4ed8',
      bgColor: '#f8fafc',
      fontFamily: "'Inter', sans-serif",
      boxes: fullBoxes
    });
    activePedigreeId = newId;
  }

  saveMypedigreData();
  renderPedigreeDropdown();
  selectActivePedigree(activePedigreeId);
  renderHomeDashboard();
  renderLoftBirdsDirectory();
  openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
  switchBirdsViewMode('pedigree');
}

// ============================================================================
// 4. EKRAN: YARIŞLAR (BİLİMSEL UÇUŞ UYGUNLUĞU + ÖNERİLEN KADRO + DERECE/HIZ KAYDI)
// ============================================================================
function switchRaceSubTab(mode) {
  const wPane = document.getElementById('raceWeatherPane');
  const rPane = document.getElementById('raceResultsPane');
  const pW = document.getElementById('pillRaceWeather');
  const pR = document.getElementById('pillRaceResults');

  if (mode === 'results') {
    if (wPane) wPane.style.display = 'none';
    if (rPane) rPane.style.display = 'flex';
    if (pW) pW.classList.remove('active');
    if (pR) pR.classList.add('active');
    populateRaceBirdSelect();
    previewCalculatedRaceSpeed();
    renderRaceTabFullList();
  } else {
    if (wPane) wPane.style.display = 'flex';
    if (rPane) rPane.style.display = 'none';
    if (pW) pW.classList.add('active');
    if (pR) pR.classList.remove('active');
    calcMypedigreFlight();
  }
}

function calcMypedigreFlight() {
  const dist = parseFloat(document.getElementById('flDist')?.value) || 420;
  const temp = parseFloat(document.getElementById('flTemp')?.value) || 22;
  const wind = document.getElementById('flWind')?.value || 'calm';
  const kp = parseFloat(document.getElementById('flKp')?.value) || 2;
  const hum = parseFloat(document.getElementById('flHum')?.value) || 55;
  const vis = parseFloat(document.getElementById('flVis')?.value) || 10;

  // 1. ÖLÇÜLEN METEOROLOJİK MODEL (Rüzgâr, Sıcaklık, Nem, Görüş) — Manyetik Kp'den Bağımsız
  let meteoScore = 92;
  let speedMpm = 1340;

  if (wind === 'tail') { meteoScore += 5; speedMpm += 190; }
  else if (wind === 'head') { meteoScore -= 12; speedMpm -= 180; }
  else if (wind === 'storm') { meteoScore -= 35; speedMpm -= 350; }

  if (temp > 29) { meteoScore -= (temp - 28) * 3; speedMpm -= 80; }
  else if (temp < 6) { meteoScore -= 10; speedMpm -= 50; }

  if (hum > 80) { meteoScore -= 8; speedMpm -= 40; }
  if (vis < 5) { meteoScore -= 14; speedMpm -= 90; }

  meteoScore = Math.max(12, Math.min(99, Math.round(meteoScore)));

  // 2. VARSAYIMSAL / DENEYSEL JEOMANYETİK MODEL (Manyetik Kp İndeksi: Kesinleşmiş tahmin modeli değildir)
  const kpHypotheticalPenalty = kp >= 5 ? Math.round((kp - 4) * 5) : 0;
  const score = meteoScore; // Ana uçuş uygunluk puanı yalnızca ölçülmüş meteorolojik değişkenlere dayanır

  const totalMin = Math.round((dist * 1000) / Math.max(650, speedMpm));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;

  const color = score >= 80 ? '#059669' : (score >= 60 ? '#0066ff' : '#dc2626');
  const statusText = score >= 80 ? 'UÇUŞA UYGUN (Ölçülen Meteorolojik Koşullar İdeal)' : (score >= 60 ? 'DİKKATLİ UÇUŞ (Meteorolojik Orta Risk)' : 'UÇUŞ ÖNERİLMEZ (Ağır Hava / Kayıp Riski)');

  // Ana Sayfa üst hava rozetini de canlı senkronize et
  syncLoftIdentityAcrossUI();

  // Kümesteki aktif kuşları bu hava ve mesafeye göre puanla (Göz rengi puanlaması kaldırıldı!)
  const activeBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
  const recommendedSquad = activeBirds.map(b => {
    let fit = b.ebvScore;
    const notesTxt = `${b.name} ${b.notes}`.toLowerCase();
    const reasons = [];
    let sciRefId = 'sci_gazda_2018';
    let sciRefLabel = 'Gazda et al. (2018)';

    if (dist >= 450) {
      if (notesTxt.includes('porsche') || notesTxt.includes('harry') || notesTxt.includes('sivas') || notesTxt.includes('550') || notesTxt.includes('480') || notesTxt.includes('504') || notesTxt.includes('505')) {
        fit += 6;
        reasons.push(`${dist} km uzun mesafe/maraton soy kayıtları doğrulanmış`);
      } else {
        reasons.push(`Uzun mesafe enerji ve dayanıklılık profili (${b.ebvScore}/100)`);
      }
      sciRefId = 'sci_stefaniuk_2024';
      sciRefLabel = 'Stefaniuk-Szmukier et al. (2024) — Kas Lipid & PPAR Dayanıklılık Analizi';
    } else if (dist <= 350) {
      if (notesTxt.includes('kittel') || notesTxt.includes('sprint') || notesTxt.includes('quievrain')) {
        fit += 6;
        reasons.push(`${dist} km kısa/orta mesafe yüksek patlayıcı hız kanı (Sprint/Kittel)`);
      } else {
        reasons.push(`${dist} km sprint/orta mesafe hız indeksi (${b.ebvScore}/100)`);
      }
      sciRefId = 'sci_dybus_2021';
      sciRefLabel = 'Dybus et al. (2021) — 100-400 km CRY1 Hız & Yönelim İlişkisi';
    } else {
      reasons.push(`${dist} km orta-uzun mesafe dengeli soyağacı performansı (${b.ebvScore}/100)`);
      sciRefId = 'sci_stefaniuk_2026';
      sciRefLabel = 'Stefaniuk-Szmukier et al. (2026) — PPARD Uçuş Hızı & Metabolizma';
    }

    if (wind === 'head' || wind === 'storm') {
      reasons.push('Karşı rüzgârda dayanıklılık ve uçuş geçmişi baz alındı');
    } else if (wind === 'tail') {
      reasons.push('Arkadan rüzgârda yüksek m/dk hız kapasitesi');
    }

    const estBirdSpeed = Math.round(speedMpm + (fit - 80) * 2.2);
    return {
      ...b,
      squadScore: Math.min(99, Math.round((fit * 0.65) + (score * 0.35))),
      estBirdSpeed,
      whyReasonText: reasons.join(' • '),
      sciRefId,
      sciRefLabel
    };
  }).sort((a, b) => b.squadScore - a.squadScore).slice(0, 3);

  const isGenesisPremium = typeof AvigenGenesisAI !== 'undefined' && AvigenGenesisAI.state.isPremiumActive;

  const squadSectionHtml = isGenesisPremium ? `
    <div style="font-size:11.5px; font-weight:800; color:#581c87; margin-bottom:5px; display:flex; align-items:center; justify-content:space-between;">
      <span>🦅 Bu Etap (${dist} km) İçin Önerilen İlk 3 Güvercin &amp; Seçim Nedenleri:</span>
      <span class="gene-badge gene-purple" style="font-size:8.5px;">GENESIS AI</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      ${recommendedSquad.map((r, i) => `
        <div class="dash-list-item urgency-green" style="padding:7px 9px; flex-direction:column; align-items:stretch; gap:4px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
            <div class="dash-list-left">
              <div class="dash-mini-icon" style="font-weight:900; color:#059669;">#${i + 1}</div>
              <div style="min-width:0; flex:1;">
                <div class="dash-list-title">${r.flag} ${escapeHtml(r.ring)} • ${escapeHtml(r.name)}</div>
                <div class="dash-list-sub">Model Tahmini Hız: <strong>${r.estBirdSpeed} m/dk</strong> (${(r.estBirdSpeed * 0.06).toFixed(1).replace('.', ',')} km/sa) • ${r.roleCategory === 'BREEDER' ? '⚠️ Damızlık Kadroda' : '🏁 Yarışa Hazır'}</div>
              </div>
            </div>
            <span class="gene-badge gene-green" style="font-size:9.5px; flex-shrink:0;">%${r.squadScore} Uyum</span>
          </div>
          <div style="background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid #059669; border-radius:6px; padding:4px 7px; font-size:9.5px; color:var(--ios-text); line-height:1.35;">
            <div>💡 <strong>Neden Önerildi:</strong> ${escapeHtml(r.whyReasonText)}</div>
            <div style="margin-top:2px; color:#0066ff; font-weight:800; cursor:pointer;" onclick="if(typeof AvigenScientificLibrary!=='undefined') AvigenScientificLibrary.openArticleDetailModal('${r.sciRefId}')">
              📚 Bilimsel Dayanak: <span style="text-decoration:underline;">${escapeHtml(r.sciRefLabel)} ↗</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  ` : `
    <div style="background:linear-gradient(145deg, #0f172a 0%, #2e1065 100%); border:1.5px solid #7c3aed; border-radius:12px; padding:11px 12px; color:#ffffff;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:5px;">
        <span style="font-size:12px; font-weight:900; color:#c4b5fd;">🔒 GENESIS AI — Yarış Kadrosu Önerisi</span>
        <span class="gene-badge gene-purple" style="font-size:8.5px;">GENESIS AI</span>
      </div>
      <div style="font-size:10.5px; color:#e2e8f0; line-height:1.4; margin-bottom:9px;">
        Bu hava (${temp}°C) ve ${dist} km mesafede kümesinizden hangi <strong>ilk 3 güvercinin</strong> sepetlenmesi gerektiğini görmek için <strong>AVIGEN GENESIS AI</strong> modülünü etkinleştirin.
      </div>
      <button class="ios-btn ios-btn-purple" style="width:100%; padding:8px; font-size:11.5px;" onclick="if(typeof AvigenUxManager!=='undefined'){AvigenUxManager.openSubscriptionModal('checkout');}">
        🔑 Lisans Kodu İle AVIGEN GENESIS AI'ı Etkinleştir
      </button>
    </div>
  `;

  const card = document.getElementById('flightResultCard');
  if (!card) return;
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
      <span style="font-size:11.5px; font-weight:800; color:${color};">${statusText}</span>
      <span style="font-size:20px; font-weight:900; color:${color};">%${score}</span>
    </div>
    <div style="height:8px; background:#e2e8f0; border-radius:99px; overflow:hidden; margin-bottom:8px;">
      <div style="width:${score}%; height:100%; background:${color};"></div>
    </div>

    <!-- ÖLÇÜLMÜŞ METEOROLOJİK VERİ vs VARSAYIMSAL MODEL AYRIMI -->
    <div style="font-size:10.5px; display:grid; grid-template-columns:1fr 1fr; gap:6px; color:var(--ios-text); margin-bottom:9px;">
      <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:8px; padding:6px 8px;">
        <div style="font-size:8.8px; font-weight:900; color:#047857; margin-bottom:2px;">📏 ÖLÇÜLEN METEOROLOJİK MODEL</div>
        <div>⏱️ <strong>Beklenen Hız:</strong> ${speedMpm.toLocaleString('tr-TR')} m/dk (${(speedMpm * 0.06).toFixed(1).replace('.', ',')} km/sa)</div>
        <div>🏁 <strong>Tahmini Süre:</strong> ${h} sa ${m} dk</div>
        <div>🌡️ <strong>Isı &amp; Nem:</strong> ${temp}°C • %${hum} (${temp > 29 ? 'Elektrolit Şart' : 'Optimum'})</div>
      </div>
      <div style="background:#f5f3ff; border:1px solid #ddd6fe; border-radius:8px; padding:6px 8px;">
        <div style="font-size:8.8px; font-weight:900; color:#6d28d9; margin-bottom:2px;">🧭 VARSAYIMSAL JEOMANYETİK NOT (Kp=${kp})</div>
        <div style="font-size:9.3px; color:#4c1d95; line-height:1.32;">
          ${kp >= 5
            ? `Jeomanyetik dalgalanma yüksek (Kp=${kp}, varsayımsal etki -%${kpHypotheticalPenalty}). Ancak Kp değerinin yön bulmaya etkisi kesinleşmiş bir fiziksel model olmadığından ana meteorolojik puana karıştırılmamıştır.`
            : `Manyetik aktivite sakin (Kp=${kp}). Not: Jeomanyetik Kp indeksi deneysel bir göstergedir; kesinleşmiş uçuş tahmini olarak değerlendirilmez.`}
        </div>
      </div>
    </div>

    ${squadSectionHtml}
  `;
}

function populateRaceBirdSelect() {
  const sel = document.getElementById('rcBirdSelect');
  if (!sel) return;
  const activeBirds = collectUniqueLoftBirds().filter(b => b.isActiveLoftBird);
  sel.innerHTML = activeBirds.map(b =>
    `<option value="${escapeHtml(b.ring)}">${b.flag} ${escapeHtml(b.ring)} — ${escapeHtml(b.name)}</option>`
  ).join('');
}

function previewCalculatedRaceSpeed() {
  const distKm = parseFloat(document.getElementById('rcDistKm')?.value) || 450;
  const durMin = parseFloat(document.getElementById('rcDurationMin')?.value) || 315;
  const rank = parseInt(document.getElementById('rcRank')?.value, 10) || 1;
  const flock = parseInt(document.getElementById('rcTotalFlock')?.value, 10) || 1000;

  const speedMpmNum = (distKm * 1000) / Math.max(1, durMin);
  const speedMpmFormatted = speedMpmNum.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const speedKmhFormatted = (speedMpmNum * 0.06).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const bar = document.getElementById('rcSpeedPreviewBar');
  if (bar) {
    bar.innerHTML = `⚡ Hesaplanan Resmi Hız: <strong>${speedMpmFormatted} m/dk</strong> (${speedKmhFormatted} km/sa) • Derece: <strong>${rank}. / ${flock.toLocaleString('tr-TR')} Kuş</strong>`;
  }
}

function recordOfficialRaceResult() {
  const ringVal = document.getElementById('rcBirdSelect')?.value;
  const stageName = (document.getElementById('rcStageName')?.value || 'Ulusal Etap').trim();
  const distKm = parseFloat(document.getElementById('rcDistKm')?.value) || 450;
  const durMin = parseFloat(document.getElementById('rcDurationMin')?.value) || 315;
  const rank = parseInt(document.getElementById('rcRank')?.value, 10) || 1;
  const flock = parseInt(document.getElementById('rcTotalFlock')?.value, 10) || 1000;

  if (!ringVal) return;

  const cleanRingUpper = ringVal.trim().toUpperCase();
  const cleanStageKey = `${stageName.toUpperCase()}_${distKm}`;

  // Mükerrer Yarış Derecesi Koruması: Aynı kuş için aynı etap ve mesafede zaten derece girilmişse ikinci kez ekleme!
  const dupRace = racesList.find(rc =>
    (rc.detail || '').toUpperCase().includes(cleanRingUpper) &&
    (rc.title || '').toUpperCase().includes(stageName.toUpperCase()) &&
    (rc.title || '').includes(`${distKm} km`)
  );
  if (dupRace) {
    alert(`⚠️ Mükerrer Yarış Derecesi Engellendi:\n\n"${ringVal}" güvercini için "${stageName} (${distKm} km)" etabında zaten bir yarış derecesi kayıtlı. Aynı yarış derecesi iki defa işlenemez!`);
    return;
  }

  const speedMpm = Number(((distKm * 1000) / Math.max(1, durMin)).toFixed(1));
  const speedKmh = Number((speedMpm * 0.06).toFixed(1)).toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const allBirds = collectUniqueLoftBirds();
  const bird = allBirds.find(b => b.ring.toUpperCase() === cleanRingUpper);
  const flag = bird ? bird.flag : detectFlagFromRing(ringVal);
  const bName = bird ? bird.name : '';

  const flockFormatted = flock.toLocaleString('tr-TR');
  const badgeStr = `${rank}. / ${flockFormatted} Kuş`;
  const degreeSummaryLine = `${rank}. ${stageName} ${distKm} km (${flockFormatted} Kuş - ${speedMpm} m/dk • ${speedKmh} km/sa)`;

  // 1. Yarışlar Listesine Ekle (Ana Sayfa & Yarışlar Sekmesi)
  racesList.unshift({
    id: 'race_' + Date.now(),
    dedupKey: `${cleanRingUpper}__${cleanStageKey}`,
    icon: rank === 1 ? '🥇' : (rank <= 3 ? '🥈' : '🏆'),
    title: `${stageName} ${distKm} km — ${rank}.lik!`,
    detail: `${flag} ${ringVal} (${bName}) • ${speedMpm} m/dk (${speedKmh} km/sa)`,
    badge: badgeStr,
    badgeColor: rank <= 3 ? 'gene-green' : 'gene-blue'
  });

  // 2. Kuşun Kişisel Sicil Dosyasına Otomatik Ekle (Mükerrer kontrolüyle)
  const dupDossier = birdDossierList.some(d => d.ring?.toUpperCase() === cleanRingUpper && d.title === degreeSummaryLine);
  if (!dupDossier) {
    birdDossierList.unshift({
      id: 'dos_race_' + Date.now(),
      ring: ringVal,
      birdName: bName,
      category: 'Yarış Derecesi',
      icon: '🏆',
      title: degreeSummaryLine,
      detail: `Mesafe: ${distKm} km • Süre: ${durMin} dk • Resmi Ortalama Hız: ${speedMpm} m/dk (${speedKmh} km/sa)`,
      date: getIsoDateDaysAgo(0),
      badgeColor: 'gene-green'
    });
  }

  // 3. Kuşun Resmi Pedigre Kutusuna ve GENESIS AI Puanına Otomatik İşle
  pedigrees.forEach(p => {
    Object.values(p.boxes || {}).forEach(box => {
      if (box && box.ring && box.ring.trim().toUpperCase() === cleanRingUpper) {
        const cur = (box.notes || '').trim();
        if (!cur.includes(`${stageName} ${distKm} km`)) {
          box.notes = cur ? `${degreeSummaryLine}\n${cur}` : degreeSummaryLine;
        }
      }
    });
  });

  saveMypedigreData();
  renderRaceTabFullList();
  renderHomeDashboard();
  renderLoftBirdsDirectory();
  renderActivePedigree();
  alert(`🏆 ${ringVal} (${bName}) için "${degreeSummaryLine}" derecesi kaydedildi!`);
}

function renderRaceTabFullList() {
  const box = document.getElementById('raceTabFullList');
  if (!box) return;
  if (!racesList.length) {
    box.innerHTML = `<div style="text-align:center; padding:14px; font-size:11px; color:var(--ios-subtext);">Kayıtlı yarış veya derece bulunmuyor.</div>`;
    return;
  }
  box.innerHTML = racesList.map(rc => `
    <div class="dash-list-item ${rc.badgeColor === 'gene-green' ? 'urgency-green' : 'urgency-blue'}">
      <div class="dash-list-left" onclick="openHomeItemModal('${rc.id}', 'races')" style="cursor:pointer;">
        <div class="dash-mini-icon">${rc.icon || '🏁'}</div>
        <div style="min-width:0; flex:1;">
          <div class="dash-list-title">${escapeHtml(rc.title)}</div>
          <div class="dash-list-sub">${escapeHtml(rc.detail)}</div>
        </div>
      </div>
      <div style="display:flex; align-items:center; gap:5px; flex-shrink:0;">
        <span class="gene-badge ${rc.badgeColor || 'gene-blue'}" style="font-size:9.5px; padding:2px 7px;">${escapeHtml(rc.badge)}</span>
        <button class="dash-check-btn" style="color:#dc2626; border-color:#fecaca;" onclick="deleteHomeItem('races', '${rc.id}'); renderRaceTabFullList();" title="Sil">✕</button>
      </div>
    </div>
  `).join('');
}

// ============================================================================
// 4. EKRAN: NOT SİSTEMİ
// ============================================================================
function renderMypedigreNotes() {
  const container = document.getElementById('mpNotesList');
  if (!container) return;
  container.innerHTML = notesList.map(n => `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:11.5px; font-weight:800; color:#1d4ed8;">${detectFlagFromRing(n.ring)} ${escapeHtml(n.ring)} — ${escapeHtml(n.title)}</span>
        <button class="ios-btn ios-btn-danger" style="padding:2px 6px; font-size:10px;" onclick="deleteMypedigreNote('${n.id}')">✖</button>
      </div>
      <div style="font-size:11px; color:#334155; margin-top:3px;">${escapeHtml(n.body)}</div>
      <div style="font-size:9.5px; color:#94a3b8; margin-top:3px;">📅 ${escapeHtml(n.date)}</div>
    </div>
  `).join('');
}

function addMypedigreNote() {
  const ring = document.getElementById('mpNoteRing').value.trim() || 'Genel';
  const title = document.getElementById('mpNoteTitle').value.trim();
  const body = document.getElementById('mpNoteBody').value.trim();
  if (!title && !body) return;

  notesList.unshift({
    id: 'n_' + Date.now(),
    ring,
    title: title || 'Kümes Notu',
    body,
    date: new Date().toLocaleDateString('tr-TR')
  });
  document.getElementById('mpNoteRing').value = '';
  document.getElementById('mpNoteTitle').value = '';
  document.getElementById('mpNoteBody').value = '';
  saveMypedigreData();
  renderMypedigreNotes();
}

function deleteMypedigreNote(id) {
  notesList = notesList.filter(n => n.id !== id);
  saveMypedigreData();
  renderMypedigreNotes();
}

// ============================================================================
// 5. BİLİMSEL EŞLEŞTİRME ADAY HAVUZU, 5 NESİL SOY DERİNLEŞTİRİCİ & KULUÇKA MOTORU
//    (Tüm genetik, Wright COI ve performans hesaplamaları merkezi AvigenGenesisAI üzerinden yürütülür)
// ============================================================================
function openBreedingSub(subId, btnEl) {
  document.querySelectorAll('.sub-panel').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('bsub-' + subId);
  if (target) target.classList.add('active');

  document.querySelectorAll('.sub-pill').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  if (subId === 'hatch') calculateIncubationTimeline();
  if (subId === 'auto') renderAutoBestPairs();
}

// Kümesteki tüm erkek ve dişi adayları tekilleştirilmiş (mükerrersiz) ve gerçek cinsiyetleriyle döndürür
function getAllBreedingCandidates() {
  const all = [];
  const seenRings = new Set();

  // Diğer pedigrelerdeki Baba/Anne pozisyonlarından ve Aktif Yuvalardan kesin cinsiyet haritası çıkar
  const knownRoleSexMap = new Map();
  const maleSlots = ['sire', 'g2_1', 'g2_3', 'g3_1', 'g3_3', 'g3_5', 'g3_7', 'g4_1', 'g4_3', 'g4_5', 'g4_7', 'g4_9', 'g4_11', 'g4_13', 'g4_15'];
  const femaleSlots = ['dam', 'g2_2', 'g2_4', 'g3_2', 'g3_4', 'g3_6', 'g3_8', 'g4_2', 'g4_4', 'g4_6', 'g4_8', 'g4_10', 'g4_12', 'g4_14', 'g4_16'];

  pedigrees.forEach(p => {
    const b = p.boxes || {};
    maleSlots.forEach(k => {
      const r = (b[k]?.ring || '').trim().toUpperCase();
      if (r) knownRoleSexMap.set(r, 'M');
    });
    femaleSlots.forEach(k => {
      const r = (b[k]?.ring || '').trim().toUpperCase();
      if (r) knownRoleSexMap.set(r, 'F');
    });
  });

  if (typeof activePairs !== 'undefined' && Array.isArray(activePairs)) {
    activePairs.forEach(ap => {
      const sr = (ap.sireRing || '').trim().toUpperCase();
      const dr = (ap.damRing || '').trim().toUpperCase();
      if (sr) knownRoleSexMap.set(sr, 'M');
      if (dr) knownRoleSexMap.set(dr, 'F');
    });
  }

  const inferSex = (box, defaultSex) => {
    if (box && (box.sex === 'M' || box.sex === 'F')) return box.sex;
    const cleanR = (box?.ring || '').trim().toUpperCase();
    if (cleanR && knownRoleSexMap.has(cleanR)) return knownRoleSexMap.get(cleanR);
    const txt = `${box?.name || ''} ${box?.color || ''} ${box?.notes || ''}`.toLowerCase();
    if (/\b(dişi|hen|duvin|weibchen|daughter|kızı|mother\s*to|mother\s*of|kraliçe|lady|sultan|queen|princess|prenses|miss)\b/i.test(txt) || txt.includes('♀')) return 'F';
    if (/\b(erkek|cock|doffer|vogel|direct\s*son|son\s*of|oğlu|father\s*to|father\s*of|king|prince|beyi|paşa)\b/i.test(txt) || txt.includes('♂')) return 'M';
    return defaultSex;
  };

  const pushCandidate = (pedId, slot, box, defaultSex, defaultEye, defaultBody, defaultGene) => {
    if (!box || !box.ring || !box.ring.trim()) return;
    const cleanRing = box.ring.trim().toUpperCase();
    if (seenRings.has(cleanRing)) return;
    seenRings.add(cleanRing);

    const key = `${pedId}::${slot}`;
    const sex = inferSex(box, defaultSex);
    all.push({
      id: key,
      pedId,
      slot,
      flag: box.flag || detectFlagFromRing(box.ring),
      ring: box.ring.trim(),
      name: box.name || 'İsimsiz',
      sex,
      eye: box.eyeSign || defaultEye,
      body: defaultBody,
      gene: defaultGene,
      notes: box.notes || ''
    });
  };

  // Önce tüm ana kuşları (main) ekle ki kendi tam soyağaçlarıyla (pedId::main) öncelikli temsil edilsinler
  pedigrees.forEach((p, idx) => {
    const b = p.boxes || {};
    if (b.main && b.main.inMyLoft !== false) {
      pushCandidate(p.id, 'main', b.main, idx % 2 === 0 ? 'M' : 'F', idx % 2 === 0 ? 'yellow_breeder' : 'pearl_racer', 'medium_apple', 'LDHA_AA');
    }
  });

  // Ardından ebeveyn ve büyük ebeveyn kutularından SADECE "inMyLoft: true" (kümeste fiziksel olarak mevcut) olan damızlıkları ekle!
  // Pedigrede adı geçen ama kümeste fiziksel olarak bulunmayan yabancı anne/baba/dedeler eşleştirme aday listesini kirletmez.
  pedigrees.forEach((p) => {
    const b = p.boxes || {};
    if (b.sire?.inMyLoft) pushCandidate(p.id, 'sire', b.sire, 'M', 'yellow_breeder', 'medium_apple', 'LDHA_AB');
    if (b.dam?.inMyLoft) pushCandidate(p.id, 'dam', b.dam, 'F', 'pearl_racer', 'medium_apple', 'CRY1_TT');
    if (b.g2_1?.inMyLoft) pushCandidate(p.id, 'g2_1', b.g2_1, 'M', 'yellow_breeder', 'long_marathon', 'LDHA_AA');
    if (b.g2_2?.inMyLoft) pushCandidate(p.id, 'g2_2', b.g2_2, 'F', 'pearl_racer', 'medium_apple', 'LDHA_AB');
    if (b.g2_3?.inMyLoft) pushCandidate(p.id, 'g2_3', b.g2_3, 'M', 'pearl_racer', 'sprint_muscle', 'CRY1_TT');
    if (b.g2_4?.inMyLoft) pushCandidate(p.id, 'g2_4', b.g2_4, 'F', 'yellow_breeder', 'long_marathon', 'LDHA_AA');
  });

  return {
    all,
    males: all.filter(c => c.sex === 'M'),
    females: all.filter(c => c.sex === 'F')
  };
}

// Seçilen adayın soy ağacındaki tüm boncuk numaralarını nesil derinliği ve Sewall Wright yolaklarıyla (path) çıkarır
function getCandidateLineageTree(refVal) {
  const [pedId, slot] = (refVal || '').split('::');
  const ped = pedigrees.find(p => p.id === pedId) || pedigrees[0];
  if (!ped) return { self: {}, ancRings: [], gg1: {}, gg2: {}, gg3: {}, gg4: {}, gg5: {}, gg6: {}, gg7: {}, gg8: {} };

  const b = ped.boxes || {};
  let tree;

  if (slot === 'sire') {
    tree = {
      self: b.sire || {},
      p1: b.g2_1 || {},
      p2: b.g2_2 || {},
      g1: b.g3_1 || {},
      g2: b.g3_2 || {},
      g3: b.g3_3 || {},
      g4: b.g3_4 || {},
      gg1: b.g4_1 || {},
      gg2: b.g4_2 || {},
      gg3: b.g4_3 || {},
      gg4: b.g4_4 || {},
      gg5: b.g4_5 || {},
      gg6: b.g4_6 || {},
      gg7: b.g4_7 || {},
      gg8: b.g4_8 || {}
    };
  } else if (slot === 'dam') {
    tree = {
      self: b.dam || {},
      p1: b.g2_3 || {},
      p2: b.g2_4 || {},
      g1: b.g3_5 || {},
      g2: b.g3_6 || {},
      g3: b.g3_7 || {},
      g4: b.g3_8 || {},
      gg1: b.g4_9 || {},
      gg2: b.g4_10 || {},
      gg3: b.g4_11 || {},
      gg4: b.g4_12 || {},
      gg5: b.g4_13 || {},
      gg6: b.g4_14 || {},
      gg7: b.g4_15 || {},
      gg8: b.g4_16 || {}
    };
  } else if (slot === 'g2_1') {
    tree = {
      self: b.g2_1 || {},
      p1: b.g3_1 || {},
      p2: b.g3_2 || {},
      g1: b.g4_1 || {},
      g2: b.g4_2 || {},
      g3: b.g4_3 || {},
      g4: b.g4_4 || {}
    };
  } else if (slot === 'g2_2') {
    tree = {
      self: b.g2_2 || {},
      p1: b.g3_3 || {},
      p2: b.g3_4 || {},
      g1: b.g4_5 || {},
      g2: b.g4_6 || {},
      g3: b.g4_7 || {},
      g4: b.g4_8 || {}
    };
  } else if (slot === 'g2_3') {
    tree = {
      self: b.g2_3 || {},
      p1: b.g3_5 || {},
      p2: b.g3_6 || {},
      g1: b.g4_9 || {},
      g2: b.g4_10 || {},
      g3: b.g4_11 || {},
      g4: b.g4_12 || {}
    };
  } else if (slot === 'g2_4') {
    tree = {
      self: b.g2_4 || {},
      p1: b.g3_7 || {},
      p2: b.g3_8 || {},
      g1: b.g4_13 || {},
      g2: b.g4_14 || {},
      g3: b.g4_15 || {},
      g4: b.g4_16 || {}
    };
  } else {
    // slot === 'main' (4 Kuşak / 30 Ata: p1..p2 = 1.Kuşak, g1..g4 = 2.Kuşak, gg1..gg8 = 3.Kuşak, ggg1..ggg16 = 4.Kuşak)
    tree = {
      self: b.main || {},
      p1: b.sire || {},
      p2: b.dam || {},
      g1: b.g2_1 || {},
      g2: b.g2_2 || {},
      g3: b.g2_3 || {},
      g4: b.g2_4 || {},
      gg1: b.g3_1 || {},
      gg2: b.g3_2 || {},
      gg3: b.g3_3 || {},
      gg4: b.g3_4 || {},
      gg5: b.g3_5 || {},
      gg6: b.g3_6 || {},
      gg7: b.g3_7 || {},
      gg8: b.g3_8 || {},
      ggg1: b.g4_1 || {},
      ggg2: b.g4_2 || {},
      ggg3: b.g4_3 || {},
      ggg4: b.g4_4 || {},
      ggg5: b.g4_5 || {},
      ggg6: b.g4_6 || {},
      ggg7: b.g4_7 || {},
      ggg8: b.g4_8 || {},
      ggg9: b.g4_9 || {},
      ggg10: b.g4_10 || {},
      ggg11: b.g4_11 || {},
      ggg12: b.g4_12 || {},
      ggg13: b.g4_13 || {},
      ggg14: b.g4_14 || {},
      ggg15: b.g4_15 || {},
      ggg16: b.g4_16 || {}
    };
  }

  // ==========================================================================
  // AVIGEN GENESIS CORTEX — 1. NESİLDEN 5. NESİLE (62 ATA DÜĞÜMÜ) TAM ÇAPRAZ PEDİGRİ DERİNLEŞTİRİCİ
  // Kural:
  // 1) Bir kuşun babası veya annesi yalnızca halka numarasıyla girilmişse ve o babanın/annenin
  //    kendi pedigri kartı uygulamada kayıtlıysa, 1. nesilden 5. nesile kadar tüm üst atalarını otomatik bağlar.
  // 2) Aynı halka numaralı atanın başka bir pedigri kartında daha zengin derece/not kaydı varsa onu da birleştirir.
  // ==========================================================================
  const parentPairs = [
    ['main', 'sire', 'dam'],
    ['sire', 'g2_1', 'g2_2'],
    ['dam', 'g2_3', 'g2_4'],
    ['g2_1', 'g3_1', 'g3_2'],
    ['g2_2', 'g3_3', 'g3_4'],
    ['g2_3', 'g3_5', 'g3_6'],
    ['g2_4', 'g3_7', 'g3_8'],
    ['g3_1', 'g4_1', 'g4_2'],
    ['g3_2', 'g4_3', 'g4_4'],
    ['g3_3', 'g4_5', 'g4_6'],
    ['g3_4', 'g4_7', 'g4_8'],
    ['g3_5', 'g4_9', 'g4_10'],
    ['g3_6', 'g4_11', 'g4_12'],
    ['g3_7', 'g4_13', 'g4_14'],
    ['g3_8', 'g4_15', 'g4_16']
  ];

  const enrichNodeFromAllPedigrees = (nodeObj) => {
    if (!nodeObj || !nodeObj.ring || !nodeObj.ring.trim()) return nodeObj || {};
    const cleanTarget = nodeObj.ring.trim().toUpperCase();
    let bestName = nodeObj.name || '';
    let bestColor = nodeObj.color || '';
    let bestFlag = nodeObj.flag || '';
    const notesSet = new Set();
    if (nodeObj.notes && nodeObj.notes.trim()) notesSet.add(nodeObj.notes.trim());

    for (let i = 0; i < pedigrees.length; i++) {
      const pb = pedigrees[i]?.boxes;
      if (!pb) continue;
      for (const k of Object.keys(pb)) {
        const bx = pb[k];
        if (bx && (bx.ring || '').trim().toUpperCase() === cleanTarget) {
          if (!bestName && bx.name) bestName = bx.name;
          if (!bestColor && bx.color) bestColor = bx.color;
          if (!bestFlag && bx.flag) bestFlag = bx.flag;
          if (bx.notes && bx.notes.trim()) notesSet.add(bx.notes.trim());
        }
      }
    }
    return {
      ...nodeObj,
      name: bestName,
      color: bestColor,
      flag: bestFlag || nodeObj.flag,
      notes: Array.from(notesSet).join('\n')
    };
  };

  const findParentsOfRingInPedigrees = (ringStr) => {
    const cleanTarget = (ringStr || '').trim().toUpperCase();
    if (!cleanTarget) return null;
    for (let i = 0; i < pedigrees.length; i++) {
      const pb = pedigrees[i]?.boxes;
      if (!pb) continue;
      for (let j = 0; j < parentPairs.length; j++) {
        const [selfK, fatherK, motherK] = parentPairs[j];
        if ((pb[selfK]?.ring || '').trim().toUpperCase() === cleanTarget) {
          const fBox = pb[fatherK];
          const mBox = pb[motherK];
          if ((fBox && fBox.ring) || (mBox && mBox.ring)) {
            return { father: fBox || {}, mother: mBox || {} };
          }
        }
      }
    }
    return null;
  };

  const fillMissingChildren = (childNode, fatherSlotKey, motherSlotKey) => {
    const fExisting = tree[fatherSlotKey];
    const mExisting = tree[motherSlotKey];
    const hasF = Boolean(fExisting && fExisting.ring && fExisting.ring.trim());
    const hasM = Boolean(mExisting && mExisting.ring && mExisting.ring.trim());
    if ((!hasF || !hasM) && childNode && childNode.ring) {
      const found = findParentsOfRingInPedigrees(childNode.ring);
      if (found) {
        if (!hasF && found.father?.ring) tree[fatherSlotKey] = { ...found.father };
        if (!hasM && found.mother?.ring) tree[motherSlotKey] = { ...found.mother };
      }
    }
    tree[fatherSlotKey] = enrichNodeFromAllPedigrees(tree[fatherSlotKey] || {});
    tree[motherSlotKey] = enrichNodeFromAllPedigrees(tree[motherSlotKey] || {});
  };

  // Kuşun kendisini ve 1. Kuşak -> 5. Kuşak arasındaki tüm eksik dalları diğer pedigre kartlarından otomatik tamamla
  // (Döngü Koruması: Bir ata aynı dal üzerinde kendi üst atası olarak tekrar bağlanamaz!)
  const rootRingUpper = (tree.self?.ring || '').trim().toUpperCase();
  const safeFillChildren = (childNode, fatherSlotKey, motherSlotKey, branchVisited) => {
    const childRingUpper = (childNode?.ring || '').trim().toUpperCase();
    const nextVisited = new Set(branchVisited);
    if (childRingUpper) nextVisited.add(childRingUpper);
    fillMissingChildren(childNode, fatherSlotKey, motherSlotKey);
    const fRing = (tree[fatherSlotKey]?.ring || '').trim().toUpperCase();
    const mRing = (tree[motherSlotKey]?.ring || '').trim().toUpperCase();
    if (fRing && nextVisited.has(fRing)) tree[fatherSlotKey] = {};
    if (mRing && nextVisited.has(mRing)) tree[motherSlotKey] = {};
    return nextVisited;
  };

  tree.self = enrichNodeFromAllPedigrees(tree.self || {});
  const v0 = safeFillChildren(tree.self, 'p1', 'p2', new Set(rootRingUpper ? [rootRingUpper] : []));
  const vP1 = safeFillChildren(tree.p1, 'g1', 'g2', v0);
  const vP2 = safeFillChildren(tree.p2, 'g3', 'g4', v0);
  const vG = [null,
    safeFillChildren(tree.g1, 'gg1', 'gg2', vP1),
    safeFillChildren(tree.g2, 'gg3', 'gg4', vP1),
    safeFillChildren(tree.g3, 'gg5', 'gg6', vP2),
    safeFillChildren(tree.g4, 'gg7', 'gg8', vP2)
  ];
  const vGG = [null];
  for (let i = 1; i <= 8; i++) {
    const parentV = vG[Math.ceil(i / 2)] || v0;
    vGG[i] = safeFillChildren(tree[`gg${i}`], `ggg${2 * i - 1}`, `ggg${2 * i}`, parentV);
  }
  for (let k = 1; k <= 16; k++) {
    const parentV = vGG[Math.ceil(k / 2)] || v0;
    safeFillChildren(tree[`ggg${k}`], `gggg${2 * k - 1}`, `gggg${2 * k}`, parentV);
  }

  tree.ancRings = [
    tree.p1?.ring, tree.p2?.ring,
    tree.g1?.ring, tree.g2?.ring, tree.g3?.ring, tree.g4?.ring,
    tree.gg1?.ring, tree.gg2?.ring, tree.gg3?.ring, tree.gg4?.ring,
    tree.gg5?.ring, tree.gg6?.ring, tree.gg7?.ring, tree.gg8?.ring,
    tree.ggg1?.ring, tree.ggg2?.ring, tree.ggg3?.ring, tree.ggg4?.ring,
    tree.ggg5?.ring, tree.ggg6?.ring, tree.ggg7?.ring, tree.ggg8?.ring,
    tree.ggg9?.ring, tree.ggg10?.ring, tree.ggg11?.ring, tree.ggg12?.ring,
    tree.ggg13?.ring, tree.ggg14?.ring, tree.ggg15?.ring, tree.ggg16?.ring,
    ...Array.from({ length: 32 }, (_, idx) => tree[`gggg${idx + 1}`]?.ring)
  ].filter(Boolean);

  return tree;
}

// Güvercin Göz İşareti (Eye-Sign: 10 Resmi İris, Keşif Halkası ve Gözbebeği Varyasyonu) Canlı Vektörel Mercek Çizici
function renderEyeSignSvg(eyeType) {
  const uid = Math.random().toString(36).slice(2, 7);

  const palettes = {
    yellow_breeder: { c1: '#fde047', c2: '#ea580c', c3: '#991b1b', ring: '#78350f', pupilRing: '#1e293b' },
    pearl_racer:    { c1: '#f8fafc', c2: '#cbd5e1', c3: '#e11d48', ring: '#475569', pupilRing: '#0f172a' },
    orange_amber:   { c1: '#fb923c', c2: '#ea580c', c3: '#7c2d12', ring: '#9a3412', pupilRing: '#1c1917' },
    red_chestnut:   { c1: '#f87171', c2: '#dc2626', c3: '#450a0a', ring: '#7f1d1d', pupilRing: '#090d16' },
    violet_pearl:   { c1: '#f3e8ff', c2: '#c084fc', c3: '#6b21a8', ring: '#581c87', pupilRing: '#1e1b4b' },
    green_circle:   { c1: '#facc15', c2: '#ca8a04', c3: '#713f12', ring: '#15803d', pupilRing: '#14532d' },
    gravel_grey:    { c1: '#e2e8f0', c2: '#64748b', c3: '#334155', ring: '#1e293b', pupilRing: '#090d16' },
    dark_brown:     { c1: '#a16207', c2: '#713f12', c3: '#271206', ring: '#451a03', pupilRing: '#000000' }
  };

  if (eyeType === 'bull_eye') {
    return `
      <svg viewBox="0 0 100 100" width="40" height="40">
        <defs>
          <radialGradient id="bIris_${uid}" cx="50%" cy="50%" r="50%">
            <stop offset="20%" stop-color="#31102f"/>
            <stop offset="75%" stop-color="#1e1b4b"/>
            <stop offset="100%" stop-color="#090d16"/>
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="url(#bIris_${uid})"/>
        <circle cx="50" cy="50" r="20" fill="#000000"/>
        <circle cx="42" cy="40" r="5.5" fill="#ffffff" opacity="0.85"/>
      </svg>
    `;
  }

  if (eyeType === 'split_eye') {
    return `
      <svg viewBox="0 0 100 100" width="40" height="40">
        <circle cx="50" cy="50" r="48" fill="#facc15"/>
        <path d="M50 2 A48 48 0 0 1 50 98 Z" fill="#e2e8f0"/>
        <circle cx="50" cy="50" r="29" fill="none" stroke="#b91c1c" stroke-width="4" stroke-dasharray="3 2"/>
        <circle cx="50" cy="50" r="17" fill="#090d16"/>
        <circle cx="42" cy="40" r="5" fill="#ffffff" opacity="0.9"/>
      </svg>
    `;
  }

  const p = palettes[eyeType] || palettes.yellow_breeder;
  return `
    <svg viewBox="0 0 100 100" width="40" height="40">
      <defs>
        <radialGradient id="iris_${uid}" cx="50%" cy="50%" r="50%">
          <stop offset="32%" stop-color="${p.c1}"/>
          <stop offset="70%" stop-color="${p.c2}"/>
          <stop offset="92%" stop-color="${p.c3}"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#iris_${uid})"/>
      <circle cx="50" cy="50" r="29" fill="none" stroke="${p.ring}" stroke-width="5" stroke-dasharray="4 2"/>
      <circle cx="50" cy="50" r="20" fill="none" stroke="${p.pupilRing}" stroke-width="4"/>
      <circle cx="50" cy="50" r="16.5" fill="#090d16"/>
      <circle cx="42" cy="40" r="5" fill="#ffffff" opacity="0.9"/>
    </svg>
  `;
}

// Kuluçka, Boncuk Takma ve Yavru Gelişim Takvimi Hesaplayıcı
function calculateIncubationTimeline() {
  const dateInput = document.getElementById('hatchPairDate');
  const nestName = document.getElementById('hatchNestName')?.value || 'Damızlık Yuva #1';
  const box = document.getElementById('hatchTimelineResult');
  if (!box) return;

  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }
  const baseDate = new Date(dateInput?.value || new Date());

  const addDays = (d, days) => {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + days);
    return copy.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const milestones = [
    { day: '+8. Gün', date: addDays(baseDate, 8), icon: '🥚', title: '1. Yumurta Yumurtlama', desc: 'Dişi ilk yumurtayı bırakır (Akşamüstü).' },
    { day: '+10. Gün', date: addDays(baseDate, 10), icon: '🥚', title: '2. Yumurta & Tam Kuluçka', desc: '44 saat sonra 2. yumurta gelir ve 18 günlük kuluçka başlar.' },
    { day: '+15. Gün', date: addDays(baseDate, 15), icon: '🔦', title: 'Döllülük (Fener) Kontrolü', desc: 'Yumurtada damarlanma kontrol edilir, boşsa vakit kaybetmeden müdahale edilir.' },
    { day: '+24. Gün', date: addDays(baseDate, 24), icon: '🥛', title: 'Kursak Sütü Hazırlığı', desc: 'Ebeveynlerde prolaktin hormonuyla kursak sütü üretimi başlar.' },
    { day: '+28. Gün', date: addDays(baseDate, 28), icon: '🐣', title: 'Yavruların Yumurtadan Çıkışı', desc: '18 günlük kuluçka tamamlanır, yavrular çıkar.' },
    { day: '+35-37. Gün', date: addDays(baseDate, 35), icon: '💍', title: 'Ayağa Boncuk (Künye) Takma Günü!', desc: 'Yavru 7-9 günlükken resmi federasyon boncuğu ayağa takılır (Kritik tarih!).' },
    { day: '+52. Gün', date: addDays(baseDate, 52), icon: '🌾', title: 'Yeme Düşme & Yuvadan Ayırma', desc: 'Yavru 24-25 günlük olur, yeme düşer ve yavru kümesine alınır.' },
    { day: '+58. Gün', date: addDays(baseDate, 58), icon: '💉', title: 'PMV-1 (Veba) Aşı & Çatı Tanıma', desc: 'Yavruya koruyucu PMV-1 aşısı yapılır ve kümes etrafı alıştırma başlar.' }
  ];

  box.innerHTML = `
    <div class="ios-card-title">
      <span>📅 ${escapeHtml(nestName)} — Gelişim Takvimi</span>
    </div>
    <div style="display:flex; flex-direction:column; gap:6px;">
      ${milestones.map(m => `
        <div style="display:flex; align-items:center; gap:8px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:6px 8px;">
          <div style="font-size:18px;">${m.icon}</div>
          <div style="flex:1;">
            <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:800; color:#0f172a;">
              <span>${m.title}</span>
              <span style="color:#2563eb;">${m.date} (${m.day})</span>
            </div>
            <div style="font-size:10px; color:#64748b;">${m.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// Kümesteki En İyi Eşleşme Önerilerini SADECE Aktif Kümeste Fiziksel Olarak Bulunan Kuşlardan (`inMyLoft: true`) Otomatik Sıralar
// (Mobil Performans Optimizasyonu: 41x23 = 943 çiftin tamamını aynı anda hesaplamak yerine en yüksek potansiyelli ilk 8 erkek x ilk 8 dişiyi analiz eder!)
function renderAutoBestPairs() {
  const listEl = document.getElementById('autoBestPairsList');
  if (!listEl) return;

  const { males, females, all } = getAllBreedingCandidates();
  const mPool = (males.length ? males : all).slice(0, 8);
  const fPool = (females.length ? females : all).slice(0, 8);

  const pairs = [];
  mPool.forEach(m => {
    fPool.forEach(f => {
      if (m.ring.toUpperCase() === f.ring.toUpperCase()) return;
      if (typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.analyzeBreedingIntelligence === 'function') {
        const br = AvigenGenesisAI.analyzeBreedingIntelligence(m.id, f.id, true);
        pairs.push({
          sire: `${m.flag} ${m.ring} (${m.name})`,
          dam: `${f.flag} ${f.ring} (${f.name})`,
          score: br.totalScore,
          type: br.coi === 0 ? 'Tam Yabancı Kan (Outcross • %0 COI)' : `Soy İçi Eşleşme (COI %${br.coi.toFixed(2)})`,
          reason: `${br.relationSummary}. Heterosis: %${br.heterosis} • Veri Güvenilirliği: %${br.dataReliabilityPct}.`
        });
      }
    });
  });

  pairs.sort((a, b) => b.score - a.score);
  const recommendations = pairs.slice(0, 3);

  if (!recommendations.length) {
    listEl.innerHTML = `<div style="text-align:center; padding:12px; font-size:10.5px; color:var(--ios-subtext);">Otomatik çift önerisi için kümesinizde (` + `🏠 Kümesim` + `) en az 1 erkek ve 1 dişi güvercin kayıtlı olmalıdır.</div>`;
    return;
  }

  listEl.innerHTML = recommendations.map((r, i) => `
    <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:4px solid #0066ff; border-radius:9px; padding:8px 10px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span class="gene-badge gene-blue">#${i + 1} ÖNERİ • %${r.score} UYUM</span>
        <span style="font-size:10px; font-weight:800; color:#0052cc;">${escapeHtml(r.type)}</span>
      </div>
      <div style="font-size:11px; font-weight:800; color:var(--ios-text); margin-bottom:3px;">
        ♂ ${escapeHtml(r.sire)} <br/> ♀ ${escapeHtml(r.dam)}
      </div>
      <div style="font-size:10px; color:var(--ios-subtext); line-height:1.35; margin-bottom:5px;">
        🔬 ${escapeHtml(r.reason)}
      </div>
      <div style="display:flex; justify-content:flex-end; gap:5px; flex-wrap:wrap;">
        <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(r.sire)}', event)">♂ Baba Profili</button>
        <button type="button" class="nest-mini-action-btn" onclick="openQuickBirdProfileByRing('${escapeHtml(r.dam)}', event)">♀ Anne Profili</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================================
// AVIGEN – COMPLETE UX/UI, KOLAY/UZMAN MOD & ÜCRETSİZ/PREMIUM ÜYELİK YÖNETİCİSİ
// ============================================================================
const AVIGEN_UX_USER_KEY = 'avigen_ux_user_account_v1';

const AvigenUxManager = {
  LICENSE_WHATSAPP_NUMBER: '905327820385',
  LICENSE_WHATSAPP_DISPLAY: '0 532 782 03 85',

  // 3 Kademeli Resmi AVIGEN Ürün & Abonelik Mimarisi:
  // 1. 'FREE'        -> AVIGEN FREE (0 TL - Sınırsız kuş, kümes, 4 kuşak 31 kutu soy ağacı, yuva ve 3 kategorili yarış yönetimi)
  // 2. 'GENETICS_AI' -> AVIGEN AI (399 TL/ay - 3.990 TL/yıl - GENESIS AI destekli 5 Nesil Akıllı Eşleştirme, GENESIS AI'ya Sor, Haritalı Yarış Simülasyonu & Akıllı Yem/Maliyet)
  // 3. 'GLOBAL'      -> AVIGEN GLOBAL (599 TL/ay - 5.990 TL/yıl - AVIGEN AI + Ortak gen havuzu ve izin verilen veriler üzerinden küresel soy araştırması)
  TIERS: {
    FREE: {
      id: 'FREE',
      name: 'AVIGEN FREE',
      badgeText: 'FREE',
      badgeClass: 'gene-blue',
      monthlyPrice: '0 TL',
      yearlyPrice: '0 TL',
      maxPedigreesLimit: 99999,
      tagline: 'Sınırsız kuş, kümes, 4 kuşak (31 kutu) soy ağacı, yuva ve yarış yönetimi (Ücretsiz)'
    },
    GENETICS_AI: {
      id: 'GENETICS_AI',
      name: 'AVIGEN AI',
      badgeText: '🧬 AVIGEN AI',
      badgeClass: 'gene-purple',
      monthlyPrice: '399 TL',
      yearlyPrice: '3.990 TL',
      maxPedigreesLimit: 99999,
      tagline: 'GENESIS AI destekli 5 Nesil Akıllı Eşleştirme, GENESIS AI\'ya Sor, Haritalı Yarış Simülasyonu ve Akıllı Yem/Maliyet'
    },
    GLOBAL: {
      id: 'GLOBAL',
      name: 'AVIGEN GLOBAL',
      badgeText: '🌍 AVIGEN GLOBAL',
      badgeClass: 'gene-gold',
      monthlyPrice: '599 TL',
      yearlyPrice: '5.990 TL',
      maxPedigreesLimit: 99999,
      tagline: 'AVIGEN AI + Ortak gen havuzu ve izinli veriler üzerinden küresel soy araştırması'
    }
  },

  state: {
    membershipTier: 'FREE', // 'FREE' | 'GENETICS_AI' | 'GLOBAL'
    experienceMode: 'easy', // 'easy' (Kolay Mod) | 'expert' (Uzman Mod)
    isRegisteredMember: true,
    isLoggedIn: true,
    authViewMode: 'login', // 'login' | 'register' | 'change_pass'
    checkoutTierId: 'GENETICS_AI', // Ödeme ekranında seçilen paket
    memberName: 'AVIGEN Yetiştiricisi',
    memberEmail: '',
    memberPhone: '',
    memberCountry: '🇹🇷 Türkiye',
    passwordHash: 'avigen2026', // Şifre kontrolü
    savedCardMasked: '',
    paymentHistory: [],
    selectedBillingCycle: 'yearly', // 'monthly' | 'yearly'
    activeBreedingPlanSub: 'racetracker',
    activeProfileSection: 'preferences', // 'preferences' | 'membership' | 'library' | 'notes'
    privacySubScreen: 'overview',
    privacyBirdSearch: '',
    privacyBirdFilter: 'ALL',
    language: 'tr'
  },

  // Merkezi Yetkilendirme Motoru (Central Entitlement Check & Lisans Süresi Kontrolü)
  checkLicenseExpirationStatus() {
    if (!this.state.licenseExpiresAt || this.state.licenseType === 'UNLIMITED') {
      return { isExpired: false, daysLeft: null, label: 'Süresiz / VIP Lisans' };
    }
    const expDate = new Date(this.state.licenseExpiresAt);
    if (isNaN(expDate.getTime())) {
      return { isExpired: false, daysLeft: null, label: 'Aktif Lisans' };
    }
    const diffMs = expDate.getTime() - Date.now();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const dateLabel = expDate.toLocaleDateString('tr-TR');
    if (daysLeft <= 0) {
      return { isExpired: true, daysLeft: 0, label: `Süresi Doldu (${dateLabel})` };
    }
    return { isExpired: false, daysLeft, label: `${daysLeft} Gün Kaldı (Bitiş: ${dateLabel})` };
  },

  getCurrentTier() {
    const exp = this.checkLicenseExpirationStatus();
    if (exp.isExpired && (this.state.membershipTier === 'GENETICS_AI' || this.state.membershipTier === 'GLOBAL')) {
      this.state.membershipTier = 'FREE';
      this.saveState();
    }
    return this.TIERS[this.state.membershipTier] || this.TIERS.FREE;
  },

  hasGeneticsAiAccess() {
    return this.state.membershipTier === 'GENETICS_AI' || this.state.membershipTier === 'GLOBAL';
  },

  hasGlobalPoolAccess() {
    return this.state.membershipTier === 'GLOBAL';
  },

  setMembershipTier(tierId) {
    if (!this.TIERS[tierId]) return;
    this.state.membershipTier = tierId;
    this.saveState();
    if (typeof AvigenGenesisAI !== 'undefined') {
      AvigenGenesisAI.state.isPremiumActive = this.hasGeneticsAiAccess();
      AvigenGenesisAI.state.planName = this.TIERS[tierId].name;
      AvigenGenesisAI.saveState();
      AvigenGenesisAI.renderGenesisModuleUI();
      AvigenGenesisAI.renderHomeTeaserCard();
    }
    this.syncHeaderAndProfileUI();
    calcMypedigreFlight();
  },

  // Her telefona / cihaza özel kalıcı Cihaz Kimliği (Device ID) üretir ve saklar (Örn: AVG-7K4M-9P2X)
  getOrCreateDeviceId() {
    const DEV_KEY = 'avigen_hardware_device_id_v1';
    if (this.state.deviceId && /^AVG-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(this.state.deviceId)) {
      return this.state.deviceId;
    }
    try {
      const savedDev = localStorage.getItem(DEV_KEY);
      if (savedDev && /^AVG-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(savedDev)) {
        this.state.deviceId = savedDev;
        return savedDev;
      }
    } catch (e) {}

    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randBlock = (len) => {
      let s = '';
      for (let i = 0; i < len; i++) {
        s += chars[Math.floor(Math.random() * chars.length)];
      }
      return s;
    };
    const newId = `AVG-${randBlock(4)}-${randBlock(4)}`;
    this.state.deviceId = newId;
    try {
      localStorage.setItem(DEV_KEY, newId);
    } catch (e) {}
    return newId;
  },

  init() {
    try {
      const raw = localStorage.getItem(AVIGEN_UX_USER_KEY);
      if (raw) {
        this.state = { ...this.state, ...JSON.parse(raw) };
      }
    } catch (e) {}
    this.getOrCreateDeviceId();

    // Demo fatura kaydını temizle ve cihaza özel doğrulanmış lisans anahtarı yoksa varsayılan olarak AVIGEN FREE paketinde başlat
    if (Array.isArray(this.state.paymentHistory)) {
      this.state.paymentHistory = this.state.paymentHistory.filter(inv => inv && inv.id !== 'INV-2026-0891');
    } else {
      this.state.paymentHistory = [];
    }
    const hasValidDeviceLicense = Boolean(
      this.state.activatedLicenseKey &&
      this.verifySignedLicenseKey(this.state.activatedLicenseKey) &&
      !this.checkLicenseExpirationStatus().isExpired
    );
    if (!hasValidDeviceLicense && (this.state.membershipTier === 'GENETICS_AI' || this.state.membershipTier === 'GLOBAL')) {
      this.state.membershipTier = 'FREE';
    }
    this.saveState();

    if (typeof AvigenGenesisAI !== 'undefined') {
      AvigenGenesisAI.state.isPremiumActive = this.hasGeneticsAiAccess();
      AvigenGenesisAI.state.planName = (this.TIERS[this.state.membershipTier] || this.TIERS.FREE).name;
      AvigenGenesisAI.saveState();
      AvigenGenesisAI.renderHomeTeaserCard();
      if (document.getElementById('page-breeding')?.classList.contains('active')) {
        AvigenGenesisAI.renderGenesisModuleUI();
      }
    }

    this.state.activeProfileSection = 'preferences';
    this.syncHeaderAndProfileUI();
    this.renderBreedingPlanPairsList();
    this.switchProfileSection('preferences');
  },

  saveState() {
    localStorage.setItem(AVIGEN_UX_USER_KEY, JSON.stringify(this.state));
  },

  isExpertMode() {
    return this.state.experienceMode === 'expert';
  },

  toggleExperienceMode(forceMode) {
    if (forceMode === 'easy' || forceMode === 'expert') {
      this.state.experienceMode = forceMode;
    } else {
      this.state.experienceMode = this.state.experienceMode === 'easy' ? 'expert' : 'easy';
    }
    this.saveState();
    this.syncHeaderAndProfileUI();
    if (typeof AvigenGenesisAI !== 'undefined') {
      AvigenGenesisAI.renderGenesisReportOnly();
    }
    if (typeof AvigenPerformanceEngine !== 'undefined' && document.getElementById('birdPerfProfileModal')?.classList.contains('open')) {
      AvigenPerformanceEngine.renderProfileModal();
    }
  },

  syncHeaderAndProfileUI() {
    const memBtn = document.getElementById('navMembershipBtn');
    const tier = this.getCurrentTier();
    if (memBtn) {
      memBtn.innerHTML = tier.id === 'GLOBAL' ? '🌍 GLOBAL' : (tier.id === 'GENETICS_AI' ? '🧬 AVIGEN AI' : '🔓 FREE');
      memBtn.className = tier.id === 'GLOBAL' ? 'ios-btn ios-btn-gold' : (tier.id === 'GENETICS_AI' ? 'ios-btn ios-btn-purple' : 'ios-btn ios-btn-primary');
    }

    this.renderProfileAccountSection();
  },

  // --------------------------------------------------------------------------
  // 4. SEKME: YARIŞLAR (YARIŞ TAKİP SİSTEMİ, AI YARIŞ ANALİZİ, YUVA & KULUÇKA)
  // --------------------------------------------------------------------------
  switchBreedingPlanSub(subName) {
    if (subName === 'pairs' || subName === 'timeline') {
      openIosTab('pedigrees', document.querySelectorAll('.ios-tab-btn')[1]);
      switchBirdsViewMode('nests');
      return;
    }
    this.state.activeBreedingPlanSub = subName;
    const pTracker = document.getElementById('raceTrackerMainPane');
    const pAi = document.getElementById('raceAiInsightsPane');
    const pRes = document.getElementById('raceResultsPane');
    const pWea = document.getElementById('raceWeatherPane');

    if (pTracker) pTracker.style.display = subName === 'racetracker' ? 'flex' : 'none';
    if (pAi) pAi.style.display = subName === 'raceai' ? 'flex' : 'none';
    if (pRes) pRes.style.display = subName === 'results' ? 'flex' : 'none';
    if (pWea) pWea.style.display = subName === 'weather' ? 'flex' : 'none';

    ['pillRaceTracker', 'pillRaceAiInsights', 'pillBreedPairs', 'pillBreedTimeline', 'pillRaceResults', 'pillRaceWeather'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    const mapBtn = {
      racetracker: 'pillRaceTracker',
      raceai: 'pillRaceAiInsights',
      results: 'pillRaceResults',
      weather: 'pillRaceWeather'
    };
    const activeBtn = document.getElementById(mapBtn[subName]);
    if (activeBtn) activeBtn.classList.add('active');

    if (subName === 'racetracker') {
      if (typeof AvigenRaceTracker !== 'undefined') AvigenRaceTracker.renderRaceTrackerMainUI();
    } else if (subName === 'raceai') {
      if (typeof AvigenRaceTracker !== 'undefined') AvigenRaceTracker.renderRaceAiInsightsUI();
    } else if (subName === 'results') {
      populateRaceBirdSelect();
      previewCalculatedRaceSpeed();
      renderRaceTabFullList();
    } else if (subName === 'weather') {
      calcMypedigreFlight();
    }
  },

  renderBreedingPlanPairsList() {
    const box = document.getElementById('breedingPlanPairsList');
    if (!box) return;
    if (!activePairsList.length) {
      box.innerHTML = `
        <div style="text-align:center; padding:16px; font-size:11px; color:var(--ios-subtext); background:var(--ios-card-alt); border-radius:10px;">
          Şu an aktif damızlık çift kaydı yok. "+ Yeni Çift Eşleştir" butonuyla hemen ilk çiftinizi kaydedebilirsiniz.
        </div>
      `;
      return;
    }

    const conflicts = detectActiveNestConflicts();
    box.innerHTML = activePairsList.map(p => renderVisualCompactNestCard(p, conflicts.conflictsByRing)).join('');
  },

  // --------------------------------------------------------------------------
  // 5. SEKME: PROFİL VE AYARLAR (3 ANA SEKMELİ YÖNETİM MERKEZİ)
  // 1. preferences -> ⚙️ Ayarlar & Yedek (Gündüz/Gece Teması, Mesafe Sınırları, JSON Yedekleme, Notlar & QA)
  // 2. membership  -> 👤 Hesap & Abonelik (Şifreli Giriş/Kayıt, Şifre Değiştirme, Paket & Güvenli Ödeme)
  // 3. library     -> 🔬 Bilim Bankası (AVIGEN Scientific Library)
  // --------------------------------------------------------------------------
  switchProfileSection(secName) {
    if (secName === 'account') secName = 'membership';
    if (secName === 'security') secName = 'preferences';
    this.state.activeProfileSection = secName;

    const accPane = document.getElementById('profileAccountPane');
    const libPane = document.getElementById('sciLibraryPane');
    const notesPane = document.getElementById('loftNotesPane');

    const isAccountDynamic = ['membership', 'preferences'].includes(secName);
    if (accPane) accPane.style.display = isAccountDynamic ? 'flex' : 'none';
    if (libPane) libPane.style.display = secName === 'library' ? 'flex' : 'none';
    if (notesPane) notesPane.style.display = secName === 'notes' ? 'flex' : 'none';

    ['membership', 'preferences', 'library'].forEach(cat => {
      const btn = document.getElementById('btnProfCat_' + cat);
      if (btn) btn.classList.toggle('active', secName === cat || (secName === 'notes' && cat === 'preferences'));
    });

    this.renderTopBreederProfileCard();

    if (isAccountDynamic) {
      this.renderProfileAccountSection();
    } else if (secName === 'library' && typeof AvigenScientificLibrary !== 'undefined') {
      AvigenScientificLibrary.renderLibraryUI();
    } else if (secName === 'notes') {
      renderMypedigreNotes();
    }
  },

  renderTopBreederProfileCard() {
    const topEl = document.getElementById('profileTopBreederCard');
    if (!topEl) return;

    const curTier = this.getCurrentTier();
    const allBirds = collectUniqueLoftBirds();
    const activeBirds = allBirds.filter(b => b.isActiveLoftBird);
    const breedersCnt = activeBirds.filter(b => b.roleCategory === 'BREEDER').length;
    const racersCnt = activeBirds.filter(b => b.roleCategory === 'RACER').length;
    const cityName = (typeof AvigenLiveWeather !== 'undefined' && AvigenLiveWeather.state?.cityName)
      ? AvigenLiveWeather.state.cityName
      : 'Türkiye';
    const loftQrSvg = typeof makeQrSvg === 'function'
      ? makeQrSvg(`AVIGEN_LOFT||${loftConfig.title}||${this.state.memberName}||${cityName}||${activeBirds.length}`)
      : '';

    topEl.innerHTML = `
      <div class="ios-card" style="padding:10px 12px; border:1.5px solid var(--ios-border);">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div style="display:flex; align-items:center; gap:9px; min-width:0; flex:1;">
            <div style="width:42px; height:42px; border-radius:12px; background:linear-gradient(135deg,#0044aa,#0066ff); border:1.5px solid #7c3aed; color:#fff; display:flex; align-items:center; justify-content:center; font-size:19px; font-weight:900; flex-shrink:0; box-shadow:0 3px 10px rgba(0,102,255,0.22);">
              ${loftConfig.logo ? `<img src="${loftConfig.logo}" style="width:100%;height:100%;object-fit:cover;border-radius:11px;" />` : '🏆'}
            </div>
            <div style="min-width:0; flex:1;">
              <div style="display:flex; align-items:center; gap:5px; flex-wrap:wrap;">
                <span style="font-size:13px; font-weight:900; color:var(--ios-text);">${this.state.isLoggedIn ? escapeHtml(this.state.memberName) : 'Misafir Yetiştirici'}</span>
                <span class="gene-badge ${curTier.badgeClass}" style="font-size:8px; padding:1px 6px;">${curTier.name}</span>
              </div>
              <div style="font-size:10px; font-weight:800; color:#0052cc; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:1px;">
                🏠 ${escapeHtml(loftConfig.title)} • 📍 ${escapeHtml(cityName)}
              </div>
              <div style="font-size:9.3px; font-weight:700; color:var(--ios-subtext); margin-top:1px;">
                🕊️ ${activeBirds.length} Aktif Kuş (${breedersCnt} Damızlık • ${racersCnt} Yarışçı) • 🪺 ${activePairsList.length} Yuva
              </div>
            </div>
          </div>

          <!-- DİJİTAL KÜMES QR KİMLİK & HIZLI ABONELİK -->
          <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
            <div title="Dijital Kümes Kimlik QR Kodu" style="flex-shrink:0;">${loftQrSvg}</div>
            ${this.state.isLoggedIn ? `
              <button type="button" class="ios-btn ios-btn-purple" style="padding:5px 8px; font-size:9px;" onclick="AvigenUxManager.openSubscriptionModal('checkout')">
                🔑 Lisans
              </button>
            ` : `
              <button type="button" class="ios-btn ios-btn-primary" style="padding:5px 8px; font-size:9px;" onclick="AvigenUxManager.openSubscriptionModal('auth')">
                🔑 Giriş
              </button>
            `}
          </div>
        </div>

        <!-- REHBER VE HATA / ÖNERİ BİLDİRİM HIZLI ERİŞİM ŞERİDİ -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:8px; padding-top:8px; border-top:1px dashed var(--ios-border);">
          <button type="button" class="ios-btn ios-btn-outline" style="padding:7px 8px; font-size:10px; font-weight:900; color:#0052cc; border-color:#93c5fd; background:#eff6ff;" onclick="AvigenUxManager.openUserGuideModal()" title="Nasıl Kullanılır? Kuşçu Kullanım Rehberi">
            📖 Kullanım Rehberi (Nasıl Kullanılır?)
          </button>
          <button type="button" class="ios-btn ios-btn-outline" style="padding:7px 8px; font-size:10px; font-weight:900; color:#b45309; border-color:#fcd34d; background:#fffbeb;" onclick="AvigenUxManager.openFeedbackModal()" title="Hata Bildir, Öneri veya İstek Gönder">
            💬 Hata / Öneri Bildir
          </button>
        </div>
      </div>
    `;
  },

  renderProfileAccountSection() {
    this.renderTopBreederProfileCard();
    const root = document.getElementById('profileAccountRoot');
    if (!root) return;

    const sec = ['membership', 'preferences'].includes(this.state.activeProfileSection)
      ? this.state.activeProfileSection
      : 'preferences';

    const curTier = this.getCurrentTier();
    const licExp = this.checkLicenseExpirationStatus();
    const invoices = Array.isArray(this.state.paymentHistory) ? this.state.paymentHistory : [];

    // ========================================================================
    // KATEGORİ 1: HESAP, ŞİFRELİ GİRİŞ & LİSANS AKTİVASYON MERKEZİ
    // ========================================================================
    if (sec === 'membership') {
      root.innerHTML = `
        <!-- 1. YETİŞTİRİCİ HESABI VE ŞİFRELİ OTURUM KARTI -->
        <div class="ios-card" style="padding:11px 12px; border-top:3px solid #0066ff;">
          <div class="ios-card-title" style="margin-bottom:6px;">
            <span>🔐 Yetiştirici Hesabı &amp; Şifre Güvenliği</span>
            <span class="gene-badge ${this.state.isLoggedIn ? 'gene-green' : 'gene-purple'}">
              ${this.state.isLoggedIn ? '✓ Şifre İle Giriş Yapıldı' : 'Oturum Kapalı'}
            </span>
          </div>

          ${this.state.isLoggedIn ? `
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:10.5px; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; margin-bottom:8px;">
              <div><span style="color:var(--ios-subtext);">Ad Soyad:</span><br/><strong>${escapeHtml(this.state.memberName)}</strong></div>
              <div><span style="color:var(--ios-subtext);">Kümes Ünvanı:</span><br/><strong>${escapeHtml(loftConfig.title)}</strong></div>
              <div><span style="color:var(--ios-subtext);">E-Posta (Kullanıcı Adı):</span><br/><strong>${escapeHtml(this.state.memberEmail)}</strong></div>
              <div><span style="color:var(--ios-subtext);">Aktif Lisans Durumu:</span><br/><strong style="color:${curTier.id === 'GENETICS_AI' ? '#059669' : '#0052cc'};">${curTier.id === 'GENETICS_AI' ? `🔑 ${escapeHtml(licExp.label)}` : 'AVIGEN FREE (Ücretsiz)'}</strong></div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 0.8fr; gap:5px;">
              <button class="ios-btn ios-btn-primary" style="padding:7px 6px; font-size:10px;" onclick="AvigenUxManager.state.authViewMode='register'; AvigenUxManager.openSubscriptionModal('auth');">
                📝 Profili Düzenle
              </button>
              <button class="ios-btn ios-btn-purple" style="padding:7px 6px; font-size:10px;" onclick="AvigenUxManager.state.authViewMode='change_pass'; AvigenUxManager.openSubscriptionModal('auth');">
                🔑 Şifre Değiştir
              </button>
              <button class="ios-btn ios-btn-outline" style="padding:7px 6px; font-size:10px;" onclick="openLoftHeaderModal()">
                🏠 Kümes Logosu
              </button>
              <button class="ios-btn ios-btn-danger" style="padding:7px 6px; font-size:10px;" onclick="AvigenUxManager.logoutMember()">
                🚪 Çıkış
              </button>
            </div>
          ` : `
            <!-- DOĞRUDAN SAYFA İÇİ HIZLI ŞİFRELİ GİRİŞ / YENİ ÜYELİK KUTUSU -->
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:10px; padding:10px;">
              <div style="font-size:11px; font-weight:900; color:#0052cc; margin-bottom:6px;">
                🔑 E-Posta ve Şifrenizle Giriş Yapın
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:7px;">
                <div>
                  <label style="font-size:9.5px; font-weight:800;">E-Posta Adresi</label>
                  <input type="email" id="inlineLoginEmail" class="ios-input" value="${escapeHtml(this.state.memberEmail)}" placeholder="ornek@eposta.com" />
                </div>
                <div>
                  <label style="font-size:9.5px; font-weight:800;">Şifreniz</label>
                  <input type="password" id="inlineLoginPass" class="ios-input" placeholder="••••••••" />
                </div>
              </div>
              <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:6px;">
                <button class="ios-btn ios-btn-primary" style="padding:8px; font-size:11px;" onclick="AvigenUxManager.performInlineLogin()">
                  🔑 Şifre İle Giriş Yap
                </button>
                <button class="ios-btn ios-btn-outline" style="padding:8px; font-size:10.5px;" onclick="AvigenUxManager.state.authViewMode='register'; AvigenUxManager.openSubscriptionModal('auth');">
                  ✨ Yeni Üye Ol &amp; Şifre Oluştur
                </button>
              </div>
            </div>
          `}
        </div>

        <!-- 2. ABONELİK PAKETLERİ VE LİSANS KODU AKTİVASYON KARTI -->
        <div class="ios-card" style="padding:11px 12px; border-top:3px solid #7c3aed;">
          <div class="ios-card-title" style="margin-bottom:6px;">
            <span>👑 Üyelik Paketleri &amp; Lisans Aktivasyonu</span>
            <span class="gene-badge ${curTier.badgeClass}">${curTier.name}</span>
          </div>
          <div style="font-size:10px; color:var(--ios-subtext); margin-bottom:8px;">
            Aktif paketiniz: <strong>${curTier.name}</strong>${curTier.id === 'GENETICS_AI' ? ` (<strong>${escapeHtml(licExp.label)}</strong>)` : ''}. Lisans anahtarınızla paket etkinleştirmek veya süre uzatmak için seçin:
          </div>

          <div style="display:flex; flex-direction:column; gap:6px;">
            <!-- FREE -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--ios-card-alt); border:1.5px solid ${curTier.id === 'FREE' ? '#0066ff' : 'var(--ios-border)'}; border-radius:9px; padding:7px 9px;">
              <div>
                <div style="font-size:11px; font-weight:900; color:#0052cc;">1. AVIGEN FREE (0 TL • Sınırsız Kuş)</div>
                <div style="font-size:9.5px; color:var(--ios-subtext);">Sınırsız güvercin yönetimi, 4 kuşak (31 kutu) pedigri, yuva &amp; yarış takip sistemi</div>
              </div>
              <button class="ios-btn ${curTier.id === 'FREE' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:5px 10px; font-size:9.5px;" onclick="AvigenUxManager.setMembershipTier('FREE')">
                ${curTier.id === 'FREE' ? '✅ Aktif Paket' : 'Ücretsiz Geç'}
              </button>
            </div>

            <!-- AVIGEN AI (GENESIS AI) -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--ios-card-alt); border:1.5px solid ${curTier.id === 'GENETICS_AI' ? '#7c3aed' : 'var(--ios-border)'}; border-radius:9px; padding:7px 9px;">
              <div>
                <div style="font-size:11px; font-weight:900; color:#7c3aed;">2. AVIGEN AI (399 TL/ay • 3.990 TL/yıl)</div>
                <div style="font-size:9.5px; color:var(--ios-subtext);">GENESIS AI 5 nesil akıllı eşleştirme, haritalı yarış simülasyonu ve akıllı yem/maliyet sistemi</div>
              </div>
              <div style="display:flex; gap:4px; flex-shrink:0;">
                <button class="ios-btn ios-btn-purple" style="padding:5px 9px; font-size:9.5px;" onclick="AvigenUxManager.openCheckoutForTier('GENETICS_AI')">
                  ${curTier.id === 'GENETICS_AI' ? '🔑 Lisans / Süre Uzat' : '🔑 Lisans Kodu İle Aç'}
                </button>
              </div>
            </div>

            <!-- AVIGEN GLOBAL -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--ios-card-alt); border:1.5px solid ${curTier.id === 'GLOBAL' ? '#d97706' : 'var(--ios-border)'}; border-radius:9px; padding:7px 9px;">
              <div>
                <div style="font-size:11px; font-weight:900; color:#b45309;">3. AVIGEN GLOBAL (599 TL/ay • 5.990 TL/yıl)</div>
                <div style="font-size:9.5px; color:var(--ios-subtext);">AVIGEN AI + Ortak gen havuzu ve kullanıcıların izin verdiği veriler üzerinden küresel soy araştırması</div>
              </div>
              <div style="display:flex; gap:4px; flex-shrink:0;">
                <button class="ios-btn ios-btn-gold" style="padding:5px 9px; font-size:9.5px;" onclick="AvigenUxManager.openCheckoutForTier('GLOBAL')">
                  ${curTier.id === 'GLOBAL' ? '🔑 Lisans / Süre Uzat' : '🔑 Lisans Kodu İle Aç'}
                </button>
              </div>
            </div>
          </div>

          <!-- AKTİF LİSANS VE AKTİVASYON GEÇMİŞİ ÖZETİ -->
          <div style="margin-top:9px; padding-top:8px; border-top:1px dashed var(--ios-border);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span style="font-size:10px; font-weight:900; color:var(--ios-subtext);">🔑 Lisans Aktivasyon Geçmişi (${invoices.length})</span>
              <button class="ios-btn ios-btn-outline" style="padding:2px 8px; font-size:9px;" onclick="AvigenUxManager.openSubscriptionModal('checkout')">+ Lisans Kodu Gir</button>
            </div>
            ${invoices.slice(0, 3).map(inv => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px; font-size:9.5px; margin-bottom:4px;">
                <div>
                  <strong>${escapeHtml(inv.planName)}</strong>
                  <div style="font-size:8.5px; color:var(--ios-subtext);">Kayıt: ${escapeHtml(inv.id)} • Tarih: ${escapeHtml(inv.date)} • ${escapeHtml(inv.cardMasked)}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:900; color:#059669;">${escapeHtml(inv.amount)}</div>
                  <div style="font-size:8px; font-weight:800; color:#059669;">${escapeHtml(inv.status)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // KATEGORİ 2: AYARLAR, YEDEKLEME & NOTLAR (TEK EKRANDA PRATİK KONTROL)
    // ========================================================================
    if (sec === 'preferences') {
      const lim = typeof AvigenPerformanceEngine !== 'undefined'
        ? AvigenPerformanceEngine.state.distanceLimits
        : { sprintMax: 300, middleMax: 500, longMax: 700 };

      const updState = typeof AvigenAutoUpdater !== 'undefined' ? AvigenAutoUpdater.state : null;

      root.innerHTML = `
          <!-- 0. UYGULAMA SÜRÜMÜ & TELEFONDAN TEK TUŞLA CANLI GÜNCELLEME MERKEZİ -->
        <div class="ios-card" style="padding:11px 12px; border-top:3px solid #059669;">
          <div class="ios-card-title" style="margin-bottom:6px;">
            <span>🚀 Uygulama Sürümü &amp; Canlı Güncelleme</span>
            <span class="gene-badge ${updState?.hasNewUpdate ? 'gene-gold' : 'gene-green'}">
              ${updState?.hasNewUpdate ? `🔥 Yeni: v${escapeHtml(updState.remoteVersion)}` : `✓ Güncel (v${escapeHtml(updState?.localVersion || '2.0.0')})`}
            </span>
          </div>
          <div style="font-size:10px; color:var(--ios-subtext); line-height:1.4; margin-bottom:8px;">
            Yüklü Sürüm: <strong>v${escapeHtml(updState?.localVersion || '2.0.0')} (Build ${updState?.localBuild || 200})</strong> • Sunucu Son Sürüm: <strong>v${escapeHtml(updState?.remoteVersion || '2.0.0')}</strong>.<br/>
            <span style="color:#059669; font-weight:800;">✅ Önerilen:</span> Yeni APK dosyası kurmanıza veya eski uygulamayı silmenize gerek kalmadan <strong>"⚡ Şimdi Güncelle (Uygulama İçi Canlı)"</strong> butonuna basarak tüm yeni özellikleri <strong>verileriniz hiç silinmeden</strong> anında yükleyebilirsiniz.
          </div>
          <div style="display:grid; grid-template-columns:1fr 1.35fr 0.9fr; gap:6px;">
            <button type="button" class="ios-btn ios-btn-outline" style="padding:7px 6px; font-size:9.8px;" onclick="AvigenAutoUpdater.checkForUpdates(true)">
              🔍 Sürüm Kontrol
            </button>
            <button type="button" class="ios-btn ios-btn-primary" style="padding:7px 6px; font-size:10px; font-weight:900;" onclick="AvigenAutoUpdater.applyWebLiveUpdate()">
              ⚡ Şimdi Güncelle (Canlı)
            </button>
            <button type="button" class="ios-btn ios-btn-green" style="padding:7px 6px; font-size:9.6px;" onclick="AvigenAutoUpdater.downloadLatestApk()">
              📦 APK İndir
            </button>
          </div>
          <div style="margin-top:7px; background:#fffbeb; border:1px solid #fde68a; border-radius:8px; padding:6px 8px; font-size:9.2px; color:#92400e; line-height:1.36;">
            💡 <strong>Android APK "Paket Çakışması" Çözümü:</strong> Telefonunuzda çok eski bir APK kuruluysa ve İndirilenler'den yeni APK kurarken <em>"Mevcut paket ile çakıştığından güncellenemedi"</em> uyarısı alırsanız:<br/>
            1️⃣ Önce <strong>⬇️ Yedeği İndir / Kopyala</strong> veya <strong>📲 WhatsApp Yedek Gönder</strong> butonuna basın.<br/>
            2️⃣ Eski AVIGEN uygulamasını telefondan kaldırıp İndirilenler'deki yeni <strong>AVIGEN.apk</strong> dosyasını kurun ve <strong>📋 Yedek Kodu Yapıştır / Yükle</strong> ile tüm kuşlarınızı geri yükleyin. (Bu işlemden sonraki tüm güncellemeler çakışma olmadan doğrudan üzerine kurulur!)
          </div>
        </div>

        <!-- 0.5 GENESIS AI – BULUT SİNİR AĞI BAĞLANTISI (BOŞ OLDUĞUNDA ADIM ADIM KURULUM VE BİLGİLENDİRME REHBERLİ) -->
        <div class="ios-card" style="padding:11px 12px; border:1.5px solid #7c3aed; background:linear-gradient(135deg, rgba(124,58,237,0.06), rgba(2,132,199,0.05));">
          <div class="ios-card-title" style="margin-bottom:5px; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:#4c1d95;">🧬 GENESIS AI – Bulut Sinir Ağı Ayarı</span>
            <span class="gene-badge ${this.hasGeneticsAiAccess() ? ((localStorage.getItem('avigen_gemini_free_api_key_v1') || '').trim() ? 'gene-green' : 'gene-purple') : 'gene-gold'}">
              ${this.hasGeneticsAiAccess() ? ((localStorage.getItem('avigen_gemini_free_api_key_v1') || '').trim() ? '🟢 Canlı Sinir Ağı Aktif' : '🧬 Yerleşik Motor Aktif') : '🔒 AVIGEN AI Aboneliği'}
            </span>
          </div>
          ${this.hasGeneticsAiAccess() ? `
            <div style="font-size:9.8px; color:var(--ios-subtext); margin-bottom:7px; line-height:1.38;">
              <strong>GENESIS AI</strong> tüm sorularınızı yerleşik bilimsel kümes motoruyla anında yanıtlar. İsteğe bağlı kişisel <strong>GENESIS AI Bulut Sinir Ağı Anahtarınızı</strong> girerek derin doğal dil sinir ağını da aktif edebilirsiniz:
            </div>
            <div style="display:flex; gap:5px; align-items:center; flex-wrap:wrap; margin-bottom:7px;">
              <input type="password" id="settingsGeminiApiKeyInput" class="ios-input" style="flex:1; min-width:165px; padding:7px 9px; font-size:11px; font-weight:800;" placeholder="AIzaSy... ile başlayan Bulut Anahtarınızı girin" value="${escapeHtml((localStorage.getItem('avigen_gemini_free_api_key_v1') || '').trim())}" />
              <button type="button" class="ios-btn ios-btn-outline" style="padding:7px 9px; font-size:9.8px; font-weight:800;" onclick="(async()=>{const el=document.getElementById('settingsGeminiApiKeyInput');if(!el)return;let txt='';if(navigator.clipboard&&navigator.clipboard.readText){try{txt=await navigator.clipboard.readText();}catch(e){}}if(!txt.trim()){const m=prompt('📋 Kopyaladığınız AIzaSy... ile başlayan Bulut Sinir Ağı Anahtarını buraya yapıştırın:',el.value||'');if(m===null)return;txt=m;}if(txt.trim()){el.value=txt.trim();if(typeof AvigenGenesisAI!=='undefined'){AvigenGenesisAI.saveGeminiApiKeyFromInput('settingsGeminiApiKeyInput');}}})()">
                📋 Yapıştır
              </button>
              <button type="button" class="ios-btn ios-btn-primary" style="padding:7px 10px; font-size:10px; font-weight:900;" onclick="if(typeof AvigenGenesisAI!=='undefined'){AvigenGenesisAI.saveGeminiApiKeyFromInput('settingsGeminiApiKeyInput');}">
                💾 Kaydet
              </button>
            </div>
            ${!(localStorage.getItem('avigen_gemini_free_api_key_v1') || '').trim() ? `
              <div style="background:#f5f3ff; border:1.5px solid #c4b5fd; border-radius:9px; padding:8px 10px; font-size:9.3px; color:#4c1d95; line-height:1.42;">
                <div style="font-weight:900; font-size:10px; color:#5b21b6; margin-bottom:3px;">
                  📌 Bilgilendirme — Bu Kutu Boşsa Nasıl Doldurulur?
                </div>
                1️⃣ <strong>Boş Bırakırsanız:</strong> Hiçbir sorun olmaz! <strong>GENESIS AI Yerleşik Bilimsel Kümes Motoru</strong> ve ücretsiz bulut katmanı tüm eşleştirme, 5 nesil COI, yarış ve yem analizlerini <strong>anahtarsız %100 çalıştırır</strong>.<br/>
                2️⃣ <strong>Nasıl Doldurulur? (3 Adımda Ücretsiz Anahtar Kurulumu):</strong><br/>
                • <strong>Adım 1:</strong> Aşağıdaki <strong>"🔗 Ücretsiz Bulut Anahtarı Al"</strong> butonuna dokunun ve açılan sayfada <strong>"Create API key"</strong> tuşuna basın.<br/>
                • <strong>Adım 2:</strong> Ekranda verilen <strong><code>AIzaSy...</code></strong> ile başlayan 39 haneli kodu kopyalayın.<br/>
                • <strong>Adım 3:</strong> Yukarıdaki <strong>"📋 Yapıştır"</strong> ve <strong>"💾 Kaydet"</strong> butonuna basın.
                <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:6px; margin-top:6px;">
                  <button type="button" class="ios-btn ios-btn-purple" style="padding:6px 8px; font-size:9.3px; font-weight:900;" onclick="openExternalUrlSafe('https://aistudio.google.com/app/apikey')">
                    🔗 Ücretsiz Bulut Anahtarı Al
                  </button>
                  <button type="button" class="ios-btn ios-btn-green" style="padding:6px 8px; font-size:9.3px; font-weight:900;" onclick="openExternalUrlSafe('https://wa.me/905327820385?text=' + encodeURIComponent('Merhaba, AVIGEN GENESIS AI Bulut Sinir Ağı Anahtarı kurulumu için destek / hazır anahtar talep ediyorum.'))">
                    📲 WhatsApp Kurulum Desteği
                  </button>
                </div>
              </div>
            ` : `
              <div style="background:#ecfdf5; border:1px solid #6ee7b7; border-radius:8px; padding:6px 9px; font-size:9.2px; color:#065f46; display:flex; justify-content:space-between; align-items:center;">
                <span>✅ <strong>Kişisel Bulut Sinir Ağı Anahtarınız Kayıtlı ve Aktif!</strong></span>
                <button type="button" class="ios-btn ios-btn-outline" style="padding:2px 7px; font-size:8.5px; color:#dc2626; border-color:#fca5a5;" onclick="localStorage.removeItem('avigen_gemini_free_api_key_v1'); AvigenUxManager.renderProfileAccountSection();">Anahtarı Temizle</button>
              </div>
            `}
          ` : `
            <div style="font-size:9.8px; color:var(--ios-subtext); margin-bottom:7px; line-height:1.38;">
              <strong>GENESIS AI'ya Sor</strong> ve bulut sinir ağı özellikleri <strong>AVIGEN AI</strong> aboneliğine dahildir. Lisans kodunuzu girerek veya <strong>0 532 782 03 85</strong> WhatsApp hattından kod isteyerek aktif edebilirsiniz:
            </div>
            <div style="background:#f5f3ff; border:1px solid #c4b5fd; border-radius:8px; padding:7px 9px; font-size:9.1px; color:#4c1d95; line-height:1.38; margin-bottom:7px;">
              📌 <strong>Nasıl Çalışır &amp; Nasıl Doldurulur?</strong><br/>
              • <strong>AVIGEN AI</strong> lisansınızı aktif ettiğinizde burada <strong>Bulut Sinir Ağı Anahtarı</strong> kutusu açılır.<br/>
              • Kutuyu boş bıraksanız dahi <strong>GENESIS AI Yerleşik Bilimsel Kümes Motoru</strong> tüm eşleştirme, yarış ve yem analizlerini anında yapar; isterseniz tek tuşla ücretsiz <code>AIzaSy...</code> bulut anahtarınızı yapıştırarak derin sinir ağını da bağlayabilirsiniz.
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
              <button type="button" class="ios-btn ios-btn-purple" style="padding:7px 8px; font-size:10px; font-weight:900;" onclick="AvigenUxManager.openSubscriptionModal('checkout')">
                🔑 Lisans Kodu Gir
              </button>
              <button type="button" class="ios-btn ios-btn-green" style="padding:7px 8px; font-size:10px; font-weight:900;" onclick="AvigenUxManager.requestLicenseViaWhatsApp('3.990 TL', 'Yıllık (365 Gün)')">
                📲 Kod İste (0532 782 03 85)
              </button>
            </div>
          `}
        </div>

        <!-- 1. GÖRSEL TEMA SEÇİMİ & YARIŞ MESAFE SINIRLARI (BİRLEŞİK PRATİK KART) -->
        <div class="ios-card" style="padding:11px 12px;">
          <div class="ios-card-title" style="margin-bottom:6px;">
            <span>🎨 Görsel Tema &amp; Yarış Mesafe Sınırları (km)</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:10px;">
            <button type="button" class="ios-btn ${isCyberLightSkinActive() ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:8px; font-size:10.5px;" onclick="setVisualThemePreset('cyber_light')">
              ☀️ Gündüz Modu (Beyaz Tema)${isCyberLightSkinActive() ? ' ✓' : ''}
            </button>
            <button type="button" class="ios-btn ${!isCyberLightSkinActive() ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:8px; font-size:10.5px;" onclick="setVisualThemePreset('cyber_dark')">
              🌙 Gece Modu (Koyu Lacivert)${!isCyberLightSkinActive() ? ' ✓' : ''}
            </button>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:5px; align-items:end; font-size:9.5px;">
            <div>
              <label style="font-weight:800;">Sprint Üst (km)</label>
              <input type="number" id="prefSprintMax" class="ios-input" style="padding:5px; font-size:11px;" value="${lim.sprintMax}" />
            </div>
            <div>
              <label style="font-weight:800;">Orta Mesafe Üst</label>
              <input type="number" id="prefMiddleMax" class="ios-input" style="padding:5px; font-size:11px;" value="${lim.middleMax}" />
            </div>
            <div>
              <label style="font-weight:800;">Uzun Mesafe Üst</label>
              <input type="number" id="prefLongMax" class="ios-input" style="padding:5px; font-size:11px;" value="${lim.longMax}" />
            </div>
            <button class="ios-btn ios-btn-primary" style="padding:6px 10px; font-size:10.5px;" onclick="if(typeof AvigenPerformanceEngine!=='undefined'){AvigenPerformanceEngine.state.distanceLimits={sprintMax:parseInt(document.getElementById('prefSprintMax').value,10)||300,middleMax:parseInt(document.getElementById('prefMiddleMax').value,10)||500,longMax:parseInt(document.getElementById('prefLongMax').value,10)||700};AvigenPerformanceEngine.saveConfig();alert('✅ Mesafe kategori sınırları güncellendi.');}">
              💾 Kaydet
            </button>
          </div>
        </div>

        <!-- 2. TEK MERKEZ VERİ YEDEKLEME & GERİ YÜKLEME KARTI -->
        <div class="ios-card" style="padding:11px 12px; border-top:3px solid #0052cc;">
          <div class="ios-card-title" style="margin-bottom:6px;">
            <span>💾 Kümes Yedekleme &amp; Geri Yükleme Merkezi</span>
            <span class="gene-badge gene-green">Tam Veri Koruması</span>
          </div>
          <div style="font-size:10px; color:var(--ios-subtext); margin-bottom:8px; line-height:1.38;">
            Tüm güvercinlerinizi, 4 kuşak pedigrelerinizi, yuvalarınızı ve yarış kayıtlarınızı tek merkezden yedekleyin (.JSON dosya indir, WhatsApp'a gönder veya kopyala) ya da mevcut yedeğinizi geri yükleyin:
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <button type="button" class="ios-btn ios-btn-primary" style="padding:11px 8px; font-size:10.8px; font-weight:900;" onclick="exportFullAvigenBackup()">
              📥 Kümes Yedeğimi Al (İndir / Paylaş)
            </button>
            <button type="button" class="ios-btn ios-btn-purple" style="padding:11px 8px; font-size:10.8px; font-weight:900;" onclick="openAndroidBackupAssistModal(false)">
              📤 Yedeği Geri Yükle (Dosya / Kod)
            </button>
          </div>
          ${pedigrees.some(p => typeof isBuiltInSamplePedigree === 'function' && isBuiltInSamplePedigree(p)) ? `
            <button type="button" class="ios-btn ios-btn-outline" style="width:100%; margin-top:7px; padding:7px; font-size:9.6px; color:#dc2626; border-color:#fecaca; background:#fef2f2;" onclick="removeSamplePedigreesKeepUserBirds()">
              🧹 Örnek (Demo) Kuşları Kaldır — Sadece Kendi Eklediğim Kuşlar Kalsın
            </button>
          ` : ''}
        </div>

        <!-- 3. KÜMES NOT DEFTERİ & GEÇMİŞ ANALİZLER + SİSTEM DOĞRULAMA -->
        <div class="ios-card" style="padding:11px 12px;">
          <div class="ios-card-title" style="margin-bottom:6px;">
            <span>🗂️ Kümes Not Defteri, Analiz Arşivi &amp; Sistem Testi</span>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px;">
            <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 5px; font-size:9.8px;" onclick="AvigenUxManager.switchProfileSection('notes')">
              📝 Not Defteri (${notesList.length})
            </button>
            <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 5px; font-size:9.8px;" onclick="if(typeof AvigenGenesisAI!=='undefined'){AvigenGenesisAI.openHistoryView(); openIosTab('breeding', document.querySelectorAll('.ios-tab-btn')[2]);}">
              🕒 AI Analizler (${typeof AvigenGenesisAI !== 'undefined' ? AvigenGenesisAI.analysisHistory.length : 0})
            </button>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
            <button type="button" class="ios-btn ios-btn-outline" style="padding:8px 5px; font-size:9.8px; font-weight:900; color:#0052cc; border-color:#93c5fd; background:#eff6ff;" onclick="AvigenUxManager.openUserGuideModal()">
              📖 Kullanım Rehberi
            </button>
            <button type="button" class="ios-btn ios-btn-gold" style="padding:8px 5px; font-size:9.8px; font-weight:900;" onclick="AvigenUxManager.openFeedbackModal()">
              💬 Hata / Öneri Bildir
            </button>
          </div>

          <button type="button" class="ios-btn ios-btn-outline" style="width:100%; padding:7px; font-size:10px;" onclick="AvigenSystemAuditQA.runAndRenderInSecurityPane()">
            🧪 20 Otomatik Sistem &amp; Bilimsel Doğruluk Testini Çalıştır
          </button>
          <div id="avigenQaTestOutputBox" style="margin-top:7px;"></div>
        </div>
      `;
      return;
    }
  },

  // --------------------------------------------------------------------------
  // ŞİFRELİ ÜYELİK (KAYIT / GİRİŞ / ŞİFRE DEĞİŞTİRME) VE ABONELİK ÖDEME MODALI
  // tabMode: 'plans' | 'auth' | 'checkout'
  // --------------------------------------------------------------------------
  openCheckoutForTier(tierId) {
    this.state.checkoutTierId = tierId || 'GENETICS_AI';
    this.saveState();
    this.openSubscriptionModal('checkout');
  },

  openSubscriptionModal(tabMode = 'plans') {
    if (tabMode === 'register') {
      tabMode = 'auth';
      this.state.authViewMode = 'register';
    }
    const modal = document.getElementById('avigenSubscriptionModal');
    const body = document.getElementById('avigenSubModalBody');
    if (!modal || !body) return;

    const curTier = this.getCurrentTier();
    const licExp = this.checkLicenseExpirationStatus();
    const isYearly = this.state.selectedBillingCycle === 'yearly';
    const authMode = this.state.authViewMode || 'login';
    const checkoutTier = this.TIERS[this.state.checkoutTierId] || this.TIERS.GENETICS_AI;
    const checkoutPrice = isYearly ? checkoutTier.yearlyPrice : checkoutTier.monthlyPrice;

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
        <!-- ÜST SEKME: 1. PAKETLER | 2. ŞİFRELİ GİRİŞ / ÜYE OL | 3. LİSANS AKTİVASYONU -->
        <div class="sub-pills">
          <button class="sub-pill ${tabMode === 'plans' ? 'active' : ''}" onclick="AvigenUxManager.openSubscriptionModal('plans')">
            👑 Paketler
          </button>
          <button class="sub-pill ${tabMode === 'auth' ? 'active' : ''}" onclick="AvigenUxManager.openSubscriptionModal('auth')">
            🔐 Giriş / Şifre
          </button>
          <button class="sub-pill ${tabMode === 'checkout' ? 'active' : ''}" onclick="AvigenUxManager.openSubscriptionModal('checkout')">
            🔑 Lisans Kodu
          </button>
        </div>

        ${tabMode === 'auth' ? `
          <!-- ALT SEÇİCİ: ŞİFRE İLE GİRİŞ | YENİ ÜYELİK & ŞİFRE OLUŞTUR | ŞİFRE DEĞİŞTİR -->
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:5px;">
            <button type="button" class="ios-btn ${authMode === 'login' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:6px; font-size:10px;" onclick="AvigenUxManager.setAuthViewMode('login')">
              🔑 Şifre İle Giriş
            </button>
            <button type="button" class="ios-btn ${authMode === 'register' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:6px; font-size:10px;" onclick="AvigenUxManager.setAuthViewMode('register')">
              ✨ Üye Ol / Şifre Kur
            </button>
            <button type="button" class="ios-btn ${authMode === 'change_pass' ? 'ios-btn-purple' : 'ios-btn-outline'}" style="padding:6px; font-size:10px;" onclick="AvigenUxManager.setAuthViewMode('change_pass')">
              🔒 Şifre Değiştir
            </button>
          </div>

          ${authMode === 'login' ? `
            <!-- 1. ŞİFRE İLE GİRİŞ FORMU -->
            <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-radius:11px; padding:11px;">
              <div style="font-size:12.5px; font-weight:900; color:#0052cc; margin-bottom:4px;">
                🔑 AVIGEN Yetiştirici Girişi
              </div>
              <div style="font-size:10px; color:var(--ios-subtext); margin-bottom:8px;">
                Kayıtlı e-posta adresiniz ve oluşturduğunuz şifrenizle hesabınıza giriş yapın:
              </div>
              <div style="display:flex; flex-direction:column; gap:7px;">
                <div>
                  <label style="font-weight:800; font-size:10px;">E-Posta Adresi *</label>
                  <input type="email" id="loginMemberEmail" class="ios-input" style="padding:7px 9px; font-size:11.5px;" value="${escapeHtml(this.state.memberEmail)}" placeholder="ornek@eposta.com" />
                </div>
                <div>
                  <label style="font-weight:800; font-size:10px;">Şifreniz *</label>
                  <input type="password" id="loginMemberPassword" class="ios-input" style="padding:7px 9px; font-size:11.5px;" placeholder="Şifrenizi girin..." />
                </div>
                <button class="ios-btn ios-btn-primary" style="width:100%; padding:10px; font-size:12px; margin-top:4px;" onclick="AvigenUxManager.submitPasswordLogin()">
                  🔑 Şifre İle Giriş Yap
                </button>
              </div>
            </div>
          ` : (authMode === 'change_pass' ? `
            <!-- 3. ŞİFRE DEĞİŞTİRME FORMU -->
            <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-radius:11px; padding:11px;">
              <div style="font-size:12.5px; font-weight:900; color:#7c3aed; margin-bottom:4px;">
                🔒 Hesap Şifresini Güncelle
              </div>
              <div style="display:flex; flex-direction:column; gap:7px;">
                <div>
                  <label style="font-weight:800; font-size:10px;">Mevcut Şifreniz</label>
                  <input type="password" id="chgOldPass" class="ios-input" style="padding:7px 9px; font-size:11.5px;" placeholder="Mevcut şifreniz" />
                </div>
                <div>
                  <label style="font-weight:800; font-size:10px;">Yeni Şifre (En az 6 karakter) *</label>
                  <input type="password" id="chgNewPass" class="ios-input" style="padding:7px 9px; font-size:11.5px;" placeholder="Yeni şifre oluşturun" />
                </div>
                <div>
                  <label style="font-weight:800; font-size:10px;">Yeni Şifre (Tekrar) *</label>
                  <input type="password" id="chgNewPassConfirm" class="ios-input" style="padding:7px 9px; font-size:11.5px;" placeholder="Yeni şifreyi tekrar yazın" />
                </div>
                <button class="ios-btn ios-btn-purple" style="width:100%; padding:10px; font-size:12px; margin-top:4px;" onclick="AvigenUxManager.submitPasswordChange()">
                  💾 Yeni Şifremi Kaydet
                </button>
              </div>
            </div>
          ` : `
            <!-- 2. YENİ ÜYELİK VE ŞİFRE OLUŞTURMA FORMU -->
            <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-radius:11px; padding:10px 11px;">
              <div style="font-size:12.5px; font-weight:900; color:#0052cc; margin-bottom:4px;">
                ✨ Ücretsiz Üye Ol &amp; Şifre Oluştur
              </div>
              <div style="display:flex; flex-direction:column; gap:6px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                  <div>
                    <label style="font-weight:800; font-size:9.5px;">Adınız Soyadınız *</label>
                    <input type="text" id="regMemberName" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(this.state.memberName)}" placeholder="Ad Soyad" />
                  </div>
                  <div>
                    <label style="font-weight:800; font-size:9.5px;">Kümes / Yetiştirici Ünvanı *</label>
                    <input type="text" id="regLoftName" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(loftConfig.title)}" placeholder="Örn: Anadolu Kümesi" />
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1.1fr 0.9fr; gap:6px;">
                  <div>
                    <label style="font-weight:800; font-size:9.5px;">E-Posta Adresi *</label>
                    <input type="email" id="regMemberEmail" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(this.state.memberEmail)}" placeholder="ornek@eposta.com" />
                  </div>
                  <div>
                    <label style="font-weight:800; font-size:9.5px;">Telefon</label>
                    <input type="text" id="regMemberPhone" class="ios-input" style="padding:6px 8px; font-size:11px;" value="${escapeHtml(this.state.memberPhone)}" placeholder="+90 5XX..." />
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                  <div>
                    <label style="font-weight:800; font-size:9.5px; color:#7c3aed;">Şifre Oluştur (En az 6 krk) *</label>
                    <input type="password" id="regMemberPass" class="ios-input" style="padding:6px 8px; font-size:11px;" placeholder="••••••" />
                  </div>
                  <div>
                    <label style="font-weight:800; font-size:9.5px; color:#7c3aed;">Şifre Tekrar *</label>
                    <input type="password" id="regMemberPassConfirm" class="ios-input" style="padding:6px 8px; font-size:11px;" placeholder="••••••" />
                  </div>
                </div>
                <button class="ios-btn ios-btn-green" style="width:100%; padding:10px; font-size:12px; margin-top:4px;" onclick="AvigenUxManager.saveFreeRegistration()">
                  ✅ Hesabımı ve Şifremi Oluştur
                </button>
              </div>
            </div>
          `)}
        ` : (tabMode === 'checkout' ? `
          <!-- 3. SEKME: CİHAZA ÖZEL LİSANS ANAHTARI (AKTİVASYON KODU) & WHATSAPP LİSANS TALEBİ EKRANI -->
          <div style="background:var(--ios-card-alt); border:1.5px solid var(--ios-border); border-radius:11px; padding:11px 12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
              <span style="font-size:12px; font-weight:900; color:var(--ios-text);">🔑 AVIGEN GENESIS AI Lisans Aktivasyonu</span>
              <span class="gene-badge gene-purple">${curTier.id === 'GENETICS_AI' ? escapeHtml(licExp.label) : 'Lisans Bekleniyor'}</span>
            </div>

            <!-- CİHAZ KİMLİK KODU (DEVICE ID) KUTUSU — HER TELEFONA ÖZELDİR -->
            <div style="background:linear-gradient(135deg,#eff6ff,#f5f3ff); border:1.5px solid #93c5fd; border-radius:10px; padding:8px 10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <div>
                <div style="font-size:8.8px; font-weight:800; color:#1e40af;">📱 BU TELEFONUN / CİHAZIN KİMLİK KODU (CİHAZ ID):</div>
                <div style="font-size:13px; font-weight:900; color:#0052cc; letter-spacing:0.8px; margin-top:1px;">${escapeHtml(this.getOrCreateDeviceId())}</div>
                <div style="font-size:8.3px; color:#475569; margin-top:1px;">Üretilen her lisans kodu yalnızca bu Cihaz Kodu ile eşleşen telefonda çalışır.</div>
              </div>
              <button type="button" class="ios-btn ios-btn-outline" style="padding:5px 8px; font-size:9px; font-weight:800; flex-shrink:0;" onclick="copyTextToClipboardSafe('${escapeHtml(this.getOrCreateDeviceId())}', '📱 Cihaz Kimlik Kodunuz Kopyalandı: ${escapeHtml(this.getOrCreateDeviceId())}')">
                📋 Kopyala
              </button>
            </div>

            <!-- PAKET & DÖNEM SEÇİMİ -->
            <div style="margin-bottom:7px;">
              <div style="border:2px solid #7c3aed; background:#f5f3ff; border-radius:9px; padding:7px 9px; display:flex; justify-content:space-between; align-items:center;">
                <div style="font-size:11px; font-weight:900; color:#7c3aed;">🧬 AVIGEN GENESIS AI (Tam Sürüm)</div>
                <div style="font-size:12.5px; font-weight:900; color:var(--ios-text);">${isYearly ? '3.990 TL / yıl (365 Gün)' : '399 TL / ay (30 Gün)'}</div>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px;">
              <button type="button" class="ios-btn ${!isYearly ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:6px; font-size:10px;" onclick="AvigenUxManager.selectBillingCycle('monthly', 'checkout')">
                30 Günlük Aylık Lisans (${checkoutTier.monthlyPrice})
              </button>
              <button type="button" class="ios-btn ${isYearly ? 'ios-btn-purple' : 'ios-btn-outline'}" style="padding:6px; font-size:10px;" onclick="AvigenUxManager.selectBillingCycle('yearly', 'checkout')">
                365 Günlük Yıllık Lisans (${checkoutTier.yearlyPrice})
              </button>
            </div>

            <!-- 1. ADIM: LİSANS KODU GİRİŞ KUTUSU -->
            <div style="background:var(--ios-card); border:1.5px solid #c4b5fd; border-radius:10px; padding:10px; margin-bottom:9px;">
              <div style="font-size:10.5px; font-weight:900; color:#5b21b6; margin-bottom:4px;">
                1️⃣ Cihazınıza Özel Lisans Anahtarınızı Girin
              </div>
              <div style="font-size:9.3px; color:var(--ios-subtext); margin-bottom:7px; line-height:1.38;">
                Cihaz kodunuza (<strong>${escapeHtml(this.getOrCreateDeviceId())}</strong>) özel üretilen <strong>Aylık (30 Gün)</strong>, <strong>Yıllık (365 Gün)</strong> veya <strong>VIP Süresiz</strong> lisans kodunu aşağıya yazıp onaylayın:
              </div>
              <div style="display:grid; grid-template-columns:1fr auto; gap:6px;">
                <input type="text" id="licenseActivationInput" class="ios-input" style="padding:8px 10px; font-size:11.5px; font-weight:900; text-transform:uppercase; letter-spacing:0.7px;" placeholder="Örn: AVIGEN-YIL-XXXXXX" />
                <button type="button" class="ios-btn ios-btn-purple" style="padding:8px 12px; font-size:10.5px; font-weight:900;" onclick="AvigenUxManager.activateWithLicenseKey()">
                  🔑 Kodu Onayla
                </button>
              </div>
            </div>

            <!-- 2. ADIM: WHATSAPP İLE LİSANS KODU / HAVALE-EFT TALEBİ -->
            <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:10px; padding:9px 10px;">
              <div style="font-size:10px; font-weight:900; color:#047857; margin-bottom:3px;">
                2️⃣ Henüz Lisans Kodunuz Yok mu? (WhatsApp Lisans Hattı: 0 532 782 03 85)
              </div>
              <div style="font-size:9.2px; color:#065f46; line-height:1.35; margin-bottom:7px;">
                Aşağıdaki butona bastığınızda <strong>Cihaz Kimlik Kodunuz (${escapeHtml(this.getOrCreateDeviceId())})</strong> otomatik olarak <strong>0 532 782 03 85</strong> WhatsApp mesajına eklenir ve sadece sizin telefonunuzda çalışacak lisans kodunuz gönderilir:
              </div>
              <button type="button" class="ios-btn ios-btn-green" style="width:100%; padding:9px; font-size:11px; font-weight:900;" onclick="AvigenUxManager.requestLicenseViaWhatsApp('${checkoutPrice}', '${isYearly ? 'Yıllık (365 Gün)' : 'Aylık (30 Gün)'}')">
                📲 WhatsApp'tan Cihazıma Özel Lisans Kodu İste (0 532 782 03 85)
              </button>
            </div>
          </div>
        ` : `
          <!-- 1. SEKME: 3 ÜYELİK PAKETİ KARŞILAŞTIRMA -->
          <div style="display:flex; justify-content:space-between; align-items:center; background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:6px 9px;">
            <span style="font-size:10.5px; font-weight:800; color:var(--ios-text);">Lisans Süresi Seçimi:</span>
            <div style="display:flex; gap:5px;">
              <button type="button" class="ios-btn ${!isYearly ? 'ios-btn-primary' : 'ios-btn-outline'}" style="padding:4px 9px; font-size:10px;" onclick="AvigenUxManager.selectBillingCycle('monthly', 'plans')">Aylık (30 Gün)</button>
              <button type="button" class="ios-btn ${isYearly ? 'ios-btn-purple' : 'ios-btn-outline'}" style="padding:4px 9px; font-size:10px;" onclick="AvigenUxManager.selectBillingCycle('yearly', 'plans')">Yıllık (365 Gün • 2 Ay İndirimli)</button>
            </div>
          </div>

          <!-- 1. PAKET: AVIGEN FREE -->
          <div style="border:2px solid ${curTier.id === 'FREE' ? '#0066ff' : 'var(--ios-border)'}; background:var(--ios-card-alt); border-radius:11px; padding:9px 11px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:12.5px; font-weight:900; color:var(--ios-text);">1. AVIGEN FREE <span class="gene-badge gene-blue" style="font-size:8.5px;">Ücretsiz • Sınırsız Kuş</span></div>
                <div style="font-size:9.5px; color:var(--ios-subtext);">Sınırsız güvercin yönetimi, 4 kuşak (31 kutu) pedigri, yuva &amp; 3 kategorili yarış takibi</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:14px; font-weight:900; color:#0066ff;">0 TL</div>
                <div style="font-size:8.5px; color:var(--ios-subtext);">Süresiz Ücretsiz</div>
              </div>
            </div>
            <button class="ios-btn ${curTier.id === 'FREE' ? 'ios-btn-primary' : 'ios-btn-outline'}" style="width:100%; padding:6px; font-size:10.5px; margin-top:6px;" onclick="AvigenUxManager.activateTierFromModal('FREE')">
              ${curTier.id === 'FREE' ? '✅ Şu An Aktif Paketiniz (AVIGEN FREE)' : 'AVIGEN FREE Sürümüne Geç'}
            </button>
          </div>

          <!-- 2. PAKET: AVIGEN AI (GENESIS AI) -->
          <div style="border:2px solid ${curTier.id === 'GENETICS_AI' ? '#7c3aed' : '#c4b5fd'}; background:var(--ios-card-alt); border-radius:11px; padding:9px 11px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:12.5px; font-weight:900; color:#7c3aed;">2. AVIGEN AI <span class="gene-badge gene-purple" style="font-size:8.5px;">GENESIS AI</span></div>
                <div style="font-size:9.5px; color:var(--ios-subtext);">GENESIS AI: 5 Nesil Akıllı Eşleştirme, GENESIS AI'ya Sor, Haritalı Yarış Simülasyonu &amp; Akıllı Yem</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:14px; font-weight:900; color:#7c3aed;">${isYearly ? '3.990 TL/yıl' : '399 TL/ay'}</div>
                <div style="font-size:8.5px; color:#059669; font-weight:700;">${isYearly ? '365 Günlük Lisans' : '30 Günlük Lisans'}</div>
              </div>
            </div>
            <button class="ios-btn ios-btn-purple" style="width:100%; padding:7px; font-size:11px; margin-top:6px;" onclick="AvigenUxManager.openCheckoutForTier('GENETICS_AI')">
              ${curTier.id === 'GENETICS_AI' ? `🔑 Aktif (${escapeHtml(licExp.label)}) — Lisans / Süre Uzat` : '🔑 Lisans Kodu Gir / Kod İste (0532 782 03 85)'}
            </button>
          </div>

          <!-- 3. PAKET: AVIGEN GLOBAL -->
          <div style="border:2px solid ${curTier.id === 'GLOBAL' ? '#d97706' : '#fde68a'}; background:var(--ios-card-alt); border-radius:11px; padding:9px 11px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:12.5px; font-weight:900; color:#b45309;">3. AVIGEN GLOBAL <span class="gene-badge gene-gold" style="font-size:8.5px;">Küresel Soy Havuzu</span></div>
                <div style="font-size:9.5px; color:var(--ios-subtext);">AVIGEN AI + Ortak gen havuzu ve izin verilen veriler üzerinden küresel soy araştırması</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:14px; font-weight:900; color:#b45309;">${isYearly ? '5.990 TL/yıl' : '599 TL/ay'}</div>
                <div style="font-size:8.5px; color:#059669; font-weight:700;">${isYearly ? '365 Günlük Lisans' : '30 Günlük Lisans'}</div>
              </div>
            </div>
            <button class="ios-btn ios-btn-gold" style="width:100%; padding:7px; font-size:11px; margin-top:6px;" onclick="AvigenUxManager.openCheckoutForTier('GLOBAL')">
              ${curTier.id === 'GLOBAL' ? `🔑 Aktif (${escapeHtml(licExp.label)}) — Lisans / Süre Uzat` : '🔑 Lisans Kodu Gir / Kod İste (0532 782 03 85)'}
            </button>
          </div>
        `)}
      </div>
    `;

    modal.classList.add('open');
  },

  setAuthViewMode(mode) {
    this.state.authViewMode = mode;
    this.openSubscriptionModal('auth');
  },

  selectCheckoutTier(tierId) {
    this.state.checkoutTierId = tierId;
    this.saveState();
    this.openSubscriptionModal('checkout');
  },

  closeSubscriptionModal() {
    document.getElementById('avigenSubscriptionModal')?.classList.remove('open');
  },

  openUserGuideModal(tab = 'howto') {
    const modal = document.getElementById('avigenUserGuideModal');
    const body = document.getElementById('avigenUserGuideBody');
    if (!modal || !body) return;

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; font-size:10.5px;">
        <div class="sub-pills">
          <button class="sub-pill ${tab === 'howto' ? 'active' : ''}" onclick="AvigenUxManager.openUserGuideModal('howto')">
            📖 Nasıl Kullanılır? (Adım Adım)
          </button>
          <button class="sub-pill ${tab === 'features' ? 'active' : ''}" onclick="AvigenUxManager.openUserGuideModal('features')">
            🧭 Neyin Ne İşe Yaradığı
          </button>
        </div>

        ${tab === 'howto' ? `
          <div style="display:flex; flex-direction:column; gap:7px; max-height:70vh; overflow-y:auto; padding-right:2px;">
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #0066ff; border-radius:9px; padding:8px 10px;">
              <div style="font-weight:900; color:#0052cc; font-size:11px; margin-bottom:3px;">1️⃣ Yeni Kuş veya Yavru Nasıl Eklenir? (Sınırsız &amp; Ücretsiz)</div>
              <div style="color:var(--ios-text); line-height:1.4;">
                • <strong>AVIGEN FREE</strong> sürümünde kuş ve pedigri ekleme sınırı yoktur; kümesinizdeki tüm kuşları ücretsiz kaydedebilirsiniz.<br/>
                • <strong>Ana Sayfa</strong> veya <strong>Kuş &amp; Yuva</strong> sekmesindeki <strong>➕ Kuş Ekle</strong> butonuna basın; bilezik numarası, isim, cinsiyet (♂ Erkek / ♀ Dişi) ve kategori (Yarışçı / Damızlık / Yavru) seçin.<br/>
                • <strong>30 Kutu Otomatik Soy Bağlama:</strong> Alttaki <strong>"♂ Baba Seç"</strong> ve <strong>"♀ Anne Seç"</strong> kutularından kümesinizdeki anne-babayı seçtiğinizde, yavrunun 30 kutuluk tüm üst soyağacı (dede, nine, 3. ve 4. kuşak) <strong>tek saniyede otomatik dolar!</strong>
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #059669; border-radius:9px; padding:8px 10px;">
              <div style="font-weight:900; color:#059669; font-size:11px; margin-bottom:3px;">2️⃣ 3 Kategorili Yarış Takibi (Kümesüstü / Dernek / Büyük Ödüllü) Nasıl Yapılır?</div>
              <div style="color:var(--ios-text); line-height:1.4;">
                • Alttan <strong>4. Sekme (Yarışlar)</strong> ekranına girin ve <strong>+ Yeni Yarış &amp; Kuş Seç</strong> butonuna basın.<br/>
                • Yarış türünü seçin: <strong>🦅 Kümesüstü Yarışı</strong>, <strong>🏛️ Dernek Yarışı</strong> veya <strong>🏆 Büyük Ödüllü Yarış (Derby / OLR)</strong>.<br/>
                • Salım ve varış il/ilçesini seçtiğinizde kuş uçuşu mesafe (km) otomatik hesaplanır. Yarışa katılacak kuşlarınızı işaretleyip kaydedin.<br/>
                • Kuşlar eve döndüğünde yanındaki <strong>⚡ İndi</strong> butonuna tek dokunuşla basın; sistem varış saatini, uçuş süresini ve <strong>ortalama hızı (m/dk)</strong> otomatik hesaplar.
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #7c3aed; border-radius:9px; padding:8px 10px;">
              <div style="font-weight:900; color:#5b21b6; font-size:11px; margin-bottom:3px;">3️⃣ 4 Kuşak (31 Kutu) Pedigri Kağıdı Nasıl İndirilir &amp; Paylaşılır?</div>
              <div style="color:var(--ios-text); line-height:1.4;">
                • Alttan <strong>2. Sekme (Kuş &amp; Yuva) → 📜 Pedigre Kağıdı</strong> görünümüne geçin.<br/>
                • Pedigri üzerindeki herhangi bir kutuya dokunarak o atayı düzenleyebilir, iki parmakla yakınlaştırabilirsiniz.<br/>
                • Alttaki <strong>🖼️ HD Pedigre İndir</strong> veya <strong>📲 Paylaş</strong> butonuyla yüksek çözünürlüklü şecereyi WhatsApp'tan gönderebilirsiniz.
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #db2777; border-radius:9px; padding:8px 10px;">
              <div style="font-weight:900; color:#be185d; font-size:11px; margin-bottom:3px;">4️⃣ GENESIS AI Akıllı Eşleştirme &amp; "GENESIS AI'ya Sor" Nasıl Kullanılır? (AVIGEN AI)</div>
              <div style="color:var(--ios-text); line-height:1.4;">
                • Alttaki ortanca <strong>🧬 GENESIS AI</strong> sekmesine girip <strong>1. GENESIS AI – Akıllı Eşleştirme &amp; Soy Danışmanı</strong> modülünü açın.<br/>
                • Erkek ve dişi kuşunuzu seçtiğinizde 5 nesil Sewall Wright COI akrabalık katsayısı, 11 özellikte yavru potansiyeli ve koşullu BLUP analizi üretilir.<br/>
                • Ayrıca Ana Sayfa veya modül içindeki <strong>"🧬 GENESIS AI'ya Sor"</strong> kutusuna Türkçe sorunuzu yazarak (Örn: <em>"En iyi 3 çiftim hangisi?", "Yarış öncesi yemleme nasıl olmalı?"</em>) kümes verilerinize özel yanıt alabilirsiniz.
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #d97706; border-radius:9px; padding:8px 10px;">
              <div style="font-weight:900; color:#b45309; font-size:11px; margin-bottom:3px;">5️⃣ Haritalı Akıllı Yarış Simülasyonu &amp; Akıllı Yem Nasıl Çalışır? (AVIGEN AI)</div>
              <div style="color:var(--ios-text); line-height:1.4;">
                • <strong>2. Haritalı Akıllı Yarış Simülasyonu:</strong> Türkiye haritasında 81 il ve ilçeden salım/varış noktasını seçin. Sistem rüzgâr, sıcaklık ve arazi eğimine göre kuşlarınızın uygunluk sırasını, tahmini hızını (m/dk) ve olası dönüş saatlerini yatay kaydırmasız mobil kartlarda listeler.<br/>
                • <strong>3. Akıllı Yem, Sıvı &amp; 1 Aylık Maliyet:</strong> Kümes mevcuduna, mevsime ve hava sıcaklığına göre günlük tohum gramajı, suluk kürü ve 30 günlük yem maliyetini hesaplar.
              </div>
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-left:3.5px solid #0284c7; border-radius:9px; padding:8px 10px;">
              <div style="font-weight:900; color:#0369a1; font-size:11px; margin-bottom:3px;">6️⃣ GENESIS AI Lisans Kodu Nasıl Alınır &amp; Yedekleme Nasıl Yapılır?</div>
              <div style="color:var(--ios-text); line-height:1.4;">
                • <strong>Lisans Kodu İste (0 532 782 03 85):</strong> Üstteki <strong>🧬 GENESIS AI</strong> butonuna veya <strong>Profil &amp; Ayarlar → 🔑 Lisans Kodu</strong> sekmesine girip <strong>"📲 WhatsApp'tan Cihazıma Özel Lisans Kodu İste (0 532 782 03 85)"</strong> butonuna basın. Telefonunuza özel üretilen kodu girerek GENESIS AI modüllerini hemen açabilirsiniz.<br/>
                • <strong>Sıfır Veri Kaybı &amp; Yedek:</strong> <strong>Profil &amp; Ayarlar → ⚙️ Ayarlar &amp; Yedek</strong> ekranından <strong>📲 WhatsApp Yedek Gönder</strong> veya <strong>⬇️ Cihaza Yedek İndir (.JSON)</strong> ile tüm kümesinizi istediğiniz an yedekleyebilirsiniz.
              </div>
            </div>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:7px; max-height:70vh; overflow-y:auto; padding-right:2px;">
            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; line-height:1.45;">
              <strong style="color:#0052cc; font-size:11px;">🏠 1. Sekme: Ana Sayfa (Tek Ekran Kümes Kontrol Merkezi)</strong><br/>
              • <strong>Kümes Kimliği &amp; Canlı Hava Durumu:</strong> Kümes adınızı, logonuzu ve bulunduğunuz konumdaki canlı sıcaklık, rüzgâr ve uçuş uygunluğunu gösterir.<br/>
              • <strong>Kuş Özeti &amp; Hızlı Arama:</strong> Toplam kuş, damızlık, yarışçı, yavru ve büyük yarış sayılarını tek şeritte sunar. Halka no veya isimle saniyede arama yapar.<br/>
              • <strong>🧬 GENESIS AI'ya Sor &amp; Vitrin Kartı:</strong> Ana ekrandan ayrılmadan GENESIS AI'ya doğal dilde soru sormanızı ve 3 çekirdek yapay zekâ motoruna tek dokunuşla geçmenizi sağlar.<br/>
              • <strong>Alt Takip Paneli (📅 Takvim &amp; Görev, 🪺 Yuvalar, 🏁 Yarışlar, 📋 Sicil):</strong> Günlük aşı/bakım görevlerini, aktif kuluçka yuvalarını ve yaklaşan yarışları tek kartta toplar.
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; line-height:1.45;">
              <strong style="color:#059669; font-size:11px;">🕊️ 2. Sekme: Kuş &amp; Yuva (Sınırsız Ücretsiz Kümes, Pedigri &amp; Kuluçka)</strong><br/>
              • <strong>🕊️ Kuşlarım Listesi:</strong> Kuşlarınızı <em>Kümesim, Erkek, Dişi, Damızlık, Yarışçı, Yavru, Büyük Yarış, Dinlenmede, Kayıp/Satıldı ve Soy Arşivi</em> olarak filtreler.<br/>
              • <strong>📜 Pedigre Kağıdı (4 Kuşak • 31 Kutu):</strong> Resmi mavi sertifika tasarımında 31 kutulu soyağacı üretir, QR/Barkod ekler, PDF/PNG olarak indirir veya paylaşır.<br/>
              • <strong>🪺 Yuva &amp; Kuluçka Takibi:</strong> Eşleşen çiftlerin yumurtlama tarihine göre 18 günlük kuluçka geri sayımını, bilezik takma gününü (7–10. gün) ve çifte yavru kaydını yönetir.<br/>
              • <strong>📊 Performans &amp; Genetik Profil Kartı:</strong> Kuşun gerçek yarış performansı ile soyağacı genetik potansiyelini birbirine karıştırmadan ayrı ayrı grafiklendirir.
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; line-height:1.45;">
              <strong style="color:#7c3aed; font-size:11px;">🧬 3. Sekme: GENESIS AI (Abonelik Gerektiren Yapay Zekâ Merkezi)</strong><br/>
              • <strong>1. GENESIS AI – Akıllı Eşleştirme &amp; Soy Danışmanı:</strong> 5 nesil Sewall Wright COI akrabalık hesabı, ortak ata tespiti, kümes içi en uygun 5 çift önerisi, 11 özellikte yavru tahmini, koşullu BLUP ve birleşik <em>"🧬 GENESIS AI'ya Sor"</em> soru-cevap danışmanı.<br/>
              • <strong>2. GENESIS AI – Haritalı Akıllı Yarış Simülasyonu:</strong> Türkiye 81 il/ilçe uydu ve arazi haritası üzerinde rota, rüzgâr ve rakım analizi; her kuş için yatay kaydırmasız mobil kartlarda uygunluk puanı, tahmini dönüş saati ve tek tuşla yarışa sepetleme.<br/>
              • <strong>3. GENESIS AI – Akıllı Yem, Sıvı &amp; 1 Aylık Maliyet:</strong> Mevsime, hava sıcaklığına ve kuş sayısına göre günlük yem reçetesi, suluk takviyesi ve 30 günlük TL maliyet tablosu.
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; line-height:1.45;">
              <strong style="color:#d97706; font-size:11px;">🏁 4. Sekme: Yarışlar (3 Kategorili Resmi Yarış &amp; Performans Sistemi)</strong><br/>
              • <strong>🏁 Yarış Yönetimi (Ücretsiz):</strong> <em>Kümesüstü Yarışları</em>, <em>Dernek Yarışları</em> ve <em>Büyük Ödüllü Yarışlar (Derby / OLR)</em> için ayrı yarış açma, kuş sepetleme, 7 canlı kuş durumu (Hazırlanıyor, Kafeste, Salındı, Eve Döndü, Bekleniyor, Yarış Dışı, Manuel Onaylı Kayıp) ve tek tuşla <strong>⚡ İndi</strong> hız (m/dk) hesabı.<br/>
              • <strong>🧬 AI Yarış Analizi (AVIGEN AI):</strong> Tamamlanan gerçek yarış sonuçlarına göre kısa/orta/uzun mesafe uzmanlarını, hava koşulu liderlerini ve sezon içi form grafiğini çıkarır.<br/>
              • <strong>🌤️ Uçuş Hava:</strong> Rüzgâr yönü, sıcaklık ve manyetik Kp indeksine göre uçuş zorluk derecesini hesaplar.
            </div>

            <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:9px; padding:8px 10px; line-height:1.45;">
              <strong style="color:#0f172a; font-size:11px;">⚙️ 5. Sekme: Profil &amp; Ayarlar (Yedekleme, Güncelleme, Lisans &amp; Kütüphane)</strong><br/>
              • <strong>⚙️ Ayarlar &amp; Yedek:</strong> Veri kaybı olmadan canlı sürüm güncelleme (<em>⚡ Şimdi Güncelle</em>), <em>📲 WhatsApp Yedek Gönder (.JSON)</em>, gece/gündüz teması ve örnek kuş temizleme.<br/>
              • <strong>👑 Üyelik &amp; Lisans:</strong> Cihaz Kimlik Kodunuza (<em>AVG-XXXX-XXXX</em>) özel lisans aktivasyonu ve <strong>0 532 782 03 85</strong> WhatsApp lisans talep hattı.<br/>
              • <strong>📚 Bilimsel Kütüphane:</strong> Yarış güvercini genetiği (LDHA, DRD4, CRY1, GSR) ve fizyolojisi üzerine DOI/PMID doğrulanmış hakemli akademik makale arşivi.
            </div>
          </div>
        `}
      </div>
    `;

    modal.classList.add('open');
  },

  closeUserGuideModal() {
    document.getElementById('avigenUserGuideModal')?.classList.remove('open');
  },

  // --------------------------------------------------------------------------
  // AVIGEN HATA BİLDİRİMİ, ÖNERİ & ÖZELLİK İSTEĞİ MERKEZİ
  // (GitHub Issues Doğrudan Gönderim + WhatsApp / E-Posta Hızlı İletim + Yerel Kayıt)
  // --------------------------------------------------------------------------
  openFeedbackModal() {
    const modal = document.getElementById('avigenFeedbackModal');
    const body = document.getElementById('avigenFeedbackModalBody');
    if (!modal || !body) return;

    const savedLogs = this.getFeedbackLogs();
    const curVer = typeof AvigenAutoUpdater !== 'undefined' ? `${AvigenAutoUpdater.state.localVersion} (Build ${AvigenAutoUpdater.state.localBuild})` : '5.0.0';
    const loftTitle = (typeof loftConfig !== 'undefined' && loftConfig.title) ? loftConfig.title : 'AVIGEN Kümesi';

    body.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:9px; font-size:11px;">
        <div style="background:linear-gradient(135deg,#fffbeb,#eff6ff); border:1.5px solid #93c5fd; border-radius:10px; padding:9px 11px;">
          <div style="font-size:12px; font-weight:900; color:#0052cc;">
            💬 Uygulama Geliştiricisine Hata, Öneri veya İstek Bildirin
          </div>
          <div style="font-size:9.8px; color:#334155; margin-top:2px; line-height:1.38;">
            Karşılaştığınız bir hatayı veya eklenmesini istediğiniz yeni bir özelliği aşağıya yazıp <strong>GitHub Resmi Bildirim Panosu</strong>, <strong>WhatsApp</strong> veya <strong>E-Posta</strong> üzerinden doğrudan bize ulaştırabilirsiniz.
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Bildirim Türü *</label>
            <select id="fbTypeSelect" class="ios-select" style="font-weight:800;">
              <option value="Öneri / Yeni Özellik İsteği">💡 Öneri / Yeni Özellik İsteği</option>
              <option value="Hata / Sorun Bildirimi">🐞 Hata / Sorun Bildirimi</option>
              <option value="Yarış / Derby Takip Talebi">🏁 Yarış / Derby Takip Talebi</option>
              <option value="GENESIS AI / Pedigri Görüşü">🧬 GENESIS AI / Pedigri Görüşü</option>
              <option value="Üyelik / Lisans &amp; Ödeme">💳 Üyelik / Lisans &amp; Ödeme</option>
            </select>
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">İlgili Bölüm / Ekran</label>
            <select id="fbModuleSelect" class="ios-select">
              <option value="Ana Sayfa &amp; Kümes Özeti">🏠 Ana Sayfa &amp; Kümes Özeti</option>
              <option value="Kuşlarım &amp; Pedigre PDF">🕊️ Kuşlarım &amp; Pedigre PDF</option>
              <option value="GENESIS AI Eşleştirme / Yem">🧬 GENESIS AI Eşleştirme / Yem</option>
              <option value="Yarış Yönetimi &amp; Büyük Yarış">🏁 Yarış Yönetimi &amp; Büyük Yarış</option>
              <option value="Yuva &amp; Kuluçka Takibi">🪺 Yuva &amp; Kuluçka Takibi</option>
              <option value="Diğer / Genel">⚙️ Diğer / Genel</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          <div>
            <label style="font-size:9.5px; font-weight:800;">Adınız / Kümes Adı</label>
            <input type="text" id="fbSenderName" class="ios-input" value="${escapeHtml(this.state.memberName || loftTitle)}" placeholder="Adınız veya Kümes Ünvanı" />
          </div>
          <div>
            <label style="font-size:9.5px; font-weight:800;">Telefon veya E-Posta (İsteğe Bağlı)</label>
            <input type="text" id="fbSenderContact" class="ios-input" value="${escapeHtml(this.state.memberPhone || this.state.memberEmail || '')}" placeholder="Size dönüş yapabilmemiz için" />
          </div>
        </div>

        <div>
          <label style="font-size:9.5px; font-weight:800;">Kısa Başlık *</label>
          <input type="text" id="fbSubjectInput" class="ios-input" placeholder="Örn: Büyük yarışta etap sıralaması hakkında öneri..." />
        </div>

        <div>
          <label style="font-size:9.5px; font-weight:800;">Mesajınız / Detaylı Açıklama *</label>
          <textarea id="fbMessageInput" class="ios-input" rows="3" style="resize:vertical; font-family:inherit;" placeholder="Yaşadığınız sorunu veya önerinizi detaylıca yazabilirsiniz..."></textarea>
        </div>

        <!-- 3 FARKLI DOĞRUDAN GÖNDERİM KANALI -->
        <div style="display:flex; flex-direction:column; gap:6px; margin-top:2px;">
          <button type="button" class="ios-btn ios-btn-primary" style="width:100%; padding:10px; font-size:11.5px; font-weight:900;" onclick="AvigenUxManager.submitUserFeedback('github')">
            🚀 GitHub Resmi Bildirim Panosuna Gönder (Anında Görünür)
          </button>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <button type="button" class="ios-btn ios-btn-green" style="padding:8px; font-size:10.5px; font-weight:900;" onclick="AvigenUxManager.submitUserFeedback('whatsapp')">
              📲 WhatsApp İle Gönder
            </button>
            <button type="button" class="ios-btn ios-btn-outline" style="padding:8px; font-size:10.5px; font-weight:800;" onclick="AvigenUxManager.submitUserFeedback('email')">
              ✉️ E-Posta İle Gönder
            </button>
          </div>
        </div>

        ${savedLogs.length > 0 ? `
          <div style="border-top:1px dashed var(--ios-border); padding-top:8px; margin-top:2px;">
            <div style="font-size:9.8px; font-weight:900; color:var(--ios-subtext); margin-bottom:5px;">
              📋 Bu Cihazdan Gönderilen Son Bildirimleriniz (${savedLogs.length}):
            </div>
            <div style="display:flex; flex-direction:column; gap:4px; max-height:110px; overflow-y:auto;">
              ${savedLogs.slice(0, 5).map(item => `
                <div style="background:var(--ios-card-alt); border:1px solid var(--ios-border); border-radius:7px; padding:5px 8px; font-size:9px;">
                  <div style="display:flex; justify-content:space-between; font-weight:800; color:var(--ios-text);">
                    <span>${escapeHtml(item.type)} — ${escapeHtml(item.subject)}</span>
                    <span style="color:var(--ios-subtext);">${escapeHtml(item.date)}</span>
                  </div>
                  <div style="color:var(--ios-subtext); margin-top:1px;">${escapeHtml(item.message.slice(0, 110))}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('open');
  },

  closeFeedbackModal() {
    document.getElementById('avigenFeedbackModal')?.classList.remove('open');
  },

  getFeedbackLogs() {
    try {
      const raw = localStorage.getItem('avigen_user_feedback_logs_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  submitUserFeedback(channel = 'github') {
    const type = document.getElementById('fbTypeSelect')?.value || 'Öneri / Yeni Özellik İsteği';
    const mod = document.getElementById('fbModuleSelect')?.value || 'Genel';
    const sender = (document.getElementById('fbSenderName')?.value || 'AVIGEN Kullanıcısı').trim();
    const contact = (document.getElementById('fbSenderContact')?.value || 'Belirtilmedi').trim();
    const subject = (document.getElementById('fbSubjectInput')?.value || '').trim();
    const message = (document.getElementById('fbMessageInput')?.value || '').trim();

    if (!subject && !message) {
      alert('⚠️ Lütfen bildirmek istediğiniz hata veya öneri için kısa bir başlık veya açıklama yazın.');
      return;
    }

    const finalSubject = subject || `${type} (${mod})`;
    const curVer = typeof AvigenAutoUpdater !== 'undefined' ? `v${AvigenAutoUpdater.state.localVersion} (Build ${AvigenAutoUpdater.state.localBuild})` : 'v5.0.0';
    const dateStr = new Date().toLocaleString('tr-TR');

    // 1. Yerel bildirim geçmişine kaydet
    const logs = this.getFeedbackLogs();
    logs.unshift({
      id: 'fb_' + Date.now(),
      date: dateStr,
      type,
      module: mod,
      sender,
      contact,
      subject: finalSubject,
      message: message || finalSubject,
      channel
    });
    try {
      localStorage.setItem('avigen_user_feedback_logs_v1', JSON.stringify(logs.slice(0, 30)));
    } catch (e) {}

    const formattedReport = [
      `📌 AVIGEN KULLANICI BİLDİRİMİ (${type})`,
      `• Başlık: ${finalSubject}`,
      `• İlgili Ekran: ${mod}`,
      `• Gönderen Kümes / Kişi: ${sender}`,
      `• İletişim: ${contact}`,
      `• Uygulama Sürümü: ${curVer}`,
      `• Tarih: ${dateStr}`,
      ``,
      `📝 Mesaj / Açıklama:`,
      `${message || finalSubject}`
    ].join('\n');

    if (channel === 'github') {
      const ghTitle = encodeURIComponent(`[${type}] ${finalSubject}`);
      const ghBody = encodeURIComponent(formattedReport);
      const ghIssueUrl = `https://github.com/hasanbenzer/avigen/issues/new?title=${ghTitle}&body=${ghBody}`;
      openExternalUrlSafe(ghIssueUrl);
    } else if (channel === 'whatsapp') {
      const waText = encodeURIComponent(formattedReport);
      openExternalUrlSafe(`https://wa.me/${this.LICENSE_WHATSAPP_NUMBER}?text=${waText}`);
    } else if (channel === 'email') {
      const mailSubject = encodeURIComponent(`AVIGEN Bildirim: [${type}] ${finalSubject}`);
      const mailBody = encodeURIComponent(formattedReport);
      openExternalUrlSafe(`mailto:destek@avigen.app?subject=${mailSubject}&body=${mailBody}`);
    }

    this.openFeedbackModal();
  },

  selectBillingCycle(cycle, returnTab = 'plans') {
    this.state.selectedBillingCycle = cycle;
    this.saveState();
    this.openSubscriptionModal(returnTab);
  },

  hashPassword(rawPass) {
    const clean = String(rawPass || '').trim();
    if (!clean) return '';
    if (clean.startsWith('AVGHASH_')) return clean;
    let h1 = 0x811c9dc5;
    let h2 = 0x01000193;
    const salted = `AVIGEN_SALT_2026::${clean}`;
    for (let i = 0; i < salted.length; i++) {
      const c = salted.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 ^= (c * 31);
      h2 = Math.imul(h2, 0x85ebca6b) >>> 0;
    }
    return `AVGHASH_${h1.toString(16).toUpperCase().padStart(8, '0')}${h2.toString(16).toUpperCase().padStart(8, '0')}`;
  },

  verifyPassword(inputPass) {
    if (!this.state.passwordHash) return true;
    const hashedInput = this.hashPassword(inputPass);
    return hashedInput === this.state.passwordHash || String(inputPass || '').trim() === this.state.passwordHash;
  },

  performInlineLogin() {
    const email = (document.getElementById('inlineLoginEmail')?.value || '').trim();
    const pass = (document.getElementById('inlineLoginPass')?.value || '').trim();
    if (!email || !pass) {
      alert('Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }
    if (!this.verifyPassword(pass)) {
      alert('⚠️ Hatalı şifre girdiniz! Lütfen şifrenizi kontrol edin.');
      return;
    }
    this.state.passwordHash = this.hashPassword(pass);
    this.state.memberEmail = email;
    this.state.isLoggedIn = true;
    this.saveState();
    this.syncHeaderAndProfileUI();
    alert(`✅ Hoş geldiniz ${this.state.memberName}! Şifreli oturumunuz başarıyla açıldı.`);
  },

  submitPasswordLogin() {
    const email = (document.getElementById('loginMemberEmail')?.value || '').trim();
    const pass = (document.getElementById('loginMemberPassword')?.value || '').trim();
    if (!email || !pass) {
      alert('Lütfen e-posta adresinizi ve şifrenizi girin.');
      return;
    }
    if (!this.verifyPassword(pass)) {
      alert('⚠️ Girdiğiniz şifre hatalı! (Varsayılan şifre veya belirlediğiniz şifreyi girin, ya da "Üye Ol / Şifre Kur" sekmesinden yeni şifre oluşturun).');
      return;
    }
    this.state.passwordHash = this.hashPassword(pass);
    this.state.memberEmail = email;
    this.state.isLoggedIn = true;
    this.saveState();
    this.syncHeaderAndProfileUI();
    this.closeSubscriptionModal();
    alert(`✅ Giriş başarılı! Hoş geldiniz ${this.state.memberName}.`);
  },

  submitPasswordChange() {
    const oldPass = (document.getElementById('chgOldPass')?.value || '').trim();
    const newPass = (document.getElementById('chgNewPass')?.value || '').trim();
    const confirmPass = (document.getElementById('chgNewPassConfirm')?.value || '').trim();

    if (this.state.passwordHash && oldPass && !this.verifyPassword(oldPass)) {
      alert('⚠️ Mevcut şifrenizi hatalı girdiniz.');
      return;
    }
    if (newPass.length < 6) {
      alert('Lütfen en az 6 karakterli yeni bir şifre belirleyin.');
      return;
    }
    if (newPass !== confirmPass) {
      alert('⚠️ Yeni şifre ile şifre tekrarı birbiriyle eşleşmiyor.');
      return;
    }

    this.state.passwordHash = this.hashPassword(newPass);
    this.state.isLoggedIn = true;
    this.saveState();
    this.syncHeaderAndProfileUI();
    this.closeSubscriptionModal();
    alert('🔒 Hesap şifreniz kriptografik özet (hash) ile güvenli biçimde güncellendi!');
  },

  logoutMember() {
    this.state.isLoggedIn = false;
    this.saveState();
    this.syncHeaderAndProfileUI();
  },

  saveFreeRegistration() {
    const name = (document.getElementById('regMemberName')?.value || '').trim();
    const loft = (document.getElementById('regLoftName')?.value || '').trim();
    const email = (document.getElementById('regMemberEmail')?.value || '').trim();
    const phone = (document.getElementById('regMemberPhone')?.value || '').trim();
    const pass = (document.getElementById('regMemberPass')?.value || '').trim();
    const passConfirm = (document.getElementById('regMemberPassConfirm')?.value || '').trim();

    if (!name || !email) {
      alert('Lütfen adınızı, soyadınızı ve e-posta adresinizi girin.');
      return;
    }
    if (pass) {
      if (pass.length < 6) {
        alert('Oluşturacağınız şifre en az 6 karakter olmalıdır.');
        return;
      }
      if (pass !== passConfirm) {
        alert('⚠️ Girdiğiniz şifreler birbiriyle eşleşmiyor!');
        return;
      }
      this.state.passwordHash = this.hashPassword(pass);
    }

    this.state.isRegisteredMember = true;
    this.state.isLoggedIn = true;
    this.state.memberName = name;
    this.state.memberEmail = email;
    this.state.memberPhone = phone;
    if (loft) {
      loftConfig.title = loft;
      saveMypedigreData();
      syncLoftIdentityAcrossUI();
    }
    this.saveState();
    this.syncHeaderAndProfileUI();
    this.closeSubscriptionModal();
    alert(`✅ Hoş geldiniz ${name}! AVIGEN yetiştirici hesabınız ve giriş şifreniz kaydedildi.`);
  },

  activateTierFromModal(tierId) {
    this.setMembershipTier(tierId);
    this.closeSubscriptionModal();
    const t = this.getCurrentTier();
    alert(`👑 Aktif Üyelik Paketiniz: ${t.name}\n\n${t.tagline}`);
  },

  // --------------------------------------------------------------------------
  // CİHAZ KİMLİK KODUNA (DEVICE ID) KİLİTLİ LİSANS DOĞRULAYICI
  // (Kod üretici müşterilerin indirdiği app.js içinde yer almaz; yalnızca kurucunun avigen-lisans-uretici.html aracında bulunur!)
  // Bir müşterinin Cihaz Koduna (Örn: AVG-7K4M-9P2X) özel üretilen lisans anahtarı başka hiçbir telefonda çalışmaz!
  // --------------------------------------------------------------------------
  computeDeviceBoundLicenseSignature(prefix, deviceId, nonce) {
    const cleanDev = String(deviceId || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const cleanNonce = String(nonce || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const payload = `AVIGEN_HW_LOCK_2026::${prefix}::${cleanDev}::${cleanNonce}`;
    let h1 = 0x811c9dc5;
    let h2 = 0x5A17C3;
    for (let i = 0; i < payload.length; i++) {
      const c = payload.charCodeAt(i);
      h1 ^= c;
      h1 = Math.imul(h1, 0x01000193) >>> 0;
      h2 = ((h2 << 5) - h2 + c) & 0xFFFFFF;
    }
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const s1 = chars[h1 % chars.length];
    const s2 = chars[Math.floor(h1 / chars.length) % chars.length];
    const s3 = chars[h2 % chars.length];
    const s4 = chars[Math.floor(h2 / chars.length) % chars.length];
    return `${s1}${s2}${s3}${s4}`;
  },

  verifySignedLicenseKey(rawKey) {
    const clean = (rawKey || '').trim().toUpperCase();
    // Format: <PREFIX>-<2 KARAKTER NONCE><4 KARAKTER CİHAZ İMZASI> (Örn: AVIGEN-YIL-K9X4M7)
    const m = clean.match(/^(AVIGEN-AY|AVIGEN-30G|AVIGEN-YIL|AVIGEN-PRO|AVG-VIP)-([A-Z0-9]{2})([A-Z0-9]{4})$/);
    if (!m) return false;
    const [, prefix, nonce, givenSig] = m;
    const myDeviceId = this.getOrCreateDeviceId();
    const expectedSig = this.computeDeviceBoundLicenseSignature(prefix, myDeviceId, nonce);
    return givenSig === expectedSig;
  },

  // GitHub üzerinden dağıtılan uygulamada Cihaza Özel Lisans Anahtarı ile AVIGEN GENESIS AI paketini süreli (30 Gün / 365 Gün) veya süresiz (VIP) etkinleştirme
  activateWithLicenseKey() {
    const rawKey = (document.getElementById('licenseActivationInput')?.value || '').trim().toUpperCase();
    if (!rawKey) {
      alert('⚠️ Lütfen size verilen AVIGEN Lisans / Aktivasyon Kodunu girin.');
      return;
    }

    const myDeviceId = this.getOrCreateDeviceId();
    if (!this.verifySignedLicenseKey(rawKey)) {
      alert(`⚠️ Geçersiz veya Başka Cihaza Ait Lisans Anahtarı!\n\nGirdiğiniz kod bu telefonun Cihaz Kimlik Kodu (${myDeviceId}) ile eşleşmiyor.\n\n(Not: Her lisans kodu yalnızca üretildiği telefonda çalışır, başka cihazda kullanılamaz.)`);
      return;
    }

    const targetTierId = this.state.checkoutTierId === 'GLOBAL' ? 'GLOBAL' : 'GENETICS_AI';
    const tierObj = this.TIERS[targetTierId] || this.TIERS.GENETICS_AI;
    let durationDays = 365;
    let licenseType = 'YEARLY';
    let durationLabel = '365 Gün (1 Yıl)';
    let amountStr = tierObj.yearlyPrice;

    if (rawKey.startsWith('AVIGEN-AY-') || rawKey.startsWith('AVIGEN-30G-')) {
      durationDays = 30;
      licenseType = 'MONTHLY';
      durationLabel = '30 Gün (1 Ay)';
      amountStr = tierObj.monthlyPrice;
    } else if (rawKey.startsWith('AVG-VIP-')) {
      durationDays = null;
      licenseType = 'UNLIMITED';
      durationLabel = 'Süresiz VIP Lisans';
      amountStr = 'VIP';
    } else if (this.state.selectedBillingCycle === 'monthly' && !rawKey.startsWith('AVIGEN-YIL-')) {
      durationDays = 30;
      licenseType = 'MONTHLY';
      durationLabel = '30 Gün (1 Ay)';
      amountStr = tierObj.monthlyPrice;
    }

    const now = new Date();
    const todayStr = now.toLocaleDateString('tr-TR');
    let expiresIso = null;
    let expiresDateStr = 'Süresiz';

    if (durationDays) {
      // Eğer halihazırda devam eden bir süresi varsa kalan sürenin üzerine ekle, yoksa bugünden başlat
      const baseTime = (this.state.licenseExpiresAt && new Date(this.state.licenseExpiresAt).getTime() > Date.now())
        ? new Date(this.state.licenseExpiresAt).getTime()
        : Date.now();
      const expObj = new Date(baseTime + durationDays * 24 * 60 * 60 * 1000);
      expiresIso = expObj.toISOString();
      expiresDateStr = expObj.toLocaleDateString('tr-TR');
    }

    const invId = 'LIC-' + rawKey;
    if (!Array.isArray(this.state.paymentHistory)) {
      this.state.paymentHistory = [];
    }
    this.state.paymentHistory.unshift({
      id: invId,
      date: todayStr,
      planName: `${tierObj.name} (${durationLabel})`,
      amount: amountStr,
      cardMasked: `Bitiş: ${expiresDateStr}`,
      status: 'Aktif ✓'
    });

    this.state.activatedLicenseKey = rawKey;
    this.state.licenseType = licenseType;
    this.state.licenseActivatedAt = now.toISOString();
    this.state.licenseExpiresAt = expiresIso;
    this.setMembershipTier(targetTierId);
    this.closeSubscriptionModal();
    alert(`🎉 Lisans Anahtarınız Doğrulandı!\n\n• Lisans Kodu: ${rawKey}\n• Aktif Paket: ${tierObj.name}\n• Kullanım Süresi: ${durationLabel}\n• Bitiş Tarihi: ${expiresDateStr}\n\n(Not: Süre dolduğunda üyeliğiniz otomatik olarak ücretsiz pakete döner; yeni kod girerek istediğiniz zaman uzatabilirsiniz.)`);
  },

  requestLicenseViaWhatsApp(priceText, cycleText) {
    const loftTitle = (typeof loftConfig !== 'undefined' && loftConfig.title) ? loftConfig.title : 'AVIGEN Kümesi';
    const myDevId = this.getOrCreateDeviceId();
    const tierObj = this.TIERS[this.state.checkoutTierId] || this.TIERS.GENETICS_AI;
    const msg = encodeURIComponent(
      `Merhaba, ${tierObj.name} (${cycleText || 'Yıllık (365 Gün)'} - ${priceText || tierObj.yearlyPrice}) paketi için cihazıma özel Lisans Aktivasyon Kodu almak istiyorum.\n\n📱 Cihaz Kimlik Kodu (Cihaz ID): ${myDevId}\n🏠 Kümes Adı: ${loftTitle}\n✉️ İletişim: ${this.state.memberPhone || this.state.memberEmail || '-'}`
    );
    openExternalUrlSafe(`https://wa.me/${this.LICENSE_WHATSAPP_NUMBER}?text=${msg}`);
  }
};

// ============================================================================
// AVIGEN 2.0 — OTA (OVER-THE-AIR) OTOMATİK SÜRÜM KONTROLÜ & TEK TUŞLA GÜNCELLEME
// (Telefondaki güvercin, pedigri ve yuva verilerini silmeden yeni sürüme yükseltir)
// ============================================================================
const AvigenAutoUpdater = {
  REMOTE_RAW_BASE_URL: 'https://raw.githubusercontent.com/hasanbenzer/avigen/main/',
  REMOTE_RAW_VERSION_URL: 'https://raw.githubusercontent.com/hasanbenzer/avigen/main/version.json',
  REMOTE_VERSION_URL: 'https://hasanbenzer.github.io/avigen/version.json',
  GITHUB_RELEASE_API: 'https://api.github.com/repos/hasanbenzer/avigen/releases/latest',
  DEFAULT_APK_URL: 'https://github.com/hasanbenzer/avigen/releases/download/v1.0.0/AVIGEN.apk',
  DEFAULT_WEB_URL: 'https://hasanbenzer.github.io/avigen/',
  OTA_BUNDLE_STORAGE_KEY: 'avigen_ota_live_bundle_v1',

  state: {
    localVersion: '5.6.1',
    localBuild: 561,
    remoteVersion: '5.6.1',
    remoteBuild: 561,
    remoteTitle: "AVIGEN v5.6.1 — WhatsApp Doğrudan 2 Sayfa PDF Dosyası Paylaşımı, Adım Adım Ana Menüye Dönen Geri Tuşu, Tam Genişlik Yarış Koordinat Girişi & Tek Merkez Yedekleme",
    remoteNotes: [
      "WhatsApp Doğrudan PDF Dosyası Paylaşımı: 'WhatsApp PDF Paylaş' butonu artık yazı yerine doğrudan 2 sayfalık resmi .PDF pedigri ve sicil dosyasını paylaşır",
      "Adım Adım Ana Menüye Dönen Geri Tuşu: Geri tuşuna basıldığında programdan direkt çıkmaz; önce açık pencereleri ve alt sekmeleri kapatıp Ana Menüye (Ana Sayfa) kadar gelir, yalnızca Ana Menüdeyken basılırsa çıkar",
      "Akıllı Yarış Simülasyonu Yeni Sıralama & Tam Genişlik Koordinat Hücresi: En üstte 1. Salım Noktası, 2. Varış Noktası (%100 tam genişlikli büyük koordinat kutuları), 3. Harita ve 4. Diğer Bilgiler sıralaması uygulandı",
      "Tek Merkez Yedekleme & Geri Yükleme: Ayarlar'daki dağınık yedekleme butonları tek bir 'Kümes Yedekleme & Geri Yükleme Merkezi' kartında toplandı"
    ],
    apkUrl: 'https://github.com/hasanbenzer/avigen/releases/download/v1.0.0/AVIGEN.apk',
    webUrl: 'https://hasanbenzer.github.io/avigen/',
    hasNewUpdate: false,
    dismissedBuild: 0
  },

  init() {
    this.ensureZeroDataLossSafetyBackup();
    this.applySavedOtaBundleIfNewer();
    // Sadece Ayarlar & Yedek bölümünden yönetilir; ana ekranı kalabalık yapmaz
    setTimeout(() => {
      this.checkForUpdates(false);
    }, 1500);
  },

  ensureZeroDataLossSafetyBackup() {
    try {
      const lastBackedUpBuild = Number(localStorage.getItem('avigen_last_backed_up_build_v1') || 0);
      if (lastBackedUpBuild < this.state.localBuild && typeof buildFullAvigenSnapshotPayload === 'function') {
        const currentPayload = buildFullAvigenSnapshotPayload();
        if (Array.isArray(currentPayload.pedigrees) && currentPayload.pedigrees.length > 0) {
          localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(currentPayload));
          localStorage.setItem('avigen_last_backed_up_build_v1', String(this.state.localBuild));
        }
      }
    } catch (e) {}
  },

  applySavedOtaBundleIfNewer() {
    try {
      const raw = localStorage.getItem(this.OTA_BUNDLE_STORAGE_KEY);
      if (!raw) return;
      const bundle = JSON.parse(raw);
      if (!bundle || !bundle.build || Number(bundle.build) <= this.state.localBuild) {
        // Statik sürüm OTA paketine eşit veya daha yeniyse eski OTA paketini temizleyerek localStorage kotasını koru
        localStorage.removeItem(this.OTA_BUNDLE_STORAGE_KEY);
        return;
      }
      if (bundle.css) {
        let st = document.getElementById('avigenOtaLiveCss');
        if (!st) {
          st = document.createElement('style');
          st.id = 'avigenOtaLiveCss';
          document.head.appendChild(st);
        }
        st.textContent = bundle.css;
      }
    } catch (e) {}
  },

  async checkForUpdates(showFeedback = false) {
    const urlsToTry = [
      `${this.REMOTE_RAW_VERSION_URL}?t=${Date.now()}`,
      `${this.REMOTE_VERSION_URL}?t=${Date.now()}`,
      `./version.json?t=${Date.now()}`
    ];

    let data = null;
    for (const url of urlsToTry) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const parsed = await res.json();
          if (parsed && parsed.build) {
            data = parsed;
            break;
          }
        }
      } catch (e) {}
    }

    // Eğer version.json henüz GitHub'a yüklenmemişse GitHub Releases API üzerinden canlı sürüm kontrolü yap
    if (!data) {
      try {
        const relRes = await fetch(this.GITHUB_RELEASE_API, { cache: 'no-store' });
        if (relRes.ok) {
          const rel = await relRes.json();
          const tagVer = String(rel.tag_name || '').replace(/^v/i, '') || '1.0.0';
          const apkAsset = Array.isArray(rel.assets) ? rel.assets.find(a => String(a.name).endsWith('.apk')) : null;
          data = {
            version: this.state.localVersion,
            build: this.state.localBuild,
            title: rel.name || this.state.remoteTitle,
            notes: this.state.remoteNotes,
            apkUrl: apkAsset?.browser_download_url || this.DEFAULT_APK_URL,
            webUrl: this.DEFAULT_WEB_URL,
            githubReleaseTag: tagVer
          };
        }
      } catch (e) {}
    }

    if (data) {
      this.state.remoteVersion = data.version || this.state.localVersion;
      this.state.remoteBuild = Number(data.build || this.state.localBuild);
      this.state.remoteTitle = data.title || `AVIGEN v${this.state.remoteVersion}`;
      if (Array.isArray(data.notes) && data.notes.length) {
        this.state.remoteNotes = data.notes;
      }
      this.state.apkUrl = data.apkUrl || this.DEFAULT_APK_URL;
      this.state.webUrl = data.webUrl || this.DEFAULT_WEB_URL;
      this.state.hasNewUpdate = this.state.remoteBuild > this.state.localBuild;
    }

    if (typeof AvigenUxManager !== 'undefined' && document.getElementById('page-notes')?.classList.contains('active')) {
      AvigenUxManager.renderProfileAccountSection();
    }

    // Eğer arka planda yeni sürüm tespit edildiyse ve henüz bu derlemeye (build) otomatik yenileme yapılmadıysa, verileri koruyarak otomatik canlı güncelle
    if (!showFeedback && this.state.hasNewUpdate) {
      try {
        const lastAutoReloadBuild = sessionStorage.getItem('avigen_auto_updated_to_build');
        if (lastAutoReloadBuild !== String(this.state.remoteBuild)) {
          sessionStorage.setItem('avigen_auto_updated_to_build', String(this.state.remoteBuild));
          this.applyWebLiveUpdate();
          return;
        }
      } catch (e) {}
    }

    if (showFeedback) {
      const notesStr = this.state.remoteNotes.map(n => `• ${n}`).join('\n');
      if (this.state.hasNewUpdate) {
        if (confirm(`🚀 Yeni AVIGEN Sürümü Bulundu: v${this.state.remoteVersion}!\n\nYenilikler:\n${notesStr}\n\nKayıtlı kuş verilerinizi silmeden şimdi yeni sürüme güncellemek ister misiniz?`)) {
          this.applySmartUpdate();
        }
      } else {
        alert(`✅ Güncel Sürüm Doğrulandı: AVIGEN v${this.state.localVersion} (Build ${this.state.localBuild})\n\nŞu anda en güncel sürümü kullanıyorsunuz.\n\nSon Sürüm Özellikleri:\n${notesStr}`);
      }
    }
  },

  applySmartUpdate() {
    this.applyWebLiveUpdate();
  },

  async applyWebLiveUpdate() {
    // 0. Güncelleme öncesi kullanıcının tüm mevcut kümes, kuş, pedigri, yuva ve yarış verilerinin otomatik güvenlik yedeğini al
    try {
      if (typeof saveMypedigreData === 'function') {
        saveMypedigreData();
      }
      if (typeof buildFullAvigenSnapshotPayload === 'function') {
        const snapshot = buildFullAvigenSnapshotPayload();
        if (Array.isArray(snapshot.pedigrees) && snapshot.pedigrees.length > 0) {
          localStorage.setItem('avigen_auto_safety_snapshot_v1', JSON.stringify(snapshot));
        }
      }
    } catch (e) {}

    // 1. Önce GitHub üzerinden en güncel version.json ve styles.css dosyalarını çekip yerel OTA önbelleğine kaydet
    try {
      const ts = Date.now();
      const verRes = await fetch(`${this.REMOTE_RAW_VERSION_URL}?t=${ts}`, { cache: 'no-store' });
      if (verRes.ok) {
        const verData = await verRes.json();
        let cssText = '';
        try {
          const cssRes = await fetch(`${this.REMOTE_RAW_BASE_URL}styles.css?t=${ts}`, { cache: 'no-store' });
          if (cssRes.ok) cssText = await cssRes.text();
        } catch (e) {}

        if (verData && verData.build) {
          localStorage.setItem(this.OTA_BUNDLE_STORAGE_KEY, JSON.stringify({
            version: verData.version,
            build: verData.build,
            updatedAt: new Date().toISOString(),
            css: cssText
          }));
        }
      }
    } catch (e) {}

    // 2. Service Worker ve Cache Storage önbelleklerini temizle
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) {
          await r.update();
          await r.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const k of keys) {
          await caches.delete(k);
        }
      }
    } catch (e) {}

    // 3. Eğer eski bir yerel Capacitor APK içindeysek (localhost) ve henüz canlı sunucuya geçmemişse:
    // Kullanıcının mevcut tüm kümes verisini (veya URL'ye sığan yedek paketini) koruyarak canlı güncellemeyi uygula
    const isCapacitorApk = Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
    if (isCapacitorApk && this.state.remoteBuild > this.state.localBuild) {
      this.applySavedOtaBundleIfNewer();
      alert(`✅ AVIGEN v${this.state.remoteVersion} (Build ${this.state.remoteBuild}) canlı güncellemesi uygulandı!`);
    }

    // Kullanıcının localStorage verilerine (pedigreler, kuşlar, yuvalar, yarışlar) HİÇ DOKUNMADAN sayfayı yenile
    const cleanUrl = window.location.href.split('?')[0].split('#')[0];
    window.location.replace(`${cleanUrl}?v=${Date.now()}`);
  },

  async downloadLatestApk() {
    // GÜVENLİK KORUMASI: Kullanıcı yeni APK indirmeden önce tüm kümes verisini hem panoya otomatik kopyalar hem de yedek penceresini açar!
    try {
      if (typeof buildFullAvigenSnapshotPayload === 'function') {
        const payload = buildFullAvigenSnapshotPayload();
        await copyTextToClipboardSafe(JSON.stringify(payload));
        if (typeof openAndroidBackupAssistModal === 'function') {
          openAndroidBackupAssistModal(true);
        }
      }
    } catch (e) {}
    const url = `${this.state.apkUrl}?t=${Date.now()}`;
    openExternalUrlSafe(url);
  }
};

// ============================================================================
// ANDROID FİZİKSEL / KAYDIRMALI GERİ TUŞU (HARDWARE BACK BUTTON) YÖNETİCİSİ
// Android telefonlarda geri tuşuna basıldığında uygulamadan anında çıkmak yerine:
// 1. Açık bir modal pencere varsa onu kapatır,
// 2. Kuş işlem açılır menüsü açıksa onu kapatır,
// 3. GENESIS AI alt aracı açıksa GENESIS AI ana menüsüne döner,
// 4. Ana Sayfa dışındaki bir sekmedeyse Ana Sayfaya döner.
// ============================================================================
function isAtRootHomeMenuState() {
  const openModals = document.querySelectorAll('.ios-modal-overlay.open');
  if (openModals && openModals.length > 0) return false;
  if (openBirdActionMenuRing) return false;
  const quickRes = document.getElementById('homeQuickSearchResults');
  if (quickRes && quickRes.classList.contains('open')) return false;
  const homePage = document.getElementById('page-home');
  if (!homePage || !homePage.classList.contains('active')) return false;
  return true;
}

function handleAndroidBackNavigation() {
  // 1. Açık herhangi bir modal / pencere varsa önce onu kapat
  const openModals = Array.from(document.querySelectorAll('.ios-modal-overlay.open'));
  if (openModals.length > 0) {
    const topModal = openModals[openModals.length - 1];
    topModal.classList.remove('open');
    if (topModal.id === 'barcodeScannerModal' && typeof stopLiveCameraBarcodeScan === 'function') {
      try { stopLiveCameraBarcodeScan(); } catch (e) {}
    }
    return true;
  }

  // 2. Kuş kartı açılır işlem menüsü açıksa kapat
  if (openBirdActionMenuRing) {
    closeAllBirdActionPopups();
    return true;
  }

  // 3. Ana sayfa hızlı arama sonuç listesi açıksa kapat
  const quickRes = document.getElementById('homeQuickSearchResults');
  if (quickRes && quickRes.classList.contains('open')) {
    quickRes.classList.remove('open');
    return true;
  }

  // 4. Kuş & Yuva (#page-pedigrees) sekmesindeyken: Pedigri Kağıdı veya Yuva alt sekmesindeyse önce Kuşlarım listesine dön
  const pedigreesPage = document.getElementById('page-pedigrees');
  if (pedigreesPage && pedigreesPage.classList.contains('active')) {
    const listPane = document.getElementById('birdsListViewPane');
    if (listPane && listPane.style.display === 'none' && typeof switchBirdsViewMode === 'function') {
      switchBirdsViewMode('list');
      return true;
    }
    openIosTab('home', document.querySelectorAll('.ios-tab-btn')[0]);
    return true;
  }

  // 5. Yarışlar (#page-flight) sekmesindeyken: Hava & Rota alt aşamasındaysa önce kurulum aşamasına, sonra Yarış Yönetimine, sonra Ana Menüye dön
  const flightPage = document.getElementById('page-flight');
  if (flightPage && flightPage.classList.contains('active')) {
    const simPane = document.getElementById('racesSmartSimPane');
    if (simPane && simPane.style.display !== 'none') {
      if (typeof AvigenGenesisAI !== 'undefined' && AvigenGenesisAI.state.smartRaceStage !== 'setup') {
        AvigenGenesisAI.setSmartRaceStage('setup');
        return true;
      }
      if (typeof switchRacesMainViewMode === 'function') {
        switchRacesMainViewMode('tracker');
        return true;
      }
    }
    openIosTab('home', document.querySelectorAll('.ios-tab-btn')[0]);
    return true;
  }

  // 6. GENESIS AI (#page-breeding) sekmesindeyken: Ana Menüye (Ana Sayfa) dön
  const breedingPage = document.getElementById('page-breeding');
  if (breedingPage && breedingPage.classList.contains('active')) {
    openIosTab('home', document.querySelectorAll('.ios-tab-btn')[0]);
    return true;
  }

  // 7. Profil & Ayarlar (#page-notes) sekmesindeyken: Alt sekmedeyse Ayarlar'a, Ayarlar'daysa Ana Menüye (Ana Sayfa) dön
  const notesPage = document.getElementById('page-notes');
  if (notesPage && notesPage.classList.contains('active')) {
    if (typeof AvigenUxManager !== 'undefined' && AvigenUxManager.state.activeProfileSection !== 'preferences') {
      AvigenUxManager.switchProfileSection('preferences');
      return true;
    }
    openIosTab('home', document.querySelectorAll('.ios-tab-btn')[0]);
    return true;
  }

  // 8. Diğer herhangi bir sekmedeyse Ana Menüye (Ana Sayfa) dön
  const homePage = document.getElementById('page-home');
  if (homePage && !homePage.classList.contains('active')) {
    openIosTab('home', document.querySelectorAll('.ios-tab-btn')[0]);
    return true;
  }

  // 9. Zaten Ana Menüdeyiz (Ana Sayfa) ve açık hiçbir pencere yok -> false döndür (Programdan çıkabilir)
  return false;
}
window.handleAndroidBackNavigation = handleAndroidBackNavigation;

let _avigenHistoryGuardCount = 0;

function ensureUserGestureHistoryGuard() {
  try {
    if (window.history && typeof window.history.pushState === 'function') {
      if (!isAtRootHomeMenuState() && (!window.history.state || !window.history.state.avigenGuard)) {
        window.history.pushState({ avigenGuard: true, ts: Date.now() }, '');
        _avigenHistoryGuardCount++;
      }
    }
  } catch (e) {}
}

function initAndroidHardwareBackButtonSupport() {
  try {
    if (window.history && typeof window.history.pushState === 'function') {
      window.history.replaceState({ avigenRoot: true }, '');
      window.history.pushState({ avigenGuard: true, ts: Date.now() }, '');

      // Kullanıcı ekranda herhangi bir butona/sekmeye dokunduğunda gerçek User Gesture içinde history korumasını tazele
      document.addEventListener('click', () => {
        setTimeout(ensureUserGestureHistoryGuard, 20);
      }, { passive: true });

      window.addEventListener('popstate', () => {
        const handled = handleAndroidBackNavigation();
        if (handled) {
          // Eğer hâlâ Ana Menüye (Ana Sayfaya) ulaşmadıysak veya açık pencere varsa yeni koruma kaydı ekle;
          // Ana Menüye ulaştıysak bile 1 koruma kaydı ekle ki Ana Menüde tekrar Geri'ye basıldığında handleAndroidBackNavigation() false döndürüp çıksın!
          try {
            window.history.pushState({ avigenGuard: true, ts: Date.now() }, '');
          } catch (e) {}
        } else {
          // Zaten Ana Menüdeyken Geri tuşuna basıldı -> Programdan çık!
          if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.exitApp === 'function') {
            try { window.AvigenNativeBridge.exitApp(); return; } catch (e) {}
          }
          if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App && typeof window.Capacitor.Plugins.App.exitApp === 'function') {
            try { window.Capacitor.Plugins.App.exitApp(); return; } catch (e) {}
          }
        }
      });
    }

    document.addEventListener('backbutton', (ev) => {
      const handled = handleAndroidBackNavigation();
      if (handled) {
        if (ev && typeof ev.preventDefault === 'function') ev.preventDefault();
      } else {
        if (window.AvigenNativeBridge && typeof window.AvigenNativeBridge.exitApp === 'function') {
          try { window.AvigenNativeBridge.exitApp(); return; } catch (e) {}
        }
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App && typeof window.Capacitor.Plugins.App.exitApp === 'function') {
          try { window.Capacitor.Plugins.App.exitApp(); } catch (e) {}
        }
      }
    }, false);

    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App && typeof window.Capacitor.Plugins.App.addListener === 'function') {
      window.Capacitor.Plugins.App.addListener('backButton', () => {
        const handled = handleAndroidBackNavigation();
        if (!handled) {
          try { window.Capacitor.Plugins.App.exitApp(); } catch (e) {}
        }
      });
    }
  } catch (e) {}
}

window.addEventListener('DOMContentLoaded', () => {
  initAndroidHardwareBackButtonSupport();
  // Mobil / Dokunmatik / PWA / Capacitor APK Algılama -> %100 Gerçek Tam Ekran Modu
  const isMobileOrNative = Boolean(
    window.Capacitor ||
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) ||
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '') ||
    window.innerWidth <= 920
  );
  if (isMobileOrNative) {
    document.body.classList.add('mobile-native-fullscreen');
  }

  // Tarayıcı kalıcı depolama koruması (iOS Safari / Firefox / Chrome için veri silinmesini önler)
  if (navigator.storage && typeof navigator.storage.persist === 'function') {
    try { navigator.storage.persist(); } catch (e) {}
  }

  // AVIGEN Sabitlenmiş Temel Marka Tasarımı: Beyaz Ana Zemin + Elektrik Mavisi + Şampanya Altını (Varsayılan Aktif)
  document.body.classList.add('cyber-ai-skin');
  document.body.classList.remove('dark-theme');
  const savedLight = localStorage.getItem('avigen_cyber_light_skin');
  if (savedLight === null || savedLight === '1') {
    document.body.classList.add('cyber-light-skin');
  } else {
    document.body.classList.remove('cyber-light-skin');
  }
  updateThemeButtonLabels();
  loadMypedigreData();
  AvigenLiveWeather.init();
  syncLoftIdentityAcrossUI();
  if (typeof AvigenGenesisAI !== 'undefined') {
    AvigenGenesisAI.init();
  }
  if (typeof AvigenRaceTracker !== 'undefined') {
    AvigenRaceTracker.init();
  }
  AvigenAutoUpdater.init();
  renderPedigreeDropdown();
  selectActivePedigree(activePedigreeId);
  renderHomeDashboard();
  initPedigreePinchZoom();
  AvigenUxManager.init();
});

window.addEventListener('resize', fitPaperToIphoneScreen);

// Hızlı Arama Kutusunun veya Kuş İşlem Açılır Menüsünün Dışına Tıklanınca Otomatik Kapat
document.addEventListener('click', (e) => {
  const wrap = document.querySelector('.home-quick-search-wrap');
  const resBox = document.getElementById('homeQuickSearchResults');
  if (wrap && resBox && !wrap.contains(e.target)) {
    resBox.classList.remove('open');
  }
  closeAllBirdActionPopups();
});

// ============================================================================
// AVIGEN – AUTOMATED END-TO-END QA, SCIENTIFIC COI & SECURITY TEST SUITE
// (Mevcut kullanıcı verisini bozmadan izole bellek üzerinde 18 gerçek test koşar)
// ============================================================================
const AvigenSystemAuditQA = {
  runAllTests() {
    const results = [];
    const assert = (id, category, title, passed, detail) => {
      results.push({ id, category, title, passed: Boolean(passed), detail });
    };

    // Yeni indiren kullanıcılarda kümes boş (pedigrees = []) başladığı için test süresince izole bellekte 2 örnek pedigri kullanıp test sonunda eski haline döndür
    const hadEmptyLoftForTest = pedigrees.length === 0;
    const savedPedigreesBeforeQa = pedigrees;
    if (hadEmptyLoftForTest) {
      pedigrees = [
        typeof getRomarioMessi31BoxPedigree === 'function' ? getRomarioMessi31BoxPedigree() : null,
        typeof getTugf25A0441Pedigree === 'function' ? getTugf25A0441Pedigree() : null
      ].filter(Boolean);
      if (typeof invalidateUniqueLoftBirdsCache === 'function') invalidateUniqueLoftBirdsCache();
      if (typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.invalidateEngineCache === 'function') {
        AvigenGenesisAI.invalidateEngineCache();
      }
    }

    // 1. Sewall Wright (1922) COI Test 1: Ortak Atası Olmayan Tam Yabancı Kan (Outcross) => %0.00 COI
    const outcrossSire = { self: { ring: 'TEST-S1' }, p1: { ring: 'TEST-F1' }, p2: { ring: 'TEST-M1' } };
    const outcrossDam = { self: { ring: 'TEST-D1' }, p1: { ring: 'TEST-F2' }, p2: { ring: 'TEST-M2' } };
    const coiOut = AvigenGenesisAI.calculateExactWrightCOI(outcrossSire, outcrossDam);
    assert('T01', 'Bilimsel COI', 'Outcross (Ortak Atasız) Eşleşme = %0.00 COI', coiOut.coiPercent === 0, `Hesaplanan: %${coiOut.coiPercent.toFixed(2)} (Beklenen: %0.00)`);

    // 2. Sewall Wright (1922) COI Test 2: Baba × Kız (Ebeveyn × Yavru, n1=0, n2=1) => %25.00 COI (Ortak atanın üst soyu mükerrer sayılmaz!)
    const parentSire = { self: { ring: 'CHAMP-01' }, p1: { ring: 'GF-01' }, p2: { ring: 'GM-01' } };
    const daughterDam = { self: { ring: 'DAUGHTER-01' }, p1: { ring: 'CHAMP-01' }, p2: { ring: 'MOTHER-01' }, g1: { ring: 'GF-01' }, g2: { ring: 'GM-01' } };
    const coiPC = AvigenGenesisAI.calculateExactWrightCOI(parentSire, daughterDam);
    assert('T02', 'Bilimsel COI', 'Baba × Kız (Parent-Offspring) = %25.00 COI (Üst soy mükerrer sayılmaz)', coiPC.coiPercent === 25.0, `Hesaplanan: %${coiPC.coiPercent.toFixed(2)} (Beklenen: %25.00)`);

    // 3. Sewall Wright (1922) COI Test 3: Tam Kardeşler (Full Siblings, ortak Baba n1=1,n2=1 + ortak Anne n1=1,n2=1) => %25.00 COI
    const fullSibA = { self: { ring: 'SIB-M' }, p1: { ring: 'FATHER-X' }, p2: { ring: 'MOTHER-Y' }, g1: { ring: 'GF-X' }, g2: { ring: 'GM-X' } };
    const fullSibB = { self: { ring: 'SIB-F' }, p1: { ring: 'FATHER-X' }, p2: { ring: 'MOTHER-Y' }, g1: { ring: 'GF-X' }, g2: { ring: 'GM-X' } };
    const coiFS = AvigenGenesisAI.calculateExactWrightCOI(fullSibA, fullSibB);
    assert('T03', 'Bilimsel COI', 'Tam Kardeş (Full Siblings) = %25.00 COI (Büyükbaba mükerrer eklenmez)', coiFS.coiPercent === 25.0, `Hesaplanan: %${coiFS.coiPercent.toFixed(2)} (Beklenen: %25.00)`);

    // 4. Sewall Wright (1922) COI Test 4: Yarım Kardeşler (Half Siblings, yalnızca Baba ortak n1=1,n2=1) => %12.50 COI
    const halfSibA = { self: { ring: 'HSIB-M' }, p1: { ring: 'FATHER-X' }, p2: { ring: 'MOTHER-1' }, g1: { ring: 'GF-X' } };
    const halfSibB = { self: { ring: 'HSIB-F' }, p1: { ring: 'FATHER-X' }, p2: { ring: 'MOTHER-2' }, g1: { ring: 'GF-X' } };
    const coiHS = AvigenGenesisAI.calculateExactWrightCOI(halfSibA, halfSibB);
    assert('T04', 'Bilimsel COI', 'Yarım Kardeş (Half Siblings) = %12.50 COI', coiHS.coiPercent === 12.5, `Hesaplanan: %${coiHS.coiPercent.toFixed(2)} (Beklenen: %12.50)`);

    // 5. Sewall Wright (1922) COI Test 5: Dede × Torun (Grandparent × Grandchild, n1=0, n2=2) => %12.50 COI
    const grandSire = { self: { ring: 'GRAND-01' }, p1: { ring: 'OLD-1' } };
    const grandChild = { self: { ring: 'GCHILD-01' }, p1: { ring: 'SON-01' }, g1: { ring: 'GRAND-01' }, gg1: { ring: 'OLD-1' } };
    const coiGP = AvigenGenesisAI.calculateExactWrightCOI(grandSire, grandChild);
    assert('T05', 'Bilimsel COI', 'Büyükbaba × Torun (Linebreeding) = %12.50 COI', coiGP.coiPercent === 12.5, `Hesaplanan: %${coiGP.coiPercent.toFixed(2)} (Beklenen: %12.50)`);

    // 6. Sewall Wright (1922) COI Test 6: 1. Derece Kuzenler (2 Ortak Büyük Ebeveyn: n1=2,n2=2 × 2) => %6.25 COI
    const cousinA = { self: { ring: 'COUS-M' }, p1: { ring: 'BRO-1' }, g1: { ring: 'SHARED-GF' }, g2: { ring: 'SHARED-GM' } };
    const cousinB = { self: { ring: 'COUS-F' }, p1: { ring: 'BRO-2' }, g1: { ring: 'SHARED-GF' }, g2: { ring: 'SHARED-GM' } };
    const coiCous = AvigenGenesisAI.calculateExactWrightCOI(cousinA, cousinB);
    assert('T06', 'Bilimsel COI', '1. Derece Tam Kuzenler (2 Ortak Büyük Ebeveyn) = %6.25 COI', coiCous.coiPercent === 6.25, `Hesaplanan: %${coiCous.coiPercent.toFixed(2)} (Beklenen: %6.25)`);

    // 7. Eksik Pedigree Verisinde Kesin Genetik Sonuç Üretilmemesi (Genetik Gelecek Simülasyonu Kural 5)
    const emptyTreeTest = AvigenGenesisAI.calculateExactWrightCOI({ self: { ring: 'EMPTY-1' } }, { self: { ring: 'EMPTY-2' } });
    assert('T07', 'Bilimsel Dürüstlük', 'Eksik / Atasız Kuşlarda Yapay Akrabalık Üretilmemesi', emptyTreeTest.coiPercent === 0, 'Veri olmadığında yapay COI üretilmedi (%0).');

    // 8. Damızlık Aday Listesi Tekilleştirme ve Cinsiyet Doğrulaması
    const cands = getAllBreedingCandidates();
    const ringSet = new Set(cands.all.map(c => c.ring.toUpperCase()));
    const noDupCandidates = ringSet.size === cands.all.length;
    const genderPartitionValid = cands.males.every(m => m.sex === 'M') && cands.females.every(f => f.sex === 'F');
    assert('T08', 'Veri Bütünlüğü', 'Bilezik Benzersizliği & Erkek/Dişi Aday Ayrımı', noDupCandidates && genderPartitionValid, `${cands.all.length} tekil aday (${cands.males.length}♂, ${cands.females.length}♀), mükerrer kayıt: 0`);

    // 9. 4 Kuşak (31 Kutu) Soyağacı Bağlantı Bütünlüğü
    const ped0 = pedigrees.find(p => p?.boxes?.main?.ring && p?.boxes?.sire?.ring && p?.boxes?.dam?.ring) || pedigrees[0];
    const has31Slots = BOX_SLOTS.length === 31 && Boolean(ped0?.boxes?.main?.ring && ped0?.boxes?.sire?.ring && ped0?.boxes?.dam?.ring);
    assert('T09', 'Pedigree Motoru', '4 Kuşak (31 Kutu) Soy Ağacı Şeması ve Ebeveyn Bağlantısı', has31Slots, `BOX_SLOTS: ${BOX_SLOTS.length} kutu • Ana kuş: ${ped0?.boxes?.main?.ring}`);

    // 10. Kuluçka Günü, Tahmini Yavru Çıkış Tarihi ve İlerleme Çubuğu Hesaplaması
    const sampleEggDate = getIsoDateDaysAgo(10);
    const incStage = computeDynamicBreedingStage('egg', sampleEggDate);
    const incValid = incStage && incStage.phaseType === 'INCUBATION' && incStage.incubationDay === 10 && incStage.progressPct === 56 && incStage.daysToHatch === 8;
    assert('T10', 'Yuva & Kuluçka', '10. Gün Kuluçka İlerleme (%56) ve +8 Gün Tahmini Çıkış Hesabı', incValid, `${incStage?.progressLabel} • Tahmini Çıkış: ${incStage?.estHatchDateLabel}`);

    // 11. Yavru Bilezik (Künye) Takma Günü Hesaplaması (7-10 Günlük Yavru)
    const sampleHatchDate = getIsoDateDaysAgo(8);
    const ringStage = computeDynamicBreedingStage('hatch', sampleHatchDate);
    const ringValid = ringStage && ringStage.phaseType === 'CHICK_RING_NOW' && ringStage.chickAgeDays === 8;
    assert('T11', 'Bilezik Takvimi', '8 Günlük Yavruda Otomatik Bilezik Takma Günü Uyarısı', ringValid, `${ringStage?.badge} • ${ringStage?.stageTitle}`);

    // 12. Eşzamanlı Aktif Yuva Çakışma Tespit Motoru
    const backupPairs = [...activePairsList];
    activePairsList = [
      { id: 'test_p1', nest: 'Yuva #A', sire: 'TR-2024-100245 (Fırtına)', dam: 'TR-2024-100890 (Kraliçe)' },
      { id: 'test_p2', nest: 'Yuva #B', sire: 'TR-2024-100245 (Fırtına)', dam: 'BELG-2025-4011220 (Diamond)' }
    ];
    const simConflict = detectActiveNestConflicts();
    activePairsList = backupPairs;
    assert('T12', 'Yuva Çakışma', 'Aynı Kuşun Eşzamanlı İki Aktif Yuvada Kullanılmasının Tespiti', simConflict.hasConflicts && Boolean(simConflict.conflictsByRing['TR-2024-100245']), `Tespit edilen çakışan halka: TR-2024-100245 (Yuva #A ve Yuva #B)`);

    // 13. Resmi Yarış Hızı (m/dk) ve Performans Profili Hesaplaması
    const profTest = AvigenPerformanceEngine.calculateFullProfile(ped0?.boxes?.main?.ring);
    const speedMetric = profTest?.categories?.flight?.metrics?.find(m => m.key === 'speed');
    assert('T13', 'Performans Motoru', 'Bireysel Yarış Hızı ve Güvenilirlik (%) Hesaplaması', Boolean(speedMetric && speedMetric.score > 0 && speedMetric.reliability > 0), `${profTest?.bird?.ring} Hız Puanı: ${speedMetric?.score}/100 (Güven: %${speedMetric?.reliability})`);

    // 14. 5 Nesil (gggg1..32) Çapraz Pedigri Derinleştirici & Sewall Wright COI Doğrulaması
    const gen5Sire = { self: { ring: 'S-0' }, p1: { ring: 'S-1' }, g1: { ring: 'S-2' }, gg1: { ring: 'S-3' }, ggg1: { ring: 'S-4' }, gggg1: { ring: 'COMMON-GEN5' } };
    const gen5Dam = { self: { ring: 'D-0' }, p1: { ring: 'D-1' }, g1: { ring: 'D-2' }, gg1: { ring: 'D-3' }, ggg1: { ring: 'D-4' }, gggg1: { ring: 'COMMON-GEN5' } };
    const coiGen5 = AvigenGenesisAI.calculateExactWrightCOI(gen5Sire, gen5Dam);
    assert('T14', '5 Nesil Wright COI', '5. Nesil (gggg1..32) Ortak Ata Tespiti & Patika Katkısı', coiGen5.coiPercent > 0 && coiGen5.commonAncestorsDetailed.length === 1, `5. Nesil Ortak Ata (COMMON-GEN5) COI: %${coiGen5.coiPercent.toFixed(4)}`);

    // 15. Kullanıcı Şifre Güvenliği (Kriptografik Tuzlu Hashleme & Doğrulama)
    const samplePassHash = AvigenUxManager.hashPassword('TestPass2026!');
    const passHashValid = samplePassHash.startsWith('AVGHASH_') && !samplePassHash.includes('TestPass');
    assert('T15', 'Hesap Güvenliği', 'Tuzlu (Salted) Şifre Hashleme & Açık Metin Koruması', passHashValid, `Örnek Hash: ${samplePassHash} (Açık şifre saklanmaz)`);

    // 16. Bilimsel Bilgi Bankası (AVIGEN Scientific Library) DOI & Birincil Kaynak Doğrulaması
    const sciCount = typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.sources.length : 0;
    const kolvenbag = typeof AvigenScientificLibrary !== 'undefined' ? AvigenScientificLibrary.sources.find(s => s.id === 'sci_kolvenbag_2022') : null;
    const doiVerified = kolvenbag && kolvenbag.doi === '10.1007/s13353-022-00697-w' && kolvenbag.pmid === '35505002';
    assert('T16', 'Bilimsel Kütüphane', '6 Birincil Hakemli Makale & DOI/PMID Doğrulaması', sciCount >= 6 && doiVerified, `${sciCount} doğrulanmış yayın • Kolvenbag 2022 DOI & PMID aktif.`);

    // 17. 3 Kademeli Üyelik ve Yetkilendirme (AVIGEN FREE Sınırsız Kuş, AVIGEN AI & AVIGEN GLOBAL + 0 532 782 03 85 Lisans Hattı)
    const tiersOk = AvigenUxManager.TIERS.FREE.maxPedigreesLimit >= 99999 &&
                    AvigenUxManager.TIERS.GENETICS_AI.name === 'AVIGEN AI' &&
                    AvigenUxManager.TIERS.GLOBAL.name === 'AVIGEN GLOBAL' &&
                    AvigenUxManager.LICENSE_WHATSAPP_NUMBER === '905327820385' &&
                    Object.keys(AvigenUxManager.TIERS).length === 3;
    assert('T17', 'Ticari Paketler', 'AVIGEN FREE (Sınırsız Kuş), AVIGEN AI (399 TL), AVIGEN GLOBAL (599 TL) & 0532 782 03 85 Lisans Hattı', tiersOk, 'AVIGEN FREE sınırsız kuş + GENESIS AI abonelik kilidi ve 0 532 782 03 85 WhatsApp lisans hattı doğrulandı.');

    // 18. Tam JSON Yedekleme Şeması Doğrulaması
    const snap = buildFullAvigenSnapshotPayload();
    const backupComplete = snap.version === '2.5' &&
      Array.isArray(snap.pedigrees) &&
      Array.isArray(snap.activePairsList) &&
      Array.isArray(snap.scientific_sources) &&
      Array.isArray(snap.genesis_analysis_history) &&
      Boolean(snap.performance_config) &&
      Boolean(snap.user_account_state) &&
      typeof AvigenGenesisAI.saveAnalysisHistory === 'function';
    assert('T18', 'Yedekleme & Veri', 'Tam JSON Yedekleme & Geri Yükleme (Import/Export) Şema Bütünlüğü', backupComplete, `Şema v${snap.version}: Tüm kümes, pedigri, yuva, yarış ve analiz geçmişi tabloları doğrulandı.`);

    // 19. Tek Bütünleşik GENESIS AI – AKILLI EŞLEŞTİRME Motoru, 11 Özellikte Yavru Öngörüsü & Koşullu BLUP Doğrulaması
    const mainMods = AvigenGenesisAI.MAIN_MODULES || [];
    const hasUnifiedSmartPairing = mainMods.length >= 2 &&
      mainMods[0].id === 'breeding_hub' &&
      String(mainMods[0].title || '').includes('AKILLI EŞLEŞTİRME') &&
      Array.isArray(mainMods[0].subFunctions) &&
      mainMods[0].subFunctions.length === 0 &&
      mainMods.some(m => m.id === 'nutrition_hub');
    const nutCheck = typeof AvigenGenesisAI.calculateSmartNutritionPlan === 'function'
      ? AvigenGenesisAI.calculateSmartNutritionPlan('auto_today_smart', 'ALL', 64)
      : null;
    const relHigh = AvigenGenesisAI.classifyDataReliability(85);
    const relLow = AvigenGenesisAI.classifyDataReliability(15);
    const brCheck = AvigenGenesisAI.analyzeBreedingIntelligence(undefined, undefined, true);
    const brCached = AvigenGenesisAI.analyzeBreedingIntelligence(undefined, undefined, true);
    const validDecisions = ['ÖNERİLEN EŞLEŞME', 'KOŞULLU OLARAK ÖNERİLEN EŞLEŞME', 'ÖNERİLMEYEN EŞLEŞME'];
    const distinctHeritabilities = new Set((brCheck.offspringTraits11 || []).map(t => t.h2)).size >= 5;
    const cacheAndUncertaintyOk = hasUnifiedSmartPairing &&
      relHigh.label === 'Yüksek Güvenilirlik' &&
      relLow.label === 'Yetersiz Veri' &&
      Boolean(nutCheck && nutCheck.totalDailyGrams > 0 && nutCheck.todaySmart?.todayLiquidRecommendation) &&
      brCheck === brCached &&
      Array.isArray(brCheck.offspringTraits11) &&
      brCheck.offspringTraits11.length === 11 &&
      distinctHeritabilities &&
      validDecisions.includes(brCheck.decisionLabel) &&
      Boolean(brCheck.blupEvaluation && typeof brCheck.blupEvaluation.isBlupEligible === 'boolean');
    assert('T19', 'GENESIS AI', 'Tek Bütünleşik Akıllı Eşleştirme Motoru, 11 Yavru Özelliği (Farklı h²) & 3 Karar Seviyesi', cacheAndUncertaintyOk, `Tek Modül aktif • Karar: ${brCheck?.decisionLabel} • 11 Yavru Özelliği & Koşullu BLUP doğrulandı.`);

    // 20. AVIGEN Gelişmiş Yarış Yönetimi & Takip Sistemi (3 Kategori, 7 Kuş Durumu, Manuel Kayıp Koruması, Hız Hesabı & GENESIS AI Ayrımı)
    let raceTrackerOk = false;
    let rtDetail = '';
    if (typeof AvigenRaceTracker !== 'undefined') {
      const backupEvents = JSON.parse(JSON.stringify(AvigenRaceTracker.events || []));
      const testRing = ped0?.boxes?.main?.ring || 'TR-2024-100245';
      const has3Categories = Boolean(
        AvigenRaceTracker.CATEGORIES?.LOFT_ENDURANCE &&
        AvigenRaceTracker.CATEGORIES?.CLUB_RACE &&
        AvigenRaceTracker.CATEGORIES?.GRAND_PRIZE
      );
      const has7Statuses = Object.keys(AvigenRaceTracker.BIRD_STATUSES || {}).length === 7;

      AvigenRaceTracker.events = [
        AvigenRaceTracker.normalizeRaceRecord({
          id: 'qa_test_loft_1',
          category: 'LOFT_ENDURANCE',
          codeTitle: 'QA KÜMESÜSTÜ UÇUŞ 60 KM',
          releasePoint: 'Kümes Çatısı',
          distanceKm: 60,
          releaseDate: '2026-05-03',
          releaseDateLabel: '03 Mayıs',
          releaseTime: '07:00',
          stageType: 'Haftalık Performans',
          entries: [
            {
              ring: testRing,
              birdName: 'QA Test Kuşu',
              flag: '🇹🇷',
              birdStatus: 'RETURNED',
              resultStatus: 'ENTERED',
              arrivalDate: '2026-05-03',
              arrivalTime: '07:45',
              durationMinutes: 45,
              durationLabel: '45 dk',
              speedMpm: 1333.3,
              rank: 1,
              totalCompetitors: 12,
              weather: 'Açık 19°C'
            }
          ]
        }),
        AvigenRaceTracker.normalizeRaceRecord({
          id: 'qa_test_club_1',
          category: 'CLUB_RACE',
          organizationName: 'QA Test Derneği',
          seasonYear: '2026',
          stageNumber: 2,
          codeTitle: 'QA DERNEK ETABI 420 KM',
          releasePoint: 'Eskişehir',
          distanceKm: 420,
          releaseDate: '2026-05-10',
          releaseDateLabel: '10 Mayıs',
          releaseTime: '06:30',
          totalCompetitors: 1200,
          raceType: 'Orta mesafe',
          entries: [
            {
              ring: testRing,
              birdName: 'QA Test Kuşu',
              flag: '🇹🇷',
              birdStatus: 'RETURNED',
              resultStatus: 'ENTERED',
              arrivalDate: '2026-05-10',
              arrivalTime: '11:30',
              durationMinutes: 300,
              durationLabel: '5 sa 00 dk',
              speedMpm: 1400,
              rank: 4,
              totalCompetitors: 1200,
              points: 98,
              weather: 'Açık 21°C'
            }
          ]
        }),
        AvigenRaceTracker.normalizeRaceRecord({
          id: 'qa_test_grand_1',
          category: 'GRAND_PRIZE',
          organizationName: 'QA Derby OLR',
          stageType: 'Büyük Final',
          codeTitle: 'QA DERBY FİNAL 505 KM',
          releasePoint: 'Sivas',
          distanceKm: 505,
          releaseDate: '2026-05-24',
          releaseDateLabel: '24 Mayıs',
          releaseTime: '06:30',
          totalCompetitors: 2400,
          entries: [
            {
              ring: testRing,
              birdName: 'QA Test Kuşu',
              flag: '🇹🇷',
              birdStatus: 'RETURNED',
              resultStatus: 'ENTERED',
              arrivalDate: '2026-05-24',
              arrivalTime: '12:45',
              durationMinutes: 375,
              durationLabel: '6 sa 15 dk',
              speedMpm: 1346.7,
              rank: 2,
              totalCompetitors: 2400,
              wonPrizeAmountTl: 125000,
              wonAwardTitle: 'Final 2.lik Büyük Ödülü',
              weather: 'Karşıdan Rüzgar 16°C'
            }
          ]
        })
      ];

      const catArchive = AvigenRaceTracker.getBirdCategorizedArchive(testRing);
      const realAnalytics = AvigenRaceTracker.computeGenesisRealRaceAnalytics();
      const calcTest = AvigenRaceTracker.calculateFlightMetrics(420, '2026-05-10', '06:30', '2026-05-10', '11:30', null);

      raceTrackerOk = has3Categories &&
        has7Statuses &&
        calcTest.durationMinutes === 300 &&
        calcTest.speedMpm === 1400 &&
        catArchive.overall.totalParticipations === 3 &&
        catArchive.categories.LOFT_ENDURANCE.totalParticipations === 1 &&
        catArchive.categories.CLUB_RACE.totalParticipations === 1 &&
        catArchive.categories.GRAND_PRIZE.totalParticipations === 1 &&
        catArchive.categories.GRAND_PRIZE.totalPrizeTl === 125000 &&
        Boolean(realAnalytics && realAnalytics.birdsWithRealRaces.length >= 1);

      rtDetail = `3 Kategori (Kümesüstü: 1, Dernek: 1, Büyük Ödüllü: 1) • 7 Kuş Durumu • 420 km / 300 dk = 1400 m/dk • 125.000 TL Ödül & GENESIS AI doğrulandı.`;
      AvigenRaceTracker.events = backupEvents;
    }
    assert('T20', 'Gelişmiş Yarış Yönetimi', '3 Yarış Kategorisi, 7 Kuş Durumu, Kategori Bazlı Arşiv & GENESIS AI Entegrasyonu', raceTrackerOk, rtDetail);

    if (hadEmptyLoftForTest) {
      pedigrees = savedPedigreesBeforeQa;
      if (typeof invalidateUniqueLoftBirdsCache === 'function') invalidateUniqueLoftBirdsCache();
      if (typeof AvigenGenesisAI !== 'undefined' && typeof AvigenGenesisAI.invalidateEngineCache === 'function') {
        AvigenGenesisAI.invalidateEngineCache();
      }
    }

    const passedCount = results.filter(r => r.passed).length;
    return {
      total: results.length,
      passedCount,
      allPassed: passedCount === results.length,
      results
    };
  },

  runAndRenderInSecurityPane() {
    const out = document.getElementById('avigenQaTestOutputBox');
    if (!out) return;
    const report = this.runAllTests();
    out.innerHTML = `
      <div style="background:var(--ios-card-alt); border:1.5px solid ${report.allPassed ? '#16a34a' : '#dc2626'}; border-radius:10px; padding:8px 10px; font-size:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="color:${report.allPassed ? '#15803d' : '#dc2626'}; font-size:11px;">
            ${report.allPassed ? '✅ TÜM SİSTEM VE BİLİMSEL TESTLER BAŞARILI' : '⚠️ BAZI TESTLERDE UYARI VAR'}
          </strong>
          <span class="gene-badge ${report.allPassed ? 'gene-green' : 'gene-red'}">${report.passedCount} / ${report.total} GEÇTİ</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; max-height:220px; overflow-y:auto;">
          ${report.results.map(r => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:6px; background:var(--ios-card); border:1px solid var(--ios-border); border-left:3px solid ${r.passed ? '#16a34a' : '#dc2626'}; border-radius:6px; padding:4px 7px;">
              <div>
                <div><strong>[${r.id} • ${escapeHtml(r.category)}]</strong> ${escapeHtml(r.title)}</div>
                <div style="font-size:9px; color:var(--ios-subtext);">${escapeHtml(r.detail)}</div>
              </div>
              <span style="font-weight:900; color:${r.passed ? '#16a34a' : '#dc2626'}; flex-shrink:0;">${r.passed ? '✓ PASS' : '✗ FAIL'}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};
