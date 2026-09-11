const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch (e) {
        // fallback
      }
      throw new Error(errorMsg);
    }
    return await res.json();
  } catch (err) {
    console.error(`API Error [${endpoint}]:`, err);
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Cases
  getCases: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        query.append(k, v);
      }
    });
    return request(`/cases?${query.toString()}`);
  },
  getCaseDetail: (caseId) => request(`/cases/${caseId}`),
  diagnoseCase: (caseId) => request(`/cases/${caseId}/diagnose`, { method: 'POST' }),
  approveCase: (caseId) => request(`/cases/${caseId}/approve`, { method: 'POST' }),
  executeCase: (caseId, payload = {}) => request(`/cases/${caseId}/execute`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  pauseCase: (caseId) => request(`/cases/${caseId}/pause`, { method: 'POST' }),

  // Customers
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/customers?${query}`);
  },
  getCustomerDetail: (customerId) => request(`/customers/${customerId}`),

  // Payments
  getPayments: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/payments?${query}`);
  },

  // Invoices
  getInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/invoices?${query}`);
  },

  // Receivables
  getReceivables: () => request('/receivables'),

  // Campaigns
  getCampaigns: () => request('/campaigns'),
  createCampaign: (payload) => request('/campaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Analytics
  getAnalytics: () => request('/analytics'),

  // Audit
  getAuditEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit?${query}`);
  },
  getCaseAudit: (caseId) => request(`/audit/${caseId}`),

  // Simulation
  runSimulation: (payload = { batch_size: 1000, auto_approve_eligible: true }) => request('/simulation/run', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  // Demo Reset & Seed
  resetDemo: () => request('/demo/reset', { method: 'POST' }),

  // AI Agent & Message Generation
  generateMessage: (payload) => request('/ai/generate-message', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
  chatAI: (query) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ query }),
  }),
};
