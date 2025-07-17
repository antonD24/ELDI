import { Amplify } from 'aws-amplify';

import { signIn } from 'aws-amplify/auth';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
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
        <ScrollView>
            <View className="justify-center flex-1 p-4 items-center">

                <View>
                    <Image className="shadow-sm justify-center items-center"
                        source={require('../.././assets/images/sign.png')}
                        style={{ width: 450, height: 450 }}
                    />
                </View>
                <View className='w-[80%] h-[8%]  bg-red-600 rounded-full ansolute bottom-[5%] justify-center items-center'>
                    {error && <Text className='color-white font-extrabold text-lg capitalize'>{error}</Text>}
                </View>
                <View className="bg-sky-950 w-[100%] mb-[50%] rounded-[50px] px-6 py-2 items-center justify-center ">
                    <View className='mb-5'></View>
                    <TextInput value={email} onChangeText={setEmail} autoCorrect={false} autoCapitalize='none' placeholder='E-mail' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black"></TextInput>
                    <TextInput value={password} onChangeText={setPassword} secureTextEntry autoCorrect={false} placeholder='Password' placeholderTextColor='gray' className="bg-gray-100 w-full px-6 py-[7%] mb-5 rounded-full shadow-md text-black"></TextInput>
                </View>

                <View className="flex-row justify-around absolute top-[88%] w-[100%] ">
                    <Link href="/(auth)/OnBoard" replace asChild>
                        <Pressable className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                            <Text className="text-white text-xl mx-auto font-semibold">Cancel</Text>
                        </Pressable>
                    </Link>



                    <Pressable onPress={onSignIn} className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Sign In</Text>
                    </Pressable>


                </View>
            </View>
        </ScrollView>
    )

}
