const User = require('../models/User');
const Gym = require('../models/Gym');
const Exercise = require('../models/Exercise');
const PersonalRecord = require('../models/PersonalRecord');
const mongoose = require('mongoose');

// @route   GET api/gyms/:gymId/leaderboard/:exerciseId
// @desc    Get leaderboard rankings for a specific exercise in a gym
// @access  Private
exports.getGymLeaderboard = async (req, res) => {
  const { gymId, exerciseId } = req.params;
  const currentUserId = req.user.id;

  try {
    // 1. Validate Gym ID format
    if (!mongoose.Types.ObjectId.isValid(gymId)) {
      return res.status(400).json({ message: 'Invalid Gym ID' });
    }

    // 2. Validate Exercise ID format
    if (!mongoose.Types.ObjectId.isValid(exerciseId)) {
      return res.status(400).json({ message: 'Invalid Exercise ID' });
    }

    // 3. Find Gym to ensure it exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // 4. Find Exercise to ensure it exists
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // 5. Find members belonging to that gym
    const members = await User.find({ gym: gymId }).select('name email');
    const memberIds = members.map((m) => m._id);

    // 6. Find PersonalRecords for the members for this exercise
    // Sorted by highest oneRepMax (1RM)
    // Consistent tie-handling: sort by oneRepMax descending, then by user ID ascending
    const prs = await PersonalRecord.find({
      user: { $in: memberIds },
      exercise: exerciseId,
    })
      .populate('user', 'name email')
      .sort({ oneRepMax: -1, user: 1 });

    // 7. Filter and build leaderboard array
    const activePrs = prs.filter((pr) => pr.user);
    const leaderboard = activePrs.map((pr, index) => ({
      rank: index + 1,
      user: {
        id: pr.user._id,
        username: pr.user.name,
        name: pr.user.name,
        email: pr.user.email,
      },
      oneRepMax: pr.oneRepMax,
      weight: pr.weight,
      reps: pr.reps,
      date: pr.date,
    }));

    // 8. Find authenticated user's rank
    let currentUserRank = null;
    const userPrIndex = prs.findIndex((pr) => pr.user._id.toString() === currentUserId);
    if (userPrIndex !== -1) {
      currentUserRank = userPrIndex + 1;
    }

    // 9. Return structured response matching requirements
    return res.status(200).json({
      exercise: {
        id: exercise._id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
      gym: {
        id: gym._id,
        name: gym.name,
      },
      leaderboard,
      currentUserRank,
      totalRankedUsers: leaderboard.length,
      totalGymMembers: memberIds.length,
    });

  } catch (err) {
    console.error('Leaderboard error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving leaderboard standings' });
  }
};

// @route   GET api/gyms/:gymId/leaderboard/muscle/:muscleGroup
// @desc    Get leaderboard rankings for a specific muscle group in a gym
// @access  Private
exports.getGymMuscleGroupLeaderboard = async (req, res) => {
  const { gymId, muscleGroup } = req.params;
  const currentUserId = req.user.id;

  try {
    // 1. Validate Gym ID format
    if (!mongoose.Types.ObjectId.isValid(gymId)) {
      return res.status(400).json({ message: 'Invalid Gym ID' });
    }

    // 2. Validate muscleGroup parameter
    const validGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];
    if (!validGroups.includes(muscleGroup)) {
      return res.status(400).json({ message: 'Invalid muscle group specified' });
    }

    // 3. Find Gym to ensure it exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // 4. Find all exercises in this muscleGroup
    const exercises = await Exercise.find({ muscleGroup });
    const totalExercises = exercises.length;
    const exerciseIds = exercises.map((ex) => ex._id);

    // 5. Find members belonging to that gym
    const members = await User.find({ gym: gymId }).select('name email');
    const memberIds = members.map((m) => m._id);

    // 6. Find all PersonalRecords for these exercises among gym members
    const prs = await PersonalRecord.find({
      user: { $in: memberIds },
      exercise: { $in: exerciseIds },
    })
      .populate('user', 'name email')
      .populate('exercise', 'name');

    // 7. Group PRs by user to calculate averages
    const userMap = {};
    prs.forEach((pr) => {
      if (!pr.user || !pr.exercise) return;
      const uId = pr.user._id.toString();
      if (!userMap[uId]) {
        userMap[uId] = {
          user: {
            id: pr.user._id,
            username: pr.user.name,
            name: pr.user.name,
            email: pr.user.email,
          },
          total1RM: 0,
          exercisesCompleted: 0,
          prs: [],
        };
      }
      userMap[uId].total1RM += pr.oneRepMax;
      userMap[uId].exercisesCompleted += 1;
      userMap[uId].prs.push({
        exerciseId: pr.exercise._id,
        exerciseName: pr.exercise.name,
        oneRepMax: pr.oneRepMax,
        weight: pr.weight,
        reps: pr.reps,
      });
    });

    // 8. Convert map to list, calculate score and sort
    // Score = sum / exercisesCompleted (average of logged lifts)
    const sortedUsers = Object.values(userMap)
      .map((item) => {
        const score = item.total1RM / item.exercisesCompleted;
        return {
          user: item.user,
          score: Math.round(score * 100) / 100,
          exercisesCompleted: item.exercisesCompleted,
          totalExercises,
          prs: item.prs,
        };
      })
      // Sort: Score descending, then User ID ascending for tie-handling
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.user.id.toString().localeCompare(b.user.id.toString());
      });

    // 9. Assign ranks using Standard Competition Ranking (1, 2, 2, 4)
    let rankToAssign = 1;
    const leaderboard = sortedUsers.map((item, index) => {
      if (index > 0 && item.score !== sortedUsers[index - 1].score) {
        rankToAssign = index + 1;
      }
      return {
        rank: rankToAssign,
        user: item.user,
        score: item.score,
        exercisesCompleted: item.exercisesCompleted,
        totalExercises: item.totalExercises,
        prs: item.prs,
      };
    });

    // 10. Find authenticated user's rank
    let currentUserRank = null;
    const userIndex = leaderboard.findIndex((item) => item.user.id.toString() === currentUserId);
    if (userIndex !== -1) {
      currentUserRank = leaderboard[userIndex].rank;
    }

    // 11. Return response JSON
    return res.status(200).json({
      gym: {
        id: gym._id,
        name: gym.name,
      },
      muscleGroup,
      totalExercises,
      leaderboard,
      currentUserRank,
      totalGymMembers: memberIds.length,
    });

  } catch (err) {
    console.error('Muscle group leaderboard error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving muscle group standings' });
  }
};

