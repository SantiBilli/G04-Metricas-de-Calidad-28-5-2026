import { supabase } from './supabase';
import { UserProfile } from '@/types';

export const authService = {
  /**
   * Inicia sesión con correo y contraseña.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /**
   * Cierra la sesión activa.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Obtiene la sesión actual de Supabase.
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Obtiene el perfil del usuario correspondiente a su ID en public.profiles.
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Ningún perfil encontrado
        return null;
      }
      throw error;
    }
    return data as UserProfile;
  },

  /**
   * Actualiza el perfil del usuario (nombre, apellido y opcionalmente pfp_url)
   */
  async updateProfile(userId: string, data: { name: string; surname: string; pfp_url?: string }): Promise<UserProfile> {
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return updatedProfile as UserProfile;
  },

  /**
   * Sube una foto de perfil al bucket 'avatars' de Supabase Storage.
   * Genera un nombre único y retorna la URL pública del archivo subido.
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    // Extraer extensión del archivo
    const fileExt = file.name.split('.').pop() || 'png';
    // Nombre de archivo único usando timestamp y userId
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Subir el archivo al bucket
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Obtener la URL pública del archivo
    const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);

    return data.publicUrl;
  },
};
