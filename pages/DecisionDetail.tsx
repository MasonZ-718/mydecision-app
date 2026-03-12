import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import Button from '../components/Button';
import { ArrowLeft, Clock, Heart, Shield, AlertTriangle, Lock, Tag, CheckCircle2, PenLine, X, Calendar, Hash, ArrowRight, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCategoryTheme, DEFAULT_CATEGORIES } from '../constants';
import { DecisionStatus } from '../types';

const RESOLUTION_MESSAGES = [
    "It takes strength to stand still.",
    "Doubt is often just noise, not a signal.",
    "The facts haven't changed.",
    "Trust the clarity you had then.",
    "You are safe to stay the course."
];

const DecisionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getDecision, updateDecision, isPremium } = useStore();
  
  const decision = getDecision(id || '');
  const [mode, setMode] = useState<'view' | 'doubt' | 'resolve' | 'edit' | 'review'>('view');

  // Review Sub-states
  const [reviewBranch, setReviewBranch] = useState<'initial' | 'facts-same' | 'new-info'>('initial');
  const [reviewStatus, setReviewStatus] = useState<DecisionStatus | ''>('');
  const [nextReviewDate, setNextReviewDate] = useState('');

  // Flow A: Scheduled Review State
  const [reviewFlowStep, setReviewFlowStep] = useState<'initial' | 'yes' | 'no'>('initial');
  const [reviewProgress, setReviewProgress] = useState<'on_track' | 'unsure' | 'struggling' | ''>('');

  // Flow B: Doubt Review State
  const [doubtStep, setDoubtStep] = useState<number>(1);
  const [doubtWhyChanged, setDoubtWhyChanged] = useState<'no' | 'yes' | ''>('');
  const [doubtWhyNew, setDoubtWhyNew] = useState('');
  const [doubtContextChanged, setDoubtContextChanged] = useState<'no' | 'yes' | ''>('');
  const [doubtContextNew, setDoubtContextNew] = useState('');
  const [doubtAssumptionChanged, setDoubtAssumptionChanged] = useState<'no' | 'not_sure' | 'yes' | ''>('');
  const [doubtAssumptionNew, setDoubtAssumptionNew] = useState('');
  const [doubtFearHappened, setDoubtFearHappened] = useState<'no' | 'partially' | 'yes' | ''>('');
  const [doubtEmotion, setDoubtEmotion] = useState<'anxious' | 'changed' | 'influenced' | 'new_info' | ''>('');
  const [doubtCommitment, setDoubtCommitment] = useState<'2_weeks' | '1_month' | '3_months' | ''>('');

  // Edit Form State
  const [editText, setEditText] = useState('');
  const [editWhy, setEditWhy] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCustomCategory, setEditCustomCategory] = useState('');

  // New Optional Fields Edit State
  const [editContext, setEditContext] = useState('');
  const [editAssumptions, setEditAssumptions] = useState('');
  const [editFear, setEditFear] = useState('');
  const [editReasoning, setEditReasoning] = useState('');
  const [editMotivation, setEditMotivation] = useState('');
  const [editOutcomeSuccess, setEditOutcomeSuccess] = useState('');
  const [editLearningSuccess, setEditLearningSuccess] = useState('');
  
  const [showOptionalEditWhy, setShowOptionalEditWhy] = useState(false);
  const [showOptionalEditWhen, setShowOptionalEditWhen] = useState(false);

  useEffect(() => {
      const modeParam = searchParams.get('mode');
      if (modeParam === 'doubt') setMode('doubt');
      if (modeParam === 'review') setMode('review');
  }, [searchParams]);

  // Pre-fill form when entering edit mode or review mode (new info branch)
  useEffect(() => {
    if (decision) {
        setEditText(decision.decisionText);
        setEditWhy(decision.whyText);
        setEditContext(decision.context || '');
        setEditAssumptions(decision.assumptions || '');
        setEditFear(decision.fear || '');
        setEditReasoning(decision.reasoning || '');
        setEditMotivation(decision.motivation || '');
        setEditOutcomeSuccess(decision.outcomeSuccess || '');
        setEditLearningSuccess(decision.learningSuccess || '');
        
        // Category pre-fill logic
        if (DEFAULT_CATEGORIES.includes(decision.category)) {
            setEditCategory(decision.category);
            setEditCustomCategory('');
        } else if (decision.category && decision.category !== 'General') {
             setEditCategory('Custom');
             setEditCustomCategory(decision.category);
        } else {
             setEditCategory('');
             setEditCustomCategory('');
        }
    }
  }, [decision]);
  
  if (!decision) {
      return <div className="text-center py-20 text-zinc-500">Decision not found.</div>;
  }

  // ---- Handlers ----

  const handleStrictEditSave = () => {
    if (!editWhy.trim()) return; // Why is mandatory
    
    const finalCategory = editCategory === 'Custom' ? editCustomCategory.trim() : editCategory;

    updateDecision(decision.id, {
        decisionText: editText, // Optional update
        whyText: editWhy,
        context: editContext.trim() || undefined,
        assumptions: editAssumptions.trim() || undefined,
        fear: editFear.trim() || undefined,
        reasoning: editReasoning.trim() || undefined,
        motivation: editMotivation.trim() || undefined,
        outcomeSuccess: editOutcomeSuccess.trim() || undefined,
        learningSuccess: editLearningSuccess.trim() || undefined,
        category: finalCategory || 'General',
        lastEditedAt: Date.now(),
        isLocked: true 
    });
    navigate('/dashboard');
  };

  const handleReviewStatusSave = () => {
      if (!reviewStatus) return;

      if (reviewStatus === 'completed') {
          updateDecision(decision.id, {
              status: 'completed',
              isArchived: true,
              isLocked: true // Lock it for good measure
          });
      } else {
          // Active or Stage Completed -> Set new review date
          if (!nextReviewDate) return; // Date required for these steps
          updateDecision(decision.id, {
              status: reviewStatus,
              revisitDate: nextReviewDate,
              isArchived: false
          });
      }
      navigate('/dashboard');
  };

  const handleReviewFlowSave = () => {
      if (reviewFlowStep === 'no') {
          updateDecision(decision.id, {
              status: 'completed',
              isArchived: true,
              isLocked: true
          });
      } else if (reviewFlowStep === 'yes') {
          if (!nextReviewDate) return;
          updateDecision(decision.id, {
              status: 'active',
              revisitDate: nextReviewDate,
              isArchived: false
          });
      }
      navigate('/dashboard');
  };

  const handleDoubtNext = () => {
      let nextStep = doubtStep + 1;
      if (nextStep === 3 && !decision.context) nextStep = 4;
      if (nextStep === 4 && !decision.assumptions) nextStep = 5;
      if (nextStep === 5 && !decision.fear) nextStep = 6;
      setDoubtStep(nextStep);
  };

  const handleDoubtCommit = () => {
      if (!doubtCommitment) return;
      
      const now = new Date();
      if (doubtCommitment === '2_weeks') now.setDate(now.getDate() + 14);
      else if (doubtCommitment === '1_month') now.setMonth(now.getMonth() + 1);
      else if (doubtCommitment === '3_months') now.setMonth(now.getMonth() + 3);
      
      const nextDate = now.toISOString().split('T')[0];
      
      updateDecision(decision.id, {
          revisitDate: nextDate,
          status: 'active',
          isArchived: false
      });
      navigate('/dashboard');
  };

  const handleDoubtAbandon = () => {
      updateDecision(decision.id, {
          status: 'completed',
          isArchived: true,
          isLocked: true
      });
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
      setNextReviewDate(date.toISOString().split('T')[0]);
  };

  const revisitDate = decision.revisitDate || (decision as any).revisitValue; // Fallback for old data
  const categoryTheme = getCategoryTheme(decision.category || '');

  // Dynamic padding based on mode
  const containerPadding = (mode === 'resolve' || mode === 'edit' || mode === 'review') ? '' : 'pb-4';

  return (
    <div className={`flex-1 flex flex-col relative min-h-0 ${containerPadding}`}>
        
        {/* Ambient Category Glow */}
        <div className={`fixed -top-[20%] right-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10 pointer-events-none transition-all duration-1000 ${mode === 'resolve' ? 'opacity-20 scale-125' : ''} ${categoryTheme}`} />

        {/* Navigation - Hide in resolve/edit/review mode for immersion */}
        <AnimatePresence>
            {(mode === 'view' || mode === 'doubt') && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="relative z-10 flex flex-col flex-shrink-0"
                >
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        className="mb-4 text-zinc-500 hover:text-white flex items-center gap-1 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> All Decisions
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
            {/* --- VIEW MODE --- */}
            {mode === 'view' && (
                <motion.div 
                    key="view"
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex-1 overflow-y-auto pb-6 relative z-10"
                >
                    {/* Header Metadata */}
                    <div className="flex items-center flex-wrap gap-4 text-xs text-zinc-500 mb-6 uppercase tracking-wider font-medium">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(decision.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {decision.emotionalState === 'Other' ? decision.emotionalStateOther : decision.emotionalState}
                        </div>
                        <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {decision.category || 'General'}
                        </div>
                         {decision.status === 'stage_completed' && (
                            <div className="flex items-center gap-1 text-emerald-500">
                                <CheckCircle2 className="w-3 h-3" />
                                Phase Done
                            </div>
                        )}
                    </div>

                    <h1 className="text-2xl md:text-3xl font-serif text-white leading-snug mb-8">
                        {decision.decisionText}
                    </h1>

                    <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 backdrop-blur-md shadow-sm space-y-4 mb-8">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Original Context
                        </h3>
                        <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {decision.whyText}
                        </p>
                        
                        {decision.context && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Context</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{decision.context}</p>
                            </div>
                        )}
                        {decision.assumptions && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Assumptions</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{decision.assumptions}</p>
                            </div>
                        )}
                        {decision.fear && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Fear</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{decision.fear}</p>
                            </div>
                        )}
                        {decision.reasoning && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Reasoning</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{decision.reasoning}</p>
                            </div>
                        )}
                        {decision.motivation && (
                            <div className="mt-4">
                                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Motivation</h4>
                                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{decision.motivation}</p>
                            </div>
                        )}
                    </div>

                    {(decision.revisitCondition || decision.outcomeSuccess || decision.learningSuccess) && (
                         <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 backdrop-blur-md shadow-sm space-y-4 mb-8">
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Revisit Criteria
                            </h3>
                            {decision.revisitCondition && (
                                <div className="mt-2">
                                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Condition</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{decision.revisitCondition}</p>
                                </div>
                            )}
                            {decision.outcomeSuccess && (
                                <div className="mt-2">
                                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Outcome Success</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{decision.outcomeSuccess}</p>
                                </div>
                            )}
                            {decision.learningSuccess && (
                                <div className="mt-2">
                                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-1">Learning/Process Success</h4>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{decision.learningSuccess}</p>
                                </div>
                            )}
                            <p className="text-xs text-zinc-500 pt-2 border-t border-zinc-800">Target Date: {revisitDate ? new Date(revisitDate).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    )}

                    {decision.futureSelfMessage && (
                        <div className="bg-zinc-900/60 p-6 rounded-xl border border-zinc-800 backdrop-blur-md mb-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-zinc-700"></div>
                            <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-3">
                                Note to Future Self
                            </h3>
                            <p className="text-zinc-300 italic">
                                "{decision.futureSelfMessage}"
                            </p>
                        </div>
                    )}

                    <div className="mt-auto pt-4">
                        <Button variant="ghost" fullWidth onClick={() => setMode('doubt')} className="text-zinc-500 hover:text-rose-400">
                            I am having doubt...
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* --- DOUBT MODE --- */}
            {mode === 'doubt' && (
                <motion.div 
                    key="doubt"
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex flex-col min-h-0 relative z-10"
                >
                    <div className="flex items-center justify-between mb-4">
                         <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {doubtStep === 1 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col justify-center text-center">
                            <span className="inline-block px-3 py-1 rounded-full bg-rose-950/30 text-rose-400 text-xs font-medium border border-rose-900/30 mb-6 mx-auto">
                                Doubt Mode
                            </span>
                            <h2 className="text-2xl text-white font-serif mb-4">
                                You made this decision on {new Date(decision.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.
                            </h2>
                            <p className="text-zinc-400 text-lg">
                                Before changing it, let's revisit why you made it.
                            </p>
                            <div className="mt-12">
                                <Button variant="primary" onClick={handleDoubtNext}>
                                    Continue
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {doubtStep === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">You said you made this decision because:</h4>
                                <p className="text-xl text-white font-serif leading-snug bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                                    {decision.whyText}
                                </p>
                            </div>
                            <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl flex-1">
                                <h3 className="text-lg font-medium text-white mb-4">Has anything changed about this reason?</h3>
                                <button 
                                    onClick={() => setDoubtWhyChanged('no')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtWhyChanged === 'no' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    No, nothing has changed
                                </button>
                                <button 
                                    onClick={() => setDoubtWhyChanged('yes')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtWhyChanged === 'yes' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Yes, something has changed
                                </button>

                                {doubtWhyChanged === 'yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">What changed?</label>
                                        <textarea
                                            value={doubtWhyNew}
                                            onChange={(e) => setDoubtWhyNew(e.target.value)}
                                            className="w-full p-3 text-sm bg-black/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                        />
                                    </motion.div>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button fullWidth disabled={!doubtWhyChanged || (doubtWhyChanged === 'yes' && !doubtWhyNew.trim())} onClick={handleDoubtNext}>
                                    Next
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {doubtStep === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">At that time, your situation was:</h4>
                                <p className="text-lg text-white font-serif leading-snug bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                                    {decision.context}
                                </p>
                            </div>
                            <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl flex-1">
                                <h3 className="text-lg font-medium text-white mb-4">Is your situation different now?</h3>
                                <button 
                                    onClick={() => setDoubtContextChanged('no')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtContextChanged === 'no' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    No
                                </button>
                                <button 
                                    onClick={() => setDoubtContextChanged('yes')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtContextChanged === 'yes' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Yes
                                </button>

                                {doubtContextChanged === 'yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">How is it different?</label>
                                        <textarea
                                            value={doubtContextNew}
                                            onChange={(e) => setDoubtContextNew(e.target.value)}
                                            className="w-full p-3 text-sm bg-black/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                        />
                                    </motion.div>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button fullWidth disabled={!doubtContextChanged || (doubtContextChanged === 'yes' && !doubtContextNew.trim())} onClick={handleDoubtNext}>
                                    Next
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {doubtStep === 4 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">You believed that:</h4>
                                <p className="text-lg text-white font-serif leading-snug bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                                    {decision.assumptions}
                                </p>
                            </div>
                            <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl flex-1">
                                <h3 className="text-lg font-medium text-white mb-4">Has this assumption proven wrong?</h3>
                                <button 
                                    onClick={() => setDoubtAssumptionChanged('no')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtAssumptionChanged === 'no' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    No
                                </button>
                                <button 
                                    onClick={() => setDoubtAssumptionChanged('not_sure')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtAssumptionChanged === 'not_sure' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Not sure
                                </button>
                                <button 
                                    onClick={() => setDoubtAssumptionChanged('yes')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtAssumptionChanged === 'yes' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Yes
                                </button>

                                {doubtAssumptionChanged === 'yes' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                                        <label className="block text-sm font-medium text-zinc-400 mb-2">Why?</label>
                                        <textarea
                                            value={doubtAssumptionNew}
                                            onChange={(e) => setDoubtAssumptionNew(e.target.value)}
                                            className="w-full p-3 text-sm bg-black/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                        />
                                    </motion.div>
                                )}
                            </div>
                            <div className="mt-4">
                                <Button fullWidth disabled={!doubtAssumptionChanged || (doubtAssumptionChanged === 'yes' && !doubtAssumptionNew.trim())} onClick={handleDoubtNext}>
                                    Next
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {doubtStep === 5 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                            <div className="mb-6">
                                <h4 className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">At that time, you were worried about:</h4>
                                <p className="text-lg text-white font-serif leading-snug bg-black/40 p-5 rounded-xl border border-zinc-800/50">
                                    {decision.fear}
                                </p>
                            </div>
                            <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl flex-1">
                                <h3 className="text-lg font-medium text-white mb-4">Has this fear actually happened?</h3>
                                <button 
                                    onClick={() => setDoubtFearHappened('no')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtFearHappened === 'no' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    No
                                </button>
                                <button 
                                    onClick={() => setDoubtFearHappened('partially')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtFearHappened === 'partially' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Partially
                                </button>
                                <button 
                                    onClick={() => setDoubtFearHappened('yes')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtFearHappened === 'yes' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Yes
                                </button>
                            </div>
                            <div className="mt-4">
                                <Button fullWidth disabled={!doubtFearHappened} onClick={handleDoubtNext}>
                                    Next
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {doubtStep === 6 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                            <div className="mb-6">
                                <h2 className="text-2xl text-white font-serif mb-2">Emotion Reality Check</h2>
                                <p className="text-zinc-400 text-sm">Let's look at what's driving this review.</p>
                            </div>
                            <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl flex-1">
                                <h3 className="text-lg font-medium text-white mb-4">What made you revisit this decision today?</h3>
                                <button 
                                    onClick={() => setDoubtEmotion('anxious')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtEmotion === 'anxious' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    I felt anxious
                                </button>
                                <button 
                                    onClick={() => setDoubtEmotion('changed')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtEmotion === 'changed' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Something changed
                                </button>
                                <button 
                                    onClick={() => setDoubtEmotion('influenced')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtEmotion === 'influenced' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    Someone influenced me
                                </button>
                                <button 
                                    onClick={() => setDoubtEmotion('new_info')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${doubtEmotion === 'new_info' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    I found new information
                                </button>
                            </div>
                            <div className="mt-4">
                                <Button fullWidth disabled={!doubtEmotion} onClick={handleDoubtNext}>
                                    See Results
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {doubtStep === 7 && (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col overflow-y-auto custom-scrollbar pb-8">
                            <div className="mb-6">
                                <h2 className="text-2xl text-white font-serif mb-2">What we found</h2>
                            </div>
                            
                            <div className="bg-black/40 p-5 rounded-xl border border-zinc-800/50 mb-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${doubtWhyChanged === 'no' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    <span className="text-zinc-300 text-sm">Reason {doubtWhyChanged === 'no' ? 'unchanged' : 'changed'}</span>
                                </div>
                                {decision.context && (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${doubtContextChanged === 'no' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        <span className="text-zinc-300 text-sm">Context {doubtContextChanged === 'no' ? 'unchanged' : 'changed'}</span>
                                    </div>
                                )}
                                {decision.assumptions && (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${doubtAssumptionChanged === 'no' ? 'bg-emerald-500' : doubtAssumptionChanged === 'not_sure' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                        <span className="text-zinc-300 text-sm">Assumptions {doubtAssumptionChanged === 'no' ? 'mostly valid' : doubtAssumptionChanged === 'not_sure' ? 'uncertain' : 'proven wrong'}</span>
                                    </div>
                                )}
                                {decision.fear && (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${doubtFearHappened === 'no' ? 'bg-emerald-500' : doubtFearHappened === 'partially' ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                        <span className="text-zinc-300 text-sm">Fear {doubtFearHappened === 'no' ? 'did not happen' : doubtFearHappened === 'partially' ? 'partially happened' : 'happened'}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl mb-6">
                                {(() => {
                                    const changes = [doubtWhyChanged, doubtContextChanged, doubtAssumptionChanged].filter(v => v === 'yes').length;
                                    const fearHappened = doubtFearHappened === 'yes';
                                    
                                    if (changes === 0 && !fearHappened) {
                                        return (
                                            <>
                                                <p className="text-emerald-400 font-medium mb-2">Your original reasoning still holds.</p>
                                                <p className="text-zinc-400 text-sm">It may be worth staying committed.</p>
                                            </>
                                        );
                                    } else if (changes >= 2 || fearHappened) {
                                        return (
                                            <>
                                                <p className="text-amber-400 font-medium mb-2">Several conditions have changed.</p>
                                                <p className="text-zinc-400 text-sm">Reconsidering this decision may be reasonable.</p>
                                            </>
                                        );
                                    } else {
                                        return (
                                            <>
                                                <p className="text-blue-400 font-medium mb-2">Some minor things have shifted.</p>
                                                <p className="text-zinc-400 text-sm">Review if these changes fundamentally alter your path.</p>
                                            </>
                                        );
                                    }
                                })()}
                            </div>

                            <div className="space-y-4">
                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                                    <h4 className="text-white font-medium mb-3">Option 1: Stay committed to this decision</h4>
                                    <p className="text-zinc-500 text-xs mb-3">If you keep this decision, how long will you commit before questioning it again?</p>
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <button 
                                            onClick={() => setDoubtCommitment('2_weeks')}
                                            className={`py-2 px-1 text-xs rounded-lg border transition-all ${doubtCommitment === '2_weeks' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                        >
                                            2 weeks
                                        </button>
                                        <button 
                                            onClick={() => setDoubtCommitment('1_month')}
                                            className={`py-2 px-1 text-xs rounded-lg border transition-all ${doubtCommitment === '1_month' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                        >
                                            1 month
                                        </button>
                                        <button 
                                            onClick={() => setDoubtCommitment('3_months')}
                                            className={`py-2 px-1 text-xs rounded-lg border transition-all ${doubtCommitment === '3_months' ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-black/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                        >
                                            3 months
                                        </button>
                                    </div>
                                    <Button fullWidth variant="primary" disabled={!doubtCommitment} onClick={handleDoubtCommit}>
                                        Commit
                                    </Button>
                                </div>

                                <Button fullWidth variant="outline" onClick={() => { 
                                    setMode('edit'); 
                                    setEditText(decision.decisionText); 
                                    setEditWhy(doubtWhyChanged === 'yes' && doubtWhyNew ? doubtWhyNew : decision.whyText); 
                                    setEditContext(doubtContextChanged === 'yes' && doubtContextNew ? doubtContextNew : decision.context || '');
                                    setEditAssumptions(doubtAssumptionChanged === 'yes' && doubtAssumptionNew ? doubtAssumptionNew : decision.assumptions || '');
                                }}>
                                    Option 2: Adjust the decision
                                </Button>

                                <Button fullWidth variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30" onClick={handleDoubtAbandon}>
                                    Option 3: Abandon this decision
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* --- FLOW A: SCHEDULED REVIEW --- */}
            {mode === 'review' && (
                <motion.div 
                    key="review"
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex flex-col min-h-0 relative z-10"
                >
                    <div className="flex items-center justify-between mb-4">
                         <button 
                            onClick={() => navigate('/dashboard')}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {reviewFlowStep === 'initial' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                            <div className="mb-4">
                                <span className="inline-block px-3 py-1 rounded-full bg-emerald-950/30 text-emerald-400 text-xs font-medium border border-emerald-900/30 mb-3">
                                    Scheduled Review
                                </span>
                            </div>

                            <div className="bg-black/40 p-6 rounded-xl border border-zinc-800/50 mb-6 flex-1 overflow-y-auto custom-scrollbar">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">You decided:</h4>
                                        <p className="text-xl text-white font-serif leading-snug">{decision.decisionText}</p>
                                    </div>
                                    {(decision.outcomeSuccess || decision.learningSuccess || decision.revisitCondition) && (
                                        <div>
                                            <h4 className="text-zinc-500 text-xs uppercase tracking-wider mb-2 font-medium">Your success criteria:</h4>
                                            {decision.outcomeSuccess && <p className="text-zinc-300 text-sm leading-relaxed mb-2"><span className="text-zinc-500">Outcome:</span> {decision.outcomeSuccess}</p>}
                                            {decision.learningSuccess && <p className="text-zinc-300 text-sm leading-relaxed mb-2"><span className="text-zinc-500">Learning:</span> {decision.learningSuccess}</p>}
                                            {decision.revisitCondition && <p className="text-zinc-300 text-sm leading-relaxed italic">"{decision.revisitCondition}"</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 backdrop-blur-xl">
                                <h3 className="text-lg font-serif text-white mb-4 text-center">Is this decision still relevant?</h3>
                                <Button fullWidth variant="primary" onClick={() => setReviewFlowStep('yes')}>
                                    Yes, still relevant
                                </Button>
                                <Button fullWidth variant="outline" onClick={() => setReviewFlowStep('no')}>
                                    No, it's no longer relevant
                                </Button>
                                <Button fullWidth variant="ghost" className="text-zinc-400" onClick={() => { setMode('doubt'); setDoubtStep(1); }}>
                                    I want to rethink this decision
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {reviewFlowStep === 'yes' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col">
                             <div className="mb-6">
                                <h2 className="text-xl text-white font-serif mb-2">How is it going so far?</h2>
                            </div>

                            <div className="space-y-3 flex-1">
                                <button 
                                    onClick={() => setReviewProgress('on_track')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${reviewProgress === 'on_track' ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    <div className="font-medium mb-1">On track</div>
                                </button>
                                <button 
                                    onClick={() => setReviewProgress('unsure')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${reviewProgress === 'unsure' ? 'bg-amber-900/20 border-amber-500/50 text-amber-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    <div className="font-medium mb-1">Unsure</div>
                                </button>
                                <button 
                                    onClick={() => setReviewProgress('struggling')}
                                    className={`w-full p-4 rounded-xl border text-left transition-all ${reviewProgress === 'struggling' ? 'bg-rose-900/20 border-rose-500/50 text-rose-100' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                >
                                    <div className="font-medium mb-1">Struggling</div>
                                </button>
                            </div>

                            {reviewProgress && (
                                <div className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in slide-in-from-bottom-4">
                                     <div className="space-y-2 mb-4">
                                        <label className="block text-sm font-medium text-zinc-400 uppercase tracking-wide">
                                            Next review time
                                        </label>
                                        
                                        <div className="grid grid-cols-4 gap-2 mb-2">
                                            <button onClick={() => handleQuickDate('month')} className="px-2 py-2 text-[10px] bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">+1 Mo</button>
                                            <button onClick={() => handleQuickDate('months3')} className="px-2 py-2 text-[10px] bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">+3 Mo</button>
                                            <button onClick={() => handleQuickDate('months6')} className="px-2 py-2 text-[10px] bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">+6 Mo</button>
                                            <button onClick={() => handleQuickDate('year')} className="px-2 py-2 text-[10px] bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">+1 Yr</button>
                                        </div>

                                        <input
                                            type="date"
                                            value={nextReviewDate}
                                            onChange={(e) => setNextReviewDate(e.target.value)}
                                            className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-zinc-500 text-white placeholder:text-zinc-700 [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto pt-6">
                                <Button 
                                    fullWidth 
                                    disabled={!reviewProgress || !nextReviewDate}
                                    onClick={handleReviewFlowSave}
                                >
                                    Confirm Update
                                </Button>
                                <button onClick={() => { setReviewFlowStep('initial'); setReviewProgress(''); }} className="w-full text-center text-sm text-zinc-600 py-3 mt-2 hover:text-white transition-colors">Back</button>
                            </div>
                        </motion.div>
                    )}

                    {reviewFlowStep === 'no' && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex flex-col justify-center items-center text-center">
                            <div className="mb-8">
                                <h2 className="text-2xl text-white font-serif mb-4">Ready to close this?</h2>
                                <p className="text-zinc-400 text-sm max-w-xs mx-auto">Marking this decision as completed will archive it. You can still view it later.</p>
                            </div>
                            <div className="w-full space-y-3">
                                <Button fullWidth variant="primary" onClick={handleReviewFlowSave}>
                                    Mark decision completed
                                </Button>
                                <button onClick={() => setReviewFlowStep('initial')} className="w-full text-center text-sm text-zinc-600 py-3 hover:text-white transition-colors">Back</button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* --- OLD EDIT MODE (Standard flow triggered from Doubt Mode) --- */}
            {mode === 'edit' && (
                 <motion.div 
                    key="edit"
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 20 }}
                    className="flex-1 flex flex-col min-h-0 relative z-10"
                >
                    <div className="flex items-center justify-between mb-6">
                        <button 
                            onClick={() => setMode('view')}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">Refining your truth</span>
                        <div className="w-5" /> {/* Spacer */}
                    </div>

                    <div className="space-y-6 overflow-y-auto flex-1 pb-4">
                        <div className="space-y-2">
                            <h2 className="text-2xl font-serif text-white">How has the decision evolved?</h2>
                            <p className="text-zinc-500 text-sm">Only change this if the new facts outweigh your past clarity.</p>
                        </div>

                        <div className="space-y-4">
                             <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium ml-1">Updated Decision</label>
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full p-4 text-lg bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-none min-h-[120px] resize-none text-white placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium ml-1">New Context / Reasoning</label>
                                <textarea
                                    value={editWhy}
                                    onChange={(e) => setEditWhy(e.target.value)}
                                    className="w-full p-4 text-base bg-zinc-900/50 border border-zinc-800 rounded-xl focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 outline-none min-h-[150px] resize-none text-zinc-200 placeholder:text-zinc-700"
                                />
                            </div>

                            <div className="pt-2">
                                <button 
                                    onClick={() => setShowOptionalEditWhy(!showOptionalEditWhy)}
                                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    <span className="text-lg">{showOptionalEditWhy ? '−' : '+'}</span>
                                    {showOptionalEditWhy ? 'Hide optional details' : 'Edit optional context'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showOptionalEditWhy && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Context</label>
                                            <textarea
                                                value={editContext}
                                                onChange={(e) => setEditContext(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Assumptions</label>
                                            <textarea
                                                value={editAssumptions}
                                                onChange={(e) => setEditAssumptions(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Fear</label>
                                            <textarea
                                                value={editFear}
                                                onChange={(e) => setEditFear(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Reasoning</label>
                                            <textarea
                                                value={editReasoning}
                                                onChange={(e) => setEditReasoning(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Motivation</label>
                                            <textarea
                                                value={editMotivation}
                                                onChange={(e) => setEditMotivation(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="pt-2">
                                <button 
                                    onClick={() => setShowOptionalEditWhen(!showOptionalEditWhen)}
                                    className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
                                >
                                    <span className="text-lg">{showOptionalEditWhen ? '−' : '+'}</span>
                                    {showOptionalEditWhen ? 'Hide optional details' : 'Edit success criteria'}
                                </button>
                            </div>

                            <AnimatePresence>
                                {showOptionalEditWhen && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Outcome Success</label>
                                            <textarea
                                                value={editOutcomeSuccess}
                                                onChange={(e) => setEditOutcomeSuccess(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-xs font-medium text-zinc-400">Learning/Process Success</label>
                                            <textarea
                                                value={editLearningSuccess}
                                                onChange={(e) => setEditLearningSuccess(e.target.value)}
                                                className="w-full p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-500 outline-none min-h-[80px] resize-none text-white"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-zinc-500 font-medium ml-1">Category</label>
                                <div className="flex flex-wrap gap-3">
                                    {DEFAULT_CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => { setEditCategory(cat); setEditCustomCategory(''); }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                                editCategory === cat 
                                                ? 'bg-white text-black border-white shadow-lg shadow-white/10' 
                                                : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setEditCategory('Custom')}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-2 ${
                                            editCategory === 'Custom'
                                            ? 'bg-zinc-800 text-white border-zinc-600' 
                                            : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                                        }`}
                                    >
                                        <Hash className="w-3 h-3" />
                                        Custom
                                    </button>
                                </div>
                                {editCategory === 'Custom' && (
                                    <input 
                                        type="text"
                                        value={editCustomCategory}
                                        onChange={(e) => setEditCustomCategory(e.target.value)}
                                        placeholder="e.g., Relocation"
                                        className="w-full mt-2 p-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-zinc-500 text-white placeholder:text-zinc-700"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <Button fullWidth onClick={handleStrictEditSave} className="bg-white text-black hover:bg-zinc-200">
                           <PenLine className="w-4 h-4 mr-2" />
                           Update Decision
                        </Button>
                    </div>
                </motion.div>
            )}

            {mode === 'resolve' && (
                <ResolutionSequence onComplete={() => navigate('/dashboard')} />
            )}
        </AnimatePresence>
    </div>
  );
};

// Internal Component for the Text Animation Sequence
const ResolutionSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [msgIndex, setMsgIndex] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        if (msgIndex < RESOLUTION_MESSAGES.length) {
            const timer = setTimeout(() => {
                setMsgIndex(prev => prev + 1);
            }, 3500); // 3.5s per message
            return () => clearTimeout(timer);
        } else {
            setFinished(true);
        }
    }, [msgIndex]);

    return (
        <motion.div 
            key="resolve"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center relative z-20 w-full"
        >
            <div className="w-full flex-1 flex flex-col items-center justify-center">
                <AnimatePresence mode="wait">
                    {!finished ? (
                         <motion.div
                            key={msgIndex}
                            initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="flex items-center justify-center px-6 max-w-sm text-center"
                        >
                            <h2 className="text-2xl md:text-3xl font-serif text-white leading-relaxed">
                                {RESOLUTION_MESSAGES[msgIndex]}
                            </h2>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="flex flex-col items-center space-y-8 px-6 text-center max-w-sm"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.25)]">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-3xl font-serif text-white">Decision Anchored.</h2>
                                <p className="text-zinc-400 leading-relaxed text-base">
                                    You've protected your clarity from today's doubt.
                                </p>
                            </div>
                            <Button onClick={onComplete} className="min-w-[180px] bg-white text-black hover:bg-zinc-200 border-none shadow-xl shadow-white/5">
                                Return to Dashboard
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {!finished && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="absolute bottom-10"
                >
                    <button 
                        onClick={() => setFinished(true)} 
                        className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-[0.2em]"
                    >
                        Skip
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
};

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

export default DecisionDetail;