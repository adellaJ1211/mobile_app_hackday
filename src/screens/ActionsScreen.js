import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { useActions } from '../context/ActionsContext';

const IS_WEB = Platform.OS === 'web';

const statusConfig = {
  pending: { icon: 'ellipse-outline', color: colors.textMuted, label: 'To do' },
  'agent-working': { icon: 'flash', color: colors.warning, label: 'Agent working' },
  'agent-complete': { icon: 'checkmark-circle', color: colors.accent, label: 'Ready for review' },
  done: { icon: 'checkmark-done-circle', color: colors.success, label: 'Completed' },
};

export default function ActionsScreen() {
  const insets = useSafeAreaInsets();
  const { actions, completeAction } = useActions();

  const pendingActions = actions.filter((a) => a.status !== 'done');
  const completedActions = actions.filter((a) => a.status === 'done');

  const renderAction = (action) => {
    const status = statusConfig[action.status] || statusConfig.pending;
    return (
      <View key={action.id} style={styles.actionCard}>
        <View style={styles.actionHeader}>
          <Ionicons name={status.icon} size={20} color={status.color} />
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle} numberOfLines={2}>{action.insightTitle}</Text>
            <View style={styles.actionMeta}>
              <Text style={styles.metaText}>{action.source}</Text>
              {action.promptGroup ? (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText} numberOfLines={1}>{action.promptGroup}</Text>
                </>
              ) : null}
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{action.addedAt}</Text>
            </View>
            {action.agentNote && (
              <View style={styles.agentNote}>
                <Ionicons name="flash" size={12} color={colors.accent} />
                <Text style={styles.agentNoteText}>{action.agentNote}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.actionFooter}>
          <View style={[styles.statusPill, { backgroundColor: status.color + '18' }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          {(action.status === 'agent-complete' || action.status === 'pending') && (
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => completeAction(action.insightId)}
            >
              <Ionicons name="checkmark" size={14} color={colors.success} />
              <Text style={styles.completeBtnText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View style={[styles.titleArea, { paddingTop: Math.max(insets.top, IS_WEB ? 40 : 0) + spacing.md }]}>
        <Text style={styles.title}>Actions</Text>
        <Text style={styles.subtitle}>
          {pendingActions.length} item{pendingActions.length !== 1 ? 's' : ''} on your list
        </Text>
      </View>

      {actions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="layers-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No actions yet</Text>
          <Text style={styles.emptyText}>
            Tap an insight card and choose "Add to actions" or trigger an agent to get started.
          </Text>
        </View>
      ) : (
        <>
          {pendingActions.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Active</Text>
              </View>
              {pendingActions.map(renderAction)}
            </>
          )}

          {completedActions.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Completed</Text>
              </View>
              {completedActions.map(renderAction)}
            </>
          )}
        </>
      )}
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  actionCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionHeader: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 20,
  },
  actionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaDot: {
    color: colors.textMuted,
    fontSize: 12,
  },
  agentNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    backgroundColor: colors.accentDim,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  agentNoteText: {
    fontSize: 12,
    color: colors.accent,
    flex: 1,
    lineHeight: 16,
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    marginLeft: 28,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.success + '40',
  },
  completeBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
});
