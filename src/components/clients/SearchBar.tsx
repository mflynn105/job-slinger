import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search clients..."
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  input: { backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 },
});
