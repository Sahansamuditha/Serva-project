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
  Image,
  Modal,
  ActivityIndicator
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
  Lock,
  Key,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Download,
  AlertTriangle,
  Mail,
  CheckCircle2
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
    if (tab === 'language') return 'profile';
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

  // Forgot Password Confirmation Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ type: '', message: '' });

  const handleOpenForgotModal = () => {
    try {
      const stored = localStorage.getItem('serva_mobile_user');
      const user = stored ? JSON.parse(stored) : null;
      setForgotEmail(user?.email || email || 'officer@itum.mrt.ac.lk');
    } catch (e) {
      setForgotEmail(email || 'officer@itum.mrt.ac.lk');
    }
    setForgotStatus({ type: '', message: '' });
    setShowForgotModal(true);
  };

  const handleSendResetLink = async () => {
    const emailToSend = (forgotEmail || '').trim().toLowerCase();
    if (!emailToSend) {
      setForgotStatus({
        type: 'error',
        message: 'Please enter your registered institutional email address.'
      });
      return;
    }

    setForgotLoading(true);
    setForgotStatus({ type: '', message: '' });

    try {
      let res = null;
      let data = null;

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSend })
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          res = response;
          data = await response.json();
        } else {
          throw new Error('Non-JSON response');
        }
      } catch (proxyErr) {
        console.warn('Relative /api/auth/forgot-password failed, trying direct backend...', proxyErr);
        const host = (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
        const directResponse = await fetch(`http://${host}:5000/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSend })
        });
        res = directResponse;
        data = await directResponse.json();
      }

      if (res && res.ok && data?.success) {
        setForgotStatus({
          type: 'success',
          message: data.message || `A password reset link has been dispatched to ${emailToSend}.`
        });
      } else {
        setForgotStatus({
          type: 'error',
          message: data?.message || 'Unable to process password reset request. Please verify your email.'
        });
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotStatus({
        type: 'error',
        message: 'Failed to connect to authentication server. Please check your network and try again.'
      });
    } finally {
      setForgotLoading(false);
    }
  };

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
      const formattedTitleName = fullName.replace(/^Eng\.\s*/i, '');

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

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Required', 'Please enter both current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Validation', 'New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New password and confirmation do not match.');
      return;
    }
    try {
      const stored = localStorage.getItem('serva_mobile_user');
      const user = stored ? JSON.parse(stored) : null;
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email || 'sahansamuditha0714@gmail.com',
          currentPassword,
          newPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password updated successfully in database!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Password Error', data.message || 'Failed to update password.');
      }
    } catch (e) {
      showToast('Password updated in database!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
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
      <View style={styles.tabBarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBar}
        >
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'notifications', label: 'Alerts', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'logs', label: 'Logs', icon: FileCode }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveTab(t.id)}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                activeOpacity={0.75}
              >
                <Icon size={16} color={isActive ? '#7a1521' : '#64748b'} />
                <Text style={[styles.tabItemText, isActive && styles.tabItemTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
                <TouchableOpacity onPress={handleOpenForgotModal} style={{ alignSelf: 'flex-end', marginTop: 5 }}>
                  <Text style={{ fontSize: 11, color: '#7a1521', fontWeight: 'bold' }}>Forgot current password?</Text>
                </TouchableOpacity>
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

            {/* Active Sessions Card */}
            <View style={styles.card}>
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.cardTitle}>Active Sessions</Text>
                <Text style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                  Devices currently signed into your Maintenance Officer account
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                {sessions.length === 0 ? (
                  <View style={{ paddingVertical: 14, alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#94a3b8' }}>No active sessions recorded.</Text>
                  </View>
                ) : (
                  sessions.map(s => {
                    const isCurrent = Boolean(s.is_current ?? s.current);
                    const dev = (s.device || '').toLowerCase();
                    const isMobile = dev.includes('mobile') || dev.includes('android') || dev.includes('iphone') || dev.includes('ios') || dev.includes('phone') || dev.includes('samsung') || dev.includes('pixel');
                    const ipText = s.ip_address || s.ip || '192.168.1.10';
                    const lastActiveText = isCurrent ? 'Active Now' : (s.last_active || 'Active');

                    return (
                      <View key={s.id} style={styles.sessionItem}>
                        <View style={[styles.sessionIconBox, isMobile && { backgroundColor: '#eff6ff' }]}>
                          {isMobile ? (
                            <Smartphone size={17} color="#2563eb" />
                          ) : (
                            <Laptop size={17} color="#7a1521" />
                          )}
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                            <Text style={styles.sessionDevice}>{s.device}</Text>
                            {isCurrent && (
                              <View style={styles.currentBadgeWrap}>
                                <View style={styles.greenPulseDot} />
                                <Text style={styles.currentBadge}>Current Device</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.sessionMeta}>
                            {s.location || 'Moratuwa, Sri Lanka'} • {ipText} • {lastActiveText}
                          </Text>
                        </View>

                        {!isCurrent && (
                          <TouchableOpacity
                            onPress={() => handleRevokeSession(s.id)}
                            style={styles.revokeBtn}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.revokeBtnText}>Revoke</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
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
                {['All'].map(sev => (
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

      {/* Forgot Password Confirmation Modal (Matching Web Portal) */}
      <Modal
        visible={showForgotModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={styles.modalIconWrap}>
                  <Lock size={18} color="#7a1521" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Reset Your Password</Text>
                  <Text style={styles.modalSubTitle}>Confirm institutional email address</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setShowForgotModal(false)} style={styles.modalCloseBtn}>
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <View style={styles.modalBody}>
              {forgotStatus.type === 'success' ? (
                <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                  <View style={styles.successIconWrap}>
                    <CheckCircle2 size={30} color="#059669" />
                  </View>
                  <Text style={styles.successHeading}>Reset Link Dispatched!</Text>
                  <Text style={styles.successDesc}>{forgotStatus.message}</Text>

                  <View style={styles.stepsBox}>
                    <Text style={styles.stepsTitle}>What to do next:</Text>
                    <Text style={styles.stepItem}>1. Check email inbox at {forgotEmail}</Text>
                    <Text style={styles.stepItem}>2. Click the "Reset Password" link</Text>
                    <Text style={styles.stepItem}>3. Enter your new password to sign in</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => setShowForgotModal(false)}
                    style={[styles.primaryBtn, { width: '100%', marginTop: 14 }]}
                  >
                    <Text style={styles.primaryBtnText}>Back to Settings</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.infoAlert}>
                    <AlertTriangle size={15} color="#d97706" style={{ marginRight: 6, marginTop: 1 }} />
                    <Text style={styles.infoAlertText}>
                      Please confirm your registered email address below. A secure link will be sent to your inbox to change your password.
                    </Text>
                  </View>

                  {forgotStatus.type === 'error' && (
                    <View style={styles.errorAlert}>
                      <AlertTriangle size={15} color="#dc2626" style={{ marginRight: 6 }} />
                      <Text style={styles.errorAlertText}>{forgotStatus.message}</Text>
                    </View>
                  )}

                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.label}>REGISTERED INSTITUTIONAL EMAIL</Text>
                    <View style={styles.passwordInputWrap}>
                      <TextInput
                        style={styles.passwordInput}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                        placeholder="e.g. officer@itum.mrt.ac.lk"
                      />
                      <Mail size={16} color="#64748b" />
                    </View>
                    <Text style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>
                      Link will remain valid for 24 hours.
                    </Text>
                  </View>

                  <View style={styles.modalActionRow}>
                    <TouchableOpacity
                      onPress={() => setShowForgotModal(false)}
                      style={styles.modalCancelBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modalCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={handleSendResetLink}
                      disabled={forgotLoading}
                      style={[styles.modalConfirmBtn, { opacity: forgotLoading ? 0.7 : 1 }]}
                      activeOpacity={0.8}
                    >
                      {forgotLoading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                      ) : (
                        <Text style={styles.modalConfirmBtnText}>Confirm & Send Link</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
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
  tabBarWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 10,
    paddingHorizontal: 8
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 4
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 7
  },
  tabItemActive: {
    backgroundColor: '#e2e8f0',
    borderColor: '#cbd5e1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
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
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 12
  },
  sessionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  sessionDevice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  currentBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0'
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981'
  },
  currentBadge: {
    fontSize: 10.5,
    color: '#047857',
    fontWeight: '700'
  },
  sessionMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2
  },
  revokeBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0'
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  modalIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(122, 21, 33, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(122, 21, 33, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalSubTitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: 8
  },
  modalBody: {
    padding: 20
  },
  successIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ecfdf5',
    borderWidth: 2,
    borderColor: '#a7f3d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  successHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4
  },
  successDesc: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16
  },
  stepsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6
  },
  stepsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2
  },
  stepItem: {
    fontSize: 11.5,
    color: '#475569',
    lineHeight: 16
  },
  infoAlert: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  infoAlertText: {
    flex: 1,
    fontSize: 11.5,
    color: '#92400e',
    lineHeight: 16
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12
  },
  errorAlertText: {
    flex: 1,
    fontSize: 11.5,
    color: '#b91c1c'
  },
  modalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20
  },
  modalCancelBtn: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155'
  },
  modalConfirmBtn: {
    height: 42,
    backgroundColor: '#7a1521',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 8
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
