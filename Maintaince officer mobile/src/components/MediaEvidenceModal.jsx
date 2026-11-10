import React from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { X, Play, Image as ImageIcon } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function MediaEvidenceModal({ visible, onClose, mediaItem, mediaType }) {
  if (!visible) return null;

  const item = typeof mediaItem === 'object' && mediaItem !== null ? mediaItem : { id: mediaType, label: 'Evidence Item' };
  const rawUrl = item.uri || item.url || (typeof mediaItem === 'string' ? mediaItem : '');
  const isVideo = item.type === 'video' || (typeof rawUrl === 'string' && rawUrl.match(/\.(mp4|mov|webm)$/i));
  const title = item.label || item.name || (isVideo ? 'Video Evidence' : 'Photo Evidence');

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Media Viewer Display */}
          <View style={styles.displayArea}>
            {rawUrl && !isVideo ? (
              <Image
                source={{ uri: rawUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            ) : isVideo ? (
              <View style={styles.contentBox}>
                <View style={styles.playCircle}>
                  <Play size={28} color="#ef4444" style={{ marginLeft: 3 }} />
                </View>
                <Text style={styles.mediaTitle}>{title}</Text>
                {rawUrl ? (
                  <Text style={styles.mediaSub} numberOfLines={1}>{rawUrl}</Text>
                ) : null}
              </View>
            ) : (
              <View style={styles.contentBox}>
                <View style={[styles.playCircle, { backgroundColor: '#334155' }]}>
                  <ImageIcon size={28} color="#ffffff" />
                </View>
                <Text style={styles.mediaTitle}>{title}</Text>
                {item.sub || item.description ? (
                  <Text style={styles.mediaSub}>{item.sub || item.description}</Text>
                ) : null}
              </View>
            )}
          </View>

          <TouchableOpacity onPress={onClose} style={styles.dismissBtn}>
            <Text style={styles.dismissBtnText}>Close Preview</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 380,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b'
  },
  closeBtn: {
    padding: 4
  },
  displayArea: {
    height: 220,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  contentBox: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 6
  },
  mediaSub: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center'
  },
  dismissBtn: {
    marginTop: 16,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  dismissBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8
  }
});
