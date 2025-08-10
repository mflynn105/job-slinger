import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ClientRow({ client, onPress }: { client: any; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.name}>{client.name}</Text>
      <Text style={styles.contact}>{client.primary_contact}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: { backgroundColor: '#fff', padding: 16, marginBottom: 8, borderRadius: 8 },
  name: { fontWeight: 'bold', fontSize: 16 },
  contact: { color: '#555', marginTop: 4 },
});
