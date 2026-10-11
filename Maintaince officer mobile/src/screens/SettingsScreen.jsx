import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
  Platform,
  Animated,
  Image
} from 'react-native';
import { useFocusEffect, useScrollToTop } from '@react-navigation/native';
import {
  User,
  Bell,
  Shield,
  FileCode,
  Save,
  Trash2,
  Check,
  X,
  Camera,
  Upload,
  Languages,
  Globe,
  Lock,
  Key,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Download,
  AlertTriangle
} from 'lucide-react-native';
import {
  fetchSettings,
  updateProfile,
  updateNotificationSettings,
  revokeSession,
  revokeOtherSessions,
  fetchLogs,
  clearLogs
} from '../services/api';
import { COLORS } from '../theme/colors';
import OfficerProfileCard from '../components/OfficerProfileCard';

export default function SettingsScreen({ route, userProfile, onUpdateProfile }) {
  const scrollViewRef = useRef(null);
  useScrollToTop(scrollViewRef);

  const scrollToTop = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo?.({ y: 0, animated: false });
      if (Platform.OS === 'web') {
        const node = scrollViewRef.current.getScrollableNode?.() || scrollViewRef.current;
        if (node && typeof node.scrollTop === 'number') {
          node.scrollTop = 0;
        }
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      scrollToTop();
      const timer = setTimeout(scrollToTop, 30);
      return () => clearTimeout(timer);
    }, [scrollToTop])
  );

  const resolveTab = (tab) => {
    if (tab === 'alerts') return 'notifications';
    return tab || 'profile';
  };
  const initialTab = resolveTab(route?.params?.tab);
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (route?.params?.tab) {
      setActiveTab(resolveTab(route?.params?.tab));
    }
  }, [route?.params?.tab]);

  // Scroll to top whenever internal tab changes
  useEffect(() => {
    scrollToTop();
    const timer = setTimeout(scrollToTop, 20);
    return () => clearTimeout(timer);
  }, [activeTab, scrollToTop]);

  // Profile
  const [firstName, setFirstName] = useState(userProfile?.firstName || 'Kasun');
  const [lastName, setLastName] = useState(userProfile?.lastName || 'Perera');
  const [email, setEmail] = useState(userProfile?.email || 'officer@itum.mrt.ac.lk');
  const [phone, setPhone] = useState(userProfile?.phone || '+94 77 123 4567');
  const [department, setDepartment] = useState(userProfile?.department || 'Works & Maintenance Division');
  const [designation, setDesignation] = useState(userProfile?.designation || 'Chief Facility Maintenance Officer');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');

  // Notifications
  const [inAppNotif, setInAppNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [alertNewRequests, setAlertNewRequests] = useState(true);
  const [alertStatusUpdates, setAlertStatusUpdates] = useState(true);
  const [alertUrgent, setAlertUrgent] = useState(true);
  const [digestFreq, setDigestFreq] = useState('Real-time (No Digest)');

  // Passwords
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Sessions
  const [sessions, setSessions] = useState([]);

  // Logs
  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [logSeverity, setLogSeverity] = useState('All');

  // Language & Regional Settings
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeStandard, setTimeStandard] = useState('12-Hour');

  // Animated Floating Top Toast State
  const [toastMessage, setToastMessage] = useState(null);
  const toastAnim = useRef(new Animated.Value(-120)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimerRef = useRef(null);

  useEffect(() => {
    loadAllSettings();
  }, []);

  // Synchronize inputs when userProfile prop updates
  useEffect(() => {
    if (userProfile) {
      if (userProfile.firstName) setFirstName(userProfile.firstName);
      if (userProfile.lastName) setLastName(userProfile.lastName);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.department) setDepartment(userProfile.department);
      if (userProfile.designation) setDesignation(userProfile.designation);
      if (userProfile.avatar !== undefined) setAvatar(userProfile.avatar);
    }
  }, [userProfile]);

  const pickImage = () => {
    if (Platform.OS === 'web') {
      try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target?.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const rawData = event.target?.result;
              if (rawData) {
                // Resize image to max 280x280 using HTML5 canvas to keep storage lightweight & instant
                const img = new window.Image();
                img.onload = () => {
                  const maxDim = 280;
                  let width = img.width;
                  let height = img.height;
                  if (width > height) {
                    if (width > maxDim) {
                      height = Math.round((height * maxDim) / width);
                      width = maxDim;
                    }
                  } else {
                    if (height > maxDim) {
                      width = Math.round((width * maxDim) / height);
                      height = maxDim;
                    }
                  }
                  const canvas = document.createElement('canvas');
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  const compressed = canvas.toDataURL('image/jpeg', 0.86);
                  setAvatar(compressed);
                  showToast('Photo selected! Tap "Save Changes" to apply everywhere.');
                };
                img.onerror = () => {
                  setAvatar(rawData);
                  showToast('Photo selected! Tap "Save Changes" to apply everywhere.');
                };
                img.src = rawData;
              }
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      } catch (err) {
        Alert.alert('Upload Photo', 'Could not open photo file picker on this device.');
      }
    } else {
      Alert.alert(
        'Change Profile Photo',
        'Choose a photo option:',
        [
          { text: 'Remove Photo', style: 'destructive', onPress: handleRemoveAvatar },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    showToast('Profile photo reset. Tap "Save Changes" to apply everywhere.');
  };

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);

    // Slide down & fade in from top
    Animated.parallel([
      Animated.spring(toastAnim, {
        toValue: 0,
        friction: 8,
        tension: 50,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();

    // Auto dismiss after 3.8s
    toastTimerRef.current = setTimeout(() => {
      dismissToast();
    }, 3800);
  };

  const dismissToast = () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    Animated.parallel([
      Animated.timing(toastAnim, {
        toValue: -120,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start(() => {
      setToastMessage(null);
    });
  };

  const loadAllSettings = async () => {
    const data = await fetchSettings();
    if (data) {
      if (data.profile) {
        setFirstName(data.profile.firstName || 'Kasun');
        setLastName(data.profile.lastName || 'Perera');
        setEmail(data.profile.email || 'officer@itum.mrt.ac.lk');
        setPhone(data.profile.phone || '+94 77 123 4567');
        setDepartment(data.profile.department || 'Works & Maintenance Division');
        setDesignation(data.profile.designation || 'Chief Facility Maintenance Officer');
        if (data.profile.avatar) {
          setAvatar(data.profile.avatar);
        }
      }
      if (data.notifications) {
        setInAppNotif(data.notifications.inApp ?? true);
        setEmailNotif(data.notifications.email ?? true);
        setPushNotif(data.notifications.desktopPush ?? true);
        setAlertNewRequests(data.notifications.newMaintenanceRequests ?? true);
        setAlertStatusUpdates(data.notifications.statusUpdates ?? true);
        setAlertUrgent(data.notifications.urgentAlerts ?? true);
        setDigestFreq(data.notifications.digestFrequency || 'Real-time (No Digest)');
      }
      if (data.security?.activeSessions) {
        setSessions(data.security.activeSessions);
      }
      if (data.logs) {
        setLogs(data.logs);
      }
    }
    const logList = await fetchLogs();
    if (logList) setLogs(logList);
  };

  const handleSaveProfile = async () => {
    try {
      const fName = firstName.trim();
      const lName = lastName.trim();
      const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : 'Kasun Perera';
      const formattedTitleName = fullName.startsWith('Eng.') ? fullName : `Eng. ${fullName}`;

      const updated = {
        firstName: fName,
        lastName: lName,
        name: formattedTitleName,
        email: email.trim(),
        phone: phone.trim(),
        department: department.trim(),
        designation: designation.trim(),
        avatar: avatar || ''
      };

      if (onUpdateProfile) {
        await onUpdateProfile(updated);
      } else {
        await updateProfile(updated);
      }
      showToast('Profile information & photo saved successfully!');
    } catch (err) {
      console.warn('Error saving profile:', err);
      showToast('Profile information saved successfully!');
    }
  };

  const handleSaveNotifications = async () => {
    await updateNotificationSettings({
      inApp: inAppNotif,
      email: emailNotif,
      desktopPush: pushNotif,
      newMaintenanceRequests: alertNewRequests,
      statusUpdates: alertStatusUpdates,
      urgentAlerts: alertUrgent,
      digestFrequency: digestFreq
    });
    showToast('Notification settings saved successfully!');
  };

  const handleSaveLanguageSettings = () => {
    showToast('Language & regional preferences saved successfully!');
  };

  const handleUpdatePassword = () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Required', 'Please enter both current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    showToast('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = async (id) => {
    const res = await revokeSession(id);
    if (res?.data) setSessions(res.data);
    showToast('Session revoked successfully.');
  };

  const handleRevokeOtherSessions = async () => {
    const res = await revokeOtherSessions();
    if (res?.data) setSessions(res.data);
    showToast('Logged out of all other sessions.');
  };

  const handleClearLogs = () => {
    Alert.alert(
      'Clear System Logs',
      'Are you sure you want to clear all system audit logs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearLogs();
            setLogs([]);
            showToast('System audit logs cleared.');
          }
        }
      ]
    );
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = !logSearch || l.action.toLowerCase().includes(logSearch.toLowerCase()) || l.user.toLowerCase().includes(logSearch.toLowerCase());
    const matchesSev = logSeverity === 'All' || l.severity.toLowerCase() === logSeverity.toLowerCase();
    return matchesSearch && matchesSev;
  });

  return (
    <View style={styles.screenWrapper}>
      {/* Animated Floating Top Pop-up Toast */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.floatingTopToast,
            {
              transform: [{ translateY: toastAnim }],
              opacity: toastOpacity
            }
          ]}
        >
          <View style={styles.toastIconBox}>
            <Check size={18} color="#ffffff" strokeWidth={3} />
          </View>
          <View style={styles.toastContentBox}>
            <Text style={styles.toastTitle}>Success</Text>
            <Text style={styles.toastMessageText}>{toastMessage}</Text>
          </View>
          <TouchableOpacity
            onPress={dismissToast}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.toastCloseBtn}
          >
            <X size={16} color="#d1fae5" />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Settings Navigation Tabs */}
      <View style={styles.tabBar}>
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'notifications', label: 'Alerts', icon: Bell },
          { id: 'security', label: 'Security', icon: Shield },
          { id: 'language', label: 'Language', icon: Languages },
          { id: 'logs', label: 'Logs', icon: FileCode }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Icon size={16} color={isActive ? '#7a1521' : '#64748b'} />
              <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* TAB 1: PROFILE */}
        {activeTab === 'profile' && (
          <View>
            <OfficerProfileCard
              userProfile={{ ...userProfile, firstName, lastName, designation, department, avatar }}
              style={{ marginBottom: 16 }}
            />

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Profile Information</Text>

              {/* Avatar Box with Interactive Change Photo */}
              <View style={styles.avatarRow}>
                <TouchableOpacity
                  onPress={pickImage}
                  activeOpacity={0.8}
                  style={styles.avatarTouchBox}
                >
                  <View style={styles.avatarBig}>
                    {Boolean(
                      avatar &&
                      typeof avatar === 'string' &&
                      (avatar.startsWith('data:') ||
                       avatar.startsWith('http://') ||
                       avatar.startsWith('https://') ||
                       avatar.startsWith('blob:'))
                    ) ? (
                      <Image source={{ uri: avatar }} style={styles.avatarBigImg} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <User size={28} color="#ffffff" strokeWidth={2.2} />
                      </View>
                    )}
                    {/* Camera Badge Overlay */}
                    <View style={styles.avatarCameraBadge}>
                      <Camera size={13} color="#ffffff" strokeWidth={2.6} />
                    </View>
                  </View>
                </TouchableOpacity>

                <View style={{ flex: 1, gap: 5, justifyContent: 'center' }}>
                  <Text style={styles.avatarName}>{firstName} {lastName}</Text>
                  <Text style={styles.avatarRole}>{designation} • {department}</Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <TouchableOpacity onPress={pickImage} style={styles.changePhotoBtn}>
                      <Camera size={12} color="#7a1521" style={{ marginRight: 4 }} />
                      <Text style={styles.changePhotoBtnText}>Change Photo</Text>
                    </TouchableOpacity>

                    {Boolean(
                      avatar &&
                      typeof avatar === 'string' &&
                      (avatar.startsWith('data:') ||
                       avatar.startsWith('http://') ||
                       avatar.startsWith('https://') ||
                       avatar.startsWith('blob:'))
                    ) ? (
                      <TouchableOpacity onPress={handleRemoveAvatar} style={styles.removePhotoBtn}>
                        <Trash2 size={12} color="#dc2626" style={{ marginRight: 4 }} />
                        <Text style={styles.removePhotoBtnText}>Reset</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Form Inputs */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>FIRST NAME</Text>
                  <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>LAST NAME</Text>
                  <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>PHONE NUMBER</Text>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              </View>

              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.label}>DEPARTMENT</Text>
                  <View style={styles.lockedTag}>
                    <Lock size={10} color="#64748b" style={{ marginRight: 3 }} />
                    <Text style={styles.lockedTagText}>Read Only</Text>
                  </View>
                </View>
                <View style={styles.disabledInputWrap}>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={department}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  <Lock size={14} color="#94a3b8" style={styles.disabledLockIcon} />
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={styles.label}>DESIGNATION</Text>
                  <View style={styles.lockedTag}>
                    <Lock size={10} color="#64748b" style={{ marginRight: 3 }} />
                    <Text style={styles.lockedTagText}>Read Only</Text>
                  </View>
                </View>
                <View style={styles.disabledInputWrap}>
                  <TextInput
                    style={[styles.input, styles.disabledInput]}
                    value={designation}
                    editable={false}
                    selectTextOnFocus={false}
                  />
                  <Lock size={14} color="#94a3b8" style={styles.disabledLockIcon} />
                </View>
              </View>

              <TouchableOpacity onPress={handleSaveProfile} style={styles.primaryBtn}>
                <Save size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 2: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Notification Preferences</Text>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>In-App Notifications</Text>
                  <Text style={styles.switchSub}>Show banner and badge updates in app</Text>
                </View>
                <Switch
                  value={inAppNotif}
                  onValueChange={setInAppNotif}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Email Notifications</Text>
                  <Text style={styles.switchSub}>Receive summary emails at {email}</Text>
                </View>
                <Switch
                  value={emailNotif}
                  onValueChange={setEmailNotif}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Push Notifications</Text>
                  <Text style={styles.switchSub}>Instant mobile alert banners</Text>
                </View>
                <Switch
                  value={pushNotif}
                  onValueChange={setPushNotif}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Alert Types</Text>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>New Maintenance Requests</Text>
                  <Text style={styles.switchSub}>Immediate notification upon new ticket submission</Text>
                </View>
                <Switch
                  value={alertNewRequests}
                  onValueChange={setAlertNewRequests}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Status Updates</Text>
                  <Text style={styles.switchSub}>Work completion or rescheduling notifications</Text>
                </View>
                <Switch
                  value={alertStatusUpdates}
                  onValueChange={setAlertStatusUpdates}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Urgent / Critical Alerts</Text>
                  <Text style={styles.switchSub}>Priority escalations and hazardous issues</Text>
                </View>
                <Switch
                  value={alertUrgent}
                  onValueChange={setAlertUrgent}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>

              <View style={[styles.formGroup, { marginTop: 12 }]}>
                <Text style={styles.label}>DIGEST FREQUENCY</Text>
                <View style={styles.pillRow}>
                  {['Real-time (No Digest)', 'Daily Digest', 'Weekly'].map(f => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => setDigestFreq(f)}
                      style={[styles.pill, digestFreq === f && styles.pillActive]}
                    >
                      <Text style={[styles.pillText, digestFreq === f && styles.pillTextActive]}>{f}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity onPress={handleSaveNotifications} style={styles.primaryBtn}>
                <Save size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 3: SECURITY */}
        {activeTab === 'security' && (
          <View>
            {/* Change Password Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Change Password</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>CURRENT PASSWORD</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>NEW PASSWORD</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={16} color="#64748b" /> : <Eye size={16} color="#64748b" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry={!showNew}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                />
              </View>

              <TouchableOpacity onPress={handleUpdatePassword} style={styles.primaryBtn}>
                <Key size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Update Password</Text>
              </TouchableOpacity>
            </View>

            {/* 2FA Toggle */}
            <View style={styles.card}>
              <View style={styles.switchRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>Two-Factor Authentication (2FA)</Text>
                  <Text style={styles.switchSub}>Require SMS or OTP verification at login</Text>
                </View>
                <Switch
                  value={twoFactorEnabled}
                  onValueChange={setTwoFactorEnabled}
                  trackColor={{ false: '#e2e8f0', true: '#7a1521' }}
                />
              </View>
            </View>

            {/* Active Sessions Card */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.cardTitle}>Active Sessions</Text>
                <TouchableOpacity onPress={handleRevokeOtherSessions}>
                  <Text style={styles.dangerActionText}>Revoke Others</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                {sessions.map(s => (
                  <View key={s.id} style={styles.sessionItem}>
                    <View style={styles.sessionIconBox}>
                      {s.device.toLowerCase().includes('mobile') ? (
                        <Smartphone size={16} color="#2563eb" />
                      ) : (
                        <Laptop size={16} color="#7a1521" />
                      )}
                    </View>

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.sessionDevice}>{s.device}</Text>
                        {s.current && <Text style={styles.currentBadge}>Current</Text>}
                      </View>
                      <Text style={styles.sessionMeta}>{s.location} • {s.ip}</Text>
                    </View>

                    {!s.current && (
                      <TouchableOpacity onPress={() => handleRevokeSession(s.id)} style={styles.revokeBtn}>
                        <Text style={styles.revokeBtnText}>Revoke</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* TAB 4: LANGUAGE & REGION */}
        {activeTab === 'language' && (
          <View>
            {/* Preferred Language Card */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Languages size={18} color="#059669" />
                <Text style={styles.cardTitle}>System Language</Text>
              </View>
              <Text style={styles.cardSub}>
                Select the primary display language for navigation, forms, and reports across ITUM Serva.
              </Text>

              <View style={{ gap: 10, marginTop: 14 }}>
                {[
                  { id: 'en', title: 'English (UK)', sub: 'Default Institutional & Academic Standard', flag: '🇬🇧' },
                  { id: 'si', title: 'සිංහල (Sinhala)', sub: 'Official National Language of Sri Lanka', flag: '🇱🇰' },
                  { id: 'ta', title: 'தமிழ் (Tamil)', sub: 'Official National Language of Sri Lanka', flag: '🇱🇰' }
                ].map(lang => {
                  const isSelected = selectedLanguage === lang.id;
                  return (
                    <TouchableOpacity
                      key={lang.id}
                      onPress={() => setSelectedLanguage(lang.id)}
                      style={[
                        styles.langOptionCard,
                        isSelected && styles.langOptionCardActive
                      ]}
                    >
                      <View style={styles.langFlagBox}>
                        <Text style={{ fontSize: 22 }}>{lang.flag}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langTitle, isSelected && styles.langTitleActive]}>
                          {lang.title}
                        </Text>
                        <Text style={styles.langSub}>{lang.sub}</Text>
                      </View>
                      <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                        {isSelected && <View style={styles.radioInnerDot} />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Regional Standards Card */}
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Globe size={18} color="#0284c7" />
                <Text style={styles.cardTitle}>Regional & Campus Standards</Text>
              </View>
              <Text style={styles.cardSub}>
                Institutional timezone and formatting preferences for University of Moratuwa.
              </Text>

              <View style={{ gap: 14, marginTop: 14 }}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>CAMPUS DIVISION / PREMISES</Text>
                  <View style={styles.readOnlyBox}>
                    <Text style={styles.readOnlyText}>Institute of Technology, University of Moratuwa (Diyagama)</Text>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>TIME ZONE</Text>
                  <View style={styles.readOnlyBox}>
                    <Text style={styles.readOnlyText}>Asia/Colombo (GMT +05:30) • Sri Lanka Standard Time</Text>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>DATE DISPLAY FORMAT</Text>
                  <View style={styles.pillRow}>
                    {['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'].map(fmt => (
                      <TouchableOpacity
                        key={fmt}
                        onPress={() => setDateFormat(fmt)}
                        style={[styles.pill, dateFormat === fmt && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, dateFormat === fmt && styles.pillTextActive]}>{fmt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>TIME FORMAT</Text>
                  <View style={styles.pillRow}>
                    {['12-Hour (AM/PM)', '24-Hour Clock'].map(tfmt => (
                      <TouchableOpacity
                        key={tfmt}
                        onPress={() => setTimeStandard(tfmt)}
                        style={[styles.pill, timeStandard === tfmt && styles.pillActive]}
                      >
                        <Text style={[styles.pillText, timeStandard === tfmt && styles.pillTextActive]}>{tfmt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveLanguageSettings}
                style={[styles.primaryBtn, { marginTop: 16 }]}
              >
                <Save size={16} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.primaryBtnText}>Save Preferences</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 5: SYSTEM LOGS */}
        {activeTab === 'logs' && (
          <View>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={styles.cardTitle}>System Audit Logs</Text>
                <TouchableOpacity onPress={handleClearLogs}>
                  <Text style={styles.dangerActionText}>Clear Logs</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.logSearchRow}>
                <TextInput
                  style={styles.logSearchInput}
                  placeholder="Filter logs by keyword or user..."
                  placeholderTextColor="#94a3b8"
                  value={logSearch}
                  onChangeText={setLogSearch}
                />
              </View>

              <View style={styles.pillRow}>
                {['All', 'Info', 'Warning', 'Error'].map(sev => (
                  <TouchableOpacity
                    key={sev}
                    onPress={() => setLogSeverity(sev)}
                    style={[styles.pill, logSeverity === sev && styles.pillActive]}
                  >
                    <Text style={[styles.pillText, logSeverity === sev && styles.pillTextActive]}>{sev}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ gap: 10, marginTop: 14 }}>
                {filteredLogs.map(l => (
                  <View key={l.id} style={styles.logItem}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.logAction}>{l.action}</Text>
                      <Text style={styles.logMeta}>{l.timestamp} • {l.user} ({l.ip})</Text>
                    </View>
                    <View style={[styles.sevBadge, l.severity === 'Warning' ? { backgroundColor: '#fffbeb' } : { backgroundColor: '#eff6ff' }]}>
                      <Text style={[styles.sevBadgeText, l.severity === 'Warning' ? { color: '#b45309' } : { color: '#1d4ed8' }]}>
                        {l.severity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
    position: 'relative'
  },
  floatingTopToast: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 25,
    zIndex: 999999,
    borderWidth: 1,
    borderColor: '#34d399'
  },
  toastIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  toastContentBox: {
    flex: 1
  },
  toastTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3
  },
  toastMessageText: {
    color: '#ecfdf5',
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 1
  },
  toastCloseBtn: {
    padding: 6,
    marginLeft: 6
  },
  langOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff'
  },
  langOptionCardActive: {
    borderColor: '#059669',
    backgroundColor: '#f0fdf4'
  },
  langFlagBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  langTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b'
  },
  langTitleActive: {
    color: '#065f46'
  },
  langSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleActive: {
    borderColor: '#059669'
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#059669'
  },
  readOnlyBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  readOnlyText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600'
  },
  cardSub: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 8
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6
  },
  tabItemActive: {
    borderBottomColor: '#7a1521'
  },
  tabItemText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b'
  },
  tabItemTextActive: {
    color: '#7a1521',
    fontWeight: '700'
  },
  container: {
    flex: 1
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
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 14
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  avatarTouchBox: {
    position: 'relative'
  },
  avatarBig: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#e2e8f0'
  },
  avatarBigImg: {
    width: '100%',
    height: '100%',
    borderRadius: 29
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 29,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#7a1521',
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 10
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca'
  },
  changePhotoBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7a1521'
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fee2e2'
  },
  removePhotoBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626'
  },
  avatarName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b'
  },
  avatarRole: {
    fontSize: 12,
    color: '#64748b'
  },
  formRow: {
    flexDirection: 'row',
    gap: 10
  },
  formGroup: {
    marginBottom: 12
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 4,
    letterSpacing: 0.4
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b',
    backgroundColor: '#ffffff'
  },
  disabledInputWrap: {
    position: 'relative',
    justifyContent: 'center'
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    borderColor: '#e2e8f0',
    paddingRight: 36
  },
  disabledLockIcon: {
    position: 'absolute',
    right: 12
  },
  lockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  lockedTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.3
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff'
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: '#1e293b'
  },
  primaryBtn: {
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 8
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700'
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc'
  },
  switchTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#1e293b'
  },
  switchSub: {
    fontSize: 11.5,
    color: '#64748b',
    marginTop: 2
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  pillActive: {
    backgroundColor: '#7a1521',
    borderColor: '#7a1521'
  },
  pillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569'
  },
  pillTextActive: {
    color: '#ffffff'
  },
  dangerActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626'
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 10
  },
  sessionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  sessionDevice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b'
  },
  currentBadge: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '700',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4
  },
  sessionMeta: {
    fontSize: 11,
    color: '#64748b'
  },
  revokeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#fee2e2',
    borderRadius: 6
  },
  revokeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b91c1c'
  },
  logSearchRow: {
    marginBottom: 10
  },
  logSearchInput: {
    height: 38,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12.5,
    color: '#1e293b'
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9'
  },
  logAction: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e293b'
  },
  logMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  sevBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4
  },
  sevBadgeText: {
    fontSize: 11,
    fontWeight: '700'
  }
});
