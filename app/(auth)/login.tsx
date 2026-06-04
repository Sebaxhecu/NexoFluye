import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { NfInput } from '../../components/NfInput';
import { NfButton } from '../../components/NfButton';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate() {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Ingresa tu correo.';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Correo no válido.';
    if (!password) e.password = 'Ingresa tu contraseña.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  }

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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>N</Text>
            </View>
          </View>
          <Text style={styles.brand}>NexoFluye</Text>
          <Text style={styles.tagline}>Gestiona tus finanzas con claridad</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar sesión</Text>
          <Text style={styles.cardSubtitle}>Bienvenido de nuevo</Text>

          <View style={styles.form}>
            <NfInput
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }}
              error={errors.email}
              leftIcon="mail-outline"
            />
            <NfInput
              label="Contraseña"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }}
              error={errors.password}
              leftIcon="lock-closed-outline"
            />
          </View>

          <NfButton label="Iniciar sesión" onPress={handleLogin} loading={loading} />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Registrarse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.primary },
  scroll: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 36,
    paddingHorizontal: 24,
  },
  logoWrap: {
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 14,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoText: {
    fontSize: 38,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
  },
  brand: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.extrabold,
    color: Colors.textOnPrimary,
    fontFamily: Typography.fontFamily,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: Typography.fontFamily,
    marginTop: 6,
    letterSpacing: 0.3,
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
    marginBottom: 26,
  },
  form: { marginBottom: 8 },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    marginHorizontal: 12,
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily,
  },
  registerLink: {
    fontSize: Typography.sizes.base,
    color: Colors.primaryLight,
    fontWeight: Typography.weights.bold,
    fontFamily: Typography.fontFamily,
  },
});
