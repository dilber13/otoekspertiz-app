import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Vehicle,
  OBD2Session,
  DamageArea,
  PaintMeasurement,
  ExpertizReport,
  ExpertizScore,
  OBD2ConnectionStatus,
  OBD2LiveData,
  DTCCode,
  BLEDevice,
} from '../types';
import {calculateScore} from '../utils/helpers';

const STORAGE_KEY = '@autoking_reports';

interface ExpertizState {
  // Aktif araç ve rapor
  currentVehicle: Vehicle | null;
  currentReportId: string | null;
  reports: ExpertizReport[];

  // OBD2
  obd2Status: OBD2ConnectionStatus;
  connectedDevice: BLEDevice | null;
  scannedDevices: BLEDevice[];
  dtcCodes: DTCCode[];
  liveData: OBD2LiveData;

  // Hasar tespiti
  damageAreas: DamageArea[];
  paintMeasurements: PaintMeasurement[];
  photos: string[];

  // Genel
  isLoading: boolean;
  error: string | null;

  // Actions — Araç
  setCurrentVehicle: (vehicle: Vehicle) => void;
  clearCurrentVehicle: () => void;

  // Actions — OBD2
  setOBD2Status: (status: OBD2ConnectionStatus) => void;
  setConnectedDevice: (device: BLEDevice | null) => void;
  setScannedDevices: (devices: BLEDevice[]) => void;
  addDTCCode: (code: DTCCode) => void;
  setDTCCodes: (codes: DTCCode[]) => void;
  clearDTCCodes: () => void;
  updateLiveData: (data: Partial<OBD2LiveData>) => void;

  // Actions — Hasar
  addDamageArea: (area: DamageArea) => void;
  removeDamageArea: (id: string) => void;
  updateDamageArea: (id: string, updates: Partial<DamageArea>) => void;
  addPaintMeasurement: (m: PaintMeasurement) => void;
  updatePaintMeasurement: (panel: string, updates: Partial<PaintMeasurement>) => void;
  addPhoto: (uri: string) => void;
  removePhoto: (uri: string) => void;

  // Actions — Rapor
  saveReport: () => Promise<ExpertizReport>;
  loadReports: () => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
  resetSession: () => void;

  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const defaultLiveData: OBD2LiveData = {
  rpm: null,
  speed: null,
  engineTemp: null,
  throttlePos: null,
  fuelLevel: null,
  batteryVoltage: null,
  intakeTemp: null,
  mafRate: null,
  oxygenSensor: null,
  fuelPressure: null,
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
  isLoading: false,
  error: null,

  // ── Araç ──
  setCurrentVehicle: vehicle => set({currentVehicle: vehicle}),
  clearCurrentVehicle: () => set({currentVehicle: null}),

  // ── OBD2 ──
  setOBD2Status: status => set({obd2Status: status}),
  setConnectedDevice: device => set({connectedDevice: device}),
  setScannedDevices: devices => set({scannedDevices: devices}),
  addDTCCode: code =>
    set(state => ({
      dtcCodes: state.dtcCodes.find(d => d.code === code.code)
        ? state.dtcCodes
        : [...state.dtcCodes, code],
    })),
  setDTCCodes: codes => set({dtcCodes: codes}),
  clearDTCCodes: () => set({dtcCodes: []}),
  updateLiveData: data =>
    set(state => ({liveData: {...state.liveData, ...data}})),

  // ── Hasar ──
  addDamageArea: area =>
    set(state => ({damageAreas: [...state.damageAreas, area]})),
  removeDamageArea: id =>
    set(state => ({damageAreas: state.damageAreas.filter(a => a.id !== id)})),
  updateDamageArea: (id, updates) =>
    set(state => ({
      damageAreas: state.damageAreas.map(a =>
        a.id === id ? {...a, ...updates} : a,
      ),
    })),
  addPaintMeasurement: m =>
    set(state => ({paintMeasurements: [...state.paintMeasurements, m]})),
  updatePaintMeasurement: (panel, updates) =>
    set(state => ({
      paintMeasurements: state.paintMeasurements.map(p =>
        p.panel === panel ? {...p, ...updates} : p,
      ),
    })),
  addPhoto: uri =>
    set(state => ({photos: [...state.photos, uri]})),
  removePhoto: uri =>
    set(state => ({photos: state.photos.filter(p => p !== uri)})),

  // ── Rapor ──
  saveReport: async () => {
    const state = get();
    if (!state.currentVehicle) {
      throw new Error('Araç bilgisi girilmemiş');
    }

    const obd2Session: OBD2Session | undefined = state.connectedDevice
      ? {
          deviceName: state.connectedDevice.name ?? 'ELM327',
          deviceId: state.connectedDevice.id,
          connectedAt: new Date().toISOString(),
          dtcCodes: state.dtcCodes,
          liveData: state.liveData,
          status: state.obd2Status,
        }
      : undefined;

    const score = calculateScore(
      state.dtcCodes,
      state.damageAreas,
      state.paintMeasurements,
    );

    const report: ExpertizReport = {
      id: state.currentReportId ?? `RPT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      expertName: 'Auto King Ekspert',
      expertCompany: 'Auto King OTO EKSPERTİZ',
      vehicle: state.currentVehicle,
      obd2Session,
      damageAreas: state.damageAreas,
      paintMeasurements: state.paintMeasurements,
      score,
      notes: '',
      photos: state.photos,
    };

    const updatedReports = state.reports.find(r => r.id === report.id)
      ? state.reports.map(r => (r.id === report.id ? report : r))
      : [report, ...state.reports];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReports));
    set({reports: updatedReports, currentReportId: report.id});
    return report;
  },

  loadReports: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        set({reports: JSON.parse(raw)});
      }
    } catch (e) {
      console.warn('Raporlar yüklenemedi:', e);
    }
  },

  deleteReport: async id => {
    const {reports} = get();
    const updated = reports.filter(r => r.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    set({reports: updated});
  },

  resetSession: () =>
    set({
      currentVehicle: null,
      currentReportId: null,
      obd2Status: 'idle',
      connectedDevice: null,
      scannedDevices: [],
      dtcCodes: [],
      liveData: defaultLiveData,
      damageAreas: [],
      paintMeasurements: [],
      photos: [],
      error: null,
    }),

  setError: error => set({error}),
  setLoading: loading => set({isLoading: loading}),
}));
