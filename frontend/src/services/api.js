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

  async addGift(authToken, name, link, imagePath) {
    const response = await fetch(`${API_URL}/api/admin/gifts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, link, imagePath })
    });
    return response.json();
  },

  async updateGift(authToken, giftId, name, link, imagePath) {
    const response = await fetch(`${API_URL}/api/admin/gifts/${giftId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ name, link, imagePath })
    });
    return response.json();
  },

  async deleteGift(authToken, giftId) {
    const response = await fetch(`${API_URL}/api/admin/gifts/${giftId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      }
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
  },

  // User endpoints
  async createOrUpdateUser(authToken, email, displayName, photoURL) {
    const response = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ email, displayName, photoURL })
    });
    return response.json();
  },

  async approveUser(authToken, userId, approvedBy) {
    const response = await fetch(`${API_URL}/api/users/${userId}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ approvedBy })
    });
    return response.json();
  },

  async rejectUser(authToken, userId, rejectedBy) {
    const response = await fetch(`${API_URL}/api/users/${userId}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ rejectedBy })
    });
    return response.json();
  },

  // Event Settings endpoints
  async getEventSettings(authToken) {
    const response = await fetch(`${API_URL}/api/event-settings`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    return response.json();
  },

  async updateEventSettings(authToken, address, latitude, longitude, eventDate, eventTime, requireApproval) {
    const response = await fetch(`${API_URL}/api/event-settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ address, latitude, longitude, eventDate, eventTime, requireApproval })
    });
    return response.json();
  },

  // Upload endpoints
  async uploadImage(authToken, imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    });
    return response.json();
  },

  async deleteImage(authToken, imagePath) {
    const response = await fetch(`${API_URL}/api/upload/image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ imagePath })
    });
    return response.json();
  }
};
