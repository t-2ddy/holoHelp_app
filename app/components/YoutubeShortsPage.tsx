import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  Image, 
  Platform,
  RefreshControl,
  Alert,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const webViewRefs = useRef<{ [key: number]: WebView | null }>({});

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
        [Query.limit(10), Query.orderDesc('$createdAt')]
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

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const currentPage = Math.round(contentOffset.y / layoutMeasurement.height);
    setCurrentIndex(currentPage);
  };

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const playVideo = (index: number) => {
    setPlayingIndex(index);
  };

  const openInYouTube = (videoId: string) => {
    const url = `https://youtube.com/shorts/${videoId}`;
    Linking.openURL(url);
  };

  // YouTube Player API HTML
  const getYouTubeHTML = (videoId: string, shouldPlay: boolean) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <style>
          * { margin: 0; padding: 0; }
          body { background: black; overflow: hidden; }
          #player { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script>
          var tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          var player;
          function onYouTubeIframeAPIReady() {
            player = new YT.Player('player', {
              height: '100%',
              width: '100%',
              videoId: '${videoId}',
              playerVars: {
                'playsinline': 1,
                'autoplay': ${shouldPlay ? 1 : 0},
                'controls': 1,
                'modestbranding': 1,
                'rel': 0,
                'showinfo': 0,
                'fs': 1,
                'loop': 1,
                'playlist': '${videoId}'
              },
              events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
              }
            });
          }

          function onPlayerReady(event) {
            if (${shouldPlay}) {
              event.target.playVideo();
            }
          }

          function onPlayerStateChange(event) {
            if (event.data == YT.PlayerState.ENDED) {
              player.playVideo();
            }
          }

          // Message handler for play/pause
          window.addEventListener('message', function(e) {
            if (e.data === 'play' && player && player.playVideo) {
              player.playVideo();
            } else if (e.data === 'pause' && player && player.pauseVideo) {
              player.pauseVideo();
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#8058ac" />
        <Text className="text-xl text-white mt-4">Loading shorts...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-black p-4">
        <Text className="text-xl text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={fetchShorts} className="bg-towagreen px-6 py-3 rounded-xl">
          <Text className="text-stone-800 font-bold">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="absolute top-12 left-0 right-0 z-10 flex-row justify-between items-center px-4">
          <Text className="text-white text-3xl font-bold" style={{ fontFamily: "Sour Gummy Black" }}>
            Shorts
          </Text>
          <Text className="text-white text-sm opacity-70">
            {currentIndex + 1} / {shorts.length}
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }
        >
          {shorts.map((short, index) => (
            <View key={short.$id} style={{ width: screenWidth, height: screenHeight * 0.9 }}>
              {playingIndex === index ? (
                // WebView with YouTube player
                <View className="flex-1">
                  <WebView
                    ref={(ref) => { webViewRefs.current[index] = ref; }}
                    source={{ html: getYouTubeHTML(short.video_id, true) }}
                    style={{ flex: 1, backgroundColor: 'black' }}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    mixedContentMode="compatibility"
                    originWhitelist={['*']}
                    onShouldStartLoadWithRequest={() => true}
                  />
                  
                  {/* Close button */}
                  <TouchableOpacity 
                    className="absolute top-4 right-4 bg-black/50 rounded-full p-2"
                    onPress={() => setPlayingIndex(null)}
                  >
                    <FontAwesome6 name="xmark" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                // Thumbnail with play button
                <TouchableOpacity 
                  activeOpacity={0.95}
                  onPress={() => playVideo(index)}
                  className="flex-1"
                >
                  <Image
                    source={{ uri: getYouTubeThumbnail(short.video_id) }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  
                  {/* Play button overlay */}
                  <View className="absolute inset-0 justify-center items-center">
                    <View className="bg-black/60 rounded-full p-6">
                      <FontAwesome6 name="play" size={50} color="white" style={{ marginLeft: 5 }} />
                    </View>
                  </View>

                  {/* Overlay UI */}
                  <View className="absolute inset-0 pointer-events-box-none">
                    {/* Interaction buttons */}
                    <View className="absolute right-4 bottom-32 gap-5">
                      <TouchableOpacity className="items-center mb-5" onPress={() => Alert.alert('Like!')}>
                        <View className="bg-white/20 rounded-full p-3">
                          <FontAwesome6 name="heart" size={28} color="white" />
                        </View>
                        <Text className="text-white text-xs mt-1">Like</Text>
                      </TouchableOpacity>

                      <TouchableOpacity className="items-center mb-5" onPress={() => Alert.alert('Comments!')}>
                        <View className="bg-white/20 rounded-full p-3">
                          <FontAwesome6 name="comment" size={28} color="white" />
                        </View>
                        <Text className="text-white text-xs mt-1">Comment</Text>
                      </TouchableOpacity>

                      <TouchableOpacity className="items-center mb-5" onPress={() => Alert.alert('Share!')}>
                        <View className="bg-white/20 rounded-full p-3">
                          <FontAwesome6 name="share" size={28} color="white" />
                        </View>
                        <Text className="text-white text-xs mt-1">Share</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        className="items-center" 
                        onPress={() => openInYouTube(short.video_id)}
                      >
                        <View className="bg-red-600 rounded-full p-3">
                          <FontAwesome6 name="youtube" size={28} color="white" />
                        </View>
                        <Text className="text-white text-xs mt-1">YouTube</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Video info */}
                    <View className="absolute bottom-4 left-4 right-20">
                      <View className="flex-row items-center mb-2">
                        {short.channel_icon && (
                          <Image source={{ uri: short.channel_icon }} className="w-10 h-10 rounded-full mr-3" />
                        )}
                        <TouchableOpacity className="bg-white/20 px-3 py-1 rounded-full">
                          <Text className="text-white text-sm font-bold">Follow</Text>
                        </TouchableOpacity>
                      </View>
                      <Text 
                        className="text-white text-lg font-bold mb-1" 
                        style={{ textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 }}
                        numberOfLines={2}
                      >
                        {short.title}
                      </Text>
                      <Text 
                        className="text-white/80 text-sm" 
                        style={{ textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 }}
                        numberOfLines={2}
                      >
                        {short.description.substring(0, 100)}...
                      </Text>
                      <TouchableOpacity onPress={() => playVideo(index)}>
                        <Text className="text-white/60 text-xs mt-2">Tap to play video</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;