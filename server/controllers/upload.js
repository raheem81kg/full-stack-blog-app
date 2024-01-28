const uploadController = {
   uploadPostImages: (req, res) => {
      try {
         const filenames = req.files.map((file) => file.filename);
         res.status(200).json({ filename: filenames });
      } catch (error) {
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   uploadProfilePic: (req, res) => {
      try {
         const file = req.file;
         console.log("pfp" + file.filename);
         res.status(200).json({ filename: file.filename });
      } catch (error) {
         res.status(500).json({ error: "Internal Server Error" });
      }
   },

   uploadCoverPic: (req, res) => {
      try {
         const file = req.file;
         res.status(200).json({ filename: file.filename });
      } catch (error) {
         res.status(500).json({ error: "Internal Server Error" });
      }
   },
};

export default uploadController;
