import React, {useEffect, useRef} from 'react';
import {View, Text, Animated, StyleSheet} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../theme/theme';

//Create the splash screen when it mounts
export default function SplashScreen({navigation}) {
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current; //Logo starts smaller

  useEffect(() => {
    // Creates a haptic burst when the splash screen loads
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    //Runs the fade and scale animation together
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('AppTabs');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/logo.png")}
        style={[
          styles.logo,
          {
            opacity: fade,
            transform: [{scale}],
          },
        ]}
      />

      <Animated.Text style={[styles.title, {opacity: fade}]}>Disaster Declassified</Animated.Text>
    </View>
  );
}

//Create the styling for the splash screen
//Makes use of the global theme colors and spacing
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '30%',
    height: '30%',
    marginBottom: theme.spacing.s,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 42,
    fontFamily: theme.fonts.bold,
    textAlign: 'center',
    color: theme.colors.primary
  }
})