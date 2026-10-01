import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SpaceProvider, useSpace } from './src/context/SpaceContext';
import { CartProvider } from './src/context/CartContext';
import { ApiClient } from './src/api/apiClient';

import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ShopCreationScreen from './src/screens/boutique/ShopCreationScreen';
import ClientTabs from './src/navigation/ClientTabs';
import BoutiqueTabs from './src/navigation/BoutiqueTabs';
import { COLORS } from './src/theme/colors';

const AuthStack = createNativeStackNavigator();

function EcranAuth() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ headerShown: true, title: 'Créer un compte' }} />
    </AuthStack.Navigator>
  );
}

function RacineApp() {
  const { user } = useAuth();
  const { aUneBoutique, setMaBoutique } = useSpace();
  const [espaceActif, setEspaceActif] = useState('client');

  useEffect(() => {
    if (user && !aUneBoutique) {
      ApiClient.get('/shops/mine')
        .then((boutiques) => {
          if (boutiques && boutiques.length > 0) {
            setMaBoutique(boutiques[0]);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) return <EcranAuth />;

  if (espaceActif === 'creation-boutique') {
    return <ShopCreationScreen onCree={() => setEspaceActif('boutique')} />;
  }

  if (espaceActif === 'boutique' && aUneBoutique) {
    return <BoutiqueTabs onSelectClient={() => setEspaceActif('client')} />;
  }

  return (
    <ClientTabs
      onSelectBoutique={() => setEspaceActif(aUneBoutique ? 'boutique' : 'creation-boutique')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SpaceProvider>
          <CartProvider>
            <NavigationContainer>
              <StatusBar style="light" backgroundColor={COLORS.noir} />
              <RacineApp />
            </NavigationContainer>
          </CartProvider>
        </SpaceProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
