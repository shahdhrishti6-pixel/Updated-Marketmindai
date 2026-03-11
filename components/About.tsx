
import React from 'react';
import { Target, Shield, Zap, Heart } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2">
            <div className="inline-block px-4 py-1.5 bg-blue-50 text-[#00A8E8] text-[10px] font-black uppercase tracking-widest rounded-full mb-8">
              Our Mission
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-black leading-tight mb-8">
              Simplifying Marketing through <span className="text-[#0084FF]">Intelligence</span>
            </h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-8">
              MarketMind AI is built for digital marketers, creators, and students who need smart tools to work faster and create better campaigns. 
            </p>
            <p className="text-xl text-gray-500 leading-relaxed">
              Our goal is to simplify marketing by combining strategy, creativity, and AI into one powerful workspace. We believe that technology should empower creativity, not replace it.
            </p>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="aspect-square bg-gray-100 rounded-[4rem] relative overflow-hidden flex items-center justify-center group">
               <img 
                 src="https://picsum.photos/800/800?grayscale&v=1" 
                 alt="Tech background" 
                 className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
               <div className="absolute bottom-12 left-12 right-12 bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20">
                 <div className="text-3xl font-black text-white mb-2">150k+</div>
                 <div className="text-white/60 text-sm font-bold uppercase tracking-widest">Campaigns Generated</div>
               </div>
             </div>
             {/* Decorative element */}
             <div className="absolute -top-12 -right-12 w-48 h-48 border-[1rem] border-[#00A8E8]/10 rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mt-32">
          {[
            { icon: <Target />, title: 'Goal Oriented', desc: 'Focus on outcomes that matter for your business.' },
            { icon: <Zap />, title: 'Hyper Fast', desc: 'Go from idea to execution in seconds, not hours.' },
            { icon: <Shield />, title: 'Brand Safe', desc: 'AI outputs that respect your brand voice and guidelines.' },
            { icon: <Heart />, title: 'Human First', desc: 'Designed to assist the creator, not replace them.' }
          ].map((item, idx) => (
            <div key={idx} className="space-y-4">
              <div className="w-12 h-12 bg-black text-[#00A8E8] rounded-xl flex items-center justify-center">
                {React.cloneElement(item.icon, { className: 'w-6 h-6' })}
              </div>
              <h4 className="text-xl font-black">{item.title}</h4>
              <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
