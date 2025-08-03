import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import api from '@/utils/api';
import { isAxiosError } from 'axios';

export default function PhoneEntryScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleSendOtp = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Phone number is required.');
      return;
    }

    // Format phone number - ensure it starts with +1 if it doesn't have a country code
    let formattedPhoneNumber = phoneNumber.trim().replace(/\D/g, ''); // Remove non-digits
    if (formattedPhoneNumber.length === 10) {
      formattedPhoneNumber = '+1' + formattedPhoneNumber; // Add US country code
    } else if (formattedPhoneNumber.length === 11 && formattedPhoneNumber.startsWith('1')) {
      formattedPhoneNumber = '+' + formattedPhoneNumber; // Add + to existing country code
    } else if (!formattedPhoneNumber.startsWith('+')) {
      formattedPhoneNumber = '+' + formattedPhoneNumber; // Add + if missing
    }

    console.log('Original phone number:', phoneNumber);
    console.log('Formatted phone number:', formattedPhoneNumber);

    setLoading(true);
    try {
      await api.post('/auth/otp/send', {
        phoneNumber: formattedPhoneNumber,
      });
      router.push({
        pathname: '/verify-otp',
        params: { phoneNumber: formattedPhoneNumber },
      });
    } catch (e: any) {
      console.error('Send OTP Error:', JSON.stringify(e, null, 2));
      const errorMessage = isAxiosError(e) && e.response?.data?.error
        ? e.response.data.error
        : 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      height: 40,
      borderColor: Colors[colorScheme ?? 'light'].border,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 12,
      paddingHorizontal: 10,
      color: Colors[colorScheme ?? 'light'].text,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    }
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Enter Your Phone Number</ThemedText>
      <ThemedText style={styles.description}>
        We'll send you a verification code.
      </ThemedText>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        keyboardType="phone-pad"
        placeholderTextColor={Colors[colorScheme ?? 'light'].secondaryText}
        autoFocus
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Send Code" onPress={handleSendOtp} />
      )}
    </ThemedView>
  );
} 