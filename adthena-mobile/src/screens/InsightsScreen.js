import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme/colors';
import { insights } from '../data/mockData';
import FilterBar from '../components/FilterBar';
import InsightCard from '../components/InsightCard';
import AgentModal from '../components/AgentModal';
import { useActions } from '../context/ActionsContext';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('all');
  const [agentInsight, setAgentInsight] = useState(null);
  const { addAction, updateActionStatus, isActioned } = useActions();

  const filtered = insights.filter((insight) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'high') return insight.severity === 'high';
    return insight.type === activeFilter;
  });

  const handleAddToActions = useCallback((insight) => {
    addAction(insight, 'pending');
  }, [addAction]);

  const handleTriggerAgent = useCallback((insight) => {
    setAgentInsight(insight);
  }, []);

  const handleApprove = useCallback((insight) => {
    setAgentInsight(null);
    updateActionStatus(
      insight.id,
      'agent-complete',
      `${insight.agentAction.label} completed. Ready for your review.`
    );
    // Also add to actions if not already there
    addAction(insight, 'agent-complete');
  }, [updateActionStatus, addAction]);

  const handleAgentStart = useCallback((insight) => {
    addAction(insight, 'agent-working');
  }, [addAction]);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const highCount = filtered.filter((i) => i.severity === 'high').length;

  const headerComponent = () => (
    <View>
      {/* Title area */}
      <View style={[styles.titleArea, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.title}>Capital One UK</Text>
        <Text style={styles.subtitle}>
          {filtered.length} insight{filtered.length !== 1 ? 's' : ''}
          {highCount > 0 ? ` · ${highCount} high priority` : ''}
        </Text>
      </View>

      {/* Filter bar */}
      <FilterBar activeFilter={activeFilter} onFilter={setActiveFilter} />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <InsightCard
              insight={item}
              onAddToActions={handleAddToActions}
              onTriggerAgent={handleTriggerAgent}
              isActioned={isActioned(item.id)}
            />
          </View>
        )}
        ListHeaderComponent={headerComponent}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  titleArea: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 2,
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
  list: {
    paddingBottom: 100,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
    position: 'relative',
  },
});
