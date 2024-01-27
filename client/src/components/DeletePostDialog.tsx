import { Loader2 } from "lucide-react";
import { useContext, useRef, useState } from "react";
import axios from "axios";

import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import useToastError from "@/hooks/useToastError";
import { toast } from "./ui/use-toast";
import { AuthContext } from "@/context/authContext";

type DeletePostDialogProps = {
   children: ReactNode;
   post_id: number | string;
};

const DeletePostDialog: React.FC<DeletePostDialogProps> = ({ children, post_id }) => {
   const authContext = useContext(AuthContext);
   const [loading, setLoading] = useState(false);
   const closeButtonRef = useRef<HTMLButtonElement>(null);
   const toastError = useToastError();

   const removePost = (postId: string | number) => {
      if (authContext) {
         const updatedPosts = authContext.posts.filter((post) => post.post_id !== postId);
         authContext.setPosts(updatedPosts);
      }
   };

   const handleDeletePost = async () => {
      try {
         setLoading(true);
         if (!post_id) return;
         await axios.delete(`${import.meta.env.VITE_API_URL}/api/post/${post_id}`, {
            withCredentials: true,
         });
         if (closeButtonRef && closeButtonRef.current) {
            closeButtonRef.current.click(); // Programmatically trigger the click event
         }
         removePost(post_id);
         toast({
            title: "Post successfully deleted!",
         });
      } catch (error) {
         toastError(error, "Error deleting post:");
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog>
         <DialogTrigger asChild>{children}</DialogTrigger>
         <DialogContent className="sm:max-w-md">
            <DialogHeader>
               <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
               <DialogDescription>Once deleted, you won't be able to recover.</DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
               <Button disabled={loading} onClick={handleDeletePost}>
                  {loading ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting post...
                     </>
                  ) : (
                     "Yes"
                  )}
               </Button>
               <DialogClose asChild>
                  <Button type="button" variant="secondary" ref={closeButtonRef}>
                     Close
                  </Button>
               </DialogClose>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default DeletePostDialog;
