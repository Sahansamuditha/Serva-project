import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { G, Circle, Path } from 'react-native-svg';

export default function DonutChart({
  data = [
    { label: 'Pending', count: 14, pct: '11%', color: '#f59e0b' },
    { label: 'In Progress', count: 32, pct: '25%', color: '#3b82f6' },
    { label: 'Completed', count: 75, pct: '59%', color: '#10b981' },
    { label: 'Overdue', count: 7, pct: '5%', color: '#ef4444' }
  ],
  total = 128,
  size = 140
}) {
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalCount = data.reduce((sum, item) => sum + item.count, 0) || total;

  let currentOffset = 0;

  return (
    <View style={styles.wrapper}>
      {/* Donut Graphic */}
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G transform={`rotate(-90, ${size / 2}, ${size / 2})`}>
            {data.map((slice, idx) => {
              const sliceRatio = slice.count / totalCount;
              const strokeDasharray = `${circumference * sliceRatio} ${circumference * (1 - sliceRatio)}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += circumference * sliceRatio;

              return (
                <Circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                />
              );
            })}
          </G>
        </Svg>

        {/* Center Total Text */}
        <View style={styles.centerLabel}>
          <Text style={styles.centerNumber}>{totalCount}</Text>
          <Text style={styles.centerSub}>Total</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendGrid}>
        {data.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.label} <Text style={styles.legendBold}>{item.count} ({item.pct})</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: '100%'
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  centerNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b'
  },
  centerSub: {
    fontSize: 11,
    color: '#64748b'
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  legendText: {
    fontSize: 11.5,
    color: '#475569'
  },
  legendBold: {
    fontWeight: '700',
    color: '#1e293b'
  }
});
