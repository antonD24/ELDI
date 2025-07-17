import { useAssets } from "expo-asset";
import { Link } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

export default function OnBoardScreen() {
    const [assets, error] = useAssets([
        require('../../assets/images/eldi-mobile.png'),
    ]);


    return (
        <View className="flex-1 justify-center items-center">
            <View className="h-3/4">
                <Image className="shadow-sm"
                    source={require('../.././assets/images/eldi-mobile.png')}
                    style={{ width: 450, height: 450 }}
                />
            </View>

            <View className="flex-row justify-around items-center absolute top-[85%] w-[100%] ">
                <Link href="/(auth)/signin" push asChild>
                    <Pressable className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Sign In</Text>
                    </Pressable>
                </Link>

                <Link href="/(auth)/signup" push asChild>
                    <Pressable className="bg-sky-950 w-[45%] px-6 py-6 rounded-full shadow-md">
                        <Text className="text-white text-xl mx-auto font-semibold">Create Account</Text>
                    </Pressable>
                </Link>

            </View>
        </View>
    )
}