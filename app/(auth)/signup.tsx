import { Amplify } from 'aws-amplify';

import { autoSignIn, signUp } from 'aws-amplify/auth';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import outputs from '../../amplify_outputs.json';
import { useButtonScaleAnimation } from '../../hooks/useButtonScaleAnimation';
    
Amplify.configure(outputs);

export default function ScreenSignUp() {

    // Animation hook
    const { scale: cancelScale, animateIn: cancelIn, animateOut: cancelOut } = useButtonScaleAnimation();
    const { scale: signUpScale, animateIn: signUpIn, animateOut: signUpOut } = useButtonScaleAnimation();
    const { scale: confirmScale, animateIn: confirmIn, animateOut: confirmOut } = useButtonScaleAnimation();
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

    // Router for navigation
    const router = useRouter();
    // State for email, password, confirm password, error message, confirmation code, and sign-up session
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [code, setCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [signUpSession, setSignUpSession] = useState<any>(null);


    // Function to handle sign-up
    // This function will be called when the user presses the "Sign Up" button
    // It uses the Amplify signUp method to create a new user with the provided email
    const onSignUp = async () => {
        setError('');
        setShowCodeInput(false);
        setSignUpSession(null);
        if (!email || !password || !confirmPassword) {
            setError('Please fill all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const response = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email: email,

                    },
                    autoSignIn: {
                        enabled: true,
                    },
                }
            });
            console.log('SignUp response:', response);
            if (response.isSignUpComplete) {
                router.replace('/(protected)/(tabs)');
            } else if (response.nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
                setShowCodeInput(true);
                setSignUpSession(response);
            } else {
                setError('Sign Up failed. Check credentials.');
            }
        } catch (err) {
            console.error('Error signing up', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(JSON.stringify(err));
            }
        }
    };

    // Function to handle confirmation of sign-up
    // This function will be called when the user presses the "Confirm Code" button
    // It uses the Amplify confirmSignUp method to verify the provided confirmation code

    const onConfirmSignUP = async () => {
        setError('');
        try {
            const { confirmSignUp } = await import('aws-amplify/auth');
            if (!signUpSession) {
                setError('No sign-up session available.');
                return;
            }
            const response = await confirmSignUp({
                username: email,
                confirmationCode: code
            });
            console.log('ConfirmSignUp response:', response);
            if (response.nextStep?.signUpStep === 'COMPLETE_AUTO_SIGN_IN') {
                const { nextStep } = await autoSignIn();
                if (nextStep) {
                    router.replace('/(protected)/(tabs)');
                } else {
                    setError('Auto sign-in failed. Try signing in manually.');
                }
            } else {
                setError('Confirmation failed. Try again.');
            }
        } catch (err) {
            console.error('Error confirming sign up', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(JSON.stringify(err));
            }
        }
    };



    return (

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center' }}
                keyboardVerticalOffset={100}
            >
                <View className="w-full items-center">
                    <Image
                        className="shadow-sm"
                        source={require('../.././assets/images/Register.png')}
                        style={{
                            width: '100%',
                            height: undefined,
                            aspectRatio: 1,
                            maxWidth: 450,
                        }}
                        resizeMode="contain"
                    />

                </View>

                {/* Error Message */}
                <View className='w-full mb-4 min-h-[56px] items-center justify-center'>
                    <View className={`bg-red-600 rounded-full py-6 px-6 items-center ${error ? '' : 'opacity-0'}`}>
                        <Text className='text-white font-extrabold capitalize text-lg text-center'>{error || ' '}</Text>
                    </View>
                </View>

                <View className="bg-sky-950 w-full rounded-[50px] px-6 py-8 items-center justify-center mb-60">
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCorrect={false}
                        autoCapitalize='none'
                        placeholder='E-mail'
                        placeholderTextColor='gray'
                        className="bg-gray-100 w-full px-6 py-6 mb-4 rounded-full shadow-md text-black"
                    />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCorrect={false}
                        placeholder='Password'
                        placeholderTextColor='gray'
                        className="bg-gray-100 w-full px-6 py-6 mb-4 rounded-full shadow-md text-black"
                    />
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        autoCorrect={false}
                        placeholder='Confirm Password'
                        placeholderTextColor='gray'
                        className="bg-gray-100 w-full px-6 py-6 rounded-full shadow-md text-black"
                    />
                    {showCodeInput && (
                        <TextInput
                            value={code}
                            onChangeText={setCode}
                            autoCorrect={false}
                            autoCapitalize='none'
                            placeholder='Confirmation Code'
                            placeholderTextColor='gray'
                            className="bg-gray-100 w-full px-6 py-6 rounded-full mt-4 shadow-md text-black" />
                    )}
                </View>
            



            <View className="w-full flex-row justify-between absolute bottom-[5%]">
                <Link href="/(auth)/OnBoard" replace asChild>
                    <AnimatedPressable
                        className="bg-sky-950 w-[48%] px-6 py-6 rounded-full shadow-md"
                        style={{ transform: [{ scale: cancelScale }] }}
                        onPressIn={cancelIn}
                        onPressOut={cancelOut}
                    >
                        <Text className="text-white text-xl mx-auto font-semibold">Cancel</Text>
                    </AnimatedPressable>
                </Link>
                {!showCodeInput ? (
                    <AnimatedPressable
                        onPress={onSignUp}
                        className="bg-sky-950 w-[48%] px-6 py-6 rounded-full shadow-md"
                        style={{ transform: [{ scale: signUpScale }] }}
                        onPressIn={signUpIn}
                        onPressOut={signUpOut}
                    >
                        <Text className="text-white text-xl mx-auto font-semibold">Create</Text>
                    </AnimatedPressable>
                ) : (
                    <AnimatedPressable
                        onPress={onConfirmSignUP}
                        className="bg-sky-950 w-[48%] px-6 py-6 rounded-full shadow-md"
                        style={{ transform: [{ scale: confirmScale }] }}
                        onPressIn={confirmIn}
                        onPressOut={confirmOut}
                    >
                        <Text className="text-white text-xl mx-auto font-semibold">Confirm Code</Text>
                    </AnimatedPressable>
                )}
            </View>
</KeyboardAvoidingView>

    );
}

