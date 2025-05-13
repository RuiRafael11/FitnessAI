import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider } from '../lib/auth';
import { preloadPortugueseFoods } from '../services/firebase';

export default function RootLayout() {
  useEffect(() => {
    // Preload Portuguese foods data
    preloadPortugueseFoods().catch(console.error);
  }, []);

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
