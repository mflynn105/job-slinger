import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery(['notifications'], async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  });

  const markRead = useMutation(
    async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications']);
      },
    }
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading notifications</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => {
        if (!item.read) {
          markRead.mutate(item.id);
        }
      }}
      style={[styles.item, item.read && styles.readItem]}
    >
      <Text style={styles.title}>{item.type}</Text>
      {item.metadata ? (
        <Text>{typeof item.metadata === 'string' ? item.metadata : JSON.stringify(item.metadata)}</Text>
      ) : null}
      <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No notifications</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  readItem: {
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});
