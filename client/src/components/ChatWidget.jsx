import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Minimize2, Bot, Sparkles } from 'lucide-react'

const API_BASE = '/api'

const STEPS = ['greeting', 'name', 'email', 'phone', 'chat']

const INITIAL_MESSAGE = {
  id: 'init',
  from: 'bot',
  message: "👋 Hi there! I'm Kira, Kinetik's AI assistant. I'm here to help you explore what we can build together.\n\nBefore we dive in — what's your name?",
  timestamp: new Date(),
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState('greeting')
  const [messages, setMessages] = useState([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const [visitor, setVisitor] = useState({ name: '', email: '', phone: '' })
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem('kinetik_chat_session')
    if (!sid) {
      sid = `visitor_${Date.now()}_${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem('kinetik_chat_session', sid)
    }
    return sid
  })
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    // Restore session
    const stored = sessionStorage.getItem('kinetik_chat_data')
    if (stored) {
      const data = JSON.parse(stored)
      setMessages(data.messages || [INITIAL_MESSAGE])
      setStep(data.step || 'greeting')
      setVisitor(data.visitor || { name: '', email: '', phone: '' })
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const saveSession = (msgs, currentStep, vis) => {
    sessionStorage.setItem('kinetik_chat_data', JSON.stringify({
      messages: msgs,
      step: currentStep,
      visitor: vis,
    }))
  }

  const addBotMessage = (text, msgs) => {
    const msg = { id: Date.now(), from: 'bot', message: text, timestamp: new Date() }
    const updated = [...msgs, msg]
    return updated
  }

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isTyping) return
    setInput('')

    // Add visitor message
    const visitorMsg = { id: Date.now(), from: 'visitor', message: text, timestamp: new Date() }
    const withVisitor = [...messages, visitorMsg]
    setMessages(withVisitor)

    let newStep = step
    let newVisitor = { ...visitor }

    // Handle lead capture steps
    if (step === 'greeting' || step === 'name') {
      newVisitor.name = text
      newStep = 'email'
      setVisitor(newVisitor)
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 900))
      setIsTyping(false)
      const msgs = addBotMessage(`Nice to meet you, ${text}! 😊\n\nWhat's the best email address to reach you at?`, withVisitor)
      setMessages(msgs)
      setStep(newStep)
      saveSession(msgs, newStep, newVisitor)
      return
    }

    if (step === 'email') {
      newVisitor.email = text
      newStep = 'phone'
      setVisitor(newVisitor)
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 900))
      setIsTyping(false)
      const msgs = addBotMessage(`Perfect! 📩 Got it.\n\nAnd your phone number? (Feel free to skip by typing "skip")`, withVisitor)
      setMessages(msgs)
      setStep(newStep)
      saveSession(msgs, newStep, newVisitor)
      return
    }

    if (step === 'phone') {
      const isSkip = text.toLowerCase() === 'skip'
      newVisitor.phone = isSkip ? '' : text
      newStep = 'chat'
      setVisitor(newVisitor)
      setIsTyping(true)
      await new Promise(r => setTimeout(r, 1000))
      setIsTyping(false)
      const msgs = addBotMessage(`Great${isSkip ? '' : ', got it'}! Now tell me — what kind of project are you looking to build? A website, mobile app, or something else? 🚀`, withVisitor)
      setMessages(msgs)
      setStep(newStep)
      saveSession(msgs, newStep, newVisitor)
      return
    }

    // Full AI chat mode
    setIsTyping(true)
    try {
      const response = await fetch(`${API_BASE}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          visitorName: newVisitor.name,
          visitorEmail: newVisitor.email,
          visitorPhone: newVisitor.phone,
        }),
      })
      const data = await response.json()
      setIsTyping(false)

      if (data.success) {
        const msgs = addBotMessage(data.data.reply, withVisitor)
        setMessages(msgs)
        if (!isOpen) setUnread(p => p + 1)
        saveSession(msgs, newStep, newVisitor)
      } else {
        const msgs = addBotMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.", withVisitor)
        setMessages(msgs)
      }
    } catch (err) {
      setIsTyping(false)
      const msgs = addBotMessage("Something went wrong. Please check your connection and try again.", withVisitor)
      setMessages(msgs)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    setMessages([INITIAL_MESSAGE])
    setStep('greeting')
    setVisitor({ name: '', email: '', phone: '' })
    setInput('')
    sessionStorage.removeItem('kinetik_chat_data')
    sessionStorage.removeItem('kinetik_chat_session')
  }

  return (
    <div style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 9000 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 320 }}
            style={{
              position: 'absolute', bottom: '76px', right: 0,
              width: '370px', height: '520px',
              background: '#0A0A0F',
              border: '1px solid rgba(108,99,255,0.25)',
              borderRadius: '24px', overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 30px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.1)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '18px 20px',
              background: 'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                }}>
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fff', margin: 0 }}>Kira — Kinetik AI</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '11px' }}>AI-Powered • Always Online</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={resetChat}
                  title="New conversation"
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', color: '#fff' }}
                >↺</button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Minimize2 size={13} color="#fff" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: 'flex', justifyContent: msg.from === 'visitor' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}
                >
                  {msg.from === 'bot' && (
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={13} color="#fff" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '78%', padding: '11px 15px',
                    borderRadius: msg.from === 'visitor' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.from === 'visitor'
                      ? 'linear-gradient(135deg, #6C63FF, #00D4FF)'
                      : 'rgba(255,255,255,0.06)',
                    border: msg.from === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    color: '#F5F5F7', fontSize: '13px', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.message}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}
                  >
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, #6C63FF, #00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={13} color="#fff" />
                    </div>
                    <div style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: '18px 18px 18px 4px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ y: [0, -5, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          style={{ width: 6, height: 6, borderRadius: '50%', background: '#6C63FF' }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={step === 'greeting' || step === 'name' ? 'Your name...' : step === 'email' ? 'Your email...' : step === 'phone' ? 'Your phone (or skip)...' : 'Type a message...'}
                disabled={isTyping}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', color: '#F5F5F7',
                  fontSize: '13px', outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  opacity: isTyping ? 0.5 : 1,
                }}
              />
              <button
                onClick={sendMessage}
                disabled={isTyping || !input.trim()}
                style={{
                  width: 42, height: 42, borderRadius: '12px',
                  background: input.trim() && !isTyping ? 'linear-gradient(135deg, #6C63FF, #00D4FF)' : 'rgba(255,255,255,0.08)',
                  border: 'none', cursor: input.trim() && !isTyping ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                <Send size={15} color={input.trim() && !isTyping ? '#fff' : '#666'} />
              </button>
            </div>

            {/* Powered by */}
            <div style={{ padding: '6px', textAlign: 'center', background: '#0A0A0F', flexShrink: 0 }}>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'Inter, sans-serif' }}>Powered by Kinetik AI × Gemini</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => isOpen ? setIsOpen(false) : (setIsOpen(true), setUnread(0))}
        style={{
          width: 58, height: 58, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(108,99,255,0.5)',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <X size={22} color="#fff" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}>
              <Sparkles size={22} color="#fff" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid rgba(108,99,255,0.5)' }}
        />

        {/* Unread badge */}
        <AnimatePresence>
          {unread > 0 && (
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              style={{ position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: '50%', background: '#ff4757', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 700 }}
            >
              {unread}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
