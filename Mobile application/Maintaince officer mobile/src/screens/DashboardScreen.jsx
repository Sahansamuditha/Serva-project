
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
  Platform,
  Modal,
  TextInput
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
  User,
  MapPin,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  ChevronDown,
  Check,
  RotateCcw
} from 'lucide-react-native';
import StatCard from '../components/StatCard';
import SmoothLineChart from '../components/Charts/LineChart';
import DonutChart from '../components/Charts/DonutChart';
import RequestCard from '../components/RequestCard';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { fetchStats, fetchRequests, fetchJobs } from '../services/api';
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
  const [allRequestsList, setAllRequestsList] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [timeRangeModalVisible, setTimeRangeModalVisible] = useState(false);
  const [customDateModalVisible, setCustomDateModalVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());
  const [activePickerField, setActivePickerField] = useState('from'); // 'from' | 'to'

  const openCustomDateModal = () => {
    if (customStartDate) {
      const parts = customStartDate.split('-');
      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setCalendarYear(y);
          setCalendarMonth(m);
        }
      }
    } else {
      const now = new Date();
      setCalendarYear(now.getFullYear());
      setCalendarMonth(now.getMonth());
    }
    setActivePickerField('from');
    setCustomDateModalVisible(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const formatYMD = (year, monthIndex, day) => {
    const y = year;
    const m = String(monthIndex + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleDayPress = (dayNum) => {
    const selectedDateStr = formatYMD(calendarYear, calendarMonth, dayNum);

    if (activePickerField === 'from') {
      setCustomStartDate(selectedDateStr);
      if (customEndDate && selectedDateStr > customEndDate) {
        setCustomEndDate('');
      }
      setActivePickerField('to');
    } else {
      if (customStartDate && selectedDateStr < customStartDate) {
        setCustomStartDate(selectedDateStr);
        setCustomEndDate('');
      } else {
        setCustomEndDate(selectedDateStr);
      }
    }
  };

  const loadData = async () => {
    const s = await fetchStats();
    const r = await fetchRequests();
    const j = await fetchJobs();
    if (s?.allRequests && Array.isArray(s.allRequests) && s.allRequests.length > 0) {
      setAllRequestsList(s.allRequests);
      setRequests(s.allRequests);
      setRecentJobs(s.allRequests.slice(0, 5));
    } else if (r && Array.isArray(r)) {
      const validReqs = r.filter(req => {
        const st = (req.status || '').toLowerCase();
        const isJobManaged = Boolean(
          (req.linked_job_id && (
            req.linked_job_status === 'Rejected' || 
            req.linked_job_notes?.includes('[REJECTED]') ||
            Number(req.linked_job_labourers || 0) > 0
          )) ||
          req.notes?.includes('[REJECTED]') ||
          st === 'assigned' ||
          st === 'in progress' ||
          st === 'completed'
        );
        return !isJobManaged;
      }).map(x => ({
        ...x,
        mapped_status: ['pending', 'pending review', 'accepted'].includes((x.status || '').toLowerCase())
          ? 'Pending'
          : (['scheduled', 'on hold', 'hold'].includes((x.status || '').toLowerCase()) ? 'Scheduled' : 'Rejected')
      }));

      const validJobs = (j || []).filter(job => {
        const st = (job.status || '').toLowerCase();
        const hasLabourers = Number(job.labourers_assigned || job.labourersAssigned || 0) > 0;
        if (st === 'rejected' || (job.notes || '').includes('[REJECTED]')) return true;
        return !(['scheduled', 'on hold', 'hold'].includes(st) && !hasLabourers);
      });

      const compJobs = validJobs.filter(job => (job.status || '').toLowerCase() === 'completed').map(job => ({ ...job, mapped_status: 'Completed' }));
      const inProgJobs = validJobs.filter(job => ['in progress', 'pending start', 'assigned', 'pending'].includes((job.status || '').toLowerCase())).map(job => ({ ...job, mapped_status: 'In Progress' }));
      const schedJobs = validJobs.filter(job => {
        const st = (job.status || '').toLowerCase();
        const hasLabourers = Number(job.labourers_assigned || 0) > 0;
        return st === 'rejected' || (job.notes || '').includes('[REJECTED]') || (['scheduled', 'on hold', 'hold'].includes(st) && hasLabourers);
      }).map(job => ({ ...job, id: job.id?.startsWith('JOB-') ? `${job.id}-SCHED` : job.id, mapped_status: 'Scheduled' }));

      const unified = [...validReqs, ...inProgJobs, ...schedJobs, ...compJobs];
      setAllRequestsList(unified);
      setRequests(unified);
      setRecentJobs(unified.slice(0, 5));
    }

    const pendingCount = s?.pending !== undefined
      ? s.pending
      : (s?.pendingRequests !== undefined
        ? ((s.pendingRequests || 0) + (s.acceptedRequests || 0))
        : (r ? r.filter(x => {
          const st = (x.status || '').toLowerCase();
          return st === 'pending' || st.includes('pending review') || st === 'accepted';
        }).length : 0));
    const reqSchedCount = (r && Array.isArray(r))
      ? r.filter(x => {
        const st = (x.status || '').toLowerCase();
        return st.includes('schedul') || st.includes('hold');
      }).length
      : 0;
    const jobSchedCount = (j && Array.isArray(j))
      ? j.filter(job => {
        const st = (job.status || '').toLowerCase();
        const hasLabourers = Number(job.labourers_assigned || job.labourersAssigned || 0) > 0;
        return st === 'rejected' || ((st.includes('schedul') || st.includes('hold')) && hasLabourers);
      }).length
      : 0;
    const scheduledCount = (r && j)
      ? (reqSchedCount + jobSchedCount)
      : (s?.scheduledRequests ?? s?.scheduled ?? 0);
    const inProgressCount = (j && Array.isArray(j) && j.length > 0)
      ? j.filter(job => {
        const st = (job.status || '').toLowerCase();
        return ['in progress', 'pending start', 'assigned', 'pending'].includes(st);
      }).length
      : (s?.inProgressJobs ?? s?.inProgressRequests ?? s?.inProgress ?? (r ? r.filter(x => {
        const st = (x.status || '').toLowerCase();
        return st.includes('progress') || st.includes('assigned') || st.includes('pending start');
      }).length : 0));
    const completedCount = (j && Array.isArray(j))
      ? j.filter(job => (job.status || '').toLowerCase().includes('complet')).length
      : (s?.completedJobs ?? s?.completedRequests ?? s?.completed ?? 0);
    const rejectedCount = s?.rejectedRequests ?? s?.rejected ?? s?.cancelled ?? (r ? r.filter(x => {
      const st = (x.status || '').toLowerCase();
      return st.includes('reject') || st.includes('cancel');
    }).length : 0);
    const totalCount = pendingCount + scheduledCount + inProgressCount + completedCount + rejectedCount;

    setStats({
      ...s,
      totalRequests: totalCount,
      pendingRequests: pendingCount,
      scheduledRequests: scheduledCount,
      scheduled: scheduledCount,
      inProgressRequests: inProgressCount,
      inProgress: inProgressCount,
      completedRequests: completedCount,
      completed: completedCount,
      completedJobs: completedCount,
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
  const officerName = rawName.replace(/^Eng\.\s*/i, '');

  const hasCustomAvatar = Boolean(
    userProfile?.avatar &&
    typeof userProfile.avatar === 'string' &&
    (userProfile.avatar.startsWith('data:') ||
      userProfile.avatar.startsWith('http://') ||
      userProfile.avatar.startsWith('https://') ||
      userProfile.avatar.startsWith('blob:'))
  );

  // Find high priority or critical request requiring immediate action (exclude rejected or completed)
  const activeUrgentCandidates = requests.filter(r => {
    const st = (r.status || '').toLowerCase();
    return st !== 'rejected' && st !== 'cancelled' && st !== 'completed';
  });

  const urgentRequest = activeUrgentCandidates.find(
    r => (r.priority === 'Critical' || r.priority === 'High') &&
      (r.status === 'Pending Review' || r.status === 'Pending' || r.status === 'In Progress')
  ) || activeUrgentCandidates.find(r => r.priority === 'Critical') || (activeUrgentCandidates.length > 0 ? activeUrgentCandidates[0] : null);
  // Helper to parse dates safely
  const getReqDate = (r) => {
    const val = r?.created_at || r?.submittedDate || r?.createdAt || r?.date;
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  // Calculate date range bounds based on timeFilter
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let rangeStart = null;
  let rangeEnd = null;

  if (timeFilter === 'Today') {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (timeFilter === 'This Week') {
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    rangeStart = new Date(now);
    rangeStart.setDate(now.getDate() - distanceToMonday);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeStart.getDate() + 6);
    rangeEnd.setHours(23, 59, 59, 999);
  } else if (timeFilter === 'This Month') {
    rangeStart = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    rangeEnd = new Date(currentYear, currentMonth, lastDay, 23, 59, 59, 999);
  } else if (timeFilter === 'This Year') {
    rangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    rangeEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
  } else if (timeFilter === 'Custom Range') {
    if (customStartDate) rangeStart = new Date(customStartDate + 'T00:00:00');
    if (customEndDate) rangeEnd = new Date(customEndDate + 'T23:59:59');
  }

  const baseList = allRequestsList.length > 0 ? allRequestsList : requests;

  const filteredRequests = baseList.filter(r => {
    if (timeFilter === 'All Time' && !customStartDate && !customEndDate) return true;
    const d = getReqDate(r);
    if (!d) return false;
    if (rangeStart && d < rangeStart) return false;
    if (rangeEnd && d > rangeEnd) return false;
    return true;
  });

  const totalFilteredCount = baseList.length > 0 ? filteredRequests.length : (stats?.totalRequests || 31);
  const pendingCount = baseList.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'pending' || st === 'pending review' || st === 'accepted';
    }).length
    : ((stats?.pendingRequests || 0) + (stats?.acceptedRequests || 0));
  const scheduledCount = baseList.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'scheduled' || st === 'on hold' || st === 'hold';
    }).length
    : (stats?.scheduledRequests ?? stats?.scheduled ?? 11);
  const inProgressCount = baseList.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'in progress' || st === 'assigned' || st === 'pending start';
    }).length
    : (stats?.inProgressJobs ?? stats?.inProgressRequests ?? stats?.inProgress ?? 8);
  const completedCount = baseList.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'completed';
    }).length
    : (stats?.completedJobs ?? stats?.completedRequests ?? stats?.completed ?? 2);
  const rejectedCount = baseList.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'rejected' || st === 'cancelled';
    }).length
    : (stats?.rejectedRequests ?? stats?.rejected ?? 10);

  // Calculate Chart Data dynamically based on timeFilter
  let chartLabels = [];
  let chartCounts = [];

  if (timeFilter === 'Day' || timeFilter === 'Today') {
    const slots = [
      { label: '12 AM', start: 0, end: 4 },
      { label: '4 AM', start: 4, end: 8 },
      { label: '8 AM', start: 8, end: 12 },
      { label: '12 PM', start: 12, end: 16 },
      { label: '4 PM', start: 16, end: 20 },
      { label: '8 PM', start: 20, end: 24 }
    ];
    chartLabels = slots.map(s => s.label);
    chartCounts = slots.map(s => filteredRequests.filter(r => {
      const d = getReqDate(r);
      const h = d ? d.getHours() : -1;
      return h >= s.start && h < s.end;
    }).length);
  } else if (timeFilter === 'This Week') {
    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDates = weekDayNames.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dayNum = d.getDate();
      return {
        label: `${dayName} ${dayNum}`,
        dateStr: d.toDateString()
      };
    });
    chartLabels = weekDates.map(w => w.label);
    chartCounts = weekDates.map(item =>
      filteredRequests.filter(r => {
        const d = getReqDate(r);
        return d && d.toDateString() === item.dateStr;
      }).length
    );
  } else if (timeFilter === 'This Month') {
    const monthName = now.toLocaleString('en-US', { month: 'short' });
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weeks = [
      { label: `${monthName} 1-7`, start: 1, end: 7 },
      { label: `${monthName} 8-14`, start: 8, end: 14 },
      { label: `${monthName} 15-21`, start: 15, end: 21 },
      { label: `${monthName} 22-${lastDay}`, start: 22, end: lastDay }
    ];
    chartLabels = weeks.map(w => w.label);
    chartCounts = weeks.map(w => filteredRequests.filter(r => {
      const d = getReqDate(r);
      const day = d ? d.getDate() : -1;
      return day >= w.start && day <= w.end;
    }).length);
  } else {
    // 'This Year' or 'All Time'
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    chartLabels = months;
    if (filteredRequests.length > 0) {
      chartCounts = months.map((_, idx) => filteredRequests.filter(r => {
        const d = getReqDate(r);
        return d && d.getFullYear() === currentYear && d.getMonth() === idx;
      }).length);
    } else {
      chartLabels = stats?.requestsOverviewMonthly?.map(m => m.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      chartCounts = stats?.requestsOverviewMonthly?.map(m => m.count) || [0, 0, 0, 0, 0, 0, 0, totalFilteredCount];
    }
  }

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay(); // 0 = Sun
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

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

      {/* Date Filter Toolbar directly above 6 Stat Cards (matching Screenshot 2) */}
      <View style={styles.filterOperationsCard}>
        <View style={styles.filterHeaderRow}>
          <View style={styles.filterIconBadge}>
            <Calendar size={16} color="#7a1521" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.filterTitle}>Filter Operations:</Text>
              <View style={styles.filterActivePill}>
                <Text style={styles.filterActivePillText}>{timeFilter}</Text>
              </View>
            </View>
          </View>
          {(timeFilter !== 'All Time' || customStartDate || customEndDate) && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setTimeFilter('All Time');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              style={styles.filterResetBtn}
            >
              <RotateCcw size={12} color="#dc2626" />
              <Text style={styles.filterResetText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips capsule matching Screenshot 2 */}
        <View style={styles.filterChipsCapsuleWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipsCapsule}
          >
            {['All Time', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Range'].map((opt) => {
              const isActive = timeFilter === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.75}
                  onPress={() => {
                    if (opt === 'Custom Range') {
                      setTimeFilter('Custom Range');
                      openCustomDateModal();
                    } else {
                      setTimeFilter(opt);
                      setCustomStartDate('');
                      setCustomEndDate('');
                    }
                  }}
                  style={[
                    styles.filterCapsuleChip,
                    isActive && styles.filterCapsuleChipActive
                  ]}
                >
                  <Text style={[
                    styles.filterCapsuleChipText,
                    isActive && styles.filterCapsuleChipTextActive
                  ]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* If Custom Range is selected, show active range info & Edit button */}
        {timeFilter === 'Custom Range' && (
          <View style={styles.customRangeRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
              <Calendar size={13} color="#64748b" />
              <Text style={styles.customRangeInfoText}>
                {customStartDate || customEndDate
                  ? `${customStartDate || 'Any'} → ${customEndDate || 'Any'}`
                  : 'No custom date range set'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => openCustomDateModal()}
              style={styles.customRangeEditBtn}
            >
              <Text style={styles.customRangeEditText}>
                {customStartDate || customEndDate ? 'Edit' : 'Set Range'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 6 Stat Cards Grid matching screenshot */}
      <View style={styles.statCardsGridContainer}>
        {/* Row 1: Requests & Pending */}
        <View style={styles.statCardsRow}>
          <StatCard
            title="Requests"
            value={totalFilteredCount}
            icon={FileText}
            color="blue"
            onPress={() => navigation.navigate('Requests')}
          />
          <StatCard
            title="Pending"
            value={pendingCount}
            icon={Clock}
            color="amber"
            onPress={() => navigation.navigate('Requests', { status: 'Pending Review' })}
          />
        </View>

        {/* Row 2: Scheduled & In Progress */}
        <View style={styles.statCardsRow}>
          <StatCard
            title="Scheduled"
            value={scheduledCount}
            icon={Calendar}
            color="purple"
            onPress={() => navigation.navigate('Requests', { status: 'Scheduled' })}
          />
          <StatCard
            title="In Progress"
            value={inProgressCount}
            icon={Wrench}
            color="blue"
            onPress={() => navigation.navigate('Jobs')}
          />
        </View>

        {/* Row 3: Completed & Rejected */}
        <View style={styles.statCardsRow}>
          <StatCard
            title="Completed"
            value={completedCount}
            icon={CheckCircle2}
            color="green"
            onPress={() => navigation.navigate('Jobs')}
          />
          <StatCard
            title="Rejected"
            value={rejectedCount}
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
            onPress={() => setTimeRangeModalVisible(true)}
            style={[styles.timeRangePill, { flexDirection: 'row', alignItems: 'center', gap: 5 }]}
          >
            <Text style={styles.timeRangeText}>{timeFilter}</Text>
            <ChevronDown size={13} color="#475569" />
          </TouchableOpacity>
        </View>

        <SmoothLineChart
          data={chartCounts}
          labels={chartLabels}
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
            { label: 'Pending', count: pendingCount, pct: (totalFilteredCount ? Math.round((pendingCount / totalFilteredCount) * 100) : 0) + '%', color: '#f59e0b' },
            { label: 'Scheduled', count: scheduledCount, pct: (totalFilteredCount ? Math.round((scheduledCount / totalFilteredCount) * 100) : 0) + '%', color: '#8b5cf6' },
            { label: 'In Progress', count: inProgressCount, pct: (totalFilteredCount ? Math.round((inProgressCount / totalFilteredCount) * 100) : 0) + '%', color: '#3b82f6' },
            { label: 'Completed', count: completedCount, pct: (totalFilteredCount ? Math.round((completedCount / totalFilteredCount) * 100) : 0) + '%', color: '#10b981' },
            { label: 'Rejected', count: rejectedCount, pct: (totalFilteredCount ? Math.round((rejectedCount / totalFilteredCount) * 100) : 0) + '%', color: '#ef4444' }
          ]}
          total={totalFilteredCount}
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
      {/* Time Range Selector Modal */}
      <Modal
        visible={timeRangeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTimeRangeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTimeRangeModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Select Time Range</Text>
            {['All Time', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Range'].map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => {
                  setTimeFilter(opt);
                  setTimeRangeModalVisible(false);
                  if (opt === 'Custom Range') {
                    openCustomDateModal();
                  } else {
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }
                }}
                style={[
                  styles.modalOption,
                  timeFilter === opt && styles.modalOptionActive
                ]}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    timeFilter === opt && styles.modalOptionTextActive
                  ]}
                >
                  {opt}
                </Text>
                {timeFilter === opt && <Check size={16} color="#7a1521" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Custom Date Range Modal with Interactive Calendar */}
      <Modal
        visible={customDateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCustomDateModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCustomDateModalVisible(false)}
        >
          <View
            style={[styles.modalCard, { width: '92%', maxWidth: 350, padding: 14 }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#fff1f2', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={17} color="#7a1521" />
                </View>
                <Text style={styles.modalTitleInline}>Custom Date Range</Text>
              </View>
              <TouchableOpacity
                onPress={() => setCustomDateModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <XCircle size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* From / To Active Selector Tabs */}
            <View style={styles.rangeSelectorRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActivePickerField('from')}
                style={[
                  styles.rangeSelectorTab,
                  activePickerField === 'from' && styles.rangeSelectorTabActive
                ]}
              >
                <Text style={styles.rangeSelectorLabel}>From (Start)</Text>
                <Text style={[
                  styles.rangeSelectorValue,
                  activePickerField === 'from' && styles.rangeSelectorValueActive
                ]}>
                  {customStartDate || 'Select Date'}
                </Text>
              </TouchableOpacity>

              <View style={{ paddingHorizontal: 4 }}>
                <Text style={{ color: '#94a3b8', fontWeight: '700' }}>→</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActivePickerField('to')}
                style={[
                  styles.rangeSelectorTab,
                  activePickerField === 'to' && styles.rangeSelectorTabActive
                ]}
              >
                <Text style={styles.rangeSelectorLabel}>To (End)</Text>
                <Text style={[
                  styles.rangeSelectorValue,
                  activePickerField === 'to' && styles.rangeSelectorValueActive
                ]}>
                  {customEndDate || 'Select Date'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Calendar Container */}
            <View style={styles.calendarContainer}>
              {/* Month Navigation */}
              <View style={styles.calendarHeaderRow}>
                <TouchableOpacity
                  onPress={prevMonth}
                  style={styles.calendarNavBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ChevronLeft size={16} color="#475569" />
                </TouchableOpacity>

                <Text style={styles.calendarMonthTitle}>
                  {monthNames[calendarMonth]} {calendarYear}
                </Text>

                <TouchableOpacity
                  onPress={nextMonth}
                  style={styles.calendarNavBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <ChevronRight size={16} color="#475569" />
                </TouchableOpacity>
              </View>

              {/* Day of Week Labels */}
              <View style={styles.calendarWeekRow}>
                {dayNames.map((d, i) => (
                  <Text key={d + i} style={styles.calendarWeekDayText}>
                    {d}
                  </Text>
                ))}
              </View>

              {/* Day Cells Grid */}
              <View style={styles.calendarDaysGrid}>
                {calendarCells.map((dayNum, idx) => {
                  if (!dayNum) {
                    return <View key={`empty-${idx}`} style={styles.calendarDayCell} />;
                  }

                  const dateStr = formatYMD(calendarYear, calendarMonth, dayNum);
                  const isStart = customStartDate === dateStr;
                  const isEnd = customEndDate === dateStr;
                  const isInRange = Boolean(
                    customStartDate &&
                    customEndDate &&
                    dateStr > customStartDate &&
                    dateStr < customEndDate
                  );
                  const now = new Date();
                  const isToday = dateStr === formatYMD(now.getFullYear(), now.getMonth(), now.getDate());

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      activeOpacity={0.7}
                      onPress={() => handleDayPress(dayNum)}
                      style={[
                        styles.calendarDayCell,
                        isInRange && styles.calendarDayCellInRange,
                        (isStart || isEnd) && styles.calendarDayCellSelected
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isInRange && styles.calendarDayTextInRange,
                          (isStart || isEnd) && styles.calendarDayTextSelected,
                          isToday && !isStart && !isEnd && styles.calendarDayTextToday
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Range helper summary */}
            <View style={{ marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 11.5, color: '#64748b' }}>
                {customStartDate && customEndDate
                  ? `${customStartDate} → ${customEndDate}`
                  : (activePickerField === 'from' ? '• Tap start date on calendar' : '• Tap end date on calendar')}
              </Text>
              {(customStartDate || customEndDate) && (
                <TouchableOpacity
                  onPress={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setActivePickerField('from');
                  }}
                >
                  <Text style={{ fontSize: 11.5, color: '#dc2626', fontWeight: '600' }}>Clear</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={styles.modalClearBtn}
                onPress={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                  setTimeFilter('All Time');
                  setCustomDateModalVisible(false);
                }}
              >
                <Text style={styles.modalClearBtnText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={() => {
                  if (customStartDate || customEndDate) {
                    setTimeFilter('Custom Range');
                  }
                  setCustomDateModalVisible(false);
                }}
              >
                <Text style={styles.modalApplyBtnText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  modalCard: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    paddingHorizontal: 6
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4
  },
  modalOptionActive: {
    backgroundColor: '#fef2f2'
  },
  modalOptionText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500'
  },
  modalOptionTextActive: {
    color: '#7a1521',
    fontWeight: '700'
  },
  // Filter Operations Styles
  filterOperationsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  filterHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12
  },
  filterIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1e293b'
  },
  filterActivePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12
  },
  filterActivePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569'
  },
  filterSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  filterResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  filterResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626'
  },
  filterChipsCapsuleWrapper: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 3,
    marginTop: 2
  },
  filterChipsCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  filterCapsuleChip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 6
  },
  filterCapsuleChipActive: {
    backgroundColor: '#7a1521'
  },
  filterCapsuleChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569'
  },
  filterCapsuleChipTextActive: {
    color: '#ffffff',
    fontWeight: '700'
  },
  customRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 10
  },
  customRangeInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  customRangeEditBtn: {
    backgroundColor: '#7a1521',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6
  },
  customRangeEditText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700'
  },
  modalTitleInline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  rangeSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 4,
    marginBottom: 10
  },
  rangeSelectorTab: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'transparent'
  },
  rangeSelectorTabActive: {
    backgroundColor: '#ffffff',
    borderColor: '#7a1521',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1
  },
  rangeSelectorLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 1
  },
  rangeSelectorValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155'
  },
  rangeSelectorValueActive: {
    color: '#7a1521'
  },
  calendarContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    marginBottom: 10
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2
  },
  calendarNavBtn: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  calendarMonthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  calendarWeekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94a3b8'
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  calendarDayCell: {
    width: '14.28%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
    borderRadius: 6
  },
  calendarDayCellInRange: {
    backgroundColor: '#fee2e2',
    borderRadius: 0
  },
  calendarDayCellSelected: {
    backgroundColor: '#7a1521',
    borderRadius: 6
  },
  calendarDayText: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#1e293b'
  },
  calendarDayTextInRange: {
    color: '#7a1521',
    fontWeight: '600'
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: '700'
  },
  calendarDayTextToday: {
    color: '#7a1521',
    fontWeight: '700'
  },
  modalClearBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalClearBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13
  },
  modalApplyBtn: {
    flex: 1.5,
    backgroundColor: '#7a1521',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalApplyBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13
  }
});
