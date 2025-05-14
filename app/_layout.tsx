import { Stack } from "expo-router";
import "../global.css";
import { enableScreens } from "react-native-screens";
import GlobalProvider from '../context/GlobalProvider';
import { useFonts } from 'expo-font';
import { useCallback, useEffect } from 'react';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

enableScreens();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Sour Gummy Black": require("../assets/fonts/Sour Gummy Black.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GlobalProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </GlobalProvider>
  );
}