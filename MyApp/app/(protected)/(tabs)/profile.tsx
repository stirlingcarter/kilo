import React, { useState, useEffect } from 'react';
import { StyleSheet, Button, View, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/utils/api';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface UserProfile {
  name: string;
  phoneNumber: string;
}

export default function ProfileScreen() {
  const { logout, token, user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Log token and user info
        console.log('=== PROFILE PAGE DEBUG ===');
        console.log('Token:', token);
        console.log('User from context:', JSON.stringify(user, null, 2));
        
        // Log the request details
        console.log('Making request to /users/me...');
        const response = await api.get('/users/me');
        console.log('Profile response:', JSON.stringify(response.data, null, 2));
        
        setProfile(response.data);
      } catch (error) {
        console.error('Profile fetch error:', JSON.stringify(error, null, 2));
        Alert.alert('Error', 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText>Loading Profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Your Profile</ThemedText>
      
      {profile ? (
        <ThemedView style={styles.authInfoContainer}>
          <ThemedText style={styles.authInfoText}>Name: {profile.name}</ThemedText>
          <ThemedText style={styles.authInfoText}>Phone: {profile.phoneNumber}</ThemedText>
        </ThemedView>
      ) : (
        <ThemedText>Could not load profile information.</ThemedText>
      )}
      
      <Button title="Logout" onPress={logout} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  description: {
    marginTop: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  authInfoContainer: {
    marginVertical: 20,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  authInfoText: {
    marginVertical: 5,
  },
}); 