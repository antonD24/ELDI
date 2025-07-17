import { Amplify } from 'aws-amplify';

import { autoSignIn, signUp } from 'aws-amplify/auth';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import outputs from '../../amplify_outputs.json';


Amplify.configure(outputs);

export default function ScreenSignUp() {

    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [error, setError] = useState('');
    const [code, setCode] = useState('');
    const [showCodeInput, setShowCodeInput] = useState(false);
    const [signUpSession, setSignUpSession] = useState<any>(null);

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
                const {nextStep} = await autoSignIn();
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
        <View className="justify-center flex-1 p-4 items-center">
            <Text className='text-4xl absolute top-[5%]'>Create an account</Text>
            <View className="bg-sky-950 w-[100%] h-[60%] mb-16 rounded-[50px] px-6 py-6 items-center justify-center ">
                <View className='mb-5'></View>
                <TextInput value={email} onChangeText={setEmail} autoCorrect={false} autoCapitalize='none' placeholder='E-mail' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black" />
                <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder='Password' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black" />
                <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder='Confirm Password' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black" />

                {/* <TextInput value={name} onChangeText={setName} autoCorrect={false} placeholder='Name' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black" />
                <TextInput value={age} onChangeText={setAge} keyboardType='numeric' placeholder='Age' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black" />
                 */}
                {showCodeInput && (
                    <TextInput value={code} onChangeText={setCode} autoCorrect={false} autoCapitalize='none' placeholder='Confirmation Code' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black" />
                )}
            </View>
            <View className="flex-row justify-around absolute top-[90%] w-[100%] ">
                <Link href="/(auth)/OnBoard" replace asChild>
                    <Pressable className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Cancel</Text>
                    </Pressable>
                </Link>

                {!showCodeInput ? (
                    <Pressable onPress={onSignUp} className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Sign Up</Text>
                    </Pressable>
                ) : (
                    <Pressable onPress={onConfirmSignUP} className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Confirm Code</Text>
                    </Pressable>
                )}

            </View>
        </View>
    );
}

