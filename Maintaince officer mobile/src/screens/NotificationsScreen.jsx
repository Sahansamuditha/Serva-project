import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl
} from 'react-native';
import {
  CheckCheck,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Check,
  X
} from 'lucide-react-native';
import {
  fetchNotifications,
  updateNotification,
  markAllNotificationsRead
} from '../services/api';
import { COLORS } from '../theme/colors';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifs = async () => {
    const data = await fetchNotifications();
    if (data) setNotifications(data);
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifs();
    setRefreshing(false);
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    loadNotifs();
  };

  const handleMarkRead = async (id) => {
    await updateNotification(id, { read: true });
    loadNotifs();
  };

  const handleDismiss = async (id) => {
    await updateNotification(id, { dismiss: true });
    loadNotifs();
  };

  const filtered = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const renderIcon = (type) => {
    switch (type) {
      case 'urgent':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <AlertTriangle size={18} color="#f59e0b" />
          </View>
        );
      case 'completed':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}>
            <CheckCircle size={18} color="#10b981" />
          </View>
        );
      case 'system':
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' }]}>
            <Info size={18} color="#8b5cf6" />
          </View>
        );
      default:
        return (
          <View style={[styles.iconWrap, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
            <FileText size={18} color="#2563eb" />
          </View>
        );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7a1521']} />}
    >
      {/* Header & Quick Actions */}
      <View style={styles.headerTitleGroup}>
        <Text style={styles.pageTitle}>Notification Center</Text>
        <Text style={styles.pageSubtitle}>
          Manage and view all facility alerts and operations updates.
        </Text>
      </View>

      <View style={styles.topActionsRow}>
        <TouchableOpacity onPress={handleMarkAll} style={styles.actionBtn}>
          <CheckCheck size={15} color="#475569" />
          <Text style={styles.actionBtnText}>Mark all as read</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Settings', { tab: 'notifications' })}
          style={[styles.actionBtn, styles.settingsBtn]}
        >
          <Settings size={15} color="#ffffff" />
          <Text style={[styles.actionBtnText, { color: '#ffffff' }]}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('all')}
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All Notifications ({notifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('unread')}
          style={[styles.tab, activeTab === 'unread' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'unread' && styles.tabTextActive]}>
            Unread ({notifications.filter(n => !n.read).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      <View style={styles.listContainer}>
        {filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No notifications found in this view.</Text>
          </View>
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
              <View style={styles.notifHeaderRow}>
                {renderIcon(item.type)}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.notifTitle}>{item.title}</Text>
                    <Text style={styles.notifTime}>{item.time}</Text>
                  </View>
                  <Text style={styles.notifMessage}>{item.message}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.notifFooterRow}>
                {(() => {
                  const targetReqId = item.requestId || (() => {
                    const m = (item.link || item.title || item.message || '').match(/REQ-\d+/i);
                    return m ? m[0].toUpperCase() : null;
                  })();
                  if (!targetReqId) return null;
                  return (
                    <TouchableOpacity
                      onPress={() => navigation.navigate('RequestReview', { requestId: targetReqId })}
                      style={styles.directActionBtn}
                    >
                      <Text style={styles.directActionText}>
                        {item.type === 'urgent' ? 'Assign Job' : item.type === 'completed' ? 'Review Details' : 'View Details'}
                      </Text>
                    </TouchableOpacity>
                  );
                })()}

                <View style={{ flexDirection: 'row', gap: 12, marginLeft: 'auto' }}>
                  {!item.read && (
                    <TouchableOpacity onPress={() => handleMarkRead(item.id)} style={styles.inlineAction}>
                      <Check size={13} color="#64748b" />
                      <Text style={styles.inlineActionText}>Mark read</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity onPress={() => handleDismiss(item.id)} style={styles.inlineAction}>
                    <X size={13} color="#64748b" />
                    <Text style={styles.inlineActionText}>Dismiss</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Load Older */}
      <TouchableOpacity
        onPress={() => Alert.alert('Notifications', 'All older notifications are already up to date.')}
        style={styles.loadOlderBtn}
      >
        <Text style={styles.loadOlderText}>Load older notifications</Text>
      </TouchableOpacity>
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
  headerTitleGroup: {
    marginBottom: 12
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
  topActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6
  },
  settingsBtn: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  actionBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#475569'
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginBottom: 14
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabActive: {
    borderBottomColor: '#7a1521'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b'
  },
  tabTextActive: {
    color: '#7a1521',
    fontWeight: '700'
  },
  listContainer: {
    gap: 12
  },
  notifCard: {
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
  notifCardUnread: {
    backgroundColor: '#fffdfd',
    borderColor: '#ffdad9'
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b'
  },
  notifTime: {
    fontSize: 11,
    color: '#94a3b8'
  },
  notifMessage: {
    fontSize: 12.5,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18
  },
  notifFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc'
  },
  directActionBtn: {
    paddingVertical: 3
  },
  directActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7a1521'
  },
  inlineAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  inlineActionText: {
    fontSize: 11.5,
    color: '#64748b'
  },
  emptyCard: {
    padding: 30,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8'
  },
  loadOlderBtn: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center'
  },
  loadOlderText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b'
  }
});
