const axios = require('axios');

const API = process.env.API_BASE || 'http://localhost:5000/api';

async function waitForServer(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.get(`${API.replace('/api','')}/health`, { timeout: 2000 });
      if (res.data && res.data.status === 'OK') return true;
    } catch (err) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  throw new Error('Server did not become healthy in time');
}

async function run() {
  try {
    console.log('Waiting for server...');
    await waitForServer();
    console.log('Server healthy. Preparing admin and creating room...');

    let token = null;
    try {
      const loginRes = await axios.post(`${API}/auth/login`, { email: 'admin@test.local', password: 'adminpass' });
      token = loginRes.data.token;
      console.log('Logged in existing admin');
    } catch (err) {
      console.log('Admin user not found, creating admin...');
      await axios.post(`${API}/auth/register`, { name: 'Admin', email: 'admin@test.local', password: 'adminpass', role: 'admin' });
      const loginRes2 = await axios.post(`${API}/auth/login`, { email: 'admin@test.local', password: 'adminpass' });
      token = loginRes2.data.token;
      console.log('Registered and logged in admin');
    }

    const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const roomPayload = {
      roomNumber: `AUTO-${Date.now()}`,
      roomType: 'standard',
      capacity: 2,
      baseRate: 1200,
      status: 'vacant'
    };

    const res = await axios.post(`${API}/rooms`, roomPayload, { timeout: 5000, ...headers });
    console.log('Create room status:', res.status);
    console.log('Created room:', res.data.room || res.data);
  } catch (err) {
    console.error('Add room test failed:', err.response?.data || err.message || err);
    process.exitCode = 2;
  }
}

run();
