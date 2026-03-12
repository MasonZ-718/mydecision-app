import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Decision } from '../types';
import { Calendar, X } from 'lucide-react';
import { getCategoryTheme } from '../constants';

interface DecisionCardModalProps {
  decision: Decision | null;
  onClose: () => void;
}

// Helper for emotional color coding
function getEmotionColor(state: string | any) {
    switch (state) {
        case 'Calm': return 'bg-sky-400';
        case 'Confident': return 'bg-emerald-400';
        case 'Relieved': return 'bg-teal-400';
        case 'Anxious': return 'bg-orange-400';
        case 'Overwhelmed': return 'bg-rose-400';
        default: return 'bg-zinc-400';
    }
}

export const DecisionCardModal: React.FC<DecisionCardModalProps> = ({ decision, onClose }) => {
  const navigate = useNavigate();

  if (!decision) return null;

  const handleCardClick = (e: React.MouseEvent) => {
      navigate(`/decision/${decision.id}`);
  };

  const categoryTheme = getCategoryTheme(decision.category || '');
  
  // Compatibility: handle legacy revisitValue if revisitDate is missing
  const revisitDate = decision.revisitDate || (decision as any).revisitValue;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm h-[60vh] max-h-[500px] cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick(e);
          }}
        >
          <div className="w-full h-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black p-8 flex flex-col justify-between relative overflow-hidden group hover:border-zinc-700 transition-colors">
            
            {/* Close Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-4 right-4 z-20 p-2 bg-black/40 hover:bg-black/60 rounded-full text-zinc-400 hover:text-white transition-colors backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ambient Category Background */}
            <div className={`absolute -top-20 -right-20 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none ${categoryTheme}`} />

            {/* Top Meta */}
            <div className="relative z-10 flex justify-between items-start pr-8">
                <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full border border-zinc-800/50 backdrop-blur-sm">
                    <div className={`w-2 h-2 rounded-full ${getEmotionColor(decision.emotionalState)}`} />
                    <span className="text-xs font-medium text-zinc-300">
                        {decision.emotionalState === 'Other' ? decision.emotionalStateOther : decision.emotionalState}
                    </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wide font-medium">
                        {decision.category || 'General'}
                    </span>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center py-6">
                <h3 className="text-3xl font-serif text-white leading-tight mb-6 line-clamp-4">
                    {decision.decisionText}
                </h3>
                <div className="pl-4 border-l-2 border-zinc-800">
                    <p className="text-sm text-zinc-500 line-clamp-3 leading-relaxed">
                        {decision.whyText}
                    </p>
                </div>
            </div>

            {/* Bottom Meta */}
            <div className="relative z-10 pt-6 border-t border-zinc-800/50 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2">
                    <span className="text-zinc-600">Created</span>
                    <span className="text-zinc-400">{new Date(decision.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-zinc-400">
                     <Calendar className="w-3.5 h-3.5" />
                     <span>{revisitDate ? new Date(revisitDate).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>

            {/* Tap Hint overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500">
                 <span className="px-4 py-2 bg-black/80 text-zinc-400 text-xs rounded-full border border-zinc-800 backdrop-blur-md">
                    Tap to view details
                 </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
