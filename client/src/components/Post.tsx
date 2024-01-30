import style from "../scss/Post.module.scss";
import clickIcon from "../assets/icons/arrowupright.svg";
import likeIcon from "../assets/icons/like.svg";
import likedIcon from "../assets/icons/liked.svg";
import commentIcon from "../assets/icons/comment.svg";
import timeAgo from "@/utils/timeAgo";
import fallBackPfp from "../assets/images/profile-icon.jpeg";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, PostInterface } from "@/context/authContext";
import { Button } from "./ui/button";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { ToggleInfoInterface } from "@/pages/Home";
import getInitialsFromString from "@/utils/getInitialsFromString";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import useToastError from "@/hooks/useToastError";
import { toast } from "./ui/use-toast";
import { ToastAction } from "./ui/toast";
import DeletePostDialog from "./DeletePostDialog";

interface PostProps {
   post: PostInterface; // Define the prop 'post' with the type PostInterface
   toggleInfo?: ToggleInfoInterface | null;
   setToggleInfo?: React.Dispatch<React.SetStateAction<ToggleInfoInterface | undefined | null>>;
   postIdex?: number | string; // helps with syncing following a user using their post with all other posts
   isProfilePage?: boolean;
}

const Post: React.FC<PostProps> = ({ post, toggleInfo, setToggleInfo, postIdex, isProfilePage }) => {
   const authContext = useContext(AuthContext);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [isFollowing, setIsFollowing] = useState<boolean>(false);
   const [likesCount, setLikesCount] = useState<number>();
   const [isLiked, setIsLiked] = useState<boolean>(false);
   const navigate = useNavigate();
   const toastError = useToastError();

   // all in the name of changing the follow/following button in unison when the user is followed/unfollowed
   useEffect(() => {
      // if no data for toggling post, return
      if (!toggleInfo || !toggleInfo.clickedPostIdex || !toggleInfo.userIdOnPost) return;
      const handleFollowingToggle = () => {
         // if this index is equal to the clicked post's index or the user id is not equal to the follow/unfollowed user, return
         if (toggleInfo.clickedPostIdex == postIdex || post.user_id !== toggleInfo.userIdOnPost) return;
         checkFollowing();
      };
      handleFollowingToggle();
   }, [toggleInfo, toggleInfo?.clickedPostIdex]);

   const getLikesCountByPostId = async () => {
      try {
         const response = await axios.get(`/api/like/getLikes?postId=${post.post_id}`);
         const likesCount = response.data.likesCount || 0;
         setLikesCount(likesCount);
      } catch (error) {
         toastError(error, "Error fetching likes count:");
      }
   };

   const checkIfUserLikedPost = async () => {
      if (!authContext || !authContext.currentUser) return;
      try {
         const response = await axios.post(
            "/api/like/checkIfLiked",
            {
               userId: authContext.currentUser?.user_id,
               postId: post.post_id,
            },
            {
               withCredentials: true,
            }
         );
         if (response.data.isLiked) {
            setIsLiked(true);
         } else {
            setIsLiked(false);
         }
      } catch (error) {
         toastError(error, "Error checking if user liked post:");
      }
   };

   const handleLike = async () => {
      if (!authContext || !authContext.currentUser) {
         redirectToLoginToast();
         return;
      }
      try {
         // If not liked, make a request to like the post
         await axios
            .post(
               "/api/like/likePost",
               {
                  userId: authContext.currentUser?.user_id,
                  postId: post.post_id,
               },
               {
                  withCredentials: true,
               }
            )
            .then(() => setIsLiked(true));
      } catch (error) {
         toastError(error, "Error liking post:");
      }
   };

   const handleUnlike = async () => {
      if (!authContext || !authContext.currentUser) {
         redirectToLoginToast();
         return;
      }
      try {
         // If liked, make a request to unlike the post
         await axios
            .post(
               "/api/like/unlikePost",
               {
                  userId: authContext.currentUser?.user_id,
                  postId: post.post_id,
               },
               {
                  withCredentials: true,
               }
            )
            .then(() => setIsLiked(false));
      } catch (error) {
         toastError(error, "Error unliking post:");
      }
   };

   const checkFollowing = async () => {
      if (!authContext || !authContext.currentUser) return;
      try {
         const response = await axios.post<{ isFollowing: boolean }>("/api/follow/doesFollow", {
            followerId: authContext.currentUser?.user_id,
            followingId: post.user_id,
         });
         setIsFollowing(response.data.isFollowing);
      } catch (error) {
         toastError(error, "Error checking following status:");
      }
   };

   useEffect(() => {
      getLikesCountByPostId();
   }, [likesCount, isLiked, post]);

   useEffect(() => {
      checkIfUserLikedPost();
      checkFollowing();
   }, [authContext?.currentUser?.user_id, post.user_id, post.post_id]);

   const handleFollow = async () => {
      if (!authContext || !authContext.currentUser) {
         redirectToLoginToast();
         return;
      }
      setIsLoading(true);
      try {
         await axios.post(
            "/api/follow/follow",
            {
               followerId: authContext.currentUser?.user_id,
               followingId: post.user_id,
            },
            {
               withCredentials: true,
            }
         );
         postIdex && setToggleInfo && setToggleInfo({ userIdOnPost: post.user_id, clickedPostIdex: postIdex });
         setIsFollowing(true);
      } catch (error) {
         console.error("Error following user:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleUnfollow = async () => {
      if (!authContext || !authContext.currentUser) {
         redirectToLoginToast();
         return;
      }
      setIsLoading(true);
      try {
         await axios.post(
            "/api/follow/unfollow",
            {
               followerId: authContext.currentUser?.user_id,
               followedUserId: post.user_id,
            },
            {
               withCredentials: true,
            }
         );
         postIdex && setToggleInfo && setToggleInfo({ userIdOnPost: post.user_id, clickedPostIdex: postIdex });
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
         <div className={style.Container__left}>
            <Link to={`/user/${post.user_id}`}>
               <Avatar className="relative flex h-full rounded-full">
                  <AvatarImage src={post?.user_pfp ? post.user_pfp : fallBackPfp} />
                  <AvatarFallback>
                     {authContext?.currentUser?.username && getInitialsFromString(authContext?.currentUser?.username)}
                  </AvatarFallback>
               </Avatar>
            </Link>
         </div>
         <div className={style.Container__middle}>
            <div className={style.Container__middle__top}>
               <p>
                  <Link to={`/user/${post.user_id}`} className={style.Container__middle__top__creator_name}>
                     {(post.creatorname || "no name") + " "}
                  </Link>
                  <span className={style.Container__middle__top__at_and_time}>
                     @{post.username} - {post.created_at && timeAgo(post.created_at)}
                  </span>
               </p>
               {/* don't show the user a follow button for their own page */}
               {authContext?.currentUser?.user_id !== post.user_id && !isProfilePage && (
                  <Button
                     onClick={isFollowing ? handleUnfollow : handleFollow}
                     className={`h-6 sm:h-8 ${!isFollowing ? "bg-gray-500" : ""}`}
                     disabled={isLoading}
                  >
                     {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                     {isFollowing ? "Following" : "Follow"}
                  </Button>
               )}
               {authContext?.currentUser?.user_id === post.user_id && (
                  <DeletePostDialog post_id={post.post_id}>
                     <svg
                        stroke="currentColor"
                        fill="currentColor"
                        strokeWidth="0"
                        viewBox="0 0 24 24"
                        className="cursor-pointer"
                        height="21"
                        width="21"
                        xmlns="http://www.w3.org/2000/svg"
                     >
                        <path d="M17 4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7V2H17V4ZM9 9V17H11V9H9ZM13 9V17H15V9H13Z"></path>
                     </svg>
                  </DeletePostDialog>
               )}
            </div>

            <p>{post.content}</p>

            {/* conditionally show image */}
            {post.images && post?.images.length > 0 && <img src={post.images[0]} alt="" />}

            <div className={style.Container__middle__bottom}>
               <div>
                  <img
                     className={style.Container__middle__bottom__icon}
                     src={isLiked && likesCount && likesCount > 0 ? likedIcon : likeIcon}
                     alt="Like Icon"
                     onClick={isLiked && likesCount && likesCount > 0 ? handleUnlike : handleLike}
                  />
                  {likesCount}
               </div>
               <Link to={`/post/${post.post_id}`}>
                  <img className={style.Container__middle__bottom__icon} src={commentIcon} /> {post.commentsNum}
               </Link>
            </div>
         </div>
         <Link to={`/post/${post.post_id}`}>
            <img src={clickIcon} alt="" />
         </Link>
      </div>
   );
};

export default Post;
