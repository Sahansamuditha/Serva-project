import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
  Share,
  Modal,
  TextInput
} from 'react-native';
import {
  Printer,
  Info,
  MapPin,
  Triangle,
  Calendar,
  User,
  Phone,
  Mail,
  History,
  Share2,
  Clock,
  UserCheck,
  CheckCircle2,
  Briefcase,
  Building2,
  FileText,
  AlertTriangle,
  X,
  RefreshCw,
  Package,
  Wrench
} from 'lucide-react-native';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { fetchJobById, fetchLabourers, assignRequest } from '../services/api';
import { COLORS } from '../theme/colors';

export default function JobDetailsScreen({ route, navigation }) {
  const jobId = route?.params?.jobId || null;
  const [job, setJob] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Re-assignment & equipment state
  const [equipmentMode, setEquipmentMode] = useState('available');
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [reassignDate, setReassignDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [reassignNotes, setReassignNotes] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState(null);

  useEffect(() => {
    loadJob();
    loadSupervisors();
    const interval = setInterval(loadJob, 3000);
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;
    const data = await fetchJobById(jobId);
    if (data) setJob(data);
  };

  const loadSupervisors = async () => {
    try {
      const data = await fetchLabourers();
      if (Array.isArray(data) && data.length > 0) {
        setSupervisorsList(data);
        const available = data.find(s => s.status === 'Available');
        if (available) setSelectedSupervisor(available.name);
        else setSelectedSupervisor(data[0].name);
      }
    } catch (e) {
      console.warn('Failed to load supervisors:', e);
    }
  };

  const handleConfirmReassign = async () => {
    if (!selectedSupervisor) {
      Alert.alert('Required', 'Please select a supervisor to assign.');
      return;
    }
    setIsReassigning(true);
    try {
      const targetId = job?.request_id || job?.id || jobId;
      await assignRequest(targetId, {
        technician: selectedSupervisor,
        scheduledDate: reassignDate,
        completionDate: reassignDate,
        instructions: reassignNotes || 'Work order reassigned by Maintenance Officer.'
      });
      setIsReassignModalOpen(false);
      setReassignSuccessMsg(`Work order successfully reassigned to ${selectedSupervisor}!`);
      setTimeout(() => setReassignSuccessMsg(null), 4000);
      await loadJob();
    } catch (err) {
      Alert.alert('Error', 'Failed to re-assign work order. Please try again.');
    } finally {
      setIsReassigning(false);
    }
  };

  const isRejectedBySupervisor =
    job?.status === 'Rejected' ||
    job?.status === 'Cancelled' ||
    Boolean(job?.notes?.includes('[REJECTED]')) ||
    Boolean(job?.completionNotes?.includes('[REJECTED]'));

  const cleanRejectionReason = (job?.notes || job?.completionNotes || '')
    .replace(/^\[REJECTED\]:\s*/i, '')
    .trim();

  const hasSupervisor = Boolean(
    !isRejectedBySupervisor && (
      (job?.lead_person && job.lead_person !== 'Supervisor' && job.lead_person !== 'Unassigned' && job.lead_person.trim() !== '') ||
      (job?.assignedPersonnel?.name && job.assignedPersonnel.name !== 'Unassigned' && job.assignedPersonnel.name !== 'Supervisor' && job.assignedPersonnel.name.trim() !== '') ||
      (Number(job?.labourers_assigned || 0) > 0 && job?.status !== 'Scheduled')
    )
  );

  const personnelName = job?.assignedPersonnel?.name || (job?.lead_person ? job.lead_person.split(' - ')[0].trim() : 'Supervisor');
  const personnelRole = job?.assignedPersonnel?.role || (job?.lead_person?.includes(' - ') ? job.lead_person.split(' - ')[1].trim() : '') || job?.team_name || 'Supervisor';
  const personnelPhone = job?.assignedPersonnel?.phone || '+94 77 123 4567';

  const targetScheduledDate = (() => {
    const raw = job?.due_date || job?.scheduled_date;
    if (!raw) return null;
    if (raw instanceof Date) return raw;
    if (typeof raw === 'string') {
      const clean = raw.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        const d = new Date(`${clean}T23:59:59`);
        return isNaN(d.getTime()) ? new Date(clean) : d;
      }
      const d = new Date(clean);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  })();

  const formattedTargetDate = (() => {
    if (!targetScheduledDate) return 'Date Pending';
    try {
      return new Date(targetScheduledDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Date Pending';
    }
  })();

  const countdown = (() => {
    if (!targetScheduledDate) return null;
    const target = new Date(targetScheduledDate).getTime();
    if (isNaN(target)) return null;

    const diff = target - now;
    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((absDiff / 1000) % 60);

    return { isOverdue, days, hours, minutes, seconds, diff };
  })();

  const handlePrint = async () => {
    try {
      await Share.share({
        message: `ITUM Work Order: #${job?.id || jobId}\nTitle: ${job?.title || 'Work Order'}\nLocation: ${job?.location || 'Campus'}\nAssigned to: ${job?.assignedPersonnel?.name || 'Unassigned'}\nStatus: ${isRejectedBySupervisor ? 'Rejected' : (job?.status || 'Pending')}`,
        title: `Work Order #${job?.id || jobId}`
      });
    } catch (e) {
      Alert.alert('Work Order', `Printing / Exporting Work Order #${job?.id || jobId}`);
    }
  };

  const imagesList = Array.isArray(job?.images) ? job.images : (Array.isArray(job?.evidence) ? job.evidence : []);

  const historyItems = (() => {
    if (job?.history && job.history.length > 0) {
      const first = job.history[0];
      if (first?.title?.toLowerCase().includes('created') || first?.title?.toLowerCase().includes('submitted')) {
        return [...job.history].reverse();
      }
      return job.history;
    }
    const list = [];

    // 1. Terminal / Latest status on top
    if (job?.status === 'Completed') {
      list.push({
        title: 'Completed & Verified',
        time: job?.completed_at ? new Date(job.completed_at).toLocaleString() : 'Completed',
        note: 'Work order executed, inspected and verified.',
        completed: true,
        isActive: true
      });
    } else if (isRejectedBySupervisor || job?.status === 'Rejected') {
      list.push({
        title: `Work Order Declined by ${personnelName}`,
        time: cleanRejectionReason ? `Reason: "${cleanRejectionReason}"` : 'Declined by technician',
        note: cleanRejectionReason || 'Supervisor declined this assignment.',
        isDeclined: true,
        completed: true,
        isActive: true
      });
    }

    // 2. Active status
    if (job?.status === 'Completed') {
      list.push({
        title: 'Work In Progress',
        time: job?.start_date ? new Date(job.start_date).toLocaleDateString() : 'Executed',
        note: `Field execution completed by ${personnelName}.`,
        completed: true
      });
    } else if (job?.status === 'In Progress') {
      list.push({
        title: 'Work In Progress',
        time: job?.start_date ? new Date(job.start_date).toLocaleDateString() : 'Active',
        note: `Field execution underway by ${personnelName}.`,
        completed: true,
        isActive: true
      });
    } else if (job?.status === 'On Hold') {
      list.push({
        title: 'Work Placed On Hold',
        time: 'On Hold',
        note: job?.notes || 'Work order placed on hold temporarily.',
        completed: true,
        isActive: true
      });
    } else if (job?.status === 'Scheduled' || (!hasSupervisor && !isRejectedBySupervisor)) {
      list.push({
        title: 'Scheduled for Execution',
        time: formattedTargetDate,
        note: 'Scheduled execution plan active. Supervisor allocation pending.',
        completed: true,
        isActive: true
      });
    }

    // 3. Assignment
    if (personnelName && personnelName !== 'Supervisor' && personnelName !== 'Unassigned') {
      list.push({
        title: `Assigned to ${personnelName}`,
        time: job?.assigned_date ? new Date(job.assigned_date).toLocaleDateString() : 'Field Dispatch',
        note: 'Dispatched to field supervisor by Maintenance Officer.',
        completed: true
      });
    }

    // 4. Creation (bottom)
    if (job?.created_at) {
      list.push({
        title: 'Work Order Created',
        time: new Date(job.created_at).toLocaleString(),
        note: `Reported by ${job?.requester || 'Requester'} via Staff Portal.`,
        completed: true
      });
    }

    return list;
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Reassign Success Toast */}
      {reassignSuccessMsg && (
        <View style={styles.successToast}>
          <CheckCircle2 size={16} color="#ffffff" />
          <Text style={styles.successToastText}>{reassignSuccessMsg}</Text>
        </View>
      )}

      {/* Top Header Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={styles.jobId}>#{job?.id || jobId || 'JOB'}</Text>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            {job?.priority ? <PriorityBadge priority={job.priority} /> : null}
            {isRejectedBySupervisor ? (
              <View style={styles.rejectedPillBadge}>
                <X size={12} color="#b91c1c" />
                <Text style={styles.rejectedPillBadgeText}>Rejected by Supervisor</Text>
              </View>
            ) : (
              <StatusBadge status={job?.status || 'Pending'} />
            )}
          </View>
        </View>

        <Text style={styles.jobTitle}>{job?.title || (job?.id ? `Work Order #${job.id}` : 'Work Order Details')}</Text>

        <View style={{ flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {isRejectedBySupervisor && (
            <TouchableOpacity
              onPress={() => setIsReassignModalOpen(true)}
              style={styles.headerReassignBtn}
            >
              <RefreshCw size={15} color="#ffffff" />
              <Text style={styles.headerReassignBtnText}>Re-assign to Another Supervisor</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handlePrint} style={styles.printBtn}>
            <Share2 size={16} color="#7a1521" />
            <Text style={styles.printBtnText}>Share / Print Work Order</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Job Details Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <Info size={16} color="#7a1521" />
          <Text style={styles.cardHeading}>Job Details</Text>
        </View>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>REQUEST ID</Text>
            <Text style={styles.metaVal}>{job?.requestRef ? `#${job.requestRef}` : (job?.request_id ? `#${job.request_id}` : 'N/A')}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>LOCATION</Text>
            <Text style={styles.metaVal}>{job?.location ? `📍 ${job.location}` : 'N/A'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>CATEGORY</Text>
            <Text style={styles.metaVal}>{job?.category || 'General'}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>REPORTED DATE</Text>
            <Text style={styles.metaVal}>{job?.reportedDate || (job?.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A')}</Text>
          </View>
          <View style={[styles.metaItem, { width: '100%' }]}>
            <Text style={styles.metaLabel}>REQUESTER</Text>
            <Text style={styles.metaVal}>{job?.requester || job?.requester_name || 'N/A'}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.metaLabel}>DESCRIPTION</Text>
          <View style={styles.descBox}>
            <Text style={styles.descText}>
              {job?.description || 'No description provided.'}
            </Text>
          </View>
        </View>

        {/* Reference Images */}
        <View style={{ marginTop: 14 }}>
          <Text style={styles.metaLabel}>REFERENCE IMAGES ({imagesList.length})</Text>
          {imagesList.length > 0 ? (
            <View style={styles.imageGrid}>
              {imagesList.map((img, idx) => {
                const label = typeof img === 'object' ? (img.label || img.name || `Image ${idx + 1}`) : `Image ${idx + 1}`;
                return (
                  <View key={idx} style={[styles.imgBox, { backgroundColor: '#1e293b' }]}>
                    <Text style={styles.imgBoxText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.descBox, { marginTop: 6 }]}>
              <Text style={[styles.descText, { color: '#94a3b8', fontStyle: 'italic' }]}>
                No reference images attached to this work order.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Assigned Personnel Card (Shown when assigned or when rejected by supervisor) */}
      {(hasSupervisor || isRejectedBySupervisor) && (
        <View style={styles.card}>
          {/* Rejection Alert Banner if supervisor declined (exact web match) */}
          {isRejectedBySupervisor && (
            <View style={styles.rejectionBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={styles.rejectionBannerIcon}>
                  <AlertTriangle size={18} color="#b91c1c" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rejectionBannerTitle}>
                    Work Order Declined / Rejected by Supervisor
                  </Text>
                  <Text style={styles.rejectionBannerDesc}>
                    <Text style={{ fontWeight: '700' }}>{personnelName}</Text> declined this task.
                  </Text>
                  {cleanRejectionReason ? (
                    <Text style={styles.rejectionBannerReason}>
                      Reason: "{cleanRejectionReason}"
                    </Text>
                  ) : null}
                  <Text style={styles.rejectionBannerSubtext}>
                    Please select another supervisor below to re-assign this maintenance dispatch.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setIsReassignModalOpen(true)}
                style={styles.reassignActionBtn}
              >
                <UserCheck size={15} color="#ffffff" />
                <Text style={styles.reassignActionBtnText}>Re-assign to Another Supervisor</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.assignedCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <User size={16} color="#7a1521" />
              <Text style={styles.cardHeading}>Assigned Personnel</Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsReassignModalOpen(true)}
              style={styles.changeSupervisorBtn}
            >
              <RefreshCw size={12} color="#7a1521" />
              <Text style={styles.changeSupervisorBtnText}>Change Supervisor</Text>
            </TouchableOpacity>
          </View>

          {/* Supervisor Identity Profile */}
          <View style={[
            styles.supervisorProfileBox,
            isRejectedBySupervisor && styles.supervisorProfileBoxRejected
          ]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[
                styles.supervisorAvatar,
                isRejectedBySupervisor && { backgroundColor: '#b91c1c' }
              ]}>
                <Text style={styles.supervisorAvatarText}>
                  {personnelName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.supervisorName}>{personnelName}</Text>
                  <View style={styles.tradeBadge}>
                    <Text style={styles.tradeBadgeText}>{personnelRole}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${personnelPhone}`).catch(() => {})}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}
                >
                  <Phone size={13} color="#7a1521" />
                  <Text style={styles.supervisorPhone}>{personnelPhone}</Text>
                </TouchableOpacity>
              </View>
              <View style={[
                styles.supervisorStatusBadge,
                isRejectedBySupervisor ? { backgroundColor: '#fee2e2', borderColor: '#fca5a5' } : { backgroundColor: '#ffffff', borderColor: '#e2e8f0' }
              ]}>
                {isRejectedBySupervisor ? (
                  <>
                    <X size={11} color="#b91c1c" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#b91c1c' }}>Declined</Text>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={11} color="#059669" />
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#059669' }}>Active</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Technician Rejection Remarks & Diagnostic Box */}
          {(Boolean(cleanRejectionReason) || Boolean(job?.notes) || isRejectedBySupervisor) && (
            <View style={styles.remarksBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <AlertTriangle size={15} color={isRejectedBySupervisor ? '#b91c1c' : '#7a1521'} />
                  <Text style={styles.remarksHeading}>
                    {isRejectedBySupervisor ? 'Technician Rejection Remarks & Diagnostic' : 'Technician Work Remarks'}
                  </Text>
                </View>
                <View style={styles.declinedBadge}>
                  <X size={11} color="#b91c1c" />
                  <Text style={styles.declinedBadgeText}>Declined by Supervisor</Text>
                </View>
              </View>

              <Text style={styles.remarksLabel}>SUPERVISOR STATED REJECTION REASON</Text>
              <View style={styles.remarksContentBox}>
                <Text style={styles.remarksContentText}>
                  {cleanRejectionReason || job?.notes || 'Declined without notes.'}
                </Text>
              </View>
            </View>
          )}

          {/* Specs Grid */}
          <View style={styles.specsGrid}>
            <View style={styles.specBox}>
              <View style={styles.specLabelRow}>
                <Briefcase size={12} color="#7a1521" />
                <Text style={styles.specLabel}>WORK ORDER ID</Text>
              </View>
              <Text style={styles.specValue}>{job?.id || jobId}</Text>
            </View>

            <View style={styles.specBox}>
              <View style={styles.specLabelRow}>
                <Calendar size={12} color="#7a1521" />
                <Text style={styles.specLabel}>TARGET DUE DATE</Text>
              </View>
              <Text style={styles.specValue}>{formattedTargetDate}</Text>
            </View>

            <View style={styles.specBox}>
              <View style={styles.specLabelRow}>
                <User size={12} color="#7a1521" />
                <Text style={styles.specLabel}>LABOURERS COUNT</Text>
              </View>
              <Text style={styles.specValue}>{job?.labourers_assigned || 1} Labourer(s)</Text>
            </View>

            <View style={styles.specBox}>
              <View style={styles.specLabelRow}>
                <Building2 size={12} color="#7a1521" />
                <Text style={styles.specLabel}>ASSIGNED UNIT</Text>
              </View>
              <Text style={styles.specValue}>{job?.team_name || 'Works Division'}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Scheduling & Re-assignment Card (Matches Web Right Column) */}
      {isRejectedBySupervisor && (
        <View style={styles.card}>
          {/* Equipment Mode Tabs */}
          <View style={styles.equipmentTabs}>
            <TouchableOpacity
              onPress={() => setEquipmentMode('available')}
              style={[
                styles.equipmentTab,
                equipmentMode === 'available' && styles.equipmentTabActive
              ]}
            >
              <Text style={[
                styles.equipmentTabText,
                equipmentMode === 'available' && styles.equipmentTabTextActive
              ]}>Equipment Available</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setEquipmentMode('unavailable')}
              style={[
                styles.equipmentTab,
                equipmentMode === 'unavailable' && styles.equipmentTabActive
              ]}
            >
              <Text style={[
                styles.equipmentTabText,
                equipmentMode === 'unavailable' && styles.equipmentTabTextActive
              ]}>Equipment Not Available</Text>
            </TouchableOpacity>
          </View>

          {equipmentMode === 'unavailable' && (
            <View style={styles.equipmentUnavailableBanner}>
              <Package size={18} color="#be123c" />
              <View style={{ flex: 1 }}>
                <Text style={styles.equipmentUnavailableTitle}>Equipment Out of Stock - Needs Purchase/Delay</Text>
                <Text style={styles.equipmentUnavailableDesc}>
                  Required components or specialized tools are currently unavailable in central stores.
                </Text>
              </View>
            </View>
          )}

          {/* Form Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>1</Text>
            </View>
            <Text style={styles.cardHeading}>Scheduling & Assignment</Text>
          </View>

          {/* ASSIGN TO SUPERVISOR */}
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.metaLabel}>ASSIGN TO SUPERVISOR</Text>
            <View style={styles.supervisorSelectWrap}>
              {supervisorsList.length > 0 ? (
                supervisorsList.map((sup, idx) => {
                  const supName = sup.name;
                  const isCurrent = supName.toLowerCase().includes(personnelName.toLowerCase());
                  const isSelected = selectedSupervisor === supName;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedSupervisor(supName)}
                      activeOpacity={0.7}
                      style={[
                        styles.supervisorOption,
                        isSelected && styles.supervisorOptionSelected
                      ]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.supervisorOptionName,
                          isSelected && { color: '#7a1521', fontWeight: '700' }
                        ]}>
                          {supName}
                        </Text>
                        <Text style={styles.supervisorOptionTrade}>
                          {sup.trade || 'Supervisor'} • {isCurrent ? 'Previously Declined' : (sup.status || 'Available')}
                        </Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={16} color="#7a1521" />
                      ) : isCurrent ? (
                        <View style={styles.declinedTinyBadge}>
                          <Text style={styles.declinedTinyBadgeText}>Declined</Text>
                        </View>
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={{ color: '#64748b', fontSize: 13, padding: 8 }}>Loading supervisors...</Text>
              )}
            </View>
          </View>

          {/* TARGET COMPLETION DATE */}
          <View style={{ marginBottom: 14 }}>
            <Text style={styles.metaLabel}>TARGET COMPLETION DATE</Text>
            <View style={styles.dateInputBox}>
              <Calendar size={16} color="#7a1521" />
              <TextInput
                style={styles.dateTextInput}
                value={reassignDate}
                onChangeText={setReassignDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            {/* Quick date buttons */}
            <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
              {['Today', '+1 Day', '+2 Days', '+1 Week'].map((label, idx) => {
                const daysToAdd = idx === 0 ? 0 : idx === 1 ? 1 : idx === 2 ? 2 : 7;
                return (
                  <TouchableOpacity
                    key={label}
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + daysToAdd);
                      setReassignDate(d.toISOString().split('T')[0]);
                    }}
                    style={styles.quickDateBtn}
                  >
                    <Text style={styles.quickDateBtnText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SPECIAL INSTRUCTIONS / REASSIGNMENT NOTES */}
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.metaLabel}>SPECIAL INSTRUCTIONS / REASSIGNMENT NOTES</Text>
            <TextInput
              style={styles.notesTextInput}
              value={reassignNotes}
              onChangeText={setReassignNotes}
              placeholder="Enter instructions for the new supervisor (e.g. Expedited priority, check main breakers)..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Confirm Re-assignment Button */}
          <TouchableOpacity
            onPress={handleConfirmReassign}
            disabled={isReassigning || !selectedSupervisor}
            style={[
              styles.confirmReassignBtn,
              (isReassigning || !selectedSupervisor) && { opacity: 0.6 }
            ]}
          >
            <UserCheck size={16} color="#ffffff" />
            <Text style={styles.confirmReassignBtnText}>
              {isReassigning ? 'Re-assigning...' : 'Confirm Re-assignment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SCHEDULED EXECUTION PLAN & LIVE COUNTDOWN (ONLY FOR UNASSIGNED HELD REQUESTS) */}
      {(!isRejectedBySupervisor && !hasSupervisor) && (
        <View style={styles.card}>
          <View style={styles.assignedCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.assignedIconCircle}>
                <Calendar size={20} color="#7a1521" />
              </View>
              <View>
                <Text style={styles.assignedCardTitle}>Scheduled Execution Plan</Text>
                <Text style={styles.assignedCardSubtitle}>Target completion & allocation plan</Text>
              </View>
            </View>
            <View style={[
              styles.assignedActiveBadge,
              countdown?.isOverdue ? { backgroundColor: '#fef2f2', borderColor: '#fecaca' } : { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }
            ]}>
              <View style={[
                styles.assignedActiveDot,
                countdown?.isOverdue ? { backgroundColor: '#dc2626' } : { backgroundColor: '#10b981' }
              ]} />
              <Text style={[
                styles.assignedActiveBadgeText,
                countdown?.isOverdue ? { color: '#dc2626' } : { color: '#059669' }
              ]}>
                {countdown?.isOverdue ? 'Overdue' : 'On Schedule'}
              </Text>
            </View>
          </View>

          {/* Scheduled Date Highlight Box */}
          <View style={styles.scheduledHighlightBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.scheduledHighlightLabel}>SCHEDULED TARGET DATE</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <Calendar size={16} color="#7a1521" />
                <Text style={styles.scheduledHighlightDate}>{formattedTargetDate}</Text>
              </View>
            </View>
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
              <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#991b1b' : '#14532d' }]}>
                  {String(countdown?.days ?? 0).padStart(2, '0')}
                </Text>
                <Text style={styles.countdownTileLabel}>DAYS</Text>
              </View>
              <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#991b1b' : '#14532d' }]}>
                  {String(countdown?.hours ?? 0).padStart(2, '0')}
                </Text>
                <Text style={styles.countdownTileLabel}>HOURS</Text>
              </View>
              <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#991b1b' : '#14532d' }]}>
                  {String(countdown?.minutes ?? 0).padStart(2, '0')}
                </Text>
                <Text style={styles.countdownTileLabel}>MINUTES</Text>
              </View>
              <View style={[styles.countdownTile, countdown?.isOverdue && styles.countdownTileOverdue]}>
                <Text style={[styles.countdownTileNum, { color: countdown?.isOverdue ? '#dc2626' : '#16a34a' }]}>
                  {String(countdown?.seconds ?? 0).padStart(2, '0')}
                </Text>
                <Text style={styles.countdownTileLabel}>SECONDS</Text>
              </View>
            </View>
          </View>

          {/* Scheduled Status Notice */}
          <View style={styles.scheduledStatusNotice}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Calendar size={14} color="#7c3aed" />
              <Text style={styles.scheduledStatusNoticeTitle}>Scheduled - Allocation Pending</Text>
            </View>
            <Text style={styles.scheduledStatusNoticeText}>
              This work order is scheduled for {formattedTargetDate}. Supervisor allocation pending.
            </Text>
          </View>
        </View>
      )}

      {/* Action History Timeline */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <History size={16} color="#7a1521" />
          <Text style={styles.cardHeading}>Action History</Text>
        </View>

        <View style={styles.timelineList}>
          {historyItems.map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[
                styles.timelineDot,
                { backgroundColor: item.isDeclined ? '#dc2626' : (idx === 0 ? '#7a1521' : '#cbd5e1') }
              ]} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[
                    styles.timelineTitle,
                    idx === 0 && { color: '#7a1521', fontWeight: '700' },
                    item.isDeclined && { color: '#dc2626', fontWeight: '700' }
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.timelineTime}>{item.time || ''}</Text>
                </View>
                {(item.note || item.desc || item.description) ? (
                  <Text style={styles.timelineDesc}>
                    {item.note || item.desc || item.description}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Re-assign Modal */}
      <Modal
        visible={isReassignModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsReassignModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Re-assign Work Order</Text>
                <Text style={styles.modalSub}>#{job?.id || jobId}</Text>
              </View>
              <TouchableOpacity onPress={() => setIsReassignModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Previous Assignee Warning */}
            <View style={styles.modalWarningBox}>
              <Text style={styles.modalWarningText}>
                <Text style={{ fontWeight: '700' }}>Previous Assignee:</Text> {personnelName} (Declined: "{cleanRejectionReason || 'Over capacity'}")
              </Text>
            </View>

            {/* Supervisor Selector */}
            <Text style={styles.formLabel}>Select New Supervisor <Text style={{ color: '#e11d48' }}>*</Text></Text>
            <ScrollView style={styles.supervisorSelectList} nestedScrollEnabled={true}>
              {supervisorsList.length > 0 ? (
                supervisorsList.map((sup, idx) => {
                  const isSelected = selectedSupervisor === sup.name;
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => setSelectedSupervisor(sup.name)}
                      style={[styles.supervisorItem, isSelected && styles.supervisorItemSelected]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.supervisorItemName, isSelected && { color: '#7a1521' }]}>
                          {sup.name}
                        </Text>
                        <Text style={styles.supervisorItemSub}>
                          {sup.trade || 'General'} • {sup.department || 'Maintenance'} ({sup.status || 'Available'})
                        </Text>
                      </View>
                      {isSelected ? <CheckCircle2 size={16} color="#7a1521" /> : null}
                    </TouchableOpacity>
                  );
                })
              ) : (
                <View style={{ padding: 10 }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>Sunil Shantha (Electrical)</Text>
                </View>
              )}
            </ScrollView>

            {/* Target Due Date */}
            <Text style={[styles.formLabel, { marginTop: 12 }]}>Target Due Date (YYYY-MM-DD) <Text style={{ color: '#e11d48' }}>*</Text></Text>
            <View style={styles.inputWrap}>
              <Calendar size={16} color="#7a1521" />
              <TextInput
                style={styles.modalInput}
                value={reassignDate}
                onChangeText={setReassignDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Instructions */}
            <Text style={[styles.formLabel, { marginTop: 12 }]}>Special Instructions / Notes</Text>
            <TextInput
              style={[styles.modalInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
              value={reassignNotes}
              onChangeText={setReassignNotes}
              placeholder="e.g. Check wiring, prioritize breaker box"
              placeholderTextColor="#94a3b8"
              multiline={true}
            />

            {/* Action Buttons */}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                onPress={() => setIsReassignModalOpen(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmReassign}
                disabled={isReassigning}
                style={[styles.confirmBtn, isReassigning && { opacity: 0.7 }]}
              >
                <Text style={styles.confirmBtnText}>
                  {isReassigning ? 'Re-assigning...' : 'Confirm Re-assignment'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  jobId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b'
  },
  jobTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 14
  },
  printBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff0ef',
    borderWidth: 1,
    borderColor: '#ffdad9',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 8
  },
  printBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7a1521'
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  metaItem: {
    width: '48%'
  },
  metaLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4,
    marginBottom: 2
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b'
  },
  descBox: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 4
  },
  descText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6
  },
  imgBox: {
    flex: 1,
    height: 90,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  imgBoxText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center'
  },
  personnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  personnelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  personnelAvatarText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14
  },
  personnelName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b'
  },
  personnelRole: {
    fontSize: 11.5,
    color: '#64748b'
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  timelineList: {
    gap: 14,
    borderLeftWidth: 2,
    borderLeftColor: '#e2e8f0',
    marginLeft: 8,
    paddingLeft: 14
  },
  timelineItem: {
    position: 'relative'
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    left: -20,
    top: 3
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  timelineTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  timelineDesc: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16
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
  rejectionNoticeCard: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 12,
    padding: 14,
    marginTop: 14
  },
  rejectionNoticeTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#9f1239'
  },
  rejectionNoticeText: {
    fontSize: 12.5,
    color: '#9f1239',
    lineHeight: 18
  },
  reassignBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2
  },
  reassignBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  rejectedPillBadge: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  rejectedPillBadgeText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700'
  },
  headerReassignBtn: {
    backgroundColor: '#7a1521',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  headerReassignBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700'
  },
  rejectionBanner: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16
  },
  rejectionBannerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rejectionBannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#991b1b'
  },
  rejectionBannerDesc: {
    fontSize: 12.5,
    color: '#7f1d1d',
    marginTop: 3,
    lineHeight: 18
  },
  rejectionBannerReason: {
    fontSize: 12.5,
    color: '#991b1b',
    fontStyle: 'italic',
    marginTop: 2,
    fontWeight: '600'
  },
  rejectionBannerSubtext: {
    fontSize: 11.5,
    color: '#b91c1c',
    fontWeight: '600',
    marginTop: 6
  },
  reassignActionBtn: {
    backgroundColor: '#7a1521',
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12
  },
  reassignActionBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '700'
  },
  changeSupervisorBtn: {
    backgroundColor: '#fff0ef',
    borderWidth: 1,
    borderColor: '#ffd0cc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  changeSupervisorBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7a1521'
  },
  supervisorProfileBoxRejected: {
    borderWidth: 1.5,
    borderColor: '#fca5a5'
  },
  supervisorStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  remarksBox: {
    marginTop: 14,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#fecaca'
  },
  remarksHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  declinedBadge: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  declinedBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#b91c1c'
  },
  remarksLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6
  },
  remarksContentBox: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 8,
    padding: 12
  },
  remarksContentText: {
    fontSize: 13,
    color: '#9f1239',
    lineHeight: 18,
    fontWeight: '500'
  },
  equipmentTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff0ef',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffd0cc',
    padding: 4,
    marginBottom: 14
  },
  equipmentTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  equipmentTabActive: {
    backgroundColor: '#7a1521'
  },
  equipmentTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7a1521'
  },
  equipmentTabTextActive: {
    color: '#ffffff'
  },
  equipmentUnavailableBanner: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14
  },
  equipmentUnavailableTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9f1239'
  },
  equipmentUnavailableDesc: {
    fontSize: 11.5,
    color: '#be123c',
    marginTop: 2,
    lineHeight: 16
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepCircleText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ffffff'
  },
  supervisorSelectWrap: {
    gap: 6,
    marginTop: 6
  },
  supervisorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc'
  },
  supervisorOptionSelected: {
    borderColor: '#7a1521',
    backgroundColor: '#fff0ef'
  },
  supervisorOptionDisabled: {
    opacity: 0.6
  },
  supervisorOptionName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b'
  },
  supervisorOptionTrade: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  declinedTinyBadge: {
    backgroundColor: '#fee2e2',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  declinedTinyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b91c1c'
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    height: 42,
    marginTop: 6
  },
  dateTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b'
  },
  quickDateBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  quickDateBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569'
  },
  notesTextInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 10,
    fontSize: 13,
    color: '#1e293b',
    marginTop: 6,
    textAlignVertical: 'top'
  },
  confirmReassignBtn: {
    backgroundColor: '#7a1521',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#7a1521',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2
  },
  confirmReassignBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff'
  },
  successToast: {
    backgroundColor: '#059669',
    padding: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14
  },
  successToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b'
  },
  modalSub: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7a1521',
    marginTop: 1
  },
  modalCloseBtn: {
    padding: 6
  },
  modalWarningBox: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12
  },
  modalWarningText: {
    fontSize: 12,
    color: '#9f1239',
    lineHeight: 16
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6
  },
  supervisorSelectList: {
    maxHeight: 140,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    backgroundColor: '#f8fafc'
  },
  supervisorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  supervisorItemSelected: {
    backgroundColor: '#fff0ef'
  },
  supervisorItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e293b'
  },
  supervisorItemSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42
  },
  modalInput: {
    flex: 1,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  modalBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9'
  },
  cancelBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff'
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569'
  },
  confirmBtn: {
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#7a1521'
  },
  confirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff'
  }
});
