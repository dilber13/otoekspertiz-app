import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import uuid from 'react-native-uuid';
import {useExpertizStore} from '../store/useExpertizStore';
import {COLORS, CAR_BRANDS, FUEL_TYPES} from '../utils/constants';
import {formatPlate} from '../utils/helpers';
import {Vehicle, RootStackParamList} from '../types';

type RouteType = RouteProp<RootStackParamList, 'VehicleForm'>;

export default function VehicleFormScreen() {
  const navigation = useNavigation();
  const {currentVehicle, setCurrentVehicle} = useExpertizStore();

  const [plate, setPlate] = useState(currentVehicle?.plate ?? '');
  const [brand, setBrand] = useState(currentVehicle?.brand ?? '');
  const [model, setModel] = useState(currentVehicle?.model ?? '');
  const [year, setYear] = useState(currentVehicle?.year?.toString() ?? '');
  const [engineCC, setEngineCC] = useState(currentVehicle?.engineCC?.toString() ?? '');
  const [fuelType, setFuelType] = useState<Vehicle['fuelType']>(currentVehicle?.fuelType ?? 'benzin');
  const [color, setColor] = useState(currentVehicle?.color ?? '');
  const [chassisNo, setChassisNo] = useState(currentVehicle?.chassisNo ?? '');
  const [engineNo, setEngineNo] = useState(currentVehicle?.engineNo ?? '');
  const [km, setKm] = useState(currentVehicle?.km?.toString() ?? '');
  const [ownerName, setOwnerName] = useState(currentVehicle?.ownerName ?? '');
  const [ownerPhone, setOwnerPhone] = useState(currentVehicle?.ownerPhone ?? '');
  const [showBrandPicker, setShowBrandPicker] = useState(false);

  const handleSave = () => {
    if (!plate.trim()) {
      Alert.alert('Hata', 'Plaka alanı zorunludur');
      return;
    }
    if (!brand.trim()) {
      Alert.alert('Hata', 'Marka alanı zorunludur');
      return;
    }
    if (!model.trim()) {
      Alert.alert('Hata', 'Model alanı zorunludur');
      return;
    }
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
      Alert.alert('Hata', 'Geçerli bir yıl girin');
      return;
    }

    const vehicle: Vehicle = {
      id: currentVehicle?.id ?? (uuid.v4() as string),
      plate: formatPlate(plate),
      brand: brand.trim(),
      model: model.trim(),
      year: yearNum,
      engineCC: parseInt(engineCC) || 0,
      fuelType,
      color: color.trim(),
      chassisNo: chassisNo.trim(),
      engineNo: engineNo.trim(),
      km: parseInt(km) || 0,
      ownerName: ownerName.trim(),
      ownerPhone: ownerPhone.trim(),
      inspectionDate: new Date().toISOString(),
    };

    setCurrentVehicle(vehicle);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Plaka */}
          <FormSection icon="card-text" title="Plaka Bilgisi">
            <FormInput
              label="Plaka *"
              value={plate}
              onChangeText={t => setPlate(t.toUpperCase())}
              placeholder="34 ABC 1234"
              autoCapitalize="characters"
            />
          </FormSection>

          {/* Araç Bilgileri */}
          <FormSection icon="car" title="Araç Bilgileri">
            <TouchableOpacity
              style={styles.pickerBtn}
              onPress={() => setShowBrandPicker(!showBrandPicker)}>
              <Text style={styles.pickerLabel}>Marka *</Text>
              <View style={styles.pickerValue}>
                <Text style={brand ? styles.pickerText : styles.pickerPlaceholder}>
                  {brand || 'Marka seçin'}
                </Text>
                <Icon name={showBrandPicker ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>

            {showBrandPicker && (
              <View style={styles.brandList}>
                {CAR_BRANDS.map(b => (
                  <TouchableOpacity
                    key={b}
                    style={[styles.brandItem, brand === b && styles.brandItemActive]}
                    onPress={() => {
                      setBrand(b);
                      setShowBrandPicker(false);
                    }}>
                    <Text style={[styles.brandText, brand === b && styles.brandTextActive]}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <FormInput label="Model *" value={model} onChangeText={setModel} placeholder="Corolla, Golf, 320i..." />
            <FormInput label="Yıl *" value={year} onChangeText={setYear} placeholder="2018" keyboardType="numeric" />
            <FormInput label="Motor Hacmi (cc)" value={engineCC} onChangeText={setEngineCC} placeholder="1600" keyboardType="numeric" />
            <FormInput label="Renk" value={color} onChangeText={setColor} placeholder="Beyaz" />
          </FormSection>

          {/* Yakıt Tipi */}
          <FormSection icon="gas-station" title="Yakıt Tipi">
            <View style={styles.fuelRow}>
              {FUEL_TYPES.map(f => (
                <TouchableOpacity
                  key={f.value}
                  style={[styles.fuelBtn, fuelType === f.value && styles.fuelBtnActive]}
                  onPress={() => setFuelType(f.value)}>
                  <Text style={[styles.fuelText, fuelType === f.value && styles.fuelTextActive]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </FormSection>

          {/* Teknik Bilgiler */}
          <FormSection icon="identifier" title="Teknik Bilgiler">
            <FormInput
              label="Şasi No (VIN)"
              value={chassisNo}
              onChangeText={setChassisNo}
              placeholder="WBA1234567890ABCD"
              autoCapitalize="characters"
            />
            <FormInput
              label="Motor No"
              value={engineNo}
              onChangeText={setEngineNo}
              placeholder="B16..."
              autoCapitalize="characters"
            />
            <FormInput
              label="Kilometre"
              value={km}
              onChangeText={setKm}
              placeholder="85000"
              keyboardType="numeric"
            />
          </FormSection>

          {/* Araç Sahibi */}
          <FormSection icon="account" title="Araç Sahibi (İsteğe Bağlı)">
            <FormInput label="Ad Soyad" value={ownerName} onChangeText={setOwnerName} placeholder="Mehmet Yılmaz" />
            <FormInput
              label="Telefon"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              placeholder="0555 123 4567"
              keyboardType="phone-pad"
            />
          </FormSection>

          {/* Kaydet */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Icon name="check-circle" size={22} color={COLORS.darkBg} />
            <Text style={styles.saveBtnText}>Araç Bilgilerini Kaydet</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Alt Bileşenler ─────────────────────────────────────────────────────────────

function FormSection({icon, title, children}: {icon: string; title: string; children: React.ReactNode}) {
  return (
    <View style={formSectionStyles.container}>
      <View style={formSectionStyles.header}>
        <Icon name={icon} size={16} color={COLORS.primary} />
        <Text style={formSectionStyles.title}>{title}</Text>
      </View>
      <View style={formSectionStyles.body}>{children}</View>
    </View>
  );
}

function FormInput({
  label, value, onChangeText, placeholder, keyboardType, autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={inputStyles.container}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={inputStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'words'}
      />
    </View>
  );
}

// ── Stiller ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  kav: {flex: 1},
  scroll: {flex: 1},
  content: {padding: 16, gap: 16, paddingBottom: 32},
  pickerBtn: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  pickerLabel: {fontSize: 11, color: COLORS.textMuted, marginBottom: 4},
  pickerValue: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  pickerText: {fontSize: 14, color: COLORS.textPrimary},
  pickerPlaceholder: {fontSize: 14, color: COLORS.textMuted},
  brandList: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    maxHeight: 200,
    marginBottom: 8,
    overflow: 'hidden',
  },
  brandItem: {paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border},
  brandItemActive: {backgroundColor: COLORS.primary + '22'},
  brandText: {fontSize: 14, color: COLORS.textPrimary},
  brandTextActive: {color: COLORS.primary, fontWeight: '700'},
  fuelRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  fuelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  fuelBtnActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  fuelText: {fontSize: 13, color: COLORS.textMuted, fontWeight: '600'},
  fuelTextActive: {color: COLORS.darkBg},
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveBtnText: {fontSize: 16, fontWeight: '800', color: COLORS.darkBg},
});

const formSectionStyles = StyleSheet.create({
  container: {backgroundColor: COLORS.cardBg, borderRadius: 12, overflow: 'hidden'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: COLORS.darkBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {fontSize: 13, fontWeight: '700', color: COLORS.textPrimary},
  body: {padding: 12, gap: 4},
});

const inputStyles = StyleSheet.create({
  container: {marginBottom: 8},
  label: {fontSize: 11, color: COLORS.textMuted, marginBottom: 4},
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
});
