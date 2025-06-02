import {View, Text, Image, ScrollView, SafeAreaView } from 'react-native'
import React from 'react'
import MessagePreview from '../components/MessagePreview'
import { router } from 'expo-router'

const towaClose = require('../../assets/images/towa_close.jpg')

const chats = () => {
    const characters = [
        {
            id: 'towa',
            name: 'Towa',
            image: towaClose
        }
    ];

    return (
        <View className='flex-1 bg-towasecondary'>
            <SafeAreaView>
                <Text
                    className='text-4xl p-4 text-stone-800 mt-8'
                    style={{ fontFamily: "Sour Gummy Black" }}
                >
                    Chats
                </Text>
                
                <ScrollView contentContainerStyle={{ height: "100%" }}>
                    <View className='flex sm:w-full sm:h-full p-4 px-4'>
                        {characters.map(character => (
                            <MessagePreview
                                key={character.id}
                                characterId={character.id}
                                characterName={character.name}
                                characterImage={character.image}
                                onPress={() => router.push(`../screens/messages/${character.id}Text`)}
                            />
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    )
}

export default chats