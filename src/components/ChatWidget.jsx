import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Minus,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import MarkdownText from './common/MarkdownText';
import {
  sendChatMessage,
  isArabicText,
} from '../services/aiChatService';
import {
  getChatSession,
  saveChatSession,
  createNewSession,
} from '../data/chatSessions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const ChatWidget = ({ t, currentLang }) => {
  const isRtl = currentLang === 'ar';
  const chatT = t.chatbot;

  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatDialogRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Trap focus inside chat window when opened
  useEffect(() => {
    if (!isOpen) return;
    const handleFocusTrap = (e) => {
      if (e.key !== 'Tab' || !chatDialogRef.current) return;
      const focusableElements = chatDialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleFocusTrap);
    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen]);

  // Initialize or restore session
  useEffect(() => {
    // Check sessionStorage for existing UUID
    let sessId = sessionStorage.getItem('kaveron_chat_session_id');

    // Validate that it looks like a UUID; if not (e.g. old 'chat-...' format), regenerate
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!sessId || !uuidPattern.test(sessId)) {
      sessId = crypto.randomUUID();
      sessionStorage.setItem('kaveron_chat_session_id', sessId);
    }

    setCurrentSessionId(sessId);

    // Welcome message is local UI only — not saved to Supabase
    const welcomeMsg = {
      id: 'msg-welcome',
      sender: 'bot',
      text: isRtl
        ? 'مرحباً بك في **كافيرون**! أنا مساعدك الذكي 👋 كيف يمكنني مساعدتك اليوم في مشروعك الرقمي؟'
        : 'Welcome to **kaveron**! I am your AI assistant 👋 How can I help you today with your digital project?',
      timestamp: new Date().toISOString(),
      isRtl,
    };

    setMessages([welcomeMsg]);
  }, [currentLang, isRtl]);

  // Show welcome bubble after 5 seconds, auto-hide after 10 seconds, and never show again in same session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('kaveron_welcome_bubble_dismissed');
    const opened = sessionStorage.getItem('kaveron_chat_opened');
    if (dismissed || opened) {
      return;
    }

    let hideTimer = null;
    const showTimer = setTimeout(() => {
      const isAlreadyDismissed =
        sessionStorage.getItem('kaveron_welcome_bubble_dismissed') ||
        sessionStorage.getItem('kaveron_chat_opened');
      if (!isAlreadyDismissed) {
        setShowWelcomeBubble(true);

        // Hide after 10 seconds and never show again in this session
        hideTimer = setTimeout(() => {
          setShowWelcomeBubble(false);
          sessionStorage.setItem('kaveron_welcome_bubble_dismissed', 'true');
        }, 10000);
      }
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, []);

  // Scroll to bottom whenever messages or typing changes
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setShowWelcomeBubble(false);
      sessionStorage.setItem('kaveron_welcome_bubble_dismissed', 'true');
      sessionStorage.setItem('kaveron_chat_opened', 'true');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
  };

  const handleNewChat = () => {
    // Generate a new UUID session
    const newSessionId = crypto.randomUUID();
    sessionStorage.setItem('kaveron_chat_session_id', newSessionId);
    setCurrentSessionId(newSessionId);

    const welcomeMsg = {
      id: 'msg-' + Date.now(),
      sender: 'bot',
      text: isRtl
        ? 'بدأنا محادثة جديدة! كيف يمكنني مساعدتك في مشروعك الرقمي؟'
        : 'Started a fresh conversation! How can I help you with your next digital project?',
      timestamp: new Date().toISOString(),
      isRtl,
    };

    setMessages([welcomeMsg]);
    setErrorMessage(null);
    setInputValue('');
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isTyping || !currentSessionId) return;

    if (text.length > 500) {
      setErrorMessage(chatT.charLimitWarning);
      return;
    }

    setErrorMessage(null);
    setLastFailedMessage(null);

    const userMessage = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      isRtl: isArabicText(text),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Try the Supabase Edge Function first if configured
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase.functions.invoke('chat', {
            body: { session_id: currentSessionId, message: text },
          });

          if (!error && data && data.reply) {
            const botMessage = {
              id: 'msg-b-' + Date.now(),
              sender: 'bot',
              text: data.reply,
              timestamp: new Date().toISOString(),
              isRtl: data.language === 'ar' || isArabicText(data.reply),
            };

            setMessages([...updatedMessages, botMessage]);
            setIsTyping(false);
            return;
          }

          // Edge function returned an error or empty reply — fall through to local fallback
          if (error) {
            console.warn('Edge function error, falling back to local:', error);
          }
        } catch (edgeErr) {
          console.warn('Edge function exception, falling back to local:', edgeErr);
        }
      }

      // Fallback: local sendChatMessage (also saves to localStorage)
      saveChatSession({
        session_id: currentSessionId,
        messages: updatedMessages,
        language: currentLang,
      });

      const response = await sendChatMessage({
        sessionId: currentSessionId,
        text,
        history: updatedMessages,
        currentLang,
      });

      const botMessage = {
        id: 'msg-b-' + Date.now(),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toISOString(),
        isRtl: response.isRtl,
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      saveChatSession({
        session_id: currentSessionId,
        messages: finalMessages,
        language: currentLang,
      });
    } catch (err) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || chatT.errorMessage);
      setLastFailedMessage(text);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      handleSendMessage(lastFailedMessage);
    }
  };

  // Quick reply chips shown at the start (when user hasn't asked questions yet)
  const showChips = messages.filter((m) => m.sender === 'user').length === 0;

  return (
    <>
      {/* 1. Floating Welcome Bubble (Shows after 5 seconds) */}
      {showWelcomeBubble && !isOpen && (
        <div
          role="status"
          className="fixed bottom-24 end-4 sm:end-6 z-40 animate-fade-in select-none"
        >
          <div
            onClick={() => {
              setIsOpen(true);
              setShowWelcomeBubble(false);
              sessionStorage.setItem('kaveron_welcome_bubble_dismissed', 'true');
            }}
            className="group relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#111111]/95 border border-[#00FF88]/40 shadow-[0_0_20px_rgba(0,255,136,0.3)] backdrop-blur-md cursor-pointer hover:border-[#00FF88] hover:scale-105 transition-all duration-300"
          >
            <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-ping" />
            <span className="text-xs sm:text-sm font-semibold text-white tracking-wide">
              {chatT.welcomeBubble}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomeBubble(false);
                sessionStorage.setItem('kaveron_welcome_bubble_dismissed', 'true');
              }}
              className="text-[#71717A] hover:text-white ms-1 p-0.5"
              aria-label={chatT.dismissBubbleAria || 'Dismiss notification'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Floating Action Button: bottom-right in LTR, bottom-left in RTL */}
      {!isOpen && (
        <aside
          aria-label={chatT.widgetAria || 'AI Chat Widget'}
          className="fixed bottom-6 end-4 sm:end-6 z-40 select-none"
        >
          <button
            type="button"
            onClick={toggleChat}
            className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#111111] border border-[#00FF88]/50 text-[#00FF88] shadow-[0_0_25px_rgba(0,255,136,0.35)] hover:shadow-[0_0_35px_rgba(0,255,136,0.6)] hover:scale-110 active:scale-95 transition-all duration-300 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
            aria-label={chatT.openAria || 'Open AI Chatbot'}
            title={chatT.openTitle || 'Chat with kaveron AI'}
          >
            {/* Pulsing ring */}
            <span className="absolute -inset-1 rounded-full bg-[#00FF88]/20 animate-pulse pointer-events-none" />

            {/* Bot Icon with Sparkle */}
            <Bot className="w-7 h-7 transition-transform group-hover:scale-110" />

            <span className="absolute -top-1 -end-1 w-3.5 h-3.5 rounded-full bg-[#00FF88] border-2 border-[#111111]" />
          </button>
        </aside>
      )}

      {/* 3. Chat Window: 380px x 560px on desktop, full-screen on mobile */}
      {isOpen && (
        <div
          ref={chatDialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={chatT.dialogAria || 'AI Assistant Chat'}
          className="fixed bottom-6 end-4 sm:end-6 z-50 w-full sm:w-[380px] h-[100dvh] sm:h-[560px] max-h-[100dvh] sm:max-h-[85vh] sm:rounded-[24px] bg-[#111111]/95 border border-[#00FF88]/40 shadow-[0_0_45px_rgba(0,255,136,0.22)] backdrop-blur-2xl flex flex-col overflow-hidden animate-fade-in"
        >
          {/* Top Neon Accent Line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00FF88] to-transparent shadow-[0_0_12px_rgba(0,255,136,0.6)] z-20" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#141414]/90 shrink-0 z-10">
            <div className="flex items-center gap-3">
              {/* Bot Avatar */}
              <div className="relative w-9 h-9 rounded-xl bg-[#00FF88]/15 border border-[#00FF88]/40 flex items-center justify-center text-[#00FF88]">
                <Bot className="w-5 h-5" />
                <span className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-[#00FF88] border-2 border-[#111111]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-heading font-bold text-white tracking-tight">
                    {chatT.assistantName}
                  </h4>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#00FF88]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                  <span>{chatT.onlineStatus}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleNewChat}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                title={chatT.newChat}
                aria-label={chatT.newChat}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                aria-label={chatT.minimizeAria}
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-red-400 hover:border-red-500/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00FF88]"
                aria-label={chatT.closeAria}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const msgRtl = msg.isRtl ?? isArabicText(msg.text);

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    dir={msgRtl ? 'rtl' : 'ltr'}
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm transition-all ${
                      isUser
                        ? 'bg-[#00FF88] text-[#0A0A0A] font-medium shadow-[0_0_15px_rgba(0,255,136,0.25)] rounded-ee-sm'
                        : 'bg-[#161616] text-white border border-white/[0.08] shadow-md rounded-es-sm'
                    } ${msgRtl ? 'font-arabic' : 'font-body'}`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <MarkdownText
                        content={msg.text}
                        isRtl={msgRtl}
                        onLinkClick={(url) => {
                          setIsOpen(false);
                          if (typeof window !== 'undefined') {
                            window.history.pushState({}, '', url);
                            window.dispatchEvent(new PopStateEvent('popstate'));
                            if (url === '/contact') {
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else if (url === '/projects' || url === '#projects') {
                              setTimeout(() => {
                                const el = document.getElementById('projects');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                else window.scrollTo({ top: 0, behavior: 'smooth' });
                              }, 100);
                            }
                          }
                        }}
                      />
                    )}

                    <span
                      className={`block text-[10px] mt-1 opacity-60 font-mono ${
                        isUser ? 'text-[#0A0A0A]/70 text-end' : 'text-[#71717A] text-end'
                      }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-es-sm bg-[#161616] border border-white/[0.08] px-4 py-3 flex items-center gap-1.5 shadow-md">
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#00FF88] animate-bounce" />
                </div>
              </div>
            )}

            {/* Error Message with Try Again */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                {lastFailedMessage && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#00FF88] underline hover:text-white shrink-0"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{chatT.tryAgain}</span>
                  </button>
                )}
              </div>
            )}

            {/* Quick-reply chips (shown at start) */}
            {showChips && !isTyping && (
              <div className="pt-2">
                <span className="text-[11px] font-mono text-[#71717A] block mb-2">
                  // {isRtl ? 'اقتراحات سريعة' : 'QUICK QUESTIONS'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {chatT.chips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#D4D4D8] hover:border-[#00FF88]/50 hover:text-[#00FF88] hover:bg-[#00FF88]/5 transition-all text-start"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 border-t border-white/[0.08] bg-[#141414] shrink-0">
            {/* Small Security Notice (Requirement 4) */}
            <div className="px-2.5 py-1 mb-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px] font-mono text-[#A1A1AA] text-center select-none">
              <span>
                {chatT.securityNotice ||
                  (isRtl
                    ? 'يرجى عدم مشاركة أرقام البطاقات أو كلمات المرور هنا.'
                    : "Please don't share card numbers or passwords here.")}
              </span>
            </div>

            <div className="relative flex items-center gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputValue}
                maxLength={500}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={chatT.placeholder}
                className="flex-1 max-h-24 px-3.5 py-2.5 rounded-xl bg-[#181818] border border-white/10 text-xs sm:text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-[#00FF88] focus:shadow-[0_0_12px_rgba(0,255,136,0.25)] transition-all resize-none"
              />

              <button
                type="button"
                disabled={!inputValue.trim() || isTyping}
                onClick={() => handleSendMessage()}
                className={`p-2.5 rounded-xl transition-all shrink-0 ${
                  !inputValue.trim() || isTyping
                    ? 'bg-white/5 text-[#52525B] border border-white/5 cursor-not-allowed'
                    : 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_15px_rgba(0,255,136,0.4)] hover:shadow-[0_0_25px_rgba(0,255,136,0.6)] hover:scale-105 active:scale-95'
                }`}
                aria-label={chatT.sendAria}
              >
                <Send className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>

            {/* Subtle character limit notice if approaching 500 */}
            {inputValue.length > 400 && (
              <div className="text-end text-[10px] font-mono text-[#71717A] mt-1">
                {500 - inputValue.length} {isRtl ? 'حرف متبقٍ' : 'chars left'}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
