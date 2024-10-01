const express = require("express");
const multer = require("multer");
const path = require("path");
const { bucket } = require("../../firebase-config");
const Contract = require("../Models/ContractModel");
const nodemailer = require("nodemailer");
const Devis = require("../Models/DevisModel");
const Planning = require("../Models/PlanningModel");
const Calendar = require("../Models/CalendarModel");



const router = express.Router();
// const PANDA_DOC_API_KEY = process.env.PANDADOC_API_KEY;

// Use multer to store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


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

// Route to handle file upload
router.post("/upload", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  if (!req.body.email) {
    return res.status(400).send("Recipient email is required.");
  }
  if (!req.body.clientName) {
    return res.status(400).send("Recipient clientName is required.");
  }
  if (!req.body.commercialName) {
    return res.status(400).send("Recipient commercial is required.");
  }
  if (!req.body.contractDuration) {
    return res.status(400).send("Recipient contractDuration is required.");
  }

  try {
    const fileUrl = await uploadFile(req.file); // Upload file to Firebase

    // Save the contract metadata to the database
    const newContract = new Contract({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      email: req.body.email,
      clientName: req.body.clientName,
      commercialName: req.body.commercialName,
      contractDuration: req.body.contractDuration
    });
    const savedContract = await newContract.save();
    console.log("Contract saved to database:", savedContract);

    // Send email with the file URL
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email,
      subject: `Contrat pour ${req.body.clientName}`,
      text: `Cher(e) ${req.body.clientName},\n\nVeuillez trouver votre contrat ici : ${fileUrl}\n\nCordialement,\nGOKO`,
    };
    

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");

    res.status(200).send({ fileUrl });
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading file or sending email.");
  }
});

// Route to handle file upload
// router.post("/upload", upload.single("pdf"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }
//   if (!req.body.email) {
//     return res.status(400).send("Recipient email is required.");
//   }
//   if (!req.body.clientName) {
//     return res.status(400).send("Recipient clientName is required.");
//   }



//   console.log("Commercial Name:", req.body.commercialName);

//   console.log("Client Name:", req.body.clientName);

//   try {
//     const fileUrl = await uploadFile(req.file); // Ensure this function is defined to get the file URL

//     // Save the contract metadata to the database
//     const newContract = new Contract({
//       fileName: req.file.originalname,
//       fileUrl: fileUrl,
//       email: req.body.email,
//       clientName: req.body.clientName,
     
//     });
//     const savedContract = await newContract.save();
//     console.log("Contract saved to database:", savedContract);
    
//     res.status(200).send({ fileUrl });
    
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error uploading file or sending email.");
//   }
// });



// Upload PDF to PandaDoc function
// const uploadPDFToPandaDoc = async (fileUrl, contractId, recipientEmail, clientName) => {
//   const pandaDocPayload = {
//     name: `Contrat_${contractId}`,
//     url: fileUrl,
//     recipients: [
//       {
//         email: recipientEmail,
//         first_name: clientName.split(" ")[0],
//         last_name: clientName.split(" ")[1],
//         recipient_type: "signer",
//         signing_order: 1 
//       },
//     ],
//     send_document: true, // Set to true to send the document automatically
//   };
//   console.log("Uploading to PandaDoc with the following payload:", JSON.stringify(pandaDocPayload, null, 2));

//   try {
//     // Upload the document to PandaDoc
//     const response = await axios.post(
//       "https://api.pandadoc.com/public/v1/documents",
//       pandaDocPayload,
//       {
//         headers: {
//           Authorization: `API-Key ${PANDA_DOC_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     const documentId = response.data.id;
//     console.log("PDF uploaded to PandaDoc successfully:", response.data);

//     // Poll the document status until it is 'document.draft'
//     await pollDocumentStatus(documentId);

//     // Send the document for signing once the status is 'document.draft'
//     // await sendDocumentForSigning(documentId, recipientEmail, clientName);
//   } catch (error) {
//     console.error(
//       "Error uploading or sending the document to PandaDoc:",
//       error.response?.data || error
//     );
//   }
// };

