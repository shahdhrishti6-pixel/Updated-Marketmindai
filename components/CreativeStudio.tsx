
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Download, 
  RefreshCw, 
  Layout, 
  Maximize2, 
  Loader2,
  AlertCircle,
  Check,
  Zap
} from 'lucide-react';
import { generateAdImage } from '../services/gemini';
import { sendToZapier } from '../services/zapier';
import { db, auth, doc, onSnapshot, setDoc, handleFirestoreError, OperationType } from '../firebase';

const CreativeStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
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

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const result = await generateAdImage({
        prompt,
        aspectRatio
      });
      
      if (result) {
        setGeneratedImage(result);

        // Auto-sync if enabled
        if (autoSync && zapierUrl) {
          sendToZapier(zapierUrl, {
            imageUrl: result,
            prompt: prompt,
            aspectRatio: aspectRatio,
            timestamp: new Date().toISOString(),
            source: 'Creative Studio (Auto-Sync)'
          });
        }
      } else {
        setError("Failed to generate image. Please try a different prompt.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncToZapier = async () => {
    if (!zapierUrl || !generatedImage) return;

    setIsSyncing(true);
    const success = await sendToZapier(zapierUrl, {
      imageUrl: generatedImage,
      prompt: prompt,
      aspectRatio: aspectRatio,
      timestamp: new Date().toISOString(),
      source: 'Creative Studio'
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

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `marketmind-ad-${Date.now()}.png`;
    link.click();
  };

  return (
    <section className="bg-[#F8FAFC] py-12 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Panel: Controls */}
          <div className="lg:w-1/3 space-y-8 sticky top-24">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 text-[#4B0082] text-[10px] font-black uppercase tracking-widest mb-6 border border-violet-200">
                <Sparkles className="w-3 h-3" />
                Creative Studio
              </div>
              <h1 className="text-4xl font-black text-[#2D004B] mb-4">AI Ad Designer</h1>
              <p className="text-gray-500 leading-relaxed">
                Generate professional advertising creative instantly. Perfect for Facebook ads, Instagram reels, or website banners.
              </p>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Visual Prompt</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., A minimalist perfume bottle on a volcanic rock surrounded by purple flowers, cinematic lighting..."
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#8B5CF6] rounded-2xl p-4 text-sm min-h-[120px] outline-none transition-all resize-none placeholder:text-gray-300"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Format / Ratio</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: '1:1', label: 'Square', icon: <div className="w-4 h-4 border-2 border-current rounded-sm" /> },
                    { id: '16:9', label: 'Wide', icon: <div className="w-6 h-3 border-2 border-current rounded-sm" /> },
                    { id: '9:16', label: 'Story', icon: <div className="w-3 h-6 border-2 border-current rounded-sm" /> },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as any)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${
                        aspectRatio === ratio.id 
                        ? 'border-[#8B5CF6] bg-violet-50 text-[#8B5CF6]' 
                        : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {ratio.icon}
                      <span className="text-[10px] font-bold uppercase tracking-widest">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-5 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#2D004B] disabled:opacity-50 transition-all transform active:scale-95 shadow-lg shadow-indigo-900/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Designing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Asset
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 text-red-600">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Right Panel: Display */}
          <div className="lg:w-2/3 w-full">
            <div className={`relative bg-gray-100 rounded-[3rem] overflow-hidden flex items-center justify-center transition-all ${
              aspectRatio === '1:1' ? 'aspect-square' : aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] max-h-[80vh] mx-auto'
            }`}>
              {!generatedImage && !isGenerating ? (
                <div className="text-center p-12 space-y-6">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <ImageIcon className="w-10 h-10 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-400">Your vision starts here</h3>
                    <p className="text-gray-400 max-w-xs mx-auto text-sm mt-2">Describe your product and setting to generate studio-quality advertising imagery.</p>
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-violet-100 border-t-[#8B5CF6] rounded-full animate-spin"></div>
                    <Sparkles className="w-8 h-8 text-[#8B5CF6] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[#4B0082] font-black uppercase tracking-widest text-xs animate-pulse">Rendering Masterpiece...</p>
                </div>
              ) : (
                <>
                  <img 
                    src={generatedImage!} 
                    alt="Generated Advertisement" 
                    className="w-full h-full object-cover animate-in fade-in duration-700"
                  />
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                    <button 
                      onClick={downloadImage}
                      className="bg-white/90 backdrop-blur-md text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-xl"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    {zapierUrl && (
                      <button 
                        onClick={handleSyncToZapier}
                        disabled={isSyncing}
                        className="bg-white/90 backdrop-blur-md text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-white transition-all shadow-xl disabled:opacity-50"
                      >
                        {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : syncSuccess ? <Check className="w-4 h-4 text-green-500" /> : <Zap className="w-4 h-4 text-yellow-500" />}
                        {syncSuccess ? 'Synced' : 'Sync to Zapier'}
                      </button>
                    )}
                    <button 
                      onClick={handleGenerate}
                      className="bg-black/90 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-black transition-all shadow-xl"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Studio Lighting', icon: <Sparkles className="w-4 h-4" />, desc: 'AI simulates professional lighting rigs.' },
                { title: 'Commercial Ready', icon: <Check className="w-4 h-4" />, desc: 'High-res assets ready for social media.' },
                { title: 'Brand Alignment', icon: <Layout className="w-4 h-4" />, desc: 'Maintains consistency across ratios.' },
              ].map((feature, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-start gap-4">
                  <div className="p-2 bg-violet-50 text-[#8B5CF6] rounded-lg">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-black">{feature.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CreativeStudio;
