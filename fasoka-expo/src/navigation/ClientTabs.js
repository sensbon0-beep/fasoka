import React from 'react';
import { View, Text, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
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

// Couleur de fond de la barre supérieure
const COULEUR_BARRE = COLORS.blanc;

// Noms de base des icônes Ionicons (l'onglet Profil affiche la photo du client, voir IconesOnglets.js)
const ICONES = { Accueil: 'storefront', Panier: 'cart', Historique: 'receipt' };

// ---------- Logo FASOKA ----------
// Le projet ne contient pas encore de fichier logo dans un dossier assets : le logo officiel
// (monogramme F doré + pastille rouge, fichier fasoka-logomark.svg) est donc redessiné ici avec ses
// proportions exactes. Pour utiliser un fichier image à la place, ajouter-le dans fasoka-expo/assets/
// (ex : logo.png) et remplacer null ci-dessous par : require('../../assets/logo.png')
const LOGO_IMAGE = require('../../assets/logo.png')

// Dimensions et formes du logo officiel, en unités du fichier SVG d'origine
const LOGO_LARGEUR = 247;
const LOGO_HAUTEUR = 237;
const FORMES_F = [
  { gauche: 0, haut: 15, largeur: 58, hauteur: 222, rayon: 16 }, // montant vertical
  { gauche: 0, haut: 15, largeur: 176, hauteur: 58, rayon: 16 }, // barre du haut
  { gauche: 0, haut: 127, largeur: 136, hauteur: 54, rayon: 15 }, // barre du milieu
];
const PASTILLE = { gauche: 161, haut: 0, diametre: 86, bordure: 10 }; // pastille rouge cerclée de noir

// `couleurFond` : couleur du liseré autour de la pastille rouge (doit être celle du fond sur lequel le logo est posé)
function LogoFasoka({ hauteur = 30, couleurFond = COLORS.noir }) {
  if (LOGO_IMAGE) {
    return (
      <Image
        source={LOGO_IMAGE}
        style={{ height: hauteur, width: hauteur * (LOGO_LARGEUR / LOGO_HAUTEUR) }}
        resizeMode="contain"
      />
    );
  }

  const u = hauteur / LOGO_HAUTEUR; // échelle : unités SVG → pixels
  return (
    <View style={{ width: LOGO_LARGEUR * u, height: hauteur }}>
      {FORMES_F.map((forme, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: forme.gauche * u,
            top: forme.haut * u,
            width: forme.largeur * u,
            height: forme.hauteur * u,
            borderRadius: forme.rayon * u,
            backgroundColor: COLORS.or,
          }}
        />
      ))}
      <View
        style={{
          position: 'absolute',
          left: PASTILLE.gauche * u,
          top: PASTILLE.haut * u,
          width: PASTILLE.diametre * u,
          height: PASTILLE.diametre * u,
          borderRadius: (PASTILLE.diametre * u) / 2,
          borderWidth: PASTILLE.bordure * u,
          borderColor: couleurFond,
          backgroundColor: COLORS.rouge,
        }}
      />
    </View>
  );
}

// Titre de la barre supérieure : logo + nom de l'application
function TitreMarque() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }} accessibilityRole="header" accessibilityLabel="FASOKA">
      <LogoFasoka hauteur={28} couleurFond={COULEUR_BARRE} />
      <Text numberOfLines={1} style={{ color: COLORS.noir, fontSize: 19, fontWeight: '900', letterSpacing: 2, marginLeft: 10 }}>
        FASOKA
      </Text>
    </View>
  );
}

export default function ClientTabs({ onSelectBoutique }) {
  const { nombreArticles } = useCart();

  return (
    <>
    {/* Barre blanche : icônes de la barre d'état en sombre (retour automatique au style global en quittant l'espace client) */}
    <StatusBar style="dark" />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COULEUR_BARRE },
        headerTintColor: COLORS.noir,
        headerTitle: () => <TitreMarque />,
        headerTitleAlign: 'left',
        headerRight: () => (
          <SpaceSwitcher couleur={COLORS.noir} onSelectClient={() => {}} onSelectBoutique={onSelectBoutique} />
        ),
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
    </>
  );
}
