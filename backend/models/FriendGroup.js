const mongoose = require('mongoose');

const FriendGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter a competition name'],
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
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

module.exports = mongoose.model('FriendGroup', FriendGroupSchema);
