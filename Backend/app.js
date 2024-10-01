require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Add this line
const fileUpload = require('express-fileupload');
const app = express();
const path = require('path');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const DashboardRoutes = require('./src/Routes/dashboardRoutes');
const AdminRoutes = require('./src/Routes/AdminRoutes');
const CoachRoutes = require('./src/Routes/CoachRoutes');
const ClientRoutes = require('./src/Routes/ClientsRoutes');
const SpecialityRoutes = require('./src/Routes/SpecialityRoutes');

const commentRoutes = require('./src/Routes/commentRoutes'); // Ajustez le chemin si nécessaire
const coachCommentRoutes = require('./src/Routes/coachCommentRoutes');
const commercialRoutes = require('./src/Routes/commercialRoutes'); // Ajustez le chemin si nécessaire

const abonnementRoutes = require('./src/Routes/AbonnementRoutes');
const commandeRoutes = require('./src/Routes/CommandeRoutes');

const contractRoutes = require('./src/Routes/uploadRoute');


// Connecter à MongoDB
const uri = process.env.MONGODB_URI;

// Connection to the database
mongoose
    .connect(uri)
    .then(() => {
        console.log('Connected to database');
    })
    .catch((error) => {
        console.log('Error connecting to database: ', error);
    });

// Routes
app.get('/', (req, res) => {
    res.send('Bienvenue sur le backend !');
});
app.options('*', cors())


app.use('/dash', DashboardRoutes);

app.use('/admin', AdminRoutes);
app.use('/coaches', CoachRoutes);
app.use('/clients', ClientRoutes);
app.use('/speciality', SpecialityRoutes);

app.use('/comments', commentRoutes); // Route pour les commentaires
app.use('/coachs-comment', coachCommentRoutes);

app.use('/commercials', commercialRoutes); // Route pour les commerciaux

app.use('/abonnements', abonnementRoutes); // Route pour les abonnements
app.use('/commandes', commandeRoutes); // Route pour les commandes


app.use('/api', contractRoutes);


app.use(fileUpload());


// Serve static files from the React app (your frontend)
app.use(express.static(path.join(__dirname, 'client/build')));

// Handle special route for React Router to serve the `index.html` file for unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.get('/specialities', async (req, res) => {
    try {
        const specialities = await Speciality.find();
        res.json(specialities);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching specialities', error });
    }
});
// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});