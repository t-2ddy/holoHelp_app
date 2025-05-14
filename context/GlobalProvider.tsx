import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUser } from "@/lib/appwrite";

// Define the User interface
interface User {
  $id: string;
  email?: string;
  name?: string;
}

// Define the type for your context value
interface GlobalContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

// Create the context with a default value to avoid null checks
const GlobalContext = createContext<GlobalContextType>({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  isLoading: true
});

export const useGlobalContext = () => useContext(GlobalContext);

// Define props type for the provider component
interface GlobalProviderProps {
  children: ReactNode;
}

const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check authentication state when component mounts
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log("Current user check:", currentUser);
       
        if (currentUser) {
          setIsLoggedIn(true);
          setUser(currentUser as User);
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsLoggedIn(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);
  
  const value = {
    isLoggedIn,
    setIsLoggedIn,
    user,
    setUser,
    isLoading
  };
  
  console.log("GlobalProvider state:", { isLoggedIn, isLoading });
  
  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;