import Share from 'react-native-share';
import {
  ExpertizReport, DTCCode, DamageArea, PaintMeasurement,
  MotorMekanikTest, FrenSuspansiyonTest, YanalKaymaTest,
  GuvenlikTest, GorselKontrolTest, DurumTipi,
} from '../../types';
import {formatDate, formatPlate, scoreLabel, scoreColor, severityLabel} from '../../utils/helpers';
import {COLORS, PAINT_REFERENCE, PAINT_REFERENCE_DEFAULT} from '../../utils/constants';

// ── Yardımcı ──────────────────────────────────────────────────────────────────
function durumBadge(d: DurumTipi | undefined | null, label?: string): string {
  if (!d || d === 'kontrol_edilmedi') return `<span style="color:#888">${label ?? '–'}</span>`;
  const map: Record<DurumTipi, {color: string; tr: string}> = {
    iyi:              {color: '#27ae60', tr: 'İyi'},
    orta:             {color: '#f39c12', tr: 'Orta'},
    kötü:             {color: '#e74c3c', tr: 'Kötü'},
    kontrol_edilmedi: {color: '#888',    tr: '–'},
  };
  const cfg = map[d];
  return `<span style="background:${cfg.color};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${cfg.tr}</span>`;
}

function bool(v: boolean, iyiHayir = true): string {
  if (iyiHayir) return v ? '<span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">Evet ⚠</span>'
                         : '<span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">Hayır ✅</span>';
  return v ? '<span style="background:#27ae60;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">Evet</span>'
           : '<span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">Hayır</span>';
}

function scoreBar(label: string, value: number): string {
  const color = value >= 80 ? '#27ae60' : value >= 60 ? '#f39c12' : '#e74c3c';
  return `
    <div style="margin:6px 0">
      <div style="display:flex;justify-content:space-between;margin-bottom:3px">
        <span style="font-size:13px">${label}</span>
        <span style="font-weight:bold;color:${color}">${value}/100</span>
      </div>
      <div style="background:#ddd;border-radius:4px;height:10px">
        <div style="background:${color};width:${value}%;height:100%;border-radius:4px"></div>
      </div>
    </div>`;
}

