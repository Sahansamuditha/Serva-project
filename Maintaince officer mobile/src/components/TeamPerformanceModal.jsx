import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { X, Briefcase, Clock, Calendar, CheckCircle2, TrendingUp } from 'lucide-react-native';
import SmoothLineChart from './Charts/LineChart';
import { COLORS } from '../theme/colors';

export default function TeamPerformanceModal({ visible, onClose, team }) {
  if (!team) return null;

  const targetName = team.name || 'Team A';
  const stats = {
    totalJobs: team.totalJobs || 48,
    inProgress: team.inProgress || 3,
    scheduled: team.scheduled || 5,
    completed: team.completed || 40
  };

  // 12 months data
  const monthlyData = [32, 28, 35, 42, 38, 45, 48, 52, 46, 55, 58, 62];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.title}>{targetName} Performance</Text>
                {team.specialization && (
                  <View style={styles.specBadge}>
                    <Text style={styles.specBadgeText}>{team.specialization}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.metaSub}>
                Lead: <Text style={{ fontWeight: '700', color: '#1e293b' }}>{team.lead || 'David Chen'}</Text> •
                Efficiency: <Text style={{ fontWeight: '700', color: '#10b981' }}>{team.efficiency || 94}%</Text> •
                Status: <Text style={{ fontWeight: '700', color: '#2563eb' }}>{team.status || 'Active'}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* 4 Metrics Grid */}
            <View style={styles.metricsGrid}>
              {/* All Jobs */}
              <View style={styles.metricCard}>
                <View>
                  <Text style={styles.metricLabel}>ALL JOBS</Text>
                  <Text style={styles.metricVal}>{stats.totalJobs}</Text>
                </View>
                <View style={[styles.metricIcon, { backgroundColor: '#eff6ff' }]}>
                  <Briefcase size={16} color="#2563eb" />
                </View>
              </View>

              {/* In Progress */}
              <View style={styles.metricCard}>
                <View>
                  <Text style={styles.metricLabel}>IN PROGRESS</Text>
                  <Text style={[styles.metricVal, { color: '#2563eb' }]}>{stats.inProgress}</Text>
                </View>
                <View style={[styles.metricIcon, { backgroundColor: '#dbeafe' }]}>
                  <Clock size={16} color="#1d4ed8" />
                </View>
              </View>

              {/* Scheduled */}
              <View style={styles.metricCard}>
                <View>
                  <Text style={styles.metricLabel}>SCHEDULED</Text>
                  <Text style={[styles.metricVal, { color: '#d97706' }]}>{stats.scheduled}</Text>
                </View>
                <View style={[styles.metricIcon, { backgroundColor: '#fef3c7' }]}>
                  <Calendar size={16} color="#b45309" />
                </View>
              </View>

              {/* Completed */}
              <View style={styles.metricCard}>
                <View>
                  <Text style={styles.metricLabel}>COMPLETED</Text>
                  <Text style={[styles.metricVal, { color: '#059669' }]}>{stats.completed}</Text>
                </View>
                <View style={[styles.metricIcon, { backgroundColor: '#d1fae5' }]}>
                  <CheckCircle2 size={16} color="#047857" />
                </View>
              </View>
            </View>

            {/* Performance Trends Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color="#7a1521" />
                  <Text style={styles.chartTitle}>Monthly Performance Trends</Text>
                </View>
                <Text style={styles.chartSub}>Jan - Dec 2026</Text>
              </View>

              <SmoothLineChart
                data={monthlyData}
                labels={['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov']}
                height={160}
                lineColor="#7a1521"
              />
            </View>
          </ScrollView>

          {/* Close button */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b'
  },
  specBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  specBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  metaSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4
  },
  closeBtn: {
    padding: 4
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b'
  },
  metricIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginTop: 8
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  chartTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b'
  },
  chartSub: {
    fontSize: 11,
    color: '#64748b'
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 10
  },
  doneBtn: {
    backgroundColor: '#7a1521',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600'
  }
});
