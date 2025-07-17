import { useAuthenticator } from "@aws-amplify/ui-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";


export default function TabThreeScreen() {

  const { signOut } = useAuthenticator();




  return (
      <View className="justify-center items-center flex-1 ">
      

      <Pressable onPress={() => signOut()} className="bg-slate-900 w-[45%] px-6 py-6 rounded-full shadow-md">
        <Text className="text-white text-xl mx-auto font-semibold">Sign Out</Text>
      </Pressable>
    </View>

    );


}
