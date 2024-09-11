const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Client = require('../Models/ClientModel');
const Admin = require('../Models/AdminModel');
const Commerciale = require('../Models/Commercial');

// Function to log details for debugging bcrypt
const debugBcrypt = async (plainTextPassword, hashedPassword) => {
    const match = await bcrypt.compare(plainTextPassword, hashedPassword);
    console.log(`Comparing passwords: entered: ${plainTextPassword}, stored (hashed): ${hashedPassword}, match: ${match}`);

    const manuallyHashedPassword = await bcrypt.hash(plainTextPassword, 10);
    console.log(`Manually hashed entered password: ${manuallyHashedPassword}`);

    const manualMatch = manuallyHashedPassword === hashedPassword;
    console.log(`Manual match: ${manualMatch}`);

    return match;
};

const loginClient = async (req, res) => {
    try {
        const client = await Client.findOne({ email: req.body.email });

        if (!client) {
            return res.status(404).send('Ce compte de Client nous le trouve pas');
        }

        const match = await debugBcrypt(req.body.password, client.password);
        
        if (!match) {
            return res.status(401).send('Incorrect password');
        }

        const token = jwt.sign({ userId: client._id, role: 'client' }, 'secret_key', { expiresIn: '24h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const adMed = async (req, res) => {
    try {
        console.log('Request body:', req.body);

        const commercial = await Commerciale.findOne({ email: req.body.email });
        if (commercial) {
            const match = await debugBcrypt(req.body.password, commercial.password);

            if (!match) {
                return res.status(401).json({ message: 'Incorrect commercial password' });
            }

            const token = jwt.sign(
                { userId: commercial._id, role: 'Commercial', name: commercial.nom + " " + commercial.prenom },
                process.env.JWT_SECRET || 'default_secret_key',
                { expiresIn: '24h' }
            );
            console.log('Commercial login successful:', token);
            return res.json({ token });
        }

        const admin = await Admin.findOne({ email: req.body.email });
        if (!admin) {
            console.log('Admin not found');
            return res.status(401).json({ message: 'Incorrect email or password' });
        }

        const match = await debugBcrypt(req.body.password, admin.password);

        if (!match) {
            return res.status(401).json({ message: 'Incorrect admin password' });
        }

        const token = jwt.sign(
            { userId: admin._id, role: 'Admin', name: admin.nom + " " + admin.prenom },
            process.env.JWT_SECRET || 'default_secret_key',
            { expiresIn: '24h' }
        );
        console.log('Admin login successful:', token);
        return res.json({ token });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = { adMed, loginClient };
