import { Schema } from '@/amplify/data/resource';
import { useLiveLocation } from '@/hooks/useLiveLocation';
import { generateClient } from 'aws-amplify/data';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';


export default function TabTwoScreen() {
  const mapRef = useRef<any>(null);
  const { location, errorMsg } = useLiveLocation();

  const client = generateClient<Schema>();
  
  const [selectedType, setSelectedType] = React.useState<'defibrillator' | 'hospital' | 'safe_zone' | null>(null);
  const [locations, setLocations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null);

  // Calculate offset to center map in visible area
  const getMapCenterOffset = useCallback(() => {
    if (!location) return { latitude: 0, longitude: 0 };
    
    // Offset latitude to move center point up on screen
    const latOffset = selectedType ? -0.005 : 0.0015; // More offset when list is showing
    return {
      latitude: location.coords.latitude + latOffset,
      longitude: location.coords.longitude
    };
  }, [location, selectedType]);

  const cameraPosition = useMemo(() => ({
    coordinates: getMapCenterOffset(),
    zoom: 14,
  }), [getMapCenterOffset]);

  const markersApple = useMemo(() => [
    ...locations.map((loc) => ({
      id: loc.id,
      coordinates: {
        latitude: loc.location.lat,
        longitude: loc.location.long
      },
      title: loc.name,
      subtitle: loc.description || '',
    }))
  ], [locations]);

  const markersGoogle = useMemo(() => locations.map((loc) => ({
    id: loc.id,
    coordinates: {
      latitude: loc.location.lat,
      longitude: loc.location.long
    },
    title: loc.name,
    snippet: loc.description || '', 
  })), [locations]);

  // Handle marker press with directions modal
  const handleMarkerPress = useCallback((marker: any) => {
    try {
      const { coordinates, title } = marker;
      
      if (!coordinates || typeof coordinates.latitude !== 'number' || typeof coordinates.longitude !== 'number') {
        console.warn('Invalid marker coordinates:', marker);
        Alert.alert('Error', 'Invalid location coordinates.');
        return;
      }
      
      Alert.alert(
        title || 'Location',
        'Would you like to get directions to this location?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Get Directions',
            onPress: () => openDirections(coordinates.latitude, coordinates.longitude, title || 'Location'),
          },
        ]
      );
    } catch (error) {
      console.error('Error handling marker press:', error);
      Alert.alert('Error', 'Failed to process location selection.');
    }
  }, []);

  // Handle list item click - highlight and trigger marker click
  const handleListItemPress = useCallback((item: any) => {
    try {
      setSelectedLocationId(item.id);
      
      // Validate item data before proceeding
      if (!item.location || typeof item.location.lat !== 'number' || typeof item.location.long !== 'number') {
        console.warn('Invalid location data for item:', item);
        Alert.alert('Error', 'Invalid location data for this item.');
        return;
      }
      
      // Create a marker object to pass to handleMarkerPress
      const markerData = {
        coordinates: {
          latitude: item.location.lat,
          longitude: item.location.long
        },
        title: item.name,
        id: item.id
      };
      
      // Trigger the same action as clicking a marker
      handleMarkerPress(markerData);
    } catch (error) {
      console.error('Error handling list item press:', error);
      Alert.alert('Error', 'Failed to process location selection.');
    }
  }, [handleMarkerPress]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }, []);

  // Sort locations by distance from current location
  const sortLocationsByDistance = useCallback((locationsList: any[]) => {
    if (!location) return locationsList;
    
    return locationsList
      .map(loc => ({
        ...loc,
        distance: calculateDistance(
          location.coords.latitude,
          location.coords.longitude,
          loc.location.lat,
          loc.location.long
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [location, calculateDistance]);

  const fetchLocationsByType = useCallback(async (type: 'defibrillator' | 'hospital' | 'safe_zone') => {
    setLoading(true);
    try {
      const { data: locations, errors } = await client.models.Locations.list({
        filter: {
          type: {
            eq: type
          }
        }
      });
      if (errors) {
        console.error('Errors fetching locations:', errors);
        setLocations([]);
        return;
      }
      
      // Sort locations by distance from current location
      const sortedLocations = sortLocationsByDistance(locations || []);
      setLocations(sortedLocations);
    } catch (err) {
      console.error('Error fetching locations:', err);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [client, location]);

  const handleTypePress = useCallback((type: 'defibrillator' | 'hospital' | 'safe_zone') => {
    if (selectedType === type) {
      // If the same type is pressed, hide the list
      setSelectedType(null);
      setLocations([]);
      setSelectedLocationId(null); // Clear selection
    } else {
      // If a different type is pressed, show the list and fetch locations
      setSelectedType(type);
      setSelectedLocationId(null); // Clear selection when switching types
      fetchLocationsByType(type);
    }
  }, [selectedType, fetchLocationsByType]);

  // Function to open directions in native maps app
  const openDirections = (latitude: number, longitude: number, name: string) => {
    const destination = `${latitude},${longitude}`;
    
    if (Platform.OS === 'ios') {
      // For iOS, use Apple Maps
      const url = `maps://app?daddr=${destination}&dirflg=d`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web Apple Maps
          const webUrl = `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
          Linking.openURL(webUrl);
        }
      });
    } else {
      // For Android, use Google Maps
      const url = `google.navigation:q=${destination}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web Google Maps
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  // Update camera position when selectedType changes to recenter the map
  useEffect(() => {
    if (location && mapRef.current) {
      const newPosition = {
        coordinates: getMapCenterOffset(),
        animationDuration: 500, // Smooth transition
      };
      
      // Update camera position based on platform
      if (Platform.OS === 'ios') {
        mapRef.current.animateToCamera?.(newPosition);
      } else if (Platform.OS === 'android') {
        mapRef.current.animateToCamera?.(newPosition);
      }
    }
  }, [selectedType, getMapCenterOffset]); // Removed location dependency to prevent infinite loops

  // Show loading state while waiting for location
  if (!location && !errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Getting your location...</Text>
      </View>
    );
  }

  // Show error state if location permission denied or other error
  if (errorMsg) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', fontSize: 16 }}>
          Error: {errorMsg}
        </Text>
      </View>
    );
  }

  const MapContent = () => (
    <View style={{ position: 'absolute', bottom: '10%', left: 0, right: 0, zIndex: 1 }}>
      {/* List of locations*/}
      {selectedType && (
        <View className='bg-white opacity-80 mx-[5%] mb-4 p-4 rounded-[50px] shadow-lg' style={{ height: 300 }}>
          <Text className="text-lg font-bold text-center mb-2 capitalize">
            {selectedType === 'safe_zone' ? 'Safe Zones' : selectedType + 's'}
          </Text>
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="small" />
              <Text className="text-xs text-gray-600 mt-2">Loading locations...</Text>
            </View>
          ) : (
            <FlatList
              data={locations}
              keyExtractor={(item, index) => item.id || index.toString()}
              showsVerticalScrollIndicator={true}
              style={{ flex: 1 }}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={10}
              removeClippedSubviews={true}
              getItemLayout={(data, index) => ({
                length: 80, // Approximate height of each item
                offset: 80 * index,
                index,
              })}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  onPress={() => handleListItemPress(item)}
                  className={`p-3 mb-2 rounded-[50px] ${
                    selectedLocationId === item.id ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-semibold pl-4">{item.name}</Text>
                      {item.description && (
                        <Text className="text-sm text-gray-600 mt-1 pl-4">{item.description}</Text>
                      )}
                      {item.location && (
                        <Text className="text-xs text-gray-500 mt-1 pl-4">
                          {item.location.lat?.toFixed(6)}, {item.location.long?.toFixed(6)}
                        </Text>
                      )}
                    </View>
                    {item.distance && (
                      <View className="pr-5 my-auto">
                        <Text className="text-xs text-center text-blue-600 font-medium">
                          {item.distance < 1 
                            ? `${(item.distance * 1000).toFixed(0)}m`
                            : `${item.distance.toFixed(1)}km`
                          }
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="flex-1 justify-center items-center py-8">
                  <Text className="text-gray-500">No locations found</Text>
                </View>
              }
            />
          )}
        </View>
      )}
      
      {/* Type selection bar */}
      <View className="bg-white opacity-80 flex-row p-4 mx-[5%] mb-8 gap-2 rounded-[50px] shadow-lg">
        <TouchableOpacity 
          className="flex-1 bg-gray-200 rounded-[50px] items-center justify-center"
          onPress={() => handleTypePress('defibrillator')}
          style={{ backgroundColor: selectedType === 'defibrillator' ? '#e5e7eb' : '#f3f4f6' }}
        >
         <Image 
                  className="shadow-sm items-center justify-center pt-2"
                  source={require('../../../assets/images/defib.png')}
                  style={{
                      width: '60%',
                      height: undefined,
                      aspectRatio: 1,
                      maxWidth: 150,
                  }}
                  resizeMode="contain"
              />
              <Text className="text-xs text-center font-medium pb-2">Defibrillator</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-gray-200 rounded-[50px] items-center justify-center"
          onPress={() => handleTypePress('hospital')}
          style={{ backgroundColor: selectedType === 'hospital' ? '#e5e7eb' : '#f3f4f6' }}
        >
          <Image 
                  className="shadow-sm items-center justify-center pt-2"
                  source={require('../../../assets/images/hospital.png')}
                  style={{
                      width: '60%',
                      height: undefined,
                      aspectRatio: 1,
                      maxWidth: 150,
                  }}
                  resizeMode="contain"
              />
              <Text className="text-xs text-center font-medium pb-2">Hospital</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="flex-1 bg-gray-200 rounded-[50px] items-center justify-center"
          onPress={() => handleTypePress('safe_zone')}
          style={{ backgroundColor: selectedType === 'safe_zone' ? '#e5e7eb' : '#f3f4f6' }}
        >
          <Image 
                  className="shadow-sm items-center justify-center pt-2"
                  source={require('../../../assets/images/szones.png')}
                  style={{
                      width: '60%',
                      height: undefined,
                      aspectRatio: 1,
                      maxWidth: 150,
                  }}
                  resizeMode="contain"
              />
              <Text className="text-xs text-center font-medium pb-2">Safe Zones</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={{ flex: 1 }}>
        <AppleMaps.View
          ref={mapRef}
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          markers={markersApple}
          onMarkerClick={handleMarkerPress}
          properties={{
            isMyLocationEnabled: true
          }}
          uiSettings={{
            myLocationButtonEnabled: true
          }}
        />

        <MapContent />
      </View>
    );
  } else if (Platform.OS === 'android') {
    return (
      <View style={{ flex: 1 }}>
        <GoogleMaps.View
          ref={mapRef}
          style={{ flex: 1 }}
          cameraPosition={cameraPosition}
          markers={markersGoogle}
          onMarkerClick={handleMarkerPress}
          properties={{
            isMyLocationEnabled: true
          }}
          uiSettings={{
            myLocationButtonEnabled: true
          }}
          userLocation={{
            coordinates: {
              latitude: location!.coords.latitude,
              longitude: location!.coords.longitude
            },
            followUserLocation: true
          }}
        />

        <MapContent />
      </View>
    );
  }
}