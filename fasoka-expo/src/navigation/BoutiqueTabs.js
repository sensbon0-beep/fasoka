import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { COLORS } from '../theme/colors';
import { useSpace } from '../context/SpaceContext';
import SpaceSwitcher from '../components/SpaceSwitcher';
import BoutiqueDashboardScreen from '../screens/boutique/BoutiqueDashboardScreen';
import CatalogScreen from '../screens/boutique/CatalogScreen';
import OrdersScreen from '../screens/boutique/OrdersScreen';
import ProductGalleryScreen from '../screens/boutique/ProductGalleryScreen';

const Tab = createBottomTabNavigator();
const CatalogStack = createNativeStackNavigator();

const ICONES = { 'Tableau de bord': '📊', Catalogue: '📦', Commandes: '🕒' };

// Le catalogue a besoin de sa propre pile de navigation pour pouvoir ouvrir la galerie photos
function CatalogStackScreen() {
  return (
    <CatalogStack.Navigator>
      <CatalogStack.Screen name="CatalogueListe" component={CatalogScreen} options={{ headerShown: false }} />
      <CatalogStack.Screen
        name="ProductGallery"
        component={ProductGalleryScreen}
        options={({ route }) => ({ title: `Photos — ${route.params.productNom}`, headerStyle: { backgroundColor: COLORS.noir }, headerTintColor: 'white' })}
      />
    </CatalogStack.Navigator>
  );
}

export default function BoutiqueTabs({ onSelectClient }) {
  const { maBoutique } = useSpace();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.noir },
        headerTintColor: COLORS.or,
        headerTitle: maBoutique?.nom_boutique || 'Ma Boutique',
        headerRight: () => <SpaceSwitcher onSelectClient={onSelectClient} onSelectBoutique={() => {}} />,
        tabBarActiveTintColor: COLORS.rouge,
        tabBarInactiveTintColor: COLORS.gris,
        tabBarIcon: () => <Text>{ICONES[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Tableau de bord" component={BoutiqueDashboardScreen} />
      <Tab.Screen name="Catalogue" component={CatalogStackScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Commandes" component={OrdersScreen} />
    </Tab.Navigator>
  );
}
