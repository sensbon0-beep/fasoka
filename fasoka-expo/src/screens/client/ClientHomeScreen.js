import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, Image, TouchableOpacity,
  ActivityIndicator, StyleSheet, RefreshControl,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { ApiClient } from '../../api/apiClient';
import { useCart } from '../../context/CartContext';

export default function ClientHomeScreen() {
  const { ajouter } = useCart();
  const [produits, setProduits] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const charger = useCallback(async (texte) => {
    setChargement(true);
    setErreur(null);
    try {
      const data = await ApiClient.get('/products/feed', texte ? { recherche: texte } : undefined);
      setProduits(data);
    } catch (e) {
      setErreur('Impossible de charger les produits.');
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { charger(); }, [charger]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.creme }}>
      <TextInput
        style={styles.recherche}
        placeholder="Rechercher un produit..."
        value={recherche}
        onChangeText={setRecherche}
        onSubmitEditing={() => charger(recherche)}
      />

      {chargement ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={COLORS.or} />
      ) : erreur ? (
        <Text style={styles.message}>{erreur}</Text>
      ) : produits.length === 0 ? (
        <Text style={styles.message}>Aucun produit trouvé.</Text>
      ) : (
        <FlatList
          data={produits}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => charger(recherche)} />}
          renderItem={({ item }) => (
            <View style={styles.carte}>
              <View style={styles.imageZone}>
                {item.images && item.images.length > 0 ? (
                  <Image source={{ uri: item.images[0] }} style={styles.image} />
                ) : (
                  <Text style={{ color: COLORS.gris }}>📦</Text>
                )}
              </View>
              <View style={{ padding: 8 }}>
                <Text numberOfLines={1} style={styles.nomProduit}>{item.nom}</Text>
                {item.nom_boutique && <Text numberOfLines={1} style={styles.nomBoutique}>{item.nom_boutique}</Text>}
                <View style={styles.ligneBas}>
                  <Text style={styles.prix}>{Number(item.prix).toLocaleString('fr-FR')} F</Text>
                  <TouchableOpacity style={styles.boutonAjout} onPress={() => ajouter(item)}>
                    <Text style={{ color: COLORS.noir, fontWeight: '700' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  recherche: { backgroundColor: 'white', margin: 12, padding: 12, borderRadius: 12, fontSize: 14 },
  message: { textAlign: 'center', color: COLORS.gris, marginTop: 40 },
  carte: { flex: 1, backgroundColor: 'white', borderRadius: 14, margin: 6, overflow: 'hidden' },
  imageZone: { height: 90, backgroundColor: COLORS.creme, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  nomProduit: { fontWeight: '600', fontSize: 13 },
  nomBoutique: { fontSize: 11, color: COLORS.gris, marginBottom: 6 },
  ligneBas: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prix: { fontWeight: '700', color: COLORS.rouge, fontSize: 13 },
  boutonAjout: { backgroundColor: COLORS.or, borderRadius: 13, width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
});
