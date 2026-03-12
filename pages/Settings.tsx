import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Button from '../components/Button';
import { ArrowLeft, Check, Lock, Trash2 } from 'lucide-react';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, unlockPremium } = useStore();

  const handleClearData = () => {
    if(window.confirm("Are you sure? This deletes all decisions permanently.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
        <button 
            onClick={() => navigate('/')} 
            className="mb-6 text-zinc-500 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <h2 className="text-2xl font-semibold text-white mb-8">Settings</h2>

        <div className="space-y-8">
            
            {/* Premium Section */}
            <div className={`p-6 rounded-xl border ${isPremium ? 'bg-emerald-950/30 border-emerald-900/50' : 'bg-zinc-900 border-zinc-800'}`}>
                <h3 className="text-lg font-medium text-white mb-2 flex items-center gap-2">
                    {isPremium ? (
                        <>Premium Active <Check className="w-5 h-5 text-emerald-500" /></>
                    ) : (
                        <>MyDecision Premium <Lock className="w-4 h-4 text-zinc-500" /></>
                    )}
                </h3>
                
                {!isPremium ? (
                    <div className="space-y-4">
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li className="flex gap-2">
                                <span className="text-zinc-600">•</span> Unlimited decisions
                            </li>
                            <li className="flex gap-2">
                                <span className="text-zinc-600">•</span> Future-self messages
                            </li>
                            <li className="flex gap-2">
                                <span className="text-zinc-600">•</span> Early lock override
                            </li>
                        </ul>
                        <Button onClick={unlockPremium} fullWidth>
                            Unlock (Simulated)
                        </Button>
                        <p className="text-xs text-zinc-600 text-center">
                            This is a demo. No payment required.
                        </p>
                    </div>
                ) : (
                    <p className="text-sm text-emerald-500">
                        Thank you for supporting calm software.
                    </p>
                )}
            </div>

            {/* Data Management */}
            <div className="space-y-4">
                 <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">
                    Data & Privacy
                </h3>
                <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
                    <p className="text-sm text-zinc-400 mb-4">
                        All data is stored locally on this device. We cannot see your decisions.
                    </p>
                    <button 
                        onClick={handleClearData}
                        className="text-red-400 text-sm hover:text-red-300 font-medium flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete all data
                    </button>
                </div>
            </div>

        </div>
    </div>
  );
};

export default Settings;