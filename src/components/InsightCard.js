import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const severityConfig = {
  high: { color: colors.danger, bg: colors.dangerDim, label: 'High Priority' },
  medium: { color: colors.warning, bg: colors.warningDim, label: 'Medium' },
  low: { color: colors.success, bg: colors.successDim, label: 'Low' },
};

const typeConfig = {
  'ai-search': { color: colors.aiSearch, bg: colors.aiSearchDim, label: 'AI Search', icon: 'sparkles' },
  ppc: { color: colors.ppc, bg: colors.ppcDim, label: 'PPC', icon: 'search' },
};

export default function InsightCard({ insight, onAddToActions, onTriggerAgent, isActioned }) {
  const [expanded, setExpanded] = useState(false);
  const sev = severityConfig[insight.severity];
  const type = typeConfig[insight.type];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(!expanded)}
      style={[styles.card, isActioned && styles.cardActioned]}
    >
      {/* Actioned badge */}
      {isActioned && (
        <View style={styles.actionedBadge}>
          <Ionicons name="checkmark-circle" size={12} color={colors.success} />
          <Text style={styles.actionedText}>Actioned</Text>
        </View>
      )}

      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: type.bg }]}>
            <Ionicons name={type.icon} size={11} color={type.color} />
            <Text style={[styles.badgeText, { color: type.color }]}>{type.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: sev.bg }]}>
            <View style={[styles.sevDot, { backgroundColor: sev.color }]} />
            <Text style={[styles.badgeText, { color: sev.color }]}>{sev.label}</Text>
          </View>
          {insight.source === 'chatgpt' && (
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
              <Text style={[styles.badgeText, { color: colors.textMuted }]}>ChatGPT</Text>
            </View>
          )}
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{insight.title}</Text>

      {/* Prompt group */}
      {insight.promptGroup ? (
        <Text style={styles.promptGroup}>{insight.promptGroup}</Text>
      ) : null}

      {/* Metric pill */}
      {insight.metric && (
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>{insight.metric.label}</Text>
          <View style={styles.metricValues}>
            {insight.metric.before !== '-' && (
              <>
                <Text style={styles.metricBefore}>{insight.metric.before}</Text>
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color={colors.textMuted}
                />
              </>
            )}
            <Text style={[
              styles.metricAfter,
              {
                color: insight.metric.direction === 'up'
                  ? (insight.severity === 'low' ? colors.success : colors.danger)
                  : (insight.severity === 'low' ? colors.success : colors.danger),
              },
            ]}>
              {insight.metric.after}
            </Text>
            <Ionicons
              name={insight.metric.direction === 'up' ? 'trending-up' : 'trending-down'}
              size={16}
              color={insight.severity === 'low' ? colors.success
                : insight.metric.direction === 'up'
                  ? (insight.severity === 'high' ? colors.danger : colors.warning)
                  : colors.danger}
            />
          </View>
        </View>
      )}

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedSection}>
          <Text style={styles.summary}>{insight.summary}</Text>

          <View style={styles.actionSection}>
            <Text style={styles.actionLabel}>Recommended action</Text>
            <Text style={styles.actionText}>{insight.suggestedAction}</Text>
          </View>

          {/* Action buttons */}
          {!isActioned && (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => onAddToActions?.(insight)}
              >
                <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
                <Text style={styles.btnSecondaryText}>Add to actions</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => onTriggerAgent?.(insight)}
              >
                <Ionicons name="flash" size={18} color={colors.textInverse} />
                <Text style={styles.btnPrimaryText}>{insight.agentAction.label}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Expand indicator */}
      <View style={styles.expandIndicator}>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActioned: {
    opacity: 0.65,
    borderColor: colors.success + '40',
  },
  actionedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.successDim,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    zIndex: 1,
  },
  actionedText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  sevDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 22,
    marginBottom: 4,
    paddingRight: spacing.xl,
  },
  promptGroup: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.bgCardElevated,
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricBefore: {
    fontSize: 13,
    color: colors.textMuted,
  },
  metricAfter: {
    fontSize: 15,
    fontWeight: '700',
  },
  expandedSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  actionSection: {
    backgroundColor: colors.bgCardElevated,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  actionLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  btnSecondaryText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  btnPrimary: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  btnPrimaryText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
  },
  expandIndicator: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
