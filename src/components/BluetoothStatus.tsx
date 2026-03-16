import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../utils/constants';
import {OBD2ConnectionStatus} from '../types';

interface Props {
  status: OBD2ConnectionStatus;
  deviceName?: string | null;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<OBD2ConnectionStatus, {icon: string; color: string; label: string}> = {
  idle:         {icon: 'bluetooth-off',     color: COLORS.textMuted,   label: 'Bağlı Değil'},
  scanning:     {icon: 'bluetooth-search',  color: COLORS.info,        label: 'Taranıyor...'},
  connecting:   {icon: 'bluetooth-connect', color: COLORS.warning,     label: 'Bağlanıyor...'},
  connected:    {icon: 'bluetooth-connect', color: COLORS.success,     label: 'Bağlı'},
  reading:      {icon: 'bluetooth-connect', color: COLORS.primary,     label: 'Okunuyor...'},
  error:        {icon: 'bluetooth-off',     color: COLORS.danger,      label: 'Hata'},
  disconnected: {icon: 'bluetooth-off',     color: COLORS.textMuted,   label: 'Bağlantı Kesildi'},
};

export default function BluetoothStatus({status, deviceName, onPress}: Props) {
  const cfg = STATUS_CONFIG[status];
  const isAnimating = status === 'scanning' || status === 'connecting' || status === 'reading';

  return (
    <TouchableOpacity
      style={[styles.container, {borderColor: cfg.color}]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}>
      <View style={styles.iconRow}>
        {isAnimating ? (
          <ActivityIndicator color={cfg.color} size="small" />
        ) : (
          <Icon name={cfg.icon} size={20} color={cfg.color} />
        )}
        <View style={styles.texts}>
          <Text style={[styles.label, {color: cfg.color}]}>{cfg.label}</Text>
          {deviceName && (
            <Text style={styles.device} numberOfLines={1}>{deviceName}</Text>
          )}
        </View>
        <View style={[styles.dot, {backgroundColor: cfg.color}]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  texts: {flex: 1},
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  device: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
