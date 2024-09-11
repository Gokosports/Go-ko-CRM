const Speciality = require('../Models/specialityModel');

// Controller for getting all specialities
async function GetAllSpecialities(req, res) {
    try {
        const specialities = await Speciality.find({});
        res.json(specialities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


async function GetSpecialityByName(req, res) {
    try {
        let { nom } = req.params;
        const speciality = await Speciality.find({ nom });
        res.json(speciality);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Controller for creating a new speciality
async function CreateSpeciality(req, res) {
    try {
        const { nom, description } = req.body;
        const NewSpeciality = new Speciality({ nom, description });
        const SavedSpeciality = await NewSpeciality.save();
        res.status(201).json(SavedSpeciality);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// Controller for updating a speciality
async function UpdateSpeciality(req, res) {
    try {
        let { id } = req.params;
        const { nom, description } = req.body;
        const updatedSpeciality = await Speciality.findByIdAndUpdate(id, { nom, description }, { new: true });
        if (!updatedSpeciality) throw new Error('Speciality not found');
        res.json(updatedSpeciality);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

async function DeleteSpeciality(req, res) {
    try {
        let { id } = req.params;
        const deletedSpeciality = await Speciality.findByIdAndDelete(id);
        if (!deletedSpeciality) throw new Error('Speciality not found');
        res.json({ message: 'Speciality deleted' });
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

module.exports = {
    GetAllSpecialities,
    GetSpecialityByName,
    CreateSpeciality,
    UpdateSpeciality,
    DeleteSpeciality
};
