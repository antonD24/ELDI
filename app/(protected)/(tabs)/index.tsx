
import type { Schema } from '@/amplify/data/resource';
import { useButtonScaleAnimation } from '@/hooks/useButtonScaleAnimation';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Animated, Pressable, Text, View } from 'react-native';



export default function HomeScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const router = useRouter();

  const fetchUser = async () => {
    const res = await getCurrentUser();
    return res;
  };

  const client = generateClient<Schema>();

  const { location, errorMsg } = useLiveLocation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ICEname, setICEname] = useState('');
  const [relationship, setRelationship] = useState('');
  const [ICEphone, setICEphone] = useState('');

  useEffect(() => {
    fetchUser().then(user => setUser(user));
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        console.log('Loading profile for authenticated user:', user.userId);
        
        // List all users for the current authenticated user (using owner authorization)
        const { data: users, errors } = await client.models.User.list();
        
        console.log('User list response:', { users, errors });
        
        if (errors) {
          console.error('Errors fetching user data:', errors);
          return;
        }

        if (users && users.length > 0) {
          // Profile exists, load the first one (there should only be one per authenticated user)
          const userData = users[0];
          console.log('User data loaded:', userData);
          setUserData(userData);
          setHasProfile(true);
          setFirstName(userData.firstname);
          setLastName(userData.lastname);
          setDob(userData.dob);
          setPhoneNumber(userData.phone || '');
          setEmail(userData.email || '');
          setAddress(userData.homeaddress || '');
          setICEname(userData.ICEname || '');
          setRelationship(userData.relationshipstatus || '');
          setICEphone(userData.ICEphone || '');
        } else {
          console.log('No user profile found - user needs to complete profile');
          setHasProfile(false);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        setHasProfile(false);
      }
    };
    loadProfileData();
  }, [user]);

  const sendEmergency = async () => {
    try {
      if (!location) {
        console.error('Location not available');
        Alert.alert('Location Error', 'Your location is not available. Please enable location services.');
        return;
      }

      if (!user) {
        console.error('User not authenticated');
        Alert.alert('Authentication Error', 'You are not authenticated. Please log in again.');
        return;
      }

      if (!hasProfile) {
        Alert.alert(
          'Profile Required', 
          'You need to complete your profile before sending emergency alerts. Would you like to create your profile now?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Create Profile', onPress: () => router.push('/editProfile') }
          ]
        );
        return;
      }

      // Validate required fields
      console.log('Validating fields:', {
        firstName,
        lastName,
        dob,
        phoneNumber,
        ICEname,
        ICEphone,
        relationship
      });

      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!dob) missingFields.push('dob');
      if (!phoneNumber) missingFields.push('phoneNumber');
      if (!ICEname) missingFields.push('ICEname');
      if (!ICEphone) missingFields.push('ICEphone');
      if (!relationship) missingFields.push('relationship');

      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        Alert.alert(
          'Incomplete Profile', 
          'Your profile is missing some required information. Please update your profile.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Update Profile', onPress: () => router.push('/editProfile') }
          ]
        );
        return;
      }

      // Ensure the date is in the correct format (YYYY-MM-DD)
      const formattedDob = dob ? new Date(dob).toISOString().split('T')[0] : '';

      const emergencyData = {
        content: `Emergency alert! I need immediate assistance!`,
        natid: userData?.id || user.userId, // Use the profile ID or fall back to auth user ID
        firstname: firstName,
        lastname: lastName,
        dob: formattedDob,
        email: email || '', // Provide empty string if email is not available
        phone: phoneNumber,
        homeaddress: address || '', // Provide empty string if address is not available
        ICEname: ICEname,
        ICEphone: ICEphone,
        relationshipstatus: relationship,
        location: {
          lat: location.coords.latitude,
          long: location.coords.longitude,
        },
      };

      console.log('Emergency data being sent:', emergencyData);
      const result = await client.models.Emergency.create(emergencyData);
      console.log('Emergency created successfully:', result);
      
      if (result.data) {
        Alert.alert('Emergency Alert Sent', 'Your emergency alert has been sent successfully!');
      } else {
        console.error('Emergency creation failed:', result.errors);
        Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
      }
      
    } catch (error) {
      console.error('Error creating emergency:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  // Animation hook
    const { scale: EmergencyScale, animateIn: EmergencyIn, animateOut: EmergencyOut } = useButtonScaleAnimation();
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


  return (

    <View className="flex-1 justify-center items-center">

    <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
      
    </View>

      {/* Emergency Button */}
      <AnimatedPressable  style={{ transform: [{ scale: EmergencyScale }] }}
                        onPressIn={EmergencyIn}
                        onPressOut={EmergencyOut}
                        onPress={() => {
                          sendEmergency();
                          console.log('Emergency button pressed');
                        }}
      className="w-[50%] aspect-square bg-red-600 rounded-full shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] items-center justify-center z-10">
        <Text className="text-white text-xl font-normal">Emergency</Text>
      </AnimatedPressable>

      {/* Status Panel */}
      <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-sky-950 rounded-tl-[50px] rounded-tr-[50px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-4 items-center justify-center">
        <View className="mx-auto my-auto w-[95%] h-[30%] bg-slate-900 rounded-[50px] mt-1 items-center justify-center px-6 py-4">


        </View>
      


      {/* Coordinates Pane */}

      <View className="absolute bottom-32 w-[95%] h-[30%] bg-slate-900 rounded-[50px] px-6 py-4">
        <View className="h-px w-[90%] bg-gray-400 mx-auto my-auto">
          <View className="flex-row justify-around items-center">
            {/* LAT */}
            <View className="flex-row pt-3 items-center gap-2">
              <View className="absolute bottom-16 left-3 my-1 w-28 h-8 bg-slate-800 rounded-[40px] items-center justify-center">

                  <Text className='color-white text-lg'>{location?.coords.latitude.toFixed(4)}</Text>



              </View>
              <View className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-800 items-center justify-center flex">
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} className="w-full h-0.5 bg-white my-0.5" />
                ))}
              </View>


              <Text className="text-white">Latitude</Text>
            </View>
            {/* LONG */}
            <View className="flex-row pt-3 items-center gap-2">
              <View className="absolute bottom-16 left-3 my-1 w-28 h-8 bg-slate-800 rounded-[40px] items-center justify-center">
                <Text className='color-white text-lg'>{location?.coords.longitude.toFixed(4)}</Text>
              </View>
              <View className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-slate-800 items-center justify-center transform rotate-90 flex">
                {Array.from({ length: 6 }).map((_, i) => (
                  <View key={i} className="w-full h-0.5 bg-white my-0.5" />
                ))}
              </View>
              <Text className="text-white">Longitude</Text>
            </View>
          </View>
        </View>
      </View>
      </View>
    </View>










  );
}

