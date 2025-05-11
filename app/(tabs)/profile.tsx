import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Platform,
  Alert,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserData } from '@/contexts/UserDataContext';
import { 
  User, 
  Moon, 
  Sun, 
  Bell, 
  ShieldCheck, 
  Globe, 
  CircleHelp as HelpCircle, 
  LogOut, 
  ChevronRight, 
  Camera, 
  X, 
  Check,
  Info 
} from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { backupData } = useUserData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedLicense, setEditedLicense] = useState(user?.pilotLicense || '');
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  
  const handleLogout = async () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
              router.replace('/(auth)/welcome');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the user profile
    setIsEditing(false);
    
    Alert.alert(
      "Profile Updated",
      "Your profile has been updated successfully.",
      [{ text: "OK" }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          {!isEditing ? (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.profileSection}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg' }} 
                style={styles.avatar}
              />
              {isEditing && (
                <TouchableOpacity style={styles.cameraButton}>
                  <Camera size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              {!isEditing ? (
                <>
                  <Text style={styles.profileName}>{user?.name}</Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>
                  <View style={styles.licenseContainer}>
                    <Text style={styles.licenseText}>License: {user?.pilotLicense}</Text>
                  </View>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedName}
                    onChangeText={setEditedName}
                    placeholder="Full Name"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedEmail}
                    onChangeText={setEditedEmail}
                    placeholder="Email Address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <TextInput
                    style={styles.input}
                    value={editedLicense}
                    onChangeText={setEditedLicense}
                    placeholder="Pilot License Number"
                    autoCapitalize="characters"
                  />
                </>
              )}
            </View>
          </View>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(200)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                {theme === 'dark' ? (
                  <Moon size={20} color="#6B7280" style={styles.settingIcon} />
                ) : (
                  <Sun size={20} color="#6B7280" style={styles.settingIcon} />
                )}
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E8F0', true: '#3E92CC' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E2E8F0"
                onValueChange={toggleTheme}
                value={theme === 'dark'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Bell size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E8F0', true: '#3E92CC' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E2E8F0"
                onValueChange={setNotificationsEnabled}
                value={notificationsEnabled}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Globe size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Location Services</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E8F0', true: '#3E92CC' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E2E8F0"
                onValueChange={setLocationEnabled}
                value={locationEnabled}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <ShieldCheck size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Biometric Authentication</Text>
              </View>
              <Switch
                trackColor={{ false: '#E2E8F0', true: '#3E92CC' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E2E8F0"
                onValueChange={setBiometricsEnabled}
                value={biometricsEnabled}
              />
            </View>
          </View>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(300)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={backupData}
            >
              <View style={styles.settingLeft}>
                <User size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Export Logbook Data</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert(
                "Import Data",
                "This would open a file picker in a real application.",
                [{ text: "OK" }]
              )}
            >
              <View style={styles.settingLeft}>
                <User size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Import Logbook Data</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        <Animated.View 
          entering={FadeInDown.duration(400).delay(400)}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Support</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert(
                "Help Center",
                "This would open the help center in a real application.",
                [{ text: "OK" }]
              )}
            >
              <View style={styles.settingLeft}>
                <HelpCircle size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>Help Center</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert(
                "About",
                "Digital Pilot Logbook v1.0.0\nDeveloped for TCAA (Tanzania Civil Aviation Authority)\n\nA comprehensive digital solution for pilots to track, manage, and report their flight hours and credentials.",
                [{ text: "OK" }]
              )}
            >
              <View style={styles.settingLeft}>
                <Info size={20} color="#6B7280" style={styles.settingIcon} />
                <Text style={styles.settingText}>About</Text>
              </View>
              <ChevronRight size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 20 : 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0A2463',
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#FFFFFF',
  },
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  cameraButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#3E92CC',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 8,
  },
  licenseContainer: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  licenseText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#0A2463',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#0A2463',
    marginBottom: 12,
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-Bold',
  },
  footer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
});