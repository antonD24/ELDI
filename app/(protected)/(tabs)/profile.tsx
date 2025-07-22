import { useButtonScaleAnimation } from "@/hooks/useButtonScaleAnimation";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function TabThreeScreen() {

  //Personal Data Store
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');
  const [nextOfKin, setNextOfKin] = useState('');
  const [relationship, setRelationship] = useState('');
  const [kinPhoneNumber, setKinPhoneNumber] = useState('');


  const router = useRouter();


  // Animation hook
  const { scale: EditScale, animateIn: EditIn, animateOut: EditOut } = useButtonScaleAnimation();
 
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 w-[90%] items-center justify-center mx-auto">
        <View className="bg-sky-950 w-full h-[77%] items-center justify-center mt-5 rounded-[50px] shadow-md">
          <ScrollView className="w-full h-full p-6" contentContainerStyle={{ alignItems: 'center', gap: 10 }}>
            <Text className="text-white text-sm font-medium mt-2">ID number</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {idNumber || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">First Name</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {firstName || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Last Name</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {lastName || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Date of Birth</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {dob || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Phone Number</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {phoneNumber || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Home Address</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {address || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Next of Kin</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {nextOfKin || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Next of Kin Phone Number</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {kinPhoneNumber || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Relationship</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {relationship || 'Not provided'}
            </Text>
            <Text></Text>
          </ScrollView>
        </View>

        <View className="flex-1 w-[100%] justify-end mb-20 px-4">
          <AnimatedPressable style={{ transform: [{ scale: EditScale }] }}
            onPressIn={EditIn}
            onPressOut={EditOut}
            onPress={() => router.push('/(protected)/editProfile')}
            className="bg-sky-950 w-full px-6 py-6 mb-2 mt-2 rounded-full shadow-md">
            <Text className="text-white text-xl mx-auto font-semibold">Edit Profile</Text>
          </AnimatedPressable>
        </View>
      </View>
    </SafeAreaView>
  );


}
