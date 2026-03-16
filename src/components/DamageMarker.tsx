import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DamageArea} from '../types';
import {COLORS, DAMAGE_TYPES} from '../utils/constants';

interface Props {
  area: DamageArea;
  onRemove?: () => void;
  onTap?: () => void;
}

export default function DamageMarker({area, onRemove, onTap}: Props) {
  const damageType = DAMAGE_TYPES.find(d => d.value === area.damageType);
  const color = damageType?.color ?? COLORS.warning;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onTap}
      activeOpacity={0.85}>
      <View style={[styles.header, {backgroundColor: color + '33'}]}>
        <View style={[styles.dot, {backgroundColor: color}]} />
        <Text style={styles.panel}>{area.panel.replace(/_/g, ' ')}</Text>
        {onRemove && (
          <TouchableOpacity onPress={onRemove} hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
            <Icon name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.body}>
        <View style={[styles.typeBadge, {backgroundColor: color}]}>
          <Text style={styles.typeText}>{damageType?.label ?? area.damageType}</Text>
        </View>
        <View style={styles.severity}>
          {[1, 2, 3, 4, 5].map(n => (
            <View
              key={n}
              style={[
                styles.sevDot,
                {backgroundColor: n <= area.severity ? color : COLORS.border},
              ]}
            />
          ))}
        </View>
      </View>
      {area.notes && (
        <Text style={styles.notes} numberOfLines={2}>{area.notes}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  panel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  severity: {
    flexDirection: 'row',
    gap: 3,
  },
  sevDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  notes: {
    fontSize: 11,
    color: COLORS.textMuted,
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
});
