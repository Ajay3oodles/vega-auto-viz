import React, { useState, useEffect } from 'react';
import { BarChart3, Moon, Sun, Menu, Settings } from 'lucide-react';

const Header = () => {
  const [theme, setTheme] = useState('light');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Icon container */}
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Analytics Hub
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                AI-Powered Data Visualization
              </p>
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn-icon btn-ghost group relative"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              ) : (
                <Sun className="w-5 h-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
              )}
            </button>

            {/* Settings Button */}
            <button
              className="btn-icon btn-ghost group"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </button>

            {/* User Menu Placeholder */}
            <div className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-semibold">U</span>
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">User</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="btn-icon btn-ghost"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="btn-icon btn-ghost"
              aria-label="Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
            <div className="space-y-2">
              <button className="w-full btn-ghost justify-start">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;