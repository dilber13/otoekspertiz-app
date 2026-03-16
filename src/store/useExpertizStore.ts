import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Vehicle, OBD2Session, DamageArea, PaintMeasurement,
  ExpertizReport, ExpertizScore, OBD2ConnectionStatus,
  OBD2LiveData, DTCCode, BLEDevice,
  MotorMekanikTest, FrenSuspansiyonTest, YanalKaymaTest,
  GuvenlikTest, GorselKontrolTest,
} from '../types';
import {calculateScore} from '../utils/helpers';

const STORAGE_KEY = '@autoking_reports';

interface ExpertizState {
  currentVehicle: Vehicle | null;
  currentReportId: string | null;
  reports: ExpertizReport[];

  // OBD2
  obd2Status: OBD2ConnectionStatus;
  connectedDevice: BLEDevice | null;
  scannedDevices: BLEDevice[];
  dtcCodes: DTCCode[];
  liveData: OBD2LiveData;

  // Kaporta & Boya
  damageAreas: DamageArea[];
  paintMeasurements: PaintMeasurement[];
  photos: string[];

  // Yeni testler
  motorTest: MotorMekanikTest | null;
  frenSuspansiyonTest: FrenSuspansiyonTest | null;
  yanalKaymaTest: YanalKaymaTest | null;
  guvenlikTest: GuvenlikTest | null;
  gorselTest: GorselKontrolTest | null;

  isLoading: boolean;
  error: string | null;

  // Actions — Araç
  setCurrentVehicle: (v: Vehicle) => void;
  clearCurrentVehicle: () => void;

  // Actions — OBD2
  setOBD2Status: (s: OBD2ConnectionStatus) => void;
  setConnectedDevice: (d: BLEDevice | null) => void;
  setScannedDevices: (d: BLEDevice[]) => void;
  addDTCCode: (c: DTCCode) => void;
  setDTCCodes: (c: DTCCode[]) => void;
  clearDTCCodes: () => void;
  updateLiveData: (d: Partial<OBD2LiveData>) => void;

  // Actions — Kaporta
  addDamageArea: (a: DamageArea) => void;
  removeDamageArea: (id: string) => void;
  updateDamageArea: (id: string, u: Partial<DamageArea>) => void;
  addPaintMeasurement: (m: PaintMeasurement) => void;
  updatePaintMeasurement: (panel: string, u: Partial<PaintMeasurement>) => void;
  addPhoto: (uri: string) => void;
  removePhoto: (uri: string) => void;

  // Actions — Testler
  saveMotorTest: (t: MotorMekanikTest) => void;
  saveFrenSuspansiyonTest: (t: FrenSuspansiyonTest) => void;
  saveYanalKaymaTest: (t: YanalKaymaTest) => void;
  saveGuvenlikTest: (t: GuvenlikTest) => void;
  saveGorselTest: (t: GorselKontrolTest) => void;

  // Actions — Rapor
  saveReport: () => Promise<ExpertizReport>;
  loadReports: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  resetSession: () => void;

  setError: (e: string | null) => void;
  setLoading: (l: boolean) => void;
}

const defaultLiveData: OBD2LiveData = {
  rpm: null, speed: null, engineTemp: null, throttlePos: null,
  fuelLevel: null, batteryVoltage: null, intakeTemp: null,
  mafRate: null, oxygenSensor: null, fuelPressure: null,
};

