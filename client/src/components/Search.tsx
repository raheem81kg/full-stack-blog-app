import { useEffect, useState } from "react";
import style from "../scss/Search.module.scss";
import axios from "axios";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import PuffLoader from "react-spinners/PuffLoader";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
   user_id: string;
   username: string;
   profilePic?: string;
   // Add more properties as needed
}

interface SearchProps {
   search: string | undefined;
}

function Search({ search }: SearchProps) {
   const navigate = useNavigate();
   const [usersFound, setUsersFound] = useState<User[]>([]);
   const [loading, setLoading] = useState<boolean>(true);

   const searchUsersByUsername = async (username: string) => {
      setLoading(true);
      try {
         const response = await axios.get(`/api/user/search?username=${username}`);
         setUsersFound(response.data.users);
      } catch (error) {
         setUsersFound([]);
         // console.error("Error fetching users:", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (search) {
         searchUsersByUsername(search);
      } else {
         setLoading(false);
         setUsersFound([]); // Clear users when the search query is empty
      }
   }, [search]);

   return (
      <Command className={`rounded-lg border shadow-md ${style.Container}`}>
         {loading ? (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60px" }}>
               <PuffLoader color="black" size={50} />
            </div>
         ) : (
            <>
               {usersFound.length > 0 ? (
                  <CommandList>
                     <CommandGroup heading="Users">
                        {usersFound.map((user) => (
                           <div
                              key={user.user_id}
                              onClick={() => navigate(`/user/${user.user_id}`)}
                              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer"
                           >
                              {user.profilePic ? (
                                 <Avatar className="mr-1">
                                    <AvatarImage style={{ height: "1rem" }} src={user.profilePic && `../upload/${user.profilePic}`} />
                                 </Avatar>
                              ) : (
                                 <User className="mr-2 h-4 w-4" />
                              )}
                              <span>{user.username}</span>
                           </div>
                        ))}
                     </CommandGroup>
                  </CommandList>
               ) : (
                  search && <CommandItem>No users found.</CommandItem>
               )}
            </>
         )}
      </Command>
   );
}

export default Search;
