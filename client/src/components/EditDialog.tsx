import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormEvent, MouseEvent, useContext, useEffect, useState } from "react";
import { AuthContext, UpdateUserInterface } from "@/context/authContext";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "./ui/use-toast";
import useToastError from "@/hooks/useToastError";
import { ToastAction } from "./ui/toast";
import { useNavigate } from "react-router-dom";

export function EditDialog() {
   const authContext = useContext(AuthContext);
   const [isLoading, setIsLoading] = useState<boolean>(false);
   const [username, setUsername] = useState<string | undefined>(authContext?.currentUser?.username);
   const [name, setName] = useState<string | undefined>(authContext?.currentUser?.name);
   const [bio, setBio] = useState<string | undefined>(authContext?.currentUser?.bio);
   const [email, setEmail] = useState<string | undefined>(authContext?.currentUser?.email);
   const [profilePic, setProfilePic] = useState<File | null>();
   const [coverPic, setCoverPic] = useState<File | null>();
   const [currentPassword, setCurrentPassword] = useState<string>("");
   const [newPassword, setNewPassword] = useState<string>("");
   const [isModified, setIsModified] = useState<boolean>(false); // Track modification of user data in inputs
   const navigate = useNavigate();
   const toastError = useToastError();

   const uploadProfilePicUpdateUser = async () => {
      try {
         if (profilePic) {
            const profileFormData = new FormData();
            profileFormData.append("file", profilePic);

            const pfpRes = await axios.post("http://localhost:4999/api/upload/uploadProfilePic", profileFormData, {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
            });

            if (pfpRes.data.filename) {
               authContext?.setCurrentUser((prevUser) => ({
                  ...prevUser,
                  profilePic: pfpRes?.data?.filename,
               }));
               return pfpRes?.data?.filename;
            }
         }
      } catch (error) {
         throw error;
      }

      return null; // Explicitly return null if no profilePic is available or if an error occurred
   };

   const uploadCoverPicUpdateUser = async () => {
      try {
         if (coverPic) {
            const coverFormData = new FormData();
            coverFormData.append("file", coverPic);

            const coverRes = await axios.post("/api/upload/uploadCoverPic", coverFormData, {
               headers: {
                  "Content-Type": "multipart/form-data",
               },
            });
            authContext?.setCurrentUser((prevUser) => ({
               ...prevUser,
               coverPic: coverRes?.data?.filename,
            }));
            return coverRes?.data?.filename;
         }
         return null;
      } catch (error) {
         throw error;
      }
   };

   const handleSubmit = async () => {
      setIsLoading(true); // Set loading state to true while making the request
      if (!authContext?.currentUser?.user_id) {
         toast({
            title: "Please login to change profile details!",
         });
      }
      try {
         const updatedUser: UpdateUserInterface = {
            username,
            name,
            bio,
            email,
            // if profile picture or coverPic is present upload it
            profilePic: profilePic ? String(await uploadProfilePicUpdateUser()) : undefined,
            coverPic: coverPic ? String(await uploadCoverPicUpdateUser()) : undefined,
         };

         await authContext?.updateUser(updatedUser);
         toast({
            title: "Profile successfully updated!",
         });
      } catch (error: any) {
         toastError(error, "Logout error:");
      } finally {
         // Set a delay of 200 milliseconds (half a second) before setting isLoading back to false
         setTimeout(() => {
            setIsLoading(false);
         }, 100);
      }
   };

   const handleSubmitPassword = async (e: FormEvent) => {
      e.preventDefault();
      setIsLoading(true);

      try {
         await axios.post(
            "/api/user/changePassword",
            {
               currentPassword,
               newPassword,
            },
            {
               withCredentials: true, // Include this if using cookies for authentication
            }
         );

         setCurrentPassword("");
         setNewPassword("");
         toast({
            title: "Password successfully update!",
         });
      } catch (error) {
         toastError(error, "Change password error:");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      // Check for changes in user data
      const isUserModified =
         username !== authContext?.currentUser?.username ||
         name !== authContext?.currentUser?.name ||
         bio !== authContext?.currentUser?.bio ||
         email !== authContext?.currentUser?.email ||
         profilePic !== undefined ||
         coverPic !== undefined;

      setIsModified(isUserModified);
   }, [username, name, bio, email, profilePic, coverPic, authContext?.currentUser]);

   function redirectToLoginToast(e: MouseEvent<HTMLButtonElement>) {
      if (authContext?.currentUser) return;
      e.preventDefault();
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
      <Dialog>
         <DialogTrigger asChild>
            <Button onClick={redirectToLoginToast} variant="outline">
               Edit Profile
            </Button>
         </DialogTrigger>
         <DialogContent className="sm:max-w-[499px]">
            <Tabs defaultValue="account" className="w-[425px]">
               <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="password">Password</TabsTrigger>
               </TabsList>
               <TabsContent value="account">
                  <Card>
                     <CardHeader>
                        <CardTitle>Your Account</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-2">
                        <div className="space-y-1">
                           <Label htmlFor="name">Name</Label>
                           <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="username">Username</Label>
                           <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="email">Email</Label>
                           <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="bio">Bio</Label>
                           <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="profile-picture">Profile picture</Label>
                           <Input
                              id="profile-picture"
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && setProfilePic(e.target.files[0])}
                           />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="cover-picture">Cover picture</Label>
                           <Input
                              id="cover-picture"
                              type="file"
                              accept="image/*"
                              onChange={(e) => e.target.files && setCoverPic(e.target.files[0])}
                           />
                        </div>
                     </CardContent>
                     <CardFooter>
                        <Button onClick={handleSubmit} disabled={isLoading || !isModified}>
                           {isLoading ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Saving changes...
                              </>
                           ) : (
                              "Save changes"
                           )}
                        </Button>
                     </CardFooter>
                  </Card>
               </TabsContent>
               <TabsContent value="password">
                  <Card>
                     <CardHeader>
                        <CardTitle>Password</CardTitle>
                        <CardDescription>Change your password here. After saving, you'll be logged out.</CardDescription>
                     </CardHeader>
                     <CardContent className="space-y-2">
                        <div className="space-y-1">
                           <Label htmlFor="current">Current password</Label>
                           <Input
                              id="current"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                           />
                        </div>
                        <div className="space-y-1">
                           <Label htmlFor="new">New password</Label>
                           <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                     </CardContent>
                     <CardFooter>
                        <Button onClick={handleSubmitPassword} disabled={isLoading || !(currentPassword && newPassword)}>
                           {isLoading ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Saving password...
                              </>
                           ) : (
                              "Save password"
                           )}
                        </Button>
                     </CardFooter>
                  </Card>
               </TabsContent>
            </Tabs>
         </DialogContent>
      </Dialog>
   );
}
