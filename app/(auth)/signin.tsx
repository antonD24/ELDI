import { Amplify } from 'aws-amplify';

import { signIn } from 'aws-amplify/auth';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import outputs from '../../amplify_outputs.json';


Amplify.configure(outputs);

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const onSignIn = async () => {
        setError('');
        try {
            const response = await signIn({ username: email, password });
            console.log('SignIn response:', response);
            if (response.isSignedIn) {
                router.replace('/(protected)/(tabs)');
            } else {
                setError('Sign in failed. Check credentials or next steps.');
            }
        } catch (err) {
            console.error('Error signing in', err);
            if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as any).message === 'string') {
                setError((err as { message: string }).message);
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
            {/* Image Section */}
            <View className="w-full items-center mb-4">
                <Image
                    className="shadow-sm"
                    source={require('../.././assets/images/sign.png')}
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
            <View className='w-full my-4 min-h-[56px] items-center justify-center'>
                <View className={`bg-red-600 rounded-full py-6 px-6 items-center ${error ? '' : 'opacity-0'}`}>
                    <Text className='text-white font-extrabold capitalize text-lg text-center'>{error || ' '}</Text>
                </View>
            </View>

            {/* Input Fields */}
            <View className="bg-sky-950 w-full rounded-[50px] px-6 py-8 items-center justify-center mb-16">
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
                    className="bg-gray-100 w-full px-6 py-6 rounded-full shadow-md text-black"
                />
            </View>

            {/* Buttons */}
            <View className="w-full flex-row justify-between mb-8">
                <Link href="/(auth)/OnBoard" replace asChild>
                    <Pressable className="bg-sky-950 w-[48%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl text-center font-semibold">Cancel</Text>
                    </Pressable>
                </Link>

                <Pressable onPress={onSignIn} className="bg-sky-950 w-[48%] px-6 py-6 rounded-full shadow-md">
                    <Text className="text-white text-xl text-center font-semibold">Sign In</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    )

}
