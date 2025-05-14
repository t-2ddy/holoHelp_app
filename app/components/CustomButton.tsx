import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";

interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: string;
  textStyles?: string;
  isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  handlePress, 
  containerStyles = "", 
  textStyles = "", 
  isLoading = false 
}) => {
  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isLoading}
      className={`bg-towagreen rounded-2xl min-h-20 justify-center items-center 
        ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
    >
      {isLoading ? (
        <ActivityIndicator size="large" color="white" />
      ) : (
        <Text
          style={{ fontFamily: 'Sour Gummy Black' }}
          className={`text-stone-800 text-3xl ${textStyles}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
