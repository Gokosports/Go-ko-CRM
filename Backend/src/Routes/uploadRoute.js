const express = require("express");
const multer = require("multer");
const path = require("path");
const { bucket } = require("../../firebase-config");
const Contract = require("../Models/ContractModel");
const nodemailer = require("nodemailer");
const Planning = require("../Models/PlanningModel");
const Coach = require('../Models/CoachModel');
const axios = require("axios");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const upload = multer({ storage: multer.memoryStorage() });


// Helper function to upload file to Firebase Storage
const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = `contrats/${Date.now()}-${path.basename(file.originalname)}`;
    const fileUpload = bucket.file(fileName);
    

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    console.log("Stream:", stream);

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

const fetchPDFBase64 = async (url) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const base64 = Buffer.from(response.data).toString('base64');
  return base64;
};

router.post('/upload', upload.single('pdf'), async (req, res) => {
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

  if (!req.body.raisonsociale) {
    return res.status(400).send("raisonsociale is required");
  }
  if (!req.body.phone) {
    return res.status(400).send('phone is required')
  }


  try {
    // Upload the PDF to Firebase and get the URL
    const fileUrl = await uploadFile(req.file);
      const newContract = new Contract({
      fileName: req.file.originalname,
      fileUrl: fileUrl,
      email: req.body.email,
      clientName: req.body.clientName,
      commercialName: req.body.commercialName,
      contractDuration: req.body.contractDuration,
      raisonsociale: req.body.raisonsociale,
      phone: req.body.phone
    });
    const savedContract = await newContract.save();
    console.log("Contract saved to database:", savedContract);

    // Fetch the PDF as Base64 from Firebase Storage URL
    const base64File = await fetchPDFBase64(fileUrl);


    // Prepare the request data for DocuSeal
    const requestData = {
      name: req.file.originalname,
     
      documents: [
        {
          name: req.file.originalname,
          file: base64File,
          fields: [
            {
              name: "Signature",
              areas: [{ x: 390, y: 740, w: 160, h: 50, page: 1 }],
              type: "signature",
            },
            {
              name: "Texte",
              areas: [{ x: 126, y: 560, w: 430, h: 22, page: 1 }],
            },
            {
              name: "Initials",
              areas: [{ x: 25, y: 810, w: 40, h: 30, page: 1 }],
              type: "initials"
            },
            {
              name: "Initials",
              areas: [{ x: 25, y: 810, w: 40, h: 30, page: 2 }],
             type: "initials"
            },
            {
              name: "Initials",
              areas: [{ x: 25, y: 810, w: 40, h: 30, page: 3 }],
              type: "initials"
            },
            {
              name: "Signature",
              areas: [{ x: 380, y: 720, w: 180, h: 50, page: 4 }],
              type: "signature",
            },
          ],
        },
      ],
      
    };

    // Send the request to DocuSeal
    const response = await axios.post('https://api.docuseal.eu/templates/pdf', requestData, {
      headers: {
        'X-Auth-Token': 'zHX6ZwEdSjqUkNqEtm8VHxFufCWCnesi5pnJdPRuXur',
        'Content-Type': 'application/json',
      },
    });

     // Prepare the submission data with the template_id and email details
     const submissionData = {
      template_id: response.data.id,  // Use the template ID from the previous request
      send_email: true,
      submitters: [{ role: 'First Party', email: req.body.email }]
    };

      // Send the submission request to DocuSeal
      const sendEmailResponse = await axios.post('https://api.docuseal.eu/submissions', submissionData, {
        headers: {
          'X-Auth-Token': 'zHX6ZwEdSjqUkNqEtm8VHxFufCWCnesi5pnJdPRuXur',
          'Content-Type': 'application/json',
        },
      });

       // Respond with the result
    res.status(200).json({
      message: 'File uploaded successfully, and email sent',
      firebaseUrl: fileUrl,
      response: response.data,
      emailResponse: sendEmailResponse.data
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (error.response) {
      return res.status(error.response.status).json({
        message: 'Error uploading PDF to DocuSeal',
        error: error.response.data || error.response.statusText,
      });
    }
    res.status(500).json({
      message: 'Error uploading PDF',
      error: error.message,
    });
  }
});

// Update contract status
router.patch('/contracts/:id', async (req, res) => {
  try {
    const contractId = req.params.id;
    const { status } = req.body;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    contract.status = status || contract.status;
    await contract.save();

    res.status(200).json({ message: 'Contract status updated successfully', contract });
  } catch (error) {
    console.error('Error updating contract status:', error);
    res.status(500).json({ message: 'Error updating contract status' });
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
// }



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




router.post('/planning', async (req, res) => {
  try {
    const { coachId, commercialName, time, callSituation, comment } = req.body;
    const newPlanning = new Planning({ coachId, commercialName, time, callSituation, comment });
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

router.get('/planning', async (req, res) => {
  try {
    const AllPlannings = await Planning.find();
    res.status(200).json(AllPlannings)
  } catch (error) {
    console.error('Error fetching planning entries for coach:', error);
    res.status(500).json({ message: 'Error fetching planning entries.' });
  }
})
// PUT /planning/:id - Update a planning entry by ID
router.put('/planning/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { time, callSituation, comment } = req.body;
    
    const updatedPlanning = await Planning.findByIdAndUpdate(
      id,
      { time, callSituation, comment },
      { new: true } // This option returns the updated document
    );

    if (!updatedPlanning) {
      return res.status(404).send({ message: 'Planning not found' });
    }

    res.status(200).send({ message: 'Planning updated', updatedPlanning });
  } catch (error) {
    console.error('Error updating planning:', error);
    res.status(500).send({ message: 'Error updating planning' });
  }
});

// DELETE /planning/:id - Delete a planning entry by ID
router.delete('/planning/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPlanning = await Planning.findByIdAndDelete(id);

    if (!deletedPlanning) {
      return res.status(404).send({ message: 'Planning not found' });
    }

    res.status(200).send({ message: 'Planning deleted', deletedPlanning });
  } catch (error) {
    console.error('Error deleting planning:', error);
    res.status(500).send({ message: 'Error deleting planning' });
  }
});



router.post("/send-email", async (req, res) => {
  const { email, fullnameCoach, fullnameCommercial, phone, emailc } = req.body;

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
      
      <br style="margin-bottom: 20px;" />

      ${fullnameCommercial}<br />
      

      ${emailc} - ${phone}<br />


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
  const { email, fullnameCoach, fullnameCommercial, phone, emailc} = req.body;

  console.log('emailc', emailc)
  console.log('phone', phone)
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Bienvenue sur GOKO – Merci pour votre confiance !',
    html: `
      <img src="https://firebasestorage.googleapis.com/v0/b/goko-app.appspot.com/o/contrats%2Fistockphoto-636887598-612x612.jpg?alt=media&token=a00092b2-499d-4751-9bcf-9814ff15e08c" alt="Image" />
      
      <p>Bonjour ${fullnameCoach},</p>

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

<br style="margin-bottom: 20px;" />

      ${fullnameCommercial}<br />

       ${emailc} - ${phone}<br />

      GOKO Team</p>.
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

router.get('/search', async (req, res) => {
  try {
    const { search } = req.query; // Get the search query from the request
    const upperSearch = search.trim().toUpperCase();
    const numericSearch = parseInt(search.trim(), 10);
    console.log("Search Query:", search); // Log the search query
    console.log("Search Query:", search.trim());
    // Prepare the query object
    const query = {
      $or: [
        { raisonsociale: { $regex: upperSearch, $options: "i" } },
        { nom: { $regex: upperSearch, $options: "i" } },
        { prenom: { $regex: upperSearch, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { siret: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
    console.log("Query:", query); // Log the query object
    if (!isNaN(numericSearch)) {
      query.$or.push({ codepostal: numericSearch }); // Add the codepostal condition
    }
    

    const coaches = await Coach.find(query).populate('commercial');
    // const coaches = await Coach.find(query); // Perform the query
    

    if (coaches.length === 0) {
      console.log("No coaches found for the search query.");
    } else {
      console.log("Filtered Coaches:", coaches); // Log filtered coaches
    }

    res.json(coaches); // Respond with the list of filtered coaches
  } catch (error) {
    console.error("Error fetching coaches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;