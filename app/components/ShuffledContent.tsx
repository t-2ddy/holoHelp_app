import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client, config } from '../../lib/appwrite';
import { Databases, Query } from 'react-native-appwrite';

const databases = new Databases(client);

interface SavedTweet {
  $id: string;
  tweet_id: string;
  username: string;
  text: string;
  created_at: string;
  media_urls: string;
  url: string;
  type: 'tweet';
}

interface YouTubeShort {
  $id: string;
  video_id: string;
  title: string;
  description: string;
  channel_id: string;
  channel_icon: string;
  type: 'short';
}

type ContentItem = SavedTweet | YouTubeShort;

interface ShuffledContentProps {
  translateMode?: boolean;
}

const TRANSLATION_STORAGE_KEY = 'tweet_translations';

const ShuffledContent: React.FC<ShuffledContentProps> = ({ translateMode = false }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [translatedTexts, setTranslatedTexts] = useState<{[key: string]: string}>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [renderedItems, setRenderedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    loadStoredTranslations();
    fetchContent();
  }, []);

  useEffect(() => {
    if (translateMode && renderedItems.size > 0) {
      processTranslationQueue();
    }
  }, [translateMode, renderedItems]);

  const loadStoredTranslations = async () => {
    try {
      const stored = await AsyncStorage.getItem(TRANSLATION_STORAGE_KEY);
      if (stored) {
        setTranslatedTexts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading stored translations:', error);
    }
  };

  const saveTranslationToStorage = async (itemId: string, translation: string) => {
    try {
      const currentTranslations = await AsyncStorage.getItem(TRANSLATION_STORAGE_KEY);
      const translations = currentTranslations ? JSON.parse(currentTranslations) : {};
      translations[itemId] = translation;
      await AsyncStorage.setItem(TRANSLATION_STORAGE_KEY, JSON.stringify(translations));
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tweetsResponse, shortsResponse] = await Promise.all([
        databases.listDocuments(
          config.databaseId,
          'tweets_collection',
          [Query.orderDesc('created_at'), Query.limit(10)]
        ),
        databases.listDocuments(
          config.databaseId,
          config.youtubeShortsCollectionID,
          [Query.orderDesc('$createdAt'), Query.limit(10)]
        )
      ]);
      
      const tweets: SavedTweet[] = tweetsResponse.documents.map(doc => ({
        ...doc as SavedTweet,
        type: 'tweet'
      }));

      const shorts: YouTubeShort[] = shortsResponse.documents.map(doc => ({
        ...doc as YouTubeShort,
        type: 'short'
      }));

      const combined = [...tweets, ...shorts];
      const shuffled = shuffleArray(combined);
      
      setContent(shuffled);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      setError(error.message || 'Failed to load content');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContent();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openTweetUrl = (url: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Do you want to open this tweet in Twitter?");
      if (confirmed) {
        window.open(url, '_blank');
      }
    } else {
      Alert.alert(
        "Open Tweet",
        "Do you want to open this tweet in Twitter?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Open",
            onPress: () => Linking.openURL(url)
          }
        ]
      );
    }
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

  const translateText = async (text: string, itemId: string) => {
    if (translatedTexts[itemId]) {
      return translatedTexts[itemId];
    }

    setTranslatingIds(prev => new Set([...prev, itemId]));

    try {
      const maxLength = 450;
      let textToTranslate = text;
      let wasTruncated = false;
      
      if (text.length > maxLength) {
        textToTranslate = text.substring(0, maxLength);
        wasTruncated = true;
      }

      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=ja|en`);
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        let translated = data.responseData.translatedText;
        
        if (wasTruncated) {
          translated += "...";
        }
        
        setTranslatedTexts(prev => ({
          ...prev,
          [itemId]: translated
        }));
        
        await saveTranslationToStorage(itemId, translated);
        
        return translated;
      } else {
        return text;
      }
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setTranslatingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const processTranslationQueue = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const visibleItemIds = Array.from(renderedItems);
    
    for (const itemId of visibleItemIds) {
      if (!translateMode) break;
      
      const item = content.find(i => i.$id === itemId);
      if (item && item.type === 'tweet' && !translatedTexts[item.$id] && !translatingIds.has(item.$id)) {
        await translateText((item as SavedTweet).text, item.$id);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    isProcessingRef.current = false;
  };

  const handleItemRender = (itemId: string) => {
    setRenderedItems(prev => new Set([...prev, itemId]));
  };

  const parseMediaUrls = (mediaUrlsString: string): string[] => {
    try {
      return JSON.parse(mediaUrlsString || '[]');
    } catch {
      return [];
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text 
          className="text-xl text-stone-800"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          Loading content...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text 
          className="text-xl text-red-600 text-center"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          {error}
        </Text>
        <TouchableOpacity 
          onPress={fetchContent}
          className="mt-4 bg-towagreen p-3 rounded-xl"
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

  if (content.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text 
          className="text-xl text-stone-800 text-center"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          No content available yet. Run your scrapers to collect some content!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      className="flex-1"
    >
      {content.map((item) => {
        if (item.type === 'tweet') {
          const tweet = item as SavedTweet;
          const mediaUrls = parseMediaUrls(tweet.media_urls);
          
          return (
            <View 
              key={tweet.$id}
              onLayout={() => handleItemRender(tweet.$id)}
            >
              <TouchableOpacity 
                onPress={() => openTweetUrl(tweet.url)}
                activeOpacity={0.7}
                style={{ cursor: Platform.OS === 'web' ? 'pointer' : 'default' }}
              >
                <View className="bg-towa3 mx-4 mb-4 p-4 rounded-2xl">
                  <View className="flex-row items-center mb-3">
                    <View className="flex-1">
                      <Text 
                        className="text-lg text-stone-800"
                        style={{ fontFamily: "Sour Gummy Black" }}
                      >
                        @{tweet.username}
                      </Text>
                      <Text className="text-stone-600 text-sm">
                        {formatDate(tweet.created_at)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-stone-800 text-base mb-3 leading-5">
                    {translateMode && translatedTexts[tweet.$id] 
                      ? translatedTexts[tweet.$id] 
                      : tweet.text}
                    {translateMode && translatingIds.has(tweet.$id) && (
                      <Text className="text-stone-600 text-sm italic"> (translating...)</Text>
                    )}
                  </Text>
                  
                  {mediaUrls.length > 0 && (
                    <View className="flex-row flex-wrap">
                      {mediaUrls.map((mediaUrl, index) => (
                        <Image 
                          key={index}
                          source={{ uri: mediaUrl }}
                          className="w-32 h-32 rounded-lg mr-2 mb-2"
                          resizeMode="cover"
                        />
                      ))}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        } else {
          const short = item as YouTubeShort;
          
          return (
            <View 
              key={short.$id}
              onLayout={() => handleItemRender(short.$id)}
            >
              <TouchableOpacity 
                onPress={() => openVideo(short.video_id)}
                activeOpacity={0.7}
                style={{ cursor: Platform.OS === 'web' ? 'pointer' : 'default' }}
              >
                <View className="bg-white mx-4 mb-4 rounded-2xl overflow-hidden shadow-lg">
                  <View className="h-48 relative">
                    <Image
                      source={{ uri: getYouTubeThumbnail(short.video_id) }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    <View className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded-lg">
                      <Text className="text-white text-xs font-bold">YouTube</Text>
                    </View>
                  </View>
                  
                  <View className="p-4 bg-white">
                    <Text 
                      className="text-lg text-stone-800 font-bold mb-2"
                      style={{ fontFamily: "Sour Gummy Black" }}
                      numberOfLines={2}
                    >
                      {short.title}
                    </Text>
                    
                    <Text 
                      className="text-stone-600 text-sm mb-3"
                      numberOfLines={3}
                    >
                      {truncateText(short.description, 120)}
                    </Text>
                    
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        {short.channel_icon && (
                          <Image
                            source={{ uri: short.channel_icon }}
                            className="w-5 h-5 rounded-full mr-2"
                          />
                        )}
                        <Text className="text-stone-500 text-xs flex-1" numberOfLines={1}>
                          Tap to watch on YouTube
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          );
        }
      })}
      
      <View className='flex flex-row justify-center items-center py-4'>
        <Image
          source={require('../../assets/images/towa_point.png')}
          className='size-32'
        />
        <Text className='text-lg text-center ml-2'
              style={{ fontFamily: "Sour Gummy Black" }}>
          you have reached the bottom ..
        </Text>
      </View>
    </ScrollView>
  );
};

export default ShuffledContent;