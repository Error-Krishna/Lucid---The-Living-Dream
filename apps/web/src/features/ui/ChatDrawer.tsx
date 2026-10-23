import React, { useState } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { useMultiplayer } from '../multiplayer/useMultiplayer.js';
import { MessagesSquare, Send, X } from 'lucide-react';

export function ChatDrawer() {
  const isChatOpen = useUniverseStore((s) => s.isChatOpen);
  const setChatOpen = useUniverseStore((s) => s.setChatOpen);
  const chatMessages = useUniverseStore((s) => s.chatMessages);
  const userName = useUniverseStore((s) => s.userName);
  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const connectionMode = useUniverseStore((s) => s.connectionMode);

  const { sendChatMessage } = useMultiplayer();
  const [inputText, setInputText] = useState('');

  if (!isChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (connectionMode === 'connected') {
      sendChatMessage(inputText.trim());
    } else {
      // Local simulated message
      useUniverseStore.getState().addChatMessage({
        id: `local-msg-${Date.now()}`,
        senderId: 'me',
        senderName: userName,
        text: inputText.trim(),
        timestamp: Date.now(),
        locationId: activePlanet,
      });
    }

    setInputText('');
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 w-80 max-w-[calc(100vw-2rem)] glass-panel rounded-2xl p-4 shadow-2xl border border-indigo-400/30 flex flex-col h-80">
      <div className="flex items-center justify-between pb-2 border-b border-indigo-900/40 mb-2">
        <div className="flex items-center gap-2">
          <MessagesSquare className="w-4 h-4 text-indigo-400" />
          <span className="font-display text-xs text-white font-semibold tracking-wider uppercase">
            Dream Whispers
          </span>
        </div>
        <button
          onClick={() => setChatOpen(false)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
        {chatMessages.length === 0 ? (
          <div className="text-slate-500 italic text-[11px] text-center pt-8">
            Silence fills the realm. Whisper a thought to fellow wanderers.
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className="p-2 rounded-lg bg-slate-900/50 border border-indigo-950/40">
              <div className="flex items-center justify-between text-[10px] text-indigo-300 font-mono mb-0.5">
                <span>{msg.senderName}</span>
                <span className="text-slate-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-slate-200 leading-snug">{msg.text}</p>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-1.5 pt-2 border-t border-indigo-900/40">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Whisper into the dream..."
          maxLength={180}
          className="flex-1 rounded-xl bg-slate-900/60 border border-slate-700/60 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
        />
        <button
          type="submit"
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
