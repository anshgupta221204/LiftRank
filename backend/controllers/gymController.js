const Gym = require('../models/Gym');
const User = require('../models/User');

// @route   POST api/gyms
// @desc    Create a new gym
// @access  Private
exports.createGym = async (req, res) => {
  const { name, location, description } = req.body;
  const userId = req.user.id;

  try {
    // 1. Basic Validation
    if (!name || !location) {
      return res.status(400).json({ message: 'Please enter gym name and location' });
    }

    // 2. Check if user is already a member of a gym
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gym) {
      return res.status(400).json({ 
        message: 'You are already a member of a gym. Please leave your current gym before creating a new one.' 
      });
    }

    // 3. Check if gym name already exists
    let gymExists = await Gym.findOne({ name });
    if (gymExists) {
      return res.status(400).json({ message: 'Gym with this name already exists' });
    }

    // 4. Create and save Gym
    const gym = new Gym({
      name,
      location,
      description: description || '',
      owner: userId,
      members: [userId]
    });

    await gym.save();

    // 5. Update user gym association
    user.gym = gym._id;
    await user.save();

    res.status(201).json({
      message: 'Gym created successfully',
      gym: {
        id: gym._id,
        name: gym.name,
        location: gym.location,
        description: gym.description,
        owner: gym.owner,
        memberCount: gym.members.length
      }
    });
  } catch (err) {
    console.error('Create gym error:', err.message);
    res.status(500).json({ message: 'Server error during gym creation' });
  }
};

// @route   GET api/gyms
// @desc    Get all gyms (with optional search filter)
// @access  Public
exports.getGyms = async (req, res) => {
  const { search } = req.query;

  try {
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const gyms = await Gym.find(query).populate('owner', 'name');

    // Return gyms mapped with memberCount
    const gymsWithCount = gyms.map(gym => ({
      _id: gym._id,
      name: gym.name,
      location: gym.location,
      description: gym.description,
      owner: gym.owner,
      memberCount: gym.members.length
    }));

    res.status(200).json(gymsWithCount);
  } catch (err) {
    console.error('Get gyms error:', err.message);
    res.status(500).json({ message: 'Server error retrieving gyms' });
  }
};

// @route   GET api/gyms/:id
// @desc    Get single gym details by ID
// @access  Public
exports.getGymById = async (req, res) => {
  const gymId = req.params.id;

  try {
    const gym = await Gym.findById(gymId).populate('owner', 'name');
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.status(200).json({
      _id: gym._id,
      name: gym.name,
      location: gym.location,
      description: gym.description,
      owner: gym.owner,
      memberCount: gym.members.length
    });
  } catch (err) {
    console.error('Get gym by ID error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.status(500).json({ message: 'Server error retrieving gym details' });
  }
};

// @route   GET api/gyms/:id/members
// @desc    Get members list of a gym
// @access  Public
exports.getGymMembers = async (req, res) => {
  const gymId = req.params.id;

  try {
    const gym = await Gym.findById(gymId).populate('members', 'name email');
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    res.status(200).json(gym.members);
  } catch (err) {
    console.error('Get gym members error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.status(500).json({ message: 'Server error retrieving members list' });
  }
};

// @route   POST api/gyms/:id/join
// @desc    Join a gym
// @access  Private
exports.joinGym = async (req, res) => {
  const gymId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. Check if user is already a member of a gym
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.gym) {
      return res.status(400).json({ 
        message: 'You are already a member of a gym. Please leave your current gym first.' 
      });
    }

    // 2. Find target gym
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // 3. Prevent duplicate memberships (failsafe)
    if (gym.members.includes(userId)) {
      return res.status(400).json({ message: 'You are already a member of this gym' });
    }

    // 4. Update gym members
    gym.members.push(userId);
    await gym.save();

    // 5. Update user gym association
    user.gym = gym._id;
    await user.save();

    res.status(200).json({
      message: 'Joined gym successfully',
      gym: {
        _id: gym._id,
        name: gym.name,
        location: gym.location,
        memberCount: gym.members.length
      }
    });
  } catch (err) {
    console.error('Join gym error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.status(500).json({ message: 'Server error joining gym' });
  }
};

// @route   POST api/gyms/:id/leave
// @desc    Leave current gym
// @access  Private
exports.leaveGym = async (req, res) => {
  const gymId = req.params.id;
  const userId = req.user.id;

  try {
    // 1. Verify user membership
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.gym || user.gym.toString() !== gymId) {
      return res.status(400).json({ message: 'You are not a member of this gym' });
    }

    // 2. Find gym
    const gym = await Gym.findById(gymId);
    if (!gym) {
      return res.status(404).json({ message: 'Gym not found' });
    }

    // 3. Handle Gym Owner edge cases
    if (gym.owner.toString() === userId) {
      if (gym.members.length === 1) {
        // Owner is the only member left. Delete the gym completely.
        await Gym.findByIdAndDelete(gymId);

        // Update user
        user.gym = null;
        await user.save();

        return res.status(200).json({
          message: 'Left gym and deleted the gym since you were the last member.'
        });
      } else {
        // Ownership transfer: select the next member who is not the owner
        const nextOwnerId = gym.members.find(memberId => memberId.toString() !== userId);
        gym.owner = nextOwnerId;
      }
    }

    // 4. Remove user from gym members list
    gym.members = gym.members.filter(memberId => memberId.toString() !== userId);
    await gym.save();

    // 5. Clear user gym association
    user.gym = null;
    await user.save();

    res.status(200).json({
      message: 'Left gym successfully'
    });
  } catch (err) {
    console.error('Leave gym error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Gym not found' });
    }
    res.status(500).json({ message: 'Server error leaving gym' });
  }
};
