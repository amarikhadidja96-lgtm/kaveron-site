import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  X,
  Mail,
  Phone,
  MessageCircle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  Clock,
  Sparkles,
  Eye,
  Download,
  Save,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  AlertCircle,
  Inbox,
  User,
  Calendar,
  Layers,
} from 'lucide-react';
import Button from './common/Button';
import AdminHeader from './AdminHeader';
import {
  fetchAdminLeads,
  updateAdminLeadStatus,
  updateAdminLeadNotes,
  deleteAdminLead,
} from '../lib/leads';

const ITEMS_PER_PAGE = 25;

export const AdminLeads = ({ t, currentLang, onToggleLang, onBackToSite, onNavigate }) => {
  const isRtl = currentLang === 'ar';
  const adminT = t.admin;

  // Leads & data state
  const [leadsList, setLeadsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'new' | 'contacted' | 'closed'
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' (newest first) | 'asc' (oldest first)
  const [currentPage, setCurrentPage] = useState(1);

  // Selected lead for side drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSavedSuccess, setNotesSavedSuccess] = useState(false);

  // Load leads from Supabase / Lib
  const loadLeads = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchAdminLeads();
      setLeadsList(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setErrorMessage(err.message || 'Failed to load leads from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Sync notes when selected lead changes
  useEffect(() => {
    if (selectedLead) {
      setNotesInput(selectedLead.notes || '');
      setNotesSavedSuccess(false);
    }
  }, [selectedLead?.id]);

  // Distinct service types for filter dropdown
  const serviceOptions = useMemo(() => {
    const set = new Set();
    leadsList.forEach((l) => {
      if (l.service_type) set.add(l.service_type);
    });
    return Array.from(set);
  }, [leadsList]);

  // Filter & Sort leads
  const filteredLeads = useMemo(() => {
    return leadsList
      .filter((lead) => {
        // Status filter
        if (statusFilter !== 'all' && lead.status !== statusFilter) {
          return false;
        }
        // Service filter
        if (serviceFilter !== 'all' && lead.service_type !== serviceFilter) {
          return false;
        }
        // Search query (name, email, message, phone)
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          (lead.name && lead.name.toLowerCase().includes(q)) ||
          (lead.email && lead.email.toLowerCase().includes(q)) ||
          (lead.message && lead.message.toLowerCase().includes(q)) ||
          (lead.phone && lead.phone.toLowerCase().includes(q)) ||
          (lead.service_type && lead.service_type.toLowerCase().includes(q)) ||
          (lead.selected_plan && lead.selected_plan.toLowerCase().includes(q)) ||
          (lead.notes && lead.notes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at || a.created_date || 0).getTime();
        const dateB = new Date(b.created_at || b.created_date || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [leadsList, statusFilter, serviceFilter, searchQuery, sortOrder]);

  // Counts
  const newCount = useMemo(() => leadsList.filter((l) => l.status === 'new').length, [leadsList]);
  const contactedCount = useMemo(() => leadsList.filter((l) => l.status === 'contacted').length, [leadsList]);
  const closedCount = useMemo(() => leadsList.filter((l) => l.status === 'closed').length, [leadsList]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE) || 1;
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, serviceFilter, sortOrder]);

  // Inline Status Change
  const handleStatusChange = async (leadId, newStatus) => {
    // Optimistic UI update
    setLeadsList((prev) =>
      prev.map((item) => (item.id === leadId ? { ...item, status: newStatus } : item))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await updateAdminLeadStatus(leadId, newStatus);
    } catch (err) {
      console.error('Failed to update status on server:', err);
      alert(isRtl ? 'فشل تحديث الحالة في الخادم' : 'Failed to update status on server');
      loadLeads(); // rollback
    }
  };

  // Save Notes for selected lead
  const handleSaveNotes = async () => {
    if (!selectedLead) return;
    setIsSavingNotes(true);
    try {
      await updateAdminLeadNotes(selectedLead.id, notesInput);
      setLeadsList((prev) =>
        prev.map((item) => (item.id === selectedLead.id ? { ...item, notes: notesInput } : item))
      );
      setSelectedLead((prev) => ({ ...prev, notes: notesInput }));
      setNotesSavedSuccess(true);
      setTimeout(() => setNotesSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert(isRtl ? 'حدث خطأ أثناء حفظ الملاحظات' : 'Error saving notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Lead
  const handleDelete = async (leadId) => {
    const confirmText =
      adminT.detailsDrawer?.deleteConfirm ||
      (isRtl
        ? 'هل أنت متأكد من حذف هذا الطلب نهائياً من قاعدة البيانات؟'
        : 'Are you sure you want to permanently delete this lead?');

    if (window.confirm(confirmText)) {
      // Optimistic delete
      setLeadsList((prev) => prev.filter((item) => item.id !== leadId));
      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }

      try {
        await deleteAdminLead(leadId);
      } catch (err) {
        console.error('Failed to delete lead from server:', err);
        alert(isRtl ? 'فشل حذف الطلب من الخادم' : 'Failed to delete lead from server');
        loadLeads();
      }
    }
  };

  // Export CSV of filtered leads
  const handleExportCSV = () => {
    if (!filteredLeads || filteredLeads.length === 0) {
      alert(isRtl ? 'لا توجد بيانات لتصديرها' : 'No data available to export');
      return;
    }

    const headers = [
      'ID',
      'Date',
      'Name',
      'Email',
      'Phone',
      'Service Type',
      'Budget',
      'Selected Plan',
      'Status',
      'Language',
      'Source',
      'Message',
      'Admin Notes',
    ];

    const escapeCSV = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredLeads.map((lead) => [
      escapeCSV(lead.id),
      escapeCSV(lead.created_at || lead.created_date),
      escapeCSV(lead.name),
      escapeCSV(lead.email),
      escapeCSV(lead.phone || ''),
      escapeCSV(lead.service_type),
      escapeCSV(lead.budget || ''),
      escapeCSV(lead.selected_plan || ''),
      escapeCSV(lead.status),
      escapeCSV(lead.language || 'en'),
      escapeCSV(lead.source || 'contact_form'),
      escapeCSV(lead.message),
      escapeCSV(lead.notes || ''),
    ]);

    // Prepend UTF-8 BOM so Excel opens Arabic correctly
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `kaveron_leads_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Date formatter
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return dateStr;
    }
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
        activeTab="leads"
        newLeadsCount={newCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Title and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#00FF88] uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>// INQUIRIES & DEALS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {adminT.leadsHeading}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1">
              {adminT.leadsSub}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={loadLeads}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#141414] border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors"
              title={isRtl ? 'تحديث البيانات' : 'Refresh'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00FF88]' : ''}`} />
            </button>

            {/* Export CSV Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2 text-xs font-mono border-white/15 hover:border-[#00FF88]/50"
            >
              <Download className="w-4 h-4 text-[#00FF88]" />
              <span>{isRtl ? 'تصدير CSV' : 'Export CSV'}</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={loadLeads}
              className="px-3 py-1 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 font-mono"
            >
              {isRtl ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-[#111111] p-4 rounded-2xl border border-white/10 shadow-lg">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#71717A] absolute top-3.5 start-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={adminT.searchPlaceholder}
              className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-[#52525B] text-xs font-mono focus:outline-none focus:border-[#00FF88] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-3 end-3 text-[#71717A] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills / Selects */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter Buttons */}
            <div className="inline-flex items-center p-1 bg-[#161616] rounded-xl border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {adminT.filterAll} ({leadsList.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('new')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'new'
                    ? 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {adminT.filterNew} ({newCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('contacted')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'contacted'
                    ? 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {adminT.filterContacted} ({contactedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('closed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  statusFilter === 'closed'
                    ? 'bg-[#00FF88] text-[#0A0A0A] font-bold shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                {adminT.filterClosed} ({closedCount})
              </button>
            </div>

            {/* Service Filter Dropdown */}
            {serviceOptions.length > 0 && (
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#00FF88]"
              >
                <option value="all">{isRtl ? 'كافة الخدمات' : 'All Services'}</option>
                {serviceOptions.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className="p-2.5 rounded-xl bg-[#161616] border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#00FF88]/40 transition-colors flex items-center gap-1.5 text-xs font-mono"
              title={isRtl ? 'ترتيب حسب التاريخ' : 'Sort by Date'}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00FF88]" />
              <span className="hidden sm:inline">
                {sortOrder === 'desc' ? (isRtl ? 'الأحدث' : 'Newest') : (isRtl ? 'الأقدم' : 'Oldest')}
              </span>
            </button>
          </div>
        </div>

        {/* Leads Table (Desktop) / Cards (Mobile) */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-2xl">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center">
              <Inbox className="w-12 h-12 text-[#52525B] mx-auto mb-4" />
              <p className="text-base font-bold text-white mb-1">
                {adminT.noLeads || (isRtl ? 'لا توجد طلبات مطابقة' : 'No leads found')}
              </p>
              <p className="text-xs text-[#71717A]">
                {isRtl
                  ? 'جرب تغيير شروط البحث أو الفلترة لتظهر النتائج.'
                  : 'Try adjusting your search query or filter options.'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View (Hidden on mobile) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-start text-xs font-mono">
                  <thead className="bg-[#141414] text-[#71717A] border-b border-white/[0.08] uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-start">{adminT.tableHeaders.date}</th>
                      <th className="px-6 py-4 text-start">{adminT.tableHeaders.client}</th>
                      <th className="px-6 py-4 text-start">{adminT.tableHeaders.servicePlan}</th>
                      <th className="px-6 py-4 text-start">{adminT.tableHeaders.budget}</th>
                      <th className="px-6 py-4 text-start">{adminT.tableHeaders.status}</th>
                      <th className="px-6 py-4 text-end">{adminT.tableHeaders.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {paginatedLeads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;
                      return (
                        <tr
                          key={lead.id}
                          onClick={() => setSelectedLead(lead)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#00FF88]/5 border-s-2 border-s-[#00FF88]'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Date */}
                          <td className="px-6 py-4 text-[#71717A] whitespace-nowrap">
                            {formatDate(lead.created_at || lead.created_date)}
                          </td>

                          {/* Client Name & Contact */}
                          <td className="px-6 py-4">
                            <div className="font-sans font-bold text-white text-sm">
                              {lead.name}
                            </div>
                            <div className="text-[11px] text-[#A1A1AA] flex items-center gap-2 mt-0.5">
                              <span>{lead.email}</span>
                              {lead.phone && <span className="text-[#52525B]">&bull; {lead.phone}</span>}
                            </div>
                          </td>

                          {/* Service / Plan */}
                          <td className="px-6 py-4 font-sans text-[#D4D4D8]">
                            <div>{lead.service_type}</div>
                            {lead.selected_plan && (
                              <span className="text-[11px] text-[#00FF88] font-mono">
                                [{lead.selected_plan}]
                              </span>
                            )}
                          </td>

                          {/* Budget */}
                          <td className="px-6 py-4 text-[#D4D4D8] whitespace-nowrap">
                            {lead.budget || '—'}
                          </td>

                          {/* Status Dropdown */}
                          <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border focus:outline-none cursor-pointer transition-colors ${
                                lead.status === 'new'
                                  ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/40'
                                  : lead.status === 'contacted'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/40'
                                  : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/40'
                              }`}
                            >
                              <option value="new" className="bg-[#111111] text-[#00FF88]">
                                {adminT.statusLabels.new}
                              </option>
                              <option value="contacted" className="bg-[#111111] text-sky-400">
                                {adminT.statusLabels.contacted}
                              </option>
                              <option value="closed" className="bg-[#111111] text-zinc-400">
                                {adminT.statusLabels.closed}
                              </option>
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-end" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedLead(lead)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors"
                                title={adminT.actions.viewDetails}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(lead.id)}
                                className="p-2 rounded-lg bg-white/5 border border-white/10 text-red-400 hover:text-red-300 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
                                title={adminT.actions.delete}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View (Visible on < md) */}
              <div className="block md:hidden divide-y divide-white/[0.06]">
                {paginatedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="p-4 space-y-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-white text-base">
                        {lead.name}
                      </span>
                      <select
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                          lead.status === 'new'
                            ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                            : lead.status === 'contacted'
                            ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        <option value="new" className="bg-[#111111] text-[#00FF88]">
                          {adminT.statusLabels.new}
                        </option>
                        <option value="contacted" className="bg-[#111111] text-sky-400">
                          {adminT.statusLabels.contacted}
                        </option>
                        <option value="closed" className="bg-[#111111] text-zinc-400">
                          {adminT.statusLabels.closed}
                        </option>
                      </select>
                    </div>

                    <div className="text-xs text-[#A1A1AA] flex flex-col gap-1 font-mono">
                      <div>{lead.email}</div>
                      {lead.phone && <div>{lead.phone}</div>}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.04]">
                      <span className="text-[#D4D4D8] font-sans">
                        {lead.service_type}
                      </span>
                      <span className="text-[11px] text-[#71717A] font-mono">
                        {formatDate(lead.created_at || lead.created_date)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="px-6 py-4 bg-[#141414] border-t border-white/[0.08] flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
                <span className="text-[#71717A]">
                  {isRtl
                    ? `عرض ${(currentPage - 1) * ITEMS_PER_PAGE + 1} إلى ${Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredLeads.length
                      )} من أصل ${filteredLeads.length} طلب`
                    : `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1} to ${Math.min(
                        currentPage * ITEMS_PER_PAGE,
                        filteredLeads.length
                      )} of ${filteredLeads.length} leads`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#00FF88]/40"
                  >
                    <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                  </button>

                  <span className="px-3 py-1 rounded-lg bg-[#111111] text-[#00FF88] font-bold">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg bg-[#1a1a1a] border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#00FF88]/40"
                  >
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Side Details Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-fade-in">
          <div
            className="w-full max-w-xl bg-[#111111] border-s border-white/15 h-full overflow-y-auto flex flex-col justify-between p-6 sm:p-8 shadow-2xl relative"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Top Accent line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88] to-transparent shadow-[0_0_15px_rgba(0,255,136,0.6)]" />

            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/[0.08] mb-6">
                <div>
                  <span className="font-mono text-xs text-[#00FF88] uppercase tracking-wider block mb-1">
                    // LEAD DOSSIER
                  </span>
                  <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
                    {selectedLead.name}
                  </h3>
                  <span className="text-xs font-mono text-[#71717A]">
                    {formatDate(selectedLead.created_at || selectedLead.created_date)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Selector */}
              <div className="mb-6 p-4 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-[#A1A1AA]">
                  {isRtl ? 'حالة المتابعة:' : 'Current Pipeline Status:'}
                </span>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStatusChange(selectedLead.id, e.target.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border focus:outline-none cursor-pointer ${
                    selectedLead.status === 'new'
                      ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/40'
                      : selectedLead.status === 'contacted'
                      ? 'bg-sky-500/10 text-sky-400 border-sky-500/40'
                      : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/40'
                  }`}
                >
                  <option value="new" className="bg-[#111111] text-[#00FF88]">
                    {adminT.statusLabels.new}
                  </option>
                  <option value="contacted" className="bg-[#111111] text-sky-400">
                    {adminT.statusLabels.contacted}
                  </option>
                  <option value="closed" className="bg-[#111111] text-zinc-400">
                    {adminT.statusLabels.closed}
                  </option>
                </select>
              </div>

              {/* Quick Communication Actions */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <a
                  href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(
                    `Kaveron Agency // Regarding your inquiry on ${selectedLead.service_type}`
                  )}`}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:text-[#00FF88] hover:border-[#00FF88]/40 flex items-center justify-center gap-2 text-xs font-mono transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#00FF88]" />
                  <span>{adminT.detailsDrawer.emailBtn}</span>
                </a>

                {selectedLead.phone ? (
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:text-[#00FF88] hover:border-[#00FF88]/40 flex items-center justify-center gap-2 text-xs font-mono transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#00FF88]" />
                    <span>WhatsApp</span>
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[#52525B] flex items-center justify-center gap-2 text-xs font-mono cursor-not-allowed">
                    <Phone className="w-4 h-4" />
                    <span>{isRtl ? 'لا يوجد هاتف' : 'No Phone'}</span>
                  </div>
                )}
              </div>

              {/* Inquiries Details Section */}
              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-xl bg-[#161616] border border-white/5 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#71717A]">{isRtl ? 'البريد:' : 'Email:'}</span>
                    <span className="text-white font-sans">{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-[#71717A]">{isRtl ? 'الهاتف:' : 'Phone:'}</span>
                      <span className="text-white font-sans">{selectedLead.phone}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#71717A]">{isRtl ? 'الخدمة:' : 'Service:'}</span>
                    <span className="text-[#00FF88] font-bold font-sans">
                      {selectedLead.service_type}
                    </span>
                  </div>
                  {selectedLead.selected_plan && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-[#71717A]">{isRtl ? 'الباقة المختارة:' : 'Plan:'}</span>
                      <span className="text-white">{selectedLead.selected_plan}</span>
                    </div>
                  )}
                  {selectedLead.budget && (
                    <div className="flex justify-between py-1 border-b border-white/[0.04]">
                      <span className="text-[#71717A]">{isRtl ? 'الميزانية:' : 'Budget:'}</span>
                      <span className="text-white">{selectedLead.budget}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-[#71717A]">{isRtl ? 'المصدر:' : 'Source:'}</span>
                    <span className="text-white">{selectedLead.source}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#71717A]">{isRtl ? 'اللغة:' : 'Language:'}</span>
                    <span className="text-white">{(selectedLead.language || 'en').toUpperCase()}</span>
                  </div>
                </div>

                {/* Message Box */}
                <div>
                  <span className="text-xs font-mono text-[#D4D4D8] uppercase tracking-wider block mb-2">
                    {adminT.detailsDrawer.message}
                  </span>
                  <div className="p-4 rounded-xl bg-[#161616] border border-white/5 text-sm text-white font-body leading-relaxed whitespace-pre-wrap">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Editable Admin Notes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-[#D4D4D8] uppercase tracking-wider">
                      {isRtl ? 'ملاحظات المشرف الداخلية' : 'Internal Admin Notes'}
                    </span>
                    {notesSavedSuccess && (
                      <span className="text-xs font-mono text-[#00FF88] flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'تم الحفظ!' : 'Saved!'}</span>
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder={
                      isRtl
                        ? 'أضف ملاحظات داخلية حول الاتصال بالعميل أو الاتفاقيات...'
                        : 'Add internal notes regarding call notes, agreements, proposals sent...'
                    }
                    className="w-full p-3.5 rounded-xl bg-[#161616] border border-white/10 text-white placeholder-[#52525B] text-xs font-mono focus:outline-none focus:border-[#00FF88] transition-colors resize-none"
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={isSavingNotes}
                      className="font-bold text-xs gap-1.5"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingNotes ? (isRtl ? 'جاري الحفظ...' : 'Saving...') : (isRtl ? 'حفظ الملاحظات' : 'Save Notes')}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedLead.id)}
                className="inline-flex items-center gap-1.5 text-xs font-mono text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
                <span>{adminT.detailsDrawer.deleteBtn}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-[#A1A1AA] hover:text-white transition-colors"
              >
                {isRtl ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeads;
