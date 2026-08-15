const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a gym name'],
      unique: true,
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please enter gym location'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gym', GymSchema);
