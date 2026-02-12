import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Greetings. I am monitoring your cluster telemetry. How can I assist with diagnostics today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  const handleSend = async () => {
    if (!input.trim() || isThinking) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I've analyzed the recent telemetry. I see some elevated latency in the 'production' namespace. Would you like me to dive deeper into the pod logs?",
        sender: 'ai',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMsg])
      setIsThinking(false)
    }, 1500)
  }

  return (
    <div className="flex h-full gap-6 animate-fadeIn">
      <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden border border-white/[0.06]">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                <Bot className="w-6 h-6 text-slate-400" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#166534] border-2 border-[#0c1016] shadow-[0_0_6px_rgba(22,101,52,0.4)]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Triage Core</h3>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Online | Neural Link Active</p>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-slate-500 opacity-60" />
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex gap-4 max-w-[80%]', msg.sender === 'user' ? 'ml-auto flex-row-reverse' : '')}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1',
                  msg.sender === 'user' ? 'bg-white/[0.08]' : 'bg-white/[0.06]'
                )}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 text-slate-500" />
                ) : (
                  <Bot className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div
                className={cn(
                  'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                  msg.sender === 'user'
                    ? 'bg-slate-700 text-slate-100 border border-white/[0.06]'
                    : 'bg-white/[0.04] border border-white/[0.06] text-slate-200'
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-slate-500" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-white/[0.06] bg-white/[0.02]">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Describe the anomaly or query infrastructure..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3 pl-4 pr-12 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 min-h-[46px] max-h-32 transition-all resize-none"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="absolute right-2 top-1.5 p-1.5 rounded-xl bg-slate-600 text-slate-100 hover:bg-slate-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-72 flex flex-col gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/[0.06]">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Suggested Queries</h4>
          <div className="flex flex-col gap-2">
            {['Analyze crash loops', 'Show CPU hotspots', 'List failed deployments'].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-left text-xs p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.1] hover:text-slate-200 transition-all font-medium text-slate-400"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-[#854d0e] bg-[rgba(133,77,14,0.12)]">
          <div className="flex items-center gap-2 text-[#b45309] mb-2">
            <AlertCircle className="w-4 h-4" />
            <h4 className="text-sm font-bold">Active Insight</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anomaly detected in specific pod lifecycle events within namespace 'production'.
          </p>
        </div>
      </div>
    </div>
  )
}
