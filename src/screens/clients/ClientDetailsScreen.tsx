import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

export default function ClientDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { clientId } = route.params as { clientId: string };

  const orgId = null; // TODO: get org_id from user/session context
  const { data, isLoading, error } = useQuery(['client', clientId, orgId], async () => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('org_id', orgId)
      .single();
    if (error) throw error;
    return data;
  });

  if (isLoading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" /></View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.center}><Text>Error loading client details</Text></View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{data.name}</Text>
      <Text style={styles.contact}>{data.primary_contact}</Text>
      <Text style={styles.email}>{data.email}</Text>
      <Text style={styles.phone}>{data.phone}</Text>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('AddEditClient', { mode: 'edit', clientId })}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  name: { fontWeight: 'bold', fontSize: 20, marginBottom: 8 },
  contact: { fontSize: 16, marginBottom: 4 },
  email: { fontSize: 16, marginBottom: 4 },
  phone: { fontSize: 16, marginBottom: 16 },
  editButton: { backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
});
