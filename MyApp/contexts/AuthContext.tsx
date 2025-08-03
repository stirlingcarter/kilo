import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  phoneNumber: string;
  // Add other user properties here as needed
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadAuthData = async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      const storedUser = await SecureStore.getItemAsync('user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    };
    loadAuthData();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await SecureStore.setItemAsync('userToken', newToken);
    await SecureStore.setItemAsync('user', JSON.stringify(newUser));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('user');
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 