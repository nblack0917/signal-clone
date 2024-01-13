import { KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Button, Input, Image } from "@rneui/themed";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      navigation.replace("Home");
    }
  });

  const signIn = async () => {
    await signInWithEmailAndPassword(auth, email, password).catch((error) =>
      alert(error.message)
    );
  };

  return (
    <View behavior="padding" style={styles.container}>
      <StatusBar style="light" />

      <Image
        source={{
          uri: "https://www.pcworld.com/wp-content/uploads/2023/04/signal_blue_icon-100758641-orig.jpg?quality=50&strip=all",
        }}
        style={{ width: 200, height: 200, borderRadius: 25, margin: 20 }}
      />
      <View style={styles.inputContainer}>
        <Input
          placeholder="Email"
          autoFocus
          type="email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <Input
          placeholder="Password"
          secureTextEntry
          type="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
      </View>

      <Button title="Login" containerStyle={styles.button} onPress={signIn} />
      <Button
        title="Register"
        type="outline"
        containerStyle={styles.button}
        onPress={() => navigation.navigate("Register")}
      />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    backgroundColor: "white",
  },
  inputContainer: {
    width: 300,
  },
  button: {
    width: 200,
    marginTop: 10,
  },
});
