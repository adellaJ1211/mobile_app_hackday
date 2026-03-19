import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';
const F = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;
const lt = colors.light;

// ==================== FAVICON / BRAND LOGO HELPERS ====================

function getFaviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

const brandDomains = {
  'Barclaycard': 'barclaycard.co.uk',
  'TSB': 'tsb.co.uk',
  'HSBC': 'hsbc.co.uk',
  'NatWest': 'natwest.com',
  'Santander': 'santander.co.uk',
  'Virgin Money': 'virginmoney.com',
  'Tesco Bank': 'tescobank.com',
  'MBNA': 'mbna.co.uk',
  'Capital One': 'capitalone.co.uk',
  'Aqua': 'aquacard.co.uk',
  'American Express': 'americanexpress.com',
  'Lloyds': 'lloydsbank.com',
  'Halifax': 'halifax.co.uk',
  'Vanquis': 'vanquis.co.uk',
  'Experian': 'experian.co.uk',
  'Equifax': 'equifax.co.uk',
  'TransUnion': 'transunion.co.uk',
  'MoneySavingExpert': 'moneysavingexpert.com',
  'Compare the Market': 'comparethemarket.com',
  'Marbles': 'marbles.com',
  'Barclays': 'barclays.co.uk',
};

function getBrandLogoUrl(name) {
  const domain = brandDomains[name];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

// ==================== SOURCE LIST (vertical rows with favicon) ====================

function SourceList({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <View style={s.section}>
      <Text style={s.sectionLabel}>Top cited sources</Text>
      {sources.slice(0, 3).map((source, i) => (
        <View key={i} style={s.sourceRow}>
          <Image
            source={{ uri: getFaviconUrl(source.domain) }}
            style={s.sourceFavicon}
            defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==' }}
          />
          <Text style={s.sourceDomain} numberOfLines={1}>{source.domain}</Text>
          <Text style={s.sourceCount}>{source.count}</Text>
        </View>
      ))}
    </View>
  );
}

// ==================== BRAND MENTION ROW (horizontal, expandable) ====================

function BrandMentionRow({ brands }) {
  if (!brands || brands.length === 0) return null;

  return (
    <View style={s.section}>
      <Text style={s.sectionLabel}>Brands mentioned</Text>
      <View style={s.brandGrid}>
        {brands.map((brand, i) => (
          <BrandChip key={i} name={brand.name} count={brand.count} />
        ))}
      </View>
    </View>
  );
}

function BrandChip({ name, count }) {
  const [imgError, setImgError] = useState(false);
  const logoUrl = getBrandLogoUrl(name);
  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={s.brandChip}>
      {logoUrl && !imgError ? (
        <Image
          source={{ uri: logoUrl }}
          style={s.brandChipLogo}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={s.brandChipInitial}>
          <Text style={s.brandChipInitialText}>{initial}</Text>
        </View>
      )}
      <Text style={s.brandChipName} numberOfLines={1}>{name}</Text>
      <Text style={s.brandChipCount}>{count}</Text>
    </View>
  );
}

// ==================== UNIFIED AI SEARCH CARD ====================

function AISearchCard({ insight }) {
  const sources = insight.competitorUrls || [];
  const brands = insight.brandMentions || [];

  return (
    <View style={s.container}>
      <Text style={s.summaryText}>{insight.summary}</Text>
      <SourceList sources={sources} />
      <BrandMentionRow brands={brands} />
    </View>
  );
}

// ==================== PPC CARDS (unchanged) ====================

function parseRivals(summary) {
  const match = summary.match(/Rivals?:\s*(.+?)(?:\.\s*Profit|$)/);
  if (!match) return [];
  return match[1].split(/[;,]\s*/).map((str) => {
    const m = str.trim().match(/(.+?)\s*([+\-–]\s*[\d.]+pp)/);
    return m ? { name: m[1].trim(), delta: m[2].replace(/\s/g, '') } : null;
  }).filter(Boolean);
}

