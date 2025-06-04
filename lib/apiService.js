import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export const chatService = {

  sendMessage: async (userId, message) => {
    try {
      const response = await apiClient.post('/chat/send', {
        userId,
        message
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },


  getChatHistory: async (userId, limit = 50) => {
    try {
      const response = await apiClient.get(`/chat/history/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  },

  getWelcomeMessage: async () => {
    try {
      const response = await apiClient.get('/chat/welcome');
      return response.data.data;
    } catch (error) {
      console.error('Error getting welcome message:', error);
      throw error;
    }
  },

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

export const taskService = {
  getTasks: async (userId, limit = 10) => {
    try {
      const response = await apiClient.get(`/tasks/${userId}?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  },

  createTask: async (userId, text) => {
    try {
      const response = await apiClient.post('/tasks', {
        userId,
        text
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  },

  completeTask: async (taskId) => {
    try {
      const response = await apiClient.patch(`/tasks/${taskId}/complete`);
      return response.data.data;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },

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