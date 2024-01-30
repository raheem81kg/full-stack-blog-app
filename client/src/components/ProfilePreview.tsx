import { useContext, useEffect, useState } from "react";
import { AuthContext, User } from "../context/authContext";
import style from "../scss/ProfilePreview.module.scss";
import { IoSettingsSharp } from "react-icons/io5";
import { EditDialog } from "@/components/EditDialog";
import fallBackPfp from "../assets/images/profile-icon.jpeg";
import { Link, useNavigate } from "react-router-dom";
import useToastError from "@/hooks/useToastError";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import defaultBg from "../assets/images/login-hero.jpg";
import { useToast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";

interface ProfileInfoProps {
   profilePage: boolean;
   user: User | null | undefined;
   isProfilePage?: boolean;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profilePage, user, isProfilePage }) => {
   const authContext = useContext(AuthContext);
   const { toast } = useToast();
   const navigate = useNavigate();
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isFollowing, setIsFollowing] = useState<boolean>(false);
   const toastError = useToastError();

   const checkFollowing = async () => {
      if (!authContext || !authContext.currentUser || !user?.user_id) return;
      try {
         const response = await axios.post<{ isFollowing: boolean }>("/api/follow/doesFollow", {
            followerId: authContext.currentUser?.user_id,
            followingId: user?.user_id,
         });
         setIsFollowing(response.data.isFollowing);
      } catch (error) {
         toastError(error, "Error checking following status:");
      }
   };

   useEffect(() => {
      checkFollowing();
   }, [authContext?.currentUser?.user_id, user?.user_id]);

   const handleFollow = async () => {
      if (!authContext || !authContext.currentUser || !user?.user_id) {
         redirectToLoginToast();
         return;
      }
      setIsLoading(true);
      try {
         await axios.post(
            "/api/follow/follow",
            {
               followerId: authContext.currentUser?.user_id,
               followingId: user?.user_id,
            },
            {
               withCredentials: true,
            }
         );
         setIsFollowing(true);
      } catch (error) {
         console.error("Error following user:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleUnfollow = async () => {
      if (!authContext || !authContext.currentUser || !user?.user_id) {
         redirectToLoginToast();
         return;
      }
      setIsLoading(true);
      try {
         await axios.post(
            "/api/follow/unfollow",
            {
               followerId: authContext.currentUser?.user_id,
               followedUserId: user?.user_id,
            },
            {
               withCredentials: true,
            }
         );
         setIsFollowing(false);
      } catch (error) {
         console.error("Error unfollowing user:", error);
      } finally {
         setIsLoading(false);
      }
   };

   function redirectToLoginToast() {
      if (authContext?.currentUser) return;
      toast({
         title: "Not logged in!",
         description: "Please visit the register/login page",
         action: (
            <ToastAction altText="Go to register/login page" onClick={() => navigate("/register")}>
               Register/Login
            </ToastAction>
         ),
      });
   }
   return (
      <div className={style.Container}>
         <div className={style.Container__img_container}>
            <div
               className={`${style.Container__img_container__cover} ${
                  profilePage ? style.Container__img_container__cover__profilePage : ""
               }`}
            >
               <img src={user?.coverPic ? user?.coverPic : defaultBg} alt="" />
            </div>

            <div
               className={
                  profilePage ? style.Container__img_container__profile_pic_profile : style.Container__img_container__profile_pic
               }
            >
               {user?.user_id && user?.profilePic && user?.profilePic?.length > 0 ? (
                  <Link to={`/user/${user?.user_id}`}>
                     <img src={user?.profilePic} alt="profile picture" />
                  </Link>
               ) : (
                  <img src={fallBackPfp} alt="dummy profile picture" />
               )}
            </div>
            <div className={style.Container__img_container__white_bg}></div>
         </div>
         <div className={style.Container__user_details}>
            {user?.user_id ? (
               <Link to={`/user/${user?.user_id}`}>
                  <h2>{user?.name || "no name"}</h2>
               </Link>
            ) : (
               <h2>{user?.name || "no name"}</h2>
            )}

            <p>{user?.bio}</p>
            {!user?.bio && <p>no bio...</p>}
         </div>
         {/* conditionally show settings if user is viewing their own profile or not */}
         {user?.user_id === authContext?.currentUser?.user_id && (
            <div className={style.Container__settings}>
               <IoSettingsSharp />
               <EditDialog />
            </div>
         )}
         {authContext?.currentUser?.user_id !== user?.user_id && isProfilePage && (
            <Button
               size="lg"
               onClick={isFollowing ? handleUnfollow : handleFollow}
               className={`h-8 ${!isFollowing ? "bg-gray-500" : ""} ${style.Container__follow}`}
               disabled={isLoading}
            >
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isFollowing ? "Following" : "Follow"}
            </Button>
         )}
      </div>
   );
};

export default ProfileInfo;
