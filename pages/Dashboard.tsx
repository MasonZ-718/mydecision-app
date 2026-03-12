import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, Calendar, AlertCircle, Layers, List, Archive, Clock, ArrowRight, Circle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DecisionBubbleView } from '../components/DecisionBubbleView';
import { DecisionCardModal } from '../components/DecisionCardModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Decision } from '../types';
import { getCategoryTheme } from '../constants';

const Dashboard: React.FC = () => {
  const { decisions } = useStore();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'bubble' | 'list'>('bubble');
  const [activeTab, setActiveTab] = useState<'active' | 'archive'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.getElementById('header-portal-target'));
  }, []);

  // Filter Logic
  // 1. Filter by Active/Archive
  const effectiveTab = viewMode === 'bubble' ? 'active' : activeTab;
  const timeFilteredDecisions = decisions.filter(d => {
      // Compatibility check: handle legacy data or new data
      // New data has revisitDate. If revisitDate < now, it's passed.
      const dateToCheck = d.revisitDate || (d as any).revisitValue; 
      
      const isPastDate = dateToCheck && new Date(dateToCheck).getTime() < Date.now();
      const isArchived = d.isArchived || d.status === 'completed'; // Treat 'completed' status as archived
      
      return effectiveTab === 'active' ? !isArchived : isArchived;
  });

  // 2. Filter by Category
  const finalDisplayDecisions = selectedCategory === 'All' 
    ? timeFilteredDecisions 
    : timeFilteredDecisions.filter(d => d.category === selectedCategory);

  // Get Unique Categories for Filter Bar
  const uniqueCategories = Array.from(new Set<string>(decisions.map(d => d.category || 'General')));
  const showCategoryFilter = decisions.length >= 3;

  const getCategoryFilterTheme = (category: string, isSelected: boolean) => {
    const normalized = category.toLowerCase().trim();
    if (isSelected) {
      switch (normalized) {
        case 'career': return 'bg-blue-600 text-white border-blue-500';
        case 'family': return 'bg-amber-600 text-white border-amber-500';
        case 'habit': return 'bg-emerald-600 text-white border-emerald-500';
        case 'dream': return 'bg-purple-600 text-white border-purple-500';
        case 'health': return 'bg-rose-600 text-white border-rose-500';
        case 'money':
        case 'finance': return 'bg-yellow-600 text-white border-yellow-500';
        default: return 'bg-zinc-600 text-white border-zinc-500';
      }
    } else {
      switch (normalized) {
        case 'career': return 'bg-blue-950/30 text-blue-400 border-blue-900/50 hover:bg-blue-900/50';
        case 'family': return 'bg-amber-950/30 text-amber-400 border-amber-900/50 hover:bg-amber-900/50';
        case 'habit': return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50 hover:bg-emerald-900/50';
        case 'dream': return 'bg-purple-950/30 text-purple-400 border-purple-900/50 hover:bg-purple-900/50';
        case 'health': return 'bg-rose-950/30 text-rose-400 border-rose-900/50 hover:bg-rose-900/50';
        case 'money':
        case 'finance': return 'bg-yellow-950/30 text-yellow-400 border-yellow-900/50 hover:bg-yellow-900/50';
        default: return 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800';
      }
    }
  };

  const viewToggle = (
    <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <button 
            onClick={() => setViewMode('bubble')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'bubble' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            aria-label="Bubble View"
        >
            <Circle className="w-4 h-4" />
        </button>
        <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            aria-label="List View"
        >
            <List className="w-4 h-4" />
        </button>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col relative w-full">
      {portalTarget && createPortal(viewToggle, portalTarget)}
      
      {/* Top Controls Container */}
      <div className="mb-6 space-y-4 flex flex-col items-center">
        {/* Row 1: Active/Archive Toggle (Only in List View) */}
        {viewMode === 'list' && (
            <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'active' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Active
                </button>
                <button
                    onClick={() => setActiveTab('archive')}
                    className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'archive' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                    Archive
                </button>
            </div>
        )}

        {/* Row 2: Category Filter (Conditional) */}
        {showCategoryFilter && (
            <div className="flex flex-wrap justify-center gap-2 pb-2">
                <button
                     onClick={() => setSelectedCategory('All')}
                     className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedCategory === 'All'
                        ? 'bg-white text-black border-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                     }`}
                >
                    All
                </button>
                {uniqueCategories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${getCategoryFilterTheme(cat, selectedCategory === cat)}`}
                   >
                       {cat}
                   </button>
                ))}
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 relative">
        {viewMode === 'bubble' ? (
            <div className="absolute inset-0 -mx-6">
                <DecisionBubbleView 
                  decisions={finalDisplayDecisions} 
                  onDecisionClick={(decision) => setSelectedDecision(decision)}
                />
            </div>
        ) : decisions.length === 0 ? (
          <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
             <div className="w-16 h-16 bg-zinc-900/50 rounded-full flex items-center justify-center border border-zinc-800">
                 <Archive className="w-6 h-6 text-zinc-600" />
             </div>
             <p className="text-zinc-500 text-sm">No decisions found.</p>
             <Link to="/new" className="text-white text-sm border-b border-zinc-700 pb-0.5 hover:border-white transition-colors">Create one</Link>
          </div>
        ) : finalDisplayDecisions.length === 0 ? (
             <div className="h-[40vh] flex flex-col items-center justify-center text-center text-zinc-500 text-sm">
                <p>No {selectedCategory !== 'All' ? selectedCategory : ''} {activeTab} decisions.</p>
             </div>
        ) : (
              <div className="space-y-4 pb-24">
                <AnimatePresence>
                {finalDisplayDecisions.map((decision) => (
                    <DecisionListItem 
                      key={decision.id} 
                      decision={decision} 
                      onClick={() => setSelectedDecision(decision)}
                    />
                ))}
                </AnimatePresence>
              </div>
        )}
      </div>

      <DecisionCardModal 
        decision={selectedDecision} 
        onClose={() => setSelectedDecision(null)} 
      />

      {/* Floating Add Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/new')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center z-50"
      >
          <Plus className="w-6 h-6" />
      </motion.button>

    </div>
  );
};

// Sub-component for List Item with Long Press Logic & Dynamic Background
const DecisionListItem: React.FC<{ decision: Decision, onClick: () => void }> = ({ decision, onClick }) => {
    const navigate = useNavigate();
    const [isPressed, setIsPressed] = useState(false);
    const [modeHint, setModeHint] = useState<'Doubt' | 'Review'>('Doubt');
    const timeoutRef = useRef<any>(null);

    // Determine Mode based on Revisit Date
    const revisitDate = decision.revisitDate || (decision as any).revisitValue;
    // Set to start of day comparison for cleaner UX
    const isReviewReady = revisitDate ? new Date(revisitDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0) : false;

    const handleStart = () => {
        setIsPressed(true);
        setModeHint(isReviewReady ? 'Review' : 'Doubt');
        timeoutRef.current = setTimeout(() => {
            // Trigger Long Press
            if (navigator.vibrate) navigator.vibrate(50);
            navigate(`/decision/${decision.id}?mode=${isReviewReady ? 'review' : 'doubt'}`);
        }, 800); 
    };

    const handleEnd = () => {
        setIsPressed(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        onClick();
    };

    const categoryTheme = getCategoryTheme(decision.category || '');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative group"
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            onClick={handleClick}
        >
            <div className={`
                relative overflow-hidden
                bg-zinc-900 border border-zinc-800 rounded-2xl p-6 
                hover:border-zinc-700 transition-all duration-500 ease-out
                shadow-lg shadow-black/20
                ${isPressed ? 'scale-[0.98] border-zinc-600' : ''}
            `}>
                {/* Ambient Color Blob - Consistent with DecisionDeck */}
                 <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-[80px] opacity-20 pointer-events-none transition-colors duration-500 ${categoryTheme}`} />

                 {/* Subtle contrast mask */}
                 <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 backdrop-blur-sm">
                            {decision.category || 'General'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </div>
                    
                    <h3 className="text-lg font-medium text-zinc-100 line-clamp-2 leading-snug mb-5 pr-4">
                        {decision.decisionText}
                    </h3>
                    
                    <div className="flex items-end justify-between border-t border-zinc-800/40 pt-4">
                        <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-full border border-zinc-800/50 w-fit">
                                <div className={`w-1.5 h-1.5 rounded-full ${getEmotionColor(decision.emotionalState)}`} />
                                <span className="text-xs text-zinc-400">{decision.emotionalState === 'Other' ? decision.emotionalStateOther : decision.emotionalState}</span>
                            </div>
                             {/* Show Status Badge if not active */}
                             {decision.status === 'stage_completed' && (
                                <span className="w-fit text-[10px] text-emerald-400 border border-emerald-900/50 bg-emerald-950/30 px-2 py-0.5 rounded-full">Phase Done</span>
                            )}
                        </div>

                        <div className="text-right space-y-1">
                             <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                                <span>Decided</span>
                                <span className="text-zinc-300 font-medium bg-zinc-800/50 px-1.5 rounded">
                                    {new Date(decision.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 text-[10px] text-zinc-500 uppercase tracking-wider">
                                <span>Review</span>
                                <span className={`font-medium px-1.5 rounded ${isReviewReady ? 'text-emerald-400 bg-emerald-950/30' : 'text-zinc-300 bg-zinc-800/50'}`}>
                                    {revisitDate ? new Date(revisitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Long Press Hint */}
                {isPressed && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-20 bg-zinc-900/90 rounded-2xl flex items-center justify-center backdrop-blur-[2px]"
                    >
                        <span className="text-white font-medium text-sm tracking-widest uppercase">Opening {modeHint} Mode...</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    )
}

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

export default Dashboard;