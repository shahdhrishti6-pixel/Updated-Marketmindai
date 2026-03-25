
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Video, 
  Download, 
  RefreshCw, 
  Loader2, 
  AlertCircle, 
  Play, 
  Layers, 
  Zap, 
  Film, 
  Key,
  Layout,
  ImageIcon
} from 'lucide-react';
import { generateAdVideo, generateStoryboard } from '../services/gemini';

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("9:16");
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [storyboard, setStoryboard] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [mode, setMode] = useState<'free' | 'pro'>('free');

  useEffect(() => {
    checkKey();
    // Re-check when window regains focus in case key was selected in Navbar
    window.addEventListener('focus', checkKey);
    const interval = setInterval(checkKey, 3000);
    return () => {
      window.removeEventListener('focus', checkKey);
      clearInterval(interval);
    };
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStoryboard([]);
    
    try {
      if (mode === 'pro') {
        const result = await generateAdVideo({
          prompt,
          aspectRatio
        }, (s) => setStatus(s));
        
        if (result) {
          setVideoUrl(result);
        } else {
          setError("Failed to generate video. This can happen if the project doesn't have Veo access or due to high demand.");
        }
      } else {
        setStatus('Generating Storyboard...');
        const images = await generateStoryboard({
          prompt,
          aspectRatio: aspectRatio as any
        });
        setStoryboard(images);
      }
    } catch (err: any) {
      const errorMessage = err?.message || "";
      if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("PERMISSION_DENIED")) {
        setError("API Key permission issue. Please re-select a valid paid API key from a project with billing enabled.");
        setHasKey(false);
      } else if (errorMessage.includes("Quota exceeded")) {
        setError("Daily quota exceeded. The quota will reset tomorrow. Detailed quota information can be found in the Firebase pricing documentation.");
      } else {
        setError("An unexpected error occurred during rendering. Please check your prompt and try again.");
      }
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <section className="bg-white py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-[#4B0082] text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">
            <Film className="w-3 h-3" />
            {mode === 'pro' ? 'VEO 3.1 Pro Engine' : 'Free Storyboard Engine'}
          </div>
          <h1 className="text-5xl font-black text-[#2D004B] mb-4">AI Video Lab</h1>
          <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
            {mode === 'pro' 
              ? 'Generate high-impact video assets for your ads in seconds. From cinematic product shots to dynamic lifestyle clips.'
              : 'Create a professional 4-frame storyboard for your marketing campaign instantly and for free.'}
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <button 
              onClick={() => setMode('free')}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                mode === 'free' 
                ? 'bg-violet-50 border-[#4B0082] text-[#4B0082]' 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Layout className="w-4 h-4" />
              Free Storyboard
            </button>
            <button 
              onClick={() => setMode('pro')}
              className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${
                mode === 'pro' 
                ? 'bg-violet-50 border-[#4B0082] text-[#4B0082]' 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              Pro Video (Paid)
            </button>
          </div>

          {mode === 'pro' && !hasKey && (
            <div className="mt-8 p-6 bg-amber-50 rounded-3xl border border-amber-200 inline-block max-w-lg">
              <div className="flex items-center gap-3 text-amber-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-black text-xs uppercase tracking-widest">Action Required</span>
              </div>
              <p className="text-amber-700 text-xs mb-4">
                Pro video generation requires a paid Google Cloud project API key. Please select a project with billing enabled.
              </p>
              <button 
                onClick={handleSelectKey}
                className="px-6 py-3 bg-[#4B0082] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:bg-black transition-all"
              >
                <Key className="w-4 h-4" />
                Select Paid API Key
              </button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className={`bg-[#F8FAFC] p-8 rounded-[2.5rem] border border-gray-100 space-y-8 ${mode === 'pro' && !hasKey ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Creative Direction</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={mode === 'pro' 
                    ? "e.g., A cinematic drone shot of a modern electric car speeding through a futuristic neon city..."
                    : "e.g., A luxury skincare product reveal in a minimalist spa setting..."}
                  className="w-full bg-white border-2 border-transparent focus:border-[#8B5CF6] rounded-2xl p-4 text-sm min-h-[140px] outline-none transition-all resize-none placeholder:text-gray-300 shadow-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Output Format</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: '16:9', label: 'Landscape', sub: 'Youtube/TV', icon: <div className="w-6 h-3 border-2 border-current rounded-sm" /> },
                    { id: '9:16', label: 'Vertical', sub: 'TikTok/Reels', icon: <div className="w-3 h-6 border-2 border-current rounded-sm" /> },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1 ${
                        aspectRatio === ratio.id 
                        ? 'border-[#8B5CF6] bg-violet-50 text-[#8B5CF6]' 
                        : 'border-transparent bg-white text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {ratio.icon}
                      <span className="text-[10px] font-black uppercase tracking-widest mt-1">{ratio.label}</span>
                      <span className="text-[8px] opacity-60 uppercase">{ratio.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim() || (mode === 'pro' && !hasKey)}
                className="w-full py-5 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#2D004B] disabled:opacity-50 transition-all transform active:scale-95 shadow-xl shadow-indigo-900/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {mode === 'pro' ? 'Generating Video...' : 'Generating Frames...'}
                  </>
                ) : (
                  <>
                    {mode === 'pro' ? <Zap className="w-5 h-5 text-violet-300" /> : <Layout className="w-5 h-5 text-violet-300" />}
                    {mode === 'pro' ? 'Render Campaign Video' : 'Generate Free Storyboard'}
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}
          </div>

          {/* Player Display */}
          <div className="lg:col-span-8">
            {mode === 'pro' ? (
              <div className={`relative bg-gray-900 rounded-[3rem] overflow-hidden flex items-center justify-center transition-all ${
                aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[75vh] mx-auto'
              }`}>
                {!videoUrl && !isGenerating ? (
                  <div className="text-center p-12 space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                      <Video className="w-10 h-10 text-white/20" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white">Pro Video Engine</h3>
                      <p className="text-gray-500 max-w-xs mx-auto text-xs">Enter a prompt to create short-form viral marketing clips with Veo engine.</p>
                    </div>
                  </div>
                ) : isGenerating ? (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6">
                    <div className="relative">
                      <div className="w-28 h-28 border-4 border-white/5 border-t-violet-500 rounded-full animate-spin"></div>
                      <Layers className="w-10 h-10 text-violet-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-black uppercase tracking-[0.2em] text-[10px]">{status || 'Initiating...'}</p>
                      <p className="text-gray-500 text-[9px] mt-2 uppercase tracking-widest italic">Videos take ~1-2 minutes to render</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <video 
                      src={videoUrl!} 
                      controls 
                      autoPlay 
                      loop
                      className="w-full h-full object-cover animate-in fade-in duration-1000 shadow-2xl"
                    />
                    <div className="absolute bottom-8 right-8">
                      <a 
                        href={videoUrl!} 
                        download="marketmind-video.mp4"
                        className="bg-white text-black px-6 py-3 rounded-full font-black text-xs flex items-center gap-2 hover:bg-gray-100 transition-all shadow-2xl uppercase tracking-widest"
                      >
                        <Download className="w-4 h-4" />
                        Save Export
                      </a>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {storyboard.length === 0 && !isGenerating ? (
                  <div className={`bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex items-center justify-center transition-all ${
                    aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[75vh] mx-auto'
                  }`}>
                    <div className="text-center p-12 space-y-6">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                        <Layout className="w-10 h-10 text-gray-300" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-400">Storyboard Canvas</h3>
                        <p className="text-gray-400 max-w-xs mx-auto text-xs">Generate a 4-frame sequence for your ad campaign for free.</p>
                      </div>
                    </div>
                  </div>
                ) : isGenerating ? (
                  <div className={`bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center space-y-6 transition-all ${
                    aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[75vh] mx-auto'
                  }`}>
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-violet-100 border-t-[#8B5CF6] rounded-full animate-spin"></div>
                      <Sparkles className="w-8 h-8 text-[#8B5CF6] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[#4B0082] font-black uppercase tracking-widest text-[10px] animate-pulse">Sketching frames...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {storyboard.map((img, i) => (
                      <div key={i} className={`relative group bg-gray-100 rounded-3xl overflow-hidden border border-gray-100 ${
                        aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'
                      }`}>
                        <img src={img} alt={`Frame ${i+1}`} className="w-full h-full object-cover" />
                        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                          Frame {i+1}
                        </div>
                        <a 
                          href={img} 
                          download={`frame-${i+1}.png`}
                          className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl text-black opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
               {[
                 { label: 'Engine', value: mode === 'pro' ? 'VEO 3.1' : 'Flash Image' },
                 { label: 'Cost', value: mode === 'pro' ? 'Paid' : 'Free' },
                 { label: 'Latency', value: mode === 'pro' ? 'Medium' : 'Ultra-Fast' },
                 { label: 'Output', value: mode === 'pro' ? 'Video' : 'Storyboard' },
               ].map((stat, i) => (
                 <div key={i} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
                    <div className="text-xs font-black text-[#4B0082] mt-1">{stat.value}</div>
                 </div>
               ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VideoLab;
