import { View, Text } from 'react-native';
import React from 'react';

interface TextBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

const TextBubble: React.FC<TextBubbleProps> = ({ message, isUser, timestamp }) => {
  return (
    <View 
      className={`max-w-[80%] my-1 rounded-2xl p-3
        ${isUser ? 'bg-towagreen self-end rounded-tr-none' : 'bg-towa3 self-start rounded-tl-none'}`}
    >
      <Text className={`font-sour text-base ${isUser ? 'text-stone-800' : 'text-stone-800'}`} >
        {message}
      </Text>
      {/* {timestamp && (
        // <Text className="text-xs self-end mt-1 opacity-60">
        //   {timestamp}
        // </Text>
      )} */}
    </View>
  );
};

export default TextBubble;