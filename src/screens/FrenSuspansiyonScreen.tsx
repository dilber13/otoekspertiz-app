import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import {COLORS} from '../utils/constants';
import {FrenSuspansiyonTest, FrenKontrol, DurumTipi} from '../types';

const DURUM_OPTS: {value: DurumTipi; label: string; color: string}[] = [
  {value: 'iyi',              label: 'İyi',              color: '#27AE60'},
  {value: 'orta',             label: 'Orta',             color: '#F39C12'},
  {value: 'kötü',             label: 'Kötü',             color: '#E74C3C'},
  {value: 'kontrol_edilmedi', label: 'Kontrol Edilmedi', color: '#888888'},
];

// Balata minimum: 2mm kötü, 3-4mm orta, >5mm iyi
function balataRenk(mm: number): string {
  if (mm <= 0) return COLORS.textMuted;
  if (mm <= 2) return '#E74C3C';
  if (mm <= 4) return '#F39C12';
  return '#27AE60';
}

export default function FrenSuspansiyonScreen() {
  const navigation = useNavigation();
  const {frenSuspansiyonTest, saveFrenSuspansiyonTest} = useExpertizStore();
  const t = frenSuspansiyonTest;

  // Fren balataları
  const [balata, setBalata] = useState<FrenKontrol>(
    t?.balataKalinligi ?? {solOn: 0, sagOn: 0, solArka: 0, sagArka: 0},
  );
  const [onDisk, setOnDisk] = useState<DurumTipi>(t?.onDiskDurumu ?? 'kontrol_edilmedi');
  const [arkaDisk, setArkaDisk] = useState<DurumTipi>(t?.arkaDiskDurumu ?? 'kontrol_edilmedi');
  const [hidrolik, setHidrolik] = useState<DurumTipi>(t?.hidrolikSeviyesi ?? 'kontrol_edilmedi');
  const [hidrolikRengi, setHidrolikRengi] = useState(t?.hidrolikRengi ?? 'kontrol_edilmedi');
  const [elFreni, setElFreni] = useState<DurumTipi>(t?.elFreni ?? 'kontrol_edilmedi');
  const [absIsiği, setAbsIsigi] = useState(t?.absUyariIsigi ?? false);
  const [espIsiği, setEspIsigi] = useState(t?.espUyariIsigi ?? false);
  // Süspansiyon
  const [solOnAmor, setSolOnAmor] = useState<DurumTipi>(t?.solOnAmortisör ?? 'kontrol_edilmedi');
  const [sagOnAmor, setSagOnAmor] = useState<DurumTipi>(t?.sagOnAmortisör ?? 'kontrol_edilmedi');
  const [solArkaAmor, setSolArkaAmor] = useState<DurumTipi>(t?.solArkaAmortisör ?? 'kontrol_edilmedi');
  const [sagArkaAmor, setSagArkaAmor] = useState<DurumTipi>(t?.sagArkaAmortisör ?? 'kontrol_edilmedi');
  const [rotRotil, setRotRotil] = useState<DurumTipi>(t?.rotRotil ?? 'kontrol_edilmedi');
  const [burclar, setBurclar] = useState<DurumTipi>(t?.burçlar ?? 'kontrol_edilmedi');
  const [stab, setStab] = useState<DurumTipi>(t?.stabilizatorKolları ?? 'kontrol_edilmedi');
  const [direksiyon, setDireksiyon] = useState<DurumTipi>(t?.direksiyonBoşlugu ?? 'kontrol_edilmedi');
  // Lastikler
  const [solOnLastik, setSolOnLastik] = useState<DurumTipi>(t?.solOnLastik ?? 'kontrol_edilmedi');
  const [sagOnLastik, setSagOnLastik] = useState<DurumTipi>(t?.sagOnLastik ?? 'kontrol_edilmedi');
  const [solArkaLastik, setSolArkaLastik] = useState<DurumTipi>(t?.solArkaLastik ?? 'kontrol_edilmedi');
  const [sagArkaLastik, setSagArkaLastik] = useState<DurumTipi>(t?.sagArkaLastik ?? 'kontrol_edilmedi');
  const [lastikMarka, setLastikMarka] = useState(t?.lastikMarkasi ?? '');
  const [notlar, setNotlar] = useState(t?.notlar ?? '');

  const handleKaydet = () => {
    const test: FrenSuspansiyonTest = {
      tamamlandi: true,
      balataKalinligi: balata,
      onDiskDurumu: onDisk, arkaDiskDurumu: arkaDisk,
      hidrolikSeviyesi: hidrolik, hidrolikRengi: hidrolikRengi as any,
      elFreni, absUyariIsigi: absIsiği, espUyariIsigi: espIsiği,
      solOnAmortisör: solOnAmor, sagOnAmortisör: sagOnAmor,
      solArkaAmortisör: solArkaAmor, sagArkaAmortisör: sagArkaAmor,
      rotRotil, burçlar: burclar, stabilizatorKolları: stab,
      direksiyonBoşlugu: direksiyon, hidrolikYagSeviyesi: 'kontrol_edilmedi',
      solOnLastik, sagOnLastik, solArkaLastik, sagArkaLastik,
      lastikMarkasi: lastikMarka || undefined,
      notlar: notlar || undefined,
    };
    saveFrenSuspansiyonTest(test);
    Alert.alert('Kaydedildi', 'Fren & süspansiyon testi kaydedildi', [
      {text: 'Tamam', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Fren Balataları ── */}
        <SH icon="car-brake-hold" title="Fren Balataları (mm)" />
        <View style={styles.balataGrid}>
          {(['solOn', 'sagOn', 'solArka', 'sagArka'] as const).map(key => {
            const labels = {solOn: 'Sol Ön', sagOn: 'Sağ Ön', solArka: 'Sol Arka', sagArka: 'Sağ Arka'};
            const val = balata[key];
            return (
              <View key={key} style={styles.balataCard}>
                <Text style={styles.balataLabel}>{labels[key]}</Text>
                <TextInput
                  style={[styles.balataInput, {borderColor: balataRenk(val)}]}
                  value={val > 0 ? val.toString() : ''}
                  onChangeText={v => setBalata(b => ({...b, [key]: parseFloat(v) || 0}))}
                  keyboardType="numeric"
                  placeholder="mm"
                  placeholderTextColor={COLORS.textMuted}
                />
                <Text style={[styles.balataStatus, {color: balataRenk(val)}]}>
                  {val <= 0 ? '–' : val <= 2 ? 'Değiştir!' : val <= 4 ? 'Az Kaldı' : 'İyi'}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.balataRef}>
          <Icon name="information-outline" size={13} color={COLORS.textMuted} />
          <Text style={styles.refText}>Referans: &lt;2mm=kırmızı | 2-4mm=sarı | &gt;5mm=yeşil</Text>
        </View>

        {/* ── Fren Diskleri ── */}
        <SH icon="disc" title="Fren Diskleri" />
        <DurumSecici label="Ön Diskler" value={onDisk} onChange={setOnDisk} />
        <DurumSecici label="Arka Diskler" value={arkaDisk} onChange={setArkaDisk} />

        {/* ── Fren Hidroliği ── */}
        <SH icon="hydraulic-oil-temperature" title="Fren Hidroliği" />
        <DurumSecici label="Hidrolik Seviyesi" value={hidrolik} onChange={setHidrolik} />
        <ChipSecici
          label="Hidrolik Rengi"
          value={hidrolikRengi}
          options={[
            {value: 'sarı', label: '✅ Sarı / Temiz'},
            {value: 'kahverengi', label: '⚠ Kahverengi'},
            {value: 'koyu', label: '🔴 Koyu / Kirli'},
            {value: 'kontrol_edilmedi', label: 'Kontrol Edilmedi'},
          ]}
          onChange={setHidrolikRengi}
        />
        <DurumSecici label="El Freni" value={elFreni} onChange={setElFreni} />
        <BoolSecici label="ABS Uyarı Işığı Var mı?" value={absIsiği} onChange={setAbsIsigi} uyari />
        <BoolSecici label="ESP Uyarı Işığı Var mı?" value={espIsiği} onChange={setEspIsigi} uyari />

        {/* ── Süspansiyon ── */}
        <SH icon="car-suspension" title="Amortisörler" />
        <View style={styles.amortGrid}>
          <AmorCard label="Sol Ön" value={solOnAmor} onChange={setSolOnAmor} />
          <AmorCard label="Sağ Ön" value={sagOnAmor} onChange={setSagOnAmor} />
          <AmorCard label="Sol Arka" value={solArkaAmor} onChange={setSolArkaAmor} />
          <AmorCard label="Sağ Arka" value={sagArkaAmor} onChange={setSagArkaAmor} />
        </View>

        <SH icon="wrench" title="Alt Takım" />
        <DurumSecici label="Rot – Rotil" value={rotRotil} onChange={setRotRotil} />
        <DurumSecici label="Burçlar" value={burclar} onChange={setBurclar} />
        <DurumSecici label="Stabilizatör Kolları" value={stab} onChange={setStab} />
        <DurumSecici label="Direksiyon Boşluğu" value={direksiyon} onChange={setDireksiyon} />

        {/* ── Lastikler ── */}
        <SH icon="tire" title="Lastikler" />
        <View style={styles.amortGrid}>
          <AmorCard label="Sol Ön" value={solOnLastik} onChange={setSolOnLastik} />
          <AmorCard label="Sağ Ön" value={sagOnLastik} onChange={setSagOnLastik} />
          <AmorCard label="Sol Arka" value={solArkaLastik} onChange={setSolArkaLastik} />
          <AmorCard label="Sağ Arka" value={sagArkaLastik} onChange={setSagArkaLastik} />
        </View>
        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Lastik Markası</Text>
          <TextInput
            style={styles.input}
            value={lastikMarka}
            onChangeText={setLastikMarka}
            placeholder="Michelin, Pirelli, Bridgestone..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Genel Notlar</Text>
          <TextInput
            style={[styles.input, {height: 80}]}
            value={notlar}
            onChangeText={setNotlar}
            placeholder="Fren/süspansiyon gözlemleriniz..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleKaydet}>
          <Icon name="check-circle" size={20} color={COLORS.darkBg} />
          <Text style={styles.saveBtnText}>Fren & Süspansiyon Testini Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Yardımcı Bileşenler ───────────────────────────────────────────────────────

function SH({icon, title}: {icon: string; title: string}) {
  return (
    <View style={shStyles.header}>
      <Icon name={icon} size={18} color={COLORS.primary} />
      <Text style={shStyles.title}>{title}</Text>
    </View>
  );
}

function DurumSecici({label, value, onChange}: {label: string; value: DurumTipi; onChange: (v: DurumTipi) => void}) {
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
  label: string; value: string;
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

function BoolSecici({label, value, onChange, uyari}: {
  label: string; value: boolean; onChange: (v: boolean) => void; uyari?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.boolRow}>
        <TouchableOpacity
          style={[styles.boolBtn, value && {backgroundColor: uyari ? COLORS.danger : COLORS.success, borderColor: uyari ? COLORS.danger : COLORS.success}]}
          onPress={() => onChange(true)}>
          <Text style={[styles.boolText, value && {color: '#fff'}]}>Evet</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.boolBtn, !value && {backgroundColor: uyari ? COLORS.success : COLORS.danger, borderColor: uyari ? COLORS.success : COLORS.danger}]}
          onPress={() => onChange(false)}>
          <Text style={[styles.boolText, !value && {color: '#fff'}]}>Hayır</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AmorCard({label, value, onChange}: {label: string; value: DurumTipi; onChange: (v: DurumTipi) => void}) {
  const colorMap: Record<DurumTipi, string> = {
    iyi: '#27AE60', orta: '#F39C12', kötü: '#E74C3C', kontrol_edilmedi: '#555',
  };
  return (
    <View style={styles.amorCard}>
      <Text style={styles.amorLabel}>{label}</Text>
      {DURUM_OPTS.filter(o => o.value !== 'kontrol_edilmedi').map(o => (
        <TouchableOpacity
          key={o.value}
          style={[styles.amorBtn, value === o.value && {backgroundColor: o.color}]}
          onPress={() => onChange(o.value)}>
          <Text style={[styles.amorText, value === o.value && {color: '#fff', fontWeight: '700'}]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[styles.amorBtn, value === 'kontrol_edilmedi' && {backgroundColor: '#555'}]}
        onPress={() => onChange('kontrol_edilmedi')}>
        <Text style={[styles.amorText, value === 'kontrol_edilmedi' && {color: '#fff'}]}>–</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, paddingBottom: 32},
  fieldWrap: {marginBottom: 14},
  fieldLabel: {fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6},
  durumRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  durumBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg,
  },
  durumText: {fontSize: 12, color: COLORS.textMuted},
  chipRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  chip: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg},
  chipActive: {backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary},
  chipText: {fontSize: 12, color: COLORS.textMuted},
  chipTextActive: {color: COLORS.primary, fontWeight: '700'},
  boolRow: {flexDirection: 'row', gap: 10},
  boolBtn: {flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg, alignItems: 'center'},
  boolText: {fontSize: 13, fontWeight: '700', color: COLORS.textMuted},
  balataGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 6},
  balataCard: {width: '47%', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 10, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border},
  balataLabel: {fontSize: 12, color: COLORS.textMuted},
  balataInput: {width: '100%', backgroundColor: COLORS.background, borderRadius: 8, borderWidth: 2, padding: 8, color: COLORS.textPrimary, fontSize: 18, fontWeight: '800', textAlign: 'center'},
  balataStatus: {fontSize: 11, fontWeight: '700'},
  balataRef: {flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8},
  refText: {fontSize: 11, color: COLORS.textMuted},
  amortGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  amorCard: {width: '47%', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 10, gap: 4, borderWidth: 1, borderColor: COLORS.border},
  amorLabel: {fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4},
  amorBtn: {paddingVertical: 5, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border},
  amorText: {fontSize: 11, color: COLORS.textMuted, textAlign: 'center'},
  inputWrap: {marginBottom: 14},
  inputLabel: {fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6},
  input: {backgroundColor: COLORS.cardBg, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, padding: 12, color: COLORS.textPrimary, fontSize: 14},
  saveBtn: {backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8},
  saveBtnText: {fontSize: 16, fontWeight: '800', color: COLORS.darkBg},
});

const shStyles = StyleSheet.create({
  header: {flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.darkBg, padding: 10, borderRadius: 8, marginTop: 8, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: COLORS.primary},
  title: {fontSize: 14, fontWeight: '700', color: COLORS.textPrimary},
});
