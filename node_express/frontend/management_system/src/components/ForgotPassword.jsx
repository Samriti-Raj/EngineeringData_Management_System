import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/ForgotPassword.css";
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  // State variables for email, new password, and confirm password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  // Function to handle input changes and update corresponding state variables
  const handleChange = (e) => {
    const { id, value } = e.target;
    if (id === 'email') {
      setEmail(value);
    } else if (id === 'password') {
      setPassword(value);
    } else if (id === 'confirm-password') {
      setConfirmPassword(value);
    }
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      // Make API call to reset password
      await axios.post('http://localhost:5001/api/users/reset-password', { email, password });
      toast.success('Password reset successful');
      navigate('/'); // Redirect to home page on successful password reset
    } catch (error) {
      toast.error("Password reset failed");
      console.error(error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className="forgot-password-container">
      <img src="https://companieslogo.com/img/orig/TATAMOTORS.NS_BIG.D-38f66b91.png?t=1668176380" alt="Top Left" className="top-left-image"/>
      <div className="forgot-password-form">
        <h1>Forgot Password</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
          <label htmlFor="password">New Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;


