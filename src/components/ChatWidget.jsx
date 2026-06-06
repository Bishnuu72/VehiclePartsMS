import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { chatApi } from '../api/chatApi'
import { cn } from '../lib/cn'

const GREETING = {
  role: 'assistant',
  content:
    "Hi! I'm your VehiclePartsMS assistant. Ask me about using the system — " +
    'or, for staff and admins, about stock and outstanding credit.',
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open, loading])

  async function handleSend(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const next = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      // Send recent history (exclude the canned greeting), capped to last 10 turns.
      const history = next
        .filter((m) => m !== GREETING)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }))
      const { data } = await chatApi.send({ message: text, history })
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Sorry, I could not reach the assistant. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        className={cn(
          'fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full flex items-center justify-center',
          'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg',
          'hover:scale-105 active:scale-95 transition-transform',
        )}
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 right-5 z-40 w-[min(380px,calc(100vw-2.5rem))] h-[70vh] max-h-[560px] flex flex-col bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-[modalIn_140ms_ease-out]"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white dark:text-gray-900" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">AI Assistant</p>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">VehiclePartsMS helper</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap break-words',
                    m.role === 'user'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-br-md'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 rounded-bl-md',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-zinc-500 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              className="flex-1 px-3.5 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/15 dark:focus-visible:ring-white/20 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 flex-shrink-0 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none hover:opacity-90 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
