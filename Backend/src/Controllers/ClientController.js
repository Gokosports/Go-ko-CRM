const { default: mongoose } = require('mongoose');
const Client = require('../Models/ClientModel');
const Commercial = require('../Models/Commercial');
const bcrypt = require('bcrypt');
const xlsx = require('xlsx');

// Profile
const profile = async (req, res) => {
    const id = req.idU;
    try {
        const client = await Client.findById(id);
        if (!client) {
            res.status(404).send('Client not Found');
        } else {
            res.status(200).json(client);
        }
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Récupérer tous les clients
const getAllClients = async (req, res) => {
    try {
        const user = req.user; // L'utilisateur est extrait de la requête après vérification du JWT

        let clients;
        if (user.role === 'Commercial') {
            // Récupérer uniquement les clients assignés au commercial connecté
            clients = await Client.find({ commercial: user.userId }).populate('commercial');
        } else if (user.role === 'Admin') {
            // Récupérer tous les clients pour un administrateur
            clients = await Client.find().populate('commercial');
        }

        res.status(200).json(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};


// Créer un client
const createClient = async (req, res) => {
    const { nom, prenom, email, password, phone, sex, address, imageUrl, age, commercial } = req.body;

    try {
        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const newClient = new Client({ 
            nom, 
            prenom, 
            email, 
            password: hashedPassword, 
            phone, 
            sex, 
            address, 
            imageUrl,
            age, 
            // type,
            commercial
        });

        const savedClient = await newClient.save();
        console.log('Client créé avec succès', savedClient);
        res.status(201).send(savedClient);
       
    } catch (error) {
        res.status(400).send({ message: 'Erreur lors de la création du client', details: error.message });
    }
};

// Récupérer un client par son ID
const getClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const client = await Client.findById(id).populate('commercial');
        if (!client) {
            res.status(404).send('Client not Found');
        } else {
            res.status(200).send(client);
        }
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
};

// Mettre à jour un client par son ID
const updateClientById = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, password, phone, sex, address, imageUrl, age, commercial } = req.body;

    try {
        let updatedFields = { nom, prenom, email, phone, sex, address, imageUrl, age, commercial };
        
        if (password) {
            updatedFields.password = await bcrypt.hash(password, 10);
        }

        const updatedClient = await Client.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedClient) {
            return res.status(404).send('Client not found');
        }

        res.status(200).send(updatedClient);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Supprimer un client par son ID
const deleteClientById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedClient = await Client.findByIdAndDelete(id);
        if (!deletedClient) {
            res.status(404).send('Client not found');
        } else {
            res.status(200).send('Client deleted successfully');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Importer des clients
const importClients = async (req, res) => {
    try {
        const clients = req.body; // Les clients doivent être envoyés dans le corps de la requête
        console.log('Received the following data:', clients);

        if (!Array.isArray(clients)) {
            return res.status(400).send('Invalid data format: expected an array');
        }

        const savedClients = [];
        const errors = [];

        // Vérifiez les emails en double avant d'essayer de sauvegarder
        const emailSet = new Set();
        for (const clientData of clients) {
            if (!clientData.email || emailSet.has(clientData.email)) {
                errors.push({ clientData, message: 'Duplicate or null email' });
                continue;
            }
            emailSet.add(clientData.email);
        }

        for (const clientData of clients) {
            const { nom, prenom, email, phone, sex, address, age,  } = clientData;

            if (!nom || !prenom || !email || !phone || !sex || !address || !age ) {
                errors.push({ clientData, message: 'Missing required fields' });
                continue;
            }

            try {
                const newClient = new Client({
                    nom, prenom, email, phone, sex, address, age
                });
                const savedClient = await newClient.save();
                savedClients.push(savedClient);
            } catch (error) {
                errors.push({ clientData, message: error.message });
            }
        }

        if (errors.length > 0) {
            console.log('Errors:', errors);
            return res.status(400).json({ message: 'Some clients could not be imported', errors });
        }

        res.status(201).json(savedClients);
    } catch (error) {
        console.error('Error importing clients:', error);
        res.status(400).send({ message: 'Erreur lors de l\'importation des clients', details: error.message });
    }
};
// Fonction pour assigner des clients à un commercial

// const assignClients = async (req, res) => {
//     const { clientIds, commercialId } = req.body;

//     try {
//         const response = await Client.updateMany(
//             { _id: { $in: clientIds } },
//             { $set: { commercial: commercialId } },
//             { multi: true }
//         );
//         res.status(200).json({ response });
//         console.log('Clients affectés avec succès' , response);
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur lors de l\'affectation des clients', error });
//     }
// };
const assignClients = async (req, res) => {
    const { clientIds, commercialId } = req.body;

    try {
        // Ensure clientIds are valid ObjectId
        const validClientIds = clientIds.filter(id => mongoose.Types.ObjectId.isValid(id));
        
        if (!validClientIds.length) {
            return res.status(400).json({ message: 'No valid client IDs provided' });
        }

        const response = await Client.updateMany(
            { _id: { $in: validClientIds } },
            { $set: { commercial: commercialId } }
        );

        if (response.matchedCount === 0) {
            return res.status(404).json({ message: 'No clients found with the provided IDs' });
        }

        res.status(200).json({ response });
        console.log('Clients successfully assigned', response);
    } catch (error) {
        console.error('Error assigning clients:', error.message);  // Log error message
        console.error(error.stack);  // Log full error stack
        res.status(500).json({ message: 'Error assigning clients', error: error.message });
    }
};


// Désaffecter des clients d'un commercial
const unassignClients = async (req, res) => {
    const { clientIds } = req.body;

    try {
        await Client.updateMany(
            { _id: { $in: clientIds } },
            { $unset: { commercial: "" } },
            { multi: true }
        );
        res.status(200).json({ message: 'Clients désaffectés avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la désaffectation des clients', error });
    }
};

// Update client type (category) instead of preferredClientFilter
const updateClientCategory = async (req, res) => {
    const { id } = req.params;
    const { filterType } = req.body;
  
    try {
      const client = await Client.findByIdAndUpdate(
        id,
        { type: filterType },
        { new: true }
      );
      if (client) {
        res.json({ message: 'Filter type updated successfully', filterType: client.type });
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating filter preference', error });
    }
  };
  

// Get user filter preference (type)
const getUserFilterPreference = async (req, res) => {
    const { id } = req.params;
  
    try {
      const client = await Client.findById(id);
      console.log('Client:', client);  // Log the client for debugging
      if (client) {
        res.json({ filterType: client.type });  // Return the client's type
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching filter preference', error });
    }
  };
  


module.exports = {
    profile,
    getAllClients,
    createClient,
    getClientById,
    updateClientById,
    deleteClientById,
    importClients,
    assignClients,
    unassignClients,
    updateClientCategory,
    getUserFilterPreference
};


