import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import ClientRow from '../../components/clients/ClientRow';
import SearchBar from '../../components/clients/SearchBar';

export default function ClientsListScreen() {
  const navigation = useNavigation();
  const [search, setSearch] = React.useState('');
  const orgId = null; // TODO: get org_id from user/session context

  const { data, isLoading, error, refetch } = useQuery(['clients', orgId], async () => {
    let query = supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });
    if (orgId) query = query.eq('org_id', orgId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  });

  const filtered = search
    ? (data || []).filter((c: any) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.primary_contact.toLowerCase().includes(search.toLowerCase())
      )
    : data || [];

  if (isLoading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" /></View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}><Text>Error loading clients</Text></View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <ClientRow client={item} onPress={() => navigation.navigate('ClientDetails', { clientId: item.id })} />
  );

  return (
    <View style={styles.container}>
      <SearchBar value={search} onChange={setSearch} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={<Text>No clients found</Text>}
      />
      <View style={{ height: 16 }} />
      <View>
        <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
          Showing {filtered.length} of {data?.length || 0} clients
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditClient', { mode: 'add' })}
        >
          <Text style={styles.addButtonText}>Add Client</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { backgroundColor: '#fff', padding: 16, marginBottom: 8, borderRadius: 8 },
  name: { fontWeight: 'bold', fontSize: 16 },
  contact: { color: '#555', marginTop: 4 },
  addButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
});
