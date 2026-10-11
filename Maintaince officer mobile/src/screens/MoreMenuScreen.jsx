import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Platform
} from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import {
  IdCard,
  Bell,
  RotateCcw,
  Languages,
  FileCode,
  Phone,
  LogOut,
  ChevronRight
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

  const [selectedLang, setSelectedLang] = useState('English');

  const handleLanguagePress = () => {
    Alert.alert(
      'Select Language & Region',
      'Choose your preferred institutional language for ITUM Serva Platform:',
      [
        { text: 'English (UK) • Default', onPress: () => setSelectedLang('English') },
        { text: 'සිංහල (Sinhala)', onPress: () => setSelectedLang('සිංහල') },
        { text: 'தமிழ் (Tamil)', onPress: () => setSelectedLang('தமிழ்') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Dispatch Hotline',
      'ITUM Security & Maintenance Rapid Dispatch Control\n\nDirect Hotline: Ext 402 / +94 11 265 0301\nPriority: Code Red Institutional Emergency',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Dispatch (Ext 402)',
          style: 'destructive',
          onPress: () => {
            Linking.openURL('tel:402').catch(() => {
              Alert.alert('Simulated Call', 'Connected to ITUM Security & Maintenance Rapid Dispatch Control (Ext: 402)');
            });
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of ITUM Serva Maintenance System?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => Alert.alert('Logged Out', 'You have been logged out.') }
      ]
    );
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
      badge: '4 Modules',
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
          sub: '2FA active, biometric PIN lock',
          icon: RotateCcw,
          color: '#7c3aed', // Purple theme from Screenshot 2
          onPress: () => navigateToSettings('security')
        },
        {
          label: 'Language & Region',
          sub: 'English (UK) • LK Locale',
          icon: Languages,
          color: '#059669', // Emerald/Green theme from Screenshot 2
          rightText: selectedLang,
          onPress: () => navigateToSettings('language')
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
          onPress: handleEmergencyCall
        }
      ]
    }
  ];

  return (
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
  }
});
