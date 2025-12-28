import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreenLibrary from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { Colors } from '@/constants/theme';
import { ThemeProvider as AppThemeProvider, useTheme } from '@/context/ThemeContext';
import '@/i18n';

// Keep the splash screen visible while we fetch resources
SplashScreenLibrary.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const { colorScheme } = useTheme();
  const { isLoading: isAuthLoading } = useAuth();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        if (!isAuthLoading) {
          // Add a small artificial delay to ensure smooth transition
          await new Promise(resolve => setTimeout(resolve, 500));
          setAppIsReady(true);
          try {
            await SplashScreenLibrary.hideAsync();
          } catch (e) {
            // Ignore "No native splash screen" error
          }
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [isAuthLoading]);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.container}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade_from_bottom',
            contentStyle: { backgroundColor: Colors[colorScheme].background }
          }}
        >
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_right'
            }}
          />
          <Stack.Screen
            name="item/[id]"
            options={{
              headerShown: true,
              title: 'Item Details',
              headerStyle: {
                backgroundColor: Colors[colorScheme].background,
              },
              headerTintColor: Colors[colorScheme].text,
              headerShadowVisible: false,
            }}
          />
        </Stack>

        {splashVisible && (
          <SplashScreen onAnimationComplete={() => setSplashVisible(false)} />
        )}
      </View>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
