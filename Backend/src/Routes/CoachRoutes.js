const express = require('express');
const router = express.Router();
const { getCoaches, createCoach, getCoachById, updateCoach, deleteCoach, importCoaches, assignCoachToCommercial ,unassignCoachFromCommercial} = require('../Controllers/CoachController');
const { authenticateUser, authorize } = require('../Middlewares/adminMiddleware');


// Route to create a new coach
router.post('/', authenticateUser, authorize(['Admin']), createCoach);

// Route to get all coaches (with authentication and filtering)
router.get('/', authenticateUser, getCoaches);

// Route to get a coach by ID
router.get('/:id', authenticateUser, getCoachById);

// Route to update a coach by ID
router.put('/:id', authenticateUser, authorize(['Admin']), updateCoach);

// Route to delete a coach by ID
router.delete('/:id', authenticateUser, authorize(['Admin']), deleteCoach);

// Route to import coaches
router.post('/import',authenticateUser, authorize(['Admin']), importCoaches);

// Route to assign coaches
router.post('/assign-coaches', authenticateUser, authorize(['Admin']),assignCoachToCommercial);
router.post('/unassign-coaches', authenticateUser, authorize(['Admin']),unassignCoachFromCommercial);


module.exports = router;
