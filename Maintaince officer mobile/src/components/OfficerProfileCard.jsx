import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet
} from 'react-native';
import { Check, User } from 'lucide-react-native';

export default function OfficerProfileCard({ userProfile, style }) {
  const rawFirstName = userProfile?.firstName?.trim() || '';
  const rawLastName = userProfile?.lastName?.trim() || '';
  const computedFromFirstLast = (rawFirstName || rawLastName) ? `${rawFirstName} ${rawLastName}`.trim() : '';
  const baseName = computedFromFirstLast || userProfile?.name || 'Chathu Thathsarani';
  const officerName = baseName.startsWith('Eng.') ? baseName : `Eng. ${baseName}`;
  const roleName = userProfile?.designation || 'Maintenance Officer';
  const instituteName = 'INSTITUTE OF TECHNOLOGY • MORATUWA';
  const mottoText = '"Ensuring campus infrastructure excellence & rapid response"';

  const hasCustomAvatar = Boolean(
    userProfile?.avatar &&
    typeof userProfile.avatar === 'string' &&
    (userProfile.avatar.startsWith('data:') ||
     userProfile.avatar.startsWith('http://') ||
     userProfile.avatar.startsWith('https://') ||
     userProfile.avatar.startsWith('blob:'))
  );

  return (
    <View style={[styles.card, style]}>
      {/* Decorative Dot Grid Background */}
      <View pointerEvents="none" style={styles.dotGridOverlay}>
        {[...Array(6)].map((_, row) => (
          <View key={row} style={styles.dotRow}>
            {[...Array(10)].map((_, col) => (
              <View key={col} style={styles.dot} />
            ))}
          </View>
        ))}
      </View>

      {/* Top Left: Duty Pill Badge */}
      <View style={styles.dutyPill}>
        <View style={styles.activeDot} />
        <Text style={styles.dutyPillText}>DUTY: ACTIVE • CENTRAL UNIT</Text>
      </View>

      {/* Center: Officer Avatar with White Ring & Verified Check Badge */}
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarRing}>
          {hasCustomAvatar ? (
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={46} color="#ffffff" strokeWidth={2.2} />
            </View>
          )}
          {/* Verified Check Badge */}
          <View style={styles.verifiedBadge}>
            <Check size={11} color="#ffffff" strokeWidth={3} />
          </View>
        </View>
      </View>

      {/* Officer Name & Designation */}
      <Text style={styles.officerName}>{officerName}</Text>
      <Text style={styles.officerRole}>{roleName}</Text>
      <Text style={styles.instituteText}>{instituteName}</Text>

      {/* Bottom: Quote / Mission Motto Pill */}
      <View style={styles.mottoPill}>
        <Text style={styles.mottoText}>{mottoText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6b0e1a',
    borderRadius: 22,
    padding: 18,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 5
  },
  dotGridOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'space-between'
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.08)'
  },
  dutyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    zIndex: 2
  },
  activeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22c55e',
    marginRight: 6
  },
  dutyPillText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    zIndex: 2
  },
  avatarRing: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3.5,
    borderColor: '#ffffff',
    backgroundColor: '#ffffff',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 47
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
    backgroundColor: '#7a1521',
    alignItems: 'center',
    justifyContent: 'center'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 23,
    height: 23,
    borderRadius: 11.5,
    backgroundColor: '#059669',
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  officerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.2,
    zIndex: 2
  },
  officerRole: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#fca5a5',
    textAlign: 'center',
    marginTop: 4,
    zIndex: 2
  },
  instituteText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    letterSpacing: 1.2,
    marginTop: 4,
    zIndex: 2
  },
  mottoPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 2
  },
  mottoText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontStyle: 'italic',
    fontWeight: '500',
    textAlign: 'center'
  }
});
