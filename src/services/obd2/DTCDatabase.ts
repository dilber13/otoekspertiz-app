import {DTCCode} from '../../types';

interface DTCEntry {
  description: string;
  severity: DTCCode['severity'];
  system: DTCCode['system'];
}

// Türkçe DTC veritabanı – P (Powertrain), C (Chassis), B (Body), U (Network)
const DTC_MAP: Record<string, DTCEntry> = {
  // ── Motor / Powertrain ──────────────────────────────────────────────────────
  P0100: {description: 'Hava Kütlesi Akış Devresi Arızası', severity: 'medium', system: 'engine'},
  P0101: {description: 'Hava Kütlesi Akış Aralık/Performans Sorunu', severity: 'medium', system: 'engine'},
  P0102: {description: 'Hava Kütlesi Akış Devresi Düşük Giriş', severity: 'medium', system: 'engine'},
  P0103: {description: 'Hava Kütlesi Akış Devresi Yüksek Giriş', severity: 'medium', system: 'engine'},
  P0110: {description: 'Emme Havası Sıcaklık Devresi Arızası', severity: 'low', system: 'engine'},
  P0115: {description: 'Motor Soğutma Suyu Sıcaklık Devresi Arızası', severity: 'high', system: 'engine'},
  P0116: {description: 'Motor Soğutma Suyu Sıcaklık Aralık/Performans', severity: 'medium', system: 'engine'},
  P0117: {description: 'Motor Soğutma Suyu Sıcaklığı Düşük', severity: 'medium', system: 'engine'},
  P0118: {description: 'Motor Soğutma Suyu Sıcaklığı Yüksek', severity: 'high', system: 'engine'},
  P0120: {description: 'Gaz Kelebeği/Pedal Konum Devresi A Arızası', severity: 'high', system: 'engine'},
  P0121: {description: 'Gaz Kelebeği Konum Sensörü Aralık/Performans', severity: 'high', system: 'engine'},
  P0130: {description: 'O2 Sensörü Devresi Banka 1, Sensör 1', severity: 'medium', system: 'engine'},
  P0131: {description: 'O2 Sensörü Düşük Voltaj Banka 1, Sensör 1', severity: 'medium', system: 'engine'},
  P0132: {description: 'O2 Sensörü Yüksek Voltaj Banka 1, Sensör 1', severity: 'medium', system: 'engine'},
  P0133: {description: 'O2 Sensörü Yavaş Tepki Banka 1, Sensör 1', severity: 'low', system: 'engine'},
  P0171: {description: 'Yakıt Sistemi Fazla Zayıf Banka 1', severity: 'medium', system: 'engine'},
  P0172: {description: 'Yakıt Sistemi Fazla Zengin Banka 1', severity: 'medium', system: 'engine'},
  P0174: {description: 'Yakıt Sistemi Fazla Zayıf Banka 2', severity: 'medium', system: 'engine'},
  P0175: {description: 'Yakıt Sistemi Fazla Zengin Banka 2', severity: 'medium', system: 'engine'},
  P0200: {description: 'Enjektör Devre Arızası', severity: 'high', system: 'engine'},
  P0201: {description: 'Silindir 1 Enjektör Devre Açık', severity: 'high', system: 'engine'},
  P0202: {description: 'Silindir 2 Enjektör Devre Açık', severity: 'high', system: 'engine'},
  P0203: {description: 'Silindir 3 Enjektör Devre Açık', severity: 'high', system: 'engine'},
  P0204: {description: 'Silindir 4 Enjektör Devre Açık', severity: 'high', system: 'engine'},
  P0300: {description: 'Rastgele / Çoklu Silindir Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0301: {description: 'Silindir 1 Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0302: {description: 'Silindir 2 Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0303: {description: 'Silindir 3 Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0304: {description: 'Silindir 4 Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0305: {description: 'Silindir 5 Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0306: {description: 'Silindir 6 Ateşleme Arızası', severity: 'critical', system: 'engine'},
  P0325: {description: 'Vuruntu Sensörü 1 Devre Arızası Banka 1', severity: 'medium', system: 'engine'},
  P0335: {description: 'Krank Mili Konum Sensörü A Devresi Arızası', severity: 'critical', system: 'engine'},
  P0340: {description: 'Eksantrik Mili Konum Sensörü A Devre Arızası', severity: 'critical', system: 'engine'},
  P0400: {description: 'EGR Akış Arızası', severity: 'medium', system: 'engine'},
  P0420: {description: 'Katalitik Konvertör Sistem Verimi Düşük Banka 1', severity: 'medium', system: 'engine'},
  P0430: {description: 'Katalitik Konvertör Sistem Verimi Düşük Banka 2', severity: 'medium', system: 'engine'},
  P0440: {description: 'EVAP Emisyon Kontrol Sistemi Arızası', severity: 'low', system: 'engine'},
  P0442: {description: 'EVAP Sistemi Küçük Kaçak Tespit Edildi', severity: 'low', system: 'engine'},
  P0455: {description: 'EVAP Sistemi Büyük Kaçak Tespit Edildi', severity: 'medium', system: 'engine'},
  P0480: {description: 'Soğutma Fanı Röle 1 Kontrol Devre Arızası', severity: 'high', system: 'engine'},
  P0500: {description: 'Araç Hız Sensörü Arızası', severity: 'medium', system: 'engine'},
  P0505: {description: 'Rölanti Kontrol Sistemi Arızası', severity: 'medium', system: 'engine'},
  P0560: {description: 'Sistem Voltajı Arızası', severity: 'high', system: 'engine'},
  P0600: {description: 'Seri İletişim Bağlantısı Arızası', severity: 'high', system: 'network'},
  P0606: {description: 'PCM/ECM/ECU İşlemci Arızası', severity: 'critical', system: 'engine'},
  P0700: {description: 'Şanzıman Kontrol Sistemi (MIL İsteği)', severity: 'high', system: 'transmission'},

  // ── Şanzıman ────────────────────────────────────────────────────────────────
  P0715: {description: 'Giriş/Türbin Hız Sensörü A Devre Arızası', severity: 'high', system: 'transmission'},
  P0720: {description: 'Çıkış Hız Sensörü Devre Arızası', severity: 'high', system: 'transmission'},
  P0730: {description: 'Yanlış Vites Oranı', severity: 'high', system: 'transmission'},
  P0740: {description: 'Tork Konvertörü Kilitleme Devresi Arızası', severity: 'medium', system: 'transmission'},
  P0750: {description: 'Vites Solenoid A Arızası', severity: 'high', system: 'transmission'},
  P0755: {description: 'Vites Solenoid B Arızası', severity: 'high', system: 'transmission'},

  // ── ABS / Fren ──────────────────────────────────────────────────────────────
  C0031: {description: 'Sol Ön Tekerlek Hız Sensörü Arızası', severity: 'critical', system: 'abs'},
  C0034: {description: 'Sağ Ön Tekerlek Hız Sensörü Arızası', severity: 'critical', system: 'abs'},
  C0037: {description: 'Sol Arka Tekerlek Hız Sensörü Arızası', severity: 'critical', system: 'abs'},
  C0040: {description: 'Sağ Arka Tekerlek Hız Sensörü Arızası', severity: 'critical', system: 'abs'},
  C0110: {description: 'ABS Motor Devresi Arızası', severity: 'critical', system: 'abs'},
  C0121: {description: 'ABS Valf Röle Devresi Arızası', severity: 'critical', system: 'abs'},
  C0186: {description: 'Lateral İvme Sensörü Devresi Aralık/Performans', severity: 'high', system: 'abs'},
  C0196: {description: 'Yaw Rate Sensörü Devresi Arızası', severity: 'high', system: 'abs'},
  C0245: {description: 'Tekerlek Hız Sensörü Frekans Hatası', severity: 'critical', system: 'abs'},

  // ── Airbag / Güvenlik ────────────────────────────────────────────────────────
  B0001: {description: 'Sürücü Airbag Ateşleyici 1 Devre Arızası', severity: 'critical', system: 'airbag'},
  B0002: {description: 'Sürücü Airbag Ateşleyici 2 Devre Arızası', severity: 'critical', system: 'airbag'},
  B0010: {description: 'Yolcu Airbag Ateşleyici 1 Devre Arızası', severity: 'critical', system: 'airbag'},
  B0020: {description: 'Sol Ön Yan Airbag Devre Arızası', severity: 'critical', system: 'airbag'},
  B0021: {description: 'Sağ Ön Yan Airbag Devre Arızası', severity: 'critical', system: 'airbag'},
  B0051: {description: 'Koltuk Sabitleme Mekanizması Arızası', severity: 'high', system: 'airbag'},
  B0081: {description: 'Sürücü Kemer Gerici Devre Arızası', severity: 'critical', system: 'airbag'},
  B0082: {description: 'Yolcu Kemer Gerici Devre Arızası', severity: 'critical', system: 'airbag'},
  B1001: {description: 'ECU Malzeme Arızası', severity: 'critical', system: 'body'},
  B1004: {description: 'Ateşleme Anahtarı Devresi Düşük Voltaj', severity: 'high', system: 'body'},

  // ── Ağ / Haberleşme ──────────────────────────────────────────────────────────
  U0001: {description: 'Yüksek Hızlı CAN İletişim Veri Yolu Arızası', severity: 'critical', system: 'network'},
  U0100: {description: 'ECM/PCM ile İletişim Kayboldu', severity: 'critical', system: 'network'},
  U0101: {description: 'TCM ile İletişim Kayboldu', severity: 'high', system: 'network'},
  U0121: {description: 'ABS Kontrol Modülü ile İletişim Kayboldu', severity: 'critical', system: 'network'},
  U0140: {description: 'BCM ile İletişim Kayboldu', severity: 'high', system: 'network'},
  U0155: {description: 'Instrument Panel Cluster ile İletişim Kayboldu', severity: 'medium', system: 'network'},
};

export function lookupDTC(rawCode: string): DTCCode {
  const code = rawCode.toUpperCase().trim();
  const entry = DTC_MAP[code];

  if (entry) {
    return {
      code,
      description: entry.description,
      severity: entry.severity,
      system: entry.system,
      category: code[0] as 'P' | 'C' | 'B' | 'U',
      isPending: false,
      isPermanent: false,
    };
  }

  // Bilinmeyen kod — genel açıklama üret
  const category = code[0] as 'P' | 'C' | 'B' | 'U';
  const categoryMap: Record<string, string> = {
    P: 'Güç aktarma sistemi',
    C: 'Şasi sistemi',
    B: 'Kaporta sistemi',
    U: 'Ağ iletişim sistemi',
  };

  return {
    code,
    description: `${categoryMap[category] ?? 'Bilinmeyen sistem'} arızası`,
    severity: 'medium',
    system: category === 'P' ? 'engine'
      : category === 'C' ? 'chassis'
      : category === 'B' ? 'body'
      : 'network',
    category,
    isPending: false,
    isPermanent: false,
  };
}

export function getAllKnownCodes(): string[] {
  return Object.keys(DTC_MAP);
}

export function getDTCsBySeverity(severity: DTCCode['severity']): string[] {
  return Object.entries(DTC_MAP)
    .filter(([, entry]) => entry.severity === severity)
    .map(([code]) => code);
}
