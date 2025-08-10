import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClientsListScreen from '../../src/screens/clients/ClientsListScreen';
import ClientDetailsScreen from '../../src/screens/clients/ClientDetailsScreen';
import AddEditClientScreen from '../../src/screens/clients/AddEditClientScreen';

const Stack = createStackNavigator();

export default function ClientsStack() {
  return (
    <Stack.Navigator initialRouteName="ClientsList">
      <Stack.Screen name="ClientsList" component={ClientsListScreen} options={{ title: 'Clients' }} />
      <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} options={{ title: 'Client Details' }} />
      <Stack.Screen name="AddEditClient" component={AddEditClientScreen} options={{ title: 'Add/Edit Client' }} />
    </Stack.Navigator>
  );
}
