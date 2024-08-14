const asyncHandler = require("express-async-handler");
const bcrypt = require('bcrypt');
const Admin = require("../models/adminModel");

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400);
    throw new Error("Username and password are required");
  }

  const admin = await Admin.findOne({ username });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    res.status(200).json({ 
      message: "Login successful",
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
      }
    });
  } else {
    res.status(401).json({ message: "Username or password is not valid" });
  }
});

module.exports = { loginAdmin };
