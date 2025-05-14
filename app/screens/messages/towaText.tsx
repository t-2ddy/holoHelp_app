import { View, Text, Image, ScrollView, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native'
import towaClose from '../../../assets/images/towa_close.jpg'
import { FontAwesome6 } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useState, useEffect, useRef } from 'react'
import TextBubble from '../../components/TextBubble'

import { chatService } from '../../../lib/chatService';
import { useGlobalContext } from '../../../context/GlobalProvider';

// Define message type
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

const TowaText = () => {
    const { user } = useGlobalContext();
    const TOWA_ID = 'towa'; // Character ID for Towa
    
    // Add missing state variables
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
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
            text: 'Welcome! Please log in to see your conversation history.',
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    }, [user]);
    
    const loadConversation = async () => {
      if (!user) return;
      
      try {
        const messages = await chatService.getConversation(user.$id, TOWA_ID);
        
        if (messages && messages.length > 0) {
          const formattedMessages = messages.map(msg => ({
            id: msg.$id,
            text: msg.message,
            isUser: msg.sender_id === user.$id,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          }));
          
          setMessages(formattedMessages);
        } else {
          setMessages([{
            id: 'welcome',
            text: "Hi there! I'm Towa. How can I help you today?",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
        setMessages([{
          id: 'error',
          text: "Sorry, I couldn't load our previous conversations. Let's start a new one!",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };
    
    const sendMessage = async () => {
      if (!message.trim()) return;
      
      const newMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setMessage('');
      
      if (!user) {
        setTimeout(() => {
          const response = {
            id: (Date.now() + 1).toString(),
            text: "You'll need to log in to save our conversation. For now, I can still chat with you!",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prevMessages => [...prevMessages, response]);
        }, 1000);
        
        Keyboard.dismiss();
        return;
      }
      
      try {
        await chatService.sendMessage(user.$id, TOWA_ID, message.trim());
        
        setTimeout(() => {
          const response = {
            id: (Date.now() + 1).toString(),
            text: "I received your message! (This is a placeholder for your Python backend response)",
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          setMessages(prevMessages => [...prevMessages, response]);
          
          chatService.sendMessage(TOWA_ID, user.$id, response.text);
        }, 1000);
        
      } catch (error) {
        console.error('Error sending message:', error);
        
        const errorMsg = {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I couldn't send your message. Please try again.",
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setMessages(prevMessages => [...prevMessages, errorMsg]);
      }
      
      Keyboard.dismiss();
    };
   
    return (
        <KeyboardAvoidingView 
            className='flex-1 bg-towaprimary'
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <SafeAreaView className="flex-1">
                <View className='flex-1'>
                    <View className='flex-row justify-center items-center min-h-20 w-max'>
                        <TouchableOpacity
                            style={{ position: 'absolute', left: 0, padding: 24 }}
                            activeOpacity={.6}
                            onPress={() => router.push('../')}
                            >
                                <FontAwesome6
                                    name="angle-left"
                                    size={26}
                                    color="#ded9f6"
                                    solid={'focused'}
                                />
                        </TouchableOpacity>
                        <View className='justify-center items-center flex-col'>
                            <Image
                                source={towaClose}
                                className='size-20 rounded-full'
                            />
                            <Text
                            style={{ fontFamily: "Sour Gummy Black" }}
                            className='text-xl mt-1'
                            >
                                Towa
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={{ position: 'absolute', right: 0, padding: 24 }}
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
                            </ScrollView>
                            <Animated.View className="flex-row items-center px-2 py-2 bg-towaprimary border-0">
                              <View className="flex-1 flex-row items-center bg-towa3 rounded-full px-4 py-2 mr-2">
                                <TextInput
                                    className="flex-1 max-h-12 items-center justify-center"
                                    value={message}
                                    onChangeText={setMessage}
                                    placeholder="message"
                                    placeholderTextColor="#8e8e93"
                                    multiline
                                    scrollEnabled={true}
                                    style={{
                                        textAlignVertical: 'center'
                                    }}
                                />
                              </View>
                              <TouchableOpacity 
                                  className="h-8 w-8 rounded-full bg-towasecondary items-center justify-center"
                                  disabled={!message.trim()}
                                  onPress={sendMessage}
                              >
                                  <FontAwesome6
                                      name="paper-plane"
                                      size={16}
                                      color={message.trim() ? "white" : "#8e8e93"}
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