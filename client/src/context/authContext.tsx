import { toast } from "@/components/ui/use-toast";
import useToastError from "@/hooks/useToastError";
import axios from "axios";
import { createContext, useEffect, useState, ReactNode } from "react";

export interface User {
   user_id?: number | string;
   username?: string;
   email?: string;
   name?: string;
   bio?: string;
   profilePic?: string;
   coverPic?: string;
}

export interface LoginInterface {
   usernameOrEmail: string;
   password: string;
}

export interface RegisterInterface {
   username: string;
   name: string;
   email: string;
   password: string;
}

export interface UpdateUserInterface {
   username: string | undefined;
   name: string | undefined;
   bio: string | undefined;
   email: string | undefined;
   profilePic?: string | undefined;
   coverPic?: string | undefined;
}

export interface PostInterface {
   post_id: string | number;
   content: string;
   created_at: string;
   username?: string;
   user_id: number | number;
   creatorname?: string;
   user_pfp?: string;
   images?: (string | undefined)[];
   commentsNum: number;
}

export interface AuthContextProps {
   currentUser: User | null;
   setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
   login: (inputs: LoginInterface) => Promise<void>;
   logout: () => Promise<void>;
   register: (inputs: RegisterInterface) => Promise<void>;
   updateUser: (inputs: UpdateUserInterface) => Promise<void>;
   posts: PostInterface[];
   setPosts: React.Dispatch<React.SetStateAction<any>>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthContextProviderProps {
   children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
   const [posts, setPosts] = useState<PostInterface[]>([]);
   const [currentUser, setCurrentUser] = useState<User | null>(JSON.parse(localStorage.getItem("user") || "null"));
   const toastError = useToastError();

   const login = async (inputs: LoginInterface): Promise<void> => {
      try {
         const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, inputs, {
            withCredentials: true,
         });
         const { bio, cover_picture_url, email, name, profile_picture_url, user_id, username } = res.data;
         setCurrentUser({ bio, coverPic: cover_picture_url, email, name, profilePic: profile_picture_url, user_id, username });
      } catch (error) {
         // Handle login error
         toastError(error, "Login error:");
      }
   };

   const logout = async (): Promise<void> => {
      try {
         // Perform logout request to the server
         await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
            withCredentials: true,
         });
         // Set current user to null in context
         setCurrentUser(null);
         toast({
            title: "Successfully logged out!",
         });
      } catch (error: any) {
         toastError(error, "Logout error:");
      }
   };

   const register = async (inputs: RegisterInterface): Promise<void> => {
      console.log(import.meta.env.VITE_API_URL);
      try {
         await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, inputs, {
            withCredentials: true,
         });
         // Automatically log in the user after successful registration
         await login({ usernameOrEmail: inputs.username, password: inputs.password });
      } catch (error) {
         // Handle registration error
         toastError(error, "Registration error:");
      }
   };

   const updateUser = async (updatedUser: UpdateUserInterface): Promise<void> => {
      try {
         // Making the PUT request with the authorization header
         const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/user/${currentUser?.user_id}`, updatedUser, {
            withCredentials: true,
         });
         const { bio, cover_picture_url, email, name, profile_picture_url, user_id, username } = res.data;
         setCurrentUser({ bio, coverPic: cover_picture_url, email, name, profilePic: profile_picture_url, user_id, username });
      } catch (error) {
         throw error;
      }
   };

   useEffect(() => {
      localStorage.setItem("user", JSON.stringify(currentUser));
   }, [currentUser]);

   const contextValue: AuthContextProps = {
      currentUser,
      setCurrentUser,
      login,
      logout,
      register,
      updateUser,
      setPosts,
      posts,
   };

   return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
