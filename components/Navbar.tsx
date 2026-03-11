
import React, { useState } from 'react';
import { Menu, X, LogOut, Sparkles, Video, MessageSquare, Bot, Key } from 'lucide-react';
import { Page } from '../App';
import Logo from './Logo';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { label: string; value: Page; isNew?: boolean; icon?: React.ReactNode }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Studio', value: 'creative-studio' },
    { label: 'Assistant', value: 'assistant', isNew: true },
    { label: 'Automations', value: 'automations' },
    { label: 'Video Lab', value: 'video-lab' },
    { label: 'Consultant', value: 'live-consultant' },
    { label: 'Tools', value: 'tools' },
    { label: 'Templates', value: 'templates' },
    { label: 'Insights', value: 'insights' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="p-1 bg-[#4B0082] rounded-xl shadow-lg shadow-indigo-900/10">
              <Logo size={32} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-[#2D004B] hidden sm:block">
              Market Mind <span className="text-[#6D28D9]">Ai</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`relative text-xs font-black uppercase tracking-widest transition-all hover:text-[#4B0082] py-2 px-1 ${
                  currentPage === item.value ? 'text-[#4B0082] border-b-2 border-[#4B0082]' : 'text-gray-400'
                }`}
              >
                {item.label}
                {item.isNew && (
                  <span className="absolute -top-2 -right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                  </span>
                )}
              </button>
            ))}
            <div className="h-6 w-[1px] bg-gray-100 mx-2"></div>
            <button
              onClick={async () => {
                try {
                  await (window as any).aistudio.openSelectKey();
                } catch (e) {
                  console.error("Failed to open key selector", e);
                }
              }}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Select API Key"
            >
              <Key className="w-5 h-5" />
            </button>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-black p-2"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300 max-h-[80vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onNavigate(item.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-4 text-sm font-black uppercase tracking-widest rounded-2xl ${
                  currentPage === item.value
                    ? 'bg-violet-50 text-[#4B0082]'
                    : 'text-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  {item.label}
                  {item.isNew && <span className="px-2 py-0.5 bg-violet-100 text-[#4B0082] text-[8px] rounded uppercase tracking-widest">New</span>}
                </div>
              </button>
            ))}
            <button
              onClick={onLogout}
              className="block w-full text-left px-4 py-4 text-sm font-black uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-2xl mt-4"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
