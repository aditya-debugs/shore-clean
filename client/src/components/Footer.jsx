import React, { useState } from 'react';
import { Waves, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ChevronRight, Sparkles, Globe } from 'lucide-react';

export default function Footer() {
  const [hoveredIcon, setHoveredIcon] = useState(null);

  const socialLinks = [
    { icon: Facebook, color: 'hover:text-blue-600', name: 'facebook' },
    { icon: Twitter, color: 'hover:text-sky-500', name: 'twitter' },
    { icon: Instagram, color: 'hover:text-pink-500', name: 'instagram' },
    { icon: Linkedin, color: 'hover:text-blue-700', name: 'linkedin' }
  ];

  const quickLinks = ['About', 'Events', 'Volunteer', 'Impact', 'Contact'];

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-cyan-50 border-t border-cyan-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4 group">
              <Waves className="h-8 w-8 text-cyan-600 group-hover:animate-bounce" />
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                ShoreClean
              </span>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
              Transforming coastal cleanup initiatives through AI-powered coordination, 
              community engagement, and transparent impact tracking.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map(({ icon: Icon, color, name }) => (
                <button
                  key={name}
                  onMouseEnter={() => setHoveredIcon(name)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  className={`p-3 rounded-full bg-white shadow-md hover:shadow-lg transform hover:scale-110 transition-all duration-300 text-gray-600 ${color} relative`}
                >
                  <Icon className="h-5 w-5" />
                  {hoveredIcon === name && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-400 rounded-full animate-ping"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-4 w-4 text-cyan-500 mr-2" />
              Quick Links
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-gray-600 hover:text-cyan-600 transition-colors duration-300 flex items-center group">
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-4 w-4 text-cyan-500 mr-2" />
              Connect
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600 hover:text-cyan-600 transition-colors duration-300 group">
                <Mail className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm">hello@shoreclean.org</span>
              </div>
              <div className="flex items-center text-gray-600 hover:text-cyan-600 transition-colors duration-300 group">
                <Phone className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center text-gray-600 hover:text-cyan-600 transition-colors duration-300 group">
                <MapPin className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-cyan-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            © 2024 ShoreClean. Made with 💙 for cleaner oceans.
          </p>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <a href="#privacy" className="hover:text-cyan-600 transition-colors duration-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-cyan-600 transition-colors duration-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
