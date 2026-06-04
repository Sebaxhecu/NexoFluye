import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuth } from '../../hooks/useAuth';
import { getSales, DailySale, buildSaleSummary } from '../../lib/storage';

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export default function ResumenScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<DailySale[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) getSales(user.id).then(setSales);
    }, [user])
  );

  const now = new Date();
  const thisMonthStr = now.toISOString().slice(0, 7);
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);

  const thisMonthSales = sales.filter(s => s.date.startsWith(thisMonthStr));
  const lastMonthSales = sales.filter(s => s.date.startsWith(lastMonthStr));

  const thisSummary = buildSaleSummary(thisMonthSales);
  const lastSummary = buildSaleSummary(lastMonthSales);

  function growthPct(current: number, prev: number) {
    if (prev === 0) return null;
    return ((current - prev) / prev * 100).toFixed(1);
  }

  const growth = growthPct(thisSummary.total, lastSummary.total);

  // Last 7 days mini chart data
  const last7: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const sale = sales.find(s => s.date === dateStr);
    last7.push({ date: dateStr, amount: sale?.amount ?? 0 });
  }
  const maxAmount = Math.max(...last7.map(d => d.amount), 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resumen</Text>
        <Text style={styles.headerSub}>Análisis de tus ventas</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* This month */}
        <View style={styles.monthCard}>
          <View style={styles.monthCardTop}>
            <View>
              <Text style={styles.monthCardLabel}>{MONTHS[now.getMonth()]} {now.getFullYear()}</Text>
              <Text style={styles.monthCardAmount}>{formatCurrency(thisSummary.total)}</Text>
            </View>
            {growth !== null && (
              <View style={[styles.growthBadge, parseFloat(growth) >= 0 ? styles.growthUp : styles.growthDown]}>
                <Ionicons
                  name={parseFloat(growth) >= 0 ? 'trending-up' : 'trending-down'}
                  size={14}
                  color={parseFloat(growth) >= 0 ? Colors.success : Colors.error}
                />
                <Text style={[styles.growthText, parseFloat(growth) >= 0 ? styles.growthTextUp : styles.growthTextDown]}>
                  {growth}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.monthStats}>
            <View style={styles.mStat}>
              <Text style={styles.mStatVal}>{formatCurrency(thisSummary.totalProfit)}</Text>
              <Text style={styles.mStatLabel}>Ganancia total</Text>
            </View>
            <View style={styles.mStatDivider} />
            <View style={styles.mStat}>
              <Text style={styles.mStatVal}>{thisSummary.count}</Text>
              <Text style={styles.mStatLabel}>Días registrados</Text>
            </View>
            <View style={styles.mStatDivider} />
            <View style={styles.mStat}>
              <Text style={styles.mStatVal}>{formatCurrency(thisSummary.count > 0 ? thisSummary.total / thisSummary.count : 0)}</Text>
              <Text style={styles.mStatLabel}>Promedio/día</Text>
            </View>
          </View>
        </View>

        {/* Mini bar chart last 7 days */}
        <Text style={styles.sectionTitle}>Últimos 7 días</Text>
        <View style={styles.chartCard}>
          <View style={styles.barChart}>
            {last7.map((d, i) => {
              const heightPct = maxAmount > 0 ? (d.amount / maxAmount) : 0;
              const dayLabel = new Date(d.date + 'T12:00').toLocaleDateString('es', { weekday: 'short' });
              const isToday = d.date === now.toISOString().slice(0, 10);
              return (
                <View key={d.date} style={styles.barWrap}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        { height: `${Math.max(heightPct * 100, d.amount > 0 ? 8 : 0)}%` },
                        isToday && styles.barToday,
                        d.amount === 0 && styles.barEmpty,
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>{dayLabel}</Text>
                  {d.amount > 0 && (
                    <Text style={styles.barAmount} numberOfLines={1}>
                      {'$' + (d.amount >= 1000 ? (d.amount / 1000).toFixed(1) + 'k' : d.amount.toFixed(0))}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* vs last month */}
        {lastSummary.count > 0 && (
          <>
            <Text style={styles.sectionTitle}>Comparativa mensual</Text>
            <View style={styles.compareCard}>
              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>{MONTHS[now.getMonth()]}</Text>
                <Text style={styles.compareAmount}>{formatCurrency(thisSummary.total)}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${Math.min((thisSummary.total / Math.max(thisSummary.total, lastSummary.total)) * 100, 100)}%` }]} />
              </View>
              <View style={[styles.compareRow, { marginTop: 12 }]}>
                <Text style={styles.compareLabel}>{MONTHS[lastMonthDate.getMonth()]}</Text>
                <Text style={styles.compareAmountAlt}>{formatCurrency(lastSummary.total)}</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFillAlt, { width: `${Math.min((lastSummary.total / Math.max(thisSummary.total, lastSummary.total)) * 100, 100)}%` }]} />
              </View>
            </View>
          </>
        )}

        {/* All time total */}
        <Text style={styles.sectionTitle}>Totales generales</Text>
        <View style={styles.allTimeCard}>
          {[
            { label: 'Ventas totales', value: formatCurrency(buildSaleSummary(sales).total), icon: 'cash-outline', color: Colors.primaryLight, bg: Colors.accentLight },
            { label: 'Ganancia acumulada', value: formatCurrency(buildSaleSummary(sales).totalProfit), icon: 'trending-up-outline', color: Colors.success, bg: Colors.successLight },
            { label: 'Días registrados', value: String(buildSaleSummary(sales).count), icon: 'calendar-outline', color: Colors.warning, bg: Colors.warningLight },
          ].map(item => (
            <View key={item.label} style={styles.allTimeRow}>
              <View style={[styles.allTimeIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text style={styles.allTimeLabel}>{item.label}</Text>
              <Text style={[styles.allTimeValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' || Platform.OS === 'web' ? 58 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
  },
  headerSub: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },
  monthCard: {
    backgroundColor: Colors.primaryMid,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  monthCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  monthCardLabel: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
  monthCardAmount: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  growthUp: { backgroundColor: Colors.successLight },
  growthDown: { backgroundColor: Colors.errorLight },
  growthText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, fontFamily: Typography.fontFamily },
  growthTextUp: { color: Colors.success },
  growthTextDown: { color: Colors.error },
  monthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 16,
  },
  mStat: { flex: 1, alignItems: 'center' },
  mStatVal: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
  },
  mStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Typography.fontFamily,
    marginTop: 3,
    textAlign: 'center',
  },
  mStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: 14,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
  },
  barWrap: { flex: 1, alignItems: 'center' },
  barContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    backgroundColor: Colors.accentLight,
    borderRadius: 6,
    minHeight: 4,
  },
  barToday: { backgroundColor: Colors.primaryLight },
  barEmpty: { backgroundColor: Colors.border, minHeight: 0 },
  barLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 5,
    fontWeight: Typography.weights.medium,
  },
  barLabelToday: { color: Colors.primaryLight, fontWeight: Typography.weights.bold },
  barAmount: {
    fontSize: 7,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
  compareCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  compareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  compareLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
  compareAmount: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily,
  },
  compareAmountAlt: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryLight,
    borderRadius: 4,
  },
  progressBarFillAlt: {
    height: '100%',
    backgroundColor: Colors.borderMid,
    borderRadius: 4,
  },
  allTimeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  allTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allTimeIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allTimeLabel: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.medium,
  },
  allTimeValue: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily,
  },
});
