import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { ./supabase } from './supabase';

export async function generateAndUploadEstimatePdf(
  html: string,
  userId: string,
  estimateId: string
): Promise<string> {
  // Generate a PDF from the provided HTML
  const { uri } = await Print.printToFileAsync({ html });
  // Read the generated file as a base64-encoded string
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  // Convert base64 string to binary buffer
  const binary = Buffer.from(base64, 'base64');
  // Define the storage key in the private estimates bucket
  const key = `estimates/${userId}/${estimateId}.pdf`;
  // Upload the PDF to Supabase Storage with upsert enabled
  const { error: uploadError } = await supabase.storage
    .from('estimates')
    .upload(key, binary, {
      contentType: 'application/pdf',
      upsert: true,
    });
  if (uploadError) {
    throw uploadError;
  }
  // Create a signed URL to retrieve the uploaded PDF
  const { data, error } = await supabase.storage
    .from('estimates')
    .createSignedUrl(key, 60 * 60); // 1 hour expiration
  if (error || !data) {
    throw error ?? new Error('Failed to create signed URL');
  }
  return data.signedUrl;
}
