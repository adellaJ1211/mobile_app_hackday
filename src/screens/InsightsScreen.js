import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder, Dimensions,
  TouchableOpacity, StatusBar, Platform, Image, ScrollView, Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { insights } from '../data/mockData';
import AgentModal from '../components/AgentModal';
import InsightCardVisual from '../components/InsightCardVisual';
import { useWorkflows } from '../context/WorkflowsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const lt = colors.light;
const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

const arloImage = require('../../assets/arlo-waving.webp');

// --- Headline mapping ---
function getConversationalHeadline(insight) {
  // Use bespoke headline if provided
  if (insight.headline) return insight.headline;
  const pg = insight.promptGroup;
  if (insight.type === 'ppc') {
    return insight.insightType === 'Review'
      ? `${pg} needs attention`
      : `Monitor ${pg}`;
  }
  switch (insight.insightType) {
    case 'Invisible':
      if (insight.title.includes('No brands'))
        return `No one owns "${pg}" yet \u2014 first-mover opportunity`;
      return `Competitors dominate "${pg}" \u2014 you're invisible`;
    case 'At Risk':
      if (insight.title.includes('Cautionary'))
        return `Caution: negative framing detected in "${pg}"`;
      if (insight.title.includes('Competitor recommended'))
        return `A competitor is recommended over you for "${pg}"`;
      return `Your position is at risk in "${pg}"`;
    case 'Opportunity':
      if (insight.title.includes('Cited but never mentioned'))
        return `Your content is cited but you're not named`;
      if (insight.title.includes('Mentioned but not cited'))
        return `Third parties control your brand story in "${pg}"`;
      return `There's an opportunity in "${pg}"`;
    case 'Growing':
      return `Room to grow in "${pg}"`;
    case 'Strong Position':
      return `Strong position in "${pg}" \u2014 keep it up`;
    default:
      return insight.title;
  }
}

const swipeInsights = insights.filter((i) => i.severity === 'high' || i.severity === 'medium' || i.severity === 'low');

// ==================== ARLO BOBBING ====================
function ArloBobbing({ size = 150 }) {
  const bobY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobY, { toValue: -8, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(bobY, { toValue: 8, duration: 1000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ translateY: bobY }], marginBottom: 24 }}>
      <Image source={arloImage} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

// ==================== ARLO BOUNCE ====================
function ArloBounce({ size = 120 }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 3, tension: 60, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 24 }}>
      <Image source={arloImage} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

// ==================== GREETING SCREEN ====================
function GreetingScreen({ onStart, insightCount }) {
  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.greetingContent}>
        <ArloBobbing size={150} />
        <Text style={styles.greetingText}>
          Arlo has <Text style={styles.greetingHighlight}>{insightCount} insights</Text> for Capital One UK today.
        </Text>
        <Text style={styles.greetingSubtitle}>Your strategic intelligence briefing</Text>
        <TouchableOpacity style={[styles.pillBtn, { marginTop: 36 }]} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.pillBtnText}>Start review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================== COMPLETION SCREEN ====================
function CompletionScreen({ workflowCount, reviewCount, onGoToReview, onGoToWorkflows }) {
  const hasReviews = reviewCount > 0;
  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.greetingContent}>
        <ArloBounce size={120} />
        <Text style={styles.completeTitle}>All caught up!</Text>
        <Text style={styles.completeSubtitle}>
          {workflowCount > 0 ? `${workflowCount} workflow${workflowCount !== 1 ? 's' : ''} started` : 'No workflows started yet'}
        </Text>
        {hasReviews ? (
          <TouchableOpacity style={[styles.pillBtn, { marginTop: 32 }]} onPress={onGoToReview} activeOpacity={0.85}>
            <Text style={styles.pillBtnText}>Review results</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.pillBtn, { marginTop: 32 }]} onPress={onGoToWorkflows} activeOpacity={0.85}>
            <Text style={styles.pillBtnText}>Check workflow progress</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ==================== PROGRESS BAR ====================
