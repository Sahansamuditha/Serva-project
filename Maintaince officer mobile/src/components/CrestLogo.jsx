import React from 'react';
import { Image, View, StyleSheet } from 'react-native';

const campusLogo = require('../../assets/campus_logo.png');

export default function CrestLogo({ size = 36, style }) {
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={campusLogo}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  }
});
