import {DTCCode, DamageArea, PaintMeasurement, ExpertizScore} from '../types';
import {PAINT_REFERENCE, PAINT_REFERENCE_DEFAULT} from './constants';

// ── Tarih Formatlama ──────────────────────────────────────────────────────────
export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Plaka Formatlama ──────────────────────────────────────────────────────────
export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/\s+/g, ' ').trim();
}

// ── Puan Etiketi ──────────────────────────────────────────────────────────────
export function scoreLabel(score: number): string {
  if (score >= 90) return 'Mükemmel';
  if (score >= 80) return 'Çok İyi';
  if (score >= 70) return 'İyi';
  if (score >= 60) return 'Orta';
  if (score >= 50) return 'Kabul Edilebilir';
  if (score >= 40) return 'Zayıf';
  return 'Kötü';
}

export function scoreColor(score: number): string {
  if (score >= 80) return '#27AE60';
  if (score >= 60) return '#F39C12';
  return '#E74C3C';
}

// ── Önem Düzeyi Etiketi ───────────────────────────────────────────────────────
export function severityLabel(severity: DTCCode['severity']): string {
  const map: Record<string, string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    critical: 'Kritik',
  };
  return map[severity] ?? severity;
}

// ── Boya Durumu Değerlendirme ─────────────────────────────────────────────────
export function evaluatePaint(panel: string, thickness: number): {
  ok: boolean;
  label: string;
  color: string;
} {
  const ref = PAINT_REFERENCE[panel as keyof typeof PAINT_REFERENCE] ?? PAINT_REFERENCE_DEFAULT;

  if (thickness < ref.min * 0.5) {
    return {ok: false, label: 'Aşırı İnce / Metal Görünüyor', color: '#E74C3C'};
  }
  if (thickness < ref.min) {
    return {ok: false, label: 'Orijinalin Altında', color: '#E67E22'};
  }
  if (thickness > ref.max * 2) {
    return {ok: false, label: 'Çok Kalın / Kaporta Onarımı', color: '#E74C3C'};
  }
  if (thickness > ref.max * 1.5) {
    return {ok: false, label: 'Kalın / Yeniden Boyalı', color: '#F39C12'};
  }
  if (thickness > ref.max) {
    return {ok: false, label: 'Orijinalin Üstünde / Boyalı', color: '#F39C12'};
  }
  return {ok: true, label: 'Orijinal', color: '#27AE60'};
}

// ── Ekspertiz Puanı Hesaplama ─────────────────────────────────────────────────
export function calculateScore(
  dtcCodes: DTCCode[],
  damageAreas: DamageArea[],
  paintMeasurements: PaintMeasurement[],
): ExpertizScore {
  // Motor / Elektrik puanı – DTC kodlarına göre
  let engineScore = 100;
  let electricalScore = 100;
  let safetyScore = 100;

  for (const dtc of dtcCodes) {
    const penalty =
      dtc.severity === 'critical' ? 25
      : dtc.severity === 'high'   ? 15
      : dtc.severity === 'medium' ? 8
      : 3;

    switch (dtc.system) {
      case 'engine':
      case 'transmission':
        engineScore -= penalty;
        break;
      case 'abs':
      case 'airbag':
        safetyScore -= penalty;
        break;
      case 'network':
      case 'body':
        electricalScore -= penalty;
        break;
    }
  }

  // Kaporta / Boya puanı – hasar bölgeleri ve boya ölçümlerine göre
  let bodyScore = 100;

  for (const area of damageAreas) {
    const penalty = area.severity * 4;
    bodyScore -= penalty;
  }

  const abnormalPaint = paintMeasurements.filter(m => {
    const ref = PAINT_REFERENCE[m.panel] ?? PAINT_REFERENCE_DEFAULT;
    return m.thickness < ref.min || m.thickness > ref.max;
  });
  bodyScore -= abnormalPaint.length * 5;

  // İç mekan puanı – şimdilik sabit (kamera tespit eklendiğinde güncellenir)
  const interiorScore = 85;

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  const engine = clamp(engineScore);
  const bodywork = clamp(bodyScore);
  const interior = clamp(interiorScore);
  const electrical = clamp(electricalScore);
  const safety = clamp(safetyScore);

  const overall = clamp(
    engine * 0.30 +
    bodywork * 0.25 +
    interior * 0.15 +
    electrical * 0.15 +
    safety * 0.15,
  );

  return {engine, bodywork, interior, electrical, safety, overall};
}

// ── KM Formatlama ─────────────────────────────────────────────────────────────
export function formatKM(km: number): string {
  return km.toLocaleString('tr-TR') + ' km';
}

// ── OBD2 Canlı Veri Birimi ────────────────────────────────────────────────────
export function formatLiveValue(key: string, value: number | null): string {
  if (value === null) return '–';
  const units: Record<string, string> = {
    rpm:           ' dev/dk',
    speed:         ' km/s',
    engineTemp:    ' °C',
    throttlePos:   ' %',
    fuelLevel:     ' %',
    batteryVoltage:' V',
    intakeTemp:    ' °C',
    mafRate:       ' g/s',
    oxygenSensor:  ' V',
    fuelPressure:  ' kPa',
  };
  return value.toString() + (units[key] ?? '');
}

// ── Yaş Hesabı ────────────────────────────────────────────────────────────────
export function vehicleAge(year: number): number {
  return new Date().getFullYear() - year;
}
