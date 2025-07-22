import { useColorScheme } from '@/hooks/useColorScheme';
import { Authenticator } from '@aws-amplify/ui-react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import "../global.css";
export default function RootLayout() {

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