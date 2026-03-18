import React, { useEffect, useRef } from 'react';
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
  const isRunning = workflow.status === 'running';
  const isComplete = workflow.status === 'complete';
  const isApproved = workflow.status === 'approved';
  const isAISearch = workflow.insightType === 'ai-search';

  return (
    <View style={[styles.card, isApproved && styles.cardApproved]}>
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
            {isRunning ? 'Running' : isComplete ? 'Ready for review' : 'Approved'}
          </Text>
        </View>
      </View>

      {/* Title + meta */}
      <Text style={styles.workflowTitle}>{workflow.agentAction.label}</Text>
      <Text style={styles.workflowSource} numberOfLines={1}>{workflow.insightTitle}</Text>
      <Text style={styles.workflowPrompt}>{workflow.promptGroup}</Text>

      {/* Step progress */}
      <View style={styles.stepper}>
        {workflow.steps.map((step, idx) => {
          const isDone = step.status === 'done';
          const isActive = step.status === 'active';
          const isLast = idx === workflow.steps.length - 1;

          return (
            <View key={idx}>
              <View style={styles.stepRow}>
                {/* Dot */}
                <View style={styles.stepDotCol}>
                  {isDone ? (
                    <View style={[styles.stepDot, styles.stepDotDone]}>
                      <Ionicons name="checkmark" size={9} color="#fff" />
                    </View>
                  ) : isActive ? (
                    <View style={[styles.stepDot, styles.stepDotActive]}>
                      <PulsingDot color={colors.blue} size={6} />
                    </View>
                  ) : (
                    <View style={[styles.stepDot, styles.stepDotPending]} />
                  )}
                </View>
                {/* Label */}
                <Text style={[
                  styles.stepLabel,
                  isDone && styles.stepLabelDone,
                  isActive && styles.stepLabelActive,
                ]} numberOfLines={1}>
                  {step.label}{isActive ? '...' : ''}
                </Text>
              </View>
              {/* Connector line */}
              {!isLast && (
                <View style={styles.stepConnectorWrap}>
                  <View style={[styles.stepConnector, {
                    backgroundColor: isDone ? colors.blue : 'rgba(255,255,255,0.1)',
                  }]} />
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Result + approve */}
      {isComplete && workflow.result && (
        <View style={styles.resultSection}>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>{workflow.result}</Text>
          </View>
          <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove(workflow.id)} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={16} color={colors.navy} />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Time */}
      <Text style={styles.timeText}>Started {workflow.startedAt}</Text>
    </View>
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
  workflowSource: {
    fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textSecondary, marginBottom: 2,
  },
  workflowPrompt: {
    fontFamily: FONT_FAMILY, fontSize: 12, fontStyle: 'italic',
    color: colors.textMuted, marginBottom: 12,
  },

  // Stepper
  stepper: { marginBottom: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepDotCol: { width: 20, alignItems: 'center' },
  stepDot: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  stepDotDone: { backgroundColor: colors.lime, borderColor: colors.lime },
  stepDotActive: { borderColor: colors.blue, backgroundColor: colors.limeDim },
  stepDotPending: {},
  stepLabel: { fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textMuted, flex: 1 },
  stepLabelDone: { color: colors.textSecondary },
  stepLabelActive: { color: colors.textPrimary, fontWeight: '600' },
  stepConnectorWrap: { paddingLeft: 9, height: 16, justifyContent: 'center' },
  stepConnector: { width: 2, height: 12, borderRadius: 1 },

  // Result
  resultSection: { marginTop: 4, marginBottom: 4 },
  resultBox: {
    backgroundColor: colors.bgCardElevated, padding: spacing.md,
    borderRadius: radius.md, marginBottom: spacing.sm,
  },
  resultText: {
    fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textPrimary, lineHeight: 19,
  },
  approveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: radius.full,
    backgroundColor: colors.lime,
  },
  approveBtnText: {
    fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: '700', color: colors.navy,
  },

  timeText: {
    fontFamily: FONT_FAMILY, fontSize: 11, color: colors.textMuted, marginTop: 6,
  },
});
