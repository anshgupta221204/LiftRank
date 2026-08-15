const mongoose = require('mongoose');

const SetSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: [true, 'Please enter weight logged in kilograms'],
    min: [0, 'Weight cannot be negative'],
  },
  reps: {
    type: Number,
    required: [true, 'Please enter reps completed'],
    min: [1, 'Reps must be at least 1'],
  },
  oneRepMax: {
    type: Number,
    required: true,
  },
});

const WorkoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  sets: [SetSchema],
});

const WorkoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    exercises: [WorkoutExerciseSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Workout', WorkoutSchema);
