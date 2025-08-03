import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '@/utils/api';
import { isAxiosError } from 'axios';

export default function VerifyOtpScreen() {
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [resendCooldown, setResendCooldown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await api.post('/auth/otp/send', { phoneNumber });
      setResendCooldown(30);
      setCanResend(false);
      Alert.alert('Success', 'A new verification code has been sent.');
    } catch (e: any) {
      const errorMessage = isAxiosError(e) && e.response?.data?.error
        ? e.response.data.error
        : 'An unexpected error occurred.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Verification code is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/otp/verify', {
        phoneNumber,
        otp,
      });

      const { token, user } = response.data;
      login(token, user);
      router.replace('/(protected)/(tabs)');
    } catch (e: any) {
      const errorMessage = isAxiosError(e) && e.response?.data?.error
        ? e.response.data.error
        : 'An unexpected error occurred.';
      Alert.alert('Verification Failed', errorMessage);
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
      <ThemedText style={styles.title}>Enter Verification Code</ThemedText>
      <ThemedText style={styles.description}>
        A code has been sent to {phoneNumber}.
      </ThemedText>
      <TextInput
        style={styles.input}
        placeholder="6-digit code"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        placeholderTextColor={Colors[colorScheme ?? 'light'].secondaryText}
        autoFocus
      />
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Verify" onPress={handleVerifyOtp} />
      )}
      <View style={{ marginTop: 20 }}>
        <Button 
          title={canResend ? "Resend Code" : `Resend in ${resendCooldown}s`}
          onPress={handleResendOtp} 
          disabled={!canResend}
        />
      </View>
    </ThemedView>
  );
} 