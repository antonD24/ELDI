import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { Stack, useRouter } from 'expo-router';
import React from "react";
import 'react-native-reanimated';



export default function ProtectedLayout() {

   
    const {authStatus} = useAuthenticator();
    const router = useRouter();

    React.useEffect(() => {
      if (authStatus === 'unauthenticated') {
        router.replace('/(auth)/OnBoard');
      }
    }, [authStatus, router]);

    if (authStatus === 'unauthenticated') {
      return null;
    }


  return (




    <Stack>

      <Stack.Screen name="(tabs)" options={{ 
        headerShown: false,
        gestureEnabled: false
       }} />
      
      <Stack.Screen name="+not-found" />
      <Stack.Screen name="editProfile" options={{ 
                headerShown: false,
                presentation: "modal",
                gestureEnabled: false,
       }} />
       
      

    </Stack>




  );
}
