import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, Image } from 'react-native';

interface Tweet {
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    attachments?: {
        media_keys: string[];
    };
}

interface User {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
}

interface Media {
    media_key: string;
    type: string;
    url: string;
}

const TowaTweets = () => {
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTweets();
    }, []);

const BEARER_TOKEN = "";

    const fetchTweets = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const userResponse = await fetch(
                `https://api.twitter.com/2/users/by/username/tokoyamitowa?user.fields=profile_image_url,public_metrics`,
                {
                    headers: {
                        'Authorization': `Bearer ${BEARER_TOKEN}`
                    }
                }
            );

            if (!userResponse.ok) {
                throw new Error(`User API error: ${userResponse.status}`);
            }
           
            const userData = await userResponse.json();
            setUser(userData.data);

            const tweetsResponse = await fetch(
                `https://api.twitter.com/2/users/${userData.data.id}/tweets?max_results=20&tweet.fields=created_at,attachments,public_metrics&media.fields=url,type&expansions=attachments.media_keys`,
                {
                    headers: {
                        'Authorization': `Bearer ${BEARER_TOKEN}`
                    }
                }
            );

            if (!tweetsResponse.ok) {
                throw new Error(`Tweets API error: ${tweetsResponse.status}`);
            }

            const tweetsData = await tweetsResponse.json();
            setTweets(tweetsData.data || []);
            
            if (tweetsData.includes?.media) {
                setMedia(tweetsData.includes.media);
            }

        } catch (error: any) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTweets();
    };

    const getMediaForTweet = (tweetAttachments?: { media_keys: string[] }) => {
        if (!tweetAttachments?.media_keys) return [];
        return media.filter(m => tweetAttachments.media_keys.includes(m.media_key));
    };

    if (loading) return <Text>Loading...</Text>;
    if (error) return <Text>Error: {error}</Text>;

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {tweets.map((tweet) => {
                const tweetMedia = getMediaForTweet(tweet.attachments);
                
                return (
                    <View key={tweet.id}>
                        <Image source={{ uri: user?.profile_image_url }} />
                        <Text>{user?.name}</Text>
                        <Text>@{user?.username}</Text>
                        <Text>{tweet.text}</Text>
                        {tweetMedia.map((mediaItem) => (
                            <Image 
                                key={mediaItem.media_key}
                                source={{ uri: mediaItem.url }} 
                            />
                        ))}
                        <Text>{new Date(tweet.created_at).toLocaleString()}</Text>
                    </View>
                );
            })}
        </ScrollView>
    );
};

export default TowaTweets;