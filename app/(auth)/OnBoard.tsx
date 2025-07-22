import { useAssets } from "expo-asset";
import { Link } from "expo-router";
import { useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";

export default function OnBoardScreen() {
    const [assets, error] = useAssets([
        require('../../assets/images/eldi-mobile.png'),
    ]);


    // Animated values for both buttons
    const signInScale = useRef(new Animated.Value(1)).current;
    const signUpScale = useRef(new Animated.Value(1)).current;

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

    return (
        <View className="flex-1 justify-center items-center">

                <Image 
                    className="shadow-sm"
                    source={require('../.././assets/images/eldi-mobile.png')}
                    style={{
                        width: '100%',
                        height: undefined,
                        aspectRatio: 1,
                        maxWidth: 450,
                    }}
                    resizeMode="contain"
                />

                <Text className="text-2xl font-bold text-sky-950 mt-4">Welcome to ELDI</Text>
                <Text className="text-gray-500 text-center mt-2 mb-8">Your center for requesting emergency medical aid. </Text>


            <View className="flex-row justify-around items-center absolute top-[88%] w-[100%] ">
                <Link href="/(auth)/signin" push asChild>
                    <AnimatedPressable
                        className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md"
                        style={{ transform: [{ scale: signInScale }] }}
                        onPressIn={() => animateIn(signInScale)}
                        onPressOut={() => animateOut(signInScale)}
                    >
                        <Text className="text-white text-xl mx-auto font-semibold">Sign In</Text>
                    </AnimatedPressable>
                </Link>

                <Link href="/(auth)/signup" push asChild>
                    <AnimatedPressable
                        className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md"
                        style={{ transform: [{ scale: signUpScale }] }}
                        onPressIn={() => animateIn(signUpScale)}
                        onPressOut={() => animateOut(signUpScale)}
                    >
                        <Text className="text-white text-xl mx-auto font-semibold">Create Account</Text>
                    </AnimatedPressable>
                </Link>
            </View>
        </View>
    )
}