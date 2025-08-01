// hooks/useLiveLocation.ts
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

interface LocationData {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    heading: number;
    speed: number;
  };
  timestamp: number;
}

export function useLiveLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced, // Changed from High to Balanced
          timeInterval: 5000, // Increased from 1000ms to 5000ms (5 seconds)
          distanceInterval: 10, // Increased from 0.5m to 10m
        },
        (loc: Location.LocationObject) => setLocation(loc)
      );
    };

    startTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { location, errorMsg };
}