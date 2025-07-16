import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export function useLocation() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        console.log('Permission successful!');
        const loc = await Location.getCurrentPositionAsync();
        console.log(loc);
        setLocation(loc);
      } else {
        console.log('Permission not granted');
        setErrorMsg('Permission not granted');
      }
    })();
  }, []);

  return { location, errorMsg };
}