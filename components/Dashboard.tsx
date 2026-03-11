
import React, { useState } from 'react';
import { 
  Type, Video, Camera, BarChart3, Calendar, 
  Target, Mail, Hash, ChevronRight, Wand2, X, Loader2, Sparkles, Copy, Check,
  Palette, Film, MessageSquare, Zap, Globe, Bot
} from 'lucide-react';
import { MarketingTool } from '../types';
import { generateMarketingContent } from '../services/gemini';
import { Page } from '../App';

interface DashboardProps {
  onNavigate?: (page: Page) => void;
}

const tools: MarketingTool[] = [
  {
    id: 'assistant',
    title: 'AI Chat Assistant',
    description: 'Free chatbot for lead capture and quick support.',
    icon: <Bot className="w-6 h-6 text-[#8B5CF6]" />,
    category: 'Automation'
  },
  {
    id: 'automations',
    title: 'Zapier Automations',
    description: 'Connect MarketMind AI to 6,000+ apps. Sync leads and reports instantly.',
    icon: <Zap className="w-6 h-6 text-[#7C3AED]" />,
    category: 'Integration'
  },
  {
    id: 'insights',
    title: 'Market Intelligence',
    description: 'NEW: Research live trends and competitor data grounded by Google Search.',
    icon: <Globe className="w-6 h-6 text-[#8B5CF6]" />,
    category: 'Research'
  },
  {
    id: 'video-lab',
    title: 'AI Video Lab',
    description: 'Generate high-impact marketing videos and reels with the Veo 3.1 engine.',
    icon: <Film className="w-6 h-6 text-[#7C3AED]" />,
    category: 'Video'
  },
  {
    id: 'live-consultant',
    title: 'Live AI Consultant',
    description: 'Real-time voice strategy sessions with a virtual digital marketing expert.',
    icon: <MessageSquare className="w-6 h-6 text-[#8B5CF6]" />,
    category: 'Consulting'
  },
  {
    id: 'creative-studio',
    title: 'AI Creative Studio',
    description: 'Generate studio-quality ad images and visuals for your brand instantly.',
    icon: <Palette className="w-6 h-6 text-[#7C3AED]" />,
    category: 'Visual'
  },
  {
    id: 'caption',
    title: 'AI Caption Generator',
    description: 'Hooks, CTAs, long captions, and ad copy tailored for high engagement.',
    icon: <Type className="w-6 h-6 text-[#8B5CF6]" />,
    category: 'Copy'
  },
  {
    id: 'adfix',
    title: 'Fix My Ad Tool',
    description: 'Improve headlines, copy, creative suggestions and CTA options instantly.',
    icon: <Camera className="w-6 h-6 text-[#7C3AED]" />,
    category: 'Ads'
  },
  {
    id: '6m',
    title: "6M's Campaign Builder",
    description: 'Generate Market, Mission, Message, Media, Money, and Measurement.',
    icon: <BarChart3 className="w-6 h-6 text-[#8B5CF6]" />,
    category: 'Strategy'
  },
  {
    id: 'calendar',
    title: '30-Day Content Calendar',
    description: 'A full month of strategic content mapped out for your brand niche.',
    icon: <Calendar className="w-6 h-6 text-[#7C3AED]" />,
    category: 'Management'
  }
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [activeTool, setActiveTool] = useState<MarketingTool | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleLaunch = (tool: MarketingTool) => {
    if (tool.id === 'creative-studio' && onNavigate) {
      onNavigate('creative-studio');
      return;
    }
    if (tool.id === 'video-lab' && onNavigate) {
      onNavigate('video-lab');
      return;
    }
    if (tool.id === 'live-consultant' && onNavigate) {
      onNavigate('live-consultant');
      return;
    }
    if (tool.id === 'insights' && onNavigate) {
      onNavigate('insights');
      return;
    }
    if (tool.id === 'assistant' && onNavigate) {
      onNavigate('assistant');
      return;
    }
    if (tool.id === 'automations' && onNavigate) {
      onNavigate('automations');
      return;
    }
    setActiveTool(tool);
    setResult('');
    setInputValue('');
  };

  const handleRunTool = async () => {
    if (!inputValue || !activeTool) return;
    setIsLoading(true);
    
    let promptPrefix = "";
    switch(activeTool.id) {
      case 'caption': promptPrefix = "Generate high-engaging social media captions, hooks, and CTAs for: "; break;
      case 'reel': promptPrefix = "Write a 60-second short-form video script with visual cues and pacing for: "; break;
      case 'adfix': promptPrefix = "Critique this ad copy and provide 3 significantly improved versions with better headlines and CTAs: "; break;
      case '6m': promptPrefix = "Create a comprehensive marketing plan using the 6Ms framework (Market, Mission, Message, Media, Money, Measurement) for: "; break;
      case 'calendar': promptPrefix = "Generate a detailed 30-day marketing content calendar in a list format for: "; break;
      case 'stp': promptPrefix = "Perform an STP (Segmentation, Targeting, Positioning) analysis for this brand: "; break;
      case 'outreach': promptPrefix = "Write a professional and personalized influencer outreach email for: "; break;
      case 'hashtags': promptPrefix = "Research and group 30 high-performing hashtags into categories (Niche, Growth, Broad) for: "; break;
      default: promptPrefix = "Analyze and provide professional marketing advice for: ";
    }

    const output = await generateMarketingContent(`${promptPrefix} ${inputValue}`);
    setResult(output);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section className="bg-[#F4F4F4] py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-[#4B0082] text-[8px] font-black uppercase tracking-widest border border-violet-200">
                <Zap className="w-3 h-3" />
                Marketing Suite v2.5
              </div>
              <button 
                onClick={() => onNavigate?.('assistant')}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-gray-500 text-[8px] font-black uppercase tracking-widest border border-gray-200 hover:bg-violet-50 hover:text-[#4B0082] transition-all group"
              >
                <Bot className="w-3 h-3 group-hover:animate-bounce" />
                Quick AI Chat
              </button>
            </div>
            <h2 className="text-4xl font-black text-black mb-2 tracking-tight">Tools Workspace</h2>
            <p className="text-gray-500 font-medium">Streamline your campaign creation with multimodal AI tools.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.id} 
              onClick={() => handleLaunch(tool)}
              className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-[#8B5CF6]/30 transition-all group hover:shadow-2xl hover:shadow-[#8B5CF6]/5 cursor-pointer relative overflow-hidden"
            >
              {(tool.id === 'video-lab' || tool.id === 'live-consultant' || tool.id === 'insights' || tool.id === 'assistant' || tool.id === 'automations') && (
                <div className="absolute top-4 right-4 bg-violet-100 text-[#4B0082] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest z-10 flex items-center gap-1">
                  <span className="w-1 h-1 bg-[#4B0082] rounded-full animate-ping"></span>
                  New
                </div>
              )}
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Wand2 className="w-4 h-4 text-[#8B5CF6]" />
              </div>
              <div className="bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h3 className="text-lg font-black text-black mb-3 group-hover:text-[#8B5CF6] transition-colors leading-tight">
                {tool.title}
              </h3>
              <p className="text-gray-400 text-xs font-medium leading-relaxed mb-8">
                {tool.description}
              </p>
              <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black group-hover:gap-2 transition-all">
                Access Tool
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Tool Modal */}
      {activeTool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl">
                  {activeTool.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-black">{activeTool.title}</h3>
                  <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{activeTool.category} Framework</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTool(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              {!result && !isLoading ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Campaign Context / Objective</label>
                    <textarea 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Enter specific details about your brand, audience, or the campaign you're building..."
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8B5CF6] rounded-3xl p-6 text-lg min-h-[150px] outline-none transition-all placeholder:text-gray-300"
                    />
                  </div>
                  <button 
                    onClick={handleRunTool}
                    disabled={!inputValue}
                    className="w-full py-5 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#2D004B] disabled:opacity-50 transition-all transform active:scale-95"
                  >
                    Synthesize Result
                    <Sparkles className="w-5 h-5 text-violet-300" />
                  </button>
                </div>
              ) : isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 text-[#8B5CF6] animate-spin" />
                    <Sparkles className="w-6 h-6 text-[#7C3AED] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">MarketMind Intelligence Active</h4>
                    <p className="text-gray-400 text-sm">Crafting professional marketing assets based on your prompt.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center bg-violet-50 p-4 rounded-2xl border border-violet-100">
                    <span className="text-[10px] font-black text-[#8B5CF6] flex items-center gap-2 uppercase tracking-widest">
                      <Sparkles className="w-4 h-4" />
                      AI Intelligence Output
                    </span>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-gray-50 transition-all"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      {isCopied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed font-medium pb-10 bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                    {result}
                  </div>
                </div>
              )}
            </div>

            {result && !isLoading && (
              <div className="p-8 border-t border-gray-100 bg-gray-50 flex gap-4">
                <button 
                  onClick={() => setResult('')}
                  className="flex-grow py-4 border-2 border-gray-200 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all"
                >
                  Regenerate
                </button>
                <button 
                  onClick={() => setActiveTool(null)}
                  className="flex-grow py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all"
                >
                  Confirm & Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Dashboard;
