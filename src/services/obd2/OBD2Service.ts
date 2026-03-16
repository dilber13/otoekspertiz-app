import {BleManager, Device, Characteristic, BleError} from 'react-native-ble-plx';
import {Platform} from 'react-native';
import {
  AT_COMMANDS,
  PID,
  parseResponse,
  parseDTCResponse,
  decodeRPM,
  decodeSpeed,
  decodeCoolantTemp,
  decodeIntakeTemp,
  decodeThrottlePos,
  decodeFuelLevel,
  decodeMAFRate,
  decodeO2Sensor,
  decodeFuelPressure,
  decodeBatteryVoltage,
  RESPONSE_TIMEOUT_MS,
  INIT_TIMEOUT_MS,
} from './ELM327Protocol';
import {lookupDTC} from './DTCDatabase';
import {DTCCode, OBD2LiveData, BLEDevice} from '../../types';

// ELM327 BLE servis ve karakteristik UUID'leri (yaygın ELM327 dongle'ları)
const OBD_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_WRITE_UUID   = '0000fff2-0000-1000-8000-00805f9b34fb';
const OBD_NOTIFY_UUID  = '0000fff1-0000-1000-8000-00805f9b34fb';

// Alternatif UUID seti (bazı klonlar)
const ALT_SERVICE_UUID  = '00001101-0000-1000-8000-00805f9b34fb';
const ALT_WRITE_UUID    = '00001101-0000-1000-8000-00805f9b34fb';
const ALT_NOTIFY_UUID   = '00001101-0000-1000-8000-00805f9b34fb';

type ResponseCallback = (data: string) => void;

class OBD2Service {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private responseBuffer: string = '';
  private responseCallback: ResponseCallback | null = null;
  private writeCharUUID: string = OBD_WRITE_UUID;
  private notifyCharUUID: string = OBD_NOTIFY_UUID;
  private serviceUUID: string = OBD_SERVICE_UUID;

  constructor() {
    this.manager = new BleManager();
  }

  // ── Tarama ────────────────────────────────────────────────────────────────
  scanDevices(
    onDevice: (device: BLEDevice) => void,
    onError: (error: string) => void,
    timeoutMs: number = 10000,
  ): () => void {
    const seen = new Set<string>();

    this.manager.startDeviceScan(null, {allowDuplicates: false}, (error, device) => {
      if (error) {
        onError(error.message);
        return;
      }
      if (!device) return;
      if (seen.has(device.id)) return;
      seen.add(device.id);

      // ELM327 cihazlarını filtrele
      const name = device.name ?? device.localName ?? '';
      if (
        name.toLowerCase().includes('elm') ||
        name.toLowerCase().includes('obd') ||
        name.toLowerCase().includes('vlink') ||
        name.toLowerCase().includes('obdii') ||
        name.toLowerCase().includes('carista') ||
        name.toLowerCase().includes('veepeak')
      ) {
        onDevice({id: device.id, name: name || null, rssi: device.rssi});
      }
    });

    const timer = setTimeout(() => {
      this.manager.stopDeviceScan();
    }, timeoutMs);

    return () => {
      clearTimeout(timer);
      this.manager.stopDeviceScan();
    };
  }

  stopScan(): void {
    this.manager.stopDeviceScan();
  }

