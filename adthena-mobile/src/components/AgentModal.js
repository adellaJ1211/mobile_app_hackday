import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const agentSteps = [
  { label: 'Analysing insight data', duration: 1200 },
  { label: 'Reviewing relevant sources', duration: 1500 },
  { label: 'Generating recommendations', duration: 1800 },
  { label: 'Preparing output for review', duration: 1000 },
];

const agentResults = {
  'content-brief': 'Content brief generated with targeted recommendations. Identified 4 content gaps where competitors are being cited by LLMs. Draft includes proposed topics, recommended source page improvements, and entity markup suggestions.',
  'investigation': 'Investigation complete. Traced source attribution patterns across 15 LLM responses. Identified 3 key competitor content pages driving their mentions. Recommended actions prioritised by estimated impact on citation rate.',
  'competitive-analysis': 'Competitive analysis mapped positioning across all tracked prompts. Primary competitor advantage: fresher content (avg. 23 days vs your 67 days), stronger structured data, and more specific product-level pages being cited.',
  'bid-adjustment': 'Bid adjustment analysis complete. Modelled 3 scenarios across affected campaigns. Recommended option: redistribute 15% of underperforming campaign budget to maintain ROAS target. Estimated weekly profit improvement: £2.1k.',
  'report': 'Status slide updated with this week\'s performance data. Key highlights added: mention rate trend, competitive positioning shift, and source attribution changes. Ready to add to your weekly deck.',
};

export default function AgentModal({ visible, insight, onClose, onApprove, onStart }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setCompleted(false);
      return;
    }

    // Notify parent that agent has started
    if (insight && onStart) {
      onStart(insight);
    }

    // Spin animation
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();

    // Step through agent progress
    let step = 0;
    const advance = () => {
      if (step < agentSteps.length - 1) {
        step += 1;
        setCurrentStep(step);
        setTimeout(advance, agentSteps[step].duration);
      } else {
        setTimeout(() => {
          setCompleted(true);
          spin.stop();
        }, agentSteps[step].duration);
      }
    };
    setTimeout(advance, agentSteps[0].duration);

    return () => spin.stop();
  }, [visible]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!insight) return null;

  const resultText = agentResults[insight.agentAction.type]
    || 'Analysis complete. Output generated and ready for review.';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Agent identity */}
          <View style={styles.agentHeader}>
            {!completed ? (
              <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
                <Ionicons name="flash" size={32} color={colors.accent} />
              </Animated.View>
            ) : (
              <View style={styles.completedIcon}>
                <Ionicons name="checkmark-circle" size={36} color={colors.success} />
              </View>
            )}
            <Text style={styles.agentTitle}>
              {completed ? 'Ready for review' : 'Agent working...'}
            </Text>
            <Text style={styles.agentSubtitle}>
              {insight.agentAction.description}
            </Text>
          </View>

          {/* Progress steps */}
          <View style={styles.steps}>
            {agentSteps.map((step, idx) => {
              const isDone = completed || idx < currentStep;
              const isActive = !completed && idx === currentStep;

              return (
                <View key={idx} style={styles.stepRow}>
                  <View style={[
                    styles.stepDot,
                    isDone && styles.stepDotDone,
                    isActive && styles.stepDotActive,
                  ]}>
                    {isDone && <Ionicons name="checkmark" size={10} color="#fff" />}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    isDone && styles.stepLabelDone,
                    isActive && styles.stepLabelActive,
                  ]}>
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Result (when completed) */}
          {completed && (
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>Agent output</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{resultText}</Text>
              </View>

              {/* Approval buttons */}
              <View style={styles.approvalRow}>
                <TouchableOpacity style={styles.rejectBtn} onPress={onClose}>
                  <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
                  <Text style={styles.rejectText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => onApprove?.(insight)}
                >
                  <Ionicons name="checkmark-circle" size={18} color={colors.textInverse} />
                  <Text style={styles.approveText}>Approve & execute</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.bgSheet,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    minHeight: 400,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderLight,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    top: spacing.sm,
    padding: spacing.sm,
  },
  agentHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  agentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  agentSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
  completedIcon: {},
  steps: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.bgCard,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  stepDotActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  stepLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  stepLabelDone: {
    color: colors.textSecondary,
  },
  stepLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  resultSection: {
    marginTop: spacing.sm,
  },
  resultTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  resultBox: {
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  resultText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 21,
  },
  approvalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  approveBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  approveText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
});
