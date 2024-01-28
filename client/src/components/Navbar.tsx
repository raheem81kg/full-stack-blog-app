import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import style from "../scss/Navbar.module.scss";
import logoImage from "../assets/images/logo.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import getInitialsFromString from "@/utils/getInitialsFromString";
import { LogOut, User } from "lucide-react";
import UploadDrawer from "@/components/UploadDrawer";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuShortcut,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Search from "./Search";
const Navbar: React.FC = () => {
   const authContext = useContext(AuthContext);
   const [search, setSearch] = useState<string>("");

   return (
      <>
         <div className={style.Navbar}>
            <div className={style.Navbar__left}>
               <Link to="/">Home</Link>
               <label htmlFor="search">Search</label>
               <div className={style.Navbar__left__search_container}>
                  <input
                     id="search"
                     className={style.Navbar__left__search_container__search}
                     value={search}
                     type="text"
                     onChange={(e) => setSearch(e.target.value)}
                  />
                  <div className={style.Navbar__left__search_container__results}>
                     <Search search={search} />
                  </div>
               </div>
            </div>
            <Link to="/">
               {" "}
               <img className={style.Navbar__middle} id="logo" src={logoImage} alt="Some random logo" />
            </Link>
            <div className={style.Navbar__right}>
               {authContext?.currentUser?.user_id ? (
                  <DropdownMenu>
                     <DropdownMenuTrigger>
                        <Avatar>
                           <AvatarImage
                              src={authContext.currentUser.profilePic && `../upload/${authContext?.currentUser?.profilePic}`}
                           />
                           <AvatarFallback>
                              {authContext?.currentUser?.username && getInitialsFromString(authContext?.currentUser?.username)}
                           </AvatarFallback>
                        </Avatar>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent className="w-56">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                           <Link to={"/user/" + authContext?.currentUser.user_id}>
                              <DropdownMenuItem className="cursor-pointer">
                                 <User className="mr-2 h-4 w-4" />
                                 <span>Profile</span>
                                 <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                              </DropdownMenuItem>
                           </Link>
                        </DropdownMenuGroup>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => authContext.logout()}>
                           <LogOut className="mr-2 h-4 w-4" />
                           <span>Log out</span>
                           <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                     </DropdownMenuContent>
                  </DropdownMenu>
               ) : (
                  <Link to="/register" className={style.Navbar__right__register_login}>
                     REGISTER/LOGIN
                  </Link>
               )}
               <UploadDrawer>
                  <div className={style.Navbar__right__create_post}>CREATE A POST!</div>
               </UploadDrawer>
            </div>
         </div>
      </>
   );
};

export default Navbar;
