import { useContext, useEffect, useState } from "react";
import ProfilePreview from "../components/ProfilePreview";
import style from "../scss/Home.module.scss";
import { AuthContext } from "../context/authContext";
import Post from "../components/Post";
import SelectDemo from "../components/SelectDemo";
import axios from "axios";
import { Button } from "@/components/ui/button";
import PuffLoader from "react-spinners/PuffLoader";
import useToastError from "@/hooks/useToastError";

export interface ToggleInfoInterface {
   // id of user needed to toggle following
   userIdOnPost: number | string;
   // index of clikced post, in order to not toggle it, only others
   clickedPostIdex: number | string;
}

const Home: React.FC = () => {
   const authContext = useContext(AuthContext);
   const [offset, setOffset] = useState<number>(0);
   const [isMorePosts, setIsMorePosts] = useState<boolean>(false);
   // don't show load more button until first posts have been fetched
   const [firstLoading, setFirstLoading] = useState<boolean>(true);
   const [selectValue, setSelectValue] = useState("all_blogs");
   const [toggleInfo, setToggleInfo] = useState<ToggleInfoInterface | null>();
   const toastError = useToastError();

   const fetchPosts = async (offsetValue: number) => {
      try {
         const response = await axios.get(
            `/api/post/${selectValue === "following" ? "getPostsByUserFollows" : "getAllPosts"}?offset=${offsetValue}&limit=8`,
            {
               withCredentials: true, // Set withCredentials to true
            }
         );
         const newPosts = response.data.posts;
         if (offsetValue === 0) {
            authContext?.setPosts(newPosts);
         } else {
            authContext?.setPosts((prevPosts: any) => [...prevPosts, ...newPosts]);
         }
      } catch (error) {
         toastError(error, "Fetch posts error:");
      } finally {
         setFirstLoading(false);
      }
   };

   useEffect(() => {
      setFirstLoading(true);
      setOffset(0);
   }, [selectValue]);

   useEffect(() => {
      fetchPosts(offset);
   }, [selectValue, offset]);

   useEffect(() => {
      const checkForMorePosts = async () => {
         setIsMorePosts(false);
         try {
            const response = await axios.get(
               `/api/post/${selectValue === "following" ? "getPostsByUserFollows" : "getAllPosts"}?offset=${offset + 10}&limit=2`,
               {
                  withCredentials: true, // Set withCredentials to true
               }
            );
            const newPosts = response.data.posts;
            setIsMorePosts(newPosts.length > 0);
         } catch (error) {
            setIsMorePosts(false);
            console.error("Fetch posts error:", error);
         }
      };
      checkForMorePosts();
   }, [offset]);

   const concatenateNextPosts = () => {
      setOffset((prevOffset) => prevOffset + 10); // Increment offset (e.g., load next 10 posts)
   };

   useEffect(() => {
      window.scrollTo(0, 0); // Scroll to the top of the page
      setFirstLoading(true);
      setOffset(0);
   }, [selectValue]);

   return (
      <>
         {!firstLoading ? (
            <div className={style.Home}>
               <h1 className={style.Home__title}>Feed</h1>
               <SelectDemo selectValue={selectValue} setSelectValue={setSelectValue} />
               <div className={style.Home__content}>
                  <div className={style.Home__content__left}>
                     <ProfilePreview profilePage={false} user={authContext?.currentUser} />
                  </div>
                  <div className={style.Home__content__right}>
                     {authContext?.posts && authContext?.posts?.length > 0 ? (
                        authContext?.posts.map((post, index) => {
                           return (
                              <Post key={index} post={post} toggleInfo={toggleInfo} setToggleInfo={setToggleInfo} postIdex={index} />
                           );
                        })
                     ) : (
                        <div className="h-full min-w-96 text-center py-14 px-9 bg-white">
                           <p className="text-gray-600 text-lg font-semibold mb-2">No posts available right now</p>
                           <p className="text-gray-400">Why not try uploading one? 😉</p>
                        </div>
                     )}
                     {isMorePosts && !firstLoading && <Button onClick={() => concatenateNextPosts()}>Load more posts</Button>}
                  </div>
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
