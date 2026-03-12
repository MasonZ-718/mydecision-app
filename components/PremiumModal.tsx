import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Button from './Button';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ isOpen, onClose }) => {
  const { unlockPremium } = useStore();

  const handleUpgrade = () => {
    unlockPremium();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-6 right-6 top-1/2 -translate-y-1/2 z-[70] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black max-w-md mx-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-amber-900/20 rounded-full border border-amber-500/30 relative">
                <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full"></div>
                <Star className="w-8 h-8 text-amber-500 fill-amber-500/20 relative z-10" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-xl font-serif text-white mb-2">Unlock Full Access</h3>
              <p className="text-zinc-400 text-sm">
                Commit to your clarity with premium features.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="p-1 rounded-full bg-emerald-900/30 border border-emerald-500/30">
                        <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span>Unlimited decisions</span>
                </li>
                <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="p-1 rounded-full bg-emerald-900/30 border border-emerald-500/30">
                        <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span>Future-self messages</span>
                </li>
                 <li className="flex items-center gap-3 text-sm text-zinc-300">
                    <div className="p-1 rounded-full bg-emerald-900/30 border border-emerald-500/30">
                         <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span>Early lock override</span>
                </li>
            </ul>

            <Button fullWidth onClick={handleUpgrade} className="bg-amber-500 hover:bg-amber-400 text-black border-none font-semibold">
                Unlock Premium (Demo)
            </Button>
            <p className="text-xs text-zinc-600 text-center mt-4">
                One-time purchase. No subscriptions.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};