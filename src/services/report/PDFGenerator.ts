import {Platform} from 'react-native';
import Share from 'react-native-share';
import {ExpertizReport, DTCCode, DamageArea, PaintMeasurement} from '../../types';
import {formatDate, formatPlate, scoreLabel, severityLabel} from '../../utils/helpers';
import {COLORS, PAINT_REFERENCE} from '../../utils/constants';

// ── HTML Rapor Oluşturucu ────────────────────────────────────────────────────
// react-native-pdf-lib yerine HTML → share akışı kullanıyoruz
// (production'da WKWebView veya react-native-html-to-pdf ile PDF'e çevrilebilir)

function severityBadge(severity: DTCCode['severity']): string {
  const colorMap: Record<string, string> = {
    low: '#27ae60',
    medium: '#f39c12',
    high: '#e67e22',
    critical: '#e74c3c',
  };
  const labelMap: Record<string, string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
    critical: 'Kritik',
  };
  const color = colorMap[severity] ?? '#888';
  return `<span style="background:${color};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px;">${labelMap[severity] ?? severity}</span>`;
}

function paintRow(m: PaintMeasurement): string {
  const ref = PAINT_REFERENCE[m.panel] ?? {min: 60, max: 200};
  const isOk = m.thickness >= ref.min && m.thickness <= ref.max;
  const statusColor = isOk ? '#27ae60' : '#e74c3c';
  const conditionLabels: Record<string, string> = {
    orijinal: 'Orijinal',
    yeniden_boyalı: 'Yeniden Boyalı',
    kısmi_boyalı: 'Kısmı Boyalı',
    değişen_parça: 'Değişen Parça',
    kaporta_hasarı: 'Kaporta Hasarı',
  };

  return `
    <tr>
      <td>${m.panel.replace(/_/g, ' ')}</td>
      <td style="text-align:center;color:${statusColor};font-weight:bold">${m.thickness} µ</td>
      <td style="text-align:center">${ref.min}–${ref.max} µ</td>
      <td>${conditionLabels[m.condition] ?? m.condition}</td>
      <td>${m.notes ?? '–'}</td>
    </tr>`;
}

function damageRow(d: DamageArea): string {
  const typeLabels: Record<string, string> = {
    boya: 'Boya',
    ezik: 'Ezik',
    çizik: 'Çizik',
    kırık: 'Kırık',
    değişen: 'Değişen',
    boyalı_değişen: 'Boyalı Değişen',
    orijinal: 'Orijinal',
  };
  const severityColors = ['', '#27ae60', '#8bc34a', '#f39c12', '#e67e22', '#e74c3c'];

  return `
    <tr>
      <td>${d.panel.replace(/_/g, ' ')}</td>
      <td>${typeLabels[d.damageType] ?? d.damageType}</td>
      <td style="text-align:center">
        <span style="color:${severityColors[d.severity]};font-weight:bold">${d.severity}/5</span>
      </td>
      <td>${d.notes ?? '–'}</td>
    </tr>`;
}

function scoreGauge(label: string, value: number): string {
  const color = value >= 80 ? '#27ae60' : value >= 60 ? '#f39c12' : '#e74c3c';
  return `
    <div style="margin:8px 0">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px">${label}</span>
        <span style="font-weight:bold;color:${color}">${value}</span>
      </div>
      <div style="background:#ddd;border-radius:4px;height:8px">
        <div style="background:${color};width:${value}%;height:100%;border-radius:4px"></div>
      </div>
    </div>`;
}

