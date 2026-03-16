// ─── Araç Bilgileri ──────────────────────────────────────────────────────────
export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  engineCC: number;
  fuelType: 'benzin' | 'dizel' | 'lpg' | 'hybrid' | 'elektrik';
  color: string;
  chassisNo: string;
  engineNo: string;
  km: number;
  ownerName: string;
  ownerPhone: string;
  inspectionDate: string;
}

// ─── OBD2 / ELM327 ───────────────────────────────────────────────────────────
export interface DTCCode {
  code: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  system: 'engine' | 'transmission' | 'abs' | 'airbag' | 'body' | 'chassis' | 'network';
  category: 'P' | 'C' | 'B' | 'U';
  isPending: boolean;
  isPermanent: boolean;
}

export interface OBD2LiveData {
  rpm: number | null;
  speed: number | null;
  engineTemp: number | null;
  throttlePos: number | null;
  fuelLevel: number | null;
  batteryVoltage: number | null;
  intakeTemp: number | null;
  mafRate: number | null;
  oxygenSensor: number | null;
  fuelPressure: number | null;
}

export type OBD2ConnectionStatus =
  | 'idle' | 'scanning' | 'connecting'
  | 'connected' | 'reading' | 'error' | 'disconnected';

export interface OBD2Session {
  deviceName: string;
  deviceId: string;
  connectedAt: string;
  dtcCodes: DTCCode[];
  liveData: OBD2LiveData;
  status: OBD2ConnectionStatus;
  errorMessage?: string;
}

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

// ─── Kaporta & Boya ───────────────────────────────────────────────────────────
export type CarPanel =
  | 'ön_tampon' | 'arka_tampon'
  | 'ön_kaput' | 'bagaj_kapağı'
  | 'sol_ön_çamurluk' | 'sağ_ön_çamurluk'
  | 'sol_arka_çamurluk' | 'sağ_arka_çamurluk'
  | 'sol_ön_kapı' | 'sağ_ön_kapı'
  | 'sol_arka_kapı' | 'sağ_arka_kapı'
  | 'tavan' | 'ön_cam' | 'arka_cam'
  | 'sol_ayna' | 'sağ_ayna';

export type DamageType =
  | 'boya' | 'ezik' | 'çizik' | 'kırık'
  | 'değişen' | 'boyalı_değişen' | 'orijinal';

export type PaintCondition =
  | 'orijinal' | 'yeniden_boyalı' | 'kısmi_boyalı'
  | 'değişen_parça' | 'kaporta_hasarı';

export interface PaintMeasurement {
  panel: CarPanel;
  thickness: number;
  condition: PaintCondition;
  referenceMin: number;
  referenceMax: number;
  notes?: string;
}

export interface DamageArea {
  id: string;
  panel: CarPanel;
  damageType: DamageType;
  severity: 1 | 2 | 3 | 4 | 5;
  photoUri?: string;
  notes?: string;
  x: number;
  y: number;
}

// ─── Motor Mekanik Testi ──────────────────────────────────────────────────────
export type DurumTipi = 'iyi' | 'orta' | 'kötü' | 'kontrol_edilmedi';

export interface MotorMekanikTest {
  tamamlandi: boolean;
  // Yağ
  yagSeviyesi: DurumTipi;
  yagRengi: 'temiz' | 'koyu' | 'siyah' | 'köpüklü' | 'kontrol_edilmedi';
  yagKoku: boolean;         // yanık koku var mı
  // Soğutma
  sogutmaSuyu: DurumTipi;
  antifrizRengi: 'yeşil' | 'kırmızı' | 'mavi' | 'kahverengi' | 'kontrol_edilmedi';
  // Kayış / Zincir
  kayisZincir: DurumTipi;
  // Motor sesi
  motorSesi: 'normal' | 'vuruntu' | 'tıkırtı' | 'ıslık' | 'anormal';
  motorSesiNot?: string;
  // Egzoz
  egzozDumani: 'yok' | 'beyaz' | 'mavi' | 'siyah' | 'gri';
  egzozSesi: 'normal' | 'anormal';
  // Diğer
  motorTitresimi: DurumTipi;
  turbo: DurumTipi | 'yok';
  intercooler: DurumTipi | 'yok';
  havaFiltresi: DurumTipi;
  yakitFiltresi: DurumTipi;
  // Genel
  notlar?: string;
}

// ─── Fren & Süspansiyon Testi ─────────────────────────────────────────────────
export interface FrenKontrol {
  solOn: number;   // mm (balata kalınlığı)
  sagOn: number;
  solArka: number;
  sagArka: number;
}

