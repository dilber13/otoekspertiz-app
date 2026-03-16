import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import {COLORS} from '../utils/constants';
import {MotorMekanikTest, DurumTipi} from '../types';

const DURUM_OPTS: {value: DurumTipi; label: string; color: string}[] = [
  {value: 'iyi',               label: 'İyi',               color: '#27AE60'},
  {value: 'orta',              label: 'Orta',              color: '#F39C12'},
  {value: 'kötü',              label: 'Kötü',              color: '#E74C3C'},
  {value: 'kontrol_edilmedi',  label: 'Kontrol Edilmedi',  color: '#888888'},
];

export default function MotorMekanikScreen() {
  const navigation = useNavigation();
  const {motorTest, saveMotorTest} = useExpertizStore();

  const [yagSeviyesi, setYagSeviyesi] = useState<DurumTipi>(motorTest?.yagSeviyesi ?? 'kontrol_edilmedi');
  const [yagRengi, setYagRengi] = useState(motorTest?.yagRengi ?? 'kontrol_edilmedi');
  const [yagKoku, setYagKoku] = useState(motorTest?.yagKoku ?? false);
  const [sogutmaSuyu, setSogutmaSuyu] = useState<DurumTipi>(motorTest?.sogutmaSuyu ?? 'kontrol_edilmedi');
  const [antifrizRengi, setAntifrizRengi] = useState(motorTest?.antifrizRengi ?? 'kontrol_edilmedi');
  const [kayisZincir, setKayisZincir] = useState<DurumTipi>(motorTest?.kayisZincir ?? 'kontrol_edilmedi');
  const [motorSesi, setMotorSesi] = useState(motorTest?.motorSesi ?? 'normal');
  const [motorSesiNot, setMotorSesiNot] = useState(motorTest?.motorSesiNot ?? '');
  const [egzozDumani, setEgzozDumani] = useState(motorTest?.egzozDumani ?? 'yok');
  const [egzozSesi, setEgzozSesi] = useState(motorTest?.egzozSesi ?? 'normal');
  const [motorTitresimi, setMotorTitresimi] = useState<DurumTipi>(motorTest?.motorTitresimi ?? 'kontrol_edilmedi');
  const [turbo, setTurbo] = useState<any>(motorTest?.turbo ?? 'yok');
  const [havaFiltresi, setHavaFiltresi] = useState<DurumTipi>(motorTest?.havaFiltresi ?? 'kontrol_edilmedi');
  const [yakitFiltresi, setYakitFiltresi] = useState<DurumTipi>(motorTest?.yakitFiltresi ?? 'kontrol_edilmedi');
  const [notlar, setNotlar] = useState(motorTest?.notlar ?? '');

  const handleKaydet = () => {
    const test: MotorMekanikTest = {
      tamamlandi: true,
      yagSeviyesi, yagRengi: yagRengi as any, yagKoku,
      sogutmaSuyu, antifrizRengi: antifrizRengi as any,
      kayisZincir,
      motorSesi: motorSesi as any, motorSesiNot: motorSesiNot || undefined,
      egzozDumani: egzozDumani as any, egzozSesi: egzozSesi as any,
      motorTitresimi, turbo, intercooler: 'kontrol_edilmedi',
      havaFiltresi, yakitFiltresi,
      notlar: notlar || undefined,
    };
    saveMotorTest(test);
    Alert.alert('Kaydedildi', 'Motor mekanik testi kaydedildi', [
      {text: 'Tamam', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <SectionHeader icon="oil" title="Motor Yağı" />
        <DurumSecici label="Yağ Seviyesi" value={yagSeviyesi} onChange={setYagSeviyesi} />
        <ChipSecici
          label="Yağ Rengi"
          value={yagRengi}
          options={[
            {value: 'temiz', label: 'Temiz / Sarı'},
            {value: 'koyu', label: 'Koyu'},
            {value: 'siyah', label: 'Siyah'},
            {value: 'köpüklü', label: 'Köpüklü ⚠'},
            {value: 'kontrol_edilmedi', label: 'Kontrol Edilmedi'},
          ]}
          onChange={setYagRengi}
        />
        <BoolSecici label="Yanık Yağ Kokusu Var mı?" value={yagKoku} onChange={setYagKoku} />

        <SectionHeader icon="coolant-temperature" title="Soğutma Sistemi" />
        <DurumSecici label="Soğutma Suyu Seviyesi" value={sogutmaSuyu} onChange={setSogutmaSuyu} />
        <ChipSecici
          label="Antifriz Rengi"
          value={antifrizRengi}
          options={[
            {value: 'yeşil', label: 'Yeşil'},
            {value: 'kırmızı', label: 'Kırmızı'},
            {value: 'mavi', label: 'Mavi'},
            {value: 'kahverengi', label: 'Kahverengi ⚠'},
            {value: 'kontrol_edilmedi', label: 'Kontrol Edilmedi'},
          ]}
          onChange={setAntifrizRengi}
        />

        <SectionHeader icon="engine" title="Kayış / Zincir & Sesler" />
        <DurumSecici label="V-Kayış / Zamanlama Zinciri" value={kayisZincir} onChange={setKayisZincir} />
        <ChipSecici
          label="Motor Sesi"
          value={motorSesi}
          options={[
            {value: 'normal', label: '✅ Normal'},
            {value: 'vuruntu', label: '⚠ Vuruntu'},
            {value: 'tıkırtı', label: '⚠ Tıkırtı'},
            {value: 'ıslık', label: '⚠ Islık'},
            {value: 'anormal', label: '🔴 Anormal'},
          ]}
          onChange={setMotorSesi}
        />
        {motorSesi !== 'normal' && (
          <View style={styles.inputWrap}>
            <Text style={styles.inputLabel}>Ses Detayı</Text>
            <TextInput
              style={styles.input}
              value={motorSesiNot}
              onChangeText={setMotorSesiNot}
              placeholder="Sesi açıklayın..."
              placeholderTextColor={COLORS.textMuted}
              multiline
            />
          </View>
        )}

        <SectionHeader icon="tailpipe" title="Egzoz" />
        <ChipSecici
          label="Egzoz Dumanı Rengi"
          value={egzozDumani}
          options={[
            {value: 'yok', label: '✅ Yok / Normal'},
            {value: 'beyaz', label: '⚠ Beyaz (Su)'},
            {value: 'mavi', label: '⚠ Mavi (Yağ)'},
            {value: 'siyah', label: '🔴 Siyah (Zengin)'},
            {value: 'gri', label: '⚠ Gri'},
          ]}
          onChange={setEgzozDumani}
        />
        <ChipSecici
          label="Egzoz Sesi"
          value={egzozSesi}
          options={[
            {value: 'normal', label: '✅ Normal'},
            {value: 'anormal', label: '🔴 Anormal / Delik'},
          ]}
          onChange={setEgzozSesi}
        />

        <SectionHeader icon="air-filter" title="Filtreler & Genel" />
        <DurumSecici label="Motor Titreşimi" value={motorTitresimi} onChange={setMotorTitresimi} />
        <ChipSecici
          label="Turbo Durumu"
          value={turbo}
          options={[
            {value: 'yok', label: 'Turbo Yok'},
            {value: 'iyi', label: '✅ İyi'},
            {value: 'orta', label: '⚠ Orta'},
            {value: 'kötü', label: '🔴 Kötü'},
          ]}
          onChange={setTurbo}
        />
        <DurumSecici label="Hava Filtresi" value={havaFiltresi} onChange={setHavaFiltresi} />
        <DurumSecici label="Yakıt Filtresi" value={yakitFiltresi} onChange={setYakitFiltresi} />

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Genel Notlar</Text>
          <TextInput
            style={[styles.input, {height: 80}]}
            value={notlar}
            onChangeText={setNotlar}
            placeholder="Motor hakkında gözlemleriniz..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleKaydet}>
          <Icon name="check-circle" size={20} color={COLORS.darkBg} />
          <Text style={styles.saveBtnText}>Motor Testini Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Yardımcı Bileşenler ───────────────────────────────────────────────────────

function SectionHeader({icon, title}: {icon: string; title: string}) {
  return (
    <View style={shStyles.header}>
      <Icon name={icon} size={18} color={COLORS.primary} />
      <Text style={shStyles.title}>{title}</Text>
    </View>
  );
}

function DurumSecici({label, value, onChange}: {
  label: string; value: DurumTipi; onChange: (v: DurumTipi) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.durumRow}>
        {DURUM_OPTS.map(o => (
          <TouchableOpacity
            key={o.value}
            style={[styles.durumBtn, value === o.value && {backgroundColor: o.color, borderColor: o.color}]}
            onPress={() => onChange(o.value)}>
            <Text style={[styles.durumText, value === o.value && {color: '#fff'}]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ChipSecici({label, value, options, onChange}: {
  label: string;
  value: string;
  options: {value: string; label: string}[];
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map(o => (
          <TouchableOpacity
            key={o.value}
            style={[styles.chip, value === o.value && styles.chipActive]}
            onPress={() => onChange(o.value)}>
            <Text style={[styles.chipText, value === o.value && styles.chipTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function BoolSecici({label, value, onChange}: {label: string; value: boolean; onChange: (v: boolean) => void}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.boolRow}>
        <TouchableOpacity
          style={[styles.boolBtn, value && {backgroundColor: COLORS.danger, borderColor: COLORS.danger}]}
          onPress={() => onChange(true)}>
          <Text style={[styles.boolText, value && {color: '#fff'}]}>Evet ⚠</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boolBtn, !value && {backgroundColor: COLORS.success, borderColor: COLORS.success}]}
          onPress={() => onChange(false)}>
          <Text style={[styles.boolText, !value && {color: '#fff'}]}>Hayır ✅</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, gap: 4, paddingBottom: 32},
  fieldWrap: {marginBottom: 14},
  fieldLabel: {fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6},
  durumRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  durumBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg,
  },
  durumText: {fontSize: 12, color: COLORS.textMuted},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  chip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg,
  },
  chipActive: {backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary},
  chipText: {fontSize: 12, color: COLORS.textMuted},
  chipTextActive: {color: COLORS.primary, fontWeight: '700'},
  boolRow: {flexDirection: 'row', gap: 10},
  boolBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg,
    alignItems: 'center',
  },
  boolText: {fontSize: 13, fontWeight: '700', color: COLORS.textMuted},
  inputWrap: {marginBottom: 14},
  inputLabel: {fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6},
  input: {
    backgroundColor: COLORS.cardBg, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, padding: 12, color: COLORS.textPrimary, fontSize: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8,
  },
  saveBtnText: {fontSize: 16, fontWeight: '800', color: COLORS.darkBg},
});

const shStyles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.darkBg, padding: 10, borderRadius: 8,
    marginTop: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: COLORS.primary,
  },
  title: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
});
