import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { Redirect, Stack } from 'expo-router';
import React from "react";
import 'react-native-reanimated';
//const isLoggedIn = false;


function ProtectedLayout() {

    // if (!isLoggedIn) {
    //   return <Redirect href= "/(auth)/OnBoard" />
    // }
    const {authStatus} = useAuthenticator();

    if (authStatus == 'unauthenticated') {
      return <Redirect href={'/(auth)/OnBoard'} />
    }


  return (




    <Stack>

      <Stack.Screen name="(tabs)" options={{ 
        headerShown: false,
        gestureEnabled: false
       }} />
      
      <Stack.Screen name="+not-found" />

    </Stack>




  );
}
export default ProtectedLayout;