// // Function to poll the document status until it reaches 'document.draft'
// const pollDocumentStatus = async (documentId) => {
//   let status = "document.uploaded";
//   const MAX_RETRIES = 10; // Max attempts to check status
//   const POLL_INTERVAL = 5000; // 5 seconds

//   for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
//     try {
//       const response = await axios.get(
//         `https://api.pandadoc.com/public/v1/documents/${documentId}`,
//         {
//           headers: {
//             Authorization: `API-Key ${PANDA_DOC_API_KEY}`,
//           },
//         }
//       );

//       status = response.data.status;
//       console.log(`Polling document status: ${status}`);

//       if (status === "document.draft") {
//         console.log("Document is now in draft status.");
//         return;
//       }

//       // Wait for the specified interval before checking again
//       await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
//     } catch (error) {
//       console.error("Error polling document status:", error.response?.data || error);
//     }
//   }

//   throw new Error(
//     `Document status did not change to draft within the maximum retries. Current status: ${status}`
//   );
// };


// Function to send the document for signing
// const sendDocumentForSigning = async (documentId, recipientEmail, clientName) => {
//   const sendPayload = {
//     message: "Please review and sign the contract.",
//     recipients: {
//       [recipientEmail]: {
//         email: recipientEmail,
//         first_name: clientName.split(" ")[0],
//         last_name: clientName.split(" ")[1],
//         recipient_type: "signer",
//         signing_order: 1
//       }
//     }
//   };
//   console.log("Sending document for signing with payload:", sendPayload);
//   try {
//     const response = await axios.post(
//       `https://api.pandadoc.com/public/v1/documents/${documentId}/send`,
//       sendPayload,
//       {
//         headers: {
//           Authorization: `API-Key ${PANDA_DOC_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("Document sent for signing:", response.data);
//   } catch (error) {
//     console.error("Error sending the document for signing:", error.response?.data || error);
//   }
// };

// const sendDocumentForSigning = async (documentId, recipientEmail, clientName) => {
//   const sendPayload = {
//     message: "Please review and sign the contract.",
//     recipients: [
//       {
//         email: recipientEmail,
//         first_name: clientName.split(" ")[0],
//         last_name: clientName.split(" ")[1],
//         recipient_type: "signer", // Ensure this is "signer"
//         signing_order: 1
//       }
//     ],
//     fields: {
//       signature_1: {
//         type: "signature", // Type of field
//         assignee: recipientEmail, // Assign the signature field to the recipient
//         required: true,
//         page: 1, // Page number in the document
//         x: 200, // X-coordinate for placement of the field
//         y: 500, // Y-coordinate for placement of the field
//         width: 200, // Width of the signature field
//         height: 40 // Height of the signature field
//       }
//     }
//   };
//   console.log("Sending document for signing with payload:", sendPayload);

//   try {
//     const response = await axios.post(
//       `https://api.pandadoc.com/public/v1/documents/${documentId}/send`,
//       sendPayload,
//       {
//         headers: {
//           Authorization: `API-Key ${PANDA_DOC_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("Document sent for signing:", response.data);
//   } catch (error) {
//     console.error("Error sending the document for signing:", error.response?.data || error);
//   }
// };






