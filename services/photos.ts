import { supabase } from '../lib/supabase';
import { uploadJobPhoto } from '../lib/uploadPhoto';

export interface Photo {
  id: string;
  job_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  signedUrl?: string;
}

// List photos for a job and attach signed URLs
export async function listPhotosByJob(jobId: string): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('job_photos')
    .select('id, job_id, storage_path, caption, created_at')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  const photos = data as Photo[];
  const signedPhotos = await Promise.all(
    photos.map(async (photo) => {
      const { data: signedData, error: signedError } = await supabase.storage
        .from('job_photos')
        .createSignedUrl(photo.storage_path, 3600);
      if (signedError) throw signedError;
      return { ...photo, signedUrl: signedData.signedUrl };
    })
  );
  return signedPhotos;
}

// Add a new photo to a job using the upload helper
export async function addPhoto(jobId: string, fileUri: string, caption?: string) {
  return await uploadJobPhoto(jobId, fileUri, caption);
}

// Remove a photo: delete from storage and then from DB
export async function removePhoto(photoId: string): Promise<void> {
  // Get the storage path for this photo
  const { data, error } = await supabase
    .from('job_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single();
  if (error) throw error;
  const path = data.storage_path as string;

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from('job_photos')
    .remove([path]);
  if (storageErr) throw storageErr;

  // Delete from database
  const { error: dbErr } = await supabase
    .from('job_photos')
    .delete()
    .eq('id', photoId);
  if (dbErr) throw dbErr;
}
