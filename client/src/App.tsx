import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import "./scss/App.scss";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Profile from "./pages/Profile.tsx";
import SinglePost from "./pages/SinglePost.tsx";
import Notfound from "./pages/NotFound.tsx";
import { AuthContext, AuthContextProps } from "./context/authContext.tsx";
import { ComponentType, useContext } from "react";

// Don't allow logged in users access to login/register page
interface RedirectIfLoggedInProps {
   element: ComponentType<any>;
}

const RedirectIfLoggedIn: React.FC<RedirectIfLoggedInProps> = ({ element: Element }) => {
   const currentUser = useContext<AuthContextProps | undefined>(AuthContext)?.currentUser;

   return currentUser ? <Navigate to="/" /> : <Element />;
};

const Layout = () => {
   return (
      <>
         <Navbar />
         <Outlet />
         <Footer />
      </>
   );
};

const router = createBrowserRouter([
   {
      path: "/",
      element: <Layout />,
      children: [
         {
            path: "/",
            element: <Home />,
         },
         {
            path: "/user/:id",
            element: <Profile />,
         },
         {
            path: "/post/:id",
            element: <SinglePost />,
         },
         {
            path: "/login",
            element: <RedirectIfLoggedIn element={Login} />,
         },
         {
            path: "/register",
            element: <RedirectIfLoggedIn element={Register} />,
         },
         {
            path: "*",
            element: <Notfound />,
         },
      ],
   },
]);

function App() {
   return <RouterProvider router={router} />;
}

export default App;
