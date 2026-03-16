import React, {useState} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useExpertizStore} from '../store/useExpertizStore';
import {COLORS} from '../utils/constants';
import {GorselKontrolTest, DurumTipi} from '../types';

type DurumState = [DurumTipi, React.Dispatch<React.SetStateAction<DurumTipi>>];

function useDurum(initial: DurumTipi = 'kontrol_edilmedi'): DurumState {
  return useState<DurumTipi>(initial);
}

export default function GorselKontrolScreen() {
  const navigation = useNavigation();
  const {gorselTest, saveGorselTest} = useExpertizStore();
  const g = gorselTest;

  // Dış
  const [onCam, setOnCam] = useDurum(g?.onCam);
  const [arkaCam, setArkaCam] = useDurum(g?.arkaCam);
  const [solOnCam, setSolOnCam] = useDurum(g?.solOnCam);
  const [sagOnCam, setSagOnCam] = useDurum(g?.sagOnCam);
  const [solArkaCam, setSolArkaCam] = useDurum(g?.solArkaCam);
  const [sagArkaCam, setSagArkaCam] = useDurum(g?.sagArkaCam);
  const [solAyna, setSolAyna] = useDurum(g?.solAyna);
  const [sagAyna, setSagAyna] = useDurum(g?.sagAyna);
  const [farlar, setFarlar] = useDurum(g?.farlar);
  const [stoplar, setStoplar] = useDurum(g?.stoplar);
  const [sinyal, setSinyal] = useDurum(g?.sinyal);
  const [egzozBorusu, setEgzozBorusu] = useDurum(g?.egzozBorusu);
  // İç
  const [klima, setKlima] = useDurum(g?.klima);
  const [muzik, setMuzik] = useDurum(g?.muzikSistemi);
  const [navigasyon, setNavigasyon] = useDurum(g?.navigasyon);
  const [gosterge, setGosterge] = useDurum(g?.gostergePaneli);
  const [direksiyon, setDireksiyon] = useDurum(g?.direksiyon);
  const [tavan, setTavan] = useDurum(g?.tavan);
  const [doseme, setDoseme] = useDurum(g?.doseme);
  const [hali, setHali] = useDurum(g?.hali);
  // Bagaj
  const [bagajAcilis, setBagajAcilis] = useDurum(g?.bagajAcilis);
  const [rezervLastik, setRezervLastik] = useDurum(g?.rezervLastik);
  const [kriko, setKriko] = useDurum(g?.kriko);
  const [notlar, setNotlar] = useState(g?.notlar ?? '');

  const handleKaydet = () => {
    const test: GorselKontrolTest = {
      tamamlandi: true,
      onCam, arkaCam, solOnCam, sagOnCam, solArkaCam, sagArkaCam,
      solAyna, sagAyna, farlar, stoplar, sinyal, egzozBorusu,
      klima, muzikSistemi: muzik, navigasyon, gostergePaneli: gosterge,
      direksiyon, tavan, doseme, hali,
      bagajAcilis, rezervLastik, kriko,
      notlar: notlar || undefined,
    };
    saveGorselTest(test);
    Alert.alert('Kaydedildi', 'Görsel kontrol kaydedildi', [
      {text: 'Tamam', onPress: () => navigation.goBack()},
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Dış Görsel ── */}
        <SH icon="car-outline" title="Dış Görsel Kontrol" />
        <ChecklistGrid items={[
          {label: 'Ön Cam', value: onCam, onChange: setOnCam},
          {label: 'Arka Cam', value: arkaCam, onChange: setArkaCam},
          {label: 'Sol Ön Cam', value: solOnCam, onChange: setSolOnCam},
          {label: 'Sağ Ön Cam', value: sagOnCam, onChange: setSagOnCam},
          {label: 'Sol Arka Cam', value: solArkaCam, onChange: setSolArkaCam},
          {label: 'Sağ Arka Cam', value: sagArkaCam, onChange: setSagArkaCam},
          {label: 'Sol Ayna', value: solAyna, onChange: setSolAyna},
          {label: 'Sağ Ayna', value: sagAyna, onChange: setSagAyna},
          {label: 'Farlar', value: farlar, onChange: setFarlar},
          {label: 'Stop Lambaları', value: stoplar, onChange: setStoplar},
          {label: 'Sinyal Lambaları', value: sinyal, onChange: setSinyal},
          {label: 'Egzoz Borusu', value: egzozBorusu, onChange: setEgzozBorusu},
        ]} />

        {/* ── İç Görsel ── */}
        <SH icon="car-seat" title="İç Mekan Kontrolü" />
        <ChecklistGrid items={[
          {label: 'Klima', value: klima, onChange: setKlima},
          {label: 'Müzik / Radyo', value: muzik, onChange: setMuzik},
          {label: 'Navigasyon', value: navigasyon, onChange: setNavigasyon},
          {label: 'Gösterge Paneli', value: gosterge, onChange: setGosterge},
          {label: 'Direksiyon', value: direksiyon, onChange: setDireksiyon},
          {label: 'Tavan / Döşeme', value: tavan, onChange: setTavan},
          {label: 'Koltuk Döşemesi', value: doseme, onChange: setDoseme},
          {label: 'Halı / Paspas', value: hali, onChange: setHali},
        ]} />

        {/* ── Bagaj ── */}
        <SH icon="car-back" title="Bagaj Kontrolü" />
        <ChecklistGrid items={[
          {label: 'Bagaj Açılış Mek.', value: bagajAcilis, onChange: setBagajAcilis},
          {label: 'Rezerv Lastik', value: rezervLastik, onChange: setRezervLastik},
          {label: 'Kriko / Alet Takımı', value: kriko, onChange: setKriko},
        ]} />

        <View style={styles.inputWrap}>
          <Text style={styles.inputLabel}>Notlar</Text>
          <TextInput
            style={[styles.input, {height: 80}]}
            value={notlar}
            onChangeText={setNotlar}
            placeholder="Görsel kontrol gözlemleri..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleKaydet}>
          <Icon name="check-circle" size={20} color={COLORS.darkBg} />
          <Text style={styles.saveBtnText}>Görsel Kontrolü Kaydet</Text>
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

function ChecklistGrid({items}: {
  items: {label: string; value: DurumTipi; onChange: (v: DurumTipi) => void}[];
}) {
  return (
    <View style={styles.checkGrid}>
      {items.map(item => (
        <CheckItem key={item.label} {...item} />
      ))}
    </View>
  );
}

function CheckItem({label, value, onChange}: {
  label: string; value: DurumTipi; onChange: (v: DurumTipi) => void;
}) {
  const colorMap: Record<DurumTipi, string> = {
    iyi: '#27AE60', orta: '#F39C12', kötü: '#E74C3C', kontrol_edilmedi: '#555',
  };
  const iconMap: Record<DurumTipi, string> = {
    iyi: 'check-circle', orta: 'alert-circle', kötü: 'close-circle', kontrol_edilmedi: 'minus-circle',
  };

  return (
    <View style={[styles.checkItem, {borderLeftColor: colorMap[value]}]}>
      <Text style={styles.checkLabel}>{label}</Text>
      <View style={styles.checkBtns}>
        {(['iyi', 'orta', 'kötü', 'kontrol_edilmedi'] as DurumTipi[]).map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.checkBtn, value === d && {backgroundColor: colorMap[d]}]}
            onPress={() => onChange(d)}>
            <Icon
              name={iconMap[d]}
              size={16}
              color={value === d ? '#fff' : colorMap[d]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  content: {padding: 16, paddingBottom: 32},
  checkGrid: {gap: 6, marginBottom: 8},
  checkItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg, borderRadius: 8, padding: 10,
    borderWidth: 1, borderColor: COLORS.border, borderLeftWidth: 3,
  },
  checkLabel: {fontSize: 13, color: COLORS.textPrimary, flex: 1},
  checkBtns: {flexDirection: 'row', gap: 4},
  checkBtn: {
    width: 30, height: 30, borderRadius: 8, justifyContent: 'center',
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
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
