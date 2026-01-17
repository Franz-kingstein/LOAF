import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { COLORS } from '../context/ThemeContext';
import { getUserProfile, updateUserProfile } from '../db/userRepo';
import {
  getOrCreateWaterPreferences,
  updateWaterPreferences,
} from '../db/waterPreferencesRepo';

export function SettingsScreen(): React.ReactElement {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [waterPrefs, setWaterPrefs] = useState<any>(null);
  const [editingUser, setEditingUser] = useState(false);
  const [editingWater, setEditingWater] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);

      const prefs = await getOrCreateWaterPreferences();
      setWaterPrefs(prefs);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (userProfile) {
        await updateUserProfile({
          age: userProfile.age,
          gender: userProfile.gender,
          height_cm: userProfile.height_cm,
          weight_kg: userProfile.weight_kg,
        });
        setEditingUser(false);
        Alert.alert('Success', 'Profile updated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSaveWater = async () => {
    try {
      if (waterPrefs) {
        await updateWaterPreferences({
          daily_goal_ml: waterPrefs.daily_goal_ml,
          wake_up_time: waterPrefs.wake_up_time,
          sleep_time: waterPrefs.sleep_time,
          reminders_enabled: waterPrefs.reminders_enabled,
        });
        setEditingWater(false);
        Alert.alert('Success', 'Water settings updated');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update water settings');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>⚙️ Settings</Text>
          <Text style={styles.subtitle}>Manage your preferences</Text>
        </View>

        {/* User Profile Section */}
        {userProfile && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>👤 User Profile</Text>
              <TouchableOpacity
                onPress={() => setEditingUser(!editingUser)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {editingUser ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Age</Text>
                {editingUser ? (
                  <TextInput
                    style={styles.input}
                    value={userProfile.age?.toString()}
                    onChangeText={(text) =>
                      setUserProfile({ ...userProfile, age: parseInt(text, 10) })
                    }
                    keyboardType="number-pad"
                  />
                ) : (
                  <Text style={styles.value}>{userProfile.age} years</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Gender</Text>
                {editingUser ? (
                  <TextInput
                    style={styles.input}
                    value={userProfile.gender}
                    onChangeText={(text) =>
                      setUserProfile({ ...userProfile, gender: text })
                    }
                  />
                ) : (
                  <Text style={styles.value}>{userProfile.gender}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Height (cm)</Text>
                {editingUser ? (
                  <TextInput
                    style={styles.input}
                    value={userProfile.height_cm?.toString()}
                    onChangeText={(text) =>
                      setUserProfile({
                        ...userProfile,
                        height_cm: parseFloat(text),
                      })
                    }
                    keyboardType="decimal-pad"
                  />
                ) : (
                  <Text style={styles.value}>{userProfile.height_cm} cm</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Weight (kg)</Text>
                {editingUser ? (
                  <TextInput
                    style={styles.input}
                    value={userProfile.weight_kg?.toString()}
                    onChangeText={(text) =>
                      setUserProfile({
                        ...userProfile,
                        weight_kg: parseFloat(text),
                      })
                    }
                    keyboardType="decimal-pad"
                  />
                ) : (
                  <Text style={styles.value}>{userProfile.weight_kg} kg</Text>
                )}
              </View>

              {editingUser && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveUser}
                >
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Water Settings Section */}
        {waterPrefs && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>💧 Water Settings</Text>
              <TouchableOpacity
                onPress={() => setEditingWater(!editingWater)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {editingWater ? 'Done' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Daily Goal (ml)</Text>
                {editingWater ? (
                  <TextInput
                    style={styles.input}
                    value={waterPrefs.daily_goal_ml?.toString()}
                    onChangeText={(text) =>
                      setWaterPrefs({
                        ...waterPrefs,
                        daily_goal_ml: parseInt(text, 10),
                      })
                    }
                    keyboardType="number-pad"
                  />
                ) : (
                  <Text style={styles.value}>{waterPrefs.daily_goal_ml} ml</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Wake-up Time</Text>
                {editingWater ? (
                  <TextInput
                    style={styles.input}
                    value={waterPrefs.wake_up_time}
                    onChangeText={(text) =>
                      setWaterPrefs({ ...waterPrefs, wake_up_time: text })
                    }
                    placeholder="HH:mm"
                  />
                ) : (
                  <Text style={styles.value}>{waterPrefs.wake_up_time}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Sleep Time</Text>
                {editingWater ? (
                  <TextInput
                    style={styles.input}
                    value={waterPrefs.sleep_time}
                    onChangeText={(text) =>
                      setWaterPrefs({ ...waterPrefs, sleep_time: text })
                    }
                    placeholder="HH:mm"
                  />
                ) : (
                  <Text style={styles.value}>{waterPrefs.sleep_time}</Text>
                )}
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.toggleRow}>
                  <Text style={styles.label}>Enable Reminders</Text>
                  {editingWater ? (
                    <Switch
                      value={waterPrefs.reminders_enabled}
                      onValueChange={(value) =>
                        setWaterPrefs({
                          ...waterPrefs,
                          reminders_enabled: value,
                        })
                      }
                      trackColor={{ false: '#767577', true: COLORS.accent }}
                      thumbColor={
                        waterPrefs.reminders_enabled ? COLORS.success : '#f4f3f4'
                      }
                    />
                  ) : (
                    <Text style={styles.value}>
                      {waterPrefs.reminders_enabled ? 'On' : 'Off'}
                    </Text>
                  )}
                </View>
              </View>

              {editingWater && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveWater}
                >
                  <Text style={styles.saveButtonText}>Save Settings</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ About</Text>
          <View style={styles.card}>
            <Text style={styles.aboutText}>
              LOAF v1.0.0{'\n'}
              Lifestyle Optimization & Activity Fusion{'\n\n'}
              Track your nutrition and hydration for optimal health.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#222222',
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  aboutText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
});
