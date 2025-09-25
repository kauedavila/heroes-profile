import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Divider } from 'react-native-paper';

import { theme } from '../../theme';
import { useAuth } from '../../store/authStore';
import Card from '../../components/atoms/Card';
import Button from '../../components/atoms/Button';

const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        Profile
      </Text>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Card variant="character" style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text variant="headlineSmall" style={styles.userName}>
                {user?.name}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user?.email}
              </Text>
              {user?.isVip && (
                <View style={styles.vipBadge}>
                  <Text style={styles.vipText}>VIP Level {user.vipLevel}</Text>
                </View>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.statsSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Game Statistics
            </Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Player Level:</Text>
              <Text style={styles.statValue}>{user?.gameData.level}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Gold:</Text>
              <Text style={[styles.statValue, { color: theme.colors.gold }]}>
                {user?.gameData.gold.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Experience:</Text>
              <Text style={[styles.statValue, { color: theme.colors.experience }]}>
                {user?.gameData.experience}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Current Stage:</Text>
              <Text style={styles.statValue}>{user?.gameData.currentStage}</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Heroes Created:</Text>
              <Text style={styles.statValue}>{user?.gameData.characters.length || 0}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.accountSection}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Account Information
            </Text>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Role:</Text>
              <Text style={[styles.statValue, { textTransform: 'capitalize' }]}>
                {user?.role}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Member Since:</Text>
              <Text style={styles.statValue}>
                {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </Text>
            </View>
            
            {user?.vipExpiry && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>VIP Expires:</Text>
                <Text style={[styles.statValue, { color: theme.colors.vip }]}>
                  {formatDate(user.vipExpiry)}
                </Text>
              </View>
            )}
          </View>
        </Card>

        <Card variant="default" style={styles.actionsCard}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Actions
          </Text>
          
          <Button
            title="Edit Profile"
            variant="outline"
            onPress={() => Alert.alert('Edit Profile', 'Feature coming soon!')}
            style={styles.actionButton}
          />
          
          <Button
            title="Settings"
            variant="outline"
            onPress={() => Alert.alert('Settings', 'Feature coming soon!')}
            style={styles.actionButton}
          />
          
          <Button
            title="Logout"
            variant="outline"
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
          />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  title: {
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  profileCard: {
    marginBottom: theme.spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: theme.colors.onPrimary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    color: theme.colors.onSurface,
    fontWeight: 'bold',
  },
  userEmail: {
    color: theme.colors.onSurface,
    opacity: 0.7,
    marginBottom: theme.spacing.xs,
  },
  vipBadge: {
    backgroundColor: theme.colors.vip,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vipText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  statsSection: {
    marginBottom: theme.spacing.md,
  },
  accountSection: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    color: theme.colors.onSurface,
    marginBottom: theme.spacing.md,
    fontWeight: 'bold',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statLabel: {
    color: theme.colors.onSurface,
    opacity: 0.7,
  },
  statValue: {
    color: theme.colors.onSurface,
    fontWeight: '600',
  },
  actionsCard: {
    marginBottom: theme.spacing.lg,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
  logoutButton: {
    borderColor: theme.colors.error,
  },
});

export default ProfileScreen;