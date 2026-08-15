const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter an exercise name'],
      unique: true,
      trim: true,
    },
    muscleGroup: {
      type: String,
      required: [true, 'Please specify target muscle group'],
      enum: ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Abs'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Exercise', ExerciseSchema);
