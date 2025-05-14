import {View, Text, Image, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'

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

                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default discover