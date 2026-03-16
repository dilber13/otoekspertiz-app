import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import {COLORS} from '../utils/constants';
import {YanalKaymaTest} from '../types';

const LIMIT = 5; // m/km standart limit

function sonucRenk(val: number | null): string {
  if (val === null) return COLORS.textMuted;
  return Math.abs(val) <= LIMIT ? '#27AE60' : '#E74C3C';
}

function sonucEtiketi(val: number | null): 'geçti' | 'kaldı' | 'ölçülmedi' {
  if (val === null) return 'ölçülmedi';
  return Math.abs(val) <= LIMIT ? 'geçti' : 'kaldı';
}

export default function YanalKaymaScreen() {
  const navigation = useNavigation();
  const {yanalKaymaTest, saveYanalKaymaTest} = useExpertizStore();
  const t = yanalKaymaTest;

  const [onAks, setOnAks] = useState<string>(t?.onAksDegeri?.toString() ?? '');
  const [arkaAks, setArkaAks] = useState<string>(t?.arkaAksDegeri?.toString() ?? '');
  const [onKamber, setOnKamber] = useState<string>(t?.onKamber?.toString() ?? '');
  const [onKaster, setOnKaster] = useState<string>(t?.onKaster?.toString() ?? '');
  const [onToe, setOnToe] = useState<string>(t?.onToe?.toString() ?? '');
  const [arkaKamber, setArkaKamber] = useState<string>(t?.arkaKamber?.toString() ?? '');
  const [arkaToe, setArkaToe] = useState<string>(t?.arkaToe?.toString() ?? '');
  const [notlar, setNotlar] = useState<string>(t?.notlar ?? '');

  const onAksNum = onAks !== '' ? parseFloat(onAks) : null;
  const arkaAksNum = arkaAks !== '' ? parseFloat(arkaAks) : null;
  const onSonuc = sonucEtiketi(onAksNum);
  const arkaSonuc = sonucEtiketi(arkaAksNum);

  const handleKaydet = () => {
    const test: YanalKaymaTest = {
      tamamlandi: true,
      onAksDegeri: onAksNum,
      arkaAksDegeri: arkaAksNum,
      onKamber: onKamber !== '' ? parseFloat(onKamber) : null,
      onKaster: onKaster !== '' ? parseFloat(onKaster) : null,
      onToe: onToe !== '' ? parseFloat(onToe) : null,
      arkaKamber: arkaKamber !== '' ? parseFloat(arkaKamber) : null,
      arkaToe: arkaToe !== '' ? parseFloat(arkaToe) : null,
      onAksSonuc: onSonuc,
      arkaAksSonuc: arkaSonuc,
      notlar: notlar || undefined,
    };
    saveYanalKaymaTest(test);
    Alert.alert('Kaydedildi', 'Yanal kayma testi kaydedildi', [
      {text: 'Tamam', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Bilgi Kartı */}
        <View style={styles.infoCard}>
          <Icon name="information" size={18} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Yanal kayma testi (slip test) cihazından okunan değerleri girin.{'\n'}
            Standart limit: <Text style={styles.infoBold}>±{LIMIT} m/km</Text>
          </Text>
        </View>

        {/* ── Yanal Kayma Değerleri ── */}
        <SH icon="car-traction-control" title="Yanal Kayma Değerleri (m/km)" />

        <View style={styles.aksGrid}>
          {/* Ön Aks */}
          <View style={[styles.aksCard, {borderColor: sonucRenk(onAksNum)}]}>
            <Text style={styles.aksLabel}>ÖN AKS</Text>
            <TextInput
              style={[styles.aksInput, {color: sonucRenk(onAksNum)}]}
              value={onAks}
              onChangeText={setOnAks}
              placeholder="0.0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.aksUnit}>m/km</Text>
            <View style={[styles.sonucBadge, {backgroundColor: sonucRenk(onAksNum)}]}>
              <Icon
                name={onSonuc === 'geçti' ? 'check-circle' : onSonuc === 'kaldı' ? 'close-circle' : 'minus-circle'}
                size={14} color="#fff"
              />
              <Text style={styles.sonucText}>
                {onSonuc === 'geçti' ? 'GEÇTİ' : onSonuc === 'kaldı' ? 'KALDI' : 'ÖLÇÜLMEDİ'}
              </Text>
            </View>
          </View>

          {/* Arka Aks */}
          <View style={[styles.aksCard, {borderColor: sonucRenk(arkaAksNum)}]}>
            <Text style={styles.aksLabel}>ARKA AKS</Text>
            <TextInput
              style={[styles.aksInput, {color: sonucRenk(arkaAksNum)}]}
              value={arkaAks}
              onChangeText={setArkaAks}
              placeholder="0.0"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.aksUnit}>m/km</Text>
            <View style={[styles.sonucBadge, {backgroundColor: sonucRenk(arkaAksNum)}]}>
              <Icon
                name={arkaSonuc === 'geçti' ? 'check-circle' : arkaSonuc === 'kaldı' ? 'close-circle' : 'minus-circle'}
                size={14} color="#fff"
              />
              <Text style={styles.sonucText}>
                {arkaSonuc === 'geçti' ? 'GEÇTİ' : arkaSonuc === 'kaldı' ? 'KALDI' : 'ÖLÇÜLMEDİ'}
              </Text>
            </View>
          </View>
        </View>

        {/* Limit Göstergesi */}
        <View style={styles.limitRow}>
          <View style={styles.limitItem}>
            <View style={[styles.limitDot, {backgroundColor: '#27AE60'}]} />
            <Text style={styles.limitText}>–{LIMIT} ile +{LIMIT} m/km arası = GEÇTİ</Text>
          </View>
          <View style={styles.limitItem}>
            <View style={[styles.limitDot, {backgroundColor: '#E74C3C'}]} />
            <Text style={styles.limitText}>±{LIMIT} m/km aşımı = KALDI</Text>
          </View>
        </View>

        {/* ── Ön Düzen Ölçümleri ── */}
        <SH icon="angle-acute" title="Ön Düzen Ölçümleri (İsteğe Bağlı)" />
        <View style={styles.oelcumGrid}>
          <OlcumInput label="Ön Kamber (°)" value={onKamber} onChange={setOnKamber} ref_={'-0.5° ~ -1.5°'} />
          <OlcumInput label="Ön Kaster (°)" value={onKaster} onChange={setOnKaster} ref_={'3° ~ 7°'} />
          <OlcumInput label="Ön Toe (mm)" value={onToe} onChange={setOnToe} ref_={'0 ~ +2 mm'} />
          <OlcumInput label="Arka Kamber (°)" value={arkaKamber} onChange={setArkaKamber} ref_={'0° ~ -1°'} />
          <OlcumInput label="Arka Toe (mm)" value={arkaToe} onChange={setArkaToe} ref_={'0 ~ +2 mm'} />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Notlar</Text>
          <TextInput
            style={[styles.input, {height: 80}]}
            value={notlar}
            onChangeText={setNotlar}
            placeholder="Yanal kayma ve ön düzen gözlemleri..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleKaydet}>
          <Icon name="check-circle" size={20} color={COLORS.darkBg} />
          <Text style={styles.saveBtnText}>Yanal Kayma Testini Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SH({icon, title}: {icon: string; title: string}) {
  return (
    <View style={shStyles.header}>
      <Icon name={icon} size={18} color={COLORS.primary} />
      <Text style={shStyles.title}>{title}</Text>
    </View>
  );
}

function OlcumInput({label, value, onChange, ref_}: {
  label: string; value: string; onChange: (v: string) => void; ref_: string;
}) {
  return (
    <View style={styles.olcumCard}>
      <Text style={styles.olcumLabel}>{label}</Text>
      <TextInput
        style={styles.olcumInput}
        value={value}
        onChangeText={onChange}
        placeholder="–"
        placeholderTextColor={COLORS.textMuted}
        keyboardType="numeric"
      />
      <Text style={styles.olcumRef}>Ref: {ref_}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, paddingBottom: 32},
  infoCard: {
    flexDirection: 'row', gap: 10, backgroundColor: COLORS.primary + '15',
    borderRadius: 10, padding: 12, borderWidth: 1, borderColor: COLORS.primary + '44', marginBottom: 16,
  },
  infoText: {flex: 1, fontSize: 13, color: COLORS.textSecondary, lineHeight: 20},
  infoBold: {color: COLORS.primary, fontWeight: '800'},
  aksGrid: {flexDirection: 'row', gap: 12, marginBottom: 8},
  aksCard: {
    flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 14, padding: 16,
    alignItems: 'center', borderWidth: 2, gap: 4,
  },
  aksLabel: {fontSize: 12, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 1},
  aksInput: {fontSize: 36, fontWeight: '900', textAlign: 'center', width: '100%'},
  aksUnit: {fontSize: 12, color: COLORS.textMuted},
  sonucBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 4,
  },
  sonucText: {fontSize: 11, fontWeight: '800', color: '#fff'},
  limitRow: {gap: 4, marginBottom: 8},
  limitItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  limitDot: {width: 8, height: 8, borderRadius: 4},
  limitText: {fontSize: 11, color: COLORS.textMuted},
  oelcumGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12},
  olcumCard: {
    width: '47%', backgroundColor: COLORS.cardBg, borderRadius: 10,
    padding: 10, borderWidth: 1, borderColor: COLORS.border,
  },
  olcumLabel: {fontSize: 11, color: COLORS.textMuted, marginBottom: 4},
  olcumInput: {
    backgroundColor: COLORS.background, borderRadius: 6, borderWidth: 1,
    borderColor: COLORS.border, padding: 8, color: COLORS.textPrimary,
    fontSize: 16, fontWeight: '700', textAlign: 'center',
  },
  olcumRef: {fontSize: 10, color: COLORS.textMuted, marginTop: 3},
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
