import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Image, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const IS_WEB = Platform.OS === 'web';
const FONT_FAMILY = IS_WEB ? '"Montserrat", system-ui, sans-serif' : undefined;
const arloImage = require('../../assets/arlo-waving.webp');

export default function AgentModal({ visible, insight, onClose, onViewWorkflow }) {
  const slideAnim = useRef(new Animated.Value(400)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const autoDismissTimer = useRef(null);

  useEffect(() => {
    if (!visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
      return;
    }

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 65, useNativeDriver: true }),
      Animated.timing(overlayOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();

    // Auto-dismiss after 3 seconds
    autoDismissTimer.current = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => {
      if (autoDismissTimer.current) clearTimeout(autoDismissTimer.current);
    };
  }, [visible]);

  if (!insight && !visible) return null;

  const rawDesc = insight?.agentAction?.description || '';
  // Strip leading "Agent will " prefix so we can say "Arlo will ..."
  const description = rawDesc.replace(/^Agent will /i, '');

  return (
    <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableOpacity style={styles.overlayTap} activeOpacity={1} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <View style={styles.handle} />
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.agentHeader}>
          <View style={styles.arloWrap}>
            <Image source={arloImage} style={styles.arloImg} resizeMode="contain" />
            <View style={styles.checkBadge}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            </View>
          </View>
          <Text style={styles.agentTitle}>Process started</Text>
          <Text style={styles.agentMessage}>
            Arlo will {description} {'\u2014'} you can check progress in the <Text style={styles.bold}>Workflow tab</Text> and review results in the <Text style={styles.bold}>Review tab</Text>.
          </Text>
        </View>

        <TouchableOpacity style={styles.viewBtn} onPress={onViewWorkflow} activeOpacity={0.85}>
          <Ionicons name="git-network-outline" size={16} color={colors.navy} />
          <Text style={styles.viewBtnText}>View workflow</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end', zIndex: 100 },
  overlayTap: { flex: 1 },
  sheet: { backgroundColor: colors.bgSheet, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl + 10 },
  header: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.md },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.borderLight },
  closeBtn: { position: 'absolute', right: 0, top: spacing.sm, padding: spacing.sm },
  agentHeader: { alignItems: 'center', marginBottom: spacing.lg },
  arloWrap: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  arloImg: { width: 48, height: 48 },
  checkBadge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: colors.bgSheet, borderRadius: 12, padding: 1 },
  agentTitle: { fontFamily: FONT_FAMILY, fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.sm },
  agentMessage: { fontFamily: FONT_FAMILY, fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 21, paddingHorizontal: spacing.md },
  bold: { fontWeight: '700', color: colors.textPrimary },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: radius.full, backgroundColor: colors.lime },
  viewBtnText: { fontFamily: FONT_FAMILY, color: colors.navy, fontSize: 14, fontWeight: '700' },
});
