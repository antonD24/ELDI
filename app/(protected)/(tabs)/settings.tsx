import { useAuthenticator } from '@aws-amplify/ui-react-native';
import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import React from 'react';
import { Alert, Animated, Pressable, SafeAreaView, Text, View } from 'react-native';
import { useButtonScaleAnimation } from '../../../hooks/useButtonScaleAnimation';

export default function TabScreenFour() {

    // Animation hook

    const { scale: signOutScale, animateIn: signOutIn, animateOut: signOutOut } = useButtonScaleAnimation();
    const AnimatedPressable = Animated.createAnimatedComponent(Pressable);


    const { signOut } = useAuthenticator();
    // Function to handle sign out
    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: "Cancel",
                    style: 'cancel',
                },
                {
                    text: 'Confirm',
                    onPress: () => signOut(),
                    style: 'destructive',
                },
            ]);
    }

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
            <View className="flex-1 w-[90%] items-center justify-center mx-auto">

                <View className="bg-sky-800 w-full h-[10%] items-center mt-12 justify-center rounded-[50px] shadow-md ">

                    <Text className="bg-gray-100 w-[90%] text-lg px-4 py-4 justify-center text-center rounded-[50px]">{user?.signInDetails?.loginId}</Text>
                </View>

                <View className="flex-1 w-full justify-end mb-20 px-4">
                    <AnimatedPressable style={{ transform: [{ scale: signOutScale }] }}
                        onPressIn={signOutIn}
                        onPressOut={signOutOut}
                        onPress={() => handleSignOut()}
                        className="bg-sky-950 w-full px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Sign Out</Text>
                    </AnimatedPressable>
                </View>
            </View>
        </SafeAreaView>
    )

}