router.get("/contracts", async (req, res) => {
  try {
    const contracts = await Contract.find().sort({ createdAt: -1 });

    res.status(200).json(contracts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching contracts.");
  }
});
// router.post("/uploads", upload.single("pdf"), async (req, res) => {

//   if (!req.file) {
//     return res.status(400).send("No file uploaded.");
//   }

//   try {
//     // Upload the file to your storage and get the URL
//     const fileUrl = await uploadFile(req.file);

//     // Save the contract metadata to the database
//     const newContract = new Devis({
//       fileName: req.file.originalname,
//       fileUrl: fileUrl,
//     });

//     // Save the contract details in the database
//     const savedContract = await newContract.save();

//     // Send a response back with the uploaded file URL
//     res.status(200).send({ fileUrl });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error uploading file.");
//   }
// });




// router.get("/devis", async (req, res) => {
//   try {
//     const devis = await Devis.find().sort({ createdAt: -1 });

//     res.status(200).json(devis);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Error fetching contracts.");
//   }
// });

router.post('/planning', async (req, res) => {
  try {
    const { coachId, time, callSituation, comment } = req.body;
    const newPlanning = new Planning({ coachId, time, callSituation, comment });
    const savedPlanning = await newPlanning.save();
    res.status(200).send({ message: 'Planning created', savedPlanning });
  } catch (error) {
    console.error('Error creating planning:', error);
    res.status(500).send({ message: 'Error creating planning' });
  }
});

// GET /planning/:coachId - Fetch all planning entries for a specific coach
router.get('/planning/:coachId', async (req, res) => {
  try {
    const { coachId } = req.params;
    const plannings = await Planning.find({ coachId }).populate('coachId'); // Populating coach details if needed
    res.status(200).json(plannings);
  } catch (error) {
    console.error('Error fetching planning entries for coach:', error);
    res.status(500).json({ message: 'Error fetching planning entries.' });
  }
});

router.post("/calendar", async (req, res) => {
  try {
    const { title, start, end } = req.body;
    
    // Create a new event
    const newEvent = new Calendar({
      title,
      start,
      end,
    });

    // Save the event to MongoDB
    await newEvent.save();

    // Send a success response
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event", error);
    res.status(500).json({ error: "Server error while creating event" });
  }
});

// GET route to fetch all events
router.get("/calendar", async (req, res) => {
  try {
    // Retrieve all events from MongoDB
    const events = await Calendar.find();
    
    // Send events as a response
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events", error);
    res.status(500).json({ error: "Server error while fetching events" });
  }
});

// router.post("/send-email", async (req, res) => {
//   const { email } = req.body;

//   if (!req.body.email) {
//     return res.status(400).send("Recipient email is required.");
//   }
//   // Email options
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Suivi de notre conversation',
//     text: `Cher(e) coach,\n\nMerci pour notre conversation récente. Si vous avez des questions ou besoin de plus d'informations, n'hésitez pas à me contacter.\n\nCordialement,\nL'équipe GOKO`,
//   };

//   try {
//     // Send the email
//     await transporter.sendMail(mailOptions);
//     res.status(200).json({ message: "Email sent successfully" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res.status(500).json({ message: "Error sending email" });
//   }
// });
router.post("/send-email", async (req, res) => {
  const { email, signature, prenom } = req.body;

  if (!email) {
    return res.status(400).send("Recipient email is required.");
  }
  console.log('email & signature & prenom', email, prenom, signature)

  // Prepare the email content with signature
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Rejoignez GokoSports - Partagez votre expertise et développez votre clientèle !',
    html: `
      <p>Bonjour ${prenom},</p>
      <p>Nous sommes ravis de vous accueillir sur GokoSports, la plateforme qui met en relation des coachs de qualité avec des sportifs en quête de progrès.</p>
      <p>GokoSports vous permet de :</p>
      <ul>
        <li>Accéder à une communauté grandissante de sportifs motivés.</li>
        <li>Développer votre clientèle sans vous soucier des démarches administratives.</li>
        <li>Bénéficier de visibilité et d'outils pour gérer facilement vos séances de coaching.</li>
      </ul>
      <p>En rejoignant notre réseau, vous aurez la possibilité de transformer votre passion en une activité durable et de toucher un public encore plus large.</p>
      <p>Pour commencer, rien de plus simple : créez votre profil en quelques minutes et commencez à coacher des clients dès aujourd'hui !</p>
      <p>Pour toute question, n’hésitez pas à nous contacter. Notre équipe est à votre disposition pour vous aider à tirer le meilleur parti de GokoSports.</p>
      <p>Sportivement,<br />
      L'équipe GokoSports</p>
      <p><img src="data:image/png;base64,${signature}" alt="Signature" /></p>
    `,
  };
  
  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
});


module.exports = router;