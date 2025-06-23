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
}

interface GetTweetsProps {
  translateMode?: boolean;
}

const TRANSLATION_STORAGE_KEY = 'tweet_translations';

const GetTweets: React.FC<GetTweetsProps> = ({ translateMode = false }) => {
  const [tweets, setTweets] = useState<SavedTweet[]>([]);
  const [translatedTexts, setTranslatedTexts] = useState<{[key: string]: string}>({});
  const [translatingIds, setTranslatingIds] = useState<Set<string>>(new Set());
  const [renderedTweets, setRenderedTweets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const translationQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    loadStoredTranslations();
    fetchSavedTweets();
  }, []);

  useEffect(() => {
    if (translateMode && renderedTweets.size > 0) {
      processTranslationQueue();
    }
  }, [translateMode, renderedTweets]);

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

  const saveTranslationToStorage = async (tweetId: string, translation: string) => {
    try {
      const currentTranslations = await AsyncStorage.getItem(TRANSLATION_STORAGE_KEY);
      const translations = currentTranslations ? JSON.parse(currentTranslations) : {};
      translations[tweetId] = translation;
      await AsyncStorage.setItem(TRANSLATION_STORAGE_KEY, JSON.stringify(translations));
    } catch (error) {
      console.error('Error saving translation:', error);
    }
  };

  const processTranslationQueue = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    const visibleTweetIds = Array.from(renderedTweets);
    
    for (const tweetId of visibleTweetIds) {
      if (!translateMode) break;
      
      const tweet = tweets.find(t => t.$id === tweetId);
      if (tweet && !translatedTexts[tweet.$id] && !translatingIds.has(tweet.$id)) {
        await translateText(tweet.text, tweet.$id);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    isProcessingRef.current = false;
  };

  const fetchSavedTweets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await databases.listDocuments(
        config.databaseId,
        'tweets_collection',
        [Query.orderDesc('created_at'), Query.limit(10)]
      );
      
      setTweets(response.documents as SavedTweet[]);
    } catch (error: any) {
      console.error('Error fetching saved tweets:', error);
      setError(error.message || 'Failed to load tweets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedTweets();
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

  const translateText = async (text: string, tweetId: string) => {
    if (translatedTexts[tweetId]) {
      return translatedTexts[tweetId];
    }

    setTranslatingIds(prev => new Set([...prev, tweetId]));

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
          [tweetId]: translated
        }));
        
        await saveTranslationToStorage(tweetId, translated);
        
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
        newSet.delete(tweetId);
        return newSet;
      });
    }
  };

  const handleTweetRender = (tweetId: string) => {
    setRenderedTweets(prev => new Set([...prev, tweetId]));
  };

  const parseMediaUrls = (mediaUrlsString: string): string[] => {
    try {
      return JSON.parse(mediaUrlsString || '[]');
    } catch {
      return [];
    }
  };

  const clearStoredTranslations = async () => {
    try {
      await AsyncStorage.removeItem(TRANSLATION_STORAGE_KEY);
      setTranslatedTexts({});
      console.log('Stored translations cleared');
    } catch (error) {
      console.error('Error clearing translations:', error);
    }
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text 
          className="text-xl text-stone-800"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          Loading tweets...
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
          onPress={fetchSavedTweets}
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

  if (tweets.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4">
        <Text 
          className="text-xl text-stone-800 text-center"
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          No tweets saved yet. Run your Twitter scraper to collect some tweets!
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
      {tweets.map((tweet) => {
        const mediaUrls = parseMediaUrls(tweet.media_urls);
        
        return (
          <View 
            key={tweet.$id}
            onLayout={() => handleTweetRender(tweet.$id)}
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

export default GetTweets;