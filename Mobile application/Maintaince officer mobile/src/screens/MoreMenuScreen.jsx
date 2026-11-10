import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform,
  Modal
} from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import {
  IdCard,
  Bell,
  RotateCcw,
  FileCode,
  Phone,
  LogOut,
  ChevronRight,
  ShieldAlert,
  PhoneCall,
  Smartphone,
  Mail,
  MapPin,
  Clock,
  X,
  UserCheck
} from 'lucide-react-native';
import OfficerProfileCard from '../components/OfficerProfileCard';
import { COLORS } from '../theme/colors';

export default function MoreMenuScreen({ navigation, userProfile }) {
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


  const [showContactModal, setShowContactModal] = useState(false);
  const [adminContact, setAdminContact] = useState({
    name: 'System Administrator',
    designation: 'ITUM System Administrator & Security Control',
    department: 'ITUM Central Administration',
    phone: '+94 11 265 0301',
    mobile: '+94 77 123 4567',
    extension: 'Ext: 402',
    email: 'admin@itum.mrt.ac.lk',
    location: 'Sector 1 - Admin Complex, ITUM, Diyagama',
    hours: '24/7 Operations & Emergency Dispatch Desk'
  });

  useEffect(() => {
    if (typeof fetch !== 'undefined') {
      fetch('/api/users')
        .then((res) => res.json())
        .then((data) => {
          const users = data.users || data.data || (Array.isArray(data) ? data : []);
          const admin = users.find(
            (u) =>
              (u.role && u.role.toLowerCase() === 'admin') ||
              (u.username && u.username.toLowerCase() === 'admin')
          );
          if (admin) {
            const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim() || admin.name || 'System Administrator';
            setAdminContact((prev) => ({
              ...prev,
              name: fullName,
              email: admin.email || prev.email,
              phone: admin.phone || prev.phone,
              department: admin.department || prev.department,
              designation: admin.designation || prev.designation
            }));
          }
        })
        .catch(() => {});
    }
  }, []);



  const handleCall = (number) => {
    const cleaned = (number || '').replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert('Hotline Number', `${number}\n\nCall could not be launched directly from browser.`);
    });
  };

  const handleEmail = (emailAddr) => {
    Linking.openURL(`mailto:${emailAddr}`).catch(() => {
      Alert.alert('Admin Email', emailAddr);
    });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      // Notify parent unified portal to show centered confirmation modal
      window.parent.postMessage({ type: 'SERVA_REQUEST_LOGOUT' }, '*');
      return;
    }

    const doLogout = () => {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.removeItem('serva_auth');
          window.sessionStorage.clear();
        } catch (e) {}

        const host = window.location.hostname || 'localhost';
        window.location.href = `http://${host}:3001`;
      }
    };

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const existing = document.getElementById('serva-logout-modal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'serva-logout-modal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:9999999;padding:16px;font-family:sans-serif;';
      modal.innerHTML = `
        <div style="background:#fff;border-radius:24px;padding:24px;max-width:320px;width:100%;text-align:center;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border:1px solid #e2e8f0;">
          <div style="width:52px;height:52px;border-radius:16px;background:#fee2e2;color:#dc2626;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px;">🚪</div>
          <h3 style="margin:0;font-size:18px;font-weight:800;color:#1e293b;">Log Out</h3>
          <p style="margin:8px 0 20px;font-size:12px;color:#64748b;line-height:1.4;">Are you sure you want to log out of ITUM Serva Maintenance System?</p>
          <div style="display:flex;gap:10px;">
            <button id="serva-m-cancel" style="flex:1;padding:10px;border-radius:12px;border:1px solid #e2e8f0;background:#fff;color:#475569;font-weight:700;font-size:12px;cursor:pointer;">Cancel</button>
            <button id="serva-m-ok" style="flex:1;padding:10px;border-radius:12px;border:none;background:#dc2626;color:#fff;font-weight:700;font-size:12px;cursor:pointer;">Log Out</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('serva-m-cancel').onclick = () => modal.remove();
      document.getElementById('serva-m-ok').onclick = () => {
        modal.remove();
        doLogout();
      };
    } else {
      Alert.alert(
        'Log Out',
        'Are you sure you want to log out of ITUM Serva Maintenance System?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log Out',
            style: 'destructive',
            onPress: doLogout
          }
        ]
      );
    }
  };

  const navigateToSettings = (tabName) => {
    try {
      const parentNav = navigation.getParent ? navigation.getParent() : null;
      if (parentNav) {
        parentNav.navigate('Settings', { tab: tabName });
      } else {
        navigation.navigate('Settings', { tab: tabName });
      }
    } catch (err) {
      navigation.navigate('Settings', { tab: tabName });
    }
  };

  const menuSections = [
    {
      title: 'Institutional Identity',
      items: [
        {
          label: 'Officer Profile & ID Card',
          sub: 'EMP-MO-104 • Extension Ext: 218',
          icon: IdCard,
          color: '#2563eb', // Vibrant Blue theme from Screenshot 2
          onPress: () => navigateToSettings('profile')
        }
      ]
    },
    {
      title: 'System & Controls',
      badge: '3 Modules',
      items: [
        {
          label: 'Notifications & Alerts',
          sub: 'Push chime, Urgent SOS buzzer, SMS',
          icon: Bell,
          color: '#d97706', // Amber theme from Screenshot 2
          hasDot: true,
          onPress: () => navigateToSettings('notifications')
        },
        {
          label: 'Security & Passwords',
          sub: 'Password & session security',
          icon: RotateCcw,
          color: '#7c3aed', // Purple theme from Screenshot 2
          onPress: () => navigateToSettings('security')
        },
        {
          label: 'System Logs',
          sub: 'Audit trail, error reports, session activity',
          icon: FileCode,
          color: '#475569', // Slate theme from Screenshot 2
          onPress: () => navigateToSettings('logs')
        }
      ]
    },
    {
      title: 'Institutional Compliance & SOS',
      items: [
        {
          label: 'Emergency Dispatch Hotline',
          sub: 'Direct line to Security & Control (Ext: 402)',
          subColor: '#b91c1c',
          icon: Phone,
          color: '#dc2626', // Emergency Red theme from Screenshot 2
          rightIcon: Phone,
          rightIconColor: '#b91c1c',
          onPress: () => setShowContactModal(true)
        }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Officer Executive Card */}
        <OfficerProfileCard userProfile={userProfile} style={{ marginBottom: 20 }} />

        {/* Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.badge ? (
                <Text style={styles.sectionBadgeText}>{section.badge}</Text>
              ) : null}
            </View>

            <View style={styles.sectionCard}>
              {section.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={iIdx}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                    style={[
                      styles.menuRow,
                      iIdx < section.items.length - 1 && styles.menuRowBorder
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                      <Icon size={18} color={item.color} strokeWidth={2.2} />
                    </View>

                    <View style={{ flex: 1, marginLeft: 12, marginRight: 8 }}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      <Text
                        style={[
                          styles.menuSub,
                          item.subColor ? { color: item.subColor, fontWeight: '600' } : null
                        ]}
                        numberOfLines={1}
                      >
                        {item.sub}
                      </Text>
                    </View>

                    <View style={styles.rightActionWrap}>
                      {item.hasDot ? (
                        <View style={styles.unreadDot} />
                      ) : null}

                      {item.rightText ? (
                        <Text style={styles.rightTagText}>{item.rightText}</Text>
                      ) : null}

                      {item.rightIcon ? (
                        <item.rightIcon size={18} color={item.rightIconColor || '#b91c1c'} strokeWidth={2.2} />
                      ) : (
                        <ChevronRight size={16} color="#94a3b8" strokeWidth={2.2} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
          <LogOut size={16} color="#dc2626" strokeWidth={2.2} />
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </TouchableOpacity>

        {/* App Info Footer */}
        <View style={styles.infoFooter}>
          <Text style={styles.infoTitle}>ITUM Maintenance Monitoring System</Text>
          <Text style={styles.infoVersion}>Mobile App Version 1.0.0 (Expo React Native)</Text>
          <Text style={styles.infoCopy}>© 2026 Institute of Technology, University of Moratuwa</Text>
        </View>
      </ScrollView>

      {/* Administrator & Emergency Dispatch Contact Details Modal */}
      <Modal
        visible={showContactModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.modalHeaderIconWrap}>
                  <ShieldAlert size={20} color="#ffffff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalHeaderSub}>ITUM CENTRAL FACILITIES</Text>
                  <Text style={styles.modalHeaderTitle}>Administrator Contact Details</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowContactModal(false)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <X size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Modal Scrollable Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Officer / Admin Highlight Card */}
              <View style={styles.adminCard}>
                <View style={styles.adminAvatarWrap}>
                  <UserCheck size={22} color="#ffffff" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.adminName} numberOfLines={1}>
                    {adminContact.name}
                  </Text>
                  <Text style={styles.adminDesignation} numberOfLines={1}>
                    {adminContact.designation}
                  </Text>
                  <Text style={styles.adminDept} numberOfLines={1}>
                    {adminContact.department}
                  </Text>
                </View>
              </View>

              {/* Contact Item: Direct Line & Hotline */}
              <View style={styles.contactItem}>
                <View style={[styles.contactIconBox, { backgroundColor: '#fee2e2' }]}>
                  <PhoneCall size={17} color="#dc2626" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.contactItemLabel}>DIRECT LINE &amp; HOTLINE</Text>
                  <Text style={styles.contactItemValue}>
                    {adminContact.phone}{' '}
                    <Text style={{ color: '#b91c1c', fontWeight: '800' }}>({adminContact.extension})</Text>
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(adminContact.phone)}
                  style={styles.contactActionBtn}
                  activeOpacity={0.8}
                >
                  <Phone size={12} color="#ffffff" />
                  <Text style={styles.contactActionBtnText}>Call</Text>
                </TouchableOpacity>
              </View>

              {/* Contact Item: Mobile Number */}
              <View style={styles.contactItem}>
                <View style={[styles.contactIconBox, { backgroundColor: '#dcfce7' }]}>
                  <Smartphone size={17} color="#15803d" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.contactItemLabel}>EMERGENCY MOBILE</Text>
                  <Text style={styles.contactItemValue}>{adminContact.mobile}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleCall(adminContact.mobile)}
                  style={styles.contactActionBtn}
                  activeOpacity={0.8}
                >
                  <Phone size={12} color="#ffffff" />
                  <Text style={styles.contactActionBtnText}>Call</Text>
                </TouchableOpacity>
              </View>

              {/* Contact Item: Admin Email */}
              <View style={styles.contactItem}>
                <View style={[styles.contactIconBox, { backgroundColor: '#dbeafe' }]}>
                  <Mail size={17} color="#1d4ed8" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.contactItemLabel}>ADMIN EMAIL</Text>
                  <Text style={styles.contactItemValue} numberOfLines={1}>
                    {adminContact.email}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleEmail(adminContact.email)}
                  style={[styles.contactActionBtn, { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#cbd5e1' }]}
                  activeOpacity={0.8}
                >
                  <Mail size={12} color="#1e293b" />
                  <Text style={[styles.contactActionBtnText, { color: '#1e293b' }]}>Email</Text>
                </TouchableOpacity>
              </View>

              {/* Contact Item: Office Location */}
              <View style={styles.contactItem}>
                <View style={[styles.contactIconBox, { backgroundColor: '#fef3c7' }]}>
                  <MapPin size={17} color="#b45309" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.contactItemLabel}>OFFICE LOCATION</Text>
                  <Text style={styles.contactItemValue}>{adminContact.location}</Text>
                </View>
              </View>

              {/* Contact Item: Operational Hours */}
              <View style={styles.contactItem}>
                <View style={[styles.contactIconBox, { backgroundColor: '#f3e8ff' }]}>
                  <Clock size={17} color="#7e22ce" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.contactItemLabel}>OPERATIONAL HOURS</Text>
                  <Text style={styles.contactItemValue}>{adminContact.hours}</Text>
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>


              <TouchableOpacity
                onPress={() => setShowContactModal(false)}
                style={styles.modalCloseActionBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseActionBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff'
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e293b'
  },
  profileRole: {
    fontSize: 12.5,
    color: '#7a1521',
    fontWeight: '600',
    marginTop: 1
  },
  profileDept: {
    fontSize: 11.5,
    color: '#64748b'
  },
  crestWrap: {
    padding: 4
  },
  sectionWrap: {
    marginBottom: 20
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.6
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7a1521'
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b'
  },
  menuSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  rightActionWrap: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#7a1521',
    marginRight: 8
  },
  rightTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginRight: 6
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 6
  },
  logoutBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#dc2626'
  },
  infoFooter: {
    marginTop: 24,
    alignItems: 'center'
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569'
  },
  infoVersion: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2
  },
  infoCopy: {
    fontSize: 10.5,
    color: '#94a3b8',
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    maxHeight: '85%'
  },
  modalHeader: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  modalHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalHeaderSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: 0.8
  },
  modalHeaderTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    padding: 16
  },
  adminCard: {
    backgroundColor: '#fff0ef',
    borderColor: '#ffdad9',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  adminAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  adminName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b'
  },
  adminDesignation: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7a1521',
    marginTop: 1
  },
  adminDept: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1
  },
  contactItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  contactIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  contactItemLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.4
  },
  contactItemValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 1
  },
  contactActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7a1521',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8
  },
  contactActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff'
  },
  modalFooter: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  modalCopyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 10,
    borderRadius: 10
  },
  modalCopyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b'
  },
  modalCloseActionBtn: {
    flex: 1,
    backgroundColor: '#7a1521',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCloseActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  }
});
