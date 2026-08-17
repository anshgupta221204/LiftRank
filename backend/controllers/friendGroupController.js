const FriendGroup = require('../models/FriendGroup');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const PersonalRecord = require('../models/PersonalRecord');
const generateRoomCode = require('../utils/generateRoomCode');
const mongoose = require('mongoose');

const MAX_MEMBERS = 20;

// @route   POST api/competitions
// @desc    Create a new private competition room
// @access  Private
exports.createCompetition = async (req, res) => {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ message: 'Please provide a valid competition room name' });
  }

  try {
    // 1. Generate unique room code
    let roomCode = generateRoomCode();
    let codeExists = await FriendGroup.findOne({ roomCode });
    while (codeExists) {
      roomCode = generateRoomCode();
      codeExists = await FriendGroup.findOne({ roomCode });
    }

    // 2. Create competition
    const competition = new FriendGroup({
      name: name.trim(),
      roomCode,
      owner: req.user.id,
      members: [req.user.id],
    });

    await competition.save();

    // Populate owner & members
    const populatedComp = await FriendGroup.findById(competition._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(201).json(populatedComp);

  } catch (err) {
    console.error('Create competition error:', err.message);
    return res.status(500).json({ message: 'Server error creating competition room' });
  }
};

// @route   POST api/competitions/join
// @desc    Join an existing competition room via code
// @access  Private
exports.joinCompetition = async (req, res) => {
  const { roomCode } = req.body;

  if (!roomCode || typeof roomCode !== 'string' || roomCode.trim() === '') {
    return res.status(400).json({ message: 'Please enter a room code' });
  }

  const normalizedCode = roomCode.trim().toUpperCase();
  const currentUserId = req.user.id;

  try {
    // 1. Find competition by room code
    const competition = await FriendGroup.findOne({ roomCode: normalizedCode });
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // 2. Check if user is already a member
    const isMember = competition.members.some((mId) => mId.toString() === currentUserId);
    if (isMember) {
      const populated = await FriendGroup.findById(competition._id)
        .populate('owner', 'name email')
        .populate('members', 'name email');
      return res.status(200).json({
        message: 'Already a member of this competition',
        competition: populated,
      });
    }

    // 3. Check room capacity
    if (competition.members.length >= MAX_MEMBERS) {
      return res.status(400).json({ message: 'Competition room is full.' });
    }

    // 4. Add user to members
    competition.members.push(currentUserId);
    await competition.save();

    const populated = await FriendGroup.findById(competition._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(200).json({
      message: 'Successfully joined competition room',
      competition: populated,
    });

  } catch (err) {
    console.error('Join competition error:', err.message);
    return res.status(500).json({ message: 'Server error joining competition room' });
  }
};

// @route   GET api/competitions
// @desc    Get all competitions where authenticated user is a member
// @access  Private
exports.getMyCompetitions = async (req, res) => {
  try {
    const competitions = await FriendGroup.find({ members: req.user.id })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(competitions);
  } catch (err) {
    console.error('Get my competitions error:', err.message);
    return res.status(500).json({ message: 'Server error listing competitions' });
  }
};

// @route   GET api/competitions/:competitionId
// @desc    Get details of a specific competition room
// @access  Private
exports.getCompetition = async (req, res) => {
  const { competitionId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(competitionId)) {
      return res.status(400).json({ message: 'Invalid Competition ID' });
    }

    const competition = await FriendGroup.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // Security check: Must be a member to view details
    const isMember = competition.members.some((mId) => mId.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this competition' });
    }

    const populated = await FriendGroup.findById(competitionId)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    return res.status(200).json(populated);

  } catch (err) {
    console.error('Get competition error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving room details' });
  }
};

// @route   POST api/competitions/:competitionId/leave
// @desc    Leave an existing competition room
// @access  Private
exports.leaveCompetition = async (req, res) => {
  const { competitionId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(competitionId)) {
      return res.status(400).json({ message: 'Invalid Competition ID' });
    }

    const competition = await FriendGroup.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // Check if user is a member
    const memberIndex = competition.members.findIndex((mId) => mId.toString() === currentUserId);
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this competition' });
    }

    // Remove member
    competition.members.splice(memberIndex, 1);

    // Owner handling: If owner leaves
    if (competition.owner.toString() === currentUserId) {
      if (competition.members.length > 0) {
        // Transfer ownership to the next remaining member
        competition.owner = competition.members[0];
      } else {
        // No members left -> Delete room
        await FriendGroup.findByIdAndDelete(competitionId);
        return res.status(200).json({ message: 'Successfully left. Room deleted since it became empty.' });
      }
    }

    await competition.save();
    return res.status(200).json({ message: 'Successfully left the competition room' });

  } catch (err) {
    console.error('Leave competition error:', err.message);
    return res.status(500).json({ message: 'Server error leaving competition room' });
  }
};

