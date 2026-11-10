import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet
} from 'react-native';
import { Bell, Search, X, ArrowLeft, ChevronRight, User } from 'lucide-react-native';
import CrestLogo from './CrestLogo';
import { COLORS } from '../theme/colors';

export default function MobileHeader({
  title = 'Dashboard',
  breadcrumbs,
  unreadCount = 3,
  userProfile = {},
  onNotificationPress,
  onProfilePress,
  onBackPress,
  onSearch,
  showBack = false
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const displayName = userProfile?.firstName?.trim() || (userProfile?.name ? userProfile.name.replace(/^Eng\.\s*/, '').split(' ')[0] : 'Chathu');
  const initial = (displayName.charAt(0) || 'C').toUpperCase();

  const handleSearchChange = (text) => {
    setSearchText(text);
    if (onSearch) onSearch(text);
  };

  const hasCustomAvatar = Boolean(
    userProfile?.avatar &&
    typeof userProfile.avatar === 'string' &&
    (userProfile.avatar.startsWith('data:') ||
     userProfile.avatar.startsWith('http://') ||
     userProfile.avatar.startsWith('https://') ||
     userProfile.avatar.startsWith('blob:'))
  );

  return (
    <View style={styles.headerContainer}>
      {/* Search Mode */}
      {isSearchOpen ? (
        <View style={styles.searchBarRow}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search requests, jobs, users..."
            placeholderTextColor="#94a3b8"
            value={searchText}
            onChangeText={handleSearchChange}
            autoFocus
          />
          <TouchableOpacity
            onPress={() => {
              setIsSearchOpen(false);
              setSearchText('');
              if (onSearch) onSearch('');
            }}
            style={styles.searchCloseBtn}
          >
            <X size={18} color="#64748b" />
          </TouchableOpacity>
        </View>
      ) : (
        /* Normal Header Mode */
        <View style={styles.contentRow}>
          {/* Left: Back button or ITUM Crest Logo */}
          <View style={styles.leftSection}>
            {showBack ? (
              <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
                <ArrowLeft size={22} color="#1e293b" />
              </TouchableOpacity>
            ) : (
              <View style={styles.crestContainer}>
                <CrestLogo size={36} />
              </View>
            )}

            {/* Title / Brand Text */}
            <View style={styles.titleContainer}>
              <Text style={styles.brandSubTitle}>ITUM • SERVA</Text>
              <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
            </View>
          </View>

          {/* Right Action Icons matching screenshot */}
          <View style={styles.rightSection}>
            {/* Search Trigger */}
            <TouchableOpacity
              onPress={() => setIsSearchOpen(true)}
              style={styles.iconBtn}
            >
              <Search size={21} color="#64748b" strokeWidth={2.2} />
            </TouchableOpacity>

            {/* Notification Bell with Badge */}
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.iconBtn}
            >
              <Bell size={21} color="#64748b" strokeWidth={2.2} />
              {unreadCount > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* User Profile Avatar with Image or White User Icon */}
            <TouchableOpacity
              onPress={onProfilePress}
              style={styles.avatarBtn}
            >
              {hasCustomAvatar ? (
                <Image
                  source={{ uri: userProfile.avatar }}
                  style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: '#7a1521' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <User size={18} color="#ffffff" strokeWidth={2.4} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingTop: 24, // Clear Dynamic Island safely within header without shifting entire app viewport
    paddingBottom: 10,
    zIndex: 100
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  crestContainer: {
    marginRight: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  backBtn: {
    padding: 6,
    marginRight: 8
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  brandSubTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#7a1521',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 1
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
    lineHeight: 22
  },
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap'
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#64748b'
  },
  breadcrumbActive: {
    fontWeight: '700',
    color: '#1e293b'
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  unreadBadge: {
    position: 'absolute',
    top: 1,
    right: 1,
    backgroundColor: '#7a1521',
    borderRadius: 8.5,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800'
  },
  avatarBtn: {
    marginLeft: 2
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5c0612',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700'
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#1e293b'
  },
  searchCloseBtn: {
    padding: 4
  }
});
