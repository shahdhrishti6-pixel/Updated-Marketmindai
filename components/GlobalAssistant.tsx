
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  X, 
  Zap, 
  Loader2, 
  Sparkles, 
  Check, 
  MessageCircle,
  Settings,
  Link as LinkIcon,
  Key
} from 'lucide-react';
import { generateMarketingContent } from '../services/gemini';
import { sendToZapier } from '../services/zapier';

const GlobalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{id: string, text: string, sender: 'ai' | 'user'}[]>([
    { id: '1', text: "Quick marketing help?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showZapierSettings, setShowZapierSettings] = useState(false);
  const [zapierUrl, setZapierUrl] = useState(() => localStorage.getItem('marketmind_zapier_url') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(true);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    try {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (e) {
      console.error("Key check failed", e);
    }
  };

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now().toString(), text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateMarketingContent(input);
      if (response.includes("API Key is missing")) {
        setHasKey(false);
      }
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: response, sender: 'ai' }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    if (!zapierUrl) {
      setShowZapierSettings(true);
      return;
    }
    setIsSyncing(true);
    const text = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    const success = await sendToZapier(zapierUrl, {
      conversation: text,
      timestamp: new Date().toISOString(),
      source: 'Global Floating Assistant'
    });
    if (success) {
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }
    setIsSyncing(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[999] flex flex-col items-end">
      {/* Mini Chat Window - Optimized for screen visibility */}
      {isOpen && (
        <div className="mb-3 w-[240px] h-[340px] bg-white rounded-[1.25rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header - Minimalist */}
          <div className="p-2 bg-[#4B0082] text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">
                <Bot className="w-3 h-3" />
              </div>
              <h4 className="text-[8px] font-black uppercase tracking-widest">Assistant</h4>
            </div>
            <div className="flex items-center gap-0.5">
              <button 
                onClick={() => setShowZapierSettings(!showZapierSettings)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <Settings className="w-2.5 h-2.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-2.5 overflow-y-auto space-y-2.5 scrollbar-hide bg-gray-50/50 relative">
            {!hasKey && (
              <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm p-4 flex flex-col items-center justify-center text-center space-y-3">
                <Key className="w-6 h-6 text-[#4B0082]" />
                <h5 className="text-[10px] font-black uppercase tracking-widest text-[#2D004B]">API Key Required</h5>
                <p className="text-[8px] text-gray-500 leading-relaxed">To use AI features, please select a valid API key from your Google Cloud project.</p>
                <button 
                  onClick={handleSelectKey}
                  className="w-full py-2 bg-[#4B0082] text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Select Key
                </button>
              </div>
            )}
            {showZapierSettings ? (
              <div className="absolute inset-0 z-20 bg-white p-4 flex flex-col items-center justify-center text-center space-y-2">
                <Zap className="w-3 h-3 text-yellow-500" />
                <h5 className="text-[8px] font-black uppercase tracking-widest">Webhook</h5>
                <input 
                  type="text" 
                  value={zapierUrl}
                  onChange={(e) => setZapierUrl(e.target.value)}
                  placeholder="URL..."
                  className="w-full p-1.5 bg-gray-50 border border-gray-100 rounded text-[8px] outline-none"
                />
                <button 
                  onClick={() => {
                    localStorage.setItem('marketmind_zapier_url', zapierUrl);
                    setShowZapierSettings(false);
                  }}
                  className="w-full py-1.5 bg-[#4B0082] text-white rounded text-[8px] font-black uppercase"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[90%] p-1.5 rounded-lg text-[9px] font-medium leading-tight ${
                      msg.sender === 'user' 
                      ? 'bg-black text-white rounded-tr-none' 
                      : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 px-1.5 py-1 rounded-md flex gap-0.5">
                      <div className="w-0.5 h-0.5 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-0.5 h-0.5 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Footer - Shrunken components */}
          <div className="p-1.5 bg-white border-t border-gray-100 space-y-1 shrink-0">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask..."
                className="w-full pl-2 pr-7 py-1.5 bg-gray-50 rounded-md text-[9px] border border-transparent focus:border-violet-100 outline-none"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-0.5 top-0.5 bottom-0.5 w-5 flex items-center justify-center bg-[#4B0082] text-white rounded hover:bg-black transition-colors disabled:opacity-20"
              >
                <Send className="w-2 h-2" />
              </button>
            </form>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full py-1 bg-gray-50 border border-gray-100 rounded flex items-center justify-center gap-1 hover:bg-gray-100 transition-colors"
            >
              {isSyncing ? <Loader2 className="w-2 h-2 animate-spin" /> : <Zap className={`w-2 h-2 ${syncSuccess ? 'text-green-500' : 'text-yellow-500'}`} />}
              <span className="text-[6px] font-black uppercase tracking-widest text-gray-400">
                {syncSuccess ? 'Synced' : 'Zapier Sync'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Bubble */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 relative ${
          isOpen ? 'bg-black text-white' : 'bg-[#4B0082] text-white'
        }`}
      >
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#4B0082] animate-ping opacity-20"></span>
        )}
        {isOpen ? <X className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
      </button>
    </div>
  );
};

export default GlobalAssistant;
