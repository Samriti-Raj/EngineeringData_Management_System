// src/App.js
import {React,useState} from 'react';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx'
import ForgotPassword from './components/ForgotPassword.jsx';
import AdminLogin from './components/AdminLogin.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import IDCreation from './components/IdCreation.jsx';
import Reports from './components/Reports.jsx';

const App = () => {
    const [showForm, setShowForm] = useState(false);

  const handleIdCreation = () => {
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };
    console.log("App component rendered");
    return (
        <>
        <Router>
            <Routes>
                <Route path="/" element={<Login/>} />
                <Route path="/dashboard" element={<Dashboard />}/> 
                <Route path="/reset-password" element={<ForgotPassword />} />
                <Route path="/admin-login" element={<AdminLogin />} />
            </Routes>
            <div className={`app-container ${showForm ? 'blur' : ''}`}>
        <Routes>
          <Route 
            path="/admin-dashboard" 
            element={<AdminDashboard onIdCreationClick={handleIdCreation} />} 
          />
          <Route 
            path="/reports" 
            element={<Reports onIdCreationClick={handleIdCreation} />} 
          />
        </Routes>
      </div>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <div className="close-button" onClick={closeForm}>&times;</div>
            <IDCreation onSubmit={closeForm} />
          </div>
        </div>
      )}
        </Router>
        </>
    );
};

export default App;
