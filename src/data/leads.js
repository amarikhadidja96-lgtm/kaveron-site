/**
 * Leads Database Entity
 * 
 * Schema:
 *  - id: string
 *  - name: string
 *  - email: string
 *  - phone: string
 *  - service_type: 'Website' | 'Landing Page' | 'Online Store' | 'Web App' | 'Other'
 *  - budget: 'Under $500' | '$500-$1500' | '$1500-$5000' | '$5000+'
 *  - message: string
 *  - source: 'contact_form' | 'pricing' | 'chatbot'
 *  - selected_plan: string | null
 *  - status: 'new' | 'contacted' | 'closed' (default: 'new')
 *  - created_date: string (ISO string)
 */

const STORAGE_KEY = 'kaveron_leads_db';

// Initial seed leads for testing admin dashboard
const initialLeads = [
  {
    id: 'lead-1',
    name: 'Karim Bennani',
    email: 'k.bennani@solarix.io',
    phone: '+212 661 234 567',
    service_type: 'Web App',
    budget: '$1500-$5000',
    message: 'We need a customer portal and admin dashboard for our logistics operations, with bilingual Arabic/English interface.',
    source: 'pricing',
    selected_plan: 'Pro',
    status: 'new',
    created_date: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: 'lead-2',
    name: 'Claire Dupont',
    email: 'claire@lumiere-agency.fr',
    phone: '+33 6 12 34 56 78',
    service_type: 'Website',
    budget: '$500-$1500',
    message: 'Looking for a sleek, dark aesthetic redesign for our creative design studio website.',
    source: 'contact_form',
    selected_plan: 'Starter',
    status: 'contacted',
    created_date: new Date(Date.now() - 3600000 * 28).toISOString(), // 1 day ago
  },
  {
    id: 'lead-3',
    name: 'Sultan Al-Otaibi',
    email: 'sultan@apexventures.sa',
    phone: '+966 50 123 4567',
    service_type: 'Web App',
    budget: '$5000+',
    message: 'We are building a fintech investment web platform, requiring real-time portfolio tracking.',
    source: 'pricing',
    selected_plan: 'Custom',
    status: 'closed',
    created_date: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
  },
];

export const getLeads = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialLeads));
      return initialLeads;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialLeads;
  } catch (err) {
    console.error('Error reading leads from storage:', err);
    return initialLeads;
  }
};

export const saveLeads = (leads) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (err) {
    console.error('Error saving leads to storage:', err);
  }
};

export const addLead = (leadData) => {
  const currentLeads = getLeads();
  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: leadData.name.trim(),
    email: leadData.email.trim(),
    phone: (leadData.phone || '').trim(),
    service_type: leadData.service_type || 'Website',
    budget: leadData.budget || '$1500-$5000',
    message: leadData.message.trim(),
    source: leadData.source || 'contact_form',
    selected_plan: leadData.selected_plan || null,
    status: 'new', // default 'new'
    created_date: new Date().toISOString(),
  };

  const updated = [newLead, ...currentLeads];
  saveLeads(updated);

  // Trigger dispatch event so other listeners (e.g. Admin navbar counter) update automatically
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_lead_added', { detail: newLead }));
  }

  return newLead;
};

export const updateLeadStatus = (id, newStatus) => {
  const currentLeads = getLeads();
  const updated = currentLeads.map((item) => {
    if (item.id === id) {
      return { ...item, status: newStatus };
    }
    return item;
  });
  saveLeads(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_leads_updated'));
  }
  return updated;
};

export const updateLead = (id, updates) => {
  const currentLeads = getLeads();
  let updatedLead = null;
  const updated = currentLeads.map((item) => {
    if (item.id === id) {
      updatedLead = { ...item, ...updates };
      return updatedLead;
    }
    return item;
  });
  saveLeads(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_leads_updated'));
  }
  return updatedLead;
};

export const appendLeadMessage = (id, additionalDetails) => {
  const currentLeads = getLeads();
  let updatedLead = null;
  const updated = currentLeads.map((item) => {
    if (item.id === id) {
      const existing = item.message || '';
      const newMessage = existing
        ? `${existing}\n[Additional Details]: ${additionalDetails}`
        : additionalDetails;
      updatedLead = { ...item, message: newMessage };
      return updatedLead;
    }
    return item;
  });
  saveLeads(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_leads_updated'));
  }
  return updatedLead;
};

export const deleteLead = (id) => {
  const currentLeads = getLeads();
  const updated = currentLeads.filter((item) => item.id !== id);
  saveLeads(updated);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('kaveron_leads_updated'));
  }
  return updated;
};

export const getNewLeadsCount = () => {
  const current = getLeads();
  return current.filter((l) => l.status === 'new').length;
};

