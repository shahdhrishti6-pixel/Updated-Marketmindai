
import React, { useState } from 'react';
import { Mail, Send, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="bg-white py-40 min-h-[70vh] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black mb-4">Message Received!</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Thanks for reaching out. A MarketMind AI specialist will be in touch with you within 24 hours.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="px-8 py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-all"
        >
          Send Another Message
        </button>
      </section>
    );
  }

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <div className="p-4 bg-gray-50 rounded-3xl w-fit mb-8">
              <Mail className="w-8 h-8 text-[#0084FF]" />
            </div>
            <h1 className="text-5xl font-black text-black mb-8">Let's build something <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A8E8] to-[#0084FF]">legendary.</span></h1>
            <p className="text-xl text-gray-500 leading-relaxed mb-12">
              Have a custom request or want to integrate MarketMind AI into your agency workflow? Our team is ready to help.
            </p>
            
            <div className="space-y-8">
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-2">Our Office</h4>
                <p className="text-lg font-bold">101 Innovation Dr, Silicon Valley, CA</p>
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-widest text-gray-400 mb-2">Partnerships</h4>
                <p className="text-lg font-bold">hello@marketmind.ai</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F4F4F4] p-10 md:p-16 rounded-[4rem]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Name</label>
                  <input required type="text" placeholder="John Doe" className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#00A8E8]" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400">Email</label>
                  <input required type="email" placeholder="john@company.com" className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#00A8E8]" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Brand / Company</label>
                <input required type="text" placeholder="e.g., Pixel Perfect Agency" className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#00A8E8]" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">What you need help with</label>
                <textarea required rows={4} placeholder="Tell us about your project..." className="w-full p-4 rounded-2xl bg-white border-none focus:ring-2 focus:ring-[#00A8E8] resize-none" />
              </div>
              <button className="w-full py-5 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-xl shadow-black/10">
                Send Message
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
