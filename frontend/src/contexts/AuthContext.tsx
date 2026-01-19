import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import API from "../services/APIService";
// import axios from "axios";

export type User = {
  id: string;
  username?: string;
  email?: string;
  role?: "admin" | "user" | "viewer"
};

type AuthContextValue = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<User>;
  // register: (username: string, password: string, role?: User["role"]) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
      // Optionally verify token with backend
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (token: string) => {
    try {
      const response = await API.get('/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(response)
      setUser({id: response.data.dni})
    } catch (error) {
      // Token invalid, clear it
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (password: string, username: string): Promise<User> => {
    try {
      const response = await API.post('/auth/login', { dni: username, password })
      const { access_token } = response.data

      if (!access_token) {
        throw new Error('Invalid response from server')
      }

      setToken(access_token)
      setIsLoading(false)
      setUser({id: username})
      localStorage.setItem('token', access_token)
      return access_token // Return the user object
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}