const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Admin = require('./models/adminModel'); // Adjust the path as necessary

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mycontacts-backend', { useNewUrlParser: true, useUnifiedTopology: true });

const hashPasswordAndStore = async (username, plainPassword) => {
  try {
    // Hash the plain text password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Find the admin by username and update their password
    const admin = await Admin.findOne({ username });
    if (admin) {
      admin.password = hashedPassword;
      await admin.save();
      console.log(`Password for user ${username} has been updated successfully.`);
    } else {
      console.log(`Admin with username ${username} not found.`);
    }
  } catch (error) {
    console.error('Error hashing password and updating database:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Replace these with the username and plain password you want to hash and store
const username = 'sanketm.ttl';
const plainPassword = 'tata@123';

hashPasswordAndStore(username, plainPassword);
