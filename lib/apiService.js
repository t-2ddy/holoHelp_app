// API service for communicating with the Spring Boot backend
// This would be placed in the lib folder of your project

import axios from 'axios';

// Change this to your actual backend URL (local or production)
const API_BASE_URL = 'http://10.0.2.2:8080/api'; // Uses 10.0.2.2 for Android emulator
// For iOS simulator, you might use 'http://localhost:8080/api'
// For physical devices, use your computer's actual IP address or your deployed backend URL

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chat related API functions
export const chatService = {
  // Send a message to the bot and get a response
  sendMessage: async (userId, message) => {
    try {
      const response = await apiClient.post('/chat/send', {
        userId,
        message
      });
      return response.data.data; // The response from the bot
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (userId, limit = 50) => {
    try {
      const response = await apiClient.get(`/chat/history/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  // Get welcome message
  getWelcomeMessage: async () => {
    try {
      const response = await apiClient.get('/chat/welcome');
      return response.data.data;
    } catch (error) {
      console.error('Error getting welcome message:', error);
      throw error;
    }
  },

  // Get example commands
  getExampleCommands: async () => {
    try {
      const response = await apiClient.get('/chat/examples');
      return response.data.data;
    } catch (error) {
      console.error('Error getting example commands:', error);
      throw error;
    }
  }
};

// Task related API functions
export const taskService = {
  // Get tasks for user
  getTasks: async (userId, limit = 10) => {
    try {
      const response = await apiClient.get(`/tasks/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },

  // Create a new task
  createTask: async (userId, text) => {
    try {
      const response = await apiClient.post('/tasks', {
        userId,
        text
      });
      return response.data.data; // Returns task ID
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  // Mark task as complete
  completeTask: async (taskId) => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

  // Delete a task
  deleteTask: async (taskId) => {
    try {
      const response = await apiClient.delete(`/tasks/${taskId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};

export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data.data;
  } catch (error) {
    console.error('Error with health check:', error);
    throw error;
  }
};