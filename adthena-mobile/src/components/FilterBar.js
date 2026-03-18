import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const filters = [
  { id: 'all', label: 'All', icon: 'layers-outline' },
  { id: 'high', label: 'High Priority', icon: 'alert-circle', color: colors.danger },
  { id: 'ai-search', label: 'AI Search', icon: 'sparkles', color: colors.aiSearch },
  { id: 'ppc', label: 'PPC', icon: 'search', color: colors.ppc },
];

export default function FilterBar({ activeFilter, onFilter }) {
  return (
    <View style={styles.container}>
      {filters.map((f) => {
        const isActive = f.id === activeFilter;
        return (
          <TouchableOpacity
            key={f.id}
            style={[styles.pill, isActive && styles.pillActive]}
            onPress={() => onFilter(f.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={f.icon}
              size={13}
              color={isActive ? colors.textPrimary : (f.color || colors.textMuted)}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.borderLight,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
