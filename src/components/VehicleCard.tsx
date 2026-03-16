import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Vehicle} from '../types';
import {COLORS} from '../utils/constants';
import {formatKM, vehicleAge} from '../utils/helpers';

interface Props {
  vehicle: Vehicle;
  onEdit?: () => void;
  compact?: boolean;
}

export default function VehicleCard({vehicle, onEdit, compact = false}: Props) {
  const age = vehicleAge(vehicle.year);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.plateContainer}>
          <View style={styles.plateBadge}>
            <Text style={styles.plateTR}>TR</Text>
            <Text style={styles.plate}>{vehicle.plate.toUpperCase()}</Text>
          </View>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.editBtn}>
            <Icon name="pencil" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.vehicleName}>
          {vehicle.brand} {vehicle.model}
        </Text>
        {!compact && (
          <Text style={styles.vehicleSub}>
            {vehicle.year} • {vehicle.engineCC} cc • {vehicle.fuelType.toUpperCase()}
          </Text>
        )}
      </View>

      {!compact && (
        <View style={styles.stats}>
          <Stat icon="counter" label="Km" value={formatKM(vehicle.km)} />
          <Stat icon="calendar" label="Yaş" value={`${age} yıl`} />
          <Stat icon="palette" label="Renk" value={vehicle.color} />
        </View>
      )}

      {!compact && vehicle.ownerName && (
        <View style={styles.owner}>
          <Icon name="account" size={13} color={COLORS.textMuted} />
          <Text style={styles.ownerText}>{vehicle.ownerName}</Text>
          {vehicle.ownerPhone && (
            <>
              <Icon name="phone" size={13} color={COLORS.textMuted} style={{marginLeft: 10}} />
              <Text style={styles.ownerText}>{vehicle.ownerPhone}</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}

function Stat({icon, label, value}: {icon: string; label: string; value: string}) {
  return (
    <View style={statStyles.container}>
      <Icon name={icon} size={14} color={COLORS.primary} />
      <Text style={statStyles.label}>{label}</Text>
      <Text style={statStyles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  plateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003399',
    borderRadius: 6,
    overflow: 'hidden',
  },
  plateTR: {
    backgroundColor: '#003399',
    color: '#FFD700',
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  plate: {
    backgroundColor: '#FFFFFF',
    color: '#000',
    fontSize: 16,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 3,
    letterSpacing: 1,
  },
  editBtn: {
    padding: 6,
    backgroundColor: COLORS.primary + '22',
    borderRadius: 8,
  },
  body: {marginBottom: 10},
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  vehicleSub: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginBottom: 8,
  },
  owner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ownerText: {fontSize: 12, color: COLORS.textMuted},
});

const statStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  label: {fontSize: 10, color: COLORS.textMuted},
  value: {fontSize: 12, fontWeight: '600', color: COLORS.textSecondary},
});
