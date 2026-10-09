import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Download,
  Settings,
  TrendingUp,
  Eye
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import SmoothLineChart from '../components/Charts/LineChart';
import DonutChart from '../components/Charts/DonutChart';
import BuildingBarChart from '../components/Charts/BuildingBarChart';
import ExportReportModal from '../components/ExportReportModal';
import TeamPerformanceModal from '../components/TeamPerformanceModal';
import { fetchReportsData, generateReport, exportReport, fetchTeams } from '../services/api';
import { COLORS } from '../theme/colors';

export default function ReportsScreen({ navigation }) {
  const [reportsData, setReportsData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedPerformanceTeam, setSelectedPerformanceTeam] = useState(null);
  const [reportType, setReportType] = useState('Monthly Report');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const rep = await fetchReportsData();
    if (rep) setReportsData(rep);
    const tm = await fetchTeams();
    if (tm) setTeams(tm);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleGenerate = async () => {
    await generateReport({ reportType, month: selectedMonth, year: selectedYear });
    Alert.alert('Report Generated', `Generated ${reportType} for ${selectedMonth} ${selectedYear}!`);
    loadData();
  };

  const handleExport = async (params) => {
    await exportReport(params);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7a1521']} />}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.pageTitle}>Reports & Analytics</Text>
          <Text style={styles.pageSubtitle}>
            View detailed reports and analytics about facility maintenance activities.
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowExportModal(true)} style={styles.exportBtn}>
          <Download size={16} color="#ffffff" />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* 5 Stat Cards */}
      <View style={styles.statCardsRow}>
        <StatCard title="Requests" value={reportsData?.stats?.totalRequests ?? reportsData?.totalRequests ?? 128} icon={FileText} color="blue" />
        <StatCard title="Pending" value={reportsData?.stats?.pendingRequests ?? reportsData?.stats?.pending ?? 14} icon={Clock} color="amber" />
      </View>
      <View style={styles.statCardsRow}>
        <StatCard title="In Progress" value={reportsData?.stats?.inProgressRequests ?? reportsData?.stats?.inProgress ?? 32} icon={Wrench} color="blue" />
        <StatCard title="Overdue" value={reportsData?.stats?.overdueRequests ?? reportsData?.stats?.overdue ?? 7} icon={AlertCircle} color="red" />
        <StatCard title="Completed" value={reportsData?.stats?.completedRequests ?? reportsData?.stats?.completed ?? 75} icon={CheckCircle2} color="green" />
      </View>

      {/* Requests Trend Chart */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="#7a1521" />
            <Text style={styles.cardTitle}>Maintenance Requests Trend</Text>
          </View>
          <View style={styles.periodPill}>
            <Text style={styles.periodPillText}>Last 6 Months</Text>
          </View>
        </View>

        <SmoothLineChart
          data={reportsData?.maintenanceRequestsTrend?.map(t => Number(t.requests ?? t.count ?? 0))?.length ? reportsData.maintenanceRequestsTrend.map(t => Number(t.requests ?? t.count ?? 0)) : [16, 28, 37, 30, 49, 47]}
          labels={reportsData?.maintenanceRequestsTrend?.map(t => t.month)?.length ? reportsData.maintenanceRequestsTrend.map(t => t.month) : ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']}
          height={170}
          lineColor="#7a1521"
        />
      </View>

      {/* Requests by Status Donut */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Requests by Status</Text>
        </View>
        <DonutChart
          data={reportsData?.requestsByStatus?.map(s => ({
            label: s.name,
            count: Number(s.count || 0),
            pct: `${s.percentage || 0}%`,
            color: s.color || '#3b82f6'
          })) || [
            { label: 'Pending', count: 14, pct: '11%', color: '#f59e0b' },
            { label: 'In Progress', count: 32, pct: '25%', color: '#3b82f6' },
            { label: 'Completed', count: 75, pct: '59%', color: '#10b981' },
            { label: 'Overdue', count: 7, pct: '6%', color: '#ef4444' }
          ]}
          total={Number(reportsData?.stats?.totalRequests || 128)}
          size={130}
        />
      </View>

      {/* Generate Report Form Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Generate Report</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>REPORT TYPE</Text>
          <View style={styles.pillRow}>
            {['Monthly Report', 'Building Wise Report', 'Labourer Performance'].map(t => (
              <TouchableOpacity
                key={t}
                onPress={() => setReportType(t)}
                style={[styles.pill, reportType === t && styles.pillActive]}
              >
                <Text style={[styles.pillText, reportType === t && styles.pillTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dateSelectorRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>MONTH</Text>
            <View style={styles.pillRow}>
              {['August', 'July', 'June'].map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedMonth(m)}
                  style={[styles.pill, selectedMonth === m && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selectedMonth === m && styles.pillTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>YEAR</Text>
            <View style={styles.pillRow}>
              {['2026', '2025'].map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setSelectedYear(y)}
                  style={[styles.pill, selectedYear === y && styles.pillActive]}
                >
                  <Text style={[styles.pillText, selectedYear === y && styles.pillTextActive]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleGenerate} style={styles.generateBtn}>
          <Settings size={16} color="#ffffff" style={{ marginRight: 6 }} />
          <Text style={styles.generateBtnText}>Generate Report</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            const res = await exportReport({ format: 'PDF', reportType, month: selectedMonth, year: selectedYear });
            Alert.alert('Download', res?.message || 'Report downloaded as PDF');
          }}
          style={styles.downloadPdfBtn}
        >
          <Download size={14} color="#64748b" style={{ marginRight: 6 }} />
          <Text style={styles.downloadPdfBtnText}>Download as PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Requests by Building */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Requests by Building</Text>
        </View>
        <BuildingBarChart
          data={reportsData?.buildingBreakdown || [
            { name: 'Computer Center', count: 28 },
            { name: 'Science Building', count: 24 },
            { name: 'Library', count: 18 },
            { name: 'Engineering Building', count: 16 },
            { name: 'Admin Building', count: 12 },
            { name: 'Academic Building', count: 10 },
            { name: 'Other', count: 20 }
          ]}
          max={30}
        />
      </View>

      {/* Requests by Category Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Requests by Category</Text>
        </View>
        <View style={styles.categoryGrid}>
          {[
            { name: 'Electrical', count: 30, pct: '23%', color: '#f59e0b' },
            { name: 'Plumbing', count: 25, pct: '20%', color: '#3b82f6' },
            { name: 'HVAC', count: 22, pct: '17%', color: '#10b981' },
            { name: 'Civil', count: 18, pct: '14%', color: '#8b5cf6' },
            { name: 'Carpentry', count: 15, pct: '12%', color: '#ea580c' },
            { name: 'Other', count: 18, pct: '14%', color: '#94a3b8' }
          ].map((cat, i) => (
            <View key={i} style={styles.categoryBox}>
              <View style={[styles.catColorBar, { backgroundColor: cat.color }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catCount}>{cat.count} ({cat.pct})</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Labourer Performance List */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Labourer Performance</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Labourers')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.perfList}>
          {teams.map((t, idx) => (
            <TouchableOpacity
              key={t.id || idx}
              onPress={() => setSelectedPerformanceTeam(t)}
              style={styles.perfRow}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.teamBadgeCircle}>
                  <Text style={styles.teamBadgeCircleText}>{t.name.replace('Team ', '')}</Text>
                </View>
                <View>
                  <Text style={styles.teamRowName}>{t.name}</Text>
                  <Text style={styles.teamRowSpec} numberOfLines={1}>{t.specialization}</Text>
                </View>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.teamRowJobs}>{t.completed || 30} Jobs</Text>
                <Text style={styles.teamRowTime}>{t.avgTime || '2h 15m'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Reports Table / List */}
      <View style={[styles.card, { paddingHorizontal: 0 }]}>
        <View style={[styles.cardHeader, { paddingHorizontal: 16 }]}>
          <Text style={styles.cardTitle}>Recent Reports</Text>
        </View>

        {(reportsData?.recentReportsList || []).map((rep) => (
          <View key={rep.id} style={styles.reportItemRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.repId}>{rep.id}</Text>
                <Text style={styles.repDate}>{rep.generatedDate}</Text>
              </View>
              <Text style={styles.repName}>{rep.name}</Text>
              <Text style={styles.repPeriod}>{rep.period} • {rep.generatedBy}</Text>
            </View>

            <TouchableOpacity onPress={() => Alert.alert('Download', `Downloading ${rep.id} PDF...`)} style={styles.dlBtn}>
              <Download size={16} color="#7a1521" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modals */}
      <ExportReportModal
        visible={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <TeamPerformanceModal
        visible={!!selectedPerformanceTeam}
        onClose={() => setSelectedPerformanceTeam(null)}
        team={selectedPerformanceTeam}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b'
  },
  pageSubtitle: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 2
  },
  exportBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6
  },
  exportBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  periodPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  periodPillText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600'
  },
  formGroup: {
    marginBottom: 10
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
    letterSpacing: 0.4
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  pillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569'
  },
  pillTextActive: {
    color: '#ffffff'
  },
  dateSelectorRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  generateBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4
  },
  generateBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700'
  },
  downloadPdfBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    marginTop: 8
  },
  downloadPdfBtnText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  categoryBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  catColorBar: {
    width: 4,
    height: 28,
    borderRadius: 2
  },
  catName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b'
  },
  catCount: {
    fontSize: 11,
    color: '#64748b'
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb'
  },
  perfList: {
    gap: 10
  },
  perfRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  teamBadgeCircle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamBadgeCircleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#be123c'
  },
  teamRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  teamRowSpec: {
    fontSize: 11,
    color: '#64748b',
    maxWidth: 160
  },
  teamRowJobs: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  teamRowTime: {
    fontSize: 11,
    color: '#64748b'
  },
  reportItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  repId: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7a1521'
  },
  repDate: {
    fontSize: 11,
    color: '#94a3b8'
  },
  repName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2
  },
  repPeriod: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  dlBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff0ef',
    borderWidth: 1,
    borderColor: '#ffdad9'
  }
});
