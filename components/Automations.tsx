
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Link as LinkIcon, 
  Check, 
  AlertCircle, 
  Loader2, 
  Settings, 
  ArrowRight, 
  MessageSquare, 
  UserPlus, 
  FileText,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { sendToZapier } from '../services/zapier';
import { db, auth, doc, onSnapshot, setDoc, collection, handleFirestoreError, OperationType } from '../firebase';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'pending';
  webhookUrl: string;
  autoSync: boolean;
  lastTriggered?: string;
}

const Automations: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'zapier-leads',
      name: 'Zapier Lead Capture',
      description: 'Send AI Assistant conversations directly to your CRM or Email list.',
      icon: <UserPlus className="w-6 h-6" />,
      status: 'disconnected',
      webhookUrl: '',
      autoSync: false,
    },
    {
      id: 'zapier-reports',
      name: 'Zapier Report Sync',
      description: 'Export AI-generated marketing strategies to Google Docs or Trello.',
      icon: <FileText className="w-6 h-6" />,
      status: 'disconnected',
      webhookUrl: '',
      autoSync: false,
    }
  ]);

  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const integrationsRef = collection(db, 'users', user.uid, 'integrations');
    const unsubscribe = onSnapshot(integrationsRef, (snapshot) => {
      const dataMap: Record<string, any> = {};
      snapshot.forEach(doc => {
        dataMap[doc.id] = doc.data();
      });

      setIntegrations(prev => prev.map(item => {
        const remoteData = dataMap[item.id];
        if (remoteData) {
          return {
            ...item,
            webhookUrl: remoteData.webhookUrl || '',
            autoSync: remoteData.autoSync || false,
            lastTriggered: remoteData.lastTriggered || undefined,
            status: remoteData.webhookUrl ? 'connected' : 'disconnected'
          };
        }
        return item;
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/integrations`);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (id: string, url: string, auto: boolean) => {
    const user = auth.currentUser;
    if (!user) return;

    const integrationRef = doc(db, 'users', user.uid, 'integrations', id);
    try {
      await setDoc(integrationRef, {
        uid: user.uid,
        integrationId: id,
        webhookUrl: url,
        autoSync: auto,
      }, { merge: true });
      setActiveIntegration(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/integrations/${id}`);
    }
  };

  const handleTest = async (integration: Integration) => {
    if (!integration.webhookUrl) return;
    
    setTestLoading(true);
    const success = await sendToZapier(integration.webhookUrl, {
      conversation: "TEST_AUTOMATION: This is a test trigger from MarketMind AI.",
      timestamp: new Date().toISOString(),
      source: `Test: ${integration.name}`
    });

    if (success) {
      setTestSuccess(true);
      const now = new Date().toISOString();
      const user = auth.currentUser;
      if (user) {
        const integrationRef = doc(db, 'users', user.uid, 'integrations', integration.id);
        try {
          await setDoc(integrationRef, { lastTriggered: now }, { merge: true });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}/integrations/${integration.id}`);
        }
      }
      setTimeout(() => setTestSuccess(false), 3000);
    }
    setTestLoading(false);
  };

  return (
    <section className="bg-[#F8F9FA] min-h-screen py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest border border-yellow-200 mb-4">
              <Zap className="w-3 h-3 fill-yellow-500" />
              Automation Engine v1.0
            </div>
            <h1 className="text-4xl font-black text-black tracking-tight">Integrations Hub</h1>
            <p className="text-gray-500 font-medium mt-2">Connect MarketMind AI to 6,000+ apps via Zapier Webhooks.</p>
          </div>
          <div className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-10 h-10 bg-green-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Status</p>
              <p className="text-sm font-bold text-black">All Systems Operational</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {integrations.map((integration) => (
            <div 
              key={integration.id}
              className="bg-white rounded-[3rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${integration.status === 'connected' ? 'bg-violet-50 text-[#8B5CF6]' : 'bg-gray-50 text-gray-400'}`}>
                  {integration.icon}
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                  integration.status === 'connected' 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-gray-50 text-gray-400 border-gray-100'
                }`}>
                  {integration.status}
                </div>
              </div>

              <h3 className="text-xl font-black text-black mb-2">{integration.name}</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-8">
                {integration.description}
              </p>

              <div className="space-y-4">
                {integration.status === 'connected' ? (
                  <>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Webhook URL</span>
                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      </div>
                      <p className="text-xs font-mono text-gray-500 truncate">{integration.webhookUrl}</p>
                    </div>
                    
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${integration.autoSync ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Auto-Sync {integration.autoSync ? 'ON' : 'OFF'}</span>
                      </div>
                      {integration.lastTriggered && (
                        <span className="text-[10px] font-medium text-gray-400 italic">Last: {integration.lastTriggered}</span>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setActiveIntegration(integration)}
                        className="flex-grow py-4 bg-gray-100 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        Configure
                      </button>
                      <button 
                        onClick={() => handleTest(integration)}
                        disabled={testLoading}
                        className="flex-grow py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                      >
                        {testLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : testSuccess ? <Check className="w-3 h-3 text-green-400" /> : <RefreshCw className="w-3 h-3" />}
                        {testSuccess ? 'Success' : 'Test Zap'}
                      </button>
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => setActiveIntegration(integration)}
                    className="w-full py-5 bg-[#4B0082] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#2D004B] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                  >
                    Setup Integration
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Guide Card */}
          <div className="bg-[#4B0082] rounded-[3rem] p-10 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <ExternalLink className="w-6 h-6 text-violet-200" />
              </div>
              <h3 className="text-2xl font-black mb-4">How to automate?</h3>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                  Create a new Zap in Zapier and choose "Webhooks by Zapier" as the trigger.
                </li>
                <li className="flex gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                  Select "Catch Hook" and copy the unique URL they provide.
                </li>
                <li className="flex gap-3 text-sm text-white/70">
                  <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                  Paste that URL here and click "Test Zap" to send data.
                </li>
              </ul>
            </div>
            <a 
              href="https://zapier.com/apps/webhook/integrations" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-violet-200 hover:text-white transition-colors"
            >
              Open Zapier Dashboard
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {activeIntegration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-50 text-[#8B5CF6] rounded-3xl flex items-center justify-center mx-auto mb-4">
                {activeIntegration.icon}
              </div>
              <h3 className="text-2xl font-black text-black">Setup {activeIntegration.name}</h3>
              <p className="text-gray-500 text-sm mt-2">Enter your Zapier Webhook URL to begin.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Zapier Webhook URL</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="text" 
                    defaultValue={activeIntegration.webhookUrl}
                    id="webhook-url-input"
                    placeholder="https://hooks.zapier.com/hooks/catch/..."
                    className="w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#4B0082] rounded-2xl outline-none font-medium text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-black uppercase tracking-widest">Auto-Sync</p>
                  <p className="text-[10px] text-gray-400 font-medium">Trigger automation on every event</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    id="autosync-toggle"
                    defaultChecked={activeIntegration.autoSync}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
                </label>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setActiveIntegration(null)}
                  className="flex-grow py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const url = (document.getElementById('webhook-url-input') as HTMLInputElement).value;
                    const auto = (document.getElementById('autosync-toggle') as HTMLInputElement).checked;
                    handleSave(activeIntegration.id, url, auto);
                  }}
                  className="flex-grow py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Automations;
