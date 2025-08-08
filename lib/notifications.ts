import * as Notifications from 'expo-notifications';
import { supabase } from './supabase';

export async function registerForPushNotificationsAsync(userId: string) {
  // Ask for permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }
  // Get expo push token
  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;
  // Upsert token into user_devices
  const { error } = await supabase
    .from('user_devices')
    .upsert({ user_id: userId, expo_push_token: token }, { onConflict: ['expo_push_token'] });
  if (error) {
    console.error('Error saving push token:', error);
  }
  return token;
}

import { useEffect } from 'react';

export function useRegisterPushToken(session: any) {
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    registerForPushNotificationsAsync(userId).catch(console.error);
  }, [session]);
}
