import React from "react";
import { Button, StyleSheet, View } from "react-native";


export default function TabThreeScreen() {

  return (
    <View style={styles.container}>
      <Button title="Sign Out"  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    marginTop: 100,
  },
});