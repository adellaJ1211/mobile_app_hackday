import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { useActions } from '../context/ActionsContext';

const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

export default function ActionsScreen() {
  const insets = useSafeAreaInsets();
  const { actions, completeAction } = useActions();
  const topPad = Math.max(insets.top, IS_WEB ? 40 : 0) + spacing.md;

  const pending = actions.filter((a) => a.status !== 'done');
  const done = actions.filter((a) => a.status === 'done');

  const renderAction = (action) => (
    <View key={action.id} style={styles.actionCard}>
      <View style={styles.actionRow}>
        <Ionicons
          name={action.status === 'done' ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={action.status === 'done' ? colors.success : colors.textMuted}
        />
        <View style={styles.actionContent}>
          <Text style={[styles.actionTitle, action.status === 'done' && styles.actionTitleDone]} numberOfLines={2}>
            {action.insightTitle}
          </Text>
          <Text style={styles.actionPrompt}>{action.promptGroup}</Text>
        </View>
        {action.status !== 'done' && (
          <TouchableOpacity style={styles.doneBtn} onPress={() => completeAction(action.insightId)}>
            <Ionicons name="checkmark" size={14} color={colors.success} />
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={[styles.titleArea, { paddingTop: topPad }]}>
        <Text style={styles.title}>Actions</Text>
        <Text style={styles.subtitle}>
          {pending.length} item{pending.length !== 1 ? 's' : ''} to do
        </Text>
      </View>

      {actions.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="checkbox-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No actions yet</Text>
          <Text style={styles.emptyText}>
            Swipe through insights and tap "Add to actions" to build your list.
          </Text>
        </View>
      ) : (
        <>
          {pending.length > 0 && (
            <>
              <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>To do</Text></View>
              {pending.map(renderAction)}
            </>
          )}
          {done.length > 0 && (
            <>
              <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Completed</Text></View>
              {done.map(renderAction)}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  titleArea: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: { fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontFamily: FONT_FAMILY, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl * 2, paddingHorizontal: spacing.xl },
  emptyTitle: { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm },
  emptyText: { fontFamily: FONT_FAMILY, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  sectionHeader: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  sectionTitle: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  actionCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.sm,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionContent: { flex: 1 },
  actionTitle: { fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: '600', color: colors.textPrimary, lineHeight: 20 },
  actionTitleDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  actionPrompt: { fontFamily: FONT_FAMILY, fontSize: 12, fontStyle: 'italic', color: colors.textMuted, marginTop: 2 },
  doneBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1, borderColor: colors.success + '40',
  },
  doneBtnText: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', color: colors.success },
});
