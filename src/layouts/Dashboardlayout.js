import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/js/Sidebar";;

const DashboardLayout = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar toggleTheme={toggleTheme} isDarkMode={isDarkMode} />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
