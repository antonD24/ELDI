
import type { Schema } from '@/amplify/data/resource';
import { useButtonScaleAnimation } from '@/hooks/useButtonScaleAnimation';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import { generateClient } from 'aws-amplify/data';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, Text, View } from 'react-native';



export default function HomeScreen() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(false);
  const [hasActiveEmergency, setHasActiveEmergency] = useState<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hapticMilestones, setHapticMilestones] = useState<Set<number>>(new Set());
  const [lastButtonPress, setLastButtonPress] = useState<number>(0);
  const router = useRouter();

  // Refs for hold functionality
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressAnimationRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStartTimeRef = useRef<number>(0);

  const HOLD_DURATION = 3000; // 5 seconds in milliseconds

  const fetchUser = async () => {
    const res = await getCurrentUser();
    return res;
  };

  const client = generateClient<Schema>();

  const { location, errorMsg } = useLiveLocation();

  const [idNumber, setIDNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
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
          setIDNumber(userData.id);
          setFirstName(userData.firstname);
          setLastName(userData.lastname);
          setDob(userData.dob);
          setPhoneNumber(userData.phone || '');
          setEmail(userData.email || '');
          setHomeAddress(userData.homeaddress || '');
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

  // Separate useEffect to check active emergency after profile data is loaded
  useEffect(() => {
    if (user && idNumber) {
      checkActiveEmergency();
    }
  }, [user, idNumber]);

  // Check for active emergency and set up subscription
  const checkActiveEmergency = async () => {
    if (!user) return;

    try {
      // Check for existing active emergency
      const { data: emergencies } = await client.models.Emergency.list({
        filter: {
          natid: { eq: idNumber}, 
          isActive: { eq: true }
        }
      });

      setHasActiveEmergency(emergencies && emergencies.length > 0);

      // Set up subscription for onCreate events (immediate detection of new emergencies)
      const createSubscription = client.models.Emergency.onCreate({
        filter: {
          natid: { eq: idNumber }
        }
      }).subscribe({
        next: (emergency) => {
          console.log('New emergency created:', emergency);
          if (emergency.isActive) {
            setHasActiveEmergency(true);
            // Cancel any ongoing hold process
            cancelHold();
            setIsProcessing(false);
          }
        },
        error: (error) => {
          console.error('Create subscription error:', error);
        }
      });

      // Set up subscription for onUpdate events (when status changes)
      const updateSubscription = client.models.Emergency.onUpdate({
        filter: {
          natid: { eq: idNumber }
        }
      }).subscribe({
        next: (emergency) => {
          console.log('Emergency updated:', emergency);
          // If this emergency is no longer active, check if we have any other active ones
          if (!emergency.isActive) {
            checkForAnyActiveEmergencies();
          } else {
            setHasActiveEmergency(true);
          }
        },
        error: (error) => {
          console.error('Update subscription error:', error);
        }
      });

      // Return cleanup function
      return () => {
        createSubscription.unsubscribe();
        updateSubscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error checking active emergency:', error);
    }
  };

  // Helper function to check for any active emergencies
  const checkForAnyActiveEmergencies = async () => {
    if (!user) return;
    
    try {
      const { data: emergencies } = await client.models.Emergency.list({
        filter: {
          natid: { eq: idNumber },
          isActive: { eq: true }
        }
      });
      
      setHasActiveEmergency(emergencies && emergencies.length > 0);
    } catch (error) {
      console.error('Error checking for active emergencies:', error);
    }
  };

  // Cleanup effect
  useEffect(() => {
    let subscriptionCleanup: (() => void) | undefined;

    if (user && idNumber) {
      checkActiveEmergency().then((cleanup) => {
        subscriptionCleanup = cleanup;
      });
    }

    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      if (progressAnimationRef.current) {
        clearInterval(progressAnimationRef.current);
      }
      if (subscriptionCleanup) {
        subscriptionCleanup();
      }
    };
  }, [user, idNumber]);

  // Hold button functionality
  const startHold = () => {
    const now = Date.now();
    
    // Debounce rapid button presses (prevent starting within 500ms of last press)
    if (now - lastButtonPress < 500) {
      return;
    }
    
    setLastButtonPress(now);

    if (hasActiveEmergency || isProcessing || !hasProfile) return;

    // Haptic feedback on start
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setIsHolding(true);
    setHoldProgress(0);
    setHapticMilestones(new Set());
    holdStartTimeRef.current = Date.now();

    // Progress animation
    progressAnimationRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(elapsed / HOLD_DURATION, 1);
      setHoldProgress(progress);

      // Haptic feedback at milestones (only once per milestone)
      setHapticMilestones(prev => {
        const newMilestones = new Set(prev);
        
        if (progress >= 0.25 && !newMilestones.has(0.25)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          newMilestones.add(0.25);
        } else if (progress >= 0.5 && !newMilestones.has(0.5)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          newMilestones.add(0.5);
        } else if (progress >= 0.75 && !newMilestones.has(0.75)) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          newMilestones.add(0.75);
        }
        
        return newMilestones;
      });
    }, 50);

    // Hold completion timer
    holdTimerRef.current = setTimeout(() => {
      completeEmergencyRequest();
    }, HOLD_DURATION);
  };

  const cancelHold = () => {
    setIsHolding(false);
    setHoldProgress(0);
    setHapticMilestones(new Set());
    
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    
    if (progressAnimationRef.current) {
      clearInterval(progressAnimationRef.current);
      progressAnimationRef.current = null;
    }
  };

  const completeEmergencyRequest = async () => {
    // Check one more time before completing the request
    if (hasActiveEmergency) {
      console.log('Emergency already active, cancelling hold');
      cancelHold();
      setIsProcessing(false);
      return;
    }

    // Success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setIsHolding(false);
    setHoldProgress(0);
    setIsProcessing(true);

    // Clear timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressAnimationRef.current) {
      clearInterval(progressAnimationRef.current);
      progressAnimationRef.current = null;
    }

    await sendEmergency();
    setIsProcessing(false);
  };

  const sendEmergency = async () => {
    try {
      // Double-check for active emergency right before creating
      const { data: existingEmergencies } = await client.models.Emergency.list({
        filter: {
          natid: { eq: idNumber },
          isActive: { eq: true }
        }
      });

      if (existingEmergencies && existingEmergencies.length > 0) {
        console.log('Active emergency already exists, preventing duplicate');
        Alert.alert('Active Emergency', 'You already have an active emergency request.');
        setHasActiveEmergency(true);
        return;
      }

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
        relationship,
        idNumber,
        email,
        homeAddress,
      });

      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!dob) missingFields.push('dob');
      if (!phoneNumber) missingFields.push('phoneNumber');
      if (!ICEname) missingFields.push('ICEname');
      if (!ICEphone) missingFields.push('ICEphone');
      if (!relationship) missingFields.push('relationship');
      if (!idNumber) missingFields.push('idNumber');
      if (!email) missingFields.push('email');
      if (!homeAddress) missingFields.push('homeaddress');

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
        natid: idNumber, // Use the auth user ID consistently
        firstname: firstName,
        lastname: lastName,
        dob: formattedDob,
        email: email || '', // Provide empty string if email is not available
        phone: phoneNumber,
        homeaddress: homeAddress || '', // Provide empty string if address is not available
        ICEname: ICEname,
        ICEphone: ICEphone,
        relationshipstatus: relationship,
        location: {
          lat: location.coords.latitude,
          long: location.coords.longitude,
        },
      };

      console.log('Emergency data being sent:', emergencyData);
      
      // Optimistically set hasActiveEmergency to prevent UI race conditions
      setHasActiveEmergency(true);
      
      const result = await client.models.Emergency.create(emergencyData);
      console.log('Emergency created successfully:', result);
      
      if (result.data) {
        
      } else {
        console.error('Emergency creation failed:', result.errors);
        // Reset the optimistic update on failure
        setHasActiveEmergency(false);
        Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
      }
      
    } catch (error) {
      console.error('Error creating emergency:', error);
      // Reset the optimistic update on error
      setHasActiveEmergency(false);
      
      // Check if this is a duplicate error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        Alert.alert('Active Emergency', 'You already have an active emergency request.');
        setHasActiveEmergency(true);
      } else {
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
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
      <AnimatedPressable  
        style={{ transform: [{ scale: EmergencyScale }] }}
        onPressIn={() => {
          EmergencyIn();
          if (!hasProfile) {
            // Handle profile completion navigation
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/editProfile');
            return;
          }
          startHold();
        }}
        onPressOut={() => {
          EmergencyOut();
          if (hasProfile && !hasActiveEmergency && !isProcessing) {
            cancelHold();
          }
        }}
        disabled={hasActiveEmergency || isProcessing}
        className={`w-[50%] aspect-square rounded-full shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] items-center justify-center z-10 ${
          hasActiveEmergency || isProcessing
            ? 'bg-green-700' 
            : !hasProfile
              ? 'bg-blue-600'
            : isHolding 
              ? 'bg-red-700' 
              : 'bg-red-600'
        }`}>
        
        {/* Progress Indicator */}
        {isHolding && (
          <View className="absolute inset-2 items-center justify-center">
            {/* Background circle */}
            <View className="absolute w-full h-full rounded-full border-4 border-white opacity-20" />
            
            {/* Progress segments */}
            {Array.from({ length: 12 }).map((_, index) => {
              const segmentProgress = holdProgress * 12;
              const isActive = index < segmentProgress;
              const angle = (index * 30) - 90; // 360/12 = 30 degrees per segment, start from top
              
              return (
                <View
                  key={index}
                  className={`absolute w-1 h-6 rounded-full ${isActive ? 'bg-white' : 'bg-white opacity-20'}`}
                  style={{
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -45 } // Move to edge of circle
                    ]
                  }}
                />
              );
            })}
          </View>
        )}
        
        <View className="items-center justify-center">
          <Text className="text-white text-xl font-normal">
            {hasActiveEmergency 
              ? 'Active Emergency' 
              : isProcessing 
                ? 'Sending...' 
                : !hasProfile 
                  ? 'Complete Profile First' 
                  : isHolding 
                    ? `Hold ${Math.ceil((HOLD_DURATION - (holdProgress * HOLD_DURATION)) / 1000)}s` 
                    : 'Hold for Emergency'
            }
          </Text>
          {!hasProfile && (
            <Text className="text-white text-sm mt-1 opacity-75">
              Tap to create profile
            </Text>
          )}
        </View>
      </AnimatedPressable>

      {/* Status Panel */}
      <View className="absolute bottom-0 left-0 right-0 h-1/2 bg-sky-950 rounded-tl-[50px] rounded-tr-[50px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.25)] p-4 items-center justify-center">
        <View className="mx-auto my-auto w-[95%] h-[25%] bg-slate-900 rounded-[50px] mt-[22%] items-center justify-center px-6 py-4">
          <Text className="text-white text-lg font-semibold mb-2">
            {hasActiveEmergency ? 'Emergency Active' : ' Ready to Request'}
          </Text>
          <Text className="text-gray-300 text-sm text-center">
            {hasActiveEmergency 
              ? 'Your emergency request is being processed. Help is on the way.' 
              : hasProfile 
                ? 'Hold the emergency button for 3 seconds to send an alert.' 
                : 'Complete your profile to enable emergency alerts.'
            }
          </Text>
          
          
        </View>
      


      {/* Coordinates Pane */}

      <View className="absolute bottom-[24%] w-[95%] h-[30%] bg-slate-900 rounded-[50px] px-6 py-4">
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

