import { useColorScheme } from '@/hooks/useColorScheme';
import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react-native";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Amplify } from "aws-amplify";
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from "react";
import { Button } from 'react-native';
import 'react-native-reanimated';
import outputs from "../amplify_outputs.json";
import "../global.css";

Amplify.configure(outputs);

function SignOutButton() {
  const { signOut } = useAuthenticator();
  return <Button title="Sign Out" onPress={signOut} />;
}


function RootLayout() {

  

  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <Authenticator.Provider>
      <Authenticator>
        
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />

      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
    </Authenticator>
    </Authenticator.Provider>
  );
}
export default RootLayout;