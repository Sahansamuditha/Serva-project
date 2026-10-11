import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Calendar,
  XCircle,
  TriangleAlert,
  SquareCheck,
  Phone,
  Users,
  UserCheck,
  User,
  MapPin,
  LayoutGrid,
  ChevronRight,
  TrendingUp
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import SmoothLineChart from '../components/Charts/LineChart';
import DonutChart from '../components/Charts/DonutChart';
import RequestCard from '../components/RequestCard';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { fetchStats, fetchRequests } from '../services/api';
import { COLORS } from '../theme/colors';

export default function DashboardScreen({ navigation, userProfile }) {
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

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('This Year');

  const loadData = async () => {
    const s = await fetchStats();
    const r = await fetchRequests();
    if (r) {
      setRequests(r);
      setRecentJobs(r.slice(0, 5));
    }

    const totalCount = r ? r.length : (s?.totalRequests ?? 5);
    const pendingCount = r ? r.filter(x => (x.status || '').toLowerCase().includes('pending')).length : (s?.pendingRequests ?? 1);
    const scheduledCount = r ? r.filter(x => (x.status || '').toLowerCase().includes('schedul')).length : (s?.scheduledRequests ?? 1);
    const inProgressCount = r ? r.filter(x => (x.status || '').toLowerCase().includes('progress')).length : (s?.inProgressRequests ?? 2);
    const completedCount = r ? r.filter(x => (x.status || '').toLowerCase().includes('complet')).length : (s?.completedRequests ?? 1);
    const rejectedCount = r ? r.filter(x => (x.status || '').toLowerCase().includes('reject')).length : (s?.rejectedRequests ?? 0);

    setStats({
      ...s,
      totalRequests: totalCount,
      pendingRequests: pendingCount,
      scheduledRequests: scheduledCount,
      inProgressRequests: inProgressCount,
      completedRequests: completedCount,
      rejectedRequests: rejectedCount
    });
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
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const rawFirstName = userProfile?.firstName?.trim() || '';
  const rawLastName = userProfile?.lastName?.trim() || '';
  const computedFromFirstLast = (rawFirstName || rawLastName) ? `${rawFirstName} ${rawLastName}`.trim() : '';
  const rawName = computedFromFirstLast || userProfile?.name || 'Chathu Thathsarani';
  const officerName = rawName.startsWith('Eng.') ? rawName : `Eng. ${rawName}`;

  const hasCustomAvatar = Boolean(
    userProfile?.avatar &&
    typeof userProfile.avatar === 'string' &&
    (userProfile.avatar.startsWith('data:') ||
      userProfile.avatar.startsWith('http://') ||
      userProfile.avatar.startsWith('https://') ||
      userProfile.avatar.startsWith('blob:'))
  );

  // Find high priority or critical request requiring immediate action
  const urgentRequest = requests.find(
    r => (r.priority === 'Critical' || r.priority === 'High') &&
      (r.status === 'Pending Review' || r.status === 'Pending' || r.status === 'In Progress')
  ) || requests.find(r => r.priority === 'Critical') || (requests.length > 0 ? requests[0] : null);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7a1521']} />}
    >
      {/* Welcome Banner matching design */}
      <View style={styles.welcomeCard}>
        {/* Soft decorative background shape on the right */}
        <View pointerEvents="none" style={styles.decorativeCircle} />

        <View style={styles.welcomeContentRow}>
          {/* Left Text Column */}
          <View style={styles.welcomeLeftCol}>
            {/* Top Date Pill */}
            <View style={styles.datePill}>
              <View style={styles.dateDot} />
              <Text style={styles.datePillText}>Fri, 22 Aug 2026</Text>
            </View>

            {/* Greeting Headline */}
            <Text style={styles.greetingText}>Good morning, {officerName}</Text>

            {/* Subtitle */}
            <Text style={styles.subGreeting} numberOfLines={1}>
              Campus electrical & HVAC systems...
            </Text>
          </View>

          {/* Right Avatar */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('More')}
            style={styles.avatarContainer}
          >
            {hasCustomAvatar ? (
              <Image
                source={{ uri: userProfile.avatar }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <User size={26} color="#ffffff" strokeWidth={2.2} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Urgent Maintenance Required Card (Shown below Good Morning card for High/Critical priority requests) */}
      {urgentRequest && (
        <View style={styles.urgentCard}>
          {/* Top Row: Urgent Maintenance Required badge + Time Ago pill */}
          <View style={styles.urgentTopRow}>
            <View style={styles.urgentBadgeLeft}>
              <View style={styles.urgentIconCircle}>
                <TriangleAlert size={16} color="#ffffff" strokeWidth={2.5} />
              </View>
              <View>
                <Text style={styles.urgentLabelTop}>URGENT MAINTENANCE</Text>
                <Text style={styles.urgentLabelSub}>REQUIRED</Text>
              </View>
            </View>

            <View style={styles.urgentTimePill}>
              <Text style={styles.urgentTimeText}>10 mins</Text>
              <Text style={styles.urgentTimeText}>ago</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.urgentTitle}>
            {urgentRequest.title || (urgentRequest.id ? `Request #${urgentRequest.id}` : 'Urgent Maintenance Request')}
          </Text>

          {/* Description */}
          {urgentRequest.description ? (
            <Text style={styles.urgentDesc}>
              {urgentRequest.description}
            </Text>
          ) : null}

          {/* Action Row */}
          <View style={styles.urgentActionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('RequestReview', { requestId: urgentRequest.id, request: urgentRequest })}
              style={styles.urgentProcessBtn}
            >
              <SquareCheck size={16} color="#ffffff" strokeWidth={2.2} />
              <Text style={styles.urgentProcessBtnText}>View & Process</Text>
            </TouchableOpacity>

            {(urgentRequest.requester?.phone || urgentRequest.requester_phone) ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  const phone = urgentRequest.requester?.phone || urgentRequest.requester_phone;
                  Linking.openURL(`tel:${phone}`).catch(() => {
                    Alert.alert('Contact Requester', `Calling: ${urgentRequest.requester?.name || 'Requester'}\nPhone: ${phone}`);
                  });
                }}
                style={styles.urgentPhoneBtn}
              >
                <Phone size={18} color="#7a1521" strokeWidth={2.2} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      {/* 6 Stat Cards Grid matching screenshot */}
      <View style={styles.statCardsGridContainer}>
        {/* Row 1: Requests (5) & Pending (1) */}
        <View style={styles.statCardsRow}>
          <StatCard
            title="Requests"
            value={stats?.totalRequests ?? 5}
            icon={FileText}
            color="blue"
            onPress={() => navigation.navigate('Requests')}
          />
          <StatCard
            title="Pending"
            value={stats?.pendingRequests ?? 1}
            icon={Clock}
            color="amber"
            onPress={() => navigation.navigate('Requests', { status: 'Pending Review' })}
          />
        </View>

        {/* Row 2: Scheduled (1) & In Progress (2) */}
        <View style={styles.statCardsRow}>
          <StatCard
            title="Scheduled"
            value={stats?.scheduledRequests ?? 1}
            icon={Calendar}
            color="purple"
            onPress={() => navigation.navigate('Requests', { status: 'Scheduled' })}
          />
          <StatCard
            title="In Progress"
            value={stats?.inProgressRequests ?? 2}
            icon={Wrench}
            color="blue"
            onPress={() => navigation.navigate('Jobs')}
          />
        </View>

        {/* Row 3: Completed (1) & Rejected (0) */}
        <View style={styles.statCardsRow}>
          <StatCard
            title="Completed"
            value={stats?.completedRequests ?? 1}
            icon={CheckCircle2}
            color="green"
            onPress={() => navigation.navigate('Jobs')}
          />
          <StatCard
            title="Rejected"
            value={stats?.rejectedRequests ?? 0}
            icon={XCircle}
            color="red"
            onPress={() => navigation.navigate('Requests')}
          />
        </View>
      </View>

      {/* Requests Overview Chart Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={16} color="#7a1521" />
            <Text style={styles.cardTitle}>Requests Overview</Text>
          </View>
          <TouchableOpacity
            onPress={() => setTimeRange(timeRange === 'This Year' ? 'Last Year' : 'This Year')}
            style={styles.timeRangePill}
          >
            <Text style={styles.timeRangeText}>{timeRange}</Text>
          </TouchableOpacity>
        </View>

        <SmoothLineChart
          data={stats?.requestsOverviewMonthly?.map(m => m.count) || [1, 2, 2, 3, 4, 4, 5, 5]}
          labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']}
          height={180}
          lineColor="#7a1521"
        />
      </View>

      {/* Requests by Status Donut Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Requests by Status</Text>
        </View>
        <DonutChart
          data={[
            { label: 'Pending', count: stats?.pendingRequests ?? 1, pct: '20%', color: '#f59e0b' },
            { label: 'Scheduled', count: stats?.scheduledRequests ?? 1, pct: '20%', color: '#8b5cf6' },
            { label: 'In Progress', count: stats?.inProgressRequests ?? 2, pct: '40%', color: '#3b82f6' },
            { label: 'Completed', count: stats?.completedRequests ?? 1, pct: '20%', color: '#10b981' },
            { label: 'Rejected', count: stats?.rejectedRequests ?? 0, pct: '0%', color: '#ef4444' }
          ]}
          total={stats?.totalRequests ?? 5}
          size={140}
        />
      </View>

      {/* System Overview Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>System Overview</Text>
        </View>
        <View style={styles.systemMetricsList}>
          <View style={styles.systemMetricRow}>
            <View style={styles.metricLeft}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#f5f3ff', color: '#8b5cf6' }]}>
                <Users size={16} color="#8b5cf6" />
              </View>
              <Text style={styles.metricLabel}>Total Users</Text>
            </View>
            <Text style={styles.metricVal}>86</Text>
          </View>

          <View style={styles.systemMetricRow}>
            <View style={styles.metricLeft}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#eff6ff' }]}>
                <UserCheck size={16} color="#2563eb" />
              </View>
              <Text style={styles.metricLabel}>Total Labourers</Text>
            </View>
            <Text style={styles.metricVal}>24</Text>
          </View>

          <View style={styles.systemMetricRow}>
            <View style={styles.metricLeft}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#f0fdf4' }]}>
                <MapPin size={16} color="#16a34a" />
              </View>
              <Text style={styles.metricLabel}>Total Locations</Text>
            </View>
            <Text style={styles.metricVal}>12</Text>
          </View>

          <View style={styles.systemMetricRow}>
            <View style={styles.metricLeft}>
              <View style={[styles.metricIconWrap, { backgroundColor: '#fff7ed' }]}>
                <LayoutGrid size={16} color="#ea580c" />
              </View>
              <Text style={styles.metricLabel}>Total Categories</Text>
            </View>
            <Text style={styles.metricVal}>8</Text>
          </View>
        </View>
      </View>

      {/* Recent Requests Section matching Screenshot 2 */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>Recent Requests</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Requests')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {recentJobs.map((job) => (
          <RequestCard
            key={job.id}
            request={job}
            onPress={() => navigation.navigate('RequestReview', { requestId: job.id, request: job })}
          />
        ))}
      </View>

      {/* ITUM Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          © 2026 Institute of Technology, University of Moratuwa. All rights reserved.
        </Text>
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
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  decorativeCircle: {
    position: 'absolute',
    right: -18,
    top: -18,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff1f2',
    opacity: 0.6
  },
  welcomeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  welcomeLeftCol: {
    flex: 1,
    marginRight: 12
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#ffe4e6',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 20,
    marginBottom: 8
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b91c1c',
    marginRight: 6
  },
  datePillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7a1521'
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 3,
    lineHeight: 26
  },
  subGreeting: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500'
  },
  avatarContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3
  },
  avatarImage: {
    width: 58,
    height: 58,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: '#f1f5f9',
    overflow: 'hidden'
  },
  avatarPlaceholder: {
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statCardsGridContainer: {
    marginBottom: 6
  },
  statCardsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10
  },
  // Urgent Maintenance Card Styles
  urgentCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2
  },
  urgentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  urgentBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  urgentIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center'
  },
  urgentLabelTop: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#991b1b',
    letterSpacing: 0.5
  },
  urgentLabelSub: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#991b1b',
    letterSpacing: 0.5
  },
  urgentTimePill: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  urgentTimeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7a1521',
    lineHeight: 12,
    textAlign: 'center'
  },
  urgentTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7a1521',
    lineHeight: 22,
    marginBottom: 5
  },
  urgentDesc: {
    fontSize: 12.5,
    color: '#7f1d1d',
    lineHeight: 17,
    marginBottom: 14
  },
  urgentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  urgentProcessBtn: {
    flex: 1,
    backgroundColor: '#5c0612',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    gap: 8
  },
  urgentProcessBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  urgentPhoneBtn: {
    width: 42,
    height: 42,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  timeRangePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc'
  },
  timeRangeText: {
    fontSize: 11.5,
    color: '#475569',
    fontWeight: '600'
  },
  systemMetricsList: {
    gap: 14
  },
  systemMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  metricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  metricLabel: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500'
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b'
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563eb'
  },
  jobItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  jobIdText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7a1521'
  },
  jobTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2
  },
  jobLocationText: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  viewJobBtn: {
    backgroundColor: '#7a1521',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6
  },
  viewJobBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center'
  }
});
