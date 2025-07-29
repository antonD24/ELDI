import type { Schema } from "@/amplify/data/resource";
import { useButtonScaleAnimation } from "@/hooks/useButtonScaleAnimation";
import { AuthUser, getCurrentUser } from "aws-amplify/auth";
import { generateClient } from 'aws-amplify/data';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



export default function editProfile() {

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

  // State to track if profile exists and loading state
  const [profileExists, setProfileExists] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);

  // Check if user profile exists and load data
  useEffect(() => {
    const checkAndLoadProfile = async () => {
      try {
        setIsLoading(true);
        const { data: users, errors } = await client.models.User.list();
        
        if (errors) {
          console.error('Errors fetching user data:', errors);
          setIsLoading(false);
          return;
        }

        if (users && users.length > 0) {
          // Profile exists, load the data
          const user = users[0];
          setProfileExists(true);
          setExistingProfileId(user.id);
          
          // Pre-fill the form with existing data
          setFirstName(user.firstname || '');
          setLastName(user.lastname || '');
          setDob(user.dob || '');
          setPhoneNumber(user.phone || '');
          setIdNumber(user.id || '');
          setEmail(user.email || '');
          setAddress(user.homeaddress || '');
          setICEname(user.ICEname || '');
          setICEphone(user.ICEphone || '');
          setRelationship(user.relationshipstatus || '');
        } else {
          // No profile exists
          setProfileExists(false);
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAndLoadProfile();
  }, []);

  // Function to clear the form
  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setDob('');
    setPhoneNumber('');
    setIdNumber('');
    setEmail('');
    setAddress('');
    setICEname('');
    setICEphone('');
    setRelationship('');
  };



    const saveProfileData = async () => {
        try {
          setIsSaving(true);
          
          // Validate required fields
          if (!idNumber || !email) {
            alert('ID Number and Email are required fields');
            setIsSaving(false);
            return;
          }

          // Validate and format date if provided
          let formattedDob = '';
          if (dob) {
            const dobDate = new Date(dob);
            if (isNaN(dobDate.getTime())) {
              alert('Please enter a valid date format (YYYY-MM-DD)');
              return;
            }
            formattedDob = dobDate.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
          }

          // Validate and format phone numbers for UK format
          const formatPhoneNumber = (phone: string): string | undefined => {
            if (!phone) return undefined;
            
            // Remove all non-digit characters
            const digitsOnly = phone.replace(/\D/g, '');
            
            // UK mobile numbers are typically 11 digits (including the leading 0)
            // UK landline numbers can be 10-11 digits
            if (digitsOnly.length < 10 || digitsOnly.length > 14) {
              throw new Error('UK phone number must be 10-11 digits');
            }
            
            // Handle UK phone number formatting
            if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
              // Remove leading 0 and add +44
              return `+44${digitsOnly.substring(1)}`;
            } else if (digitsOnly.length === 10) {
              // Assume it's missing the leading 0, add +44
              return `+44${digitsOnly}`;
            } else if (digitsOnly.length === 11 && !digitsOnly.startsWith('0')) {
              // Already in correct format without country code
              return `+44${digitsOnly}`;
            } else {
              // If it already has country code or other format
              return `+${digitsOnly}`;
            }
          };

          let formattedPhone = undefined;
          let formattedICEPhone = undefined;

          try {
            formattedPhone = formatPhoneNumber(phoneNumber);
            formattedICEPhone = formatPhoneNumber(ICEphone);
          } catch (phoneError) {
            alert(`Phone number error: ${phoneError instanceof Error ? phoneError.message : 'Invalid phone number format'}`);
            setIsSaving(false);
            return;
          }

          const profileData = {
            id: idNumber, 
            firstname: firstName,
            lastname: lastName,
            dob: formattedDob || '', // Ensure dob is always a string
            phone: formattedPhone,
            homeaddress: address,
            ICEname: ICEname,
            relationshipstatus: relationship,
            ICEphone: formattedICEPhone ?? '',
            email: email
          };

          let result;
          
          if (profileExists && existingProfileId) {
            // Update existing profile
            result = await client.models.User.update({
              id: existingProfileId,
              firstname: firstName,
              lastname: lastName,
              dob: formattedDob,
              phone: formattedPhone,
              homeaddress: address,
              ICEname: ICEname,
              relationshipstatus: relationship,
              ICEphone: formattedICEPhone,
              email: email
            });
            console.log('User profile updated successfully:', result);
            alert('Profile updated successfully!');
          } else {
            // Create new profile
            result = await client.models.User.create(profileData);
            console.log('User profile created successfully:', result);
            alert('Profile created successfully!');
            setProfileExists(true);
            setExistingProfileId(result.data?.id || null);
          }

          // Clear the form after a short delay to let user see the success message
          setTimeout(() => {
            clearForm();
            setIsSaving(false);
            // Navigate back to profile page to trigger reload
            router.back();
          }, 1000);
          
        } catch (error) {
          setIsSaving(false);
          console.error('Error saving profile:', error);
          
          // Check if the error is due to duplicate ID (only for create operations)
          if (!profileExists && error instanceof Error) {
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.includes('duplicate') || 
                errorMessage.includes('already exists') || 
                errorMessage.includes('unique constraint') ||
                errorMessage.includes('conditional request failed')) {
              alert(`A profile with ID number "${idNumber}" already exists. Please use a different ID number.`);
              setIsSaving(false);
              return;
            }
          }
          
          // Generic error message for other types of errors
          alert(`Failed to ${profileExists ? 'update' : 'save'} profile. Please try again.`);
          setIsSaving(false);
        }
      };



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
      {isLoading ? (
        <View className="flex-1 justify-center items-center bg-sky-950">
          <Text className="text-white text-xl">Loading profile...</Text>
        </View>
      ) : (
        <View className="flex-1 w-full items-center justify-start mx-auto">
          <View className="bg-sky-950 w-full h-[85%] pb-5 items-center justify-start rounded-bl-[50px] rounded-br-[50px] shadow-md">
            <Text className="text-white text-lg font-semibold mt-4 mb-2">
              {profileExists ? 'Update Profile' : 'Create Profile'}
            </Text>
            <ScrollView className="w-full h-full p-6" contentContainerStyle={{ alignItems: 'center', gap: 10 }}>
            <Text className="text-white text-sm font-medium mt-2">National ID Number</Text>
            <TextInput
              value={idNumber}
              onChangeText={setIdNumber}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='ID Number'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center justify-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">First Name</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='First Name'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center justify-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">Last Name</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='Last Name'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">Date of Birth</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='YYYY-MM-DD'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='07123 456789'
              placeholderTextColor='gray'
              keyboardType='phone-pad'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">Home Address</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='Home Address'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />

            <Text className="text-white text-sm font-medium mt-2">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='Email'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />

            <Text className="text-white text-sm font-medium mt-2">Emergency Contact Name</Text>
            <TextInput
              value={ICEname}
              onChangeText={setICEname}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='Emergency Contact Name'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">Emergency Contact Phone Number</Text>
            <TextInput
              value={ICEphone}
              onChangeText={setICEphone}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='07123 456789'
              placeholderTextColor='gray'
              keyboardType='phone-pad'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />
            <Text className="text-white text-sm font-medium mt-2">Relationship</Text>
            <TextInput
              value={relationship}
              onChangeText={setRelationship}
              autoCorrect={false}
              autoCapitalize='none'
              placeholder='Relationship'
              placeholderTextColor='gray'
              className="bg-gray-100 w-full text-lg px-4 py-4 text-center rounded-[50px]" />

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

          <AnimatedPressable 
            style={{ transform: [{ scale: EditScale }] }}
            onPressIn={EditIn}
            onPressOut={EditOut}
            onPress={() => saveProfileData()}
            disabled={isSaving}
            className={`w-[45%] px-6 py-6 rounded-full justify-center items-center shadow-md ${isSaving ? 'bg-gray-500' : 'bg-sky-950'}`}>
            <Text className="text-white text-xl mx-auto font-semibold">
              {isSaving ? 'Saving...' : (profileExists ? 'Update' : 'Save')}
            </Text>
          </AnimatedPressable>

        </View>
        </View>
      )}
    </SafeAreaView>
  );


}
