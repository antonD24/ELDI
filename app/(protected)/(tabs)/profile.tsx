import { type Schema } from "@/amplify/data/resource";
import { useButtonScaleAnimation } from "@/hooks/useButtonScaleAnimation";
import { useFocusEffect } from '@react-navigation/native';
import { generateClient } from 'aws-amplify/data';
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function TabThreeScreen() {

   const client = generateClient<Schema>();
   
     //Personal Data Store
   
     const [firstName, setFirstName] = useState('');
     const [lastName, setLastName] = useState('');
     const [dob, setDob] = useState('');
     const [phoneNumber, setPhoneNumber] = useState('');
     const [idNumber, setIdNumber] = useState('');
     const [email, setEmail] = useState('');
     const [address, setAddress] = useState('');
     const [ICEname, setICEname] = useState('');
     const [relationship, setRelationship] = useState('');
     const [ICEphone, setICEphone] = useState('');
   
   
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const [profileExists, setProfileExists] = useState<boolean>(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const { data: User, errors } = await client.models.User.list()
      if (errors) {
        console.error('Errors fetching user data:', errors);
        setError('Failed to fetch profile');
        return;
      }
      if (User && User.length > 0) {
        setProfileExists(true);
        setFirstName(User[0]?.firstname || '');
        setLastName(User[0]?.lastname || ''); 
        setDob(User[0]?.dob ? new Date(User[0].dob).toLocaleDateString() : '');
        setPhoneNumber(User[0]?.phone || '');
        setIdNumber(User[0]?.id || '');
        setEmail(User[0]?.email || '');
        setAddress(User[0]?.homeaddress || '');
        setICEname(User[0]?.ICEname || '');
        setICEphone(User[0]?.ICEphone || '');
        setRelationship(User[0]?.relationshipstatus || '');
      } else {
        setProfileExists(false);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Reload profile data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );


  const router = useRouter();


  // Animation hook
  const { scale: EditScale, animateIn: EditIn, animateOut: EditOut } = useButtonScaleAnimation();
 
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  

  return (
    <SafeAreaView className="flex-1  bg-sky-950">
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-xl">Loading profile...</Text>
        </View>
      ) : (
        <View className="flex-1 w-full items-center justify-center mx-auto">
        <View className=" w-full h-[77%] items-center justify-center mt-5 rounded-[50px] shadow-md">
          <ScrollView className="w-full h-full p-6" contentContainerStyle={{ alignItems: 'center', gap: 10 }}>
            <Text className="text-white text-sm font-medium mt-2">National ID Number</Text>
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

            <Text className="text-white text-sm font-medium mt-2">Email</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {email || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Home Address</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {address || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Emergency Contact Name</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {ICEname || 'Not provided'}
            </Text>

            <Text className="text-white text-sm font-medium mt-2">Emergency Contact Phone Number</Text>
            <Text className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]">
              {ICEphone || 'Not provided'}
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
            className="bg-black w-full px-6 py-6 mb-2 mt-2 rounded-full shadow-md">
            <Text className="text-white text-xl mx-auto font-semibold">
              {profileExists ? 'Edit Profile' : 'Create Profile'}
            </Text>
          </AnimatedPressable>
        </View>
        </View>
      )}
    </SafeAreaView>
  );


}
