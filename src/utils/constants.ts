import {CarPanel} from '../types';

// ── Auto King Renk Paleti ────────────────────────────────────────────────────
export const COLORS = {
  primary: '#FFD700',       // Auto King sarı
  primaryDark: '#F0C000',
  primaryLight: '#FFE84D',
  background: '#121212',    // koyu arka plan
  darkBg: '#1A1A1A',
  cardBg: '#242424',
  border: '#333333',
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#888888',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  // Hasar renkleri
  damageOriginal: '#27AE60',
  damagePaint: '#3498DB',
  damageDent: '#F39C12',
  damageScratch: '#E67E22',
  damageBroken: '#E74C3C',
  damageReplaced: '#9B59B6',
} as const;

// ── Boya Kalınlık Referans Değerleri (mikron) ────────────────────────────────
export const PAINT_REFERENCE: Partial<Record<CarPanel, {min: number; max: number}>> = {
  ön_tampon:          {min: 60,  max: 200},
  arka_tampon:         {min: 60,  max: 200},
  ön_kaput:            {min: 80,  max: 180},
  bagaj_kapağı:        {min: 80,  max: 180},
  sol_ön_çamurluk:    {min: 80,  max: 180},
  sağ_ön_çamurluk:    {min: 80,  max: 180},
  sol_arka_çamurluk:  {min: 80,  max: 180},
  sağ_arka_çamurluk:  {min: 80,  max: 180},
  sol_ön_kapı:        {min: 80,  max: 180},
  sağ_ön_kapı:        {min: 80,  max: 180},
  sol_arka_kapı:      {min: 80,  max: 180},
  sağ_arka_kapı:      {min: 80,  max: 180},
  tavan:              {min: 80,  max: 180},
};

export const PAINT_REFERENCE_DEFAULT = {min: 80, max: 180};

// ── Araç Markaları ────────────────────────────────────────────────────────────
export const CAR_BRANDS = [
  'Alfa Romeo', 'Audi', 'BMW', 'Chevrolet', 'Citroën',
  'Dacia', 'Fiat', 'Ford', 'Honda', 'Hyundai',
  'Jeep', 'Kia', 'Land Rover', 'Mazda', 'Mercedes-Benz',
  'Mitsubishi', 'Nissan', 'Opel', 'Peugeot', 'Porsche',
  'Renault', 'Seat', 'Skoda', 'Subaru', 'Suzuki',
  'Tesla', 'Toyota', 'Volkswagen', 'Volvo',
];

// ── Yakıt Tipleri ─────────────────────────────────────────────────────────────
export const FUEL_TYPES = [
  {value: 'benzin', label: 'Benzin'},
  {value: 'dizel',  label: 'Dizel'},
  {value: 'lpg',    label: 'LPG'},
  {value: 'hybrid', label: 'Hybrid'},
  {value: 'elektrik', label: 'Elektrik'},
] as const;

// ── Araç Panelleri Listesi ────────────────────────────────────────────────────
export const CAR_PANELS: {value: CarPanel; label: string}[] = [
  {value: 'ön_tampon',         label: 'Ön Tampon'},
  {value: 'arka_tampon',        label: 'Arka Tampon'},
  {value: 'ön_kaput',           label: 'Ön Kaput'},
  {value: 'bagaj_kapağı',       label: 'Bagaj Kapağı'},
  {value: 'sol_ön_çamurluk',   label: 'Sol Ön Çamurluk'},
  {value: 'sağ_ön_çamurluk',   label: 'Sağ Ön Çamurluk'},
  {value: 'sol_arka_çamurluk', label: 'Sol Arka Çamurluk'},
  {value: 'sağ_arka_çamurluk', label: 'Sağ Arka Çamurluk'},
  {value: 'sol_ön_kapı',       label: 'Sol Ön Kapı'},
  {value: 'sağ_ön_kapı',       label: 'Sağ Ön Kapı'},
  {value: 'sol_arka_kapı',     label: 'Sol Arka Kapı'},
  {value: 'sağ_arka_kapı',     label: 'Sağ Arka Kapı'},
  {value: 'tavan',             label: 'Tavan'},
  {value: 'ön_cam',            label: 'Ön Cam'},
  {value: 'arka_cam',          label: 'Arka Cam'},
  {value: 'sol_ayna',          label: 'Sol Ayna'},
  {value: 'sağ_ayna',          label: 'Sağ Ayna'},
];

// ── Hasar Tipleri ─────────────────────────────────────────────────────────────
export const DAMAGE_TYPES = [
  {value: 'orijinal',        label: 'Orijinal', color: '#27AE60'},
  {value: 'boya',            label: 'Boya',     color: '#3498DB'},
  {value: 'ezik',            label: 'Ezik',     color: '#F39C12'},
  {value: 'çizik',           label: 'Çizik',    color: '#E67E22'},
  {value: 'kırık',           label: 'Kırık',    color: '#E74C3C'},
  {value: 'değişen',         label: 'Değişen',  color: '#9B59B6'},
  {value: 'boyalı_değişen',  label: 'Boyalı Değişen', color: '#8E44AD'},
] as const;

// ── OBD2 Sistem Etiketleri ────────────────────────────────────────────────────
export const SYSTEM_LABELS: Record<string, string> = {
  engine:       'Motor',
  transmission: 'Şanzıman',
  abs:          'ABS / Fren',
  airbag:       'Airbag',
  body:         'Kaporta',
  chassis:      'Şasi',
  network:      'CAN Ağ',
};

export const SEVERITY_COLORS: Record<string, string> = {
  low:      COLORS.success,
  medium:   COLORS.warning,
  high:     '#E67E22',
  critical: COLORS.danger,
};

// ── App Sabitleri ─────────────────────────────────────────────────────────────
export const APP_NAME = 'Auto King OTO EKSPERTİZ';
export const APP_VERSION = '1.0.0';
export const DEFAULT_EXPERT_NAME = 'Auto King Ekspert';
export const DEFAULT_EXPERT_COMPANY = 'Auto King OTO EKSPERTİZ';
