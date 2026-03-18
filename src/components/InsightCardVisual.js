import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';
const F = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;
const lt = colors.light;

const brandDomains = {
  'Barclaycard': 'barclaycard.co.uk',
  'TSB': 'tsb.co.uk',
  'HSBC': 'hsbc.co.uk',
  'NerdWallet': 'nerdwallet.com',
  'Experian': 'experian.co.uk',
  'Equifax': 'equifax.co.uk',
  'Capital One': 'capitalone.co.uk',
  'Post Office': 'postoffice.co.uk',
  'MoneySupermarket': 'moneysupermarket.com',
};

function getBrandLogoUrl(name) {
  const domain = brandDomains[name];
  if (!domain) return null;
  return `https://logo.clearbit.com/${domain}`;
}

// --- Parsers ---
function parseCompetitors(summary) {
  const match = summary.match(/Competitors mentioned:\s*(.+?)\./) || summary.match(/Competitors with[^:]*:\s*(.+?)\./);
  if (!match) return [];
  return match[1].split(/,\s*/).map((s) => {
    const m = s.match(/(.+?)\s*\((\d+)x?\)/);
    return m ? { name: m[1].trim(), count: parseInt(m[2], 10) } : null;
  }).filter(Boolean).sort((a, b) => b.count - a.count);
}

function parseMentionRate(summary) {
  const m = summary.match(/mentioned in ([\d.]+)% of citations/);
  return m ? parseFloat(m[1]) : null;
}

