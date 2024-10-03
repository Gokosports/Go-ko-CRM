const express = require('express');
const router = express.Router();
const {
    createCommercial,
    getAllCommercials,
    getCommercialById,
    updateCommercialById,
    deleteCommercialById,
    // profile
} = require('../Controllers/CommercialController'); // Ajustez le chemin si nécessaire


// const {authenticateUser,authorize} = require('../Middlewares/adminMiddleware');

// Route pour créer un nouveau commercial
router.post('/', createCommercial);
//router.get('/profile', profile);

// Route pour récupérer tous les commerciaux
router.get('/', getAllCommercials);

// Route pour récupérer un commercial par son ID
router.get('/:id', getCommercialById);

// router.use(authenticateUser);

//router.patch('/:id', authorize(['Admin']), changeStatus);


// Route pour mettre à jour un commercial par son ID
router.put('/:id', updateCommercialById);

// Route pour supprimer un commercial par son ID
router.delete('/:id', deleteCommercialById);

module.exports = router;
