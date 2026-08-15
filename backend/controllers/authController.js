const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign(
    { user: { id: userId } },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// @route   POST api/auth/signup
// @desc    Register a new user
// @access  Public
exports.signup = async (req, res) => {
  const { name, email, password, gym } = req.body;

  try {
    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 3. Create and save new user (gym is set to null by default; joined post-registration via directory)
    user = new User({
      name,
      email,
      password,
      gym: null,
    });

    await user.save();

    // 4. Generate JWT token
    const token = generateToken(user.id);

    // 5. Send response
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gym: user.gym,
      },
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // 2. Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4. Generate JWT token
    const token = generateToken(user.id);

    // 5. Send response
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gym: user.gym,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @route   GET api/auth/me
// @desc    Get current logged in user profile details
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Find user by ID matching the payload of the validated token (excluding password), populating gym details
    const user = await User.findById(req.user.id).select('-password').populate('gym');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error('getMe error:', err.message);
    res.status(500).json({ message: 'Server error loading profile' });
  }
};
