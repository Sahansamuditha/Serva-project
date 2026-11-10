import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BuildingBarChart({
  data = [
    { name: 'Computer Center', count: 28 },
    { name: 'Science Building', count: 24 },
    { name: 'Library', count: 18 },
    { name: 'Engineering Building', count: 16 },
    { name: 'Admin Building', count: 12 },
    { name: 'Academic Building', count: 10 },
    { name: 'Other', count: 20 }
  ],
  max = 30
}) {
  return (
    <View style={styles.container}>
      {data.map((item, index) => {
        const pct = Math.min(100, Math.round((item.count / max) * 100));
        return (
          <View key={index} style={styles.row}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
            <View style={styles.track}>
              <View style={[styles.bar, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.count}>{item.count}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  name: {
    width: 120,
    fontSize: 12,
    color: '#475569',
    fontWeight: '500'
  },
  track: {
    flex: 1,
    height: 9,
    backgroundColor: '#f1f5f9',
    borderRadius: 5,
    overflow: 'hidden'
  },
  bar: {
    height: '100%',
    backgroundColor: '#7a1521',
    borderRadius: 5
  },
  count: {
    width: 24,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b'
  }
});
