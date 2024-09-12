const express = require('express');
const ContractController = require('../Controllers/ContractController');

const Router = express.Router();

app.use(express.json());

Router.post('/createContrat', ContractController.createContract);
Router.get('/getContrat', ContractController.getContract);



