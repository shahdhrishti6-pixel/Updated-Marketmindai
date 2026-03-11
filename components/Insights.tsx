
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Globe, 
  TrendingUp, 
  ExternalLink, 
  Loader2, 
  Sparkles, 
  FileSearch,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { researchMarketTrends, MarketResearchResult } from '../services/gemini';
import { sendToZapier } from '../services/zapier';
import { db, auth, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from '../firebase';

const Insights: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<MarketResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zapierUrl, setZapierUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const integrationRef = doc(db, 'users', user.uid, 'integrations', 'zapier-reports');
    const unsubscribe = onSnapshot(integrationRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setZapierUrl(data.webhookUrl || '');
        setAutoSync(data.autoSync || false);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/integrations/zapier-reports`);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      const data = await researchMarketTrends(query);
      if (data) {
        setResult(data);
        
        // Auto-sync if enabled
        if (autoSync && zapierUrl) {
          sendToZapier(zapierUrl, {
            report: data.text,
            query: query,
            sources: data.sources,
            timestamp: new Date().toISOString(),
            source: 'Market Intelligence Hub (Auto-Sync)'
          });
        }
      } else {
        setError("Unable to retrieve live data. Please check your connection.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while researching global trends.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSyncToZapier = async () => {
    if (!zapierUrl || !result) return;

    setIsSyncing(true);
    const success = await sendToZapier(zapierUrl, {
      report: result.text,
      query: query,
      sources: result.sources,
      timestamp: new Date().toISOString(),
      source: 'Market Intelligence Hub'
    });

    if (success) {
      setSyncSuccess(true);
      const user = auth.currentUser;
      if (user) {
        const integrationRef = doc(db, 'users', user.uid, 'integrations', 'zapier-reports');
        try {
          await setDoc(integrationRef, { lastTriggered: new Date().toISOString() }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/integrations/zapier-reports`);
        }
      }
      setTimeout(() => setSyncSuccess(false), 3000);
    }
    setIsSyncing(false);
  };

  const suggestQueries = [
    "Skincare marketing trends on TikTok 2024",
    "SaaS competitor analysis for project management tools",
    "Luxury fashion consumer behavior shifts in Q3",
    "Best performing ad hooks for e-commerce apps"
  ];

  return (
    <section className="bg-white py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start mb-12 gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-[#4B0082] text-[10px] font-black uppercase tracking-widest mb-6 border border-violet-100">
              <Globe className="w-3 h-3" />
              Live Search Grounding
            </div>
            <h1 className="text-4xl font-black text-[#2D004B] mb-4 tracking-tight">Market Intelligence Hub</h1>
            <p className="text-gray-500 leading-relaxed">
              Research real-time market trends, competitive strategies, and audience shifts using verified web data. Grounded by Google Search.
            </p>
          </div>
          
          <div className="bg-[#F8FAFC] p-6 rounded-3xl border border-gray-100 w-full lg:w-auto flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white rounded-2xl shadow-sm">
                 <ShieldCheck className="w-6 h-6 text-green-500" />
               </div>
               <div>
                 <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Data Integrity</div>
                 <div className="text-xs font-bold text-black">Verified Sources</div>
               </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Sidebar - Research Desk */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
              <form onSubmit={handleSearch} className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Research Topic</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. AI trends in retail..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent focus:border-[#8B5CF6] rounded-2xl outline-none transition-all shadow-sm font-medium"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSearching || !query.trim()}
                  className="w-full py-4 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#2D004B] disabled:opacity-50 transition-all transform active:scale-95 shadow-lg shadow-indigo-900/10"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSearch className="w-4 h-4" />}
                  {isSearching ? 'Analyzing Web...' : 'Conduct Research'}
                </button>
              </form>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Popular Queries</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestQueries.map((q, i) => (
                    <button 
                      key={i}
                      onClick={() => { setQuery(q); handleSearch(); }}
                      className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold text-gray-500 hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#4B0082] p-8 rounded-[2.5rem] text-white space-y-4">
              <TrendingUp className="w-8 h-8 text-violet-300" />
              <h4 className="text-xl font-black leading-tight">Identify Emerging Opportunities</h4>
              <p className="text-white/60 text-xs leading-relaxed">Our AI scans global databases to bring you the most relevant marketing insights before they hit the mainstream.</p>
            </div>
          </div>

          {/* Report Area */}
          <div className="lg:col-span-8 min-h-[600px] flex flex-col">
            {!result && !isSearching ? (
              <div className="flex-grow bg-[#F8FAFC] rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-12 text-center space-y-6">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                  <BookOpen className="w-10 h-10 text-gray-200" />
                </div>
                <div className="max-w-xs">
                  <h3 className="text-lg font-bold text-gray-400">Empty Intelligence Desk</h3>
                  <p className="text-gray-400 text-xs mt-2">Submit a research query to generate a comprehensive, grounded marketing report.</p>
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex-grow bg-white border border-gray-100 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center space-y-8 animate-pulse">
                <div className="relative">
                   <div className="w-32 h-32 border-4 border-violet-50 border-t-[#8B5CF6] rounded-full animate-spin"></div>
                   <Globe className="w-12 h-12 text-[#8B5CF6] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-[#2D004B] uppercase tracking-[0.2em]">Crawling Global Data</h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Synthesizing Market Reports...</p>
                </div>
              </div>
            ) : (
              <div className="flex-grow bg-white border border-gray-100 rounded-[3rem] overflow-hidden flex flex-col shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="p-10 border-b border-gray-50 flex justify-between items-center bg-[#F8FAFC]">
                   <div className="flex items-center gap-3">
                     <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
                     <h3 className="text-lg font-black text-black">Market Research Report</h3>
                   </div>
                   <div className="flex items-center gap-4">
                     {zapierUrl && (
                       <button 
                         onClick={handleSyncToZapier}
                         disabled={isSyncing}
                         className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#8B5CF6] hover:text-[#8B5CF6] transition-all disabled:opacity-50"
                       >
                         {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : syncSuccess ? <Check className="w-3 h-3 text-green-500" /> : <Zap className="w-3 h-3 text-yellow-500" />}
                         {syncSuccess ? 'Synced' : 'Sync to Zapier'}
                       </button>
                     )}
                     <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                       Live Grounding Active
                     </div>
                   </div>
                </div>

                <div className="p-10 flex-grow prose prose-indigo max-w-none text-gray-700 leading-relaxed font-medium overflow-y-auto max-h-[500px] scrollbar-hide">
                   <div className="whitespace-pre-wrap">
                     {result?.text}
                   </div>
                </div>

                {/* Citations/Sources - Crucial for Grounding Rule */}
                <div className="p-10 bg-[#F8FAFC] border-t border-gray-100">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BookOpen className="w-3 h-3" />
                    Data Sources & References
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result?.sources.length ? result.sources.map((source, i) => (
                      <a 
                        key={i} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-[#8B5CF6] transition-all"
                      >
                        <div className="flex flex-col truncate pr-4">
                          <span className="text-[10px] font-black text-black truncate">{source.title}</span>
                          <span className="text-[8px] text-gray-400 truncate mt-0.5">{new URL(source.uri).hostname}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-300 group-hover:text-[#8B5CF6] shrink-0" />
                      </a>
                    )) : (
                      <div className="text-[10px] text-gray-400 italic">No direct web links extracted. Grounding metadata processed.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Insights;
