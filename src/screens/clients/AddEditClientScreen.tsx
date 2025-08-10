import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../../lib/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AddEditClientScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { mode, clientId } = route.params as { mode: 'add' | 'edit'; clientId?: string };
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: '',
    primary_contact: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && clientId) {
      setLoading(true);
      supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()
        .then(({ data, error }) => {
          setLoading(false);
          if (error) Alert.alert('Error', 'Failed to load client');
          if (data) setForm({
            name: data.name || '',
            primary_contact: data.primary_contact || '',
            email: data.email || '',
            phone: data.phone || '',
          });
        });
    }
  }, [mode, clientId]);

  const mutation = useMutation(
    async (values: typeof form) => {
      setLoading(true);
      let result;
      const orgId = null; // TODO: get org_id from user/session context
      const userId = null; // TODO: get user_id from session
      if (mode === 'add') {
        result = await supabase
          .from('clients')
          .insert({ ...values, org_id: orgId, user_id: userId })
          .select();
      } else {
        result = await supabase
          .from('clients')
          .update({ ...values })
          .eq('id', clientId)
          .eq('org_id', orgId)
          .select();
      }
      setLoading(false);
      if (result.error) throw result.error;
      return result.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['clients']);
        navigation.goBack();
      },
      onError: (error: any) => {
        Alert.alert('Error', error.message || 'Failed to save client');
      },
    }
  );

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.primary_contact) {
      Alert.alert('Validation', 'Name and primary contact are required');
      return;
    }
    mutation.mutate(form);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{mode === 'add' ? 'Add Client' : 'Edit Client'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name*"
        value={form.name}
        onChangeText={(v) => handleChange('name', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Primary Contact*"
        value={form.primary_contact}
        onChangeText={(v) => handleChange('primary_contact', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        keyboardType="email-address"
        onChangeText={(v) => handleChange('email', v)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={form.phone}
        keyboardType="phone-pad"
        onChangeText={(v) => handleChange('phone', v)}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: 'bold', fontSize: 20, marginBottom: 16 },
  input: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, marginBottom: 12 },
  saveButton: { backgroundColor: '#2563eb', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  saveButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelButton: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  cancelButtonText: { color: '#2563eb', fontWeight: 'bold' },
});
