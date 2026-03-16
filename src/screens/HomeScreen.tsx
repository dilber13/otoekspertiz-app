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
  const {currentVehicle, reports, loadReports, resetSession, dtcCodes, damageAreas} =
    useExpertizStore();

  useEffect(() => {
    loadReports();
  }, []);

  const recentReports = reports.slice(0, 3);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.darkBg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>Profesyonel Araç Ekspertiz Sistemi</Text>
          </View>
          <View style={styles.logo}>
            <Icon name="shield-car" size={36} color={COLORS.primary} />
          </View>
        </View>

        {/* Aktif Araç */}
        {currentVehicle ? (
          <View style={styles.section}>
            <SectionTitle icon="car" title="Aktif Araç" />
            <VehicleCard
              vehicle={currentVehicle}
              onEdit={() => navigation.navigate('VehicleForm', {})}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addVehicleBtn}
            onPress={() => navigation.navigate('VehicleForm', {})}
            activeOpacity={0.8}>
            <Icon name="plus-circle-outline" size={28} color={COLORS.primary} />
            <Text style={styles.addVehicleText}>Araç Bilgilerini Gir</Text>
            <Text style={styles.addVehicleSub}>Ekspertize başlamak için araç bilgilerini ekleyin</Text>
          </TouchableOpacity>
        )}

        {/* İstatistikler */}
        <View style={styles.section}>
          <SectionTitle icon="chart-bar" title="Oturum Özeti" />
          <View style={styles.statsGrid}>
            <StatCard
              icon="bluetooth-connect"
              label="OBD2 Arıza"
              value={dtcCodes.length.toString()}
              color={dtcCodes.length > 0 ? COLORS.danger : COLORS.success}
            />
            <StatCard
              icon="car-wrench"
              label="Hasar Bölge"
              value={damageAreas.length.toString()}
              color={damageAreas.length > 0 ? COLORS.warning : COLORS.success}
            />
            <StatCard
              icon="file-document-multiple"
              label="Toplam Rapor"
              value={reports.length.toString()}
              color={COLORS.info}
            />
          </View>
        </View>

        {/* Hızlı Eylemler */}
        <View style={styles.section}>
          <SectionTitle icon="lightning-bolt" title="Hızlı Eylemler" />
          <View style={styles.actionsGrid}>
            <ActionBtn
              icon="bluetooth-connect"
              label="OBD2 Bağlan"
              color="#3498DB"
              onPress={() => {/* navigate to OBD2 tab */}}
            />
            <ActionBtn
              icon="camera"
              label="Hasar Tespiti"
              color="#9B59B6"
              onPress={() => {/* navigate to Camera tab */}}
            />
            <ActionBtn
              icon="refresh"
              label="Yeni Oturum"
              color="#E67E22"
              onPress={resetSession}
            />
            <ActionBtn
              icon="file-document"
              label="Rapor Oluştur"
              color="#27AE60"
              onPress={() => {/* navigate to Report tab */}}
            />
          </View>
        </View>

        {/* Son Raporlar */}
        {recentReports.length > 0 && (
          <View style={styles.section}>
            <SectionTitle icon="history" title="Son Raporlar" />
            {recentReports.map(report => (
              <ReportRow key={report.id} report={report} />
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Auto King OTO EKSPERTİZ v1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Alt bileşenler ─────────────────────────────────────────────────────────────

function SectionTitle({icon, title}: {icon: string; title: string}) {
  return (
    <View style={sectionStyles.row}>
      <Icon name={icon} size={18} color={COLORS.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

function StatCard({icon, label, value, color}: {icon: string; label: string; value: string; color: string}) {
  return (
    <View style={[statStyles.card, {borderTopColor: color}]}>
      <Icon name={icon} size={22} color={color} />
      <Text style={[statStyles.value, {color}]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function ActionBtn({icon, label, color, onPress}: {icon: string; label: string; color: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={[actionStyles.btn, {borderColor: color + '44'}]} onPress={onPress} activeOpacity={0.8}>
      <View style={[actionStyles.iconBg, {backgroundColor: color + '22'}]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={actionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function ReportRow({report}: {report: ExpertizReport}) {
  const scoreColor = report.score.overall >= 80 ? COLORS.success
    : report.score.overall >= 60 ? COLORS.warning : COLORS.danger;

  return (
    <View style={reportStyles.row}>
      <View style={reportStyles.info}>
        <Text style={reportStyles.plate}>{report.vehicle.plate}</Text>
        <Text style={reportStyles.name}>{report.vehicle.brand} {report.vehicle.model}</Text>
        <Text style={reportStyles.date}>{formatDate(report.createdAt)}</Text>
      </View>
      <ScoreGauge score={report.score.overall} size="small" showLabel={false} />
    </View>
  );
}

// ── Stiller ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  scroll: {flex: 1},
  content: {padding: 16, gap: 20, paddingBottom: 32},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appName: {fontSize: 20, fontWeight: '900', color: COLORS.primary},
  subtitle: {fontSize: 12, color: COLORS.textMuted, marginTop: 2},
  logo: {padding: 8},
  section: {gap: 10},
  addVehicleBtn: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.primary + '44',
    borderStyle: 'dashed',
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  addVehicleText: {fontSize: 16, fontWeight: '700', color: COLORS.primary},
  addVehicleSub: {fontSize: 12, color: COLORS.textMuted, textAlign: 'center'},
  statsGrid: {flexDirection: 'row', gap: 10},
  actionsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  footer: {alignItems: 'center', paddingTop: 10},
  footerText: {fontSize: 11, color: COLORS.textMuted},
});

const sectionStyles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {fontSize: 15, fontWeight: '700', color: COLORS.textPrimary},
});

const statStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
  },
  value: {fontSize: 24, fontWeight: '900'},
  label: {fontSize: 11, color: COLORS.textMuted, textAlign: 'center'},
});

const actionStyles = StyleSheet.create({
  btn: {
    width: '47%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {fontSize: 12, fontWeight: '600', color: COLORS.textSecondary},
});

const reportStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  info: {flex: 1, gap: 2},
  plate: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
  name: {fontSize: 12, color: COLORS.textSecondary},
  date: {fontSize: 11, color: COLORS.textMuted},
});
