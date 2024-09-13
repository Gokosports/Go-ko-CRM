const express = require('express');
const router = express.Router();
const ContractController = require('../Controllers/ContractController');
const fileUpload = require('express-fileupload');

router.use(fileUpload());


router.post('/upload', ContractController.createContract);
router.get('/', ContractController.getContract);


module.exports = router;
