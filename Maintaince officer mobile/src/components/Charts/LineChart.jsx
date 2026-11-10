import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line as SvgLine } from 'react-native-svg';
import { COLORS } from '../../theme/colors';

export default function SmoothLineChart({
  data = [20, 34, 28, 42, 38, 47, 52, 49],
  labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
  height = 180,
  lineColor = '#7a1521',
  gradientStart = 'rgba(122, 21, 33, 0.25)',
  gradientEnd = 'rgba(122, 21, 33, 0.01)'
}) {
  const width = 320;
  const paddingHorizontal = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingHorizontal * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxValue = Math.max(...data, 60);
  const minValue = 0;

  const points = data.map((val, idx) => {
    const x = paddingHorizontal + (idx / (data.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((val - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, val };
  });

  // Generate smooth SVG curve path (Catmull-Rom or Bezier)
  function createSmoothPath(pts) {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  }

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={gradientStart} />
            <Stop offset="100%" stopColor={gradientEnd} />
          </LinearGradient>
        </Defs>

        {/* Grid horizontal lines */}
        {[0, 0.33, 0.66, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * ratio;
          return (
            <SvgLine
              key={i}
              x1={paddingHorizontal}
              y1={y}
              x2={width - paddingHorizontal}
              y2={y}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          );
        })}

        {/* Filled Area */}
        <Path d={areaPath} fill="url(#chartGradient)" />

        {/* Line */}
        <Path d={linePath} fill="none" stroke={lineColor} strokeWidth="2.5" />

        {/* Points */}
        {points.map((pt, i) => (
          <React.Fragment key={i}>
            <Circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke={lineColor} strokeWidth="2" />
          </React.Fragment>
        ))}
      </Svg>

      {/* X-axis Labels */}
      <View style={[styles.labelsRow, { paddingHorizontal }]}>
        {labels.map((lbl, idx) => (
          <Text key={idx} style={styles.labelText}>{lbl}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative'
  },
  labelsRow: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  labelText: {
    fontSize: 10.5,
    color: '#94a3b8',
    fontWeight: '500'
  }
});
