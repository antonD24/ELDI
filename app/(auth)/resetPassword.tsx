import { Amplify } from 'aws-amplify';
import { confirmResetPassword, resetPassword } from 'aws-amplify/auth';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import outputs from '../../amplify_outputs.json';

Amplify.configure(outputs);

export default function resetPasswordScreen() {

  // Animated values for all three buttons
  const sendCodeScale = useRef(new Animated.Value(1)).current;
  const confirmScale = useRef(new Animated.Value(1)).current;
  const cancelScale = useRef(new Animated.Value(1)).current;
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const animateIn = (animatedValue: Animated.Value) => {
    Animated.spring(animatedValue, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };
  const animateOut = (animatedValue: Animated.Value) => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showNewPassInput, setNewPassInput] = useState(false);
  const [ResetSession, setResetSession] = useState<any>(null);

  // Function to handle password reset
  // This function will be called when the user presses the "Send Code" button
  // It uses the Amplify resetPassword method to initiate the password reset process
  // If the next step requires a confirmation code, it will show the code input and new password input fields
  // If the reset is already done, it will show an error message

  const onResetPassword = async () => {
    setError('');
    setShowCodeInput(false);
    setNewPassInput(false);
    setResetSession(null);
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    try {
      const output = await resetPassword({
        username: email
      });
      console.log('Reset Password response:', output);
      if (output.nextStep?.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        setShowCodeInput(true);
        setNewPassInput(true);
        setResetSession(output);
      } else if (output.nextStep?.resetPasswordStep === 'DONE') {
        // Password reset is already done, maybe redirect or show a message
        setError('Password reset already completed.');
      } else {
        setError('Reset Password failed. Check credentials.');
      }
    } catch (err) {
      console.error('Error resetting password', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };

  const onConfirmResetPassword = async () => {
    setError('');
    if (!code || !newPassword) {
      setError('Please fill all fields.');
      return;
    }
    try {
      const response = await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
      console.log('Confirm Reset Password response:', response);
      router.replace('/(auth)/OnBoard');
    } catch (err) {
      console.error('Error confirming reset password', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    }
  };



  return (
    <View className='flex-1 items-center justify-center'>
      <KeyboardAvoidingView className='w-full'
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ alignItems: 'center', justifyContent: 'center' }}
        keyboardVerticalOffset={10}
      >
        <View>
          <Image className="shadow-sm mt-24"
            source={require('../.././assets/images/reset.png')}
            style={{
              width: '70%',
              height: undefined,
              aspectRatio: 1,
              maxWidth: 450,
            }}
            resizeMode="contain"
          />
        </View>
        <View>
          <Text className="text-gray-500 text-center mb-8">Enter your email to receive a reset code</Text>
        </View>


                        <View className={`bg-red-600 rounded-full py-6 px-6 items-center ${error ? '' : 'opacity-0'}`}>
                            <Text className='text-white font-extrabold capitalize text-lg text-center'>{error || ' '}</Text>
                        </View>
                    

        {/* Inputs*/}
        <View className="bg-sky-950 w-[90%] rounded-[50px] px-6 py-6 mt-4 items-center justify-center mb-safe-or-96">

          <TextInput
            placeholder='E-mail'
            autoCapitalize='none'
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            placeholderTextColor='gray'
            className="bg-gray-100 w-full px-6 py-6 rounded-full shadow-md text-black"
          />
          {showCodeInput && showNewPassInput && (
            <>
              <TextInput
                placeholder='Code'
                autoCapitalize='none'
                autoCorrect={false}
                value={code}
                onChangeText={setCode}
                placeholderTextColor='gray'
                className="bg-gray-100 w-full px-6 py-6 mt-4 rounded-full shadow-md text-black"
              />
              <TextInput
                placeholder='New Password'
                autoCapitalize='none'
                autoCorrect={false}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                placeholderTextColor='gray'
                className="bg-gray-100 w-full px-6 py-6 mt-4 rounded-full shadow-md text-black"
              />
            </>
          )}



        </View>
        
      </KeyboardAvoidingView>
      
      {/* Buttons */}
      <View className="w-full items-center absolute bottom-[5%]">
        {!showCodeInput && !showNewPassInput ? (
          <AnimatedPressable
            onPress={onResetPassword}
            className="bg-sky-950 w-[90%] px-6 py-6 rounded-full shadow-md"
            style={{ transform: [{ scale: sendCodeScale }] }}
            onPressIn={() => animateIn(sendCodeScale)}
            onPressOut={() => animateOut(sendCodeScale)}
          >
            <Text className="text-white text-xl text-center font-semibold">Send Code</Text>
          </AnimatedPressable>
        ) : (
          <AnimatedPressable
            onPress={onConfirmResetPassword}
            className="bg-sky-950 w-[90%] px-6 py-6 rounded-full shadow-md"
            style={{ transform: [{ scale: confirmScale }] }}
            onPressIn={() => animateIn(confirmScale)}
            onPressOut={() => animateOut(confirmScale)}
          >
            <Text className="text-white text-xl text-center font-semibold">Confirm Code</Text>
          </AnimatedPressable>
        )}
        <AnimatedPressable
          onPress={() => router.replace('/(auth)/OnBoard')}
          className="bg-sky-950 w-[90%] px-6 py-6 rounded-full shadow-md mt-4"
          style={{ transform: [{ scale: cancelScale }] }}
          onPressIn={() => animateIn(cancelScale)}
          onPressOut={() => animateOut(cancelScale)}
        >
          <Text className="text-white text-xl text-center font-semibold">Cancel</Text>
        </AnimatedPressable>
      </View>
    </View>
  )
}

