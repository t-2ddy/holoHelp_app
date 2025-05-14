import { View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, Alert } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButton";
const towaHead = require("../../assets/images/towa_head.png");
import {Link, router} from 'expo-router';
import { createUser } from "@/lib/appwrite";


const SignUp: React.FC = () => {
    const [form, setForm] = useState<{ username: string; email: string; password: string}>({
        username: "",
        email: "",
        password: "",
    });
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToPassword = () => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 30);
    };

    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {
        if (!form.username || !form.email || !form.password) {
            Alert.alert('Error', 'youre missing somehting :p')
            return;
        }
    
        setIsSubmitting(true);
    
        try {
            const result = await createUser(form.email, form.password, form.username);
            console.log("Account created successfully:", result);
            router.replace('/home');
            
          } catch (error) {
            if (error instanceof Error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Error', 'Failed to create account');
            }
          } finally {
            setIsSubmitting(false);
          }
    }

    return (
        <SafeAreaView className="bg-towaprimary flex-1">
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 5 : 0}
            >
                <ScrollView 
                    ref={scrollViewRef}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    keyboardShouldPersistTaps="handled"
                    contentInsetAdjustmentBehavior="never"
                    
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="w-full p-4">
                            <View className="flex flex-row items-center justify-center">
                                <Image source={towaHead} 
                                resizeMode="contain"
                                className="size-48 " />
                                <Text
                                    style={{ fontFamily: "Sour Gummy Black" }}
                                    className="text-6xl text-stone-800 text-center translate-y-6"
                                >
                                    Holo
                                </Text>
                            </View>
                            <Text
                                style={{ fontFamily: "Sour Gummy Black" }}
                                className="text-3xl"
                            >
                                Sign Up
                            </Text>
                            <FormField
                                title="username"
                                value={form.username}
                                placeholder=""
                                handleChangeText={(e) => setForm((prev) => ({ ...prev, username: e }))}
                                otherStyles=""
                                autoCapitalize="none"
                            />
                            <FormField
                                title="email"
                                value={form.email}
                                placeholder=""
                                handleChangeText={(e) => setForm((prev) => ({ ...prev, email: e }))}
                                otherStyles=""
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <FormField
                                title="password - at least 8 characters ;-;"
                                value={form.password}
                                placeholder=""
                                handleChangeText={(e) => setForm((prev) => ({ ...prev, password: e }))}
                                otherStyles=""
                                secureTextEntry
                                onFocus={scrollToPassword}
                            />
                            <CustomButton 
                                title="sign up"
                                handlePress={submit}
                                containerStyles="mt-12"
                                isLoading={isSubmitting}
                            />
                            <View className="justify-center mt-10 items-center flex-row gap-2">
                                <Text 
                                style={{ fontFamily: "Sour Gummy Black" }}
                                className="text-lg text-stone-800 ">
                                    have an account?
                                </Text>
                                <Link 
                                style={{ fontFamily: "Sour Gummy Black" }}
                                href={"/sign-in"}
                                className="text-secondary text-lg"
                                >sign in owo</Link>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignUp;