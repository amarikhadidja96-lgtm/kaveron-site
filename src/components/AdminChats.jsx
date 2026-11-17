import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Trash2,
  ExternalLink,
  ArrowLeft,
  Lock,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Button from './common/Button';
import MarkdownText from './common/MarkdownText';
import AdminHeader from './AdminHeader';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ITEMS_PER_PAGE = 20;

const formatFullDateTime = (dateStr, lang) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return String(dateStr);
  const locale = lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en-US';
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
};

export const AdminChats = ({
  t,
  currentLang,
  onToggleLang,
  onBackToSite,
  onNavigate,
}) => {
  const isRtl = currentLang === 'ar';
  const adminT = t.admin;
  const chatsT = adminT.chats;

  // Sessions and filtering
  const [sessions, setSessions] = useState([]);
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'leads'
  const [selectedSession, setSelectedSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const refreshData = async () => {
    setLoading(true);
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*, leads(id,name,email,service_type,status)')
        .order('updated_at', { ascending: false })
        .limit(200);

      if (!sessionsError && sessionsData) {
        setSessions(sessionsData);
      } else {
        setSessions([]);
      }

      const { data: leadsData, error: leadsError } = await supabase
        .from('leads')
        .select('id,name,email,service_type,status')
        .order('created_at', { ascending: false })
        .limit(500);

      if (!leadsError && leadsData) {
        setLeads(leadsData);
      } else {
        setLeads([]);
      }
    } catch {
      setSessions([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDeleteSession = async (sessionId) => {
    if (window.confirm(chatsT.deleteConfirm || 'Are you sure you want to delete this chat session?')) {
      await supabase.from('chat_sessions').delete().eq('id', sessionId);
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
      }
      await refreshData();
    }
  };

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (filterType === 'leads' && !s.lead_id) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const idMatch = s.id?.toLowerCase().includes(q);
      const msgMatch = s.messages?.some((m) => m.text?.toLowerCase().includes(q));
      return idMatch || msgMatch;
    });
  }, [sessions, filterType, searchQuery]);

  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE) || 1;

  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSessions, currentPage]);

  // Lead lookup map
  const leadMap = useMemo(() => {
    const map = new Map();
    leads.forEach((l) => map.set(l.id, l));
    return map;
  }, [leads]);

  return (
    <div
      className={`min-h-screen bg-[#0A0A0A] text-[#A1A1AA] flex flex-col font-body selection:bg-[#00FF88] selection:text-[#0A0A0A] ${
        isRtl ? 'font-arabic' : 'font-body'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <AdminHeader
        currentLang={currentLang}
        onToggleLang={onToggleLang}
        onBackToSite={onBackToSite}
        onNavigate={onNavigate}
        activeTab="chats"
        newLeadsCount={leads.filter((l) => l.status === 'new').length}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title */}
        <div>
          <span className="font-mono text-xs text-[#00FF88] tracking-widest uppercase block mb-1">
            // {chatsT.heading}
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
            {chatsT.heading}
          </h1>
          <p className="text-xs sm:text-sm text-[#A1A1AA] mt-1">{chatsT.sub}</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#111111] border border-white/[0.08]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={chatsT.searchPlaceholder}
              className="w-full ps-10 pe-4 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs sm:text-sm text-white placeholder-[#52525B] focus:outline-none focus:border-[#00FF88]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                  : 'bg-[#161616] text-[#A1A1AA] border border-white/10 hover:text-white'
              }`}
            >
              {chatsT.allChats} ({sessions.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('leads')}
              className={`px-3 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                filterType === 'leads'
                  ? 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_12px_rgba(0,255,136,0.3)]'
                  : 'bg-[#161616] text-[#A1A1AA] border border-white/10 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00FF88]" />
              <span>{chatsT.withLeads} ({sessions.filter((s) => s.lead_id).length})</span>
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-16 text-center rounded-2xl bg-[#111111] border border-white/[0.08]">
            <div className="w-8 h-8 border-2 border-[#00FF88]/30 border-t-[#00FF88] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-mono text-[#71717A]">Loading sessions…</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#111111] border border-white/[0.08]">
            <MessageSquare className="w-12 h-12 text-[#52525B] mx-auto mb-3" />
            <p className="text-sm font-mono text-[#71717A]">{chatsT.empty}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {paginatedSessions.map((session) => {
                const msgs = session.messages || [];
                const lastMsg = msgs[msgs.length - 1];
                const lastMsgDate = lastMsg?.timestamp || session.updated_at;
                const firstVisitorMsg = msgs.find(
                  (m) => m.role === 'user' || m.sender === 'user'
                );
                const hasLead = Boolean(session.lead_id);
                // Prefer joined leads relation, fall back to leadMap
                const linkedLead =
                  session.leads || (session.lead_id ? leadMap.get(session.lead_id) : null);

                const visitorPreview = firstVisitorMsg?.text
                  ? firstVisitorMsg.text.trim().slice(0, 160)
                  : isRtl
                  ? 'لا توجد رسالة من الزائر'
                  : 'No visitor message';

                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="group p-5 rounded-2xl bg-[#111111]/90 border border-white/[0.08] hover:border-[#00FF88]/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.12)] transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs text-[#00FF88] font-bold">
                          {session.id}
                        </span>

                        {/* Date of the last message in active language */}
                        <span className="font-mono text-[11px] text-[#71717A] flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#71717A]" />
                          <span>{formatFullDateTime(lastMsgDate, currentLang)}</span>
                        </span>

                        {/* Detected language */}
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#00FF88] uppercase font-bold">
                          {session.language || 'en'}
                        </span>

                        {/* Number of messages */}
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#A1A1AA] flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-[#71717A]" />
                          <span>
                            {msgs.length}{' '}
                            {isRtl ? 'رسائل' : msgs.length === 1 ? 'message' : 'messages'}
                          </span>
                        </span>

                        {/* Badge "Lead captured" when the session has a lead_id, linking to that lead in /admin/leads */}
                        {hasLead && (
                          <a
                            href={`/admin/leads?id=${session.lead_id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNavigate) {
                                e.preventDefault();
                                onNavigate('/admin/leads');
                              }
                            }}
                            className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#00FF88]/15 border border-[#00FF88]/40 text-[#00FF88] hover:bg-[#00FF88]/25 hover:border-[#00FF88] transition-all flex items-center gap-1 cursor-pointer"
                            title={isRtl ? 'عرض العميل في صفحة العملاء المحتملين' : 'View lead in /admin/leads'}
                          >
                            <Sparkles className="w-3 h-3 text-[#00FF88]" />
                            <span className="font-semibold">Lead captured</span>
                            {linkedLead?.name && (
                              <span className="text-[#A1A1AA] font-normal">({linkedLead.name})</span>
                            )}
                            <ExternalLink className="w-2.5 h-2.5 ms-0.5 opacity-70" />
                          </a>
                        )}
                      </div>

                      {/* Short preview of the first visitor message */}
                      <p className="text-xs sm:text-sm text-[#D4D4D8] truncate max-w-3xl">
                        <span className="text-[#71717A] font-mono me-1.5 font-semibold">
                          {isRtl ? 'أول رسالة للزائر:' : 'First visitor message:'}
                        </span>
                        <span className="text-white/90">
                          {firstVisitorMsg?.text ? `"${visitorPreview}"` : visitorPreview}
                        </span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors cursor-pointer"
                      >
                        {chatsT.viewTranscript}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-[#71717A] hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                        title={chatsT.deleteSession}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/[0.08] text-xs font-mono">
                <span className="text-[#71717A]">
                  {isRtl
                    ? `عرض ${(currentPage - 1) * ITEMS_PER_PAGE + 1} إلى ${Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredSessions.length
                      )} من أصل ${filteredSessions.length} محادثة`
                    : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredSessions.length
                      )} of ${filteredSessions.length} sessions`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-[#161616] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#00FF88]/40 transition-colors cursor-pointer"
                    title={isRtl ? 'السابق' : 'Previous'}
                  >
                    {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>

                  <span className="px-3 py-1 rounded-lg bg-[#111111] border border-white/10 text-[#00FF88] font-bold">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-[#161616] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#00FF88]/40 transition-colors cursor-pointer"
                    title={isRtl ? 'التالي' : 'Next'}
                  >
                    {isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Side Panel Drawer: Transcript & Linked Lead */}
      {selectedSession && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex justify-end rtl:justify-start bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedSession(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl h-full bg-[#111111] border-s rtl:border-e rtl:border-s-0 border-white/[0.1] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-white/[0.08] bg-[#141414] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-heading font-bold text-white tracking-tight">
                  {chatsT.sessionDetailTitle}
                </h3>
                <span className="font-mono text-xs text-[#00FF88]">
                  {selectedSession.id}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSession(selectedSession.id)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#71717A] hover:text-red-400 hover:border-red-500/40 transition-colors cursor-pointer"
                  title={chatsT.deleteSession}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Linked Lead Card if present */}
              {selectedSession.lead_id && (
                <div className="p-4 rounded-2xl bg-[#00FF88]/10 border border-[#00FF88]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-[#00FF88]/20 border border-[#00FF88]/50 text-[#00FF88] font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#00FF88]" />
                        <span>Lead captured</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate?.('/admin/leads')}
                      className="text-xs font-mono font-bold text-[#00FF88] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{chatsT.viewLeadBtn || 'View in Leads Portal →'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {(() => {
                    const lead =
                      selectedSession.leads || leadMap.get(selectedSession.lead_id);
                    return lead ? (
                      <div className="text-xs space-y-1 text-white">
                        <p><strong className="text-[#71717A]">Name:</strong> {lead.name}</p>
                        <p><strong className="text-[#71717A]">Email:</strong> {lead.email}</p>
                        {lead.service_type && (
                          <p><strong className="text-[#71717A]">Service:</strong> {lead.service_type}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-[#A1A1AA]">Lead ID: {selectedSession.lead_id}</p>
                    );
                  })()}
                </div>
              )}

              {/* Chat Message Bubbles */}
              <div className="space-y-4">
                {(selectedSession.messages || []).map((msg, idx) => {
                  const isUser = msg.role === 'user' || msg.sender === 'user';
                  const roleLabel = isUser
                    ? (isRtl ? 'الزائر' : 'Visitor')
                    : (isRtl ? 'المساعد' : 'Assistant');
                  const msgText = msg.text || '';
                  const msgIsArabic = /[\u0600-\u06FF]/.test(msgText);

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        dir={msgIsArabic ? 'rtl' : isRtl ? 'rtl' : 'ltr'}
                        className={`max-w-[85%] rounded-2xl px-4 py-3 space-y-1.5 transition-all ${
                          isUser
                            ? 'bg-[#1C1C1F] text-[#E4E4E7] border border-white/[0.08] shadow-sm'
                            : 'bg-[#0D1512] text-white border border-[#00FF88]/30 shadow-[0_0_20px_rgba(0,255,136,0.06)]'
                        }`}
                      >
                        {/* Message Header: Role label + full date/time in active language */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono">
                          {isUser ? (
                            <User className="w-3.5 h-3.5 text-[#A1A1AA]" />
                          ) : (
                            <Bot className="w-3.5 h-3.5 text-[#00FF88]" />
                          )}
                          <span
                            className={`font-semibold ${
                              isUser ? 'text-[#D4D4D8]' : 'text-[#00FF88]'
                            }`}
                          >
                            {roleLabel}
                          </span>
                          <span className="text-[#71717A] text-[10px]">
                            • {formatFullDateTime(msg.timestamp, currentLang)}
                          </span>
                        </div>

                        {/* Message Body: Assistant rendered as markdown, Visitor as safe escaped plain text */}
                        {isUser ? (
                          <p
                            className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words text-[#F4F4F5] ${
                              msgIsArabic ? 'text-right font-arabic' : 'text-left font-body'
                            }`}
                          >
                            {msgText}
                          </p>
                        ) : (
                          <div
                            className={`text-xs sm:text-sm leading-relaxed ${
                              msgIsArabic ? 'text-right font-arabic' : 'text-left font-body'
                            }`}
                          >
                            <MarkdownText
                              content={msgText}
                              isRtl={msgIsArabic || isRtl}
                              onLinkClick={onNavigate}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChats;
