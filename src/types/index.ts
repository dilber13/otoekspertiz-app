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
  code: string;          // "P0301"
  description: string;   // "Silindir 1 ateşleme arızası"
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
  | 'idle'
  | 'scanning'
  | 'connecting'
  | 'connected'
  | 'reading'
  | 'error'
  | 'disconnected';

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

// ─── Hasar Tespiti ───────────────────────────────────────────────────────────
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
  thickness: number;      // mikron
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
  x: number;             // üzerine tıklanan koordinat (0-1)
  y: number;
}

// ─── Ekspertiz Raporu ─────────────────────────────────────────────────────────
export interface ExpertizScore {
  engine: number;        // 0-100
  bodywork: number;
  interior: number;
  electrical: number;
  safety: number;
  overall: number;
}

export interface ExpertizReport {
  id: string;
  createdAt: string;
  expertName: string;
  expertCompany: string;
  vehicle: Vehicle;
  obd2Session?: OBD2Session;
  damageAreas: DamageArea[];
  paintMeasurements: PaintMeasurement[];
  score: ExpertizScore;
  notes: string;
  pdfUri?: string;
  photos: string[];
}

// ─── Navigasyon Tipleri ───────────────────────────────────────────────────────
export type RootTabParamList = {
  Home: undefined;
  OBD2: undefined;
  Camera: undefined;
  Report: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  VehicleForm: { reportId?: string };
  ReportDetail: { reportId: string };
  PhotoViewer: { uri: string };
};
