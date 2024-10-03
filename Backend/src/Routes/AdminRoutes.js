const express = require('express');
const router = express.Router();
const {
    profile,
    getAllAdmins,
    getAdminById,
    createAdmin,
    updateAdminById,
    deleteAdminById
} = require('../Controllers/AdminController');
const { adMed, loginClient, logout } = require('../Controllers/authController');

router.post('/login', adMed);
router.post('/loginClient', loginClient);
router.get('/profile', profile);
router.put('/:id', updateAdminById);
router.post('/logout', logout);

const { authenticateUser, authorize } = require('../Middlewares/adminMiddleware');

router.post('/', createAdmin);
router.get('/', getAllAdmins);

// Use authenticateUser middleware for all routes below
router.use(authenticateUser);

router.get('/:id', authorize(['Admin']), getAdminById);
router.put('/:id', updateAdminById);
router.delete('/:id', authorize(['Admin']), deleteAdminById);

module.exports = router;
