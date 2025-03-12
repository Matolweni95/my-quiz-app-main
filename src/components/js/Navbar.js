import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const darkModeEnabled = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModeEnabled);
    document.documentElement.classList.toggle('dark', darkModeEnabled);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode.toString());
      document.documentElement.classList.toggle('dark', newMode);
      return newMode;
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="bg-background-card border-b border-border shadow-sm transition-all duration-default">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end items-center h-16">

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <button className="button">
                    Dashboard
                  </button>
                </Link>
                <button onClick={handleLogout} className="button">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="button">
                    Login
                  </button>
                </Link>
                <Link to="/signup">
                  <button className="button">
                    Sign Up
                  </button>
                </Link>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-background transition-all duration-default"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-text" />
              ) : (
                <Sun className="w-5 h-5 text-text" />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
