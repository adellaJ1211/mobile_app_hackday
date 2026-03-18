import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';
const F = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;
const lt = colors.light;

// --- Parsers ---
function parseCompetitors(summary) {
  const match = summary.match(/Competitors mentioned:\s*(.+?)\./) || summary.match(/Competitors with[^:]*:\s*(.+?)\./);
  if (!match) return [];
  return match[1].split(/,\s*/).map((s) => {
    const m = s.match(/(.+?)\s*\((\d+)x?\)/);
    return m ? { name: m[1].trim(), count: parseInt(m[2], 10) } : null;
  }).filter(Boolean).sort((a, b) => b.count - a.count);
}

function parseRate(summary, label) {
  const re = new RegExp(label + '[:\\s]*([\\d.]+)%');
  const m = summary.match(re);
  return m ? parseFloat(m[1]) : null;
}

function parseMentionRate(summary) {
  const m = summary.match(/mentioned in ([\d.]+)% of citations/);
  return m ? parseFloat(m[1]) : null;
}

function parseSourceRate(summary) {
  const m = summary.match(/(?:Own source rate|own domain cited in only)[:\\s]*([\d.]+)%/i);
  return m ? parseFloat(m[1]) : null;
}

function parseCautionaryRate(summary) {
  const m = summary.match(/(\d+)%\s*carry\s*cautionary/);
  return m ? parseInt(m[1], 10) : null;
}

function parseRivals(summary) {
  const match = summary.match(/Rivals?:\s*(.+?)(?:\.\s*Profit|$)/);
  if (!match) return [];
  return match[1].split(/[;,]\s*/).map((s) => {
    const m = s.trim().match(/(.+?)\s*([+\-–]\s*[\d.]+pp)/);
    return m ? { name: m[1].trim(), delta: m[2].replace(/\s/g, '') } : null;
  }).filter(Boolean);
}

// --- Donut (View-based, web safe) ---
function DonutChart({ percentage, size = 100, strokeWidth = 10, color = '#EF4444' }) {
  const bgColor = '#E5E7EB';
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  // Use CSS conic-gradient on web for a clean donut
  if (IS_WEB) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          background: `conic-gradient(${color} 0deg ${percentage * 3.6}deg, ${bgColor} ${percentage * 3.6}deg 360deg)`,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <View style={{
            width: size - strokeWidth * 2, height: size - strokeWidth * 2,
            borderRadius: (size - strokeWidth * 2) / 2, backgroundColor: '#FFFFFF',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontFamily: F, fontSize: 24, fontWeight: '800', color }}>{Math.round(percentage)}%</Text>
          </View>
        </View>
      </View>
    );
  }
  // Native fallback: just show the number
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth, borderColor: bgColor, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: F, fontSize: 24, fontWeight: '800', color }}>{Math.round(percentage)}%</Text>
    </View>
  );
}

