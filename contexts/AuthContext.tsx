import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// Web fallback for SecureStore
const webStorage = {
  async getItem(key: string) {
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string) {
    return localStorage.setItem(key, value);
  },
  async deleteItem(key: string) {
    return localStorage.removeItem(key);
  },
};

// Use SecureStore for mobile, localStorage for web
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

type User = {
  id: string;
  name: string;
  email: string;
  pilotLicense: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, pilotLicense: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const token = await storage.getItem('token');
        const userJSON = await storage.getItem('user');
        
        if (token && userJSON) {
          // Set axios default header
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUser(JSON.parse(userJSON));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;

      // Save auth data
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string, pilotLicense: string) {
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        pilotLicense
      });

      const { token, user } = response.data;

      // Save auth data
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user));

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);

    try {
      // Clear stored data
      await storage.deleteItem('token');
      await storage.deleteItem('user');

      // Clear axios header
      delete axios.defaults.headers.common['Authorization'];

      setUser(null);
      
      // Redirect to login screen
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Logout failed');
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import * as SecureStore from 'expo-secure-store';
// import axios from 'axios';
// import Constants from 'expo-constants';
// import { Platform } from 'react-native';

// const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api';

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   pilotLicense: string;
// };

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (name: string, email: string, password: string, pilotLicense: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// type AuthProviderProps = {
//   children: ReactNode;
// };

// // Cross-platform storage helpers
// const storage = {
//   async setItem(key: string, value: string) {
//     if (Platform.OS === 'web') {
//       localStorage.setItem(key, value);
//     } else {
//       await SecureStore.setItemAsync(key, value);
//     }
//   },

//   async getItem(key: string): Promise<string | null> {
//     if (Platform.OS === 'web') {
//       return localStorage.getItem(key);
//     } else {
//       return await SecureStore.getItemAsync(key);
//     }
//   },

//   async deleteItem(key: string) {
//     if (Platform.OS === 'web') {
//       localStorage.removeItem(key);
//     } else {
//       await SecureStore.deleteItemAsync(key);
//     }
//   }
// };

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadUserFromStorage() {
//       try {
//         const token = await storage.getItem('token');
//         const userJSON = await storage.getItem('user');

//         if (token && userJSON) {
//           axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//           setUser(JSON.parse(userJSON));
//         }
//       } catch (error) {
//         console.error('Failed to load user data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadUserFromStorage();
//   }, []);

//   async function login(email: string, password: string) {
//     setLoading(true);

//     try {
//       const response = await axios.post(`${API_URL}/auth/login`, {
//         email,
//         password
//       });

//       const { token, user } = response.data;

//       await storage.setItem('token', token);
//       await storage.setItem('user', JSON.stringify(user));

//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setUser(user);
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw new Error('Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function register(name: string, email: string, password: string, pilotLicense: string) {
//     setLoading(true);

//     try {
//       const response = await axios.post(`${API_URL}/auth/register`, {
//         name,
//         email,
//         password,
//         pilotLicense
//       });

//       const { token, user } = response.data;

//       await storage.setItem('token', token);
//       await storage.setItem('user', JSON.stringify(user));

//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//       setUser(user);
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw new Error('Registration failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function logout() {
//     setLoading(true);

//     try {
//       await storage.deleteItem('token');
//       await storage.deleteItem('user');

//       delete axios.defaults.headers.common['Authorization'];
//       setUser(null);
//     } catch (error) {
//       console.error('Logout failed:', error);
//       throw new Error('Logout failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   const value = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }




// // contexts/AuthContext.tsx

// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import * as SecureStore from 'expo-secure-store';

// type User = {
//   id: string;
//   name: string;
//   email: string;
//   pilotLicense: string;
// };

// type AuthContextType = {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (name: string, email: string, password: string, pilotLicense: string) => Promise<void>;
//   logout: () => Promise<void>;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// type AuthProviderProps = {
//   children: ReactNode;
// };

// export function AuthProvider({ children }: AuthProviderProps) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadUserFromStorage() {
//       try {
//         const userJSON = await SecureStore.getItemAsync('user');
//         if (userJSON) {
//           setUser(JSON.parse(userJSON));
//         }
//       } catch (error) {
//         console.error('Failed to load user data:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadUserFromStorage();
//   }, []);

//   async function login(email: string, password: string) {
//     setLoading(true);

//     try {
//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // In a real app, this would be an API call to authenticate
//       // For demo purposes, we'll create a mock user
//       const mockUser = {
//         id: '1',
//         name: 'John Doe',
//         email,
//         pilotLicense: 'P12345',
//       };

//       // Save user to secure storage
//       await SecureStore.setItemAsync('user', JSON.stringify(mockUser));
//       setUser(mockUser);
//     } catch (error) {
//       console.error('Login failed:', error);
//       throw new Error('Login failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function register(name: string, email: string, password: string, pilotLicense: string) {
//     setLoading(true);

//     try {
//       // Simulate API call delay
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       // In a real app, this would be an API call to register
//       const newUser = {
//         id: Date.now().toString(),
//         name,
//         email,
//         pilotLicense,
//       };

//       // Save user to secure storage
//       await SecureStore.setItemAsync('user', JSON.stringify(newUser));
//       setUser(newUser);
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw new Error('Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function logout() {
//     setLoading(true);

//     try {
//       await SecureStore.deleteItemAsync('user');
//       setUser(null);
//     } catch (error) {
//       console.error('Logout failed:', error);
//       throw new Error('Logout failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   const value = {
//     user,
//     loading,
//     login,
//     register,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }