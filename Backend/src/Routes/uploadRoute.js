const express = require("express");
const multer = require("multer");
const path = require("path");
const { bucket } = require("../../firebase-config");
const Contract = require("../Models/ContractModel");

const router = express.Router();

// Use multer to store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload file to Firebase Storage
const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = Date.now() + '-' + path.extname(file.originalname);
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on("error", (error) => {
      reject(error);
    });

    stream.on("finish", async () => {
      try {
        const [url] = await fileUpload.getSignedUrl({
          action: "read",
          expires: "03-09-2491", // Optional expiry date
        });
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });

    stream.end(file.buffer);
  });
};




// Handle file upload
router.post("/upload", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
  
    try {
      const fileUrl = await uploadFile(req.file);
      
      // Save the contract metadata to the database
      const newContract = new Contract({
        fileName: req.file.originalname,
        fileUrl: fileUrl
      });
      console.log("New contract:", newContract); // Log the new contract
      
      const savedContract = await newContract.save();
      console.log("Saved contract:", savedContract); // Log the saved contract
      
      res.status(200).send({ fileUrl });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading file.");
    }
  });
  


router.get("/contracts", async (req, res) => {
    try {
        const contracts = await Contract.find().sort({ createdAt: -1 });
      
      res.status(200).json(contracts);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error fetching contracts.");
    }
  });
  
  


module.exports = router;
