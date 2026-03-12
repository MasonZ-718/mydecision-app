import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Button from '../components/Button';
import { EmotionalState } from '../types';
import { EMOTIONAL_STATES, DEFAULT_CATEGORIES } from '../constants';
import { ArrowLeft, Lock, Star, Hash, Calendar, HelpCircle, CheckCircle2, X } from 'lucide-react';
import { PremiumModal } from '../components/PremiumModal';
import { motion, AnimatePresence } from 'framer-motion';

const CreateDecision: React.FC = () => {
  const navigate = useNavigate();
  const { addDecision, updateDecision, isPremium } = useStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Post-Save Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdDecisionId, setCreatedDecisionId] = useState<string | null>(null);

  // Form State
  const [decisionText, setDecisionText] = useState('');
  const [whyText, setWhyText] = useState('');
  
  // Step 2 Optional Fields
  const [showOptionalWhy, setShowOptionalWhy] = useState(false);
  const [context, setContext] = useState('');
  const [assumptions, setAssumptions] = useState('');
  const [fear, setFear] = useState('');
  const [reasoning, setReasoning] = useState('');
  const [motivation, setMotivation] = useState('');

  const [emotionalState, setEmotionalState] = useState<EmotionalState | ''>('');
  const [emotionalStateOther, setEmotionalStateOther] = useState('');
  
  // Revisit State
  const [revisitDate, setRevisitDate] = useState('');
  
  // Step 3 Optional Fields
  const [showOptionalWhen, setShowOptionalWhen] = useState(false);
  const [outcomeSuccess, setOutcomeSuccess] = useState('');
  const [learningSuccess, setLearningSuccess] = useState('');
  
  const [futureSelfMessage, setFutureSelfMessage] = useState('');
  
  // Category State (For the modal)
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const isStep1Valid = decisionText.trim().length > 0;
  const isStep2Valid = whyText.trim().length > 0;
  const isStep3Valid = revisitDate.trim().length > 0;
  const isStep4Valid = emotionalState !== '' && (emotionalState !== EmotionalState.Other || emotionalStateOther.trim().length > 0);

  const handleInitialSave = () => {
    setLoading(true);
    
    // Simulate a deliberate pause/save process
    setTimeout(() => {
        const newId = crypto.randomUUID();
        const newDecision = {
            id: newId,
            decisionText,
            whyText,
            context: context.trim() || undefined,
            assumptions: assumptions.trim() || undefined,
            fear: fear.trim() || undefined,
            reasoning: reasoning.trim() || undefined,
            motivation: motivation.trim() || undefined,
            emotionalState,
            emotionalStateOther: emotionalState === EmotionalState.Other ? emotionalStateOther : undefined,
            createdAt: Date.now(),
            revisitDate,
            outcomeSuccess: outcomeSuccess.trim() || undefined,
            learningSuccess: learningSuccess.trim() || undefined,
            futureSelfMessage: futureSelfMessage || undefined,
            category: 'General', // Default to General initially
            isLocked: true,
        };
        addDecision(newDecision);
        setCreatedDecisionId(newId);
        setLoading(false);
        setShowSuccessModal(true);
    }, 800);
  };

  const handleFinalize = () => {
      // If user selected a category in the modal, update the decision
      if (createdDecisionId && (category || customCategory)) {
          const finalCategory = category === 'Custom' ? customCategory.trim() : category;
          if (finalCategory) {
              updateDecision(createdDecisionId, { category: finalCategory });
          }
      }
      navigate('/dashboard');
  };

  const handleQuickDate = (type: 'week' | 'month' | 'months3' | 'months6' | 'year') => {
      const date = new Date();
      switch(type) {
          case 'week': date.setDate(date.getDate() + 7); break;
          case 'month': date.setMonth(date.getMonth() + 1); break;
          case 'months3': date.setMonth(date.getMonth() + 3); break;
          case 'months6': date.setMonth(date.getMonth() + 6); break;
          case 'year': date.setFullYear(date.getFullYear() + 1); break;
      }
      setRevisitDate(date.toISOString().split('T')[0]);
  };

  const renderStepIndicator = () => (
      <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map(i => (
              <div 
                key={i} 
                className={`h-0.5 flex-1 rounded-full transition-colors duration-300 ${i <= step ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-zinc-800'}`} 
              />
          ))}
      </div>
  );

  return (
    <div className="animate-in slide-in-from-right-8 duration-500 pb-8 relative">
        <button 
            onClick={() => navigate(-1)} 
            className="mb-6 text-zinc-500 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
        >
            <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {renderStepIndicator()}

        {/* Step 1: Decision */}
        {step === 1 && (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wide">
                        The Decision
                    </label>
                    <h2 className="text-2xl font-semibold text-white">What have you decided?</h2>
                    <p className="text-zinc-500 text-sm">State it clearly. Make it declarative.</p>
                </div>
                <textarea
                    autoFocus
                    value={decisionText}
                    onChange={(e) => setDecisionText(e.target.value)}
                    placeholder="e.g., I am taking December off from job hunting."
                    className="w-full p-4 text-lg bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-none min-h-[160px] resize-none placeholder:text-zinc-700 text-white transition-all"
                />
                <Button fullWidth disabled={!isStep1Valid} onClick={() => setStep(2)}>
                    Next
                </Button>
            </div>
        )}

        {/* Step 2: Why */}
        {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="space-y-2">
                     <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wide">
                        The Context
                    </label>
                    <h2 className="text-2xl font-semibold text-white">Why did you decide this?</h2>
                    <p className="text-zinc-500 text-sm">What convinced you this is the right move?</p>
                </div>
                <textarea
                    autoFocus
                    value={whyText}
                    onChange={(e) => setWhyText(e.target.value)}
                    placeholder="I was mentally exhausted, financially safe for 2 months, and needed recovery..."
                    className="w-full p-4 text-base bg-zinc-900 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-none min-h-[160px] resize-none placeholder:text-zinc-700 text-white transition-all"
                />

                <div className="pt-2">
                    <button 
                        onClick={() => setShowOptionalWhy(!showOptionalWhy)}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <span className="text-lg">{showOptionalWhy ? '−' : '+'}</span>
                        {showOptionalWhy ? 'Hide optional details' : 'Add more context (Optional)'}
                    </button>
                </div>

                <AnimatePresence>
                    {showOptionalWhy && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Context: What is happening in your life or environment that led to this decision?</label>
                                <textarea
                                    value={context}
                                    onChange={(e) => setContext(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Assumptions: What are you assuming will happen?</label>
                                <textarea
                                    value={assumptions}
                                    onChange={(e) => setAssumptions(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Fear: What worries you about this decision?</label>
                                <textarea
                                    value={fear}
                                    onChange={(e) => setFear(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Reasoning: How did you weigh the options?</label>
                                <textarea
                                    value={reasoning}
                                    onChange={(e) => setReasoning(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Motivation: What makes this decision meaningful to you?</label>
                                <textarea
                                    value={motivation}
                                    onChange={(e) => setMotivation(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button fullWidth disabled={!isStep2Valid} onClick={() => setStep(3)}>
                    Next
                </Button>
                <button onClick={() => setStep(1)} className="w-full text-center text-sm text-zinc-600 py-2 hover:text-white transition-colors">Back</button>
            </div>
        )}

        {/* Step 3: Time Horizon */}
        {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="space-y-2">
                     <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wide">
                        Time Horizon
                    </label>
                    <h2 className="text-2xl font-semibold text-white">When should you revisit this decision?</h2>
                    <p className="text-zinc-500 text-sm">Set a hard date to check in with yourself.</p>
                </div>

                {/* Quick Selectors */}
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleQuickDate('week')} className="px-2 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">+1 Week</button>
                    <button onClick={() => handleQuickDate('month')} className="px-2 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">+1 Month</button>
                    <button onClick={() => handleQuickDate('months3')} className="px-2 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">+3 Months</button>
                    <button onClick={() => handleQuickDate('months6')} className="px-2 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">+6 Months</button>
                    <button onClick={() => handleQuickDate('year')} className="col-span-2 px-2 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">+1 Year</button>
                </div>
                
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                        type="date"
                        value={revisitDate}
                        onChange={(e) => setRevisitDate(e.target.value)}
                        className="w-full pl-10 p-4 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-zinc-500 text-white placeholder:text-zinc-700 [color-scheme:dark]"
                    />
                </div>

                <div className="pt-2">
                    <button 
                        onClick={() => setShowOptionalWhen(!showOptionalWhen)}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        <span className="text-lg">{showOptionalWhen ? '−' : '+'}</span>
                        {showOptionalWhen ? 'Hide optional details' : 'How will you know if this worked? (Optional)'}
                    </button>
                </div>

                <AnimatePresence>
                    {showOptionalWhen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Outcome success: What tangible result are you hoping for?</label>
                                <textarea
                                    value={outcomeSuccess}
                                    onChange={(e) => setOutcomeSuccess(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-zinc-400">Learning/Process success: What do you want to learn or experience?</label>
                                <textarea
                                    value={learningSuccess}
                                    onChange={(e) => setLearningSuccess(e.target.value)}
                                    className="w-full p-3 text-sm bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Button fullWidth disabled={!isStep3Valid} onClick={() => setStep(4)}>
                    Next
                </Button>
                <button onClick={() => setStep(2)} className="w-full text-center text-sm text-zinc-600 py-2 hover:text-white transition-colors">Back</button>
            </div>
        )}

        {/* Step 4: Emotion & Save */}
        {step === 4 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
                <div className="space-y-2">
                     <label className="block text-sm font-medium text-zinc-500 uppercase tracking-wide">
                        Emotional State
                    </label>
                    <h2 className="text-2xl font-semibold text-white">How do you feel about this decision right now?</h2>
                    <p className="text-zinc-500 text-sm">Capture your emotional baseline.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {EMOTIONAL_STATES.map((state) => (
                        <button
                            key={state.value}
                            onClick={() => setEmotionalState(state.value)}
                            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                emotionalState === state.value 
                                ? 'border-zinc-100 bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                            }`}
                        >
                            {state.label}
                        </button>
                    ))}
                </div>

                {emotionalState === EmotionalState.Other && (
                    <input
                        type="text"
                        value={emotionalStateOther}
                        onChange={(e) => setEmotionalStateOther(e.target.value)}
                        placeholder="Describe your emotion..."
                        className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-lg outline-none focus:ring-1 focus:ring-zinc-500 text-white placeholder:text-zinc-700"
                        autoFocus
                    />
                )}

                {/* Premium Feature: Future Self Message */}
                <div className="mt-8 pt-6 border-t border-zinc-800">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                             <label className={`text-sm font-medium ${isPremium ? 'text-zinc-200' : 'text-zinc-400'}`}>
                                Note to Future Self (Optional)
                             </label>
                             {!isPremium && <Lock className="w-3 h-3 text-amber-500" />}
                        </div>
                        {!isPremium && (
                            <button 
                                onClick={() => setShowPremiumModal(true)}
                                className="flex items-center gap-1.5 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors bg-amber-950/20 px-3 py-1.5 rounded-full border border-amber-900/50"
                            >
                                <Star className="w-3 h-3 fill-current" />
                                Upgrade to Unlock
                            </button>
                        )}
                    </div>
                    
                    <div className="relative">
                        <textarea
                            disabled={!isPremium}
                            value={futureSelfMessage}
                            onChange={(e) => setFutureSelfMessage(e.target.value)}
                            placeholder={isPremium ? "When doubt comes back, I want to remind myself..." : "This feature is locked for premium users."}
                            className={`w-full p-4 text-sm rounded-xl outline-none min-h-[120px] transition-all
                                ${isPremium 
                                    ? 'bg-zinc-900 border border-zinc-800 focus:ring-1 focus:ring-zinc-500 text-white placeholder:text-zinc-500' 
                                    : 'bg-zinc-950 border border-zinc-900 text-zinc-600 cursor-not-allowed placeholder:text-zinc-700'
                                }
                            `}
                        />
                         {!isPremium && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-xl pointer-events-none">
                            </div>
                         )}
                    </div>
                </div>

                <Button fullWidth disabled={!isStep4Valid || loading} onClick={handleInitialSave}>
                     {loading ? 'Anchoring Decision...' : 'Anchor Decision'}
                </Button>
                <button onClick={() => setStep(3)} className="w-full text-center text-sm text-zinc-600 py-2 hover:text-white transition-colors">Back</button>
            </div>
        )}

        {/* Success / Post-Save Category Modal */}
        <AnimatePresence>
            {showSuccessModal && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        onClick={handleFinalize}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-6 right-6 top-1/2 -translate-y-1/2 z-[70] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl shadow-black max-w-md mx-auto"
                    >
                        <button 
                            onClick={handleFinalize}
                            className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-serif text-white mb-2">Decision Anchored.</h2>
                            <p className="text-zinc-400 text-sm">
                                Your clarity has been secured.
                            </p>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-zinc-800">
                             <div className="space-y-2">
                                 <label className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                                    Give it a home (Optional)
                                </label>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                {DEFAULT_CATEGORIES.map(cat => (
                                     <button
                                        key={cat}
                                        onClick={() => { setCategory(cat); setCustomCategory(''); }}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                                            category === cat 
                                            ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                <button
                                     onClick={() => setCategory('Custom')}
                                     className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-2 ${
                                        category === 'Custom'
                                        ? 'bg-zinc-700 text-white border-zinc-500' 
                                        : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                    }`}
                                >
                                    <Hash className="w-3 h-3" />
                                    Custom
                                </button>
                            </div>

                            {category === 'Custom' && (
                                <input 
                                    autoFocus
                                    type="text"
                                    value={customCategory}
                                    onChange={(e) => setCustomCategory(e.target.value)}
                                    placeholder="e.g., Relocation"
                                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-zinc-500 text-white placeholder:text-zinc-700"
                                />
                            )}
                        </div>

                        <div className="mt-8">
                            <Button fullWidth onClick={handleFinalize} className="bg-white text-black hover:bg-zinc-200">
                                {category || customCategory ? 'Save & Finish' : 'Skip & Finish'}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>

        <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </div>
  );
};

export default CreateDecision;