const Contract = require('../Models/ContractModel');
const fs = require('fs');
const path = require('path');

class ContractController {
  
  static async createContract(req, res) {
    try {
      if (!req.files || !req.files.pdf) {
        return res.status(400).send({ message: 'No PDF file uploaded' });
      }

      const pdfFile = req.files.pdf; // Assuming `pdf` is the field name for the uploaded file
      const uploadDir = path.join(__dirname, '..', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); // Create uploads directory if it doesn't exist
      }

      const pdfPath = path.join(uploadDir, pdfFile.name);
      pdfFile.mv(pdfPath, async (err) => {
        if (err) {
          return res.status(500).send({ message: 'File upload failed', error: err });
        }

        const contract = new Contract({ pdfPath });
        await contract.save();
        res.status(200).send({ message: 'Contract created and PDF uploaded', contract });
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).send({ message: 'Server error', error });
    }
  }

  static async getContract(req, res) {
    try {
      const contracts = await Contract.find();
      res.status(200).send({ message: 'Contracts retrieved successfully', contracts });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Error retrieving contracts' });
    }
  }

  static async createDevis(req, res) {
    try {
      if (!req.files || !req.files.pdf) {
        return res.status(400).send({ message: 'No PDF file uploaded' });
      }

      const pdfFile = req.files.pdf; // Assuming `pdf` is the field name for the uploaded file
      const uploadDir = path.join(__dirname, '..', 'uploads');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir); // Create uploads directory if it doesn't exist
      }

      const pdfPath = path.join(uploadDir, pdfFile.name);
      pdfFile.mv(pdfPath, async (err) => {
        if (err) {
          return res.status(500).send({ message: 'File upload failed', error: err });
        }

        const contract = new Contract({ pdfPath });
        await contract.save();
        res.status(200).send({ message: 'Devis created and PDF uploaded', contract });
      });
    } catch (error) {
      console.error('Error creating contract:', error);
      res.status(500).send({ message: 'Server error', error });
    }
  }


 
}

module.exports = ContractController;













