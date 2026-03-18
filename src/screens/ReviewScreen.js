import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { useWorkflows } from '../context/WorkflowsContext';

const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

function copyToClipboard(text) {
  if (IS_WEB && navigator?.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

function DeliverableCard({ workflow, onMarkReviewed }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isAISearch = workflow.insightType === 'ai-search';
  const isReviewed = workflow.status === 'approved';
  const del = workflow.deliverable;

  const handleCopy = useCallback(() => {
    copyToClipboard(`${del.title}\n\n${del.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [del]);

  return (
    <View style={[styles.card, isReviewed && styles.cardReviewed]}>
      {/* Top badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.typeBadge, { backgroundColor: isAISearch ? colors.aiSearchDim : colors.ppcDim }]}>
          <Ionicons name={isAISearch ? 'sparkles' : 'search'} size={10} color={isAISearch ? colors.aiSearch : colors.ppc} />
          <Text style={[styles.typeBadgeText, { color: isAISearch ? colors.aiSearch : colors.ppc }]}>
            {isAISearch ? 'AI Search' : 'PPC'}
          </Text>
        </View>
        {isReviewed && (
          <View style={styles.reviewedBadge}>
            <Ionicons name="checkmark-circle" size={12} color={colors.success} />
            <Text style={styles.reviewedText}>Reviewed</Text>
          </View>
        )}
      </View>

      {/* Title */}
      <TouchableOpacity onPress={() => setExpanded((p) => !p)} activeOpacity={0.7}>
        <View style={styles.titleRow}>
          <Ionicons name="document-text" size={18} color={colors.lime} />
          <Text style={styles.deliverableTitle}>{del.title}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
        </View>
      </TouchableOpacity>

      {/* Prompt group */}
      <Text style={styles.promptGroup}>{workflow.promptGroup}</Text>

      {/* Action buttons — always visible */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
          <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={colors.lime} />
          <Text style={styles.actionBtnText}>{copied ? 'Copied!' : 'Copy'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={14} color={colors.lime} />
          <Text style={styles.actionBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
          <Ionicons name="mail-outline" size={14} color={colors.lime} />
          <Text style={styles.actionBtnText}>Email</Text>
        </TouchableOpacity>
        {!isReviewed && (
          <TouchableOpacity style={styles.actionBtnReview} onPress={() => onMarkReviewed(workflow.id)} activeOpacity={0.7}>
            <Ionicons name="checkmark" size={14} color={colors.navy} />
          </TouchableOpacity>
        )}
      </View>

      {/* Expandable content */}
      {expanded && (
        <ScrollView style={styles.contentScroll} nestedScrollEnabled>
          {del.body.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;
            if (trimmed === trimmed.toUpperCase() && trimmed.length < 60 && !trimmed.includes('£') && !trimmed.includes('%')) {
              return null;
            }
            const lines = trimmed.split('\n');
            if (lines.length === 1 && !trimmed.endsWith('.') && !trimmed.endsWith(')') && trimmed.length < 80 && !trimmed.startsWith('-') && !trimmed.match(/^\d+\./)) {
              return <Text key={idx} style={styles.sectionTitle}>{trimmed}</Text>;
            }
            return <Text key={idx} style={styles.bodyText}>{trimmed}</Text>;
          })}
        </ScrollView>
      )}

      {/* Preview (collapsed) */}
      {!expanded && (
        <Text style={styles.previewText} numberOfLines={2}>{del.body}</Text>
      )}

      {/* Time */}
      <Text style={styles.timeText}>
        Completed {workflow.completedAt || workflow.startedAt}
      </Text>
    </View>
  );
}

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const { completedWorkflows, approveWorkflow, reviewCount } = useWorkflows();
  const topPad = Math.max(insets.top, IS_WEB ? 40 : 0) + spacing.md;

  const unreviewed = completedWorkflows.filter((w) => w.status === 'complete');
  const reviewed = completedWorkflows.filter((w) => w.status === 'approved');

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={[styles.titleArea, { paddingTop: topPad }]}>
        <Text style={styles.title}>Review</Text>
        <Text style={styles.subtitle}>
          {reviewCount > 0 ? `${reviewCount} deliverable${reviewCount !== 1 ? 's' : ''} to review` : 'All caught up'}
        </Text>
      </View>

      {completedWorkflows.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No deliverables yet</Text>
          <Text style={styles.emptyText}>
            Run a workflow from the Insights tab. When it completes, the output will appear here for you to review.
          </Text>
        </View>
      ) : (
        <>
          {unreviewed.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>To review</Text>
              </View>
              {unreviewed.map((wf) => (
                <DeliverableCard key={wf.id} workflow={wf} onMarkReviewed={approveWorkflow} />
              ))}
            </>
          )}
          {reviewed.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>Reviewed</Text>
              </View>
              {reviewed.map((wf) => (
                <DeliverableCard key={wf.id} workflow={wf} onMarkReviewed={approveWorkflow} />
              ))}
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
  sectionLabel: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },

  // Card
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardReviewed: { opacity: 0.6 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
  },
  typeBadgeText: { fontFamily: FONT_FAMILY, fontSize: 10, fontWeight: '600' },
  reviewedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewedText: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', color: colors.success },

  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  deliverableTitle: { fontFamily: FONT_FAMILY, fontSize: 15, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  promptGroup: { fontFamily: FONT_FAMILY, fontSize: 12, fontStyle: 'italic', color: colors.textMuted, marginBottom: 8 },
  previewText: { fontFamily: FONT_FAMILY, fontSize: 12, color: colors.textSecondary, lineHeight: 18 },

  // Content
  contentScroll: { maxHeight: 400, backgroundColor: colors.bgCardElevated, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: '700', color: colors.lime, marginTop: 12, marginBottom: 4 },
  bodyText: { fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textPrimary, lineHeight: 20, marginBottom: 8 },

  // Actions — always visible
  actionRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border,
  },
  actionBtnText: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', color: colors.lime },
  actionBtnReview: {
    width: 36, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.lime,
  },

  timeText: { fontFamily: FONT_FAMILY, fontSize: 11, color: colors.textMuted, marginTop: 8 },
});
