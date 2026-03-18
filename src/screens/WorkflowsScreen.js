import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { useWorkflows } from '../context/WorkflowsContext';

const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

function PulsingDot({ color, size = 8 }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: color, opacity: anim,
    }} />
  );
}

function WorkflowCard({ workflow, onApprove }) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = workflow.status === 'running';
  const isComplete = workflow.status === 'complete';
  const isApproved = workflow.status === 'approved';
  const isAISearch = workflow.insightType === 'ai-search';

  return (
    <TouchableOpacity
      style={[styles.card, isApproved && styles.cardApproved]}
      activeOpacity={0.8}
      onPress={() => setExpanded((p) => !p)}
    >
      {/* Top badges */}
      <View style={styles.badgeRow}>
        <View style={[styles.typeBadge, { backgroundColor: isAISearch ? colors.aiSearchDim : colors.ppcDim }]}>
          <Ionicons name={isAISearch ? 'sparkles' : 'search'} size={10} color={isAISearch ? colors.aiSearch : colors.ppc} />
          <Text style={[styles.typeBadgeText, { color: isAISearch ? colors.aiSearch : colors.ppc }]}>
            {isAISearch ? 'AI Search' : 'PPC'}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          {isRunning && <PulsingDot color={colors.lime} />}
          {isComplete && <View style={[styles.dot, { backgroundColor: colors.success }]} />}
          {isApproved && <Ionicons name="checkmark-circle" size={12} color={colors.textMuted} />}
          <Text style={[styles.statusText, {
            color: isRunning ? colors.lime : isComplete ? colors.success : colors.textMuted,
          }]}>
            {isRunning ? 'Running' : isComplete ? 'Complete' : 'Reviewed'}
          </Text>
        </View>
      </View>

      {/* Title + meta */}
      <Text style={styles.workflowTitle}>{workflow.agentAction.label}</Text>
      <Text style={styles.workflowPrompt}>{workflow.promptGroup}</Text>

      {/* Collapsed: summary row */}
      {!expanded && (
        <View style={styles.collapsedRow}>
          <View style={styles.stepProgress}>
            {workflow.steps.map((step, idx) => {
              const isDone = step.status === 'done';
              const isActive = step.status === 'active';
              return (
                <View key={idx} style={[
                  styles.progressDot,
                  isDone && styles.progressDotDone,
                  isActive && styles.progressDotActive,
                ]} />
              );
            })}
          </View>
          <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
        </View>
      )}

      {/* Expanded: node-builder step detail */}
      {expanded && (
        <View style={styles.nodeBuilder}>
          {workflow.steps.map((step, idx) => {
            const isDone = step.status === 'done';
            const isActive = step.status === 'active';
            const isLast = idx === workflow.steps.length - 1;

            return (
              <View key={idx}>
                <View style={styles.nodeRow}>
                  {/* Node circle */}
                  <View style={styles.nodeCol}>
                    {isDone ? (
                      <View style={[styles.node, styles.nodeDone]}>
                        <Ionicons name="checkmark" size={11} color="#fff" />
                      </View>
                    ) : isActive ? (
                      <View style={[styles.node, styles.nodeActive]}>
                        <PulsingDot color={colors.blue} size={6} />
                      </View>
                    ) : (
                      <View style={[styles.node, styles.nodePending]}>
                        <Text style={styles.nodeNumber}>{idx + 1}</Text>
                      </View>
                    )}
                  </View>
                  {/* Label + time */}
                  <View style={styles.nodeContent}>
                    <Text style={[
                      styles.nodeLabel,
                      isDone && styles.nodeLabelDone,
                      isActive && styles.nodeLabelActive,
                    ]}>
                      {step.label}{isActive ? '...' : ''}
                    </Text>
                    {isDone && step.completedAt && (
                      <Text style={styles.nodeTime}>{step.completedAt}</Text>
                    )}
                  </View>
                </View>
                {/* Connector */}
                {!isLast && (
                  <View style={styles.connectorWrap}>
                    <View style={[styles.connector, {
                      backgroundColor: isDone ? colors.lime : 'rgba(255,255,255,0.08)',
                    }]} />
                  </View>
                )}
              </View>
            );
          })}

          {/* Deliverable preview when complete */}
          {(isComplete || isApproved) && workflow.deliverable && (
            <View style={styles.deliverableSection}>
              <View style={styles.deliverableBox}>
                <Ionicons name="document-text" size={14} color={colors.lime} />
                <Text style={styles.deliverableTitle}>{workflow.deliverable.title}</Text>
              </View>
              <Text style={styles.deliverableHint}>Available in Review tab</Text>
            </View>
          )}

          {/* Time */}
          <Text style={styles.timeText}>
            Started {workflow.startedAt}
            {workflow.completedAt ? ` · Completed ${workflow.completedAt}` : ''}
          </Text>

          {/* Collapse */}
          <TouchableOpacity style={styles.collapseBtn} onPress={() => setExpanded(false)}>
            <Ionicons name="chevron-up" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function WorkflowsScreen() {
  const insets = useSafeAreaInsets();
  const { workflows, approveWorkflow, activeCount, completeCount } = useWorkflows();
  const topPad = Math.max(insets.top, IS_WEB ? 40 : 0) + spacing.md;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={[styles.titleArea, { paddingTop: topPad }]}>
        <Text style={styles.title}>Workflows</Text>
        <Text style={styles.subtitle}>
          {activeCount} active{' '}&middot;{' '}{completeCount} complete
        </Text>
      </View>

      {workflows.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="git-branch-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No workflows yet</Text>
          <Text style={styles.emptyText}>
            Swipe through insights and tap an agent action to start a workflow.
          </Text>
        </View>
      ) : (
        workflows.map((wf) => (
          <WorkflowCard key={wf.id} workflow={wf} onApprove={approveWorkflow} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  titleArea: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  title: {
    fontFamily: FONT_FAMILY, fontSize: 28, fontWeight: '800',
    color: colors.textPrimary, letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT_FAMILY, fontSize: 14, color: colors.textSecondary, marginTop: 4,
  },
  emptyState: {
    alignItems: 'center', paddingTop: spacing.xxl * 2, paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: '700',
    color: colors.textPrimary, marginTop: spacing.md, marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: FONT_FAMILY, fontSize: 14, color: colors.textMuted,
    textAlign: 'center', lineHeight: 20,
  },

  // Card
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    backgroundColor: colors.bgCard, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  cardApproved: { opacity: 0.6 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full,
  },
  typeBadgeText: { fontFamily: FONT_FAMILY, fontSize: 10, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600' },
  workflowTitle: {
    fontFamily: FONT_FAMILY, fontSize: 16, fontWeight: '600',
    color: colors.textPrimary, marginBottom: 2,
  },
  workflowPrompt: {
    fontFamily: FONT_FAMILY, fontSize: 12, fontStyle: 'italic',
    color: colors.textMuted, marginBottom: 8,
  },

  // Collapsed row
  collapsedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepProgress: { flexDirection: 'row', gap: 4 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.1)' },
  progressDotDone: { backgroundColor: colors.lime },
  progressDotActive: { backgroundColor: colors.blue },

  // Node builder
  nodeBuilder: { marginTop: 8 },
  nodeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  nodeCol: { width: 28, alignItems: 'center' },
  node: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  nodeDone: { backgroundColor: colors.lime, borderColor: colors.lime },
  nodeActive: { borderColor: colors.blue, backgroundColor: colors.limeDim },
  nodePending: { borderColor: 'rgba(255,255,255,0.15)' },
  nodeNumber: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', color: colors.textMuted },
  nodeContent: { flex: 1 },
  nodeLabel: { fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textMuted },
  nodeLabelDone: { color: colors.textSecondary },
  nodeLabelActive: { color: colors.textPrimary, fontWeight: '600' },
  nodeTime: { fontFamily: FONT_FAMILY, fontSize: 10, color: colors.textMuted, marginTop: 1 },
  connectorWrap: { paddingLeft: 13, height: 20, justifyContent: 'center' },
  connector: { width: 2, height: 16, borderRadius: 1 },

  // Deliverable
  deliverableSection: { marginTop: 12, marginBottom: 4 },
  deliverableBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bgCardElevated, padding: spacing.sm + 2,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  deliverableTitle: { fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: '600', color: colors.textPrimary, flex: 1 },
  deliverableHint: { fontFamily: FONT_FAMILY, fontSize: 11, color: colors.textMuted, marginTop: 4, marginLeft: 2 },

  timeText: {
    fontFamily: FONT_FAMILY, fontSize: 11, color: colors.textMuted, marginTop: 10,
  },
  collapseBtn: { alignItems: 'center', paddingTop: 8 },
});
