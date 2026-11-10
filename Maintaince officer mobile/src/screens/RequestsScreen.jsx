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
  Search,
  Filter,
  FileText,
  Clock,
  Calendar,
  XCircle,
  Wrench,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import RequestCard from '../components/RequestCard';
import { StatusBadge, PriorityBadge, CategoryTag } from '../components/Badge';
import { fetchRequests, fetchStats } from '../services/api';
import { COLORS } from '../theme/colors';

export default function RequestsScreen({ navigation }) {
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

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);

  const activeFiltersCount = (statusFilter !== 'All' ? 1 : 0) +
    (priorityFilter !== 'All' ? 1 : 0) +
    (categoryFilter !== 'All' ? 1 : 0);

  const loadData = async () => {
    const s = await fetchStats();
    if (s) setStats(s);

    const r = await fetchRequests({
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter,
      unassignedOnly: statusFilter === 'All'
    });
    if (r) {
      // Exclude requests that have been assigned to a labourer (In Progress / Completed)
      const filtered = statusFilter === 'All'
        ? r.filter(req => {
            const st = (req.status || '').toLowerCase();
            return st !== 'in progress' && st !== 'completed';
          })
        : r;
      setRequests(filtered);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    const onFocus = () => loadData();
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
    await loadData();
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
      {/* Page Title */}
      <View style={styles.headerTitleGroup}>
        <Text style={styles.pageTitle}>Maintenance Requests</Text>
        <Text style={styles.pageSubtitle}>
          Review, filter, accept/reject, and process incoming facility requests.
        </Text>
      </View>

      {/* Top 4 Stat Cards: Requests, Pending, Scheduled, Rejected */}
      <View style={styles.statCardsRow}>
        <StatCard
          title="Requests"
          value={stats?.totalRequests ?? requests.length}
          icon={FileText}
          color="blue"
          onPress={() => setStatusFilter('All')}
        />
        <StatCard
          title="Pending"
          value={stats?.pendingRequests ?? requests.filter(r => r.status === 'Pending').length}
          icon={Clock}
          color="amber"
          onPress={() => setStatusFilter('Pending')}
        />
      </View>
      <View style={styles.statCardsRow}>
        <StatCard
          title="Scheduled"
          value={stats?.scheduledRequests ?? requests.filter(r => r.status === 'Scheduled').length}
          icon={Calendar}
          color="cyan"
          onPress={() => setStatusFilter('Scheduled')}
        />
        <StatCard
          title="Rejected"
          value={stats?.rejectedRequests ?? requests.filter(r => r.status === 'Rejected').length}
          icon={XCircle}
          color="rose"
          onPress={() => setStatusFilter('Rejected')}
        />
      </View>

      {/* Search & Filter Header Row */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputWrap}>
            <Search size={16} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by ID, title, requester..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#94a3b8"
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

        {/* Collapsible Filter Dropdown / Drawer Panel */}
        {isFilterOpen && (
          <View style={styles.filterCard}>
            <View style={styles.filterCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.filterCardTitle}>Filter Requests</Text>
                {activeFiltersCount > 0 && (
                  <View style={styles.activeCountTag}>
                    <Text style={styles.activeCountTagText}>{activeFiltersCount} applied</Text>
                  </View>
                )}
              </View>

              {activeFiltersCount > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setStatusFilter('All');
                    setPriorityFilter('All');
                    setCategoryFilter('All');
                  }}
                  style={styles.resetBtn}
                >
                  <Text style={styles.resetBtnText}>Reset All</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Status Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterHeaderLabel}>STATUS</Text>
              <View style={styles.filterPillsRow}>
                {['All', 'Pending', 'Accepted', 'Scheduled', 'In Progress', 'Completed', 'Rejected'].map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.filterPill, statusFilter === s && styles.filterPillActive]}
                    onPress={() => setStatusFilter(s)}
                  >
                    <Text style={[styles.filterPillText, statusFilter === s && styles.filterPillTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterHeaderLabel}>PRIORITY</Text>
              <View style={styles.filterPillsRow}>
                {['All', 'Low', 'Medium', 'High', 'Critical'].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.filterPill, priorityFilter === p && styles.filterPillActive]}
                    onPress={() => setPriorityFilter(p)}
                  >
                    <Text style={[styles.filterPillText, priorityFilter === p && styles.filterPillTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Filter */}
            <View style={[styles.filterSection, { marginBottom: 2 }]}>
              <Text style={styles.filterHeaderLabel}>CATEGORY</Text>
              <View style={styles.filterPillsRow}>
                {['All', 'Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Cleaning', 'IT/Network', 'Civil'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.filterPill, categoryFilter === c && styles.filterPillActive]}
                    onPress={() => setCategoryFilter(c)}
                  >
                    <Text style={[styles.filterPillText, categoryFilter === c && styles.filterPillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Requests List */}
      <View style={styles.requestsList}>
        {requests.length > 0 ? (
          requests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onPress={() => navigation.navigate('RequestReview', { requestId: req.id, request: req })}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Maintenance Requests Found</Text>
            <Text style={styles.emptySub}>There are no maintenance requests matching this view.</Text>
          </View>
        )}
      </View>

      {/* Pagination Footer */}
      <View style={styles.paginationCard}>
        <Text style={styles.paginationText}>
          Showing {requests.length > 0 ? `1-${requests.length} of ${stats?.totalRequests || requests.length}` : '0 of 0'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.pageBtn} disabled={page === 1}>
            <ChevronLeft size={16} color={page === 1 ? '#cbd5e1' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.pageBtn} disabled={true}>
            <ChevronRight size={16} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
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
  headerTitleGroup: {
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
    marginBottom: 14
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
  activeCountTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  activeCountTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#b45309'
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
  filterSection: {
    marginBottom: 8
  },
  filterHeaderLabel: {
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
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 2
  },
  filterPillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  },
  filterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  requestsList: {
    gap: 12
  },
  requestCard: {
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
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  reqIdText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7a1521'
  },
  reqDateText: {
    fontSize: 11,
    color: '#94a3b8'
  },
  reqTitleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b'
  },
  reqLocationText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  requestBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  viewBtn: {
    backgroundColor: '#7a1521',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  paginationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingHorizontal: 8
  },
  paginationText: {
    fontSize: 12.5,
    color: '#64748b'
  },
  pageBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6
  },
  emptySub: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center'
  }
});
