
import React from 'react';
import { ArrowRight, Sparkles, Layout, Zap } from 'lucide-react';
import { Page } from '../App';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      {/* Background elements */}
      <div className="absolute inset-0 grid-pattern opacity-60"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#7C3AED]/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-[#4B0082]/5 rounded-full blur-[100px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-[#7C3AED] text-xs font-bold uppercase tracking-widest mb-6 border border-violet-100">
            <Sparkles className="w-3 h-3" />
            AI-Powered Marketing
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-black tracking-tight mb-8 leading-[1.1]">
            Your Digital Marketing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-[#4B0082] to-[#7C3AED]">Headquarters</span>
          </h1>
          <p className="text-xl text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto">
            MarketMind AI gives marketers the tools, templates, and AI workflows they need to create better campaigns — <span className="text-[#4B0082] font-semibold italic">faster than ever before.</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => onNavigate('tools')}
              className="w-full sm:w-auto px-8 py-4 bg-black text-white rounded-full font-bold flex items-center justify-center gap-2 hover:bg-[#2D004B] transition-all transform hover:scale-105 shadow-xl shadow-black/10"
            >
              <Zap className="w-5 h-5 text-[#8B5CF6]" />
              Open Marketing Tools
            </button>
            <button
              onClick={() => onNavigate('ai-center')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-black border-2 border-gray-100 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all transform hover:scale-105"
            >
              Generate Ideas with AI
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigate('templates')}
              className="w-full sm:w-auto px-8 py-4 bg-transparent text-gray-600 font-bold flex items-center justify-center gap-2 hover:text-black transition-all"
            >
              <Layout className="w-5 h-5" />
              Explore Templates
            </button>
          </div>

          {/* Simple tech-wave visual element */}
          <div className="mt-12 relative h-1 bg-gray-100 rounded-full overflow-hidden max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4B0082] to-[#8B5CF6] animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
