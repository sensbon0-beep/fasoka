import React, { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const sauvegarderSession = useCallback(async (data) => {
    await AsyncStorage.setItem('auth_token', data.token);
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
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, inscription, connexion, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
