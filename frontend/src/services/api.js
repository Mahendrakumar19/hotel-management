import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Room Service
export const roomService = {
  getAllRooms: async (status) => {
    const response = await api.get('/rooms', { params: { status } });
    return response.data;
  },

  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  getRoomStatistics: async () => {
    const response = await api.get('/rooms/statistics');
    return response.data;
  },

  getAvailableRooms: async (checkInDate, checkOutDate, capacity) => {
    const response = await api.get('/rooms/available', {
      params: { checkInDate, checkOutDate, capacity }
    });
    return response.data;
  },

  updateRoomStatus: async (id, status) => {
    const response = await api.patch(`/rooms/${id}/status`, { status });
    return response.data;
  }
};

// Reservation Service
export const reservationService = {
  createReservation: async (data) => {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  getReservationById: async (id) => {
    const response = await api.get(`/reservations/${id}`);
    return response.data;
  },

  getReservationByNumber: async (reservationNumber) => {
    const response = await api.get(`/reservations/by-number/${reservationNumber}`);
    return response.data;
  },

  searchReservations: async (query) => {
    const response = await api.get('/reservations/search', { params: { query } });
    return response.data;
  },

  getUpcomingReservations: async (days) => {
    const response = await api.get('/reservations/upcoming', { params: { days } });
    return response.data;
  },

  updateReservationStatus: async (id, status) => {
    const response = await api.patch(`/reservations/${id}/status`, { status });
    return response.data;
  },

  cancelReservation: async (id) => {
    const response = await api.delete(`/reservations/${id}/cancel`);
    return response.data;
  }
};

// Guest Service
export const guestService = {
  createGuest: async (data) => {
    const response = await api.post('/guests', data);
    return response.data;
  },

  getGuestById: async (id) => {
    const response = await api.get(`/guests/${id}`);
    return response.data;
  },

  searchGuests: async (query) => {
    const response = await api.get('/guests/search', { params: { query } });
    return response.data;
  },

  getGuestHistory: async (id) => {
    const response = await api.get(`/guests/${id}/history`);
    return response.data;
  },

  updateGuest: async (id, data) => {
    const response = await api.patch(`/guests/${id}`, data);
    return response.data;
  },

  getFrequentGuests: async (limit) => {
    const response = await api.get('/guests/frequent', { params: { limit } });
    return response.data;
  }
};

// Check-in Service
export const checkInService = {
  checkInGuest: async (data) => {
    const response = await api.post('/check-ins', data);
    return response.data;
  },

  checkOutGuest: async (checkInId) => {
    const response = await api.post('/check-ins/checkout', { checkInId });
    return response.data;
  },

  getActiveCheckIns: async () => {
    const response = await api.get('/check-ins/active');
    return response.data;
  },

  getCheckInById: async (id) => {
    const response = await api.get(`/check-ins/${id}`);
    return response.data;
  },

  getCheckInSummary: async (checkInId) => {
    const response = await api.get(`/check-ins/${checkInId}/summary`);
    return response.data;
  },

  getGuestLedger: async (checkInId) => {
    const response = await api.get(`/check-ins/${checkInId}/ledger`);
    return response.data;
  },

  addLedgerEntry: async (data) => {
    const response = await api.post('/check-ins/ledger/entry', data);
    return response.data;
  }
};

// Billing Service
export const billingService = {
  createBill: async (data) => {
    const response = await api.post('/bills', data);
    return response.data;
  },

  getBillById: async (id) => {
    const response = await api.get(`/bills/${id}`);
    return response.data;
  },

  getOpenBills: async (guestId) => {
    const response = await api.get('/bills/open', { params: { guestId } });
    return response.data;
  },

  getGuestBills: async (guestId) => {
    const response = await api.get(`/bills/guest/${guestId}`);
    return response.data;
  },

  settleBill: async (billId) => {
    const response = await api.post('/bills/settle', { billId });
    return response.data;
  },

  addItemToBill: async (billId, data) => {
    const response = await api.post(`/bills/${billId}/item`, data);
    return response.data;
  },

  getDailyBillingReport: async (date) => {
    const response = await api.get('/bills/report/daily', { params: { date } });
    return response.data;
  }
};

// Reporting Service
export const reportingService = {
  getDailyReport: async (date) => {
    const response = await api.get('/reports/daily', { params: { date } });
    return response.data;
  },

  getMonthlyReport: async (year, month) => {
    const response = await api.get('/reports/monthly', { params: { year, month } });
    return response.data;
  },

  getOccupancyReport: async (startDate, endDate) => {
    const response = await api.get('/reports/occupancy', { params: { startDate, endDate } });
    return response.data;
  },

  getRevenueReport: async (startDate, endDate) => {
    const response = await api.get('/reports/revenue', { params: { startDate, endDate } });
    return response.data;
  },

  getGuestStatistics: async () => {
    const response = await api.get('/reports/guests/statistics');
    return response.data;
  },

  getTopSpendingGuests: async (limit) => {
    const response = await api.get('/reports/guests/top-spenders', { params: { limit } });
    return response.data;
  }
};

export default api;
