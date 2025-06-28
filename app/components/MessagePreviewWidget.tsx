import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { chatService } from '../../lib/apiService';
import { useGlobalContext } from '../../context/GlobalProvider';

const towaClose = require('../../assets/images/towa_close.jpg');

interface User {
  $id: string;
  email?: string;
  name?: string;
}

interface LastMessage {
  content: string;
  timestamp: string;
  role: string;
}

const MessagePreviewWidget: React.FC = () => {
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
            content: mostRecent.content || 'No message content',
            timestamp: mostRecent.timestamp || new Date().toISOString(),
            role: mostRecent.role || 'assistant'
          });
        }
      } catch (error) {
        console.error('Error fetching last message:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLastMessage();
  }, [user]);

  const getPreviewText = () => {
    if (loading) {
      return 'Loading...';
    }
    
    if (!lastMessage) {
      return 'No messages yet. Start a conversation with Towa!';
    }
    
    const isFromUser = lastMessage.role === 'user';
    const prefix = isFromUser ? 'You: ' : 'Towa: ';
    
    const messageText = lastMessage.content.length > 60
      ? `${lastMessage.content.substring(0, 60)}...`
      : lastMessage.content;
    
    return `${prefix}${messageText}`;
  };

  const getTimeDisplay = () => {
    if (!lastMessage) return '';
    
    const messageDate = new Date(lastMessage.timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const handlePress = () => {
    router.push('/(tabs)/chats');
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className="bg-towaprimary mx-4 rounded-3xl mb-4"
    >
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text
            className="text-2xl text-stone-800"
            style={{ fontFamily: "Sour Gummy Black" }}
          >
            Recent Chat
          </Text>
          {lastMessage && (
            <Text className="text-stone-600 text-sm">
              {getTimeDisplay()}
            </Text>
          )}
        </View>
        
        <View className="flex-row items-center">
          <Image
            source={towaClose}
            className="rounded-full size-12 mr-3"
            style={{ width: 48, height: 48 }}
          />
          
          <View className="flex-1">
            <Text
              style={{ fontFamily: "Sour Gummy Black" }}
              className="text-lg text-stone-800 mb-1"
            >
              Towa
            </Text>
            
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator size="small" color="#8058ac" />
                <Text className="text-stone-600 text-base ml-2">
                  Loading...
                </Text>
              </View>
            ) : (
              <Text
                className="text-stone-600 text-base leading-5 font-sour"
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {getPreviewText()}
              </Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default MessagePreviewWidget;