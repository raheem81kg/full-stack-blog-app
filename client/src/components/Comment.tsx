import timeAgo from "@/utils/timeAgo";
import style from "../scss/Comment.module.scss";
import { CommentInterface } from "@/pages/SinglePost";
import fallBackPfp from "../assets/images/profile-icon.jpeg";

interface CommentProps {
   comment: CommentInterface; // Define the prop 'comment' with the type commentInterface
}

const Comment: React.FC<CommentProps> = ({ comment }) => {
   return (
      <div className={style.Container}>
         <div className={style.Container__left}>
            <img src={comment.commenter?.user_pfp ? comment.commenter.user_pfp : fallBackPfp} alt="" />
         </div>
         <div className={style.Container__middle}>
            <div className={style.Container__middle__top}>
               <p>
                  <span className={style.Container__middle__top__creator_name}>{comment?.commenter?.name + " "}</span>
                  <span className={style.Container__middle__top__at_and_time}>
                     @{comment?.commenter?.username} - {comment?.created_at && timeAgo(String(comment?.created_at))}
                  </span>
               </p>
            </div>
            <p>{comment.content}</p>
         </div>
      </div>
   );
};

export default Comment;
