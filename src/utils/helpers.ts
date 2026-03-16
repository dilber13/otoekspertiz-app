import {
  DTCCode, DamageArea, PaintMeasurement, ExpertizScore,
  MotorMekanikTest, FrenSuspansiyonTest, YanalKaymaTest,
  GuvenlikTest, GorselKontrolTest, DurumTipi,
} from '../types';
import {PAINT_REFERENCE, PAINT_REFERENCE_DEFAULT} from './constants';

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatPlate(plate: string): string {
  return plate.toUpperCase().replace(/\s+/g, ' ').trim();
}

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

export function severityLabel(severity: DTCCode['severity']): string {
  const map: Record<string, string> = {
    low: 'Düşük', medium: 'Orta', high: 'Yüksek', critical: 'Kritik',
  };
  return map[severity] ?? severity;
}

export function evaluatePaint(panel: string, thickness: number): {ok: boolean; label: string; color: string} {
  const ref = PAINT_REFERENCE[panel as keyof typeof PAINT_REFERENCE] ?? PAINT_REFERENCE_DEFAULT;
  if (thickness < ref.min * 0.5) return {ok: false, label: 'Aşırı İnce / Metal', color: '#E74C3C'};
  if (thickness < ref.min)       return {ok: false, label: 'Orijinalin Altında',  color: '#E67E22'};
  if (thickness > ref.max * 2)   return {ok: false, label: 'Çok Kalın / Hasar',   color: '#E74C3C'};
  if (thickness > ref.max * 1.5) return {ok: false, label: 'Yeniden Boyalı',      color: '#F39C12'};
  if (thickness > ref.max)       return {ok: false, label: 'Boyalı',              color: '#F39C12'};
  return {ok: true, label: 'Orijinal', color: '#27AE60'};
}

// ── Durum → puan dönüştürücü ──────────────────────────────────────────────────
function durumPuan(d: DurumTipi | undefined | null): number {
  if (!d || d === 'kontrol_edilmedi') return 80; // orta-iyi varsayılan
  if (d === 'iyi')  return 100;
  if (d === 'orta') return 65;
  if (d === 'kötü') return 20;
  return 80;
}

function avg(...vals: number[]): number {
  const filtered = vals.filter(v => v !== null && v !== undefined);
  if (!filtered.length) return 80;
  return Math.round(filtered.reduce((a, b) => a + b, 0) / filtered.length);
}

const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

