const express = require('express');
const router = express.Router();
const friendGroupController = require('../controllers/friendGroupController');
const auth = require('../middleware/auth');

// All competition routes require authentication
router.use(auth);

// @route   POST api/competitions
// @desc    Create a new competition room
router.post('/', friendGroupController.createCompetition);

// @route   POST api/competitions/join
// @desc    Join a competition room via code
router.post('/join', friendGroupController.joinCompetition);

// @route   GET api/competitions
// @desc    List all competition rooms user belongs to
router.get('/', friendGroupController.getMyCompetitions);

// @route   GET api/competitions/:competitionId
// @desc    Get details of a competition room
router.get('/:competitionId', friendGroupController.getCompetition);

// @route   POST api/competitions/:competitionId/leave
// @desc    Leave an existing competition room
router.post('/:competitionId/leave', friendGroupController.leaveCompetition);

// @route   DELETE api/competitions/:competitionId
// @desc    Delete a competition room (Owner only)
router.delete('/:competitionId', friendGroupController.deleteCompetition);

// @route   GET api/competitions/:competitionId/leaderboard/overall
// @desc    Get overall rankings inside a competition room
router.get('/:competitionId/leaderboard/overall', friendGroupController.getCompetitionOverallLeaderboard);

// @route   GET api/competitions/:competitionId/leaderboard/exercise/:exerciseId
// @desc    Get exercise rankings inside a competition room
router.get('/:competitionId/leaderboard/exercise/:exerciseId', friendGroupController.getCompetitionExerciseLeaderboard);

// @route   GET api/competitions/:competitionId/leaderboard/muscle/:muscleGroup
// @desc    Get muscle group rankings inside a competition room
router.get('/:competitionId/leaderboard/muscle/:muscleGroup', friendGroupController.getCompetitionMuscleGroupLeaderboard);

module.exports = router;
