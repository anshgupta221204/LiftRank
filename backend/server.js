const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Database Connection
if (process.env.MONGO_URI) {
  connectDB().then(() => {
    const seedExercises = require('./utils/seedExercises');
    seedExercises();
  });
} else {
  console.warn('Warning: MONGO_URI environment variable is not defined in the .env file.');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LiftRank Backend is running',
    timestamp: new Date()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/gyms', require('./routes/gymRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
