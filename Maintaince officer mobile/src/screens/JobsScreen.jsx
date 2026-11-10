import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
  Platform
} from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import {
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { fetchJobs } from '../services/api';
import { COLORS } from '../theme/colors';

export default function JobsScreen({ navigation }) {
  const scrollViewRef = useRef(null);
  useScrollToTop(scrollViewRef);

  useFocusEffect(
    useCallback(() => {
      const resetScroll = () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo?.({ y: 0, animated: false });
          if (Platform.OS === 'web') {
            const node = scrollViewRef.current.getScrollableNode?.() || scrollViewRef.current;
            if (node && typeof node.scrollTop === 'number') {
              node.scrollTop = 0;
            }
          }
        }
      };

      resetScroll();
      const timer = setTimeout(resetScroll, 30);
      return () => clearTimeout(timer);
    }, [])
  );

  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) + (priorityFilter !== 'All' ? 1 : 0);

  const loadJobs = async () => {
    const data = await fetchJobs({
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter
    });
    if (data) setJobs(data);
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 3000);
    const onFocus = () => loadJobs();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }
    return () => {
      clearInterval(interval);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7a1521']} />}
    >
      {/* Title */}
      <View style={styles.titleGroup}>
        <Text style={styles.pageTitle}>Maintenance Jobs</Text>
        <Text style={styles.pageSubtitle}>
          Track, schedule, and manage active and historical maintenance tasks.
        </Text>
      </View>

      {/* 4 Stat Cards */}
      <View style={styles.statCardsRow}>
        <StatCard title="Total Jobs" value={jobs.length} icon={Briefcase} color="blue" />
        <StatCard title="In Progress" value={jobs.filter(j => (j.status || '').toLowerCase().includes('progress')).length} icon={Clock} color="blue" />
      </View>
      <View style={styles.statCardsRow}>
        <StatCard title="Scheduled" value={jobs.filter(j => (j.status || '').toLowerCase().includes('schedul')).length} icon={Calendar} color="orange" />
        <StatCard title="Completed" value={jobs.filter(j => (j.status || '').toLowerCase().includes('complet')).length} icon={CheckCircle2} color="green" />
      </View>

      {/* Search & Filter Header Row */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Search size={16} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search Job ID, title, team..."
              placeholderTextColor="#94a3b8"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm ? (
              <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearBtn}>
                <X size={14} color="#94a3b8" />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Filter button to the right of search bar */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsFilterOpen(!isFilterOpen)}
            style={[
              styles.filterBtn,
              (isFilterOpen || activeFiltersCount > 0) && styles.filterBtnActive
            ]}
          >
            <Filter
              size={15}
              color={isFilterOpen || activeFiltersCount > 0 ? '#ffffff' : '#334155'}
              strokeWidth={2.3}
            />
            <Text
              style={[
                styles.filterBtnText,
                (isFilterOpen || activeFiltersCount > 0) && styles.filterBtnTextActive
              ]}
            >
              Filter
            </Text>
            {activeFiltersCount > 0 && (
              <View style={[
                styles.filterBadge,
                isFilterOpen && { backgroundColor: '#ffffff' }
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  isFilterOpen && { color: '#7a1521' }
                ]}>
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Collapsible Filter Panel */}
        {isFilterOpen && (
          <View style={styles.filterCard}>
            <View style={styles.filterCardHeader}>
              <Text style={styles.filterCardTitle}>Filter Jobs</Text>
              {activeFiltersCount > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setStatusFilter('All');
                    setPriorityFilter('All');
                  }}
                  style={styles.resetBtn}
                >
                  <Text style={styles.resetBtnText}>Reset All</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterPillsRow}>
                {['All', 'In Progress', 'Scheduled', 'Completed'].map(s => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => setStatusFilter(s)}
                    style={[styles.pill, statusFilter === s && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, statusFilter === s && styles.pillTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Priority:</Text>
              <View style={styles.filterPillsRow}>
                {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriorityFilter(p)}
                    style={[styles.pill, priorityFilter === p && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, priorityFilter === p && styles.pillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Jobs List */}
      <View style={styles.jobsList}>
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
          />
        ))}
      </View>
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
  titleGroup: {
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
  statCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  searchFilterContainer: {
    marginBottom: 12
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  searchInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b'
  },
  clearBtn: {
    padding: 4
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1
  },
  filterBtnActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155'
  },
  filterBtnTextActive: {
    color: '#ffffff'
  },
  filterBadge: {
    backgroundColor: '#7a1521',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  filterBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800'
  },
  filterCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  filterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  filterCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e293b'
  },
  resetBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6
  },
  resetBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#dc2626'
  },
  filterRow: {
    marginBottom: 8
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4
  },
  filterPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 2
  },
  pillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  pillTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },

  jobsList: {
    gap: 12
  },
  jobCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  jobCardSelected: {
    borderColor: '#7a1521',
    backgroundColor: '#fffdfd'
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  jobId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7a1521'
  },
  reqRef: {
    fontSize: 12,
    color: '#64748b'
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2
  },
  assignedTeam: {
    fontSize: 12.5,
    color: '#475569',
    marginVertical: 8
  },
  jobBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  manageBtn: {
    backgroundColor: '#7a1521',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6
  },
  manageBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  }
});
