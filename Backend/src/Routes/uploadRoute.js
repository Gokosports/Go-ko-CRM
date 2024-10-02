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
    const fileName = `contrats/${Date.now()}-${path.basename(file.originalname)}`; // Change here
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
  const { email, fullnameCoach, fullnameCommercial} = req.body;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Découvrez GOKO – L\'application qui connecte coachs et sportifs pour optimiser votre activité!',
    html: `
          <img src="https://firebasestorage.googleapis.com/v0/b/goko-app.appspot.com/o/contrats%2Fgoko.png?alt=media&token=d474ecec-b028-4626-9540-a7edc387fe22" alt="Image" style="width: 50px; height: 50px; display: block;"/>
      <p>Bonjour ${fullnameCoach},</p>
      <p>Je vous présente GOKO, une application innovante spécialement conçue pour mettre en relation les coachs sportifs et les entités sportives avec des sportifs de tous niveaux.</p>
      <p>GOKO offre une plateforme unique pour promouvoir votre activité de coach et optimiser votre gestion au quotidien grâce à de nombreuses fonctionnalités adaptées à vos besoins. En rejoignant GOKO, vous aurez accès à des outils performants qui vous permettront de :</p>
      <ul>
        <li>Accroître votre visibilité auprès d’une large communauté de sportifs.</li>
        <li>Gérer facilement vos rendez-vous et vos plannings en ligne.</li>
        <li>Faciliter la prise de contact avec de nouveaux clients potentiels.</li>
        <li>Promouvoir vos services (cours, programmes, conseils) grâce à des options de personnalisation de votre profil.</li>
        <li>Bénéficier de retours d’expérience et de recommandations pour renforcer votre réputation.</li>
        <li>Et bien plus encore !</li>
      </ul>
      <p>Que vous soyez coach sportif indépendant ou affilié à une entité sportive, GOKO vous aide à développer votre activité en facilitant la rencontre avec des sportifs qui recherchent vos compétences, vos conseils et votre savoir-faire.</p>
      <p>Nous serions ravis de vous en dire plus sur GOKO et comment cette application peut répondre à vos attentes. Si vous souhaitez plus d’informations ou avez des questions, n’hésitez pas à nous contacter.</p>
      <p>Dans l'attente d'échanger avec vous, je vous remercie pour votre attention et reste à votre disposition pour convenir d’un rendez-vous ou d’une démonstration de l’application.</p>
      <p>Cordialement,<br />
      ${fullnameCommercial}<br />
      GOKO Team</p>
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

router.post("/send-email-command", async (req, res) => {
  const { email, fullnameCoach, fullnameCommercial} = req.body;

  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bienvenue sur GOKO – Merci pour votre confiance !',
    html: `
      <p>Bonjour ${fullnameCoach},</p>
      <img src="https://firebasestorage.googleapis.com/v0/b/goko-app.appspot.com/o/contrats%2Fistockphoto-636887598-612x612.jpg?alt=media&token=a00092b2-499d-4751-9bcf-9814ff15e08c" alt="Image" />
      <p>Nous sommes ravis de vous compter parmi la communauté GOKO, et nous vous remercions sincèrement pour la confiance que vous nous accordez. En rejoignant notre plateforme, vous faites un grand pas vers le développement de votre activité et l’optimisation de vos interactions avec les sportifs de tous niveaux.</p>
      <p>Grâce à votre abonnement, vous avez désormais accès à toutes les fonctionnalités qui font de GOKO une application unique pour les coachs et entités sportives :</p>
      <ul>
        <li>Gestion simplifiée de vos rendez-vous et de votre agenda.</li>
        <li>Visibilité accrue auprès d’une large communauté de sportifs en quête de coaching.</li>
        <li>Outils de promotion pour mettre en avant vos services, programmes et offres spéciales.</li>
        <li>Système de recommandation pour renforcer votre réputation et attirer de nouveaux clients.</li>
        <li>Et bien d'autres fonctionnalités qui faciliteront votre quotidien.</li>
      </ul>
      <p>Nous sommes là pour vous accompagner dans l’utilisation de l’application et vous assurer une expérience optimale. Si vous avez la moindre question, ou si vous souhaitez découvrir des astuces pour tirer le meilleur parti de GOKO, notre équipe est à votre disposition.</p>
      <p>Encore une fois, un grand merci pour votre confiance. Nous sommes impatients de vous voir grandir au sein de la communauté GOKO et de contribuer à votre réussite !</p>
      <p>À très bientôt sur GOKO !</p>
      <p>Cordialement,<br />
      ${fullnameCommercial}<br />
      GOKO Team</p>
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