import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export async function uploadJobPhoto(jobId: string, fileUri: string, caption?: string) {
  const path = `${jobId}/${crypto.randomUUID()}.jpg`;
  const fileData = await fetch(fileUri).then((res) => res.blob());

  const { error: uploadError } = await supabase.storage
    .from('job_photos')
    .upload(path, fileData);
  if (uploadError) throw uploadError;

  // Insert database row
  const { data: insertedRows, error: insertError } = await supabase
    .from('job_photos')
    .insert({ job_id: jobId, storage_path: path, caption })
    .select();
  if (insertError) throw insertError;

  const photoRecord = insertedRows?.[0];

  // Create signed URL
  const { data: signedData, error: signedError } = await supabase.storage
    .from('job_photos')
    .createSignedUrl(path, 3600);
  if (signedError) throw signedError;

  return {
    id: photoRecord.id,
    path,
    signedUrl: signedData.signedUrl,
  };
}
