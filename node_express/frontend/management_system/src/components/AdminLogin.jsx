import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/login.css";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
  // State variables to store username and password
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      // Send login request to server
      const { data } = await axios.post('http://localhost:5001/api/admins/adminlog', { username, password });
      // Save admin information in local storage
      localStorage.setItem('admin', JSON.stringify(data.admin));
      // Navigate to admin dashboard on successful login
      navigate('/admin-dashboard');
    } catch (error) {
      // Show error toast notification on login failure
      toast.error("Login failed");
      console.error(error.response ? error.response.data : error.message); // Log the error for debugging
    }
  };

  return (
    <div className="login-container">
      <img 
        src="https://companieslogo.com/img/orig/TATAMOTORS.NS_BIG.D-38f66b91.png?t=1668176380" 
        alt="Top Left" 
        className="top-left-image" 
      />
      <div className="login-form">
        <h1 style={{fontSize:'30px'}}>Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required // Make the field required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // Make the field required
          />
          <button type='submit'>Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

