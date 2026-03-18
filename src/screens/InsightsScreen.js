import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder, Dimensions,
  TouchableOpacity, StatusBar, Platform, Image, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { insights } from '../data/mockData';
import AgentModal from '../components/AgentModal';
import { useActions } from '../context/ActionsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const lt = colors.light;
const IS_WEB = Platform.OS === 'web';

const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;

// Metis mascot image
const metisImage = require('../../assets/metis.webp');

// --- Headline mapping ---
function getConversationalHeadline(insight) {
  const pg = insight.promptGroup;
  if (insight.type === 'ppc') {
    if (insight.insightType === 'Review')
      return `${pg} needs attention \u2014 ${insight.title.split(',')[0].toLowerCase()}`;
    return `Monitor ${pg} \u2014 ${insight.title.split(',')[0].toLowerCase()}`;
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

// --- Filter insights: high + medium, sorted high first ---
const swipeInsights = insights
  .filter((i) => i.severity === 'high' || i.severity === 'medium');

// ==================== GREETING SCREEN ====================
function GreetingScreen({ onStart, insightCount }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.greetingContent}>
        <View style={{ marginBottom: 28 }}>
          <Image source={metisImage} style={styles.metisGreeting} resizeMode="contain" />
        </View>

        <Text style={styles.greetingText}>
          {greeting}, here are{' '}
          <Text style={styles.greetingHighlight}>{insightCount} insights</Text>
          {' '}for Capital One UK today.
        </Text>

        <View style={{ marginTop: 40 }}>
          <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.85}>
            <Text style={styles.startButtonText}>Start review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ==================== COMPLETION SCREEN ====================
function CompletionScreen({ actionedCount, onGoToActions }) {
  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.greetingContent}>
        <View style={{ marginBottom: 28 }}>
          <Image source={metisImage} style={styles.metisComplete} resizeMode="contain" />
        </View>

        <Text style={styles.completeTitle}>All caught up!</Text>
        {actionedCount > 0 && (
          <Text style={styles.completeSubtitle}>
            {actionedCount} action{actionedCount !== 1 ? 's' : ''} queued
          </Text>
        )}

        <TouchableOpacity style={[styles.startButton, { marginTop: 36 }]} onPress={onGoToActions} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>View actions</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================== PROGRESS BAR ====================
function ProgressBar({ total, current, onNavigate }) {
  return (
    <View style={styles.progressContainer}>
      {Array.from({ length: total }, (_, i) => {
        let bg = lt.progressEmpty;
        if (i < current) bg = lt.progressFilled;
        else if (i === current) bg = lt.progressCurrent;
        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.7}
            onPress={() => onNavigate(i)}
            style={styles.progressTouchTarget}
          >
            <View style={[styles.progressSegment, { backgroundColor: bg }]} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ==================== INSIGHT SWIPE CARD ====================
function InsightSwipeCard({ insight, index, total, onNext, onPrev, onNavigate, onAddToActions, onTriggerAgent, isActioned }) {
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
          Animated.timing(pan, { toValue: -SCREEN_WIDTH, duration: 200, useNativeDriver: true })
            .start(() => onNext());
        } else if (gs.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, { toValue: SCREEN_WIDTH, duration: 200, useNativeDriver: true })
            .start(() => onPrev());
        } else {
          Animated.spring(pan, { toValue: 0, friction: 8, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  const headline = getConversationalHeadline(insight);
  const isAISearch = insight.type === 'ai-search';
  const severityColor = insight.severity === 'high' ? lt.severityHigh : lt.severityMedium;

  return (
    <Animated.View
      style={[styles.swipeOuter, { opacity: cardOpacity, transform: [{ translateX: pan }] }]}
      {...panResponder.panHandlers}
    >
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={styles.swipeScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Metis */}
        <View style={{ marginBottom: 8 }}>
          <Image source={metisImage} style={styles.metisCard} resizeMode="contain" />
        </View>

        {/* Headline */}
        <Text style={styles.cardHeadline}>{headline}</Text>

        {/* White detail card */}
        <View style={styles.detailCard}>
          {/* Badges row */}
          <View style={styles.typeBadgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: isAISearch ? colors.aiSearchDim : colors.ppcDim }]}>
              <Ionicons name={isAISearch ? 'sparkles' : 'search'} size={11} color={isAISearch ? colors.aiSearch : colors.ppc} />
              <Text style={[styles.typeBadgeText, { color: isAISearch ? colors.aiSearch : colors.ppc }]}>
                {isAISearch ? 'AI Search' : 'PPC'}
              </Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: severityColor + '18' }]}>
              <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
              <Text style={[styles.severityBadgeText, { color: severityColor }]}>
                {insight.severity === 'high' ? 'High' : 'Medium'}
              </Text>
            </View>
          </View>

          {/* Metric */}
          {insight.metric && (
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>{insight.metric.label}</Text>
              <View style={styles.metricValueRow}>
                {insight.metric.before !== '-' && (
                  <>
                    <Text style={styles.metricBefore}>{insight.metric.before}</Text>
                    <Ionicons name="arrow-forward" size={11} color={lt.bodyLight} />
                  </>
                )}
                <Text style={[styles.metricAfter, { color: severityColor }]}>
                  {insight.metric.after}
                </Text>
                <Ionicons
                  name={insight.metric.direction === 'up' ? 'trending-up' : 'trending-down'}
                  size={15}
                  color={severityColor}
                />
              </View>
            </View>
          )}

          {/* Summary */}
          <Text style={styles.cardSummary} numberOfLines={3}>{insight.summary}</Text>

          {/* Prompt group */}
          <Text style={styles.cardPromptGroup}>{insight.promptGroup}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.cardButtonRow}>
          <TouchableOpacity
            style={styles.btnPrimaryDark}
            onPress={() => onTriggerAgent(insight)}
            activeOpacity={0.85}
          >
            <Ionicons name="flash" size={14} color={colors.lime} />
            <Text style={styles.btnPrimaryDarkText} numberOfLines={1}>{insight.agentAction.label}</Text>
          </TouchableOpacity>

          {!isActioned && (
            <TouchableOpacity
              style={styles.btnSecondaryOutline}
              onPress={() => onAddToActions(insight)}
              activeOpacity={0.85}
            >
              <Text style={styles.btnSecondaryOutlineText}>Add to actions</Text>
            </TouchableOpacity>
          )}

          {isActioned && (
            <View style={styles.actionedPill}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.actionedPillText}>Added</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Nav arrows at bottom */}
      <View style={styles.navArrowRow}>
        <TouchableOpacity
          onPress={onPrev}
          style={[styles.navArrow, index === 0 && styles.navArrowDisabled]}
          disabled={index === 0}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={20} color={index === 0 ? lt.progressEmpty : lt.headline} />
        </TouchableOpacity>
        <Text style={styles.navCounter}>{index + 1} / {total}</Text>
        <TouchableOpacity
          onPress={onNext}
          style={styles.navArrow}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={20} color={lt.headline} />
        </TouchableOpacity>
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
  const { addAction, updateActionStatus, isActioned, actionCount } = useActions();

  const topPad = Math.max(insets.top, IS_WEB ? 40 : 0) + spacing.sm;

  const handleStart = useCallback(() => {
    setPhase('swiping');
    setCurrentIndex(0);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < swipeInsights.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setPhase('complete');
    }
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  }, [currentIndex]);

  const handleNavigate = useCallback((i) => {
    if (i >= 0 && i < swipeInsights.length) setCurrentIndex(i);
    else if (i >= swipeInsights.length) setPhase('complete');
  }, []);

  const handleAddToActions = useCallback((insight) => {
    addAction(insight, 'pending');
  }, [addAction]);

  const handleTriggerAgent = useCallback((insight) => {
    setAgentInsight(insight);
  }, []);

  const handleApprove = useCallback((insight) => {
    setAgentInsight(null);
    updateActionStatus(insight.id, 'agent-complete', `${insight.agentAction.label} completed. Ready for your review.`);
    addAction(insight, 'agent-complete');
  }, [updateActionStatus, addAction]);

  const handleAgentStart = useCallback((insight) => {
    addAction(insight, 'agent-working');
  }, [addAction]);

  const handleGoToActions = useCallback(() => {
    navigation?.navigate?.('Actions');
  }, [navigation]);

  // --- Greeting ---
  if (phase === 'greeting') {
    return (
      <View style={[styles.fullScreen, { paddingTop: topPad }]}>
        <GreetingScreen onStart={handleStart} insightCount={swipeInsights.length} />
      </View>
    );
  }

  // --- Complete ---
  if (phase === 'complete') {
    return (
      <View style={[styles.fullScreen, { paddingTop: topPad }]}>
        <CompletionScreen actionedCount={actionCount} onGoToActions={handleGoToActions} />
      </View>
    );
  }

  // --- Swiping ---
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
          onAddToActions={handleAddToActions}
          onTriggerAgent={handleTriggerAgent}
          isActioned={isActioned(currentInsight.id)}
        />
      </View>

      <AgentModal
        visible={!!agentInsight}
        insight={agentInsight}
        onClose={() => setAgentInsight(null)}
        onApprove={handleApprove}
        onStart={handleAgentStart}
      />
    </View>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: lt.bg,
  },

  // --- Greeting ---
  greetingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingBottom: 60,
  },
  metisGreeting: {
    width: 120,
    height: 120,
  },
  greetingText: {
    fontFamily: FONT_FAMILY,
    fontSize: 22,
    fontWeight: '600',
    color: lt.headline,
    textAlign: 'center',
    lineHeight: 32,
  },
  greetingHighlight: {
    color: colors.blue,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: lt.btnDark,
    paddingVertical: 15,
    paddingHorizontal: 44,
    borderRadius: radius.full,
  },
  startButtonText: {
    fontFamily: FONT_FAMILY,
    color: colors.lime,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // --- Completion ---
  metisComplete: {
    width: 150,
    height: 150,
  },
  completeTitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 26,
    fontWeight: '800',
    color: lt.headline,
    textAlign: 'center',
  },
  completeSubtitle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    fontWeight: '500',
    color: lt.body,
    marginTop: 8,
    textAlign: 'center',
  },

  // --- Swipe container ---
  swipeContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  swipeOuter: {
    flex: 1,
    alignItems: 'center',
  },
  swipeScrollContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },

  // --- Progress bar ---
  progressContainer: {
    flexDirection: 'row',
    gap: 3,
    width: '100%',
    height: 28,
    alignItems: 'center',
    marginBottom: 4,
    zIndex: 10,
  },
  progressSegment: {
    width: '100%',
    height: 3,
    borderRadius: 2,
  },
  progressTouchTarget: {
    flex: 1,
    height: 28,
    justifyContent: 'center',
  },

  // --- Card Arlo ---
  metisCard: {
    width: 40,
    height: 40,
  },

  // --- Card headline ---
  cardHeadline: {
    fontFamily: FONT_FAMILY,
    fontSize: 19,
    fontWeight: '600',
    color: lt.headline,
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 16,
    paddingHorizontal: 4,
  },

  // --- White detail card ---
  detailCard: {
    backgroundColor: lt.card,
    borderRadius: radius.xl,
    padding: spacing.md + 4,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
  },
  typeBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  typeBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  severityBadgeText: {
    fontFamily: FONT_FAMILY,
    fontSize: 11,
    fontWeight: '600',
  },
  metricBox: {
    backgroundColor: lt.metricBg,
    borderRadius: radius.md,
    padding: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: lt.body,
    fontWeight: '500',
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricBefore: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    color: lt.bodyLight,
  },
  metricAfter: {
    fontFamily: FONT_FAMILY,
    fontSize: 14,
    fontWeight: '700',
  },
  cardSummary: {
    fontFamily: FONT_FAMILY,
    fontSize: 13,
    color: lt.body,
    lineHeight: 19,
    marginBottom: 8,
  },
  cardPromptGroup: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontStyle: 'italic',
    color: lt.bodyLight,
  },

  // --- Action buttons ---
  cardButtonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginBottom: 8,
  },
  btnPrimaryDark: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: lt.btnDark,
  },
  btnPrimaryDarkText: {
    fontFamily: FONT_FAMILY,
    color: colors.lime,
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  btnSecondaryOutline: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    backgroundColor: lt.card,
    borderWidth: 1.5,
    borderColor: lt.btnOutline,
  },
  btnSecondaryOutlineText: {
    fontFamily: FONT_FAMILY,
    color: lt.btnOutline,
    fontSize: 11,
    fontWeight: '600',
  },
  actionedPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 13,
    borderRadius: radius.full,
    backgroundColor: colors.successDim,
  },
  actionedPillText: {
    fontFamily: FONT_FAMILY,
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },

  // --- Nav arrows ---
  navArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingBottom: 6,
    paddingTop: 2,
  },
  navArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lt.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  navArrowDisabled: {
    opacity: 0.35,
  },
  navCounter: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    fontWeight: '600',
    color: lt.bodyLight,
  },
});
