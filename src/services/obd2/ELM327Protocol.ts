// ELM327 AT komut seti ve OBD-II PID çözümleyicisi

export const AT_COMMANDS = {
  RESET: 'ATZ',
  ECHO_OFF: 'ATE0',
  LINEFEED_OFF: 'ATL0',
  SPACES_OFF: 'ATS0',
  PROTOCOL_AUTO: 'ATSP0',
  HEADER_OFF: 'ATH0',
  DEVICE_INFO: 'ATI',
  VOLTAGE: 'ATRV',
  READ_DTC: '03',            // SAE J1979 Mode 03 – stored DTCs
  CLEAR_DTC: '04',           // Mode 04 – clear DTCs
  PENDING_DTC: '07',         // Mode 07 – pending DTCs
  PERM_DTC: '0A',            // Mode 0A – permanent DTCs
} as const;

// Mode 01 PIDs
export const PID = {
  ENGINE_RPM: '010C',
  VEHICLE_SPEED: '010D',
  COOLANT_TEMP: '0105',
  INTAKE_TEMP: '010F',
  THROTTLE_POS: '0111',
  FUEL_LEVEL: '012F',
  ENGINE_LOAD: '0104',
  MAF_RATE: '0110',
  O2_SENSOR: '0114',
  FUEL_PRESSURE: '010A',
  RUNTIME: '011F',
  DISTANCE_MIL: '0121',
} as const;

// ── Çözümleyiciler ────────────────────────────────────────────────────────────

/**
 * ELM327 yanıtından ham hex baytlarını çıkar.
 * "41 0C 1A F8\r\n>" → ["1A", "F8"]
 */
export function parseResponse(raw: string, pid: string): string[] {
  const cleaned = raw
    .replace(/[\r\n>]/g, ' ')
    .replace(/SEARCHING/gi, '')
    .trim();

  // "NODATA", "ERROR", "?" yanıtları
  if (/NO\s*DATA|ERROR|\?|UNABLE/i.test(cleaned)) {
    return [];
  }

  const modeResp = pid.substring(0, 2);
  const pidByte = pid.substring(2, 4);
  const expected = `4${parseInt(modeResp, 16) - 0x00} ${pidByte}`.toUpperCase();

  const parts = cleaned.toUpperCase().split(/\s+/);
  const idx = parts.findIndex(
    (_, i) =>
      parts[i] === `4${parseInt(modeResp, 16)}` &&
      parts[i + 1] === pidByte.toUpperCase(),
  );

  if (idx !== -1) {
    return parts.slice(idx + 2).filter(b => /^[0-9A-F]{2}$/.test(b));
  }

  // Başlık yoksa ham baytları dön
  return parts.filter(b => /^[0-9A-F]{2}$/.test(b));
}

export function decodeRPM(bytes: string[]): number | null {
  if (bytes.length < 2) return null;
  const a = parseInt(bytes[0], 16);
  const b = parseInt(bytes[1], 16);
  return Math.round((256 * a + b) / 4);
}

export function decodeSpeed(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return parseInt(bytes[0], 16); // km/h
}

export function decodeCoolantTemp(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return parseInt(bytes[0], 16) - 40; // °C
}

export function decodeIntakeTemp(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return parseInt(bytes[0], 16) - 40; // °C
}

export function decodeThrottlePos(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return Math.round((parseInt(bytes[0], 16) * 100) / 255); // %
}

export function decodeFuelLevel(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return Math.round((parseInt(bytes[0], 16) * 100) / 255); // %
}

export function decodeMAFRate(bytes: string[]): number | null {
  if (bytes.length < 2) return null;
  const a = parseInt(bytes[0], 16);
  const b = parseInt(bytes[1], 16);
  return Math.round((256 * a + b) / 100 * 10) / 10; // g/s
}

export function decodeO2Sensor(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return Math.round(parseInt(bytes[0], 16) * 0.005 * 1000) / 1000; // V
}

export function decodeFuelPressure(bytes: string[]): number | null {
  if (bytes.length < 1) return null;
  return parseInt(bytes[0], 16) * 3; // kPa
}

export function decodeBatteryVoltage(raw: string): number | null {
  const match = raw.match(/(\d+\.\d+)V/i);
  if (match) return parseFloat(match[1]);
  return null;
}

// ── DTC Çözümleyici ──────────────────────────────────────────────────────────

/**
 * Mode 03 yanıtını DTC kodlarına dönüştür.
 * "43 01 33 00 00 00 00" → ["P0133"]
 */
export function parseDTCResponse(raw: string): string[] {
  const cleaned = raw
    .replace(/[\r\n>]/g, ' ')
    .replace(/SEARCHING/gi, '')
    .trim()
    .toUpperCase();

  if (/NO\s*DATA|ERROR|\?/i.test(cleaned)) return [];

  const parts = cleaned.split(/\s+/).filter(b => /^[0-9A-F]{2}$/.test(b));

  // "43" yanıt baytını atla
  const start = parts[0] === '43' ? 1 : 0;
  const dtcs: string[] = [];

  for (let i = start; i + 1 < parts.length; i += 2) {
    const byte1 = parseInt(parts[i], 16);
    const byte2 = parseInt(parts[i + 1], 16);

    if (byte1 === 0 && byte2 === 0) continue;

    const typeNibble = (byte1 >> 6) & 0x03;
    const prefix = ['P', 'C', 'B', 'U'][typeNibble];
    const digit2 = (byte1 >> 4) & 0x03;
    const digit3 = byte1 & 0x0f;
    const digit4 = (byte2 >> 4) & 0x0f;
    const digit5 = byte2 & 0x0f;

    const code = `${prefix}${digit2}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}${digit5.toString(16).toUpperCase()}`;
    dtcs.push(code);
  }

  return [...new Set(dtcs)];
}

// ── ELM327 cevap bekleme süresi ──────────────────────────────────────────────
export const RESPONSE_TIMEOUT_MS = 5000;
export const INIT_TIMEOUT_MS = 10000;
