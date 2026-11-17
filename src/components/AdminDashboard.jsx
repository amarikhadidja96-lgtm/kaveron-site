import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Inbox,
  Sparkles,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import AdminHeader from './AdminHeader';
import Button from './common/Button';
import { fetchAdminLeads } from '../lib/leads';

export const AdminDashboard = ({ t, currentLang, onToggleLang, onBackToSite, onNavigate }) => {
  const isRtl = currentLang === 'ar';
  const adminT = t.admin;

  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminLeads();
      setLeads(data);
    } catch (err) {
      console.error('Error loading dashboard leads:', err);
      setError(err.message || 'Failed to load leads from database');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Compute metrics
  const todayStr = new Date().toDateString();

  const newTodayCount = useMemo(() => {
    return leads.filter((l) => {
      const d = new Date(l.created_at || l.created_date);
      return d.toDateString() === todayStr;
    }).length;
  }, [leads, todayStr]);

  const totalCount = leads.length;
  const newCount = useMemo(() => leads.filter((l) => l.status === 'new').length, [leads]);
  const contactedCount = useMemo(() => leads.filter((l) => l.status === 'contacted').length, [leads]);
  const closedCount = useMemo(() => leads.filter((l) => l.status === 'closed').length, [leads]);

  // 5 latest leads
  const latestLeads = useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.created_at || b.created_date) - new Date(a.created_at || a.created_date))
      .slice(0, 5);
  }, [leads]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat(isRtl ? 'ar-EG' : 'en-US', {
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
        activeTab="dashboard"
        newLeadsCount={newCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-xs text-[#00FF88] uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>// AGENCY OVERVIEW</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              {isRtl ? 'لوحة القيادة الرئيسية' : 'Admin Operations Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] mt-1">
              {isRtl
                ? 'إحصائيات فورية للطلبات الواردة، ومعدلات التواصل مع العملاء المحتملين.'
                : 'Real-time overview of incoming inquiries, conversion status, and quick client actions.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadLeads}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-[#141414] border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors"
              title={isRtl ? 'تحديث البيانات' : 'Refresh Data'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00FF88]' : ''}`} />
            </button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onNavigate?.('/admin/leads')}
              className="font-bold gap-2 text-xs"
            >
              <span>{isRtl ? 'إدارة الطلبات' : 'Manage Leads'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-4 text-xs text-red-400">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: New Today */}
          <div className="relative rounded-2xl bg-[#111111] border border-white/10 p-5 overflow-hidden shadow-lg">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00FF88]/40 to-transparent" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
                {isRtl ? 'طلبات اليوم' : 'New Today'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 flex items-center justify-center text-[#00FF88]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-heading font-extrabold text-white">{newTodayCount}</span>
                <span className="text-xs text-[#00FF88] font-mono">
                  {isRtl ? 'خلال 24 ساعة' : 'past 24h'}
                </span>
              </div>
            )}
          </div>

          {/* Card 2: Total Leads */}
          <div className="relative rounded-2xl bg-[#111111] border border-white/10 p-5 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
                {isRtl ? 'إجمالي الطلبات' : 'Total Leads'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-heading font-extrabold text-white">{totalCount}</span>
                <span className="text-xs text-[#71717A] font-mono">
                  {isRtl ? 'من جميع المصادر' : 'all time'}
                </span>
              </div>
            )}
          </div>

          {/* Card 3: Pending Action (New) */}
          <div className="relative rounded-2xl bg-[#111111] border border-white/10 p-5 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
                {isRtl ? 'قيد المتابعة' : 'Pending Response'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-heading font-extrabold text-white">{newCount}</span>
                <span className="text-xs text-amber-400 font-mono">
                  {isRtl ? 'بحاجة للرد' : 'status: new'}
                </span>
              </div>
            )}
          </div>

          {/* Card 4: Closed / Completed */}
          <div className="relative rounded-2xl bg-[#111111] border border-white/10 p-5 overflow-hidden shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
                {isRtl ? 'تم الإغلاق / التعاقد' : 'Closed Deals'}
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-9 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-heading font-extrabold text-white">{closedCount}</span>
                <span className="text-xs text-emerald-400 font-mono">
                  {totalCount > 0 ? `${Math.round((closedCount / totalCount) * 100)}% conv.` : '0%'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown by Status section */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 p-6">
          <h2 className="text-sm font-mono text-white font-bold uppercase tracking-wider mb-4">
            {isRtl ? 'توزيع الطلبات حسب الحالة' : 'Leads by Status Pipeline'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* New */}
            <div className="p-4 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block font-mono">
                  {isRtl ? 'جديد (لم يتم الرد)' : 'New (Uncontacted)'}
                </span>
                <span className="text-2xl font-heading font-bold text-[#00FF88] mt-1 block">
                  {newCount}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/30">
                {isRtl ? 'جديد' : 'New'}
              </span>
            </div>

            {/* Contacted */}
            <div className="p-4 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block font-mono">
                  {isRtl ? 'تم التواصل معه' : 'Contacted / In Discussion'}
                </span>
                <span className="text-2xl font-heading font-bold text-sky-400 mt-1 block">
                  {contactedCount}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-sky-500/10 text-sky-400 border border-sky-500/30">
                {isRtl ? 'تم التواصل' : 'Contacted'}
              </span>
            </div>

            {/* Closed */}
            <div className="p-4 rounded-xl bg-[#161616] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#71717A] block font-mono">
                  {isRtl ? 'مغلق (منتهي)' : 'Closed / Archived'}
                </span>
                <span className="text-2xl font-heading font-bold text-zinc-400 mt-1 block">
                  {closedCount}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                {isRtl ? 'مغلق' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* 5 Latest Leads Section */}
        <div className="rounded-2xl bg-[#111111] border border-white/10 overflow-hidden shadow-xl">
          <div className="p-5 sm:p-6 border-b border-white/[0.06] flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-heading font-bold text-white">
                {isRtl ? 'أحدث 5 طلبات واردة' : '5 Latest Inquiries'}
              </h2>
              <p className="text-xs text-[#71717A]">
                {isRtl ? 'قائمة الطلبات الأخيرة المسجلة' : 'Most recent client briefs and proposals'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onNavigate?.('/admin/leads')}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#00FF88] hover:underline"
            >
              <span>{isRtl ? 'عرض كافة الطلبات' : 'View all leads'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : latestLeads.length === 0 ? (
            <div className="p-12 text-center">
              <Inbox className="w-10 h-10 text-[#52525B] mx-auto mb-3" />
              <p className="text-sm text-white font-medium">
                {isRtl ? 'لا توجد طلبات مسجلة بعد' : 'No inquiries received yet'}
              </p>
              <p className="text-xs text-[#71717A] mt-1">
                {isRtl ? 'ستظهر الطلبات الجديدة هنا فور وصولها.' : 'New submissions will appear here automatically.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs font-mono">
                <thead className="bg-[#141414] text-[#71717A] border-b border-white/[0.06] uppercase">
                  <tr>
                    <th className="px-6 py-3.5 text-start">{isRtl ? 'العميل' : 'Client'}</th>
                    <th className="px-6 py-3.5 text-start">{isRtl ? 'الخدمة' : 'Service'}</th>
                    <th className="px-6 py-3.5 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                    <th className="px-6 py-3.5 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                    <th className="px-6 py-3.5 text-end">{isRtl ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {latestLeads.map((lead) => {
                    const statusClass =
                      lead.status === 'new'
                        ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/30'
                        : lead.status === 'contacted'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30';

                    return (
                      <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-sans font-bold text-white text-sm">{lead.name}</div>
                          <div className="text-[11px] text-[#71717A]">{lead.email}</div>
                        </td>
                        <td className="px-6 py-4 text-[#D4D4D8] font-sans">
                          {lead.service_type}
                          {lead.selected_plan && (
                            <span className="block text-[11px] text-[#00FF88] font-mono">
                              [{lead.selected_plan}]
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#71717A]">
                          {formatDate(lead.created_at || lead.created_date)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusClass}`}>
                            {lead.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-end">
                          <button
                            type="button"
                            onClick={() => onNavigate?.('/admin/leads')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[#A1A1AA] hover:text-[#00FF88] hover:border-[#00FF88]/40 transition-colors"
                          >
                            <span>{isRtl ? 'تفاصيل' : 'Details'}</span>
                            <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

