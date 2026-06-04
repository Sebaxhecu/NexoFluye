import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuth } from '../../hooks/useAuth';
import { getSales, buildSaleSummary } from '../../lib/storage';

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const [totalSales, setTotalSales] = useState(0);
  const [daysRegistered, setDaysRegistered] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getSales(user.id).then(sales => {
          const s = buildSaleSummary(sales);
          setTotalSales(s.total);
          setDaysRegistered(s.count);
        });
      }
    }, [user])
  );

  function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  }

  const initials = user?.name
    ?.split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() ?? 'U';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es', { month: 'long', year: 'numeric' })
    : '';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil</Text>
        <Text style={styles.headerSub}>Tu cuenta NexoFluye</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {memberSince ? (
            <View style={styles.memberBadge}>
              <Ionicons name="calendar-outline" size={12} color={Colors.primaryLight} />
              <Text style={styles.memberText}>Miembro desde {memberSince}</Text>
            </View>
          ) : null}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{formatCurrency(totalSales)}</Text>
            <Text style={styles.statLabel}>Total ventas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{daysRegistered}</Text>
            <Text style={styles.statLabel}>Días registrados</Text>
          </View>
        </View>

        {/* Menu */}
        <Text style={styles.sectionLabel}>Cuenta</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="person-outline" label="Información personal" onPress={() => {}} />
          <MenuItem icon="notifications-outline" label="Notificaciones" onPress={() => {}} />
          <MenuItem icon="shield-checkmark-outline" label="Seguridad" onPress={() => {}} last />
        </View>

        <Text style={styles.sectionLabel}>Aplicación</Text>
        <View style={styles.menuCard}>
          <MenuItem icon="help-circle-outline" label="Ayuda y soporte" onPress={() => {}} />
          <MenuItem icon="document-text-outline" label="Términos y privacidad" onPress={() => {}} />
          <MenuItem icon="information-circle-outline" label="Versión 1.0.0" onPress={() => {}} last />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MenuItem({
  icon, label, onPress, last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, !last && styles.menuItemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primaryLight} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
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
  avatarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarInitials: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
  },
  userName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  userEmail: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    backgroundColor: Colors.accentLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  memberText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.semibold,
    textTransform: 'capitalize',
  },
  statsRow: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  statDivider: { width: 1, backgroundColor: Colors.border },
  sectionLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.medium,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.errorLight,
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.error,
    fontFamily: Typography.fontFamily,
  },
});
