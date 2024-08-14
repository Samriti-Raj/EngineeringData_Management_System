const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
  pdf: String,
  username: String,
  title: String,
  application: String,
  description: String,
  date: Date,
  previousVersions: [
    {
      pdf: String,
      title: String,
      application: String,
      description: String,
      date: Date,
      updatedAt: { type: Date, default: Date.now },
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PdfDetails', PdfSchema);


