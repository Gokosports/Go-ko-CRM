const Coach = require('../Models/CoachModel');
const Client = require('../Models/ClientModel');
const Specialty = require('../Models/specialityModel'); // Ajuster le chemin si nécessaire

const getCounts = async (req, res) => {
    try {
        const coachCount = await Coach.countDocuments();
        const clientCount = await Client.countDocuments();
        const specialtyCount = await Specialty.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                coaches: coachCount,
                clients: clientCount,
                specialties: specialtyCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getCounts
};
