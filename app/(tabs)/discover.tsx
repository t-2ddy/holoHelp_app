import {View, Text, Image, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'

import GetTweets from '../components/GetTweet'

const towaPoint = require('../../assets/images/towa_point.png')

const discover = () => {
    return (
        <View className='flex-1 bg-towasecondary'>
            <SafeAreaView>
                <Text
                    className='text-4xl p-4 text-stone-800 mt-8'
                    style={{ fontFamily: "Sour Gummy Black" }}
                >
                    News
                </Text>
                <ScrollView contentContainerStyle={{ height: "100%" }}>
                    <View className='flex flex-col'>
                        <GetTweets />
                        
                        <View className='flex flex-row justify-center items-center'>
                        <Image
                            source={towaPoint}
                            className='size-72'
                        />
                        <Text className='text-3xl justify-center text-center'
                        style={{ fontFamily: "Sour Gummy Black" }}>
                            you have reached the bottom ..
                        </Text>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default discover