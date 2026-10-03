import { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Lightbulb,
} from 'lucide-react';
import { CopilotResponse } from '../../types';
import { askCopilot } from '../../services/copilotService';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  data?: CopilotResponse;
}

const suggestedPrompts = [
  'Why is energy higher today?',
  'Which machine needs attention?',
  'Where can we save the most?',
  'What should we inspect today?',
];

export function AICopilotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: 'Hi Rajesh. I am your Energy Copilot. I keep track of factory power, anomalies, and schedule savings. How can I help today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await askCopilot(textToSend);
      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data: response,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to reach the assistant right now. Using plant telemetry fallback answers.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg transition-all duration-150 hover:scale-105 active:scale-95"
        >
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>Ask Energy Copilot</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 w-96 sm:w-[420px] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col backdrop-blur-md transition-all duration-150 overflow-hidden ${
        isMinimized ? 'h-14' : 'h-[580px]'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">
              Energy Copilot
            </h3>
            <p className="text-[11px] text-slate-400">
              Plant telemetry assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized((prev) => !prev)}
            aria-label="Minimize"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-800/80 border border-slate-700/60 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Actions if provided */}
                  {msg.data?.recommendations && msg.data.recommendations.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-1">
                      <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-400" /> Suggested next steps:
                      </span>
                      <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5">
                        {msg.data.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 text-xs items-center text-slate-400">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] ml-1">Analyzing plant metrics...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="px-3 py-2 bg-slate-950/40 border-t border-slate-800 overflow-x-auto">
            <div className="flex gap-1.5 text-xs whitespace-nowrap">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about plant energy..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-750 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
