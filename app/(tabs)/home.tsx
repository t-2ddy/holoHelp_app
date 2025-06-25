import React from 'react';
import { View, SafeAreaView, Text, ScrollView } from 'react-native';
import TodoList from '../components/TodoList';

const Home: React.FC = () => {
  return (
    <View className="flex-1 bg-towasecondary">
      <SafeAreaView className="flex-1">
        <View className='flex-row justify-between items-center'>
            <Text
                className='text-4xl p-4 text-stone-800 mt-8'
                style={{ fontFamily: "Sour Gummy Black" }}
            >
                Home
            </Text>
        </View>
        <ScrollView>
          <View className='bg-towaprimary mx-4 rounded-3xl'>
            <Text
                className='text-2xl p-4 text-stone-800 mt-4'
                style={{ fontFamily: "Sour Gummy Black" }}
            >
              Todo
            </Text>
            <TodoList />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default Home;