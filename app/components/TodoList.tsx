import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { client, config } from '../../lib/appwrite';
import { Databases, ID, Query } from 'react-native-appwrite';
import { getCurrentUser } from '../../lib/appwrite';
import { FontAwesome6 } from '@expo/vector-icons';

const databases = new Databases(client);

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        console.log("Current user in TodoList:", user);
        setCurrentUser(user);
        if (user) {
          fetchTasks(user.accountId);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const fetchTasks = async (accountId: string) => {
    try {
      setIsLoading(true);
      console.log("Fetching tasks for account ID:", accountId);
      
      const response = await databases.listDocuments(
        config.databaseId,
        config.todoId,
        [Query.equal('sender_id', accountId)]
      );
      
      console.log(`Found ${response.documents.length} tasks for this user`);
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
        
        console.log("Creating new task with data:", JSON.stringify(newTaskData));
        
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
    <View className="flex-row justify-between items-center bg-towaprimary p-4 rounded-xl mb-3">
      <TouchableOpacity 
        onPress={() => toggleStatus(item.$id, item.status)}
        className="flex-row items-center flex-1 mr-2"
      >
        <View className={`w-6 h-6 mr-3 rounded-full border-2 border-stone-800 ${item.status === 'completed' ? 'bg-towagreen' : 'bg-transparent'} justify-center items-center`}>
          {item.status === 'completed' && (
            <FontAwesome6 name="check" size={12} color="#2d3748" />
          )}
        </View>
        <Text 
          className={`text-stone-800 text-lg flex-1 ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}
          style={{ fontFamily: "Sour Gummy Black" }}
        >
          {item.task}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => removeTask(item.$id)} className="bg-red-500 w-8 h-8 rounded-full justify-center items-center">
        <FontAwesome6 name="trash" size={14} color="white" />
      </TouchableOpacity>
    </View>
  );
  
  const renderEmptyList = () => (
    <View className="flex-1 justify-center items-center">
      <Text className="text-xl text-stone-800 text-center" style={{ fontFamily: "Sour Gummy Black" }}>
        No tasks yet. Add one to get started!
      </Text>
    </View>
  );

  if (isLoading && !tasks.length) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#8058ac" />
        <Text className="mt-4 text-stone-800" style={{ fontFamily: "Sour Gummy Black" }}>Loading tasks...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 bg-towasecondary mr-2 px-4 py-3 rounded-xl text-stone-800 text-lg"
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Add a new task"
          placeholderTextColor="#6B7280"
          style={{ fontFamily: "Sour Gummy Black" }}
        />
        <TouchableOpacity 
          onPress={addTask} 
          className="bg-towagreen px-4 rounded-xl justify-center items-center"
          disabled={isLoading || !newTask.trim()}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-stone-800 text-lg" style={{ fontFamily: "Sour Gummy Black" }}>Add</Text>
          )}
        </TouchableOpacity>
      </View>
  
      <View 
        className="flex-1" 
        style={{ paddingTop: 24, paddingBottom: 24 }}
      >
        {tasks.length > 0 ? (
          tasks.map(item => (
            <View key={item.$id} className="flex-row justify-between items-center bg-towaprimary p-4 rounded-xl mb-3">
              <TouchableOpacity 
                onPress={() => toggleStatus(item.$id, item.status)}
                className="flex-row items-center flex-1 mr-2"
              >
                <View className={`w-6 h-6 mr-3 rounded-full border-2 border-stone-800 ${item.status === 'completed' ? 'bg-towagreen' : 'bg-transparent'} justify-center items-center`}>
                  {item.status === 'completed' && (
                    <FontAwesome6 name="check" size={12} color="#2d3748" />
                  )}
                </View>
                <Text 
                  className={`text-stone-800 text-lg flex-1 ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}
                  style={{ fontFamily: "Sour Gummy Black" }}
                >
                  {item.task}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => removeTask(item.$id)} className="bg-red-500 w-8 h-8 rounded-full justify-center items-center">
                <FontAwesome6 name="trash" size={14} color="white" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="flex-1 justify-center items-center">
            <Text className="text-xl text-stone-800 text-center" style={{ fontFamily: "Sour Gummy Black" }}>
              No tasks yet. Add one to get started!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default TodoList;