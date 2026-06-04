import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
};

export function NfInput({ label, error, hint, leftIcon, isPassword, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.container,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={18}
            color={focused ? Colors.primaryLight : Colors.textMuted}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  focused: {
    borderColor: Colors.primaryLight,
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  errorBorder: { borderColor: Colors.error },
  leftIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },
  eyeBtn: { padding: 4 },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: Colors.error,
    marginTop: 5,
    fontFamily: Typography.fontFamily,
  },
  hint: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: 5,
    fontFamily: Typography.fontFamily,
  },
});
