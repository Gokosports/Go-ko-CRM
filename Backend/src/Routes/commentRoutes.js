const express = require('express');
const router = express.Router();
const {
    addComment,
    getComments,
    deleteComment,
    updateComment
} = require('../Controllers/CommentController'); // Adjust the path if necessary

// Routes for client comments
router.post('/clients/:clientId/comments', addComment);
router.get('/clients/:clientId/comments', getComments);
router.delete('/clients/:clientId/comments/:commentId', deleteComment);
router.put('/clients/:clientId/comments/:commentId', updateComment);

module.exports = router;
