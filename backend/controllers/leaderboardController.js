const User = require('../models/User');
const Exercise = require('../models/Exercise');
const PersonalRecord = require('../models/PersonalRecord');

// @route   GET api/gyms/my/leaderboard
// @desc    Get leaderboard rankings for the user's gym
// @access  Private
exports.getGymLeaderboard = async (req, res) => {
  const { type, exerciseId, muscleGroup } = req.query;
  const userId = req.user.id;

  try {
    // 1. Get user profile and check gym association
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.gym) {
      return res.status(400).json({ message: 'You must join a gym first to access the leaderboards' });
    }

    // 2. Fetch all members belonging to the same gym
    const members = await User.find({ gym: user.gym }).select('name email');
    const memberIds = members.map((m) => m._id);

    // 3. Construct leaderboard rankings based on type
    if (type === 'exercise') {
      if (!exerciseId) {
        return res.status(400).json({ message: 'Please specify an exerciseId for exercise rankings' });
      }

      // Check if exercise exists
      const exerciseExists = await Exercise.findById(exerciseId);
      if (!exerciseExists) {
        return res.status(404).json({ message: 'Exercise not found' });
      }

      // Find all PRs for the gym members for this exercise
      const prs = await PersonalRecord.find({
        user: { $in: memberIds },
        exercise: exerciseId,
      })
        .populate('user', 'name email')
        .sort({ oneRepMax: -1 });

      const leaderboard = prs.map((pr, index) => ({
        rank: index + 1,
        userId: pr.user._id,
        userName: pr.user.name,
        userEmail: pr.user.email,
        weight: pr.weight,
        reps: pr.reps,
        oneRepMax: pr.oneRepMax,
        date: pr.date,
      }));

      return res.status(200).json({
        gymId: user.gym,
        type: 'exercise',
        exercise: { id: exerciseExists._id, name: exerciseExists.name, muscleGroup: exerciseExists.muscleGroup },
        leaderboard,
      });

    } else if (type === 'muscleGroup') {
      if (!muscleGroup) {
        return res.status(400).json({ message: 'Please specify a muscleGroup for muscle group rankings' });
      }

      const validGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];
      if (!validGroups.includes(muscleGroup)) {
        return res.status(400).json({ message: 'Invalid muscle group specified' });
      }

      // Find all exercises belonging to the muscle group
      const exercises = await Exercise.find({ muscleGroup });
      const exerciseIds = exercises.map((ex) => ex._id);

      // Find all PRs for these exercises among gym members
      const prs = await PersonalRecord.find({
        user: { $in: memberIds },
        exercise: { $in: exerciseIds },
      })
        .populate('user', 'name email')
        .populate('exercise', 'name');

      // Group and sum 1RMs by user
      const userScores = {};
      prs.forEach((pr) => {
        const uId = pr.user._id.toString();
        if (!userScores[uId]) {
          userScores[uId] = {
            userId: pr.user._id,
            userName: pr.user.name,
            userEmail: pr.user.email,
            score: 0,
            prs: [],
          };
        }
        userScores[uId].score += pr.oneRepMax;
        userScores[uId].prs.push({
          exerciseId: pr.exercise._id,
          exerciseName: pr.exercise.name,
          weight: pr.weight,
          reps: pr.reps,
          oneRepMax: pr.oneRepMax,
        });
      });

      // Sort by accumulated score descending
      const leaderboard = Object.values(userScores)
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          rank: index + 1,
          ...item,
          score: Math.round(item.score * 100) / 100,
        }));

      return res.status(200).json({
        gymId: user.gym,
        type: 'muscleGroup',
        muscleGroup,
        leaderboard,
      });

    } else {
      // Default: 'overall' Strength Score rankings
      // Find all PRs of any exercise among gym members
      const prs = await PersonalRecord.find({
        user: { $in: memberIds },
      })
        .populate('user', 'name email')
        .populate('exercise', 'name');

      // Group and sum all PR 1RMs by user
      const userScores = {};
      prs.forEach((pr) => {
        const uId = pr.user._id.toString();
        if (!userScores[uId]) {
          userScores[uId] = {
            userId: pr.user._id,
            userName: pr.user.name,
            userEmail: pr.user.email,
            score: 0,
            prsCount: 0,
          };
        }
        userScores[uId].score += pr.oneRepMax;
        userScores[uId].prsCount += 1;
      });

      // Sort by overall score descending
      const leaderboard = Object.values(userScores)
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({
          rank: index + 1,
          ...item,
          score: Math.round(item.score * 100) / 100,
        }));

      return res.status(200).json({
        gymId: user.gym,
        type: 'overall',
        leaderboard,
      });
    }

  } catch (err) {
    console.error('Leaderboard API Error:', err.message);
    res.status(500).json({ message: 'Server error loading gym leaderboard standings' });
  }
};
