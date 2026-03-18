import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

const arloImage = require('../../assets/arlo-waving.webp');

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
  'bid-adjustment': 'Bid adjustment analysis complete. Modelled 3 scenarios across affected campaigns. Recommended option: redistribute 15% of underperforming campaign budget to maintain ROAS target. Estimated weekly profit improvement: \u00A32.1k.',
  'report': 'Status slide updated with this week\'s performance data. Key highlights added: mention rate trend, competitive positioning shift, and source attribution changes. Ready to add to your weekly deck.',
};

export default function AgentModal({ visible, insight, onClose, onApprove, onStart }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const wiggleAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        setCurrentStep(0);
        setCompleted(false);
      });
      return;
    }

    // Slide in
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    if (insight && onStart) onStart(insight);

    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -12, duration: 350, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 4, duration: 350, useNativeDriver: true }),
      ])
    );
    bounce.start();

    const wiggle = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
        Animated.timing(wiggleAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ])
    );
    wiggle.start();

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.95, duration: 500, useNativeDriver: true }),
      ])
    );
    breathe.start();

    const spin = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 1200, easing: Easing.linear, useNativeDriver: true })
    );
    spin.start();

    let step = 0;
    const advance = () => {
      if (step < agentSteps.length - 1) {
        step += 1;
        setCurrentStep(step);
        setTimeout(advance, agentSteps[step].duration);
      } else {
        setTimeout(() => {
          setCompleted(true);
          bounce.stop();
          wiggle.stop();
          breathe.stop();
          spin.stop();
          bounceAnim.setValue(0);
          wiggleAnim.setValue(0);
          scaleAnim.setValue(1);
        }, agentSteps[step].duration);
      }
    };
    setTimeout(advance, agentSteps[0].duration);

    return () => { bounce.stop(); wiggle.stop(); breathe.stop(); spin.stop(); };
  }, [visible]);

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const wiggleInterpolate = wiggleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  if (!insight && !visible) return null;

  const resultText = agentResults[insight?.agentAction?.type]
    || 'Analysis complete. Output generated and ready for review.';

  return (
    <Animated.View
      style={[styles.overlay, { opacity: overlayOpacity }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity style={styles.overlayTap} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {/* Handle + close */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Arlo + status */}
          <View style={styles.agentHeader}>
            {!completed ? (
              <View style={styles.arloWorking}>
                <Animated.View style={{ transform: [
                  { translateY: bounceAnim },
                  { rotate: wiggleInterpolate },
                  { scale: scaleAnim },
                ] }}>
                  <Image source={arloImage} style={styles.arloModal} resizeMode="contain" />
                </Animated.View>
                <Animated.View style={[styles.spinRing, { transform: [{ rotate: spinInterpolate }] }]}>
                  <View style={styles.spinDot} />
                </Animated.View>
              </View>
            ) : (
              <View style={styles.arloComplete}>
                <Image source={arloImage} style={styles.arloModal} resizeMode="contain" />
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                </View>
              </View>
            )}
            <Text style={styles.agentTitle}>
              {completed ? 'Ready for review' : 'Arlo is working...'}
            </Text>
            <Text style={styles.agentSubtitle}>
              {insight?.agentAction?.description}
            </Text>
          </View>

          {/* Steps */}
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

          {/* Result */}
          {completed && (
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>Agent output</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{resultText}</Text>
              </View>
              <View style={styles.approvalRow}>
                <TouchableOpacity style={styles.rejectBtn} onPress={onClose}>
                  <Text style={styles.rejectText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove?.(insight)}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.navy} />
                  <Text style={styles.approveText}>Approve & execute</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  overlayTap: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.bgSheet,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 10,
    maxHeight: '85%',
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
  arloWorking: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arloModal: {
    width: 48,
    height: 48,
  },
  spinRing: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'transparent',
    borderTopColor: colors.lime,
    borderRightColor: colors.lime,
  },
  spinDot: {
    position: 'absolute',
    top: -3,
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lime,
  },
  arloComplete: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.bgSheet,
    borderRadius: 12,
    padding: 1,
  },
  agentTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  agentSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: spacing.lg,
  },
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
    borderColor: colors.lime,
    backgroundColor: colors.limeDim,
  },
  stepLabel: {
    fontFamily: FONT_FAMILY,
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
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
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
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  approvalRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rejectBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rejectText: {
    fontFamily: FONT_FAMILY,
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
    borderRadius: radius.full,
    backgroundColor: colors.lime,
  },
  approveText: {
    fontFamily: FONT_FAMILY,
    color: colors.navy,
    fontSize: 14,
    fontWeight: '700',
  },
});
