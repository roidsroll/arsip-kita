import React, { useMemo, useEffect, useState } from 'react';
import { Memory } from '../types';
import { HangingItem } from './HangingItem';

interface ThreadDisplayProps {
  memories: Memory[];
  onDelete: (id: string) => void;
}

export const ThreadDisplay: React.FC<ThreadDisplayProps> = ({ memories, onDelete }) => {
  const [columns, setColumns] = useState(3);

  // Responsive chunking
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else setColumns(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Split memories into chunks (rows)
  const rows = useMemo(() => {
    const chunks: Memory[][] = [];
    for (let i = 0; i < memories.length; i += columns) {
      chunks.push(memories.slice(i, i + columns));
    }
    return chunks;
  }, [memories, columns]);

  if (memories.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20 opacity-50">
        <div className="w-full h-1 bg-red-500/20 mb-4 relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-gray-400">
                Benang masih kosong...
             </div>
        </div>
        <p className="text-gray-500 font-hand text-2xl">Belum ada kenangan yang dijemur.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-16 pb-20 w-full max-w-6xl mx-auto px-4">
      {rows.map((rowItems, rowIndex) => (
        <div key={rowIndex} className="relative w-full">
          {/* The Red Thread (Benang Merah) */}
          {/* We use an SVG to give it a slight curve (bezier) to look natural */}
          <svg className="absolute top-0 left-0 w-full h-12 overflow-visible pointer-events-none z-10">
            <path
              d="M0,4 Q500,15 1000,4 T2000,4" 
              // This is a simple repeating curve simulation. 
              // Ideally, 'd' would be calculated based on width, but CSS scaling works okay here for visual flair.
              vectorEffect="non-scaling-stroke"
              fill="none"
              stroke="#ef4444" // red-500
              strokeWidth="2"
              className="drop-shadow-sm"
              style={{ transform: 'scaleX(1)' }}
            />
          </svg>

          {/* Items Container */}
          <div className="flex justify-around items-start w-full px-4 pt-1"> 
             {/* pt-1 pushes items down slightly so the clip aligns with the line roughly */}
            {rowItems.map((memory, index) => (
              <HangingItem 
                key={memory.id} 
                memory={memory} 
                onDelete={onDelete} 
                index={index}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
