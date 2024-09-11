const Admin = require('../Models/AdminModel');
const bcrypt = require('bcrypt');

// Profile
const profile = async (req, res) => {
    const id = req.idU;
    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
};

// Get all Admins
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.status(200).json(admins);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
};

// Create an Admin
const createAdmin = async (req, res) => {
    const { nom, prenom, email, password, imageUrl } = req.body;
    try {
        // Check if the email is already in use
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            nom,
            prenom,
            email,
            password: hashedPassword,
            imageUrl // Save the image URL directly
        });
        const savedAdmin = await newAdmin.save();
        res.status(201).json(savedAdmin);
    } catch (error) {
        res.status(400).json({ message: 'Error: ' + error.message });
    }
};

// Get Admin by ID
const getAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
};

// Update Admin by ID
const updateAdminById = async (req, res) => {
    const { id } = req.params;
    const { nom, prenom, email, password, imageUrl } = req.body;

    try {
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        const updateFields = { nom, prenom, email, imageUrl };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.password = hashedPassword;
            //console.log(updateFields);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(id, updateFields, { new: true });
        res.status(200).json(updatedAdmin);
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
};

// Delete Admin by ID
const deleteAdminById = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteAdmin = await Admin.findByIdAndDelete(id);
        if (!deleteAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error: ' + error.message });
    }
};

module.exports = {
    profile,
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdminById,
    deleteAdminById
};
