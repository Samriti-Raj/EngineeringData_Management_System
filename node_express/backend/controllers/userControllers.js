const asyncHandler = require("express-async-handler");
const bcrypt = require('bcryptjs');
const User = require("../models/userModel");

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  const user = await User.findOne({ username });

  if (user && await bcrypt.compare(password, user.password)) {
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } else {
    res.status(401).json({ message: "Username or password is not valid" });
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = await bcrypt.hash(password, 10); // Hash the password
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = { loginUser, forgetPassword };




