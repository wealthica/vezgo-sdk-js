import { create } from 'apisauce';

export const api = create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001' }); // points to this app's backend
export const vezgoApi = create({ baseURL: import.meta.env.VITE_VEZGO_API_URL || 'https://api.vezgo.com/v1' });
export const wealthicaApi = create({ baseURL: import.meta.env.VITE_WEALTHICA_API_URL || 'https://api.wealthica.com/v1' });
