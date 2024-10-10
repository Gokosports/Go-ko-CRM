const Coach = require('../Models/CoachModel');

// Create a new coach
exports.createCoach = async (req, res) => {
    try {
        const newCoach = new Coach(req.body);
         // Check if the logged-in user is a commercial and assign them to the commercial field
         if (req.user && req.user.role === 'Commercial') {
            newCoach.commercial = req.user.userId;
        }
        await newCoach.save();
        res.status(201).json(newCoach);
    } catch (error) {
        console.error('Error creating coach:', error.message);
        res.status(400).json({ message: error.message });
    }
};

  
// Get all coaches
exports.getCoaches = async (req, res) => {
    try {
        let coaches;
        if (req.user && req.user.role === 'Commercial') {
            // Si l'utilisateur est un commercial, ne montrer que les coachs qui lui sont affectés
            coaches = await Coach.find({ commercial: req.user.userId }).populate('speciality').populate('commercial');
        } else {
            // Sinon, montrer tous les coachs (pour les admins)
            coaches = await Coach.find().populate('speciality').populate('commercial');
        }
        res.json(coaches);
    } catch (error) {
        console.error('Error retrieving coaches:', error); // Log l'erreur
        res.status(500).send('Error retrieving coaches');
    }
};
// Get a coach by ID
exports.getCoachById = async (req, res) => {
    console.log('Request received with ID:', req.params.id);
    try {
        const coach = await Coach.findById(req.params.id).populate('speciality').populate('commercial');
        if (!coach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.status(200).json(coach);
    } catch (error) {
        console.error('Error fetching coach by ID:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Update a coach
exports.updateCoach = async (req, res) => {
    try {
        const updatedCoach = await Coach.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('speciality')
            .populate('commercial');
        if (!updatedCoach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.status(200).json(updatedCoach);
    } catch (error) {
        console.error('Error updating coach:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// Delete a coach
exports.deleteCoach = async (req, res) => {
    try {
        const deletedCoach = await Coach.findByIdAndDelete(req.params.id);
        if (!deletedCoach) {
            return res.status(404).json({ message: 'Coach not found' });
        }
        res.status(200).json({ message: 'Coach deleted successfully' });
    } catch (error) {
        console.error('Error deleting coach:', error.message);
        res.status(500).json({ message: error.message });
    }
};

// Import coaches
exports.importCoaches = async (req, res) => {
    const coaches = req.body;

    try {
        console.log('Importing coaches:', coaches);
        const savedCoaches = await Coach.insertMany(coaches);
        res.status(200).json(savedCoaches);
    } catch (error) {
        console.error('Error importing coaches:', error.message);
        res.status(500).json({ message: 'Error importing coaches', error });
    }
};

// Assigner un coach à un commercial
exports.assignCoachToCommercial = async (req, res) => {
    const { coachIds, commercialId } = req.body;

    try {
        await Coach.updateMany(
            { _id: { $in: coachIds } },
            { commercial: commercialId },
            { new: true }
        );

        const updatedCoaches = await Coach.find({ _id: { $in: coachIds } })
            .populate('speciality')
            .populate('commercial');

        res.status(200).json(updatedCoaches);
    } catch (error) {
        console.error('Error assigning coaches to commercial:', error.message);
        res.status(500).json({ message: 'Error assigning coaches to commercial', error });
    }
};

// Récupérer les coachs assignés à un commercial
exports.getCoachesByCommercial = async (req, res) => {
    const { commercialId } = req.params;

    try {
        const assignedCoaches = await Coach.find({ commercial: commercialId })
            .populate('speciality')
            .populate('commercial');

        res.status(200).json(assignedCoaches);
    } catch (error) {
        console.error('Error fetching assigned coaches:', error.message);
        res.status(500).json({ message: 'Error fetching assigned coaches', error });
    }
};


exports.unassignCoachFromCommercial = async (req, res) => {
    const { coachIds } = req.body;

    try {
        await Coach.updateMany(
            { _id: { $in: coachIds } },
            { $unset: { commercial: "" } }, // Désaffecte le commercial en supprimant le champ
            { new: true }
        );

        const updatedCoaches = await Coach.find({ _id: { $in: coachIds } })
            .populate('speciality')
            .populate('commercial');

        res.status(200).json(updatedCoaches);
    } catch (error) {
        console.error('Error unassigning coaches from commercial:', error.message);
        res.status(500).json({ message: 'Error unassigning coaches from commercial', error });
    }
};

exports.updateCoachCategory = async (req, res) => {
    const { id } = req.params;
    const { filterType, categoryComment } = req.body;
  
    try {
      const client = await Coach.findByIdAndUpdate(
        id,
        { type: filterType, categoryComment: categoryComment || "N/A" },
        { new: true }
      );
      if (client) {
        res.json({ message: 'Filter type and comment updated successfully', client });
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error updating client category', error });
    }
};

exports.getChoachFilterPreference = async (req, res) => {
    const { id } = req.params;
  
    try {
      const client = await Coach.findById(id);
      if (client) {
        res.json({ filterType: client.type, categoryComment: client.categoryComment || "N/A" });
      } else {
        res.status(404).json({ message: 'Client not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching client preference', error });
    }
};
