import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { NfInput } from '../../components/NfInput';
import { NfButton } from '../../components/NfButton';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Ingresa tu nombre.';
    if (!email.trim()) e.email = 'Ingresa tu correo.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo no válido.';
    if (!password) e.password = 'Ingresa una contraseña.';
    else if (password.length < 6) e.password = 'Mínimo 6 caracteres.';
    if (!confirm) e.confirm = 'Confirma tu contraseña.';
    else if (confirm !== password) e.confirm = 'Las contraseñas no coinciden.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

  const clearError = (field: string) => setErrors(e => { const n = { ...e }; delete n[field]; return n; });

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textOnPrimary} />
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.brand}>NexoFluye</Text>
          <Text style={styles.tagline}>Crea tu cuenta gratis</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crear cuenta</Text>
          <Text style={styles.cardSubtitle}>Solo toma un minuto</Text>

          <View style={styles.form}>
            <NfInput
              label="Nombre o negocio"
              placeholder="Ej: Tienda San José"
              autoCapitalize="words"
              value={name}
              onChangeText={t => { setName(t); clearError('name'); }}
              error={errors.name}
              leftIcon="person-outline"
            />
            <NfInput
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={t => { setEmail(t); clearError('email'); }}
              error={errors.email}
              leftIcon="mail-outline"
            />
            <NfInput
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              isPassword
              value={password}
              onChangeText={t => { setPassword(t); clearError('password'); }}
              error={errors.password}
              leftIcon="lock-closed-outline"
            />
            <NfInput
              label="Confirmar contraseña"
              placeholder="Repite tu contraseña"
              isPassword
              value={confirm}
              onChangeText={t => { setConfirm(t); clearError('confirm'); }}
              error={errors.confirm}
              leftIcon="shield-checkmark-outline"
            />
          </View>

          <NfButton label="Crear cuenta" onPress={handleRegister} loading={loading} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  topBar: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 30,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
  },
  brand: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Typography.fontFamily,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  cardTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
    marginBottom: 24,
  },
  form: { marginBottom: 8 },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },
  loginLink: {
    fontSize: Typography.sizes.base,
    color: Colors.primaryLight,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily,
  },
});
