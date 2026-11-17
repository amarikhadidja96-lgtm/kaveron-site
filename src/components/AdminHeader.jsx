import React from 'react';
import { ArrowLeft, LogOut, Globe, Sparkles } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminHeader = ({
  currentLang,
  onToggleLang,
  onBackToSite,
  onNavigate,
  activeTab = 'dashboard', // 'dashboard' | 'leads' | 'chats' | 'knowledge'
  newLeadsCount = 0,
}) => {
  const isRtl = currentLang === 'ar';
  const { logout, user } = useAdminAuth();

  const handleLogout = () => {
    if (window.confirm(isRtl ? 'هل تريد بالتأكيد تسجيل الخروج؟' : 'Are you sure you want to log out?')) {
      logout();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 border-b border-white/[0.08] backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
        {/* Back to site */}
        <button
          type="button"
          onClick={onBackToSite}
          className="flex items-center gap-1.5 text-xs font-mono text-[#A1A1AA] hover:text-[#00FF88] transition-colors p-1.5 rounded-lg"
          title={isRtl ? 'العودة للموقع' : 'Back to Website'}
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span className="hidden md:inline">{isRtl ? 'الموقع' : 'Website'}</span>
        </button>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg font-heading font-extrabold text-white">
            <span className="text-[#00FF88] font-mono">&lt;</span>kaveron
            <span className="text-[#00FF88] font-mono">&#47;&gt;</span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-[#00FF88] px-2 py-0.5 rounded bg-[#00FF88]/10 border border-[#00FF88]/20 font-bold">
            ADMIN
          </span>
        </div>

        {/* Admin Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Dashboard Tab */}
          <button
            type="button"
            onClick={() => onNavigate?.('/admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 font-bold shadow-[0_0_12px_rgba(0,255,136,0.2)]'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {isRtl ? 'لوحة التحكم' : 'Dashboard'}
          </button>

          {/* Leads Tab */}
          <button
            type="button"
            onClick={() => onNavigate?.('/admin/leads')}
            className={`relative px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 font-bold shadow-[0_0_12px_rgba(0,255,136,0.2)]'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>{isRtl ? 'الطلبات' : 'Leads'}</span>
            {newLeadsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#00FF88] text-[#0A0A0A]">
                {newLeadsCount}
              </span>
            )}
          </button>

          {/* Chats Tab */}
          <button
            type="button"
            onClick={() => onNavigate?.('/admin/chats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'chats'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 font-bold shadow-[0_0_12px_rgba(0,255,136,0.2)]'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {isRtl ? 'محادثات البوت' : 'AI Chats'}
          </button>

          {/* Knowledge Tab */}
          <button
            type="button"
            onClick={() => onNavigate?.('/admin/knowledge')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeTab === 'knowledge'
                ? 'bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/30 font-bold shadow-[0_0_12px_rgba(0,255,136,0.2)]'
                : 'text-[#A1A1AA] hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            {isRtl ? 'قاعدة المعرفة' : 'Knowledge'}
          </button>
        </nav>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* New Leads indicator badge */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111111] border border-white/10 font-mono text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FF88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FF88]"></span>
          </span>
          <span className="text-white font-bold">{newLeadsCount}</span>
          <span className="text-[#71717A] text-[11px]">{isRtl ? 'جديد' : 'New'}</span>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={onToggleLang}
          className="font-mono text-xs px-2.5 py-1.5 rounded-lg bg-[#111111] border border-white/10 text-[#A1A1AA] hover:text-white hover:border-[#00FF88]/40 transition-colors"
          title="Toggle Language"
        >
          {currentLang === 'en' ? 'العربية' : 'EN'}
        </button>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
          title={isRtl ? 'تسجيل الخروج' : 'Log Out'}
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isRtl ? 'خروج' : 'Logout'}</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;

