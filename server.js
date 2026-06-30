require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Daftarkan Routes
app.use('/', authRoutes);
app.use('/', taskRoutes);

// Jalankan Server
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});