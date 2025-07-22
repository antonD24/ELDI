import { useRef } from 'react';
import { Animated } from 'react-native';

export function useButtonScaleAnimation() {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 10,
    }).start();
  };

  return { scale, animateIn, animateOut };
}

//Hook for scaling button animations
// This hook provides a simple way to animate button scaling on press in and out