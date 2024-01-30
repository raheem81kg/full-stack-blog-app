import {
   Drawer,
   DrawerClose,
   DrawerContent,
   DrawerDescription,
   DrawerFooter,
   DrawerHeader,
   DrawerTitle,
   DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { ReactNode, useContext, useRef, useState } from "react";
import { AuthContext, PostInterface } from "@/context/authContext";
import { Label } from "@radix-ui/react-label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";
import useToastError from "@/hooks/useToastError";
import { useNavigate } from "react-router-dom";
import { ToastAction } from "./ui/toast";

type DrawerTriggerProps = {
   children: ReactNode; // Accepts any valid ReactNode as children
};

const UploadDrawer: React.FC<DrawerTriggerProps> = ({ children }) => {
   const { toast } = useToast();
   const navigate = useNavigate();
   const cancelButtonRef = useRef<HTMLButtonElement>(null);
   const [content, setContent] = useState<string>("");
   const [images, setImages] = useState<FileList>();
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const toastError = useToastError();

   const authContext = useContext(AuthContext);

   const uploadImages = async () => {
      try {
         if (images) {
            const postFormData = new FormData();

            for (let i = 0; i < images.length; i++) {
               postFormData.append("images", images[i]);
            }

            const postImageRes = await axios.post("/api/upload/uploadPostImages", postFormData, {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
               withCredentials: true,
            });
            return postImageRes.data;
         }
      } catch (error) {
         console.error("Error uploading picture:", error);
         throw error;
      }

      return null; // Explicitly return null if no profilePic is available or if an error occurred
   };

   const addPost = async () => {
      if (!authContext?.currentUser) {
         toast({
            title: "Not logged in!",
            description: "Please visit the register/login page",
            action: (
               <ToastAction altText="Go to register/login page" onClick={() => navigate("/register")}>
                  Register/Login
               </ToastAction>
            ),
         });
         return;
      }

      if (!content) {
         toast({
            title: "No content!",
            description: "Please enter something into the content area",
         });
         return;
      }

      try {
         const userId = authContext?.currentUser?.user_id;
         if (!userId) return;

         setIsLoading(true);

         const post = {
            userId,
            content,
            images: (await uploadImages()) || undefined,
         };

         // Make an Axios POST request to the addPost endpoint
         const response = await axios.post("/api/post", post, {
            headers: {
               "Content-Type": "application/json",
            },
            withCredentials: true,
         });

         authContext?.setPosts((prevPosts: PostInterface[]) => [
            {
               user_id: post.userId,
               post_id: response.data.insertId,
               created_at: new Date().toISOString(),
               username: authContext?.currentUser?.username,
               creatorname: authContext?.currentUser?.name,
               user_pfp: authContext?.currentUser?.profilePic,
               images: post.images,
               likesNum: 0,
               commentsNum: 0,
               content,
            },
            ...prevPosts,
         ]);

         if (cancelButtonRef && cancelButtonRef.current) {
            cancelButtonRef.current.click(); // Programmatically trigger the click event
         }
         setContent("");
         setImages(undefined);

         toast({
            title: "Upload Successful!",
            description: "Your post has been successfully uploaded.",
         });
      } catch (error) {
         // Handle errors
         toastError(error, "Error adding post:");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <Drawer>
         <DrawerTrigger className="h-full p-0 m-0">{children}</DrawerTrigger>
         <DrawerContent>
            <DrawerHeader>
               <DrawerTitle>Upload Your Post</DrawerTitle>
               <DrawerDescription>Share Your Updates Effortlessly.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 pb-0">
               <div className="space-y-1">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                     id="content"
                     value={content}
                     rows={4}
                     maxLength={255}
                     required
                     onChange={(e) => setContent(e.target.value)}
                  ></Textarea>
               </div>
               <div className="space-y-1 mt-2">
                  <Label htmlFor="images">Images</Label>
                  <Input id="images" type="file" accept="image/*" onChange={(e) => e.target.files && setImages(e.target.files)} />
               </div>
            </div>
            <DrawerFooter>
               <Button disabled={!content ? true : false || isLoading} onClick={() => addPost()}>
                  {isLoading ? (
                     <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving changes...
                     </>
                  ) : (
                     "Post"
                  )}
               </Button>
               <DrawerClose>
                  <Button ref={cancelButtonRef} variant="outline">
                     Cancel
                  </Button>
               </DrawerClose>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
};

export default UploadDrawer;
