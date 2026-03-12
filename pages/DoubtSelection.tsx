import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const DoubtSelection: React.FC = () => {
  const { decisions } = useStore();
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in duration-500">
         <button 
            onClick={() => navigate('/')} 
            className="mb-6 text-zinc-500 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-semibold text-white">Which decision is troubling you?</h2>
            <p className="text-zinc-500">Select an anchor to revisit.</p>
        </div>

        <div className="space-y-3">
             {decisions.length === 0 ? (
                 <div className="text-center py-10 text-zinc-500">
                     No decisions found to doubt.
                 </div>
             ) : (
                 decisions.map((decision, i) => (
                     <motion.div
                        key={decision.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(`/decision/${decision.id}?mode=doubt`)}
                        className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 hover:bg-rose-950/10 hover:border-rose-900/30 cursor-pointer transition-all group"
                     >
                         <div className="flex justify-between items-center">
                             <h3 className="text-white font-medium truncate pr-4">{decision.decisionText}</h3>
                             <HelpCircle className="w-4 h-4 text-zinc-600 group-hover:text-rose-400" />
                         </div>
                         <p className="text-xs text-zinc-500 mt-1">
                            {new Date(decision.createdAt).toLocaleDateString()}
                         </p>
                     </motion.div>
                 ))
             )}
        </div>
    </div>
  );
};

export default DoubtSelection;