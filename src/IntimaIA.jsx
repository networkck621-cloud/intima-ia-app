import React from 'react';
import { motion } from 'framer-motion';

export default function IntimaIA() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      
      {/* Background com brilho de profundidade */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px] -z-10" />

      {/* Container de Prévia */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mb-12"
      >
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-sm relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs text-gray-400 uppercase tracking-widest">Demonstração da IA</span>
          </div>
          <div className="h-20 flex flex-col gap-2">
            <div className="w-full h-8 bg-white/5 rounded-lg border border-white/5" />
            <div className="w-2/3 h-8 bg-purple-500/10 rounded-lg border border-purple-500/20" />
          </div>
        </div>
      </motion.div>

      {/* Área de Login */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm text-center"
      >
        <h1 className="text-3xl font-bold mb-3">Intima<span className="text-purple-500">IA</span></h1>
        <p className="text-gray-400 mb-8 px-4">Digite o e-mail usado na sua assinatura para acessar o chat.</p>
        
        <input 
          type="email" 
          placeholder="Seu e-mail" 
          className="w-full bg-[#0a0a0a] border border-white/10 p-4 rounded-xl mb-4 focus:border-purple-500 outline-none transition-all"
        />
        
        <button className="w-full bg-purple-600 hover:bg-purple-700 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(147,51,234,0.3)]">
          Entrar
        </button>
      </motion.div>
    </div>
  );
}