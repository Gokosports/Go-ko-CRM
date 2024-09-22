const express = require("express");
const multer = require("multer");
const path = require("path");
const { bucket } = require("../../firebase-config");
const Contract = require("../Models/ContractModel");
const nodemailer = require("nodemailer");
const Devis = require("../Models/DevisModel");
const Planning = require("../Models/PlanningModel");


const router = express.Router();

// Use multer to store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// Helper function to upload file to Firebase Storage
const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = Date.now() + "-" + path.extname(file.originalname);
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



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/upload", upload.single("pdf"), async (req, res) => {

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  if (!req.body.email) {
    return res.status(400).send("Recipient email is required.");
  }

  try {
    const fileUrl = await uploadFile(req.file);

    // Save the contract metadata to the database
    const newContract = new Contract({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
    });
    const savedContract = await newContract.save();

    // Send email with the contract PDF
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address
      to: req.body.email, // receiver address (coach's email)
      subject: 'Your Contract PDF',
      text: 'Please find attached your contract.',
      attachments: [
        {
          filename: req.file.originalname,
          content: req.file.buffer,
          contentType: req.file.mimetype,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + savedContract.fileUrl); // Log the email sent

    res.status(200).send({ fileUrl });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file or sending email.");
  }
});

router.post("/uploads", upload.single("pdf"), async (req, res) => {

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Upload the file to your storage and get the URL
    const fileUrl = await uploadFile(req.file);

    // Save the contract metadata to the database
    const newContract = new Devis({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
    });

    // Save the contract details in the database
    const savedContract = await newContract.save();

    // Send a response back with the uploaded file URL
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

router.get("/devis", async (req, res) => {
  try {
    const devis = await Devis.find().sort({ createdAt: -1 });

    res.status(200).json(devis);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching contracts.");
  }
});

router.post('/planning', async (req, res) => {
  try {
    const { coachId, time, callSituation, comment } = req.body;
    // Save the planning details in the database
    const newPlanning = new Planning({ coachId, time, callSituation, comment });
    const savedPlanning = await newPlanning.save();

    res.status(200).send({ message: 'Planning created', savedPlanning });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error creating planning' });
  }
});
// GET /api/planning
router.get('/planning', async (req, res) => {
  try {
    const plannings = await Planning.find().populate('coachId'); // Populate if needed
    res.status(200).json(plannings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching planning entries.' });
  }
});


module.exports = router;
