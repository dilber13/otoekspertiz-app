import React, {useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import VehicleCard from '../components/VehicleCard';
import ScoreGauge from '../components/ScoreGauge';
import {COLORS, APP_NAME} from '../utils/constants';
import {formatDate} from '../utils/helpers';
import {RootStackParamList, ExpertizReport} from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const {
    currentVehicle, reports, loadReports, resetSession,
    dtcCodes, damageAreas,
    motorTest, frenSuspansiyonTest, yanalKaymaTest, guvenlikTest, gorselTest,
  } = useExpertizStore();

  useEffect(() => { loadReports(); }, []);

  const recentReports = reports.slice(0, 3);

  // Test tamamlanma durumları
  const testModules = [
    {
      key: 'motor',
      icon: 'engine',
      title: 'Motor Mekanik',
      desc: 'Yağ, soğutma, kayış, egzoz',
      done: !!motorTest?.tamamlandi,
      color: '#E67E22',
      screen: 'MotorMekanik' as const,
    },
    {
      key: 'fren',
      icon: 'car-brake-abs',
      title: 'Fren & Süspansiyon',
      desc: 'Balata, disk, amortisör, alt takım',
      done: !!frenSuspansiyonTest?.tamamlandi,
      color: '#E74C3C',
      screen: 'FrenSuspansiyon' as const,
    },
    {
      key: 'yanal',
      icon: 'car-traction-control',
      title: 'Yanal Kayma Testi',
      desc: 'Ön/arka aks kayma değerleri',
      done: !!yanalKaymaTest?.tamamlandi,
      color: '#3498DB',
      screen: 'YanalKayma' as const,
    },
    {
      key: 'guvenlik',
      icon: 'airbag',
      title: 'Airbag & Güvenlik',
      desc: 'Airbag, emniyet kemeri, koltuklar',
      done: !!guvenlikTest?.tamamlandi,
      color: '#9B59B6',
      screen: 'Guvenlik' as const,
    },
    {
      key: 'gorsel',
      icon: 'car-outline',
      title: 'İç & Dış Görsel',
      desc: 'Camlar, lambalar, iç mekan, bagaj',
      done: !!gorselTest?.tamamlandi,
      color: '#27AE60',
      screen: 'GorselKontrol' as const,
    },
    {
      key: 'kaporta',
      icon: 'palette',
      title: 'Kaporta & Boya',
      desc: 'Boya kalınlığı, hasar bölgeleri',
      done: damageAreas.length > 0,
      color: '#F39C12',
      screen: 'KaportaBoya' as const,
    },
    {
      key: 'obd2',
      icon: 'bluetooth-connect',
      title: 'OBD2 / ELM327',
      desc: 'Motor beyin testi, arıza kodları',
      done: dtcCodes.length >= 0 && !!useExpertizStore.getState().connectedDevice,
      color: '#1ABC9C',
      screen: null,
    },
  ];

  const doneCount = testModules.filter(m => m.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Başlık */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>Profesyonel Araç Ekspertiz Sistemi</Text>
          </View>
          <Icon name="shield-car" size={38} color={COLORS.primary} />
        </View>

        {/* Araç Kartı */}
        {currentVehicle ? (
          <VehicleCard vehicle={currentVehicle} onEdit={() => navigation.navigate('VehicleForm', {})} />
        ) : (
          <TouchableOpacity style={styles.addVehicleBtn} onPress={() => navigation.navigate('VehicleForm', {})} activeOpacity={0.8}>
            <Icon name="plus-circle-outline" size={28} color={COLORS.primary} />
            <Text style={styles.addVehicleText}>Araç Bilgilerini Gir</Text>
            <Text style={styles.addVehicleSub}>Ekspertize başlamak için araç ekleyin</Text>
          </TouchableOpacity>
        )}

        {/* İlerleme */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Test İlerlemesi</Text>
            <Text style={styles.progressCount}>{doneCount}/{testModules.length}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {width: `${(doneCount / testModules.length) * 100}%`}]} />
          </View>
          <Text style={styles.progressLabel}>
            {doneCount === testModules.length ? '✅ Tüm testler tamamlandı — rapor oluşturabilirsiniz' :
             doneCount === 0 ? 'Testlere başlamak için aşağıdaki kartlara tıklayın' :
             `${testModules.length - doneCount} test daha kaldı`}
          </Text>
        </View>

        {/* Test Modülleri */}
        <Text style={styles.sectionTitle}>Ekspertiz Testleri</Text>
        <View style={styles.testGrid}>
          {testModules.map(m => (
            <TouchableOpacity
              key={m.key}
              style={[styles.testCard, {borderTopColor: m.color}, m.done && styles.testCardDone]}
              onPress={() => m.screen && navigation.navigate(m.screen as any)}
              activeOpacity={0.8}
              disabled={!m.screen}>
              <View style={styles.testCardHeader}>
                <View style={[styles.testIcon, {backgroundColor: m.color + '22'}]}>
                  <Icon name={m.icon} size={22} color={m.color} />
                </View>
                {m.done ? (
                  <View style={styles.doneBadge}>
                    <Icon name="check-circle" size={14} color={COLORS.success} />
                    <Text style={styles.doneText}>Tamam</Text>
                  </View>
                ) : m.screen ? (
                  <Icon name="chevron-right" size={18} color={COLORS.textMuted} />
                ) : (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>OBD2 tab</Text>
                  </View>
                )}
              </View>
              <Text style={styles.testTitle}>{m.title}</Text>
              <Text style={styles.testDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hızlı Eylemler */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.qaBtn, {backgroundColor: COLORS.primary}]}
            onPress={() => navigation.navigate('Report' as any)}>
            <Icon name="file-document-plus" size={20} color={COLORS.darkBg} />
            <Text style={[styles.qaBtnText, {color: COLORS.darkBg}]}>Rapor Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.qaBtn, {backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.danger + '66'}]}
            onPress={resetSession}>
            <Icon name="refresh" size={20} color={COLORS.danger} />
            <Text style={[styles.qaBtnText, {color: COLORS.danger}]}>Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* Son Raporlar */}
        {recentReports.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Son Raporlar</Text>
            {recentReports.map(r => <ReportRow key={r.id} report={r} />)}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Auto King OTO EKSPERTİZ v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ReportRow({report}: {report: ExpertizReport}) {
  return (
    <View style={repStyles.row}>
      <View style={repStyles.info}>
        <Text style={repStyles.plate}>{report.vehicle.plate}</Text>
        <Text style={repStyles.name}>{report.vehicle.brand} {report.vehicle.model}</Text>
        <Text style={repStyles.date}>{formatDate(report.createdAt)}</Text>
      </View>
      <ScoreGauge score={report.score.overall} size="small" showLabel={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  scroll: {flex: 1},
  content: {padding: 16, gap: 14, paddingBottom: 32},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4},
  appName: {fontSize: 20, fontWeight: '900', color: COLORS.primary},
  subtitle: {fontSize: 11, color: COLORS.textMuted, marginTop: 2},
  addVehicleBtn: {backgroundColor: COLORS.cardBg, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary + '44', borderStyle: 'dashed', padding: 24, alignItems: 'center', gap: 8},
  addVehicleText: {fontSize: 16, fontWeight: '700', color: COLORS.primary},
  addVehicleSub: {fontSize: 12, color: COLORS.textMuted, textAlign: 'center'},
  progressCard: {backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 14, gap: 8, borderWidth: 1, borderColor: COLORS.border},
  progressHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  progressTitle: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
  progressCount: {fontSize: 16, fontWeight: '900', color: COLORS.primary},
  progressBar: {height: 8, backgroundColor: COLORS.border, borderRadius: 4, overflow: 'hidden'},
  progressFill: {height: '100%', backgroundColor: COLORS.primary, borderRadius: 4},
  progressLabel: {fontSize: 11, color: COLORS.textMuted},
  sectionTitle: {fontSize: 15, fontWeight: '800', color: COLORS.textPrimary},
  testGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  testCard: {
    width: '47%', backgroundColor: COLORS.cardBg, borderRadius: 12,
    padding: 12, borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 3, gap: 6,
  },
  testCardDone: {borderColor: COLORS.success + '44', backgroundColor: COLORS.success + '0A'},
  testCardHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  testIcon: {width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center'},
  doneBadge: {flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.success + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8},
  doneText: {fontSize: 10, color: COLORS.success, fontWeight: '700'},
  tabBadge: {backgroundColor: COLORS.info + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8},
  tabBadgeText: {fontSize: 9, color: COLORS.info},
  testTitle: {fontSize: 13, fontWeight: '700', color: COLORS.textPrimary},
  testDesc: {fontSize: 11, color: COLORS.textMuted, lineHeight: 16},
  quickActions: {flexDirection: 'row', gap: 10},
  qaBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12},
  qaBtnText: {fontSize: 14, fontWeight: '800'},
  section: {gap: 8},
  footer: {alignItems: 'center', paddingTop: 4},
  footerText: {fontSize: 11, color: COLORS.textMuted},
});

const repStyles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.border},
  info: {flex: 1, gap: 2},
  plate: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
  name: {fontSize: 12, color: COLORS.textSecondary},
  date: {fontSize: 11, color: COLORS.textMuted},
});