// @route   GET api/gyms/:gymId/leaderboard/overall
// @desc    Get overall gym rankings based on average PR 1RM
// @access  Private
exports.getGymOverallLeaderboard = async (req, res) => {
  const { gymId } = req.params;
  const currentUserId = req.user.id;

  try {
    // 1. Validate Gym ID format
    if (!mongoose.Types.ObjectId.isValid(gymId)) {
      return res.status(400).json({ message: 'Invalid Gym ID' });
    }

    // 2. Find Gym to ensure it exists
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // 3. Find members belonging to that gym
    const members = await User.find({ gym: gymId }).select('name email');
    const memberIds = members.map((m) => m._id);

    // 4. Find all PersonalRecords for these members
    const prs = await PersonalRecord.find({
      user: { $in: memberIds },
    }).populate('user', 'name email');

    // 5. Group PRs by user to calculate averages
    const userMap = {};
    prs.forEach((pr) => {
      if (!pr.user || !pr.exercise) return;
      const uId = pr.user._id.toString();
      if (!userMap[uId]) {
        userMap[uId] = {
          user: {
            id: pr.user._id,
            username: pr.user.name,
            name: pr.user.name,
            email: pr.user.email,
          },
          total1RM: 0,
          exercisesCompleted: 0,
        };
      }
      userMap[uId].total1RM += pr.oneRepMax;
      userMap[uId].exercisesCompleted += 1;
    });

    // 6. Convert map to list, calculate score and sort
    const sortedUsers = Object.values(userMap)
      .map((item) => {
        const score = item.total1RM / item.exercisesCompleted;
        return {
          user: item.user,
          score: Math.round(score * 100) / 100,
          exercisesCompleted: item.exercisesCompleted,
        };
      })
      // Sort: Score descending, then User ID ascending for tie-handling
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.user.id.toString().localeCompare(b.user.id.toString());
      });

    // 7. Assign ranks using Standard Competition Ranking (1, 2, 2, 4)
    let rankToAssign = 1;
    const leaderboard = sortedUsers.map((item, index) => {
      if (index > 0 && item.score !== sortedUsers[index - 1].score) {
        rankToAssign = index + 1;
      }
      return {
        rank: rankToAssign,
        user: item.user,
        score: item.score,
        exercisesCompleted: item.exercisesCompleted,
      };
    });

    // 8. Find authenticated user's rank
    let currentUserRank = null;
    const userIndex = leaderboard.findIndex((item) => item.user.id.toString() === currentUserId);
    if (userIndex !== -1) {
      currentUserRank = leaderboard[userIndex].rank;
    }

    // 9. Return response JSON
    return res.status(200).json({
      gym: {
        id: gym._id,
        name: gym.name,
      },
      leaderboard,
      currentUserRank,
      totalGymMembers: memberIds.length,
    });

  } catch (err) {
    console.error('Overall gym leaderboard error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving overall gym standings' });
  }
};
