import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../utils/constants';
import {scoreLabel, scoreColor} from '../utils/helpers';

interface Props {
  score: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function ScoreGauge({score, label, size = 'medium', showLabel = true}: Props) {
  const color = scoreColor(score);
  const sizeMap = {small: 60, medium: 90, large: 120};
  const dim = sizeMap[size];
  const strokeWidth = size === 'large' ? 10 : 7;
  const radius = (dim - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <View style={styles.container}>
      {/* Dairesel gösterge – SVG'siz yaklaşık temsil */}
      <View style={[styles.circle, {width: dim, height: dim, borderRadius: dim / 2,
                                    borderWidth: strokeWidth, borderColor: color}]}>
        <Text style={[styles.scoreText, {fontSize: size === 'large' ? 28 : size === 'medium' ? 22 : 16, color}]}>
          {score}
        </Text>
        {showLabel && (
          <Text style={[styles.labelText, {fontSize: size === 'large' ? 11 : 9}]}>
            {scoreLabel(score)}
          </Text>
        )}
      </View>
      {label && <Text style={styles.sectionLabel}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
  },
  scoreText: {
    fontWeight: '900',
  },
  labelText: {
    color: COLORS.textMuted,
    marginTop: 1,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
