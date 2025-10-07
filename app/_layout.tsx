import { useColorScheme } from '@/hooks/useColorScheme';

import { Authenticator } from '@aws-amplify/ui-react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import "../global.css";
import { configureAmplify } from '../hooks/configureAmplify';

SplashScreen.preventAutoHideAsync().catch(() => { /* noop */ });

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    (async () => {
      try {
        await configureAmplify();
      } finally {
        setReady(true);
        // Hide splash once configured
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, []);

  if (!ready || !loaded) {
    // Keep splash until both ready and fonts are loaded
    return null;
  }

      

    return (

        <Authenticator.Provider>

        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(auth)/OnBoard" options={{
            headerShown: false,
            gestureEnabled: false,
            }} />

            <Stack.Screen name="(auth)/signin" options={{
                headerShown: false,
                presentation: "modal",
                gestureEnabled: false,
                }} />

                <Stack.Screen name="(auth)/resetPassword" options={{
                headerShown: false,
                presentation: "modal",
                gestureEnabled: false,
                }} />

             <Stack.Screen name="(auth)/signup" options={{
                headerShown: false,
                presentation: "modal",
                gestureEnabled: false,
                }} />
            <Stack.Screen name="(protected)" options={{
              headerShown: false,
              gestureEnabled: false,
              }} />

              

              
            
            

        </Stack>
    
        </ThemeProvider>
        </Authenticator.Provider>

    )
}