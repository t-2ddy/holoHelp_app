import { View, Text, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { chatService } from '../../lib/apiService';
import { useGlobalContext } from '../../context/GlobalProvider';

interface MessagePreviewProps {
  characterId: string;
  characterName: string;
  characterImage: any;
  onPress?: () => void;
  style?: string;
}

interface User {
  $id: string;
  email?: string;
  name?: string;
}

interface LastMessage {
  message: string;
  created_at: string;
  sender_id: string;
}

const MessagePreview: React.FC<MessagePreviewProps> = ({
  characterId,
  characterName,
  characterImage,
  onPress,
  style = '',
}) => {
  const { user } = useGlobalContext() as { user: User | null };
  const [lastMessage, setLastMessage] = useState<LastMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastMessage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const conversation = await chatService.getChatHistory(user.$id, 1);
        
        if (conversation && conversation.length > 0) {
          const mostRecent = conversation[0];
          setLastMessage({
            message: mostRecent.content || mostRecent.message || 'No message content',
            created_at: mostRecent.timestamp || mostRecent.created_at || new Date().toISOString(),
            sender_id: mostRecent.userId || mostRecent.sender_id || user.$id
          });
        }
      } catch (error) {
        console.error('Error fetching last message:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLastMessage();
  }, [user, characterId]);

  const getPreviewText = () => {
    if (loading) {
      return 'Loading...';
    }
    
    if (!lastMessage) {
      return 'No messages yet. Start a conversation!';
    }
    
    const isFromUser = lastMessage.sender_id === user?.$id;
    const prefix = isFromUser ? 'You: ' : '';
    
    const messageText = lastMessage.message.length > 30
      ? `${lastMessage.message.substring(0, 50)}...`
      : lastMessage.message;
    
    return `${prefix}${messageText}`;
  };

  const getTimeDisplay = () => {
    if (!lastMessage) return '';
    
    const messageDate = new Date(lastMessage.created_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    else if (diffDays === 1) {
      return 'Yesterday';
    }
    else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handlePress = onPress || (() => router.push(`../screens/messages/${characterId.toLowerCase()}Text`));

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.6}
      className={`bg-towa3 rounded-2xl mb-2 ${style}`}>
      <View className='flex-row items-center justify-between min-h-24 px-4'>
        <View className='flex-row items-center flex-1'>
          <Image
            source={characterImage}
            className='rounded-full size-12'
            style={{ width: 48, height: 48 }}
          />
          <View className='ml-4 flex-1'>
            <Text
              style={{ fontFamily: "Sour Gummy Black" }}
              className='text-xl text-stone-800'
            >
              {characterName}
            </Text>
            <Text
              style={{ fontFamily: "Sour Gummy Black" }}
              className='text-stone-800 opacity-70 text-lg'
              numberOfLines={1}
              ellipsizeMode='tail'
            >
              {getPreviewText()}
            </Text>
          </View>
        </View>
        {/* <Text className='text-xs text-stone-800 opacity-50 ml-2'>
          {getTimeDisplay()}
        </Text> */}
      </View>
    </TouchableOpacity>
  );
};

export default MessagePreview;