import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {obd2Service} from '../services/obd2/OBD2Service';
import {useExpertizStore} from '../store/useExpertizStore';
import BluetoothStatus from '../components/BluetoothStatus';
import DTCCodeItem from '../components/DTCCodeItem';
import {COLORS, SYSTEM_LABELS} from '../utils/constants';
import {formatLiveValue} from '../utils/helpers';
import {BLEDevice, OBD2LiveData} from '../types';

export default function OBD2Screen() {
  const {
    obd2Status, setOBD2Status,
    connectedDevice, setConnectedDevice,
    scannedDevices, setScannedDevices,
    dtcCodes, setDTCCodes, clearDTCCodes,
    liveData, updateLiveData,
  } = useExpertizStore();

  const [activeTab, setActiveTab] = useState<'dtc' | 'live'>('dtc');
  const liveDataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopScanRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopScanRef.current?.();
      clearLiveDataInterval();
    };
  }, []);

  // ── Tarama ────────────────────────────────────────────────────────────────
  const startScan = useCallback(() => {
    setOBD2Status('scanning');
    setScannedDevices([]);

    stopScanRef.current = obd2Service.scanDevices(
      device => {
        setScannedDevices([
          ...useExpertizStore.getState().scannedDevices,
          device,
        ]);
      },
      err => {
        setOBD2Status('error');
        Alert.alert('Tarama Hatası', err);
      },
    );

    setTimeout(() => {
      setOBD2Status(
        useExpertizStore.getState().obd2Status === 'scanning' ? 'idle' : useExpertizStore.getState().obd2Status,
      );
    }, 10500);
  }, []);

  const stopScan = useCallback(() => {
    stopScanRef.current?.();
    obd2Service.stopScan();
    setOBD2Status('idle');
  }, []);

  // ── Bağlantı ──────────────────────────────────────────────────────────────
  const connectToDevice = useCallback(async (device: BLEDevice) => {
    try {
      setOBD2Status('connecting');
      await obd2Service.connect(device.id);
      setConnectedDevice(device);
      setOBD2Status('connected');
    } catch (e: any) {
      setOBD2Status('error');
      Alert.alert('Bağlantı Hatası', e.message ?? 'Cihaza bağlanılamadı');
    }
  }, []);

  const disconnect = useCallback(async () => {
    clearLiveDataInterval();
    await obd2Service.disconnect();
    setConnectedDevice(null);
    setOBD2Status('disconnected');
  }, []);

  // ── DTC Okuma ─────────────────────────────────────────────────────────────
  const readDTCs = useCallback(async () => {
    if (!obd2Service.isConnected) return;
    try {
      setOBD2Status('reading');
      clearDTCCodes();
      const stored = await obd2Service.readDTCCodes();
      const pending = await obd2Service.readPendingDTCCodes();
      setDTCCodes([...stored, ...pending]);
      setOBD2Status('connected');
    } catch (e: any) {
      setOBD2Status('error');
      Alert.alert('Okuma Hatası', e.message);
    }
  }, []);

  const clearDTCs = useCallback(() => {
    Alert.alert(
      'Arıza Kodlarını Sil',
      'Tüm arıza kodları araçtan silinecek. Emin misiniz?',
      [
        {text: 'İptal', style: 'cancel'},
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await obd2Service.clearDTCCodes();
            clearDTCCodes();
          },
        },
      ],
    );
  }, []);

  // ── Canlı Veri ────────────────────────────────────────────────────────────
  const startLiveData = useCallback(() => {
    if (liveDataIntervalRef.current) return;
    liveDataIntervalRef.current = setInterval(async () => {
      if (!obd2Service.isConnected) return;
      const data = await obd2Service.readLiveData();
      updateLiveData(data);
    }, 2000);
  }, []);

  const clearLiveDataInterval = () => {
    if (liveDataIntervalRef.current) {
      clearInterval(liveDataIntervalRef.current);
      liveDataIntervalRef.current = null;
    }
  };

  const isConnected = obd2Status === 'connected' || obd2Status === 'reading';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>OBD2 / ELM327</Text>
          <BluetoothStatus
            status={obd2Status}
            deviceName={connectedDevice?.name}
          />
        </View>

        {/* Bağlantı Kontrolleri */}
        <View style={styles.controls}>
          {!isConnected ? (
            obd2Status === 'scanning' ? (
              <TouchableOpacity style={[styles.ctrlBtn, {backgroundColor: COLORS.danger + '22', borderColor: COLORS.danger}]} onPress={stopScan}>
                <Icon name="stop" size={18} color={COLORS.danger} />
                <Text style={[styles.ctrlBtnText, {color: COLORS.danger}]}>Taramayı Durdur</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.ctrlBtn, {backgroundColor: COLORS.info + '22', borderColor: COLORS.info}]} onPress={startScan}>
                <Icon name="bluetooth-search" size={18} color={COLORS.info} />
                <Text style={[styles.ctrlBtnText, {color: COLORS.info}]}>Cihaz Tara</Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={styles.connectedControls}>
              <TouchableOpacity style={[styles.ctrlBtn, {flex: 1, backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary}]} onPress={readDTCs}>
                <Icon name="magnify-scan" size={18} color={COLORS.primary} />
                <Text style={[styles.ctrlBtnText, {color: COLORS.primary}]}>Arıza Oku</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctrlBtn, {flex: 1, backgroundColor: COLORS.success + '22', borderColor: COLORS.success}]} onPress={startLiveData}>
                <Icon name="chart-line" size={18} color={COLORS.success} />
                <Text style={[styles.ctrlBtnText, {color: COLORS.success}]}>Canlı Veri</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ctrlBtn, {backgroundColor: COLORS.danger + '22', borderColor: COLORS.danger}]} onPress={disconnect}>
                <Icon name="bluetooth-off" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Cihaz Listesi */}
        {obd2Status === 'scanning' && scannedDevices.length === 0 && (
          <View style={styles.scanningState}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.scanningText}>ELM327 cihazları aranıyor...</Text>
          </View>
        )}

        {scannedDevices.length > 0 && !isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bulunan Cihazlar</Text>
            {scannedDevices.map(device => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceItem}
                onPress={() => connectToDevice(device)}>
                <Icon name="bluetooth" size={18} color={COLORS.info} />
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name ?? 'Bilinmeyen Cihaz'}</Text>
                  <Text style={styles.deviceId}>{device.id}</Text>
                </View>
                <Text style={styles.deviceRssi}>{device.rssi} dBm</Text>
                <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* İçerik Sekmeleri */}
        {isConnected && (
          <>
            <View style={styles.tabs}>
              <TabBtn active={activeTab === 'dtc'} label={`Arıza Kodları (${dtcCodes.length})`} onPress={() => setActiveTab('dtc')} />
              <TabBtn active={activeTab === 'live'} label="Canlı Veriler" onPress={() => setActiveTab('live')} />
            </View>

            {activeTab === 'dtc' ? (
              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                {dtcCodes.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Icon name="check-circle" size={48} color={COLORS.success} />
                    <Text style={styles.emptyTitle}>Arıza Kodu Yok</Text>
                    <Text style={styles.emptyText}>Araçta aktif arıza kodu bulunmuyor</Text>
                  </View>
                ) : (
                  <>
                    <View style={styles.dtcHeader}>
                      <Text style={styles.dtcCount}>{dtcCodes.length} arıza kodu</Text>
                      <TouchableOpacity onPress={clearDTCs}>
                        <Text style={styles.clearBtn}>Kodları Sil</Text>
                      </TouchableOpacity>
                    </View>
                    {dtcCodes.map(dtc => <DTCCodeItem key={dtc.code} dtc={dtc} />)}
                  </>
                )}
              </ScrollView>
            ) : (
              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                <LiveDataGrid data={liveData} />
              </ScrollView>
            )}
          </>
        )}

        {/* Boş Durum */}
        {obd2Status === 'idle' && scannedDevices.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="bluetooth-off" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>ELM327 Bağlı Değil</Text>
            <Text style={styles.emptyText}>
              OBD2 dongle'ınızı araca takın ve Cihaz Tara'ya basın
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Alt Bileşenler ────────────────────────────────────────────────────────────

function TabBtn({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) {
  return (
    <TouchableOpacity
      style={[tabStyles.btn, active && tabStyles.active]}
      onPress={onPress}>
      <Text style={[tabStyles.text, active && tabStyles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function LiveDataGrid({data}: {data: OBD2LiveData}) {
  const items: {key: keyof OBD2LiveData; label: string; icon: string}[] = [
    {key: 'rpm',            label: 'Devir',          icon: 'speedometer'},
    {key: 'speed',          label: 'Hız',            icon: 'gauge'},
    {key: 'engineTemp',     label: 'Motor Isısı',    icon: 'thermometer'},
    {key: 'throttlePos',    label: 'Gaz Kelebeği',   icon: 'tune'},
    {key: 'fuelLevel',      label: 'Yakıt',          icon: 'gas-station'},
    {key: 'batteryVoltage', label: 'Akü Voltajı',    icon: 'battery'},
    {key: 'intakeTemp',     label: 'Emme Isısı',     icon: 'thermometer-lines'},
    {key: 'mafRate',        label: 'MAF Debisi',     icon: 'air-filter'},
    {key: 'oxygenSensor',   label: 'O2 Sensör',      icon: 'molecule'},
    {key: 'fuelPressure',   label: 'Yakıt Basıncı',  icon: 'hydraulic-oil-level'},
  ];

  return (
    <View style={liveStyles.grid}>
      {items.map(item => {
        const value = data[item.key];
        const hasValue = value !== null;
        return (
          <View key={item.key} style={[liveStyles.card, !hasValue && liveStyles.cardDim]}>
            <Icon name={item.icon} size={22} color={hasValue ? COLORS.primary : COLORS.textMuted} />
            <Text style={liveStyles.value}>
              {formatLiveValue(item.key, value)}
            </Text>
            <Text style={liveStyles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Stiller ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  container: {flex: 1, padding: 16, gap: 12},
  header: {gap: 8},
  title: {fontSize: 22, fontWeight: '900', color: COLORS.primary},
  controls: {},
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  ctrlBtnText: {fontSize: 14, fontWeight: '700'},
  connectedControls: {flexDirection: 'row', gap: 8},
  scanningState: {alignItems: 'center', paddingVertical: 32, gap: 12},
  scanningText: {color: COLORS.textSecondary, fontSize: 14},
  section: {gap: 8},
  sectionTitle: {fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase'},
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  deviceInfo: {flex: 1},
  deviceName: {fontSize: 14, fontWeight: '600', color: COLORS.textPrimary},
  deviceId: {fontSize: 11, color: COLORS.textMuted, fontFamily: 'monospace'},
  deviceRssi: {fontSize: 11, color: COLORS.textMuted},
  tabs: {flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 4, gap: 4},
  scrollArea: {flex: 1},
  emptyState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: COLORS.textPrimary},
  emptyText: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 32},
  dtcHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  dtcCount: {fontSize: 13, color: COLORS.textMuted},
  clearBtn: {fontSize: 13, color: COLORS.danger, fontWeight: '600'},
});

const tabStyles = StyleSheet.create({
  btn: {flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center'},
  active: {backgroundColor: COLORS.primary},
  text: {fontSize: 12, fontWeight: '600', color: COLORS.textMuted},
  activeText: {color: COLORS.darkBg},
});

const liveStyles = StyleSheet.create({
  grid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  card: {
    width: '47%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardDim: {opacity: 0.5},
  value: {fontSize: 18, fontWeight: '800', color: COLORS.textPrimary},
  label: {fontSize: 11, color: COLORS.textMuted},
});
