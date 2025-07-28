
import type { Schema } from '@/amplify/data/resource';
import { useButtonScaleAnimation } from '@/hooks/useButtonScaleAnimation';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { generateClient } from 'aws-amplify/data';
import { Animated, Pressable, Text, View } from 'react-native';



export default function HomeScreen() {
  const client = generateClient<Schema>();

  const { location, errorMsg } = useLiveLocation();

  const sendlocation = async () => {
    await client.models.Emergency.create({
      content: `Latitude: ${location?.coords.latitude.toFixed(4)}, Longitude: ${location?.coords.longitude.toFixed(4)}`,
    });
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
                          sendlocation();
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





