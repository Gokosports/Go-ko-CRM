const fs = require('fs'); // Ensure fs is imported
const { jsPDF } = require('jspdf');
const path = require('path');

class ContractController {
  static async createContract(req, res) {
    try {
        const contractData = req.body;
        const doc = new jsPDF();
  
        // Add content to PDF
        doc.setFontSize(16);
        doc.text("Contrat d'Abonnement au Service de Coaching", 40, 40);
  
        // Add contract data to PDF
        doc.setFontSize(12);
        let yPosition = 60;
        for (const [key, value] of Object.entries(contractData)) {
          doc.text(`${key}: ${value}`, 40, yPosition);
          yPosition += 10; // Adjust spacing between lines
        }
  
        // Save PDF to server
        const pdfFilePath = path.join(__dirname, 'pdfs', `contract_${Date.now()}.pdf`);
        console.log('Saving contract to:', pdfFilePath);
        doc.save(pdfFilePath);
  
        // Send URL to client
        res.json({
          pdfUrl: `/getContrat?file=${encodeURIComponent(path.basename(pdfFilePath))}`,
        });
      } catch (error) {
        console.error('Error creating contract:', error);
        res.status(500).send('Error creating contract');
      }
  }

  static async getContract(req, res) {
    const file = path.join(__dirname, 'pdfs', req.query.file);
    if (fs.existsSync(file)) {
      res.sendFile(file);
    } else {
      res.status(404).send('File not found');
    }
  }
}

module.exports = ContractController;
