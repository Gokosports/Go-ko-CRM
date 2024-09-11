const Commercial = require('../Models/Commercial');
const bcrypt = require('bcrypt');



// // Profile
// const profile = async (req, res) => {
//     const id = req.idU;
//     try {
//         const commercial = await Commercial.findById(id);
//         if (!commercial) {
//             res.status(404).send('Commercial not Found');
//         } else {
//             res.status(200).json(commercial);
//         }
//     } catch (error) {
//         res.status(500).send('Error: ' + error.message);
//     }
// };


// Créer un commercial
const createCommercial = async (req, res) => {
    const { nom, prenom, email, phone, imageUrl, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newCommercial = new Commercial({ nom, prenom, email, phone, imageUrl, password: hashedPassword });
        const savedCommercial = await newCommercial.save();
        res.status(201).json(savedCommercial);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la création du commercial', details: error.message });
    }
};

// Récupérer tous les commerciaux
const getAllCommercials = async (req, res) => {
    try {
        const commercials = await Commercial.find();
        res.status(200).json(commercials);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
};

// Récupérer un commercial par son ID

const getCommercialById = async (req, res) => {
    try {
        const commercial = await Commercial.findById(req.params.id);
        if (!commercial) {
            return res.status(404).json({ message: 'Commercial not found' });
        }
        res.json(commercial);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching commercial', error });
    }
};


// Mettre à jour un commercial par son ID
const updateCommercialById = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, phone, imageUrl, password } = req.body;

    try {
        const updateData = { nom, prenom, email, phone, imageUrl };
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        const updatedCommercial = await Commercial.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCommercial) {
            return res.status(404).json({ message: 'Commercial non trouvé' });
        }

        res.status(200).json(updatedCommercial);
    } catch (error) {
        res.status(400).json({ message: 'Erreur lors de la mise à jour du commercial', details: error.message });
    }
};

// Supprimer un commercial par son ID
const deleteCommercialById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCommercial = await Commercial.findByIdAndDelete(id);
        if (!deletedCommercial) {
            return res.status(404).json({ message: 'Commercial non trouvé' });
        }
        res.status(200).json({ message: 'Commercial supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', details: error.message });
    }
};

const changeStatus = async (req, res) => {
    const { id } = req.params;
    const { state } = req.body;
    try {
        const commercial = await Commercial.findById(id);
        if (!commercial) {
            return res.status(404).send('Commercial not found');
        }
        await commercial.updateOne({ state }); // Assuming state is the field you want to update
        res.status(200).send('Commercial status updated successfully');
    } catch (error) {
        res.status(500).send(error.message);
    }
}




module.exports = {
    // profile,
    createCommercial,
    getAllCommercials,
    getCommercialById,
    updateCommercialById,
    deleteCommercialById,
    changeStatus
};
