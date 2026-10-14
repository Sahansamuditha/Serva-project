import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import {
  MapPin,
  Zap,
  Droplets,
  Wrench,
  ArrowRight
} from 'lucide-react-native';

const serverRackImg = require('../../assets/server_rack.jpg');
const waterPipeImg = require('../../assets/water_pipe.jpg');
const electricalImg = require('../../assets/electrical_panel.png');
const acCompressorImg = require('../../assets/ac_compressor.png');

export default function JobCard({
  job = {},
  onPress,
  style
}) {
  const jobId = job.id ? String(job.id).replace(/^#/, '') : 'JOB-9165';
  const reqRef = job.requestRef || job.request_id || '';
  const priority = job.priority || 'Medium';
  const priorityUpper = priority.toUpperCase();
  const title = job.title || 'Work Order';
  const location = job.location || 'Science Building (Block S)';
  const assignedTeam = job.assignedTeam || job.team_name || job.assignedPersonnel?.name || 'Pradeep Kumara Team';

  // Format timestamp or ref
  const getFormattedTime = () => {
    if (job.reportedDate && job.reportedDate.includes(':')) {
      const match = job.reportedDate.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
      if (match) return match[0];
    }
    if (job.created_at) {
      try {
        const d = new Date(job.created_at);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) { }
    }
    return reqRef ? `Ref: #${reqRef}` : '03:58 PM';
  };

  const timeStr = getFormattedTime();

  // Determine thumbnail image
  const getThumbnailImage = () => {
    if (Array.isArray(job.evidence) && job.evidence.length > 0) {
      const first = job.evidence[0];
      if (first.uri && typeof first.uri === 'string' && (first.uri.startsWith('http') || first.uri.startsWith('data:'))) {
        return { uri: first.uri };
      }
    }
    if (Array.isArray(job.images) && job.images.length > 0) {
      const first = job.images[0];
      if (typeof first === 'string' && (first.startsWith('http') || first.startsWith('data:'))) {
        return { uri: first };
      }
    }

    const text = (title + ' ' + (job.category || '') + ' ' + location + ' ' + assignedTeam).toLowerCase();
    if (text.includes('ac') || text.includes('server') || text.includes('overheat') || text.includes('hvac')) {
      return serverRackImg;
    }
    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('plumb')) {
      return waterPipeImg;
    }
    if (text.includes('electric') || text.includes('light') || text.includes('panel') || text.includes('power')) {
      return electricalImg;
    }
    return acCompressorImg;
  };

  // Determine category badge icon & tag
  const getCategoryMeta = () => {
    const text = (title + ' ' + (job.category || '') + ' ' + location).toLowerCase();
    if (text.includes('ac') || text.includes('server') || text.includes('overheat') || text.includes('hvac')) {
      return {
        icon: Zap,
        iconColor: '#b91c1c',
        label: 'Server Operations Tier 1'
      };
    }
    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('plumb')) {
      return {
        icon: Droplets,
        iconColor: '#0284c7',
        label: 'Isolation Valve Shut Off'
      };
    }
    if (text.includes('electric') || text.includes('light') || text.includes('panel')) {
      return {
        icon: Zap,
        iconColor: '#d97706',
        label: 'Electrical Distribution Sub-panel'
      };
    }
    return {
      icon: Wrench,
      iconColor: '#475569',
      label: job.category ? `${job.category} Operations` : 'Facility Technical Ops'
    };
  };

  const categoryMeta = getCategoryMeta();
  const CategoryIcon = categoryMeta.icon;

  // Determine Priority pill styling
  const getPriorityStyle = () => {
    if (priorityUpper === 'CRITICAL') {
      return {
        bg: '#fee2e2',
        text: '#dc2626'
      };
    }
    if (priorityUpper === 'HIGH') {
      return {
        bg: '#fee2e2',
        text: '#c2410c'
      };
    }
    if (priorityUpper === 'MEDIUM') {
      return {
        bg: '#fef3c7',
        text: '#b45309'
      };
    }
    return {
      bg: '#f1f5f9',
      text: '#475569'
    };
  };

  const priorityStyle = getPriorityStyle();

  const isUrgent = priorityUpper === 'CRITICAL';
  const buttonBg = isUrgent ? '#5c0612' : '#fee2e2';
  const buttonTextColor = isUrgent ? '#ffffff' : '#7a1521';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        style
      ]}
    >
      {/* Top Row: Checkbox, Priority Pill, Job ID, and Time/Ref */}
      <View style={styles.topRow}>
        <View style={styles.topLeftGroup}>
          <View style={[styles.priorityPill, { backgroundColor: priorityStyle.bg }]}>
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {priorityUpper}
            </Text>
          </View>

          <Text style={styles.jobIdText}>#{jobId}</Text>
        </View>

        <Text style={styles.timeText}>{timeStr}</Text>
      </View>

      {/* Middle Row: Image Thumbnail + Title, Location, Assigned Team */}
      <View style={styles.middleRow}>
        <View style={styles.thumbnailBox}>
          <Image
            source={getThumbnailImage()}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.contentCol}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.locationRow}>
            <MapPin size={13} color="#64748b" strokeWidth={2.2} />
            <Text style={styles.locationText} numberOfLines={1}>
              {location}
            </Text>
          </View>

          <Text style={styles.teamText} numberOfLines={1}>
            Assigned: <Text style={styles.teamNameBold}>{assignedTeam}</Text>
          </Text>
        </View>
      </View>

      {/* Bottom Row: Sub-op Tag + Manage -> Button */}
      <View style={styles.bottomRow}>
        <View style={styles.categoryTagLeft}>
          <CategoryIcon size={14} color={categoryMeta.iconColor} strokeWidth={2.2} />
          <Text style={styles.categoryLabel}>{categoryMeta.label}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={[styles.manageBtn, { backgroundColor: buttonBg }]}
        >
          <Text style={[styles.manageBtnText, { color: buttonTextColor }]}>Manage</Text>
          <ArrowRight size={13} color={buttonTextColor} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12
  },
  priorityText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  jobIdText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7a1521'
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b'
  },
  middleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  thumbnailBox: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9'
  },
  thumbnailImage: {
    width: '100%',
    height: '100%'
  },
  contentCol: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center'
  },
  titleText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 20
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4
  },
  locationText: {
    fontSize: 12.5,
    color: '#64748b',
    flex: 1
  },
  teamText: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 4
  },
  teamNameBold: {
    color: '#334155',
    fontWeight: '700'
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14
  },
  categoryTagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  manageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8
  },
  manageBtnText: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});
