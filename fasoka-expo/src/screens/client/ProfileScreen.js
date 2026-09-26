import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, deconnexion } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLettre}>{user?.prenom ? user.prenom[0].toUpperCase() : '?'}</Text>
      </View>
      <Text style={styles.nom}>{user ? `${user.prenom} ${user.nom}` : ''}</Text>
      {user?.email && <Text style={styles.email}>{user.email}</Text>}

      <View style={styles.liste}>
        {['Mes favoris', 'Notifications', 'Aide'].map((label) => (
          <View key={label} style={styles.ligneListe}>
            <Text>{label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity onPress={deconnexion} style={{ marginTop: 20 }}>
        <Text style={styles.deconnexion}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.creme, alignItems: 'center', padding: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.or, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLettre: { fontSize: 28, fontWeight: '700', color: COLORS.noir },
  nom: { fontSize: 18, fontWeight: '700' },
  email: { color: COLORS.gris, fontSize: 13, marginBottom: 24 },
  liste: { backgroundColor: 'white', borderRadius: 12, width: '100%', overflow: 'hidden' },
  ligneListe: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  deconnexion: { color: COLORS.rouge, fontWeight: '600', fontSize: 14 },
});
