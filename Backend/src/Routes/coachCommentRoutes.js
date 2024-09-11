const express = require('express');
const router = express.Router();
const {
    addCoachComment,
    getCoachComments,
    deleteCoachComment,
    updateCoachComment
} = require('../Controllers/CoachCommentController');

// Route pour ajouter un commentaire à un coach
router.post('/:coachId/comments', addCoachComment);

// Route pour récupérer les commentaires d'un coach
router.get('/:coachId/comments', getCoachComments);

// Route pour supprimer un commentaire d'un coach
router.delete('/:coachId/comments/:commentId', deleteCoachComment);

// Route pour mettre à jour un commentaire d'un coach
router.put('/:coachId/comments/:commentId', updateCoachComment);

module.exports = router;
