const express = require('express');
const router = express.Router();
const { getCoaches, createCoach, getCoachById, updateCoach, deleteCoach, importCoaches, assignCoachToCommercial ,unassignCoachFromCommercial, updateCoachCategory, getChoachFilterPreference, getCoachesByCommercial, getCoachesByFilter} = require('../Controllers/CoachController');
const { authenticateUser, authorize } = require('../Middlewares/adminMiddleware');


// Route to create a new coach
router.post('/', authenticateUser, authorize(['Admin', 'Commercial']), createCoach);

// Route to get all coaches (with authentication and filtering)
router.get('/',  getCoaches);

// Route to get a coach by ID
router.get('/:id', authenticateUser,  authorize(['Admin', 'Commercial']), getCoachById);

// Route to update a coach by ID
router.put('/:id', authenticateUser, authorize(['Admin', 'Commercial']), updateCoach);

// Route to delete a coach by ID
router.delete('/:id', authenticateUser, authorize(['Admin']), deleteCoach);

// Route to import coaches
router.post('/import',authenticateUser, authorize(['Admin']), importCoaches);


router.put('/:id/filterCoach', authenticateUser, authorize(['Admin', 'Commercial']), updateCoachCategory);
router.get('/:id/filteredCoach', authenticateUser, authorize(['Admin', 'Commercial']), getChoachFilterPreference);

// Route to assign coaches
router.post('/assign-coaches', authenticateUser, authorize(['Admin']),assignCoachToCommercial);
router.get('/assigned/:commercialId', authenticateUser, getCoachesByCommercial);
router.post('/unassign-coaches', authenticateUser, authorize(['Admin']),unassignCoachFromCommercial);


module.exports = router;
