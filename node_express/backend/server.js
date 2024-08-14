const express = require("express");
const bcrypt = require("bcryptjs");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const PdfSchema = require("./models/PdfDetails"); // Importing Mongoose model for PDF details
const userSchema = require("./models/userModel"); // Importing Mongoose model for user details

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use("/files", express.static("files")); // Serving static files from the "files" directory
app.use(express.json()); // Parsing JSON bodies
app.use(cors()); // Enabling Cross-Origin Resource Sharing (CORS)
app.use(errorHandler); // Custom error handling middleware

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(error => console.error('MongoDB connection error:', error));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./files"), // Destination directory for uploaded files
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname) // Unique filename for each uploaded file
});
const upload = multer({ storage });

// API routes
app.use("/api/users", require("./routes/userRoutes")); // User-related API routes
app.use("/api/admins", require("./routes/adminRoutes")); // Admin-related API routes

// Endpoint to handle file upload
app.post("/upload-files", upload.single("file"), async (req, res) => {
  try {
    const { title, application, description, date, username } = req.body;
    const newPdfDetail = new PdfSchema({
      pdf: req.file.path, // Path to the uploaded file
      username,
      title,
      application,
      description,
      date: new Date(date), // Convert date string to Date object
    });
    await newPdfDetail.save(); // Save the PDF details to MongoDB
    res.status(201).send("File and details saved successfully"); // Respond with success message
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving file and details"); // Handle error saving file and details
  }
});

// Endpoint to update file details
app.put("/update-file/:id", upload.single("file"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, application, description, date, username } = req.body;
    const fileToUpdate = await PdfSchema.findById(id); // Find the PDF document by ID

    if (!fileToUpdate) return res.status(404).send("File not found"); // Handle case where file is not found

    // Store previous version details before updating
    fileToUpdate.previousVersions.push({
      pdf: fileToUpdate.pdf,
      title: fileToUpdate.title,
      application: fileToUpdate.application,
      description: fileToUpdate.description,
      date: fileToUpdate.date,
      updatedAt: fileToUpdate.updatedAt
    });

    // Update file details
    if (req.file) {
      fileToUpdate.pdf = req.file.path; // Update file path if a new file is uploaded
    }
    fileToUpdate.title = title;
    fileToUpdate.application = application;
    fileToUpdate.description = description;
    fileToUpdate.date = new Date(date); // Convert date string to Date object
    fileToUpdate.username = username;
    fileToUpdate.updatedAt = Date.now(); // Update timestamp of last update

    await fileToUpdate.save(); // Save updated file details
    res.status(200).send("File and details updated successfully"); // Respond with success message
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating file and details"); // Handle error updating file and details
  }
});

// Endpoint to get files by username
app.get("/get-files", async (req, res) => {
  try {
    const username = req.query.username;
    const data = await PdfSchema.find({ username }); // Find all PDF documents for the specified username
    res.status(200).json({ status: "ok", data }); // Respond with found documents
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving files"); // Handle error retrieving files
  }
});

// Endpoint to get paginated files by username
app.get("/get-assets-files", async (req, res) => {
  const { username, page = 1, limit = 10 } = req.query;

  try {
    const skip = (page - 1) * limit;

    // Find files for the specified username, skip and limit results, sort by createdAt descending
    const data = await PdfSchema.find({ username })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Count total number of files for the specified username
    const totalFiles = await PdfSchema.countDocuments({ username });

    // Respond with paginated data and pagination metadata
    res.status(200).json({
      status: "ok",
      data,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFiles / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving files"); // Handle error retrieving files
  }
});

// Endpoint to get count of new users registered in the last 7 days
app.get("/new-users", async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const count = await userSchema.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    res.status(200).json({ status: "ok", count }); // Respond with count of new users
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving new users count"); // Handle error retrieving new users count
  }
});

// Endpoint to get total number of users
app.get("/total-users", async (req, res) => {
  try {
    const count = await userSchema.countDocuments({});
    res.status(200).json({ status: "ok", count }); // Respond with total number of users
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving total users count"); // Handle error retrieving total users count
  }
});

// Endpoint to get total number of documents
app.get("/total-documents", async (req, res) => {
  try {
    const count = await PdfSchema.countDocuments({});
    res.status(200).json({ status: "ok", count }); // Respond with total number of documents
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving total documents count"); // Handle error retrieving total documents count
  }
});

// Endpoint to get count of documents for a specific user
app.get('/user-documents', async (req, res) => {
  const { username } = req.query;

  try {
    if (!username) {
      return res.status(400).json({ error: 'Username parameter is required' });
    }

    const count = await PdfSchema.countDocuments({ username });

    if (count === 0) {
      return res.status(404).json({ error: 'User not found or no documents available' });
    }

    res.json({ count }); // Respond with count of documents for the specified user
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving user documents count' }); // Handle error retrieving user documents count
  }
});

// Endpoint to delete a file by ID
app.delete("/delete-file/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PdfSchema.deleteOne({ _id: id }); // Delete the PDF document by ID
    if (result.deletedCount === 0) return res.status(404).send("File not found"); // Handle case where file is not found
    res.send({ message: "File deleted successfully", result }); // Respond with success message
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting file"); // Handle error deleting file
  }
});

// Endpoint to create a new user ID
app.post("/create-id", async (req, res) => {
  try {
    const { username, fullName, password, confirmPassword, hostName, email, phoneNumber } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
    const idcreate = new userSchema({
      username,
      fullName,
      password: hashedPassword,
      confirmPassword: hashedPassword, // Storing hashed password in confirmPassword field for simplicity
      hostName,
      email,
      phoneNumber,
    });
    await idcreate.save(); // Save the new user details
    res.status(201).send("ID Created!"); // Respond with success message
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating ID"); // Handle error creating ID
  }
});

// Endpoint to get all files with pagination
app.get('/all-files', async (req, res) => {
  const { page = 1, limit = 7 } = req.query;
  
  try {
    // Find all files, sort by date descending, skip and limit results for pagination
    const files = await PdfSchema.find()
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totalFiles = await PdfSchema.countDocuments(); // Count total number of files

    // Respond with paginated data and pagination metadata
    res.json({
      data: files,
      currentPage: page,
      totalPages: Math.ceil(totalFiles / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error }); // Handle error fetching files
  }
});

// Export the express app for use in other modules
module.exports = app;










