
import React, { useState } from 'react';
import { Copy, Check, FileText, Search } from 'lucide-react';
import { Template } from '../types';

const templatesData: Template[] = [
  {
    id: '1',
    title: 'Creative Brief Template',
    category: 'Strategy',
    content: "Project Name:\nTarget Audience:\nKey Message:\nDeliverables:\nTimeline:\nBudget:\nCompetitor Analysis:"
  },
  {
    id: '2',
    title: 'AIDA Copywriting Framework',
    category: 'Copywriting',
    content: "Attention: [Grab their eye with a bold statement]\nInterest: [Share a relatable problem or fascinating fact]\nDesire: [Show how your solution changes their life]\nAction: [Clear instructions on what to do next]"
  },
  {
    id: '3',
    title: 'Influencer Outreach Email',
    category: 'Client Management',
    content: "Hi [Name],\n\nI've been following your content on [Platform] and love how you [Specific detail].\n\nI'm reaching out from [Brand] because we think your style perfectly aligns with our upcoming campaign for [Product]. We'd love to discuss a potential partnership.\n\nAre you open to a brief chat next week?\n\nBest, [Your Name]"
  },
  {
    id: '4',
    title: 'Instagram Carousel Layout',
    category: 'Design & Content',
    content: "Slide 1: Hook (Large text, high contrast)\nSlide 2: The Problem (Relatable statement)\nSlide 3: The Secret (The 'aha' moment)\nSlide 4: Deep Dive (3 quick tips)\nSlide 5: Implementation (How to do it today)\nSlide 6: CTA (Save for later, follow for more)"
  },
  {
    id: '5',
    title: 'Monthly Performance Report',
    category: 'Client Management',
    content: "1. Executive Summary\n2. Key KPIs (CTR, ROAS, CPC)\n3. Top Performing Content\n4. Areas for Improvement\n5. Next Month's Strategy"
  },
  {
    id: '6',
    title: '50 Reel Ideas Hook',
    category: 'Design & Content',
    content: "1. 'Why you are failing at X...'\n2. 'The secret to X that nobody tells you...'\n3. 'Stop doing X if you want Y...'\n4. 'Day in the life of a [Job Title]...'\n5. '3 tools that changed my workflow...'"
  }
];

const Templates: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const categories = ['All', 'Copywriting', 'Strategy', 'Design & Content', 'Client Management'];

  const filtered = templatesData.filter(t => 
    (filter === 'All' || t.category === filter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCopy = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section className="bg-white py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-black text-black mb-4">Templates Library</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Copy-paste proven frameworks and outreach scripts used by top 1% agencies.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-[#00A8E8] transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button 
                key={cat} 
                onClick={() => setFilter(cat)}
                className={`whitespace-nowrap px-6 py-4 rounded-2xl text-sm font-bold transition-all ${
                  filter === cat ? 'bg-black text-white shadow-lg shadow-black/10' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((template) => (
            <div key={template.id} className="bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden flex flex-col hover:border-[#0084FF]/20 transition-all hover:shadow-xl group">
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#F4F4F4] rounded-xl group-hover:bg-blue-50 transition-colors">
                    <FileText className="w-6 h-6 text-black group-hover:text-[#0084FF]" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-gray-100 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <h3 className="text-xl font-black text-black mb-4">{template.title}</h3>
              </div>
              
              <div className="bg-[#F9F9F9] m-4 p-6 rounded-3xl text-sm text-gray-600 font-mono whitespace-pre-wrap flex-grow leading-relaxed max-h-[200px] overflow-hidden relative">
                {template.content}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F9F9F9] to-transparent"></div>
              </div>

              <div className="p-8 pt-2">
                <button 
                  onClick={() => handleCopy(template.id, template.content)}
                  className="w-full py-4 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                >
                  {copiedId === template.id ? (
                    <><Check className="w-4 h-4 text-[#00A8E8]" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> Copy Content</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Templates;
