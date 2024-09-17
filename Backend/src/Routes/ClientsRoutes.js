const express = require('express');
const router = express.Router();
const {
    profile,
    getAllClients,
    getClientById,
    createClient,
    updateClientById,
    deleteClientById,
    assignClients,
    importClients,
    unassignClients,
    updateClientCategory,
    getUserFilterPreference,

} = require('../Controllers/ClientController'); // Ajustez le chemin si nécessaire

const {
    addComment,
    getComments,
    deleteComment,
    updateComment
} = require('../Controllers/CommentController'); // Ajustez le chemin si nécessaire

const { authenticateUser, authorize } = require('../Middlewares/adminMiddleware');

// Route pour obtenir le profil du client connecté
router.get('/profile', authenticateUser, profile);

// Route pour obtenir tous les clients
router.get('/', authenticateUser, authorize(['Admin', 'Commercial']), getAllClients);

// Route pour obtenir un client par son ID
router.get('/:id', authenticateUser, authorize(['Admin', 'Commercial']), getClientById);

// Route pour créer un nouveau client
router.post('/', authenticateUser, authorize(['Admin','Commercial']), createClient);

// Route pour mettre à jour un client par son ID
router.put('/:id', authenticateUser, authorize(['Admin']), updateClientById);

// Route pour supprimer un client par son ID
router.delete('/:id', authenticateUser, authorize(['Admin']), deleteClientById);

// Route pour importer des clients
router.post('/import', authenticateUser, authorize(['Admin','Commercial']), importClients);

// Route pour assigner des clients à un commercial
router.post('/assign-clients', authenticateUser, authorize(['Admin']), assignClients);

// Route pour désaffecter des clients
router.post('/unassign-clients', authenticateUser, authorize(['Admin']), unassignClients);

// Update user filter preference
router.put('/:id/filter', authenticateUser, authorize(['Admin', 'Commercial']), updateClientCategory);
router.get('/:id/filtered', authenticateUser, authorize(['Admin', 'Commercial']), getUserFilterPreference);



// Route pour ajouter un commentaire à un client
router.post('/:clientId/comments', authenticateUser, authorize(['Admin', 'Commercial']), addComment);

// Route pour récupérer les commentaires d'un client
router.get('/:clientId/comments', authenticateUser, authorize(['Admin', 'Commercial']), getComments);

// Route pour supprimer un commentaire d'un client
router.delete('/:clientId/comments/:commentId', authenticateUser, authorize(['Admin']), deleteComment);

// Route pour mettre à jour un commentaire d'un client
router.put('/:clientId/comments/:commentId', authenticateUser, authorize(['Admin', 'Commercial']), updateComment);

module.exports = router;
