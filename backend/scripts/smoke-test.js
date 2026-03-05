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
    console.log('Server healthy. Preparing auth and checking available rooms...');

    // Try to login as a front desk test user, create if missing
    let token = null;
    try {
      const loginRes = await axios.post(`${API}/auth/login`, { email: 'smoke@test.local', password: 'password123' });
      token = loginRes.data.token || loginRes.data?.token;
      console.log('Logged in existing test user');
    } catch (err) {
      console.log('Test user not found, creating user...');
      await axios.post(`${API}/auth/register`, { name: 'Smoke Tester', email: 'smoke@test.local', password: 'password123', role: 'front_desk' });
      const loginRes2 = await axios.post(`${API}/auth/login`, { email: 'smoke@test.local', password: 'password123' });
      token = loginRes2.data.token || loginRes2.data?.token;
      console.log('Registered and logged in test user');
    }

    const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 7);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2);

    const fmt = (d) => d.toISOString().slice(0,10);

    const roomsRes = await axios.get(`${API}/rooms/available`, {
      params: { checkInDate: fmt(checkIn), checkOutDate: fmt(checkOut), capacity: 1 },
      timeout: 5000,
      ...authHeaders
    });

    console.log('Available rooms response status:', roomsRes.status);
    console.log('Rooms count:', Array.isArray(roomsRes.data) ? roomsRes.data.length : 'unknown');

    if (Array.isArray(roomsRes.data) && roomsRes.data.length > 0) {
      const room = roomsRes.data[0];
      console.log('Sample room:', { id: room.id, room_number: room.room_number });

      // Create a guest
      const guestRes = await axios.post(`${API}/guests`, {
        firstName: 'Smoke', lastName: 'Test', phone: '0000000000', email: 'smoke@example.com'
      }, { timeout: 5000, ...authHeaders });

      console.log('Created guest id:', guestRes.data.guest.id || guestRes.data.id || '(unknown)');

      const guestId = guestRes.data.guest?.id || guestRes.data.id;

      // Create reservation
      const reservationRes = await axios.post(`${API}/reservations`, {
        guestId,
        roomId: room.id,
        checkInDate: fmt(checkIn),
        checkOutDate: fmt(checkOut),
        numberOfGuests: 1
      }, { timeout: 5000, ...authHeaders });

      console.log('Reservation create status:', reservationRes.status);
      console.log('Reservation:', reservationRes.data.reservation || reservationRes.data);
    } else {
      console.log('No rooms available for smoke test — availability endpoint works but returned none.');
    }

    console.log('Smoke test completed.');
  } catch (err) {
    console.error('Smoke test failed:', err.message || err);
    process.exitCode = 2;
  }
}

run();