export const useExpertizStore = create<ExpertizState>((set, get) => ({
  currentVehicle: null,
  currentReportId: null,
  reports: [],
  obd2Status: 'idle',
  connectedDevice: null,
  scannedDevices: [],
  dtcCodes: [],
  liveData: defaultLiveData,
  damageAreas: [],
  paintMeasurements: [],
  photos: [],
  motorTest: null,
  frenSuspansiyonTest: null,
  yanalKaymaTest: null,
  guvenlikTest: null,
  gorselTest: null,
  isLoading: false,
  error: null,

  setCurrentVehicle: v => set({currentVehicle: v}),
  clearCurrentVehicle: () => set({currentVehicle: null}),

  setOBD2Status: s => set({obd2Status: s}),
  setConnectedDevice: d => set({connectedDevice: d}),
  setScannedDevices: d => set({scannedDevices: d}),
  addDTCCode: code =>
    set(s => ({dtcCodes: s.dtcCodes.find(d => d.code === code.code) ? s.dtcCodes : [...s.dtcCodes, code]})),
  setDTCCodes: c => set({dtcCodes: c}),
  clearDTCCodes: () => set({dtcCodes: []}),
  updateLiveData: d => set(s => ({liveData: {...s.liveData, ...d}})),

  addDamageArea: a => set(s => ({damageAreas: [...s.damageAreas, a]})),
  removeDamageArea: id => set(s => ({damageAreas: s.damageAreas.filter(a => a.id !== id)})),
  updateDamageArea: (id, u) =>
    set(s => ({damageAreas: s.damageAreas.map(a => a.id === id ? {...a, ...u} : a)})),
  addPaintMeasurement: m => set(s => ({paintMeasurements: [...s.paintMeasurements, m]})),
  updatePaintMeasurement: (panel, u) =>
    set(s => ({paintMeasurements: s.paintMeasurements.map(p => p.panel === panel ? {...p, ...u} : p)})),
  addPhoto: uri => set(s => ({photos: [...s.photos, uri]})),
  removePhoto: uri => set(s => ({photos: s.photos.filter(p => p !== uri)})),

  saveMotorTest: t => set({motorTest: t}),
  saveFrenSuspansiyonTest: t => set({frenSuspansiyonTest: t}),
  saveYanalKaymaTest: t => set({yanalKaymaTest: t}),
  saveGuvenlikTest: t => set({guvenlikTest: t}),
  saveGorselTest: t => set({gorselTest: t}),

  saveReport: async () => {
    const s = get();
    if (!s.currentVehicle) throw new Error('Araç bilgisi girilmemiş');

    const obd2Session: OBD2Session | undefined = s.connectedDevice
      ? {
          deviceName: s.connectedDevice.name ?? 'ELM327',
          deviceId: s.connectedDevice.id,
          connectedAt: new Date().toISOString(),
          dtcCodes: s.dtcCodes,
          liveData: s.liveData,
          status: s.obd2Status,
        }
      : undefined;

    const score = calculateScore({
      dtcCodes: s.dtcCodes,
      damageAreas: s.damageAreas,
      paintMeasurements: s.paintMeasurements,
      motorTest: s.motorTest,
      frenSuspansiyonTest: s.frenSuspansiyonTest,
      yanalKaymaTest: s.yanalKaymaTest,
      guvenlikTest: s.guvenlikTest,
      gorselTest: s.gorselTest,
    });

    const report: ExpertizReport = {
      id: s.currentReportId ?? `RPT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expertName: 'Auto King Ekspert',
      expertCompany: 'Auto King OTO EKSPERTİZ',
      vehicle: s.currentVehicle,
      obd2Session,
      motorTest: s.motorTest ?? undefined,
      frenSuspansiyonTest: s.frenSuspansiyonTest ?? undefined,
      yanalKaymaTest: s.yanalKaymaTest ?? undefined,
      guvenlikTest: s.guvenlikTest ?? undefined,
      gorselTest: s.gorselTest ?? undefined,
      damageAreas: s.damageAreas,
      paintMeasurements: s.paintMeasurements,
      score,
      notes: '',
      photos: s.photos,
    };

    const updated = s.reports.find(r => r.id === report.id)
      ? s.reports.map(r => (r.id === report.id ? report : r))
      : [report, ...s.reports];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({reports: updated, currentReportId: report.id});
    return report;
  },

  loadReports: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) set({reports: JSON.parse(raw)});
    } catch (e) {
      console.warn('Raporlar yüklenemedi:', e);
    }
  },

  deleteReport: async id => {
    const updated = get().reports.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({reports: updated});
  },

  resetSession: () =>
    set({
      currentVehicle: null, currentReportId: null,
      obd2Status: 'idle', connectedDevice: null, scannedDevices: [],
      dtcCodes: [], liveData: defaultLiveData,
      damageAreas: [], paintMeasurements: [], photos: [],
      motorTest: null, frenSuspansiyonTest: null, yanalKaymaTest: null,
      guvenlikTest: null, gorselTest: null, error: null,
    }),

  setError: e => set({error: e}),
  setLoading: l => set({isLoading: l}),
}));
