import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Modal, Animated } from 'react-native';
import { client, config } from '../../lib/appwrite';
import { Databases, ID, Query } from 'react-native-appwrite';
import { getCurrentUser } from '../../lib/appwrite';
import { FontAwesome6 } from '@expo/vector-icons';

const databases = new Databases(client);

interface TodoPopupProps {
  visible: boolean;
  onClose: () => void;
}

const TodoPopup: React.FC<TodoPopupProps> = ({ visible, onClose }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(300));

  useEffect(() => {
    if (visible) {
      fetchUser();
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const fetchUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      if (user) {
        fetchTasks(user.accountId);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchTasks = async (accountId: string) => {
    try {
      setIsLoading(true);
      
      const response = await databases.listDocuments(
        config.databaseId,
        config.todoId,
        [Query.equal('sender_id', accountId)]
      );
      
      setTasks(response.documents);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Failed to load your tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.trim() && currentUser) {
      try {
        setIsLoading(true);
        
        const newTaskData = {
          task: newTask.trim(),
          created_at: new Date().toISOString(),
          status: 'pending',
          sender_id: currentUser.accountId
        };
        
        await databases.createDocument(
          config.databaseId,
          config.todoId,
          ID.unique(),
          newTaskData
        );
        
        setNewTask('');
        fetchTasks(currentUser.accountId);
      } catch (error) {
        console.error('Error adding task:', error);
        Alert.alert('Error', 'Failed to add task');
        setIsLoading(false);
      }
    } else if (!currentUser) {
      Alert.alert('Error', 'Please sign in to add tasks');
    } else {
      Alert.alert('Error', 'Task cannot be empty');
    }
  };

  const removeTask = async (documentId: string) => {
    try {
      setIsLoading(true);
      await databases.deleteDocument(
        config.databaseId,
        config.todoId,
        documentId
      );
      fetchTasks(currentUser.accountId);
    } catch (error) {
      console.error('Error removing task:', error);
      Alert.alert('Error', 'Failed to delete task');
      setIsLoading(false);
    }
  };

  const toggleStatus = async (documentId: string, currentStatus: string) => {
    try {
      setIsLoading(true);
      await databases.updateDocument(
        config.databaseId,
        config.todoId,
        documentId,
        {
          status: currentStatus === 'pending' ? 'completed' : 'pending'
        }
      );
      fetchTasks(currentUser.accountId);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update task status');
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="flex-row justify-between items-center bg-towaprimary p-3 rounded-xl mb-2">
      <TouchableOpacity 
        onPress={() => toggleStatus(item.$id, item.status)}
        className="flex-row items-center flex-1 mr-2"
      >
        <View className={`w-5 h-5 mr-2 rounded-full border-2 border-stone-800 ${item.status === 'completed' ? 'bg-towagreen' : 'bg-transparent'} justify-center items-center`}>
          {item.status === 'completed' && (
            <FontAwesome6 name="check" size={10} color="#2d3748" />
          )}
        </View>
        <Text 
          className={`text-stone-800 text-base flex-1 ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}
          style={{ fontFamily: "Sour Gummy Black" }}
          numberOfLines={2}
        >
          {item.task}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => removeTask(item.$id)} className="bg-red-500 w-7 h-7 rounded-full justify-center items-center">
        <FontAwesome6 name="trash" size={12} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View 
          className="bg-towasecondary rounded-2xl m-4 max-h-[80%] w-[90%]"
          style={{
            transform: [{ translateY: slideAnim }]
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-4">
                <Text 
                  className="text-2xl text-stone-800"
                  style={{ fontFamily: "Sour Gummy Black" }}
                >
                  Tasks
                </Text>
                <TouchableOpacity onPress={onClose} className="p-2">
                  <FontAwesome6 name="xmark" size={20} color="#2d3748" />
                </TouchableOpacity>
              </View>

              <View className="flex-row mb-4">
                <TextInput
                  className="flex-1 bg-towa3 mr-2 px-3 py-2 rounded-xl text-stone-800"
                  value={newTask}
                  onChangeText={setNewTask}
                  placeholder="Add a new task"
                  placeholderTextColor="#6B7280"
                  style={{ fontFamily: "Sour Gummy Black" }}
                  multiline
                />
                <TouchableOpacity 
                  onPress={addTask} 
                  className="bg-towagreen px-3 rounded-xl justify-center items-center"
                  disabled={isLoading || !newTask.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-stone-800" style={{ fontFamily: "Sour Gummy Black" }}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View className="max-h-96">
                {tasks.length > 0 ? (
                  <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.$id}
                    showsVerticalScrollIndicator={false}
                  />
                ) : (
                  <View className="justify-center items-center py-8">
                    <Text 
                      className="text-lg text-stone-800 text-center" 
                      style={{ fontFamily: "Sour Gummy Black" }}
                    >
                      No tasks yet. Add one to get started!
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default TodoPopup;