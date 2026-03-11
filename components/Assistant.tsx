
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  Bot, 
  User, 
  Settings, 
  Zap, 
  Check, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { generateMarketingContent } from '../services/gemini';
import { sendToZapier } from '../services/zapier';
import { db, auth, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from '../firebase';

interface Message {
  id: string;
  text: string;
  sender: 'ai' | 'user';
  timestamp: Date;
}

const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your MarketMind Assistant. I can help you brainstorm campaign ideas, refine your brand voice, or answer marketing questions. How can I help you grow today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zapierUrl, setZapierUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const integrationRef = doc(db, 'users', user.uid, 'integrations', 'zapier-leads');
    const unsubscribe = onSnapshot(integrationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setZapierUrl(data.webhookUrl || '');
        setAutoSync(data.autoSync || false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/integrations/zapier-leads`);
    });

    return () => unsubscribe();
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await generateMarketingContent(input);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      const newMessages = [...messages, userMessage, aiMessage];
      setMessages(newMessages);

      // Auto-sync if enabled
      if (autoSync && zapierUrl) {
        const conversationText = newMessages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
        sendToZapier(zapierUrl, {
          conversation: conversationText,
          timestamp: new Date().toISOString(),
          source: 'MarketMind Assistant (Auto-Sync)'
        });
      }
    } catch (err: any) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: err?.message || "I'm sorry, I encountered an error. Please try again.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToZapier = async () => {
    if (!zapierUrl) {
      setShowSettings(true);
      return;
    }

    setIsSyncing(true);
    const conversationText = messages.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join('\n\n');
    
    const success = await sendToZapier(zapierUrl, {
      conversation: conversationText,
      timestamp: new Date().toISOString(),
      source: 'MarketMind Assistant'
    });

    if (success) {
      setSyncSuccess(true);
      const user = auth.currentUser;
      if (user) {
        const integrationRef = doc(db, 'users', user.uid, 'integrations', 'zapier-leads');
        try {
          await setDoc(integrationRef, { lastTriggered: new Date().toISOString() }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/integrations/zapier-leads`);
        }
      }
      setTimeout(() => setSyncSuccess(false), 3000);
    }
    setIsSyncing(false);
  };

  const saveSettings = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const integrationRef = doc(db, 'users', user.uid, 'integrations', 'zapier-leads');
    try {
      await setDoc(integrationRef, {
        uid: user.uid,
        integrationId: 'zapier-leads',
        webhookUrl: zapierUrl,
        autoSync: autoSync
      }, { merge: true });
      setShowSettings(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/integrations/zapier-leads`);
    }
  };

  return (
    <section className="bg-gray-50 min-h-screen py-12 flex items-center justify-center">
      <div className="max-w-5xl w-full px-4 grid lg:grid-cols-12 gap-8 h-[80vh]">
        
        {/* Left Panel: Info & Tools */}
        <div className="lg:col-span-4 hidden lg:flex flex-col gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-[#4B0082] text-[10px] font-black uppercase tracking-widest border border-violet-100">
               <Zap className="w-3 h-3" />
               Automations
             </div>
             <h2 className="text-3xl font-black text-[#2D004B] tracking-tight leading-tight">Sync your growth.</h2>
             <p className="text-gray-500 text-sm leading-relaxed">
               Connect this assistant to 6,000+ apps using Zapier. Send every conversation to your CRM, Slack, or Google Sheets automatically.
             </p>
             <button 
               onClick={handleSyncToZapier}
               disabled={isSyncing}
               className="w-full py-4 bg-black text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-xl shadow-black/10"
             >
               {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : syncSuccess ? <Check className="w-4 h-4 text-green-400" /> : <Zap className="w-4 h-4 text-yellow-400" />}
               {syncSuccess ? 'Synced to Zapier' : 'Trigger Zapier Webhook'}
             </button>
          </div>

          <div className="bg-[#4B0082] p-8 rounded-[2.5rem] text-white space-y-4">
             <Bot className="w-8 h-8 text-violet-300" />
             <h3 className="text-xl font-black">AI Lead Magnet</h3>
             <p className="text-white/60 text-xs leading-relaxed">Embed this on your site to capture leads while the AI handles initial queries.</p>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/5 border border-gray-100 flex flex-col overflow-hidden relative">
          
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#4B0082]" />
               </div>
               <div>
                 <h4 className="font-black text-black">MarketMind Assistant</h4>
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Gen Active</span>
                 </div>
               </div>
            </div>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6 scrollbar-hide">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-gray-100' : 'bg-violet-100 text-[#4B0082]'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`p-4 rounded-[1.5rem] text-sm font-medium leading-relaxed ${
                    msg.sender === 'user' 
                    ? 'bg-black text-white rounded-tr-none shadow-lg shadow-black/5' 
                    : 'bg-gray-50 text-gray-700 border border-gray-100 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-300" />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-[1.5rem] rounded-tl-none">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Settings Overlay */}
          {showSettings && (
            <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm p-12 animate-in fade-in duration-300">
               <div className="max-w-md mx-auto space-y-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-black">Zapier Webhook</h3>
                    <p className="text-gray-500 text-sm mt-2">Connect your bot to thousands of other apps. Enter your "Catch Hook" URL from Zapier.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Webhook URL</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input 
                          type="text" 
                          value={zapierUrl}
                          onChange={(e) => setZapierUrl(e.target.value)}
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4B0082] rounded-2xl outline-none font-medium text-xs"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={saveSettings}
                      className="w-full py-4 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#2D004B] transition-all"
                    >
                      Save Configuration
                    </button>
                    <button 
                      onClick={() => setShowSettings(false)}
                      className="w-full py-4 bg-gray-100 text-gray-500 rounded-2xl font-black hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
               </div>
            </div>
          )}

          {/* Chat Input */}
          <div className="p-6 bg-white border-t border-gray-100">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your assistant anything..."
                className="w-full pl-6 pr-16 py-5 bg-gray-50 border-2 border-transparent focus:border-violet-200 rounded-3xl outline-none transition-all font-medium placeholder:text-gray-300 shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 bottom-2 px-6 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#2D004B] disabled:opacity-20 transition-all active:scale-95 shadow-xl shadow-indigo-900/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-center text-[8px] text-gray-400 mt-4 uppercase tracking-[0.3em] font-black">
              Market Intelligence Active • Sync leads to Zapier anytime
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Assistant;
