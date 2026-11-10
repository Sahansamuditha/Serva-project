import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export function StatusBadge({ status, style }) {
  const s = (status || '').toLowerCase();
  let bg = COLORS.borderLight;
  let text = COLORS.textSecondary;
  let border = COLORS.border;

  if (s.includes('progress')) {
    bg = COLORS.inProgressBg;
    text = COLORS.inProgressText;
    border = COLORS.inProgressBorder;
  } else if (s.includes('completed')) {
    bg = COLORS.completedBg;
    text = COLORS.completedText;
    border = COLORS.completedBorder;
  } else if (s.includes('pending')) {
    bg = COLORS.pendingBg;
    text = COLORS.pendingText;
    border = COLORS.pendingBorder;
  } else if (s.includes('scheduled')) {
    bg = COLORS.scheduledBg;
    text = COLORS.scheduledText;
    border = COLORS.scheduledBorder;
  } else if (s.includes('overdue')) {
    bg = COLORS.overdueBg;
    text = COLORS.overdueText;
    border = COLORS.overdueBorder;
  } else if (s.includes('active') || s.includes('accepted')) {
    bg = '#ecfdf5';
    text = '#059669';
    border = '#a7f3d0';
  } else if (s.includes('reject')) {
    bg = '#fef2f2';
    text = '#dc2626';
    border = '#fecaca';
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.badgeText, { color: text }]}>{status}</Text>
    </View>
  );
}

export function PriorityBadge({ priority, style }) {
  const p = (priority || '').toLowerCase();
  let bg = COLORS.borderLight;
  let text = COLORS.textSecondary;
  let border = COLORS.border;

  if (p === 'critical') {
    bg = COLORS.criticalBg;
    text = COLORS.criticalText;
    border = COLORS.criticalBorder;
  } else if (p === 'high') {
    bg = COLORS.overdueBg;
    text = COLORS.overdueText;
    border = COLORS.overdueBorder;
  } else if (p === 'medium') {
    bg = COLORS.pendingBg;
    text = COLORS.pendingText;
    border = COLORS.pendingBorder;
  } else if (p === 'low') {
    bg = COLORS.completedBg;
    text = COLORS.completedText;
    border = COLORS.completedBorder;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.badgeText, { color: text, fontWeight: '700' }]}>{priority}</Text>
    </View>
  );
}

export function CategoryTag({ category, style }) {
  return (
    <View style={[styles.tag, style]}>
      <Text style={styles.tagText}>{category}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center'
  },
  badgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.1
  },
  tag: {
    backgroundColor: '#ffe9e8',
    borderColor: '#ffdad9',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7a1521'
  }
});
