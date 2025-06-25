import { View, Text, Image, SafeAreaView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { FontAwesome6 } from '@expo/vector-icons'
import ShuffledContent from '../components/ShuffledContent'

const towaPoint = require('../../assets/images/towa_point.png')

const discover = () => {
    const [translateMode, setTranslateMode] = useState(false);

    const toggleTranslate = () => {
        setTranslateMode(!translateMode);
    };

    return (
        <View className='flex-1 bg-towasecondary'>
            <SafeAreaView className="flex-1">
                <View className='flex-row justify-between items-center'>
                    <Text
                        className='text-4xl p-4 text-stone-800 mt-8'
                        style={{ fontFamily: "Sour Gummy Black" }}
                    >
                        Towa Talkin
                    </Text>
                    
                    <TouchableOpacity 
                        onPress={toggleTranslate}
                        className={`px-4 py-2 mt-6 mr-4 rounded-xl flex-row items-center ${translateMode ? 'bg-towagreen' : 'bg-towa3'}`}
                        activeOpacity={0.7}
                    >
                        <FontAwesome6 
                            name="language" 
                            size={16} 
                            color="#2d3748" 
                            className ="mr-2"
                        />
                        <Text 
                            className='text-stone-800 text-sm'
                            style={{ fontFamily: "Sour Gummy Black" }}
                        >
                            {translateMode ? 'EN' : 'JP'}
                        </Text>
                    </TouchableOpacity>
                </View>
                
                <ShuffledContent translateMode={translateMode} />
            </SafeAreaView>
        </View>
    )
}

export default discover