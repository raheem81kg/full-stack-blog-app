import style from "../scss/SinglePost.module.scss";
import likeIcon from "../assets/icons/like.svg";
import likedIcon from "../assets/icons/liked.svg";
import commentIcon from "../assets/icons/comment.svg";
import { FormEvent, useContext, useEffect, useState } from "react";
import CarouselDemo from "../components/CarouselDemo";
import Comment from "@/components/Comment";
import fallBackPfp from "../assets/images/profile-icon.jpeg";
import timeAgo from "@/utils/timeAgo";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AuthContext, PostInterface } from "@/context/authContext";
import getInitialsFromString from "@/utils/getInitialsFromString";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";

export interface Commenter {
   user_id?: number | string;
   username?: string;
   name?: string;
   user_pfp?: string;
}

export interface CommentInterface {
   comment_id?: string | number;
   post_id?: string | number;
   user_id: number;
   content: string;
   created_at: string | number;
   commenter: Commenter;
}

const SinglePost = () => {
   const authContext = useContext(AuthContext);
   const navigate = useNavigate();
   const [comments, setComments] = useState<CommentInterface[]>([]);
   const [post, setPost] = useState<PostInterface>();
   const { id } = useParams();
   const [likesCount, setLikesCount] = useState<number>();
   const [isLiked, setIsLiked] = useState<boolean>();
   const [newComment, setNewComment] = useState<string>();

   useEffect(() => {
      const fetchPost = async () => {
         try {
            const response = await axios.get(`/api/post/${id}`);
            setPost(response.data.post);
         } catch (error) {
            navigate("/NotFound");
            console.error("Fetch posts error:", error);
         }
      };
      fetchPost(); // Moved this inside useEffect
   }, [id]);

   useEffect(() => {
      const getCommentsForPost = async () => {
         try {
            const response = await axios.get(`/api/comment/${id}`);
            // Set the fetched comments to the state
            setComments(response.data.comments); // Assuming the API response returns comments in the 'data' object
         } catch (error) {
            console.error("Error fetching comments:", error);
         }
      };
      getCommentsForPost();
   }, [id]);

   const getLikesCountByPostId = async () => {
      if (!post) return;
      try {
         const response = await axios.get(`/api/like/getLikes?postId=${post.post_id}`);
         const likesCount = response.data.likesCount || 0;
         setLikesCount(likesCount);
      } catch (error) {
         console.error("Error fetching likes count:", error);
         throw new Error("Failed to fetch likes count");
      }
   };

   const checkIfUserLikedPost = async () => {
      if (!authContext || !post) return;
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
         console.error("Error checking if user liked post:", error);
      }
   };

   const handleLike = async () => {
      if (!authContext || !post) return;
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
         console.error("Error liking post:", error);
      }
   };

   const handleUnlike = async () => {
      if (!authContext || !post) return;
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
         console.error("Error unliking post:", error);
      }
   };

   const handleSubmitComment = async (e: FormEvent) => {
      e.preventDefault();
      if (!newComment) return;

      if (!authContext?.currentUser) {
         redirectToLoginToast();
         return;
      }

      try {
         const userId = authContext.currentUser.user_id;
         const postId = post?.post_id;

         await axios.post(
            "/api/comment",
            {
               userId,
               postId,
               content: newComment,
            },
            {
               withCredentials: true, // Set withCredentials to true
            }
         );
         const newCommentObj: CommentInterface = {
            user_id: Number(userId),
            content: newComment,
            created_at: new Date().toISOString(),
            commenter: {
               user_id: authContext.currentUser.user_id,
               username: authContext.currentUser.username,
               name: authContext.currentUser.name,
               user_pfp: authContext.currentUser.profilePic,
            },
         };
         // Append the new comment to the existing comments state
         setComments([newCommentObj, ...comments]);
         setNewComment("");
      } catch (error) {
         console.error("Error adding comment:", error);
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

   useEffect(() => {
      checkIfUserLikedPost();
   }, [authContext?.currentUser?.user_id, post]);

   useEffect(() => {
      getLikesCountByPostId();
   }, [likesCount, isLiked, post]);

   return (
      <div className={style.Container}>
         <div className={style.Post_Container}>
            <div className={style.Post_Container__left}>
               <Link to={`/profile/${post?.user_id}`}>
                  <Avatar className="relative flex h-full rounded-full">
                     <AvatarImage src={post?.user_pfp ? `../upload/${post.user_pfp}` : fallBackPfp} />
                     <AvatarFallback>{post?.creatorname && getInitialsFromString(post?.creatorname)}</AvatarFallback>
                  </Avatar>
               </Link>
            </div>
            <div className={style.Post_Container__middle}>
               <div className={style.Post_Container__middle__top}>
                  <p>
                     <Link to={`/profile/${post?.user_id}`}>
                        <span className={style.Post_Container__middle__top__creator_name}>{post?.creatorname + " "}</span>
                     </Link>
                     <span className={style.Post_Container__middle__top__at_and_time}>
                        @{post?.username} - {post?.created_at && timeAgo(post.created_at)}
                     </span>
                  </p>
               </div>

               <p>{post?.content}</p>

               {/* conditionally show image */}
               {post?.images && post.images.length > 0 && (
                  <CarouselDemo images={post.images.filter((image) => typeof image === "string") as string[]} />
               )}

               <div className={style.Post_Container__middle__bottom}>
                  <div>
                     <img
                        className={style.Container__middle__bottom__icon}
                        src={isLiked ? likedIcon : likeIcon}
                        alt="Like Icon"
                        onClick={isLiked ? handleUnlike : handleLike}
                     />
                     {likesCount}
                  </div>
                  <div>
                     <img className={style.Post_Container__middle__bottom__icon} src={commentIcon} /> {post?.commentsNum}
                  </div>
               </div>
            </div>
         </div>

         <div className={style.Comments_Container}>
            <h2>Comments</h2>

            <form className={style.Container__CommentAreaPost__comments} onSubmit={handleSubmitComment}>
               <Avatar className="relative flex h-full rounded-full">
                  <AvatarImage
                     src={
                        authContext?.currentUser?.profilePic
                           ? authContext.currentUser.profilePic && `../upload/${authContext?.currentUser?.profilePic}`
                           : fallBackPfp
                     }
                  />
                  <AvatarFallback>
                     {authContext?.currentUser?.username && getInitialsFromString(authContext?.currentUser?.username)}
                  </AvatarFallback>
               </Avatar>
               <input
                  id="comment"
                  placeholder="Leave a comment..."
                  value={newComment}
                  maxLength={280}
                  required
                  onChange={(e) => setNewComment(e.target.value)}
               />
            </form>

            <div className={style.Comments_Container__comments}>
               {comments && comments.length > 0 ? (
                  comments.map((comment, index) => <Comment key={index} comment={comment} />)
               ) : (
                  <p>Be the first to comment...</p>
               )}
            </div>
         </div>
      </div>
   );
};

export default SinglePost;
