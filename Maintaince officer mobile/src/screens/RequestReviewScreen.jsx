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
  Platform
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
  AlertTriangle
} from 'lucide-react-native';
import { StatusBadge, PriorityBadge, CategoryTag } from '../components/Badge';
import MediaEvidenceModal from '../components/MediaEvidenceModal';
import { fetchRequestById, fetchRequests, assignRequest, rescheduleRequest, actionRequest, fetchLabourers } from '../services/api';
import { COLORS } from '../theme/colors';

export default function RequestReviewScreen({ route, navigation }) {
  const targetId = route?.params?.requestId || route?.params?.request?.id || null;
  const initialReq = route?.params?.request || null;
  const [request, setRequest] = useState(initialReq);
  const [equipmentMode, setEquipmentMode] = useState('available'); // 'available' | 'unavailable'
  const [acceptedOverride, setAcceptedOverride] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);
  const [labourerList, setLabourerList] = useState([]);

  // Assignment Form State
  const [technician, setTechnician] = useState('');
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [instructions, setInstructions] = useState('');

  // Rescheduling Form State
  const [delayReason, setDelayReason] = useState('Out of Stock - Awaiting PO');
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [billNumber, setBillNumber] = useState('');
  const [officerNote, setOfficerNote] = useState('');

  useEffect(() => {
    loadRequest();
    const interval = setInterval(loadRequest, 3000);
    const onFocus = () => loadRequest();
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', onFocus);
    }
    return () => {
      clearInterval(interval);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', onFocus);
      }
    };
  }, [targetId]);

  const loadRequest = async () => {
    let id = targetId;
    if (!id) {
      const all = await fetchRequests();
      if (all && all.length > 0) id = all[0].id;
    }
    if (id) {
      const data = await fetchRequestById(id);
      if (data) setRequest(data);
    }
    const labs = await fetchLabourers();
    if (labs && labs.length > 0) {
      setLabourerList(labs);
      const firstTech = `${labs[0].name} - ${labs[0].trade || labs[0].category || 'Technician'}`;
      setTechnician(prev => prev || firstTech);
    }
  };

  const reqStatus = (request?.status || '').toLowerCase();
  const isAccepted = acceptedOverride ||
    reqStatus === 'accepted' ||
    reqStatus === 'scheduled' ||
    reqStatus === 'in progress';

  const handleAction = async (action) => {
    if (action === 'accept') {
      setAcceptedOverride(true);
      setRequest(prev => (prev ? { ...prev, status: 'Accepted' } : { status: 'Accepted' }));
      await actionRequest(targetId, { action: 'accept' });
      Alert.alert('Request Accepted', 'Maintenance request accepted successfully! You can now verify equipment availability and assign technicians below.');
      loadRequest();
    } else if (action === 'reject') {
      const confirmReject = async () => {
        setIsRejected(true);
        setRequest(prev => (prev ? { ...prev, status: 'Rejected' } : { status: 'Rejected' }));
        await actionRequest(targetId, { action: 'reject' });
        setTimeout(() => {
          navigation.navigate('MainTabs', { screen: 'Requests' });
        }, 1200);
      };

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        if (window.confirm('Are you sure you want to reject this maintenance request?')) {
          await confirmReject();
        }
      } else {
        Alert.alert(
          'Reject Request',
          'Are you sure you want to reject this maintenance request?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Reject', style: 'destructive', onPress: confirmReject }
          ]
        );
      }
    }
  };

  const handleAssign = async () => {
    try {
      await assignRequest(targetId, {
        technician,
        completionDate,
        instructions
      });
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Assign success');
      } else {
        Alert.alert('Assign success', `Job assigned to ${technician} successfully!`);
      }
      navigation.navigate('MainTabs', { screen: 'Jobs' });
    } catch (err) {
      console.warn('Assign error:', err);
    }
  };

  const handleReschedule = async () => {
    await rescheduleRequest(targetId, {
      reason: delayReason,
      nextDate,
      billNumber,
      notes: officerNote
    });
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
    'Exam / Lecture Session Clashes'
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
          {isAccepted && (
            <View style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ color: '#059669', fontSize: 11, fontWeight: '700' }}>Accepted</Text>
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
              <View style={styles.metaRow}>
                <MapPin size={14} color="#64748b" />
                <Text style={styles.metaText}>{request.location}</Text>
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
      </View>

      {/* 4. Officer Review & Decision Card (Directly after reviewing evidence & description) */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={styles.cardHeading}>Officer Review Decision</Text>
          <View style={[
            styles.decisionStatusPill,
            isAccepted ? styles.decisionStatusPillAccepted : isRejected ? styles.decisionStatusPillRejected : styles.decisionStatusPillPending
          ]}>
            <Text style={[
              styles.decisionStatusText,
              isAccepted ? styles.decisionStatusTextAccepted : isRejected ? styles.decisionStatusTextRejected : styles.decisionStatusTextPending
            ]}>
              {isAccepted ? '✓ Accepted' : isRejected ? '✗ Rejected' : '● Awaiting Review'}
            </Text>
          </View>
        </View>

        <Text style={styles.decisionSubtitle}>
          {isAccepted
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

      {/* 5. Equipment Mode Tabs & Assignment Container (Blurred until Request is Accepted) */}
      <View style={styles.assignmentOuterContainer}>
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
                  <Text style={styles.label}>ASSIGN TO TECHNICIAN</Text>
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
                        No registered technicians available in database
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>ESTIMATED COMPLETION DATE</Text>
                  <TextInput
                    editable={isAccepted}
                    style={styles.input}
                    value={completionDate}
                    onChangeText={setCompletionDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>SPECIAL INSTRUCTIONS FOR TECHNICIAN</Text>
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
                  <Text style={styles.assignSubmitBtnText}>Assign Job to Labourer</Text>
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
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>SET NEXT AVAILABLE DATE</Text>
                  <TextInput
                    editable={isAccepted}
                    style={styles.input}
                    value={nextDate}
                    onChangeText={setNextDate}
                    placeholder="YYYY-MM-DD"
                  />
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

        {/* Assignment Locked & Frosted Glass Overlay if not accepted */}
        {!isAccepted && (
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
        )}
      </View>

      {/* 6. Activity History Card */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Activity History</Text>
        <View style={styles.timelineList}>
          {((request?.history && request.history.length > 0) ? request.history : [
            ...(request?.scheduled_date ? [{ title: `Scheduled for ${new Date(request.scheduled_date).toLocaleDateString()}`, time: 'Procurement Scheduled', note: 'Rescheduled by Maintenance Officer' }] : []),
            ...(request?.status === 'In Progress' ? [{ title: `Assigned to ${request.assigned_team_name || 'Assigned Crew'}`, time: 'Underway', note: 'Technician dispatched for execution' }] : []),
            ...(request?.status === 'Completed' ? [{ title: 'Task Completed', time: 'Completed', note: 'Maintenance job finalized and verified' }] : []),
            ...(request?.status === 'Accepted' && request?.updated_at ? [{ title: 'Request Accepted', time: new Date(request.updated_at).toLocaleString(), note: 'Accepted by Maintenance Officer.' }] : []),
            ...((request?.submittedDate || request?.created_at) ? [{ title: 'Request Submitted', time: request?.submittedDate || new Date(request.created_at).toLocaleString(), note: (request?.requester?.name || request?.requester_name) ? `Submitted by ${request?.requester?.name || request?.requester_name} via Staff Portal.` : 'Submitted via Staff Portal.' }] : [])
          ]).map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: idx === 0 ? '#7a1521' : '#cbd5e1' }]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={styles.timelineTitle}>{item.title}</Text>
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
  }
});
