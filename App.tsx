import React, { useState, useEffect } from 'react';
import { Send, Loader2, Info, Lock, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { storage } from './services/storage';
import { analyzeSentiment } from './services/gemini';
import { Memory } from './types';
import { ThreadDisplay } from './components/ThreadDisplay';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [author, setAuthor] = useState('');
  const [memories, setMemories] = useState<Memory[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await storage.getAllMemories();
        setMemories(stored);
      } catch (err) {
        console.error("Failed to load memories", err);
      }
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!input.trim()) return;

    const content = input.trim();
    const currentAuthor = author.trim();
    
    setInput(''); // Clear input immediately for UX
    setAuthor('');
    
    setAnalyzing(true);
    
    // We always attempt analysis. The service handles fallback if API key is missing.
    const analysis = await analyzeSentiment(content);
    
    setAnalyzing(false);

    const newId = uuidv4();
    const newMemory: Memory = {
      id: newId,
      content,
      author: currentAuthor,
      createdAt: Date.now(),
      mood: analysis.mood,
      color: analysis.color,
      rotation: Math.random() * 6 - 3, // Random rotation between -3 and 3 degrees
    };

    // Optimistic Update
    setMemories(prev => [newMemory, ...prev]);

    // Save to DB
    try {
      await storage.addMemory(newMemory);
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const initiateDelete = (id: string) => {
    setDeleteTargetId(id);
    setShowPasswordModal(true);
    setPasswordInput('');
    setPasswordError(false);
  };

  const confirmDelete = async () => {
    if (passwordInput === 'admin123') {
      if (deleteTargetId) {
        setMemories(prev => prev.filter(m => m.id !== deleteTargetId));
        await storage.deleteMemory(deleteTargetId);
      }
      closePasswordModal();
    } else {
      setPasswordError(true);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setDeleteTargetId(null);
    setPasswordInput('');
    setPasswordError(false);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-red-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-1 bg-red-600 rotate-45 rounded-full block absolute"></span>
            <h1 className="text-2xl font-hand font-bold text-gray-800 ml-6 tracking-wide relative z-10">
              Arsip Kita
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Simpan rasamu, gantungkan di sini.
          </div>
        </div>
      </header>

      {/* Input Area */}
      <main className="flex-grow flex flex-col items-center w-full relative">
        
        <div className="w-full max-w-2xl px-4 py-8 mt-4">
            <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100 relative overflow-hidden transition-all">
                {analyzing && (
                    <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
                        <div className="flex flex-col items-center text-red-500">
                             <Loader2 className="animate-spin mb-2" />
                             <span className="font-hand text-xl">Sedang memproses kenangan...</span>
                        </div>
                    </div>
                )}
                
                {/* Author Input */}
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Ditulis Oleh (Opsional)"
                  className="w-full mb-3 px-3 py-2 text-sm text-gray-700 bg-gray-50 border-b border-gray-200 focus:bg-white focus:border-red-300 focus:outline-none transition-colors rounded-t-lg"
                  maxLength={50}
                />

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Apa yang sedang kamu rasakan hari ini? (Tulis kalimat, puisi, atau curhatan...)"
                    className="w-full h-32 p-3 text-lg text-gray-700 placeholder-gray-400 focus:outline-none resize-none font-hand"
                    maxLength={300}
                />
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                        <Info size={12} />
                        <span>Tersimpan otomatis</span>
                    </div>
                    
                    <button
                        onClick={handleSave}
                        disabled={!input.trim() || analyzing}
                        className="flex items-center gap-2 px-8 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-medium shadow-md shadow-red-200 disabled:opacity-50 disabled:shadow-none"
                    >
                        <span>Simpan</span>
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>

        {/* The Thread View */}
        <div className="w-full mt-8">
            <ThreadDisplay memories={memories} onDelete={initiateDelete} />
        </div>
      </main>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closePasswordModal}></div>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 animate-sway">
            <button 
              onClick={closePasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3 text-red-500">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Verifikasi Hapus</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Masukkan password admin untuk menghapus kenangan ini.
              </p>
            </div>

            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Masukkan password..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent mb-2"
              onKeyDown={(e) => e.key === 'Enter' && confirmDelete()}
              autoFocus
            />
            
            {passwordError && (
              <p className="text-red-500 text-xs mb-3 text-center font-medium">Password salah!</p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={closePasswordModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-400 text-sm mt-auto">
        <p>&copy; {new Date().getFullYear()} Arsip Kita.</p>
      </footer>
    </div>
  );
};

export default App;