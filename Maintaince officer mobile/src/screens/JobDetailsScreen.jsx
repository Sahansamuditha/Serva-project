import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  StyleSheet,
  Alert,
  Share
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
  Share2
} from 'lucide-react-native';
import { StatusBadge, PriorityBadge } from '../components/Badge';
import { fetchJobById } from '../services/api';
import { COLORS } from '../theme/colors';

export default function JobDetailsScreen({ route, navigation }) {
  const jobId = route?.params?.jobId || null;
  const [job, setJob] = useState(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    if (!jobId) return;
    const data = await fetchJobById(jobId);
    if (data) setJob(data);
  };

  const handlePrint = async () => {
    try {
      await Share.share({
        message: `ITUM Work Order: #${job?.id || jobId}\nTitle: ${job?.title || 'Work Order'}\nLocation: ${job?.location || 'Campus'}\nAssigned to: ${job?.assignedPersonnel?.name || 'Unassigned'}\nStatus: ${job?.status || 'Pending'}`,
        title: `Work Order #${job?.id || jobId}`
      });
    } catch (e) {
      Alert.alert('Work Order', `Printing / Exporting Work Order #${job?.id || jobId}`);
    }
  };

  const imagesList = Array.isArray(job?.images) ? job.images : (Array.isArray(job?.evidence) ? job.evidence : []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Top Header Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={styles.jobId}>#{job?.id || jobId || 'JOB'}</Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {job?.priority ? <PriorityBadge priority={job.priority} /> : null}
            <StatusBadge status={job?.status || 'Pending'} />
          </View>
        </View>

        <Text style={styles.jobTitle}>{job?.title || (job?.id ? `Work Order #${job.id}` : 'Work Order Details')}</Text>

        <TouchableOpacity onPress={handlePrint} style={styles.printBtn}>
          <Share2 size={16} color="#7a1521" />
          <Text style={styles.printBtnText}>Share / Print Work Order</Text>
        </TouchableOpacity>
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

      {/* Assigned Personnel Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <User size={16} color="#7a1521" />
          <Text style={styles.cardHeading}>Assigned Personnel</Text>
        </View>

        {job?.assignedPersonnel?.name || job?.lead_person ? (
          <View style={styles.personnelRow}>
            <View style={styles.personnelAvatar}>
              <Text style={styles.personnelAvatarText}>
                {(((job?.assignedPersonnel?.name || job?.lead_person || 'TC').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('')) || 'TC').toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.personnelName}>{job?.assignedPersonnel?.name || job?.lead_person}</Text>
              <Text style={styles.personnelRole}>{job?.assignedPersonnel?.role || job?.assignedPersonnel?.trade || 'Technician'}</Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {job?.assignedPersonnel?.phone ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${job.assignedPersonnel.phone}`)}
                  style={styles.iconCircle}
                >
                  <Phone size={16} color="#475569" />
                </TouchableOpacity>
              ) : null}
              {job?.assignedPersonnel?.email ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`mailto:${job.assignedPersonnel.email}`)}
                  style={styles.iconCircle}
                >
                  <Mail size={16} color="#475569" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.descBox}>
            <Text style={[styles.descText, { color: '#94a3b8', fontStyle: 'italic' }]}>
              Unassigned - Waiting for Maintenance Officer allocation.
            </Text>
          </View>
        )}
      </View>

      {/* Action History Timeline */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
          <History size={16} color="#7a1521" />
          <Text style={styles.cardHeading}>Action History</Text>
        </View>

        <View style={styles.timelineList}>
          {(job?.history && job.history.length > 0 ? job.history : [
            ...(job?.created_at ? [{ title: 'Work Order Created', time: new Date(job.created_at).toLocaleString(), completed: true }] : [])
          ]).map((item, idx) => (
            <View key={idx} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: item.completed ? '#2563eb' : '#cbd5e1' }]} />
              <Text style={styles.timelineTitle}>{item.title}</Text>
              <Text style={styles.timelineTime}>{item.time || ''}</Text>
            </View>
          ))}
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
  }
});
