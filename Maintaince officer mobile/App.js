import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useWindowDimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Home,
  FileText,
  Briefcase,
  Users,
  Settings,
  Grid,
  Menu
} from 'lucide-react-native';

// Components & Services
import MobileHeader from './src/components/MobileHeader';
import { fetchSettings, updateProfile, fetchNotifications, fetchStats } from './src/services/api';
import { COLORS } from './src/theme/colors';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import RequestReviewScreen from './src/screens/RequestReviewScreen';
import JobsScreen from './src/screens/JobsScreen';
import JobDetailsScreen from './src/screens/JobDetailsScreen';
import LabourersScreen from './src/screens/LabourersScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MoreMenuScreen from './src/screens/MoreMenuScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Web Mobile Simulator container for desktop web viewing
function WebMobileSimulator({ children }) {
  const { width, height } = useWindowDimensions();
  const [deviceMode, setDeviceMode] = useState('auto'); // 'auto' | 'iphone' | 'galaxy' | 'wide' | 'full'

  const isDesktop = Platform.OS === 'web' && width > 520;

  if (!isDesktop || deviceMode === 'full') {
    return <View style={{ flex: 1, width: '100%', height: '100%' }}>{children}</View>;
  }

  // Dynamic width adaptation: widened so words and headers never get cut off
  let deviceWidth;
  if (deviceMode === 'iphone') {
    deviceWidth = 460;
  } else if (deviceMode === 'galaxy') {
    deviceWidth = 500;
  } else if (deviceMode === 'wide') {
    deviceWidth = 560;
  } else {
    // Auto: dynamically adapts to optimal phone width based on screen width
    deviceWidth = Math.min(Math.max(Math.round(width * 0.46), 460), 560);
  }

  // Dynamic height adaptation: ensures frame fits cleanly in browser viewport
  const frameHeight = Math.min(Math.max(height - 84, 520), 860);

  return (
    <View style={webStyles.backdrop}>
      {/* Top Device Control Bar */}
      <View style={webStyles.toolbar}>
        <View style={webStyles.toolbarLeft}>
          <Text style={webStyles.toolbarTitle}>📱 Responsive Mobile Mode</Text>
          <Text style={webStyles.toolbarSub}>
            Auto-detected Screen: <Text style={webStyles.statHighlight}>{Math.round(width)}px × {Math.round(height)}px</Text> | Frame: <Text style={webStyles.statHighlight}>{deviceWidth}px × {frameHeight}px</Text>
          </Text>
        </View>

        <View style={webStyles.deviceButtons}>
          <TouchableOpacity
            onPress={() => setDeviceMode('auto')}
            style={[webStyles.btn, deviceMode === 'auto' && webStyles.btnActive]}
          >
            <Text style={[webStyles.btnText, deviceMode === 'auto' && webStyles.btnTextActive]}>
              Auto ({deviceWidth}px)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeviceMode('iphone')}
            style={[webStyles.btn, deviceMode === 'iphone' && webStyles.btnActive]}
          >
            <Text style={[webStyles.btnText, deviceMode === 'iphone' && webStyles.btnTextActive]}>
              iPhone (460px)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeviceMode('galaxy')}
            style={[webStyles.btn, deviceMode === 'galaxy' && webStyles.btnActive]}
          >
            <Text style={[webStyles.btnText, deviceMode === 'galaxy' && webStyles.btnTextActive]}>
              Galaxy (500px)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeviceMode('wide')}
            style={[webStyles.btn, deviceMode === 'wide' && webStyles.btnActive]}
          >
            <Text style={[webStyles.btnText, deviceMode === 'wide' && webStyles.btnTextActive]}>
              Wide (560px)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setDeviceMode('full')}
            style={[webStyles.btn, deviceMode === 'full' && webStyles.btnActive]}
          >
            <Text style={[webStyles.btnText, deviceMode === 'full' && webStyles.btnTextActive]}>
              Full Screen
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Realistic Mobile Device Frame with safe corners & home chin */}
      <View
        style={[
          webStyles.phoneShell,
          {
            width: deviceWidth,
            height: frameHeight
          }
        ]}
      >
        {/* Dynamic Island / Notch */}
        <View pointerEvents="none" style={webStyles.islandContainer}>
          <View style={webStyles.islandPill} />
        </View>

        {/* Screen Content: Flexible app viewport */}
        <View style={webStyles.screenContent}>
          {children}
        </View>

        {/* Home Bar Chin: provides clear space so bottom tabs are NEVER clipped */}
        <View pointerEvents="none" style={webStyles.homeBarArea}>
          <View style={webStyles.homeIndicatorPill} />
        </View>
      </View>
    </View>
  );
}

const webStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  toolbar: {
    width: '100%',
    maxWidth: 820,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    backgroundColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155'
  },
  toolbarLeft: {
    flexDirection: 'column'
  },
  toolbarTitle: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700'
  },
  toolbarSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2
  },
  statHighlight: {
    color: '#38bdf8',
    fontWeight: '700'
  },
  deviceButtons: {
    flexDirection: 'row',
    gap: 6
  },
  btn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155'
  },
  btnActive: {
    backgroundColor: '#7a1521',
    borderColor: '#991b1b'
  },
  btnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600'
  },
  btnTextActive: {
    color: '#ffffff'
  },
  phoneShell: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    borderWidth: 8,
    borderColor: '#1e293b',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20
  },
  islandContainer: {
    position: 'absolute',
    top: 6,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999
  },
  islandPill: {
    width: 76,
    height: 12,
    backgroundColor: '#000000',
    borderRadius: 6
  },
  screenContent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#ffffff'
  },
  homeBarArea: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  homeIndicatorPill: {
    width: 110,
    height: 4,
    backgroundColor: '#94a3b8',
    opacity: 0.4,
    borderRadius: 2
  }
});

function MainTabs({ navigation, userProfile, unreadCount, pendingCount }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Realistic iOS bottom safe area for curved corners & home indicator
  const bottomInset = Math.max(insets.bottom, 24);
  const tabHeight = 56 + bottomInset; // 80px total height, plenty of room!

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#7a1521',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          height: 86,
          paddingTop: 8,
          paddingBottom: 16,
          paddingHorizontal: 8,
          width: '100%',
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 3,
          elevation: 6
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 3,
          marginBottom: 2,
          lineHeight: 14
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2
        },
        header: ({ route, options, navigation: tabNav }) => (
          <MobileHeader
            title={options.title || route.name}
            unreadCount={unreadCount}
            userProfile={userProfile}
            onNotificationPress={() => navigation.navigate('Notifications')}
            onProfilePress={() => {
              if (tabNav && tabNav.navigate) {
                tabNav.navigate('More');
              } else {
                navigation.navigate('MainTabs', { screen: 'More' });
              }
            }}
          />
        )
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size || 20} color={color} strokeWidth={2.2} />
        }}
      >
        {(props) => <DashboardScreen {...props} userProfile={userProfile} />}
      </Tab.Screen>

      <Tab.Screen
        name="Requests"
        options={{
          title: 'Requests',
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#7a1521',
            color: '#ffffff',
            fontSize: 10,
            fontWeight: '700'
          },
          tabBarIcon: ({ color, size }) => <FileText size={size || 20} color={color} strokeWidth={2.2} />
        }}
        component={RequestsScreen}
      />

      <Tab.Screen
        name="Jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, size }) => <Briefcase size={size || 20} color={color} strokeWidth={2.2} />
        }}
        component={JobsScreen}
      />

      <Tab.Screen
        name="More"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size || 20} color={color} strokeWidth={2.2} />
        }}
      >
        {(props) => <MoreMenuScreen {...props} userProfile={userProfile} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [userProfile, setUserProfile] = useState({
    firstName: 'Chathu',
    lastName: 'Thathsarani',
    name: 'Eng. Chathu Thathsarani',
    email: 'chathupamathathsarani51@gmail.com',
    phone: '+94 77 123 4567',
    department: 'Works & Maintenance Division',
    designation: 'Maintenance Officer',
    avatar: ''
  });

  useEffect(() => {
    let isMounted = true;

    async function syncData() {
      try {
        const settingsData = await fetchSettings();
        if (settingsData?.profile && isMounted) {
          const p = settingsData.profile;
          const fName = p.firstName?.trim() || '';
          const lName = p.lastName?.trim() || '';
          const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : (p.name || 'Maintenance Officer');
          const formattedName = fullName.startsWith('Eng.') ? fullName : `Eng. ${fullName}`;
          const rawAv = p.avatar;
          const validAv = (typeof rawAv === 'string' && (rawAv.startsWith('data:image/') || rawAv.startsWith('http://') || rawAv.startsWith('https://') || rawAv.startsWith('blob:'))) ? rawAv : '';
          setUserProfile(prev => {
            if (
              prev.firstName === fName &&
              prev.lastName === lName &&
              prev.email === p.email &&
              prev.phone === p.phone &&
              prev.department === p.department &&
              prev.designation === p.designation &&
              prev.avatar === validAv
            ) {
              return prev;
            }
            return {
              ...prev,
              ...p,
              firstName: fName,
              lastName: lName,
              name: formattedName,
              avatar: validAv
            };
          });
        }
      } catch (err) {}
    }

    async function initData() {
      await syncData();
      const notifs = await fetchNotifications();
      if (notifs && isMounted) {
        const unread = notifs.filter(n => !n.read && !n.is_read).length;
        setUnreadCount(unread);
      }
      const statsData = await fetchStats();
      if (statsData && isMounted) {
        setPendingCount(statsData.pendingRequests || 0);
      }
    }

    initData();

    // Recurring 3s sync to pull updates made on web application
    const timer = setInterval(syncData, 3000);

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('focus', syncData);
    }

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('focus', syncData);
      }
    };
  }, []);

  const handleUpdateProfile = async (updated) => {
    const fName = (updated.firstName !== undefined ? updated.firstName : userProfile.firstName)?.trim() || '';
    const lName = (updated.lastName !== undefined ? updated.lastName : userProfile.lastName)?.trim() || '';
    const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : (updated.name || userProfile.name || 'Kasun Perera');
    const formattedName = fullName.startsWith('Eng.') ? fullName : `Eng. ${fullName}`;

    const rawAv = updated.avatar !== undefined ? updated.avatar : userProfile.avatar;
    const validAv = (typeof rawAv === 'string' && (rawAv.startsWith('data:') || rawAv.startsWith('http://') || rawAv.startsWith('https://') || rawAv.startsWith('blob:'))) ? rawAv : '';

    const nextProfile = {
      ...userProfile,
      ...updated,
      firstName: fName || userProfile.firstName,
      lastName: lName || userProfile.lastName,
      name: formattedName,
      avatar: validAv
    };

    setUserProfile(nextProfile);
    try {
      await updateProfile(nextProfile);
    } catch (err) {
      console.warn('updateProfile background sync warning:', err);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <WebMobileSimulator>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              header: ({ navigation, route, options }) => {
                const showBack = navigation.canGoBack();
                return (
                  <MobileHeader
                    title={options.title || route.name}
                    unreadCount={unreadCount}
                    userProfile={userProfile}
                    showBack={showBack}
                    onBackPress={() => navigation.goBack()}
                    onNotificationPress={() => navigation.navigate('Notifications')}
                    onProfilePress={() => navigation.navigate('MainTabs', { screen: 'More' })}
                  />
                );
              }
            }}
          >
            {/* Main Bottom Tabs */}
            <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
              {(props) => (
                <MainTabs
                  {...props}
                  userProfile={userProfile}
                  unreadCount={unreadCount}
                  pendingCount={pendingCount}
                />
              )}
            </Stack.Screen>

            {/* Deep Navigation Screens */}
            <Stack.Screen
              name="RequestReview"
              options={{ title: 'Review & Assign Task' }}
              component={RequestReviewScreen}
            />

            <Stack.Screen
              name="JobDetails"
              options={{ title: 'Job Details' }}
              component={JobDetailsScreen}
            />

            <Stack.Screen
              name="Reports"
              options={{ title: 'Reports & Analytics' }}
              component={ReportsScreen}
            />

            <Stack.Screen
              name="Labourers"
              options={{ title: 'Maintenance Personnel & Teams' }}
              component={LabourersScreen}
            />

            <Stack.Screen
              name="Notifications"
              options={{ title: 'Notification Center' }}
              component={NotificationsScreen}
            />

            <Stack.Screen
              name="Settings"
              options={{ title: 'Officer Settings' }}
            >
              {(props) => (
                <SettingsScreen
                  {...props}
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="OfficerSettings"
              options={{ title: 'Officer Settings' }}
            >
              {(props) => (
                <SettingsScreen
                  {...props}
                  userProfile={userProfile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </WebMobileSimulator>
    </SafeAreaProvider>
  );
}
