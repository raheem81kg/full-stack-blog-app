import { v4 } from "uuid";
import admin from "firebase-admin";
import serviceAccount from "../firebase/admin.json" assert { type: "json" };

// Initialize Firebase admin
admin.initializeApp({
   credential: admin.credential.cert(serviceAccount),
   storageBucket: "gs://blog-app-photos.appspot.com",
});

const uploadController = {
   uploadPostImages: async (req, res) => {
      try {
         const filenames = [];

         // Get a reference to the Firebase Storage bucket
         const bucket = admin.storage().bucket();

         // Helper function to get a signed URL for a file
         const getSignedUrl = (file) =>
            new Promise((resolve, reject) => {
               const fileName = `images/${file.originalname}_${v4()}`;
               const fileStream = bucket.file(fileName).createWriteStream({
                  metadata: {
                     contentType: file.mimetype,
                     // Set the ACL (Access Control List) to 'publicRead' to make the file public
                     acl: [
                        {
                           entity: "allUsers",
                           role: "READER",
                        },
                     ],
                  },
               });

               // Handle errors during the upload
               fileStream.on("error", (err) => {
                  console.error(err);
                  reject(`Error uploading the file ${file.originalname}`);
               });

               // Handle successful upload
               fileStream.on("finish", async () => {
                  // Get a signed URL that allows read access to the file without authentication
                  try {
                     const signedUrl = await bucket.file(fileName).getSignedUrl({
                        action: "read",
                        expires: Date.now() + 1000 * 60 * 60 * 24 * 700000, // Link expires in 7 days
                     });
                     resolve(signedUrl);
                  } catch (err) {
                     console.error(err);
                     reject(`Error generating signed URL for ${file.originalname}`);
                  }
               });

               // Pipe the file data to Firebase Storage
               fileStream.end(file.buffer);
            });

         // Iterate through each file in req.files and upload to Firebase Storage
         for (const file of req.files) {
            try {
               const signedUrl = await getSignedUrl(file);
               filenames.push(signedUrl);
            } catch (error) {
               console.error(error);
               return res.status(500).json({ error: "Internal Server Error" });
            }
         }

         // Send back the array of signed URLs as the response
         res.status(200).json(filenames);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   uploadProfilePic: async (req, res) => {
      try {
         if (!req.file) {
            return res.status(400).send("No file uploaded.");
         }

         const file = req.file;

         // Get a reference to the Firebase Storage bucket
         const bucket = admin.storage().bucket();

         // Generate a unique filename with a folder path for the uploaded file
         const fileName = `images/${v4()}-${file.originalname}`;

         // Create a write stream to Firebase Storage
         const fileStream = bucket.file(fileName).createWriteStream({
            metadata: {
               contentType: file.mimetype,
               // Set the ACL (Access Control List) to 'publicRead' to make the file public
               acl: [
                  {
                     entity: "allUsers",
                     role: "READER",
                  },
               ],
            },
         });

         // Handle errors during the upload
         fileStream.on("error", (err) => {
            console.error(err);
            res.status(500).send("Error uploading the file.");
         });

         // Handle successful upload
         fileStream.on("finish", () => {
            // Get a signed URL that allows read access to the file without authentication
            bucket.file(fileName).getSignedUrl(
               {
                  action: "read",
                  expires: Date.now() + 1000 * 60 * 60 * 24 * 700000, // Link expires in 7 days
               },
               (err, signedUrl) => {
                  if (err) {
                     console.error(err);
                     res.status(500).send("Error generating signed URL.");
                  } else {
                     res.status(200).json({ filename: signedUrl });
                  }
               }
            );
         });

         // Pipe the file data to Firebase Storage
         fileStream.end(file.buffer);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   uploadCoverPic: async (req, res) => {
      try {
         if (!req.file) {
            return res.status(400).send("No file uploaded.");
         }

         const file = req.file;

         // Get a reference to the Firebase Storage bucket
         const bucket = admin.storage().bucket();

         // Generate a unique filename with a folder path for the uploaded file
         const fileName = `images/${v4()}-${file.originalname}`;

         // Create a write stream to Firebase Storage
         const fileStream = bucket.file(fileName).createWriteStream({
            metadata: {
               contentType: file.mimetype,
               // Set the ACL (Access Control List) to 'publicRead' to make the file public
               acl: [
                  {
                     entity: "allUsers",
                     role: "READER",
                  },
               ],
            },
         });

         // Handle errors during the upload
         fileStream.on("error", (err) => {
            console.error(err);
            res.status(500).send("Error uploading the file.");
         });

         // Handle successful upload
         fileStream.on("finish", () => {
            // Get a signed URL that allows read access to the file without authentication
            bucket.file(fileName).getSignedUrl(
               {
                  action: "read",
                  expires: Date.now() + 1000 * 60 * 60 * 24 * 700000, // Link expires in 7 days
               },
               (err, signedUrl) => {
                  if (err) {
                     console.error(err);
                     res.status(500).send("Error generating signed URL.");
                  } else {
                     console.log(signedUrl);
                     res.status(200).json({ filename: signedUrl });
                  }
               }
            );
         });

         // Pipe the file data to Firebase Storage
         fileStream.end(file.buffer);
      } catch (error) {
         console.error(error);
         res.status(500).json({ error: "Internal Server Error" });
      }
   },
};

export default uploadController;