export function PPCHighCard({ insight }) {
  const m = insight.ppcMetrics || {};
  const gainers = insight.competitorGainers || [];
  const profitChange = m.profitP2 != null && m.profitP1 != null ? Math.round(m.profitP2 - m.profitP1) : null;

  return (
    <View style={s.container}>
      {/* CPA metric */}
      <Text style={s.ppcLabel}>{insight.metric.label}</Text>
      <View style={s.ppcBeforeAfter}>
        <Text style={s.ppcBefore}>{insight.metric.before !== '-' ? insight.metric.before : '—'}</Text>
        <Text style={s.ppcArrow}>→</Text>
        <Text style={[s.ppcAfter, { color: '#EF4444' }]}>{insight.metric.after}</Text>
      </View>

      {/* Profit change */}
      {profitChange != null && (
        <View style={{ marginBottom: 10 }}>
          <Text style={s.ppcLabel}>Profit</Text>
          <View style={s.ppcBeforeAfter}>
            <Text style={s.ppcBefore}>£{Math.round(m.profitP1).toLocaleString()}</Text>
            <Text style={s.ppcArrow}>→</Text>
            <Text style={[s.ppcProfitAfter, { color: profitChange < 0 ? '#EF4444' : '#10B981' }]}>
              {profitChange < 0 ? '–' : '+'}£{Math.abs(profitChange).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Competitor gainers */}
      {gainers.length > 0 && (
        <View style={s.section}>
          <Text style={s.sectionLabel}>Who's entering</Text>
          {gainers.slice(0, 3).map((g, i) => (
            <View key={i} style={s.gainerRow}>
              <Image source={{ uri: getFaviconUrl(g.domain) }} style={s.sourceFavicon} />
              <Text style={s.sourceDomain} numberOfLines={1}>{g.domain}</Text>
              {g.before === 0 && (
                <View style={s.newBadge}>
                  <Text style={s.newBadgeText}>NEW</Text>
                </View>
              )}
              <Text style={[s.gainerDelta, { color: '#10B981' }]}>+{g.delta}pp</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

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

// ==================== ROUTER ====================
export default function InsightCardVisual({ insight }) {
  if (insight.type === 'ppc') {
    return insight.severity === 'high'
      ? <PPCHighCard insight={insight} />
      : <PPCMediumCard insight={insight} />;
  }
  return <AISearchCard insight={insight} />;
}

// ==================== STYLES ====================
const s = StyleSheet.create({
  container: { paddingVertical: 4 },

  // Summary text
  summaryText: { fontFamily: F, fontSize: 12, color: lt.body, lineHeight: 18, marginBottom: 6, paddingHorizontal: 2 },

  // Section headers
  section: { width: '100%', marginTop: 8 },
  sectionLabel: { fontFamily: F, fontSize: 9, fontWeight: '700', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },

  // Source list (vertical rows)
  sourceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  sourceFavicon: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#F0F0F0' },
  sourceDomain: { fontFamily: F, fontSize: 12, color: lt.headline, fontWeight: '500', flex: 1 },
  sourceCount: { fontFamily: F, fontSize: 12, fontWeight: '700', color: lt.headline, minWidth: 28, textAlign: 'right' },

  // Brand chips (horizontal wrap)
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  brandChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F3EE', borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 4, gap: 5 },
  brandChipLogo: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#E5E7EB' },
  brandChipInitial: { width: 16, height: 16, borderRadius: 8, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  brandChipInitialText: { fontFamily: F, fontSize: 8, fontWeight: '700', color: '#FFFFFF' },
  brandChipName: { fontFamily: F, fontSize: 11, color: lt.headline, fontWeight: '500', maxWidth: 90 },
  brandChipCount: { fontFamily: F, fontSize: 11, fontWeight: '700', color: lt.bodyLight },

  // Expand/collapse button
  moreBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 6, paddingVertical: 4 },
  moreBtnText: { fontFamily: F, fontSize: 11, color: lt.bodyLight, fontWeight: '500' },

  // PPC styles
  ppcLabel: { fontFamily: F, fontSize: 11, fontWeight: '600', color: lt.bodyLight, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  ppcBeforeAfter: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  ppcBefore: { fontFamily: F, fontSize: 16, fontWeight: '500', color: lt.bodyLight },
  ppcArrow: { fontFamily: F, fontSize: 14, color: lt.bodyLight },
  ppcAfter: { fontFamily: F, fontSize: 24, fontWeight: '800' },
  ppcProfitAfter: { fontFamily: F, fontSize: 18, fontWeight: '700' },
  rivalLine: { fontFamily: F, fontSize: 11, color: lt.bodyLight, textAlign: 'center', lineHeight: 16, marginBottom: 6 },
  rivalName: { color: lt.body },
  promptGroup: { fontFamily: F, fontSize: 11, fontStyle: 'italic', color: lt.bodyLight, marginTop: 4 },

  // Competitor gainer rows
  gainerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, gap: 8 },
  gainerDelta: { fontFamily: F, fontSize: 12, fontWeight: '700', minWidth: 45, textAlign: 'right' },
  newBadge: { backgroundColor: '#DBEAFE', borderRadius: radius.full, paddingHorizontal: 6, paddingVertical: 1 },
  newBadgeText: { fontFamily: F, fontSize: 9, fontWeight: '700', color: '#2563EB', letterSpacing: 0.5 },
});
