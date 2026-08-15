const mongoose = require('mongoose');

const PersonalRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exercise: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    weight: {
      type: Number,
      required: true,
    },
    reps: {
      type: Number,
      required: true,
    },
    oneRepMax: {
      type: Number,
      required: true,
    },
    workout: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workout',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Define compound unique index to guarantee one PR per user per exercise
PersonalRecordSchema.index({ user: 1, exercise: 1 }, { unique: true });

module.exports = mongoose.model('PersonalRecord', PersonalRecordSchema);