export function generateHTMLReport(report: ExpertizReport): string {
  const {vehicle, obd2Session, damageAreas, paintMeasurements, score} = report;

  const dtcRows = (obd2Session?.dtcCodes ?? [])
    .map(
      dtc => `
    <tr>
      <td><code>${dtc.code}</code></td>
      <td>${dtc.description}</td>
      <td>${severityBadge(dtc.severity)}</td>
      <td>${dtc.isPending ? '⏳ Bekleyen' : dtc.isPermanent ? '🔴 Kalıcı' : '🟡 Aktif'}</td>
    </tr>`,
    )
    .join('');

  const paintRows = paintMeasurements.map(paintRow).join('');
  const damageRows = damageAreas.map(damageRow).join('');

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ekspertiz Raporu – ${vehicle.plate}</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#222; background:#fff; padding:20px; }
  .header { background:#1a1a1a; color:#FFD700; padding:20px; border-radius:8px; margin-bottom:20px; }
  .header h1 { font-size:22px; }
  .header p { font-size:13px; color:#ccc; margin-top:4px; }
  .badge { background:#FFD700; color:#1a1a1a; padding:4px 12px; border-radius:20px;
           font-weight:bold; font-size:18px; display:inline-block; margin-top:8px; }
  section { margin-bottom:24px; }
  h2 { font-size:16px; font-weight:bold; color:#1a1a1a; border-bottom:2px solid #FFD700;
       padding-bottom:6px; margin-bottom:12px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .info-item { background:#f9f9f9; padding:8px 12px; border-radius:6px; }
  .info-label { font-size:11px; color:#888; }
  .info-value { font-size:14px; font-weight:600; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { background:#1a1a1a; color:#FFD700; padding:8px; text-align:left; }
  td { padding:8px; border-bottom:1px solid #eee; }
  tr:nth-child(even) td { background:#f9f9f9; }
  .score-card { background:#f0f0f0; padding:16px; border-radius:8px; }
  .overall-score { text-align:center; padding:16px; background:#1a1a1a; border-radius:8px;
                   color:#FFD700; margin-bottom:16px; }
  .overall-score .number { font-size:48px; font-weight:900; }
  .overall-score .label { font-size:13px; color:#ccc; }
  .footer { text-align:center; font-size:11px; color:#aaa; margin-top:24px; border-top:1px solid #eee; padding-top:12px; }
  code { background:#f0f0f0; padding:2px 6px; border-radius:3px; font-family:monospace; font-size:12px; }
  .no-data { color:#aaa; font-style:italic; padding:16px; text-align:center; }
</style>
</head>
<body>

<div class="header">
  <h1>🔧 AUTO KING OTO EKSPERTİZ</h1>
  <p>Ekspertiz Raporu – ${formatDate(report.createdAt)}</p>
  <p>Uzman: ${report.expertName} | ${report.expertCompany}</p>
  <div class="badge">${formatPlate(vehicle.plate)}</div>
</div>

<!-- Genel Puan -->
<section>
  <h2>📊 Genel Değerlendirme</h2>
  <div class="score-card">
    <div class="overall-score">
      <div class="number">${score.overall}</div>
      <div class="label">${scoreLabel(score.overall)}</div>
    </div>
    ${scoreGauge('Motor Sistemi', score.engine)}
    ${scoreGauge('Kaporta / Boya', score.bodywork)}
    ${scoreGauge('İç Mekan', score.interior)}
    ${scoreGauge('Elektrik Sistemi', score.electrical)}
    ${scoreGauge('Güvenlik Sistemleri', score.safety)}
  </div>
</section>

<!-- Araç Bilgileri -->
<section>
  <h2>🚗 Araç Bilgileri</h2>
  <div class="grid2">
    <div class="info-item"><div class="info-label">Plaka</div><div class="info-value">${formatPlate(vehicle.plate)}</div></div>
    <div class="info-item"><div class="info-label">Marka / Model</div><div class="info-value">${vehicle.brand} ${vehicle.model}</div></div>
    <div class="info-item"><div class="info-label">Yıl</div><div class="info-value">${vehicle.year}</div></div>
    <div class="info-item"><div class="info-label">Km</div><div class="info-value">${vehicle.km.toLocaleString('tr-TR')} km</div></div>
    <div class="info-item"><div class="info-label">Yakıt</div><div class="info-value">${vehicle.fuelType.toUpperCase()}</div></div>
    <div class="info-item"><div class="info-label">Motor Hacmi</div><div class="info-value">${vehicle.engineCC} cc</div></div>
    <div class="info-item"><div class="info-label">Renk</div><div class="info-value">${vehicle.color}</div></div>
    <div class="info-item"><div class="info-label">Şasi No</div><div class="info-value" style="font-size:12px">${vehicle.chassisNo || '–'}</div></div>
    <div class="info-item"><div class="info-label">Sahibi</div><div class="info-value">${vehicle.ownerName || '–'}</div></div>
    <div class="info-item"><div class="info-label">Telefon</div><div class="info-value">${vehicle.ownerPhone || '–'}</div></div>
  </div>
</section>

<!-- OBD2 Arıza Kodları -->
<section>
  <h2>🔌 OBD2 Arıza Kodları</h2>
  ${obd2Session ? `
    <p style="font-size:12px;color:#888;margin-bottom:8px">
      Cihaz: ${obd2Session.deviceName} | Bağlantı: ${formatDate(obd2Session.connectedAt)}
    </p>
    ${dtcRows ? `
      <table>
        <thead><tr><th>Kod</th><th>Açıklama</th><th>Önem</th><th>Durum</th></tr></thead>
        <tbody>${dtcRows}</tbody>
      </table>` : '<div class="no-data">✅ Arıza kodu bulunamadı</div>'}
  ` : '<div class="no-data">OBD2 bağlantısı yapılmadı</div>'}
</section>

<!-- Boya Ölçümleri -->
<section>
  <h2>🎨 Boya Kalınlık Ölçümleri</h2>
  ${paintMeasurements.length > 0 ? `
    <table>
      <thead><tr><th>Panel</th><th>Ölçüm</th><th>Referans</th><th>Durum</th><th>Notlar</th></tr></thead>
      <tbody>${paintRows}</tbody>
    </table>` : '<div class="no-data">Boya ölçümü yapılmadı</div>'}
</section>

<!-- Hasar Tespiti -->
<section>
  <h2>💥 Hasar Tespiti</h2>
  ${damageAreas.length > 0 ? `
    <table>
      <thead><tr><th>Panel</th><th>Hasar Tipi</th><th>Şiddet</th><th>Notlar</th></tr></thead>
      <tbody>${damageRows}</tbody>
    </table>` : '<div class="no-data">✅ Hasar tespit edilmedi</div>'}
</section>

<!-- Notlar -->
${report.notes ? `
<section>
  <h2>📝 Ekspert Notları</h2>
  <p style="background:#f9f9f9;padding:12px;border-radius:6px;font-size:13px">${report.notes}</p>
</section>` : ''}

<div class="footer">
  <p>Auto King OTO EKSPERTİZ | Rapor No: ${report.id}</p>
  <p>Bu rapor dijital ortamda oluşturulmuştur. ${formatDate(report.createdAt)}</p>
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
  const {vehicle, score, obd2Session, damageAreas} = report;
  const dtcCount = obd2Session?.dtcCodes?.length ?? 0;

  const text = [
    '🔧 AUTO KING OTO EKSPERTİZ RAPORU',
    '═══════════════════════════════',
    `📅 Tarih: ${formatDate(report.createdAt)}`,
    `🚗 Araç: ${vehicle.brand} ${vehicle.model} (${vehicle.year})`,
    `🪪  Plaka: ${formatPlate(vehicle.plate)}`,
    `📍 Km: ${vehicle.km.toLocaleString('tr-TR')} km`,
    '',
    '📊 PUAN TABLOSU',
    `   Genel:    ${score.overall}/100 – ${scoreLabel(score.overall)}`,
    `   Motor:    ${score.engine}/100`,
    `   Kaporta:  ${score.bodywork}/100`,
    `   İç Mekan: ${score.interior}/100`,
    `   Elektrik: ${score.electrical}/100`,
    `   Güvenlik: ${score.safety}/100`,
    '',
    `🔌 OBD2: ${dtcCount} arıza kodu`,
    `💥 Hasar: ${damageAreas.length} bölge`,
    '',
    `Rapor No: ${report.id}`,
  ].join('\n');

  await Share.open({
    title: `Ekspertiz Raporu – ${vehicle.plate}`,
    message: text,
  });
}
