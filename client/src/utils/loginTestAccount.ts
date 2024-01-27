import { AuthContextProps, LoginInterface } from "../context/authContext";

const loginTestAccount = (authContext: AuthContextProps | null) => {
   // {
   //     usernameOrEmail: test_account47;
   //     password: test_account47;
   //     newPassword: password123
   // }

   const testCred: LoginInterface = { usernameOrEmail: "test_account47", password: "password123" };
   authContext?.login(testCred);
};

export default loginTestAccount;