function tablo(baslik: string[], satirlar: string[][]): string {
  return `<table><thead><tr>${baslik.map(b => `<th>${b}</th>`).join('')}</tr></thead>
  <tbody>${satirlar.map(s => `<tr>${s.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

// ── Motor Mekanik Bölümü ──────────────────────────────────────────────────────
function motorSection(t: MotorMekanikTest): string {
  const egzozRenk: Record<string, string> = {
    yok: '#27ae60', beyaz: '#f39c12', mavi: '#e67e22', siyah: '#e74c3c', gri: '#f39c12',
  };
  const motorSesRenk: Record<string, string> = {
    normal: '#27ae60', vuruntu: '#e74c3c', tıkırtı: '#e74c3c', ıslık: '#f39c12', anormal: '#e74c3c',
  };
  return `
  <section>
    <h2>🔧 Motor Mekanik Testi</h2>
    <div class="grid2">
      <div class="info-item"><div class="info-label">Yağ Seviyesi</div><div>${durumBadge(t.yagSeviyesi)}</div></div>
      <div class="info-item"><div class="info-label">Yağ Rengi</div><div>${t.yagRengi ?? '–'}</div></div>
      <div class="info-item"><div class="info-label">Yanık Yağ Kokusu</div><div>${bool(t.yagKoku)}</div></div>
      <div class="info-item"><div class="info-label">Soğutma Suyu</div><div>${durumBadge(t.sogutmaSuyu)}</div></div>
      <div class="info-item"><div class="info-label">Antifriz Rengi</div><div>${t.antifrizRengi ?? '–'}</div></div>
      <div class="info-item"><div class="info-label">Kayış / Zincir</div><div>${durumBadge(t.kayisZincir)}</div></div>
      <div class="info-item"><div class="info-label">Motor Sesi</div>
        <div><span style="background:${motorSesRenk[t.motorSesi] ?? '#888'};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">${t.motorSesi}</span></div>
      </div>
      <div class="info-item"><div class="info-label">Egzoz Dumanı</div>
        <div><span style="background:${egzozRenk[t.egzozDumani] ?? '#888'};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">${t.egzozDumani === 'yok' ? 'Normal / Yok' : t.egzozDumani}</span></div>
      </div>
      <div class="info-item"><div class="info-label">Motor Titreşimi</div><div>${durumBadge(t.motorTitresimi)}</div></div>
      <div class="info-item"><div class="info-label">Turbo</div><div>${t.turbo === 'yok' ? 'Yok' : durumBadge(t.turbo as DurumTipi)}</div></div>
      <div class="info-item"><div class="info-label">Hava Filtresi</div><div>${durumBadge(t.havaFiltresi)}</div></div>
      <div class="info-item"><div class="info-label">Yakıt Filtresi</div><div>${durumBadge(t.yakitFiltresi)}</div></div>
    </div>
    ${t.motorSesiNot ? `<p style="margin-top:8px;font-size:12px;color:#555">Ses Notu: ${t.motorSesiNot}</p>` : ''}
    ${t.notlar ? `<p style="margin-top:8px;font-size:12px;color:#555">Notlar: ${t.notlar}</p>` : ''}
  </section>`;
}

// ── Fren & Süspansiyon Bölümü ─────────────────────────────────────────────────
function frenSection(t: FrenSuspansiyonTest): string {
  function balataRenk(mm: number): string {
    if (mm <= 0) return '#888';
    if (mm <= 2) return '#e74c3c';
    if (mm <= 4) return '#f39c12';
    return '#27ae60';
  }
  function balataHtml(mm: number): string {
    return `<span style="color:${balataRenk(mm)};font-weight:bold">${mm > 0 ? mm + ' mm' : '–'}</span>`;
  }
  return `
  <section>
    <h2>🛞 Fren & Süspansiyon Testi</h2>
    <h3 style="font-size:13px;color:#555;margin-bottom:6px">Fren Balataları</h3>
    ${tablo(['', 'Sol', 'Sağ'], [
      ['Ön', balataHtml(t.balataKalinligi.solOn), balataHtml(t.balataKalinligi.sagOn)],
      ['Arka', balataHtml(t.balataKalinligi.solArka), balataHtml(t.balataKalinligi.sagArka)],
    ])}
    <div class="grid2" style="margin-top:10px">
      <div class="info-item"><div class="info-label">Ön Diskler</div><div>${durumBadge(t.onDiskDurumu)}</div></div>
      <div class="info-item"><div class="info-label">Arka Diskler</div><div>${durumBadge(t.arkaDiskDurumu)}</div></div>
      <div class="info-item"><div class="info-label">Hidrolik Seviyesi</div><div>${durumBadge(t.hidrolikSeviyesi)}</div></div>
      <div class="info-item"><div class="info-label">El Freni</div><div>${durumBadge(t.elFreni)}</div></div>
      <div class="info-item"><div class="info-label">ABS Uyarı Işığı</div><div>${bool(t.absUyariIsigi)}</div></div>
      <div class="info-item"><div class="info-label">ESP Uyarı Işığı</div><div>${bool(t.espUyariIsigi)}</div></div>
    </div>
    <h3 style="font-size:13px;color:#555;margin:10px 0 6px">Amortisörler</h3>
    ${tablo(['', 'Sol', 'Sağ'], [
      ['Ön', durumBadge(t.solOnAmortisör), durumBadge(t.sagOnAmortisör)],
      ['Arka', durumBadge(t.solArkaAmortisör), durumBadge(t.sagArkaAmortisör)],
    ])}
    <div class="grid2" style="margin-top:10px">
      <div class="info-item"><div class="info-label">Rot / Rotil</div><div>${durumBadge(t.rotRotil)}</div></div>
      <div class="info-item"><div class="info-label">Burçlar</div><div>${durumBadge(t.burçlar)}</div></div>
      <div class="info-item"><div class="info-label">Stabilizatör</div><div>${durumBadge(t.stabilizatorKolları)}</div></div>
      <div class="info-item"><div class="info-label">Direksiyon Boşluğu</div><div>${durumBadge(t.direksiyonBoşlugu)}</div></div>
    </div>
    ${t.notlar ? `<p style="margin-top:8px;font-size:12px;color:#555">Notlar: ${t.notlar}</p>` : ''}
  </section>`;
}

// ── Yanal Kayma Bölümü ────────────────────────────────────────────────────────
function yanalSection(t: YanalKaymaTest): string {
  function aksHtml(val: number | null, sonuc: string): string {
    if (val === null) return '<span style="color:#888">Ölçülmedi</span>';
    const color = Math.abs(val) <= 5 ? '#27ae60' : '#e74c3c';
    const s = sonuc === 'geçti' ? '✅ GEÇTİ' : '❌ KALDI';
    return `<span style="color:${color};font-weight:bold">${val} m/km</span> — <span style="color:${color}">${s}</span>`;
  }
  return `
  <section>
    <h2>📐 Yanal Kayma Testi</h2>
    <div class="grid2">
      <div class="info-item" style="text-align:center">
        <div class="info-label">Ön Aks</div>
        <div style="font-size:15px;margin-top:4px">${aksHtml(t.onAksDegeri, t.onAksSonuc)}</div>
      </div>
      <div class="info-item" style="text-align:center">
        <div class="info-label">Arka Aks</div>
        <div style="font-size:15px;margin-top:4px">${aksHtml(t.arkaAksDegeri, t.arkaAksSonuc)}</div>
      </div>
    </div>
    ${(t.onKamber || t.onKaster || t.onToe) ? `
    <h3 style="font-size:13px;color:#555;margin:10px 0 6px">Ön Düzen Ölçümleri</h3>
    <div class="grid2">
      ${t.onKamber != null ? `<div class="info-item"><div class="info-label">Ön Kamber</div><div>${t.onKamber}°</div></div>` : ''}
      ${t.onKaster != null ? `<div class="info-item"><div class="info-label">Ön Kaster</div><div>${t.onKaster}°</div></div>` : ''}
      ${t.onToe != null ? `<div class="info-item"><div class="info-label">Ön Toe</div><div>${t.onToe} mm</div></div>` : ''}
      ${t.arkaKamber != null ? `<div class="info-item"><div class="info-label">Arka Kamber</div><div>${t.arkaKamber}°</div></div>` : ''}
      ${t.arkaToe != null ? `<div class="info-item"><div class="info-label">Arka Toe</div><div>${t.arkaToe} mm</div></div>` : ''}
    </div>` : ''}
    ${t.notlar ? `<p style="font-size:12px;color:#555;margin-top:8px">Notlar: ${t.notlar}</p>` : ''}
  </section>`;
}

// ── Güvenlik Bölümü ───────────────────────────────────────────────────────────
function guvenlikSection(t: GuvenlikTest): string {
  return `
  <section>
    <h2>🛡️ Airbag & Güvenlik Testi</h2>
    <div style="padding:10px;margin-bottom:10px;border-radius:8px;background:${t.airbagUyariIsigi ? '#fdecea' : '#eafaf1'}">
      <strong>Airbag Uyarı Işığı:</strong> ${bool(t.airbagUyariIsigi)}
    </div>
    <div class="grid2">
      <div class="info-item"><div class="info-label">Sürücü Airbag</div><div>${durumBadge(t.suruciAirbag)}</div></div>
      <div class="info-item"><div class="info-label">Yolcu Airbag</div><div>${durumBadge(t.yolcuAirbag)}</div></div>
      <div class="info-item"><div class="info-label">Sol Yan Airbag</div><div>${durumBadge(t.yanAirbagSol)}</div></div>
      <div class="info-item"><div class="info-label">Sağ Yan Airbag</div><div>${durumBadge(t.yanAirbagSag)}</div></div>
      <div class="info-item"><div class="info-label">Perde Airbag</div><div>${durumBadge(t.perde_airbag)}</div></div>
    </div>
    <h3 style="font-size:13px;color:#555;margin:10px 0 6px">Emniyet Kemerleri</h3>
    ${tablo(['Konum', 'Durum'], [
      ['Sol Ön', durumBadge(t.solOnKemer)],
      ['Sağ Ön', durumBadge(t.sagOnKemer)],
      ['Sol Arka', durumBadge(t.solArkaKemer)],
      ['Sağ Arka', durumBadge(t.sagArkaKemer)],
    ])}
    <div class="grid2" style="margin-top:10px">
      <div class="info-item"><div class="info-label">Sürücü Koltuğu</div><div>${durumBadge(t.suruciKoltugu)}</div></div>
      <div class="info-item"><div class="info-label">Yolcu Koltuğu</div><div>${durumBadge(t.yolcuKoltugu)}</div></div>
      <div class="info-item"><div class="info-label">Merkezi Kilit</div><div>${durumBadge(t.merkeziKilit)}</div></div>
      <div class="info-item"><div class="info-label">Çocuk Kilidi</div><div>${durumBadge(t.cocukKilidi)}</div></div>
    </div>
    ${t.notlar ? `<p style="font-size:12px;color:#555;margin-top:8px">Notlar: ${t.notlar}</p>` : ''}
  </section>`;
}

// ── Görsel Kontrol Bölümü ─────────────────────────────────────────────────────
function gorselSection(t: GorselKontrolTest): string {
  return `
  <section>
    <h2>👁️ İç & Dış Görsel Kontrol</h2>
    <h3 style="font-size:13px;color:#555;margin-bottom:6px">Dış Kontrol</h3>
    <div class="grid2">
      <div class="info-item"><div class="info-label">Ön Cam</div><div>${durumBadge(t.onCam)}</div></div>
      <div class="info-item"><div class="info-label">Arka Cam</div><div>${durumBadge(t.arkaCam)}</div></div>
      <div class="info-item"><div class="info-label">Sol Ayna</div><div>${durumBadge(t.solAyna)}</div></div>
      <div class="info-item"><div class="info-label">Sağ Ayna</div><div>${durumBadge(t.sagAyna)}</div></div>
      <div class="info-item"><div class="info-label">Farlar</div><div>${durumBadge(t.farlar)}</div></div>
      <div class="info-item"><div class="info-label">Stop Lambaları</div><div>${durumBadge(t.stoplar)}</div></div>
      <div class="info-item"><div class="info-label">Sinyal Lambaları</div><div>${durumBadge(t.sinyal)}</div></div>
      <div class="info-item"><div class="info-label">Egzoz Borusu</div><div>${durumBadge(t.egzozBorusu)}</div></div>
    </div>
    <h3 style="font-size:13px;color:#555;margin:10px 0 6px">İç Mekan</h3>
    <div class="grid2">
      <div class="info-item"><div class="info-label">Klima</div><div>${durumBadge(t.klima)}</div></div>
      <div class="info-item"><div class="info-label">Müzik Sistemi</div><div>${durumBadge(t.muzikSistemi)}</div></div>
      <div class="info-item"><div class="info-label">Gösterge Paneli</div><div>${durumBadge(t.gostergePaneli)}</div></div>
      <div class="info-item"><div class="info-label">Tavan</div><div>${durumBadge(t.tavan)}</div></div>
      <div class="info-item"><div class="info-label">Döşeme</div><div>${durumBadge(t.doseme)}</div></div>
      <div class="info-item"><div class="info-label">Halı / Paspas</div><div>${durumBadge(t.hali)}</div></div>
    </div>
    <h3 style="font-size:13px;color:#555;margin:10px 0 6px">Bagaj</h3>
    <div class="grid2">
      <div class="info-item"><div class="info-label">Bagaj Açılış</div><div>${durumBadge(t.bagajAcilis)}</div></div>
      <div class="info-item"><div class="info-label">Rezerv Lastik</div><div>${durumBadge(t.rezervLastik)}</div></div>
      <div class="info-item"><div class="info-label">Kriko</div><div>${durumBadge(t.kriko)}</div></div>
    </div>
    ${t.notlar ? `<p style="font-size:12px;color:#555;margin-top:8px">Notlar: ${t.notlar}</p>` : ''}
  </section>`;
}

// ── Ana HTML Rapor ────────────────────────────────────────────────────────────
export function generateHTMLReport(report: ExpertizReport): string {
  const {vehicle, obd2Session, damageAreas, paintMeasurements, score,
         motorTest, frenSuspansiyonTest, yanalKaymaTest, guvenlikTest, gorselTest} = report;

  const dtcRows = (obd2Session?.dtcCodes ?? []).map(dtc => {
    const colMap: Record<string, string> = {low: '#27ae60', medium: '#f39c12', high: '#e67e22', critical: '#e74c3c'};
    const col = colMap[dtc.severity] ?? '#888';
    return `<tr>
      <td><code>${dtc.code}</code></td>
      <td>${dtc.description}</td>
      <td><span style="background:${col};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">${severityLabel(dtc.severity)}</span></td>
      <td>${dtc.system}</td>
    </tr>`;
  }).join('');

  const paintRows = paintMeasurements.map(m => {
    const ref = PAINT_REFERENCE[m.panel] ?? PAINT_REFERENCE_DEFAULT;
    const ok = m.thickness >= ref.min && m.thickness <= ref.max;
    return `<tr>
      <td>${m.panel.replace(/_/g, ' ')}</td>
      <td style="color:${ok ? '#27ae60' : '#e74c3c'};font-weight:bold;text-align:center">${m.thickness} µ</td>
      <td style="text-align:center">${ref.min}–${ref.max} µ</td>
      <td>${ok ? '✅ Orijinal' : '⚠ Boyalı'}</td>
    </tr>`;
  }).join('');

  const damageRows = damageAreas.map(d => `<tr>
    <td>${d.panel.replace(/_/g, ' ')}</td>
    <td>${d.damageType}</td>
    <td style="text-align:center">${d.severity}/5</td>
    <td>${d.notes ?? '–'}</td>
  </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<title>Ekspertiz Raporu – ${vehicle.plate}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#222;background:#fff;padding:20px;font-size:14px}
  .header{background:#1a1a1a;color:#FFD700;padding:20px;border-radius:8px;margin-bottom:20px}
  .header h1{font-size:22px}
  .header p{font-size:13px;color:#ccc;margin-top:4px}
  .badge{background:#FFD700;color:#1a1a1a;padding:5px 15px;border-radius:20px;font-weight:900;font-size:20px;display:inline-block;margin-top:8px;letter-spacing:2px}
  section{margin-bottom:24px}
  h2{font-size:16px;font-weight:bold;color:#1a1a1a;border-bottom:2px solid #FFD700;padding-bottom:6px;margin-bottom:12px}
  h3{font-size:14px;font-weight:bold;color:#333}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .info-item{background:#f9f9f9;padding:8px 12px;border-radius:6px}
  .info-label{font-size:11px;color:#888;margin-bottom:3px}
  .score-card{background:#f0f0f0;padding:16px;border-radius:8px}
  .overall{text-align:center;padding:16px;background:#1a1a1a;border-radius:8px;color:#FFD700;margin-bottom:16px}
  .overall .num{font-size:56px;font-weight:900;line-height:1}
  .overall .lbl{font-size:13px;color:#ccc}
  table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px}
  th{background:#1a1a1a;color:#FFD700;padding:8px;text-align:left}
  td{padding:8px;border-bottom:1px solid #eee}
  tr:nth-child(even) td{background:#f9f9f9}
  code{background:#f0f0f0;padding:2px 6px;border-radius:3px;font-family:monospace;font-size:12px}
  .no-data{color:#aaa;font-style:italic;padding:12px;text-align:center}
  .footer{text-align:center;font-size:11px;color:#aaa;margin-top:24px;border-top:1px solid #eee;padding-top:12px}
  @media print{body{padding:10px}.header{border-radius:0}}
</style>
</head>
<body>

<div class="header">
  <h1>🔧 AUTO KING OTO EKSPERTİZ</h1>
  <p>Ekspertiz Raporu — ${formatDate(report.createdAt)}</p>
  <p>Uzman: ${report.expertName} | ${report.expertCompany}</p>
  <div class="badge">${formatPlate(vehicle.plate)}</div>
</div>

<!-- Genel Skor -->
<section>
  <h2>📊 Genel Değerlendirme</h2>
  <div class="score-card">
    <div class="overall">
      <div class="num">${score.overall}</div>
      <div class="lbl">${scoreLabel(score.overall)}</div>
    </div>
    ${scoreBar('🔧 Motor Mekanik', score.motor)}
    ${scoreBar('🎨 Kaporta & Boya', score.kaporta)}
    ${scoreBar('🛞 Fren & Süspansiyon', score.frenSuspansiyon)}
    ${scoreBar('📐 Yanal Kayma', score.yanalKayma)}
    ${scoreBar('🛡️ Airbag & Güvenlik', score.guvenlik)}
    ${scoreBar('👁️ Görsel Kontrol', score.gorsel)}
    ${scoreBar('🔌 OBD2 / Beyin', score.obd2)}
  </div>
</section>

<!-- Araç Bilgileri -->
<section>
  <h2>🚗 Araç Bilgileri</h2>
  <div class="grid2">
    <div class="info-item"><div class="info-label">Plaka</div><strong>${formatPlate(vehicle.plate)}</strong></div>
    <div class="info-item"><div class="info-label">Marka / Model</div><strong>${vehicle.brand} ${vehicle.model}</strong></div>
    <div class="info-item"><div class="info-label">Yıl</div>${vehicle.year}</div>
    <div class="info-item"><div class="info-label">Km</div>${vehicle.km.toLocaleString('tr-TR')} km</div>
    <div class="info-item"><div class="info-label">Yakıt</div>${vehicle.fuelType.toUpperCase()}</div>
    <div class="info-item"><div class="info-label">Motor Hacmi</div>${vehicle.engineCC} cc</div>
    <div class="info-item"><div class="info-label">Renk</div>${vehicle.color}</div>
    <div class="info-item"><div class="info-label">Şasi No</div><code>${vehicle.chassisNo || '–'}</code></div>
    ${vehicle.ownerName ? `<div class="info-item"><div class="info-label">Sahibi</div>${vehicle.ownerName}</div>` : ''}
    ${vehicle.ownerPhone ? `<div class="info-item"><div class="info-label">Telefon</div>${vehicle.ownerPhone}</div>` : ''}
  </div>
</section>

<!-- OBD2 -->
<section>
  <h2>🔌 OBD2 Beyin Testi — Arıza Kodları</h2>
  ${obd2Session ? `
    <p style="font-size:12px;color:#888;margin-bottom:8px">Cihaz: ${obd2Session.deviceName} | ${formatDate(obd2Session.connectedAt)}</p>
    ${dtcRows ? `<table><thead><tr><th>Kod</th><th>Açıklama</th><th>Önem</th><th>Sistem</th></tr></thead><tbody>${dtcRows}</tbody></table>`
              : '<div class="no-data">✅ Arıza kodu bulunamadı</div>'}
  ` : '<div class="no-data">OBD2 bağlantısı yapılmadı</div>'}
</section>

<!-- Motor Mekanik -->
${motorTest ? motorSection(motorTest) : '<section><h2>🔧 Motor Mekanik Testi</h2><div class="no-data">Test yapılmadı</div></section>'}

<!-- Fren & Süspansiyon -->
${frenSuspansiyonTest ? frenSection(frenSuspansiyonTest) : '<section><h2>🛞 Fren & Süspansiyon</h2><div class="no-data">Test yapılmadı</div></section>'}

<!-- Yanal Kayma -->
${yanalKaymaTest ? yanalSection(yanalKaymaTest) : '<section><h2>📐 Yanal Kayma Testi</h2><div class="no-data">Test yapılmadı</div></section>'}

<!-- Airbag & Güvenlik -->
${guvenlikTest ? guvenlikSection(guvenlikTest) : '<section><h2>🛡️ Airbag & Güvenlik</h2><div class="no-data">Test yapılmadı</div></section>'}

<!-- Görsel Kontrol -->
${gorselTest ? gorselSection(gorselTest) : '<section><h2>👁️ Görsel Kontrol</h2><div class="no-data">Test yapılmadı</div></section>'}

<!-- Kaporta & Boya -->
<section>
  <h2>🎨 Kaporta & Boya Kontrolü</h2>
  ${paintMeasurements.length > 0 ? `
    <table><thead><tr><th>Panel</th><th>Ölçüm</th><th>Referans</th><th>Durum</th></tr></thead>
    <tbody>${paintRows}</tbody></table>` : '<div class="no-data">Boya ölçümü yapılmadı</div>'}
  ${damageAreas.length > 0 ? `
    <h3 style="margin-top:10px;margin-bottom:6px">Hasar Bölgeleri</h3>
    <table><thead><tr><th>Panel</th><th>Tip</th><th>Şiddet</th><th>Notlar</th></tr></thead>
    <tbody>${damageRows}</tbody></table>` : '<div class="no-data" style="margin-top:8px">✅ Hasar tespit edilmedi</div>'}
</section>

<div class="footer">
  <p>Auto King OTO EKSPERTİZ | Rapor No: ${report.id} | ${formatDate(report.createdAt)}</p>
</div>
</body></html>`;
}

export async function shareReport(report: ExpertizReport): Promise<void> {
  const html = generateHTMLReport(report);
  await Share.open({
    title: `Ekspertiz Raporu – ${report.vehicle.plate}`,
    message: `Auto King OTO EKSPERTİZ\nAraç: ${report.vehicle.brand} ${report.vehicle.model}\nPlaka: ${report.vehicle.plate}\nPuan: ${report.score.overall}/100`,
    url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
    type: 'text/html',
  });
}

export async function shareReportAsText(report: ExpertizReport): Promise<void> {
  const {vehicle, score, obd2Session, damageAreas, motorTest, frenSuspansiyonTest, yanalKaymaTest} = report;
  const lines = [
    '🔧 AUTO KING OTO EKSPERTİZ RAPORU',
    '══════════════════════════════════',
    `📅 ${formatDate(report.createdAt)}`,
    `🚗 ${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
    `🪪  Plaka: ${formatPlate(vehicle.plate)}`,
    `📍 Km: ${vehicle.km.toLocaleString('tr-TR')} km`,
    '',
    '📊 PUANLAR',
    `   Genel:            ${score.overall}/100 — ${scoreLabel(score.overall)}`,
    `   Motor Mekanik:    ${score.motor}/100`,
    `   Kaporta & Boya:   ${score.kaporta}/100`,
    `   Fren & Süsp.:     ${score.frenSuspansiyon}/100`,
    `   Yanal Kayma:      ${score.yanalKayma}/100`,
    `   Güvenlik:         ${score.guvenlik}/100`,
    `   Görsel Kontrol:   ${score.gorsel}/100`,
    `   OBD2 Beyin:       ${score.obd2}/100`,
    '',
    `🔌 OBD2: ${obd2Session?.dtcCodes?.length ?? 0} arıza kodu`,
    `💥 Hasar: ${damageAreas.length} bölge`,
    yanalKaymaTest?.tamamlandi ? `📐 Yanal Kayma: Ön ${yanalKaymaTest.onAksDegeri ?? '–'} m/km | Arka ${yanalKaymaTest.arkaAksDegeri ?? '–'} m/km` : '',
    '',
    `Rapor No: ${report.id}`,
  ].filter(Boolean).join('\n');

  await Share.open({title: `Ekspertiz Raporu – ${vehicle.plate}`, message: lines});
}
