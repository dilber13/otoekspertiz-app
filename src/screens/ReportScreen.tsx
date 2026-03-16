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
  const {
    currentVehicle, dtcCodes, damageAreas, paintMeasurements, reports,
    motorTest, frenSuspansiyonTest, yanalKaymaTest, guvenlikTest, gorselTest,
    saveReport, deleteReport,
  } = useExpertizStore();
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [generating, setGenerating] = useState(false);

  const handleSave = async () => {
    if (!currentVehicle) {
      Alert.alert('Uyarı', 'Önce araç bilgilerini doldurun');
      return;
    }
    try {
      setGenerating(true);
      const report = await saveReport();
      Alert.alert(
        `Rapor Oluşturuldu — ${report.score.overall}/100`,
        `${currentVehicle.brand} ${currentVehicle.model} için ekspertiz raporu hazırlandı.`,
        [
          {text: 'HTML Rapor', onPress: () => shareReport(report)},
          {text: 'Metin Paylaş', onPress: () => shareReportAsText(report)},
          {text: 'Kapat', style: 'cancel'},
        ],
      );
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setGenerating(false);
    }
  };

  // Test tamamlanma durumu
  const tests = [
    {icon: 'engine',            label: 'Motor Mekanik',     done: !!motorTest?.tamamlandi,           color: '#E67E22'},
    {icon: 'car-brake-abs',     label: 'Fren & Süspansiyon', done: !!frenSuspansiyonTest?.tamamlandi, color: '#E74C3C'},
    {icon: 'car-traction-control', label: 'Yanal Kayma',    done: !!yanalKaymaTest?.tamamlandi,      color: '#3498DB'},
    {icon: 'airbag',            label: 'Airbag & Güvenlik', done: !!guvenlikTest?.tamamlandi,        color: '#9B59B6'},
    {icon: 'car-outline',       label: 'Görsel Kontrol',    done: !!gorselTest?.tamamlandi,          color: '#27AE60'},
    {icon: 'palette',           label: 'Kaporta & Boya',    done: damageAreas.length > 0 || paintMeasurements.length > 0, color: '#F39C12'},
    {icon: 'bluetooth-connect', label: 'OBD2 Beyin',        done: !!useExpertizStore.getState().connectedDevice, color: '#1ABC9C'},
  ];

  const doneCount = tests.filter(t => t.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Ekspertiz Raporu</Text>
        <View style={styles.tabs}>
          <TabBtn active={activeTab === 'create'} label="Rapor Oluştur" onPress={() => setActiveTab('create')} />
          <TabBtn active={activeTab === 'history'} label={`Geçmiş (${reports.length})`} onPress={() => setActiveTab('history')} />
        </View>

        {activeTab === 'create' ? (
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {currentVehicle ? (
              <View style={styles.section}>
                <VehicleCard vehicle={currentVehicle} compact />
              </View>
            ) : (
              <View style={styles.warnBox}>
                <Icon name="alert" size={16} color={COLORS.warning} />
                <Text style={styles.warnText}>Araç bilgisi girilmemiş</Text>
              </View>
            )}

            {/* Test Durumu */}
            <View style={styles.section}>
              <STitle icon="clipboard-check" title={`Test Durumu (${doneCount}/${tests.length})`} />
              <View style={styles.testList}>
                {tests.map(t => (
                  <View key={t.label} style={[styles.testRow, {borderLeftColor: t.done ? t.color : COLORS.border}]}>
                    <Icon name={t.icon} size={16} color={t.done ? t.color : COLORS.textMuted} />
                    <Text style={[styles.testLabel, {color: t.done ? COLORS.textPrimary : COLORS.textMuted}]}>{t.label}</Text>
                    <Icon
                      name={t.done ? 'check-circle' : 'circle-outline'}
                      size={16}
                      color={t.done ? t.color : COLORS.textMuted}
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* DTC Özet */}
            {dtcCodes.length > 0 && (
              <View style={styles.section}>
                <STitle icon="alert-circle" title="OBD2 Arıza Kodları" />
                <View style={styles.dtcSummary}>
                  {(['critical', 'high', 'medium', 'low'] as const).map(s => {
                    const cnt = dtcCodes.filter(d => d.severity === s).length;
                    if (!cnt) return null;
                    const colors: Record<string, string> = {critical: COLORS.danger, high: '#E67E22', medium: COLORS.warning, low: COLORS.success};
                    const labels: Record<string, string> = {critical: 'Kritik', high: 'Yüksek', medium: 'Orta', low: 'Düşük'};
                    return (
                      <View key={s} style={[styles.dtcBadge, {backgroundColor: colors[s] + '22', borderColor: colors[s] + '55'}]}>
                        <Text style={[styles.dtcBadgeNum, {color: colors[s]}]}>{cnt}</Text>
                        <Text style={[styles.dtcBadgeLbl, {color: colors[s]}]}>{labels[s]}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Rapor Oluştur */}
            <TouchableOpacity
              style={[styles.genBtn, !currentVehicle && {opacity: 0.5}]}
              onPress={handleSave}
              disabled={!currentVehicle || generating}
              activeOpacity={0.85}>
              {generating ? <ActivityIndicator color={COLORS.darkBg} /> : (
                <>
                  <Icon name="file-document-plus" size={22} color={COLORS.darkBg} />
                  <Text style={styles.genBtnText}>Detaylı Rapor Oluştur ve Paylaş</Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {reports.length === 0 ? (
              <View style={styles.empty}>
                <Icon name="file-document-outline" size={56} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Rapor Yok</Text>
                <Text style={styles.emptyText}>Henüz ekspertiz raporu oluşturulmadı</Text>
              </View>
            ) : reports.map(r => (
              <ReportCard
                key={r.id}
                report={r}
                onShare={() => shareReport(r)}
                onShareText={() => shareReportAsText(r)}
                onDelete={() => Alert.alert('Sil', 'Bu raporu silmek istediğinize emin misiniz?', [
                  {text: 'İptal', style: 'cancel'},
                  {text: 'Sil', style: 'destructive', onPress: () => deleteReport(r.id)},
                ])}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Alt Bileşenler ─────────────────────────────────────────────────────────────

function TabBtn({active, label, onPress}: {active: boolean; label: string; onPress: () => void}) {
  return (
    <TouchableOpacity style={[tabS.btn, active && tabS.active]} onPress={onPress}>
      <Text style={[tabS.text, active && tabS.activeText]}>{label}</Text>
    </TouchableOpacity>
  );
}

function STitle({icon, title}: {icon: string; title: string}) {
  return (
    <View style={sTitleS.row}>
      <Icon name={icon} size={15} color={COLORS.primary} />
      <Text style={sTitleS.text}>{title}</Text>
    </View>
  );
}

function ReportCard({report, onShare, onShareText, onDelete}: {
  report: ExpertizReport; onShare: () => void; onShareText: () => void; onDelete: () => void;
}) {
  const color = scoreColor(report.score.overall);
  const scoreItems = [
    {label: 'Motor', v: report.score.motor},
    {label: 'Kaporta', v: report.score.kaporta},
    {label: 'Fren', v: report.score.frenSuspansiyon},
    {label: 'Yanal', v: report.score.yanalKayma},
    {label: 'Güvenlik', v: report.score.guvenlik},
    {label: 'Görsel', v: report.score.gorsel},
    {label: 'OBD2', v: report.score.obd2},
  ];
  return (
    <View style={[cardS.card, {borderLeftColor: color}]}>
      <View style={cardS.header}>
        <View style={cardS.info}>
          <Text style={cardS.plate}>{report.vehicle.plate}</Text>
          <Text style={cardS.name}>{report.vehicle.brand} {report.vehicle.model} ({report.vehicle.year})</Text>
          <Text style={cardS.date}>{formatDate(report.createdAt)}</Text>
        </View>
        <ScoreGauge score={report.score.overall} size="small" />
      </View>
      {/* Mini puan çubukları */}
      <View style={cardS.scores}>
        {scoreItems.map(s => (
          <View key={s.label} style={cardS.scoreItem}>
            <Text style={cardS.scoreLbl}>{s.label}</Text>
            <View style={cardS.scoreBar}>
              <View style={[cardS.scoreFill, {width: `${s.v}%`, backgroundColor: scoreColor(s.v)}]} />
            </View>
            <Text style={[cardS.scoreNum, {color: scoreColor(s.v)}]}>{s.v}</Text>
          </View>
        ))}
      </View>
      <View style={cardS.actions}>
        <TouchableOpacity style={cardS.actBtn} onPress={onShare}>
          <Icon name="file-code" size={15} color={COLORS.primary} />
          <Text style={cardS.actText}>HTML</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cardS.actBtn} onPress={onShareText}>
          <Icon name="share-variant" size={15} color={COLORS.info} />
          <Text style={[cardS.actText, {color: COLORS.info}]}>Metin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[cardS.actBtn, {borderColor: COLORS.danger + '44'}]} onPress={onDelete}>
          <Icon name="trash-can" size={15} color={COLORS.danger} />
          <Text style={[cardS.actText, {color: COLORS.danger}]}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  container: {flex: 1, padding: 16, gap: 12},
  title: {fontSize: 22, fontWeight: '900', color: COLORS.primary},
  tabs: {flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 4, gap: 4},
  scroll: {flex: 1},
  section: {gap: 8, marginBottom: 14},
  warnBox: {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.warning + '22', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: COLORS.warning + '44'},
  warnText: {color: COLORS.warning, fontSize: 13},
  testList: {gap: 6},
  testRow: {flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.cardBg, borderRadius: 8, padding: 10, borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3},
  testLabel: {flex: 1, fontSize: 13},
  dtcSummary: {flexDirection: 'row', gap: 8, flexWrap: 'wrap'},
  dtcBadge: {paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', minWidth: 60},
  dtcBadgeNum: {fontSize: 20, fontWeight: '900'},
  dtcBadgeLbl: {fontSize: 10, fontWeight: '600'},
  genBtn: {backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginVertical: 12},
  genBtnText: {fontSize: 15, fontWeight: '800', color: COLORS.darkBg},
  empty: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12},
  emptyTitle: {fontSize: 18, fontWeight: '700', color: COLORS.textPrimary},
  emptyText: {fontSize: 13, color: COLORS.textMuted, textAlign: 'center'},
});

const tabS = StyleSheet.create({
  btn: {flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center'},
  active: {backgroundColor: COLORS.primary},
  text: {fontSize: 12, fontWeight: '600', color: COLORS.textMuted},
  activeText: {color: COLORS.darkBg},
});

const sTitleS = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', gap: 8},
  text: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
});

const cardS = StyleSheet.create({
  card: {backgroundColor: COLORS.cardBg, borderRadius: 12, borderLeftWidth: 4, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border, gap: 10},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'},
  info: {flex: 1, gap: 2},
  plate: {fontSize: 16, fontWeight: '800', color: COLORS.textPrimary},
  name: {fontSize: 13, color: COLORS.textSecondary},
  date: {fontSize: 11, color: COLORS.textMuted},
  scores: {gap: 4},
  scoreItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  scoreLbl: {fontSize: 10, color: COLORS.textMuted, width: 48},
  scoreBar: {flex: 1, height: 5, backgroundColor: COLORS.border, borderRadius: 3, overflow: 'hidden'},
  scoreFill: {height: '100%', borderRadius: 3},
  scoreNum: {fontSize: 10, fontWeight: '700', width: 24, textAlign: 'right'},
  actions: {flexDirection: 'row', gap: 8},
  actBtn: {flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: COLORS.primary + '44'},
  actText: {fontSize: 12, fontWeight: '600', color: COLORS.primary},
});
