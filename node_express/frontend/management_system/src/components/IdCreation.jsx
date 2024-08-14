import React, { useState } from 'react';
import '../styles/IdCreation.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const IDCreation = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    hostName: '',
    email: '',
    phoneNumber: ''
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const { username, fullName, password, confirmPassword, hostName, email, phoneNumber } = formData;
      await axios.post('http://localhost:5001/create-id', {
        username,
        fullName,
        password,
        confirmPassword,
        hostName,
        email,
        phoneNumber
      });
      // Clear form data upon successful submission
      setFormData({
        username: '',
        fullName: '',
        password: '',
        confirmPassword: '',
        hostName: '',
        email: '',
        phoneNumber: ''
      });
      // Callback to parent component (AdminDashboard) to handle navigation
      onSubmit();
      toast.success('User ID created!');
    } catch (error) {
      console.error('Error creating ID:', error);
      toast.error('Error creating ID');
    }
  };

  return (
    <div className="form-container">
      <h1>USER ID CREATION</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>
            User Name <span className="required">*</span>
            <input
              type="text"
              name="username"
              placeholder="User Name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            User Full Name <span className="required">*</span>
            <input
              type="text"
              name="fullName"
              placeholder="User Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-row">
        <label>
            Your Password <span className="required">*</span>
            <input
              type="password"
              name="password"
              placeholder="Your Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            </label>
          <label>
            Confirm Password <span className="required">*</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-row full-width">
          <label>
            HostName (Ex: TMLJSRWKSC12345) <span className="required">*</span>
            <input
              type="text"
              name="hostName"
              placeholder="HostName (Ex: TMLJSRWKSC12345)"
              value={formData.hostName}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-row full-width">
          <label>
            Email Id (Ex: ab123456.tml@tatamotors.com) <span className="required">*</span>
            <input
              type="email"
              name="email"
              placeholder="Email Id (Ex: ab123456.tml@tatamotors.com)"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div className="form-row full-width">
          <label>
            Phone Number <span className="required">*</span>
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <button type="submit" className='id-submit'>Submit</button>
      </form>
    </div>
  );
};

export default IDCreation;