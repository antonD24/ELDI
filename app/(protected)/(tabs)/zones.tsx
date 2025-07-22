import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, Text, View } from 'react-native';

export default function TabTwoScreen() {
  const MapContent = () => (
    <View style={{ position: 'absolute', bottom: '10%', zIndex: 1 }}>
      {/* Your overlapping content goes here */}
      <View className='items-center justify-center'>
      <View className="bg-white p-4 rounded-lg shadow-lg">
        <Text>Overlapped Content</Text>
      </View>
    </View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={{ flex: 1 }}>
        <AppleMaps.View style={{ flex: 1 }} />
        <MapContent />
      </View>
    );
  } else if (Platform.OS === 'android') {
    return (
      <View style={{ flex: 1 }}>
        <GoogleMaps.View style={{ flex: 1 }} />
        <MapContent />
      </View>
    );
  } 
  }



