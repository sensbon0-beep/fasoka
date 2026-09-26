import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

export class ApiException extends Error {}

async function getToken() {
  return AsyncStorage.getItem('auth_token');
}

async function headers() {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handle(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (response.ok) return data;
  const message = data && data.error ? data.error : `Erreur (${response.status})`;
  throw new ApiException(message);
}

export const ApiClient = {
  async get(path, query) {
    const qs = query ? '?' + new URLSearchParams(query).toString() : '';
    const response = await fetch(`${API_BASE_URL}${path}${qs}`, { headers: await headers() });
    return handle(response);
  },

  async post(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: await headers(),
      body: JSON.stringify(body),
    });
    return handle(response);
  },

  async patch(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'PATCH',
      headers: await headers(),
      body: JSON.stringify(body),
    });
    return handle(response);
  },

  async delete(path) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'DELETE',
      headers: await headers(),
    });
    return handle(response);
  },

  /**
   * Envoie une image choisie via expo-image-picker (uri locale) en multipart/form-data.
   */
  async uploadImage(path, localUri) {
    const token = await getToken();
    const formData = new FormData();
    const nomFichier = localUri.split('/').pop();
    const extension = nomFichier.split('.').pop();
    formData.append('image', {
      uri: localUri,
      name: nomFichier,
      type: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
    });

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // Ne PAS fixer Content-Type ici : fetch le génère automatiquement avec la bonne boundary multipart.
      },
      body: formData,
    });
    return handle(response);
  },
};
