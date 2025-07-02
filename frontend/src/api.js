// src/api.js
import axios from 'axios';

/**
 * Creates a pre-configured instance of axios for API calls.
 * This is a best practice that makes your code cleaner and easier to maintain.
 * - baseURL is set to your Django backend's address.
 * - All API calls in your components will use this instance.
 */
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // IMPORTANT: Make sure this matches your Django server address
});

export default api;
