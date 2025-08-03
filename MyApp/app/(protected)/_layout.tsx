import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/phone-entry" />;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
