const Workout = require('../models/Workout');
const Exercise = require('../models/Exercise');
const PersonalRecord = require('../models/PersonalRecord');

// Helper to calculate One-Rep Max (1RM) using Epley Formula
const calculate1RM = (weight, reps) => {
  if (reps === 1) return weight;
  const oneRepMax = weight * (1 + reps / 30);
  return Math.round(oneRepMax * 100) / 100; // Round to 2 decimal places
};

// @route   POST api/workouts
// @desc    Log a new workout session
// @access  Private
exports.createWorkout = async (req, res) => {
  const { date, notes, exercises } = req.body;
  const userId = req.user.id;

  try {
    // 1. Basic validation
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one exercise to log' });
    }

    const processedExercises = [];

    // 2. Parse and validate sets, calculate 1RM
    for (const item of exercises) {
      if (!item.exercise) {
        return res.status(400).json({ message: 'Missing exercise identifier reference' });
      }

      // Check if exercise exists
      const exerciseExists = await Exercise.findById(item.exercise);
      if (!exerciseExists) {
        return res.status(404).json({ message: `Exercise not found with ID: ${item.exercise}` });
      }

      if (!item.sets || !Array.isArray(item.sets) || item.sets.length === 0) {
        return res.status(400).json({ message: `Provide at least one set for exercise: ${exerciseExists.name}` });
      }

      const processedSets = [];
      for (const set of item.sets) {
        const weight = Number(set.weight);
        const reps = Number(set.reps);

        if (isNaN(weight) || weight < 0) {
          return res.status(400).json({ message: 'Weight must be a non-negative number' });
        }
        if (isNaN(reps) || reps < 1) {
          return res.status(400).json({ message: 'Reps must be a positive integer greater than or equal to 1' });
        }

        // Calculate 1RM
        const oneRepMax = calculate1RM(weight, reps);

        processedSets.push({
          weight,
          reps,
          oneRepMax,
        });
      }

      processedExercises.push({
        exercise: item.exercise,
        sets: processedSets,
      });
    }

    // 3. Create and save the Workout session
    const workout = new Workout({
      user: userId,
      date: date || new Date(),
      notes: notes || '',
      exercises: processedExercises,
    });

    await workout.save();

    // 4. Update Personal Records (PRs)
    for (const loggedExercise of workout.exercises) {
      // Find the highest 1RM set logged for this exercise in the current workout
      let maxSet = loggedExercise.sets[0];
      for (let i = 1; i < loggedExercise.sets.length; i++) {
        if (loggedExercise.sets[i].oneRepMax > maxSet.oneRepMax) {
          maxSet = loggedExercise.sets[i];
        }
      }

      // Look for an existing PR for this user and exercise
      const existingPR = await PersonalRecord.findOne({
        user: userId,
        exercise: loggedExercise.exercise,
      });

      if (!existingPR) {
        // Create new PR
        const newPR = new PersonalRecord({
          user: userId,
          exercise: loggedExercise.exercise,
          weight: maxSet.weight,
          reps: maxSet.reps,
          oneRepMax: maxSet.oneRepMax,
          workout: workout._id,
          date: workout.date,
        });
        await newPR.save();
      } else if (maxSet.oneRepMax > existingPR.oneRepMax) {
        // Update existing PR with the higher oneRepMax metrics
        existingPR.weight = maxSet.weight;
        existingPR.reps = maxSet.reps;
        existingPR.oneRepMax = maxSet.oneRepMax;
        existingPR.workout = workout._id;
        existingPR.date = workout.date;
        await existingPR.save();
      }
      // If the logged 1RM is equal or lower than the existing PR, it is ignored
    }

    // Populate exercise details to return
    const populatedWorkout = await Workout.findById(workout._id)
      .populate('exercises.exercise', 'name muscleGroup');

    res.status(201).json({
      message: 'Workout logged successfully',
      workout: populatedWorkout,
    });
  } catch (err) {
    console.error('Create workout error:', err.message);
    res.status(500).json({ message: 'Server error logging workout session' });
  }
};

// @route   GET api/workouts
// @desc    Get user's logged workout session history
// @access  Private
exports.getWorkouts = async (req, res) => {
  const userId = req.user.id;

  try {
    const workouts = await Workout.find({ user: userId })
      .sort({ date: -1 })
      .populate('exercises.exercise', 'name muscleGroup');

    res.status(200).json(workouts);
  } catch (err) {
    console.error('Get workouts error:', err.message);
    res.status(500).json({ message: 'Server error retrieving workout history' });
  }
};

// @route   GET api/workouts/prs
// @desc    Get all current personal records (PRs) of the user
// @access  Private
exports.getPRs = async (req, res) => {
  const userId = req.user.id;

  try {
    const prs = await PersonalRecord.find({ user: userId })
      .populate('exercise', 'name muscleGroup')
      .sort({ updatedAt: -1 });

    res.status(200).json(prs);
  } catch (err) {
    console.error('Get PRs error:', err.message);
    res.status(500).json({ message: 'Server error retrieving personal records' });
  }
};

// @route   GET api/workouts/exercises
// @desc    Get list of all exercises (optionally filter by muscleGroup)
// @access  Private
exports.getExercises = async (req, res) => {
  const { muscleGroup } = req.query;

  try {
    let query = {};
    if (muscleGroup) {
      query.muscleGroup = muscleGroup;
    }

    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.status(200).json(exercises);
  } catch (err) {
    console.error('Get exercises error:', err.message);
    res.status(500).json({ message: 'Server error retrieving exercises list' });
  }
};
