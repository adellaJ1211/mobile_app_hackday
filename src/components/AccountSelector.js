import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { getHighSeverityCount } from '../data/mockData';

export default function AccountSelector({ accounts, selectedId, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {accounts.map((account) => {
        const isSelected = account.id === selectedId;
        const highCount = getHighSeverityCount(account.id);

        return (
          <TouchableOpacity
            key={account.id}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => onSelect(account.id)}
            activeOpacity={0.7}
          >
            <View style={styles.pillContent}>
              <Text style={[styles.pillName, isSelected && styles.pillNameSelected]}>
                {account.name}
              </Text>
              {highCount > 0 && (
                <View style={styles.alertBadge}>
                  <Text style={styles.alertText}>{highCount}</Text>
                </View>
              )}
            </View>
            {isSelected && (
              <Text style={styles.industry}>{account.industry}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.accentDim,
    borderColor: colors.accent,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillNameSelected: {
    color: colors.accent,
  },
  industry: {
    fontSize: 10,
    color: colors.accent,
    marginTop: 2,
    opacity: 0.7,
  },
  alertBadge: {
    backgroundColor: colors.danger,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  alertText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
