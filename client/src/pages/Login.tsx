import style from "../scss/Login.module.scss";
import LoginHeroImage from "../assets/images/login-hero.jpg";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { AuthContext, AuthContextProps, LoginInterface } from "../context/authContext";
import { FormEvent, useContext, useState } from "react";
import PuffLoader from "react-spinners/PuffLoader";
import loginTestAccount from "@/utils/loginTestAccount";
import useToastError from "@/hooks/useToastError";

const Login = () => {
   const authContext = useContext<AuthContextProps | undefined>(AuthContext);
   const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
   const [password, setPassword] = useState<string>("");
   const [loading, setLoading] = useState<boolean>(false);
   const toastError = useToastError();

   const handleLogin = async (e: FormEvent) => {
      e.preventDefault();

      if (loading) return;

      setLoading(true);

      try {
         if (authContext) {
            const inputs: LoginInterface = { usernameOrEmail, password };
            await authContext.login(inputs);
            // Handle successful login, such as redirecting the user
         }
      } catch (error) {
         toastError(error, "Error logging in:");
      } finally {
         setLoading(false);
      }
   };

   const loginToTest = () => {
      setLoading(true);
      try {
         loginTestAccount(authContext || null);
      } catch (error) {
         toastError(error, "Error logging into test account:");
      } finally {
         setLoading(false);
      }
   };

   return (
      <>
         {!loading ? (
            <div className={style.Container}>
               <div className={style.Container__left}>
                  <img src={LoginHeroImage} />
               </div>
               <div className={style.Container__right}>
                  <h1>Login</h1>
                  <p className={style.Container__right__welcome}>Welcome back! Please enter your details.</p>
                  <form className={style.Container__right__form} onSubmit={handleLogin}>
                     <input
                        type="text"
                        placeholder="Username or Email*"
                        minLength={2}
                        value={usernameOrEmail}
                        onChange={(e) => setUsernameOrEmail(e.target.value)}
                     />
                     <input
                        type="password"
                        placeholder="Password*"
                        value={password}
                        minLength={3}
                        onChange={(e) => setPassword(e.target.value)}
                     />
                     <a href="/register" className={style.Container__right__form__forgot}>
                        Forgot Password
                     </a>
                     <button id="login_button" type="submit" className={style.Container__right__form__login}>
                        Log in
                     </button>
                     <Link to="/register">
                        <button id="register_button" className={style.Container__right__form__register}>
                           Register
                        </button>
                     </Link>
                     <p className={style.Container__right__form__or}>or</p>
                     <div className={style.Container__right__form__test_account}>
                        <FaUserCircle size="26" />
                        <button id="test_account" type="button" onClick={() => loginToTest()}>
                           Login with guest account
                        </button>
                     </div>
                     <p className={style.Container__right__form__no_account}>
                        Don't have an account? <a href="">Sign up for free</a>
                     </p>
                  </form>
               </div>
            </div>
         ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
               <PuffLoader color="black" size={80} />
            </div>
         )}
      </>
   );
};
export default Login;