// ── Ana Puan Hesaplama ────────────────────────────────────────────────────────
export function calculateScore(params: {
  dtcCodes: DTCCode[];
  damageAreas: DamageArea[];
  paintMeasurements: PaintMeasurement[];
  motorTest?: MotorMekanikTest | null;
  frenSuspansiyonTest?: FrenSuspansiyonTest | null;
  yanalKaymaTest?: YanalKaymaTest | null;
  guvenlikTest?: GuvenlikTest | null;
  gorselTest?: GorselKontrolTest | null;
}): ExpertizScore {
  const {dtcCodes, damageAreas, paintMeasurements, motorTest,
         frenSuspansiyonTest, yanalKaymaTest, guvenlikTest, gorselTest} = params;

  // ── Motor puanı ──
  let motorScore = motorTest ? avg(
    durumPuan(motorTest.yagSeviyesi),
    durumPuan(motorTest.sogutmaSuyu),
    durumPuan(motorTest.kayisZincir),
    motorTest.motorSesi === 'normal' ? 100 : motorTest.motorSesi === 'vuruntu' || motorTest.motorSesi === 'tıkırtı' ? 30 : 60,
    motorTest.egzozDumani === 'yok' ? 100 : motorTest.egzozDumani === 'beyaz' ? 50 : motorTest.egzozDumani === 'siyah' ? 40 : 60,
    motorTest.yagKoku ? 40 : 100,
    durumPuan(motorTest.havaFiltresi),
  ) : 85;

  // OBD2 motor DTC etkisi
  for (const d of dtcCodes.filter(c => c.system === 'engine' || c.system === 'transmission')) {
    motorScore -= d.severity === 'critical' ? 20 : d.severity === 'high' ? 12 : d.severity === 'medium' ? 6 : 2;
  }

  // ── Kaporta puanı ──
  let kapportaScore = 100;
  for (const a of damageAreas) kapportaScore -= a.severity * 5;
  const abnormalPaint = paintMeasurements.filter(m => {
    const ref = PAINT_REFERENCE[m.panel] ?? PAINT_REFERENCE_DEFAULT;
    return m.thickness < ref.min || m.thickness > ref.max;
  });
  kapportaScore -= abnormalPaint.length * 6;

  // ── Fren & Süspansiyon puanı ──
  let frenScore = frenSuspansiyonTest ? avg(
    // Balatalar
    frenSuspansiyonTest.balataKalinligi.solOn <= 0 ? 80 :
      frenSuspansiyonTest.balataKalinligi.solOn <= 2 ? 20 :
      frenSuspansiyonTest.balataKalinligi.solOn <= 4 ? 60 : 100,
    frenSuspansiyonTest.balataKalinligi.sagOn <= 0 ? 80 :
      frenSuspansiyonTest.balataKalinligi.sagOn <= 2 ? 20 :
      frenSuspansiyonTest.balataKalinligi.sagOn <= 4 ? 60 : 100,
    durumPuan(frenSuspansiyonTest.onDiskDurumu),
    durumPuan(frenSuspansiyonTest.arkaDiskDurumu),
    durumPuan(frenSuspansiyonTest.elFreni),
    frenSuspansiyonTest.absUyariIsigi ? 30 : 100,
    frenSuspansiyonTest.espUyariIsigi ? 40 : 100,
    durumPuan(frenSuspansiyonTest.solOnAmortisör),
    durumPuan(frenSuspansiyonTest.sagOnAmortisör),
    durumPuan(frenSuspansiyonTest.solArkaAmortisör),
    durumPuan(frenSuspansiyonTest.sagArkaAmortisör),
    durumPuan(frenSuspansiyonTest.rotRotil),
    durumPuan(frenSuspansiyonTest.burçlar),
    durumPuan(frenSuspansiyonTest.direksiyonBoşlugu),
  ) : 85;

  // OBD2 ABS etkisi
  for (const d of dtcCodes.filter(c => c.system === 'abs')) {
    frenScore -= d.severity === 'critical' ? 25 : 15;
  }

  // ── Yanal Kayma puanı ──
  let yanalScore = 90;
  if (yanalKaymaTest?.tamamlandi) {
    const onOk = yanalKaymaTest.onAksSonuc === 'geçti';
    const arkaOk = yanalKaymaTest.arkaAksSonuc === 'geçti';
    const olculdu = yanalKaymaTest.onAksSonuc !== 'ölçülmedi';
    if (!olculdu) yanalScore = 85;
    else yanalScore = onOk && arkaOk ? 100 : onOk || arkaOk ? 60 : 30;
  }

  // ── Güvenlik puanı ──
  let guvenlikScore = guvenlikTest ? avg(
    guvenlikTest.airbagUyariIsigi ? 10 : 100,
    durumPuan(guvenlikTest.suruciAirbag),
    durumPuan(guvenlikTest.yolcuAirbag),
    durumPuan(guvenlikTest.solOnKemer),
    durumPuan(guvenlikTest.sagOnKemer),
    durumPuan(guvenlikTest.solArkaKemer),
    durumPuan(guvenlikTest.sagArkaKemer),
    durumPuan(guvenlikTest.merkeziKilit),
  ) : 85;

  for (const d of dtcCodes.filter(c => c.system === 'airbag')) {
    guvenlikScore -= d.severity === 'critical' ? 30 : 15;
  }

  // ── Görsel puanı ──
  const gorselScore = gorselTest ? avg(
    durumPuan(gorselTest.onCam),
    durumPuan(gorselTest.farlar),
    durumPuan(gorselTest.stoplar),
    durumPuan(gorselTest.klima),
    durumPuan(gorselTest.gostergePaneli),
    durumPuan(gorselTest.doseme),
    durumPuan(gorselTest.tavan),
  ) : 85;

  // ── OBD2 genel puanı ──
  let obd2Score = 100;
  for (const d of dtcCodes) {
    obd2Score -= d.severity === 'critical' ? 15 : d.severity === 'high' ? 8 : d.severity === 'medium' ? 4 : 1;
  }

  const motor           = clamp(motorScore);
  const kaporta         = clamp(kapportaScore);
  const frenSuspansiyon = clamp(frenScore);
  const yanalKayma      = clamp(yanalScore);
  const guvenlik        = clamp(guvenlikScore);
  const gorsel          = clamp(gorselScore);
  const obd2            = clamp(obd2Score);

  const overall = clamp(
    motor           * 0.22 +
    kaporta         * 0.20 +
    frenSuspansiyon * 0.18 +
    yanalKayma      * 0.10 +
    guvenlik        * 0.15 +
    gorsel          * 0.08 +
    obd2            * 0.07,
  );

  return {motor, kaporta, frenSuspansiyon, yanalKayma, guvenlik, gorsel, obd2, overall};
}

export function formatKM(km: number): string {
  return km.toLocaleString('tr-TR') + ' km';
}

export function formatLiveValue(key: string, value: number | null): string {
  if (value === null) return '–';
  const units: Record<string, string> = {
    rpm: ' dev/dk', speed: ' km/s', engineTemp: ' °C',
    throttlePos: ' %', fuelLevel: ' %', batteryVoltage: ' V',
    intakeTemp: ' °C', mafRate: ' g/s', oxygenSensor: ' V', fuelPressure: ' kPa',
  };
  return value.toString() + (units[key] ?? '');
}

export function vehicleAge(year: number): number {
  return new Date().getFullYear() - year;
}
