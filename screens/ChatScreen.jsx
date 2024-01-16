import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import React, { useLayoutEffect, useState, useEffect } from "react";
import { Avatar, Icon } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../firebase";

const ChatScreen = ({ navigation, route }) => {
  const { id, chatName } = route.params;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    Keyboard.dismiss();

    const docRef = doc(db, "chats", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await addDoc(collection(db, "chats", id, "messages"), {
        timestamp: new Date(),
        message: input,
        displayName: auth.currentUser.displayName,
        email: auth.currentUser.email,
        photoURL: auth.currentUser.photoURL,
      }).catch((error) => alert(error));
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }

    setInput("");

    getMessages();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Chat",
      headerBackTitleVisible: false,
      headerTitleAlign: "left",
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Avatar
            rounded
            source={{
              uri: "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
            }}
          />
          <Text style={{ color: "white", marginLeft: 10, fontWeight: "700" }}>
            {chatName}
          </Text>
        </View>
      ),
      headerLeft: () => (
        <TouchableOpacity
          style={{ marginLeft: 10 }}
          onPress={navigation.goBack}
        >
          <Icon type="antdesign" name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 80,
            marginRight: 20,
          }}
        >
          <TouchableOpacity>
            <Icon
              type="font-awesome"
              name="video-camera"
              size={24}
              color="white"
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Icon type="ionicon" name="call" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]);

  const getMessages = async () => {
    let allMessages = [];
    // const querySnapshot = await getDocs(
    //   collection(db, "chats", id, "messages")
    // );
    const chatRef = collection(db, "chats", id, "messages");
    const q = query(chatRef, orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      allMessages.push({
        id: doc.id,
        data: doc.data(),
      });
    });

    setMessages(allMessages);
  };

  useLayoutEffect(() => {
    // getMessages();
    const chatRef = collection(db, "chats", id, "messages");
    const q = query(chatRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let allMessages = [];
      querySnapshot.forEach((doc) => {
        allMessages.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setMessages(allMessages);
    });
    return unsubscribe;
  }, [route]);

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <StatusBar style="light" />
      <View style={styles.container}>
        {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss()}> */}
        <>
          <ScrollView contentContainerStyle={{ paddingTop: 15 }}>
            {messages?.map(({ id, data }) =>
              data.email === auth.currentUser.email ? (
                <View key={id} style={styles.reciever}>
                  <Avatar
                    source={{ uri: data.photoURL }}
                    position="absolute"
                    bottom={-15}
                    right={-5}
                    rounded
                  />
                  <Text style={styles.recieverText}>{data.message}</Text>
                </View>
              ) : (
                <View key={id} style={styles.sender}>
                  <Avatar
                    source={{ uri: data.photoURL }}
                    position="absolute"
                    bottom={-15}
                    left={-5}
                    rounded
                  />
                  <Text style={styles.senderText}>{data.message}</Text>
                  <Text style={styles.senderName}>{data.displayName}</Text>
                </View>
              )
            )}
          </ScrollView>
          <View style={styles.footer}>
            <TextInput
              placeholder="Signal Message"
              style={styles.textInput}
              value={input}
              onSubmitEditing={sendMessage}
              onChangeText={(text) => setInput(text)}
            />
            <TouchableOpacity activeOpacity={0.5} onPress={sendMessage}>
              <Icon name="send" type="ionicon" size={24} color="#2B68E6" />
            </TouchableOpacity>
          </View>
        </>
        {/* </TouchableWithoutFeedback> */}
      </View>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 15,
  },
  textInput: {
    bottom: 0,
    height: 40,
    flex: 1,
    marginRight: 15,
    backgroundColor: "#ECECEC",
    padding: 10,
    color: "grey",
    borderRadius: 30,
  },
  recieverText: {
    color: "black",
    fontWeight: "500",
    marginLeft: 10,
    // marginBottom: 15,
  },
  senderText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 10,
    marginBottom: 5,
  },
  reciever: {
    padding: 15,
    backgroundColor: "#ECECEC",
    alignSelf: "flex-end",
    borderRadius: 20,
    marginRight: 15,
    marginBottom: 20,
    maxWidth: "80%",
    position: "relative",
  },
  sender: {
    padding: 15,
    backgroundColor: "#2B68E6",
    alignSelf: "flex-start",
    borderRadius: 20,
    marginLeft: 15,
    marginBottom: 20,
    maxWidth: "80%",
    position: "relative",
  },
  senderName: {
    left: 10,
    // paddingLeft: 10,
    fontSize: 10,
    color: "white",
  },
});
