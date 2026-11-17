import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  X,
  Lock,
  ArrowLeft,
  BookOpen,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  Save,
  AlertTriangle,
} from 'lucide-react';
import Button from './common/Button';
import AdminHeader from './AdminHeader';
import { supabase } from '../lib/supabase';

// ─── UUID validation helper ────────────────────────────────────────────────────
const isValidUUID = (str) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// ─── Empty form template ───────────────────────────────────────────────────────
const emptyEntry = () => ({
  id: '',
  topic: '',
  question_en: '',
  question_ar: '',
  answer_en: '',
  answer_ar: '',
  keywords: [],
  is_active: true,
});

// ─── KB Entry Modal (Add / Edit) ───────────────────────────────────────────────
const EntryModal = ({ entry: initialEntry, onSave, onClose }) => {
  const [form, setForm] = useState(() => ({
    ...emptyEntry(),
    ...initialEntry,
    keywords: Array.isArray(initialEntry?.keywords)
      ? initialEntry.keywords.join(', ')
      : initialEntry?.keywords || '',
  }));
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.topic.trim() || !form.answer_en.trim()) return;
    setSaving(true);
    const entry = {
      ...form,
      keywords: form.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    };
    onSave(entry);
    setSaving(false);
  };

  const labelClass = 'block text-xs font-mono text-[#A1A1AA] mb-1';
  const inputClass =
    'w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00FF88]/50 transition-colors resize-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" dir="ltr">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#111111] z-10">
          <h2 className="text-white font-semibold text-base">
            {form.id ? 'Edit Knowledge Entry' : 'Add Knowledge Entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-[#A1A1AA] hover:text-white transition-colors p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Topic (slug) *</label>
              <input
                className={inputClass}
                value={form.topic}
                onChange={set('topic')}
                placeholder="e.g. pricing"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Keywords (comma-separated)</label>
              <input
                className={inputClass}
                value={form.keywords}
                onChange={set('keywords')}
                placeholder="price, سعر, combien, شحال"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Question (English)</label>
              <input className={inputClass} value={form.question_en} onChange={set('question_en')} />
            </div>
            <div>
              <label className={labelClass}>Question (Arabic)</label>
              <input className={`${inputClass} text-right`} dir="rtl" value={form.question_ar} onChange={set('question_ar')} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Answer (English) *</label>
            <textarea rows={4} className={inputClass} value={form.answer_en} onChange={set('answer_en')} required />
          </div>

          <div>
            <label className={labelClass}>Answer (Arabic)</label>
            <textarea rows={4} className={`${inputClass} text-right`} dir="rtl" value={form.answer_ar} onChange={set('answer_ar')} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-[#A1A1AA] hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold bg-[#00FF88] text-[#0A0A0A] hover:bg-[#00FF88]/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main AdminKnowledge Component ────────────────────────────────────────────
export const AdminKnowledge = ({ t, currentLang, onToggleLang, onBackToSite, onNavigate }) => {
  const isRtl = currentLang === 'ar';

  const [activeTab, setActiveTab] = useState('kb'); // 'kb' | 'unanswered'
  const [kb, setKb] = useState([]);
  const [unanswered, setUnanswered] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState(null); // null | { entry: {...} }
  const [confirmDelete, setConfirmDelete] = useState(null); // id
  const [loadingKb, setLoadingKb] = useState(true);

  const refreshKb = async () => {
    setLoadingKb(true);
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .order('topic');
    if (!error && data) {
      // Map DB `active` → component `is_active`
      setKb(data.map((e) => ({ ...e, is_active: e.active })));
    } else {
      setKb([]);
    }
    setLoadingKb(false);
  };

  const refreshUnanswered = async () => {
    const { data, error } = await supabase
      .from('unanswered_questions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setUnanswered(data);
    } else {
      setUnanswered([]);
    }
  };

  useEffect(() => {
    refreshKb();
    refreshUnanswered();
  }, []);

  // Filtered KB
  const filteredKb = useMemo(() => {
    if (!searchQuery.trim()) return kb;
    const q = searchQuery.toLowerCase();
    return kb.filter(
      (e) =>
        e.topic.toLowerCase().includes(q) ||
        (e.question_en || '').toLowerCase().includes(q) ||
        (e.answer_en || '').toLowerCase().includes(q) ||
        (e.question_ar || '').includes(q) ||
        (e.answer_ar || '').includes(q) ||
        (e.keywords || []).some((k) => k.toLowerCase().includes(q))
    );
  }, [kb, searchQuery]);

  // Unanswered counts
  const newUnansweredCount = useMemo(
    () => unanswered.filter((q) => q.status === 'new').length,
    [unanswered]
  );

  // Handlers
  const handleSaveEntry = async (entry) => {
    const keywords = Array.isArray(entry.keywords)
      ? entry.keywords
      : entry.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    const payload = {
      ...entry,
      keywords,
      active: entry.is_active !== false,
      updated_at: new Date().toISOString(),
    };
    // Remove UI-only fields
    delete payload.is_active;
    delete payload._unansweredId;

    if (entry.id && isValidUUID(entry.id)) {
      await supabase.from('knowledge_base').upsert(payload);
    } else {
      delete payload.id;
      await supabase.from('knowledge_base').insert(payload);
    }
    await refreshKb();
    setModal(null);
  };

  const handleDeleteEntry = async (id) => {
    await supabase.from('knowledge_base').delete().eq('id', id);
    await refreshKb();
    setConfirmDelete(null);
  };

  const handleAddFromUnanswered = (item) => {
    setModal({
      entry: {
        ...emptyEntry(),
        question_en: item.language === 'en' ? item.question : '',
        question_ar: item.language === 'ar' ? item.question : '',
        keywords: [item.question],
        _unansweredId: item.id,
      },
    });
  };

  const handleModalSave = async (entry) => {
    const unansweredId = entry._unansweredId;
    const { _unansweredId, ...cleanEntry } = entry;

    const keywords = Array.isArray(cleanEntry.keywords)
      ? cleanEntry.keywords
      : cleanEntry.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    const payload = {
      ...cleanEntry,
      keywords,
      active: cleanEntry.is_active !== false,
      updated_at: new Date().toISOString(),
    };
    delete payload.is_active;

    if (cleanEntry.id && isValidUUID(cleanEntry.id)) {
      await supabase.from('knowledge_base').upsert(payload);
    } else {
      delete payload.id;
      await supabase.from('knowledge_base').insert(payload);
    }

    if (unansweredId) {
      await supabase
        .from('unanswered_questions')
        .update({ status: 'added_to_kb' })
        .eq('id', unansweredId);
    }

    await refreshKb();
    await refreshUnanswered();
    setModal(null);
  };

  const handleDeleteUnanswered = async (id) => {
    await supabase.from('unanswered_questions').delete().eq('id', id);
    await refreshUnanswered();
  };

  const handleToggleActive = async (entry) => {
    await supabase
      .from('knowledge_base')
      .update({ active: !entry.active })
      .eq('id', entry.id);
    await refreshKb();
  };

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
        activeTab="knowledge"
      />

      {/* Main */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Knowledge Base</h1>
            <p className="text-sm text-[#A1A1AA] mt-1">
              Manage the AI chatbot's answer database. Changes apply immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModal({ entry: emptyEntry() })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-[#00FF88] text-[#0A0A0A] hover:bg-[#00FF88]/90 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 mb-6 gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('kb')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-mono transition-colors border-b-2 cursor-pointer ${
              activeTab === 'kb'
                ? 'border-[#00FF88] text-[#00FF88]'
                : 'border-transparent text-[#A1A1AA] hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Knowledge Base ({kb.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unanswered')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-mono transition-colors border-b-2 cursor-pointer ${
              activeTab === 'unanswered'
                ? 'border-[#00FF88] text-[#00FF88]'
                : 'border-transparent text-[#A1A1AA] hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Unanswered Questions
            {newUnansweredCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                {newUnansweredCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Knowledge Base Tab ── */}
        {activeTab === 'kb' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A1A1AA]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topic, keyword, answer…"
                className="w-full bg-[#111111] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#A1A1AA]/50 focus:outline-none focus:border-[#00FF88]/40 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#A1A1AA] font-normal w-36">Topic</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#A1A1AA] font-normal">Question (EN)</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#A1A1AA] font-normal hidden md:table-cell">Answer (EN)</th>
                    <th className="text-left px-4 py-3 text-xs font-mono text-[#A1A1AA] font-normal w-28">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingKb && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center">
                        <div className="w-6 h-6 border-2 border-[#00FF88]/30 border-t-[#00FF88] rounded-full animate-spin mx-auto" />
                      </td>
                    </tr>
                  )}
                  {!loadingKb && filteredKb.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-[#A1A1AA]/50 text-sm">
                        {searchQuery ? 'No entries match your search.' : 'No knowledge base entries yet. Add your first one.'}
                      </td>
                    </tr>
                  )}
                  {filteredKb.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
                        idx === filteredKb.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      <td className="px-4 py-3 align-top">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#00FF88]/10 text-[#00FF88] font-mono text-xs">
                          {entry.topic}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-white/80 max-w-xs">
                        <div className="line-clamp-2">{entry.question_en || '—'}</div>
                        {entry.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {entry.keywords.slice(0, 4).map((kw) => (
                              <span key={kw} className="px-1.5 py-0.5 rounded bg-white/5 text-[#A1A1AA] text-xs font-mono">
                                {kw}
                              </span>
                            ))}
                            {entry.keywords.length > 4 && (
                              <span className="text-[#A1A1AA]/50 text-xs">+{entry.keywords.length - 4}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top hidden md:table-cell text-[#A1A1AA] max-w-xs">
                        <div className="line-clamp-2 text-xs">{entry.answer_en || '—'}</div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setModal({ entry })}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#00FF88] hover:bg-[#00FF88]/10 transition-colors cursor-pointer"
                            title={isRtl ? 'تعديل' : 'Edit'}
                            aria-label={isRtl ? 'تعديل' : 'Edit'}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(entry.id)}
                            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                            title={isRtl ? 'حذف' : 'Delete'}
                            aria-label={isRtl ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Unanswered Questions Tab ── */}
        {activeTab === 'unanswered' && (
          <div className="space-y-3">
            <p className="text-sm text-[#A1A1AA]">
              Questions the chatbot could not answer from the knowledge base. Review them and add answers to improve the bot.
            </p>

            {unanswered.length === 0 && (
              <div className="bg-[#111111] border border-white/10 rounded-2xl px-6 py-12 text-center text-[#A1A1AA]/50 text-sm">
                No unanswered questions yet.
              </div>
            )}

            {unanswered.map((item) => (
              <div
                key={item.id}
                className={`bg-[#111111] border rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                  item.status === 'added_to_kb' ? 'border-white/5 opacity-60' : 'border-white/10'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm text-white ${item.language === 'ar' ? 'text-right font-arabic' : ''}`}
                    dir={item.language === 'ar' ? 'rtl' : 'ltr'}
                  >
                    {item.question}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-xs text-[#A1A1AA]/60 font-mono">
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#A1A1AA]">
                      {item.language.toUpperCase()}
                    </span>
                    {item.status === 'added_to_kb' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-[#00FF88] font-mono">
                        <CheckCircle className="w-3 h-3" /> Added to KB
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-yellow-400 font-mono">
                        <AlertTriangle className="w-3 h-3" /> New
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'added_to_kb' && (
                    <button
                      type="button"
                      onClick={() => handleAddFromUnanswered(item)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30 hover:bg-[#00FF88]/20 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to KB
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteUnanswered(item.id)}
                    className="p-2 rounded-lg text-[#A1A1AA] hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                    title={isRtl ? 'حذف' : 'Delete'}
                    aria-label={isRtl ? 'حذف' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Entry Modal ── */}
      {modal && (
        <EntryModal
          entry={modal.entry}
          onSave={handleModalSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* ── Confirm Delete Dialog ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-semibold mb-2">Delete Entry?</h3>
            <p className="text-sm text-[#A1A1AA] mb-5">
              This will permanently remove the knowledge entry. The chatbot won't be able to answer related questions from this entry.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg text-sm text-[#A1A1AA] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteEntry(confirmDelete)}
                className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKnowledge;
