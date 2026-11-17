/**
 * UnansweredQuestions Database Entity
 * Logs visitor questions that the bot could not answer from the knowledge base,
 * so administrators can review them and create new KnowledgeBase entries.
 *
 * Schema:
 *  - id: string
 *  - question: string
 *  - language: 'en' | 'ar'
 *  - session_id: string
 *  - created_date: string (ISO)
 *  - status: 'new' | 'added_to_kb'
 */

const STORAGE_KEY = 'kaveron_unanswered_questions_db';

const initialUnanswered = [
  {
    id: 'unans-demo-1',
    question: 'Do you offer monthly payment installments?',
    language: 'en',
    session_id: 'session-demo-1',
    created_date: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'new',
  },
  {
    id: 'unans-demo-2',
    question: 'هل يمكنكم عمل تطبيق توصيل طلبات مع تتبع مباشر؟',
    language: 'ar',
    session_id: 'session-demo-2',
    created_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'new',
  },
];

const dispatchUnansweredEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_unanswered_updated'));
  }
};

export const getUnansweredQuestions = () => {
  if (typeof window === 'undefined') return initialUnanswered;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUnanswered));
      return initialUnanswered;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialUnanswered;
  } catch (err) {
    console.error('Error reading UnansweredQuestions from localStorage:', err);
    return initialUnanswered;
  }
};

export const addUnansweredQuestion = ({ question, language = 'en', session_id = '' }) => {
  if (!question || !question.trim()) return null;
  const questions = getUnansweredQuestions();

  // Avoid spam duplicates in same session
  const isDuplicate = questions.some(
    (q) => q.question.toLowerCase().trim() === question.toLowerCase().trim() && q.session_id === session_id
  );
  if (isDuplicate) return null;

  const newEntry = {
    id: 'unans-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    question: question.trim(),
    language,
    session_id,
    created_date: new Date().toISOString(),
    status: 'new',
  };

  const updated = [newEntry, ...questions];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatchUnansweredEvent();
    return newEntry;
  } catch (err) {
    console.error('Error adding unanswered question:', err);
    return null;
  }
};

export const updateUnansweredStatus = (id, status = 'added_to_kb') => {
  const questions = getUnansweredQuestions();
  const updated = questions.map((q) => (q.id === id ? { ...q, status } : q));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatchUnansweredEvent();
  } catch (err) {
    console.error('Error updating unanswered question status:', err);
  }
};

export const deleteUnansweredQuestion = (id) => {
  const questions = getUnansweredQuestions();
  const updated = questions.filter((q) => q.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    dispatchUnansweredEvent();
  } catch (err) {
    console.error('Error deleting unanswered question:', err);
  }
};

