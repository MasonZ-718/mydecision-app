import React from 'react';
import { Lock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const PremiumBanner: React.FC = () => {
    const { isPremium } = useStore();
    const navigate = useNavigate();

    if (isPremium) return null;

    return (
        <div 
            onClick={() => navigate('/settings')}
            className="mt-8 p-4 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-3 cursor-pointer hover:bg-zinc-800 transition-colors group"
        >
            <div className="p-2 bg-black rounded-full shadow-sm border border-zinc-800 group-hover:border-zinc-700">
                <Lock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
                <h4 className="text-sm font-medium text-white">Unlock Full Access</h4>
                <p className="text-xs text-zinc-500 group-hover:text-zinc-400">Unlimited decisions, future notes & reminders.</p>
            </div>
        </div>
    );
};

export default PremiumBanner;