// @route   DELETE api/competitions/:competitionId
// @desc    Delete a competition room (Owner only)
// @access  Private
exports.deleteCompetition = async (req, res) => {
  const { competitionId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(competitionId)) {
      return res.status(400).json({ message: 'Invalid Competition ID' });
    }

    const competition = await FriendGroup.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // Security: Only owner can delete
    if (competition.owner.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Forbidden: Only the owner can delete this competition' });
    }

    await FriendGroup.findByIdAndDelete(competitionId);
    return res.status(200).json({ message: 'Competition room deleted successfully' });

  } catch (err) {
    console.error('Delete competition error:', err.message);
    return res.status(500).json({ message: 'Server error deleting competition room' });
  }
};

// @route   GET api/competitions/:competitionId/leaderboard/exercise/:exerciseId
// @desc    Get exercise rankings inside a competition room
// @access  Private
exports.getCompetitionExerciseLeaderboard = async (req, res) => {
  const { competitionId, exerciseId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(competitionId) || !mongoose.Types.ObjectId.isValid(exerciseId)) {
      return res.status(400).json({ message: 'Invalid IDs specified' });
    }

    const competition = await FriendGroup.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // Security check: Must be a member to see leaderboard
    const isMember = competition.members.some((mId) => mId.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this competition' });
    }

    // Get exercise details
    const exercise = await Exercise.findById(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Get PRs for the competition members
    const prs = await PersonalRecord.find({
      user: { $in: competition.members },
      exercise: exerciseId,
    })
      .populate('user', 'name email')
      .sort({ oneRepMax: -1, user: 1 });

    // Assign ranks and build leaderboard array
    const leaderboard = prs.map((pr, index) => ({
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
    }));

    // Find authenticated user's rank
    let currentUserRank = null;
    const userPrIndex = prs.findIndex((pr) => pr.user._id.toString() === currentUserId);
    if (userPrIndex !== -1) {
      currentUserRank = userPrIndex + 1;
    }

    return res.status(200).json({
      exercise: {
        id: exercise._id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
      },
      leaderboard,
      currentUserRank,
      totalRankedUsers: leaderboard.length,
    });

  } catch (err) {
    console.error('Comp exercise leaderboard error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving exercise standings' });
  }
};

// @route   GET api/competitions/:competitionId/leaderboard/muscle/:muscleGroup
// @desc    Get muscle group rankings inside a competition room
// @access  Private
exports.getCompetitionMuscleGroupLeaderboard = async (req, res) => {
  const { competitionId, muscleGroup } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(competitionId)) {
      return res.status(400).json({ message: 'Invalid Competition ID' });
    }

    const validGroups = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'];
    if (!validGroups.includes(muscleGroup)) {
      return res.status(400).json({ message: 'Invalid muscle group specified' });
    }

    const competition = await FriendGroup.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // Security check: Must be a member to see leaderboard
    const isMember = competition.members.some((mId) => mId.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this competition' });
    }

    // Resolve exercises in this muscleGroup
    const exercises = await Exercise.find({ muscleGroup });
    const totalExercises = exercises.length;
    const exerciseIds = exercises.map((ex) => ex._id);

    // Get PRs for the competition members for these exercises
    const prs = await PersonalRecord.find({
      user: { $in: competition.members },
      exercise: { $in: exerciseIds },
    })
      .populate('user', 'name email')
      .populate('exercise', 'name');

    // Group PRs by user to calculate averages
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

    // Convert map to list, calculate score and sort
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

    // Assign ranks using Standard Competition Ranking (1, 2, 2, 4)
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

    // Find authenticated user's rank
    let currentUserRank = null;
    const userIndex = leaderboard.findIndex((item) => item.user.id.toString() === currentUserId);
    if (userIndex !== -1) {
      currentUserRank = leaderboard[userIndex].rank;
    }

    return res.status(200).json({
      muscleGroup,
      totalExercises,
      leaderboard,
      currentUserRank,
    });

  } catch (err) {
    console.error('Comp muscle group leaderboard error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving muscle group standings' });
  }
};

// @route   GET api/competitions/:competitionId/leaderboard/overall
// @desc    Get overall rankings inside a competition room
// @access  Private
exports.getCompetitionOverallLeaderboard = async (req, res) => {
  const { competitionId } = req.params;
  const currentUserId = req.user.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(competitionId)) {
      return res.status(400).json({ message: 'Invalid Competition ID' });
    }

    const competition = await FriendGroup.findById(competitionId);
    if (!competition) {
      return res.status(404).json({ message: 'Competition room not found.' });
    }

    // Security check
    const isMember = competition.members.some((mId) => mId.toString() === currentUserId);
    if (!isMember) {
      return res.status(403).json({ message: 'Forbidden: You are not a member of this competition' });
    }

    // Fetch all PersonalRecords for room members
    const prs = await PersonalRecord.find({
      user: { $in: competition.members },
    }).populate('user', 'name email');

    // Group PRs by user to calculate averages
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

    // Convert map to list, calculate score and sort
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

    // Assign ranks using Standard Competition Ranking (1, 2, 2, 4)
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

    // Find authenticated user's rank
    let currentUserRank = null;
    const userIndex = leaderboard.findIndex((item) => item.user.id.toString() === currentUserId);
    if (userIndex !== -1) {
      currentUserRank = leaderboard[userIndex].rank;
    }

    return res.status(200).json({
      leaderboard,
      currentUserRank,
    });

  } catch (err) {
    console.error('Comp overall leaderboard error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving overall competition standings' });
  }
};
