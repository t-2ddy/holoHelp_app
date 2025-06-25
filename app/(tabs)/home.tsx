import React from 'react';
import { View, SafeAreaView } from 'react-native';
import YoutubeShortsPage from '../components/YoutubeShortsPage';

const Home: React.FC = () => {
  return (
    <View className="flex-1 bg-towasecondary">
      <SafeAreaView className="flex-1">
        <YoutubeShortsPage
          limit={20}
          showHeader={true}
          headerTitle="Home"
        />
      </SafeAreaView>
    </View>
  );
};

export default Home;