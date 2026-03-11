
import React from 'react';
import { Twitter, Linkedin, Instagram, ArrowUpRight } from 'lucide-react';
import { Page } from '../App';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="p-1.5 bg-white rounded-lg">
                <Logo size={28} className="text-[#4B0082]" />
              </div>
              <span className="text-xl font-extrabold tracking-tighter text-white">
                MARKETMIND<span className="text-[#8B5CF6]">AI</span>
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering the next generation of marketers with cutting-edge artificial intelligence and professional strategy frameworks.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-[#8B5CF6] transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-[#8B5CF6] transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-[#8B5CF6] transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-[#8B5CF6]">Platform</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><button onClick={() => onNavigate('tools')} className="hover:text-white transition-colors">AI Tools</button></li>
              <li><button onClick={() => onNavigate('templates')} className="hover:text-white transition-colors">Frameworks</button></li>
              <li><button onClick={() => onNavigate('insights')} className="hover:text-white transition-colors">Marketing Insights</button></li>
              <li><button onClick={() => onNavigate('ai-center')} className="hover:text-white transition-colors">AI Command Center</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-sm uppercase tracking-widest mb-8 text-[#8B5CF6]">Resources</h4>
            <ul className="space-y-4 text-gray-400 font-medium">
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Marketing Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-1">Community <ArrowUpRight className="w-3 h-3"/></a></li>
            </ul>
          </div>

          <div className="bg-indigo-900/10 p-8 rounded-3xl border border-indigo-500/20">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4">Weekly Strategy</h4>
            <p className="text-sm text-gray-300 mb-6">Get the latest AI prompts and marketing hacks delivered to your inbox.</p>
            <div className="relative">
              <input type="email" placeholder="Email address" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-sm focus:ring-1 focus:ring-[#8B5CF6] focus:border-transparent" />
              <button className="absolute right-2 top-2 bottom-2 px-4 bg-white text-black rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors">Join</button>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">© 2024 MarketMind AI. Built for the futuristic marketer.</p>
          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
