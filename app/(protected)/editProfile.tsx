import { useButtonScaleAnimation } from "@/hooks/useButtonScaleAnimation";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Animated, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function editProfile() {

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
  const { scale: cancelScale, animateIn: cancelIn, animateOut: cancelOut } = useButtonScaleAnimation();
  const { scale: confirmScale, animateIn: confirmIn, animateOut: confirmOut } = useButtonScaleAnimation();
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const [user, setUser] = React.useState<AuthUser>();

  const fetchUser = async () => {
    const res = await getCurrentUser();
    setUser(res);
  };
  React.useEffect(() => {
    fetchUser();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 w-[90%] items-center justify-start mt-5 mx-auto">
        <View className="bg-sky-950 w-full h-[85%] items-center justify-start rounded-[50px] shadow-md">
          <ScrollView className="w-full h-full p-6" contentContainerStyle={{ alignItems: 'center', gap: 10 }}>
            <Text className="text-white text-sm font-medium mt-2">ID number</Text>
            <TextInput 
            value={idNumber}
            onChangeText={setIdNumber}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='ID Number'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">First Name</Text>
            <TextInput 
            value={firstName}
            onChangeText={setFirstName}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='First Name'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Last Name</Text>
            <TextInput 
            value={lastName}
            onChangeText={setLastName}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Last Name'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Date of Birth</Text>
            <TextInput 
            value={dob}
            onChangeText={setDob}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Date of Birth'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Phone Number</Text>
            <TextInput 
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Phone Number'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Home Address</Text>
            <TextInput
            value={address}
            onChangeText={setAddress}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Home Address'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Next of Kin</Text>
            <TextInput
            value={nextOfKin}
            onChangeText={setNextOfKin}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Next of Kin Name'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Next of Kin Phone Number</Text>
            <TextInput 
            value={kinPhoneNumber}
            onChangeText={setKinPhoneNumber}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Next of Kin Phone Number'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            <Text className="text-white text-sm font-medium mt-2">Relationship</Text>
            <TextInput 
            value={relationship}
            onChangeText={setRelationship}
            autoCorrect={false}
            autoCapitalize='none'
            placeholder='Relationship'
            placeholderTextColor='gray'
            className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]"/>
            
          </ScrollView>
        </View>

        <View className="flex-row justify-around absolute bottom-[1%] w-full">

          <AnimatedPressable style={{ transform: [{ scale: cancelScale }] }}
            onPressIn={cancelIn}
            onPressOut={cancelOut}
            onPress={() => router.back()}
            className="bg-sky-950 w-[45%] px-6 py-6 rounded-full justify-center items-center shadow-md">
            <Text className="text-white text-xl mx-auto font-semibold">Cancel</Text>
          </AnimatedPressable>

          <AnimatedPressable style={{ transform: [{ scale: EditScale }] }}
            onPressIn={EditIn}
            onPressOut={EditOut}
            onPress={() => console.log("Save Profile")}
            className="bg-sky-950 w-[45%] px-6 py-6 rounded-full justify-center items-center shadow-md">
            <Text className="text-white text-xl mx-auto font-semibold">Save</Text>
          </AnimatedPressable>


        </View>
      </View>
    </SafeAreaView>

  );


}
