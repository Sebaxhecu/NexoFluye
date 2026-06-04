import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { useAuth } from '../../hooks/useAuth';
import { getSales, saveSale, DailySale } from '../../lib/storage';

function formatCurrency(n: number) {
  return '$' + n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function CalendarScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ openDate?: string }>();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [sales, setSales] = useState<DailySale[]>([]);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [amount, setAmount] = useState('');
  const [profitPct, setProfitPct] = useState('20');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setSales(await getSales(user.id));
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Open modal for a specific date if params provided
  useEffect(() => {
    if (params.openDate) {
      openModal(params.openDate);
    }
  }, [params.openDate]);

  function getSaleForDate(dateStr: string): DailySale | undefined {
    return sales.find(s => s.date === dateStr);
  }

  function openModal(dateStr: string) {
    const existing = getSaleForDate(dateStr);
    setSelectedDate(dateStr);
    setAmount(existing ? String(existing.amount) : '');
    setProfitPct(existing ? String(existing.profitPercent) : '20');
    setNotes(existing?.notes ?? '');
    setModalVisible(true);
  }

  async function handleSave() {
    const amountNum = parseFloat(amount.replace(',', '.'));
    const pctNum = parseFloat(profitPct.replace(',', '.'));

    if (isNaN(amountNum) || amountNum < 0) {
      Alert.alert('Error', 'Ingresa un monto válido.');
      return;
    }
    if (isNaN(pctNum) || pctNum < 0 || pctNum > 100) {
      Alert.alert('Error', 'El porcentaje debe estar entre 0 y 100.');
      return;
    }
    setSaving(true);
    try {
      const sale: DailySale = {
        date: selectedDate,
        amount: amountNum,
        profitPercent: pctNum,
        profit: parseFloat(((amountNum * pctNum) / 100).toFixed(2)),
        notes: notes.trim(),
      };
      await saveSale(user!.id, sale);
      await load();
      setModalVisible(false);
    } finally {
      setSaving(false);
    }
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const days = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfMonth(viewYear, viewMonth);
  const today = now.toISOString().slice(0, 10);

  const computedProfit = () => {
    const a = parseFloat(amount.replace(',', '.'));
    const p = parseFloat(profitPct.replace(',', '.'));
    if (isNaN(a) || isNaN(p)) return null;
    return (a * p) / 100;
  };

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendario</Text>
        <Text style={styles.headerSub}>Registro diario de ventas</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Month navigator */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={20} color={Colors.primaryLight} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={20} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View style={styles.daysRow}>
          {DAYS.map(d => (
            <Text key={d} style={styles.dayLabel}>{d}</Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.grid}>
          {cells.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} style={styles.emptyCell} />;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const sale = getSaleForDate(dateStr);
            const isToday = dateStr === today;
            const hasSale = !!sale;
            const isFuture = dateStr > today;

            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dayCell,
                  isToday && styles.todayCell,
                  hasSale && styles.hasSaleCell,
                  isFuture && styles.futureCell,
                ]}
                onPress={() => !isFuture && openModal(dateStr)}
                activeOpacity={isFuture ? 1 : 0.75}
              >
                <Text style={[styles.dayNum, isToday && styles.todayNum, isFuture && styles.futureNum]}>
                  {day}
                </Text>
                {hasSale && (
                  <Text style={styles.saleIndicator} numberOfLines={1}>
                    {formatCurrency(sale!.amount)}
                  </Text>
                )}
                {!hasSale && !isFuture && (
                  <View style={styles.addDot}>
                    <Ionicons name="add" size={9} color={Colors.textMuted} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* This month list */}
        <Text style={styles.listTitle}>Registros de {MONTHS[viewMonth]}</Text>
        {sales
          .filter(s => s.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`))
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(s => (
            <TouchableOpacity key={s.date} style={styles.saleRow} onPress={() => openModal(s.date)} activeOpacity={0.8}>
              <View style={styles.saleRowLeft}>
                <View style={styles.dateBadge}>
                  <Text style={styles.dateBadgeNum}>{parseInt(s.date.slice(8))}</Text>
                </View>
                <View>
                  <Text style={styles.saleRowDate}>
                    {new Date(s.date + 'T12:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </Text>
                  {s.notes ? <Text style={styles.saleRowNotes} numberOfLines={1}>{s.notes}</Text> : null}
                </View>
              </View>
              <View style={styles.saleRowRight}>
                <Text style={styles.saleRowAmount}>{formatCurrency(s.amount)}</Text>
                <Text style={styles.saleRowProfit}>+{formatCurrency(s.profit)} ({s.profitPercent}%)</Text>
              </View>
            </TouchableOpacity>
          ))}

        {sales.filter(s => s.date.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`)).length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={Colors.border} />
            <Text style={styles.emptyText}>No hay registros este mes</Text>
            <Text style={styles.emptyHint}>Toca un día para agregar ventas</Text>
          </View>
        )}
      </ScrollView>

      {/* Sale Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              {/* Modal header */}
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>
                    {selectedDate
                      ? new Date(selectedDate + 'T12:00').toLocaleDateString('es', {
                        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                      })
                      : ''}
                  </Text>
                  <Text style={styles.modalSubtitle}>Registro de ventas</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Amount */}
              <Text style={styles.fieldLabel}>Ventas del día</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  autoFocus
                />
              </View>

              {/* Profit percent */}
              <Text style={styles.fieldLabel}>Porcentaje de ganancia</Text>
              <View style={styles.profitRow}>
                <View style={styles.pctInputWrap}>
                  <TextInput
                    style={styles.pctInput}
                    placeholder="20"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    value={profitPct}
                    onChangeText={setProfitPct}
                  />
                  <Text style={styles.pctSymbol}>%</Text>
                </View>

                {/* Quick % buttons */}
                {[10, 15, 20, 25, 30].map(p => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.quickPct, profitPct === String(p) && styles.quickPctActive]}
                    onPress={() => setProfitPct(String(p))}
                  >
                    <Text style={[styles.quickPctText, profitPct === String(p) && styles.quickPctTextActive]}>
                      {p}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Computed profit */}
              {computedProfit() !== null && (
                <View style={styles.profitPreview}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Text style={styles.profitPreviewText}>
                    Ganancia estimada: <Text style={styles.profitBold}>{formatCurrency(computedProfit()!)}</Text>
                  </Text>
                </View>
              )}

              {/* Notes */}
              <Text style={styles.fieldLabel}>Notas (opcional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Ej: promoción del día, productos más vendidos..."
                placeholderTextColor={Colors.textMuted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={2}
              />

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                <Ionicons name="save-outline" size={18} color={Colors.textOnPrimary} />
                <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : 'Guardar registro'}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  monthLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  daysRow: { flexDirection: 'row', marginBottom: 6 },
  dayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    paddingVertical: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  emptyCell: { width: `${100 / 7}%`, aspectRatio: 0.85 },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.85,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    borderRadius: 10,
  },
  todayCell: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  hasSaleCell: {
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
  },
  futureCell: { opacity: 0.35 },
  dayNum: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  todayNum: { color: Colors.textOnPrimary, fontWeight: Typography.weights.bold },
  futureNum: { color: Colors.textMuted },
  saleIndicator: {
    fontSize: 8,
    color: Colors.primaryMid,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.bold,
    marginTop: 1,
  },
  addDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  listTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  saleRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  saleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  dateBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBadgeNum: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryMid,
    fontFamily: Typography.fontFamily,
  },
  saleRowDate: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
  saleRowNotes: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 2,
  },
  saleRowRight: { alignItems: 'flex-end' },
  saleRowAmount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
  },
  saleRowProfit: {
    fontSize: Typography.sizes.xs,
    color: Colors.success,
    fontFamily: Typography.fontFamily,
    marginTop: 2,
    fontWeight: Typography.weights.semibold,
  },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    fontWeight: Typography.weights.medium,
    marginTop: 12,
  },
  emptyHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalWrap: { justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 28,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  modalTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    textTransform: 'capitalize',
  },
  modalSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginTop: 3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 60,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  profitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  pctInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    height: 44,
    width: 80,
  },
  pctInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  pctSymbol: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily,
  },
  quickPct: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickPctActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primaryLight },
  quickPctText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },
  quickPctTextActive: { color: Colors.textOnPrimary },
  profitPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  profitPreviewText: {
    fontSize: Typography.sizes.sm,
    color: Colors.success,
    fontFamily: Typography.fontFamily,
  },
  profitBold: { fontWeight: Typography.weights.bold },
  notesInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    minHeight: 64,
    textAlignVertical: 'top',
    marginBottom: 22,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  saveBtn: {
    backgroundColor: Colors.primaryLight,
    borderRadius: 14,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
  },
});
