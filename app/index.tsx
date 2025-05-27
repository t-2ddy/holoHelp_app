import { ScrollView, Text, View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import CustomButton from "./components/CustomButton";
import React from "react";

import { useGlobalContext } from '../context/GlobalProvider';

const towaQuestion = require("../assets/images/towa_question.png");

export default function Index(): JSX.Element {
  const [fontsLoaded] = useFonts({
    "Sour Gummy Black": require("../assets/fonts/Sour Gummy Black.ttf"),
  });

  const {isLoading, isLoggedIn} = useGlobalContext();
    if (!isLoading && isLoggedIn) return <Redirect href="/home" />

  return (
    <SafeAreaView className="bg-towaprimary h-full">
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="w-full items-center justify-center h-full min-h-40 p-4">
          <Text
            style={{ fontFamily: "Sour Gummy Black" }}
            className="text-7xl text-stone-800"
          >
            HoloHelp
          </Text>

          <Image source={towaQuestion} className="size-72" />

          <View className="flex flex-row flex-wrap text-center mt-4 justify-center">
            <Text
              style={{ fontFamily: "Sour Gummy Black" }}
              className="text-stone-800 text-3xl"
            >
              DONT WASTE MY {"\n"}
            </Text>
            <Text
              style={{ fontFamily: "Sour Gummy Black" }}
              className="text-lime-400 text-3xl"
            >
              TOKENS
            </Text>
            <Text
              style={{ fontFamily: "Sour Gummy Black" }}
              className="text-stone-800 text-3xl"
            >
              !!!
            </Text>
          </View>

          <Text
            style={{ fontFamily: "Sour Gummy Black" }}
            className="text-stone-800 text-lg text-center mt opacity-80"
          >
            Your Hololive-themed productivity app where your favorite members
            dedicate themselves to helping you!
          </Text>

          <CustomButton
            title="Continue with Email"
            handlePress={() => {router.push('/sign-in')}}
            containerStyles="w-full mt-10"
          />
        </View>
      </ScrollView>
      <StatusBar style='light'/>
    </SafeAreaView>
  );
}