  // ── Bağlantı ──────────────────────────────────────────────────────────────
  async connect(deviceId: string): Promise<void> {
    const device = await this.manager.connectToDevice(deviceId, {
      requestMTU: 512,
      timeout: 15000,
    });

    await device.discoverAllServicesAndCharacteristics();
    this.connectedDevice = device;

    // Servis/karakteristik UUID'lerini belirle
    const services = await device.services();
    for (const service of services) {
      if (
        service.uuid.toLowerCase().startsWith('0000fff0') ||
        service.uuid.toLowerCase().startsWith('e7810a71')
      ) {
        this.serviceUUID = service.uuid;
        const chars = await service.characteristics();
        for (const char of chars) {
          if (char.isWritableWithResponse || char.isWritableWithoutResponse) {
            this.writeCharUUID = char.uuid;
          }
          if (char.isNotifiable || char.isIndicatable) {
            this.notifyCharUUID = char.uuid;
          }
        }
        break;
      }
    }

    // Bildirim aboneliği
    this.connectedDevice.monitorCharacteristicForService(
      this.serviceUUID,
      this.notifyCharUUID,
      (error: BleError | null, char: Characteristic | null) => {
        if (error || !char?.value) return;
        const decoded = Buffer.from(char.value, 'base64').toString('utf-8');
        this.responseBuffer += decoded;

        if (this.responseBuffer.includes('>') || this.responseBuffer.includes('\r')) {
          const cb = this.responseCallback;
          if (cb) {
            this.responseCallback = null;
            cb(this.responseBuffer);
            this.responseBuffer = '';
          }
        }
      },
    );

    await this.initELM327();
  }

  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      await this.connectedDevice.cancelConnection();
      this.connectedDevice = null;
    }
  }

  get isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  // ── ELM327 Init ──────────────────────────────────────────────────────────
  private async initELM327(): Promise<void> {
    await this.sendCommand(AT_COMMANDS.RESET, INIT_TIMEOUT_MS);
    await this.sleep(1500);
    await this.sendCommand(AT_COMMANDS.ECHO_OFF);
    await this.sendCommand(AT_COMMANDS.LINEFEED_OFF);
    await this.sendCommand(AT_COMMANDS.SPACES_OFF);
    await this.sendCommand(AT_COMMANDS.HEADER_OFF);
    await this.sendCommand(AT_COMMANDS.PROTOCOL_AUTO);
  }

  // ── Komut Gönderme ───────────────────────────────────────────────────────
  private sendCommand(command: string, timeout: number = RESPONSE_TIMEOUT_MS): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.connectedDevice) {
        reject(new Error('Cihaz bağlı değil'));
        return;
      }

      const timer = setTimeout(() => {
        this.responseCallback = null;
        reject(new Error(`Komut zaman aşımı: ${command}`));
      }, timeout);

      this.responseCallback = (data: string) => {
        clearTimeout(timer);
        resolve(data);
      };

      const cmdBytes = Buffer.from(command + '\r', 'utf-8').toString('base64');
      this.connectedDevice
        .writeCharacteristicWithResponseForService(
          this.serviceUUID,
          this.writeCharUUID,
          cmdBytes,
        )
        .catch((err: Error) => {
          clearTimeout(timer);
          this.responseCallback = null;
          reject(err);
        });
    });
  }

  // ── DTC Okuma ─────────────────────────────────────────────────────────────
  async readDTCCodes(): Promise<DTCCode[]> {
    const raw = await this.sendCommand(AT_COMMANDS.READ_DTC);
    const codes = parseDTCResponse(raw);
    return codes.map(code => lookupDTC(code));
  }

  async readPendingDTCCodes(): Promise<DTCCode[]> {
    const raw = await this.sendCommand(AT_COMMANDS.PENDING_DTC);
    const codes = parseDTCResponse(raw);
    return codes.map(code => ({...lookupDTC(code), isPending: true}));
  }

  async clearDTCCodes(): Promise<void> {
    await this.sendCommand(AT_COMMANDS.CLEAR_DTC);
  }

  // ── Canlı Veri ────────────────────────────────────────────────────────────
  async readLiveData(): Promise<Partial<OBD2LiveData>> {
    const data: Partial<OBD2LiveData> = {};

    try {
      const rpmRaw = await this.sendCommand(PID.ENGINE_RPM);
      const rpmBytes = parseResponse(rpmRaw, PID.ENGINE_RPM);
      data.rpm = decodeRPM(rpmBytes);
    } catch {}

    try {
      const speedRaw = await this.sendCommand(PID.VEHICLE_SPEED);
      const speedBytes = parseResponse(speedRaw, PID.VEHICLE_SPEED);
      data.speed = decodeSpeed(speedBytes);
    } catch {}

    try {
      const tempRaw = await this.sendCommand(PID.COOLANT_TEMP);
      const tempBytes = parseResponse(tempRaw, PID.COOLANT_TEMP);
      data.engineTemp = decodeCoolantTemp(tempBytes);
    } catch {}

    try {
      const intakeTempRaw = await this.sendCommand(PID.INTAKE_TEMP);
      const intakeTempBytes = parseResponse(intakeTempRaw, PID.INTAKE_TEMP);
      data.intakeTemp = decodeIntakeTemp(intakeTempBytes);
    } catch {}

    try {
      const throttleRaw = await this.sendCommand(PID.THROTTLE_POS);
      const throttleBytes = parseResponse(throttleRaw, PID.THROTTLE_POS);
      data.throttlePos = decodeThrottlePos(throttleBytes);
    } catch {}

    try {
      const fuelRaw = await this.sendCommand(PID.FUEL_LEVEL);
      const fuelBytes = parseResponse(fuelRaw, PID.FUEL_LEVEL);
      data.fuelLevel = decodeFuelLevel(fuelBytes);
    } catch {}

    try {
      const voltRaw = await this.sendCommand(AT_COMMANDS.VOLTAGE);
      data.batteryVoltage = decodeBatteryVoltage(voltRaw);
    } catch {}

    try {
      const mafRaw = await this.sendCommand(PID.MAF_RATE);
      const mafBytes = parseResponse(mafRaw, PID.MAF_RATE);
      data.mafRate = decodeMAFRate(mafBytes);
    } catch {}

    try {
      const o2Raw = await this.sendCommand(PID.O2_SENSOR);
      const o2Bytes = parseResponse(o2Raw, PID.O2_SENSOR);
      data.oxygenSensor = decodeO2Sensor(o2Bytes);
    } catch {}

    try {
      const fpRaw = await this.sendCommand(PID.FUEL_PRESSURE);
      const fpBytes = parseResponse(fpRaw, PID.FUEL_PRESSURE);
      data.fuelPressure = decodeFuelPressure(fpBytes);
    } catch {}

    return data;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy(): void {
    this.manager.destroy();
  }
}

export const obd2Service = new OBD2Service();
export default OBD2Service;
