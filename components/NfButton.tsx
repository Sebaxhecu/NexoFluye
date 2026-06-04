import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: Variant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
};

export function NfButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
  fullWidth = true,
}: Props) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        styles[variant],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.textOnPrimary : Colors.primary} size="small" />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...Platform.select({
      web: { cursor: 'pointer' as any },
    }),
  },
  fullWidth: { alignSelf: 'stretch' },
  primary: {
    backgroundColor: Colors.primaryLight,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: { opacity: 0.5 },
  label: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    fontFamily: Typography.fontFamily,
    letterSpacing: 0.3,
  },
  primaryLabel: { color: Colors.textOnPrimary },
  secondaryLabel: { color: Colors.primaryLight },
  ghostLabel: { color: Colors.primaryLight },
});
