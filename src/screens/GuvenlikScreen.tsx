import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import {COLORS} from '../utils/constants';
import {GuvenlikTest, DurumTipi} from '../types';

const DURUM_OPTS: {value: DurumTipi; label: string; color: string}[] = [
  {value: 'iyi',              label: 'İyi ✅',           color: '#27AE60'},
  {value: 'orta',             label: 'Orta ⚠',           color: '#F39C12'},
  {value: 'kötü',             label: 'Kötü 🔴',          color: '#E74C3C'},
  {value: 'kontrol_edilmedi', label: '–',                 color: '#888888'},
];

export default function GuvenlikScreen() {
  const navigation = useNavigation();
  const {guvenlikTest, saveGuvenlikTest} = useExpertizStore();
  const g = guvenlikTest;

  // Airbag
  const [airbagIsik, setAirbagIsik] = useState(g?.airbagUyariIsigi ?? false);
  const [suruciAirbag, setSuruciAirbag] = useState<DurumTipi>(g?.suruciAirbag ?? 'kontrol_edilmedi');
  const [yolcuAirbag, setYolcuAirbag] = useState<DurumTipi>(g?.yolcuAirbag ?? 'kontrol_edilmedi');
  const [yanSol, setYanSol] = useState<DurumTipi>(g?.yanAirbagSol ?? 'kontrol_edilmedi');
  const [yanSag, setYanSag] = useState<DurumTipi>(g?.yanAirbagSag ?? 'kontrol_edilmedi');
  const [perdeAirbag, setPerdeAirbag] = useState<DurumTipi>(g?.perde_airbag ?? 'kontrol_edilmedi');
  // Emniyet kemeri
  const [kemSolOn, setKemSolOn] = useState<DurumTipi>(g?.solOnKemer ?? 'kontrol_edilmedi');
  const [kemSagOn, setKemSagOn] = useState<DurumTipi>(g?.sagOnKemer ?? 'kontrol_edilmedi');
  const [kemSolArka, setKemSolArka] = useState<DurumTipi>(g?.solArkaKemer ?? 'kontrol_edilmedi');
  const [kemSagArka, setKemSagArka] = useState<DurumTipi>(g?.sagArkaKemer ?? 'kontrol_edilmedi');
  // Koltuklar
  const [suruciKoltuk, setSuruciKoltuk] = useState<DurumTipi>(g?.suruciKoltugu ?? 'kontrol_edilmedi');
  const [yolcuKoltuk, setYolcuKoltuk] = useState<DurumTipi>(g?.yolcuKoltugu ?? 'kontrol_edilmedi');
  const [arkaKoltuk, setArkaKoltuk] = useState<DurumTipi>(g?.arkaKoltuk ?? 'kontrol_edilmedi');
  const [koltukAyar, setKoltukAyar] = useState<DurumTipi>(g?.koltukAyarMekanizması ?? 'kontrol_edilmedi');
  // Kilit
  const [merkeziKilit, setMerkeziKilit] = useState<DurumTipi>(g?.merkeziKilit ?? 'kontrol_edilmedi');
  const [cocukKilidi, setCocukKilidi] = useState<DurumTipi>(g?.cocukKilidi ?? 'kontrol_edilmedi');
  const [notlar, setNotlar] = useState(g?.notlar ?? '');

  const handleKaydet = () => {
    const test: GuvenlikTest = {
      tamamlandi: true,
      airbagUyariIsigi: airbagIsik,
      suruciAirbag, yolcuAirbag,
      yanAirbagSol: yanSol, yanAirbagSag: yanSag,
      perde_airbag: perdeAirbag,
      solOnKemer: kemSolOn, sagOnKemer: kemSagOn,
      solArkaKemer: kemSolArka, sagArkaKemer: kemSagArka,
      suruciKoltugu: suruciKoltuk, yolcuKoltugu: yolcuKoltuk,
      arkaKoltuk, koltukAyarMekanizması: koltukAyar,
      merkeziKilit, cocukKilidi,
      notlar: notlar || undefined,
    };
    saveGuvenlikTest(test);
    Alert.alert('Kaydedildi', 'Airbag & güvenlik testi kaydedildi', [
      {text: 'Tamam', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Airbag ── */}
        <SH icon="airbag" title="Airbag Sistemi" />
        <BoolUyari label="🚨 Airbag Uyarı Işığı Yanıyor mu?" value={airbagIsik} onChange={setAirbagIsik} />

        <Text style={styles.subTitle}>Airbag Durumları</Text>
        <View style={styles.airbagGrid}>
          <AirbagKart label="Sürücü Airbag" icon="steering" value={suruciAirbag} onChange={setSuruciAirbag} />
          <AirbagKart label="Yolcu Airbag" icon="seat-passenger" value={yolcuAirbag} onChange={setYolcuAirbag} />
          <AirbagKart label="Sol Yan Airbag" icon="car-door" value={yanSol} onChange={setYanSol} />
          <AirbagKart label="Sağ Yan Airbag" icon="car-door" value={yanSag} onChange={setYanSag} />
          <AirbagKart label="Perde Airbag" icon="window-shutter" value={perdeAirbag} onChange={setPerdeAirbag} />
        </View>

        {/* ── Emniyet Kemeri ── */}
        <SH icon="seatbelt" title="Emniyet Kemerleri" />
        <View style={styles.kemerGrid}>
          <KemerKart label="Sol Ön" value={kemSolOn} onChange={setKemSolOn} />
          <KemerKart label="Sağ Ön" value={kemSagOn} onChange={setKemSagOn} />
          <KemerKart label="Sol Arka" value={kemSolArka} onChange={setKemSolArka} />
          <KemerKart label="Sağ Arka" value={kemSagArka} onChange={setKemSagArka} />
        </View>

        {/* ── Koltuklar ── */}
        <SH icon="seat" title="Koltuklar" />
        <DurumSecici label="Sürücü Koltuğu" value={suruciKoltuk} onChange={setSuruciKoltuk} />
        <DurumSecici label="Yolcu Koltuğu" value={yolcuKoltuk} onChange={setYolcuKoltuk} />
        <DurumSecici label="Arka Koltuk" value={arkaKoltuk} onChange={setArkaKoltuk} />
        <DurumSecici label="Koltuk Ayar Mekanizması" value={koltukAyar} onChange={setKoltukAyar} />

        {/* ── Kilit Sistemi ── */}
        <SH icon="lock" title="Kilit Sistemi" />
        <DurumSecici label="Merkezi Kilit" value={merkeziKilit} onChange={setMerkeziKilit} />
        <DurumSecici label="Çocuk Kilidi" value={cocukKilidi} onChange={setCocukKilidi} />

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Notlar</Text>
          <TextInput
            style={[styles.input, {height: 80}]}
            value={notlar}
            onChangeText={setNotlar}
            placeholder="Güvenlik sistemleri hakkında gözlemler..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleKaydet}>
          <Icon name="check-circle" size={20} color={COLORS.darkBg} />
          <Text style={styles.saveBtnText}>Güvenlik Testini Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Alt Bileşenler ─────────────────────────────────────────────────────────────

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

function BoolUyari({label, value, onChange}: {label: string; value: boolean; onChange: (v: boolean) => void}) {
  return (
    <View style={[styles.uyariBox, {borderColor: value ? COLORS.danger + '88' : COLORS.success + '88', backgroundColor: value ? COLORS.danger + '15' : COLORS.success + '15'}]}>
      <Text style={[styles.uyariLabel, {color: value ? COLORS.danger : COLORS.textSecondary}]}>{label}</Text>
      <View style={styles.boolRow}>
        <TouchableOpacity
          style={[styles.boolBtn, value && {backgroundColor: COLORS.danger, borderColor: COLORS.danger}]}
          onPress={() => onChange(true)}>
          <Text style={[styles.boolText, value && {color: '#fff'}]}>Evet 🚨</Text>
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

function AirbagKart({label, icon, value, onChange}: {
  label: string; icon: string; value: DurumTipi; onChange: (v: DurumTipi) => void;
}) {
  const colorMap: Record<DurumTipi, string> = {
    iyi: '#27AE60', orta: '#F39C12', kötü: '#E74C3C', kontrol_edilmedi: '#555',
  };
  return (
    <View style={[styles.airbagKart, {borderTopColor: colorMap[value]}]}>
      <Icon name={icon} size={20} color={colorMap[value]} />
      <Text style={styles.airbagKartLabel}>{label}</Text>
      <View style={styles.airbagBtns}>
        {DURUM_OPTS.map(o => (
          <TouchableOpacity
            key={o.value}
            style={[styles.miniBtn, value === o.value && {backgroundColor: o.color}]}
            onPress={() => onChange(o.value)}>
            <Text style={[styles.miniBtnText, value === o.value && {color: '#fff'}]}>
              {o.value === 'iyi' ? '✅' : o.value === 'orta' ? '⚠' : o.value === 'kötü' ? '🔴' : '–'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function KemerKart({label, value, onChange}: {label: string; value: DurumTipi; onChange: (v: DurumTipi) => void}) {
  const colorMap: Record<DurumTipi, string> = {
    iyi: '#27AE60', orta: '#F39C12', kötü: '#E74C3C', kontrol_edilmedi: '#555',
  };
  return (
    <View style={[styles.kemerKart, {borderColor: colorMap[value]}]}>
      <Icon name="seatbelt" size={22} color={colorMap[value]} />
      <Text style={styles.kemerLabel}>{label}</Text>
      <View style={styles.kemerBtns}>
        {DURUM_OPTS.map(o => (
          <TouchableOpacity
            key={o.value}
            style={[styles.miniBtn, value === o.value && {backgroundColor: o.color}]}
            onPress={() => onChange(o.value)}>
            <Text style={[styles.miniBtnText, value === o.value && {color: '#fff'}]}>
              {o.value === 'iyi' ? '✅' : o.value === 'orta' ? '⚠' : o.value === 'kötü' ? '🔴' : '–'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, paddingBottom: 32},
  subTitle: {fontSize: 13, color: COLORS.textMuted, fontWeight: '600', marginBottom: 8},
  fieldWrap: {marginBottom: 14},
  fieldLabel: {fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6},
  durumRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  durumBtn: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg},
  durumText: {fontSize: 12, color: COLORS.textMuted},
  uyariBox: {borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 14, gap: 8},
  uyariLabel: {fontSize: 13, fontWeight: '700'},
  boolRow: {flexDirection: 'row', gap: 10},
  boolBtn: {flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBg, alignItems: 'center'},
  boolText: {fontSize: 13, fontWeight: '700', color: COLORS.textMuted},
  airbagGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8},
  airbagKart: {width: '47%', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 10, gap: 6, borderWidth: 1, borderColor: COLORS.border, borderTopWidth: 3, alignItems: 'center'},
  airbagKartLabel: {fontSize: 11, color: COLORS.textSecondary, textAlign: 'center'},
  airbagBtns: {flexDirection: 'row', gap: 4},
  kemerGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  kemerKart: {width: '47%', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 10, gap: 6, borderWidth: 2, alignItems: 'center'},
  kemerLabel: {fontSize: 11, color: COLORS.textSecondary, textAlign: 'center'},
  kemerBtns: {flexDirection: 'row', gap: 4},
  miniBtn: {width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center'},
  miniBtnText: {fontSize: 11},
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