function ProgressBar({ total, current, onNavigate }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: total }, (_, i) => {
        let bg = '#E5E5E5';
        if (i < current) bg = lt.progressFilled;
        else if (i === current) bg = lt.progressCurrent;
        return (
          <TouchableOpacity key={i} activeOpacity={0.7} onPress={() => onNavigate(i)} style={styles.progressTouchTarget}>
            <View style={[styles.progressSegment, { backgroundColor: bg }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ==================== INSIGHT SWIPE CARD ====================
function InsightSwipeCard({ insight, index, total, onNext, onPrev, onNavigate, onTriggerAgent, hasWorkflow }) {
  const pan = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pan.setValue(0);
    cardOpacity.setValue(0);
    Animated.timing(cardOpacity, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [insight.id]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy),
      onPanResponderMove: (_, gs) => { pan.setValue(gs.dx); },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: -SCREEN_WIDTH, duration: 200, useNativeDriver: true }).start(() => onNext());
        } else if (gs.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: SCREEN_WIDTH, duration: 200, useNativeDriver: true }).start(() => onPrev());
        } else {
          Animated.spring(pan, { toValue: 0, friction: 8, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const headline = getConversationalHeadline(insight);
  const isAISearch = insight.type === 'ai-search';
  // Insight type tag colour
  const tagColorMap = {
    'Content Gap': lt.severityHigh,
    'Source Gap': lt.severityHigh,
    'Competitive Threat': lt.severityMedium,
    'Brand Attribution': '#3B82F6',
    'Protect Position': '#10B981',
    'Bid Adjustment': lt.severityMedium,
  };
  const insightTag = {
    label: insight.insightLabel || insight.insightType,
    color: tagColorMap[insight.insightLabel] || '#64748B',
  };

  return (
    <Animated.View
      style={[styles.swipeOuter, { opacity: cardOpacity, transform: [{ translateX: pan }] }]}
      {...panResponder.panHandlers}
    >
      <View style={styles.swipeContent}>
        {/* Headline */}
        <Text style={styles.cardHeadline} numberOfLines={3}>{headline}</Text>

        {/* White detail card */}
        <View style={styles.detailCard}>
          {/* Badges */}
          <View style={styles.typeBadgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: isAISearch ? colors.aiSearchDim : colors.ppcDim }]}>
              <Ionicons name={isAISearch ? 'sparkles' : 'search'} size={10} color={isAISearch ? colors.aiSearch : colors.ppc} />
              <Text style={[styles.typeBadgeText, { color: isAISearch ? colors.aiSearch : colors.ppc }]}>
                {isAISearch ? 'AI Search' : 'PPC'}
              </Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: insightTag.color + '18' }]}>
              <View style={[styles.severityDot, { backgroundColor: insightTag.color }]} />
              <Text style={[styles.severityBadgeText, { color: insightTag.color }]}>
                {insightTag.label}
              </Text>
            </View>
          </View>
          {/* Visual content per insight type */}
          <InsightCardVisual insight={insight} />
        </View>

        {/* Workflow stepper */}
        {insight.workflowSteps && (
          <View style={styles.workflowPreview}>
            <Text style={styles.workflowLabel}>Workflow</Text>
            {insight.workflowSteps.map((step, idx) => (
              <View key={idx}>
                <View style={styles.stepperRow}>
                  <View style={styles.stepperCircle}>
                    <Text style={styles.stepperNumber}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepperText}>{step}</Text>
                </View>
                {idx < insight.workflowSteps.length - 1 && (
                  <View style={styles.stepperLine} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: 8 }} />

        {/* Single CTA */}
        <View style={styles.cardButtonCol}>
          {!hasWorkflow ? (
            <TouchableOpacity style={styles.btnPrimaryFull} onPress={() => onTriggerAgent(insight)} activeOpacity={0.85}>
              <Ionicons name="flash" size={15} color={colors.lime} />
              <Text style={styles.btnPrimaryFullText} numberOfLines={1}>{insight.agentAction.label}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.btnDisabledFull}>
              <Ionicons name="checkmark-circle" size={15} color={colors.lime} />
              <Text style={styles.btnDisabledFullText}>Workflow started</Text>
            </View>
          )}
        </View>
      </View>

    </Animated.View>
  );
}

// ==================== MAIN SCREEN ====================
export default function InsightsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState('greeting');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [agentInsight, setAgentInsight] = useState(null);
  const { startWorkflow, hasWorkflow, workflowCount, reviewCount } = useWorkflows();

  const topPad = Math.max(insets.top, IS_WEB ? 40 : 0) + spacing.sm;

  const handleStart = useCallback(() => { setPhase('swiping'); setCurrentIndex(0); }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < swipeInsights.length - 1) setCurrentIndex((p) => p + 1);
    else setPhase('complete');
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  }, [currentIndex]);

  const handleNavigate = useCallback((i) => {
    if (i >= 0 && i < swipeInsights.length) setCurrentIndex(i);
    else if (i >= swipeInsights.length) setPhase('complete');
  }, []);

  const handleTriggerAgent = useCallback((insight) => {
    startWorkflow(insight);
    setAgentInsight(insight);
  }, [startWorkflow]);

  const handleViewWorkflow = useCallback(() => {
    setAgentInsight(null);
    navigation?.navigate?.('Workflows');
  }, [navigation]);

  const handleGoToWorkflows = useCallback(() => {
    navigation?.navigate?.('Workflows');
  }, [navigation]);

  const handleGoToReview = useCallback(() => {
    navigation?.navigate?.('Review');
  }, [navigation]);

  if (phase === 'greeting') {
    return (
      <View style={[styles.fullScreen, { paddingTop: topPad }]}>
        <GreetingScreen onStart={handleStart} insightCount={swipeInsights.length} />
      </View>
    );
  }

  if (phase === 'complete') {
    return (
      <View style={[styles.fullScreen, { paddingTop: topPad }]}>
        <CompletionScreen workflowCount={workflowCount} reviewCount={reviewCount} onGoToReview={handleGoToReview} onGoToWorkflows={handleGoToWorkflows} />
      </View>
    );
  }

  const currentInsight = swipeInsights[currentIndex];

  return (
    <View style={[styles.fullScreen, { paddingTop: topPad }]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.swipeContainer}>
        <ProgressBar total={swipeInsights.length} current={currentIndex} onNavigate={handleNavigate} />
        <InsightSwipeCard
          key={currentInsight.id}
          insight={currentInsight}
          index={currentIndex}
          total={swipeInsights.length}
          onNext={handleNext}
          onPrev={handlePrev}
          onNavigate={handleNavigate}
          onTriggerAgent={handleTriggerAgent}
          hasWorkflow={hasWorkflow(currentInsight.id)}
        />
      </View>
      <AgentModal
        visible={!!agentInsight}
        insight={agentInsight}
        onClose={() => {
          setAgentInsight(null);
          // Auto-advance to next card after modal dismisses
          handleNext();
        }}
        onViewWorkflow={handleViewWorkflow}
      />
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  fullScreen: { flex: 1, backgroundColor: lt.bg },

  // Greeting
  greetingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, paddingBottom: 60 },
  greetingText: { fontFamily: FONT_FAMILY, fontSize: 20, fontWeight: '600', color: lt.headline, textAlign: 'center', lineHeight: 30 },
  greetingHighlight: { color: colors.blue, fontWeight: '700' },
  greetingSubtitle: { fontFamily: FONT_FAMILY, fontSize: 14, color: lt.bodyLight, marginTop: 8, textAlign: 'center' },
  pillBtn: { backgroundColor: lt.btnDark, paddingVertical: 15, paddingHorizontal: 44, borderRadius: radius.full },
  pillBtnText: { fontFamily: FONT_FAMILY, color: colors.lime, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  // Completion
  completeTitle: { fontFamily: FONT_FAMILY, fontSize: 24, fontWeight: '800', color: lt.headline, textAlign: 'center' },
  completeSubtitle: { fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: '500', color: lt.bodyLight, marginTop: 8, textAlign: 'center' },

  // Swipe
  swipeContainer: { flex: 1, paddingHorizontal: spacing.md },
  swipeOuter: { flex: 1, alignItems: 'center' },
  swipeContent: { flex: 1, width: '100%', alignItems: 'center' },

  // Progress
  progressContainer: { flexDirection: 'row', gap: 3, width: '100%', height: 28, alignItems: 'center', marginBottom: 4, zIndex: 10 },
  progressSegment: { width: '100%', height: 4, borderRadius: 2 },
  progressTouchTarget: { flex: 1, height: 28, justifyContent: 'center' },

  // Headline
  cardHeadline: { fontFamily: FONT_FAMILY, fontSize: 17, fontWeight: '600', color: lt.headline, textAlign: 'center', lineHeight: 24, marginBottom: 10, paddingHorizontal: 4 },

  // Detail card
  detailCard: { backgroundColor: lt.card, borderRadius: radius.xl, padding: spacing.sm + 4, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, marginBottom: 8 },
  typeBadgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  typeBadgeText: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600' },
  severityBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  severityDot: { width: 6, height: 6, borderRadius: 3 },
  severityBadgeText: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600' },
  metricBox: { backgroundColor: lt.metricBg, borderRadius: radius.md, padding: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  metricLabel: { fontFamily: FONT_FAMILY, fontSize: 12, color: lt.body, fontWeight: '500' },
  metricValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metricBefore: { fontFamily: FONT_FAMILY, fontSize: 12, color: lt.bodyLight },
  metricAfter: { fontFamily: FONT_FAMILY, fontSize: 14, fontWeight: '700' },
  cardSummary: { fontFamily: FONT_FAMILY, fontSize: 13, color: lt.body, lineHeight: 19, marginBottom: 8 },
  cardPromptGroup: { fontFamily: FONT_FAMILY, fontSize: 12, fontStyle: 'italic', color: lt.bodyLight },

  // Stacked buttons
  cardButtonCol: { width: '100%', marginBottom: 14 },
  btnPrimaryFull: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 13, borderRadius: radius.full, backgroundColor: lt.btnDark,
  },
  btnPrimaryFullText: { fontFamily: FONT_FAMILY, color: colors.lime, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  btnDisabledFull: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: radius.full, backgroundColor: lt.btnDark, opacity: 0.5,
  },
  btnDisabledFullText: { fontFamily: FONT_FAMILY, color: colors.lime, fontSize: 13, fontWeight: '700' },

  // Workflow stepper
  workflowPreview: { width: '100%', marginTop: 10 },
  workflowLabel: { fontFamily: FONT_FAMILY, fontSize: 9, fontWeight: '700', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepperCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: lt.bodyLight, alignItems: 'center', justifyContent: 'center' },
  stepperNumber: { fontFamily: FONT_FAMILY, fontSize: 11, fontWeight: '600', color: lt.bodyLight },
  stepperText: { fontFamily: FONT_FAMILY, fontSize: 12, color: lt.body, flex: 1 },
  stepperLine: { width: 1, height: 10, backgroundColor: lt.bodyLight, marginLeft: 12, opacity: 0.4 },

  // Nav arrows
  navArrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingBottom: 6, paddingTop: 2 },
  navArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: lt.card, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  navArrowDisabled: { opacity: 0.35 },
  navCounter: { fontFamily: FONT_FAMILY, fontSize: 12, fontWeight: '600', color: lt.bodyLight },
});
