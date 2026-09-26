import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { COLORS } from '../theme/colors';
import { useCart } from '../context/CartContext';
import SpaceSwitcher from '../components/SpaceSwitcher';
import ClientHomeScreen from '../screens/client/ClientHomeScreen';
import CartScreen from '../screens/client/CartScreen';
import HistoryScreen from '../screens/client/HistoryScreen';
import ProfileScreen from '../screens/client/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONES = { Accueil: '🏬', Panier: '🛒', Historique: '🧾', Profil: '👤' };

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
        tabBarIcon: () => <Text>{ICONES[route.name]}</Text>,
        tabBarBadge: route.name === 'Panier' && nombreArticles > 0 ? nombreArticles : undefined,
      })}
    >
      <Tab.Screen name="Accueil" component={ClientHomeScreen} />
      <Tab.Screen name="Panier" component={CartScreen} />
      <Tab.Screen name="Historique" component={HistoryScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
