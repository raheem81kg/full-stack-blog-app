import style from "../scss/Login.module.scss";
import LoginHeroImage from "../assets/images/login-hero.jpg";
import { FaUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext, AuthContextProps, RegisterInterface } from "../context/authContext";
import PuffLoader from "react-spinners/PuffLoader";
import loginTestAccount from "@/utils/loginTestAccount";
import useToastError from "@/hooks/useToastError";

const Register = () => {
   const authContext = useContext<AuthContextProps | undefined>(AuthContext);
   const toastError = useToastError();
   const [inputs, setInputs] = useState({
      username: "",
      name: "",
      email: "",
      password: "",
   });
   const [loading, setLoading] = useState<boolean>(false);

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
   };

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (loading) return;
      if (!inputs.username || !inputs.password) return;

      setLoading(true);

      try {
         if (authContext) {
            const registerInputs: RegisterInterface = {
               username: inputs.username,
               name: inputs.name,
               email: inputs.email,
               password: inputs.password,
            };
            // register
            authContext?.register(registerInputs);
         }
      } catch (error) {
         toastError(error, "Error registering:");
      }
      setLoading(false);
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
                  <img src={LoginHeroImage} alt="Login Hero" />
               </div>
               <div className={style.Container__right}>
                  <h1>Create a new account</h1>
                  <p className={style.Container__right__welcome}>Let's get started with your blog.</p>
                  <form className={style.Container__right__form} onSubmit={handleSubmit}>
                     <input
                        id="username"
                        placeholder="Username*"
                        type="text"
                        name="username"
                        minLength={2}
                        required
                        onChange={handleChange}
                     />
                     <input id="name" placeholder="Name*" type="text" name="name" required minLength={2} onChange={handleChange} />
                     <input id="email" placeholder="Email" type="email" name="email" minLength={3} onChange={handleChange} />
                     <input
                        id="password"
                        placeholder="Password*"
                        type="password"
                        name="password"
                        required
                        minLength={3}
                        onChange={handleChange}
                     />
                     <br />
                     <button id="login_button" type="submit" className={style.Container__right__form__login}>
                        Create account
                     </button>
                     <p className={style.Container__right__form__or}>or</p>
                     <div className={style.Container__right__form__test_account}>
                        <FaUserCircle size="26" />
                        <button id="test_account" type="button" onClick={() => loginToTest()}>
                           Login with guest account
                        </button>
                     </div>
                     <p className={style.Container__right__form__no_account}>
                        Already have an account? <Link to="/login">Login</Link>
                     </p>
                  </form>
               </div>
            </div>
         ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
               <PuffLoader color="black" size={80} />
            </div>
         )}{" "}
      </>
   );
};

export default Register;
