import { useEffect } from 'react';
import { Stack, useNavigation } from 'expo-router';
import { SplashScreen } from 'expo-router';
import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Barlow_700Bold } from '@expo-google-fonts/barlow';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '@/constants/theme';
import { SessionProvider } from '@/context/session';
import { Pressable, Text } from 'react-native';

SplashScreen.preventAutoHideAsync();

function HamburgerButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => (navigation as any).openDrawer?.()}
      style={{ paddingHorizontal: 16, paddingVertical: 8 }}
    >
      <Text style={{ fontSize: 24, color: Colors.text }}>☰</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Oswald_400Regular, Oswald_700Bold, Barlow_700Bold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
    <SessionProvider>
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
      <Stack.Screen name="index"   options={{ title: 'BOND' }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="login"   options={{ title: 'LOG IN', headerBackTitle: '' }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ title: 'BOND', headerLeft: () => <HamburgerButton /> }} />
    </Stack>
    </SessionProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
