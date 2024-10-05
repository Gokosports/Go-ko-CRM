const express = require('express');
const router = express.Router();
const ContractController = require('../Controllers/ContractController');
const fileUpload = require('express-fileupload');

router.use(fileUpload());


router.post('/upload', ContractController.createContract);
router.post('/uploads', ContractController.createDevis);
router.get('/', ContractController.getContract);
router.post('/planning', ContractController.createPlanning);



module.exports = router;
