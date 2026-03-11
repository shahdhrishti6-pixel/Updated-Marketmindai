
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Sparkles, 
  MessageCircle, 
  Power,
  Zap,
  Loader2,
  PhoneOff
} from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

// Implement decode function as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Implement audio decoding as per guidelines
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Implement encode function as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const LiveConsultant: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [transcription, setTranscription] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    for (const source of sourcesRef.current) {
      source.stop();
    }
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
  };

  const startSession = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing.");
      return;
    }

    setIsConnecting(true);
    setTranscription(["AI Consultant joining..."]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setTranscription(prev => [...prev, "Connected. Speak to your consultant."]);

            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              if (!isMicOn) return;
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message) => {
            // Process audio
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64EncodedAudioString && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle transcriptions
            if (message.serverContent?.outputTranscription) {
               setTranscription(prev => [...prev, `AI: ${message.serverContent?.outputTranscription?.text}`]);
            } else if (message.serverContent?.inputTranscription) {
               setTranscription(prev => [...prev, `You: ${message.serverContent?.inputTranscription?.text}`]);
            }

            if (message.serverContent?.interrupted) {
              for (const source of sourcesRef.current) {
                source.stop();
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error("Live Session Error:", e);
            stopSession();
          },
          onclose: () => {
            stopSession();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a professional, high-level marketing consultant at MarketMind AI. You provide actionable advice on growth hacking, advertising strategy, and brand positioning. Keep your tone sophisticated, encouraging, and expert.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      stopSession();
    }
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <section className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4B0082]/10 text-[#4B0082] text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-3 h-3" />
            Live Strategy Session
          </div>
          <h1 className="text-4xl font-black text-[#2D004B] mb-2">AI Marketing Consultant</h1>
          <p className="text-gray-500">Real-time voice consultation for your brand's biggest challenges.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-900/5 overflow-hidden border border-gray-100 min-h-[500px] flex flex-col">
          
          {/* Status Bar */}
          <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {isActive ? 'Session Active' : isConnecting ? 'Connecting...' : 'Offline'}
              </span>
            </div>
            {isActive && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></div>
                <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>

          {/* Interaction Area */}
          <div className="flex-grow flex flex-col items-center justify-center p-12 text-center relative">
            {!isActive && !isConnecting ? (
              <div className="space-y-8 max-w-sm">
                <div className="w-24 h-24 bg-violet-50 rounded-[2.5rem] flex items-center justify-center mx-auto ring-8 ring-violet-50/50">
                   <MessageCircle className="w-10 h-10 text-[#4B0082]" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Ready to consult?</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Your AI Consultant will analyze your brand and provide real-time strategic insights through voice.</p>
                  <button 
                    onClick={startSession}
                    className="w-full py-5 bg-[#4B0082] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-[#2D004B] transition-all transform active:scale-95 shadow-xl shadow-indigo-900/20"
                  >
                    <Power className="w-5 h-5 text-violet-300" />
                    Connect to Consultant
                  </button>
                </div>
              </div>
            ) : isConnecting ? (
              <div className="flex flex-col items-center gap-6">
                <Loader2 className="w-16 h-16 text-[#4B0082] animate-spin" />
                <p className="text-[#4B0082] font-black uppercase tracking-widest text-[10px] animate-pulse">Initializing Neural Link...</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="flex-grow overflow-y-auto space-y-4 text-left font-medium text-sm text-gray-600 mb-8 max-h-[300px] scrollbar-hide">
                   {transcription.slice(-5).map((line, i) => (
                     <div key={i} className={`p-4 rounded-2xl ${line.startsWith('AI') ? 'bg-violet-50 border border-violet-100' : 'bg-gray-50'}`}>
                        {line}
                     </div>
                   ))}
                </div>
                
                <div className="flex flex-col items-center gap-8">
                  <div className="flex items-center gap-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div 
                        key={i} 
                        className="w-1.5 h-8 bg-[#4B0082] rounded-full animate-bounce" 
                        style={{ animationDelay: `${i * 0.1}s`, opacity: isMicOn ? 1 : 0.2 }}
                      ></div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsMicOn(!isMicOn)}
                      className={`p-6 rounded-full transition-all shadow-xl ${isMicOn ? 'bg-white text-gray-400 hover:bg-gray-50' : 'bg-red-500 text-white'}`}
                    >
                      {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                    </button>
                    <button 
                      onClick={stopSession}
                      className="p-6 bg-black text-white rounded-full transition-all shadow-xl hover:bg-red-600"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Tips */}
          <div className="bg-indigo-900 p-8 text-white/50 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <Zap className="w-3 h-3 text-yellow-400" />
              Tip: Ask about your Q4 marketing budget or local SEO strategy
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveConsultant;
