import { Client, Account, Databases, Query } from 'react-native-appwrite';
import { ID } from 'react-native-appwrite';

export const config = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionID: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    todoId: process.env.EXPO_PUBLIC_APPWRITE_TODO_ID,
    storageID: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID,
    messagesCollectionID: process.env.EXPO_PUBLIC_APPWRITE_MESSAGES_COLLECTION_ID,
    youtubeShortsCollectionID: process.env.EXPO_PUBLIC_YOUTUBE_SHORTS_COLLECTION_ID || '6859c0b9002d3cb101f5'
}

const client = new Client();
client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)
;

export { client };

const account = new Account(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )
        
        if(!newAccount) throw new Error("Account creation failed");
        
        await signIn(email, password);
        
        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionID,
            ID.unique(),
            {
                email,
                username
            }
        )
        
        console.log("User created successfully:", newUser);
        return newUser;
    } catch (error) {
        console.error("Error in createUser:", error);
        throw new Error(error.message || "Failed to create user");
    }
}

export const signIn = async(email, password) =>{
    try {
        const session = await account.createEmailPasswordSession(email, password)
        return session;
    } catch (error) {
        console.error("Error in signIn:", error);
        throw new Error(error.message || "Failed to sign in");
    }
}

export const getCurrentUser = async () => {
    try{
        const currentAccount = await account.get();

        if(!currentAccount) throw new Error("No current account found");

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userCollectionID,
            [Query.equal('accountId', currentAccount.$id)]
        );

        if(!currentUser || currentUser.documents.length === 0) 
            return null;

        console.log("Current user found:", currentUser.documents[0]);
        return currentUser.documents[0];
    } catch (error){
        console.log("Error getting current user:", error);
        return null;
    }
}