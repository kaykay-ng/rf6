import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Oswald_400Regular, Oswald_700Bold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontFamily: 'Oswald_700Bold',
          fontSize: 20,
        },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="index"   options={{ title: 'MAP' }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login"   options={{ title: 'LOG IN', headerBackTitle: '' }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
    </Stack>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
