import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Home, Sun, Moon, Menu, X, TrendingUp} from "lucide-react";


const Sidebar = ({ toggleTheme, isDarkMode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-background-card h-auto p-6 border-r border-border hidden md:flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-semibold mb-6">Coding Quiz App</h1>
          <nav className="space-y-2">
            <Link to="/dashboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-hover-color">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>
            {/* <Link to="/quizzes" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-hover-color">
              <Book className="w-5 h-5" />
              <span>Quizzes</span>
            </Link> */}
            {/* <Link to="/statistics" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-hover-color">
              <BarChart2 className="w-5 h-5" />
              <span>Statistics</span>
            </Link> */}
            <Link to="/dashboard/leaderboard" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-hover-color">
              <TrendingUp className="w-5 h-5" />
              <span>Leaderboard</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-4">
          <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-hover-color">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <button onClick={toggleTheme} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-hover-color">
            {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            <span>Toggle Theme</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="p-2 md:hidden fixed top-4 left-4 bg-background-card rounded-lg border border-border"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-background z-50 md:hidden flex flex-col p-6">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-hover-color rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mt-8 space-y-4">
            <Link to="/dashboard" className="block p-3 rounded-lg hover:bg-hover-color">Dashboard</Link>
            {/* <Link to="/quizzes" className="block p-3 rounded-lg hover:bg-hover-color">Quizzes</Link>
            <Link to="/statistics" className="block p-3 rounded-lg hover:bg-hover-color">Statistics</Link> */}
            <Link to="/dashboard/leaderboard" className="block p-3 rounded-lg hover:bg-hover-color">Leaderboard</Link>
            <Link to="/" className="block p-3 rounded-lg hover:bg-hover-color">Home</Link>
            <button onClick={toggleTheme} className="block w-full text-left p-3 rounded-lg hover:bg-hover-color">
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;