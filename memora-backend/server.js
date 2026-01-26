const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const memoryRoutes = require('./routes/memoryRoutes');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL ,
    credentials: true
}));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/api/memories', memoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));