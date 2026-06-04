import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { StatCard } from '../../components/StatCard';
import { useAuth } from '../../hooks/useAuth';
import { getSales, buildSaleSummary, DailySale } from '../../lib/storage';
import { router } from 'expo-router';

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function getMonthName(date: Date) {
  return date.toLocaleString('es', { month: 'long' });
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [sales, setSales] = useState<DailySale[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const all = await getSales(user.id);
    const now = new Date();
    const thisMonth = all.filter(s => s.date.startsWith(now.toISOString().slice(0, 7)));
    setSales(thisMonth);
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const summary = buildSaleSummary(sales);
  const today = new Date().toISOString().slice(0, 10);
  const todaySale = sales.find(s => s.date === today);

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';
  const month = getMonthName(new Date());

  return (
    <View style={styles.container}>
      {/* Header gradient bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{greeting()},</Text>
          <Text style={styles.name}>{firstName} 👋</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryLight} />}
      >
        {/* Today card */}
        <TouchableOpacity
          style={styles.todayCard}
          onPress={() => router.push({ pathname: '/(tabs)/calendar', params: { openDate: today } })}
          activeOpacity={0.88}
        >
          <View style={styles.todayCardInner}>
            <View>
              <Text style={styles.todayLabel}>Ventas de hoy</Text>
              <Text style={styles.todayAmount}>
                {todaySale ? formatCurrency(todaySale.amount) : '—'}
              </Text>
              {todaySale && (
                <Text style={styles.todayProfit}>
                  Ganancia: {formatCurrency(todaySale.profit)}
                  {'  '}({todaySale.profitPercent}%)
                </Text>
              )}
              {!todaySale && (
                <Text style={styles.todayHint}>Toca para registrar ventas</Text>
              )}
            </View>
            <View style={styles.todayIconWrap}>
              <Ionicons name="trending-up" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <View style={styles.todayFooter}>
            <Text style={styles.todayDate}>
              {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </View>
        </TouchableOpacity>

        {/* Month stats */}
        <Text style={styles.sectionTitle}>Resumen de {month}</Text>
        <View style={styles.statsRow}>
          <StatCard
            title="Total ventas"
            value={formatCurrency(summary.total)}
            subtitle={`${summary.count} días`}
            icon="cash-outline"
            color={Colors.primaryLight}
            bgColor={Colors.accentLight}
          />
          <StatCard
            title="Total ganancia"
            value={formatCurrency(summary.totalProfit)}
            icon="trending-up-outline"
            color={Colors.success}
            bgColor={Colors.successLight}
          />
        </View>

        {/* Best day */}
        {summary.best && (
          <View style={styles.bestDayCard}>
            <View style={styles.bestDayLeft}>
              <View style={styles.bestDayIcon}>
                <Ionicons name="trophy" size={20} color={Colors.warning} />
              </View>
              <View>
                <Text style={styles.bestDayLabel}>Mejor día del mes</Text>
                <Text style={styles.bestDayDate}>
                  {new Date(summary.best.date + 'T12:00').toLocaleDateString('es', {
                    weekday: 'short', day: 'numeric', month: 'long',
                  })}
                </Text>
              </View>
            </View>
            <Text style={styles.bestDayAmount}>{formatCurrency(summary.best.amount)}</Text>
          </View>
        )}

        {/* Quick actions */}
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          <QuickAction
            icon="add-circle-outline"
            label="Registrar venta"
            color={Colors.primaryLight}
            bg={Colors.accentLight}
            onPress={() => router.push({ pathname: '/(tabs)/calendar', params: { openDate: today } })}
          />
          <QuickAction
            icon="calendar-outline"
            label="Ver calendario"
            color={Colors.primaryMid}
            bg="#EEF2FF"
            onPress={() => router.push('/(tabs)/calendar')}
          />
          <QuickAction
            icon="bar-chart-outline"
            label="Resumen"
            color={Colors.success}
            bg={Colors.successLight}
            onPress={() => router.push('/(tabs)/resumen')}
          />
          <QuickAction
            icon="person-outline"
            label="Mi perfil"
            color={Colors.textSecondary}
            bg={Colors.surfaceAlt}
            onPress={() => router.push('/(tabs)/perfil')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function QuickAction({
  icon, label, color, bg, onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.actionIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 58 : 40,
    paddingBottom: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: Typography.sizes.base,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Typography.fontFamily,
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  todayCard: {
    backgroundColor: Colors.primaryMid,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
  },
  todayCardInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  todayLabel: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.medium,
  },
  todayAmount: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  todayProfit: {
    fontSize: Typography.sizes.sm,
    color: '#A7F3D0',
    fontFamily: Typography.fontFamily,
    marginTop: 6,
    fontWeight: Typography.weights.medium,
  },
  todayHint: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: Typography.fontFamily,
    marginTop: 6,
  },
  todayIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    paddingTop: 12,
  },
  todayDate: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: 14,
    textTransform: 'capitalize',
  },
  statsRow: { flexDirection: 'row', marginHorizontal: -5, marginBottom: 16 },
  bestDayCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bestDayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bestDayIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestDayLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.medium,
  },
  bestDayDate: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  bestDayAmount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionBtn: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionIcon: {
    width: '100%',
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
  },
});
