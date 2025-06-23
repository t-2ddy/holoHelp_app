import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, ActivityIndicator, Alert, Dimensions , TouchableOpacity} from 'react-native';
import { WebView } from 'react-native-webview';
import { client, config } from '../../lib/appwrite';
import { Databases, Query } from 'react-native-appwrite';

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

const YouTubeShortsPage: React.FC = () => {
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
        process.env.YOUTUBE_SHORTS_COLLECTION_ID || 'your_collection_id',
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

  const createYouTubeEmbedHTML = (videoId: string) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          body {
            margin: 0;
            padding: 0;
            background: black;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
          }
          iframe {
            border: none;
            width: 100vw;
            height: 100vh;
          }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1&fs=1&playsinline=1"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowfullscreen
        ></iframe>
      </body>
      </html>
    `;
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
    <View className="flex-1 bg-black">
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
              height: screenHeight 
            }}
          >
            <WebView
              source={{ html: createYouTubeEmbedHTML(short.video_id) }}
              style={{ flex: 1 }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              scalesPageToFit
              bounces={false}
              scrollEnabled={false}
              renderLoading={() => (
                <View className="flex-1 justify-center items-center bg-black">
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            />
            
            {/* Video Info Overlay */}
            <View className="absolute bottom-20 left-4 right-16 z-10">
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
                {short.description.length > 100 
                  ? `${short.description.substring(0, 100)}...` 
                  : short.description}
              </Text>
            </View>

            {/* Video Counter */}
            <View className="absolute top-12 right-4 z-10">
              <Text className="text-white text-sm opacity-70">
                {index + 1} / {shorts.length}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default YouTubeShortsPage;