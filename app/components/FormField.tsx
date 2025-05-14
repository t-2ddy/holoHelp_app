import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps } from "react-native";

interface FormFieldProps extends TextInputProps {
    title: string;
    value: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
}

const FormField: React.FC<FormFieldProps> = ({
    title,
    value,
    placeholder,
    handleChangeText,
    otherStyles = "",
    secureTextEntry,
    ...props
}) => {
    
    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text
                style={{ fontFamily: "Sour Gummy Black" }}
                className="text-base text-gray-100 mt-10"
            >
                {title}
            </Text>
            <View className="mt-2 border-2 border-stone-800 rounded-2xl bg-towasecondary w-full h-20 flex-row items-center p-4">
                <TextInput
                    style={{
                        fontFamily: "Sour Gummy Black",
                        outline: "none"
                    }}
                    underlineColorAndroid={"transparent"}
                    spellCheck={false}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="gray"
                    onChangeText={handleChangeText}
                    className="flex-1 text-2xl"
                    secureTextEntry={secureTextEntry}
                    {...props}
                    focusable={true}
                />
            </View>
        </View>
    );
};

export default FormField;