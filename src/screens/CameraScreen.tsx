import React, {useState, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, SafeAreaView, Alert, FlatList, Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import uuid from 'react-native-uuid';
import {useExpertizStore} from '../store/useExpertizStore';
import DamageMarker from '../components/DamageMarker';
import {COLORS, CAR_PANELS, DAMAGE_TYPES, PAINT_REFERENCE, PAINT_REFERENCE_DEFAULT} from '../utils/constants';
import {evaluatePaint} from '../utils/helpers';
import {CarPanel, DamageType, DamageArea, PaintMeasurement, PaintCondition} from '../types';

export default function CameraScreen() {
  const {damageAreas, paintMeasurements, photos, addDamageArea, removeDamageArea,
         addPaintMeasurement, updatePaintMeasurement, addPhoto} = useExpertizStore();

  const [activeTab, setActiveTab] = useState<'damage' | 'paint' | 'photos'>('damage');
  const [showAddDamage, setShowAddDamage] = useState(false);

  // Form state
  const [selectedPanel, setSelectedPanel] = useState<CarPanel>('ön_tampon');
  const [selectedDamage, setSelectedDamage] = useState<DamageType>('ezik');
  const [severity, setSeverity] = useState<1|2|3|4|5>(2);
  const [notes, setNotes] = useState('');

  // Boya ölçüm state
  const [paintPanel, setPaintPanel] = useState<CarPanel>('ön_kaput');
  const [paintThickness, setPaintThickness] = useState('');
  const [paintNotes, setPaintNotes] = useState('');

  const handleAddDamage = useCallback(() => {
    const area: DamageArea = {
      id: uuid.v4() as string,
      panel: selectedPanel,
      damageType: selectedDamage,
      severity,
      notes: notes || undefined,
      x: 0.5,
      y: 0.5,
    };
    addDamageArea(area);
    setNotes('');
    setShowAddDamage(false);
  }, [selectedPanel, selectedDamage, severity, notes]);

  const handleAddPaint = useCallback(() => {
    const thickness = parseFloat(paintThickness);
    if (isNaN(thickness) || thickness <= 0) {
      Alert.alert('Hata', 'Geçerli bir ölçüm değeri girin');
      return;
    }
    const ref = PAINT_REFERENCE[paintPanel] ?? PAINT_REFERENCE_DEFAULT;
    const evaluation = evaluatePaint(paintPanel, thickness);
    const condition: PaintCondition = evaluation.ok ? 'orijinal' : 'yeniden_boyalı';

    const existing = paintMeasurements.find(p => p.panel === paintPanel);
    if (existing) {
      updatePaintMeasurement(paintPanel, {
        thickness,
        condition,
        notes: paintNotes || undefined,
        referenceMin: ref.min,
        referenceMax: ref.max,
      });
    } else {
      addPaintMeasurement({
        panel: paintPanel,
        thickness,
        condition,
        referenceMin: ref.min,
        referenceMax: ref.max,
        notes: paintNotes || undefined,
      });
    }
    setPaintThickness('');
    setPaintNotes('');
  }, [paintPanel, paintThickness, paintNotes, paintMeasurements]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Hasar Tespiti</Text>

        <View style={styles.tabs}>
          <TabBtn active={activeTab === 'damage'} label={`Hasar (${damageAreas.length})`} onPress={() => setActiveTab('damage')} />
          <TabBtn active={activeTab === 'paint'} label={`Boya (${paintMeasurements.length})`} onPress={() => setActiveTab('paint')} />
          <TabBtn active={activeTab === 'photos'} label={`Foto (${photos.length})`} onPress={() => setActiveTab('photos')} />
        </View>

        {/* ── Hasar Sekmesi ── */}
        {activeTab === 'damage' && (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddDamage(true)}>
              <Icon name="plus" size={18} color={COLORS.darkBg} />
              <Text style={styles.addBtnText}>Hasar Ekle</Text>
            </TouchableOpacity>

            {damageAreas.length === 0 ? (
              <EmptyState icon="car-wrench" title="Hasar Yok" text="Henüz hasar bölgesi eklenmedi" />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.legend}>
                  {DAMAGE_TYPES.filter(d => d.value !== 'orijinal').map(d => (
                    <View key={d.value} style={styles.legendItem}>
                      <View style={[styles.legendDot, {backgroundColor: d.color}]} />
                      <Text style={styles.legendText}>{d.label}</Text>
                    </View>
                  ))}
                </View>
                {damageAreas.map(area => (
                  <DamageMarker key={area.id} area={area} onRemove={() => removeDamageArea(area.id)} />
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* ── Boya Sekmesi ── */}
        {activeTab === 'paint' && (
          <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
            <View style={styles.paintForm}>
              <Text style={styles.formLabel}>Panel Seç</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.panelScroll}>
                {CAR_PANELS.map(p => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.panelChip, paintPanel === p.value && styles.panelChipActive]}
                    onPress={() => setPaintPanel(p.value)}>
                    <Text style={[styles.panelChipText, paintPanel === p.value && styles.panelChipTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.formLabel}>Ölçüm (mikron)</Text>
              <TextInput
                style={styles.input}
                value={paintThickness}
                onChangeText={setPaintThickness}
                placeholder="örn. 120"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
              />

              {paintThickness && !isNaN(parseFloat(paintThickness)) && (
                <PaintEvalBadge panel={paintPanel} thickness={parseFloat(paintThickness)} />
              )}

              <Text style={styles.formLabel}>Notlar (isteğe bağlı)</Text>
              <TextInput
                style={[styles.input, {height: 64}]}
                value={paintNotes}
                onChangeText={setPaintNotes}
                placeholder="Gözlemlerinizi yazın..."
                placeholderTextColor={COLORS.textMuted}
                multiline
              />

              <TouchableOpacity style={styles.addBtn} onPress={handleAddPaint}>
                <Icon name="check" size={18} color={COLORS.darkBg} />
                <Text style={styles.addBtnText}>Ölçümü Kaydet</Text>
              </TouchableOpacity>
            </View>

            {paintMeasurements.length > 0 && (
              <View style={styles.paintList}>
                <Text style={styles.sectionLabel}>Kaydedilen Ölçümler</Text>
                {paintMeasurements.map(m => {
                  const eval_ = evaluatePaint(m.panel, m.thickness);
                  return (
                    <View key={m.panel} style={[styles.paintRow, {borderLeftColor: eval_.color}]}>
                      <Text style={styles.paintPanel}>{m.panel.replace(/_/g, ' ')}</Text>
                      <View style={styles.paintValues}>
                        <Text style={[styles.paintThickness, {color: eval_.color}]}>
                          {m.thickness} µ
                        </Text>
                        <Text style={styles.paintCondition}>{eval_.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>
        )}

        {/* ── Fotoğraf Sekmesi ── */}
        {activeTab === 'photos' && (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => Alert.alert('Bilgi', 'Kamera entegrasyonu için react-native-vision-camera gereklidir')}>
              <Icon name="camera-plus" size={18} color={COLORS.darkBg} />
              <Text style={styles.addBtnText}>Fotoğraf Çek</Text>
            </TouchableOpacity>
            {photos.length === 0 ? (
              <EmptyState icon="camera-outline" title="Fotoğraf Yok" text="Henüz fotoğraf eklenmedi" />
            ) : (
              <FlatList
                data={photos}
                numColumns={3}
                keyExtractor={item => item}
                renderItem={({item}) => (
                  <Image source={{uri: item}} style={styles.photoThumb} />
                )}
              />
            )}
          </View>
        )}
      </View>

      {/* ── Hasar Ekleme Modal ── */}
      <Modal visible={showAddDamage} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Hasar Ekle</Text>
            <TouchableOpacity onPress={() => setShowAddDamage(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={styles.formLabel}>Panel</Text>
            <View style={styles.chipWrap}>
              {CAR_PANELS.map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[styles.chip, selectedPanel === p.value && styles.chipActive]}
                  onPress={() => setSelectedPanel(p.value)}>
                  <Text style={[styles.chipText, selectedPanel === p.value && styles.chipTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Hasar Tipi</Text>
            <View style={styles.chipWrap}>
              {DAMAGE_TYPES.map(d => (
                <TouchableOpacity
                  key={d.value}
                  style={[styles.chip, selectedDamage === d.value && {backgroundColor: d.color, borderColor: d.color}]}
                  onPress={() => setSelectedDamage(d.value as DamageType)}>
                  <Text style={[styles.chipText, selectedDamage === d.value && {color: '#fff'}]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Şiddet (1–5)</Text>
            <View style={styles.severityRow}>
              {([1, 2, 3, 4, 5] as const).map(n => (
                <TouchableOpacity
                  key={n}
                  style={[styles.sevBtn, severity === n && styles.sevBtnActive]}
                  onPress={() => setSeverity(n)}>
                  <Text style={[styles.sevText, severity === n && styles.sevTextActive]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Notlar</Text>
            <TextInput
              style={[styles.input, {height: 80}]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Hasar detaylarını yazın..."
              placeholderTextColor={COLORS.textMuted}
              multiline
            />

            <TouchableOpacity style={[styles.addBtn, {marginTop: 8}]} onPress={handleAddDamage}>
              <Icon name="check" size={18} color={COLORS.darkBg} />
              <Text style={styles.addBtnText}>Hasarı Ekle</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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

function EmptyState({icon, title, text}: {icon: string; title: string; text: string}) {
  return (
    <View style={emptyStyles.container}>
      <Icon name={icon} size={48} color={COLORS.textMuted} />
      <Text style={emptyStyles.title}>{title}</Text>
      <Text style={emptyStyles.text}>{text}</Text>
    </View>
  );
}

function PaintEvalBadge({panel, thickness}: {panel: string; thickness: number}) {
  const eval_ = evaluatePaint(panel, thickness);
  const ref = PAINT_REFERENCE[panel as CarPanel] ?? PAINT_REFERENCE_DEFAULT;
  return (
    <View style={[paintEvalStyles.badge, {borderColor: eval_.color}]}>
      <Icon name={eval_.ok ? 'check-circle' : 'alert-circle'} size={16} color={eval_.color} />
      <Text style={[paintEvalStyles.text, {color: eval_.color}]}>{eval_.label}</Text>
      <Text style={paintEvalStyles.ref}>Referans: {ref.min}–{ref.max} µ</Text>
    </View>
  );
}

// ── Stiller ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {flex: 1, backgroundColor: COLORS.background},
  container: {flex: 1, padding: 16, gap: 12},
  title: {fontSize: 22, fontWeight: '900', color: COLORS.primary},
  tabs: {flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 10, padding: 4, gap: 4},
  tabContent: {flex: 1},
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  addBtnText: {fontSize: 14, fontWeight: '800', color: COLORS.darkBg},
  legend: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  legendText: {fontSize: 11, color: COLORS.textMuted},
  paintForm: {gap: 10, marginBottom: 16},
  formLabel: {fontSize: 13, fontWeight: '700', color: COLORS.textSecondary},
  panelScroll: {marginBottom: 4},
  panelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 6,
  },
  panelChipActive: {backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary},
  panelChipText: {fontSize: 12, color: COLORS.textMuted},
  panelChipTextActive: {color: COLORS.primary, fontWeight: '600'},
  input: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  paintList: {gap: 8},
  sectionLabel: {fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase'},
  paintRow: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paintPanel: {fontSize: 13, color: COLORS.textPrimary, textTransform: 'capitalize', flex: 1},
  paintValues: {alignItems: 'flex-end'},
  paintThickness: {fontSize: 16, fontWeight: '800'},
  paintCondition: {fontSize: 11, color: COLORS.textMuted},
  photoThumb: {width: '33%', aspectRatio: 1, margin: 1, borderRadius: 4},
  // Modal
  modal: {flex: 1, backgroundColor: COLORS.background},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {fontSize: 18, fontWeight: '800', color: COLORS.textPrimary},
  modalBody: {padding: 16},
  chipWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8},
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {backgroundColor: COLORS.primary + '33', borderColor: COLORS.primary},
  chipText: {fontSize: 12, color: COLORS.textMuted},
  chipTextActive: {color: COLORS.primary, fontWeight: '600'},
  severityRow: {flexDirection: 'row', gap: 8},
  sevBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sevBtnActive: {backgroundColor: COLORS.primary, borderColor: COLORS.primary},
  sevText: {fontSize: 16, fontWeight: '700', color: COLORS.textMuted},
  sevTextActive: {color: COLORS.darkBg},
});

const tabStyles = StyleSheet.create({
  btn: {flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center'},
  active: {backgroundColor: COLORS.primary},
  text: {fontSize: 11, fontWeight: '600', color: COLORS.textMuted},
  activeText: {color: COLORS.darkBg},
});

const emptyStyles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 48, gap: 12},
  title: {fontSize: 16, fontWeight: '700', color: COLORS.textPrimary},
  text: {fontSize: 12, color: COLORS.textMuted, textAlign: 'center'},
});

const paintEvalStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.cardBg,
  },
  text: {fontWeight: '600', fontSize: 13},
  ref: {fontSize: 11, color: COLORS.textMuted, marginLeft: 'auto'},
});
