import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, SafeAreaView, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import ScoreGauge from '../components/ScoreGauge';
import VehicleCard from '../components/VehicleCard';
import {COLORS} from '../utils/constants';
import {formatDate, scoreColor} from '../utils/helpers';
import {shareReport, shareReportAsText} from '../services/report/PDFGenerator';
import {ExpertizReport} from '../types';

export default function ReportScreen() {
  const {currentVehicle, dtcCodes, damageAreas, paintMeasurements, reports,
         saveReport, deleteReport, isLoading, setLoading} = useExpertizStore();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [generating, setGenerating] = useState(false);

  const handleSaveReport = async () => {
    if (!currentVehicle) {
      Alert.alert('Uyarı', 'Önce araç bilgilerini doldurun');
      return;
    }
    try {
      setGenerating(true);
      const report = await saveReport();
      Alert.alert(
        'Rapor Oluşturuldu',
        `Puan: ${report.score.overall}/100\n\nRaporu paylaşmak ister misiniz?`,
        [
          {text: 'Paylaş', onPress: () => shareReport(report)},
          {text: 'Metin Olarak', onPress: () => shareReportAsText(report)},
          {text: 'Kapat', style: 'cancel'},
        ],
      );
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setGenerating(false);
    }
  };

  const currentScore = reports[0]?.score ?? null;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Ekspertiz Raporu</Text>

        <View style={styles.tabs}>
          <TabBtn active={activeTab === 'create'} label="Rapor Oluştur" onPress={() => setActiveTab('create')} />
          <TabBtn active={activeTab === 'history'} label={`Geçmiş (${reports.length})`} onPress={() => setActiveTab('history')} />
        </View>

        {activeTab === 'create' ? (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Araç Özeti */}
            {currentVehicle ? (
              <View style={styles.section}>
                <SectionTitle icon="car" title="Araç" />
                <VehicleCard vehicle={currentVehicle} compact />
              </View>
            ) : (
              <View style={styles.warningBox}>
                <Icon name="alert" size={18} color={COLORS.warning} />
                <Text style={styles.warningText}>Araç bilgisi girilmemiş</Text>
              </View>
            )}

            {/* Puan Önizleme */}
            <View style={styles.section}>
              <SectionTitle icon="chart-bar" title="Puan Özeti" />
              <View style={styles.scoreCard}>
                <View style={styles.scoreRow}>
                  <ScoreItem label="Motor" value={dtcCodes.filter(d => d.system === 'engine').length === 0 ? 100 : Math.max(20, 100 - dtcCodes.filter(d => d.system === 'engine').length * 12)} />
                  <ScoreItem label="Kaporta" value={Math.max(20, 100 - damageAreas.length * 10)} />
                  <ScoreItem label="Güvenlik" value={dtcCodes.filter(d => d.system === 'airbag' || d.system === 'abs').length === 0 ? 100 : 60} />
                </View>
              </View>
            </View>

            {/* Özet Kartlar */}
            <View style={styles.section}>
              <SectionTitle icon="clipboard-list" title="Kontrol Özeti" />
              <View style={styles.summaryGrid}>
                <SummaryCard
                  icon="bluetooth-connect"
                  label="OBD2 Arıza"
                  value={dtcCodes.length}
                  ok={dtcCodes.length === 0}
                />
                <SummaryCard
                  icon="car-wrench"
                  label="Hasar Bölge"
                  value={damageAreas.length}
                  ok={damageAreas.length === 0}
                />
                <SummaryCard
                  icon="palette"
                  label="Boya Ölçüm"
                  value={paintMeasurements.length}
                  ok={paintMeasurements.length > 0}
                  invertOk
                />
                <SummaryCard
                  icon="alert-circle"
                  label="Kritik Hata"
                  value={dtcCodes.filter(d => d.severity === 'critical').length}
                  ok={dtcCodes.filter(d => d.severity === 'critical').length === 0}
                />
              </View>
            </View>

            {/* Rapor Oluştur Butonu */}
            <TouchableOpacity
              style={[styles.generateBtn, !currentVehicle && styles.generateBtnDisabled]}
              onPress={handleSaveReport}
              disabled={!currentVehicle || generating}
              activeOpacity={0.85}>
              {generating ? (
                <ActivityIndicator color={COLORS.darkBg} />
              ) : (
                <>
                  <Icon name="file-document-plus" size={22} color={COLORS.darkBg} />
                  <Text style={styles.generateBtnText}>Rapor Oluştur ve Paylaş</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {reports.length === 0 ? (
              <View style={styles.emptyState}>
                <Icon name="file-document-outline" size={56} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Rapor Yok</Text>
                <Text style={styles.emptyText}>Henüz ekspertiz raporu oluşturulmadı</Text>
              </View>
            ) : (
              reports.map(report => (
                <ReportHistoryCard
                  key={report.id}
                  report={report}
                  onShare={() => shareReport(report)}
                  onShareText={() => shareReportAsText(report)}
                  onDelete={() => {
                    Alert.alert('Sil', 'Bu raporu silmek istiyor musunuz?', [
                      {text: 'İptal', style: 'cancel'},
                      {text: 'Sil', style: 'destructive', onPress: () => deleteReport(report.id)},
                    ]);
                  }}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Alt Bileşenler ─────────────────────────────────────────────────────────────

function TabBtn({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={[tabStyles.btn, active && tabStyles.active]} onPress={onPress}>
      <Text style={[tabStyles.text, active && tabStyles.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionTitle({icon, title}: {icon: string; title: string}) {
  return (
    <View style={sectionStyles.row}>
      <Icon name={icon} size={16} color={COLORS.primary} />
      <Text style={sectionStyles.title}>{title}</Text>
    </View>
  );
}

function ScoreItem({label, value}: {label: string; value: number}) {
  return (
    <View style={scoreItemStyles.container}>
      <ScoreGauge score={value} size="small" showLabel={false} />
      <Text style={scoreItemStyles.label}>{label}</Text>
    </View>
  );
}

function SummaryCard({icon, label, value, ok, invertOk}: {icon: string; label: string; value: number; ok: boolean; invertOk?: boolean}) {
  const isGood = invertOk ? ok && value > 0 : ok;
  const color = isGood ? COLORS.success : value === 0 && !invertOk ? COLORS.success : COLORS.danger;
  return (
    <View style={[summaryStyles.card, {borderTopColor: color}]}>
      <Icon name={icon} size={20} color={color} />
      <Text style={[summaryStyles.value, {color}]}>{value}</Text>
      <Text style={summaryStyles.label}>{label}</Text>
    </View>
  );
}

function ReportHistoryCard({report, onShare, onShareText, onDelete}: {
  report: ExpertizReport;
  onShare: () => void;
  onShareText: () => void;
  onDelete: () => void;
}) {
  const color = scoreColor(report.score.overall);
  return (
    <View style={[histStyles.card, {borderLeftColor: color}]}>
      <View style={histStyles.header}>
        <View style={histStyles.headerInfo}>
          <Text style={histStyles.plate}>{report.vehicle.plate}</Text>
          <Text style={histStyles.name}>{report.vehicle.brand} {report.vehicle.model} ({report.vehicle.year})</Text>
          <Text style={histStyles.date}>{formatDate(report.createdAt)}</Text>
        </View>
        <ScoreGauge score={report.score.overall} size="small" />
      </View>

      <View style={histStyles.stats}>
        <HistStat icon="alert-circle" label="Arıza" value={report.obd2Session?.dtcCodes?.length ?? 0} color={COLORS.danger} />
        <HistStat icon="car-wrench" label="Hasar" value={report.damageAreas.length} color={COLORS.warning} />
        <HistStat icon="palette" label="Boya" value={report.paintMeasurements.length} color={COLORS.info} />
      </View>

      <View style={histStyles.actions}>
        <TouchableOpacity style={histStyles.actionBtn} onPress={onShare}>
          <Icon name="share-variant" size={16} color={COLORS.primary} />
          <Text style={histStyles.actionText}>HTML</Text>
        </TouchableOpacity>
        <TouchableOpacity style={histStyles.actionBtn} onPress={onShareText}>
          <Icon name="message-text" size={16} color={COLORS.info} />
          <Text style={[histStyles.actionText, {color: COLORS.info}]}>Metin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[histStyles.actionBtn, {borderColor: COLORS.danger + '44'}]} onPress={onDelete}>
          <Icon name="trash-can" size={16} color={COLORS.danger} />
          <Text style={[histStyles.actionText, {color: COLORS.danger}]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function HistStat({icon, label, value, color}: {icon: string; label: string; value: number; color: string}) {
  return (
    <View style={histStyles.stat}>
      <Icon name={icon} size={12} color={color} />
      <Text style={histStyles.statText}>{value} {label}</Text>
    </View>
  );
}

// ── Stiller ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  container: {flex: 1, padding: 16, gap: 12},
  title: {fontSize: 22, fontWeight: '900', color: COLORS.primary},
  tabs: {flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 4, gap: 4},
  scrollArea: {flex: 1},
  section: {gap: 8, marginBottom: 16},
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.warning + '22',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.warning + '44',
  },
  warningText: {color: COLORS.warning, fontSize: 13},
  scoreCard: {backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16},
  scoreRow: {flexDirection: 'row', justifyContent: 'space-around'},
  summaryGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  generateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 16,
  },
  generateBtnDisabled: {opacity: 0.5},
  generateBtnText: {fontSize: 16, fontWeight: '800', color: COLORS.darkBg},
  emptyState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: COLORS.textPrimary},
  emptyText: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center'},
});

const tabStyles = StyleSheet.create({
  btn: {flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center'},
  active: {backgroundColor: COLORS.primary},
  text: {fontSize: 12, fontWeight: '600', color: COLORS.textMuted},
  activeText: {color: COLORS.darkBg},
});

const sectionStyles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  title: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
});

const scoreItemStyles = StyleSheet.create({
  container: {alignItems: 'center', gap: 4},
  label: {fontSize: 11, color: COLORS.textMuted},
});

const summaryStyles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 3,
  },
  value: {fontSize: 22, fontWeight: '900'},
  label: {fontSize: 11, color: COLORS.textMuted, textAlign: 'center'},
});

const histStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  headerInfo: {flex: 1, gap: 2},
  plate: {fontSize: 15, fontWeight: '800', color: COLORS.textPrimary},
  name: {fontSize: 13, color: COLORS.textSecondary},
  date: {fontSize: 11, color: COLORS.textMuted},
  stats: {flexDirection: 'row', gap: 16},
  stat: {flexDirection: 'row', alignItems: 'center', gap: 4},
  statText: {fontSize: 12, color: COLORS.textMuted},
  actions: {flexDirection: 'row', gap: 8},
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  actionText: {fontSize: 12, fontWeight: '600', color: COLORS.primary},
});
