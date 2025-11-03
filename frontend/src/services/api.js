const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  // Invite endpoints
  async verifyInvite(token) {
    const response = await fetch(`${API_URL}/api/invites/${token}`);
    return response.json();
  },

  async useInvite(token, email, name) {
    const response = await fetch(`${API_URL}/api/invites/${token}/use`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    return response.json();
  },

  async confirmPresence(token) {
    const response = await fetch(`${API_URL}/api/invites/${token}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  },

  // Gift endpoints
  async getGifts() {
    const response = await fetch(`${API_URL}/api/gifts`);
    return response.json();
  },

  async selectGift(giftId, token) {
    const response = await fetch(`${API_URL}/api/gifts/${giftId}/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    return response.json();
  },

  // Admin endpoints
  async generateInvite(authToken) {
    const response = await fetch(`${API_URL}/api/admin/invites/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.json();
  },

  async addGift(authToken, name, link) {
    const response = await fetch(`${API_URL}/api/admin/gifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, link })
    });
    return response.json();
  },

  async getAdminInvites(authToken) {
    const response = await fetch(`${API_URL}/api/admin/invites`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.json();
  },

  async getAdminGifts(authToken) {
    const response = await fetch(`${API_URL}/api/admin/gifts`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.json();
  },

  async getEmailLogs(authToken) {
    const response = await fetch(`${API_URL}/api/admin/email-logs`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.json();
  }
};
