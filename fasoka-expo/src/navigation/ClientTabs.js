import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import SpaceSwitcher from '../components/SpaceSwitcher';
import { IconeOnglet, IconeProfil } from '../components/IconesOnglets';
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import CartScreen from '../screens/client/CartScreen';
import HistoryScreen from '../screens/client/HistoryScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

const Tab = createBottomTabNavigator();

// Noms de base des icônes Ionicons (l'onglet Profil affiche la photo du client, voir IconesOnglets.js)
const ICONES = { Accueil: 'storefront', Panier: 'cart', Historique: 'receipt' };

export default function ClientTabs({ onSelectBoutique }) {
  const { nombreArticles } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.noir },
        headerTintColor: COLORS.or,
        headerTitle: 'FASOKA',
        headerRight: () => <SpaceSwitcher onSelectClient={() => {}} onSelectBoutique={onSelectBoutique} />,
        tabBarActiveTintColor: COLORS.rouge,
        tabBarInactiveTintColor: COLORS.gris,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarBadgeStyle: { backgroundColor: COLORS.rouge, color: 'white' },
        tabBarBadge: route.name === 'Panier' && nombreArticles > 0 ? nombreArticles : undefined,
        tabBarIcon: ({ focused, color, size }) =>
          route.name === 'Profil' ? (
            <IconeProfil focused={focused} color={color} size={size} />
          ) : (
            <IconeOnglet nom={ICONES[route.name]} focused={focused} color={color} size={size} />
          ),
      })}
    >
      <Tab.Screen name="Accueil" component={ClientHomeScreen} />
      <Tab.Screen name="Panier" component={CartScreen} />
      <Tab.Screen name="Historique" component={HistoryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
