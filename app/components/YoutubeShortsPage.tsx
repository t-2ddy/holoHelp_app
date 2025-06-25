import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  Linking, 
  Image, 
  Platform,
  StatusBar
} from 'react-native';
import { client, config } from '../../lib/appwrite';
import { Databases, Query } from 'react-native-appwrite';
import { FontAwesome6 } from '@expo/vector-icons';

const databases = new Databases(client);

interface YouTubeShort {
  $id: string;
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_icon: string;
}

interface YouTubeShortsViewerProps {
  limit?: number;
  showHeader?: boolean;
  headerTitle?: string;
}

const YouTubeShortsViewer: React.FC<YouTubeShortsViewerProps> = ({
  limit = 20,
  showHeader = true,
  headerTitle = 'Home'
}) => {
  const [shorts, setShorts] = useState<YouTubeShort[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { height: screenHeight, width: screenWidth } = dimensions;
  
  const isTablet = screenWidth >= 768;
  const isDesktop = screenWidth >= 1024;
  const isMobile = screenWidth < 768;
  
  const getResponsiveValues = () => {
    if (isDesktop) {
      return {
        columns: 3,
        cardWidth: (screenWidth - 80) / 3,
        cardHeight: 320,
        padding: 20,
        gap: 16,
        titleSize: 'text-lg',
        descSize: 'text-base',
        iconSize: 16
      };
    } else if (isTablet) {
      return {
        columns: 2,
        cardWidth: (screenWidth - 60) / 2,
        cardHeight: 280,
        padding: 16,
        gap: 12,
        titleSize: 'text-base',
        descSize: 'text-sm',
        iconSize: 14
      };
    } else {
      return {
        columns: 1,
        cardWidth: screenWidth - 32,
        cardHeight: Math.min(screenHeight * 0.6, 400),
        padding: 16,
        gap: 16,
        titleSize: 'text-base',
        descSize: 'text-sm',
        iconSize: 12
      };
    }
  };

  const responsive = getResponsiveValues();

  const statusBarHeight = StatusBar.currentHeight || 0;
  const safeAreaTop = Platform.OS === 'ios' ? 44 : statusBarHeight;

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await databases.listDocuments(
        config.databaseId,
        config.youtubeShortsCollectionID,
        [Query.limit(limit), Query.orderDesc('$createdAt')]
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
    const { contentOffset } = event.nativeEvent;
    const currentPage = Math.round(contentOffset.y / responsive.cardHeight);
    setCurrentIndex(currentPage);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const renderCard = (short: YouTubeShort, index: number) => (
    <TouchableOpacity 
      key={short.$id}
      onPress={() => openVideo(short.video_id)}
      style={{ 
        width: responsive.cardWidth,
        height: responsive.cardHeight,
        marginBottom: responsive.gap,
        marginRight: responsive.columns > 1 && (index + 1) % responsive.columns !== 0 ? responsive.gap : 0
      }}
      className="bg-white rounded-2xl overflow-hidden shadow-lg"
      activeOpacity={0.9}
    >
      <View style={{ height: responsive.cardHeight * 0.65 }} className="relative">
        <Image
          source={{ uri: getYouTubeThumbnail(short.video_id) }}
          style={{ 
            width: '100%', 
            height: '100%',
            resizeMode: 'cover'
          }}
        />
      </View>
      
      <View style={{ height: responsive.cardHeight * 0.35 }} className="p-3 bg-white justify-between">
        <View className="flex-1">
          <Text 
            className={`text-stone-800 font-bold mb-1 ${responsive.titleSize}`}
            style={{ fontFamily: "Sour Gummy Black" }}
            numberOfLines={2}
          >
            {short.title}
          </Text>
          
          <Text 
            className={`text-stone-600 ${responsive.descSize}`}
            numberOfLines={isDesktop ? 3 : 2}
          >
            {truncateText(short.description, isDesktop ? 120 : 80)}
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center flex-1">
            {short.channel_icon && (
              <Image
                source={{ uri: short.channel_icon }}
                style={{ width: 20, height: 20 }}
                className="rounded-full mr-2"
              />
            )}
            <Text className="text-stone-500 text-xs flex-1" numberOfLines={1}>
              Tap to watch
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderGrid = () => {
    if (responsive.columns === 1) {
      return shorts.map((short, index) => renderCard(short, index));
    }

    const rows = [];
    for (let i = 0; i < shorts.length; i += responsive.columns) {
      const rowItems = shorts.slice(i, i + responsive.columns);
      rows.push(
        <View 
          key={`row-${i}`} 
          className="flex-row justify-between"
          style={{ paddingHorizontal: responsive.padding }}
        >
          {rowItems.map((short, index) => renderCard(short, i + index))}
          {rowItems.length < responsive.columns && 
            Array.from({ length: responsive.columns - rowItems.length }).map((_, emptyIndex) => (
              <View 
                key={`empty-${emptyIndex}`}
                style={{ width: responsive.cardWidth, height: 0 }}
              />
            ))
          }
        </View>
      );
    }
    return rows;
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
    <SafeAreaView className="flex-1 bg-towasecondary">
      {showHeader && (
        <View 
          className="flex-row justify-between items-center bg-towasecondary"
          style={{ paddingHorizontal: responsive.padding, paddingVertical: 12 }}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setHeaderHeight(height);
          }}
        >
          <Text 
            className={`text-stone-800 ${isDesktop ? 'text-4xl' : isTablet ? 'text-3xl' : 'text-3xl'}`}
            style={{ fontFamily: "Sour Gummy Black" }}
          >
            {headerTitle}
          </Text>
        </View>
      )}

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="bg-towasecondary"
        contentContainerStyle={{ 
          padding: responsive.columns === 1 ? responsive.padding : 0,
          paddingBottom: 40 
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderGrid()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default YouTubeShortsViewer;