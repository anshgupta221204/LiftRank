const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');
const auth = require('../middleware/auth');

// Apply auth middleware to protect all workout routes
router.use(auth);

// @route   POST api/workouts
// @desc    Log a new workout session
// @access  Private
router.post('/', workoutController.createWorkout);

// @route   GET api/workouts
// @desc    Get user's logged workout session history
// @access  Private
router.get('/', workoutController.getWorkouts);

// @route   GET api/workouts/prs
// @desc    Get all current personal records (PRs) of the user
// @access  Private
router.get('/prs', workoutController.getPRs);

// @route   GET api/workouts/exercises
// @desc    Get list of all available exercises
// @access  Private
router.get('/exercises', workoutController.getExercises);

// @route   POST api/workouts/exercises
// @desc    Add a custom exercise definition
// @access  Private
router.post('/exercises', workoutController.createExercise);

module.exports = router;
