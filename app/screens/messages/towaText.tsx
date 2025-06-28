import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native'
import towaClose from '../../../assets/images/towa_close.jpg'
import { FontAwesome6 } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import TextBubble from '../../components/TextBubble'
import TodoPopup from '@/app/components/TodoPopup'

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
    const [showTodoPopup, setShowTodoPopup] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const keyboardAnim = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const textInputRef = useRef<TextInput>(null);
    
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
        textInputRef.current?.blur();
    };
    
    const handleInputFocus = () => {
        setIsFocused(true);
    };
    
    const handleInputBlur = () => {
        setIsFocused(false);
    };
    
    const handleKeyPress = (e: any) => {
        if (Platform.OS === 'web') {
            if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }
    };
    
    const focusInput = () => {
        textInputRef.current?.focus();
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
        
        setTimeout(() => {
            textInputRef.current?.focus();
        }, 100);
        
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
                    <View className='flex-row items-center w-full px-6'>
                        <View className='flex-1 justify-center ml-11 items-center'>
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
                            onPress={() => setShowTodoPopup(true)}
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
                              className="flex-1 px-3 py-2 pb-10"
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
                            
                            <TouchableWithoutFeedback onPress={focusInput}>
                                <Animated.View 
                                    className="px-2 py-2 items-center"
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <TouchableWithoutFeedback onPress={focusInput}>
                                        <View 
                                            className={`flex-1 rounded-full p-1 mx-2 mb-2 transition-all duration-200 ${
                                                isFocused ? 'bg-white shadow-lg' : 'bg-towa3'
                                            }`}
                                            style={{
                                                borderWidth: isFocused ? 2 : 0,
                                                borderColor: isFocused ? '#7c3aed' : 'transparent',
                                                ...(Platform.OS === 'web' && {
                                                    cursor: 'text',
                                                    boxShadow: isFocused ? '0 0 0 3px rgba(124, 58, 237, 0.1)' : 'none'
                                                })
                                            }}
                                        >
                                            <TextInput
                                                ref={textInputRef}
                                                className="w-full px-3"
                                                value={message}
                                                onChangeText={setMessage}
                                                placeholder="txt from here..."
                                                placeholderTextColor="#8e8e93"
                                                multiline
                                                scrollEnabled={true}
                                                editable={!isLoading}
                                                onFocus={handleInputFocus}
                                                onBlur={handleInputBlur}
                                                onKeyPress={handleKeyPress}
                                                returnKeyType="send"
                                                onSubmitEditing={sendMessage}
                                                blurOnSubmit={false}
                                                style={{
                                                    textAlignVertical: 'center',
                                                    maxHeight: 120,
                                                    minHeight: 40,
                                                    fontSize: 16,
                                                    lineHeight: 20,
                                                    color: '#1f2937',
                                                    ...(Platform.OS === 'web' && {
                                                        outline: 'none',
                                                        resize: 'none' as any,
                                                        fontFamily: 'system-ui, -apple-system, sans-serif'
                                                    })
                                                }}
                                            />
                                        </View>
                                    </TouchableWithoutFeedback>
                                    
                                    <TouchableOpacity 
                                        className={`items-center justify-center size-12 rounded-full mr-4 ml-2 mb-2 transition-all duration-200 ${
                                            message.trim() && !isLoading 
                                                ? 'bg-towaprimary shadow-lg scale-105' 
                                                : 'bg-towa3'
                                        }`}
                                        disabled={!message.trim() || isLoading}
                                        onPress={sendMessage}
                                        style={{
                                            ...(Platform.OS === 'web' && {
                                                cursor: message.trim() && !isLoading ? 'pointer' : 'default',
                                                transform: message.trim() && !isLoading ? 'scale(1.05)' : 'scale(1)'
                                            })
                                        }}
                                    >
                                        <FontAwesome6
                                            name="paper-plane"
                                            size={16}
                                            color={message.trim() && !isLoading ? "white" : "#8e8e93"}
                                            solid
                                        />
                                    </TouchableOpacity>
                                </Animated.View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </SafeAreaView>

            <TodoPopup 
                visible={showTodoPopup} 
                onClose={() => setShowTodoPopup(false)} 
            />
        </KeyboardAvoidingView>
    )
}

export default TowaText