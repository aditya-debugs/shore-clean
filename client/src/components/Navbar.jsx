import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Waves, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  
  const { currentUser, logout } = useAuth();
  const isAuthenticated = !!currentUser;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      scrolled ? 'mt-2' : 'mt-6'
    }`}>
      <div className={`w-screen max-w-4xl mx-auto px-6 py-4 rounded-2xl backdrop-blur-lg transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 shadow-lg border border-cyan-100' 
          : 'bg-white/80 shadow-md border border-cyan-50'
      }`}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group cursor-pointer">
            <div className="relative">
              <Waves className="h-8 w-8 text-cyan-600 group-hover:text-cyan-700 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              ShoreClean
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {[
                  { name: 'Events', path: '/events' }, 
                  { name: 'Dashboard', path: '/dashboard' }, 
                  { name: 'Impact', path: '/impact' }
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="px-4 py-2 rounded-xl text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300 font-medium relative group"
                  >
                    {item.name}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-cyan-500 group-hover:w-3/4 transition-all duration-300"></div>
                  </Link>
                ))}
                
                {/* User Menu */}
                <div className="relative ml-4">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl hover:bg-cyan-50 transition-all duration-300"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-gray-700 font-medium">{currentUser?.name || 'User'}</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-cyan-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-cyan-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                          navigate('/', { replace: true });
                        }}
                        className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {[
                  { name: 'About', path: '/about' }, 
                  { name: 'Impact', path: '/impact' }
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="px-4 py-2 rounded-xl text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300 font-medium relative group"
                  >
                    {item.name}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-cyan-500 group-hover:w-3/4 transition-all duration-300"></div>
                  </Link>
                ))}
                <Link 
                  to="/login"
                  className="ml-4 px-4 py-2 text-gray-700 hover:text-cyan-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-cyan-50 transition-colors duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6 text-gray-700" /> : <Menu className="h-6 w-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-cyan-100">
            <div className="flex flex-col space-y-2">
              {isAuthenticated ? (
                <>
                  {[
                    { name: 'Events', path: '/events' }, 
                    { name: 'Dashboard', path: '/dashboard' }, 
                    { name: 'Impact', path: '/impact' },
                    { name: 'Profile', path: '/profile' }
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="px-4 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      navigate('/', { replace: true });
                    }}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 mx-4 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {[
                    { name: 'About', path: '/about' }, 
                    { name: 'Impact', path: '/impact' }
                  ].map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="px-4 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Link 
                    to="/login"
                    className="px-4 py-2 rounded-lg text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 mx-4 text-center block"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Join Now
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};


export default Navbar;

