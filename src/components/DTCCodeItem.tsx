import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {DTCCode} from '../types';
import {COLORS, SYSTEM_LABELS, SEVERITY_COLORS} from '../utils/constants';
import {severityLabel} from '../utils/helpers';

interface Props {
  dtc: DTCCode;
}

const SYSTEM_ICONS: Record<string, string> = {
  engine:       'engine',
  transmission: 'car-shift-pattern',
  abs:          'car-brake-abs',
  airbag:       'airbag',
  body:         'car-door',
  chassis:      'car',
  network:      'lan',
};

export default function DTCCodeItem({dtc}: Props) {
  const [expanded, setExpanded] = useState(false);
  const color = SEVERITY_COLORS[dtc.severity] ?? COLORS.textMuted;
  const icon = SYSTEM_ICONS[dtc.system] ?? 'alert-circle';

  return (
    <TouchableOpacity
      style={[styles.container, {borderLeftColor: color}]}
      onPress={() => setExpanded(e => !e)}
      activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={[styles.iconBg, {backgroundColor: color + '22'}]}>
          <Icon name={icon} size={18} color={color} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.code}>{dtc.code}</Text>
            <View style={[styles.badge, {backgroundColor: color}]}>
              <Text style={styles.badgeText}>{severityLabel(dtc.severity)}</Text>
            </View>
          </View>
          <Text style={styles.desc} numberOfLines={expanded ? undefined : 2}>
            {dtc.description}
          </Text>
        </View>

        <Icon
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={COLORS.textMuted}
        />
      </View>

      {expanded && (
        <View style={styles.details}>
          <DetailRow icon="cog" label="Sistem" value={SYSTEM_LABELS[dtc.system] ?? dtc.system} />
          <DetailRow icon="tag" label="Kategori" value={dtc.category} />
          <DetailRow
            icon="clock-outline"
            label="Durum"
            value={dtc.isPermanent ? 'Kalıcı' : dtc.isPending ? 'Bekleyen' : 'Aktif'}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

function DetailRow({icon, label, value}: {icon: string; label: string; value: string}) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={13} color={COLORS.textMuted} />
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {flex: 1},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  desc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    width: 60,
  },
  detailValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
