import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Decision } from '../types';
import { getCategoryTheme } from '../constants';
import { X, Calendar, AlertCircle, ArrowRight } from 'lucide-react';

interface DecisionBubbleViewProps {
  decisions: Decision[];
  onDecisionClick: (decision: Decision) => void;
}

interface BubbleData {
  id: string;
  isPlaceholder: boolean;
  decision?: Decision;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  isDue: boolean;
}

export const DecisionBubbleView: React.FC<DecisionBubbleViewProps> = ({ decisions, onDecisionClick }) => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const requestRef = useRef<number>();
  const timeoutRef = useRef<any>(null);

  // 1. Track dimensions with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 2. Initialize bubbles when dimensions are ready
  const prevDecisionsRef = useRef(decisions);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    
    // Only re-initialize if decisions changed or not initialized yet
    if (initializedRef.current && prevDecisionsRef.current === decisions) {
      return;
    }

    const activeDecisions = decisions.filter(d => !d.isArchived && d.status !== 'completed');
    
    const newBubbles: BubbleData[] = [];
    const minBubbles = 5;
    const totalBubbles = Math.max(activeDecisions.length + 1, minBubbles);

    for (let i = 0; i < totalBubbles; i++) {
      const isPlaceholder = i >= activeDecisions.length;
      const decision = isPlaceholder ? undefined : activeDecisions[i];
      
      let isDue = false;
      if (decision) {
        const revisitDate = decision.revisitDate || (decision as any).revisitValue;
        isDue = revisitDate ? new Date(revisitDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0) : false;
      }

      const radius = isPlaceholder ? 40 : (isDue ? 50 : 45 + Math.random() * 15);
      
      // Start positions
      let x = Math.random() * (dimensions.width - radius * 2) + radius;
      let y = Math.random() * (dimensions.height - radius * 2) + radius;
      
      if (isDue) {
        // Due bubbles start near bottom
        y = dimensions.height - radius - 20;
      }

      newBubbles.push({
        id: isPlaceholder ? `placeholder-${i}` : decision!.id,
        isPlaceholder,
        decision,
        x,
        y,
        vx: isDue ? 0 : (Math.random() - 0.5) * 0.5,
        vy: isDue ? 0 : (Math.random() - 0.5) * 0.5,
        radius,
        isDue
      });
    }

    setBubbles(newBubbles);
    initializedRef.current = true;
    prevDecisionsRef.current = decisions;
  }, [decisions, dimensions.width, dimensions.height]);

  // Animation loop
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const animate = () => {
      setBubbles(prevBubbles => {
        return prevBubbles.map(bubble => {
          if (bubble.isDue) {
            // Due bubbles stay at the bottom
            return {
              ...bubble,
              x: Math.max(bubble.radius, Math.min(dimensions.width - bubble.radius, bubble.x)),
              y: dimensions.height - bubble.radius - 20
            };
          }

          let newX = bubble.x + bubble.vx;
          let newY = bubble.y + bubble.vy;
          let newVx = bubble.vx;
          let newVy = bubble.vy;

          // Bounce off walls
          if (newX - bubble.radius < 0 || newX + bubble.radius > dimensions.width) {
            newVx = -newVx;
            newX = Math.max(bubble.radius, Math.min(dimensions.width - bubble.radius, newX));
          }
          if (newY - bubble.radius < 0 || newY + bubble.radius > dimensions.height) {
            newVy = -newVy;
            newY = Math.max(bubble.radius, Math.min(dimensions.height - bubble.radius, newY));
          }

          return { ...bubble, x: newX, y: newY, vx: newVx, vy: newVy };
        });
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions]);

  const handleBubbleStart = (bubble: BubbleData) => {
    if (bubble.isPlaceholder) return;
    
    timeoutRef.current = setTimeout(() => {
      // Long press
      if (navigator.vibrate) navigator.vibrate(50);
      if (bubble.decision) {
        navigate(`/decision/${bubble.decision.id}?mode=doubt`);
      }
    }, 800);
  };

  const handleBubbleEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleBubbleClick = (bubble: BubbleData) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (bubble.isPlaceholder) {
      navigate('/new');
    } else if (bubble.isDue) {
      navigate(`/decision/${bubble.decision!.id}?mode=review`);
    } else {
      onDecisionClick(bubble.decision!);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden" ref={containerRef}>
      {bubbles.map(bubble => {
        const theme = bubble.decision ? getCategoryTheme(bubble.decision.category) : { bg: 'bg-zinc-800', text: 'text-zinc-400', border: 'border-zinc-700' };
        
        return (
          <motion.div
            key={bubble.id}
            className={`absolute rounded-full flex items-center justify-center text-center cursor-pointer shadow-lg backdrop-blur-sm transition-colors duration-500
              ${bubble.isPlaceholder ? 'bg-zinc-900/40 border border-zinc-800/50 text-zinc-500' : 
                bubble.isDue ? 'bg-amber-900/40 border-2 border-amber-500/50 text-amber-100 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 
                `bg-zinc-900/80 border border-zinc-700 text-zinc-200 hover:bg-zinc-800`
              }`}
            style={{
              width: bubble.radius * 2,
              height: bubble.radius * 2,
              left: bubble.x - bubble.radius,
              top: bubble.y - bubble.radius,
              touchAction: 'none'
            }}
            onMouseDown={() => handleBubbleStart(bubble)}
            onMouseUp={handleBubbleEnd}
            onMouseLeave={handleBubbleEnd}
            onTouchStart={() => handleBubbleStart(bubble)}
            onTouchEnd={handleBubbleEnd}
            onClick={() => handleBubbleClick(bubble)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="p-3 w-full h-full flex items-center justify-center overflow-hidden">
              {bubble.isPlaceholder ? (
                <span className="text-xs font-medium opacity-60">I decide...</span>
              ) : (
                <span className="text-xs font-serif line-clamp-3 leading-tight px-1">
                  {bubble.decision?.decisionText}
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
