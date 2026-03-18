import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Image, Platform, ScrollView,
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
  'content-brief': 'Content brief generated with targeted recommendations. Identified 4 content gaps where competitors are being cited by LLMs.',
  'investigation': 'Investigation complete. Traced source attribution patterns across 15 LLM responses. Identified 3 key competitor content pages.',
  'competitive-analysis': 'Competitive analysis mapped positioning across all tracked prompts. Primary competitor advantage: fresher content and stronger structured data.',
  'bid-adjustment': 'Bid adjustment analysis complete. Modelled 3 scenarios. Recommended: redistribute 15% of underperforming budget. Est. weekly profit improvement: \u00A32.1k.',
  'report': 'Status slide updated with this week\'s performance data. Key highlights: mention rate trend, competitive positioning shift, and source attribution changes.',
};

export default function AgentModal({ visible, insight, onClose, onApprove }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => { setCurrentStep(0); setCompleted(false); });
      return;
    }

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    let step = 0;
    const advance = () => {
      if (step < agentSteps.length - 1) {
        step += 1;
        setCurrentStep(step);
        setTimeout(advance, agentSteps[step].duration);
      } else {
        setTimeout(() => setCompleted(true), agentSteps[step].duration);
      }
    };
    setTimeout(advance, agentSteps[0].duration);
  }, [visible]);

  if (!insight && !visible) return null;

  const resultText = agentResults[insight?.agentAction?.type] || 'Analysis complete. Output generated and ready for review.';

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableOpacity style={styles.overlayTap} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.agentHeader}>
            <View style={styles.arloWrap}>
              <Image source={arloImage} style={styles.arloImg} resizeMode="contain" />
              {completed && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                </View>
              )}
            </View>
            <Text style={styles.agentTitle}>{completed ? 'Ready for review' : 'Arlo is working...'}</Text>
            <Text style={styles.agentSubtitle}>{insight?.agentAction?.description}</Text>
          </View>

          <View style={styles.steps}>
            {agentSteps.map((step, idx) => {
              const isDone = completed || idx < currentStep;
              const isActive = !completed && idx === currentStep;
              return (
                <View key={idx} style={styles.stepRow}>
                  <View style={[styles.stepDot, isDone && styles.stepDotDone, isActive && styles.stepDotActive]}>
                    {isDone && <Ionicons name="checkmark" size={10} color="#fff" />}
                  </View>
                  <Text style={[styles.stepLabel, isDone && styles.stepLabelDone, isActive && styles.stepLabelActive]}>
                    {step.label}{isActive ? '...' : ''}
                  </Text>
                </View>
              );
            })}
          </View>

          {completed && (
            <View style={styles.resultSection}>
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{resultText}</Text>
              </View>
              <View style={styles.approvalRow}>
                <TouchableOpacity style={styles.rejectBtn} onPress={onClose}>
                  <Text style={styles.rejectText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove?.(insight)}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.navy} />
                  <Text style={styles.approveText}>Approve</Text>
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
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', zIndex: 100 },
  overlayTap: { flex: 1 },
  sheet: { backgroundColor: colors.bgSheet, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl + 10, maxHeight: '85%' },
  header: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.md },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderLight },
  closeBtn: { position: 'absolute', right: 0, top: spacing.sm, padding: spacing.sm },
  agentHeader: { alignItems: 'center', marginBottom: spacing.lg },
  arloWrap: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  arloImg: { width: 48, height: 48 },
  checkBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.bgSheet, borderRadius: 12, padding: 1 },
  agentTitle: { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
  agentSubtitle: { fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 18, paddingHorizontal: spacing.lg },
  steps: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  stepDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.bgCard, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepDotDone: { backgroundColor: colors.lime, borderColor: colors.lime },
  stepDotActive: { borderColor: colors.blue, backgroundColor: colors.limeDim },
  stepLabel: { fontFamily: FONT_FAMILY, fontSize: 14, color: colors.textMuted },
  stepLabelDone: { color: colors.textSecondary },
  stepLabelActive: { color: colors.textPrimary, fontWeight: '600' },
  resultSection: { marginTop: spacing.sm },
  resultBox: { backgroundColor: colors.bgCard, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  resultText: { fontFamily: FONT_FAMILY, fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  approvalRow: { flexDirection: 'row', gap: spacing.sm },
  rejectBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.md, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  rejectText: { fontFamily: FONT_FAMILY, color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  approveBtn: { flex: 1.3, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: radius.full, backgroundColor: colors.lime },
  approveText: { fontFamily: FONT_FAMILY, color: colors.navy, fontSize: 14, fontWeight: '700' },
});
