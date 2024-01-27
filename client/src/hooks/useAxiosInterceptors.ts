import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import useToastError from "./useToastError";
import { useContext } from "react";
import { AuthContext } from "@/context/authContext";

// used in Footer since it's mounted everywhere
const useAxiosInterceptors = () => {
   const toastError = useToastError();
   const navigate = useNavigate();
   const authContext = useContext(AuthContext);

   const interceptor = () =>
      axios.interceptors.response.use(
         (response) => response,
         async (error: AxiosError) => {
            // Check if the error is due to unauthorized access (401)
            if (error.response && error.response.status === 401) {
               // intercept axios request and remove logout user if there is no token in the cookie
               await authContext?.logout();
               navigate("/register");
               toastError(error, "Token expired, please login again", false);
            }

            // Propagate the error to the catch block
            return Promise.reject(error);
         }
      );

   // Return a cleanup function
   return interceptor;
};

export default useAxiosInterceptors;