export interface FrenSuspansiyonTest {
  tamamlandi: boolean;
  // Fren balataları (mm)
  balataKalinligi: FrenKontrol;
  // Fren diskleri
  onDiskDurumu: DurumTipi;
  arkaDiskDurumu: DurumTipi;
  // Fren hidroliği
  hidrolikSeviyesi: DurumTipi;
  hidrolikRengi: 'sarı' | 'kahverengi' | 'koyu' | 'kontrol_edilmedi';
  // El freni
  elFreni: DurumTipi;
  // ABS / ESP
  absUyariIsigi: boolean;
  espUyariIsigi: boolean;
  // Süspansiyon
  solOnAmortisör: DurumTipi;
  sagOnAmortisör: DurumTipi;
  solArkaAmortisör: DurumTipi;
  sagArkaAmortisör: DurumTipi;
  // Alt takım
  rotRotil: DurumTipi;
  burçlar: DurumTipi;
  stabilizatorKolları: DurumTipi;
  // Direksiyon
  direksiyonBoşlugu: DurumTipi;
  hidrolikYagSeviyesi: DurumTipi;
  // Lastikler
  solOnLastik: DurumTipi;
  sagOnLastik: DurumTipi;
  solArkaLastik: DurumTipi;
  sagArkaLastik: DurumTipi;
  lastikMarkasi?: string;
  notlar?: string;
}

// ─── Yanal Kayma Testi ────────────────────────────────────────────────────────
export interface YanalKaymaTest {
  tamamlandi: boolean;
  onAksDegeri: number | null;   // m/km  (±5 limit)
  arkaAksDegeri: number | null;
  // Ön düzen ölçümleri
  onKamber: number | null;      // derece
  onKaster: number | null;      // derece
  onToe: number | null;         // mm
  arkaKamber: number | null;
  arkaToe: number | null;
  // Sonuç
  onAksSonuc: 'geçti' | 'kaldı' | 'ölçülmedi';
  arkaAksSonuc: 'geçti' | 'kaldı' | 'ölçülmedi';
  notlar?: string;
}

// ─── Airbag & Güvenlik Testi ──────────────────────────────────────────────────
export interface GuvenlikTest {
  tamamlandi: boolean;
  // Airbag
  airbagUyariIsigi: boolean;
  suruciAirbag: DurumTipi;
  yolcuAirbag: DurumTipi;
  yanAirbagSol: DurumTipi;
  yanAirbagSag: DurumTipi;
  perde_airbag: DurumTipi;
  // Emniyet kemeri
  solOnKemer: DurumTipi;
  sagOnKemer: DurumTipi;
  solArkaKemer: DurumTipi;
  sagArkaKemer: DurumTipi;
  // Koltuklar
  suruciKoltugu: DurumTipi;
  yolcuKoltugu: DurumTipi;
  arkaKoltuk: DurumTipi;
  koltukAyarMekanizması: DurumTipi;
  // Kilit
  merkeziKilit: DurumTipi;
  cocukKilidi: DurumTipi;
  notlar?: string;
}

// ─── İç & Dış Görsel Kontrol ──────────────────────────────────────────────────
export interface GorselKontrolTest {
  tamamlandi: boolean;
  // Dış
  onCam: DurumTipi;
  arkaCam: DurumTipi;
  solOnCam: DurumTipi;
  sagOnCam: DurumTipi;
  solArkaCam: DurumTipi;
  sagArkaCam: DurumTipi;
  solAyna: DurumTipi;
  sagAyna: DurumTipi;
  farlar: DurumTipi;
  stoplar: DurumTipi;
  sinyal: DurumTipi;
  egzozBorusu: DurumTipi;
  // İç
  klima: DurumTipi;
  muzikSistemi: DurumTipi;
  navigasyon: DurumTipi;
  gostergePaneli: DurumTipi;
  direksiyon: DurumTipi;
  tavan: DurumTipi;
  doseme: DurumTipi;
  hali: DurumTipi;
  // Bagaj
  bagajAcilis: DurumTipi;
  rezervLastik: DurumTipi;
  kriko: DurumTipi;
  notlar?: string;
}

// ─── Ekspertiz Skoru ──────────────────────────────────────────────────────────
export interface ExpertizScore {
  motor: number;
  kaporta: number;
  frenSuspansiyon: number;
  yanalKayma: number;
  guvenlik: number;
  gorsel: number;
  obd2: number;
  overall: number;
}

// ─── Ekspertiz Raporu ─────────────────────────────────────────────────────────
export interface ExpertizReport {
  id: string;
  createdAt: string;
  expertName: string;
  expertCompany: string;
  vehicle: Vehicle;
  obd2Session?: OBD2Session;
  motorTest?: MotorMekanikTest;
  frenSuspansiyonTest?: FrenSuspansiyonTest;
  yanalKaymaTest?: YanalKaymaTest;
  guvenlikTest?: GuvenlikTest;
  gorselTest?: GorselKontrolTest;
  damageAreas: DamageArea[];
  paintMeasurements: PaintMeasurement[];
  score: ExpertizScore;
  notes: string;
  photos: string[];
}

// ─── Navigasyon ───────────────────────────────────────────────────────────────
export type RootTabParamList = {
  Home: undefined;
  OBD2: undefined;
  Testler: undefined;
  Report: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  VehicleForm: { reportId?: string };
  MotorMekanik: undefined;
  FrenSuspansiyon: undefined;
  YanalKayma: undefined;
  Guvenlik: undefined;
  GorselKontrol: undefined;
  KaportaBoya: undefined;
};
