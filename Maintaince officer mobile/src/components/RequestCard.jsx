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

export default function RequestCard({
  request = {},
  onPress,
  style
}) {
  const reqId = request.id ? String(request.id).replace(/^#/, '') : '';
  const priority = request.priority || 'Medium';
  const priorityUpper = priority.toUpperCase();
  const title = request.title || (request.id ? `Request #${request.id}` : 'Maintenance Request');
  const location = request.location || '';
  const requesterName = request.requester?.name || request.requester_name || '';

  // Format timestamp (e.g. "10:25 AM")
  const getFormattedTime = () => {
    if (request.submittedDate) {
      const match = request.submittedDate.match(/\d{1,2}:\d{2}\s*(?:AM|PM)/i);
      if (match) return match[0];
      return request.submittedDate;
    }
    if (request.created_at) {
      try {
        const d = new Date(request.created_at);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }
      } catch (e) {}
    }
    return '';
  };

  const timeStr = getFormattedTime();

  // Determine real thumbnail image
  const getRealImageUri = () => {
    if (Array.isArray(request.evidence) && request.evidence.length > 0) {
      const first = request.evidence[0];
      const uri = first?.uri || first?.url || (typeof first === 'string' ? first : null);
      if (uri && typeof uri === 'string' && (uri.startsWith('http') || uri.startsWith('data:'))) {
        return uri;
      }
    }
    if (Array.isArray(request.images) && request.images.length > 0) {
      const first = request.images[0];
      const uri = first?.uri || first?.url || (typeof first === 'string' ? first : null);
      if (uri && typeof uri === 'string' && (uri.startsWith('http') || uri.startsWith('data:'))) {
        return uri;
      }
    }
    return null;
  };

  const realImageUri = getRealImageUri();

  // Determine category badge icon & tag
  const getCategoryMeta = () => {
    const cat = request.category || 'General';
    const text = (title + ' ' + cat + ' ' + location).toLowerCase();
    if (text.includes('ac') || text.includes('server') || text.includes('overheat') || text.includes('hvac')) {
      return {
        icon: Zap,
        iconColor: '#b91c1c',
        label: cat
      };
    }
    if (text.includes('water') || text.includes('pipe') || text.includes('leak') || text.includes('plumb')) {
      return {
        icon: Droplets,
        iconColor: '#0284c7',
        label: cat
      };
    }
    if (text.includes('electric') || text.includes('light') || text.includes('power')) {
      return {
        icon: Zap,
        iconColor: '#d97706',
        label: cat
      };
    }
    return {
      icon: Wrench,
      iconColor: '#475569',
      label: cat
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

  // Top card in Screenshot 2 has dark maroon button, second has light rose button
  const isUrgent = priorityUpper === 'CRITICAL' || request.status === 'Pending Review' || request.status === 'Pending';
  const buttonBg = isUrgent ? '#5c0612' : '#fee2e2';
  const buttonTextColor = isUrgent ? '#ffffff' : '#7a1521';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* Top Row: Priority Pill, REQ-ID, Timestamp */}
      <View style={styles.topRow}>
        <View style={styles.topLeftGroup}>
          <View style={[styles.priorityPill, { backgroundColor: priorityStyle.bg }]}>
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {priorityUpper}
            </Text>
          </View>
          <Text style={styles.reqIdText}>{reqId}</Text>
          {(request.status || '').toLowerCase() === 'accepted' && (
            <View style={{ backgroundColor: '#ecfdf5', borderColor: '#a7f3d0', borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, marginLeft: 4 }}>
              <Text style={{ color: '#059669', fontSize: 10, fontWeight: '700' }}>ACCEPTED</Text>
            </View>
          )}
        </View>

        <Text style={styles.timeText}>{timeStr}</Text>
      </View>

      {/* Middle Row: Image Thumbnail + Title, Location, Requester */}
      <View style={styles.middleRow}>
        <View style={styles.thumbnailBox}>
          {realImageUri ? (
            <Image
              source={{ uri: realImageUri }}
              style={styles.thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumbnailImage, { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' }]}>
              <CategoryIcon size={24} color={categoryMeta.iconColor} strokeWidth={2} />
            </View>
          )}
        </View>

        <View style={styles.contentCol}>
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>

          {location ? (
            <View style={styles.locationRow}>
              <MapPin size={13} color="#64748b" strokeWidth={2.2} />
              <Text style={styles.locationText} numberOfLines={1}>
                {location}
              </Text>
            </View>
          ) : null}

          {requesterName ? (
            <Text style={styles.requesterText} numberOfLines={1}>
              Requested by:{' '}
              <Text style={styles.requesterNameBold}>{requesterName}</Text>
            </Text>
          ) : null}
        </View>
      </View>

      {/* Bottom Row: Sub-op Tag + Review -> Button */}
      <View style={styles.bottomRow}>
        <View style={styles.categoryTagLeft}>
          <CategoryIcon size={14} color={categoryMeta.iconColor} strokeWidth={2.2} />
          <Text style={styles.categoryLabel}>{categoryMeta.label}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress}
          style={[styles.reviewBtn, { backgroundColor: buttonBg }]}
        >
          <Text style={[styles.reviewBtnText, { color: buttonTextColor }]}>Review</Text>
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
  reqIdText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b'
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
  requesterText: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 4
  },
  requesterNameBold: {
    color: '#334155',
    fontWeight: '600'
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
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8
  },
  reviewBtnText: {
    fontSize: 12.5,
    fontWeight: '700'
  }
});
