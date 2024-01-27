import { useEffect, useState } from "react";
import style from "../scss/Footer.module.scss";
import { Toaster } from "./ui/toaster";
import useAxiosInterceptors from "@/hooks/useAxiosInterceptors";

const Footer: React.FC = () => {
   // Use the hook to set up interceptors
   const cleanupInterceptor = useAxiosInterceptors();

   // State to track scroll position
   const [showScrollButton, setShowScrollButton] = useState(false);

   // Scroll event listener
   const handleScroll = () => {
      // Set showScrollButton based on scroll position
      setShowScrollButton(window.scrollY > 100); // Adjust the threshold as needed
   };

   // Attach scroll event listener on mount
   useEffect(() => {
      window.addEventListener("scroll", handleScroll);

      // Optionally, you can clean up the event listener when this component unmounts
      return () => {
         window.removeEventListener("scroll", handleScroll);
         cleanupInterceptor();
      };
   }, [cleanupInterceptor]);

   const handleScrollToTop = () => {
      window.scrollTo({
         top: 0,
         behavior: "smooth",
      });
   };

   return (
      <>
         <div className={style.Footer_container}>
            <div className={style.Footer_container__Footer}>
               {showScrollButton && (
                  <div className={style.Footer_container__Footer__scroll_up} onClick={handleScrollToTop}>
                     <svg height="14" viewBox="0 0 16 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                           d="M0 8.05L1.61143 9.6715L6.85714 4.4045V23H9.14286V4.4045L14.3886 9.683L16 8.05L8 0L0 8.05Z"
                           fill="white"
                        />
                     </svg>
                  </div>
               )}
               <p>© 2023 RAHEEM GORDON, ALL RIGHTS RESERVED</p>
            </div>
         </div>
         <Toaster />
      </>
   );
};

export default Footer;
