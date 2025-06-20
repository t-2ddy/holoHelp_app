import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native'
import towaClose from '../../../assets/images/towa_close.jpg'
import { FontAwesome6 } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import TextBubble from '../../components/TextBubble'

import { chatService } from '../../../lib/apiService';
import { useGlobalContext } from '../../../context/GlobalProvider';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const TowaText = () => {
    const { user } = useGlobalContext();
    
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const keyboardAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    
    useEffect(() => {
        const keyboardWillShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                Animated.timing(keyboardAnim, {
                    toValue: e.endCoordinates.height,
                    duration: 250,
                    useNativeDriver: false,
                }).start();
            }
        );

        const keyboardWillHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
                Animated.timing(keyboardAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: false,
                }).start();
            }
        );

        return () => {
            keyboardWillShowListener.remove();
            keyboardWillHideListener.remove();
        };
    }, []);
    
    useEffect(() => {
        if (messages.length > 0) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);
    
    const dismissKeyboard = () => {
        Keyboard.dismiss();
    };
    
    useEffect(() => {
        if (user) {
            loadConversation();
        } else {
            setMessages([
                {
                    id: '1',
                    text: 'Welcome! Please log in to chat with me.',
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        }
    }, [user]);
    
    const loadConversation = async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            const history = await chatService.getChatHistory(user.$id, 20);
            
            if (history && history.length > 0) {
                const formattedMessages = history.map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    isUser: msg.role === 'user',
                    timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                })).reverse();
                
                setMessages(formattedMessages);
            } else {
                setMessages([{
                    id: 'welcome',
                    text: "Konyappi~ ⁎˃ᆺ˂⁎ I'm Towa! How can I help you today? You can ask me to add tasks, mark them complete, or just chat!",
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
            }
        } catch (error) {
            console.error('Error loading conversation:', error);
            setMessages([{
                id: 'error',
                text: "Sorry, I couldn't load our previous conversations. Let's start fresh! ⁎˃ᆺ˂⁎",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const sendMessage = async () => {
        if (!message.trim() || isLoading) return;
        
        if (!user) {
            Alert.alert('Please log in', 'You need to be logged in to chat with Towa.');
            return;
        }
        
        const userMessage = {
            id: Date.now().toString(),
            text: message.trim(),
            isUser: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);
        const messageToSend = message.trim();
        setMessage('');
        setIsLoading(true);
        
        try {
            const botResponse = await chatService.sendMessage(user.$id, messageToSend);
            
            const botMessage = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages(prevMessages => [...prevMessages, botMessage]);
            
        } catch (error) {
            console.error('Error sending message:', error);
            
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                text: "ಠ_ಠ Sorry, I'm having trouble right now. Please try again!",
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            setMessages(prevMessages => [...prevMessages, errorMsg]);
        } finally {
            setIsLoading(false);
            Keyboard.dismiss();
        }
    };
   
    return (
        <KeyboardAvoidingView 
            className='flex-1 bg-towaprimary'
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <SafeAreaView className="flex-1">
                <View className='flex-1'>
                    <View className='flex-row items-center justify-between w-full px-6 py-4'>
                        <TouchableOpacity
                            className='p-2'
                            activeOpacity={.6}
                            onPress={() => router.replace('/(tabs)/chats')}
                        >
                            <FontAwesome6
                                name="angle-left"
                                size={26}
                                color="#ded9f6"
                                solid={'focused'}
                            />
                        </TouchableOpacity>

                        <View className='flex-1 justify-center items-center'>
                            <Image
                                source={towaClose}
                                className='size-12 rounded-full mb-1'
                                style={{ width: 48, height: 48 }}
                            />
                            <Text
                                style={{ fontFamily: "Sour Gummy Black" }}
                                className='text-xl'
                            >
                                Towa {isLoading ? '(typing...)' : ''}
                            </Text>
                        </View>

                        <TouchableOpacity
                            className='p-2'
                            activeOpacity={.6}
                            onPress={() => router.push('../../(tabs)/home')}
                        >
                            <FontAwesome6
                                name="list-check"
                                size={26}
                                color="#ded9f6"
                                solid={'focused'}
                            />
                        </TouchableOpacity>
                    </View>
                    
                    <TouchableWithoutFeedback onPress={dismissKeyboard}>
                        <View className='bg-towasecondary flex-1 w-full mt-2'>
                            <ScrollView 
                              ref={scrollViewRef}
                              className="flex-1 px-3 py-2"
                              contentContainerStyle={{ paddingBottom: 10 }}
                            >
                                {messages.map((msg) => (
                                  <TextBubble 
                                    key={msg.id} 
                                    message={msg.text} 
                                    isUser={msg.isUser} 
                                    timestamp={msg.timestamp}
                                  />
                                ))}
                                {isLoading && (
                                    <View className="flex-row justify-start">
                                        <View className="bg-towa3 rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                                            <Text className="text-stone-800">Towa is thinking... ⁎˃ᆺ˂⁎</Text>
                                        </View>
                                    </View>
                                )}
                            </ScrollView>
                            <Animated.View className="flex-row items-center px-2 py-2 bg-towaprimary border-0">
                              <View className="flex-1 flex-row items-center bg-towa3 rounded-full px-4 py-2 mr-2">
                                <TextInput
                                    className="flex-1 max-h-12 items-center justify-center"
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="Ask Towa to add tasks, mark them done, or just chat!"
                                    placeholderTextColor="#8e8e93"
                                    multiline
                                    scrollEnabled={true}
                                    editable={!isLoading}
                                    style={{
                                        textAlignVertical: 'center'
                                    }}
                                />
                              </View>
                              <TouchableOpacity 
                                  className="h-8 w-8 rounded-full bg-towasecondary items-center justify-center"
                                  disabled={!message.trim() || isLoading}
                                  onPress={sendMessage}
                              >
                                  <FontAwesome6
                                      name="paper-plane"
                                      size={16}
                                      color={message.trim() && !isLoading ? "white" : "#8e8e93"}
                                      solid
                                  />
                              </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

export default TowaText