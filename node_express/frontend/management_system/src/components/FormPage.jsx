import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

const FormPage = ({ onUploadSuccess, onClose, editFile }) => {
  // State variables for form inputs
  const [title, setTitle] = useState('');
  const [application, setApplication] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [file, setFile] = useState(null);

  // If editFile is provided, pre-fill the form with existing file data
  useEffect(() => {
    if (editFile) {
      setTitle(editFile.title);
      setApplication(editFile.application);
      setDescription(editFile.description);
      setDate(new Date(editFile.date).toISOString().split('T')[0]); // Ensure date is in YYYY-MM-DD format
    }
  }, [editFile]);

  // Function to handle form submission for both uploading and updating a file
  const submitImage = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const user = JSON.parse(localStorage.getItem('user'));
    formData.append('title', title);
    formData.append('application', application);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('username', user.username);
    if (file) {
      formData.append('file', file);
    }

    try {
      // Determine the URL and method based on whether it's an update or a new upload
      const url = editFile
        ? `http://localhost:5001/update-file/${editFile._id}`
        : 'http://localhost:5001/upload-files';
      const method = editFile ? 'put' : 'post';

      const result = await axios({
        method,
        url,
        data: formData,
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });

      // Call success callback and close the form on successful upload/update
      onUploadSuccess(result.data);
      onClose();
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  return (
    <div style={{height:'60%'}}>
      <h2>{editFile ? 'Edit File' : 'Upload Form'}</h2>
      <form onSubmit={submitImage}>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="application">Application</label>
        <select
          name="application"
          required
          value={application}
          onChange={(e) => setApplication(e.target.value)}
        >
          <option value="">Select an option</option>
          <option value="Vehicle power distribution">Vehicle power distribution</option>
          <option value="Calculate CG">Calculate CG</option>
          <option value="Brake response">Brake response</option>
        </select>
        <label htmlFor="description">Description</label>
        <input
          type="text"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <label htmlFor="date">Date</label>
        <input
          type="date"
          name="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <label htmlFor="file">File</label>
        <input
          type="file"
          name="file"
          style={{fontSize:'16px'}}
          accept=".pdf,.ppt,.pptx,.txt,.xml,.yef"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="button-container">
          <button type="submit" className='btn'>
            {editFile ? 'Update' : 'Save'}
          </button>
          <button type="button" className='btn' onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormPage;




