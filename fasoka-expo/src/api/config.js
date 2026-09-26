// Configuration de l'API backend.
// - Émulateur Android : 10.0.2.2 pointe vers localhost de la machine hôte.
// - Test sur téléphone physique via Expo Go : remplacer par l'adresse IP locale
//   de ton ordinateur (ex: http://192.168.1.20:4000/api), le téléphone et l'ordi
//   doivent être sur le même réseau WiFi.
// - Production : remplacer par l'URL du serveur déployé.
export const API_BASE_URL = 'http://10.0.2.2:4000/api';
