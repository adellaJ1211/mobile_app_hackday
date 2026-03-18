import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { accounts, getInsightsForAccount, getHighSeverityCount } from '../data/mockData';

export default function AccountsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={[styles.titleArea, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.title}>Accounts</Text>
        <Text style={styles.subtitle}>
          {accounts.length} accounts · Switch to view insights
        </Text>
      </View>

      {accounts.map((account) => {
        const insights = getInsightsForAccount(account.id);
        const highCount = getHighSeverityCount(account.id);
        const aiCount = insights.filter((i) => i.type === 'ai-search').length;
        const ppcCount = insights.filter((i) => i.type === 'ppc').length;

        return (
          <TouchableOpacity
            key={account.id}
            style={styles.accountCard}
            activeOpacity={0.8}
          >
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountIndustry}>{account.industry}</Text>
              </View>
              {highCount > 0 && (
                <View style={styles.alertBadge}>
                  <Ionicons name="alert-circle" size={14} color={colors.danger} />
                  <Text style={styles.alertText}>
                    {highCount} high priority
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: colors.aiSearchDim }]}>
                  <Ionicons name="sparkles" size={14} color={colors.aiSearch} />
                </View>
                <View>
                  <Text style={styles.statNumber}>{aiCount}</Text>
                  <Text style={styles.statLabel}>AI Search</Text>
                </View>
              </View>
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: colors.ppcDim }]}>
                  <Ionicons name="search" size={14} color={colors.ppc} />
                </View>
                <View>
                  <Text style={styles.statNumber}>{ppcCount}</Text>
                  <Text style={styles.statLabel}>PPC</Text>
                </View>
              </View>
              <View style={styles.stat}>
                <View style={[styles.statIcon, { backgroundColor: colors.warningDim }]}>
                  <Ionicons name="layers" size={14} color={colors.warning} />
                </View>
                <View>
                  <Text style={styles.statNumber}>{insights.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>

            <View style={styles.viewLink}>
              <Text style={styles.viewLinkText}>View insights</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.accent} />
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titleArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  accountCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accountIndustry: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.dangerDim,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  alertText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.danger,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
});
