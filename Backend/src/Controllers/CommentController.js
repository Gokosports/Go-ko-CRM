const Client = require('../Models/ClientModel');
const Comment = require('../Models/Comment');

// Ajouter un commentaire à un client
exports.addComment = async (req, res) => {
    try {
        const { commentaire, commercialId } = req.body;
        const { clientId } = req.params;

        if (!commercialId) {
            return res.status(400).json({ message: 'commercialId is required' });
        }

        const newComment = {
            commentaire,
            commercialId,
            date: new Date(),
        };

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        client.commentaires.push(newComment);
        await client.save();
        
        res.status(201).json({ message: 'Comment added successfully to client', comment: newComment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Obtenir les commentaires d'un client
exports.getComments = async (req, res) => {
    try {
        const { clientId } = req.params;
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client.commentaires);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un commentaire
exports.updateComment = async (req, res) => {
    try {
        const { clientId, commentId } = req.params;
        const { commentaire, commercialId } = req.body;

        if (!commercialId) {
            return res.status(400).json({ message: 'commercialId is required' });
        }

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const comment = client.commentaires.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        comment.commentaire = commentaire;
        comment.commercialId = commercialId;
        await client.save();

        res.status(200).json({ message: 'Comment updated successfully for client', comment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un commentaire
exports.deleteComment = async (req, res) => {
    try {
        const { clientId, commentId } = req.params;

        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const comment = client.commentaires.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        client.commentaires.pull(commentId);
        await client.save();

        res.status(200).json({ message: 'Comment deleted successfully from client', comment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