function parseSourceRate(summary) {
  const m = summary.match(/(?:Own source rate|own domain cited in only)[:\s]*([\d.]+)%/i);
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

// --- Brand avatar with logo ---
function BrandAvatar({ name, size = 32 }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getBrandLogoUrl(name);
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={{ alignItems: 'center', width: size + 16 }}>
      {logoUrl && !imgError ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F0F0F0' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[s.avatarLetter, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
      <Text style={s.avatarName} numberOfLines={1}>{name}</Text>
    </View>
  );
}

function BrandAvatarWithCount({ name, count, size = 32 }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getBrandLogoUrl(name);
  const initial = name.charAt(0).toUpperCase();
  return (
    <View style={{ alignItems: 'center', width: size + 20 }}>
      {logoUrl && !imgError ? (
        <Image
          source={{ uri: logoUrl }}
          style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#F0F0F0' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[s.avatarLetter, { fontSize: size * 0.4 }]}>{initial}</Text>
        </View>
      )}
      <Text style={s.avatarName} numberOfLines={1}>{name}</Text>
      <Text style={s.avatarCount}>{count}</Text>
    </View>
  );
}

// --- Horizontal framing bar ---
function FramingBar({ cautionary = 0, recommended = 0 }) {
  const neutral = 100 - cautionary - recommended;
  return (
    <View style={s.framingBar}>
      {cautionary > 0 && <View style={[s.framingSegment, { flex: cautionary, backgroundColor: '#EF4444', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }]} />}
      <View style={[s.framingSegment, { flex: Math.max(neutral, 1), backgroundColor: '#E5E7EB' }]} />
      {recommended > 0 && <View style={[s.framingSegment, { flex: recommended, backgroundColor: '#10B981', borderTopRightRadius: 4, borderBottomRightRadius: 4 }]} />}
    </View>
  );
}

// ==================== INVISIBLE (CONTENT_GAP) ====================
export function InvisibleCard({ insight }) {
  const competitors = parseCompetitors(insight.summary);
  return (
    <View style={s.container}>
      <Text style={s.heroPrompt}>"{insight.promptGroup}"</Text>
      <Text style={s.mutedLine}>You're not appearing in any responses</Text>

      {competitors.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Who's showing up</Text>
          <View style={s.avatarRow}>
            {competitors.map((c, i) => (
              <BrandAvatarWithCount key={i} name={c.name} count={c.count} size={30} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ==================== AT RISK (Cautionary / FRAMING_RISK) ====================
export function AtRiskCautionaryCard({ insight }) {
  const cautionRate = parseCautionaryRate(insight.summary) || parseFloat(insight.metric.after);
  const mentionRate = parseMentionRate(insight.summary);
  return (
    <View style={s.container}>
      <FramingBar cautionary={cautionRate} />
      <View style={s.statPair}>
        <View style={s.statItem}>
          <Text style={[s.statNumber, { color: '#EF4444' }]}>{Math.round(cautionRate)}%</Text>
          <Text style={s.statLabel}>cautionary</Text>
        </View>
        <View style={s.statItem}>
          <Text style={[s.statNumber, { color: colors.navy }]}>{mentionRate != null ? `${mentionRate}%` : '—'}</Text>
          <Text style={s.statLabel}>mentioned</Text>
        </View>
      </View>
      <Text style={s.mutedLine}>Negative framing in {Math.round(cautionRate)}% of responses</Text>
      <Text style={s.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== AT RISK (Competitive / COMPETITIVE_FRAMING) ====================
export function AtRiskCompetitiveCard({ insight }) {
  const competitors = parseCompetitors(insight.summary);
  const rivalName = competitors.length > 0 ? competitors[0].name : 'Competitor';
  return (
    <View style={s.container}>
      <View style={s.versusRow}>
        <View style={s.versusItem}>
          <BrandAvatar name={rivalName} size={28} />
          <View style={s.versusStatusRow}>
            <Ionicons name="arrow-up" size={11} color="#10B981" />
            <Text style={[s.versusStatus, { color: '#10B981' }]}>Recommended</Text>
          </View>
        </View>
        <View style={s.versusDivider} />
        <View style={s.versusItem}>
          <BrandAvatar name="Capital One" size={28} />
          <View style={s.versusStatusRow}>
            <Text style={[s.versusStatus, { color: lt.bodyLight }]}>— Not recommended</Text>
          </View>
        </View>
      </View>
      <Text style={s.mutedLine}>Competitor is recommended over you for this prompt</Text>
      <Text style={s.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== PPC HIGH ====================
export function PPCHighCard({ insight }) {
  const rivals = parseRivals(insight.summary);
  return (
    <View style={s.container}>
      <Text style={s.ppcLabel}>{insight.metric.label}</Text>
      <View style={s.ppcBeforeAfter}>
        <Text style={s.ppcBefore}>{insight.metric.before !== '-' ? insight.metric.before : '—'}</Text>
        <Text style={s.ppcArrow}>→</Text>
        <Text style={[s.ppcAfter, { color: '#EF4444' }]}>{insight.metric.after}</Text>
      </View>
      {rivals.length > 0 && (
        <Text style={s.rivalLine}>
          {rivals.map((r, i) => {
            const isNeg = r.delta.includes('-') || r.delta.includes('–');
            return (
              <Text key={i}>
                {i > 0 ? ' · ' : ''}
                <Text style={s.rivalName}>{r.name} </Text>
                <Text style={{ color: isNeg ? '#EF4444' : '#10B981', fontWeight: '600' }}>{r.delta}</Text>
              </Text>
            );
          })}
        </Text>
      )}
      <Text style={s.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== PPC MEDIUM ====================
export function PPCMediumCard({ insight }) {
  const rivals = parseRivals(insight.summary);
  return (
    <View style={s.container}>
      <Text style={s.ppcLabel}>{insight.metric.label}</Text>
      <View style={s.ppcBeforeAfter}>
        <Text style={s.ppcBefore}>{insight.metric.before !== '-' ? insight.metric.before : '—'}</Text>
        <Text style={s.ppcArrow}>→</Text>
        <Text style={[s.ppcAfter, { color: '#F59E0B' }]}>{insight.metric.after}</Text>
      </View>
      {rivals.length > 0 && (
        <Text style={s.rivalLine}>
          {rivals.map((r, i) => {
            const isNeg = r.delta.includes('-') || r.delta.includes('–');
            return (
              <Text key={i}>
                {i > 0 ? ' · ' : ''}
                <Text style={s.rivalName}>{r.name} </Text>
                <Text style={{ color: isNeg ? '#EF4444' : '#10B981', fontWeight: '600' }}>{r.delta}</Text>
              </Text>
            );
          })}
        </Text>
      )}
      <Text style={s.promptGroup}>{insight.promptGroup}</Text>
    </View>
  );
}

// ==================== FALLBACK ====================
export function FallbackCard({ insight }) {
  return (
    <View style={s.container}>
      <Text style={s.fallbackText}>{insight.summary}</Text>
      <Text style={s.promptGroup}>{insight.promptGroup}</Text>
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
const s = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 4 },

  // Hero prompt (Invisible card)
  heroPrompt: { fontFamily: F, fontSize: 18, fontWeight: '600', color: colors.navy, textAlign: 'center', marginBottom: 6 },

  // Muted description line
  mutedLine: { fontFamily: F, fontSize: 12, color: lt.bodyLight, textAlign: 'center', lineHeight: 18, marginBottom: 8 },

  // Sections
  section: { width: '100%', marginTop: 6 },
  sectionLabel: { fontFamily: F, fontSize: 9, fontWeight: '700', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },

  // Brand avatars
  avatarRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  avatar: { backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontFamily: F, fontWeight: '700', color: '#FFFFFF' },
  avatarName: { fontFamily: F, fontSize: 10, color: lt.bodyLight, marginTop: 3, textAlign: 'center' },
  avatarCount: { fontFamily: F, fontSize: 11, fontWeight: '600', color: lt.headline, marginTop: 1 },

  // Framing bar
  framingBar: { flexDirection: 'row', width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  framingSegment: { height: 6 },

  // Stat pair
  statPair: { flexDirection: 'row', justifyContent: 'center', gap: 32, marginBottom: 8 },
  statItem: { alignItems: 'center' },
  statNumber: { fontFamily: F, fontSize: 20, fontWeight: '700' },
  statLabel: { fontFamily: F, fontSize: 10, color: lt.bodyLight, marginTop: 1 },

  // Versus layout
  versusRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 },
  versusItem: { flex: 1, alignItems: 'center' },
  versusDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  versusStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 4 },
  versusStatus: { fontFamily: F, fontSize: 10, fontWeight: '600' },

  // PPC
  ppcLabel: { fontFamily: F, fontSize: 11, fontWeight: '600', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  ppcBeforeAfter: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  ppcBefore: { fontFamily: F, fontSize: 16, fontWeight: '500', color: lt.bodyLight },
  ppcArrow: { fontFamily: F, fontSize: 14, color: lt.bodyLight },
  ppcAfter: { fontFamily: F, fontSize: 24, fontWeight: '800' },
  rivalLine: { fontFamily: F, fontSize: 11, color: lt.bodyLight, textAlign: 'center', lineHeight: 16, marginBottom: 6 },
  rivalName: { color: lt.body },

  // Fallback
  fallbackText: { fontFamily: F, fontSize: 12, color: lt.body, lineHeight: 18, textAlign: 'center' },

  // Common
  promptGroup: { fontFamily: F, fontSize: 11, fontStyle: 'italic', color: lt.bodyLight, marginTop: 4 },
});
