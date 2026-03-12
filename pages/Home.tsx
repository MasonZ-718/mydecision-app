import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Layers, HelpCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex-1 flex flex-col justify-center">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-10"
      >
        <div className="text-center space-y-4 mb-12">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-16 h-16 bg-gradient-to-tr from-zinc-800 to-black rounded-2xl mx-auto flex items-center justify-center border border-zinc-800 shadow-2xl shadow-indigo-900/20"
            >
                <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-serif text-white tracking-tight">MyDecision</h1>
            <p className="text-zinc-500 text-sm tracking-wide uppercase">Anchor your clarity</p>
        </div>

        <div className="space-y-4">
            <Link to="/new" className="block">
                <motion.div 
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md hover:bg-zinc-900/60 hover:border-zinc-600 transition-all duration-300"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-zinc-800 text-emerald-400 group-hover:bg-emerald-950 group-hover:text-emerald-300 transition-colors">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-medium text-white">Make a Decision</h3>
                            <p className="text-xs text-zinc-500">Record a new choice clearly</p>
                        </div>
                    </div>
                </motion.div>
            </Link>

            <Link to="/dashboard" className="block">
                <motion.div 
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md hover:bg-zinc-900/60 hover:border-zinc-600 transition-all duration-300"
                >
                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-zinc-800 text-blue-400 group-hover:bg-blue-950 group-hover:text-blue-300 transition-colors">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-medium text-white">View All Decisions</h3>
                            <p className="text-xs text-zinc-500">Review your past anchors</p>
                        </div>
                    </div>
                </motion.div>
            </Link>

            <Link to="/doubt-selection" className="block">
                <motion.div 
                    variants={item}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative overflow-hidden p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 backdrop-blur-md hover:bg-zinc-900/60 hover:border-zinc-600 transition-all duration-300"
                >
                     <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-full bg-zinc-800 text-rose-400 group-hover:bg-rose-950 group-hover:text-rose-300 transition-colors">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-medium text-white">I'm Having Doubt</h3>
                            <p className="text-xs text-zinc-500">Process doubt with clarity</p>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;