import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  StyleSheet,
  Alert,
  Platform,
  Modal
} from 'react-native';
import {
  X,
  Check,
  Building2,
  MapPin,
  Phone,
  Clock,
  Play,
  Package,
  Calendar,
  Lock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Briefcase,
  User,
  FileText,
  RefreshCw,
  ArrowLeft,
  Info,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { StatusBadge, PriorityBadge, CategoryTag } from '../components/Badge';
import MediaEvidenceModal from '../components/MediaEvidenceModal';
import { fetchRequestById, fetchRequests, assignRequest, rescheduleRequest, actionRequest, fetchLabourers } from '../services/api';
import { COLORS } from '../theme/colors';
import { getZoneFromLocation } from '../utils/campusLocations';

export default function RequestReviewScreen({ route, navigation }) {
  const rawTargetId = route?.params?.requestId || route?.params?.request?.id || null;
  const targetId = rawTargetId ? String(rawTargetId).replace(/^#/, '').trim() : null;
  const initialReq = route?.params?.request || null;
  const [request, setRequest] = useState(initialReq);
  const [equipmentMode, setEquipmentMode] = useState('available'); // 'available' | 'unavailable'
  const [acceptedOverride, setAcceptedOverride] = useState(false);
  const [isRejectedOverride, setIsRejectedOverride] = useState(() => {
    const s = (initialReq?.status || '').toLowerCase();
    return s === 'rejected' || s === 'cancelled';
  });
  const [activeMedia, setActiveMedia] = useState(null);
  const [labourerList, setLabourerList] = useState([]);
  const [assignSuccessModal, setAssignSuccessModal] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // Assignment Form State
  const [technician, setTechnician] = useState('');
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');

  // Rescheduling Form State
  const [delayReason, setDelayReason] = useState('Out of Stock - Awaiting PO');
  const [otherDelayReason, setOtherDelayReason] = useState('');
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [billNumber, setBillNumber] = useState('');
  const [officerNote, setOfficerNote] = useState('');

  // Interactive Calendar Date Picker State
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [activeDatePickerTarget, setActiveDatePickerTarget] = useState('nextDate'); // 'nextDate' | 'completionDate'
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const openCalendarModal = (target = 'nextDate') => {
    setActiveDatePickerTarget(target);
    const currentDateVal = target === 'nextDate' ? nextDate : completionDate;
    if (currentDateVal) {
      const parts = currentDateVal.split('-');
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
    setCalendarModalVisible(true);
  };

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

  const handleSelectDay = (dayNum) => {
    const selectedDateStr = formatYMD(calendarYear, calendarMonth, dayNum);
    if (activeDatePickerTarget === 'nextDate') {
      setNextDate(selectedDateStr);
    } else {
      setCompletionDate(selectedDateStr);
    }
    setCalendarModalVisible(false);
  };

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  useEffect(() => {
    loadRequest();
    const interval = setInterval(loadRequest, 2500);
    const unsubscribeFocus = navigation?.addListener ? navigation.addListener('focus', loadRequest) : null;
    const onFocus = () => loadRequest();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }
    return () => {
      clearInterval(interval);
      if (unsubscribeFocus) unsubscribeFocus();
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [targetId, navigation]);

  const loadRequest = async () => {
    let id = targetId;
    if (!id) {
      const all = await fetchRequests();
      if (all && all.length > 0) id = all[0].id;
    }
    if (id) {
      const data = await fetchRequestById(id);
      if (data) {
        setRequest(data);
        const s = (data.status || '').toLowerCase();
        if (s === 'rejected' || s === 'cancelled') {
          setIsRejectedOverride(true);
          setAcceptedOverride(false);
        } else if (s === 'accepted' || s === 'assigned' || s === 'in progress' || s === 'scheduled') {
          setAcceptedOverride(true);
          setIsRejectedOverride(false);
        }
      }
    }
    const labs = await fetchLabourers();
    if (labs && labs.length > 0) {
      setLabourerList(labs);
      const firstTech = `${labs[0].name} - ${labs[0].trade || labs[0].category || 'Technician'}`;
      setTechnician(prev => prev || firstTech);
    }
  };

  const [isReassigning, setIsReassigning] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const reqStatus = (request?.status || route?.params?.request?.status || '').toLowerCase();
  const isJobRejectedByLabourer =
    request?.job?.status === 'Rejected' ||
    Boolean(request?.job?.notes?.includes('[REJECTED]'));

  const isRejected = (isRejectedOverride || reqStatus === 'rejected' || reqStatus === 'cancelled') && !isJobRejectedByLabourer;
  const isAccepted = !isRejected && (
    acceptedOverride ||
    reqStatus === 'accepted' ||
    reqStatus === 'assigned' ||
    reqStatus === 'scheduled' ||
    reqStatus === 'in progress' ||
    reqStatus === 'completed' ||
    isJobRejectedByLabourer
  );

  const isAssigned = !isRejected && !isJobRejectedByLabourer &&
    (reqStatus === 'assigned' || reqStatus === 'in progress' || reqStatus === 'completed') &&
    (Boolean(request?.job) || Boolean(request?.assignedLabourer) || Boolean(request?.assigned_team_name) || Boolean(request?.assigned_officer));

  const isScheduled = !isRejected && !isJobRejectedByLabourer &&
    (reqStatus === 'scheduled' || (Boolean(request?.scheduled_date) && reqStatus !== 'rejected'));

  const isAssignedOrScheduled = isAssigned || isScheduled;

  const assignedLabourerName =
    request?.assignedLabourer?.name ||
    request?.job?.lead_person?.split(' - ')[0] ||
    (request?.assigned_team_name ? request.assigned_team_name.replace(' Team', '') : '') ||
    request?.technician?.split(' - ')[0] ||
    'Supervisor';

  const assignedLabourerTrade =
    request?.assignedLabourer?.trade ||
    request?.assignedLabourer?.category ||
    (request?.job?.lead_person?.includes(' - ') ? request.job.lead_person.split(' - ')[1] : '') ||
    'Supervisor';

  const assignedLabourerPhone =
    request?.assignedLabourer?.phone ||
    '+94 77 123 4567';

  const assignedJobId =
    request?.job?.id ||
    (request?.id ? `JOB-${request.id.replace(/\D/g, '')}` : 'JOB-2523');

  const assignedTargetDateRaw =
    request?.job?.due_date ||
    request?.scheduled_date ||
    '';

  const formattedTargetDate = (() => {
    if (!assignedTargetDateRaw) return 'Not set';
    try {
      const d = new Date(assignedTargetDateRaw);
      if (isNaN(d.getTime())) return assignedTargetDateRaw;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return assignedTargetDateRaw;
    }
  })();

  const countdown = (() => {
    const raw = assignedTargetDateRaw || completionDate || nextDate;
    if (!raw) return null;
    let targetTime;
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
      targetTime = new Date(`${raw.trim()}T23:59:59`).getTime();
    } else {
      targetTime = new Date(raw).getTime();
    }
    if (isNaN(targetTime)) return null;

    const diff = targetTime - now;
    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((absDiff / 1000) % 60);

    return { isOverdue, days, hours, minutes, seconds, diff };
  })();

  const assignedInstructions =
    request?.job?.notes ||
    request?.instructions ||
    '';

  const assignedOfficerName =
    request?.assigned_officer ||
    'Chaminda Bandara';

  const assignedTeamName =
    request?.assigned_team_name ||
    request?.job?.team_name ||
    `${assignedLabourerName} Team`;

  const confirmReject = async () => {
    const reqId = targetId || request?.id;
    setRejectModalVisible(false);
    setIsRejectedOverride(true);
    setRequest(prev => (prev ? { ...prev, status: 'Rejected' } : { status: 'Rejected' }));
    if (reqId) {
      await actionRequest(reqId, { action: 'reject' });
    }
    setTimeout(() => {
      navigation.navigate('MainTabs', { screen: 'Requests' });
    }, 1200);
  };

  const handleAction = async (action) => {
    const reqId = targetId || request?.id;
    if (action === 'accept') {
      setAcceptedOverride(true);
      setRequest(prev => (prev ? { ...prev, status: 'Accepted' } : { status: 'Accepted' }));
      if (reqId) await actionRequest(reqId, { action: 'accept' });
      Alert.alert('Request Accepted', 'Maintenance request accepted successfully! You can now verify equipment availability and assign technicians below.');
      loadRequest();
    } else if (action === 'reject') {
      setRejectModalVisible(true);
    }
  };

  const handleAssign = async () => {
    try {
      await assignRequest(targetId, {
        technician,
        completionDate,
        instructions
      });
      setIsReassigning(false);
      setAssignSuccessModal(true);
      await loadRequest();
    } catch (err) {
      console.warn('Assign error:', err);
    }
  };

  const handleReschedule = async () => {
    const effectiveReason = delayReason === 'Others' && otherDelayReason.trim()
      ? otherDelayReason.trim()
      : delayReason;
    await rescheduleRequest(targetId, {
      reason: effectiveReason,
      nextDate,
      billNumber,
      notes: officerNote
    });
    setIsReassigning(false);
    setRequest(prev => (prev ? {
      ...prev,
      status: 'Scheduled',
      scheduled_date: nextDate,
      job: null
    } : prev));
    Alert.alert('Rescheduled', `Request rescheduled for ${nextDate} due to procurement.`);
    loadRequest();
  };

  const technicianOptions = labourerList.length > 0
    ? labourerList.map(l => `${l.name} - ${l.trade || l.category || 'Technician'}`)
    : [];

  const delayReasons = [
    'Out of Stock - Awaiting PO',
    'Import Component Delay',
    'Specialized Contractor Required',
    'Exam / Lecture Session Clashes',
    'Others'
  ];

  const evidenceList = request?.evidence || request?.images || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Rejection Notification Banner */}
      {isRejected && (
        <View style={styles.rejectionBanner}>
          <X size={18} color="#ffffff" />
          <Text style={styles.rejectionBannerText}>Request Rejected — Redirecting...</Text>
        </View>
      )}

      {/* 1. Top Header Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <Text style={styles.reqTitle}>
            {request?.title || (request?.id ? `Request #${request.id}` : 'Request Details')}
          </Text>
          {request?.category ? <CategoryTag category={request.category} /> : null}
          {request?.priority ? <PriorityBadge priority={request.priority} /> : null}
          {isScheduled && !isAssigned ? (
            <View style={{ backgroundColor: '#f5f3ff', borderColor: '#ddd6fe', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Calendar size={11} color="#7c3aed" />
              <Text style={{ color: '#7c3aed', fontSize: 11, fontWeight: '700' }}>Scheduled</Text>
            </View>
          ) : isAccepted ? (
            <View style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>Accepted</Text>
            </View>
          ) : null}
          {isRejected && (
            <View style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <X size={12} color="#dc2626" strokeWidth={2.5} />
              <Text style={{ color: '#dc2626', fontSize: 11, fontWeight: '700' }}>Rejected</Text>
            </View>
          )}
        </View>

        {(request?.submittedDate || request?.created_at) ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Clock size={13} color="#64748b" />
            <Text style={styles.timeText}>
              Submitted: {request?.submittedDate || (request.created_at ? new Date(request.created_at).toLocaleString() : '')}
            </Text>
          </View>
        ) : null}
      </View>

      {/* 2. Requester Details Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Requester Details</Text>
        <View style={styles.requesterRow}>
          <View style={styles.requesterAvatar}>
            <Text style={styles.requesterAvatarText}>
              {request?.requester?.initials || (request?.requester?.name ? request.requester.name.slice(0, 2).toUpperCase() : (request?.requester_name ? request.requester_name.slice(0, 2).toUpperCase() : 'RQ'))}
            </Text>
          </View>

          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.requesterName}>
              {request?.requester?.name || request?.requester_name || 'Requester'}
            </Text>
            {(request?.requester?.department || request?.requester_dept) ? (
              <View style={styles.metaRow}>
                <Building2 size={14} color="#64748b" />
                <Text style={styles.metaText}>
                  {request?.requester?.department || request?.requester_dept}
                </Text>
              </View>
            ) : null}
            {request?.location ? (
              <View style={[styles.metaRow, { flexWrap: 'wrap' }]}>
                <MapPin size={14} color="#7a1521" />
                <Text style={[styles.metaText, { fontWeight: '600', color: '#1e293b' }]}>
                  {request.location}
                </Text>
                {(() => {
                  const z = request.zone || getZoneFromLocation(request.location);
                  if (!z) return null;
                  const isA = z.includes('A');
                  const isB = z.includes('B');
                  return (
                    <View style={{
                      backgroundColor: isA ? '#fef3c7' : isB ? '#e0f2fe' : '#dcfce7',
                      borderColor: isA ? '#fde68a' : isB ? '#bae6fd' : '#bbf7d0',
                      borderWidth: 1,
                      paddingHorizontal: 7,
                      paddingVertical: 1.5,
                      borderRadius: 10,
                      marginLeft: 6
                    }}>
                      <Text style={{
                        fontSize: 10.5,
                        fontWeight: '800',
                        color: isA ? '#92400e' : isB ? '#075985' : '#166534'
                      }}>
                        📍 {z}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            ) : null}
            {(request?.requester?.phone || request?.requester_phone) ? (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${request?.requester?.phone || request?.requester_phone}`)}
                style={styles.metaRow}
              >
                <Phone size={14} color="#7a1521" />
                <Text style={[styles.metaText, { color: '#7a1521', fontWeight: '600' }]}>
                  {request?.requester?.phone || request?.requester_phone} (Call)
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {/* 3. Incident Description & Attached Evidence */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Incident Description</Text>
        <View style={styles.descBox}>
          <Text style={styles.descText}>
            {request?.description || 'No description provided.'}
          </Text>
        </View>

        <Text style={[styles.subHeading, { marginTop: 14, marginBottom: 10 }]}>
          Attached Evidence ({evidenceList.length})
        </Text>
        {evidenceList.length > 0 ? (
          <View style={styles.evidenceRow}>
            {evidenceList.map((item, idx) => {
              const uri = item?.uri || item?.url || (typeof item === 'string' ? item : null);
              const isVideo = item?.type === 'video' || (typeof uri === 'string' && uri.match(/\.(mp4|mov|webm)$/i));
              const label = item?.label || item?.name || `Evidence ${idx + 1}`;
              return (
                <TouchableOpacity
                  key={item?.id || idx}
                  onPress={() => setActiveMedia(item)}
                  style={styles.evidenceThumb}
                >
                  {uri && !isVideo ? (
                    <View style={styles.evidenceImageWrapper}>
                      <Image source={{ uri }} style={styles.evidenceImage} resizeMode="cover" />
                      <View style={styles.evidenceImageBadge}>
                        <Text style={styles.evidenceImageBadgeText} numberOfLines={1}>{label}</Text>
                      </View>
                    </View>
                  ) : isVideo ? (
                    <View style={[styles.evidenceInner, { backgroundColor: '#ffe4e6' }]}>
                      <Play size={20} color="#be123c" />
                      <Text style={[styles.evidenceThumbText, { color: '#be123c', fontSize: 10, marginTop: 4 }]} numberOfLines={1}>
                        {label}
                      </Text>
                    </View>
                  ) : (
                    <View style={[styles.evidenceInner, { backgroundColor: '#334155' }]}>
                      <Text style={styles.evidenceThumbText} numberOfLines={2}>
                        {label}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noEvidenceBox}>
            <Text style={styles.noEvidenceText}>No attached evidence for this request</Text>
          </View>
        )}
      </View>      {/* 4. Officer Review & Decision Card (Directly after reviewing evidence & description) */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={styles.cardHeading}>Officer Review Decision</Text>
          <View style={[
            styles.decisionStatusPill,
            isAssigned ? styles.decisionStatusPillAssigned : (isScheduled && !isAssigned) ? { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe', borderWidth: 1 } : isJobRejectedByLabourer ? { backgroundColor: '#fee2e2', borderColor: '#fca5a5' } : isAccepted ? styles.decisionStatusPillAccepted : isRejected ? styles.decisionStatusPillRejected : styles.decisionStatusPillPending
          ]}>
            <Text style={[
              styles.decisionStatusText,
              isAssigned ? styles.decisionStatusTextAssigned : (isScheduled && !isAssigned) ? { color: '#7c3aed' } : isJobRejectedByLabourer ? { color: '#b91c1c' } : isAccepted ? styles.decisionStatusTextAccepted : isRejected ? styles.decisionStatusTextRejected : styles.decisionStatusTextPending
            ]}>
              {isAssigned ? '✓ Assigned & Active' : (isScheduled && !isAssigned) ? '📅 Scheduled for Execution' : isJobRejectedByLabourer ? '⚠️ Needs Re-assignment' : isAccepted ? '✓ Accepted' : isRejected ? '✗ Rejected' : '● Awaiting Review'}
            </Text>
          </View>
        </View>

        <Text style={styles.decisionSubtitle}>
          {isAssigned
            ? `This maintenance request has been accepted and dispatched to ${assignedLabourerName}.`
            : (isScheduled && !isAssigned)
              ? `This maintenance request has been scheduled for execution on ${formattedTargetDate}.`
              : isJobRejectedByLabourer
                ? 'The assigned technician declined this work order. Please re-assign another technician below.'
                : isAccepted
                  ? 'This maintenance request has been accepted. You can now verify equipment availability and assign technicians below.'
                  : isRejected
                    ? 'This maintenance request was rejected and marked as closed.'
                    : 'Carefully review the requester details and attached evidence above. Click Accept to approve this request or Reject if not feasible.'}
        </Text>

        {!isAccepted && !isRejected ? (
          <View style={styles.decisionActionsRow}>
            <TouchableOpacity
              onPress={() => handleAction('reject')}
              style={styles.decisionRejectBtn}
              activeOpacity={0.8}
            >
              <X size={18} color="#dc2626" strokeWidth={2.2} />
              <Text style={styles.decisionRejectBtnText}>Reject Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleAction('accept')}
              style={styles.decisionAcceptBtn}
              activeOpacity={0.85}
            >
              <Check size={18} color="#ffffff" strokeWidth={2.5} />
              <Text style={styles.decisionAcceptBtnText}>Accept Request</Text>
            </TouchableOpacity>
          </View>
        ) : isAssigned ? (
          <View style={styles.decisionAcceptedBanner}>
            <View style={styles.decisionAcceptedIconWrap}>
              <UserCheck size={18} color="#059669" strokeWidth={2.6} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.decisionAcceptedTitle}>Work Order Dispatched to {assignedLabourerName}</Text>
              <Text style={styles.decisionAcceptedSub}>
                Work Order #{assignedJobId} • Due Date: {formattedTargetDate}
              </Text>
            </View>
          </View>
        ) : (isScheduled && !isAssigned) ? (
          <View style={[styles.decisionAcceptedBanner, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
            <View style={[styles.decisionAcceptedIconWrap, { backgroundColor: '#ede9fe' }]}>
              <Calendar size={18} color="#7c3aed" strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.decisionAcceptedTitle, { color: '#6b21a8' }]}>Scheduled Execution Plan Active</Text>
              <Text style={[styles.decisionAcceptedSub, { color: '#7c3aed' }]}>
                Target Date: {formattedTargetDate} • Held in Requests tab under Scheduled
              </Text>
            </View>
          </View>
        ) : isJobRejectedByLabourer ? (
          <View style={[styles.decisionAcceptedBanner, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}>
            <View style={[styles.decisionAcceptedIconWrap, { backgroundColor: '#fecaca' }]}>
              <AlertTriangle size={18} color="#b91c1c" strokeWidth={2.6} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.decisionAcceptedTitle, { color: '#991b1b' }]}>Technician Declined Work Order</Text>
              <Text style={[styles.decisionAcceptedSub, { color: '#7f1d1d' }]}>
                {request?.job?.notes ? `Reason: ${request.job.notes.replace('[REJECTED]:', '').trim()} • ` : ''}Select technician below to re-assign.
              </Text>
            </View>
          </View>
        ) : isAccepted ? (
          <View style={styles.decisionAcceptedBanner}>
            <View style={styles.decisionAcceptedIconWrap}>
              <Check size={18} color="#059669" strokeWidth={2.6} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.decisionAcceptedTitle}>Request Accepted by Maintenance Officer</Text>
              <Text style={styles.decisionAcceptedSub}>
                Equipment availability & technician scheduling below is now active.
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.decisionRejectedBanner}>
            <X size={18} color="#dc2626" strokeWidth={2.4} />
            <Text style={styles.decisionRejectedText}>Request was rejected and marked as closed.</Text>
          </View>
        )}
      </View>

      {/* 5. Assigned Supervisor Details OR Scheduled Execution Plan OR Assignment Form */}
      {(isAssignedOrScheduled && !isReassigning) ? (
        <View style={styles.card}>
          <View style={styles.assignedCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.assignedIconCircle}>
                {isScheduled && !isAssigned ? (
                  <Calendar size={20} color="#7a1521" />
                ) : (
                  <UserCheck size={20} color="#7a1521" />
                )}
              </View>
              <View>
                <Text style={styles.assignedCardTitle}>
                  {isScheduled && !isAssigned ? 'Scheduled Execution Plan' : 'Assigned Supervisor Details'}
                </Text>
                <Text style={styles.assignedCardSubtitle}>
                  {isScheduled && !isAssigned ? 'Target completion & scheduling plan' : 'Work order dispatched to field supervisor'}
                </Text>
              </View>
            </View>
            <View style={[
              styles.assignedActiveBadge,
              isScheduled && !isAssigned && { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }
            ]}>
              <View style={[
                styles.assignedActiveDot,
                isScheduled && !isAssigned && { backgroundColor: '#8b5cf6' }
              ]} />
              <Text style={[
                styles.assignedActiveBadgeText,
                isScheduled && !isAssigned && { color: '#7c3aed' }
              ]}>
                {isScheduled && !isAssigned ? 'Scheduled' : (request?.status === 'Assigned' ? 'Assigned' : 'In Progress')}
              </Text>
            </View>
          </View>

          {/* Scheduled Date Highlight Box & Countdown Timer (ONLY WHEN NOT ASSIGNED) */}
          {(!isAssigned && isScheduled) ? (
            <>
              {/* Scheduled Date Highlight Box */}
              <View style={styles.scheduledHighlightBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.scheduledHighlightLabel}>SCHEDULED TARGET DATE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <Calendar size={16} color="#7a1521" />
                    <Text style={styles.scheduledHighlightDate}>{formattedTargetDate}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setEquipmentMode('unavailable');
                    setIsReassigning(true);
                  }}
                  style={styles.rescheduleHeaderBtn}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={13} color="#ffffff" />
                  <Text style={styles.rescheduleHeaderBtnText}>Reschedule</Text>
                </TouchableOpacity>
              </View>

              {/* Countdown Timer Display */}
              <View style={[
                styles.countdownCard,
                countdown?.isOverdue ? styles.countdownCardOverdue : styles.countdownCardNormal
              ]}>
                <View style={styles.countdownHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Clock size={14} color={countdown?.isOverdue ? '#dc2626' : '#15803d'} />
                    <Text style={[
                      styles.countdownHeaderTitle,
                      { color: countdown?.isOverdue ? '#dc2626' : '#15803d' }
                    ]}>
                      {countdown?.isOverdue ? 'TIME ELAPSED SINCE SCHEDULED DATE' : 'COUNTDOWN TO EXECUTION DATE'}
                    </Text>
                  </View>
                  <View style={[
                    styles.countdownLiveBadge,
                    countdown?.isOverdue ? { backgroundColor: '#fef2f2', borderColor: '#fca5a5' } : { backgroundColor: '#ffffff', borderColor: '#86efac' }
                  ]}>
                    <Text style={[
                      styles.countdownLiveBadgeText,
                      { color: countdown?.isOverdue ? '#dc2626' : '#16a34a' }
                    ]}>
                      {countdown?.isOverdue ? 'Overdue' : 'Live Counter'}
                    </Text>
                  </View>
                </View>

                {/* 4 Countdown Tiles */}
                <View style={styles.countdownTilesRow}>
                  {/* Days */}
                  <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                    <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#991b1b' : '#14532d' }]}>
                      {String(countdown?.days ?? 0).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownTileLabel}>DAYS</Text>
                  </View>

                  {/* Hours */}
                  <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                    <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#991b1b' : '#14532d' }]}>
                      {String(countdown?.hours ?? 0).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownTileLabel}>HOURS</Text>
                  </View>

                  {/* Minutes */}
                  <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                    <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#991b1b' : '#14532d' }]}>
                      {String(countdown?.minutes ?? 0).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownTileLabel}>MINUTES</Text>
                  </View>

                  {/* Seconds */}
                  <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                    <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#dc2626' : '#16a34a' }]}>
                      {String(countdown?.seconds ?? 0).padStart(2, '0')}
                    </Text>
                    <Text style={styles.countdownTileLabel}>SECONDS</Text>
                  </View>
                </View>
              </View>
            </>
          ) : null}

          {isAssigned ? (
            <>
              {/* Supervisor Identity Profile */}
              <View style={styles.supervisorProfileBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={styles.supervisorAvatar}>
                    <Text style={styles.supervisorAvatarText}>
                      {assignedLabourerName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={styles.supervisorName}>{assignedLabourerName}</Text>
                      <View style={styles.tradeBadge}>
                        <Text style={styles.tradeBadgeText}>{assignedLabourerTrade}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'web' && typeof window !== 'undefined') {
                          window.open(`tel:${assignedLabourerPhone}`, '_self');
                        } else {
                          Linking.openURL(`tel:${assignedLabourerPhone}`).catch(() => { });
                        }
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}
                    >
                      <Phone size={13} color="#7a1521" />
                      <Text style={styles.supervisorPhone}>{assignedLabourerPhone}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Specs Grid */}
              <View style={styles.specsGrid}>
                <View style={styles.specBox}>
                  <View style={styles.specLabelRow}>
                    <Briefcase size={13} color="#7a1521" />
                    <Text style={styles.specLabel}>WORK ORDER ID</Text>
                  </View>
                  <Text style={styles.specValue}>{assignedJobId}</Text>
                </View>

                <View style={styles.specBox}>
                  <View style={styles.specLabelRow}>
                    <Calendar size={13} color="#7a1521" />
                    <Text style={styles.specLabel}>TARGET DUE DATE</Text>
                  </View>
                  <Text style={styles.specValue}>{formattedTargetDate}</Text>
                </View>

                <View style={styles.specBox}>
                  <View style={styles.specLabelRow}>
                    <User size={13} color="#7a1521" />
                    <Text style={styles.specLabel}>ASSIGNED OFFICER</Text>
                  </View>
                  <Text style={styles.specValue}>{assignedOfficerName}</Text>
                </View>

                <View style={styles.specBox}>
                  <View style={styles.specLabelRow}>
                    <Building2 size={13} color="#7a1521" />
                    <Text style={styles.specLabel}>ASSIGNED UNIT</Text>
                  </View>
                  <Text style={styles.specValue}>{assignedTeamName}</Text>
                </View>
              </View>

              {/* Special Instructions if any */}
              {Boolean(assignedInstructions) && (
                <View style={styles.specialInstructionsBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <FileText size={14} color="#7a1521" />
                    <Text style={styles.specialInstructionsLabel}>Special Instructions:</Text>
                  </View>
                  <Text style={styles.specialInstructionsText}>{assignedInstructions}</Text>
                </View>
              )}

              {/* Action Buttons: Reassign & View Job Details */}
              <View style={styles.assignedActionsRow}>
                <TouchableOpacity
                  onPress={() => setIsReassigning(true)}
                  style={styles.reassignBtn}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={15} color="#475569" />
                  <Text style={styles.reassignBtnText}>Reassign Supervisor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('JobDetails', { jobId: assignedJobId })}
                  style={styles.viewJobBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.viewJobBtnText}>View Work Order</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* SCHEDULED REQUEST (Held under Requests tab, not yet converted to job) */
            <>
              <View style={styles.scheduledStatusNotice}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Calendar size={14} color="#7c3aed" />
                  <Text style={styles.scheduledStatusNoticeTitle}>Scheduled Request Status</Text>
                </View>
                <Text style={styles.scheduledStatusNoticeText}>
                  This request has been scheduled by the Maintenance Officer for execution on <Text style={{ fontWeight: '700', color: '#1e293b' }}>{formattedTargetDate}</Text>. It is maintained in the Requests tab under Scheduled until field personnel are dispatched.
                </Text>
              </View>

              {/* Action Buttons for Scheduled Request */}
              <View style={{ gap: 8, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setEquipmentMode('unavailable');
                      setIsReassigning(true);
                    }}
                    style={[styles.reassignBtn, { flex: 1, paddingVertical: 12 }]}
                    activeOpacity={0.8}
                  >
                    <RefreshCw size={14} color="#475569" />
                    <Text style={styles.reassignBtnText}>Reschedule Date</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setEquipmentMode('available');
                      setIsReassigning(true);
                    }}
                    style={[styles.viewJobBtn, { flex: 1, backgroundColor: '#7a1521', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }]}
                    activeOpacity={0.85}
                  >
                    <UserCheck size={16} color="#ffffff" />
                    <Text style={styles.viewJobBtnText}>Assign Supervisor</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Requests' })}
                  style={styles.backToRequestsBtn}
                  activeOpacity={0.8}
                >
                  <ArrowLeft size={15} color="#64748b" />
                  <Text style={styles.backToRequestsBtnText}>Back to Requests</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      ) : (
        <View style={styles.assignmentOuterContainer}>
          {isJobRejectedByLabourer && (
            <View style={{
              backgroundColor: '#fee2e2',
              borderColor: '#fca5a5',
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
              marginBottom: 12,
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10
            }}>
              <AlertTriangle size={20} color="#b91c1c" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#991b1b' }}>
                  Work Order Declined by Technician
                </Text>
                <Text style={{ fontSize: 12, color: '#7f1d1d', marginTop: 2, lineHeight: 17 }}>
                  {request?.job?.lead_person ? `${request.job.lead_person} rejected this assignment.` : 'Technician declined this assignment.'}
                  {request?.job?.notes ? ` Reason: ${request.job.notes.replace('[REJECTED]:', '').trim()}` : ''}
                </Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#b91c1c', marginTop: 4 }}>
                  Please select another technician below to re-assign.
                </Text>
              </View>
            </View>
          )}
          {isReassigning && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#7a1521' }}>REASSIGNING SUPERVISOR</Text>
              <TouchableOpacity onPress={() => setIsReassigning(false)} style={{ padding: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748b' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
          <View
            style={[
              styles.assignmentContentWrapper,
              !isAccepted && styles.assignmentContentBlurred,
              { pointerEvents: isAccepted ? 'auto' : 'none' }
            ]}
          >
            {/* Out-of-Stock Warning when Unavailable */}
            {equipmentMode === 'unavailable' && (
              <View style={styles.warningBanner}>
                <Package size={20} color="#be123c" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningTitle}>Equipment Out of Stock</Text>
                  <Text style={styles.warningSub}>Required parts or components are currently unavailable in central stores. Please reschedule.</Text>
                </View>
              </View>
            )}

            {/* Tab Selector */}
            <View style={styles.equipmentTabsBar}>
              <TouchableOpacity
                disabled={!isAccepted}
                onPress={() => setEquipmentMode('available')}
                style={[styles.equipTab, equipmentMode === 'available' && styles.equipTabActive]}
              >
                <Text style={[styles.equipTabText, equipmentMode === 'available' && styles.equipTabTextActive]}>
                  Equipment Available
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={!isAccepted}
                onPress={() => setEquipmentMode('unavailable')}
                style={[styles.equipTab, equipmentMode === 'unavailable' && styles.equipTabActive]}
              >
                <Text style={[styles.equipTabText, equipmentMode === 'unavailable' && styles.equipTabTextActive]}>
                  Equipment Not Available
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Card */}
            <View style={styles.card}>
              {equipmentMode === 'available' ? (
                /* TAB 1: Scheduling & Assignment */
                <View>
                  <Text style={styles.cardHeading}>1. Scheduling & Assignment</Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>ASSIGN TO SUPERVISOR</Text>
                    <View style={styles.pillList}>
                      {technicianOptions.length > 0 ? (
                        technicianOptions.map((t) => (
                          <TouchableOpacity
                            key={t}
                            disabled={!isAccepted}
                            onPress={() => setTechnician(t)}
                            style={[styles.optionPill, technician === t && styles.optionPillActive]}
                          >
                            <Text style={[styles.optionPillText, technician === t && styles.optionPillTextActive]}>
                              {t}
                            </Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', paddingVertical: 4 }}>
                          No registered supervisors available in database
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>ESTIMATED COMPLETION DATE</Text>
                    <View style={{ position: 'relative', justifyContent: 'center' }}>
                      <TextInput
                        editable={isAccepted}
                        style={[styles.input, { paddingRight: 44 }]}
                        value={completionDate}
                        onChangeText={setCompletionDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                      />
                      <TouchableOpacity
                        disabled={!isAccepted}
                        onPress={() => openCalendarModal('completionDate')}
                        style={{
                          position: 'absolute',
                          right: 4,
                          padding: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 5
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Calendar size={18} color="#7a1521" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>SPECIAL INSTRUCTIONS FOR SUPERVISOR</Text>
                    <TextInput
                      editable={isAccepted}
                      style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                      multiline
                      placeholder="Add notes regarding lab access, safety protocols, or specific tools needed..."
                      placeholderTextColor="#94a3b8"
                      value={instructions}
                      onChangeText={setInstructions}
                    />
                  </View>

                  <TouchableOpacity
                    disabled={!isAccepted}
                    onPress={handleAssign}
                    style={styles.assignSubmitBtn}
                  >
                    <Text style={styles.assignSubmitBtnText}>
                      {isJobRejectedByLabourer || isReassigning ? 'Re-assign Job to Supervisor' : 'Assign Job to Supervisor'}
                    </Text>
                    <ArrowRight size={16} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              ) : (
                /* TAB 2: Rescheduling & Procurement */
                <View>
                  <Text style={styles.cardHeading}>Rescheduling & Procurement</Text>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>REASON FOR DELAY</Text>
                    <View style={styles.pillList}>
                      {delayReasons.map((r) => (
                        <TouchableOpacity
                          key={r}
                          disabled={!isAccepted}
                          onPress={() => setDelayReason(r)}
                          style={[styles.optionPill, delayReason === r && styles.optionPillActive]}
                        >
                          <Text style={[styles.optionPillText, delayReason === r && styles.optionPillTextActive]}>
                            {r}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {delayReason === 'Others' && (
                      <View style={{ marginTop: 8 }}>
                        <TextInput
                          editable={isAccepted}
                          style={styles.input}
                          placeholder="Specify other reason for delay..."
                          placeholderTextColor="#94a3b8"
                          value={otherDelayReason}
                          onChangeText={setOtherDelayReason}
                        />
                      </View>
                    )}
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>SET NEXT AVAILABLE DATE</Text>
                    <View style={{ position: 'relative', justifyContent: 'center' }}>
                      <TextInput
                        editable={isAccepted}
                        style={[styles.input, { paddingRight: 44 }]}
                        value={nextDate}
                        onChangeText={setNextDate}
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#94a3b8"
                      />
                      <TouchableOpacity
                        disabled={!isAccepted}
                        onPress={() => openCalendarModal('nextDate')}
                        style={{
                          position: 'absolute',
                          right: 4,
                          padding: 8,
                          justifyContent: 'center',
                          alignItems: 'center',
                          zIndex: 5
                        }}
                        activeOpacity={0.7}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Calendar size={18} color="#7a1521" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>BILL NUMBER</Text>
                    <TextInput
                      editable={isAccepted}
                      style={styles.input}
                      placeholder="e.g. BILL-99201"
                      placeholderTextColor="#94a3b8"
                      value={billNumber}
                      onChangeText={setBillNumber}
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>MAINTENANCE OFFICER NOTES</Text>
                    <TextInput
                      editable={isAccepted}
                      style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
                      multiline
                      placeholder="Additional context on procurement or dispatch plan..."
                      placeholderTextColor="#94a3b8"
                      value={officerNote}
                      onChangeText={setOfficerNote}
                    />
                  </View>

                  <TouchableOpacity
                    disabled={!isAccepted}
                    onPress={handleReschedule}
                    style={styles.rescheduleSubmitBtn}
                  >
                    <Calendar size={16} color="#ffffff" style={{ marginRight: 6 }} />
                    <Text style={styles.rescheduleSubmitBtnText}>Schedule for Later</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Assignment Locked & Frosted Glass Overlay if rejected or not accepted */}
          {isRejected ? (
            <View style={styles.lockOverlay}>
              <View style={[styles.lockBox, { borderColor: '#fecdd3' }]}>
                <View style={[styles.lockIcon, { backgroundColor: '#fee2e2' }]}>
                  <X size={26} color="#dc2626" strokeWidth={2.5} />
                </View>
                <Text style={[styles.lockTitle, { color: '#991b1b' }]}>Request Rejected</Text>
                <Text style={styles.lockDesc}>
                  This maintenance request has been rejected and closed. Technician assignment and procurement are disabled.
                </Text>
              </View>
            </View>
          ) : !isAccepted ? (
            <View style={styles.lockOverlay}>
              <View style={styles.lockBox}>
                <View style={styles.lockIcon}>
                  <Lock size={26} color="#7a1521" />
                </View>
                <Text style={styles.lockTitle}>Assignment & Equipment Locked</Text>
                <Text style={styles.lockDesc}>
                  Please accept this maintenance request first to check equipment availability and assign technicians.
                </Text>
                <TouchableOpacity
                  onPress={() => handleAction('accept')}
                  style={styles.lockAcceptBtn}
                  activeOpacity={0.85}
                >
                  <Check size={16} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.lockAcceptBtnText}>Accept Request to Unlock</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>
      )}

      {/* 6. Activity History Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Activity History</Text>
        <View style={styles.timelineList}>
          {(() => {
            const s = (request?.status || '').toLowerCase();
            const team = request?.assigned_team_name || request?.job?.team_name || (request?.job?.lead_person ? `${request.job.lead_person.split(' - ')[0]} Team` : null);
            const list = [];

            // 1. Completed & Verified or Rejected (Top latest status)
            if (s === 'completed') {
              list.push({
                title: 'Completed & Verified',
                time: request?.completion_date ? new Date(request.completion_date).toLocaleDateString() : 'Completed',
                note: 'Maintenance job finalized, verified and closed.'
              });
            } else if (isRejected || s === 'rejected' || s === 'cancelled') {
              list.push({
                title: 'Request Rejected',
                time: request?.updated_at ? new Date(request.updated_at).toLocaleString() : 'Closed',
                note: request?.rejection_reason || request?.notes || 'Rejected by Maintenance Officer and marked as closed.'
              });
            }

            // 2. In Progress / On Hold
            if (s === 'in progress') {
              list.push({
                title: 'Work In Progress',
                time: 'Underway',
                note: team ? `Technician / Crew (${team}) dispatched for execution.` : 'Technician dispatched for execution.'
              });
            } else if (s === 'on hold') {
              list.push({
                title: 'Work Placed On Hold',
                time: 'On Hold',
                note: request?.notes || 'Work order placed on hold temporarily.'
              });
            }

            // 3. Assigned / Scheduled
            if (s === 'completed' || s === 'in progress' || s === 'on hold' || s === 'assigned' || team) {
              list.push({
                title: 'Under Review & Processing',
                time: request?.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString() : 'Dispatched',
                note: team ? `Assigned to ${team}` : 'Assigned to technician & personnel allocated.'
              });
            } else if (request?.scheduled_date || s.includes('schedul')) {
              list.push({
                title: `Scheduled for ${new Date(request.scheduled_date || Date.now()).toLocaleDateString()}`,
                time: 'Procurement Scheduled',
                note: 'Scheduled by Maintenance Officer.'
              });
            } else if (s === 'accepted' && request?.updated_at) {
              list.push({
                title: 'Request Accepted',
                time: new Date(request.updated_at).toLocaleString(),
                note: 'Accepted by Maintenance Officer.'
              });
            }

            // 4. Request Submitted (Bottom oldest status)
            if (request?.submittedDate || request?.created_at) {
              list.push({
                title: 'Request Submitted',
                time: request?.submittedDate || new Date(request.created_at).toLocaleString(),
                note: (request?.requester?.name || request?.requester_name) ? `Submitted by ${request?.requester?.name || request?.requester_name} via Staff Portal.` : 'Submitted via Staff Portal.'
              });
            }

            return list;
          })().map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: idx === 0 ? '#7a1521' : '#cbd5e1' }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.timelineTitle, idx === 0 && { color: '#7a1521', fontWeight: '700' }]}>{item.title}</Text>
                  <Text style={styles.timelineTime}>{item.time || ''}</Text>
                </View>
                {item.note || item.desc || item.description ? (
                  <Text style={styles.timelineDesc}>
                    {item.note || item.desc || item.description}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Media Evidence Modal */}
      <MediaEvidenceModal
        visible={!!activeMedia}
        onClose={() => setActiveMedia(null)}
        mediaItem={activeMedia}
      />

      {/* Assign Success Centered Modal */}
      <Modal
        visible={assignSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setAssignSuccessModal(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.successModalCard}>
            <View style={styles.successModalTopBar} />
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={36} color="#16a34a" />
            </View>
            <View style={styles.successBadge}>
              <Text style={styles.successBadgeText}>ASSIGNMENT SUCCESS</Text>
            </View>
            <Text style={styles.successModalTitle}>Assign Success</Text>
            <Text style={styles.successModalMessage}>
              Job has been successfully assigned to {technician}!
            </Text>

            <View style={styles.successDetailsBox}>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Technician:</Text>
                <Text style={styles.successDetailValue}>{technician}</Text>
              </View>
              <View style={styles.successDetailRow}>
                <Text style={styles.successDetailLabel}>Target Date:</Text>
                <Text style={styles.successDetailValue}>{completionDate}</Text>
              </View>
            </View>

            <View style={styles.successModalButtons}>
              <TouchableOpacity
                style={styles.successCloseBtn}
                onPress={() => {
                  setAssignSuccessModal(false);
                  loadRequest();
                }}
              >
                <Text style={styles.successCloseBtnText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.successConfirmBtn}
                onPress={() => {
                  setAssignSuccessModal(false);
                  navigation.navigate('MainTabs', { screen: 'Jobs' });
                }}
              >
                <Text style={styles.successConfirmBtnText}>View in Jobs</Text>
                <ArrowRight size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Confirmation Centered Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.rejectModalCard}>
            <View style={styles.rejectModalTopBar} />
            <View style={styles.rejectIconCircle}>
              <AlertTriangle size={36} color="#dc2626" />
            </View>
            <View style={styles.rejectBadge}>
              <Text style={styles.rejectBadgeText}>CONFIRM REJECTION</Text>
            </View>
            <Text style={styles.rejectModalTitle}>Reject Request?</Text>
            <Text style={styles.rejectModalMessage}>
              Are you sure you want to reject this maintenance request?
            </Text>

            <View style={styles.rejectModalButtons}>
              <TouchableOpacity
                style={styles.rejectCancelBtn}
                onPress={() => setRejectModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.rejectCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectConfirmBtn}
                onPress={confirmReject}
                activeOpacity={0.85}
              >
                <Text style={styles.rejectConfirmBtnText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Interactive Calendar Date Picker Modal */}
      <Modal
        visible={calendarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCalendarModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.calModalOverlay}
          activeOpacity={1}
          onPress={() => setCalendarModalVisible(false)}
        >
          <View style={styles.calModalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.calModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.calModalIconWrap}>
                  <Calendar size={18} color="#7a1521" />
                </View>
                <View>
                  <Text style={styles.calModalTitle}>
                    {activeDatePickerTarget === 'nextDate' ? 'Set Next Available Date' : 'Estimated Completion Date'}
                  </Text>
                  <Text style={styles.calModalSubtitle}>Choose target date from calendar</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setCalendarModalVisible(false)}
                style={styles.calModalCloseBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={18} color="#64748b" />
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
                  const activeDateVal = activeDatePickerTarget === 'nextDate' ? nextDate : completionDate;
                  const isSelected = activeDateVal === dateStr;
                  const now = new Date();
                  const isToday = dateStr === formatYMD(now.getFullYear(), now.getMonth(), now.getDate());

                  return (
                    <TouchableOpacity
                      key={`day-${dayNum}`}
                      activeOpacity={0.7}
                      onPress={() => handleSelectDay(dayNum)}
                      style={[
                        styles.calendarDayCell,
                        isSelected && styles.calendarDayCellSelected
                      ]}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          isSelected && styles.calendarDayTextSelected,
                          isToday && !isSelected && styles.calendarDayTextToday
                        ]}
                      >
                        {dayNum}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Quick Actions (Today / In 2 Days / In 1 Week) */}
            <View style={styles.calQuickActionsRow}>
              <TouchableOpacity
                onPress={() => {
                  const now = new Date();
                  const str = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                  if (activeDatePickerTarget === 'nextDate') setNextDate(str);
                  else setCompletionDate(str);
                  setCalendarModalVisible(false);
                }}
                style={styles.calQuickBtn}
              >
                <Text style={styles.calQuickBtnText}>Today</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const d = new Date(Date.now() + 86400000 * 2);
                  const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  if (activeDatePickerTarget === 'nextDate') setNextDate(str);
                  else setCompletionDate(str);
                  setCalendarModalVisible(false);
                }}
                style={styles.calQuickBtn}
              >
                <Text style={styles.calQuickBtnText}>In 2 Days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const d = new Date(Date.now() + 86400000 * 7);
                  const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                  if (activeDatePickerTarget === 'nextDate') setNextDate(str);
                  else setCompletionDate(str);
                  setCalendarModalVisible(false);
                }}
                style={styles.calQuickBtn}
              >
                <Text style={styles.calQuickBtnText}>In 1 Week</Text>
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
    paddingBottom: 40
  },
  rejectionBanner: {
    backgroundColor: '#dc2626',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 10,
    marginBottom: 16
  },
  rejectionBannerText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13.5
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
    elevation: 2,
    position: 'relative'
  },
  reqTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b'
  },
  timeText: {
    fontSize: 12,
    color: '#64748b'
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12
  },
  subHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569'
  },
  requesterRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  requesterAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  requesterAvatarText: {
    color: '#be123c',
    fontSize: 16,
    fontWeight: '700'
  },
  requesterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  metaText: {
    fontSize: 12.5,
    color: '#64748b'
  },
  descBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  descText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18
  },
  evidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  evidenceThumb: {
    width: 100,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden'
  },
  evidenceInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  evidenceThumbText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '600',
    textAlign: 'center'
  },
  evidenceImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  evidenceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  },
  evidenceImageBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  evidenceImageBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center'
  },
  noEvidenceBox: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center'
  },
  noEvidenceText: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontStyle: 'italic'
  },
  warningBanner: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 12
  },
  warningTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9f1239'
  },
  warningSub: {
    fontSize: 11.5,
    color: '#be123c',
    marginTop: 2
  },
  equipmentTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#fff0ef',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffdad9',
    padding: 4,
    marginBottom: 12
  },
  equipTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 8
  },
  equipTabActive: {
    backgroundColor: '#7a1521'
  },
  equipTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7a1521'
  },
  equipTabTextActive: {
    color: '#ffffff'
  },
  formGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 8
  },
  pillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  optionPillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155'
  },
  optionPillTextActive: {
    color: '#ffffff'
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b'
  },
  assignSubmitBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 4
  },
  assignSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  rescheduleSubmitBtn: {
    backgroundColor: '#475569',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 4
  },
  rescheduleSubmitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  assignmentOuterContainer: {
    position: 'relative',
    marginTop: 4,
    marginBottom: 16
  },
  assignmentContentWrapper: {
    width: '100%'
  },
  assignmentContentBlurred: {
    opacity: 0.35,
    ...(Platform.OS === 'web' ? {
      filter: 'blur(5px)',
      userSelect: 'none',
      transition: 'filter 0.3s ease, opacity 0.3s ease'
    } : {})
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 25,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(6px)'
    } : {})
  },
  lockBox: {
    alignItems: 'center',
    maxWidth: 300,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#ffdad9',
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6
  },
  lockIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff0ef',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ffd6d8'
  },
  lockTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center'
  },
  lockDesc: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 18
  },
  lockAcceptBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3
  },
  lockAcceptBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700'
  },
  decisionStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  decisionStatusPillPending: {
    backgroundColor: '#f1f5f9'
  },
  decisionStatusPillAccepted: {
    backgroundColor: '#ecfdf5'
  },
  decisionStatusPillRejected: {
    backgroundColor: '#fef2f2'
  },
  decisionStatusText: {
    fontSize: 11.5,
    fontWeight: '700'
  },
  decisionStatusTextPending: {
    color: '#475569'
  },
  decisionStatusTextAccepted: {
    color: '#059669'
  },
  decisionStatusTextRejected: {
    color: '#dc2626'
  },
  decisionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14
  },
  decisionActionsRow: {
    flexDirection: 'row',
    gap: 12
  },
  decisionRejectBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#f87171',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  decisionRejectBtnText: {
    color: '#dc2626',
    fontSize: 13.5,
    fontWeight: '700'
  },
  decisionAcceptBtn: {
    flex: 1.2,
    height: 46,
    backgroundColor: '#7a1521',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  decisionAcceptBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  decisionAcceptedBanner: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  decisionAcceptedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center'
  },
  decisionAcceptedTitle: {
    color: '#15803d',
    fontSize: 13.5,
    fontWeight: '700'
  },
  decisionAcceptedSub: {
    color: '#166534',
    fontSize: 12,
    marginTop: 2
  },
  decisionRejectedBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  decisionRejectedText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600'
  },
  timelineList: {
    paddingLeft: 6
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  timelineTime: {
    fontSize: 11,
    color: '#94a3b8'
  },
  timelineDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  successModalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    paddingTop: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  successModalTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#16a34a'
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 4,
    borderColor: '#bbf7d0'
  },
  successBadge: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 10
  },
  successBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.5
  },
  successModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center'
  },
  successModalMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18
  },
  successDetailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 8
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  successDetailLabel: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '500'
  },
  successDetailValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700'
  },
  successModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center'
  },
  successCloseBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  successCloseBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600'
  },
  successConfirmBtn: {
    flex: 1.5,
    backgroundColor: '#7a1521',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3
  },
  successConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  rejectModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    paddingTop: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden'
  },
  rejectModalTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#dc2626'
  },
  rejectIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 4,
    borderColor: '#fecaca'
  },
  rejectBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 8
  },
  rejectBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
    letterSpacing: 0.5
  },
  rejectModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center'
  },
  rejectModalMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20
  },
  rejectModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center'
  },
  rejectCancelBtn: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  rejectCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600'
  },
  rejectConfirmBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  rejectConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  decisionStatusPillAssigned: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0'
  },
  decisionStatusTextAssigned: {
    color: '#059669',
    fontWeight: '700'
  },
  assignedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 16
  },
  assignedIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff0ef',
    alignItems: 'center',
    justifyContent: 'center'
  },
  assignedCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  assignedCardSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1
  },
  assignedActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  assignedActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981'
  },
  assignedActiveBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#059669'
  },
  supervisorProfileBox: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  supervisorAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  supervisorAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700'
  },
  supervisorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  tradeBadge: {
    backgroundColor: '#fff0ef',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffdcdb'
  },
  tradeBadgeText: {
    color: '#7a1521',
    fontSize: 11,
    fontWeight: '700'
  },
  supervisorPhone: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500'
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16
  },
  specBox: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 10
  },
  specLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4
  },
  specLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  specialInstructionsBox: {
    backgroundColor: '#fffbfa',
    borderWidth: 1,
    borderColor: '#fed7d7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16
  },
  specialInstructionsLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7a1521'
  },
  specialInstructionsText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18
  },
  assignedActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  reassignBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff'
  },
  reassignBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569'
  },
  viewJobBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#7a1521'
  },
  viewJobBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#ffffff'
  },
  scheduledHighlightBox: {
    backgroundColor: '#fafaf9',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10
  },
  scheduledHighlightLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5
  },
  scheduledHighlightDate: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  rescheduleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#7a1521',
    borderRadius: 8
  },
  rescheduleHeaderBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  },
  countdownCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1
  },
  countdownCardNormal: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0'
  },
  countdownCardOverdue: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7'
  },
  countdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  countdownHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4
  },
  countdownLiveBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  countdownLiveBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  countdownTilesRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between'
  },
  countdownTile: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dcfce7'
  },
  countdownTileOverdue: {
    borderColor: '#fed7d7'
  },
  countdownTileNum: {
    fontSize: 18,
    fontWeight: '800'
  },
  countdownTileLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 2
  },
  scheduledStatusNotice: {
    backgroundColor: '#faf5ff',
    borderWidth: 1,
    borderColor: '#e9d5ff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14
  },
  scheduledStatusNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#6b21a8'
  },
  scheduledStatusNoticeText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17
  },
  backToRequestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  backToRequestsBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b'
  },
  calModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  calModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8
  },
  calModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  calModalIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#fff0ef',
    justifyContent: 'center',
    alignItems: 'center'
  },
  calModalTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#1e293b'
  },
  calModalSubtitle: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 1
  },
  calModalCloseBtn: {
    padding: 6,
    borderRadius: 6
  },
  calendarContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4
  },
  calendarNavBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  calendarMonthTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b'
  },
  calendarWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  calendarWeekDayText: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8'
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  calendarDayCell: {
    width: '14.28%',
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 8
  },
  calendarDayCellSelected: {
    backgroundColor: '#7a1521',
    borderRadius: 8
  },
  calendarDayText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#1e293b'
  },
  calendarDayTextSelected: {
    color: '#ffffff',
    fontWeight: '700'
  },
  calendarDayTextToday: {
    color: '#7a1521',
    fontWeight: '700'
  },
  calQuickActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4
  },
  calQuickBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  calQuickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569'
  }
});