// ==================== INVISIBLE ====================
export function InvisibleCard({ insight }) {
  const competitors = parseCompetitors(insight.summary);
  return (
    <View style={cs.container}>
      {/* Big 0% */}
      <View style={cs.centerBlock}>
        <View style={cs.redGlow}>
          <Text style={[cs.bigNumber, { color: '#EF4444' }]}>0%</Text>
        </View>
        <Text style={cs.metricLabel}>Mention Rate</Text>
      </View>
      {/* Competitors */}
      {competitors.length > 0 && (
        <View style={cs.section}>
          <Text style={cs.sectionLabel}>Competitors present</Text>
          <View style={cs.chipRow}>
            {competitors.map((c, i) => (
              <View key={i} style={cs.chip}>
                <Text style={cs.chipText}>{c.name}</Text>
                <Text style={cs.chipCount}>{c.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <Text style={cs.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== AT RISK (Cautionary) ====================
export function AtRiskCautionaryCard({ insight }) {
  const cautionRate = parseCautionaryRate(insight.summary) || parseFloat(insight.metric.after);
  const mentionRate = parseMentionRate(insight.summary);
  const sourceRate = parseSourceRate(insight.summary);
  return (
    <View style={cs.container}>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <DonutChart percentage={cautionRate} size={96} strokeWidth={10} color="#EF4444" />
        <Text style={[cs.metricLabel, { marginTop: 6 }]}>Cautionary Rate</Text>
      </View>
      <View style={cs.statRow}>
        <View style={cs.statBox}>
          <Text style={cs.statValue}>{mentionRate != null ? `${mentionRate}%` : '—'}</Text>
          <Text style={cs.statLabel}>Mentioned in</Text>
        </View>
        <View style={cs.statBox}>
          <Text style={[cs.statValue, { color: colors.blue }]}>{sourceRate != null ? `${sourceRate}%` : '—'}</Text>
          <Text style={cs.statLabel}>Own sources</Text>
        </View>
      </View>
      <Text style={cs.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== AT RISK (Competitive) ====================
export function AtRiskCompetitiveCard({ insight }) {
  const competitors = parseCompetitors(insight.summary);
  return (
    <View style={cs.container}>
      <View style={{ alignItems: 'center', marginBottom: 14 }}>
        <DonutChart percentage={0} size={96} strokeWidth={10} color="#EF4444" />
        <Text style={[cs.metricLabel, { marginTop: 6 }]}>Recommended Rate</Text>
      </View>
      {competitors.length > 0 && (
        <View style={cs.section}>
          <Text style={cs.sectionLabel}>Recommended instead</Text>
          <View style={cs.chipRow}>
            {competitors.map((c, i) => (
              <View key={i} style={cs.chip}>
                <Text style={cs.chipText}>{c.name}</Text>
                <Text style={cs.chipCount}>{c.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <Text style={cs.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== PPC HIGH ====================
export function PPCHighCard({ insight }) {
  const rivals = parseRivals(insight.summary);
  return (
    <View style={cs.container}>
      <Text style={cs.ppcMetricLabel}>{insight.metric.label}</Text>
      <View style={cs.ppcBeforeAfter}>
        <Text style={cs.ppcBefore}>{insight.metric.before !== '-' ? insight.metric.before : '—'}</Text>
        <Ionicons name="arrow-forward" size={18} color={lt.bodyLight} />
        <Text style={[cs.ppcAfter, { color: '#EF4444' }]}>{insight.metric.after}</Text>
      </View>
      {rivals.length > 0 && (
        <View style={[cs.chipRow, { marginTop: 12 }]}>
          {rivals.map((r, i) => {
            const isNeg = r.delta.includes('-') || r.delta.includes('–');
            return (
              <View key={i} style={[cs.deltaChip, { backgroundColor: isNeg ? colors.dangerDim : colors.successDim }]}>
                <Text style={[cs.deltaText, { color: isNeg ? '#EF4444' : colors.success }]}>{r.name} {r.delta}</Text>
              </View>
            );
          })}
        </View>
      )}
      <Text style={cs.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== PPC MEDIUM ====================
export function PPCMediumCard({ insight }) {
  const firstClause = insight.summary.split('.')[0];
  return (
    <View style={cs.container}>
      <Text style={cs.ppcMetricLabel}>{insight.metric.label}</Text>
      <View style={cs.ppcBeforeAfter}>
        <Text style={cs.ppcBefore}>{insight.metric.before !== '-' ? insight.metric.before : '—'}</Text>
        <Ionicons name="arrow-forward" size={18} color={lt.bodyLight} />
        <Text style={[cs.ppcAfter, { color: '#F59E0B' }]}>{insight.metric.after}</Text>
      </View>
      <Text style={[cs.keyChange, { marginTop: 10 }]}>{firstClause}.</Text>
      <Text style={cs.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== FALLBACK ====================
export function FallbackCard({ insight }) {
  return (
    <View style={cs.container}>
      <Text style={cs.fallbackSummary}>{insight.summary}</Text>
      <Text style={cs.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== ROUTER ====================
export default function InsightCardVisual({ insight }) {
  if (insight.type === 'ppc') {
    return insight.severity === 'high'
      ? <PPCHighCard insight={insight} />
      : <PPCMediumCard insight={insight} />;
  }
  switch (insight.insightType) {
    case 'Invisible':
      return <InvisibleCard insight={insight} />;
    case 'At Risk':
      if (insight.title.includes('Cautionary'))
        return <AtRiskCautionaryCard insight={insight} />;
      return <AtRiskCompetitiveCard insight={insight} />;
    default:
      return <FallbackCard insight={insight} />;
  }
}

// ==================== STYLES ====================
const cs = StyleSheet.create({
  container: { alignItems: 'center' },

  // Invisible
  centerBlock: { alignItems: 'center', marginBottom: 14 },
  redGlow: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  bigNumber: { fontFamily: F, fontSize: 42, fontWeight: '800' },
  metricLabel: { fontFamily: F, fontSize: 13, color: lt.bodyLight, fontWeight: '500' },

  // Sections
  section: { width: '100%', marginBottom: 10 },
  sectionLabel: { fontFamily: F, fontSize: 11, fontWeight: '700', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: colors.navy, paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.full,
  },
  chipText: { fontFamily: F, fontSize: 11, fontWeight: '600', color: '#FFFFFF' },
  chipCount: { fontFamily: F, fontSize: 11, fontWeight: '700', color: colors.lime },

  // Stat row
  statRow: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 10 },
  statBox: {
    flex: 1, backgroundColor: lt.metricBg, borderRadius: radius.md,
    padding: 10, alignItems: 'center',
  },
  statValue: { fontFamily: F, fontSize: 20, fontWeight: '800', color: lt.headline },
  statLabel: { fontFamily: F, fontSize: 11, color: lt.bodyLight, marginTop: 2 },

  // PPC
  ppcMetricLabel: { fontFamily: F, fontSize: 13, fontWeight: '600', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  ppcBeforeAfter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ppcBefore: { fontFamily: F, fontSize: 20, fontWeight: '500', color: lt.bodyLight },
  ppcAfter: { fontFamily: F, fontSize: 28, fontWeight: '800' },
  deltaChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  deltaText: { fontFamily: F, fontSize: 11, fontWeight: '600' },
  keyChange: { fontFamily: F, fontSize: 13, color: lt.body, textAlign: 'center', lineHeight: 19 },

  // Fallback
  fallbackSummary: { fontFamily: F, fontSize: 13, color: lt.body, lineHeight: 19, textAlign: 'center' },

  // Common
  promptGroup: { fontFamily: F, fontSize: 12, fontStyle: 'italic', color: lt.bodyLight, marginTop: 10 },
});
