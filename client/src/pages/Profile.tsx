import { useContext, useEffect, useState } from "react";
import ProfilePreview from "../components/ProfilePreview";
import style from "../scss/Profile.module.scss";
import { AuthContext, User } from "../context/authContext";
import Post from "../components/Post";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import PuffLoader from "react-spinners/PuffLoader";
import useToastError from "@/hooks/useToastError";

const Home: React.FC = () => {
   const { id } = useParams();
   const toastError = useToastError();
   const navigate = useNavigate();
   const authContext = useContext(AuthContext);
   const [firstLoading, setFirstLoading] = useState<boolean>(true);
   const [user, setUser] = useState<User>({
      user_id: 1,
      username: "",
      name: "",
      bio: "",
      profilePic: "",
      coverPic: "",
   });

   const fetchUserProfile = async () => {
      try {
         const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/${id}`);
         const userProfile = response.data;
         setUser(userProfile);
      } catch (error) {
         navigate("/NotFound");
         toastError(error, "Fetch user profile error:");
      }
   };

   const fetchPosts = async () => {
      try {
         const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/post/getPostsByUser?targetUserId=${id}`);
         const newPosts = response.data.posts;
         if (newPosts) authContext?.setPosts(newPosts);
      } catch (error) {
         toastError(error, "Fetch posts error:");
      } finally {
         setFirstLoading(false);
      }
   };

   useEffect(() => {
      fetchUserProfile();
      fetchPosts();
   }, [id]);

   return (
      <>
         {!firstLoading ? (
            <div className={style.Container}>
               <div>
                  <ProfilePreview profilePage={true} user={user} isProfilePage={true} />
               </div>
               <h1 className={style.Container__title}>Feed</h1>
               <div className={style.Container__feed}>
                  {authContext?.posts.map((post, index) => {
                     return <Post key={index} post={post} isProfilePage={true} />;
                  })}
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

export default Home;
