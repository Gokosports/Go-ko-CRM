const Coach = require('../Models/CoachModel');


// Ajouter un commentaire à un coach
exports.addCoachComment = async (req, res) => {
    try {
        const { commentaire, commercialId } = req.body;
        const { coachId } = req.params;

        if (!commercialId) {
            return res.status(400).json({ message: 'Commercial ID is required' });
        }

        const newComment = {
            commentaire,
            commercialId,
            date: new Date(),
        };

        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }

        coach.commentaires.push(newComment);
        await coach.save();
        const savedComment = coach.commentaires[coach.commentaires.length - 1]; // Get the last added comment
        res.status(201).json({ message: 'Comment added successfully to coach', comment: savedComment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};



// Obtenir les commentaires d'un coach
exports.getCoachComments = async (req, res) => {
    try {
        const { coachId } = req.params;
        const coach = await Coach.findById(coachId).populate('commentaires');
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.status(200).json(coach.commentaires);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Supprimer un commentaire d'un coach
exports.deleteCoachComment = async (req, res) => {
    try {
        const { coachId, commentId } = req.params;
        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        const comment = coach.commentaires.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        coach.commentaires.pull(commentId);
        await coach.save();
        res.status(200).json({ message: 'Comment deleted successfully from coach' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Mettre à jour un commentaire d'un coach
exports.updateCoachComment = async (req, res) => {
    try {
        const { coachId, commentId } = req.params;
        const { commentaire } = req.body;
        const coach = await Coach.findById(coachId);
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        const comment = coach.commentaires.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        comment.commentaire = commentaire;
        await coach.save();
        res.status(200).json({ message: 'Comment updated successfully for coach', comment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
