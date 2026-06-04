import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

type Props = {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  bgColor?: string;
};

export function StatCard({ title, value, subtitle, icon, color = Colors.primaryLight, bgColor = Colors.accentLight }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.iconBg, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 5,
    alignItems: 'flex-start',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  value: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    lineHeight: 28,
  },
  title: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
    fontWeight: Typography.weights.semibold,
  },
});
