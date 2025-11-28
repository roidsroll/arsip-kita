import React from 'react';
import { Trash2 } from 'lucide-react';
import { Memory } from '../types';

interface HangingItemProps {
  memory: Memory;
  onDelete: (id: string) => void;
  index: number;
}

export const HangingItem: React.FC<HangingItemProps> = ({ memory, onDelete, index }) => {
  const isEven = index % 2 === 0;
  
  // Format date safely
  const dateStr = new Date(memory.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      className={`relative group flex flex-col items-center select-none cursor-default 
        ${isEven ? 'animate-sway' : 'animate-sway-delayed'}`}
      style={{
        transformOrigin: 'top center',
      }}
    >
      {/* The Clothespin (Jepitan) */}
      <div className="absolute -top-3 z-20 w-3 h-8 bg-wood-light border border-wood-dark shadow-sm rounded-sm flex flex-col items-center justify-between py-1">
        <div className="w-full h-[1px] bg-wood-dark opacity-50"></div>
        <div className="w-1 h-3 bg-gray-400 rounded-full"></div> {/* Spring */}
      </div>

      {/* The Card/Paper */}
      <div 
        className="relative pt-6 px-4 pb-8 shadow-md transition-transform hover:scale-105 duration-300"
        style={{
          backgroundColor: '#ffffff', // Force White Background
          minWidth: '200px',
          maxWidth: '220px',
          minHeight: '220px',
          transform: `rotate(${memory.rotation}deg)`,
          boxShadow: '2px 4px 10px rgba(0,0,0,0.1)'
        }}
      >
        {/* Tape/Decoration (Updated for white background) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-gray-200/40 backdrop-blur-sm -mt-2 rotate-1 border border-white/50"></div>

        {/* Content */}
        <div className="flex flex-col items-center justify-center min-h-[120px] text-center">
          <div className="font-hand text-2xl text-gray-800 leading-relaxed break-words">
            "{memory.content}"
          </div>
          
          {/* Author Display */}
          {memory.author && (
            <div className="font-hand text-lg text-gray-600 mt-2 italic">
              - {memory.author}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 right-3 text-xs font-sans text-gray-400 opacity-70">
          {dateStr}
        </div>
        
        {/* Mood Tag - Now uses the color background so it pops on white paper */}
        <div 
          className="absolute bottom-2 left-3 text-[10px] font-sans uppercase tracking-wider text-gray-700 px-2 py-0.5 rounded-full opacity-90"
          style={{ backgroundColor: memory.color }}
        >
          {memory.mood}
        </div>

        {/* Delete Button (Visible on Hover) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(memory.id);
          }}
          className="absolute -bottom-3 -right-3 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Delete memory"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};