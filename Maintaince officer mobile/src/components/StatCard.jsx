import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function StatCard({ title, value, icon: Icon, color = 'blue', onPress, style }) {
  const colorMap = {
    blue: { bg: '#2563eb', lightBg: '#eff6ff', text: '#1e40af' },
    amber: { bg: '#f59e0b', lightBg: '#fffbeb', text: '#b45309' },
    orange: { bg: '#ea580c', lightBg: '#fff7ed', text: '#c2410c' },
    green: { bg: '#10b981', lightBg: '#ecfdf5', text: '#047857' },
    red: { bg: '#ef4444', lightBg: '#fef2f2', text: '#b91c1c' },
    purple: { bg: '#8b5cf6', lightBg: '#f5f3ff', text: '#6d28d9' },
    teal: { bg: '#0d9488', lightBg: '#f0fdfa', text: '#0f766e' }
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[styles.card, style]}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {Icon && (
        <View style={[styles.iconContainer, { backgroundColor: scheme.bg }]}>
          <Icon size={18} color="#ffffff" strokeWidth={2.2} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 0,
    flex: 1
  },
  textContainer: {
    flex: 1,
    marginRight: 8
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b'
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
