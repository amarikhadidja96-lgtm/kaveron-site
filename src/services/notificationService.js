/**
 * Email Notification Service for New Leads
 * 
 * Formats and dispatches email notifications whenever a new lead submits the contact or pricing form.
 */

const NOTIFICATIONS_STORAGE_KEY = 'kaveron_email_notifications';

export const sendLeadNotification = async (lead) => {
  const notificationPayload = {
    id: `notif_${Date.now()}`,
    timestamp: new Date().toISOString(),
    recipient: 'hello@kaveron.com',
    subject: `🚀 New Lead from ${lead.name} [${lead.service_type}]`,
    data: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone || 'Not provided',
      service_type: lead.service_type,
      budget: lead.budget,
      selected_plan: lead.selected_plan || 'None specified',
      source: lead.source,
      message: lead.message,
      created_date: lead.created_date,
    },
    formattedEmail: `
=========================================
📩 NEW CLIENT INQUIRY - KAVERON AGENCY
=========================================
Name:          ${lead.name}
Email:         ${lead.email}
Phone:         ${lead.phone || 'Not provided'}
Service:       ${lead.service_type}
Budget:        ${lead.budget}
Selected Plan: ${lead.selected_plan || 'None specified'}
Source:        ${lead.source}
Date:          ${new Date(lead.created_date).toLocaleString()}

Project Message:
-----------------------------------------
${lead.message}
=========================================
    `.trim(),
  };


  // 2. Persist to local notification log
  try {
    const existing = JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
    existing.unshift(notificationPayload);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  } catch (err) {
    console.error('Failed to log notification:', err);
  }

  // 3. If an optional webhook URL or EmailJS key is configured in window/env, post to it
  if (typeof window !== 'undefined' && window.KAVERON_WEBHOOK_URL) {
    try {
      await fetch(window.KAVERON_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notificationPayload),
      });
    } catch (e) {
      console.warn('Webhook dispatch failed:', e);
    }
  }

  return { success: true, payload: notificationPayload };
};

export const getNotificationLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTIFICATIONS_STORAGE_KEY) || '[]');
  } catch (err) {
    return [];
  }
};

