import { View, Text } from 'react-native'
import { Tabs } from 'expo-router'
import { FontAwesome6 } from '@expo/vector-icons'

const TabIcon = ({ icon, color, size, focused }) => {
    return (
        <View className='flex justify-center justify-items-center mt-1'>
            <FontAwesome6
                name={icon}
                size={size || 26}
                color={color || 'black'}
                solid={focused}
            />
        </View>
    )
}

const TabsLayout = () => {
    return (
        <Tabs 
        screenOptions={{ 
            tabBarStyle: {
                height: 90,
                backgroundColor: '#a083c9',
                borderTopWidth: 0
            }, 
            tabBarActiveTintColor: '#8058ac',
            tabBarInactiveTintColor: '#ded9f6'
            }}>
            <Tabs.Screen
                name="home"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon 
                            icon="list-check"
                            color={color}
                            size={26}
                            focused={focused}
                        />
            
                    ),
                }}
            />
            <Tabs.Screen
                name="chats"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon 
                            icon="comment"
                            color={color}
                            size={26}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="discover"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon 
                            icon="play"
                            color={color}
                            size={26}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="gacha"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon 
                            icon="user-group"
                            color={color}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: '',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon 
                            icon="gear"
                            color={color}
                            size={24}
                            focused={focused}
                        />
                    ),
                }}
            />
        </Tabs>
    )
}


export default TabsLayout