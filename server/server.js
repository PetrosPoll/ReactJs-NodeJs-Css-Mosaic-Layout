// Setup all the necessary packages
const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();
const cors = require("cors");
const multer = require("multer");

// Allow requests from all origins
app.use(cors());

// Read the articles.json file and receive the data as json object
const articlesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "articles.json"), "utf-8")
);

// Get the path of the directry wich contains all the images
const imagesDirectoryPath = path.join(__dirname, "images");

// Save the uploaded image into our folder with images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Receive Images with Articles - We are using this function in multiple places
const getImageListWithArticles = (res) => {
    fs.readdir(imagesDirectoryPath, (err, filesNames) => {
      if (err) {
        console.error("Error reading image directory:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      // For each image name create the path and associate it with an article starting from the top of the list
      const imageWithArticle = filesNames.map((name, index) => {
        const article = articlesData[index] || { title: 'No Title', description: 'No Description' };
        return {
          image: `/images/${name}`,
          article,
        };
      });
  
      res.json(imageWithArticle);
    });
  };

// Middlewares
const upload = multer({ storage: storage });
app.use("/images", express.static(imagesDirectoryPath));

// Our main endpoint to receive a json object as result
// where each image will be associated with an article
app.get("/images", (req, res) => {
    getImageListWithArticles(res);
});

// Endpoint to upload an image
app.post("/upload", upload.single("image"), (req, res) => {
  fs.readdir(imagesDirectoryPath, (err, files) => {
    if (err) {
      console.error("Error reading image directory:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Keep the same name format for every new image that the user is uploading
    const imageCount = files.filter((file) => file.startsWith("image")).length;
    const newImageFilename = `image${imageCount}.png`;

    // Rename the uploaded file to match the new filename
    const oldPath = path.join(imagesDirectoryPath, req.file.filename);
    const newPath = path.join(imagesDirectoryPath, newImageFilename);

    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error("Error renaming file:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      getImageListWithArticles(res);
    });
  });
});

// Catch any invalid request and provide a message - This must be at the end of the code
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
