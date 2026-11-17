/**
 * ChatSessions Database Entity
 *
 * Schema:
 *  - session_id: string
 *  - messages: Array<{
 *      id: string,
 *      sender: 'user' | 'bot',
 *      text: string,
 *      timestamp: string (ISO),
 *      isRtl?: boolean
 *    }>
 *  - language: 'en' | 'ar'
 *  - lead_id?: string | null
 *  - created_date: string (ISO)
 *  - updated_date: string (ISO)
 */

const STORAGE_KEY = 'kaveron_chat_sessions_db_v2';

// Initial seed sessions for testing admin dashboard
const initialSessions = [
  {
    session_id: 'chat-demo-1',
    messages: [
      {
        id: 'msg-1',
        sender: 'bot',
        text: 'Hi there! I am the kaveron assistant. How can I help you today?',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      },
      {
        id: 'msg-2',
        sender: 'user',
        text: 'Do you build custom web apps and dashboards?',
        timestamp: new Date(Date.now() - 3600000 * 2.9).toISOString(),
      },
      {
        id: 'msg-3',
        sender: 'bot',
        text: 'Yes, absolutely! We build custom cloud web applications and administrative dashboards with user authentication, databases, and real-time analytics. Would you like to discuss your project?',
        timestamp: new Date(Date.now() - 3600000 * 2.8).toISOString(),
      },
    ],
    language: 'en',
    lead_id: null,
    created_date: new Date(Date.now() - 3600000 * 3).toISOString(),
    updated_date: new Date(Date.now() - 3600000 * 2.8).toISOString(),
  },
  {
    session_id: 'chat-demo-2',
    messages: [
      {
        id: 'msg-4',
        sender: 'bot',
        text: 'مرحباً بك! أنا مساعد كافيرون الذكي. كيف يمكنني مساعدتك في مشروعك اليوم؟',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        isRtl: true,
      },
      {
        id: 'msg-5',
        sender: 'user',
        text: 'كم تبدأ أسعار المواقع لديكم؟',
        timestamp: new Date(Date.now() - 3600000 * 17.9).toISOString(),
        isRtl: true,
      },
      {
        id: 'msg-6',
        sender: 'bot',
        text: 'تبدأ باقة المواقع وصفحات الهبوط لدينا بعد دراسة متطلبات المشروع، وتشمل تصميماً متجاوباً وعصرياً، وتهيئة SEO، ونموذج تواصل مربوطاً بقاعدة بيانات مع دعم اللغتين العربية والإنجليزية. هل ترغب في عرض سعر لمشروعك؟',
        timestamp: new Date(Date.now() - 3600000 * 17.8).toISOString(),
        isRtl: true,
      },
    ],
    language: 'ar',
    lead_id: null,
    created_date: new Date(Date.now() - 3600000 * 18).toISOString(),
    updated_date: new Date(Date.now() - 3600000 * 17.8).toISOString(),
  },
];

const dispatchUpdateEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_chat_sessions_updated'));
  }
};

export const getChatSessions = () => {
  if (typeof window === 'undefined') return initialSessions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSessions));
      return initialSessions;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading chat sessions from localStorage:', err);
    return initialSessions;
  }
};

export const getChatSession = (sessionId) => {
  const sessions = getChatSessions();
  return sessions.find((s) => s.session_id === sessionId) || null;
};

export const saveChatSession = (sessionData) => {
  if (typeof window === 'undefined' || !sessionData || !sessionData.session_id) return null;
  const sessions = getChatSessions();
  const idx = sessions.findIndex((s) => s.session_id === sessionData.session_id);

  const updatedSession = {
    ...sessionData,
    updated_date: new Date().toISOString(),
  };

  let updatedList;
  if (idx >= 0) {
    updatedList = [...sessions];
    updatedList[idx] = updatedSession;
  } else {
    updatedSession.created_date = updatedSession.created_date || new Date().toISOString();
    updatedList = [updatedSession, ...sessions];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    dispatchUpdateEvent();
    return updatedSession;
  } catch (err) {
    console.error('Failed saving chat session to localStorage:', err);
    return null;
  }
};

export const deleteChatSession = (sessionId) => {
  if (typeof window === 'undefined') return;
  const sessions = getChatSessions();
  const updated = sessions.filter((s) => s.session_id !== sessionId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatchUpdateEvent();
  } catch (err) {
    console.error('Failed deleting chat session:', err);
  }
};

export const createNewSession = (lang = 'en') => {
  const id = 'chat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const newSession = {
    session_id: id,
    messages: [],
    language: lang,
    lead_id: null,
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
  };
  saveChatSession(newSession);
  return newSession;
};

