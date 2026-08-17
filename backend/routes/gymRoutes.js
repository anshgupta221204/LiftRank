const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const leaderboardController = require('../controllers/leaderboardController');
const auth = require('../middleware/auth');

// @route   GET api/gyms/:gymId/leaderboard/overall
// @desc    Get overall gym rankings based on average PR 1RM
// @access  Private
router.get('/:gymId/leaderboard/overall', auth, leaderboardController.getGymOverallLeaderboard);

// @route   GET api/gyms/:gymId/leaderboard/muscle/:muscleGroup
// @desc    Get leaderboard rankings for a specific muscle group in a gym
// @access  Private
router.get('/:gymId/leaderboard/muscle/:muscleGroup', auth, leaderboardController.getGymMuscleGroupLeaderboard);

// @route   GET api/gyms/:gymId/leaderboard/:exerciseId
// @desc    Get leaderboard rankings for a specific exercise in a gym
// @access  Private
router.get('/:gymId/leaderboard/:exerciseId', auth, leaderboardController.getGymLeaderboard);

// @route   POST api/gyms
// @desc    Create a new gym
// @access  Private
router.post('/', auth, gymController.createGym);

// @route   GET api/gyms
// @desc    Get all gyms with optional search
// @access  Public
router.get('/', gymController.getGyms);

// @route   GET api/gyms/:id
// @desc    Get a single gym details
// @access  Public
router.get('/:id', gymController.getGymById);

// @route   GET api/gyms/:id/members
// @desc    Get the roster of members in a gym
// @access  Public
router.get('/:id/members', gymController.getGymMembers);

// @route   POST api/gyms/:id/join
// @desc    Join a gym
// @access  Private
router.post('/:id/join', auth, gymController.joinGym);

// @route   POST api/gyms/:id/leave
// @desc    Leave a gym
// @access  Private
router.post('/:id/leave', auth, gymController.leaveGym);

module.exports = router;
