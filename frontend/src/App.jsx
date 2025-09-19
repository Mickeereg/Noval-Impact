import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import { API_BASE_URL, getAuthHeader } from './config/api';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and get admin status
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Fetch user profile to check admin status
      fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          ...getAuthHeader()
        }
      })
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data.isAdmin || false);
      })
      .catch(err => {
        console.error('Error fetching user profile:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setIsAdmin(false);
      });
    }
  }, []);

  const handleLoginSuccess = (adminStatus) => {
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar isAdmin={isAdmin} />}
        <div className={`${isAuthenticated ? 'pt-16' : ''}`}>
          <Routes>
            <Route 
              path="/" 
              element={
                !isAuthenticated ? (
                  <Auth onLoginSuccess={handleLoginSuccess} />
                ) : (
                  <Navigate to={isAdmin ? "/admin" : "/dashboard"} />
                )
              } 
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  isAdmin ? (
                    <Navigate to="/admin" />
                  ) : (
                    <Dashboard />
                  )
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAuthenticated && isAdmin ? (
                  <AdminPage />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
