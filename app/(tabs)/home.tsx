import {View, Text, SafeAreaView, ScrollView } from 'react-native'
import React from 'react'
import TodoList from '../components/TodoList'

const Home = () => {
    return (
        <View className='flex-1 bg-towasecondary'>
            <SafeAreaView className="flex-1">
                <Text
                    className='text-4xl p-4 text-stone-800 mt-8'
                    style={{ fontFamily: "Sour Gummy Black" }}
                >
                    Home
                </Text>

                <ScrollView className='px-4'>
                    <View className="flex-1 p-4 bg-towa3 rounded-2xl mt-4">
                                <Text
                                    className='text-2xl text-stone-800 mb-1'
                                    style={{ fontFamily: "Sour Gummy Black" }}
                                >
                                    Tasks
                                </Text>

                        <View className="flex-1">
                            <TodoList />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default Home