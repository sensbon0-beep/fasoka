import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient } from '../api/apiClient';
import { API_BASE_URL } from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [chargementSession, setChargementSession] = useState(true);

  // Au démarrage de l'app (ou à l'actualisation de la page), on tente de retrouver la session enregistrée
  useEffect(() => {
    let actif = true;

    async function restaurerSession() {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const userJson = await AsyncStorage.getItem('auth_user');
        if (!token || !userJson) return;

        // Vérifie que le token est encore valide (il expire au bout de 7 jours)
        try {
          const reponse = await fetch(API_BASE_URL + '/shops/mine', {
            headers: { Authorization: 'Bearer ' + token },
          });
          if (reponse.status === 401) {
            await AsyncStorage.removeItem('auth_token');
            await AsyncStorage.removeItem('auth_user');
            return;
          }
        } catch (e) {
          // Pas de réseau pour le moment : on garde la session et on réessaiera plus tard
        }

        if (actif) setUser(JSON.parse(userJson));
      } catch (e) {
        // Lecture impossible : on reste simplement déconnecté
      } finally {
        if (actif) setChargementSession(false);
      }
    }

    restaurerSession();
    return () => { actif = false; };
  }, []);

  const sauvegarderSession = useCallback(async (data) => {
    await AsyncStorage.setItem('auth_token', data.token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const inscription = useCallback(async ({ nom, prenom, email, telephone, motDePasse }) => {
    const data = await ApiClient.post('/auth/signup', {
      nom, prenom, email, telephone, mot_de_passe: motDePasse,
    });
    await sauvegarderSession(data);
  }, [sauvegarderSession]);

  const connexion = useCallback(async ({ identifiant, motDePasse }) => {
    const data = await ApiClient.post('/auth/login', {
      identifiant, mot_de_passe: motDePasse,
    });
    await sauvegarderSession(data);
  }, [sauvegarderSession]);

  const deconnexion = useCallback(async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, chargementSession, inscription, connexion, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
