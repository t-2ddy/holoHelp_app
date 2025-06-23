import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, SafeAreaView, Dimensions, Linking, Image, Platform } from 'react-native';
import { client, config } from '../../lib/appwrite';
import { Databases, Query } from 'react-native-appwrite';
import { FontAwesome6 } from '@expo/vector-icons';

const databases = new Databases(client);
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

interface YouTubeShort {
  $id: string;
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_icon: string;
}

const Home: React.FC = () => {
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await databases.listDocuments(
        config.databaseId,
        '6859c0b9002d3cb101f5',
        [Query.limit(20), Query.orderDesc('$createdAt')]
      );
      
      setShorts(response.documents as YouTubeShort[]);
    } catch (error: any) {
      console.error('Error fetching shorts:', error);
      setError(error.message || 'Failed to load shorts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShorts();
  };

  const openVideo = async (videoId: string) => {
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const youtubeMobileUrl = `youtube://watch?v=${videoId}`;
    
    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const supported = await Linking.canOpenURL(youtubeMobileUrl);
        if (supported) {
          await Linking.openURL(youtubeMobileUrl);
        } else {
          await Linking.openURL(youtubeUrl);
        }
      } else {
        await Linking.openURL(youtubeUrl);
      }
    } catch (error) {
      console.error('Error opening video:', error);
      await Linking.openURL(youtubeUrl);
    }
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const currentPage = Math.round(contentOffset.y / layoutMeasurement.height);
    setCurrentIndex(currentPage);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-towasecondary">
        <ActivityIndicator size="large" color="#8058ac" />
        <Text 
          className="text-xl text-stone-800 mt-4"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          Loading shorts...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-towasecondary p-4">
        <Text 
          className="text-xl text-red-600 text-center mb-4"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          {error}
        </Text>
        <TouchableOpacity 
          onPress={fetchShorts}
          className="bg-towagreen p-3 rounded-xl"
        >
          <Text 
            className="text-stone-800"
            style={{ fontFamily: "Sour Gummy Black" }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (shorts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-towasecondary p-4">
        <Text 
          className="text-xl text-stone-800 text-center"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          No shorts available yet. Run your scraper to collect some videos!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-towasecondary">
      <SafeAreaView className="flex-1">
        <View className="flex-row justify-between items-center px-4 py-2 bg-towaprimary">
          <Text 
            className="text-stone-800 text-3xl"
            style={{ fontFamily: "Sour Gummy Black" }}
          >
            Home
          </Text>
          <Text className="text-stone-800 text-sm opacity-70">
            {shorts.length} videos
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {shorts.map((short, index) => (
            <View 
              key={short.$id} 
              style={{ 
                width: screenWidth, 
                height: screenHeight * 0.85
              }}
              className="justify-center items-center bg-black"
            >
              <TouchableOpacity 
                onPress={() => openVideo(short.video_id)}
                className="relative w-full h-full"
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: getYouTubeThumbnail(short.video_id) }}
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    resizeMode: 'cover'
                  }}
                />
                
                <View className="absolute inset-0 justify-center items-center">
                  <View className="bg-black/50 rounded-full p-4">
                    <FontAwesome6 
                      name="play" 
                      size={40} 
                      color="white" 
                    />
                  </View>
                </View>

                <View className="absolute top-4 right-4">
                  <Text className="text-white text-sm opacity-70 bg-black/50 px-2 py-1 rounded">
                    {index + 1} / {shorts.length}
                  </Text>
                </View>
                
                <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <Text 
                    className="text-white text-lg mb-2 font-bold"
                    style={{ fontFamily: "Sour Gummy Black" }}
                    numberOfLines={2}
                  >
                    {short.title}
                  </Text>
                  <Text 
                    className="text-white text-sm opacity-80"
                    numberOfLines={3}
                  >
                    {short.description.length > 150 
                      ? `${short.description.substring(0, 150)}...` 
                      : short.description}
                  </Text>
                  
                  <View className="flex-row items-center mt-2">
                    {short.channel_icon && (
                      <Image
                        source={{ uri: short.channel_icon }}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    )}
                    <Text className="text-white text-xs opacity-60">
                      Tap to watch on YouTube
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;