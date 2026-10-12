import React from 'react';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

// Icône d'onglet : version contour quand l'onglet est inactif, version pleine quand il est actif.
// `nom` est le nom de base de l'icône Ionicons (ex : 'cart' → 'cart-outline' / 'cart').
export function IconeOnglet({ nom, focused, color, size }) {
  return <Ionicons name={focused ? nom : nom + '-outline'} size={size + 2} color={color} />;
}

// Icône de l'onglet Profil : affiche la photo de profil du client si elle existe,
// sinon une icône de personne.
export function IconeProfil({ focused, color, size }) {
  const { user } = useAuth();

  if (user && user.photo_profil_url) {
    const taille = size + 6;
    return (
      <Image
        source={{ uri: user.photo_profil_url }}
        style={{
          width: taille,
          height: taille,
          borderRadius: taille / 2,
          borderWidth: 2,
          borderColor: focused ? COLORS.rouge : '#E2E0DA',
          backgroundColor: COLORS.creme,
        }}
      />
    );
  }

  return <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size + 6} color={color} />;
}
