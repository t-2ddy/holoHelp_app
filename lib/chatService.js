import { Databases, ID, Query } from 'react-native-appwrite';
import { client, config } from './appwrite';  // Import client and config directly

const databases = new Databases(client);

const MESSAGES_COLLECTION_ID = config.messagesCollectionID;

export const chatService = {
  sendMessage: async (senderId, receiverId, message) => {
    try {
      return await databases.createDocument(
        config.databaseId,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          sender_id: senderId,
          receiver_id: receiverId,
          message,
          created_at: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  getConversation: async (userId, characterId) => {
    try {
      const messages = await databases.listDocuments(
        config.databaseId,
        MESSAGES_COLLECTION_ID,
        [
          Query.or([
            Query.and([
              Query.equal('sender_id', userId),
              Query.equal('receiver_id', characterId)
            ]),
            Query.and([
              Query.equal('sender_id', characterId),
              Query.equal('receiver_id', userId)
            ])
          ]),
          Query.orderAsc('created_at')
        ]
      );
      
      return messages.documents;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  },
  
  getUserConversations: async (userId) => {
    try {
      const allUserMessages = await databases.listDocuments(
        config.databaseId,
        MESSAGES_COLLECTION_ID,
        [
          Query.or([
            Query.equal('sender_id', userId),
            Query.equal('receiver_id', userId)
          ]),
          Query.orderDesc('created_at')
        ]
      );
      
      const conversationPartners = new Map();
      
      allUserMessages.documents.forEach(msg => {
        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        
        if (!conversationPartners.has(partnerId) || 
            new Date(msg.created_at) > new Date(conversationPartners.get(partnerId).created_at)) {
          conversationPartners.set(partnerId, msg);
        }
      });
      
      return Array.from(conversationPartners.values());
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }
};