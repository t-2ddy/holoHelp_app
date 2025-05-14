import { View, Text, ScrollView, Image, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButton";
const towaPoint = require("../../assets/images/towa_point.png");
import {Link, router} from 'expo-router'
import { Alert } from "react-native";
import { signIn } from "@/lib/appwrite";

const SignIn: React.FC = () => {
    const [form, setForm] = useState<{ email: string; password: string }>({
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
            if (!form.email || !form.password) {
                Alert.alert('Error', 'youre missing somehting :p')
                return;
            }
        
            setIsSubmitting(true);
        
            try {
                const result = await signIn(form.email, form.password);
                console.log("ur in:", result);
                router.replace('/home');
                
            } catch (error) {
                if (error instanceof Error) {
                Alert.alert('Error', error.message);
                } else {
                Alert.alert('Error', 'failed signing in');
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
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View className="w-full p-4">
                            <View className="flex flex-row items-center">
                                <Image source={towaPoint} className="size-64" />
                                <Text
                                    style={{ fontFamily: "Sour Gummy Black" }}
                                    className="text-6xl text-stone-800 text-center -translate-x-10 translate-y-2"
                                >
                                    Holo
                                </Text>
                            </View>
                            <Text
                                style={{ fontFamily: "Sour Gummy Black" }}
                                className="text-3xl mt-2"
                            >
                                Log In
                            </Text>
                            <FormField
                                title="email"
                                value={form.email}
                                placeholder=""
                                handleChangeText={(e) => setForm((prev) => ({ ...prev, email: e }))}
                                otherStyles="mt-4"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <FormField
                                title="password"
                                value={form.password}
                                placeholder=""
                                handleChangeText={(e) => setForm((prev) => ({ ...prev, password: e }))}
                                otherStyles="mt-4"
                                secureTextEntry
                                onFocus={scrollToPassword}
                            />
                            <CustomButton 
                                title="sign in"
                                handlePress={submit}
                                containerStyles="mt-16"
                                isLoading={isSubmitting}
                            />
                            <View className="justify-center mt-10 items-center flex-row gap-2">
                                <Text 
                                style={{ fontFamily: "Sour Gummy Black" }}
                                className="text-lg text-stone-800 ">
                                    no account?
                                </Text>
                                <Link 
                                style={{ fontFamily: "Sour Gummy Black" }}
                                href={"/sign-up"}
                                className="text-towagreen text-lg"
                                >sign up :3</Link>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default SignIn;