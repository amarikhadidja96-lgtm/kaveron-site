import { supabase, isSupabaseConfigured } from './supabase';
import { addLead as addLocalLead, getLeads as getLocalLeads, updateLeadStatus as updateLocalLeadStatus, updateLead as updateLocalLead, deleteLead as deleteLocalLead } from '../data/leads';
import { sendLeadNotification } from '../services/notificationService';

/**
 * Submits a lead to the backend Edge Function 'submit-lead'.
 * Returns { ok: true, id?: string } on success.
 */
export const submitLead = async (leadData) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: leadData,
      });

      if (error) {
        console.error('Edge function submit-lead error:', error);
        throw new Error(error.message || 'Submission failed');
      }

      if (data && data.ok) {
        return { ok: true, id: data.id };
      }

      throw new Error(data?.error || 'Failed to submit lead');
    } catch (err) {
      console.warn('Edge function invoke failed, checking fallback:', err);
      // If error is rate-limit or validation from server, rethrow so UI can notify user
      if (err.message && (err.message.includes('rate') || err.message.includes('Too many'))) {
        throw err;
      }
      throw err;
    }
  }

  // Fallback for local development if Supabase credentials are not configured yet
  console.info('[Kaveron] Supabase not configured: saving lead locally.');
  const saved = addLocalLead(leadData);
  await sendLeadNotification(saved);
  return { ok: true, id: saved.id };
};

/**
 * Fetches all leads from Supabase (RLS protected, requires admin session).
 * Falls back to local storage if Supabase is not configured.
 */
export const fetchAdminLeads = async () => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin leads from Supabase:', error);
      throw error;
    }

    return (data || []).map((lead) => ({
      ...lead,
      created_date: lead.created_at, // normalize property
    }));
  }

  return getLocalLeads();
};

/**
 * Updates a lead's status in Supabase
 */
export const updateAdminLeadStatus = async (id, status) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status in Supabase:', error);
      throw error;
    }

    return data;
  }

  return updateLocalLeadStatus(id, status);
};

/**
 * Updates a lead's notes in Supabase
 */
export const updateAdminLeadNotes = async (id, notes) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('leads')
      .update({ notes })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead notes in Supabase:', error);
      throw error;
    }

    return data;
  }

  return updateLocalLead(id, { notes });
};

/**
 * Deletes a lead in Supabase
 */
export const deleteAdminLead = async (id) => {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead from Supabase:', error);
      throw error;
    }

    return true;
  }

  deleteLocalLead(id);
  return true;
};

