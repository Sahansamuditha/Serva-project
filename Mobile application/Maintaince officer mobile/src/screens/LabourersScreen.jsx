import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl
} from 'react-native';
import {
  Users,
  UserCheck,
  Calendar,
  Plus,
  Zap,
  CheckCircle,
  FileText,
  BarChart2
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import CreateTeamModal from '../components/CreateTeamModal';
import TeamPerformanceModal from '../components/TeamPerformanceModal';
import { fetchTeams, createTeam, fetchLabourers } from '../services/api';
import { COLORS } from '../theme/colors';

export default function LabourersScreen() {
  const [teams, setTeams] = useState([]);
  const [labourers, setLabourers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPerformanceTeam, setSelectedPerformanceTeam] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTeams = async () => {
    const data = await fetchTeams();
    if (data) setTeams(data);
    const labs = await fetchLabourers();
    if (labs) setLabourers(labs);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeams();
    setRefreshing(false);
  };

  const handleCreateTeam = async (teamData) => {
    await createTeam(teamData);
    loadTeams();
  };

  const totalPersonnel = (teams.reduce((acc, t) => acc + (Number(t.membersCount) || 0), 0) || 0) + (labourers.length || 0);
  const activeTeams = teams.filter(t => t.status === 'Active').length;
  const onDutyCount = labourers.filter(l => l.status === 'Assigned').length;
  const availableCount = labourers.filter(l => l.status === 'Available').length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7a1521']} />}
    >
      {/* Title & Add Button */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.pageTitle}>Maintenance Teams</Text>
          <Text style={styles.pageSubtitle}>
            Manage maintenance crews, track workloads, and monitor availability.
          </Text>
        </View>

        <TouchableOpacity onPress={() => setShowCreateModal(true)} style={styles.addBtn}>
          <Plus size={16} color="#ffffff" />
          <Text style={styles.addBtnText}>Add Team</Text>
        </TouchableOpacity>
      </View>

      {/* 4 Stat Cards */}
      <View style={styles.statCardsRow}>
        <StatCard title="Personnel" value={totalPersonnel > 0 ? totalPersonnel : 42} icon={Users} color="blue" />
        <StatCard title="Active Teams" value={activeTeams > 0 ? activeTeams : teams.length} icon={Users} color="blue" />
      </View>
      <View style={styles.statCardsRow}>
        <StatCard title="On-Duty" value={onDutyCount > 0 ? onDutyCount : 15} icon={UserCheck} color="purple" />
        <StatCard title="Available" value={availableCount > 0 ? availableCount : 6} icon={Calendar} color="teal" />
      </View>

      {/* Teams List */}
      <View style={styles.teamsList}>
        {teams.map((team) => {
          const isActive = team.status === 'Active';
          return (
            <View key={team.id} style={[styles.teamCard, { borderTopColor: isActive ? '#10b981' : '#f59e0b' }]}>
              {/* Header */}
              <View style={styles.teamTopRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.zapBox}>
                    <Zap size={14} color="#be123c" />
                  </View>
                  <Text style={styles.teamName}>{team.name}</Text>
                </View>

                <View style={styles.statusPill}>
                  <View style={[styles.statusDot, { backgroundColor: isActive ? '#10b981' : '#94a3b8' }]} />
                  <Text style={[styles.statusText, { color: isActive ? '#059669' : '#64748b' }]}>{team.status}</Text>
                </View>
              </View>

              <Text style={styles.specText}>{team.specialization}</Text>

              {/* Lead & Workload */}
              <View style={styles.teamMetaGrid}>
                <View>
                  <Text style={styles.metaLabel}>LEAD</Text>
                  <Text style={styles.metaVal}>{team.lead}</Text>
                </View>

                <View>
                  <Text style={styles.metaLabel}>WORKLOAD</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    {team.workload === 'Available' ? (
                      <CheckCircle size={14} color="#059669" />
                    ) : (
                      <FileText size={14} color="#be123c" />
                    )}
                    <Text style={{ fontSize: 13, fontWeight: '600', color: team.workload === 'Available' ? '#059669' : '#be123c' }}>
                      {team.workload}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Members Avatar Row */}
              <View style={styles.membersRow}>
                <Text style={styles.membersCountText}>{team.membersCount || 4} Members</Text>

                <View style={styles.avatarOverlapRow}>
                  {['DC', 'KP', 'SS'].map((initials, i) => (
                    <View key={i} style={[styles.memberCircle, { marginLeft: i > 0 ? -8 : 0 }]}>
                      <Text style={styles.memberCircleText}>{initials}</Text>
                    </View>
                  ))}
                  <View style={[styles.memberCircle, { backgroundColor: '#ffe4e6', marginLeft: -8 }]}>
                    <Text style={[styles.memberCircleText, { color: '#be123c' }]}>+1</Text>
                  </View>
                </View>
              </View>

              {/* View Performance Button */}
              <TouchableOpacity
                onPress={() => setSelectedPerformanceTeam(team)}
                style={styles.performanceBtn}
              >
                <BarChart2 size={16} color="#7a1521" />
                <Text style={styles.performanceBtnText}>View Performance</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Modals */}
      <CreateTeamModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreateTeam}
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
    paddingBottom: 100
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
  addBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  teamsList: {
    gap: 14,
    marginTop: 4
  },
  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderTopWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  teamTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  zapBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  teamName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  specText: {
    fontSize: 12.5,
    color: '#64748b',
    marginBottom: 14
  },
  teamMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9'
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2
  },
  membersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12
  },
  membersCountText: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '500'
  },
  avatarOverlapRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  memberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  memberCircleText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '700'
  },
  performanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#7a1521',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 8,
    backgroundColor: '#fff0ef'
  },
  performanceBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7a1521'
  }
});
